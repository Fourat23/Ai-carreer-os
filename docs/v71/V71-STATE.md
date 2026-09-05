# V71 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque lot** et après **chaque CP**. En cas
> d'interruption, relire ce fichier, vérifier Git, et reprendre au point indiqué.
> NE PAS refaire CP0, CP1, CP2.

## Position

- **dernier CP terminé** : CP2
- **CP actuel** : CP3
- **leçons réellement lues et notées** : **120 / 128**
- **dernier lot complet** : **15 / 16**
- **prochaine action EXACTE** : CP3 — **lot 16/16, dernier**, leçons 121 à 128 de
  `docs/v71/ordre-lecture.json`. Lire (`node scripts/v71/lire.mjs <slug>`), noter D1→D14 selon
  `V71-ACADEMIC-CONTRACT-FROZEN.md`, écrire dans `docs/v71/LEDGER-128.json`, commit, push.

---

## Incident de session — perte du conteneur (2026-09-05)

La session du 2026-08-30 a été interrompue par une limite d'usage, puis le conteneur a été
détruit. Le nouveau conteneur est reparti d'un dépôt vide. Audit forensique effectué avant
toute écriture ; aucun `reset --hard`, aucun force-push, aucune ref supprimée.

**Récupéré** : tout ce qui avait été poussé, jusqu'à `aebbdaa` (CP3 lot 5).

**Perdu** — matériellement, non reconstructible sans relecture :

| perdu | contenu | statut |
|---|---|---|
| commit `8045888` | CP3 lot 6 — 8 leçons lues et notées | **à refaire par lecture** |
| lot 7 partiel | 4 leçons lues, jamais notées ni commitées | **à refaire par lecture** |
| `PREREQUIS-ORDRE.md` | jamais commité | **reconstruit par re-mesure** (§ ci-dessous) |

Le chiffre « 48/128 » annoncé en console avant la coupure **n'est pas repris**. Les huit
notations du lot 6 n'existent dans aucun artefact : elles seront refaites par lecture.
L'état prouvé est **40/128**, et c'est celui qui est publié.

`PREREQUIS-ORDRE.md` n'a pas été recopié de mémoire : la détection a été écrite en script
(`scripts/v71/prerequis-ordre.mjs`, qui n'existait pas), rejouée sur le corpus intact, et les
31 formulations relues. Les comptes sont identiques ; un point a été corrigé par la relecture
(§5 du document : 6/6 prérequis hors parcours correctement signalés, et non 4/6).

**Règle adoptée pour la suite** : commit + push après **chaque lot de 8**, sans attendre la
fin d'un CP. Une future perte de conteneur coûte au maximum 8 lectures.

---

## Invariants revérifiés à la reprise (2026-09-05)

| invariant | attendu | mesuré | état |
|---|---|---|---|
| leçons | 128 | 128 | OK |
| journées | 365 | 365 | OK |
| solutions | 365 | 365 | OK |
| corpus des 128 leçons (SHA1) | `edbfecdf…` | `edbfecdff1d3e4c320cedd51ede95601fd94750d` | **identique au CP0** |
| `data/program.json` (SHA1) | `5ac3da30…` | `5ac3da304994c298ab964a4b03e13da336bb8935` | **identique au CP0** |
| `data/progress.json` | non versionné (`.gitignore` l. 8) | absent du dépôt | **non vérifiable, et normal** |
| working tree | propre | propre | OK |
| stash | vide | vide | OK |
| objets orphelins (`git fsck`) | — | aucun | OK |
| local == origin | oui | `aebbdaa` des deux côtés | OK |

`data/progress.json` est un fichier d'état utilisateur local, ignoré par Git depuis l'origine.
Son empreinte notée au CP0 portait sur le fichier du conteneur détruit ; elle **ne peut pas**
être revérifiée ici, et cela ne constitue pas une perte : V71 interdit d'y toucher (§30).

## Validation à la reprise

`npm test` **1420 / 1420** · `npx tsc --noEmit` **0** · `npm run build` **0** ·
`npm run gates:active` **0** (dont `v66:check` 56 vérifications, `v66:render` 950 fichiers).

---

## Avancement de la notation

- leçons réellement lues : **120 / 128**
- notations D1→D14 complètes : **120 / 128**
- moyenne provisoire (120 notées) : **4,813**
- leçons sous 3,00 : **0** · minimum du corpus : **4,14** (`interview-preparation`)
- **P0 : 0** · **P1 : 23** · **P2 : 14** · **P3 : 10**

### Moyenne par dimension (120 notées)

| D1 | D2 | D3 | D4 | D5 | D6 | D7 |
|---|---|---|---|---|---|---|
| 4,88 | **4,27** | 4,97 | 4,99 | 4,98 | 4,83 | 4,97 |

| D8 | D9 | D10 | D11 | D12 | D13 | D14 |
|---|---|---|---|---|---|---|
| 4,81 | 4,98 | 4,77 | 4,87 | 4,83 | **4,31** | 4,92 |

### Les vingt leçons à D2 = 1 sont toutes notées

La prédiction de `PREREQUIS-ORDRE.md` est close : les **20** leçons annoncées à D2 = 1 ont
toutes été lues et notées, et les 8 annoncées à D2 = 4 aussi. **Aucune leçon des 32 restantes
ne devrait donc porter un défaut de prérequis** — c'est une prédiction vérifiable au lot 16.

Ces 20 leçons occupent **neuf des dix dernières places du corpus** :

| | leçon | moyenne |
|---|---|---|
| 1 | `interview-preparation` (deux prérequis postérieurs) | **4,14** |
| 2 | `llm-cost-optimization` (D2 = 1 **et** D1 = 3) | **4,29** |
| 3 | `prompt-engineering` | 4,43 |
| 4–7 | `express-backend`, `rag-evaluation`, `prompt-injection-defense`, `agent-workflows-orchestration` | 4,50 |
| 8 | `javascript-basics` (seul du bas de tableau **sans** défaut de prérequis) | 4,57 |

**Le défaut d'ordre des prérequis est, de loin, la première cause de perte de points de V71.**
Il ne coûte rien à réparer — trois remèdes de texte, aucune modification du parcours — et sa
correction aux CP4→CP9 devrait à elle seule faire remonter D2 de 4,08 à environ 4,9.

**Dix-sept leçons à 5,00 sur 104.** La concentration reste à surveiller : l'audit aveugle du CP13
(32 leçons, graine 20260831) est le contrôle prévu sur ma propre sévérité.

**Six leçons à 5,00 sur les quatorze dimensions** : `portfolio-github`,
`html-semantic-structure`, `react-accessibility`, `react-composition-architecture`,
`frontend-testing`, `database-transactions-concurrency`. Quatre d'entre elles sont dans le
seul lot 8, ce qui est anormalement concentré — **à revérifier au CP13** (audit aveugle) et
au CP15. Ce qu'elles ont en commun et qui justifie la note : preuve exécutée ou mesurée,
erreur plausible nommée **avec la raison qui la rend séduisante**, limite de leur propre
approche déclarée, section de vérification distincte, et pratique à critère falsifiable.

Les deux points bas sont **D2** (prérequis, qui va encore descendre : 16 des 20 leçons à
D2 = 1 ne sont pas encore notées) et **D13** (vérification de compréhension — présente
partout, mais souvent fondue dans la pratique plutôt qu'en contrôle distinct).

### Lot 6 — ce que la lecture a trouvé

Trois défauts nouveaux, tous établis par mesure et non par sonde :

- **`observability-logging` (P1, D1 = 2)** — la correction de la pratique C annonce un
  centile 95 de 3 000 ms pour un jeu à 95 % / 5 %. Mesuré : p95 = 50 ms, p99 = 3 000 ms.
  Aggravant : l'énoncé demande un jeu où le p95 est **mauvais**, et la correction en
  fournit un où il est bon — elle échoue à l'exercice qu'elle corrige. Fix CP8.
- **`technical-debt` (P1, D1 = 2)** — l'exemple guidé publie « ~10 j » de coût annuel pour
  la dette C là où sa propre formule donne **10,67 heures**. Les trois autres lignes sont
  en heures et exactes. Conséquence : C s'amortit en 2,25 ans, pas 0,30, donc elle passe
  derrière A et l'observation « C est celle qu'on sous-estime » ne découle plus du tableau.
  Fix CP9.
- **`python-foundations` (P2)** — `except TypeErreur:` dans la table de traduction :
  `TypeErreur` n'est pas un nom Python (`NameError` vérifié). Fix CP4.

Et un modèle opposable : **`slo-error-budget`** intègre en quatre phrases la notion de
disponibilité dont elle a besoin au lieu de l'exiger. C'est le remède à appliquer aux 20
défauts de prérequis. **`portfolio-github`** est la première leçon du corpus à 5 sur les
quatorze dimensions.

### Correction D2 appliquée à la reprise

L'enquête prérequis (voir `PREREQUIS-ORDRE.md`) prouve que **20 leçons** exigent un prérequis
enseigné plus tard sans le signaler, et que **8 autres** citent un concept postérieur en le
signalant comme aide. L'ancre D2 gelée au CP1 est sans ambiguïté : niveau **1** si « un
prérequis renvoie vers une leçon située après », niveau **4** si le concept non enseigné est
« explicitement signalé comme périphérique ».

Le barème n'a pas été modifié — il a été **appliqué**. Douze des 40 leçons déjà notées étaient
concernées, toutes à D2 = 5. Les deux chiffres sont publiés :

| | avant | après |
|---|---|---|
| moyenne D2 (40 notées) | 5,000 | **4,250** |
| moyenne corpus (40 notées) | 4,802 | **4,748** |

Détail : `design-patterns-intro`, `express-backend`, `interview-preparation`,
`readme-documentation`, `technical-documentation`, `technical-storytelling` passent de 5 à
**1** (P1) ; `api-design-basics`, `api-production-contracts`, `architecture-basics`,
`async-javascript`, `authentication`, `breaking-changes-compatibility` passent de 5 à **4**
(P3, plafond structurel, comportement correct).

Les 16 leçons restantes de la liste seront notées à leur lot. Conséquence attendue : **S2
(≥ 3,70 sur chaque dimension) sera le seuil le plus difficile de V71**, et il ne sera
franchissable qu'après les corrections P1 des CP4→CP9.

---

## Empreintes (snapshot CP0, inchangées)

- HEAD au démarrage V71 : `c8259501dcbf92c9601b9605bb49d5b5762f2bf4`
- corpus des 128 leçons : `edbfecdff1d3e4c320cedd51ede95601fd94750d`
- `data/program.json` : `5ac3da304994c298ab964a4b03e13da336bb8935`
- snapshot par leçon : `docs/v71/SNAPSHOT-CP0.json`
- échantillon aveugle : `docs/v71/ECHANTILLON-AVEUGLE.json` — **graine 20260831**

---

## Lots

| CP | objet | état |
|---|---|---|
| CP0 | audit forensique + snapshot + rapport | **terminé** |
| CP1 | contrat académique gelé, ancres D1→D14, seuils READY | **terminé** |
| CP2 | standard humain + archétypes + règles anti-template | **terminé** |
| CP3 | lecture et notation des 128 + ledger initial | **en cours — 120/128** |
| CP4 | P0+P1 fondations / systèmes / cloud / Kubernetes | à faire |
| CP5 | P0+P1 frontend / CSS / React / Next.js | à faire |
| CP6 | P0+P1 web / backend / API / SQL / data | à faire |
| CP7 | P0+P1 ML / IA appliquée / LLM / RAG / agents | à faire |
| CP8 | P0+P1 architecture / perf / sécurité / observabilité / incidents | à faire |
| CP9 | P0+P1 carrière / Git / pratiques pro / documentation | à faire |
| CP10 | passe transversale PRATIQUE (128) | à faire |
| CP11 | passe corrections + vulgarisation + jargon + prérequis | à faire |
| CP12 | validation factuelle et assertions exécutables | à faire |
| CP13 | audit aveugle (32 leçons, graine 20260831) | à faire |
| CP14 | tests négatifs + gauntlet + budget temps | à faire |
| CP15 | notation finale 128×14 + rapport + recommandation V72 | à faire |

## Commits V71

- CP0 : `1fb8ea6`
- CP1 : `5472c2c`
- CP2 : `b3e4592`
- CP3 lot 1 : `b3c9489` · lot 2 : `2440c0b` · lot 3 : `237ded7` · lot 4 : `6d79aa0` ·
  lot 5 : `aebbdaa`
- reprise après perte de conteneur + enquête prérequis : `44747e5`
- CP3 lot 6 : `cde0206` · lot 7 : `d5ebfcc` · lot 8 : `6354c84` · lot 9 : `6d93243` · lot 10 : `a53cdf7` · lot 11 : `43fd152` · lot 12 : `c8553b8` · lot 13 : `86a6886` · lot 14 : `4a83fcc` · lot 15 : ce commit

### Lot 7 — frontend (8 leçons)

Le lot le plus fort du corpus jusqu'ici sur D1/D4/D6/D7, et le plus faible sur D2 : **trois
des huit** portent un défaut de prérequis de classe B ou C (`react-application-states` +9 j,
`web-forms-validation` +7 j, `frontend-performance` +2 j), tous vers
`react-composition-architecture` ou `html-semantic-structure`. Corrections au CP5.

`html-semantic-structure` est la **deuxième leçon du corpus à 5 sur les quatorze dimensions**
(après `portfolio-github`). Deux défauts nouveaux, mineurs :

- **`browser-dom-rendering` (P2)** — la matrice de synchronisation totalise **20** croix
  (comptées dans le fichier) et la leçon publie `N = 21`, répété en toutes lettres. N'inverse
  aucune conclusion, mais l'apprenant doit produire ce nombre lui-même et comparer. Fix CP5.
- **`typescript-frontend` (P2)** — l'argument sur `as` est produit **trois fois**, deux fois en
  termes quasi identiques, et la section « Correction attendue » ne corrige aucun énoncé (la
  pratique a déjà son corrigé juste au-dessus) : elle réexplique le cours. Fix CP5.

Les huit archétypes du lot sont **tous distincts** — fondation conceptuelle, debugging,
construction, architecture, sécurité, comparaison, optimisation, revue de code — ce qui
satisfait la règle anti-clonage du CP2 sur huit leçons consécutives d'un même domaine.

### Lot 8 — fin du frontend, début des données

**Premier P1 de pratique de V71.** `sql-performance-indexing` enseigne `EXPLAIN`, en fait son
premier geste (« ne devine JAMAIS pourquoi une requête est lente : demande son plan ») et **ne
le fait jamais exécuter**. Son unique exercice — 57 mots — renvoie à un exercice externe qui
corrige un N+1 par une `Map` en mémoire : ni index, ni plan, ni base. Ancre D8 niveau 2,
« l'exercice ne travaille pas la compétence annoncée ». Fix CP6.

**Une incohérence entre leçons**, trouvable seulement par lecture suivie :
`react-composition-architecture` (jour 104) donne comme corrigé modèle un inventaire où
`chargement` et `erreur` sont deux états séparés — la forme exacte que
`react-application-states` (jour 95) démontre être « fausse, pas maladroite : fausse ».
Involontaire (le sujet de la seconde est état/dérivé, pas la forme de l'état). P2, aucune
dimension déduite, remède d'une demi-phrase. Fix CP11.

**Asymétrie éditoriale entre domaines, à reporter au CP15.** Les pratiques du lot frontend
font 400 à 550 mots, en parties lettrées, avec un bloc « Critère de réussite » explicite.
Celles du lot données font 20 à 60 mots sans critère énoncé. Le contenu explicatif est de
niveau équivalent — c'est l'énoncé de pratique qui diffère, et c'est ce qui tire D8, D12 et
D13 vers le bas sur `pandas-data-wrangling`, `data-cleaning-quality` et `etl-pipelines`.
Ce n'est pas un défaut par leçon mais un choix éditorial non uniforme.

### Lot 9 — migrations, statistiques, ML

Le lot le plus **vérifiable** du sprint, et tout a été revérifié avant notation : les douze
chiffres du dépistage de `model-evaluation`, le paradoxe de Simpson de `statistics-for-ml`
(un vrai paradoxe, A gagne les deux sous-groupes et perd au total), le calcul métier de
`scikit-learn-workflow` (16 fraudes × 200 € contre 247 alertes × 5 min ≈ 20 h) obtenu en
**réexécutant** `scripts/v70-verifications/ml-pieges-mesures.py`, et les lignes de la matrice
d'attention de `transformers` qui somment bien à 1.

**Un chiffre non sourcé, reproduit plutôt que cru.** `machine-learning-basics` publie
« Résultats mesurés : 0,870 / 0,590 » sans citer de script — seule leçon mesurée du corpus
dans ce cas. Les figures ont donc été reproduites sur quatre graines
(`scripts/v71/ml-fuite-selection.py`) : **A 0,835 · B 0,515 en moyenne**, la fuite de
sélection vaut **+0,32** et la fuite de normalisation **+0,00**. L'effet est réel, massif et
robuste ; les quatre valeurs publiées tombent dans l'intervalle observé. P3 de traçabilité
seulement, aucune dimension déduite — l'ancre D1 dit « sourcés **ou** mesurés ».

**Deuxième glose cassée**, même signature que `database-migrations` : `feature-engineering`
écrit « c'est du **surapprentissage** — le modèle mémorise au lieu de généraliser — servi sur
un plateau », où la glose a été insérée entre le terme et son complément. Deux instances
connues, toutes deux dans une glose définissant un terme technique. Une sonde ciblée a été
tentée et **ne généralise pas** (les parenthèses par tirets cadratins légitimes noient le
signal) : vérification systématique reportée au CP11.

**D13 est le point bas structurel du domaine ML** : six des huit leçons du lot n'ont pas de
section de vérification de compréhension distincte, contre la quasi-totalité du lot frontend
qui en a une.

### Lot 10 — LLM et RAG

**La leçon la plus faible du corpus à ce stade : `llm-cost-optimization`, 4,29.** Ses douze
cellules de coût sont exactes et son facteur global de 196 aussi, mais la section « Les trois
leviers, par ordre d'efficacité » énonce en **ratios de jetons** ce qu'elle présente comme des
ratios de **facture** :

| affirmation | mesuré |
|---|---|
| « divise la facture par environ 60, sur n'importe quelle ligne » | 53,6 · 48,3 · 44,6 · 48,3 |
| « divise la facture par cinq environ » | 2,9 (A) · 3,1 (B) · 2,4 (C) |
| « coûte trois fois moins cher » | 2,0 |

Le 60 est le rapport des prix d'**entrée** ; le 5,5 est le rapport des **jetons** d'entrée. Le
classement des leviers reste juste (48 > 2,9 > 1,4), donc D1 = 3 et non 2. Aggravant : le
levier 3 est calculé **correctement** sur la facture par la même leçon (1,4 ×, et « 12 % des
jetons pour 41 % du coût » vérifié exactement) — elle sait faire et ne l'a pas fait deux fois
sur trois. Fix CP7.

**Trois P1 de prérequis dans un seul lot** : `prompt-engineering` → `ai-evaluation` (+56 j,
deuxième plus grand écart du corpus), `rag-evaluation` → `ai-evaluation` (+35 j),
`llm-cost-optimization` → `rag-fundamentals` (+21 j). Le domaine IA appliquée concentre les
défauts d'ordre.

**Un comptage faux** dans `prompt-engineering` : le tableau des neuf sorties montre **quatre**
lignes qui passent `JSON.parse` en violant le schéma, le texte en annonce **cinq**. Même
classe que le `N = 21` de `browser-dom-rendering`. P2.

Tout le reste du lot a été **recalculé et confirmé exact** : les trois lignes de coût de
`llm-fundamentals` (36 675 / 2 025 / 2 925 €), les sept lignes de `chunking-strategies`, et
les **dix valeurs** du tableau de cosinus aléatoires d'`embeddings`, vérifiées par simulation
de Monte-Carlo sur 200 000 paires par dimension.

### Lot 11 — recherche, sécurité IA, agents, files

**Quatre P1 de prérequis sur huit leçons**, dont le **plus grand écart du corpus** :
`agent-workflows-orchestration` (jour 274) exige `resilience-patterns` (jour 331), **+57 j**.
Puis `async-messaging-queues` → `resilience-patterns` (+41 j), `ai-security` et
`prompt-injection-defense` → `agents-fundamentals` (+14 j chacune). Le domaine IA appliquée
concentre à lui seul près de la moitié des 20 défauts d'ordre du corpus.

**Un chiffre non reproductible**, et c'est celui qui porte l'argument. Dans `ai-evaluation`,
la colonne « Note globale » donne A 0,78 · B 0,78 · C **0,77**. Recalculé : en moyenne simple,
A et B tombent juste, mais **C vaut 0,63**. Le 0,77 exige une pondération d'environ
0,40 / 0,40 / 0,19 que la leçon n'énonce nulle part — et c'est précisément d'elle que dépend
l'argument « le troisième est le plus dangereux, alors que sa note est la plus basse de très
peu ». Sous la lecture naturelle, la note globale **attrape** le défaut et l'argument
s'inverse. P2, fix CP7.

**Deux sections de vérification en double**, trouvées par `scripts/v71/titres-doubles.mjs` —
une sonde fiable dont la lecture retourne néanmoins le chiffre : **28 détections, 26
légitimes** (« Correction attendue » ×2 est la forme normale d'une leçon à deux exercices),
et seulement 2 défauts réels (`async-messaging-queues`, `system-design-scaling`), où une
restructuration a ajouté la section au bon endroit sans retirer l'ancienne annexe.

Le reste du lot a été **recalculé et confirmé exact** : les douze métriques de
`retrieval-reranking` (dont les deux nDCG@5, qui exigent la bonne formule d'escompte
logarithmique), les quatorze cellules d'empreinte de `vector-databases`, et les quatre taux
de fiabilité d'`agents-fundamentals` (0,95ⁿ pour n = 5, 10, 20, 40).

### Lot 12 — systèmes distribués, CI/CD, Docker

**Le lot le plus solide du sprint** : quatre leçons à 5,00 et un seul P1, sur le prérequis de
`ci-cd-pipeline-anatomy` (→ `docker-images-layers`, +13 j). C'est le domaine que V70 a le plus
retravaillé, et cela se lit.

`docker-build-dockerfile` mérite d'être signalée à part : c'est la leçon qui traite le mieux
du corpus une **contrainte d'environnement**. Elle interrompt son propre exposé pour déclarer
que le démon Docker n'était pas disponible à la rédaction, que les tailles citées sont des
ordres de grandeur et non des mesures, et que le geste — pas le chiffre — est ce qu'il faut
retenir. J'ai vérifié indépendamment que le démon Docker n'est effectivement pas disponible
ici : la déclaration est exacte, pas une précaution de style. C'est exactement ce que le
contrat demande, et cela vaut D1 = 5.

Mesure faite **sur ce dépôt même** dans `ci-cd-pipeline-anatomy` : les 155 fichiers de tests
chronométrés, 129,2 s cumulées, cinq fichiers pesant 47,9 % du total (recalculé exact), et un
plafond de parallélisation à ×6,75 qui vaut exactement la durée du fichier le plus long —
la démonstration la plus économique possible qu'on ne parallélise pas un chemin critique.

Le second exemplaire du défaut de section dupliquée est confirmé dans `system-design-scaling`,
avec une **nuance qui change la correction** : contrairement à `async-messaging-queues`, ses
questions d'annexe ne sont pas toutes couvertes par la section principale — celle sur les
points de défaillance unique doit être reprise avant suppression, pas jetée.

### Lot 13 — Docker production, observabilité LLM, résilience, incidents

**Aucun défaut nouveau, et cinq leçons à 5,00.** C'est le second lot consécutif sans P1 de
contenu, et il prolonge le constat du lot 12 : les domaines que V70 a le plus retravaillés
sont ceux qui tiennent le mieux à la lecture.

Trois passages méritent d'être retenus comme modèles opposables pour les CP4→CP9 :

- **`incident-response`** est le **troisième** modèle de traitement d'un prérequis, après
  `slo-error-budget` et `database-migrations` : elle intègre en trois phrases le retour
  arrière, l'aller de l'avant et le correctif à chaud, puis signale `release-incident-recovery`
  comme étagère de référence. Cela **confirme par lecture** le §5 de `PREREQUIS-ORDRE.md`.
- **`ci-cd-quality-gates-artifacts`** contient la démonstration la plus efficace du corpus
  contre une pratique répandue : deux suites de tests sur le **même** code, la suite qui
  appelle tout sans rien affirmer obtient **100 %** de couverture et passe la porte, celle qui
  contient une seule assertion vraie obtient **88,89 %**, échoue à la porte — et c'est la seule
  des deux qui attrape le défaut.
- **`postmortem-rca`** attaque une méthode enseignée partout en démontrant que les cinq
  pourquoi produisent une réponse **différente selon qui pose les questions**, avec trois
  chaînes valides menant à trois actions non redondantes.

**`cloud-aws-core`**, première leçon hors parcours du sprint, traite correctement la contrainte
§31 du brief : ses repères sont explicitement titrés « illustratifs, **non exécutés** ».

### Auto-contrôle : mes 5,00 suivent-elles la structure plutôt que la pédagogie ?

Question posée parce que 17 leçons à 5,00 sur 104 est beaucoup. Test : les leçons à 5,00
ont-elles simplement plus souvent une section « Vérification de compréhension » **et** une
« Pratique » ?

| | n | avec les deux sections |
|---|---:|---:|
| leçons à 5,00 | 12 | 9 (**75 %**) |
| leçons < 5,00 | 84 | 22 (**26 %**) |

La corrélation existe, et elle est **attendue** : D13 note précisément la présence d'un
contrôle de compréhension distinct. Mais elle n'est ni suffisante ni nécessaire —
**22 leçons ont les deux sections sans atteindre 5,00** (elles perdent sur D2, D1 ou D14), et
**3 l'atteignent sans les avoir** (`portfolio-github`, `statistics-for-ml`,
`rag-fundamentals`). La note ne se réduit donc pas à un gabarit. L'audit aveugle du CP13
reste le contrôle prévu.

### Lot 14 — l'étagère de référence (cloud, CSS)

Premier lot entièrement **hors parcours** : 5 leçons cloud, 3 CSS. Aucune n'est programmée par
les 365 journées, donc aucune contrainte d'ordre ne s'y applique — le script de prérequis le
confirme, et les 8 sont à D2 = 5.

**Contrainte §31 correctement traitée.** Vérifié leçon par leçon : `cloud-aws-core` et
`cloud-azure-core` titrent leurs repères « illustratifs, **non exécutés** » ; `cloud-finops`
et les trois CSS citent un script exécuté ; `cloud-compute-storage`, `cloud-fundamentals` et
`cloud-networking` ne publient **aucune** mesure — elles traitent de CIDR, de ports et de
scénarios d'exercice. **Aucune leçon ne prétend valider un cloud réel depuis cet
environnement.**

**Un défaut**, et il est ironique. `cloud-finops`, dont le sujet est de lire une facture avec
attention, affirme que « l'arithmétique est exacte et reproductible » — et sa colonne de neuf
postes totalise **1 884 €** quand le tableau annonce **1 885 €**. J'ai exécuté le script cité :
il reproduit le même écart, parce qu'il totalise des valeurs non arrondies puis arrondit,
tandis que les lignes sont arrondies individuellement. Second point : le texte attribue
269 € au fait d'éteindre les environnements « 14 heures par jour », alors que ce calcul donne
272 € et que l'étiquette du script mentionne « la nuit **et le week-end** ». Aucune conclusion
n'est inversée et tous les pourcentages tiennent. P2, fix CP8.

**Un faux positif écarté par lecture** : le schéma réseau du mini-exercice de
`cloud-networking` contredit celui de son exemple guidé (`10.0.2.0/24` public au lieu de
privé). Vérification faite : le premier est **délibérément défectueux** — présenté comme
« livré par un prestataire », l'apprenant doit y trouver cinq défauts classés par gravité.

### Constat structurel : D13 et l'étagère de référence

| | n | avec une section « Vérification de compréhension » | D13 moyen |
|---|---:|---:|---:|
| leçons **hors parcours** | 9 | **0 (0 %)** | **4,00** |
| leçons **programmées** | 103 | 50 (49 %) | 4,36 |

Aucune des neuf leçons hors parcours lues n'a de contrôle de compréhension distinct. C'est le
premier facteur explicatif du point bas de D13, et c'est cohérent avec leur statut : ce sont
des leçons de consultation, pas de parcours. **À trancher au CP15** — soit on l'assume et on
le déclare, soit D13 doit devenir NA pour l'étagère de référence, ce qui ne peut pas se
décider maintenant sans modifier le barème gelé.

Contrôle que ma notation D13 n'est pas mécanique : parmi les 37 leçons à D13 = 5, **31** ont
la section (6 l'obtiennent sans) ; parmi les 75 à D13 = 4, **19** l'ont quand même.

### Lot 15 — Kubernetes, IaC, stratégies de déploiement

Huit leçons hors parcours, **aucun défaut**, toutes à 4,93 — le plafond mécanique de l'étagère
de référence, D13 = 4 faute de contrôle de compréhension distinct (voir le constat structurel
ci-dessus). Le contenu, lui, est de premier ordre.

**Vérification §31 close pour tout le corpus.** Les 16 dernières leçons ont été passées en
revue : `iac-fundamentals`, `k8s-troubleshooting` et `k8s-why-architecture` déclarent leurs
repères « non exécutés » ; `deployment-strategies`, `linux-services-systemd`,
`linux-ssh-remote`, `release-incident-recovery` et `responsive-design` citent un script
exécuté ; les sept restantes (quatre k8s, trois Next.js) ne publient **aucune** mesure — elles
traitent de manifestes YAML, de réglages (`initialDelaySeconds: 60` est une *consigne*, pas un
relevé) et de prémisses de scénario. **Aucune leçon du corpus ne prétend valider Kubernetes,
un cloud réel ou systemd depuis un environnement qui ne le permet pas.**

Trois passages à retenir pour le CP15 :

- **`k8s-workloads`** confirme le choix qu'en faisait déjà le document du CP2. Elle refuse
  d'emblée le tableau de correspondance « qui se retient en trente secondes et ne sert à rien
  parce qu'il suppose la question déjà résolue », et dit **trois fois non** à son propre
  catalogue d'objets : la correction n'est pas de changer de workload, ni même de déplacer
  l'état, mais de sortir le travail de l'application. Un cours qui refuse trois fois sa propre
  nomenclature enseigne à décider, pas à nommer.
- **`deployment-strategies`** produit le corollaire chiffré le plus utile du lot : 1 % du
  trafic pendant trois heures fait **21 600** requêtes en erreur, davantage que la bascule
  globale détectée en six minutes (**72 000** → mais sur six minutes seulement). Donc **un
  canari non observé est pire qu'une bascule globale observée**, et *investir dans la détection
  rapporte plus que raffiner le pourcentage*. Les quatre chiffres sont recalculés exacts.
- **`k8s-config-probes`** applique à Kubernetes le principe exact de `monitoring-production` —
  une sonde de vivacité ne doit dépendre d'aucune dépendance externe — et montre la
  configuration de surveillance **provoquant la panne qu'elle est censée détecter**. La
  cohérence entre domaines éloignés du corpus est réelle, pas déclarative.
