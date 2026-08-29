// V70 CP0 — classement de priorité. Score de DÉFAUT (plus haut = plus urgent).
// Ce score ne note pas la qualité pédagogique : il agrège des défauts OBSERVABLES.
// La note académique finale se met par lecture (CP3), pas ici.
import { CORPUS } from './extract.mjs';

const defauts = (l) => {
  const d = [];
  if (l.lGuide < 120) d.push(['exemple guidé squelettique (<120 mots)', 3]);
  else if (l.lGuide < 250) d.push(['exemple guidé court (<250 mots)', 1]);
  if (l.gabaritB) d.push(['gabarit Énoncé/Raisonnement/Solution', 2]);
  if (!l.aCorr) d.push(['aucune correction', 3]);
  else if (l.corrSeuleReponse) d.push(['correction = réponse seule (<60 mots)', 2]);
  else if (!l.corrRaisonne) d.push(['correction sans raisonnement', 2]);
  if (!l.aExo) d.push(['aucune pratique', 3]);
  else if (!l.exoLivrable) d.push(['pratique sans production observable', 2]);
  else if (l.lExo < 40) d.push(['pratique trop maigre (<40 mots)', 1]);
  if (!l.aMetier) d.push(['aucun cas professionnel', 1]);
  if (l.lExplic < 250) d.push(['noyau explicatif mince (<250 mots)', 2]);
  if (l.blocsCode === 0) d.push(['aucun bloc de code ni exemple concret', 1]);
  if (!l.programmee) d.push(['hors parcours', 1]);
  return d;
};

const scored = CORPUS.map((l) => {
  const d = defauts(l);
  return { ...l, defauts: d, score: d.reduce((n, [, p]) => n + p, 0) };
}).sort((a, b) => b.score - a.score || a.lGuide - b.lGuide);

console.log('=== LES 20 LEÇONS LES PLUS DÉFICIENTES ===\n');
scored.slice(0, 20).forEach((l, i) => {
  console.log(`${String(i + 1).padStart(2)}. ${l.slug.padEnd(34)} défaut ${String(l.score).padStart(2)} | guidé ${String(l.lGuide).padStart(3)} | exo ${String(l.lExo).padStart(3)} | corr ${String(l.lCorr).padStart(3)}`);
  console.log(`    ${l.defauts.map(([n]) => n).join(' · ')}`);
});

console.log('\n=== LES 10 LEÇONS LES PLUS SOLIDES (score de défaut le plus bas) ===\n');
scored.slice(-10).reverse().forEach((l, i) => {
  console.log(`${String(i + 1).padStart(2)}. ${l.slug.padEnd(34)} défaut ${String(l.score).padStart(2)} | guidé ${String(l.lGuide).padStart(3)} | exo ${String(l.lExo).padStart(3)} | corr ${String(l.lCorr).padStart(3)}${l.defauts.length ? '\n    reste : ' + l.defauts.map(([n]) => n).join(' · ') : ''}`);
});

const bornes = [[0,0,'PASS  (aucun défaut observable)'],[1,2,'P3    (mineur)'],[3,5,'P2    (trop synthétique)'],[6,8,'P1    (insuffisant)'],[9,99,'P0    (bloquant)']];
console.log('\n=== RÉPARTITION PAR PRIORITÉ ===');
for (const [lo, hi, nom] of bornes) {
  const n = scored.filter((l) => l.score >= lo && l.score <= hi).length;
  console.log(`   ${nom.padEnd(34)} ${String(n).padStart(3)}/128`);
}
const aTraiter = scored.filter((l) => l.score >= 3).length;
console.log(`\n   → à réécrire (P0+P1+P2) : ${aTraiter}/128`);
console.log(`   → à examiner sans forcément réécrire : ${128 - aTraiter}`);
