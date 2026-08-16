// CP5 — ML foundations exécutable (Python stdlib, sans sklearn).
// Mécanismes implémentés à la main (pédagogiquement utiles). Sorties entières
// ou chaînes formatées (déterminisme). On n'imite PAS l'API sklearn.
import { buildAndVerify } from './v46-build-lib.mjs';

const ml = (id, difficulty, title, summary, starter, reference, tests, extra = {}) => ({
  id, title, difficulty, summary, runtime: 'python3', language: 'python',
  skills: ['ml'], sprint: 'v46', activeFile: 'solution.py',
  workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: starter }] },
  reference: { 'solution.py': reference }, tests, ...extra,
});

const EX = [];

// 1 — train/test split déterministe (D2)
EX.push(ml('ml-train-test-split', 2,
  'ML : découpage train/test',
  "Découpe X et y (alignés) en gardant les DERNIERS test_frac% comme test (déterministe, sans hasard). Renvoie [n_train, n_test]. Le test ne doit jamais fuiter dans l'entraînement.",
  "def split(X, y, test_frac):\n    # TODO : n_test = floor(len(X)*test_frac) ; test = derniers éléments\n    return [len(X), 0]\n",
  "import math\n\ndef split(X, y, test_frac):\n    n = len(X)\n    n_test = math.floor(n * test_frac)\n    n_train = n - n_test\n    return [n_train, n_test]\n",
  [
    { id: 't1', name: '10 éléments, 0.2', kind: 'call-equals', export: 'split', args: [[1,2,3,4,5,6,7,8,9,10], [0,1,0,1,0,1,0,1,0,1], 0.2], expected: [8, 2] },
    { id: 't2', name: '5 éléments, 0.4', kind: 'call-equals', export: 'split', args: [[1,2,3,4,5], [0,0,0,0,0], 0.4], expected: [3, 2] },
    { id: 't3', name: '3 éléments, 0.5 → 1 test (privé)', kind: 'call-equals', export: 'split', args: [[1,2,3], [1,1,1], 0.5], expected: [2, 1], private: true },
  ]));

// 2 — matrice de confusion (D3)
EX.push(ml('ml-confusion-matrix', 3,
  'ML : matrice de confusion',
  "Compare y_true et y_pred (0/1). Renvoie [TP, FP, FN, TN] (entiers). TP: vrai=1,préd=1 ; FP: vrai=0,préd=1 ; FN: vrai=1,préd=0 ; TN: vrai=0,préd=0.",
  "def confusion(y_true, y_pred):\n    # TODO : compter TP, FP, FN, TN\n    return [0, 0, 0, 0]\n",
  "def confusion(y_true, y_pred):\n    tp = fp = fn = tn = 0\n    for t, p in zip(y_true, y_pred):\n        if t == 1 and p == 1: tp += 1\n        elif t == 0 and p == 1: fp += 1\n        elif t == 1 and p == 0: fn += 1\n        else: tn += 1\n    return [tp, fp, fn, tn]\n",
  [
    { id: 't1', name: 'cas mixte', kind: 'call-equals', export: 'confusion', args: [[1,1,0,0,1], [1,0,0,1,1]], expected: [2, 1, 1, 1] },
    { id: 't2', name: 'parfait', kind: 'call-equals', export: 'confusion', args: [[1,0], [1,0]], expected: [1, 0, 0, 1] },
    { id: 't3', name: 'tout faux (privé)', kind: 'call-equals', export: 'confusion', args: [[1,0], [0,1]], expected: [0, 1, 1, 0], private: true },
  ]));

// 3 — precision / recall / F1 (D3)
EX.push(ml('ml-precision-recall-f1', 3,
  'ML : précision, rappel, F1',
  "À partir de [TP,FP,FN,TN], renvoie [precision, recall, f1] en CHAÎNES formatées à 3 décimales (ex. '0.800'). Si un dénominateur est nul, renvoie '0.000' pour cette métrique.",
  "def metrics(cm):\n    tp, fp, fn, tn = cm\n    # TODO : precision=tp/(tp+fp), recall=tp/(tp+fn), f1=2PR/(P+R) ; formater '%.3f'\n    return ['0.000', '0.000', '0.000']\n",
  "def metrics(cm):\n    tp, fp, fn, tn = cm\n    p = tp / (tp + fp) if (tp + fp) else 0.0\n    r = tp / (tp + fn) if (tp + fn) else 0.0\n    f1 = 2 * p * r / (p + r) if (p + r) else 0.0\n    return [f'{p:.3f}', f'{r:.3f}', f'{f1:.3f}']\n",
  [
    { id: 't1', name: 'TP8 FP2 FN2', kind: 'call-equals', export: 'metrics', args: [[8, 2, 2, 8]], expected: ['0.800', '0.800', '0.800'] },
    { id: 't2', name: 'rappel médical (peu de FN)', kind: 'call-equals', export: 'metrics', args: [[9, 3, 1, 7]], expected: ['0.750', '0.900', '0.818'] },
    { id: 't3', name: 'dénominateur nul (privé)', kind: 'call-equals', export: 'metrics', args: [[0, 0, 0, 5]], expected: ['0.000', '0.000', '0.000'], private: true },
  ]));

// 4 — baseline classe majoritaire (D3)
EX.push(ml('ml-baseline-majority', 3,
  'ML : baseline classe majoritaire',
  "Renvoie l'accuracy (chaîne '%.3f') d'un modèle NAÏF qui prédit toujours la classe majoritaire de y. C'est le garde-fou : un vrai modèle doit la battre. Sur un jeu déséquilibré, elle est trompeusement haute.",
  "def baseline_accuracy(y):\n    # TODO : classe majoritaire, accuracy = part de cette classe ; formater '%.3f'\n    return '0.000'\n",
  "def baseline_accuracy(y):\n    if not y:\n        return '0.000'\n    from collections import Counter\n    c = Counter(y)\n    maj = c.most_common(1)[0][1]\n    return f'{maj/len(y):.3f}'\n",
  [
    { id: 't1', name: '95% classe 0 (déséquilibré)', kind: 'call-equals', export: 'baseline_accuracy', args: [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]], expected: '0.950' },
    { id: 't2', name: 'équilibré → 0.500', kind: 'call-equals', export: 'baseline_accuracy', args: [[0,1,0,1]], expected: '0.500' },
    { id: 't3', name: 'vide → 0.000 (privé)', kind: 'call-equals', export: 'baseline_accuracy', args: [[]], expected: '0.000', private: true },
  ]));

// 5 — détection de leakage (D4, diagnostic)
EX.push(ml('ml-leakage-detect', 4,
  'ML : détecter une fuite de données (leakage)',
  "On te donne l'ORDRE des étapes d'un pipeline (liste de chaînes parmi 'fit_scaler_all','split','fit_scaler_train','fit_model','evaluate'). Renvoie l'index (0-based) de la PREMIÈRE étape provoquant une fuite : normaliser sur TOUTES les données ('fit_scaler_all') AVANT 'split'. Renvoie -1 si aucune fuite.",
  "def find_leakage(steps):\n    # TODO : 'fit_scaler_all' avant 'split' = fuite → renvoyer son index ; sinon -1\n    return -1\n",
  "def find_leakage(steps):\n    split_i = steps.index('split') if 'split' in steps else len(steps)\n    for i, s in enumerate(steps):\n        if s == 'fit_scaler_all' and i < split_i:\n            return i\n    return -1\n",
  [
    { id: 't1', name: 'scaler avant split → fuite en 0', kind: 'call-equals', export: 'find_leakage', args: [['fit_scaler_all','split','fit_model','evaluate']], expected: 0 },
    { id: 't2', name: 'ordre correct → -1', kind: 'call-equals', export: 'find_leakage', args: [['split','fit_scaler_train','fit_model','evaluate']], expected: -1 },
    { id: 't3', name: 'scaler_all après split → -1 (privé)', kind: 'call-equals', export: 'find_leakage', args: [['split','fit_scaler_all','fit_model']], expected: -1, private: true },
  ]));

// 6 — choix de métrique (D4, décision)
EX.push(ml('ml-metric-choice', 4,
  'ML : choisir la bonne métrique',
  "Selon le contexte, renvoie la métrique à privilégier : 'recall' si rater un positif est grave (dépistage médical, fraude), 'precision' si une fausse alerte est coûteuse (spam qui bloque un vrai mail), 'accuracy' seulement si les classes sont équilibrées ET les coûts symétriques. Entrée : {balanced: bool, false_negative_cost: 'high'|'low', false_positive_cost: 'high'|'low'}.",
  "def choose_metric(ctx):\n    # TODO : décider recall / precision / accuracy selon les coûts et l'équilibre\n    return 'accuracy'\n",
  "def choose_metric(ctx):\n    fn = ctx.get('false_negative_cost')\n    fp = ctx.get('false_positive_cost')\n    if fn == 'high' and fp != 'high':\n        return 'recall'\n    if fp == 'high' and fn != 'high':\n        return 'precision'\n    if ctx.get('balanced') and fn == fp:\n        return 'accuracy'\n    return 'f1'\n",
  [
    { id: 't1', name: 'dépistage médical → recall', kind: 'call-equals', export: 'choose_metric', args: [{ balanced: false, false_negative_cost: 'high', false_positive_cost: 'low' }], expected: 'recall' },
    { id: 't2', name: 'anti-spam → precision', kind: 'call-equals', export: 'choose_metric', args: [{ balanced: false, false_negative_cost: 'low', false_positive_cost: 'high' }], expected: 'precision' },
    { id: 't3', name: 'équilibré symétrique → accuracy', kind: 'call-equals', export: 'choose_metric', args: [{ balanced: true, false_negative_cost: 'low', false_positive_cost: 'low' }], expected: 'accuracy' },
    { id: 't4', name: 'déséquilibré coûts égaux → f1 (privé)', kind: 'call-equals', export: 'choose_metric', args: [{ balanced: false, false_negative_cost: 'high', false_positive_cost: 'high' }], expected: 'f1', private: true },
  ]));

// 7 — diagnostic overfitting (D5, décision)
EX.push(ml('ml-overfit-diagnose', 5,
  'ML : diagnostiquer overfitting / underfitting',
  "À partir des accuracies finales train et validation, classe : 'overfit' si train est bon (>=0.9) mais l'écart train-val est grand (>=0.2) ; 'underfit' si train est faible (<0.7) ; sinon 'ok'. Renvoie la chaîne et sépare bien l'écart (overfit) du niveau bas (underfit).",
  "def diagnose(train_acc, val_acc):\n    # TODO : overfit (train haut + gros écart) / underfit (train bas) / ok\n    return 'ok'\n",
  "def diagnose(train_acc, val_acc):\n    if train_acc < 0.7:\n        return 'underfit'\n    if train_acc >= 0.9 and (train_acc - val_acc) >= 0.2:\n        return 'overfit'\n    return 'ok'\n",
  [
    { id: 't1', name: 'train 0.99 val 0.70 → overfit', kind: 'call-equals', export: 'diagnose', args: [0.99, 0.70], expected: 'overfit' },
    { id: 't2', name: 'train 0.60 val 0.58 → underfit', kind: 'call-equals', export: 'diagnose', args: [0.60, 0.58], expected: 'underfit' },
    { id: 't3', name: 'train 0.88 val 0.85 → ok', kind: 'call-equals', export: 'diagnose', args: [0.88, 0.85], expected: 'ok' },
    { id: 't4', name: 'train 0.95 val 0.90 → ok (petit écart, privé)', kind: 'call-equals', export: 'diagnose', args: [0.95, 0.90], expected: 'ok', private: true },
  ]));

let ok = 0;
for (const ex of EX) { await buildAndVerify(ex); ok++; console.log('✓', ex.id, `(D${ex.difficulty})`); }
console.log(`\nCP5 : ${ok}/${EX.length} exercices ML (stdlib) vérifiés par exécution réelle.`);
