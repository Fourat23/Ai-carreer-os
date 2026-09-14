// V76 · CP8 — LES RÉPONSES DES DÉFIS NE QUITTENT PLUS LE SERVEUR.
//
// ── LA RÉGRESSION QUE V75 NE POUVAIT PAS VOIR ───────────────────────────
//
// Le CP9 de V75 avait vérifié SIX choses sur chacun des 25 défis : structure,
// HTTP 200, réussite avec les bonnes réponses, échec avec les mauvaises, preuve
// valide, comptage par le moteur. Six vérifications sérieuses — **et aucune sur
// la fuite**.
//
// Le CP0 de V76 a mesuré que la page servait, dans sa charge utile,
// `"answer":0` et le texte complet d'`explanation` : les bonnes réponses
// étaient lisibles par « afficher le code source », avant toute tentative.
//
// ── CE QUE CES TESTS GARDENT ────────────────────────────────────────────
//
// La propriété, pas l'implémentation : **ce qui permet de répondre sans
// chercher ne doit pas atteindre le client avant la soumission**. Et son
// corollaire, qui a coûté une fonctionnalité : un client capable de se corriger
// seul est un client qui détient le corrigé.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { vuePubliqueDuDefi } from '../lib/transfer-challenge.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const DIR = join(ROOT, 'data/transfer-challenges');
const defis = () => readdirSync(DIR).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')));

// ── 1 · LA VUE PUBLIQUE RETIRE CE QU'IL FAUT, ET RIEN DE PLUS ───────────

test('V76 · CP8 — la vue publique retire `answer` et `explanation` des 25 défis', () => {
  const tous = defis();
  assert.equal(tous.length, 25, `${tous.length} défis trouvés, 25 attendus`);
  for (const c of tous) {
    const p = vuePubliqueDuDefi(c);
    for (const q of p.questions) {
      assert.ok(!('answer' in q), `${c.id}/${q.id} : \`answer\` survit à la vue publique`);
      assert.ok(!('explanation' in q), `${c.id}/${q.id} : \`explanation\` survit`);
    }
  }
});

test('V76 · CP8 — la vue publique CONSERVE tout ce que l’apprenant doit voir', () => {
  // Une vue qui retirerait l'énoncé ne fuirait pas non plus, et ne servirait à
  // rien. Le test garde les deux moitiés.
  for (const c of defis()) {
    const p = vuePubliqueDuDefi(c);
    assert.equal(p.id, c.id);
    assert.equal(p.title, c.title);
    assert.equal(p.transferLevel, c.transferLevel);
    assert.equal(p.questions.length, c.questions.length);
    for (const [i, q] of p.questions.entries()) {
      assert.equal(q.id, c.questions[i].id);
      assert.equal(q.prompt, c.questions[i].prompt);
      assert.deepEqual(q.options, c.questions[i].options);
      assert.equal(q.kind, c.questions[i].kind);
    }
  }
});

test('V76 · CP8 — sérialisée, la vue publique ne contient AUCUNE bonne réponse', () => {
  // Le test qui compte : c'est la SÉRIALISATION qui voyage jusqu'au navigateur,
  // pas l'objet. Un champ non énumérable ou un getter y apparaîtrait quand même.
  for (const c of defis()) {
    const json = JSON.stringify(vuePubliqueDuDefi(c));
    assert.doesNotMatch(json, /"answer"/, `${c.id} : « answer » dans la charge utile`);
    assert.doesNotMatch(json, /"explanation"/, `${c.id} : « explanation » dans la charge utile`);
    for (const q of c.questions) {
      const exp = String(q.explanation ?? '').trim();
      if (exp.length >= 30) {
        assert.ok(!json.includes(exp.slice(0, 40)), `${c.id}/${q.id} : texte d’explication présent`);
      }
    }
  }
});

// ── 2 · LA PAGE SERT LA VUE PUBLIQUE, ET LE TYPE L'IMPOSE ───────────────

test('V76 · CP8 — la page ne passe JAMAIS le défi complet au composant client', () => {
  const page = lire('app/transfer/[id]/page.tsx');
  assert.match(page, /vuePubliqueDuDefi\(/, 'la page n’utilise pas la vue publique');
  assert.match(page, /challenge=\{publique\}/, 'la page passe autre chose que la vue publique');
  assert.doesNotMatch(page, /challenge=\{challenge\}/, 'la page passe encore le défi complet');
});

test('V76 · CP8 — le TYPE du composant refuse le défi complet', () => {
  // La protection ne doit pas dépendre d'une relecture : le compilateur la tient.
  const runner = lire('app/transfer/[id]/ChallengeRunner.tsx');
  assert.match(runner, /challenge:\s*TransferChallengePublic/,
    'le composant accepte encore un défi complet');
  const d = lire('lib/transfer-challenge.d.ts');
  assert.match(d, /Omit<AssessmentQuestion, 'answer' \| 'explanation'>/,
    'le type public n’exclut pas explicitement les deux champs');
});

// ── 3 · LE CLIENT NE PEUT PLUS SE CORRIGER SEUL ─────────────────────────

test('V76 · CP8 — aucune correction dans le navigateur, et c’est la même propriété', () => {
  // Avant le CP8, un repli hors ligne corrigeait le défi côté client. Il ne
  // pouvait fonctionner que parce que la page recevait les réponses : **le
  // repli hors ligne ÉTAIT la fuite**, pas seulement une conséquence.
  const runner = lire('app/transfer/[id]/ChallengeRunner.tsx');
  assert.doesNotMatch(runner, /gradeTransferChallenge/,
    'le composant client corrige encore lui-même : il détient donc le corrigé');
  // Et il le DIT, au lieu de faire semblant.
  assert.match(runner, /la correction n’a pas pu être faite/,
    'le cas hors ligne ne dit pas que la correction est impossible');
});

test('V76 · CP8 — la correction affichée vient du RÉSULTAT de l’API', () => {
  const runner = lire('app/transfer/[id]/ChallengeRunner.tsx');
  assert.match(runner, /r\?\.expected/, 'la bonne réponse n’est pas lue depuis le résultat');
  assert.match(runner, /r\?\.explanation/, 'l’explication n’est pas lue depuis le résultat');
  assert.doesNotMatch(runner, /q\.answer|q\.explanation/,
    'le composant lit encore la réponse depuis le défi');
});

// ── 4 · L'ACCESSIBILITÉ MESURÉE AU CP2 ──────────────────────────────────

test('V76 · CP8 — le résultat d’une tentative est ANNONCÉ', () => {
  // Le CP2 a mesuré `aria-live = 0` sur cette page : un apprenant utilisant un
  // lecteur d'écran soumettait et n'apprenait rien de ce qui s'était passé.
  const runner = lire('app/transfer/[id]/ChallengeRunner.tsx');
  assert.match(runner, /aria-live="polite"/, 'aucune région vivante sur le résultat');
  // `polite` et non `assertive` : le verdict ne doit pas interrompre la lecture.
  assert.doesNotMatch(runner, /aria-live="assertive"/,
    'le verdict interrompt la lecture en cours');
  // La région doit ENTOURER le résultat, pas un élément quelconque.
  const iLive = runner.indexOf('aria-live="polite"');
  const iResultat = runner.indexOf('{result ? (', iLive);
  assert.ok(iResultat > iLive && iResultat - iLive < 700,
    'la région vivante n’entoure pas le bloc de résultat');
});
