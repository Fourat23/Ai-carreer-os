from db import q, explain, script_then_query

def result():
    return q("SELECT a.nom FROM auteurs a LEFT JOIN livres l ON l.auteur_id=a.id WHERE l.id IS NULL ORDER BY a.nom")
