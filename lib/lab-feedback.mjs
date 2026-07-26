// Séparation PURE des résultats de tests publics / privés — anti-fuite.
// Les tests PRIVÉS ne doivent jamais quitter le serveur en détail : on n'expose
// que les résultats publics (nom, attendu, reçu, message, durée) et un AGRÉGAT
// privé (total / réussis), jamais le nom, l'attendu, le reçu, le message ni la
// durée d'un test privé. La note globale (passed/total/allPassed) reste calculée
// sur l'ensemble en amont (pour la preuve de compétence).

/**
 * @param {{results?: Array<{testId:string, passed:boolean}>}} attempt
 * @param {Set<string>|Iterable<string>} privateIds
 * @returns {{ publicResults: Array<object>, privateSummary: {total:number, passed:number}|null }}
 */
export function splitAttempt(attempt, privateIds) {
  const set = privateIds instanceof Set ? privateIds : new Set(privateIds || []);
  const results = Array.isArray(attempt?.results) ? attempt.results : [];
  const publicResults = results.filter((r) => !set.has(r.testId));
  const privateResults = results.filter((r) => set.has(r.testId));
  const privateSummary = privateResults.length
    ? { total: privateResults.length, passed: privateResults.filter((r) => r.passed).length }
    : null;
  return { publicResults, privateSummary };
}
