from db import _conn

def plan_uses_index():
    c = _conn()
    try:
        c.executescript("CREATE INDEX idx_service ON emp(service);")
        plan = c.execute("EXPLAIN QUERY PLAN SELECT nom FROM emp WHERE service='tech'").fetchall()
        text = ' '.join(str(r[-1]) for r in plan)
        return 'SEARCH' in text
    finally:
        c.close()
