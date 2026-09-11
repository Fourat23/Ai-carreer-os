# V74 · CP14 — QUINZE MUTATIONS NÉGATIVES

---

## 1. Note d'honnêteté sur la provenance de cette liste

Le brief énumérait quinze mutations. **Je n'en ai plus le texte verbatim** : il appartenait au
message d'origine, et ce qui m'en reste est un résumé. Je ne vais donc pas prétendre les rejouer
à la lettre.

Les quinze ci-dessous sont **dérivées des décisions gelées de V74** — contournements interdits
`G1→G12` et critères bloquants `B1→B12` du contrat. Chacune attaque une décision **nommée**, et
la couverture est étalée du CP2 au CP12.

C'est une reconstruction fidèle à l'intention, **pas une citation**. Le dire vaut mieux que de
laisser croire à une correspondance exacte.

---

## 2. Ce qu'une mutation doit prouver

Qu'une propriété est **réellement gardée**. Une mutation qui ne fait rougir personne n'est pas un
succès : c'est un **trou de couverture**. Ce sprint en avait déjà trouvé quatre (anomalies
n° 10, 11, 12, 13) — le CP14 en a trouvé deux de plus.

Le harnais (`scripts/v74/cp14-mutations.mjs`) fait deux vérifications qu'on oublie facilement :

1. **la mutation a réellement muté le fichier.** L'anomalie n° 11 portait sur `1 * 0 + 1`, qui
   vaut `1` : *une mutation qui ne mute rien ne prouve rien, et la croire efficace est pire que
   ne pas avoir muté* ;
2. **le fichier est restauré à l'octet près** après coup.

---

## 3. Les quinze mutations

| # | décision attaquée | tests rouges | mutation effective | restauré |
|---|---|---|---|---|
| M01 | **G2** — `done` n'est pas un contact significatif | 1 | ✅ | ✅ |
| M02 | **R-b** — la correction ouverte avant disqualifie la récupération | 1 | ✅ | ✅ |
| M03 | **R-c** — la 2ᵉ tentative du même artefact le même jour n'est pas un rappel | 1 | ✅ | ✅ |
| M04 | **§1.6** — `partial` gèle la série, ne la casse pas | 1 | ✅ | ✅ |
| M05 | **§3.6** — un fait sans producteur est refusé, jamais réparé | 1 | ✅ | ✅ |
| M06 | **§3.6** — la clé métier inclut `passed/total` | 1 | ✅ | ✅ |
| M07 | **B1** — l'issue est dérivée des compteurs, jamais fournie | 1 | ✅ | ✅ |
| M08 | **B10** — la justification cite au plus deux facteurs | 1 | ✅ | ✅ |
| M09 | **CP3** — la somme des poids vaut exactement 100 | 1 | ✅ | ✅ |
| M10 | **G5** — l'ancienneté se compte depuis le dernier rappel RÉUSSI | 1 | ✅ | ✅ |
| M11 | **CP8** — le statut décide de la bande, le score du rang dedans | 2 | ✅ | ✅ |
| M12 | **CP8** — une séance n'est jamais intégralement composée de retard | 8 | ✅ | ✅ |
| M13 | **CP7** — la correction complète est la dernière marche | 11 | ✅ | ✅ |
| M14 | **G12** — une journée déjà hors budget ne reçoit aucune minute | 13 | ✅ | ✅ |
| M15 | **CP11** — une co-occurrence de compétences n'est pas un transfert | 1 | ✅ | ✅ |

**15 sur 15 font rougir au moins un test. Les 15 fichiers sont restaurés à l'octet près.**

---

## 4. Les deux trous que le premier passage a révélés

Au premier passage, **13 sur 15**. Les deux manquantes étaient de vrais défauts de couverture, et
les deux méritent d'être décrits parce qu'ils ont la même forme.

### 4.1 M06 — la clé métier ne testait qu'une direction sur deux

Le test existant vérifiait que deux enregistrements **à la même seconde** produisent la même clé.
**Rien ne vérifiait la direction inverse** : que deux tentatives de **scores différents** restent
deux faits distincts. Retirer `passed/total` de la clé ne faisait donc rougir personne.

**Conséquence réelle de l'absence** : un apprenant qui relance l'exercice dans la même seconde
après avoir corrigé son code verrait sa progression (2/5 → 5/5) **écrasée par déduplication**. Le
moteur perdrait le fait le plus intéressant qu'il ait : celui qui montre qu'il vient de
comprendre.

Un test a été ajouté sur la direction qui distingue.

### 4.2 M10 — la fixture posait exactement le cas où la règle n'a rien à décider

Le CP3 avait écrit dans son journal : *« G5 gardé par un test : "récent" ne protège pas. »* Le
test existait bien. **Il ne gardait rien.**

Il posait `lastSuccessAt` **sans poser `lastRetrievalAt`**, laissé à `null` par la fixture. Or le
code lit `lastSuccessAt ?? lastRetrievalAt` : avec un `lastRetrievalAt` nul, **les deux ordres de
repli donnent le même résultat**. Inverser l'expression ne changeait rien.

Le cas discriminant — qui est aussi le cas réel que G5 vise — est : **une tentative RÉCENTE qui a
ÉCHOUÉ, et une réussite ANCIENNE**. C'est là que « récent ne protège pas » veut dire quelque
chose. La fixture le construit désormais.

**C'est le même motif que les anomalies n° 9, 10 et 13** : un test qui passe pour une raison
étrangère à la propriété qu'il annonce. **Quatrième occurrence du sprint, et la leçon est
toujours la même : un test vert ne prouve rien tant qu'on ne l'a pas vu rougir.**

---

## 5. Une nouvelle porte : `v74:check`

Le brief demandait de rejouer « les portes V74 ». **Elles n'existaient pas** — V65 et V66 ont
chacune la leur, V74 n'en avait aucune. Elle est créée ici et ajoutée à `gates:active`, qui
passe de **46 à 47 portes**.

Elle ne duplique pas la suite de tests : elle garde des **propriétés structurelles** qu'aucune
assertion ne voit — celles qui se dégradent en silence.

| règle | ce qu'elle garde |
|---|---|
| **R1** | le fait `ExerciseAttempt` existe, est persisté, a sa commande |
| **R2** | la tentative est écrite **AVANT** la branche de succès (dette D1/D2 du CP0) |
| **R3** | `correctionSeen` existe et vaut **vrai par défaut** — le doute joue contre le compteur |
| **R4** | aucune couche V74 ne définit d'échelle d'espacement |
| **R5** | les six modules décisionnels sont **purs** (ni horloge, ni aléa) |
| **R6 · B12** | **les cinq modules sont branchés au read-model, la page appelle l'arbitre, le laboratoire appelle la remédiation** |
| **R7 · §9** | aucune surface n'affiche un score de mémoire |
| **R8** | `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED` reste déclaré |
| **R9** | un transfert est une preuve de défi, pas une co-occurrence |
| **R10** | `data/progress.json` n'existe pas dans le dépôt |

**21 vérifications.** R6 est la plus importante : c'est le critère bloquant B12, et c'est
exactement le genre de régression qu'aucun test de comportement ne voit — l'audit du CP12 avait
trouvé six modules écrits, testés, et joignables par personne.

### La porte a été vue rougir

| mutation injectée | rouge |
|---|---|
| débrancher l'arbitre de la page (B12) | ✅ `[R6·B12]` |
| supprimer la commande `RECORD_EXERCISE_ATTEMPT` | ✅ `[R2]` |
| écrire la tentative **après** la branche de succès | ✅ `[R2]` |
| définir une échelle d'espacement dans `daily-plan` | ✅ `[R4]` |
| rebaptiser la co-occurrence en « transfert » | ✅ `[R9]` |

**Une de mes mutations de contrôle était inefficace, une fois de plus** : renommer
`RECORD_EXERCISE_ATTEMPT` en `RECORD_EXERCISE_ATTEMPT_X` laisse la chaîne d'origine **contenue**
dans la nouvelle, donc `indexOf` la trouvait toujours. Même famille que l'anomalie n° 11.
Refaite correctement, elle rougit.

---

## 6. Vérifications après restauration complète

| | |
|---|---|
| fichiers de **produit** modifiés par le CP14 | **0** — seuls deux fichiers de test ont été corrigés |
| `npm test` | **1612 / 1612** |
| `npx tsc --noEmit` | **0 erreur** |
| `npm run build` | **OK** |
| `npm run gates:active` | **47 portes, 0 violation** |
| `data/progress.json` | **absent** |
| corpus des leçons | `92d5fae6…` **inchangé** |

---

## 7. Fichiers

**Créés** : `scripts/v74/cp14-mutations.mjs` (harnais des 15 mutations), `scripts/v74-check.mjs`
(porte V74, 21 vérifications), ce document.

**Modifiés** : `package.json` (`v74:check` ajoutée à `gates:active`),
`tests/v74-learner-memory.test.mjs` (trou M06 comblé),
`tests/v74-retention-priority.test.mjs` (sonde G5 corrigée).
