<!-- keep -->
# Leçon — Python : les fondations

## 🌍 Le problème d'abord
Tu veux faire de la data ou de l'IA : analyser un fichier, entraîner un modèle,
appeler un LLM. Presque tout cet écosystème parle une seule langue : **Python**. La
bonne nouvelle, si tu as déjà vu JavaScript : tu sais DÉJÀ programmer (variables,
boucles, fonctions). Le piège du débutant venu de JS, c'est de croire que Python est
« un autre monde » — alors que c'est surtout une autre SYNTAXE des mêmes idées, avec
quelques particularités (indentation significative, conventions). Cette leçon te fait
passer de « je programme » à « je programme en Python » en quelques jours.

## 🎯 Objectif
Écrire du Python idiomatique : types de base, structures (listes, dicts), fonctions,
compréhensions, gestion d'erreurs — en réutilisant ce que tu sais déjà programmer.

## 🧩 Prérequis
Tu dois déjà savoir PROGRAMMER (variables, boucles, fonctions, structures) — idéalement
via `/doc/lessons/javascript-basics`. Cette leçon est un changement de syntaxe, pas
d'apprentissage de la programmation depuis zéro. Aucun outil data (pandas…) n'est
supposé : c'est le langage de base.

## 🧠 Modèle mental
Les concepts de programmation sont universels ; seule la syntaxe change. Là où JS a
`const`/`{}`/`map`, Python a l'assignation simple, les `dict`/`list` et les
**compréhensions**. La particularité qui déroute : en Python, l'**indentation** (les
espaces en début de ligne) DÉFINIT les blocs — ce n'est pas décoratif, c'est la
structure du programme.

## 💡 Pourquoi c'est important
Python est la langue de l'IA : pandas, scikit-learn, PyTorch, et l'essentiel de l'outillage data/ML sont Python-first. Sans Python, pas de ML crédible. Bonne nouvelle : tu sais déjà PROGRAMMER — variables, boucles, fonctions, structures, pureté sont acquis. Apprendre Python après JavaScript est un changement de SYNTAXE, pas de paradigme : compte des jours, pas des mois.

## Explication complète

### Les correspondances JS → Python (ta table de traduction)
| JavaScript | Python | Nuance |
|---|---|---|
| `const/let x` | `x = ...` | pas de déclaration ; pas de const |
| objet `{}` | `dict` | `d["cle"]` ou `d.get("cle", defaut)` |
| tableau `[]` | `list` | très proche |
| — | `tuple (1, 2)` | liste IMMUABLE (clé de dict possible) |
| `Set` | `set` | natif et idiomatique |
| `null / undefined` | `None` | un seul « rien » |
| template literals | f-strings `f"total {n}"` | équivalent direct |
| `=== ` | `==` | compare les VALEURS ; `is` compare l'identité |
| `arr.map/filter` | comprehensions | LE style pythonique |
| `try/catch` | `try/except TypeErreur:` | exceptions typées |

### L'indentation EST la syntaxe
Pas d'accolades : le bloc est défini par l'indentation (4 espaces, standard). Conséquence : l'indentation incohérente n'est pas moche, elle est FAUSSE (erreur ou bug silencieux). Ton éditeur bien configuré gère ça.

### Les comprehensions : le geste idiomatique n°1
```python
prix_ttc = [p * 1.2 for p in prix if p > 0]          # map + filter en une ligne
compte = {mot: mots.count(mot) for mot in set(mots)}  # dict comprehension
```
Écrire des boucles là où une comprehension est plus claire, c'est « écrire du JS en Python » — le marqueur du nouveau venu. (L'inverse est vrai aussi : une comprehension illisible de 3 lignes doit redevenir une boucle.)

### venv : l'isolation des dépendances
Chaque projet a son environnement virtuel (l'équivalent du `node_modules` local) :
```bash
python -m venv .venv && source .venv/bin/activate
pip install pandas && pip freeze > requirements.txt
```
Sans venv, les projets se polluent mutuellement — c'est LE réflexe d'hygiène Python, systématique.

### Les pièges spécifiques (là où JS ne t'a pas préparé)
- **`==` vs `is`** : `==` compare les valeurs (c'est le `===` que tu veux presque toujours) ; `is` compare l'identité mémoire (réservé à `is None`).
- **Arguments par défaut mutables** : `def f(x, acc=[])` — la liste est créée UNE fois et PARTAGÉE entre les appels. Piège célébrissime. Correct : `acc=None` puis `if acc is None: acc = []`.
- **La mutabilité par défaut** : les listes/dicts passés à une fonction sont des références (comme JS) — ta discipline d'immutabilité (jour 26) reste précieuse.
- **La portée des variables de boucle** : elles FUITENT hors de la boucle (pas de scope de bloc).

### L'organisation : modules et projets
Un fichier `.py` est un module ; `import mon_module` l'utilise. Les scripts s'exécutent avec `python script.py`, et le motif `if __name__ == "__main__":` distingue « exécuté directement » de « importé ». `pytest` teste (l'équivalent de Vitest), `ruff`/`black` formatent et lintent.

## Concepts clés
list / tuple / set / dict · comprehensions · f-strings · slicing (`arr[2:5]`, `arr[-1]`) · `enumerate`, `zip` · exceptions (`try/except/finally`, exceptions typées) · venv + requirements.txt · modules et imports · dataclasses (les « types » légers de Python) · PEP 8 (le style standard).

## 🧭 Exemple guidé
Ton `groupBy` du jour 11, en pythonique :
```python
from collections import defaultdict

def grouper_par(elements, cle):
    groupes = defaultdict(list)          # dict qui initialise tout seul
    for e in elements:
        groupes[e[cle]].append(e)
    return dict(groupes)

par_service = grouper_par(employes, "service")
moyennes = {s: sum(e["salaire"] for e in grp) / len(grp)
            for s, grp in par_service.items()}
```
Même modèle mental qu'en JS et SQL — troisième syntaxe, zéro nouveau concept.

## ⚠️ Erreurs fréquentes
- Écrire du JS en Python (boucles + push au lieu de comprehensions, camelCase au lieu de snake_case).
- Oublier le venv → dépendances globales en vrac, projets irreproductibles.
- `except:` nu qui avale TOUT (même Ctrl-C) : attraper des exceptions PRÉCISES.
- Le défaut mutable `def f(acc=[])`.

## 🔗 Liens avec le programme
pandas (mois 5) manipule des DataFrames avec ces gestes (comprehensions, dicts, slicing). scikit-learn (mois 6) et PyTorch (mois 7) sont des APIs Python. La moitié des exemples de code LLM/RAG de l'écosystème sont en Python — être bilingue JS/Python te rend deux fois plus employable sur les rôles IA.

## Mini-exercice
Transpose ton analyseur de fréquences de mots (jour 30) en Python idiomatique : lecture de fichier, normalisation, `collections.Counter` (découvre-le : il fait le comptage en une ligne), top 10. Puis écris 3 tests pytest dessus. Compare ligne à ligne avec ta version JS : qu'est-ce qui est plus élégant de chaque côté ?

## ✅ Correction attendue
**La démarche** : lire le fichier, normaliser (minuscules, ponctuation retirée), découper, compter, trier. `collections.Counter` fait le comptage ET le tri : `Counter(mots).most_common(10)`.

**L'erreur probable, et elle n'est pas une erreur de Python.** La transposition depuis JavaScript produit presque toujours ceci :

```python
compteur = {}
for mot in mots:
    if mot in compteur:
        compteur[mot] = compteur[mot] + 1
    else:
        compteur[mot] = 1
```

Ça marche parfaitement. Ce n'est pas un bug, c'est du **JavaScript écrit avec des mots-clés Python** — et c'est le vrai risque quand on apprend un second langage. La version idiomatique n'est pas plus courte par coquetterie : `Counter(mots)` dit *ce qu'on fait* (compter) au lieu de *comment on s'y prend* (parcourir, tester, incrémenter). C'est la même différence que `filter` contre une boucle avec un `if`, rencontrée au jour 23.

Le piège séduit précisément parce que le code fonctionne. Rien ne pousse à chercher mieux, et l'on peut écrire du Python pendant des années sans jamais découvrir `Counter`, `defaultdict`, `zip` ou `enumerate`. Le réflexe qui protège : avant d'écrire une boucle de comptage, de regroupement ou d'appariement, chercher trente secondes si la bibliothèque standard le fait déjà. En Python, la réponse est oui bien plus souvent qu'en JavaScript.

Deuxième piège, silencieux celui-là : oublier `.lower()` et la ponctuation. « Le », « le » et « le, » deviennent trois entrées distinctes, le top 10 est faux, et rien ne signale l'anomalie — exactement la question de normalisation déjà rencontrée sur l'index inversé.

**Alternative défendable** : rester en `defaultdict(int)` plutôt que `Counter`. Plus explicite pour qui débute, et extensible si l'on veut compter autre chose qu'une occurrence (une somme de durées, par exemple). `Counter` gagne dès qu'on veut le classement — sinon `defaultdict` suffit et se lit très bien.

**Vérifie seul, sans corrigé** :
1. Ajoute « Le » en majuscule dans ton texte de test. Il doit se fondre avec « le ». Sinon, la normalisation manque.
2. Tes trois tests pytest doivent inclure un cas vide. Un fichier sans mot ne doit pas planter mais rendre une liste vide.
3. Compte tes boucles `for`. S'il y en a plus de deux, va relire la bibliothèque standard : il y a probablement une fonction pour ça.
4. Épreuve de bilinguisme, et c'est l'objet réel de l'exercice : mets les deux versions côte à côte et dis, pour chaque différence, si elle vient du LANGAGE (syntaxe, conventions) ou de la BIBLIOTHÈQUE (`Counter` contre un objet nu). Tout ce qui relève de la bibliothèque est transférable ; tout ce qui relève du langage est à réapprendre. Savoir trier les deux est ce qui rend le troisième langage facile.

## 🏢 Cas professionnel
Une data scientist livre un notebook d'analyse qui tourne parfaitement chez elle. Chez son collègue, il échoue : `ModuleNotFoundError`. Elle avait installé ses dépendances globalement, sans environnement virtuel, en les accumulant au fil de plusieurs projets — dont deux exigent des versions incompatibles de la même bibliothèque. Personne ne sait dire de quoi le notebook a réellement besoin ; reconstituer la liste prend une demi-journée d'essais et d'erreurs.

C'est la raison d'être du `venv` et du `requirements.txt`, et elle n'est pas administrative : **un projet doit pouvoir déclarer ce dont il dépend, et rien d'autre.** L'environnement global mélange les besoins de tous les projets d'une machine, ce qui rend impossible de savoir lesquels appartiennent à celui-ci. C'est le même principe que les frontières explicites en architecture, appliqué aux dépendances.

Le coût est visible plus tard, et c'est ce qui le rend difficile à faire accepter : la personne qui saute le `venv` gagne trente secondes aujourd'hui, et c'est quelqu'un d'autre qui paie la demi-journée dans six mois. Un projet Python sans environnement déclaré n'est pas un projet reproductible — c'est un projet qui fonctionne sur une seule machine, celle où il est né.

## 🎤 Questions d'entretien
- « Quelle différence entre `is` et `==` ? » → `==` compare les valeurs, `is` compare l'identité (le même objet en mémoire). `is` ne se justifie que face à `None`.
- « Pourquoi un environnement virtuel ? » → Pour isoler les dépendances d'un projet et pouvoir les déclarer. Sans lui, on ne sait plus de quoi le projet a besoin.
- « Qu'est-ce qu'une comprehension, et quand l'éviter ? » → Une expression qui construit une collection en une ligne. À éviter dès qu'elle imbrique deux boucles et une condition : une boucle explicite se relit mieux.
- « Le piège du défaut mutable ? » → `def f(acc=[])` : la liste est créée UNE fois, à la définition de la fonction, et partagée entre tous les appels. On écrit `acc=None` puis on initialise dans le corps.
- « Pourquoi éviter `except:` nu ? » → Il attrape tout, y compris l'interruption clavier et les erreurs de programmation. On attrape des exceptions précises, ou l'on ne les attrape pas.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'écris du Python idiomatique, pas du JavaScript traduit.
- [ ] Chacun de mes projets a son environnement virtuel et son fichier de dépendances.
- [ ] Je cherche dans la bibliothèque standard avant d'écrire une boucle de comptage ou de regroupement.
- [ ] Je n'attrape que des exceptions que je sais nommer.

## 📚 Vocabulaire
**comprehension** · **tuple** · **None** · **is vs ==** · **venv / pip / requirements** · **module / import** · **`__main__`** · **exception typée** · **dataclass** · **PEP 8 / snake_case** · **Counter / defaultdict**.

## 🧾 À retenir
Python = tes concepts JS avec une autre syntaxe : dicts au lieu d'objets, comprehensions au lieu de map/filter, exceptions typées, indentation significative. Les vrais pièges sont peu nombreux mais mordants (is/==, défauts mutables, venv oublié). Vise le style pythonique dès le premier jour : c'est la langue de tout ton avenir ML.
