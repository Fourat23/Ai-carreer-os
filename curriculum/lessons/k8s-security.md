<!-- keep -->
# Leçon — Kubernetes : sécurité et moindre privilège

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Par défaut, un cluster Kubernetes est TROP permissif : n'importe quel Pod peut
souvent joindre n'importe quel autre, un composant peut avoir bien plus de droits
qu'il n'en faut, et un conteneur peut tourner en root. Résultat : si UN seul Pod est
piraté, l'attaquant peut se promener dans tout le cluster. La sécurité n'est pas un
bouton unique : c'est une **superposition** de « moindres privilèges » — qui peut
faire quoi (RBAC), qui peut parler à qui (NetworkPolicy), ce qu'un conteneur a le
droit de faire (securityContext). Chaque couche réduit les dégâts possibles. Cette
leçon part de ce constat (« tout est ouvert par défaut ») et ajoute les verrous un à
un, en rappelant qu'un conteneur n'isole pas comme une machine virtuelle.

## 🎯 Objectif
Réduire ce qu'un compromis peut faire dans un cluster : **namespaces** pour
cloisonner, **RBAC** pour l'autorisation, **NetworkPolicies** pour segmenter le
réseau, **securityContext** pour durcir les Pods, et une gestion lucide des
**Secrets**. Appliquer le moindre privilège à chaque couche.

## 🧩 Prérequis
Vous devez connaître la **config et les Secrets** K8s (`/doc/lessons/k8s-config-probes`),
le **réseau/Service** (`/doc/lessons/k8s-networking-services`) et le **durcissement
Docker** (`/doc/lessons/docker-production-hardening`), car la sécurité K8s prolonge le
moindre privilège des conteneurs. RBAC, NetworkPolicy et securityContext sont définis
ici.

## 🧠 Modèle mental
La sécurité d'un cluster n'est pas UN réglage, c'est une SUPERPOSITION de moindres
privilèges : qui peut faire quoi (RBAC), qui peut parler à qui (NetworkPolicy), ce
qu'un conteneur a le droit de faire (securityContext), et à quoi on limite
l'exposition. Chaque couche réduit le rayon d'impact d'une compromission. Rappel
fondateur : les conteneurs partagent le noyau du nœud — l'isolation est
applicative, jamais une frontière de type VM.

## 📖 Explication complète
**Namespaces.** Ils cloisonnent logiquement les ressources (par équipe,
environnement) et servent de périmètre pour les quotas et les règles RBAC/réseau.
Utile MAIS ce n'est pas une frontière de sécurité forte à lui seul : c'est une
organisation sur laquelle on POSE les contrôles.

**RBAC (autorisation).** Définit QUI (utilisateur, groupe, **ServiceAccount** d'un
Pod) peut faire QUOI (verbes : get/list/create/delete) sur QUELLES ressources, via
des **Roles** (dans un namespace) ou **ClusterRoles** (cluster) liés par des
**RoleBindings**. Principe : accorder le MINIMUM. Piège fréquent : donner
`cluster-admin` « pour que ça marche » — un compromis devient alors total. Chaque
Pod tourne avec un ServiceAccount : ne pas monter de droits inutiles.

**NetworkPolicies.** Par défaut, tout Pod peut joindre tout Pod/Service. Une
**NetworkPolicy** restreint le trafic (entrant/sortant) par labels : « seuls les
Pods `app: api` peuvent joindre la base sur le port 5432 ». Sans elle, un Pod
compromis peut balayer tout le cluster. (Nécessite un plugin réseau qui
l'implémente.)

**securityContext (durcissement du Pod).** Au niveau Pod/conteneur : tourner
**non-root** (`runAsNonRoot`), système de fichiers **en lecture seule**
(`readOnlyRootFilesystem`), **abandonner les capabilities** Linux inutiles,
interdire l'**escalade de privilèges** (`allowPrivilegeEscalation: false`), ne
JAMAIS utiliser `privileged: true` sauf nécessité extrême. Ce sont les mêmes
principes que le durcissement Docker, appliqués déclarativement.

**Secrets — rappel critique.** Les Secrets K8s sont **base64, pas chiffrés** par
défaut : activer le chiffrement au repos d'etcd, restreindre leur lecture par
RBAC, préférer un gestionnaire de secrets externe pour le sensible. Ne pas les
exposer en variables loggées.

**Chaîne d'approvisionnement.** Épingler les images (digest), les scanner,
n'autoriser que des registres de confiance. Une image malveillante contourne
beaucoup de contrôles internes.

## 🔧 Exemple — securityContext durci
```yaml
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
  containers:
    - name: monapi
      image: monapi@sha256:...          # digest épinglé
      securityContext:
        readOnlyRootFilesystem: true
        allowPrivilegeEscalation: false
        capabilities: { drop: ["ALL"] }
```

## 🧭 Exemple guidé — ce qu'un attaquant trouve dans les trente premières secondes

Une faille dans ton application permet d'exécuter des commandes à l'intérieur d'un Pod.
La question n'est plus « comment est-il entré ? » mais **« que peut-il faire
maintenant ? »**.

Déroulons ses trente premières secondes sur un déploiement par défaut — c'est-à-dire
sans aucun durcissement. Chaque découverte correspond à une protection qu'on aurait pu
poser.

### Seconde 1 — il regarde qui il est

```
$ id
uid=0(root) gid=0(root)
```

**Il est root.** Pas root sur la machine hôte — la conteneurisation l'en empêche — mais
root dans le conteneur, ce qui est déjà beaucoup : il installe des outils, modifie des
fichiers, lit tout ce que le conteneur contient.

Rien ne l'imposait. La plupart des applications n'ont aucun besoin de root après leur
démarrage. Le contexte de sécurité du Pod permet de fixer un utilisateur non
privilégié, et **ce simple réglage transforme la suite de son exploration**.

### Seconde 5 — il cherche des identifiants, et il en trouve

```
$ cat /var/run/secrets/kubernetes.io/serviceaccount/token
eyJhbGciOiJSUzI1NiIsImtpZCI6...
```

C'est la découverte que peu de gens anticipent. **Kubernetes monte automatiquement, dans
chaque Pod, un jeton d'accès à sa propre API.** Personne ne l'a demandé : c'est le
comportement par défaut.

Ce que ce jeton permet dépend entièrement des droits du compte de service associé. Et
c'est là que se joue tout :

- si ce compte n'a **aucun droit**, le jeton ne sert à rien ;
- s'il a le droit de **lire les secrets de son espace de noms**, l'attaquant récupère
  les mots de passe de la base et les clés d'API ;
- s'il a le droit de **créer des Pods**, il peut démarrer un conteneur privilégié et
  tenter de sortir vers l'hôte.

Deux protections, indépendantes. Désactiver le montage automatique du jeton quand
l'application n'appelle pas l'API — ce qui est le cas de l'écrasante majorité des
applications. Et n'accorder au compte de service que le strict nécessaire, ce qui est
souvent **rien**.

### Seconde 10 — il regarde qui il peut joindre

Par défaut, dans un cluster, **tout Pod peut joindre tout autre Pod**. Il balaie donc le
réseau interne et découvre la base de données, le cache, les autres services, y compris
ceux d'autres applications.

C'est le rôle des politiques réseau, et il faut connaître leur particularité : elles
fonctionnent en **liste d'autorisation**. Tant qu'aucune politique ne sélectionne un
Pod, il est totalement ouvert ; dès qu'une politique le sélectionne, seul ce qu'elle
autorise passe. Il n'y a pas d'état intermédiaire.

Conséquence pratique importante : la première politique à écrire est celle qui **refuse
tout** dans l'espace de noms, et on ouvre ensuite. Sans elle, ajouter des politiques
sur quelques Pods laisse tous les autres grands ouverts.

Autre point à vérifier avant de compter dessus : les politiques réseau ne sont
appliquées que si le module réseau du cluster les prend en charge. Sur certains
clusters, elles sont acceptées et **silencieusement ignorées** — on croit être protégé
et on ne l'est pas.

### Seconde 20 — il essaie d'écrire

```
$ echo 'malveillant' > /usr/local/bin/outil
```

Si le système de fichiers racine est en lecture seule, cela échoue. C'est une gêne
sérieuse pour un attaquant : il ne peut pas installer d'outil persistant, pas modifier
de binaire. Il devra tout faire en mémoire, ce qui est plus difficile et disparaît au
redémarrage.

Le coût pour toi est faible : déclarer un volume temporaire pour les rares répertoires
où l'application écrit réellement.

### Seconde 30 — le bilan

| protection | présente par défaut ? | ce qu'elle lui retire |
|---|---|---|
| utilisateur non privilégié | **non** | l'installation d'outils, la lecture de tout |
| jeton d'API non monté | **non** | l'accès à l'API du cluster |
| compte de service sans droits | **non**, il en a par défaut | les secrets, la création de Pods |
| politique réseau restrictive | **non** | le balayage du réseau interne |
| racine en lecture seule | **non** | la persistance |

**Aucune n'est active par défaut.** C'est le point à retenir : Kubernetes est conçu pour
fonctionner immédiatement, pas pour être sûr immédiatement. Le durcissement est un
travail à faire, et il se fait presque entièrement dans le manifeste — quelques lignes
de contexte de sécurité, un `automountServiceAccountToken: false`, une politique réseau.

### Le raisonnement à transposer

Ne demande jamais « est-ce sécurisé ? ». Demande : **« si quelqu'un obtient
l'exécution de code ici, que trouve-t-il dans ses trente premières secondes ? »** Cette
question a des réponses concrètes, vérifiables, et chacune désigne une protection
précise. La première n'en a aucune.

## ⚠️ Erreurs fréquentes
- Donner `cluster-admin` par facilité (compromis = total).
- **Aucune NetworkPolicy** → un Pod compromis atteint tout le cluster.
- Tourner en **root** / `privileged: true` sans nécessité.
- Croire un **Secret** chiffré (base64 par défaut).
- Traiter un **namespace** comme une isolation de sécurité forte à lui seul.

## 🔐 Sécurité
Cumul des moindres privilèges : RBAC minimal, réseau segmenté, Pods non-root et
restreints, secrets protégés, images de confiance. Aucun de ces contrôles ne
transforme un conteneur en frontière VM ; ils réduisent la probabilité ET
l'impact d'une compromission. La défense en profondeur suppose qu'une couche peut
tomber.

## 🏢 Cas métier
Un audit trouve un Pod tournant en root, avec un ServiceAccount `cluster-admin` et
aucune NetworkPolicy : un simple RCE aurait donné le contrôle du cluster.
Remédiation : ServiceAccount réduit aux droits utiles, NetworkPolicies
restrictives, securityContext non-root + rootfs read-only, chiffrement des Secrets
au repos. Le rayon d'impact d'une faille chute drastiquement.

## 🎤 Questions d'entretien
- « À quoi sert RBAC ? » → autoriser QUI fait QUOI sur QUELLES ressources, au
  minimum nécessaire.
- « Que fait une NetworkPolicy ? » → restreindre quels Pods peuvent se parler (par
  défaut tout est ouvert).
- « Un namespace isole-t-il de façon sûre ? » → il cloisonne logiquement ; la
  sécurité vient des contrôles posés dessus (RBAC, réseau, securityContext).

## ✍️ Mini-exercice — durcir un manifeste, et chiffrer ce que ça retire

**Contexte.** Voici le manifeste tel qu'il est déployé aujourd'hui. Il fonctionne.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: api, namespace: production }
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: api
          image: monentreprise/api:latest
          env:
            - name: DB_PASSWORD
              value: "Pr0d-2026!"
          ports: [{ containerPort: 8080 }]
```

L'application est une API web. Elle lit et écrit dans PostgreSQL, écrit des fichiers
temporaires dans `/tmp`, et **n'appelle jamais l'API de Kubernetes**.

**Ce que tu produis, en trois parties.**

1. **Six défauts de sécurité**, classés par gravité. Pour chacun : ce qu'un attaquant
   ayant l'exécution de code en tire, en une phrase concrète.
2. **Le manifeste corrigé**, complet.
3. **Le tableau avant/après** : pour chacune des cinq protections du tableau de
   l'exemple guidé, ce que l'attaquant obtient avant, puis après.

**Livrable.** La liste des six défauts, le YAML corrigé, le tableau comparatif.

**Critère de réussite.** Vérifications à faire seul : (1) après correction, le mot de
passe ne doit apparaître **nulle part** dans le manifeste ; (2) tu dois pouvoir écrire,
en une phrase, ce que l'attaquant peut encore faire après durcissement — s'il ne peut
plus **rien**, tu t'es trompé quelque part, il reste toujours quelque chose ; (3) ton
manifeste doit continuer à permettre l'écriture dans `/tmp`.

**Piège.** Deux des six défauts ne se corrigent **pas** dans ce fichier. Identifie-les
et dis où ils se corrigent.

## ✅ Correction attendue

**La démarche.** On parcourt le manifeste en se demandant, pour chaque ligne et pour
chaque **absence** de ligne : *qu'est-ce que ça donne à quelqu'un qui est déjà à
l'intérieur ?* Les défauts les plus graves d'un manifeste sont presque toujours des
absences, ce qui les rend difficiles à voir en relecture.

**Défaut 1 — le mot de passe en clair.** Le plus grave. Il est lisible par quiconque
peut lire le Deployment, il est dans Git, il est dans l'historique des commits, il
apparaît dans les journaux d'audit. Correction : le sortir dans un objet Secret
référencé par `secretKeyRef`.

Et il faut le dire honnêtement : un Secret Kubernetes n'est encodé qu'en base64, ce qui
**n'est pas du chiffrement**. Il vaut mieux qu'une valeur en clair — il n'est plus dans
le Deployment, il a ses propres droits d'accès, il n'est pas dans Git — mais quelqu'un
qui peut lire les secrets de l'espace de noms lit le mot de passe. Le chiffrement au
repos et une gestion externe des secrets sont les étapes suivantes.

**Défaut 2 — le jeton d'API monté sans raison.** L'énoncé dit que l'application
n'appelle jamais l'API. Correction : `automountServiceAccountToken: false`. Une ligne,
et l'attaquant perd tout accès à l'API du cluster.

**Défaut 3 — aucun contexte de sécurité.** Le conteneur tourne en root, avec un système
de fichiers inscriptible et toutes les capacités par défaut.

**Défaut 4 — l'étiquette `latest`.** Personne ne sait quelle version tourne, deux Pods
peuvent exécuter des images différentes, et le retour arrière est impossible. Ce n'est
pas qu'un défaut de sécurité, c'est un défaut d'exploitation — mais en sécurité il est
décisif : on ne peut pas répondre à « cette version contient-elle la faille corrigée
mardi ? ». Correction : une étiquette immuable, idéalement une empreinte.

**Défaut 5 — aucune limite de ressources.** Un conteneur compromis peut consommer toute
la mémoire et le processeur du nœud, ce qui affecte les autres applications. Ce n'est
pas de l'exfiltration, c'est du déni de service latéral.

**Les deux défauts qui ne se corrigent pas ici.**

**Défaut 6 — aucune politique réseau.** C'est un objet **séparé**, pas un champ du
Deployment. Il faut créer une politique de refus par défaut dans l'espace de noms, puis
autoriser explicitement l'API à joindre PostgreSQL. Beaucoup d'équipes durcissent le
manifeste et oublient cette moitié, parce qu'elle n'est pas dans le fichier qu'elles
ont sous les yeux.

**Défaut 7 — les droits du compte de service.** Ils se définissent dans des objets
`Role` et `RoleBinding`, également séparés. Ici, le compte de service par défaut de
l'espace de noms devrait n'avoir aucun droit — et il faut le vérifier, pas le supposer.

**Le manifeste corrigé.**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: api, namespace: production }
spec:
  replicas: 3
  template:
    spec:
      automountServiceAccountToken: false
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        seccompProfile: { type: RuntimeDefault }
      containers:
        - name: api
          image: monentreprise/api@sha256:3f2a...        # empreinte, pas "latest"
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities: { drop: ["ALL"] }
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef: { name: db-credentials, key: password }
          ports: [{ containerPort: 8080 }]
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits:   { memory: 512Mi }
          volumeMounts:
            - { name: tmp, mountPath: /tmp }             # /tmp reste inscriptible
      volumes:
        - name: tmp
          emptyDir: {}
```

Le volume `emptyDir` est le détail qui fait fonctionner le reste : sans lui,
`readOnlyRootFilesystem: true` casse l'application, on retire le réglage, et le
durcissement est abandonné. **Une protection qui casse l'application est une protection
qui sera désactivée** — c'est pour cela qu'elle s'accompagne toujours de l'ouverture
minimale nécessaire.

**Ce que l'attaquant peut encore faire après durcissement.** Il exécute du code dans le
processus de l'API. Il peut donc lire le mot de passe de la base **en mémoire**, et
faire tout ce que l'application elle-même a le droit de faire sur PostgreSQL — lire,
écrire, supprimer des données métier. C'est exactement ce que le durcissement ne peut
pas empêcher, et c'est pourquoi il ne remplace ni la correction de la faille, ni les
droits restreints de l'application **dans** la base.

**L'erreur probable.** Croire que le durcissement du manifeste rend l'application sûre.
Il **borne les dégâts**, il ne supprime pas la vulnérabilité initiale. C'est la même
distinction que dans la leçon sur le réseau cloud : réduire un rayon d'explosion n'est
pas empêcher l'explosion.

**Quand la réponse changerait.** Si l'application appelait réellement l'API de
Kubernetes — un opérateur, un contrôleur maison —, le jeton devrait rester monté, et
c'est alors le `Role` qui devient la protection principale : autoriser exactement les
verbes et les ressources nécessaires, dans un seul espace de noms, jamais au niveau du
cluster.

## 🧾 À retenir
- Sécurité = superposition de moindres privilèges (RBAC, réseau, Pod, secrets,
  images).
- RBAC minimal ; NetworkPolicies pour segmenter ; securityContext non-root/rootfs
  read-only.
- Secrets base64 par défaut → chiffrement au repos + RBAC.
- Conteneur ≠ VM ; namespace = cloisonnement logique, pas isolation forte seule.

## 📚 Vocabulaire
**namespace** · **RBAC / Role / ClusterRole / RoleBinding** · **ServiceAccount** ·
**NetworkPolicy** · **securityContext** · **runAsNonRoot / readOnlyRootFilesystem** ·
**capabilities** · **chiffrement au repos**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'accorde des droits RBAC minimaux, jamais cluster-admin par défaut.
- [ ] Je segmente le réseau avec des NetworkPolicies.
- [ ] Je durcis les Pods (non-root, rootfs read-only, capabilities) et protège les
  Secrets.

## 🔗 Liens avec le programme
Mois 11 (production, sécurité). Leçons liées :
`/doc/lessons/docker-production-hardening`, `/doc/lessons/k8s-config-probes`,
`/doc/lessons/authentication`. Le moindre privilège K8s prolonge le durcissement
des conteneurs et la sécurité applicative.
