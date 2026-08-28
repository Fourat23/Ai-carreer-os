<!-- keep -->
# Leçon — Feature engineering

## 🌍 Le problème d'abord
Tu veux prédire quels clients vont résilier. Tu as un tableau : une ligne par client, des
colonnes (âge, ancienneté, nombre d'appels au support…). Tu lances un modèle : résultat
médiocre. Réflexe du débutant : « prenons un modèle plus puissant ». Mais souvent le vrai
levier est ailleurs — dans la façon dont l'information est PRÉSENTÉE. Une date de naissance
brute ne dit rien ; la transformer en « âge » ou en « client depuis X mois » rend soudain le
signal lisible. À l'inverse, une colonne mal choisie peut contenir la réponse déguisée (la
date de résiliation pour prédire la résiliation !) et donner un modèle « parfait »… qui
s'effondre en production. Cette leçon montre pourquoi les FEATURES comptent souvent plus que
le modèle, et comment éviter le piège qui trompe le plus de débutants : la fuite de données.

## 🎯 Objectif
Comprendre pourquoi les features (variables d'entrée) comptent souvent PLUS que le choix du modèle, savoir en créer d'utiles, encoder les catégories, et éviter le leakage. C'est le levier de performance ML le plus rentable et le plus interrogé en entretien.

## 🧠 Modèle mental
Une feature, c'est **une façon de PRÉSENTER l'information au modèle pour qu'il la comprenne**. Un même fait mal présenté est invisible ; bien présenté, il devient prédictif. Le modèle n'invente pas le signal : tu le lui rends lisible.

## 🧩 Prérequis
Tu dois savoir ce qu'est un modèle supervisé et la distinction feature (variable d'entrée) /
target (ce qu'on prédit) — vue dans les bases du machine learning
(`/doc/lessons/machine-learning-basics`) — et la séparation train/test ainsi que la notion de
fuite de données (`/doc/lessons/statistics-for-ml`, `/doc/lessons/model-evaluation`), car la
plupart des erreurs de feature engineering SONT des fuites. Aucune bibliothèque particulière
n'est supposée : on raisonne sur les transformations, pas sur une API.

## 📖 Explication complète
Le feature engineering transforme des données brutes en variables prédictives :
- **Features dérivées** : d'une date → jour de semaine, mois, week-end ; de deux colonnes → un ratio métier (dépense/revenu). Chaque feature encode une HYPOTHÈSE (« le week-end influence l'achat »).
- **Encodage des catégories** : les modèles veulent des nombres. **One-hot** (une colonne 0/1 par catégorie) pour les catégories sans ordre ; **ordinal** pour celles ordonnées. Attention aux catégories à très haute cardinalité.
- **Mise à l'échelle** : normaliser/standardiser quand le modèle est sensible aux échelles (k-means, régressions régularisées).
Le piège central : le **leakage par feature** — une feature qui contient (directement ou indirectement) l'information du futur ou de la cible. Exemple : « date du dernier paiement » pour prédire le churn peut fuiter le résultat. Et toutes les transformations APPRISES (moyennes d'encodage, paramètres de normalisation) doivent être calculées sur le TRAIN uniquement, puis appliquées au test — d'où le **Pipeline** scikit-learn qui l'automatise.

**Le leakage se reconnaît à un symptôme, et il faut le connaître par cœur** : un score anormalement bon. Un modèle à 0,99 d'AUC sur un problème réputé difficile n'est pas une réussite, c'est une alerte. Le réflexe correct n'est jamais de célébrer mais de demander « qu'est-ce que ce modèle sait qu'il ne devrait pas savoir ? ».

Il prend trois formes, et la troisième est la plus difficile à voir.
1. **La cible déguisée.** `montant_remboursement` pour prédire la fraude : la colonne n'existe QUE parce que la fraude a été constatée. En production, au moment où l'on doit décider, elle est vide. Test simple et infaillible : *cette colonne est-elle remplie à l'instant où je dois prédire ?* Si elle se remplit après, elle est interdite.
2. **La fuite par prétraitement.** Normaliser, imputer ou encoder par fréquence sur l'ensemble du jeu avant de séparer : les statistiques du test entrent dans l'entraînement. C'est ce que le `Pipeline` empêche par construction — il apprend au `fit`, applique au `transform`, et ne peut donc pas regarder le test.
3. **La fuite temporelle**, la plus sournoise. Un `train_test_split` aléatoire sur des données datées met des lignes de mars dans le test et des lignes d'avril dans l'entraînement : le modèle apprend le futur pour prédire le passé. Le score est excellent, la production catastrophique. Sur toute donnée temporelle, la séparation se fait **par date**, jamais au hasard — on entraîne sur avant, on teste sur après, comme la réalité l'imposera.

Un dernier mot sur l'encodage par fréquence, mentionné en variante plus bas : il faut aussi décider ce qu'on fait d'une catégorie **jamais vue** à l'entraînement. Le jour où une nouvelle ville apparaît en production, sa fréquence est inconnue. Prévoir cette valeur par défaut fait partie de la feature, pas des détails d'implémentation.

## 🔧 Exemple simple
D'une colonne `date_achat`, créer `est_weekend` (booléen) : si l'hypothèse « on achète plus le week-end » est vraie, cette feature simple booste le modèle.

## 🧭 Exemple guidé
**Énoncé** : encoder une colonne `ville` (catégorielle) pour un modèle.
**Raisonnement** : pas d'ordre entre les villes → one-hot ; mais si trop de villes, la matrice explose.
**Solution** :
```python
df = pd.get_dummies(df, columns=["ville"])   # one-hot
# Si haute cardinalité : regrouper les villes rares en "Autre" d'abord.
```
**Explication** : one-hot évite d'imposer un faux ordre ; regrouper les rares limite l'explosion de colonnes. **Variante** : encode plutôt par la fréquence, en calculant les fréquences sur le TRAIN seulement (anti-leakage).

## 🤖 Exemple appliqué (IA / data / architecture)
En ML tabulaire (mois 6), améliorer un modèle par les features (sans changer le modèle) est souvent le gain le plus rentable. Le raisonnement « bien présenter l'information » se retrouve aussi côté LLM : structurer un prompt, c'est présenter l'information pour qu'elle soit exploitable.

## ⚠️ Erreurs fréquentes
- Features sans hypothèse (bruit).
- Leakage : une feature qui contient la réponse ou du futur.
- Encoder/normaliser sur TOUT le dataset avant le split (leakage).
- One-hot sur une catégorie à des milliers de valeurs (explosion).

## 🚫 Anti-patterns
- Empiler des features au hasard « au cas où ».
- Croire qu'un modèle plus complexe compense de mauvaises features.

## ✍️ Mini-exercice
À partir d'une colonne date, crée 3 features (jour de semaine, mois, week-end) et mesure si l'une améliore un modèle simple.

## 🔥 Exercice plus difficile
Améliore le score d'un modèle UNIQUEMENT par le feature engineering (pas le modèle), avec un journal des tentatives et de leur effet mesuré, et vérifie l'absence de leakage.

## ✅ Correction attendue
La logique : chaque feature encode une hypothèse ; encoder les catégories sans imposer d'ordre faux ; calculer les transformations apprises sur le train seulement (Pipeline). Vérifie : pas de leakage (aucune feature ne connaît la cible/le futur), gain MESURÉ par feature, transformations dans un Pipeline.

## 🎤 Questions d'entretien
- « Modèle ou features, qu'est-ce qui compte le plus ? » → Souvent les features : elles rendent le signal lisible.
- « Comment encodes-tu une variable catégorielle ? » → One-hot (sans ordre) ou ordinal (avec ordre) ; gérer la haute cardinalité.
- « Qu'est-ce que le leakage par feature ? » → Une feature qui contient l'info de la cible/du futur → score illusoire.

## 🧾 À retenir
- Les features rendent le signal lisible : elles comptent souvent plus que le modèle.
- Chaque feature encode une hypothèse ; encoder sans faux ordre.
- Transformations apprises sur le train seulement (Pipeline) — anti-leakage.

## 📚 Vocabulaire
**feature** · **feature dérivée** · **one-hot / ordinal** · **cardinalité** · **normalisation / standardisation** · **leakage** · **Pipeline** · **hypothèse prédictive**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Chaque feature que je crée a une hypothèse explicite.
- [ ] Je sais encoder les catégories et gérer la haute cardinalité.
- [ ] J'évite le leakage (transformations dans un Pipeline, sur le train).

## 🔗 Liens avec le programme
Mois 6 (jours ~155-175), projet 5 (ChurnScope). Leçons liées : `machine-learning-basics`, `model-evaluation`, `data-cleaning-quality`.
