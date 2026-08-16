// Aide de construction V46 (dev/CI) : écrit un exercice puis le VÉRIFIE par
// exécution réelle (référence 100% verte ; starter échoue ≥1 test public).
import { writeFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { runExercise } from '../lib/workspace-fs.mjs';
import { validateExercise } from '../lib/exercise.mjs';

const ROOT = '/home/user/Ai-carreer-os';
mkdirSync(join(ROOT, 'data/lab-workspaces'), { recursive: true });

export async function buildAndVerify(ex) {
  const v = validateExercise(ex);
  if (!v.ok) throw new Error(`${ex.id} INVALIDE : ${v.errors.join(' ; ')}`);
  const sandbox = mkdtempSync(join(ROOT, 'data/lab-workspaces', `v46-${ex.id}-`));
  try {
    // référence : applique ex.reference sur les fichiers éditables
    const ref = await runExercise(sandbox, ex, ex.reference ?? {});
    if (!ref.attempt.allPassed) {
      throw new Error(`${ex.id} RÉFÉRENCE échoue : ` + JSON.stringify(ref.attempt.results.filter(r => !r.passed)));
    }
    // starter : doit échouer ≥1 test PUBLIC
    const st = await runExercise(sandbox, ex, {});
    const pubFail = st.attempt.results.some(r => !r.passed && !((ex.tests.find(t => t.id === r.testId) || {}).private));
    if (!pubFail) throw new Error(`${ex.id} STARTER ne casse aucun test public (fuite de solution ?)`);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
  const { file, ...clean } = ex;
  writeFileSync(join(ROOT, 'data/exercises', `${ex.id}.json`), JSON.stringify(clean, null, 2) + '\n');
  return true;
}
