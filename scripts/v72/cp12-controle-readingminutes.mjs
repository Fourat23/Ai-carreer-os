// V72 — invariant C10 : la durée de lecture publiée est celle des fichiers réels (±5 min).
import { readFileSync, existsSync } from 'node:fs';
const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');
const minutes = (md) => {
  const s = md.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
  const m = s.split(/\s+/).filter(Boolean).length;
  const c = [...md.matchAll(/```[\s\S]*?```/g)].map((x) => Math.max(0, x[0].split('\n').length - 2)).reduce((a, b) => a + b, 0);
  return Math.max(1, Math.round(m / 150 + c / 20));
};
const TOL = 5; const derive = [];
for (const d of prog.days) {
  const f = `curriculum/days/day-${n3(d.day)}.md`; if (!existsSync(f)) continue;
  const md = readFileSync(f, 'utf8');
  const slugs = [...new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  const sol = `curriculum/solutions/day-${n3(d.day)}-solution.md`;
  const reel = minutes([md, ...slugs.map((s) => readFileSync(`curriculum/lessons/${s}.md`, 'utf8')),
    existsSync(sol) ? readFileSync(sol, 'utf8') : ''].join('\n'));
  const e = reel - d.readingMinutes;
  if (Math.abs(e) > TOL) derive.push(`j${d.day} : publié ${d.readingMinutes} min, réel ${reel} min (${e > 0 ? '+' : ''}${e})`);
}
console.log(`journées : ${prog.days.length} · tolérance : ±${TOL} min`);
if (derive.length) { console.log(`\n❌ ${derive.length} journée(s) dont la durée publiée a dérivé :`); for (const d of derive.slice(0, 15)) console.log('   - ' + d); process.exit(1); }
console.log('✅ aucune durée de lecture périmée.');
