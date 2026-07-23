// days-enrich-reflection-151-167.mjs — Déploiement Y2 (Chantier C, option B), sous-batch SB3.
// Jours d'apprentissage 151-167 (hors revues 154/161, hors pilote 165). Merge PAR JOUR : `reflection` seul.
// Triplet : [1] compréhension/prédiction · [2] diagnostic/arbitrage · [3] transfert/recul.

export const ENRICH_REFLECTION_151_167 = {
  151: { reflection: [
    "Un test de maladie rare (1 sur 1000) ressort positif, avec 99 % de sensibilité et 5 % de faux positifs : pourquoi la probabilité d'être réellement malade est bien plus basse que 99 %, et quel rôle joue la rareté de la maladie ?",
    "Tu dois décider d'un traitement lourd sur la foi d'un seul test positif : pourquoi le taux de base de la maladie doit-il entrer dans ta décision, et que demandes-tu avant d'agir ?",
    "Ce raisonnement (mettre à jour une croyance avec une preuve) resservira quand un modèle sortira une « probabilité » : pourquoi un 0,8 ne veut rien dire sans connaître la fréquence de base du phénomène ?",
  ] },
  152: { reflection: [
    "Ton échantillon ne contient que les clients qui ont répondu à un sondage : quel biais introduis-tu, et pourquoi un modèle appris dessus se trompera sur les clients silencieux ?",
    "Tu constates qu'une catégorie est très sous-représentée dans tes données : quelles corrections envisages-tu, et laquelle risque d'introduire un nouveau biais ?",
    "Un modèle est excellent en test mais échoue en production : en quoi un biais à la COLLECTE des données peut en être la cause, alors que toutes tes métriques semblaient bonnes ?",
  ] },
  153: { reflection: [
    "Tu présentes cinq conclusions sans mentionner aucune limite : pourquoi une conclusion sans limite est-elle suspecte, et qu'en déduit un lecteur averti sur ta rigueur ?",
    "L'une de tes cinq questions n'est finalement pas répondable avec tes données : tu la retires, la reformules ou la signales ? Quel choix, et pourquoi l'honnêteté prime sur l'exhaustivité ?",
    "Le format « question → graphique → conclusion + limite » est celui d'un rapport professionnel : qu'est-ce qu'il t'oblige à faire qu'une exploration libre sans structure laisserait passer ?",
  ] },
  155: { reflection: [
    "`fit` puis `predict` puis `score` : que fait chacun, et pourquoi appeler `score` sur les données d'ENTRAÎNEMENT donne-t-il une image trompeuse de la qualité du modèle ?",
    "Tu obtiens 0,95 dès le premier essai : pourquoi te méfies-tu plutôt que de te réjouir, et quelles vérifications fais-tu avant d'y croire ?",
    "Le triptyque `fit`/`predict`/`score` est identique pour presque tous les modèles de scikit-learn : qu'est-ce que cette API uniforme te permet quand tu veux comparer deux algorithmes différents ?",
  ] },
  156: { reflection: [
    "Un coefficient de ta régression vaut +3000 pour la variable « surface » : qu'est-ce que ça signifie concrètement sur le prix prédit, et pourquoi l'unité de la variable change complètement la lecture ?",
    "Un coefficient est énorme sur une variable dont tu doutes de la fiabilité : pourquoi ne conclus-tu pas trop vite à un lien fort, et que vérifies-tu (échelle, corrélations entre variables) ?",
    "La régression linéaire suppose une relation à peu près linéaire : sur quel type de données cette hypothèse casse-t-elle, et à quel signe (forme du nuage de points, résidus) le repères-tu ?",
  ] },
  157: { reflection: [
    "Tu normalises tout ton dataset AVANT de le séparer en train/test : pourquoi est-ce une fuite d'information, et qu'est-ce que ton score de test surestime alors ?",
    "Ton modèle ne bat que de peu une baseline « prédire la moyenne » : pourquoi ce petit écart est-il plus informatif qu'un score brut de 0,85 annoncé sans baseline ?",
    "Une colonne contient indirectement la réponse (un identifiant corrélé à la cible) : pourquoi le modèle « triche » sans que rien ne plante, et comment traques-tu ce type de fuite ?",
  ] },
  158: { reflection: [
    "Sur un même modèle, la RMSE est nettement plus grande que la MAE : qu'est-ce que cet écart révèle sur la présence de quelques très grosses erreurs ?",
    "Pour un problème où les grosses erreurs coûtent très cher, tu choisis entre MAE et RMSE : laquelle privilégies-tu, et pourquoi elle « punit » ce que tu veux éviter ?",
    "Un R² proche de 0 : que signifie-t-il exactement par rapport à une prédiction naïve par la moyenne, et pourquoi un R² élevé ne suffit pas à déclarer un bon modèle ?",
  ] },
  159: { reflection: [
    "La régression logistique sort une PROBABILITÉ, pas directement une classe : comment passe-t-on de 0,73 à une décision oui/non, et qu'est-ce que le choix du seuil change ?",
    "Tu abaisses le seuil de décision de 0,5 à 0,3 : dans quel sens bougent les faux positifs et les faux négatifs, et dans quel contexte métier ce déplacement est-il justifié ?",
    "Deux modèles ont le même taux de bonnes réponses mais des matrices de confusion différentes : pourquoi peuvent-ils mener à des décisions métier très différentes selon le TYPE d'erreurs commises ?",
  ] },
  160: { reflection: [
    "Ton rapport commence par « régression logistique, régularisation C=1.0 » : pourquoi un décideur non technique décroche-t-il, et par quoi devrais-tu ouvrir à la place ?",
    "Ton modèle fait 82 % : comment traduis-tu ce chiffre en quelque chose d'actionnable pour quelqu'un qui ne connaît rien au ML et doit prendre une décision ?",
    "Un rapport honnête énonce ce que le modèle NE sait PAS faire : pourquoi cette section « limites » renforce-t-elle ta crédibilité auprès d'un décideur plutôt que de l'affaiblir ?",
  ] },
  162: { reflection: [
    "Un modèle qui répond « non » à tout le monde atteint 99 % d'accuracy sur une maladie rare : pourquoi ce chiffre est-il un piège, et quelle métrique révèle immédiatement que le modèle est inutile ?",
    "Détecter une fraude (rare, très coûteuse à rater) vs filtrer du spam (un faux positif est juste agaçant) : privilégies-tu le rappel ou la précision dans chaque cas, et pourquoi ?",
    "Le bon choix de métrique dépend du COÛT métier des erreurs : pourquoi ne peux-tu pas prendre le F1 « par défaut » sans savoir ce que coûtent respectivement un faux positif et un faux négatif ?",
  ] },
  163: { reflection: [
    "Un arbre sans limite de profondeur atteint 100 % sur les données d'entraînement : pourquoi est-ce un mauvais signe et non une réussite, et que fera-t-il sur des données neuves ?",
    "Tu vois qu'une feuille de l'arbre ne repose que sur deux exemples : pourquoi cette règle est-elle fragile, et quel réglage (profondeur, taille minimale de feuille) la corrige ?",
    "Un arbre est très lisible : on peut suivre chaque décision. Dans quel contexte cette interprétabilité vaut-elle plus qu'un léger gain de performance offert par un modèle opaque ?",
  ] },
  164: { reflection: [
    "Une décision d'arbre unique est instable (elle change beaucoup selon l'échantillon) : pourquoi moyenner beaucoup d'arbres entraînés différemment réduit-il cette instabilité ?",
    "La « feature importance » de ta forêt place une variable en tête : pourquoi ne conclus-tu pas trop vite qu'elle est LA cause, et quelle confusion (corrélation, fuite) surveilles-tu ?",
    "La forêt bat l'arbre unique mais perd sa lisibilité : dans quel cas ce compromis performance/interprétabilité est-il acceptable, et dans quel cas est-il rédhibitoire ?",
  ] },
  166: { reflection: [
    "Ton modèle fait 0,98 en entraînement et 0,72 en validation : que t'apprend précisément cet écart sur ce que le modèle a réellement appris ?",
    "Tu peux réduire l'overfitting par plus de données, moins de complexité, ou de la régularisation : dans quel ordre les essaies-tu, et pourquoi commencer par le levier le moins coûteux ?",
    "Ton modèle est aussi excellent en validation : pourquoi restes-tu prudent, et quelle hypothèse (le jeu de validation reflète-t-il vraiment la réalité future ?) pourrait encore te tromper ?",
  ] },
  167: { reflection: [
    "Ton modèle plafonne à 82 % : pourquoi lire dix erreurs UNE PAR UNE t'apprend-il plus qu'un dixième de point d'accuracy gagné à l'aveugle, et que cherches-tu dans ces cas ratés ?",
    "Tu découvres que la plupart des erreurs touchent la même sous-population : que fais-tu de ce motif, et pourquoi est-ce plus utile qu'un réglage d'hyperparamètre au hasard ?",
    "Le réflexe « regarde les cas ratés un par un » dépasse le ML classique : sur quel autre type de système (un classifieur de texte, une réponse générée) le réutiliseras-tu ?",
  ] },
};
