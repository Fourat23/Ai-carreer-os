"""
V70 — vérification exécutée des chiffres publiés dans
curriculum/lessons/data-cleaning-quality.md (exemple guidé).

Un jeu de 1 000 inscriptions volontairement sale, six défauts injectés.
On mesure ce que chaque contrôle attrape, et surtout ce que la moyenne
devient selon la façon dont on traite les valeurs manquantes.

pandas et numpy sont installés HORS du projet :
  pip install --target /tmp/py pandas numpy
  PYTHONPATH=/tmp/py python3 scripts/v70-verifications/nettoyage-donnees.py
"""
import numpy as np
import pandas as pd

rng = np.random.default_rng(70)
N = 1000

age = rng.normal(38, 10, N).round().astype(float)
df = pd.DataFrame({
    "id": range(1, N + 1),
    "email": [f"user{i}@exemple.fr" for i in range(N)],
    "age": age,
    "ville": rng.choice(["Lyon", "Paris", "Nantes"], N),
    "montant": rng.gamma(2, 40, N).round(2),
    "inscrit_le": pd.to_datetime("2026-01-01") + pd.to_timedelta(rng.integers(0, 200, N), unit="D"),
})

# --- six défauts injectés ---
df.loc[rng.choice(N, 80, replace=False), "age"] = np.nan          # 1. manquants
df.loc[rng.choice(N, 12, replace=False), "age"] = -1              # 2. sentinelle -1
df.loc[rng.choice(N, 5, replace=False), "age"] = 999              # 3. sentinelle 999
df.loc[rng.choice(N, 30, replace=False), "ville"] = "  lyon "     # 4. casse + espaces
doublons = df.sample(40, random_state=7)                          # 5. doublons exacts
df = pd.concat([df, doublons], ignore_index=True)
df.loc[rng.choice(len(df), 15, replace=False), "montant"] = 0     # 6. montants à zéro

print(f"Lignes reçues : {len(df)}\n")

print("=== 1. ce que chaque contrôle attrape ===")
controles = {
    "âge manquant":                 df["age"].isna().sum(),
    "âge = -1 (sentinelle)":        (df["age"] == -1).sum(),
    "âge = 999 (sentinelle)":       (df["age"] == 999).sum(),
    "âge hors [0, 120]":            (~df["age"].between(0, 120) & df["age"].notna()).sum(),
    "ville non normalisée":         (df["ville"] != df["ville"].str.strip().str.title()).sum(),
    "lignes dupliquées":            df.duplicated().sum(),
    "montant = 0":                  (df["montant"] == 0).sum(),
}
for nom, n in controles.items():
    print(f"  {nom:<30} {n:>5}  ({n / len(df):.1%})")

print("\n=== 2. l'âge moyen, selon ce qu'on fait des valeurs sales ===")
brut = df["age"]
propre = df["age"].replace([-1, 999], np.nan)
variantes = {
    "moyenne brute (sentinelles incluses)":      brut.mean(),
    "moyenne en ignorant SEULEMENT les NaN":     brut.mean(),          # identique : pandas ignore déjà les NaN
    "moyenne après fillna(0)":                   brut.fillna(0).mean(),
    "moyenne après remplacement des sentinelles":propre.mean(),
    "moyenne sur lignes complètes et plausibles":propre.dropna().mean(),
}
for nom, v in variantes.items():
    print(f"  {nom:<45} {v:6.2f} ans")

print("\n=== 3. l'effet du dédoublonnage sur une agrégation métier ===")
avant = df.groupby("ville", observed=True)["montant"].sum()
apres = df.drop_duplicates().assign(
    ville=lambda d: d["ville"].str.strip().str.title()
).groupby("ville", observed=True)["montant"].sum()
comp = pd.DataFrame({"avant": avant, "après nettoyage": apres}).fillna(0)
comp["écart"] = comp["après nettoyage"] - comp["avant"]
print(comp.round(2).to_string())
print(f"\n  total avant : {avant.sum():.2f}   après : {apres.sum():.2f}   "
      f"écart : {apres.sum() - avant.sum():+.2f} ({(apres.sum() / avant.sum() - 1):+.2%})")
