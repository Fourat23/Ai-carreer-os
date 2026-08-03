#!/usr/bin/env node
// Gate V21 — lance : npm run v21:check
//
// 1. Valide TOUS les pipelines (data/pipelines/*.json) contre les données réelles
//    (jours, parcours dérivés du catalogue, compétences) + anti-fuite de la vue
//    publique (aucune fixture « with », aucun secret).
// 2. Détecte la DÉRIVE : toute journée générée / module source modifié hors du
//    périmètre déclaré (targetDays / allowedSourceModules, vs baselineRef) échoue.
// 3. Vérifie une PROFONDEUR minimale : les journées enrichies mentionnent les
//    concepts clés déclarés (présence nécessaire, non suffisante — l'audit humain
//    reste souverain sur la qualité). Lecture seule ; exit 1 au moindre problème.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePipeline, publicPipelineView } from '../lib/pipeline.mjs';
import { buildCatalogue } from '../lib/catalogue.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warn = [];

const plan = JSON.parse(readFileSync(R('docs/architecture/v21-enrichment-plan.json'), 'utf8'));
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const validDays = new Set(program.days.map((d) => d.day));
const trackIds = new Set(buildCatalogue(program).tracks.map((t) => t.id));
const ctx = { skillIds: { has: (s) => isKnownSkill(s) }, validDays, trackIds };

// 1. Pipelines valides + anti-fuite.
const pipeDir = R('data/pipelines');
const pipelines = existsSync(pipeDir) ? readdirSync(pipeDir).filter((f) => f.endsWith('.json')) : [];
const ids = new Set();
for (const f of pipelines) {
  const p = JSON.parse(readFileSync(join(pipeDir, f), 'utf8'));
  const v = validatePipeline(p, ctx);
  if (!v.ok) errors.push(`pipeline ${f} invalide : ${v.errors.join(' ; ')}`);
  if (ids.has(p.id)) errors.push(`pipeline : id dupliqué « ${p.id} »`);
  ids.add(p.id);
  const blob = JSON.stringify(publicPipelineView(p));
  if (/"with"|lintErrors|buildOk|sk-[A-Za-z0-9]{8}|ghp_/.test(blob)) errors.push(`pipeline ${f} : fuite de fixture/secret dans la vue publique`);
}

// 2. Dérive vs baselineRef.
const baseRef = plan.baselineRef;
const targetDays = new Set(plan.targetDays ?? []);
const allowedModules = new Set(plan.allowedSourceModules ?? []);
let baseOk = true;
try { execSync(`git rev-parse --verify --quiet ${baseRef}^{commit}`, { cwd: ROOT, stdio: 'pipe' }); }
catch { baseOk = false; warn.push(`baseline « ${baseRef} » introuvable : dérive non vérifiée`); }
if (baseOk) {
  const changed = execSync(`git diff --name-only ${baseRef} -- scripts/data curriculum`, { cwd: ROOT, stdio: 'pipe' })
    .toString().split('\n').map((s) => s.trim()).filter(Boolean);
  for (const fp of changed) {
    if (fp.startsWith('scripts/data/') && fp.endsWith('.mjs')) {
      if (!allowedModules.has(fp)) errors.push(`dérive : module source hors périmètre — ${fp}`);
      continue;
    }
    const m = fp.match(/curriculum\/(?:days|solutions)\/day-0*(\d{1,3})/);
    if (m) { const n = Number(m[1]); if (!targetDays.has(n)) errors.push(`dérive : journée hors périmètre — ${fp} (jour ${n})`); continue; }
    if (fp.endsWith('.md')) errors.push(`dérive : contenu pédagogique hors périmètre — ${fp}`);
  }
}

// 3. Profondeur minimale des journées enrichies.
for (const [day, concepts] of Object.entries(plan.requiredConcepts ?? {})) {
  const p = R(`curriculum/days/day-${String(day).padStart(3, '0')}.md`);
  if (!existsSync(p)) { errors.push(`journée ${day} introuvable`); continue; }
  const txt = readFileSync(p, 'utf8').toLowerCase();
  const missing = concepts.filter((c) => !txt.includes(String(c).toLowerCase()));
  if (missing.length) errors.push(`journée ${day} : concepts clés absents — ${missing.join(', ')}`);
}

console.log('── Gate V21 (Pipeline Lab & CI/CD) ──');
console.log(`Baseline            : ${baseRef}${baseOk ? '' : ' (INTROUVABLE)'}`);
console.log(`Pipelines validés   : ${pipelines.length}`);
console.log(`Journées cibles     : ${[...targetDays].join(', ') || '—'}`);
for (const w of warn) console.log(`⚠️  ${w}`);
if (errors.length) { console.error(`\n❌ ${errors.length} problème(s) :`); for (const e of errors) console.error(`   • ${e}`); process.exit(1); }
console.log('\n✅ V21 valide : pipelines cohérents, aucune dérive hors périmètre, profondeur minimale présente.');
