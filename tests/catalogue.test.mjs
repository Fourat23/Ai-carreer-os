// Tests du catalogue de parcours & modules (lib/catalogue.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DEFAULT_TRACK_ID, buildCatalogue, validateCatalogue, getTrack, getTrackModules,
  isTrackAvailable, TECHNOLOGIES,
} from '../lib/catalogue.mjs';
// FULLSTACK_TRACK_ID / BACKEND_TRACK_ID sont importés plus bas (l.147/162) ; on
// n'ajoute ici que les ids de parcours pas encore importés ailleurs dans ce fichier.
import { SYSTEMS_CLOUD_TRACK_ID, APPSEC_CLOUD_TRACK_ID } from '../lib/catalogue.mjs';

const program = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));

test('buildCatalogue : parcours fondations disponible + parcours annoncés', () => {
  const cat = buildCatalogue(program);
  const found = getTrack(cat, DEFAULT_TRACK_ID);
  assert.ok(found);
  assert.equal(found.status, 'available');
  assert.equal(found.totalDays, program.days.length); // 365
  assert.ok(cat.tracks.some((t) => t.status === 'announced'));
  assert.ok(isTrackAvailable(found));
  // un parcours encore annoncé reste non activable (backend est désormais disponible).
  assert.equal(isTrackAvailable(getTrack(cat, 'frontend-engineer-v1')), false);
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

test('parcours : chaque technologie référencée résout dans la taxonomie', () => {
  const cat = buildCatalogue(program);
  const known = new Set(cat.technologies.map((t) => t.id));
  for (const t of cat.tracks) {
    for (const id of t.technologies ?? []) {
      assert.ok(known.has(id), `parcours ${t.id} référence une techno inconnue « ${id} »`);
    }
  }
});

// ── CP2 (V14) : resolveTrackDays + validation renforcée des parcours ─────────
import { resolveTrackDays } from '../lib/catalogue.mjs';

const mkCat = (over = {}) => ({
  technologies: [{ id: 'node', name: 'Node', area: 'backend' }, { id: 'react', name: 'React', area: 'frontend' }],
  modules: {
    'm-a': { id: 'm-a', title: 'A', summary: '', dayRefs: [1, 2, 3], skills: [], projectRef: null },
    'm-b': { id: 'm-b', title: 'B', summary: '', dayRefs: [4, 5], skills: [], projectRef: null },
  },
  tracks: [{ id: 't1', version: '1', status: 'available', title: 'T', goal: 'g', moduleRefs: ['m-a', 'm-b'], technologies: ['node'], totalDays: 5 }],
  ...over,
});

test('resolveTrackDays : concatène les dayRefs des modules, ordonné et dédupliqué', () => {
  const cat = mkCat();
  assert.deepEqual(resolveTrackDays(cat, 't1'), [1, 2, 3, 4, 5]);
  assert.deepEqual(resolveTrackDays(cat, 'inconnu'), []);
});

test('validation : parcours disponible sans module → erreur', () => {
  const cat = mkCat({ tracks: [{ id: 't1', version: '1', status: 'available', title: 'T', goal: 'g', moduleRefs: [], technologies: [], totalDays: 0 }] });
  assert.throws(() => validateCatalogue(cat), /sans module/);
});

test('validation : totalDays incohérent → erreur', () => {
  const cat = mkCat({ tracks: [{ id: 't1', version: '1', status: 'available', title: 'T', goal: 'g', moduleRefs: ['m-a', 'm-b'], technologies: ['node'], totalDays: 99 }] });
  assert.throws(() => validateCatalogue(cat), /totalDays incohérent/);
});

test('validation : jour dupliqué entre deux modules d’un parcours → erreur', () => {
  const cat = mkCat({
    modules: {
      'm-a': { id: 'm-a', title: 'A', summary: '', dayRefs: [1, 2], skills: [], projectRef: null },
      'm-b': { id: 'm-b', title: 'B', summary: '', dayRefs: [2, 3], skills: [], projectRef: null },
    },
    tracks: [{ id: 't1', version: '1', status: 'available', title: 'T', goal: 'g', moduleRefs: ['m-a', 'm-b'], technologies: [], totalDays: 3 }],
  });
  assert.throws(() => validateCatalogue(cat), /dupliqué entre modules/);
});

test('validation : technologie inconnue → erreur', () => {
  const cat = mkCat({ tracks: [{ id: 't1', version: '1', status: 'available', title: 'T', goal: 'g', moduleRefs: ['m-a', 'm-b'], technologies: ['inexistante'], totalDays: 5 }] });
  assert.throws(() => validateCatalogue(cat), /technologie inconnue/);
});

test('validation : statut invalide → erreur', () => {
  const cat = mkCat({ tracks: [{ id: 't1', version: '1', status: 'draft', title: 'T', goal: 'g', moduleRefs: ['m-a', 'm-b'], technologies: [], totalDays: 5 }] });
  assert.throws(() => validateCatalogue(cat), /statut invalide/);
});

test('validation : id de parcours polluant (__proto__) → erreur', () => {
  const cat = mkCat({ tracks: [{ id: '__proto__', version: '1', status: 'announced', title: 'X', goal: 'g', moduleRefs: [], technologies: [], totalDays: 0 }] });
  assert.throws(() => validateCatalogue(cat), /id valide/);
});

test('validation : parcours annoncé sans module reste valide', () => {
  const cat = mkCat({ tracks: [
    mkCat().tracks[0],
    { id: 'soon', version: '1', status: 'announced', title: 'S', goal: 'g', moduleRefs: [], technologies: ['react'], totalDays: 0 },
  ] });
  assert.equal(validateCatalogue(cat), true);
});

// ── CP6 (V14) : resolveTrackDayObjects (surfaces pilotées par le parcours actif) ─
import { resolveTrackDayObjects, FULLSTACK_TRACK_ID } from '../lib/catalogue.mjs';

test('resolveTrackDayObjects : objets-journée ordonnés du parcours actif', () => {
  const cat = buildCatalogue(program);
  const found = resolveTrackDayObjects(cat, DEFAULT_TRACK_ID, program);
  assert.equal(found.length, 365);               // Fondations = tout le programme
  assert.equal(found[0].day, 1);
  const fst = resolveTrackDayObjects(cat, FULLSTACK_TRACK_ID, program);
  assert.equal(fst.length, 119);                 // Full-Stack = jours 1-119
  assert.equal(fst[0].day, 1);
  assert.equal(fst[fst.length - 1].day, 119);
  assert.ok(fst.every((d) => d && typeof d.title === 'string'));
});

// ── CP2 (V15) : troisième parcours Backend Engineer (available, non contigu) ──
import { BACKEND_TRACK_ID } from '../lib/catalogue.mjs';

test('Backend : parcours available, non contigu (j82 exclu), durée dérivée', () => {
  const cat = buildCatalogue(program);
  const be = getTrack(cat, BACKEND_TRACK_ID);
  assert.ok(be, 'parcours backend présent');
  assert.equal(isTrackAvailable(be), true);
  const days = resolveTrackDays(cat, be);
  assert.equal(days.length, be.totalDays);            // durée cohérente
  assert.equal(days.includes(82), false);             // Python/data exclu
  assert.ok(days.includes(81) && days.includes(83));  // non contigu autour de 82
  assert.equal(days.includes(87), false);             // pas de React
  // ordre déterministe croissant
  assert.deepEqual(days, [...days].sort((a, b) => a - b));
});

test('Backend : modules non vides, dayRefs uniques, jours existants', () => {
  const cat = buildCatalogue(program);
  const be = getTrack(cat, BACKEND_TRACK_ID);
  const mods = getTrackModules(cat, be);
  assert.ok(mods.length >= 8);
  const dayNums = new Set(program.days.map((d) => d.day));
  const seen = new Set();
  for (const m of mods) {
    assert.ok(m.dayRefs.length > 0, `module ${m.id} non vide`);
    for (const d of m.dayRefs) {
      assert.ok(dayNums.has(d), `jour ${d} existe`);
      assert.equal(seen.has(d), false, `jour ${d} non dupliqué`);
      seen.add(d);
    }
  }
});

test('Backend : n’est plus annoncé ; les parcours existants restent intacts', () => {
  const cat = buildCatalogue(program);
  assert.equal(cat.tracks.filter((t) => t.id === BACKEND_TRACK_ID).length, 1);
  const be = getTrack(cat, BACKEND_TRACK_ID);
  assert.notEqual(be.status, 'announced');
  // Fondations = 365, Full-Stack = 119, inchangés.
  assert.equal(getTrack(cat, DEFAULT_TRACK_ID).totalDays, 365);
  assert.equal(resolveTrackDays(cat, 'fullstack-typescript').length, 119);
  // Contrat de surface : l'ENSEMBLE nommé des parcours disponibles (pas un simple
  // compte magique). V19 a ajouté Systems & Cloud, V24 ajoute AppSec & Cloud Security.
  const availableIds = cat.tracks.filter(isTrackAvailable).map((t) => t.id).sort();
  assert.deepEqual(availableIds, [
    DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID,
    SYSTEMS_CLOUD_TRACK_ID, APPSEC_CLOUD_TRACK_ID,
  ].sort());
  assert.equal(be.technologies.includes('docker'), false);
});

// ── CP6 (V15) : navigation bornée au parcours (trackNeighbors) ───────────────
import { trackNeighbors } from '../lib/catalogue.mjs';

test('trackNeighbors : précédent/suivant DANS le parcours (jamais day±1)', () => {
  // Parcours non contigu : …, 81, 83, 84…
  const days = [1, 2, 3, 81, 83, 84];
  assert.deepEqual(trackNeighbors(days, 81), { inTrack: true, prev: 3, next: 83, position: 4, total: 6 });
  // 81 → suivant = 83 (pas 82, hors parcours) ; 83 → précédent = 81 (pas 82).
  assert.deepEqual(trackNeighbors(days, 83), { inTrack: true, prev: 81, next: 84, position: 5, total: 6 });
  // Première journée : pas de précédent. Dernière : pas de suivant.
  assert.equal(trackNeighbors(days, 1).prev, null);
  assert.equal(trackNeighbors(days, 84).next, null);
  // Journée hors parcours.
  assert.deepEqual(trackNeighbors(days, 200), { inTrack: false, prev: null, next: null, position: null, total: 6 });
});

test('trackNeighbors : bornes du parcours Backend réel (81→83, pas de 82)', () => {
  const cat = buildCatalogue(program);
  const days = resolveTrackDays(cat, BACKEND_TRACK_ID);
  assert.equal(trackNeighbors(days, 81).next, 83);   // saute j82
  assert.equal(trackNeighbors(days, 83).prev, 81);
  assert.equal(trackNeighbors(days, 86).next, null); // dernière journée backend
  assert.equal(trackNeighbors(days, 1).prev, null);  // première journée
});
