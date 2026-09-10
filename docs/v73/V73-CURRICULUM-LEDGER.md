# V73 — Registre du curriculum : statut des 128 leçons

> **Règle I5 du contrat gelé** : « toute leçon a un statut ». **Aucune zone grise** — pas une
> seule leçon dont on ne sache pas quand elle sert.

Le classement est **dérivé de propriétés déclarées**, jamais d'une impression :
programmée ou non (liens des 365 journées générées) · compétence portée (`lessons-map.mjs`) ·
exigée par une leçon du noyau (section « Prérequis », citation **non annoncée**) · supposée par
un livrable (journée de projet) · ancrée depuis le parcours (citée par une leçon programmée).
Instrument rejouable : `scripts/v73/cp4-statuts.mjs`.

**Un statut n'est pas un jugement de valeur.** `ADVANCED` ne veut pas dire « meilleure », et
une leçon non programmée n'est pas une leçon faible : le CP0 a lu huit leçons intégralement,
dont **quatre hors parcours**, et les a trouvées excellentes.

---

## 1. Répartition

| statut | n | ce que cela veut dire |
|---|---|---|
| **CORE** | **116** | programmée, porte une compétence déclarée, et sert un livrable ou une leçon du noyau |
| **ADVANCED** | **7** | approfondissement d'une compétence déclarée, **ancré** depuis au moins une leçon programmée |
| **OPTIONAL** | **5** | programmée et lue, mais **aucun livrable ni leçon du noyau ne la suppose** |
| **REFERENCE** | **0** | non programmée, consultation seule |
| **DEPRECATED** | **0** | redondante ou hors stratégie |
| **ZONE GRISE** | **0** | interdite par I5 |

**Aucune leçon n'est dépréciée.** Le brief l'interdisait comme solution de facilité, et la
mesure ne désigne aucune redondance : les 128 leçons couvrent 128 sujets distincts.

---

## 2. Les sept leçons ADVANCED — non programmées, mais jamais orphelines

| leçon | domaine | compétences | ancrée depuis |
|---|---|---|---|
| `deployment-strategies` | CI/CD & livraison | cloud, archi | `breaking-changes-compatibility`, `ci-cd-pipeline-anatomy`, `ci-cd-quality-gates-artifacts`, `database-migrations`, `incident-response`, `postmortem-rca` |
| `k8s-networking-services` | Kubernetes | cloud, archi | `k8s-why-architecture`, `k8s-workloads` |
| `k8s-security` | Kubernetes | secu, cloud | `k8s-config-probes` |
| `k8s-troubleshooting` | Kubernetes | cloud, archi | `k8s-config-probes` |
| `linux-services-systemd` | Systèmes & Linux | gitlinux, cloud | `linux-processes-signals` |
| `linux-ssh-remote` | Systèmes & Linux | gitlinux, secu | `linux-processes-signals` |
| `release-incident-recovery` | CI/CD & livraison | cloud, archi | `incident-response`, `postmortem-rca` |

**Deux ancres ont dû être ajoutées au CP4**, parce que `k8s-security` et `linux-ssh-remote`
n'étaient citées par **aucune** leçon programmée — exactement la zone grise que la règle I5
interdit. Les pointeurs sont posés dans la section « Liens avec le programme » des leçons
programmées les plus proches, avec la mention explicite qu'elles ne sont programmées par
aucune journée :

- `k8s-config-probes` (j321) → `k8s-security` : « les limites et les sondes protègent le
  voisinage ; elles ne disent rien de **qui a le droit de faire quoi** dans le cluster » ;
- `linux-processes-signals` (j72) → `linux-ssh-remote` : « tout ce qui précède suppose que tu
  es déjà **sur** la machine ».

---

## 3. Les cinq leçons OPTIONAL — un résultat qui mérite d'être lu

| leçon | journée | compétences | pourquoi OPTIONAL |
|---|---|---|---|
| `monitoring-production` | j79 | cloud, archi | enseignée une fois, jamais révisée, et aucun livrable ne l'exige |
| `nextjs-foundations` | j99 | jsts | enseignée une fois, jamais révisée, et aucun livrable ne l'exige |
| `nextjs-rendering` | j102 | jsts, archi | enseignée une fois, jamais révisée, et aucun livrable ne l'exige |
| `nextjs-server-client-components` | j104 | jsts, archi | enseignée une fois, jamais révisée, et aucun livrable ne l'exige |
| `nextjs-data-production` | j111 | jsts, archi | enseignée une fois, jamais révisée, et aucun livrable ne l'exige |

**Ce que ce résultat dit, et il n'est pas confortable.** Quatre des cinq sont les leçons
Next.js **que le CP3 vient d'insérer**. Elles sont désormais enseignées — le trou P0 est
bien fermé — mais **aucun projet des 365 journées ne demande de construire avec Next.js**.
Le parcours produit avec React et Express ; Next.js s'y lit, ne s'y pratique pas.

La cinquième, `monitoring-production`, est enseignée au **jour 79** et **plus jamais reprise** :
elle n'entre même pas dans la revue de sa propre semaine, dont le plafond de sept leçons est
déjà atteint.

**Ces cinq cas ne sont pas corrigés ici, et c'est délibéré.** Forcer un livrable Next.js
voudrait dire réécrire un projet existant pour justifier un statut — c'est-à-dire déplacer le
produit pour satisfaire une métrique, ce que le §7 anti-Goodhart interdit. Le fait est
**publié**, et le CP11 (pratique et transfert) puis le CP8 (espacement) sont les checkpoints
où il se traite, s'il doit l'être.

---

## 4. Les 128 leçons, par domaine

`j` = journées de travail qui la programment · `rev` = journées de revue · `prat` = artefacts
de pratique déclarés

### CI/CD & livraison — 4 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `ci-cd-pipeline-anatomy` | CORE | 307 | 1 | 5 | cloud, se |
| `ci-cd-quality-gates-artifacts` | CORE | 326 | 1 | 4 | cloud, se |
| `deployment-strategies` | ADVANCED | — | — | 4 | cloud, archi |
| `release-incident-recovery` | ADVANCED | — | — | 4 | cloud, archi |

### Cloud, AWS, Azure & IaC — 7 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `cloud-fundamentals` | CORE | 291 | 1 | 4 | cloud, archi |
| `cloud-compute-storage` | CORE | 293 | 1 | 5 | cloud, archi |
| `cloud-networking` | CORE | 293 | 1 | 5 | cloud, secu |
| `cloud-aws-core` | CORE | 303 | 1 | 5 | cloud, secu |
| `cloud-azure-core` | CORE | 303 | 1 | 3 | cloud, secu |
| `cloud-finops` | CORE | 325 | 1 | 4 | cloud, archi |
| `iac-fundamentals` | CORE | 326 | 1 | 4 | cloud, archi |

### Conteneurs & Docker — 5 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `docker-build-dockerfile` | CORE | 320 | 1 | 3 | cloud, secu |
| `docker-compose` | CORE | 320 | 1 | 2 | cloud, archi |
| `docker-images-layers` | CORE | 320 | 1 | 3 | cloud |
| `docker-networking-volumes` | CORE | 320 | 1 | 1 | cloud, archi |
| `docker-production-hardening` | CORE | 320 | — | 4 | cloud, secu |

### Data & SQL — 8 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `sql-foundations` | CORE | 55, 57, 61, 64, 135, 137 | 2 | 5 | sql |
| `database-modeling` | CORE | 57, 58, 60, 62, 131, 134… | 2 | 2 | sql |
| `pandas-data-wrangling` | CORE | 127, 128, 129, 130, 131, 145 | 1 | 2 | python, sql |
| `data-cleaning-quality` | CORE | 128, 132, 143, 152 | 1 | 2 | python, sql |
| `sql-performance-indexing` | CORE | 135 | 1 | 6 | sql, archi |
| `database-transactions-concurrency` | CORE | 136 | 1 | 2 | sql, se |
| `etl-pipelines` | CORE | 138, 139, 141, 142 | 1 | 1 | python, sql |
| `database-migrations` | CORE | 139 | 1 | 1 | sql, se |

### Fondations — 9 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `git-advanced` | CORE | 1, 2, 3, 18, 73 | 2 | — | gitlinux |
| `git-fundamentals` | CORE | 1, 2, 3, 18, 73 | 2 | 2 | gitlinux |
| `terminal-shell-filesystem` | CORE | 1, 2, 3, 18, 72 | 2 | 1 | gitlinux |
| `async-javascript` | CORE | 4, 5, 6, 8, 9, 10… | 7 | 3 | jsts |
| `javascript-basics` | CORE | 4, 5, 6, 8, 9, 10… | 7 | 4 | jsts |
| `typescript-basics` | CORE | 4, 5, 6, 8, 9, 10… | 7 | 4 | jsts |
| `algorithmic-thinking` | CORE | 15, 16, 17, 19, 20, 25… | 8 | 6 | algo |
| `recursion` | CORE | 15, 16, 17, 19, 20, 25… | 4 | — | algo |
| `data-structures-intro` | CORE | 30, 31, 33, 34 | 1 | 6 | ds |

### Frontend & React — 12 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `browser-dom-rendering` | CORE | 87 | 1 | 5 | jsts |
| `react-fundamentals` | CORE | 87, 89, 92, 94, 99, 100… | — | 6 | jsts |
| `react-hooks-effects` | CORE | 88, 89, 93, 95, 96, 102… | — | 5 | jsts |
| `react-application-states` | CORE | 95 | 1 | 4 | jsts, archi |
| `nextjs-foundations` | OPTIONAL | 99 | — | — | jsts |
| `frontend-performance` | CORE | 102 | 1 | 2 | jsts, archi |
| `nextjs-rendering` | OPTIONAL | 102 | — | 1 | jsts, archi |
| `react-accessibility` | CORE | 103 | 1 | 5 | jsts |
| `nextjs-server-client-components` | OPTIONAL | 104 | — | — | jsts, archi |
| `react-composition-architecture` | CORE | 104 | 1 | 4 | jsts, archi |
| `frontend-testing` | CORE | 107 | 1 | 4 | jsts, se |
| `nextjs-data-production` | OPTIONAL | 111 | — | 1 | jsts, archi |

### Frontend : Web Platform — 7 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `css-fundamentals` | CORE | 87 | — | 4 | jsts |
| `html-semantic-structure` | CORE | 87, 103 | 1 | 3 | jsts |
| `web-forms-validation` | CORE | 96 | 1 | 2 | jsts |
| `typescript-frontend` | CORE | 97 | 1 | 4 | jsts |
| `css-flexbox` | CORE | 103 | — | 2 | jsts |
| `css-grid` | CORE | 103 | — | 3 | jsts, archi |
| `responsive-design` | CORE | 117 | — | 1 | jsts |

### IA appliquée — 15 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `llm-cost-optimization` | CORE | 197, 198, 199, 200, 201, 202… | 3 | 1 | llm, cloud |
| `llm-fundamentals` | CORE | 197, 198, 199, 200, 201, 202… | 3 | 1 | llm |
| `prompt-engineering` | CORE | 197, 198, 199, 200, 201, 202… | 3 | 1 | llm |
| `structured-outputs-tools` | CORE | 197, 198, 199, 200, 201, 202… | 6 | 1 | llm, agents |
| `chunking-strategies` | CORE | 218, 219, 220, 221, 222, 223… | 6 | 1 | rag |
| `embeddings` | CORE | 218, 219, 220, 221, 222, 223… | 6 | 1 | rag, dl |
| `rag-evaluation` | CORE | 218, 219, 220, 221, 222, 223… | 8 | 1 | evalia, rag |
| `rag-fundamentals` | CORE | 218, 219, 220, 221, 222, 223… | 6 | 1 | rag |
| `retrieval-reranking` | CORE | 218, 219, 220, 221, 222, 223… | 6 | 2 | rag |
| `vector-databases` | CORE | 218, 219, 220, 221, 222, 223… | 6 | 1 | rag |
| `ai-evaluation` | CORE | 253, 254, 255, 256, 257, 258… | 2 | 1 | evalia |
| `ai-security` | CORE | 260, 261, 262, 263, 264, 265… | 3 | 1 | secu |
| `prompt-injection-defense` | CORE | 260, 261, 262, 263, 264, 265… | 3 | 2 | secu |
| `agent-workflows-orchestration` | CORE | 274, 275, 276, 277, 278, 279… | 3 | 4 | agents |
| `agents-fundamentals` | CORE | 274, 275, 276, 277, 278, 279… | 3 | 2 | agents |

### Kubernetes — 6 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `k8s-config-probes` | CORE | 321 | 1 | 5 | cloud, secu |
| `k8s-why-architecture` | CORE | 321 | 1 | 3 | cloud, archi |
| `k8s-workloads` | CORE | 321 | 1 | 5 | cloud, archi |
| `k8s-networking-services` | ADVANCED | — | — | 4 | cloud, archi |
| `k8s-security` | ADVANCED | — | — | 3 | secu, cloud |
| `k8s-troubleshooting` | ADVANCED | — | — | 6 | cloud, archi |

### Observabilité, SRE & fiabilité — 8 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `distributed-tracing` | CORE | 79, 297 | 2 | 1 | archi, cloud |
| `logging-structured` | CORE | 79 | 1 | 1 | archi, secu |
| `metrics-percentiles` | CORE | 79, 297 | 2 | 3 | archi, cloud |
| `observability-fundamentals` | CORE | 79 | 1 | 3 | archi, cloud |
| `slo-error-budget` | CORE | 79 | 1 | 2 | archi, cloud |
| `resilience-patterns` | CORE | 331 | 1 | 6 | archi, cloud |
| `incident-response` | CORE | 332 | 1 | 5 | archi, cloud |
| `postmortem-rca` | CORE | 332 | 1 | 3 | archi, comm |

### Portfolio & carrière — 5 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `readme-documentation` | CORE | 47, 66, 74, 118, 146, 337… | 4 | — | comm |
| `interview-preparation` | CORE | 48, 83, 86, 90, 337, 338… | 3 | — | comm |
| `technical-storytelling` | CORE | 66, 74, 86, 337, 338, 339… | 4 | — | comm |
| `system-design-interview` | CORE | 71, 81, 288, 289, 290, 291… | 4 | — | archi, comm |
| `portfolio-github` | CORE | 83, 86, 90, 337, 338, 339… | 4 | — | comm |

### Production & DevOps — 5 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `deployment-secrets` | CORE | 68 | — | — | cloud, secu |
| `monitoring-production` | OPTIONAL | 79 | — | — | cloud, archi |
| `docker-containers` | CORE | 291, 320 | 1 | 3 | cloud |
| `ci-cd` | CORE | 307, 326 | — | — | cloud |
| `llm-observability` | CORE | 325, 332 | — | 2 | cloud, llm |

### Python & ML — 8 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `python-foundations` | CORE | 82, 120, 121, 122, 123, 125 | 2 | 6 | python |
| `statistics-for-ml` | CORE | 148, 149, 150, 151, 152, 153… | 5 | 1 | ml |
| `machine-learning-basics` | CORE | 155, 156, 159, 163, 164, 166… | 4 | 1 | ml |
| `scikit-learn-workflow` | CORE | 155, 157, 170, 171, 174, 176… | 4 | 2 | ml, python |
| `model-evaluation` | CORE | 157, 158, 160, 162, 165, 166… | 6 | 3 | ml, evalia |
| `feature-engineering` | CORE | 169, 170, 178, 181 | 2 | 2 | ml |
| `neural-networks` | CORE | 183, 184, 185, 186, 187, 188… | 2 | 2 | dl |
| `transformers` | CORE | 183, 184, 185, 186, 187, 188… | 2 | 1 | dl, llm |

### Réseau — 5 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `networking-addressing-routing` | CORE | 71 | — | 3 | cloud, archi |
| `networking-dns` | CORE | 71 | 1 | 3 | http, cloud |
| `networking-http-tls` | CORE | 71 | — | 5 | http, secu |
| `networking-tcp-ip-model` | CORE | 71 | 1 | 2 | http, archi |
| `networking-proxy-loadbalancing` | CORE | 78 | 1 | 2 | archi, cloud |

### Software engineering & architecture — 13 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `design-patterns-intro` | CORE | 38, 39, 76 | 1 | — | patterns |
| `clean-code` | CORE | 40, 41, 43, 45, 46, 69… | 6 | 2 | se |
| `testing-foundations` | CORE | 41, 47, 59, 65, 69, 106… | 6 | 5 | se |
| `architecture-basics` | CORE | 44, 47, 53, 60, 69, 75… | 1 | 1 | archi |
| `error-handling` | CORE | 54, 67, 97, 111, 122 | 4 | 3 | se |
| `refactoring-legacy-code` | CORE | 69 | 1 | 2 | se |
| `technical-documentation` | CORE | 74 | 1 | 2 | se, comm |
| `breaking-changes-compatibility` | CORE | 76 | 1 | 3 | se |
| `observability-logging` | CORE | 79, 85 | — | — | archi, cloud |
| `technical-debt` | CORE | 81 | 1 | 1 | se |
| `async-messaging-queues` | CORE | 290 | 1 | 6 | archi, se |
| `distributed-systems-failures` | CORE | 291 | 1 | 5 | archi |
| `system-design-scaling` | CORE | 291 | 1 | 6 | archi |

### Systèmes & Linux — 5 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `linux-filesystem-permissions` | CORE | 72 | 1 | 1 | gitlinux, secu |
| `linux-processes-signals` | CORE | 72 | 1 | 3 | gitlinux |
| `linux-resources-io` | CORE | 72 | 1 | 3 | gitlinux, archi |
| `linux-services-systemd` | ADVANCED | — | — | 1 | gitlinux, cloud |
| `linux-ssh-remote` | ADVANCED | — | — | 1 | gitlinux, secu |

### Web & backend — 6 leçons

| leçon | statut | j | rev | prat | compétences |
|---|---|---|---|---|---|
| `http-rest-json` | CORE | 50, 51, 59, 71 | 3 | 4 | http |
| `api-design-basics` | CORE | 51, 54, 60, 61, 64, 67… | 3 | 3 | http |
| `api-production-contracts` | CORE | 51 | 1 | 7 | http, se |
| `express-backend` | CORE | 52, 53, 61, 62, 65 | 3 | 3 | http, se |
| `authentication` | CORE | 67, 68, 85, 260, 261, 262… | 3 | 2 | secu, http |
| `caching-performance` | CORE | 80, 85, 102, 288, 289, 290… | 1 | 3 | archi, se |

---

## 5. Ce que le CP4 a modifié

**Deux leçons**, et uniquement pour poser les deux ancres manquantes : `k8s-config-probes` et
`linux-processes-signals` reçoivent chacune un paragraphe « Pour aller plus loin » qui nomme
la leçon ADVANCED correspondante **et dit qu'elle n'est programmée par aucune journée**.

**Aucune leçon n'a été intégrée au parcours au CP4**, et aucune n'a été retirée. Les sept
ADVANCED restent hors des 365 journées : le brief interdisait de les intégrer par principe,
et aucune ne satisfait la condition d'entrée du contrat.
