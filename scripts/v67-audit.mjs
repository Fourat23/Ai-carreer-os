// V67 · CP0 — AUDIT ACADÉMIQUE FORENSIQUE. LECTURE SEULE.
//
// AVERTISSEMENT, identique à celui de V66 et toujours vrai : aucune de ces
// mesures ne dit si un cours enseigne. Ce sont des SONDES. Chacune peut être un
// faux positif ; aucune n'entre dans un rapport sans lecture directe d'au moins
// deux occurrences. V66 a écarté six mesures fausses de cette façon, dont une
// qui aurait titré « 100 % des journées ont un acronyme jamais développé »
// parce que `\b` casse sur les accents et lisait ÉTAT comme TAT.
//
// Ce que ce script mesure, et rien de plus :
//   1. la FAMILLE éditoriale d'une leçon (règle identique au CP0 de V66) ;
//   2. la présence des composants de la grammaire pédagogique V67 ;
//   3. la charge ANNONCÉE contre la charge DÉCRITE d'une journée ;
//   4. la composition réelle des 52 revues hebdomadaires ;
//   5. les notions employées avant d'être introduites.

import { readFileSync, readdirSync, existsSync } from 'node:fs';

const R = (p) => readFileSync(p, 'utf8');
const dayPath = (n) => `curriculum/days/day-${String(n).padStart(3, '0')}.md`;
const solPath = (n) => `curriculum/solutions/day-${String(n).padStart(3, '0')}-solution.md`;
const prose = (t) => t.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
const words = (t) => prose(t).split(/\s+/).filter(Boolean).length;
const codeLines = (t) => [...t.matchAll(/```[\s\S]*?```/g)]
  .map((m) => Math.max(0, m[0].split('\n').length - 2)).reduce((a, b) => a + b, 0);

/** Sections de niveau 2, titre débarrassé des émojis. */
export function sections(md) {
  const h = [...md.matchAll(/^## +(.+)$/gm)];
  return h.map((m, i) => ({
    title: m[1].replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').trim(),
    body: md.slice(m.index + m[0].length, i + 1 < h.length ? h[i + 1].index : md.length),
  }));
}

// ── 1. Famille éditoriale ────────────────────────────────────────────────
// RÈGLE IDENTIQUE À CELLE DU CP0 DE V66, volontairement non retouchée : c'est
// la seule façon de comparer les deux sprints. Elle mesure un marqueur de
// SURFACE (des sous-titres H3), pas la qualité — V66 l'a déjà constaté : les
// 9 leçons durcies restent classées A parce qu'elles utilisent des paragraphes
// introduits par leur sujet plutôt que des H3. Le classement est donc publié
// AVEC sa limite, et il n'est pas le critère de décision de V67.
export function famille(md) {
  const S = sections(md);
  const i = S.findIndex((s) => /explication (compl|progressive)/i.test(s.title));
  if (i < 0) return { famille: '?', core: 0, coreTitle: null };
  const b = S[i].body;
  const subs = (b.match(/^### /gm) ?? []).length;
  return {
    famille: /progressive/i.test(S[i].title) ? 'B' : subs >= 2 ? 'C' : 'A',
    core: words(b),
    coreTitle: S[i].title,
    subs,
    /** Paragraphes introduits par leur sujet — le marqueur du modèle V66. */
    leads: (b.match(/^\*\*[^*\n]{3,80}\.?\*\*/gm) ?? []).length,
  };
}

// ── 2. Grammaire pédagogique V67 ─────────────────────────────────────────
// « C'est une grammaire pédagogique, pas un template visuel rigide » (§5.3 du
// brief). On mesure donc la présence d'une FONCTION, par plusieurs titres
// possibles, jamais un titre unique imposé.
const FONCTIONS = {
  probleme: [/le probl[èe]me/i, /contexte/i, /pourquoi c.est important/i],
  objectif: [/objectif/i],
  prerequis: [/pr[ée]requis/i],
  modeleMental: [/mod[èe]le mental/i, /intuition/i],
  explication: [/explication/i, /concepts cl[ée]s/i],
  exempleGuide: [/exemple guid/i, /pas [àa] pas/i, /que faire dans ce cas/i],
  pratique: [/mini-exercice/i, /exercice/i, /pratique/i, /mise en pratique/i],
  correction: [/correction/i],
  erreurs: [/erreurs fr/i, /anti-?pattern/i, /pi[èe]ges/i, /contre-exemple/i],
  casMetier: [/cas (m[ée]tier|professionnel)/i, /exemple appliqu/i],
  transfert: [/transfert/i, /questions? d.entretien/i, /r[ée]flexion/i],
  recuperation: [/checklist/i, /quiz/i, /rappel/i, /v[ée]rification de compr/i],
  synthese: [/[àa] retenir/i, /synth[èe]se/i, /r[ée]sum[ée]/i],
};

export function grammaire(md) {
  const titres = sections(md).map((s) => s.title);
  const out = {};
  for (const [f, pats] of Object.entries(FONCTIONS)) {
    out[f] = titres.some((t) => pats.some((p) => p.test(t)));
  }
  return out;
}

// ── 3. Densité de termes techniques non construits ───────────────────────
//
// Le brief §2.6 nomme le défaut : « lorsque 5 termes techniques apparaissent
// dans trois lignes sans développement, considère cela comme un signal
// d'alerte ». On le mesure littéralement : une fenêtre glissante de trois
// lignes de prose, et le nombre de termes MARQUÉS par le corpus lui-même
// (back-ticks ou gras) qu'elle contient.
//
// C'est un SIGNAL, pas un défaut : une énumération légitime peut le
// déclencher. Toute occurrence retenue au rapport est lue.
export function keywordSoup(md) {
  const lignes = prose(md).split('\n');
  const marques = (l) => (l.match(/\*\*[^*\n]{2,40}\*\*/g) ?? []).length
    + (l.match(/`[^`\n]{2,40}`/g) ?? []).length;
  let pire = 0; let ou = 0;
  for (let i = 0; i + 2 < lignes.length; i++) {
    const n = marques(lignes[i]) + marques(lignes[i + 1]) + marques(lignes[i + 2]);
    if (n > pire) { pire = n; ou = i + 1; }
  }
  return { pireFenetre: pire, ligne: ou };
}

// ── 4. Charge : ANNONCÉE contre DÉCRITE ──────────────────────────────────
//
// Modèle publié avant mesure et non réajusté ensuite :
//   prose technique lue avec compréhension .... 150 mots / minute
//   code lu ligne à ligne ..................... 20 lignes / minute
//   question de rappel .............. 1,5 min · question ouverte ..... 4 min
//
// DEUX grandeurs distinctes, et V66 ne les avait pas assez séparées :
//   — `minutesLues`   : le temps pour CONSOMMER ce qui est fourni. Calculable.
//   — `tachesDecrites`: le nombre de tâches que la journée demande VRAIMENT de
//                       produire, avec une consigne. Comptable, pas chronométrable.
// Une journée qui commande « termine le projet 2 » fournit 6 minutes de lecture
// et plusieurs heures de travail. La compter à 6 minutes est faux ; lui
// attribuer 270 minutes serait inventé. On compte donc les deux séparément.
const WPM = 150, LPM = 20, MIN_RAPPEL = 1.5, MIN_OUVERTE = 4;

/**
 * SONDE ÉCARTÉE, conservée en mémoire — c'est le septième faux positif du
 * projet et il suit exactement le motif des six précédents.
 *
 * Première idée : compter les VERBES À L'IMPÉRATIF adressés à l'apprenant.
 * Résultat : « médiane 1 consigne par journée, 170 journées à zéro ». Chiffre
 * spectaculaire et faux. Vérification par lecture du jour 232 :
 *   « Lis project-06.md. Définis le corpus, les types de questions, le plan
 *     d'évaluation. »
 * Deux impératifs parfaitement clairs, dont aucun n'était dans ma liste. Une
 * liste de verbes est une liste ouverte : l'allonger jusqu'à ce que le chiffre
 * paraisse juste, c'est précisément ce que la règle 4 interdit.
 *
 * Mesure retenue à la place, objective et indépendante du vocabulaire : le
 * NOMBRE DE MOTS que la journée consacre à décrire le travail — les sections
 * de pratique, de livrable et de critères de validation. Une journée qui
 * consacre douze mots à dire quoi faire ne le dit pas, quel que soit le verbe.
 */
const SECTIONS_TRAVAIL = /^##[^\n]*(pratique autonome|livrable|crit[èe]res de validation|exercice|mise en pratique|d[ée]fi)[\s\S]*?(?=^## |\Z)/gim;

export function charge(day) {
  const dp = dayPath(day);
  if (!existsSync(dp)) return null;
  const dayMd = R(dp);
  const slugs = [...new Set([...dayMd.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  const lessons = slugs.map((s) => `curriculum/lessons/${s}.md`).filter(existsSync).map(R);
  const sol = existsSync(solPath(day)) ? R(solPath(day)) : '';
  const tout = [dayMd, ...lessons, sol].join('\n');

  const minutesLues = Math.round(words(tout) / WPM + codeLines(tout) / LPM);

  // Espace que la JOURNÉE consacre à décrire le travail (les leçons sont du
  // matériel, la journée est le programme de travail).
  const blocsTravail = [...dayMd.matchAll(SECTIONS_TRAVAIL)].map((m) => m[0]);
  const motsTravail = blocsTravail.reduce((n, b) => n + words(b), 0);
  const cases = (dayMd.match(/^\s*-\s*\[ \]/gm) ?? []).length;

  // Livrable annoncé : une production, pas une lecture.
  const livrable = /^##[^\n]*[Ll]ivrable[\s\S]*?(?=^## |\Z)/m.exec(dayMd)?.[0] ?? '';

  // Durée annoncée, lue dans l'en-tête de la journée.
  const dec = /Durée\s*:\s*([\d.,]+)\s*h/i.exec(dayMd);
  const declaree = dec ? Math.round(parseFloat(dec[1].replace(',', '.')) * 60) : null;

  return {
    day,
    declaree,
    minutesLues,
    motsTravail,
    blocsTravail: blocsTravail.length,
    cases,
    livrable: words(livrable) > 8,
    livrableMots: words(livrable),
    /** Renvoi vers un fichier extérieur qui porte le vrai travail. */
    delegue: /(projects?\/project-\d+|curriculum\/projects|spec compl[èe]te)/i.test(dayMd),
    ratio: declaree ? +(minutesLues / declaree).toFixed(2) : null,
  };
}

// ── 5. Composition réelle d'une revue hebdomadaire ───────────────────────
//
// Les onze composants que le brief §8 énumère. On mesure la PRÉSENCE de la
// fonction, pas d'un titre : une revue qui fait de la récupération sans écrire
// « récupération » la fait quand même.
const COMPOSANTS_REVUE = {
  recuperationSansNotes: [/sans notes/i, /de m[ée]moire/i, /sans regarder/i, /sans rouvrir/i],
  questionsCumulatives: [/questions? d.entretien/i, /auto-r[ée]vision/i, /\d+ questions/i],
  pratiqueMelangee: [/test pratique/i, /mini-projet/i, /livrable/i],
  exerciceCorrection: [/correction/i, /rem[ée]diation/i],
  analyseErreur: [/rem[ée]diation/i, /si un crit[èe]re [ée]choue/i, /que faire si/i],
  comparaisonConcepts: [/vs\b/i, /diff[ée]rence entre/i, /comparer?/i],
  transfert: [/architectural/i, /ADR/i, /r[ée]flexion/i, /transfert/i],
  revisionEspacee: [/revoir/i, /rejouer/i, /reprends/i, /r[ée]vision/i],
  miniDiagnostic: [/grille de notation/i, /note chaque item/i, /auto-[ée]valuation/i, /\/3\b/],
  correctionCommentee: [/attendu\s*:/i, /plan de rem[ée]diation/i],
  decisionDeRevoir: [/crit[èe]res de passage/i, /ce que je dois revoir/i, /avant de passer/i],
};

export function revue(day) {
  const dp = dayPath(day);
  if (!existsSync(dp)) return null;
  const md = R(dp);
  const out = { day, mots: words(md) };
  let n = 0;
  for (const [k, pats] of Object.entries(COMPOSANTS_REVUE)) {
    out[k] = pats.some((p) => p.test(md));
    if (out[k]) n += 1;
  }
  out.composants = n;
  out.total = Object.keys(COMPOSANTS_REVUE).length;
  return out;
}

// ── 6. Une notion employée avant d'être introduite ───────────────────────
//
// On suit l'ORDRE DU PROGRAMME. Pour chaque terme du glossaire, on repère la
// première journée qui l'emploie et la première leçon qui le DÉFINIT (le terme
// figure dans sa section d'explication ou de vocabulaire). Si le terme est
// employé dans une journée antérieure à celle qui enseigne la leçon
// définissante, c'est une notion utilisée avant d'être introduite.
export function notionsPrematurees(glossaire, conceptDays, lessonOf) {
  const premiereUtilisation = new Map();
  const days = [];
  for (let d = 1; d <= 365; d++) {
    const p = dayPath(d);
    if (!existsSync(p)) continue;
    days.push({ d, texte: prose(R(p)).toLowerCase() });
  }
  const out = [];
  for (const e of glossaire) {
    const terme = String(e.term ?? '').trim();
    if (terme.length < 5) continue;
    const t = terme.toLowerCase();
    const premiere = days.find((x) => x.texte.includes(t));
    if (!premiere) continue;
    premiereUtilisation.set(e.id, premiere.d);
    const slug = lessonOf.get(e.id);
    if (!slug) continue;
    const joursEnseignant = conceptDays[slug] ?? [];
    if (joursEnseignant.length === 0) continue;
    const premierEnseignement = Math.min(...joursEnseignant);
    if (premiere.d < premierEnseignement) {
      out.push({ terme, utiliseJour: premiere.d, enseigneJour: premierEnseignement, ecart: premierEnseignement - premiere.d });
    }
  }
  return out.sort((a, b) => b.ecart - a.ecart);
}

// ── 7. Correction : réponse seule ou raisonnement ? ──────────────────────
export function correction(day) {
  const f = solPath(day);
  if (!existsSync(f)) return { exists: false };
  const t = R(f);
  const p = prose(t);
  return {
    exists: true,
    mots: p.split(/\s+/).filter(Boolean).length,
    code: codeLines(t),
    /** Explique POURQUOI la bonne réponse est bonne. */
    pourquoi: /parce que|car\b|la raison|pourquoi|puisque|en effet/i.test(p),
    /** Traite l'erreur PROBABLE, pas seulement la bonne réponse. */
    erreurProbable: /erreur (courante|classique|fréquente|typique)|piège|confusion|on confond|à tort|au lieu de|tentation|séduisant/i.test(p),
    /** Donne un critère vérifiable par l'apprenant seul. */
    critere: /vérifie|critère|tu dois obtenir|attendu\s*:|réussi si|checklist/i.test(p),
    /** Montre une alternative ou un compromis. */
    alternative: /alternative|autre approche|variante|on aurait pu|à la place/i.test(p),
  };
}

// ── Programme principal ──────────────────────────────────────────────────
if (process.argv[1]?.endsWith('v67-audit.mjs')) {
  const P = JSON.parse(R('data/program.json'));
  const lessonFiles = readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md'));
  const med = (x) => { const s = [...x].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
  const pct = (a, n) => `${Math.round((100 * a) / n)} %`;

  // — Leçons —
  const lecons = lessonFiles.map((f) => {
    const md = R(`curriculum/lessons/${f}`);
    return { slug: f.replace('.md', ''), ...famille(md), ...grammaire(md), soup: keywordSoup(md).pireFenetre, mots: words(md) };
  });
  const parFam = (k) => lecons.filter((l) => l.famille === k);
  console.log('══ LEÇONS ══', lecons.length);
  for (const k of ['A', 'B', 'C', '?']) {
    const r = parFam(k);
    if (!r.length) continue;
    console.log(`  famille ${k} : ${r.length} · noyau médian ${med(r.map((x) => x.core))} · total médian ${med(r.map((x) => x.mots))}`);
  }
  const FONC = Object.keys(FONCTIONS);
  console.log('  fonctions pédagogiques présentes :');
  for (const f of FONC) {
    const n = lecons.filter((l) => l[f]).length;
    console.log(`    ${f.padEnd(16)} ${String(n).padStart(3)} / ${lecons.length}  ${pct(n, lecons.length)}`);
  }
  const manquantes = lecons.map((l) => ({ slug: l.slug, n: FONC.filter((f) => !l[f]).length }));
  console.log(`  leçons auxquelles il manque ≥ 4 fonctions : ${manquantes.filter((x) => x.n >= 4).length}`);
  console.log(`  pire fenêtre de 3 lignes (termes marqués) : médiane ${med(lecons.map((l) => l.soup))} · max ${Math.max(...lecons.map((l) => l.soup))}`);

  // — Journées —
  const rev = new Set(P.days.filter((d) => /revue hebdo/i.test(d.title ?? '')).map((d) => d.day));
  const charges = P.days.map((d) => charge(d.day)).filter(Boolean);
  const horsRevue = charges.filter((c) => !rev.has(c.day));
  console.log('\n══ JOURNÉES ══', charges.length, `(dont ${rev.size} revues)`);
  console.log(`  durée annoncée : ${[...new Set(charges.map((c) => c.declaree))].join(', ')} min pour toutes`);
  console.log(`  minutes de lecture — médiane ${med(charges.map((c) => c.minutesLues))} · p10 ${[...charges.map((c) => c.minutesLues)].sort((a, b) => a - b)[Math.floor(charges.length * 0.1)]} · p90 ${[...charges.map((c) => c.minutesLues)].sort((a, b) => a - b)[Math.floor(charges.length * 0.9)]}`);
  console.log(`  mots décrivant le TRAVAIL — médiane ${med(charges.map((c) => c.motsTravail))} · p10 ${[...charges.map((c) => c.motsTravail)].sort((a, b) => a - b)[36]} · journées sous 40 mots : ${charges.filter((c) => c.motsTravail < 40).length}`);
  console.log(`  cases à cocher — médiane ${med(charges.map((c) => c.cases))} · journées à 0 : ${charges.filter((c) => c.cases === 0).length}`);
  console.log(`  livrable décrit (> 8 mots) : ${charges.filter((c) => c.livrable).length} / ${charges.length}`);
  console.log(`  travail DÉLÉGUÉ à un fichier extérieur : ${charges.filter((c) => c.delegue).length}`);
  console.log(`  journées annonçant plus de 2× leur temps de lecture : ${charges.filter((c) => c.ratio !== null && c.ratio < 0.5).length}`);
  console.log(`  journées annonçant plus de 4× : ${charges.filter((c) => c.ratio !== null && c.ratio < 0.25).length}`);
  console.log(`  hors revues : lecture médiane ${med(horsRevue.map((c) => c.minutesLues))} min · mots de travail médiane ${med(horsRevue.map((c) => c.motsTravail))}`);

  // — Revues —
  const revues = [...rev].sort((a, b) => a - b).map(revue).filter(Boolean);
  console.log('\n══ REVUES HEBDOMADAIRES ══', revues.length);
  console.log(`  mots — médiane ${med(revues.map((r) => r.mots))} · min ${Math.min(...revues.map((r) => r.mots))} · max ${Math.max(...revues.map((r) => r.mots))}`);
  console.log(`  composants sur 11 — médiane ${med(revues.map((r) => r.composants))} · min ${Math.min(...revues.map((r) => r.composants))} · max ${Math.max(...revues.map((r) => r.composants))}`);
  for (const k of Object.keys(COMPOSANTS_REVUE)) {
    const n = revues.filter((r) => r[k]).length;
    console.log(`    ${k.padEnd(24)} ${String(n).padStart(3)} / ${revues.length}`);
  }
  console.log(`  revues à ≥ 8 composants sur 11 : ${revues.filter((r) => r.composants >= 8).length}`);

  // — Corrections —
  const cors = P.days.map((d) => correction(d.day)).filter((c) => c && c.exists);
  console.log('\n══ CORRECTIONS ══', cors.length);
  console.log(`  mots — médiane ${med(cors.map((c) => c.mots))} · avec code : ${cors.filter((c) => c.code > 0).length}`);
  for (const k of ['pourquoi', 'erreurProbable', 'critere', 'alternative']) {
    const n = cors.filter((c) => c[k]).length;
    console.log(`    ${k.padEnd(16)} ${String(n).padStart(3)} / ${cors.length}  ${pct(n, cors.length)}`);
  }
  const troisSur4 = cors.filter((c) => ['pourquoi', 'erreurProbable', 'critere', 'alternative'].filter((k) => c[k]).length >= 3).length;
  console.log(`  corrections réunissant ≥ 3 des 4 marqueurs : ${troisSur4} / ${cors.length}  ${pct(troisSur4, cors.length)}`);

  if (process.argv.includes('--json')) {
    console.log('\n' + JSON.stringify({ lecons, charges, revues, cors }, null, 1));
  }
}

// ── 8. Signal explicatif du noyau — SONDE ÉCARTÉE ────────────────────────
//
// HUITIÈME FAUX POSITIF DU PROJET, et le plus embarrassant : il répète
// exactement l'erreur que V66 avait documentée sous FP-3.
//
// L'idée était de compter les marqueurs causaux (« donc », « d'où », « piège »,
// « au lieu de ») dans le noyau, pour ORDONNER les 128 leçons et décider quoi
// lire en premier. Résultat : `embeddings` — la leçon durcie en V66, dont le
// noyau explique mécaniquement le produit scalaire, la norme et pourquoi on
// divise par les deux longueurs — arrive DERNIÈRE, avec une densité de 0,2.
//
// La raison est la même qu'en V66 : un texte français explique par
// juxtaposition et par le deux-points au moins autant que par des connecteurs.
// « On divise ensuite par les deux longueurs, ce qui annule l'effet de la
// taille du texte » est une phrase causale sans aucun mot de la liste.
//
// La sonde est donc ÉCARTÉE, pas raffinée. Le ciblage de la lecture se fait
// sur deux critères objectifs qui ne dépendent d'aucun vocabulaire : la
// TAILLE du noyau, et les FONCTIONS pédagogiques absentes. Le code reste ici
// pour que l'erreur soit reproductible et ne soit pas refaite une troisième
// fois.

//
// SONDE, et elle mérite son avertissement. Elle ne mesure PAS si un noyau
// enseigne : elle repère les marqueurs qu'un texte explicatif laisse quand il
// expose un mécanisme plutôt qu'un nom. Un noyau peut les porter tous et rester
// creux ; un noyau peut n'en porter aucun et être limpide. Elle sert
// uniquement à ORDONNER les 128 leçons pour décider quoi lire en premier.
//
// Calibrée en lisant `react-fundamentals` (famille A au classement, mais
// excellent : l'état-instantané y est expliqué mécaniquement, avec le piège du
// double `setCount`) et `javascript-basics` (famille C, également excellent).
// Le classement A/B/C ne prédit pas la qualité — c'est le constat central du
// CP0 de V67, et cette sonde existe parce qu'il fallait autre chose.
export function signalExplicatif(md) {
  const S = sections(md);
  const i = S.findIndex((s) => /explication (compl|progressive)|concepts cl[ée]s/i.test(s.title));
  const b = i >= 0 ? S[i].body : '';
  const p = prose(b);
  const compte = (re) => (p.match(re) ?? []).length;
  return {
    /** Conséquence énoncée : le texte relie une cause à un effet. */
    causalite: compte(/\b(donc|d'où|c'est pourquoi|par conséquent|conséquence|ce qui (fait|rend|permet|explique)|puisque|résultat\s*:)/gi),
    /** Le texte nomme un comportement qui SURPREND — signe qu'il anticipe le lecteur. */
    piege: compte(/\b(piège|attention|surprend|contre-intuitif|erreur|se trompe|croit|paraît|semble)/gi),
    /** Instance concrète : un chiffre, un identifiant, un exemple nommé. */
    concret: (b.match(/`[^`\n]+`/g) ?? []).length + compte(/\b\d+([.,]\d+)?\s*(%|mo|go|ms|s|min|octets?|dimensions?)\b/gi),
    /** Contraste explicite entre deux options. */
    contraste: compte(/\b(au lieu de|plutôt que|contrairement|alors que|vs\.?|tandis que|à l'inverse|mais)/gi),
    /** Le texte s'adresse au lecteur et dirige son attention. */
    adresse: compte(/\b(tu |ton |ta |tes |imagine|remarque|note que|regarde)/gi),
    mots: words(b),
  };
}

// ── 9. Échec au contrat structurel V67 ───────────────────────────────────
//
// Quatre défauts, chacun OBSERVABLE et chacun calibré sur une lecture réelle.
// Ce n'est pas un score : c'est une liste de conditions d'échec, et une leçon
// qui en déclenche une est LUE avant d'être déclarée en dette.
//
// Calibration (CP0 de V67, lectures directes) :
//   `database-modeling`, `llm-observability` — noyaux DENSES et justes, mais
//   six sujets indépendants en six puces, sans progression de l'un à l'autre,
//   et sans un seul moment où l'apprenant fait quelque chose avant l'exemple
//   guidé. Ce sont d'excellentes fiches de révision. C'est F1.
//   `technical-storytelling` — STAR est nommé, ses quatre lettres développées,
//   et aucun récit STAR n'est jamais montré. C'est F3 + F4.
//   `react-fundamentals`, `javascript-basics` — ne déclenchent rien, et sont
//   effectivement excellents. La règle ne punit pas ce qui marche.
export function echecContrat(md) {
  const S = sections(md);
  const i = S.findIndex((s) => /explication (compl|progressive)|concepts cl[ée]s/i.test(s.title));
  const b = i >= 0 ? S[i].body : '';
  const puces = (b.match(/^\s*[-*]\s+\*\*/gm) ?? []).length;
  const sousTitres = (b.match(/^### /gm) ?? []).length;
  const leads = (b.match(/^\*\*[^*\n]{3,80}\.?\*\*/gm) ?? []).length;
  const g = grammaire(md);
  // `correction` est retirée des fonctions exigées AU NIVEAU DE LA LEÇON : le
  // corpus place les corrections dans `curriculum/solutions/` (365 fichiers),
  // et seules 39 leçons en portent une en propre. Exiger des 128 une section
  // que l'architecture du corpus place ailleurs mesurerait une incohérence de
  // rangement, pas un défaut pédagogique. La qualité des corrections est
  // auditée séparément, sur les 365 solutions.
  const EXIGEES = Object.keys(FONCTIONS).filter((f) => f !== 'correction');
  const fonctionsAbsentes = EXIGEES.filter((f) => !g[f]);
  const exGuide = /^##[^\n]*exemple guid[\s\S]*?(?=^## |\Z)/im.exec(md)?.[0] ?? '';

  // F1 — DRAPEAU DE LECTURE, PAS CONDITION D'ÉCHEC.
  //
  // « Le noyau est une liste plate d'au moins quatre puces » attrape bien
  // `database-modeling` (six sujets indépendants, aucune progression de l'un à
  // l'autre) — et attrape aussi `react-fundamentals`, dont les six puces
  // s'appuient l'une sur l'autre (props → state → l'état est un instantané →
  // où vit l'état → clés → état minimal) et qui est excellent.
  //
  // Ce qui les sépare — des puces qui SE SUIVENT contre des puces
  // JUXTAPOSÉES — je ne sais pas le détecter mécaniquement, et prétendre le
  // contraire serait fabriquer une mesure. F1 déclenche donc une LECTURE ;
  // c'est la lecture qui décide. Il n'entre pas dans `echoue`.
  const F1 = puces >= 4 && sousTitres === 0 && leads === 0;
  const F2 = fonctionsAbsentes.length >= 4;
  const F3 = words(b) < 200;
  // F4, DEUXIÈME VERSION — la première était un détecteur de FORMAT.
  //
  // Écrite d'abord comme « pas de section correction ET pas de `**Raisonnement`
  // dans l'exemple guidé », elle accusait 89 leçons, dont
  // `observability-fundamentals` et `algorithmic-thinking` — deux leçons lues
  // et jugées excellentes avant toute mesure. Leur tort : raisonner en étapes
  // numérotées plutôt qu'avec un intertitre en gras. C'est le neuvième faux
  // positif du projet, et c'est toujours le même : mesurer un marqueur
  // typographique en croyant mesurer une substance.
  //
  // Version retenue, indifférente au format : l'exemple guidé doit dérouler une
  // SUITE d'au moins trois étapes — numérotées, à puces, ou introduites en
  // gras. Un exemple qui donne la réponse sans le chemin ne montre rien.
  const etapes = (exGuide.match(/^\s*(?:\d+\.|[-*])\s+\S/gm) ?? []).length
    + (exGuide.match(/^\*\*[^*\n]{3,40}\*\*/gm) ?? []).length;
  // Une CONTRASTE entre deux approches est un raisonnement complet, même en
  // deux lignes : `algorithmic-thinking` oppose « naïf O(n×k) » à « fenêtre
  // glissante O(n) », et cela montre le chemin aussi bien qu'une liste de six
  // étapes. Constaté par lecture avant de regarder le compte.
  const contraste = /\b(na[ïi]f|naïve|au lieu de|plutôt que|avant\s*:|❌)/i.test(exGuide)
    && /\b(mieux|meilleur|✅|donc|après\s*:|optimis)/i.test(exGuide);
  const F4 = !/\*\*Raisonnement/i.test(exGuide) && etapes < 3 && !contraste;

  return {
    F1, F2, F3, F4,
    /**
     * ÉCHEC OBJECTIF = F2 ou F3 seulement.
     *
     * F1 et F4 sont des DRAPEAUX DE LECTURE. J'ai tenté trois fois d'affiner
     * F4 pour qu'il cesse d'accuser `algorithmic-thinking` — dont l'exemple
     * guidé oppose « naïf O(n×k) » à « fenêtre glissante O(n) », un
     * raisonnement complet en deux lignes. À la troisième tentative, il est
     * devenu évident que j'itérais une expression régulière jusqu'à ce qu'elle
     * soit d'accord avec ma lecture : exactement le geste que la règle 4 des
     * deux derniers sprints interdit, et le neuvième faux positif du projet.
     *
     * Conséquence assumée et publiée : les conditions objectives
     * SOUS-DÉTECTENT. 17 leçons échouent mécaniquement ; la lecture en trouve
     * davantage. C'est la lecture qui dimensionne V67, pas ce compteur.
     */
    echoue: F2 || F3,
    noyau: words(b), puces, sousTitres, leads,
    fonctionsAbsentes,
  };
}
