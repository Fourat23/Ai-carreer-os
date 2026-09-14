// V75 · CP11 — LE PLAN UNIQUE : arbitrer, pas concaténer.
//
// ── LA RÈGLE QUI INTERDIT LA SOLUTION FACILE ────────────────────────────
//
// §11.1 : *« sans simplement concaténer les cinq »*. Mises bout à bout, les
// cinq natures produiraient une journée de 400 minutes et un apprenant qui
// abandonne. Elles se disputent **un seul budget**.
//
// §11.2 : une journée déjà au-dessus du budget **ne reçoit pas trente minutes
// de réactivation cachées**. *Le moteur peut différer, réduire, proposer,
// recommander. Il ne peut pas créer du temps.*
//
// §11.3 : `CRITICAL` **recommande**, ne verrouille pas.
// §11.4 : `TOTAL` / `ACTIVE` / `PARKED` restent distincts.
// §11.5 : chaque modification est **justifiée en langage humain**.
// §11.6 : vérifié **sur le produit réel**, pas seulement un module.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { planUnifie, explicationsDe, NATURES, ORDRE, STATUTS_BLOC } from '../lib/plan-unifie.mjs';
import { BUDGET_JOURNEE } from '../lib/daily-plan.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const code = (p) => lire(p).split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');

const P = (o = {}) => ({ bloquantes: 0, echecsNonRepris: 0, volume: 0, minutesRequises: 0, anciennete: 0, ...o });
const A = (o = {}) => ({ total: 0, actif: 0, differe: 0, gare: 0, ...o });

// ── LA CONTRAINTE QUI NE SE NÉGOCIE PAS ─────────────────────────────────

test('V75 · CP11 — le plan n’excède JAMAIS le budget de la journée', () => {
  // Le cœur du checkpoint. Testé sur toute la grille : modes × charges ×
  // demandes, y compris des demandes absurdes.
  for (const mode of ['NORMAL', 'CATCH_UP', 'RECOVERY', 'CRITICAL']) {
    for (const chargeHaut of [null, 0, 120, 240, 299, 300, 341]) {
      for (const rev of [0, 20, 60, 400]) {
        for (const rem of [0, 12, 200]) {
          const p = planUnifie({
            mode, chargeHaut, demande: { REVIEW: rev, REMEDIATION: rem, PROJECT: 90 },
            minutesTransfert: 12, projetAujourdhui: true,
            arriere: A({ total: 40, actif: 5, differe: 20, gare: 15 }), pression: P({ bloquantes: 3 }),
          });
          assert.ok(p.budget.accorde <= p.budget.journee,
            `${mode} · charge ${chargeHaut} · ${p.budget.accorde} > ${p.budget.journee}`);
          const somme = p.blocs.reduce((n, b) => n + b.minutes, 0);
          assert.equal(somme, p.budget.accorde, 'la somme des blocs doit valoir le total');
        }
      }
    }
  }
});

test('V75 · CP11 — une journée LOURDE ne reçoit pas 30 min cachées', () => {
  // §11.2. Le CP10 de V74 avait mesuré 44 journées sur 365 déjà au-dessus du
  // plafond ; y ajouter une séance serait un rattrapage imposé (R12).
  const p = planUnifie({
    mode: 'RECOVERY', chargeHaut: 341, demande: { REVIEW: 40, REMEDIATION: 12 },
    arriere: A({ total: 30 }), pression: P({ bloquantes: 4 }),
  });
  assert.equal(p.budget.journeeLourde, true);
  assert.ok(p.budget.accorde <= p.budget.journee);
  const rev = p.blocs.find((b) => b.nature === 'REVIEW');
  assert.ok(!rev || rev.minutes === 0 || p.budget.accorde <= p.budget.journee);
  assert.ok(p.explications.some((x) => /pèse déjà/.test(x)), 'la journée lourde doit être DITE');
});

test('V75 · CP11 — les minutes non placées sont PUBLIÉES, pas effacées', () => {
  const p = planUnifie({
    mode: 'CATCH_UP', chargeHaut: 280, demande: { REVIEW: 60, REMEDIATION: 20 },
    arriere: A({ total: 50 }), pression: P({ echecsNonRepris: 4 }),
  });
  assert.ok(p.budget.demande > p.budget.accorde);
  assert.equal(p.budget.nonPlacees, p.budget.demande - p.budget.accorde);
  assert.ok(p.budget.nonPlacees > 0);
});

// ── ARBITRER, PAS CONCATÉNER ────────────────────────────────────────────

test('V75 · CP11 — l’ordre d’arbitrage DÉPEND du mode', () => {
  // Concaténer, ce serait servir toujours dans le même ordre. Arbitrer, c'est
  // changer qui passe en premier selon la situation.
  assert.deepEqual(ORDRE.NORMAL, ['PROJECT', 'NEW', 'REVIEW', 'REMEDIATION', 'TRANSFER']);
  assert.equal(ORDRE.CATCH_UP[0], 'REMEDIATION');
  assert.equal(ORDRE.RECOVERY[0], 'REMEDIATION');
  assert.equal(ORDRE.CRITICAL[0], 'REMEDIATION');
  assert.notDeepEqual(ORDRE.NORMAL, ORDRE.CRITICAL, 'un ordre unique serait une concaténation');
});

test('V75 · CP11 — en mode tendu, la remédiation passe AVANT le nouveau contenu', () => {
  const p = planUnifie({
    mode: 'RECOVERY', chargeHaut: 200, demande: { REVIEW: 40, REMEDIATION: 12 },
    arriere: A({ total: 30 }), pression: P({ bloquantes: 4, echecsNonRepris: 3 }),
  });
  const ordre = p.blocs.map((b) => b.nature);
  assert.ok(ordre.indexOf('REMEDIATION') < ordre.indexOf('NEW'));
  assert.ok(ordre.indexOf('REVIEW') < ordre.indexOf('NEW'));
});

test('V75 · CP11 — ce qui ne rentre pas est RÉDUIT ou DIFFÉRÉ, pas tronqué en silence', () => {
  const p = planUnifie({
    mode: 'CATCH_UP', chargeHaut: 290, demande: { REVIEW: 60, REMEDIATION: 30 },
    arriere: A({ total: 40 }), pression: P({ echecsNonRepris: 5 }),
  });
  const ajustes = p.blocs.filter((b) => b.statut !== 'inclus');
  assert.ok(ajustes.length > 0, 'un budget insuffisant doit produire des ajustements');
  for (const b of ajustes) {
    assert.ok(STATUTS_BLOC.includes(b.statut), `statut inconnu : ${b.statut}`);
    assert.ok(b.pourquoi && b.pourquoi.length > 10, `${b.nature} ajusté sans raison`);
  }
  assert.equal(p.modifie, true);
});

test('V75 · CP11 — en NORMAL sans arriéré, le plan ne modifie RIEN', () => {
  const p = planUnifie({
    mode: 'NORMAL', chargeHaut: 200, demande: { REVIEW: 20 },
    arriere: A(), pression: P(),
  });
  assert.equal(p.modifie, false);
  assert.equal(p.explications.length, 0);
});

// ── §11.3 · RECOMMANDER, PAS VERROUILLER ────────────────────────────────

test('V75 · CP11 — `CRITICAL` RECOMMANDE la pause, il ne la déclenche pas', () => {
  const p = planUnifie({
    mode: 'CRITICAL', chargeHaut: 200, demande: { REVIEW: 60, REMEDIATION: 12 },
    arriere: A({ total: 90 }), pression: P({ bloquantes: 7, minutesRequises: 400 }),
  });
  const nouveau = p.blocs.find((b) => b.nature === 'NEW');
  assert.equal(nouveau.statut, 'recommande-pause');
  assert.ok(nouveau.minutes > 0, 'le nouveau contenu n’est pas retiré : il est seulement discuté');
  assert.match(nouveau.pourquoi, /propose|pas à ta place/);
});

test('V75 · CP11 — aucun module du plan ne suspend le curriculum de lui-même', () => {
  // §1.5 et §11.3 : seule la commande déclenchée par l'apprenant le fait.
  for (const f of ['lib/plan-unifie.mjs', 'lib/plan-unifie-server.ts', 'app/day/[id]/DayPlanUnifie.tsx']) {
    assert.doesNotMatch(code(f), /SET_CURRICULUM_PAUSE/, `${f} ne doit pas suspendre le parcours`);
  }
});

test('V75 · CP11 — le transfert est SUSPENDU en récupération, et le dit', () => {
  for (const mode of ['RECOVERY', 'CRITICAL']) {
    const p = planUnifie({
      mode, chargeHaut: 150, demande: { REVIEW: 40 }, minutesTransfert: 12,
      arriere: A({ total: 20 }), pression: P({ bloquantes: 4 }),
    });
    const t = p.blocs.find((b) => b.nature === 'TRANSFER');
    assert.equal(t.statut, 'suspendu');
    assert.equal(t.minutes, 0);
  }
  const n = planUnifie({
    mode: 'NORMAL', chargeHaut: 150, demande: { REVIEW: 20 }, minutesTransfert: 12,
    arriere: A(), pression: P(),
  });
  assert.equal(n.blocs.find((b) => b.nature === 'TRANSFER')?.statut, 'inclus');
});

// ── §11.4 · TOTAL / ACTIVE / PARKED ─────────────────────────────────────

test('V75 · CP11 — les trois nombres traversent le plan SANS être agrégés', () => {
  const p = planUnifie({
    mode: 'RECOVERY', chargeHaut: 200, demande: { REVIEW: 40 },
    arriere: A({ total: 78, actif: 2, differe: 12, gare: 64 }), pression: P({ bloquantes: 4 }),
  });
  assert.deepEqual(p.arriere, { total: 78, actif: 2, differe: 12, gare: 64 });
  assert.equal(p.arriere.actif + p.arriere.differe + p.arriere.gare, p.arriere.total);
  // Et aucun champ agrégé n'apparaît.
  assert.ok(!('backlog' in p), 'un nombre unique effacerait la distinction');
});

test('V75 · CP11 — `PARKED` n’est jamais présenté comme acquis', () => {
  const src = code('app/day/[id]/DayPlanUnifie.tsx');
  assert.match(src, /arriere\.gare/, 'le garage doit être affiché');
  assert.match(src, /n’est pas maîtris|ne veut pas dire « acquise »/,
    'la surface doit dire que « en attente » n’est pas « acquise »');
});

// ── §11.5 · L'EXPLICATION, EN LANGAGE HUMAIN ────────────────────────────

test('V75 · CP11 — la phrase attendue par le brief est produite', () => {
  // « Tu as trois notions bloquantes… Le nouveau contenu est réduit
  //   aujourd'hui pour laisser 35 minutes à leur réactivation. »
  // Charge 290 + révision 35 = 325 > 300 : le nouveau contenu est donc
  // réellement rogné. À 265 + 35 = 300 il tiendrait pile, et la phrase
  // n'aurait pas lieu d'être — mon premier jeu de nombres testait un cas où
  // rien n'était coupé.
  const p = planUnifie({
    mode: 'RECOVERY', chargeHaut: 290, demande: { REVIEW: 35 },
    arriere: A({ total: 30 }), pression: P({ bloquantes: 3 }),
  });
  const phrase = p.explications.join(' ');
  assert.match(phrase, /3 notions en retard dont la suite du parcours dépend/);
  assert.match(phrase, /nouveau contenu est réduit/);
  assert.match(phrase, /35 minutes/);
});

test('V75 · CP11 — aucune explication ne contient de jargon moteur', () => {
  // Interdit nommé : « recoveryPressure=0.82 ».
  for (const mode of ['CATCH_UP', 'RECOVERY', 'CRITICAL']) {
    const p = planUnifie({
      mode, chargeHaut: 280, demande: { REVIEW: 60, REMEDIATION: 20 }, minutesTransfert: 12,
      arriere: A({ total: 50, gare: 20 }), pression: P({ bloquantes: 4, echecsNonRepris: 3 }),
    });
    const t = [...p.explications, ...p.blocs.map((b) => b.pourquoi)].join(' ');
    assert.ok(!/recoveryPressure|pressure=|score|decay|percentile|RECOVERY|CRITICAL|CATCH_UP|PARKED/i.test(t),
      `jargon dans « ${t.slice(0, 120)} »`);
  }
});

test('V75 · CP11 — chaque bloc modifié porte sa raison', () => {
  const p = planUnifie({
    mode: 'CRITICAL', chargeHaut: 295, demande: { REVIEW: 60, REMEDIATION: 20 }, minutesTransfert: 12,
    arriere: A({ total: 100, gare: 60 }), pression: P({ bloquantes: 8 }),
  });
  for (const b of p.blocs) {
    assert.ok(b.pourquoi && b.pourquoi.length > 10, `${b.nature} sans raison`);
  }
  assert.ok(p.explications.length > 0, 'un plan modifié sans explication est incontestable');
});

// ── DÉTERMINISME ────────────────────────────────────────────────────────

test('V75 · CP11 — deux appels identiques rendent le même plan', () => {
  const args = {
    mode: 'RECOVERY', chargeHaut: 240, demande: { REVIEW: 40, REMEDIATION: 12 },
    arriere: A({ total: 30, actif: 5, differe: 10, gare: 15 }), pression: P({ bloquantes: 3 }),
  };
  assert.deepEqual(planUnifie(args), planUnifie(args));
});

test('V75 · CP11 — les cinq natures sont déclarées en un seul endroit', () => {
  assert.deepEqual(NATURES, ['NEW', 'REVIEW', 'REMEDIATION', 'TRANSFER', 'PROJECT']);
  assert.equal(BUDGET_JOURNEE.haut, 300, 'le budget de V73 n’est pas renégocié ici');
});

// ── §11.6 · LE BRANCHEMENT SUR LE PRODUIT RÉEL ──────────────────────────

test('V75 · CP11 — le plan unique atteint la PAGE D’UNE JOURNÉE', () => {
  // C'est l'exigence du brief, et c'est celle que V74 avait payée au prix fort.
  // Un moteur qui n'influence pas la page où l'on travaille n'influence rien.
  const page = code('app/day/[id]/page.tsx');
  assert.match(page, /=\s*getPlanUnifie\(/, 'la page d’une journée doit consommer le plan unique');
  assert.match(page, /<DayPlanUnifie/, 'et l’afficher');
  assert.match(page, /getPlanUnifie\(new Date\(\)\.toISOString\(\), dayNum\)/,
    'le plan doit porter sur la journée OUVERTE, pas sur une autre');
});

test('V75 · CP11 — le read-model consomme les moteurs existants, sans redécider', () => {
  const src = code('lib/plan-unifie-server.ts');
  for (const dep of ['getPlanDuJour', 'getVueArriere', 'getVueRecuperation', 'getPositionApprenant']) {
    assert.ok(src.includes(dep), `le read-model doit consommer ${dep}`);
  }
  // Il ne redéclare aucun seuil : une couche d'assemblage qui décide devient un
  // sixième moteur, et deux moteurs finissent par se contredire (audit CP8).
  assert.doesNotMatch(src, /SEUILS|PART_REVISION|HORIZON_ESSENTIEL\s*=/,
    'le read-model ne doit redéfinir aucun seuil');
});

test('V75 · CP11 — la surface ne RETIRE aucune section de la journée', () => {
  // §11.3 : recommander, pas verrouiller. Le contenu reste entièrement monté.
  const page = code('app/day/[id]/page.tsx');
  assert.match(page, /dangerouslySetInnerHTML=\{\{ __html: split\.read \}\}/,
    'la lecture de la journée doit rester intégralement montée');
  const panneau = code('app/day/[id]/DayPlanUnifie.tsx');
  assert.match(panneau, /rien n’a été retiré/, 'la surface doit le dire explicitement');
  assert.doesNotMatch(panneau, /disabled|verrou|bloqu(é|er)\b/i);
});

test('V75 · CP11 — la surface montre le budget ET ce qui n’a pas tenu', () => {
  const p = code('app/day/[id]/DayPlanUnifie.tsx');
  assert.match(p, /\{plan\.budget\.accorde\}/);
  assert.match(p, /\{plan\.budget\.journee\}/);
  assert.match(p, /\{plan\.budget\.nonPlacees\}/);
  assert.match(p, /ne rallonge jamais ta journée/);
});
