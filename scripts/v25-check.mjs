#!/usr/bin/env node
// Gate V25 — lance : npm run v25:check
//
// 1. Valide TOUTES les architectures cloud (data/cloud/*.json hors price-book &
//    provider-map) contre les données réelles ; comparaison problématique↔sain
//    (l'état corrigé ne doit plus produire de diagnostic bloquant/risque) ;
//    anti-fuite de la vue publique ; AUCUN credential réaliste (valeurs factices).
// 2. Vérifie que price-book et provider-map sont FACTICES/cohérents.
// 3. Valide les playbooks cloud (15 rubriques) — mêmes exigences que V24.
// 4. Détecte la DÉRIVE éditoriale + profondeur (si un plan v25-enrichment existe).
// Lecture seule ; exit 1 au moindre problème. Passe avec des répertoires vides.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCloudArchitecture, publicCloudView, detectCloudSecretLike } from '../lib/cloud-architecture.mjs';
import { analyzeCloud } from '../lib/cloud-analysis.mjs';
import { buildCatalogue } from '../lib/catalogue.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warn = [];

const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const validDays = new Set(program.days.map((d) => d.day));
const trackIds = new Set(buildCatalogue(program).tracks.map((t) => t.id));
const ctx = { skillIds: { has: (s) => isKnownSkill(s) }, validDays, trackIds };

const RESERVED = new Set(['price-book.json', 'provider-map.json']);
const cloudDir = R('data/cloud');
const priceBook = existsSync(R('data/cloud/price-book.json'))
  ? JSON.parse(readFileSync(R('data/cloud/price-book.json'), 'utf8')) : [];

// 1. Architectures cloud : valides + comparaison problématique↔sain + anti-fuite.
const archFiles = existsSync(cloudDir) ? readdirSync(cloudDir).filter((f) => f.endsWith('.json') && !RESERVED.has(f)) : [];
const ids = new Set();
for (const f of archFiles) {
  let a;
  try { a = JSON.parse(readFileSync(join(cloudDir, f), 'utf8')); } catch (e) { errors.push(`architecture ${f} : JSON invalide — ${e.message}`); continue; }
  const v = validateCloudArchitecture(a, ctx);
  if (!v.ok) errors.push(`architecture ${f} invalide : ${v.errors.join(' ; ')}`);
  if (ids.has(a.id)) errors.push(`architecture : id dupliqué « ${a.id} »`);
  ids.add(a.id);

  // Anti-fuite : aucun credential réaliste dans la vue publique.
  const blob = JSON.stringify(publicCloudView(a));
  for (const c of detectCloudSecretLike(blob)) if (!c.fake) errors.push(`architecture ${f} : credential réaliste dans la vue publique`);

  // Comparaison : l'état corrigé (fixed*) ne produit plus de diagnostic bloquant/risque.
  if (v.ok && (a.fixedResources || a.fixedIdentities || a.fixedNetwork)) {
    const fixed = {
      ...a,
      resources: a.fixedResources ?? a.resources,
      identities: a.fixedIdentities ?? a.identities,
      network: a.fixedNetwork ?? a.network,
    };
    const res = analyzeCloud(fixed, priceBook);
    const bad = res.diagnostics.filter((d) => d.severity === 'blocking' || d.severity === 'risk');
    if (bad.length) errors.push(`architecture ${f} : l'état corrigé produit encore ${bad.length} diagnostic(s) bloquant/risque (${bad.map((d) => d.id).join(', ')})`);
  }
}

// 2. price-book & provider-map : factices/cohérents.
if (existsSync(R('data/cloud/price-book.json'))) {
  const pb = priceBook;
  const idStr = String(pb.id ?? '');
  if (!/FAKE/i.test(idStr) && !/FAKE/i.test(String(pb.disclaimer ?? ''))) errors.push('price-book : doit être explicitement factice (id/disclaimer FAKE)');
  const entries = Array.isArray(pb) ? pb : (pb.entries ?? []);
  if (!entries.length) errors.push('price-book : aucune entrée');
  for (const e of entries) if (!Number.isFinite(e.cost)) errors.push(`price-book : coût non numérique pour « ${e.kind} »`);
}
if (existsSync(R('data/cloud/provider-map.json'))) {
  const pm = JSON.parse(readFileSync(R('data/cloud/provider-map.json'), 'utf8'));
  const maps = Array.isArray(pm.mappings) ? pm.mappings : [];
  if (!maps.length) errors.push('provider-map : aucun mapping');
  for (const m of maps) {
    if (!m.concept || !m.aws || !m.azure) errors.push(`provider-map : mapping incomplet (${m.concept ?? '?'})`);
    // Mapping RAISONNÉ : chaque correspondance doit expliquer when/why/difference.
    if (!m.when || !m.why || !m.difference) errors.push(`provider-map : « ${m.concept ?? '?'} » sans when/why/difference (mapping non raisonné)`);
  }
}

// 3. Playbooks cloud : richesse (mêmes 15 rubriques qu'en V24). On ne valide QUE les
//    playbooks marqués domain cloud (finops/network/compute/storage/database/iam/
//    resilience/observability) pour ne pas re-valider ceux de V24 (déjà couverts par v24:check).
const PB_REQUIRED = ['symptoms', 'firstChecks', 'containment', 'recommendedOrder', 'communication',
  'evidence', 'doNot', 'mitigation', 'correction', 'validation', 'delivery', 'monitoring',
  'documentation', 'prevention', 'exitCriteria'];
const CLOUD_PB_DOMAINS = new Set(['finops', 'network', 'compute', 'storage', 'database', 'iam', 'resilience', 'observability', 'cloud']);
const pbDir = R('data/playbooks');
const pbFiles = existsSync(pbDir) ? readdirSync(pbDir).filter((f) => f.endsWith('.json')) : [];
let cloudPbCount = 0;
for (const f of pbFiles) {
  let p;
  try { p = JSON.parse(readFileSync(join(pbDir, f), 'utf8')); } catch { continue; }
  if (!CLOUD_PB_DOMAINS.has(p.domain) || !String(p.id ?? '').startsWith('cloud-')) continue;
  cloudPbCount += 1;
  for (const k of PB_REQUIRED) {
    if (!Array.isArray(p[k]) || p[k].length === 0) errors.push(`playbook cloud ${f} : rubrique « ${k} » manquante ou vide`);
  }
  for (const d of p.dayRefs ?? []) if (!validDays.has(d)) errors.push(`playbook cloud ${f} : jour inexistant ${d}`);
  for (const c of detectCloudSecretLike(JSON.stringify(p))) if (!c.fake) errors.push(`playbook cloud ${f} : credential réaliste`);
}

// 4. Dérive + profondeur (si plan présent).
const planPath = R('docs/architecture/v25-enrichment-plan.json');
if (existsSync(planPath)) {
  const plan = JSON.parse(readFileSync(planPath, 'utf8'));
  const targetDays = new Set(plan.targetDays ?? []);
  const allowedModules = new Set(plan.allowedSourceModules ?? []);
  let baseOk = true;
  try { execSync(`git rev-parse --verify --quiet ${plan.baselineRef}^{commit}`, { cwd: ROOT, stdio: 'pipe' }); }
  catch { baseOk = false; warn.push(`baseline « ${plan.baselineRef} » introuvable : dérive non vérifiée`); }
  if (baseOk) {
    const changed = execSync(`git diff --name-only ${plan.baselineRef} -- scripts/data curriculum`, { cwd: ROOT, stdio: 'pipe' })
      .toString().split('\n').map((s) => s.trim()).filter(Boolean);
    for (const fp of changed) {
      if (fp.startsWith('scripts/data/') && fp.endsWith('.mjs')) { if (!allowedModules.has(fp)) errors.push(`dérive : module source hors périmètre — ${fp}`); continue; }
      const m = fp.match(/curriculum\/(?:days|solutions)\/day-0*(\d{1,3})/);
      if (m) { const n = Number(m[1]); if (!targetDays.has(n)) errors.push(`dérive : journée hors périmètre — ${fp} (jour ${n})`); continue; }
      if (fp.endsWith('.md')) errors.push(`dérive : contenu pédagogique hors périmètre — ${fp}`);
    }
  }
  for (const [day, concepts] of Object.entries(plan.requiredConcepts ?? {})) {
    const p = R(`curriculum/days/day-${String(day).padStart(3, '0')}.md`);
    if (!existsSync(p)) { errors.push(`journée ${day} introuvable`); continue; }
    const txt = readFileSync(p, 'utf8').toLowerCase();
    const missing = concepts.filter((c) => !txt.includes(String(c).toLowerCase()));
    if (missing.length) errors.push(`journée ${day} : concepts clés absents — ${missing.join(', ')}`);
  }
} else {
  warn.push('plan d\'enrichissement v25 absent : dérive/profondeur non vérifiées (attendu avant CP4)');
}

console.log('── Gate V25 (Cloud Architecture Lab) ──');
console.log(`Architectures validées : ${archFiles.length}`);
console.log(`Playbooks cloud        : ${cloudPbCount}`);
for (const w of warn) console.log(`⚠️  ${w}`);
if (errors.length) { console.error(`\n❌ ${errors.length} problème(s) :`); for (const e of errors) console.error(`   • ${e}`); process.exit(1); }
console.log('\n✅ V25 valide : architectures/coût/mapping/playbooks cohérents, valeurs factices uniquement, aucune dérive hors périmètre.');
