# V75 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption : relire ce fichier,
> vérifier Git, reprendre au CP indiqué. **NE PAS refaire un CP terminé.**
> **V74 est terminé** — verdict `RETENTION_ENGINE_READY`, rapport `docs/v74/V74-FINAL-REPORT.md`.
> **NE PAS reconstruire le Retention Engine. NE PAS rejuger ses critères gelés.**

## Position

- **dernier CP terminé** : **CP3**
- **CP courant** : —
- **sous-lot courant** : —
- **NEXT_CP** : **CP4** — désambiguïsation des 376 exercices (D8)
- **NEXT_ACTION** : traiter **D8**. Résoudre ce qui est RÉELLEMENT résoluble parmi les 376
  exercices, à partir de : `practiceRefs` · rattachement par journée · métadonnées de leçon ·
  métadonnées explicites d'exercice · graphe de curriculum. **Priorité à la déclaration
  explicite.** Conserver `MULTI_CONCEPT_BY_DESIGN` en multi, conserver `AMBIGUOUS` en ambigu.
  **OBJECTIF : réduire l'ambiguïté RÉELLE, pas la cacher** — et ne jamais choisir arbitrairement
  une leçon pour verdir la métrique. Point de départ mesuré au CP0 : `UNAMBIGUOUS` **140** ·
  `RESOLVABLE_FROM_CONTEXT` **32** · `MULTI_CONCEPT_BY_DESIGN` **67** · `AMBIGUOUS` **137** ·
  `ORPHAN` **0**. La cible honnête est de faire baisser les **137**, pas de les reclasser.

## Repères Git

| | |
|---|---|
| dépôt | `Fourat23/Ai-carreer-os` (**deux `r`**) |
| branche canonique | `claude/ai-career-os-saas-phfg49` |
| HEAD au début de V75 | `98af8f4` (fin V74) |
| local == origin | oui |
| working tree | propre · stash vide · `data/progress.json` absent |

## Invariants (à revérifier à chaque CP)

`128` leçons · `365` journées · `52` semaines · `12` mois · corpus des leçons `92d5fae6` ·
**`data/progress.json` n'existe pas** — l'invariant est de ne jamais le créer ·
`1612/1612` tests · `tsc 0` · **47 portes** sans violation (dont `v74:check`) · build OK.

## Décisions gelées

- **CP0** : aucune (lecture seule). Les seuils d'acceptabilité d'un arriéré sont **délibérément
  NON posés** au CP0 — le brief l'interdit avant le CP1.
- **CP1** : contrat gelé `docs/v75/V75-RECOVERY-CONTRACT-FROZEN.md`. Décisions structurantes :
  - **12 interdits `R1→R12`** repris du brief, dont **R1 cacher la dette** et **R6 diminuer un
    arriéré en retirant des concepts de la mesure**.
  - **`PARKED ≠ MASTERED`** — la distinction qui porte tout le contrat, rendue vérifiable par
    cinq invariants `I1→I5`, dont **I2 : `total = actif + différé + garé`, exactement**.
  - **`BACKLOG_PRESSURE` est une LISTE DE CINQ FACTEURS NOMMÉS**, jamais un score : `bloquantes`
    · `echecsNonRepris` · `volume` · `minutesRequises` · `anciennete`. **Il n'existe aucun
    nombre unique appelé « pression ».**
  - **Le déclencheur principal est `bloquantes`, PAS le volume** — raison écrite : *60 notions
    en retard dont aucune n'est exigée avant un mois ne sont pas une difficulté ; 4 notions
    prérequises de la semaine prochaine, si.* Déclencher sur le volume punirait le premier
    apprenant et manquerait le second (**R11**).
  - **Quatre modes** `NORMAL / CATCH_UP / RECOVERY / CRITICAL`, seuils **déclarés et publiés**,
    `HORIZON_ESSENTIEL = 14 jours`.
  - **`CRITICAL` RECOMMANDE une pause, ne l'impose jamais** ; `PAUSED_CURRICULUM` est un choix
    de l'apprenant, que le moteur ne peut qu'enregistrer.
  - **`RECOVERY_EXIT` posé AVANT toute mesure** : `E1` aucune bloquante · `E2` ≤ 2 échecs non
    repris · `E3` minutes ≤ 2× budget · `E4` tenu **2 jours actifs consécutifs**
    (anti-oscillation). *Si la mesure montre qu'on n'en sort jamais, c'est le moteur qu'il faudra
    corriger, pas le seuil.*
  - **14 critères bloquants `V1→V14`** et 5 non bloquants, échelle de verdict gelée.
    **`N3` (part garée) est non bloquant ET surveillé** : le CP13 publiera **total, actif et
    garé séparément**, parce que tout mettre au garage ferait chuter l'arriéré actif sans rien
    résoudre — `R2` et `R6` déguisés.

- **CP2** : modèle événementiel V2 — `lib/event-model.mjs`. Décisions structurantes :
  - **D3 TRANCHÉE : l'événement est TYPÉ, pas supprimé.** Quatre options étaient ouvertes ;
    « disparaître » était tentant (0 lecteur) mais **supprimer un champ persisté est une
    migration destructive**, interdite par le brief — *un fait qu'on ne lit plus n'est pas un
    fait qu'on a le droit d'effacer*. « Remplacer par `ExerciseAttempt` » a été refusé : celui-ci
    parle du grain EXERCICE, `DayAttempt` dit « j'ai travaillé cette journée » — les confondre
    serait mélanger deux grains que ce sprint passe son temps à séparer.
  - **`ATTEMPT_OUTCOMES` ferme le vocabulaire** (chaîne libre → 5 valeurs) ; provenance
    obligatoire sur un fait NOUVEAU, `legacy` sur un fait ANCIEN ; clé métier `jour+seconde+issue`.
  - **D6 payée additivement** : `at`, `provenance`, `schemaVersion` ajoutés aux revues
    hebdomadaires. **`score` reste une AUTO-ÉVALUATION et est renommé `scoreDeclare`** — le CP0
    de V74 avait établi l'excès de déclaratif dans ce produit, et *la réponse n'est pas de
    maquiller une déclaration en mesure mais de la nommer*. L'ancien champ `score` reste écrit.
  - **RÈGLE CENTRALE : refuser le NOUVEAU mal formé, accepter l'ANCIEN en le rendant visible.**
    Un fait sans provenance est marqué `producer: 'legacy'` et `schemaVersion: 1` plutôt que
    laissé muet — sans quoi on ne distingue plus « champ absent parce qu'ancien » de « champ
    absent parce que mal écrit », qui est le contournement **G9** de V74 appliqué aux métadonnées.

- **CP3** : **D4 payée** — `evidence.conceptIds`, une **LISTE**. Décisions :
  - **Le champ est une liste, et c'est la décision du checkpoint.** Le CP0 a mesuré **67
    exercices multi-concepts PAR CONCEPTION** : forcer un concept unique obligerait à en choisir
    un arbitrairement, c'est-à-dire à fabriquer de la donnée — ce que V74 avait refusé pour son
    option C. *Un champ singulier aurait rendu la dette invisible au lieu de la représenter.*
  - **Strictement ADDITIF** : `competencyIds` n'est jamais retiré ; une preuve **sans** concept
    reste valide (137 exercices sont réellement ambigus — exiger un concept les rendrait tous
    irrecevables) ; une liste **vide** signifie « concept inconnu », jamais « aucun concept ».
  - **Contrat en DEUX TEMPS, écrit pour ne pas être oublié** : `lib/evidence.mjs` est PUR et ne
    valide que la **forme** d'un slug ; `lib/evidence-concepts-server.ts` valide l'**appartenance
    au catalogue** des 128 leçons. Énumérer les 128 slugs dans le module pur a été refusé
    (« énumérer plutôt que dériver »), le rendre impur aussi.
  - **Effet réel sur la projection** : une preuve qui DÉCLARE ses concepts n'est plus **diluée**
    sur les 3 à 15 leçons de sa journée. Sans déclaration, le rattachement par journée reste le
    repli — c'est un repli, pas une régression.

## Mesures BEFORE (CP0 — à ne jamais reconstruire ni écraser)

### Arriéré, 20 profils, 365 jours, budget 20 min

| # | profil | rencontrées | backlog max | % corpus | final | jamais prop. | retour sous contrôle | comp. bloquantes (pic) |
|---|---|---|---|---|---|---|---|---|
| A | parfait | 121 | 11 | 9 % | 0 | 0 | 3 j | 6 |
| B | irrégulier | 106 | 85 | **80 %** | 81 | 0 | **jamais** | 12 |
| C | nombreux échecs | 121 | 111 | **92 %** | 103 | 0 | **jamais** | 12 |
| D | faible activité | 58 | 32 | 55 % | 32 | 25 | **jamais** | 11 |
| E | rapide | 121 | 31 | 26 % | 0 | 0 | 27 j | 6 |
| F | oublis sélectifs | 121 | 20 | 17 % | 17 | 0 | **jamais** | 8 |
| G | reprise après 30 j | 107 | 43 | 40 % | 10 | 0 | 28 j | 9 |
| H | sans preuves | 121 | 25 | 21 % | 2 | 0 | 17 j | 7 |
| I | absence 7 j | 114 | 29 | 25 % | 8 | 0 | 20 j | 8 |
| J | absence 14 j | 112 | 40 | 36 % | 7 | 0 | 22 j | 9 |
| K | absence 60 j | 105 | 52 | 50 % | 22 | 0 | 19 j | 10 |
| L | 30 % de réussite | 121 | 120 | **99 %** | 115 | 0 | **jamais** | 12 |
| M | 50 % de réussite | 121 | 109 | **90 %** | 105 | 0 | **jamais** | 12 |
| N | 70 % de réussite | 121 | 68 | 56 % | 48 | 0 | **jamais** | 12 |
| O | fort mais intermittent | 96 | 39 | 41 % | 39 | 1 | **jamais** | 9 |
| P | suit les jours, saute la pratique | 121 | 59 | 49 % | 40 | 0 | **jamais** | 11 |
| Q | lit la correction avant | 121 | 56 | 46 % | 35 | 0 | **jamais** | 11 |
| R | recall OK, transfert KO | 121 | 16 | 13 % | 1 | 0 | 7 j | 7 |
| S | rapide puis arrêt 90 j | 109 | 58 | 53 % | 0 | 0 | 57 j | 6 |
| T | reprend au j250, fondations fragiles | 62 | 47 | **76 %** | 43 | 0 | **jamais** | 12 |

**11 profils sur 20 ne reviennent JAMAIS sous contrôle** : B C D F L M N O P Q T.
**Cinq pires saturations** : L 99 % · C 92 % · M 90 % · B 80 % · T 76 %.

### Télémétrie — événements réellement persistés

| événement | conceptId | competencyIds | outcome | provenance | idempotence |
|---|---|---|---|---|---|
| `ExerciseAttempt` | — | — | dérivé (success/partial/failure) | obligatoire | `exerciseId`+s+`p/t` |
| `RecallAttempt` | **oui** | — | recalled/partial/failed | oui | `conceptId`+s+`format` |
| `Evidence` | **— ← D4** | oui (20) | `validation.status` | oui | `sourceType:sourceId:…` |
| `DayAttempt` (legacy) | — | — | **chaîne libre ← D3** | **—** | **AUCUNE** |
| `Submission` | — | via skills | `validation.status` | — | `stepId`+`at` |
| `WeeklyReview` | — | — | — | **—** | clé = n° de semaine |
| `TransferAttempt` | **INEXISTANT** | | | | |

### Dettes, mesurées

| dette | mesure CP0 |
|---|---|
| **D3** | 1 producteur · **0 consommateur réel** de `attempts.count/history` · outcome = chaîne libre · ni provenance ni idempotence |
| **D4** | `evidence[]` porte `competencyIds` (20), **jamais** `conceptId` (128) |
| **D6** | objet libre indexé par n° de semaine · **aucun horodatage** · 6 fichiers y touchent |
| **D8** | `UNAMBIGUOUS` **140** · `RESOLVABLE_FROM_CONTEXT` **32** · `MULTI_CONCEPT_BY_DESIGN` **67** · `AMBIGUOUS` **137** · `ORPHAN` **0** |
| **D10** | route `app/transfer` **absente** · navigation **absente** · **0/365** journées citant un défi · **0** référence dans `program.json` · type de preuve **présent** (V74·CP11) |

### UX du retard — ce que l'apprenant voit RÉELLEMENT

État synthétique à **84 notions OVERDUE** (mesuré sur le rendu réel, serveur lancé) :

| | |
|---|---|
| arriéré RÉEL | **84** |
| annoncé par la page (« Dues aujourd'hui ») | **8** |
| cartes affichées | **3** |
| panneau « Écarté aujourd'hui » | **5 lignes**, toutes « budget de la session atteint » |

## Défauts de PRODUIT découverts au CP0

| # | défaut | preuve |
|---|---|---|
| **P1** | **le facteur `besoinProche` (15 points sur 100) ne peut JAMAIS s'allumer.** `nextCurriculumNeed` n'est rempli que sur les **compétences** ; le scheduler consomme `projection.concepts` (`plan-jour-server.ts:134`), où il vaut toujours `null`. Second verrou indépendant : le read-model passe `startDate: null`, donc `positionDuJour` rend 0 et aucun projet n'est jamais « proche ». Conséquence collatérale : la règle du CP4 « avant un projet proche, forme appliquée » ne s'allume jamais non plus | vérifié par exécution : concept → `null`, compétence → `{day:9,inDays:3}` |
| **P2** | **l'arriéré réel n'est jamais montré.** La page affiche `s.queue.length`, c'est-à-dire la file V66 **plafonnée à 8**, comme s'il s'agissait du total. 84 réels → « 8 » annoncés → 3 cartes | rendu réel mesuré |
| **P3** | **un apprenant qui suit les journées sans pratiquer ne reçoit AUCUNE remédiation** (profil P : 0 remédiation sur 365 jours), parce que la remédiation est déclenchée par une tentative d'exercice | simulation profil P |

## Anomalies de mes propres sondes (V75)

| # | CP | ce que la sonde mesurait | ce qu'elle prétendait mesurer |
|---|---|---|---|
| **1** | CP0.A | `nextCurriculumNeed` lu sur les **concepts** (toujours `null`), puis au **jour 365** (où aucun projet n'est futur) | les **compétences bloquantes**. Rendait **0 pour les vingt profils**. Trois versions ont été nécessaires : mauvais grain, puis mauvais moment, puis correcte (pic pendant le parcours → 6 à 12) |
| **2** | CP0.A | le **nombre d'unités** écartées | des « minutes différées ». Renommé `unitesDifferees` |

## Fichiers

- **CP3** : **créés** `lib/evidence-concepts-server.ts`, `tests/v75-concept-evidence.test.mjs` (9).
  **Modifiés** `lib/evidence.mjs` (`conceptIds` + `programConcepts` + `MAX_CONCEPTS`),
  `lib/evidence.d.ts`, `lib/lab-progress.mjs` + `.d.ts`, `app/api/lab/[exerciseId]/route.ts`
  (la preuve du laboratoire porte ses concepts), `lib/learner-memory.mjs` (la projection les lit).
- **CP2** : **créés** `lib/event-model.mjs`, `tests/v75-event-model.test.mjs` (15).
  **Modifiés** `lib/learning.mjs` (D3 : `recordAttempt` typé + normaliseur additif),
  `lib/learning-engine.mjs` (D6 : revue hebdomadaire horodatée et tracée).
- **CP1** : **créé** `docs/v75/V75-RECOVERY-CONTRACT-FROZEN.md`. **Aucun fichier de produit.**
- **CP0** : **créés** `scripts/v75/cp0-forensics.mjs`, `scripts/v75/cp0-backlog.mjs`,
  `docs/v75/cp0-forensics.json`, `docs/v75/cp0-backlog.json`,
  `docs/v75/V75-CP0-FORENSICS.md`, `docs/v75/V75-STATE.md`. **Aucun fichier de produit modifié.**

## Tests exécutés

- **CP3** : **1636/1636** (9 nouveaux) · tsc 0 · **build OK** · `gates:active` **0 violation**
  (47 portes) · **4 mutations VUES rougir** · **1 test a trouvé du code mort** (`conceptIds`
  calculé puis jamais renvoyé par `normalizeEvidenceRecord`).
- **CP2** : **1627/1627** (15 nouveaux) · tsc 0 · `gates:active` **0 violation** (47 portes) ·
  corpus inchangé · `data/progress.json` absent · **4 mutations VUES rougir**.
- **CP1** : document seul, aucun code modifié — aucun test à rejouer.
- **CP0** : **1612/1612** · tsc 0 · build OK · `gates:active` **47 portes, 0 violation** ·
  corpus `92d5fae6` inchangé · `data/progress.json` absent. *(lecture seule — état hérité de V74)*

## Journal des CP

- **CP3** — **D4 payée : une preuve porte enfin ses concepts, et elle en porte PLUSIEURS.**
  - **La décision du checkpoint est le PLURIEL.** Le CP0 a mesuré 67 exercices multi-concepts
    *par conception* ; un champ singulier aurait obligé à trancher au hasard et aurait **rendu la
    dette invisible au lieu de la représenter**.
  - **Une preuve sans concept reste valide** — 137 exercices sont réellement ambigus, et exiger
    un concept les rendrait tous irrecevables ou pousserait à en inventer un.
  - **Contrat en deux temps** : forme validée dans le module PUR, appartenance au catalogue
    validée côté serveur. Les deux alternatives (énumérer 128 slugs, ou rendre le module impur)
    ont été écartées et la raison est écrite dans le code.
  - **L'effet est réel, pas déclaratif** : un test vérifie qu'une preuve déclarant `alpha` ne
    crédite plus `gamma`, enseignée le même jour. Avant le CP3, elle créditait les trois.
  - **UN TEST A TROUVÉ DU CODE MORT** : `normalizeEvidenceRecord` calculait `conceptIds` et **ne
    le renvoyait pas**. Une preuve relue du disque perdait donc ses concepts en silence — le
    champ était payé à l'écriture et jeté à la lecture.
  - **4 mutations vues rougir** : concept forcé au singulier · `competencyIds` retiré · preuve
    sans concept refusée · preuve déclarante quand même diluée sur sa journée.
  - **1636/1636 · tsc 0 · build OK · 47 portes vertes.**

- **CP2** — **modèle événementiel V2 : refuser le nouveau mal formé, accepter l'ancien en le
  rendant visible.**
  - **D3 tranchée par la sémantique, pas par la commodité** : l'événement est **typé**, pas
    supprimé. Il avait pourtant **0 lecteur** — mais supprimer un champ persisté est une
    migration destructive, et la progression d'un apprenant réel peut déjà en contenir.
  - **D6 payée additivement** : les revues hebdomadaires ont enfin une **date**. Sans elle, une
    revue ne peut servir ni à une reprise ni à une télémétrie — et le CP0 avait mesuré qu'elle
    n'avait ni horodatage, ni provenance, ni version, ni **aucun lecteur**.
  - **Le `score` hebdomadaire reste déclaratif, et s'appelle désormais `scoreDeclare`.** La
    tentation était de le traiter comme une mesure ; le CP0 de V74 avait justement établi que ce
    produit a **trop** d'auto-déclaration. On le nomme au lieu de le maquiller.
  - **4 mutations vues rougir** : producteur non exigé sur un fait neuf · vocabulaire d'issue
    réouvert · provenance perdue sur une entrée ancienne (migration destructive) · score
    déborné.
  - **1627/1627 · tsc 0 · 47 portes vertes.**

- **CP1** — **contrat gelé. Aucun fichier de produit modifié.**
  - **La décision qui commande le sprint : `PARKED ≠ MASTERED`.** Garer une notion, c'est décider
    de ne pas la planifier aujourd'hui — **ni** l'avoir apprise, **ni** l'avoir retirée de la
    dette. Rendue vérifiable par `I2` : *`total = actif + différé + garé`, exactement*.
  - **`BACKLOG_PRESSURE` n'est pas un score.** C'est une liste de cinq facteurs nommés, et la
    décision doit pouvoir se dire en une phrase : « mode récupération activé parce que 4 notions
    bloquantes sont en retard et que 3 échecs ne sont pas repris. »
  - **Le déclencheur est `bloquantes`, pas le volume**, et la raison est écrite dans le contrat :
    déclencher sur le volume **punirait** l'apprenant en avance sur ses révisions et **manquerait**
    celui qui est réellement bloqué.
  - **`RECOVERY_EXIT` est posé avant la première simulation**, avec une condition
    anti-oscillation (`E4`, 2 jours actifs consécutifs) — sans elle le produit annoncerait en
    alternance une bonne et une mauvaise nouvelle.
  - **`I5` répond directement au défaut P2 du CP0** : le nombre montré comme « en retard » doit
    être l'arriéré TOTAL, jamais une file plafonnée.

- **CP0** — **audit forensique, lecture seule. Aucun fichier de produit modifié.**
  - **11 profils sur 20 ne reviennent jamais sous contrôle**, et le pire n'est pas l'absence :
    les profils d'absence (I/J/K, 7/14/60 jours) **récupèrent tous** en 19 à 22 jours actifs,
    tandis que l'échec chronique (L 99 %, C 92 %, M 90 %) ne récupère jamais. **Le produit gère
    mieux l'absence que l'échec.**
  - **Même un apprenant à 70 % de réussite (N) sature à 56 % et ne revient jamais sous
    contrôle.** Ce n'est pas un cas extrême : c'est un apprenant correct.
  - **DÉFAUT P1** : le facteur `besoinProche` (15/100) est **mort en production** — mauvais
    grain et `startDate: null`. Découvert en corrigeant ma propre sonde.
  - **DÉFAUT P2** : **l'arriéré réel n'est jamais montré** — 84 réels, « 8 » annoncés, 3 cartes.
    Le produit cache déjà la dette, sans intention, par plafonnement d'affichage.
  - **DÉFAUT P3** : le profil P (suit les jours, saute la pratique) reçoit **0 remédiation**.
  - **D8 est plus fin que ce que V74 avait publié** : 137 exercices réellement ambigus, et non
    192 — 32 sont résolubles par un contexte de journée unique, 67 sont **multi-concepts par
    conception** (ce qui n'est pas un défaut).
