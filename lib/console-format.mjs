// Bornage PUR des entrées de console de la preview web (anti-fuite/anti-abus).
// Le texte des messages vient de l'iframe (déjà sérialisé de façon bornée par le
// bootstrap) ; ici on RE-borne côté application : longueur par entrée, nombre
// total d'entrées. Le rendu se fait en TEXTE (jamais d'HTML interprété) — la
// sûreté anti-XSS vient de React (aucun dangerouslySetInnerHTML).

export const MAX_LOGS = 200;        // nombre maximal d'entrées conservées
export const MAX_TEXT = 2000;       // taille maximale par entrée (caractères)
const LEVELS = new Set(['log', 'info', 'warn', 'error', 'debug']);

/** Normalise et borne une entrée de log brute reçue de l'iframe. */
export function boundLogEntry(raw) {
  const r = (raw && typeof raw === 'object') ? raw : {};
  const type = r.type === 'error' ? 'error' : 'console';
  let level = typeof r.level === 'string' && LEVELS.has(r.level) ? r.level : (type === 'error' ? 'error' : 'log');
  let text = typeof r.text === 'string' ? r.text : '';
  if (text.length > MAX_TEXT) text = text.slice(0, MAX_TEXT) + '…';
  return {
    type,
    level,
    text,
    line: Number.isFinite(r.line) ? r.line : null,
    col: Number.isFinite(r.col) ? r.col : null,
    at: Number.isFinite(r.at) ? r.at : Date.now(),
  };
}

/** Ajoute une entrée bornée à la liste, en conservant au plus MAX_LOGS entrées. */
export function appendPreviewLog(list, raw) {
  const arr = Array.isArray(list) ? list : [];
  const next = arr.concat(boundLogEntry(raw));
  return next.length > MAX_LOGS ? next.slice(next.length - MAX_LOGS) : next;
}
