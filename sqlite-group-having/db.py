import sqlite3

def _conn():
    c = sqlite3.connect(':memory:')
    c.executescript("CREATE TABLE emp(id INTEGER PRIMARY KEY, nom TEXT, service TEXT, salaire INTEGER);\nINSERT INTO emp VALUES (1,'Ada','tech',300),(2,'Bob','tech',100),(3,'Cy','rh',200),(4,'Di','rh',200),(5,'Eve','tech',400);")
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
