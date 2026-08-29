# V69 — Registre des leçons (LESSON LEDGER)

Une ligne par leçon du corpus. Les 40 leçons du périmètre V69 d'abord, les 88
intouchées ensuite. Colonnes : profondeur de l'exemple guidé avant → après (mots),
défaut principal constaté au CP0, action V69, mode de preuve, et action suivante.

**Médiane du périmètre : 84 mots à l'entrée → 752 mots à la sortie.**
**Total ajouté : 26 252 mots d'exemple guidé.** Les 88 autres leçons sont
inchangées : c'est déclaré, pas caché.

---

## A. Les 40 leçons du périmètre V69

| # | leçon | domaine | avant | après | décis. | var. | défaut principal (CP0) | preuve | action suivante |
|---|---|---|---:|---:|---:|:--:|---|---|---|
| 1 | `agents-fundamentals` | LLM/RAG | 86 | **718** | 4 | ✓ | demandait de comparer « avec des chiffres » sans en donner | arithmétique de coût | varier la forme (V70) |
| 2 | `ai-security` | Systèmes/sécu | 86 | **756** | 3 | ✓ | exemple en double avec prompt-injection-defense | simulation de filtrage | varier la forme (V70) |
| 3 | `algorithmic-thinking` | Fondations | 56 | **683** | 3 | ✓ | exemple de 56 mots | raisonnement | varier la forme (V70) |
| 4 | `api-design-basics` | Web/backend | 71 | **704** | 0 | ✓ | exemple = croquis de forme, 0 décision | raisonnement | étiqueter ou assumer la forme libre (V70) |
| 5 | `async-javascript` | Fondations | 82 | **586** | 3 | ✓ | exemple de 50 mots, gabarit Énoncé/Raisonnement | raisonnement | varier la forme (V70) |
| 6 | `authentication` | Web/backend | 111 | **752** | 3 | ✓ | gabarit Énoncé/Raisonnement ; IDOR nommé mais jamais montré ; « lente » sans ordre de grandeur | node:crypto (434k SHA-256/s vs 22 scrypt/s) | varier la forme (V70) |
| 7 | `browser-dom-rendering` | Frontend | 83 | **818** | 3 | ✓ | exemple sans décision ; innerHTML jamais démontré | Chromium | varier la forme (V70) |
| 8 | `clean-code` | Fondations | 81 | **757** | 0 | ✓ | exemple de 13 mots | raisonnement | étiqueter ou assumer la forme libre (V70) |
| 9 | `data-structures-intro` | Fondations | 56 | **696** | 3 | ✓ | exemple de 56 mots | raisonnement | varier la forme (V70) |
| 10 | `database-modeling` | Web/backend | 117 | **802** | 3 | ✓ | la « variante » posait la vraie question et la laissait sans réponse | node:sqlite | varier la forme (V70) |
| 11 | `design-patterns-intro` | Fondations | 68 | **617** | 3 | ✓ | exemple de 16 mots | raisonnement | varier la forme (V70) |
| 12 | `docker-containers` | Systèmes/sécu | 70 | **773** | 4 | ✓ | exemple de 3 lignes | NON VÉRIFIÉ — démon absent | varier la forme (V70) |
| 13 | `docker-images-layers` | Systèmes/sécu | 64 | **778** | 4 | ✓ | recette en 4 étapes ; apt-get clean non traité | NON VÉRIFIÉ — démon absent | varier la forme (V70) |
| 14 | `embeddings` | LLM/RAG | 84 | **754** | 4 | ✓ | gabarit Énoncé/Raisonnement ; seuils jamais discutés | numpy | varier la forme (V70) |
| 15 | `error-handling` | Web/backend | 100 | **764** | 0 | ✓ | gabarit Énoncé/Raisonnement ; budget de retry jamais chiffré | simulation en temps virtuel | étiqueter ou assumer la forme libre (V70) |
| 16 | `express-backend` | Web/backend | 143 | **886** | 0 | ✓ | gabarit Énoncé/Raisonnement ; règle async d'Express 4 donnée comme universelle | express 4.22.2 et 5.2.1 | étiqueter ou assumer la forme libre (V70) |
| 17 | `feature-engineering` | Données/ML | 73 | **655** | 3 | ✓ | gabarit Énoncé/Raisonnement ; encodage par la cible non traité | pandas + scikit-learn | varier la forme (V70) |
| 18 | `git-advanced` | Fondations | 101 | **615** | 3 | ✓ | exemple de 64 mots, aucune décision | raisonnement | varier la forme (V70) |
| 19 | `html-semantic-structure` | Frontend | 118 | **816** | 3 | ✓ | bénéfices sémantiques affirmés, jamais mesurés | Chromium + Playwright | varier la forme (V70) |
| 20 | `http-rest-json` | Web/backend | 49 | **780** | 3 | ✓ | exemple de 15 mots (une commande curl commentée) | raisonnement | varier la forme (V70) |
| 21 | `linux-processes-signals` | Systèmes/sécu | 64 | **872** | 3 | ✓ | recette en 5 étapes ; « sinon kill -9 » sans diagnostic | processus réels (143/137) | varier la forme (V70) |
| 22 | `llm-fundamentals` | LLM/RAG | 65 | **606** | 3 | ✓ | exemple juste mais sans conséquence d'ingénierie | arithmétique de coût (tarifs illustratifs) | varier la forme (V70) |
| 23 | `machine-learning-basics` | Données/ML | 92 | **781** | 3 | ✓ | squelette annoté ; fuite jamais démontrée | scikit-learn | varier la forme (V70) |
| 24 | `model-evaluation` | Données/ML | 69 | **728** | 3 | ✓ | gabarit Énoncé/Raisonnement ; « privilégier le rappel » sans prix | numpy | varier la forme (V70) |
| 25 | `networking-tcp-ip-model` | Systèmes/sécu | 72 | **748** | 4 | ✓ | recette en 4 étapes ; refus contre timeout absent | sockets TCP locaux | varier la forme (V70) |
| 26 | `neural-networks` | Données/ML | 115 | **641** | 4 | ✓ | gabarit Énoncé/Raisonnement ; zero_grad nommé jamais montré | descente de gradient écrite à la main | varier la forme (V70) |
| 27 | `pandas-data-wrangling` | Données/ML | 63 | **724** | 4 | ✓ | gabarit Énoncé/Raisonnement ; suppose des données propres | pandas 3.0.5 | varier la forme (V70) |
| 28 | `prompt-engineering` | LLM/RAG | 111 | **784** | 4 | ✓ | gabarit Énoncé/Raisonnement ; défense JSON.parse insuffisante | JSON.parse sur 9 sorties | varier la forme (V70) |
| 29 | `prompt-injection-defense` | Systèmes/sécu | 122 | **894** | 4 | ✓ | gabarit Énoncé/Raisonnement ; défenses listées, jamais mises en échec | vérificateur de citations exécuté | varier la forme (V70) |
| 30 | `rag-fundamentals` | LLM/RAG | 71 | **739** | 4 | ✓ | diagnostic binaire bon, chunking absent | découpage exécuté | varier la forme (V70) |
| 31 | `react-application-states` | Frontend | 132 | **705** | 3 | ✓ | reducer donné sans motivation | raisonnement | varier la forme (V70) |
| 32 | `react-fundamentals` | Frontend | 100 | **777** | 3 | ✓ | gabarit Énoncé/Raisonnement ; key={index} nommé jamais montré | Chromium + React 18 | varier la forme (V70) |
| 33 | `react-hooks-effects` | Frontend | 104 | **927** | 3 | ✓ | gabarit Énoncé/Raisonnement ; la course donnée comme résolue d'avance | Chromium + React 18 | varier la forme (V70) |
| 34 | `recursion` | Fondations | 79 | **634** | 3 | ✓ | exemple de 50 mots, explication en 6 puces | raisonnement | varier la forme (V70) |
| 35 | `sql-foundations` | Web/backend | 55 | **837** | 3 | ✓ | exemple de 60 mots ; produit cartésien local absent | node:sqlite | varier la forme (V70) |
| 36 | `statistics-for-ml` | Données/ML | 61 | **718** | 4 | ✓ | exemple de 80 mots ; Simpson absent | numpy | varier la forme (V70) |
| 37 | `structured-outputs-tools` | LLM/RAG | 87 | **677** | 4 | ✓ | gabarit Énoncé/Raisonnement ; frontière de confiance implicite | raisonnement | varier la forme (V70) |
| 38 | `testing-foundations` | Fondations | 84 | **666** | 3 | ✓ | exemple de 29 mots | raisonnement | varier la forme (V70) |
| 39 | `transformers` | LLM/RAG | 109 | **725** | 4 | ✓ | attention racontée, jamais calculée | numpy | varier la forme (V70) |
| 40 | `web-forms-validation` | Frontend | 99 | **812** | 4 | ✓ | validation native affirmée, jamais mesurée | Chromium | varier la forme (V70) |

### Lecture de la colonne « décis. »

Elle compte des unités de décision **étiquetées**. Quatre leçons y figurent à 0 —
`api-design-basics`, `clean-code`, `error-handling`, `express-backend` — parce
qu'elles n'étiquettent pas leurs décisions : elles les portent sous forme de
questions du consommateur, de passes successives ou d'étapes d'enquête. Vérifié par
lecture : chacune pèse trois à quatre décisions réelles. **Un 0 ici n'est pas un
verdict de superficialité**, c'est la limite déclarée de la sonde
(`scripts/v69-mesure.mjs`).

---

## B. Les 88 leçons intouchées

Aucune n'a été modifiée par V69. Elles sont listées pour que l'écart soit visible
plutôt que sous-entendu.

| leçon | mots de l'exemple | décis. | état |
|---|---:|---:|---|
| `readme-documentation` | 16 | 0 | sous le standard |
| `k8s-workloads` | 31 | 0 | sous le standard |
| `cloud-compute-storage` | 39 | 0 | sous le standard |
| `cloud-fundamentals` | 45 | 0 | sous le standard |
| `iac-fundamentals` | 45 | 0 | sous le standard |
| `docker-build-dockerfile` | 47 | 0 | sous le standard |
| `k8s-troubleshooting` | 47 | 0 | sous le standard |
| `k8s-why-architecture` | 50 | 0 | sous le standard |
| `cloud-azure-core` | 51 | 0 | sous le standard |
| `ci-cd-quality-gates-artifacts` | 52 | 0 | sous le standard |
| `cloud-finops` | 52 | 0 | sous le standard |
| `docker-production-hardening` | 52 | 0 | sous le standard |
| `docker-compose` | 54 | 0 | sous le standard |
| `release-incident-recovery` | 54 | 0 | sous le standard |
| `ci-cd-pipeline-anatomy` | 55 | 0 | sous le standard |
| `cloud-aws-core` | 55 | 0 | sous le standard |
| `k8s-security` | 55 | 0 | sous le standard |
| `deployment-strategies` | 57 | 0 | sous le standard |
| `cloud-networking` | 58 | 0 | sous le standard |
| `docker-networking-volumes` | 58 | 0 | sous le standard |
| `k8s-networking-services` | 59 | 0 | sous le standard |
| `linux-services-systemd` | 59 | 0 | sous le standard |
| `logging-structured` | 62 | 0 | sous le standard |
| `networking-dns` | 62 | 0 | sous le standard |
| `networking-http-tls` | 63 | 0 | sous le standard |
| `k8s-config-probes` | 65 | 0 | sous le standard |
| `distributed-tracing` | 67 | 0 | sous le standard |
| `networking-proxy-loadbalancing` | 68 | 0 | sous le standard |
| `slo-error-budget` | 69 | 0 | sous le standard |
| `vector-databases` | 71 | 0 | sous le standard |
| `chunking-strategies` | 72 | 0 | sous le standard |
| `incident-response` | 72 | 0 | sous le standard |
| `postmortem-rca` | 73 | 0 | sous le standard |
| `python-foundations` | 73 | 0 | sous le standard |
| `ci-cd` | 74 | 0 | sous le standard |
| `react-accessibility` | 74 | 0 | sous le standard |
| `resilience-patterns` | 74 | 0 | sous le standard |
| `retrieval-reranking` | 75 | 0 | sous le standard |
| `linux-resources-io` | 76 | 0 | sous le standard |
| `data-cleaning-quality` | 81 | 0 | sous le standard |
| `react-composition-architecture` | 81 | 0 | sous le standard |
| `linux-filesystem-permissions` | 82 | 0 | sous le standard |
| `ai-evaluation` | 83 | 0 | sous le standard |
| `observability-logging` | 83 | 0 | sous le standard |
| `architecture-basics` | 85 | 0 | sous le standard |
| `monitoring-production` | 87 | 0 | sous le standard |
| `nextjs-rendering` | 88 | 0 | sous le standard |
| `technical-documentation` | 88 | 0 | sous le standard |
| `networking-addressing-routing` | 89 | 0 | sous le standard |
| `css-fundamentals` | 94 | 0 | sous le standard |
| `nextjs-foundations` | 94 | 0 | sous le standard |
| `breaking-changes-compatibility` | 95 | 0 | sous le standard |
| `async-messaging-queues` | 96 | 0 | sous le standard |
| `distributed-systems-failures` | 97 | 0 | sous le standard |
| `technical-debt` | 97 | 0 | sous le standard |
| `technical-storytelling` | 97 | 0 | sous le standard |
| `observability-fundamentals` | 98 | 0 | sous le standard |
| `scikit-learn-workflow` | 98 | 0 | sous le standard |
| `nextjs-server-client-components` | 100 | 0 | sous le standard |
| `agent-workflows-orchestration` | 101 | 0 | sous le standard |
| `api-production-contracts` | 101 | 0 | sous le standard |
| `database-transactions-concurrency` | 101 | 0 | sous le standard |
| `etl-pipelines` | 102 | 0 | sous le standard |
| `responsive-design` | 102 | 0 | sous le standard |
| `llm-cost-optimization` | 104 | 0 | sous le standard |
| `css-flexbox` | 105 | 0 | sous le standard |
| `deployment-secrets` | 105 | 0 | sous le standard |
| `frontend-testing` | 105 | 0 | sous le standard |
| `nextjs-data-production` | 107 | 0 | sous le standard |
| `interview-preparation` | 108 | 0 | sous le standard |
| `sql-performance-indexing` | 110 | 0 | sous le standard |
| `portfolio-github` | 111 | 0 | sous le standard |
| `refactoring-legacy-code` | 112 | 0 | sous le standard |
| `llm-observability` | 113 | 0 | sous le standard |
| `rag-evaluation` | 116 | 0 | sous le standard |
| `system-design-interview` | 116 | 0 | sous le standard |
| `caching-performance` | 119 | 0 | sous le standard |
| `database-migrations` | 120 | 0 | proche du standard |
| `system-design-scaling` | 120 | 0 | proche du standard |
| `css-grid` | 121 | 0 | proche du standard |
| `frontend-performance` | 125 | 0 | proche du standard |
| `typescript-frontend` | 131 | 0 | proche du standard |
| `linux-ssh-remote` | 212 | 0 | proche du standard |
| `typescript-basics` | 284 | 0 | proche du standard |
| `javascript-basics` | 321 | 0 | proche du standard |
| `git-fundamentals` | 333 | 0 | proche du standard |
| `terminal-shell-filesystem` | 338 | 0 | proche du standard |
| `metrics-percentiles` | 452 | 0 | proche du standard |

**77 des 88 leçons intouchées ont un exemple guidé sous 120 mots**, contre 0 sur
les 40 réécrites. C'est le chantier de V70, et il est chiffré ici pour qu'on ne
puisse pas le sous-estimer.
