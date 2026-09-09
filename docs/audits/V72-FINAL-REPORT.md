# V72 — RAPPORT FINAL

**Sprint** : V72 — intégrité du curriculum et validation d'apprentissage simulé.
**Branche** : `claude/ai-career-os-saas-phfg49` · **base** `167f822` · **14 commits**.
**Corpus des 128 leçons** : `7eb88ba5…` → **`c1ac869e…`**.

---

## 1. Ce que V72 était, et ce qu'il n'était pas

**Ce n'était pas un nouveau sprint de réécriture des 128 leçons.** Le brief posait le risque
inverse de celui de V71 : *dégrader de bons cours en continuant à les réécrire sans besoin
démontré.* La règle de conduite en découlait — n'intervenir que là où un défaut réel, mesuré ou
observé, justifie le changement.

**Le chiffre qui dit si cette règle a été tenue** :

| | |
|---|---|
| leçons du corpus | **128** |
| leçons **modifiées** par V72 | **27** (21 %) |
| leçons **non touchées** | **101** (79 %) |
| volume du corpus | 426 418 → **426 936 mots** |
| variation | **+518 mots, soit +0,12 %** |
| lignes | **+114 / −82** |

V72 a donc laissé quatre leçons sur cinq intactes et fait varier le volume du corpus d'un
millième. Ce n'était pas une réécriture.

**Ce que V72 a fait à la place** : mesurer le **parcours** — l'ordre, la charge, les revues, le
mapping journée↔leçon, les compétences déclarées — et faire passer à 24 leçons une validation
par restitution.

---

## 2. Les trois niveaux de preuve, tenus séparés

| niveau | ce qu'il établit | état à la fin de V72 |
|---|---|---|
| **CERTIFIED TEXT QUALITY** | les textes sont justes, complets, lisibles | **acquis par V71** (moyenne 4,94 ; 0 défaut P0/P1/P2) |
| **SIMULATED LEARNING EVIDENCE** | le texte contient de quoi répondre sans y revenir | **mesuré par V72** — voir §8, et lire le §8.3 avant le verdict |
| **REAL HUMAN LEARNING EVIDENCE** | un humain apprend | **`NOT YET MEASURED`** — voir §9 |

Ces trois niveaux ne se remplacent pas. Un texte excellent peut ne pas outiller l'action ; un
texte qui outille l'action peut décourager un humain. **Aucun résultat de ce rapport ne dit que
des apprenants apprennent.**

---

## 3. Ce qui a été mesuré, et avec quoi

**Vingt-et-un** instruments rejouables, tous committés sous `scripts/v72/` :

| domaine | instrument | ce qu'il mesure |
|---|---|---|
| charge | `charge-jours.mjs`, `cp14-sensibilite-revues.mjs` | fourchettes par journée ; **sensibilité** du résultat à ses hypothèses |
| éditorial | `redites-ouverture.mjs`, `motifs-editoriaux.mjs`, `cloture-vs-objectif.mjs`, `cp3-vectorisation.py` | redondances R0–R3, motifs mécaniques |
| revues | `anatomie-revues.mjs`, `themes-vs-jours.mjs`, `theme-vs-synthese.mjs` | contenu, plafond, cohérence thème/synthèse |
| mapping | `domaines-promis-enseigne.mjs`, `pratiques-domaines.mjs`, `cp14-parcours-sequentiel.mjs` | promesses contre enseignement, marche des 365 jours |
| pratiques | `refs-mortes.mjs` | références d'exercice mortes |
| opérationnel | `cp10-validation-operationnelle.mjs` | 687 blocs de code, N1→N4 |
| invariants | les cinq `cp12-controle-*.mjs` | compétences, prérequis, plafond de revue, pratiques, `readingMinutes` |
| négatifs | `cp12-tests-negatifs.mjs` | met chaque contrôle **volontairement en échec** |
| échantillon | `cp5-echantillon.mjs` | tirage déterministe, graine publiée avant |

**Aucun de ces instruments n'attribue de note pédagogique.** Le contrat gelé au CP1 l'interdit,
et la raison en est simple : une sonde qui compte des marqueurs ne sait pas si une leçon
enseigne.

---

## 4. Ce qui a été modifié — et ce qui a été délibérément épargné

### Modifié

| CP | objet | portée |
|---|---|---|
| **CP2** | redondances R2 et R3 | **17 leçons** |
| **CP3** | motifs mécaniques réellement dupliqués (4) + **6 défauts factuels** hérités de V71 | **10 leçons** |
| **CP6** | `lessonsDeLaRevue` : une revue liait l'union des **catalogues de compétences** traversés | générateur ; revues au-dessus du plafond **6 → 0** |
| **CP8** | rattachement de 3 leçons Kubernetes à j321 | données de mapping |
| **CP9** | 2 références d'exercice mortes | **2 leçons** |
| **CP12** | gate de profondeur durci sur les références mortes ; règle *« une revue révise, elle n'introduit pas »* | générateur ; 7 journées régénérées |
| **CP14** | **j320** : 9 leçons liées → 6, la seule journée de travail infaisable des 365 | données de mapping |

### Délibérément épargné, et c'est un résultat

- **118 leçons sur 128 closent leur accroche par « Cette leçon… »** ; seules **4** dupliquaient
  réellement leur objectif au sens des critères gelés. Les **114 autres n'ont pas été
  touchées** : annoncer n'est pas répéter.
- **Six leçons signalées R2 par le préliminaire ont été reclassées R1** après application des
  critères gelés, et donc épargnées. Les critères écrits avant de mesurer se sont révélés plus
  exigeants qu'un jugement de lecteur.
- **Aucune leçon hors parcours n'a été insérée** (CP7 — 25 à l'époque, **22** aujourd'hui) : aucune n'est de classe A selon
  les critères gelés. Les six leçons programmées qui en citent une le font en **renvoi
  d'approfondissement explicitement annoncé**, et donnent sur place la notion nécessaire.
- **Le « gabarit complet » (93/128) est resté un indicateur non exigé** : l'exiger aurait fait
  ajouter deux titres à 35 leçons pour satisfaire un contrôle.
- **`difficulty` n'a pas été retouché** malgré sa constance sur 276 journées (§12).

---

## 5. Intégrité du curriculum — les dix seuils, un par un

Seuils **gelés au CP1, avant toute mesure**, et **non déplacés**.

| # | seuil | exigé | mesuré | état |
|---|---|---|---|---|
| **C1** | journées IMPOSSIBLE | 0 | **6** — toutes des revues | ❌ |
| **C2** | revues HEAVY ou IMPOSSIBLE | ≤ 5 / 52 | **19** | ❌ |
| **C3** | compétences déclarées sans aucune journée | 0 | **1** — `cloud` | ❌ |
| **C4** | références mortes dans une pratique | 0 | **0** | ✅ |
| **C5** | leçons dont la pratique échoue à P1 ou P3 | ≤ 2 | **0** | ✅ |
| **C6** | R3 restantes / R2 restantes | 0 / ≤ 4 | **0 / 0** | ✅ |
| **C7** | défauts factuels ouverts et non corrigés | 0 | **0** | ✅ |
| **C8** | ordre des 365 · 128/365/365 · `progress.json` | inchangés | **inchangés** | ✅ |
| **C9** | `gates:active`, `npm test`, `tsc`, `build` | tous verts | **52 gates · 1420/1420 · 0 · build OK** | ✅ |
| **C10** | écart `readingMinutes` publié vs recalculé | ≤ 5 min | **0 min** | ✅ |

### C1 et C2 : ce que ces deux échecs veulent réellement dire

**Le chiffre dépend d'une hypothèse de mon propre modèle**, et cette hypothèse a été testée au
CP14 plutôt que laissée implicite. Le modèle de charge compte le texte de chaque leçon liée à
150 mots/minute, comme une lecture **à froid**. Une revue, elle, dit « leçons de fond à
**relire** » — ces textes ont été lus dans les six jours précédents.

En faisant varier ce seul coefficient :

| coefficient de relecture | journées IMPOSSIBLE |
|---|---|
| 1,00 (relire = lire) | **6** |
| 0,75 | 3 |
| **0,50** | **0** |
| 0,25 | 0 |

**Le seuil n'est pas déplacé pour autant.** C1 est évalué avec le modèle gelé au CP1, donc
**C1 échoue**. Mais le rapport doit dire que « six journées infaisables » n'est pas un fait du
curriculum : c'est un fait du curriculum **et** du modèle, et le modèle a une hypothèse que
personne n'a validée.

**Ce qui survit à toutes les hypothèses**, et qui est le vrai constat de charge :

- les revues sont **près de trois fois** plus souvent en dépassement que les journées ordinaires
  — **37 % contre 13 %** ;
- **92 %** de la lecture d'une revue est la relecture des leçons ; la page de revue elle-même ne
  pèse que **10 minutes** ;
- **40 des 52 revues** minutent explicitement leur pratique (99 min en moyenne) et la relecture
  vient **par-dessus, sans jamais être budgétée**.

**La journée de revue est la journée la plus chargée de la semaine, alors qu'elle est censée
consolider.** Ce constat-là ne dépend d'aucun coefficient.

---

## 6. VERDICT 1 — `CURRICULUM_INTEGRITY_NOT_READY`

La règle du contrat, appliquée sans arrangement :

> **`CURRICULUM_INTEGRITY_CANDIDATE`** — C3, C4, C8 et C9 atteints, et **au plus deux** non
> atteints parmi C1, C2, C5, C6, C7, C10.

**C3 n'est pas atteint.** Le verdict est donc :

# `CURRICULUM_INTEGRITY_NOT_READY`

**Et voici l'arithmétique complète, pour qu'elle soit contestable.** Sept seuils sur dix sont
atteints. Parmi les six seuils « tolérants », exactement deux échouent (C1 et C2) — soit
précisément le maximum autorisé. **Le seul obstacle au statut `CANDIDATE` est C3**, c'est-à-dire
une compétence déclarée sans journée.

Et **C3 ne peut pas être réparé par V72** : le contrat gelé au CP1 — écrit avant toute mesure —
réserve à l'utilisateur *la suppression d'une compétence déclarée de `program.json`* et *toute
création d'une journée nouvelle*. Ce sont les deux seules réparations possibles. Voir §14.

**Ce que ce verdict n'est pas.** Ce n'est pas « le curriculum est mauvais ». Sept seuils sur dix
sont atteints, dont tous ceux qui portent sur l'exactitude, les références, les invariants et
l'outillage. C'est un verdict qui dit : **il reste une promesse non tenue dans le programme, et
la trancher n'appartient pas à V72.**

---

## 7. `cloud` : la promesse que le programme ne tient pas

`data/program.json` déclare **vingt compétences**. Dix-neuf ont des journées. **`cloud` — « Cloud
/ DevOps » — en a zéro** sur 365.

**Le CP14 a trouvé le fait qui aggrave le constat** : le mois 11 ne se contente pas d'ignorer
`cloud`, il **déclare un score attendu** — `expectedScores.cloud = 2`. Le programme fixe donc à
l'apprenant une cible chiffrée sur une compétence qu'il n'enseigne jamais.

Le contenu correspondant existe **partiellement**, sous d'autres étiquettes : Docker (j320),
CI/CD (j307), secrets (j68), observabilité (j79), réponse à incident (j332). **Ce qui manque
vraiment, c'est le cloud lui-même** — AWS, Azure, réseau cloud, IaC, FinOps — et ce sont
exactement les leçons restées hors parcours.

**Une troisième voie a été examinée et refusée au CP7.** j320 « DocSense : dockerisation » porte
l'étiquette `evalia` alors que son contenu est du DevOps. La ré-étiqueter `cloud` ferait passer
C3 **mécaniquement**, puisque `cloud` aurait « au moins une journée ». Une compétence affichée
parmi les vingt, acquittée par **une** journée sur 365, resterait une promesse non tenue — et le
seuil aurait été franchi par la lettre contre son intention. **Le ré-étiquetage n'est pas fait**,
et le CP14 l'a maintenu en corrigeant la charge de j320 sans toucher à son étiquette.

---

## 8. Validation simulée — les neuf seuils, et ce qu'ils valent

### 8.1 Le protocole

Gelé au CP4 **avant tout passage** (`docs/v72/V72-SLV-PROTOCOL.md`) : sept étapes, cinq axes
notés sur [0 ; 1] par pas de 0,25, barème explicite, questions écrites à partir des **objectifs
annoncés** par la leçon, réutilisation des **151 items d'évaluation déjà taxonomés du produit**
quand ils couvrent la leçon. Échantillon de **24 leçons**, graine **20260909** publiée avant le
tirage, **0 leçon commune** avec l'échantillon aveugle de V71.

### 8.2 Les cinq axes, publiés séparément — jamais fusionnés (règle L5)

| axe | AVANT (CP5) | APRÈS (CP13) |
|---|---|---|
| RAPPEL | 1,000 | **1,000** |
| EXPLICATION | 1,000 | **1,000** |
| APPLICATION | 1,000 | **1,000** |
| MISCONCEPTION | 1,000 | **1,000** |
| TRANSFERT | 0,969 | **0,969** |
| **PRE-TEST** | **0,842** | **NON REJOUABLE** |
| `DELAYED_RECALL` | NOT MEASURED | **NOT MEASURED** |

### 8.3 **Lire ceci avant le verdict : l'instrument n'a pas discriminé**

**Avant d'ouvrir une seule leçon, le lecteur simulé répondait correctement à 84,2 % des
questions d'application et de transfert.** Ce chiffre a été mesuré, pas estimé, sur chacune des
24 leçons.

Conséquence, et elle vide une partie du dispositif de son sens : **le gain attribuable au texte
est plafonné à 0,16 en moyenne.** Quatre axes sur cinq sont au plafond parce qu'un modèle de
langage arrive avec des connaissances massives sur l'asynchrone en JavaScript, le box model CSS,
les files de messages ou le chunking RAG. **Ce n'est pas un débutant qui découvre : c'est un
lecteur qui vérifie.** Aucun aménagement du protocole ne change cela.

**Les seuils L7 (application ≥ 0,70) et L8 (transfert ≥ 0,55) ont donc été franchis au premier
passage, sans effort, avec des marges de 0,30 et 0,42.** Ce sont des garde-fous contre un
effondrement, pas des mesures de qualité. Cette obligation de dire les choses ainsi a été
**pré-écrite au CP5, avant de connaître le résultat du CP13**.

### 8.4 Ce que ce résultat exclut quand même, et ce qu'il n'exclut pas

**Exclu** : qu'une de ces 24 leçons soit un texte creux qui se lit agréablement sans rien fournir
d'utilisable. Une leçon qui expose sans outiller aurait produit un RAPPEL haut et une
APPLICATION basse ; **cette signature n'apparaît nulle part** (règle L6 : 0 cas « texte fort /
restitution faible »).

**Non exclu** : qu'une leçon soit trop dense pour un débutant, qu'elle suppose un prérequis non
annoncé, qu'elle décourage, ou qu'elle soit oubliée en 48 heures. **Trois de ces quatre
questions ne peuvent être tranchées que sur un humain** — d'où le §15.

### 8.5 Le second passage et ce qu'il pouvait détecter

L'interprétation du CP13 avait été **fixée au CP5, avant de le passer** : un score identique
serait le résultat attendu et ne prouverait rien ; **une baisse serait le seul signal réellement
détectable**, indiquant qu'une correction a retiré quelque chose d'utile.

Sur les 24 leçons de l'échantillon, **6 ont été modifiées par V72** et 18 sont identiques octet
pour octet — leurs notes sont **reportées et déclarées comme reportées**, jamais présentées comme
une seconde mesure. Sur les 6 modifiées, chaque proposition supprimée a été retrouvée :
`deployment-secrets` et `resilience-patterns` la donnent dans l'Objectif deux lignes plus bas ;
les trois propositions retirées de `monitoring-production` subsistent ; pour
`async-messaging-queues`, **les deux énoncés d'exercice ont été lus** pour vérifier que la
capacité déplacée est bien portée par son nouveau titulaire.

**Aucune baisse. Aucune leçon appauvrie.** Deux notes ont été volontairement **non remontées** :
`linux-resources-io` (le CP2 a amélioré le modèle mental sans combler l'absence de condition de
validité) et `cloud-azure-core` (la condition existait **déjà** au CP5 — la remonter corrigerait
mon jugement, pas le texte).

### 8.6 Les neuf seuils

| # | seuil | mesuré | état |
|---|---|---|---|
| **L1** | protocole gelé avant le premier passage | committé au CP4 | ✅ |
| **L2** | 24 leçons, graine publiée avant | 20260909, rejouable | ✅ |
| **L3** | passées AVANT **et** APRÈS | 24 / 24 | ✅ |
| **L4** | restitution sans accès au texte | attesté ; 18 reports déclarés | ✅ |
| **L5** | cinq axes séparés | aucune moyenne unique publiée | ✅ |
| **L6** | cas « texte fort / restitution faible » analysés | **0 cas** | ✅ |
| **L7** | APPLICATION ≥ 0,70 | **1,000** | ✅ |
| **L8** | TRANSFERT ≥ 0,55 | **0,969** | ✅ |
| **L9** | leçons dont les 5 axes < 0,50 | **0** | ✅ |

---

## 9. VERDICT 2 — `SIMULATED_LEARNING_VALIDATION_READY`, et ce qu'il ne vaut pas

# `SIMULATED_LEARNING_VALIDATION_READY`

**Dû par la lettre du contrat** : L1 à L9 sont tous atteints.

**Et il doit être lu avec le §8.3 collé à côté.** Un instrument dont le pré-test est à **0,842**
ne pouvait pas manquer L7 et L8. Ce verdict établit exactement ceci, et rien de plus :

> **Un lecteur qui connaît déjà 84 % du sujet, après une seule lecture, peut restituer ce que
> ces textes contiennent, l'appliquer à un cas neuf et réfuter l'erreur classique — sans y
> revenir.**

**Ce verdict ne dit pas que la pédagogie est validée. Il ne dit pas que des apprenants
apprennent.** Aucun test simulé par une IA ne remplace un apprenant réel.

## `REAL_HUMAN_LEARNING_EVIDENCE` = **NOT YET MEASURED**

**Aucun humain n'a suivi de protocole d'apprentissage.** Cette valeur ne changera pas tant que
ce ne sera pas le cas, quel que soit le résultat de n'importe quelle mesure simulée. Le §15
prépare le protocole ; il n'a **pas** été exécuté.

---

## 10. Validation opérationnelle — répartition par domaine (obligation §7 du contrat)

**687 blocs de code extraits du corpus.** Le principe : ne jamais prétendre au niveau N2 ou N3
ce qui n'a atteint que N1.

| domaine | EXECUTED (N2/N3) | STATICALLY CHECKED (N1) | NOT EXECUTABLE HERE (N4) |
|---|---|---|---|
| JavaScript / TypeScript / React | scripts de vérification, dont 3 React 18 | 111 `js`, 19 `ts`, 22 `tsx`, 17 `jsx` | — |
| Python / data / ML | scripts Python du corpus | 41 `python` | — |
| SQL | **`node:sqlite`** | 26 `sql` | — |
| Shell / Linux | commandes exécutables ici | **51 blocs shell valides** | — |
| Git | exécutable ici | — | — |
| **Docker** | mécanisme de construction (`FROM scratch`) | **21 Dockerfile valides**, 3 compose | **tirage d'images bloqué** (CDN `Forbidden`) |
| **Kubernetes** | — | **19 YAML valides**, `kubectl` syntaxiquement valide | **`kubectl` absent** |
| **systemd** | — | commandes valides | **systemd ne tourne pas** |
| **SSH** | — | commandes valides | **`ssh` absent** |
| **Cloud (AWS / Azure / Terraform)** | — | **aucun bloc de commande à valider** | sans objet — ces leçons sont conceptuelles |

**Le point le plus utile de cette table** : les six leçons cloud ne contiennent **aucune**
commande `aws`, `az` ou `terraform`. Il n'y avait rien à exécuter. La réserve de V71 — « ~14
leçons non vérifiées opérationnellement » — se réduit à **10** : 5 Docker, 3 Kubernetes, systemd,
SSH. Pour ces dix, la forme est validée statiquement.

**Les 50 scripts de vérification du corpus s'exécutent et passent** : 47 immédiatement, 3 après
installation de React 18 **hors projet** (supprimée ensuite). **0 échec réel.**

---

## 11. Tests négatifs — un gate jamais mis en échec n'est pas validé

**8 tests négatifs, 8 valides, restauration vérifiée octet pour octet.** Mais pas du premier
coup, et c'est le résultat qui compte :

> **Le test négatif n° 8 est resté vert devant une référence morte introduite exprès.** La cause :
> `md.matchAll(/^## .*(?:Pratique|Exercice).*$([\s\S]*?)(?=^## |$)/gm)` — avec le drapeau `m`,
> `$` marque la fin de **ligne**, donc le groupe paresseux capturait une **chaîne vide**. Le
> contrôle parcourait du néant et annonçait « 0 ».
>
> **Le même défaut existait dans le script rejouable livré au CP9.** La mesure du CP9 elle-même
> était correcte (faite en Python avec `\Z`), mais l'instrument publié pour la rejouer était sans
> valeur. Les deux fichiers ont été corrigés.

C'est exactement ce que l'obligation de test négatif existe pour attraper, et elle l'a attrapé.

---

## 12. Le parcours vu de bout en bout (CP14)

**Question posée** : le parcours ressemble-t-il à une formation construite, ou à 365 blocs
assemblés ?

**Réponse : une formation construite — mais en deux régimes qui ne se raccordent pas.**

**Ce qui tient.** L'ordre des prérequis tient **sans une seule exception** sur les 106 leçons
programmées. **Aucune des 52 revues** n'envoie vers une leçon jamais rencontrée. Chaque journée a
au moins une leçon rattachée. Sept produits nommés portent le parcours, dont **DocSense sur
32 journées** (j302 → j338).

**Ce qui change au milieu, sans être annoncé.** Les 313 journées de travail se découpent en
**64 séquences continues** de même compétence, de longueur médiane **2 jours** :

| compétence | séquences | lecture |
|---|---|---|
| `jsts`, `se` | **8** chacune | reviennent tout au long des cinq premiers mois |
| `autonomy` | 7 | tissée de j44 à j365 |
| `algo` | 6 | revisitée après son bloc initial |
| `ml`, `dl`, `llm` | **1** chacune | un seul bloc, jamais revu |

Un apprenant du mois 2 retrouve JavaScript huit fois, réparties. Un apprenant du mois 6 voit le
machine learning **une fois, pendant 30 jours, et ne le revoit plus.** Les deux moitiés du
parcours n'appliquent pas la même théorie de la mémoire, et rien ne le dit à l'apprenant.

**Trois autres constats du CP14 :**

1. **`difficulty` est constant sur 276 journées consécutives** (j90 → j365, toutes à 3/5). Les
   treize journées de difficulté 4 sont toutes entre j25 et j89. Le champ est **affiché à
   l'apprenant** : j320, qui enseigne tout Docker et une introduction complète à Kubernetes,
   s'annonce comme j100, qui enseigne à remonter un `useState`.
2. **Le statut des leçons liées est ambigu.** 26 journées donnent un découpage horaire complet ;
   celui de j1 remplit ses 4 h 30 sans réserver une minute aux trois leçons qu'il lie — alors
   que la page affiche « Dont lecture ~80 min ». Rien ne dit à l'apprenant si les leçons de fond
   sont **à lire aujourd'hui** ou **disponibles quand il en aura besoin**. Sur les 24 journées
   concernées, **19** ont une lecture liée qui dépasse leur créneau de théorie, jusqu'à +34 min.
3. **La seule correction du CP14** : j320 liait **9 leçons / 219 min** pour un budget de 270 —
   la seule journée de travail infaisable des 365. Trois de ces leçons (66 min) étaient des
   leçons d'**évaluation** attachées par l'étiquette `evalia`, sur une journée dont le titre,
   l'objectif et la totalité du cours portent sur la dockerisation. Retirées : **152 min,
   BALANCED**. Les huit conditions M1→M8 sont vérifiées une par une ; les trois leçons restent
   attachées à 20, 62 et 37 journées, dont cinq de la même semaine.

---

## 13. Le défaut de méthode : mesurer un marqueur au lieu de la propriété

V71 avait documenté ce défaut. **V72 l'a rencontré au moins huit fois de plus** — et, à la
différence de V71, **il a été attrapé avant publication à chaque fois**.

| CP | la sonde disait | la lecture disait | cause |
|---|---|---|---|
| CP0 | 25 leçons sans livrable | **4** renvois + 1 faux positif | liste de verbes de production incomplète |
| CP9 | 10 pratiques échouent à P3 | **0** | recherche de « critère de réussite » au singulier |
| CP10 | 4 blocs shell invalides | **0** | `<nom>` lu comme une redirection |
| CP10 | 17 Dockerfile invalides | **0** | `SELECT … FROM` en SQL capté par `/^\s*FROM\s+\S/m` |
| CP12 | 4 puis 3 prérequis non annoncés | **2 réels** | découpage ligne à ligne séparant la citation de son encadré |
| CP12 | 0 référence morte | **contrôle creux** | `$` en mode `m` ⇒ capture vide (§11) |
| CP14 | `evalia` non enseigné au mois 6 | **massivement enseigné** | lecture de l'**étiquette** au lieu du contenu |
| CP14 | 545 liens de leçon en trop | **artefact** | reconstruction ad hoc de `LESSON_BY_SKILL` |

**Une correction de comptage à faire ici même.** La série numérotée dans les rapports va de la
« huitième » (CP0) à la « onzième » occurrence (CP14) — soit quatre. Les quatre autres, toutes
au CP10 et au CP12, ont été **documentées mais jamais numérotées**. **La numérotation
sous-compte.** Le chiffre honnête pour V72 est **huit**, et il est publié ici pour que la série
cesse d'être fausse.

**Le CP14 a ajouté une variante différente, et plus insidieuse** : non pas un marqueur mal
choisi, mais une **hypothèse jamais testée** dans un modèle par ailleurs correct — compter une
relecture au prix d'une lecture à froid. Elle portait à elle seule la conclusion « des journées
sont infaisables ». La parade employée n'est pas de choisir un meilleur coefficient, c'est de
**publier la sensibilité** (§5).

---

## 14. Ce qui reste ouvert — et ce qui est réservé à l'utilisateur

### Réservé par le contrat gelé au CP1, non tranché par V72

**1. `cloud` est déclarée et jamais enseignée**, avec un score attendu au mois 11. Deux
réparations, et deux seulement :

- **retirer `cloud` des compétences déclarées** — le programme cesse de promettre ce qu'il
  n'enseigne pas. Honnête, et cela réduit le périmètre affiché du produit ;
- **donner des journées à `cloud`** — il faudrait en prendre à d'autres compétences, puisque le
  total est figé à 365. C'est un arbitrage de curriculum, pas une correction.

**Une contrainte technique à connaître avant de choisir la seconde** : le bloc cloud ne peut pas
s'insérer avant le jour 320, parce que `cloud-fundamentals` dépend de `docker-containers`.

### Ouvert, et faisable — par ordre de valeur

**2. Dix-huit thèmes de semaine décrivent une autre semaine que la leur**, dont **neuf** qui
contredisent la synthèse de leur propre page de revue (j42, j49, j70, j77, j84, j196, j217,
j224, j238). Dans les neuf cas la **synthèse est juste** — elle cite les six journées réelles —
et c'est le **thème déclaré** qui est faux. Les décalages vont de **−1 à −11 semaines** avec des
collisions : **il n'y a pas de décalage constant à corriger**. Réparer demande de réécrire
18 intitulés à la main. **C'est le premier chantier éditorial concret**, et le plus visible pour
un apprenant.

**3. Les revues sont les journées les plus chargées de la semaine** (§5). La cause est
identifiée et chiffrée : la relecture des leçons pèse 92 % de la lecture d'une revue et n'est
jamais budgétée, alors que 40 revues sur 52 minutent leur pratique. Deux directions possibles —
baisser le plafond de leçons d'une revue (7 aujourd'hui), ou budgéter explicitement la relecture
dans le texte de la revue. **Aucune n'est décidée ici** : le plafond a été gelé au CP1 et le
déplacer après mesure serait exactement ce que le contrat interdit.

**4. `difficulty` ne varie plus après le jour 89**, et reste affiché. Le corriger demande de
réévaluer 365 journées — un jugement de curriculum — et modifierait au passage les fourchettes
de charge, qui en dépendent.

**5. Le statut des leçons liées** : lecture du jour, ou étagère ? La réponse décide de la charge
réelle des 365 journées et de la lecture du champ `readingMinutes`. **C'est une question de
produit, pas un défaut du corpus.**

**6. Le changement de régime au mois 6** : entrelacement dense d'abord, blocs longs ensuite. Ce
n'est pas nécessairement un défaut — apprendre le machine learning demande une plage continue —
mais ce n'est annoncé nulle part, et cela concerne directement le Retention Engine.

---

## 15. Protocole de test humain léger — préparé, **non exécuté**

`docs/v72/V72-PROTOCOLE-TEST-HUMAIN.md`, écrit au CP15 et **jamais lancé**.

**Dimensionnement délibérément petit** : 5 à 8 participants du profil visé, 2 séances de 90 min
à **48 h d'intervalle**, 3 leçons chacun — 12 à 20 heures de participants au total.

**Ce qu'il ajoute et que rien d'autre ne peut donner** : le rappel différé **réel**. Le protocole
simulé avait déclaré `DELAYED_RECALL = NOT MEASURED` parce qu'un agent n'oublie pas entre deux
tours. Un humain, si.

**Ce qu'il ne donnera pas, et qui doit être dit d'avance** : aucun taux, aucun pourcentage,
aucune inférence sur une population. Cinq lecteurs révèlent les blocages massifs — le paragraphe
où tout le monde décroche, le prérequis que personne n'avait. Rien de plus.

**Rien n'est lancé.** Trois décisions appartiennent à l'utilisateur : recruter ou non, qui anime
(pas l'auteur des leçons testées), et ce qu'on fait du résultat.

---

## 16. Les deux questions finales

### 16.1 Un apprenant qui suit les 365 jours dans l'ordre rencontre-t-il la bonne connaissance au bon moment, avec une charge réaliste ?

# **OUI AVEC RÉSERVES**

**Le « oui » porte sur l'ordre, et il est solide.** Les prérequis tiennent sans une seule
exception sur 106 leçons programmées. Aucune revue n'introduit ce qu'elle prétend réviser.
Chaque journée a de quoi lire. Les compétences transversales — `autonomy`, `comm`, `secu` — sont
tissées sur toute l'année plutôt qu'empilées. Sept produits nommés donnent une continuité réelle.
**Ce n'est pas un assemblage de 365 blocs.**

**Le « avec réserves » porte sur trois choses précises, et pas sur une impression :**

1. **Une compétence sur vingt est promise et jamais enseignée**, avec une cible chiffrée au mois
   11. Un apprenant qui suit les 365 jours dans l'ordre ne rencontrera **jamais** `cloud`.
2. **La charge est réaliste les six jours de travail, et douteuse le septième.** La journée de
   revue — celle qui consolide — est près de trois fois plus souvent en dépassement que les
   autres, et 92 % de son poids est une relecture jamais budgétée.
3. **La seconde moitié du parcours cesse de dire à l'apprenant où il en est** : `difficulty` fige
   à 3 pendant 276 journées, l'entrelacement laisse place à des blocs de 30 jours sans retour, et
   le découpage horaire disparaît après le jour 26.

**Ce que cette réponse ne dit pas.** Elle ne dit pas qu'un apprenant apprend. La charge est
« réaliste » au sens où le travail demandé tient dans le temps annoncé — pas au sens où
quelqu'un l'a tenu. **Personne n'a suivi ces 365 jours.**

### 16.2 Peut-on arrêter les gros sprints académiques et revenir au Learning / Retention Engine ?

# **OUI**

**Et pas parce que tout est vert — précisément parce que tout ne l'est pas, et que ce qui reste
n'est plus de nature académique.**

**Ce qui est fini.** L'exactitude du texte a été certifiée par V71 et n'a pas bougé. Les
redondances R2 et R3 sont à zéro. Les défauts factuels sont à zéro. Les références mortes sont à
zéro. Les pratiques nomment toutes un livrable et un critère. L'ordre des prérequis tient. Les
invariants tiennent, les 52 gates sont verts, les 1420 tests passent, et huit tests négatifs
prouvent que ces gates savent rougir. **Un sprint académique de plus rencontrerait un corpus
qu'il n'a plus de raison de toucher** — et V72 vient de montrer, chiffres à l'appui, qu'à ce
stade la réécriture apporte +0,12 % de volume et aucun gain mesurable.

**Ce qui reste ne se traite pas par un sprint académique**, et c'est le vrai argument :

| ce qui reste | ce que c'est réellement |
|---|---|
| `cloud` déclarée sans journée | **une décision de périmètre produit** |
| 18 thèmes de semaine mal attribués | **un chantier éditorial ciblé**, 18 intitulés |
| la charge des revues | **une question de conception du rituel de révision** |
| `difficulty` figé, découpage horaire disparu | **une question d'interface et de signal à l'apprenant** |
| entrelacement puis blocs longs | **une question de rétention** — donc précisément le Retention Engine |

**Et la dernière ligne est la raison décisive.** Le seul résultat de V72 qui touche à
l'apprentissage lui-même — la première moitié du parcours entrelace, la seconde bloque — est un
problème de **rétention**, pas de contenu. Le corpus ne peut plus répondre à cette question. Le
Learning / Retention Engine, oui.

**Ce qu'il ne faut pas faire.** Le brief l'interdisait d'avance et la mesure le confirme : **ne
pas ouvrir V73 comme un nouveau sprint académique par défaut.** Les cinq chantiers ouverts au
§14 sont chacun plus petit que ce qu'un sprint académique coûterait, et aucun ne demande de
relire 128 leçons.

---

## 17. État final et vérifications

| contrôle | résultat |
|---|---|
| `npm test` | **1420 / 1420** |
| `npx tsc --noEmit` | **0** |
| `npm run gates:active` | **52 gates verts** |
| `npm run build` | **OK** |
| tests négatifs | **8 / 8 valides**, restauration octet pour octet |
| corpus des 128 leçons | **`c1ac869e…`** — gelé dans les 9 gates de corpus |
| invariants | **128 leçons / 365 journées / 365 corrections**, ordre `days[i].day === i+1` |
| `data/progress.json` | **jamais touché** |
| journées de travail IMPOSSIBLE | **0** |

### Les deux verdicts, ensemble et non fusionnés

| | |
|---|---|
| **CURRICULUM_INTEGRITY** | **`NOT_READY`** — 7 seuils sur 10 atteints ; le seul obstacle au statut `CANDIDATE` est C3, réservé à l'utilisateur |
| **SIMULATED_LEARNING_VALIDATION** | **`READY`** — L1 à L9 atteints, **avec un pré-test à 0,842 : l'instrument n'a pas discriminé** |
| **REAL_HUMAN_LEARNING_EVIDENCE** | **`NOT YET MEASURED`** — aucun humain n'a suivi le protocole |

**Rien n'a été lancé automatiquement.**
