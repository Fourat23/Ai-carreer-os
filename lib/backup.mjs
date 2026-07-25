// Sauvegarde / restauration PURE (aucun I/O) — sérialisation versionnée,
// validation stricte et migration des anciens formats. AI Career OS est local :
// on ne doit jamais corrompre ni perdre la progression.

export const SCHEMA_VERSION = 1;
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

/** Enveloppe versionnée pour l'export (progression = toutes les données perso). */
export function serializeBackup(progress, now = new Date()) {
  const p = normalizeProgress(progress);
  return {
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    stats: backupStats(p),
    progress: p,
  };
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

/**
 * Analyse + valide une sauvegarde (chaîne JSON ou objet). Ne lance jamais.
 * @returns {{ok:true, progress, version:number|0, stats}|{ok:false, error:string}}
 */
export function parseBackup(input) {
  let obj = input;
  if (typeof input === 'string') {
    try { obj = JSON.parse(input); }
    catch { return { ok: false, error: 'Fichier JSON illisible ou corrompu.' }; }
  }
  if (!obj || typeof obj !== 'object') return { ok: false, error: 'Format de sauvegarde invalide.' };

  const wrapped = 'progress' in obj;
  const candidate = wrapped ? obj.progress : obj;
  if (!isProgressShape(candidate)) {
    return { ok: false, error: 'Ce fichier ne contient pas de progression AI Career OS valide.' };
  }
  const progress = migrate(obj);
  return {
    ok: true,
    progress,
    version: wrapped ? (Number(obj.schemaVersion) || 0) : 0,
    stats: backupStats(progress),
  };
}
