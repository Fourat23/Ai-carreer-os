#!/usr/bin/env node
// Ledger d'audit STRUCTUREL du catalogue d'exercices (V44 CP3, FLOOR A = 100 %).
//
// Parcourt 100 % de data/exercises et produit, PAR exercice, une ligne machine :
//   id · runtime · difficulty · skills (fines) · programSkills (projetées) ·
//   tests {public,private,kinds} · practiceType · diagnostic? · transfer? ·
//   misconception (remédiation liée) · evidenceGenerable · ladderPosition ·
//   dupSignature · anomalies[].
//
// Read-model DÉRIVÉ : réutilise projectSkill (practice-coverage), exerciseLadderPosition
// (practice-ladder), MISCONCEPTIONS, transfer-challenges. Aucune réécriture ici (CP3).
// Sortie : docs/practice-ledger-v44.json (ledger complet) + résumé imprimé.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectSkill } from '../lib/practice-coverage.mjs';
import { exerciseLadderPosition } from '../lib/practice-ladder.mjs';
import { MISCONCEPTIONS } from '../lib/misconceptions.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const load = (d) => readdirSync(R(d)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(R(`${d}/${f}`), 'utf8')));

const CODE_RUNTIMES = new Set(['node-js', 'typescript', 'python3']);
const isFloat = (v) => typeof v === 'number' && !Number.isInteger(v);

const exercises = load('data/exercises');
const transfers = load('data/transfer-challenges');
// exercice → misconception(s) de remédiation qui le citent.
const exToMis = new Map();
for (const m of MISCONCEPTIONS) for (const ex of (m.exerciseRefs || [])) {
  if (!exToMis.has(ex)) exToMis.set(ex, []);
  exToMis.get(ex).push(m.id);
}
// compétences réellement traitées par un défi de transfert (projetées).
const transferSkills = new Set();
for (const t of transfers) for (const s of (t.skills || [])) transferSkills.add(projectSkill(s));

const ledger = [];
const dupBuckets = new Map();

for (const e of exercises) {
  const tests = Array.isArray(e.tests) ? e.tests : [];
  const pub = tests.filter((t) => !t.private);
  const priv = tests.filter((t) => t.private);
  const kinds = [...new Set(tests.map((t) => t.kind))];
  const fine = Array.isArray(e.skills) ? e.skills : [];
  const programSkills = [...new Set(fine.map(projectSkill).filter(Boolean))];
  const isDebug = /(^|[-_])debug([-_]|$)/.test(String(e.id));
  const misc = exToMis.get(e.id) || [];
  const hasTransfer = programSkills.some((s) => transferSkills.has(s));

  // Anomalies DURES : rupture réelle du contrat d'exercice.
  const anomalies = [];
  if (CODE_RUNTIMES.has(e.runtime) && priv.length === 0) anomalies.push('no-private-test');
  if (pub.length === 0) anomalies.push('no-public-test');
  if (tests.length === 0) anomalies.push('no-test');
  for (const s of fine) if (!projectSkill(s)) anomalies.push(`unprojectable-skill:${s}`);
  if (!e.reference || Object.keys(e.reference).length === 0) anomalies.push('no-reference');
  // Signaux à revoir : pas des défauts en soi (souvent déterministes), mais fragilité
  // latente. `float-expected` = call-equals sur un flottant : toléré s'il est exactement
  // représentable (0.25, 0.5, 0.75, π) ou arrondi par la référence ; à éviter pour tout
  // NOUVEL exercice (contrat V44 : sorties entières/chaînes).
  const reviewFlags = [];
  for (const t of tests) if (t.kind === 'call-equals' && isFloat(t.expected)) reviewFlags.push(`float-expected:${t.id}`);

  const practiceType = isDebug ? 'debug'
    : e.runtime === 'react-tsx' ? 'component'
      : e.runtime === 'web' ? 'web-dom'
        : 'function';

  const evidenceGenerable = tests.length > 0 && !!e.reference && Object.keys(e.reference || {}).length > 0;

  const dupSig = `${[...programSkills].sort().join('+')}|d${e.difficulty || 2}|${(pub[0] && pub[0].export) || practiceType}`;
  if (!dupBuckets.has(dupSig)) dupBuckets.set(dupSig, []);
  dupBuckets.get(dupSig).push(e.id);

  ledger.push({
    id: e.id,
    runtime: e.runtime,
    difficulty: e.difficulty || 2,
    skills: fine,
    programSkills,
    tests: { total: tests.length, public: pub.length, private: priv.length, kinds },
    practiceType,
    diagnostic: isDebug || misc.length > 0,
    transfer: hasTransfer,
    misconception: misc,
    evidenceGenerable,
    ladderPosition: exerciseLadderPosition(e),
    dupSignature: dupSig,
    anomalies,
    reviewFlags,
  });
}

// Duplication potentielle : mêmes (programSkills, difficulté, export). Informatif.
const dupGroups = [...dupBuckets.entries()].filter(([, ids]) => ids.length > 1)
  .map(([sig, ids]) => ({ signature: sig, ids }));
for (const row of ledger) {
  if (dupGroups.some((g) => g.signature === row.dupSignature)) row.potentialDuplicate = true;
}

const out = {
  generatedAt: 'V44-CP3',
  total: ledger.length,
  distributions: {
    runtime: count(ledger.map((r) => r.runtime)),
    difficulty: count(ledger.map((r) => String(r.difficulty))),
    ladderPosition: count(ledger.map((r) => r.ladderPosition)),
    practiceType: count(ledger.map((r) => r.practiceType)),
  },
  coverage: {
    withDiagnostic: ledger.filter((r) => r.diagnostic).length,
    withMisconception: ledger.filter((r) => r.misconception.length).length,
    withTransfer: ledger.filter((r) => r.transfer).length,
    evidenceGenerable: ledger.filter((r) => r.evidenceGenerable).length,
  },
  anomalies: {
    total: ledger.filter((r) => r.anomalies.length).length,
    byType: count(ledger.flatMap((r) => r.anomalies.map((a) => a.split(':')[0]))),
    exercises: ledger.filter((r) => r.anomalies.length).map((r) => ({ id: r.id, anomalies: r.anomalies })),
  },
  reviewFlags: {
    total: ledger.filter((r) => r.reviewFlags.length).length,
    byType: count(ledger.flatMap((r) => r.reviewFlags.map((a) => a.split(':')[0]))),
    exercises: ledger.filter((r) => r.reviewFlags.length).map((r) => ({ id: r.id, reviewFlags: r.reviewFlags })),
  },
  potentialDuplicates: dupGroups.filter((g) => g.ids.length >= 3),
  ledger,
};

function count(arr) {
  const m = {};
  for (const v of arr) m[v] = (m[v] || 0) + 1;
  return m;
}

writeFileSync(R('docs/practice-ledger-v44.json'), JSON.stringify(out, null, 2) + '\n');

console.log('── Ledger structurel V44 (CP3) — 100 % du catalogue');
console.log(`Exercices audités       : ${out.total}`);
console.log(`Difficulté              : ${JSON.stringify(out.distributions.difficulty)}`);
console.log(`Position ladder (max)   : ${JSON.stringify(out.distributions.ladderPosition)}`);
console.log(`Avec diagnostic         : ${out.coverage.withDiagnostic}`);
console.log(`Reliés à misconception  : ${out.coverage.withMisconception}`);
console.log(`Preuve générable        : ${out.coverage.evidenceGenerable}/${out.total}`);
console.log(`Anomalies dures         : ${out.anomalies.total} exercice(s) — ${JSON.stringify(out.anomalies.byType)}`);
console.log(`À revoir (non bloquant) : ${out.reviewFlags.total} exercice(s) — ${JSON.stringify(out.reviewFlags.byType)}`);
console.log(`Écrit                   : docs/practice-ledger-v44.json`);
