import numpy as np, pandas as pd
rng = np.random.default_rng(7)
n = 3000
villes = ["Paris"]*1200 + ["Lyon"]*600 + ["Marseille"]*400 + ["Lille"]*200
villes += [f"village-{i}" for i in range(n - len(villes))]   # longue traine
df = pd.DataFrame({"ville": villes[:n]})
df["cible"] = rng.integers(0, 2, n)          # AUCUN lien reel ville -> cible

print(f"{df.ville.nunique()} villes distinctes pour {n} lignes")
print(f"   les 4 plus frequentes couvrent {df.ville.value_counts().head(4).sum()/n:.0%} des lignes")
print(f"   {(df.ville.value_counts()==1).sum()} villes n'apparaissent qu'UNE fois\n")

print("A) one-hot brut :", pd.get_dummies(df[['ville']]).shape[1], "colonnes")
top = df.ville.value_counts().head(4).index
df["ville_g"] = df.ville.where(df.ville.isin(top), "Autre")
print("B) regroupement des rares puis one-hot :", pd.get_dummies(df[['ville_g']]).shape[1], "colonnes\n")

# C) encodage par la cible, calcule sur TOUT le jeu (la faute)
from sklearn.model_selection import cross_val_score, KFold
from sklearn.linear_model import LogisticRegression
moy = df.groupby("ville")["cible"].mean()
X_fuite = df.ville.map(moy).to_frame()
cv = KFold(5, shuffle=True, random_state=0)
s1 = cross_val_score(LogisticRegression(), X_fuite, df.cible, cv=cv).mean()

# D) encodage par la frequence (n utilise pas la cible)
X_freq = df.ville.map(df.ville.value_counts()).to_frame()
s2 = cross_val_score(LogisticRegression(), X_freq, df.cible, cv=cv).mean()

print("Il n'existe AUCUN lien entre la ville et la cible. Score honnete attendu : 0.50")
print(f"   C) encodage par la cible calcule sur tout le jeu : {s1:.3f}")
print(f"   D) encodage par la frequence                     : {s2:.3f}")
print(f"\n   Pour les {(df.ville.value_counts()==1).sum()} villes vues une seule fois, l'encodage par la cible")
print("   recopie litteralement l'etiquette de la ligne dans une colonne.")
