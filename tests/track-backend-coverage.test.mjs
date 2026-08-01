// CP3 (V15) — couverture pédagogique RÉELLE du parcours Backend Engineer.
// Verrouille la matrice de couverture (jours, exercices atteignables, projets)
// et l'honnêteté du parcours : non contigu, borné à j86, aucune journée ne le
// « termine » artificiellement, lacunes conceptuelles assumées (pas de faux
// contenu). S'appuie sur les données réelles (program.json + day-exercises.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCatalogue, getTrack, getTrackModules, resolveTrackDays, resolveTrackDayObjects, BACKEND_TRACK_ID } from '../lib/catalogue.mjs';

const program = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));
const links = JSON.parse(readFileSync(new URL('../data/day-exercises.json', import.meta.url), 'utf8'));
const cat = buildCatalogue(program);
const be = getTrack(cat, BACKEND_TRACK_ID);

test('couverture : 85 jours, borné j1-j86, non contigu (j82 exclu, pas de React)', () => {
  const days = resolveTrackDays(cat, be);
  assert.equal(days.length, 85);
  assert.equal(Math.min(...days), 1);
  assert.equal(Math.max(...days), 86);      // borné à la consolidation serveur
  assert.equal(days.includes(82), false);   // Python/data exclu
  assert.equal(days.some((d) => d >= 87), false); // aucun jour frontend/IA
});

test('couverture : exercices réellement atteignables (>= 25)', () => {
  const days = resolveTrackDays(cat, be);
  const reachable = days.reduce((n, d) => n + (links[String(d)]?.length ?? 0), 0);
  assert.ok(reachable >= 25, `exercices atteignables = ${reachable}`);
});

test('couverture : journées projet présentes (Projet 1/2)', () => {
  const dayObjs = resolveTrackDayObjects(cat, be, program);
  const projectDays = dayObjs.filter((d) => /Projet/i.test(d.title));
  assert.ok(projectDays.length >= 6, `journées projet = ${projectDays.length}`);
});

test('honnêteté : la dernière journée ne « termine » pas le parcours', () => {
  // completion exige TOUTES les journées, pas seulement le plus grand numéro.
  assert.equal(be.completion.minDaysDone, be.totalDays);
  assert.equal(be.completion.minDaysDone, 85);
  // j86 (max) est une journée de consolidation, pas un marqueur de fin artificiel.
  const last = program.days.find((d) => d.day === 86);
  assert.match(last.title, /LivreAPI|durcissement|performance/i);
});

test('honnêteté : Docker/cloud non revendiqués dans les technologies', () => {
  for (const t of ['docker', 'cloud', 'kubernetes']) assert.equal(be.technologies.includes(t), false);
  // les modules sécurité/architecture existent mais restent conceptuels (peu/pas
  // d'exercices) — on vérifie qu'ils sont bien présents et non vides.
  const mods = getTrackModules(cat, be);
  assert.ok(mods.find((m) => /Sécurité/i.test(m.title)).dayRefs.length > 0);
  assert.ok(mods.find((m) => /Architecture/i.test(m.title)).dayRefs.length > 0);
});
