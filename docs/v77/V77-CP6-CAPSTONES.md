# V77 · CP6 — LE CAPSTONE ÉTAIT DÉGRADÉ, PAS SURCLASSÉ

> L'erreur de **sens inverse** de celle du CP5 — et elle vient du même endroit :
> un vocabulaire incomplet, jamais vérifié de bout en bout.

---

## 1. Le mécanisme exact

`capstone-grade` était absent de `VALIDATION_KINDS`. `normalizeValidation`
remplace tout genre inconnu par `self`. Une correction **serveur**,
déterministe, contre un corrigé déclaré d'avance, en plusieurs phases, était
donc archivée comme une **auto-déclaration de l'apprenant**.

Ce n'était pas `capstone-grade` qui était spécial : c'était l'absence du mot
dans une liste. Le test `« un genre hors vocabulaire retombe sur self »` rejoue
ce mécanisme plutôt que le symptôme.

## 2. Ce que la mesure a montré **en plus** de la dette

Les 13 capstones réels, corrigé en main (`scripts/v77/cp6-capstones-before-after.mjs`) :

```
corrigé atteignant le seuil : 13 / 13

AVANT — genre archivé       : 13 × self
AVANT — niveau de preuve    : 13 × DECLARED
AVANT — compétence projetée : 13 × demonstrated      ← ?

APRÈS — genre archivé       : 13 × capstone-grade
APRÈS — niveau de preuve    : 13 × VALIDATED
APRÈS — compétence projetée : 13 × demonstrated
marque de SIMULATION        : 13 × true (champ, plus du texte)
```

**Les deux lignes marquées se contredisent.** `isQualifying` ne regarde ni le
genre ni le niveau — seulement le type de source et le statut. Le produit disait
donc *« déclaration »* dans le genre et créditait *« démonstration »* dans la
compétence : deux phrases opposées sur le même objet, cohabitant sans que rien
ne rougisse.

Le CP6 aligne le genre. **Il ne touche pas à `isQualifying`** : décider si une
preuve qualifiante doit aussi exiger un niveau est le mandat du CP9, et le
trancher ici serait changer la règle de crédit de tout le produit au détour d'un
checkpoint sur les capstones. Le test fige l'état constaté ; il ne le préjuge
pas.

## 3. Deux plafonds, et le plus sévère gagne

Le CP5 avait posé un plafond **par source**. Le CP6 en ajoute un **par moyen**,
parce que le capstone montre qu'ils ne disent pas la même chose :

| moyen (`validation.kind`) | plafond | pourquoi |
|---|---|---|
| `exercise-tests` | `VALIDATED` | des tests ont tourné en bac à sable |
| `assessment-grade` | `VALIDATED` | correction serveur contre un corrigé |
| **`capstone-grade`** | **`VALIDATED`** | idem, multi-phases (nouveau) |
| **`capstone-review`** | **`OBSERVED`** | migration héritée — la correction n'a **jamais été rejouée** |
| `mission-deliverables` | `OBSERVED` | forme + revue auto-signée (CP5) |
| `self` | `DECLARED` | une déclaration, même quand elle dit « réussi » |

Vérifié dans les deux sens :

- source généreuse + moyen faible → `capstone` + `self` = **`DECLARED`** ;
- source plafonnée + moyen généreux → `mission` + `assessment-grade` = **`OBSERVED`**.

## 4. Ce que ce checkpoint refuse de faire

**Les preuves héritées `capstone-review` ne sont PAS remontées.** Leur genre
vient d'une migration qui les a reclassées **sur la foi de leur identifiant**,
sans jamais rejouer la correction. Affirmer qu'une correction a eu lieu serait
reconstruire un fait historique absent — nommément interdit.

Une preuve héritée relue du disque garde donc son `kind: 'capstone-review'` et
son `status: 'passed'` persistés, et reçoit `evidenceLevel: 'OBSERVED'`. Le
disque n'est pas réécrit ; c'est ce qu'on en **dit** qui est plafonné.

C'est la dette `D5` du CP0 — *« les vieilles preuves sont mieux étiquetées que
les neuves »* — désormais retournée : les neuves disent la vérité, et les
vieilles restent à leur place.

## 5. La simulation devient un champ

Dette `D9` : la marque de simulation vivait dans du texte libre (`detail`),
c'est-à-dire nulle part pour un lecteur futur. Elle est maintenant un booléen
sur la preuve **et** sur le fait.

**Elle ne dégrade aucun niveau.** `VALIDATED` et `simulation: true` tiennent
ensemble, et c'est exactement ce qu'un capstone est : réussir une simulation
professionnelle est un indice fort, ce n'est pas une expérience réelle. Le
contrat gelé l'exige, et les deux faits sont désormais lisibles séparément au
lieu d'être noyés dans une phrase.

Elle ne se devine pas non plus : absente, elle vaut `false` ; du texte ne vaut
pas un booléen.

## 6. Un seul fait pour deux surfaces

Décision du CP2, appliquée ici : un capstone est **observationnellement** un
diagnostic — un questionnaire corrigé côté serveur contre un corrigé déclaré. La
route des capstones écrit donc le **même** `AssessmentAttempt` que les
diagnostics, avec `kind: 'capstone'` et `simulation: true`, plutôt qu'un type de
fait jumeau. Deux types de faits pour six surfaces, pas six.

Écrit **avant** la branche `record`, pour la raison mesurée au CP4 : n'écrire que
sous `record` n'observerait que les tentatives dont l'apprenant est assez content
pour les garder.

## 7. La chaîne réelle, mesurée en HTTP

Capstone `agent-tool-loop-incident`, corrigé soumis sur le produit reconstruit :

```
corrigé : 7/7 · conservé : True · qualifiante : True

assessmentAttempts :
  agent-tool-loop-incident  kind=capstone  7/7  simulation=True  reussiteGlobale=True

evidence :
  capstone  agent-tool-loop-incident  status=passed  kind=capstone-grade
                                      niveau=VALIDATED  simulation=True
```

Une soumission observée, une preuve qui dit enfin par quel moyen elle a été
obtenue, et une marque de simulation qui survit à la sérialisation.

## 8. Vérifications

| vérification | résultat |
|---|---|
| `tests/v77-capstone.test.mjs` | **11 / 11** (les 13 capstones parcourus) |
| `npm test` | **2081 / 2081** |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **49 portes, 0 violation** |
| BEFORE/AFTER 13 capstones | `self`/`DECLARED` → `capstone-grade`/`VALIDATED` · simulation `null` → `true` |
| chaîne HTTP réelle | fait `kind: capstone` + preuve `capstone-grade`/`VALIDATED` |
| `data/progress.json` | **absent** |

## 9. Ce qui reste ouvert

**`isQualifying` ignore toujours le niveau.** Une preuve `DECLARED` d'un type
qualifiant portant `passed` crédite encore une compétence. Aujourd'hui aucune
route n'en produit — le CP5 a retiré le cas des missions, le CP6 celui des
capstones — mais la règle elle-même n'a pas changé. **C'est le mandat du CP9**,
et le noter ici évite de le découvrir en écrivant la matrice.

**Le corpus n'est pas homogène dans le temps**, pour les capstones comme pour
les missions : une progression antérieure au CP6 porte des preuves de capstone
au genre `self`. Pour V78 ce n'est pas un problème — les participants partent
d'une progression vierge — mais un pilote qui relirait d'anciennes données doit
le savoir.
