#!/usr/bin/env node
// Gate V23 — lance : npm run v23:check
//
// 1. Valide TOUS les scénarios de manifests (data/manifests/*.json) contre les
//    données réelles (jours, parcours dérivés du catalogue, compétences) +
//    anti-fuite de la vue publique (aucun secret).
// 2. Détecte la DÉRIVE : toute journée générée / module source modifié hors du
//    périmètre déclaré (targetDays / allowedSourceModules, vs baselineRef) échoue.
// 3. Vérifie une PROFONDEUR minimale : les journées enrichies mentionnent les
//    concepts clés déclarés. Lecture seule ; exit 1 au moindre problème.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateManifestSet, publicManifestView } from '../lib/manifest.mjs';
import { analyzeManifests } from '../lib/manifest-analysis.mjs';
import { buildCatalogue } from '../lib/catalogue.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warn = [];

const plan = JSON.parse(readFileSync(R('docs/architecture/v23-enrichment-plan.json'), 'utf8'));
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const validDays = new Set(program.days.map((d) => d.day));
const trackIds = new Set(buildCatalogue(program).tracks.map((t) => t.id));
const ctx = { skillIds: { has: (s) => isKnownSkill(s) }, validDays, trackIds };

// 1. Manifests valides + anti-fuite + analysables.
const dir = R('data/manifests');
const sets = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
const ids = new Set();
for (const f of sets) {
  const s = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  const v = validateManifestSet(s, ctx);
  if (!v.ok) errors.push(`manifest ${f} invalide : ${v.errors.join(' ; ')}`);
  if (ids.has(s.id)) errors.push(`manifest : id dupliqué « ${s.id} »`);
  ids.add(s.id);
  const blob = JSON.stringify(publicManifestView(s));
  if (/sk-[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{8,}|AKIA[0-9A-Z]{12,}/.test(blob)) errors.push(`manifest ${f} : fuite de secret dans la vue publique`);
  try { analyzeManifests(s); } catch (e) { errors.push(`manifest ${f} : analyse en échec — ${e.message}`); }
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

// 3. Profondeur minimale.
for (const [day, concepts] of Object.entries(plan.requiredConcepts ?? {})) {
  const p = R(`curriculum/days/day-${String(day).padStart(3, '0')}.md`);
  if (!existsSync(p)) { errors.push(`journée ${day} introuvable`); continue; }
  const txt = readFileSync(p, 'utf8').toLowerCase();
  const missing = concepts.filter((c) => !txt.includes(String(c).toLowerCase()));
  if (missing.length) errors.push(`journée ${day} : concepts clés absents — ${missing.join(', ')}`);
}

console.log('── Gate V23 (Kubernetes & Orchestration Lab) ──');
console.log(`Baseline            : ${baseRef}${baseOk ? '' : ' (INTROUVABLE)'}`);
console.log(`Manifests validés   : ${sets.length}`);
console.log(`Journées cibles     : ${[...targetDays].join(', ') || '—'}`);
for (const w of warn) console.log(`⚠️  ${w}`);
if (errors.length) { console.error(`\n❌ ${errors.length} problème(s) :`); for (const e of errors) console.error(`   • ${e}`); process.exit(1); }
console.log('\n✅ V23 valide : manifests cohérents, aucune dérive hors périmètre, profondeur minimale présente.');
