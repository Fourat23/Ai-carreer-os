// V67 · CP2 — ANATOMIE RÉELLE DES 365 JOURNÉES. LECTURE SEULE.
//
// Le CP0 a mesuré les LEÇONS. Mais l'apprenant ne lit pas les leçons : il suit
// les JOURNÉES, et ce sont elles qui portent l'essentiel du cours. Ce script
// mesure ce que chaque journée contient réellement, et ce vers quoi elle
// pointe. Il ne juge pas ; il compte, et il dit où lire.

import { readFileSync } from 'node:fs';

const P = JSON.parse(readFileSync('data/program.json', 'utf8'));
const prose = (t) => t.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
const words = (t) => prose(t).split(/\s+/).filter(Boolean).length;
const codeLines = (t) => [...t.matchAll(/```[\s\S]*?```/g)]
  .map((m) => Math.max(0, m[0].split('\n').length - 2)).reduce((a, b) => a + b, 0);

/**
 * Découpe en sections de niveau 2 puis rend le corps de la première dont le
 * titre correspond.
 *
 * Première version écrite comme une seule expression avec `(?=^## |$)` en
 * drapeau `m` : `$` y signifie « fin de LIGNE », si bien que chaque section
 * s'arrêtait à la fin de son propre titre. Elle a rendu « 0/365 livrables » et
 * « médiane de 5 mots de cours » sur un corpus où le jour 79 porte à lui seul
 * 2 500 mots, un livrable et trois critères cochables. Un chiffre spectaculaire
 * et faux de plus — celui-ci a été attrapé parce qu'il contredisait une lecture
 * faite dix minutes plus tôt, pas par le compteur.
 */
const SEC = (md, re) => {
  const h = [...md.matchAll(/^## +(.+)$/gm)];
  const rx = new RegExp(re, 'i');
  const i = h.findIndex((m) => rx.test(m[1]));
  if (i < 0) return '';
  return md.slice(h[i].index, i + 1 < h.length ? h[i + 1].index : md.length);
};

export function anatomie() {
  return P.days.map((d) => {
    let md = '';
    try { md = readFileSync(`curriculum/days/day-${String(d.day).padStart(3, '0')}.md`, 'utf8'); } catch { return null; }
    const lecons = [...new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))];
    // « objectif du jour » précède « cours approfondi » : le chercher dans la
    // même alternative rendait la première section trouvée, longue d'une ligne,
    // d'où une « médiane de 10 mots de cours ». On demande le cours, et on ne
    // se rabat sur l'objectif que s'il n'y a pas de cours.
    const cours = SEC(md, 'cours approfondi') || SEC(md, 'objectif du jour');
    const exGuide = SEC(md, 'exemple guid');
    const pratique = SEC(md, 'pratique autonome|mise en pratique');
    const quiz = SEC(md, 'mini-quiz|quiz');
    const livrable = SEC(md, 'livrable');
    const criteres = SEC(md, 'crit[èe]res de validation');
    // La section « À retenir » de beaucoup de journées renvoie vers des
    // « leçons de fond » par TITRE. On extrait ces titres pour vérifier
    // qu'ils correspondent bien aux leçons que la journée a réellement liées.
    const retenir = SEC(md, '[àa] retenir');
    const renvoi = /Approfondis via la le[çc]on de fond\s*:\s*([^\n]+)/i.exec(retenir)?.[1] ?? '';
    return {
      day: d.day,
      titre: d.title,
      skill: d.skill,
      heures: d.hours,
      isReview: !!d.isReview,
      projet: d.project ?? null,
      motsTotal: words(md),
      motsCours: words(cours),
      lignesCode: codeLines(md),
      lecons,
      aExGuide: !!exGuide,
      aPratique: !!pratique,
      aQuiz: !!quiz,
      // « au moins 20 mots », et non `\w{20,}` — qui exigeait vingt caractères
      // de mot CONSÉCUTIFS, donc aucun espace, et rendait 0/365.
      aLivrable: words(livrable) >= 20,
      motsLivrable: words(livrable),
      aCriteres: (criteres.match(/^\s*-\s*\[ \]/gm) ?? []).length,
      renvoiTitres: renvoi,
    };
  }).filter(Boolean);
}

if (process.argv[1]?.endsWith('v67-days.mjs')) {
  const A = anatomie();
  if (process.argv.includes('--json')) { console.log(JSON.stringify(A, null, 1)); process.exit(0); }
  const med = (a) => { const b = [...a].sort((x, y) => x - y); return b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2; };
  const n = A.length;
  const pct = (k) => `${A.filter(k).length}/${n}`;
  console.log(`${n} journées`);
  console.log(`  mots (médiane)        ${med(A.map((x) => x.motsTotal))}`);
  console.log(`  mots de cours (méd.)  ${med(A.map((x) => x.motsCours))}`);
  console.log(`  lignes de code (méd.) ${med(A.map((x) => x.lignesCode))}`);
  console.log(`  exemple guidé         ${pct((x) => x.aExGuide)}`);
  console.log(`  pratique autonome     ${pct((x) => x.aPratique)}`);
  console.log(`  mini-quiz             ${pct((x) => x.aQuiz)}`);
  console.log(`  livrable non vide     ${pct((x) => x.aLivrable)}`);
  console.log(`  ≥3 critères cochables ${pct((x) => x.aCriteres >= 3)}`);
  console.log(`  aucun lien de leçon   ${pct((x) => x.lecons.length === 0)}`);
  console.log(`  renvoi « leçon de fond » présent  ${pct((x) => x.renvoiTitres)}`);
}
