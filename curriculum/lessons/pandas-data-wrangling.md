<!-- keep -->
# Leçon — pandas : manipuler des données

## 🌍 Le problème d'abord
On te donne un fichier de 50 000 lignes de ventes et une question simple : « quel est le
chiffre d'affaires moyen par région le mois dernier ? ». Ouvrir ça dans un tableur rame et ne
se rejoue pas ; le faire à la main en Python, ligne par ligne, est long et truffé de bugs. Il
te faut un outil pour CHARGER, INSPECTER, FILTRER, TRANSFORMER et AGRÉGER des tableaux de
données de façon rapide, lisible et reproductible. C'est exactement le rôle de pandas — et,
bonne nouvelle, ce sont les mêmes gestes que tu connais déjà en SQL (filtrer, grouper, agréger)
ou en JavaScript (map, filter, reduce), appliqués à des tableaux. Cette leçon te donne ces
gestes quotidiens, socle de tout travail data et prérequis du ML.

## 🎯 Objectif
Savoir charger, inspecter, filtrer, transformer et agréger des données tabulaires avec pandas — les gestes quotidiens de tout travail data et le prérequis du ML. Reconnaître que ce sont les mêmes 6 gestes que tu connais déjà en JS/SQL.

## 🧠 Modèle mental
Un **DataFrame**, c'est **une feuille de calcul programmable** : des colonnes typées, des lignes indexées, et des opérations VECTORISÉES (on agit sur toute une colonne d'un coup, pas ligne par ligne).

## 🧩 Prérequis
Tu dois maîtriser les bases de Python — variables, listes, dictionnaires, fonctions
(`/doc/lessons/python-foundations`) — et avoir vu la logique « filtrer / grouper / agréger »
d'un tableau, déjà rencontrée en SQL (`/doc/lessons/sql-foundations`) : pandas applique ces
mêmes idées en code. Comprendre ce qu'est une donnée tabulaire (lignes = observations,
colonnes = variables) aide, mais on le rappelle ici. Aucune expérience préalable de pandas
n'est supposée.

## 📖 Explication complète
pandas repose sur deux objets : la **Series** (une colonne) et le **DataFrame** (un tableau). Les gestes fondamentaux, identiques à SQL et à tes pipelines JS :
- **Inspecter** : `df.info()`, `df.describe()`, `df.head()`, `df["col"].value_counts()` — TOUJOURS avant de transformer.
- **Sélectionner / filtrer** : `df[df["age"] > 30]` (masque booléen vectorisé) — c'est le WHERE de SQL, le filter de JS.
- **Transformer** : créer une colonne `df["ttc"] = df["ht"] * 1.2` (vectorisé, pas de boucle).
- **Agréger** : `df.groupby("service")["salaire"].mean()` — le GROUP BY de SQL, le reduce de JS.
- **Joindre** : `df1.merge(df2, on="id")` — le JOIN de SQL.
La règle d'or : **penser vectorisé**, pas en boucles. Une boucle `for` sur les lignes d'un DataFrame est presque toujours le signe qu'on rate l'outil vectorisé équivalent (100× plus lent).

## 🔧 Exemple simple
`df.groupby("categorie")["prix"].mean()` donne le prix moyen par catégorie en une ligne — l'équivalent d'un GROUP BY.

## 🧭 Exemple guidé
**Énoncé** : sur des ventes, calculer le CA par mois trié chronologiquement.
**Raisonnement** : extraire le mois, grouper, sommer, trier.
**Solution** :
```python
df["mois"] = df["date"].str[:7]          # "2024-03"
ca = df.groupby("mois")["montant"].sum().sort_index()
```
**Explication** : `.str[:7]` extrait "AAAA-MM" (les dates ISO se trient chronologiquement) ; groupby+sum agrège ; sort_index ordonne. **Variante** : ajoute l'évolution en % d'un mois à l'autre avec `.pct_change()`.

## 🤖 Exemple appliqué (IA / data / architecture)
Avant tout modèle ML, on prépare les données avec pandas : charger, nettoyer, créer les features, encoder les catégories. Un pipeline RAG peut aussi utiliser pandas pour préparer et inspecter un corpus (statistiques de longueur des chunks, doublons).

## ⚠️ Erreurs fréquentes
- Boucler sur les lignes (`for i in range(len(df))`) au lieu de vectoriser.
- Le `SettingWithCopyWarning` : modifier une vue au lieu d'une copie (`df.loc[...]` pour affecter proprement).
- Transformer avant d'inspecter (on rate les problèmes).
- Confondre `df["col"]` (Series) et `df[["col"]]` (DataFrame).

## 🚫 Anti-patterns
- Réimplémenter en boucle ce que pandas fait vectorisé.
- Enchaîner 15 transformations illisibles sans étapes nommées.

## ✍️ Mini-exercice
Charge un CSV, affiche `info()` et `describe()`, filtre les lignes d'une catégorie, et calcule une moyenne par groupe.

## 🔥 Exercice plus difficile
Reproduis en pandas les 10 requêtes que tu avais faites en JS (jour 11) : filtres, tri, top N, regroupements, moyenne par groupe. Compare la lisibilité JS / SQL / pandas.

## ✅ Correction attendue
La logique : inspecter → filtrer (masque booléen) → transformer (vectorisé) → agréger (groupby) → joindre (merge). Vérifie que tu n'as AUCUNE boucle sur les lignes, que tes agrégats se recoupent (somme des groupes = total), et que tu as inspecté avant d'agir.

## 🎤 Questions d'entretien
- « Différence entre une Series et un DataFrame ? » → Une colonne vs un tableau ; le DataFrame est un ensemble de Series alignées sur un index.
- « Pourquoi éviter les boucles sur un DataFrame ? » → Les opérations vectorisées sont bien plus rapides et lisibles.
- « groupby, ça te rappelle quoi en SQL ? » → GROUP BY + agrégat ; même modèle mental.

## 🧾 À retenir
- DataFrame = feuille de calcul programmable, opérations vectorisées.
- Inspecter AVANT de transformer.
- groupby/merge = GROUP BY/JOIN : un seul modèle mental, trois syntaxes.

## 📚 Vocabulaire
**DataFrame / Series** · **index** · **masque booléen** · **vectorisation** · **groupby / agg** · **merge** · **.loc / .iloc** · **value_counts**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je manipule un DataFrame sans boucler sur les lignes.
- [ ] Je sais filtrer, transformer, grouper, joindre.
- [ ] Je fais le lien avec SQL et mes pipelines JS.

## 🔗 Liens avec le programme
Mois 5 (jours ~120-145), projet 4 (DataPulse). Leçons liées : `python-foundations`, `sql-foundations`, `data-cleaning-quality`.
