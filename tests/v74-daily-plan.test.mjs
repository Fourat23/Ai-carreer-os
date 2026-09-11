// V74 · CP10 — l'arbitrage du budget de journée.
//
// Ce que ces tests gardent avant tout : **le plan n'ajoute JAMAIS de minutes à
// une journée qui dépasse déjà son budget.** C'est le contournement G12 sous sa
// forme la plus tentante — ajouter 20 minutes de rappel partout ferait monter
// tous les compteurs de révision sans que personne ne révise mieux.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BUDGET_JOURNEE, BUDGET_SEMAINE, CIBLE_REACTIVATION, REPORT_MAX_PAR_JOUR,
  SEUIL_ALERTE_ARRIERE, PLANCHER_JOURNEE_CHARGEE,
  budgetReactivationDe, repartirLaSemaine, signalDeCharge, planDuJour,
} from '../lib/daily-plan.mjs';

const NOW = '2026-06-01T00:00:00.000Z';

// ── L'INTERDICTION CENTRALE ──────────────────────────────────────────────

test('V74 · CP10 — une journée déjà au-dessus du budget reçoit ZÉRO minute', () => {
  for (const charge of [301, 331, 341]) {
    const b = budgetReactivationDe(charge);
    assert.equal(b.minutes, PLANCHER_JOURNEE_CHARGEE, `charge ${charge} a reçu ${b.minutes} min`);
    assert.match(b.motif, /aucune réactivation/);
  }
});

test('V74 · CP10 — le total journée + réactivation ne dépasse JAMAIS le budget par la faute du plan', () => {
  // Sur toute la plage de charges possibles, la réactivation accordée ne doit
  // jamais faire franchir le plafond à une journée qui ne le franchissait pas.
  for (let charge = 0; charge <= 340; charge += 5) {
    const b = budgetReactivationDe(charge);
    if (charge <= BUDGET_JOURNEE.haut) {
      assert.ok(charge + b.minutes <= BUDGET_JOURNEE.haut,
        `charge ${charge} + ${b.minutes} dépasse ${BUDGET_JOURNEE.haut}`);
    } else {
      assert.equal(b.minutes, 0, `charge ${charge} déjà hors budget a reçu ${b.minutes} min`);
    }
  }
});

test('V74 · CP10 — zéro minute ne convoque pas le scheduler et ne propose pas « une petite révision quand même »', () => {
  let appele = false;
  const p = planDuJour({
    fiches: [{ id: 'a' }], chargeHaut: 331, now: NOW,
    planifierAvec: () => { appele = true; return { items: [{ id: 'a' }] }; },
  });
  assert.equal(appele, false);
  assert.deepEqual(p.seance.items, []);
  assert.equal(p.reactivation.minutesAccordees, 0);
});

// ── LE REPORT ────────────────────────────────────────────────────────────

test('V74 · CP10 — ce qu’une journée chargée ne prend pas est proposé plus tard dans la semaine', () => {
  const semaine = [
    { jour: 1, chargeHaut: 331 },   // rien
    { jour: 2, chargeHaut: 150 },   // de la marge : doit absorber
    ...Array.from({ length: 5 }, (_, i) => ({ jour: i + 3, chargeHaut: 200 })),
  ];
  const r = repartirLaSemaine(semaine);
  assert.equal(r.jours[0].minutes, 0);
  assert.ok(r.jours[1].minutes > CIBLE_REACTIVATION,
    `la journée légère aurait dû absorber un report, elle a ${r.jours[1].minutes} min`);
});

test('V74 · CP10 — le report est PLAFONNÉ : une séance de rappel ne devient pas une punition', () => {
  const semaine = [
    ...Array.from({ length: 6 }, (_, i) => ({ jour: i + 1, chargeHaut: 331 })),
    { jour: 7, chargeHaut: 60 },
  ];
  const r = repartirLaSemaine(semaine);
  assert.ok(r.jours[6].minutes <= CIBLE_REACTIVATION + REPORT_MAX_PAR_JOUR,
    `la dernière journée a reçu ${r.jours[6].minutes} min de rappel`);
});

test('V74 · CP10 — le report ne traverse PAS la semaine : il ne devient pas une dette qui grossit', () => {
  const chargee = Array.from({ length: 7 }, (_, i) => ({ jour: i + 1, chargeHaut: 331 }));
  const r1 = repartirLaSemaine(chargee);
  const r2 = repartirLaSemaine(chargee);
  // Deux semaines identiques donnent le même résultat : rien n'est mémorisé
  // d'une semaine à l'autre.
  assert.deepEqual(r1.jours, r2.jours);
  assert.ok(r1.semaine.minutesNonPlacees > 0, 'des minutes doivent être déclarées NON PLACÉES, pas empilées');
});

// ── LA SEMAINE SURCHARGÉE EST SIGNALÉE, PAS CORRIGÉE ────────────────────

test('V74 · CP10 — une semaine excédentaire est DÉCLARÉE, et le curriculum n’est pas touché', () => {
  const semaine = Array.from({ length: 7 }, (_, i) => ({ jour: i + 1, chargeHaut: 330 }));
  const r = repartirLaSemaine(semaine);
  assert.equal(r.semaine.surchargee, true);
  assert.equal(r.semaine.excedent, 7 * 330 - BUDGET_SEMAINE);
  // Et surtout : les 7 journées sont toujours là. Rien n'a été supprimé.
  assert.equal(r.jours.length, 7);
});

// ── LE SIGNAL DE RALENTISSEMENT ─────────────────────────────────────────

test('V74 · CP10 — sous le seuil, aucun signal : on n’inquiète pas pour rien', () => {
  const s = signalDeCharge({ arriere: SEUIL_ALERTE_ARRIERE - 1, tendance: 5 });
  assert.equal(s.niveau, 'ok');
  assert.equal(s.message, null);
});

test('V74 · CP10 — un arriéré qui CROÎT propose de ralentir ; un arriéré stable ne le propose pas', () => {
  const croit = signalDeCharge({ arriere: 40, tendance: 8 });
  assert.equal(croit.niveau, 'ralentir');
  assert.match(croit.proposition, /consolider/i);

  const stable = signalDeCharge({ arriere: 40, tendance: 0 });
  assert.equal(stable.niveau, 'vigilance');
  assert.doesNotMatch(stable.proposition ?? '', /consolider/i);
});

test('V74 · CP10 — le signal PROPOSE, il ne décide pas : rien n’est sauté automatiquement', () => {
  const s = signalDeCharge({ arriere: 60, tendance: 12 });
  assert.match(s.proposition, /c’est toi qui décides|le programme ne saute rien/i);
});

test('V74 · CP10 — aucun message n’expose un score chiffré à l’apprenant (§9 du contrat)', () => {
  for (const a of [0, 25, 40, 100]) {
    const s = signalDeCharge({ arriere: a, tendance: 3 });
    for (const txt of [s.message, s.proposition]) {
      if (txt) assert.doesNotMatch(txt, /0[.,]\d{2,}|score|probabilit/i, `« ${txt} »`);
    }
  }
});

// ── DÉTERMINISME ET DÉLÉGATION ──────────────────────────────────────────

test('V74 · CP10 — B2 : à entrée identique, sortie strictement identique', () => {
  const args = { fiches: [], chargeHaut: 180, arriere: 30, tendance: 4, now: NOW };
  assert.deepEqual(planDuJour(args), planDuJour(args));
});

test('V74 · CP10 — le module n’ordonnance rien lui-même : il budgète et délègue', () => {
  let recu = null;
  planDuJour({
    fiches: [{ id: 'a' }], chargeHaut: 200, now: NOW,
    planifierAvec: (f, o) => { recu = o; return { items: [] }; },
  });
  assert.ok(recu, 'le scheduler doit être appelé');
  assert.equal(recu.budgetMinutes, budgetReactivationDe(200).minutes);
  assert.equal(recu.now, NOW);
});

test('V74 · CP10 — charge inconnue : budget nominal, jamais zéro par défaut', () => {
  // Ne pas connaître la charge ne doit pas faire disparaître la réactivation —
  // ce serait confondre « pas de donnée » et « journée pleine » (G9).
  const b = budgetReactivationDe(null);
  assert.equal(b.minutes, CIBLE_REACTIVATION);
  assert.match(b.motif, /inconnue/);
});
