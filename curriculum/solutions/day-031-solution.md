# Correction — Jour 31 : Deux sommes et le réflexe hash map

[← Retour au jour 31](../days/day-031.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Reconnaître la famille « chercher une paire/un complément ». La question centrale : au lieu de re-balayer le tableau pour chaque élément, mémoriser ce qu'on a vu et l'interroger en O(1). Pour twoSum : Map valeur→index, chercher le complément avant d'insérer. Pour les variantes (différence donnée, doublon à distance ≤ k, somme nulle), c'est le MÊME réflexe adapté (complément = valeur±d, fenêtre glissante, ou sommes cumulées).

## ✅ Une solution simple
Double boucle : pour chaque i, chercher un j > i tel que arr[i] + arr[j] == cible. Correct, O(n²), acceptable sur de très petits tableaux. À présenter d'abord en entretien pour cadrer le problème.

## 🚀 Une solution améliorée
Une seule passe avec une Map valeur→index : pour chaque élément, tester si le complément a déjà été vu, sinon l'enregistrer. O(n) temps, O(n) mémoire. Chronométrer les deux versions sur 100 000 éléments matérialise l'écart. Mentionner l'alternative tri + deux pointeurs (O(n log n), O(1) mémoire) pour montrer qu'on connaît le compromis.

## ⚠️ Erreurs probables et points à vérifier
- Chercher le complément APRÈS avoir inséré l'élément courant : on l'apparie avec lui-même (i == j) à tort.
- Sommes cumulées : oublier d'initialiser la Map avec {0: -1}, ce qui rate les préfixes qui somment à la cible.
- Confondre « renvoyer les valeurs » et « renvoyer les indices » : la Map doit stocker l'index, pas juste la présence.
- Croire que la Map garantit O(1) dans le PIRE cas : c'est O(1) amorti/moyen ; des collisions massives dégradent vers O(n).

## 🔍 Comment vérifier ta solution
- twoSum trouve bien la paire quand elle existe et renvoie null sinon (cas testés à la main).
- Le cas [3,3] cible 6 renvoie [0,1] (preuve que la recherche précède l'insertion).
- Le benchmark montre un écart croissant O(n) vs O(n²) sur 10k puis 100k éléments.
- La variante somme nulle est vérifiée sur un cas construit ([3,4,-7,5] → [0,2]).

## ❓ Réponses du mini-quiz
1. **Pourquoi la Map fait-elle passer twoSum de O(n²) à O(n) ?**
   → Elle supprime la boucle interne de RECHERCHE : demander « ai-je vu le complément ? » coûte O(1) au lieu de re-parcourir le tableau en O(n). On échange de la mémoire (la table) contre du temps.
2. **Pourquoi faut-il chercher le complément AVANT d'insérer l'élément courant ?**
   → Sinon on risque d'apparier un élément avec lui-même (i == j). En cherchant d'abord, la Map ne contient que les éléments STRICTEMENT précédents.
3. **Pourquoi la Map des sommes cumulées est-elle initialisée avec {0: -1} ?**
   → Pour capter le cas où un PRÉFIXE entier (depuis l'index 0) somme à la cible/zéro : la somme 0 est réputée « vue avant le début », à l'index -1.
4. **Quand le tri + deux pointeurs bat-il la hash map pour twoSum ?**
   → Quand la mémoire est critique (O(1) contre O(n)) ou que le tableau est déjà trié. Le compromis : le tri détruit l'ordre d'origine, donc les indices.

## 🎤 À savoir expliquer à l'oral
Déroule la démarche en entretien : « je pose la naïve O(n²), puis je remarque que la boucle interne CHERCHE — donc une Map la supprime ». Insiste sur le compromis mémoire/temps (O(n) mémoire pour O(n) temps) et sur le détail « chercher avant d'insérer ». Terminer en reliant à une variante (sommes cumulées) prouve que tu as compris le PATTERN, pas juste appris twoSum par cœur — c'est ce qui fait la différence.
