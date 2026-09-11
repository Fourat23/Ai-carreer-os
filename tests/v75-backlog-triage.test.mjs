// V75 · CP5 — TRIAGE DE L'ARRIÉRÉ : trier n'est pas soustraire.
//
// Ce que ces tests gardent, et pourquoi chacun existe :
//   · `I2` — `total = actif + différé + garé`, à l'égalité STRICTE. C'est la
//     seule barrière mécanique contre `R1` (cacher la dette) et `R6` (retirer
//     des concepts de la mesure) ;
//   · **une notion ESSENTIELLE n'est jamais garable** — sinon le moteur ferait
//     disparaître exactement ce qui bloque le parcours ;
//   · **un échec non repris n'est jamais garable** — sinon un échec disparaît
//     au garage, et c'est `R4` ;
//   · `PARKED` exige une **condition nommée avec sa levée**, jamais une place
//     dans la file. C'est ce qui rend impossible le « 90 % dans PARKED » dont
//     le brief prévient ;
//   · `BACKLOG_PRESSURE` reste **cinq facteurs nommés** — aucun score.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  trierArriere, notionsEssentielles, CLASSES_TRIAGE, PLACEMENTS, CAPACITE_ACTIVE_DEFAUT,
} from '../lib/backlog-triage.mjs';
import { statutDe } from '../lib/retention-priority.mjs';

const NOW = '2026-09-01T10:00:00.000Z';
const ilYA = (j) => new Date(Date.parse(NOW) - j * 86_400_000).toISOString();
const lire = (p) => (existsSync(join(process.cwd(), p)) ? readFileSync(join(process.cwd(), p), 'utf8') : '');

/** Fiche minimale du Learner Memory Model. */
const fiche = (id, p = {}) => ({
  id,
  lastMeaningfulContactAt: ilYA(40),
  lastRetrievalAt: ilYA(40),
  lastSuccessAt: ilYA(40),
  lastFailureAt: null,
  consecutiveSuccesses: 1,
  ...p,
});

/** Toutes en retard : échéance dépassée de 30 jours. */
const enRetard = () => ilYA(30);

const trier = (fiches, o = {}) => trierArriere({
  fiches,
  dueAtOf: o.dueAtOf ?? (() => enRetard()),
  statutDe,
  estEssentielle: o.estEssentielle ?? (() => false),
  prerequisDe: o.prerequisDe ?? (() => []),
  minutesDe: o.minutesDe ?? (() => 4),
  scoreDe: o.scoreDe ?? (() => 50),
  besoinDe: o.besoinDe ?? (() => null),
  capaciteActive: o.capaciteActive ?? 3,
  now: NOW,
});

// ── L'INVARIANT QUI PORTE TOUT LE CHECKPOINT ────────────────────────────

test('V75 · CP5 — I2 : total = actif + différé + garé, exactement', () => {
  const fiches = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => fiche(id));
  const r = trier(fiches, {
    estEssentielle: (id) => id === 'a',
    prerequisDe: (id) => (id === 'e' ? ['a'] : []),
  });
  assert.equal(r.total, 6);
  assert.equal(r.placement.actif + r.placement.differe + r.placement.gare, r.total,
    'une notion a disparu de la somme : c’est R1/R6');
  assert.equal(r.notions.length, r.total);
});

test('V75 · CP5 — l’arriéré TOTAL n’est jamais plafonné par la capacité (I5)', () => {
  // Le défaut P2 du CP0 : la page lisait une file plafonnée à 8 et l'annonçait
  // comme le total. 84 réels, « 8 » affichés.
  const fiches = Array.from({ length: 84 }, (_, i) => fiche(`c${i}`));
  const r = trier(fiches, { capaciteActive: 3 });
  assert.equal(r.total, 84, 'le total doit rester le total');
  assert.equal(r.placement.actif, 3, 'seule la part ACTIVE est bornée');
  assert.equal(r.placement.differe, 81);
});

test('V75 · CP5 — ce qui n’est PAS en retard n’entre pas dans l’arriéré', () => {
  const r = trier([fiche('a'), fiche('sain')], {
    dueAtOf: (id) => (id === 'sain' ? new Date(Date.parse(NOW) + 30 * 86_400_000).toISOString() : enRetard()),
  });
  assert.equal(r.total, 1);
  assert.deepEqual(r.notions.map((n) => n.id), ['a']);
});

// ── LES DEUX ORDRES QUI INTERDISENT DE CACHER ───────────────────────────

test('V75 · CP5 — une notion ESSENTIELLE n’est JAMAIS garée', () => {
  // T1 avant T3. Inverser l'ordre garerait exactement ce qui bloque le parcours.
  const r = trier([fiche('fondation'), fiche('suite')], {
    estEssentielle: (id) => id === 'suite',
    prerequisDe: (id) => (id === 'suite' ? ['fondation'] : []),
  });
  const suite = r.notions.find((n) => n.id === 'suite');
  assert.equal(suite.classe, 'URGENT');
  assert.notEqual(suite.placement, 'gare');
});

test('V75 · CP5 — un ÉCHEC non repris n’est JAMAIS garé (R4)', () => {
  // T2 avant T3. Un échec garé est un échec qui disparaît.
  const r = trier([
    fiche('cause'),
    fiche('consequence', { lastFailureAt: ilYA(5), lastSuccessAt: ilYA(20) }),
  ], { prerequisDe: (id) => (id === 'consequence' ? ['cause'] : []) });
  const c = r.notions.find((n) => n.id === 'consequence');
  assert.equal(c.classe, 'IMPORTANT');
  assert.notEqual(c.placement, 'gare');
});

// ── CE QUE `PARKED` SIGNIFIE, ET CE QU'IL NE SIGNIFIE PAS ───────────────

test('V75 · CP5 — on ne gare que sur une CONDITION nommée, avec sa levée', () => {
  const r = trier([fiche('cause'), fiche('consequence')], {
    prerequisDe: (id) => (id === 'consequence' ? ['cause'] : []),
  });
  const g = r.notions.find((n) => n.classe === 'PARKED');
  assert.ok(g, 'une notion dont le prérequis est en retard doit être garée');
  assert.equal(g.id, 'consequence');
  assert.match(g.raison, /cause/, 'la raison doit NOMMER le bloquant');
  assert.match(g.conditionDeRetour, /cause/, 'la levée doit être publiée');
  // Et la cause, elle, reste travaillable : c'est tout l'intérêt.
  assert.equal(r.notions.find((n) => n.id === 'cause').classe, 'DEFERRABLE');
});

test('V75 · CP5 — on ne gare JAMAIS parce qu’une notion est loin dans la file', () => {
  // 60 notions différables, capacité 3. Le moteur serait « plus efficace » en
  // garant les 57 excédentaires : c'est précisément l'interdit du brief.
  const r = trier(Array.from({ length: 60 }, (_, i) => fiche(`c${i}`)), { capaciteActive: 3 });
  assert.equal(r.compte.PARKED, 0, 'aucune notion ne doit être garée faute de place');
  assert.equal(r.placement.differe, 57);
});

test('V75 · CP5 — une notion URGENTE qui ne rentre pas est DIFFÉRÉE, pas garée', () => {
  const r = trier(['a', 'b', 'c', 'd', 'e'].map((id) => fiche(id)), {
    estEssentielle: () => true, capaciteActive: 2,
  });
  assert.equal(r.compte.URGENT, 5);
  assert.equal(r.placement.actif, 2);
  assert.equal(r.placement.differe, 3);
  assert.equal(r.placement.gare, 0);
});

test('V75 · CP5 — `PARKED` ne change NI le statut NI l’échéance (I3)', () => {
  const avant = fiche('consequence');
  const copie = JSON.parse(JSON.stringify(avant));
  const r = trier([fiche('cause'), avant], {
    prerequisDe: (id) => (id === 'consequence' ? ['cause'] : []),
  });
  assert.deepEqual(avant, copie, 'le triage ne doit rien écrire dans la fiche');
  const g = r.notions.find((n) => n.id === 'consequence');
  assert.equal(g.statut, statutDe(avant, enRetard(), NOW), 'le statut reste celui du moteur');
});

test('V75 · CP5 — une dépendance MUTUELLE ne gare personne', () => {
  // A exige B, B exige A. Les garer tous les deux les rendrait inatteignables
  // à jamais : aucune condition ne pourrait se lever.
  //
  // La troisième notion `libre` est INDISPENSABLE au test, et c'est une
  // mutation qui l'a montré : sans elle, `a` et `b` garés déclenchent la
  // soupape — qui dégare tout — et le test passait donc même en supprimant la
  // règle d'exclusion mutuelle. Il vérifiait la soupape en croyant vérifier la
  // règle.
  const r = trier([fiche('a'), fiche('b'), fiche('libre')], {
    prerequisDe: (id) => ({ a: ['b'], b: ['a'] }[id] ?? []),
  });
  assert.equal(r.soupape, false, 'la soupape ne doit pas masquer ce que teste ce cas');
  assert.equal(r.compte.PARKED, 0, 'ni A ni B ne doivent être garés');
});

test('V75 · CP5 — la SOUPAPE dégare tout plutôt que de bloquer l’apprenant', () => {
  // Chaîne a ← b ← c où « a » n'est PAS en retard : b et c seraient garés…
  // mais ici tout l'arriéré dépend d'une notion elle-même en retard.
  const r = trier([fiche('b'), fiche('c')], {
    prerequisDe: (id) => (id === 'b' ? ['c'] : ['b']),
    capaciteActive: 3,
  });
  assert.equal(r.placement.gare, 0);
  assert.ok(r.placement.actif > 0, 'l’apprenant doit toujours avoir quelque chose à faire');
});

// ── `BACKLOG_PRESSURE` — CINQ FACTEURS, AUCUN SCORE ─────────────────────

test('V75 · CP5 — la pression est une LISTE de cinq facteurs nommés', () => {
  const r = trier([
    fiche('a'),
    fiche('b', { lastFailureAt: ilYA(3), lastSuccessAt: ilYA(20) }),
    fiche('c'),
  ], { estEssentielle: (id) => id === 'a', minutesDe: () => 5 });

  assert.deepEqual(Object.keys(r.pression).sort(),
    ['anciennete', 'bloquantes', 'echecsNonRepris', 'minutesRequises', 'volume']);
  assert.equal(r.pression.bloquantes, 1);
  assert.equal(r.pression.echecsNonRepris, 1);
  assert.equal(r.pression.volume, 3);
  assert.equal(r.pression.minutesRequises, 15);
  assert.equal(r.pression.anciennete, 30);
});

test('V75 · CP5 — AUCUN nombre unique appelé « pression » n’est renvoyé', () => {
  // §2 du contrat gelé : « il n'existe aucun nombre unique appelé pression ».
  // Un tel nombre finirait affiché, et un nombre affiché sans unité se lit
  // comme une note.
  const r = trier([fiche('a')]);
  for (const k of Object.keys(r)) {
    assert.ok(!/^(score|pressionTotale|indice|niveauPression)$/.test(k), `champ agrégé interdit : ${k}`);
  }
  assert.equal(typeof r.pression, 'object');
  assert.ok(!('total' in r.pression), 'la pression ne s’agrège pas');
});

// ── TOUTE NOTION S'EXPLIQUE ─────────────────────────────────────────────

test('V75 · CP5 — chaque notion porte une classe connue et une RAISON lisible', () => {
  const r = trier([
    fiche('urg'), fiche('ech', { lastFailureAt: ilYA(2), lastSuccessAt: ilYA(9) }),
    fiche('cause'), fiche('gare'), fiche('diff'),
  ], {
    estEssentielle: (id) => id === 'urg',
    prerequisDe: (id) => (id === 'gare' ? ['cause'] : []),
    besoinDe: (id) => (id === 'urg' ? { inDays: 4 } : null),
  });
  for (const n of r.notions) {
    assert.ok(CLASSES_TRIAGE.includes(n.classe), `classe inconnue : ${n.classe}`);
    assert.ok(PLACEMENTS.includes(n.placement), `placement inconnu : ${n.placement}`);
    assert.ok(n.raison && n.raison.length > 10, `raison absente pour ${n.id}`);
    assert.ok(!/score|decay|percentile|probabilit/i.test(n.raison), `jargon moteur dans « ${n.raison} »`);
    if (n.classe === 'PARKED') assert.ok(n.conditionDeRetour, 'une notion garée doit dire quand elle revient');
    else assert.equal(n.conditionDeRetour, null);
  }
  assert.match(r.notions.find((n) => n.id === 'urg').raison, /4 jours/);
});

test('V75 · CP5 — l’ordre de service est URGENT, IMPORTANT, DEFERRABLE, PARKED', () => {
  const r = trier([
    fiche('d'), fiche('gare'), fiche('cause'),
    fiche('i', { lastFailureAt: ilYA(1), lastSuccessAt: ilYA(9) }), fiche('u'),
  ], {
    estEssentielle: (id) => id === 'u',
    prerequisDe: (id) => (id === 'gare' ? ['cause'] : []),
    capaciteActive: 99,
  });
  const rang = r.notions.map((n) => n.classe);
  assert.deepEqual(rang, ['URGENT', 'IMPORTANT', 'DEFERRABLE', 'DEFERRABLE', 'PARKED']);
});

test('V75 · CP5 — la capacité par défaut est celle du scheduler, pas une seconde', () => {
  assert.equal(CAPACITE_ACTIVE_DEFAUT, 8);
});

test('V75 · CP5 — le triage est DÉTERMINISTE : deux appels, un seul résultat', () => {
  const f = ['a', 'b', 'c'].map((id) => fiche(id));
  const opts = { estEssentielle: (id) => id === 'b', scoreDe: (id) => id.charCodeAt(0) };
  assert.deepEqual(trier(f, opts), trier(f, opts));
});

// ── `ESSENTIAL` EST UNE PROPRIÉTÉ DU CURRICULUM ─────────────────────────

test('V75 · CP5 — essentielle = prérequis d’une journée des 14 prochains jours', () => {
  const e = notionsEssentielles({
    jourCourant: 10,
    horizon: 14,
    leconsDuJour: (j) => (j === 13 ? ['avancee'] : []),
    prerequisDe: (id) => (id === 'avancee' ? ['base'] : []),
  });
  assert.ok(e.has('base'));
  assert.ok(!e.has('avancee'), 'une leçon que le parcours va PRÉSENTER n’est pas un prérequis en retard');
});

test('V75 · CP5 — la fermeture est TRANSITIVE : les fondations comptent', () => {
  // Le profil T du CP0 (« reprend au j250, fondations fragiles ») a précisément
  // ses prérequis de prérequis en retard. S'arrêter au premier niveau les
  // manquerait tous.
  const e = notionsEssentielles({
    jourCourant: 5, horizon: 14,
    leconsDuJour: (j) => (j === 8 ? ['c'] : []),
    prerequisDe: (id) => ({ c: ['b'], b: ['a'], a: [] }[id] ?? []),
  });
  assert.deepEqual([...e].sort(), ['a', 'b']);
});

test('V75 · CP5 — au-delà de l’horizon, rien n’est essentiel', () => {
  const e = notionsEssentielles({
    jourCourant: 10, horizon: 14,
    leconsDuJour: (j) => (j === 40 ? ['loin'] : []),
    prerequisDe: (id) => (id === 'loin' ? ['base'] : []),
  });
  assert.equal(e.size, 0);
});

test('V75 · CP5 — sans position connue, on ne DEVINE pas un horizon', () => {
  // Un horizon posé au hasard rendrait essentielles des notions prises
  // n'importe où dans l'année. L'ensemble vide est une réponse honnête.
  const e = notionsEssentielles({
    jourCourant: 0, horizon: 14,
    leconsDuJour: () => ['x'], prerequisDe: () => ['base'],
  });
  assert.equal(e.size, 0);
});

// ── LE BRANCHEMENT (critère BLOQUANT V1) ───────────────────────────────
//
// V74 a payé cher la leçon inverse : six modules écrits, des centaines de
// tests verts, et **aucun atteignable depuis le produit**. Le critère `V1` du
// contrat V75 dit la même chose pour le triage — « une surface le consomme ».

test('V75 · CP5 — le triage est RÉELLEMENT branché à une surface', () => {
  const serveur = lire('lib/backlog-server.ts');
  assert.ok(serveur, 'le read-model de l’arriéré est introuvable');
  assert.match(serveur, /trierArriere\s*\(/, 'le read-model doit appeler le moteur de triage');
  assert.match(serveur, /notionsEssentielles\s*\(/, 'les notions essentielles doivent être calculées');

  const page = lire('app/retention/page.tsx');
  assert.match(page, /=\s*getVueArriere\s*\(/, 'la page doit consommer le read-model');
  assert.match(page, /<BacklogPanel/, 'la page doit afficher le triage');
});

test('V75 · CP5 — la page affiche l’arriéré TOTAL, plus la file plafonnée (P2)', () => {
  // Le défaut mesuré au CP0 : « Dues aujourd'hui » valait `s.queue.length`,
  // c'est-à-dire la file V66 plafonnée à 8, annoncée comme un total. 84 réels,
  // « 8 » affichés. Ce test empêche la régression.
  const page = lire('app/retention/page.tsx');
  assert.doesNotMatch(page, /k:\s*'[^']*retard[^']*'[^}]*s\.queue\.length/i);
  assert.match(page, /k:\s*'En retard',\s*v:\s*`\$\{arriere\.total\}`/,
    'le nombre annoncé comme « en retard » doit être l’arriéré total');
});

test('V75 · CP5 — le panneau publie les trois nombres SÉPARÉMENT', () => {
  // `N3` du contrat : « le CP13 publiera total, actif et garé séparément,
  // parce que tout mettre au garage ferait chuter l'arriéré actif sans rien
  // résoudre ». Le panneau applique déjà la règle.
  const p = lire('app/retention/BacklogPanel.tsx');
  // Chercher la simple PRÉSENCE du nom d'un champ ne prouve rien — une
  // mutation l'a montré : remplacer `value={vue.gare}` par `value={0}` laissait
  // le test vert, parce que `vue.gare` subsistait dans un texte d'explication.
  // On exige donc que chaque nombre soit la VALEUR rendue.
  for (const champ of ['vue.actif', 'vue.differe', 'vue.gare']) {
    assert.match(p, new RegExp(`value=\\{${champ.replace('.', '\\.')}\\}`),
      `le panneau doit rendre ${champ} comme valeur, pas seulement le mentionner`);
  }
  assert.match(p, /vue\.total/, 'le total doit apparaître');
  // Et il n'agrège jamais la pression en un seul nombre.
  assert.doesNotMatch(p, /pression\s*\.\s*(total|score|indice)/);
});

test('V75 · CP5 — une notion garée affiche TOUJOURS sa condition de retour', () => {
  // Un garage sans levée serait une suppression qui ne dit pas son nom.
  const p = lire('app/retention/BacklogPanel.tsx');
  assert.match(p, /conditionDeRetour/, 'la condition de sortie doit être rendue');
});

test('V75 · CP5 — un cycle de prérequis ne fait pas boucler la fermeture', () => {
  const e = notionsEssentielles({
    jourCourant: 3, horizon: 5,
    leconsDuJour: (j) => (j === 4 ? ['a'] : []),
    prerequisDe: (id) => ({ a: ['b'], b: ['c'], c: ['b'] }[id] ?? []),
  });
  assert.deepEqual([...e].sort(), ['b', 'c']);
});
