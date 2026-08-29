<!-- keep -->
# Leçon — Kubernetes : configuration, secrets, probes et ressources

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Un même conteneur doit se comporter différemment en test et en production (autre base
de données, autres réglages), sans le reconstruire. Comment lui passer sa
configuration ? Et comment Kubernetes sait-il si un Pod est vraiment PRÊT à recevoir
du trafic, ou s'il est bloqué et doit être redémarré ? Et comment éviter qu'un Pod
gourmand n'affame ses voisins sur la même machine ? Trois besoins concrets, trois
réponses : la **configuration** (ConfigMap/Secret) séparée de l'image, les **probes**
qui répondent « vivant ? » et « prêt ? », et les **requests/limits** qui réservent et
plafonnent les ressources. Cette leçon les construit un par un — avec un avertissement
important sur ce qu'un « Secret » Kubernetes protège réellement.

## 🎯 Objectif
Rendre un Pod configurable et fiable : injecter la configuration
(**ConfigMap**) et les **Secrets**, déclarer les **probes** (liveness, readiness,
startup) qui pilotent la santé, et fixer les **requests/limits** de ressources qui
gouvernent le placement et la stabilité.

## 🧩 Prérequis
Vous devez connaître les **workloads** (Pod/Deployment — `/doc/lessons/k8s-workloads`)
et comprendre les **ressources** d'une machine (CPU, mémoire, OOM —
`/doc/lessons/linux-resources-io`), car requests/limits et le OOMKilled s'appuient
dessus. ConfigMap, Secret et probes sont définis ici.

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

## 🧭 Exemple guidé — l'application qui se tue elle-même toutes les nuits

Une API fonctionne parfaitement en journée. Chaque nuit, entre 2 h et 4 h, ses Pods
redémarrent une dizaine de fois. Aucune erreur dans les journaux applicatifs. La
charge est au plus bas.

C'est un cas réel et fréquent, et il fait comprendre les sondes mieux que n'importe
quelle définition — parce qu'ici, **c'est la configuration de surveillance qui provoque
la panne qu'elle est censée détecter.**

### Ce qu'on trouve dans la configuration

```yaml
livenessProbe:
  httpGet: { path: /health, port: 8080 }
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 1
  failureThreshold: 3
```

Et dans le code, `/health` fait ceci : il interroge la base de données, vérifie le
cache, appelle un service de paiement externe, et répond `200` si tout va bien.

### Le raisonnement, étape par étape

**Que fait exactement une sonde de vivacité ?** Elle répond à une seule question :
*ce conteneur est-il irrémédiablement bloqué ?* Si elle échoue `failureThreshold`
fois de suite, le kubelet **tue le conteneur** et le relance. C'est une mesure violente,
réservée aux situations dont un programme ne peut pas sortir seul.

**Que se passe-t-il à 2 h du matin ?** La sauvegarde nocturne ralentit la base. Le
service de paiement externe passe en maintenance. `/health` met alors plus d'une
seconde à répondre — c'est le `timeoutSeconds: 1`. Trois échecs consécutifs, quinze
secondes plus tard, le conteneur est tué.

**Et voici le point qui compte.** L'application allait bien. Elle servait
correctement les requêtes réelles. On l'a tuée parce qu'une **dépendance externe** était
lente, et le redémarrage n'a évidemment rien réparé — d'où la boucle.

### Les trois erreurs, séparément

**1. La sonde de vivacité teste les dépendances.** C'est la faute la plus lourde.
Une sonde de vivacité doit répondre *« mon processus fonctionne »*, rien de plus — un
`200` inconditionnel est souvent le meilleur choix. Dès qu'elle interroge la base, elle
transforme une panne de base en **massacre de tous tes Pods**, simultanément, ce qui
transforme une dégradation en indisponibilité totale.

**2. Le délai d'attente est trop court.** Une seconde ne laisse aucune marge à un
ramasse-miettes, à un pic de charge, à une latence réseau. Les valeurs
`timeout: 1` / `period: 5` / `threshold: 3` tuent un conteneur après quinze secondes de
lenteur : c'est un réglage extrêmement agressif pour une décision aussi grave.

**3. Il manque la troisième sonde.** `initialDelaySeconds: 5` suppose que l'application
démarre en cinq secondes. Si un jour elle met vingt secondes — migration au démarrage,
chargement d'un cache —, la vivacité la tue **avant qu'elle ait fini de démarrer**, en
boucle infinie. La sonde de **démarrage** existe exactement pour ça : elle suspend les
autres tant que l'application n'a pas signalé être prête, et elle autorise un long délai
sans rendre la surveillance permanente laxiste.

### La distinction qu'il faut avoir en tête, définitivement

| sonde | question posée | conséquence d'un échec | doit tester… |
|---|---|---|---|
| **démarrage** | as-tu fini de démarrer ? | on attend encore | l'initialisation |
| **disponibilité** (readiness) | peux-tu servir **maintenant** ? | retiré du service, **pas tué** | soi **et** les dépendances indispensables |
| **vivacité** (liveness) | es-tu bloqué sans espoir ? | **tué et relancé** | soi uniquement |

La ligne du milieu est celle qui manque presque toujours. C'est pourtant la seule qui
sait dire *« je suis vivant mais je ne peux pas servir en ce moment »* — un état
parfaitement légitime, qui doit retirer le Pod de la rotation sans le détruire.

### La configuration corrigée

```yaml
startupProbe:                       # laisse jusqu'à 60 s pour démarrer
  httpGet: { path: /health/live, port: 8080 }
  failureThreshold: 12
  periodSeconds: 5

livenessProbe:                      # ne teste QUE le processus
  httpGet: { path: /health/live, port: 8080 }
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3

readinessProbe:                     # teste les dépendances, sans tuer
  httpGet: { path: /health/ready, port: 8080 }
  periodSeconds: 5
  timeoutSeconds: 2
  failureThreshold: 2
```

Deux points d'accès distincts, et c'est la clé : `/health/live` répond `200` si le
processus tourne ; `/health/ready` vérifie la base et le cache.

Résultat la nuit suivante : quand la base ralentit, les Pods sortent de la rotation,
le trafic les évite, **personne n'est tué**, et ils reviennent d'eux-mêmes quand la
base se remet. La dégradation reste une dégradation au lieu de devenir une panne.

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

## ✍️ Mini-exercice — écrire les deux points d'accès et régler les trois sondes

**Contexte.** Une API de réservation. Au démarrage, elle applique les migrations de
base et charge en mémoire un catalogue de 200 000 lignes : entre 15 et 45 secondes
selon la charge de la base. En service, elle a besoin de PostgreSQL (indispensable),
de Redis pour le cache (dégradable : sans lui, elle est lente mais correcte) et d'une
API de paiement externe (utile pour 5 % des requêtes seulement).

**Ce que tu produis, en trois parties.**

1. **Le code des deux points d'accès** — `/health/live` et `/health/ready` — en
   pseudo-code ou dans le langage de ton choix. Pour chaque dépendance, écris dans quel
   point d'accès elle apparaît, ou dans aucun, **et pourquoi**.
2. **Les trois sondes configurées**, avec des valeurs chiffrées. Justifie chaque
   nombre par une donnée de l'énoncé — pas par habitude.
3. **Le tableau des scénarios** : pour chacune des cinq situations ci-dessous, ce que
   font tes sondes et ce que voit l'utilisateur.

| # | situation |
|---|---|
| 1 | démarrage normal, 20 s |
| 2 | démarrage lent, 50 s, base saturée |
| 3 | Redis tombe complètement |
| 4 | PostgreSQL devient injoignable |
| 5 | l'application part en boucle infinie sur un bug, sans planter |

**Livrable.** Le pseudo-code, la configuration YAML des trois sondes, le tableau des
cinq scénarios.

**Critère de réussite.** Deux vérifications que tu fais seul : (1) dans le scénario 3,
l'application **ne doit pas être retirée du service** ; (2) dans le scénario 5, elle
**doit** être tuée. Si ta configuration se comporte pareil dans ces deux cas, c'est que
la vivacité et la disponibilité testent la même chose.

**Piège.** Une des trois dépendances ne doit apparaître dans **aucun** des deux points
d'accès. Trouve laquelle et explique le raisonnement.

## ✅ Correction attendue

**La démarche.** Pour chaque dépendance, une seule question : *si elle disparaît, mon
application peut-elle encore rendre un service utile ?* Trois réponses possibles, et
chacune détermine mécaniquement où placer la dépendance.

**Les deux points d'accès.**

```
GET /health/live
    return 200                       # rien d'autre. Le processus répond, il est vivant.

GET /health/ready
    if (!postgres.ping())  return 503 # indispensable : sans base, aucune réservation
    return 200                        # Redis absent -> on sert quand même, plus lentement
```

**PostgreSQL** est dans `/health/ready` seulement. Sans lui, l'application ne peut rien
servir d'utile : elle doit sortir de la rotation. Mais elle ne doit pas être **tuée** —
la redémarrer ne fera pas revenir la base, et une salve de redémarrages ajoutera une
tempête de reconnexions à une base déjà en difficulté.

**Redis** n'est dans **aucun** des deux, et c'est le piège de l'énoncé. L'énoncé dit
« dégradable : sans lui, elle est lente mais correcte ». Une dépendance dégradable ne
doit jamais figurer dans une sonde : l'y mettre transformerait une simple perte de
performance en indisponibilité déclarée. **Une sonde de disponibilité ne teste pas la
santé de l'écosystème, elle répond à une seule question : puis-je servir une requête
utile maintenant ?** Avec Redis à terre, la réponse est oui.

**L'API de paiement** non plus, pour la même raison en plus tranché : elle concerne
5 % des requêtes. La retirer du service pour 100 % du trafic à cause de 5 % serait une
sur-réaction. Les 5 % concernés doivent échouer proprement — c'est le rôle du code, pas
d'une sonde.

**Les trois sondes.**

```yaml
startupProbe:                      # 45 s max annoncés, on prend une marge
  httpGet: { path: /health/live, port: 8080 }
  periodSeconds: 5
  failureThreshold: 18             # 18 x 5 = 90 s de budget de démarrage

livenessProbe:
  httpGet: { path: /health/live, port: 8080 }
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3              # ~30 s d'insensibilité avant de tuer

readinessProbe:
  httpGet: { path: /health/ready, port: 8080 }
  periodSeconds: 5
  timeoutSeconds: 2
  failureThreshold: 2              # réaction rapide : sortir du service est réversible
```

Le raisonnement derrière les nombres : **on est agressif là où l'erreur est réversible,
patient là où elle est destructrice.** Retirer un Pod du service se rattrape en cinq
secondes ; le tuer coûte un redémarrage complet. D'où une disponibilité réactive
(2 échecs) et une vivacité tolérante (3 échecs de 10 s).

**Les cinq scénarios.**

| # | ce que font les sondes | ce que voit l'utilisateur |
|---|---|---|
| 1 | démarrage validé à ~20 s, puis les deux autres prennent le relais | rien |
| 2 | 50 s < 90 s de budget : le Pod démarre, plus lentement | rien |
| 3 | aucune sonde ne bouge, `/health/ready` répond toujours 200 | des réponses plus lentes |
| 4 | disponibilité échoue → Pod retiré du service, **non tué** | erreur du répartiteur, retour automatique dès que la base revient |
| 5 | `/health/live` ne répond plus → 3 échecs → **tué et relancé** | brève coupure sur ce Pod, les autres absorbent |

**L'erreur probable.** Mettre les trois dépendances dans les deux points d'accès,
« pour être sûr ». Le résultat est exactement l'incident de l'exemple guidé : une panne
de Redis — un composant explicitement dégradable — tue tous les Pods simultanément et
transforme une lenteur en indisponibilité totale. **La sonde la plus stricte n'est pas
la plus sûre : c'est celle qui a le plus de chances de provoquer la panne.**

**Comment reconnaître ce type de problème.** Trois signaux dans une configuration
existante : une sonde de vivacité qui appelle un point d'accès contenant le mot
`ready` · un même point d'accès utilisé par les deux sondes · un `timeoutSeconds` à 1.
Chacun mérite une relecture immédiate.

**Quand la réponse changerait.** Si Redis n'était pas dégradable — s'il portait les
sessions, par exemple — il rejoindrait PostgreSQL dans `/health/ready`. La
classification des dépendances n'est pas une propriété de la technologie : **c'est une
décision d'architecture qu'il faut écrire quelque part**, sans quoi chacun la
réinterprète en configurant les sondes.

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
