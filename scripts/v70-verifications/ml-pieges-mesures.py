# V70 — vérification exécutée pour scikit-learn-workflow, model-evaluation et
# feature-engineering.
#
# ENVIRONNEMENT : scikit-learn 1.9.0, pandas 3.0.5, numpy 2.4.6, installés dans
# un répertoire de travail. Lancer avec PYTHONPATH pointant dessus.
#
# Question : « mon modèle fait 97 % d exactitude. » On mesure ce que ce chiffre
# vaut, et les trois façons de l obtenir sans qu il signifie quoi que ce soit.
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.dummy import DummyClassifier
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix, roc_auc_score)

GRAINE = 20260830
rng = np.random.default_rng(GRAINE)

# ── Jeu de données : détection de fraude, 3 % de fraudes ────────────────
N, P_FRAUDE = 4000, 0.03
y = (rng.random(N) < P_FRAUDE).astype(int)
# Deux variables faiblement informatives : le signal existe mais il est ténu.
X = rng.normal(0, 1, (N, 6))
X[y == 1, 0] += 0.9
X[y == 1, 1] += 0.6
print(f"jeu de données : {N} lignes, {y.sum()} fraudes ({y.mean()*100:.1f} %)")

Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=GRAINE,
                                      stratify=y)

print("\n== 1. La référence que tout le monde saute ==")
for nom, strat in [("toujours « pas fraude »", "most_frequent"),
                   ("au hasard, proportions respectées", "stratified")]:
    d = DummyClassifier(strategy=strat, random_state=GRAINE).fit(Xtr, ytr)
    p = d.predict(Xte)
    print(f"   {nom:35s} : exactitude {accuracy_score(yte, p)*100:5.2f} % · "
          f"rappel {recall_score(yte, p, zero_division=0)*100:5.1f} %")
print("   -> 97 % d exactitude est le score d un modèle qui ne prédit JAMAIS")
print("      de fraude. Annoncer 97 % sans annoncer cette référence, c est")
print("      annoncer un chiffre qui ne dit rien.")

print("\n== 2. Le vrai modèle, avec les métriques qui comptent ==")
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
pipe.fit(Xtr, ytr)
p = pipe.predict(Xte)
proba = pipe.predict_proba(Xte)[:, 1]
tn, fp, fn, tp = confusion_matrix(yte, p).ravel()
print(f"   exactitude  : {accuracy_score(yte, p)*100:5.2f} %")
print(f"   précision   : {precision_score(yte, p, zero_division=0)*100:5.1f} %"
      "   (des fraudes annoncées, combien en sont)")
print(f"   rappel      : {recall_score(yte, p, zero_division=0)*100:5.1f} %"
      "   (des fraudes réelles, combien sont trouvées)")
print(f"   F1          : {f1_score(yte, p, zero_division=0)*100:5.1f} %")
print(f"   aire ROC    : {roc_auc_score(yte, proba)*100:5.1f} %")
print(f"   matrice     : vrais négatifs {tn}, faux positifs {fp}, "
      f"faux négatifs {fn}, vrais positifs {tp}")
print("   -> LIRE CE RESULTAT TEL QUEL. Au seuil 0,5, ce modele ne predit")
print("      AUCUNE fraude : precision 0 %, rappel 0 %, zero faux positif,")
print("      zero vrai positif. Sa matrice de confusion est EXACTEMENT celle")
print("      de la reference « toujours pas fraude », et son exactitude aussi")
print("      (97,33 % dans les deux cas).")
print("   -> et pourtant il n est PAS equivalent : son aire sous la courbe ROC")
print("      est de 79,3 % contre 50 % pour le hasard. Il CLASSE correctement,")
print("      il ne DECIDE pas. Les deux capacites sont distinctes et une seule")
print("      des deux depend du seuil.")
print("   -> c est la lecon centrale : sur des classes desequilibrees,")
print("      l exactitude ne distingue pas un modele qui a tout appris d un")
print("      modele qui n a rien appris. Il faut la matrice ET une metrique")
print("      independante du seuil.")

print("\n== 3. Le seuil : une décision métier, pas un réglage par défaut ==")
print("   seuil | précision | rappel | fraudes trouvées | fausses alertes")
for seuil in [0.5, 0.2, 0.1, 0.05, 0.03]:
    pp = (proba >= seuil).astype(int)
    tn2, fp2, fn2, tp2 = confusion_matrix(yte, pp, labels=[0, 1]).ravel()
    print(f"   {seuil:5.2f} | {precision_score(yte, pp, zero_division=0)*100:8.1f} % "
          f"| {recall_score(yte, pp, zero_division=0)*100:5.1f} % "
          f"| {tp2:16d} | {fp2:15d}")
print("   -> 0,5 n est pas un choix, c est un défaut. Le bon seuil dépend du")
print("      coût d une fraude manquée face au coût d une fausse alerte, qui")
print("      sont deux quantités MÉTIER. Le modèle ne peut pas les connaître.")

print("\n== 4. La fuite de données, mesurée ==")
# ❌ Ajustement du normaliseur sur TOUT le jeu, avant la séparation.
sc_fuite = StandardScaler().fit(X)
Xf = sc_fuite.transform(X)
Xtrf, Xtef, ytrf, ytef = train_test_split(Xf, y, test_size=0.3,
                                          random_state=GRAINE, stratify=y)
m_fuite = LogisticRegression(max_iter=1000).fit(Xtrf, ytrf)
auc_fuite = roc_auc_score(ytef, m_fuite.predict_proba(Xtef)[:, 1])
auc_propre = roc_auc_score(yte, proba)
print(f"   normaliseur ajusté sur TOUT (fuite)  : aire ROC {auc_fuite*100:.2f} %")
print(f"   normaliseur dans le pipeline (propre) : aire ROC {auc_propre*100:.2f} %")
print(f"   écart : {(auc_fuite - auc_propre)*100:+.2f} point")
print("   -> ici l écart est FAIBLE, et il faut le dire. Une normalisation ne")
print("      transporte que la moyenne et l écart-type : peu d information.")
print("      La conclusion n est donc pas « la fuite est sans gravité » mais :")
print("      la gravité dépend de CE QUI fuit. Mesure suivante.")

# Fuite grave : une variable construite à partir de la cible.
X2 = np.column_stack([X, y * rng.normal(3, 1, N) + (1 - y) * rng.normal(0, 1, N)])
X2tr, X2te, y2tr, y2te = train_test_split(X2, y, test_size=0.3,
                                          random_state=GRAINE, stratify=y)
m2 = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X2tr, y2tr)
auc2 = roc_auc_score(y2te, m2.predict_proba(X2te)[:, 1])
print(f"\n   variable construite À PARTIR de la cible : aire ROC {auc2*100:.2f} %")
print(f"   écart avec le modèle propre : {(auc2 - auc_propre)*100:+.2f} points")
print("   -> voilà la fuite qui compte. Le score est excellent et le modèle")
print("      est inutilisable : en production, cette variable n existe pas")
print("      encore au moment où il faut prédire. Un score anormalement bon")
print("      est un SIGNAL D ALERTE, pas une réussite.")

print("\n== 5. Un seul découpage ne mesure rien de stable ==")
scores = []
for graine in range(20):
    a, b, c, d = train_test_split(X, y, test_size=0.3, random_state=graine,
                                  stratify=y)
    mm = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(a, c)
    scores.append(roc_auc_score(d, mm.predict_proba(b)[:, 1]))
scores = np.array(scores)
print(f"   20 découpages différents du MÊME jeu, MÊME modèle :")
print(f"   min {scores.min()*100:.2f} % · médiane {np.median(scores)*100:.2f} % "
      f"· max {scores.max()*100:.2f} % · écart {(scores.max()-scores.min())*100:.2f} pts")
cv = cross_val_score(make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
                     X, y, cv=StratifiedKFold(5, shuffle=True, random_state=GRAINE),
                     scoring='roc_auc')
print(f"   validation croisée 5 blocs : {cv.mean()*100:.2f} % ± {cv.std()*100:.2f}")
print("   -> annoncer le meilleur des 20 découpages, c est annoncer un choix de")
print("      graine aléatoire. La validation croisée donne une moyenne ET une")
print("      dispersion ; c est la dispersion qui dit si un écart entre deux")
print("      modèles est réel ou dans le bruit.")
