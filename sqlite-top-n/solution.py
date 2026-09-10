from db import q, explain, script_then_query

def result():
    return q("SELECT nom, salaire FROM emp ORDER BY salaire DESC, nom LIMIT 2")
