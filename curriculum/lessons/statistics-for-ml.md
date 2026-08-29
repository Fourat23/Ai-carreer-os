<!-- keep -->
# Leçon — Statistiques pour le ML

## 🌍 Le problème d'abord
On t'annonce « le salaire moyen de l'équipe est de 60 000 € » — mais personne autour de toi
ne gagne ça : une seule personne gagne 300 000 € et tire la moyenne vers le haut. Ce chiffre
unique MENT sur la réalité. Autre piège : « les ventes ont augmenté après la campagne, donc
la campagne marche » — vraiment, ou est-ce simplement l'été ? Les **statistiques** sont
l'outil pour raisonner honnêtement sur des données : résumer sans mentir, repérer les pièges,
et ne pas confondre coïncidence et cause. Sans elles, le machine learning devient une boîte
noire qu'on utilise en priant. Cette leçon te donne le kit minimal mais solide pour ne plus
te faire avoir par un chiffre.

## 🎯 Objectif
Savoir **résumer honnêtement** des données (tendance, dispersion, distribution), distinguer
**corrélation et causalité**, interroger la **représentativité** d'un échantillon, et garder
l'**intuition de Bayes** — les réflexes qui fondent toute évaluation ML sérieuse.

## 🧩 Prérequis
Aucune mathématique avancée n'est requise : il faut seulement être à l'aise avec des chiffres
du quotidien (une moyenne, un pourcentage). Les notions (médiane, écart-type, distribution,
corrélation, Bayes) sont construites ici PAR L'INTUITION, sans formule imposée. Pour la
pratique, savoir manipuler des données en Python aide (`/doc/lessons/python-foundations`),
mais la compréhension de la leçon n'en dépend pas.

## 🧠 Modèle mental
Une donnée n'est jamais UN chiffre : c'est une DISTRIBUTION (une forme). Le premier réflexe
n'est donc pas « quelle est la moyenne ? » mais « à quoi ressemble la forme ? » — est-elle
symétrique, asymétrique, à deux bosses, avec des valeurs extrêmes ? Le bon résumé dépend de la
forme (médiane et percentiles pour l'asymétrique, moyenne pour le symétrique). Et devant deux
choses qui « bougent ensemble », la question n'est jamais « laquelle cause l'autre ? » mais
« se pourrait-il qu'une TROISIÈME chose cause les deux ? ».

## 💡 Pourquoi c'est important
Le ML sans statistiques, c'est utiliser une boîte noire en espérant que ça marche : tu ne sauras ni préparer les données, ni choisir une métrique, ni détecter que ton modèle ment. Les stats d'ici sont MINIMALES mais SOLIDES — le kit de survie pour raisonner honnêtement sur des données, repérer les pièges classiques, et répondre aux questions d'entretien (« pourquoi la moyenne est-elle trompeuse ici ? »).

## Explication complète

### Résumer des données : tendance et dispersion
- **Moyenne** : le centre de gravité — sensible aux valeurs extrêmes. UN milliardaire dans la pièce et le « salaire moyen » ment.
- **Médiane** : la valeur du milieu — robuste aux extrêmes. Pour tout ce qui est asymétrique (salaires, prix, latences), elle dit la vérité que la moyenne cache.
- **Écart-type / variance** : l'étalement autour du centre. Deux services à 40 k€ de moyenne, l'un serré (38-42), l'autre éclaté (20-60) : même moyenne, réalités opposées.

**Le réflexe n°1** : toujours REGARDER LA DISTRIBUTION (histogramme) avant de résumer par un chiffre. Bimodale ? Asymétrique ? Avec des aberrations ? Chaque forme invalide certains résumés.

### La distribution normale (et pourquoi on s'en soucie)
La « courbe en cloche » apparaît partout où de nombreux petits effets indépendants s'additionnent (tailles, erreurs de mesure). Ses propriétés (68 % à ±1 écart-type, 95 % à ±2) fondent beaucoup d'outils. MAIS beaucoup de données réelles ne sont PAS normales (revenus, popularité, latences — asymétriques à queue longue) : supposer la normalité sans vérifier est une erreur de débutant.

### Corrélation ≠ causalité (le piège roi)
Une **corrélation** (deux variables bougent ensemble) ne prouve JAMAIS une causalité. Trois explications rivales à toujours envisager : X cause Y ; Y cause X (sens inverse) ; Z cause les deux (**confondant** — les ventes de glaces et les noyades sont corrélées : l'été cause les deux). Devant « les ventes montent après la campagne, donc elle marche », le réflexe : saisonnalité ? tendance préexistante ? autre événement simultané ?

### Les biais d'échantillonnage
Un échantillon BIAISÉ produit des conclusions fausses avec une grande confiance : biais de sélection (sonder ses clients satisfaits), biais du survivant (étudier les avions revenus — l'exemple historique), données manquantes NON aléatoires (ceux qui ne répondent pas ont une raison). Question systématique : « qui est DANS ces données, et qui n'y est pas ? »

### Probabilités utiles
- **Conditionnelle** : P(A sachant B) ≠ P(B sachant A) — confusion à l'origine d'erreurs médicales et judiciaires célèbres.
- **L'intuition de Bayes** par l'exemple : maladie rare (1/1000), test fiable à 99 % → un test positif ne donne qu'environ 9 % de chance d'être malade (sur 1000 personnes : ~1 vrai positif, ~10 faux positifs). La PRÉVALENCE domine. Ce raisonnement exact expliquera pourquoi l'accuracy ment sur les classes déséquilibrées (mois 6).

## Concepts clés
Moyenne / médiane / mode · variance, écart-type · distribution, histogramme, boxplot · quantiles / percentiles (p95 de latence !) · aberration (outlier) · corrélation (et sa force) · confondant · biais de sélection / du survivant · probabilité conditionnelle · Bayes (l'intuition).

## 🧭 Exemple guidé

Ton tableau de bord affiche « latence moyenne : 121 ms ». Le service est réputé rapide,
personne ne s'en inquiète — et le support reçoit des plaintes. Voici les mêmes 10 000
requêtes, résumées autrement :

```
moyenne         121 ms
médiane (p50)    81 ms
p95             153 ms
p99             955 ms
maximum        1081 ms
```

**Décision 1 — pourquoi la moyenne ment-elle ici ?** Parce que la distribution a deux
bosses : 95 % des requêtes autour de 80 ms, 5 % autour de 900 ms. La moyenne calcule le
centre de gravité d'une population qui n'a pas de centre — aucune requête ne dure 121 ms.
La médiane (81 ms) décrit correctement le cas courant, la moyenne ne décrit rien. La règle
générale : **la moyenne n'est un bon résumé que d'une distribution à une seule bosse et à
peu près symétrique** ; avant de la citer, regarde l'histogramme, toujours.

**Décision 2 — quel percentile, et c'est un vrai piège.** Le réflexe enseigné est « prends
le p95 ». Regarde le tableau : le p95 vaut **153 ms**. Rassurant. Et faux — il passe juste
en dessous du groupe lent, parce que ce groupe fait exactement 5 % du total. Le p99, lui,
révèle les 955 ms. Retiens le mécanisme plutôt que le chiffre : **un percentile ne voit rien
au-delà de lui-même**. Choisir p95 quand 5 % des requêtes sont pathologiques revient à
placer le projecteur pile à la limite de la zone d'ombre. C'est pourquoi on regarde
plusieurs percentiles, et pourquoi les équipes sérieuses surveillent aussi p99,9.

**Décision 3 — 5 %, est-ce beaucoup ?** C'est la question qui tranche, et l'intuition se
trompe complètement. Un utilisateur ne fait pas une requête : une session en enchaîne des
dizaines. Probabilité d'en rencontrer **au moins une** lente :

```
 1 requête   →  5,0 %
 5 requêtes  → 22,6 %
10 requêtes  → 40,1 %
20 requêtes  → 64,2 %
50 requêtes  → 92,3 %
```

Un défaut qui touche 5 % des requêtes touche **92 % des utilisateurs** un peu actifs. Voilà
pourquoi le support a des plaintes que le tableau de bord ne montre pas : le tableau de bord
compte des requêtes, les plaintes viennent de personnes. **Choisis toujours consciemment
l'unité que tu mesures** — requête, session, utilisateur — parce qu'elle change les
conclusions plus sûrement que la statistique employée.

**Décision 4 — le piège de l'agrégation, qui vaut pour tout le reste de ta carrière.** Tu
compares deux modèles de réponse, A et B, sur 350 requêtes chacun. Par catégorie :

| | modèle A | modèle B |
|---|---|---|
| requêtes faciles | **93,1 %** (81/87) | 86,7 % (234/270) |
| requêtes dures | **73,0 %** (192/263) | 68,8 % (55/80) |
| **total** | 78,0 % (273/350) | **82,6 %** (289/350) |

Lis-le deux fois : **A est meilleur sur les faciles, meilleur sur les dures, et perd au
total.** Ce n'est pas une erreur de calcul, c'est le paradoxe de Simpson. L'explication tient
aux effectifs : B a été surtout évalué sur des requêtes faciles (270 sur 350), A surtout sur
des dures (263 sur 350). Le total ne compare pas les modèles, il compare deux mélanges
différents.

Ce cas n'a rien d'exotique — il apparaît dès que les groupes comparés n'ont pas la même
composition, ce qui est la situation normale des données réelles. La parade est un réflexe
simple : **avant d'accepter un chiffre agrégé, demande de quoi il est la moyenne, et
regarde-le par sous-groupe.** Si les sous-groupes disent l'inverse du total, c'est le total
qu'il faut jeter.

**Le lien avec la suite.** Ces quatre décisions sont exactement celles que tu prendras sur
ton tableau de bord de qualité RAG : ne pas résumer les scores par leur moyenne, regarder
la queue de distribution des mauvaises réponses, compter par question et non par document,
et se méfier d'un score global qui s'améliore pendant qu'une catégorie de questions se
dégrade.

## ⚠️ Erreurs fréquentes
- Résumer une distribution asymétrique par sa moyenne.
- Conclure une causalité d'une corrélation (sans chercher les confondants).
- Ignorer QUI manque dans l'échantillon.
- Comparer des taux sans regarder les effectifs (le paradoxe de Simpson : une tendance peut S'INVERSER en agrégeant des groupes — à connaître de nom).

## 🔗 Liens avec le programme
Le choix de métrique ML (mois 6) est une décision statistique : précision vs rappel = arbitrer les coûts d'erreurs, exactement le raisonnement de Bayes. L'évaluation RAG (mois 9) est de la statistique appliquée : un golden set est un ÉCHANTILLON (représentatif ?), un juge LLM a des BIAIS (mesurables par accord avec l'humain), une amélioration de +3 % sur 30 questions est-elle du signal ou du bruit ? Sans ces réflexes, on optimise du hasard.

## Mini-exercice
Sur les données de ton projet 4 : calcule moyenne ET médiane d'une variable asymétrique (constate l'écart et explique-le), trace son histogramme, trouve une corrélation entre deux variables et écris les TROIS explications possibles (X→Y, Y→X, Z→les deux) avec ton verdict argumenté.

## ✅ Correction attendue
**La démarche** : histogramme d'abord, résumé ensuite. Sur une variable asymétrique, moyenne > médiane, et l'écart entre les deux mesure la traîne — c'est un diagnostic de forme, pas une curiosité. Pour la corrélation, écrire les trois explications AVANT de choisir, puis argumenter.

**L'erreur probable, et elle a l'air d'une preuve.** Face à une corrélation forte, presque tout le monde écrit les trois hypothèses puis tranche ainsi : « X cause Y, parce que X arrive avant Y ». L'antériorité semble décisive — une cause précède son effet, c'est vrai. Mais c'est une condition **nécessaire**, jamais suffisante : un confondant saisonnier fait lui aussi monter X avant Y. Les ventes de maillots de bain précèdent les noyades ; elles ne les causent pas.

Le piège séduit parce que la chronologie est la seule chose qu'on peut vérifier dans les données dont on dispose, et qu'on prend « vérifiable » pour « suffisant ». Ce qui départage vraiment n'est pas dans les données : c'est une **intervention** (changer X et observer Y, toutes choses égales par ailleurs) ou, à défaut, un mécanisme plausible qu'on peut nommer. Un verdict honnête a le droit de conclure « je ne peux pas trancher avec ces données » — et c'est souvent la meilleure réponse.

**Reprends le calcul de Bayes toi-même**, c'est le seul endroit où poser les nombres vaut mieux qu'une intuition. Sur 1 000 personnes, maladie à 1/1000, test fiable à 99 % :

```
1 malade      → le test le détecte     → 1 vrai positif
999 sains     → 1 % se trompe          → ~10 faux positifs
Positifs au total : 11.  Réellement malades : 1 sur 11 ≈ 9 %.
```

Refais-le avec une prévalence de 1 sur 10 : tu obtiens ~92 %. **Même test, même fiabilité, conclusion opposée.** C'est la prévalence qui commande, et c'est exactement pourquoi l'accuracy s'effondre comme indicateur sur des classes déséquilibrées.

**Alternative défendable** au résumé médiane/écart-type : donner directement trois quantiles (p10, p50, p90). Moins conventionnel, mais on lit la forme sans avoir à supposer quoi que ce soit sur la distribution — c'est d'ailleurs ce que font les équipes qui surveillent des latences.

**Vérifie seul, sans corrigé** :
1. Ton histogramme et ton résumé racontent-ils la même histoire ? Si la moyenne tombe dans une zone où il n'y a presque aucune observation, ton résumé ment.
2. Pour ta corrélation : cite explicitement **un** confondant plausible, nommé. Si tu n'en trouves aucun, c'est en général que tu n'as pas cherché.
3. Refais le calcul de Bayes avec une prévalence de 1/10 et une autre de 1/10 000. Si les trois résultats ne te surprennent plus, l'intuition est acquise.
4. Sur ta variable asymétrique : retire les 1 % de valeurs les plus hautes et recalcule. La moyenne bouge beaucoup, la médiane à peine. Voir ce déplacement vaut mieux que lire « robuste aux extrêmes ».

## 🏢 Cas professionnel
Une équipe surveille son API sur la latence moyenne : 120 ms, stable, tableau de bord vert depuis des mois. Le support, lui, reçoit chaque semaine des plaintes de lenteur — jamais reproductibles. Les deux camps ont raison, et personne ne se comprend.

L'histogramme tranche : 95 % des requêtes répondent en 80 ms, 5 % en 900 ms. La moyenne, tirée vers le haut par la traîne et vers le bas par la masse, ne décrit **aucune** requête réelle. Surtout, ces 5 % ne sont pas 5 % des utilisateurs pris au hasard : une page qui déclenche vingt appels a près d'une chance sur deux d'en subir au moins un lent. La minorité des requêtes devient la majorité des sessions.

C'est la raison pour laquelle les engagements de service se rédigent en **percentiles** — p95, p99 — et jamais en moyennes. Et c'est transposable tel quel à l'évaluation d'un système RAG : un score moyen de 0,8 peut cacher un ensemble de questions systématiquement ratées. La moyenne est la première chose qu'on calcule et la dernière sur laquelle décider.

## 🎤 Questions d'entretien
- « Pourquoi la moyenne est-elle trompeuse ici ? » → Parce que la distribution est asymétrique : quelques valeurs extrêmes déplacent le centre de gravité vers une zone où il n'y a personne. Médiane et percentiles décrivent ce que vivent les gens.
- « Corrélation et causalité ? » → Une corrélation admet toujours trois lectures — X→Y, Y→X, ou un confondant Z. Seule une intervention, ou un mécanisme identifié, permet de trancher.
- « Ton modèle a 99 % d'accuracy, bonne nouvelle ? » → Pas avant de connaître la prévalence. Sur une classe à 1 %, prédire toujours « négatif » atteint 99 % sans rien apprendre.
- « Qu'est-ce que le biais du survivant ? » → Ne regarder que ce qui a subsisté : les avions revenus, les entreprises encore en vie, les clients qui n'ont pas résilié. Les absents portent l'information décisive.
- « Pourquoi mesurer en p95 plutôt qu'en moyenne ? » → Parce qu'un utilisateur ne vit pas une moyenne, il vit ses pires requêtes — et il en enchaîne plusieurs par page.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je regarde la forme avant de calculer un résumé.
- [ ] Devant une corrélation, je cherche un confondant avant de conclure quoi que ce soit.
- [ ] Je demande systématiquement qui est absent des données.
- [ ] Je sais expliquer, avec des effectifs et sans formule, pourquoi un test fiable à 99 % se trompe souvent.

## 📚 Vocabulaire
**distribution** · **médiane / quantile / p95** · **écart-type** · **outlier** · **corrélation** · **confondant** · **biais de sélection / du survivant** · **prévalence** · **probabilité conditionnelle** · **paradoxe de Simpson**.

## 🧾 À retenir
Regarde toujours la distribution avant de résumer ; préfère la médiane et les percentiles sur les données asymétriques ; ne confonds jamais corrélation et causalité (cherche les confondants) ; interroge la représentativité de tout échantillon ; et garde l'intuition de Bayes (la prévalence domine les tests). Ces cinq réflexes valent plus que des formules — ils sont le socle de toute évaluation honnête, du ML classique aux systèmes RAG.
