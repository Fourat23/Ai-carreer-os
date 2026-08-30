"""
V70 — vérification exécutée des chiffres publiés dans
curriculum/lessons/chunking-strategies.md, retrieval-reranking.md et
rag-evaluation.md.

Aucun appel à un modèle : tout ce qui est mesuré ici est de l'arithmétique
et de la géométrie, c'est-à-dire exactement la partie que les cours de RAG
affirment sans jamais la calculer.

  1. découpage : combien de morceaux, combien de recouvrement payé, et
     combien de fois une phrase à cheval est coupée ;
  2. métriques de recherche : rappel@k, précision@k, MRR et nDCG sur un
     petit jeu de vérité terrain, avec deux classements différents ;
  3. l'effet d'un reclassement sur ces mêmes métriques.

numpy est installé HORS du projet :
  PYTHONPATH=/tmp/py python3 scripts/v70-verifications/rag-chunking-et-metriques.py
"""
import numpy as np

# ---------------------------------------------------------------- 1. découpage
print("=== 1. découpage d'un document de 12 000 mots ===")
DOC = 12_000
print(f"{'taille':>8} {'recouvr.':>9} {'morceaux':>9} {'mots stockés':>13} {'surcoût':>9}")
for taille in (200, 400, 800, 1600):
    for recouvrement in (0, int(taille * 0.1), int(taille * 0.25)):
        pas = taille - recouvrement
        n = max(1, -(-(DOC - recouvrement) // pas))       # division entière par excès
        stockes = n * taille
        print(f"{taille:>8} {recouvrement:>9} {n:>9} {stockes:>13} {stockes / DOC - 1:>8.0%}")

print("\n  Une phrase de 30 mots tombe à cheval sur une frontière avec la probabilité")
print("  approximative 30 / pas. Pour un pas de 200 mots : 15 %. Pour un pas de 1 600 : 1,9 %.")
for taille, rec in ((200, 0), (400, 40), (800, 200), (1600, 400)):
    pas = taille - rec
    print(f"    taille {taille:>4}, recouvrement {rec:>3} → pas {pas:>4} → "
          f"{30 / pas:>5.1%} des phrases coupées, {-(-(DOC - rec) // pas):>3} morceaux")

# ------------------------------------------------- 2. métriques de recherche
print("\n=== 2. métriques de recherche ===")
# Vérité terrain : pour la question posée, 3 documents sont pertinents.
PERTINENTS = {"d3", "d7", "d9"}

classements = {
    "recherche lexicale seule": ["d1", "d3", "d2", "d5", "d7", "d4", "d6", "d9", "d8", "d10"],
    "après reclassement":       ["d3", "d7", "d1", "d9", "d2", "d5", "d4", "d6", "d8", "d10"],
}

def rappel_at_k(classement, k):
    return len(set(classement[:k]) & PERTINENTS) / len(PERTINENTS)

def precision_at_k(classement, k):
    return len(set(classement[:k]) & PERTINENTS) / k

def mrr(classement):
    for i, d in enumerate(classement, 1):
        if d in PERTINENTS:
            return 1 / i
    return 0.0

def ndcg_at_k(classement, k):
    gains = [1 if d in PERTINENTS else 0 for d in classement[:k]]
    dcg = sum(g / np.log2(i + 1) for i, g in enumerate(gains, 1))
    ideal = sorted([1] * len(PERTINENTS) + [0] * k, reverse=True)[:k]
    idcg = sum(g / np.log2(i + 1) for i, g in enumerate(ideal, 1))
    return dcg / idcg if idcg else 0.0

print(f"{'classement':>26} {'rappel@3':>9} {'rappel@5':>9} {'rappel@10':>10} "
      f"{'préc@3':>7} {'MRR':>6} {'nDCG@5':>7}")
for nom, c in classements.items():
    print(f"{nom:>26} {rappel_at_k(c,3):>9.2f} {rappel_at_k(c,5):>9.2f} {rappel_at_k(c,10):>10.2f} "
          f"{precision_at_k(c,3):>7.2f} {mrr(c):>6.2f} {ndcg_at_k(c,5):>7.2f}")

print("\n  Le rappel@10 est IDENTIQUE (les mêmes documents sont là).")
print("  Ce que le reclassement change, c'est l'ORDRE — et donc ce que le modèle voit")
print("  réellement quand on ne lui donne que les 3 ou 5 premiers.")

# ---------------------------------------------------- 3. similarité cosinus
print("\n=== 3. pourquoi le cosinus et pas la distance euclidienne ===")
rng = np.random.default_rng(70)
base = rng.normal(size=384)
court = base / np.linalg.norm(base)
long = court * 7.0                      # même DIRECTION, norme 7 fois plus grande
autre = rng.normal(size=384); autre /= np.linalg.norm(autre)

cos = lambda a, b: float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))
euc = lambda a, b: float(np.linalg.norm(a - b))
print(f"  même sens, longueurs différentes : cosinus = {cos(court, long):.4f}   "
      f"distance euclidienne = {euc(court, long):.3f}")
print(f"  sens différent, même longueur    : cosinus = {cos(court, autre):.4f}   "
      f"distance euclidienne = {euc(court, autre):.3f}")
print("  → le cosinus ignore la longueur du vecteur ; l'euclidienne, non.")
print("    Un texte long et un texte court sur le même sujet ont des vecteurs de")
print("    normes différentes : c'est pourquoi on compare des DIRECTIONS.")
