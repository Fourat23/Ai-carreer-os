<!-- keep -->
# Leçon — AWS : les services cœur et le modèle IAM

## 🌍 Le problème d'abord
AWS propose des CENTAINES de services aux noms opaques (EC2, S3, IAM, VPC…). Le
débutant se noie et croit qu'il faut tout mémoriser. En réalité, chaque service
n'est que la version AWS d'un concept que vous connaissez DÉJÀ : une machine, un
espace de stockage, un réseau, une base, un contrôle d'accès. La vraie compétence
n'est pas de réciter la liste, c'est de RANGER chaque service dans sa catégorie et
de maîtriser **IAM** — le système qui décide qui a le droit de faire quoi, et d'où
viennent la plupart des incidents de sécurité AWS. Cette leçon donne cette grille de
lecture et insiste sur IAM, sans jamais confondre AWS avec Azure (voir la leçon
Azure pour la correspondance).

## 🎯 Objectif
Se repérer dans AWS : les services fondamentaux (**EC2**, **S3**, **VPC**,
**RDS**, **Lambda**, **ECS/EKS**, **CloudWatch**) et surtout le modèle
d'**IAM** (utilisateurs, rôles, politiques) qui gouverne QUI peut faire QUOI.
Objectif : lire une architecture AWS et raisonner ses accès — sans confondre AWS
et Azure.

## 🧩 Prérequis
Vous devez maîtriser les **concepts génériques** cloud : fondamentaux
(`/doc/lessons/cloud-fundamentals`), réseau (`/doc/lessons/cloud-networking`) et
compute/stockage (`/doc/lessons/cloud-compute-storage`) — car cette leçon ne fait que
donner les NOMS AWS de ces concepts. Comprendre d'abord le générique évite
d'apprendre AWS « par cœur ».

## 🧠 Modèle mental
AWS est un catalogue immense, mais quelques services portent l'essentiel. Le fil
conducteur pour NE PAS se perdre : ranger chaque service dans une catégorie
(compute, stockage, réseau, base, identité, observabilité) déjà apprise en
concepts. Le point qui distingue les bons ingénieurs AWS des autres n'est pas la
liste des services, c'est la maîtrise d'**IAM** : le contrôle d'accès y est
central et transverse.

## 📖 Explication complète
**Les services cœur par catégorie.**
- **Compute** : **EC2** (machines virtuelles), **Lambda** (serverless), **ECS** et
  **EKS** (conteneurs ; EKS = Kubernetes managé).
- **Stockage** : **S3** (stockage OBJET, le service emblématique), **EBS**
  (stockage BLOC pour EC2), **EFS** (stockage FICHIER partagé).
- **Réseau** : **VPC** (réseau privé), **security groups** (pare-feu stateful),
  **ELB/ALB/NLB** (équilibrage L4/L7), **Route 53** (DNS).
- **Bases** : **RDS** (relationnel managé), **DynamoDB** (NoSQL managé).
- **Identité** : **IAM** (voir plus bas).
- **Observabilité** : **CloudWatch** (métriques, logs, alarmes).

**IAM — le cœur du contrôle d'accès.**
- **Utilisateurs** et **groupes** : identités humaines (à limiter ; on privilégie
  la fédération / les rôles).
- **Rôles** : identité assumable temporairement par un service ou un utilisateur.
  Une instance EC2, une fonction Lambda, un Pod EKS assument un RÔLE pour agir —
  c'est LA bonne pratique : pas de clés en dur, des permissions attachées au rôle.
- **Politiques (policies)** : documents JSON qui autorisent/refusent des ACTIONS
  sur des RESSOURCES, éventuellement sous CONDITIONS. Le principe est le moindre
  privilège : n'accorder que les actions nécessaires.
- Piège majeur : les politiques trop larges (`"Action": "*"` sur `"Resource":
  "*"`). Un rôle sur-permissif transforme une petite compromission en incident
  majeur.

**Racine et bonnes pratiques.** Le compte **root** est tout-puissant : on ne
l'utilise pas au quotidien, on active le MFA, on crée des identités à privilèges
limités. Les **régions** (`eu-west-1`, `us-east-1`…) isolent les ressources
géographiquement.

**Secrets et clés.** Les identifiants d'accès (access key/secret) ne se codent
JAMAIS en dur : on utilise des rôles (pour les services) et un gestionnaire de
secrets. Dans les exemples pédagogiques, tout identifiant est manifestement factice
(ex. `AKIA_EXEMPLE_FACTICE`).

## 🔧 Repères (illustratifs, non exécutés)
```
Compute   : EC2 (VM) · Lambda (serverless) · ECS/EKS (conteneurs)
Stockage  : S3 (objet) · EBS (bloc) · EFS (fichier)
Réseau    : VPC · security groups · ALB/NLB · Route 53
Base      : RDS (SQL) · DynamoDB (NoSQL)
Identité  : IAM (utilisateurs, rôles, policies)
Observ.   : CloudWatch
```

## 🧭 Exemple guidé — donner à une app l'accès à un bucket
1. NE PAS coder des clés d'accès en dur dans l'application.
2. Créer un **rôle IAM** avec une **policy** autorisant SEULEMENT les actions
   nécessaires (`s3:GetObject`) sur le bucket PRÉCIS.
3. Attacher ce rôle au compute (instance EC2 / fonction Lambda / Pod EKS).
4. L'app agit via le rôle : pas de secret à gérer, permissions minimales.

## ⚠️ Erreurs fréquentes
- **Clés d'accès en dur** dans le code au lieu d'un rôle IAM.
- Policies trop larges (`*`/`*`) → moindre privilège bafoué.
- Utiliser le compte **root** au quotidien.
- Confondre **S3** (objet) et un disque **EBS** (bloc).
- Confondre les noms AWS avec ceux d'Azure (S3 ≠ Blob Storage, IAM ≠ Entra ID).

## 🔐 Sécurité
IAM au moindre privilège, rôles plutôt que clés, MFA, root verrouillé, buckets S3
privés par défaut (fuite S3 = incident classique, responsabilité client),
chiffrement au repos. CloudWatch/CloudTrail pour l'audit. La sécurité AWS est
d'abord une affaire d'identités et de config réseau correctes.

## 🏢 Cas métier
Une application embarquait des clés d'accès S3 en dur, retrouvées dans un dépôt
public. Remédiation : révoquer les clés, passer à un **rôle IAM** attaché au
compute avec une policy minimale sur le seul bucket concerné, rendre le bucket
privé. Plus aucun secret à gérer côté application, surface d'attaque réduite.

## 🎤 Questions d'entretien
- « Différence entre un utilisateur et un rôle IAM ? » → identité permanente vs
  identité assumable temporairement (préférée pour les services).
- « Comment une app AWS accède-t-elle à S3 proprement ? » → via un rôle IAM à
  permissions minimales, pas des clés en dur.
- « Qu'est-ce que S3 ? » → stockage OBJET (pas un disque bloc).

## ✍️ Mini-exercice
Une fonction Lambda doit lire un bucket S3. Clés en dur ou rôle IAM ? → un rôle IAM
avec une policy minimale (`s3:GetObject` sur ce bucket), assumé par la fonction.

## 🧾 À retenir
- Services cœur par catégorie : EC2/Lambda/ECS-EKS, S3/EBS/EFS, VPC, RDS/DynamoDB,
  IAM, CloudWatch.
- IAM est central : utilisateurs, ROLES (préférés), policies au moindre privilège.
- Rôles plutôt que clés en dur ; root verrouillé + MFA.
- Ne pas confondre les services AWS avec leurs équivalents Azure.

## 📚 Vocabulaire
**EC2 / Lambda / ECS / EKS** · **S3 / EBS / EFS** · **VPC / security group / ALB** ·
**RDS / DynamoDB** · **IAM (utilisateur / rôle / policy)** · **compte root / MFA** ·
**CloudWatch / CloudTrail**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je range les services AWS cœur par catégorie.
- [ ] J'explique le modèle IAM (rôles, policies, moindre privilège).
- [ ] Je donne un accès via un rôle, pas des clés en dur.

## 🔗 Liens avec le programme
Mois 11 (cloud). Leçons liées : `/doc/lessons/cloud-azure-core`,
`/doc/lessons/cloud-networking`, `/doc/lessons/iac-fundamentals`. À comparer
systématiquement avec Azure pour ne pas mélanger les modèles.
