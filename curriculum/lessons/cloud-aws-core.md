<!-- keep -->
# Leçon — AWS : les services cœur et le modèle IAM

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


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

## 🧭 Exemple guidé — d'où vient le mot de passe qui n'existe pas

« Ne code pas tes clés en dur, utilise un rôle » est le conseil qu'on lit partout. Il
laisse une question sans réponse, et c'est celle qui empêche de comprendre :
**si l'application n'a aucune clé, comment le service de stockage sait-il qui elle
est ?**

Tant qu'on n'a pas répondu à ça, le rôle reste une formule magique. Déroulons-le.

### Ce qui se passe réellement, en quatre temps

**1.** Tu crées un **rôle**. Un rôle n'est pas un utilisateur : c'est une identité que
personne ne possède, sans mot de passe, et que l'on peut **emprunter**. Deux documents
lui sont attachés, et les confondre est l'erreur la plus courante du sujet :

- la **politique de confiance** dit *qui a le droit d'emprunter ce rôle* ;
- la **politique de permissions** dit *ce que le rôle permet de faire*.

**2.** Tu attaches ce rôle à une machine. Concrètement, tu déclares dans la politique
de confiance que le service de calcul a le droit de l'emprunter.

**3.** Au démarrage, la plateforme dépose sur la machine des **identifiants
temporaires** — une clé, un secret, un jeton de session, valables quelques heures. Ils
sont accessibles à l'application via un point de terminaison local, une adresse
interne joignable uniquement depuis la machine elle-même. La bibliothèque officielle
va les y chercher toute seule ; c'est pour cela que ton code n'a l'air de rien
contenir.

**4.** Ces identifiants **expirent**, et la plateforme les renouvelle automatiquement
avant l'échéance.

### Pourquoi c'est meilleur qu'une clé — et ce n'est pas ce qu'on croit

L'avantage n'est pas « on ne stocke pas de secret ». Un secret existe bel et bien : il
est simplement de courte durée et déposé par la plateforme.

Le vrai avantage est **la durée de vie**. Une clé permanente copiée dans un dépôt Git
en 2023 fonctionne encore aujourd'hui. Un identifiant temporaire volé cesse de
fonctionner en quelques heures — et surtout, **il n'y a rien à faire tourner** le jour
où quelqu'un part de l'entreprise ou qu'une machine est compromise. La rotation est le
comportement par défaut, pas une procédure qu'on oublie d'appliquer.

### La décision qui est réellement difficile

Elle n'est pas « rôle ou clé » — la réponse est connue. Elle est : **quelle portée
donner à la permission ?**

Trois formulations, du pire au meilleur :

```
"Resource": "*"                                     tout, partout
"Resource": "arn:aws:s3:::factures-prod"            ce dépôt-là
"Resource": "arn:aws:s3:::factures-prod/2026/*"     ce dépôt, ce préfixe
```

La première fonctionne toujours du premier coup, et c'est exactement ce qui la rend
dangereuse : elle est écrite pendant le développement « pour débloquer », et personne
ne revient la restreindre parce que **rien ne casse**.

Même chose sur les actions. `s3:*` inclut la suppression. Une application qui ne fait
que lire des factures ne devrait pas pouvoir les effacer — non parce qu'elle le ferait,
mais parce qu'une faille dans son code ne doit pas donner ce pouvoir.

**La règle utilisable : commence par refuser, ouvre au fur et à mesure des erreurs
d'accès.** C'est plus lent d'une heure au début, et cela évite une permission
excessive qui vivra des années.

### La question qu'un audit posera

« Cette application peut-elle supprimer des données ? » Si tu ne peux pas répondre par
oui ou par non en lisant une politique, c'est que la politique est trop large pour
être comprise — donc trop large.

### Le piège des permissions qui se cumulent

Une même identité peut recevoir des permissions par plusieurs chemins : politique
attachée au rôle, politique attachée à la ressource elle-même, règles au niveau de
l'organisation. L'effet est **cumulatif pour les autorisations**, mais un **refus
explicite l'emporte toujours** sur n'importe quelle autorisation.

Conséquence pratique : quand un accès échoue alors que « la politique autorise », ne
cherche pas l'autorisation manquante — cherche le **refus** qui la neutralise, souvent
défini plus haut par une équipe sécurité.

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

## ✍️ Mini-exercice — écrire quatre politiques, et une qui refuse

**Contexte.** Une application de facturation, quatre composants, un dépôt de stockage
`factures-prod` organisé ainsi : `2026/`, `archives/`, `exports-clients/`.

| composant | ce qu'il doit faire |
|---|---|
| API web | lire les factures de l'année en cours |
| service d'export | écrire dans `exports-clients/`, lire l'année en cours |
| tâche d'archivage nocturne | déplacer les factures de plus d'un an vers `archives/` |
| tableau de bord d'analyse | compter les factures, sans lire leur contenu |

**Ce que tu produis.** Pour chacun des quatre : les **actions** minimales et la
**portée** minimale, en écrivant le motif de ressource exact. Puis, pour chacun, la
phrase : *« si ce composant est compromis, l'attaquant peut … et ne peut pas … »*.

Ajoute enfin une **politique de refus** applicable à l'ensemble, qui protège quelque
chose qu'aucune des quatre autorisations ne protège.

**Livrable.** Quatre blocs `actions / ressource / conséquence d'une compromission`,
plus la règle de refus et sa justification en une phrase.

**Critère de réussite.** Vérification que tu fais seul : pour chaque composant,
demande-toi *« puis-je retirer une action ou restreindre encore la portée sans casser
la fonction décrite ? »*. Si oui, tu n'as pas fini. Et vérifie qu'**aucun des quatre**
ne peut supprimer une facture de `2026/`.

**Piège.** Deux des quatre composants ont un besoin qui **paraît** exiger une
permission large et qui ne l'exige pas. Le troisième a un besoin qui semble simple et
demande en réalité deux permissions distinctes.

## ✅ Correction attendue

**La démarche.** Pour chaque composant, deux questions dans l'ordre : *quel verbe
exactement ?* puis *sur quel sous-ensemble exactement ?* On écrit la permission la
plus étroite qui rend le service décrit, puis on élargit seulement si une erreur
d'accès le prouve nécessaire.

**API web.** `s3:GetObject` sur `factures-prod/2026/*`. Compromise, elle permet de lire
les factures de l'année ; elle ne permet ni d'écrire, ni de supprimer, ni de toucher
aux archives.

**Service d'export.** C'est le composant à **deux permissions distinctes**, et c'est le
piège annoncé : `s3:GetObject` sur `factures-prod/2026/*` **et** `s3:PutObject` sur
`factures-prod/exports-clients/*`. Le réflexe est d'écrire une seule règle en lecture-
écriture sur tout le dépôt. Ce serait accorder l'écriture sur les factures elles-mêmes
— exactement le pouvoir qu'on veut refuser à un service qui ne fait qu'exporter.

**Tâche d'archivage.** Elle « déplace », et le déplacement n'existe pas : c'est une
copie suivie d'une suppression. Il lui faut donc `GetObject` sur l'ancien préfixe,
`PutObject` sur `archives/*`, et `DeleteObject` sur l'ancien préfixe. C'est le seul des
quatre à recevoir un droit de suppression, et c'est une raison suffisante pour qu'il
tourne isolément, avec une identité qui n'est partagée avec rien d'autre.

**Tableau de bord d'analyse.** Le piège inverse. « Compter les factures » ressemble à
« lire les factures ». Ce n'est pas la même chose : compter les objets d'un dépôt se
fait avec `s3:ListBucket`, qui donne les **noms** sans donner les **contenus**. Une
seule action, aucune lecture de donnée. Compromis, ce composant révèle combien de
factures existent et leurs noms — c'est-à-dire une fuite mineure, au lieu de la
totalité des données financières.

C'est l'enseignement le plus transférable de l'exercice : **lister n'est pas lire**, et
beaucoup d'applications d'analyse n'ont besoin que de la première permission.

**Le second faux besoin.** L'API web « lit les factures de l'année en cours » : la
portée `factures-prod/2026/*` suffit, alors que le réflexe est d'écrire
`factures-prod/*` « parce qu'en 2027 il faudra changer ». Ce réflexe est mauvais :
prolonger la portée par anticipation supprime aujourd'hui une protection contre une
gêne future qui prend cinq minutes à corriger — et qui, en pratique, se gère par une
variable dans le code d'infrastructure.

**La politique de refus.** La plus utile ici : **refuser à toutes les identités
applicatives la suppression sur `factures-prod/2026/*` et `archives/*`**. Elle ne
duplique aucune autorisation ; elle pose une limite qu'aucune erreur future
d'autorisation ne pourra franchir, puisque le refus l'emporte toujours.

C'est la seule protection de l'exercice qui résiste à un mauvais changement fait dans
six mois par quelqu'un qui ne connaît pas ce raisonnement. **Les autorisations
protègent contre les attaquants ; les refus explicites protègent contre nous-mêmes.**

**Comment reconnaître ce type de problème.** Trois signaux dans une politique existante
doivent déclencher une relecture : une étoile en position de ressource · un verbe en
`*` (`s3:*`) · une politique écrite pendant un incident et jamais revue. Les trois se
trouvent en quelques minutes et représentent la majorité des permissions excessives
réelles.

**Quand la réponse changerait.** Sur un environnement de développement avec des données
factices, ce niveau de finesse coûte plus qu'il ne rapporte. La règle est de calquer la
finesse des permissions sur la **valeur des données**, pas sur une doctrine uniforme.

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
