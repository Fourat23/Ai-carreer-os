#!/usr/bin/env node
// Gate V39 — lance : npm run v39:check
//
// Valide STRUCTURELLEMENT le catalogue d'évaluations diagnostiques
// (data/assessments/*.json) introduit au Sprint V39, ainsi que son intégration au
// Curriculum Graph. NE JUGE JAMAIS la profondeur ni ne « note » l'apprentissage :
// une évaluation est un PROXY. Contrôles (cf. TSD-039) :
//   1. chaque fichier est une évaluation valide (validateAssessment) ;
//   2. id de fichier == id interne, pas de doublon ;
//   3. chaque compétence ∈ taxonomie SKILL du programme (data/program.json) ;
//   4. chaque lessonRefs/remediation pointe une leçon existante ;
//   5. invariants déterministes (déjà vérifiés par le modèle : index bornés, pas de
//      flottant, multi ensembliste) ;
//   6. couverture minimale : ≥ 12 évaluations, ≥ 1 question TRANSFER et ≥ 1 DIAGNOSIS ;
//   7. le Curriculum Graph enrichi des évaluations reste SANS anomalie bloquante.
//
// Lecture seule ; exit 1 au moindre problème bloquant. Robuste : passe si le
// répertoire est absent (rien à valider).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAssessment, assessmentTaxonomySummary, TAXONOMY } from '../lib/assessment.mjs';
import { buildCurriculumGraph, auditCurriculumGraph } from '../lib/curriculum-graph.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const DIR = R('data/assessments');
const MIN_ASSESSMENTS = 12;
const errors = [];

console.log('── Gate V39 (Maîtrise & évaluation de transfert)');

if (!existsSync(DIR)) {
  console.log('⚠️  data/assessments absent : rien à valider (attendu avant CP3).');
  console.log('\n✅ V39 valide (aucun catalogue déclaré).');
  process.exit(0);
}

const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const knownSkills = new Set((program.skills || []).map((s) => s.id));
const knownLessons = new Set((program.lessons || []).map((l) => l.slug));

const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
const ids = new Set();
const assessments = [];

for (const f of files) {
  const where = `assessment ${f}`;
  let raw;
  try { raw = JSON.parse(readFileSync(join(DIR, f), 'utf8')); }
  catch (e) { errors.push(`${where} : JSON invalide (${e.message})`); continue; }

  const v = validateAssessment(raw);
  if (!v.ok) { for (const e of v.errors) errors.push(`${where} : ${e}`); continue; }

  if (raw.id !== f.replace(/\.json$/, '')) errors.push(`${where} : id interne « ${raw.id} » ≠ nom de fichier`);
  if (ids.has(raw.id)) errors.push(`${where} : id dupliqué « ${raw.id} »`);
  ids.add(raw.id);

  for (const s of raw.skills || []) {
    if (!knownSkills.has(s)) errors.push(`${where} : compétence « ${s} » hors taxonomie skill du programme`);
  }
  for (const key of ['lessonRefs', 'remediation']) {
    for (const l of raw[key] || []) {
      if (!knownLessons.has(l)) errors.push(`${where} : ${key} « ${l} » ne correspond à aucune leçon`);
    }
  }
  assessments.push(raw);
}

// Couverture minimale.
if (assessments.length < MIN_ASSESSMENTS) {
  errors.push(`catalogue : ${assessments.length} évaluation(s) < minimum ${MIN_ASSESSMENTS}`);
}
const taxo = assessmentTaxonomySummary(assessments);
if ((taxo.TRANSFER || 0) < 1) errors.push('catalogue : aucune question de niveau TRANSFER (transfert requis)');
if ((taxo.DIAGNOSIS || 0) < 1) errors.push('catalogue : aucune question de niveau DIAGNOSIS (diagnostic requis)');

// Intégration au Curriculum Graph : aucune référence morte d'évaluation.
const graph = buildCurriculumGraph({
  lessons: program.lessons,
  known: { skills: knownSkills },
  assessments: assessments.map((a) => ({ id: a.id, skills: a.skills, lessonRefs: a.lessonRefs, remediation: a.remediation })),
});
const rep = auditCurriculumGraph(graph);
const deadAssess = rep.blocking.filter((b) => b.type === 'dead-assessment-ref');
for (const d of deadAssess) errors.push(`graphe : ${d.subject} — ${d.detail}`);

console.log(`Évaluations       : ${assessments.length}`);
console.log(`Compétences       : ${[...ids].length ? [...new Set(assessments.flatMap((a) => a.skills))].sort().join(', ') : '—'}`);
console.log(`Taxonomie         : ${TAXONOMY.map((t) => `${t}=${taxo[t] || 0}`).join(' · ')}`);

if (errors.length) {
  console.error(`\n❌ ${errors.length} problème(s) :`);
  for (const e of errors) console.error(`   • ${e}`);
  process.exit(1);
}
console.log('\n✅ V39 valide : catalogue conforme (structure, taxonomie, compétences/leçons résolues, déterminisme, graphe sans référence morte).');
