#!/usr/bin/env node
// Gate de couverture V19 — lance : npm run v19:check
//
// 1. Valide le plan (docs/architecture/v19-enrichment-plan.json) contre les
//    données réelles (jours, parcours, exercices, missions, compétences, glossaire).
// 2. Détecte la DÉRIVE : tout module source / journée générée / glossaire /
//    entrée program.json modifié hors du périmètre déclaré (vs baselineRef) échoue.
// Lecture seule ; exit 1 au moindre problème.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateCoveragePlan, extractDayRefs } from '../lib/v19-coverage.mjs';
import { DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID } from '../lib/catalogue.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warn = [];

const plan = JSON.parse(readFileSync(R('docs/architecture/v19-enrichment-plan.json'), 'utf8'));
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const validDays = new Set(program.days.map((d) => d.day));
const trackIds = new Set([DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID, ...(plan.tracksAdded ?? [])]);
const exerciseIds = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
const missionDir = R('data/missions');
const missionIds = new Set(existsSync(missionDir) ? readdirSync(missionDir).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')) : []);
const glossary = JSON.parse(readFileSync(R('curriculum/glossary/glossary.json'), 'utf8'));
const plannedTerms = new Set((plan.glossaryTermsAdded ?? []).map((g) => String(g.term ?? '').toLowerCase()));
const glossaryTerms = new Set(
  glossary.flatMap((e) => [e.term, e.fullForm, ...(e.aliases ?? [])].filter(Boolean).map((s) => s.toLowerCase())).filter((t) => !plannedTerms.has(t)),
);
const skillIds = { has: (s) => isKnownSkill(s) };

const { errors: planErrors } = validateCoveragePlan(plan, { validDays, trackIds, skillIds, exerciseIds, missionIds, glossaryTerms });
errors.push(...planErrors);

const baseRef = plan.baselineRef;
let baseOk = true;
try { execSync(`git rev-parse --verify --quiet ${baseRef}^{commit}`, { cwd: ROOT, stdio: 'pipe' }); }
catch { baseOk = false; errors.push(`baseline « ${baseRef} » introuvable : dérive non vérifiable`); }

const targetDays = new Set((plan.days ?? []).map((d) => d.day));
const allowedModules = new Set(plan.allowedSourceModules ?? []);
const allowedKept = new Set(plan.allowedKeptMarkdown ?? []);

if (baseOk) {
  const changed = execSync(`git diff --name-only ${baseRef} -- scripts/data curriculum data/program.json`, { cwd: ROOT, stdio: 'pipe' })
    .toString().split('\n').map((s) => s.trim()).filter(Boolean);
  for (const f of changed) {
    if (f === 'data/program.json') continue;
    if (f.startsWith('scripts/data/') && f.endsWith('.mjs')) {
      if (!allowedModules.has(f)) errors.push(`dérive : module source hors périmètre — ${f}`);
      continue;
    }
    if (f === 'curriculum/glossary/glossary.json') {
      if (!(plan.glossaryTermsAdded ?? []).length) errors.push('dérive : glossary.json modifié mais aucun terme déclaré');
      continue;
    }
    const m = f.match(/curriculum\/(?:days|solutions)\/day-0*(\d{1,3})/);
    if (m) { const n = Number(m[1]); if (!targetDays.has(n)) errors.push(`dérive : journée hors périmètre — ${f} (jour ${n})`); continue; }
    if (f.endsWith('.md') && !allowedKept.has(f)) errors.push(`dérive : contenu pédagogique hors périmètre — ${f}`);
  }
  try {
    const baseProgram = JSON.parse(execSync(`git show ${baseRef}:data/program.json`, { cwd: ROOT, stdio: 'pipe' }).toString());
    const baseByDay = new Map((baseProgram.days ?? []).map((d) => [d.day, JSON.stringify(d)]));
    for (const d of program.days) {
      const before = baseByDay.get(d.day);
      if (before !== undefined && before !== JSON.stringify(d) && !targetDays.has(d.day)) errors.push(`dérive : program.json — jour ${d.day} modifié hors périmètre`);
    }
    if ((baseProgram.days ?? []).length !== program.days.length) errors.push(`dérive : nombre de journées ${(baseProgram.days ?? []).length} → ${program.days.length}`);
  } catch (e) { warn.push(`comparaison program.json impossible : ${e.message}`); }
}

for (const entry of plan.days ?? []) for (const n of extractDayRefs(entry.objective ?? '')) if (!validDays.has(n)) errors.push(`journée ${entry.day} : lien interne cassé vers jour ${n}`);

console.log('── Gate de couverture V19 ──');
console.log(`Baseline                : ${baseRef}${baseOk ? '' : ' (INTROUVABLE)'}`);
console.log(`Journées cibles         : ${targetDays.size}`);
console.log(`Modules source autorisés: ${allowedModules.size}`);
console.log(`Exercices ajoutés       : ${(plan.exercisesAdded ?? []).length}`);
console.log(`Missions ajoutées       : ${(plan.missionsAdded ?? []).length}`);
console.log(`Termes glossaire ajoutés: ${(plan.glossaryTermsAdded ?? []).length}`);
console.log(`Parcours ajouté         : ${(plan.tracksAdded ?? []).join(', ') || '—'}`);
for (const w of warn) console.log(`⚠️  ${w}`);
if (errors.length) { console.error(`\n❌ ${errors.length} problème(s) :`); for (const e of errors) console.error(`   • ${e}`); process.exit(1); }
console.log('\n✅ Couverture V19 valide : plan cohérent, aucune dérive hors périmètre.');
