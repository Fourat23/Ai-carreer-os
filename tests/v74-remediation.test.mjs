// V74 · CP7 — le moteur de remédiation.
//
// Ce que ces tests gardent, avant toute autre chose : **la correction complète
// n'est jamais la première réponse**, et aucun chemin — y compris un repli
// pour matière manquante — ne permet d'y arriver avant le niveau 5.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIONS, MINUTES_PAR_ACTION, FENETRE_MASSAGE_MIN, ECHECS_MASSES,
  NIVEAU_CORRECTION, DELAI_REPRISE_HEURES,
  serieEchecs, plusSimpleParmi, remedier, prochaineMarche,
} from '../lib/remediation.mjs';

const SECTIONS_COMPLETES = {
  modeleMental: true, erreurs: true, antipatterns: true,
  exempleGuide: true, exempleApplique: true, correction: true,
};

let horloge = 0;
const echec = (passed = 0, { total = 3, phase = 'run', minutesApres = 60, correctionSeen = false } = {}) => {
  horloge += minutesApres * 60_000;
  return {
    exerciseId: 'ex-1', at: new Date(horloge).toISOString(),
    passed, total, phase, outcome: phase !== 'run' ? 'failure' : (passed >= total ? 'success' : passed > 0 ? 'partial' : 'failure'),
    correctionSeen, provenance: { producer: 'test', method: '' },
  };
};
const succes = (opts) => echec(3, { total: 3, ...opts });

const remedierDe = (attempts, extra = {}) => remedier({
  attempts, exerciseId: 'ex-1', now: new Date(horloge).toISOString(),
  sections: SECTIONS_COMPLETES, testsEchoues: [{ name: 'le cas vide renvoie 0' }],
  ...extra,
});

// ── L'INTERDICTION CENTRALE ──────────────────────────────────────────────

test('la correction complète n’est JAMAIS la réponse au premier échec', () => {
  const r = remedierDe([echec(0)]);
  assert.notEqual(r.action, 'CORRECTION_COMPLETE');
  assert.equal(r.niveau, 1);
});

test('aucun niveau strictement inférieur à 5 ne peut rendre la correction, quelles que soient les ressources absentes', () => {
  // On retire TOUTE la matière : pas de sections, pas de misconception, pas de
  // voisin, pas de tests nommés. Le repli ne doit toujours pas ouvrir la réponse.
  for (let n = 1; n < NIVEAU_CORRECTION; n += 1) {
    horloge = 0;
    const attempts = Array.from({ length: n }, () => echec(0));
    const r = remedier({
      attempts, exerciseId: 'ex-1', now: new Date(horloge).toISOString(),
      sections: {}, testsEchoues: [], misconception: null, voisinPlusSimple: null,
    });
    assert.notEqual(r.action, 'CORRECTION_COMPLETE', `niveau ${n} a ouvert la correction par repli`);
  }
});

test('la correction arrive au niveau 5, et elle demande de réécrire de mémoire', () => {
  horloge = 0;
  const r = remedierDe(Array.from({ length: 5 }, () => echec(0)));
  assert.equal(r.action, 'CORRECTION_COMPLETE');
  assert.equal(r.niveau, 5);
  assert.match(r.consigne, /de mémoire/i);
  assert.equal(r.prochaine, null);
});

// ── L'ÉCHELLE NOMINALE ───────────────────────────────────────────────────

test('premier échec avec des tests qui passent → sous-problème nommant un test RÉEL', () => {
  horloge = 0;
  const r = remedierDe([echec(2)]);
  assert.equal(r.action, 'SOUS_PROBLEME');
  assert.match(r.consigne, /le cas vide renvoie 0/);
  assert.deepEqual(r.pointeur, { kind: 'test', ref: 'le cas vide renvoie 0' });
});

test('premier échec avec zéro test qui passe → retour au modèle mental', () => {
  horloge = 0;
  const r = remedierDe([echec(0)]);
  assert.equal(r.action, 'MODELE_MENTAL');
  assert.equal(r.pointeur.ref, 'Modèle mental');
});

test('deuxième échec → indice ; la misconception enregistrée est PRÉFÉRÉE à la section', () => {
  horloge = 0;
  const sans = remedierDe([echec(0), echec(0)]);
  assert.equal(sans.action, 'INDICE');
  assert.equal(sans.pointeur.kind, 'section');

  horloge = 0;
  const avec = remedierDe([echec(0), echec(0)], {
    misconception: { id: 'index-speeds-everything', right: 'Un index n’accélère pas toutes les requêtes.' },
  });
  assert.equal(avec.action, 'INDICE');
  assert.equal(avec.pointeur.kind, 'misconception');
  assert.match(avec.consigne, /n’accélère pas toutes les requêtes/);
});

test('troisième échec SANS progression → exemple analogue', () => {
  horloge = 0;
  const r = remedierDe([echec(0), echec(0), echec(0)]);
  assert.equal(r.action, 'EXEMPLE_ANALOGUE');
  assert.equal(r.pointeur.ref, 'Exemple guidé');
});

test('troisième échec AVEC progression → on ne redescend pas l’échelle, on refocalise', () => {
  horloge = 0;
  const r = remedierDe([echec(0), echec(1), echec(2)]);
  assert.equal(r.action, 'SOUS_PROBLEME');
  assert.match(r.raison, /progresse/);
});

test('quatrième échec → un exercice plus simple RÉEL, jamais inventé', () => {
  horloge = 0;
  const r = remedierDe(Array.from({ length: 4 }, () => echec(0)), {
    voisinPlusSimple: { id: 'sql-inner-join', title: 'Jointure interne' },
  });
  assert.equal(r.action, 'EXERCICE_PLUS_SIMPLE');
  assert.deepEqual(r.pointeur, { kind: 'exercise', ref: 'sql-inner-join' });

  // Sans voisin (45 exercices sur 376), on replie — et surtout PAS vers la réponse.
  horloge = 0;
  const sans = remedierDe(Array.from({ length: 4 }, () => echec(0)), { voisinPlusSimple: null });
  assert.notEqual(sans.action, 'CORRECTION_COMPLETE');
  assert.match(sans.raison, /repli/);
});

// ── LES TROIS DÉROGATIONS ────────────────────────────────────────────────

test('D1 · un échec de compilation ne fait PAS monter l’échelle', () => {
  horloge = 0;
  const attempts = [echec(0, { phase: 'compile' }), echec(0, { phase: 'compile' }), echec(0, { phase: 'compile' })];
  assert.equal(serieEchecs(attempts, 'ex-1').niveau, 0);
  const r = remedierDe(attempts);
  assert.equal(r.action, 'INDICE');
  assert.equal(r.niveau, 0);
  assert.match(r.raison, /ne dit rien de la notion/);
});

test('D1 · trois échecs de compilation suivis d’un vrai échec restent au niveau 1', () => {
  horloge = 0;
  const r = remedierDe([echec(0, { phase: 'timeout' }), echec(0, { phase: 'compile' }), echec(0)]);
  assert.equal(r.niveau, 1);
  assert.notEqual(r.action, 'CORRECTION_COMPLETE');
});

test('D2 · la correction déjà vue ferme l’échelle et rend une reprise différée', () => {
  horloge = 0;
  const r = remedierDe([echec(0, { correctionSeen: true })]);
  assert.equal(r.action, 'TENTATIVE_DIFFEREE');
  assert.match(r.raison, /R-b/);
  assert.equal(
    r.reprendreApres,
    new Date(horloge + DELAI_REPRISE_HEURES * 3600_000).toISOString(),
  );
});

test('D3 · quatre échecs en moins de vingt minutes → on arrête la séance', () => {
  horloge = 0;
  const serres = Array.from({ length: ECHECS_MASSES }, () => echec(0, { minutesApres: 3 }));
  const r = remedierDe(serres);
  assert.equal(r.action, 'TENTATIVE_DIFFEREE');
  assert.match(r.raison, /massés/);
});

test('D3 · les mêmes quatre échecs ESPACÉS suivent l’échelle normale', () => {
  horloge = 0;
  const espaces = Array.from({ length: ECHECS_MASSES }, () => echec(0, { minutesApres: FENETRE_MASSAGE_MIN + 5 }));
  const r = remedierDe(espaces, { voisinPlusSimple: { id: 'x', title: 'X' } });
  assert.equal(r.action, 'EXERCICE_PLUS_SIMPLE');
});

test('D3 · le report ne devient jamais un moyen de ne jamais donner la réponse', () => {
  horloge = 0;
  // Sept échecs serrés : le pilonnage est maximal, mais l'échelle est au bout.
  const r = remedierDe(Array.from({ length: 7 }, () => echec(0, { minutesApres: 2 })));
  assert.equal(r.action, 'CORRECTION_COMPLETE');
});

// ── LA SÉRIE ─────────────────────────────────────────────────────────────

test('un succès remet le compteur à zéro : l’échelle mesure un blocage, pas un casier', () => {
  horloge = 0;
  const s = serieEchecs([echec(0), echec(0), echec(0), succes(), echec(1)], 'ex-1');
  assert.equal(s.niveau, 1);
});

test('les tentatives d’un AUTRE exercice n’entrent pas dans la série', () => {
  horloge = 0;
  const a = [echec(0), echec(0)];
  const autre = { ...echec(0), exerciseId: 'ex-2' };
  assert.equal(serieEchecs([...a, autre], 'ex-1').niveau, 2);
  assert.equal(serieEchecs([...a, autre], 'ex-2').niveau, 1);
});

// ── LE VOISIN PLUS SIMPLE ────────────────────────────────────────────────

test('le voisin retenu est la PLUS PETITE marche qui descende, pas le plus facile', () => {
  const ex = { id: 'e', difficulty: 4, skills: ['sql'] };
  const v = plusSimpleParmi([
    { id: 'tres-facile', difficulty: 1, skills: ['sql'] },
    { id: 'juste-en-dessous', difficulty: 3, skills: ['sql'] },
    { id: 'trop-dur', difficulty: 5, skills: ['sql'] },
    { id: 'autre-notion', difficulty: 2, skills: ['dl'] },
  ], ex);
  assert.equal(v.id, 'juste-en-dessous');
});

test('à difficulté égale, le voisin partageant le plus de compétences gagne ; l’identifiant tranche', () => {
  const ex = { id: 'e', difficulty: 3, skills: ['sql', 'archi'] };
  const v = plusSimpleParmi([
    { id: 'b', difficulty: 2, skills: ['sql'] },
    { id: 'a', difficulty: 2, skills: ['sql', 'archi'] },
  ], ex);
  assert.equal(v.id, 'a');

  const ex2 = { id: 'e', difficulty: 3, skills: ['sql'] };
  const v2 = plusSimpleParmi([
    { id: 'zzz', difficulty: 2, skills: ['sql'] },
    { id: 'aaa', difficulty: 2, skills: ['sql'] },
  ], ex2);
  assert.equal(v2.id, 'aaa');
});

test('aucun voisin plus simple → null, jamais un exercice inventé', () => {
  assert.equal(plusSimpleParmi([{ id: 'x', difficulty: 3, skills: ['sql'] }], { id: 'e', difficulty: 1, skills: ['sql'] }), null);
  assert.equal(plusSimpleParmi([], { id: 'e', difficulty: 5, skills: ['sql'] }), null);
});

// ── B2 · DÉTERMINISME ────────────────────────────────────────────────────

test('B2 · à entrée identique, sortie STRICTEMENT identique', () => {
  horloge = 0;
  const a = [echec(0), echec(1), echec(1)];
  const args = { attempts: a, exerciseId: 'ex-1', now: '2026-03-01T10:00:00.000Z', sections: SECTIONS_COMPLETES, testsEchoues: [{ name: 't' }] };
  assert.deepEqual(remedier(args), remedier(args));
});

test('B2 · aucune horloge implicite : sans `now`, aucune date n’est fabriquée', () => {
  horloge = 0;
  const r = remedier({ attempts: [echec(0, { correctionSeen: true })], exerciseId: 'ex-1', sections: SECTIONS_COMPLETES });
  assert.equal(r.action, 'TENTATIVE_DIFFEREE');
  assert.equal(r.reprendreApres, null);
});

// ── B10 · EXPLICABILITÉ ──────────────────────────────────────────────────

test('B10 · toute décision porte une raison lisible, un pointeur et un coût', () => {
  horloge = 0;
  for (let n = 1; n <= 6; n += 1) {
    horloge = 0;
    const r = remedierDe(Array.from({ length: n }, () => echec(0, { minutesApres: 120 })), {
      voisinPlusSimple: { id: 'v', title: 'V' },
    });
    assert.ok(ACTIONS.includes(r.action), `action inconnue au niveau ${n}`);
    assert.ok(typeof r.raison === 'string' && r.raison.length > 10, `raison vide au niveau ${n}`);
    assert.ok(r.pointeur && typeof r.pointeur.kind === 'string', `pointeur absent au niveau ${n}`);
    assert.equal(r.minutes, MINUTES_PAR_ACTION[r.action]);
  }
});

test('la consigne ne montre JAMAIS un score chiffré à l’apprenant (§9 du contrat)', () => {
  horloge = 0;
  for (let n = 1; n <= 6; n += 1) {
    horloge = 0;
    const r = remedierDe(Array.from({ length: n }, () => echec(0, { minutesApres: 120 })), { voisinPlusSimple: { id: 'v', title: 'V' } });
    assert.doesNotMatch(r.consigne, /0[.,]\d{2,}|score/i, `un score apparaît au niveau ${n}`);
  }
});

// ── CP13 · PAS DE BOUCLE, PAS DE TROU ────────────────────────────────────

test('aucun échec ne reste sans réponse : les sept actions sont couvertes et rien ne rend `undefined`', () => {
  horloge = 0;
  const vues = new Set();
  const cas = [
    [[echec(2)], {}],
    [[echec(0)], {}],
    [[echec(0), echec(0)], {}],
    [[echec(0), echec(0), echec(0)], {}],
    [Array.from({ length: 4 }, () => echec(0, { minutesApres: 120 })), { voisinPlusSimple: { id: 'v', title: 'V' } }],
    [Array.from({ length: 5 }, () => echec(0, { minutesApres: 120 })), {}],
    [[echec(0, { correctionSeen: true })], {}],
  ];
  for (const [a, extra] of cas) {
    horloge = 0;
    const r = remedierDe(a, extra);
    assert.ok(r && ACTIONS.includes(r.action));
    vues.add(r.action);
  }
  assert.equal(vues.size, 7, `actions non atteintes : ${ACTIONS.filter((x) => !vues.has(x)).join(', ')}`);
});

test('aucune tentative observée → `null`, et non « tout va bien » (G9)', () => {
  assert.equal(remedier({ attempts: [], exerciseId: 'ex-1' }), null);
  horloge = 0;
  assert.equal(remedier({ attempts: [succes()], exerciseId: 'ex-1' }), null);
});

test('`prochaineMarche` annonce toujours une marche PLUS assistée, jusqu’à la correction', () => {
  assert.equal(prochaineMarche(1), 'INDICE');
  assert.equal(prochaineMarche(2), 'EXEMPLE_ANALOGUE');
  assert.equal(prochaineMarche(3), 'EXERCICE_PLUS_SIMPLE');
  assert.equal(prochaineMarche(4), 'CORRECTION_COMPLETE');
  assert.equal(prochaineMarche(9), 'CORRECTION_COMPLETE');
});
