# HSD-026 — Expansion de la fondation pédagogique (High-Level Solution Design)

HSD = High-Level Solution Design. Conception de haut niveau de l'expansion des
« Leçons de fond » Cloud/DevOps V26, cohérente avec ADR-026. Local, sans réseau.

## 1. Objectif
Combler la dette pédagogique : donner un corpus canonique profond aux domaines que
les Labs exercent déjà (Linux système, réseau, Docker, CI/CD, Kubernetes, cloud,
AWS/Azure, IaC, FinOps), puis assembler un parcours Cloud/DevOps cohérent.

## 2. Briques réutilisées (aucune nouvelle source de vérité)
| Brique | Origine | Rôle en V26 |
|---|---|---|
| Fichiers `.md` `curriculum/lessons/` | existant | contenu des nouvelles leçons (keep) |
| `LESSONS` dans `scripts/data/lessons-map.mjs` | existant | métadonnées → program.json |
| `generate-curriculum.mjs` | existant | injecte lessons dans program.json |
| `/lessons` + `/doc/lessons/[slug]` | existant | surfaces de lecture |
| recherche (`buildIndex`) | existant | indexation (leçons déjà indexées via lien) |
| catalogue (`lib/catalogue.mjs`) | existant | parcours cloud-devops-engineer-v1 |
| moteur v3, exercices, missions, playbooks, glossaire | existant | liens pédagogiques |

## 3. Modèle de métadonnée d'une leçon
`{ file, title, cat, level (1-3), min, skills[] }` — schéma existant, inchangé.
Catégories utilisées : « Fondations », « Production & DevOps », et une nouvelle
famille cohérente « Systèmes & Cloud » pour regrouper Linux/réseau/Docker/K8s/cloud
(catégorie = libellé libre, aucune contrainte de code — vérifié CP0).

## 4. Périmètre des leçons (plan, ~28-32)
- **Linux système (5)** : filesystem & permissions ; processus & signaux ; services & systemd ; ressources (CPU/mém/IO/fd) ; SSH & accès distant.
- **Réseau (5)** : modèle TCP/IP ; DNS ; HTTP & TLS ; NAT/proxy/reverse-proxy/load-balancer ; diagnostic réseau (ce que chaque outil prouve/ne prouve pas).
- **Docker (5)** : images & layers ; Dockerfile & build ; réseau & volumes ; Compose ; durcissement production.
- **CI/CD & delivery (4)** : anatomie de pipeline ; quality gates & artefacts ; stratégies de déploiement (canary/blue-green/rolling) ; récupération d'incident (rollback/roll-forward/hotfix/bugfix).
- **Kubernetes (6)** : pourquoi/architecture ; workloads (Pod/Deployment/ReplicaSet) ; réseau & Services ; config & probes & ressources ; troubleshooting (CrashLoop/OOM/Pending) ; sécurité (RBAC/securityContext/NetworkPolicy).
- **Cloud/AWS/Azure/IaC/FinOps (7)** : concepts cloud transverses ; IAM & identité ; réseau cloud (VPC/VNet) ; compute & stockage & données managées ; résilience & DR (HA/RTO/RPO) ; FinOps ; IaC (Terraform/Bicep/CloudFormation en mapping).

Ajustable à la baisse si la qualité l'exige ; tout report est documenté en backlog.

## 5. Anti-slop & graphe
Gate `v26:check` (structurelle) + audit humain. Liens via `/doc/lessons/<slug>`,
`/day/<n>`, `/lab/<id>`, `/glossary?q=`. Prérequis déclarés en tête de leçon.

## 6. Parcours Cloud/DevOps
`cloud-devops-engineer-v1` : modules data-driven sur journées existantes (terminal,
Linux, réseau, HTTP, sécurité, observabilité, Docker, CI/CD, K8s, cloud), durée
dérivée. Chaque module recommande les nouvelles leçons. Activé si le corpus le
supporte ; sinon dette documentée.

## 7. Gate & tests
`v26:check` ajoutée à gates:active. Tests : structure des leçons, unicité, liens,
concepts, parcours (catalogue), isolation. Cycle de vie des gates respecté.

## 8. Non-régression
Aucune leçon existante appauvrie. `generate` préserve les `<!-- keep -->`.
progress.json sauvegardé/restauré à chaque test. Bundles inchangés (pages de
lecture, aucun composant lourd).
