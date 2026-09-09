// V72 CP6 — le theme declare d une semaine correspond-il aux journees de cette semaine ?
import { readFileSync } from 'node:fs';
const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const src = readFileSync('scripts/data/program-structure.mjs', 'utf8');
const themes = new Map();
for (const m of src.matchAll(/\{\s*week:\s*(\d+),\s*theme:\s*'((?:[^'\\]|\\.)*)'/g)) themes.set(Number(m[1]), m[2].replace(/\\'/g, "'"));
const OUT = new Set('pour dans avec sans plus tout tous une les des aux ses son sa le la de du et ou en un à'.split(' '));
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const mots = (t) => new Set(norm(t).split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !OUT.has(w)));
const rows = [];
for (const [w, th] of [...themes].sort((a, b) => a[0] - b[0])) {
  const jours = prog.days.filter((d) => d.week === w && !d.isReview);
  if (!jours.length) continue;
  const titres = jours.map((d) => d.title).join(' ');
  const a = mots(th), b = mots(titres);
  const inter = [...a].filter((x) => b.has(x)).length;
  const score = a.size ? inter / a.size : 0;
  // decalage : ce theme correspond-il MIEUX a une autre semaine ?
  let best = w, bestS = score;
  for (const [w2] of themes) {
    const j2 = prog.days.filter((d) => d.week === w2 && !d.isReview);
    if (!j2.length) continue;
    const b2 = mots(j2.map((d) => d.title).join(' '));
    const s2 = a.size ? [...a].filter((x) => b2.has(x)).length / a.size : 0;
    if (s2 > bestS + 0.001) { bestS = s2; best = w2; }
  }
  rows.push({ w, th, score, best, bestS, dec: best - w });
}
const mauvais = rows.filter((r) => r.score < 0.25);
console.log(`52 semaines · theme recouvrant < 25 % des mots avec les titres de SA semaine : ${mauvais.length}`);
console.log(`themes qui collent MIEUX a une autre semaine : ${rows.filter((r) => r.dec !== 0).length}`);
const dec = {}; for (const r of rows) dec[r.dec] = (dec[r.dec] ?? 0) + 1;
console.log('decalage (semaine du meilleur match - semaine declaree) :', JSON.stringify(dec));
console.log(`\n${'sem'.padEnd(5)}${'score'.padEnd(7)}${'mieux'.padEnd(7)}theme declare`);
for (const r of rows) if (r.score < 0.25 || r.dec !== 0)
  console.log(`${('s' + r.w).padEnd(5)}${r.score.toFixed(2).padEnd(7)}${(r.dec ? 's' + r.best : '—').padEnd(7)}${r.th.slice(0, 62)}`);
