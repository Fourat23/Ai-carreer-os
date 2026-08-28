// Store de progression MULTI-PARCOURS (schéma v3) — PUR. Sur disque, la
// progression devient { schemaVersion:3, activeTrackId, tracks:{ id: {...} } }.
// Mais `activeTrackProgress()` renvoie la progression du parcours actif dans la
// forme PLATE V6 (startDate/days/skills/...), de sorte que tous les consommateurs
// V6 (position, review, dashboard, vue jour, backup) restent inchangés : une
// seule API de lecture/écriture, aucune seconde source de vérité.
import { migrateProgress, normalizeDay } from './learning.mjs';
import { normalizeLedger, migrateLegacyEvidence } from './evidence.mjs';
import { normalizeAttempts } from './retention.mjs';
import { DEFAULT_TRACK_ID } from './catalogue.mjs';

export const PROGRESS_SCHEMA = 3;
const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor']);
const MAX_TRACKS = 50;
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const iso = (v) => (typeof v === 'string' && !Number.isNaN(new Date(v).getTime()) ? v : null);

/** Progression plate (V6) → contenu de parcours (sans re-migrer inutilement). */
function flatOf(track) {
  const m = migrateProgress({
    startDate: track?.startDate, days: track?.days, skills: track?.skills,
    weeklyReviews: track?.weeklyReviews, monthlyReviews: track?.monthlyReviews,
  });
  const flat = { startDate: m.startDate, days: m.days, skills: m.skills, weeklyReviews: m.weeklyReviews, monthlyReviews: m.monthlyReviews };
  const missions = normalizeMissionsMap(track?.missions);
  if (missions) flat.missions = missions;
  // V65 · REGISTRE CANONIQUE DE PREUVES. Une preuve existe désormais par
  // elle-même : identité globale, provenance, validation, date. Absent du
  // disque, il est DÉRIVÉ des preuves héritées de `days[*].evidence` —
  // déterministe, idempotent, sans perte. Présent, il fait foi.
  flat.evidence = Array.isArray(track?.evidence)
    ? normalizeLedger(track.evidence)
    : migrateLegacyEvidence(m.days);
  // V66 · TENTATIVES DE RAPPEL. Seul fait écrit par le Retention Engine ; tout
  // état de rétention en est une projection. Absentes du disque, elles valent
  // liste vide — jamais un état fabriqué.
  flat.recallAttempts = normalizeAttempts(track?.recallAttempts).slice(-MAX_RECALL_ATTEMPTS);
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
  return { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {}, evidence: [], recallAttempts: [] };
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
  flat.evidence = Array.isArray(t.evidence) ? normalizeLedger(t.evidence) : migrateLegacyEvidence(t.days ?? {});
  flat.recallAttempts = normalizeAttempts(t.recallAttempts);
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
