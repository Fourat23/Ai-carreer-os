# V77.1 — RAPPORT FINAL

**HUMAN PILOT DATA & PROTOCOL CLOSURE — PRE-PILOT FREEZE BEFORE V78**
CP0 → CP6 · branche `claude/ai-career-os-saas-phfg49`

---

## 1. Verdict

> ### Axe pré-pilote — `HUMAN_PILOT_READY_WITH_RESERVATIONS`
>
> ### Axe apprentissage humain — `REAL_HUMAN_LEARNING_EVIDENCE_NOT_MEASURED`
> *(inchangé, et il ne pouvait pas changer)*

Aucune des treize interdictions de `READY` ne se déclenche :

| interdiction | état |
|---|---|
| `DELETE ALL` ment sur ce qu'il supprime | ✅ vérifié **sur le disque** et en HTTP réel |
| l'export ment sur ce qu'il contient | ✅ deux routes, deux noms exacts |
| scope pilote non gelé | ✅ fixture + 26 tests |
| exercice pilote ambigu | ✅ les deux ont **exactement un** déclarant |
| concept mapping absent | ✅ explicite et justifié, exercice par exercice |
| métrique primaire non gelée | ✅ **une seule**, avec son `WHY_THIS_ONE` |
| délai non gelé | ✅ 24 h, fenêtre `[18, 36]`, **horloge serveur** |
| règles d'arrêt absentes | ✅ `A1`–`A5`, `N1`–`N8`, quatre statuts |
| dry-run incomplet | ✅ 11 étapes, 0 non conforme, **0 manque** |
| données d'étude non exportables | ✅ archive complète + suppression, vérifiées |
| l'instrumentation modifie ce qu'elle observe | ✅ **mesuré nul** (empreinte SHA-256) |
| flux participant non documenté | ✅ trois documents |
| tests / portes rouges | ✅ tout vert |

**Et pourtant, pas `READY`.** Deux réserves, mesurées, qui ne mentent pas mais
qui changent ce que le pilote observera :

| # | réserve | ce qu'elle coûte |
|---|---|---|
| `RS1` | **`/retention` ne propose pas le concept focal.** Un participant neuf y lit « Aucune tentative de rappel enregistrée ». Les quatre amorces de PRETEST et les deux rappels se conduisent **oralement**, enregistrés par le facilitateur en commande directe. | le pilote observe la **trace** de la boucle de rappel, **pas la surface de rappel du produit**. La personne ne verra jamais `/retention` fonctionner. |
| `RS2` | **Un échec d'exercice ne porte aucun concept.** Seule la preuve de réussite en porte. Le lien échec → notion vient de la fixture gelée, pas du fait. | sans la fixture, un lecteur de l'export ne saurait pas sur quelle notion la personne a échoué — c'est-à-dire l'information la plus utile à un moteur de rétention. |

Aucune des deux n'est un mensonge, aucune n'invalide le protocole, et aucune ne
se corrige dans le périmètre de V77.1. **Elles se déclarent.** Un pilote peut
commencer ; il faut savoir ce qu'il ne montrera pas.

---

## 2. Les constats du CP0 réellement utilisés

Le CP0 avait publié sept constats. **Cinq ont commandé du travail** ; deux ont
été remesurés et réinterprétés.

| # | constat du CP0 | ce qu'il a produit |
|---|---|---|
| `F1` | le verdict V77 `UNIFIED` ne figure pas dans l'échelle gelée | **CP1 §1** — verdict canonique rétabli |
| `F2` | `O1` non atteint : la carte n'est lue par aucun code produit | **CP1 §1.5** — déclaré comme lacune `L1`, **non verdi** |
| `F3` | `O18` partiel : l'instantané conserve ce que `reset` efface | **CP2** — `DELETE ALL` l'emporte enfin |
| `F4` | aucune route `DELETE ALL` | **CP2** — route écrite, testée sur disque et en HTTP |
| `F5` | « efface tout / irréversible » **et** « sauvegardé automatiquement » | **CP2** — les deux mots séparés, chacun là où il est vrai |
| `F6` | « toutes tes données locales » est faux | **CP2** — archive complète + sauvegarde renommée |
| `F7` | `reset` conserve le code, délibérément, mais sans le dire | **CP2** — comportement **inchangé**, wording corrigé |
| `CP0.D` | trois scopes candidats | **CP3** — **remesurés**, et le classement a changé (§8) |

---

## 3. Le verdict canonique de V77

Le rapport final de V77 portait `PRACTICE_OBSERVABILITY_UNIFIED`. **Ce label
n'existe pas** dans l'échelle gelée au CP1 de V77, gelée *avant le CP2*.

Re-vérifié au CP1, une ligne :

```
importeurs de lib/practice-model.mjs
  lib/practice-model.d.ts · scripts/v77-check.mjs
  tests/v77-pilot-readiness.test.mjs · tests/v77-practice-model.test.mjs
→ AUCUN code produit
```

`O1` dit *« existe **et est lue par le produit** »*. Non atteint. `O18`
partiel.

- `READY` exclu : `O1` n'est pas atteint.
- `CANDIDATE` exclu : il exige `O1`–`O16` **atteints**. Le retenir demanderait
  de lire `O1` en abandonnant sa seconde moitié **après en avoir vu le
  résultat** — c'est `H14`.
- `FOUNDATION_READY` exclu : sa clause dit *« des surfaces importantes restent
  non traitées »*, et elles sont traitées.

> ## `V77_ENGINEERING_VERDICT_CANONICAL = PRACTICE_OBSERVABILITY_NOT_READY`

Cela **ne reprend aucune mesure de V77** : la quatrième liste blanche a bien été
trouvée, les 13 capstones ne sont plus archivés `self`, 5 échecs laissent bien 5
faits, 36 mutations ont bien été vues rouges. Cela dit que **l'échelle n'a pas
de case** pour « tout atteint sauf un critère de définition » — et que c'est
précisément pour cela qu'on ne la retaille pas maintenant.

**Rien n'a été fait pour rattraper le verdict** : la carte n'a pas été branchée
dans du code produit, et `docs/v77/V77-FINAL-REPORT.md` n'a pas été réécrit. Il
porte `UNIFIED` ; ce document porte la correction et sa raison. Effacer le label
inventé masquerait la dérive au lieu de la documenter.

---

## 4. `RESET`

**Comportement inchangé.** V76 · CP10 tient : un `RESET` n'efface pas l'histoire
d'un échec.

| | |
|---|---|
| progression | **vidée** |
| instantané de secours | **créé** |
| `data/lab-workspaces/` | **conservé** |
| `data/lab-journals/` (le code) | **conservé** |
| réversible | oui, via l'instantané |

Ce qui a changé : la route rend `porteeDe('reset')`, dérivé de la carte des
données — l'appelant peut **vérifier** ce qui a survécu au lieu de le croire. Et
le mot *irréversible* a disparu de ce bloc.

---

## 5. `DELETE ALL`

`POST /api/progress/delete-all`. Les **quatre** catégories partent, y compris le
code. **Aucun filet n'est créé.** C'est le seul endroit du produit où le mot
*irréversible* est vrai, et il n'est écrit que là.

Elle exige `{"confirmation":"SUPPRIMER"}` — **la minuscule est refusée**.

### 5.1 Deux verrous, parce que `data/` contient le curriculum

`data/` **n'est pas** le répertoire de l'apprenant : il contient
`data/exercises/`, `data/assessments/`, `data/capstones/`, `data/missions/`,
`data/program.json`, `data/pilot/`. Une suppression écrite « efface `data/` »
aurait détruit le produit en croyant respecter un droit.

| verrou | ce qu'il fait |
|---|---|
| liste blanche | **quatre chemins nommés un par un**. Aucun balayage, aucun glob |
| garde-fou | **refuse le plan entier** s'il vise le produit, la racine, ou `/` |

Un plan refusé ne supprime **rien** — pas même les catégories légitimes. Et la
comparaison se fait **par segments** : `/a/data` n'est pas le parent de
`/a/database`.

### 5.2 Vérifié en HTTP réel

```
POST /delete-all {}                            → 400 CONFIRMATION_MANQUANTE
POST /delete-all {"confirmation":"supprimer"}  → 400 CONFIRMATION_MANQUANTE
POST /delete-all {"confirmation":"SUPPRIMER"}  → 200 ok:true

APRÈS, sur le disque
  progress.json        absent     data/program.json   PRÉSENT
  progress.backup.json absent     data/exercises      PRÉSENT
  data/lab-workspaces  absent     curriculum          PRÉSENT
  data/lab-journals    absent     lib/evidence.mjs    PRÉSENT

/export-all rejoué → journaux {} · instantané null · progression vide
```

---

## 6. Les exports

| | sauvegarde restaurable | archive complète |
|---|---|---|
| route | `/api/progress/export` | `/api/progress/export-all` |
| relisible par `/import` | **oui** | non |
| progression | incluse | incluse |
| espaces de travail | inclus | inclus |
| **journaux (le code)** | **non** | **oui** |
| instantané de secours | non | **oui** |
| sert à | revenir en arrière | **emporter** |

**Deux routes, et non un champ de plus.** Verser les journaux dans la sauvegarde
aurait obligé à toucher `serializeBackupV3` / `parseBackupV3` / `validateStrict`
— le format que trois portes gardent — pour un besoin qui n'est pas celui de la
restauration. Deux noms exacts valent mieux qu'un nom élargi.

L'archive porte son identité de session (§21) et la liste de ses catégories,
**lue** dans la carte des données, jamais recopiée.

---

## 7. Confidentialité et données locales

`docs/v77-1/V78-DATA-RIGHTS.md`. Tout est **local** : aucun compte, aucune
télémétrie, aucun appel sortant, aucun destinataire.

**Quatre catégories appartiennent au participant** — progression, instantané,
espaces de travail, journaux de tentatives. Les deux dernières contiennent
**son code**.

**Cinq engagements**, dont deux sont l'hypothèse `H7` : il peut tout emporter,
et tout faire effacer — et la suppression est **vérifiable** en ré-exportant
juste après.

**Ce qui n'est pas promis, et qui est écrit** : aucune garantie sur les copies
faites hors de l'application, ni sur les sauvegardes du système ; aucun
chiffrement ; **aucune séparation entre participants sur une même machine** —
d'où la condition `N5`, qui est une consigne de procédure et non un garde-fou
logiciel.

---

## 8. Le scope du pilote

> **`V78-SCOPE-HTTP-PRODUCTION`** · fixture `data/pilot/v78-pilot-1.json`

Le CP0 avait comparé trois leçons. Le CP1 a gelé un outcome qui exige que le
concept de chaque étape soit lisible **dans l'export seul**. Le CP3 a remesuré
sous cette exigence, et **le classement a changé** :

| | exercices **exclusifs** | écartés | formats | transferts |
|---|---|---|---|---|
| `api-production-contracts` | **2** *(le CP0 disait 4)* | **5** | 2 | 2 |
| `algorithmic-thinking` | **5** | 1 | **5** | 3 |
| `javascript-basics` | 4 | 0 | 4 | 1 |

`api-production-contracts` reste focal sur deux critères : **le plafond au
PRETEST est le seul risque qui invalide un pilote**, et la chaîne exercice →
transfert y est **directe** — `http-rate-limit-decide` puis
`throttling-everywhere` portent la **même notion** dans deux domaines, donc un
lecteur de l'export les relie sans deviner.

`algorithmic-thinking` est le **scope de repli**, gelé lui aussi.

---

## 9. Les concepts

Quatre, **chacun sur une étape différente** — c'est ce qui rend « 3 à 6
concepts » compatible avec une séance courte : **une seule leçon est lue.**

| `conceptId` | étape | lu | pratiqué | pourquoi il est là |
|---|---|---|---|---|
| `networking-http-tls` | `PRETEST_PREREQUISITE` | non | non | mesure le prérequis, rien d'autre |
| `api-production-contracts` | **`FOCAL`** | **oui** | **oui** | la seule leçon lue, pratiquée, rappelée |
| `authentication` | `TRANSFER_TARGET` | non | non | contexte d'arrivée de `throttling-everywhere` |
| `async-messaging-queues` | `TRANSFER_TARGET_SECOURS` | non | non | contexte d'arrivée du transfert de secours |

---

## 10. Les exercices

| exercice | rôle | d | tests | déclarants | règle |
|---|---|---|---|---|---|
| `http-rate-limit-decide` | **PRINCIPAL** | 3 | 4 | `api-production-contracts` **seule** | `R1` |
| `api-pagination-choice` | **SECOURS** | 2 | 4 | `api-production-contracts` **seule** | `R1` |

**Pourquoi un exercice de secours** : trois étapes du protocole n'existent que
si le participant **échoue d'abord**. Une réussite du premier coup les rend
inobservables — on passe alors au second exercice, et si celui-ci passe aussi,
les trois étapes sont notées `NOT_OBSERVED`, **jamais `FAILED`**, et la session
reste `COMPLETE`.

**Cinq écartés**, nommés, avec leur raison : `http-method-idempotent` (3
déclarants), `api-router` (4), `auth-status-decision` (2),
`http-idempotency-dedup` (2), `http-resilient-consumer` (2) — tous
`MULTI_CONCEPT_BY_DESIGN`.

---

## 11. Les mappings

**La règle du CP3** : un exercice n'entre dans le pilote que si le produit le
résout en **un seul** concept — donc s'il est déclaré par une seule leçon
(`R1`). Un exercice multi-déclarants n'est pas mal rangé : il est multi-concept
**par choix d'auteur** (`R2`). Mais sa trace ne dirait pas lequel a été
pratiqué.

**Aucune ambiguïté du corpus n'a été résolue.** 125 avant, 125 après.
`data/exercise-declarations.json` reste **vide** depuis V77 · CP8, et un test
rougit s'il cesse de l'être. Trancher l'un d'eux pour les besoins d'un pilote
serait **fabriquer une donnée pédagogique pour servir un protocole** —
l'inversion exacte que V77 a refusée. *Le pilote se restreint ; le corpus ne
bouge pas.*

---

## 12. Les règles de PRETEST

| règle | mesure | seuil | décision |
|---|---|---|---|
| `PRETEST_HIGH` | 2 amorces sur le concept focal, **avant lecture** | **2 sur 2** `recalled` | repli `V78-SCOPE-ALGO`. Si le repli plafonne aussi → **`INVALID`** (`N6`), **pas** `ABORTED` |
| `MISSING_PREREQUISITE` | 2 amorces sur le prérequis | **0 sur 2** `recalled` | **`INVALID`** (`N7`) |

**La limite, déclarée** : `RECORD_RECALL` **reçoit** l'issue de l'appelant. Le
PRETEST est donc un **auto-report**, et son niveau de preuve plafonne à
`DECLARED`. L'atténuation est une **procédure** — faire énoncer la réponse à
voix haute **avant** de révéler, et noter l'écart — et non un moteur de
correction.

---

## 13. `PRIMARY_OUTCOME` — un seul

> ### `SESSION_TRACE_RECONSTRUCTABILITY`

Une session est reconstructible si, à partir du **seul export**, une personne
qui n'a pas assisté à la session peut établir la liste **ordonnée** des étapes,
et pour chacune son concept, son moyen de constat, son niveau de preuve, son
résultat et son instant serveur — **sans aucune inférence**.

| | |
|---|---|
| unité | la **session**, pas le fait |
| échelle | **binaire** par session |
| juge | quelqu'un qui n'a pas assisté, muni de l'export et de la fixture |
| seuil de succès | **aucun**, délibérément |

**`WHY_THIS_ONE`** — c'est le **préalable de tous les autres** : rétention,
transfert, efficacité se lisent sur la trace, et si elle est incomplète toutes
les réponses sont fausses **et paraissent justes**. Il est jugeable avec
`n = 1`, parce qu'un défaut d'instrumentation est une propriété du système. Il
est falsifiable sans négociation. Et il ne récompense pas la quantité : un
système qui enregistre tout sans structure échoue exactement comme un système
qui n'enregistre rien.

**Aucun seuil n'a été fixé.** Un seuil posé avant toute idée de la distribution
ne sert qu'à permettre de déclarer victoire.

---

## 14. Les outcomes secondaires

Quatre, volontairement. Une liste longue de secondaires est une façon polie de
n'avoir pas choisi de primaire.

| # | outcome | rapporté comme |
|---|---|---|
| `S1` | `STEP_FACT_COVERAGE` | fraction + **liste nominative** des étapes muettes |
| `S2` | `DELAY_INTEGRITY` | fraction + délai réel de chaque session |
| `S3` | `CONFUSION_BY_CATEGORY` | tableau de décomptes, **jamais** un taux de satisfaction |
| `S4` | `UNASSISTED_COMPLETION` | fraction + description de chaque intervention |

**Aucun secondaire ne peut sauver un primaire raté.** C'est écrit pour rendre la
relecture arrangeante visible si elle a lieu.

---

## 15. Les exploratoires

Cinq, **séparés**, et chacun porte son interdiction de conclusion :

| # | | interdiction |
|---|---|---|
| `E1` | rappel immédiat vs différé | **interdit** d'en tirer une affirmation sur la mémorisation |
| `E2` | transfert vs exercice | **interdit** d'en tirer une affirmation sur la généralisation |
| `E3` | indice avant réussite | **interdit** d'en tirer une affirmation sur la dépendance |
| `E4` | durée par étape | **interdit** d'en tirer une affirmation sur la difficulté |
| `E5` | PRETEST vs après-leçon | **interdit** d'en tirer un gain d'apprentissage |

Un exploratoire promu en résultat après coup est la définition du *HARKing*.
Cette liste existe pour que la promotion soit **visible si elle est tentée**.

---

## 16. Les hypothèses

Sept, toutes falsifiables, toutes d'observabilité, chacune avec sa condition de
falsification écrite **avant** la moindre donnée.

| # | hypothèse | falsifiée si |
|---|---|---|
| `H1` | chaque étape laisse un fait du grain prévu | une étape traversée ne laisse rien, ou laisse un autre grain |
| `H2` | l'export suffit à reconstruire | la reconstruction exige une information absente de l'export |
| `H3` | le délai est vérifié côté serveur | une horloge client avancée suffit |
| `H4` | l'observation ne modifie pas l'observé | le participant instrumenté voit autre chose |
| `H5` | aucun fait ne dépasse son niveau autorisé | un `evidenceLevel` dépasse `min(source, kind)` |
| `H6` | les confusions sont catégorisables, et `INSTRUCTION_UNCLEAR` ≠ `CONCEPT_CONFUSION` | **plus d'un tiers** en `OTHER` |
| `H7` | les données sont exportables et supprimables intégralement | un fichier survit à une suppression demandée |

`H4` et `H7` sont les deux dont l'échec **arrête le pilote**.

---

## 17. Le délai

| | |
|---|---|
| cible | **24 heures** |
| fenêtre | `[18 h, 36 h]` |
| hors fenêtre | enregistré avec son délai réel, marqué `DELAY_OUT_OF_WINDOW`, **exclu de `S2`**, **conservé dans le primaire** |
| horloge | **serveur**, jamais le client |
| `PARTIAL` | au-delà de **72 h** sans rappel différé |

**Le chiffre n'est pas inventé** : `lib/retention.mjs` porte
`INTERVALS = [1, 3, 7, 16, 35, 75, 160]` jours. Le **premier intervalle du
produit est de 1 jour**. Le pilote observe la boucle telle que le produit la
planifie déjà.

La fenêtre `[18, 36]` laisse revenir « le lendemain » à toute heure plausible
sans se confondre avec le deuxième intervalle (3 jours = 72 h).

---

## 18. Les règles d'arrêt

**Quatre statuts de session** : `COMPLETE`, `PARTIAL`, `ABORTED`, `INVALID`.
Les deux derniers sortent du dénominateur, **jamais du rapport** — le décompte
et la raison de chaque session écartée sont publiés à côté du primaire.

**Arrêt d'une session** : la personne le demande *sans se justifier* · fatigue
ou gêne · défaut produit non contournable sans sortir du script en 10 min ·
perte de données · **le facilitateur s'aperçoit d'avoir aidé hors script**.

**Arrêt de tout le pilote** :

| # | déclencheur | pourquoi c'est un arrêt |
|---|---|---|
| `A1` | 2 des 3 premières sessions `ABORTED` pour défaut produit | continuer, c'est re-mesurer un défaut connu avec du temps humain |
| `A2` | `H4` falsifiée | toutes les sessions déjà conduites deviennent suspectes |
| `A3` | `H7` falsifiée | c'est un engagement envers une personne, pas une métrique |
| `A4` | donnée d'apprenant perdue ou exposée | idem |
| `A5` | version de protocole ≠ version gelée | on ne sait plus ce qu'on a mesuré |

`A2`, `A3`, `A4` **invalident rétroactivement** les sessions déjà conduites.
C'est coûteux, et c'est le prix de la déclaration préalable.

**Huit conditions de non-interprétabilité** `N1`–`N8`, dont `N1` (aide hors
script), `N5` (fichier de progression partagé) et `N8` (produit modifié en cours
de session).

---

## 19. Les règles de donnée manquante

> ## `ABSENT ≠ ÉCHEC`

| règle | |
|---|---|
| `M1` | une étape sans fait est **`NOT_OBSERVED`**, jamais `FAILED` — colonnes distinctes |
| `M2` | **aucune imputation** : pas de moyenne, pas de report, pas de défaut |
| `M3` | un rappel différé non effectué n'est **pas** un rappel raté → `PARTIAL` |
| `M4` | un champ absent n'est pas reconstruit par inférence ; il compte **contre** le primaire |
| `M5` | un rapport de confusion vide n'est pas « aucune confusion » |
| `M6` | un refus de répondre est `DECLINED`, distinct de `NOT_OBSERVED` |
| `M7` | aucune session n'est retirée **après avoir vu son résultat** |

---

## 20. La répétition à blanc

Onze étapes, produit réel, HTTP, **sans aucun humain**, progression hors dépôt.

```
11 étapes · 0 non conforme · 9 contrôles · 0 écart
reconstruction : 0 manque
SESSION_TRACE_RECONSTRUCTABILITY = OUI
```

L'échec de l'étape 3 **n'est pas fabriqué** : le code de départ de
`http-rate-limit-decide` porte un bug d'origine. L'aide de l'étape 4 **n'est pas
demandée** : la route du laboratoire la sert et l'enregistre d'elle-même.

**Le délai n'a pas été simulé.** Avancer une horloge mesurerait sa propre
simulation. C'est sa **propriété** qui est mesurée — trois noms de champ
d'horodatage client envoyés ensemble, **aucun effet** sur l'instant du fait. Le
délai rapporté est donc honnêtement `DELAY_OUT_OF_WINDOW`.

### 20.1 Quatre découvertes

**1. La première sonde était cassée, pas le produit.** Elle postait la commande
à plat, recevait `NO_COMMAND`, et concluait que le produit n'écrivait rien —
*mesurer son propre appareil*. Le client lève désormais dès qu'une commande est
refusée, au lieu de rapporter un silence.

**2. `RecallAttempt` promettait une provenance et ne l'écrivait pas.**
`event-model.mjs` la déclare depuis V74 ; le fait persisté n'en portait aucune.
**Corrigé, en mode `legacy`** — et c'est le point délicat : `normalizeAttempts`
**jette** ce que le normaliseur refuse, donc exiger la provenance aurait effacé
l'historique de rappel de chaque apprenant, **en silence**. C'est `H13` par la
porte de derrière.

**3. Un échec d'exercice ne porte aucun concept** (`RS2`). Décision V74
explicite, dont les conséquences n'avaient jamais été énoncées. **Déclarée, pas
corrigée.**

**4. Deux tentatives identiques dans la même seconde n'en font qu'une.** La clé
métier les confond avec un rejeu réseau. Inoffensif pour un humain, trompeur
pour un automate — la répétition à blanc s'y est prise.

---

## 21. L'instrumentation

**Effet d'observation mesuré, et nul.** Empreinte SHA-256 du fichier de
progression identique avant et après l'export, l'ouverture de la station de
rappel et la lecture de la leçon.

**L'identité de session vit dans l'ARCHIVE, pas dans les faits.**

| | estampiller les 9 faits | nommer l'archive |
|---|---|---|
| touche moteur, sérialisation, 4 listes blanches | **oui** | non |
| **modifie ce que l'instrumentation observe** | **oui** | **non** |
| suffit à reconstruire | oui | **oui** |
| distingue un fait hors fenêtre | oui | **non** |

La seconde a été retenue. `protocolVersion` et `scopeId` viennent de **la
fixture gelée**, jamais de l'environnement : un facilitateur ne doit pas pouvoir
déclarer un protocole qu'il n'a pas suivi. **Aucune donnée personnelle** n'entre
dans l'identité, et un test le vérifie.

**La limite se paie et se dit** : les faits n'étant pas estampillés, un fait
produit hors fenêtre est indiscernable d'un fait produit pendant. La parade est
`N5` — un fichier neuf par participant.

---

## 22. La procédure participant

`docs/v77-1/V78-PARTICIPANT-PROCEDURE.md`. Deux pages.

> « On teste un logiciel, pas toi. » · « Rater un exercice est utile. Rater puis
> réessayer l'est encore plus. » · « Personne ne verra une note. Il n'y en a
> pas. » · « Tu peux t'arrêter quand tu veux, sans te justifier. »

Elle dit ce qui est enregistré, ce qui ne l'est pas, où c'est stocké, comment
tout emporter et comment tout effacer — **ton code compris**, ce qui est vrai
depuis le CP2 et ne l'était pas avant. Elle **n'explique pas les hypothèses**
au point de biaiser le comportement : elle dit qu'on observe la trace, pas ce
qu'on espère y trouver.

---

## 23. La procédure facilitateur

`docs/v77-1/V78-FACILITATOR-SCRIPT.md`, et `V78-PILOT-CHECKLIST.md` pour la
conduite.

Il s'ouvre sur la règle qui prime :

> **Une explication hors script rend la session `INVALID`.** Pas « moins
> bonne » : **inutilisable**.

Il contient les **quatre questions de PRETEST rédigées mot pour mot**, le
tableau de ce qui est autorisé et interdit, le **chemin de repli de `RS1`** avec
la requête exacte, les trois cas de l'exercice, et **cinq phrases qu'il ne faut
jamais dire** — dont *« Ce n'est pas grave, tout le monde se trompe
là-dessus »*, qui est un indice déguisé.

### 23.1 Le point le plus fragile du protocole, et il tient sur papier

**Rien, dans un fait de rappel, ne dit à quelle étape il appartient.** Un
`PRETEST` et un `IMMEDIATE_RETRIEVAL` produisent le même genre de fait, sur le
même concept, avec le même `sourceRef`. La reconstruction ne les distingue que
par leur **ordre** et par le **nombre attendu**, déclaré d'avance dans la
fixture. **Une amorce de trop décale tout, et rien ne le signale.**

La parade est un compteur, sur papier, dans la liste de contrôle. Écrire un
étiquetage d'étape dans les faits aurait modifié précisément ce que
l'instrumentation observe.

---

## 24. La taxonomie de confusion

Sept catégories, décidées **avant** le pilote, exécutables
(`lib/confusion-taxonomy.mjs`) :

`INSTRUCTION_UNCLEAR` · `UI_CONFUSION` · `CONCEPT_CONFUSION` ·
`TOOL_CONFUSION` · `BUG` · `FATIGUE` · `OTHER`

**La distinction qui porte tout** : `INSTRUCTION_UNCLEAR` dit qu'un **énoncé est
mauvais** ; `CONCEPT_CONFUSION` qu'un **apprentissage n'a pas eu lieu**.

Trois décisions imposées par le code :

- **`OTHER` sans verbatim est refusé.** Un décompte sans contenu ne sert à rien.
  `OTHER` existe pour corriger la taxonomie, pas pour la sauver.
- **Le décompte porte les sept catégories, y compris à zéro.**
- **Zéro rapport donne `NOT_OBSERVED`, pas `H6_TIENT`.** Une hypothèse qu'on n'a
  pas pu éprouver n'est pas une hypothèse vérifiée.

**Aucune psychométrie maison** n'a été construite.

---

## 25. Les tests négatifs

> ```
> 65 mutations jouées · 65 vues échouer · 0 survivante
> 15 familles
> ```

Chaque mutation parcourt le cycle complet :

```
1. VERT AVANT    le juge passe sur le fichier intact
2. ROUGE MUTÉ    le juge échoue sur le fichier muté
3. RESTAURÉ      le fichier retrouve son contenu, octet pour octet (SHA-256)
4. VERT APRÈS    le juge repasse
```

**Sans l'étape 1**, une mutation « vue » pourrait l'être parce que le juge était
**déjà rouge** — on mesurerait une panne, pas une garde. **Sans l'étape 4**, un
harnais qui abîme le dépôt en sortirait sans le dire. Une mutation dont le motif
a disparu est **refusée**, jamais appliquée à vide.

| famille | ce qui serait devenu faux |
|---|---|
| suppression mensongère · suppression partielle | « tout est effacé » alors qu'il reste quelque chose |
| export incomplet | « toutes tes données » redevient faux |
| scope ambigu | un exercice multi-concept revient dans le pilote |
| reconstruction indulgente | la trace est déclarée complète sans l'être |
| outcome primaire altéré · délai altéré | une décision gelée change **après coup** |
| horloge client | `H12` tombe |
| étape du protocole perdue | une étape disparaît sans bruit |
| fait dupliqué | un même fait sert deux fois |
| provenance perdue · identité mélangée | on ne sait plus **qui** a constaté |
| taxonomie effondrée | les confusions cessent d'être distinguables |
| documents amputés | le facilitateur perd une règle d'arrêt |
| tiers introduit | un service externe, ou une écriture depuis l'observateur |

### 25.1 Neuf mutations ont survécu au premier passage

Neuf **vrais trous, dans mes propres tests** :

| # | le trou |
|---|---|
| `X02` | un test bouclait sur `REPERTOIRES_DU_PRODUIT` : **vider la liste le rendait vert avec zéro assertion** — `M01` de V77 · CP14, revenu sous une autre forme. Corrigé en **pinnant les entrées en clair** |
| `X08` | `ok: true` écrit en dur survivait : **aucun test ne reliait le verdict à ce que le disque montrait**. Le verdict est désormais une fonction pure, testée séparément |
| `X10` | l'assertion cherchait le texte `confirmation !== …` ; `if (false && confirmation !== …)` le contient encore. Ancrée sur la **ligne entière** |
| `X16` | `snapshotProgress()` **commenté** satisfaisait `/snapshotProgress\(\)/`. Ancrée sur un appel non commenté |
| `X17`–`X20` | les tests de scope ne vérifiaient que le **cas sain** : un vérificateur qui ne trouve jamais rien ressemble exactement à un scope parfait. **Huit cas négatifs** ajoutés |
| `X45` | `/exactement 2/` restait vrai après suppression d'**une** des deux occurrences. **Comptées** |

> Un test qui dérive ses attentes de la chose qu'il teste ne teste rien. Un
> vérificateur qu'on n'éprouve que sur le cas sain ne vérifie rien.

---

## 26. Les portes

| | |
|---|---|
| `npm test` | **2293 / 2293** |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **50 portes, 0 violation** |
| `v74` · `v75` · `v76` · `v77` | ✅ ✅ ✅ ✅ |
| `bash scripts/v66-negative.sh` | **22 règles vues échouer, 0 trou** |
| `bash scripts/v76-negative.sh` | **11 règles vues échouer, 0 trou** |
| `npm run v77-1:mutations` | **65 / 65 vues, 0 survivante** |
| `data/progress.json` | **absent** |
| curriculum, exercices, corpus | **intacts** (`git diff` vide) |

**Aucune 51ᵉ porte n'a été créée.** Les invariants de V77.1 vivent dans
`npm test` — lui-même dans le gantelet — et dans un harnais de mutations
exécutable. Ajouter une porte qui relancerait les mêmes tests aurait été du
décor.

**`v73:check` n'a pas été lancé, et n'a pas été inventé.** Il n'existe aucun
script npm le contenant ; le répertoire `scripts/v73/` contient les mesures du
sprint V73, pas une porte.

`v66:check` a été **mis à jour** au CP4 : sa règle `[R1]` pinnait la liste exacte
des champs d'une tentative de rappel. La liste reste **exhaustive**, augmentée de
`provenance`, **plus une vérification de plus** — *une tentative nomme qui l'a
constatée*. Les 22 règles négatives de V66 restent vues échouer.

---

## 27. Limites et risques ouverts

### 27.1 Les deux réserves qui retiennent le verdict

**`RS1` — le pilote n'observera pas la station de rappel.** Elle existe, elle
est honnête, et elle est vide pour un participant neuf. Les rappels passent par
le facilitateur. La trace est la même ; **l'expérience ne l'est pas.**

**`RS2` — un échec d'exercice ne porte aucun concept.** Le lien vient de la
fixture. Sans elle, l'information la plus utile à un moteur de rétention est
illisible.

### 27.2 Ce qui reste fragile

- **Une amorce de rappel en trop décale la reconstruction**, sans que rien ne le
  signale. Parade : un compteur sur papier.
- **Les faits ne sont pas estampillés par session.** Parade : `N5`.
- **Le PRETEST est un auto-report** (`DECLARED`). Parade : énoncer avant de
  révéler.
- **L'étape `LESSON` ne laisse aucun fait.** La reconstruction ne prouvera
  jamais que la leçon a été lue.
- **Le script du facilitateur n'a jamais été lu à voix haute.** La première fois
  sera la première session.
- **65 mensonges vus sont 65 mensonges auxquels j'ai pensé.** Une mutation qu'on
  n'écrit pas ne survit pas : elle n'existe pas, et son absence n'est pas une
  preuve d'absence de trou.

### 27.3 Ce qui reste non mesuré, et le restera

**Si le produit fait apprendre.** V77.1 n'a observé aucun humain. Il a préparé
l'observation ; il n'a rien appris sur l'apprentissage. `O1` reste non atteint,
`O18` désormais atteint via le CP2, et **125 exercices sur 376 n'ont toujours
pas de concept**.

---

## 28. Comment démarrer V78, exactement

```bash
# 1 — partir de l'état gelé
git fetch --prune
git checkout claude/ai-career-os-saas-phfg49
git status --short --branch          # attendu : arbre propre, local == origin

# 2 — vérifier que le gel tient encore
npm test                             # attendu : 2293 / 2293
npx tsc --noEmit                     # attendu : 0
npx next build                       # attendu : OK
npm run gates:active                 # attendu : 50 portes, 0 violation
npm run v77-1:mutations              # attendu : 65 / 65 vues, 0 survivante

# 3 — construire le produit qui sera montré, UNE fois, et ne plus y toucher
npx next build
git rev-parse HEAD                   # ← noter ce commit dans la liste de contrôle

# 4 — par participant : un fichier de progression NEUF, hors du dépôt
export AICOS_PROGRESS_FILE=/chemin/hors/depot/<participant>.json
export AICOS_PILOT_SESSION_ID=V78-S01          # non personnel
test -f "$AICOS_PROGRESS_FILE" && echo "REFUSER : fichier déjà utilisé (N5)"

# 5 — démarrer et vérifier
npx next start -p 3000
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/api/progress   # 200

# 6 — conduire la séance
#     docs/v77-1/V78-FACILITATOR-SCRIPT.md, script en main
#     docs/v77-1/V78-PILOT-CHECKLIST.md, une copie imprimée par participant
#     docs/v77-1/V78-PARTICIPANT-PROCEDURE.md, remise et lue à l'accueil
#     AUCUN commit, AUCUN déploiement entre le début et la fin (N8)

# 7 — à la fin : archive, puis suppression si elle est demandée
curl -s http://127.0.0.1:3000/api/progress/export-all -o /hors/depot/<session>.json
#     puis /settings → « Supprimer toutes mes données », saisir SUPPRIMER,
#     et ré-exporter DEVANT la personne pour montrer que c'est vide

# 8 — reconstruire, hors du dépôt, sans avoir assisté à la séance
node -e "
  const { reconstruireLaSession } = await import('./lib/session-trace.mjs');
  const a = JSON.parse(require('fs').readFileSync('/hors/depot/<session>.json','utf8'));
  const f = JSON.parse(require('fs').readFileSync('data/pilot/v78-pilot-1.json','utf8'));
  const r = reconstruireLaSession(a, f);
  console.log(r.reconstructible ? 'RECONSTRUCTIBLE' : 'NON RECONSTRUCTIBLE');
  for (const m of r.manques) console.log(' ·', m.genre, m.etape, m.quoi);
"
```

### 28.1 Les quatre choses à ne PAS faire en V78

1. **Ne pas modifier le protocole après avoir vu un résultat.** Un changement
   exige un `protocolVersion` neuf, et invalide les sessions déjà conduites.
2. **Ne pas promouvoir un exploratoire en résultat.** `E1`–`E5` portent chacun
   leur interdiction.
3. **Ne pas construire d'infrastructure.** Si quelque chose manque, le noter et
   le conduire quand même : **une session imparfaite mesurée vaut mieux qu'un
   sprint de plus avant le premier humain.**
4. **Ne pas écrire « le système mesure l'apprentissage ».** Il ne le mesure pas.

### 28.2 La seule phrase que V78 pourra écrire, au mieux

> « Sur *k* sessions, *j* étaient intégralement reconstructibles à partir du
> seul export. Voici, nommément, ce qui manquait dans les *k − j* autres. »
