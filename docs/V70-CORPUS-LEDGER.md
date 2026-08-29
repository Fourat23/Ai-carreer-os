# V70 — Ledger du corpus (128 leçons)

Classement établi au CP3, **avant** toute réécriture, à partir de défauts
**observables** (`scripts/v70/cp3-ledger.mjs`). Le score classe l'urgence ; il ne
note pas la qualité pédagogique — celle-ci se juge par lecture au moment de la
réécriture, avec le barème gelé (`docs/V70-ACADEMIC-CONTRACT-FROZEN.md`).

Pénalités : exemple guidé <120 mots (3) · aucune correction (3) · aucune pratique (3) ·
gabarit Énoncé/Raisonnement (2) · correction = réponse seule (2) · pratique sans
production (2) · noyau explicatif <250 mots (2) · exemple guidé <250 mots (1) ·
pratique <40 mots (1) · aucun cas professionnel (1) · aucun code (1) · hors parcours (1).

Priorités : **P0** ≥9 · **P1** 6-8 · **P2** 3-5 · **P3** 1-2 · **PASS** 0.

| priorité | leçons | lot de traitement |
|---|---:|---|
| P0 | 28 | CP4→CP9 |
| P1 | 35 | CP4→CP9 |
| P2 | 38 | CP4→CP9 |
| P3 | 20 | CP4→CP9 |
| PASS | 7 | — |

**101 leçons P0+P1+P2 à réécrire** ; 20 P3 à examiner ; 7 PASS.

## Répartition par lot

| lot | CP | domaines | leçons | dont P0 | dont P1 | dont P2 |
|---|---|---|---:|---:|---:|---:|
| 1 | CP4 | Cloud & Kubernetes | 13 | 11 | 2 | 0 |
| 2 | CP5 | Frontend, Next.js, CSS | 19 | 5 | 6 | 4 |
| 3 | CP6 | Web, backend, données | 22 | 2 | 4 | 12 |
| 4 | CP7 | IA appliquée, LLM, RAG, agents | 11 | 3 | 2 | 4 |
| 5 | CP8 | Systèmes, réseau, observabilité | 29 | 4 | 9 | 12 |
| 6 | CP9 | Fondations, carrière | 27 | 3 | 12 | 6 |

## Ledger détaillé

| leçon | domaine | prio | lot | bloq. | guidé | exo | corr | parcours | défauts |
|---|---|---|---|---|---:|---:|---:|---|---|
| `interview-preparation` | Carrière | **P0** | CP9 | B2 B4 B3 | 108 | 51 | 38 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · B3 pratique sans production · aucun cas professionnel · noyau explicatif mince |
| `portfolio-github` | Carrière | **P0** | CP9 | B2 B4 B3 | 111 | 53 | 38 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · B3 pratique sans production · aucun cas professionnel · noyau explicatif mince |
| `cloud-aws-core` | Cloud | **P0** | CP4 | B2 B4 B3 | 55 | 30 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · noyau explicatif mince · hors parcours |
| `nextjs-rendering` | Frontend-hors | **P0** | CP5 | B2 B4 B3 | 88 | 49 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · aucun cas professionnel · aucun exemple concret · hors parcours |
| `nextjs-server-client-components` | Frontend-hors | **P0** | CP5 | B2 B4 B3 | 100 | 62 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · aucun cas professionnel · aucun exemple concret · hors parcours |
| `agent-workflows-orchestration` | IA appliquée | **P0** | CP7 | B2 B4 | 101 | 62 | 47 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel · noyau explicatif mince |
| `caching-performance` | Web & Backend | **P0** | CP6 | B2 B4 | 119 | 50 | 41 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel · noyau explicatif mince |
| `cloud-compute-storage` | Cloud | **P0** | CP4 | B2 B4 B3 | 39 | 32 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · aucun exemple concret · hors parcours |
| `cloud-fundamentals` | Cloud | **P0** | CP4 | B2 B4 B3 | 45 | 27 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · aucun exemple concret · hors parcours |
| `cloud-networking` | Cloud | **P0** | CP4 | B2 B4 B3 | 58 | 25 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · aucun exemple concret · hors parcours |
| `css-fundamentals` | Frontend-hors | **P0** | CP5 | B2 B4 B3 | 94 | 65 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · aucun cas professionnel · hors parcours |
| `deployment-secrets` | Systèmes | **P0** | CP8 | B2 B4 B3 | 105 | 50 | 38 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · B3 pratique sans production · aucun cas professionnel |
| `etl-pipelines` | Données & ML | **P0** | CP6 | B2 B4 B3 | 102 | 46 | 36 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · B3 pratique sans production · aucun cas professionnel |
| `llm-cost-optimization` | IA appliquée | **P0** | CP7 | B2 B4 | 104 | 58 | 41 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel · noyau explicatif mince |
| `nextjs-foundations` | Frontend-hors | **P0** | CP5 | B2 B4 | 94 | 74 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · aucun cas professionnel · noyau explicatif mince · hors parcours |
| `rag-evaluation` | IA appliquée | **P0** | CP7 | B2 B4 | 116 | 41 | 44 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel · noyau explicatif mince |
| `technical-storytelling` | Carrière | **P0** | CP9 | B2 B4 B3 | 97 | 46 | 40 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · B3 pratique sans production · aucun cas professionnel |
| `cloud-azure-core` | Cloud | **P0** | CP4 | B2 B4 B3 | 51 | 27 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · hors parcours |
| `cloud-finops` | Cloud | **P0** | CP4 | B2 B4 B3 | 52 | 29 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · hors parcours |
| `deployment-strategies` | Systèmes | **P0** | CP8 | B2 B4 | 57 | 34 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · pratique maigre · aucun exemple concret · hors parcours |
| `k8s-config-probes` | Kubernetes | **P0** | CP4 | B2 B4 B3 | 65 | 22 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · hors parcours |
| `k8s-networking-services` | Kubernetes | **P0** | CP4 | B2 B4 B3 | 59 | 26 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · hors parcours |
| `k8s-security` | Kubernetes | **P0** | CP4 | B2 B4 B3 | 55 | 28 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · hors parcours |
| `k8s-troubleshooting` | Kubernetes | **P0** | CP4 | B2 B4 B3 | 47 | 30 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · hors parcours |
| `k8s-workloads` | Kubernetes | **P0** | CP4 | B2 B4 B3 | 31 | 21 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · hors parcours |
| `linux-services-systemd` | Systèmes | **P0** | CP8 | B2 B4 B3 | 59 | 24 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · hors parcours |
| `nextjs-data-production` | Frontend-hors | **P0** | CP5 | B2 B4 | 107 | 67 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · aucun cas professionnel · aucun exemple concret · hors parcours |
| `release-incident-recovery` | Systèmes | **P0** | CP8 | B2 B4 B3 | 54 | 28 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · B3 pratique sans production · hors parcours |
| `chunking-strategies` | Fondations | **P1** | CP9 | B2 B4 | 72 | 52 | 47 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel |
| `ci-cd` | Systèmes | **P1** | CP8 | B2 B4 | 74 | 48 | 39 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel |
| `css-flexbox` | Frontend-hors | **P1** | CP5 | B2 B4 | 105 | 59 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · aucun cas professionnel · hors parcours |
| `data-cleaning-quality` | Données & ML | **P1** | CP6 | B2 B4 | 81 | 43 | 40 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel |
| `iac-fundamentals` | Cloud | **P1** | CP4 | B2 B4 | 45 | 37 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · pratique maigre · hors parcours |
| `k8s-why-architecture` | Kubernetes | **P1** | CP4 | B2 B4 | 50 | 31 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · pratique maigre · hors parcours |
| `llm-observability` | IA appliquée | **P1** | CP7 | B2 B4 | 113 | 46 | 51 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel |
| `monitoring-production` | Fondations | **P1** | CP9 | B2 B4 | 87 | 43 | 38 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel |
| `observability-fundamentals` | Systèmes | **P1** | CP8 | B2 B3 | 98 | 23 | 542 | oui | B2 exemple guidé sans décision · B3 pratique sans production · noyau explicatif mince · aucun exemple concret |
| `observability-logging` | Systèmes | **P1** | CP8 | B2 B4 | 83 | 44 | 36 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel |
| `readme-documentation` | Fondations | **P1** | CP9 | B2 B4 | 16 | 40 | 46 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel |
| `responsive-design` | Frontend-hors | **P1** | CP5 | B2 B4 | 102 | 57 | 0 | **non** | B2 exemple guidé sans décision · B4 aucune correction · aucun cas professionnel · hors parcours |
| `retrieval-reranking` | Fondations | **P1** | CP9 | B2 B4 | 75 | 54 | 54 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel |
| `scikit-learn-workflow` | Fondations | **P1** | CP9 | B2 B4 | 98 | 54 | 43 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel |
| `system-design-interview` | Fondations | **P1** | CP9 | B2 B4 B3 | 116 | 52 | 48 | oui | B2 exemple guidé sans décision · B4 correction = réponse seule · B3 pratique sans production · aucun cas professionnel |
| `vector-databases` | Fondations | **P1** | CP9 | B2 B4 | 71 | 49 | 49 | oui | B2 exemple guidé sans décision · gabarit Énoncé/Raisonnement · B4 correction = réponse seule · aucun cas professionnel |
| `async-messaging-queues` | Web & Backend | **P1** | CP6 | B2 B3 | 96 | 0 | 653 | oui | B2 exemple guidé sans décision · B3 aucune pratique · aucun exemple concret |
| `distributed-systems-failures` | Fondations | **P1** | CP9 | B2 B3 | 97 | 0 | 580 | oui | B2 exemple guidé sans décision · B3 aucune pratique · aucun exemple concret |
| `docker-compose` | Systèmes | **P1** | CP8 | B2 B3 | 54 | 29 | 596 | oui | B2 exemple guidé sans décision · B3 pratique sans production · noyau explicatif mince |
| `linux-ssh-remote` | Systèmes | **P1** | CP8 | B4 B3 | 212 | 33 | 0 | **non** | exemple guidé court · B4 aucune correction · B3 pratique sans production · hors parcours |
| `logging-structured` | Fondations | **P1** | CP9 | B2 B3 | 62 | 18 | 458 | oui | B2 exemple guidé sans décision · B3 pratique sans production · noyau explicatif mince |
| `react-hooks-effects` | Frontend | **P1** | CP5 | B4 B3 | 927 | 44 | 38 | oui | B4 correction = réponse seule · B3 pratique sans production · aucun cas professionnel · noyau explicatif mince |
| `transformers` | IA appliquée | **P1** | CP7 | B4 B3 | 725 | 52 | 52 | oui | B4 correction = réponse seule · B3 pratique sans production · aucun cas professionnel · noyau explicatif mince |
| `api-production-contracts` | Web & Backend | **P1** | CP6 | B2 B3 | 101 | 0 | 616 | oui | B2 exemple guidé sans décision · B3 aucune pratique |
| `architecture-basics` | Web & Backend | **P1** | CP6 | B2 B3 | 85 | 44 | 453 | oui | B2 exemple guidé sans décision · B3 pratique sans production · aucun exemple concret |
| `css-grid` | Frontend-hors | **P1** | CP5 | B4 | 121 | 60 | 0 | **non** | exemple guidé court · B4 aucune correction · aucun cas professionnel · hors parcours |
| `distributed-tracing` | Fondations | **P1** | CP9 | B2 B3 | 67 | 22 | 507 | oui | B2 exemple guidé sans décision · B3 pratique sans production · aucun exemple concret |
| `frontend-testing` | Frontend | **P1** | CP5 | B2 B3 | 105 | 58 | 588 | oui | B2 exemple guidé sans décision · B3 pratique sans production · aucun cas professionnel |
| `incident-response` | Systèmes | **P1** | CP8 | B2 B3 | 72 | 15 | 585 | oui | B2 exemple guidé sans décision · B3 pratique sans production · aucun exemple concret |
| `networking-addressing-routing` | Systèmes | **P1** | CP8 | B2 B3 | 89 | 0 | 605 | oui | B2 exemple guidé sans décision · B3 aucune pratique |
| `postmortem-rca` | Systèmes | **P1** | CP8 | B2 B3 | 73 | 16 | 555 | oui | B2 exemple guidé sans décision · B3 pratique sans production · aucun exemple concret |
| `react-composition-architecture` | Frontend | **P1** | CP5 | B2 B3 | 81 | 52 | 691 | oui | B2 exemple guidé sans décision · B3 pratique sans production · aucun cas professionnel |
| `slo-error-budget` | Systèmes | **P1** | CP8 | B2 B3 | 69 | 16 | 591 | oui | B2 exemple guidé sans décision · B3 pratique sans production · aucun exemple concret |
| `technical-debt` | Carrière | **P1** | CP9 | B2 B3 | 97 | 53 | 633 | oui | B2 exemple guidé sans décision · B3 pratique sans production · aucun cas professionnel |
| `technical-documentation` | Carrière | **P1** | CP9 | B2 B3 | 88 | 52 | 675 | oui | B2 exemple guidé sans décision · B3 pratique sans production · aucun cas professionnel |
| `ci-cd-pipeline-anatomy` | Systèmes | **P2** | CP8 | B2 B3 | 55 | 24 | 608 | oui | B2 exemple guidé sans décision · B3 pratique sans production |
| `database-modeling` | Données & ML | **P2** | CP6 | B4 | 802 | 55 | 45 | oui | B4 correction = réponse seule · aucun cas professionnel · noyau explicatif mince |
| `docker-build-dockerfile` | Systèmes | **P2** | CP8 | B2 B3 | 47 | 34 | 561 | oui | B2 exemple guidé sans décision · B3 pratique sans production |
| `docker-containers` | Systèmes | **P2** | CP8 | B3 | 773 | 50 | 171 | oui | correction sans raisonnement · B3 pratique sans production · aucun cas professionnel |
| `docker-networking-volumes` | Systèmes | **P2** | CP8 | B2 | 58 | 46 | 566 | oui | B2 exemple guidé sans décision · noyau explicatif mince |
| `docker-production-hardening` | Systèmes | **P2** | CP8 | B2 B3 | 52 | 34 | 682 | oui | B2 exemple guidé sans décision · B3 pratique sans production |
| `git-advanced` | Fondations | **P2** | CP9 | B4 B3 | 615 | 51 | 42 | oui | B4 correction = réponse seule · B3 pratique sans production · aucun cas professionnel |
| `linux-filesystem-permissions` | Systèmes | **P2** | CP8 | B2 B3 | 82 | 30 | 635 | oui | B2 exemple guidé sans décision · B3 pratique sans production |
| `networking-dns` | Systèmes | **P2** | CP8 | B2 B3 | 62 | 28 | 581 | oui | B2 exemple guidé sans décision · B3 pratique sans production |
| `networking-http-tls` | Systèmes | **P2** | CP8 | B2 B3 | 63 | 23 | 622 | oui | B2 exemple guidé sans décision · B3 pratique sans production |
| `networking-proxy-loadbalancing` | Systèmes | **P2** | CP8 | B2 B3 | 68 | 27 | 684 | oui | B2 exemple guidé sans décision · B3 pratique sans production |
| `neural-networks` | Données & ML | **P2** | CP6 | B4 | 641 | 50 | 36 | oui | B4 correction = réponse seule · aucun cas professionnel · noyau explicatif mince |
| `prompt-injection-defense` | IA appliquée | **P2** | CP7 | B4 | 894 | 51 | 48 | oui | B4 correction = réponse seule · aucun cas professionnel · noyau explicatif mince |
| `resilience-patterns` | Fondations | **P2** | CP9 | B2 B3 | 74 | 17 | 570 | oui | B2 exemple guidé sans décision · B3 pratique sans production |
| `system-design-scaling` | Fondations | **P2** | CP9 | B3 | 120 | 0 | 581 | oui | exemple guidé court · B3 aucune pratique · aucun exemple concret |
| `breaking-changes-compatibility` | Web & Backend | **P2** | CP6 | B2 | 95 | 55 | 587 | oui | B2 exemple guidé sans décision · aucun cas professionnel |
| `ci-cd-quality-gates-artifacts` | Systèmes | **P2** | CP8 | B2 | 52 | 32 | 645 | oui | B2 exemple guidé sans décision · pratique maigre |
| `database-migrations` | Données & ML | **P2** | CP6 | B3 | 120 | 50 | 606 | oui | exemple guidé court · B3 pratique sans production · aucun cas professionnel |
| `database-transactions-concurrency` | Données & ML | **P2** | CP6 | B2 | 101 | 52 | 733 | oui | B2 exemple guidé sans décision · aucun cas professionnel |
| `networking-tcp-ip-model` | Systèmes | **P2** | CP8 | B3 | 748 | 28 | 560 | oui | B3 pratique sans production · noyau explicatif mince |
| `react-accessibility` | Frontend | **P2** | CP5 | B2 | 74 | 55 | 594 | oui | B2 exemple guidé sans décision · aucun cas professionnel |
| `refactoring-legacy-code` | Fondations | **P2** | CP9 | B2 | 112 | 50 | 644 | oui | B2 exemple guidé sans décision · aucun cas professionnel |
| `sql-performance-indexing` | Données & ML | **P2** | CP6 | B2 | 110 | 53 | 543 | oui | B2 exemple guidé sans décision · aucun cas professionnel |
| `ai-evaluation` | IA appliquée | **P2** | CP7 | B2 | 83 | 53 | 424 | oui | B2 exemple guidé sans décision |
| `authentication` | Web & Backend | **P2** | CP6 | B4 | 752 | 50 | 47 | oui | B4 correction = réponse seule · aucun cas professionnel |
| `browser-dom-rendering` | Frontend | **P2** | CP5 | B3 | 818 | 56 | 608 | oui | B3 pratique sans production · aucun cas professionnel |
| `embeddings` | IA appliquée | **P2** | CP7 | B4 | 754 | 93 | 49 | oui | B4 correction = réponse seule · aucun cas professionnel |
| `error-handling` | Web & Backend | **P2** | CP6 | B4 | 764 | 48 | 40 | oui | B4 correction = réponse seule · aucun cas professionnel |
| `express-backend` | Web & Backend | **P2** | CP6 | B4 | 886 | 48 | 40 | oui | B4 correction = réponse seule · aucun cas professionnel |
| `feature-engineering` | Données & ML | **P2** | CP6 | B4 | 655 | 49 | 43 | oui | B4 correction = réponse seule · aucun cas professionnel |
| `html-semantic-structure` | Frontend | **P2** | CP5 | B3 | 816 | 55 | 591 | oui | B3 pratique sans production · aucun cas professionnel |
| `linux-resources-io` | Systèmes | **P2** | CP8 | B2 | 76 | 62 | 584 | oui | B2 exemple guidé sans décision |
| `model-evaluation` | Données & ML | **P2** | CP6 | B3 | 728 | 44 | 354 | oui | B3 pratique sans production · aucun cas professionnel |
| `pandas-data-wrangling` | Données & ML | **P2** | CP6 | B4 | 724 | 46 | 37 | oui | B4 correction = réponse seule · aucun cas professionnel |
| `prompt-engineering` | IA appliquée | **P2** | CP7 | B4 | 784 | 59 | 46 | oui | B4 correction = réponse seule · aucun cas professionnel |
| `python-foundations` | Fondations | **P2** | CP9 | B2 | 73 | 50 | 420 | oui | B2 exemple guidé sans décision |
| `react-fundamentals` | Frontend | **P2** | CP5 | B4 | 777 | 41 | 34 | oui | B4 correction = réponse seule · aucun cas professionnel |
| `structured-outputs-tools` | Fondations | **P2** | CP9 | B4 | 677 | 46 | 38 | oui | B4 correction = réponse seule · aucun cas professionnel |
| `agents-fundamentals` | IA appliquée | **P3** | CP7 | B3 | 718 | 47 | 441 | oui | B3 pratique sans production |
| `algorithmic-thinking` | Fondations | **P3** | CP9 | B3 | 683 | 42 | 395 | oui | B3 pratique sans production |
| `docker-images-layers` | Systèmes | **P3** | CP8 | B3 | 778 | 42 | 575 | oui | B3 pratique sans production |
| `frontend-performance` | Frontend | **P3** | CP5 | — | 125 | 58 | 584 | oui | exemple guidé court · aucun cas professionnel |
| `http-rest-json` | Web & Backend | **P3** | CP6 | B3 | 780 | 33 | 380 | oui | B3 pratique sans production |
| `javascript-basics` | Fondations | **P3** | CP9 | B3 | 321 | 41 | 231 | oui | B3 pratique sans production |
| `linux-processes-signals` | Systèmes | **P3** | CP8 | B3 | 872 | 37 | 613 | oui | B3 pratique sans production |
| `llm-fundamentals` | IA appliquée | **P3** | CP7 | B3 | 606 | 55 | 430 | oui | B3 pratique sans production |
| `metrics-percentiles` | Systèmes | **P3** | CP8 | B3 | 452 | 30 | 422 | oui | B3 pratique sans production |
| `sql-foundations` | Données & ML | **P3** | CP6 | B3 | 837 | 44 | 447 | oui | B3 pratique sans production |
| `statistics-for-ml` | Données & ML | **P3** | CP6 | B3 | 718 | 44 | 443 | oui | B3 pratique sans production |
| `terminal-shell-filesystem` | Systèmes | **P3** | CP8 | B3 | 338 | 43 | 302 | oui | B3 pratique sans production |
| `testing-foundations` | Fondations | **P3** | CP9 | B3 | 666 | 52 | 298 | oui | B3 pratique sans production |
| `typescript-basics` | Fondations | **P3** | CP9 | B3 | 284 | 46 | 299 | oui | B3 pratique sans production |
| `async-javascript` | Fondations | **P3** | CP9 | — | 586 | 51 | 251 | oui | aucun cas professionnel |
| `data-structures-intro` | Données & ML | **P3** | CP6 | — | 696 | 34 | 400 | oui | pratique maigre |
| `react-application-states` | Frontend | **P3** | CP5 | — | 705 | 55 | 534 | oui | aucun cas professionnel |
| `recursion` | Fondations | **P3** | CP9 | — | 634 | 62 | 523 | oui | aucun cas professionnel |
| `typescript-frontend` | Frontend | **P3** | CP5 | — | 131 | 64 | 427 | oui | exemple guidé court |
| `web-forms-validation` | Frontend | **P3** | CP5 | — | 812 | 54 | 573 | oui | aucun cas professionnel |
| `ai-security` | IA appliquée | **PASS** | — | — | 756 | 56 | 466 | oui | aucun |
| `api-design-basics` | Web & Backend | **PASS** | — | — | 704 | 43 | 432 | oui | aucun |
| `clean-code` | Fondations | **PASS** | — | — | 757 | 42 | 375 | oui | aucun |
| `design-patterns-intro` | Fondations | **PASS** | — | — | 617 | 48 | 383 | oui | aucun |
| `git-fundamentals` | Fondations | **PASS** | — | — | 333 | 44 | 347 | oui | aucun |
| `machine-learning-basics` | Données & ML | **PASS** | — | — | 781 | 45 | 428 | oui | aucun |
| `rag-fundamentals` | IA appliquée | **PASS** | — | — | 739 | 50 | 465 | oui | aucun |
