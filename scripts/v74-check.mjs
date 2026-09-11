// Gate v74:check — RETENTION ENGINE I : MÉMOIRE, RÉCUPÉRATION, ESPACEMENT.
//
// Ce que cette porte garde : les décisions GELÉES du contrat
// `docs/v74/V74-RETENTION-CONTRACT-FROZEN.md`. Les 1612 tests vérifient des
// comportements ; cette porte vérifie des **propriétés structurelles** qu'un
// test unitaire ne voit pas — notamment qu'aucun moteur n'a été débranché du
// produit (critère bloquant **B12**) et qu'aucun score chiffré n'a été exposé.
//
// Elle ne duplique pas la suite de tests : elle garde ce qui se dégrade en
// silence, sans qu'aucune assertion ne casse.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const violations = [];
const must = (ok, regle, detail = '') => { if (!ok) violations.push({ regle, detail }); };
let verifs = 0;
const check = (ok, regle, detail) => { verifs += 1; must(ok, regle, detail); };

const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const walk = (dir, acc = []) => {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return acc;
  for (const e of readdirSync(abs)) {
    const rel = `${dir}/${e}`;
    if (statSync(join(ROOT, rel)).isDirectory()) walk(rel, acc);
    else acc.push(rel);
  }
  return acc;
};

console.log('\n── Gate v74:check (Retention Engine I)');

// ── R1. Les faits canoniques existent et sont persistés ──────────────────
check(lire('lib/exercise-attempt.mjs').includes('export function normalizeExerciseAttempt'),
  '[R1] le fait `ExerciseAttempt` existe');
check(lire('lib/progress-store.mjs').includes('exerciseAttempts'),
  '[R1] les tentatives d’exercice sont persistées');
check(lire('lib/learning-engine.mjs').includes('RECORD_EXERCISE_ATTEMPT'),
  '[R1] la commande d’enregistrement existe');

// ── R2. La tentative est écrite même quand l'exercice ÉCHOUE ─────────────
// C'est la dette D1/D2 du CP0, payée au CP2 : l'écriture doit précéder toute
// projection, sans quoi un échec ne laisse aucune trace.
{
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  const iAttempt = route.indexOf('RECORD_EXERCISE_ATTEMPT');
  const iSucces = route.indexOf('if (attempt.allPassed)');
  check(iAttempt > 0 && iSucces > 0 && iAttempt < iSucces,
    '[R2] la tentative est écrite AVANT la branche de succès',
    `positions : fait ${iAttempt}, succès ${iSucces}`);
}

// ── R3. `correctionSeen` existe : sans lui, R-b serait décoratif ─────────
check(lire('lib/exercise-attempt.mjs').includes('correctionSeen'),
  '[R3] le champ décisif `correctionSeen` existe');
check(/correctionSeen:\s*raw\.correctionSeen === false \? false : true/.test(lire('lib/exercise-attempt.mjs')),
  '[R3] le doute joue CONTRE le compteur (vrai par défaut)');

// ── R4. Aucune couche V74 ne définit d'échelle d'espacement ──────────────
// Redondant avec C11 de v651:check, et c'est voulu : les deux portes gardent
// l'interdiction la plus structurante du sprint.
{
  const ECHELLE = /INTERVALS\s*=\s*\[|MIN_EASE\s*=|MAX_EASE\s*=|ease\s*[*+-]=/;
  const coupables = ['lib/retention-priority.mjs', 'lib/retention-scheduler.mjs',
    'lib/retrieval-task.mjs', 'lib/remediation.mjs', 'lib/daily-plan.mjs', 'lib/learner-memory.mjs']
    .filter((f) => ECHELLE.test(lire(f)));
  check(coupables.length === 0,
    '[R4] aucune couche V74 ne définit sa propre échelle d’espacement', coupables.join(', '));
}

// ── R5. Les modules décisionnels sont PURS (horloge injectée) ────────────
{
  const impurs = ['lib/retention-priority.mjs', 'lib/retention-scheduler.mjs',
    'lib/retrieval-task.mjs', 'lib/remediation.mjs', 'lib/daily-plan.mjs', 'lib/learner-memory.mjs']
    .filter((f) => /Date\.now\(\)|new Date\(\)(?!\s*\.)|Math\.random/.test(
      lire(f).split('\n').filter((l) => !l.trimStart().startsWith('//') && !l.trimStart().startsWith('*')).join('\n')));
  check(impurs.length === 0, '[R5] aucun module décisionnel ne lit l’horloge ou l’aléa', impurs.join(', '));
}

// ── R6 · B12. LE MOTEUR EST RÉELLEMENT UTILISÉ PAR LE PRODUIT ───────────
// Le critère bloquant du contrat. L'audit du CP12 a trouvé six modules écrits,
// testés, et joignables par personne. Une porte doit garder cela : c'est
// exactement le genre de régression qu'aucun test de comportement ne voit.
{
  const rm = lire('lib/plan-jour-server.ts');
  for (const [mod, cp] of [['./learner-memory', 'CP2'], ['./retention-priority', 'CP3'],
    ['./retention-scheduler', 'CP4'], ['./retrieval-task', 'CP5'], ['./daily-plan', 'CP10']]) {
    check(rm.includes(`from '${mod}'`), `[R6·B12] ${cp} (${mod}) est branché au read-model`);
  }
  check(/=\s*getPlanDuJour\s*\(/.test(lire('app/retention/page.tsx')),
    '[R6·B12] la page de réactivation APPELLE le plan du jour');
  check(lire('app/api/lab/[exerciseId]/route.ts').includes("from '@/lib/remediation'"),
    '[R6·B12] la remédiation du CP7 est appelée par le laboratoire');
}

// ── R7 · §9. Aucun score chiffré montré à l'apprenant ───────────────────
{
  const surfaces = walk('app').filter((f) => f.endsWith('.tsx'));
  const fautifs = surfaces.filter((f) => {
    const src = lire(f).split('\n')
      .filter((l) => !l.trimStart().startsWith('//') && !l.trimStart().startsWith('*')).join('\n');
    return /\{\s*[\w.]*\bmemoryScore\b|\{\s*[\w.]*\bretentionScore\b/i.test(src);
  });
  check(fautifs.length === 0, '[R7·§9] aucune surface n’affiche un score de mémoire', fautifs.join(', '));
}

// ── R8. Les grandeurs déclarées NON MESURÉES le restent ─────────────────
{
  const contrat = lire('docs/v74/V74-RETENTION-CONTRACT-FROZEN.md');
  check(contrat.includes('REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED'),
    '[R8] l’absence de preuve d’apprentissage humain reste déclarée');
  check(contrat.includes('UNMEASURABLE'),
    '[R8] les grandeurs non mesurables restent nommées');
}

// ── R9. Le transfert ne se fabrique pas ─────────────────────────────────
check(lire('lib/learner-memory.mjs').includes("c.sourceType === 'transfer-challenge'"),
  '[R9] un transfert est une PREUVE de défi, pas une co-occurrence');
check(lire('lib/learner-memory.mjs').includes('cooccurrencesCompetences'),
  '[R9] la co-occurrence est conservée sous son vrai nom');

// ── R10. `data/progress.json` n'est jamais créé par le dépôt ────────────
check(!existsSync(join(ROOT, 'data', 'progress.json')),
  '[R10] `data/progress.json` n’existe pas dans le dépôt');

// ─────────────────────────────────────────────────────────────────────────
console.log(`── v74:check — ${verifs} vérifications passées`);
if (violations.length) {
  console.log(`\n❌ v74:check : ${violations.length} régression(s)\n`);
  for (const v of violations) console.log(`  • ${v.regle}${v.detail ? ` — ${v.detail}` : ''}`);
  process.exit(1);
}
console.log('\n✅ V74 · Retention Engine I : fait canonique persisté, échec observable, aucune échelle dupliquée, modules purs, moteur RÉELLEMENT branché au produit (B12), aucun score de mémoire affiché, transfert non fabriqué.');
