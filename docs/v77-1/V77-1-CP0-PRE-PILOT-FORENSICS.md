# V77.1 · CP0 — VÉRIFICATION MÉDICO-LÉGALE AVANT PILOTE

> Lecture seule sur le produit. Rien n'est corrigé ici : le CP0 **mesure et
> déclare**, les décisions sont prises aux CP1 → CP5.

---

## 1. Git et santé

| | |
|---|---|
| dépôt | `Fourat23/Ai-carreer-os` |
| branche | `claude/ai-career-os-saas-phfg49` |
| `HEAD` | `ad567b0` |
| `origin` | `ad567b0` — **identiques** |
| arbre de travail | **propre** |
| `npm test` | **2177 / 2177** |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `gates:active` | **50 portes, 0 violation** |
| `v74` `v75` `v76` `v77` | ✅ ✅ ✅ ✅ |
| `data/progress.json` | **absent** |

La ligne de base de V77 tient intégralement.

---

## 2. CP0.A — LE VERDICT V77 A ÉTÉ INVENTÉ APRÈS COUP

C'est la découverte la plus gênante de ce CP0, et elle porte sur mon propre
travail.

**Le contrat gelé du CP1 fixe une échelle à quatre valeurs** (§10.2), gelée
*« avant le CP2 »*, c'est-à-dire avant toute implémentation :

```
PRACTICE_OBSERVABILITY_READY             O1–O20 tous atteints
PRACTICE_OBSERVABILITY_CANDIDATE         O1–O16 atteints, 1 ou 2 lacunes sur O17–O20
PRACTICE_OBSERVABILITY_FOUNDATION_READY  carte et niveaux existent, surfaces non traitées
PRACTICE_OBSERVABILITY_NOT_READY         tous les autres cas
```

Et il ajoute, sans ambiguïté :

> Si `O1`–`O20` sont tous atteints, le verdict d'ingénierie **DOIT** être
> `PRACTICE_OBSERVABILITY_READY`.

**`UNIFIED` n'apparaît nulle part dans le contrat gelé.** Le rapport final de V77
a donc employé un label **inventé après l'implémentation** — exactement la
catégorie de dérive que le contrat interdit lui-même (`H14` : *« affaiblir une
porte, une sonde ou un seuil après en avoir vu le résultat »*), sous une forme
que je n'avais pas anticipée : ni affaiblir ni renforcer, mais **contourner
l'échelle**.

Ce n'est pas anodin. Un label hors échelle est incomparable : il empêche de
savoir si `O17`–`O20` ont été atteints ou contournés.

### 2.1 L'audit `O1`–`O20`, refait

| # | critère | état | preuve |
|---|---|---|---|
| `O1` | carte canonique **lue par le produit** | ❌ **NON** | `lib/practice-model.mjs` n'est importé que par la porte et 2 tests — **aucun code produit** |
| `O2` | chaque surface porte une politique explicite | ✅ | 13 surfaces + 21 de lecture |
| `O3` | aucune surface `FACT_REQUIRED` importante muette | ✅ | E2E CP13 |
| `O4` | tout fait nouveau porte les champs du §3.1 | ✅ | tests CP3–CP7 |
| `O5` | aucun fait sans `provenance.producer` | ✅ | tests + porte `A5` |
| `O6` | trois niveaux portés structurellement | ✅ | `evidenceLevel` |
| `O7` | `OBSERVED`/`DECLARED` ne comptent pas | ✅ | CP9 |
| `O8` | une mission ne produit jamais `VALIDATED` | ✅ | CP5 + porte `A6` |
| `O9` | capstone plus archivé `self` | ✅ | 13/13 |
| `O10` | *n* échecs → *n* faits | ✅ | CP4 |
| `O11` | `simulation` est un champ | ✅ | CP6 |
| `O12` | la simulation survit jusqu'à la preuve | ✅ | E2E `C3` |
| `O13` | double comptage mesuré et contenu | ✅ | 42 · 14 · 0 |
| `O14` | `derivedFrom` survit | ✅ | CP10 |
| `O15` | rejeu idempotent | ✅ | CP10 |
| `O16` | l'ordre ne change pas la projection | ✅ | CP10 |
| `O17` | aucun fait historique réécrit ni perdu | ✅ | CP5, CP9 |
| `O18` | **export et suppression couvrent tout fait nouveau** | ⚠️ **PARTIEL** | export ✅ ; `reset` vide la progression ✅ **mais** l'instantané de secours les conserve |
| `O19` | ≥ 30 mutations rouges, porte comprise, juge externe | ✅ | 36/36 |
| `O20` | gantelet complet vert | ✅ | 50 portes |

**Résultat : `O1` non atteint, `O18` partiel.** Selon l'échelle gelée, le verdict
canonique de V77 est donc **`PRACTICE_OBSERVABILITY_CANDIDATE`** — `O1`–`O16`
atteints (à l'exception de `O1`), deux lacunes déclarées.

> `O1` fait partie de `O1`–`O16`, donc la lettre de l'échelle placerait V77 en
> `NOT_READY`. Le CP1 doit trancher ce point de lecture **sans réécrire
> l'histoire** : soit `O1` est jugé atteint au sens « une source unique existe et
> fait autorité » (la porte la lit et la teste), soit V77 est `CANDIDATE` avec
> `O1` déclaré manquant.

**Je ne tranche pas ici.** Le CP0 mesure ; le CP1 gèle.

---

## 3. CP0.B — RESET / DELETE : LA MATRICE

Mesuré en HTTP sur le produit reconstruit, progression hors dépôt, après avoir
produit de vraies données (un exercice résolu + une exécution de terminal).

| donnée | `RESET_PROGRESS` | `DELETE_ALL` | `EXPORT_PROGRESS` | `EXPORT_FULL` |
|---|---|---|---|---|
| état d'apprentissage (9 faits) | **effacé** | `NOT_IMPLEMENTED` | **inclus** | `NOT_IMPLEMENTED` |
| `progress.backup.json` | **CRÉÉ, contient tout** | `NOT_IMPLEMENTED` | non | `NOT_IMPLEMENTED` |
| `data/lab-workspaces/` | **conservé** | `NOT_IMPLEMENTED` | **inclus** (via `workspaces`) | `NOT_IMPLEMENTED` |
| `data/lab-journals/` (**code de l'apprenant**) | **conservé** | `NOT_IMPLEMENTED` | **non inclus** | `NOT_IMPLEMENTED` |
| données d'étude (pilote) | `N/A` (n'existent pas) | `N/A` | `N/A` | `N/A` |
| exports temporaires | `N/A` (rien n'est écrit sur disque) | `N/A` | `N/A` | `N/A` |
| curriculum, exercices, code source | `N/A` — jamais touchés | `N/A` | non | `N/A` |

**Mesure brute :**

```
AVANT reset  progression {evidence 1, exerciseAttempts 1, usageEvents 1}
             backup absent · lab-journals 1
APRÈS reset  progression VIDE
             backup PRÉSENT → {evidence 1, exerciseAttempts 1, usageEvents 1}
             lab-journals 1 · contient du CODE apprenant : True
```

**Aucune route `DELETE ALL` n'existe.** `app/api/progress/` contient `export`,
`import`, `reset` — rien d'autre.

### 3.1 Ce que l'interface en dit — et pourquoi c'est un problème

> « Efface **toute** ta progression […] Cette action est **irréversible**. »
> puis, deux lignes plus bas :
> « Tout sera effacé (l'état actuel sera tout de même **sauvegardé
> automatiquement** côté serveur). »

Le même bloc affirme une chose et son contraire. Et « **tout** sera effacé » est
faux : les journaux de laboratoire — **qui contiennent le code écrit par
l'apprenant** — survivent.

C'est délibéré côté moteur (V76 · CP10 : un `RESET` ne doit pas emporter
l'histoire d'un échec). **Le défaut est dans le mot, pas dans le comportement.**

---

## 4. CP0.C — L'EXPORT DIT « TOUTES TES DONNÉES », ET C'EST FAUX

Texte actuel de `app/settings/SettingsPanel.tsx` :

> « Télécharge **toutes tes données locales** : progression de chaque parcours
> […] et workspaces du Laboratoire »

Mesuré sur `/api/progress/export` :

```
racine   : app · schemaVersion · exportedAt · stats · progress · workspaces
parcours : les 9 faits, days, skills, revues, métadonnées
ABSENT   : data/lab-journals/  →  le CODE de l'apprenant
```

La phrase se contredit d'ailleurs elle-même : elle annonce « toutes » puis
énumère un sous-ensemble. **Un participant de pilote qui exporte « toutes ses
données » n'emporte pas son code.**

**Décision reportée au CP1/CP2** : soit l'export devient réellement complet, soit
le wording devient exact. Les deux sont acceptables ; mentir ne l'est pas.

---

## 5. CP0.D — TROIS SCOPES CANDIDATS POUR LE PREMIER PILOTE

Contrainte : valider l'**instrumentation** et l'**expérience**, pas l'efficacité
du programme 365 jours. Profil visé : développeur avec des bases JS/Postman,
**niveau réel inconnu** — c'est le PRETEST qui le mesurera, pas une supposition.

### Candidat A — `api-production-contracts` *(HTTP de production)*

| | |
|---|---|
| leçon | « API de production : idempotence, pagination, limites et versions » · 50 min · niveau 3 · 2 878 mots |
| concepts | idempotence · pagination · limitation de débit · codes d'authentification |
| exercices non ambigus | `http-method-idempotent` (d2) · `api-pagination-choice` (d2) · `auth-status-decision` (d2) · `http-rate-limit-decide` (d3) — tous `node-js`, 4 tests chacun |
| rappel | formats disponibles : `free`, `discrim` |
| transfert | `idempotence-http-to-queue` — *reconnaître l'idempotence loin de l'API HTTP* (3 questions, seuil 0,7) |
| durée estimée | lecture 50 min + 2 exercices ≈ 30 min + rappel 10 min + transfert 10 min ≈ **1 h 40 sur deux séances** |
| prérequis | HTTP de base, JSON, un client d'API |
| ambiguïté | **aucune** sur les exercices retenus |

**Pourquoi** : c'est le seul candidat où le transfert est *réellement* éloigné —
idempotence HTTP → file de messages — donc le seul qui puisse montrer autre chose
qu'une répétition. Le niveau 3 correspond à un développeur qui connaît Postman
sans avoir formalisé ces notions.

**Risque** : seulement 2 formats de rappel.

### Candidat B — `algorithmic-thinking`

| | |
|---|---|
| leçon | « La pensée algorithmique » · 50 min · niveau 1 · 3 481 mots |
| exercices non ambigus | `fizzbuzz` (d1) · `algo-binary-search` (d2) · `algo-interval-merge` (d3) · `algo-kadane-max-subarray` (d4) · `algo-coin-change-min` (d4) |
| rappel | **5 formats** : `free`, `cued`, `applied`, `discrim`, `generate` |
| transfert | `greedy-is-not-optimal` · `quadratic-blowup-everywhere` |
| durée | comparable |
| ambiguïté | aucune |

**Pourquoi** : la palette de rappel la plus riche, et une montée en difficulté
franche (d1 → d4).
**Risque** : registre « entretien technique » plutôt que travail produit ; et un
développeur expérimenté peut plafonner au PRETEST sur `fizzbuzz`/`binary-search`.

### Candidat C — `javascript-basics`

| | |
|---|---|
| leçon | niveau 1 · 3 408 mots |
| exercices | `js-conditions` (d1) · `js-loops` (d1) · `js-array-objects` (d2) · `js-even-squares` (d2) |
| rappel | 4 formats |
| transfert | `stale-value-in-async` |
| ambiguïté | aucune |

**Risque rédhibitoire** : plafond quasi certain au PRETEST pour le profil visé.
Un pilote qui ne peut rien observer ne mesure pas l'instrumentation, il la
gaspille.

### Recommandation — **Candidat A**, critères explicités

| critère | A | B | C |
|---|---|---|---|
| risque de plafond au PRETEST | **faible** | moyen | **élevé** |
| distance du transfert | **forte** | moyenne | faible |
| exercices sans ambiguïté | 4 | 5 | 4 |
| formats de rappel | 2 | **5** | 4 |
| proximité du travail réel | **forte** | faible | moyenne |
| durée humaine | ≈ 1 h 40 | ≈ 1 h 40 | ≈ 1 h 20 |

Le plafond au PRETEST est le seul risque qui **invalide** un pilote ; les autres
le rendent seulement moins riche. **A** est retenu comme candidat principal, **B**
comme repli si le PRETEST de A révèle un participant déjà expert.

Le CP3 gèlera le choix.

---

## 6. Risques identifiés

| # | risque | gravité |
|---|---|---|
| `R1` | le verdict V77 hors échelle rend V77 incomparable | **haute** — CP1 |
| `R2` | `DELETE ALL` n'existe pas ; l'interface laisse croire le contraire | **haute** — CP2 |
| `R3` | l'export ment sur son contenu | **haute** — CP2 |
| `R4` | `O1` non atteint : la carte des surfaces n'est lue par aucun code produit | moyenne — CP1 (déclarer) |
| `R5` | plafond au PRETEST si le participant connaît déjà HTTP | moyenne — règle gelée au CP3 |
| `R6` | le délai de rappel ne peut pas être garanti par une horloge client | moyenne — CP4 |
| `R7` | aucune notion de « session de participant » n'existe dans le produit | moyenne — CP4 |

---

## 7. Plan CP1 → CP6

| CP | livrable |
|---|---|
| **CP1** | `V77-1-PILOT-CONTRACT-FROZEN.md` — question, hypothèses, outcome primaire, délai, règles d'arrêt et de donnée manquante ; **et le verdict V77 canonique remis sur l'échelle gelée** |
| **CP2** | `RESET` vs `DELETE ALL` distincts et honnêtes ; export complet **ou** wording exact ; page de confidentialité |
| **CP3** | scope du pilote gelé + mappings conceptuels des seuls exercices utilisés |
| **CP4** | répétition à blanc complète avec données synthétiques, horloge serveur, export vérifié |
| **CP5** | procédure participant, script facilitateur, catégories de confusion, liste de contrôle |
| **CP6** | 25 mutations négatives, gantelet complet, rapport final, verdicts |
