// V49 — génère le ledger de couverture professionnelle (dérivé, machine-readable).
// C'est une PROJECTION recomputable (lib/professional-coverage.mjs), pas une
// source de vérité : v49:check la recalcule et refuse toute dérive.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { computeCoverageMatrix, completeLoopCount } from '../lib/professional-coverage.mjs';
import { MISCONCEPTIONS } from '../lib/misconceptions.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const rd = (d) => existsSync(R(d)) ? readdirSync(R(d)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(R(d), f), 'utf8'))) : [];

export function buildLedger() {
  const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
  const sources = {
    lessons: program.lessons || [],
    exercises: rd('data/exercises'),
    capstones: rd('data/capstones'),
    missions: rd('data/missions'),
    transfer: rd('data/transfer-challenges'),
    misconceptions: MISCONCEPTIONS,
    externalTasks: JSON.parse(readFileSync(R('data/external-tasks.json'), 'utf8')).tasks || [],
  };
  const matrix = computeCoverageMatrix(program.skills, sources);
  return {
    note: 'Ledger DÉRIVÉ (V49). Recomputable par v49:check ; aucune source de vérité. Ne pas éditer à la main.',
    generatedFrom: 'lib/professional-coverage.mjs',
    completeLoops: completeLoopCount(matrix),
    totalSkills: matrix.length,
    matrix,
  };
}

// Écriture (générateur uniquement ; le gate ne fait que comparer).
if (import.meta.url === `file://${process.argv[1]}`) {
  const ledger = buildLedger();
  mkdirSync(R('docs/audits'), { recursive: true });
  writeFileSync(R('docs/audits/v49-coverage-ledger.json'), JSON.stringify(ledger, null, 2) + '\n');
  console.log(`Ledger écrit : ${ledger.completeLoops}/${ledger.totalSkills} boucles complètes.`);
}
