// Sauvegarde / restauration PURE (aucun I/O) — sérialisation versionnée,
// validation stricte et migration des anciens formats. AI Career OS est local :
// on ne doit jamais corrompre ni perdre la progression.

import { normalizeDay } from './learning.mjs';
import { migrateToV7 } from './progress-store.mjs';

export const SCHEMA_VERSION = 2;       // format plat : 1 = V4/V5, 2 = V6
export const BACKUP_SCHEMA_V3 = 3;     // format multi-parcours + workspaces (V9)
export const APP_ID = 'ai-career-os';

/** Normalise un objet de progression (champs par défaut, tolérant). */
export function normalizeProgress(p) {
  const o = (p && typeof p === 'object') ? p : {};
  return {
    startDate: typeof o.startDate === 'string' ? o.startDate : null,
    days: (o.days && typeof o.days === 'object') ? o.days : {},
    skills: (o.skills && typeof o.skills === 'object') ? o.skills : {},
    weeklyReviews: (o.weeklyReviews && typeof o.weeklyReviews === 'object') ? o.weeklyReviews : {},
    monthlyReviews: (o.monthlyReviews && typeof o.monthlyReviews === 'object') ? o.monthlyReviews : {},
  };
}

/** Vrai si l'objet ressemble à une progression brute (jamais wrappée). */
export function isProgressShape(p) {
  if (!p || typeof p !== 'object') return false;
  const o = p;
  const startOk = o.startDate === null || o.startDate === undefined || typeof o.startDate === 'string';
  return startOk && o.days !== null && typeof o.days === 'object';
}

/** Statistiques utiles incluses dans l'export (aucune donnée inventée). */
export function backupStats(progress) {
  const days = normalizeProgress(progress).days;
  const s = { daysTracked: 0, done: 0, inProgress: 0, toReview: 0, notes: 0 };
  for (const k of Object.keys(days)) {
    const d = days[k]; if (!d) continue;
    s.daysTracked += 1;
    if (d.status === 'done') s.done += 1;
    else if (d.status === 'in-progress') s.inProgress += 1;
    else if (d.status === 'to-review') s.toReview += 1;
    if ((d.notes && d.notes.trim()) || (d.answer && d.answer.trim())) s.notes += 1;
  }
  s.skillsRated = Object.keys(normalizeProgress(progress).skills).length;
  return s;
}

/**
 * Enveloppe versionnée pour l'export (progression = toutes les données perso du
 * parcours actif). `meta` (facultatif) ajoute un contexte multi-parcours purement
 * informatif — { activeTrackId, trackCount } — pour l'aperçu ; il ne change ni le
 * format ni la validation de restauration (compatibilité ascendante préservée).
 */
export function serializeBackup(progress, now = new Date(), meta = null) {
  const p = normalizeProgress(progress);
  const out = {
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    stats: backupStats(p),
    progress: p,
  };
  if (meta && typeof meta === 'object') {
    if (typeof meta.activeTrackId === 'string') out.activeTrackId = meta.activeTrackId;
    if (Number.isInteger(meta.trackCount)) out.trackCount = meta.trackCount;
  }
  return out;
}

/** Migre un objet importé (toute version connue) vers la progression courante. */
export function migrate(obj) {
  if (obj && typeof obj === 'object' && 'progress' in obj) {
    // Format wrappé (v1 et futurs — champs additionnels ignorés sans risque).
    return normalizeProgress(obj.progress);
  }
  // Format legacy : progress.json brut (v0, avant l'enveloppe).
  return normalizeProgress(obj);
}

export const DAY_STATUSES = ['not-started', 'in-progress', 'done', 'to-review'];
const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor']);
const MAX_TEXT = 20000;   // longueur max d'un champ texte (answer/notes)
const MAX_DAYS = 400;     // > 365, marge raisonnable
const MAX_SKILLS = 300;
const MAX_REVIEWS = 200;

function validDateStr(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s) && !Number.isNaN(new Date(s).getTime());
}

function cleanReviews(raw, kind) {
  if (raw === undefined || raw === null) return { value: {} };
  if (typeof raw !== 'object' || Array.isArray(raw)) return { error: `Le champ « ${kind} » doit être un objet.` };
  const keys = Object.keys(raw);
  if (keys.length > MAX_REVIEWS) return { error: `Trop d'entrées dans « ${kind} ».` };
  const out = {};
  for (const k of keys) {
    if (DANGEROUS.has(k)) return { error: 'Clé interdite détectée.' };
    const r = raw[k];
    if (!r || typeof r !== 'object' || Array.isArray(r)) return { error: `« ${kind} » : entrée invalide.` };
    const note = typeof r.note === 'string' ? r.note : '';
    if (note.length > MAX_TEXT) return { error: `« ${kind} » : note trop volumineuse.` };
    const score = r.score === null || r.score === undefined ? null : r.score;
    if (score !== null && (!Number.isFinite(score) || score < 0 || score > 5)) return { error: `« ${kind} » : score hors bornes.` };
    out[k] = { done: !!r.done, note, score };
  }
  return { value: out };
}

/**
 * Validation STRICTE d'une progression : bornes de jours (1–365), statuts de
 * l'enum, scores bornés, dates valides, tailles raisonnables, aucune clé
 * dangereuse (pollution de prototype). Reconstruit un objet propre (champs
 * inconnus retirés → avertissement). Ne mute rien, ne lance jamais.
 * @returns {{ok:true, progress, warnings:string[]}|{ok:false, error:string}}
 */
export function validateStrict(src) {
  const warnings = [];
  if (!src || typeof src !== 'object' || Array.isArray(src)) return { ok: false, error: 'Progression absente ou de type invalide.' };
  if (!('days' in src) || src.days === null || typeof src.days !== 'object' || Array.isArray(src.days)) {
    return { ok: false, error: 'Ce fichier ne contient pas de progression AI Career OS valide.' };
  }

  let startDate = null;
  if (src.startDate === null || src.startDate === undefined) startDate = null;
  else if (validDateStr(src.startDate)) startDate = src.startDate.slice(0, 10);
  else return { ok: false, error: 'Date de démarrage invalide.' };

  const days = {};
  const keys = Object.keys(src.days);
  if (keys.length > MAX_DAYS) return { ok: false, error: `Trop de journées (${keys.length}).` };
  let stripped = false;
  const KNOWN = new Set([
    'status', 'selfScore', 'answer', 'notes', 'checklist', 'updatedAt',
    // champs Active Learning (V6) — préservés, jamais rejetés (sanitisés)
    'startedAt', 'completedAt', 'answers', 'selfAssessment', 'comprehension',
    'attempts', 'correctionState', 'review', 'evidence',
  ]);
  for (const k of keys) {
    if (DANGEROUS.has(k)) return { ok: false, error: 'Clé interdite détectée (pollution de prototype).' };
    if (!/^\d+$/.test(k)) return { ok: false, error: `Clé de jour non numérique : « ${k} ».` };
    const n = Number(k);
    if (n < 1 || n > 365) return { ok: false, error: `Jour hors bornes : ${n} (attendu 1–365).` };
    const d = src.days[k];
    if (!d || typeof d !== 'object' || Array.isArray(d)) return { ok: false, error: `Jour ${n} : entrée invalide.` };

    let status = d.status === undefined ? 'not-started' : d.status;
    if (!DAY_STATUSES.includes(status)) return { ok: false, error: `Jour ${n} : statut inconnu « ${status} ».` };

    let selfScore = d.selfScore === undefined ? null : d.selfScore;
    if (selfScore !== null && (!Number.isFinite(selfScore) || selfScore < 0 || selfScore > 5)) return { ok: false, error: `Jour ${n} : auto-évaluation hors bornes.` };

    const answer = d.answer === undefined ? '' : d.answer;
    const notes = d.notes === undefined ? '' : d.notes;
    if (typeof answer !== 'string' || typeof notes !== 'string') return { ok: false, error: `Jour ${n} : réponse/notes de type invalide.` };
    if (answer.length > MAX_TEXT || notes.length > MAX_TEXT) return { ok: false, error: `Jour ${n} : texte trop volumineux.` };

    let checklist = {};
    if (d.checklist !== undefined) {
      if (typeof d.checklist !== 'object' || Array.isArray(d.checklist)) return { ok: false, error: `Jour ${n} : checklist invalide.` };
      for (const ck of Object.keys(d.checklist)) {
        if (DANGEROUS.has(ck)) return { ok: false, error: 'Clé interdite détectée (pollution de prototype).' };
        checklist[ck] = !!d.checklist[ck];
      }
    }
    const updatedAt = typeof d.updatedAt === 'string' ? d.updatedAt : '';
    if (Object.keys(d).some((f) => !KNOWN.has(f))) stripped = true;
    // V5 : champs cœur validés strictement (rejet ci-dessus). V6 : champs Active
    // Learning sanitisés (URL de preuve neutralisée, tailles bornées, dates
    // invalides → null) via normalizeDay, puis préservés — jamais perdus.
    const nd = normalizeDay(d);
    days[k] = {
      status, selfScore, answer, notes, checklist, updatedAt,
      startedAt: nd.startedAt, completedAt: nd.completedAt,
      answers: nd.answers, selfAssessment: nd.selfAssessment, comprehension: nd.comprehension,
      attempts: nd.attempts, correctionState: nd.correctionState, review: nd.review, evidence: nd.evidence,
    };
  }
  if (stripped) warnings.push('Des champs supplémentaires par journée ont été ignorés.');

  const skills = {};
  if (src.skills !== undefined && src.skills !== null) {
    if (typeof src.skills !== 'object' || Array.isArray(src.skills)) return { ok: false, error: 'Le champ « skills » doit être un objet.' };
    const sk = Object.keys(src.skills);
    if (sk.length > MAX_SKILLS) return { ok: false, error: 'Trop de compétences.' };
    for (const k of sk) {
      if (DANGEROUS.has(k)) return { ok: false, error: 'Clé interdite détectée (pollution de prototype).' };
      const v = src.skills[k];
      if (!Number.isFinite(v) || v < 0 || v > 5) return { ok: false, error: `Compétence « ${k} » : score hors bornes.` };
      skills[k] = v;
    }
  }

  const wr = cleanReviews(src.weeklyReviews, 'weeklyReviews');
  if (wr.error) return { ok: false, error: wr.error };
  const mr = cleanReviews(src.monthlyReviews, 'monthlyReviews');
  if (mr.error) return { ok: false, error: mr.error };

  return { ok: true, progress: { startDate, days, skills, weeklyReviews: wr.value, monthlyReviews: mr.value }, warnings };
}

/**
 * Analyse + valide une sauvegarde (chaîne JSON ou objet). Ne lance jamais.
 * Politique : enveloppe V4 (schemaVersion ≤ courante, app === ai-career-os si
 * présent) OU progress.json brut legacy. Champs supplémentaires tolérés (retirés
 * avec avertissement) ; incohérences (jour hors bornes, statut inconnu, score
 * hors bornes, clé dangereuse) → refus bloquant, sans mutation.
 * @returns {{ok:true, progress, version, stats, warnings}|{ok:false, error:string}}
 */
export function parseBackup(input) {
  let obj = input;
  if (typeof input === 'string') {
    try { obj = JSON.parse(input); }
    catch { return { ok: false, error: 'Fichier JSON illisible ou corrompu.' }; }
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, error: 'Format de sauvegarde invalide.' };

  const wrapped = 'progress' in obj;
  if (wrapped) {
    if (obj.schemaVersion !== undefined) {
      const sv = Number(obj.schemaVersion);
      if (!Number.isInteger(sv) || sv < 1) return { ok: false, error: 'Version de schéma invalide.' };
      if (sv > SCHEMA_VERSION) return { ok: false, error: `Schéma trop récent (v${sv}) : non pris en charge par cette version.` };
    }
    if (obj.app !== undefined && obj.app !== APP_ID) return { ok: false, error: "Ce fichier ne provient pas d'AI Career OS." };
  }
  const v = validateStrict(wrapped ? obj.progress : obj);
  if (!v.ok) return { ok: false, error: v.error };
  return {
    ok: true,
    progress: v.progress,
    version: wrapped ? (Number(obj.schemaVersion) || 0) : 0,
    stats: backupStats(v.progress),
    warnings: v.warnings,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// V9 — Sauvegarde MULTI-PARCOURS + WORKSPACES (schéma 3)
// ══════════════════════════════════════════════════════════════════════════════

const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const MAX_WS_FILE_BYTES = 200_000;
const MAX_WS_TOTAL_BYTES = 2_000_000;
const MAX_WS_EXERCISES = 200;

/** Neutralise une URL dangereuse dans une preuve importée (défense en profondeur). */
function isNul(s) { return typeof s === 'string' && s.indexOf(String.fromCharCode(0)) !== -1; }

/**
 * Sérialise une sauvegarde V9 : structure de progression v3 (multi-parcours)
 * + workspaces du Laboratoire. Aucune I/O (les workspaces sont fournis).
 * @param {object} v3  { schemaVersion:3, activeTrackId, tracks }
 * @param {Record<string,{runtime?:string, files:Record<string,string>}>} workspaces
 */
export function serializeBackupV3(v3, workspaces = {}, now = new Date()) {
  const activeTrackId = typeof v3?.activeTrackId === 'string' ? v3.activeTrackId : null;
  const tracks = (v3 && typeof v3.tracks === 'object' && !Array.isArray(v3.tracks)) ? v3.tracks : {};
  const active = tracks[activeTrackId];
  return {
    app: APP_ID,
    schemaVersion: BACKUP_SCHEMA_V3,
    exportedAt: now.toISOString(),
    stats: {
      trackCount: Object.keys(tracks).length,
      activeTrackId,
      active: active ? backupStats(active) : null,
      workspaceCount: Object.keys(workspaces || {}).length,
    },
    progress: v3,
    workspaces: workspaces || {},
  };
}

/**
 * Valide/filtre les workspaces importés contre une allowlist de fichiers connus.
 * Ignore : exercices inconnus, fichiers hors allowlist (dont tests privés),
 * chemins dangereux, contenu binaire, dépassements. Ne lance jamais.
 * @param {any} raw  { exId: { files: { path: content } } }
 * @param {Map<string, Set<string>>} allow  exId → chemins éditables autorisés
 * @returns {{ workspaces: Record<string,{files:Record<string,string>}>, warnings: string[] }}
 */
export function sanitizeWorkspaces(raw, allow) {
  const out = {};
  const warnings = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { workspaces: out, warnings };
  let total = 0;
  let exCount = 0;
  for (const exId of Object.keys(raw)) {
    if (DANGEROUS_KEYS.has(exId)) continue;
    if (exCount >= MAX_WS_EXERCISES) { warnings.push('Trop de workspaces : surplus ignoré.'); break; }
    const allowed = allow.get(exId);
    if (!allowed) { warnings.push(`Workspace ignoré (exercice inconnu « ${exId} »).`); continue; }
    const entry = raw[exId];
    const files = entry && typeof entry.files === 'object' && !Array.isArray(entry.files) ? entry.files : null;
    if (!files) continue;
    const clean = {};
    for (const path of Object.keys(files)) {
      if (DANGEROUS_KEYS.has(path)) continue;
      if (!allowed.has(path)) { warnings.push(`Fichier ignoré (hors allowlist) : ${exId}/${path}.`); continue; }
      const content = files[path];
      if (typeof content !== 'string' || isNul(content)) { warnings.push(`Fichier ignoré (contenu invalide) : ${exId}/${path}.`); continue; }
      const bytes = Buffer.byteLength(content, 'utf8');
      if (bytes > MAX_WS_FILE_BYTES) { warnings.push(`Fichier ignoré (trop volumineux) : ${exId}/${path}.`); continue; }
      total += bytes;
      if (total > MAX_WS_TOTAL_BYTES) { warnings.push('Workspaces trop volumineux : surplus ignoré.'); return { workspaces: out, warnings }; }
      clean[path] = content;
    }
    if (Object.keys(clean).length) { out[exId] = { files: clean }; exCount += 1; }
  }
  return { workspaces: out, warnings };
}

/**
 * Analyse + valide une sauvegarde V9 (multi-parcours + workspaces) OU tout format
 * antérieur (V4/V5/V6 plat, V7/V8). Ne lance jamais. Revalide strictement chaque
 * parcours et filtre les workspaces via l'allowlist. Refuse un schéma trop récent.
 * @param {unknown} input
 * @param {Map<string, Set<string>>} allow  allowlist des fichiers de workspace
 * @returns {{ok:true, v3, workspaces, warnings, version}|{ok:false, error}}
 */
export function parseBackupV3(input, allow = new Map()) {
  let obj = input;
  if (typeof input === 'string') {
    try { obj = JSON.parse(input); } catch { return { ok: false, error: 'Fichier JSON illisible ou corrompu.' }; }
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, error: 'Format de sauvegarde invalide.' };

  const wrapped = 'progress' in obj;
  let version = 0;
  if (wrapped) {
    if (obj.app !== undefined && obj.app !== APP_ID) return { ok: false, error: "Ce fichier ne provient pas d'AI Career OS." };
    if (obj.schemaVersion !== undefined) {
      const sv = Number(obj.schemaVersion);
      if (!Number.isInteger(sv) || sv < 1) return { ok: false, error: 'Version de schéma invalide.' };
      if (sv > BACKUP_SCHEMA_V3) return { ok: false, error: `Schéma trop récent (v${sv}) : non pris en charge par cette version.` };
      version = sv;
    }
  }
  const source = wrapped ? obj.progress : obj;
  const warnings = [];
  let v3;

  if (source && typeof source === 'object' && source.tracks && typeof source.tracks === 'object' && !Array.isArray(source.tracks)) {
    // Format multi-parcours (v3/V7/V8) : revalide STRICTEMENT chaque parcours.
    const tracks = {};
    for (const key of Object.keys(source.tracks)) {
      if (DANGEROUS_KEYS.has(key)) continue;
      const tv = validateStrict(source.tracks[key]);
      if (!tv.ok) return { ok: false, error: `Parcours « ${key} » : ${tv.error}` };
      const meta = source.tracks[key] || {};
      tracks[key] = {
        ...tv.progress,
        version: typeof meta.version === 'string' ? meta.version : '1',
        enrolledAt: typeof meta.enrolledAt === 'string' ? meta.enrolledAt : null,
        lastOpenedAt: typeof meta.lastOpenedAt === 'string' ? meta.lastOpenedAt : null,
      };
      if (tv.warnings.length) warnings.push(...tv.warnings.map((w) => `${key}: ${w}`));
    }
    if (Object.keys(tracks).length === 0) return { ok: false, error: 'Aucun parcours valide dans la sauvegarde.' };
    const activeTrackId = (typeof source.activeTrackId === 'string' && tracks[source.activeTrackId]) ? source.activeTrackId : Object.keys(tracks)[0];
    v3 = migrateToV7({ schemaVersion: 3, activeTrackId, tracks });
  } else {
    // Format plat legacy (V4/V5/V6) : valide puis enveloppe sous le parcours défaut.
    const v = validateStrict(source);
    if (!v.ok) return { ok: false, error: v.error };
    warnings.push(...v.warnings);
    v3 = migrateToV7(v.progress);
  }

  const ws = sanitizeWorkspaces(wrapped ? obj.workspaces : null, allow);
  warnings.push(...ws.warnings);
  return { ok: true, v3, workspaces: ws.workspaces, warnings, version };
}
