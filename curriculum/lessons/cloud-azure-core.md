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

## 🧭 Exemple guidé — la permission qu'on n'a pas donnée et qui existe quand même

Une application lit un conteneur de stockage grâce à une **identité managée** : une
identité créée et entretenue par la plateforme, à laquelle on attribue des rôles, et
dont les identifiants sont renouvelés automatiquement. Le principe est le même que le
rôle vu côté AWS ; le vocabulaire diffère, le raisonnement non.

Puis un audit signale que cette application peut **écrire** dans un compte de stockage
qu'elle n'est pas censée toucher. Personne ne lui a attribué ce droit. Il existe
pourtant. Voici comment.

### Ce que « portée » veut dire, et pourquoi c'est le cœur du sujet

Une attribution de rôle a toujours deux composantes indissociables : **un rôle** — ce
qu'on peut faire — et **une portée** — où on peut le faire. Les ressources sont
organisées en une hiérarchie à quatre niveaux :

```
groupe d'administration
└── abonnement
    └── groupe de ressources
        └── ressource
```

Et la règle qui explique l'incident tient en une phrase : **une attribution faite à un
niveau s'applique à tout ce qui se trouve en dessous.** Un rôle de contributeur donné
sur un groupe de ressources vaut sur **toutes** les ressources qu'il contient — celles
d'aujourd'hui et celles qui y seront créées demain.

Personne n'a donc « donné » le droit d'écrire sur ce compte de stockage. Quelqu'un a
donné un rôle large un niveau au-dessus, il y a longtemps, probablement pour débloquer
une situation. Le compte de stockage a été créé ensuite dans ce groupe, et il a
**hérité**.

### Pourquoi cette erreur est structurellement fréquente

Elle n'est pas due à de la négligence, mais à une asymétrie : attribuer à un niveau
élevé **fonctionne immédiatement et pour tout**, y compris pour ce qui n'existe pas
encore. Attribuer finement demande de savoir précisément ce dont on a besoin — donc de
recommencer à chaque nouvelle ressource.

L'attribution large est le chemin de moindre effort, et **rien ne signale jamais
qu'elle est trop large**, puisqu'une permission excessive ne produit aucune erreur.

### Comment on diagnostique cela

La question à poser n'est jamais « quel rôle a cette identité ? » mais : **« quels
rôles s'appliquent à cette identité, à tous les niveaux au-dessus de cette
ressource ? »** La différence entre les deux formulations est exactement celle qui a
laissé passer l'incident.

Le réflexe correspondant : quand une permission surprend, remonte la hiérarchie
au lieu de regarder la ressource. La cause est presque toujours plus haut.

### La décision de conception qui découle de tout ça

Elle ne concerne pas les rôles : elle concerne le **découpage des groupes de
ressources**. Puisque tout hérite vers le bas, un groupe de ressources est en réalité
une **frontière de permissions**.

Deux façons de découper, et le choix a des conséquences durables :

- **par environnement** — `prod`, `recette`, `dev`. On peut donner un accès large en
  recette sans exposer la production. C'est le découpage qui protège le mieux.
- **par application** — `facturation`, `crm`. Pratique pour la facturation analytique
  et le cycle de vie, mais si production et recette d'une même application cohabitent,
  toute permission large touche les deux.

Beaucoup d'organisations découvrent ce choix trop tard, quand tout est déjà en place —
et le regroupement est douloureux à changer parce qu'il faut déplacer les ressources.
**Le découpage des groupes est une décision de sécurité prise au premier jour, souvent
sans qu'on s'en rende compte.**

### Le rôle qu'il ne faut pas confondre

Un piège classique : le rôle qui donne l'administration d'une ressource de stockage ne
donne pas nécessairement l'accès **aux données** qu'elle contient — gérer le compte et
lire son contenu sont deux plans distincts. Il existe des rôles pour la gestion et des
rôles pour la donnée.

Conséquence concrète et déroutante : un administrateur peut avoir tous les droits sur
un compte de stockage et se voir refuser la lecture d'un fichier. Ce n'est pas un bug —
c'est la séparation entre le plan de gestion et le plan de données, et elle est
volontaire.

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

## ✍️ Mini-exercice — dessiner la hiérarchie avant d'attribuer un seul rôle

**Contexte.** Une PME de 30 personnes lance une application de gestion de stock. Trois
environnements — production, recette, développement. Quatre populations :

| population | besoin déclaré |
|---|---|
| 2 développeurs | tout créer et détruire en développement, lire la recette |
| 1 responsable technique | déployer en recette et en production |
| l'application elle-même (production) | lire un compte de stockage, écrire dans une base |
| 1 comptable | consulter les coûts, aucun accès technique |

**Ce que tu produis.**

1. Le **découpage en groupes de ressources** que tu proposes, et la raison — en une
   phrase citant ce qu'il protège.
2. Un tableau des attributions : *qui · quel rôle · à quelle portée*.
3. Pour chaque ligne, **ce que cette attribution donne accidentellement en plus** de ce
   qui était demandé. Écris « rien » si tu es sûr — et vérifie deux fois.

**Livrable.** Le schéma de hiérarchie plus le tableau des attributions, une ligne par
population.

**Critère de réussite.** Trois vérifications à faire seul : (1) un développeur ne peut
**rien** modifier en production, même par héritage ; (2) le comptable n'a accès à
aucune donnée applicative ; (3) si tu ajoutes demain une nouvelle base en production,
**aucune** attribution existante ne lui donne automatiquement accès à quelqu'un qui ne
devrait pas l'avoir. La troisième est celle qui sépare une bonne réponse d'une réponse
approximative.

**Piège.** Un des quatre besoins est formulé d'une manière qui pousse à attribuer un
rôle trop large. Repère-le et reformule le besoin avant d'attribuer quoi que ce soit.

## ✅ Correction attendue

**La démarche, et elle est contre-intuitive.** On ne commence pas par les rôles. On
commence par **dessiner la hiérarchie**, parce que c'est elle qui décide de ce qui sera
possible : les rôles ne font qu'exploiter le découpage. Beaucoup de mauvaises
attributions ne sont pas des erreurs de rôle, ce sont des découpages qui ne laissaient
pas le choix.

**1. Le découpage.** Trois groupes de ressources — `stock-prod`, `stock-recette`,
`stock-dev` — donc **par environnement**. Ce qu'il protège, en une phrase : il permet
de donner des droits larges en développement, là où c'est nécessaire et sans
conséquence, sans qu'aucun héritage n'atteigne la production.

Le découpage par application aurait mis les trois environnements dans un même groupe,
et toute attribution large aurait touché la production. Avec 30 personnes, l'écart de
complexité est nul et le gain de sécurité est réel.

**2. Les attributions.**

| qui | rôle | portée |
|---|---|---|
| développeurs | contributeur | `stock-dev` uniquement |
| développeurs | lecteur | `stock-recette` |
| responsable technique | contributeur | `stock-recette` et `stock-prod` |
| identité managée de l'application | lecteur de données blob | le compte de stockage précis |
| identité managée de l'application | rôle d'écriture sur la base | la base précise |
| comptable | lecteur de coûts | l'abonnement |

**3. Ce que chaque ligne donne en plus.** C'est la colonne qui compte.

*Développeurs, contributeur sur `stock-dev`* : ils peuvent créer des ressources qui
coûtent de l'argent. Ce n'est pas un risque de sécurité, c'en est un de facture — à
couvrir par un budget avec alerte, pas par une restriction de droits.

*Comptable, lecteur de coûts sur l'abonnement* : le rôle de gestion des coûts est
conçu pour ne pas donner accès aux ressources ni aux données. C'est un exemple utile
de rôle **non technique** correctement délimité. Attention en revanche à ne pas lui
donner le rôle « lecteur » générique, qui, lui, montre la configuration de toutes les
ressources.

*Responsable technique, contributeur sur `stock-prod`* : il peut détruire la
production. C'est inhérent à son rôle. La protection n'est pas une permission plus
fine, ce sont les **verrous de suppression** sur les ressources critiques et la
journalisation.

**Le piège de l'énoncé.** « Déployer en recette et en production » pousse à attribuer
« contributeur » sur l'abonnement entier — c'est le chemin le plus court, et il donne
en même temps le contrôle du développement et de toute ressource future. Deux
attributions distinctes, une par groupe, coûtent trente secondes de plus et **ne
s'étendent pas** à ce qui sera créé ailleurs.

Reformulé correctement, le besoin n'est pas « déployer » mais « déployer **sur ces deux
environnements-là** ». La portée était dans le besoin ; elle avait juste été omise de
la formulation.

**L'erreur probable.** Attribuer au niveau de l'abonnement « parce que c'est plus
simple à gérer ». C'est effectivement plus simple — c'est même le seul argument, et il
est réel. Mais il faut voir ce qu'on échange : toute ressource créée dans les cinq
prochaines années héritera de ces droits, y compris des ressources que personne n'a
encore imaginées.

**Comment reconnaître ce type de problème.** Deux questions suffisent à auditer
n'importe quelle attribution : *« à quel niveau est-elle posée ? »* et *« que se
passera-t-il pour les ressources qui n'existent pas encore ? »*. La seconde est celle
qu'on ne pose jamais, et c'est celle qui révèle les héritages non voulus.

**Quand la réponse changerait.** À trois personnes et un seul environnement, ce
découpage est du cérémonial. À 300 personnes, il devient insuffisant : il faut des
groupes d'administration au-dessus des abonnements, et l'attribution passe par des
groupes d'utilisateurs plutôt que par des individus. **La granularité du contrôle
d'accès suit la taille de l'organisation**, et la faire précéder de trop loin coûte
plus qu'elle ne protège.

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
