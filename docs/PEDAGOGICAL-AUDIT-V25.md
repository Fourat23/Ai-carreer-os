# Audit pédagogique V19 → V25 — cloud, exploitation & sécurité

Audit **honnête** et échantillonné (pas un comptage de sections). Il met à jour
l'audit V24 en intégrant l'apport V25 (cloud fournisseur AWS/Azure) et réévalue les
domaines croisés (V22 cloud topology, V23 Kubernetes, V24 sécurité).

Barème : **Solide** (exploitable en entretien junior, avec pratique réelle) ·
**Correct** (bases posées, angles morts connus) · **Partiel** (introduit, peu
pratiqué) · **Absent**. Chaque verdict s'appuie sur la pratique livrée et atteignable
(exercices déterministes, missions, scénarios, playbooks), pas sur la seule présence
d'un cours. Classification des signaux : **bloquant / risque / avertissement /
observation**.

## Vue d'ensemble V19 → V25

| Sprint | Apport | Domaine |
|---|---|---|
| V19 | Systems & Cloud Foundations | fondations opérationnelles |
| V20 | Docker | conteneurs |
| V21 | Pipeline Lab | CI/CD |
| V22 | Cloud Topology Lab | architecture/HA (conceptuel) |
| V23 | Kubernetes Manifest Lab | orchestration |
| V24 | Security & Incident Lab | cybersécurité appliquée |
| **V25** | **Cloud Architecture Lab (AWS/Azure)** | **cloud fournisseur** |

## Évaluation par domaine

### Cloud fournisseur (AWS/Azure) — **Correct → Solide** *(nouveau V25)*
- Avant V25 : **Absent** au niveau services (traité conceptuellement par V22). C'était LA lacune majeure de l'audit V24.
- Profondeur : jours 78/79/80/81 enrichis au niveau fournisseur (~17-20 Ko chacun) : responsabilité partagée, IAM, réseau (VPC/VNet, subnets, security groups/NSG), compute (VM/container/serverless), observabilité (CloudWatch/CloudTrail vs Azure Monitor/Activity Log). FinOps sur le jour 325.
- Pratique : Cloud Architecture Lab (6 architectures AWS/Azure problématique↔saine), **17 exercices** (IAM, réseau/CIDR, compute, stockage, résilience, observabilité, FinOps, architecture), **6 missions** (HA API, migration, sécurisation, FinOps, backup/DR, diagnostic).
- Mapping **AWS↔Azure raisonné** (14 correspondances : quand/pourquoi/différence), jamais une simple table.
- Modèle mental visé bien ancré : besoin → identité → réseau → compute → données → disponibilité → observabilité → coût → trade-offs.
- **Manques (honnêtes)** : pas d'IaC réelle (Terraform/Bicep) — volontaire (déterminisme) mais laisse un écart avec le terrain ; les services managés spécifiques (files, event bus, data lakes) restent hors périmètre ; la pratique reste de l'analyse déclarative, pas de la manipulation de console.

### IAM / identité cloud — **Correct** *(nouveau V25)*
- Glossaire : principal, policy, STS, managed identity, service principal, RBAC (V24), moindre privilège (V24). Exercices : excess-actions, wildcard, credential-choice. Règle d'analyse IAM wildcard + credentials statiques.
- **Manques** : pas de rédaction de policy complète (conditions, scopes fins) ; la fédération d'identité et le SSO restent au niveau vocabulaire.

### Réseau cloud — **Correct** *(renforcé V25)*
- Réseau général **Solide** (jour 71, V19). V25 ajoute le niveau cloud : VPC/VNet, subnets public/privé, route table, IGW/NAT, security groups/NSG/NACL, private endpoint, egress, north-south/east-west. Exercices : subnet-visibility, cidr-overlap, sg-port-range.
- **Manques** : peering, VPN/Direct Connect, DNS privé restent conceptuels.

### Compute & scaling — **Correct** *(nouveau V25)*
- Choix VM/container/serverless (quand/pourquoi), scaling horizontal/vertical, autoscaling, stateless, cold start, spot, scale-to-zero, VM scale set. Exercices : compute-choice, scaling-kind.
- **Manques** : la pratique est décisionnelle (choisir), pas opérationnelle (configurer un ASG réel).

### Stockage & données managées — **Correct** *(nouveau V25)*
- Objet/bloc/fichier (V25), durability vs availability, read replica, storage lifecycle, connection pooling, DB saturation. Exercices : storage-class. Bases managées traitées côté résilience/coût.
- **Manques** : modélisation NoSQL, sharding, cohérence — introduits en glossaire, peu pratiqués.

### Résilience & DR — **Solide** *(renforcé V25)*
- HA/SPOF/failover **Solide** depuis V22. V25 ajoute multi-AZ/multi-région, RTO/RPO chiffrés, backup testé, pilot light, cross-region replication. Exercices : spof-detect, multi-az, rpo-meets. Mission backup/DR (RPO/RTO argumentés). Playbook « panne de région ».
- **Manques** : pas d'exercice de bascule chronométrée ; le chaos engineering reste hors périmètre.

### Observabilité cloud — **Correct** *(renforcé V25)*
- Observabilité générale **Correct** (jour 79). V25 ajoute CloudWatch/CloudTrail, Azure Monitor/Log Analytics/Activity Log, distinction audit vs métriques. Exercice : observability-gap. Mission de diagnostic. Playbook « latence après release ».
- **Manques** : traces distribuées et corrélation restent conceptuelles ; SLO chiffrés peu pratiqués.

### FinOps — **Correct** *(nouveau V25)*
- Jour 325 enrichi + glossaire riche (FinOps, right-sizing, reserved, egress cost, unit economics, tagging, budgets, Cost Explorer/Cost Management). Exercices : monthly-cost, rightsizing-savings. Mission « réduire la facture » (décision chiffrée). Playbooks « facture explosée » / « trop cher ».
- **Manques** : pas de modèle de coût réel (barème FACTICE assumé) ; l'allocation multi-équipes reste théorique.

### Domaines antérieurs (rappel) — inchangés
Linux **Solide**, Docker **Solide**, CI/CD **Correct→Solide**, Kubernetes **Solide**,
secrets **Solide**, RBAC **Solide**, réponse à incident **Solide** (V24). V25 ne les
dégrade pas ; il les relie au cloud (ex. RBAC ↔ IAM, incident ↔ playbooks cloud).

## Transversal
- **Glossaire** : 583 entrées (V25 : +63 cloud, liens vérifiés).
- **« Que faire dans ce cas ? »** : 25 playbooks (10 cloud), même schéma 15 rubriques, browsables sur /cloud-foundations.
- **Recherche** : architectures cloud, playbooks cloud, glossaire et parcours tous retrouvables ; aucune donnée privée indexée.
- **Réel vs simulé** : chaque diagnostic porte real/simulated ; le coût est explicitement FACTICE ; aucun appel AWS/Azure.

## Signaux à traiter (priorisés)
1. **[avertissement] IaC réelle absente** : le cloud est analysé en déclaratif, jamais provisionné/écrit en Terraform/Bicep. Écart assumé (déterminisme) mais à combler côté pratique dans un futur sprint.
2. **[avertissement] Pas de parcours Cloud/DevOps complet** : V25 enrichit le socle ; l'assemblage en parcours dédié est réservé à V26 (choix explicite pour éviter un parcours superficiel).
3. **[observation] Services managés spécifiques** (files, event bus, data lake) hors périmètre — acceptable au niveau fondations.
4. **[observation] Crypto/PKI** (KMS/WAF introduits en glossaire) : peu pratiqués.
5. **[observation] Data NoSQL avancée** (sharding, cohérence) : glossaire seulement.

## Verdict
Le **cloud fournisseur**, grand absent de l'audit V24, est désormais **enseigné et
pratiqué au niveau du raisonnement d'architecture** (AWS et Azure), avec exercices
déterministes, missions et playbooks. Il atteint « exploitable en entretien junior »
sur la CONCEPTION et l'ANALYSE ; il reste, volontairement, en deçà sur la
MANIPULATION opérationnelle (IaC, consoles réelles) — c'est le prochain palier, et
l'objet du parcours Cloud/DevOps de V26. Aucun domaine n'est déclaré « complet » sur
la seule présence d'un cours ; les lacunes ci-dessus sont explicites.
