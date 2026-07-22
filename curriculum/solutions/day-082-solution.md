# Correction — Jour 82 : Introduction à Python pour la data (préparation mois 4-5)

[← Retour au jour 82](../days/day-082.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Transposer des exercices JS en Python IDIOMATIQUE : comprehensions (pas de boucles indexées), dicts (pour les objets), f-strings, None. Adopter les idiomes plutôt qu'écrire du « JS déguisé ». Connaître les pièges (indentation-syntaxe, is vs ==, arguments par défaut mutables) et isoler avec un venv + requirements.txt. La preuve : les 3 scripts sont idiomatiques et une liste d'au moins 5 différences pièges est écrite.

## ✅ Une solution simple
Réécrire les exercices en Python qui fonctionne. On sait produire du Python.

## 🚀 Une solution améliorée
Écrire du Python IDIOMATIQUE (comprehensions, dicts, f-strings — pas du JS transposé mot à mot), désamorcer le piège de l'argument par défaut mutable (None + is), mettre en place venv + requirements.txt, et tenir une liste écrite d'au moins 5 différences pièges JS→Python (indentation, is/==, mutables, None, comprehensions).

## ⚠️ Erreurs probables et points à vérifier
- Écrire du « JS en Python » (boucles indexées au lieu de comprehensions) : ça marche mais ce n'est pas idiomatique.
- Argument par défaut mutable partagé entre appels : bug subtil ; utiliser None + création dans la fonction.
- Confondre `is` (identité) et `==` (valeurs) : bugs subtils sur les comparaisons.
- Oublier le venv : dépendances des projets mélangées, environnement non reproductible.

## 🔍 Comment vérifier ta solution
- Les 3 exercices transposés en Python IDIOMATIQUE (comprehensions, dicts — pas du JS déguisé).
- venv + requirements.txt en place et documentés.
- Ta liste de différences pièges JS→Python écrite (au moins 5).
- Le piège de l'argument par défaut mutable est compris et désamorcé (None + is).

## ❓ Réponses du mini-quiz
1. **Python est-il un changement de paradigme ou de syntaxe ?**
   → De SYNTAXE, pas de paradigme : tu sais déjà programmer (variables, boucles, fonctions, structures, pensée algorithmique). Tu apprends une nouvelle façon d'écrire les mêmes idées, et l'accès à l'écosystème data/ML.
2. **Quelles sont les correspondances JS → Python à connaître ?**
   → Objet → dict, tableau → list, template string → f-string, map/filter → comprehensions, null → None. Le Python idiomatique utilise ces constructions natives, pas une transposition mot à mot du JS.
3. **Pourquoi l'argument par défaut mutable est-il un piège célèbre ?**
   → Un défaut mutable (`liste=[]`) est créé UNE fois et PARTAGÉ entre tous les appels : il accumule les modifications. Correction : utiliser `None` comme défaut et créer la liste dans la fonction (`if liste is None: liste = []`).
4. **À quoi sert un venv, et quel est l'équivalent de package.json ?**
   → Un venv ISOLE les dépendances d'un projet (chacun ses bibliothèques, sans conflit). `requirements.txt` (via `pip freeze`) liste les dépendances pour reproduire l'environnement — l'équivalent Python du package.json.

## 🎤 À savoir expliquer à l'oral
Pose le cadre rassurant : « c'est un changement de syntaxe, pas de paradigme — je sais déjà programmer ». Montre les correspondances (dict, list, comprehension, f-string, None) et insiste sur l'écriture IDIOMATIQUE (comprehension, pas boucle indexée). Donne un piège spécifique (argument par défaut mutable, corrigé avec None + is) pour prouver que tu as compris les différences réelles, pas juste traduit — c'est ce qui distingue un Pythoniste d'un développeur qui « fait du JS en Python ».
