from db import q, explain, script_then_query

def result():
    return q("SELECT nom, salaire FROM emp WHERE salaire > (SELECT AVG(salaire) FROM emp) ORDER BY salaire DESC, nom")
