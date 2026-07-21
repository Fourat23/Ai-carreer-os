# Correction — Jour 110 : Hooks personnalisés

[← Retour au jour 110](../days/day-110.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : une fonction useX qui appelle useState/useEffect et renvoie ce qu'il faut. Solution améliorée : définir d'abord le contrat (ce que le hook renvoie), encapsuler la logique complète (les 3 états et le nettoyage pour useFetch, l'initialisation paresseuse et la persistance pour useLocalStorage), typer génériquement (<T>), respecter les règles des hooks, et tester le hook ISOLÉMENT. La preuve : deux composants réutilisent le hook avec chacun leur propre état, et la logique est testée sans composant autour.

## ⚠️ Erreurs probables et points à vérifier
- Croire qu'un hook partage les DONNÉES : il partage la logique ; chaque appelant a son propre état (partage de données = Context).
- Extraire un hook pour une logique triviale à usage unique : sur-abstraction sans bénéfice.
- Violer les règles des hooks (appel conditionnel, hors du niveau racine) : comportement cassé et linter en alerte.
- Un hook qui renvoie une interface floue ou instable : les composants appelants deviennent compliqués — soigner le contrat de retour.

## 🔍 Comment vérifier ta solution
- Le nom commence par use et le hook respecte les règles des hooks.
- La logique à état répétée est encapsulée une fois (fetch/localStorage complets).
- Le hook est typé génériquement et renvoie une interface claire.
- Le hook est testé isolément (sans composant autour).
- Chaque composant appelant a son propre état (logique partagée, pas données).

## 🎤 À savoir expliquer à l'oral
Définis le hook comme « la fonction réutilisable du clean code appliquée au stateful ». Le point qui prouve la compréhension : « il partage la LOGIQUE, pas les données — deux useFetch = deux états ; pour partager des données, c'est Context ». Mentionne les règles des hooks et le test isolé. Ajoute le garde-fou anti-abstraction : « je n'extrais que ce qui se répète ou clarifie ».
