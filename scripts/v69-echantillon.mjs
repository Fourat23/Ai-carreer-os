// V69 CP13 — tirage aveugle REPRODUCTIBLE, effectué AVANT de lire les résultats.
// Graine brûlée : 20260829. Les graines V68 (20261101, 20261102) sont épuisées.
// Le tirage inclut délibérément des leçons RÉÉCRITES et des leçons INTOUCHÉES :
// un échantillon qui ne contiendrait que le périmètre ne pourrait pas contredire
// le sprint.
import fs from 'node:fs';

const SEED = 20260829;
let s = SEED;
const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

const PERIMETRE = new Set(JSON.parse(fs.readFileSync('docs/v69/perimetre.json', 'utf8')));
const toutes = fs.readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, '')).sort();

const tirer = (pool, n) => {
  const p = [...pool];
  for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  return p.slice(0, n).sort();
};

const reecrites  = tirer(toutes.filter((l) => PERIMETRE.has(l)), 8);
const intouchees = tirer(toutes.filter((l) => !PERIMETRE.has(l)), 8);

console.log(`# Échantillon aveugle V69 — graine ${SEED}\n`);
console.log(`## Réécrites (8 sur ${PERIMETRE.size})`);
reecrites.forEach((l) => console.log(`- ${l}`));
console.log(`\n## Intouchées (8 sur ${toutes.length - PERIMETRE.size})`);
intouchees.forEach((l) => console.log(`- ${l}`));
