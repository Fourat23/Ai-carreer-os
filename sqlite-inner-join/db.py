import sqlite3

def _conn():
    c = sqlite3.connect(':memory:')
    c.executescript("CREATE TABLE auteurs(id INTEGER PRIMARY KEY, nom TEXT);\nCREATE TABLE livres(id INTEGER PRIMARY KEY, titre TEXT, auteur_id INTEGER);\nINSERT INTO auteurs VALUES (1,'Hugo'),(2,'Zola'),(3,'Sans-Livre');\nINSERT INTO livres VALUES (10,'Miserables',1),(11,'Germinal',2),(12,'Notre-Dame',1);")
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
