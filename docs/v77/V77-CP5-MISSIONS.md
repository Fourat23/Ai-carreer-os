# V77 · CP5 — UNE MISSION NE DIT PLUS `passed`

> La décision la plus lourde de V77, et la seule honnête : **une mission
> documente un travail, elle ne le juge pas.**

---

## 1. Ce que `passed` recouvrait

Le produit écrivait, à la fin de chaque mission terminée :

```js
validation: { status: 'passed', kind: 'mission-deliverables' }
```

— une preuve **qualifiante**, au même rang qu'un exercice dont les tests ont
réellement tourné en bac à sable. Deux mesures du CP0 disent ce que ce mot
recouvrait :

- **42 missions sur 42** terminent sur un livrable de revue que l'apprenant
  valide **lui-même, d'un clic** (`action: 'validate-review'`) ;
- un document décrivant une conception **délibérément mauvaise** obtient
  `structure ok: true` — sonde `A9`, sur le validateur réel.

J'ai rejoué la seconde en HTTP pendant ce checkpoint, sur la mission
`cicd-blocked-delivery` : un runbook disant *« on déploie le vendredi soir sans
prévenir »*, *« il n'y a pas de rollback prévu »* et *« chacun approuve son
propre artefact »*, rendu avec les cinq sections attendues, obtient
`structure ok : True`.

**La validation de FORME ne peut pas atteindre la JUSTESSE.** Ce n'est pas un
défaut du validateur — c'est ce qu'un validateur de structure fait.

## 2. Trois questions dans un seul mot

`passed` répondait à trois questions à la fois, et c'est pour cela qu'il
mentait :

| question | où elle vit désormais |
|---|---|
| **l'avancement** — les livrables requis sont-ils faits ? | `computeMissionStatus` — **inchangé** |
| **le niveau de validation** — par quel moyen l'a-t-on constaté ? | `MissionSubmission.niveau`, dérivé du MODE |
| **la preuve** — cela suffit-il à créditer une compétence ? | `evidence.validation.status` + `evidenceLevel` |

### 2.1 La règle du maillon faible

Contrat gelé (CP1 §2) : *le niveau d'une preuve composite est celui de sa
composante la plus FAIBLE.* Une mission agrège trois choses :

```
auto        → OBSERVED    (une vérification exécutée par le produit)
structural  → OBSERVED    (la conformité de forme d'un document)
review      → DECLARED    (l'apprenant signe son propre travail)
```

> `STRUCTURE_VALID + SELF_CONFIRMATION` ne peut pas valoir `VALIDATED`.

Mesuré sur les 42 fixtures : le maillon faible est **`DECLARED` pour les 42**.
Formes rencontrées : `auto + structural + review` (41) et `structural + review`
(1). Aucune mission n'échappe à la revue auto-signée.

**Le plafond ne dépend pas de la performance.** Il se calcule sur la
DÉFINITION de la mission : il existe avant la première soumission, et aucune
réussite ne le lève. C'est ce qui le rend impossible à négocier.

## 3. BEFORE / AFTER sur les 42 missions

Le script `scripts/v77/cp5-missions-before-after.mjs` ne simule rien : il lit
les 42 fixtures réelles, porte chaque livrable requis à son état terminal — le
meilleur cas, celui où le produit avait le plus de raisons de dire `passed` —
puis appelle le code de production. Le « AVANT » est **reconstruit par le même
constructeur de preuves**, pas recopié d'une affirmation.

```
missions atteignant l'état « done »           : 42 / 42
AVANT — preuves qualifiantes (status passed)  : 42 / 42
APRÈS — preuves qualifiantes                  :  0 / 42
APRÈS — niveau de preuve                      : OBSERVED
maillon faible observé                        : DECLARED
```

### 3.1 La conséquence, et non l'intention

Dire « la preuve n'est plus qualifiante » ne suffit pas. Ce qui compte est ce
que cela change pour un apprenant dont les missions seraient la **seule**
pratique — le cas le plus défavorable :

```
compétences projetées depuis les MISSIONS SEULES
  AVANT : 17 × demonstrated
  APRÈS : 17 × practiced
```

**`practiced`, pas `unassessed`.** Le travail compte toujours comme pratique ;
il cesse seulement de valoir démonstration. C'est exactement ce que le CP1 avait
gelé, et la mesure le confirme plutôt que de le supposer.

Le détail par mission est publié dans `docs/v77/cp5-missions-before-after.json`.

## 4. Ce que ce checkpoint a trouvé en chemin

### 4.1 L'affirmation la plus forte du produit n'était gardée par aucun test

En retirant `passed`, **une seule assertion a rougi dans tout le dépôt** — la
forme de `emptyFlat`. Aucun des 2 047 tests ne tenait *« une mission terminée
démontre une compétence »*. Les tests de mission vérifiaient qu'une preuve
EXISTE et qu'elle porte une compétence ; jamais qu'elle **qualifie**.

C'est la même leçon que V76 a payée deux fois : *une assertion qui n'atteint pas
la propriété qu'elle croit garder ne garde rien.* Les tests du CP5 existent
d'abord pour que cela ne se reproduise pas — la bascule `demonstrated →
practiced` est désormais pinée, dans les deux sens.

### 4.2 Compter des faits n'est pas compter des livrables

Trouvé par la sonde HTTP, pas par relecture. Sur le produit réel, un apprenant
qui clique deux fois sur « valider la revue » produit **deux faits** — ce sont
deux actes, et c'est correct. Mais ma première `lectureDeLaMission` annonçait
alors *« 4 livrables rendus »* pour une mission qui en compte trois.

La lecture distingue maintenant `livrables` (distincts) de `soumissions`
(reprises comprises), et rend : *« 1 livrable rendu en 3 soumissions »*.

## 5. Le niveau de preuve, dérivé et plafonné

`evidenceLevel` apparaît sur toutes les preuves. Il est **dérivé**, jamais reçu :
un appelant qui passe `evidenceLevel: 'VALIDATED'` sur une mission obtient
`OBSERVED`. Trois questions dans l'ordre, la plus sévère gagne :

1. la validation a-t-elle abouti ? sinon on n'a qu'une observation ;
2. par quel MOYEN ? une auto-déclaration reste `DECLARED` même réussie ;
3. la source autorise-t-elle ce niveau ? sinon on plafonne.

| source | plafond |
|---|---|
| `exercise` · `assessment` · `transfer-challenge` · `capstone` | `VALIDATED` |
| **`mission`** · `submission` · `review` | **`OBSERVED`** |
| `declared` | `DECLARED` |

Le **CP9** publiera et gèlera la matrice complète `sourceType × kind × niveau ×
simulation × qualifiesFor{…}` ; ceci en est la première pierre, posée là où le
CP5 en avait besoin pour ne pas mentir.

### 5.1 Une projection, pas une migration

`evidenceLevel` est **recalculé à la lecture**, jamais lu du disque. Une preuve
de mission antérieure au CP5 garde son `status: 'passed'` persisté et reste
qualifiante : on ne réécrit pas l'histoire pour changer d'avis. Ce qui change est
ce qu'on en **dit aujourd'hui**.

**Conséquence à déclarer, et qu'un pilote doit connaître** : une progression
antérieure au CP5 porte des preuves de mission qualifiantes ; une progression
postérieure n'en portera plus. Le corpus n'est donc pas homogène dans le temps.
Pour V78, ce n'est pas un problème — les participants partent d'une progression
vierge — mais l'écrire ici vaut mieux que de le découvrir plus tard.

## 6. La chaîne réelle, mesurée en HTTP

Mission `cicd-blocked-delivery`, traversée de bout en bout sur le produit
reconstruit : exercice lié résolu (5/5), runbook délibérément mauvais rendu,
auto-évaluation puis validation par l'apprenant.

```
missionSubmissions : 4
  runbook      mode=structural  statut=structure-valid  niveau=OBSERVED  structureOk=True
  self-review  mode=review      statut=self-assessed    niveau=DECLARED  structureOk=None
  self-review  mode=review      statut=validated        niveau=DECLARED  structureOk=None
  self-review  mode=review      statut=validated        niveau=DECLARED  structureOk=None

evidence :
  exercise  cicd-env-promotion     status=passed  kind=exercise-tests
  mission   cicd-blocked-delivery  status=manual  kind=mission-deliverables
```

Une seule preuve qualifiante là où le CP0 en mesurait deux sur la même
production. **Le CP10 mesurera le nombre canonique de doubles comptages** ; ce
qu'on peut dire ici est plus étroit : sur cette chaîne, la moitié « mission »
du défaut `A13` a cessé de prétendre démontrer.

## 7. Ce que ce checkpoint N'A PAS fait

- **Aucune migration destructive.** Aucune preuve existante n'est réécrite,
  déplacée ni supprimée.
- **Aucun travail dévalué.** `done` reste `done`, la trace dans la journée reste
  visible, la preuve reste exportable.
- **Aucun moteur modifié.** La compétence change parce que la preuve a changé,
  pas parce qu'on a touché à sa projection.
- **Aucune promotion.** `capstone` garde son plafond `VALIDATED` sans être
  branché — c'est le CP6.
- **Aucune matrice gelée.** `niveauDePreuve` couvre ce que le CP5 doit dire ;
  le CP9 la complétera et la testera exhaustivement.

## 8. Vérifications

| vérification | résultat |
|---|---|
| `tests/v77-mission-submission.test.mjs` | **23 / 23** |
| `npm test` | **2070 / 2070** |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **49 portes, 0 violation** |
| `bash scripts/v76-negative.sh` | **11 règles vues échouer, 0 trou** |
| BEFORE/AFTER 42 missions | 42 → 0 preuves qualifiantes · 17 compétences `demonstrated` → `practiced` |
| chaîne HTTP réelle | `structure ok: True` sur un document faux · preuve `manual` |
| `data/progress.json` | **absent** |

## 9. Une tension à trancher au CP9

Le contrat gelé plafonne la mission à `OBSERVED` ; la règle du maillon faible,
appliquée à ses livrables, donne `DECLARED`. Les deux affirmations coexistent
dans le produit : la preuve porte `evidenceLevel: 'OBSERVED'`, la lecture de la
mission publie `maillonFaible: 'DECLARED'`.

**Aujourd'hui l'écart n'a aucune conséquence opérationnelle** : ni `OBSERVED` ni
`DECLARED` ne comptent dans un moteur, et la preuve est non qualifiante dans les
deux cas. Mais ce sont deux phrases différentes sur le même objet, et c'est
exactement le genre d'écart que V77 existe pour retirer. Je ne le tranche pas
ici : le contrat du CP1 est gelé, et le CP9 est le checkpoint dont c'est le
mandat. **Il est noté, pas enterré.**
