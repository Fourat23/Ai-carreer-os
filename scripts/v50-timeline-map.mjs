// V50 CP3 — génère la carte temporelle DÉRIVÉE du parcours 365 jours (machine-
// readable). Projection recomputable (lib/curriculum-timeline.mjs) ; aucune
// source de vérité. Sert l'audit et le read-model, jamais consommée comme état.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildTimeline, temporalAudit, monthlyDistribution, temporalAnomalies, orphanExercises } from '../lib/curriculum-timeline.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const rd = (p) => JSON.parse(readFileSync(R(p), 'utf8'));
const readdirJson = (dir) => readdirSync(R(dir)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(R(dir), f), 'utf8')));

const program = rd('data/program.json');
const de = rd('data/day-exercises.json');
const exercises = readdirJson('data/exercises');
const transfer = readdirJson('data/transfer-challenges');
const capstones = readdirJson('data/capstones');

const tl = buildTimeline({ days: program.days, dayExercises: de, exercises, transfer, capstones });
const out = {
  note: 'Carte temporelle DÉRIVÉE (V50). Recomputable par v50:timeline-map ; aucune source de vérité.',
  generatedFrom: 'lib/curriculum-timeline.mjs',
  totals: {
    days: program.days.length,
    daysWithPractice: Object.values(de).filter((v) => v.length).length,
    mappedExercises: new Set(Object.values(de).flat()).size,
    totalExercises: exercises.length,
    orphans: orphanExercises(tl, exercises).length,
  },
  monthlyDistribution: monthlyDistribution(tl),
  temporalAudit: temporalAudit(tl),
  anomalies: temporalAnomalies(tl, exercises),
};
mkdirSync(R('docs/audits'), { recursive: true });
writeFileSync(R('docs/audits/v50-timeline.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`Carte temporelle écrite : ${out.totals.daysWithPractice}/${out.totals.days} jours avec pratique, ${out.totals.orphans} orphelins, ${out.anomalies.length} anomalies.`);
