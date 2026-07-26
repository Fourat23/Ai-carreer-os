// Diff structuré PUR entre une valeur attendue et une valeur reçue (JSON-
// comparables). Sert à un retour pédagogique riche sur les tests publics :
// on liste les chemins qui diffèrent (valeur, type, longueur), borné.
// Aucune I/O. N'est JAMAIS appliqué aux tests privés (dont l'attendu/reçu
// ne quitte pas le serveur).

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

function walk(path, e, a, out, max) {
  if (out.length >= max) return;
  const te = typeOf(e);
  const ta = typeOf(a);
  if (te !== ta) { out.push({ path, kind: 'type', expected: e, actual: a }); return; }
  if (te === 'array') {
    if (e.length !== a.length) out.push({ path: path || '(racine)', kind: 'length', expected: e.length, actual: a.length });
    const n = Math.max(e.length, a.length);
    for (let i = 0; i < n && out.length < max; i++) walk(`${path}[${i}]`, e[i], a[i], out, max);
    return;
  }
  if (te === 'object') {
    const keys = new Set([...Object.keys(e), ...Object.keys(a)]);
    for (const k of keys) {
      if (out.length >= max) break;
      walk(path ? `${path}.${k}` : k, e[k], a[k], out, max);
    }
    return;
  }
  // primitif
  if (!Object.is(e, a) && !(typeof e === 'number' && Number.isNaN(e) && Number.isNaN(a))) {
    out.push({ path, kind: 'value', expected: e, actual: a });
  }
}

/**
 * Décrit les différences entre `expected` et `actual`.
 * @returns {Array<{path:string, kind:'value'|'type'|'length', expected:any, actual:any}>}
 */
export function describeDiff(expected, actual, maxItems = 12) {
  const out = [];
  walk('', expected, actual, out, maxItems);
  return out.slice(0, maxItems);
}
