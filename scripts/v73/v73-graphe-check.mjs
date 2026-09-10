// V73 — PORTE du graphe canonique. Rouge dès qu'un invariant I2, I3, I4, I6, I7, I8, I9,
// I10 ou C9 du contrat gelé au CP1 est violé.
//
// Cette porte ne mesure QUE des propriétés déclarées (règle S1). Elle ne juge aucun texte.
// Elle est mise volontairement en échec par `scripts/v73/cp2-tests-negatifs.mjs`.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Le graphe est REGÉNÉRÉ puis relu depuis le fichier : passer 200 Kio par un tube tronque
// la sortie (l'écriture de stdout est asynchrone et `process.exit` la coupe).
execFileSync('node', ['scripts/v73/cp2-graphe.mjs', '--ecrire'], { encoding: 'utf8' });
const g = JSON.parse(readFileSync('docs/v73/curriculum-graph.json', 'utf8'));
const c = g.controles;
const err = [];

if (c.I2_prerequis_invalides.length)
  for (const p of c.I2_prerequis_invalides) err.push(`I2 · ${p.lecon} (j${p.jourLecon}) exige ${p.prerequis} (j${p.jourPrerequis ?? 'hors parcours'}) sans l'annoncer`);
if (c.I3_revues_introduisant.length)
  for (const r of c.I3_revues_introduisant) err.push(`I3 · la revue j${r.j} introduit ${r.inedites.join(', ')}`);
if (c.I4_evaluations_sans_source.length)
  for (const e of c.I4_evaluations_sans_source) err.push(`I4 · le mois ${e.mois} attend ${e.competence} = ${e.niveau} sans enseignement avant j${e.finJour}`);

const inv = c.I6_invariants;
const attendu = { jours: 365, lecons: 128, corrections: 365, semaines: 52, mois: 12 };
for (const [k, v] of Object.entries(attendu)) if (inv[k] !== v) err.push(`I6 · ${k} = ${inv[k]}, attendu ${v}`);
if (!inv.ordre) err.push('I9 · l’ordre days[i].day === i+1 est rompu');
if (inv.doublons) err.push(`I9 · ${inv.doublons} journée(s) en double`);

if (!c.I7_progress_absent) err.push('I7 · data/progress.json existe — il ne doit jamais être créé');
if (c.I8_cycles.length) for (const cy of c.I8_cycles) err.push(`I8 · cycle de prérequis : ${cy.join(' → ')}`);
if (c.I10_orphelines_non_declarees.length) err.push(`I10 · ${c.I10_orphelines_non_declarees.length} leçon(s) hors parcours sans encadré de référence : ${c.I10_orphelines_non_declarees.join(', ')}`);
if (c.C9_refs_mortes.length) for (const r of c.C9_refs_mortes) err.push(`C9 · référence morte ${r.source} → ${r.kind}:${r.id}`);

console.log(`graphe V73 : ${g.jours.length} journées · ${g.arcs.length} compétences · ${g.evaluations.length} niveaux attendus`);
console.log(`invariants : ${JSON.stringify(inv)}`);
if (err.length) {
  console.error(`\n❌ ${err.length} violation(s) du contrat gelé :`);
  for (const e of err) console.error(`   • ${e}`);
  process.exit(1);
}
console.log('\n✅ V73 · graphe : prérequis ordonnés, revues qui révisent, évaluations sourcées, aucun cycle, aucune référence morte, invariants intacts.');
