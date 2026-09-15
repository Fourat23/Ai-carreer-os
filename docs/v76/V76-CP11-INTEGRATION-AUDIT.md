# V76 · CP11 — Audit d'intégration au moteur d'apprentissage

> Sondes rejouables : `node scripts/v76/cp11-integration.mjs` (13 scénarios HTTP,
> **fixture remise à zéro à chaque scénario**) · tests :
> `tests/v76-integration.test.mjs` (14) · résultats bruts :
> `docs/v76/cp11-integration.json`.

## 1 · Ce qui n'avait jamais été fait

La chaîne auditée traverse cinq sprints :

```
WORKBENCH → ExerciseAttempt → Evidence → concepts → compétence
          → Rétention → Récupération
```

`Evidence` vient de V27, le moteur de V64, `ExerciseAttempt` de V74, les
concepts et la récupération de V75. Chaque maillon a ses tests. **Aucun sprint
n'avait jamais joué la chaîne entière, sur un état NEUF, en comptant ce qui
apparaît.**

L'état neuf est la condition qui rend la mesure possible. Sur une fixture déjà
remplie — celle qui a servi aux CP5 à CP10, avec ses 51 tentatives — « une
preuve de plus » est invisible. Chaque scénario du CP11 repart donc d'une
progression vide, d'un espace de travail vide et d'un journal vide.

## 2 · Le défaut : une réussite, deux preuves

### Ce que la mesure a trouvé

| # | scénario | AVANT |
|---|---|---|
| I2 | RÉUSSITE : combien de preuves pour une réussite ? | ❌ **2 preuves** · `exercise:a11y-accessible-name` **+** `exercise:lab-a11y-accessible-name` |
| I5 | un seul exercice fournit combien de « sources distinctes » ? | ❌ **2** |
| I6 | combien de contacts de rétention pour une réussite ? | ❌ **`evidence=2`** |

### Ce qui le produisait

Deux producteurs, deux conventions de nommage :

- `recordExerciseSuccess` (V27) nomme la source canonique **`<exerciseId>`** ;
- la commande `SUBMIT` (V64) la nommait **`lab-<exerciseId>`**, parce que le
  même champ `evidenceId` servait à deux choses : l'identifiant de la **preuve
  de journée** *et* le `sourceId` de la **preuve canonique**.

Du côté des journées, la convergence fonctionne depuis toujours — les deux
chemins posent `lab-<id>`, et `I4` le confirme : une seule preuve de journée,
un seul identifiant. C'est le **registre canonique** qui gardait les deux.

### Ce n'était pas cosmétique

`lib/competency.mjs` promeut une compétence à `reinforced` quand elle voit
**deux sources distinctes et deux dates distinctes**. Le commentaire de la règle
dit pourquoi elle est sévère :

> « deux réussites le même jour sont une séance, pas un réancrage. »

« Deux sources » veut dire deux occasions différentes de démontrer la même
compétence — deux exercices, un exercice et une évaluation. **Un seul exercice
en fournissait deux.** Résolu deux jours de suite, il suffisait à déclarer un
réancrage qui n'avait pas eu lieu : exactement le « score fabriqué » que V75
avait interdit au §3 de son propre contrat.

Et `collectContacts` pousse un contact par preuve validée : le moteur de
rétention voyait **deux occasions de se souvenir là où il n'y en avait qu'une**.

### Le plus gênant : c'était écrit

Un commentaire de V75 · CP4, toujours en place dans `lib/learning-engine.mjs`,
l'annonçait mot pour mot :

> « Une réussite au laboratoire écrit **DEUX preuves** au registre : celle de
> `recordExerciseSuccess` (`sourceId: <exerciseId>`) et celle-ci
> (`sourceId: lab-<exerciseId>`). Les identifiants diffèrent, donc le
> dédoublonnage ne les fusionne pas. »

Écrit, assumé, **et jamais mesuré**. V75 · CP4 s'en était servi comme d'une
contrainte — « il faut donc instrumenter les deux preuves » — au lieu de la
traiter comme le défaut qu'elle est. Un fait connu mais non mesuré se comporte
exactement comme un fait ignoré.

Et un autre commentaire, quinze lignes plus haut, affirmait le contraire :
*« Les deux chemins convergent donc sur UNE preuve, pas deux. »* Vrai pour la
preuve de journée, faux pour le registre. **Deux commentaires du même fichier
se contredisaient depuis V75, et les tests ne pouvaient pas trancher parce
qu'aucun ne comptait.**

## 3 · La correction

### À la source : deux noms pour deux choses

```js
// lib/learning-engine.mjs
const nomDuFait = validId(cmd.canonicalSourceId, 64) ?? cmd.evidenceId;
```

`evidenceId` nomme la **preuve de journée**. `canonicalSourceId` nomme **le
fait**. La route passe désormais `canonicalSourceId: ex.id`, et les deux
producteurs convergent sur une clé métier identique — donc `appendEvidence`
reconnaît le doublon et n'ajoute rien.

Absent, le champ laisse le comportement d'avant : aucune autre commande
n'est touchée.

**La moitié qu'on oublie, et qui aurait cassé le produit** : le contrat V65 §P9
dit qu'une preuve refusée fait échouer la commande entière. Si le doublon était
devenu une ERREUR, chaque réussite aurait affiché un échec de soumission.
`withCanonicalEvidence` tolère le doublon sans échouer — un test l'épingle
explicitement.

### Pour les registres déjà écrits

Corriger l'écriture ne répare pas ce qui est sur le disque. `normalizeLedger`
applique donc `fusionnerPreuvesDeLaboratoire`, délibérément étroite :

- elle ne touche qu'à `sourceType === 'exercise'` ;
- elle ne retire `lab-<id>` **que si `<id>` est présent** — aucune preuve n'est
  jamais perdue, seulement un doublon du même fait ;
- **et seulement si les deux portent les mêmes compétences** : c'est ce qui en
  fait le même fait pour la projection.

Elle repose sur une propriété du corpus, vérifiée par un test plutôt que
supposée : **aucun des 376 exercices ne porte un identifiant commençant par
`lab-`**. Sans cela, elle confondrait deux exercices réels.

## 4 · Les treize scénarios, après

| # | scénario | résultat | observation |
|---|---|---|---|
| I1 | ÉCHEC : la tentative est écrite, aucune preuve | ✅ | 1 tentative · issue « partial » · 0 preuve |
| I2 | **RÉUSSITE : une preuve** | ✅ | **1** · `exercise:a11y-accessible-name` |
| I3 | REPRISE : relancer une réussite n'ajoute rien | ✅ | preuves 1 → 1 · tentatives 1 → 2 |
| I4 | la preuve de JOURNÉE converge | ✅ | 1 · `lab-a11y-accessible-name` |
| I5 | **un exercice = une source distincte** | ✅ | **1** |
| I6 | **RÉTENTION : un contact de preuve** | ✅ | `exercise=2 · evidence=1` |
| I7 | les concepts sont portés | ✅ | 1/1 · `react-accessibility` |
| I8 | AIDE : la réussite reste une réussite, et le dit | ✅ | 3 aides · « Réussi après 3 aides consultées. » |
| I9 | CORRECTION ouverte : pas de récupération | ✅ | `correctionSeen = true` |
| I10 | TRANSFERT : fait distinct | ✅ | 1 `TransferAttempt` · 0 `ExerciseAttempt` |
| I11 | MULTI-CONCEPTS : tous portés, aucun choisi | ✅ | `agent-state-transition` · 2/2 concepts |
| I13 | AMBIGU : aucune leçon créditée au hasard | ✅ | `agent-cycle-index` · aucun concept |
| I12 | `data/progress.json` jamais créé | ✅ | absent |

Deux scénarios méritent d'être lus ensemble. `I11` vérifie qu'un exercice
multi-concepts — **67 le sont par conception**, mesuré par V75 · CP0 — porte la
liste entière. `I13` vérifie qu'un exercice ambigu n'en porte **aucun**. Les
deux moitiés comptent : un produit qui déclare tout est aussi faux qu'un produit
qui choisit au hasard. « Je ne sais pas » est une réponse.

`I6` rend `exercise=2` et c'est correct : deux tentatives ont réellement eu
lieu (un échec, une réussite), et ce sont deux faits distincts. C'est
`evidence=2` qui était faux.

## 5 · Ce que l'audit a confirmé sans rien changer

Sept maillons sur neuf fonctionnaient déjà, et **aucun n'a été touché** :

- l'échec écrit sa tentative et ne fabrique aucune preuve (V74 · CP2) ;
- la reprise n'ajoute rien — idempotence par clé métier (V74 §3.6) ;
- la preuve de journée converge sur un identifiant unique (V64) ;
- les concepts traversent les deux producteurs (V75 · CP3/CP4) ;
- une réussite après aide reste une réussite, et sa provenance le montre
  (V76 · CP7) ;
- `correctionSeen` reste vrai après ouverture de la correction, donc la
  tentative ne vaut pas récupération (condition R-b, V74) ;
- le défi de transfert écrit son propre fait (V75 · CP10).

**Le CP11 était un audit. Il a corrigé le seul maillon qu'il a trouvé cassé, et
n'a rien reconstruit.**

## 6 · Le gantelet de mutations — 11 mutations, 10 tuées, 1 équivalente

### Groupe A — `node --test tests/v76-integration.test.mjs`

| # | mutation | tuée par |
|---|---|---|
| `O1` | le moteur ignore le nom du fait | une réussite écrit UNE preuve |
| `O2` | la route ne nomme plus le fait | la route nomme le FAIT séparément |
| `O3` | la fusion héritée est désactivée | un registre hérité est fusionné à la lecture |
| `O4` | la fusion retire `lab-<id>` même sans `<id>` | la fusion ne perd JAMAIS une preuve isolée |
| `O5` | la fusion ignore les compétences | elle ne touche que des preuves de mêmes compétences |
| `O6` | la fusion touche aussi les évaluations | idem |
| `O7` | la consolidation ne regarde plus les sources | deux preuves de la MÊME source ne valent pas un réancrage |

### Groupe B — que seule une exécution réelle peut tuer

| # | mutation | sondes en échec |
|---|---|---|
| `O8` | le moteur ne garde que les RÉUSSITES *(le défaut V74 · CP0 ressuscité)* | `I1 I8` |
| `O9` | la route transmet les concepts d'un seul producteur | `I7 I11` |
| `O10` | `correctionSeen` est toujours faux | `I9` |

### Deux mutations ont survécu, et les deux enseignent quelque chose

**`O7`** (« la consolidation ne regarde plus les sources ») a survécu au premier
passage. Mes autres tests ne produisaient jamais deux preuves qualifiantes pour
une seule source — le dédoublonnage les en empêche quand les compétences sont
identiques — donc la branche protégée n'était **jamais atteinte**. C'est la même
faute qu'au CP10 avec `N4` : *un test qui n'atteint pas la branche qu'il croit
garder ne garde rien.* Le cas est désormais construit explicitement (deux
preuves de `ex-a`, compétences différentes, deux dates).

**`O8` dans sa première forme** — « la route ne consigne plus la tentative en cas
d'échec » — a survécu, et la raison est instructive : sur un échec qui déclenche
la remédiation, le bloc `RECORD_HINT_VIEW` appelle `writeProgress(rv.progress)`,
et `rv.progress` **dérive de la progression qui contient déjà la tentative**.
La tentative était donc persistée par un second chemin, accidentellement. Ce
n'est pas un défaut — la tentative est bien écrite — mais la mutation n'isolait
pas ce qu'elle prétendait couper. Elle a été portée sur le moteur, où elle tue
proprement `I1` et `I8`.

## 7 · Ce qui n'a PAS été fait

- **aucune migration destructive** : la fusion héritée s'applique **à la
  lecture**, elle ne réécrit pas le fichier de progression. Un registre mal
  écrit hier est lu correctement aujourd'hui, et rien n'est effacé sur le
  disque ;
- **aucune modification de `ExerciseAttempt`**, ni de la règle de consolidation,
  ni du moteur de rétention — le défaut était dans le NOMMAGE, pas dans les
  règles ;
- **aucun recalcul rétroactif des compétences** : elles se projettent depuis le
  registre à chaque lecture, donc la correction s'applique d'elle-même. Aucun
  état dérivé n'est stocké, et c'était déjà le principe P2 de V65.

### Limite déclarée

La récupération (`recovery-mode`, `backlog`) n'a pas de scénario propre ici :
elle consomme les contacts de `collectContacts`, dont la correction est vérifiée
par `I6`. Un scénario de récupération complet exige de faire vieillir l'état sur
plusieurs semaines — c'est ce que V75 · CP13 a fait, et le refaire serait
recommencer V75.

## 8 · Vérifications

| | |
|---|---|
| `npm test` | **1977 / 1977** |
| `npx tsc --noEmit` | 0 |
| `npx next build` | OK |
| `npm run gates:active` | **48 portes, 0 violation** |
| scénarios CP11 | **13 / 13** |
| mutations | **11 appliquées · 10 tuées · 1 équivalente (déclarée)** |
| `data/progress.json` | **absent** |

### Un test de V75 a été réécrit, sans que sa propriété change

`tests/v75-exercise-mapping.test.mjs` cherchait `conceptIds: concepts` **à moins
de 900 caractères** de `type: 'SUBMIT'`. L'ajout d'un commentaire a dépassé la
borne — sans qu'aucune propriété du produit ne bouge. Le test cherche désormais
la présence de la clé **dans le bloc de la commande**. Contre-épreuve :
`conceptIds: []` à cet endroit le fait toujours rougir.
