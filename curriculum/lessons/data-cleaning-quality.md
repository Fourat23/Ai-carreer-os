<!-- keep -->
# Leçon — Nettoyage et qualité des données

## 🌍 Le problème d'abord
Tu reçois un export « clients » : des dates dans trois formats différents, des e-mails en
double, des âges à 0 ou 999, des colonnes à moitié vides. Si tu enchaînes directement un
modèle ou un dashboard là-dessus, le résultat sera FAUX — mais d'apparence crédible, ce qui est
pire. Avant toute analyse, il faut DIAGNOSTIQUER les défauts (manquants, doublons, formats,
aberrations), décider consciemment quoi en faire, et le DOCUMENTER pour que ce soit reproductible
et justifiable. Ce travail, souvent négligé, représente 60 à 80 % du temps réel en data — et
c'est lui qui fait la fiabilité de tout ce qui suit. Cette leçon t'apprend à nettoyer sans
maquiller.

## 🎯 Objectif
Savoir diagnostiquer et corriger des données sales (manquants, doublons, formats, aberrations) de façon DOCUMENTÉE et justifiée, et produire un rapport de qualité. C'est 60-80 % du travail réel en data et en ML — et ce qui fait la fiabilité de tout ce qui suit.

## 🧠 Modèle mental
« Garbage in, garbage out » : **un modèle ou un dashboard ne vaut jamais mieux que ses données**. Nettoyer, ce n'est pas maquiller : c'est comprendre POURQUOI la donnée est sale et décider consciemment quoi en faire.

## 🧩 Prérequis
Tu dois savoir manipuler un tableau de données — charger, inspecter, filtrer, transformer
(`/doc/lessons/pandas-data-wrangling`) — et connaître les types de base et la notion de
donnée tabulaire (lignes/colonnes). La distinction feature/target et l'idée de fuite de
données (`/doc/lessons/feature-engineering`) éclairent pourquoi certaines corrections doivent
attendre APRÈS le split. Aucune bibliothèque particulière n'est supposée : on raisonne sur les
décisions de qualité.

## 📖 Explication complète
Le nettoyage suit un ordre : **inspecter d'abord** (sinon on rate les vrais problèmes), puis traiter chaque défaut avec une décision justifiée.
- **Valeurs manquantes** : trois stratégies, choisies selon le CONTEXTE : supprimer les lignes (si rares et non biaisées), imputer (moyenne/médiane/valeur métier), ou garder et signaler (« inconnu »). Jamais par réflexe : pourquoi manquent-elles ? (le « pourquoi » change la bonne réponse.)
- **Doublons** : détecter (`duplicated`) et décider (vrai doublon à supprimer vs coïncidence légitime).
- **Formats** : dates, nombres avec virgules, casse, espaces — normaliser.
- **Aberrations (outliers)** : une valeur extrême est-elle une erreur (âge = 999) ou un vrai cas rare (un très gros client) ? On ne supprime pas sans comprendre.
Chaque décision se DOCUMENTE (un rapport avant/après), et rien ne se modifie SILENCIEUSEMENT. En production, ce nettoyage devient des **fonctions pures testables** (pas un notebook jetable).

**Le « pourquoi ça manque » a trois réponses, et elles n'appellent pas le même geste.** C'est la question la plus rentable du nettoyage, et la plus souvent sautée.
- La donnée manque **au hasard**, sans lien avec quoi que ce soit — un capteur qui saute une mesure, une case oubliée sans raison. C'est le cas confortable : imputer ou supprimer déforme peu.
- La donnée manque **pour une raison qu'on observe ailleurs** : les clients inscrits par l'application mobile n'ont pas de champ « fax », parce que le formulaire mobile ne le demande pas. Le manque s'explique par une AUTRE colonne. Imputer globalement mélange deux populations ; imputer par groupe respecte la structure.
- La donnée manque **à cause de sa propre valeur** : les très hauts revenus refusent de déclarer leur revenu. C'est le cas dangereux, et aucune imputation ne le répare — la médiane remplacera des revenus élevés par une valeur moyenne, et **effacera précisément le signal recherché**. Ici, la seule réponse honnête est de créer une colonne « revenu non déclaré » et de laisser le modèle en tirer ce qu'il peut.

Aucune de ces trois situations ne se distingue en regardant le nombre de manquants. Elles se distinguent en regardant **qui** manque — d'où « inspecter d'abord ».

**L'ordre par rapport au split, et pourquoi il n'est pas négociable.** Imputer avec la médiane calculée sur le jeu complet AVANT de séparer entraînement et test paraît anodin : c'est une médiane, elle bouge à peine. Mais cette médiane a été calculée en regardant les lignes de test. Une information venue du test est donc entrée dans les données d'entraînement — c'est la **fuite de données** (*leakage*).

La conséquence est vicieuse : le modèle obtient un meilleur score en test qu'il n'en obtiendra jamais en production, et **rien n'a l'air anormal**. Aucune erreur, aucun avertissement, juste un chiffre trop beau qu'on prend pour une réussite. La règle qui protège : on sépare d'abord, on calcule les statistiques de nettoyage (médiane, moyenne, catégories connues, bornes) **uniquement sur l'entraînement**, et on les APPLIQUE au test. Le test doit rester ce qu'il simule : des données qu'on n'a jamais vues.

## 🔧 Exemple simple
Une colonne « prix » contient `"1 200,50 €"` : il faut retirer l'espace, le €, remplacer la virgule par un point, convertir en nombre — sinon toute somme échoue.

## 🧭 Exemple guidé — 17 lignes sur 1 040, et 4,5 ans d'écart

On sous-estime toujours l'effet des données sales, parce qu'on les compte en pourcentage de
lignes. Voici pourquoi c'est la mauvaise unité.

> Les chiffres de cette section sont **exécutés** par
> `scripts/v70-verifications/nettoyage-donnees.py` : un jeu de 1 040 inscriptions avec six
> défauts injectés, et chaque contrôle réellement passé dessus.

### L'inventaire, avant toute correction

Premier réflexe : **ne rien corriger et tout compter.** On ne sait pas encore quoi faire des
défauts ; on sait déjà qu'il faut savoir combien il y en a.

| Contrôle | Lignes | Part |
|---|---:|---:|
| âge manquant | 82 | 7,9 % |
| âge = −1 (valeur sentinelle) | 12 | 1,2 % |
| âge = 999 (valeur sentinelle) | 5 | 0,5 % |
| âge hors de l'intervalle [0, 120] | 17 | 1,6 % |
| ville non normalisée (`"  lyon "`) | 31 | 3,0 % |
| lignes strictement dupliquées | 39 | 3,8 % |
| montant à zéro | 15 | 1,4 % |

Rien de dramatique à première vue : aucun défaut ne dépasse 8 % des lignes. Un rapport
d'ingénieur écrirait « données globalement propres ».

### L'âge moyen, selon ce qu'on fait de ces lignes

C'est la mesure qui change le regard. Le même jeu de données, cinq traitements :

| Traitement | Âge moyen |
|---|---:|
| moyenne brute, sentinelles incluses | **42,63 ans** |
| moyenne en ignorant seulement les valeurs manquantes | 42,63 ans |
| moyenne après `fillna(0)` | 39,27 ans |
| moyenne après remplacement des sentinelles par « inconnu » | **38,11 ans** |
| moyenne sur les lignes complètes et plausibles | 38,11 ans |

**42,63 contre 38,11 : quatre ans et demi d'écart**, provoqués par **17 lignes sur 1 040**,
soit 1,6 %.

Le mécanisme est arithmétique et vaut d'être posé : cinq valeurs à 999 pèsent, dans une
moyenne, autant que 130 personnes de 38 ans. Une valeur aberrante n'apporte pas une erreur
proportionnelle à sa fréquence, mais proportionnelle à son **écart**. C'est pourquoi compter
les lignes sales en pourcentage rassure à tort.

Enseignement : **le pourcentage de lignes sales ne dit rien de l'erreur sur les résultats.**
Seule la mesure de l'écart le dit — et elle demande de calculer la même chose deux fois.

### La deuxième ligne, et pourquoi elle est là

« Moyenne en ignorant seulement les valeurs manquantes » donne **exactement le même chiffre**
que la moyenne brute. Ce n'est pas une erreur de copie : pandas ignore déjà les `NaN` dans un
calcul de moyenne.

L'enseignement est ailleurs, et il est important : **`NaN` est le défaut le moins dangereux du
tableau.** Il est explicite, les outils le connaissent et le traitent, et il se compte. Les
valeurs dangereuses sont **−1** et **999** — parce qu'elles se font passer pour des données.

Une valeur sentinelle est une absence déguisée en présence. Personne n'a 999 ans ; quelqu'un a
un jour décidé que 999 voudrait dire « non renseigné », et cette convention s'est perdue en
route. C'est le défaut que ni `isna()` ni aucun outil générique ne peut trouver — il faut
**connaître le domaine** pour savoir qu'un âge de −1 est impossible.

D'où le contrôle qui les attrape tous les deux d'un coup : non pas « chercher −1 et 999 »,
mais **« vérifier que chaque valeur est dans son intervalle plausible »** — ligne 4 du tableau,
17 lignes, qui est exactement la somme de 12 et 5.

### `fillna(0)`, ou le troisième chiffre

39,27 ans. Ni la valeur brute, ni la valeur correcte : une troisième valeur, fausse
autrement.

Remplacer les âges manquants par zéro ajoute 82 nouveau-nés au jeu de données. Le résultat a
l'air propre — plus aucun `NaN`, tous les calculs passent —, et il est faux sans que rien ne le
signale.

**Un zéro n'est pas « inconnu ».** Zéro est une valeur, avec un sens métier : zéro euro de
commande, zéro produit en stock, zéro an. Remplacer une absence par une valeur, c'est
transformer un défaut visible en une erreur invisible — le pire échange possible.

Quand une imputation est nécessaire, la **médiane** est préférable à la moyenne (elle résiste
aux valeurs extrêmes), et l'on ajoute une colonne `age_impute` valant vrai ou faux, pour que
l'aval sache ce qui a été inventé.

### Le défaut le plus coûteux n'est pas dans les âges

Regardons l'effet sur une agrégation métier : le chiffre d'affaires par ville.

```
ville         avant     après nettoyage      écart
  lyon      2 294,18              0,00   −2 294,18
Lyon       25 222,80         26 708,33   +1 485,53
Nantes     25 350,47         24 876,02     −474,45
Paris      31 497,30         29 507,59   −1 989,71

total      84 364,75         81 091,94   −3 272,81  (−3,88 %)
```

Deux choses à voir.

**Une ville fantôme.** `"  lyon "` — avec ses espaces et sa minuscule — est une **quatrième
ville** pour la machine. Elle emportait 2 294 € qui n'apparaissaient dans aucune ligne « Lyon »
du rapport. Un directeur régional lisant ce tableau voit un chiffre d'affaires lyonnais
sous-estimé de près de 10 %, et rien ne l'avertit : sa ville est là, avec un montant plausible.

**Le total baisse de 3,88 %** après suppression des 39 doublons. Ce sont des ventes qui
n'existaient pas et qu'on aurait déclarées.

C'est ici que la leçon prend son sens professionnel : un défaut de données ne produit presque
jamais une erreur ; il produit un **chiffre plausible et faux**, qui circule dans un rapport,
puis dans une décision.

### La méthode, dans l'ordre

1. **Compter avant de corriger.** Chaque contrôle, son nombre, sa part. C'est le rapport
   « avant ».
2. **Distinguer absence et valeur.** `NaN` d'un côté, sentinelles de l'autre — et se rappeler
   que seules les secondes sont dangereuses.
3. **Poser des intervalles plausibles** issus du métier, pas de la statistique. Un âge est dans
   [0, 120] parce que c'est un âge, pas parce que trois écarts-types le disent.
4. **Normaliser les catégories** avant toute agrégation : espaces, casse, accents. Sinon les
   regroupements mentent.
5. **Mesurer l'écart sur les résultats**, pas sur les lignes. Calculer la même chose avant et
   après, et publier la différence.
6. **Documenter chaque décision** en une phrase : *« 17 âges hors intervalle mis à inconnu ;
   82 âges manquants conservés tels quels ; l'âge moyen publié passe de 42,63 à 38,11 »*.

Le point 6 est ce qui distingue un nettoyage d'une falsification. Toute transformation est
défendable ; aucune ne l'est **en silence**.

## 🤖 Exemple appliqué (IA / data / architecture)
Avant d'entraîner un modèle (mois 6), un nettoyage bâclé cause du leakage ou des biais. Dans un RAG, « nettoyer » veut dire retirer les débris d'extraction PDF (en-têtes, numéros de page) qui polluent les chunks. La qualité des données amont conditionne tout l'aval.

## ⚠️ Erreurs fréquentes
- Nettoyer sans inspecter (on corrige le mauvais problème).
- Imputer par la moyenne sur une distribution asymétrique.
- Supprimer des outliers sans comprendre (parfois ils sont l'information).
- Modifier silencieusement, sans rapport ni justification.

## 🚫 Anti-patterns
- Le nettoyage « à la main » dans un notebook non reproductible.
- « fillna(0) » partout par réflexe (un 0 n'est pas « inconnu »).

## ✍️ Mini-exercice
Sur un CSV sale : compte les manquants et doublons par colonne, corrige un format de date, et écris 3 lignes justifiant chaque décision.

## 🔥 Exercice plus difficile
Transforme ton nettoyage en fonctions pures Python (`load`, `validate`, `clean`, `report`) testées, produisant un rapport avant/après (complétude, doublons, aberrations).

## ✅ Correction

### La démarche

*Inspecter → décider selon le contexte → documenter → rendre reproductible.* Les deux derniers
temps sont ceux qu'on saute, et ce sont ceux qui font la différence entre un nettoyage et une
altération non tracée.

### Les quatre fonctions, et pourquoi ce découpage

L'exercice impose `load`, `validate`, `clean`, `report`. Ce n'est pas une convention
esthétique : chacune a une **propriété** différente.

| Fonction | Ce qu'elle fait | Propriété |
|---|---|---|
| `load` | lit la source, ne transforme rien | la seule à toucher le monde extérieur |
| `validate` | **compte** les défauts, ne corrige rien | pure, et ne modifie pas ses entrées |
| `clean` | applique les décisions | pure : mêmes entrées → mêmes sorties |
| `report` | compare l'avant et l'après | pure, produit le document |

La séparation `validate` / `clean` est celle qui compte. Elles sont souvent écrites ensemble —
« je détecte les âges aberrants et je les corrige au passage » — et cette fusion supprime le
rapport « avant ». On perd alors la seule chose qui permet de dire ce que le nettoyage a
changé.

Une fonction **pure** — même entrée, même sortie, aucun effet de bord — a ici un bénéfice
concret : elle se teste sans fichier et se rejoue à l'identique. C'est ce qui répond au critère
« le pipeline se relance à l'identique ».

### Ce que le rapport doit contenir

Un rapport avant/après utile tient en trois blocs :

```
COMPLÉTUDE          avant      après
  age               92,1 %    92,1 %     (aucune imputation : conservés en NaN)
  ville            100,0 %   100,0 %
DOUBLONS
  lignes exactes        39         0     (supprimées)
ABERRATIONS
  age hors [0,120]      17         0     (remplacées par NaN, non imputées)
IMPACT SUR LES RÉSULTATS
  âge moyen         42,63     38,11     (−4,52 ans)
  CA total       84 364,75 81 091,94     (−3,88 %)
```

Le troisième bloc est celui que personne n'écrit, et c'est le seul qui intéresse la personne
qui utilisera les données. Les deux premiers décrivent le nettoyage ; le troisième décrit **ce
que le nettoyage change à ce qu'on croyait savoir**.

Et il a une vertu politique : présenter « le chiffre d'affaires baisse de 3,88 % après
correction » est une conversation difficile, mais elle a lieu **maintenant**, avec l'explication
sous la main, plutôt que dans six mois quand quelqu'un s'apercevra que deux rapports ne
concordent pas.

### Chaque transformation, justifiable en une phrase

Le critère se vérifie littéralement : écris la phrase, à côté de la ligne de code.

```python
# 39 lignes strictement identiques : doublons d'import du 12/02, confirmés
# par l'équipe intégration. Supprimées.
df = df.drop_duplicates()

# 17 âges hors [0,120] : sentinelles -1 et 999 de l'ancien formulaire.
# Remplacés par NaN — PAS imputés : on ne sait pas ce qu'ils valaient.
df["age"] = df["age"].where(df["age"].between(0, 120))

# Casse et espaces sur 'ville' : 31 lignes. Normalisées, sinon l'agrégation
# par ville crée une catégorie fantôme.
df["ville"] = df["ville"].str.strip().str.title()
```

Une transformation dont la phrase commence par « par sécurité » ou « pour que ça marche » est
une transformation qu'on ne comprend pas. Il vaut mieux laisser la donnée sale et la signaler
que la corriger sans savoir.

### La décision la plus fréquente : que faire des manquants

Il n'y a pas de bonne réponse générale, seulement une bonne question — **pourquoi manque-t-elle ?**

| Cause de l'absence | Décision raisonnable |
|---|---|
| aléatoire, peu nombreuse | imputer par la médiane, et marquer l'imputation |
| concentrée sur un groupe (un formulaire sans le champ) | **ne pas imputer globalement** : ce serait inventer une valeur pour un groupe entier |
| l'absence a un sens métier (« pas encore livré ») | ce n'est pas un manquant : c'est une valeur, à modéliser comme telle |
| trop nombreuse (> 40 % d'une colonne) | envisager de **retirer la colonne** — l'imputer, c'est fabriquer la colonne |

La deuxième ligne est le piège classique. Si les âges manquants viennent tous des inscriptions
mobiles, imputer par la médiane globale attribue à tous les utilisateurs mobiles l'âge médian
des utilisateurs de bureau — et l'on conclut ensuite que les deux populations ont le même âge.
Le nettoyage a fabriqué le résultat.

Le contrôle qui l'attrape : **croiser l'absence avec les autres colonnes.**

```python
df.groupby("canal")["age"].apply(lambda s: s.isna().mean())
```

Si le taux d'absence varie fortement d'un groupe à l'autre, l'absence n'est pas aléatoire, et
l'imputation globale est exclue.

### La mauvaise solution plausible

Le notebook. On charge, on nettoie cellule après cellule, on regarde, on corrige, on
réexécute la cellule 12 puis la 7, et le résultat final est juste.

Deux problèmes, et ils apparaissent toujours ensemble :

1. **Il n'est pas reproductible.** L'état obtenu dépend de l'ordre dans lequel les cellules ont
   été exécutées. Relancer le notebook du haut vers le bas donne souvent un autre résultat — et
   personne ne sait lequel des deux a produit le rapport livré ;
2. **Il n'est pas rejouable sur de nouvelles données.** Le mois suivant, on recommence à la
   main, et les décisions ne sont pas exactement les mêmes.

Le notebook est un excellent outil d'**exploration** : c'est là qu'on découvre les 999 et la
ville fantôme. Il est un mauvais outil de **production**. La transition est simple et ce sont
les quatre fonctions de l'exercice : ce qu'on a compris dans le notebook devient du code testé,
rejouable et versionné.

### Auto-évaluation

| Vérification | Comment |
|---|---|
| rien n'est modifié en silence | chaque transformation a sa phrase et son compte |
| l'impact est mesuré | le rapport donne l'écart sur au moins deux résultats métier |
| reproductible | relance le pipeline deux fois : sorties identiques, octet pour octet |
| absences examinées | tu peux dire **pourquoi** elles manquent, pas seulement combien |
| catégories normalisées | `df["ville"].value_counts()` ne montre aucune quasi-doublure |
| pas d'imputation aveugle | aucune colonne imputée sans marqueur d'imputation |

L'avant-dernière ligne est le contrôle le plus rentable de toute la leçon : afficher les valeurs
distinctes d'une colonne catégorielle prend cinq secondes et révèle la moitié des défauts de
saisie d'un jeu de données.

### Généralisation

Le principe transposable : **une donnée fausse ne se manifeste pas comme une erreur, mais comme
un résultat plausible.** Un fichier corrompu se voit ; un âge à 999 ne se voit pas — il se
contente de déplacer une moyenne de quatre ans, dans un rapport que personne ne recalculera.

D'où la seule protection réelle, qui n'est pas technique : **calculer la même chose de deux
façons et comparer.** Avant/après nettoyage, deux sources, deux méthodes d'agrégation. C'est le
même raisonnement que le contrôle de cohérence d'un comptable, et c'est ce qui transforme un
traitement de données en un travail dont on peut répondre.

## 🎤 Questions d'entretien
- « Comment nettoierais-tu ce CSV pourri ? » → Inspecter d'abord, puis traiter manquants/doublons/formats/aberrations avec des décisions justifiées et documentées.
- « Moyenne ou médiane pour imputer ? » → Médiane si distribution asymétrique (robuste aux extrêmes).
- « Faut-il supprimer les outliers ? » → Seulement après avoir compris s'ils sont des erreurs ou de vrais cas rares.

## 🧾 À retenir
- Inspecter avant de nettoyer ; documenter chaque décision.
- Le « pourquoi ça manque » détermine la bonne stratégie.
- Nettoyage = fonctions pures reproductibles, pas un notebook jetable.

## 📚 Vocabulaire
**valeur manquante (NaN)** · **imputation** · **doublon** · **outlier** · **normalisation de format** · **data quality** · **rapport avant/après** · **reproductibilité**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'inspecte systématiquement avant de nettoyer.
- [ ] Je justifie chaque décision de nettoyage.
- [ ] Mon nettoyage est reproductible et testé.

## 🔗 Liens avec le programme
Mois 5 (jours ~125-150), projet 4 (DataPulse). Leçons liées : `pandas-data-wrangling`, `etl-pipelines`, `statistics-for-ml`.
