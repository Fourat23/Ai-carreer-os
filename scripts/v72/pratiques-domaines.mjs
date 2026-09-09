// V72 CP0 — asymetrie des enonces de pratique entre domaines.
import { readFileSync, readdirSync } from 'node:fs';
const dom = JSON.parse(readFileSync('docs/v71/domaines.json', 'utf8'));
const parLecon = new Map();
if (Array.isArray(dom)) for (const d of dom) parLecon.set(d.slug, d.domaine);
else for (const [k, v] of Object.entries(dom)) { if (Array.isArray(v)) v.forEach((s) => parLecon.set(s, k)); else parLecon.set(k, v); }
const sect = (md, re) => { const l = md.split('\n'); let on = false, buf = [];
  for (const x of l) { if (/^## /.test(x)) on = re.test(x); else if (on) buf.push(x); } return buf.join('\n'); };
const mots = (t) => t.split(/\s+/).filter(Boolean).length;
const stats = {};
for (const f of readdirSync('curriculum/lessons').filter((x) => x.endsWith('.md'))) {
  const slug = f.replace(/\.md$/, '');
  const md = readFileSync(`curriculum/lessons/${f}`, 'utf8');
  const d = parLecon.get(slug) ?? 'inconnu';
  const prat = sect(md, /pratique|mini-exercice|exercice|à toi de|ta production/i);
  const nParts = (prat.match(/^\s*\*\*[A-E][.)]/gm) ?? []).length;
  const critere = /Critère de réussite|Vérifie seul|Comment savoir|réussite\s*:/i.test(md);
  const livrable = /livrable|tu rends|tu produis|fichier\s+`|rends un/i.test(prat);
  const renvoi = /exercice|lab|atelier/i.test(prat) && mots(prat) < 80;
  (stats[d] ??= { n: 0, mots: [], parts: 0, crit: 0, liv: 0, renv: 0 });
  const s = stats[d]; s.n++; s.mots.push(mots(prat));
  if (nParts >= 3) s.parts++; if (critere) s.crit++; if (livrable) s.liv++; if (renvoi) s.renv++;
}
const med = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
console.log('domaine              n   mots pratique (min/med/max)   A-E>=3   critere   livrable   renvoi court');
for (const [d, s] of Object.entries(stats).sort((a, b) => b[1].n - a[1].n)) {
  const pc = (x) => `${String(x).padStart(2)}/${s.n}`;
  console.log(`${d.padEnd(20)}${String(s.n).padStart(2)}   ${String(Math.min(...s.mots)).padStart(4)} / ${String(med(s.mots)).padStart(4)} / ${String(Math.max(...s.mots)).padStart(4)}         ${pc(s.parts)}   ${pc(s.crit)}    ${pc(s.liv)}     ${pc(s.renv)}`);
}
