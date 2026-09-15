// Store de progression MULTI-PARCOURS (schéma v3) — PUR. Sur disque, la
// progression devient { schemaVersion:3, activeTrackId, tracks:{ id: {...} } }.
// Mais `activeTrackProgress()` renvoie la progression du parcours actif dans la
// forme PLATE V6 (startDate/days/skills/...), de sorte que tous les consommateurs
// V6 (position, review, dashboard, vue jour, backup) restent inchangés : une
// seule API de lecture/écriture, aucune seconde source de vérité.
import { migrateProgress, normalizeDay } from './learning.mjs';
import { normalizeLedger, migrateLegacyEvidence } from './evidence.mjs';
import { normalizeAttempts } from './retention.mjs';
import { normalizeExerciseAttempts, MAX_EXERCISE_ATTEMPTS } from './exercise-attempt.mjs';
import { normalizeTransferAttempts, MAX_TRANSFER_ATTEMPTS } from './transfer-attempt.mjs';
import { normalizeHintViews, MAX_HINT_VIEWS } from './hint-view.mjs';
import { normalizeUsageEvents, MAX_USAGE_EVENTS } from './usage-event.mjs';
import { normalizeAssessmentAttempts, MAX_ASSESSMENT_ATTEMPTS } from './assessment-attempt.mjs';
import { normalizeMissionSubmissions, MAX_MISSION_SUBMISSIONS } from './mission-submission.mjs';
import { DEFAULT_TRACK_ID } from './catalogue.mjs';

export const PROGRESS_SCHEMA = 3;
const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor']);
const MAX_TRACKS = 50;
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const iso = (v) => (typeof v === 'string' && !Number.isNaN(new Date(v).getTime()) ? v : null);

/**
 * ── V77 · CP3 — LES FAITS DU PRODUIT, ÉNUMÉRÉS UNE SEULE FOIS ────────────
 *
 * Trois listes blanches connaissaient déjà la liste des faits : `flatOf`
 * (écriture), `activeTrackProgress` (lecture), `emptyFlat` (état vide). V75 a
 * payé le défaut P7 pour en avoir oublié une, V76 l'a rappelé en commentaire.
 *
 * **Le CP3 en a trouvé une QUATRIÈME**, et celle-là ne se voyait pas depuis ce
 * fichier : `validateStrict` dans `lib/backup.mjs` reconstruit la progression
 * importée champ par champ, et ne connaissait que `startDate`, `days`,
 * `skills`, les deux revues et `missions`. Mesuré, pas supposé — un aller-retour
 * export → import rendait :
 *
 *   recallAttempts 1 → 0 · hintViews 1 → 0 · usageEvents 1 → 0
 *
 * L'export était donc fidèle et la restauration muette : les quatre faits
 * introduits depuis V66 ne survivaient pas à leur propre sauvegarde. Le registre
 * de preuves, lui, était reconstruit depuis `days[*].evidence`, ce qui perd
 * toute preuve n'ayant pas de journée (transfert, mission).
 *
 * Ajouter `usageEvents` à trois endroits sur quatre aurait reproduit P7 une
 * troisième fois. On énumère donc les faits **ici**, et les quatre sites
 * appellent cette fonction.
 */
export const FAITS_DU_PRODUIT = Object.freeze([
  'evidence', 'recallAttempts', 'exerciseAttempts', 'transferAttempts', 'hintViews',
  'assessmentAttempts', 'missionSubmissions', 'usageEvents',
]);

/**
 * Normalise les faits d'un parcours. Bornée et par liste blanche, elle est sûre
 * aussi bien pour le disque que pour un fichier importé : chaque normaliseur
 * rejette ce qu'il ne reconnaît pas plutôt que de le recopier.
 *
 * @param daysPourHeritage  journées servant à DÉRIVER le registre de preuves
 *   quand il est absent (V65). Présent, il fait foi.
 */
export function normaliserLesFaits(src, { daysPourHeritage = null } = {}) {
  return {
    // V65 · REGISTRE CANONIQUE DE PREUVES. Une preuve existe par elle-même :
    // identité globale, provenance, validation, date. Absent, il est DÉRIVÉ des
    // preuves héritées de `days[*].evidence` — déterministe, idempotent.
    evidence: Array.isArray(src?.evidence)
      ? normalizeLedger(src.evidence)
      : migrateLegacyEvidence(daysPourHeritage ?? {}),
    // V66 · TENTATIVES DE RAPPEL. Seul fait écrit par le Retention Engine ; tout
    // état de rétention en est une projection. Absentes, elles valent liste
    // vide — jamais un état fabriqué.
    recallAttempts: normalizeAttempts(src?.recallAttempts).slice(-MAX_RECALL_ATTEMPTS),
    // V74 · CP2 · TENTATIVES D'EXERCICE. Le fait qui manquait : un exercice raté
    // n'écrivait RIEN, parce que le produit persistait la PROJECTION (la preuve)
    // et jetait le FAIT (la tentative).
    exerciseAttempts: normalizeExerciseAttempts(src?.exerciseAttempts).slice(-MAX_EXERCISE_ATTEMPTS),
    // V75 · CP10 · TENTATIVES DE TRANSFERT. Même dissymétrie que V74 · CP2,
    // trouvée en traversant la chaîne réelle en HTTP — et deux champs
    // manquaient, pas un.
    transferAttempts: normalizeTransferAttempts(src?.transferAttempts).slice(-MAX_TRANSFER_ATTEMPTS),
    // V76 · CP7 · AIDES CONSULTÉES. Sans elles, une réussite après trois indices
    // était indiscernable d'une réussite immédiate.
    hintViews: normalizeHintViews(src?.hintViews).slice(-MAX_HINT_VIEWS),
    // V77 · CP4 · SOUMISSIONS DE DIAGNOSTIC. Le CP4 a mesuré que cinq échecs
    // ne laissaient qu'UNE trace, et que l'unique survivante était la PREMIÈRE :
    // la clé de preuve ignore le score, donc toute amélioration sous le seuil
    // était refusée comme doublon. Le fait, lui, ne se déduplique que sur un
    // rejeu réseau.
    assessmentAttempts: normalizeAssessmentAttempts(src?.assessmentAttempts).slice(-MAX_ASSESSMENT_ATTEMPTS),
    // V77 · CP5 · LIVRABLES DE MISSION. Le CP0 a mesuré que 42 missions sur 42
    // terminent sur une revue signée par l'apprenant lui-même, et qu'un document
    // délibérément mauvais passe la validation de FORME. Le fait dit par quel
    // MODE chaque livrable a été constaté ; il ne dit jamais qu'il est juste.
    missionSubmissions: normalizeMissionSubmissions(src?.missionSubmissions).slice(-MAX_MISSION_SUBMISSIONS),
    // ── V77 · CP3 · ÉVÉNEMENTS D'USAGE — UN CHAMP SÉPARÉ, EXPRÈS ──
    //
    // Contrainte n°1 du contrat gelé (CP1 §3.4) : l'usage vit **à côté** des
    // faits pédagogiques, jamais mêlé à eux. Contrainte n°4 : borné, exportable
    // et supprimable comme le reste — c'est cette ligne qui le garantit, aux
    // quatre endroits à la fois.
    usageEvents: normalizeUsageEvents(src?.usageEvents).slice(-MAX_USAGE_EVENTS),
  };
}

/** Progression plate (V6) → contenu de parcours (sans re-migrer inutilement). */
function flatOf(track) {
  const m = migrateProgress({
    startDate: track?.startDate, days: track?.days, skills: track?.skills,
    weeklyReviews: track?.weeklyReviews, monthlyReviews: track?.monthlyReviews,
  });
  const flat = { startDate: m.startDate, days: m.days, skills: m.skills, weeklyReviews: m.weeklyReviews, monthlyReviews: m.monthlyReviews };
  const missions = normalizeMissionsMap(track?.missions);
  if (missions) flat.missions = missions;
  // Les six faits du produit, énumérés une seule fois (voir `normaliserLesFaits`).
  Object.assign(flat, normaliserLesFaits(track, { daysPourHeritage: m.days }));
  // ── V75 · CP7 · PAUSE DU CURRICULUM — DÉFAUT **P7** ──
  //
  // Le CP7 a écrit la commande, la route et la surface, et ses tests passaient :
  // ils appelaient `applyCommand` sur un objet plat, jamais `writeProgress`. La
  // pause était donc **perdue au rechargement de la page**, c'est-à-dire
  // exactement là où elle sert.
  if (isObj(track?.curriculumPause)) {
    const cp = track.curriculumPause;
    flat.curriculumPause = {
      paused: cp.paused === true,
      since: iso(cp.since),
      updatedAt: iso(cp.updatedAt) ?? null,
      raison: typeof cp.raison === 'string' ? cp.raison.slice(0, 300) : '',
      provenance: {
        producer: typeof cp.provenance?.producer === 'string' ? cp.provenance.producer.slice(0, 60) : 'legacy',
        method: typeof cp.provenance?.method === 'string' ? cp.provenance.method.slice(0, 80) : '',
      },
      schemaVersion: Number.isInteger(cp.schemaVersion) ? cp.schemaVersion : 1,
    };
  }
  return flat;
}

/**
 * Borne dure de la liste : au-delà, on garde les plus RÉCENTES. Une année de
 * cursus produit quelques milliers de tentatives ; 20 000 laisse une marge
 * confortable tout en interdisant à un fichier importé de faire enfler la
 * progression sans limite.
 */
const MAX_RECALL_ATTEMPTS = 20000;

// État des missions d'ingénierie (V18) : additif et OPTIONNEL dans le track plat.
// Persistance bornée et sûre (aucune validation métier ici — cf. lib/mission-state).
const MAX_MISSIONS = 200;
const MAX_MISSION_DELIVERABLES = 40;
const MAX_MISSION_CONTENT = 20000;

function safeShallow(obj, maxKeys = 20) {
  if (!isObj(obj)) return undefined;
  const out = {};
  let n = 0;
  for (const k of Object.keys(obj)) {
    if (DANGEROUS.has(k) || n >= maxKeys) continue;
    const v = obj[k];
    if (typeof v === 'string') out[k] = v.slice(0, 4000);
    else if (typeof v === 'number' || typeof v === 'boolean' || v === null) out[k] = v;
    n += 1;
  }
  return out;
}

/** Normalise/borne la carte des missions. Renvoie undefined si vide/invalide. */
export function normalizeMissionsMap(missions) {
  if (!isObj(missions)) return undefined;
  const out = {};
  let n = 0;
  for (const k of Object.keys(missions)) {
    if (DANGEROUS.has(k) || n >= MAX_MISSIONS) continue;
    const s = missions[k];
    if (!isObj(s)) continue;
    const deliverables = {};
    if (isObj(s.deliverables)) {
      let dn = 0;
      for (const dk of Object.keys(s.deliverables)) {
        if (DANGEROUS.has(dk) || dn >= MAX_MISSION_DELIVERABLES) continue;
        const d = s.deliverables[dk];
        if (!isObj(d)) continue;
        const e = {};
        if (typeof d.status === 'string') e.status = d.status.slice(0, 40);
        if (typeof d.content === 'string') e.content = d.content.slice(0, MAX_MISSION_CONTENT);
        if (isObj(d.selfAssessment)) e.selfAssessment = safeShallow(d.selfAssessment);
        if (typeof d.reviewNote === 'string') e.reviewNote = d.reviewNote.slice(0, 4000);
        if (typeof d.submittedAt === 'string') e.submittedAt = d.submittedAt.slice(0, 40);
        deliverables[dk] = e;
        dn += 1;
      }
    }
    out[k] = {
      status: typeof s.status === 'string' ? s.status.slice(0, 40) : 'not-started',
      deliverables,
      startedAt: typeof s.startedAt === 'string' ? s.startedAt : null,
      updatedAt: typeof s.updatedAt === 'string' ? s.updatedAt : null,
    };
    n += 1;
  }
  return Object.keys(out).length ? out : undefined;
}

function normalizeTrack(t, now) {
  const flat = flatOf(t);
  return {
    version: typeof t?.version === 'string' ? t.version : '1',
    enrolledAt: iso(t?.enrolledAt) ?? now,
    lastOpenedAt: iso(t?.lastOpenedAt) ?? now,
    ...flat,
  };
}

/** Progression plate vide (forme V6 + registre V65). */
export function emptyFlat() {
  return {
    startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {},
    ...normaliserLesFaits({}, { daysPourHeritage: {} }),
  };
}

/** Migration/normalisation vers v3. Idempotent, borné, sans pollution de prototype. */
export function migrateToV7(raw, now = new Date().toISOString()) {
  const src = isObj(raw) ? raw : {};

  // Déjà multi-parcours (v3+) : normaliser chaque parcours.
  if (isObj(src.tracks)) {
    const tracks = {};
    const keys = Object.keys(src.tracks).filter((k) => !DANGEROUS.has(k)).slice(0, MAX_TRACKS);
    for (const k of keys) tracks[k] = normalizeTrack(src.tracks[k], now);
    let activeTrackId = typeof src.activeTrackId === 'string' && tracks[src.activeTrackId]
      ? src.activeTrackId
      : (keys[0] ?? DEFAULT_TRACK_ID);
    if (!tracks[activeTrackId]) { tracks[activeTrackId] = normalizeTrack({}, now); }
    return { schemaVersion: PROGRESS_SCHEMA, activeTrackId, tracks };
  }

  // Ancien format plat (V4/V5/V6) → encapsulé sous le parcours par défaut.
  const flat = flatOf(src);
  return {
    schemaVersion: PROGRESS_SCHEMA,
    activeTrackId: DEFAULT_TRACK_ID,
    tracks: {
      [DEFAULT_TRACK_ID]: {
        version: '1',
        enrolledAt: flat.startDate ?? now,
        lastOpenedAt: now,
        ...flat,
      },
    },
  };
}

/** Progression PLATE (V6) du parcours actif. */
export function activeTrackProgress(v3) {
  const t = isObj(v3?.tracks) ? v3.tracks[v3.activeTrackId] : null;
  if (!t) return emptyFlat();
  const flat = { startDate: t.startDate ?? null, days: t.days ?? {}, skills: t.skills ?? {}, weeklyReviews: t.weeklyReviews ?? {}, monthlyReviews: t.monthlyReviews ?? {} };
  const missions = normalizeMissionsMap(t.missions);
  if (missions) flat.missions = missions;
  // La liste blanche de LECTURE. `flatOf` filtre à l'écriture, celle-ci à la
  // lecture, `emptyFlat` donne l'état vide et `validateStrict` relit un fichier
  // importé : les quatre passent désormais par la MÊME énumération, de sorte
  // qu'un fait ne puisse plus exister dans trois d'entre elles et nulle part
  // dans la quatrième.
  Object.assign(flat, normaliserLesFaits(t, { daysPourHeritage: t.days ?? {} }));
  if (isObj(t.curriculumPause)) flat.curriculumPause = t.curriculumPause;
  return flat;
}

/** Réécrit la progression plate dans le parcours actif (renvoie un nouveau v3). */
export function writeActiveTrack(v3, flat, now = new Date().toISOString()) {
  const base = migrateToV7(v3, now);
  const id = base.activeTrackId;
  const prev = base.tracks[id] ?? normalizeTrack({}, now);
  const f = flatOf(flat);
  return {
    ...base,
    tracks: { ...base.tracks, [id]: { ...prev, ...f, lastOpenedAt: now } },
  };
}

/** Inscrit un parcours (idempotent) et le rend actif. */
export function enrollTrack(v3, trackId, version = '1', now = new Date().toISOString()) {
  if (DANGEROUS.has(trackId)) return migrateToV7(v3, now);
  const base = migrateToV7(v3, now);
  const existing = base.tracks[trackId];
  const track = existing
    ? { ...existing, lastOpenedAt: now }
    : { version, enrolledAt: now, lastOpenedAt: now, ...emptyFlat() };
  return { ...base, activeTrackId: trackId, tracks: { ...base.tracks, [trackId]: track } };
}

/** Change le parcours actif s'il est déjà inscrit (sinon inchangé). */
export function setActiveTrack(v3, trackId, now = new Date().toISOString()) {
  const base = migrateToV7(v3, now);
  if (!base.tracks[trackId]) return base;
  return { ...base, activeTrackId: trackId, tracks: { ...base.tracks, [trackId]: { ...base.tracks[trackId], lastOpenedAt: now } } };
}

/** Métadonnées légères par parcours (pour l'aperçu de sauvegarde / la route parcours). */
export function tracksMeta(v3) {
  const base = migrateToV7(v3);
  return Object.keys(base.tracks).map((id) => {
    const t = base.tracks[id];
    return {
      id, version: t.version, active: id === base.activeTrackId,
      enrolledAt: t.enrolledAt, lastOpenedAt: t.lastOpenedAt,
      daysTracked: Object.keys(t.days ?? {}).length,
    };
  });
}

// Ré-export pour usage éventuel côté serveur.
export { normalizeDay };
