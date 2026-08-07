# ADR-025 — Cloud Architecture Lab (analyse déterministe d'architectures AWS/Azure)

Statut : accepté (Sprint V25). Décision fondée sur l'audit CP0 réel. **Étend**
l'existant (Cloud Topology Lab V22) ; aucun second moteur de progression, aucune
source de vérité parallèle, aucun nouveau Workbench, **aucun appel AWS/Azure réel**,
aucune credential cloud, aucun provisionnement, aucune revendication d'isolation OS.

## Problème produit

L'audit CP0 montre que le cloud est enseigné au niveau **conceptuel** (responsabilité
partagée, IaaS/PaaS, zones, HA/SPOF/RPO/RTO via le Cloud Topology Lab V22) mais qu'il
manque le niveau **fournisseur raisonné** : IAM (users/roles/policies, moindre
privilège), réseau cloud (VPC/VNet, CIDR, subnets public/privé, security groups/NSG),
compute (VM/serverless/containers — *quand choisir quoi*), stockage (objet/bloc/
fichier), bases managées, disponibilité multi-AZ/multi-région, observabilité cloud,
et **FinOps** (coûts, right-sizing, tagging, budgets). Le but n'est PAS une
encyclopédie de services : c'est **raisonner une architecture** —
besoin → contraintes → identité → réseau → compute → données → disponibilité →
observabilité → coût → architecture → trade-offs — puis mapper vers AWS **et** Azure.

## Décision : une COUCHE PROVIDER-AWARE au-dessus du modèle V22, pas un second moteur

V25 **réutilise** le modèle de topologie déclaratif V22 (`lib/topology.mjs` :
`NODE_KINDS`, `EDGE_KINDS`, zones, `validateTopology`, `analyzeTopology`, `findCycle`,
`longestChain`, `publicTopologyView`) comme **graphe de dépendances sous-jacent**, et
ajoute une **couche cloud provider-aware** :

- `lib/cloud-architecture.mjs` — modèle `CloudArchitecture` = un graphe (nœuds/arêtes,
  réutilisant le vocabulaire V22) **enrichi** de : `provider` (aws|azure|generic),
  `region`, `zones`, `identities` (IAM), `network` (CIDR/subnets/security-groups),
  `costHints`, `constraints`. Validation stricte, PURE, sans I/O.
- `lib/cloud-analysis.mjs` — analyse **composite** : appelle `analyzeTopology` (SPOF,
  cycles, chaînes, disponibilité) PUIS applique des **règles cloud** (IAM wildcard,
  credentials statiques, stockage public, single-AZ critique, absence de backup/
  observabilité, egress inutile, ressource sur-dimensionnée, chevauchement CIDR,
  DB publiquement exposée). Chaque diagnostic : `id, severity, domain, title,
  explanation, evidence, remediation, provider, confidence, real|simulated`.
- `lib/cloud-cost.mjs` — **estimateur de coûts DÉTERMINISTE et FACTICE**, étiqueté
  « pédagogique, non officiel » : barème local versionné (`data/cloud/price-book.json`,
  valeurs `FAKE-*`), jamais un prix cloud réel.

Le produit dit clairement ce qu'il est :

- un **laboratoire d'architecture cloud pédagogique** sur fixtures locales ;
- **pas** AWS, **pas** Azure, **pas** Terraform/CloudFormation/Bicep, **pas** un
  scanner cloud, **pas** un outil FinOps réel, **pas** un émulateur, **pas** un
  environnement isolé.

## Trois niveaux d'honnêteté (réel / simulé / externe non vérifié)

1. **Réel (déterministe, local)** : parsing, validation, analyse de règles, détection
   de chevauchement CIDR, comparaison architecture problématique↔saine, estimation de
   coût déterministe **structurelle**, rendu local.
2. **Simulé** : prix cloud « réel », disponibilité AWS/Azure, incidents datacenter,
   réseau fournisseur, failover/autoscaling réels, métriques cloud, API fournisseur.
3. **Externe non vérifié** : jamais exécuté — aucun appel SDK/CLI/API cloud.

Chaque diagnostic et chaque estimation portent l'étiquette `real|simulated` et des
limites explicites. **Interdit** de présenter une simulation comme un test cloud réel.

## Mapping AWS ↔ Azure : donnée raisonnée, pas table d'équivalence

Le mapping vit dans les **données** (`data/cloud/provider-map.json`) et le contenu
pédagogique, avec pour chaque correspondance : *quand* l'utiliser, *pourquoi*, et les
*différences de modèle* (ex. IAM AWS role+STS vs Azure managed identity + Entra ID).
Jamais un simple « EC2 = VM » sans contrainte ni trade-off.

## Alternatives écartées

- **A. Étendre `topology` en place** (ajouter provider/IAM dans `lib/topology.mjs`) :
  écarté — alourdirait le modèle V22 générique avec des champs cloud non pertinents
  pour ses 3 topologies existantes, et risquerait de casser `v22:check` (historique).
- **Nouveau moteur de graphe indépendant** : écarté explicitement (interdiction de
  moteur parallèle) — on compose `analyzeTopology`, on ne le réécrit pas.

## Conséquences

- Réutilisation maximale (graphe, validation, analyse SPOF, vue publique anti-fuite).
- Le Cloud Architecture Lab devient une **surface data-driven** ; scénarios,
  price-book et provider-map sont versionnés et validés par `v25:check`.
- Sécurité : aucun secret/credential réel ; les valeurs ressemblant à des secrets/ARN
  sont **factices** (`FAKE-…`) et masquées en vue publique.
- Progression : réutilise le moteur v3 (preuves, compétences, missions V18) — aucune
  nouvelle source de progression. Le contenu enrichit le parcours **Systems & Cloud
  Foundations** (et référence sécurité/IAM pour AppSec) ; le parcours **Cloud/DevOps
  Engineer** complet est préparé mais **réservé à V26**.
