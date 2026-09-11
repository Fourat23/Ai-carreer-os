// V75 · CP9 — DETTE D10 : les 25 défis de transfert deviennent atteignables.
//
// ── CE QUE LE CP0 AVAIT MESURÉ ───────────────────────────────────────────
//
//   route `app/transfer` **absente** · navigation **absente** · **0/365**
//   journées citant un défi · **0** référence dans `program.json` · type de
//   preuve **présent** (V74 · CP11).
//
// Tout existait sauf le chemin. `lib/learner-memory.mjs` en tirait la
// conséquence noir sur blanc : le compteur `transfers` *« vaut 0 tant que les
// 25 défis ne sont pas atteignables »*. Le moteur de rétention était donc
// **structurellement incapable d'observer un transfert**.
//
// ── LE TEST QUI COMPTE VRAIMENT ─────────────────────────────────────────
//
// Ce n'est pas « la page existe ». C'est : **une preuve issue d'un défi est
// comptée comme un TRANSFERT par le moteur**. Une surface qui produirait une
// preuve que personne ne lit ne lèverait rien du tout.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { validateTransferChallenge, gradeTransferChallenge } from '../lib/transfer-challenge.mjs';
import { makeEvidence, QUALIFYING_SOURCE_TYPES, EVIDENCE_SOURCE_TYPES } from '../lib/evidence.mjs';
import { projectLearnerMemory } from '../lib/learner-memory.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const code = (p) => lire(p).split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
const NOW = '2026-09-01T10:00:00.000Z';

const DEFIS = readdirSync(join(ROOT, 'data', 'transfer-challenges'))
  .filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(readFileSync(join(ROOT, 'data', 'transfer-challenges', f), 'utf8')));

const bonnes = (c) => Object.fromEntries(c.questions.map((q) => [
  q.id,
  q.kind === 'multi' ? [...q.answer] : q.kind === 'predict' ? String(q.answer) : q.answer,
]));
const fausses = (c) => Object.fromEntries(c.questions.map((q) => [
  q.id,
  q.kind === 'multi' ? [] : q.kind === 'predict' ? '— faux —'
    : ((typeof q.answer === 'number' ? q.answer : 0) + 1) % ((q.options ?? []).length || 2),
]));

// ── LE CHEMIN, QUI EST TOUTE LA DETTE ───────────────────────────────────

test('V75 · CP9 — la route, la page de détail et l’API existent', () => {
  for (const f of ['app/transfer/page.tsx', 'app/transfer/[id]/page.tsx',
    'app/transfer/[id]/ChallengeRunner.tsx', 'app/api/transfer/[id]/route.ts']) {
    assert.ok(lire(f), `${f} est introuvable — la dette D10 n’est pas levée`);
  }
});

test('V75 · CP9 — la NAVIGATION y mène', () => {
  // Le CP0 l'a mesurée absente. Une surface qu'aucun lien n'atteint reste à
  // moitié absente, et c'est exactement ce qui a maintenu le compteur à zéro.
  const nav = lire('app/shell/nav.ts');
  assert.match(nav, /href:\s*'\/transfer'/, 'aucune entrée de navigation vers les défis');
  const shell = lire('app/shell/AppShell.tsx');
  const icone = nav.match(/href:\s*'\/transfer',[^}]*icon:\s*'(\w+)'/)?.[1];
  assert.ok(icone, 'l’entrée de navigation n’a pas d’icône');
  assert.ok(shell.includes(icone), `l’icône ${icone} n’est pas enregistrée : le lien afficherait un repli`);
});

// ── LES 25, UN PAR UN — PAS EN AGRÉGAT ──────────────────────────────────

test('V75 · CP9 — il y a bien 25 défis, et chacun est structurellement valide', () => {
  assert.equal(DEFIS.length, 25);
  for (const c of DEFIS) {
    const v = validateTransferChallenge(c);
    assert.ok(v.ok, `${c.id} : ${v.errors.join(' ; ')}`);
  }
});

test('V75 · CP9 — chaque défi RÉUSSIT avec les bonnes réponses', () => {
  for (const c of DEFIS) {
    const r = gradeTransferChallenge(c, bonnes(c));
    assert.ok(r.passedOverall, `${c.id} : ${r.passed}/${r.total} avec les réponses attendues`);
  }
});

test('V75 · CP9 — chaque défi ÉCHOUE avec de mauvaises réponses', () => {
  // Un correcteur qui dit toujours oui ne corrige pas. Sans ce test, le
  // précédent serait satisfait par une fonction qui rend toujours `passed`.
  for (const c of DEFIS) {
    const r = gradeTransferChallenge(c, fausses(c));
    assert.equal(r.passedOverall, false, `${c.id} passe avec de mauvaises réponses`);
  }
});

test('V75 · CP9 — chaque défi produit une preuve RECEVABLE', () => {
  for (const c of DEFIS) {
    const r = gradeTransferChallenge(c, bonnes(c));
    const ev = makeEvidence({
      sourceType: 'transfer-challenge', sourceId: c.id,
      competencyIds: c.skills ?? [], conceptIds: c.lessonRefs ?? [],
      validation: { status: 'passed', kind: 'assessment-grade', checkedAt: NOW, detail: `${r.passed}/${r.total}` },
      title: c.title,
      provenance: { producer: 'transfer-grader', method: 'transfer-challenge' },
    }, { now: NOW });
    assert.ok(ev.ok, `${c.id} : ${ev.error}`);
    assert.equal(ev.evidence.sourceType, 'transfer-challenge');
  }
});

// ── LE POINT QUI PROUVE QUE D10 EST LEVÉE ───────────────────────────────

test('V75 · CP9 — une preuve de défi est COMPTÉE comme un transfert', () => {
  // Une preuve que personne ne lit ne lève aucune dette.
  const c = DEFIS[0];
  const r = gradeTransferChallenge(c, bonnes(c));
  const ev = makeEvidence({
    sourceType: 'transfer-challenge', sourceId: c.id, competencyIds: c.skills,
    validation: { status: 'passed', kind: 'assessment-grade', checkedAt: NOW, detail: `${r.passed}/${r.total}` },
    title: c.title, provenance: { producer: 'transfer-grader', method: 'transfer-challenge' },
  }, { now: NOW });
  assert.ok(ev.ok);

  const proj = projectLearnerMemory({
    facts: { days: {}, evidence: [ev.evidence] },
    context: { conceptDays: {}, conceptSkills: {}, skills: c.skills },
    now: NOW,
  });
  const total = proj.competencies.reduce((n, f) => n + (f.transfers ?? 0), 0);
  assert.ok(total > 0, 'le moteur ne compte toujours aucun transfert : D10 n’est pas levée');
  for (const f of proj.competencies.filter((x) => x.transfers > 0)) {
    assert.equal(f.jamaisTransfere, false, `${f.id} reste marquée « jamais transférée »`);
  }
});

test('V75 · CP9 — un EXERCICE réussi ne compte toujours pas comme un transfert', () => {
  // La distinction est le cœur de V74 · CP11 : appliquer une notion là où on
  // l'a apprise n'est pas la reconnaître ailleurs. La lever par mégarde
  // fabriquerait du transfert.
  const ev = makeEvidence({
    sourceType: 'exercise', sourceId: 'ex-1', competencyIds: ['http'],
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW },
    title: 'Exercice', provenance: { producer: 'lab-runner', method: 'tests' },
  }, { now: NOW });
  assert.ok(ev.ok);
  const proj = projectLearnerMemory({
    facts: { days: {}, evidence: [ev.evidence] },
    context: { conceptDays: {}, conceptSkills: {}, skills: ['http'] },
    now: NOW,
  });
  assert.equal(proj.competencies.reduce((n, f) => n + (f.transfers ?? 0), 0), 0);
});

// ── CE QUE LA ROUTE REFUSE DE FAIRE ─────────────────────────────────────

test('V75 · CP9 — le verdict est calculé par le SERVEUR, jamais reçu du client', () => {
  const route = code('app/api/transfer/[id]/route.ts');
  assert.match(route, /gradeTransferChallenge\(challenge, responses\)/);
  // Le corps n'accepte que des réponses et un drapeau : aucun score entrant.
  assert.doesNotMatch(route, /body\.(score|passed|result|passedOverall)/,
    'un verdict transmis par le client pourrait être fabriqué par le client');
});

test('V75 · CP9 — corriger n’écrit RIEN ; conserver est explicite', () => {
  const route = code('app/api/transfer/[id]/route.ts');
  assert.match(route, /if \(body\.record !== true\) \{[\s\S]{0,160}recorded: false/,
    'une simple correction ne doit jamais toucher le disque');
  // L'APPEL, pas l'import : `writeProgress` figure en tête de fichier, donc
  // chercher le simple nom plaçait toujours « l'écriture » avant le garde-fou.
  const i = route.indexOf('body.record !== true');
  const j = route.indexOf('writeProgress({');
  assert.ok(i >= 0 && j > i, 'l’écriture doit venir APRÈS le garde-fou');
});

test('V75 · CP9 — la ROUTE écrit bien le type `transfer-challenge`', () => {
  // Mutation restée verte au premier passage : remplacer le type par
  // `assessment` dans la route laissait tous les tests au vert, parce qu'ils
  // vérifiaient `makeEvidence` de leur côté et jamais ce que la route lui
  // passe. C'est pourtant EXACTEMENT le mode de panne de D10 — une preuve
  // écrite sous un autre nom n'est jamais comptée comme un transfert.
  const route = code('app/api/transfer/[id]/route.ts');
  assert.match(route, /sourceType:\s*'transfer-challenge'/,
    'la route doit écrire le type que le moteur compte comme transfert');
  assert.doesNotMatch(route, /sourceType:\s*'assessment'/,
    'un défi enregistré comme diagnostic ne compte plus comme transfert');
  assert.match(route, /producer:\s*'transfer-grader'/);
});

test('V75 · CP9 — la preuve ne s’attache à AUCUNE journée d’emprunt', () => {
  // Dette corrigée par V65 pour les diagnostics : une preuve est autonome.
  const route = code('app/api/transfer/[id]/route.ts');
  assert.doesNotMatch(route, /dayId:/, 'aucun dayId ne doit être fabriqué');
});

test('V75 · CP9 — rejouer le même défi ne crée pas une seconde preuve', () => {
  const route = code('app/api/transfer/[id]/route.ts');
  assert.match(route, /appended\.added/);
  assert.match(route, /duplicate: true/);
});

test('V75 · CP9 — la correction hors ligne NE PEUT PAS être conservée', () => {
  // Un verdict que le produit n'a pas calculé lui-même ne vaut rien comme
  // preuve. Le repli local existe pour ne pas perdre le travail, pas pour
  // ouvrir une porte dérobée.
  const runner = code('app/transfer/[id]/ChallengeRunner.tsx');
  assert.match(runner, /setHorsLigne\(true\)/);
  assert.match(runner, /\{!horsLigne && \(!notice \|\| echec\) \?/,
    'le bouton de conservation doit disparaître en repli local');
  // Un seul canal de retour, succès comme échec : deux canaux, c'est un de
  // trop pour garantir qu'un échec s'affiche (porte `v64:check`).
  assert.match(runner, /setNotice\(/);
  assert.match(runner, /\{notice && \(echec/);
  assert.match(runner, /role="alert"/);
});

// ── LE MODE DU CP6 EST RESPECTÉ, SANS FERMER LA PORTE ───────────────────

test('V75 · CP9 — en récupération, le transfert est signalé comme inopportun…', () => {
  const page = code('app/transfer/page.tsx');
  // La PRÉSENCE du calcul ne prouve rien : une mutation remplaçant `{suspendu ?`
  // par `{false ?` laissait le test vert, `const suspendu = …` subsistant.
  // On exige que la valeur soit RENDUE.
  assert.match(page, /const suspendu = .*arbitrage\.transfert === 'suspendu'/);
  assert.match(page, /\{suspendu \?/, 'la valeur calculée doit conditionner l’affichage');
});

test('V75 · CP9 — …mais la page reste ACCESSIBLE (recommander, pas imposer)', () => {
  const page = code('app/transfer/page.tsx');
  // Aucun `return null`, aucune redirection : suspendre n'est pas fermer.
  assert.doesNotMatch(page, /suspendu[\s\S]{0,80}(redirect|notFound|return null)/);
  assert.match(page, /Rien ne t’empêche d’en ouvrir un/);
});

// ── LA RÉSERVE PÉDAGOGIQUE, PARTOUT ─────────────────────────────────────

test('V75 · CP9 — aucune surface ne présente un défi réussi comme une maîtrise', () => {
  for (const f of ['app/transfer/page.tsx', 'app/transfer/[id]/ChallengeRunner.tsx',
    'app/api/transfer/[id]/route.ts']) {
    const src = code(f);
    assert.match(src, /indice/i, `${f} n’énonce pas la réserve « indice, pas maîtrise »`);
  }
});

test('V75 · CP9 — le type de preuve reste qualifiant, et il est le seul ajouté', () => {
  assert.ok(EVIDENCE_SOURCE_TYPES.includes('transfer-challenge'));
  assert.ok(QUALIFYING_SOURCE_TYPES.has('transfer-challenge'));
});
