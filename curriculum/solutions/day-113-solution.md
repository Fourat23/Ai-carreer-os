# Correction — Jour 113 : Projet 3 — BiblioApp : socle

[← Retour au jour 113](../days/day-113.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : coder la liste et le détail. Solution améliorée : construire le chemin le plus FIN de bout en bout (routing + liste depuis l'api avec 3 états + détail par id d'URL) qui valide l'assemblage des couches AVANT toute feature, en commits atomiques dont chaque message dit le pourquoi, en réutilisant la couche api (97), le hook useFetch (110) et l'architecture d'état cadrée (104). La preuve : ouvrir directement l'URL d'une fiche la charge (id depuis l'URL).

## ⚠️ Erreurs probables et points à vérifier
- Commencer par la fonctionnalité la plus riche : les bugs d'intégration entre couches se découvrent tard et coûtent cher.
- Un commit géant « BiblioApp » : illisible, irréversible, signale une absence de méthode aux recruteurs.
- Refaire des fetchs à la main dans chaque composant au lieu de réutiliser la couche api et useFetch : incohérence et duplication.
- Négliger le 404 et les 3 états dès le socle : l'architecture de navigation n'est pas réellement validée.

## 🔍 Comment vérifier ta solution
- Le socle est navigable de bout en bout (liste → détail → retour).
- La liste et le détail passent par la couche api et gèrent les 3 états.
- Chaque étape est un commit atomique avec un message expliquant le pourquoi.
- Ouvrir l'URL d'une fiche dans un onglet neuf la charge (id depuis l'URL).
- Le socle applique l'arbre de composants et le plan d'état du cadrage (jour 104).

## 🎤 À savoir expliquer à l'oral
Explique le walking skeleton : « je construis le chemin le plus fin qui traverse toutes les couches pour valider l'architecture tôt, quand les bugs d'intégration sont triviaux ». Décris les commits atomiques comme un récit lisible de la construction. Le test « ouvrir /livres/3 dans un onglet neuf » prouve concrètement que ton architecture de navigation est saine.
