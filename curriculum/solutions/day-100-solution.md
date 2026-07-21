# Correction — Jour 100 : Lever l'état et le partager

[← Retour au jour 100](../days/day-100.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : remonter au parent un état partagé par deux enfants, passé en props. Solution améliorée : déduire la place de l'état de ses lecteurs ET modificateurs (plus petit ancêtre commun), appliquer strictement « données vers le bas, événements vers le haut », dériver ce qui se calcule (la liste filtrée), et éviter à la fois le state trop local (impossible à partager) et trop global (props drilling). La preuve : chaque donnée a une source de vérité unique et l'arbre de composants est documentable.

## ⚠️ Erreurs probables et points à vérifier
- État trop local coincé dans un enfant alors qu'un frère en a besoin : partage impossible sans refactor.
- État remonté trop haut : props drilling à travers des composants qui ne l'utilisent pas, re-rendus inutiles.
- Dupliquer la donnée dans plusieurs composants : plusieurs sources de vérité à resynchroniser.
- Confondre 'lever l'état' et 'tout mettre global' : l'objectif est le plus BAS possible qui couvre les lecteurs, pas le plus haut.

## 🔍 Comment vérifier ta solution
- Chaque donnée partagée vit au plus petit ancêtre commun de ses lecteurs.
- Le flux respecte 'données vers le bas (props), événements vers le haut (callbacks)'.
- Aucune donnée n'a plusieurs sources de vérité.
- Il n'y a pas de props drilling excessif (signal d'un mauvais placement).
- L'arbre de composants et l'état détenu par chaque nœud sont documentés.

## 🎤 À savoir expliquer à l'oral
Explique la déduction : « je regarde qui lit et qui modifie, l'état va à leur plus petit ancêtre commun ». Donne le flux (données bas, événements haut) et le signal d'alerte (props drilling = état mal placé ou besoin de Context). Montre un avant/après où remonter un filtre débloque le partage — c'est la démonstration concrète du raisonnement d'architecture front.
