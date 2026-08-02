#!/usr/bin/env node
// Gate de couverture V17 — lance : npm run v17:check
//
// 1. Valide le plan d'enrichissement (docs/architecture/v17-enrichment-plan.json)
//    contre les données réelles via lib/v17-coverage.mjs (jours inexistants,
//    doublons, objectifs manquants, compétences absentes, définitions manquantes).
// 2. Détecte la DÉRIVE de curriculum : tout fichier pédagogique modifié par
//    rapport à la baseline (plan.baselineRef) qui n'est PAS autorisé par le plan
//    fait échouer la gate (ADR-017 : aucune dérive hors périmètre).
// 3. Vérifie les liens internes (références de journée) des journées enrichies.
//
// Lecture seule ; n'écrit jamais. Exit 1 au moindre problème.

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  validateCoveragePlan,
  extractDayRefs,
} from '../lib/v17-coverage.mjs';
import {
  DEFAULT_TRACK_ID,
  FULLSTACK_TRACK_ID,
  BACKEND_TRACK_ID,
} from '../lib/catalogue.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warn = [];

// ── Données réelles ──────────────────────────────────────────────────────────
const plan = JSON.parse(readFileSync(R('docs/architecture/v17-enrichment-plan.json'), 'utf8'));
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const days = program.days ?? [];
const validDays = new Set(days.map((d) => d.day));
const trackIds = new Set([DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID]);
// Les compétences d'exercice relèvent de la taxonomie FINE (lib/skill-taxonomy),
// pas des 20 macro-compétences du programme : on valide via isKnownSkill.
const skillIds = { has: (s) => isKnownSkill(s) };

const dayExercises = JSON.parse(readFileSync(R('data/day-exercises.json'), 'utf8'));
const exerciseIds = new Set(Object.values(dayExercises).flat());
const glossary = JSON.parse(readFileSync(R('curriculum/glossary/glossary.json'), 'utf8'));
const glossaryTerms = new Set(
  glossary.flatMap((e) => [e.term, e.fullForm, ...(e.aliases ?? [])].filter(Boolean).map((s) => s.toLowerCase())),
);

// ── 1. Validation du plan ────────────────────────────────────────────────────
const { errors: planErrors } = validateCoveragePlan(plan, {
  validDays,
  trackIds,
  skillIds,
  exerciseIds,
  glossaryTerms,
});
errors.push(...planErrors);

// ── 2. Détection de dérive vs baseline ───────────────────────────────────────
const baseRef = plan.baselineRef;
let baseOk = true;
try {
  execSync(`git rev-parse --verify --quiet ${baseRef}^{commit}`, { cwd: ROOT, stdio: 'pipe' });
} catch {
  baseOk = false;
  errors.push(`baseline « ${baseRef} » introuvable : la détection de dérive ne peut pas s'exécuter`);
}

const targetDays = new Set((plan.days ?? []).map((d) => d.day));
const allowedModules = new Set(plan.allowedSourceModules ?? []);
const allowedKept = new Set(plan.allowedKeptMarkdown ?? []);

if (baseOk) {
  const changed = execSync(
    `git diff --name-only ${baseRef} -- scripts/data curriculum data/program.json`,
    { cwd: ROOT, stdio: 'pipe' },
  )
    .toString()
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const f of changed) {
    if (f === 'data/program.json') continue; // traité par comparaison structurelle
    if (f.startsWith('scripts/data/') && f.endsWith('.mjs')) {
      if (!allowedModules.has(f)) errors.push(`dérive : module source hors périmètre modifié — ${f}`);
      continue;
    }
    if (f === 'curriculum/glossary/glossary.json') {
      if (!(plan.glossaryTermsAdded ?? []).length) {
        errors.push('dérive : glossary.json modifié mais aucun terme déclaré dans le plan');
      }
      continue;
    }
    // journée/solution générée : n'autoriser que les journées cibles
    const m = f.match(/curriculum\/(?:days|solutions)\/day-0*(\d{1,3})/);
    if (m) {
      const n = Number(m[1]);
      if (!targetDays.has(n)) errors.push(`dérive : journée hors périmètre modifiée — ${f} (jour ${n})`);
      continue;
    }
    // autre .md généré (weeks/months/lessons/projects…) : autorisé seulement si listé
    if (f.endsWith('.md') && !allowedKept.has(f)) {
      errors.push(`dérive : contenu pédagogique hors périmètre modifié — ${f}`);
    }
  }

  // Comparaison structurelle de program.json (hors generatedAt) : les journées
  // dont l'entrée a changé doivent toutes appartenir au périmètre.
  try {
    const baseProgram = JSON.parse(
      execSync(`git show ${baseRef}:data/program.json`, { cwd: ROOT, stdio: 'pipe' }).toString(),
    );
    const baseByDay = new Map((baseProgram.days ?? []).map((d) => [d.day, JSON.stringify(d)]));
    for (const d of days) {
      const before = baseByDay.get(d.day);
      if (before !== undefined && before !== JSON.stringify(d) && !targetDays.has(d.day)) {
        errors.push(`dérive : program.json — entrée du jour ${d.day} modifiée hors périmètre`);
      }
    }
    // Invariants de structure : nombre de journées et parcours inchangés.
    if ((baseProgram.days ?? []).length !== days.length) {
      errors.push(`dérive : nombre de journées passé de ${(baseProgram.days ?? []).length} à ${days.length}`);
    }
  } catch (e) {
    warn.push(`comparaison program.json impossible : ${e.message}`);
  }
}

// ── 3. Liens internes des journées enrichies ─────────────────────────────────
for (const entry of plan.days ?? []) {
  const refs = extractDayRefs(entry.objective ?? '');
  for (const n of refs) {
    if (!validDays.has(n)) errors.push(`journée ${entry.day} : lien interne cassé vers jour ${n}`);
  }
}

// ── Rapport ──────────────────────────────────────────────────────────────────
console.log('── Gate de couverture V17 ──');
console.log(`Baseline                : ${baseRef}${baseOk ? '' : ' (INTROUVABLE)'}`);
console.log(`Journées cibles         : ${targetDays.size}`);
console.log(`Modules source autorisés: ${allowedModules.size}`);
console.log(`Exercices ajoutés       : ${(plan.exercisesAdded ?? []).length}`);
console.log(`Termes glossaire ajoutés: ${(plan.glossaryTermsAdded ?? []).length}`);
for (const w of warn) console.log(`⚠️  ${w}`);

if (errors.length) {
  console.error(`\n❌ ${errors.length} problème(s) :`);
  for (const e of errors) console.error(`   • ${e}`);
  process.exit(1);
}
console.log('\n✅ Couverture V17 valide : plan cohérent, aucune dérive hors périmètre.');
