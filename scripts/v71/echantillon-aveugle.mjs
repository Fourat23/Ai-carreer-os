// V71 — échantillon aveugle stratifié, reproductible.
//
// GRAINE PUBLIÉE : 20260831. Elle est écrite ici, dans le dépôt, AVANT toute
// modification du corpus. Relancer ce script sur le même corpus redonne
// exactement la même liste.
//
// Stratification : domaine × longueur (tercile) × dans/hors parcours ×
// score mécanique supposé (tercile de la note de dégrossissage).
// Le but est d'éviter de ne tirer que des leçons déjà connues ou déjà réputées.

import fs from 'node:fs';

export const GRAINE = 20260831;

// Générateur congruentiel linéaire : déterministe, sans dépendance.
const rng = (graine) => {
  let s = graine >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

const corpus = JSON.parse(fs.readFileSync('docs/v70/corpus.json', 'utf8'));
const domaines = JSON.parse(fs.readFileSync('/tmp/domaines.json', 'utf8'));

// Note de dégrossissage : sert UNIQUEMENT à stratifier, jamais à noter.
// Elle mélange profondeur d'exemple, profondeur de correction et pratique.
const brut = (x) =>
  (x.lGuide >= 700 ? 1 : 0) + (x.lCorr >= 644 ? 1 : 0) +
  (x.nPratiqueSecs >= 2 ? 1 : 0) + (x.aVerif ? 1 : 0) + (x.corrD9 >= 4 ? 1 : 0);

const tercile = (v, seuils) => (v <= seuils[0] ? 0 : v <= seuils[1] ? 1 : 2);
const tri = (a) => a.slice().sort((p, q) => p - q);
const L = tri(corpus.map((x) => x.total));
const seuilsL = [L[Math.floor(L.length / 3)], L[Math.floor((2 * L.length) / 3)]];

const strate = (x) =>
  [domaines[x.slug] || '?', tercile(x.total, seuilsL),
   x.programmee ? 'P' : 'H', brut(x) <= 2 ? 'bas' : brut(x) >= 4 ? 'haut' : 'moyen'].join('|');

const groupes = new Map();
for (const x of corpus) {
  const k = strate(x);
  if (!groupes.has(k)) groupes.set(k, []);
  groupes.get(k).push(x.slug);
}

// Un tirage par strate, puis complément aléatoire jusqu'à la taille visée.
const TAILLE = 32;
const r = rng(GRAINE);
const cles = [...groupes.keys()].sort();
const choisis = [];
for (const k of cles) {
  const g = groupes.get(k).slice().sort();
  choisis.push(g[Math.floor(r() * g.length)]);
}
const reste = corpus.map((x) => x.slug).filter((s) => !choisis.includes(s)).sort();
while (choisis.length < TAILLE && reste.length) {
  choisis.push(reste.splice(Math.floor(r() * reste.length), 1)[0]);
}

const sortie = {
  graine: GRAINE,
  strates: cles.length,
  taille: choisis.length,
  empreinteCorpus: process.env.CORPUS_SHA || null,
  lecons: choisis.slice(0, TAILLE).sort(),
};

if (process.argv[1].endsWith('echantillon-aveugle.mjs')) {
  fs.mkdirSync('docs/v71', { recursive: true });
  fs.writeFileSync('docs/v71/ECHANTILLON-AVEUGLE.json', JSON.stringify(sortie, null, 1));
  console.log(`graine ${GRAINE} · ${cles.length} strates · ${sortie.lecons.length} leçons`);
  for (const s of sortie.lecons) console.log('  ' + s);
}
