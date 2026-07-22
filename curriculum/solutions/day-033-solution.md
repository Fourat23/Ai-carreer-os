# Correction — Jour 33 : Stacks et Queues : implémenter pour posséder

[← Retour au jour 33](../days/day-033.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Encapsuler la DISCIPLINE d'accès dans un type générique : Stack (push/pop/peek en O(1) sur un tableau) et Queue (enqueue/dequeue en O(1) via deux index, JAMAIS shift). Puis appliquer : parenthesesValides empile les ouvrantes et vérifie la correspondance au dépilement, exigeant une pile vide à la fin ; la file FIFO ordonne un traitement. La compétence : reconnaître QUELLE discipline modélise le problème.

## ✅ Une solution simple
Stack et Queue sur un tableau avec les opérations natives (push/pop pour la pile ; push/shift pour la file). parenthesesValides directe. Correct fonctionnellement, mais la file en shift() est O(n).

## 🚀 Une solution améliorée
Queue O(1) à deux index (ou liste chaînée) pour éviter le coût de shift, isEmpty() explicite pour éviter les undefined silencieux, et gestion soignée des cas d'échec de parenthesesValides (fermante orpheline ET ouvrante en trop). Savoir citer un cas d'usage réel de chaque structure et le lien Stack↔récursion.

## ⚠️ Erreurs probables et points à vérifier
- Implémenter la Queue avec shift() : O(n) par défilement, quadratique sur gros volume — mentionner la version à deux index.
- Oublier le cas « ouvrantes en trop » : ne pas tester que la pile est vide à la fin déclare `((` valide à tort.
- Oublier le cas « fermante orpheline » : dépiler une pile vide (pop → undefined) sans le traiter.
- Ne pas tester isEmpty avant pop/peek : renvoie undefined silencieusement au lieu de signaler l'erreur.

## 🔍 Comment vérifier ta solution
- Stack et Queue génériques compilent en strict et passent des tests manuels (push/pop/peek/isEmpty/size).
- parenthesesValides gère les imbrications correctes ET les quatre cas d'échec (mauvais ordre, ouvrante en trop, fermante orpheline, vide).
- La Queue ne fait aucun shift() : dequeue reste O(1) sur 100k éléments.
- Un cas d'usage réel de la Stack et de la Queue est cité et justifié.

## ❓ Réponses du mini-quiz
1. **Quelle est la différence de discipline entre une Stack et une Queue ?**
   → La Stack est LIFO (dernier entré, premier sorti) ; la Queue est FIFO (premier entré, premier sorti). La Stack modélise l'imbrication, la Queue l'ordre d'arrivée.
2. **Pourquoi une Queue implémentée avec `shift()` est-elle un problème ?**
   → `shift()` retire en TÊTE d'un tableau et DÉCALE tous les autres éléments : O(n) par opération. Sur gros volume, la file devient quadratique. Il faut deux index ou une liste chaînée pour O(1).
3. **Pourquoi `parenthesesValides` doit-elle vérifier que la pile est VIDE à la fin ?**
   → Une pile non vide signifie des ouvrantes jamais fermées (ex. `((`). Sans ce test, la chaîne serait déclarée valide à tort.
4. **Quel lien y a-t-il entre une Stack et la récursion ?**
   → La récursion utilise implicitement une pile : la « call stack ». Chaque appel empile son contexte, chaque retour le dépile — LIFO. Une récursion peut se dérouler en pile explicite.

## 🎤 À savoir expliquer à l'oral
Ouvre sur la vraie valeur : « ce ne sont pas des conteneurs, ce sont des disciplines — LIFO pour l'imbrication, FIFO pour l'ordre d'arrivée ». Démontre parenthesesValides en insistant sur les deux tests souvent oubliés (pile vide à la fin, fermante orpheline). Puis marque des points en signalant spontanément le piège shift() O(n) et le lien Stack↔call stack : ça prouve que tu penses en COÛTS et en sémantique, pas juste en syntaxe.
