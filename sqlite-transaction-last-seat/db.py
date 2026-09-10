import sqlite3

def _conn():
    c = sqlite3.connect(':memory:')
    c.executescript("CREATE TABLE vols(id INTEGER PRIMARY KEY, places INTEGER);\nINSERT INTO vols VALUES (7, 1);")
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
