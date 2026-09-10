# V74 — CONTRAT DE RÉTENTION, GELÉ AU CP1

> **Ce document est gelé.** Les définitions, les seuils et les critères de verdict ci-dessous
> ont été écrits **avant toute implémentation** et **ne seront pas modifiés parce que leur
> mesure échoue**. Toute modification ultérieure devrait être déclarée comme telle, datée, et
> justifiée par une erreur de raisonnement — jamais par un résultat déplaisant.

**Entrées de ce contrat** : les dix conclusions du CP0
(`docs/v74/V74-CP0-RETENTION-FORENSICS.md`). Aucune n'est promue au rang de vérité
scientifique ; ce sont des mesures sur le produit tel qu'il est.

---

## 1. Le vocabulaire, sans ambiguïté

Chaque terme est défini par ce qui le **prouve dans les données**, jamais par une intention.

### 1.1 CONTACT

> **Une occasion, datée, où le parcours met l'apprenant devant une notion.**

Un contact est un fait **du curriculum**, pas de l'apprenant : la journée j218 est un contact
avec `embeddings` que l'apprenant l'ouvre ou non. C'est le grain que le CP0 a mesuré (828
intervalles au grain compétence, 1 068 au grain concept).

**Un contact n'est pas une preuve d'apprentissage.** Il ne prouve même pas une présence.

### 1.2 MEANINGFUL_CONTACT — *contact significatif*

> **Un contact dont il existe une TRACE ÉCRITE produite par l'apprenant, et qui n'est pas
> réductible à une consultation.**

Est significatif, et **seulement** :

| # | fait | pourquoi il est significatif |
|---|---|---|
| **M1** | une `RecallAttempt` — quelle qu'en soit l'issue | l'apprenant a **tenté de retrouver** |
| **M2** | une `ExerciseAttempt` où les tests ont **réellement été exécutés** — réussie ou non | il a **produit du code jugé par une machine** |
| **M3** | une `Evidence` de `sourceType ∈ {exercise, assessment, mission, capstone}` dont `validation.status = 'passed'` | il a **produit un livrable vérifié** |
| **M4** | une **soumission** (`SUBMIT`) portant un contenu non vide | il a **écrit quelque chose** |

**N'est PAS significatif :**

- ouvrir une page de leçon, de journée ou de projet ;
- marquer une journée `done` ;
- déclarer `comprehension = 'understood'` ;
- ouvrir la correction ;
- l'écoulement du temps ;
- le fait que le calendrier ait programmé la notion ce jour-là.

> **Règle décisive : `days[n].status = 'done'` n'est pas un contact significatif.** Un
> apprenant peut cocher une journée sans avoir rien produit. Le CP0 a d'ailleurs mesuré qu'un
> apprenant peut terminer une journée sans produire la moindre preuve — c'est le profil H des
> simulations du CP13.

### 1.3 EXPOSURE

> **Le premier contact, significatif ou non, avec une notion.** Fait de curriculum, daté par la
> journée. Sert à savoir **si la question a un sens** : on ne rappelle pas ce qui n'a jamais
> été présenté.

`UNKNOWN` (§2) est l'état d'une notion sans exposition.

### 1.4 ATTEMPT

> **Toute action de l'apprenant soumise à un jugement — le sien ou celui d'une machine.**

Deux espèces, et elles ne valent pas la même chose :

- **ExerciseAttempt** — jugement **objectif** : des tests s'exécutent, `passed/total` est un
  fait ;
- **RecallAttempt** — jugement **déclaré par l'apprenant** : « je l'ai retrouvé / en partie /
  pas du tout ».

**Le contrat ne les confond jamais.** Un jugement objectif et une auto-déclaration ne pèsent
pas pareil, et le §6 interdit explicitement de les traiter comme équivalents.

### 1.5 RETRIEVAL

> **Une tentative de faire remonter une connaissance SANS le support qui la contient.**

C'est la seule opération dont on peut tirer un signal de rétention. Trois conditions
**cumulatives**, toutes vérifiables :

| | condition | vérifiée par |
|---|---|---|
| **R-a** | l'apprenant tente de restituer ou de produire | une `RecallAttempt` ou une `ExerciseAttempt` |
| **R-b** | **la correction n'a pas été ouverte avant** | `correctionState ∉ {viewed, acknowledged}` à l'instant de la tentative |
| **R-c** | il ne s'agit pas d'une reprise immédiate de la même tâche | c'est la **première** tentative de cet artefact **ce jour-là** |

Une tentative qui échoue à R-b ou R-c reste un **MEANINGFUL_CONTACT** — elle n'est simplement
pas un **RETRIEVAL**.

> **Le CP0 a mesuré que le rappel libre existe sur 52 journées sur 365 et sur aucune journée de
> travail.** Élargir la définition de RETRIEVAL pour faire monter ce chiffre est le
> contournement **G7** du §6.

### 1.6 SUCCESS · PARTIAL_SUCCESS · FAILURE

| | définition | source |
|---|---|---|
| **SUCCESS** | `RecallAttempt.outcome = 'recalled'`, **ou** `ExerciseAttempt.allPassed = true` | fait écrit |
| **PARTIAL_SUCCESS** | `RecallAttempt.outcome = 'partial'`, **ou** `ExerciseAttempt` avec `0 < passed < total` | fait écrit |
| **FAILURE** | `RecallAttempt.outcome = 'failed'`, **ou** `ExerciseAttempt` avec `passed = 0`, **ou** une tentative qui n'a pas compilé / a expiré | fait écrit |

**PARTIAL_SUCCESS ne fait pas progresser une série** et **ne la casse pas**. C'est la règle
déjà retenue par le moteur V66 (`'partial' : rien ne bouge, volontairement`) ; elle est
reprise parce qu'elle est prudente : un rappel partiel ne prouve ni que ça tient ni que c'est
perdu.

> **L'absence de FAILURE enregistré n'est PAS une absence d'échec** (contournement **G9**). Le
> CP0 a établi qu'aujourd'hui le produit ne persiste **aucun** échec ; toute statistique de
> réussite calculée sur les données actuelles est donc structurellement optimiste, et V74 doit
> le dire chaque fois qu'il en publie une.

### 1.7 EVIDENCE

> **Un livrable vérifié, daté, rattaché à des compétences.** Fait déjà persisté
> (`lib/evidence.mjs`), inchangé par V74.

Une preuve **atteste une production**, pas une mémoire. Une preuve créée au jour J ne dit rien
de l'état de la notion au jour J+40 — c'est le contournement **G8**.

### 1.8 APPLICATION

> **Un contact significatif survenant sur une journée portant `project: N`.**

L'application est le contact de plus forte valeur pédagogique **et le plus ambigu comme
signal** : l'apprenant a pu réussir en copiant son propre code de la veille. Le contrat en tire
donc une conséquence limitée : *une application repousse l'échéance, elle ne consolide pas une
série de rappels* (§4.3).

### 1.9 TRANSFER

> **Un contact significatif où la notion est utilisée HORS de la compétence qui l'a
> enseignée.**

Vérifié déclarativement : l'artefact (exercice, projet, tâche de rappel) porte au moins deux
compétences dont celle de la notion, **et** la journée n'est pas étiquetée de la compétence
d'origine. C'est le grain que le CP11 exploitera.

### 1.10 REVIEW

> **Une séance dont l'objet déclaré est de reprendre une notion déjà rencontrée.**

Trois producteurs coexistent (CP0), et le §3 leur assigne des responsabilités **disjointes**.
Une REVIEW est significative si elle produit au moins un `RecallAttempt`.

### 1.11 REMEDIATION

> **L'action décidée APRÈS un FAILURE, avant toute nouvelle tentative sur la même notion.**

Une remédiation n'est pas « redonner la réponse » : le CP7 en fera une décision entre indice,
sous-problème, retour au modèle mental, exemple analogue, exercice plus simple, correction
complète, ou nouvelle tentative différée.

### 1.12 LAST_MEANINGFUL_CONTACT

> **La date du plus récent MEANINGFUL_CONTACT sur la notion.** `null` si aucun.

C'est la seule ancre temporelle que le moteur utilise pour dire « il y a N jours ». **Elle
ignore délibérément les contacts non significatifs** — une page ouverte ne rafraîchit rien.

---

## 2. Les cinq statuts opérationnels

> ## Ces cinq statuts NE REPRÉSENTENT AUCUNE PROBABILITÉ DE MÉMOIRE.
>
> Ce sont des **états de planification**. Ils répondent à « le moteur doit-il proposer cette
> notion aujourd'hui ? », **jamais** à « l'apprenant s'en souvient-il ? ». Cette seconde
> question est déclarée **UNMEASURABLE** par le CP0 et le reste par ce contrat.

| statut | définition opérationnelle | ce qu'il ne dit pas |
|---|---|---|
| **`UNKNOWN`** | aucune exposition, **ou** exposition sans aucun MEANINGFUL_CONTACT | pas « oublié » — **jamais tenté** |
| **`HEALTHY`** | échéance dans le futur, dernier RETRIEVAL non-échoué | pas « maîtrisé » |
| **`SOON`** | échéance dans les `FENETRE_SOON = 3` jours | — |
| **`DUE`** | échéance atteinte ou dépassée d'au plus `TOLERANCE_DUE = 7` jours | — |
| **`OVERDUE`** | échéance dépassée de plus de 7 jours, **ou** dernier RETRIEVAL en échec et aucune reprise depuis | pas « perdu » |

**Priorité d'évaluation, dans cet ordre exact et non négociable** :
`UNKNOWN` → `OVERDUE` → `DUE` → `SOON` → `HEALTHY`.

L'ordre est publié pour pouvoir être contesté, et il sera **testé négativement** au CP14.

---

## 3. La question critique du CP1 : quels faits persister ?

Le CP0 a établi que le produit **ne capture pas l'échec**. Le contrat tranche ici, **avant**
toute implémentation, et **par la sémantique métier**, pas par la facilité.

### 3.1 Les quatre options du brief, examinées

| | option | verdict | raison |
|---|---|---|---|
| **A** | `ExerciseAttempt` devient un fait canonique | **RETENUE** | voir §3.2 |
| **B** | `RecallAttempt` est enrichi | **RETENUE, additivement** | voir §3.3 |
| **C** | traduire un résultat d'exercice en `RecallAttempt` | **REFUSÉE en tant qu'équivalence · RETENUE en tant que règle dérivée qualifiée** | voir §3.4 |
| **D** | un autre modèle | **REFUSÉE** | créer un quatrième moteur est explicitement interdit par le brief, et rien dans la mesure ne l'exige |

### 3.2 A — pourquoi `ExerciseAttempt` DOIT devenir un fait

L'argument n'est pas qu'il serait pratique. Il est que **le système persiste aujourd'hui la
projection et jette le fait.**

Quand un exercice passe, `app/api/lab/[exerciseId]/route.ts` écrit une `Evidence` et une
soumission. Ces deux objets sont **dérivés** d'un événement qui, lui, n'est jamais écrit : la
tentative. Quand l'exercice échoue, il n'y a pas de projection à écrire — donc **rien n'est
écrit du tout**. C'est la conséquence exacte d'avoir choisi la projection comme fait.

Une tentative d'exercice possède les trois propriétés d'un fait canonique :

1. **elle est observée, pas déclarée** — des tests s'exécutent réellement en bac à sable ;
2. **elle est datée et non révisable** — on ne « corrige » pas une tentative passée ;
3. **tout le reste s'en dérive** — la preuve, le relèvement de compétence, la série de
   réussites, l'échéance.

> **C'est le seul événement du produit portant un verdict OBJECTIF.** Ne pas le persister prive
> le moteur de rétention de sa meilleure source, au profit d'auto-déclarations.

**Forme gelée du fait :**

```
ExerciseAttempt {
  id            // clé métier, cf. §3.6
  exerciseId    // identifiant de la banque (376)
  at            // horodatage SERVEUR, ISO 8601 UTC
  passed        // entier ≥ 0
  total         // entier ≥ 1
  allPassed     // booléen, = (passed === total)
  outcome       // 'success' | 'partial' | 'failure'  — dérivé, écrit pour lisibilité
  phase         // 'run' | 'compile' | 'timeout'      — d'où vient l'échec
  durationMs    // entier ≥ 0
  dayRefs       // journées du curriculum qui programment cet exercice
  correctionSeen// booléen — la correction était-elle ouverte AVANT
  provenance    // { producer: 'lab-runner', method: 'sandbox-tests' }
}
```

**`correctionSeen` est le champ qui rend la condition R-b vérifiable.** Sans lui, on ne peut
pas distinguer une récupération d'une recopie, et toute la §1.5 serait décorative.

### 3.3 B — l'enrichissement de `RecallAttempt`, strictement additif

`RecallAttempt` reste `{ conceptId, at, outcome, format, sourceRef }`. Trois champs sont
**ajoutés avec valeur par défaut**, ce qui laisse les données historiques valides sans
migration :

| champ | défaut | ce qu'il permet |
|---|---|---|
| `durationMs` | `null` | répondre à la question 4 du brief : « pendant combien de temps ? » |
| `sourceKind` | `'self'` | distinguer une tentative **auto-déclarée** d'une tentative **dérivée d'un exercice** — indispensable pour ne pas mélanger les deux poids |
| `evidenceRef` | `null` | relier un rappel à la preuve qui l'a produit, et donc pouvoir répondre un jour à la question 6 : « qu'est-ce qui prouverait que le rappel était utile ? » |

**Aucun champ existant n'est renommé, ni resserré, ni supprimé.**

### 3.4 C — un exercice réussi n'EST PAS un rappel réussi

C'est la décision la plus importante du contrat, et elle va contre la facilité.

**Mesure qui la commande** *(CP1, sur les 376 exercices)* :

> **⚠ CORRECTION DE MESURE, APPORTÉE AU CP7 — la RÈGLE ci-dessous est inchangée, les
> CHIFFRES qui la commandaient étaient faux, et ils l'étaient DANS LE SENS QUI M'ARRANGEAIT.**
>
> La sonde du CP1 comptait les exercices **déclarés par AU MOINS une leçon** (207) et les
> présentait comme « rattachables », alors que la règle gelée ci-dessous exige **exactement
> une** leçon déclarante. Les 67 exercices déclarés par 2 à 6 leçons étaient comptés du bon
> côté alors que le code les écarte. **La sonde mesurait la déclaration, pas l'unicité.**
>
> | | mesure CP1 | mesure RÉELLE (CP7) |
> |---|---|---|
> | rattachables par déclaration **unique** | 207 / 376 | **140 / 376** |
> | **non** rattachables par déclaration unique | 169 / 376 | **236 / 376** |
> | dont déclarés par 2 à 6 leçons | *(non compté)* | **67** — distribution `2→52 · 3→9 · 4→4 · 6→2` |
> | dont **jamais déclarés** par aucune leçon | *(confondus avec les précédents)* | **169** |
> | leçons candidates via la journée, pour les non rattachables | médiane 3, max 15 | **médiane 3, max 14** |
>
> **Aucun comportement de produit ne change** : `lib/learner-memory-server.ts` a toujours
> appliqué `slugs.size !== 1 → non rattaché`. Le code attachait déjà 140 exercices, jamais
> 207. C'était la mesure publiée qui était fausse, pas l'implémentation.
>
> **La décision en sort RENFORCÉE, pas fragilisée** : ce sont 236 exercices sur 376 — et non
> 169 — qu'une équivalence automatique obligerait à trancher arbitrairement. Refuser
> l'option C était encore plus justifié que le chiffre ne le laissait croire. C'est aussi
> pourquoi la correction est publiée telle quelle : une erreur de sonde qui va dans le sens
> de ma propre conclusion est celle qui a le plus besoin d'être dite.

| | valeur RÉELLE (corrigée au CP7) |
|---|---|
| rattachables à un concept **par déclaration unique** (`practiceRefs` d'une leçon) | **140 / 376** |
| **non** rattachables par déclaration unique | **236 / 376** |
| nombre de leçons candidates dans ce cas, via les leçons de leur journée | **médiane 3, maximum 14** |

Traduire automatiquement les 376 en `RecallAttempt` obligerait, pour 236 d'entre eux, à
**choisir arbitrairement** parmi trois à quatorze concepts. Ce serait fabriquer de la donnée.

**Règle dérivée gelée — `DERIVED_RECALL` :**

> Une `ExerciseAttempt` produit une `RecallAttempt` de `sourceKind = 'exercise'` **si et
> seulement si les quatre conditions suivantes sont réunies** :
>
> 1. l'exercice est déclaré par **exactement un** concept via `practiceRefs` — pas de choix
>    arbitraire ;
> 2. `correctionSeen = false` — condition R-b ;
> 3. c'est la **première** tentative de cet exercice ce jour-là — condition R-c ;
> 4. les tests ont **réellement été exécutés** (`phase = 'run'`).
>
> L'`outcome` est alors : `allPassed → 'recalled'` · `0 < passed < total → 'partial'` ·
> `passed = 0 → 'failed'`.

**Les tentatives qui ne remplissent pas ces conditions restent des `ExerciseAttempt` et des
MEANINGFUL_CONTACT.** Elles comptent pour l'ancienneté du dernier contact, **jamais** pour une
série de rappels.

### 3.5 Source de vérité, projections, responsabilités

| couche | nature | source de vérité |
|---|---|---|
| `ExerciseAttempt[]` | **FAIT** — immuable, ajouté seulement | disque |
| `RecallAttempt[]` | **FAIT** — immuable, ajouté seulement | disque |
| `Evidence[]` | **FAIT** — conservé tel quel (il couvre aussi missions, capstones, assessments) | disque |
| `days[n].*` | **FAIT** — session, soumissions, compréhension déclarée | disque |
| `LearnerMemoryModel` | **PROJECTION** — recalculée, jamais écrite | les faits ci-dessus |
| `RetentionPriority` | **PROJECTION** | le modèle mémoire |
| `Schedule` / `RetrievalTask` | **PROJECTION** | la priorité |

> **Aucune projection n'est persistée. Effacer toutes les projections et rejouer depuis les
> seuls faits doit rendre un résultat strictement égal.** C'est l'invariant que le CP14
> vérifiera, et c'est la règle que le Competency Engine (V65) et le Retention Engine (V66)
> appliquent déjà.

### 3.6 Idempotence, clé métier, provenance, horloge

| | règle gelée |
|---|---|
| **clé métier `ExerciseAttempt`** | `exerciseId` + `at` tronqué à la **seconde** + `passed/total`. Deux enregistrements de même clé sont **le même fait** — un double-clic ou un rejeu réseau n'en crée pas deux. |
| **clé métier `RecallAttempt`** | `conceptId` + `at` tronqué à la **seconde** + `format`. Règle déjà appliquée de fait par `normalizeAttempts` (tri + dédoublonnage). |
| **provenance** | obligatoire sur tout fait : `{ producer, method }`. Un fait sans producteur est **refusé**, jamais réparé en silence. |
| **horodatage** | **serveur uniquement**, ISO 8601 UTC. Aucune date fournie par le client n'est acceptée. Conséquence assumée : un apprenant hors ligne verra ses faits datés de la synchronisation. |
| **ordre** | les faits sont **triés à la lecture**, jamais supposés ordonnés à l'écriture. Une projection ne doit pas dépendre de l'ordre d'insertion (règle héritée de V66). |
| **compatibilité historique** | tout champ ajouté a une **valeur par défaut** ; aucune progression existante ne devient invalide ; `progress.example.json` reste lisible. |
| **borne** | `MAX_EXERCISE_ATTEMPTS = 20 000`, alignée sur `MAX_RECALL_ATTEMPTS`. Au-delà, les plus **récentes** sont conservées. |

---

## 4. Les trois mécanismes existants : responsabilités disjointes

> **V74 ne crée pas un quatrième moteur.** Le brief l'interdit, et la mesure ne l'exige pas.
> Le contrat assigne des **responsabilités disjointes**, ce qui est la condition pour qu'un
> arbitre puisse exister au CP4 sans rien fusionner physiquement.

| mécanisme | responsabilité GELÉE | ce qu'il cesse de prétendre |
|---|---|---|
| **`lib/review.mjs`** (V19, grain JOURNÉE) | replanifier la **relecture d'une journée** à partir de la compréhension **déclarée** | il ne prétend plus décrire un état de rétention ; sa sortie devient un **signal d'intention de l'apprenant**, une entrée parmi d'autres |
| **`lib/retention.mjs`** (V66, grain CONCEPT) | tenir la **série de rappels** et l'échéance par concept | il cesse d'être la seule vue : sa priorité devient **un facteur** de la priorité globale, pas la priorité |
| **les 52 revues du curriculum** (grain SEMAINE) | offrir le **rendez-vous hebdomadaire** de récupération sans support, et **le seul FREE_RECALL du parcours** | elles cessent de prétendre décider **quoi** réviser : le CP6 leur donnera un contenu arbitré |

**L'arbitre** — le futur `RetentionPriority` — est **au-dessus** des trois. Il les lit, il ne
les remplace pas.

---

## 5. Architecture en couches

| couche | entrée | sortie | mutable | source de vérité | déterministe | responsabilité |
|---|---|---|---|---|---|---|
| **CURRICULUM** | `scripts/data/*` | 365 journées, 128 leçons, 52 semaines | **immuable** en exécution | le générateur | **oui** | dire **quoi** est enseigné, et **quand** |
| **LEARNING ACTIVITY** | curriculum + catalogue | exercices, projets, revues, tâches de rappel | immuable | corpus + banque | **oui** | dire **ce qu'il y a à faire** |
| **LEARNER EVENTS** | actions de l'apprenant | `ExerciseAttempt`, `RecallAttempt`, `Evidence`, soumissions | **append-only** | **disque** | n/a (événements) | consigner **ce qui s'est réellement passé** |
| **LEARNER STATE** | les événements | `LearnerMemoryModel` par concept et compétence | **projection** | les événements | **oui** | dire **où en est** l'apprenant |
| **RETENTION PRIORITY** | état + curriculum | liste ordonnée + **trace d'explication** | projection | l'état | **oui** | dire **pourquoi** cette notion plutôt qu'une autre |
| **SCHEDULER** | priorité + budget | quoi · quand · **sous quelle forme** | projection | la priorité | **oui** | **arbitrer** sous contrainte de temps |
| **RETRIEVAL TASK** | scheduler + leçon | une tâche concrète, minutée | projection | leçon + archétype | **oui** | poser **la bonne question** |
| **RESULT** | réponse de l'apprenant | un nouvel événement | append-only | **disque** | n/a | **refermer la boucle** |

**Deux règles transverses, gelées :**

1. **Aucune couche n'écrit dans une couche située au-dessus d'elle.** Le scheduler ne modifie
   pas l'état ; il le lit.
2. **Toute couche marquée « déterministe : oui » doit rendre une sortie strictement identique
   à entrée identique, horloge comprise (injectée, jamais lue).** Testé au CP14, mutation 15.

---

## 6. Anti-Goodhart — douze contournements interdits, nommés d'avance

| # | contournement | pourquoi il est interdit |
|---|---|---|
| **G1** | **toute ouverture de page = exposition réussie** | une consultation n'est pas une production ; §1.2 l'exclut nommément |
| **G2** | **journée terminée = maîtrise** | `status = 'done'` est déclaratif ; un apprenant peut cocher sans rien produire |
| **G3** | **exercice réussi une fois = retenu** | une réussite unique ne prouve pas la durabilité ; le seuil « retenu » exige 3 réussites à 3 dates sur ≥ 21 jours |
| **G4** | **nombre de répétitions = connaissance** | le brief l'interdit explicitement : « ne pas utiliser le nombre de répétitions comme proxy unique de qualité » |
| **G5** | **récent = maîtrisé** | le CP0 a mesuré que 78 % des intervalles valent 1 jour : « récent » est ici la valeur par défaut, pas un signal |
| **G6** | **correction ouverte = comprise** | `correctionState = 'viewed'` prouve une lecture, et **disqualifie** au contraire la tentative comme récupération (R-b) |
| **G7** | **élargir la définition de RETRIEVAL** pour faire monter le compte de rappels | le chiffre monterait, la propriété baisserait |
| **G8** | **preuve créée = mémorisée** | une preuve atteste une production à une date, pas un état 40 jours plus tard |
| **G9** | **absence d'échec enregistré = absence d'échec** | le CP0 a établi qu'**aucun** échec n'est persisté aujourd'hui : toute statistique de réussite actuelle est structurellement optimiste |
| **G10** | **application dans un projet = rappel réussi** | l'apprenant a pu recopier son propre code de la veille ; §1.8 en tire une conséquence limitée |
| **G11** | **déplacer les intervalles jusqu'à ce que les statistiques soient jolies** | les paliers sont déclarés au CP9 avec leurs hypothèses ; un palier ne se règle pas sur la distribution qu'il produit |
| **G12** | **augmenter le nombre de révisions pour faire monter un score de couverture** | le brief l'interdit en première ligne ; le budget quotidien du CP10 est une contrainte, pas une variable d'ajustement |

**Cas particulier, nommé parce qu'il est tentant** : le CP0 a montré que le rappel libre
n'existe que sur 52 journées. **Ajouter mécaniquement un bloc de rappel aux 313 journées de
travail ferait passer ce chiffre de 52 à 365 sans qu'aucune propriété pédagogique ne change.**
C'est G12, et c'est refusé d'avance.

---

## 7. Critères de verdict, gelés

### 7.1 Conditions BLOQUANTES — un seul manquement interdit `READY`

| # | critère | seuil |
|---|---|---|
| **B1** | les projections sont **rejouables** : effacer et recalculer depuis les seuls faits rend un résultat strictement égal | **égalité stricte** |
| **B2** | le scheduler est **déterministe** : entrée identique, horloge identique → sortie identique | **égalité stricte** |
| **B3** | **aucun état de rétention ne peut être fabriqué** — il n'existe aucune commande d'écriture directe d'un état | **0 commande** |
| **B4** | `data/progress.json` **n'est jamais créé** par V74 | **absent** |
| **B5** | les invariants V73 tiennent : 128 leçons, 365 journées, 52 semaines, 12 mois, corpus `92d5fae6…` | **intacts** |
| **B6** | `npm test` · `tsc --noEmit` · `build` · `gates:active` · portes V73 · portes V74 | **tous verts** |
| **B7** | les **15 mutations négatives** du brief sont **vues échouer** puis restaurées | **15 / 15** |
| **B8** | aucun **backlog exponentiel** en simulation : la file de réactivation d'un apprenant irrégulier ne croît pas sans borne | **bornée** |
| **B9** | **aucune compétence oubliée indéfiniment** : toute compétence exposée reçoit une occasion de réactivation | **0 compétence orpheline** |
| **B10** | **toute priorité est explicable** : chaque élément proposé porte une trace lisible citant ses facteurs | **100 %** |
| **B11** | le **budget quotidien** est respecté en simulation : la charge d'une journée reste dans `[240, 300]` min (seuil V73, non renégocié) | **0 dépassement introduit par V74** |
| **B12** | **`READY` est interdit si le scheduler n'est pas réellement utilisé par le produit** — exigence littérale du brief | une surface produit consomme le scheduler |

### 7.2 Conditions NON BLOQUANTES — mesurées et publiées, sans droit de veto

| # | critère | cible indicative |
|---|---|---|
| **N1** | part des intervalles de rappel valant 1 jour | **en baisse** par rapport à 78 % |
| **N2** | nombre de compétences en `RAPPEL_TROP_PROCHE` (V73 : 15/20) | en baisse |
| **N3** | couverture des archétypes de rappel | ≥ 10 archétypes implémentés |
| **N4** | part des 376 exercices produisant un `DERIVED_RECALL` | mesurée, **non maximisée** |
| **N5** | délai médian entre un échec et sa remédiation | mesuré |

> **N1 et N2 sont explicitement NON bloquants, et c'est une décision, pas une facilité.** Le
> CP0 a montré que la cause dominante de l'écart de 1 jour est le **rattachement des leçons aux
> journées** — un défaut de curriculum (`P1-CP13-1` de V73), pas du moteur. Rendre ces critères
> bloquants forcerait V74 à modifier le curriculum pour verdir une métrique de rétention.
> **Ce serait G12.**

### 7.3 Échelle de verdict

| verdict | condition |
|---|---|
| **`RETENTION_ENGINE_READY`** | B1 → B12 **tous atteints**, dont **B12** |
| **`RETENTION_ENGINE_CANDIDATE`** | B1 → B11 atteints, **B12 non atteint** (le moteur est correct mais pas branché) |
| **`RETENTION_ENGINE_FOUNDATION_READY`** | B1 → B7 atteints, au plus **trois** manquements parmi B8 → B11 |
| **`RETENTION_ENGINE_NOT_READY`** | tous les autres cas |

---

## 8. Hypothèses et incertitudes, déclarées

### 8.1 Hypothèses de travail — nécessaires, non prouvées

| # | hypothèse | statut |
|---|---|---|
| **H1** | une récupération sans support est un meilleur signal de rétention qu'une relecture | **littérature, non vérifiée sur ce produit** |
| **H2** | la leçon (128) est le bon grain de rappel | **hérité de V66, non re-contesté** — l'alternative (711 entrées de glossaire) avait été écartée faute de prérequis et de pratique associés |
| **H3** | un espacement croissant vaut mieux qu'un espacement constant | **littérature** |
| **H4** | l'échec d'une tentative sur un concept indique un besoin de reprise **de ce concept** | **plausible, non vérifié** — l'échec peut venir de l'énoncé, de l'outillage, de la fatigue |

### 8.2 Incertitudes — ce que V74 ne saura pas trancher

- **aucun apprenant humain n'a jamais suivi ce parcours sous mesure** :
  `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED` depuis V72, **inchangé par V74** ;
- **aucun paramètre de décroissance ne peut être calibré** sur des données réelles ; le CP9 les
  déclarera **configurables et publiés**, jamais inventés puis présentés comme mesurés ;
- **une simulation n'est pas une preuve d'apprentissage** — le CP13 le rappellera dans son
  propre titre ;
- **la valeur pédagogique d'un archétype de rappel** par rapport à un autre n'est pas mesurable
  ici.

---

## 9. Ce que ce contrat interdit à V74 de faire

1. réécrire massivement les 128 leçons ;
2. modifier les 365 journées pour satisfaire une sonde ;
3. supprimer une compétence difficile ;
4. fabriquer `data/progress.json` ;
5. créer un quatrième moteur de révision ;
6. présenter une heuristique comme un fait scientifique ;
7. afficher à l'apprenant un score de mémoire chiffré (`memory score = 0.637` est nommément
   interdit par le brief) ;
8. déplacer un seuil de ce document parce que sa mesure échoue.
