# Semaine 5 — Récursion approfondie, hash maps, complexité appliquée

> **Mois 2** · Compétences : Algorithmie, Structures de données

[← Mois 2](month-02.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 29](days/day-029.md)
- [Jour 30](days/day-030.md)
- [Jour 31](days/day-031.md)
- [Jour 32](days/day-032.md)
- [Jour 33](days/day-033.md)
- [Jour 34](days/day-034.md)
- [Jour 35](days/day-035.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** La récursion devient un outil, plus une curiosité. Les hash maps deviennent ton réflexe pour 'compter' et 'regrouper'.
- **Test pratique :** 75 min : `aplatir(tableauImbriqué)` en récursif ; `anagrammes(mot1, mot2)` avec une map ; `premierUnique(str)` en O(n) ; `groupBy(arr, clé)`.
- **Test théorique :** Coût moyen d'un get/set dans une Map ? Pourquoi ? Différence Map vs objet JS ? Quand la récursion est-elle une mauvaise idée en JS (limite de stack) ?
- **Mini-projet :** Analyseur de texte : compte les mots, les fréquences, les n mots les plus fréquents d'un fichier texte, en O(n), avec une Map.
- **Critères de passage :**
  - [ ] 4/4 exercices du test pratique
  - [ ] Analyseur en O(n) vérifié
  - [ ] Auto-éval algo ≥ 3
- **Exercice d'architecture :** Ton analyseur doit maintenant traiter 100 fichiers. Écris (sans coder) le plan : quelles fonctions, quelles entrées/sorties, où sont les points de lenteur possibles.
