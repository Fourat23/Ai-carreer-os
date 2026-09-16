// V77.1 · CP2 — CE QUE L'INTERFACE A LE DROIT DE PROMETTRE.
//
// Le CP0 n'a pas trouvé un bug : il a trouvé deux PHRASES fausses. Un test qui
// balaie du texte ne tient qu'une convention — la leçon payée deux fois en V76.
// Ces tests-ci ne tiennent donc pas une formulation : ils tiennent la RELATION
// entre ce qu'un bloc annonce et ce que la carte des données dit qu'il fait.
//
// Deux d'entre eux vérifient malgré tout l'absence littérale des deux phrases
// mesurées au CP0 : celles-là sont des faits historiques, pas du style.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CATEGORIES_DONNEES_APPRENANT, porteeDe, couvreToutesLesDonnees, CONFIRMATION_DE_SUPPRESSION,
} from '../lib/learner-data.mjs';

const PANNEAU = readFileSync(new URL('../app/settings/SettingsPanel.tsx', import.meta.url), 'utf8');
const RESET = readFileSync(new URL('../app/api/progress/reset/route.ts', import.meta.url), 'utf8');
const DELETE_ALL = readFileSync(new URL('../app/api/progress/delete-all/route.ts', import.meta.url), 'utf8');
const EXPORT_ALL = readFileSync(new URL('../app/api/progress/export-all/route.ts', import.meta.url), 'utf8');
const EXPORT = readFileSync(new URL('../app/api/progress/export/route.ts', import.meta.url), 'utf8');

/** Le corps du composant, hors du commentaire d'en-tête qui CITE les mensonges. */
function corpsDuPanneau() {
  const i = PANNEAU.indexOf('export default function SettingsPanel');
  assert.ok(i > 0, 'composant introuvable');
  return PANNEAU.slice(i);
}

/** Le bloc de réglages dont le titre contient `titre`. */
function bloc(titre) {
  const corps = corpsDuPanneau();
  const i = corps.indexOf(`<h3>${titre}`);
  assert.ok(i > 0, `bloc « ${titre} » introuvable`);
  const suite = corps.slice(i);
  const fin = suite.indexOf('<div className="settings-block');
  return fin > 0 ? suite.slice(0, fin) : suite;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Les deux phrases mesurées au CP0 ont disparu du composant
// ─────────────────────────────────────────────────────────────────────────────

test('CP2 — « toutes tes données locales » ne décrit plus la sauvegarde restaurable', () => {
  assert.equal(bloc('Exporter une sauvegarde restaurable').includes('toutes tes données'), false);
});

test('CP2 — le bloc de réinitialisation ne dit plus « irréversible »', () => {
  const b = bloc('Réinitialiser ma progression');
  assert.equal(b.includes('irréversible'), false);
  assert.equal(b.includes('Efface toute ta progression'), false);
});

test('CP2 — plus aucun bloc ne dit « tout sera effacé » puis « sauvegardé automatiquement »', () => {
  const corps = corpsDuPanneau();
  const i = corps.indexOf('Tout sera effacé');
  assert.equal(i, -1, 'la phrase contradictoire du CP0 est de retour');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. La relation : qui a le DROIT de dire « toutes »
// ─────────────────────────────────────────────────────────────────────────────

test('CP2 — seules les opérations qui couvrent les 4 catégories disent « toutes mes données »', () => {
  // La carte décide ; l'interface suit. Si un jour `archiveComplete` cesse de
  // couvrir une catégorie, ce test rougit avant que la phrase ne devienne fausse.
  assert.equal(couvreToutesLesDonnees('deleteAll'), true);
  assert.equal(couvreToutesLesDonnees('archiveComplete'), true);
  assert.equal(couvreToutesLesDonnees('reset'), false);
  assert.equal(couvreToutesLesDonnees('sauvegardeRestaurable'), false);

  const corps = corpsDuPanneau();
  const titresAvecToutes = [...corps.matchAll(/<h3>([^<]*)<\/h3>/g)]
    .map((m) => m[1])
    .filter((t) => /toutes mes données/i.test(t));
  assert.deepEqual(titresAvecToutes.sort(), ['Exporter toutes mes données', 'Supprimer toutes mes données']);
});

test('CP2 — la sauvegarde restaurable déclare explicitement ce qu’elle NE contient PAS', () => {
  const b = bloc('Exporter une sauvegarde restaurable');
  const journaux = CATEGORIES_DONNEES_APPRENANT.find((c) => c.id === 'lab-journals');
  assert.equal(journaux.sauvegardeRestaurable, 'ABSENT');
  assert.match(b, /ne contient pas tes journaux de tentatives/i);
  assert.match(b, /archive complète/i);
});

test('CP2 — le bloc de réinitialisation nomme les trois choses qui survivent', () => {
  const b = bloc('Réinitialiser ma progression');
  assert.match(b, /n'est pas une suppression|n’est pas une suppression/i);
  assert.match(b, /instantané/i);
  assert.match(b, /workspaces/i);
  assert.match(b, /journaux de tentatives/i);
  // Et il pointe vers l'opération qui, elle, efface pour de bon.
  assert.match(b, /Supprimer toutes mes données/);
});

test('CP2 — le bloc de suppression dit que le CODE part, et que le curriculum reste', () => {
  const b = bloc('Supprimer toutes mes données');
  assert.match(b, /définitivement/i);
  assert.match(b, /code que tu as\s+écrit|code que tu as écrit/i);
  assert.match(b, /Aucune sauvegarde n'est créée|Aucune sauvegarde n’est créée/i);
  assert.match(b, /leçons|exercices/i);
  assert.match(b, /ne sont pas\s+touchés|ne sont pas touchés/i);
});

test('CP2 — la suppression exige une saisie, pas seulement un clic', () => {
  const b = bloc('Supprimer toutes mes données');
  // Le mot est pinné EN CLAIR ici : le dériver de la constante rendrait ce test
  // vert même si quelqu'un la vidait (`M01`, V77 · CP14).
  assert.equal(CONFIRMATION_DE_SUPPRESSION, 'SUPPRIMER');
  assert.match(b, /settings-danger-input/);
  // Et l'interface l'IMPORTE au lieu de le recopier : le bouton et la route
  // exigent forcément le même mot.
  assert.match(PANNEAU, /import \{ CONFIRMATION_DE_SUPPRESSION \} from '@\/lib\/learner-data'/);
  assert.match(b, /deleteWord\.trim\(\) !== CONFIRMATION_DE_SUPPRESSION/);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Les routes
// ─────────────────────────────────────────────────────────────────────────────

test('CP2 — la route de suppression refuse un POST sans le mot de confirmation', () => {
  assert.match(DELETE_ALL, /CONFIRMATION_MANQUANTE/);
  assert.match(DELETE_ALL, /confirmation !== CONFIRMATION_DE_SUPPRESSION/);
  // La route importe le mot, elle ne le recopie pas.
  assert.match(DELETE_ALL, /import \{ CONFIRMATION_DE_SUPPRESSION \} from '@\/lib\/learner-data'/);
  assert.equal(DELETE_ALL.includes("'SUPPRIMER'"), false);
});

test('CP2 — la route de suppression ne crée aucun instantané', () => {
  assert.equal(/snapshotProgress/.test(DELETE_ALL), false);
});

test('CP2 — la route de réinitialisation, elle, en crée toujours un', () => {
  assert.match(RESET, /snapshotProgress\(\)/);
  assert.match(RESET, /porteeDe\('reset'\)/);
});

test('CP2 — l’archive complète lit les journaux ET l’instantané ; la sauvegarde ne les lit pas', () => {
  assert.match(EXPORT_ALL, /tousLesJournaux\(\)/);
  assert.match(EXPORT_ALL, /instantaneDeSecours\(\)/);
  assert.equal(/tousLesJournaux|instantaneDeSecours/.test(EXPORT), false);
});

test('CP2 — l’archive dérive sa liste de catégories de la carte, sans la recopier', () => {
  assert.match(EXPORT_ALL, /CATEGORIES_DONNEES_APPRENANT\.map/);
  for (const c of CATEGORIES_DONNEES_APPRENANT) {
    assert.equal(EXPORT_ALL.includes(`'${c.id}'`), false, `« ${c.id} » est recopié dans la route`);
  }
});

test('CP2 — l’archive se nomme autrement que la sauvegarde, et dit ne pas être restaurable', () => {
  assert.match(EXPORT_ALL, /archive-complete/);
  assert.match(bloc('Exporter toutes mes données'), /n'est pas restaurable|n’est pas restaurable/i);
});
