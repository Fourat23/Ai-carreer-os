from db import q, explain, script_then_query

def result():
    return q("SELECT l.titre, a.nom FROM livres l JOIN auteurs a ON a.id=l.auteur_id ORDER BY l.titre")
