// CP10 — Profondeur cognitive : UN exercice D5 de COMPOSITION (evalia + llm).
// Ne gonfle aucune note existante ; ajoute une tâche « rapport d'évaluation »
// qui compose trois briques V47 (exact match, porte de non-régression,
// catégorisation d'échecs) en une seule sortie — tâche réaliste de junior IA.
// Python stdlib, déterministe (aucun appel modèle réel).
import { buildAndVerify } from './v46-build-lib.mjs';

const starter = `def harness_report(rows, baseline_em, tol):
    # rows: liste de {pred, gold, category}. Produis un rapport dict :
    #   'exact_match' : taux d'exact match (pred.strip()==gold.strip()) en '%.3f'
    #   'gate'        : 'regression' si baseline_em - exact_match > tol, sinon 'pass'
    #   'top_failures': ['category:count', ...] des catégories en échec,
    #                   triées par count DÉCROISSANT puis category croissante.
    # TODO
    return {'exact_match': '0.000', 'gate': 'pass', 'top_failures': []}
`;

const reference = `def harness_report(rows, baseline_em, tol):
    n = len(rows)
    ok = sum(1 for r in rows if r['pred'].strip() == r['gold'].strip())
    em = ok / n if n else 0.0
    fails = {}
    for r in rows:
        if r['pred'].strip() != r['gold'].strip():
            fails[r['category']] = fails.get(r['category'], 0) + 1
    ordered = sorted(fails.items(), key=lambda kv: (-kv[1], kv[0]))
    return {
        'exact_match': f'{em:.3f}',
        'gate': 'regression' if baseline_em - em > tol else 'pass',
        'top_failures': [f'{c}:{n}' for c, n in ordered],
    }
`;

const R = (rows) => rows;
const set1 = R([
  { pred: 'a', gold: 'a', category: 'format' },
  { pred: 'x', gold: 'y', category: 'faux' },
  { pred: 'z ', gold: 'z', category: 'format' },
  { pred: '1', gold: '2', category: 'faux' },
  { pred: 'q', gold: 'w', category: 'ancrage' },
]);
// 2/5 corrects (a, z), 3 échecs : faux×2, ancrage×1. em=0.400.

const ex = {
  id: 'eval-harness-report',
  title: 'Éval IA : rapport de harnais (composition)',
  difficulty: 5,
  summary: "Compose un vrai rapport d'évaluation : exact match sur un golden set, décision de porte de non-régression contre une baseline, et catégories d'échec triées. C'est le livrable qu'un ingénieur IA produit avant de livrer — trois signaux honnêtes en une sortie déterministe.",
  runtime: 'python3',
  language: 'python',
  skills: ['evalia', 'llm'],
  sprint: 'v47',
  activeFile: 'solution.py',
  workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: starter }] },
  reference: { 'solution.py': reference },
  tests: [
    { id: 't1', name: 'em + gate pass + top_failures', kind: 'call-equals', export: 'harness_report',
      args: [set1, 0.42, 0.05],
      expected: { exact_match: '0.400', gate: 'pass', top_failures: ['faux:2', 'ancrage:1'] } },
    { id: 't2', name: 'chute > tol → regression', kind: 'call-equals', export: 'harness_report',
      args: [set1, 0.85, 0.05],
      expected: { exact_match: '0.400', gate: 'regression', top_failures: ['faux:2', 'ancrage:1'] } },
    { id: 't3', name: 'tie-break count égal → tri alpha', kind: 'call-equals', export: 'harness_report',
      args: [R([
        { pred: 'a', gold: 'b', category: 'zeta' },
        { pred: 'c', gold: 'd', category: 'alpha' },
      ]), 0.5, 0.1],
      expected: { exact_match: '0.000', gate: 'regression', top_failures: ['alpha:1', 'zeta:1'] } },
    { id: 't4', name: 'aucun échec (privé)', kind: 'call-equals', export: 'harness_report',
      args: [R([{ pred: 'a', gold: 'a', category: 'x' }]), 0.9, 0.05],
      expected: { exact_match: '1.000', gate: 'pass', top_failures: [] }, private: true },
  ],
};

buildAndVerify(ex);
console.log('OK eval-harness-report (D5)');
