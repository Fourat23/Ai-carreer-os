# Correction — Jour 93 : State et interactivité (useState)

[← Retour au jour 93](../days/day-093.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : useState pour chaque valeur qui change, setter appelé sur chaque événement. Solution améliorée : garantir l'immutabilité partout (spread pour ajouter, map avec spread d'objet pour modifier, filter pour retirer), utiliser le setter FONCTIONNEL quand la valeur dépend de l'ancienne, DÉRIVER les valeurs calculables (total, nombre coché) au lieu de les stocker, et borner le state (min/max) dans le setter. La preuve : aucune mutation, l'UI reste toujours synchrone avec le state.

## ⚠️ Erreurs probables et points à vérifier
- Muter au lieu de remplacer (push/sort/obj.x = v) : pas de re-rendu, bug classique — spread systématique.
- Stocker en state une valeur dérivable (le total des articles) : double source de vérité, désynchronisation garantie — dérive-la à la volée.
- Utiliser setN(n+1) dans plusieurs mises à jour successives : elles se basent sur la même valeur figée — utilise setN(c => c+1).
- Un seul gros state-objet pour des valeurs indépendantes (ou l'inverse) : granularité mal choisie, mises à jour plus fragiles.

## 🔍 Comment vérifier ta solution
- Chaque mise à jour crée une nouvelle référence (aucune mutation).
- Les valeurs calculables sont dérivées, pas stockées en state.
- Le setter fonctionnel est utilisé quand la valeur dépend de l'ancienne.
- L'UI reflète toujours le state courant (jamais de manipulation directe du DOM).
- Le compteur respecte ses bornes min/max.

## 🎤 À savoir expliquer à l'oral
Montre la boucle au tableau : événement → setState (immuable) → nouveau rendu. Puis la phrase clé : « je ne modifie pas le state, je le remplace ; React re-rend parce que la référence change ». Illustre avec le bug du push qui ne re-rend pas — c'est l'exemple qui prouve que tu as compris valeur/référence appliqué à React.
