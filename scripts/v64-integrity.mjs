// V64 · Tests d'intégrité du Learning Engine, contre un SERVEUR RÉEL.
//
// PROTECTION DE LA BASELINE PERSONNELLE (brief §29) : ce harnais n'écrit
// JAMAIS dans data/progress.json. Il exige que le serveur ait été démarré avec
// AICOS_PROGRESS_FILE pointant vers une fixture isolée, et il le VÉRIFIE avant
// de muter quoi que ce soit. Aucune sauvegarde-puis-restauration : ce procédé
// masque la mutation au lieu de l'empêcher.
//
// Usage :
//   AICOS_PROGRESS_FILE=/tmp/fixture.json npx next start -p PORT
//   node scripts/v64-integrity.mjs http://127.0.0.1:PORT /tmp/fixture.json
//
// Sort 1 au premier invariant violé.

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://127.0.0.1:3484';
const FIXTURE = process.argv[3];
const REAL = join(process.cwd(), 'data', 'progress.json');

if (!FIXTURE) {
  console.error('❌ chemin de fixture requis en 2e argument.');
  process.exit(1);
}
if (FIXTURE === REAL || FIXTURE.endsWith('data/progress.json')) {
  console.error('❌ REFUS : la fixture ne doit pas être le fichier réel du propriétaire.');
  process.exit(1);
}

const realBefore = existsSync(REAL) ? createHash('sha256').update(readFileSync(REAL)).digest('hex') : null;
const hash = () => (existsSync(FIXTURE) ? createHash('sha256').update(readFileSync(FIXTURE)).digest('hex') : 'ABSENT');
const read = () => (existsSync(FIXTURE) ? JSON.parse(readFileSync(FIXTURE, 'utf8')) : null);
const track = () => { const v = read(); return v?.tracks?.[v.activeTrackId] ?? null; };
const dayOf = (n) => track()?.days?.[String(n)] ?? null;

let failures = 0;
const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (!ok) failures += 1;
  console.log(`  ${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function cmd(command) {
  const res = await fetch(`${BASE}/api/progress`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}
async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'text/html' } });
  await res.text();
  return res.status;
}

// Point de départ propre : une fixture vide et valide.
writeFileSync(FIXTURE, JSON.stringify({
  schemaVersion: 3,
  activeTrackId: 'ai-engineer-foundations-v1',
  tracks: {
    'ai-engineer-foundations-v1': {
      version: '1', enrolledAt: '2026-08-27T00:00:00.000Z', lastOpenedAt: '2026-08-27T00:00:00.000Z',
      startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {},
    },
  },
}, null, 2));

console.log('── V64 · intégrité du Learning Engine');
console.log(`   serveur  : ${BASE}`);
console.log(`   fixture  : ${FIXTURE}`);
console.log(`   réel     : ${REAL} (${realBefore?.slice(0, 16)}…) — NE DOIT PAS BOUGER\n`);

// Garde-fou : si le serveur n'écrit pas dans la fixture, tout le reste est faux.
{
  const before = hash();
  await cmd({ type: 'START', day: 200 });
  if (hash() === before) {
    console.error('\n❌ Le serveur n’écrit PAS dans la fixture. A-t-il été démarré avec AICOS_PROGRESS_FILE ?');
    process.exit(1);
  }
  writeFileSync(FIXTURE, readFileSync(FIXTURE, 'utf8').replace(/"200":\s*\{[\s\S]*?\n\s{8}\}/, '"__none":{}'));
}
// Repartir d'une fixture propre après le garde-fou.
writeFileSync(FIXTURE, JSON.stringify({
  schemaVersion: 3, activeTrackId: 'ai-engineer-foundations-v1',
  tracks: { 'ai-engineer-foundations-v1': {
    version: '1', enrolledAt: '2026-08-27T00:00:00.000Z', lastOpenedAt: '2026-08-27T00:00:00.000Z',
    startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} } },
}, null, 2));

// ── 1. VISIT_DOES_NOT_MUTATE_PROGRESS ─────────────────────────────────────
console.log('1. VISIT_DOES_NOT_MUTATE_PROGRESS');
{
  const before = hash();
  const routes = [
    '/', '/day/1', '/day/80', '/day/205', '/calendar', '/month/3', '/week/5',
    '/skills', '/revisions', '/synthese', '/parcours', '/missions', '/lessons',
    '/lab', '/diagnostics', '/capstones', '/glossary', '/notes', '/settings', '/projects',
  ];
  const codes = [];
  for (const r of routes) codes.push(`${r}:${await get(r)}`);
  const bad = codes.filter((c) => !c.endsWith(':200'));
  check('20 familles de routes visitées sans mutation', hash() === before, bad.length ? `codes anormaux : ${bad.join(' ')}` : `${routes.length} routes, hash inchangé`);
  // Le GET de l'API elle-même ne doit pas écrire non plus.
  await fetch(`${BASE}/api/progress`).then((r) => r.json());
  check('GET /api/progress ne mute pas', hash() === before);
}

// ── 2. START_DAY_MUTATES_PROGRESS_EXACTLY_ONCE ────────────────────────────
console.log('\n2. START_DAY_MUTATES_PROGRESS_EXACTLY_ONCE');
{
  const before = hash();
  const r1 = await cmd({ type: 'START', day: 1 });
  const after1 = hash();
  check('START accepté', r1.status === 200 && r1.body?.ok === true);
  check('START mute le fichier', after1 !== before);
  const d = dayOf(1);
  check('startedAt réellement écrit', typeof d?.session?.startedAt === 'string' && d.session.startedAt.length > 10, d?.session?.startedAt ?? 'null');
  check('status projeté à in-progress', d?.status === 'in-progress', d?.status);

  const r2 = await cmd({ type: 'START', day: 1 });
  check('un second START est REFUSÉ', r2.status === 400 && r2.body?.code === 'INVALID_TRANSITION', r2.body?.code);
  check('le refus n’a rien écrit', hash() === after1);
}

// ── 3. INVALID_TRANSITION_DOES_NOT_MUTATE_PROGRESS ────────────────────────
console.log('\n3. INVALID_TRANSITION_DOES_NOT_MUTATE_PROGRESS');
{
  const before = hash();
  const cases = [
    [{ type: 'COMPLETE', day: 2 }, 'NOT_STARTED → COMPLETED'],
    [{ type: 'RESUME', day: 1 }, 'active → RESUME'],
    [{ type: 'REOPEN', day: 1 }, 'active → REOPEN'],
    [{ type: 'SET_STATUS', day: 1, status: 'done' }, 'commande inconnue'],
    [{ type: 'START', day: 999 }, 'jour hors bornes'],
    [{ type: 'START', day: 0 }, 'jour 0'],
    [{ type: 'SUBMIT', day: 1, stepId: '../../etc/passwd', content: 'x' }, 'traversée de chemin'],
    [{ type: 'SUBMIT', day: 1, stepId: '__proto__', content: 'x' }, 'clé dangereuse'],
    [{ type: 'SET_SKILL', skill: 'python', score: 99 }, 'score hors bornes'],
  ];
  for (const [c, label] of cases) {
    const r = await cmd(c);
    check(`refusé : ${label}`, r.status === 400 && r.body?.ok === false, r.body?.code);
  }
  check('AUCUNE des 9 commandes refusées n’a écrit', hash() === before);
}

// ── 4. SAVE_SUBMISSION_MUTATES_ONLY_TARGET_SUBMISSION ─────────────────────
console.log('\n4. SAVE_SUBMISSION_MUTATES_ONLY_TARGET_SUBMISSION');
{
  await cmd({ type: 'START', day: 3 });
  const day3Before = JSON.stringify(dayOf(3));
  await cmd({ type: 'SUBMIT', day: 1, stepId: 'act-a', content: 'première réponse' });
  const first = JSON.stringify(dayOf(1).submissions[0]);
  await cmd({ type: 'SUBMIT', day: 1, stepId: 'act-b', content: 'seconde réponse' });

  const subs = dayOf(1).submissions;
  check('la journée voisine est intacte', JSON.stringify(dayOf(3)) === day3Before);
  check('la première soumission est intacte', JSON.stringify(subs[0]) === first);
  check('deux soumissions distinctes', subs.length === 2 && subs[0].stepId === 'act-a' && subs[1].stepId === 'act-b');

  await cmd({ type: 'SUBMIT', day: 1, stepId: 'act-a', content: 'réponse révisée' });
  const after = dayOf(1).submissions;
  check('re-rendre AJOUTE, n’écrase pas', after.length === 3 && after[0].content === 'première réponse');
}

// ── 5. COMPLETE_DAY_IS_IDEMPOTENT ─────────────────────────────────────────
console.log('\n5. COMPLETE_DAY_IS_IDEMPOTENT');
{
  const r1 = await cmd({ type: 'COMPLETE', day: 1 });
  const completedAt = dayOf(1).session.completedAt;
  const h1 = hash();
  check('COMPLETE accepté', r1.body?.ok === true);
  check('completedAt écrit', typeof completedAt === 'string' && completedAt.length > 10);

  await new Promise((r) => setTimeout(r, 1100)); // horloge différente
  const r2 = await cmd({ type: 'COMPLETE', day: 1 });
  const r3 = await cmd({ type: 'COMPLETE', day: 1 });
  check('COMPLETE répété accepté sans effet', r2.body?.ok === true && r3.body?.ok === true);
  check('completedAt NON réécrit', dayOf(1).session.completedAt === completedAt, dayOf(1).session.completedAt);
  check('le fichier est identique après 2 rappels', hash() === h1);
}

// ── 6. REOPEN efface completedAt (anomalie A6) ────────────────────────────
console.log('\n6. REOPEN nettoie réellement l’état');
{
  await cmd({ type: 'REOPEN', day: 1 });
  const d = dayOf(1);
  check('session rouverte', d.session.state === 'active');
  check('completedAt effacé', d.session.completedAt === null, String(d.session.completedAt));
  check('réouverture comptée', d.session.reopenCount === 1);
  check('status reprojeté', d.status === 'in-progress', d.status);
}

// ── 7. Le client ne peut pas imposer d’état ───────────────────────────────
console.log('\n7. Aucun statut imposé par le client');
{
  const r = await cmd({ type: 'SAVE_DRAFT', day: 4, notes: 'brouillon', status: 'done', session: { state: 'completed' } });
  check('brouillon accepté', r.body?.ok === true);
  const d = dayOf(4);
  check('la session reste NON commencée', d.session.state === 'not_started', d.session.state);
  check('le statut injecté est ignoré', d.status === 'not-started', d.status);
  check('le brouillon est bien conservé', d.notes === 'brouillon');
}

// ── 8. Validation automatique → preuve idempotente ────────────────────────
console.log('\n8. Validation déterministe → preuve');
{
  await cmd({ type: 'START', day: 5 });
  const v = { status: 'passed', kind: 'exercise-tests', checkedAt: new Date().toISOString(), detail: '3/3', score: { passed: 3, total: 3 } };
  await cmd({ type: 'SUBMIT', day: 5, stepId: 'lab-demo', kind: 'exercise', content: 'code', validation: v, evidenceId: 'lab-demo' });
  check('une preuve est créée', (dayOf(5).evidence ?? []).length === 1);
  check('l’étape est validée', dayOf(5).session.steps['lab-demo']?.state === 'done');
  await cmd({ type: 'SUBMIT', day: 5, stepId: 'lab-demo', kind: 'exercise', content: 'code v2', validation: v, evidenceId: 'lab-demo' });
  check('re-valider ne DOUBLE PAS la preuve', (dayOf(5).evidence ?? []).length === 1, `${(dayOf(5).evidence ?? []).length} preuve(s)`);
  check('mais la soumission est bien ajoutée', dayOf(5).submissions.filter((s) => s.stepId === 'lab-demo').length === 2);
}

// ── 9. RELOAD_PRESERVES_SESSION ───────────────────────────────────────────
console.log('\n9. RELOAD_PRESERVES_SESSION');
{
  const snapshot = JSON.stringify(dayOf(5));
  await get('/day/5');
  await get('/day/5'); // rechargement
  check('la session survit à deux rechargements', JSON.stringify(dayOf(5)) === snapshot);
  const api = await fetch(`${BASE}/api/progress`).then((r) => r.json());
  check('l’API rend la même session', api.days['5']?.session?.state === 'active', api.days['5']?.session?.state);
  check('les soumissions sont toujours là', (api.days['5']?.submissions ?? []).length === 2);
}

// ── 10. Le contenu utilisateur est traité comme du TEXTE ──────────────────
console.log('\n10. Aucune injection depuis une réponse utilisateur');
{
  const payload = '<img src=x onerror=alert(1)><script>alert(2)</script>';
  await cmd({ type: 'SUBMIT', day: 5, stepId: 'act-xss', content: payload });
  const stored = dayOf(5).submissions.find((s) => s.stepId === 'act-xss');
  check('le texte est stocké tel quel, jamais interprété', stored?.content === payload);
  const res = await fetch(`${BASE}/day/5`);
  const html = await res.text();
  // La bonne question n'est PAS « la chaîne apparaît-elle » — elle apparaît,
  // dans la charge utile RSC, et c'est normal : c'est la donnée de l'utilisateur.
  // La question est : peut-elle OUVRIR UNE BALISE ? Le payload sérialise `<` en
  // `<`, donc aucune frontière de balise n'est créée et `</script>` ne peut
  // pas refermer le script inline. C'est CELA qu'on vérifie.
  const rawTag = html.includes('<img src=x') || html.includes('<script>alert(2)');
  check('aucune frontière de balise créée par le contenu utilisateur', !rawTag);
  check('le contenu est échappé dans la charge utile', html.includes('\\u003cimg src=x'));

  const bad = await cmd({ type: 'ADD_EVIDENCE', day: 5, evidence: { title: 'X', type: 'note', url: 'javascript:alert(1)' } });
  const ev = (dayOf(5).evidence ?? []).find((e) => e.title === 'X');
  check('une URL javascript: est neutralisée', bad.body?.ok === true && ev?.url === '', ev?.url ?? '(absente)');
}

// ── 11. La baseline personnelle n’a pas bougé ─────────────────────────────
console.log('\n11. BASELINE PERSONNELLE');
{
  const realAfter = existsSync(REAL) ? createHash('sha256').update(readFileSync(REAL)).digest('hex') : null;
  check('data/progress.json est strictement inchangé', realAfter === realBefore, `${realBefore?.slice(0, 16)} → ${realAfter?.slice(0, 16)}`);
}

console.log(`\n${failures === 0 ? '✅' : '❌'} ${results.length - failures}/${results.length} invariants tenus.`);
process.exit(failures === 0 ? 0 : 1);
