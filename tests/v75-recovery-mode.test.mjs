// V75 · CP6 — MODE DE RÉCUPÉRATION : recommander, jamais imposer.
//
// Ce que ces tests gardent :
//   · les **seuils du §3 sont ceux du contrat gelé**, écrits avant la première
//     mesure. Les ajuster après avoir vu les chiffres du CP5 serait `R7` ;
//   · **le déclencheur principal est `bloquantes`, pas le volume** — un
//     apprenant avec 60 notions en retard dont rien ne dépend n'est pas en
//     difficulté, et le punir serait `R11` ;
//   · **la récupération ne crée jamais de minutes** : `propose.total ≤
//     actuel.total`, toujours. C'est le critère bloquant `V12` ;
//   · **rien n'est jamais appliqué d'office** : `applique: false`, et il existe
//     toujours un choix « ne rien changer » ;
//   · `E4` empêche l'annonce d'une sortie qui ne tient qu'un jour.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  MODES, SEUILS, SORTIE, PART_REVISION, modeDe, conditionsDeSortie,
  arbitrerLaJournee, recommandationDe, phraseDuMode,
} from '../lib/recovery-mode.mjs';
import { CIBLE_REACTIVATION } from '../lib/daily-plan.mjs';

const lire = (p) => (existsSync(join(process.cwd(), p)) ? readFileSync(join(process.cwd(), p), 'utf8') : '');
const P = (o = {}) => ({
  bloquantes: 0, echecsNonRepris: 0, volume: 0, minutesRequises: 0, anciennete: 0, ...o,
});
const BUDGET = CIBLE_REACTIVATION;
/** Une pression « propre » au jour actif précédent : E4 satisfaite. */
const HIER_OK = P();

// ── LES SEUILS SONT CEUX DU CONTRAT, PAS D'AUTRES ───────────────────────

test('V75 · CP6 — les seuils gelés au §3 sont exactement ceux du contrat', () => {
  assert.deepEqual(SEUILS.CATCH_UP, { bloquantes: 1, echecsNonRepris: 3 });
  assert.deepEqual(SEUILS.RECOVERY, { bloquantes: 3, facteurMinutes: 3 });
  assert.deepEqual(SEUILS.CRITICAL, { bloquantes: 6, facteurMinutes: 6 });
  assert.deepEqual(SORTIE, { bloquantes: 0, echecsNonRepris: 2, facteurMinutes: 2, joursActifs: 2 });
  assert.deepEqual(MODES, ['NORMAL', 'CATCH_UP', 'RECOVERY', 'CRITICAL']);
});

test('V75 · CP6 — le document gelé et le code déclarent les MÊMES seuils', () => {
  // Un contrat qui diverge du code ne protège plus rien.
  const doc = lire('docs/v75/V75-RECOVERY-CONTRACT-FROZEN.md');
  assert.ok(doc, 'le contrat gelé est introuvable');
  assert.match(doc, /bloquantes ≥ 1\*\* \*\*ou\*\* `echecsNonRepris ≥ 3`|`bloquantes ≥ 1`/);
  assert.match(doc, /`bloquantes ≥ 3`/);
  assert.match(doc, /`bloquantes ≥ 6`/);
  assert.match(doc, /HORIZON_ESSENTIEL = 14/);
});

// ── LE DÉCLENCHEUR EST `bloquantes`, PAS LE VOLUME ──────────────────────

test('V75 · CP6 — 60 notions en retard dont rien ne dépend NE déclenchent rien', () => {
  // §3 du contrat, raison écrite : « déclencher sur le volume punirait
  // l'apprenant en avance sur ses révisions » (R11).
  const r = modeDe(P({ volume: 60, minutesRequises: 20 }), { budget: BUDGET, pressionJourActifPrecedent: HIER_OK });
  assert.equal(r.mode, 'NORMAL');
});

test('V75 · CP6 — 4 notions prérequises de la semaine prochaine déclenchent, elles', () => {
  const r = modeDe(P({ volume: 4, bloquantes: 4 }), { budget: BUDGET, pressionJourActifPrecedent: HIER_OK });
  assert.equal(r.mode, 'RECOVERY');
  assert.match(r.regle, /bloquantes/);
});

test('V75 · CP6 — chaque seuil produit exactement son mode', () => {
  const m = (p) => modeDe(P(p), { budget: BUDGET, pressionJourActifPrecedent: HIER_OK }).mode;
  assert.equal(m({}), 'NORMAL');
  assert.equal(m({ bloquantes: 1 }), 'CATCH_UP');
  assert.equal(m({ echecsNonRepris: 3 }), 'CATCH_UP');
  assert.equal(m({ bloquantes: 3 }), 'RECOVERY');
  assert.equal(m({ minutesRequises: 3 * BUDGET }), 'RECOVERY');
  assert.equal(m({ bloquantes: 6 }), 'CRITICAL');
  assert.equal(m({ minutesRequises: 6 * BUDGET }), 'CRITICAL');
});

test('V75 · CP6 — juste SOUS un seuil, le mode ne bascule pas', () => {
  const m = (p) => modeDe(P(p), { budget: BUDGET, pressionJourActifPrecedent: HIER_OK }).mode;
  assert.equal(m({ echecsNonRepris: 2 }), 'NORMAL');
  assert.equal(m({ bloquantes: 2 }), 'CATCH_UP');
  assert.equal(m({ bloquantes: 5 }), 'RECOVERY');
  // Juste sous le seuil d'ENTRÉE en RECOVERY (3× budget), on n'y entre pas —
  // mais on ne revient pas non plus à NORMAL, parce que `E3` exige 2×. Ce
  // n'est pas un effet de bord : c'est la bande du §4, et elle est ce qui
  // empêche de ressortir à la minute où l'on vient d'entrer.
  assert.equal(m({ minutesRequises: 3 * BUDGET - 1 }), 'CATCH_UP');
  assert.equal(m({ minutesRequises: 2 * BUDGET }), 'NORMAL');
});

// ── `E4` · ANTI-OSCILLATION ─────────────────────────────────────────────

test('V75 · CP6 — une sortie qui ne tient qu’un jour n’est PAS annoncée', () => {
  // Sans E4, le produit annoncerait une bonne puis une mauvaise nouvelle en
  // alternance à qui traverse la frontière chaque jour.
  const hierMauvais = P({ bloquantes: 4 });
  const r = modeDe(P(), { budget: BUDGET, pressionJourActifPrecedent: hierMauvais });
  assert.equal(r.mode, 'CATCH_UP');
  assert.match(r.regle, /E4/);
  assert.equal(r.sortie.E4, false);
  assert.equal(r.sortie.confirmee, false);
});

test('V75 · CP6 — un maintien par `E4` le DIT, au lieu d’inventer une cause', () => {
  // La mesure du CP6 a montré le défaut : maintenu par E4, le profil K lisait
  // « plusieurs notions attendent » alors qu'il n'en avait plus aucune de
  // bloquante. La phrase décrivait une situation qui n'existait pas.
  const r = modeDe(P(), { budget: BUDGET, pressionJourActifPrecedent: P({ bloquantes: 4 }) });
  assert.equal(r.tenuParE4, true);
  assert.deepEqual(r.facteurs, [], 'aucun seuil n’est franchi aujourd’hui');
  assert.match(r.phrase, /vient d’être résorbé/);
  assert.doesNotMatch(r.phrase, /plusieurs notions attendent/);
});

test('V75 · CP6 — un mode déclenché par un vrai seuil n’est PAS marqué E4', () => {
  const r = modeDe(P({ bloquantes: 4 }), { budget: BUDGET, pressionJourActifPrecedent: HIER_OK });
  assert.equal(r.tenuParE4, false);
});

test('V75 · CP6 — la sortie tenue DEUX jours actifs est confirmée', () => {
  const r = modeDe(P(), { budget: BUDGET, pressionJourActifPrecedent: HIER_OK });
  assert.equal(r.mode, 'NORMAL');
  assert.equal(r.sortie.confirmee, true);
});

test('V75 · CP6 — sans jour actif précédent, il n’y a rien à confirmer', () => {
  // On ne peut pas échouer à sortir d'un mode où l'on n'est jamais entré.
  const r = modeDe(P(), { budget: BUDGET, pressionJourActifPrecedent: null });
  assert.equal(r.mode, 'NORMAL');
  assert.equal(r.sortie.E4, true);
});

test('V75 · CP6 — `E3` est plus STRICT que le seuil d’entrée : la bande existe', () => {
  // Entrée en RECOVERY à 3× le budget, sortie à 2×. Entre les deux, on n'entre
  // pas mais on ne sort pas non plus — c'est voulu, et c'est ce qui empêche de
  // ressortir à la minute où l'on vient d'entrer.
  const entre = P({ minutesRequises: 2.5 * BUDGET });
  const c = conditionsDeSortie(entre, BUDGET);
  assert.equal(c.E3, false, 'la sortie ne doit PAS être acquise dans la bande');
  assert.equal(modeDe(entre, { budget: BUDGET, pressionJourActifPrecedent: HIER_OK }).mode, 'CATCH_UP');
});

// ── LA RÉCUPÉRATION NE CRÉE JAMAIS DE MINUTES (V12) ─────────────────────

test('V75 · CP6 — `propose.total` n’excède JAMAIS `actuel.total`', () => {
  for (const mode of MODES) {
    for (const charge of [0, 60, 200, 290, 340]) {
      for (const minutesRequises of [0, 12, 60, 400]) {
        const a = arbitrerLaJournee({
          mode, chargeHaut: charge, minutesReactivation: 20,
          pression: P({ minutesRequises, echecsNonRepris: 2 }),
        });
        assert.ok(a.propose.total <= a.actuel.total,
          `${mode} · charge ${charge} · ${minutesRequises} min : ${a.propose.total} > ${a.actuel.total}`);
        assert.ok(a.propose.nouveau >= 0 && a.propose.revision >= 0);
      }
    }
  }
});

test('V75 · CP6 — ce que la révision gagne, le nouveau contenu le CÈDE', () => {
  const a = arbitrerLaJournee({
    mode: 'RECOVERY', chargeHaut: 200, minutesReactivation: 20,
    pression: P({ minutesRequises: 300 }),
  });
  assert.equal(a.ecart.total, 0, 'la journée ne doit ni rallonger ni raccourcir');
  assert.equal(a.ecart.revision, -a.ecart.nouveau);
  assert.ok(a.ecart.revision > 0, 'RECOVERY doit proposer plus de révision');
});

test('V75 · CP6 — on ne réserve jamais plus de révision qu’il n’y en a à faire', () => {
  // Réserver 60 minutes pour 12 minutes d'arriéré fabriquerait du travail.
  const a = arbitrerLaJournee({
    mode: 'CRITICAL', chargeHaut: 200, minutesReactivation: 20,
    pression: P({ minutesRequises: 12 }),
  });
  assert.ok(a.propose.revision <= 20, `révision proposée : ${a.propose.revision}`);
});

test('V75 · CP6 — en NORMAL, l’arbitrage ne propose RIEN', () => {
  const a = arbitrerLaJournee({ mode: 'NORMAL', chargeHaut: 200, minutesReactivation: 20, pression: P() });
  assert.deepEqual(a.ecart, { nouveau: 0, revision: 0, total: 0 });
  assert.deepEqual(a.recommandation.choix, []);
});

// ── RECOMMANDER, JAMAIS IMPOSER ─────────────────────────────────────────

test('V75 · CP6 — rien n’est jamais appliqué d’office', () => {
  for (const mode of MODES) {
    const a = arbitrerLaJournee({ mode, chargeHaut: 200, minutesReactivation: 20, pression: P({ minutesRequises: 200 }) });
    assert.equal(a.propose.applique, false, `${mode} applique sa proposition`);
    assert.equal(a.recommandation.impose, false, `${mode} impose sa recommandation`);
  }
});

test('V75 · CP6 — « ne rien changer » est TOUJOURS offert, et sans reproche', () => {
  for (const mode of ['CATCH_UP', 'RECOVERY', 'CRITICAL']) {
    const r = recommandationDe(mode, { supplement: 20, nouveauActuel: 200, nouveauPropose: 180 });
    assert.ok(r.choix.some((c) => c.id === 'garder'), `${mode} n’offre pas de garder le cap`);
    const texte = `${r.texte} ${r.choix.map((c) => `${c.libelle} ${c.effet}`).join(' ')}`;
    assert.ok(!/devrais|faute|échec de ta part|tu n’as pas|rattrape|obligatoire/i.test(texte),
      `ton culpabilisant dans ${mode} : ${texte}`);
  }
});

test('V75 · CP6 — `CRITICAL` RECOMMANDE la pause, il ne la déclenche pas', () => {
  // §1.4 : « Recommande. Jamais n'impose. » §1.5 : `PAUSED_CURRICULUM` est un
  // choix de l'apprenant, que le moteur ne peut qu'enregistrer.
  const a = arbitrerLaJournee({ mode: 'CRITICAL', chargeHaut: 200, minutesReactivation: 20, pression: P({ minutesRequises: 400 }) });
  assert.equal(a.propose.nouveau, 0, 'la proposition met bien le nouveau à zéro…');
  assert.equal(a.propose.applique, false, '…mais elle n’est pas appliquée');
  assert.ok(a.recommandation.choix.some((c) => c.id === 'pause'));
  assert.ok(a.recommandation.choix.some((c) => c.id === 'garder'));
});

test('V75 · CP6 — le transfert est suspendu quand les fondations ne tiennent pas', () => {
  const posture = (mode) => arbitrerLaJournee({ mode, chargeHaut: 200, minutesReactivation: 20, pression: P() });
  assert.equal(posture('NORMAL').transfert, 'propose');
  assert.equal(posture('CATCH_UP').transfert, 'propose');
  assert.equal(posture('RECOVERY').transfert, 'suspendu');
  assert.equal(posture('CRITICAL').transfert, 'suspendu');
  assert.equal(posture('CRITICAL').projet, 'reportable');
  assert.equal(posture('RECOVERY').projet, 'inchange');
});

test('V75 · CP6 — la remédiation se prend DANS la révision, elle ne s’y ajoute pas', () => {
  const a = arbitrerLaJournee({
    mode: 'CATCH_UP', chargeHaut: 200, minutesReactivation: 20,
    pression: P({ echecsNonRepris: 4, minutesRequises: 120 }),
  });
  assert.ok(a.propose.remediation > 0);
  assert.ok(a.propose.remediation <= a.propose.revision, 'la remédiation déborderait de la révision');
  assert.equal(a.propose.total, a.propose.nouveau + a.propose.revision, 'elle ne doit pas entrer dans le total');
});

// ── LA DÉCISION SE DIT EN UNE PHRASE, SANS JARGON ───────────────────────

test('V75 · CP6 — la décision tient en une phrase, avec au plus deux facteurs', () => {
  const r = modeDe(P({ bloquantes: 4, echecsNonRepris: 5, minutesRequises: 55, volume: 80 }),
    { budget: BUDGET, pressionJourActifPrecedent: HIER_OK });
  assert.ok(r.facteurs.length <= 2, 'au-delà de deux facteurs, une explication cesse d’en être une');
  assert.match(r.phrase, /4 notions/);
  assert.match(r.phrase, /5 tentatives/);
  assert.equal(r.phrase.split('.').filter((s) => s.trim()).length, 1);
});

test('V75 · CP6 — aucune phrase ne contient de jargon ni de score', () => {
  for (const mode of MODES) {
    const p = phraseDuMode(mode, [{ id: 'bloquantes', valeur: 3 }]);
    assert.ok(p && p.length > 10, `${mode} sans phrase`);
    assert.ok(!/score|decay|percentile|probabilit|RECOVERY|CATCH_UP|CRITICAL|backlog|pression/i.test(p),
      `jargon dans « ${p} »`);
  }
});

test('V75 · CP6 — un facteur n’est cité que s’il est réellement au-dessus du seuil', () => {
  // Citer « 1 échec non repris » pour justifier un mode déclenché par les
  // bloquantes ferait croire que cet échec compte dans la décision.
  const r = modeDe(P({ bloquantes: 4, echecsNonRepris: 1 }), { budget: BUDGET, pressionJourActifPrecedent: HIER_OK });
  assert.deepEqual(r.facteurs.map((f) => f.id), ['bloquantes']);
});

// ── DÉTERMINISME ET ABSENCE D'ÉTAT ──────────────────────────────────────

test('V75 · CP6 — le mode est une PROJECTION : aucun état n’est écrit', () => {
  // §1.2 : « un état DÉCLARÉ du plan, pas un état de l'apprenant ». Le stocker
  // le ferait survivre à la situation qui l'a produit.
  const src = lire('lib/recovery-mode.mjs');
  assert.doesNotMatch(src, /applyCommand|writeProgress|readProgress|require\(|node:fs/);
  const p = P({ bloquantes: 3 });
  const gele = Object.freeze({ ...p });
  modeDe(gele, { budget: BUDGET, pressionJourActifPrecedent: HIER_OK });
  assert.deepEqual(gele, p, 'la pression ne doit pas être mutée');
});

test('V75 · CP6 — deux appels identiques rendent le même résultat', () => {
  const args = [P({ bloquantes: 2, echecsNonRepris: 4, minutesRequises: 90 }),
    { budget: BUDGET, pressionJourActifPrecedent: HIER_OK }];
  assert.deepEqual(modeDe(...args), modeDe(...args));
});

// ── LE BRANCHEMENT (critère BLOQUANT V2) ───────────────────────────────

test('V75 · CP6 — le mode est RÉELLEMENT branché à une surface', () => {
  const serveur = lire('lib/recovery-server.ts');
  assert.ok(serveur, 'le read-model de récupération est introuvable');
  assert.match(serveur, /modeDe\s*\(/);
  assert.match(serveur, /arbitrerLaJournee\s*\(/);

  const page = lire('app/retention/page.tsx');
  assert.match(page, /=\s*getVueRecuperation\s*\(/, 'la page doit consommer le read-model');
  assert.match(page, /<RecoveryNotice/, 'la page doit afficher le mode');
});

test('V75 · CP6 — `E4` est calculé, pas stocké', () => {
  // §1.2 : le mode est un état du PLAN. Persister un compteur en ferait un
  // attribut de la personne, qui survivrait à la situation qui l'a produit.
  const serveur = lire('lib/recovery-server.ts');
  assert.match(serveur, /pressionJourActifPrecedent/, 'la pression d’hier doit être recalculée');
  assert.doesNotMatch(serveur, /writeProgress|applyCommand/, 'aucun mode ne doit être écrit');
});

test('V75 · CP6 — la page transmet enfin la POSITION au plan du jour (P1)', () => {
  // Second verrou du défaut P1 : `getPlanDuJour(now)` sans position rend une
  // charge `null`, donc un budget toujours nominal quelle que soit la journée.
  //
  // La page APPELLE toujours l'arbitre elle-même : le critère bloquant `B12` de
  // V74 l'exige, et il a raison — une garde qui suit trois indirections ne
  // garde plus grand-chose. On lui passe simplement la position.
  const page = lire('app/retention/page.tsx');
  assert.match(page, /=\s*getPlanDuJour\(now,\s*arriere\.jourCourant\)/,
    'la page doit appeler le plan AVEC la position');
  assert.doesNotMatch(page, /=\s*getPlanDuJour\(now\)\s*;/,
    'appeler le plan sans position rendrait deux budgets sur une même page');
  // Et le read-model de récupération les REÇOIT au lieu de les recalculer.
  const serveur = lire('lib/recovery-server.ts');
  assert.match(serveur, /arriereInjecte\s*\?\?\s*getVueArriere/);
  assert.match(serveur, /planInjecte\s*\?\?\s*getPlanDuJour/);
});

test('V75 · CP6 — la surface n’affiche AUCUN bouton qui ne ferait rien', () => {
  // `PAUSED_CURRICULUM` est un choix que le moteur ne peut qu'enregistrer, et
  // la commande n'existe pas encore. Un bouton inerte prétendrait offrir un
  // contrôle que le produit n'a pas.
  const c = lire('app/retention/RecoveryNotice.tsx');
  assert.ok(c, 'le composant est introuvable');
  assert.doesNotMatch(c, /<button|onClick=/, 'les options sont décrites, pas déclenchées');
  assert.match(c, /n’est appliqué/, 'la surface doit dire que rien n’est appliqué');
});

test('V75 · CP6 — la surface montre les DEUX allocations et leur total', () => {
  const c = lire('app/retention/RecoveryNotice.tsx');
  assert.match(c, /arbitrage\.actuel\.nouveau/);
  assert.match(c, /arbitrage\.actuel\.revision/);
  assert.match(c, /arbitrage\.ecart\.revision/);
  assert.match(c, /n’allonge pas ta journée/, 'la garantie V12 doit être DITE à l’apprenant');
  // Et elle ne doit pas être dite de travers : en CRITICAL le total CHANGE
  // (260 → 60 minutes mesurées). Annoncer « le même total dans les deux cas »
  // y serait faux — la mesure du CP6 a trouvé exactement ce défaut.
  assert.match(c, /arbitrage\.ecart\.total === 0/,
    'la page doit distinguer un déplacement de minutes d’un raccourcissement');
  assert.match(c, /Elle raccourcit, elle n’allonge jamais/);
});

test('V75 · CP6 — les parts de révision sont déclarées en UN seul endroit', () => {
  assert.deepEqual(PART_REVISION, { NORMAL: 1, CATCH_UP: 1.5, RECOVERY: 2, CRITICAL: 3 });
  // Et `CRITICAL` ne vaut pas l'infini : au-delà de trois séances nominales,
  // une journée de récupération devient une punition (R11).
  assert.ok(PART_REVISION.CRITICAL <= 3);
});
