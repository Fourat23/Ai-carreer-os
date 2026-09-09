# V72 — CP5. Échantillon et passage AVANT de la validation simulée

**Le résultat principal de ce checkpoint n'est pas un score. C'est que l'instrument ne
discrimine presque rien, et il faut le dire avant de montrer les chiffres.**

---

## 1. L'échantillon

Graine **20260909**, publiée avant le tirage, générateur déterministe
(`scripts/v72/cp5-echantillon.mjs`, rejouable).

| contrainte du contrat | résultat |
|---|---|
| 24 leçons | **24** |
| au plus 8 communes avec l'échantillon aveugle V71 | **0** |
| stratification par domaine | 10 domaines : Fondations 5 · Systèmes 5 · Données & ML 3 · Frontend 2 · Frontend hors parcours 2 · IA appliquée 2 · Web & Backend 2 · Carrière 1 · Cloud 1 · Kubernetes 1 |
| D14 bon / faible | 5 leçons à D14 < 5 |
| court / long | 14 au-dessus de la médiane du corpus |
| parcours / hors parcours | **4 hors parcours** (`cloud-azure-core`, `css-flexbox`, `css-fundamentals`, `k8s-config-probes`) |

Notes de texte (ledger V71) de l'échantillon : de **4,71** (`linux-resources-io`) à **5,00**,
moyenne **4,940** — proche de la moyenne du corpus (4,936), donc l'échantillon n'est ni
favorable ni défavorable.

---

## 2. Le résultat qui compte : le pré-test est à 0,84

**Avant d'ouvrir une seule leçon, le lecteur simulé répond correctement à 84 % des questions
d'application et de transfert.**

C'est mesuré, pas estimé : le pré-test a été passé sur chacune des 24 leçons. Il va de 0,75
(`prompt-injection-defense`, `technical-documentation`) à 0,90 (`llm-fundamentals`,
`async-javascript`, `cloud-azure-core`).

**Conséquence, et elle vide une partie du dispositif de son sens :** le gain attribuable au
texte est plafonné à 0,16 en moyenne. Il n'y a presque rien à mesurer. Le protocole du CP4
prévoyait exactement ce risque — « seul le gain est attribuable au texte » — et le pré-test
était là pour le rendre visible. Il l'a rendu visible.

**Pourquoi c'était prévisible et pourquoi ça reste vrai.** Le lecteur simulé est un modèle de
langage. Sur les vingt-quatre sujets tirés — l'asynchrone en JavaScript, le box model CSS, les
files de messages, les SLO, le chunking RAG — il arrive avec des connaissances préalables
massives. Ce n'est pas un débutant qui découvre : c'est un lecteur qui vérifie. Aucun
aménagement du protocole ne change cela.

---

## 3. Les scores, publiés séparément comme l'exige la règle S5

| axe | moyenne sur 24 |
|---|---|
| **PRE-TEST** (avant lecture) | **0,842** |
| RAPPEL | 1,000 |
| EXPLICATION | 1,000 |
| APPLICATION | 1,000 |
| MISCONCEPTION | 1,000 |
| **TRANSFERT** | **0,969** |
| `TEXT_SCORE` moyen (ledger V71, échelle 1–5) | 4,940 |
| `DELAYED_RECALL` | **NOT MEASURED** |

**Trois leçons seulement s'écartent du plafond**, toutes sur le même axe :

| leçon | axe | pourquoi |
|---|---|---|
| `linux-resources-io` | TRANSFERT 0,75 | le principe (remonter du symptôme à la ressource) se transpose, mais la leçon ne donne pas la condition sous laquelle il cesse de valoir |
| `ci-cd-pipeline-anatomy` | TRANSFERT 0,75 | idem : « machines éphémères + flux explicite » se transpose partout, sans limite énoncée |
| `cloud-azure-core` | TRANSFERT 0,75 | leçon de repérage plus que de mécanisme — la nature du contenu, pas un défaut |

**Cas « texte fort / restitution faible » : zéro.** C'était le résultat principal recherché par
le protocole (§ règle S6). Il n'y en a pas.

---

## 4. Comment lire un résultat au plafond — sans le vendre

Un score de 1,00 sur quatre axes ne dit **pas** « ces leçons enseignent bien ». Il dit
exactement ceci, et rien de plus :

> **Un lecteur qui connaît déjà 84 % du sujet, après une lecture, peut restituer ce que ces
> textes contiennent, l'appliquer à un cas neuf et réfuter l'erreur classique — sans y
> revenir.**

Ce que ce résultat **exclut** tout de même, et qui n'est pas rien : qu'une de ces 24 leçons
soit un texte creux qui se lit agréablement sans rien fournir d'utilisable. Aucune ne l'est.
Une leçon qui expose sans outiller aurait produit un RAPPEL haut et une APPLICATION basse ;
cette signature n'apparaît nulle part.

Ce que ce résultat **n'exclut pas** : qu'une leçon soit trop dense pour un débutant, qu'elle
suppose un prérequis non annoncé, qu'elle décourage, ou qu'elle soit oubliée en 48 heures.
Aucune de ces quatre questions n'est mesurée ici, et trois d'entre elles ne peuvent l'être que
sur un humain.

**Les seuils L7 (application ≥ 0,70) et L8 (transfert ≥ 0,55) passent — trivialement.** Ils ont
été fixés au CP1 avant de mesurer, ils ne sont pas déplacés, et le rapport final devra dire
qu'ils ont été franchis sans effort plutôt que d'afficher deux coches.

---

## 5. Ce que l'exercice a quand même produit

Le passage a forcé une lecture intégrale et une restitution écrite pour 24 leçons. Les
observations par leçon sont dans `docs/v72/V72-SLV-BEFORE.json`. Quelques-unes valent d'être
sorties, parce qu'elles caractérisent le corpus mieux qu'un score :

- **`logging-structured`** ne dit pas « le structuré est plus facile à requêter ». Il montre
  que le format texte **donne souvent la bonne réponse** — 9 = 9 sur la première question,
  malgré 24 lignes rejetées en silence — puis se trompe de 36 % sur la seconde (37 au lieu de
  58). La conclusion est que la fiabilité du texte dépend de la question posée, donc qu'on ne
  peut pas s'y fier, puisqu'on ignore les questions qu'on posera pendant un incident.
- **`prompt-injection-defense`** fait échouer chaque couche devant le lecteur. Le vérificateur
  de citations attrape l'hallucination et **laisse passer l'empoisonnement** : la phrase est
  littéralement dans le document cité, couverture 1,00, accepté. « Le modèle a inventé » et
  « on lui a menti » ne se traitent pas par la même mesure.
- **`k8s-config-probes`** montre une configuration de surveillance qui **provoque la panne
  qu'elle est censée détecter**, et en tire la règle : une sonde de vivacité ne teste que soi.
- **`statistics-for-ml`** établit qu'un défaut touchant 5 % des **requêtes** touche 92 % des
  **utilisateurs** un peu actifs — « choisis consciemment l'unité que tu mesures ».
- **`express-backend`**, qui porte la **note de texte la plus basse de l'échantillon (4,79)**,
  publie le comportement mesuré d'Express 4 contre Express 5 sur les promesses rejetées, et le
  piège de l'arité qui transforme silencieusement un gestionnaire d'erreurs en middleware
  ordinaire — parce que l'éditeur suggère de retirer le paramètre `next` inutilisé.

---

## 6. Ce qui est décidé pour le CP13

Le passage APRÈS aura lieu comme prévu, sur le **même** échantillon et les **mêmes** questions.
Mais son interprétation est fixée ici, avant de le passer, pour qu'aucune lecture flatteuse ne
soit possible ensuite :

1. **Un score identique sera le résultat attendu**, puisque quatre axes sont déjà au plafond.
   Il ne prouvera rien sur les corrections des CP2, CP3, CP6 à CP12.
2. **Une baisse serait le signal important** : elle indiquerait qu'une correction a retiré
   quelque chose d'utile. C'est le seul événement que ce second passage peut réellement
   détecter, et c'est à ce titre qu'il est conservé.
3. **`SIMULATED_LEARNING_VALIDATION` ne pourra donc pas valoir `READY` sur la seule foi des
   seuils L7–L9.** Le rapport final devra publier le pré-test de 0,842 à côté du verdict, et
   dire que l'instrument n'a pas discriminé.
