#!/usr/bin/env node
// Gate V42 — lance : npm run v42:check
//
// Valide le dispositif de TRANSFERT (cf. TSD-042) : catalogue de défis de transfert,
// registre de misconceptions, intégration au Curriculum Graph. NE JUGE JAMAIS la
// profondeur par la longueur ; un score de transfert reste un PROXY. Contrôles
// bloquants :
//   1. chaque défi est valide (validateTransferChallenge), id == fichier, unique ;
//   2. skills ∈ taxonomie skill du programme ; lessonRefs résolus ;
//   3. transferLevel ∈ {T4,T5} ; T5 ⇒ bridge + crossDomain (déjà vérifié par le modèle) ;
//   4. auto-cohérence (réponses déclarées → 100 %) ;
//   5. chaque misconception : skill ∈ programme, leçons/exercices de remédiation résolus ;
//   6. le graphe enrichi des défis ne contient AUCUN dead-transfer-ref.
// Signale (avertissement, non bloquant) : compétences structurantes sans défi de
// transfert, et absence de tout défi T5.
// Lecture seule ; exit 1 au moindre problème bloquant. Passe si le répertoire est absent.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTransferChallenge, gradeTransferChallenge } from '../lib/transfer-challenge.mjs';
import { MISCONCEPTIONS } from '../lib/misconceptions.mjs';
import { buildCurriculumGraph, auditCurriculumGraph } from '../lib/curriculum-graph.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const DIR = R('data/transfer-challenges');
const errors = [];
const warn = [];

// Compétences structurantes évaluées pour le diagnostic skill-without-transfer.
const STRUCTURAL_SKILLS = new Set(['algo', 'ds', 'jsts', 'http', 'sql', 'se', 'archi', 'ml', 'rag', 'secu', 'cloud']);

console.log('── Gate V42 (Transfert profond & variabilité)');

const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const knownSkills = new Set((program.skills || []).map((s) => s.id));
const knownLessons = new Set((program.lessons || []).map((l) => l.slug));
const knownEx = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));

// 5. Misconceptions (toujours vérifiées).
const seenMis = new Set();
for (const m of MISCONCEPTIONS) {
  if (seenMis.has(m.id)) errors.push(`misconception : id dupliqué « ${m.id} »`);
  seenMis.add(m.id);
  if (!knownSkills.has(m.skill)) errors.push(`misconception ${m.id} : skill « ${m.skill} » hors programme`);
  for (const l of m.lessonRefs || []) if (!knownLessons.has(l)) errors.push(`misconception ${m.id} : leçon « ${l} » introuvable`);
  for (const e of m.exerciseRefs || []) if (!knownEx.has(e)) errors.push(`misconception ${m.id} : exercice « ${e} » introuvable`);
  if (!(m.lessonRefs || []).length) errors.push(`misconception ${m.id} : aucune leçon de remédiation`);
}

const challenges = [];
if (!existsSync(DIR) || readdirSync(DIR).filter((f) => f.endsWith('.json')).length === 0) {
  warn.push('data/transfer-challenges absent/vide (attendu avant CP3).');
} else {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
  const ids = new Set();
  for (const f of files) {
    const where = `défi ${f}`;
    let c;
    try { c = JSON.parse(readFileSync(join(DIR, f), 'utf8')); }
    catch (e) { errors.push(`${where} : JSON invalide (${e.message})`); continue; }
    const v = validateTransferChallenge(c);
    if (!v.ok) { for (const e of v.errors) errors.push(`${where} : ${e}`); continue; }
    if (c.id !== f.replace(/\.json$/, '')) errors.push(`${where} : id « ${c.id} » ≠ nom de fichier`);
    if (ids.has(c.id)) errors.push(`${where} : id dupliqué « ${c.id} »`);
    ids.add(c.id);
    for (const s of c.skills) if (!knownSkills.has(s)) errors.push(`${where} : compétence « ${s} » hors programme`);
    for (const l of c.lessonRefs || []) if (!knownLessons.has(l)) errors.push(`${where} : lessonRef « ${l} » introuvable`);
    const resp = Object.fromEntries(c.questions.map((q) => [q.id, q.answer]));
    const r = gradeTransferChallenge(c, resp);
    if (!(r.passed === r.total && r.passedOverall)) errors.push(`${where} : auto-cohérence ${r.passed}/${r.total}`);
    challenges.push(c);
  }
  if (!challenges.some((c) => c.transferLevel === 'T5')) warn.push('aucun défi T5 (deep transfer) dans le catalogue.');
}

// 6. Graphe enrichi : aucun dead-transfer-ref ; diagnostic skill-without-transfer (avertissement).
const graph = buildCurriculumGraph({
  lessons: program.lessons,
  known: { skills: knownSkills, structuralSkills: STRUCTURAL_SKILLS, exercises: knownEx },
  transferChallenges: challenges.map((c) => ({ id: c.id, skills: c.skills, lessonRefs: c.lessonRefs })),
});
const rep = auditCurriculumGraph(graph);
for (const b of rep.blocking.filter((x) => x.type === 'dead-transfer-ref')) errors.push(`graphe : ${b.subject} — ${b.detail}`);
const swt = rep.anomalies.filter((a) => a.type === 'skill-without-transfer');
for (const a of swt) warn.push(`graphe : ${a.detail}`);

console.log(`Défis de transfert : ${challenges.length}${challenges.length ? ` (T5=${challenges.filter((c) => c.transferLevel === 'T5').length})` : ''}`);
console.log(`Misconceptions     : ${MISCONCEPTIONS.length}`);
for (const w of warn) console.log(`⚠️  ${w}`);

if (errors.length) {
  console.error(`\n❌ ${errors.length} problème(s) :`);
  for (const e of errors) console.error(`   • ${e}`);
  process.exit(1);
}
console.log('\n✅ V42 valide : défis de transfert conformes (structure, T5⇒pont+cross-domain, refs résolues, auto-cohérence), misconceptions reliées, graphe sans référence morte.');
