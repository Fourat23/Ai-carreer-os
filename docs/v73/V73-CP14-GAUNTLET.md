# V73 — CP14. Le gauntlet et les douze mutations

**Les douze mutations du contrat gelé ont été appliquées : 12 / 12 vues rouges, 12 / 12
restaurées.** Mais le résultat qui compte n'est pas ce 12/12 — c'est que **la première
exécution n'en a vu que 10**, et que les deux échecs ont chacun révélé un vrai défaut :
**la porte V73 ne contrôlait pas I1**, et **le harnais lui-même mentait**.

---

## 1. Le gauntlet

| # | contrôle | résultat |
|---|---|---|
| 1 | `npm run generate` — **idempotence** | ✅ seul `generatedAt` change |
| 2 | `npx tsc --noEmit` | ✅ **0** |
| 3 | `npm test` | ✅ **1420 / 1420** |
| 4 | `npm run build` | ✅ succès |
| 5 | `npm run gates:active` (52 portes) | ✅ **0 violation** |
| 6 | porte V73 du graphe (I1, I2, I3, I4, I6→I10, C9) | ✅ **verte** |
| 7 | `cp12-integrite` — R1 → R7 | ✅ **0 défaut** |
| 8 | `cp12-executer-references` | ✅ **376 / 376 passent** |

| invariant | état |
|---|---|
| corpus des 128 leçons | **`92d5fae6…`** — inchangé depuis le CP4 |
| 365 journées · 365 corrections · 52 semaines · 12 mois | ✅ |
| **`data/progress.json`** | **absent — jamais créé** |
| **L1** journées structurellement impossibles | **0** ✅ |
| **L2** revues en dépassement | **0 / 52** ✅ |
| **L3** UNDERLOADED non justifiées | **6 / 365** ✅ |

---

## 2. Les douze mutations : chacune vue rouge, chacune restaurée

| # | mutation | invariant | résultat | ce que la porte a dit |
|---|---|---|---|---|
| 1 | une compétence CORE ramenée à 0 journée | I1 / C1 | ✅ **rouge** | `I1 · la compétence « patterns » est portée par ZÉRO journée` |
| 2 | un livrable dépendant d'un prérequis futur non signalé | I2 / C2 | ✅ **rouge** | 4 violations I2 |
| 3 | une revue liant une leçon jamais enseignée avant | I3 / C3 | ✅ **rouge** | 1 violation I3 |
| 4 | une référence vers une leçon inexistante | C9 | ✅ **rouge** | `R2 liens entre leçons ❌ 1` |
| 5 | une journée gonflée au-delà du budget haut | L1 / C10 | ✅ **rouge** | `violation du seuil L1 (exigé : 0)` |
| 6 | un mapping jour → leçon cassé | I10 | ✅ **rouge** | `R1 liens de leçon des 365 journées ❌ 2` |
| 7 | un cycle dans le graphe des prérequis | I8 / C8 | ✅ **rouge** | 1 cycle |
| 8 | une leçon privée de statut | I5 / C5 | ✅ **rouge** | `violation de I5 : agent-workflows-orchestration` |
| 9 | un `expectedScores` sur une compétence non enseignée avant | I4 / C4 | ✅ **rouge** | 1 violation I4 |
| 10 | une journée dupliquée | I9 | ✅ **rouge** | 2 violations |
| 11 | une journée supprimée | I9 | ✅ **rouge** | 2 violations |
| 12 | **une tentative de création de `data/progress.json`** | I7 / C7 | ✅ **rouge** | 1 violation I7 |

> ## **12 / 12 vues rouges · 12 / 12 restaurées**

### Deux pièges de ce sprint, payés d'avance

- **Anomalie n° 9** — au CP2, la restauration était vérifiée par une empreinte contenant
  `generatedAt`, et trois tests valides étaient déclarés « non restaurés ». Ici, la
  restauration est contrôlée par **`git status --porcelain`, et rien d'autre**.
- **Anomalie n° 10** — au CP2, une mutation posée sur une journée possédant DÉJÀ une clé dans
  `LESSONS_V67` n'avait aucun effet (clé dupliquée, écrasée par la dernière), et le test
  passait au vert pour la mauvaise raison. Chaque mutation **refuse de s'appliquer si sa cible
  est occupée** — les mutations 5 et 6 lèvent une erreur explicite plutôt que de mentir.

---

## 3. Ce que la première exécution a trouvé, et qui vaut plus que le 12/12

La première exécution a donné **10 / 12**. Les deux mutations restées vertes n'étaient pas des
détails de plomberie.

### 3.1 — La porte V73 ne contrôlait pas I1. Personne ne le contrôlait.

La mutation n° 1 retire `patterns` de la seule leçon qui la déclare. La compétence tombe alors
à **zéro journée de travail**, ce que le contrat gelé au CP1 interdit explicitement :

> **I1** | Aucune compétence CORE n'a zéro journée | pour chaque compétence de `program.json` :
> `joursTravail ≥ 1`

et que le verdict compte en **C1**. **La porte est restée verte** : elle implémentait I2, I3,
I4, I6, I7, I8, I9, I10 et C9 — **jamais I1**.

> ### **Un invariant écrit dans le contrat, compté dans le verdict, et contrôlé par rien.**
> Il aurait été possible de traverser tout le sprint, de publier « C1 : 0 » et de le croire.
> Aucune mesure ne l'aurait démenti : **seule une mutation pouvait le révéler, parce qu'une
> porte qui ne regarde pas ne peut pas rougir.**

**I1 est désormais implémenté** dans `v73-graphe-check.mjs`, en lecture déclarative (la
compétence est portée par une journée si l'une de ses leçons la déclare ; repli nommé sur
l'étiquette pour `autonomy`, que le CP2 a établie comme n'étant déclarée par aucune leçon).
La mutation le voit maintenant rougir.

### 3.2 — Le harnais mentait, et la porte n'y était pour rien

La mutation n° 5 gonfle le jour 150 avec douze leçons. Elle est restée verte. **La porte
n'était pas en cause.** Mesuré à la main, j150 devient :

```
j150 : 390-442 min · IMPOSSIBLE sous 4 hypothèses sur 6 · structurellement impossible : true
```

Le défaut était dans **mon propre harnais** : il ne régénérait le graphe canonique que pour la
porte du graphe. Or `cp6-charge.mjs` lit `docs/v73/curriculum-graph.json` — il voyait donc
l'ANCIEN rattachement du jour 150 et déclarait la journée saine.

> **C'est le même défaut que l'anomalie n° 9, sous une autre forme** : la mesure ne portait pas
> sur l'état qu'elle prétendait mesurer. **Une mutation qui reste verte doit être instruite,
> jamais réécrite pour devenir rouge.** Ici, l'instruction a innocenté la porte et condamné le
> harnais.

Corrigé : le graphe est régénéré dès qu'une mutation touche la génération.

### 3.3 — Ce que ces deux cas disent du sprint entier

Les anomalies n° 21 (le CP0 comptait les `practiceRefs` et concluait sur ce que l'apprenant
pratique), n° 22 (`d.project?.id` lu sur un nombre), n° 24 (un accent grave apparié à travers
les documents) et les deux ci-dessus ont **la même forme** :

> **la sonde mesurait quelque chose de vrai, mais pas la chose dont on tirait la conclusion.**

C'est la raison pour laquelle ce sprint publie ses erreurs de sonde au même rang que ses
corrections de produit : **sur vingt-quatre anomalies numérotées, la grande majorité sont des
défauts de mesure, et chacune, non détectée, aurait produit une affirmation fausse dans un
rapport d'apparence rigoureuse.**

---

## 4. Ce que le CP14 a modifié

| fichier | nature |
|---|---|
| `scripts/v73/v73-graphe-check.mjs` | **I1 implémenté** — exigé par un test négatif |
| `scripts/v73/cp14-mutations.mjs` | **nouveau** — les douze mutations, rejouables ; harnais corrigé |
| `scripts/v73/cp14-verif-charge.mjs` | **nouveau** — vérificateur du seuil L1 (mutation 5) |
| `scripts/v73/cp14-verif-statuts.mjs` | **nouveau** — vérificateur de I5 (mutation 8) |
| `docs/v73/CP14-MUTATIONS.json` | **nouveau** — le journal des douze passages |

**Aucun fichier de produit modifié au CP14.** Corpus `92d5fae6…` inchangé, 365 journées
intactes, `data/progress.json` toujours absent.

---

## 5. État des critères de verdict, au sortir du gauntlet

| | critère | exigé | mesuré |
|---|---|---|---|
| **C1** | compétences CORE à 0 journée (I1) | 0 | **0** ✅ |
| **C2** | `INVALID_FORWARD_PREREQUISITE` (I2) | 0 | **0** ✅ |
| **C3** | revues introduisant une leçon inédite (I3) | 0 | **0** ✅ |
| **C4** | `expectedScores` sans source antérieure (I4) | 0 | **0** ✅ |
| **C5** | leçons sans statut (I5) | 0 | **0 / 128** ✅ |
| **C6** | invariants 365 / 52 / 12 (I6) | intacts | **intacts** ✅ |
| **C7** | `data/progress.json` (I7) | absent | **absent** ✅ |
| **C8** | cycles de prérequis (I8) | 0 | **0** ✅ |
| **C9** | références mortes | 0 | **0** ✅ |
| **C10** | journées structurellement impossibles (L1) | 0 | **0** ✅ |
| **C11** | revues en dépassement (L2) | ≤ 12 / 52 | **0 / 52** ✅ |
| **C12** | UNDERLOADED non justifiées (L3) | ≤ 20 / 365 | **6 / 365** ✅ |
| **C13** | gauntlet complet | vert | **8 / 8 verts** ✅ |
| **C14** | douze mutations | 12 vues rouges puis restaurées | **12 / 12** ✅ |
| **C15** | **P0 du CP0 restant ouverts** | **0** | *(établi au CP15)* |
