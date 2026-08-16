// CP3 — Python / Data : pratique exécutable (Python stdlib réel).
import { buildAndVerify } from './v46-build-lib.mjs';

const py = (id, difficulty, title, summary, skills, files, entry, reference, tests, extra = {}) => ({
  id, title, difficulty, summary, runtime: 'python3', language: 'python',
  skills, sprint: 'v46', activeFile: entry, workspace: { entry, files }, reference, tests, ...extra,
});
const F = (path, content, readOnly) => (readOnly ? { path, content, readOnly: true } : { path, content });

const EX = [];

// 1 — parse (D2)
EX.push(py('py-data-parse-records', 2,
  'Python/Data : parser des enregistrements',
  "Parse des lignes « nom,age » en liste [nom, age(int)] triée par nom. Ignore les lignes vides. Utilise str.split et int().",
  ['python', 'data'],
  [F('solution.py', "def parse(text):\n    # TODO : découper chaque ligne non vide en [nom, int(age)], trier par nom\n    return []\n")],
  'solution.py',
  { 'solution.py': "def parse(text):\n    rows = []\n    for line in text.splitlines():\n        line = line.strip()\n        if not line:\n            continue\n        nom, age = line.split(',')\n        rows.append([nom, int(age)])\n    rows.sort(key=lambda r: r[0])\n    return rows\n" },
  [
    { id: 't1', name: 'deux lignes', kind: 'call-equals', export: 'parse', args: ['Bob,30\nAda,41'], expected: [['Ada', 41], ['Bob', 30]] },
    { id: 't2', name: 'ligne vide ignorée', kind: 'call-equals', export: 'parse', args: ['Zoe,5\n\nAmi,9'], expected: [['Ami', 9], ['Zoe', 5]] },
    { id: 't3', name: 'vide → []', kind: 'call-equals', export: 'parse', args: [''], expected: [], private: true },
  ]));

// 2 — groupby sum (D3)
EX.push(py('py-data-groupby-sum', 3,
  'Python/Data : regrouper et agréger',
  "Regroupe une liste de dicts par « service » et somme « salaire ». Renvoie une liste [service, total] triée par total décroissant puis service. defaultdict recommandé.",
  ['python', 'data'],
  [F('solution.py', "from collections import defaultdict\n\ndef group_sum(rows):\n    # TODO : sommer salaire par service, trier par total desc puis service asc\n    return []\n")],
  'solution.py',
  { 'solution.py': "from collections import defaultdict\n\ndef group_sum(rows):\n    acc = defaultdict(int)\n    for r in rows:\n        acc[r['service']] += r['salaire']\n    out = [[s, t] for s, t in acc.items()]\n    out.sort(key=lambda x: (-x[1], x[0]))\n    return out\n" },
  [
    { id: 't1', name: '3 lignes', kind: 'call-equals', export: 'group_sum', args: [[{ service: 'tech', salaire: 100 }, { service: 'rh', salaire: 200 }, { service: 'tech', salaire: 300 }]], expected: [['tech', 400], ['rh', 200]] },
    { id: 't2', name: 'égalité → tri alpha', kind: 'call-equals', export: 'group_sum', args: [[{ service: 'b', salaire: 50 }, { service: 'a', salaire: 50 }]], expected: [['a', 50], ['b', 50]] },
    { id: 't3', name: 'vide (privé)', kind: 'call-equals', export: 'group_sum', args: [[]], expected: [], private: true },
  ]));

// 3 — inner join (D3)
EX.push(py('py-data-inner-join', 3,
  'Python/Data : jointure interne',
  "Joins deux listes de dicts sur « id ». Renvoie [id, nomA, nomB] pour les id présents DES DEUX côtés, triés par id. Les orphelins sont exclus (INNER JOIN).",
  ['python', 'data'],
  [F('solution.py', "def inner_join(a, b):\n    # TODO : index b par id, ne garder que les id communs, trier par id\n    return []\n")],
  'solution.py',
  { 'solution.py': "def inner_join(a, b):\n    idx = {r['id']: r['nom'] for r in b}\n    out = []\n    for r in a:\n        if r['id'] in idx:\n            out.append([r['id'], r['nom'], idx[r['id']]])\n    out.sort(key=lambda x: x[0])\n    return out\n" },
  [
    { id: 't1', name: 'un commun', kind: 'call-equals', export: 'inner_join', args: [[{ id: 1, nom: 'A' }, { id: 2, nom: 'B' }], [{ id: 2, nom: 'X' }]], expected: [[2, 'B', 'X']] },
    { id: 't2', name: 'aucun commun', kind: 'call-equals', export: 'inner_join', args: [[{ id: 1, nom: 'A' }], [{ id: 9, nom: 'Z' }]], expected: [] },
    { id: 't3', name: 'deux communs triés (privé)', kind: 'call-equals', export: 'inner_join', args: [[{ id: 3, nom: 'C' }, { id: 1, nom: 'A' }], [{ id: 1, nom: 'a' }, { id: 3, nom: 'c' }]], expected: [[1, 'A', 'a'], [3, 'C', 'c']], private: true },
  ]));

// 4 — clean missing (D3, diagnostic)
EX.push(py('py-data-clean-missing', 3,
  'Python/Data : valeurs manquantes',
  "Nettoie une liste de nombres où None représente une valeur manquante. Renvoie [nb_valides, somme_valides] en IGNORANT les None. Ne comptabilise jamais None comme 0.",
  ['python', 'data'],
  [F('solution.py', "def clean(values):\n    # TODO : ignorer les None (pas les traiter comme 0), renvoyer [count, sum]\n    return [len(values), sum(values)]\n")],
  'solution.py',
  { 'solution.py': "def clean(values):\n    valid = [v for v in values if v is not None]\n    return [len(valid), sum(valid)]\n" },
  [
    { id: 't1', name: 'avec None', kind: 'call-equals', export: 'clean', args: [[10, null, 20, null, 30]], expected: [3, 60] },
    { id: 't2', name: 'sans None', kind: 'call-equals', export: 'clean', args: [[5, 5]], expected: [2, 10] },
    { id: 't3', name: 'que des None (privé)', kind: 'call-equals', export: 'clean', args: [[null, null]], expected: [0, 0], private: true },
  ]));

// 5 — validate schema (D4, diagnostic)
EX.push(py('py-data-validate-schema', 4,
  'Python/Data : validation de schéma',
  "Valide des lignes {nom, age}. Règles : nom non vide (str), age entier 0..120. Renvoie la liste TRIÉE des erreurs « ligne {i}: {champ} » (i = index 0-based). Une ligne peut cumuler plusieurs erreurs.",
  ['python', 'data'],
  [F('solution.py', "def validate(rows):\n    # TODO : renvoyer les erreurs 'ligne {i}: nom' et/ou 'ligne {i}: age', triées\n    errors = []\n    return errors\n")],
  'solution.py',
  { 'solution.py': "def validate(rows):\n    errors = []\n    for i, r in enumerate(rows):\n        nom = r.get('nom')\n        age = r.get('age')\n        if not isinstance(nom, str) or nom == '':\n            errors.append(f'ligne {i}: nom')\n        if not isinstance(age, int) or isinstance(age, bool) or age < 0 or age > 120:\n            errors.append(f'ligne {i}: age')\n    errors.sort()\n    return errors\n" },
  [
    { id: 't1', name: 'age hors borne', kind: 'call-equals', export: 'validate', args: [[{ nom: 'Ada', age: 200 }]], expected: ['ligne 0: age'] },
    { id: 't2', name: 'nom vide + age ok', kind: 'call-equals', export: 'validate', args: [[{ nom: '', age: 30 }]], expected: ['ligne 0: nom'] },
    { id: 't3', name: 'toutes valides', kind: 'call-equals', export: 'validate', args: [[{ nom: 'Bob', age: 40 }]], expected: [] },
    { id: 't4', name: 'double erreur (privé)', kind: 'call-equals', export: 'validate', args: [[{ nom: '', age: -1 }]], expected: ['ligne 0: age', 'ligne 0: nom'], private: true },
  ]));

// 6 — dedup latest (D4)
EX.push(py('py-data-dedup-latest', 4,
  'Python/Data : dédupliquer en gardant le plus récent',
  "Une liste d'événements {id, ts, val}. Garde, par id, l'événement au ts le plus grand. Renvoie [id, val] triés par id. En cas d'égalité de ts, garde le dernier rencontré.",
  ['python', 'data'],
  [F('solution.py', "def dedup_latest(events):\n    # TODO : par id, garder le val du ts max (dernier gagnant si égalité), trier par id\n    return []\n")],
  'solution.py',
  { 'solution.py': "def dedup_latest(events):\n    best = {}\n    for e in events:\n        cur = best.get(e['id'])\n        if cur is None or e['ts'] >= cur[0]:\n            best[e['id']] = (e['ts'], e['val'])\n    out = [[k, v[1]] for k, v in best.items()]\n    out.sort(key=lambda x: x[0])\n    return out\n" },
  [
    { id: 't1', name: 'garde le plus récent', kind: 'call-equals', export: 'dedup_latest', args: [[{ id: 1, ts: 1, val: 'a' }, { id: 1, ts: 2, val: 'b' }]], expected: [[1, 'b']] },
    { id: 't2', name: 'deux ids', kind: 'call-equals', export: 'dedup_latest', args: [[{ id: 2, ts: 5, val: 'x' }, { id: 1, ts: 9, val: 'y' }]], expected: [[1, 'y'], [2, 'x']] },
    { id: 't3', name: 'égalité ts → dernier (privé)', kind: 'call-equals', export: 'dedup_latest', args: [[{ id: 1, ts: 3, val: 'old' }, { id: 1, ts: 3, val: 'new' }]], expected: [[1, 'new']], private: true },
  ]));

// 7 — ETL idempotent (D5, decision)
EX.push(py('py-data-etl-upsert-idempotent', 5,
  'Python/Data : chargement idempotent (upsert)',
  "Charge DEUX FOIS le même lot dans un store (dict par clé). Un run répété ne doit PAS dupliquer : implémente run(store, batch) par UPSERT (clé « id »). Renvoie la taille finale du store après deux chargements du même batch — elle doit égaler le nombre d'id distincts, pas le double.",
  ['python', 'data'],
  [F('store.py', "def new_store():\n    return {}\n", true),
   F('solution.py', "from store import new_store\n\ndef load_twice(batch):\n    store = new_store()\n    run(store, batch)\n    run(store, batch)   # relance : ne doit rien dupliquer\n    return len(store)\n\ndef run(store, batch):\n    # TODO : upsert par 'id' (insère ou met à jour) — pas d'append aveugle\n    for row in batch:\n        pass\n")],
  'solution.py',
  { 'solution.py': "from store import new_store\n\ndef load_twice(batch):\n    store = new_store()\n    run(store, batch)\n    run(store, batch)\n    return len(store)\n\ndef run(store, batch):\n    for row in batch:\n        store[row['id']] = row\n" },
  [
    { id: 't1', name: '3 id distincts → 3', kind: 'call-equals', export: 'load_twice', args: [[{ id: 1, v: 'a' }, { id: 2, v: 'b' }, { id: 3, v: 'c' }]], expected: 3 },
    { id: 't2', name: 'doublon dans le batch → 2', kind: 'call-equals', export: 'load_twice', args: [[{ id: 1, v: 'a' }, { id: 1, v: 'a2' }, { id: 2, v: 'b' }]], expected: 2 },
    { id: 't3', name: 'batch vide → 0 (privé)', kind: 'call-equals', export: 'load_twice', args: [[]], expected: 0, private: true },
  ]));

// 8 — diagnose aggregation bug (D4, diagnostic)
EX.push(py('py-data-diagnose-mean-none', 4,
  'Python/Data : diagnostiquer une moyenne fausse',
  "Le code calcule une moyenne mais compte les None comme 0 au dénominateur, faussant le résultat. Corrige mean() pour ignorer les None. Renvoie la moyenne ARRONDIE à l'entier le plus proche (round → int). Si aucune valeur valide, renvoie 0.",
  ['python', 'data'],
  [F('solution.py', "def mean(values):\n    # BUG : None traité comme 0 et compté au dénominateur\n    total = sum(v if v is not None else 0 for v in values)\n    return int(round(total / len(values))) if values else 0\n")],
  'solution.py',
  { 'solution.py': "def mean(values):\n    valid = [v for v in values if v is not None]\n    if not valid:\n        return 0\n    return int(round(sum(valid) / len(valid)))\n" },
  [
    { id: 't1', name: '[10,None,20] → 15', kind: 'call-equals', export: 'mean', args: [[10, null, 20]], expected: 15 },
    { id: 't2', name: '[4,4] → 4', kind: 'call-equals', export: 'mean', args: [[4, 4]], expected: 4 },
    { id: 't3', name: 'que des None → 0 (privé)', kind: 'call-equals', export: 'mean', args: [[null, null]], expected: 0, private: true },
  ]));

let ok = 0;
for (const ex of EX) { await buildAndVerify(ex); ok++; console.log('✓', ex.id, `(D${ex.difficulty})`); }
console.log(`\nCP3 : ${ok}/${EX.length} exercices Python/Data vérifiés par exécution réelle.`);
