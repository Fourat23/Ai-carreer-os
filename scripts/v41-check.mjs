#!/usr/bin/env node
// Gate V41 — lance : npm run v41:check
//
// Valide que la Learning Experience reste un READ-MODEL dérivé, explicable et sans
// gamification arbitraire (cf. TSD-041). Contrôles bloquants :
//   1. AUCUNE source de vérité concurrente sur disque (xp/achievements/gamification/
//      progression-v2/mastery-engine-v2) ;
//   2. AUCUN marqueur d'XP/monnaie/niveau/streak arbitraire dans le read-model ;
//   3. chaque next-best-action porte une RAISON et une PREUVE ATTENDUE ;
//   4. explainSkillState ne renvoie que des états ∈ SKILL_STATES ;
//   5. chaque milestone « achieved » porte un « why » ;
//   6. aucune sortie ne contient de champ xp/points/level/streak.
// Lecture seule ; exit 1 au moindre problème. Déterministe (données stub internes).

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  explainSkillState, nextBestActions, milestones, experienceSummary, evidenceTimeline,
} from '../lib/learning-experience.mjs';
import { SKILL_STATES } from '../lib/skill-state.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];

console.log('── Gate V41 (Learning Experience — read-model dérivé, sans XP arbitraire)');

// 1. Sources concurrentes interdites.
const FORBIDDEN_FILES = [
  'data/xp.json', 'data/achievements.json', 'data/gamification.json', 'data/gamification-state.json',
  'data/skill-map-state.json', 'lib/progression-v2.mjs', 'lib/mastery-engine-v2.mjs', 'lib/gamification.mjs',
];
for (const f of FORBIDDEN_FILES) {
  if (existsSync(R(f))) errors.push(`source concurrente interdite présente : ${f}`);
}

// 2. Marqueurs d'XP/gamification arbitraire dans le read-model (hors documentation négative).
//    On autorise les mentions dans les commentaires qui INTERDISENT ces mécaniques.
const lePath = R('lib/learning-experience.mjs');
if (existsSync(lePath)) {
  const src = readFileSync(lePath, 'utf8');
  const lines = src.split('\n');
  const BAD = /\b(xp\b|points gagnés|niveau\s+\d+|streak|coins|leaderboard|classement)\b/i;
  const NEGATION = /(aucun|sans|pas d|jamais|interdit|no\b|anti-)/i;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (BAD.test(l) && !NEGATION.test(l)) errors.push(`marqueur d'XP/gamification arbitraire (learning-experience.mjs:${i + 1}) : ${l.trim().slice(0, 80)}`);
  }
}

// 3-6. Vérifications comportementales sur données stub déterministes.
const program = {
  skills: [
    { id: 'http', name: 'HTTP / API' }, { id: 'sql', name: 'SQL / Data' },
    { id: 'archi', name: 'Architecture' }, { id: 'jsts', name: 'JavaScript / TypeScript' },
  ],
  days: [
    { day: 1, skill: 'http' }, { day: 2, skill: 'http' }, { day: 3, skill: 'http' },
    { day: 4, skill: 'sql' }, { day: 5, skill: 'archi' }, { day: 6, skill: 'jsts' },
  ],
};
const progress = {
  days: {
    1: { status: 'done' }, 2: { status: 'done' }, 3: { status: 'done' },
    4: { status: 'in-progress', evidence: [{ type: 'assessment', title: 'Diag SQL', skills: ['sql'], createdAt: '2026-08-05T00:00:00.000Z' }] },
    5: { status: 'to-review' }, 6: { status: 'in-progress' },
  },
};

const actions = nextBestActions(program, progress, { now: new Date('2026-08-10T00:00:00Z') });
if (actions.length === 0) errors.push('nextBestActions ne produit aucune action sur les données stub');
for (const a of actions) {
  if (!a.reason || !a.reason.trim()) errors.push(`next-action sans raison : « ${a.action} »`);
  if (!a.expectedEvidence || !a.expectedEvidence.trim()) errors.push(`next-action sans preuve attendue : « ${a.action} »`);
  if (!a.href || !a.href.startsWith('/')) errors.push(`next-action sans lien actionnable : « ${a.action} »`);
}

for (const st of ['not-started', 'discovered', 'practiced', 'demonstrated', 'to-consolidate']) {
  const ex = explainSkillState({ id: 'x', name: 'X', state: st, daysDone: 3, evidenceCount: st === 'demonstrated' ? 1 : 0 });
  if (!SKILL_STATES.includes(ex.state)) errors.push(`explainSkillState renvoie un état hors SKILL_STATES : ${ex.state}`);
}

for (const m of milestones(program, progress)) {
  if (m.achieved && (!m.why || !m.why.trim())) errors.push(`milestone atteint sans « why » : ${m.id}`);
}

// 6. Aucune fuite de champ interdit dans les sorties.
const blob = JSON.stringify({
  a: actions, m: milestones(program, progress), s: experienceSummary(program, progress),
  t: evidenceTimeline(progress, program),
}).toLowerCase();
for (const forbidden of ['"xp"', '"points"', '"level"', '"streak"', '"coins"']) {
  if (blob.includes(forbidden)) errors.push(`champ interdit présent dans une sortie : ${forbidden}`);
}

console.log(`Next-actions (stub) : ${actions.length}`);
console.log(`Milestones (stub)   : ${milestones(program, progress).filter((m) => m.achieved).length} atteint(s) / ${milestones(program, progress).length}`);

if (errors.length) {
  console.error(`\n❌ ${errors.length} problème(s) :`);
  for (const e of errors) console.error(`   • ${e}`);
  process.exit(1);
}
console.log('\n✅ V41 valide : read-model dérivé, actions explicables (raison + preuve), états SKILL_STATES, aucun XP/source concurrente.');
