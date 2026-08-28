// V67 · CP11 — CONTRAT TEMPOREL DES 365 JOURNÉES. LECTURE SEULE.
//
// Modèle de lecture, repris À L'IDENTIQUE du CP0 et non réajusté :
//   prose technique lue avec compréhension .... 150 mots / minute
//   code lu ligne à ligne ..................... 20 lignes / minute
//   question de rappel .............. 1,5 min · question ouverte ..... 4 min
//
// DEUX grandeurs, et il ne faut jamais les additionner :
//   — `minutesLues`   : le temps pour CONSOMMER ce que la journée fournit.
//                       Calculable, reproductible.
//   — `activiteConcrete` : la journée demande-t-elle de PRODUIRE quelque chose,
//                       avec une consigne et un critère d'achèvement ? Un
//                       booléen, pas une durée : « refactorer une API en trois
//                       couches » ne se chronomètre pas, et lui attribuer
//                       270 minutes serait inventé.
//
// La condition 5 du barème gelé se lit exactement ainsi : aucune journée
// annoncée 4-5 h ne doit reposer sur moins de 90 minutes de matière SANS
// activité autonome concrète. C'est une disjonction, et c'est elle qu'on teste.

import { readFileSync } from 'node:fs';

const P = JSON.parse(readFileSync('data/program.json', 'utf8'));
const WPM = 150, LPM = 20, MIN_RAPPEL = 1.5, MIN_OUVERTE = 4;

const prose = (t) => t.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
const words = (t) => prose(t).split(/\s+/).filter(Boolean).length;
const codeLines = (t) => [...t.matchAll(/```[\s\S]*?```/g)]
  .map((m) => Math.max(0, m[0].split('\n').length - 2)).reduce((a, b) => a + b, 0);

const SEC = (md, re) => {
  const h = [...md.matchAll(/^#{2,3} +(.+)$/gm)];
  const rx = new RegExp(re, 'i');
  const i = h.findIndex((m) => rx.test(m[1]));
  if (i < 0) return '';
  return md.slice(h[i].index, i + 1 < h.length ? h[i + 1].index : md.length);
};

export function charge() {
  return P.days.map((d) => {
    let md = '';
    try { md = readFileSync(`curriculum/days/day-${String(d.day).padStart(3, '0')}.md`, 'utf8'); } catch { return null; }

    const minutesLues = Math.round(words(md) / WPM + codeLines(md) / LPM);

    // Questions : rappel (mini-quiz, checklist) et ouvertes (réflexion, tests).
    const quiz = (SEC(md, 'mini-quiz|quiz').match(/^\s*\d+\./gm) ?? []).length;
    const coches = (md.match(/^\s*-\s*\[ \]/gm) ?? []).length;
    const reflexion = (SEC(md, 'questions de r[ée]flexion').match(/^\s*-\s+\S/gm) ?? []).length;
    const minutesQuestions = Math.round(quiz * MIN_RAPPEL + coches * MIN_RAPPEL + reflexion * MIN_OUVERTE);

    // Activité autonome CONCRÈTE : une consigne de production ET un moyen de
    // savoir que c'est fini. Les deux, pas l'un des deux — une consigne sans
    // critère est le « pratique 90 min » que le brief interdit.
    const pratique = SEC(md, 'pratique autonome|mise en pratique|test pratique|mini-projet');
    const livrable = SEC(md, 'livrable|mini-projet');
    const criteres = (md.match(/^\s*-\s*\[ \]/gm) ?? []).length;
    const consigne = words(pratique) >= 15;
    const activiteConcrete = consigne && (words(livrable) >= 8 || criteres >= 3);

    return {
      day: d.day,
      heuresAnnoncees: d.hours,
      isReview: !!d.isReview,
      minutesLues,
      minutesQuestions,
      minutesMatiere: minutesLues + minutesQuestions,
      activiteConcrete,
      motsPratique: words(pratique),
      criteres,
    };
  }).filter(Boolean);
}

/** Condition 5 du barème gelé. Une journée échoue si les DEUX manquent. */
export const violeCondition5 = (x) =>
  x.heuresAnnoncees >= 4 && x.heuresAnnoncees <= 5
  && x.minutesMatiere < 90 && !x.activiteConcrete;

if (process.argv[1]?.endsWith('v67-charge.mjs')) {
  const C = charge();
  const q = (a, p) => { const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; };
  const mm = C.map((x) => x.minutesMatiere);
  const total = C.reduce((s, x) => s + x.minutesMatiere, 0);

  console.log(`${C.length} journées · toutes annoncées ${[...new Set(C.map((x) => x.heuresAnnoncees))].join('/')} h`);
  console.log('\nMATIÈRE FOURNIE (lecture + questions), en minutes :');
  console.log(`  p10 ${q(mm, 0.1)} · médiane ${q(mm, 0.5)} · p90 ${q(mm, 0.9)} · min ${Math.min(...mm)} · max ${Math.max(...mm)}`);
  console.log(`  total sur l'année : ${Math.round(total / 60)} h de matière fournie, contre ${C.length * 4.5} h annoncées`);
  console.log('\nACTIVITÉ AUTONOME CONCRÈTE (consigne ≥15 mots ET livrable ou ≥3 critères) :');
  console.log(`  ${C.filter((x) => x.activiteConcrete).length}/${C.length}`);
  console.log(`  dont journées ordinaires ${C.filter((x) => !x.isReview && x.activiteConcrete).length}/${C.filter((x) => !x.isReview).length}`);
  console.log(`  dont revues              ${C.filter((x) => x.isReview && x.activiteConcrete).length}/${C.filter((x) => x.isReview).length}`);
  const v = C.filter(violeCondition5);
  console.log(`\nCONDITION 5 DU BARÈME GELÉ — journées à 4-5 h sous 90 min de matière ET sans activité concrète :`);
  console.log(`  ${v.length} violation(s)${v.length ? ' : ' + v.map((x) => 'j.' + x.day).join(', ') : ''}`);
  const sous90 = C.filter((x) => x.minutesMatiere < 90);
  console.log(`\n  (pour information : ${sous90.length} journées sous 90 min de matière, dont ${sous90.filter((x) => x.activiteConcrete).length} sauvées par une activité concrète)`);
  if (process.argv.includes('--json')) console.log(JSON.stringify(C, null, 1));
}
