// V72 CP0 — anatomie des 52 journees de revue.
import { readFileSync, existsSync } from 'node:fs';
const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');
const min = (md) => { const s = md.replace(/```[\s\S]*?```/g, ' ');
  return Math.round(s.split(/\s+/).filter(Boolean).length / 150); };
const sect = (md, t) => { const i = md.indexOf(t); if (i < 0) return '';
  const j = md.indexOf('\n### ', i + 1); return md.slice(i, j < 0 ? md.length : j); };
const HEBDO = /chaque jour|par jour|cette semaine|fin de semaine|dans la semaine|\bhebdo/i;
console.log('  jour  sem  nlec  lect  minExpl  portee     theme');
const stats = { hebdo: 0, jour: 0 };
for (const d of prog.days.filter((x) => x.isReview)) {
  const f = `curriculum/days/day-${n3(d.day)}.md`;
  if (!existsSync(f)) continue;
  const md = readFileSync(f, 'utf8');
  const slugs = [...new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  const lect = slugs.reduce((a, s) => a + (existsSync(`curriculum/lessons/${s}.md`) ? min(readFileSync(`curriculum/lessons/${s}.md`, 'utf8')) : 0), 0) + min(md);
  const tp = sect(md, '### Test pratique');
  const expl = [...tp.matchAll(/(\d{1,3})\s*min\b/g)].map((m) => Number(m[1]));
  const portee = HEBDO.test(tp) ? 'SEMAINE' : 'JOUR';
  stats[portee === 'SEMAINE' ? 'hebdo' : 'jour']++;
  const theme = (md.match(/\*\*Thème de la semaine :\*\*\s*(.+)/) ?? [, ''])[1].slice(0, 42);
  console.log(`  j${String(d.day).padStart(3)}  s${String(d.week).padStart(2)}  ${String(slugs.length).padStart(4)}  ${String(lect).padStart(4)}  ${String(expl.join('+')).padStart(7)}  ${portee.padEnd(8)}  ${theme}`);
}
console.log(`\nportee du test pratique : ${stats.jour} journee(s) · ${stats.hebdo} semaine(s)`);
