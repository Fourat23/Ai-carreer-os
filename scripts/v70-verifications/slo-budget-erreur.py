"""
V70 — vérification exécutée des chiffres publiés dans
curriculum/lessons/slo-error-budget.md, monitoring-production.md et
observability-fundamentals.md.

Arithmétique du budget d'erreur et des centiles. Aucune dépendance externe.

Exécution : python3 scripts/v70-verifications/slo-budget-erreur.py
"""
from statistics import mean

print("=== 1. ce que « x neuf » autorise réellement comme indisponibilité ===")
print(f"{'objectif':>10} {'par an':>14} {'par mois (30 j)':>18} {'par semaine':>14} {'par jour':>12}")
def fmt(minutes):
    if minutes >= 1440: return f"{minutes/1440:.1f} j"
    if minutes >= 60:   return f"{minutes/60:.1f} h"
    if minutes >= 1:    return f"{minutes:.0f} min"
    return f"{minutes*60:.0f} s"
for objectif in (0.90, 0.99, 0.995, 0.999, 0.9995, 0.9999):
    indispo = 1 - objectif
    print(f"{objectif:>9.2%} {fmt(indispo*525600):>14} {fmt(indispo*43200):>18} "
          f"{fmt(indispo*10080):>14} {fmt(indispo*1440):>12}")

print("\n=== 2. le budget d'erreur d'un mois, en requêtes ===")
REQ_MOIS = 30_000_000
for objectif in (0.99, 0.999, 0.9999):
    budget = REQ_MOIS * (1 - objectif)
    print(f"  SLO {objectif:.2%} sur {REQ_MOIS:,} requêtes → budget = {budget:,.0f} erreurs"
          .replace(",", " "))
print("\n  Un incident de 20 minutes à 12 000 requêtes/minute consomme 240 000 requêtes.")
for objectif in (0.99, 0.999, 0.9999):
    budget = REQ_MOIS * (1 - objectif)
    print(f"    SLO {objectif:.2%} → {240_000/budget:>6.0%} du budget mensuel consommé "
          f"par CE SEUL incident")

print("\n=== 3. pourquoi la moyenne ne décrit l'expérience de personne ===")
# 1000 requêtes : 950 rapides, 45 moyennes, 5 très lentes
latences = [80]*950 + [400]*45 + [9000]*5
latences.sort()
def centile(v, p):
    k = (len(v)-1) * p / 100
    f, c = int(k), min(int(k)+1, len(v)-1)
    return v[f] + (v[c]-v[f]) * (k-f)
print(f"  1000 requêtes : 950 à 80 ms, 45 à 400 ms, 5 à 9 000 ms")
print(f"    moyenne : {mean(latences):>7.0f} ms   ← ne correspond à AUCUNE requête réelle")
for p in (50, 90, 95, 99, 99.9):
    print(f"    p{p:<5} : {centile(latences, p):>7.0f} ms")
print("\n  La moyenne est 2,5 fois le p50. Une alerte réglée sur la moyenne se déclenche")
print("  quand 5 requêtes sur 1000 sont catastrophiques — et reste muette si 300 le sont")
print("  modérément.")

print("\n=== 4. l'agrégation des centiles est FAUSSE, et de combien ===")
a = [80]*900 + [5000]*100        # serveur A : 10 % de très lentes
b = [80]*1000                    # serveur B : tout va bien
a.sort(); b.sort()
ensemble = sorted(a + b)
p95a, p95b, p95vrai = centile(a,95), centile(b,95), centile(ensemble,95)
print(f"  p95 serveur A = {p95a:.0f} ms   p95 serveur B = {p95b:.0f} ms")
print(f"  moyenne des deux p95 = {(p95a+p95b)/2:.0f} ms")
print(f"  p95 RÉEL de l'ensemble = {p95vrai:.0f} ms")
print(f"  → écart : {abs((p95a+p95b)/2 - p95vrai):.0f} ms. On ne moyenne JAMAIS des centiles.")
