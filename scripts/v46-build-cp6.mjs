// CP6 — Deep Learning intuition → code (Python stdlib, petits calculs déterministes).
import { buildAndVerify } from './v46-build-lib.mjs';

const dl = (id, difficulty, title, summary, starter, reference, tests, extra = {}) => ({
  id, title, difficulty, summary, runtime: 'python3', language: 'python',
  skills: ['dl'], sprint: 'v46', activeFile: 'solution.py',
  workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: starter }] },
  reference: { 'solution.py': reference }, tests, ...extra,
});

const EX = [];

// 1 — neurone : forward (D2)
EX.push(dl('dl-neuron-forward', 2,
  'DL : le forward d’un neurone',
  "Calcule la sortie d'un neurone : sigmoid(w·x + b). Renvoie une chaîne à 3 décimales. sigmoid(z)=1/(1+e^-z). C'est LA brique de base d'un réseau.",
  "import math\n\ndef forward(w, x, b):\n    # TODO : z = somme(w_i*x_i) + b ; renvoyer f'{sigmoid(z):.3f}'\n    return '0.000'\n",
  "import math\n\ndef forward(w, x, b):\n    z = sum(wi * xi for wi, xi in zip(w, x)) + b\n    y = 1 / (1 + math.exp(-z))\n    return f'{y:.3f}'\n",
  [
    { id: 't1', name: 'z=0 → 0.500', kind: 'call-equals', export: 'forward', args: [[0, 0], [1, 1], 0], expected: '0.500' },
    { id: 't2', name: 'z=2 → 0.881', kind: 'call-equals', export: 'forward', args: [[1, 1], [1, 1], 0], expected: '0.881' },
    { id: 't3', name: 'biais négatif (privé)', kind: 'call-equals', export: 'forward', args: [[2], [1], -2], expected: '0.500', private: true },
  ]));

// 2 — ReLU sur une couche (D2)
EX.push(dl('dl-relu-layer', 2,
  'DL : activation ReLU',
  "Applique ReLU à chaque valeur d'une couche : relu(x)=max(0,x). Renvoie la liste transformée. Sans non-linéarité, empiler des couches ne servirait à rien.",
  "def relu(xs):\n    # TODO : max(0, x) pour chaque x\n    return xs\n",
  "def relu(xs):\n    return [x if x > 0 else 0 for x in xs]\n",
  [
    { id: 't1', name: 'négatifs → 0', kind: 'call-equals', export: 'relu', args: [[-2, -1, 0, 3, 5]], expected: [0, 0, 0, 3, 5] },
    { id: 't2', name: 'tous positifs', kind: 'call-equals', export: 'relu', args: [[1, 2, 3]], expected: [1, 2, 3] },
    { id: 't3', name: 'tous négatifs (privé)', kind: 'call-equals', export: 'relu', args: [[-5, -9]], expected: [0, 0], private: true },
  ]));

// 3 — un pas de descente de gradient (D3)
EX.push(dl('dl-gradient-step', 3,
  'DL : un pas de descente de gradient',
  "Modèle linéaire pred=w*x, perte MSE=(pred-y)^2. Le gradient dL/dw = 2*(pred-y)*x. Fais UN pas : w_new = w - lr*grad. Renvoie w_new à 4 décimales. LR trop grand diverge, trop petit n'avance pas.",
  "def step(w, x, y, lr):\n    # TODO : pred=w*x ; grad=2*(pred-y)*x ; w - lr*grad ; f'{w_new:.4f}'\n    return f'{w:.4f}'\n",
  "def step(w, x, y, lr):\n    pred = w * x\n    grad = 2 * (pred - y) * x\n    w_new = w - lr * grad\n    return f'{w_new:.4f}'\n",
  [
    { id: 't1', name: 'w=0 x=2 y=4 lr=0.1', kind: 'call-equals', export: 'step', args: [0, 2, 4, 0.1], expected: '1.6000' },
    { id: 't2', name: 'déjà optimal (grad 0)', kind: 'call-equals', export: 'step', args: [2, 2, 4, 0.1], expected: '2.0000' },
    { id: 't3', name: 'lr plus grand (privé)', kind: 'call-equals', export: 'step', args: [0, 1, 1, 0.5], expected: '1.0000', private: true },
  ]));

// 4 — compter les paramètres (D3)
EX.push(dl('dl-count-params', 3,
  'DL : compter les paramètres d’un MLP',
  "Un MLP entièrement connecté a des couches de tailles données (ex. [3,4,2]). Nombre de paramètres = somme sur chaque transition de (entrées*sorties + biais_sorties). Renvoie l'entier total. Explique la taille (et le coût) d'un réseau.",
  "def count_params(sizes):\n    # TODO : pour chaque paire (a,b) consécutive : a*b (poids) + b (biais)\n    return 0\n",
  "def count_params(sizes):\n    total = 0\n    for a, b in zip(sizes, sizes[1:]):\n        total += a * b + b\n    return total\n",
  [
    { id: 't1', name: '[3,4,2] → 26', kind: 'call-equals', export: 'count_params', args: [[3, 4, 2]], expected: 26 },
    { id: 't2', name: '[2,1] → 3', kind: 'call-equals', export: 'count_params', args: [[2, 1]], expected: 3 },
    { id: 't3', name: 'une seule couche → 0 (privé)', kind: 'call-equals', export: 'count_params', args: [[5]], expected: 0, private: true },
  ]));

// 5 — diagnostiquer un entraînement (D4, diagnostic)
EX.push(dl('dl-diagnose-training', 4,
  'DL : diagnostiquer un entraînement',
  "À partir de la courbe de perte (liste), classe : 'diverging' si la perte finale > perte initiale ; 'not-learning' si elle bouge de moins de 1% (plateau dès le départ) ; sinon 'healthy'. On diagnostique par la courbe, pas au hasard.",
  "def diagnose(losses):\n    # TODO : diverging / not-learning / healthy à partir de la courbe\n    return 'healthy'\n",
  "def diagnose(losses):\n    if not losses:\n        return 'not-learning'\n    first, last = losses[0], losses[-1]\n    if last > first:\n        return 'diverging'\n    if first > 0 and (first - last) / first < 0.01:\n        return 'not-learning'\n    return 'healthy'\n",
  [
    { id: 't1', name: 'perte qui remonte → diverging', kind: 'call-equals', export: 'diagnose', args: [[1.0, 2.0, 5.0]], expected: 'diverging' },
    { id: 't2', name: 'plateau → not-learning', kind: 'call-equals', export: 'diagnose', args: [[1.0, 0.999, 0.999]], expected: 'not-learning' },
    { id: 't3', name: 'descente franche → healthy', kind: 'call-equals', export: 'diagnose', args: [[2.0, 1.0, 0.3]], expected: 'healthy' },
    { id: 't4', name: 'liste vide (privé)', kind: 'call-equals', export: 'diagnose', args: [[]], expected: 'not-learning', private: true },
  ]));

let ok = 0;
for (const ex of EX) { await buildAndVerify(ex); ok++; console.log('✓', ex.id, `(D${ex.difficulty})`); }
console.log(`\nCP6 : ${ok}/${EX.length} exercices DL (stdlib) vérifiés par exécution réelle.`);
