// V75 · CP7 — PLAN DE RATTRAPAGE : budgété, reprenable, non punitif.
//
// La phrase que ce checkpoint existe pour ne jamais écrire :
//
//   > « Vous avez 91 notions en retard, faites-les toutes. »
//
// Ce que ces tests gardent :
//   · **le plan est BORNÉ**, et ce qu'il ne couvre pas est dit — les deux
//     nombres, jamais l'un sans l'autre (`R1` d'un côté, le mur de l'autre) ;
//   · **il ne reçoit aucun historique de plan**, donc ne peut pas reprocher une
//     journée manquée. C'est ça, « non punitif » : une propriété du type, pas
//     un ton ;
//   · **les notions garées ne sont pas planifiées** mais restent comptées ;
//   · **la couverture est un DÉBIT, jamais une promesse de maîtrise** (`R10`) ;
//   · **la pause n'efface rien** : c'est `R2` qu'elle pourrait déguiser.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { planDeRattrapage, couvertureDe, HORIZON_PLAN, CLASSES_PLANIFIABLES } from '../lib/catchup-plan.mjs';
import { applyCommand } from '../lib/learning-engine.mjs';

const lire = (p) => (existsSync(join(process.cwd(), p)) ? readFileSync(join(process.cwd(), p), 'utf8') : '');

/**
 * Le fichier SANS ses commentaires.
 *
 * Deux mutations sont restées vertes parce que la phrase cherchée existait
 * aussi dans l'en-tête explicatif du composant : le test gardait ma propre
 * documentation, pas le rendu. C'est le motif de l'anomalie n° 12 de V74,
 * reproduit deux fois de plus.
 */
const code = (p) => lire(p).split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
const NOW = '2026-09-01T10:00:00.000Z';

const notion = (id, o = {}) => ({
  id, classe: 'DEFERRABLE', minutes: 4, score: 50, raison: 'rien n’en dépend', ...o,
});
const n_ = (n, o = {}) => Array.from({ length: n }, (_, i) => notion(`c${i}`, o));

// ── LE PLAN EST BORNÉ, ET CE QU'IL NE COUVRE PAS EST DIT ────────────────

test('V75 · CP7 — 91 notions ne produisent pas 91 lignes à faire', () => {
  const p = planDeRattrapage({ notions: n_(91), minutesParJour: 20, unitesParJour: 5, now: NOW });
  assert.ok(p.jours.length <= HORIZON_PLAN, `${p.jours.length} journées proposées`);
  assert.ok(p.couvertes < p.total, 'le plan ne doit pas prétendre tout couvrir');
  assert.equal(p.restantes, p.total - p.couvertes);
});

test('V75 · CP7 — ce qui reste est COMPTÉ, jamais effacé', () => {
  const p = planDeRattrapage({ notions: n_(40), minutesParJour: 20, unitesParJour: 5, now: NOW });
  assert.equal(p.total, 40);
  assert.equal(p.couvertes + p.restantes + p.garees, p.total);
});

test('V75 · CP7 — l’horizon est DÉCLARÉ, court, et en un seul endroit', () => {
  // Une séquence ouverte « jusqu'à ce que ce soit fini » annoncerait dix-huit
  // jours de pénitence à 91 notions : c'est le rattrapage impossible de R12.
  assert.equal(HORIZON_PLAN, 7);
});

// ── NON PUNITIF : UNE PROPRIÉTÉ DU TYPE, PAS UN TON ─────────────────────

test('V75 · CP7 — le plan ne reçoit AUCUN historique de plan', () => {
  // Il ne peut donc pas savoir qu'une journée a été sautée, ni le reprocher.
  const src = lire('lib/catchup-plan.mjs');
  assert.doesNotMatch(src, /planPrecedent|historiquePlan|joursManques|streak|retardPlan/i);
  // Et la signature ne l'accepte pas non plus : deux appels identiques à des
  // moments différents de la vie de l'apprenant rendent le même plan.
  const args = { notions: n_(12), minutesParJour: 20, unitesParJour: 4, now: NOW };
  assert.deepEqual(planDeRattrapage(args), planDeRattrapage(args));
});

test('V75 · CP7 — le plan se déclare recalculable et abandonnable', () => {
  const p = planDeRattrapage({ notions: n_(5), now: NOW });
  assert.equal(p.abandonnable, true);
  assert.equal(p.recalculeChaqueJour, true);
});

test('V75 · CP7 — aucune formulation d’obligation ni de reproche', () => {
  const p = planDeRattrapage({ notions: n_(30), minutesParJour: 20, unitesParJour: 4, now: NOW });
  const textes = [p.couverture.phrase, ...p.jours.map((j) => j.pourquoi)].join(' ');
  assert.ok(!/tu dois|il faut que tu|obligatoire|rattrape ton retard|tu n’as pas|faute/i.test(textes),
    `ton injonctif : ${textes}`);
});

// ── LES NOTIONS GARÉES NE SONT PAS PLANIFIÉES, MAIS RESTENT COMPTÉES ────

test('V75 · CP7 — une notion garée n’entre pas dans le plan', () => {
  // Son prérequis est en retard : l'inscrire ferait échouer sur la cause.
  const p = planDeRattrapage({
    notions: [notion('libre'), notion('bloquee', { classe: 'PARKED' })],
    minutesParJour: 60, unitesParJour: 8, now: NOW,
  });
  const ids = p.jours.flatMap((j) => j.unites.map((u) => u.id));
  assert.deepEqual(ids, ['libre']);
  assert.equal(p.garees, 1);
  assert.equal(p.total, 2, 'elle reste comptée dans le total');
});

test('V75 · CP7 — seules les trois classes planifiables entrent au plan', () => {
  assert.deepEqual(CLASSES_PLANIFIABLES, ['URGENT', 'IMPORTANT', 'DEFERRABLE']);
});

// ── L'ORDRE ET LE BUDGET ────────────────────────────────────────────────

test('V75 · CP7 — l’urgent passe d’abord, et le budget est respecté', () => {
  const p = planDeRattrapage({
    notions: [
      notion('d1'), notion('d2'),
      notion('u1', { classe: 'URGENT', score: 90 }),
      notion('i1', { classe: 'IMPORTANT', score: 80 }),
    ],
    minutesParJour: 8, unitesParJour: 8, now: NOW,
  });
  assert.deepEqual(p.jours[0].unites.map((u) => u.id), ['u1', 'i1']);
  assert.ok(p.jours[0].minutes <= 8);
});

test('V75 · CP7 — une notion COÛTEUSE passe quand même, en tête de journée', () => {
  // Sinon elle attendrait indéfiniment derrière des notions moins chères :
  // c'est la famine que le CP8 de V74 avait mesurée.
  const p = planDeRattrapage({
    notions: [notion('chere', { minutes: 30 })], minutesParJour: 8, unitesParJour: 8, now: NOW,
  });
  assert.equal(p.jours[0].unites.length, 1);
  assert.equal(p.jours[0].minutes, 30);
});

test('V75 · CP7 — chaque journée porte son POURQUOI, en clair', () => {
  const p = planDeRattrapage({
    notions: [notion('u', { classe: 'URGENT' }), notion('i', { classe: 'IMPORTANT' })],
    minutesParJour: 20, unitesParJour: 8, now: NOW,
  });
  assert.match(p.jours[0].pourquoi, /dont la suite dépend/);
  assert.ok(!/score|percentile|decay|DEFERRABLE|URGENT/.test(p.jours[0].pourquoi), 'jargon moteur');
});

test('V75 · CP7 — sans minutes, le plan ne propose rien et le DIT', () => {
  const p = planDeRattrapage({ notions: n_(10), minutesParJour: 0, unitesParJour: 0, now: NOW });
  assert.equal(p.jours.length, 0);
  assert.equal(p.couvertes, 0);
  assert.match(p.couverture.phrase, /aucune minute/);
});

// ── LA COUVERTURE EST UN DÉBIT, PAS UNE PROMESSE ────────────────────────

test('V75 · CP7 — « repasse une fois » n’est jamais « tu la sauras »', () => {
  // Confondre les deux fabriquerait une probabilité d'oubli (R10).
  const c = couvertureDe(40, 5);
  assert.equal(c.jours, 8);
  assert.match(c.phrase, /repassent au moins une fois/);
  assert.match(c.phrase, /pas une promesse/);
  assert.ok(!/à jour|maîtris|tu sauras|retenu/i.test(c.phrase), `promesse dans « ${c.phrase} »`);
});

test('V75 · CP7 — la couverture NOMME les notions qu’elle ne compte pas', () => {
  // Défaut trouvé par la mesure du CP7 : pour le profil L (72 notions en
  // retard, 57 garées), la phrase annonçait « 2 jours » — vrai pour les 15
  // travaillables, et trompeur pour l'apprenant. Un chiffre rassurant qui
  // ignore le garage est faux par omission.
  const c = couvertureDe(15, 8, 57);
  assert.equal(c.jours, 2);
  assert.match(c.phrase, /15 notions actuellement travaillables/);
  assert.match(c.phrase, /57 autres n’y sont pas comptées/);
  // Et on ne DATE pas le déblocage : il dépend de tentatives à venir.
  assert.match(c.phrase, /sans date/);
});

test('V75 · CP7 — tout est garé : aucun « 0 jour » triomphal', () => {
  const c = couvertureDe(0, 8, 12);
  assert.equal(c.jours, null, 'annoncer 0 jour laisserait croire que c’est réglé');
  assert.match(c.phrase, /12 notions/);
  assert.match(c.phrase, /prérequis/);
});

test('V75 · CP7 — aucun rythme : aucune date inventée', () => {
  assert.equal(couvertureDe(40, 0).jours, null);
});

test('V75 · CP7 — rien en retard : la couverture le dit sans féliciter', () => {
  const c = couvertureDe(0, 5, 0);
  assert.equal(c.jours, 0);
  assert.ok(!/bravo|félicit|excellent|parfait/i.test(c.phrase));
});

// ── `PAUSED_CURRICULUM` — UN CHOIX, ET RIEN D'AUTRE ─────────────────────

const base = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };

test('V75 · CP7 — la pause s’enregistre comme un FAIT daté et tracé', () => {
  const r = applyCommand(base, {
    type: 'SET_CURRICULUM_PAUSE', paused: true,
    provenance: { producer: 'learner', method: 'choix explicite' },
  }, { now: new Date(NOW) });
  assert.ok(r.ok, r.error);
  assert.equal(r.progress.curriculumPause.paused, true);
  assert.equal(r.progress.curriculumPause.since, NOW);
  assert.equal(r.progress.curriculumPause.provenance.producer, 'learner');
  assert.ok(r.progress.curriculumPause.schemaVersion >= 2);
});

test('V75 · CP7 — la pause n’efface AUCUNE notion due (R2)', () => {
  // Une pause qui allégerait la dette serait « supprimer artificiellement des
  // notions dues », rendu confortable.
  const avant = {
    ...base,
    days: { 3: { status: 'done', updatedAt: NOW } },
    recallAttempts: [{ conceptId: 'a', at: NOW, outcome: 'failed', format: 'cued' }],
    evidence: [],
  };
  const r = applyCommand(avant, { type: 'SET_CURRICULUM_PAUSE', paused: true }, { now: new Date(NOW) });
  assert.ok(r.ok);
  // `applyCommand` NORMALISE la progression à chaque entrée : comparer à
  // l'identique ferait échouer ce test pour une raison qui n'a rien à voir
  // avec la pause. Ce qu'il faut garder, c'est qu'aucun FAIT ne disparaisse et
  // qu'aucune échéance ne bouge.
  assert.deepEqual(Object.keys(r.progress.days), Object.keys(avant.days), 'aucune journée ne doit disparaître');
  assert.equal(r.progress.days['3'].status, 'done', 'aucun statut de journée ne doit changer');
  assert.equal(r.progress.recallAttempts.length, 1, 'aucune tentative ne doit disparaître');
  assert.equal(r.progress.recallAttempts[0].conceptId, 'a');
  assert.equal(r.progress.recallAttempts[0].outcome, 'failed', 'un échec ne s’efface pas en suspendant');
  assert.equal(r.progress.recallAttempts[0].at, NOW, 'aucune échéance ne se décale');
});

test('V75 · CP7 — reprendre est symétrique et laisse la trace', () => {
  const a = applyCommand(base, { type: 'SET_CURRICULUM_PAUSE', paused: true }, { now: new Date(NOW) });
  const b = applyCommand(a.progress, { type: 'SET_CURRICULUM_PAUSE', paused: false }, { now: new Date(NOW) });
  assert.ok(b.ok);
  assert.equal(b.progress.curriculumPause.paused, false);
  assert.equal(b.progress.curriculumPause.since, null);
  assert.ok(b.progress.curriculumPause.updatedAt);
});

test('V75 · CP7 — rebasculer dans le même état n’écrit RIEN', () => {
  // Le contrat du no-op est l'EFFET, pas l'identité de référence : la route
  // n'écrit pas quand un effet commence par `noop:`. Ce qui doit être garanti
  // en plus, c'est que le fait ne soit pas re-daté — sinon « en pause depuis
  // 12 jours » redeviendrait « depuis 0 jour » à chaque rendu de la page.
  const PLUS_TARD = '2026-09-08T10:00:00.000Z';
  const a = applyCommand(base, { type: 'SET_CURRICULUM_PAUSE', paused: true }, { now: new Date(NOW) });
  const b = applyCommand(a.progress, { type: 'SET_CURRICULUM_PAUSE', paused: true }, { now: new Date(PLUS_TARD) });
  assert.ok(b.ok);
  assert.ok(b.effects.some((e) => e.startsWith('noop:')), 'un no-op ne doit pas toucher le disque');
  assert.deepEqual(b.progress.curriculumPause, a.progress.curriculumPause,
    'le fait ne doit pas être re-daté');
  assert.equal(b.progress.curriculumPause.since, NOW);
});

test('V75 · CP7 — AUCUN code n’active la pause tout seul (§1.5)', () => {
  // « Un choix de l'apprenant, jamais du moteur. » La commande ne doit être
  // émise que par une surface où quelqu'un a cliqué.
  const emetteurs = ['lib/recovery-mode.mjs', 'lib/recovery-server.ts', 'lib/catchup-plan.mjs',
    'lib/catchup-server.ts', 'lib/backlog-triage.mjs', 'lib/daily-plan.mjs'];
  for (const f of emetteurs) {
    assert.doesNotMatch(lire(f), /SET_CURRICULUM_PAUSE/, `${f} ne doit pas déclencher la pause`);
  }
  assert.match(lire('app/retention/PauseCurriculum.tsx'), /SET_CURRICULUM_PAUSE/);
});

// ── LE BRANCHEMENT ──────────────────────────────────────────────────────

test('V75 · CP7 — le plan est RÉELLEMENT branché à une surface', () => {
  assert.match(lire('lib/catchup-server.ts'), /planDeRattrapage\s*\(/);
  const page = lire('app/retention/page.tsx');
  assert.match(page, /=\s*getVueRattrapage\s*\(/);
  assert.match(page, /<CatchupPlan/);
});

test('V75 · CP7 — la surface montre couvert ET restant, jamais l’un sans l’autre', () => {
  const c = code('app/retention/CatchupPlan.tsx');
  // La PRÉSENCE d'un nom ne prouve rien : `{plan.restantes > 0 ? …}` laisse le
  // nom dans le fichier même si la valeur rendue est remplacée par zéro. On
  // exige les trois nombres RENDUS, entre accolades seules.
  for (const champ of ['plan.couvertes', 'plan.total', 'plan.restantes']) {
    assert.match(c, new RegExp(`\\{${champ.replace('.', '\\.')}\\}`),
      `${champ} doit être RENDU, pas seulement mentionné`);
  }
  assert.match(c, /recalculée/, 'la surface doit dire que le plan se refait');
});

test('V75 · CP7 — la surface dit que la pause n’efface rien', () => {
  const p = code('app/retention/PauseCurriculum.tsx');
  assert.match(p, /ne bougent pas/, 'la conséquence doit être écrite AVANT le clic');
  assert.match(p, /Reprendre le nouveau contenu/, 'reprendre doit être aussi accessible que suspendre');
});
