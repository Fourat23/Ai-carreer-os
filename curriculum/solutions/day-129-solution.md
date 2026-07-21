# Correction — Jour 129 : pandas : filtrer, trier, sélectionner

[← Retour au jour 129](../days/day-129.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : filtrer avec un masque et trier. Solution améliorée : composer les conditions avec `&`/`|`/`~` et parenthèses (jamais `and`/`or`), distinguer `.loc` (étiquette/masque) de `.iloc` (position), enchaîner filtre → tri → sélection de colonnes lisiblement, et surtout MODIFIER via `.loc` en une seule opération pour éviter le `SettingWithCopyWarning`. La preuve : le code reproduit fidèlement les requêtes SQL, est vectorisé (rapide), et ne modifie jamais une copie par erreur.

## ⚠️ Erreurs probables et points à vérifier
- `and`/`or` au lieu de `&`/`|` sur des Series : erreur de vectorisation ; oublier les parenthèses casse la priorité.
- Confondre `.loc` (étiquette) et `.iloc` (position) : sélection erronée silencieuse.
- Indexation chaînée pour modifier (`df[cond]["col"] = x`) : modifie une copie, changement perdu — utiliser `.loc` en une fois.
- Boucler ligne par ligne au lieu de filtrer par masque : lent (10-100×) et non idiomatique.

## 🔍 Comment vérifier ta solution
- Les filtres utilisent des masques booléens avec `&`/`|` et parenthèses.
- `.loc` et `.iloc` sont utilisés à bon escient (étiquette vs position).
- Les modifications passent par `.loc` en une seule opération.
- Le tri utilise `sort_values`.
- Le code est vectorisé (aucune boucle de filtrage).

## 🎤 À savoir expliquer à l'oral
Explique le masque booléen (Series de True/False alignée), les opérateurs `&`/`|` avec parenthèses, et la distinction `.loc`/`.iloc`. Insiste sur le `SettingWithCopyWarning` : « modifier une copie chaînée donne des résultats faux sans planter — toujours `.loc` en une fois ». Comparer à `filter().sort().map()` en JS montre que tu vois la continuité, et l'écart de vitesse justifie la vectorisation.
