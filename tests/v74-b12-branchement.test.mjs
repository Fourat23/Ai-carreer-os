// V74 · CP12 — LE CRITÈRE BLOQUANT B12, gardé par un test.
//
// > « READY est interdit si le scheduler n'est pas réellement utilisé par le
// >   produit. »  — critère B12 du contrat gelé
//
// L'audit du CP12 a établi qu'entre le CP2 et le CP11, **aucun des six modules
// écrits n'était atteignable depuis le produit** : zéro référence dans `app/`,
// zéro read-model. Six modules, des centaines de tests verts, et rien qu'un
// apprenant puisse voir.
//
// Ce fichier existe pour que cela ne puisse pas se reproduire en silence. Il ne
// teste pas une fonction : il teste un **branchement**. Si quelqu'un débranche
// le moteur, la suite rougit — c'est la seule façon de rendre B12 vérifiable
// autrement que par une lecture humaine.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');

const READ_MODEL = 'lib/plan-jour-server.ts';
const PAGE_RETENTION = 'app/retention/page.tsx';
const STATION = 'app/retention/RecallStation.tsx';
const ROUTE_LAB = 'app/api/lab/[exerciseId]/route.ts';
const LAB_UI = 'app/lab/[exerciseId]/LabWorkspace.tsx';

test('B12 · le read-model du plan du jour existe et assemble la CHAÎNE COMPLÈTE', () => {
  const src = lire(READ_MODEL);
  assert.ok(src, `${READ_MODEL} est introuvable : le moteur n’a plus de surface`);
  // Chacun de ces modules représente un checkpoint. En retirer un du read-model
  // revient à débrancher ce checkpoint du produit.
  for (const [module, cp] of [
    ['./learner-memory', 'CP2'],
    ['./retention-priority', 'CP3'],
    ['./retention-scheduler', 'CP4'],
    ['./retrieval-task', 'CP5'],
    ['./daily-plan', 'CP10'],
  ]) {
    assert.ok(src.includes(`from '${module}'`), `${cp} (${module}) n’est plus branché au produit`);
  }
});

test('B12 · la page de réactivation APPELLE bien le plan du jour', () => {
  const src = lire(PAGE_RETENTION);
  // On exige la forme d'un APPEL affecté, pas la simple présence du nom.
  //
  // La première version de ce test se contentait de `includes('getPlanDuJour')`.
  // Une mutation qui remplaçait l'appel par un objet vide **passait** : le nom
  // subsistait dans un `as ReturnType<typeof getPlanDuJour>`. Le test gardait
  // la présence d'une chaîne, pas l'existence d'un branchement — le même motif
  // que les anomalies n° 9 et n° 10 de ce sprint.
  assert.match(src, /=\s*getPlanDuJour\s*\(/, 'la page n’appelle plus l’arbitre (appel absent)');
  assert.ok(src.includes('plan.unites'), 'la page n’utilise plus les unités du plan');
});

test('B12 · le POURQUOI explicable du CP3 atteint l’apprenant (critère B10)', () => {
  // Un ordre qu'on ne peut pas contester n'est pas explicable. Le CP3 produit
  // une phrase citant au plus deux facteurs ; elle doit arriver à l'écran.
  assert.ok(lire(PAGE_RETENTION).includes('pourquoi: u.pourquoi'), 'le pourquoi du CP3 n’est plus transmis');
  assert.ok(lire(STATION).includes('row.pourquoi'), 'la station n’affiche plus le pourquoi');
});

test('B12 · la forme ET la consigne viennent du MÊME décideur', () => {
  // Défaut réel trouvé en lisant la page rendue : le libellé venait de la forme
  // choisie par V66 et la consigne de celle choisie par le CP4. Une carte
  // annonçait « Mise en application » puis demandait de répondre à des
  // questions d'entretien. Une surface ne peut pas annoncer un exercice et en
  // demander un autre.
  const src = lire(PAGE_RETENTION);
  assert.ok(src.includes('format: u.format'), 'la forme ne vient plus de l’arbitre : elle peut diverger de la consigne');
  assert.ok(src.includes('consigne: u.consigne'), 'la consigne ne vient plus de l’arbitre');
});

test('B12 · la remédiation du CP7 est calculée par l’API et rendue à l’apprenant', () => {
  const route = lire(ROUTE_LAB);
  assert.ok(route.includes("from '@/lib/remediation'"), 'le moteur de remédiation n’est plus appelé');
  assert.ok(route.includes('ressourcesDe'), 'les ressources réelles ne sont plus résolues');
  assert.ok(/remediation\s*[,}]/.test(route), 'la remédiation n’est plus renvoyée par l’API');

  const ui = lire(LAB_UI);
  assert.ok(ui.includes('remediation'), 'le laboratoire n’affiche plus la remédiation');
});

test('B12 · la remédiation ne nomme JAMAIS un test privé', () => {
  // Un sous-problème tiré d'un test privé révélerait l'attendu. L'anti-fuite du
  // produit est antérieur au CP12 et le branchement ne doit pas l'affaiblir.
  const route = lire(ROUTE_LAB);
  assert.ok(route.includes('publicResults.filter'), 'les tests transmis à la remédiation ne sont plus filtrés sur les publics');
  assert.ok(!/testsEchoues:\s*attempt\.results/.test(route), 'les résultats bruts (privés compris) sont transmis');
});

test('B12 · le signal de charge du CP10 atteint l’apprenant', () => {
  assert.ok(lire(PAGE_RETENTION).includes('plan.signal'), 'le signal de charge n’est plus affiché');
});

test('B12 · le signal silencieux du CP11 atteint l’apprenant', () => {
  assert.ok(lire(PAGE_RETENTION).includes('jamaisTransferees'),
    '« su mais jamais hors de son contexte » n’est plus montré');
});

test('B12 · ce que l’arbitre a ÉCARTÉ reste visible', () => {
  // Le CP4 traite `differes` comme une SORTIE, pas un reliquat : savoir ce qui
  // n'a pas été retenu vaut autant que savoir ce qui l'a été.
  assert.ok(lire(PAGE_RETENTION).includes('plan.differes'), 'les unités écartées ne sont plus montrées');
});

test('§9 · aucune surface de rétention n’affiche un score chiffré', () => {
  for (const f of [PAGE_RETENTION, STATION]) {
    const src = lire(f)
      .split('\n')
      .filter((l) => !l.trimStart().startsWith('//') && !l.trimStart().startsWith('*'))
      .join('\n');
    assert.doesNotMatch(src, /\{\s*[\w.]*score[\w.]*\s*\}/i, `${f} interpole un score dans le rendu`);
  }
});
