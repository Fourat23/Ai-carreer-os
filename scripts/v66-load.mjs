// V66 · CP0 — CHARGE RÉELLE (brief §I) : que contient concrètement une journée
// annoncée à 4,5 h, et combien de temps ce contenu occupe-t-il réellement ?
//
// AVERTISSEMENT MÉTHODOLOGIQUE.
//
// Ce script ne mesure PAS « le temps d'apprentissage ». Personne ne peut le
// mesurer depuis un fichier. Il mesure deux choses distinctes, et il refuse de
// les confondre :
//
//   1. Le temps de CONSOMMATION du texte fourni — borne INFÉRIEURE, calculable.
//      Lire 4 000 mots de prose technique prend un temps qu'on peut encadrer.
//   2. Le temps de PRODUCTION demandé — NON calculable depuis le corpus, parce
//      que le corpus ne le chiffre jamais. « Écris un script qui… » peut
//      prendre 20 minutes ou 3 heures.
//
// Le résultat utile n'est donc pas « une journée dure X heures ». C'est :
//   — combien de minutes de contenu FOURNI la journée contient ;
//   — quelle fraction des 4,5 h annoncées cela représente ;
//   — et donc quelle fraction repose sur un travail dont le produit ne dit
//     RIEN : ni durée, ni découpage, ni critère d'arrêt.
//
// Modèle de conversion, publié AVANT la mesure et non réajusté après
// (règle absolue 4 du brief) :
//   prose technique lue avec compréhension ....... 150 mots / minute
//   code lu ligne à ligne ......................... 20 lignes / minute
//   question de rappel actif (lire, répondre, vérifier) ... 1,5 min / question
//   question de réflexion ouverte ................. 4 min / question
// Ces taux sont des ordres de grandeur défendables pour un adulte
// débutant/intermédiaire sur un sujet nouveau. Ils sont volontairement
// GÉNÉREUX côté lecture (150 mots/min est rapide pour de la technique) : ils
// produisent donc une borne inférieure, pas une estimation flatteuse.

import { readFileSync, existsSync } from 'node:fs';

const R = (p) => readFileSync(p, 'utf8');
const dayPath = (n) => `curriculum/days/day-${String(n).padStart(3, '0')}.md`;
const solPath = (n) => `curriculum/solutions/day-${String(n).padStart(3, '0')}-solution.md`;

const WPM = 150;
const LPM = 20;
const MIN_PER_RECALL = 1.5;
const MIN_PER_REFLECTION = 4;

const proseOf = (t) => t.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
const words = (t) => proseOf(t).split(/\s+/).filter(Boolean).length;
const codeLines = (t) =>
  [...t.matchAll(/```[\s\S]*?```/g)]
    .map((m) => m[0].split('\n').length - 2)
    .reduce((a, b) => a + Math.max(0, b), 0);

/** Découpe un markdown en sections de niveau 2, titre normalisé. */
function sections(md) {
  const out = [];
  const re = /^## +(.+)$/gm;
  const hits = [...md.matchAll(re)];
  for (let i = 0; i < hits.length; i++) {
    const start = hits[i].index + hits[i][0].length;
    const end = i + 1 < hits.length ? hits[i + 1].index : md.length;
    out.push({ title: hits[i][1].replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim(), body: md.slice(start, end) });
  }
  return out;
}

/**
 * Sept postes, tirés du brief §I. Le classement se fait sur le TITRE de section
 * du corpus, jamais sur une devinette de contenu.
 */
// La table a été COMPLÉTÉE, pas ajustée : le premier jet laissait 9 titres
// systématiques dans « autre » (Prérequis ×128, Liens avec le programme ×128,
// Questions d'entretien ×79 — le motif exigeait le singulier —, Consigne IA
// ×78, Checklist ×71, Concepts clés ×45, Exemple simple ×39, Exemple appliqué
// ×39, Sécurité ×24). Le correctif est dicté par cette liste de manques,
// relevée AVANT de regarder son effet sur les totaux.
//
// Deux arbitrages explicites, à contester si on les juge faux :
//   — « Exemple simple » et « Exemple appliqué » sont des ILLUSTRATIONS à
//     lire, pas une pratique : ils vont en lecture. Seul « Exemple guidé »,
//     qui déroule énoncé → raisonnement → solution, compte comme pratique
//     guidée.
//   — « À retenir » est un RÉSUMÉ à lire, pas une question : le classer en
//     rappel comptait chacune de ses puces à 1,5 min et gonflait le poste de
//     moitié. Ne restent en `rappel` que les dispositifs exigeant une
//     PRODUCTION avant de montrer la réponse.
const POSTES = {
  lecture: [
    /cours/i, /objectif/i, /pourquoi/i, /cas (m[ée]tier|professionnel)/i, /ressources/i,
    /vocabulaire/i, /explication/i, /mod[èe]le mental/i, /le probl[èe]me/i, /[àa] retenir/i,
    /pr[ée]requis/i, /liens avec le programme/i, /concepts cl[ée]s/i, /exemple (simple|appliqu)/i,
    /s[ée]curit[ée]/i, /rep[èe]res/i, /commandes essentielles/i, /trade-?offs/i, /limites/i,
    /architecture/i, /m[ée]thode/i, /d[ée]composition/i, /vers le (conteneur|cloud)/i, /diagnostic/i,
  ],
  pratiqueGuidee: [/exemple guid/i, /pas [àa] pas/i, /que faire dans ce cas/i],
  pratiqueAutonome: [/pratique/i, /livrable/i, /crit[èe]res de validation/i, /d[ée]fi/i, /mission/i, /mise en pratique/i],
  correction: [/correction/i, /erreurs fr[ée]quentes/i, /anti-?pattern/i, /pi[èe]ge/i, /contre-exemple/i],
  rappel: [/quiz/i, /rappel/i, /auto-?[ée]valuation/i, /v[ée]rification de compr/i, /checklist/i, /mini-exercice/i],
  reflexion: [/r[ée]flexion/i, /questions? d.entretien/i, /^entretien/i],
  revue: [/revue/i, /bilan/i, /synth[èe]se/i],
  consigne: [/consigne d.utilisation de l.ia/i],
};

function classify(title) {
  for (const [poste, pats] of Object.entries(POSTES)) {
    if (pats.some((p) => p.test(title))) return poste;
  }
  return 'autre';
}

function countItems(body) {
  return (body.match(/^\s*(?:[-*]|\d+\.)\s+\S/gm) ?? []).length;
}

export function loadOf(day) {
  const dp = dayPath(day);
  if (!existsSync(dp)) return null;
  const dayMd = R(dp);
  const slugs = [...new Set([...dayMd.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  const lessonMds = slugs
    .map((s) => `curriculum/lessons/${s}.md`)
    .filter(existsSync)
    .map(R);
  const sol = existsSync(solPath(day)) ? R(solPath(day)) : '';

  const buckets = {};
  const add = (poste, w, c) => {
    buckets[poste] = buckets[poste] ?? { words: 0, code: 0, minutes: 0 };
    buckets[poste].words += w;
    buckets[poste].code += c;
    buckets[poste].minutes += w / WPM + c / LPM;
  };

  let recallQuestions = 0;
  let reflectionQuestions = 0;

  for (const md of [dayMd, ...lessonMds]) {
    for (const s of sections(md)) {
      const poste = classify(s.title);
      const w = words(s.body);
      const c = codeLines(s.body);
      if (poste === 'rappel') recallQuestions += countItems(s.body);
      else if (poste === 'reflexion') reflectionQuestions += countItems(s.body);
      add(poste, w, c);
    }
  }
  // La correction fournie est du contenu à LIRE puis à comparer à sa propre
  // production : on la compte au poste correction.
  if (sol) add('correction', words(sol), codeLines(sol));

  buckets.rappel = buckets.rappel ?? { words: 0, code: 0, minutes: 0 };
  buckets.rappel.minutes += recallQuestions * MIN_PER_RECALL;
  buckets.reflexion = buckets.reflexion ?? { words: 0, code: 0, minutes: 0 };
  buckets.reflexion.minutes += reflectionQuestions * MIN_PER_REFLECTION;

  const fourni = Object.values(buckets).reduce((n, b) => n + b.minutes, 0);

  // PRODUCTION DEMANDÉE : le corpus donne-t-il un BUDGET DE TEMPS PAR ACTIVITÉ ?
  // Question distincte de « le fichier contient-il un nombre suivi de min/h » :
  // la durée globale de 4,5 h est en tête de chaque journée et déclencherait
  // un vrai partout. On ne cherche donc une durée QUE dans les sections, pas
  // dans le préambule.
  const corps = dayMd.slice(dayMd.search(/^## /m) < 0 ? 0 : dayMd.search(/^## /m));
  const budgets = [...corps.matchAll(/^.*?(\d+(?:[.,]\d+)?)\s*(min\b|minutes\b|h\b|heures\b).*$/gim)].map((m) => m[0].trim());
  // Deux lignes de gabarit portent une durée sur TOUTES les journées : « Tente
  // seul au moins 30 minutes » et « expliquer chaque décision à l'oral, en
  // 2 minutes ». Ce sont des consignes génériques, pas un budget de la journée :
  // les compter ferait dire au corpus qu'il chiffre ses activités, ce qu'il ne
  // fait pas. On isole donc les durées PROPRES à la journée.
  // Trois formulations du même gabarit, à couvrir toutes : le premier jet n'en
  // couvrait que deux et laissait « J'ai d'abord tenté seul (sans IA) au moins
  // 30 minutes » passer pour un budget propre à la journée sur 60 % du corpus.
  const GABARIT = [
    /tent[ée] seul[^.]*au moins \d+ minutes/i,
    /[àa] l.oral,? en \d+ minutes/i,
    /\d+ minutes d.effort r[ée]el minimum/i,
  ];
  const budgetsPropres = budgets.filter((b) => !GABARIT.some((g) => g.test(b)));

  return {
    day,
    lessons: slugs.length,
    buckets,
    recallQuestions,
    reflectionQuestions,
    minutesFournies: Math.round(fourni),
    part45: Math.round((fourni / 270) * 100),
    budgetsParActivite: budgets,
    budgetsPropres,
  };
}

if (process.argv[1]?.endsWith('v66-load.mjs')) {
  const arg = process.argv[2];
  const days = arg === '--sample'
    ? JSON.parse((await import('node:child_process')).execSync('node scripts/v66-sample.mjs --json').toString()).days.map((d) => d.day)
    : arg === '--all'
      ? Array.from({ length: 365 }, (_, i) => i + 1)
      : [Number(arg)];

  const rows = days.map(loadOf).filter(Boolean);
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    const POSTE_ORDER = ['lecture', 'pratiqueGuidee', 'pratiqueAutonome', 'correction', 'rappel', 'reflexion', 'revue', 'consigne', 'autre'];
    console.log('jour  lect  guid  corr  rapp  refl  auto  min   %4h30');
    for (const r of rows) {
      const m = (p) => String(Math.round(r.buckets[p]?.minutes ?? 0)).padStart(5);
      console.log(
        String(r.day).padStart(4),
        m('lecture'), m('pratiqueGuidee'), m('correction'), m('rappel'), m('reflexion'), m('pratiqueAutonome'),
        String(r.minutesFournies).padStart(5),
        String(r.part45 + ' %').padStart(7),
      );
    }
    const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
    console.log('\nCONTENU FOURNI, en minutes (borne inférieure) :');
    console.log(`  médiane ${med(rows.map((r) => r.minutesFournies))} min · min ${Math.min(...rows.map((r) => r.minutesFournies))} · max ${Math.max(...rows.map((r) => r.minutesFournies))}`);
    console.log(`  médiane des 4 h 30 annoncées : ${med(rows.map((r) => r.part45))} %`);
    for (const p of POSTE_ORDER) {
      const vals = rows.map((r) => Math.round(r.buckets[p]?.minutes ?? 0));
      console.log(`  ${p.padEnd(16)} médiane ${String(med(vals)).padStart(4)} min · max ${String(Math.max(...vals)).padStart(4)}`);
    }
    const sansBudget = rows.filter((r) => r.budgetsPropres.length === 0).length;
    console.log(`\n  journées sans AUCUN budget de temps propre à leurs activités : ${sansBudget} / ${rows.length}`);
    console.log('  (seules durées présentes : deux lignes de gabarit identiques sur toutes les journées)');
  }
}
