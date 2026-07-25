// Tests du catalogue de parcours & modules (lib/catalogue.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DEFAULT_TRACK_ID, buildCatalogue, validateCatalogue, getTrack, getTrackModules,
  isTrackAvailable, TECHNOLOGIES,
} from '../lib/catalogue.mjs';

const program = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));

test('buildCatalogue : parcours fondations disponible + parcours annoncés', () => {
  const cat = buildCatalogue(program);
  const found = getTrack(cat, DEFAULT_TRACK_ID);
  assert.ok(found);
  assert.equal(found.status, 'available');
  assert.equal(found.totalDays, program.days.length); // 365
  assert.ok(cat.tracks.some((t) => t.status === 'announced'));
  assert.ok(isTrackAvailable(found));
  assert.equal(isTrackAvailable(getTrack(cat, 'backend-engineer-v1')), false);
});

test('modules dérivés des mois, référencés (pas copiés)', () => {
  const cat = buildCatalogue(program);
  const found = getTrack(cat, DEFAULT_TRACK_ID);
  const mods = getTrackModules(cat, found);
  assert.equal(mods.length, program.months.length); // 12
  // couverture exhaustive et sans doublon des 365 jours
  const allRefs = mods.flatMap((m) => m.dayRefs);
  assert.equal(allRefs.length, program.days.length);
  assert.equal(new Set(allRefs).size, program.days.length);
});

test('ids uniques (parcours et modules)', () => {
  const cat = buildCatalogue(program);
  const tids = cat.tracks.map((t) => t.id);
  assert.equal(new Set(tids).size, tids.length);
  const mids = Object.keys(cat.modules);
  assert.equal(new Set(mids).size, mids.length);
});

test('référence de module cassée → erreur explicite', () => {
  const cat = buildCatalogue(program);
  cat.tracks[0].moduleRefs.push('mod-inexistant');
  assert.throws(() => validateCatalogue(cat), /cassée.*mod-inexistant/);
});

test('jour inexistant dans un module → erreur explicite', () => {
  const cat = buildCatalogue(program);
  cat.modules['mod-m1'].dayRefs.push(99999);
  assert.throws(() => validateCatalogue(cat, new Set(program.days.map((d) => d.day))), /jour inexistant 99999/);
});

test('ordre déterministe (modules par mois croissant)', () => {
  const a = buildCatalogue(program);
  const b = buildCatalogue(program);
  assert.deepEqual(getTrackModules(a, getTrack(a, DEFAULT_TRACK_ID)).map((m) => m.id),
                   getTrackModules(b, getTrack(b, DEFAULT_TRACK_ID)).map((m) => m.id));
  assert.deepEqual(getTrackModules(a, getTrack(a, DEFAULT_TRACK_ID)).map((m) => m.id),
                   program.months.slice().sort((x, y) => x.month - y.month).map((m) => `mod-m${m.month}`));
});

test('taxonomie : ids uniques, couvre les technologies clés', () => {
  const ids = TECHNOLOGIES.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const key of ['git', 'javascript', 'typescript', 'react', 'sql', 'rag', 'llm', 'docker']) {
    assert.ok(ids.includes(key), `taxonomie manque ${key}`);
  }
});
