# Audit pédagogique V26 — Cloud / DevOps Engineer + expansion de la bibliothèque de fond

> Sprint V26 — « Cloud / DevOps Engineer + Pedagogical Foundation Expansion ».
> Priorité assumée : **PÉDAGOGIE > COHÉRENCE DES PARCOURS > PRATIQUE > NOUVELLES FEATURES.**
> Application locale, mono-utilisateur, sans auth, sans SaaS, sans réseau requis.

## A. Contexte et problème (rappel du diagnostic CP0)

L'infrastructure PRATIQUE (Labs, exercices, missions, Docker/K8s/Cloud Labs,
architectures, playbooks) avait beaucoup grandi, mais la bibliothèque canonique
des **Leçons de fond** (~60 leçons) était devenue trop petite et ne reflétait
plus la réalité des parcours. Ce déséquilibre constituait une **dette produit
prioritaire** : les apprenants pratiquaient des sujets (conteneurs, orchestration,
cloud, réseau, Linux système) sans disposer de la connaissance de fond
réutilisable correspondante.

Constat de couverture CP0 (leçons de fond, AVANT V26) :

| Domaine                     | Leçons de fond (avant) |
|-----------------------------|------------------------|
| Linux / système             | 0 (dilué dans terminal-shell) |
| Réseau (dédié)              | 0 |
| Docker                      | 1 (introduction) |
| CI/CD                       | 1 (introduction) |
| Kubernetes                  | **0** |
| Cloud (concepts)            | partiel (deployment-secrets, monitoring) |
| AWS / Azure (spécifiques)   | 0 |
| IaC                         | 0 |
| FinOps                      | 0 |

## B. Objectif du sprint et principe directeur

Transformer « Leçons de fond » en une **véritable bibliothèque de référence**
sur la colonne Cloud/DevOps, en respectant le **contrat de leçon** : une Leçon de
fond = connaissance canonique réutilisable, DISTINCTE d'un Jour / Exercice / Lab /
Mission / Projet / Playbook / Glossaire (ils se complètent, ne se dupliquent
jamais).

Principe **qualité > quantité** : « je préfère 20 excellentes leçons à 40 pages
gonflées ». La cible (~+25 à +40 leçons) n'était PAS un KPI à atteindre
artificiellement.

## C. Ce que V26 a livré

**+32 Leçons de fond** (60 → **92**), profondes, distinctes et reliées, réparties
sur toute la colonne Cloud/DevOps :

| CP  | Thème                         | Leçons | Fichiers |
|-----|-------------------------------|--------|----------|
| CP3 | Linux (système)               | 5      | linux-filesystem-permissions, linux-processes-signals, linux-services-systemd, linux-resources-io, linux-ssh-remote |
| CP3 | Réseau                        | 5      | networking-tcp-ip-model, networking-addressing-routing, networking-dns, networking-http-tls, networking-proxy-loadbalancing |
| CP4 | Docker                        | 5      | docker-images-layers, docker-build-dockerfile, docker-networking-volumes, docker-compose, docker-production-hardening |
| CP5 | CI/CD & livraison             | 4      | ci-cd-pipeline-anatomy, ci-cd-quality-gates-artifacts, deployment-strategies, release-incident-recovery |
| CP6 | Kubernetes                    | 6      | k8s-why-architecture, k8s-workloads, k8s-networking-services, k8s-config-probes, k8s-troubleshooting, k8s-security |
| CP7 | Cloud / AWS / Azure / IaC / FinOps | 7 | cloud-fundamentals, cloud-networking, cloud-compute-storage, cloud-aws-core, cloud-azure-core, iac-fundamentals, cloud-finops |

Couverture APRÈS V26 :

| Domaine                     | Leçons de fond (après) |
|-----------------------------|------------------------|
| Linux / système             | 5 |
| Réseau (dédié)              | 5 |
| Docker                      | 1 intro + 5 approfondies |
| CI/CD                       | 1 intro + 4 approfondies |
| Kubernetes                  | **6** (de 0) |
| Cloud (concepts)            | 3 (fundamentals, networking, compute-storage) |
| AWS / Azure (spécifiques)   | 2 (distingués explicitement) |
| IaC                         | 1 |
| FinOps                      | 1 |

## D. Contrat de leçon respecté

Chaque nouvelle leçon suit la structure canonique (🎯 Objectif, 🧩 Prérequis,
🧠 Modèle mental, 📖 Explication complète, 🔧 repères pratiques, 🧭 Exemple guidé,
⚠️ Erreurs fréquentes, 🔐 Sécurité, 🏢 Cas métier, 🎤 Questions d'entretien,
✍️ Mini-exercice, 🧾 À retenir, 📚 Vocabulaire, 🟢 Checklist, 🔗 Liens avec le
programme). Les leçons se RÉFÉRENCENT entre elles et pointent vers les journées et
le glossaire — elles ne dupliquent ni les jours, ni les labs, ni les playbooks.

## E. Gate V26 (structurelle, jamais « longueur = profondeur »)

`npm run v26:check` (scripts/v26-check.mjs) valide STRUCTURELLEMENT chaque leçon
déclarée dans `docs/architecture/v26-lessons-plan.json` :
fichier présent, entrée `LESSONS` cohérente (title/cat/level 1-3/min>0/skills
connus), sections minimales, absence de marqueurs d'authoring (TODO/PLACEHOLDER…),
concepts requis couverts, liens internes valides (leçons et jours existants),
empreinte anti-duplication. La gate NE JUGE JAMAIS la profondeur par la longueur —
la qualité réelle est auditée ici, à la main.

La gate est intégrée à `gates:active`. Cycle de vie des gates : `v25:check` est
passée en `gates:historical` (V26 enrichit légitimement `scripts/data/lessons-map.mjs`,
hors périmètre V25) — même mécanisme que v23→historical (V24) et v24→historical (V25).

## F. Parcours « Cloud / DevOps Engineer » (cloud-devops-engineer-v1)

Parcours **activé** (statut `available`), **piloté par données**, réutilisant des
journées EXISTANTES (aucun jour créé, aucun contenu copié), de durée **dérivée**
(29 jours résolus), en 7 modules build → ship → run :

1. Fondations système, shell & Git (jours 1–7)
2. Réseau, HTTP & services (jours 50–56, 71)
3. Sécurité & secrets (jours 67–68)
4. Architecture, cloud & haute disponibilité (jours 78–81)
5. Durcissement & fiabilité (jours 83–86)
6. Conteneurs & Kubernetes (jours 320–321)
7. CI/CD & livraison continue (jours 307, 326)

La profondeur canonique du parcours est portée par les Leçons de fond V26,
reliées aux journées via les compétences (`gitlinux`, `http`, `cloud`, `secu`,
`archi`). Le placeholder annoncé `cloud-devops-v1` a été promu et retiré des
parcours annoncés.

**Honnêteté du périmètre (anti-slop).** Ce parcours est cadré **junior / entrée**
(rôles : Ingénieur DevOps junior, Ingénieur cloud junior, futur profil SRE/plateforme
junior). Il s'appuie sur la même famille de journées que `systems-cloud-foundations-v1`
(le partage de journées entre parcours curés est un motif déjà établi dans le
catalogue — cf. fullstack/backend, systems-cloud/appsec). Il N'EST PAS présenté
comme un parcours senior « clé en main » : la dette de journées de PRATIQUE dédiées
(voir section H) est explicitement reportée.

Toutes les surfaces de comptage de parcours sont **data-driven**
(`cat.tracks.filter(isTrackAvailable).length`) — aucun nombre magique (« 6 »)
codé en dur. La page Parcours affiche « 6 disponible · 9 au total ». Les tests
qui épinglaient un compte fixe ont été rendus data-driven (v25-e2e) ou mis à jour
via l'ensemble NOMMÉ des parcours (catalogue).

## G. Anti-slop — mesures appliquées (non négociables)

- **AWS et Azure explicitement distingués** : S3 ≠ Blob Storage, IAM ≠ Entra ID +
  RBAC Azure, security group ≠ NSG, EKS ≠ AKS, RDS ≠ Azure SQL — avec une table de
  correspondance dans `cloud-azure-core`.
- **Aucune affirmation d'exécution réelle** : les leçons Docker/K8s/AWS/Azure/IaC
  n'affirment JAMAIS avoir exécuté un conteneur, un cluster, ni provisionné du cloud
  réel (repères marqués « exemple, non exécuté ici »).
- **Conteneur ≠ VM** : isolation applicative (namespaces/cgroups), noyau partagé —
  jamais présentée comme une isolation OS/VM complète.
- **Secret Kubernetes = base64, PAS chiffré par défaut** : exactitude technique
  soulignée (chiffrement au repos + RBAC + gestionnaire externe pour une vraie
  protection).
- **Secrets factices et manifestes** (ex. `AKIA_EXEMPLE_FACTICE`, mots de passe de
  démo) ; secrets jamais dans les couches d'image ni loggés.
- **Commandes destructrices contextualisées** ; aucun chiffre inventé présenté
  comme réel ; couverture de tests présentée comme signal, pas preuve.
- **Responsabilité partagée** présentée avec exactitude (le client reste
  responsable de ses données/config/accès).

## H. Backlog V27 / V28 (dette documentée)

**V27 (proposé) — Cloud/DevOps : PRATIQUE dédiée + cohérence parcours.**
- Journées/Labs dédiés Kubernetes (manifestes réels guidés, incidents rejouables)
  au-delà des jours 320–321, pour promouvoir `cloud-devops-engineer-v1` d'un cadrage
  junior vers un cadrage plus complet.
- Exercices ciblés adossés aux leçons V26 (ex. lecture de `dig`, calcul CIDR,
  diagnostic CrashLoopBackOff, choix rolling/blue-green/canary).
- Entrées de glossaire pour le vocabulaire V26 non encore couvert (voir I).
- IaC : un mini-parcours conceptuel (plan/apply, drift) SANS provisioning réel.

**V28 (proposé) — Élargissement maîtrisé de la bibliothèque.**
- Observabilité approfondie (métriques/logs/traces, SLI/SLO/error budget) en
  leçons de fond dédiées.
- Bases de données en production (réplication, sauvegardes, migrations sûres) —
  au-delà de la leçon expand/contract de deployment-strategies.
- Messagerie/événementiel (files, idempotence, back-pressure).
- Data/Frontend/Game : rééquilibrage des bibliothèques de fond de CES colonnes,
  hors périmètre V26.

## I. Vérifications effectuées

- `npm run v26:check` : 32 leçons du périmètre valides (structure, liens, concepts,
  unicité). ✅
- `npm test` : **908** tests, 0 échec. ✅
- `npm run gates:active` : ✅ (curriculum:check, depth-check, glossary:check,
  v18:check, v20:pedagogy-check, v26:check).
- `npx tsc --noEmit` : ✅
- `npm run build` : ✅
- **Validation navigateur responsive** (Chromium) : pages de leçons
  (`/doc/lessons/cloud-networking`, `/doc/lessons/k8s-troubleshooting`) et page
  `/parcours` — statut 200, **aucun débordement horizontal** à 375px (mobile) et
  1440px (desktop). Le nouveau parcours est bien compté (« 6 disponible · 9 au
  total »).
- `data/progress.json` (données runtime, gitignoré) non modifié dans les commits.

## J. Hors périmètre V26 (rappel)

Refonte UI/UX globale, gamification, complétion Data/Frontend/Game, exécution IaC
réelle, provisioning cloud réel, cluster K8s réel, réécriture des 365 jours — tout
cela reste hors périmètre et n'a pas été entrepris.
