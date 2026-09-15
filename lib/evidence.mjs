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
  // V74 · CP11 — `gradeTransferChallenge` rend un verdict OBJECTIF (seuil 0,7,
  // réponses comparées à un attendu), au même titre qu'un diagnostic. Sans ce
  // type, une réussite à un défi T4/T5 ne pouvait être ENREGISTRÉE nulle part :
  // le moteur de rétention était donc structurellement incapable d'observer un
  // transfert, et son compteur ne pouvait valoir que zéro à jamais.
  'transfer-challenge', // /transfer/[id] → gradeTransferChallenge, passedOverall
];

/**
 * Seuls ces types PEUVENT être qualifiants — et seulement avec une validation
 * `passed`. Les seuils sont ceux qui existaient déjà (allPassed, passThreshold
 * 0,7, statut `done`) : V65 n'en invente aucun.
 */
/**
 * V75 · CP3 — D4 : une preuve peut porter des CONCEPTS, au pluriel.
 *
 * Le CP0 a mesuré que `evidence[]` travaille au grain des 20 compétences et
 * **jamais** au grain des 128 concepts. Conséquence directe, relevée par V74 :
 * le candidat « evidence-aware » du CP9 était structurellement aveugle.
 *
 * Le champ est une LISTE, et c'est la décision du checkpoint. Le CP0 a mesuré
 * **67 exercices multi-concepts PAR CONCEPTION** : forcer un concept unique
 * obligerait à en choisir un arbitrairement, c'est-à-dire à fabriquer de la
 * donnée — exactement ce que V74 a refusé pour l'option C. Un champ singulier
 * aurait rendu la dette invisible au lieu de la représenter.
 */
export const MAX_CONCEPTS = 12;

/**
 * Validation de FORME d'un identifiant de concept — pas d'appartenance.
 *
 * Ce module est PUR : il ne lit ni `data/program.json`, ni le catalogue des
 * 128 leçons. Deux options s'offraient donc, et la troisième a été retenue :
 *
 *   · énumérer les 128 slugs ici — refusé : c'est exactement « énumérer plutôt
 *     que dériver », et la liste dériverait du corpus au premier renommage ;
 *   · rendre le module impur pour aller lire le catalogue — refusé : la pureté
 *     de `evidence.mjs` est un invariant de V65 ;
 *   · **valider la forme ici, et l'appartenance au catalogue côté serveur.**
 *
 * C'est donc un contrat en deux temps, et il est écrit pour qu'on ne l'oublie
 * pas : un identifiant mal formé est rejeté ici ; un identifiant bien formé
 * mais inconnu du corpus est rejeté par `lib/evidence-concepts-server.ts`. La
 * porte `v75:check` vérifie que le second maillon existe.
 */
export function programConcepts(ids) {
  const out = [];
  for (const raw of Array.isArray(ids) ? ids : []) {
    const t = safeId(raw, 120);
    // Forme d'un slug de leçon : minuscules, chiffres, tirets. Rien d'autre.
    if (!t || !/^[a-z0-9][a-z0-9-]*$/.test(t)) continue;
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

export const QUALIFYING_SOURCE_TYPES = new Set([
  'exercise', 'assessment', 'mission', 'capstone',
  // V74 · CP11 — qualifiant pour la même raison que `assessment` : le seuil
  // (0,7) préexiste dans `lib/transfer-challenge.mjs`, V74 n'en invente aucun.
  'transfer-challenge',
]);

/**
 * ── V77 · CP5 — LE NIVEAU D'UNE PREUVE ──────────────────────────────────
 *
 * Le contrat gelé au CP1 pose trois niveaux, `DECLARED < OBSERVED < VALIDATED`,
 * et **seul `VALIDATED` compte dans les moteurs**. Jusqu'ici le produit n'avait
 * que deux états, « qualifiante » ou non, ce qui écrasait deux questions
 * différentes en une :
 *
 *   · *qu'a-t-on observé ?* — un test exécuté, une structure conforme, un clic ;
 *   · *cela suffit-il à créditer une compétence ?*
 *
 * ── LE PLAFOND PAR SOURCE ──
 *
 * Certaines sources ne peuvent pas, par construction, atteindre `VALIDATED` —
 * quelle que soit la bonne volonté de l'appelant. Une mission en est
 * l'exemple mesuré : le CP0 a établi que ses 42 exemplaires terminent sur un
 * livrable de revue **auto-validé par un clic**, et qu'un document décrivant une
 * conception délibérément mauvaise obtient `structure ok: true`. La validation
 * de FORME ne peut pas atteindre la JUSTESSE.
 *
 * Règle du MAILLON FAIBLE (contrat §2) : *le niveau d'une preuve composite est
 * celui de sa composante la plus faible.* `STRUCTURE_VALID + SELF_CONFIRMATION`
 * vaut donc sa composante la plus faible — une déclaration.
 */
export const NIVEAUX_DE_PREUVE = Object.freeze(['DECLARED', 'OBSERVED', 'VALIDATED']);

/**
 * Plafond de niveau par type de source. Ce qui n'y figure pas plafonne à
 * `DECLARED` : le défaut est le plus modeste, jamais le plus flatteur.
 */
export const NIVEAU_MAX_PAR_SOURCE = Object.freeze({
  exercise: 'VALIDATED',            // tests exécutés en bac à sable
  assessment: 'VALIDATED',          // correction serveur contre un corrigé
  'transfer-challenge': 'VALIDATED',// idem, seuil déclaré d'avance
  capstone: 'VALIDATED',            // correction serveur multi-phases (cf. CP6)
  mission: 'OBSERVED',              // structure + clic : jamais VALIDATED
  submission: 'OBSERVED',
  review: 'OBSERVED',
  declared: 'DECLARED',
});

/**
 * Niveau DÉRIVÉ d'une preuve — jamais reçu de l'appelant.
 *
 * Trois questions dans l'ordre, et la plus sévère gagne :
 *   1. la validation a-t-elle réellement réussi ? sinon, on n'observe qu'un fait ;
 *   2. par quel MOYEN ? une auto-déclaration reste `DECLARED` même réussie ;
 *   3. la source autorise-t-elle ce niveau ? sinon on plafonne.
 *
 * Le CP9 publiera la matrice complète `sourceType × kind × niveau` et la
 * gèlera ; cette fonction en est la première pierre, posée là où le CP5 en a
 * besoin pour ne pas mentir sur les missions.
 */
export const NIVEAU_MAX_PAR_KIND = Object.freeze({
  'exercise-tests': 'VALIDATED',       // des tests ont tourné en bac à sable
  'assessment-grade': 'VALIDATED',     // correction serveur contre un corrigé
  'capstone-grade': 'VALIDATED',       // idem, multi-phases (V77 · CP6)
  // ── V77 · CP6 — `capstone-review` N'EST PAS REMONTÉ ──
  //
  // Les preuves portant ce genre viennent de la migration héritée, qui n'a
  // JAMAIS rejoué la correction : elle a reclassé une preuve d'avant V65 sur la
  // foi de son identifiant. On ne peut donc pas affirmer qu'une correction a eu
  // lieu, et le plafond dit exactement cela (dette `D5`). Les remonter avec
  // `capstone-grade` serait reconstruire un fait historique absent — interdit.
  'capstone-review': 'OBSERVED',
  // ── V77 · CP9 — LA TENSION DU CP5, TRANCHÉE PAR LA MESURE ──
  //
  // Le CP5 avait laissé deux phrases coexister : le contrat plafonne la mission
  // à `OBSERVED`, tandis que la règle du maillon faible, appliquée à ses
  // livrables, donne `DECLARED`. Elles portaient sur deux objets différents, et
  // aucune n'avait de conséquence opérationnelle — les deux sont non
  // qualifiantes. Mais ce sont deux phrases différentes sur le même objet, et
  // c'est précisément ce que V77 existe pour retirer.
  //
  // La résolution tient dans la nature de `NIVEAU_MAX_PAR_SOURCE` : c'est un
  // **PLAFOND**, pas une assignation. `mission → OBSERVED` dit « pas plus
  // qu'observé » ; il n'interdit pas d'être en dessous.
  //
  // Et la mesure tranche : **42 missions sur 42** portent un livrable de revue
  // REQUIS que l'apprenant signe lui-même. `mission-deliverables` inclut donc
  // TOUJOURS une auto-confirmation, et son maillon faible est `DECLARED` — pas
  // par principe, mais parce que le corpus est ainsi.
  //
  // Un test re-mesure les 42 et rougit si une mission sans revue requise
  // apparaît : le plafond serait alors trop sévère, et il faudrait le rouvrir
  // plutôt que le subir.
  'mission-deliverables': 'DECLARED',
  // Une DÉCLARATION de l'apprenant, même quand elle dit « réussi ».
  self: 'DECLARED',
});

export function niveauDePreuve(sourceType, validation) {
  const rang = (n) => NIVEAUX_DE_PREUVE.indexOf(n);
  const plafondSource = NIVEAU_MAX_PAR_SOURCE[sourceType] ?? 'DECLARED';
  const statut = validation?.status ?? null;
  const kind = validation?.kind ?? null;
  const plafondKind = NIVEAU_MAX_PAR_KIND[kind] ?? 'DECLARED';

  // Une validation qui n'a pas abouti n'a rien démontré : elle a été observée.
  let brut = 'OBSERVED';
  if (statut === 'passed') brut = 'VALIDATED';
  else if (statut === null) brut = 'DECLARED';

  // DEUX plafonds, et le plus sévère gagne. Le premier dit ce que la SOURCE
  // permet d'observer, le second ce que le MOYEN permet d'affirmer. Un même
  // capstone vaut `VALIDATED` corrigé par le serveur et `OBSERVED` reclassé par
  // une migration : c'est le moyen qui diffère, pas la source.
  const plafond = rang(plafondSource) <= rang(plafondKind) ? plafondSource : plafondKind;
  return rang(brut) <= rang(plafond) ? brut : plafond;
}

export const VALIDATION_STATUSES = ['passed', 'failed', 'pending', 'manual'];
/**
 * ── V77 · CP6 — `capstone-grade` REJOINT LE VOCABULAIRE ──────────────────
 *
 * Ce n'est pas un surclassement : c'est la réparation d'un accident. Le genre
 * manquait, `normalizeValidation` retombait sur `self`, et une correction
 * SERVEUR déterministe — contre un corrigé déclaré d'avance, en sept phases —
 * était archivée comme une **auto-déclaration de l'apprenant**.
 *
 * Mesuré sur les 13 capstones avant correction :
 *
 *   genre archivé : 13 × `self` · niveau : 13 × `DECLARED`
 *   compétence projetée : 13 × `demonstrated`
 *
 * Les deux dernières lignes se contredisent. `isQualifying` ne regarde que le
 * type de source et le statut ; le produit disait donc *« déclaration »* dans
 * le genre et créditait *« démonstration »* dans la compétence. **Deux phrases
 * opposées sur le même objet.**
 *
 * `capstone-review` reste dans la liste et n'est PAS remonté : les preuves
 * héritées ont été produites par une migration qui n'a jamais rejoué la
 * correction. On ne peut pas affirmer qu'elle a eu lieu (dette `D5`).
 */
export const VALIDATION_KINDS = [
  'exercise-tests', 'assessment-grade', 'mission-deliverables',
  'capstone-grade', 'capstone-review', 'self',
];

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
  if (evidence.validation?.status !== 'passed') return false;
  // ── V77 · CP9 — LA TROISIÈME CONDITION ──
  //
  // Le CP6 avait mesuré et laissé ouverte la contradiction la plus gênante du
  // produit : une preuve annoncée `self` — une auto-déclaration — créditait une
  // compétence comme `demonstrated`, parce que cette fonction ne regardait ni le
  // genre ni le niveau. Deux phrases opposées sur le même objet.
  //
  // Le contrat gelé (CP1 §2) ne laisse pas le choix : *seul `VALIDATED` compte*
  // pour la compétence, la rétention et la récupération. C'est délibérément
  // sévère, et le contrat dit pourquoi : **sous-déclarer une maîtrise est moins
  // grave que la sur-déclarer.**
  return niveauDePreuve(evidence.sourceType, evidence.validation) === 'VALIDATED';
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

  // ── V75 · CP3 — les concepts, ADDITIFS ──
  //
  // Rien n'est OBLIGATOIRE ici, et c'est volontaire : une preuve dont le
  // concept est inconnu reste une preuve valide. Le CP0 a mesuré que 137
  // exercices sur 376 sont réellement ambigus ; exiger un concept les rendrait
  // tous irrecevables, ou pousserait à en inventer un.
  //
  // Un identifiant de concept inconnu du programme n'est PAS stocké — même
  // règle que pour les compétences : on ne garde pas un pointeur qui ne
  // désigne rien.
  const conceptIds = programConcepts(input.conceptIds ?? []).slice(0, MAX_CONCEPTS);

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
    // Liste, éventuellement vide. Vide signifie « concept inconnu », jamais
    // « aucun concept concerné » — la nuance est celle du G9 de V74.
    conceptIds,
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
    // V77 · CP5 — DÉRIVÉ, jamais reçu. Un appelant ne peut pas se décerner un
    // niveau : `input.evidenceLevel` est ignoré, et c'est le point.
    evidenceLevel: niveauDePreuve(sourceType, validation),
    /**
     * ── V77 · CP10 — D'OÙ CETTE PREUVE DÉRIVE ──
     *
     * Le CP0 avait mesuré le défaut `D1` : un exercice résolu valide
     * automatiquement un livrable de mission, et les deux preuves portaient la
     * même compétence canonique. **Une production, deux crédits.**
     *
     * Le CP10 a remesuré : **42 paires structurelles, 14 qui chevauchent une
     * compétence, 0 double comptage effectif** — parce que le CP5 et le CP9 ont
     * rendu la preuve de mission non qualifiante. Le défaut est clos par
     * conséquence, pas par une règle dédiée.
     *
     * La DÉPENDANCE, elle, reste réelle : la mission a été terminée en partie
     * grâce à un exercice déjà compté ailleurs. `derivedFrom` l'écrit, pour que
     * personne n'ait à la redécouvrir — et pour qu'une future règle de
     * déduplication ait de quoi travailler sans deviner.
     *
     * Ce champ n'entre PAS dans la clé métier : il décrit une filiation, il ne
     * change pas l'identité de la preuve.
     */
    derivedFrom: Array.isArray(input.derivedFrom)
      ? [...new Set(input.derivedFrom.filter((d) => typeof d === 'string' && d.trim()).map((d) => d.trim().slice(0, 160)))].slice(0, 20)
      : [],
    // ── V77 · CP6 — LA SIMULATION EST UN CHAMP ──
    //
    // Le CP0 a mesuré la dette `D9` : la marque de simulation vivait dans du
    // texte libre (`detail`), c'est-à-dire nulle part pour un lecteur futur.
    // Booléen, elle survit à la sérialisation et se teste.
    //
    // Elle ne DÉGRADE aucun niveau : un capstone corrigé par le serveur vaut
    // `VALIDATED` **et** `simulation: true`. Le contrat gelé l'exige — réussir
    // une simulation professionnelle est un indice fort, ce n'est pas une
    // expérience réelle, et les deux faits tiennent ensemble.
    simulation: input.simulation === true,
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

  // V75 · CP3 — une preuve écrite AVANT ce contrat n'a pas de `conceptIds` :
  // elle en reçoit une liste vide et reste parfaitement valide. Aucune
  // migration destructive (règle du CP2).
  const conceptIds = programConcepts(raw.conceptIds ?? []).slice(0, MAX_CONCEPTS);

  const p = isObj(raw.provenance) ? raw.provenance : {};
  const producer = safeId(p.producer, 60);
  if (!producer) return null;

  const validation = normalizeValidation(raw.validation);
  return {
    id, sourceType, sourceId, competencyIds, conceptIds, createdAt,
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
    // V77 · CP10 — relue telle qu'écrite. Absente, elle vaut liste vide :
    // « filiation inconnue », jamais « aucune filiation ».
    derivedFrom: Array.isArray(raw.derivedFrom)
      ? [...new Set(raw.derivedFrom.filter((d) => typeof d === 'string' && d.trim()).map((d) => d.trim().slice(0, 160)))].slice(0, 20)
      : [],
    // V77 · CP6 — relue telle qu'écrite. Absente d'une preuve ancienne, elle
    // vaut `false` : on ne devine pas une simulation qui n'a pas été déclarée.
    simulation: raw.simulation === true,
    // V77 · CP5 — le niveau est RECALCULÉ à la lecture, jamais lu du disque.
    //
    // C'est une PROJECTION, pas une migration : la preuve persistée n'est pas
    // réécrite, et une preuve antérieure au CP5 garde son `validation.status`
    // d'origine. Ce qui change est ce qu'on en DIT aujourd'hui — et le dire à
    // la lecture évite d'avoir à réécrire l'histoire pour changer d'avis.
    evidenceLevel: niveauDePreuve(sourceType, (!QUALIFYING_SOURCE_TYPES.has(sourceType) && validation?.status === 'passed')
      ? { ...validation, status: 'manual' }
      : validation),
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

/**
 * ── V76 · CP11 — LA MÊME RÉUSSITE, ÉCRITE SOUS DEUX NOMS ─────────────────
 *
 * Jusqu'au CP11, une réussite au laboratoire écrivait DEUX preuves au registre :
 * `exercise:<exerciseId>` (par `recordExerciseSuccess`) et
 * `exercise:lab-<exerciseId>` (par la commande `SUBMIT`). Le dédoublonnage ne
 * pouvait pas les fusionner — leurs clés métier diffèrent légitimement.
 *
 * La conséquence n'était pas cosmétique. La règle de consolidation
 * (`lib/competency.mjs`) promeut une compétence à `reinforced` lorsqu'elle voit
 * **deux sources distinctes et deux dates distinctes** — « deux réussites le
 * même jour sont une séance, pas un réancrage ». « Deux sources » veut dire
 * deux occasions différentes de démontrer la compétence. **Un seul exercice en
 * fournissait deux.** Le CP11 l'a mesuré : 2 preuves, 2 sources, 2 contacts de
 * rétention pour un exercice résolu une fois.
 *
 * L'écriture est corrigée à la source. Cette fonction traite les registres
 * DÉJÀ écrits, et elle est délibérément étroite :
 *
 *   · elle ne touche qu'à `sourceType === 'exercise'` ;
 *   · elle ne retire `lab-<id>` que si `<id>` est présent — **aucune preuve
 *     n'est jamais perdue**, seulement un doublon du même fait ;
 *   · et seulement si les deux portent les MÊMES compétences : c'est ce qui
 *     fait d'elles le même fait pour la projection.
 *
 * Aucun identifiant d'exercice du corpus ne commence par `lab-` (vérifié :
 * 0/376), donc la règle ne peut pas confondre deux exercices réels.
 */
export function fusionnerPreuvesDeLaboratoire(list) {
  const arr = Array.isArray(list) ? list : [];
  const comps = (e) => [...(e?.competencyIds ?? [])].sort().join('+');
  const parSource = new Map();
  for (const e of arr) {
    if (e?.sourceType !== 'exercise' || typeof e.sourceId !== 'string') continue;
    if (e.sourceId.startsWith('lab-')) continue;
    parSource.set(e.sourceId, comps(e));
  }
  return arr.filter((e) => {
    if (e?.sourceType !== 'exercise' || typeof e.sourceId !== 'string') return true;
    if (!e.sourceId.startsWith('lab-')) return true;
    const nu = e.sourceId.slice(4);
    return !(parSource.has(nu) && parSource.get(nu) === comps(e));
  });
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
  return fusionnerPreuvesDeLaboratoire(out)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
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
