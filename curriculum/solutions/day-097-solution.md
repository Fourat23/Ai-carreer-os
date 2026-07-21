# Correction — Jour 97 : Module api.ts et gestion d'erreur centralisée

[← Retour au jour 97](../days/day-097.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un objet api avec une fonction par endpoint qui fait fetch + json. Solution améliorée : une fonction request privée qui centralise URL de base, en-têtes, vérification de res.ok (fetch ne rejette pas sur 4xx/5xx), gestion de la panne réseau, du 204 sans corps, et une erreur TYPÉE (ApiError avec status) ; par-dessus, des fonctions métier nommées et typées. La preuve : changer l'URL de base ou ajouter un en-tête d'auth ne touche qu'un seul fichier.

## ⚠️ Erreurs probables et points à vérifier
- Croire que fetch rejette sur un 404 : il ne rejette que sur panne réseau — vérifier res.ok est obligatoire.
- URL de base en dur répétée dans chaque composant : un changement d'API impose de modifier dix fichiers.
- Erreurs non typées / gérées différemment partout : le front ne peut pas réagir de façon cohérente (réessayer vs corriger la saisie).
- Laisser des fetch directs dans les composants : couplage au réseau que les revues de code rejettent.

## 🔍 Comment vérifier ta solution
- Tous les appels passent par la couche api (aucun fetch dans les composants).
- res.ok est vérifié et un 4xx/5xx devient une erreur typée.
- L'URL de base et les en-têtes sont définis une seule fois.
- La panne réseau et le 204 (sans corps) sont gérés.
- Les fonctions métier sont nommées et typées (api.getLivres(), api.creerLivre(...)).

## 🎤 À savoir expliquer à l'oral
Explique la frontière : « le réseau est un détail qui vit dans une seule couche ; le reste de l'app parle à cette couche ». Insiste sur le piège du fetch qui ne rejette pas sur 404 — c'est LE détail qui montre que tu as géré de vrais appels. Conclus sur le bénéfice architecture : un changement d'API = un seul fichier modifié.
