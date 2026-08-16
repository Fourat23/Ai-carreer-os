// CP3-CP5 — Data/ML avec OUTILS PROFESSIONNELS (pandas / scikit-learn RÉELS)
// via le runtime python-ds (.venv-ds). practiceMode=TOOLING_ENVIRONMENT_REQUIRED
// (sauté proprement si le venv n'est pas provisionné). Déterministe.
import { buildAndVerify } from './v46-build-lib.mjs';

const ds = (id, difficulty, title, summary, skills, starter, reference, tests) => ({
  id, title, difficulty, summary, runtime: 'python-ds', language: 'python',
  skills, sprint: 'v47', practiceMode: 'TOOLING_ENVIRONMENT_REQUIRED',
  activeFile: 'solution.py', workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: starter }] },
  reference: { 'solution.py': reference }, tests,
});

const EX = [];

// 1 — pandas : supprimer les lignes incomplètes (D3)
EX.push(ds('pdx-dropna-count', 3, 'pandas : nettoyer les lignes incomplètes',
  "Avec pandas, supprime les lignes contenant AU MOINS une valeur manquante (None/NaN). Renvoie [lignes_avant, lignes_apres]. dropna() est l'outil.",
  ['ml', 'python'],
  "import pandas as pd\n\ndef clean(rows):\n    df = pd.DataFrame(rows)\n    # TODO : supprimer les lignes avec au moins un NaN, renvoyer [avant, apres]\n    return [len(df), len(df)]\n",
  "import pandas as pd\n\ndef clean(rows):\n    df = pd.DataFrame(rows)\n    before = len(df)\n    df2 = df.dropna()\n    return [before, len(df2)]\n",
  [
    { id: 't1', name: 'une ligne trouée', kind: 'call-equals', export: 'clean', args: [[{ a: 1, b: 2 }, { a: 3, b: null }, { a: 5, b: 6 }]], expected: [3, 2] },
    { id: 't2', name: 'aucune trouée', kind: 'call-equals', export: 'clean', args: [[{ a: 1, b: 2 }]], expected: [1, 1] },
    { id: 't3', name: 'toutes trouées (privé)', kind: 'call-equals', export: 'clean', args: [[{ a: null, b: 1 }, { a: 2, b: null }]], expected: [2, 0], private: true },
  ]));

// 2 — pandas : groupby + agrégation (D3)
EX.push(ds('pdx-groupby-mean', 3, 'pandas : moyenne par groupe',
  "Avec pandas, calcule la moyenne de 'salaire' par 'service'. Renvoie une liste [service, moyenne_entiere] triée par service (moyenne arrondie à l'entier via round puis int).",
  ['ml', 'python'],
  "import pandas as pd\n\ndef group_mean(rows):\n    df = pd.DataFrame(rows)\n    # TODO : groupby('service')['salaire'].mean(), arrondir, trier par service\n    return []\n",
  "import pandas as pd\n\ndef group_mean(rows):\n    df = pd.DataFrame(rows)\n    g = df.groupby('service')['salaire'].mean()\n    return [[s, int(round(v))] for s, v in sorted(g.items())]\n",
  [
    { id: 't1', name: 'deux services', kind: 'call-equals', export: 'group_mean', args: [[{ service: 'tech', salaire: 100 }, { service: 'tech', salaire: 300 }, { service: 'rh', salaire: 200 }]], expected: [['rh', 200], ['tech', 200]] },
    { id: 't2', name: 'un service', kind: 'call-equals', export: 'group_mean', args: [[{ service: 'a', salaire: 50 }]], expected: [['a', 50]] },
    { id: 't3', name: 'arrondi (privé)', kind: 'call-equals', export: 'group_mean', args: [[{ service: 'x', salaire: 10 }, { service: 'x', salaire: 15 }]], expected: [['x', 12]], private: true },
  ]));

// 3 — pandas : jointure (D3)
EX.push(ds('pdx-merge-inner', 3, 'pandas : jointure interne (merge)',
  "Avec pandas, fais une jointure INTERNE de deux tables sur 'id'. Renvoie le nombre de lignes du résultat. pd.merge(..., how='inner').",
  ['ml', 'python'],
  "import pandas as pd\n\ndef join_count(a, b):\n    da, db = pd.DataFrame(a), pd.DataFrame(b)\n    # TODO : merge inner sur 'id', renvoyer le nombre de lignes\n    return 0\n",
  "import pandas as pd\n\ndef join_count(a, b):\n    da, db = pd.DataFrame(a), pd.DataFrame(b)\n    m = pd.merge(da, db, on='id', how='inner')\n    return len(m)\n",
  [
    { id: 't1', name: 'un commun', kind: 'call-equals', export: 'join_count', args: [[{ id: 1, x: 'a' }, { id: 2, x: 'b' }], [{ id: 2, y: 'z' }]], expected: 1 },
    { id: 't2', name: 'aucun commun', kind: 'call-equals', export: 'join_count', args: [[{ id: 1 }], [{ id: 9 }]], expected: 0 },
    { id: 't3', name: 'doublon → produit (privé)', kind: 'call-equals', export: 'join_count', args: [[{ id: 1 }, { id: 1 }], [{ id: 1 }]], expected: 2, private: true },
  ]));

// 4 — pandas : corriger un type (D4, diagnostic)
EX.push(ds('pdx-fix-dtype-sum', 4, 'pandas : corriger un type mal parsé',
  "Une colonne 'montant' est arrivée en TEXTE ('10','20'). Convertis-la en entier puis renvoie la somme. Un type incorrect fausse toute agrégation. pd.to_numeric est l'outil.",
  ['ml', 'python'],
  "import pandas as pd\n\ndef total_montant(rows):\n    df = pd.DataFrame(rows)\n    # BUG : 'montant' est du texte ; corriger le type avant de sommer\n    return int(df['montant'].sum())\n",
  "import pandas as pd\n\ndef total_montant(rows):\n    df = pd.DataFrame(rows)\n    df['montant'] = pd.to_numeric(df['montant'])\n    return int(df['montant'].sum())\n",
  [
    { id: 't1', name: 'texte → somme entière', kind: 'call-equals', export: 'total_montant', args: [[{ montant: '10' }, { montant: '20' }, { montant: '5' }]], expected: 35 },
    { id: 't2', name: 'un seul', kind: 'call-equals', export: 'total_montant', args: [[{ montant: '42' }]], expected: 42 },
    { id: 't3', name: 'zéros (privé)', kind: 'call-equals', export: 'total_montant', args: [[{ montant: '0' }, { montant: '7' }]], expected: 7, private: true },
  ]));

// 5 — sklearn : split reproductible (D3)
EX.push(ds('skl-train-test-split', 3, 'scikit-learn : split reproductible',
  "Avec sklearn.model_selection.train_test_split, sépare X (liste de listes) et y avec test_size=0.25 et random_state=42. Renvoie [n_train, n_test]. Le random_state garantit la reproductibilité.",
  ['ml'],
  "from sklearn.model_selection import train_test_split\n\ndef split(X, y):\n    # TODO : train_test_split(test_size=0.25, random_state=42), renvoyer [n_train, n_test]\n    return [len(X), 0]\n",
  "from sklearn.model_selection import train_test_split\n\ndef split(X, y):\n    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=42)\n    return [len(Xtr), len(Xte)]\n",
  [
    { id: 't1', name: '8 → 6/2', kind: 'call-equals', export: 'split', args: [[[1], [2], [3], [4], [5], [6], [7], [8]], [0, 1, 0, 1, 0, 1, 0, 1]], expected: [6, 2] },
    { id: 't2', name: '4 → 3/1', kind: 'call-equals', export: 'split', args: [[[1], [2], [3], [4]], [0, 0, 1, 1]], expected: [3, 1] },
    { id: 't3', name: '12 → 9/3 (privé)', kind: 'call-equals', export: 'split', args: [[[1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12]], [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]], expected: [9, 3], private: true },
  ]));

// 6 — sklearn : matrice de confusion réelle (D4)
EX.push(ds('skl-confusion-matrix', 4, 'scikit-learn : matrice de confusion',
  "Avec sklearn.metrics.confusion_matrix(y_true, y_pred, labels=[0,1]), renvoie la matrice APLATIE [TN, FP, FN, TP] (entiers). Attention à l'ordre des labels de sklearn.",
  ['ml', 'evalia'],
  "from sklearn.metrics import confusion_matrix\n\ndef cm(y_true, y_pred):\n    # TODO : confusion_matrix(labels=[0,1]).ravel() -> [TN, FP, FN, TP]\n    return [0, 0, 0, 0]\n",
  "from sklearn.metrics import confusion_matrix\n\ndef cm(y_true, y_pred):\n    m = confusion_matrix(y_true, y_pred, labels=[0, 1])\n    return [int(x) for x in m.ravel()]\n",
  [
    { id: 't1', name: 'cas mixte', kind: 'call-equals', export: 'cm', args: [[1, 1, 0, 0, 1], [1, 0, 0, 1, 1]], expected: [1, 1, 1, 2] },
    { id: 't2', name: 'parfait', kind: 'call-equals', export: 'cm', args: [[1, 0], [1, 0]], expected: [1, 0, 0, 1] },
    { id: 't3', name: 'tout faux (privé)', kind: 'call-equals', export: 'cm', args: [[1, 0], [0, 1]], expected: [0, 1, 1, 0], private: true },
  ]));

// 7 — sklearn : entraîner + évaluer (D4)
EX.push(ds('skl-logreg-accuracy', 4, 'scikit-learn : entraîner et évaluer',
  "Entraîne une LogisticRegression sur (X_train,y_train), prédit sur X_test, renvoie l'accuracy formatée '%.2f' (accuracy_score). Données séparables → résultat déterministe.",
  ['ml'],
  "from sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score\n\ndef fit_eval(X_train, y_train, X_test, y_test):\n    # TODO : entraîner LogisticRegression, prédire, renvoyer f'{acc:.2f}'\n    return '0.00'\n",
  "from sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score\n\ndef fit_eval(X_train, y_train, X_test, y_test):\n    m = LogisticRegression()\n    m.fit(X_train, y_train)\n    pred = m.predict(X_test)\n    return f'{accuracy_score(y_test, pred):.2f}'\n",
  [
    { id: 't1', name: 'séparable → 1.00', kind: 'call-equals', export: 'fit_eval', args: [[[0], [1], [2], [10], [11], [12]], [0, 0, 0, 1, 1, 1], [[1], [11]], [0, 1]], expected: '1.00' },
    { id: 't2', name: 'un test correct', kind: 'call-equals', export: 'fit_eval', args: [[[0], [1], [10], [11]], [0, 0, 1, 1], [[0]], [0]], expected: '1.00' },
    { id: 't3', name: 'deux tests séparables (privé)', kind: 'call-equals', export: 'fit_eval', args: [[[0], [1], [10], [11]], [0, 0, 1, 1], [[2], [9]], [0, 1]], expected: '1.00', private: true },
  ]));

// 8 — sklearn : Pipeline anti-leakage + cross-val (D5, décision)
EX.push(ds('skl-pipeline-cv', 5, 'scikit-learn : Pipeline + cross-validation',
  "Construis un Pipeline(StandardScaler, LogisticRegression) et évalue-le par cross_val_score (cv=3) : le scaler est fit DANS chaque pli (anti-leakage outillé). Renvoie la moyenne des scores '%.2f'. Le Pipeline empêche la fuite que ferait un scaling global.",
  ['ml'],
  "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\n\ndef cv_mean(X, y):\n    # TODO : Pipeline([scaler, logreg]) + cross_val_score(cv=3), renvoyer f'{mean:.2f}'\n    return '0.00'\n",
  "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\n\ndef cv_mean(X, y):\n    pipe = Pipeline([('scaler', StandardScaler()), ('model', LogisticRegression())])\n    scores = cross_val_score(pipe, X, y, cv=3)\n    return f'{scores.mean():.2f}'\n",
  [
    { id: 't1', name: 'séparable → 1.00', kind: 'call-equals', export: 'cv_mean', args: [[[0], [1], [2], [10], [11], [12], [0.5], [11.5], [1.5], [10.5], [2.5], [12.5]], [0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1]], expected: '1.00' },
    { id: 't2', name: 'séparable bis (privé)', kind: 'call-equals', export: 'cv_mean', args: [[[0], [10], [1], [11], [2], [12], [3], [13], [0.2], [10.2], [1.2], [11.2]], [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]], expected: '1.00', private: true },
  ]));

let ok = 0;
for (const ex of EX) { await buildAndVerify(ex); ok++; console.log('✓', ex.id, `(D${ex.difficulty})`); }
console.log(`\nCP3-5 : ${ok}/${EX.length} exercices Data/ML pro (pandas/sklearn RÉELS) vérifiés par exécution.`);
