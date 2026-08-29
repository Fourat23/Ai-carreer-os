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

## 🧭 Exemple guidé — l'état du Pod est déjà la moitié du diagnostic

Le réflexe du débutant devant un incident Kubernetes est de lancer `kubectl logs`. Une
fois sur deux, cette commande ne renvoie rien — et il reste devant un écran vide, sans
savoir pourquoi.

La raison est simple et elle organise tout le sujet : **les journaux d'un conteneur
n'existent que si un conteneur a démarré.** Or la moitié des pannes se produisent
avant. L'état affiché par `kubectl get pods` dit à quel moment de sa vie le Pod s'est
arrêté, donc où chercher.

### La ligne de temps d'un Pod, et où chaque état se situe

```
Pending ──────► ContainerCreating ──────► Running ──────► Completed
   │                    │                     │
   │                    │                     ├─► CrashLoopBackOff
   │                    │                     └─► OOMKilled
   │                    └─► ImagePullBackOff / CreateContainerConfigError
   └─► (jamais placé sur un nœud)
```

Chaque branche a **une famille de causes et un seul outil utile** :

| état | ce qui a échoué | où regarder |
|---|---|---|
| `Pending` | le placement | `describe pod` → événements du **scheduler** |
| `ImagePullBackOff` | le téléchargement de l'image | `describe pod` → nom d'image, droits du registre |
| `CreateContainerConfigError` | une référence manquante | `describe pod` → un Secret ou ConfigMap absent |
| `CrashLoopBackOff` | le programme lui-même | `logs --previous` |
| `OOMKilled` | la mémoire | `describe pod` → limites, puis le code |
| `Running` mais pas de trafic | la disponibilité | `get endpoints`, sondes |

**Les journaux ne servent que sur une seule ligne de ce tableau.** C'est ce qui explique
l'écran vide : on interroge le conteneur alors qu'il n'a jamais existé.

### Dérouler un cas complet

`CrashLoopBackOff`, 23 redémarrages.

**Première lecture — que dit le nom ?** « Crash » : le conteneur démarre puis s'arrête.
« BackOff » : Kubernetes espace ses tentatives — quelques secondes, puis de plus en plus.
Ce n'est pas un blocage, c'est un ralentissement délibéré pour éviter de saturer le nœud.
Le compteur qui monte lentement est donc normal, pas un symptôme aggravant.

**Deuxième lecture — le conteneur a-t-il démarré ?** Oui, sinon on serait dans une des
branches du haut. Donc les journaux existent :

```bash
kubectl logs monpod --previous
```

`--previous` est indispensable et c'est l'erreur la plus fréquente du sujet. Sans lui,
tu lis le conteneur **actuel**, qui vient de démarrer et n'a encore rien écrit. La cause
est dans l'exécution **précédente**, celle qui s'est arrêtée.

**Troisième lecture — que dit le programme ?**

```
Error: connect ECONNREFUSED 10.96.0.32:5432
```

L'application n'atteint pas sa base et sort en erreur. Ce n'est donc **pas** un problème
Kubernetes : c'est une dépendance injoignable, et le diagnostic bascule sur le Service
de la base — points d'accès, sélecteur, nom DNS.

**Quatrième lecture — et si les journaux étaient vides malgré `--previous` ?** Alors le
conteneur n'a pas eu le temps d'écrire, ou il a été tué de l'extérieur. Il faut
regarder :

```bash
kubectl describe pod monpod | grep -A5 "Last State"
```

`Reason: OOMKilled` indique la mémoire. `Reason: Error, Exit Code: 137` indique un
`SIGKILL` — c'est le 128 + 9 vu dans la leçon sur les signaux, et ici c'est le plus
souvent la sonde de vivacité qui a tué le conteneur.

### La règle de méthode

**Regarde l'état avant de choisir la commande.** Un état de Pod est une information de
diagnostic, pas une étiquette d'échec — il dit quelle étape a été franchie et laquelle
a échoué.

Et une distinction utile qui revient dans toute exploitation : **est-ce Kubernetes ou
est-ce mon application ?** Les états du haut du tableau (`Pending`, `ImagePull`,
`ConfigError`) sont des problèmes de plateforme ou de manifeste. `CrashLoopBackOff` avec
des journaux applicatifs lisibles est un problème de code ou de dépendance —
Kubernetes ne fait alors que rendre visible une panne qui existait déjà.

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

## ✍️ Mini-exercice — écrire ton arbre de décision, puis le tester

**Contexte.** Tu prends l'astreinte. Ton objectif est d'avoir, **avant** le premier
incident, une page qui te dise quoi taper selon ce que tu vois.

**Partie 1 — construis l'arbre.** Une page, pas plus. Pour chacun des sept états
ci-dessous : la **première** commande, **ce que tu y cherches précisément**, et les
deux causes les plus probables.

`Pending` · `ImagePullBackOff` · `CreateContainerConfigError` · `CrashLoopBackOff` ·
`Running` sans trafic · `OOMKilled` · `Terminating` depuis 20 minutes

**Partie 2 — teste-le sur six incidents.** Applique ton arbre à chacun et note **le
nombre de commandes** qu'il te faut pour atteindre la cause.

| # | ce que tu observes |
|---|---|
| 1 | 3 Pods `Pending`, `describe` dit `0/4 nodes are available: 4 Insufficient memory` |
| 2 | `CrashLoopBackOff`, `logs --previous` est vide, `Last State: OOMKilled` |
| 3 | `ImagePullBackOff` sur une image interne qui existe bien |
| 4 | `Running`, `1/1 Ready`, mais `kubectl get endpoints` renvoie `<none>` |
| 5 | `Terminating` depuis 20 min, le Pod refuse de disparaître |
| 6 | Tout est `Running`, aucune erreur, et les utilisateurs voient des 502 |

**Livrable.** L'arbre d'une page, plus le tableau des six incidents avec la cause et le
nombre de commandes utilisées.

**Critère de réussite.** Trois vérifications que tu fais seul : (1) **aucun** des six
incidents ne doit demander plus de trois commandes ; (2) ton arbre doit dire
explicitement dans quels cas `kubectl logs` est **inutile** ; (3) l'un des six n'a pas
sa réponse dans l'arbre — repère-le et dis pourquoi.

**Piège.** Deux des six incidents ont une cause qui n'est **pas** dans Kubernetes.

## ✅ Correction attendue

**La démarche.** L'arbre part toujours de l'état, jamais de la commande. C'est ce qui
évite la perte de temps la plus courante : lancer `logs` sur un Pod qui n'a jamais
démarré.

**L'arbre, en résumé.**

| état | première commande | ce qu'on y cherche | causes probables |
|---|---|---|---|
| `Pending` | `describe pod` | les événements du **scheduler** | ressources insuffisantes · contrainte de placement impossible |
| `ImagePullBackOff` | `describe pod` | le nom d'image exact et le message du registre | nom ou étiquette faux · droits d'accès au registre |
| `CreateContainerConfigError` | `describe pod` | quel objet est introuvable | Secret ou ConfigMap absent, ou clé absente dedans |
| `CrashLoopBackOff` | `logs --previous` | la dernière ligne avant l'arrêt | erreur applicative · dépendance injoignable |
| `Running` sans trafic | `get endpoints` | liste vide ou remplie | sélecteur qui ne correspond pas · sonde de disponibilité |
| `OOMKilled` | `describe pod` | `Last State` et les limites | limite trop basse · fuite mémoire |
| `Terminating` long | `describe pod` | finaliseurs, délai de grâce | arrêt non géré · finaliseur bloqué |

**Ligne à écrire explicitement dans l'arbre** : *`kubectl logs` est inutile sur
`Pending`, `ImagePullBackOff` et `CreateContainerConfigError` — aucun conteneur n'a
démarré.*

**Les six incidents.**

**1. `Insufficient memory` sur les 4 nœuds.** Une commande. Le scheduler a déjà écrit
la réponse. Attention à la lecture : ce sont les **demandes** (`requests`) qui ont
échoué, pas la consommation réelle. Un cluster à moitié inutilisé peut refuser un Pod
si les demandes déclarées, elles, sont déjà réservées. Cause : demandes trop hautes, ou
cluster à agrandir.

**2. Journaux vides, `OOMKilled`.** Deux commandes. Le processus a été tué par le noyau
pour dépassement mémoire, sans avoir le temps d'écrire. Deux causes à distinguer, et
elles appellent des réponses opposées : une limite sous-évaluée — on l'augmente — ou une
fuite mémoire — on corrige le code, et augmenter la limite ne fait que retarder.
Discriminant : la courbe de mémoire. Un plateau élevé indique une limite trop basse ;
une pente qui monte indéfiniment indique une fuite.

**3. Image interne qui existe.** Deux commandes. Si l'image existe, l'échec porte sur le
**droit** de la télécharger : secret d'accès au registre absent ou non référencé dans le
Pod. Le message d'erreur du registre est dans les événements — il dit souvent
`unauthorized`, ce qui tranche immédiatement entre « n'existe pas » et « pas le droit ».

**4. `Ready` mais aucun point d'accès.** Une commande, déjà faite. Cause : le sélecteur
du Service ne correspond pas aux libellés. C'est le seul cas où `1/1 Ready` coexiste
avec une absence totale de trafic, et cette combinaison est une signature à mémoriser.

**5. `Terminating` sans fin.** Deux commandes. Deux causes possibles : l'application
ignore le signal de terminaison et attend son délai de grâce — donc c'est le code, comme
dans la leçon sur les signaux — ou un **finaliseur** attend une opération externe qui
n'arrive jamais. Le second cas se voit dans `metadata.finalizers`.

**6. Tout `Running`, des 502.** **C'est l'incident qui n'est pas dans l'arbre**, et c'est
le point de l'exercice. L'arbre est construit sur les états des Pods ; ici tous les Pods
vont bien. Le problème est **au-dessus** — Ingress mal configuré, service en amont,
certificat expiré — ou **en dessous** — la base à laquelle l'application parle.

**Les deux causes hors Kubernetes** sont l'incident 6 et une partie de l'incident 2 :
une fuite mémoire est un bug applicatif que Kubernetes ne fait que rendre visible en
tuant le conteneur.

**L'erreur probable.** Construire un arbre qui commence par `kubectl logs` parce que
c'est la commande qu'on connaît. Elle échoue sur trois des sept états, et sur deux des
six incidents.

**Ce que ce type de problème t'apprend en général.** Un arbre de décision écrit **avant**
l'incident vaut dix fois la même connaissance mobilisée pendant. À 3 h du matin, on ne
raisonne pas — on suit. C'est exactement la raison d'être des guides d'exploitation, et
c'est un livrable professionnel attendu, pas une coquetterie.

**Quand la réponse changerait.** Sur un cluster géré par un fournisseur, `Pending` peut
se résoudre tout seul en quelques minutes : l'ajustement automatique du nombre de nœuds
ajoute une machine. L'arbre doit alors comporter une branche « attendre deux minutes
avant de diagnostiquer » — sans quoi on cherche une cause à un système qui était
simplement en train de se corriger.

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
