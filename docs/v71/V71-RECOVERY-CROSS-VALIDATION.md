# V71 — Récupération et contre-analyse indépendante

> **Nature de ce document.** Il ne fait pas partie du fil principal de V71. Il est produit
> par une **session de récupération** qui s'est révélée être un *doublon* d'une session
> maître déjà active. Cette session s'est retirée. Le document conserve ce que la
> récupération a établi et ce que la contre-analyse a trouvé, pour que rien ne soit perdu et
> que le CP15 puisse s'en servir.
>
> **Il ne modifie aucun résultat de la session maître.** Ni `LEDGER-128.json`, ni le corpus,
> ni `progress.json`, ni la branche canonique.
>
> Date : 2026-09-05. Session : `session_019zQXUb46ibcFeAj9sCwHJd` (web).
> Session maître : `session_016jUM3XheXFWaaSE4HEPB1n` (Android).

---

## 1. Contexte de récupération

La session V71 précédente s'est arrêtée pendant le **lot 7** du CP3, par épuisement de la
limite d'usage. La reprise automatique du conteneur a ensuite échoué **avant** le démarrage
de Claude Code, avec :

> « The requested branch or commit was not found in the repository **Fourat23/Ai-career-os** »

**Cause exacte.** Le dépôt n'existe pas sous ce nom. L'orthographe réelle est
**`Fourat23/Ai-carreer-os`** — avec **deux `r`** à « carreer ». La reprise cherchait
`Ai-career-os` (un seul `r`). Ce n'était donc **ni une perte de branche, ni une perte de
commit** : juste un nom de dépôt erroné dans la relance. La branche V71 était intacte.

| | |
|---|---|
| dépôt réellement correct | `Fourat23/Ai-carreer-os` |
| nom erroné recherché par la reprise | `Fourat23/Ai-career-os` |
| branche V71 canonique retrouvée | `claude/ai-career-os-saas-phfg49` — **présente sur origin** |
| branche de démarrage de cette session | `claude/resume-sprint-v71-cp3-vv5fak` (son homologue distant a été supprimé, élagué au `fetch --prune`) |

**État de la session maître constaté.** Pendant que cette session menait son forensic, une
autre session — lancée depuis l'application Android, `status: RUNNING`, `task_summary: "lot 7
audit in progress"` — poussait activement sur la même branche. Preuve par les commits
apparus sur origin **au cours de cette session** :

| commit | contenu | vu à |
|---|---|---|
| `aebbdaa` | lot 5/16 — état au démarrage de cette session | début |
| `44747e5` | reprise après perte de conteneur + enquête prérequis (D2 appliqué) | +22 min |
| `cde0206` | lot 6/16 — observabilité, SLO, cache, dette, Python, portfolio → **48/128** | +22 min |
| `d5ebfcc` | lot 7/16 — frontend (DOM, React, formulaires, TS, perf, HTML) → **56/128** | +23 min |

Le ledger à `d5ebfcc` contient **56 entrées notées**. La session maître avait donc déjà
récupéré *et dépassé* le point de reprise, en refaisant le lot 6 perdu puis le lot 7.

**Pourquoi il ne fallait surtout pas poursuivre en parallèle.** `LEDGER-128.json` est un
fichier unique, réécrit intégralement à chaque lot. Deux agents qui l'alimentent en même
temps produisent, au mieux, des conflits à chaque lot ; au pire, deux ledgers divergents et
un bilan CP15 ininterprétable — sans compter les 128 lectures faites deux fois. Le
`git push` de cette session a d'ailleurs été **rejeté** (non fast-forward), ce qui a révélé
la collision. Aucun contournement n'a été tenté.

---

## 2. État Git observé

| | |
|---|---|
| repository | `Fourat23/Ai-carreer-os` |
| remote | `https://github.com/Fourat23/Ai-carreer-os` |
| branche canonique | `claude/ai-career-os-saas-phfg49` |
| HEAD canonique à l'arrivée | `aebbdaa482b17bf523851a28932779413ac112d8` |
| HEAD canonique à la sortie | `d5ebfcc09bfc967ea4c9c14bed0da07b4d5d70bd` (session maître) |
| local == origin à l'arrivée | oui (`aebbdaa` des deux côtés) |
| working tree | propre (0 fichier modifié) à l'arrivée comme à la sortie |
| stash | vide |
| profondeur du clone | **superficiel** (`git rev-parse --is-shallow-repository` → `true`, greffé à `7130f29`, `depth 50`) |

**Limitations de récupération rencontrées.**

1. **Clone neuf et superficiel.** Rien de l'ancien conteneur n'a survécu : `git reflog --all`
   ne contient que la création locale des branches, et `git fsck --lost-found` retourne
   **zéro objet pendant**. Aucune récupération d'objet non poussé n'était possible.
2. **`node_modules` vide** à l'arrivée. Les premiers passages de portes échouaient donc
   faussement (`marked` introuvable ; 1297 tests au lieu de 1420). Après `npm ci`, les quatre
   portes sont vertes : `tsc --noEmit` 0 · `gates:active` 0 · `npm test` **1420/1420** ·
   `npm run build` 0 — chiffre de tests identique à celui du CP0.
3. **Empreinte agrégée du corpus non reproductible.** La recette de concaténation derrière
   `edbfecdff1d3e4c320cedd51ede95601fd94750d` n'existait que dans une commande ad hoc de la
   session perdue ; cinq compositions plausibles ont été testées, aucune ne retombe dessus.
   La vérification **par leçon** a été faite à la place, et elle est strictement plus forte :
   la méthode (SHA-1 du contenu brut) est confirmée par `data/program.json`
   = `5ac3da30…`, identique au CP0.

---

## 3. Checkpoints réellement récupérés

Tous vérifiés par existence de l'objet Git (`git cat-file -t`) et non par le résumé de reprise.

| CP | état | commit | preuve |
|---|---|---|---|
| CP0 | **terminé** | `1fb8ea6` | objet présent · `docs/audits/V71-CP0-AUDIT.md`, `SNAPSHOT-CP0.json`, `mesures-cp0.json` |
| CP1 | **terminé** | `5472c2c` | objet présent · `V71-ACADEMIC-CONTRACT-FROZEN.md` (14 dimensions, ancres 0→5, seuils S1→S12) |
| CP2 | **terminé** | `b3e4592` | objet présent · `V71-STANDARD-HUMAIN.md` |
| CP3 | **en cours** | — | ledger alimenté par lots |

### Lots CP3 réellement présents au moment de la récupération

| lot | commit annoncé avant la panne | réalité vérifiée |
|---|---|---|
| 1/16 | `b3c9489` | **présent** |
| 2/16 | `2440c0b` | **présent** (+ `b36a9c5`, mise à jour d'état, non annoncée) |
| 3/16 | `237ded7` | **présent** |
| 4/16 | `6d79aa0` | **présent** |
| 5/16 | « annoncé poussé », sans SHA | **présent** = `aebbdaa`, c'était le HEAD |
| 6/16 | `8045888` | **ABSENT — objet inexistant** |

**Dernier lot réellement prouvé : lot 5/16.**
**Leçons réellement notées D1→D14 au point de récupération : 40 / 128.**

Contrôle matériel du ledger à `aebbdaa` : **40 entrées**, toutes avec `lu: "oui"` et un
tableau `D` de **14 notes valides** (1→5), **0 doublon**, et les 40 slugs correspondant
exactement aux 40 premiers de `ordre-lecture.json` — donc **aucun trou**. Dernière leçon
sauvegardée : `metrics-percentiles` (rang 40). Prochaine leçon : `monitoring-production`
(rang 41).

Le résumé de reprise annonçait **48/128** avec le commit `8045888`. Cet objet n'existe ni
dans les refs, ni dans le reflog, ni parmi les objets pendants, ni sur origin. Le point
réellement récupérable était donc **40**, pas 48 — conformément à la règle « ne crois pas le
résumé, prouve l'état ». **Aucune note n'a été reconstruite à partir d'un message de
console.** La session maître est parvenue au même constat indépendamment et a refait le
lot 6.

---

## 4. Données perdues / non récupérables

| donnée | statut | détail |
|---|---|---|
| commit `8045888` (lot 6) | **perdu** | objet inexistant partout ; jamais poussé |
| les 8 notations du lot 6 | **reconstruit indépendamment** | par la session maître, commit `cde0206` — par **relecture**, pas par récupération |
| `PREREQUIS-ORDRE.md` (1re version) | **perdu** | jamais commité ; **reconstruit indépendamment** deux fois (session maître `44747e5`, et cette contre-analyse) |
| liste des 31 candidats prérequis | **récupérable** | entièrement **reproductible** par sonde depuis le corpus intact ; retrouvée à l'identique (31) par les deux sessions |
| `data/progress.json` | **non nécessaire** | **gitignoré** (`.gitignore:8` — « progression locale personnelle, ne pas versionner »). Absent d'un clone neuf par construction. Ce n'est **pas** une donnée V71 : c'est la progression personnelle de l'apprenant, pas du contenu pédagogique. Le CP0 en avait mesuré l'empreinte depuis le conteneur d'alors. |
| empreinte agrégée du corpus | **non nécessaire** | remplacée par la vérification par leçon, plus forte (§2, limitation 3) |
| corpus des 128 leçons | **intact** | **128/128 byte-identiques** au `SNAPSHOT-CP0.json` — 0 modifiée, 0 manquante |
| CP0, CP1, CP2 | **récupérés** | intégralement, objets et fichiers |

**Perte nette réelle : 8 lectures (lot 6) et une analyse de prérequis** — toutes deux
refaites depuis. Aucune perte irréversible.

---

## 5. Validation croisée indépendante des prérequis

C'est l'apport principal de ce document : **deux lectures indépendantes du même problème**,
menées sans communication, à partir du même corpus intact.

### 5.1 Origine

Anomalie repérée pendant le lot 7 (session perdue) : `react-application-states` cite
`react-composition-architecture` comme prérequis, alors que cette leçon est enseignée plus
tard dans le parcours.

### 5.2 Méthode de cette contre-analyse

**Génération (outil).** Extraction de la section `## 🧩 Prérequis` des 128 leçons, puis de
tous les liens `/doc/lessons/<slug>`. Un couple (leçon → prérequis) devient *candidat* quand
le premier jour d'enseignement du prérequis est postérieur à celui de la leçon, d'après
`docs/v71/ordre-lecture.json` (artefact gelé au CP0).

**Résultat : 31 candidats** — nombre **identique** à celui de la session perdue et à celui de
la session maître, obtenu indépendamment. C'est la première convergence.

**Classement (lecture).** L'outil ne classe rien. Les 31 phrases citantes ont été **lues** une
par une. Conformément au §1 du contrat gelé, une sonde ne note pas.

**Limite déclarée, importante pour le CP15.** Le champ `j1` de `ordre-lecture.json` est le
**premier jour du parcours dont la compétence correspond à la leçon** : sa granularité est le
groupe de compétence, **pas la leçon** — 64 valeurs distinctes pour 128 leçons
(`git-advanced`, `git-fundamentals` et `terminal-shell-filesystem` partagent `day-001`).
C'est un indicateur de *première rencontre*, pas un calendrier par leçon. Deux tentatives de
reconstruction d'un calendrier plus fin (par compétence, puis par les champs `lessons:` des
`scripts/data/days-*.mjs`) ont donné des résultats **contradictoires entre eux** et avec
`ordre-lecture.json` — donc aucune n'a été retenue, et le mapping des 365 journées n'a **pas**
été modifié (§10 du contrat l'interdit). `j1` sert à *repérer* les candidats ; la décision
vient de la formulation lue.

### 5.3 Convention de classification du §7 du brief V71

| classe | définition (§7) |
|---|---|
| **A** | vrai prérequis réellement nécessaire avant → **défaut d'ordre** |
| **B** | anticipation explicitement annoncée |
| **C** | lien « pour aller plus loin » |
| **D** | référence contextuelle non bloquante |

Le §7 précise : « **Ne compte comme défaut d'ordre que A.** »

### 5.4 Résultat de cette contre-analyse

**candidats : 31 · A : 20 · B : 3 · C : 2 · D : 6 · vrais défauts : 20**

Le marqueur discriminant est la présence d'une formulation d'**exigence** (« Tu dois… »,
« Vous devez… », « car… ») portant sur un concept dont la leçon-source arrive plus tard,
**sans aucun signalement**.

Les 20 défauts (classe A du §7) :

| # | leçon (j1) | prérequis exigé (j1) | écart |
|---|---|---|---|
| 1 | `design-patterns-intro` (38) | `clean-code` (40) | +2 j |
| 2 | `readme-documentation` (47) | `technical-documentation` (74) | +27 j |
| 3 | `interview-preparation` (48) | `technical-storytelling` (66) | +18 j |
| 4 | `interview-preparation` (48) | `system-design-interview` (71) | +23 j |
| 5 | `express-backend` (52) | `error-handling` (54) | +2 j |
| 6 | `technical-storytelling` (66) | `portfolio-github` (83) | +17 j |
| 7 | `technical-documentation` (74) | `breaking-changes-compatibility` (76) | +2 j |
| 8 | `caching-performance` (80) | `sql-performance-indexing` (135) | +55 j |
| 9 | `react-application-states` (95) | `react-composition-architecture` (104) | +9 j — *anomalie d'origine* |
| 10 | `web-forms-validation` (96) | `html-semantic-structure` (103) | +7 j |
| 11 | `frontend-performance` (102) | `react-composition-architecture` (104) | +2 j |
| 12 | `scikit-learn-workflow` (155) | `model-evaluation` (157) | +2 j |
| 13 | `scikit-learn-workflow` (155) | `feature-engineering` (169) | +14 j |
| 14 | `transformers` (183) | `embeddings` (218) | +35 j |
| 15 | `llm-cost-optimization` (197) | `rag-fundamentals` (218) | +21 j |
| 16 | `rag-evaluation` (218) | `ai-evaluation` (253) | +35 j |
| 17 | `ai-security` (260) | `agents-fundamentals` (274) | +14 j |
| 18 | `prompt-injection-defense` (260) | `agents-fundamentals` (274) | +14 j |
| 19 | `async-messaging-queues` (290) | `resilience-patterns` (331) | +41 j |
| 20 | `ci-cd-pipeline-anatomy` (307) | `docker-images-layers` (320) | +13 j |

Cas considérés **corrects** (11) : classe B — `authentication` → `ai-security`
(« viendra plus loin »), `breaking-changes-compatibility` → `database-migrations`
(« programmée au mois 5 »), `prompt-engineering` → `ai-evaluation` ; classe C —
`api-design-basics` → `breaking-changes-compatibility` (« éclaire »),
`data-cleaning-quality` → `feature-engineering` (« éclairent ») ; classe D —
`async-javascript`, `architecture-basics`, `api-production-contracts`,
`technical-storytelling` → `technical-documentation`, `monitoring-production`,
`agent-workflows-orchestration`.

Cas **borderline** : voir §7.

### 5.5 Convergence avec la session maître

Comparaison des notes D2 attribuées, sur les leçons que les deux sessions avaient lues :

| | accord |
|---|---|
| leçons dégradées à **D2 = 1** | **6 / 6** — `design-patterns-intro`, `express-backend`, `interview-preparation`, `readme-documentation`, `technical-documentation`, `technical-storytelling` |
| leçons ramenées à **D2 = 4** | **4 / 4** — `api-design-basics`, `api-production-contracts`, `architecture-basics`, `authentication` |
| leçons où cette contre-analyse dégradait et la maître non | **aucune** |
| écart restant | la maître ajoute `caching-performance` à D2 = 1 — leçon de rang 45, **non encore lue** par cette session, mais **déjà classée A** ici (n° 8 ci-dessus) : accord de fond complet |

Sur l'ensemble des 31 candidats, les deux lectures identifient **20 défauts communs** sur
22 « exigences » recensées par la maître : accord sur **20 / 22**, deux divergences traitées
au §7.

**Pourquoi cette convergence renforce la confiance.** Les deux lectures ont été faites sans
aucune communication, par deux agents distincts, sur deux conteneurs distincts, avec deux
scripts de détection écrits séparément — et elles désignent **les mêmes leçons**. Un accord
de 6/6 et 4/4 sur les dégradations, et de 20/22 sur les exigences, n'est pas attribuable à
une sonde partagée : les sondes ne produisaient que la liste des 31 candidats, identique
parce que déterministe. Le classement, lui, venait de la lecture. Le diagnostic « il existe
une vingtaine de défauts réels d'ordre des prérequis » peut donc être considéré comme
**solidement établi**, et non comme l'artefact d'une seule interprétation.

### 5.6 Constat commun sur la notation D2 des lots 1 à 5

Les 40 leçons notées avant l'incident avaient **toutes** reçu `D2 = 5` — distribution
`{5: 40}`, **sans aucune variance**. La condition « le prérequis renvoie-t-il vers une leçon
postérieure ? » n'avait pas été contrôlée systématiquement avant la découverte de l'anomalie
au lot 7. **Les deux sessions l'ont détecté indépendamment et ont corrigé à la baisse**, ce
qui est le comportement attendu d'un audit honnête. Distribution D2 de la session maître à
`d5ebfcc` (56 leçons) : `{1: 10, 4: 7, 5: 39}`.

---

## 6. Inversion de convention A / B — à corriger au CP15

**Divergence de forme, pas de fond.** Les deux documents utilisent les lettres A et B dans
des sens **opposés**.

| | classe A | classe B |
|---|---|---|
| **§7 du brief V71** (convention officielle) | **vrai défaut** de prérequis (forward-reference problématique) | comportement correct / référence future explicitement assumée |
| **`PREREQUIS-ORDRE.md` de la session maître** | « **le comportement correct**, déjà présent dans le corpus » (9 cas) | « les dix-sept **défauts** » (17 cas) |

Le document de la maître écrit explicitement : « **Seule la classe B est un défaut sérieux.
La classe A est le comportement correct et sert de modèle opposable.** » C'est exactement
l'inverse du §7, qui dit « **Ne compte comme défaut d'ordre que A** ».

Sa taxonomie est par ailleurs à **trois** classes, avec un axe supplémentaire utile — l'écart
en jours :

- A = correctement signalé (9) — non-défaut ;
- B = exigence, écart ≥ 7 jours (17) — défaut sérieux ;
- C = exigence, écart de 2 jours (5) — mineur.

**Les décisions de fond ne sont pas remises en cause** : elles portent sur les bonnes leçons,
et les notes D2 appliquées au ledger sont cohérentes avec ces décisions. **Seuls les labels
sont inversés.**

> **Action CP15.** Utiliser la **convention officielle du §7** (A = défaut) dans le rapport
> final, et retranscrire les classes de la maître dans cette convention avant toute synthèse.
> Sans cela, le rapport dira « classe A = défaut » dans une section et « classe A = correct »
> dans une autre : **incohérent et illisible**. La distinction par écart en jours de la
> maître mérite en revanche d'être **conservée**, car elle hiérarchise utilement les 20 à 22
> défauts (un écart de 2 jours et un écart de 57 jours ne coûtent pas la même chose à
> l'apprenant).

---

## 7. Cas borderline — divergences de notation indépendantes

Trois leçons ont reçu **D2 = 4** de la session maître et **D2 = 5** de cette contre-analyse.
La divergence porte sur la frontière entre deux ancres gelées :

> **5** — « … et **tout autre concept employé est construit dans la leçon**. »
> **4** — « un concept non enseigné apparaît, mais il est **explicitement signalé comme
> périphérique**. »

Quand une leçon signale le concept **et** en rappelle l'essentiel sur place, les deux ancres
peuvent se réclamer du texte. Aucune fusion n'est imposée ici.

### 7.1 `monitoring-production` → `llm-observability` (+246 j)

- **session maître : D2 = 4** — classée « correctement signalé ».
- **contre-analyse : D2 = 5.**
- **Texte déclencheur :** « une idée de la dérive et du coût par requête
  (`/doc/lessons/llm-observability`) est **utile mais rappelée ici** ».
- **Interprétation :** « rappelée ici » affirme que la notion est *construite dans la leçon*,
  ce qui est la condition littérale de l'ancre 5, et non seulement un signalement de
  périphérie (ancre 4).
- **Recommandation CP15 :** cas le plus favorable à la note 5 des trois. Vérifier dans le
  corps de la leçon que le rappel annoncé est **effectivement présent** ; s'il l'est, 5 est
  justifié, sinon 4.

### 7.2 `async-javascript` → `http-rest-json` (+46 j)

- **session maître : D2 = 4.**
- **contre-analyse : D2 = 5.**
- **Texte déclencheur :** « Une **intuition** de ce qu'est un appel réseau
  **(client → serveur → réponse)** aide ».
- **Interprétation :** l'intuition requise est livrée dans la parenthèse même — trois mots qui
  suffisent au propos de la leçon (fournir « la suite à exécuter quand ce sera prêt »). Le
  concept employé est donc construit sur place.
- **Recommandation CP15 :** trancher selon un critère explicite — *la glose en ligne
  suffit-elle au passage qui l'utilise ?* Ici, plausiblement oui.

### 7.3 `breaking-changes-compatibility` → `database-migrations` (+63 j)

- **session maître : D2 = 4.**
- **contre-analyse : D2 = 5.**
- **Texte déclencheur :** « La migration de schéma (`/doc/lessons/database-migrations`,
  **programmée au mois 5**) est une **application voisine** de la même idée. »
- **Interprétation :** la phrase n'exige rien — elle qualifie la leçon citée d'« application
  voisine » et **datent** sa venue. Rien dans la leçon ne suppose qu'elle a été lue. La même
  leçon porte par ailleurs un encadré « Étagère de référence » exemplaire pour
  `deployment-strategies`.
- **Recommandation CP15 :** noter que ce cas n'est pas une dépendance mais une **mise en
  relation**, et se demander si l'ancre 4 doit s'appliquer à un concept qui n'est pas
  « employé » par la leçon.

**Impact agrégé.** Trois notes de 5 → 4 sur la seule dimension D2. Cela ne change aucun
verdict par leçon, mais D2 est la dimension la plus dégradée du corpus après cette enquête,
et le seuil **S2 exige une moyenne ≥ 3,70 pour *chaque* dimension**. Le CP15 devra donc
publier la moyenne D2 avec la convention retenue **explicitement déclarée**.

---

## 8. Divergences et accords entre les deux lectures

| sujet | session maître | contre-analyse | accord ? | impact |
|---|---|---|---|---|
| nombre de candidats détectés | 31 | 31 | **oui** | aucun — sonde déterministe, convergence attendue mais rassurante |
| dernier lot réellement prouvé au moment de la panne | lot 5 (40/128) | lot 5 (40/128) | **oui** | aucun — le `8045888` annoncé est inexistant des deux points de vue |
| état du corpus | intact | **128/128** byte-identiques au snapshot CP0 | **oui** | aucun — base commune fiable |
| existence de vrais défauts d'ordre | oui, 17 sérieux + 5 mineurs = 22 exigences | oui, 20 | **oui, sur le fond** | 20/22 communs ; diagnostic solide |
| notes **D2 = 1** appliquées | 6 communes (+ `caching-performance`, non lue ici mais classée A ici) | 6 | **oui, 6/6** | aucun |
| notes **D2 = 4** appliquées | 4 communes + 3 borderline | 4 | **oui, 4/4** | aucun sur les 4 |
| cas borderline `async-javascript`, `breaking-changes-compatibility`, `monitoring-production` | D2 = 4 | D2 = 5 | **non** | 3 notes sur D2 ; à afficher au CP15 (§7) |
| `agent-workflows-orchestration` → `resilience-patterns` | exigence (défaut, +57 j) | classe D, « viennent de » = attribution de source | **non** | 1 défaut ; **la lecture de la maître est défendable** : « viennent de » présente bien la notion comme acquise sans dire qu'elle ne l'est pas encore |
| `prompt-engineering` → `ai-evaluation` | exigence (défaut, +56 j) | classe B, anticipation annoncée | **non** | 1 défaut ; **la lecture de la maître est la meilleure** : le « formalisées juste après » ne couvre que `structured-outputs-tools` ; pour `ai-evaluation` il n'y a que « s'appuie sur », sans annonce. **Cette contre-analyse se rétracte sur ce point.** |
| convention des lettres A / B | A = correct, B = défaut | A = défaut (§7) | **non** | **forme uniquement** ; à unifier au CP15 (§6) |
| hiérarchisation par écart en jours | oui (≥ 7 j vs 2 j) | signalée sans en faire une classe | complémentaire | **à conserver** : apport réel de la maître |
| prérequis vers l'étagère de référence | 6/6 correctement signalés ; 34 citations écartées car partant de leçons hors parcours | 6/6 correctement signalés, traitement jugé **exemplaire** | **oui** | aucun défaut ; modèle de rédaction pour corriger les 20 |
| moment des corrections | — | différées au **CP11** (« passe corrections + prérequis ») | — | ne pas corriger pendant le CP3, qui lit et note |

**Bilan des divergences de fond : deux**, toutes deux sur un seul candidat chacune, et dans
les deux cas la lecture de la session maître est au moins aussi défendable que celle-ci —
franchement meilleure pour `prompt-engineering`. **Aucune divergence ne va dans le sens d'un
corpus meilleur que ce que la maître a mesuré.**

---

## 9. Intégrité

Vérifié sur la branche de ce handoff, au moment du commit :

| contrôle | résultat |
|---|---|
| corpus des 128 leçons | **non modifié** — 128/128 byte-identiques au `SNAPSHOT-CP0.json` (0 modifiée, 0 manquante) |
| `data/progress.json` | **non modifié** — gitignoré, absent du dépôt par construction ; jamais créé ni touché |
| `docs/v71/LEDGER-128.json` | **non modifié** — identique à `d5ebfcc` (56 entrées, celui de la session maître) |
| `docs/v71/V71-STATE.md` | **non modifié** — identique à `d5ebfcc` |
| `docs/v71/PREREQUIS-ORDRE.md` | **non modifié** — celui de la session maître, conservé tel quel |
| merge | **aucun** |
| cherry-pick | **aucun** |
| reset | **aucun** |
| force-push | **aucun** |
| suppression de ref | **aucune** |
| branche canonique `claude/ai-career-os-saas-phfg49` | **non modifiée sur origin** — le seul `push` tenté a été **rejeté** (non fast-forward) et n'a pas été forcé |
| poursuite du CP3 | **aucune** — aucune leçon relue, aucun lot refait, aucun CP4+ entamé |
| verdict global V71 | **aucun** — non produit, ce n'est pas le rôle de ce document |

**Note de transparence.** Avant que la collision ne soit détectée, cette session avait
produit un commit local `dfb6b53` qui modifiait `LEDGER-128.json`, `V71-STATE.md` et créait
sa propre version de `PREREQUIS-ORDRE.md`. **Ce commit n'a jamais atteint origin** (push
rejeté). Il n'est **pas** exporté par ce handoff : seuls ses *résultats analytiques* ont été
recopiés dans le présent document, en prose. Il reste consultable localement sur la ref
`v71-sauvegarde-analyse-locale` tant que ce conteneur vit, et disparaîtra avec lui — c'est
voulu, pour qu'aucune version concurrente du ledger ne subsiste. La branche locale
`claude/ai-career-os-saas-phfg49` de ce conteneur porte donc un commit d'avance non poussé
et **ne doit pas être poussée**.

---

## 10. Points à intégrer au CP15

1. **Utiliser la convention A/B officielle du §7** (A = défaut d'ordre, B = anticipation
   annoncée). Retranscrire les classes de `PREREQUIS-ORDRE.md` — qui les emploie en sens
   inverse — **avant** toute synthèse, sinon le rapport final se contredira d'une section à
   l'autre. Conserver en revanche la hiérarchisation par écart en jours, qui est un apport
   réel.
2. **Traiter la convergence indépendante comme une preuve forte.** Deux lectures sans
   communication, sur deux conteneurs, avec deux scripts distincts : **6/6** d'accord sur les
   leçons dégradées à D2 = 1, **4/4** sur celles ramenées à 4, **20/22** sur les exigences.
   Le diagnostic des défauts d'ordre des prérequis n'est pas l'artefact d'une interprétation
   unique.
3. **Afficher explicitement les trois cas borderline** (`async-javascript`,
   `breaking-changes-compatibility`, `monitoring-production`) avec les deux notes, le texte
   déclencheur et le critère retenu — d'autant que **S2 impose une moyenne ≥ 3,70 sur D2**,
   dimension la plus dégradée par cette enquête.
4. **Ne pas attribuer à la session maître les analyses issues de cette contre-analyse**, ni
   l'inverse. Les deux corpus de résultats ont des auteurs distincts et des méthodes
   partiellement différentes.
5. **Conserver les deux lectures séparées dans le rapport avant toute synthèse.** Leur valeur
   probante vient précisément de leur indépendance : les fusionner d'emblée détruirait
   l'argument de convergence.
6. **Mentionner l'incident de session lui-même** dans le récit du CP15 : la cause réelle de
   l'échec de reprise était un **nom de dépôt erroné** (`Ai-career-os` au lieu de
   `Ai-carreer-os`), pas une perte de données. La perte nette a été de **8 lectures**, toutes
   refaites. C'est un fait utile pour juger la robustesse du dispositif V71, et il justifie la
   règle « commit + push après chaque lot de 8 ».
7. **Rappeler la limite de `j1`** (granularité par groupe de compétence, 64 valeurs pour 128
   leçons) partout où le rapport parle d'ordre du parcours. Les écarts en jours sont des
   ordres de grandeur de première rencontre, pas des dates par leçon.
