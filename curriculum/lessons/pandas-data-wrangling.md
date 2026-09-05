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
Prends un CSV que tu n'as pas fabriqué toi-même — un export réel, avec ses défauts. Charge-le,
affiche `info()` et `describe()`, filtre les lignes d'une catégorie, calcule une moyenne par
groupe.

**Livrable** : les deux sorties `info()` / `describe()`, et **trois lignes** disant ce
qu'elles t'ont appris que tu ne savais pas avant de les lire.

**Critère de réussite, vérifiable seul** : compare le nombre de lignes annoncé par `info()`
au nombre de valeurs non nulles de chaque colonne. **S'ils sont égaux partout, tu travailles
sur un fichier trop propre pour apprendre quoi que ce soit** — c'est le seul cas où l'on peut
faire une moyenne sans se poser de question, et il n'arrive jamais en vrai. Prends-en un
autre.

## 🔥 Exercice plus difficile
Reproduis en pandas les 10 requêtes que tu avais faites en JS (jour 11) : filtres, tri, top N, regroupements, moyenne par groupe. Compare la lisibilité JS / SQL / pandas.

**Critère de réussite, et il est strict** : chaque requête pandas doit rendre **exactement le
même résultat** que ta version JS — mêmes lignes, mêmes valeurs, même ordre. Écris la
comparaison, ne la fais pas à l'œil. Quand une paire diverge, c'est la version pandas qui a
tort dans la grande majorité des cas, et l'écart est instructif : il vient presque toujours
de l'**index**, que JS n'a pas et que pandas conserve derrière ton dos après un filtre ou un
tri. Une divergence comprise vaut mieux que dix requêtes qui passent.

## ✅ Correction

### La démarche

*Inspecter → filtrer → transformer → agréger → joindre.* L'ordre importe pour une raison
pratique : chaque étape réduit ou fiabilise ce que traite la suivante. Filtrer après avoir
agrégé, c'est agréger des lignes qu'on va jeter ; transformer après avoir joint, c'est
transformer les mêmes valeurs plusieurs fois.

Mais le vrai contenu de cette correction est ailleurs, dans le premier verbe : **inspecter**.
C'est l'étape qu'on saute, et celle qui décide de la justesse du résultat.

### Inspecter, concrètement

`info()` et `describe()` ne sont pas des formalités. Voici ce que chaque ligne de leur sortie
peut t'apprendre :

| Ce que tu regardes | Ce que ça révèle |
|---|---|
| `Dtype` d'une colonne numérique = `object` | il y a du texte dedans — une virgule décimale, un `N/A`, un espace |
| `Non-Null Count` inférieur au total | des valeurs manquantes, et combien exactement |
| `min` négatif sur une quantité | une sentinelle, ou un signe inversé |
| `max` absurde (999, 1900-01-01) | une sentinelle déguisée en donnée |
| `count` d'une catégorielle très supérieur au nombre attendu de modalités | des variantes de casse ou d'espaces |

Le dernier point se vérifie en une ligne, et c'est le contrôle le plus rentable du domaine :

```python
df["ville"].value_counts()
```

Il révèle immédiatement `Lyon`, `lyon`, `  Lyon ` et `LYON` comme quatre catégories distinctes.
La leçon `/doc/lessons/data-cleaning-quality` mesure ce que ça coûte : une ville fantôme
emportant **2 294 €** absents du total de Lyon, dans un rapport que personne ne remet en cause.

### « Aucune boucle sur les lignes » : pourquoi, vraiment

Le critère est souvent justifié par la performance, et c'est la moins importante des deux
raisons.

```python
# ❌ boucle
resultats = []
for _, ligne in df.iterrows():
    resultats.append(ligne["prix"] * ligne["quantite"])
df["total"] = resultats

# ✅ vectorisé
df["total"] = df["prix"] * df["quantite"]
```

La version vectorisée est effectivement bien plus rapide — le calcul se fait dans du code
compilé, sur des tableaux contigus, sans créer un objet Python par ligne.

Mais la raison qui compte le plus est **la lisibilité et la justesse**. La seconde version dit
ce qu'elle fait : *le total est le produit du prix par la quantité*. La première décrit une
mécanique dans laquelle on peut se tromper d'index, oublier une ligne, ou muter le tableau
qu'on parcourt. Le code vectorisé exprime une **relation entre colonnes** ; la boucle exprime
une procédure.

Nuance honnête : il existe des cas où la boucle est acceptable — une centaine de lignes, une
logique irréductiblement séquentielle, un appel externe par ligne. Le critère n'est pas
« jamais de boucle » mais **« pas de boucle pour ce qui s'exprime comme une opération sur des
colonnes »**.

### Le contrôle de cohérence : « la somme des groupes = le total »

C'est le critère le plus important de l'exercice, et le moins pratiqué.

```python
total = df["montant"].sum()
par_groupe = df.groupby("ville")["montant"].sum()
assert abs(par_groupe.sum() - total) < 0.01, f"{par_groupe.sum()} ≠ {total}"
```

Quand cette assertion échoue, elle désigne presque toujours l'une de ces trois causes :

1. **des valeurs manquantes dans la colonne de regroupement** — par défaut, `groupby` **exclut**
   les lignes dont la clé est `NaN`. Elles disparaissent silencieusement du résultat. C'est le
   piège numéro un du domaine, et `dropna=False` le lève ;
2. **une jointure qui a dupliqué des lignes** — un `merge` avec une clé non unique du côté droit
   multiplie les lignes de gauche, et la somme gonfle ;
3. **un filtre appliqué à un seul des deux calculs**, souvent parce qu'il a été ajouté plus tard
   à un endroit et pas à l'autre.

La règle générale à emporter : **après chaque `groupby` et chaque `merge`, vérifie que le total
se conserve.** Deux lignes de contrôle qui attrapent la majorité des erreurs d'analyse — et qui
sont, dans un notebook, ce qui remplace les tests automatiques qu'on n'y écrit pas.

Pour un `merge`, le contrôle équivalent est le nombre de lignes :

```python
avant = len(gauche)
joint = gauche.merge(droite, on="client_id", how="left", validate="many_to_one")
assert len(joint) == avant, "la jointure a dupliqué des lignes"
```

Le paramètre `validate="many_to_one"` fait mieux que l'assertion : il **échoue au moment du
`merge`**, avec un message qui nomme le problème, au lieu de laisser passer des lignes
dupliquées qu'on découvrira dans un total faux.

### La comparaison JS / SQL / pandas

L'exercice difficile demande de comparer la lisibilité des trois. La réponse attendue n'est pas
un classement, mais une observation sur **ce que chaque langage rend facile** :

| | Ce qu'il exprime naturellement | Ce qu'il rend pénible |
|---|---|---|
| **JavaScript** | une transformation ligne à ligne, une logique métier arbitraire | les agrégations multi-clés, les jointures |
| **SQL** | filtrer, regrouper, joindre, sur des données déjà en base | les transformations séquentielles, l'itératif |
| **pandas** | l'exploration : inspecter, essayer, pivoter, tracer | la reproductibilité, si l'on reste dans un notebook |

L'observation qui a le plus de valeur en entretien : **SQL et pandas expriment les mêmes
opérations** — `WHERE` et masque booléen, `GROUP BY` et `groupby`, `JOIN` et `merge`. Ce ne
sont pas deux compétences, c'est la même, dans deux syntaxes. Ce qui les sépare est le lieu du
calcul : SQL le fait là où sont les données, pandas les rapatrie en mémoire.

D'où la règle de choix, qui n'est pas une question de goût : **si les données sont en base et
que le résultat est plus petit que la source, fais le travail en SQL.** Rapatrier dix millions
de lignes pour en agréger douze est un aller-retour coûteux et inutile.

### La mauvaise solution plausible

Enchaîner les transformations sans jamais réassigner, ou en réassignant partiellement :

```python
df[df["montant"] > 100]["remise"] = 0.1     # ⚠️ ne modifie rien de durable
```

Cette ligne ne produit pas d'erreur — au mieux un avertissement — et **ne modifie pas `df`**.
Elle agit sur une copie temporaire, immédiatement jetée. On relit le code, il a l'air correct,
et la colonne `remise` reste vide.

La forme correcte est explicite :

```python
df.loc[df["montant"] > 100, "remise"] = 0.1
```

Le principe à retenir : **quand tu modifies un sous-ensemble, désigne-le en une seule
expression `.loc[lignes, colonnes]`.** Deux crochets successifs signifient deux opérations, et
la seconde peut agir sur une copie.

### Auto-évaluation

| Vérification | Comment |
|---|---|
| inspecté avant d'agir | tu peux citer un défaut trouvé par `info()`, `describe()` ou `value_counts()` |
| aucune boucle superflue | pas d'`iterrows` pour un calcul entre colonnes |
| agrégats cohérents | la somme des groupes égale le total, **vérifié** |
| jointures contrôlées | `validate=` sur chaque `merge`, ou une assertion sur le nombre de lignes |
| pas de manquants avalés | tu sais si `groupby` a exclu des lignes, et combien |
| modifications effectives | aucune affectation via un double crochet |

### Généralisation

Ce que cette leçon installe au-delà de pandas : **une manipulation de données doit se
contrôler, pas se relire.** Un code de transformation a la particularité désagréable d'être
presque toujours syntaxiquement correct et parfois numériquement faux — il n'y a pas
d'exception, pas de plantage, juste un chiffre.

Les deux contrôles de cette correction — *la somme se conserve-t-elle ?* et *le nombre de
lignes a-t-il changé ?* — coûtent deux lignes chacun et remplacent une relecture attentive qui,
elle, ne détecte rien. C'est le même réflexe que la comptabilité en partie double, et pour la
même raison : on ne vérifie pas un calcul en le regardant, on le vérifie en le recoupant.

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
