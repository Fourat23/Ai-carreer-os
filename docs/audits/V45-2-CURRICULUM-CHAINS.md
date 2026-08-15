# V45.2 — Chaînes curriculaires (audit de cohérence des parcours)

> **Contrat V45.2** : « V45.2 ne certifie jamais une leçon parce qu'elle
> ressemble à une bonne leçon. Il la certifie uniquement après lecture intégrale
> et preuves positives. »
>
> Ce document est un audit **read-only**. Aucune leçon, aucun ordre, aucun
> fichier de curriculum n'a été modifié. Toute anomalie devient une entrée de
> **backlog** (voir `V45-2-ACADEMIC-DEBT.md` à CP14), jamais une correction.

## Méthode

Après lecture intégrale des **128/128 leçons** (ledger
`V45-2-LESSON-LEDGER.json`, 128 verdicts A/CERTIFIED, 4/4 tests d'intégrité
verts), on regroupe le corpus en **17 chaînes** pédagogiques. Pour chacune :

- **Point de départ** : première leçon et prérequis réellement supposés.
- **Prérequis honnêtes** : ce qu'il faut savoir AVANT (déclaré vs réel).
- **Progression / niveau final** : jusqu'où la chaîne mène (L1→L3).
- **Trous** : notions manquantes ou sous-traitées **pour le contenu**.
- **Duplications** : recouvrements réels entre leçons.
- **Transfert possible** : ce qu'un apprenant peut réellement FAIRE ensuite
  — en distinguant **Barre A** (comprendre/raisonner, prose du corpus) de
  **Barre B** (produire du code exécutable pour la compétence).

> **Rappel des deux barres (établi V45/V45.1, confirmé V45.2).**
> La **Barre A** (qualité de la prose, modèles mentaux, raisonnement) est
> **uniformément forte** : 128/128 A. La **Barre B** (pratique en code
> exécutable) n'est réellement outillée que pour ~8 compétences sur 20 : le
> socle logiciel (JS/TS, algo, Git, backend, SQL, tests, clean-code). Pour
> ML/IA/cloud/Linux/K8s, la pratique est surtout **conceptuelle ou simulée**.
> Cette dette est **hors note académique** (rubrique : la note juge le CONTENU,
> pas la dette de pratique de plateforme) mais **centrale pour le transfert**.

---

## Chaîne 01 — Fondations (terminal, algo, structures de données)

- **Leçons** : 001 terminal-shell-filesystem · 004 algorithmic-thinking ·
  005 recursion · 006 data-structures-intro.
- **Point de départ** : `terminal-shell-filesystem` (L1) — part de zéro (ouvrir
  un terminal, `cd`/`ls`/`pwd`). Prérequis réel : aucun. **Honnête.**
- **Progression** : L1→L2. Pensée algorithmique (complexité, fenêtre glissante),
  récursion (cas de base, pile), structures (tableau/objet/Map/Set) avec le
  critère de choix par coût d'opération.
- **Trous** : pas de tri/graphes avancés (hors cible AI Engineer — acceptable) ;
  la Big-O reste intuitive (pas de preuve formelle — cohérent avec le niveau).
- **Duplications** : aucune.
- **Transfert** : **A forte, B forte.** Un néophyte peut raisonner coût/structure
  et coder les exercices `algo/ds`. Fondation saine pour tout le reste.

## Chaîne 02 — JavaScript / TypeScript

- **Leçons** : 003 javascript-basics · 008 async-javascript · 007
  typescript-basics · 022 typescript-frontend.
- **Point de départ** : `javascript-basics` (L1). Prérequis : terminal + un
  éditeur. **Honnête** (analogie photocopie/Google-Doc pour valeur vs référence).
- **Progression** : L1→L2. Valeurs/références, async (event loop, promesses,
  `await`), types (inférence, unions, `type guard` `isUser`), TS côté front.
- **Trous** : pas de générics avancés ni de types conditionnels (hors cible).
- **Duplications** : `typescript-basics` et `typescript-frontend` se partagent
  les bases mais l'angle diffère (langage vs usage React/DOM) — **non
  problématique**.
- **Transfert** : **A forte, B forte.** Socle exécutable réel (exos `jsts`).

## Chaîne 03 — Web Platform (HTML/CSS/responsive/forms)

- **Leçons** : 016 html-semantic-structure · 017 css-fundamentals · 018
  css-flexbox · 019 css-grid · 020 responsive-design · 021 web-forms-validation.
- **Point de départ** : `html-semantic-structure` (L1). Prérequis : aucun.
- **Progression** : L1→L2. Sémantique, cascade/spécificité (`#envoyer` navy),
  flexbox (contre-exemple `margin-left:auto` vs `200px`), grid
  (`auto-fill`/`minmax`), mobile-first (1→2→3 colonnes), formulaires
  (`aria-describedby`).
- **Trous** : animations/transitions CSS peu traitées (cosmétique, acceptable).
- **Duplications** : aucune (chaque leçon a un rôle distinct).
- **Transfert** : **A forte, B moyenne.** L'apprenant comprend et lit tout ; la
  production est validée surtout par revue visuelle, moins par tests exécutables.

## Chaîne 04 — React / Frontend

- **Leçons** : 023 browser-dom-rendering · 024 react-fundamentals · 025
  react-hooks-effects · 026 react-composition-architecture · 027
  react-application-states · 028 react-accessibility · 029 frontend-testing ·
  030 frontend-performance · 031→034 Next.js (foundations/rendering/
  server-client-components/data-production).
- **Point de départ** : `browser-dom-rendering` (L1) → React (L2). Prérequis :
  JS/TS + Web Platform. **Honnête** (state-THEN-DOM, cleanup d'effet stale).
- **Progression** : L1→L3. Jusqu'aux server components et data-fetching Next.js
  en production (SSG/SSR/CSR par page).
- **Trous** : gestion d'état globale tierce (Redux/Zustand) non couverte —
  volontaire (hooks + composition suffisent au niveau). **À noter en backlog
  comme choix, pas comme manque.**
- **Duplications** : `nextjs-rendering` et `nextjs-server-client-components` se
  chevauchent légèrement sur le rendu — **frontière défendable**.
- **Transfert** : **A forte, B moyenne-forte** (frontend-testing outille des
  tests réels ; le reste s'appuie sur projets).

## Chaîne 05 — Backend / API

- **Leçons** : 010 http-rest-json · 011 api-design-basics · 012 express-backend ·
  013 authentication · 014 caching-performance · 015 api-production-contracts.
- **Point de départ** : `http-rest-json` (L1). Prérequis : JS/async. **Honnête.**
- **Progression** : L1→L3. REST, design d'API, Express, auth (bcrypt slow-hash),
  cache (N+1 = 51 requêtes ; LRU 800ms→<1ms), contrats de production
  (idempotency-key).
- **Trous** : GraphQL non couvert (hors cible, acceptable) ; pagination/
  rate-limiting effleurés côté API (approfondis en réseau/résilience).
- **Duplications** : aucune interne. Recouvrement inter-chaînes avec
  `resilience-patterns` (rate limiting) — **complémentaire**.
- **Transfert** : **A forte, B forte.** Exos backend exécutables réels.

## Chaîne 06 — SQL / Data

- **Leçons** : 035 sql-foundations · 036 database-modeling · 037
  sql-performance-indexing · 038 database-transactions-concurrency · 039
  database-migrations · 040 pandas-data-wrangling · 041 data-cleaning-quality ·
  042 etl-pipelines.
- **Point de départ** : `sql-foundations` (L1). Prérequis : aucun côté SQL.
- **Progression** : L1→L3. Jusqu'aux `EXPLAIN` (SEQ→INDEX SCAN), `FOR UPDATE`
  (last-seat), migrations expand/contract, puis pandas/ETL.
- **Trous** : NoSQL en modélisation peu traité (vu plus tard côté cloud
  DynamoDB/Cosmos) — **à consigner** ; le passage SQL→pandas est un léger saut
  de contexte (relationnel → dataframe).
- **Duplications** : expand/contract apparaît ici (039) ET en
  deployment-strategies (104) ET postmortem (085) — **répétition volontaire et
  bénéfique** (spirale), pas un doublon à supprimer.
- **Transfert** : **A forte ; B forte pour SQL, B moyenne pour pandas**
  (`pandas-data-wrangling` = MINOR_FIX : excellent mais la pratique pandas
  exécutable est plus mince que la pratique SQL/JS).

## Chaîne 07 — Git & versioning

- **Leçons** : 002 git-fundamentals · 009 git-advanced.
- **Point de départ** : `git-fundamentals` (L1). Prérequis : terminal.
  **Honnête** (`add -p`, staging expliqué comme photo intermédiaire).
- **Progression** : L1→L3. Jusqu'au rebase, résolution de conflits, discipline
  de branches.
- **Trous** : chaîne courte (2 leçons) mais **suffisante** ; Git est réutilisé
  transversalement (portfolio, CI/CD, secrets → audit d'historique).
- **Duplications** : aucune.
- **Transfert** : **A forte, B forte.** Pratique réelle dès le jour 6 (push).

## Chaîne 08 — Linux & systèmes

- **Leçons** : 087 linux-filesystem-permissions · 088 linux-processes-signals ·
  089 linux-services-systemd · 090 linux-resources-io · 091 linux-ssh-remote.
- **Point de départ** : `linux-filesystem-permissions` (L2). Prérequis déclaré :
  terminal (chaîne 01). **Honnête et explicite.**
- **Progression** : L2→L3. Permissions (rwx, octal, `x`=traverser), processus/
  signaux (SIGTERM vs KILL, port 3000), systemd (enable vs start, journalctl),
  ressources (load/cœurs, `wa`, OOM killer), SSH (clés ed25519, tunnel `-L`).
- **Trous** : **B faible** — pas d'environnement Linux exécutable dans la
  plateforme ; l'apprenant lit des commandes justes mais ne les exécute pas
  in-situ. **Dette de pratique majeure à consigner (P1).**
- **Duplications** : OOM killer ↔ OOMKilled (K8s/Docker) : **pont voulu**,
  pas un doublon.
- **Transfert** : **A forte, B faible.** Compréhension solide, geste non outillé.

## Chaîne 09 — Réseau

- **Leçons** : 092 networking-tcp-ip-model · 093 networking-addressing-routing ·
  094 networking-dns · 095 networking-http-tls · 096
  networking-proxy-loadbalancing.
- **Point de départ** : `networking-tcp-ip-model` (L1). Prérequis : aucun.
- **Progression** : L1→L3. Diagnostic par couches, CIDR (`/16`>`/24`), DNS
  (TTL/cache), HTTP/TLS (4xx/5xx, « TLS ≠ honnêteté »), proxy/LB L4-L7.
- **Trous** : **B faible** (pas d'exécution `dig`/`curl` en plateforme, mais
  gestes réalistes et cas métier concrets).
- **Duplications** : le modèle « privé + NAT » réapparaît en cloud-networking —
  **transfert voulu**.
- **Transfert** : **A forte, B faible-moyenne.** Excellente base mentale pour
  cloud/K8s.

## Chaîne 10 — Software engineering & architecture

- **Leçons** : 043 clean-code · 044 testing-foundations · 045 error-handling ·
  046 design-patterns-intro · 047 architecture-basics · 048
  async-messaging-queues · 049 system-design-scaling · 050
  distributed-systems-failures · 051 refactoring-legacy-code · 052
  technical-debt · 053 breaking-changes-compatibility · 054
  technical-documentation · 055 observability-logging.
- **Point de départ** : `clean-code` (L1). Prérequis : JS/TS. **Honnête.**
- **Progression** : L1→L3. Tests, erreurs, patterns (Factory/Strategy
  Notifieur), 3 architectures, files/retry-storm/DLQ, dette = coût×fréquence,
  refactoring 2-chapeaux, expand/contract d'API.
- **Trous** : chaîne dense et longue (13 leçons) ; risque de charge cognitive
  cumulée mais chaque leçon reste autonome.
- **Duplications** : `observability-logging` (055) recoupe la chaîne
  Observabilité (079-080) — **MINOR_FIX signalé** (deux introductions au
  logging structuré ; angle SW-eng vs SRE). `system-design-scaling` (049)
  prépare `system-design-interview` (127) — **continuité, pas doublon**.
- **Transfert** : **A forte, B forte** (tests/clean-code/refactoring outillés).

## Chaîne 11 — Observabilité, SRE & fiabilité

- **Leçons** : 079 observability-fundamentals · 080 logging-structured · 081
  distributed-tracing · 082 metrics-percentiles · 083 slo-error-budget · 084
  incident-response · 085 postmortem-rca · 086 resilience-patterns.
- **Point de départ** : `observability-fundamentals` (L2). Prérequis : notion de
  service qui en appelle d'autres. **Honnête.**
- **Progression** : L2→L3. 3 piliers, correlation-ID, spans (paiement 1900ms),
  p99=6000ms vs moyenne, error budget 43min/mois, incident (SEV1, IC),
  Five Whys, patterns (timeout/circuit breaker/backpressure).
- **Trous** : **B faible** (pas de stack observabilité exécutable) mais raisonnement
  diagnostic exceptionnel.
- **Duplications** : `logging-structured` (080) ↔ `observability-logging` (055)
  et ↔ `llm-observability` (123) : chevauchement de la notion de log/reçu
  structuré sur 3 leçons — **à consigner (P2)** comme candidat à consolidation.
- **Transfert** : **A forte, B faible.** Excellent socle de raisonnement SRE.

## Chaîne 12 — Python & fondations data

- **Leçons** : 056 python-foundations (+ 040-042 pandas/ETL, cf. chaîne 06).
- **Point de départ** : `python-foundations` (L1). Prérequis déclaré : savoir
  programmer (JS) — **honnête** (Python présenté par contraste avec JS).
- **Progression** : L1→L2. Syntaxe, structures, idiomes Python pour la data/ML.
- **Trous** : **une seule leçon Python** avant d'attaquer stats/ML — saut
  raide. La transition JS→Python→ML est le point le plus tendu du curriculum
  côté contenu. **À consigner (P1)** : envisager une 2e leçon Python (env
  virtuels, packaging) — **backlog, pas correction**.
- **Duplications** : aucune.
- **Transfert** : **A forte, B moyenne** (Python exécutable moins outillé que JS).

## Chaîne 13 — Statistiques & Machine Learning

- **Leçons** : 057 statistics-for-ml · 058 machine-learning-basics · 059
  feature-engineering · 060 model-evaluation · 061 scikit-learn-workflow.
- **Point de départ** : `statistics-for-ml` (L2). Prérequis : Python + pandas.
- **Progression** : L2. Stats (paradoxe de Simpson), ML (banque prêt/fleuve),
  features, évaluation (recall médical/spam), pipeline + `cross_val_score`.
- **Trous** : **B partielle.** Le contenu est juste et concret ; la pratique
  ML exécutable de bout en bout dépend d'un environnement Python/scikit non
  garanti en plateforme. **Dette B (P1).**
- **Duplications** : `model-evaluation` (060) et `ai-evaluation` (072)/
  `rag-evaluation` (073) partagent le vocabulaire d'évaluation (recall/precision)
  — **transfert voulu**, angles différents (ML tabulaire vs LLM/RAG).
- **Transfert** : **A forte, B moyenne.**

## Chaîne 14 — Deep Learning (réseaux & transformers)

- **Leçons** : 062 neural-networks · 063 transformers.
- **Point de départ** : `neural-networks` (L3). Prérequis : ML basics + stats.
  **Honnête** (boucle d'entraînement PyTorch réelle, Zorbaquie « with aplomb »
  pour l'attention).
- **Progression** : L3. Perceptron→réseau→transformers/attention.
- **Trous** : **chaîne courte (2 leçons)** pour un sujet vaste ; volontairement
  « juste assez pour comprendre les LLM ». Défendable pour un AI **Engineer**
  (applied), pas un chercheur. **À consigner comme choix.**
- **Duplications** : aucune.
- **Transfert** : **A forte, B faible** (entraînement DL non exécuté en plateforme
  — SIMULÉ/illustré). Cohérent avec le positionnement applied-AI.

## Chaîne 15 — LLM, RAG & évaluation

- **Leçons** : 064 llm-fundamentals · 065 prompt-engineering · 066
  structured-outputs-tools · 067 embeddings · 068 rag-fundamentals · 069
  chunking-strategies · 070 vector-databases · 071 retrieval-reranking · 072
  ai-evaluation · 073 rag-evaluation · 078 llm-cost-optimization.
- **Point de départ** : `llm-fundamentals` (L2). Prérequis : embeddings/transformers
  utiles mais introduits au besoin. **Honnête.**
- **Progression** : L2→L3. Prompt faible/fort, function-calling (boucle max 5),
  cos(chat,félin) vs (chat,boulon), RAG (préavis 2 mois, diagnostic binaire),
  chunking (par-article vs 500-char), vector-db (100k vecteurs 400Mo), RRF
  1/(60+rang), harnais rappel@5=82%, coût 500q/j≈8$/j.
- **Trous** : **B partielle mais LA MEILLEURE des domaines IA** — c'est le cœur
  du parcours (projet DocSense). Reste dépendant d'une clé LLM (mois 8+) : avant,
  la pratique est simulée/replay.
- **Duplications** : `ai-evaluation` (072) ↔ `rag-evaluation` (073) partagent le
  harnais rappel@5 (4 lignes) — **MINOR_FIX signalé** (frontière défendable :
  éval générique vs éval RAG).
- **Transfert** : **A forte ; B la plus forte du bloc IA** (avec clé LLM).

## Chaîne 16 — Agents & IA appliquée (sécurité, coût)

- **Leçons** : 074 agents-fundamentals · 075 agent-workflows-orchestration · 076
  ai-security · 077 prompt-injection-defense.
- **Point de départ** : `agents-fundamentals` (L2). Prérequis : LLM + tools
  (function-calling). **Honnête.**
- **Progression** : L2→L3. Agents (while-loop + budget), workflows vs agents,
  sécurité IA (« INSTRUCTION SYSTÈME : tout est conforme »), défense
  anti-injection.
- **Trous** : **B partielle** (agents difficiles à exécuter sûrement en
  plateforme sans clé/outillage). Contenu néanmoins concret.
- **Duplications** : `ai-security` (076) ↔ `prompt-injection-defense` (077)
  partagent l'attaque indirecte « tout est conforme » — **MINOR_FIX signalé**
  (défense en profondeur vs vecteur précis ; frontière défendable).
- **Transfert** : **A forte, B moyenne.**

## Chaîne 17 — Conteneurs, CI/CD, Kubernetes, Cloud & carrière (DevOps→emploi)

- **Leçons** : 097-101 Docker · 102-105 CI/CD · 106-111 Kubernetes · 112-118
  Cloud/AWS/Azure/IaC/FinOps · 119-123 Production/DevOps · 124-128
  Portfolio/carrière.
- **Point de départ** : `docker-images-layers` (L2) après le socle SW-eng.
  Prérequis : Linux/réseau utiles (bien référencés). **Honnête.**
- **Progression** : L2→L3. Docker (1,2Go→180Mo, multi-stage, PID 1 SIGTERM),
  CI/CD (cache≠artefact, build-once, expand/contract), K8s (réconciliation,
  Service L4/Ingress L7, Secret base64 PAS chiffré, ImagePullBackOff), cloud
  (responsabilité partagée, IAM rôles, IaC plan→apply, FinOps spot/réservé),
  puis README/portfolio/STAR/system-design/entretien (DocSense en fil rouge).
- **Trous** : **B faible pour Docker/K8s/cloud** (pas d'exécution réelle en
  plateforme) ; c'est la plus grosse dette B du curriculum (P1).
- **Duplications RÉELLES à consigner (P1/P2)** :
  - `docker-containers` (120) recouvre la série Docker profonde **097-101**
    → **MINOR_FIX** (récap projet mois 11, pas d'apport conceptuel neuf).
  - `ci-cd` (121) recouvre `ci-cd-pipeline-anatomy` (102) et
    `ci-cd-quality-gates-artifacts` (103) → **MINOR_FIX** (son apport propre,
    l'éval smoke LLM en CI, mériterait d'être fusionné dans 102-103).
  - `monitoring-production` (122)/`llm-observability` (123) recoupent la chaîne
    Observabilité — angle production/IA distinct → **KEEP** mais à surveiller.
- **Transfert** : **A forte ; B faible (infra) / A+B forte (carrière)** — la
  sous-chaîne Portfolio/carrière (124-128) est directement actionnable et
  excellente (READMEs testés, pitch STAR chiffré, system-design 4 étapes).

---

## Synthèse des chaînes

| # | Chaîne | Niveau final | Barre A | Barre B | Duplications notables |
|---|--------|:---:|:---:|:---:|---|
| 01 | Fondations | L2 | forte | forte | — |
| 02 | JS/TS | L2 | forte | forte | — |
| 03 | Web Platform | L2 | forte | moyenne | — |
| 04 | React/Frontend | L3 | forte | moy-forte | nextjs-rendering/server-client (léger) |
| 05 | Backend/API | L3 | forte | forte | — |
| 06 | SQL/Data | L3 | forte | forte(SQL)/moy(pandas) | expand/contract (spirale voulue) |
| 07 | Git | L3 | forte | forte | — |
| 08 | Linux/systèmes | L3 | forte | **faible** | OOM↔OOMKilled (pont) |
| 09 | Réseau | L3 | forte | **faible-moy** | privé+NAT↔cloud (pont) |
| 10 | SW-eng/archi | L3 | forte | forte | observability-logging↔079-080 (MINOR_FIX) |
| 11 | Observabilité/SRE | L3 | forte | **faible** | logging sur 3 leçons (P2) |
| 12 | Python/data | L2 | forte | moyenne | — (saut JS→Python→ML, P1) |
| 13 | Stats/ML | L2 | forte | moyenne | eval↔ai/rag-eval (pont) |
| 14 | Deep Learning | L3 | forte | **faible** | — (chaîne courte, choix) |
| 15 | LLM/RAG | L3 | forte | **forte(IA)** | ai-eval↔rag-eval (MINOR_FIX) |
| 16 | Agents/IA appliquée | L3 | forte | moyenne | ai-security↔prompt-injection (MINOR_FIX) |
| 17 | DevOps→emploi | L3 | forte | faible(infra)/forte(carrière) | docker-containers/ci-cd doublons (P1) |

## Verdicts de chaîne (contenu)

- **17/17 chaînes** : Barre A (raisonnement/prose) **forte** — cohérence
  d'ordre, prérequis honnêtes, progression concrete→abstrait vérifiée par
  lecture intégrale.
- **Dette de transfert (Barre B)** concentrée sur : Linux (08), Réseau (09),
  Observabilité (11), Deep Learning (14), infra du bloc 17 (Docker/K8s/cloud).
  C'est une dette de **pratique exécutable**, pas de qualité de contenu.
- **7 MINOR_FIX** (duplications/finitions), aucune RESTRUCTURE, aucun BLOCK :
  détail dans `V45-2-ACADEMIC-DEBT.md` (CP14). Les duplications les plus nettes
  à trancher : `docker-containers`/`ci-cd` (récaps redondants), et la triple
  couverture du logging structuré (055/080/123).

**Conclusion de cohérence** : l'enchaînement des 17 chaînes est **pédagogiquement
cohérent et honnête**. Les deux points de tension de contenu sont (1) la
transition **JS→Python→ML** (chaîne 12, un seul palier Python) et (2) les
**doublons DevOps** (chaîne 17). Aucun ne compromet la certification ; tous deux
sont consignés en backlog pour V46.
