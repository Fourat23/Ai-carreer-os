<!-- keep -->
# Leçon — Retrieval, recherche hybride et reranking

## 🌍 Le problème d'abord
Ton RAG répond mal. Réflexe du débutant : « le modèle est nul, changeons de LLM ». Mais dans
la grande majorité des cas, le vrai coupable est AVANT le modèle : le bon passage n'a jamais
été retrouvé, donc le modèle ne pouvait pas répondre correctement — il n'avait pas la réponse
sous les yeux. La recherche sémantique pure (par **embeddings** : des listes de nombres où deux textes de sens proche sont proches) attrape le sens mais rate parfois
les termes EXACTS (un numéro de référence, un nom propre) ; à l'inverse, la recherche par
mots-clés rate les reformulations. Comment ramener FIABLEMENT le bon extrait ? Cette leçon
attaque le maillon faible de la plupart des RAG : le retrieval, sa version hybride, et le
reranking qui affine le tri.

## 🎯 Objectif
Comprendre pourquoi le retrieval est le maillon faible de la plupart des RAG, comment combiner recherche vectorielle et lexicale (hybride), et à quoi sert le reranking. Savoir mesurer chaque étage. C'est là que se gagne la qualité d'un RAG.

## 🧠 Modèle mental
Le retrieval, c'est **ramener les bons extraits AVANT de générer**. Si le bon passage n'est pas ramené, aucune magie de génération ne le sauvera. « Garbage in, garbage out » : la génération ne peut pas inventer ce que le retrieval n'a pas trouvé.

## 🧩 Prérequis
Tu dois comprendre les embeddings et la similarité sémantique (`/doc/lessons/embeddings`), le
pipeline RAG et la distinction retrieval/génération (`/doc/lessons/rag-fundamentals`), et le
rôle de l'index vectoriel (`/doc/lessons/vector-databases`). La notion de rappel@k, centrale
ici, est approfondie dans l'évaluation (`/doc/lessons/rag-evaluation`). Aucun moteur de
recherche particulier n'est supposé.

## 📖 Explication complète

**Deux façons de chercher, qui échouent sur des choses différentes.** La recherche
**vectorielle** compare des directions de sens : elle relie « congés » à « vacances » sans
qu'aucun mot ne soit partagé. Elle rate en revanche ce qui n'a pas de sens à proprement parler
— une référence `ART-4412`, un nom propre rare, un code d'erreur : ces chaînes n'ont pas de
voisinage sémantique, leur vecteur ne veut rien dire. La recherche **lexicale** (BM25, ou FTS5
dans SQLite) fait l'inverse : elle compte les mots partagés entre la question et le document,
en pondérant les mots rares plus fort que les mots courants. Elle trouve `ART-4412` sans
hésiter, et rate complètement une reformulation.

**Leurs échecs ne se recouvrent pas, et c'est tout l'intérêt.** Là où deux méthodes ratent les
mêmes cas, en combiner deux n'apporte rien. Ici, chacune couvre l'angle mort de l'autre : c'est
ce qui rend l'**hybride** rentable, et non un simple empilement.

**Comment on fusionne deux classements dont les scores ne sont pas comparables.** Un score
cosinus vaut entre 0 et 1 ; un score BM25 peut valoir 3, ou 47. Les additionner n'a aucun sens.
La **RRF** (*Reciprocal Rank Fusion*) contourne le problème en ignorant les scores et en ne
gardant que les RANGS : chaque document reçoit `1 / (60 + rang)` dans chaque liste, et on
additionne. Un document 1ᵉʳ en lexical et 30ᵉ en vectoriel obtient
`1/61 + 1/90 ≈ 0,027` ; un document 5ᵉ dans les deux obtient `2 × 1/65 ≈ 0,031` et passe
devant. La méthode récompense donc ce qui est **bien classé par les deux** plutôt que ce qui
est premier chez un seul. Le 60 est une constante d'usage : elle amortit l'écart entre les
premiers rangs.

**Le reranking, et pourquoi il vient en dernier.** Les deux recherches précédentes comparent la
question et le document SÉPARÉMENT — chacun a été transformé en nombres de son côté. Un
**cross-encoder** fait autre chose : il lit la question ET le passage ENSEMBLE, et juge la
pertinence de la paire. C'est nettement plus juste, et beaucoup plus cher : il faut un passage
du modèle par candidat, sans rien pouvoir précalculer. D'où l'ordre imposé : on récupère
large et vite (top-20 hybride), puis on réordonne finement ce petit lot pour n'en garder que
3 à 5. Reranker un million de documents n'est pas « lent » : c'est irréalisable.

**Chaque étage se mesure séparément.** Sur un jeu de questions dont on connaît le bon passage,
le **rappel@k** dit si ce passage figure parmi les k remontés. Le mesurer à chaque étage montre
OÙ ça pèche : si le bon passage n'est déjà pas dans le top-20, aucun reranker ne le fera
apparaître — il ne réordonne que ce qu'on lui donne. Un **tableau d'ablation** (vectoriel seul,
lexical seul, hybride, hybride + rerank) chiffre l'apport de chaque ajout, et révèle
régulièrement qu'un étage coûteux n'apporte rien sur CE corpus.

## 🔎 Décomposition
- « Pourquoi la reformulation passe ? » → recherche vectorielle.
- « Pourquoi la référence exacte passe ? » → recherche lexicale.
- « Pourquoi combiner ? » → parce que leurs angles morts ne se recouvrent pas.
- « Comment additionner des scores incomparables ? » → on ne les additionne pas : RRF, par rang.
- « Pourquoi reranker à la fin ? » → le cross-encoder lit les paires, donc il coûte par candidat.
- « Où ça pèche ? » → rappel@k étage par étage, jamais globalement.

## 🔧 Exemple simple
Question « erreur ORA-00942 » : la vectorielle peut ramener des passages sur « erreurs de base de données » ; la lexicale trouve le passage EXACT contenant « ORA-00942 ». L'hybride ramène les deux.

## 🧭 Exemple guidé
Un système de recherche a deux problèmes distincts, et les confondre empêche de corriger l'un
comme l'autre :

- **trouver** le bon passage — le ramener quelque part dans les résultats ;
- **le classer en tête** — le mettre là où le modèle le verra vraiment.

Ce sont deux étages, ils se mesurent séparément, et ils se corrigent par des moyens différents.
Voyons-le sur des nombres.

> Les métriques de cette section sont **calculées** par
> `scripts/v70-verifications/rag-chunking-et-metriques.py`, sur une question dont **trois**
> documents sont pertinents (`d3`, `d7`, `d9`) parmi dix résultats.

### Deux classements, les mêmes documents

```
recherche lexicale seule :  d1  d3  d2  d5  d7  d4  d6  d9  d8  d10
après reclassement       :  d3  d7  d1  d9  d2  d5  d4  d6  d8  d10
```

Les dix mêmes documents, dans deux ordres. Voici ce que les métriques en disent :

| Classement | rappel@3 | rappel@5 | rappel@10 | précision@3 | MRR | nDCG@5 |
|---|---:|---:|---:|---:|---:|---:|
| lexicale seule | 0,33 | 0,67 | **1,00** | 0,33 | 0,50 | 0,48 |
| après reclassement | **0,67** | **1,00** | **1,00** | **0,67** | **1,00** | **0,97** |

### La ligne qui explique tout : le rappel@10 est identique

Les deux classements ont **le même rappel@10 : 1,00**. Les trois documents pertinents sont là,
dans les deux cas. La recherche n'a rien manqué.

Et pourtant le système répond mal dans le premier cas — parce qu'en pratique **on ne donne pas
dix documents au modèle**. On lui en donne trois, ou cinq, pour des raisons de coût et de
fenêtre de contexte. Avec trois, la recherche lexicale seule lui livre **un seul** document
pertinent sur trois ; après reclassement, **deux sur trois**.

C'est la distinction fondamentale de cette leçon :

> **Le rappel dit si l'information est là. Le classement dit si le modèle la verra.**

Un système peut avoir un excellent rappel@50 et donner de mauvaises réponses, simplement parce
qu'il n'envoie que le top-3. Et l'inverse est vrai : reclasser ne sert à rien si le bon
document n'a jamais été ramené.

### Ce que chaque métrique mesure vraiment

| Métrique | Ce qu'elle répond | Quand l'utiliser |
|---|---|---|
| **rappel@k** | *les documents pertinents sont-ils dans les k premiers ?* | pour juger l'étage de **recherche** |
| **précision@k** | *quelle part des k premiers est pertinente ?* | quand le contexte envoyé au modèle coûte cher |
| **MRR** | *à quel rang apparaît le **premier** bon document ?* | quand une seule bonne réponse suffit |
| **nDCG@k** | *les bons documents sont-ils **en haut** ?* | quand l'ordre compte et qu'il y a plusieurs bons |

Les deux extrêmes du tableau méritent un mot.

Le **MRR** passe de 0,50 à 1,00 : dans le premier classement, le premier document pertinent est
en position 2 (`1/2`) ; dans le second, il est en position 1 (`1/1`). C'est la métrique à
regarder pour une question factuelle, où le premier bon passage suffit.

Le **nDCG@5** passe de 0,48 à 0,97 : il pénalise les bons documents placés bas, avec un poids
qui décroît logarithmiquement. C'est la seule métrique du tableau qui distingue « bon document
en position 1 » de « bon document en position 5 » — et c'est donc la bonne quand plusieurs
passages doivent être combinés pour répondre.

Note qu'aucune de ces quatre métriques ne nécessite un modèle de langage. Elles se calculent
avec un jeu de questions annotées et vingt lignes de Python. **Elles sont gratuites,
déterministes et reproductibles** — trois propriétés que l'évaluation des réponses générées n'a
pas.

### Pourquoi l'hybride : deux méthodes, deux angles morts

| Méthode | Ce qu'elle trouve | Son angle mort |
|---|---|---|
| **lexicale** (mots exacts) | une référence, un code produit, un nom propre, un identifiant | la reformulation : « voiture » ne trouve pas « automobile » |
| **vectorielle** (sens) | la paraphrase, le synonyme, la question posée autrement | l'exactitude : `REF-2024-118` devient un vecteur banal, proche de toutes les autres références |

Les deux angles morts sont **complémentaires**, et c'est ce qui justifie de fusionner plutôt
que de choisir. Un utilisateur qui cherche « la clause sur les pénalités de retard » a besoin
du sens ; celui qui cherche « REF-2024-118 » a besoin de l'exactitude. Les deux tapent dans le
même champ de recherche.

### La fusion par rang réciproque

```
score(doc) = 1/(60 + rang_vectoriel) + 1/(60 + rang_lexical)
```

Sa propriété : **elle ne compare que des rangs, jamais des scores bruts.** C'est ce qui la rend
utilisable, car un score de similarité cosinus (entre −1 et 1) et un score lexical (non borné,
dépendant de la longueur du document) ne sont pas comparables. Les normaliser demanderait de
connaître leurs distributions ; les remplacer par des rangs évite entièrement la question.

Un document classé 1ᵉʳ dans une liste et 40ᵉ dans l'autre obtient `1/61 + 1/100`. Un document
classé 5ᵉ dans les deux obtient `1/65 + 1/65` — davantage. **La fusion favorise l'accord des
deux méthodes plutôt que l'excellence dans une seule**, ce qui est exactement le comportement
souhaité : un document trouvé par les deux voies est plus sûrement pertinent.

Le `60` amortit l'écart entre les premiers rangs ; c'est une constante conventionnelle, et
c'est un paramètre à mesurer comme les autres si l'on veut être rigoureux.

### L'ordre des gestes

1. **Mesurer le rappel@20** de chaque méthode seule. C'est le plafond : ce qui n'est pas
   ramené ici ne sera jamais reclassé.
2. Si le rappel est insuffisant → travailler la **recherche** : découpage, hybride, requête
   reformulée. Reclasser ne servirait à rien.
3. Si le rappel est bon mais le **nDCG@5** faible → l'information est là, mal placée. C'est le
   cas du reclassement.
4. Re-mesurer, et vérifier le **budget de latence** : un reclassement croisé sur 50 candidats
   coûte typiquement plusieurs centaines de millisecondes, à comparer à ce que l'utilisateur
   tolère.

Le point 2 est celui qu'on saute. On ajoute un reclassement parce que c'est la solution qu'on
connaît, alors que le rappel@20 était à 0,6 — c'est-à-dire que dans 40 % des cas, il n'y avait
rien de bon à reclasser.


## 🤖 Exemple appliqué (IA / data / architecture)
Dans DocSense, l'ordre est : hybride (vectoriel + FTS5, fusionnés par RRF) → reranking du top-20 vers top-5 → génération. Chaque étage est mesuré ; le budget latence (< 3 s) est réparti par étage, et le reranking (le plus cher) ne s'applique qu'au sous-ensemble.

## ⚠️ Erreurs fréquentes

**La fusion qui a l'air raisonnable, montrée.** C'est le premier réflexe de tout le monde :

```python
# ❌ FAUX : on additionne des scores qui ne vivent pas sur la même échelle.
for doc in candidats:
    doc.score = doc.score_cosinus + doc.score_bm25   # 0,82 + 34,7
classement = sorted(candidats, key=lambda d: -d.score)
```

Le cosinus vit entre 0 et 1 ; BM25 n'a pas de borne haute et dépasse couramment 30. La somme
est donc, en pratique, le score BM25 seul avec un bruit de troisième décimale : la recherche
vectorielle est présente dans le code, absente du résultat. Le système paraît hybride, se
comporte comme un système lexical, et personne ne s'en aperçoit — le classement reste
plausible.

```python
# ✅ JUSTE : on fusionne les RANGS, pas les scores.
K = 60
scores = {}
for liste in (classement_vectoriel, classement_lexical):
    for rang, doc in enumerate(liste, start=1):
        scores[doc.id] = scores.get(doc.id, 0) + 1 / (K + rang)
classement = sorted(scores, key=lambda d: -scores[d])
```

Le test qui attrape le premier cas : retire complètement la liste vectorielle et re-mesure le
rappel@k. Si le score ne bouge quasiment pas, l'étage vectoriel ne servait à rien — soit à
cause de ce bug, soit parce qu'il n'apporte réellement rien sur ce corpus. Les deux méritent
d'être sus.

Les autres :
- Diagnostiquer la génération quand le problème est le retrieval : vérifier d'abord que le bon
  passage était présent. S'il ne l'était pas, tout le travail sur le prompt est perdu.
- Reranker avant de filtrer : le coût est proportionnel au nombre de candidats.
- Améliorer au feeling, sans mesurer étage par étage.

## 🚫 Anti-patterns
- Tout miser sur la vectorielle et s'étonner de rater les termes exacts.
- Empiler les étages sans budget de latence ni mesure.

## ✍️ Mini-exercice
Sur 5 questions dont une contient un code exact (ex. une référence), compare le top-3 de la recherche vectorielle seule vs lexicale seule. Laquelle trouve le code ?

## 🔥 Exercice plus difficile
Construis un tableau d'ablation (vectoriel / lexical / hybride / hybride+rerank) sur 15 questions, mesure le rappel@5 de chaque configuration, et conclus sur le gain de chaque étage.

## ✅ Correction attendue
### La démarche

Trois principes, dans cet ordre, et l'ordre est le contenu :

1. **Mesurer par étage.** Le rappel juge la recherche, le nDCG juge le classement. Une mesure
   qui mélange les deux ne permet de corriger ni l'un ni l'autre.
2. **L'hybride comble des angles morts**, il n'améliore pas « globalement ». On sait lequel il
   comble, et sur quelles questions.
3. **Le reclassement affine un sous-ensemble.** Il ne crée jamais d'information : ce qui n'a
   pas été ramené n'existe pas pour lui.

### Le mini-exercice : ce qu'il doit révéler

Cinq questions, dont une contenant une référence exacte. Le résultat attendu, et il est presque
toujours net :

| Question | Lexicale seule | Vectorielle seule |
|---|---|---|
| « quelles sont les pénalités de retard ? » | moyenne — dépend des mots employés dans le contrat | **bonne** — le sens est capté |
| « que dit le contrat REF-2024-118 ? » | **excellente** — correspondance exacte | **mauvaise** — la référence devient un vecteur banal |
| « peut-on résilier avant terme ? » | faible si le document dit « rupture anticipée » | **bonne** |

La deuxième ligne est celle qui compte, et elle surprend beaucoup de gens : **la recherche
vectorielle est mauvaise sur les identifiants.** `REF-2024-118` et `REF-2024-119` sont, pour un
modèle d'embedding, presque le même vecteur — ils se ressemblent typographiquement et ne
portent aucun sens distinct. Un système purement vectoriel remonte donc la mauvaise référence
avec un score élevé, ce qui est pire que de ne rien remonter.

C'est un argument suffisant pour l'hybride à lui seul, dans tout domaine où les documents
portent des codes : contrats, pièces détachées, dossiers médicaux, tickets.

### Le tableau d'ablation : comment le lire

Le vrai livrable de l'exercice difficile. Sa forme :

| Configuration | rappel@5 | nDCG@5 | latence p95 | coût |
|---|---:|---:|---:|---:|
| vectoriel seul | 0,62 | 0,55 | 40 ms | — |
| lexical seul | 0,58 | 0,49 | 15 ms | — |
| hybride | **0,81** | 0,66 | 55 ms | — |
| hybride + reclassement | 0,81 | **0,88** | **310 ms** | + appel modèle |

*(Ces valeurs illustrent la forme du tableau ; les tiennes seront différentes. Ce qui doit être
identique, ce sont les colonnes.)*

Trois lectures, et ce sont elles qu'on attend de toi :

**Le rappel@5 ne bouge pas entre les deux dernières lignes.** C'est mécanique : le reclassement
réordonne les candidats, il n'en ramène aucun. Si ton tableau montre un rappel qui augmente au
reclassement, il y a une erreur de mesure — probablement un `k` différent entre les deux
lignes.

**L'hybride apporte +0,19 de rappel** — c'est le plus gros gain du tableau, pour le coût le
plus faible. C'est presque toujours l'ordre des priorités : hybride d'abord, reclassement
ensuite.

**Le reclassement multiplie la latence par six.** C'est la colonne que les tableaux d'ablation
omettent, et c'est celle qui décide en production. 310 ms sur une recherche interactive est à
la limite du perceptible ; sur un traitement par lots, c'est sans importance. **La même
configuration est bonne ou mauvaise selon l'usage**, et un tableau sans colonne latence ne
permet pas de le dire.

### Vérifier que la fusion est correcte

Une erreur d'implémentation fréquente et silencieuse : fusionner des **scores** au lieu de
**rangs**, ou oublier les documents absents d'une des deux listes.

```python
# contrôle : un document bien classé dans les DEUX listes doit finir devant
# un document excellent dans une seule
rangs_vec = {"dA": 1, "dB": 5}
rangs_lex = {"dA": 40, "dB": 5}
assert score("dB") > score("dA"), "la fusion ne favorise pas l'accord des deux méthodes"
```

Second contrôle, sur les absents : un document présent dans une seule liste doit recevoir **une
seule** contribution, pas un score nul qui l'éliminerait, ni une valeur par défaut arbitraire.
La convention correcte est simplement de ne pas ajouter de terme pour la liste où il n'apparaît
pas.

### La mauvaise solution plausible

Augmenter `k` — passer du top-5 au top-20 — au lieu de reclasser.

Ça marche, au sens où le rappel monte mécaniquement. Trois effets, tous coûteux :

1. **le coût en jetons est multiplié par quatre**, à chaque requête, pour toujours ;
2. **la précision s'effondre** : sur vingt passages, quinze sont hors sujet, et il est
   démontré que les modèles se laissent distraire par du contexte non pertinent — la qualité
   des réponses peut **baisser** ;
3. **on masque le problème réel** : si le bon passage était en position 12, la question est de
   savoir pourquoi il n'était pas en position 2.

Le reflexe à corriger : *augmenter k n'est pas améliorer la recherche, c'est renoncer à la
classer.*

### Auto-évaluation

| Vérification | Comment |
|---|---|
| étages séparés | tu peux donner le rappel@20 **et** le nDCG@5, et dire lequel est le problème |
| l'hybride est justifié | tu peux citer une question que chaque méthode seule rate |
| la fusion est correcte | le test « accord des deux listes » passe |
| la latence est mesurée | ton tableau a une colonne p95, pas seulement une moyenne |
| le reclassement est utile | le nDCG monte **et** le rappel ne bouge pas |
| un seul changement à la fois | chaque ligne du tableau diffère de la précédente par **une** chose |

### Généralisation

La structure de cette leçon — **deux étages, deux métriques, on corrige celui qui est en
cause** — est celle de tout système en cascade : un filtre puis un classement, un
présélecteur puis un jury, un test de dépistage puis un diagnostic.

Et la faute est toujours la même : mesurer seulement la sortie finale, puis modifier un étage
au hasard. Quand on mesure chaque étage, un système en cascade se débogue ; quand on ne mesure
que la fin, on tâtonne — et l'on finit par attribuer les variations au hasard, ce qui est la
définition de ne pas comprendre son propre système.


## 🎤 Questions d'entretien
- « Ton RAG répond mal, comment débugges-tu ? » → Retrieval d'abord (le bon passage est-il dans le top-k ?), génération ensuite.
- « Pourquoi hybride ? » → Vectoriel = sens, lexical = termes exacts ; complémentaires.
- « À quoi sert le reranking et pourquoi après le retrieval ? » → Réordonner finement un sous-ensemble déjà filtré, trop coûteux sur tout le corpus.

## 🧾 À retenir
- Le retrieval est le maillon faible : mesure-le d'abord (rappel@k).
- Hybride = vectoriel (sens) + lexical (mots), fusionnés par RRF.
- Reranking = affiner le top-k, après filtrage, sous budget de latence.

## 📚 Vocabulaire
**retrieval** · **BM25 / FTS5** · **recherche hybride** · **RRF** (fusion par rangs) ·
**reranking / cross-encoder** · **rappel@k** · **ablation** · **budget de latence**. Tous
définis dans le corps de la leçon.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais diagnostiquer retrieval vs génération.
- [ ] Je sais implémenter une fusion hybride (RRF) et un reranking.
- [ ] Je mesure chaque étage par ablation sur un golden set.

## 🔗 Liens avec le programme
Mois 9 (jours ~240-262), projets 6 et final. Leçons liées : `rag-fundamentals`, `embeddings`, `vector-databases`, `ai-evaluation`.
