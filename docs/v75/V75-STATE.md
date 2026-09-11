# V75 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption : relire ce fichier,
> vérifier Git, reprendre au CP indiqué. **NE PAS refaire un CP terminé.**
> **V74 est terminé** — verdict `RETENTION_ENGINE_READY`, rapport `docs/v74/V74-FINAL-REPORT.md`.
> **NE PAS reconstruire le Retention Engine. NE PAS rejuger ses critères gelés.**

## Position

- **dernier CP terminé** : **CP0**
- **CP courant** : —
- **sous-lot courant** : —
- **NEXT_CP** : **CP1** — contrat de récupération gelé
- **NEXT_ACTION** : créer `docs/v75/V75-RECOVERY-CONTRACT-FROZEN.md` et y **geler AVANT toute
  implémentation** : `RECOVERY_MODE` · `NORMAL_MODE` · `CATCH_UP` · `CRITICAL_BACKLOG` ·
  `PAUSED_CURRICULUM` · `RESUME_PLAN` · `ESSENTIAL` · `DEFERRABLE` · `BLOCKING_CONCEPT` ·
  `BACKLOG_PRESSURE` · `RECOVERY_EXIT`. **La pression d'arriéré doit être EXPLICABLE**, pas un
  score opaque : la décision doit pouvoir dire « mode récupération activé parce que… ».
  **Les critères de sortie doivent être posés AVANT la mesure** — les choisir après simulation
  serait le contournement G11 hérité de V74. Geler aussi l'échelle de verdict
  (`ADAPTIVE_RECOVERY_NOT_READY / FOUNDATION_READY / CANDIDATE / READY`) et les critères
  bloquants, et **ne jamais les modifier ensuite parce que leur mesure échoue**.

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

- **CP0** : **créés** `scripts/v75/cp0-forensics.mjs`, `scripts/v75/cp0-backlog.mjs`,
  `docs/v75/cp0-forensics.json`, `docs/v75/cp0-backlog.json`,
  `docs/v75/V75-CP0-FORENSICS.md`, `docs/v75/V75-STATE.md`. **Aucun fichier de produit modifié.**

## Tests exécutés

- **CP0** : **1612/1612** · tsc 0 · build OK · `gates:active` **47 portes, 0 violation** ·
  corpus `92d5fae6` inchangé · `data/progress.json` absent. *(lecture seule — état hérité de V74)*

## Journal des CP

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
