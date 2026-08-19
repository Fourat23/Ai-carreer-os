// V49 CP6 — Deep Learning opérationnel. Calcul RÉEL (NumPy via python-ds, ou
// stdlib), déterministe. Aucun framework tiers obligatoire ; pas d'entraînement
// industriel simulé. L'apprenant CALCULE et DIAGNOSTIQUE les mécanismes.
import { buildAndVerify } from './v46-build-lib.mjs';

const ds = (id, difficulty, title, summary, skills, starter, reference, tests) => ({
  id, title, difficulty, summary, runtime: 'python-ds', language: 'python',
  skills, sprint: 'v49', activeFile: 'solution.py', practiceMode: 'TOOLING_ENVIRONMENT_REQUIRED',
  workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: starter }] },
  reference: { 'solution.py': reference }, tests,
});
const py = (id, difficulty, title, summary, skills, starter, reference, tests) => ({
  id, title, difficulty, summary, runtime: 'python3', language: 'python',
  skills, sprint: 'v49', activeFile: 'solution.py',
  workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: starter }] },
  reference: { 'solution.py': reference }, tests,
});
const EX = [];

// 1 — forward 2 couches (D4, dl) — numpy réel
EX.push(ds('dl-forward-2layer', 4, 'DL : passe avant à deux couches',
  "Calcule la sortie d'un réseau à 2 couches : h = relu(W1·x + b1) ; y = sigmoid(W2·h + b2). Renvoie y arrondi à 3 déc. (chaîne). C'est la brique de toute inférence : produit matriciel + non-linéarité.",
  ['dl'],
  "import numpy as np\n\ndef forward(x, W1, b1, W2, b2):\n    # relu puis sigmoid. TODO -> '%.3f' de la sortie scalaire\n    return '0.000'\n",
  "import numpy as np\n\ndef forward(x, W1, b1, W2, b2):\n    x = np.array(x, dtype=float)\n    h = np.maximum(0, np.array(W1, dtype=float) @ x + np.array(b1, dtype=float))\n    z = float((np.array(W2, dtype=float) @ h)[0] + float(np.array(b2, dtype=float)[0]))\n    y = 1.0 / (1.0 + np.exp(-z))\n    return f'{y:.3f}'\n",
  [
    { id: 't1', name: 'passe simple', kind: 'call-equals', export: 'forward',
      args: [[1, 2], [[1, 0], [0, 1]], [0, 0], [[1, 1]], [0]], expected: '0.953' },
    { id: 't2', name: 'relu coupe le négatif', kind: 'call-equals', export: 'forward',
      args: [[-5, -5], [[1, 1], [1, 1]], [0, 0], [[1, 1]], [0]], expected: '0.500' },
    { id: 't3', name: 'biais de sortie (privé)', kind: 'call-equals', export: 'forward',
      args: [[0, 0], [[1, 1], [1, 1]], [0, 0], [[1, 1]], [2]], expected: '0.881', private: true },
  ]));

// 2 — MSE (D3, dl+evalia) — stdlib
EX.push(py('dl-mse-loss', 3, 'DL : erreur quadratique moyenne',
  "Calcule la MSE entre prédictions et cibles : moyenne des (pred-cible)². Renvoie '%.3f'. C'est la perte qui guide la descente de gradient en régression.",
  ['dl', 'evalia'],
  "def mse(preds, targets):\n    # TODO: moyenne des carrés d'erreur -> '%.3f'\n    return '0.000'\n",
  "def mse(preds, targets):\n    n = len(preds)\n    s = sum((p - t) ** 2 for p, t in zip(preds, targets))\n    return f'{s / n:.3f}'\n",
  [
    { id: 't1', name: 'erreurs simples', kind: 'call-equals', export: 'mse', args: [[2, 4], [1, 2]], expected: '2.500' },
    { id: 't2', name: 'parfait', kind: 'call-equals', export: 'mse', args: [[3, 3], [3, 3]], expected: '0.000' },
    { id: 't3', name: 'une erreur (privé)', kind: 'call-equals', export: 'mse', args: [[0, 0, 3], [0, 0, 0]], expected: '3.000', private: true },
  ]));

// 3 — un pas de SGD sur régression linéaire (D4, dl) — numpy réel
EX.push(ds('dl-sgd-linear-step', 4, 'DL : un pas de descente de gradient',
  "Sur une régression linéaire y=w·x+b et perte MSE, applique UN pas de gradient : w -= lr·dW, b -= lr·db. Renvoie 'w=.. b=..' (3 déc.). Le gradient vient du calcul réel, pas d'une intuition.",
  ['dl'],
  "import numpy as np\n\ndef step(x, y, w, b, lr):\n    # gradient MSE (moyenne), un pas. TODO -> 'w=.. b=..'\n    return 'w=0.000 b=0.000'\n",
  "import numpy as np\n\ndef step(x, y, w, b, lr):\n    x = np.array(x, dtype=float); y = np.array(y, dtype=float)\n    n = len(x)\n    pred = w * x + b\n    err = pred - y\n    dW = (2.0 / n) * np.sum(err * x)\n    db = (2.0 / n) * np.sum(err)\n    w -= lr * dW; b -= lr * db\n    return f'w={w:.3f} b={b:.3f}'\n",
  [
    { id: 't1', name: 'un pas', kind: 'call-equals', export: 'step', args: [[1, 2], [2, 4], 0.0, 0.0, 0.1], expected: 'w=1.000 b=0.600' },
    { id: 't2', name: 'déjà ajusté → gradient ~0', kind: 'call-equals', export: 'step', args: [[1, 2], [1, 2], 1.0, 0.0, 0.1], expected: 'w=1.000 b=0.000' },
    { id: 't3', name: 'pas plus grand (privé)', kind: 'call-equals', export: 'step', args: [[1], [1], 0.0, 0.0, 0.5], expected: 'w=1.000 b=1.000', private: true },
  ]));

// 4 — stabilité du learning rate (D4, dl) — stdlib
EX.push(py('dl-lr-stability', 4, 'DL : le learning rate fait-il diverger ?',
  "Sur une perte quadratique de courbure c (gradient = c·θ), un pas de gradient multiplie l'erreur par (1 - lr·c). Renvoie 'diverge' si |1-lr·c|>1, 'oscille' si compris dans (-1,0), sinon 'converge'. Trop grand → divergence.",
  ['dl'],
  "def stability(lr, c):\n    # r = 1 - lr*c. TODO: 'diverge' | 'oscille' | 'converge'\n    return 'converge'\n",
  "def stability(lr, c):\n    r = 1 - lr * c\n    if abs(r) > 1:\n        return 'diverge'\n    if r < 0:\n        return 'oscille'\n    return 'converge'\n",
  [
    { id: 't1', name: 'pas trop grand', kind: 'call-equals', export: 'stability', args: [1.5, 2], expected: 'diverge' },
    { id: 't2', name: 'bon pas', kind: 'call-equals', export: 'stability', args: [0.1, 2], expected: 'converge' },
    { id: 't3', name: 'oscillation amortie (privé)', kind: 'call-equals', export: 'stability', args: [0.75, 2], expected: 'oscille', private: true },
  ]));

// 5 — écart de généralisation (D3, dl+evalia) — stdlib
EX.push(py('dl-generalization-gap', 3, 'DL : sur- ou sous-apprentissage ?',
  "À partir des pertes finales train et val : si train est basse mais val bien plus haute (écart > seuil) → 'overfit' ; si les deux sont hautes → 'underfit' ; sinon 'ok'. Diagnostic avant d'agir (régulariser vs augmenter la capacité).",
  ['dl', 'evalia'],
  "def diagnose(train_loss, val_loss, high, gap):\n    # TODO: 'overfit' | 'underfit' | 'ok'\n    return 'ok'\n",
  "def diagnose(train_loss, val_loss, high, gap):\n    if train_loss >= high and val_loss >= high:\n        return 'underfit'\n    if val_loss - train_loss > gap:\n        return 'overfit'\n    return 'ok'\n",
  [
    { id: 't1', name: 'train basse, val haute', kind: 'call-equals', export: 'diagnose', args: [0.05, 0.60, 0.5, 0.2], expected: 'overfit' },
    { id: 't2', name: 'les deux hautes', kind: 'call-equals', export: 'diagnose', args: [0.8, 0.85, 0.5, 0.2], expected: 'underfit' },
    { id: 't3', name: 'sain (privé)', kind: 'call-equals', export: 'diagnose', args: [0.10, 0.15, 0.5, 0.2], expected: 'ok', private: true },
  ]));

// 6 — initialisation He (D4, dl) — numpy réel
EX.push(ds('dl-he-init-std', 4, 'DL : écart-type d’initialisation (He)',
  "Pour une couche ReLU de fan_in entrées, l'initialisation de He recommande un écart-type sqrt(2/fan_in) : ni trop grand (saturation/explosion) ni trop petit (gradient qui s'éteint). Renvoie '%.3f'.",
  ['dl'],
  "import numpy as np\n\ndef he_std(fan_in):\n    # TODO: sqrt(2/fan_in) -> '%.3f'\n    return '0.000'\n",
  "import numpy as np\n\ndef he_std(fan_in):\n    return f'{np.sqrt(2.0 / fan_in):.3f}'\n",
  [
    { id: 't1', name: 'fan_in=2', kind: 'call-equals', export: 'he_std', args: [2], expected: '1.000' },
    { id: 't2', name: 'fan_in=8', kind: 'call-equals', export: 'he_std', args: [8], expected: '0.500' },
    { id: 't3', name: 'fan_in=200 (privé)', kind: 'call-equals', export: 'he_std', args: [200], expected: '0.100', private: true },
  ]));

// 7 — gradient qui s’évanouit (D5, dl) — stdlib, diagnostic multi-couche
EX.push(py('dl-vanishing-gradient', 5, 'DL : localiser un gradient qui s’évanouit',
  "En rétropropagation, le gradient rétropropagé est le PRODUIT cumulé des gradients locaux depuis la sortie. Étant donné ces gradients locaux dans l'ordre SORTIE→ENTRÉE, renvoie le nombre de couches franchies depuis la sortie avant que le produit cumulé devienne négligeable (< seuil) — c.-à-d. l'index (0 = couche la plus proche de la sortie) de la première couche où il s'éteint, sinon -1. Explique pourquoi les couches profondes n'apprennent plus.",
  ['dl'],
  "def vanishing(local_grads, threshold):\n    # local_grads dans l'ordre SORTIE->ENTREE. produit cumulé ; renvoie l'index\n    # (0 = proche sortie) de la 1re couche où le produit < seuil, sinon -1.\n    return -1\n",
  "def vanishing(local_grads, threshold):\n    prod = 1.0\n    for i, g in enumerate(local_grads):\n        prod *= g\n        if prod < threshold:\n            return i\n    return -1\n",
  [
    { id: 't1', name: 'sigmoïdes qui étouffent', kind: 'call-equals', export: 'vanishing', args: [[0.2, 0.2, 0.2, 0.2], 0.01], expected: 2 },
    { id: 't2', name: 'gradients sains', kind: 'call-equals', export: 'vanishing', args: [[0.9, 0.9, 0.9], 0.01], expected: -1 },
    { id: 't3', name: 'évanouit tôt (privé)', kind: 'call-equals', export: 'vanishing', args: [[0.1, 0.05, 0.9, 0.9], 0.01], expected: 1, private: true },
  ]));

const run = async () => { for (const e of EX) { await buildAndVerify(e); console.log('OK', e.id, `(D${e.difficulty} ${e.runtime})`); } };
run().catch((e) => { console.error(e.message); process.exit(1); });
