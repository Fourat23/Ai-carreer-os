import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

rng = np.random.default_rng(20260829)
# 100 individus, 2000 variables PUREMENT ALEATOIRES, etiquette tiree a pile ou face.
# Il n'existe AUCUN signal : le score honnete doit tourner autour de 50 %.
n, p = 100, 2000
X = rng.normal(size=(n, p))
y = rng.integers(0, 2, size=n)

# A) selection des variables AVANT la validation croisee (la faute)
sel = SelectKBest(f_classif, k=20).fit(X, y)      # regarde TOUTES les etiquettes
X_sel = sel.transform(X)
score_fuite = cross_val_score(LogisticRegression(max_iter=1000), X_sel, y,
                              cv=KFold(5, shuffle=True, random_state=0)).mean()

# B) selection A L INTERIEUR du pipeline, donc refaite a chaque pli
pipe = Pipeline([("sel", SelectKBest(f_classif, k=20)),
                 ("mod", LogisticRegression(max_iter=1000))])
score_propre = cross_val_score(pipe, X, y, cv=KFold(5, shuffle=True, random_state=0)).mean()

print(f"Donnees 100 % aleatoires, aucun signal reel. Score attendu : 0.50\n")
print(f"  A) selection faite AVANT la validation croisee : {score_fuite:.3f}")
print(f"  B) selection faite DANS le pipeline            : {score_propre:.3f}")
print(f"\n  L'ecart ({score_fuite - score_propre:+.3f}) est entierement fabrique par la fuite.")

# meme demonstration avec la normalisation
Xs = StandardScaler().fit_transform(X)   # normalise sur tout, y compris le test
print("\n(La normalisation seule, elle, ne fabrique presque rien :)")
print(f"  scaler ajuste sur tout : {cross_val_score(LogisticRegression(max_iter=1000), Xs, y, cv=KFold(5, shuffle=True, random_state=0)).mean():.3f}")
print(f"  scaler dans le pipeline: {cross_val_score(Pipeline([('s',StandardScaler()),('m',LogisticRegression(max_iter=1000))]), X, y, cv=KFold(5, shuffle=True, random_state=0)).mean():.3f}")
