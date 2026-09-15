// V76 · CP10 — LE JOURNAL D'UNE TENTATIVE. Module PUR.
//
// ── CE QUI EXISTAIT, ET POURQUOI ÇA NE SUFFIT PAS ───────────────────────
//
// Le fait `ExerciseAttempt` (V74 · CP2) est complet pour ce qu'il doit faire :
// il dit QUAND, COMBIEN de tests sont passés sur COMBIEN, en quelle phase, en
// combien de temps, et si la correction avait été ouverte. C'est la source du
// moteur de rétention, et il ne faut pas y toucher.
//
// Mais « 3/5 » puis « 4/5 » ne dit pas **lequel** est passé au vert, et deux
// compteurs ne se comparent pas ligne à ligne. Pour répondre à *« qu'est-ce que
// j'ai changé, et qu'est-ce que ça a changé ? »*, il faut ce que le fait
// n'a pas : **les résultats par test, les aides lues, et le code soumis**.
//
// ── POURQUOI UN JOURNAL SÉPARÉ, ET PAS UN CHAMP DE PLUS ─────────────────
//
// Trois raisons, dans l'ordre d'importance :
//
//   1. **le fait reste le fait.** `ExerciseAttempt` est gelé au contrat V74
//      §3.2 et alimente la rétention. Y ajouter du code source changerait la
//      nature de l'objet — un fait est petit, non révisable et rejouable ;
//   2. **la taille.** 20 000 tentatives × un espace de travail = un fichier de
//      progression inutilisable. Le journal est borné, et il est **séparé**
//      pour que sa borne ne dépende pas de celle du fait ;
//   3. **le journal peut disparaître sans rien casser.** Perdre le code d'une
//      vieille tentative fait perdre une comparaison, jamais une preuve.
//
// Conséquence directe : **le journal ne fait jamais autorité**. Les compteurs
// affichés viennent du fait. Le journal n'ajoute que ce que le fait ne porte
// pas, et une entrée manquante se dit « non conservé », jamais « zéro ».
//
// ── CE QUE LE JOURNAL NE CONTIENT JAMAIS ────────────────────────────────
//
// Ni test privé (nom, attendu, reçu), ni fichier caché, ni correction de
// référence. Le CP0 a mesuré que l'anti-fuite du laboratoire tient ; un journal
// qui archiverait les résultats complets le contournerait par la porte de
// derrière — et un contournement qui passe par une fonctionnalité de confort
// est exactement le genre qu'on ne voit pas venir.

/** Nombre d'entrées conservées par exercice. Au-delà : les plus anciennes partent. */
export const MAX_ENTREES = 12;
/** Octets conservés par exercice, code compris. Borne dure, vérifiée par une sonde. */
export const MAX_OCTETS = 300_000;
/** Octets conservés par fichier dans une entrée. Au-delà, le fichier est tronqué et le dit. */
export const MAX_OCTETS_FICHIER = 40_000;

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const str = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');

/**
 * La clé qui relie une entrée de journal à son fait. **La même que
 * `attemptKey`** (V74 §3.6) : `exerciseId | horodatage à la seconde |
 * passed/total`. Deux rejeux du même lancement produisent la même clé, donc une
 * seule entrée — comme pour le fait.
 */
export function cleDeJournal({ exerciseId, at, passed, total }) {
  return `${exerciseId}|${String(at).slice(0, 19)}|${passed}/${total}`;
}

/**
 * Construit l'entrée qui accompagne une tentative.
 *
 * @param at          horodatage SERVEUR de la tentative (le même que le fait)
 * @param resultats   résultats des tests **PUBLICS uniquement**
 * @param fichiers    les fichiers ÉDITABLES soumis (jamais les cachés)
 * @param aides       les marches d'aide consultées avant cette tentative
 */
export function entreeDeJournal({ exerciseId, at, passed, total, phase, durationMs, resultats, fichiers, aides } = {}) {
  if (typeof exerciseId !== 'string' || !exerciseId) return null;
  if (typeof at !== 'string' || Number.isNaN(Date.parse(at))) return null;
  const t = Number(total); const p = Number(passed);
  if (!Number.isInteger(t) || t < 0 || !Number.isInteger(p) || p < 0) return null;

  const tests = (Array.isArray(resultats) ? resultats : [])
    .filter(isObj)
    .map((r) => ({
      // `id` suffit à apparier deux tentatives ; `name` sert à l'afficher.
      //
      // Le produit nomme ce champ `testId` dans un résultat de test
      // (`lib/exercise.mjs`) et `id` dans un descripteur de test. Ne lire que
      // `id` filtrait SILENCIEUSEMENT tous les résultats : le journal se
      // remplissait de tableaux `tests` vides et la comparaison ne pouvait
      // nommer aucun test. La sonde `H11` l'a attrapé ; aucun test unitaire ne
      // l'aurait fait, parce que mes fixtures utilisaient déjà `id`.
      id: str(r.id, 120) || str(r.testId, 120),
      name: str(r.name, 200),
      passed: r.passed === true,
    }))
    .filter((r) => r.id);

  const files = {};
  for (const [chemin, contenu] of Object.entries(isObj(fichiers) ? fichiers : {})) {
    if (typeof chemin !== 'string' || !chemin) continue;
    const c = String(contenu ?? '');
    files[chemin.slice(0, 200)] = c.length > MAX_OCTETS_FICHIER
      // Tronquer en le DISANT : un diff calculé sur un fichier amputé en
      // silence inventerait des suppressions qui n'ont pas eu lieu.
      ? `${c.slice(0, MAX_OCTETS_FICHIER)}\n/* … tronqué : fichier trop long pour le journal … */\n`
      : c;
  }

  return {
    cle: cleDeJournal({ exerciseId, at, passed: p, total: t }),
    at,
    passed: p,
    total: t,
    phase: ['run', 'compile', 'timeout'].includes(phase) ? phase : 'run',
    durationMs: Number.isFinite(Number(durationMs)) ? Math.max(0, Math.trunc(Number(durationMs))) : 0,
    tests,
    files,
    /** Les marches d'aide lues AVANT cette tentative, dans l'ordre. */
    aides: [...new Set((Array.isArray(aides) ? aides : []).filter((a) => typeof a === 'string' && a))],
    schemaVersion: 1,
  };
}

/**
 * Ajoute une entrée et **borne le journal**, dans cet ordre : par nombre, puis
 * par octets. Les plus anciennes partent en premier.
 *
 * La borne par octets ne se contente pas de compter les entrées : une seule
 * tentative sur un exercice multi-fichier peut peser plus que dix sur un
 * exercice d'une ligne. C'est la borne qui compte réellement.
 */
export function ajouterAuJournal(journal, entree, { maxEntrees = MAX_ENTREES, maxOctets = MAX_OCTETS } = {}) {
  if (!entree) return Array.isArray(journal) ? journal : [];
  const base = (Array.isArray(journal) ? journal : []).filter((e) => isObj(e) && e.cle !== entree.cle);
  let out = [...base, entree].sort((a, b) => String(a.at).localeCompare(String(b.at)));
  if (out.length > maxEntrees) out = out.slice(-maxEntrees);
  // On retire par le début tant que ça dépasse — mais jamais la dernière : une
  // tentative qui dépasse à elle seule la borne reste consultable, sinon le
  // journal serait vide précisément sur l'exercice le plus lourd.
  while (out.length > 1 && JSON.stringify(out).length > maxOctets) out = out.slice(1);
  return out;
}

/**
 * ── LA VUE SERVIE À L'APPRENANT ──────────────────────────────────────────
 *
 * Fusionne le FAIT (qui fait autorité) et le JOURNAL (qui complète), du plus
 * récent au plus ancien.
 *
 * Une tentative sans entrée de journal n'est pas cachée : elle est servie avec
 * `conserve: false`. Masquer une tentative parce qu'on n'a plus son code
 * réécrirait l'histoire pour faire joli.
 */
export function vueDeLHistorique(faits, journal, { max = MAX_ENTREES } = {}) {
  const parCle = new Map((Array.isArray(journal) ? journal : []).filter(isObj).map((e) => [e.cle, e]));
  const out = [];
  for (const f of (Array.isArray(faits) ? faits : []).filter(isObj)) {
    const cle = cleDeJournal(f);
    const j = parCle.get(cle);
    out.push({
      cle,
      at: f.at,
      passed: f.passed,
      total: f.total,
      allPassed: f.allPassed === true,
      outcome: f.outcome ?? null,
      phase: f.phase ?? 'run',
      durationMs: f.durationMs ?? 0,
      /** `false` quand le journal ne porte plus cette tentative : dit, pas caché. */
      conserve: !!j,
      tests: j?.tests ?? [],
      aides: j?.aides ?? [],
      fichiers: j ? Object.keys(j.files ?? {}) : [],
    });
  }
  out.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  return out.slice(0, max);
}
