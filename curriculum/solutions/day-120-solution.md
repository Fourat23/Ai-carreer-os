# Correction — Jour 120 : Python : syntaxe et structures

[← Retour au jour 120](../days/day-120.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : traduire les exercices JS en Python ligne à ligne. Solution améliorée : les réécrire IDIOMATIQUEMENT — comprehensions au lieu des boucles-push (transformer et filtrer), dict avec .get(cle, defaut) pour le comptage (pas de KeyError), enumerate pour indice+valeur, zip pour deux listes, set pour dédoublonner, snake_case et f-strings — le tout dans un venv activé. La preuve : mise côte à côte, la version pythonique est nettement plus courte et lisible que la traduction littérale.

## ⚠️ Erreurs probables et points à vérifier
- Écrire des boucles `for ... .append()` là où une comprehension s'impose : du JavaScript traduit, pas du Python.
- Accéder à un dict par `d[cle]` sans gérer la clé absente : KeyError — utiliser `.get(cle, defaut)`.
- Itérer par index (`range(len(xs))`) au lieu d'`enumerate`/`zip` : anti-idiome peu lisible.
- Travailler sans venv : les dépendances polluent l'installation globale (Python installe globalement par défaut, contrairement à npm).

## 🔍 Comment vérifier ta solution
- Les transformations et filtres utilisent des comprehensions, pas des boucles-push.
- Le comptage utilise un dict avec .get(cle, defaut).
- L'itération indice+valeur utilise enumerate, deux listes utilisent zip.
- Le nommage est en snake_case et les chaînes utilisent des f-strings.
- Les scripts tournent dans un venv activé, isolé du système.

## 🎤 À savoir expliquer à l'oral
Formule la bascule : « je ne traduis pas mon JS, j'adopte les idiomes de Python ». Cite les plus marquants : comprehensions (vs for-push), dict avec .get, enumerate/zip (vs index), indentation, snake_case, venv. Montrer les deux versions côte à côte (JS traduit vs pythonique) et pointer la différence de lisibilité prouve que tu as intégré la LANGUE, pas juste sa syntaxe.
