# V75 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption : relire ce fichier,
> vérifier Git, reprendre au CP indiqué. **NE PAS refaire un CP terminé.**
> **V74 est terminé** — verdict `RETENTION_ENGINE_READY`, rapport `docs/v74/V74-FINAL-REPORT.md`.
> **NE PAS reconstruire le Retention Engine. NE PAS rejuger ses critères gelés.**

## Position

- **dernier CP terminé** : **CP6**
- **CP courant** : —
- **sous-lot courant** : —
- **NEXT_CP** : **CP7** — PLAN DE RATTRAPAGE multi-journées
- **NEXT_ACTION** : produire une séquence **budgétée, reprenable, explicable, recalculable et
  non punitive**. Contraintes du brief : **ne jamais afficher « vous avez 91 notions en retard,
  faites-les toutes »** ; le plan doit être abandonnable sans pénalité (§1.3) et recalculé
  chaque jour. Matière disponible : `trierArriere` (classes + placements + pression),
  `arbitrerLaJournee` (minutes NOUVEAU/RÉVISION/REMÉDIATION), `notionsEssentielles` (horizon).
  **Point à traiter en priorité** : `PAUSED_CURRICULUM` (§1.5) est aujourd'hui *décrit* mais
  pas *enregistrable* — le CP6 n'affiche volontairement aucun bouton inerte. C'est au CP7 de
  donner à l'apprenant le moyen d'exercer ce choix, ou de déclarer pourquoi il ne le fait pas.

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
**376 exercices** · **`data/progress.json` n'existe pas** — l'invariant est de ne jamais le créer ·
`1708/1708` tests · `tsc 0` · **47 portes** sans violation (dont `v74:check`) · build OK.

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

- **CP6** : **mode de récupération** — `lib/recovery-mode.mjs` (PUR). Décisions :
  - **LE MODE N'EST JAMAIS PERSISTÉ.** §1.2 : c'est *« un état DÉCLARÉ du plan, pas un état de
    l'apprenant »*. Stocké, il deviendrait un attribut de la personne — « tu es en récupération »
    — et **survivrait à la situation qui l'a produit**. Il est recalculé intégralement, y
    compris pour `E4`, qui relit la pression **au jour actif précédent**.
  - **DEUX ALLOCATIONS, JAMAIS UNE** : `actuel` (si l'apprenant ne change rien) et `propose`.
    Rien n'applique la seconde — `applique: false`, `impose: false`, et **« ne rien changer »
    est toujours offert**, sans reproche. Une recommandation à option unique est un ordre.
  - **`propose.total ≤ actuel.total`, TOUJOURS** (critère `V12`) : consolider davantage se paie
    en avançant moins, **jamais en travaillant plus longtemps**. Un moteur qui rallonge la
    journée pour rattraper est le « rattrapage impossible » de `R12`.
  - **On ne réserve jamais plus de révision qu'il n'y en a à faire** : plafonner à
    `minutesRequises` évite de fabriquer du travail pour remplir un quota.
  - **La remédiation est un SOUS-ENSEMBLE de la révision**, jamais un ajout : un échec non
    repris se travaille en le reprenant, pas en travaillant plus.
  - **Le transfert est SUSPENDU en `RECOVERY` et `CRITICAL`** : le proposer pendant que des
    prérequis sont en retard organiserait un échec de plus.
  - **AUCUN BOUTON INERTE.** `PAUSED_CURRICULUM` est un choix que le moteur ne peut
    qu'*enregistrer*, et la commande n'existe pas encore : les options sont **décrites**, pas
    déclenchées. Un bouton qui ne fait rien prétendrait offrir un contrôle que le produit n'a pas.
  - **Les seuils ne sont PAS recalibrés** après avoir vu les chiffres du CP5 — ce serait `R7`,
    le piège nommé `G11` par V74.

- **CP5** : **triage de l'arriéré** — `lib/backlog-triage.mjs` (PUR). Décisions :
  - **`PARKED` exige une CONDITION NOMMÉE, jamais une place dans la file.** C'est la décision
    qui rend impossible par construction le « 90 % dans PARKED » dont le brief prévient : garer
    demande de produire une condition vérifiable **et sa levée**, affichable, notion par notion.
    Corollaire du vocabulaire : **`différé` = revient demain tout seul**, **`garé` = ne revient
    pas tant que *X* n'est pas repris**.
  - **La seule cause de garage est : un PRÉREQUIS est lui-même en retard.** Réviser la
    conséquence avant la cause fait échouer sur la cause. Une dépendance **mutuelle** est
    exclue (sinon les deux notions deviendraient inatteignables à jamais).
  - **L'ORDRE `T1→T4` EST LA GARANTIE** : `T1` (essentielle) avant `T3` (garage) ⇒ **une notion
    qui bloque le parcours n'est jamais garable** ; `T2` (échec non repris) avant `T3` ⇒ **un
    échec ne disparaît jamais au garage** (`R4`). Les deux ordres sont testés négativement.
  - **Un débordement de capacité est DIFFÉRÉ, jamais garé.** Une notion urgente qui ne rentre
    pas dans la séance reste urgente et repasse en tête demain ; la garer reviendrait à lui
    inventer une condition de blocage.
  - **SOUPAPE déclarée** : si le garage absorbait la totalité de l'arriéré, le produit se serait
    bloqué lui-même. On dégare alors tout **et on le publie** (`soupape: true`).
  - **La capacité active est celle du scheduler V74** (`PLAFOND_UNITES`), pas un second plafond :
    deux plafonds concurrents finiraient par diverger et la page afficherait deux vérités.
  - **La position vient de `progressPosition().resumeDay`**, pas de `nextIncompleteDay` :
    ce dernier rend le **trou le plus ancien**, et décrirait « au jour 2 » pour toujours un
    apprenant irrégulier qui travaille la journée 300 *(défaut **P5**)*.

- **CP4** : **D8 traitée** — cascade `R1→R4` dans `lib/exercise-mapping.mjs` (PUR). Décisions :
  - **`AMBIGUOUS` : 137 → 125, soit 9 %. Le gain est modeste et n'est pas habillé.** Les 125
    restants sont proposés par des journées qui enseignent plusieurs leçons de la **même**
    compétence ; rien dans la donnée déclarée ne les distingue. **Les résoudre demanderait une
    décision d'AUTEUR** (ajouter un `practiceRefs` dans la bonne leçon), **pas un algorithme** —
    et en inventer une serait exactement l'interdit `R1`/« fabriquer une maîtrise ».
  - **L'ORDRE DE LA CASCADE EST LA DÉCISION**, du plus fiable au moins fiable : `R1` déclarant
    unique (intention d'auteur) · `R2` déclarants multiples (**fait à conserver, pas ambiguïté à
    trancher** — tous gardés) · `R3` journée à leçon unique (aucun choix possible) · `R4` une
    seule leçon de la journée partage une compétence **canonique**.
  - **`R4` exige l'UNICITÉ, pas la compatibilité.** Deux leçons compatibles ⇒ `AMBIGUOUS` et
    **liste vide**. Prendre « la première » aurait fait tomber le compteur à zéro et fabriqué de
    la donnée que le moteur de rétention aurait ensuite prise pour un fait.
  - **INVARIANT QUI REND LA RÉDUCTION VÉRIFIABLE** : *rattaché ⇔ au moins un concept réel*,
    testé sur les 376 exercices. On ne peut pas sortir un exercice d'`AMBIGUOUS` sans lui donner
    un concept, ni lui donner un concept sans l'en sortir. **Faire baisser le compteur exige donc
    de produire de la donnée vraie.**
  - **UNE SEULE IMPLÉMENTATION** : la mesure publiée (`scripts/v75/cp4-mapping.mjs`) et le produit
    (`lib/exercise-concepts-server.ts`) appellent la **même** cascade pure, et un test l'exige.
    Deux implémentations donneraient deux vérités — le défaut qu'on supprime, pas qu'on reproduit.
  - **`conceptsDeLExercice` (CP3) a été SUPPRIMÉ**, absorbé par `R1`/`R2`. Garder les deux aurait
    laissé deux réponses possibles à la même question.

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
| **P5** | *(trouvé au CP5)* **le produit décrit un apprenant irrégulier « au jour 2 » pour toujours.** `computeStats().currentDay` et `nextIncompleteDay()` rendent la **première journée non terminée**, c'est-à-dire *le trou le plus ancien*. Quelqu'un qui a sauté la journée 2 et travaille aujourd'hui la 300 y est décrit au jour 2, et tout horizon « les 14 prochains jours » désigne alors le début du programme. `resolveResume` applique la bonne règle (« première non terminée APRÈS la dernière terminée ») ; c'est elle que le read-model de l'arriéré consomme | mesuré sur les 20 profils : `jourCourant` vs `jourMax` |
| **P4** | *(trouvé au CP4)* **une réussite au laboratoire écrit DEUX preuves au registre**, avec des `sourceId` différents (`<ex>` par `recordExerciseSuccess`, `lab-<ex>` par la soumission) : le dédoublonnage déterministe ne les fusionne pas. Le CP3 n'en avait instrumenté qu'une — **la seconde repartait sans concept et retombait sur le rattachement par journée**, recréditant les 3 leçons médianes et annulant le gain du CP3 pour le même exercice | `deterministicId(sourceType, sourceId, …)` · corrigé au CP4 : `SUBMIT` transporte `conceptIds` |

## Anomalies de mes propres sondes (V75)

| # | CP | ce que la sonde mesurait | ce qu'elle prétendait mesurer |
|---|---|---|---|
| **1** | CP0.A | `nextCurriculumNeed` lu sur les **concepts** (toujours `null`), puis au **jour 365** (où aucun projet n'est futur) | les **compétences bloquantes**. Rendait **0 pour les vingt profils**. Trois versions ont été nécessaires : mauvais grain, puis mauvais moment, puis correcte (pic pendant le parcours → 6 à 12) |
| **2** | CP0.A | le **nombre d'unités** écartées | des « minutes différées ». Renommé `unitesDifferees` |
| **6** | CP5 | le panneau d'affichage, par la simple **présence** de la chaîne `vue.gare` dans le fichier — elle subsistait dans un texte d'explication | que le nombre garé est **rendu**. Remplacer `value={vue.gare}` par `value={0}` laissait le test **vert**. Corrigé : on exige la valeur rendue, pas la mention |
| **5** | CP5 | la **soupape**, en croyant tester la règle d'exclusion des dépendances mutuelles : `a`↔`b` seuls, une fois garés, constituent *tout* l'arriéré, donc la soupape dégarait et le test passait même sans la règle | la règle d'exclusion mutuelle. Corrigé en ajoutant une troisième notion libre |
| **4** | CP5 | le triage au **jour 365**, où **aucune journée n'est « à venir »** : `URGENT` valait donc 0 pour les vingt profils | les notions **bloquantes**. **C'est l'anomalie n° 1 du CP0, refaite ailleurs** — mauvais moment de mesure, pas mauvais grain cette fois. Corrigé : mesure au **jour 180** publiée à côté de celle du jour 365 |
| **3** | CP4 | l'intersection de `ex.skills` (**vocabulaire fin**, 51 termes) avec les `skills` des leçons (**20 compétences de programme**) — **deux vocabulaires différents**, donc intersection vide presque partout | la règle `R4`. Ne résolvait que **9** exercices au lieu de **12** ; corrigée en passant par `programSkills()` (`skill-taxonomy.mjs`), qui fait déjà cette traduction |

## Fichiers

- **CP6** : **créés** `lib/recovery-mode.mjs` + `.d.ts` (moteur PUR), `lib/recovery-server.ts`
  (read-model, `E4` recalculé), `app/retention/RecoveryNotice.tsx` (**la surface**),
  `scripts/v75/cp6-modes.mjs` + `docs/v75/cp6-modes.json`, `tests/v75-recovery-mode.test.mjs` (32).
  **Modifiés** `app/retention/page.tsx` (la **position** est enfin transmise au plan du jour),
  `app/globals.css`.
- **CP5** : **créés** `lib/backlog-triage.mjs` + `.d.ts` (moteur PUR), `lib/backlog-server.ts`
  (read-model), `app/retention/BacklogPanel.tsx` (**la surface**), `scripts/v75/cp5-triage.mjs`
  + `docs/v75/cp5-triage.json` (la mesure), `tests/v75-backlog-triage.test.mjs` (26).
  **Modifiés** `app/retention/page.tsx` (**« Dues aujourd'hui » = file plafonnée → « En
  retard » = arriéré TOTAL**, défaut P2), `app/globals.css`, `scripts/v75/cp0-backlog.mjs`
  (option `avecFaits`, **strictement additive** — `docs/v75/cp0-backlog.json` vérifié
  **inchangé au bit près**).
- **CP4** : **créés** `lib/exercise-mapping.mjs` (cascade PURE), `lib/exercise-concepts-server.ts`
  (I/O du corpus), `scripts/v75/cp4-mapping.mjs` + `docs/v75/cp4-mapping.json` (la mesure),
  `tests/v75-exercise-mapping.test.mjs` (14). **Modifiés** `app/api/lab/[exerciseId]/route.ts`
  (les **deux** producteurs de preuves reçoivent les concepts résolus), `lib/learning-engine.mjs`
  (`canonicalEvidenceFor` transporte `cmd.conceptIds`), `lib/learning-engine.d.ts` (`SUBMIT`
  enfin typée avec ses options de preuve), `lib/evidence-concepts-server.ts` (`conceptsDeLExercice`
  **supprimé**, absorbé par `R1`/`R2`).
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

- **CP6** : **1708/1708** (32 nouveaux) · tsc 0 · **build OK** · `gates:active` **0 violation**
  (47 portes) · **10 mutations VUES rougir**. Mesure sur les 20 profils : **V12 tenu 20/20** ·
  **0 proposition appliquée ou imposée** · **« ne rien changer » offert partout** · une phrase
  pour chaque décision. Répartition : `NORMAL` 8 · `CATCH_UP` 3 · `RECOVERY` 3 · `CRITICAL` 6.
- **CP5** : **1676/1676** (26 nouveaux) · tsc 0 · **build OK** · `gates:active` **0 violation**
  (47 portes) · **10 mutations VUES rougir**, dont **2 restées VERTES au premier passage** —
  tests corrigés, mutations rejouées rouges. Mesure sur les 20 profils : **I2 tenu 20/20** aux
  deux instantanés · **0 notion urgente garée** · **0 échec garé** · **0 notion muette**.
- **CP4** : **1650/1650** (14 nouveaux) · tsc 0 · **build OK** · `gates:active` **0 violation**
  (47 portes) · **7 mutations VUES rougir** · mesure inchangée après extraction du module pur
  (140 / 67 / 32 / 12 / **125**), ce qui prouve que le refactor n'a pas déplacé la frontière.
- **CP3** : **1636/1636** (9 nouveaux) · tsc 0 · **build OK** · `gates:active` **0 violation**
  (47 portes) · **4 mutations VUES rougir** · **1 test a trouvé du code mort** (`conceptIds`
  calculé puis jamais renvoyé par `normalizeEvidenceRecord`).
- **CP2** : **1627/1627** (15 nouveaux) · tsc 0 · `gates:active` **0 violation** (47 portes) ·
  corpus inchangé · `data/progress.json` absent · **4 mutations VUES rougir**.
- **CP1** : document seul, aucun code modifié — aucun test à rejouer.
- **CP0** : **1612/1612** · tsc 0 · build OK · `gates:active` **47 portes, 0 violation** ·
  corpus `92d5fae6` inchangé · `data/progress.json` absent. *(lecture seule — état hérité de V74)*

## Journal des CP

- **CP6** — **le mode recommande, et il ne se souvient de rien.**
  - **Le mode n'est pas persisté, et c'est la décision du checkpoint.** Persister un compteur
    aurait été plus simple ; le §1.2 l'interdit pour une raison précise — stocké, « récupération »
    devient un attribut de la personne et survit à la situation qui l'a produit. `E4` (« tenu
    2 jours actifs ») est donc obtenu en **relisant les faits au jour actif précédent**.
  - **Le moteur s'allume enfin.** `NORMAL` 8/20 · `CATCH_UP` 3 · `RECOVERY` 3 · `CRITICAL` 6.
    C'est cohérent avec le CP0 (11/20 ne reviennent jamais sous contrôle) et cela évite le sort
    du facteur `besoinProche` : présent, correct, **jamais allumé**.
  - **`V12` tenu 20/20 : la récupération ne crée jamais de minutes.** En `RECOVERY` elle en
    DÉPLACE (240 → 220 de nouveau contenu, 20 → 40 de révision, total inchangé) ; en `CRITICAL`
    elle RACCOURCIT la journée (260 → 60 min). Elle ne l'allonge jamais.
  - **DEUX DÉFAUTS TROUVÉS DANS MON PROPRE RENDU, par la mesure :**
    · la page annonçait « le même total dans les deux cas » — **faux en `CRITICAL`**, où la
      journée passe de 260 à 60 minutes. Le texte distingue désormais *déplacer* de *raccourcir* ;
    · maintenu par `E4`, le profil K lisait « plusieurs notions attendent » alors qu'il n'en
      avait plus **aucune** de bloquante : la phrase décrivait une situation inexistante. Le
      maintien par `E4` a maintenant sa propre phrase, qui dit ce qui se passe réellement.
  - **La garde `B12` de V74 a fait son travail contre moi.** En faisant appeler `getPlanDuJour`
    par le read-model de récupération, j'avais retiré l'appel de la page — et la porte a rougi.
    **Je n'ai pas touché à la garde** : la page rappelle l'arbitre elle-même, avec la position.
    Une garde qui suivrait trois indirections ne garderait plus grand-chose.
  - **CHANGEMENT VISIBLE** : `/retention` explique désormais *pourquoi* la séance ressemble à
    ça, en une phrase, et montre les options **avec leur effet** — y compris « continuer comme
    prévu ». Aucun bouton inerte : `PAUSED_CURRICULUM` n'est pas encore enregistrable, et le
    produit ne fait pas semblant de l'offrir.
  - **10 mutations vues rougir** : déclencheur basculé sur le volume · `E4` supprimé ·
    récupération qui ajoute du temps · proposition appliquée d'office · « ne rien changer »
    retiré · seuil recalibré après mesure · jargon moteur dans la phrase · transfert non
    suspendu · bouton inerte réintroduit · plan rappelé sans position.
  - **1708/1708 · tsc 0 · build OK · 47 portes vertes.**

- **CP5** — **trier n'est pas soustraire, et la preuve est une contre-mesure.**
  - **La question du brief n'est pas « combien sont garées » mais « qu'est-ce que le garage fait
    GAGNER au moteur ? »** On rejoue donc le triage **garage désactivé** : l'arriéré **total est
    identique sur 20/20 profils** (le garage ne retire rien de la mesure) et la **séance du jour
    ne change que pour 2 profils sur 20** au jour 180. Garer ne rapporte donc au moteur ni un
    arriéré plus flatteur ni une charge allégée : c'est un tri, pas une triche.
  - **La part garée est élevée et je la publie telle quelle** : jusqu'à **81 %** (profil S) au
    jour 180, **91 %** (profil C) au jour 365. Ce n'est pas un artefact : quand 90 % du corpus
    est en retard, presque toute notion a un prérequis en retard. **C'est une description fidèle
    d'un apprenant profondément décroché**, et la contre-mesure ci-dessus est ce qui la
    distingue d'une dissimulation. `N3` reste non bloquant **et surveillé**.
  - **Le seul cas où le garage raccourcit vraiment la séance est le bon cas** : profil T
    (« fondations fragiles ») passe de 8 à **4** unités, parce que les 5 autres dépendent
    précisément de ces 4. La séance est plus courte **et mieux ciblée** — pas allégée.
  - **ANOMALIE DE MA PROPRE SONDE (n° 4), et c'est la n° 1 du CP0 refaite ailleurs** : mesuré au
    seul jour 365, `URGENT` valait **0 pour les vingt profils** — au dernier jour, aucune journée
    n'est « à venir », donc plus rien n'est prérequis de la suite. Mesure ajoutée au **jour 180**.
  - **DEUX DE MES TESTS ÉTAIENT AVEUGLES, et seule la mutation l'a montré** : l'un vérifiait la
    **soupape** en croyant vérifier l'exclusion des dépendances mutuelles ; l'autre cherchait la
    simple présence de `vue.gare` dans le fichier, si bien que remplacer le nombre affiché par
    `0` le laissait vert. Corrigés, puis les deux mutations rejouées **rouges**.
  - **DÉFAUT P5** : le produit décrit un apprenant irrégulier « au jour 2 » pour toujours.
  - **CHANGEMENT VISIBLE** : `/retention` annonçait « Dues aujourd'hui : 8 » sur **84 notions
    réellement en retard**. Elle annonce désormais **l'arriéré total**, décomposé en
    *aujourd'hui / plus tard / en attente*, avec la raison de chaque notion garée **et la
    condition qui la ramène**.
  - **1676/1676 · tsc 0 · build OK · 47 portes vertes · 10 mutations vues rougir.**

- **CP4** — **D8 : l'ambiguïté baisse de 9 %, et le reste est structurel. Je le dis comme ça.**
  - **137 → 125.** C'est peu, et l'habiller serait le vrai échec du checkpoint. La règle `R4`
    (intersection de compétences canoniques) a résolu **12 exercices**. Les **125** restants sont
    proposés par des journées enseignant plusieurs leçons de la **même** compétence : **aucune
    donnée déclarée ne les distingue.** Ce n'est pas un problème d'algorithme, c'est une
    **décision d'auteur manquante** dans le corpus.
  - **Le vrai travail du checkpoint était de ne PAS tricher.** Faire tomber `AMBIGUOUS` à 0
    demandait une ligne : prendre la première leçon candidate. Le compteur serait vert et chaque
    preuve créditerait une notion non travaillée — que le moteur de rétention prendrait ensuite
    pour un fait. L'invariant testé sur les 376 exercices (*rattaché ⇔ au moins un concept réel*)
    rend cette triche **impossible sans casser la suite**.
  - **`R2` conserve TOUS les déclarants.** 67 exercices sont multi-concepts par conception ;
    n'en garder qu'un serait perdre une information d'auteur, pas en gagner une.
  - **DÉFAUT P4, trouvé en branchant** : une réussite au laboratoire écrit **deux** preuves
    (`<ex>` et `lab-<ex>`), et le CP3 n'en instrumentait qu'une. La seconde retombait sur le
    rattachement par journée et **annulait le gain du CP3 pour le même exercice**. Corrigé :
    `SUBMIT` transporte `conceptIds`, et un test vérifie que les **deux** chemins les reçoivent.
  - **ANOMALIE DE MA PROPRE SONDE (n° 3)** : `R4` croisait deux vocabulaires différents — les 51
    termes fins des exercices contre les 20 compétences du programme. Elle ne résolvait que 9
    exercices. `skill-taxonomy.mjs` faisait déjà la traduction ; inventer une seconde table
    aurait créé une divergence de plus.
  - **Une seule implémentation de la cascade**, partagée par la mesure et le produit, et un test
    l'exige. `conceptsDeLExercice` du CP3 a été **supprimé** plutôt que laissé en doublon.
  - **7 mutations vues rougir** : `R4` prend le premier candidat · `R2` tronqué à un déclarant ·
    vocabulaire non canonicalisé · `AMBIGUOUS` désigne une leçon · `SUBMIT` sans `conceptIds` ·
    moteur ignorant `cmd.conceptIds` · serveur ne déléguant plus à la cascade.
  - **1650/1650 · tsc 0 · build OK · 47 portes vertes.**

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
