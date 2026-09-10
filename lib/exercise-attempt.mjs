// V74 · CP2 — `ExerciseAttempt` : LE FAIT QUI MANQUAIT.
//
// ── POURQUOI CE FAIT EXISTE ──────────────────────────────────────────────
//
// Le CP0 a établi que le produit n'a jamais observé un échec. La cause n'est
// pas un oubli d'écriture : c'est un choix d'objet. Quand un exercice passe,
// `app/api/lab/[exerciseId]/route.ts` écrit une PREUVE et une soumission —
// deux objets DÉRIVÉS d'un événement qui, lui, n'est jamais persisté : la
// tentative. Quand l'exercice échoue, il n'y a pas de projection à écrire,
// donc rien n'est écrit du tout.
//
// Autrement dit : **le système persistait la projection et jetait le fait.**
//
// Une tentative d'exercice a les trois propriétés d'un fait canonique :
//   1. elle est OBSERVÉE, pas déclarée — des tests s'exécutent en bac à sable ;
//   2. elle est datée et NON RÉVISABLE — on ne corrige pas une tentative passée ;
//   3. tout le reste s'en dérive — preuve, compétence, série, échéance.
//
// C'est le SEUL événement du produit portant un verdict OBJECTIF. Ne pas le
// persister privait le moteur de rétention de sa meilleure source au profit
// d'auto-déclarations.
//
// ── CE QUE CE MODULE NE FAIT PAS ─────────────────────────────────────────
//
// Aucune I/O, aucune horloge, aucun aléa. Il normalise, déduplique, et refuse.
// Refuser franchement vaut mieux que réparer en silence : une tentative mal
// formée ne doit pas peser sur un état de rétention.
//
// Contrat gelé : docs/v74/V74-RETENTION-CONTRACT-FROZEN.md §3.2 et §3.6.

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/** Issues d'une tentative d'exercice. Dérivées de passed/total, écrites pour lisibilité. */
export const EXERCISE_OUTCOMES = ['success', 'partial', 'failure'];

/**
 * Phase atteinte par la tentative. Elle distingue un échec de RAISONNEMENT
 * (`run` : les tests ont tourné et n'ont pas tous passé) d'un échec
 * d'OUTILLAGE (`compile`, `timeout`). Le contrat §3.4 exige `phase === 'run'`
 * pour qu'une tentative puisse valoir récupération : un code qui ne compile
 * pas ne dit rien de ce dont l'apprenant se souvient.
 */
export const EXERCISE_PHASES = ['run', 'compile', 'timeout'];

const OUTCOME_SET = new Set(EXERCISE_OUTCOMES);
const PHASE_SET = new Set(EXERCISE_PHASES);

/** Borne dure, alignée sur `MAX_RECALL_ATTEMPTS`. Au-delà : on garde les plus RÉCENTES. */
export const MAX_EXERCISE_ATTEMPTS = 20000;

const int = (v, min, max) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

/**
 * Issue DÉRIVÉE de passed/total — jamais fournie par l'appelant.
 *
 * La règle est celle du §1.6 du contrat : `passed === total` → succès ;
 * `0 < passed < total` → partiel ; `passed === 0` → échec. Une tentative qui
 * n'a pas atteint la phase `run` est un échec quelle que soit la valeur de
 * `passed`, qui vaut alors 0 par construction.
 */
export function outcomeOf(passed, total) {
  if (passed >= total) return 'success';
  if (passed > 0) return 'partial';
  return 'failure';
}

/**
 * CLÉ MÉTIER, gelée au §3.6 : `exerciseId` + horodatage tronqué à la SECONDE
 * + `passed/total`.
 *
 * La troncature à la seconde est ce qui rend l'écriture idempotente sans
 * inventer d'identifiant : un double-clic, un rejeu réseau ou une double
 * soumission produisent la même clé et donc le même fait. Deux tentatives
 * réellement distinctes séparées de moins d'une seconde seraient fusionnées —
 * c'est assumé : un humain ne résout pas deux exercices en une seconde, et
 * confondre deux rejeux est plus grave que de perdre un cas impossible.
 */
export function attemptKey(a) {
  return `${a.exerciseId}|${String(a.at).slice(0, 19)}|${a.passed}/${a.total}`;
}

/**
 * Une tentative valide, ou `null`.
 *
 * `provenance.producer` est OBLIGATOIRE (§3.6) : un fait sans producteur est
 * refusé, jamais réparé en silence. C'est ce qui permettra plus tard de
 * distinguer une tentative du laboratoire d'une tentative importée.
 */
export function normalizeExerciseAttempt(raw) {
  if (!isObj(raw)) return null;
  const exerciseId = typeof raw.exerciseId === 'string' ? raw.exerciseId.trim().slice(0, 120) : '';
  if (!exerciseId) return null;

  const at = typeof raw.at === 'string' && !Number.isNaN(Date.parse(raw.at)) ? raw.at : null;
  if (!at) return null;

  const total = int(raw.total, 1, 10000);
  if (total === null) return null;
  const passed = int(raw.passed, 0, total);
  if (passed === null) return null;

  const phase = PHASE_SET.has(raw.phase) ? raw.phase : 'run';
  // L'issue est DÉRIVÉE. Si l'appelant en fournit une qui contredit les
  // compteurs, c'est l'appelant qui a tort : les compteurs sont le fait.
  const outcome = phase === 'run' ? outcomeOf(passed, total) : 'failure';

  const p = isObj(raw.provenance) ? raw.provenance : {};
  const producer = typeof p.producer === 'string' ? p.producer.trim().slice(0, 60) : '';
  if (!producer) return null;

  return {
    exerciseId,
    at,
    passed,
    total,
    allPassed: passed === total && phase === 'run',
    outcome,
    phase,
    durationMs: int(raw.durationMs, 0, 86_400_000) ?? 0,
    dayRefs: Array.isArray(raw.dayRefs)
      ? [...new Set(raw.dayRefs.filter((d) => Number.isInteger(d) && d >= 1 && d <= 365))].sort((a, b) => a - b)
      : [],
    // ── LE CHAMP DÉCISIF ──
    // Sans lui, la condition R-b du contrat (« la correction n'a pas été
    // ouverte avant ») serait décorative, et on ne pourrait pas distinguer une
    // récupération d'une recopie. Il vaut `true` par défaut : en l'absence
    // d'information, on suppose que la correction a pu être vue, donc on
    // REFUSE de compter la tentative comme récupération. Le doute joue contre
    // le compteur, jamais en sa faveur.
    correctionSeen: raw.correctionSeen === false ? false : true,
    provenance: {
      producer,
      method: typeof p.method === 'string' ? p.method.slice(0, 80) : '',
    },
  };
}

/**
 * Liste normalisée, DÉDUPLIQUÉE par clé métier, triée par date puis par
 * exercice. Le tri à la lecture est ce qui rend toute projection indépendante
 * de l'ordre d'insertion — donc rejouable (critère bloquant B1).
 */
export function normalizeExerciseAttempts(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of list.slice(-MAX_EXERCISE_ATTEMPTS)) {
    const a = normalizeExerciseAttempt(raw);
    if (!a) continue;
    const k = attemptKey(a);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(a);
  }
  out.sort((x, y) => (x.at === y.at ? x.exerciseId.localeCompare(y.exerciseId) : x.at.localeCompare(y.at)));
  return out;
}
