// CP7 — RAG engineering exécutable (Python stdlib). Le PIPELINE est réellement
// codé ; la représentation (sac-de-mots) est déterministe et pédagogique, pas un
// faux appel LLM/embedding réseau.
import { buildAndVerify } from './v46-build-lib.mjs';

const rag = (id, difficulty, title, summary, starter, reference, tests, extra = {}) => ({
  id, title, difficulty, summary, runtime: 'python3', language: 'python',
  skills: ['rag'], sprint: 'v46', activeFile: 'solution.py',
  workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: starter }] },
  reference: { 'solution.py': reference }, tests, ...extra,
});

const EX = [];

// 1 — chunking par taille + overlap (D2)
EX.push(rag('rag-chunk-by-size', 2,
  'RAG : découper en chunks (taille + overlap)',
  "Découpe un texte en chunks de `size` mots avec `overlap` mots de recouvrement. Renvoie la liste des chunks (chaînes). Le pas = size-overlap. Un mauvais chunking casse tout le retrieval en aval.",
  "def chunk(text, size, overlap):\n    # TODO : mots = text.split() ; fenêtres de `size`, pas = size-overlap\n    return []\n",
  "def chunk(text, size, overlap):\n    words = text.split()\n    step = size - overlap\n    out = []\n    i = 0\n    while i < len(words):\n        out.append(' '.join(words[i:i + size]))\n        i += step\n    return out\n",
  [
    { id: 't1', name: 'size2 overlap0', kind: 'call-equals', export: 'chunk', args: ['a b c d e', 2, 0], expected: ['a b', 'c d', 'e'] },
    { id: 't2', name: 'size3 overlap1', kind: 'call-equals', export: 'chunk', args: ['a b c d e', 3, 1], expected: ['a b c', 'c d e', 'e'] },
    { id: 't3', name: 'texte court (privé)', kind: 'call-equals', export: 'chunk', args: ['un', 5, 0], expected: ['un'], private: true },
  ]));

// 2 — sac de mots (D2)
EX.push(rag('rag-bow-vector', 2,
  'RAG : représentation sac-de-mots',
  "Transforme un texte en dictionnaire {mot: fréquence} (minuscule, split par espaces). Représentation déterministe et pédagogique du sens (à défaut d'un modèle d'embedding local).",
  "def bow(text):\n    # TODO : compter les mots, en minuscule\n    return {}\n",
  "def bow(text):\n    d = {}\n    for w in text.lower().split():\n        d[w] = d.get(w, 0) + 1\n    return d\n",
  [
    { id: 't1', name: 'répétitions', kind: 'call-equals', export: 'bow', args: ['chat chat chien'], expected: { chat: 2, chien: 1 } },
    { id: 't2', name: 'casse ignorée', kind: 'call-equals', export: 'bow', args: ['Chat chat'], expected: { chat: 2 } },
    { id: 't3', name: 'vide (privé)', kind: 'call-equals', export: 'bow', args: [''], expected: {}, private: true },
  ]));

// 3 — similarité cosinus (D3)
EX.push(rag('rag-cosine-similarity', 3,
  'RAG : similarité cosinus',
  "Calcule le cosinus entre deux sacs-de-mots {mot: poids} : produit scalaire / (norme_a * norme_b). Renvoie une chaîne à 3 décimales. '0.000' si une norme est nulle. C'est ce qui rapproche « chat » et « félin ».",
  "import math\n\ndef cosine(a, b):\n    # TODO : dot / (|a| * |b|) ; formater '%.3f'\n    return '0.000'\n",
  "import math\n\ndef cosine(a, b):\n    dot = sum(a[k] * b.get(k, 0) for k in a)\n    na = math.sqrt(sum(v * v for v in a.values()))\n    nb = math.sqrt(sum(v * v for v in b.values()))\n    if na == 0 or nb == 0:\n        return '0.000'\n    return f'{dot / (na * nb):.3f}'\n",
  [
    { id: 't1', name: 'identiques → 1.000', kind: 'call-equals', export: 'cosine', args: [{ chat: 1, dort: 1 }, { chat: 1, dort: 1 }], expected: '1.000' },
    { id: 't2', name: 'orthogonaux → 0.000', kind: 'call-equals', export: 'cosine', args: [{ chat: 1 }, { boulon: 1 }], expected: '0.000' },
    { id: 't3', name: 'norme nulle (privé)', kind: 'call-equals', export: 'cosine', args: [{}, { a: 1 }], expected: '0.000', private: true },
  ]));

// 4 — top-k retrieval (D3)
EX.push(rag('rag-topk-retrieve', 3,
  'RAG : retrouver le top-k',
  "Étant donné un vecteur requête et des docs {id: vecteur}, renvoie les `k` ids les plus proches par cosinus, du plus proche au moins proche (id croissant en cas d'égalité). Le retrieval est le maillon faible : il faut le mesurer.",
  "import math\n\ndef cos(a, b):\n    dot = sum(a[x] * b.get(x, 0) for x in a)\n    na = math.sqrt(sum(v*v for v in a.values())); nb = math.sqrt(sum(v*v for v in b.values()))\n    return dot/(na*nb) if na and nb else 0.0\n\ndef topk(query, docs, k):\n    # TODO : trier les docs par cosinus décroissant (id croissant si égalité), garder k\n    return []\n",
  "import math\n\ndef cos(a, b):\n    dot = sum(a[x] * b.get(x, 0) for x in a)\n    na = math.sqrt(sum(v*v for v in a.values())); nb = math.sqrt(sum(v*v for v in b.values()))\n    return dot/(na*nb) if na and nb else 0.0\n\ndef topk(query, docs, k):\n    scored = [(cos(query, v), did) for did, v in docs.items()]\n    scored.sort(key=lambda s: (-s[0], s[1]))\n    return [did for _, did in scored[:k]]\n",
  [
    { id: 't1', name: 'top 1', kind: 'call-equals', export: 'topk', args: [{ chat: 1 }, { d1: { chat: 1 }, d2: { chien: 1 } }, 1], expected: ['d1'] },
    { id: 't2', name: 'top 2 ordonné', kind: 'call-equals', export: 'topk', args: [{ a: 1, b: 1 }, { d1: { a: 1 }, d2: { a: 1, b: 1 }, d3: { c: 1 } }, 2], expected: ['d2', 'd1'] },
    { id: 't3', name: 'k>docs (privé)', kind: 'call-equals', export: 'topk', args: [{ a: 1 }, { d1: { a: 1 } }, 5], expected: ['d1'], private: true },
  ]));

// 5 — fusion RRF (D4)
EX.push(rag('rag-rrf-hybrid-fuse', 4,
  'RAG : fusion hybride (RRF)',
  "Fusionne deux classements (listes d'ids) par Reciprocal Rank Fusion : score(id) = somme de 1/(60+rang) sur chaque liste où il apparaît (rang 1-based). Renvoie les ids triés par score décroissant (id croissant si égalité). Hybride = sens (vectoriel) + mots exacts (lexical).",
  "def rrf(list_a, list_b):\n    # TODO : score = 1/(60+rang) cumulé ; trier desc, id asc\n    return []\n",
  "def rrf(list_a, list_b):\n    scores = {}\n    for lst in (list_a, list_b):\n        for rank, did in enumerate(lst, start=1):\n            scores[did] = scores.get(did, 0.0) + 1.0 / (60 + rank)\n    order = sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))\n    return [did for did, _ in order]\n",
  [
    { id: 't1', name: 'présent dans les deux remonte', kind: 'call-equals', export: 'rrf', args: [['a', 'b', 'c'], ['b', 'd']], expected: ['b', 'a', 'd', 'c'] },
    { id: 't2', name: 'listes disjointes', kind: 'call-equals', export: 'rrf', args: [['x'], ['y']], expected: ['x', 'y'] },
    { id: 't3', name: 'égalité → id asc (privé)', kind: 'call-equals', export: 'rrf', args: [['m', 'n'], ['m', 'n']], expected: ['m', 'n'], private: true },
  ]));

// 6 — recall@k (D4)
EX.push(rag('rag-recall-at-k', 4,
  'RAG : mesurer le rappel@k',
  "Sur un golden set (liste de {retrieved:[ids classés], relevant: id, k}), calcule le rappel@k = fraction des requêtes où le doc pertinent est dans les k premiers. Renvoie une chaîne '%.3f'. Sans mesure, on améliore à l'aveugle.",
  "def recall_at_k(queries):\n    # TODO : pour chaque requête, relevant dans retrieved[:k] ? moyenne, '%.3f'\n    return '0.000'\n",
  "def recall_at_k(queries):\n    if not queries:\n        return '0.000'\n    hits = 0\n    for q in queries:\n        if q['relevant'] in q['retrieved'][:q['k']]:\n            hits += 1\n    return f'{hits/len(queries):.3f}'\n",
  [
    { id: 't1', name: '2/2 trouvés', kind: 'call-equals', export: 'recall_at_k', args: [[{ retrieved: ['a', 'b'], relevant: 'a', k: 2 }, { retrieved: ['c', 'd'], relevant: 'd', k: 2 }]], expected: '1.000' },
    { id: 't2', name: 'pertinent hors top-k', kind: 'call-equals', export: 'recall_at_k', args: [[{ retrieved: ['a', 'b', 'x'], relevant: 'x', k: 2 }]], expected: '0.000' },
    { id: 't3', name: '1 sur 2 (privé)', kind: 'call-equals', export: 'recall_at_k', args: [[{ retrieved: ['a'], relevant: 'a', k: 1 }, { retrieved: ['b'], relevant: 'z', k: 1 }]], expected: '0.500', private: true },
  ]));

// 7 — diagnostiquer retrieval vs génération (D5, décision)
EX.push(rag('rag-diagnose-fault', 5,
  'RAG : diagnostiquer la panne (retrieval vs génération)',
  "Un RAG répond mal. À partir de {answer_in_context: bool, answer_correct: bool}, décide : 'retrieval' si le bon passage n'a pas été ramené ; 'generation' si le contexte contenait la réponse mais la sortie est fausse ; 'lucky-guess' si la réponse est correcte SANS être dans le contexte (bonne réponse, mauvaise raison — système à corriger) ; 'ok' sinon.",
  "def diagnose(case):\n    # TODO : retrieval / generation / lucky-guess / ok\n    return 'ok'\n",
  "def diagnose(case):\n    inctx = case.get('answer_in_context')\n    correct = case.get('answer_correct')\n    if correct and not inctx:\n        return 'lucky-guess'\n    if not inctx:\n        return 'retrieval'\n    if inctx and not correct:\n        return 'generation'\n    return 'ok'\n",
  [
    { id: 't1', name: 'contexte manquant → retrieval', kind: 'call-equals', export: 'diagnose', args: [{ answer_in_context: false, answer_correct: false }], expected: 'retrieval' },
    { id: 't2', name: 'contexte ok mais faux → generation', kind: 'call-equals', export: 'diagnose', args: [{ answer_in_context: true, answer_correct: false }], expected: 'generation' },
    { id: 't3', name: 'correct sans contexte → lucky-guess', kind: 'call-equals', export: 'diagnose', args: [{ answer_in_context: false, answer_correct: true }], expected: 'lucky-guess' },
    { id: 't4', name: 'contexte ok et correct → ok (privé)', kind: 'call-equals', export: 'diagnose', args: [{ answer_in_context: true, answer_correct: true }], expected: 'ok', private: true },
  ]));

let ok = 0;
for (const ex of EX) { await buildAndVerify(ex); ok++; console.log('✓', ex.id, `(D${ex.difficulty})`); }
console.log(`\nCP7 : ${ok}/${EX.length} exercices RAG (pipeline réel, représentation déterministe) vérifiés.`);
