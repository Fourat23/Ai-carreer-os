#!/usr/bin/env node
// Gate des missions d'ingénierie V18 — lance : npm run v18:check
//
// Charge data/missions/*.json et valide le catalogue contre les données réelles
// (program.json, catalogue de parcours, exercices, taxonomie de compétences).
// Vérifie aussi l'anti-fuite : aucun exerciseRef interne ni docSpec ne doit
// apparaître dans la vue publique indexable. Lecture seule ; exit 1 au moindre
// problème.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateMissionCatalogue, publicMissionView } from '../lib/mission.mjs';
import { buildCatalogue } from '../lib/catalogue.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];

const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const validDays = new Set(program.days.map((d) => d.day));
// Invariant DÉRIVÉ des sources (jamais codé en dur) : tout parcours réel du
// catalogue est accepté — la gate reste valide quand un parcours est ajouté.
const trackIds = new Set(buildCatalogue(program).tracks.map((t) => t.id));
const exerciseIds = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
const skillIds = { has: (s) => isKnownSkill(s) };

const missionDir = R('data/missions');
const files = existsSync(missionDir) ? readdirSync(missionDir).filter((f) => f.endsWith('.json')) : [];
const missions = files.map((f) => JSON.parse(readFileSync(join(missionDir, f), 'utf8')));

const { errors: catErrors } = validateMissionCatalogue(missions, { validDays, trackIds, skillIds, exerciseIds });
errors.push(...catErrors);

// Anti-fuite : la vue publique ne doit jamais contenir de champ interne.
for (const m of missions) {
  const blob = JSON.stringify(publicMissionView(m));
  for (const forbidden of ['"docSpec"', '"exerciseRef"', 'requireMentions', 'minLength']) {
    if (blob.includes(forbidden)) errors.push(`${m.id} : la vue publique expose « ${forbidden} »`);
  }
}

console.log('── Gate des missions V18 ──');
console.log(`Missions            : ${missions.length}`);
for (const m of missions) console.log(`  • ${m.id} [${m.category}] jours ${JSON.stringify(m.dayRefs)} — ${(m.deliverables ?? []).length} livrables`);

if (errors.length) {
  console.error(`\n❌ ${errors.length} problème(s) :`);
  for (const e of errors) console.error(`   • ${e}`);
  process.exit(1);
}
console.log('\n✅ Missions V18 valides : catalogue cohérent, aucune fuite dans la vue publique.');
