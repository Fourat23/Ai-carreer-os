# V75 · CP14 — Vingt-quatre manières de tricher, et ce qui les arrête

> **Une suite verte ne prouve rien tant qu'on n'a pas montré qu'elle sait
> rougir.** Ce checkpoint ne mesure pas « les tests passent-ils » mais
> **« les tests empêchent-ils de mentir ? »**

---

## 1. Pourquoi cette question, et pas l'autre

Le sprint a payé trois fois pour apprendre la différence, et la facture la plus
lourde est celle du CP9 : remplacer `sourceType: 'transfer-challenge'` par
`'assessment'` **dans la route** laissait **1797 tests verts**, parce qu'ils
vérifiaient le fabricant de preuve et jamais la route. *Le contournement que le
checkpoint devait interdire passait sous les tests censés l'interdire.*

Un test qui ne peut pas rougir ne garde rien. Le CP14 applique donc, une par
une, les **vingt-quatre mutations nommées par le brief** — chacune est une façon
plausible de faire dire au produit quelque chose de faux — et exige pour chacune
trois états successifs :

```
VERT (avant)  →  ROUGE (sous mutation)  →  VERT (après restauration)
```

`scripts/v75/cp14-mutations.mjs` · artefact `docs/v75/cp14-mutations.json`

### Deux garde-fous sur la mesure elle-même

- **l'ancrage** : chaque mutation exige que sa chaîne cible apparaisse
  **exactement une fois** dans le fichier. Une mutation appliquée au mauvais
  endroit mesurerait autre chose que ce qu'elle annonce ;
- **le départ vert** : si les tests ciblés ne passaient pas *avant* la mutation,
  le rouge ne prouverait rien. La colonne est publiée.

**Aucun test n'a été modifié pour obtenir un rouge**, et aucun fichier n'est
resté muté : chaque restauration est vérifiée à l'octet près.

---

## 2. Les vingt-quatre mutations

| # | mutation | fichier | vert avant | ROUGE | vert après |
|---|---|---|---|---|---|
| M1 | un échec est supprimé | `lib/learner-memory.mjs` | ✅ | ✅ | ✅ |
| M2 | un succès est compté deux fois | `lib/learner-memory.mjs` | ✅ | ✅ | ✅ |
| M3 | un exercice est rattaché à un `conceptId` faux | `lib/exercise-mapping.mjs` | ✅ | ✅ | ✅ |
| M4 | une preuve multi-concepts est forcée à un seul concept | `lib/exercise-mapping.mjs` | ✅ | ✅ | ✅ |
| M5 | l'arriéré TOTAL est caché derrière l'arriéré actif | `lib/backlog-triage.mjs` | ✅ | ✅ | ✅ |
| M6 | une notion garée est traitée comme acquise | `lib/backlog-triage.mjs` | ✅ | ✅ | ✅ |
| M7 | le mode récupération ne se déclenche **jamais** | `lib/recovery-mode.mjs` | ✅ | ✅ | ✅ |
| M8 | le mode récupération se déclenche **toujours** | `lib/recovery-mode.mjs` | ✅ | ✅ | ✅ |
| M9 | on ne peut **jamais** sortir de la récupération | `lib/recovery-mode.mjs` | ✅ | ✅ | ✅ |
| M10 | la sortie de récupération est **trop facile** | `lib/recovery-mode.mjs` | ✅ | ✅ | ✅ |
| M11 | le nouveau contenu continue normalement en `CRITICAL` | `lib/plan-unifie.mjs` | ✅ | ✅ | ✅ |
| M12 | un projet urgent passe en dernier | `lib/plan-unifie.mjs` | ✅ | ✅ | ✅ |
| M13 | une absence de 60 j est traitée comme une absence de 1 j | `lib/retention-priority.mjs` | ✅ | ✅ | ✅ |
| M14 | les horodatages de tentatives ne sont plus ordonnés | `lib/transfer-attempt.mjs` | ✅ | ✅ | ✅ |
| M15 | un `TransferAttempt` est perdu à la persistance | `lib/progress-store.mjs` | ✅ | ✅ | ✅ |
| M16 | un `TransferAttempt` raté compte comme une réussite | `lib/learner-memory.mjs` | ✅ | ✅ | ✅ |
| M17 | le schéma `weeklyReview` est cassé à l'écriture | `lib/progress-store.mjs` | ✅ | ✅ | ✅ |
| M18 | `data/progress.json` est créé dans le dépôt | *(fichier réel)* | ✅ | ✅ | ✅ |
| M19 | le scheduler devient non déterministe | `lib/retention-scheduler.mjs` | ✅ | ✅ | ✅ |
| M20 | le budget quotidien est dépassé | `lib/plan-unifie.mjs` | ✅ | ✅ | ✅ |
| M21 | une reprise écrase la tentative initiale | `lib/learning-engine.mjs` | ✅ | ✅ | ✅ |
| M22 | un doublon réseau crée deux faits | `lib/learning-engine.mjs` | ✅ | ✅ | ✅ |
| M23 | la soupape disparaît : famine possible au garage | `lib/backlog-triage.mjs` | ✅ | ✅ | ✅ |
| M24 | le plan de reprise ne donne plus aucune justification | `lib/plan-unifie.mjs` | ✅ | ✅ | ✅ |

**24 / 24 rouges · 0 survivante · 0 restauration incomplète · 0 départ non vert.**

**M18 n'est pas une mutation de code** : le fichier interdit est **réellement
créé**, la porte `v74:check` est relancée et doit refuser, puis le fichier est
supprimé. L'invariant du sprint est de ne jamais créer `data/progress.json` ;
encore fallait-il vérifier que quelque chose s'en aperçoive.

---

## 3. Ce que le premier passage a réellement trouvé

**Trois mutations ont survécu.** C'est le résultat utile du checkpoint — une
table de 24 ✅ au premier essai aurait surtout prouvé que les mutations avaient
été choisies pour passer.

### M17 — le schéma `weeklyReview` cassé à l'écriture

Remplacer `weeklyReviews: m.weeklyReviews` par `null` **ne cassait rien**.
Raison : **tous** les cas de `tests/progress-store.test.mjs` passaient
`weeklyReviews: {}`, un objet vide qu'aucune assertion ne distinguait de
l'absence.

C'est la **famille du défaut P7** — le store filtre les champs deux fois,
écriture et lecture, et `curriculumPause` avait disparu entre le CP7 et le CP10
sans un seul test rouge. *Un champ non vérifié sur un aller-retour réel est un
champ perdu.*

**Correctif** : un test qui écrit des bilans **non vides**, relit par
`activeTrackProgress`, et vérifie le contenu — pas seulement la présence de la clé.

### M22 — un doublon réseau crée deux faits

Neutraliser la garde par **clé métier** (`if (false)`) laissait tout vert. Le
seul test de doublon rejouait la requête 1,2 s plus tard, donc **dans la fenêtre
de `estUnRejeu`**, qui l'attrapait à la place. Deux gardes existent pour des
raisons différentes, et l'une masquait l'autre.

**Correctif** : le cas que seule la clé peut attraper — une requête **ancienne
qui arrive en retard**, après qu'une autre tentative a été enregistrée
entre-temps. La fenêtre de rejeu ne peut rien pour elle (écart négatif, issue
différente).

### M23 — la soupape disparaît

`const soupape = …` remplacé par `false` restait vert. Le seul test qui touchait
la soupape vérifiait qu'elle **ne se déclenche pas** — c'était l'anomalie n° 5
du CP5, corrigée en retirant un déclenchement accidentel. **Personne ne
vérifiait qu'elle se déclenche quand il le faut.**

*Un filet de sécurité sans test positif est un filet supposé.*

**Correctif** : un cycle de prérequis à trois (a←b, b←c, c←a — aucune paire
mutuelle, donc l'exclusion du CP5 ne s'applique pas), où les trois seraient
garées. La soupape doit s'ouvrir, ne **rien** retirer du total, et le **dire**.
Plus son pendant : elle doit rester fermée dès qu'une notion est travaillable.

### Ce qui a été corrigé, et ce qui ne l'a pas été

**Trois tests ont été ajoutés. Aucune mutation n'a été affaiblie, aucun seuil
déplacé, aucun test existant relâché.** Après correctif, les trois rougissent.

---

## 4. Une porte pour V75 — `v75:check`

Le brief demandait de passer « les portes V73/V74/V75 ». **Il n'en existait
aucune pour V75**, et c'était une vraie lacune : le sprint a produit six moteurs
purs, et rien dans `gates:active` ne les gardait.

Une suite de tests garde des **comportements**. V75 repose aussi sur des
**propriétés structurelles qu'aucune assertion ne voit se dégrader** :

| règle | ce qu'elle empêche |
|---|---|
| **A1** · les six moteurs existent, sont purs, sans `Math.random` | un moteur qui lit un fichier ne peut plus être rejoué à une date arbitraire — toute la mesure du CP13 en dépendait |
| **A2** · `I2` — l'arriéré reste **trois nombres** | le jour où quelqu'un ajoute un champ `backlog` unique, aucun test ne casse et la dette redevient masquable |
| **A3** · `PARKED` porte sa condition de retour, et la surface la **rend** | garer sans dire ce qui lèverait le garage, c'est supprimer sans le dire |
| **A4** · le mode de récupération n'est **jamais persisté** | un état stocké survit à la situation qui l'a produit |
| **A5** · les **deux** listes blanches du store portent `transferAttempts` **et** `curriculumPause` | la reproduction exacte du défaut P7 |
| **A6** · chaque bloc du plan est borné, les minutes non placées publiées | le bug du CP11 : 320 minutes sur un plafond de 300 |
| **A7** · aucun module de plan n'émet `SET_CURRICULUM_PAUSE` | recommander une pause n'est pas la décider à la place de l'apprenant |
| **A8** · aucun score de mémoire, aucun percentile, aucun classement | la §3 du contrat, vérifiée sur le **code** des moteurs et sur les surfaces |
| **A9** · le transfert est un fait dérivé, l'échec au transfert est compté | `TRANSFER_SUCCESS ≠ MASTERY` |
| **A10** · `conclusionPossible` reste `false`, `NOT YET MEASURED` reste écrit | une affirmation d'apprentissage sans donnée |
| **A11** · les moteurs sont **réellement branchés** au produit | l'équivalent V75 du critère `B12` : un moteur non branché est du code mort qui rassure |
| **A12** · `data/progress.json` n'existe pas | l'invariant du sprint |

**60 vérifications.** `npm run v75:check`, ajouté à `gates:active` — qui passe de
**47 à 48 portes**.

### La porte a été vérifiée comme le reste : par mutation

Une porte toujours verte serait pire qu'aucune porte.

| mutation appliquée à la porte | résultat |
|---|---|
| `curriculumPause` retiré de la liste blanche de **lecture** | 🔴 |
| `total` remplacé par la file plafonnée | 🔴 |
| un bornage de budget retiré | 🔴 |
| un module de plan émet `SET_CURRICULUM_PAUSE` | 🔴 |
| `conclusionPossible` devient conditionnel | 🔴 |
| le plan unifié débranché de la page d'une journée | 🔴 |
| `data/progress.json` créé | 🔴 |

**7 / 7.** Tous restaurés, arbre vérifié propre.

**Remarque sur V73** : il n'existe pas de script `v73:check` — l'intégrité du
programme est gardée par `curriculum:check`, `curriculum:depth` et le gel du
corpus dans `v48/v49/v50:check`, tous dans `gates:active`. Ce n'est pas une
porte manquante, c'est une porte portant un autre nom.

---

## 5. Le gauntlet complet

| vérification | résultat |
|---|---|
| `npm test` | **1857 / 1857** ✅ |
| `npx tsc --noEmit` | **0 erreur** ✅ |
| `npm run build` | **compilé** ✅ |
| `npm run gates:active` | **48 portes, 0 violation** ✅ |
| `npm run v74:check` | 21 vérifications ✅ |
| `npm run v75:check` | **60 vérifications** ✅ |
| `npm run curriculum:check` | 365 journées · 52 semaines · 12 mois · 128 leçons ✅ |
| `npm run v50:check` | corpus **gelé**, prérequis respectés ✅ |

### État de l'environnement

| point | résultat |
|---|---|
| `data/progress.json` | **absent** ✅ |
| arbre de travail | propre, stash vide ✅ |
| local == origin | ✅ |
| serveur résiduel | **aucun** processus Next ✅ |
| **déterminisme** | deux exécutions de la chaîne complète, sortie **identique au bit près** ✅ |
| **idempotence** | même commande rejouée → `noop:transfer-attempt:duplicate`, **1 fait**, pas 2 ✅ |

---

## 6. Ce que ce checkpoint ne prouve pas

- **il ne prouve pas que les tests sont complets.** Il prouve que
  **vingt-quatre mensonges précis** sont détectables. Un vingt-cinquième pourrait
  passer, et le premier passage a montré que c'était le cas pour trois d'entre
  eux ;
- **il ne prouve rien sur l'apprentissage.** Les mutations portent sur le code,
  pas sur des humains. `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED` ;
- **il ne valide aucun seuil.** `CATCH_UP` à 1 bloquante, `RECOVERY` à 3,
  `CRITICAL` à 6 restent **déclarés**. M7 et M8 vérifient qu'on ne peut pas les
  neutraliser sans que ça se voie — pas qu'ils sont les bons ;
- **la porte `v75:check` lit du texte**, pas des comportements. Elle attrape un
  retrait ou un renommage ; elle n'attraperait pas une logique subtilement
  fausse qui garderait les mêmes noms. C'est le rôle des 1857 tests, et c'est
  pourquoi les deux existent.
