// V77 · CP2 — LA CARTE CANONIQUE TIENT-ELLE DEBOUT ?
//
// ── CE QUE CES TESTS GARDENT ────────────────────────────────────────────
//
// Une carte unique donne l'autorité d'un fichier à une politique. Si elle se
// contredit, elle est **pire** que pas de carte : elle rend une politique fausse
// difficile à contester.
//
// Ces tests tiennent trois choses :
//
//   1. la carte est cohérente avec elle-même, et exhaustive par rapport à ce que
//      le CP0 a réellement trouvé sur le disque ;
//   2. les plafonds du contrat gelé sont dans la DONNÉE, pas dans un commentaire ;
//   3. la règle du maillon faible se comporte comme un minimum, pas comme une
//      moyenne ni comme un maximum.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  NIVEAUX, POLITIQUES, ACTIVITES, SURFACES, SURFACES_DE_LECTURE,
  FAITS_NOUVEAUX, FAITS_EXISTANTS,
  rangDuNiveau, maillonFaible, compteDansLesMoteurs,
  politiqueDe, peutEcrireUnFait, niveauMaximal, niveauAutorise, estSimulee,
  surfacesDePratique, incoherences,
} from '../lib/practice-model.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');

// ── 1 · LA CARTE EST COHÉRENTE ──────────────────────────────────────────

test('V77 · CP2 — la carte ne se contredit pas', () => {
  const ko = incoherences();
  assert.deepEqual(ko, [], `incohérences :\n  ${ko.join('\n  ')}`);
});

test('V77 · CP2 — chaque surface porte une justification substantielle', () => {
  // Le contrat l'exige pour un `NO_FACT` autant que pour un fait : une absence
  // de fait est une décision, et une décision se défend.
  for (const [id, s] of Object.entries(SURFACES)) {
    assert.ok(s.justification && s.justification.length >= 40,
      `${id} : justification de ${s.justification?.length ?? 0} caractères`);
  }
});

test('V77 · CP2 — la carte couvre TOUTES les surfaces de pratique trouvées au CP0', () => {
  // La carte ne doit pas être une liste écrite de mémoire : elle doit
  // correspondre à ce que l'inventaire a réellement trouvé sur le disque.
  const inv = JSON.parse(lire('docs/v77/cp0-inventory.json'));
  const agissantes = inv.surfaces
    .filter((s) => s.contenu && s.contenu.n > 0)
    .map((s) => s.id);
  const connues = new Set([...surfacesDePratique(), ...SURFACES_DE_LECTURE]);
  const orphelines = agissantes.filter((id) => !connues.has(id));
  assert.deepEqual(orphelines, [],
    `surfaces trouvées au CP0 mais absentes de la carte : ${orphelines.join(' ')}`);
});

test('V77 · CP2 — aucune entrée de la carte ne désigne une surface inexistante', () => {
  // L'inverse du test précédent : une carte qui décrirait une surface disparue
  // donnerait une politique à du vide.
  const inv = JSON.parse(lire('docs/v77/cp0-inventory.json'));
  const surLeDisque = new Set(inv.surfaces.map((s) => s.id));
  // `external-tasks` est la seule exception assumée : le contrat gèle son
  // plafond AVANT qu'elle existe, précisément pour qu'on ne la construise pas
  // en la surclassant.
  const fantomes = surfacesDePratique()
    .filter((id) => !surLeDisque.has(id) && id !== 'external-tasks');
  assert.deepEqual(fantomes, [], `entrées sans surface : ${fantomes.join(' ')}`);
  assert.equal(SURFACES['external-tasks'].implemente, false,
    '`external-tasks` doit être déclarée non implémentée');
});

// ── 2 · LES PLAFONDS DU CONTRAT SONT DANS LA DONNÉE ─────────────────────

test('V77 · CP2 — une mission ne peut JAMAIS atteindre `VALIDATED`', () => {
  // La décision la plus lourde du CP1, et celle qu'une refonte distraite
  // annulerait le plus facilement.
  assert.equal(niveauMaximal('missions'), 'OBSERVED');
  assert.equal(niveauAutorise('missions', 'VALIDATED'), false,
    'une mission peut atteindre VALIDATED : STRUCTURE_VALID + SELF_CONFIRMATION redevient une réussite');
  assert.equal(niveauAutorise('missions', 'OBSERVED'), true);
  assert.equal(niveauAutorise('missions', 'DECLARED'), true);
});

test('V77 · CP2 — les quatre surfaces analytiques plafonnent à `OBSERVED`', () => {
  // Un compte de diagnostics n'est pas un verdict. Zéro diagnostic signifie
  // « aucun défaut connu de cet analyseur », jamais « juste ».
  for (const id of ['kubernetes', 'cloud-lab', 'cloud-foundations', 'security']) {
    assert.equal(niveauMaximal(id), 'OBSERVED', `${id} dépasse OBSERVED`);
    assert.equal(niveauAutorise(id, 'VALIDATED'), false, `${id} accepte VALIDATED`);
    assert.equal(estSimulee(id), true, `${id} n’est pas marquée simulée`);
  }
});

test('V77 · CP2 — `pipelines` et `terminal` n’écrivent aucun fait', () => {
  for (const id of ['pipelines', 'terminal']) {
    assert.equal(politiqueDe(id).politique, 'NO_FACT', `${id} écrit un fait`);
    assert.equal(peutEcrireUnFait(id), false);
    assert.equal(politiqueDe(id).typeFait, null);
  }
  // Et la raison est écrite, pas sous-entendue.
  assert.match(SURFACES.pipelines.justification, /ne rédige pas le pipeline/);
  assert.match(SURFACES.terminal.justification, /aucun critère de réussite/);
});

test('V77 · CP2 — les quatre surfaces corrigées contre un corrigé atteignent `VALIDATED`', () => {
  // La moitié qu'on oublie : une carte qui plafonnerait tout à OBSERVED
  // « protégerait » aussi bien et rendrait la compétence inatteignable.
  for (const id of ['lab', 'transfer', 'assessments', 'capstones']) {
    assert.equal(niveauMaximal(id), 'VALIDATED', `${id} n’atteint pas VALIDATED`);
    assert.equal(peutEcrireUnFait(id), true);
  }
});

test('V77 · CP2 — un capstone est VALIDATED **et** simulé, sans contradiction', () => {
  // Le contrat §5.3 : le marqueur de simulation ne dégrade pas le niveau. Les
  // deux affirmations sont vraies et indépendantes.
  assert.equal(niveauMaximal('capstones'), 'VALIDATED');
  assert.equal(estSimulee('capstones'), true);
  assert.equal(estSimulee('assessments'), false, 'un diagnostic n’est pas simulé');
});

test('V77 · CP2 — une surface de lecture n’écrit rien, et il n’y a qu’une politique pour toutes', () => {
  for (const id of SURFACES_DE_LECTURE) {
    const p = politiqueDe(id);
    assert.equal(p.politique, 'NO_FACT', `${id} écrit un fait`);
    assert.equal(p.lecture, true);
  }
  assert.equal(politiqueDe('lessons').justification, politiqueDe('calendar').justification,
    'les surfaces de lecture ont des politiques divergentes');
});

test('V77 · CP2 — une surface inconnue n’a AUCUNE politique implicite', () => {
  // Le défaut par défaut ne doit pas être « ça passe » : une surface qu’on
  // ajouterait sans l’inscrire ici doit être visible comme une lacune.
  assert.equal(politiqueDe('surface-inventee-demain'), null);
  assert.equal(peutEcrireUnFait('surface-inventee-demain'), false);
  assert.equal(niveauMaximal('surface-inventee-demain'), null);
  assert.equal(niveauAutorise('surface-inventee-demain', 'DECLARED'), false);
});

// ── 3 · LE MAILLON FAIBLE EST UN MINIMUM ────────────────────────────────

test('V77 · CP2 — le maillon faible rend le PLUS FAIBLE, jamais le plus fort', () => {
  // Le cas exact d'une mission : un livrable validé, un observé, un déclaré.
  assert.equal(maillonFaible(['VALIDATED', 'OBSERVED', 'DECLARED']), 'DECLARED');
  assert.equal(maillonFaible(['VALIDATED', 'VALIDATED']), 'VALIDATED');
  assert.equal(maillonFaible(['OBSERVED', 'VALIDATED']), 'OBSERVED');
  // Ni moyenne, ni maximum : trois VALIDATED et un DECLARED valent DECLARED.
  assert.equal(maillonFaible(['VALIDATED', 'VALIDATED', 'VALIDATED', 'DECLARED']), 'DECLARED');
});

test('V77 · CP2 — une composition vide ne vaut pas `DECLARED`', () => {
  // « aucune composante » n'est pas « composante la plus faible » : rendre
  // `DECLARED` fabriquerait une preuve à partir de rien.
  assert.equal(maillonFaible([]), null);
  assert.equal(maillonFaible(null), null);
  assert.equal(maillonFaible(['INVENTE']), null);
});

test('V77 · CP2 — seul `VALIDATED` compte dans les moteurs', () => {
  assert.equal(compteDansLesMoteurs('VALIDATED'), true);
  assert.equal(compteDansLesMoteurs('OBSERVED'), false);
  assert.equal(compteDansLesMoteurs('DECLARED'), false);
  assert.equal(compteDansLesMoteurs('passed'), false, 'un statut hérité ne doit pas ouvrir la porte');
  assert.equal(compteDansLesMoteurs(undefined), false);
});

test('V77 · CP2 — l’ordre des niveaux est strict et fermé', () => {
  assert.deepEqual([...NIVEAUX], ['DECLARED', 'OBSERVED', 'VALIDATED']);
  assert.ok(rangDuNiveau('DECLARED') < rangDuNiveau('OBSERVED'));
  assert.ok(rangDuNiveau('OBSERVED') < rangDuNiveau('VALIDATED'));
  assert.equal(rangDuNiveau('SUPER_VALIDATED'), -1, 'un niveau inventé est accepté');
});

// ── 4 · V77 NE CRÉE QUE CE QU'IL A JUSTIFIÉ ─────────────────────────────

test('V77 · CP2 — deux types de faits NOUVEAUX pour six surfaces, pas six', () => {
  // `H1` : viser la couverture est un échec. Six types d'événements pour six
  // surfaces serait exactement cela, déguisé en rigueur.
  const nouveaux = new Set(
    Object.values(SURFACES).map((s) => s.typeFait).filter((t) => t && FAITS_NOUVEAUX.includes(t)),
  );
  assert.ok(nouveaux.size <= 3, `${nouveaux.size} types de faits nouveaux : ${[...nouveaux].join(' ')}`);
  // Les quatre surfaces analytiques partagent le MÊME type.
  const analytiques = ['kubernetes', 'cloud-lab', 'cloud-foundations', 'security']
    .map((id) => SURFACES[id].typeFait);
  assert.equal(new Set(analytiques).size, 1, 'les surfaces analytiques ont des types divergents');
  // Assessment et capstone partagent le MÊME type.
  assert.equal(SURFACES.assessments.typeFait, SURFACES.capstones.typeFait);
});

test('V77 · CP2 — les faits qui existaient ne sont pas renommés', () => {
  assert.equal(SURFACES.lab.typeFait, 'ExerciseAttempt');
  assert.equal(SURFACES.transfer.typeFait, 'TransferAttempt');
  for (const id of ['lab', 'transfer']) {
    assert.equal(SURFACES[id].existant, true, `${id} doit être marquée comme préexistante`);
  }
  assert.ok(FAITS_EXISTANTS.includes('RecallAttempt'));
});

test('V77 · CP2 — le plafond des preuves externes est gelé avant leur existence', () => {
  // Pour que personne ne construise la surface plus tard en la surclassant.
  assert.equal(niveauMaximal('external-tasks'), 'DECLARED');
  assert.equal(niveauAutorise('external-tasks', 'OBSERVED'), false);
  assert.equal(niveauAutorise('external-tasks', 'VALIDATED'), false);
});

// ── 5 · LA CARTE EST LA SEULE LISTE ─────────────────────────────────────

test('V77 · CP2 — le contrat gelé et la carte disent la même chose', () => {
  // Deux listes divergentes valent moins qu'une seule : c'est le défaut que la
  // carte existe pour supprimer. On vérifie les décisions les plus lourdes.
  const c = lire('docs/v77/V77-PRACTICE-OBSERVABILITY-CONTRACT-FROZEN.md');
  assert.ok(c.length > 0, 'contrat gelé introuvable');

  // On cherche la LIGNE de la surface, pas une colonne à une position donnée :
  // V76 a payé deux fois pour avoir épinglé des distances dans un document.
  const ligne = (id) => c.split('\n').find((l) => l.startsWith(`| \`${id}\``) && l.split('|').length > 5) ?? '';

  const missions = ligne('missions');
  assert.ok(missions.includes('OBSERVED'), 'le contrat ne plafonne plus les missions à OBSERVED');
  assert.ok(!missions.includes('VALIDATED'), 'le contrat laisse les missions atteindre VALIDATED');

  for (const id of ['pipelines', 'terminal']) {
    assert.ok(ligne(id).includes('NO_FACT'), `le contrat ne met plus \`${id}\` en NO_FACT`);
  }
  for (const id of ['kubernetes', 'cloud-lab', 'cloud-foundations', 'security']) {
    const l = ligne(id);
    assert.ok(l.includes('OBSERVED'), `le contrat ne plafonne plus \`${id}\` à OBSERVED`);
    assert.ok(!l.includes('VALIDATED'), `le contrat laisse \`${id}\` atteindre VALIDATED`);
  }
});
