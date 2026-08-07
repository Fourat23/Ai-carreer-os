<!-- keep -->
# Leçon — Kubernetes : configuration, secrets, probes et ressources

## 🎯 Objectif
Rendre un Pod configurable et fiable : injecter la configuration
(**ConfigMap**) et les **Secrets**, déclarer les **probes** (liveness, readiness,
startup) qui pilotent la santé, et fixer les **requests/limits** de ressources qui
gouvernent le placement et la stabilité.

## 🧩 Prérequis
Workloads (`/doc/lessons/k8s-workloads`) et ressources Linux
(`/doc/lessons/linux-resources-io`).

## 🧠 Modèle mental
Un Pod bien conçu SÉPARE trois choses de son image : sa **configuration** (qui
change selon l'environnement), sa **santé** (comment le cluster sait s'il va
bien), et son **appétit** en ressources (ce dont il a besoin pour être placé et
ne pas nuire aux voisins). Ces trois déclarations transforment « un conteneur qui
tourne » en « un service que Kubernetes sait exploiter, surveiller et déplacer ».

## 📖 Explication complète
**ConfigMap.** Stocke de la configuration NON sensible (URLs, options, drapeaux),
injectée dans le Pod en variables d'environnement ou en fichiers montés. Elle
sépare la config de l'image — un même artefact vaut pour tous les environnements
(cf. build once, deploy many).

**Secret — attention à la fausse sécurité.** Un objet **Secret** stocke des
données sensibles. Point crucial d'exactitude : par défaut, un Secret Kubernetes
est seulement **encodé en base64, PAS chiffré** — quiconque a l'accès en lecture
aux Secrets ou à `etcd` peut le lire. Pour une vraie protection : activer le
chiffrement au repos d'etcd, restreindre l'accès par RBAC, et/ou utiliser un
gestionnaire de secrets externe. Ne jamais présenter un Secret K8s comme « chiffré »
par nature. Les valeurs d'exemple restent factices.

**Probes.** Kubernetes sonde les conteneurs pour agir automatiquement :
- **liveness** : « le conteneur est-il vivant ? » S'il échoue, Kubernetes REDÉMARRE
  le conteneur (utile contre les blocages/deadlocks).
- **readiness** : « le conteneur est-il PRÊT à recevoir du trafic ? » S'il échoue,
  le Pod est RETIRÉ des endpoints du Service (plus de trafic) sans être redémarré.
- **startup** : laisse le temps à une application lente à démarrer avant que
  liveness ne s'active (évite des redémarrages en boucle au boot).
Confondre liveness et readiness est une erreur classique : une liveness trop
agressive redémarre un Pod juste occupé ; une readiness absente route du trafic
vers un Pod pas encore prêt.

**Requests et limits.**
- **requests** : ce que le Pod DEMANDE (mémoire/CPU). Le **scheduler** s'en sert
  pour choisir un nœud ayant assez de place. Trop bas → surengagement ; trop haut →
  gaspillage et Pods non plaçables (**Pending**).
- **limits** : le PLAFOND. Dépasser la limite mémoire → le conteneur est tué
  (**OOMKilled**, cf. ressources Linux) ; dépasser la limite CPU → le conteneur est
  bridé (throttling), pas tué.
Bien régler requests/limits est au cœur de la stabilité ET du coût (FinOps).

## 🔧 Exemple — config, secret, probes, ressources
```yaml
spec:
  containers:
    - name: monapi
      image: monapi:1.4.2
      envFrom:
        - configMapRef: { name: monapi-config }
        - secretRef: { name: monapi-secret }     # base64, PAS chiffré par défaut
      readinessProbe:
        httpGet: { path: /health, port: 3000 }
        initialDelaySeconds: 5
      livenessProbe:
        httpGet: { path: /alive, port: 3000 }
        periodSeconds: 10
      resources:
        requests: { memory: 128Mi, cpu: 100m }
        limits:   { memory: 256Mi, cpu: 500m }
```

## 🧭 Exemple guidé — « le Pod redémarre en boucle » vs « pas de trafic »
1. Redémarrages répétés (CrashLoop lié à la probe) → la **liveness** est-elle trop
   agressive / le mauvais endpoint / délai de démarrage trop court (→ startup
   probe) ?
2. Le Pod tourne mais ne reçoit PAS de trafic → **readiness** échoue : il est hors
   des endpoints. L'endpoint `/health` répond-il vraiment prêt ?
3. Redémarrages avec OOMKilled → **limit mémoire** trop basse ou fuite.
4. Pod **Pending** → **requests** trop hautes pour les nœuds disponibles.

## ⚠️ Erreurs fréquentes
- Croire qu'un **Secret** est chiffré (il est base64 par défaut).
- **Confondre liveness et readiness** (redémarrer vs retirer du trafic).
- Liveness trop agressive → redémarrages d'un Pod simplement occupé.
- Pas de requests/limits → placement hasardeux, OOM surprise, coûts non maîtrisés.
- Mettre des secrets dans une ConfigMap (non prévue pour ça).

## 🔐 Sécurité
Traiter les Secrets K8s comme sensibles MAIS pas comme chiffrés par défaut :
activer le chiffrement au repos, restreindre par RBAC, préférer un gestionnaire de
secrets pour le critique. Séparer config (ConfigMap) et secrets. Ne jamais logguer
un secret ni le coder en dur dans l'image.

## 🏢 Cas métier
Un service était retiré du trafic « sans raison » : sa liveness ET sa readiness
pointaient le même endpoint lourd qui échouait sous charge, provoquant à la fois
retrait ET redémarrages. Séparation : readiness sur un check léger de préparation,
liveness sur un check minimal de vivacité, startup probe pour le démarrage lent.
Le service se stabilise.

## 🎤 Questions d'entretien
- « Liveness vs readiness ? » → redémarrer le conteneur vs le retirer des endpoints
  (pas de redémarrage).
- « Un Secret Kubernetes est-il chiffré ? » → non par défaut (base64) ; il faut
  chiffrement au repos + RBAC.
- « À quoi servent requests et limits ? » → placement (scheduler) et plafond
  (OOM/throttle), stabilité et coût.

## ✍️ Mini-exercice
Votre Pod dépasse sa limite mémoire. Que se passe-t-il ? → il est tué (OOMKilled) ;
augmenter la limite si légitime, ou corriger la fuite.

## 🧾 À retenir
- ConfigMap = config non sensible ; Secret = sensible MAIS base64 (pas chiffré par
  défaut).
- Liveness redémarre ; readiness retire du trafic ; startup couvre le démarrage
  lent.
- requests = placement (scheduler) ; limits = plafond (OOMKilled/throttling).
- Ces réglages font la stabilité ET le coût.

## 📚 Vocabulaire
**ConfigMap** · **Secret (base64, non chiffré par défaut)** · **liveness /
readiness / startup probe** · **requests / limits** · **scheduler** ·
**OOMKilled / throttling** · **Pending**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sépare config (ConfigMap) et secrets, sans illusion sur le base64.
- [ ] Je distingue et règle liveness/readiness/startup.
- [ ] Je fixe requests/limits en pensant stabilité et coût.

## 🔗 Liens avec le programme
Mois 11 (orchestration). Leçons liées : `/doc/lessons/k8s-workloads`,
`/doc/lessons/k8s-troubleshooting`, `/doc/lessons/linux-resources-io`. Probes et
ressources sont au cœur du diagnostic K8s et du FinOps.
