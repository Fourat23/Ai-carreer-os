# V77 · CP0 — Couverture de la pratique : ce que le produit observe vraiment

> **Lecture seule.** Aucun fichier de produit modifié.
> Rejouables : `node scripts/v77/cp0-practice-forensics.mjs` (inventaire
> statique) · `node scripts/v77/cp0-observability-probe.mjs` (13 sondes contre
> le produit en marche). Résultats bruts : `docs/v77/cp0-inventory.json`,
> `docs/v77/cp0-observability.json`.

---

## 1. La phrase de départ du brief est fausse, et il fallait le mesurer

Le brief V77 reprend la conclusion du CP0 de V76 :

> « 11 grandes surfaces de pratique ; seulement 2 écrivent un fait pédagogique :
> `lab` → `ExerciseAttempt`, `transfer` → `TransferAttempt`. »

**Deux erreurs dans cette phrase**, l'une par défaut et l'autre par excès :

1. **`assessments` et `capstones` écrivent déjà**, et depuis longtemps (V65,
   V65.1) : une `Evidence` canonique, corrigée côté serveur. Les traiter comme
   des trous à combler aurait produit un doublon là où il y a déjà une écriture ;
2. **le nombre « 11 » ne correspond à rien de vérifiable.** Le disque porte
   **36 surfaces** au sens « route ou API », dont la grande majorité sont des
   surfaces de LECTURE.

Recopier cette phrase aurait orienté tout le sprint. On repart donc du disque.

## 2. Les surfaces, telles qu'elles existent

**36 surfaces** trouvées (routes + API, hors maquettes `design-spike/`).
Réparties par ce qu'elles laissent :

| ce qu'elles écrivent | n | surfaces |
|---|---|---|
| un **ÉVÉNEMENT** (fait daté, non révisable) | **2** | `lab`, `transfer` |
| une **PREUVE seulement** (projection) | **3** | `assessments`, `capstones`, `missions` |
| **rien** | **31** | dont `terminal`, `kubernetes`, `cloud-lab`, `cloud-foundations`, `pipelines`, `security` |

Les 25 autres sont des surfaces de lecture — `lessons`, `calendar`, `glossary`,
`retention`, `parcours`, `skills`… Le brief l'exige et le produit le respecte
déjà : **une page visitée n'est pas une activité** (sonde `A12` : six pages
ouvertes, aucune trace).

### 2.1 Les surfaces de pratique, au sens strict

Douze surfaces où un apprenant AGIT, avec le volume derrière chacune :

| surface | contenu | ce qu'elle fait | ce qu'elle laisse |
|---|---|---|---|
| `lab` | **376** exercices | exécute en bac à sable, corrige par tests | `ExerciseAttempt` + `Evidence` |
| `transfer` | **25** défis | corrige côté serveur | `TransferAttempt` + `Evidence` |
| `assessments` | **16** diagnostics | corrige côté serveur | `Evidence` seule |
| `capstones` | **13** capstones | corrige côté serveur | `Evidence` seule |
| `missions` | **42** missions | valide une structure + auto-évaluation | `Evidence` seule |
| `terminal` | **3** tâches | **exécute vraiment** (exitCode réel) | **rien** |
| `kubernetes` | **3** manifestes | valide + analyse + simule un incident | **rien** |
| `cloud-lab` | **3** topologies | valide + analyse + joue un scénario | **rien** |
| `cloud-foundations` | **8** architectures | valide + analyse + chiffre un coût | **rien** |
| `security` | **4** scénarios | valide + analyse + simule un incident | **rien** |
| `pipelines` | **3** pipelines | **exécute un pipeline, verdict objectif** | **rien** |
| `resources` | **45** playbooks | — (voir §7) | **rien** |

## 3. Le fait principal : la capacité d'observer existe, le fait n'existe pas

Les six surfaces qui n'écrivent rien **ne sont pas aveugles**. Mesuré en direct :

| sonde | surface | ce que le produit CALCULE |
|---|---|---|
| `A1` | kubernetes | `validateManifestSet` + `analyzeManifests` → diagnostics par sévérité |
| `A2` | cloud-lab | `validateTopology` + `analyzeTopology` → **5 diagnostics** |
| `A3` | cloud-foundations | `validateCloudArchitecture` + `analyzeCloud` + grille tarifaire |
| `A4` | security | `validateScenario` + `analyzeScenario` → **5 diagnostics** |
| `A5` | pipelines | `runPipeline` → **statut par job et statut global** |
| `A6` | terminal | exécution réelle → **`exitCode 0`**, 263 octets de sortie |

**Toutes rendent HTTP 200, un résultat substantiel, et modifient zéro octet de
l'état de l'apprenant.**

C'est le cinquième sprint d'affilée où la chose à construire existe déjà,
débranchée. V74 avait trouvé un moteur de remédiation jamais appelé ; V76 un
historique persisté jamais servi ; V77 trouve **six moteurs d'analyse dont
personne ne garde le résultat**.

## 4. Ce qui est déjà cassé, et qui compte plus que les trous

### 4.1 Le double comptage est revenu, cette fois ENTRE surfaces

V76 · CP11 avait corrigé : une réussite au laboratoire écrivait deux preuves.
La correction tenait **dans le laboratoire**. Personne n'avait regardé ce qui se
passe entre deux surfaces.

`reconcileAutoDeliverables` (`lib/missions-server.ts`) marque un livrable de
mission comme validé **quand l'exercice référencé a été résolu** :

```js
const passed = Object.values(days).some((dp) => hasLabEvidence(dp, d.exerciseRef));
if (passed) next = submitDeliverable(next, mission, d.id, { status: 'validated' });
```

Mesuré de bout en bout (sonde `A13`), sur `frontend-accessible-search` :

```
exercise:react-search                  passed / exercise-tests      [jsts]
mission:frontend-accessible-search     passed / mission-deliverables [jsts]
```

**Deux preuves qualifiantes, la même compétence, deux sources distinctes.** Or
la règle de consolidation (`lib/competency.mjs`) promeut à `reinforced` dès
qu'elle voit deux sources distinctes et deux dates distinctes.

Autrement dit : **un exercice résolu + un document + un clic d'auto-validation
suffisent à déclarer une compétence « réancrée »**.

Les 42 livrables `auto` référencent un exercice ; **14** d'entre eux portent une
compétence déclarée en commun avec lui. Le chiffre exact des cas où les
compétences CANONIQUES coïncident reste à établir au CP10 — la canonicalisation
(`react` → `jsts`) élargit probablement ce nombre, et je ne l'affirmerai pas
avant de l'avoir compté.

### 4.2 Une mission dit `passed` sur la foi d'un clic

Les **42 missions sur 42** ont exactement trois livrables :
`auto` · `structural` · `review`. Le dernier est une **auto-évaluation que
l'apprenant valide lui-même**. Quand les trois sont satisfaits, le produit
écrit :

```js
validation: { status: 'passed', kind: 'mission-deliverables', detail: 'Livrables requis complétés.' }
```

`passed` — une preuve **qualifiante**, qui compte pour la compétence.

Et la validation structurelle ne mesure que la forme. Sonde `A9`, document écrit
exprès pour être **pédagogiquement faux** — « on retire le label pour gagner de
la place », « largeur fixée à 1200 pixels », « l'état vide affiche une page
blanche » — sur une mission d'accessibilité :

> `structure ok : true`

Le validateur vérifie les sections, les mentions obligatoires, la longueur, et
refuse les textes de remplissage. **Il ne peut pas vérifier que le contenu est
juste, et le produit écrit `passed` quand même.**

Ce n'est pas un défaut du validateur : valider du sens n'est pas à sa portée.
C'est un défaut de **nommage de la preuve**.

### 4.3 Un capstone corrigé par le serveur est archivé comme une auto-déclaration

La route capstone émet `kind: 'capstone-grade'`. Le vocabulaire gelé
(`VALIDATION_KINDS`) contient `'capstone-review'`, pas `'capstone-grade'`. Et
`normalizeValidation` fait :

```js
kind: VALIDATION_KINDS.includes(v.kind) ? v.kind : 'self',
```

**Toute preuve de capstone est donc stockée `kind: 'self'`.** Mesuré (`A11`) :
7/7 bonnes réponses, correction déterministe côté serveur, et la preuve écrite
porte `passed/self` — le niveau de provenance le plus faible du modèle,
indiscernable d'une déclaration.

Pire : le chemin de **migration des preuves héritées** (`lib/evidence.mjs:457`)
attribue correctement `capstone-review`. **Les vieilles données sont mieux
étiquetées que les nouvelles**, et `capstone-review` n'est plus produit par rien.

### 4.4 Un assessment échoué cinq fois est enregistré une fois

Sondes `A7` et `A8`. Un échec écrit une preuve `failed`. Une réussite en écrit
une seconde, `passed`. Puis **trois échecs supplémentaires n'écrivent rien** :
la clé métier de déduplication les fusionne.

Le produit ne peut donc pas distinguer « raté une fois » de « raté cinq fois ».
Il n'existe **aucun `AssessmentAttempt`** : la projection est conservée, le fait
est jeté — c'est le défaut nommé par V74 · CP0, intact sur cette surface.

## 5. Les faits du produit, recomptés

Neuf champs dans l'état vide, **tous présents dans les deux listes blanches**
du store (le défaut P7 de V75 ne s'est pas reproduit) :

`days` · `skills` · `weeklyReviews` · `monthlyReviews` · `evidence` ·
`recallAttempts` · `exerciseAttempts` · `transferAttempts` · `hintViews`

**24 commandes** dans le moteur, dont **5** enregistrent un fait :
`RECORD_ATTEMPT` · `RECORD_RECALL` · `RECORD_EXERCISE_ATTEMPT` ·
`RECORD_TRANSFER_ATTEMPT` · `RECORD_HINT_VIEW`

### 5.1 Les preuves

- **types de source qualifiants** : `exercise`, `assessment`, `mission`,
  `capstone`, `transfer-challenge` ;
- **genres de validation déclarés** : `exercise-tests`, `assessment-grade`,
  `mission-deliverables`, `capstone-review`, `self` ;
- **genre réellement produit et absent du vocabulaire** : `capstone-grade`
  (§4.3).

Il n'existe **aucun niveau de confiance** : une preuve est `passed` ou non. Un
exercice corrigé par 5 tests en bac à sable et une mission validée par un clic
portent **le même statut**, et pèsent pareil dans la projection de compétence.

## 6. Le terminal : le cas où « aucun fait » est probablement la bonne réponse

Le brief demande si un `TerminalAttempt` est justifié. **Les données disent
plutôt non**, et c'est un résultat, pas une paresse.

Les trois tâches n'ont **aucun critère de réussite pédagogique**. Elles portent
`expectedExitCodes`, et leurs arguments sont des **énumérations fermées** : la
tâche `term-list-files` demande de choisir entre `-1`, `-l` et `-la`. Les
descriptions le disent elles-mêmes :

> « Le script n'est pas modifiable : c'est une **démonstration d'exécution
> bornée**. »

Un apprenant ne peut pas s'y tromper : il choisit dans une liste d'options
toutes valides. Fabriquer un `TerminalAttempt` avec `success`/`failure`
inventerait un verdict pédagogique là où il n'y a qu'une démonstration.

Ce qu'on POURRAIT observer honnêtement : « une tâche de terminal a été exécutée,
adaptateur `local`, code de sortie 0 ». C'est un fait d'USAGE, pas de maîtrise.
Le CP1 devra trancher s'il mérite d'exister.

## 7. Les playbooks : contenu, pas pratique

45 playbooks servis par `/resources`. Aucune API, aucune action, aucune
soumission. Ce sont des **documents de référence**. V76 les avait recensés sans
les classer ; la réponse est qu'ils n'ont pas à produire de fait.

## 8. Les simulations sont honnêtement marquées — et la marque n'atteint pas la preuve

**13 capstones sur 13** portent un `simulationNote` explicite (« Traces d'agent
simulées, déterministes. Aucun appel de modèle réel »). Les surfaces cloud, K8s,
sécurité et pipelines simulent tout aussi ouvertement — `runPipeline` prend une
horloge injectée, `simulateIncident` est déterministe.

**Point mesuré** (`A11`) : le détail de la preuve capstone contient bien le mot
« simulation ». Mais c'est du **texte libre dans `detail`**, pas un champ. Rien
n'empêche une surface de vue de l'ignorer, et rien ne le garde.

## 9. Les 125 exercices ambigus

| classe | n |
|---|---|
| `UNAMBIGUOUS` | 140 |
| `AMBIGUOUS` | **125** |
| `MULTI_CONCEPT_BY_DESIGN` | 67 |
| `RESOLVABLE_FROM_CONTEXT` | 32 |
| `RESOLVED_BY_SKILL` | 12 |

Cause unique, pour les 125 : `R5 · N leçons candidates, aucune règle ne
tranche` — de 2 à 14 candidates.

**La raison de fond** : un fichier d'exercice ne contient **ni `conceptIds` ni
`lessonRefs`**. Le rattachement est entièrement DÉRIVÉ du calendrier
(jour → leçons du jour). Quand un jour porte plusieurs leçons, rien ne tranche,
et c'est correct de ne pas trancher.

La classification honnête est donc majoritairement **`METADATA_MISSING`**, pas
`TRUE_AMBIGUOUS` : la donnée source ne porte simplement pas la déclaration.
Le CP8 devra ajouter une déclaration **hors du corpus gelé** — et seulement là
où une source pédagogique réelle la soutient.

## 10. Vie privée

| | |
|---|---|
| export | ✅ `/api/progress/export` |
| import | ✅ `/api/progress/import` |
| réinitialisation | ✅ `/api/progress/reset` |
| **analytique tierce** | ✅ **aucune** (aucun `gtag`, `segment`, `sentry`, `posthog`…) |
| `data/progress.json` dans le dépôt | ✅ absent |
| identifiant personnel | aucun : l'état est anonyme par construction |

Le socle de V78 est donc déjà correct sur le point le plus sensible : **rien ne
sort de la machine**. Restent à examiner au CP12 la granularité de la
suppression et ce qu'un export contient exactement.

## 11. Santé technique — la ligne de base V76 tient

| | mesuré aujourd'hui |
|---|---|
| `npm test` | **1984 / 1984** |
| `npx tsc --noEmit` | **0** |
| `npx next build` | **OK** |
| `npm run gates:active` | **49 portes, 0 violation** |
| `v74:check` · `v75:check` · `v76:check` | ✅ ✅ ✅ |
| `v73:check` | **n'existe pas** dans ce dépôt (le brief le suppose) |
| sondes de sécurité V76 | **16 / 16 contenues** |
| corpus | **376 exercices · 1 357 tests · 6 runtimes** |

Tous les nombres du brief sont confirmés **sauf** `v73`, qui n'a jamais existé
ici.

## 12. La carte des trous d'observabilité, pour un pilote humain

Un participant qui ferait : `jour → leçon → exercice → terminal → assessment →
transfert → mission`.

| action | aujourd'hui | conséquence pour V78 |
|---|---|---|
| lit une leçon | **invisible** | correct — mais aucune durée d'étude ne sera mesurable |
| résout un exercice | ✅ fait + preuve | observable |
| échoue plusieurs fois | ✅ chaque tentative | observable |
| consulte une aide | ✅ `hintViews` | observable |
| exécute une commande | **invisible** | on ne saura pas qu'il a pratiqué |
| analyse un manifeste K8s | **invisible** | **le travail le plus riche du produit est le moins tracé** |
| échoue 5× un assessment | **1 seule trace** | la courbe d'apprentissage sera plate par construction |
| réussit un assessment | ✅ preuve | observable, mais sans historique |
| réussit un capstone | ✅ preuve `self` | **sous-estimé** |
| termine une mission | ✅ preuve `passed` | **sur-estimé** |
| fait un défi de transfert | ✅ fait + preuve | observable |

**Deux erreurs de sens opposé** : le capstone, corrigé objectivement, est archivé
comme une déclaration ; la mission, validée par un clic, est archivée comme une
réussite. Un pilote humain lancé aujourd'hui produirait des données faussées
**dans les deux directions**.

## 13. Anomalie de ma propre sonde — n° 1

Ma sonde `A9` écrivait, dans un document d'accessibilité délibérément mauvais :
« on retire le label pour gagner de la place ; **le placeholder** suffit ». Le
validateur a refusé le document, et j'ai d'abord conclu que la structure tenait.

**Elle ne tenait pas.** Le mot `placeholder` figure dans la liste noire des
marqueurs de remplissage (`PLACEHOLDER_RE`), aux côtés de `todo`, `lorem ipsum`
et `à compléter`. Ma sonde mesurait donc son propre vocabulaire, pas le produit.

Corrigée, la sonde rend `structure ok : true` — et la conclusion du §4.2 tient.

**Et c'est aussi un défaut du produit**, petit mais réel : `placeholder` est un
**terme du domaine** (l'attribut HTML) dans toute mission touchant aux
formulaires. Le validateur ne peut pas distinguer le mot-outil du mot-métier.
À consigner comme dette, sans l'exagérer.

## 14. Ce que je ne sais pas encore

- **combien de cas de double comptage existent réellement** : les 14 mesurés le
  sont sur les compétences DÉCLARÉES, pas canoniques. À compter au CP10 ;
- **si les surfaces cloud/K8s/sécurité méritent un fait** : elles rendent des
  diagnostics par sévérité, pas un verdict. Un fait « l'apprenant a soumis une
  configuration produisant N diagnostics » est descriptible ; est-il utile ?
  Le CP1 doit trancher, pas le CP0 ;
- **ce que `runPipeline` permet vraiment** : c'est la seule des six à rendre un
  verdict objectif (`success`/`failed`/`blocked`). C'est le meilleur candidat à
  un fait, et le moins de contenu (3 pipelines) ;
- **si les 125 ambiguïtés sont réductibles** : il faudra lire les leçons
  candidates, pas appliquer une règle de plus.

## 15. Plan CP1 → CP15

| CP | intention |
|---|---|
| **CP1** | geler le contrat d'observabilité : `NO_FACT` par défaut, niveaux de preuve `DECLARED`/`OBSERVED`/`VALIDATED`, critères de verdict |
| **CP2** | un modèle canonique unique, lisible par la machine, surface → politique |
| **CP3** | terminal : décider, et probablement écrire **pourquoi non** |
| **CP4** | assessments : le fait manquant (`AssessmentAttempt`) |
| **CP5** | missions : cesser d'écrire `passed` pour une auto-validation |
| **CP6** | capstones : réparer le `kind` avalé, sans surclasser |
| **CP7** | cloud / K8s / sécurité / pipelines, avec marqueur de simulation **dans la donnée** |
| **CP8** | les 125, par déclaration explicite hors corpus gelé |
| **CP9** | unification des preuves : matrice source × validation × confiance |
| **CP10** | double comptage inter-surfaces — mesurer, puis contenir |
| **CP11** | branchement à l'état de l'apprenant, sans nouveau moteur |
| **CP12** | clôture de l'instrumentation pour V78 |
| **CP13** | E2E inter-surfaces |
| **CP14** | ≥ 30 mutations + porte `v77:check` + juge externe |
| **CP15** | rapport final, deux verdicts |

## 16. Risques de ce sprint

1. **La tentation du 11/11.** Le brief l'interdit explicitement, et la mesure la
   rend tentante : six surfaces silencieuses, six moteurs prêts. La discipline
   sera de justifier chaque `NO_FACT` aussi sérieusement que chaque fait.
2. **Corriger la mission en la cassant.** Rétrograder `mission-deliverables` de
   `passed` change la projection de compétence de tout apprenant existant.
   La correction devra être lisible et ne rien effacer.
3. **Le corpus est gelé.** Toute déclaration de concept ajoutée au CP8 doit
   vivre hors de `data/exercises/`.
4. **Sur-corriger le capstone.** Réparer `capstone-grade` relève mécaniquement
   la confiance de preuves existantes. Il faudra que ce soit justifié, pas
   seulement cohérent.
