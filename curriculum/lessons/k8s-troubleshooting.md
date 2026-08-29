<!-- keep -->
# Leçon — Kubernetes : diagnostiquer un incident

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Rappel de l'idée de base : Kubernetes essaie en permanence de faire correspondre la
réalité (l'état OBSERVÉ) à ce que vous avez demandé (l'état DÉSIRÉ). Un « incident »,
c'est simplement un ÉCART qui ne se comble pas : un Pod qui redémarre en boucle, qui
refuse de démarrer, ou qui n'est jamais placé. La bonne nouvelle : Kubernetes est
BAVARD — il écrit presque toujours POURQUOI il n'y arrive pas. Le débutant, lui, a le
réflexe de « supprimer et relancer » au hasard (ce qui efface les indices). Cette
leçon apprend à LIRE ces messages dans le bon ordre, et à reconnaître 5 pannes très
fréquentes pour les nommer et les corriger — au lieu de deviner. On s'appuie sur tout
ce qui précède (Pod, image, config, ressources, Service).

## 🎯 Objectif
Acquérir une MÉTHODE de diagnostic dans Kubernetes : lire l'état (`get`,
`describe`, `events`, `logs`), et reconnaître les pannes récurrentes —
**CrashLoopBackOff**, **ImagePullBackOff**, **Pending**, **OOMKilled**,
Service sans endpoints — pour les résoudre vite au lieu de deviner.

## 🧩 Prérequis
Cette leçon est l'ABOUTISSEMENT : elle suppose acquis les **workloads**
(`/doc/lessons/k8s-workloads`), le **réseau/Service** (`/doc/lessons/k8s-networking-services`)
et la **config/probes/ressources** (`/doc/lessons/k8s-config-probes`) — car
diagnostiquer, c'est distinguer un problème d'application, d'image, de configuration,
de ressource, de réseau ou de placement. À faire en dernier dans le parcours K8s.

## 🧠 Modèle mental
Diagnostiquer, c'est comparer l'état DÉSIRÉ à l'état OBSERVÉ et remonter la chaîne
jusqu'au premier maillon cassé — exactement comme le diagnostic réseau par
couches. Kubernetes est BAVARD : le `status` des objets et les **events**
racontent presque toujours ce qui bloque. La discipline est de LIRE ces signaux
dans l'ordre avant de toucher à quoi que ce soit.

## 📖 Explication complète
**Les quatre commandes de base.**
- `kubectl get` : vue d'ensemble et statuts (Pods, Deployments, Services).
- `kubectl describe` : détail d'un objet + ses **events** récents (la mine d'or
  pour comprendre « pourquoi ça ne démarre pas »).
- `kubectl logs` : la sortie du conteneur (ajouter `--previous` pour voir le
  conteneur qui vient de crasher).
- `kubectl get events` : le fil chronologique des décisions du cluster.

**Pannes récurrentes et leur lecture.**
- **ImagePullBackOff / ErrImagePull** : le nœud n'arrive pas à tirer l'image →
  nom/tag erroné, registre privé sans identifiants, digest inexistant. `describe`
  le dit explicitement.
- **CrashLoopBackOff** : le conteneur démarre puis crashe en boucle (Kubernetes
  espace les tentatives). Causes : bug au démarrage (voir `logs --previous`),
  variable/secret manquant, **liveness** trop agressive, dépendance indisponible.
- **Pending** : le Pod n'est pas placé → pas de nœud avec assez de ressources
  (**requests** trop hautes), contrainte de placement non satisfaite, volume non
  disponible. `describe` montre la raison du scheduler.
- **OOMKilled** (dans le statut du conteneur) : limite mémoire dépassée → augmenter
  la limite si légitime, ou corriger la fuite (cf. ressources Linux).
- **Service sans endpoints** : labels/sélecteur incohérents ou Pods non **Ready**
  (cf. réseau K8s).

**Une démarche répétable.**
1. `kubectl get pods` : quel état exactement (Pending, CrashLoop, Running mais pas
   Ready) ?
2. `kubectl describe pod` : lire les **events** (pull, scheduling, probes).
3. `kubectl logs` (+`--previous` si crash) : l'application dit-elle pourquoi ?
4. Selon le symptôme, remonter au bon objet (image, ressources, config, Service).

**Ne pas casser en diagnostiquant.** Supprimer un Pod le recrée (réconciliation) et
efface parfois les indices : lire d'abord (`describe`, `logs --previous`), agir
ensuite. Corriger la DÉCLARATION, pas le Pod.

## 🔧 Repères pratiques
```bash
kubectl get pods                     # états (exemple, non exécuté ici)
kubectl describe pod <nom>           # events : pull, scheduling, probes
kubectl logs <nom> --previous        # logs du conteneur qui a crashé
kubectl get events --sort-by=.lastTimestamp
kubectl get endpoints <service>      # Service sans endpoints ?
```

## 🧭 Exemple guidé — un Pod en CrashLoopBackOff
1. `kubectl get pods` : `CrashLoopBackOff`, N redémarrages.
2. `kubectl describe pod` : la liveness échoue-t-elle ? un secret manque-t-il ?
3. `kubectl logs --previous` : l'appli lève-t-elle une erreur au démarrage
   (config absente, dépendance injoignable) ?
4. Corriger la cause (config/secret/probe/dépendance) dans le manifeste et
   `apply` ; observer la convergence.

## ⚠️ Erreurs fréquentes
- **Supprimer/relancer** avant d'avoir LU les events et logs (on perd l'indice).
- Ignorer `--previous` sur un CrashLoop (les logs du crash sont là).
- Prendre un **Pending** (placement) pour un crash applicatif.
- Oublier que `describe` contient déjà l'explication (image, scheduler, probes).
- Corriger le Pod à la main au lieu de la déclaration (l'écart revient).

## 🔐 Sécurité
Les logs peuvent contenir des données sensibles : éviter d'y déverser des secrets.
L'accès à `logs`/`exec` est puissant (lecture d'état, entrée dans un conteneur) et
doit être restreint par RBAC (leçon sécurité K8s). Ne pas coller de secrets réels
dans un ticket d'incident.

## 🏢 Cas métier
Un déploiement restait indisponible. `kubectl get pods` : `ImagePullBackOff`.
`describe` : le tag `1.4.3` n'existait pas dans le registre (typo dans le
manifeste). Correction du tag → images tirées, Pods Running. Deux minutes, grâce à
la lecture des events au lieu de tâtonner.

## 🎤 Questions d'entretien
- « Que faites-vous face à un CrashLoopBackOff ? » → describe (events) + logs
  --previous pour trouver la cause au démarrage.
- « Un Pod reste Pending, pourquoi ? » → pas de nœud avec assez de ressources /
  contrainte non satisfaite (voir le scheduler dans describe).
- « ImagePullBackOff ? » → problème de nom/tag/registre/identifiants d'image.

## ✍️ Mini-exercice
Un Pod est `Pending` depuis longtemps. Quelle commande donne la raison, et quelle
cause suspectez-vous ? → `kubectl describe pod` (events du scheduler) ; souvent des
**requests** trop élevées pour les nœuds disponibles.

## 🧾 À retenir
- Méthode : get → describe (events) → logs (--previous) → remonter au bon objet.
- ImagePull (image), CrashLoop (démarrage/probe), Pending (placement), OOMKilled
  (mémoire), endpoints vides (labels/readiness).
- Lire avant d'agir ; corriger la déclaration, pas le Pod.

## 📚 Vocabulaire
**kubectl get / describe / logs / events** · **CrashLoopBackOff** ·
**ImagePullBackOff** · **Pending** · **OOMKilled** · **--previous** ·
**endpoints** · **scheduler**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'applique la démarche get → describe → logs sans casser les indices.
- [ ] Je reconnais les pannes récurrentes et leur cause.
- [ ] Je corrige la déclaration plutôt que le Pod.

## 🔗 Liens avec le programme
Mois 11 (production). Leçons liées : `/doc/lessons/k8s-config-probes`,
`/doc/lessons/k8s-networking-services`, `/doc/lessons/linux-resources-io`. Cette
méthode prolonge le diagnostic par couches du réseau et la reprise après incident.
