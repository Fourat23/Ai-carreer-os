// V73 · CP9 — LA PROGRESSION RÉELLE DE J1 À J365.
//
// ─────────────────────────────────────────────────────────────────────────────────────────
// CE QUE CE SCRIPT MESURE, ET DANS QUEL ORDRE LES RÈGLES ONT ÉTÉ FIXÉES
// ─────────────────────────────────────────────────────────────────────────────────────────
// Les sept facteurs, leurs mesures et leurs seuils sont écrits ci-dessous AVANT tout résultat.
// Aucun n'a été déplacé après lecture des chiffres (règle S8 du contrat gelé au CP1).
//
// Le brief nomme sept dimensions du travail demandé. Chacune reçoit une mesure DÉCLARATIVE
// (règle S1 : une propriété structurelle se lit dans une déclaration, jamais dans la prose) et
// une échelle 0-1-2 :
//
//   F1  nouveauté conceptuelle    nb de leçons dont le PREMIER contact de travail est ce jour,
//                                 + 1 si la journée ouvre une compétence.  min(2, n + ouvre)
//   F2  autonomie exigée          recouvrement (Jaccard sur les mots pleins) entre l'ÉNONCÉ de
//                                 l'exemple guidé et l'énoncé de l'exercice demandé. Si le
//                                 pas-à-pas résout DÉJÀ la tâche demandée, l'apprenant
//                                 reproduit ; il ne décide pas.  ≥0,50 → 0 · >0 → 1 · aucun
//                                 exemple guidé → 2                    seuil gelé avant mesure
//
//   FAUSSE PISTE PUBLIÉE. F2 a d'abord été défini comme un RAPPORT DE VOLUMES —
//   mots(tâche) / mots(exemple guidé) — « plus le modèle est petit devant la tâche, plus
//   l'apprenant est seul ». Sur ce corpus, ce rapport a le SIGNE INVERSE de ce qu'il prétend
//   mesurer : les journées 91-365 énoncent leur exercice en UNE phrase, donc obtiennent un
//   rapport minuscule et « peu d'autonomie », alors qu'un énoncé d'une phrase en laisse au
//   contraire davantage. La contradiction se lisait dans la matrice de corrélation :
//   F2 × F6 = −0,30 alors que les deux facteurs devraient aller dans le même sens. La
//   définition ci-dessus la remplace ; elle mesure ce qui compte réellement — l'existence
//   d'un modèle résolu de LA MÊME tâche.
//   F3  guidance fournie          mots(exemple guidé) + mots(correction) + 15 × blocs de code
//                                 de l'exemple guidé.                   terciles inversés
//   F4  complexité technique      profondeur maximale de la chaîne de PRÉREQUIS RÉELS des
//                                 leçons du jour (graphe du CP2).       ≤2 → 0 · 3-5 → 1 · ≥6 → 2
//   F5  intégration               nb de compétences distinctes portées par les leçons du jour.
//                                                                       ≤1 → 0 · 2 → 1 · ≥3 → 2
//   F6  ambiguïté de la commande  nb d'étapes numérotées de l'exercice. Un énoncé d'une phrase
//                                 laisse structurer le travail ; un énoncé en cinq étapes non.
//                                                                       ≤1 → 2 · 2-3 → 1 · ≥4 → 0
//   F7  responsabilité du livrable  aucun livrable → 0 · livrable autonome → 1 ·
//                                 pièce d'un projet nommé (production) → 2
//
// ─────────────────────────────────────────────────────────────────────────────────────────
// CE QUI EST DÉLIBÉRÉMENT EXCLU DE LA MESURE, ET POURQUOI
// ─────────────────────────────────────────────────────────────────────────────────────────
// Les sections « Ressources », « Mini-quiz », « Consigne d'utilisation de l'IA » et
// « Exercice bonus », ainsi que les critères de validation rédigés sur mesure, sont présents
// sur EXACTEMENT les 78 journées de travail des jours 1-90 et sur aucune autre. Ils mesurent
// donc **la manière dont la journée a été rédigée**, pas la difficulté du travail demandé.
// Les inclure ferait apparaître une marche artificielle au jour 91. C'est le douzième piège
// « mesurer un marqueur au lieu de la propriété » ; il est écarté d'avance.
//
// ─────────────────────────────────────────────────────────────────────────────────────────
// COMMENT LE SCORE DEVIENT UNE DIFFICULTÉ 1-5 : CALIBRATION SUR UN JUGEMENT HUMAIN
// ─────────────────────────────────────────────────────────────────────────────────────────
// Choisir soi-même les bornes de découpage reviendrait à décider le résultat. Les 78 journées
// de travail des jours 1-90 portent une `difficulty` ÉCRITE À LA MAIN dans `scripts/data/` :
// c'est un jugement humain indépendant, produit avant ce sprint. Les quatre bornes sont donc
// AJUSTÉES POUR REPRODUIRE CES 78 VALEURS, puis appliquées telles quelles aux jours 91-365.
// L'accord obtenu sur les 78 est publié : c'est la seule preuve que la dérivation mesure bien
// ce qu'un humain appelait « difficulté ». S'il est mauvais, il faut le dire, pas le cacher.
//
// Limite déclarée : l'échelle est INTERNE À L'ANNÉE. Elle dit que le jour X demande plus que
// le jour Y ; elle ne dit pas qu'il est « difficile » dans l'absolu.
//
// Usage : node scripts/v73/cp9-progression.mjs [--json] [--ecrire]
import { readFileSync, existsSync, writeFileSync } from 'node:fs';

const g = JSON.parse(readFileSync('docs/v73/curriculum-graph.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');
const lire = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const mots = (t) => (t ? t.trim().split(/\s+/).filter(Boolean).length : 0);

// ── découpage d'une journée en sections (règle S5 : par titre, jamais par ligne vide)
//
// ANOMALIE DE SONDE n° 18, PUBLIÉE. La première version coupait aussi bien sur `##` que sur
// `###`. Or le contenu réel de `## ✍️ Pratique autonome` vit ENTIÈREMENT dans son
// sous-titre `### Exercice principal` — la section de niveau 2 ne contenait donc que
// l'avertissement « D'abord sans IA ». Conséquence : **F6 (ambiguïté) valait 2 sur les 365
// journées**, c'est-à-dire un facteur mort qui apportait une constante, et **F2 (autonomie)
// ne mesurait que la phrase du livrable**. Une section de niveau 2 inclut désormais ses
// sous-sections ; les sous-sections restent indexées à part pour les revues.
function sections(md) {
  const niv2 = new Map(), niv3 = new Map();
  const cle = (t) => t.replace(/[^\p{L}\p{N} ']/gu, '').trim();
  const lignes = md.split('\n');
  let t2 = '__entete__', t3 = null, buf2 = [], buf3 = [];
  const vider3 = () => { if (t3 !== null) niv3.set(t3, (niv3.get(t3) ?? '') + buf3.join('\n')); t3 = null; buf3 = []; };
  const vider2 = () => { vider3(); niv2.set(t2, (niv2.get(t2) ?? '') + buf2.join('\n')); buf2 = []; };
  for (const l of lignes) {
    const m2 = /^##\s+(.*)$/.exec(l), m3 = /^###\s+(.*)$/.exec(l);
    if (m2) { vider2(); t2 = cle(m2[1]); continue; }
    if (m3) { vider3(); t3 = cle(m3[1]); buf2.push(l); continue; }
    buf2.push(l);
    if (t3 !== null) buf3.push(l);
  }
  vider2();
  return { niv2, niv3 };
}
const sec = (S, re) => { for (const [k, v] of S.niv2) if (re.test(k)) return v; for (const [k, v] of S.niv3) if (re.test(k)) return v; return ''; };
const blocsCode = (t) => (t.match(/^```/gm) ?? []).length / 2;
// mots-outils écartés du recouvrement : ils appartiennent à la langue, pas à la tâche
const VIDES = new Set(['dans', 'pour', 'avec', 'sans', 'puis', 'ensuite', 'chaque', 'cette', 'leur',
  'plus', 'moins', 'tout', 'tous', 'toute', 'toutes', 'quand', 'donc', 'mais', 'elle', 'être',
  'avoir', 'faire', 'fait', 'sont', 'entre', 'aussi', 'meme', 'meme', 'deux', 'trois', 'une']);

// ── premier contact de TRAVAIL d'une leçon (définition corrigée au CP2, anomalie n° 6)
const premierContact = new Map();
for (const d of g.jours) {
  if (d.revue) continue;
  for (const s of d.lecons) if (!premierContact.has(s)) premierContact.set(s, d.j);
}
// ── première journée de travail portant une compétence
const premiereCompetence = new Map();
for (const d of g.jours) {
  if (d.revue) continue;
  for (const c of d.competencesPortees) if (!premiereCompetence.has(c)) premiereCompetence.set(c, d.j);
}
// ── profondeur de la chaîne de prérequis RÉELS (le plan LOOKAHEAD n'est pas une exigence)
const REQ = g.prereq?.requis ?? {};
const memoProf = new Map();
function profondeur(slug, vus = new Set()) {
  if (memoProf.has(slug)) return memoProf.get(slug);
  if (vus.has(slug)) return 0;
  vus.add(slug);
  const deps = REQ[slug] ?? [];
  const d = deps.length ? 1 + Math.max(...deps.map((x) => profondeur(x, new Set(vus)))) : 0;
  memoProf.set(slug, d);
  return d;
}

// ── mesures brutes, journée par journée
const brut = g.jours.map((d) => {
  const md = lire(`curriculum/days/day-${n3(d.j)}.md`);
  const S = sections(md);
  const guide = sec(S, /Exemple guid/i);
  const pratique = sec(S, /Pratique autonome/i);
  const livrable = sec(S, /Livrable attendu/i);
  const corr = lire(`curriculum/solutions/day-${n3(d.j)}-solution.md`);
  const testPratique = sec(S, /Test pratique/i);
  const miniProjet = sec(S, /Mini.?projet/i);

  // une revue ne porte pas d'« exemple guidé » : sa tâche est le test pratique, sans modèle
  const tache = d.revue ? mots(testPratique) + mots(miniProjet) : mots(pratique) + mots(livrable);
  const modele = d.revue ? 0 : mots(guide);

  // recouvrement énoncé-du-guidé × énoncé-de-l'exercice
  const enonceGuide = (/\*\*Énoncé\*\*\s*:?\s*([^\n]*)/.exec(guide) ?? [, ''])[1];
  const enonceExo = d.revue ? testPratique : (S.niv3.get('Exercice principal') ?? pratique);
  const pleins = (t) => new Set((t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .match(/[a-z0-9][a-z0-9-]{3,}/g) ?? []).filter((w) => !VIDES.has(w)));
  const A = pleins(enonceGuide), B = pleins(enonceExo.split('\n\n')[0] ?? '');
  const inter = [...A].filter((x) => B.has(x)).length;
  const jaccard = A.size && B.size ? +(inter / (A.size + B.size - inter)).toFixed(3) : 0;

  const nNouvelles = d.lecons.filter((s) => premierContact.get(s) === d.j).length;
  const ouvre = d.competencesPortees.some((c) => premiereCompetence.get(c) === d.j);
  const prof = d.lecons.length ? Math.max(...d.lecons.map((s) => profondeur(s))) : 0;

  // étapes numérotées de la commande : « 1) », « 1. » ou puces de l'exercice principal
  const corps = d.revue ? testPratique + '\n' + miniProjet : pratique;
  const numerotees = (corps.match(/(?:^|\s)\d+[).]\s/gm) ?? []).length;
  const puces = (corps.match(/^\s*[-*]\s+/gm) ?? []).length;
  const etapes = Math.max(numerotees, puces);

  return {
    j: d.j, semaine: d.semaine, mois: d.mois, titre: d.titre, revue: d.revue,
    etiquette: d.etiquette, difficulteActuelle: d.difficulte,
    nNouvelles, ouvre, prof, nCompetences: d.competencesPortees.length,
    etapes, production: !!d.estProduction, aLivrable: !!d.livrable,
    motsTache: tache, motsModele: modele, motsEnonce: mots(enonceExo.split('\n\n')[0] ?? ''),
    recouvrementGuide: jaccard, aGuide: modele > 0,
    guidance: mots(guide) + mots(corr) + 15 * blocsCode(guide),
  };
});

// ── terciles, calculés sur les 365 journées, une seule fois
function terciles(vals) {
  const t = [...vals].sort((a, b) => a - b);
  return [t[Math.floor(t.length / 3)], t[Math.floor((2 * t.length) / 3)]];
}
const [g1, g2] = terciles(brut.map((b) => b.guidance));
const tercile = (v, x, y) => (v <= x ? 0 : v <= y ? 1 : 2);

for (const b of brut) {
  b.F1 = Math.min(2, b.nNouvelles + (b.ouvre ? 1 : 0));
  b.F2 = !b.aGuide ? 2 : b.recouvrementGuide >= 0.5 ? 0 : 1;
  b.F3 = 2 - tercile(b.guidance, g1, g2);
  b.F4 = b.prof <= 2 ? 0 : b.prof <= 5 ? 1 : 2;
  b.F5 = b.nCompetences <= 1 ? 0 : b.nCompetences === 2 ? 1 : 2;
  b.F6 = b.etapes <= 1 ? 2 : b.etapes <= 3 ? 1 : 0;
  b.F7 = !b.aLivrable ? 0 : b.production ? 2 : 1;
  b.score = b.F1 + b.F2 + b.F3 + b.F4 + b.F5 + b.F6 + b.F7;
}

// ── calibration des quatre bornes sur les 78 journées de travail écrites à la main (j1-90)
const temoins = brut.filter((b) => b.j <= 90 && !b.revue);
function applique(bornes, s) { let d = 1; for (const c of bornes) if (s >= c) d++; return Math.min(5, d); }
function desaccord(bornes) {
  let exact = 0, absolu = 0;
  for (const t of temoins) { const d = applique(bornes, t.score); if (d === t.difficulteActuelle) exact++; absolu += Math.abs(d - t.difficulteActuelle); }
  return { exact, absolu };
}
// ── CALIBRATION A — minimiser l'erreur : DÉGÉNÉRÉE, publiée comme telle
// Le premier critère retenu était « erreur absolue minimale, puis accord exact maximal ». Il
// est dégénéré sur un échantillon déséquilibré : la meilleure fonction en escalier est celle
// qui prédit le MODE partout. Elle donne des bornes [1, 2, 12, 13] — c'est-à-dire « tout est
// à 3 » — et reconstruit exactement la platitude que le CP9 doit corriger. Le résultat est
// publié à côté du bon, il n'est pas effacé.
let A = null;
const MAX = 14;
for (let c1 = 1; c1 <= MAX; c1++)
  for (let c2 = c1 + 1; c2 <= MAX; c2++)
    for (let c3 = c2 + 1; c3 <= MAX; c3++)
      for (let c4 = c3 + 1; c4 <= MAX; c4++) {
        const b = [c1, c2, c3, c4];
        const r = desaccord(b);
        if (!A || r.absolu < A.absolu || (r.absolu === A.absolu && r.exact > A.exact)) A = { bornes: b, ...r };
      }

// ── CALIBRATION B — RETENUE : appariement des quantiles sur les 78 témoins
// Les bornes sont placées de sorte que, SUR LES TÉMOINS, la difficulté dérivée reproduise la
// RÉPARTITION écrite à la main. Ce sont ensuite des seuils de SCORE, appliqués tels quels aux
// 365 journées : la répartition de l'année reste libre — c'est elle qu'on veut mesurer.
const scoresTemoins = temoins.map((t) => t.score).sort((a, b) => a - b);
const partHumaine = [1, 2, 3, 4].map((n) => temoins.filter((t) => t.difficulteActuelle <= n).length / temoins.length);
const BORNES = partHumaine.slice(0, 4).map((p) => scoresTemoins[Math.min(scoresTemoins.length - 1, Math.floor(p * scoresTemoins.length))]);
for (let i = 1; i < 4; i++) if (BORNES[i] <= BORNES[i - 1]) BORNES[i] = BORNES[i - 1] + 1;
const B = { bornes: BORNES, ...desaccord(BORNES) };
const meilleur = B;
for (const b of brut) b.difficulteDerivee = applique(BORNES, b.score);

// ── résultats
const compte = (arr, f) => { const h = {}; for (const x of arr) h[f(x)] = (h[f(x)] ?? 0) + 1; return h; };
const travail = brut.filter((b) => !b.revue);
const revues = brut.filter((b) => b.revue);
const runs = (arr, f) => { const r = []; let cur = null; for (const x of arr) { if (!cur || cur.v !== f(x)) { cur = { v: f(x), a: x.j, b: x.j, n: 1 }; r.push(cur); } else { cur.b = x.j; cur.n++; } } return r; };
const moyenneParMois = [];
for (let m = 1; m <= 12; m++) {
  const t = travail.filter((b) => b.mois === m);
  const moy = (f) => +(t.reduce((s, x) => s + f(x), 0) / t.length).toFixed(2);
  moyenneParMois.push({
    mois: m, n: t.length,
    actuelle: moy((x) => x.difficulteActuelle), derivee: moy((x) => x.difficulteDerivee),
    score: moy((x) => x.score),
    F1: moy((x) => x.F1), F2: moy((x) => x.F2), F3: moy((x) => x.F3),
    F4: moy((x) => x.F4), F5: moy((x) => x.F5), F6: moy((x) => x.F6), F7: moy((x) => x.F7),
  });
}
// corrélation de Pearson entre facteurs, publiée telle quelle (les facteurs ne sont PAS
// indépendants et prétendre le contraire serait faux)
const F = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7'];
const cor = (u, v) => {
  const n = brut.length, mu = brut.reduce((s, b) => s + b[u], 0) / n, mv = brut.reduce((s, b) => s + b[v], 0) / n;
  let a = 0, p = 0, q = 0;
  for (const b of brut) { const x = b[u] - mu, y = b[v] - mv; a += x * y; p += x * x; q += y * y; }
  return +(a / Math.sqrt(p * q || 1)).toFixed(2);
};
const matrice = F.map((u) => ({ f: u, ...Object.fromEntries(F.map((v) => [v, cor(u, v)])) }));
// corrélation entre la difficulté dérivée et le numéro du jour : la progression, en un chiffre
const corJour = (() => {
  const n = travail.length, mj = travail.reduce((s, b) => s + b.j, 0) / n, md = travail.reduce((s, b) => s + b.difficulteDerivee, 0) / n;
  let a = 0, p = 0, q = 0;
  for (const b of travail) { const x = b.j - mj, y = b.difficulteDerivee - md; a += x * y; p += x * x; q += y * y; }
  return +(a / Math.sqrt(p * q || 1)).toFixed(3);
})();

const sortie = {
  avertissement: "Échelle INTERNE À L'ANNÉE : elle ordonne les 365 journées entre elles, elle ne mesure pas une difficulté absolue.",
  bornesCalibrees: BORNES,
  calibrationA_degeneree: { bornes: A.bornes, exact: A.exact, erreurAbsolueMoyenne: +(A.absolu / temoins.length).toFixed(3) },
  accordSurLesTemoins: { n: temoins.length, exact: meilleur.exact, erreurAbsolueMoyenne: +(meilleur.absolu / temoins.length).toFixed(3) },
  tercilesUtilises: { guidance: [g1, g2] },
  distributionActuelle: compte(brut, (b) => b.difficulteActuelle),
  distributionDerivee: compte(brut, (b) => b.difficulteDerivee),
  correlationDifficulteDeriveeAvecLeJour: corJour,
  moyenneParMois, matriceCorrelation: matrice,
  jours: brut,
};
if (process.argv.includes('--ecrire')) writeFileSync('docs/v73/progression-365.json', JSON.stringify(sortie, null, 1));

// ── écriture de la difficulté dérivée dans les données de génération
//
// PÉRIMÈTRE, ET SES DEUX RAISONS.
//  · Les jours 1-90 gardent leur `difficulty` ÉCRITE À LA MAIN. Ce sont les témoins de la
//    calibration : les écraser par la sortie du modèle détruirait la seule référence humaine
//    dont dispose ce sprint, et remplacerait un jugement par une dérivation qui ne le
//    reproduit qu'à 55 %.
//  · Les 52 revues gardent leur `difficulty` = 2. Les 78 témoins sont tous des journées de
//    TRAVAIL : appliquer l'échelle à une revue, c'est extrapoler hors du domaine de
//    calibration. La valeur dérivée pour les revues est publiée, elle n'est pas écrite.
//  · Restent les journées de travail planifiées j91-j364, qui portent aujourd'hui la
//    constante `difficulty: 3` codée en dur dans le générateur. Ce sont elles, et elles
//    seules, que le CP9 remplace.
//
// NON-CIRCULARITÉ. `difficulty` n'apparaît dans une journée générée que dans la ligne
// d'en-tête (« Difficulté : … /5 »), qui précède tout titre `##` et n'est donc lue par aucune
// des sept mesures. La dérivation ne se nourrit pas de son propre résultat.
if (process.argv.includes('--ecrire-difficulte')) {
  const cibles = brut.filter((b) => b.j >= 91 && b.j <= 364 && !b.revue);
  const lignes = cibles.map((b) => `  ${b.j}: ${b.difficulteDerivee}, // ${b.titre.replace(/\n/g, ' ').slice(0, 58)}`);
  writeFileSync('scripts/data/days-difficulty-v73.mjs', `// V73 · CP9 — DIFFICULTÉ DÉRIVÉE DU TRAVAIL DEMANDÉ.
//
// Avant ce fichier, les journées 91-365 portaient toutes la constante \`difficulty: 3\` écrite
// en dur dans le générateur, et les revues \`2\`. La suite valait donc 3,3,3,3,3,3,2 répétée
// cinquante-deux fois : une fonction de la POSITION DANS LA SEMAINE, qui ne disait rien de la
// journée. Les valeurs ci-dessous sont dérivées de sept propriétés déclarées — nouveauté,
// autonomie, guidance, complexité de prérequis, intégration, ambiguïté de la commande,
// responsabilité du livrable — et l'échelle est calibrée sur les 78 journées 1-90 dont la
// difficulté a été écrite à la main.
//
// Regénérer : node scripts/v73/cp9-progression.mjs --ecrire --ecrire-difficulte
// Méthode et limites : docs/v73/V73-CP9-PROGRESSION.md
export const DIFFICULTY_V73 = {
${lignes.join('\n')}
};
`);
}
if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(sortie));
else {
  const P = (x, n) => String(x).padStart(n);
  console.log('CALIBRATION SUR LES 78 JOURNÉES ÉCRITES À LA MAIN (j1-90)');
  console.log(`  A — minimiser l'erreur : bornes ${A.bornes.join('/')} · exact ${A.exact}/78 · DÉGÉNÉRÉE (prédit le mode)`);
  console.log(`  B — quantiles (RETENUE) :`);
  console.log(`  bornes retenues        score ≥ ${BORNES.join(' / ≥ ')}`);
  console.log(`  accord exact           ${meilleur.exact}/${temoins.length} = ${(100 * meilleur.exact / temoins.length).toFixed(0)} %`);
  console.log(`  erreur absolue moyenne ${(meilleur.absolu / temoins.length).toFixed(2)} niveau`);
  const ecarts = compte(temoins, (t) => applique(BORNES, t.score) - t.difficulteActuelle);
  console.log(`  écarts                 ${Object.entries(ecarts).sort().map(([k, v]) => `${k >= 0 ? '+' : ''}${k}: ${v}`).join(' · ')}`);
  console.log('\nDISTRIBUTION DE `difficulty`');
  console.log('           1     2     3     4     5');
  const ligne = (nom, h) => console.log(`${nom.padEnd(10)}${[1, 2, 3, 4, 5].map((k) => P(h[k] ?? 0, 5)).join(' ')}`);
  ligne('actuelle', compte(brut, (b) => b.difficulteActuelle));
  ligne('dérivée', compte(brut, (b) => b.difficulteDerivee));
  ligne('travail', compte(travail, (b) => b.difficulteDerivee));
  ligne('revues', compte(revues, (b) => b.difficulteDerivee));
  console.log('\nPLAGES CONSTANTES (une plage = une suite de jours de MÊME difficulté)');
  const rA = runs(brut, (b) => b.difficulteActuelle), rD = runs(brut, (b) => b.difficulteDerivee);
  const plusLongue = (r) => r.reduce((m, x) => (x.n > m.n ? x : m), r[0]);
  console.log(`  actuelle : ${rA.length} plages · la plus longue = ${plusLongue(rA).n} jours (j${plusLongue(rA).a}-j${plusLongue(rA).b}, difficulté ${plusLongue(rA).v})`);
  console.log(`  dérivée  : ${rD.length} plages · la plus longue = ${plusLongue(rD).n} jours (j${plusLongue(rD).a}-j${plusLongue(rD).b}, difficulté ${plusLongue(rD).v})`);
  console.log('\nMOYENNES PAR MOIS (journées de travail)');
  console.log('mois   n  actuelle  dérivée  score   F1   F2   F3   F4   F5   F6   F7');
  for (const m of moyenneParMois)
    console.log(`${P(m.mois, 4)} ${P(m.n, 3)} ${P(m.actuelle.toFixed(2), 9)} ${P(m.derivee.toFixed(2), 8)} ${P(m.score.toFixed(1), 6)} ${F.map((f) => P(m[f].toFixed(1), 4)).join(' ')}`);
  console.log(`\nCorrélation difficulté dérivée × numéro du jour : ${corJour}`);
  console.log('\nMATRICE DE CORRÉLATION DES FACTEURS');
  console.log('      ' + F.map((f) => P(f, 6)).join(''));
  for (const r of matrice) console.log(r.f.padEnd(6) + F.map((f) => P(r[f].toFixed(2), 6)).join(''));
}
