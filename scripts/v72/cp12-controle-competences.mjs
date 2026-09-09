// V72 — invariant C3 : toute compétence déclarée dans program.json a au moins une journée.
import { readFileSync } from 'node:fs';
const p = JSON.parse(readFileSync('data/program.json', 'utf8'));
const avecJour = new Set(p.days.map((d) => d.skill));
const orphelines = p.skills.filter((s) => !avecJour.has(s.id));
console.log(`compétences déclarées : ${p.skills.length} · couvertes par au moins une journée : ${p.skills.length - orphelines.length}`);
if (orphelines.length) {
  console.log(`\n❌ ${orphelines.length} compétence(s) DÉCLARÉE(S) SANS AUCUNE JOURNÉE :`);
  for (const s of orphelines) console.log(`   - ${s.id} (${s.name})`);
  console.log('\nUne compétence affichée dans la liste du programme est une promesse.');
  process.exit(1);
}
console.log('✅ aucune compétence déclarée sans journée.');
