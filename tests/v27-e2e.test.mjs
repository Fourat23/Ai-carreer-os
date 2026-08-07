// CP9 (V27) — E2E déterministe du dispositif Cloud/DevOps durci : graphe leçon →
// pratique (practiceRefs résolus), cohérence du parcours cloud-devops-engineer-v1,
// enrôlement + progression + preuve d'exercice + isolation entre parcours +
// export/import. Fonctions PURES, sans serveur, sans appel cloud.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  buildCatalogue, resolveTrackDays, getTrack, getTrackModules, isTrackAvailable,
  CLOUD_DEVOPS_TRACK_ID, DEFAULT_TRACK_ID,
} from '../lib/catalogue.mjs';
import {
  migrateToV7, enrollTrack, setActiveTrack, writeActiveTrack, activeTrackProgress,
} from '../lib/progress-store.mjs';
import { recordExerciseSuccess } from '../lib/lab-progress.mjs';
import { serializeBackupV3, parseBackupV3 } from '../lib/backup.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const cat = buildCatalogue(program);
const plan = JSON.parse(readFileSync(R('docs/architecture/v27-lessons-plan.json'), 'utf8'));
const KNOWN_LABS = new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']);

test('E2E-1 : tous les practiceRefs des leçons résolvent vers un artefact existant', () => {
  let count = 0;
  for (const l of program.lessons) {
    for (const r of (l.practiceRefs ?? [])) {
      count++;
      if (r.kind === 'exercise') assert.ok(existsSync(R(`data/exercises/${r.id}.json`)), `${l.slug} → exercice ${r.id}`);
      else if (r.kind === 'mission') assert.ok(existsSync(R(`data/missions/${r.id}.json`)), `${l.slug} → mission ${r.id}`);
      else if (r.kind === 'playbook') assert.ok(existsSync(R(`data/playbooks/${r.id}.json`)), `${l.slug} → playbook ${r.id}`);
      else if (r.kind === 'lab') assert.ok(KNOWN_LABS.has(r.id), `${l.slug} → lab ${r.id}`);
      else assert.fail(`${l.slug} : kind inconnu ${r.kind}`);
    }
  }
  assert.ok(count >= 100, `graphe pratique substantiel (${count} liens)`);
});

test('E2E-2 : chaque leçon critique V27 possède au moins un practiceRef', () => {
  const bySlug = new Map(program.lessons.map((l) => [l.slug, l]));
  for (const slug of plan.critical) {
    const l = bySlug.get(slug);
    assert.ok(l, `leçon critique présente : ${slug}`);
    assert.ok((l.practiceRefs ?? []).length > 0, `leçon critique reliée à la pratique : ${slug}`);
  }
});

test('E2E-3 : toutes les leçons Cloud/DevOps V26 sont reliées à la pratique', () => {
  const v26cats = new Set(['Systèmes & Linux', 'Réseau', 'Conteneurs & Docker', 'CI/CD & livraison', 'Kubernetes', 'Cloud, AWS, Azure & IaC']);
  const v26 = program.lessons.filter((l) => v26cats.has(l.cat));
  assert.equal(v26.length, 32, '32 leçons Cloud/DevOps');
  for (const l of v26) assert.ok((l.practiceRefs ?? []).length > 0, `reliée : ${l.slug}`);
});

test('E2E-4 : parcours cloud-devops-engineer-v1 cohérent et data-driven', () => {
  const t = getTrack(cat, CLOUD_DEVOPS_TRACK_ID);
  assert.ok(t && isTrackAvailable(t));
  const days = resolveTrackDays(cat, t);
  assert.equal(t.totalDays, days.length, 'durée dérivée');
  assert.equal(new Set(days).size, days.length, 'aucun jour dupliqué');
  const mods = getTrackModules(cat, t);
  assert.ok(mods.length >= 7, 'progression en modules');
  for (const m of mods) assert.ok((m.dayRefs ?? []).length > 0, `module non vide : ${m.id}`);
});

test('E2E-5 : enrôlement, progression, preuve d\'exercice et isolation entre parcours', () => {
  const days = resolveTrackDays(cat, CLOUD_DEVOPS_TRACK_ID);
  const d = days[0];
  let v3 = migrateToV7({ startDate: '2026-01-01', days: { '1': { status: 'done' } }, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  v3 = enrollTrack(v3, CLOUD_DEVOPS_TRACK_ID, '1');
  v3 = setActiveTrack(v3, CLOUD_DEVOPS_TRACK_ID);
  let flat = activeTrackProgress(v3);
  flat.days = { ...(flat.days ?? {}), [String(d)]: { status: 'done' } };
  flat = recordExerciseSuccess(flat, { exerciseId: 'iac-plan-destructive', title: 'IaC plan', skills: ['functions'], dayRefs: [d], at: '2026-04-10' });
  v3 = writeActiveTrack(v3, flat);
  assert.equal(v3.tracks[CLOUD_DEVOPS_TRACK_ID].days[String(d)].status, 'done');
  // preuve d'exercice stockée comme evidence du jour
  const ev = v3.tracks[CLOUD_DEVOPS_TRACK_ID].days[String(d)].evidence ?? [];
  assert.ok(ev.some((e) => e.id === 'lab-iac-plan-destructive'), 'preuve d\'exercice enregistrée');
  // isolation : Foundations intact
  assert.equal(v3.tracks[DEFAULT_TRACK_ID].days['1'].status, 'done');
});

test('E2E-6 : export → import round-trip du parcours Cloud/DevOps', () => {
  let v3 = migrateToV7({ startDate: '2026-01-01', days: { '1': { status: 'done' } }, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  v3 = enrollTrack(v3, CLOUD_DEVOPS_TRACK_ID, '1');
  v3 = setActiveTrack(v3, CLOUD_DEVOPS_TRACK_ID);
  let flat = activeTrackProgress(v3);
  const d = resolveTrackDays(cat, CLOUD_DEVOPS_TRACK_ID)[0];
  flat.days = { [String(d)]: { status: 'done', answer: 'ok' } };
  v3 = writeActiveTrack(v3, flat);
  const exported = JSON.stringify(serializeBackupV3(v3, {}));
  const parsed = parseBackupV3(exported);
  assert.ok(parsed.ok, 'import valide');
  assert.equal(parsed.v3.tracks[CLOUD_DEVOPS_TRACK_ID].days[String(d)].answer, 'ok', 'progression restaurée');
  assert.ok(!/AKIA|"reference"|docSpec/.test(exported), 'aucune donnée interne dans la sauvegarde');
});
