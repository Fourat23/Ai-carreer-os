// V64 · Parcours complet démontré, de bout en bout, sur un SERVEUR RÉEL et une
// fixture isolée : jour 1 → session → soumission → validation → preuve →
// compétence → révision. Produit aussi les captures de docs/design/v64/.
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = process.argv[2] ?? 'http://127.0.0.1:3486';
const FIXTURE = process.argv[3];
const OUT = join(process.cwd(), 'docs', 'design', 'v64');

if (!FIXTURE || FIXTURE.endsWith('data/progress.json')) {
  console.error('❌ fixture isolée requise.');
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

// La compétence est LUE DANS LE CORPUS, jamais inventée. Au premier essai, ce
// script passait un identifiant fabriqué (« javascript ») absent du programme :
// /skills n'affichait donc rien, et c'était CORRECT. Le défaut était dans la
// donnée de test, pas dans le produit.
const PROGRAM = JSON.parse(readFileSync(join(process.cwd(), 'data', 'program.json'), 'utf8'));
const dayMeta = (n) => PROGRAM.days.find((d) => d.day === n);
const SKILL = dayMeta(1).skill;
const SKILL_NAME = dayMeta(1).skillName;

const read = () => JSON.parse(readFileSync(FIXTURE, 'utf8'));
const track = () => { const v = read(); return v.tracks[v.activeTrackId]; };
const day = (n) => track().days?.[String(n)] ?? null;

let fail = 0;
const step = (n, ok, detail) => {
  if (!ok) fail += 1;
  console.log(`  ${ok ? '✅' : '❌'} ${n}${detail ? ` — ${detail}` : ''}`);
};
const cmd = async (command) => (await fetch(`${BASE}/api/progress`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ command }),
})).json();

// Fixture propre.
writeFileSync(FIXTURE, JSON.stringify({
  schemaVersion: 3, activeTrackId: 'ai-engineer-foundations-v1',
  tracks: { 'ai-engineer-foundations-v1': {
    version: '1', enrolledAt: '2026-08-27T00:00:00.000Z', lastOpenedAt: '2026-08-27T00:00:00.000Z',
    startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} } },
}, null, 2));

console.log('── V64 · parcours complet, jour 1 → révision\n');

console.log('Étape 1 — la journée est ouverte');
await cmd({ type: 'START', day: 1 });
step('la session existe et est active', day(1)?.session?.state === 'active');
step('startedAt est réel', typeof day(1).session.startedAt === 'string');
step('le statut projeté suit', day(1).status === 'in-progress');

console.log('\nÉtape 2 — l’apprenant écrit, puis rend');
await cmd({ type: 'SAVE_DRAFT', day: 1, answers: { 'act-1': 'mon raisonnement, écrit seul' } });
step('le brouillon est conservé', day(1).answers['act-1']?.startsWith('mon raisonnement'));
await cmd({ type: 'SUBMIT', day: 1, stepId: 'act-1', content: 'mon raisonnement, écrit seul' });
step('une soumission horodatée existe', day(1).submissions.length === 1);
step('l’étape passe à « rendu »', day(1).session.steps['act-1']?.state === 'in_progress');
step('aucune note inventée sur une réponse ouverte', day(1).submissions[0].validation === null);

console.log('\nÉtape 3 — une validation DÉTERMINISTE arrive');
await cmd({
  type: 'SUBMIT', day: 1, stepId: 'lab-greeting', kind: 'exercise', content: 'code',
  validation: { status: 'passed', kind: 'exercise-tests', checkedAt: new Date().toISOString(), detail: '3/3 tests', score: { passed: 3, total: 3 } },
  evidenceId: 'lab-greeting', evidenceTitle: 'Exercice réussi : Greeting', evidenceUrl: '/lab/greeting', skills: [SKILL],
});
step('l’étape est validée', day(1).session.steps['lab-greeting']?.state === 'done');
step('une PREUVE est créée', (day(1).evidence ?? []).length === 1, day(1).evidence?.[0]?.id);
step(`la preuve porte la compétence du jour 1 (${SKILL})`, day(1).evidence[0].skills.includes(SKILL));

console.log('\nÉtape 4 — la journée est clôturée, une révision est planifiée');
await cmd({ type: 'COMPLETE', day: 1, confidence: 'medium' });
step('la session est terminée', day(1).session.state === 'completed');
step('le statut projeté est « done »', day(1).status === 'done');
await cmd({ type: 'SET_COMPREHENSION', day: 1, value: 'partial' });
step('une échéance de révision existe', !!day(1).review?.dueAt, day(1).review?.dueAt?.slice(0, 10));
step('l’intervalle est celui du moteur', day(1).review.interval === 3, `${day(1).review?.interval} j`);

console.log('\nÉtape 5 — les surfaces de pilotage montrent la donnée RÉELLE');
const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
try {
  const shots = [
    ['/day/1', 'day-1-session', 1440],
    ['/day/1', 'day-1-session-375', 375],
    ['/skills', 'skills-alimente', 1440],
    ['/revisions', 'revisions-alimente', 1440],
    ['/', 'dashboard-alimente', 1440],
  ];
  const seen = {};
  for (const [route, name, w] of shots) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
    seen[name] = await page.evaluate(() => document.body.innerText);
    await page.close();
  }
  step('/skills montre la preuve', /1 preuve/.test(seen['skills-alimente']));
  step(`/skills classe « ${SKILL_NAME} » comme Démontrée`,
    new RegExp(`Démontrée`).test(seen['skills-alimente']) && seen['skills-alimente'].includes(SKILL_NAME));
  step('/revisions annonce une échéance', /Jour 1|À venir|réactiver/.test(seen['revisions-alimente']));
  step('la Vue Jour affiche la session terminée', /Journée terminée|Terminée/.test(seen['day-1-session']));
  step('la Vue Jour compte les étapes', /étapes/.test(seen['day-1-session']));
} finally { await browser.close(); }

console.log(`\n${fail === 0 ? '✅ Parcours complet démontré, de bout en bout.' : `❌ ${fail} étape(s) en échec.`}`);
console.log(`   captures : docs/design/v64/`);
process.exit(fail === 0 ? 0 : 1);
