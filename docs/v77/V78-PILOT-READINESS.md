# V78 · PILOT READINESS — CE QU'UN PILOTE HUMAIN POURRA OBSERVER

> Écrit au CP12 de V77. **Rien ici n'est promis qui n'ait été mesuré** aux
> CP3 → CP11. Ce qui n'a pas été mesuré est écrit comme non mesuré.

---

## 1. La question à laquelle ce document répond

Pas « le produit est-il prêt ? » — une question qui appelle un oui. Mais :

> **Quand un participant fait quelque chose, qu'est-ce que le système saura en
> dire — et qu'est-ce qu'il ne saura pas ?**

## 2. Surface par surface : ce qui sera observé

| surface | politique | fait écrit | niveau max | compte dans les moteurs |
|---|---|---|---|---|
| `lab` | `FACT_REQUIRED` | `ExerciseAttempt` | `VALIDATED` | **oui** |
| `transfer` | `FACT_REQUIRED` | `TransferAttempt` | `VALIDATED` | **oui** |
| `assessments` | `FACT_REQUIRED` | `AssessmentAttempt` | `VALIDATED` | **oui** |
| `capstones` | `FACT_REQUIRED` | `AssessmentAttempt` (`kind: capstone`) | `VALIDATED` | **oui** |
| `missions` | `FACT_REQUIRED` | `MissionSubmission` | `OBSERVED` | non |
| `kubernetes` | `FACT_REQUIRED` | `ArtifactAnalysis` | `OBSERVED` | non |
| `cloud-lab` | `FACT_REQUIRED` | `ArtifactAnalysis` | `OBSERVED` | non |
| `cloud-foundations` | `FACT_REQUIRED` | `ArtifactAnalysis` | `OBSERVED` | non |
| `security` | `FACT_REQUIRED` | `ArtifactAnalysis` | `OBSERVED` | non |
| `terminal` | `NO_FACT` / `USAGE_ONLY` | `UsageEvent` | — | non |
| `pipelines` | `NO_FACT` / `USAGE_ONLY` | `UsageEvent` | — | non |
| `resources`, playbooks | `NO_FACT` | — | — | non |
| `external-tasks` (tâches externes) | `NO_FACT` | — | `DECLARED` (non implémenté) | non |
| **21 surfaces de lecture** | `NO_FACT` | — | — | non |

**Quatre surfaces alimentent la compétence. Cinq écrivent un fait qui ne
l'alimente pas. Deux écrivent un usage. Vingt-trois n'écrivent rien — par
décision, pas par oubli.**

## 3. Les quatre questions qu'un pilote pourra trancher

### 3.1 « Ce participant a-t-il essayé, et combien de fois ? » — **OUI**

Avant V77, cinq échecs sur un diagnostic laissaient **une** trace, et c'était la
**première** : `0/5 → 1/5 → 4/5` ne gardait que `0/5`. Depuis le CP4, sept
soumissions laissent sept faits, et la courbe est lisible dans `/history`
(CP11).

Vaut aussi pour les exercices (V74), les transferts (V75) et les artefacts (CP7).

### 3.2 « Par quel MOYEN ce résultat a-t-il été constaté ? » — **OUI**

Chaque preuve porte `evidenceLevel`, **dérivé** et jamais reçu, sous deux
plafonds : par source et par moyen, le plus sévère gagnant. La matrice complète —
192 combinaisons, 12 qualifiantes, 0 incohérence — est publiée
(`docs/v77/cp9-evidence-matrix.json`).

Concrètement : un exercice dont les tests ont tourné et une mission validée d'un
clic **ne se ressemblent plus**.

### 3.3 « Le participant est-il seulement allé sur cette surface ? » — **OUI**

`UsageEvent` pour `terminal` et `pipelines` : la chose a eu lieu, sans jamais
dire qu'elle a réussi. Compté **à part** du travail dans `/history`
(`total = travail + usage`).

### 3.4 « Une même production a-t-elle été comptée deux fois ? » — **NON, mesuré**

42 paires structurelles, 14 chevauchant une compétence, **0 double comptage
effectif** (CP10). Et un test dit exactement ce qui le rouvrirait.

## 4. Les six questions qu'un pilote ne pourra PAS trancher

Elles comptent plus que les précédentes, parce qu'un pilote qui les croit
tranchées produira des conclusions fausses.

1. **« Ce travail est-il bon ? »** — sur les missions et les quatre surfaces
   analytiques, **non**. La validation de forme ne peut pas atteindre la
   justesse : un runbook disant « il n'y a pas de rollback prévu » obtient
   `structure ok: true` (mesuré en HTTP au CP5). Un compte de diagnostics n'est
   pas un verdict (CP7).
2. **« A-t-il compris ou mémorisé le corrigé ? »** — aucune donnée ne les
   distingue. `0/5 → 5/5` sur un questionnaire à choix multiples est compatible
   avec les deux.
3. **« Quel concept a-t-il travaillé ? »** — pour **125 exercices sur 376**,
   inconnu. Quatre sources auditées, **zéro** résolution (CP8). Un exercice
   ambigu produit sa preuve et sa tentative, mais **n'alimente pas la rétention
   au grain du concept**. À savoir avant de lire une courbe de rétention.
4. **« Combien de temps a-t-il réellement passé ? »** — non mesuré. Les durées
   enregistrées sont celles d'une exécution serveur, pas d'un temps humain.
5. **« Progresse-t-il ? »** — aucune donnée ne le dit. Une baisse du nombre de
   diagnostics peut être une correction ou la suppression de la moitié de
   l'architecture ; les lectures publiées s'interdisent tout verbe de
   progression, et un test le vérifie.
6. **« Ce qui a été observé hors ligne ? »** — rien. Si la route échoue,
   l'interface corrige côté client et le serveur n'observe pas ce qu'il n'a pas
   corrigé. Limite déclarée au CP4, non contournée.

## 5. Vie privée — mesuré, pas supposé

### 5.1 Ce qu'un export contient exactement

Mesuré en HTTP sur `/api/progress/export` :

```
racine    : app · schemaVersion · exportedAt · stats · progress · workspaces
parcours  : days · skills · weeklyReviews · monthlyReviews
            evidence · recallAttempts · exerciseAttempts · transferAttempts
            hintViews · assessmentAttempts · missionSubmissions
            artifactAnalyses · usageEvents
            version · enrolledAt · lastOpenedAt
```

**Les neuf faits y sont, y compris les quatre de V77** — vérifié par un test
d'aller-retour export → import. Il n'y a **aucun identifiant personnel** : l'état
est anonyme par construction, et aucune analytique tierce n'existe dans le dépôt
(`gtag`, `segment`, `sentry`, `posthog` : zéro occurrence, mesuré au CP0).

**Ce que l'export NE contient PAS** : les journaux de laboratoire
(`data/lab-journals/`) — donc **le code écrit par l'apprenant n'est pas
exporté**. Un participant qui exporte « toutes ses données » n'emporte pas son
code.

### 5.2 La granularité de la suppression — **trois réserves**

Mesuré en rejouant `/api/progress/reset` :

| | résultat |
|---|---|
| progression effacée | **oui** — plus aucun fait non vide |
| `data/progress.backup.json` | **écrit, et contient encore tout** (`evidence`, `assessmentAttempts`, `usageEvents`) |
| `data/lab-journals/*.json` | **intacts** — et ils contiennent **le code de l'apprenant** |
| `data/lab-workspaces/*.json` | intacts |

Le filet de sécurité et la survie des journaux sont **délibérés** : V76 · CP10 a
placé les journaux hors de l'espace de travail précisément pour qu'un `RESET`
n'efface pas l'histoire d'un échec (contournement `R4`). C'est une bonne décision
pédagogique — et **une réserve de confidentialité qu'un protocole humain doit
énoncer** :

> « Réinitialiser ma progression » n'efface ni l'instantané de secours, ni le
> code que j'ai écrit.

**Ce n'est pas corrigé ici** : changer ce comportement à la veille d'un pilote
casserait une garantie pédagogique pour en servir une autre, sans mesure. C'est
une décision de protocole, pas d'ingénierie.

## 6. Ce que V77 a changé, et qu'un pilote doit savoir lire

| avant V77 | après |
|---|---|
| une mission validée d'un clic écrivait `passed` et créditait une compétence | preuve `manual`, niveau `DECLARED`, **ne crédite plus** — 17 compétences passent de `demonstrated` à `practiced` quand les missions sont la seule pratique |
| un capstone corrigé par le serveur était archivé `self` | `capstone-grade`, `VALIDATED`, `simulation: true` |
| 5 échecs de diagnostic → 1 trace | 5 échecs → **5 faits** |
| 6 surfaces calculaient sans rien garder | 5 écrivent un fait ; `pipelines` écrit un usage |
| `isQualifying` ignorait le niveau | exige `VALIDATED` — **18 combinaisons cessent de qualifier** |

**Le corpus n'est pas homogène dans le temps.** Une progression antérieure à V77
porte des preuves de mission et de capstone qui qualifiaient sous l'ancienne
règle. Pour un pilote partant de progressions vierges, sans effet ; pour qui
relirait d'anciennes données, indispensable.

## 7. Ce qui reste à faire avant le pilote, et qui n'est pas de l'ingénierie

1. **Écrire le protocole**, y compris les deux réserves du §5.2, et le faire
   lire aux participants.
2. **Décider si les 112 ambiguïtés conséquentes** (CP8) doivent être tranchées
   par un auteur avant le pilote. Le mécanisme les attend
   (`data/exercise-declarations.json`) ; le travail est éditorial.
3. **Choisir ce qu'on regarde.** Ce document dit ce qui est observable ; il ne
   dit pas ce qu'il faut observer. Un protocole qui collecterait tout ne
   mesurerait rien.

## 8. La phrase qu'il ne faudra pas écrire

> « Le système mesure l'apprentissage. »

Il ne le mesure pas. Il observe des **faits** — des tentatives, des soumissions,
des artefacts, des usages — avec leur moyen de constat et leur niveau de preuve.
Ce que ces faits disent de l'apprentissage est précisément la question que V78
doit poser à des humains, et qu'aucun checkpoint de V77 n'a le droit de
pré-répondre.
