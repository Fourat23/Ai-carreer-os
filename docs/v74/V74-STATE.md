# V74 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption : relire ce
> fichier, vérifier Git, reprendre au CP indiqué. **NE PAS refaire un CP terminé.**
> **V73 est terminé et ne doit pas être relancé** — rapport canonique :
> `docs/v73/V73-FINAL-REPORT.md`, verdict `CURRICULUM_INTEGRITY_READY`.

## Position

- **dernier CP terminé** : **CP3**
- **CP courant** : —
- **sous-lot courant** : —
- **NEXT_CP** : **CP4** — scheduler V1
- **NEXT_ACTION** : construire le scheduler de rappel. **NE PAS appliquer aveuglément SM-2** —
  il peut servir de repère, mais AI Career OS n'est pas une application de cartes mémoire :
  une compétence technique demande parfois un rappel conceptuel, parfois un diagnostic, parfois
  du code, parfois une décision de conception. Le scheduler doit choisir **QUOI · QUAND · SOUS
  QUELLE FORME**. Il consomme `prioriser()` du CP3 et `projectLearnerMemory()` du CP2 ; il ne
  recalcule ni l'état ni la priorité. **Critère bloquant B2** : entrée identique + horloge
  identique → sortie strictement identique (tri total, aucune source d'aléa). Réutiliser
  `INTERVALS`, `interleave` et `availableFormats` de `lib/retention.mjs` plutôt que de les
  redéfinir — le contrat §4 assigne à V66 la responsabilité de la série de rappels.

## Repères Git

| | |
|---|---|
| dépôt | `Fourat23/Ai-carreer-os` (**deux `r`**) |
| branche canonique | `claude/ai-career-os-saas-phfg49` |
| HEAD au début de V74 | `b353ebd` (fin V73) |
| local == origin | oui |
| working tree | propre · stash vide · `data/progress.json` absent |

## Invariants (à revérifier à chaque CP)

`128` leçons · `365` journées · `365` corrections · `52` semaines · `12` mois ·
corpus des leçons `92d5fae6…` · **`data/progress.json` n'existe pas** — l'invariant est de ne
jamais le créer · `L1 = 0 · L2 = 0/52 · L3 = 6/365` (seuils de charge V73) ·
`1420/1420` tests · `tsc 0` · 52 portes sans violation · porte V73 verte ·
R1→R7 = 0 · 376/376 solutions de référence passantes.

## Décisions gelées

- **CP0** : aucune (lecture seule).
- **CP1** : contrat gelé `docs/v74/V74-RETENTION-CONTRACT-FROZEN.md`. Décisions structurantes :
  - **MEANINGFUL_CONTACT** défini par quatre faits écrits (M1 tentative de rappel · M2
    tentative d'exercice réellement exécutée · M3 preuve validée · M4 soumission non vide).
    **`status = 'done'` n'en est PAS un**, ni une page ouverte, ni une compréhension déclarée.
  - **RETRIEVAL** = trois conditions cumulatives : tentative (R-a) · **correction non ouverte
    avant** (R-b) · première tentative de l'artefact ce jour-là (R-c).
  - **PARTIAL ne fait ni progresser ni casser une série** (règle V66 reprise, car prudente).
  - **Les 5 statuts `UNKNOWN/OVERDUE/DUE/SOON/HEALTHY` NE SONT PAS des probabilités de
    mémoire** — états de planification uniquement. Ordre d'évaluation gelé et testé au CP14.
    Seuils : `FENETRE_SOON = 3 j`, `TOLERANCE_DUE = 7 j`.
  - **QUESTION CRITIQUE TRANCHÉE — option A retenue : `ExerciseAttempt` devient un FAIT
    CANONIQUE.** Raison sémantique, pas de commodité : *le système persiste aujourd'hui la
    PROJECTION (la preuve) et jette le FAIT (la tentative)* ; quand l'exercice échoue il n'y a
    pas de projection à écrire, donc rien n'est écrit. C'est le **seul événement du produit à
    verdict objectif**. Champ décisif : **`correctionSeen`**, sans lequel R-b serait décoratif.
  - **Option B retenue additivement** : `RecallAttempt` reçoit `durationMs`, `sourceKind`,
    `evidenceRef`, **avec valeurs par défaut** — aucune donnée historique invalidée.
  - **Option C REFUSÉE en tant qu'équivalence**, retenue en **règle dérivée qualifiée
    `DERIVED_RECALL`** (4 conditions). **Mesure qui commande la décision : 207 exercices sur
    376 sont rattachables à un concept par déclaration ; les 169 autres ont une MÉDIANE DE 3
    leçons candidates (max 15).** Traduire les 376 automatiquement obligerait à choisir
    arbitrairement — ce serait fabriquer de la donnée.
  - **Option D REFUSÉE** : pas de quatrième moteur.
  - **Idempotence** : clés métier gelées (`exerciseId`+seconde+`passed/total` ;
    `conceptId`+seconde+`format`), **provenance obligatoire**, **horodatage serveur
    uniquement**, tri à la lecture, bornes à 20 000.
  - **Responsabilités DISJOINTES des trois mécanismes** : V19 = relecture de journée depuis la
    compréhension déclarée (devient **un signal d'intention**) · V66 = série de rappels par
    concept (devient **un facteur**) · 52 revues = **le seul rendez-vous FREE_RECALL** (cessent
    de décider QUOI réviser). **L'arbitre est au-dessus, il ne remplace rien.**
  - **Architecture en 8 couches** documentée (entrée, sortie, mutabilité, source de vérité,
    déterminisme, responsabilité) + deux règles transverses : aucune couche n'écrit au-dessus
    d'elle ; toute couche déterministe rend une sortie identique à entrée identique.
  - **DOUZE contournements interdits G1→G12**, dont **G9 « absence d'échec enregistré =
    absence d'échec »** et **G12 « ajouter un bloc de rappel aux 313 journées ferait passer le
    FREE_RECALL de 52 à 365 sans qu'aucune propriété ne change »**.
  - **12 critères BLOQUANTS B1→B12** (dont **B12 : `READY` interdit si le scheduler n'est pas
    réellement utilisé par le produit**) et **5 NON bloquants N1→N5**. **N1 et N2 —
    l'espacement — sont délibérément NON bloquants** : le CP0 a montré que la cause dominante
    est le rattachement des leçons (défaut de curriculum `P1-CP13-1` de V73), et les rendre
    bloquants forcerait V74 à modifier le curriculum pour verdir une métrique de rétention.
  - **4 hypothèses déclarées non prouvées** (H1→H4) et **4 incertitudes**, dont
    `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED`, **inchangé par V74**.

## Mesures BEFORE (CP0, à ne jamais reconstruire)

| mesure | valeur |
|---|---|
| intervalles entre contacts, **grain compétence** | n=828 · médiane **1** · P75 **1** · P90 5 · max 316 |
| intervalles entre contacts, **grain concept** | n=1068 · médiane **1** · P75 2 · P90 7 · max 316 |
| **intervalles valant exactement 1 jour** | **647/828 (78 %)** compétence · **785/1068 (74 %)** concept |
| intervalles > 60 jours | **13 / 828** |
| `exposition → première pratique` | **0 sur 19 compétences / 20** |
| `pratique → application` | `dl` **126** · `llm` **140** · `agents` **126** |
| paires leçon × revue | **247** · écart 1 j : **135 (55 %)** · 7 j et + : 29 (12 %) |
| **leçons liées aux SIX journées de leur semaine** | **94 / 247** → écart de 1 **inévitable** |
| leçons de revue issues de sa propre semaine | **218 / 247** |
| `FREE_RECALL` | **52 journées / 365**, **0 journée de travail** |
| `RECONSTRUCTION` | 52 / 365 |
| silences finaux ≥ 180 j | `jsts` 248 · `gitlinux` 288 · `sql` 213 · `python` 183 |
| plus longs trajets contact → projet exigeant | `dl` **58 j** · `ml` 44 · `llm`/`rag`/`agents`/`evalia` **37 j** |
| compétences sans journée de projet | `algo` `ds` `gitlinux` `patterns` `autonomy` |

## Fichiers modifiés

- **CP3** : **créés** `lib/retention-priority.mjs`, `tests/v74-retention-priority.test.mjs`.
  Aucun fichier existant modifié.
- **CP2** : **créés** `lib/exercise-attempt.mjs`, `lib/exercise-attempt.d.ts`,
  `lib/learner-memory.mjs`, `lib/learner-memory-server.ts`,
  `tests/v74-learner-memory.test.mjs`. **Modifiés** `lib/progress-store.mjs` (persistance
  additive), `lib/learning-engine.mjs` (commande `RECORD_EXERCISE_ATTEMPT`), `lib/types.ts`,
  `app/api/lab/[exerciseId]/route.ts` (**écriture de la tentative dans les deux cas**),
  `tests/progress-store.test.mjs` (forme de la progression vide).
- **CP1** : aucun fichier de produit. Créé : `docs/v74/V74-RETENTION-CONTRACT-FROZEN.md`.
- **CP0** : aucun fichier de produit. Créés : `scripts/v74/cp0-forensics.mjs`,
  `scripts/v74/cp0-learner-fields.json`, `docs/v74/cp0-forensics.json`,
  `docs/v74/V74-CP0-RETENTION-FORENSICS.md`, `docs/v74/V74-STATE.md`.

## Tests exécutés

- **CP3** : **1455/1455** (15 nouveaux) · tsc 0 · `gates:active` 0 violation · corpus
  `92d5fae6…` inchangé · `data/progress.json` absent · **B10 vérifié**, **B2 amorcé**.
- **CP2** : **1440/1440** (20 nouveaux) · tsc 0 · build OK · `gates:active` 0 violation ·
  porte V73 verte · corpus `92d5fae6…` inchangé · `data/progress.json` absent ·
  **B1 vérifié** (égalité stricte × 2 : rejeu et ordre d'insertion).
- **CP1** : document seul, aucun code modifié — aucun test à rejouer.
- **CP0** : lecture seule, aucun test rejoué (état hérité de V73 : 1420/1420 · tsc 0 ·
  52 portes · build OK · 376/376).

## Dette découverte

| # | dette | où |
|---|---|---|
| ~~**D1**~~ | ~~un exercice raté n'écrit RIEN~~ — **PAYÉE au CP2** : la tentative est écrite avant toute projection, succès ou échec | `app/api/lab/[exerciseId]/route.ts` |
| ~~**D2**~~ | ~~un exercice réussi n'émet pas de fait de rétention~~ — **PAYÉE au CP2** : `ExerciseAttempt` est persistée et le modèle mémoire la consomme | même fichier |
| **D3** | `RECORD_ATTEMPT` n'est appelé qu'une fois, avec `outcome: 'attempted'` en dur | `app/day/[id]/DayCorrection.tsx:35` |
| **D4** | `evidence[]` porte `competencyIds` (20), jamais `conceptId` (128) — **les grains ne coïncident pas** | `lib/evidence.mjs` |
| **D5** | **trois mécanismes de révision sans arbitre** : V19 journée, V66 concept, 52 revues | `lib/review.mjs`, `lib/retention.mjs`, générateur |
| **D6** | `weeklyReviews{}` est un objet libre, sans schéma normalisé | `lib/learning.mjs` |
| **D7** | aucune durée n'est attachée à une réactivation, aucune preuve d'utilité d'un rappel | `lib/retention.mjs` |

## Erreurs de sondes

| # | ce que la sonde mesurait | ce qu'elle prétendait mesurer |
|---|---|---|
| **4** *(CP3)* | le nombre de `', et '` dans une phrase | le nombre de **facteurs cités**. La phrase de l'échec contient elle-même « , et » : **la sonde mesurait la ponctuation**. Les identifiants cités sont désormais exposés à part. |
| **1** | « le prochain projet après le **dernier contact** » — une constante | le prochain besoin curriculaire, qui est **relatif à une date**. Donnait « aucun » pour les 20 compétences. **Re-mesuré.** |
| **2** | la **présence d'une section** dans le gabarit d'une journée | une **distribution de formes de révision**. 6 catégories sur 9 sortaient à 313-365 parce que toutes les journées ont ces sections. |
| **3** | `Mini-quiz` en texte libre → **236** journées | V73 comptait la **section** `## ❓ Mini-quiz` → **78**. Les deux sont justes et ne mesurent pas la même chose ; signalé, non tranché. |

## Journal des CP

- **CP3** — **priorité EXPLICABLE : sept facteurs additifs, bornés, publiés.**
  - **`lib/retention-priority.mjs`** — pur, horloge injectée. **Poids entiers dont la somme
    fait exactement 100**, vérifiée en test pour qu'aucune dérive silencieuse ne passe :
    ancienneté du rappel 30 · échec récent 20 · jamais tenté 15 · besoin proche 15 · niveau
    promis 10 · profondeur de prérequis 5 · contact passif 5.
  - **Additifs et bornés, délibérément** : pas de produit, pas d'exponentielle, pas de facteur
    de facilité flottant. On doit pouvoir dire « 40 points sur 100 viennent de ceci » sans
    dérouler un calcul. Un score qu'on ne peut pas décomposer n'a pas le droit d'exister ici.
  - **Le score n'est PAS une probabilité d'oubli** — le CP0 a déclaré cette grandeur
    UNMEASURABLE. C'est un **ordre de passage**, et il n'est jamais montré chiffré à
    l'apprenant (§9 du contrat interdit nommément « memory score = 0.637 »).
  - **B10 vérifié en test** : chaque unité proposée porte ses facteurs, leur valeur observée,
    leurs points, et une phrase lisible. **La justification cite AU PLUS deux facteurs** —
    au-delà, une justification cesse d'en être une et devient un rapport.
  - **G5 gardé par un test** : « récent » ne protège pas. L'ancienneté se compte depuis le
    dernier **rappel RÉUSSI**, pas depuis le dernier contact — avoir rouvert une page hier ne
    dit rien, avoir su la retrouver il y a trois semaines dit quelque chose.
  - **Deux signaux silencieux nommés** : « exposé mais jamais mis à l'épreuve » (rien n'échoue,
    donc rien n'alerte) et « travaillé mais jamais sans la réponse sous les yeux ».
  - **B2 amorcé** : le tri est TOTAL — score, puis statut, puis identifiant. Sans cette
    dernière clé, deux exécutions pourraient rendre deux ordres.
  - **UNE SONDE DE TEST CORRIGÉE, PUBLIÉE** : le test « au plus deux facteurs cités » découpait
    la phrase sur `', et '` — or la phrase de l'échec contient elle-même « , et ». **La sonde
    mesurait la ponctuation, pas la règle.** Les identifiants cités sont désormais exposés
    (`pourquoiFacteurs`) et c'est sur eux que porte le test.
  - **1455/1455 · tsc 0 · 52 portes vertes · corpus inchangé.**

- **CP2** — **le fait qui manquait existe : `ExerciseAttempt`. Et le laboratoire écrit
  désormais la tentative, qu'elle réussisse OU NON.**
  - **`lib/exercise-attempt.mjs`** — le fait canonique, pur : normalisation, **issue DÉRIVÉE
    des compteurs** (un appelant qui mentirait n'a aucun effet), **producteur obligatoire**
    (un fait sans provenance est refusé, jamais réparé en silence), **clé métier**
    `exerciseId + seconde + passed/total` qui rend le rejeu idempotent, et le champ décisif
    **`correctionSeen`, vrai par défaut : le doute joue CONTRE le compteur**.
  - **`lib/learner-memory.mjs`** — la projection pure aux **deux grains** (128 concepts,
    20 compétences), horloge injectée. Elle applique littéralement le contrat : M1→M4 pour
    MEANINGFUL_CONTACT, **R-a/R-b/R-c** pour RETRIEVAL, et la règle « `partial` gèle la série ».
  - **`app/api/lab/[exerciseId]/route.ts`** — **la dette D1 et D2 du CP0 est payée** : la
    tentative est écrite AVANT toute projection, systématiquement. Il n'y a plus de branche
    manquante ; un exercice raté laisse désormais une trace.
  - **`lib/learner-memory-server.ts`** — le contexte curriculaire, **dérivé de
    `data/program.json` uniquement** (qui porte déjà `skills` et `practiceRefs`), sans lire
    `scripts/`. **Un exercice déclaré par plusieurs leçons n'est rattaché à AUCUNE** : le CP1
    a mesuré que choisir aurait exigé de trancher entre 3 leçons en médiane, jusqu'à 15.
  - **Critère bloquant B1 vérifié en test** : deux appels identiques rendent une **égalité
    stricte**, et **l'ordre d'insertion des faits n'a aucun effet**. Deux tests indépendants.
  - **20 tests V74 ajoutés**, dont ceux qui gardent les contournements interdits : `done`
    n'est pas un contact significatif (**G2**), une preuve non validée ne compte pas (**G8**),
    une correction ouverte avant disqualifie la récupération (**R-b**), et la deuxième
    tentative du même exercice le même jour n'est pas un rappel (**R-c**).
  - **Une régression de forme assumée** : `tests/progress-store.test.mjs` gelait la forme de
    la progression vide. `exerciseAttempts: []` s'y ajoute — **liste vide, jamais absente**,
    sans quoi « aucune tentative » et « aucun échec observable » resteraient indiscernables.
    Le test est mis à jour avec sa raison, pas contourné.
  - **1440/1440 · tsc 0 · build OK · 52 portes vertes · corpus `92d5fae6…` inchangé ·
    `progress.json` absent.**

- **CP1** — **contrat gelé. Aucun fichier de produit modifié.**
  - La décision qui commande tout le sprint : **`ExerciseAttempt` devient un fait canonique**,
    parce que *le système persiste la projection et jette le fait*. Quand l'exercice échoue, il
    n'y a pas de projection à écrire — donc rien n'est écrit. C'est la cause exacte du constat
    CP0 « le système n'a jamais observé un échec ».
  - **Une mesure a tranché l'option C** : 207/376 exercices sont rattachables à un concept par
    déclaration ; les 169 autres ont une médiane de **3** leçons candidates, jusqu'à 15.
    L'équivalence automatique exercice → rappel est donc **refusée**, remplacée par la règle
    qualifiée `DERIVED_RECALL` à quatre conditions.
  - **Les cinq statuts sont déclarés SANS rapport avec une probabilité de mémoire** — ce sont
    des états de planification, et le contrat l'écrit en tête de section.
  - **Les trois mécanismes existants reçoivent des responsabilités disjointes** plutôt qu'une
    fusion : l'arbitre est au-dessus. Pas de quatrième moteur.
  - **N1/N2 (l'espacement) sont NON bloquants, délibérément** : la cause dominante mesurée au
    CP0 est un défaut de curriculum, pas du moteur ; les rendre bloquants pousserait V74 à
    modifier le curriculum pour verdir une métrique — contournement G12.

- **CP0** — **audit forensique, lecture seule. Aucun fichier de produit modifié.**
  - **LE FAIT QUI CHANGE LE CADRAGE : un Retention Engine EXISTE DÉJÀ depuis V66 et il est
    branché au produit** — `lib/retention.mjs` (526 l.), `/retention` « Réactivation » dans la
    nav, `RecallStation`, commande `RECORD_RECALL`, persistance `recallAttempts`. C'est un
    **Leitner honnête** : un seul fait écrit, tout le reste projeté, rejouable. **V74 étend,
    ne réinvente pas.** Ce qu'il ignore : les 376 exercices, le registre de preuves, les
    échecs, les projets, les 52 revues, `expectedScores`, la profondeur de prérequis, la
    proximité d'un projet. **L'échéance ne dépend que du nombre de réussites consécutives.**
  - **TROIS MÉCANISMES SANS ARBITRE** : `lib/review.mjs` (V19, SM-2 par JOURNÉE, piloté par la
    compréhension DÉCLARÉE, page `/revisions`) · `lib/retention.mjs` (V66, Leitner par
    CONCEPT, piloté par les tentatives réelles, page `/retention`) · les 52 revues du
    curriculum (par SEMAINE, générées). Trois grains, trois sources, trois pages.
  - **LE SYSTÈME N'A JAMAIS OBSERVÉ UN ÉCHEC** — trois lignes de code le prouvent :
    `if (attempt.allPassed)` **sans branche else** (un exercice raté n'écrit rien) ; un
    exercice réussi écrit une PREUVE mais **jamais `RECORD_RECALL`** ; et `RECORD_ATTEMPT`
    n'est appelé qu'à un endroit avec `outcome: 'attempted'` **en dur**. *Un modèle d'oubli
    branché sur des données qui n'enregistrent jamais l'oubli ne mesurera jamais rien.*
  - **78 % DE TOUS LES INTERVALLES ENTRE CONTACTS VALENT UN JOUR** (647/828 au grain
    compétence, 785/1068 au grain concept). Seuls **13 intervalles sur 828 dépassent 60 jours**.
    Le défaut V73 « médiane 1 jour sur 15 compétences » n'était que **la partie visible**.
  - **POURQUOI LA MÉDIANE VAUT 1 — décomposition nominative** : 135/247 paires leçon×revue ont
    la leçon liée au **jour 6, la veille** (j7 révise `javascript-basics` vu en j6) ; et
    **94/247 leçons sont liées aux SIX journées de leur semaine**, ce qui rend l'écart de 1
    **inévitable quelle que soit la date de la revue**. **Le terme dominant n'est PAS le
    calendrier hebdomadaire mais le rattachement des leçons** — le défaut `P1-CP13-1` de V73.
    **Déplacer les revues ne corrigerait rien.**
  - **`exposition → première pratique` vaut ZÉRO sur 19 compétences sur 20** : la première
    journée qui porte la notion est déjà une journée d'exercice.
  - **LE RAPPEL LIBRE EXISTE SUR 52 JOURNÉES SUR 365, ET SUR AUCUNE JOURNÉE DE TRAVAIL.**
  - **Inventaire de l'état apprenant, LU dans le code** : AVAILABLE (status, horodatages,
    compréhension **déclarée**, `correctionState`, `review` SM-2, `evidence[]` avec validation
    **vérifiée**, `recallAttempts[]`, `skills{}`) · DERIVABLE (9 champs, sans écriture
    nouvelle) · MISSING (5, dont l'`outcome` typé et le rattachement exercice → concept) ·
    UNMEASURABLE (probabilité de mémoire, setup, effort ressenti, transfert professionnel).
  - **Les 7 questions du brief** : 2 « oui », 2 « partiellement », **3 « non »** (durée d'une
    réactivation, choix relire/rappeler/produire/diagnostiquer/appliquer, preuve d'utilité).
  - **3 anomalies de sonde publiées** (§12 du rapport).
