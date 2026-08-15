# V45.2 — Walkthroughs néophyte & cohérence des 365 jours (contenu)

> **Angle V45.2** : juger le CONTENU du point de vue d'un **apprenant néophyte**
> (aucune base technique) qui va investir plusieurs centaines d'heures. On ne
> teste pas ici la plateforme (progress, XP, UI) mais la **cohérence pédagogique
> du parcours lu** : chaque leçon s'appuie-t-elle vraiment sur ce qui précède ?
> Un débutant peut-il avancer sans trou infranchissable ?
>
> Read-only, fondé sur la lecture intégrale des 128 leçons.

## Partie A — Cohérence des 12 mois (vue contenu)

Le programme couvre 365 jours / 12 mois. Vu du contenu des 128 leçons (les jours
sont surtout de la pratique/projets entre les leçons), la trajectoire est :

| Mois | Bloc de contenu (chaînes) | Entrée requise | Sortie |
|------|---------------------------|----------------|--------|
| 1 | Fondations + Git + JS (01,02,07) | zéro | terminal, git, JS de base |
| 2 | Algo/DS + async + TS (01,02) | JS de base | raisonner coût, async, types |
| 3-4 | Backend/API + SQL (05,06) | JS/TS | API + base de données |
| 4-5 | Web Platform + React/Next (03,04) | JS/TS | frontend complet |
| 5 | Data (pandas/ETL) (06,12) | Python amorcé | data wrangling |
| 6 | SW-eng & architecture (10) | backend + tests | clean-code, patterns, archi |
| 6-7 | Python → Stats → ML → DL (12,13,14) | Python + stats | ML honnête, réseaux |
| 7-9 | LLM / RAG / Agents (15,16) | ML + embeddings | RAG évalué, agents |
| 9-10 | Observabilité / SRE (11) | services | diagnostic, SLO, incidents |
| 10-11 | Linux + Réseau (08,09) | terminal | systèmes, réseau |
| 11 | Docker + CI/CD + K8s + Cloud (17) | Linux/réseau | livraison, orchestration |
| 12 | Prod/DevOps + Portfolio/carrière (17) | tout | déployer, se vendre |

### Points de cohérence FORTS (vérifiés par lecture)

- **Spirale des prérequis** : chaque leçon déclare et RÉUTILISE explicitement les
  précédentes (ex. `metrics-percentiles` → `slo-error-budget` → `incident-response`
  → `postmortem-rca` forment une chaîne narrative continue).
- **Ponts inter-domaines réels** : OOM Linux → OOMKilled Docker/K8s ; « privé +
  NAT » réseau → cloud-networking ; recall ML → rappel@k RAG ; expand/contract
  SQL → deployment-strategies. Le néophyte re-rencontre les mêmes idées sous des
  angles nouveaux — renforcement, pas répétition creuse.
- **Fil rouge projet (DocSense)** cité de `deployment-secrets` à
  `system-design-interview` : donne un objet concret vers lequel tout converge.

### Points de tension de contenu (consignés en backlog, non corrigés)

1. **Transition JS → Python → ML (mois 5-7)** : une **seule** leçon Python
   (`python-foundations`) avant `statistics-for-ml` et `machine-learning-basics`.
   Pour un néophyte, le saut de langage + paradigme data est le passage le plus
   raide du parcours. Contenu juste, mais palier étroit → **P1 backlog**
   (envisager une 2e leçon Python : environnements virtuels, packaging, numpy).
2. **Deep Learning en 2 leçons (mois 7)** : `neural-networks` + `transformers`
   condensent un domaine vaste. Défendable pour un profil *applied* AI Engineer,
   mais dense pour un débutant → **choix à documenter**, pas un défaut.
3. **Doublons DevOps (mois 11)** : `docker-containers`/`ci-cd` recouvrent la
   série profonde 097-103 → un néophyte peut se demander laquelle fait foi →
   **P1 backlog** (consolider).
4. **Ordre systèmes tardif** : Linux/réseau (mois 10-11) arrivent APRÈS
   l'observabilité et l'IA qui les mobilisent parfois. L'ordre reste cohérent
   (les leçons IA n'exigent pas Linux), mais un rappel réseau plus tôt aiderait
   → **P2 backlog**.

**Verdict de cohérence 365 jours (contenu)** : **COHÉRENT**. Aucun trou
infranchissable ; les tensions sont des paliers à adoucir, pas des ruptures.

---

## Partie B — Walkthroughs néophyte (parcours de lecture réels)

Chaque walkthrough suit un débutant qui n'a JAMAIS codé, en montrant que le
contenu l'amène d'un point A à un point B **sans étape magique**.

### Walkthrough 1 — « Du zéro à ma première API » (mois 1-3)

1. `terminal-shell-filesystem` : il apprend `cd`/`ls`, comprend l'arbre + le
   shell interprète. **Aucun prérequis** — vrai départ de zéro.
2. `git-fundamentals` : versionne son premier dossier (`add -p` expliqué).
3. `javascript-basics` : valeur vs référence (analogie photocopie/Google-Doc).
4. `async-javascript` : event loop, `await` — s'appuie sur les fonctions du (3).
5. `http-rest-json` → `api-design-basics` → `express-backend` : il construit une
   API. Chaque leçon suppose UNIQUEMENT le JS/async déjà acquis.
6. `authentication` : bcrypt (slow-hash) — comprend POURQUOI hacher lentement.
- **Résultat** : une API authentifiée. **Zéro saut** : chaque brique repose sur
  la précédente. **Barre A et B fortes** (exos exécutables).

### Walkthrough 2 — « Comprendre puis évaluer un modèle ML » (mois 6-7)

1. `python-foundations` : Python par contraste avec JS (déjà connu).
2. `statistics-for-ml` : distribution, Bayes, corrélation≠causalité (paradoxe de
   Simpson).
3. `machine-learning-basics` : le renversement (données+réponses→règles), split
   AVANT tout, leakage, baseline, overfitting, métriques par coût métier.
4. `model-evaluation` : approfondit précision/rappel/F1/AUC.
5. `neural-networks` : « machine à régler des boutons » — s'appuie explicitement
   sur overfitting + courbes train/val du (3).
- **Tension honnête** : le débutant COMPREND tout (Barre A forte) mais la
  pratique ML de bout en bout dépend d'un environnement Python/scikit (Barre B
  T3, dette consignée). Le contenu ne ment pas : les exemples sont marqués
  « illustratifs ».

### Walkthrough 3 — « Construire un RAG évalué » (mois 7-9)

1. `llm-fundamentals` → `prompt-engineering` (prompt faible/fort) →
   `structured-outputs-tools` (function-calling, boucle max 5).
2. `embeddings` : « congés » vs « vacances » (même sens, aucun mot commun) ;
   `cos(chat,félin)` vs `cos(chat,boulon)`.
3. `rag-fundamentals` → `chunking-strategies` (par-article vs 500-char) →
   `vector-databases` (100k vecteurs, 400Mo) → `retrieval-reranking` (RRF
   1/(60+rang)).
4. `ai-evaluation` → `rag-evaluation` : harnais rappel@5=82% — transfert DIRECT
   du protocole ML honnête (golden set = jeu de test).
5. `llm-cost-optimization` : 500 q/j ≈ 8 $/j.
- **Résultat** : le néophyte sait concevoir ET MESURER un RAG. **La meilleure
  Barre B du bloc IA** (avec clé LLM au mois 8). Cohérence remarquable : le
  vocabulaire d'évaluation vient de `machine-learning-basics`, pas de nulle part.

### Walkthrough 4 — « Diagnostiquer une prod qui rame » (mois 9-10)

1. `observability-fundamentals` (3 piliers) → `logging-structured`
   (correlation-ID) → `distributed-tracing` (span paiement 1900ms).
2. `metrics-percentiles` : moyenne 120ms « OK » mais p99=6000ms « catastrophe ».
3. `slo-error-budget` : 99,9 % = 43 min/mois → décision livrer/geler.
4. `incident-response` (SEV1, mitiger AVANT de comprendre) → `postmortem-rca`
   (Five Whys, sans blâme) → `resilience-patterns` (timeout/circuit breaker).
- **Résultat** : méthode de diagnostic complète. **Barre A exceptionnelle**,
  Barre B faible (pas de stack exécutable) — dette consignée, contenu honnête.

### Walkthrough 5 — « Livrer et se faire embaucher » (mois 11-12)

1. `docker-images-layers`→…→`docker-production-hardening` : image 1,2Go→180Mo,
   PID 1/SIGTERM.
2. `ci-cd-pipeline-anatomy`/`quality-gates` : cache≠artefact, build-once.
3. `k8s-why-architecture`→…→`k8s-security` : réconciliation, Secret base64 PAS
   chiffré.
4. `cloud-fundamentals`→…→`cloud-finops` : responsabilité partagée, IAM rôles.
5. `readme-documentation` (installation testée + chiffres) → `portfolio-github`
   (6 épinglés, audit secrets) → `technical-storytelling` (STAR chiffré) →
   `system-design-interview` (4 étapes) → `interview-preparation` (dossier +
   simulations).
- **Résultat** : le débutant sait déployer (Barre A forte / B faible pour
  l'infra) ET se présenter (Barre A+B fortes pour la carrière). La sous-chaîne
  carrière est directement actionnable.

---

## Synthèse néophyte

- **Un néophyte PEUT parcourir le corpus sans trou infranchissable** : les
  prérequis sont honnêtes, la spirale fonctionne, les ponts inter-domaines
  consolident.
- **Là où il COMPREND sans encore SAVOIR-FAIRE en code** (ML/DL/infra/Linux/
  réseau/observabilité), le contenu le dit honnêtement (exemples « illustratifs /
  non exécutés »). C'est une dette de PRATIQUE (Barre B), documentée, pas un
  mensonge pédagogique.
- **Deux paliers à adoucir** (backlog V46) : la marche JS→Python→ML et les
  doublons DevOps. Aucun ne compromet la capacité d'un débutant à progresser.

**Réponse à la question centrale (côté contenu)** : oui, un apprenant néophyte
peut investir plusieurs centaines d'heures dans ce corpus **avec confiance** pour
COMPRENDRE le métier d'AI Engineer et pour SAVOIR-FAIRE sur le socle logiciel
(JS/TS, backend, SQL, tests, Git, RAG évalué). La réserve — explicite et
assumée — porte sur la pratique EXÉCUTABLE de ML/DL/infra, qui reste
partiellement conceptuelle en l'état.
