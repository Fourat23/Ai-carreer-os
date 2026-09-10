// V73 · CP12 — EXÉCUTER LES AFFIRMATIONS EXÉCUTABLES.
//
// Le corpus contient 376 exercices, chacun avec une SOLUTION DE RÉFÉRENCE et ses propres
// tests. Jusqu'ici, rien ne vérifiait que la solution de référence PASSE ses tests : un gate
// contrôlait qu'elle existe, pas qu'elle marche. « Une affirmation exécutable doit être
// exécutée » — ce script l'exécute, pour de vrai, dans le vrai exécuteur de l'application
// (`runExercise`), pas dans une réimplémentation.
//
// Les 18 exercices `python-ds` exigent l'environnement Data/ML :
//   bash scripts/v47-provision-ds-venv.sh
// Sans lui, ils sont comptés comme NON EXÉCUTÉS — jamais comme réussis.
//
// Usage : node scripts/v73/cp12-executer-references.mjs [--json]
import { readFileSync, readdirSync } from 'node:fs';
import { runExercise } from '../../lib/workspace-fs.mjs';

const ids = readdirSync('data/exercises').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5));
const res = { ok: [], ko: [], nonExecutes: [] };
for (const id of ids) {
  const ex = JSON.parse(readFileSync(`data/exercises/${id}.json`, 'utf8'));
  try {
    const { attempt } = await runExercise(process.cwd(), ex, ex.reference ?? {});
    if (attempt?.allPassed) res.ok.push(id);
    else res.ko.push({ id, runtime: ex.runtime, echecs: (attempt?.results ?? []).filter((r) => !r.passed).map((r) => r.id) });
  } catch (e) {
    res.nonExecutes.push({ id, runtime: ex.runtime, raison: String(e.message).slice(0, 90) });
  }
}
if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(res));
else {
  console.log(`solutions de référence exécutées et PASSANTES : ${res.ok.length} / ${ids.length}`);
  console.log(`échecs : ${res.ko.length}`);
  for (const k of res.ko) console.log(`  ❌ ${k.id} [${k.runtime}] tests en échec : ${k.echecs.join(', ')}`);
  console.log(`non exécutées (environnement absent) : ${res.nonExecutes.length}`);
  for (const k of res.nonExecutes.slice(0, 5)) console.log(`  ⚠ ${k.id} [${k.runtime}] ${k.raison}`);
}
process.exitCode = res.ko.length === 0 ? 0 : 1;
