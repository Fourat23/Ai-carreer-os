from db import q, explain, script_then_query

def result():
    return q("SELECT nom, salaire FROM emp WHERE service='tech' AND salaire>=200 ORDER BY nom")
