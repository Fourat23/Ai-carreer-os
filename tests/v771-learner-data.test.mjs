// V77.1 · CP2 — LES DROITS SUR LES DONNÉES, TESTÉS SUR UN VRAI DISQUE.
//
// Ces tests écrivent de vrais fichiers dans un répertoire temporaire et
// appellent LA fonction de suppression du produit — pas une imitation. Un test
// de suppression qui n'a rien à supprimer ne prouve rien ; celui-ci crée
// d'abord des données de curriculum À CÔTÉ, et vérifie qu'elles survivent.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  CATEGORIES_DONNEES_APPRENANT, ORDRE_DE_SUPPRESSION, REPERTOIRES_DU_PRODUIT,
  FICHIERS_DU_PRODUIT, planDeSuppression, violationsDuPlan, porteeDe,
  couvreToutesLesDonnees, estSousLeChemin,
} from '../lib/learner-data.mjs';
import {
  supprimerToutesLesDonnees, inventaireDesDonnees, compterFichiers,
  exporterTousLesJournaux, lireInstantane,
} from '../lib/learner-data-fs.mjs';

/** Un faux projet complet : données d'apprenant ET curriculum, côte à côte. */
function projetJetable() {
  const racine = mkdtempSync(join(tmpdir(), 'aicos-cp2-'));
  const data = join(racine, 'data');
  mkdirSync(data, { recursive: true });

  // — données de l'apprenant —
  writeFileSync(join(data, 'progress.json'), JSON.stringify({ activeTrackId: 't', tracks: {} }));
  writeFileSync(join(data, 'progress.backup.json'), JSON.stringify({ activeTrackId: 't', tracks: {} }));
  mkdirSync(join(data, 'lab-workspaces', 'fizzbuzz'), { recursive: true });
  writeFileSync(join(data, 'lab-workspaces', 'fizzbuzz', 'index.js'), 'const maSolution = 1;');
  mkdirSync(join(data, 'lab-journals'), { recursive: true });
  writeFileSync(join(data, 'lab-journals', 'fizzbuzz.json'), JSON.stringify([{ at: '2026-01-01T00:00:00.000Z', passed: 1, total: 4, fichiers: { 'index.js': 'mon code raté' } }]));

  // — curriculum : ce qui ne doit JAMAIS partir —
  mkdirSync(join(data, 'exercises'), { recursive: true });
  writeFileSync(join(data, 'exercises', 'fizzbuzz.json'), '{"id":"fizzbuzz"}');
  writeFileSync(join(data, 'program.json'), '{"days":365}');
  mkdirSync(join(racine, 'curriculum'), { recursive: true });
  writeFileSync(join(racine, 'curriculum', 'j001.md'), '# leçon');
  mkdirSync(join(racine, 'lib'), { recursive: true });
  writeFileSync(join(racine, 'lib', 'evidence.mjs'), '// code source');

  const racines = {
    progress: join(data, 'progress.json'),
    snapshot: join(data, 'progress.backup.json'),
    workspaces: join(data, 'lab-workspaces'),
    journals: join(data, 'lab-journals'),
  };
  return { racine, data, racines, nettoyer: () => rmSync(racine, { recursive: true, force: true }) };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. La carte des données : quatre catégories, et ce que chaque opération fait
// ─────────────────────────────────────────────────────────────────────────────

test('CP2 — les quatre catégories de données de l’apprenant sont nommées', () => {
  // Pinnées EN CLAIR : dériver cette liste de la chose testée la rendrait vide
  // sans que rien ne rougisse — la leçon de `M01` au CP14 de V77.
  const ids = CATEGORIES_DONNEES_APPRENANT.map((c) => c.id);
  assert.deepEqual(ids, ['progress', 'progress-snapshot', 'lab-workspaces', 'lab-journals']);
  assert.deepEqual([...ORDRE_DE_SUPPRESSION], ids);
});

test('CP2 — deux catégories contiennent du code écrit par l’apprenant', () => {
  const avecCode = CATEGORIES_DONNEES_APPRENANT.filter((c) => c.contientDuCodeApprenant).map((c) => c.id);
  assert.deepEqual(avecCode, ['lab-workspaces', 'lab-journals']);
});

test('CP2 — RESET ne couvre PAS toutes les données, et ne peut donc pas dire « toutes »', () => {
  assert.equal(couvreToutesLesDonnees('reset'), false);
  const p = porteeDe('reset');
  const epargne = p.epargne.map((e) => e.id).sort();
  assert.deepEqual(epargne, ['lab-journals', 'lab-workspaces']);
  // L'instantané n'est pas « épargné » : il est CRÉÉ. C'est pire qu'épargné,
  // et c'est exactement ce que l'ancien texte cachait.
  assert.equal(CATEGORIES_DONNEES_APPRENANT.find((c) => c.id === 'progress-snapshot').reset, 'CRÉÉ');
});

test('CP2 — DELETE ALL couvre les quatre catégories, et c’est la seule qui le fait', () => {
  assert.equal(couvreToutesLesDonnees('deleteAll'), true);
  assert.equal(couvreToutesLesDonnees('reset'), false);
  assert.equal(couvreToutesLesDonnees('sauvegardeRestaurable'), false);
  assert.equal(couvreToutesLesDonnees('archiveComplete'), true);
});

test('CP2 — la sauvegarde restaurable n’inclut PAS les journaux : c’était le mensonge du CP0', () => {
  const journaux = CATEGORIES_DONNEES_APPRENANT.find((c) => c.id === 'lab-journals');
  assert.equal(journaux.sauvegardeRestaurable, 'ABSENT');
  assert.equal(journaux.archiveComplete, 'INCLUS');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Le garde-fou : un plan qui viserait le produit est REFUSÉ
// ─────────────────────────────────────────────────────────────────────────────

test('CP2 — le plan légitime ne porte aucune violation', () => {
  const t = projetJetable();
  try {
    assert.deepEqual(violationsDuPlan(planDeSuppression(t.racines), t.racine), []);
  } finally { t.nettoyer(); }
});

test('CP2 — un plan visant « data » entier est refusé : il contient le curriculum', () => {
  const t = projetJetable();
  try {
    const v = violationsDuPlan([{ id: 'progress', chemin: t.data }], t.racine);
    assert.equal(v.length, 1);
    assert.match(v[0], /curriculum/);
  } finally { t.nettoyer(); }
});

test('CP2 — un plan visant un répertoire du produit est refusé, un par un', () => {
  const t = projetJetable();
  try {
    for (const rep of REPERTOIRES_DU_PRODUIT) {
      const v = violationsDuPlan([{ id: 'progress', chemin: join(t.racine, rep, 'quelquechose') }], t.racine);
      assert.ok(v.length >= 1, `« ${rep} » aurait dû être refusé`);
    }
    for (const f of FICHIERS_DU_PRODUIT) {
      const v = violationsDuPlan([{ id: 'progress', chemin: join(t.racine, f) }], t.racine);
      assert.ok(v.length >= 1, `« ${f} » aurait dû être refusé`);
    }
  } finally { t.nettoyer(); }
});

test('CP2 — un plan visant la racine du projet, ou « / », est refusé', () => {
  const t = projetJetable();
  try {
    assert.ok(violationsDuPlan([{ id: 'progress', chemin: t.racine }], t.racine).length >= 1);
    assert.ok(violationsDuPlan([{ id: 'progress', chemin: '/' }], t.racine).length >= 1);
    assert.ok(violationsDuPlan([{ id: 'progress', chemin: '' }], t.racine).length >= 1);
  } finally { t.nettoyer(); }
});

test('CP2 — une progression HORS du projet reste supprimable (AICOS_PROGRESS_FILE)', () => {
  const t = projetJetable();
  const ailleurs = mkdtempSync(join(tmpdir(), 'aicos-cp2-hors-'));
  try {
    const p = join(ailleurs, 'progress.json');
    writeFileSync(p, '{}');
    assert.deepEqual(violationsDuPlan([{ id: 'progress', chemin: p }], t.racine), []);
  } finally { t.nettoyer(); rmSync(ailleurs, { recursive: true, force: true }); }
});

test('CP2 — un plan refusé ne supprime RIEN', () => {
  const t = projetJetable();
  try {
    const mauvaises = { ...t.racines, journals: join(t.racine, 'curriculum') };
    const r = supprimerToutesLesDonnees(mauvaises, t.racine);
    assert.equal(r.ok, false);
    assert.ok(r.violations.length >= 1);
    assert.deepEqual(r.supprime, []);
    // Rien n'a bougé, pas même les catégories parfaitement légitimes.
    assert.equal(existsSync(t.racines.progress), true);
    assert.equal(existsSync(t.racines.workspaces), true);
    assert.equal(existsSync(join(t.racine, 'curriculum', 'j001.md')), true);
  } finally { t.nettoyer(); }
});

test('CP2 — estSousLeChemin compare des segments, pas des préfixes de texte', () => {
  assert.equal(estSousLeChemin('/a/data', '/a/database'), false);
  assert.equal(estSousLeChemin('/a/data', '/a/data/x'), true);
  assert.equal(estSousLeChemin('/a/data', '/a/data'), true);
  assert.equal(estSousLeChemin('data/exercises', 'data/exercises-old/x'), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. La suppression, exécutée pour de vrai
// ─────────────────────────────────────────────────────────────────────────────

test('CP2 — DELETE ALL efface réellement les quatre catégories, sur le disque', () => {
  const t = projetJetable();
  try {
    const avant = inventaireDesDonnees(t.racines);
    assert.deepEqual(avant.map((a) => a.present), [true, true, true, true]);
    assert.equal(avant.find((a) => a.id === 'lab-journals').fichiers, 1);

    const r = supprimerToutesLesDonnees(t.racines, t.racine);
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.deepEqual(r.violations, []);

    // La vérité est sur le disque, pas dans le rapport.
    assert.equal(existsSync(t.racines.progress), false, 'la progression survit');
    assert.equal(existsSync(t.racines.snapshot), false, 'l’instantané de secours survit');
    assert.equal(existsSync(t.racines.workspaces), false, 'les workspaces survivent');
    assert.equal(existsSync(t.racines.journals), false, 'les journaux survivent');
    assert.equal(r.supprime.every((l) => l.resteSurLeDisque === false), true);
  } finally { t.nettoyer(); }
});

test('CP2 — DELETE ALL emporte le CODE de l’apprenant, workspaces ET journaux', () => {
  const t = projetJetable();
  try {
    const journal = join(t.data, 'lab-journals', 'fizzbuzz.json');
    assert.match(readFileSync(journal, 'utf8'), /mon code raté/);
    supprimerToutesLesDonnees(t.racines, t.racine);
    assert.equal(existsSync(journal), false);
    assert.equal(existsSync(join(t.data, 'lab-workspaces', 'fizzbuzz', 'index.js')), false);
  } finally { t.nettoyer(); }
});

test('CP2 — DELETE ALL ne touche NI le curriculum, NI les exercices, NI le code source', () => {
  const t = projetJetable();
  try {
    supprimerToutesLesDonnees(t.racines, t.racine);
    assert.equal(readFileSync(join(t.data, 'exercises', 'fizzbuzz.json'), 'utf8'), '{"id":"fizzbuzz"}');
    assert.equal(readFileSync(join(t.data, 'program.json'), 'utf8'), '{"days":365}');
    assert.equal(readFileSync(join(t.racine, 'curriculum', 'j001.md'), 'utf8'), '# leçon');
    assert.equal(readFileSync(join(t.racine, 'lib', 'evidence.mjs'), 'utf8'), '// code source');
    assert.equal(existsSync(t.data), true, 'le répertoire data lui-même a été emporté');
  } finally { t.nettoyer(); }
});

test('CP2 — DELETE ALL ne crée AUCUN filet de sécurité : c’est sa différence avec RESET', () => {
  const t = projetJetable();
  try {
    supprimerToutesLesDonnees(t.racines, t.racine);
    assert.equal(existsSync(t.racines.snapshot), false);
    // Aucun fichier nouveau ne doit être apparu dans data/ pour « garder une trace ».
    assert.equal(existsSync(join(t.data, 'progress.backup.json')), false);
    assert.equal(existsSync(`${t.racines.progress}.backup.json`), false);
  } finally { t.nettoyer(); }
});

test('CP2 — DELETE ALL est idempotent : rejoué sur du vide, il reste ok', () => {
  const t = projetJetable();
  try {
    assert.equal(supprimerToutesLesDonnees(t.racines, t.racine).ok, true);
    const deux = supprimerToutesLesDonnees(t.racines, t.racine);
    assert.equal(deux.ok, true);
    assert.equal(deux.supprime.every((l) => l.etaitPresent === false), true);
    assert.equal(deux.supprime.every((l) => l.fichiersSupprimes === 0), true);
  } finally { t.nettoyer(); }
});

test('CP2 — le rapport compte les fichiers réellement supprimés', () => {
  const t = projetJetable();
  try {
    mkdirSync(join(t.data, 'lab-journals', 'sous'), { recursive: true });
    writeFileSync(join(t.data, 'lab-journals', 'sous', 'x.json'), '[]');
    assert.equal(compterFichiers(t.racines.journals), 2);
    const r = supprimerToutesLesDonnees(t.racines, t.racine);
    assert.equal(r.supprime.find((l) => l.id === 'lab-journals').fichiersSupprimes, 2);
    assert.equal(r.supprime.find((l) => l.id === 'progress').fichiersSupprimes, 1);
  } finally { t.nettoyer(); }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. L'archive complète
// ─────────────────────────────────────────────────────────────────────────────

test('CP2 — l’archive lit tous les journaux, donc le code de chaque tentative', () => {
  const t = projetJetable();
  try {
    writeFileSync(join(t.data, 'lab-journals', 'js-loops.json'), JSON.stringify([{ at: '2026-01-02T00:00:00.000Z', passed: 2, total: 2 }]));
    const j = exporterTousLesJournaux(t.racines.journals);
    assert.deepEqual(Object.keys(j).sort(), ['fizzbuzz', 'js-loops']);
    assert.equal(j.fizzbuzz[0].fichiers['index.js'], 'mon code raté');
  } finally { t.nettoyer(); }
});

test('CP2 — un journal illisible n’empêche pas d’exporter les autres', () => {
  const t = projetJetable();
  try {
    writeFileSync(join(t.data, 'lab-journals', 'casse.json'), '{ pas du json');
    const j = exporterTousLesJournaux(t.racines.journals);
    assert.deepEqual(Object.keys(j), ['fizzbuzz']);
  } finally { t.nettoyer(); }
});

test('CP2 — l’archive inclut l’instantané de secours, absent de la sauvegarde', () => {
  const t = projetJetable();
  try {
    assert.notEqual(lireInstantane(t.racines.snapshot), null);
    supprimerToutesLesDonnees(t.racines, t.racine);
    assert.equal(lireInstantane(t.racines.snapshot), null);
  } finally { t.nettoyer(); }
});

test('CP2 — après DELETE ALL, l’archive ne rend plus rien', () => {
  const t = projetJetable();
  try {
    supprimerToutesLesDonnees(t.racines, t.racine);
    assert.deepEqual(exporterTousLesJournaux(t.racines.journals), {});
    assert.equal(lireInstantane(t.racines.snapshot), null);
  } finally { t.nettoyer(); }
});
