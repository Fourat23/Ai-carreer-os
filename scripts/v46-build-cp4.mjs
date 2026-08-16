// CP4 — SQL RÉEL via sqlite3 (stdlib). Le learner écrit du vrai SQL, exécuté
// contre une base SQLite en mémoire (fixtures déterministes, détruite après).
import { buildAndVerify } from './v46-build-lib.mjs';

// Helper db.py commun : construit la base, expose q(sql) et explain(sql).
const dbPy = (schema) => `import sqlite3

def _conn():
    c = sqlite3.connect(':memory:')
    c.executescript(${JSON.stringify(schema)})
    return c

def q(sql, params=()):
    c = _conn()
    try:
        rows = c.execute(sql, params).fetchall()
        return [list(r) for r in rows]
    finally:
        c.close()

def explain(sql):
    c = _conn()
    try:
        rows = c.execute('EXPLAIN QUERY PLAN ' + sql).fetchall()
        return ' | '.join(str(r[-1]) for r in rows)
    finally:
        c.close()

def script_then_query(setup_sql, query_sql):
    c = _conn()
    try:
        c.executescript(setup_sql)
        rows = c.execute(query_sql).fetchall()
        return [list(r) for r in rows]
    finally:
        c.close()
`;

const EMP = `CREATE TABLE emp(id INTEGER PRIMARY KEY, nom TEXT, service TEXT, salaire INTEGER);
INSERT INTO emp VALUES (1,'Ada','tech',300),(2,'Bob','tech',100),(3,'Cy','rh',200),(4,'Di','rh',200),(5,'Eve','tech',400);`;
const LIB = `CREATE TABLE auteurs(id INTEGER PRIMARY KEY, nom TEXT);
CREATE TABLE livres(id INTEGER PRIMARY KEY, titre TEXT, auteur_id INTEGER);
INSERT INTO auteurs VALUES (1,'Hugo'),(2,'Zola'),(3,'Sans-Livre');
INSERT INTO livres VALUES (10,'Miserables',1),(11,'Germinal',2),(12,'Notre-Dame',1);`;
const STOCK = `CREATE TABLE vols(id INTEGER PRIMARY KEY, places INTEGER);
INSERT INTO vols VALUES (7, 1);`;

const sql = (id, difficulty, title, summary, skills, schema, starterSql, refSql, exportName, tests, helperExtra = '', extra = {}) => {
  const solStarter = `from db import q, explain, script_then_query\n\ndef ${exportName}():\n    # Écris ta requête SQL ci-dessous.\n    return q(${JSON.stringify(starterSql)})\n`;
  const solRef = `from db import q, explain, script_then_query\n\ndef ${exportName}():\n    return q(${JSON.stringify(refSql)})\n`;
  return {
    id, title, difficulty, summary, runtime: 'python3', language: 'python',
    skills, sprint: 'v46', activeFile: 'solution.py',
    workspace: { entry: 'solution.py', files: [
      { path: 'db.py', readOnly: true, content: dbPy(schema) + helperExtra },
      { path: 'solution.py', content: solStarter },
    ] },
    reference: { 'solution.py': solRef },
    tests, ...extra,
  };
};

const EX = [];

// 1 — SELECT ... WHERE (D2)
EX.push(sql('sqlite-select-where', 2, 'SQL réel : filtrer (WHERE)',
  "Écris une requête qui renvoie [nom, salaire] des employés du service 'tech' ayant un salaire >= 200, triés par nom. Base SQLite réelle.",
  ['sql', 'data'], EMP,
  "SELECT nom, salaire FROM emp",
  "SELECT nom, salaire FROM emp WHERE service='tech' AND salaire>=200 ORDER BY nom",
  'result',
  [
    { id: 't1', name: 'tech >=200', kind: 'call-equals', export: 'result', args: [], expected: [['Ada', 300], ['Eve', 400]] },
    { id: 't2', name: 'exclut Bob (100) et rh', kind: 'call-equals', export: 'result', args: [], expected: [['Ada', 300], ['Eve', 400]], private: true },
  ]));

// 2 — ORDER BY + LIMIT (D3)
EX.push(sql('sqlite-top-n', 3, 'SQL réel : top-N (ORDER BY / LIMIT)',
  "Renvoie les 2 employés les mieux payés : [nom, salaire], salaire décroissant puis nom.",
  ['sql', 'data'], EMP,
  "SELECT nom, salaire FROM emp ORDER BY salaire",
  "SELECT nom, salaire FROM emp ORDER BY salaire DESC, nom LIMIT 2",
  'result',
  [
    { id: 't1', name: 'top 2', kind: 'call-equals', export: 'result', args: [], expected: [['Eve', 400], ['Ada', 300]] },
    { id: 't2', name: 'exactement 2 lignes', kind: 'call-equals', export: 'result', args: [], expected: [['Eve', 400], ['Ada', 300]], private: true },
  ]));

// 3 — GROUP BY + HAVING (D3)
EX.push(sql('sqlite-group-having', 3, 'SQL réel : GROUP BY / HAVING',
  "Renvoie [service, total_salaire] des services dont le total dépasse 300, triés par total décroissant. WHERE filtre les lignes, HAVING filtre les groupes.",
  ['sql', 'data'], EMP,
  "SELECT service, SUM(salaire) FROM emp GROUP BY service",
  "SELECT service, SUM(salaire) AS t FROM emp GROUP BY service HAVING t>300 ORDER BY t DESC",
  'result',
  [
    { id: 't1', name: 'tech=800 et rh=400 >300', kind: 'call-equals', export: 'result', args: [], expected: [['tech', 800], ['rh', 400]] },
    { id: 't2', name: 'ordre par total décroissant (privé)', kind: 'call-equals', export: 'result', args: [], expected: [['tech', 800], ['rh', 400]], private: true },
  ]));

// 4 — INNER JOIN (D3)
EX.push(sql('sqlite-inner-join', 3, 'SQL réel : jointure (JOIN ... ON)',
  "Renvoie [titre, auteur] pour chaque livre, trié par titre. INNER JOIN entre livres et auteurs sur auteur_id.",
  ['sql', 'data'], LIB,
  "SELECT titre, nom FROM livres",
  "SELECT l.titre, a.nom FROM livres l JOIN auteurs a ON a.id=l.auteur_id ORDER BY l.titre",
  'result',
  [
    { id: 't1', name: '3 livres joints', kind: 'call-equals', export: 'result', args: [], expected: [['Germinal', 'Zola'], ['Miserables', 'Hugo'], ['Notre-Dame', 'Hugo']] },
    { id: 't2', name: 'Sans-Livre exclu (privé)', kind: 'call-equals', export: 'result', args: [], expected: [['Germinal', 'Zola'], ['Miserables', 'Hugo'], ['Notre-Dame', 'Hugo']], private: true },
  ]));

// 5 — LEFT JOIN + IS NULL (D4)
EX.push(sql('sqlite-left-join-orphans', 4, 'SQL réel : orphelins (LEFT JOIN + IS NULL)',
  "Trouve les auteurs SANS livre. Renvoie [nom] trié. Indice : LEFT JOIN livres puis filtrer les lignes où le livre est NULL. La question métier vit souvent dans les orphelins.",
  ['sql', 'data'], LIB,
  "SELECT a.nom FROM auteurs a JOIN livres l ON l.auteur_id=a.id",
  "SELECT a.nom FROM auteurs a LEFT JOIN livres l ON l.auteur_id=a.id WHERE l.id IS NULL ORDER BY a.nom",
  'result',
  [
    { id: 't1', name: 'Sans-Livre', kind: 'call-equals', export: 'result', args: [], expected: [['Sans-Livre']] },
    { id: 't2', name: 'ni Hugo ni Zola (privé)', kind: 'call-equals', export: 'result', args: [], expected: [['Sans-Livre']], private: true },
  ]));

// 6 — sous-requête (D4)
EX.push(sql('sqlite-subquery-above-avg', 4, 'SQL réel : sous-requête (au-dessus de la moyenne)',
  "Renvoie [nom, salaire] des employés dont le salaire est STRICTEMENT supérieur à la moyenne globale, triés par salaire décroissant. Utilise une sous-requête scalaire (SELECT AVG...).",
  ['sql', 'data'], EMP,
  "SELECT nom, salaire FROM emp WHERE salaire > 200",
  "SELECT nom, salaire FROM emp WHERE salaire > (SELECT AVG(salaire) FROM emp) ORDER BY salaire DESC, nom",
  'result',
  [
    { id: 't1', name: 'moyenne=240 → Ada,Eve', kind: 'call-equals', export: 'result', args: [], expected: [['Eve', 400], ['Ada', 300]] },
    { id: 't2', name: 'exclut 200 (privé)', kind: 'call-equals', export: 'result', args: [], expected: [['Eve', 400], ['Ada', 300]], private: true },
  ]));

// 7 — index + EXPLAIN QUERY PLAN (D4, diagnostic)
EX.push(sql('sqlite-index-explain', 4, 'SQL réel : index & plan d’exécution',
  "Crée un index sur emp(service) PUIS écris une requête filtrant sur service='tech'. La fonction renvoie le plan (EXPLAIN QUERY PLAN) : il doit contenir « SEARCH » (via l'index) et non « SCAN ». Diagnostic de performance réel.",
  ['sql', 'data'], EMP,
  // starter: pas d'index → SCAN
  '', '', 'plan',
  [
    { id: 't1', name: 'le plan utilise SEARCH (index)', kind: 'call-equals', export: 'plan_uses_index', args: [], expected: true },
    { id: 't2', name: 'plan non vide (privé)', kind: 'call-equals', export: 'plan_uses_index', args: [], expected: true, private: true },
  ]));
// custom solution files for the EXPLAIN exercise (needs setup + explain)
{
  const ix = EX[EX.length - 1];
  ix.workspace.files = [
    { path: 'db.py', readOnly: true, content: dbPy(EMP) },
    { path: 'solution.py', content:
`from db import _conn

def plan_uses_index():
    c = _conn()
    try:
        # TODO : crée un index sur emp(service), puis EXPLAIN QUERY PLAN de la requête filtrée.
        c.executescript("")  # <- crée l'index ici
        plan = c.execute("EXPLAIN QUERY PLAN SELECT nom FROM emp WHERE service='tech'").fetchall()
        text = ' '.join(str(r[-1]) for r in plan)
        return 'SEARCH' in text
    finally:
        c.close()
` },
  ];
  ix.reference = { 'solution.py':
`from db import _conn

def plan_uses_index():
    c = _conn()
    try:
        c.executescript("CREATE INDEX idx_service ON emp(service);")
        plan = c.execute("EXPLAIN QUERY PLAN SELECT nom FROM emp WHERE service='tech'").fetchall()
        text = ' '.join(str(r[-1]) for r in plan)
        return 'SEARCH' in text
    finally:
        c.close()
` };
}

// 8 — transaction : dernier siège (D5, décision)
EX.push((() => {
  const ex = sql('sqlite-transaction-last-seat', 5, 'SQL réel : transaction atomique (dernier siège)',
    "Réserve le dernier siège SANS surbooking. Décrémente places seulement si places>0, dans une transaction. Renvoie [places_restantes, reservation_faite(0/1)] après DEUX tentatives concurrentes simulées séquentiellement : la 2e ne doit PAS réserver (places=0).",
    ['sql', 'data'], STOCK, '', '', 'run', [
      { id: 't1', name: 'une seule réservation possible', kind: 'call-equals', export: 'two_attempts', args: [], expected: [0, 1, 0] },
      { id: 't2', name: 'places finissent à 0 (privé)', kind: 'call-equals', export: 'two_attempts', args: [], expected: [0, 1, 0], private: true },
    ]);
  ex.workspace.files = [
    { path: 'db.py', readOnly: true, content: dbPy(STOCK) },
    { path: 'solution.py', content:
`from db import _conn

# Réserve un siège si dispo. Renvoie 1 si réservé, 0 sinon.
def reserve(c):
    # TODO : dans une transaction, ne décrémenter QUE si places>0 (garde anti-surbooking)
    cur = c.execute("SELECT places FROM vols WHERE id=7").fetchone()[0]
    c.execute("UPDATE vols SET places = places - 1 WHERE id=7")   # BUG : pas de garde
    return 1

def two_attempts():
    c = _conn()
    try:
        r1 = reserve(c)
        r2 = reserve(c)
        places = c.execute("SELECT places FROM vols WHERE id=7").fetchone()[0]
        return [places, r1, r2]
    finally:
        c.close()
` },
  ];
  ex.reference = { 'solution.py':
`from db import _conn

def reserve(c):
    c.execute("BEGIN")
    cur = c.execute("SELECT places FROM vols WHERE id=7").fetchone()[0]
    if cur > 0:
        c.execute("UPDATE vols SET places = places - 1 WHERE id=7")
        c.execute("COMMIT")
        return 1
    c.execute("ROLLBACK")
    return 0

def two_attempts():
    c = _conn()
    try:
        r1 = reserve(c)
        r2 = reserve(c)
        places = c.execute("SELECT places FROM vols WHERE id=7").fetchone()[0]
        return [places, r1, r2]
    finally:
        c.close()
` };
  return ex;
})());

let ok = 0;
for (const ex of EX) { await buildAndVerify(ex); ok++; console.log('✓', ex.id, `(D${ex.difficulty})`); }
console.log(`\nCP4 : ${ok}/${EX.length} exercices SQL RÉELS (sqlite3) vérifiés par exécution.`);
