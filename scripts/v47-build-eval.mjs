// CP6 — AI / LLM Evaluation Engineering (Python stdlib, déterministe).
// Opérationnalise evalia + llm (à zéro). Aucun appel modèle réel : briques
// déterministes ; la groundedness heuristique est étiquetée PROXY.
import { buildAndVerify } from './v46-build-lib.mjs';

const ev = (id, difficulty, title, summary, skills, starter, reference, tests, mode) => ({
  id, title, difficulty, summary, runtime: 'python3', language: 'python',
  skills, sprint: 'v47', activeFile: 'solution.py',
  ...(mode ? { practiceMode: mode } : {}),
  workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: starter }] },
  reference: { 'solution.py': reference }, tests,
});

const EX = [];

// 1 — exact match (D3, evalia)
EX.push(ev('eval-exact-match', 3, 'Éval IA : exact match',
  "Sur un golden set (liste de {pred, gold}), calcule le taux d'exact match (chaînes égales après strip). Renvoie '%.3f'. Base de toute évaluation de régression.",
  ['evalia'],
  "def exact_match(rows):\n    # TODO : fraction où pred.strip()==gold.strip(), '%.3f'\n    return '0.000'\n",
  "def exact_match(rows):\n    if not rows:\n        return '0.000'\n    ok = sum(1 for r in rows if r['pred'].strip() == r['gold'].strip())\n    return f'{ok/len(rows):.3f}'\n",
  [
    { id: 't1', name: '2/3', kind: 'call-equals', export: 'exact_match', args: [[{ pred: 'a', gold: 'a' }, { pred: 'b ', gold: 'b' }, { pred: 'x', gold: 'y' }]], expected: '0.667' },
    { id: 't2', name: 'tous bons', kind: 'call-equals', export: 'exact_match', args: [[{ pred: 'z', gold: 'z' }]], expected: '1.000' },
    { id: 't3', name: 'vide (privé)', kind: 'call-equals', export: 'exact_match', args: [[]], expected: '0.000', private: true },
  ]));

// 2 — validation de sortie structurée (D3, evalia + llm)
EX.push(ev('eval-structured-output', 3, 'Éval IA : valider une sortie structurée',
  "Un LLM renvoie un dict censé suivre un schéma {champ: type} ('str'|'int'|'bool'). Renvoie la liste TRIÉE des erreurs 'manquant:x' / 'type:x'. Une sortie « JSON » non validée casse un jour.",
  ['evalia', 'llm'],
  "def validate(out, schema):\n    # TODO : champ manquant / mauvais type -> erreurs triées\n    return []\n",
  "def validate(out, schema):\n    errs = []\n    for f, t in schema.items():\n        if f not in out:\n            errs.append(f'manquant:{f}')\n        else:\n            v = out[f]\n            ok = (t == 'int' and isinstance(v, int) and not isinstance(v, bool)) or (t == 'str' and isinstance(v, str)) or (t == 'bool' and isinstance(v, bool))\n            if not ok:\n                errs.append(f'type:{f}')\n    errs.sort()\n    return errs\n",
  [
    { id: 't1', name: 'manquant', kind: 'call-equals', export: 'validate', args: [{ nom: 'x' }, { nom: 'str', age: 'int' }], expected: ['manquant:age'] },
    { id: 't2', name: 'mauvais type', kind: 'call-equals', export: 'validate', args: [{ age: 'vieux' }, { age: 'int' }], expected: ['type:age'] },
    { id: 't3', name: 'valide', kind: 'call-equals', export: 'validate', args: [{ ok: true }, { ok: 'bool' }], expected: [] },
    { id: 't4', name: 'cumul (privé)', kind: 'call-equals', export: 'validate', args: [{ a: 'x' }, { a: 'int', b: 'str' }], expected: ['manquant:b', 'type:a'], private: true },
  ]));

// 3 — groundedness / citation (D4, evalia) — PROXY
EX.push(ev('eval-groundedness-proxy', 4, 'Éval IA : ancrage des citations (PROXY)',
  "PROXY d'ancrage : pour chaque {claim, chunk_id}, la réponse est ancrée si le chunk_id existe dans le contexte fourni ET le texte du claim est contenu (sous-chaîne) dans ce chunk. Renvoie la fraction ancrée '%.2f'. NB : proxy déterministe, pas une vraie mesure sémantique.",
  ['evalia'],
  "def grounded(claims, context):\n    # context: {chunk_id: texte}. claim ancré si chunk_id existe ET claim in texte.\n    # TODO : fraction ancrée '%.2f'\n    return '0.00'\n",
  "def grounded(claims, context):\n    if not claims:\n        return '0.00'\n    ok = 0\n    for c in claims:\n        txt = context.get(c['chunk_id'])\n        if txt is not None and c['claim'] in txt:\n            ok += 1\n    return f'{ok/len(claims):.2f}'\n",
  [
    { id: 't1', name: '1/2 ancré', kind: 'call-equals', export: 'grounded', args: [[{ claim: 'préavis deux mois', chunk_id: 'c1' }, { claim: 'inventé', chunk_id: 'c1' }], { c1: 'le préavis deux mois est requis' }], expected: '0.50' },
    { id: 't2', name: 'chunk absent', kind: 'call-equals', export: 'grounded', args: [[{ claim: 'x', chunk_id: 'zzz' }], { c1: 'y' }], expected: '0.00' },
    { id: 't3', name: 'tout ancré (privé)', kind: 'call-equals', export: 'grounded', args: [[{ claim: 'ok', chunk_id: 'c1' }], { c1: 'ok voila' }], expected: '1.00', private: true },
  ]));
// fix practiceMode for the last push (helper signature): set explicitly
EX[EX.length - 1].practiceMode = 'PROXY';

// 4 — regression gate (D4, evalia)
EX.push(ev('eval-regression-gate', 4, 'Éval IA : porte de non-régression',
  "Compare des scores {métrique: valeur} à une baseline. Renvoie 'regression' si UNE métrique chute de plus de la tolérance (baseline - courant > tol) ; sinon 'pass'. Empêche de livrer une dégradation silencieuse.",
  ['evalia'],
  "def gate(current, baseline, tol):\n    # TODO : 'regression' si une métrique baisse de plus de tol, sinon 'pass'\n    return 'pass'\n",
  "def gate(current, baseline, tol):\n    for k, base in baseline.items():\n        if base - current.get(k, 0) > tol:\n            return 'regression'\n    return 'pass'\n",
  [
    { id: 't1', name: 'chute > tol', kind: 'call-equals', export: 'gate', args: [{ f1: 0.70 }, { f1: 0.85 }, 0.05], expected: 'regression' },
    { id: 't2', name: 'stable', kind: 'call-equals', export: 'gate', args: [{ f1: 0.84 }, { f1: 0.85 }, 0.05], expected: 'pass' },
    { id: 't3', name: 'amélioration → pass (privé)', kind: 'call-equals', export: 'gate', args: [{ f1: 0.95 }, { f1: 0.85 }, 0.05], expected: 'pass', private: true },
  ]));

// 5 — validation d'appel d'outil (D4, evalia + agents)
EX.push(ev('eval-tool-call-contract', 4, 'Éval IA : contrat d’appel d’outil',
  "Un LLM émet un appel d'outil {name, args}. Valide contre le contrat {name, required:[...]}. Renvoie 'invalid:name' si le nom ne correspond pas, sinon la liste triée 'missing:arg' des args requis absents, [] si valide.",
  ['evalia', 'agents'],
  "def check(call, contract):\n    # TODO : nom faux -> ['invalid:name'] ; sinon missing args triés\n    return []\n",
  "def check(call, contract):\n    if call.get('name') != contract.get('name'):\n        return ['invalid:name']\n    args = call.get('args', {})\n    missing = [f'missing:{a}' for a in contract.get('required', []) if a not in args]\n    missing.sort()\n    return missing\n",
  [
    { id: 't1', name: 'nom faux', kind: 'call-equals', export: 'check', args: [{ name: 'x', args: {} }, { name: 'search', required: ['q'] }], expected: ['invalid:name'] },
    { id: 't2', name: 'arg manquant', kind: 'call-equals', export: 'check', args: [{ name: 'search', args: {} }, { name: 'search', required: ['q'] }], expected: ['missing:q'] },
    { id: 't3', name: 'valide', kind: 'call-equals', export: 'check', args: [{ name: 'search', args: { q: 'a' } }, { name: 'search', required: ['q'] }], expected: [] },
    { id: 't4', name: 'deux manquants (privé)', kind: 'call-equals', export: 'check', args: [{ name: 's', args: {} }, { name: 's', required: ['b', 'a'] }], expected: ['missing:a', 'missing:b'], private: true },
  ]));

// 6 — estimation de tokens (D3, llm) — PROXY
EX.push(ev('llm-token-estimate', 3, 'LLM : estimer les tokens (PROXY)',
  "PROXY déterministe : estime le nombre de tokens ≈ ceil(nombre de caractères / 4). Renvoie l'entier. Utile pour estimer coût et fenêtre AVANT d'appeler. NB : proxy, pas un vrai tokenizer.",
  ['llm'],
  "import math\n\ndef estimate_tokens(text):\n    # TODO : ceil(len(text)/4)\n    return 0\n",
  "import math\n\ndef estimate_tokens(text):\n    return math.ceil(len(text) / 4)\n",
  [
    { id: 't1', name: '8 chars → 2', kind: 'call-equals', export: 'estimate_tokens', args: ['abcdefgh'], expected: 2 },
    { id: 't2', name: '5 chars → 2', kind: 'call-equals', export: 'estimate_tokens', args: ['abcde'], expected: 2 },
    { id: 't3', name: 'vide → 0 (privé)', kind: 'call-equals', export: 'estimate_tokens', args: [''], expected: 0, private: true },
  ]));
EX[EX.length - 1].practiceMode = 'PROXY';

// 7 — estimation de coût (D3, llm)
EX.push(ev('llm-cost-per-call', 3, 'LLM : estimer le coût d’un appel',
  "Coût = tokens_in/1000 * prix_in + tokens_out/1000 * prix_out. Renvoie '%.4f' USD. Un RAG qui injecte 20 chunks paie l'entrée à chaque question : estimer AVANT de lancer.",
  ['llm'],
  "def cost(tokens_in, tokens_out, price_in, price_out):\n    # TODO : (in/1000)*price_in + (out/1000)*price_out, '%.4f'\n    return '0.0000'\n",
  "def cost(tokens_in, tokens_out, price_in, price_out):\n    c = tokens_in / 1000 * price_in + tokens_out / 1000 * price_out\n    return f'{c:.4f}'\n",
  [
    { id: 't1', name: '1000in 500out', kind: 'call-equals', export: 'cost', args: [1000, 500, 0.003, 0.015], expected: '0.0105' },
    { id: 't2', name: 'zéro out', kind: 'call-equals', export: 'cost', args: [2000, 0, 0.001, 0.002], expected: '0.0020' },
    { id: 't3', name: 'petit (privé)', kind: 'call-equals', export: 'cost', args: [100, 100, 0.001, 0.001], expected: '0.0002', private: true },
  ]));

// 8 — catégoriser un échec (D4, evalia)
EX.push(ev('eval-failure-categorize', 4, 'Éval IA : catégoriser un échec',
  "À partir de flags {in_context, correct_format, factually_correct}, catégorise l'échec : 'retrieval-miss' si pas de contexte ; sinon 'format-error' si format incorrect ; sinon 'hallucination' si incorrect malgré contexte+format ; sinon 'ok'. L'analyse d'échecs guide la correction.",
  ['evalia'],
  "def categorize(flags):\n    # TODO : retrieval-miss / format-error / hallucination / ok\n    return 'ok'\n",
  "def categorize(flags):\n    if not flags.get('in_context'):\n        return 'retrieval-miss'\n    if not flags.get('correct_format'):\n        return 'format-error'\n    if not flags.get('factually_correct'):\n        return 'hallucination'\n    return 'ok'\n",
  [
    { id: 't1', name: 'pas de contexte', kind: 'call-equals', export: 'categorize', args: [{ in_context: false, correct_format: true, factually_correct: false }], expected: 'retrieval-miss' },
    { id: 't2', name: 'format cassé', kind: 'call-equals', export: 'categorize', args: [{ in_context: true, correct_format: false, factually_correct: true }], expected: 'format-error' },
    { id: 't3', name: 'hallucination', kind: 'call-equals', export: 'categorize', args: [{ in_context: true, correct_format: true, factually_correct: false }], expected: 'hallucination' },
    { id: 't4', name: 'ok (privé)', kind: 'call-equals', export: 'categorize', args: [{ in_context: true, correct_format: true, factually_correct: true }], expected: 'ok', private: true },
  ]));

let ok = 0;
for (const ex of EX) { await buildAndVerify(ex); ok++; console.log('✓', ex.id, `(D${ex.difficulty})`); }
console.log(`\nCP6 : ${ok}/${EX.length} exercices Éval IA / LLM vérifiés par exécution.`);
