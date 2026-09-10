# V74 — CP0. Retention Forensics

**Lecture seule. Aucun comportement produit n'a été modifié.**

---

## 0. Le fait qui change le cadrage du sprint

> ## **Un Retention Engine existe déjà, depuis V66, et il est branché au produit.**

`lib/retention.mjs` (526 lignes), `lib/retention-server.ts`, la page `/retention` intitulée
**« Réactivation »** dans la navigation, le composant `RecallStation`, la commande
`RECORD_RECALL` du Learning Engine, et la persistance `recallAttempts` bornée à 20 000
entrées. Tout est là, cohérent, et pur : un seul fait écrit (la **tentative de rappel**), tout
le reste projeté.

**V74 ne construit donc pas un moteur à partir de rien.** Le cadrage honnête est :
*qu'est-ce que ce moteur ignore, et pourquoi cela l'empêche de répondre à la question du
brief ?*

### Ce que le moteur V66 fait, exactement

| | |
|---|---|
| **unité** | le CONCEPT = une leçon (128) |
| **fait écrit** | `RecallAttempt { conceptId, at, outcome: recalled/partial/failed, format: free/cued/applied/discrim/generate, sourceRef }` |
| **projections** | exposition · rappel · échéance · état |
| **paliers** | `INTERVALS = [1, 3, 7, 16, 35, 75, 160]`, indexés par le nombre de **réussites consécutives** |
| **états** | `nouveau · fragile · en_consolidation · retenu · a_revoir` |
| **« retenu »** | ≥ 3 réussites, à 3 dates distinctes, étalées sur ≥ 21 jours, sans échec final |
| **garantie** | rejouable — mêmes tentatives, même sortie, à la milliseconde |

C'est un **Leitner honnête**, et son honnêteté est explicite dans le code : *« on ne peut pas
fabriquer un état de rétention ; il n'existe aucune commande "marquer ce concept comme
retenu" »*.

### Ce qu'il ignore — et c'est là que V74 a du travail

L'échéance ne dépend que d'**une seule variable** : le nombre de réussites consécutives. Elle
ignore :

- les **376 exercices** et leurs résultats ;
- le **registre de preuves** (`evidence[]`) et ses validations vérifiées ;
- les **échecs** ;
- les **applications** et les **projets** ;
- les **52 revues hebdomadaires** du curriculum ;
- le **niveau attendu** (`expectedScores`) ;
- la **profondeur de prérequis** ;
- la **proximité d'un projet** qui va exiger la notion.

Le brief le dit dans ses termes : *« Ce moteur ne doit PAS être un simple calendrier de
répétition espacée. »* **Aujourd'hui, c'en est un** — un bon, mais un seul.

---

## 1. Trois mécanismes de rétention coexistent, et aucun ne parle aux autres

| | mécanisme | unité | piloté par | surface produit |
|---|---|---|---|---|
| **1** | `lib/review.mjs` (V19) | la **JOURNÉE** | la **compréhension DÉCLARÉE** (`understood / partial / review`) + confiance | `/revisions` |
| **2** | `lib/retention.mjs` (V66) | le **CONCEPT** (128 leçons) | les **tentatives de rappel réelles** | `/retention` |
| **3** | les 52 revues du curriculum | la **SEMAINE** | le **calendrier**, généré | `/day/[7k]`, `/reviews` |

Ce sont trois planifications de révision, avec trois grains, trois sources et **trois pages
distinctes**. Un apprenant peut être « à revoir » selon l'un et « à jour » selon l'autre, sans
qu'aucune couche n'arbitre.

Le module V66 le dit lui-même, et ce n'était pas un oubli à l'époque :

> *« `lib/review.mjs` existe depuis V19 et fonctionne. Il n'est ni supprimé ni remplacé […]
> Les deux modèles cohabitent sans se contredire parce qu'ils ne répondent pas à la même
> question. »*

**C'était vrai tant que personne ne demandait une réponse unique.** Le brief V74 en demande
une : *« qu'est-ce que CET apprenant risque d'oublier maintenant, et quelle action pédagogique
minimale lui donnera le meilleur rappel ? »* — question à laquelle trois moteurs
non-arbitrés ne peuvent pas répondre.

---

## 2. **Le système n'a jamais observé un échec**

C'est le constat le plus lourd du CP0, et il est vérifiable en trois lignes de code.

### 2.1 — Un exercice raté n'écrit rien

`app/api/lab/[exerciseId]/route.ts`, ligne 100 :

```js
if (attempt.allPassed) {
  // … preuve, relèvement de compétence, soumission horodatée
}
```

**Il n'y a pas de branche `else`.** L'exercice est réellement exécuté en bac à sable, les tests
sont réellement comptés (`passed`/`total`) — et si l'apprenant échoue, **rien n'est persisté**.
Ni la tentative, ni le nombre de tests passés, ni la date.

### 2.2 — Un exercice réussi n'écrit pas non plus de tentative de rappel

Le succès écrit une **preuve** (`ADD_EVIDENCE` / `SUBMIT` avec
`validation.kind = 'exercise-tests'`) et relève la compétence. Il **n'émet jamais
`RECORD_RECALL`**.

> **Les 376 exercices du corpus ne nourrissent pas le moteur de rétention.** La seule façon de
> créer une tentative de rappel est d'aller sur `/retention` et de **s'auto-déclarer** sur la
> RecallStation.

### 2.3 — La seule tentative que le produit écrit porte une chaîne libre

`RECORD_ATTEMPT` n'est appelé qu'à un seul endroit — `app/day/[id]/DayCorrection.tsx` — avec
un littéral :

```js
sendCommand({ type: 'RECORD_ATTEMPT', day, outcome: 'attempted' })
```

`outcome` est typé « chaîne de 40 caractères » dans `normalizeAttempts` : ni succès, ni échec,
**ni rien d'exploitable**.

### Conséquence pour V74

Le brief demande un moteur qui raisonne sur « erreur » et « correction ». **Ces deux entrées
n'existent pas encore dans les faits écrits.** C'est un travail de CP à part entière, et il
précède toute sophistication d'algorithme : *un modèle d'oubli branché sur des données qui
n'enregistrent jamais l'oubli ne mesurera jamais rien.*

---

## 3. A · Distribution des intervalles entre contacts

Un CONTACT est une journée qui porte la notion. Les deux grains sont publiés parce qu'un défaut
visible à l'un peut être invisible à l'autre.

| grain | n | min | P10 | P25 | **médiane** | P75 | P90 | max |
|---|---|---|---|---|---|---|---|---|
| **compétence** (20) | 828 | 1 | 1 | 1 | **1** | 1 | 5 | 316 |
| **concept** (128) | 1 068 | 1 | 1 | 1 | **1** | 2 | 7 | 316 |

## 4. I / J · Répartition par palier

| palier | compétence | concept |
|---|---|---|
| **1 jour** | **647 (78 %)** | **785 (74 %)** |
| 2-3 j | 72 | 90 |
| 4-7 j | 46 | 87 |
| 8-14 j | 19 | 37 |
| 15-30 j | 16 | 25 |
| 31-60 j | 15 | 27 |
| 61-90 j | 3 | 3 |
| **91+ j** | **10** | **14** |

> ## **78 % de tous les intervalles entre deux contacts valent exactement UN JOUR.**

Le défaut que V73 avait mesuré — « médiane de 1 jour entre une revue et le dernier contact,
sur 15 compétences sur 20 » — **n'était que la partie visible**. Ce n'est pas un problème de
revues : **c'est la structure entière des contacts.** Le parcours ne pratique presque pas
d'espacement : **seuls 13 intervalles sur 828 dépassent 60 jours**, et l'immense majorité du
reste est du jour-le-jour.

---

## 5. B · Les quatre intervalles charnières

| compétence | expo → 1ʳᵉ pratique | pratique → application | application → revue | revue ↔ dernier contact |
|---|---|---|---|---|
| `algo` | **0** | — | — | 3 |
| `ds` | **0** | — | — | 6 |
| `jsts` | **0** | 41 | 4 | 1 |
| `python` | **0** | 59 | 20 | 1 |
| `gitlinux` | **0** | — | — | 4 |
| `http` | **0** | 11 | 2 | 1 |
| `sql` | **0** | 6 | 2 | 1 |
| `se` | **0** | 5 | 4 | 1 |
| `archi` | **0** | 3 | 30 | 1 |
| `patterns` | **0** | — | — | 3 |
| `ml` | **0** | 28 | 6 | 1 |
| `dl` | **0** | **126** | 6 | 1 |
| `llm` | **0** | **140** | 6 | 1 |
| `rag` | **0** | 49 | 6 | 1 |
| `agents` | **0** | **126** | 6 | 1 |
| `evalia` | **0** | 19 | 6 | 1 |
| `secu` | **0** | 18 | **181** | 1 |
| `cloud` | **0** | 17 | **118** | 1 |
| `comm` | 24 | **−24** | 30 | 1 |
| `autonomy` | **0** | 69 | — | — |

**Trois faits, non commentés comme bons ou mauvais — mesurés :**

1. **`exposition → première pratique` vaut ZÉRO sur 19 compétences sur 20.** La première
   journée qui porte la notion est **déjà** une journée d'exercice. Il n'existe pas de
   structure « on découvre aujourd'hui, on pratique demain ».
2. **`pratique → application` vaut 126 à 140 jours pour `dl`, `llm` et `agents`.** Ces
   compétences sont pratiquées longtemps avant d'être construites.
3. **`comm` est à −24** : la première **application** précède la première **pratique**.

---

## 6. C · Dernière exposition — D · Plus grand silence — E · Concentration

| compétence | dernière exposition | silence final | plus grand silence | fenêtre à 80 % |
|---|---|---|---|---|
| `algo` | j365 | 0 | **204** | 344 |
| `ds` | j357 | 8 | **316** | 321 |
| `jsts` | j117 | **248** | 38 | 99 |
| `python` | j182 | **183** | 38 | 54 |
| `gitlinux` | j77 | **288** | 51 | 72 |
| `http` | j336 | 29 | **163** | 250 |
| `sql` | j152 | **213** | 63 | 84 |
| `se` | j329 | 36 | 148 | 250 |
| `archi` | j365 | 0 | 141 | 276 |
| `patterns` | j357 | 8 | **216** | 314 |
| `ml` → `autonomy` | j315-j365 | 0-50 | 36-212 | 65-252 |

**Quatre compétences ont un silence final de 183 à 288 jours** : `jsts`, `python`, `gitlinux`,
`sql`. **Deux ont un silence interne supérieur à 200 jours** : `ds` (316), `patterns` (216),
`algo` (204).

---

## 7. F · Nature de chaque contact, G · Niveau attendu, H · Prochain besoin

`H` a d'abord été mesuré comme une **constante** — « le prochain projet après le dernier
contact » — ce qui donne « aucun » pour les vingt compétences, puisque le dernier contact est
souvent proche de j365. **C'est une anomalie de sonde, publiée : la bonne question est
relative à une DATE, pas à la fin du parcours.** Re-mesuré correctement :

| compétence | journées de projet exigeantes | plus long trajet dernier contact → projet |
|---|---|---|
| `dl` | 6 (j309→j314) | **58 j avant j309** |
| `ml` | 17 | **44 j avant j316** |
| `llm` | 7 (j323→j328) | **37 j avant j323** |
| `rag` | 17 | **37 j avant j309** |
| `agents` | 6 | **37 j avant j323** |
| `evalia` | 22 | **37 j avant j309** |
| `http` | 11 | 30 j avant j330 |
| `comm` | 12 | 28 j avant j118 |
| `se` | 15 | 19 j avant j326 |
| `secu` | 10 | 17 j avant j320 |
| `archi` / `cloud` | 18 / 9 | 13 j |
| `jsts` `python` `sql` | 5 / 8 / 8 | 2 j |
| **`algo` `ds` `gitlinux` `patterns` `autonomy`** | **0** | **—** |

> **C'est ici que le futur moteur a un travail réel et identifiable** : `dl` reste 58 jours
> sans contact, puis une journée de projet l'exige. Ce sont les moments où une réactivation
> a une raison, et pas seulement une échéance.

**Niveaux attendus maximaux** : `jsts` 4 (m4) · `python` 4 (m6) · `http` 4 (m8) · `rag` 4 (m11)
· `evalia` 4 (m12) · `comm` 4 (m12) · `autonomy` 4 (m11) — les autres 2 ou 3.

---

## 8. Audit des 52 revues

### Ce qu'elles contiennent — 52/52 pour chaque élément

| élément | présence |
|---|---|
| test pratique minuté | **52 / 52** |
| test théorique | **52 / 52** |
| grille de notation chiffrée | **52 / 52** |
| plan de remédiation | **52 / 52** |
| **rappel actif budgété, leçons fermées** (acquis V73 · CP7) | **52 / 52** |
| relecture ciblée | **52 / 52** |

### Ce qu'elles révisent, et à quelle distance

**247 paires leçon × revue.** Écart entre la revue et le dernier contact de la leçon révisée :

| écart | nombre |
|---|---|
| **1 jour** | **135 (55 %)** |
| 2-3 jours | 40 (16 %) |
| 4-6 jours | 43 (17 %) |
| 7 jours et plus | 29 (12 %) |

### **Pourquoi la médiane V73 vaut-elle 1 jour ? — décomposition nominative**

| cause | part | démonstration |
|---|---|---|
| **la leçon est liée au JOUR 6, la veille de la revue** | **135 / 247 (55 %)** | j7 révise `javascript-basics` vu **la veille en j6** ; j14 révise `javascript-basics` vu **la veille en j13** |
| la leçon est liée plus tôt dans la même semaine | 83 / 247 (34 %) | |
| la leçon a été vue **avant** la semaine | 29 / 247 (12 %) | |

Et surtout :

> ## **94 leçons sur 247 sont liées aux SIX journées de leur semaine. Pour celles-là, l'écart de 1 jour est INÉVITABLE — quelle que soit la date de la revue.**

**La réponse à la question du brief est donc : c'est une combinaison, mais le terme dominant
n'est PAS le calendrier hebdomadaire.**

- **calendrier hebdomadaire** : contributif — une revue le 7ᵉ jour révise la semaine ;
- **rattachement des leçons** : **cause dominante** — c'est le défaut `P1-CP13-1` de V73
  (141 journées sur 365 reprennent la liste de leçons de la veille) qui produit
  mécaniquement l'écart de 1 ;
- **contenu du test** : cohérent avec la semaine, ce qui est voulu ;
- **modèle de génération** : `lessonsDeLaRevue` prend l'union des journées de la semaine —
  fidèle, et donc fidèlement affecté par le défaut de rattachement.

**Déplacer les revues ne corrigerait pas le défaut.** Il faut soit changer *ce qu'une revue
révise*, soit changer *le rattachement des leçons aux journées*.

**218 leçons sur 247 viennent de la propre semaine de la revue** — la revue est donc bien une
revue *de sa semaine*, et non un mécanisme de rappel espacé.

---

## 9. Audit des formes de révision

| forme | journées | dont revues | dont travail |
|---|---|---|---|
| `PASSIVE_REVIEW` | 365 | 52 | 313 |
| `RECOGNITION` (mini-quiz) | 236 | 0 | 236 |
| **`FREE_RECALL`** | **52** | **52** | **0** |
| `CUED_RECALL` | 365 | 52 | 313 |
| **`RECONSTRUCTION`** | **52** | **52** | **0** |
| `DIAGNOSIS` | 364 | 52 | 312 |
| `APPLICATION` | 365 | 52 | 313 |
| `TRANSFER` | 313 | 0 | 313 |
| `PRODUCTION` | 365 | 52 | 313 |

**Cette table dit surtout que la taxonomie ne discrimine presque rien au grain de la journée** :
six catégories sur neuf sont présentes sur 313 à 365 journées, parce que le gabarit d'une
journée contient toutes ces sections. *(Anomalie de sonde n° 2, publiée : mesurer une présence
de section ne mesure pas une distribution de formes.)*

**Ce qui discrimine vraiment, et c'est le résultat utile :**

> ## **Le rappel libre — retrouver sans support — existe sur 52 journées sur 365, et sur AUCUNE journée de travail.**

La récupération sans aide est confinée aux revues du dimanche. Les 313 journées de travail
n'en demandent jamais. C'est exactement l'opération dont un moteur de rétention peut tirer un
signal, et le parcours l'offre une fois par semaine.

---

## 10. Ce que le système sait de l'apprenant

Inventaire **lu dans le code**, chaque champ cité avec le module qui le normalise. **Aucun champ
n'a été inventé.**

### AVAILABLE — écrit et persisté aujourd'hui

| champ | forme | ce qu'il vaut pour le moteur |
|---|---|---|
| `days[n].status` | `not-started / in-progress / done / to-review` | **« done » n'est pas une preuve de rappel** |
| `days[n].startedAt / completedAt` | ISO | datation des contacts **réels** |
| `days[n].comprehension` | `understood / partial / review` | **déclaré** — un jugement |
| `days[n].correctionState` | `locked / available / viewed / acknowledged` | la correction a-t-elle été ouverte avant la tentative |
| `days[n].review` | `{ dueAt, interval, repetitions, ease, … }` | SM-2 par journée (mécanisme 1) |
| `evidence[]` | `{ sourceType, competencyIds[], createdAt, validation{status,kind,score}, provenance, dayId }` | **la seule validation VÉRIFIÉE du système** |
| `recallAttempts[]` | `{ conceptId, at, outcome, format, sourceRef }` | **le seul événement de récupération typé** |
| `skills{}` | compétence → 0..5 | **déclaré** |

### DERIVABLE — calculable sans écrire un champ de plus

`lastExposureAt` par concept · `lastRetrievalAt` / `lastSuccessAt` / `lastFailureAt` ·
`lastEvidenceAt` par compétence · compteurs de réussite et d'échec · applications ·
`currentExpectedLevel` (cumulatif) · `nextCurriculumNeed` (prochaine journée de projet) ·
profondeur de prérequis · « correction consultée avant la tentative ».

### MISSING — nécessaire au moteur, absent des faits

| manque | constat |
|---|---|
| **un `outcome` typé pour une tentative de journée** | chaîne libre de 40 caractères, valeur écrite en dur : `'attempted'` |
| **le rattachement d'une tentative d'exercice à un CONCEPT** | `evidence` porte `competencyIds` (20 compétences), jamais un `conceptId` (128 leçons) : **les deux grains ne coïncident pas** |
| **le type d'erreur commise** | aucun champ ne classe une erreur |
| **la durée réelle d'une activité** | horodatage au niveau JOUR, pas activité |
| **la trace d'une revue hebdomadaire effectuée** | `weeklyReviews` est un objet libre, sans schéma |

### UNMEASURABLE — et qui doit le rester

**probabilité de mémoire** (aucune donnée d'apprenant réel n'existe ;
`REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED` depuis V72) · **temps de setup** ·
**effort cognitif ressenti** · **transfert professionnel réel**.

---

## 11. Les sept questions du brief, et ce que le système peut en répondre AUJOURD'HUI

| | question | réponse possible aujourd'hui |
|---|---|---|
| 1 | doit-il la revoir maintenant ? | **partiellement** — le moteur V66 sait le dire, mais seulement si l'apprenant a lui-même déclaré des rappels sur `/retention` |
| 2 | pourquoi ? | **oui, en une phrase** — `projectRetentionState` rend une `reason` lisible |
| 3 | sous quelle forme ? | **oui** — `nextFormat` alterne parmi les formes que la leçon rend possibles |
| 4 | pendant combien de temps ? | **non** — aucune durée n'est attachée à une réactivation |
| 5 | relire, rappeler, produire, diagnostiquer ou appliquer ? | **non** — les cinq formats V66 ne couvrent ni le diagnostic ni l'application projet |
| 6 | qu'est-ce qui prouverait que le rappel était utile ? | **non** — rien ne relie une réactivation à une preuve ultérieure |
| 7 | quand faut-il la revoir ensuite ? | **oui** — `projectSchedule`, mais sur une seule variable |

**Trois « non » et deux « partiellement ». C'est le périmètre de travail de V74.**

---

## 12. Anomalies de sonde du CP0

| # | ce que la sonde mesurait | ce qu'elle prétendait mesurer |
|---|---|---|
| **1** | « le prochain projet **après le dernier contact** » — une constante | le prochain besoin curriculaire, qui est **relatif à une date**. Résultat initial : « aucun » pour les 20 compétences. Re-mesuré. |
| **2** | la **présence d'une section** dans le gabarit d'une journée | une **distribution de formes de révision**. Six catégories sur neuf sortaient à 313-365 journées parce que toutes les journées ont ces sections. |
| **3** | `Mini-quiz` en texte libre → 236 journées | V73 comptait la **section** `## ❓ Mini-quiz` → 78 journées. **Les deux chiffres sont justes et ne mesurent pas la même chose** ; la différence est signalée plutôt que tranchée. |

---

## 13. Ce que le CP0 établit, en cinq phrases

1. **Un moteur de rétention existe déjà et il est branché** — V74 doit l'étendre, pas le
   réinventer, et le dire.
2. **Trois mécanismes de révision coexistent sans arbitre** — journée (V19), concept (V66),
   semaine (curriculum).
3. **Le système n'a jamais observé un échec** : un exercice raté n'écrit rien, un exercice
   réussi n'émet aucune tentative de rappel, et la seule tentative écrite porte la chaîne
   `'attempted'`.
4. **78 % des intervalles entre contacts valent un jour** — l'espacement n'est pas seulement
   mauvais dans les revues, il est quasi absent partout ; et **94 leçons sur 247 rendent
   l'écart de 1 inévitable** par leur rattachement.
5. **Le rappel libre existe sur 52 journées sur 365 et sur aucune journée de travail.**

**Aucun de ces cinq points n'est présenté comme un défaut à corriger d'urgence.** Ce sont les
mesures d'avant. Les seuils, les définitions et les décisions viendront au CP1, **avant** toute
modification.
