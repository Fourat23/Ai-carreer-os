// V76 · CP3 — L'ÉDITEUR COLORE-T-IL RÉELLEMENT CE QU'IL AFFICHE ?
//
// ── LE DÉFAUT MESURÉ, ET POURQUOI IL COMPTAIT ───────────────────────────
//
// `lib/exercise-files.mjs` déduit le langage de chaque fichier depuis son
// extension, et il le fait bien : `html`, `css`, `json`, `markdown`, `text` y
// sont reconnus. Mais `CodeMirrorEditor.tsx` n'en connaissait que quatre
// (`python`, `tsx`, `jsx`, `typescript`) et **retombait sur JavaScript pour tout
// le reste**.
//
// Conséquence sur le corpus réel : **11 fichiers `.html` et 3 fichiers `.css`**
// étaient colorés avec une grammaire JavaScript — dans les exercices `web`,
// c'est-à-dire précisément ceux où le langage EST le sujet.
//
// ── POURQUOI CE TEST EXISTE SOUS CETTE FORME ────────────────────────────
//
// Une capture d'écran ne prouve rien, et compter des `<span>` colorés non plus :
// une grammaire fausse produit AUSSI des jetons. Ce test compare donc les ARBRES
// SYNTAXIQUES produits par les deux grammaires sur le même texte, et exige que
// la bonne reconnaisse des nœuds que la mauvaise ne peut pas produire.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { detectLanguage } from '../lib/exercise-files.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');

/** Les noms de nœuds de l'arbre syntaxique produit par une grammaire. */
function noeuds(doc, extension) {
  const state = EditorState.create({ doc, extensions: [extension] });
  const arbre = syntaxTree(state);
  const vus = new Set();
  arbre.cursor().iterate((n) => { vus.add(n.name); });
  return vus;
}

// ── 1 · LA GRAMMAIRE CORRECTE VOIT CE QUE LA MAUVAISE NE VOIT PAS ───────

test('V76 · CP3 — la grammaire HTML reconnaît des nœuds que JavaScript ne peut pas produire', () => {
  const doc = '<!doctype html>\n<div class="card"><h2>Titre</h2></div>\n';
  const avecHtml = noeuds(doc, html());
  const avecJs = noeuds(doc, javascript());

  // Des noms de nœuds propres au HTML : élément, nom de balise, attribut.
  const propres = ['Element', 'TagName', 'Attribute', 'AttributeName'].filter((n) => avecHtml.has(n));
  assert.ok(propres.length >= 3, `la grammaire HTML ne reconnaît que ${[...avecHtml].join(',')}`);
  for (const n of propres) {
    assert.ok(!avecJs.has(n), `\`${n}\` apparaît aussi en grammaire JavaScript : le test ne discrimine pas`);
  }
});

test('V76 · CP3 — la grammaire CSS reconnaît des nœuds que JavaScript ne peut pas produire', () => {
  const doc = '.card { max-width: 320px; border: 1px solid #ccc; }\n';
  const avecCss = noeuds(doc, css());
  const avecJs = noeuds(doc, javascript());

  const propres = ['RuleSet', 'ClassSelector', 'Declaration', 'PropertyName'].filter((n) => avecCss.has(n));
  assert.ok(propres.length >= 3, `la grammaire CSS ne reconnaît que ${[...avecCss].join(',')}`);
  for (const n of propres) {
    assert.ok(!avecJs.has(n), `\`${n}\` apparaît aussi en grammaire JavaScript : le test ne discrimine pas`);
  }
});

test('V76 · CP3 — sur du CSS réel, la grammaire JavaScript produit des ERREURS d’analyse', () => {
  // La preuve que le repli JavaScript n'était pas « un peu moins joli » mais
  // faux : il n'arrive pas à analyser le document.
  const doc = '.card { max-width: 320px; }\n';
  assert.ok(noeuds(doc, javascript()).has('⚠'), 'la grammaire JS analyse ce CSS sans erreur : le défaut n’en était pas un');
  assert.ok(!noeuds(doc, css()).has('⚠'), 'la grammaire CSS échoue sur du CSS valide');
});

// ── 2 · L'ÉDITEUR CÂBLE-T-IL RÉELLEMENT CES GRAMMAIRES ? ────────────────
//
// Les tests ci-dessus valident les grammaires. Celui-ci valide le BRANCHEMENT —
// c'est la distinction que V75 a payée trois fois : un moteur correct mais non
// branché n'aide personne.

test('V76 · CP3 — l’éditeur câble `html()` et `css()`, pas seulement les importe', () => {
  const src = lire('app/lab/[exerciseId]/CodeMirrorEditor.tsx');
  const code = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
  assert.match(code, /import \{ html \} from '@codemirror\/lang-html'/);
  assert.match(code, /import \{ css \} from '@codemirror\/lang-css'/);
  // Le branchement lui-même : une comparaison sur le langage, pas un import mort.
  assert.match(code, /language === 'html'\)\s*return html\(\)/);
  assert.match(code, /language === 'css'\)\s*return css\(\)/);
});

// ── 3 · LE CORPUS EXIGE-T-IL CES DEUX LANGAGES, ET SEULEMENT CEUX-LÀ ? ──
//
// Le contrat interdit d'ajouter des capacités que les données ne justifient pas
// (`G13`). Ce test garde la décision dans les deux sens : il exige que `html` et
// `css` soient nécessaires, ET que rien d'autre ne soit resté sur le carreau.

test('V76 · CP3 — chaque langage détecté dans le corpus est réellement câblé', () => {
  const dir = join(ROOT, 'data/exercises');
  const compte = {};
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const j = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    for (const w of j.workspace?.files ?? []) {
      if (w.hidden) continue;
      const lang = w.language ?? detectLanguage(w.path);
      compte[lang] = (compte[lang] ?? 0) + 1;
    }
  }
  // Le corpus DOIT contenir du HTML et du CSS, sinon l'ajout du CP3 serait
  // une capacité pour personne — exactement ce que `G13` interdit.
  assert.ok((compte.html ?? 0) >= 5, `seulement ${compte.html ?? 0} fichier(s) HTML : l’ajout ne serait pas justifié`);
  assert.ok((compte.css ?? 0) >= 1, `seulement ${compte.css ?? 0} fichier(s) CSS : l’ajout ne serait pas justifié`);

  // Et réciproquement : aucun langage fréquent ne doit rester sans grammaire.
  const code = lire('app/lab/[exerciseId]/CodeMirrorEditor.tsx');
  const CABLES = new Set(['python', 'html', 'css', 'tsx', 'jsx', 'typescript', 'javascript']);
  const orphelins = Object.entries(compte)
    .filter(([lang, n]) => n >= 3 && !CABLES.has(lang))
    .map(([lang, n]) => `${lang}(${n})`);
  assert.deepEqual(orphelins, [],
    `langage(s) fréquent(s) sans grammaire dédiée : ${orphelins.join(' ')} — ${code.length ? '' : 'éditeur introuvable'}`);
});
