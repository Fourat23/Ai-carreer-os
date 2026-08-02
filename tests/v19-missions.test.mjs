// CP6 (V19) — intégrité des 4 missions systèmes/réseau (moteur V18 inchangé).
// Validées contre le contexte RÉEL ; livrables auto reliés à de vrais exercices ;
// vue publique sans fuite de seuils cachés (docSpec/exerciseRef/requireMentions).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateMission, publicMissionView } from '../lib/mission.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';
import { DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID, SYSTEMS_CLOUD_TRACK_ID } from '../lib/catalogue.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const exerciseIds = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
const ctx = {
  validDays: new Set(program.days.map((d) => d.day)),
  trackIds: new Set([DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID, SYSTEMS_CLOUD_TRACK_ID]),
  skillIds: { has: (s) => isKnownSkill(s) },
  exerciseIds,
};

const V19_MISSIONS = ['port-occupe-service-indisponible', 'permissions-secret-expose', 'incident-dns-tls-http', 'saturation-ressources'];

test('V19 : les 4 missions existent et sont valides contre les données réelles', () => {
  assert.equal(V19_MISSIONS.length, 4);
  for (const id of V19_MISSIONS) {
    const m = JSON.parse(readFileSync(R(`data/missions/${id}.json`), 'utf8'));
    const v = validateMission(m, ctx);
    assert.ok(v.ok, `${id} invalide : ${v.errors.join(' ; ')}`);
    assert.equal(m.status, 'published');
  }
});

test('V19 : chaque mission a un livrable auto relié à un exercice réel + une revue humaine', () => {
  for (const id of V19_MISSIONS) {
    const m = JSON.parse(readFileSync(R(`data/missions/${id}.json`), 'utf8'));
    const auto = m.deliverables.filter((d) => d.validation === 'auto');
    assert.ok(auto.length >= 1, `${id} : au moins un livrable auto`);
    for (const d of auto) assert.ok(exerciseIds.has(d.exerciseRef), `${id} : exerciseRef réel « ${d.exerciseRef} »`);
    assert.ok(m.deliverables.some((d) => d.validation === 'review'), `${id} : revue humaine honnête présente`);
    assert.ok(m.deliverables.some((d) => d.required), `${id} : au moins un livrable requis`);
    // Documents évalués STRUCTURELLEMENT (jamais de pseudo-score de qualité).
    for (const d of m.deliverables.filter((x) => x.kind === 'document')) {
      assert.equal(d.validation, 'structural', `${id} : document en validation structurelle`);
      assert.ok((d.docSpec?.requiredSections ?? []).length > 0, `${id} : docSpec avec sections`);
    }
  }
});

test('V19 : vue publique sans fuite de seuils cachés', () => {
  for (const id of V19_MISSIONS) {
    const m = JSON.parse(readFileSync(R(`data/missions/${id}.json`), 'utf8'));
    const pub = JSON.stringify(publicMissionView(m));
    assert.ok(!/requireMentions|minLength|maxLength|exerciseRef"/.test(pub), `${id} : aucun seuil caché exposé`);
  }
});
