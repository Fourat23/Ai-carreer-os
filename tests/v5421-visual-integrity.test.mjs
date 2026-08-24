// V54.2.1 — Tests du contrat « visual integrity ».
//
// Ces tests couvrent les défauts RÉELLEMENT observés en V54.2, pas des cas
// théoriques. Point méthodologique important : les tests V54.1 du calendrier
// passaient parce qu'ils n'utilisaient que le programme complet (365 jours,
// triés par construction). Le désordre n'apparaissait que sur un parcours
// SOUS-ENSEMBLE. Chaque test ci-dessous balaie donc TOUS les parcours.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCatalogue, getTrack, isTrackAvailable, resolveTrackDays, resolveTrackDayObjects } from '../lib/catalogue.mjs';
import { buildCalendar } from '../lib/calendar-model.mjs';
import { curriculumPartition, partitionLabels } from '../lib/curriculum-partition.mjs';

const program = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));
const cat = buildCatalogue(program);
const tracks = cat.tracks.filter(isTrackAvailable);
const asc = (a) => a.every((v, i) => i === 0 || v > a[i - 1]);

// ── A. CHRONOLOGICAL_RENDER_ORDER (modèle) ─────────────────────────────────

test('V54.2.1 — resolveTrackDays est chronologique sur TOUS les parcours', () => {
  assert.ok(tracks.length >= 8, 'le catalogue doit exposer les parcours disponibles');
  for (const t of tracks) {
    const days = resolveTrackDays(cat, t);
    assert.ok(asc(days), `${t.id} : jours non chronologiques (${days.slice(0, 8).join(',')}…)`);
  }
});

test('V54.2.1 — data-ml-v1 : la régression exacte observée (…73, 82, 84, 57, 58…) ne peut plus revenir', () => {
  const days = resolveTrackDays(cat, 'data-ml-v1');
  assert.equal(days.length, 188);
  const i84 = days.indexOf(84);
  const i57 = days.indexOf(57);
  assert.ok(i57 < i84, 'le jour 57 doit précéder le jour 84');
  assert.ok(asc(days));
});

test('V54.2.1 — buildCalendar rend mois / semaines / jours dans l\'ordre, pour tous les parcours', () => {
  for (const t of tracks) {
    const cal = buildCalendar(resolveTrackDayObjects(cat, t, program));
    assert.ok(asc(cal.months.map((m) => m.month)), `${t.id} : mois désordonnés`);
    assert.ok(asc(cal.months.flatMap((m) => m.weeks.map((w) => w.week))), `${t.id} : semaines désordonnées`);
    assert.ok(asc(cal.months.flatMap((m) => m.weeks.flatMap((w) => w.days.map((d) => d.day)))), `${t.id} : jours désordonnés`);
    assert.ok(cal.ordered && cal.monthOrderOk && cal.weekOrderOk && cal.dayOrderOk && cal.weekChainOk);
  }
});

test('V54.2.1 — le rendu est trié MÊME si l\'entrée est désordonnée (le contrat ne dépend pas de l\'appelant)', () => {
  const messy = [
    { day: 203, month: 7, week: 29 }, { day: 197, month: 7, week: 29 },
    { day: 120, month: 5, week: 18 }, { day: 199, month: 7, week: 29 },
    { day: 198, month: 7, week: 29 },
  ];
  const cal = buildCalendar(messy);
  assert.equal(cal.inputOrdered, false, 'le désordre de l\'entrée doit rester signalé');
  assert.ok(cal.ordered, 'la sortie doit être déclarée ordonnée');
  assert.deepEqual(cal.months.map((m) => m.month), [5, 7]);
  assert.deepEqual(cal.months[1].weeks[0].days.map((d) => d.day), [197, 198, 199, 203]);
});

test('V54.2.1 — aucun jour perdu ni dupliqué par le tri', () => {
  for (const t of tracks) {
    const nums = resolveTrackDays(cat, t);
    const cal = buildCalendar(resolveTrackDayObjects(cat, t, program));
    const rendered = cal.months.flatMap((m) => m.weeks.flatMap((w) => w.days.map((d) => d.day)));
    assert.deepEqual([...rendered].sort((a, b) => a - b), nums, `${t.id} : ensemble de jours modifié par le rendu`);
    assert.equal(new Set(rendered).size, rendered.length, `${t.id} : doublon de rendu`);
  }
});

// ── D. CURRICULUM_PARTITION ────────────────────────────────────────────────

test('V54.2.1 — la partition des jours totalise 365 pour tous les parcours', () => {
  for (const t of tracks) {
    const p = curriculumPartition(program, resolveTrackDays(cat, t));
    assert.equal(p.total, 365);
    assert.equal(p.sum, 365, `${t.id} : ${p.inTrack}+${p.before}+${p.interleaved}+${p.after} ≠ 365`);
    assert.ok(p.ok);
  }
});

test('V54.2.1 — Data/ML : 188 + 141 intercalés + 36 au-delà = 365 (les 36 jours manquants sont expliqués)', () => {
  const p = curriculumPartition(program, resolveTrackDays(cat, 'data-ml-v1'));
  assert.equal(p.inTrack, 188);
  assert.equal(p.before, 0);
  assert.equal(p.interleaved, 141);
  assert.equal(p.after, 36);
  assert.equal(p.sum, 365);
  assert.equal(p.lastTrackDay, 329);
  // Les 36 jours sont exactement 330…365 — plus aucun jour « invisible ».
  assert.deepEqual(p.afterDays, Array.from({ length: 36 }, (_, i) => 330 + i));
});

test('V54.2.1 — partition : aucun jour compté deux fois, aucun jour oublié', () => {
  for (const t of tracks) {
    const nums = new Set(resolveTrackDays(cat, t));
    const p = curriculumPartition(program, [...nums]);
    const all = [...nums, ...p.beforeDays, ...p.interleavedDays, ...p.afterDays];
    assert.equal(new Set(all).size, 365, `${t.id} : la partition ne recouvre pas exactement les 365 jours`);
  }
});

test('V54.2.1 — le parcours qui couvre tout le programme n\'affiche aucun « hors parcours »', () => {
  const p = curriculumPartition(program, resolveTrackDays(cat, 'ai-engineer-foundations-v1'));
  assert.equal(p.inTrack, 365);
  assert.equal(p.before + p.interleaved + p.after, 0);
  assert.equal(partitionLabels(p).outside, null);
});

test('V54.2.1 — libellés de partition : vocabulaire unique, chiffres dérivés', () => {
  const p = curriculumPartition(program, resolveTrackDays(cat, 'data-ml-v1'));
  const l = partitionLabels(p);
  assert.match(l.scope, /365 jours/);
  assert.match(l.coverage, /188 jours sur 365/);
  assert.match(l.coverage, /10 mois sur 12/);
  assert.match(l.outside, /177 jours hors parcours/);
  assert.match(l.outside, /36 au-delà du jour 329/);
});

test('V54.2.1 — partition : parcours vide et numéros fantômes ne faussent pas la somme', () => {
  const empty = curriculumPartition(program, []);
  assert.equal(empty.inTrack, 0);
  assert.equal(empty.sum, 365);
  const ghost = curriculumPartition(program, [1, 2, 9999]);
  assert.equal(ghost.inTrack, 2, 'un jour inexistant ne doit pas être compté');
  assert.equal(ghost.sum, 365);
});

// ── Voisinage de navigation : conséquence directe du tri ───────────────────

test('V54.2.1 — les voisins d\'une journée dans un parcours sont chronologiques', async () => {
  const { trackNeighbors } = await import('../lib/catalogue.mjs');
  const days = resolveTrackDays(cat, 'data-ml-v1');
  const mid = days[Math.floor(days.length / 2)];
  const n = trackNeighbors(days, mid);
  assert.ok(n.inTrack);
  assert.ok(n.prev < mid, 'le précédent doit être antérieur');
  assert.ok(n.next > mid, 'le suivant doit être postérieur');
});

// ── Régression CSS : aucune colonne sur une séquence ───────────────────────

test('V54.2.1 — aucune mise en page multi-colonnes CSS sur un conteneur séquentiel', () => {
  const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
  for (const sel of ['.cal-months', '.lx-milestones', '.track-roadmap', '.traj-grid']) {
    const re = new RegExp(`\\${sel}\\s*\\{[^}]*\\}`, 'g');
    for (const block of css.match(re) ?? []) {
      assert.ok(!/(^|[^-])column-count\s*:\s*(?!initial)/.test(block), `${sel} déclare column-count`);
      assert.ok(!/(^|[^-])columns\s*:\s*(?!initial)/.test(block), `${sel} déclare columns`);
    }
  }
});

test('V54.2.1 — le catalogue reste inchangé : durées de parcours identiques', () => {
  // Le tri réordonne, il n'ajoute ni ne retire aucune journée : les durées
  // annoncées avant le sprint doivent être strictement conservées.
  const expected = {
    'ai-engineer-foundations-v1': 365, 'fullstack-typescript': 119, 'frontend-engineer-v1': 54,
    'backend-engineer-v1': 85, 'systems-cloud-foundations-v1': 31,
    'appsec-cloud-security-v1': 15, 'cloud-devops-engineer-v1': 29, 'data-ml-v1': 188,
  };
  for (const [id, n] of Object.entries(expected)) {
    assert.equal(resolveTrackDays(cat, id).length, n, `durée de ${id} modifiée`);
    assert.ok(getTrack(cat, id), `parcours ${id} absent`);
  }
});
