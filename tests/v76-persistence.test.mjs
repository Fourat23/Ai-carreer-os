// V76 · CP9 — PERSISTANCE, BROUILLON PÉRIMÉ, RÉINITIALISATION.
//
// ── LA MENACE QUE LE CP0 AVAIT DÉCLARÉE SANS LA MESURER ─────────────────
//
// `T20` du modèle de menace : « brouillon périmé écrasant un plus récent —
// **non mesuré** ». Le CP9 l'a mesuré, et le scénario se produisait :
//
//   1. l'onglet A est ouvert, puis laissé de côté ;
//   2. l'onglet B travaille et enregistre ;
//   3. l'onglet A sauvegarde (autosave, fermeture d'onglet, `sendBeacon`) et
//      renvoie SON état, vieux d'une heure ;
//   4. **le travail de B disparaît, sans trace et sans avertissement.**
//
// ── LA RÈGLE QUI NE SE NÉGOCIE PAS ──────────────────────────────────────
//
// Contrat gelé §1.11 : *aucun `RESET` n'efface jamais un `ATTEMPT`, une
// `SUBMISSION` ou une `EVIDENCE`.* Un apprenant doit pouvoir repartir de zéro
// **sans perdre la preuve qu'il a travaillé** — effacer l'histoire d'un échec
// est le contournement `R4` de V75.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { revisionDe } from '../lib/workspace-fs.mjs';
import { decisionDeSauvegarde } from '../lib/workspace.mjs';
import { lectureDuRefus } from '../lib/workspace-conflit.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');

// ── 1 · LA RÉVISION EST STABLE ET DISCRIMINANTE ─────────────────────────

test('V76 · CP9 — même contenu ⇒ même révision, contenu différent ⇒ révision différente', () => {
  // Une révision fondée sur l'horloge donnerait deux valeurs pour un contenu
  // identique, et ferait échouer une sauvegarde qui ne change rien.
  assert.equal(revisionDe('const a = 1;\n'), revisionDe('const a = 1;\n'));
  assert.notEqual(revisionDe('const a = 1;\n'), revisionDe('const a = 2;\n'));
  // Un espace compte : deux fichiers qui diffèrent d'un caractère sont deux
  // bases différentes.
  assert.notEqual(revisionDe('a'), revisionDe('a '));
});

test('V76 · CP9 — la révision reste courte et lisible', () => {
  const r = revisionDe('x');
  assert.match(r, /^[0-9a-f]{12}$/, `révision inattendue : ${r}`);
});

test('V76 · CP9 — un contenu vide ou absent a quand même une révision', () => {
  // Sinon un fichier neuf n'aurait pas de base, et la protection sauterait
  // précisément au moment où deux onglets créent le même fichier.
  assert.match(revisionDe(''), /^[0-9a-f]{12}$/);
  assert.match(revisionDe(undefined), /^[0-9a-f]{12}$/);
  assert.equal(revisionDe(''), revisionDe(undefined));
});

// ── 2 · LA RÉVISION VOYAGE JUSQU'AU CLIENT, ET REVIENT ──────────────────

test('V76 · CP9 — la révision est servie avec chaque fichier', () => {
  const fs_ = lire('lib/workspace-fs.mjs');
  assert.match(fs_, /rev:\s*revisionDe\(content\)/, 'l’arborescence ne porte pas de révision');
  const cf = lire('lib/exercise-files.mjs');
  assert.match(cf, /rev:\s*f\.rev/, 'la vue client perd la révision en chemin');
});

test('V76 · CP9 — le client renvoie sa base à la SAUVEGARDE, et pas au lancement', () => {
  // Un `run` juge le code présent ; il n'arbitre pas une concurrence d'écriture.
  // Y exiger une révision ferait échouer une exécution pour une raison sans
  // rapport avec ce que l'apprenant vient de faire.
  const ui = lire('app/lab/[exerciseId]/LabWorkspace.tsx');
  assert.match(ui, /action === 'save' \? \{ revs: revs\.current \}/,
    'les révisions ne sont pas réservées à la sauvegarde');
});

// ── 3 · LE SERVEUR REFUSE UNE BASE PÉRIMÉE ──────────────────────────────

// ── LA DÉCISION EST EXERCÉE, PAS CHERCHÉE DANS DU TEXTE ────────────────
//
// Trois mutations ont survécu au premier passage de ce fichier : mes tests
// cherchaient `conflitsDeRevision(` et `status: 409` DANS LA ROUTE. Neutraliser
// la condition (`if (false && conflits.length)`) les laissait tous verts. **Le
// texte prouvait qu'un appel existait, jamais qu'il servait à quelque chose.**
//
// La décision est donc devenue pure (`decisionDeSauvegarde`), et les tests
// l'appellent.

test('V76 · CP9 — une base PÉRIMÉE est refusée', () => {
  const d = decisionDeSauvegarde({ 'solution.mjs': 'aaa' }, { 'solution.mjs': 'bbb' });
  assert.equal(d.refuse, true, 'une base périmée est acceptée : le travail récent serait écrasé');
  assert.equal(d.conflits.length, 1);
  assert.deepEqual(d.conflits[0], { path: 'solution.mjs', revAttendue: 'aaa', revActuelle: 'bbb' });
});

test('V76 · CP9 — une base À JOUR passe', () => {
  // La moitié qu'on oublie : un refus systématique « protégerait » tout aussi
  // bien, et rendrait la sauvegarde impossible.
  const d = decisionDeSauvegarde({ 'solution.mjs': 'aaa' }, { 'solution.mjs': 'aaa' });
  assert.equal(d.refuse, false);
  assert.equal(d.conflits.length, 0);
});

test('V76 · CP9 — sans révisions annoncées, rien n’est refusé (pas de casse)', () => {
  // Un client qui ne les connaît pas encore perd la protection, jamais sa
  // sauvegarde.
  for (const sans of [undefined, null, {}, 'pas un objet']) {
    assert.equal(decisionDeSauvegarde(sans, { 'a.mjs': 'x' }).refuse, false, `refusé pour ${JSON.stringify(sans)}`);
  }
  assert.equal(decisionDeSauvegarde({ 'a.mjs': '' }, { 'a.mjs': 'x' }).refuse, false, 'révision vide traitée comme une base');
});

test('V76 · CP9 — un fichier inconnu du serveur est une CRÉATION, pas un conflit', () => {
  assert.equal(decisionDeSauvegarde({ 'neuf.mjs': 'aaa' }, {}).refuse, false);
});

test('V76 · CP9 — plusieurs fichiers : seuls ceux qui ont bougé sont en conflit', () => {
  const d = decisionDeSauvegarde(
    { 'a.mjs': 'x', 'b.mjs': 'y', 'c.mjs': 'z' },
    { 'a.mjs': 'x', 'b.mjs': 'CHANGÉ', 'c.mjs': 'z' },
  );
  assert.equal(d.refuse, true);
  assert.deepEqual(d.conflits.map((c) => c.path), ['b.mjs']);
});

test('V76 · CP9 — la route DÉLÈGUE à cette décision et refuse en 409', () => {
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  assert.match(route, /conflitsDeRevision\(/, 'la route ne vérifie aucune révision');
  assert.match(route, /status:\s*409/, 'le conflit n’a pas son propre statut');
  const srv = lire('lib/workspace-server.ts');
  assert.match(srv, /decisionDeSauvegarde\(/, 'le read-model réimplémente la décision au lieu de la réutiliser');
  // Et le contenu actuel accompagne le refus, pour que rien ne soit perdu de vue.
  assert.match(srv, /contenuActuel:\s*actuels\.get/, 'le conflit ne rend pas le contenu de l’autre version');
});

test('V76 · CP9 — dans la branche « save », AUCUNE écriture avant la vérification', () => {
  // Mutation M4 du premier passage : déplacer l'écriture avant le contrôle le
  // rendait décoratif. On regarde donc ce qui se trouve ENTRE le début de la
  // branche et la vérification, pas seulement leur ordre d'apparition.
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  const iBranche = route.indexOf("if (action === 'save') {");
  const iVerif = route.indexOf('conflitsDeRevision(', iBranche);
  assert.ok(iBranche > 0 && iVerif > iBranche, 'la branche « save » ne vérifie rien');
  const avant = route.slice(iBranche, iVerif);
  assert.ok(!avant.includes('writeWorkspaceFile'),
    'un fichier est écrit AVANT la vérification de révision : le contrôle ne sert à rien');
});

// ── 4 · L'APPRENANT EST AVERTI, ET DÉCIDE ───────────────────────────────

// ── LE REFUS EST LU PAR UNE FONCTION, PAS PAR UNE RELECTURE ────────────
//
// Mutation M11 du premier passage : « la surface ignore le conflit » a SURVÉCU.
// Le test cherchait `setConflit(` dans le composant, qui en contient deux — la
// remise à zéro après un succès suffisait à le garder vert pendant que la
// branche de refus disparaissait. La lecture est donc devenue pure.

test('V76 · CP9 — un refus est LU comme un refus', () => {
  const r = lectureDuRefus({
    ok: false, conflit: true,
    conflits: [{ path: 'solution.mjs', revAttendue: 'a', revActuelle: 'b', contenuActuel: '// récent' }],
  });
  assert.ok(r, 'un refus explicite n’est pas vu comme un refus : rien ne s’affichera');
  assert.equal(r.conflits.length, 1);
  assert.equal(r.conflits[0].path, 'solution.mjs');
  assert.equal(r.conflits[0].contenuActuel, '// récent');
});

test('V76 · CP9 — une sauvegarde RÉUSSIE n’annonce rien (et éteint l’avertissement)', () => {
  // La moitié qu'on oublie : une lecture qui verrait un conflit partout
  // afficherait l'alerte en permanence, et elle ne voudrait plus rien dire.
  assert.equal(lectureDuRefus({ ok: true, files: [] }), null);
  assert.equal(lectureDuRefus({ ok: false, error: 'autre chose' }), null, 'une erreur ordinaire est prise pour un conflit');
  for (const rien of [undefined, null, 'pas un objet', {}]) {
    assert.equal(lectureDuRefus(rien), null, `refus fabriqué pour ${JSON.stringify(rien)}`);
  }
});

test('V76 · CP9 — un refus qui ne nomme aucun fichier n’est pas affiché', () => {
  // « Quelque chose a changé, quelque part » inquiète sans rien apprendre.
  assert.equal(lectureDuRefus({ ok: false, conflit: true, conflits: [] }), null);
  assert.equal(lectureDuRefus({ ok: false, conflit: true, conflits: [{ revActuelle: 'b' }] }), null);
  // Un contenu absent reste affichable : le NOM du fichier suffit à avertir.
  const r = lectureDuRefus({ ok: false, conflit: true, conflits: [{ path: 'a.mjs' }] });
  assert.equal(r.conflits[0].contenuActuel, null);
});

test('V76 · CP9 — un refus de sauvegarde se VOIT, et n’est pas résolu à sa place', () => {
  const ui = lire('app/lab/[exerciseId]/LabWorkspace.tsx');
  assert.match(ui, /lectureDuRefus\(/, 'la surface ne lit pas la réponse de sauvegarde');
  assert.match(ui, /Ce fichier a changé ailleurs/, 'aucun message n’est rendu');
  assert.match(ui, /Rien n’a été écrasé/, 'le message ne rassure pas sur l’essentiel');
  // Aucune résolution automatique : ni fusion devinée, ni écrasement « au mieux ».
  const code = ui.split('\n').filter((l) => !/^\s*(\/\/|\*|\{\/\*)/.test(l)).join('\n');
  assert.doesNotMatch(code, /forceSave|ecraserQuandMeme|overwrite: true/i,
    'la surface propose de forcer l’écrasement');
});

test('V76 · CP9 — le conflit est rendu comme un AVERTISSEMENT, pas comme une note', () => {
  // À distinguer de `.lab-provenance`, qui décrit sans demander de décision.
  // Ici, quelque chose attend un choix de l'apprenant.
  const css = lire('app/globals.css');
  const bloc = css.slice(css.indexOf('.wb-conflit'), css.indexOf('.wb-conflit') + 320);
  assert.ok(bloc.length > 20, 'le conflit n’a pas de style propre');
  assert.match(bloc, /--warn/, 'le conflit ne se distingue pas visuellement');
  const ui = lire('app/lab/[exerciseId]/LabWorkspace.tsx');
  assert.match(ui, /className="wb-conflit" role="alert"/, 'le conflit n’est pas annoncé');
});

// ── 5 · LA RÈGLE QUI NE SE NÉGOCIE PAS ──────────────────────────────────

test('V76 · CP9 — aucune action de réinitialisation ne touche aux faits', () => {
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  // Les deux branches de reset doivent agir sur l'ESPACE DE TRAVAIL seulement.
  for (const action of ["action === 'reset'", "action === 'reset-file'"]) {
    const i = route.indexOf(action);
    assert.ok(i > 0, `branche ${action} introuvable`);
    const bloc = route.slice(i, i + 400);
    for (const interdit of ['applyCommand', 'writeProgress', 'exerciseAttempts', 'evidence']) {
      assert.ok(!bloc.includes(interdit),
        `${action} touche aux faits (« ${interdit} ») : le contrat §1.11 l’interdit`);
    }
  }
});

test('V76 · CP9 — `RESET_EXERCISE` n’existe pas, et le vocabulaire reste fermé', () => {
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  assert.ok(!route.includes("'reset-exercise'"), '`RESET_EXERCISE` a été créé : le contrat le refuse');
  assert.match(route, /Action inconnue/, 'une action inconnue n’est pas refusée');
});
