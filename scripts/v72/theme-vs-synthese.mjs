// V72 CP6 — la page de revue se contredit-elle ? « Theme de la semaine » contre
// « Synthese de la semaine », qui cite explicitement les numeros de journee.
import { readFileSync } from 'node:fs';
const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');
const OUT = new Set('pour dans avec sans plus tout tous une les des aux ses son sa le la de du et ou en un semaine jour jours'.split(' '));
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const mots = (t) => new Set(norm(t).split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !OUT.has(w)));
const rows = [];
for (const d of prog.days.filter((x) => x.isReview)) {
  const md = readFileSync(`curriculum/days/day-${n3(d.day)}.md`, 'utf8');
  const th = (md.match(/\*\*Thème de la semaine :\*\*\s*(.+)/) ?? [, ''])[1].trim();
  const i = md.indexOf('### Synthèse de la semaine');
  if (i < 0 || !th) continue;
  const syn = md.slice(i, md.indexOf('\n### ', i + 5) < 0 ? md.length : md.indexOf('\n### ', i + 5));
  // la synthese cite « (jour NN) » : verifions qu elle parle bien des jours de CETTE semaine
  const cites = [...syn.matchAll(/\(jour (\d+)\)/g)].map((m) => Number(m[1]));
  const debut = (d.week - 1) * 7 + 1, fin = debut + 5;
  const dedans = cites.filter((j) => j >= debut && j <= fin).length;
  const a = mots(th), b = mots(syn);
  const rec = a.size ? [...a].filter((x) => b.has(x)).length / a.size : 0;
  rows.push({ j: d.day, w: d.week, th, rec, cites: cites.length, dedans });
}
const contra = rows.filter((r) => r.rec < 0.25 && r.cites >= 3);
console.log(`revues avec une synthese citant >= 3 journees : ${rows.filter((r) => r.cites >= 3).length} / ${rows.length}`);
console.log(`synthese citant UNIQUEMENT des journees de sa propre semaine : ${rows.filter((r) => r.cites >= 3 && r.dedans === r.cites).length}`);
console.log(`\nCONTRADICTION theme / synthese (recouvrement < 25 %) : ${contra.length}`);
console.log(`${'jour'.padEnd(6)}${'sem'.padEnd(5)}${'rec'.padEnd(6)}${'cite'.padEnd(6)}theme declare`);
for (const r of contra) console.log(`j${String(r.j).padStart(3)}  ${('s' + r.w).padEnd(5)}${r.rec.toFixed(2).padEnd(6)}${(r.dedans + '/' + r.cites).padEnd(6)}${r.th.slice(0, 60)}`);
