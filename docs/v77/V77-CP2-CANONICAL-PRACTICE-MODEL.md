# V77 · CP2 — Le modèle canonique de la pratique

> `lib/practice-model.mjs` (**PUR**) + `lib/practice-model.d.ts` ·
> tests : `tests/v77-practice-model.test.mjs` (**19**).

## 1 · Le problème que ce fichier supprime

Le CP0 a mesuré que la politique d'observation de chaque surface **n'existait
nulle part**. Elle était implicite, dispersée dans huit routes, et
mutuellement contradictoire :

- deux surfaces corrigées de la même façon (`assessments`, `capstones`)
  écrivaient des preuves de qualité différente ;
- quatre surfaces capables d'observer n'écrivaient rien ;
- une mission validée par un clic écrivait `passed`.

**Une politique implicite est une politique que personne ne peut vérifier.**
Le contrat gelé du CP1 devient ici une **donnée**, et les routes s'y adosseront
au lieu de redécider chacune dans leur coin.

## 2 · Ce que la carte porte

Une entrée par surface de pratique :

| champ | rôle |
|---|---|
| `activite` | la nature de ce que l'apprenant fait, **déduite du CP0** |
| `observation` | ce que le produit sait constater, en clair |
| `politique` | `FACT_REQUIRED` · `USAGE_ONLY` · `NO_FACT` |
| `typeFait` | le fait produit, ou `null` |
| `niveauMax` | **le plafond de confiance**, gelé au CP1 |
| `simulation` | booléen structurel |
| `concepts` / `competences` | d'où ils viennent, ou `AUCUN_DECLARE` |
| `justification` | **obligatoire**, y compris pour un `NO_FACT` |

Les **21 surfaces de lecture** sont traitées collectivement : les énumérer une
à une donnerait l'illusion d'une politique par page alors qu'il n'y en a qu'une.

## 3 · Les huit natures d'activité, tirées des mesures

Le brief demandait de ne pas présupposer les noms. Ceux-ci viennent de ce que
chaque route **accepte** et **calcule** :

`EXECUTABLE` · `ASSESSMENT` · `ARTIFACT_ANALYSIS` · `STRUCTURED_SUBMISSION` ·
`SIMULATED_EXPLORATION` · `BOUNDED_DEMONSTRATION` · `REFERENCE_CONTENT` ·
`EXTERNAL_WORK`

La distinction qui a le plus de conséquences est
**`ARTIFACT_ANALYSIS` vs `SIMULATED_EXPLORATION`** : dans le premier cas
l'apprenant **remet ce qu'il a produit**, dans le second il **explore un
dispositif fourni**. C'est elle qui sépare `kubernetes` de `pipelines`.

## 4 · La règle du maillon faible, rendue calculable

```js
maillonFaible(['VALIDATED', 'OBSERVED', 'DECLARED'])  // → 'DECLARED'
```

Ni moyenne, ni maximum. Trois `VALIDATED` et un `DECLARED` valent `DECLARED`.

**Et une composition vide rend `null`, pas `DECLARED`** : « aucune composante »
n'est pas « composante la plus faible ». Rendre `DECLARED` fabriquerait une
preuve à partir de rien.

## 5 · Le défaut par défaut n'est pas « ça passe »

```js
politiqueDe('surface-inventee-demain')        // → null
niveauAutorise('surface-inventee-demain', 'DECLARED')  // → false
```

Une surface ajoutée sans être inscrite ici n'hérite d'aucune politique
implicite : elle apparaît comme une lacune. C'est l'inverse du comportement qui
a permis aux six surfaces silencieuses de le rester.

## 6 · Ce que les tests tiennent

| test | propriété |
|---|---|
| cohérence interne | `incoherences()` rend une liste vide |
| **exhaustivité** | toute surface trouvée au CP0 avec du contenu a une entrée |
| **pas de fantôme** | aucune entrée ne décrit une surface inexistante (sauf `external-tasks`, gelée d'avance et déclarée non implémentée) |
| plafond missions | `VALIDATED` refusé, `OBSERVED` accepté |
| plafond analytiques | les quatre plafonnent à `OBSERVED` et sont simulées |
| `NO_FACT` | `pipelines` et `terminal` n'écrivent rien, **et la raison est dans la donnée** |
| la moitié qu'on oublie | `lab`/`transfer`/`assessments`/`capstones` atteignent bien `VALIDATED` — une carte qui plafonnerait tout protégerait aussi bien et rendrait la compétence inatteignable |
| simulation ≠ dégradation | un capstone est `VALIDATED` **et** simulé |
| maillon faible | minimum, jamais moyenne ni maximum |
| moteurs | seul `VALIDATED` compte ; `'passed'` hérité n'ouvre pas la porte |
| économie | **≤ 3 types de faits nouveaux**, les quatre analytiques partagent le même, assessment et capstone aussi |
| continuité | `ExerciseAttempt` et `TransferAttempt` ne sont pas renommés |
| **cohérence carte ↔ contrat** | les décisions les plus lourdes sont vérifiées des deux côtés |

## 7 · Un test a cassé pour rien, et il a été réparé dans le bon sens

La première version du test « le contrat et la carte disent la même chose »
cherchait `OBSERVED` **à une position de colonne donnée** dans le tableau du
contrat. La colonne a bougé ; aucune propriété n'avait changé.

C'est la faute que V76 a payée deux fois. Le test cherche désormais la **ligne**
de la surface et y vérifie la **présence** de `OBSERVED` et l'**absence** de
`VALIDATED` — robuste au reformatage, et toujours rouge si le plafond saute.

## 8 · Vérifications

| | |
|---|---|
| `tests/v77-practice-model.test.mjs` | **19 / 19** |
| `npx tsc --noEmit` | **0** |
| fichiers de produit modifiés | **aucun** — la carte est nouvelle, personne ne la lit encore |

Le branchement des routes sur la carte a lieu aux CP3 → CP7, surface par
surface. Introduire la carte **et** la brancher dans le même checkpoint aurait
rendu impossible de dire laquelle des deux moitiés a cassé quelque chose.
