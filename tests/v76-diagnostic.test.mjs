// V76 · CP6 — LE DIAGNOSTIC PÉDAGOGIQUE.
//
// ── CE QUE CES TESTS GARDENT ────────────────────────────────────────────
//
// Le CP0 a mesuré que l'échelle d'aide montait sur le NOMBRE de tentatives,
// jamais sur la MANIÈRE d'échouer — alors que le produit savait déjà qu'un test
// attendait `"C"` et avait reçu `"F"`. La route jetait l'information.
//
// Deux propriétés à garder, et la seconde compte plus que la première :
//
//   1. le symptôme observé est DÉDUIT du résultat de test ;
//   2. **quand le test ne permet rien d'en déduire, le produit le DIT** au lieu
//      d'inventer une piste. Une piste inventée est pire qu'un silence :
//      l'apprenant la suit.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { diagnostiquer, lectureDuDiagnostic, CLASSES, PISTE_PAR_CLASSE } from '../lib/diagnostic.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const t = (o) => ({ id: o.id ?? 't', name: o.name ?? 'un cas', passed: false, ...o });

// ── 1 · LE REPLI HONNÊTE — LE TEST LE PLUS IMPORTANT ────────────────────

test('V76 · CP6 — un test qui ne publie rien ne produit AUCUN diagnostic inventé', () => {
  const d = diagnostiquer({ resultatsPublics: [t({ name: 'sortie attendue' })] });
  assert.equal(d.classe, 'INDETERMINE');
  assert.match(d.observation, /ne publie ni attendu ni reçu|ne peut pas dire/);
  const l = lectureDuDiagnostic(d);
  assert.equal(l.exploitable, false, 'un diagnostic indéterminé ne doit pas se déclarer exploitable');
});

test('V76 · CP6 — `exploitable: false` empêche le symptôme de remonter à l’échelle d’aide', () => {
  // La route ne transmet l'observation à `remedier` que si elle est exploitable.
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  assert.match(route, /diagnostic\?\.exploitable/,
    'la route doit vérifier `exploitable` avant de transmettre l’observation');
});

// ── 2 · CHAQUE CLASSE EST DÉDUITE D'UNE FORME OBSERVÉE ──────────────────

test('V76 · CP6 — un écart de TYPE est nommé comme tel, pas comme un écart de valeur', () => {
  const d = diagnostiquer({ resultatsPublics: [t({ name: 'renvoie un nombre', expected: 3, received: '3' })] });
  assert.equal(d.classe, 'TYPE');
  assert.match(d.observation, /nombre.*texte|texte.*nombre/);
});

test('V76 · CP6 — un écart de CARDINALITÉ est nommé comme tel', () => {
  const d = diagnostiquer({ resultatsPublics: [t({ name: 'trois éléments', expected: [1, 2, 3], received: [1, 2] })] });
  assert.equal(d.classe, 'CARDINALITE');
  assert.match(d.observation, /3 élément\(s\).*2/);
});

test('V76 · CP6 — un seul cas en échec parmi plusieurs est OBSERVÉ, jamais interprété', () => {
  const d = diagnostiquer({
    resultatsPublics: [
      t({ id: 't1', name: '95 -> A', passed: true }),
      t({ id: 't2', name: '85 -> B', passed: true }),
      t({ id: 't3', name: '70 -> C (borne)', expected: 'C', received: 'F' }),
      t({ id: 't4', name: '50 -> F', passed: true }),
    ],
  });
  assert.equal(d.classe, 'CAS_ISOLE');
  assert.match(d.observation, /Un seul cas échoue sur 4/);
  assert.match(d.observation, /« C »/);
  assert.match(d.observation, /« F »/);
  // ── LA PROPRIÉTÉ QUE L'ANOMALIE n° 5 A IMPOSÉE ──
  //
  // La piste ne doit NOMMER AUCUNE CAUSE. « C'est une borne » était vrai sur
  // `py-debug-grades` et faux sur `react-counter`, où le compteur démarre
  // simplement à 0 au lieu de 7. Le produit voit un cas isolé ; il ne sait pas
  // pourquoi il est isolé, et il ne doit pas faire semblant.
  const piste = lectureDuDiagnostic(d).piste;
  assert.doesNotMatch(piste, /borne|limite|comparaison|condition/i,
    `la piste nomme une cause que le test ne permet pas de déduire : « ${piste} »`);
  assert.match(piste, /compare|sépare/i, 'la piste doit proposer une démarche');
});

test('V76 · CP6 — un test de CONDITION (DOM) ne produit pas de faux diagnostic', () => {
  // Les assertions de DOM publient des sentinelles : `expected: null`,
  // `received: false`. « Attend null et reçoit false » est vrai et vide — pire,
  // ça a l'air d'un diagnostic. Mesuré sur `web-card` en conditions réelles.
  const d = diagnostiquer({ resultatsPublics: [t({ name: 'une image présente', expected: null, received: false })] });
  assert.equal(d.classe, 'INDETERMINE');
  assert.doesNotMatch(d.observation, /attend null|reçoit false/);
  assert.match(d.observation, /condition|sans publier/i);
  assert.equal(lectureDuDiagnostic(d).exploitable, false);
});

test('V76 · CP6 — deux cas en échec ne sont PAS une borne', () => {
  // Le contournement tentant : appeler « borne » tout écart primitif, parce que
  // la phrase est jolie. La forme doit le montrer, ou la classe change.
  const d = diagnostiquer({
    resultatsPublics: [
      t({ id: 't1', name: 'a', passed: true }),
      t({ id: 't2', name: 'b', expected: 'C', received: 'F' }),
      t({ id: 't3', name: 'c', expected: 'B', received: 'F' }),
    ],
  });
  assert.equal(d.classe, 'VALEUR');
});

test('V76 · CP6 — quand RIEN ne passe, le symptôme le dit au lieu de pointer un cas', () => {
  const d = diagnostiquer({
    resultatsPublics: [
      t({ id: 't1', name: 'a', expected: 1, received: undefined }),
      t({ id: 't2', name: 'b', expected: 2, received: undefined }),
    ],
  });
  assert.equal(d.classe, 'RIEN_NE_PASSE');
  assert.match(d.observation, /Aucun des 2/);
  assert.match(lectureDuDiagnostic(d).piste, /en amont|forme/i);
});

test('V76 · CP6 — un échec de COMPILATION ne dit rien de la notion, et le dit', () => {
  const d = diagnostiquer({ phase: 'compile', compilation: [{ message: "Type 'string' is not assignable", line: 7, file: 'solution.ts' }] });
  assert.equal(d.classe, 'COMPILATION');
  assert.match(d.observation, /ligne 7/);
  assert.equal(d.sur, 'solution.ts');
  assert.match(lectureDuDiagnostic(d).piste, /ne dit rien de la notion/);
});

test('V76 · CP6 — un dépassement de délai est nommé, pas confondu avec un mauvais résultat', () => {
  const d = diagnostiquer({ phase: 'timeout' });
  assert.equal(d.classe, 'ERREUR_LEVEE');
  assert.match(d.observation, /délai|termine/);
});

// ── 3 · CE QUE LE DIAGNOSTIC NE DOIT JAMAIS FAIRE ───────────────────────

test('V76 · CP6 — le diagnostic ne donne JAMAIS le correctif', () => {
  // Contrat §1.10 : la correction complète est la dernière marche de l'échelle,
  // et le diagnostic est la première. S'il donnait la réponse, l'échelle
  // n'existerait plus.
  const cas = [
    diagnostiquer({ resultatsPublics: [t({ name: 'x', expected: 'C', received: 'F' })] }),
    diagnostiquer({ resultatsPublics: [t({ name: 'y', expected: [1, 2], received: [1] })] }),
    diagnostiquer({ phase: 'compile', compilation: [{ message: 'oops', line: 1 }] }),
  ];
  // ── LA MUTATION QUI A SURVÉCU AU PREMIER PASSAGE ──
  //
  // La première version de ce test n'examinait que TROIS observations
  // échantillonnées. Une mutation remplaçant la piste de `TYPE` par « Il faut
  // écrire un Number() autour de la valeur retournée » est restée VERTE : la
  // classe mutée n'était pas dans l'échantillon. Un test qui ne regarde que
  // trois cas sur huit garde trois cas sur huit.
  //
  // On vérifie donc TOUTES les pistes déclarées, sans exception, plus les
  // observations échantillonnées.
  // ── CE QU'EST RÉELLEMENT « DONNER LE CORRECTIF » ──
  //
  // Première version de ce durcissement : interdire tout verbe à l'impératif.
  // Elle refusait « Corrige d'abord ce que l'outil signale », qui est une
  // consigne d'ORDRE (traite la compilation avant le fond) et ne contient aucune
  // réponse. Affaiblir cette phrase pour satisfaire le test aurait été le
  // contournement `G12` : on teste alors le test, pas le produit.
  //
  // Donner le correctif, c'est nommer le CONTENU du changement : un opérateur,
  // un appel, une valeur, un « remplace X par Y ». C'est cela qu'on interdit.
  const DONNE_LA_REPONSE = [
    /remplace[^.]*\bpar\b/i,          // « remplace > par >= »
    /\b(écris|écrire|mets|ajoute)\b[^.]*\b(Number|String|return|parseInt|await|async|map|filter)\b/i,
    /[<>=!]=+|\+\+|--(?!\s)/,        // un opérateur cité tel quel
    /\b\w+\(\)/,                     // un appel de fonction cité tel quel
    /la solution est|il suffit de/i,
  ];
  const nuDeToutCorrectif = (texte, ou) => {
    for (const re of DONNE_LA_REPONSE) {
      assert.doesNotMatch(texte, re, `${ou} donne le contenu du correctif : « ${texte.slice(0, 130)} »`);
    }
  };
  for (const [classe, piste] of Object.entries(PISTE_PAR_CLASSE)) nuDeToutCorrectif(piste, `la piste de ${classe}`);
  for (const d of cas) nuDeToutCorrectif(d.observation, 'l’observation');
});

test('V76 · CP6 — aucune valeur affichée n’est un pavé', () => {
  const long = 'x'.repeat(5000);
  const d = diagnostiquer({ resultatsPublics: [t({ name: 'long', expected: long, received: 'y' })] });
  assert.ok(d.observation.length < 400, `observation de ${d.observation.length} caractères`);
});

test('V76 · CP6 — chaque classe déclarée possède sa piste', () => {
  for (const c of CLASSES) {
    assert.ok(typeof PISTE_PAR_CLASSE[c] === 'string' && PISTE_PAR_CLASSE[c].length > 20,
      `la classe ${c} n’a pas de piste rédigée`);
  }
});

// ── 4 · LE BRANCHEMENT — LA LEÇON DE V75, APPLIQUÉE ─────────────────────

test('V76 · CP6 — le diagnostic est calculé sur les tests PUBLICS uniquement', () => {
  // Le tirer d'un test privé publierait son attendu : l'anti-fuite prime sur la
  // qualité du retour, et c'est le sens de `splitAttempt` depuis V74.
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  assert.match(route, /resultatsPublics:\s*publicResults/,
    'le diagnostic doit être calculé sur `publicResults`, jamais sur `attempt.results` complet');
});

test('V76 · CP6 — le diagnostic est RENDU à l’apprenant, pas seulement calculé', () => {
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  assert.match(route, /remediation,\s*diagnostic\s*\}/, 'la route ne publie pas le diagnostic');
  const ui = lire('app/lab/[exerciseId]/LabWorkspace.tsx');
  assert.match(ui, /setDiagnostic/, 'la surface ne lit pas le diagnostic');
  assert.match(ui, /diagnostic\.observation/, 'l’observation n’est pas rendue');
  assert.match(ui, /diagnostic\.piste/, 'la piste n’est pas rendue');
});

test('V76 · CP6 — le symptôme est VISUELLEMENT distinct de l’aide qui suit', () => {
  // Les confondre ferait lire une observation comme une instruction.
  const css = lire('app/globals.css');
  assert.match(css, /\.lab-diag\b/, 'le diagnostic n’a pas de style propre');
  assert.match(css, /\.lab-diag--flou/, 'le cas « non exploitable » n’est pas distingué visuellement');
});

test('V76 · CP6 — « aucun test ne passe » ne cite pas un cas vide non plus', () => {
  // Le même défaut ressortait par une autre branche : la cascade filtrait les
  // valeurs non informatives trop tard, et « attend null et reçoit false »
  // réapparaissait sur `web-card`. Le prédicat s'applique désormais PARTOUT.
  const d = diagnostiquer({
    resultatsPublics: [
      t({ id: 't1', name: 'une image', expected: null, received: false }),
      t({ id: 't2', name: 'un titre', expected: null, received: false }),
    ],
  });
  assert.equal(d.classe, 'RIEN_NE_PASSE');
  assert.doesNotMatch(d.observation, /attend null|reçoit false/);
  assert.match(d.observation, /sans publier de valeur comparable/);
});
