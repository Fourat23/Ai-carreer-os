# Correction — Jour 296 : Privacy et données

[← Retour au jour 296](../days/day-296.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : lister les données de DocSense et où elles vont. Solution améliorée : répondre aux quatre questions (entrée avec classification, transit/stockage avec moindre privilège, SORTIE externe vers les APIs LLM avec garanties fournisseur + masquage/modèle local pour le sensible, rétention avec droit à l'effacement). Le point critique est le n°3 : ce qui part vers un LLM tiers. Une politique explicite est ce qui rend l'app déployable en entreprise (RGPD, confiance).

## ⚠️ Erreurs probables et points à vérifier
- Ignorer que l'appel LLM ENVOIE des données à un tiers : c'est le risque n°1 de gouvernance d'une app IA — le tracer et le contrôler est essentiel.
- Pas de classification des données : traiter un document confidentiel comme un document public expose au risque juridique — classifier d'abord.
- Oublier la rétention et le droit à l'effacement : exigence légale RGPD, pas optionnelle.
- Ne pas prévoir de traitement pour les données sensibles (masquage, modèle local) : sans lui, l'app est indéployable pour les clients régulés.

## 🔍 Comment vérifier ta solution
- La politique répond aux 4 questions (entrée classifiée, transit sécurisé, sortie externe, rétention).
- Le point « données envoyées aux APIs LLM » est explicite avec ses garanties.
- Une parade pour les données sensibles (masquage ou modèle local) est définie.
- La rétention et le droit à l'effacement sont couverts.
- Un type de donnée qui ne doit PAS partir vers un LLM externe est identifié et traité (variante).

## 🎤 À savoir expliquer à l'oral
Centre ta réponse sur le point IA critique : « quand j'appelle une API LLM, j'envoie question + extraits à un tiers — c'est LA question qu'un DPO pose ; je vérifie les garanties no-training/non-rétention, je masque le sensible, et pour l'ultra-confidentiel j'offre un modèle local ». Cette conscience de gouvernance des données rend une app IA déployable en entreprise — et distingue nettement en entretien.
