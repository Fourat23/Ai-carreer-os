// Règles partagées (lecture seule).
export const MIN_NAME = 2;
export function isEmail(s) {
  return typeof s === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
}
