// Indices pédagogiques STATIQUES pour les diagnostics TypeScript courants — PUR.
// Aucune IA, aucun appel réseau : une simple table code → conseil (français).
// Objectif : aider l'apprenant à comprendre un diagnostic sans donner la réponse.

const HINTS = {
  // Erreurs de type
  2322: 'Type incompatible : la valeur ne correspond pas au type attendu. Vérifie le type de retour ou d’assignation.',
  2345: 'Argument de type incompatible : le type passé ne correspond pas au paramètre attendu par la fonction.',
  2366: 'Toutes les branches ne renvoient pas de valeur : assure-toi qu’un `return` couvre chaque cas.',
  2367: 'Cette comparaison est toujours vraie ou toujours fausse : les types comparés ne se recoupent pas.',
  2554: 'Nombre d’arguments incorrect : vérifie la signature (paramètres requis vs fournis).',
  2555: 'Nombre d’arguments insuffisant : un paramètre requis manque.',
  // Noms / modules
  2304: 'Nom introuvable : vérifie l’orthographe, et que la variable ou fonction est bien déclarée (et importée si besoin).',
  2307: 'Module introuvable : dans le Lab, seuls les imports relatifs vers un autre fichier de l’exercice sont autorisés (ex. `./util`).',
  2339: 'Propriété inexistante sur ce type : vérifie le nom de la propriété ou le type de l’objet.',
  2551: 'Propriété inexistante (faute de frappe ?) : TypeScript propose parfois un nom proche.',
  // any implicite / strict
  7006: 'Paramètre au type implicite « any » : ajoute une annotation de type explicite (mode strict).',
  7005: 'Variable au type implicite « any » : donne-lui un type explicite.',
  7031: 'Élément déstructuré au type implicite « any » : type l’objet source ou l’élément.',
  // null / undefined
  2531: 'La valeur peut être `null` : vérifie sa présence avant de l’utiliser (garde `if` ou opérateur `?.`).',
  2532: 'La valeur peut être `undefined` : vérifie sa présence avant d’accéder à ses membres.',
  18047: 'La valeur peut être `null` : ajoute une garde ou l’opérateur de coalescence `??`.',
  18048: 'La valeur peut être `undefined` : ajoute une garde ou une valeur par défaut.',
  // Syntaxe
  1005: 'Erreur de syntaxe : un symbole attendu manque (souvent `)`, `}` ou `;`).',
  1109: 'Erreur de syntaxe : une expression est attendue ici.',
  1128: 'Erreur de syntaxe : déclaration ou instruction attendue (accolade mal fermée ?).',
  1002: 'Chaîne de caractères non terminée : vérifie les guillemets.',
  // Diagnostics internes du Lab
  LAB_IMPORT: 'Import interdit : seuls les imports relatifs vers un autre fichier de cet exercice sont permis (pas de package externe, chemin absolu ni URL).',
  LAB_REFERENCE: 'Les directives triple-slash (/// <reference … />) ne sont pas autorisées dans le Lab.',
  LAB_BINARY: 'Ce fichier semble binaire : seul du texte source est accepté.',
  LAB_NO_TS: 'Aucun fichier TypeScript à compiler : l’exercice doit contenir au moins un fichier .ts.',
};

/**
 * Renvoie un indice statique pour un code de diagnostic, ou null si inconnu.
 * @param {number|string} code
 * @returns {string|null}
 */
export function hintForDiagnostic(code) {
  if (code === null || code === undefined) return null;
  return Object.hasOwn(HINTS, code) ? HINTS[code] : null;
}

/** Vrai s'il existe un indice pour ce code. */
export function hasHint(code) {
  return hintForDiagnostic(code) !== null;
}
