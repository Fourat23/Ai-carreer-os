"""
V70 — vérification exécutée des chiffres publiés dans
curriculum/lessons/llm-cost-optimization.md et vector-databases.md.

Aucun appel à un modèle : ce sont des calculs de coût et d'empreinte
mémoire, faits avec des tarifs et des tailles DÉCLARÉS. Les tarifs varient
dans le temps et selon le fournisseur ; ce qui est enseigné ici est la
STRUCTURE du calcul et les rapports entre les postes, pas un prix.

Exécution : python3 scripts/v70-verifications/llm-cout-et-vecteurs.py
"""

# ------------------------------------------------------------------ 1. coût
# Tarifs ILLUSTRATIFS, déclarés, en euros par million de jetons.
TARIFS = {
    "modèle A (grand)":  {"entree": 3.00, "sortie": 15.00},
    "modèle B (moyen)":  {"entree": 0.30, "sortie":  1.20},
    "modèle C (petit)":  {"entree": 0.05, "sortie":  0.40},
}
print("=== 1. un assistant de support : 40 000 requêtes par mois ===")
print("Tarifs ILLUSTRATIFS déclarés, en euros par million de jetons.\n")

REQUETES = 40_000
SCENARIOS = {
    "sans RAG, historique complet": {"entree": 6_000, "sortie": 300},
    "avec RAG, top-5 morceaux":     {"entree": 2_200, "sortie": 300},
    "top-3 + résumé d'historique":  {"entree": 1_100, "sortie": 300},
    "top-3 + réponses plus courtes":{"entree": 1_100, "sortie": 150},
}
print(f"{'scénario':>32} {'jetons in':>10} {'out':>6} " + " ".join(f"{m:>18}" for m in TARIFS))
for nom, s in SCENARIOS.items():
    couts = []
    for m, t in TARIFS.items():
        c = REQUETES * (s["entree"] * t["entree"] + s["sortie"] * t["sortie"]) / 1e6
        couts.append(f"{c:>15,.0f} €".replace(",", " "))
    print(f"{nom:>32} {s['entree']:>10} {s['sortie']:>6} " + " ".join(f"{c:>18}" for c in couts))

base = SCENARIOS["sans RAG, historique complet"]
t = TARIFS["modèle A (grand)"]
c0 = REQUETES * (base["entree"] * t["entree"] + base["sortie"] * t["sortie"]) / 1e6
fin = SCENARIOS["top-3 + réponses plus courtes"]
tp = TARIFS["modèle C (petit)"]
c1 = REQUETES * (fin["entree"] * tp["entree"] + fin["sortie"] * tp["sortie"]) / 1e6
print(f"\n  du pire au meilleur : {c0:,.0f} € → {c1:,.0f} €   soit un facteur {c0/c1:,.0f}".replace(",", " "))

print("\n  Part de la SORTIE dans le coût, modèle A, scénario avec RAG :")
s = SCENARIOS["avec RAG, top-5 morceaux"]; t = TARIFS["modèle A (grand)"]
e = s["entree"] * t["entree"]; o = s["sortie"] * t["sortie"]
print(f"    entrée {e:.0f} unités, sortie {o:.0f} unités → la sortie pèse {o/(e+o):.0%} du coût")
print("    alors qu'elle ne représente que "
      f"{s['sortie']/(s['sortie']+s['entree']):.0%} des jetons.")

# ------------------------------------------------------- 2. empreinte vecteurs
print("\n=== 2. empreinte mémoire d'un index vectoriel ===")
print(f"{'chunks':>10} {'dims':>6} {'type':>10} {'brut':>12} {'+ index ~1,5×':>15}")
for n in (10_000, 100_000, 200_000, 2_000_000):
    for dims, octets, nom in ((384, 4, "float32"), (768, 4, "float32"), (1536, 4, "float32"), (768, 1, "int8")):
        mo = n * dims * octets / 1e6
        print(f"{n:>10,} {dims:>6} {nom:>10} {mo:>10,.0f} Mo {mo*1.5:>12,.0f} Mo".replace(",", " "))
    print()

print("  Repères de décision :")
print("    < 50 Mo   → un tableau en mémoire et une recherche exacte suffisent")
print("    50–500 Mo → base vectorielle embarquée (fichier), index approximatif utile")
print("    > 500 Mo  → base vectorielle dédiée, index approximatif nécessaire")
print("\n  La quantification en int8 divise l'empreinte par 4 pour une perte de rappel")
print("  typiquement faible — c'est le premier levier avant de changer d'infrastructure.")
