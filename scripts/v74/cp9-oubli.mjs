// V74 · CP9 — MODÈLES D'OUBLI : UNE ÉTUDE, PAS UN MOTEUR.
//
// ── POURQUOI CE FICHIER EST DANS `scripts/` ET NON DANS `lib/` ───────────
//
// Deux raisons, et aucune n'est un contournement.
//
// 1. **Le brief interdit le quatrième moteur.** Livrer cinq modèles
//    d'espacement dans `lib/` ferait exactement cela — cinq échelles
//    concurrentes, sans arbitre. Le CP9 demande de COMPARER des candidats et de
//    DOCUMENTER, pas de tous les embarquer.
// 2. **La règle C11 de `v651:check` l'interdirait, et elle aurait raison.**
//    Elle vérifie qu'aucun fichier de `lib/` hors `review.mjs` et
//    `retention.mjs` ne définit sa propre échelle d'espacement — tableau
//    d'intervalles, facteur de facilité, arithmétique SM-2. Les candidats
//    ci-dessous en contiennent par construction. Le bon endroit pour une étude
//    est l'étude, pas la bibliothèque du produit.
//
// Si un candidat devait un jour être adopté, il remplacerait l'échelle DANS
// `lib/retention.mjs`, à qui le §4 du contrat gelé confie cette responsabilité.
// Aucun n'est adopté ici : voir la conclusion du rapport.
//
// ── CE QUE CE FICHIER NE PRODUIT PAS ─────────────────────────────────────
//
// **Aucune probabilité de mémoire.** Le CP0 a déclaré cette grandeur
// UNMEASURABLE et le §2 du contrat gelé le répète. Les candidats ci-dessous
// produisent une ÉCHÉANCE — « quand reproposer » — jamais un « il s'en souvient
// à 63 % ».
//
// ── TOUS LES PARAMÈTRES SONT DÉCLARÉS, AUCUN N'EST MESURÉ ────────────────
//
// `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED`. Aucun apprenant humain n'a
// suivi ce parcours sous mesure, donc **aucun paramètre ci-dessous ne peut être
// calibré**. Ils sont écrits en clair, en un seul endroit, et modifiables. Le
// contrat l'avait anticipé (§8.2) et l'interdiction est tenue : pas un chiffre
// n'est présenté comme observé.
import { INTERVALS } from '../../lib/retention.mjs';
import { simuler, stats } from './cp8-espacement.mjs';

const DAY_MS = 86_400_000;

/**
 * ── LES PARAMÈTRES DÉCLARÉS ──────────────────────────────────────────────
 * Aucun n'est issu d'une mesure. Chacun porte la raison de sa valeur, qui est
 * toujours « ordre de grandeur repris de la littérature ou du produit », jamais
 * « observé sur nos apprenants ».
 */
export const PARAMETRES = {
  // Seuils temporels — ce que fait `statutDe` aujourd'hui.
  SEUILS_JOURS: [2, 7, 21, 60],

  // SM-2 : bornes classiques de l'algorithme publié en 1987.
  SM2_EASE_INITIAL: 2.5,
  SM2_EASE_MIN: 1.3,
  SM2_EASE_MAX: 2.8,
  SM2_DELTA_REUSSITE: 0.1,
  SM2_DELTA_ECHEC: 0.2,

  // Décroissance exponentielle : R(t) = exp(−t / S). `S` est la « force »
  // (stability) en jours ; le seuil de reproposition est le niveau de rétention
  // en dessous duquel on rappelle.
  DECAY_STABILITE_INITIALE: 1.5,
  DECAY_FACTEUR_REUSSITE: 2.0,
  DECAY_FACTEUR_ECHEC: 0.5,
  DECAY_SEUIL_RAPPEL: 0.7,
  DECAY_STABILITE_MAX: 180,

  // Evidence-aware : une notion réellement APPLIQUÉE (preuve validée, projet)
  // est tenue plus longtemps. Le multiplicateur est un pari déclaré.
  EVIDENCE_BONUS_APPLICATION: 1.5,
  EVIDENCE_BONUS_TRANSFERT: 2.0,
  EVIDENCE_PLAFOND: 3.0,
};

const borne = (x, min, max) => Math.max(min, Math.min(max, x));
const echeance = (depuis, jours, basis) => ({
  dueAt: new Date(Date.parse(depuis) + Math.round(jours) * DAY_MS).toISOString(),
  intervalDays: Math.round(jours),
  basis,
});

/**
 * ── CANDIDAT 1 · SEUILS TEMPORELS ────────────────────────────────────────
 * « Au bout de N jours sans rappel, reproposer. » N dépend seulement du nombre
 * de rappels réussis, par paliers grossiers.
 *
 * HYPOTHÈSE : la durée écoulée est le seul signal qui compte.
 * LIMITE    : ignore totalement l'échec. Deux notions, l'une réussie cinq fois
 *             et l'autre ratée cinq fois, reçoivent la même échéance dès lors
 *             que leur dernier contact a le même âge.
 */
export function seuils(fiche) {
  const depuis = fiche.lastRetrievalAt;
  if (!depuis) return null;
  const s = PARAMETRES.SEUILS_JOURS;
  const n = borne(fiche.successfulRetrievalCount ?? 0, 0, s.length - 1);
  return echeance(depuis, s[n], `palier temporel n° ${n + 1}`);
}

/**
 * ── CANDIDAT 2 · LEITNER (le modèle ACTUEL du produit) ───────────────────
 * L'intervalle est `INTERVALS[réussites consécutives]`. Une réussite avance
 * d'un cran, un échec ramène au premier.
 *
 * HYPOTHÈSE : la série de réussites consécutives résume l'état de la notion.
 * LIMITE    : la série est amnésique — une notion réussie vingt fois puis ratée
 *             une fois repart exactement au même point qu'une notion vue pour
 *             la première fois.
 */
export function leitner(fiche) {
  const depuis = fiche.lastRetrievalAt;
  if (!depuis) return null;
  const i = borne(fiche.consecutiveSuccesses ?? 0, 0, INTERVALS.length - 1);
  return echeance(depuis, INTERVALS[i], `Leitner, palier ${i}`);
}

/**
 * ── CANDIDAT 3 · SM-2 (inspiré) ──────────────────────────────────────────
 * Un facteur de facilité par notion, qui monte à chaque réussite et descend à
 * chaque échec ; l'intervalle est le précédent multiplié par ce facteur.
 *
 * HYPOTHÈSE : la difficulté d'une notion est une grandeur stable, propre à
 *             l'apprenant, estimable par l'historique.
 * LIMITE    : SM-2 règle son facteur sur une AUTO-ÉVALUATION de 0 à 5. Le CP0 a
 *             montré que ce produit a trop d'auto-déclaration et manque de
 *             verdict objectif ; la version ci-dessous le règle donc sur les
 *             issues observées, ce qui n'est déjà plus SM-2.
 */
export function sm2(fiche) {
  const depuis = fiche.lastRetrievalAt;
  if (!depuis) return null;
  const r = fiche.successfulRetrievalCount ?? 0;
  const e = fiche.failedRetrievalCount ?? 0;
  const facilite = borne(
    PARAMETRES.SM2_EASE_INITIAL + r * PARAMETRES.SM2_DELTA_REUSSITE - e * PARAMETRES.SM2_DELTA_ECHEC,
    PARAMETRES.SM2_EASE_MIN, PARAMETRES.SM2_EASE_MAX,
  );
  const serie = fiche.consecutiveSuccesses ?? 0;
  const jours = serie === 0 ? 1 : serie === 1 ? 6 : 6 * facilite ** (serie - 1);
  return echeance(depuis, Math.min(jours, 365), `facilité ${facilite.toFixed(2)}, série ${serie}`);
}

/**
 * ── CANDIDAT 4 · DÉCROISSANCE EXPONENTIELLE ──────────────────────────────
 * `R(t) = exp(−t / S)`. On repropose quand `R` passe sous un seuil, donc à
 * `t = −S · ln(seuil)`. `S` double à chaque réussite, est divisé par deux à
 * chaque échec.
 *
 * HYPOTHÈSE FORTE, ET C'EST LA PLUS LOURDE DU LOT : la rétention décroît de
 *            façon exponentielle avec une constante de temps propre à la
 *            notion. C'est la courbe d'Ebbinghaus, obtenue sur des syllabes
 *            sans signification — **pas sur des compétences techniques
 *            appliquées**.
 * LIMITE    : le seuil `0,7` et la stabilité initiale `1,5 j` ne sont calibrés
 *             sur RIEN. Ils déterminent pourtant tout le comportement.
 */
export function exponentiel(fiche) {
  const depuis = fiche.lastRetrievalAt;
  if (!depuis) return null;
  const r = fiche.consecutiveSuccesses ?? 0;
  const e = fiche.failedRetrievalCount ?? 0;
  const S = borne(
    PARAMETRES.DECAY_STABILITE_INITIALE
      * PARAMETRES.DECAY_FACTEUR_REUSSITE ** r
      * PARAMETRES.DECAY_FACTEUR_ECHEC ** Math.min(e, 4),
    0.5, PARAMETRES.DECAY_STABILITE_MAX,
  );
  const jours = Math.max(1, -S * Math.log(PARAMETRES.DECAY_SEUIL_RAPPEL));
  return echeance(depuis, jours, `stabilité ${S.toFixed(1)} j, seuil ${PARAMETRES.DECAY_SEUIL_RAPPEL}`);
}

/**
 * ── CANDIDAT 5 · EVIDENCE-AWARE ──────────────────────────────────────────
 * Leitner, multiplié par ce que la notion a produit : une notion réellement
 * APPLIQUÉE (preuve validée) ou TRANSFÉRÉE (employée hors de son contexte
 * d'origine) tient plus longtemps.
 *
 * HYPOTHÈSE : produire quelque chose avec une notion consolide davantage que la
 *             rappeler. C'est plausible et c'est **non prouvé ici**.
 * INTÉRÊT   : c'est le seul candidat qui utilise le registre de preuves, qui est
 *             la donnée la plus objective du produit (validation vérifiée).
 * LIMITE    : le grain ne coïncide pas — `evidence[]` porte `competencyIds`
 *             (20), jamais `conceptId` (128). C'est la dette **D4** du CP0, non
 *             payée. Le candidat est donc **partiellement aveugle** au grain où
 *             il opère.
 */
export function evidenceAware(fiche) {
  const base = leitner(fiche);
  if (!base) return null;
  const bonus = borne(
    1
      + (fiche.applications ?? 0) * (PARAMETRES.EVIDENCE_BONUS_APPLICATION - 1)
      + (fiche.transfers ?? 0) * (PARAMETRES.EVIDENCE_BONUS_TRANSFERT - 1),
    1, PARAMETRES.EVIDENCE_PLAFOND,
  );
  return echeance(fiche.lastRetrievalAt, base.intervalDays * bonus,
    `Leitner × ${bonus.toFixed(2)} (applications ${fiche.applications ?? 0}, transferts ${fiche.transfers ?? 0})`);
}

export const CANDIDATS = [
  { id: 'SEUILS', nom: 'Seuils temporels', f: seuils },
  { id: 'LEITNER', nom: 'Leitner (actuel)', f: leitner },
  { id: 'SM2', nom: 'SM-2 inspiré', f: sm2 },
  { id: 'EXPONENTIEL', nom: 'Décroissance exponentielle', f: exponentiel },
  { id: 'EVIDENCE', nom: 'Evidence-aware', f: evidenceAware },
];

// ─────────────────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith('cp9-oubli.mjs')) {
  const P = [0.9, 0.75, 0.5];

  console.log('# V74 · CP9 — COMPARAISON DES MODÈLES D’OUBLI\n');
  console.log('## A. Propriétés de PLANIFICATION (180 j, budget 20 min)\n');
  console.log('Ce tableau ne dit PAS quel modèle prédit le mieux la mémoire — cette question');
  console.log('est indécidable ici (§B). Il dit comment chaque modèle se comporte comme');
  console.log('POLITIQUE : combien de retard il accumule, ce qu’il oublie de proposer,');
  console.log('et quelle dispersion d’intervalles il produit.\n');

  for (const p of P) {
    console.log(`### apprenant à ${Math.round(p * 100)} % de réussite\n`);
    console.log('| modèle | arriéré j180 | jamais proposées | intervalle médian | p90 | max |');
    console.log('|---|---|---|---|---|---|');
    for (const c of CANDIDATS) {
      const r = simuler({ jours: 180, pReussite: p, echeanceDeOf: c.f });
      const st = stats(r.intervalles);
      console.log(`| ${c.nom} | ${r.backlog[179]} | ${r.jamaisPropose} | ${st?.med ?? '-'} | ${st?.p90 ?? '-'} | ${st?.max ?? '-'} |`);
    }
    console.log('');
  }

  console.log('\n## B. LA DÉMONSTRATION QUI COMPTE : le classement dépend de l’hypothèse\n');
  console.log('On injecte maintenant une hypothèse d’oubli DANS l’apprenant simulé, et on');
  console.log('mesure le taux de réussite obtenu par chaque modèle. Trois hypothèses, toutes');
  console.log('également invérifiables faute de données réelles.\n');

  // Trois hypothèses d'oubli, toutes DÉCLARÉES, aucune mesurée.
  const HYPOTHESES = [
    { id: 'AUCUN', nom: 'aucun oubli (hypothèse du CP8)', f: (_e, p) => p },
    { id: 'EXPO', nom: 'oubli exponentiel, S = 7 j', f: (e, p) => p * Math.exp(-e / 7) + (1 - p) * 0.1 },
    { id: 'PALIER', nom: 'oubli par palier : rien avant 14 j, chute ensuite', f: (e, p) => (e <= 14 ? p : p * 0.4) },
  ];

  for (const h of HYPOTHESES) {
    console.log(`### hypothèse « ${h.nom} »\n`);
    console.log('| modèle | taux de rappel réussi | rang |');
    console.log('|---|---|---|');
    const lignes = CANDIDATS.map((c) => {
      const r = simuler({ jours: 180, pReussite: 0.75, echeanceDeOf: c.f, oubli: h.f });
      const ok = r.recallAttempts.filter((a) => a.outcome === 'recalled').length;
      return { nom: c.nom, taux: r.recallAttempts.length ? ok / r.recallAttempts.length : 0 };
    }).sort((a, b) => b.taux - a.taux);
    lignes.forEach((l, i) => console.log(`| ${l.nom} | ${(l.taux * 100).toFixed(1)} % | ${i + 1} |`));
    console.log('');
  }
}
