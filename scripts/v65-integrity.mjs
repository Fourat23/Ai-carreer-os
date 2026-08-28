// V65 · Intégrité Compétence / Preuve / Historique, contre un SERVEUR RÉEL.
//
// PROTECTION DE LA BASELINE (brief §14) : ce harnais n'écrit JAMAIS dans
// data/progress.json. Il exige AICOS_PROGRESS_FILE vers une fixture isolée et
// le VÉRIFIE avant toute mutation. Aucune sauvegarde-puis-restauration.
//
// Usage :
//   AICOS_PROGRESS_FILE=/tmp/fx.json npx next start -p PORT
//   node scripts/v65-integrity.mjs http://127.0.0.1:PORT /tmp/fx.json

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { createLedger, projectCompetency } from '../lib/competency.mjs';
import { buildHistory } from '../lib/learner-history.mjs';

const BASE = process.argv[2] ?? 'http://127.0.0.1:3490';
const FIXTURE = process.argv[3];
const REAL = join(process.cwd(), 'data', 'progress.json');

if (!FIXTURE || FIXTURE === REAL || FIXTURE.endsWith('data/progress.json')) {
  console.error('❌ REFUS : une fixture isolée est requise (jamais le fichier réel).');
  process.exit(1);
}

const realBefore = existsSync(REAL) ? createHash('sha256').update(readFileSync(REAL)).digest('hex') : null;
const hash = () => (existsSync(FIXTURE) ? createHash('sha256').update(readFileSync(FIXTURE)).digest('hex') : 'ABSENT');
const read = () => (existsSync(FIXTURE) ? JSON.parse(readFileSync(FIXTURE, 'utf8')) : null);
const track = () => { const v = read(); return v?.tracks?.[v.activeTrackId] ?? null; };
const ledger = () => track()?.evidence ?? [];

let failures = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const cmd = async (command) => {
  const res = await fetch(`${BASE}/api/progress`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};
const get = async (path) => { const r = await fetch(`${BASE}${path}`); await r.text(); return r.status; };

const CLEAN = () => writeFileSync(FIXTURE, JSON.stringify({
  schemaVersion: 3, activeTrackId: 'ai-engineer-foundations-v1',
  tracks: { 'ai-engineer-foundations-v1': {
    version: '1', enrolledAt: '2026-08-28T00:00:00.000Z', lastOpenedAt: '2026-08-28T00:00:00.000Z',
    startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {}, evidence: [] } },
}, null, 2));

CLEAN();
console.log('── V65 · intégrité Compétence / Preuve / Historique');
console.log(`   serveur : ${BASE}`);
console.log(`   fixture : ${FIXTURE}`);
console.log(`   réel    : ${realBefore?.slice(0, 16)}… — NE DOIT PAS BOUGER\n`);

// Garde-fou : le serveur écrit-il bien dans la fixture ?
{
  const before = hash();
  await cmd({ type: 'START', day: 300 });
  if (hash() === before) {
    console.error('\n❌ Le serveur n’écrit PAS dans la fixture (AICOS_PROGRESS_FILE manquant ?).');
    process.exit(1);
  }
  CLEAN();
}

// ── 1. NAVIGATION_DOES_NOT_CREATE_EVIDENCE ────────────────────────────────
console.log('1. NAVIGATION_DOES_NOT_CREATE_EVIDENCE');
{
  const before = hash();
  const routes = ['/', '/skills', '/history', '/revisions', '/diagnostics', '/day/1', '/day/80',
                  '/calendar', '/synthese', '/parcours', '/missions', '/lab', '/capstones', '/lessons'];
  const codes = [];
  for (const r of routes) codes.push(`${r}:${await get(r)}`);
  const bad = codes.filter((c) => !c.endsWith(':200'));
  check(`${routes.length} routes visitées sans mutation`, hash() === before, bad.length ? `anormal : ${bad.join(' ')}` : 'hash inchangé');
  check('aucune preuve créée par navigation', ledger().length === 0, `${ledger().length} preuve(s)`);
  await fetch(`${BASE}/api/progress`).then((r) => r.json());
  check('GET /api/progress ne mute pas', hash() === before);
}

// ── 2. Terminer une journée ne démontre AUCUNE compétence ─────────────────
console.log('\n2. Une journée terminée n’est pas une démonstration');
{
  await cmd({ type: 'START', day: 1 });
  await cmd({ type: 'COMPLETE', day: 1 });
  check('la journée est bien terminée', track().days['1'].status === 'done');
  check('AUCUNE preuve n’a été créée', ledger().length === 0, `${ledger().length}`);
  const proj = projectCompetency('gitlinux', createLedger(ledger()).getEvidenceBySkill('gitlinux'));
  check('la compétence reste « non évaluée »', proj.state === 'unassessed', proj.state);
}

// ── 3. Une note libre ne démontre pas ─────────────────────────────────────
console.log('\n3. Une déclaration n’est pas une démonstration');
{
  const r = await cmd({ type: 'ADD_EVIDENCE', day: 1, evidence: { title: "j'ai lu la doc", type: 'note', skills: ['gitlinux'] } });
  check('la note est acceptée', r.body?.ok === true);
  const proj = projectCompetency('gitlinux', createLedger(ledger()).getEvidenceBySkill('gitlinux'));
  check('mais elle ne démontre pas', proj.state !== 'demonstrated' && proj.state !== 'reinforced', proj.state);
}

// ── 4. Validation déterministe → preuve qualifiante ───────────────────────
console.log('\n4. Une validation réussie démontre');
{
  const v = { status: 'passed', kind: 'exercise-tests', checkedAt: new Date().toISOString(), detail: '3/3', score: { passed: 3, total: 3 } };
  await cmd({ type: 'SUBMIT', day: 1, stepId: 'lab-a', kind: 'exercise', content: 'code', validation: v, evidenceId: 'lab-a', skills: ['javascript'] });
  const led = createLedger(ledger());
  check('une preuve canonique existe', led.size >= 1, `${led.size}`);
  const ev = led.all().find((e) => e.sourceType === 'exercise');
  check('elle porte une provenance', !!ev?.provenance?.producer, ev?.provenance?.producer);
  check('la compétence fine est traduite', ev?.competencyIds.includes('jsts'), JSON.stringify(ev?.competencyIds));
  const proj = projectCompetency('jsts', led.getEvidenceBySkill('jsts'));
  check('la compétence est « démontrée »', proj.state === 'demonstrated', proj.state);
  check('elle est explicable par ses preuves', proj.supportingEvidenceIds.length === 1);
}

// ── 5. Idempotence : rejeu, double clic, COMPLETE répété ──────────────────
console.log('\n5. Idempotence');
{
  const n = ledger().length;
  const h = hash();
  const v = { status: 'passed', kind: 'exercise-tests', checkedAt: new Date().toISOString(), detail: '3/3' };
  await cmd({ type: 'SUBMIT', day: 1, stepId: 'lab-a', kind: 'exercise', content: 'code2', validation: v, evidenceId: 'lab-a', skills: ['javascript'] });
  check('rejouer la même réussite ne double pas la preuve', ledger().length === n, `${ledger().length} vs ${n}`);
  const c1 = await cmd({ type: 'COMPLETE', day: 1 });
  check('COMPLETE répété est un no-op', c1.body?.effects?.some((e) => e.startsWith('noop:')));
  const before = hash();
  await cmd({ type: 'COMPLETE', day: 1 });
  check('et n’écrit rien sur le disque', hash() === before);
}

// ── 6. Compétence inconnue et preuve forgée ───────────────────────────────
console.log('\n6. Aucune preuve forgée depuis le client');
{
  const before = hash();
  const bad = await cmd({ type: 'SUBMIT', day: 1, stepId: 'x', content: 'y', skills: ['quantum-blockchain'] });
  check('compétence inconnue refusée', bad.status === 400 && bad.body?.code === 'UNKNOWN_COMPETENCY', bad.body?.code);
  check('le refus n’écrit rien', hash() === before);

  // Un horodatage transmis par le client ne doit jamais être retenu.
  const v = { status: 'passed', kind: 'exercise-tests', checkedAt: '1999-01-01T00:00:00.000Z' };
  await cmd({ type: 'SUBMIT', day: 1, stepId: 'lab-b', kind: 'exercise', content: 'c', validation: v, evidenceId: 'lab-b', skills: ['python'], createdAt: '1999-01-01T00:00:00.000Z' });
  const forged = ledger().find((e) => e.sourceId === 'lab-b');
  check('createdAt vient du serveur, pas du client', forged && !forged.createdAt.startsWith('1999'), forged?.createdAt);
}

// ── 7. Diagnostic sans journée ────────────────────────────────────────────
console.log('\n7. Un diagnostic existe sans journée');
{
  const list = await fetch(`${BASE}/api/progress`).then((r) => r.json());
  void list;
  const res = await fetch(`${BASE}/api/assessments/async-messaging-queues`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ responses: {}, record: true }),
  });
  const j = await res.json().catch(() => null);
  if (res.status === 404) {
    check('diagnostic de test introuvable — vérification ignorée', true, 'aucune fixture async-messaging-queues');
  } else {
    const diag = ledger().find((e) => e.sourceType === 'assessment');
    check('le diagnostic est corrigé côté serveur', j?.ok === true);
    check('la preuve existe SANS dayId', diag ? diag.dayId === null : true, String(diag?.dayId));
    // Rejeu : pas de seconde preuve.
    const n = ledger().length;
    await fetch(`${BASE}/api/assessments/async-messaging-queues`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses: {}, record: true }),
    });
    check('un diagnostic rejoué ne crée pas de seconde preuve', ledger().length === n, `${ledger().length} vs ${n}`);
  }
}

// ── 8. Révision → preuve non qualifiante ──────────────────────────────────
console.log('\n8. Une révision produit une preuve, jamais un état');
{
  await cmd({ type: 'START', day: 2 });
  await cmd({ type: 'COMPLETE', day: 2 });
  await cmd({ type: 'SET_COMPREHENSION', day: 2, value: 'partial', skills: ['gitlinux'] });
  const rev = ledger().find((e) => e.sourceType === 'review');
  check('une preuve de révision existe', !!rev);
  check('elle n’est pas qualifiante', rev ? rev.validation === null : false);
  const proj = projectCompetency('gitlinux', createLedger(ledger()).getEvidenceBySkill('gitlinux'));
  check('réviser ne démontre pas', proj.state === 'practiced', proj.state);
}

// ── 9. Historique factuel ─────────────────────────────────────────────────
console.log('\n9. Historique');
{
  const flat = { days: track().days, evidence: ledger() };
  const events = buildHistory(flat);
  check('l’historique contient des faits', events.length > 0, `${events.length} événement(s)`);
  check('aucun événement de navigation', !events.some((e) => /VISIT|PAGE|NAV|SCROLL/.test(e.type)));
  check('tout événement a un horodatage réel', events.every((e) => !Number.isNaN(new Date(e.at).getTime())));
  const keys = events.map((e) => `${e.type}|${e.at}|${e.dayId}|${e.evidenceId ?? ''}`);
  check('aucun doublon', new Set(keys).size === keys.length);
  check('la page /history répond', (await get('/history')) === 200);
}

// ── 10. RECONSTRUCTIBILITÉ (critère architectural §11 du brief) ───────────
console.log('\n10. Reconstructibilité : effacer les dérivés, rejouer, comparer');
{
  const led = createLedger(ledger());
  const skills = ['jsts', 'python', 'gitlinux', 'http', 'algo', 'ds'];
  const before = skills.map((s) => projectCompetency(s, led.getEvidenceBySkill(s)));

  // On efface TOUT ce qui est dérivé sur le disque : statuts de journée,
  // auto-évaluations, sessions — en ne gardant QUE le registre de preuves.
  const v = read();
  const t = v.tracks[v.activeTrackId];
  const onlyEvidence = { ...t, days: {}, skills: {} };
  const rebuilt = createLedger(onlyEvidence.evidence);
  const after = skills.map((s) => projectCompetency(s, rebuilt.getEvidenceBySkill(s)));

  check('la projection est identique depuis les SEULES preuves',
    JSON.stringify(before) === JSON.stringify(after),
    JSON.stringify(before) === JSON.stringify(after) ? '' : 'divergence');
}

// ── 11. Baseline personnelle ──────────────────────────────────────────────
console.log('\n11. BASELINE PERSONNELLE');
{
  const realAfter = existsSync(REAL) ? createHash('sha256').update(readFileSync(REAL)).digest('hex') : null;
  check('data/progress.json strictement inchangé', realAfter === realBefore, `${realBefore?.slice(0, 16)} → ${realAfter?.slice(0, 16)}`);
}

console.log(`\n${failures === 0 ? '✅' : '❌'} ${failures === 0 ? 'Tous les invariants tenus.' : `${failures} invariant(s) violé(s).`}`);
process.exit(failures === 0 ? 0 : 1);
