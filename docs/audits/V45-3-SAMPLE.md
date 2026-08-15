# V45.3 — Échantillon stratifié (sélection déterministe)

**Total : 38 leçons uniques** (floor = 24 ; on dépasse volontairement pour
couvrir tous les strates sans réduction). **15 domaines** représentés.
**Seed pseudo-aléatoire documentée : `45032025`** (PRNG mulberry32, procédure
dans `scripts`/scratchpad `sample.mjs`, déterministe et reproductible).

> Aucun score V45.2 n'est affiché à côté d'une leçon : la notation V45.3 se fait
> à l'aveugle (PASS A), puis le verdict V45.2 est consulté et comparé.

## Composition par strate (couverte)

- **A. 7 MINOR_FIX V45.2** : pandas-data-wrangling, observability-logging,
  rag-evaluation, prompt-injection-defense, iac-fundamentals, docker-containers,
  ci-cd. ✅ (7/7)
- **B. Nœuds centraux du graphe** : javascript-basics, http-rest-json,
  sql-foundations, llm-fundamentals. ✅
- **C. Fondamentaux premier-contact** : git-fundamentals, typescript-basics,
  linux-filesystem-permissions, html-semantic-structure, react-fundamentals,
  python-foundations. ✅ (JS/TS, Git/Linux, HTTP/API, HTML/CSS/React, Python/SQL)
- **D. Domaines avancés** : k8s-security, ai-security, machine-learning-basics,
  neural-networks, retrieval-reranking, agents-fundamentals,
  system-design-interview. ✅ (Cloud/K8s, Security, ML/DL, RAG/LLM, Agents, SysDesign)
- **E. Longueur / densité / excellence** :
  - 3 plus courtes : docker-containers (853), etl-pipelines (858),
    pandas-data-wrangling (859).
  - 3 plus longues : react-accessibility (1504), technical-documentation (1468),
    css-fundamentals (1463).
  - 3 forte densité : transformers, database-transactions-concurrency,
    resilience-patterns.
  - 3 supposées excellentes : embeddings, postmortem-rca, metrics-percentiles.
- **F. Aléatoire déterministe (seed 45032025)** : recursion, architecture-basics,
  networking-tcp-ip-model, networking-proxy-loadbalancing. ✅ (4)

## Liste complète (ordre curriculaire)

| Pos | Slug | Mots | Domaine | Raison(s) de sélection |
|----:|------|-----:|---------|------------------------|
| 002 | git-fundamentals | 1072 | Fondations | fondamental premier-contact |
| 003 | javascript-basics | 1125 | Fondations | nœud central du graphe |
| 005 | recursion | 1035 | Fondations | aléatoire (seed 45032025) |
| 007 | typescript-basics | 1142 | Fondations | fondamental premier-contact |
| 010 | http-rest-json | 1072 | Web & backend | nœud central du graphe |
| 016 | html-semantic-structure | 1170 | Frontend Web Platform | fondamental premier-contact |
| 017 | css-fundamentals | 1463 | Frontend Web Platform | 3 plus longues |
| 024 | react-fundamentals | 1118 | Frontend & React | fondamental premier-contact |
| 028 | react-accessibility | 1504 | Frontend & React | 3 plus longues |
| 035 | sql-foundations | 1151 | Data & SQL | nœud central du graphe |
| 038 | database-transactions-concurrency | 1293 | Data & SQL | forte densité |
| 040 | pandas-data-wrangling | 859 | Data & SQL | MINOR_FIX ; 3 plus courtes |
| 042 | etl-pipelines | 858 | Data & SQL | 3 plus courtes |
| 047 | architecture-basics | 1217 | SW-eng & archi | aléatoire (seed 45032025) |
| 054 | technical-documentation | 1468 | SW-eng & archi | 3 plus longues |
| 055 | observability-logging | 866 | SW-eng & archi | MINOR_FIX |
| 056 | python-foundations | 1077 | Python & ML | fondamental premier-contact |
| 058 | machine-learning-basics | 1232 | Python & ML | domaine avancé (ML) |
| 062 | neural-networks | 1134 | Python & ML | domaine avancé (DL) |
| 063 | transformers | 1164 | Python & ML | forte densité |
| 064 | llm-fundamentals | 1226 | IA appliquée | nœud central du graphe |
| 067 | embeddings | 946 | IA appliquée | supposée excellente |
| 071 | retrieval-reranking | 926 | IA appliquée | domaine avancé (RAG) |
| 073 | rag-evaluation | 1030 | IA appliquée | MINOR_FIX |
| 074 | agents-fundamentals | 1257 | IA appliquée | domaine avancé (Agents) |
| 076 | ai-security | 1338 | IA appliquée | domaine avancé (Security) |
| 077 | prompt-injection-defense | 1159 | IA appliquée | MINOR_FIX |
| 082 | metrics-percentiles | 1166 | Observabilité/SRE | supposée excellente |
| 085 | postmortem-rca | 1057 | Observabilité/SRE | supposée excellente |
| 086 | resilience-patterns | 1203 | Observabilité/SRE | forte densité |
| 087 | linux-filesystem-permissions | 1253 | Systèmes & Linux | fondamental premier-contact |
| 092 | networking-tcp-ip-model | 1112 | Réseau | aléatoire (seed 45032025) |
| 096 | networking-proxy-loadbalancing | 1190 | Réseau | aléatoire (seed 45032025) |
| 111 | k8s-security | 1031 | Kubernetes | domaine avancé (Cloud/K8s) |
| 117 | iac-fundamentals | 1081 | Cloud/AWS/Azure/IaC | MINOR_FIX |
| 120 | docker-containers | 853 | Production & DevOps | MINOR_FIX ; 3 plus courtes |
| 121 | ci-cd | 896 | Production & DevOps | MINOR_FIX |
| 127 | system-design-interview | 960 | Portfolio & carrière | domaine avancé (SysDesign) |

## Anchors PASS B (6, re-notés à l'aveugle en CP9)

Sous-ensemble à re-noter dans un ordre différent en masquant les scores PASS A :
`embeddings`, `machine-learning-basics`, `sql-foundations`, `metrics-percentiles`,
`docker-containers`, `ai-security`. (Recouvre fondation, ML, data, SRE, un
MINOR_FIX court, un domaine avancé long.)

## Note d'extension

Floor = 24 ; échantillon = 38. Si des anomalies systémiques apparaissent pendant
les full-reads, l'échantillon est déjà au-delà de 32 ; aucune extension
supplémentaire ne sera nécessaire sauf découverte d'un motif de défaut concentré
sur un domaine non couvert.
