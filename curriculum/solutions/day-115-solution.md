# Correction — Jour 115 : Projet 3 — Recherche et filtres

[← Retour au jour 115](../days/day-115.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : filtrer la liste selon le texte recherché. Solution améliorée : stocker uniquement les CRITÈRES en state et DÉRIVER les résultats à chaque rendu, composer les filtres comme des prédicats indépendants reliés par un ET (extensible sans toucher à l'existant), traiter le cas « aucun résultat » distinctement du cas « aucune donnée » (avec le terme et une réinitialisation), et n'ajouter un debounce que si le Profiler prouve un ralentissement. La preuve : ajouter un filtre ne demande qu'un prédicat de plus.

## ⚠️ Erreurs probables et points à vérifier
- Stocker la liste filtrée en state : seconde source de vérité à resynchroniser, désynchronisations garanties.
- Filtres entremêlés impossibles à étendre : ajouter un critère oblige à réécrire la logique — composer des prédicats indépendants.
- Confondre « aucun résultat de recherche » et « aucune donnée » : messages différents, l'un doit montrer le terme cherché et offrir de réinitialiser.
- Ajouter un debounce sans mesurer : complexité inutile sur une petite liste où le filtrage direct est instantané.

## 🔍 Comment vérifier ta solution
- Le state ne contient que les critères, pas les résultats.
- Les résultats sont dérivés des données + critères à chaque rendu.
- Les filtres sont composés en prédicats indépendants (extensibles).
- Le cas « aucun résultat » est traité explicitement avec réinitialisation.
- Le debounce n'est présent que si une mesure le justifie.

## 🎤 À savoir expliquer à l'oral
Formule le principe : « je stocke les critères, je dérive les résultats — jamais l'inverse ». Explique la composition de prédicats indépendants (`match1 && match2`) qui rend les filtres extensibles. Cite le piège du débutant (stocker la liste filtrée) et la règle du debounce (seulement si mesuré). Ajouter un filtre en une ligne est la démonstration que ta conception est saine.
