import numpy as np
rng = np.random.default_rng(20260829)
# 10 000 requetes : 95 % rapides, 5 % en timeout
lat = np.concatenate([rng.normal(80, 10, 9500), rng.normal(900, 60, 500)])
lat = np.clip(lat, 1, None)
print("Latence d'API — 10 000 requetes")
for nom, v in [("moyenne", lat.mean()), ("mediane (p50)", np.percentile(lat, 50)),
               ("p95", np.percentile(lat, 95)), ("p99", np.percentile(lat, 99)),
               ("max", lat.max())]:
    print(f"   {nom:<14} {v:7.0f} ms")
print(f"   -> {(lat > 500).mean():.1%} des requetes depassent 500 ms, mais la moyenne dit {lat.mean():.0f} ms")

print("\nCombien d'utilisateurs voient au moins une lenteur ?")
for n in [1, 5, 10, 20, 50]:
    p = 1 - (1 - 0.05) ** n
    print(f"   sur {n:2} requetes dans une session : {p:.1%}")

print("\n--- Paradoxe de Simpson : taux de succes de deux modeles ---")
# modele A et B sur deux types de requetes
donnees = {
    "requetes faciles": {"A": (81, 87), "B": (234, 270)},   # (succes, total)
    "requetes dures":   {"A": (192, 263), "B": (55, 80)},
}
tot = {"A": [0, 0], "B": [0, 0]}
for cat, d in donnees.items():
    print(f"  {cat}")
    for m, (s, t) in d.items():
        print(f"     modele {m} : {s}/{t} = {s/t:.1%}")
        tot[m][0] += s; tot[m][1] += t
print("  TOTAL")
for m, (s, t) in tot.items():
    print(f"     modele {m} : {s}/{t} = {s/t:.1%}")
