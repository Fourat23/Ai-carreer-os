// Modèle canonique de PREUVE (V65 · contrat docs/V65-COMPETENCY-EVIDENCE-CONTRACT.md).
// PUR : aucune I/O, aucun DOM, aucune horloge propre — l'horloge est injectée.
//
// Le CP0 a établi qu'une preuve n'avait aucune identité métier hors de la
// journée qui l'avait produite : pas d'identifiant global, pas de provenance
// structurée, pas de validation attachée, et impossible à requêter autrement
// qu'en re-balayant `progress.days`. Ce module donne à la preuve une existence
// propre, datée, tracée et validée.
//
// Règle centrale : une preuve QUALIFIANTE porte une validation `passed` produite
// par un validateur DÉTERMINISTE du produit. Une déclaration de l'apprenant
// n'est pas une démonstration.

import { programSkills } from './skill-taxonomy.mjs';

export const EVIDENCE_SCHEMA = 1;

/** Types de source — dérivés du produit réel, aucun inventé (contrat §2). */
export const EVIDENCE_SOURCE_TYPES = [
  'exercise',   // /lab/[id]        → runExercise, allPassed
  'assessment', // /diagnostics     → gradeAssessment, passedOverall
  'mission',    // /missions/[id]   → computeMissionStatus === 'done'
  'capstone',   // capstones        → statut existant
  'submission', // session V64      → jamais auto-validée
  'declared',   // DayEvidence      → déclaration de l'apprenant
  'review',     // /revisions       → réentraînement, pas démonstration
];

/**
 * Seuls ces types PEUVENT être qualifiants — et seulement avec une validation
 * `passed`. Les seuils sont ceux qui existaient déjà (allPassed, passThreshold
 * 0,7, statut `done`) : V65 n'en invente aucun.
 */
export const QUALIFYING_SOURCE_TYPES = new Set(['exercise', 'assessment', 'mission', 'capstone']);

export const VALIDATION_STATUSES = ['passed', 'failed', 'pending', 'manual'];
export const VALIDATION_KINDS = ['exercise-tests', 'assessment-grade', 'mission-deliverables', 'capstone-review', 'self'];

const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor']);
const MAX_ID = 120;
const MAX_TEXT = 500;
const MAX_COMPETENCIES = 20;
const MAX_EVIDENCE = 5000;

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const iso = (v) => (typeof v === 'string' && !Number.isNaN(new Date(v).getTime()) ? v : null);
const txt = (v, max = MAX_TEXT) => (typeof v === 'string' ? v.slice(0, max) : '');
const fail = (code, error) => ({ ok: false, code, error });

/** Identifiant sûr : non vide, borné, jamais un mot dangereux ni un chemin. */
export function safeId(v, max = MAX_ID) {
  if (typeof v !== 'string') return null;
  const t = v.trim().slice(0, max);
  if (!t || DANGEROUS.has(t)) return null;
  if (/[/\\]/.test(t) || t.includes('..')) return null;
  return t;
}

function normalizeValidation(v) {
  if (!isObj(v)) return null;
  const score = isObj(v.score) && Number.isFinite(Number(v.score.total))
    ? { passed: Math.max(0, Math.trunc(Number(v.score.passed) || 0)), total: Math.max(0, Math.trunc(Number(v.score.total))) }
    : null;
  return {
    status: VALIDATION_STATUSES.includes(v.status) ? v.status : 'pending',
    kind: VALIDATION_KINDS.includes(v.kind) ? v.kind : 'self',
    checkedAt: iso(v.checkedAt),
    detail: txt(v.detail),
    score,
  };
}

/**
 * Une preuve est QUALIFIANTE si et seulement si son type PEUT l'être ET qu'elle
 * porte une validation `passed`. C'est la règle unique du produit — aucune
 * exception par appelant.
 */
export function isQualifying(evidence) {
  if (!isObj(evidence)) return false;
  if (!QUALIFYING_SOURCE_TYPES.has(evidence.sourceType)) return false;
  return evidence.validation?.status === 'passed';
}

/**
 * Clé métier de déduplication (contrat §9). Deux preuves partageant cette clé
 * sont le MÊME fait : rejouer la commande n'en crée pas une seconde.
 */
export function evidenceKey(evidence) {
  if (!isObj(evidence)) return '';
  const comps = [...(evidence.competencyIds ?? [])].sort().join('+');
  return `${evidence.sourceType}:${evidence.sourceId}:${comps}:${isQualifying(evidence) ? 'q' : 'n'}`;
}

/** Identifiant déterministe : la même source produit toujours le même id. */
export function deterministicId(sourceType, sourceId, qualifying = true) {
  // V65.1 — l'identifiant porte le MÊME discriminant que la clé métier.
  //
  // Sans lui, une tentative ratée puis réussie sur le même exercice produisait
  // deux preuves de même `id` : la garde `DUPLICATE_ID` de `appendEvidence`
  // rejetait la SECONDE, c'est-à-dire la réussite. Le ledger ne gardait que
  // l'échec, la compétence n'était pas créditée, et la commande répondait
  // pourtant « ok » — une perte de donnée silencieuse.
  //
  // Mesuré sur la fixture V65.1 : journée 7, `linux-path-traversal-x` échoué
  // puis validé, une seule preuve au ledger, celle de l'échec.
  //
  // Deux gardes protégeaient le même invariant en se contredisant : la clé
  // métier distinguait `q` de `n`, l'identifiant non. Elles disent désormais
  // la même chose.
  return qualifying ? `ev-${sourceType}-${sourceId}` : `ev-${sourceType}-${sourceId}-n`;
}

/**
 * Construit une preuve canonique VALIDÉE, ou explique le refus.
 * L'horloge est injectée : `createdAt` est TOUJOURS l'heure serveur, jamais une
 * valeur transmise par un client (contrat §7).
 *
 * @returns {{ok:true, evidence:object} | {ok:false, code:string, error:string}}
 */
export function makeEvidence(input, { now } = {}) {
  if (!isObj(input)) return fail('INVALID_INPUT', 'Preuve invalide.');

  const sourceType = input.sourceType;
  if (!EVIDENCE_SOURCE_TYPES.includes(sourceType)) {
    return fail('INVALID_SOURCE_TYPE', `Type de source inconnu : ${String(sourceType).slice(0, 40)}.`);
  }
  const sourceId = safeId(input.sourceId);
  if (!sourceId) return fail('INVALID_SOURCE_ID', 'Identifiant de source invalide.');

  const createdAt = iso(now);
  if (!createdAt) return fail('INVALID_CLOCK', 'Horloge serveur invalide.');

  // Compétences : traduites vers le PROGRAMME et validées. Un identifiant sans
  // correspondance n'est jamais stocké — et une preuve qui n'en crédite aucune
  // est refusée plutôt que gardée sans signification (contrat §8).
  const competencyIds = programSkills(input.competencyIds ?? []).slice(0, MAX_COMPETENCIES);
  if (competencyIds.length === 0) {
    return fail('UNKNOWN_COMPETENCY', 'Aucune compétence de programme reconnue pour cette preuve.');
  }

  const provenance = isObj(input.provenance) ? input.provenance : null;
  if (!provenance || !safeId(provenance.producer, 60)) {
    return fail('MISSING_PROVENANCE', 'Une preuve doit dire comment elle est née.');
  }

  const validation = normalizeValidation(input.validation);

  // Un type qualifiant SANS validation réussie n'est pas une erreur : c'est une
  // preuve non qualifiante. Mais un type NON qualifiant portant `passed` est une
  // incohérence — on refuse plutôt que de laisser croire à une démonstration.
  if (!QUALIFYING_SOURCE_TYPES.has(sourceType) && validation?.status === 'passed') {
    return fail('UNQUALIFIABLE_SOURCE', `Une preuve « ${sourceType} » ne peut pas porter une validation réussie.`);
  }

  const qualifies = QUALIFYING_SOURCE_TYPES.has(sourceType) && validation?.status === 'passed';
  const evidence = {
    id: safeId(input.id) ?? deterministicId(sourceType, sourceId, qualifies),
    sourceType,
    sourceId,
    competencyIds,
    createdAt,
    validation,
    provenance: {
      producer: safeId(provenance.producer, 60),
      method: txt(provenance.method, 80),
      note: txt(provenance.note, 300),
    },
    title: txt(input.title, 300),
    // Champs présents SEULEMENT lorsque le fait est réel. On ne fabrique jamais
    // un dayId pour remplir un champ (contrat §7).
    dayId: Number.isInteger(input.dayId) && input.dayId >= 1 && input.dayId <= 365 ? input.dayId : null,
    sessionId: safeId(input.sessionId) ?? null,
    submissionId: safeId(input.submissionId) ?? null,
    assessmentId: safeId(input.assessmentId) ?? null,
    attemptNumber: Number.isInteger(input.attemptNumber) && input.attemptNumber > 0 ? input.attemptNumber : null,
    artifactRef: typeof input.artifactRef === 'string' ? safeUrlish(input.artifactRef) : null,
  };

  return { ok: true, evidence };
}

/** Neutralise une référence d'artefact (jamais de schéma exécutable). */
export function safeUrlish(u) {
  const t = String(u ?? '').trim();
  if (!t) return null;
  if (/^(https?:|mailto:)/i.test(t)) return t.slice(0, 2000);
  if (/^[a-z0-9]+:/i.test(t)) return null; // javascript:, data:, file:…
  return t.slice(0, 2000);
}

/** Normalise une preuve relue du disque (défensif, borné, sans horloge). */
export function normalizeEvidenceRecord(raw) {
  if (!isObj(raw)) return null;
  const sourceType = EVIDENCE_SOURCE_TYPES.includes(raw.sourceType) ? raw.sourceType : null;
  const sourceId = safeId(raw.sourceId);
  const id = safeId(raw.id);
  const createdAt = iso(raw.createdAt);
  if (!sourceType || !sourceId || !id || !createdAt) return null;

  const competencyIds = programSkills(raw.competencyIds ?? []).slice(0, MAX_COMPETENCIES);
  if (competencyIds.length === 0) return null;

  const p = isObj(raw.provenance) ? raw.provenance : {};
  const producer = safeId(p.producer, 60);
  if (!producer) return null;

  const validation = normalizeValidation(raw.validation);
  return {
    id, sourceType, sourceId, competencyIds, createdAt,
    validation: (!QUALIFYING_SOURCE_TYPES.has(sourceType) && validation?.status === 'passed')
      ? { ...validation, status: 'manual' } // incohérence héritée : neutralisée, jamais promue
      : validation,
    provenance: { producer, method: txt(p.method, 80), note: txt(p.note, 300) },
    title: txt(raw.title, 300),
    dayId: Number.isInteger(raw.dayId) && raw.dayId >= 1 && raw.dayId <= 365 ? raw.dayId : null,
    sessionId: safeId(raw.sessionId) ?? null,
    submissionId: safeId(raw.submissionId) ?? null,
    assessmentId: safeId(raw.assessmentId) ?? null,
    attemptNumber: Number.isInteger(raw.attemptNumber) && raw.attemptNumber > 0 ? raw.attemptNumber : null,
    artifactRef: raw.artifactRef ? safeUrlish(raw.artifactRef) : null,
  };
}

/**
 * Ajoute une preuve à un registre, DÉDUPLIQUÉE par clé métier.
 * @returns {{evidence: object[], added: boolean, reason?: string}}
 */
export function appendEvidence(list, evidence) {
  const current = Array.isArray(list) ? list : [];
  if (!isObj(evidence)) return { evidence: current, added: false, reason: 'INVALID' };
  const key = evidenceKey(evidence);
  if (current.some((e) => evidenceKey(e) === key)) {
    return { evidence: current, added: false, reason: 'DUPLICATE' };
  }
  if (current.some((e) => e.id === evidence.id)) {
    return { evidence: current, added: false, reason: 'DUPLICATE_ID' };
  }
  if (current.length >= MAX_EVIDENCE) {
    return { evidence: current, added: false, reason: 'LIMIT' };
  }
  return { evidence: [...current, evidence], added: true };
}

/** Registre normalisé et dédupliqué (relecture disque). */
export function normalizeLedger(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seenKey = new Set();
  const seenId = new Set();
  for (const r of raw.slice(0, MAX_EVIDENCE)) {
    const e = normalizeEvidenceRecord(r);
    if (!e) continue;
    const k = evidenceKey(e);
    if (seenKey.has(k) || seenId.has(e.id)) continue;
    seenKey.add(k); seenId.add(e.id);
    out.push(e);
  }
  // Ordre stable et déterministe : par date, puis par identifiant.
  return out.sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

// ── Migration des preuves héritées (V6 → V65) ─────────────────────────────
// DÉTERMINISTE : aucune horloge, aucun aléa. Les preuves vivaient dans
// `days[N].evidence[]` avec une provenance encodée dans une convention d'URL
// (`/lab/<id>`, `/missions/<id>`) et un préfixe d'identifiant. On lit ces deux
// conventions pour reconstruire une provenance explicite — sans rien inventer :
// ce qui n'est pas déductible reste `legacy` / `unknown`.

/** Déduit (sourceType, sourceId) d'une preuve héritée. Jamais de supposition. */
export function classifyLegacyEvidence(e) {
  const url = typeof e?.url === 'string' ? e.url : '';
  const id = typeof e?.id === 'string' ? e.id : '';
  let m;
  if ((m = url.match(/^\/lab\/(.+)$/)) || (m = id.match(/^lab-(.+)$/))) {
    return { sourceType: 'exercise', sourceId: m[1], qualifying: true };
  }
  if ((m = url.match(/^\/missions\/(.+)$/)) || (m = id.match(/^mission-(.+)$/))) {
    return { sourceType: 'mission', sourceId: m[1], qualifying: true };
  }
  if ((m = id.match(/^diag-(.+)$/))) {
    return { sourceType: 'assessment', sourceId: m[1], qualifying: true };
  }
  if ((m = id.match(/^sub-ev-(.+)$/))) {
    return { sourceType: 'submission', sourceId: m[1], qualifying: false };
  }
  if (e?.type === 'capstone') {
    return { sourceType: 'capstone', sourceId: id || 'legacy', qualifying: true };
  }
  // Tout le reste est une DÉCLARATION de l'apprenant : conservée, jamais
  // promue en démonstration.
  return { sourceType: 'declared', sourceId: id || 'legacy', qualifying: false };
}

/**
 * Convertit les preuves héritées de `days` en registre canonique.
 * Idempotent et sans perte : une preuve héritée présente dans N journées liées
 * devient UNE preuve canonique (elle était le même fait, dupliqué par le stockage).
 */
export function migrateLegacyEvidence(days) {
  if (!isObj(days)) return [];
  let out = [];
  const keys = Object.keys(days).filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
  for (const k of keys) {
    for (const raw of days[k]?.evidence ?? []) {
      if (!isObj(raw)) continue;
      const cls = classifyLegacyEvidence(raw);
      const competencyIds = programSkills(raw.skills ?? []);
      if (competencyIds.length === 0) continue; // aucune compétence reconnaissable
      const createdAt = iso(raw.createdAt);
      if (!createdAt) continue; // sans date, ce n'est pas un fait
      const candidate = {
        id: deterministicId(cls.sourceType, safeId(cls.sourceId) ?? 'legacy'),
        sourceType: cls.sourceType,
        sourceId: safeId(cls.sourceId) ?? 'legacy',
        competencyIds,
        createdAt,
        validation: cls.qualifying
          ? { status: 'passed', kind: legacyKind(cls.sourceType), checkedAt: createdAt, detail: txt(raw.description), score: null }
          : null,
        provenance: { producer: 'legacy-migration', method: cls.sourceType, note: 'Preuve antérieure à V65, reclassée sans perte.' },
        title: txt(raw.title, 300),
        dayId: Number(k),
        sessionId: null, submissionId: null, assessmentId: null,
        attemptNumber: null,
        artifactRef: raw.url ? safeUrlish(raw.url) : null,
      };
      out = appendEvidence(out, candidate).evidence;
    }
  }
  return normalizeLedger(out);
}

function legacyKind(sourceType) {
  return sourceType === 'exercise' ? 'exercise-tests'
    : sourceType === 'assessment' ? 'assessment-grade'
    : sourceType === 'mission' ? 'mission-deliverables'
    : sourceType === 'capstone' ? 'capstone-review'
    : 'self';
}
