<!-- keep -->
# Leçon — Stratégies de chunking

## 🌍 Le problème d'abord
Pour qu'un RAG retrouve les bons passages, il faut d'abord DÉCOUPER tes documents en morceaux.
Ça paraît anodin — « je coupe tous les 1000 caractères » — mais c'est souvent LE facteur qui
fait qu'un RAG marche ou pas. Coupe trop gros, et chaque morceau récupéré est noyé de bruit
autour de l'info utile ; coupe trop petit, et une idée se retrouve tranchée en deux, illisible.
Pire : couper au milieu d'une phrase peut rendre un passage introuvable. Ces morceaux
s'appellent des **chunks**, et la façon de les découper — le **chunking** — est le premier
levier de qualité d'un RAG. Cette leçon t'apprend à choisir une stratégie par la mesure, pas au
hasard.

## 🎯 Objectif
Comprendre pourquoi et comment découper des documents en morceaux (chunks) pour un RAG, les trade-offs taille/structure/overlap, et comment CHOISIR une stratégie par la mesure plutôt qu'au feeling. Le chunking est souvent le premier levier de qualité d'un RAG.

## 🧠 Modèle mental
Un chunk est **l'unité que ton système récupère et montre au modèle**. Trop gros : du bruit noie l'info et le retrieval devient flou. Trop petit : le sens se fragmente et le contexte manque. Le bon chunk = **une idée complète, autonome, retrouvable**.

## 🧩 Prérequis
Tu dois comprendre le pipeline RAG dans son ensemble — pourquoi on découpe et on récupère des
extraits (`/doc/lessons/rag-fundamentals`) — et ce qu'est un embedding, puisque chaque chunk
sera vectorisé (`/doc/lessons/embeddings`). Aucune bibliothèque particulière n'est supposée :
le chunking se raisonne d'abord sur le texte brut.

## 📖 Explication complète

**Pourquoi on découpe, exactement.** Un LLM ne lit qu'une quantité limitée de texte à la fois,
et on ne lui envoie de toute façon que quelques passages : les 10 000 documents restent dans la
base. Le découpage décide donc de l'UNITÉ que le système est capable de retrouver et de
montrer. Un chunk est ce qu'on récupère en entier ou pas du tout — il n'y a pas de demi-chunk.
Tout le reste découle de cette contrainte.

**Le double effet de la taille, dans les deux sens.** Un chunk trop GROS contient la réponse,
mais noyée : le vecteur qui le représente est la moyenne de plusieurs idées, il ne pointe
franchement vers aucune, et la question s'en rapproche mal. Une fois récupéré, il occupe la
place de deux autres passages et dilue l'attention du modèle. Un chunk trop PETIT pointe très
précisément, mais peut être privé de ce qui le rend compréhensible — un « Il doit alors
notifier le locataire sous 15 jours » sans le paragraphe qui dit de qui et de quoi on parle.
Le bon chunk est donc celui qui reste **autonome** : lu seul, il se comprend seul.

**L'overlap répare une frontière arbitraire.** Découper tous les 500 caractères coupe
forcément quelque part, et parfois au milieu de la phrase qui portait la réponse. Le
chevauchement — répéter les 100 derniers caractères du chunk précédent au début du suivant —
garantit qu'une idée à cheval sur une frontière se retrouve ENTIÈRE dans au moins un des deux.
On paie ce filet en volume stocké : 20 % d'overlap, c'est environ 20 % de vecteurs en plus.

**Trois stratégies, et ce qui les départage.**
- **Taille fixe + overlap** : on avance par pas de (taille − overlap). Simple, robuste, marche
  sur n'importe quel texte, ignore complètement le sens. Bon défaut.
- **Par structure** : on suit les titres, sections ou paragraphes du document. Un chunk devient
  « Article 4 — Préavis » au lieu de « …fin du paragraphe 3 + début du 5 ». Sur de la
  documentation technique ou juridique, c'est presque toujours meilleur, pour une raison
  simple : l'auteur a DÉJÀ fait le travail de regrouper une idée par section.
- **Par phrases ou par sens** : on regroupe des phrases voisines tant qu'elles se ressemblent.
  Plus fin, plus coûteux (il faut embedder pour décider), utile sur du texte sans structure.

**Les métadonnées voyagent avec le morceau.** Chaque chunk garde d'où il vient : fichier, page,
section. Sans elles, impossible de filtrer (« cherche seulement dans les contrats de 2024 ») et
impossible de citer — donc impossible de vérifier une réponse. C'est le champ le plus souvent
oublié et le plus difficile à rajouter après coup.

**Aucune taille n'est bonne dans l'absolu.** Elle dépend de tes documents et de tes questions.
La seule façon honnête de choisir est de mesurer le **rappel@k** : pour un jeu de questions
dont tu connais déjà le bon passage, dans quelle proportion ce passage figure-t-il parmi les k
morceaux remontés ? Trois questions sur quatre donnent 0,75. On compare deux ou trois
stratégies sur LE MÊME jeu, et le gagnant est celui qui a le meilleur nombre — pas celui qui
paraît le plus élégant. Ce jeu de questions à réponse connue s'appelle un **golden set** ;
`/doc/lessons/rag-evaluation` explique comment le construire pour qu'il soit exigeant.

## 🔎 Décomposition
- « Quelle unité mon système peut-il retrouver ? » → le chunk, entier ou pas du tout.
- « Pourquoi ma réponse est-elle noyée ? » → chunks trop gros, vecteur moyenné.
- « Pourquoi ce passage est-il incompréhensible ? » → chunk trop petit, contexte coupé.
- « Pourquoi cet overlap ? » → parce que la frontière est arbitraire et coupe parfois mal.
- « Comment je tranche entre deux stratégies ? » → rappel@k sur le même golden set.

## 🔧 Exemple simple
Un contrat de 12 pages découpé par « article » donne des chunks autonomes (« Article 4 — Préavis… »), bien plus utiles que des tranches de 500 caractères qui coupent au milieu d'une phrase.

## 🧭 Exemple guidé
On lit partout « découpez en morceaux de 500 caractères avec 100 de recouvrement ». D'où
sortent ces nombres ? De nulle part — ce sont ceux du premier tutoriel, recopiés depuis.

Le découpage n'est pourtant pas un réglage esthétique : c'est un **arbitrage chiffrable**
entre trois quantités qui s'opposent. Calculons-les.

> Tous les nombres de cette section sont **calculés** par
> `scripts/v70-verifications/rag-chunking-et-metriques.py`, sur un document de **12 000 mots**.

### Les trois quantités qui s'opposent

| Quantité | Ce qui l'améliore | Ce que ça coûte |
|---|---|---|
| **précision du contexte** — la part du morceau réellement utile | des morceaux **petits** | plus de morceaux, plus de coupures |
| **intégrité du sens** — une idée n'est pas coupée en deux | des morceaux **grands**, du recouvrement | du stockage, du contexte inutile |
| **coût** — stockage, vectorisation, jetons envoyés au modèle | des morceaux grands, **sans** recouvrement | les deux autres se dégradent |

Aucun réglage ne maximise les trois. C'est la définition d'un compromis, et c'est pourquoi
« la bonne taille de morceau » n'existe pas dans l'absolu.

### Ce que coûte le recouvrement, exactement

| Taille | Recouvrement | Morceaux | Mots stockés | Surcoût |
|---:|---:|---:|---:|---:|
| 200 | 0 | 60 | 12 000 | 0 % |
| 200 | 20 (10 %) | 67 | 13 400 | **+12 %** |
| 200 | 50 (25 %) | 80 | 16 000 | **+33 %** |
| 800 | 0 | 15 | 12 000 | 0 % |
| 800 | 80 (10 %) | 17 | 13 600 | +13 % |
| 800 | 200 (25 %) | 20 | 16 000 | **+33 %** |
| 1600 | 400 (25 %) | 10 | 16 000 | +33 % |

Premier fait, et il est net : **le surcoût du recouvrement ne dépend que de son pourcentage,
pas de la taille des morceaux.** Un recouvrement de 25 % coûte 33 % de stockage
supplémentaire, que les morceaux fassent 200 ou 1 600 mots.

Ce chiffre se multiplie ensuite par tout ce qui suit : 33 % de vecteurs en plus à calculer,
33 % de mémoire en plus dans l'index, 33 % de coût de vectorisation. Sur un corpus de dix
millions de mots, ce n'est plus un détail — c'est une ligne budgétaire.

D'où la première question à poser avant de choisir : **qu'est-ce que ce recouvrement achète ?**

### Ce que le recouvrement achète

Une phrase de 30 mots tombe à cheval sur une frontière avec une probabilité d'environ
`30 / pas`, où le pas vaut `taille − recouvrement`.

| Taille | Recouvrement | Pas | Phrases coupées | Morceaux |
|---:|---:|---:|---:|---:|
| 200 | 0 | 200 | **15,0 %** | 60 |
| 400 | 40 | 360 | 8,3 % | 34 |
| 800 | 200 | 600 | 5,0 % | 20 |
| 1600 | 400 | 1200 | **2,5 %** | 10 |

Quinze pour cent des phrases coupées avec des morceaux de 200 mots sans recouvrement. C'est
énorme : une phrase sur sept est amputée, et si c'est celle qui contient la réponse, aucun
système de recherche ne pourra la retrouver entière.

Mais regarde bien la colonne « pas » : **c'est elle qui gouverne le taux de coupure, pas le
recouvrement.** Un morceau de 1 600 mots sans recouvrement a un pas de 1 600 et coupe 1,9 %
des phrases — mieux qu'un morceau de 200 avec 25 % de recouvrement, et sans surcoût de
stockage.

Conclusion contre-intuitive, et elle vaut d'être retenue : **agrandir les morceaux réduit les
coupures plus efficacement que le recouvrement.** Le recouvrement ne se justifie vraiment que
lorsqu'on veut des morceaux petits — pour la précision du contexte — tout en limitant la casse.

### La réponse qui rend une partie de ce calcul inutile

Tout ce qui précède suppose qu'on coupe **à l'aveugle**, tous les N mots. Or les documents ont
une structure : des paragraphes, des titres, des sections, des cellules de tableau.

```python
# ❌ coupe où ça tombe
morceaux = [texte[i:i+800] for i in range(0, len(texte), 600)]

# ✅ coupe où le document se coupe déjà
morceaux = decouper_aux_titres(texte, niveau_max=2)      # ## et ###
# puis, seulement pour les sections trop longues, subdiviser aux paragraphes
```

Un découpage structurel ramène le taux de phrases coupées **près de zéro**, sans aucun
recouvrement — parce qu'il ne coupe jamais au milieu d'une phrase, par construction. Son
inconvénient est la variabilité : les sections font 80 mots ou 3 000 selon le document, ce qui
complique la budgétisation du contexte.

La combinaison qu'emploient la plupart des systèmes sérieux : **structurel d'abord, taille fixe
en repli** pour les sections trop longues.

### Ce qui se perd toujours, et la vraie parade

Quel que soit le découpage, un morceau extrait de son document perd son contexte. « Le taux
est de 3,5 % » ne veut rien dire sans savoir de quel contrat il s'agit.

La parade ne coûte presque rien et change tout : **conserver des métadonnées avec chaque
morceau** — titre du document, chemin des sections parentes, date, version — et les préfixer au
texte au moment de le donner au modèle.

```
[Contrat de prêt 2024-118 > Section 3 > Taux applicables]
Le taux est de 3,5 % pour les échéances postérieures à…
```

Cette ligne de contexte améliore à la fois la recherche (le vecteur contient le sujet) et la
génération (le modèle sait de quoi il parle). C'est le meilleur rapport effort/résultat de
toute la chaîne, et c'est presque toujours ce qui manque dans un premier système.

### Comment décider, pour de bon

On ne choisit pas une taille de morceau : **on la mesure**. La leçon
`/doc/lessons/rag-evaluation` donne l'outil — un jeu de questions dont on connaît la réponse,
et le rappel@k comme critère.

La démarche : trois découpages candidats, le **même** jeu de questions pour les trois, et l'on
retient celui qui obtient le meilleur rappel@5 à coût acceptable. Trois heures de travail, et
la question « quelle taille ? » cesse définitivement d'être une affaire de goût.


## 🤖 Exemple appliqué (IA / data / architecture)
Dans DocSense, on compare (mesuré sur un golden set) le chunking par taille fixe vs par structure Markdown sur 10 questions : « le passage qui contient la réponse est-il dans le top-3 ? ». La stratégie gagnante est adoptée, chiffres à l'appui — c'est exactement ce qui distingue un RAG d'ingénieur d'un RAG de démo.

## ⚠️ Erreurs fréquentes

**Le chunker que tout le monde écrit d'abord, et ce qu'il produit.** Il a l'air juste :

```python
# ❌ FAUX : l'overlap est déclaré mais jamais appliqué.
def chunker(texte, taille=500, overlap=100):
    morceaux = []
    i = 0
    while i < len(texte):
        morceaux.append(texte[i:i + taille])
        i += taille              # ← on avance de 500, pas de 400
    return morceaux
```

La variable `overlap` existe, le paramètre est documenté, la fonction rend des morceaux : rien
ne signale l'erreur. Sur le texte « …le bailleur doit notifier le locataire sous 15 jours… »,
si la frontière tombe entre « sous 15 » et « jours », la phrase n'existe ENTIÈRE dans aucun
chunk. Aucune requête ne la retrouvera jamais, et le rappel@k baissera sans qu'on sache
pourquoi.

```python
# ✅ JUSTE : on avance du pas, pas de la taille.
def chunker(texte, taille=500, overlap=100):
    morceaux = []
    pas = taille - overlap       # 400
    i = 0
    while i < len(texte):
        morceaux.append(texte[i:i + taille])
        i += pas
    return morceaux
```

Le test qui l'attrape tient en une ligne : deux morceaux consécutifs doivent partager du
texte. `assert morceaux[0][-overlap:] == morceaux[1][:overlap]`.

Les autres :
- Ne jamais LIRE ses propres chunks. Une extraction de PDF produit des en-têtes répétés, des
  numéros de page au milieu des phrases, des tableaux transformés en bouillie. Cinq minutes de
  lecture révèlent ce que des heures de réglage ne trouveront pas.
- Une taille unique pour des documents de natures différentes.
- Ignorer les métadonnées, donc perdre toute possibilité de filtrer et de citer.

## 🚫 Anti-patterns
- Choisir la taille au hasard et ne jamais la mesurer.
- Chunks énormes « pour ne rien rater » → le retrieval ramène du bruit, la génération se noie.

## ✍️ Mini-exercice
Implémente un chunker taille-fixe + overlap, applique-le à un vrai document d'au moins
dix pages, et **lis les cinq premiers chunks en entier**. Contraintes imposées, pour que
le résultat soit comparable au tien plus tard : **512 caractères, 64 de recouvrement**,
découpe au caractère et pas au mot — c'est le réglage naïf, et c'est celui qu'on veut voir
échouer.

**Livrable** : les cinq chunks copiés tels quels, et sous chacun une ligne disant ce qui a
été cassé (phrase coupée, tableau tronqué, titre séparé de son paragraphe, rien).

**Critère de réussite, vérifiable seul** : sur cinq chunks, **au moins deux doivent porter
un défaut visible**. Si tu n'en trouves aucun, ce n'est pas que le chunker est bon — c'est
que ton document est trop homogène pour être un test (du texte courant sans titres ni
tableaux). Reprends avec un document qui contient au moins un tableau et une liste.

## 🔥 Exercice plus difficile
Implémente un chunker par structure (découpe aux titres Markdown) et compare-le au taille-fixe sur 10 questions : pour chacune, le bon passage est-il dans le top-3 ? Conclus par les chiffres.

## ✅ Correction attendue
### La démarche

Le découpage ne se juge pas à l'œil. Il sert la **recherche** — donc il s'évalue par la
recherche, avec le rappel@k mesuré sur un jeu de questions dont on connaît les réponses.

Formulé autrement : la question « ce découpage est-il bon ? » n'a pas de sens. La question qui
en a est : **« sur mes questions, ce découpage retrouve-t-il plus souvent le bon passage que
l'autre ? »**

### Ce que la lecture de cinq morceaux apprend malgré tout

Le mini-exercice demande de **lire** cinq morceaux avant toute mesure, et cette étape n'est pas
décorative : elle révèle des défauts qu'aucune métrique ne montre.

Ce que tu vas trouver, dans l'ordre de fréquence :

| Ce que tu vois | Ce que ça signifie |
|---|---|
| une phrase amputée en début ou fin de morceau | le pas est trop grand par rapport aux phrases — voir le tableau de l'exemple guidé |
| un tableau coupé en deux, colonnes orphelines | le découpage à l'aveugle ignore les blocs indivisibles |
| un morceau qui commence par « Il » ou « Celui-ci » | le référent est dans le morceau précédent : le morceau est incompréhensible seul |
| un en-tête ou un pied de page répété partout | des débris d'extraction qui polluent tous les vecteurs |
| un morceau entièrement composé d'une table des matières | il sera retrouvé pour toutes les questions, et n'aidera jamais |

Les deux derniers sont les plus coûteux et les plus faciles à corriger : ils relèvent du
nettoyage du texte **avant** découpage, pas du découpage. Un en-tête répété sur 400 pages crée
400 vecteurs presque identiques, qui remontent en tête pour n'importe quelle question et
occupent la place des vrais résultats.

Le troisième — le morceau qui commence par un pronom — est la démonstration concrète que le
contexte se perd. C'est exactement ce que les métadonnées préfixées corrigent.

### La comparaison, et la faute qui l'invalide

Le critère central : **les deux découpages doivent être comparés sur exactement les mêmes
questions.** Changer de questions entre deux mesures rend la comparaison vide, et c'est une
faute qu'on commet sans s'en rendre compte — on ajoute deux questions « pour mieux tester »
entre les deux essais.

Le protocole minimal :

```
1. Écrire 10 à 15 questions AVANT de découper quoi que ce soit, et noter pour chacune
   le passage du document qui contient la réponse.
2. Découpage A → indexer → mesurer le rappel@5 sur les 15 questions.
3. Découpage B → indexer → mesurer le rappel@5 sur LES MÊMES 15 questions.
4. Comparer. Regarder les questions où A gagne et où B gagne : elles sont différentes,
   et c'est là qu'est l'information.
```

Le point 4 est ce qui distingue une mesure d'un classement. Si le découpage structurel gagne
sur 11 questions et perd sur 4, regarde ces quatre-là : elles ont souvent un point commun —
une réponse répartie sur deux sections, un tableau, une définition isolée — et ce point commun
te dit quoi améliorer.

### Vérifier que le recouvrement fait ce qu'on croit

Contrôle en une ligne, et il attrape une erreur d'implémentation très courante :

```python
assert morceaux[0][-recouvrement:] == morceaux[1][:recouvrement], "le recouvrement ne recouvre rien"
```

L'erreur classique est d'avancer de `taille` au lieu de `taille - recouvrement` : le découpage
fonctionne, produit le bon nombre de morceaux à peu près, et **le recouvrement est nul**. On
paie alors le raisonnement sans le bénéfice — et, plus vicieux, on paie parfois le stockage
sans le bénéfice, si le nombre de morceaux a été calculé avec le bon pas.

Deuxième contrôle, sur les métadonnées :

```python
assert all(m.get("source") and m.get("section") for m in morceaux)
```

Un morceau sans métadonnées est un morceau qu'on ne pourra ni citer, ni filtrer, ni situer. Et
la citation de la source est ce qui rend une réponse vérifiable par l'utilisateur — c'est-à-dire
la seule chose qui distingue un système utilisable d'un générateur d'affirmations.

### La mauvaise solution plausible

Régler la taille des morceaux en regardant la qualité des **réponses finales** du système.

C'est le réflexe naturel — c'est la sortie qui compte — et il rend le diagnostic impossible.
Une mauvaise réponse peut venir du découpage, de la recherche, du reclassement, du prompt ou
du modèle. En jugeant sur la sortie, on change un maillon et l'on observe une variation qui
peut venir de n'importe lequel des cinq.

La règle, développée dans `/doc/lessons/rag-evaluation` : **mesurer chaque étage séparément.**
Le découpage et la recherche se mesurent par le rappel@k, indépendamment de toute génération —
et cette mesure est stable, reproductible et gratuite, contrairement à un jugement sur des
réponses.

### Généralisation

Ce que cette leçon installe dépasse le RAG : **un paramètre qu'on ne mesure pas est un
paramètre qu'on a copié.** 500 caractères, 100 de recouvrement, top-5, température 0,7 : ces
valeurs circulent d'un projet à l'autre sans que personne ne les ait jamais confrontées à ses
propres données.

Le geste professionnel n'est pas de connaître les bonnes valeurs — elles dépendent du corpus.
C'est de savoir **construire la mesure qui les départage**, et d'accepter d'y passer trois
heures avant de régler quoi que ce soit.


## 🎤 Questions d'entretien
- « Comment choisis-tu la taille des chunks et l'overlap ? » → Par la mesure (rappel@k) sur un golden set, selon les documents ; overlap pour ne pas couper une idée.
- « Taille fixe ou par structure ? » → La structure gagne souvent sur la doc technique ; à mesurer.
- « Pourquoi garder des métadonnées par chunk ? » → Filtrage et citations vérifiables.

## 🧾 À retenir
- Un chunk = une idée complète et retrouvable ; ni trop gros ni trop petit.
- Overlap pour ne pas couper les idées ; structure > taille fixe sur la doc technique.
- Le chunking se CHOISIT par la mesure, pas au feeling.

## 📚 Vocabulaire
**chunk** · **overlap / chevauchement** · **chunking par structure** · **métadonnées** ·
**rappel@k** · **golden set**. Tous définis dans le corps de la leçon, à l'endroit où ils
servent.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais implémenter un chunker taille-fixe + overlap et un par structure.
- [ ] J'évalue une stratégie de chunking par le rappel@k, pas à l'œil.
- [ ] Mes chunks portent leurs métadonnées.

## 🔗 Liens avec le programme
Mois 8-9 (jours ~225-255), projets 6 et final. Leçons liées : `rag-fundamentals`, `embeddings`, `ai-evaluation`.
