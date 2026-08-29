<!-- keep -->
# Leçon — Évaluer un modèle ML

## 🌍 Le problème d'abord
Un collègue annonce fièrement : « mon modèle de détection de fraude a 99 % d'exactitude ! ».
Impressionnant… jusqu'à ce que tu réalises que 99 % des transactions sont légitimes : un
modèle qui répond TOUJOURS « pas de fraude » atteint aussi 99 % — et ne détecte aucune fraude.
Le chiffre était juste, mais la QUESTION posée aux prédictions était la mauvaise. Évaluer un
modèle, ce n'est pas lire un score, c'est choisir la bonne mesure selon ce qu'une erreur COÛTE
vraiment. C'est la compétence ML la plus interrogée en entretien, et celle qui distingue un
profil sérieux d'un récitant de chiffres. Cette leçon t'apprend à ne plus te faire avoir par
une belle métrique.

## 🎯 Objectif
Savoir choisir et interpréter la bonne métrique selon le problème et le COÛT MÉTIER des erreurs, lire une matrice de confusion, et éviter les pièges (accuracy trompeuse, évaluation sur le train). C'est la compétence ML la plus interrogée en entretien — et celle qui distingue un profil sérieux.

## 🧠 Modèle mental
Une métrique, c'est **la question précise qu'on pose aux prédictions**. La mauvaise question donne une bonne note à un mauvais modèle. « 99 % d'accuracy » ne veut rien dire sans savoir QUELLE question elle répond et à quoi elle se compare.

## 🧩 Prérequis
Tu dois maîtriser les bases du ML — train/test split, baseline, overfitting, matrice de
confusion, précision/rappel (`/doc/lessons/machine-learning-basics`) — et avoir les réflexes
statistiques (l'intuition de Bayes, pourquoi l'accuracy ment sur les classes déséquilibrées,
`/doc/lessons/statistics-for-ml`). Cette leçon approfondit le CHOIX de la métrique selon le
coût métier ; aucune notion nouvelle de modélisation n'est requise.

## 📖 Explication complète
- **Toujours une baseline** : la prédiction naïve (moyenne, classe majoritaire). Un modèle qui ne la bat pas ne sert à rien. Une baseline à 95 % (classes déséquilibrées) recadre tout.
- **Régression** : MAE (erreur moyenne, robuste), RMSE (pénalise les grosses erreurs) — en UNITÉS réelles (euros, degrés), donc interprétables.
- **Classification** : l'**accuracy MENT** sur le déséquilibre (prédire « jamais fraude » = 99,9 %). La **matrice de confusion** détaille vrais/faux positifs/négatifs. De là :
  - **Précision** = des positifs PRÉDITS, combien sont vrais ? (coût des fausses alertes)
  - **Rappel** = des vrais positifs, combien TROUVÉS ? (coût des ratés)
  - **F1** = compromis des deux ; **AUC** = qualité sur tous les seuils.
- Le choix dépend du **coût métier** : dépistage médical → rappel (ne rater aucun malade) ; filtre anti-spam → précision (ne pas bloquer un vrai mail). Le **seuil de décision** s'ajuste selon ce coût.
- Toujours évaluer sur un **jeu de test intact** (jamais le train), idéalement par **cross-validation** (robuste au hasard d'un split).

### 🔢 Les métriques, calculées une fois pour toutes

Les noms ci-dessus ne servent à rien tant qu'on ne les a pas vus sortir de vrais nombres. Prenons 1 000 transactions, dont 10 fraudes réelles. Le modèle en signale 8 ; parmi elles, 6 sont de vraies fraudes.

|  | Fraude prédite | Légitime prédite |
|---|---|---|
| **Fraude réelle** | 6 (vrais positifs) | 4 (faux négatifs) |
| **Légitime réelle** | 2 (faux positifs) | 988 (vrais négatifs) |

- **Accuracy** = ce qu'on classe correctement, sur tout : (6 + 988) / 1000 = **99,4 %**. Le modèle qui dit toujours « légitime » obtient 99,0 %. Notre modèle, qui trouve réellement des fraudes, ne gagne que **0,4 point** : voilà pourquoi cette métrique est inutilisable ici — elle est écrasée par les 988 cas faciles.
- **Précision** = parmi ce que j'ai SIGNALÉ, quelle part était juste : 6 / (6 + 2) = **75 %**. Elle répond à la question de celui qui traite les alertes : « quand tu me déranges, as-tu raison ? » Un quart des alertes sont des fausses.
- **Rappel** = parmi ce qui EXISTAIT, quelle part ai-je trouvée : 6 / (6 + 4) = **60 %**. Elle répond à la question du responsable des pertes : « combien de fraudes passent encore ? » Quatre sur dix.
- **F1** = 2 × (0,75 × 0,60) / (0,75 + 0,60) = **0,67**. C'est une moyenne *harmonique*, et ce détail a un sens : contrairement à la moyenne ordinaire, elle est tirée vers le bas par la plus faible des deux. Un modèle à 100 % de précision et 1 % de rappel obtient une moyenne ordinaire de 50,5 % — flatteuse et fausse — et un F1 de 0,02. **Le F1 refuse qu'on compense un effondrement par un excellent score ailleurs.**
- **AUC** ne se lit pas sur cette table, parce qu'elle ne dépend d'aucun seuil. Son interprétation, rarement donnée et pourtant simple : c'est la probabilité que le modèle attribue un score plus élevé à une fraude tirée au hasard qu'à une transaction légitime tirée au hasard. 0,5 = pile ou face ; 1,0 = séparation parfaite. Elle mesure la capacité à ORDONNER, pas à décider — utile pour comparer deux modèles, inutile pour choisir où placer la barre.

**Le lien qui rend tout cela opératoire** : ces quatre nombres décrivent le MÊME modèle à un seuil donné. Abaisser le seuil signale plus de transactions : le rappel monte, la précision descend. Il n'existe aucun réglage qui améliore les deux — c'est un arbitrage, pas un problème d'optimisation. Ce que tu choisis, c'est le coût que tu préfères payer.

## 🔧 Exemple simple
Détecteur de fraude : 1 % de fraudes. Un modèle qui prédit toujours « pas de fraude » a 99 % d'accuracy et 0 % de rappel — inutile. La matrice de confusion le révèle immédiatement.

## 🧭 Exemple guidé

Un dépistage. Maladie présente chez **1 % de la population**, 100 000 personnes testées —
donc 1 000 malades et 99 000 personnes saines. Le modèle annonce **99 % de justesse**.
Faut-il le déployer ?

**Décision 1 — d'abord, à quoi se compare ce 99 % ?** Construis le modèle qui ne fait rien :
il répond « sain » à tout le monde, sans regarder les données.

```
Modèle "toujours sain"
  malades détectés : 0 sur 1 000
  justesse (accuracy) = 0,990
```

**Il obtient 99 % lui aussi.** Le chiffre annoncé ne prouvait donc rien du tout : sur des
classes déséquilibrées, la justesse récompense la classe majoritaire, et ne pas chercher est
une stratégie gagnante. C'est le premier réflexe à acquérir, et il ne coûte rien :
**calcule toujours ce que fait le modèle nul avant de te réjouir d'un score.**

**Décision 2 — quelle erreur veut-on éviter, et à quel prix ?** Il y a deux façons de se
tromper, et elles n'ont pas le même coût. Rater un malade (faux négatif) peut être fatal ;
alarmer une personne saine (faux positif) coûte un examen de contrôle et de l'angoisse. Le
raisonnement classique est donc « privilégier le rappel ». Regardons ce que cela donne
vraiment en abaissant le seuil de décision :

| réglage | rappel | malades ratés | faux positifs | justesse | **précision** |
|---|---|---|---|---|---|
| seuil haut | 50 % | 500 | 990 | 0,985 | **33,6 %** |
| seuil bas | 95 % | 50 | 9 900 | 0,900 | **8,8 %** |
| seuil très bas | 99 % | 10 | 49 500 | 0,505 | **2,0 %** |

Lis la ligne du milieu, celle que la règle « privilégier le rappel » recommande. Elle rate
50 malades au lieu de 500 : c'est un vrai progrès, et c'est ce qu'on voulait. Mais elle
convoque **10 850 personnes pour en trouver 950**. Autrement dit : **une personne déclarée
positive n'a que 8,8 % de risque d'être malade** — plus de neuf sur dix des personnes
alarmées ne sont pas malades.

Ce n'est pas un argument contre le choix ; c'est le prix du choix, et le connaître change la
conversation. La question à poser au médecin ou au responsable produit n'est pas « quelle
métrique optimiser ? » — question technique dont il n'a que faire — mais : *« avez-vous la
capacité de faire 10 850 examens de contrôle, et acceptez-vous d'inquiéter 9 900 personnes
pour en sauver 450 de plus ? »* Formulée ainsi, la décision revient à qui elle appartient.
Remarque aussi que la justesse **baisse** quand le modèle devient plus utile : c'est la
preuve définitive qu'elle ne mesurait pas la bonne chose.

**Décision 3 — la précision n'est pas une propriété du modèle.** Voici le point que la
plupart des cours omettent, et qui est le plus important de la leçon. Prends **exactement le
même test**, sensibilité 95 % et spécificité 90 %, mais applique-le à une population où la
maladie touche 20 % des gens — par exemple des patients déjà orientés par un médecin, au
lieu d'un dépistage de masse.

```
prévalence  1 %  →  précision =  8,8 %
prévalence 20 %  →  précision = 70,4 %
```

Le test n'a pas changé d'un iota. Sensibilité et spécificité sont identiques. Seule la
population a changé, et la valeur pratique du résultat positif passe de « presque toujours
une fausse alerte » à « probablement vrai ». **La précision dépend de la prévalence ; le
rappel et la spécificité n'en dépendent pas.** C'est pour cette raison qu'un modèle
excellent en laboratoire devient inutilisable en production quand la fréquence réelle de
l'événement est plus faible que dans le jeu de test — et c'est l'explication la plus fréquente
du « ça marchait très bien chez nous ».

**La règle de méthode.** Ne demande jamais « quelle est la meilleure métrique ». Demande :
*quelles sont mes deux erreurs, combien coûte chacune, et à quelle fréquence l'événement
arrive-t-il réellement ?* Les trois réponses déterminent la métrique et le seuil ; l'ordre
inverse ne fonctionne pas. Et présente toujours la matrice de confusion en **effectifs**,
pas en pourcentages : « 9 900 faux positifs » se discute, « 90 % de spécificité » endort.

**Variante qui déplace le problème.** Un filtre anti-spam. L'asymétrie s'inverse : laisser
passer un spam est une nuisance, classer en spam un devis client est une perte sèche. On
privilégie donc la précision, quitte à laisser passer du courrier indésirable. Même
raisonnement, conclusion opposée — ce qui montre bien que « rappel d'abord » n'était pas une
règle du domaine, mais la conséquence d'un coût. Le cas vraiment intéressant est celui où
les deux erreurs coûtent cher : c'est là qu'on cesse de bouger un seuil et qu'on introduit
une **troisième sortie**, « incertain, à faire vérifier par un humain » — souvent la seule
réponse honnête, et elle n'apparaît sur aucune courbe.

## 🤖 Exemple appliqué (IA / data / architecture)
C'est le socle de l'évaluation des systèmes LLM/RAG (mois 9) : le rappel@k du retrieval est un RAPPEL classique ; choisir « fidélité » comme métrique clé d'un RAG, c'est choisir selon le coût d'erreur (une réponse inventée est pire qu'une réponse prudente). Même raisonnement, autre objet.

## ⚠️ Erreurs fréquentes
- Rapporter l'accuracy sur des classes déséquilibrées.
- Évaluer sur le train (score illusoire).
- Ignorer le coût métier des erreurs.
- Un seul split (chanceux) au lieu de cross-validation.

## 🚫 Anti-patterns
- Optimiser une métrique en aveugle sans regarder les erreurs réelles.
- Choisir la métrique après coup pour flatter le modèle.

## ✍️ Mini-exercice
Sur un dataset déséquilibré, calcule accuracy, précision, rappel et F1, et explique laquelle est trompeuse et pourquoi.

## 🔥 Exercice plus difficile
Trace la matrice de confusion, fais varier le seuil de décision, et montre l'arbitrage précision/rappel. Choisis un seuil justifié par un coût métier que tu définis.

## ✅ Correction attendue
La logique : baseline → métrique choisie selon le coût d'erreur → matrice de confusion → seuil ajusté → évaluation sur test/cross-validation.

**L'erreur probable, et elle inverse l'ordre de tout le raisonnement.** Presque tout le monde fait varier le seuil, trace la courbe, puis choisit le point où le F1 est maximal — et le justifie après coup par un coût métier inventé pour l'occasion. C'est l'anti-pattern que la leçon nomme (« choisir la métrique après coup pour flatter le modèle »), et il est difficile à repérer chez soi parce que la démarche *ressemble* à une optimisation rigoureuse.

Le F1 maximal ne répond à aucune question métier : il suppose que rater une fraude et déranger un client pour rien coûtent la même chose. Or ils ne coûtent presque jamais la même chose. **Le coût s'écrit AVANT de regarder les courbes** : « un faux négatif nous coûte 400 € de fraude, un faux positif 5 € de traitement manuel ». À partir de là, le seuil se calcule au lieu de se choisir — et le résultat tombe très souvent loin du F1 optimal.

**Alternative défendable** : ne pas fixer de seuil du tout et livrer un score continu, à charge pour l'équipe métier de trier par risque décroissant avec la capacité de traitement dont elle dispose ce jour-là. C'est souvent supérieur en fraude et en dépistage : la contrainte réelle n'est pas « où est la bonne barre » mais « combien de dossiers pouvons-nous examiner aujourd'hui ». Le modèle ordonne, l'humain décide où il s'arrête.

**Vérifie seul, sans corrigé** :
1. Écris ta baseline en chiffres avant tout modèle. Si ton modèle ne la bat pas, il n'a rien appris — c'est le seul verdict qui compte en premier.
2. Écris le coût des deux types d'erreur **avant** de tracer quoi que ce soit. Si tu n'y arrives pas, va poser la question ; c'est une information métier, pas une décision technique.
3. Regarde dix erreurs réelles, une par une. Les chiffres agrégés ne disent jamais QUE le modèle rate systématiquement les fraudes de petit montant, ou celles du week-end.
4. Épreuve décisive : recalcule tes métriques sur le jeu d'entraînement. Si les scores sont nettement meilleurs qu'en test, tu mesurais de la mémorisation.

## 🎤 Questions d'entretien
- « Ton modèle fait 99 % d'accuracy, content ? » → Pas sans baseline ni équilibre des classes ; regarder précision/rappel selon le coût.
- « Précision ou rappel pour un dépistage médical ? » → Rappel (ne rater aucun malade).
- « Pourquoi la cross-validation ? » → Évaluation robuste au hasard d'un seul split.

## 🧾 À retenir
- Toujours une baseline ; l'accuracy ment sur le déséquilibre.
- Précision vs rappel = arbitrer le coût des erreurs (faux positifs vs faux négatifs).
- Évaluer sur test intact / cross-validation ; regarder les erreurs réelles.

## 📚 Vocabulaire
**baseline** · **matrice de confusion** · **précision / rappel / F1 / AUC** · **MAE / RMSE** · **seuil de décision** · **cross-validation** · **coût métier** · **déséquilibre de classes**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je choisis une métrique selon le coût métier et je la justifie.
- [ ] Je lis une matrice de confusion et j'ajuste un seuil.
- [ ] Je n'évalue jamais sur le train et j'utilise la cross-validation.

## 🔗 Liens avec le programme
Mois 6 (jours ~155-180), projet 5 (ChurnScope) ; mois 9 (éval RAG). Leçons liées : `machine-learning-basics`, `feature-engineering`, `ai-evaluation`.
