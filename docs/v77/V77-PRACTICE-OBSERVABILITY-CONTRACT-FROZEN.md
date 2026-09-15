# V77 · CP1 — CONTRAT D'OBSERVABILITÉ DE LA PRATIQUE · **GELÉ**

> **Gelé le CP1, avant toute modification du produit.** Ce document décide
> ce qui mérite d'être observé, sous quel nom, et avec quel niveau de confiance.
> Il est écrit **avant** de savoir si ce sera facile — c'est la seule manière
> qu'un critère ait une valeur.
>
> Fondé sur les mesures du CP0 (`docs/v77/V77-CP0-PRACTICE-COVERAGE-FORENSICS.md`),
> jamais sur les hypothèses du brief, dont le CP0 a réfuté deux.

---

## 0. La règle qui commande toutes les autres

> **Un fait n'est pas un badge de couverture.**
>
> Le produit n'écrit rien parce qu'une surface existe. Il écrit parce qu'une
> question pédagogique précise a besoin de la réponse, et parce que le produit
> peut réellement l'observer.

Corollaire, gelé : **atteindre « 12/12 surfaces émettent un événement » est un
échec de ce sprint, pas un succès.** Le résultat correct est que chaque surface
porte une politique explicite et justifiée — y compris `NO_FACT`.

---

## 1. Vocabulaire gelé

Quinze termes. Aucun autre ne sera introduit sans revenir ici.

### 1.1 `ACTIVITY`

Ce qu'un apprenant FAIT sur une surface. Une activité n'est pas une visite : il
faut une production, une exécution, une soumission ou une décision structurée.

### 1.2 `ATTEMPT`

Un **fait daté et non révisable** : l'apprenant a tenté quelque chose, et le
produit a observé l'issue. Un `ATTEMPT` existe **qu'il réussisse ou non**, et
deux tentatives successives sont deux faits.

> *C'est la leçon de V74 · CP0, et le CP0 de V77 a trouvé la même faute intacte
> sur les assessments : le produit conservait la projection et jetait le fait.*

### 1.3 `SUBMISSION`

L'acte de remettre un travail. Une soumission **n'est pas** un verdict : elle
peut être observée sans être validée.

### 1.4 `ARTIFACT`

Une production de l'apprenant que le produit reçoit : un manifeste, une
topologie, une architecture, un scénario, un document. Distingué de la
`SUBMISSION` qui est l'acte, et du verdict qui n'existe peut-être pas.

### 1.5 `ASSESSMENT`

Un ensemble de réponses corrigé **contre un corrigé déclaré d'avance**, avec un
seuil déclaré d'avance. C'est ce que sont, dans ce produit, les 16 diagnostics
**et les 13 capstones** (§4.4).

### 1.6 `VALIDATION`

L'application d'un **critère objectif, déclaré avant la tentative**. Trois
choses ne sont pas des validations :

- vérifier une **forme** (sections, longueur, mentions) ;
- recevoir une **déclaration** de l'apprenant ;
- produire une **analyse descriptive** (des diagnostics par sévérité).

### 1.7 `EVIDENCE`

Une **projection** durable attestant qu'une compétence a été démontrée. Dérivée
d'un ou plusieurs faits. Une `EVIDENCE` porte désormais **obligatoirement** un
niveau (§2).

### 1.8 `EVIDENCE_LEVEL` — `DECLARED` / `OBSERVED` / `VALIDATED`

Voir §2. **C'est l'apport central de V77.**

### 1.9 `EXTERNAL_EVIDENCE`

Une preuve portant sur un travail réalisé **hors du produit** (GitHub, cloud
réel, IDE externe). Le produit peut l'enregistrer ; il ne peut pas la valider.
Niveau maximal atteignable : **`DECLARED`**.

### 1.10 `PROJECT_MILESTONE`

Un jalon d'un travail long. Réservé ; **aucune surface n'en produit en V77**
(§4.10). Le terme est gelé pour empêcher qu'on le réinvente sous un autre nom.

### 1.11 `SIMULATED_ACTIVITY`

Une activité dont l'environnement est **fabriqué et déterministe** : traces
d'agent simulées, incident K8s rejoué, cloud sans cloud. Le CP0 a mesuré que le
produit le déclare honnêtement en prose (13/13 capstones), mais que **la marque
ne traverse pas jusqu'à la preuve**.

### 1.12 `USAGE_EVENT`

L'observation qu'une fonctionnalité a été **utilisée**, sans aucun verdict
pédagogique. Exemple : « une tâche de terminal a été exécutée, adaptateur
`local`, code de sortie 0 ».

**Contraintes gelées** (§3.4) : un `USAGE_EVENT` ne produit **jamais** d'Evidence,
n'alimente **jamais** compétence, rétention ni récupération, et vit dans un champ
séparé de l'état.

### 1.13 `NO_FACT`

La politique par défaut. Une surface `NO_FACT` n'écrit rien dans l'état de
l'apprenant. **C'est une décision positive, pas un oubli**, et elle exige une
justification écrite au même titre qu'un fait.

### 1.14 `DERIVED_ADVANCEMENT`

Un état qui progresse **à cause d'un fait produit ailleurs** — par exemple un
livrable de mission validé parce qu'un exercice a été résolu. Voir §6 : c'est le
mécanisme du double comptage mesuré au CP0.

### 1.15 `OBSERVATION_CAPABILITY`

Ce que le produit est **techniquement capable** de constater sur une surface.
Distincte de ce qu'il **décide** d'en garder. Le CP0 a montré que les deux
divergent sur six surfaces.

---

## 2. Les trois niveaux de preuve — **gelés**

| niveau | ce qu'il affirme | ce qui le justifie |
|---|---|---|
| `DECLARED` | *l'apprenant dit avoir fait* | une déclaration, une auto-évaluation, un travail externe |
| `OBSERVED` | *le produit a vu l'action ou l'artefact* | une exécution réelle, une analyse structurelle, une conformité de forme |
| `VALIDATED` | *le produit a appliqué un critère objectif déclaré d'avance* | des tests, un corrigé, un seuil |

### 2.1 Les trois inégalités qui ne se négocient pas

```
DECLARED        ≠  PASSED
OBSERVED        ≠  VALIDATED
STRUCTURE_VALID ≠  PEDAGOGICALLY_CORRECT
```

La troisième est celle que le CP0 a mesurée : un document décrivant une
conception délibérément mauvaise obtient `structure ok: true`.

### 2.2 Ce qu'un niveau autorise

| | compte pour la **compétence** | compte pour la **rétention** | compte pour la **récupération** |
|---|---|---|---|
| `VALIDATED` | **oui** | oui | selon les règles V74/V75 existantes |
| `OBSERVED` | **non** | **non** | **non** |
| `DECLARED` | **non** | **non** | **non** |

**Justification de la sévérité** : la projection de compétence promeut à
`reinforced` sur « deux sources distinctes ». Laisser `OBSERVED` y entrer
rouvrirait exactement le défaut que le CP0 a mesuré. Un niveau plus faible peut
être **affiché** (l'apprenant voit son travail), il ne **pèse** pas.

### 2.3 Règle de non-surclassement

> **Aucun chemin ne doit permettre à une preuve de monter de niveau après coup.**

Ni par migration, ni par recalcul, ni par ajout d'un genre de validation au
vocabulaire. Le CP6 devra corriger `capstone-grade` (§4.4) : ce n'est pas un
surclassement, c'est la **réparation d'un accident de vocabulaire**, et le
contrat exige que la différence soit démontrée, pas affirmée.

---

## 3. Règles de conception d'un fait

### 3.1 Champs obligatoires

Tout nouveau fait porte :

| champ | règle |
|---|---|
| clé métier | déterministe, rejouable ; deux rejeux = un fait |
| `schemaVersion` | entier, présent dès la première version |
| `at` | **horloge SERVEUR**, jamais celle du client |
| `provenance.producer` | obligatoire ; un fait sans producteur est **refusé**, jamais réparé |
| `sourceRef` | ce sur quoi porte le fait (identifiant de l'activité) |
| `conceptIds` | **si connus** ; liste vide sinon — jamais inventés |
| `competencyIds` | **si connues** ; liste vide sinon |
| `outcome` | seulement si observable |
| `evidenceLevel` | le niveau que ce fait peut soutenir au maximum |
| `simulation` | **booléen structurel** si l'activité est simulée |
| `derivedFrom` | si le fait découle d'un autre (§6) |

### 3.2 Immuabilité

Un fait ne se modifie pas. Une correction produit un nouveau fait.

### 3.3 Le doute joue contre le crédit

En l'absence d'information, on choisit **le niveau le plus bas** et **l'issue la
moins favorable**. Règle héritée de `correctionSeen` (V74) et de
`declenchee` (V76), reconduite ici sans exception.

### 3.4 Contraintes propres à `USAGE_EVENT`

1. vit dans un champ **séparé** de l'état (`usageEvents`), jamais mêlé aux
   tentatives ;
2. ne produit **aucune** `EVIDENCE` ;
3. n'entre dans **aucun** moteur (compétence, rétention, récupération) ;
4. est **borné** et **exportable/supprimable** comme le reste (§8) ;
5. ne porte **jamais** de champ `passed`, `success` ou `score`.

> Sans ces cinq contraintes, un `USAGE_EVENT` deviendrait de la télémétrie
> déguisée en pédagogie. Avec elles, il répond à la seule question légitime :
> *« le participant a-t-il utilisé cette surface ? »*

---

## 4. Politique par surface — **gelée**

Douze surfaces de pratique + les surfaces de lecture. Chaque ligne porte sa
justification.

### 4.1 `lab` — 376 exercices · `FACT_REQUIRED` · `VALIDATED`

Existe déjà (`ExerciseAttempt`). Des tests exécutés en bac à sable sont un
critère objectif déclaré d'avance. **Aucune modification prévue.**

### 4.2 `transfer` — 25 défis · `FACT_REQUIRED` · `VALIDATED`

Existe déjà (`TransferAttempt`). Corrigé côté serveur contre un corrigé, seuil
préexistant. **Aucune modification prévue.**

### 4.3 `assessments` — 16 diagnostics · `FACT_REQUIRED` (**nouveau**) · `VALIDATED`

**Décision : un `AssessmentAttempt` est nécessaire.**

La justification est sémantique, pas de commodité. Le CP0 a mesuré qu'un
assessment échoué cinq fois n'écrit **qu'une trace** : la clé de déduplication
des preuves fusionne les échecs identiques. Or :

- **plusieurs tentatives humaines ont réellement lieu** — c'est un fait du
  monde, pas une vue ;
- la **courbe** (échec, échec, échec, réussite) est exactement ce qu'un pilote
  humain doit pouvoir lire ;
- le produit traite déjà ainsi les exercices et les transferts : ne pas le faire
  ici est une **incohérence**, pas un choix.

`EVIDENCE` reste dédupliquée et projetée : le fait et la projection ont des
règles différentes, et c'est voulu.

### 4.4 `capstones` — 13 capstones · `FACT_REQUIRED` · `VALIDATED` + `simulation: true`

**Décision : un capstone est un `ASSESSMENT` au sens du §1.5**, et le même type
de fait le couvre (`AssessmentAttempt`, champ `kind: 'capstone'`).

Ce n'est pas une commodité : la mesure du CP0 montre que les 13 capstones sont
des **questionnaires multi-phases corrigés contre un corrigé déclaré**, avec un
`passThreshold`. La différence avec un diagnostic est **pédagogique** (un
scénario d'incident, 7 phases), pas **observationnelle**. Le champ `kind` la
conserve ; le champ `simulation` conserve l'autre.

> **La sémantique des trois genres, gelée avant correction** (`CP1.G`) :
>
> | genre | ce qu'il signifie | niveau |
> |---|---|---|
> | `capstone-grade` | le serveur a corrigé contre un corrigé déclaré, seuil déclaré | `VALIDATED` |
> | `capstone-review` | **héritage** : preuves d'avant V65.1, reconstruites par migration, sans corrigé rejouable | `OBSERVED` |
> | `self` | déclaration sans critère | `DECLARED` |
>
> `capstone-grade` doit donc rejoindre le vocabulaire — non pas pour « ranger »
> une valeur orpheline, mais parce qu'il décrit une validation réelle que le
> produit effectue et que le repli sur `self` efface. **Les preuves historiques
> `capstone-review` ne sont PAS remontées** : on ne peut pas rejouer leur
> correction, donc on ne peut pas affirmer qu'elle a eu lieu.

### 4.5 `missions` — 42 missions · `FACT_REQUIRED` · **`OBSERVED`, jamais `VALIDATED`**

**C'est la décision la plus importante de ce contrat.**

Le CP0 a mesuré que les 42 missions se terminent par un livrable **auto-évalué
que l'apprenant valide lui-même**, et que le produit écrit alors
`validation.status: 'passed'` — une preuve **qualifiante**.

> **INTERDIT, gelé :**
> ```
> STRUCTURE_VALID + SELF_CONFIRMATION  →  VALIDATED
> STRUCTURE_VALID + SELF_CONFIRMATION  →  passed qualifiant
> ```

Ce qu'une mission **peut** honnêtement produire :

| composant | ce que le produit sait | niveau |
|---|---|---|
| livrable `auto` (exercice résolu) | les tests ont été exécutés | `VALIDATED` — **mais voir §6** |
| livrable `structural` | la forme est conforme | `OBSERVED` |
| livrable `review` | l'apprenant l'affirme | `DECLARED` |
| **la mission entière** | **le plus faible des trois** | **`OBSERVED`** |

**Règle du maillon faible, gelée** : le niveau d'une preuve composite est celui
de **sa composante la plus faible**, jamais la plus forte, jamais une moyenne.

Une mission terminée reste **un accomplissement affiché** — l'apprenant voit son
travail, l'état d'avancement demeure. Elle cesse simplement de **peser** comme
une compétence démontrée.

### 4.6 `kubernetes` · `cloud-lab` · `cloud-foundations` · `security` — `FACT_REQUIRED` · `OBSERVED` · `simulation: true`

**Quatre surfaces, UN seul type de fait** (`CP1.H` l'exige : ne pas créer six
événements si un modèle commun suffit).

Ce qu'elles ont en commun, et qui justifie l'unification : **l'apprenant remet un
artefact qu'il a produit** (`manifest`, `topology`, `architecture`, `scenario`),
et le produit le **valide structurellement puis l'analyse**, rendant des
diagnostics par sévérité.

**Ce qu'elles ne font pas** : rendre un verdict. Un manifeste sans diagnostic
n'est pas « juste » — il est seulement sans défaut *connu de cet analyseur*.

> **Gelé : un compte de diagnostics n'est pas un verdict.**
> `0 diagnostic` ne devient jamais `passed`. Le fait porte la répartition par
> sévérité, et rien de plus.

### 4.7 `pipelines` — 3 pipelines · **`NO_FACT`** (ou `USAGE_EVENT`)

**Le brief supposait l'inverse, et la mesure le contredit.**

Le brief écrit : *« un pipeline possède déjà success/failed/blocked : ne pas
jeter cette information »*. Le verdict est en effet objectif — mais **il ne porte
pas sur un travail de l'apprenant**.

Mesuré au CP0 : la route accepte `{ action, event: { kind, branch, tag }, approved }`.
**Aucun pipeline candidat.** L'apprenant ne rédige rien : il choisit un
déclencheur et une approbation, puis observe le comportement d'un pipeline
**fourni par le produit**.

Conséquence : deux apprenants choisissant `push` sur `main` obtiennent un
résultat **identique**. Le statut mesure la fixture, pas la personne.

C'est exactement le raisonnement du terminal (§4.8), appliqué à une surface que
le brief croyait différente. Le CP7 pourra retenir un `USAGE_EVENT` ; il ne
retiendra **jamais** un `PipelineAttempt(success)`.

### 4.8 `terminal` — 3 tâches · **`NO_FACT`** (ou `USAGE_EVENT`)

Les trois tâches n'ont **aucun critère de réussite pédagogique**, leurs
arguments sont des **énumérations fermées**, et leur propre description dit
« démonstration d'exécution bornée ».

> **Gelé : `NE PAS créer TerminalAttempt(success = true)`.** Un apprenant qui
> choisit `-la` dans une liste de trois options valides n'a rien démontré.

Le CP3 tranchera entre `NO_FACT` strict et `USAGE_EVENT`, sous les cinq
contraintes du §3.4.

### 4.9 `resources` / playbooks — 45 documents · **`NO_FACT`**

Contenu de référence. Aucune action, aucune soumission. **Lire n'est pas
pratiquer** — et le produit n'a aucun moyen de savoir si quelque chose a été lu.

### 4.10 Les surfaces de lecture — **`NO_FACT`**

`lessons`, `calendar`, `glossary`, `retention`, `parcours`, `skills`, `history`,
`notes`, `revisions`, `reviews`, `synthese`, `projects`, `career`, `guide`,
`diagnostics`, `doc`, `month`, `week`, `day`, `settings`, `lab` (catalogue),
`missions` (catalogue), `capstones` (catalogue), `transfer` (catalogue),
`cloud-lab`/`kubernetes`/`security`/`pipelines`/`cloud-foundations` (catalogues).

> **Gelé : une page visitée n'est jamais une activité.** Le CP0 a vérifié que
> c'est déjà le cas (six pages ouvertes, aucune trace) ; la porte du CP14 devra
> l'empêcher de changer.

### 4.11 `EXTERNAL_EVIDENCE` — 7 tâches externes · `DECLARED` **au maximum**

`data/external-tasks.json` décrit 7 tâches explicitement
`EXTERNAL_ENVIRONMENT_REQUIRED` (Docker durci, cloud réel…). Le produit peut
enregistrer que l'apprenant **déclare** les avoir faites, avec la preuve qu'il
colle.

> **Gelé : aucune vérification automatique d'une preuve externe.** `DECLARED`
> est le plafond, et il n'existe aucun chemin vers `OBSERVED` ou `VALIDATED`.

**V77 n'implémente pas cette surface** (aucune route n'existe aujourd'hui) : le
niveau est gelé pour que personne ne la construise plus tard en la surclassant.

### 4.12 Tableau récapitulatif

| surface | activité | politique | fait | niveau max | simulation |
|---|---|---|---|---|---|
| `lab` | exécutable | `FACT_REQUIRED` | `ExerciseAttempt` *(existe)* | `VALIDATED` | non |
| `transfer` | assessment | `FACT_REQUIRED` | `TransferAttempt` *(existe)* | `VALIDATED` | non |
| `assessments` | assessment | `FACT_REQUIRED` | **`AssessmentAttempt`** | `VALIDATED` | non |
| `capstones` | assessment simulé | `FACT_REQUIRED` | **`AssessmentAttempt`** (`kind: capstone`) | `VALIDATED` | **oui** |
| `missions` | soumission + auto-revue | `FACT_REQUIRED` | *(à décider CP5)* | **`OBSERVED`** | non |
| `kubernetes` | artefact analysé | `FACT_REQUIRED` | **`ArtifactAnalysis`** | `OBSERVED` | **oui** |
| `cloud-lab` | artefact analysé | `FACT_REQUIRED` | **`ArtifactAnalysis`** | `OBSERVED` | **oui** |
| `cloud-foundations` | artefact analysé | `FACT_REQUIRED` | **`ArtifactAnalysis`** | `OBSERVED` | **oui** |
| `security` | artefact analysé | `FACT_REQUIRED` | **`ArtifactAnalysis`** | `OBSERVED` | **oui** |
| `pipelines` | exploration simulée | **`NO_FACT`** / `USAGE_EVENT` | — | — | oui |
| `terminal` | démonstration bornée | **`NO_FACT`** / `USAGE_EVENT` | — | — | non |
| `resources` | contenu | **`NO_FACT`** | — | — | — |
| lecture (×25) | lecture | **`NO_FACT`** | — | — | — |
| tâches externes | travail hors produit | *(non implémenté)* | — | `DECLARED` | non |

**Deux types de faits nouveaux pour six surfaces.** Pas six.

---

## 5. La simulation

### 5.1 Marqueur structurel obligatoire

> **Gelé : toute activité simulée porte `simulation: true` dans le FAIT et dans
> l'EVIDENCE, comme un champ booléen.**

Le CP0 a mesuré que le produit déclare honnêtement ses simulations — mais **en
prose**, dans `detail`. Un texte libre ne se vérifie pas, ne se filtre pas, et
disparaît au premier reformatage.

### 5.2 Ce qu'un marqueur de simulation interdit

Une activité simulée ne peut **jamais** être présentée comme :

- une expérience professionnelle réelle ;
- une opération sur une infrastructure réelle ;
- une preuve d'emploi ou d'employabilité.

Un Kubernetes simulé ne devient jamais « Kubernetes production verified ».

### 5.3 Le marqueur ne dégrade pas

`simulation: true` **n'abaisse pas** le niveau de preuve. Un capstone corrigé
déterministiquement est `VALIDATED` **et** simulé : les deux affirmations sont
vraies et indépendantes.

---

## 6. Double comptage inter-surfaces — la règle

### 6.1 Le principe gelé

> **Une seule production humaine ne peut pas devenir deux sources qualifiantes
> indépendantes par simple propagation entre surfaces.**

### 6.2 Ce que le CP0 a mesuré

`reconcileAutoDeliverables` valide un livrable de mission dès qu'un exercice
référencé est résolu. La mission produit ensuite sa propre preuve qualifiante.
Résultat mesuré : `exercise:react-search [jsts]` **et**
`mission:frontend-accessible-search [jsts]` — deux sources, une seule production.

### 6.3 Les trois obligations

1. **La provenance survit.** Un avancement dérivé porte `derivedFrom` désignant
   le fait d'origine. Sans ce champ, le lien est perdu et le double comptage
   redevient invisible.
2. **Un `DERIVED_ADVANCEMENT` peut produire un ÉTAT, pas nécessairement une
   preuve qualifiante.** Une mission peut légitimement se dire « avancée » sans
   recréditer la compétence que l'exercice a déjà créditée.
3. **La projection de compétence compte les PRODUCTIONS, pas les sources.** Deux
   preuves dont l'une dérive de l'autre comptent pour **une** source distincte.

### 6.4 Le nombre exact reste à mesurer

Le CP0 a compté **14** livrables `auto` dont l'exercice partage une compétence
**déclarée** avec sa mission. Ce chiffre est **insuffisant** : la
canonicalisation (`react` → `jsts`) en change probablement la valeur.

> **Gelé : le chiffre publié au CP15 sera celui du CP10, mesuré sur les
> compétences CANONIQUES.** Le 14 du CP0 ne doit pas être recopié.

---

## 7. Les concepts et les compétences

### 7.1 On n'invente jamais un rattachement

Règle héritée de V75 · CP4, reconduite : quand aucune source ne tranche, la
liste des concepts revient **vide**. Une preuve sans concept reste valide.

### 7.2 Les 125 ambiguïtés

Le CP0 a établi que la cause est **l'absence de déclaration dans la source** :
un exercice ne porte ni `conceptIds` ni `lessonRefs`.

> **Gelé pour le CP8 :**
>
> 1. **125 → 0 n'est pas un objectif.** `AMBIGUOUS` est une réponse valide.
> 2. Aucune **heuristique supplémentaire** n'est autorisée. Seule une
>    **déclaration explicite adossée à une source pédagogique réelle** résout
>    une ambiguïté.
> 3. Le corpus `data/exercises/` est **gelé** (empreinte `92d5fae6`) : toute
>    déclaration vit dans un fichier **séparé**.
> 4. Chaque résolution porte `source` et `reason` vérifiables.

---

## 8. Vie privée — gelé avant V78

1. **Local uniquement.** Aucune donnée ne quitte la machine. Aucune analytique
   tierce — le CP0 a vérifié qu'il n'en existe aucune aujourd'hui.
2. **Aucun identifiant personnel.** L'état est anonyme par construction et le
   reste.
3. **Export et suppression complets.** Tout fait nouveau introduit par V77 —
   `usageEvents` compris — doit être exporté par `/api/progress/export` et
   effacé par `/api/progress/reset`. Un champ qu'on ne peut pas supprimer est un
   champ qu'on n'avait pas le droit d'écrire.
4. **Les données d'une étude humaine n'entrent pas dans l'état du produit.**
   Un pré-test, un rappel différé ou un signalement de confusion appartiennent
   au protocole, pas au learner state. Gelé : **aucun pont**.
5. **Bornes.** Tout nouveau fait porte un plafond de conservation explicite.

---

## 9. Contournements interdits — `H1`–`H14`

| # | interdit |
|---|---|
| `H1` | viser « 12/12 surfaces émettent » comme objectif |
| `H2` | transformer un `NO_FACT` en fait pour améliorer la couverture |
| `H3` | compter une page visitée comme une activité |
| `H4` | compter une déclaration comme une validation |
| `H5` | présenter une conformité de forme comme une justesse pédagogique |
| `H6` | présenter une simulation comme une expérience réelle |
| `H7` | transformer un résultat d'assessment en maîtrise |
| `H8` | produire deux preuves qualifiantes pour une seule production humaine |
| `H9` | surclasser une preuve historique par migration ou recalcul |
| `H10` | résoudre une ambiguïté par une heuristique plutôt qu'une source |
| `H11` | fabriquer un `conceptId` ou une compétence absente de la source |
| `H12` | faire confiance à une horloge client |
| `H13` | réécrire un fait historique |
| `H14` | affaiblir une porte, une sonde ou un seuil après en avoir vu le résultat |

---

## 10. Critères de verdict — **gelés avant le CP2**

### 10.1 Axe ingénierie — `O1`–`O20`

| # | critère | comment il se vérifie |
|---|---|---|
| `O1` | une **carte canonique unique** surface → politique existe et est lue par le produit | un seul fichier source, tests de cohérence |
| `O2` | **chaque** surface porte une politique explicite, `NO_FACT` compris, avec justification | carte + document |
| `O3` | aucune surface `FACT_REQUIRED` importante ne reste silencieuse | E2E CP13 |
| `O4` | tout fait nouveau porte les champs du §3.1 | tests |
| `O5` | aucun fait sans `provenance.producer` | tests + porte |
| `O6` | les **trois niveaux** de preuve existent et sont portés structurellement | tests |
| `O7` | `OBSERVED` et `DECLARED` **ne comptent pas** pour la compétence | tests de projection |
| `O8` | une mission ne produit **jamais** `VALIDATED` | tests + porte |
| `O9` | un capstone corrigé par le serveur n'est **plus** archivé `self` | mesure BEFORE/AFTER sur 13/13 |
| `O10` | un assessment échoué *n* fois laisse **n** faits | sonde 5 échecs → 1 réussite |
| `O11` | `simulation` est un **champ**, pas du texte | tests + porte |
| `O12` | une activité simulée conserve sa marque jusque dans la preuve | E2E |
| `O13` | le double comptage inter-surfaces est **mesuré** puis **contenu** | CP10, chiffre canonique |
| `O14` | la provenance d'un avancement dérivé survit (`derivedFrom`) | tests |
| `O15` | le rejeu est **idempotent** sur toutes les surfaces | tests de replay |
| `O16` | l'**ordre** des événements ne change pas la projection | tests |
| `O17` | aucun fait historique n'est réécrit ni perdu | BEFORE/AFTER |
| `O18` | export et suppression couvrent **tout** fait nouveau | tests |
| `O19` | **≥ 30 mutations** vues rouges puis restaurées, porte comprise via un juge **externe** | CP14 |
| `O20` | `npm test` · `tsc` · `build` · `gates:active` · `v74` · `v75` · `v76` · **`v77`** verts, sans régression V76 | CP14 |

> **La leçon de V75 et de V76, reconduite.** Si `O1`–`O20` sont tous atteints,
> le verdict d'ingénierie **DOIT** être `PRACTICE_OBSERVABILITY_READY`.
> L'absence de pilote humain ne se soustrait pas de cet axe : elle s'exprime sur
> le second, et **nulle part ailleurs**.

### 10.2 L'échelle d'ingénierie

| verdict | condition |
|---|---|
| `PRACTICE_OBSERVABILITY_READY` | `O1`–`O20` tous atteints |
| `PRACTICE_OBSERVABILITY_CANDIDATE` | `O1`–`O16` atteints, une ou deux lacunes déclarées sur `O17`–`O20` |
| `PRACTICE_OBSERVABILITY_FOUNDATION_READY` | la carte canonique et les niveaux existent, mais des surfaces importantes restent non traitées |
| `PRACTICE_OBSERVABILITY_NOT_READY` | tous les autres cas |

**Et `READY` est refusé, quels que soient les autres critères, si** :

- une politique `FACT`/`NO_FACT` reste ambiguë ;
- une preuve est automatiquement surclassée ;
- une simulation est présentée comme réelle ;
- le double comptage n'est pas contenu ;
- un rejeu n'est pas idempotent ;
- une ambiguïté a été résolue par heuristique ;
- un événement historique est cassé ;
- `data/progress.json` est fabriqué ;
- une porte n'est pas verte.

### 10.3 Axe humain

| verdict | condition |
|---|---|
| `REAL_HUMAN_LEARNING_EVIDENCE_NOT_MEASURED` | **le seul atteignable en V77** |

**V77 n'observe aucun humain et ne peut pas dépasser ce niveau.** Le déclarer
autrement serait le mensonge que trois sprints ont appris à éviter.

---

## 11. Hypothèses et incertitudes, déclarées

- **La règle du maillon faible (§4.5) est un choix, pas une mesure.** On aurait
  pu défendre qu'une mission vaut la moyenne de ses composantes. Le choix du
  minimum est délibérément conservateur : sous-déclarer une maîtrise est moins
  grave que la sur-déclarer.
- **Le seuil `0,7` des assessments et capstones est hérité**, jamais calibré
  contre un besoin pédagogique réel. V77 n'en invente aucun et n'en change aucun.
- **`OBSERVED` ne compte pour rien aujourd'hui (§2.2).** C'est peut-être trop
  sévère ; il faudra des données humaines pour le savoir, et V77 n'en aura pas.
- **L'unification assessment + capstone (§4.4) pourrait être contestée.** Elle
  repose sur l'observation, pas sur le rôle pédagogique. Si V78 montre que les
  deux se lisent différemment, le champ `kind` suffit à les séparer sans
  migration.
- **`pipelines` en `NO_FACT` (§4.7) est le renversement le plus net du brief.**
  Si un jour l'apprenant rédige le pipeline, la politique devra être rouverte
  ici, pas contournée ailleurs.
