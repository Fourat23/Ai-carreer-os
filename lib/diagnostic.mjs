// V76 · CP6 — LE DIAGNOSTIC PÉDAGOGIQUE. Module PUR.
//
// ── LE DÉFAUT MESURÉ AU CP0 ─────────────────────────────────────────────
//
// Le produit sait deux choses qu'il ne relie jamais :
//
//   · le RETOUR TECHNIQUE — « le test attendait "C", tu as obtenu "F" » ;
//   · la REMÉDIATION — un échelon d'aide calculé sur le **nombre** de tentatives.
//
// Entre les deux, rien. L'échelle d'aide monte parce qu'on a échoué trois fois,
// jamais parce qu'on échoue *de cette manière-là*. La route jetait d'ailleurs
// l'information : elle transmettait `{ name }` pour chaque test échoué, et
// laissait tomber `expected` et `received`.
//
// ── CE QUE CE MODULE FAIT, ET CE QU'IL REFUSE DE FAIRE ──────────────────
//
// Il transforme un `TEST_RESULT` en `DIAGNOSTIC` au sens du contrat gelé (§1.8) :
// **un fait OBSERVÉ, déductible sans supposer l'intention**.
//
// Et il s'arrête là. Le contrat est explicite :
//
//   > Si le test ne permet pas de déduire un symptôme, le produit ne doit pas en
//   > fabriquer un — un repli honnête est exigé.
//
// D'où `classe: 'INDETERMINE'`, qui n'est pas un échec du module mais une
// réponse : *« ce test ne dit pas ce qui ne va pas »*. Inventer une piste à
// partir de rien serait pire qu'un silence, parce que l'apprenant la suivrait.
import { describeDiff } from './test-diff.mjs';

/**
 * ── LES CLASSES DE SYMPTÔME ──────────────────────────────────────────────
 *
 * Elles décrivent **la forme de l'écart**, pas sa cause. « Ta boucle s'arrête
 * une itération trop tôt » serait une cause supposée ; « la valeur diffère à une
 * seule position, la dernière » est une observation.
 */
export const CLASSES = Object.freeze([
  'COMPILATION',      // le code n'a pas atteint l'exécution
  'ERREUR_LEVEE',     // une exception a interrompu le test
  'TYPE',             // la valeur reçue n'a pas le type attendu
  'CARDINALITE',      // même type, longueur différente
  'CAS_ISOLE',        // un seul cas échoue parmi plusieurs — OBSERVÉ, pas interprété
  'VALEUR',           // écart de valeur, sans motif plus précis
  'RIEN_NE_PASSE',    // aucun test public ne passe
  'INDETERMINE',      // le test ne permet pas de déduire un symptôme
]);

/** Vrai si le résultat de test porte de quoi observer quelque chose. */
function observable(t) {
  return t && (t.expected !== undefined || t.received !== undefined || t.actual !== undefined);
}

const recu = (t) => (t?.received !== undefined ? t.received : t?.actual);

/**
 * ── UNE VALEUR QUI APPREND QUELQUE CHOSE ────────────────────────────────
 *
 * Deuxième moitié de l'anomalie n° 5. Les tests de DOM (`selector-exists`,
 * `element-count`…) publient des sentinelles : `expected: null`, `received:
 * false`. « Attend null et reçoit false » est syntaxiquement vrai et
 * pédagogiquement vide — et pire, ça a **l'air** d'un diagnostic.
 *
 * Le prédicat est défini ici, avant toute branche, parce qu'il doit s'appliquer
 * PARTOUT : la première version ne le posait qu'en fin de cascade, et la phrase
 * vide ressortait par la branche « aucun test ne passe ».
 */
const informative = (v) => !(v === null || v === undefined || typeof v === 'boolean');

/**
 * ── UN CAS ISOLÉ — ET POURQUOI CE N'EST PAS « UNE BORNE » ────────────────
 *
 * ANOMALIE DE SONDE V76 n° 5, corrigée ici, et c'est la plus instructive du CP6.
 *
 * La première version de ce module nommait ce motif `BORNE` et affirmait :
 * *« Un seul cas échoue, et c'est celui de la limite. Relis la comparaison à
 * cette valeur précise. »* Sur `py-debug-grades`, c'était juste — le bug EST un
 * `>` écrit pour un `>=`. Sur `react-counter`, la même phrase est apparue pour
 * un compteur qui **démarre à 0 au lieu de 7** : il n'y a aucune borne, et la
 * piste envoyait l'apprenant relire une comparaison qui n'existe pas.
 *
 * **Le module violait la règle qu'il existe pour appliquer** : ne pas fabriquer
 * un diagnostic que le test ne permet pas de déduire. Un seul échec parmi
 * plusieurs est une OBSERVATION vraie ; « c'est une borne » est une
 * INTERPRÉTATION que rien dans le résultat de test ne soutient — les arguments
 * du cas ne quittent pas le serveur.
 *
 * La classe dit donc maintenant ce qu'on voit, et rien de plus.
 */
function estUnCasIsole(publics) {
  const echoues = publics.filter((t) => !t.passed);
  if (echoues.length !== 1 || publics.length < 3) return false;
  const t = echoues[0];
  if (!observable(t)) return false;
  const e = t.expected; const r = recu(t);
  return (typeof e !== 'object' || e === null) && (typeof r !== 'object' || r === null);
}

/**
 * ── LE DIAGNOSTIC ────────────────────────────────────────────────────────
 *
 * @param resultatsPublics  résultats des tests PUBLICS uniquement — un
 *                          diagnostic tiré d'un test privé révélerait son
 *                          attendu, et l'anti-fuite prime.
 * @param compilation       diagnostics de compilation, s'il y en a
 * @param phase             `compile` · `run` · `test` · `timeout`
 * @returns {{classe:string, observation:string, chemins:Array, testId:string|null, sur:string|null}}
 */
export function diagnostiquer({ resultatsPublics = [], compilation = [], phase = 'test', erreur = null } = {}) {
  const rien = (classe, observation) => ({ classe, observation, chemins: [], testId: null, sur: null });

  // ── Le code n'a pas tourné : l'échec ne dit rien de la NOTION ──
  if (phase === 'compile' || compilation.length > 0) {
    const d = compilation[0] ?? {};
    const ligne = Number.isFinite(d.line) ? ` (ligne ${d.line})` : '';
    return {
      classe: 'COMPILATION',
      observation: `Le code n’a pas pu être compilé${ligne} : ${String(d.message ?? erreur ?? 'erreur signalée par l’outil').slice(0, 160)}`,
      chemins: [], testId: null, sur: d.file ?? null,
    };
  }
  if (phase === 'timeout') {
    return rien('ERREUR_LEVEE', 'L’exécution a dépassé le délai : quelque chose ne se termine pas.');
  }

  const publics = Array.isArray(resultatsPublics) ? resultatsPublics : [];
  const echoues = publics.filter((t) => !t.passed);
  if (echoues.length === 0) return rien('INDETERMINE', 'Aucun test public en échec.');

  // ── Une exception a interrompu un test ──
  const leve = echoues.find((t) => typeof t.message === 'string' && /error|exception|traceback/i.test(t.message));
  if (leve && !observable(leve)) {
    return {
      classe: 'ERREUR_LEVEE',
      observation: `« ${leve.name} » s’est interrompu sur une erreur : ${String(leve.message).slice(0, 140)}`,
      chemins: [], testId: leve.id ?? leve.testId ?? null, sur: null,
    };
  }

  // ── Aucun test ne passe : le symptôme n'est pas un détail ──
  if (publics.length > 1 && echoues.length === publics.length) {
    // On ne cite un cas que s'il apprend quelque chose : sinon on constate, et
    // on s'arrête là.
    const t = echoues.find((x) => observable(x) && (informative(x.expected) || informative(recu(x))));
    return {
      classe: 'RIEN_NE_PASSE',
      observation: t
        ? `Aucun des ${publics.length} tests publics ne passe. Le premier attend ${fmt(t.expected)} et reçoit ${fmt(recu(t))}.`
        : `Aucun des ${publics.length} tests publics ne passe — ils vérifient des conditions (présence, nombre, état) sans publier de valeur comparable.`,
      chemins: t ? describeDiff(t.expected, recu(t), 6) : [],
      testId: t?.id ?? t?.testId ?? null, sur: null,
    };
  }

  const t = echoues.find(observable);
  // ── Le repli HONNÊTE : le test n'expose ni attendu ni reçu ──
  if (!t) {
    return {
      classe: 'INDETERMINE',
      observation: `« ${echoues[0].name} » échoue, mais ce test ne publie ni attendu ni reçu : le produit ne peut pas dire ce qui diffère.`,
      chemins: [], testId: echoues[0].id ?? echoues[0].testId ?? null, sur: null,
    };
  }

  // ── VALEURS NON INFORMATIVES (voir `informative`, plus haut) ──
  if (!informative(t.expected) && !informative(recu(t))) {
    return {
      classe: 'INDETERMINE',
      observation: `« ${t.name} » échoue, mais ce test vérifie une condition (présence, nombre, état) sans publier de valeur comparable.`,
      chemins: [], testId: t.id ?? t.testId ?? null, sur: null,
    };
  }

  const chemins = describeDiff(t.expected, recu(t), 8);
  const premier = chemins[0] ?? null;

  if (premier?.kind === 'type') {
    return {
      classe: 'TYPE',
      observation: `« ${t.name} » attend ${typeLisible(premier.expected)} et reçoit ${typeLisible(premier.actual)}.`,
      chemins, testId: t.id ?? t.testId ?? null, sur: premier.path || null,
    };
  }
  if (premier?.kind === 'length') {
    return {
      classe: 'CARDINALITE',
      observation: `« ${t.name} » attend ${premier.expected} élément(s) et en reçoit ${premier.actual}.`,
      chemins, testId: t.id ?? t.testId ?? null, sur: premier.path || null,
    };
  }
  if (estUnCasIsole(publics)) {
    return {
      classe: 'CAS_ISOLE',
      observation: `Un seul cas échoue sur ${publics.length} : « ${t.name} », qui attend ${fmt(t.expected)} et reçoit ${fmt(recu(t))}. `
        + 'Tous les autres passent.',
      chemins, testId: t.id ?? t.testId ?? null, sur: premier?.path || null,
    };
  }
  return {
    classe: 'VALEUR',
    observation: `« ${t.name} » attend ${fmt(t.expected)} et reçoit ${fmt(recu(t))}.`,
    chemins, testId: t.id ?? t.testId ?? null, sur: premier?.path || null,
  };
}

/** Une valeur, rendue lisible et BORNÉE — jamais un pavé dans un message. */
function fmt(v) {
  if (v === undefined) return '(rien)';
  if (typeof v === 'string') return `« ${v.length > 40 ? `${v.slice(0, 40)}…` : v} »`;
  try {
    const s = JSON.stringify(v);
    return s && s.length > 60 ? `${s.slice(0, 60)}…` : String(s);
  } catch { return String(v); }
}

function typeLisible(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'un tableau';
  const t = typeof v;
  return { string: 'du texte', number: 'un nombre', boolean: 'un booléen', object: 'un objet', undefined: 'rien' }[t] ?? t;
}

/**
 * ── LA PHRASE DONNÉE À L'APPRENANT ───────────────────────────────────────
 *
 * Elle décrit **ce qui est observé** et propose **où regarder**. Elle ne donne
 * ni la cause, ni le correctif : c'est le rôle des marches suivantes de
 * l'échelle, et la correction complète reste la dernière (contrat §1.10).
 */
export const PISTE_PAR_CLASSE = Object.freeze({
  COMPILATION: 'Corrige d’abord ce que l’outil signale : tant que le code ne compile pas, l’échec ne dit rien de la notion.',
  ERREUR_LEVEE: 'Le code s’arrête avant de produire un résultat. Cherche ce qui lève, pas ce qui est faux.',
  TYPE: 'Ce n’est pas la valeur qui diffère, c’est sa nature. Regarde ce que ta fonction renvoie réellement.',
  CARDINALITE: 'Le type est bon, la quantité non. Regarde ce qui est ajouté, ignoré ou compté en trop.',
  // La piste DÉCRIT la démarche, elle ne nomme pas la cause : un cas isolé peut
  // venir d'une borne, d'une initialisation, d'un cas particulier oublié. Le
  // produit ne sait pas lequel, et il ne fait pas semblant.
  CAS_ISOLE: 'Ce cas-là seul diffère des autres. Compare-le à un cas qui passe : ce qui les sépare est la piste.',
  VALEUR: 'Compare la valeur attendue et la valeur obtenue : l’écart te dit quelle étape du calcul dévie.',
  RIEN_NE_PASSE: 'Aucun cas ne passe : le problème est probablement en amont, dans la forme de ce que tu renvoies.',
  INDETERMINE: 'Ce test ne publie pas de quoi comparer. Relis la consigne et vérifie ce que la fonction doit renvoyer.',
});

/** Le diagnostic, prêt pour la surface : classe + observation + piste. */
export function lectureDuDiagnostic(d) {
  if (!d) return null;
  return {
    classe: d.classe,
    observation: d.observation,
    piste: PISTE_PAR_CLASSE[d.classe] ?? PISTE_PAR_CLASSE.INDETERMINE,
    /** `false` quand le produit refuse d'interpréter — et le dit. */
    exploitable: d.classe !== 'INDETERMINE',
    sur: d.sur ?? null,
    testId: d.testId ?? null,
  };
}
