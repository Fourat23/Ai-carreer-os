// V76 · CP10 — COMPARER DEUX TENTATIVES. Module PUR.
//
// ── LA QUESTION À LAQUELLE CE MODULE RÉPOND ─────────────────────────────
//
//   *« Qu'est-ce que j'ai changé, et qu'est-ce que ça a changé ? »*
//
// C'est la seule question qu'un historique d'exercice doit savoir traiter. Un
// apprenant qui passe de `3/5` à `4/5` sans savoir lequel des cinq a basculé
// apprend le score, pas la cause. Et le brief est explicite sur la limite :
//
//   > « Afficher : outcome, tests, aides, timestamp, diff pertinent.
//   >   **Pas un Git clone.** »
//
// Pas de branches, pas de fusion, pas de restauration, pas de blâme ligne à
// ligne, pas d'historique de l'historique. **Deux tentatives, côte à côte.**
//
// ── CE QUE « PERTINENT » VEUT DIRE ICI ──────────────────────────────────
//
// Un diff qui rend 400 lignes identiques n'aide personne : il faut chercher le
// changement dedans, ce qui est exactement le travail qu'on voulait éviter. Le
// diff rendu ne contient donc que les **passages qui changent**, avec quelques
// lignes de contexte autour, et **les fichiers qui n'ont pas bougé sont dits
// inchangés plutôt que rendus**.

/** Lignes de contexte gardées autour d'un passage modifié. */
export const CONTEXTE = 2;
/** Nombre maximal de lignes rendues par fichier. Au-delà, le diff est tronqué et le dit. */
export const MAX_LIGNES = 400;

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const lignesDe = (s) => String(s ?? '').split('\n');

/**
 * ── LES TESTS QUI ONT CHANGÉ D'ÉTAT ──────────────────────────────────────
 *
 * Quatre catégories, et la quatrième compte autant que les autres :
 *
 *   · `reussis`   — rouge → vert : ce que le changement a réparé ;
 *   · `casses`    — vert → rouge : **ce qu'il a cassé au passage** ;
 *   · `toujoursKO`— rouge des deux côtés : ce qui reste à faire ;
 *   · `inchanges` — vert des deux côtés : le socle qui n'a pas bougé.
 *
 * `casses` est la catégorie utile et celle qu'on oublie : un apprenant qui
 * répare un test en cassant un autre voit son score stagner et croit n'avoir
 * rien fait.
 */
export function testsQuiOntChange(avant, apres) {
  const a = new Map((Array.isArray(avant) ? avant : []).filter(isObj).map((t) => [t.id, t]));
  const b = new Map((Array.isArray(apres) ? apres : []).filter(isObj).map((t) => [t.id, t]));
  const reussis = []; const casses = []; const toujoursKO = []; const inchanges = [];
  for (const [id, t] of b) {
    const av = a.get(id);
    const nom = t.name || id;
    // Un test absent de la tentative précédente n'est ni réparé ni cassé : on
    // ne sait pas d'où il vient. Il rejoint l'état où il se trouve.
    if (!av) { (t.passed ? inchanges : toujoursKO).push(nom); continue; }
    if (t.passed && !av.passed) reussis.push(nom);
    else if (!t.passed && av.passed) casses.push(nom);
    else if (!t.passed) toujoursKO.push(nom);
    else inchanges.push(nom);
  }
  return { reussis, casses, toujoursKO, inchanges };
}

/**
 * Plus longue sous-séquence commune, en table. Suffisant et prévisible pour des
 * fichiers d'exercice (quelques dizaines à quelques centaines de lignes) —
 * au-delà, `MAX_LIGNES` tronque avant que la table ne coûte quoi que ce soit.
 */
function sousSequenceCommune(a, b) {
  const n = a.length; const m = b.length;
  const t = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
    }
  }
  const out = [];
  let i = 0; let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ type: '=', texte: a[i], avant: i + 1, apres: j + 1 }); i += 1; j += 1; }
    else if (t[i + 1][j] >= t[i][j + 1]) { out.push({ type: '-', texte: a[i], avant: i + 1, apres: null }); i += 1; }
    else { out.push({ type: '+', texte: b[j], avant: null, apres: j + 1 }); j += 1; }
  }
  while (i < n) { out.push({ type: '-', texte: a[i], avant: i + 1, apres: null }); i += 1; }
  while (j < m) { out.push({ type: '+', texte: b[j], avant: null, apres: j + 1 }); j += 1; }
  return out;
}

/**
 * Diff d'un fichier, réduit à ses passages modifiés.
 *
 * @returns {{ identique:boolean, lignes:Array, ajoutees:number, retirees:number, tronque:boolean }}
 */
export function diffDeFichier(avant, apres, { contexte = CONTEXTE, maxLignes = MAX_LIGNES } = {}) {
  if (String(avant ?? '') === String(apres ?? '')) {
    return { identique: true, lignes: [], ajoutees: 0, retirees: 0, tronque: false };
  }
  const brut = sousSequenceCommune(lignesDe(avant), lignesDe(apres));
  const garder = new Array(brut.length).fill(false);
  brut.forEach((l, i) => {
    if (l.type === '=') return;
    for (let k = Math.max(0, i - contexte); k <= Math.min(brut.length - 1, i + contexte); k += 1) garder[k] = true;
  });
  const lignes = [];
  let saut = false;
  brut.forEach((l, i) => {
    if (garder[i]) {
      // Une coupure est ANNONCÉE : sans elle, deux passages éloignés paraissent
      // contigus et le numéro de ligne devient un piège.
      if (saut && lignes.length) lignes.push({ type: '…', texte: '', avant: null, apres: null });
      saut = false;
      lignes.push(l);
    } else saut = true;
  });
  const tronque = lignes.length > maxLignes;
  return {
    identique: false,
    lignes: tronque ? lignes.slice(0, maxLignes) : lignes,
    ajoutees: brut.filter((l) => l.type === '+').length,
    retirees: brut.filter((l) => l.type === '-').length,
    tronque,
  };
}

/**
 * ── LA COMPARAISON COMPLÈTE ──────────────────────────────────────────────
 *
 * @param a  l'entrée de journal la plus ANCIENNE
 * @param b  la plus RÉCENTE
 * @param aidesEntre  les marches d'aide consultées ENTRE les deux
 *
 * `lisible` est `false` quand l'une des deux tentatives n'a plus son journal :
 * on le dit, au lieu de rendre une comparaison vide qui ressemblerait à
 * « rien n'a changé ».
 */
export function comparerTentatives(a, b, { aidesEntre = [] } = {}) {
  if (!isObj(a) || !isObj(b)) {
    return { lisible: false, raison: 'Une des deux tentatives n’est plus conservée dans le journal.' };
  }
  const chemins = [...new Set([...Object.keys(a.files ?? {}), ...Object.keys(b.files ?? {})])].sort();
  const fichiers = chemins.map((chemin) => ({
    chemin,
    ...diffDeFichier((a.files ?? {})[chemin], (b.files ?? {})[chemin]),
  }));
  const tests = testsQuiOntChange(a.tests, b.tests);
  const modifies = fichiers.filter((f) => !f.identique);

  return {
    lisible: true,
    de: { at: a.at, passed: a.passed, total: a.total, durationMs: a.durationMs },
    vers: { at: b.at, passed: b.passed, total: b.total, durationMs: b.durationMs },
    /** Le score a-t-il bougé, et dans quel sens ? */
    ecart: (b.passed ?? 0) - (a.passed ?? 0),
    tests,
    fichiers,
    fichiersModifies: modifies.map((f) => f.chemin),
    aidesEntre: [...new Set(aidesEntre.filter((x) => typeof x === 'string' && x))],
    lecture: lectureDeLaComparaison({ tests, modifies, a, b }),
  };
}

/**
 * Une phrase en français qui décrit, sans juger et **sans donner la réponse**.
 * Même discipline qu'au CP6 : on nomme ce qu'on observe, jamais ce qu'il faut
 * écrire.
 */
function lectureDeLaComparaison({ tests, modifies, a, b }) {
  const morceaux = [];
  if (!modifies.length) {
    morceaux.push('Le code est identique entre ces deux lancements.');
  } else {
    const n = modifies.length;
    morceaux.push(`${n} fichier${n > 1 ? 's' : ''} modifié${n > 1 ? 's' : ''} : ${modifies.map((f) => f.chemin).join(', ')}.`);
  }
  if (tests.reussis.length) {
    morceaux.push(`${tests.reussis.length} test${tests.reussis.length > 1 ? 's' : ''} passé${tests.reussis.length > 1 ? 's' : ''} au vert : ${tests.reussis.join(', ')}.`);
  }
  // Dit en second, et jamais omis : c'est l'information qui explique un score
  // qui stagne alors que quelque chose a bel et bien été réparé.
  if (tests.casses.length) {
    morceaux.push(`${tests.casses.length} test${tests.casses.length > 1 ? 's' : ''} qui passai${tests.casses.length > 1 ? 'ent' : 't'} ne passe${tests.casses.length > 1 ? 'nt' : ''} plus : ${tests.casses.join(', ')}.`);
  }
  if (!tests.reussis.length && !tests.casses.length && modifies.length) {
    morceaux.push('Aucun test n’a changé d’état.');
  }
  if ((a?.passed ?? 0) === (b?.passed ?? 0) && (tests.reussis.length || tests.casses.length)) {
    morceaux.push('Le score est le même des deux côtés, mais ce ne sont pas les mêmes tests.');
  }
  return morceaux.join(' ');
}
