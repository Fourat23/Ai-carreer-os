from db import q, explain, script_then_query

def result():
    return q("SELECT service, SUM(salaire) AS t FROM emp GROUP BY service HAVING t>300 ORDER BY t DESC")
