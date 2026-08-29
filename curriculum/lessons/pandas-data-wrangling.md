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

**Deux objets, et un seul vraiment nouveau.** Une **Series** est une colonne : une suite de
valeurs de même type, plus un **index** — l'étiquette de chaque ligne. Un **DataFrame** est un
ensemble de Series qui partagent le même index, autrement dit un tableau. L'index est la seule
notion qui n'a pas d'équivalent en JavaScript : ce n'est pas une position, c'est une clé, et
c'est lui qui aligne les données quand on combine deux objets.

**Ce que « vectorisé » veut dire, concrètement.** Écrire `df["ht"] * 1.2` ne demande pas à
Python de parcourir les lignes. L'opération est transmise en une fois à du code compilé qui
travaille sur un bloc de mémoire contigu, sans repasser par l'interpréteur à chaque valeur.
C'est de là que vient le facteur 50 à 100 : ce n'est pas que la boucle soit « mal écrite »,
c'est qu'elle paie un coût d'interprétation par ligne que l'opération vectorisée ne paie
qu'une fois. La conséquence pratique : dès qu'on écrit `for` sur les lignes d'un DataFrame, il
existe presque toujours une opération vectorisée équivalente qu'on n'a pas trouvée.

**Le masque booléen, qui déroute au début.** `df["age"] > 30` ne rend pas des lignes : cela
rend une Series de `True`/`False`, une par ligne. C'est ensuite `df[masque]` qui garde les
lignes marquées `True`. Comprendre cette étape intermédiaire débloque tout le reste, parce que
les masques se combinent : `df[(df["age"] > 30) & (df["ville"] == "Lyon")]`. Les parenthèses
sont obligatoires — `&` a priorité sur `>` en Python.

**Les cinq gestes, avec leur équivalent que tu connais déjà.**
- **Inspecter** — `df.info()`, `df.describe()`, `df.head()`, `df["col"].value_counts()`.
  Toujours AVANT de transformer : c'est là qu'on voit les valeurs manquantes et les types faux.
- **Filtrer** — `df[df["age"] > 30]`, le `WHERE` de SQL, le `.filter()` de JS.
- **Transformer** — `df["ttc"] = df["ht"] * 1.2`, une colonne calculée d'un coup.
- **Agréger** — `df.groupby("service")["salaire"].mean()`, le `GROUP BY` de SQL.
- **Joindre** — `df1.merge(df2, on="id")`, le `JOIN` de SQL.

## 🔎 Décomposition
- « Qu'est-ce qui aligne mes données ? » → l'index, pas la position.
- « Pourquoi ma boucle est-elle lente ? » → un coût d'interprétation par ligne.
- « Pourquoi `df["age"] > 30` ne rend-il pas des lignes ? » → c'est un masque, pas un filtre.
- « Pourquoi ces parenthèses partout ? » → `&` est prioritaire sur les comparaisons.
- « Par quoi je commence, toujours ? » → inspecter.

## 🔧 Exemple simple
`df.groupby("categorie")["prix"].mean()` donne le prix moyen par catégorie en une ligne — l'équivalent d'un GROUP BY.

## 🧭 Exemple guidé
**Énoncé** : sur un export de ventes, calculer le chiffre d'affaires par mois.

La réponse tient en deux lignes, et c'est exactement le problème :

```python
df["mois"] = df["date"].str[:7]
ca = df.groupby("mois")["montant"].sum().sort_index()
```

Ces deux lignes sont justes — sur des données propres. Voici un export réel, tel qu'un
service comptable le produit :

```
date          montant   client
2024-03-05    120.50    Dupont
2024-03-17    89        dupont
2024-1-9      (vide)    Martin
2024-04-02    210.00    MARTIN
05/04/2024    45,90     Nkolo
2024-04-11    1 300     Nkolo
(vide)        75        Sow
```

**Décision 1 — regarder les types avant de calculer quoi que ce soit.** La colonne `montant`
n'est pas numérique : c'est du texte. Et `sum()` sur du texte ne lève aucune erreur — il
**concatène** :

```
'120.5089210.0045,901 30075'
```

Un total de ventes qui ressemble à un numéro de série. Ici, c'est visible ; dans un tableau
de bord agrégé, ça ne le serait pas. D'où le premier geste, avant toute analyse :
`df.dtypes`, `df.head()`, `df.describe()`. **Trente secondes de lecture évitent des heures
de conclusions fausses**, et c'est le seul moment où l'on peut encore les éviter facilement.

**Décision 2 — convertir, oui, mais mesurer ce que la conversion détruit.** La solution
standard est `pd.to_numeric(..., errors="coerce")`, qui remplace par « valeur manquante »
tout ce qu'il ne sait pas lire. Pratique. Regarde le résultat :

```
[120.5, 89.0, nan, 210.0, nan, nan, 75.0]     →  3 valeurs perdues sur 7
somme obtenue :  494,50
somme réelle  : 1 840,40
```

Le total est faux de 73 %, et aucun avertissement n'a été émis. Les valeurs perdues sont
`45,90` et `1 300` — la virgule décimale et l'espace des milliers, c'est-à-dire **la
notation française**. Après nettoyage du format, on retrouve les 1 840,40 attendus.

La règle qui en découle est la plus utile de la leçon : `errors="coerce"` est un excellent
outil à condition d'être suivi d'un **comptage**. `m.isna().sum()` avant et après, et l'on
sait immédiatement si l'on a converti ou détruit. Un silence n'est pas un succès.

**Décision 3 — l'ambiguïté qui ne se signale jamais.** Convertissons les dates :

```
'05/04/2024'  →  2024-05-04
```

Lis bien. La date française du **5 avril** est devenue le **4 mai**. Pandas n'a pas eu tort :
`05/04/2024` est réellement ambigu, et il a choisi la convention mois-jour. Personne ne sera
prévenu ; simplement, une vente changera de mois, et le chiffre d'affaires d'avril et de mai
seront tous deux faux. C'est la classe d'erreurs la plus dangereuse en traitement de
données — **pas une valeur manquante, une valeur plausible et fausse**. La parade est
d'imposer le format explicitement (`format="%d/%m/%Y"`) plutôt que de laisser deviner, et de
vérifier ensuite l'étendue des dates obtenues : un minimum ou un maximum surprenant est
souvent le seul symptôme visible.

**Décision 4 — sur quoi groupe-t-on, exactement ?** La colonne `client` contient `Dupont`,
`dupont ` (avec une espace finale), `Martin`, `MARTIN`. Un `groupby` compte **6 clients**
distincts là où il n'y en a que 4. Rien ne le signale, et les moyennes par client sont
fausses en silence. `.str.strip().str.lower()` règle ce cas — mais le principe est plus
large : **toute clé de regroupement doit être normalisée avant de servir de clé**, faute de
quoi on agrège des lignes qui devraient l'être ensemble sous des étiquettes différentes.

**Ce que l'exemple enseigne vraiment.** Les deux lignes du début n'étaient pas fausses ;
elles étaient prématurées. Le travail réel n'est pas le `groupby`, c'est tout ce qui le
précède — et il se termine par une vérification que trop peu de gens font : compare la somme
totale à un ordre de grandeur connu, et le nombre de lignes avant et après chaque étape.
**Un pipeline de données sans compteurs est un pipeline dont personne ne sait s'il a perdu
quelque chose.**

**Variante qui déplace le problème.** Une ligne a une date vide. Faut-il l'exclure, la
rattacher à un mois « inconnu », ou remonter chercher l'information à la source ? Les trois
se défendent, et le choix n'est pas technique : exclure fausse le total, un mois « inconnu »
le préserve mais oblige le lecteur du tableau à traiter le cas, remonter à la source coûte
du temps mais est la seule option qui produise une donnée juste. Ce qui ne se défend pas,
c'est de laisser `dropna()` trancher sans le dire. **Une valeur manquante est une question
posée au métier, pas un déchet à supprimer discrètement.**

## 🤖 Exemple appliqué (IA / data / architecture)
Avant tout modèle ML, on prépare les données avec pandas : charger, nettoyer, créer les features, encoder les catégories. Un pipeline RAG peut aussi utiliser pandas pour préparer et inspecter un corpus (statistiques de longueur des chunks, doublons).

## ⚠️ Erreurs fréquentes

**L'affectation qui ne s'applique pas, montrée.** C'est l'erreur la plus coûteuse de pandas,
parce qu'elle ne lève pas d'exception :

```python
# ❌ FAUX : on modifie peut-être une COPIE temporaire, pas le DataFrame.
adultes = df[df["age"] > 18]
adultes["categorie"] = "majeur"      # SettingWithCopyWarning… ou rien du tout
```

`df[df["age"] > 18]` peut rendre une vue sur le tableau d'origine ou une copie indépendante,
selon la disposition des données en mémoire. Dans le second cas, l'affectation modifie un objet
temporaire que plus personne ne référence : `df` est inchangé, aucune erreur n'est levée, et le
script continue avec des données qu'il croit avoir corrigées. Sur un pipeline de nettoyage,
cela produit un jeu de données faux sans une seule ligne rouge.

```python
# ✅ JUSTE : une seule opération, qui désigne explicitement lignes ET colonne.
df.loc[df["age"] > 18, "categorie"] = "majeur"
```

`.loc[lignes, colonne]` s'adresse au DataFrame d'origine et lève une vraie erreur si la
demande est impossible. Règle pratique : dès qu'une affectation suit un filtrage, elle doit
passer par `.loc`.

Les autres :
- Boucler sur les lignes au lieu de vectoriser — 50 à 100 fois plus lent, pour un code plus
  long.
- Transformer avant d'inspecter : on découvre les valeurs manquantes après les avoir moyennées.
- Confondre `df["col"]` (une Series) et `df[["col"]]` (un DataFrame d'une colonne) : les
  méthodes disponibles ne sont pas les mêmes, et le message d'erreur ne le dit pas.

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
