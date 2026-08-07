// CP9 (V26) — E2E déterministe de l'expansion pédagogique Cloud/DevOps, avec les
// VRAIES données et le moteur RÉEL (fonctions pures, sans serveur, sans appel
// cloud) : corpus des Leçons de fond V26 (fichiers ↔ LESSONS ↔ program.json) →
// parcours cloud-devops-engineer-v1 piloté par données (durée dérivée) →
// enrôlement + isolation entre parcours → liens internes de leçons valides.
// Aucune credential, aucune donnée privée exposée.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  buildCatalogue, resolveTrackDays, getTrack, isTrackAvailable,
  CLOUD_DEVOPS_TRACK_ID, DEFAULT_TRACK_ID,
} from '../lib/catalogue.mjs';
import {
  migrateToV7, enrollTrack, setActiveTrack, writeActiveTrack, activeTrackProgress,
} from '../lib/progress-store.mjs';
import { LESSONS } from '../scripts/data/lessons-map.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const cat = buildCatalogue(program);
const plan = JSON.parse(readFileSync(R('docs/architecture/v26-lessons-plan.json'), 'utf8'));
const newSlugs = (plan.newLessons ?? []).map((l) => l.slug);

test('E2E-1 : le corpus V26 est réel (fichier ↔ LESSONS ↔ program.json)', () => {
  assert.ok(newSlugs.length >= 25, `au moins 25 leçons V26 déclarées (${newSlugs.length})`);
  const bySlug = new Map(LESSONS.map((l) => [l.file.replace(/\.md$/, ''), l]));
  const progLessons = new Set((program.lessons ?? []).map((l) => (l.file ?? '').replace(/\.md$/, '') || l.slug));
  for (const slug of newSlugs) {
    assert.ok(existsSync(R(`curriculum/lessons/${slug}.md`)), `fichier présent : ${slug}`);
    assert.ok(bySlug.has(slug), `entrée LESSONS : ${slug}`);
    assert.ok(progLessons.has(slug), `injecté dans program.json : ${slug}`);
  }
});

test('E2E-2 : parcours cloud-devops-engineer-v1 disponible, data-driven, durée dérivée', () => {
  const t = getTrack(cat, CLOUD_DEVOPS_TRACK_ID);
  assert.ok(t, 'le parcours existe');
  assert.equal(t.status, 'available');
  assert.ok(isTrackAvailable(t));
  const days = resolveTrackDays(cat, t);
  // Durée DÉRIVÉE (pas de nombre magique) : totalDays = jours résolus, dédupliqués.
  assert.equal(t.totalDays, days.length, 'totalDays = durée dérivée');
  assert.equal(new Set(days).size, days.length, 'aucune journée dupliquée dans le parcours');
  // Toutes les journées référencées existent réellement.
  const valid = new Set(program.days.map((d) => d.day));
  for (const d of days) assert.ok(valid.has(d), `journée existante : ${d}`);
  assert.ok(days.length > 0, 'parcours non vide');
});

test('E2E-3 : compte de parcours entièrement data-driven (aucun nombre magique)', () => {
  const available = cat.tracks.filter(isTrackAvailable).map((t) => t.id);
  assert.ok(available.includes(CLOUD_DEVOPS_TRACK_ID), 'le nouveau parcours est disponible');
  assert.equal(new Set(available).size, available.length, 'aucun parcours disponible dupliqué');
  // Le placeholder annoncé « cloud-devops-v1 » a été promu et retiré.
  assert.ok(!cat.tracks.some((t) => t.id === 'cloud-devops-v1'), 'placeholder annoncé retiré');
});

test('E2E-4 : enrôlement du parcours Cloud/DevOps isolé des autres parcours', () => {
  const firstDay = resolveTrackDays(cat, CLOUD_DEVOPS_TRACK_ID)[0];
  let v3 = migrateToV7({ startDate: '2026-01-01', days: { '1': { status: 'done' } }, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  v3 = enrollTrack(v3, CLOUD_DEVOPS_TRACK_ID, '1');
  v3 = setActiveTrack(v3, CLOUD_DEVOPS_TRACK_ID);
  let flat = activeTrackProgress(v3);
  flat.days = { ...(flat.days ?? {}), [String(firstDay)]: { status: 'done' } };
  v3 = writeActiveTrack(v3, flat);
  assert.equal(v3.tracks[CLOUD_DEVOPS_TRACK_ID].days[String(firstDay)].status, 'done');
  // Aucune fuite vers Foundations (autre que sa propre progression initiale).
  assert.equal(v3.tracks[DEFAULT_TRACK_ID].days['1'].status, 'done', 'Foundations intact');
});

test('E2E-5 : liens internes des leçons V26 tous résolus (aucun lien mort)', () => {
  for (const slug of newSlugs) {
    const md = readFileSync(R(`curriculum/lessons/${slug}.md`), 'utf8');
    for (const m of md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)) {
      assert.ok(existsSync(R(`curriculum/lessons/${m[1]}.md`)), `${slug} → leçon existante ${m[1]}`);
    }
    const validDays = new Set(program.days.map((d) => d.day));
    for (const m of md.matchAll(/\/day\/(\d{1,3})/g)) {
      assert.ok(validDays.has(Number(m[1])), `${slug} → jour existant ${m[1]}`);
    }
  }
});
