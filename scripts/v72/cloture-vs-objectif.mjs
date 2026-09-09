// V72 CP3 — la formule de cloture « Cette lecon … » double-t-elle l Objectif ?
import { readFileSync, readdirSync } from 'node:fs';
const OUT = new Set('cette leçon lecon pour dans avec sans plus moins tout toute toutes tous mais donc comme quand entre chaque faire faut peut sont être etre avoir aussi alors ainsi'.split(' '));
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const mots = (t) => new Set(norm(t).split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !OUT.has(w)));
const jac = (a, b) => { const i = [...a].filter((w) => b.has(w)).length; const u = new Set([...a, ...b]).size; return u ? i / u : 0; };
const sect = (md, t) => { const i = md.indexOf(t); if (i < 0) return null; const j = md.indexOf('\n## ', i + 1); return md.slice(i, j < 0 ? md.length : j); };
const res = [];
for (const f of readdirSync('curriculum/lessons').filter((x) => x.endsWith('.md')).sort()) {
  const md = readFileSync(`curriculum/lessons/${f}`, 'utf8');
  const p = sect(md, "## 🌍 Le problème d'abord"), o = sect(md, '## 🎯 Objectif');
  if (!p || !o) continue;
  const ph = p.replace(/\n/g, ' ').split(/(?<=[.!?])\s+/).find((x) => /Cette leçon/.test(x));
  if (!ph) continue;
  res.push({ slug: f.replace(/\.md$/, ''), s: jac(mots(ph), mots(o)), ph: ph.trim() });
}
res.sort((a, b) => b.s - a.s);
console.log(`lecons dont le « probleme d abord » se clot par « Cette leçon … » : ${res.length} / 128`);
const seuils = [0.30, 0.20, 0.10];
for (const t of seuils) console.log(`  recouvrement de cette phrase avec l Objectif >= ${t.toFixed(2)} : ${res.filter((r) => r.s >= t).length}`);
console.log('\nles 12 plus eleves :');
res.slice(0, 12).forEach((r) => console.log(`  ${r.s.toFixed(2)}  ${r.slug.padEnd(32)} ${r.ph.slice(0, 96)}`));
