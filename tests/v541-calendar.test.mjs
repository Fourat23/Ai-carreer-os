// V54.1 — Tests structurels du calendrier (P0). Empêche toute régression :
// disparition silencieuse de jours, doublons, inversion chronologique, semaine
// incohérente, mois mal groupés. Fondé sur le modèle pur buildCalendar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCalendar } from '../lib/calendar-model.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const program = JSON.parse(readFileSync(join(ROOT, 'data/program.json'), 'utf8'));

test('calendrier — programme complet 365/365, aucun jour perdu ni doublon', () => {
  const cal = buildCalendar(program.days);
  assert.equal(cal.expected, 365);
  assert.equal(cal.rendered, 365, 'tous les jours doivent être rendus');
  assert.deepEqual(cal.missing, [], 'aucun jour manquant');
  assert.deepEqual(cal.duplicates, [], 'aucun doublon');
});

test('calendrier — ordre chronologique strict (jours, semaines, mois)', () => {
  const cal = buildCalendar(program.days);
  assert.equal(cal.ordered, true, 'jours strictement croissants');
  assert.equal(cal.monthOrderOk, true, 'mois strictement croissants');
  assert.equal(cal.weekOrderOk, true, 'semaines strictement croissantes dans chaque mois');
  assert.equal(cal.weekSpanOk, true, 'une semaine appartient à un seul mois');
  assert.equal(cal.ok, true);
});

test('calendrier — 12 mois, chaque semaine a des jours', () => {
  const cal = buildCalendar(program.days);
  assert.equal(cal.months.length, 12);
  for (const m of cal.months) {
    assert.ok(m.weeks.length > 0, `mois ${m.month} a des semaines`);
    for (const w of m.weeks) assert.ok(w.days.length > 0, `semaine ${w.week} a des jours`);
  }
});

test('calendrier — un sous-ensemble contigu reste cohérent (mois 1 = 28 jours)', () => {
  const subset = program.days.filter((d) => d.month === 1);
  const cal = buildCalendar(subset);
  assert.equal(cal.rendered, subset.length);
  assert.deepEqual(cal.duplicates, []);
  assert.equal(cal.ordered, true);
  assert.equal(cal.ok, true);
});

test('calendrier — détecte un jour manquant (garde anti-régression)', () => {
  const holed = program.days.filter((d) => d.day !== 3); // trou artificiel
  const cal = buildCalendar(holed);
  assert.ok(cal.missing.includes(3), 'le trou doit être détecté');
  assert.equal(cal.ok, false);
});

test('calendrier — détecte un doublon', () => {
  const dup = [...program.days.slice(0, 10), program.days[5]];
  const cal = buildCalendar(dup);
  assert.ok(cal.duplicates.includes(program.days[5].day));
  assert.equal(cal.ok, false);
});
