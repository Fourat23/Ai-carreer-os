// V72 CP0 — detection PHRASE A PHRASE des redites entre sections d ouverture.
// Sortie compacte : pour chaque lecon, les paires de phrases qui se recouvrent le plus.
import { readFileSync } from 'node:fs';
const L = JSON.parse(readFileSync('docs/v71/LEDGER-128.json', 'utf8'));
const A = Array.isArray(L) ? L : (L.lecons || L.entries);
const SEC = ["Le problème d'abord", 'Objectif', 'Modèle mental', "Pourquoi c'est important"];
const OUT = new Set(['cette','leçon','lecon','pour','dans','avec','sans','plus','moins','tout','toute','toutes','tous','mais','donc','comme','quand','entre','chaque','faire','faut','peut','sont','être','etre','avoir','celui','celle','ceux','elle','elles','leur','leurs','aussi','alors','parce','quelque','quelques','ainsi','depuis','encore','jamais','toujours','très','tres','bien','deux','trois']);
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const mots = (t) => new Set(norm(t).split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !OUT.has(w)));
const jac = (a, b) => { const i = [...a].filter((w) => b.has(w)).length; const u = new Set([...a, ...b]).size; return u ? i / u : 0; };
const phrases = (t) => t.replace(/```[\s\S]*?```/g, ' ').replace(/\n+/g, ' ')
  .split(/(?<=[.!?:;])\s+(?=[A-ZÀ-Ý(«*])/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 6);

const cible = process.argv.slice(2);
for (const e of A.filter((x) => x.D[13] < 5).sort((x, y) => x.slug.localeCompare(y.slug))) {
  if (cible.length && !cible.includes(e.slug)) continue;
  const md = readFileSync(`curriculum/lessons/${e.slug}.md`, 'utf8');
  const blocs = {}; let cour = null;
  for (const l of md.split('\n')) {
    if (/^## /.test(l)) { cour = SEC.find((s) => l.includes(s)) ?? null; if (cour) blocs[cour] = ''; }
    else if (cour) blocs[cour] += l + '\n';
  }
  const noms = Object.keys(blocs);
  const P = {}; let totMots = 0;
  for (const n of noms) { P[n] = phrases(blocs[n]).map((s) => ({ s, w: mots(s) })); totMots += blocs[n].split(/\s+/).filter(Boolean).length; }
  const paires = [];
  for (let i = 0; i < noms.length; i++) for (let j = i + 1; j < noms.length; j++)
    for (const a of P[noms[i]]) for (const b of P[noms[j]]) {
      const s = jac(a.w, b.w);
      if (s >= 0.30) paires.push({ s, A: noms[i], B: noms[j], a: a.s, b: b.s, n: b.s.split(/\s+/).length });
    }
  paires.sort((x, y) => y.s - x.s);
  const dup = paires.slice(0, 3);
  const motsRedits = dup.reduce((a, p) => a + p.n, 0);
  console.log(`\n=== ${e.slug}   ouverture ${totMots} mots · ${dup.length ? 'redites ~' + motsRedits + ' mots (' + Math.round(motsRedits / totMots * 100) + ' %)' : 'AUCUNE PAIRE >= 0,30'} · sections ${noms.length}`);
  for (const p of dup) console.log(`  [${p.s.toFixed(2)}] ${p.A} : ${p.a.slice(0, 130)}\n        ${p.B} : ${p.b.slice(0, 130)}`);
}
