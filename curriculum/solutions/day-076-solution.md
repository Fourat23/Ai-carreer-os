# Correction — Jour 76 : Modularité et API design : concevoir des interfaces propres

[← Retour au jour 76](../days/day-076.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Améliorer un découpage en visant couplage faible et cohésion forte : chaque module fait une chose (cohésion), et dépend de contrats (interfaces minimales) plutôt que d'implémentations (couplage). Cacher l'implémentation pour qu'elle puisse changer, éliminer les dépendances circulaires, et dessiner le graphe de dépendances avant/après. La preuve : changer l'implémentation d'un module ne casse aucun autre (test essayé), et le graphe est acyclique avec moins de flèches.

## ✅ Une solution simple
Découper le projet en quelques modules par responsabilité. La structure est plus claire.

## 🚀 Une solution améliorée
Faire dépendre les modules de CONTRATS minimaux (interfaces) plutôt que d'implémentations, cacher les détails internes, éliminer les dépendances circulaires, et PROUVER le couplage faible en changeant l'implémentation d'un module sans en casser d'autres. Dessiner le graphe de dépendances avant/après (moins de flèches, pas de cycle).

## ⚠️ Erreurs probables et points à vérifier
- Modules qui exposent tout (pas d'encapsulation) : les autres dépendent de détails internes, couplage fort.
- Dépendances circulaires (A→B→A) : impossible de tester/réutiliser un module isolément.
- Module fourre-tout (« utils ») à faible cohésion : dix responsabilités sans rapport.
- Sur-découper en trop de petits modules : indirection inutile ; le bon grain dépend du contexte.

## 🔍 Comment vérifier ta solution
- Le graphe de dépendances avant/après est dessiné et le couplage a diminué (moins de flèches, pas de cycle).
- Chaque module expose une interface minimale documentée.
- Le test : changer l'implémentation d'un module ne casse aucun autre (essayé sur un cas).
- Aucune dépendance circulaire ne subsiste.

## ❓ Réponses du mini-quiz
1. **Que mesurent le couplage et la cohésion, et que vise-t-on ?**
   → Le couplage mesure les dépendances entre modules (à MINIMISER) ; la cohésion mesure à quel point le contenu d'un module va ensemble (à MAXIMISER). Objectif : couplage faible, cohésion forte — des modules autonomes qui font chacun une chose.
2. **Quel est le symptôme d'un couplage fort ?**
   → Changer UNE chose oblige à toucher CINQ fichiers : un changement dans un module se propage à plusieurs autres. On le réduit en dépendant de contrats (interfaces), pas d'implémentations.
3. **Pourquoi cacher l'implémentation d'un module derrière une interface minimale ?**
   → Parce que ce qui est caché peut CHANGER librement : remplacer la lib interne, réorganiser, optimiser, sans toucher les modules qui utilisent le contrat. Le reste du système ne connaît que l'interface.
4. **Pourquoi les dépendances circulaires (A→B→A) sont-elles un problème ?**
   → Elles empêchent de comprendre, tester ou réutiliser un module isolément, et signalent une mauvaise séparation des responsabilités. On les élimine en repensant les responsabilités ou en introduisant une abstraction.

## 🎤 À savoir expliquer à l'oral
Pose les deux mesures : « couplage à minimiser, cohésion à maximiser — des modules autonomes qui font chacun une chose ». Explique le symptôme du couplage fort (« je change une chose, cinq fichiers cassent ») et la parade (dépendre de contrats, cacher l'implémentation, comme l'interface Store). Donne le test concret « changer l'implémentation ne casse rien » et mentionne les dépendances circulaires à bannir : ça montre que tu raisonnes en architecte, pas seulement en codeur.
