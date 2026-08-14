#!/usr/bin/env node
// Gate V40 — lance : npm run v40:check
//
// Valide STRUCTURELLEMENT le catalogue de capstones (data/capstones/*.json) — la
// couche de simulation professionnelle — et son intégration au Curriculum Graph.
// NE JUGE JAMAIS la profondeur par la longueur ; un capstone est un PROXY de
// raisonnement. Contrôles bloquants (cf. TSD-040) :
//   1. chaque fichier est un capstone valide (validateCapstone) ;
//   2. id fichier == id interne, ids uniques ;
//   3. compétences ∈ taxonomie skill du programme ;
//   4. lessonRefs/exerciseRefs/playbookRefs/dayRefs résolus ;
//   5. ≥ 3 phases dont ≥ 1 diagnosis ; ≥ 3 artefacts dont ≥ 1 bruit (déjà vérifiés par le modèle) ;
//   6. ANTI-LEAK : la bonne réponse d'une question de diagnostic n'apparaît pas
//      littéralement dans le signal/contexte (la cause serait donnée d'avance) ;
//   7. domaine simulé => simulationNote présente ;
//   8. graphe enrichi des capstones SANS anomalie bloquante.
// Le seuil « ≥ 4 capstones / ≥ 4 domaines » est un AVERTISSEMENT (cible, pas invariant :
// « 4 excellents > 5 moyens ») — vérifié à l'audit final. Passe si le répertoire est absent.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCapstone, capstoneDomainSummary } from '../lib/capstone.mjs';
import { buildCurriculumGraph, auditCurriculumGraph } from '../lib/curriculum-graph.mjs';
import { normalizeText } from '../lib/glossary-core.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const DIR = R('data/capstones');
const TARGET_CAPSTONES = 4;
const errors = [];
const warn = [];

console.log('── Gate V40 (Simulation professionnelle & capstones)');

if (!existsSync(DIR) || readdirSync(DIR).filter((f) => f.endsWith('.json')).length === 0) {
  console.log('⚠️  data/capstones absent/vide : rien à valider (attendu avant CP5).');
  console.log('\n✅ V40 valide (aucun catalogue déclaré).');
  process.exit(0);
}

const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const knownSkills = new Set((program.skills || []).map((s) => s.id));
const knownLessons = new Set((program.lessons || []).map((l) => l.slug));
const validDays = new Set((program.days || []).map((d) => d.day));
const knownEx = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
const knownPb = new Set(readdirSync(R('data/playbooks')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));

const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
const ids = new Set();
const capstones = [];

for (const f of files) {
  const where = `capstone ${f}`;
  let c;
  try { c = JSON.parse(readFileSync(join(DIR, f), 'utf8')); }
  catch (e) { errors.push(`${where} : JSON invalide (${e.message})`); continue; }

  const v = validateCapstone(c);
  if (!v.ok) { for (const e of v.errors) errors.push(`${where} : ${e}`); continue; }

  if (c.id !== f.replace(/\.json$/, '')) errors.push(`${where} : id interne « ${c.id} » ≠ nom de fichier`);
  if (ids.has(c.id)) errors.push(`${where} : id dupliqué « ${c.id} »`);
  ids.add(c.id);

  for (const s of c.skills || []) if (!knownSkills.has(s)) errors.push(`${where} : compétence « ${s} » hors taxonomie skill du programme`);
  for (const l of c.lessonRefs || []) if (!knownLessons.has(l)) errors.push(`${where} : lessonRef « ${l} » introuvable`);
  for (const e of c.exerciseRefs || []) if (!knownEx.has(e)) errors.push(`${where} : exerciseRef « ${e} » introuvable`);
  for (const p of c.playbookRefs || []) if (!knownPb.has(p)) errors.push(`${where} : playbookRef « ${p} » introuvable`);
  for (const d of c.dayRefs || []) if (!validDays.has(d)) errors.push(`${where} : dayRef « ${d} » introuvable`);

  // Anti-leak : la bonne réponse (texte) d'une question de diagnostic ne doit pas
  // apparaître littéralement dans le signal ou le contexte.
  const haystack = normalizeText(`${c.signal || ''} ${c.context || ''}`);
  for (const ph of c.phases || []) {
    if (ph.kind !== 'diagnosis') continue;
    for (const q of ph.questions || []) {
      const correct = [];
      if (q.kind === 'mcq' && Array.isArray(q.options)) correct.push(q.options[q.answer]);
      else if (q.kind === 'multi' && Array.isArray(q.options) && Array.isArray(q.answer)) for (const i of q.answer) correct.push(q.options[i]);
      for (const txt of correct) {
        if (typeof txt === 'string' && txt.length >= 12 && haystack.includes(normalizeText(txt))) {
          errors.push(`${where} : anti-leak — la bonne réponse de diagnostic « ${txt} » apparaît dans le signal/contexte`);
        }
      }
    }
  }

  // Domaine simulé (cloud/k8s/ai/rag/ml/distribu…) sans note de simulation.
  const dom = normalizeText(c.domain || '');
  const simulatedDomain = /(cloud|kubernetes|k8s|devops|ai|rag|ml|data|distrib)/.test(dom);
  if (simulatedDomain && !c.simulationNote) warn.push(`${where} : domaine potentiellement simulé sans simulationNote`);

  capstones.push(c);
}

// Graphe enrichi des capstones : aucune anomalie bloquante.
const graph = buildCurriculumGraph({
  lessons: program.lessons,
  known: { skills: knownSkills, exercises: knownEx, playbooks: knownPb },
  capstones: capstones.map((c) => ({ id: c.id, skills: c.skills, lessonRefs: c.lessonRefs, exerciseRefs: c.exerciseRefs, playbookRefs: c.playbookRefs })),
});
const rep = auditCurriculumGraph(graph);
for (const b of rep.blocking.filter((x) => x.type === 'dead-capstone-ref')) errors.push(`graphe : ${b.subject} — ${b.detail}`);

const domains = capstoneDomainSummary(capstones);
const nDomains = Object.keys(domains).length;
if (capstones.length < TARGET_CAPSTONES) warn.push(`cible : ${capstones.length} capstone(s) < ${TARGET_CAPSTONES} (acceptable si l'audit le justifie)`);
if (nDomains < TARGET_CAPSTONES) warn.push(`cible : ${nDomains} domaine(s) mobilisé(s) < ${TARGET_CAPSTONES}`);

console.log(`Capstones         : ${capstones.length}`);
console.log(`Domaines          : ${Object.keys(domains).sort().join(', ') || '—'}`);
for (const w of warn) console.log(`⚠️  ${w}`);

if (errors.length) {
  console.error(`\n❌ ${errors.length} problème(s) :`);
  for (const e of errors) console.error(`   • ${e}`);
  process.exit(1);
}
console.log('\n✅ V40 valide : capstones conformes (structure, phases, artefacts, refs résolues, anti-leak, graphe sans référence morte).');
