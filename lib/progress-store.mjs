// Store de progression MULTI-PARCOURS (schéma v3) — PUR. Sur disque, la
// progression devient { schemaVersion:3, activeTrackId, tracks:{ id: {...} } }.
// Mais `activeTrackProgress()` renvoie la progression du parcours actif dans la
// forme PLATE V6 (startDate/days/skills/...), de sorte que tous les consommateurs
// V6 (position, review, dashboard, vue jour, backup) restent inchangés : une
// seule API de lecture/écriture, aucune seconde source de vérité.
import { migrateProgress, normalizeDay } from './learning.mjs';
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
  return { startDate: m.startDate, days: m.days, skills: m.skills, weeklyReviews: m.weeklyReviews, monthlyReviews: m.monthlyReviews };
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

/** Progression plate vide (forme V6). */
export function emptyFlat() {
  return { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };
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
  return { startDate: t.startDate ?? null, days: t.days ?? {}, skills: t.skills ?? {}, weeklyReviews: t.weeklyReviews ?? {}, monthlyReviews: t.monthlyReviews ?? {} };
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
