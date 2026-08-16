// CP8 — Agents / tool-use exécutable (Python stdlib). Outils déterministes ;
// l'apprenant code l'ARCHITECTURE de contrôle (boucle, budget, garde-fous).
import { buildAndVerify } from './v46-build-lib.mjs';

const ag = (id, difficulty, title, summary, starter, reference, tests, extra = {}) => ({
  id, title, difficulty, summary, runtime: 'python3', language: 'python',
  skills: ['agents'], sprint: 'v46', activeFile: 'solution.py',
  workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: starter }] },
  reference: { 'solution.py': reference }, tests, ...extra,
});

const EX = [];

// 1 — boucle + budget (D3)
EX.push(ag('agent-run-loop-budget', 3,
  'Agents : boucle avec budget',
  "Exécute une liste d'actions planifiées jusqu'à l'action 'final' OU l'épuisement du budget (nombre max d'itérations). Renvoie [n_steps_exécutés, raison] où raison ∈ {'done','budget'}. Un agent sans budget = boucle infinie sur ta facture.",
  "def run(actions, budget):\n    # TODO : itérer, s'arrêter à 'final' (done) ou quand budget atteint (budget)\n    return [0, 'done']\n",
  "def run(actions, budget):\n    steps = 0\n    for a in actions:\n        if steps >= budget:\n            return [steps, 'budget']\n        steps += 1\n        if a == 'final':\n            return [steps, 'done']\n    return [steps, 'budget'] if steps >= budget else [steps, 'done']\n",
  [
    { id: 't1', name: 'final avant budget', kind: 'call-equals', export: 'run', args: [['think', 'tool', 'final', 'x'], 10], expected: [3, 'done'] },
    { id: 't2', name: 'budget atteint', kind: 'call-equals', export: 'run', args: [['a', 'b', 'c', 'd'], 2], expected: [2, 'budget'] },
    { id: 't3', name: 'jamais de final, budget large (privé)', kind: 'call-equals', export: 'run', args: [['a', 'b'], 10], expected: [2, 'done'], private: true },
  ]));

// 2 — routage vers l'outil (D3)
EX.push(ag('agent-tool-router', 3,
  'Agents : router vers le bon outil',
  "Associe une intention à un outil selon des règles : 'meteo'→'weather', 'calcul'→'calculator', 'recherche'→'search'. Toute intention inconnue renvoie 'reject' (ne jamais inventer d'outil). Moindre surprise.",
  "def route(intent):\n    # TODO : mapper intent -> outil ; inconnu -> 'reject'\n    return 'reject'\n",
  "def route(intent):\n    table = {'meteo': 'weather', 'calcul': 'calculator', 'recherche': 'search'}\n    return table.get(intent, 'reject')\n",
  [
    { id: 't1', name: 'meteo', kind: 'call-equals', export: 'route', args: ['meteo'], expected: 'weather' },
    { id: 't2', name: 'inconnu → reject', kind: 'call-equals', export: 'route', args: ['danse'], expected: 'reject' },
    { id: 't3', name: 'calcul (privé)', kind: 'call-equals', export: 'route', args: ['calcul'], expected: 'calculator', private: true },
  ]));

// 3 — validation d'arguments (D3)
EX.push(ag('agent-validate-args', 3,
  'Agents : valider les arguments d’un outil',
  "Valide les args d'un appel d'outil contre un schéma {champ: type} ('int'|'str'). Renvoie la liste TRIÉE des erreurs : 'manquant:{champ}' si absent, 'type:{champ}' si mauvais type. Un LLM appelle parfois un outil avec de mauvais arguments.",
  "def validate(args, schema):\n    # TODO : champ manquant -> 'manquant:x' ; mauvais type -> 'type:x' ; trié\n    return []\n",
  "def validate(args, schema):\n    errors = []\n    for field, typ in schema.items():\n        if field not in args:\n            errors.append(f'manquant:{field}')\n        else:\n            v = args[field]\n            ok = (typ == 'int' and isinstance(v, int) and not isinstance(v, bool)) or (typ == 'str' and isinstance(v, str))\n            if not ok:\n                errors.append(f'type:{field}')\n    errors.sort()\n    return errors\n",
  [
    { id: 't1', name: 'champ manquant', kind: 'call-equals', export: 'validate', args: [{ ville: 'Paris' }, { ville: 'str', jours: 'int' }], expected: ['manquant:jours'] },
    { id: 't2', name: 'mauvais type', kind: 'call-equals', export: 'validate', args: [{ n: 'x' }, { n: 'int' }], expected: ['type:n'] },
    { id: 't3', name: 'tout bon → []', kind: 'call-equals', export: 'validate', args: [{ n: 3, s: 'a' }, { n: 'int', s: 'str' }], expected: [] },
    { id: 't4', name: 'cumul manquant+type (privé)', kind: 'call-equals', export: 'validate', args: [{ a: 'x' }, { a: 'int', b: 'str' }], expected: ['manquant:b', 'type:a'], private: true },
  ]));

// 4 — retry seulement si idempotent (D4)
EX.push(ag('agent-retry-idempotent', 4,
  'Agents : réessayer uniquement l’idempotent',
  "Décide de réessayer un appel d'outil échoué. Renvoie 'retry' seulement si l'outil est idempotent ET attempts < max_attempts ; sinon 'abort'. Réessayer un POST non idempotent duplique l'effet.",
  "def decide(idempotent, attempts, max_attempts):\n    # TODO : retry ssi idempotent ET attempts < max ; sinon abort\n    return 'retry'\n",
  "def decide(idempotent, attempts, max_attempts):\n    if idempotent and attempts < max_attempts:\n        return 'retry'\n    return 'abort'\n",
  [
    { id: 't1', name: 'idempotent, encore du budget', kind: 'call-equals', export: 'decide', args: [true, 1, 3], expected: 'retry' },
    { id: 't2', name: 'non idempotent → abort', kind: 'call-equals', export: 'decide', args: [false, 0, 3], expected: 'abort' },
    { id: 't3', name: 'plus de tentatives → abort', kind: 'call-equals', export: 'decide', args: [true, 3, 3], expected: 'abort' },
    { id: 't4', name: 'non idempotent même à 0 (privé)', kind: 'call-equals', export: 'decide', args: [false, 0, 9], expected: 'abort', private: true },
  ]));

// 5 — détecter une boucle (D4, diagnostic)
EX.push(ag('agent-detect-loop', 4,
  'Agents : détecter une boucle',
  "Un agent peut refaire sans cesse la même action. À partir de l'historique (liste de [outil, arg]), renvoie l'index de la PREMIÈRE répétition exacte d'une action déjà vue, ou -1. Sans détection, l'agent boucle indéfiniment.",
  "def detect_loop(history):\n    # TODO : première action (outil,arg) déjà vue -> son index ; sinon -1\n    return -1\n",
  "def detect_loop(history):\n    seen = set()\n    for i, action in enumerate(history):\n        key = tuple(action)\n        if key in seen:\n            return i\n        seen.add(key)\n    return -1\n",
  [
    { id: 't1', name: 'répétition en position 2', kind: 'call-equals', export: 'detect_loop', args: [[['search', 'a'], ['read', 'b'], ['search', 'a']]], expected: 2 },
    { id: 't2', name: 'aucune répétition → -1', kind: 'call-equals', export: 'detect_loop', args: [[['a', '1'], ['a', '2']]], expected: -1 },
    { id: 't3', name: 'répétition immédiate (privé)', kind: 'call-equals', export: 'detect_loop', args: [[['x', 'y'], ['x', 'y']]], expected: 1, private: true },
  ]));

// 6 — garde de permission / moindre privilège (D5, sécurité)
EX.push(ag('agent-permission-guard', 5,
  'Agents : garde-fou de permission (moindre privilège)',
  "Un agent outillé est une surface d'attaque. Autorise un appel d'outil seulement si sa permission requise est dans l'allowlist accordée. 'deny' sinon. Un outil 'shell.exec' n'est jamais autorisé même s'il est demandé (excès d'autonomie). Renvoie 'allow' ou 'deny'.",
  "def guard(tool, required_perm, allowlist):\n    # TODO : deny si tool == 'shell.exec' ; sinon allow ssi required_perm dans allowlist\n    return 'allow'\n",
  "def guard(tool, required_perm, allowlist):\n    if tool == 'shell.exec':\n        return 'deny'\n    return 'allow' if required_perm in allowlist else 'deny'\n",
  [
    { id: 't1', name: 'permission accordée', kind: 'call-equals', export: 'guard', args: ['read_file', 'fs.read', ['fs.read']], expected: 'allow' },
    { id: 't2', name: 'permission absente → deny', kind: 'call-equals', export: 'guard', args: ['write_file', 'fs.write', ['fs.read']], expected: 'deny' },
    { id: 't3', name: 'shell.exec toujours deny', kind: 'call-equals', export: 'guard', args: ['shell.exec', 'fs.read', ['fs.read', 'shell.exec']], expected: 'deny' },
    { id: 't4', name: 'allowlist vide → deny (privé)', kind: 'call-equals', export: 'guard', args: ['read_file', 'fs.read', []], expected: 'deny', private: true },
  ]));

let ok = 0;
for (const ex of EX) { await buildAndVerify(ex); ok++; console.log('✓', ex.id, `(D${ex.difficulty})`); }
console.log(`\nCP8 : ${ok}/${EX.length} exercices Agents (orchestration déterministe) vérifiés.`);
