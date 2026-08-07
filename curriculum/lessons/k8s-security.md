<!-- keep -->
# Leçon — Kubernetes : sécurité et moindre privilège

## 🎯 Objectif
Réduire ce qu'un compromis peut faire dans un cluster : **namespaces** pour
cloisonner, **RBAC** pour l'autorisation, **NetworkPolicies** pour segmenter le
réseau, **securityContext** pour durcir les Pods, et une gestion lucide des
**Secrets**. Appliquer le moindre privilège à chaque couche.

## 🧩 Prérequis
Config/probes et réseau K8s (`/doc/lessons/k8s-config-probes`,
`/doc/lessons/k8s-networking-services`), durcissement Docker
(`/doc/lessons/docker-production-hardening`).

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

## 🧭 Exemple guidé — durcir un déploiement existant
1. RBAC : le ServiceAccount du Pod a-t-il des droits au-delà du nécessaire ?
   réduire.
2. Réseau : une NetworkPolicy limite-t-elle qui peut joindre ce Pod / ce qu'il
   peut joindre ? sinon en ajouter une restrictive.
3. Pod : non-root ? rootfs en lecture seule ? capabilities abandonnées ? pas de
   `privileged` ?
4. Secrets : chiffrement au repos + RBAC en lecture ; images épinglées/scannées.

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

## ✍️ Mini-exercice
Un Pod n'a besoin de joindre que la base. Quelle couche empêche qu'il balaie tout
le cluster s'il est compromis ? → une NetworkPolicy restrictive (par défaut, tout
est joignable).

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
