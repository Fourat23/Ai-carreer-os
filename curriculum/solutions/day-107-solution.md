# Correction — Jour 107 : Tester des composants React

[← Retour au jour 107](../days/day-107.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : render + un clic + une assertion. Solution améliorée : trouver les éléments par rôle/label/texte (jamais par classe/id technique), simuler de vraies interactions avec userEvent, affirmer uniquement sur le comportement observable (DOM visible, callbacks appelés), et PROUVER l'indépendance à l'implémentation en refactorant l'interne sans casser les tests. La preuve : renommer un state ou restructurer les sous-composants laisse les tests verts.

## ⚠️ Erreurs probables et points à vérifier
- Chercher par classe CSS ou id technique : le test casse dès qu'on change le style ou la structure, sans vrai bug.
- Affirmer sur le state interne au lieu du DOM visible : couplage à l'implémentation, tests fragiles.
- Tester des détails de rendu sans valeur (nombre de divs) plutôt que le comportement utilisateur.
- Oublier d'attendre les interactions asynchrones (userEvent/await) : assertions sur un DOM pas encore à jour.

## 🔍 Comment vérifier ta solution
- Les éléments sont trouvés par rôle, label ou texte (comme un utilisateur).
- Les assertions portent sur le comportement observable, pas le state interne.
- Les vraies interactions sont simulées (userEvent).
- Un refactor interne sans changement de comportement laisse les tests verts.
- Les trois composants clés couvrent rendu, interaction et états.

## 🎤 À savoir expliquer à l'oral
Cite le principe de Testing Library : « plus le test ressemble à l'usage réel, plus il donne confiance ». Oppose test d'implémentation (casse au refactor, n'attrape rien) et test de comportement (résiste, attrape les vrais bugs). Mentionne le bonus a11y (chercher par rôle). Proposer de refactorer l'interne sans casser les tests est la démonstration qui prouve que tu as compris.
