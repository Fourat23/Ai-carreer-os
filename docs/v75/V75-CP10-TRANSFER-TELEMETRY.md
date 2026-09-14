# V75 · CP10 — `TransferAttempt` : le septième fait

> **La tentative de transfert est écrite systématiquement, réussie ou non.**
> Un succès signifie « ce défi-ci, dans ce contexte-ci, à cet instant-ci ».
> **Jamais une maîtrise.**

---

## 1. La dissymétrie que ce checkpoint corrige

Le CP0 avait inventorié sept événements persistés. Le septième tenait en un mot :

| événement | état au CP0 |
|---|---|
| `ExerciseAttempt` | conforme (V74) |
| `RecallAttempt` | conforme (V74) |
| `Evidence` | sans `conceptId` — dette **D4**, payée au CP3 |
| `DayAttempt` | outcome libre, sans provenance — dette **D3**, payée au CP2 |
| `WeeklyReview` | sans horodatage — dette **D6**, payée au CP2 |
| `Submission` | sans provenance |
| **`TransferAttempt`** | **INEXISTANT** |

Le CP9 a rendu les 25 défis atteignables et la route a commencé à écrire une
**preuve** — mais seulement quand l'apprenant conserve son résultat. Donc :

- un défi **raté** ne laissait **aucune trace** ;
- un défi **réussi sans conservation** non plus.

C'est mot pour mot le défaut que le CP2 de V74 avait corrigé pour les
exercices : *« le système persistait la projection et jetait le fait. »*

Et sur un défi de transfert, **l'échec est l'information la plus utile** : c'est
lui qui dit qu'une notion *tient chez elle et cède ailleurs*. Le profil R du CP0
(« recall OK, transfert KO ») était littéralement inobservable.

---

## 2. Le fait, tel que le contrat l'avait déclaré

Le CP2 avait inscrit `TransferAttempt` dans `FAITS` **avant qu'il existe** —
grain `challenge`, provenance, clé métier, horodatage, version, `conceptId`.
C'est le contrat qui décide de la forme, pas l'implémentation. `lib/transfer-attempt.mjs`
l'écrit exactement ainsi.

| champ | source | note |
|---|---|---|
| `at` / `submittedAt` | **horloge serveur** | jamais acceptée du client (contrat V74 §3.6) |
| `challengeId` | défi | obligatoire ; absent ⇒ fait **refusé** |
| `conceptIds[]` | `lessonRefs` du défi | **cardinalité réelle** (§10.1) |
| `competencyIds[]` | `skills` du défi | idem |
| `passed` / `total` | correcteur **serveur** | jamais transmis par le client |
| `outcome` | **dérivé** de `passed/total` | `success` · `partial` · `failure` |
| `startedAtDeclare` | **client** | nommé comme une déclaration ; refusé s'il est postérieur à la soumission |
| `validation` | dérivée | forme canonique, identique aux preuves |
| `evidenceId` | preuve conservée | facultatif |
| `retryOf` | **le moteur** | clé de la tentative précédente du même défi |
| `sourceRef` | `/transfer/<id>` | d'où vient la tentative |
| `empreinte` | réponses | base de la clé métier |
| `schemaVersion` | contrat | `2` |
| `provenance` | `transfer-grader` | obligatoire |

### Ce que le fait ne porte pas

Ni `mastery`, ni `masteryLevel`, ni `forgettingProbability`, ni `memoryScore` —
et un test l'exige champ par champ. §10.3 : **`TRANSFER_SUCCESS != MASTERY`**.

---

## 3. Les issues — trois, et pas une de plus

`success` · `partial` · `failure`, **dérivées** de `passed/total` :

```
passed === total  → success
0 < passed < total → partial
passed === 0      → failure
```

§10.2 interdit d'inventer une granularité non observable. « Presque réussi »,
« en progrès », « proche du seuil » ne sont pas des faits, ce sont des
commentaires. Et l'issue est **dérivée, jamais reçue** : un appelant qui
enverrait `outcome: 'success'` avec `passed: 0` se voit corrigé — *une issue
fournie par celui qu'elle juge n'est pas une observation*.

---

## 4. Reprises (§10.4)

**Une reprise est un fait NEUF.** La précédente n'est jamais écrasée, corrigée
ni supprimée. Le moteur chaîne `retryOf` sur la dernière tentative du même
défi — l'appelant n'a pas à la connaître, et ne peut donc pas la fausser.

Vérifié de bout en bout : `failure → partial → success` est reconstructible,
la première tentative conserve son `passed: 0` et sa date.

Une reprise **après un succès** reste enregistrée : le produit ne décide pas
qu'il n'y a plus rien à apprendre.

---

## 5. Déduplication (§10.5)

> *« Même requête réseau rejouée != nouvelle tentative humaine. »*

Le problème n'a pas de solution parfaite : le client ne fournit pas
d'identifiant de tentative, et le contrat de V74 interdit de lui laisser fournir
l'horloge. La règle est donc **déclarée**, avec sa limite :

> Une soumission **strictement identique** — même défi, mêmes réponses, même
> issue — arrivant **moins de 10 secondes** après la précédente est le REJEU de
> celle-ci.

Ce qui rend la règle défendable n'est pas le chiffre mais le raisonnement : si
les réponses sont identiques **au caractère près** et que rien ne s'est écoulé,
il n'y a **aucune information nouvelle** à enregistrer.

**Limite déclarée** : un apprenant qui resoumettrait volontairement des réponses
identiques en moins de dix secondes est compté une fois. C'est le bon résultat —
il n'a rien tenté de neuf.

La clé métier, elle, est structurelle : `challengeId | seconde | empreinte des
réponses`. L'empreinte est **stable** (clés triées, tableaux triés) : un simple
changement d'ordre de champs ne crée pas de fausse « nouvelle tentative ».

---

## 6. La chaîne réelle (§10.6) — et les deux défauts qu'elle a révélés

> *« CP10 ne passe PAS si `TransferAttempt` existe uniquement dans `lib/`. »*

La chaîne a été traversée **en HTTP**, serveur lancé sur une fixture hors dépôt :

```
UI  →  POST /api/transfer/[id]  →  applyCommand  →  writeProgress
    →  activeTrackProgress      →  projectLearnerMemory  →  /retention
```

Et elle a trouvé **deux défauts que douze tests unitaires verts ne voyaient pas.**

### Défaut A — deux listes blanches, et le fait tombait dans les deux

`lib/progress-store.mjs` filtre les champs **à l'écriture** (`flatOf`) *et* **à la
lecture** (`activeTrackProgress`). Un champ absent de l'une ou l'autre est écrit
par le moteur puis **silencieusement perdu**.

Résultat mesuré avant correction : `faits: 0` après une tentative enregistrée
avec succès par le moteur.

**Et `curriculumPause` manquait aussi — depuis le CP7.** La pause du curriculum
était donc perdue au rechargement de la page, c'est-à-dire exactement là où elle
sert. Les tests du CP7 appelaient `applyCommand` sur un objet plat, **jamais
`writeProgress`**. C'est le **défaut P7**, trouvé par ce checkpoint-ci.

### Défaut B — la lecture mémoïsée effaçait le fait

`readProgress()` est mémoïsé par requête (React `cache`). La route l'appelait
**deux fois** : une fois pour écrire la tentative, une fois pour écrire la
preuve. Le second appel rendait l'instantané **d'avant** l'écriture, et le
second `writeProgress` effaçait la tentative enregistrée trois lignes plus haut.

Corrigé par `readProgressFresh()` et par le chaînage sur le résultat du moteur.

---

## 7. Ce que la projection compte désormais

| compteur | ce qu'il dit |
|---|---|
| `transfers` | défis **réussis**, comptés **une fois chacun** |
| `transfersEchoues` | défis **tentés sans succès** — nouveau, et c'était l'angle mort |
| `jamaisTransfere` | su, mais **jamais mis à l'épreuve** ailleurs |

Les deux premiers ne se confondent pas, et le premier **n'additionne pas** ses
deux sources : un succès connu par la tentative *et* par une preuve conservée
compte **une fois**. L'union se fait par `challengeId`.

Pourquoi ne pas se contenter du fait, maintenant qu'il existe : parce qu'une
progression écrite **entre le CP9 et le CP10** contient des preuves de transfert
sans tentative correspondante. Les ignorer effacerait une histoire réelle.

---

## 8. Ce que l'apprenant voit

`/retention` affiche désormais un panneau **« Su ici, pas encore ailleurs »**,
placé **avant** le signal silencieux « jamais employée ailleurs » — un fait
observé passe devant une absence.

> *N notions que tu retrouves correctement ont été mises à l'épreuve dans un
> autre contexte, sans y tenir. Ce n'est pas un échec de mémoire : c'est l'écart
> entre savoir retrouver et savoir reconnaître ailleurs.*

---

## 9. Vérifications

- **1797/1797** tests · `tsc` 0 · build OK · `gates:active` **47 portes, 0 violation** ;
- **31 tests** dédiés au CP10 ;
- **13 mutations négatives vues rougir**, dont **une restée verte au premier
  passage** (« un échec compte comme un succès ») — le test manquant a été
  écrit, la mutation rejouée rouge ;
- chaîne HTTP complète rejouée : échec sans conservation → **fait écrit** ·
  rejeu réseau → **dédupliqué** · reprise → **chaînée, sans écrasement** ·
  conservation → **preuve écrite, fait préservé** ;
- `data/progress.json` **absent**, fixture hors dépôt.

---

## 10. Limites déclarées

- **`startedAtDeclare` est déclaré par le client.** Le serveur ne peut pas
  savoir quand l'apprenant a ouvert le défi. La valeur est acceptée, nommée
  comme une déclaration, et **n'entre dans aucun verdict**.
- **La fenêtre de rejeu est un choix, pas une mesure.** Dix secondes est
  déclaré ; aucune donnée réelle ne permet de le calibrer.
- **Le produit n'a toujours observé aucun transfert réel.** Les 25 défis sont
  atteignables et instrumentés ; personne ne les a encore passés. Un zéro
  honnête vaut mieux qu'un compteur saturé.
