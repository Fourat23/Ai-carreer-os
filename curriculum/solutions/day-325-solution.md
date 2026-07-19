# Correction — Jour 325 : DocSense : coûts et observabilité

[← Retour au jour 325](../days/day-325.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : logger les appels. Solution améliorée : instrumenter chaque étape du workflow avec le coût (accumulé et AFFICHÉ par analyse) et des logs structurés avec correlation id (reconstitution a posteriori), décomposer le coût par étape (pour optimiser le dominant), et pouvoir plafonner. Coût maîtrisé + observabilité transforment une fonctionnalité fonctionnelle en fonctionnalité déployable — le contraire d'une surprise financière et d'une boîte noire.

## ⚠️ Erreurs probables et points à vérifier
- Coût par analyse inconnu : c'est un risque financier — le décomposer, l'afficher, pouvoir le plafonner.
- Logs non structurés ou sans correlation id : impossible de reconstituer une analyse a posteriori — structurés + corr_id.
- Ne pas décomposer le coût par étape : on ne sait pas quelle étape optimiser — la décomposition désigne le dominant.
- Traiter l'observabilité comme accessoire : une analyse qui échoue sans trace est indébuggable — c'est une exigence de production, pas un bonus.

## 🔍 Comment vérifier ta solution
- Le coût par analyse est mesuré et affiché à l'utilisateur.
- Le coût est décomposé par étape du workflow.
- Chaque étape est loggée avec un correlation id (structuré).
- Une analyse complète est reconstituable a posteriori par son corr_id.
- L'étape de coût dominant est identifiée pour optimisation (variante).

## 🎤 À savoir expliquer à l'oral
Explique ce qui rend une fonctionnalité déployable : « une fonctionnalité IA dont le coût est inconnu est un risque financier, et une analyse qui échoue sans trace est une boîte noire ; j'affiche le coût par analyse et je trace chaque workflow par correlation id — donc je sais ce que ça coûte et je peux reconstituer n'importe quelle analyse ». Coût maîtrisé + observabilité est la différence entre un prototype et un système de production.
