# V74 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption : relire ce
> fichier, vérifier Git, reprendre au CP indiqué. **NE PAS refaire un CP terminé.**
> **V73 est terminé et ne doit pas être relancé** — rapport canonique :
> `docs/v73/V73-FINAL-REPORT.md`, verdict `CURRICULUM_INTEGRITY_READY`.

## Position

- **dernier CP terminé** : **CP0**
- **CP courant** : —
- **sous-lot courant** : —
- **NEXT_CP** : **CP1** — contrat de rétention gelé
- **NEXT_ACTION** : écrire `docs/v74/V74-RETENTION-CONTRACT-FROZEN.md` **avant toute
  implémentation**. Définir : `CONTACT`, `EXPOSURE`, `ATTEMPT`, `RETRIEVAL`, `SUCCESS`,
  `FAILURE`, `EVIDENCE`, `APPLICATION`, `TRANSFER`, `REVIEW`, `REMEDIATION`,
  `LAST_MEANINGFUL_CONTACT`. **Définir le CONTACT SIGNIFICATIF** — une simple ouverture de page
  ne doit PAS suffire. Définir les statuts opérationnels `DUE / SOON / HEALTHY / OVERDUE /
  UNKNOWN` **en déclarant explicitement qu'ils ne représentent AUCUNE probabilité de mémoire**.
  Geler aussi : les seuils, les critères de verdict, et les tests négatifs.
  **Contrainte issue du CP0** : le contrat doit dire quoi faire des **trois mécanismes
  existants** (V19 journée, V66 concept, 52 revues du curriculum) — arbitrer, pas empiler.

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

- **CP0** : aucun fichier de produit. Créés : `scripts/v74/cp0-forensics.mjs`,
  `scripts/v74/cp0-learner-fields.json`, `docs/v74/cp0-forensics.json`,
  `docs/v74/V74-CP0-RETENTION-FORENSICS.md`, `docs/v74/V74-STATE.md`.

## Tests exécutés

- **CP0** : lecture seule, aucun test rejoué (état hérité de V73 : 1420/1420 · tsc 0 ·
  52 portes · build OK · 376/376).

## Dette découverte

| # | dette | où |
|---|---|---|
| **D1** | **un exercice raté n'écrit RIEN** — `if (attempt.allPassed)` sans branche `else` | `app/api/lab/[exerciseId]/route.ts:100` |
| **D2** | **un exercice réussi n'émet pas `RECORD_RECALL`** — les 376 exercices ne nourrissent pas le moteur de rétention | même fichier |
| **D3** | `RECORD_ATTEMPT` n'est appelé qu'une fois, avec `outcome: 'attempted'` en dur | `app/day/[id]/DayCorrection.tsx:35` |
| **D4** | `evidence[]` porte `competencyIds` (20), jamais `conceptId` (128) — **les grains ne coïncident pas** | `lib/evidence.mjs` |
| **D5** | **trois mécanismes de révision sans arbitre** : V19 journée, V66 concept, 52 revues | `lib/review.mjs`, `lib/retention.mjs`, générateur |
| **D6** | `weeklyReviews{}` est un objet libre, sans schéma normalisé | `lib/learning.mjs` |
| **D7** | aucune durée n'est attachée à une réactivation, aucune preuve d'utilité d'un rappel | `lib/retention.mjs` |

## Erreurs de sondes

| # | ce que la sonde mesurait | ce qu'elle prétendait mesurer |
|---|---|---|
| **1** | « le prochain projet après le **dernier contact** » — une constante | le prochain besoin curriculaire, qui est **relatif à une date**. Donnait « aucun » pour les 20 compétences. **Re-mesuré.** |
| **2** | la **présence d'une section** dans le gabarit d'une journée | une **distribution de formes de révision**. 6 catégories sur 9 sortaient à 313-365 parce que toutes les journées ont ces sections. |
| **3** | `Mini-quiz` en texte libre → **236** journées | V73 comptait la **section** `## ❓ Mini-quiz` → **78**. Les deux sont justes et ne mesurent pas la même chose ; signalé, non tranché. |

## Journal des CP

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
