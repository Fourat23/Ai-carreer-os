# Correction — Jour 333 : DocSense : couverture de tests

[← Retour au jour 333](../days/day-333.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : viser un haut pourcentage de couverture. Solution améliorée : cibler les CHEMINS CRITIQUES (retrieval, génération citée, refus, workflow, gestion d'erreur — ceux dont la régression détruit la valeur), tester le cœur en isolation avec des mocks LLM, viser une couverture raisonnable pas maximale, et intégrer à la CI (filet de refactoring). La question directrice : « si ce test manquait, quelle régression passerait ? » — le pourcentage est un indicateur, pas un objectif.

## ⚠️ Erreurs probables et points à vérifier
- Viser 100% de couverture : fausse sécurité (trivial testé, logique complexe manquée) + coût de maintenance — cibler les chemins critiques.
- Tester des getters/setters triviaux pour le chiffre : du temps perdu qui gonfle le pourcentage sans protéger la valeur.
- Tests fragiles couplés à l'implémentation : ils cassent à chaque refactoring — tester le comportement, pas les détails.
- Ne pas intégrer les tests à la CI : un test non exécuté automatiquement ne protège pas — le filet doit tourner à chaque commit.

## 🔍 Comment vérifier ta solution
- Les chemins critiques (retrieval, génération citée, refus, workflow, erreur) sont testés.
- Le cœur est testé en isolation avec des mocks LLM.
- La couverture est raisonnable (cœur), pas une course au 100%.
- Les tests sont intégrés à la CI (filet de refactoring).
- Chaque test critique protège une régression nommable (variante).

## 🎤 À savoir expliquer à l'oral
Défends « chemins critiques, pas 100% » : « viser 100% donne une fausse sécurité — on teste des getters triviaux pendant que la logique complexe reste sous-testée ; je teste ce dont la régression détruirait la valeur (retrieval, refus, génération citée), avec la question : si ce test manquait, quelle régression passerait ? ». Savoir où mettre l'effort de test est un jugement d'ingénieur que la course au pourcentage ne montre pas.
