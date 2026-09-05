# V71 CP3 — reproduction des chiffres de machine-learning-basics.
#
# POURQUOI CE SCRIPT EXISTE.
#
# machine-learning-basics publie quatre nombres sous le titre « Resultats
# mesures : » — 0,870 / 0,590 pour la fuite de selection, 0,520 / 0,540 pour la
# fuite de normalisation. Contrairement a toutes les autres lecons du corpus qui
# publient des mesures, elle ne cite AUCUN script. Le fichier
# scripts/v70-verifications/ml-pieges-mesures.py existe mais couvre
# scikit-learn-workflow, model-evaluation et feature-engineering, pas celle-ci.
#
# La lecture ne pouvant pas trancher seule sur des chiffres, ils ont ete
# reproduits ici sur quatre graines avant que la lecon soit notee.
#
# RESULTAT (scikit-learn 1.9.0) :
#
#   graine     A sel.av   B pipe scal.tout scal.pipe
#   0             0.780    0.590    0.550    0.570
#   1             0.880    0.390    0.510    0.470
#   42            0.820    0.470    0.550    0.550
#   20260830      0.860    0.610    0.450    0.470
#   moyenne       0.835    0.515    0.515    0.515
#   publie        0.870    0.590    0.520    0.540
#
# CONCLUSION, ET ELLE EST FAVORABLE A LA LECON.
#
# L effet demontre est reel et robuste : selectionner les variables en regardant
# l etiquette AVANT la validation croisee fait passer un jeu SANS AUCUN SIGNAL
# de 0,52 a 0,84 en moyenne. Les quatre valeurs publiees tombent toutes dans
# l intervalle observe. Et la seconde affirmation de la lecon — que la fuite de
# normalisation, elle, ne change presque rien — est confirmee : 0,515 des deux
# cotes, l ordre entre les deux n etant que du bruit.
#
# La lecon est d ailleurs honnete sur ce point puisqu elle ecrit elle-meme :
# « Note au passage que B donne 0,59 et non 0,50 : avec 100 individus, cinq plis
# fluctuent. Un score isole, meme honnete, porte une incertitude. »
#
# Il reste donc un seul defaut, et il est de tracabilite, pas d exactitude :
# les chiffres ne renvoient a aucun script, alors que c est la convention de
# tout le reste du corpus. Classe P3, a corriger au CP7 en ajoutant la
# reference — ce script peut servir.
#
#   python3 scripts/v71/ml-fuite-selection.py

import warnings
import numpy as np

warnings.filterwarnings("ignore")

from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

GRAINES = (0, 1, 42, 20260830)
N, P = 100, 2000          # 100 individus, 2000 variables — comme la lecon
K = 20                    # on garde les 20 « meilleures »


def essai(graine):
    """Un jeu SANS AUCUN LIEN entre X et y : tout score au-dessus de 0,5 est fabrique."""
    rng = np.random.default_rng(graine)
    X = rng.normal(0, 1, (N, P))
    y = rng.integers(0, 2, N)

    # A — la selection regarde y sur TOUT le jeu, puis on valide en croise.
    X_sel = SelectKBest(f_classif, k=K).fit_transform(X, y)
    a = cross_val_score(LogisticRegression(max_iter=2000), X_sel, y, cv=5).mean()

    # B — la selection est refaite A L INTERIEUR de chaque pli.
    pipe = Pipeline([("sel", SelectKBest(f_classif, k=K)),
                     ("mod", LogisticRegression(max_iter=2000))])
    b = cross_val_score(pipe, X, y, cv=5).mean()

    # C / D — la meme comparaison, mais sur une etape qui ne regarde JAMAIS y.
    X_norm = StandardScaler().fit_transform(X)
    c = cross_val_score(LogisticRegression(max_iter=2000), X_norm, y, cv=5).mean()
    d = cross_val_score(Pipeline([("sc", StandardScaler()),
                                  ("mod", LogisticRegression(max_iter=2000))]),
                        X, y, cv=5).mean()
    return a, b, c, d


if __name__ == "__main__":
    print(f"\njeu de donnees : {N} individus, {P} variables aleatoires, etiquette a pile ou face")
    print("il n existe AUCUN lien : le score honnete ne peut etre que ~0,50\n")
    print("%-10s %9s %9s %10s %10s" % ("graine", "A sel.av", "B pipe", "scal.tout", "scal.pipe"))
    res = []
    for g in GRAINES:
        r = essai(g)
        res.append(r)
        print("%-10s %9.3f %9.3f %10.3f %10.3f" % (g, *r))
    moy = [sum(x[i] for x in res) / len(res) for i in range(4)]
    print("%-10s %9.3f %9.3f %10.3f %10.3f" % ("moyenne", *moy))
    print("%-10s %9.3f %9.3f %10.3f %10.3f" % ("publie", 0.870, 0.590, 0.520, 0.540))
    print(f"\nfuite de selection    : +{moy[0] - moy[1]:.3f} — effet massif et reproductible")
    print(f"fuite de normalisation: {moy[2] - moy[3]:+.3f} — nul, comme l affirme la lecon")
