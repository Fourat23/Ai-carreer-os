#!/usr/bin/env node
// Gate V24 — lance : npm run v24:check
//
// 1. Valide TOUS les scénarios de sécurité (data/security/*.json, hors cve-db) et
//    les playbooks (data/playbooks/*.json) contre les données réelles ; anti-fuite
//    de la vue publique ; AUCUN secret trop réaliste dans le périmètre V24
//    (uniquement des valeurs factices).
// 2. Détecte la DÉRIVE éditoriale (si un plan v24-enrichment-plan.json existe).
// 3. Vérifie la PROFONDEUR minimale des journées enrichies déclarées.
// Lecture seule ; exit 1 au moindre problème. Passe avec des répertoires vides.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateScenario, publicScenarioView, detectSecretCandidates } from '../lib/security.mjs';
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

// 1a. Scénarios valides + anti-fuite + secrets factices uniquement.
const secDir = R('data/security');
const scnFiles = existsSync(secDir) ? readdirSync(secDir).filter((f) => f.endsWith('.json') && f !== 'cve-db.json') : [];
const ids = new Set();
for (const f of scnFiles) {
  const s = JSON.parse(readFileSync(join(secDir, f), 'utf8'));
  const v = validateScenario(s, ctx);
  if (!v.ok) errors.push(`scénario ${f} invalide : ${v.errors.join(' ; ')}`);
  if (ids.has(s.id)) errors.push(`scénario : id dupliqué « ${s.id} »`);
  ids.add(s.id);
  const blob = JSON.stringify(publicScenarioView(s));
  if (/sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{12,}/.test(blob)) errors.push(`scénario ${f} : fuite de secret dans la vue publique`);
}

// 1b. Playbooks : JSON valides, champs de base, RICHESSE professionnelle, aucun secret réel.
// Un playbook « Que faire dans ce cas ? » doit être exploitable, pas une FAQ : chaque
// rubrique métier doit être présente et non vide (cf. app/security PlaybookView).
const PB_REQUIRED_ARRAYS = [
  'symptoms', 'firstChecks', 'containment', 'recommendedOrder', 'communication',
  'evidence', 'doNot', 'mitigation', 'correction', 'validation', 'delivery',
  'monitoring', 'documentation', 'prevention', 'exitCriteria',
];
const pbDir = R('data/playbooks');
const pbFiles = existsSync(pbDir) ? readdirSync(pbDir).filter((f) => f.endsWith('.json')) : [];
const pbIds = new Set();
for (const f of pbFiles) {
  let p;
  try { p = JSON.parse(readFileSync(join(pbDir, f), 'utf8')); } catch (e) { errors.push(`playbook ${f} : JSON invalide — ${e.message}`); continue; }
  if (!p.id || typeof p.id !== 'string') errors.push(`playbook ${f} : id manquant`);
  if (pbIds.has(p.id)) errors.push(`playbook : id dupliqué « ${p.id} »`);
  pbIds.add(p.id);
  if (!p.situation && !p.title) errors.push(`playbook ${f} : situation/titre manquant`);
  if (!p.domain || typeof p.domain !== 'string') errors.push(`playbook ${f} : domaine manquant`);
  for (const k of PB_REQUIRED_ARRAYS) {
    if (!Array.isArray(p[k]) || p[k].length === 0) errors.push(`playbook ${f} : rubrique « ${k} » manquante ou vide`);
    else if (p[k].some((x) => typeof x !== 'string' || !x.trim())) errors.push(`playbook ${f} : rubrique « ${k} » contient une entrée vide`);
  }
  // dayRefs (facultatif) doivent exister ; relatedGlossary (facultatif) : ids texte.
  for (const d of p.dayRefs ?? []) if (!validDays.has(d)) errors.push(`playbook ${f} : jour inexistant ${d}`);
  for (const c of detectSecretCandidates(JSON.stringify(p))) {
    if (!c.fake && c.confidence === 'high') errors.push(`playbook ${f} : secret trop réaliste`);
  }
}

// 1c. Base CVE : factice uniquement (ids FAKE-CVE-…).
const cvePath = R('data/security/cve-db.json');
if (existsSync(cvePath)) {
  try {
    const db = JSON.parse(readFileSync(cvePath, 'utf8'));
    const list = Array.isArray(db) ? db : (db.entries ?? []);
    for (const e of list) if (!String(e.id ?? '').startsWith('FAKE-CVE-')) errors.push(`cve-db : id non factice « ${e.id} » (attendu FAKE-CVE-…)`);
  } catch (e) { errors.push(`cve-db.json : JSON invalide — ${e.message}`); }
}

// 2 & 3. Dérive + profondeur (si plan présent).
const planPath = R('docs/architecture/v24-enrichment-plan.json');
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
  warn.push('plan d\'enrichissement v24 absent : dérive/profondeur non vérifiées (attendu avant CP4)');
}

console.log('── Gate V24 (Security & Incident Lab) ──');
console.log(`Scénarios validés   : ${scnFiles.length}`);
console.log(`Playbooks validés   : ${pbFiles.length}`);
for (const w of warn) console.log(`⚠️  ${w}`);
if (errors.length) { console.error(`\n❌ ${errors.length} problème(s) :`); for (const e of errors) console.error(`   • ${e}`); process.exit(1); }
console.log('\n✅ V24 valide : scénarios/playbooks cohérents, secrets factices uniquement, aucune dérive hors périmètre.');
