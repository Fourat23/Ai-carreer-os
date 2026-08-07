# Audit pédagogique V19 → V24 — état réel des domaines d'exploitation & sécurité

Audit **honnête** et échantillonné (pas un simple comptage de sections). Objectif :
mesurer la profondeur réelle, l'exactitude, la progressivité et l'adéquation
recrutement des domaines construits ou enrichis de V19 à V24, et **lister
explicitement ce qui reste superficiel ou absent**.

Méthode : lecture d'échantillons de contenu (jours d'ancrage), inventaire des
exercices/missions/scénarios/playbooks réellement livrés, vérification de
l'atteignabilité depuis les parcours. Barème par domaine : **Solide** (exploitable
en entretien junior) · **Correct** (bases posées, angles morts connus) · **Partiel**
(introduit mais peu pratiqué) · **Absent**.

## Vue d'ensemble V19 → V24

| Sprint | Apport principal | Domaine |
|---|---|---|
| V19 | Parcours Systems & Cloud, fondations opérationnelles | terminal, réseau, sécurité de base |
| V20 | Docker (dockerisation, durcissement, incidents conteneur) | conteneurs |
| V21 | Pipeline Lab (CI/CD déterministe) | CI/CD |
| V22 | Cloud Topology Lab (HA, SPOF, déploiements) | cloud/architecture |
| V23 | Kubernetes Manifest Lab (Pod/Deployment/Service, probes, incidents) | orchestration |
| V24 | Security & Incident Lab, parcours AppSec, glossaire+playbooks | cybersécurité appliquée |

## Évaluation par domaine

### Linux / terminal — **Solide**
- Profondeur : jour 72 (~15 Ko) couvre permissions, processus, scripts, services ; complété par le terminal du Systems & Cloud.
- Exercices : 6 (`sys-*`). Modèles mentaux : bons (permissions octales, arborescence, codes de sortie).
- Manques : peu d'exercices sur les signaux/`systemd` ; observabilité système (strace, /proc) surtout théorique.

### Réseau — **Correct → Solide**
- Profondeur : jour 71 (~15 Ko) DNS/TCP/TLS/HTTP, diagnostic par couches.
- Exercices : 4 (`net-*`) — diagnostic par couche, résolution DNS, première défaillance.
- Manques : peu de pratique sur TLS (handshake, certificats), pas d'exercice pare-feu/routage concret. Le playbook « incident réseau » (V24) comble partiellement le volet réponse.

### Docker — **Solide**
- Profondeur : jour 320 (~16 Ko) images/couches, Dockerfile, durcissement (non-root, read-only, digest).
- Exercices : 10 (`docker-*`) dont détection de secret/root, tag vs digest. Bien pratiqué.
- Manques : réseaux Docker et volumes surtout théoriques ; multi-stage pratiqué indirectement.

### CI/CD — **Correct → Solide**
- Profondeur : jour 326 (~14 Ko) + Pipeline Lab (V21). DAG, chemin critique, fail-fast, secrets, promotion/rollback.
- Exercices : 12 (`cicd-*`), déterministes et variés (topo-order, cycle, cache, promotion).
- Manques : pas de vrai fichier de CI d'une plateforme concrète (GitHub Actions/GitLab) à écrire — volontaire (déterminisme), mais laisse un écart avec le terrain. Le playbook « pipeline bloqué » (V24) ajoute le volet réponse.

### Cloud / architecture — **Correct**
- Profondeur : jour 79 (~16 Ko) observabilité, jours 78-81 + Cloud Topology Lab (HA, SPOF, failover, déploiements).
- Exercices : 14 (`cloud-*`) — SPOF, multi-zone, error budget, readiness.
- Manques : **le cloud « fournisseur » (IAM, VPC, stockage, coûts) est ABSENT** — c'est précisément l'objet du sprint V25. Aujourd'hui le cloud est traité au niveau conceptuel (responsabilité partagée, IaaS/PaaS), pas au niveau des services AWS/Azure.

### Kubernetes — **Solide**
- Profondeur : jour 321 (~15 Ko) + Kubernetes Manifest Lab (V23). Pod/Deployment/Service, probes, rollout/rollback, CrashLoopBackOff/OOMKilled, réconciliation.
- Exercices : 16 (`k8s-*`) — le domaine le plus densément pratiqué. RBAC, securityContext, NetworkPolicy ajoutés côté sécurité en V24 (jour 85 + glossaire).
- Manques : StatefulSet/PVC introduits mais peu pratiqués ; pas de Helm/Kustomize (hors périmètre assumé).

### Cybersécurité (appliquée) — **Correct → Solide** *(nouveau V24)*
- Profondeur : Security & Incident Lab déterministe (4 scénarios vulnérable↔corrigé), moteur d'incident (6 incidents × 6 phases), base CVE **factice**.
- Exercices : 15 (`sec-*`) — masquage de secret, ordre de réponse, RBAC wildcard, securityContext, NetworkPolicy, lockfile, typosquatting, blast radius, décision de récupération, ordre de remédiation.
- Missions : 6 (fuite de secret, dépendance compromise, RBAC excessif, durcissement, déploiement cassé, incident combiné).
- Honnêteté : chaque diagnostic porte confiance + réel/simulé + limites ; **ce n'est pas un scanner/SAST**, c'est affirmé partout.
- Manques : pas de crypto appliquée (chiffrement, PKI) au-delà du vocabulaire ; l'authn/authz applicative (OAuth/OIDC/JWT) reste au niveau du jour 68 (token) sans exercices dédiés.

### Secrets — **Solide** *(renforcé V24)*
- Profondeur : jour 68 (~15 Ko) cycle de vie, rotation, révocation, coffre, « Que faire dans ce cas ? ».
- Pratique : exercices masquage/classification/ordre de réponse ; mission fuite de secret (runbook + post-mortem). Playbook « secret exposé » complet.
- Modèle mental clé bien ancré : **révocation → rotation → redéploiement → audit**, et « un secret fuité est compromis même si personne ne l'a vu ».
- Manques : gestion de secrets à courte durée de vie / coffres réels (Vault) restent conceptuels.

### Supply chain — **Correct** *(nouveau V24)*
- Profondeur : jour 298 (~12 Ko) lockfile, pinning, digest, provenance, SBOM, typosquatting, dependency confusion.
- Pratique : exercices lockfile-diff, typosquat, sbom, cve-affected ; mission dépendance compromise ; playbook dédié + scénario.
- Manques : la **signature/provenance (SLSA, cosign) reste au niveau glossaire** — pas d'exercice de vérification de signature. C'est le domaine le plus « jeune » (le plus court des jours d'ancrage : 12 Ko).

### RBAC / moindre privilège — **Solide** *(nouveau V24)*
- Profondeur : jour 85 (~19 Ko, le plus riche) RBAC, moindre privilège, securityContext, NetworkPolicy, « Que faire dans ce cas ? ».
- Pratique : exercices wildcard, least-privilege, securitycontext, networkpolicy-open ; scénario RBAC ; glossaire (Role, ClusterRoleBinding, wildcard permission, privilege escalation).
- Manques : IAM cloud (politiques AWS/Azure) absent — renvoyé à V25.

### Réponse à incident — **Solide** *(nouveau V24)*
- Profondeur : moteur d'incident (détection→qualification→confinement→éradication→récupération→post-mortem), decideRecovery (rollback/roll-forward/hotfix/mitigation), 15 playbooks « Que faire dans ce cas ? » de qualité opérationnelle.
- Pratique : missions incident (runbook, post-mortem, plan de rollback, décision argumentée) ; E2E complet.
- Glossaire : severity, containment, eradication, remediation, IoC, MTTD/MTTR, blameless post-mortem, emergency change, kill switch.
- Manques : pas de simulation temps réel (volontaire) ; la communication de crise est couverte côté playbook mais sans gabarit de statut prêt à l'emploi.

## Transversal

- **Glossaire** : 520 entrées (V24 : +37 termes cybersécurité, schéma riche, liens vérifiés).
- **« Que faire dans ce cas ? »** : 15 playbooks professionnels (15 rubriques chacun), browsable et indexés dans la recherche globale.
- **Recherche** : cours, exercices, missions, scénarios, playbooks, glossaire et parcours sont tous retrouvables ; aucune donnée privée indexée.
- **Parcours** : 5 disponibles, dont AppSec & Cloud Security (V24), data-driven, isolés.

## Lacunes restantes (honnêtes, priorisées)

1. **Cloud fournisseur (AWS/Azure)** — absent : IAM, VPC/réseau, stockage, compute, coûts/FinOps. → **objet de V25**.
2. **Crypto appliquée & PKI** — vocabulaire seulement ; pas d'exercice TLS/certificats/chiffrement.
3. **Authn/Authz applicative** (OAuth2/OIDC/JWT) — introduite au jour 68, sans exercices dédiés.
4. **Signature/provenance d'artefacts** (SLSA, cosign) — glossaire uniquement, pas de pratique.
5. **Observabilité avancée** (traces distribuées, corrélation, SLO chiffrés) — surtout conceptuelle.
6. **Supply chain** est le domaine sécurité le plus jeune : à densifier (vérification de signature, registres privés).

## Verdict

Les domaines **exploitation** (Linux, Docker, CI/CD, Kubernetes) et **sécurité
appliquée** (secrets, RBAC, réponse à incident) sont désormais **exploitables en
entretien junior**, avec pratique réelle (exercices déterministes + missions +
playbooks). Le **cloud fournisseur** reste le grand absent, traité conceptuellement
mais jamais au niveau des services — c'est le chaînon manquant que V25 doit combler.
Aucun domaine n'est déclaré « complet » sur la seule présence d'un cours : chaque
verdict ci-dessus s'appuie sur la pratique réellement livrée et atteignable.
