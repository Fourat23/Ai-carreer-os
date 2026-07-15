# Correction — Jour 262 : Citations vérifiables

[← Retour au jour 262](../days/day-262.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La vérification décompose la réponse en affirmations sourcées et vérifie chacune contre son chunk cité par entailment (juge de fidélité réutilisé). La politique de non-affichage (retirer/marquer/refuser selon le domaine) garantit qu'aucune affirmation non ancrée n'atteint l'utilisateur. C'est la couche d'ancrage anti-injection, avec la limite assumée « ancrage ≠ vérité ».

## ⚠️ Erreurs probables et points à vérifier
- Vérification trop stricte (présence textuelle exacte) : elle rejette les paraphrases légitimes — l'entailment gère les reformulations, un simple grep non.
- Oublier les affirmations SANS citation : ce sont les plus suspectes (le modèle affirme sans source) — elles doivent être traitées, pas ignorées.
- Croire que la vérification garantit la vérité : elle garantit l'ancrage dans les sources ; une source fausse passe (cas fidèle-mais-inexact, jour 256).
- Ignorer le coût : vérifier chaque affirmation par un juge ajoute latence et €  — arbitrer (systématique en domaine sensible, conditionnel ailleurs).

## 🔍 Comment vérifier ta solution
- Chaque affirmation de la réponse est vérifiée contre son chunk cité (par entailment).
- Une affirmation ajoutée hors sources est détectée et non affichée.
- La réponse à l'injection indirecte du jour 260 est bloquée par la vérification.
- Une paraphrase légitime est validée (pas de faux positif de rejet).
- Le surcoût est mesuré et une stratégie de déclenchement conditionnel est esquissée (variante).

## 🎤 À savoir expliquer à l'oral
Montre le double rôle : « mon juge de fidélité, construit pour l'évaluation, devient en production une VÉRIFICATION de citations — chaque affirmation doit être impliquée par sa source, sinon elle n'atteint pas l'utilisateur ». Puis la limite : « ça garantit l'ancrage, pas la vérité ». Réutiliser un outil et connaître sa limite : deux signaux de maturité en une réponse.
