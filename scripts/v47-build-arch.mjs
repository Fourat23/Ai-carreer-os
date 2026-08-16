// CP7 — Architecture & Design Patterns EXÉCUTABLES (Node.js réel).
// Le learner écrit du vrai code ; les énoncés demandent un RAISONNEMENT de
// conception (et parfois de NE PAS appliquer de pattern). Opérationnalise
// archi + patterns (à zéro).
import { buildAndVerify } from './v46-build-lib.mjs';

const ax = (id, difficulty, title, summary, skills, starter, reference, tests) => ({
  id, title, difficulty, summary, runtime: 'node-js', language: 'javascript',
  skills, sprint: 'v47', activeFile: 'solution.mjs',
  workspace: { entry: 'solution.mjs', files: [{ path: 'solution.mjs', content: starter }] },
  reference: { 'solution.mjs': reference }, tests,
});

const EX = [];

// 1 — Strategy via table (D3, patterns)
EX.push(ax('patterns-strategy-table', 3, 'Patterns : Strategy (table de dispatch)',
  "Remplace un long switch par une TABLE de stratégies : apply(op, a, b) où op ∈ {add, mul, max}. Ajouter une opération ne doit pas exiger de toucher la logique de dispatch. Renvoie le résultat (entier).",
  ['patterns', 'jsts'],
  "export function apply(op, a, b) {\n  // TODO : dispatcher via une table { op: (a,b) => ... }, pas une cascade de if\n  return 0;\n}\n",
  "const STRATEGIES = { add: (a, b) => a + b, mul: (a, b) => a * b, max: (a, b) => (a > b ? a : b) };\nexport function apply(op, a, b) {\n  const fn = STRATEGIES[op];\n  if (!fn) throw new Error('opération inconnue: ' + op);\n  return fn(a, b);\n}\n",
  [
    { id: 't1', name: 'add', kind: 'call-equals', export: 'apply', args: ['add', 2, 3], expected: 5 },
    { id: 't2', name: 'mul', kind: 'call-equals', export: 'apply', args: ['mul', 4, 5], expected: 20 },
    { id: 't3', name: 'max (privé)', kind: 'call-equals', export: 'apply', args: ['max', 7, 2], expected: 7, private: true },
  ]));

// 2 — Factory (D3, patterns)
EX.push(ax('patterns-factory-area', 3, 'Patterns : Factory + polymorphisme',
  "Une factory calcule l'aire selon la forme sans if/else répété chez l'appelant : area({kind, size}) avec kind ∈ {square, circle}. square→size*size, circle→3*size*size (pi=3 pour un résultat entier). Renvoie l'entier.",
  ['patterns', 'jsts'],
  "export function area(shape) {\n  // TODO : router par shape.kind via une table de constructeurs/formules\n  return 0;\n}\n",
  "const SHAPES = { square: (s) => s * s, circle: (s) => 3 * s * s };\nexport function area(shape) {\n  const fn = SHAPES[shape.kind];\n  if (!fn) throw new Error('forme inconnue: ' + shape.kind);\n  return fn(shape.size);\n}\n",
  [
    { id: 't1', name: 'carré', kind: 'call-equals', export: 'area', args: [{ kind: 'square', size: 4 }], expected: 16 },
    { id: 't2', name: 'cercle', kind: 'call-equals', export: 'area', args: [{ kind: 'circle', size: 2 }], expected: 12 },
    { id: 't3', name: 'carré 5 (privé)', kind: 'call-equals', export: 'area', args: [{ kind: 'square', size: 5 }], expected: 25, private: true },
  ]));

// 3 — Adapter (D3, patterns/archi)
EX.push(ax('patterns-adapter-legacy', 3, 'Patterns : Adapter (isoler un format legacy)',
  "Un service legacy renvoie {full_name, yrs}. Le reste du code attend {name, age}. Écris un ADAPTER adapt(legacy) qui traduit — pour que le legacy ne contamine pas le domaine. Renvoie le nouvel objet.",
  ['patterns', 'archi'],
  "export function adapt(legacy) {\n  // TODO : {full_name, yrs} -> {name, age}\n  return {};\n}\n",
  "export function adapt(legacy) {\n  return { name: legacy.full_name, age: legacy.yrs };\n}\n",
  [
    { id: 't1', name: 'traduction', kind: 'call-equals', export: 'adapt', args: [{ full_name: 'Ada', yrs: 41 }], expected: { name: 'Ada', age: 41 } },
    { id: 't2', name: 'autre', kind: 'call-equals', export: 'adapt', args: [{ full_name: 'Bob', yrs: 30 }], expected: { name: 'Bob', age: 30 }, private: true },
  ]));

// 4 — Observer (D4, patterns)
EX.push(ax('patterns-observer-filter', 4, 'Patterns : Observer (abonnés filtrés)',
  "Implémente un mini bus d'événements : publish(subscribers, events) où chaque subscriber = {name, types:[...]}. Renvoie une liste [name, nb_reçus] triée par name : chaque abonné ne reçoit que les events dont le type est dans ses `types`.",
  ['patterns', 'archi'],
  "export function publish(subscribers, events) {\n  // TODO : compter par abonné les events dont le type ∈ subscriber.types ; trier par name\n  return [];\n}\n",
  "export function publish(subscribers, events) {\n  const out = subscribers.map((s) => [s.name, events.filter((e) => s.types.includes(e.type)).length]);\n  out.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));\n  return out;\n}\n",
  [
    { id: 't1', name: 'filtrage', kind: 'call-equals', export: 'publish', args: [[{ name: 'log', types: ['error'] }, { name: 'audit', types: ['error', 'login'] }], [{ type: 'error' }, { type: 'login' }, { type: 'error' }]], expected: [['audit', 3], ['log', 2]] },
    { id: 't2', name: 'aucun match', kind: 'call-equals', export: 'publish', args: [[{ name: 'x', types: ['z'] }], [{ type: 'a' }]], expected: [['x', 0]] },
    { id: 't3', name: 'tri par nom (privé)', kind: 'call-equals', export: 'publish', args: [[{ name: 'b', types: ['t'] }, { name: 'a', types: ['t'] }], [{ type: 't' }]], expected: [['a', 1], ['b', 1]], private: true },
  ]));

// 5 — violation de couches (D4, archi/diagnostic)
EX.push(ax('arch-layer-violation', 4, 'Archi : détecter une violation de couches',
  "Ordre autorisé des dépendances : presentation → domain → data (une couche ne peut dépendre que d'une couche de rang ≥ au sien vers le bas). check({from, to}) renvoie 'violation' si la dépendance remonte (ex. data → presentation) ou saute vers le haut, sinon 'ok'. Rangs : presentation=0, domain=1, data=2 ; autorisé si rang(to) ≥ rang(from).",
  ['archi'],
  "export function check(edge) {\n  // TODO : rank presentation<domain<data ; ok si rank(to) >= rank(from)\n  return 'ok';\n}\n",
  "const RANK = { presentation: 0, domain: 1, data: 2 };\nexport function check(edge) {\n  return RANK[edge.to] >= RANK[edge.from] ? 'ok' : 'violation';\n}\n",
  [
    { id: 't1', name: 'presentation→domain ok', kind: 'call-equals', export: 'check', args: [{ from: 'presentation', to: 'domain' }], expected: 'ok' },
    { id: 't2', name: 'data→presentation violation', kind: 'call-equals', export: 'check', args: [{ from: 'data', to: 'presentation' }], expected: 'violation' },
    { id: 't3', name: 'domain→data ok', kind: 'call-equals', export: 'check', args: [{ from: 'domain', to: 'data' }], expected: 'ok' },
    { id: 't4', name: 'domain→presentation violation (privé)', kind: 'call-equals', export: 'check', args: [{ from: 'domain', to: 'presentation' }], expected: 'violation', private: true },
  ]));

// 6 — cycle de dépendances (D4, archi)
EX.push(ax('arch-cycle-detect', 4, 'Archi : détecter une dépendance circulaire',
  "Un graphe de dépendances entre modules {A:[B,C], ...} ne doit pas contenir de cycle. hasCycle(graph) renvoie true s'il existe un cycle, sinon false. Les cycles rendent le système impossible à modifier isolément.",
  ['archi'],
  "export function hasCycle(graph) {\n  // TODO : DFS avec pile de récursion pour détecter un cycle\n  return false;\n}\n",
  "export function hasCycle(graph) {\n  const state = {};\n  const visit = (n) => {\n    if (state[n] === 'active') return true;\n    if (state[n] === 'done') return false;\n    state[n] = 'active';\n    for (const m of graph[n] || []) if (visit(m)) return true;\n    state[n] = 'done';\n    return false;\n  };\n  return Object.keys(graph).some((n) => visit(n));\n}\n",
  [
    { id: 't1', name: 'acyclique', kind: 'call-equals', export: 'hasCycle', args: [{ A: ['B'], B: ['C'], C: [] }], expected: false },
    { id: 't2', name: 'cycle', kind: 'call-equals', export: 'hasCycle', args: [{ A: ['B'], B: ['A'] }], expected: true },
    { id: 't3', name: 'auto-cycle (privé)', kind: 'call-equals', export: 'hasCycle', args: [{ A: ['A'] }], expected: true, private: true },
  ]));

// 7 — idempotence (D4, archi)
EX.push(ax('arch-idempotent-handler', 4, 'Archi : rendre un handler idempotent',
  "Un consommateur « au moins une fois » peut recevoir un message deux fois. processOnce(ids) traite une liste d'ids d'événements et renvoie le nombre d'ids RÉELLEMENT traités (chaque id une seule fois, via un ensemble de déduplication). Réessayer ne doit pas dupliquer l'effet.",
  ['archi'],
  "export function processOnce(ids) {\n  // TODO : dédupliquer par id, compter les traitements uniques\n  return ids.length;\n}\n",
  "export function processOnce(ids) {\n  const seen = new Set();\n  let processed = 0;\n  for (const id of ids) {\n    if (seen.has(id)) continue;\n    seen.add(id);\n    processed += 1;\n  }\n  return processed;\n}\n",
  [
    { id: 't1', name: 'doublons', kind: 'call-equals', export: 'processOnce', args: [['a', 'b', 'a', 'c', 'b']], expected: 3 },
    { id: 't2', name: 'sans doublon', kind: 'call-equals', export: 'processOnce', args: [['x', 'y']], expected: 2 },
    { id: 't3', name: 'tous identiques (privé)', kind: 'call-equals', export: 'processOnce', args: [['z', 'z', 'z']], expected: 1, private: true },
  ]));

// 8 — quand NE PAS appliquer un pattern (D5, décision)
EX.push(ax('patterns-when-not-yagni', 5, 'Patterns : choisir… ou NE PAS sur-concevoir',
  "Décision de conception. On te donne {variants, changeFrequency, sharedInterface}. Renvoie 'strategy' seulement si variants>=3 ET sharedInterface===true (la variation justifie l'abstraction) ; 'yagni' si variants<=1 (une abstraction serait de la sur-ingénierie) ; sinon 'inline'. Parfois la bonne réponse est de NE PAS appliquer de pattern.",
  ['patterns', 'archi'],
  "export function decide(ctx) {\n  // TODO : strategy / yagni / inline selon variants + sharedInterface\n  return 'inline';\n}\n",
  "export function decide(ctx) {\n  if (ctx.variants <= 1) return 'yagni';\n  if (ctx.variants >= 3 && ctx.sharedInterface === true) return 'strategy';\n  return 'inline';\n}\n",
  [
    { id: 't1', name: '3 variantes + interface → strategy', kind: 'call-equals', export: 'decide', args: [{ variants: 4, changeFrequency: 'high', sharedInterface: true }], expected: 'strategy' },
    { id: 't2', name: '1 variante → yagni', kind: 'call-equals', export: 'decide', args: [{ variants: 1, changeFrequency: 'low', sharedInterface: true }], expected: 'yagni' },
    { id: 't3', name: '2 variantes → inline', kind: 'call-equals', export: 'decide', args: [{ variants: 2, changeFrequency: 'low', sharedInterface: true }], expected: 'inline' },
    { id: 't4', name: '3 variantes sans interface → inline (privé)', kind: 'call-equals', export: 'decide', args: [{ variants: 3, changeFrequency: 'high', sharedInterface: false }], expected: 'inline', private: true },
  ]));

let ok = 0;
for (const ex of EX) { await buildAndVerify(ex); ok++; console.log('✓', ex.id, `(D${ex.difficulty})`); }
console.log(`\nCP7 : ${ok}/${EX.length} exercices Architecture/Patterns vérifiés par exécution.`);
