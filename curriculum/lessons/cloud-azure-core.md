<!-- keep -->
# Leçon — Azure : les services cœur et le modèle d'identité

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Azure repose sur les MÊMES concepts que n'importe quel cloud (machines, stockage,
réseau, identité) — mais avec une organisation et un vocabulaire qui lui sont
PROPRES, et différents d'AWS. L'erreur numéro un des personnes venant d'AWS est de
chercher un équivalent identique et de tout mélanger (« le S3 d'Azure », « l'IAM
d'Azure »)… qui n'existent pas sous ce nom ni exactement sous cette forme. Deux
spécificités à intégrer d'emblée : une hiérarchie de rangement explicite
(abonnement → groupe de ressources) et une identité en deux parties (l'annuaire
Entra ID + les droits RBAC Azure). Cette leçon présente Azure pour lui-même, PUIS
donne une table de correspondance honnête AWS ↔ Azure pour ne jamais confondre.

## 🎯 Objectif
Se repérer dans Azure : son ORGANISATION propre (**abonnements**, **groupes de
ressources**), les services cœur (**Machines virtuelles**, **Blob Storage**,
**VNet**, **Azure SQL**, **Functions**, **AKS**, **Azure Monitor**) et le modèle
d'identité **Microsoft Entra ID** + **RBAC Azure**. Objectif : lire une
architecture Azure SANS la confondre avec AWS.

## 🧩 Prérequis
Vous devez maîtriser les **concepts génériques** cloud (fondamentaux, réseau —
`/doc/lessons/cloud-fundamentals`, `/doc/lessons/cloud-networking`). Il est très
utile d'avoir lu la leçon **AWS** (`/doc/lessons/cloud-aws-core`) juste avant, pour
COMPARER les deux modèles terme à terme (S3 vs Blob, IAM vs Entra ID + RBAC).

## 🧠 Modèle mental
Azure repose sur les MÊMES concepts cloud (compute, stockage, réseau, identité)
mais avec une ORGANISATION et un vocabulaire distincts d'AWS. Deux spécificités à
intégrer d'emblée : une **hiérarchie de gestion** explicite (management group →
abonnement → groupe de ressources → ressource) et une identité fondée sur
**Entra ID** (l'annuaire) couplée au **RBAC Azure** (les droits sur les
ressources). Confondre les modèles AWS et Azure est l'erreur numéro un.

## 📖 Explication complète
**L'organisation Azure (spécifique).**
- Un **abonnement (subscription)** est l'unité de facturation et de périmètre.
- Un **groupe de ressources (resource group)** regroupe des ressources liées
  (même cycle de vie) — il n'a pas d'équivalent direct aussi central chez AWS.
- Les **management groups** organisent plusieurs abonnements.
Cette hiérarchie structure la facturation, les droits et la gouvernance.

**Les services cœur par catégorie.**
- **Compute** : **Azure Virtual Machines** (VM), **Azure Functions** (serverless),
  **AKS** (Kubernetes managé), **Container Apps/Instances** (conteneurs).
- **Stockage** : **Azure Blob Storage** (stockage OBJET), **Managed Disks**
  (stockage BLOC), **Azure Files** (stockage FICHIER).
- **Réseau** : **VNet** (réseau privé), **NSG** (pare-feu), **Azure Load
  Balancer** (L4) et **Application Gateway** (L7), **Azure DNS**.
- **Bases** : **Azure SQL Database** (relationnel managé), **Cosmos DB** (NoSQL
  managé).
- **Identité** : **Microsoft Entra ID** (ex-Azure AD) + **RBAC Azure**.
- **Observabilité** : **Azure Monitor** (métriques, logs, alertes).

**Identité : Entra ID + RBAC Azure.**
- **Microsoft Entra ID** est l'annuaire d'identités (utilisateurs, groupes,
  applications). C'est le socle d'authentification.
- **Le RBAC Azure** attribue des **rôles** (ex. Reader, Contributor, ou rôles
  personnalisés) à une identité SUR une portée (abonnement, groupe de ressources,
  ressource). L'héritage suit la hiérarchie : un rôle donné au niveau abonnement
  s'applique aux groupes de ressources en dessous.
- Les **identités managées** (managed identities) permettent à une ressource Azure
  d'accéder à d'autres ressources SANS secret en dur — l'équivalent de bonne
  pratique du rôle assumé côté AWS.

**Correspondances AWS ↔ Azure (à ne pas mélanger).**
- S3 ↔ **Blob Storage** ; EBS ↔ **Managed Disks** ; EFS ↔ **Azure Files**.
- EC2 ↔ **Virtual Machines** ; Lambda ↔ **Functions** ; EKS ↔ **AKS**.
- VPC ↔ **VNet** ; security group ↔ **NSG** ; RDS ↔ **Azure SQL**.
- IAM ↔ **Entra ID + RBAC Azure** (attention : IAM AWS combine identité ET droits ;
  Azure sépare l'annuaire Entra ID du RBAC sur les ressources).

**Secrets.** Comme partout : pas de secret en dur ; utiliser **Azure Key Vault**
et les **identités managées**. Les valeurs d'exemple sont manifestement factices.

## 🔧 Repères (illustratifs, non exécutés)
```
Organisation : management group → subscription → resource group → ressource
Compute      : Virtual Machines · Functions · AKS · Container Apps
Stockage     : Blob (objet) · Managed Disks (bloc) · Azure Files (fichier)
Réseau       : VNet · NSG · Load Balancer (L4) / Application Gateway (L7) · Azure DNS
Base         : Azure SQL · Cosmos DB
Identité     : Entra ID (annuaire) + RBAC Azure (droits) · identités managées · Key Vault
Observ.      : Azure Monitor
```

## 🧭 Exemple guidé — donner à une app l'accès à un stockage
1. Pas de secret en dur.
2. Activer une **identité managée** sur la ressource de compute.
3. Attribuer via **RBAC Azure** un rôle minimal (ex. lecture du Blob) à cette
   identité, sur la PORTÉE précise (le compte de stockage concerné).
4. L'app accède au Blob via son identité managée, sans clé.

## ⚠️ Erreurs fréquentes
- **Confondre AWS et Azure** (S3 ≠ Blob, IAM ≠ Entra ID + RBAC, security group ≠
  NSG).
- Oublier la **hiérarchie** (rôle attribué à la mauvaise portée → trop ou pas assez
  de droits).
- Secrets en dur au lieu d'**identités managées** + **Key Vault**.
- Rôle **Contributor/Owner** partout au lieu du moindre privilège.
- Blob public par erreur (fuite de données, responsabilité client).

## 🔐 Sécurité
RBAC Azure au moindre privilège, à la bonne portée ; identités managées plutôt que
secrets ; Key Vault pour les secrets ; conteneurs Blob privés par défaut ;
chiffrement au repos ; Azure Monitor pour l'audit. Comme sur AWS, la sécurité tient
d'abord aux identités et à la config réseau.

## 🏢 Cas métier
Une équipe venue d'AWS a « recréé son schéma IAM » sur Azure et s'est perdue :
elle cherchait un équivalent 1:1 inexistant. En intégrant que l'identité vit dans
**Entra ID** et les droits dans le **RBAC Azure** attribué par portée, et en
utilisant des identités managées, l'architecture d'accès est devenue claire et
sûre.

## 🎤 Questions d'entretien
- « Qu'est-ce qu'un resource group ? » → un regroupement Azure de ressources à
  cycle de vie commun (pas d'équivalent central chez AWS).
- « Comment Azure gère-t-il identité et droits ? » → Entra ID (annuaire) + RBAC
  Azure (rôles par portée) ; identités managées pour l'accès sans secret.
- « Équivalent Azure de S3 ? » → Blob Storage (objet).

## ✍️ Mini-exercice
Une VM Azure doit lire un Blob sans secret en dur. Quelle approche ? → une
identité managée + un rôle RBAC minimal (lecture) attribué sur le compte de
stockage.

## 🧾 À retenir
- Azure = mêmes concepts, organisation propre (subscription → resource group).
- Services cœur : VM/Functions/AKS, Blob/Disks/Files, VNet/NSG, Azure SQL/Cosmos.
- Identité = Entra ID (annuaire) + RBAC Azure (droits par portée) + identités
  managées.
- Ne JAMAIS confondre les services AWS et Azure.

## 📚 Vocabulaire
**subscription / resource group / management group** · **Virtual Machines /
Functions / AKS** · **Blob / Managed Disks / Azure Files** · **VNet / NSG /
Application Gateway** · **Azure SQL / Cosmos DB** · **Entra ID / RBAC Azure /
identité managée / Key Vault** · **Azure Monitor**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je situe l'organisation Azure (subscription/resource group).
- [ ] J'explique Entra ID + RBAC Azure et les identités managées.
- [ ] Je mappe AWS ↔ Azure sans confondre les modèles.

## 🔗 Liens avec le programme
Mois 11 (cloud). Leçons liées : `/doc/lessons/cloud-aws-core`,
`/doc/lessons/cloud-networking`, `/doc/lessons/iac-fundamentals`. La comparaison
AWS/Azure est explicite pour éviter tout mélange.
