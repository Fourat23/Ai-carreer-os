# Correction — Jour 285 : Coûts d'inférence : maîtrise

[← Retour au jour 285](../days/day-285.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : estimer le coût total (unités × coût/unité) et appliquer des réductions. Solution améliorée : décomposer le coût PAR POSTE, identifier le dominant, appliquer les leviers hiérarchisés par impact (routage vers modèle moins cher en tête, puis cache, réduction de contexte, max_tokens, agent→workflow), et PROUVER chaque gain par la mesure avant/après. Le piège évité : optimiser au hasard au lieu de suivre le poste dominant.

## ⚠️ Erreurs probables et points à vérifier
- Optimiser au hasard (« réduire les tokens partout ») au lieu du poste dominant : raboter un poste à 5 % de la facture ne change rien.
- Estimer un chiffre unique sans hypothèses : une fourchette avec hypothèses explicites est crédible et contestable, un chiffre magique non.
- Ne pas mesurer après : un levier supposé efficace peut ne rien changer — le coût réel avant/après le prouve.
- Oublier que l'output coûte 3-5× l'input : max_tokens et la longueur des réponses pèsent plus que l'input dans beaucoup de cas.

## 🔍 Comment vérifier ta solution
- Le coût est décomposé par poste et le poste dominant est identifié.
- 3 optimisations ciblées sur le dominant sont appliquées.
- Le gain est mesuré (coût réel avant/après), pas supposé.
- L'estimation initiale est une fourchette avec hypothèses explicites.
- L'ordre des leviers suit l'impact (routage/modèle souvent en tête).

## 🎤 À savoir expliquer à l'oral
Déroule la méthode en enquête : « je décompose le coût par poste — l'extraction dominait ; je route la classification vers un petit modèle, je serre max_tokens ; coût par exécution -61 %, prouvé par la mesure ». Puis la règle : « on attaque le poste dominant, jamais au hasard, et on PROUVE par la mesure ». Un résultat chiffré de réduction de coût est un argument business majeur.
