<!-- keep -->
# Leçon — Évaluation RAG avancée

## 🌍 Le problème d'abord
Tu améliores ton RAG : nouveau découpage, recherche hybride, reranking… mais comment SAVOIR si
chaque changement aide vraiment, ou aggrave discrètement autre chose ? Sans mesure, tu pilotes
à l'aveugle et tu « améliores » souvent en dégradant. Et une difficulté propre au RAG : quand
une réponse est mauvaise, est-ce parce qu'on n'a pas RETROUVÉ le bon passage, ou parce qu'on
l'a mal UTILISÉ ? Ces deux pannes se corrigent différemment. Cette leçon construit le harnais
d'évaluation qui mesure chaque étage séparément et te laisse améliorer sur des CHIFFRES — le
différenciateur n°1 d'un profil RAG sur le marché.

## 🎯 Objectif
Construire un harnais d'évaluation RAG complet et l'utiliser pour PILOTER les améliorations : golden set exigeant, métriques par étage (retrieval/génération), juge calibré, ablation, scores versionnés. C'est le différenciateur n°1 d'un profil RAG sur le marché.

## 🧠 Modèle mental
Un RAG sans éval, c'est **naviguer sans instruments** : chaque « amélioration » est un pari. Le harnais transforme le pilotage au feeling en pilotage aux instruments — et chaque étage du pipeline a SON cadran.

## 🧩 Prérequis
Tu dois maîtriser les principes d'évaluation d'un système IA — golden set, évaluation par
étage, LLM-as-judge calibré, baseline (`/doc/lessons/ai-evaluation`) — et le pipeline RAG avec
ses étages retrieval/génération (`/doc/lessons/rag-fundamentals`,
`/doc/lessons/retrieval-reranking`). Les réflexes statistiques (bruit vs signal,
`/doc/lessons/statistics-for-ml`) évitent de confondre une vraie amélioration avec du hasard.

## 📖 Explication complète
- **Le golden set exigeant** : 30-50 questions sur TON corpus, avec pour chacune la réponse attendue ET l'identifiant du/des chunks qui la contiennent. Varié par construction : factuelles, synthèse multi-passages, ambiguës, pièges lexicaux (mots partagés/sens différent), et SANS réponse dans le corpus (pour tester le refus). Vivant : chaque échec réel devient un cas.
- **Étage retrieval (programmatique, sans LLM)** : rappel@k (le bon chunk est-il dans le top-k ?), MRR (à quel rang ?). Rapide, fiable, gratuit — la métrique au meilleur rendement du domaine. C'est ici que se diagnostiquent 80 % des échecs.
- **Étage génération (LLM-as-judge calibré)** : fidélité (fondée sur les sources ?), pertinence (répond à la question ?), exactitude (conforme à l'attendu ?). Le juge se CALIBRE : juger à la main 20-30 cas, mesurer l'accord juge/humain, ajuster le prompt de jugement (critères binaires étroits > note sur 10) jusqu'à un accord acceptable. Un juge non calibré produit des chiffres précis et faux.
- **La boucle d'amélioration** : baseline chiffrée → UN changement (chunking, hybride, rerank, prompt) → re-mesure → adopter/rejeter SUR LES CHIFFRES → versionner le score (score ↔ commit ↔ config). L'**ablation** (mesurer chaque étage isolément) révèle la contribution réelle de chaque composant.
- **Le bruit** : ±2 points sur 30 questions peut être du hasard. Relancer, regarder QUELLES questions ont basculé, agrandir le set avant de conclure.

## 🔧 Exemple simple
Rapport en 4 lignes : `rappel@5 = 84 % (26/31, échecs : Q7 Q12 Q19 Q23 Q28) · fidélité 91 % (juge calibré, accord humain 88 %) · refus corrects 5/6 · vs v0.9 : rappel +7 pts (chunking structure)`.

## 🧭 Exemple guidé
« Le RAG répond mal à la question 12. » C'est le ticket le plus fréquent, et il n'est pas
actionnable tel quel : cinq maillons peuvent être en cause, et modifier au hasard celui qu'on
connaît le mieux est ce qu'on fait par défaut.

### La chaîne, et l'endroit où l'on coupe

```
question → découpage → recherche → reclassement → génération → réponse
```

Le diagnostic tient en **une question binaire**, posée au bon endroit :

> **Le passage contenant la réponse est-il dans ce qu'on a envoyé au modèle ?**

| Réponse | Ce que c'est | Où chercher |
|---|---|---|
| **non** | problème de **recherche** | découpage, hybride, reformulation de la requête |
| **oui** | problème de **génération** | prompt, format, fidélité aux sources |

Cette bissection élimine la moitié de la chaîne en une minute, sans appeler quoi que ce soit :
il suffit de regarder les passages récupérés. C'est le geste le plus rentable du domaine, et le
plus souvent omis.

### Pourquoi la mesure globale ne suffit pas

Un système de RAG a **deux étages** dont les défaillances se compensent et se masquent :

| | Rappel@5 | Fidélité de la génération | Réponse finale |
|---|---:|---:|---|
| système A | 0,95 | 0,60 | médiocre |
| système B | 0,60 | 0,95 | médiocre |

Deux systèmes, un même verdict à l'arrivée, et **deux problèmes opposés**. Une note globale ne
les distingue pas — et l'on passe des semaines à améliorer le prompt du système B, dont le
prompt est excellent et dont la recherche ne trouve rien.

D'où la règle : **mesurer chaque étage séparément**, avec des métriques qui ne dépendent pas
l'une de l'autre. Le rappel@k pour la recherche, calculable sans aucun modèle — les valeurs de
`/doc/lessons/retrieval-reranking` en donnent la forme exacte.

### Le jeu de référence, et ce qu'il doit contenir

Vingt à cinquante questions dont on connaît la réponse **et le passage source**. C'est le seul
investissement structurel de tout un projet de RAG, et il doit contenir **cinq types**, dont
trois pièges :

| Type | Ce qu'il teste | Ce que révèle son échec |
|---|---|---|
| factuelle simple | le cas nominal | rien ne fonctionne |
| reformulée (aucun mot en commun) | la recherche sémantique | on dépend du vocabulaire exact |
| **lexicale trompeuse** (une référence, un code) | la recherche exacte | le vectoriel seul ne suffit pas |
| **multi-passages** (la réponse est répartie) | l'agrégation | un seul passage n'est jamais assez |
| **sans réponse** dans le corpus | l'abstention | **le système invente** |

La dernière ligne est la plus importante et la plus absente des jeux de référence maison. Un
système qui répond toujours quelque chose n'a jamais été testé sur une question dont la réponse
n'existe pas — et c'est pourtant le cas où son erreur est la plus grave, puisque l'utilisateur
n'a aucun moyen de la détecter.

Le comportement attendu est écrit d'avance : *« je ne trouve pas cette information dans les
documents »*. Une réponse plausible et inventée est un **échec**, même si elle est bien
rédigée.

### Le juge automatique, et sa calibration

Évaluer des réponses libres à la main ne passe pas à l'échelle. On délègue le jugement à un
modèle — et cela déplace le problème : **qui juge le juge ?**

La calibration est le protocole qui répond :

```
1. juger 20 cas À LA MAIN, avec des critères binaires écrits AVANT
2. faire juger les mêmes 20 cas par le juge automatique
3. mesurer l'ACCORD : combien de verdicts identiques ?
4. si l'accord est faible, corriger le prompt de jugement — pas les cas
5. re-mesurer, et publier l'accord avant/après
```

Deux exigences rendent ce protocole utile :

- **des critères binaires.** « La réponse est-elle fidèle aux sources ? oui/non » se juge de la
  même façon deux fois ; « note la qualité de 1 à 5 » ne le fait pas, ni pour un humain ni pour
  un modèle ;
- **l'accord est un nombre publié.** Un juge à 70 % d'accord humain est utilisable pour
  détecter de grosses variations, pas pour arbitrer entre deux versions qui diffèrent de trois
  points.

C'est le point que la plupart des équipes omettent : **un juge non calibré n'est pas une
mesure, c'est une opinion automatisée** — reproductible, ce qui la rend d'autant plus
convaincante à tort.

### La règle qui empêche de tourner en rond

> **Le cas individuel guide, le jeu de référence décide.**

La question 12 sert à **comprendre** ce qui cloche et à formuler une hypothèse. Le correctif
n'est adopté que si le score **global** ne régresse pas.

Sans cette règle, on entre dans le cycle qui use les équipes : on corrige Q12, Q7 casse ; on
corrige Q7, Q12 revient. Chaque correctif est validé sur le cas qui l'a motivé, et personne ne
mesure l'ensemble.

Et le corollaire, valable pour toute optimisation : **un changement à la fois**, avec le score
avant et après. Deux changements simultanés qui produisent +2 points ne disent pas si l'un a
gagné 5 et l'autre perdu 3.


## 🤖 Exemple appliqué (IA / data / architecture)
Le dashboard qualité de DocSense affiche l'HISTOIRE des scores par version : « chunking structure : rappel +9 · hybride : +6 · rerank : fidélité +4 ». Ce tableau EST ta réponse à « comment sais-tu que ton système marche ? » — la question d'entretien qui trie les candidats RAG.

## ⚠️ Erreurs fréquentes

**Le juge non calibré, montré.** Ce prompt de jugement paraît raisonnable. Il produit des
chiffres précis, stables, et faux :

```
❌ FAUX
« Note de 1 à 10 la qualité de cette réponse par rapport à la question. »
```

Trois défauts se cumulent. Le mot « qualité » n'est pas défini : le modèle arbitre entre
exactitude, style et longueur sans qu'on sache lequel il a privilégié. L'échelle sur 10 est
illusoirement fine — un même cas oscille entre 6 et 8 d'une exécution à l'autre, sans qu'aucun
fait n'ait changé. Et rien ne relie la note aux SOURCES : une réponse élégante et inventée
obtient 8. Le harnais rend alors « qualité moyenne : 7,4 », un nombre qui a l'air d'une mesure
et qui n'est le reflet d'aucune propriété.

```
✅ JUSTE — trois questions binaires, chacune vérifiable sur les sources
1. Chaque affirmation de la réponse est-elle soutenue par un passage fourni ?  OUI / NON
2. La réponse traite-t-elle la question posée (et non une question voisine) ?  OUI / NON
3. La réponse contredit-elle un passage fourni ?                              OUI / NON
```

Chaque question a une réponse défendable qu'un humain peut contester sur pièces. On CALIBRE
ensuite en jugeant soi-même 20 à 30 cas, puis en mesurant l'**accord** juge/humain : sur
combien de cas la machine dit-elle la même chose que toi ? En dessous de 80 %, le juge n'est
pas utilisable — on retravaille les critères, on remesure. Ce chiffre d'accord doit être publié
à côté de chaque score : sans lui, « fidélité 91 % » ne veut rien dire.

Les autres :
- Golden set sans cas « sans réponse dans le corpus » : le refus n'est jamais testé, et un RAG
  qui n'a jamais appris à dire « je ne sais pas » invente.
- Changer trois choses puis mesurer : l'effet est indémêlable, on ne sait pas quoi garder.
- Conclure sur ±2 points de bruit.
- Sur-adapter au golden set : c'est un échantillon, pas la vérité.

## 🚫 Anti-patterns
- « L'éval, on la fera à la fin » (elle doit piloter dès le début).
- Optimiser rappel@k en montant k à 50 (la génération se noie — les métriques se lisent ensemble).

## ✍️ Mini-exercice
Ajoute à ton golden set 3 questions pièges (lexical trompeur, multi-passages, sans réponse) et mesure ce qu'elles révèlent.

## 🔥 Exercice plus difficile
Calibre ton juge : juge 20 cas à la main, mesure l'accord, améliore le prompt de jugement (critères binaires), re-mesure. Documente l'accord avant/après.

## ✅ Correction attendue
### La démarche

*Jeu de référence exigeant et vivant → étages séparés → juge calibré → un changement à la
fois → scores versionnés → prudence face au bruit.*

Le mot **vivant** porte une exigence concrète : chaque défaut rencontré en production entre
dans le jeu de référence comme un nouveau cas. Un jeu figé mesure de mieux en mieux un système
qui ne rencontre plus ces problèmes-là.

### Les trois questions pièges, et ce qu'elles révèlent

**Lexicale trompeuse** — une question contenant une référence exacte : *« que dit l'article
L. 121-4 ? »*. La recherche vectorielle seule échoue, parce que `L. 121-4` et `L. 121-5`
produisent des vecteurs presque identiques. Si ce cas échoue, la réponse n'est pas « améliorer
le modèle d'embedding » : c'est **ajouter une recherche lexicale**, et le tableau d'ablation de
`/doc/lessons/retrieval-reranking` en donne le gain.

**Multi-passages** — la réponse est répartie sur deux sections éloignées. Elle révèle deux
choses d'un coup : si le rappel@5 ne ramène qu'un des deux passages, c'est la recherche ; s'il
ramène les deux et que la réponse n'en synthétise qu'un, c'est la génération. **C'est le seul
type de question qui teste l'agrégation**, et son absence explique qu'un système excelle sur
les questions factuelles et échoue dès qu'il faut croiser deux informations.

**Sans réponse** — l'information n'est pas dans le corpus. Le comportement attendu est
l'abstention. Le résultat typique d'un premier système, et il faut le publier tel quel :
**il invente**, avec aplomb, en citant des passages réellement récupérés mais hors sujet.

Cette dernière est la plus rentable des trois, parce qu'elle mesure la seule chose que
l'utilisateur ne peut pas vérifier lui-même.

### Calibrer le juge : les chiffres à publier

```
avant : accord juge/humain = 0,65 sur 20 cas
        → 7 désaccords, dont 6 sur des réponses partiellement correctes
après : critères binaires explicites, un critère à la fois
        accord = 0,90 → 2 désaccords, tous deux sur des cas réellement ambigus
```

Ce qui a changé entre les deux : le prompt de jugement est passé de « note la qualité de 1 à 5 »
à trois questions binaires posées séparément — *toutes les affirmations sont-elles appuyées par
un passage fourni ? · la question posée reçoit-elle une réponse ? · une information hors sources
est-elle ajoutée ?*

Deux enseignements :

- **décomposer un jugement en critères binaires augmente l'accord**, pour les modèles comme
  pour les humains. Une note globale agrège des jugements que l'évaluateur n'a pas explicités,
  donc pas stabilisés ;
- **on corrige le prompt de jugement, jamais les cas.** Ajuster les cas jusqu'à ce que le juge
  soit d'accord est une falsification de la mesure — et une tentation forte, parce que c'est
  plus rapide.

### La prudence face au bruit

Un modèle est non déterministe. Sur un jeu de 20 questions, un écart de deux réponses vaut
10 points de score — et ne signifie rien.

Trois protections, dans l'ordre de coût :

1. **température à 0** pour l'évaluation, ce qui réduit la variance sans la supprimer ;
2. **plusieurs exécutions** du même jeu, et l'on publie la moyenne **et** l'écart. Trois
   exécutions suffisent à voir si l'écart entre deux versions dépasse la dispersion ;
3. **assez de cas.** En dessous de 20, presque aucune différence n'est significative ; à 50, on
   commence à distinguer des écarts de 5 points.

La formulation honnête à écrire dans le rapport : *« v3 obtient 0,82 contre 0,79 pour v2, sur
trois exécutions dont l'écart type est de 0,03 — la différence n'est pas concluante. »* C'est
une phrase désagréable à écrire et elle évite d'adopter une version qui n'apporte rien, en
payant sa complexité pour toujours.

### La mauvaise solution plausible

Juger la qualité du RAG à l'œil, sur quelques questions, à chaque modification.

C'est ce que font la plupart des équipes, et le raisonnement est compréhensible : construire un
jeu de référence coûte deux jours, regarder cinq réponses coûte dix minutes.

Le calcul se retourne au bout de deux semaines. Sans jeu de référence, **chaque modification
demande une nouvelle inspection manuelle**, on ne peut pas comparer deux versions séparées de
plusieurs jours, et l'on découvre les régressions en production. Avec, chaque décision coûte
trois minutes de calcul.

Et il y a pire que le coût : l'inspection à l'œil porte toujours sur les mêmes questions — celles
qu'on a en tête —, c'est-à-dire jamais sur les cas pièges. On optimise donc le système sur son
domaine facile.

### Auto-évaluation

| Vérification | Comment |
|---|---|
| les cinq types de questions | ton jeu en contient au moins un de chaque, y compris « sans réponse » |
| étages séparés | tu peux donner le rappel@5 **et** la fidélité, indépendamment |
| juge calibré | tu connais son accord humain, en nombre |
| un changement à la fois | chaque version du système diffère de la précédente par une chose |
| scores versionnés | tu peux dire ce que valait le système il y a un mois |
| bruit pris en compte | tes comparaisons citent une dispersion, pas un seul chiffre |

### Généralisation

Ce que cette leçon installe dépasse le RAG : c'est la méthode d'évaluation de **tout système
non déterministe** — recommandation, détection de fraude, tri automatique, modération.

Trois propriétés y sont toujours nécessaires, et toujours coûteuses à établir : un jeu de
référence qui contient les cas difficiles, des mesures par étage plutôt qu'une note globale, et
la conscience du bruit. Les équipes qui les construisent avancent lentement au début et
décident vite ensuite ; celles qui ne les construisent pas avancent vite au début, puis
n'avancent plus du tout — parce qu'aucune modification ne peut plus être jugée.


## 🎤 Questions d'entretien
- « Comment évalues-tu un RAG ? » → Golden set typé, rappel@k programmatique pour le retrieval, juge calibré pour la génération, ablation, versionnement.
- « Comment fais-tu confiance à ton juge LLM ? » → Accord mesuré avec des jugements humains sur un échantillon ; critères binaires étroits.
- « +2 points après ton changement : tu conclus quoi ? » → Rien encore : bruit possible — relancer, regarder quelles questions ont basculé.

## 🔎 Décomposition
- « Ma réponse est mauvaise : d'où vient la panne ? » → le bon passage était-il remonté ?
- « Comment mesurer sans LLM ? » → rappel@k et MRR, sur le retrieval, gratuitement.
- « Comment faire confiance à un juge LLM ? » → critères binaires, puis accord humain mesuré.
- « +2 points, j'adopte ? » → pas avant d'avoir écarté le bruit.
- « Quel composant sert vraiment ? » → l'ablation, étage par étage.

## 🧾 À retenir
- Évaluer PAR ÉTAGE : rappel@k d'abord (gratuit, fiable), fidélité ensuite (juge calibré).
- Un changement à la fois, scores versionnés, prudence face au bruit.
- Le golden set est vivant : chaque échec réel devient un cas.

## 📚 Vocabulaire
**golden set** · **rappel@k / MRR** · **fidélité / pertinence / exactitude** · **LLM-as-judge / calibration / accord** · **ablation** · **baseline** · **bruit statistique** · **sur-adaptation**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Mon harnais tourne en une commande et sort un rapport par étage.
- [ ] Mon juge est calibré (accord humain mesuré).
- [ ] Chaque amélioration adoptée a son avant/après versionné.

## 🔗 Liens avec le programme
Mois 9 (jours ~253-266), projet 6, projet final. Leçons liées : `ai-evaluation`, `retrieval-reranking`, `model-evaluation`, `llm-observability`.
