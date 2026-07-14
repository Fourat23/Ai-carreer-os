# Correction — Jour 257 : Harnais d'évaluation automatisé

[← Retour au jour 257](../days/day-257.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le harnais orchestre les évaluateurs existants en UNE commande produisant un rapport à trois niveaux (agrégats, par type, par question), reproductible (temp 0, versions figées), comparable (rapports horodatés + deltas) et économe (cache de jugements, coût affiché). Il transforme l'évaluation d'un événement rare en réflexe à chaque changement.

## ⚠️ Erreurs probables et points à vérifier
- Un rapport agrégat-seulement : le score global dit qu'il y a un problème mais pas OÙ — les niveaux par type et par question sont ce qui permet de réparer.
- Harnais non déterministe (juges à température > 0) : deux runs diffèrent, aucune comparaison de versions n'est fiable.
- Pas de cache de jugements : re-juger tout le golden set à chaque petite modif coûte cher et décourage l'usage — on ne re-juge que ce qui a changé.
- Oublier d'enregistrer la config et la version du golden dans le rapport : six mois plus tard, un rapport sans contexte est un chiffre orphelin.

## 🔍 Comment vérifier ta solution
- `rag eval` produit un rapport à 3 niveaux (agrégats, par type, détail par question avec échecs listés).
- Deux exécutions sur le même système donnent le même rapport (reproductibilité vérifiée).
- Le rapport enregistre config + version du golden + date + coût.
- `rag eval --compare` montre les deltas et les questions basculées (variante).
- Le cache de jugements évite de re-juger l'inchangé (hit démontré).

## 🎤 À savoir expliquer à l'oral
Fais le parallèle avec les tests automatisés : « ce qui n'est pas sans friction n'est pas fait ; mon harnais rend l'évaluation aussi simple que lancer les tests — une commande, un rapport, je le lance à chaque changement ». Puis montre la structure à 3 niveaux (décider/cibler/diagnostiquer). Culture d'ingénierie + compétence IA en une réponse.
