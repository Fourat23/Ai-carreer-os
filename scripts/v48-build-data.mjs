// V48 CP3/CP4 — Data / ML deep practice. Données imparfaites + diagnostic.
// python-ds : pandas/numpy/scikit-learn RÉELS (venv opt-in). python3 : stdlib.
// Déterministe (sorties entières ou chaînes formatées). Aucun flottant nu.
import { buildAndVerify } from './v46-build-lib.mjs';

const ds = (id, difficulty, title, summary, skills, activeExport, starter, reference, tests) => ({
  id, title, difficulty, summary, runtime: 'python-ds', language: 'python',
  skills, sprint: 'v48', activeFile: 'solution.py', practiceMode: 'TOOLING_ENVIRONMENT_REQUIRED',
  workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: starter }] },
  reference: { 'solution.py': reference }, tests,
});
const py = (id, difficulty, title, summary, skills, starter, reference, tests) => ({
  id, title, difficulty, summary, runtime: 'python3', language: 'python',
  skills, sprint: 'v48', activeFile: 'solution.py',
  workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: starter }] },
  reference: { 'solution.py': reference }, tests,
});

const EX = [];

// 1 — piège de la métrique sur données déséquilibrées (D4, ml+evalia)
EX.push(ds('ml-imbalance-metric-trap', 4, 'ML : le piège de l’accuracy en déséquilibre',
  "Un classifieur qui prédit toujours la classe majoritaire obtient une accuracy élevée mais rate la minorité. Renvoie 'acc=.. rec1=.. f1m=..' (2 déc.) pour EXPOSER le piège : l'accuracy seule ment quand une classe est rare.",
  ['ml', 'evalia'], 'evaluate',
  "def evaluate(y_true, y_pred):\n    # TODO: accuracy, rappel de la classe 1, F1 macro -> 'acc=.. rec1=.. f1m=..'\n    return 'acc=0.00 rec1=0.00 f1m=0.00'\n",
  "from sklearn.metrics import accuracy_score, recall_score, f1_score\n\ndef evaluate(y_true, y_pred):\n    a = accuracy_score(y_true, y_pred)\n    r = recall_score(y_true, y_pred, pos_label=1, zero_division=0)\n    f = f1_score(y_true, y_pred, average='macro', zero_division=0)\n    return f'acc={a:.2f} rec1={r:.2f} f1m={f:.2f}'\n",
  [
    { id: 't1', name: 'tout-majoritaire : acc haute, rappel nul', kind: 'call-equals', export: 'evaluate',
      args: [[0,0,0,0,0,0,0,0,1,1], [0,0,0,0,0,0,0,0,0,0]], expected: 'acc=0.80 rec1=0.00 f1m=0.44' },
    { id: 't2', name: 'modèle utile', kind: 'call-equals', export: 'evaluate',
      args: [[0,0,0,0,0,0,0,0,1,1], [0,0,0,0,0,0,0,0,1,1]], expected: 'acc=1.00 rec1=1.00 f1m=1.00' },
    { id: 't3', name: 'partiel (privé)', kind: 'call-equals', export: 'evaluate',
      args: [[0,0,0,0,1,1], [0,0,0,0,0,1]], expected: 'acc=0.83 rec1=0.50 f1m=0.78', private: true },
  ]));

// 2 — fuite temporelle : colonne trop parfaite (D4, ml+python)
EX.push(ds('ml-leakage-temporal', 4, 'ML : détecter une fuite (colonne du futur)',
  "Une colonne renseignée APRÈS la cible corrèle presque parfaitement avec elle : c'est une fuite. Renvoie la liste TRIÉE des colonnes numériques dont |corr(cible)| >= 0.999 (hors la cible). On les retire AVANT d'entraîner.",
  ['ml', 'python'], 'suspect_leaks',
  "import pandas as pd\n\ndef suspect_leaks(rows, target):\n    # rows: liste de dicts. TODO: colonnes num. avec |corr(target)|>=0.999, triées.\n    return []\n",
  "import pandas as pd\n\ndef suspect_leaks(rows, target):\n    df = pd.DataFrame(rows)\n    num = df.select_dtypes('number')\n    if target not in num:\n        return []\n    out = []\n    for c in num.columns:\n        if c == target:\n            continue\n        corr = num[c].corr(num[target])\n        if corr == corr and abs(corr) >= 0.999:\n            out.append(c)\n    return sorted(out)\n",
  [
    { id: 't1', name: 'refund_status fuit', kind: 'call-equals', export: 'suspect_leaks',
      args: [[{age:20,refund:1,y:1},{age:30,refund:0,y:0},{age:40,refund:1,y:1},{age:50,refund:0,y:0}], 'y'], expected: ['refund'] },
    { id: 't2', name: 'aucune fuite', kind: 'call-equals', export: 'suspect_leaks',
      args: [[{age:20,score:3,y:1},{age:30,score:9,y:0},{age:40,score:1,y:1},{age:50,score:8,y:0}], 'y'], expected: [] },
    { id: 't3', name: 'deux colonnes fuient (privé)', kind: 'call-equals', export: 'suspect_leaks',
      args: [[{a:1,b:1,y:1},{a:0,b:0,y:0},{a:1,b:1,y:1},{a:0,b:0,y:0}], 'y'], expected: ['a','b'], private: true },
  ]));

// 3 — mauvaises features : constantes / identifiants (D3, ml+python)
EX.push(ds('ml-bad-feature-id', 3, 'ML : écarter constantes et identifiants',
  "Une colonne constante n'apporte rien ; une colonne unique par ligne (identifiant) fait sur-apprendre. Renvoie la liste TRIÉE des colonnes à écarter : variance nulle OU autant de valeurs distinctes que de lignes.",
  ['ml', 'python'], 'drop_columns',
  "import pandas as pd\n\ndef drop_columns(rows):\n    # TODO: colonnes constantes ou identifiantes (nunique==len), triées.\n    return []\n",
  "import pandas as pd\n\ndef drop_columns(rows):\n    df = pd.DataFrame(rows)\n    n = len(df)\n    out = []\n    for c in df.columns:\n        nu = df[c].nunique(dropna=False)\n        if nu <= 1 or nu == n:\n            out.append(c)\n    return sorted(out)\n",
  [
    { id: 't1', name: 'id + constante', kind: 'call-equals', export: 'drop_columns',
      args: [[{id:1,region:'a',x:5},{id:2,region:'a',x:7},{id:3,region:'a',x:5}]], expected: ['id','region'] },
    { id: 't2', name: 'rien à écarter', kind: 'call-equals', export: 'drop_columns',
      args: [[{a:1,b:2},{a:1,b:3},{a:2,b:2}]], expected: [] },
    { id: 't3', name: 'constante seule (privé)', kind: 'call-equals', export: 'drop_columns',
      args: [[{k:9,v:1},{k:9,v:2},{k:9,v:2}]], expected: ['k'], private: true },
  ]));

// 4 — train/serve skew (D4, ml+python)
EX.push(ds('ml-train-serve-skew', 4, 'ML : détecter un décalage train/serving',
  "Une feature encodée/échelonnée différemment à l'entraînement et en production dégrade silencieusement le modèle. Compare moyennes par colonne ; renvoie la liste TRIÉE des colonnes dont |moyenne_train - moyenne_serve| > tol.",
  ['ml', 'python'], 'skewed',
  "import pandas as pd\n\ndef skewed(train, serve, tol):\n    # TODO: colonnes num. communes dont |mean_train-mean_serve|>tol, triées.\n    return []\n",
  "import pandas as pd\n\ndef skewed(train, serve, tol):\n    a = pd.DataFrame(train).select_dtypes('number')\n    b = pd.DataFrame(serve).select_dtypes('number')\n    out = []\n    for c in a.columns:\n        if c in b.columns and abs(a[c].mean() - b[c].mean()) > tol:\n            out.append(c)\n    return sorted(out)\n",
  [
    { id: 't1', name: 'income x1000 en prod', kind: 'call-equals', export: 'skewed',
      args: [[{income:5,age:30},{income:7,age:40}], [{income:5000,age:31},{income:7000,age:39}], 1.0], expected: ['income'] },
    { id: 't2', name: 'aligné', kind: 'call-equals', export: 'skewed',
      args: [[{a:1,b:10},{a:3,b:12}], [{a:1,b:11},{a:3,b:11}], 1.0], expected: [] },
    { id: 't3', name: 'deux colonnes (privé)', kind: 'call-equals', export: 'skewed',
      args: [[{a:0,b:0}], [{a:5,b:9}], 1.0], expected: ['a','b'], private: true },
  ]));

// 5 — baseline vs modèle (D3, ml+evalia)
EX.push(ds('ml-baseline-vs-model', 3, 'ML : un modèle bat-il la baseline ?',
  "Comparer un modèle à la baseline « classe majoritaire » (DummyClassifier). Renvoie 'no-lift' si l'accuracy du modèle <= baseline, sinon le gain 'lift=+X.XX'. Sans ce recadrage, 0.80 semble bon alors que la baseline fait déjà 0.80.",
  ['ml', 'evalia'], 'compare',
  "from sklearn.dummy import DummyClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score\n\ndef compare(X, y):\n    # TODO: baseline majoritaire vs LogisticRegression -> 'no-lift' ou 'lift=+X.XX'\n    return 'no-lift'\n",
  "from sklearn.dummy import DummyClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score\n\ndef compare(X, y):\n    base = DummyClassifier(strategy='most_frequent').fit(X, y)\n    b = accuracy_score(y, base.predict(X))\n    m = accuracy_score(y, LogisticRegression().fit(X, y).predict(X))\n    if m <= b:\n        return 'no-lift'\n    return f'lift=+{m-b:.2f}'\n",
  [
    { id: 't1', name: 'séparable → lift', kind: 'call-equals', export: 'compare',
      args: [[[0],[1],[2],[10],[11],[12]], [0,0,0,1,1,1]], expected: 'lift=+0.50' },
    { id: 't2', name: 'bruit pur → no-lift', kind: 'call-equals', export: 'compare',
      args: [[[0],[0],[0],[0]], [0,1,0,1]], expected: 'no-lift' },
    { id: 't3', name: 'léger lift (privé)', kind: 'call-equals', export: 'compare',
      args: [[[0],[1],[2],[3],[10]], [0,0,1,1,1]], expected: 'lift=+0.40', private: true },
  ]));

// 6 — imputation : NaN n'est pas zéro (D3, ml+python)
EX.push(ds('ml-missing-not-zero', 3, 'ML : imputer par 0 fausse la moyenne',
  "Remplacer les valeurs manquantes par 0 tire la moyenne vers le bas. Renvoie 'zero=.. skip=..' (2 déc.) : la moyenne en imputant 0 VS en ignorant les NaN, pour montrer le biais introduit.",
  ['ml', 'python'], 'means',
  "import pandas as pd\n\ndef means(values):\n    # values: liste avec des None. TODO: 'zero=.. skip=..'\n    return 'zero=0.00 skip=0.00'\n",
  "import pandas as pd\n\ndef means(values):\n    s = pd.Series(values, dtype='float')\n    zero = s.fillna(0).mean()\n    skip = s.mean()\n    return f'zero={zero:.2f} skip={skip:.2f}'\n",
  [
    { id: 't1', name: 'deux NaN', kind: 'call-equals', export: 'means',
      args: [[10, 20, null, null]], expected: 'zero=7.50 skip=15.00' },
    { id: 't2', name: 'aucun NaN', kind: 'call-equals', export: 'means',
      args: [[4, 6]], expected: 'zero=5.00 skip=5.00' },
    { id: 't3', name: 'un NaN (privé)', kind: 'call-equals', export: 'means',
      args: [[9, null, 9]], expected: 'zero=6.00 skip=9.00', private: true },
  ]));

// 7 — stratification nécessaire ? (D4, ml) — raisonnement déterministe, sans RNG
EX.push(py('ml-split-stratify', 4, 'ML : un split naïf perd-il une classe ?',
  "Sur un jeu déséquilibré, un split proportionnel peut allouer ZÉRO exemple d'une classe rare au test (part attendue < 1). Renvoie 'stratify' si une classe risque d'être absente du test (count*test_size < 1), sinon 'ok'. Décision de conception avant d'évaluer.",
  ['ml'],
  "def need_stratify(y, test_size):\n    # 'stratify' si une classe a count*test_size < 1 (risque d'absence au test)\n    return 'ok'\n",
  "def need_stratify(y, test_size):\n    counts = {}\n    for c in y:\n        counts[c] = counts.get(c, 0) + 1\n    for c, n in counts.items():\n        if n * test_size < 1:\n            return 'stratify'\n    return 'ok'\n",
  [
    { id: 't1', name: 'minorité (1/8) perdue à 25%', kind: 'call-equals', export: 'need_stratify',
      args: [[0,0,0,0,0,0,0,1], 0.25], expected: 'stratify' },
    { id: 't2', name: 'équilibré à 50%', kind: 'call-equals', export: 'need_stratify',
      args: [[0,1,0,1,0,1,0,1], 0.5], expected: 'ok' },
    { id: 't3', name: 'classe rare mais test large (privé)', kind: 'call-equals', export: 'need_stratify',
      args: [[0,0,0,0,1,1], 0.5], expected: 'ok', private: true },
  ]));

// 8 — overfit onset (D4, ml) — python3 stdlib
EX.push(py('ml-overfit-onset', 4, 'ML : repérer le début du surapprentissage',
  "Sur les courbes train/val par epoch, le surapprentissage commence quand la val cesse de progresser tandis que le train continue de monter. Renvoie l'epoch (index 0) de la MEILLEURE val ; au-delà, on surapprend (early stopping).",
  ['ml'],
  "def best_epoch(train_acc, val_acc):\n    # TODO: index de la val maximale (première en cas d'égalité)\n    return 0\n",
  "def best_epoch(train_acc, val_acc):\n    best_i, best_v = 0, val_acc[0]\n    for i, v in enumerate(val_acc):\n        if v > best_v:\n            best_v, best_i = v, i\n    return best_i\n",
  [
    { id: 't1', name: 'val plafonne à 2', kind: 'call-equals', export: 'best_epoch',
      args: [[0.6,0.7,0.8,0.9,0.95], [0.6,0.7,0.75,0.74,0.72]], expected: 2 },
    { id: 't2', name: 'val monte tout du long', kind: 'call-equals', export: 'best_epoch',
      args: [[0.5,0.6,0.7], [0.5,0.6,0.7]], expected: 2 },
    { id: 't3', name: 'plateau early (privé)', kind: 'call-equals', export: 'best_epoch',
      args: [[0.5,0.9], [0.8,0.8]], expected: 0, private: true },
  ]));

// 9 — coût de confusion : seuil optimal (D4, ml+evalia) — python3
EX.push(py('ml-confusion-cost', 4, 'ML : choisir le seuil au coût métier',
  "Un faux négatif (fraude ratée) coûte plus qu'un faux positif (alerte inutile). Pour chaque seuil candidat, calcule FP*cost_fp + FN*cost_fn et renvoie le seuil (2 déc.) de coût MINIMAL (le plus bas en cas d'égalité).",
  ['ml', 'evalia'],
  "def best_threshold(scores, labels, thresholds, cost_fp, cost_fn):\n    # predire 1 si score>=seuil. TODO: seuil de coût minimal -> '%.2f'\n    return '0.00'\n",
  "def best_threshold(scores, labels, thresholds, cost_fp, cost_fn):\n    best_t, best_c = None, None\n    for t in thresholds:\n        fp = sum(1 for s, y in zip(scores, labels) if s >= t and y == 0)\n        fn = sum(1 for s, y in zip(scores, labels) if s < t and y == 1)\n        c = fp * cost_fp + fn * cost_fn\n        if best_c is None or c < best_c:\n            best_c, best_t = c, t\n    return f'{best_t:.2f}'\n",
  [
    { id: 't1', name: 'FN cher → seuil bas', kind: 'call-equals', export: 'best_threshold',
      args: [[0.2,0.4,0.6,0.8], [0,1,1,1], [0.3,0.5,0.7], 1, 10], expected: '0.30' },
    { id: 't2', name: 'FP cher → seuil haut', kind: 'call-equals', export: 'best_threshold',
      args: [[0.2,0.4,0.6,0.8], [0,0,0,1], [0.3,0.5,0.7], 10, 1], expected: '0.70' },
    { id: 't3', name: 'égalité → premier (privé)', kind: 'call-equals', export: 'best_threshold',
      args: [[0.5], [1], [0.4,0.6], 1, 1], expected: '0.40', private: true },
  ]));

// 10 — calibration (ECE) (D4, ml+evalia) — python-ds numpy
EX.push(ds('ml-calibration-ece', 4, 'ML : mesurer la sur-confiance (ECE)',
  "Un modèle « sûr à 90% » qui n'a raison que 60% du temps est mal calibré. Calcule l'Expected Calibration Error par bacs de largeur 0.2 : moyenne pondérée de |confiance_moyenne - précision| par bac. Renvoie '%.3f'.",
  ['ml', 'evalia'], 'ece',
  "import numpy as np\n\ndef ece(probs, labels):\n    # bacs [0,0.2),[0.2,0.4),...,[0.8,1.0]. TODO: ECE '%.3f'\n    return '0.000'\n",
  "import numpy as np\n\ndef ece(probs, labels):\n    p = np.array(probs, dtype=float)\n    y = np.array(labels, dtype=float)\n    n = len(p)\n    edges = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0001]\n    total = 0.0\n    for lo, hi in zip(edges[:-1], edges[1:]):\n        m = (p >= lo) & (p < hi)\n        if m.sum() == 0:\n            continue\n        conf = p[m].mean()\n        acc = y[m].mean()\n        total += (m.sum() / n) * abs(conf - acc)\n    return f'{total:.3f}'\n",
  [
    { id: 't1', name: 'sur-confiant', kind: 'call-equals', export: 'ece',
      args: [[0.9,0.9,0.9,0.9,0.9], [1,0,0,0,0]], expected: '0.700' },
    { id: 't2', name: 'parfaitement calibré', kind: 'call-equals', export: 'ece',
      args: [[0.9,0.9,0.9,0.9,0.9,0.9,0.9,0.9,0.9,0.9], [1,1,1,1,1,1,1,1,1,0]], expected: '0.000' },
    { id: 't3', name: 'deux bacs (privé)', kind: 'call-equals', export: 'ece',
      args: [[0.1,0.1,0.9,0.9], [0,0,1,0]], expected: '0.250', private: true },
  ]));

const run = async () => { for (const e of EX) { await buildAndVerify(e); console.log('OK', e.id, `(D${e.difficulty} ${e.runtime})`); } };
run().catch((e) => { console.error(e.message); process.exit(1); });
