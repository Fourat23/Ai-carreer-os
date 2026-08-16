# V47 — Labs externes (EXTERNAL_ENVIRONMENT_REQUIRED)

Ces tâches infra ne sont **pas** exécutables dans la plateforme : aucun démon
Docker, aucun cluster Kubernetes, aucun compte cloud local. Elles sont fournies
**honnêtement** — objectif, prérequis, commandes, preuve attendue, critères de
réussite, modes d'échec — à réaliser dans un vrai environnement, puis à
documenter par la preuve. Source unique : `data/external-tasks.json`.

> Anti-greenwashing : rien ici n'est simulé et présenté comme réel. Là où une
> simulation locale de RAISONNEMENT existe (séries `docker-*`/`k8s-*` en JS),
> elle est signalée comme telle, jamais comme une exécution d'infra.

## Catalogue (7 labs)

| id | compétences | objectif | frontière |
|----|-------------|----------|-----------|
| `ext-docker-run-hardened` | secu, cloud | Conteneur non-root, rootfs read-only, limite mémoire | SIMULATION de raisonnement dispo ; exécution = démon Docker |
| `ext-docker-build-run` | cloud, secu | build + run + logs + diagnostic de restart | Démon Docker requis |
| `ext-compose-healthcheck` | cloud | `depends_on: service_healthy` prouvé | Docker Compose requis |
| `ext-k8s-fix-probe` | cloud, secu | Corriger une readinessProbe ; sortie des endpoints tant que non Ready | Cluster requis (kind/minikube/managé) |
| `ext-k8s-service-endpoints` | cloud, secu | Service sans endpoints (selector ≠ labels) | Cluster requis |
| `ext-aws-s3-least-privilege` | secu, cloud | Accès S3 moindre privilège via rôle IAM (pas de clés) | Compte AWS requis |
| `ext-aws-vpc-least-exposure` | secu, cloud | Base en subnet privé, injoignable d'Internet | Compte AWS requis |

## Contrat de preuve

Chaque lab exige une **preuve vérifiable** (sortie de `docker inspect`,
`kubectl get endpoints`, refus `AccessDenied`, etc.), pas une affirmation. Le
concept sous-jacent (durcissement conteneur, réconciliation K8s, moindre
privilège IAM, exposition réseau) est enseigné et raisonné dans le corpus gelé ;
seule l'exécution réelle est déportée.

## Pourquoi pas de fausse exécution

Simuler un `docker run` ou un `kubectl apply` produirait un faux signal de
compétence (« ça marche » sans qu'aucune infra n'ait tourné). La décision V47
(comme V46) est de préférer une **frontière honnête** : la plateforme enseigne et
fait raisonner, l'environnement externe fait exécuter et fournit la preuve.
