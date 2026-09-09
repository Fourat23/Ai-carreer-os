// V72 — invariant §3 : une revue hebdomadaire lie au plus 7 leçons.
import { readFileSync, existsSync } from 'node:fs';
const PLAFOND = 7;
const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');
const trop = [];
for (const d of prog.days.filter((x) => x.isReview)) {
  const f = `curriculum/days/day-${n3(d.day)}.md`; if (!existsSync(f)) continue;
  const n = new Set([...readFileSync(f, 'utf8').matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1])).size;
  if (n > PLAFOND) trop.push(`j${d.day} (semaine ${d.week}) : ${n} leçons`);
}
console.log(`revues hebdomadaires : ${prog.days.filter((d) => d.isReview).length} · plafond : ${PLAFOND}`);
if (trop.length) { console.log(`\n❌ ${trop.length} revue(s) au-dessus du plafond :`); for (const t of trop) console.log('   - ' + t); process.exit(1); }
console.log('✅ aucune revue au-dessus du plafond.');
