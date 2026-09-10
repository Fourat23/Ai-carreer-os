from db import _conn

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
