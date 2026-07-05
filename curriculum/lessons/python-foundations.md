<!-- keep -->
# Leçon — Python : les fondations

## Pourquoi c'est important
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

## Exemple
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

## Pièges classiques
- Écrire du JS en Python (boucles + push au lieu de comprehensions, camelCase au lieu de snake_case).
- Oublier le venv → dépendances globales en vrac, projets irreproductibles.
- `except:` nu qui avale TOUT (même Ctrl-C) : attraper des exceptions PRÉCISES.
- Le défaut mutable `def f(acc=[])`.

## Lien avec l'IA / le futur
pandas (mois 5) manipule des DataFrames avec ces gestes (comprehensions, dicts, slicing). scikit-learn (mois 6) et PyTorch (mois 7) sont des APIs Python. La moitié des exemples de code LLM/RAG de l'écosystème sont en Python — être bilingue JS/Python te rend deux fois plus employable sur les rôles IA.

## Mini-exercice
Transpose ton analyseur de fréquences de mots (jour 30) en Python idiomatique : lecture de fichier, normalisation, `collections.Counter` (découvre-le : il fait le comptage en une ligne), top 10. Puis écris 3 tests pytest dessus. Compare ligne à ligne avec ta version JS : qu'est-ce qui est plus élégant de chaque côté ?

## Vocabulaire à retenir
**comprehension** · **tuple** · **None** · **is vs ==** · **venv / pip / requirements** · **module / import** · **`__main__`** · **exception typée** · **dataclass** · **PEP 8 / snake_case** · **Counter / defaultdict**.

## Résumé
Python = tes concepts JS avec une autre syntaxe : dicts au lieu d'objets, comprehensions au lieu de map/filter, exceptions typées, indentation significative. Les vrais pièges sont peu nombreux mais mordants (is/==, défauts mutables, venv oublié). Vise le style pythonique dès le premier jour : c'est la langue de tout ton avenir ML.
