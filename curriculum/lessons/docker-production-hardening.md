<!-- keep -->
# Leçon — Docker : durcissement pour la production

## 🌍 Le problème d'abord
« Ça tourne sur ma machine » ne veut pas dire « c'est prêt pour la production ». Un
conteneur mal configuré tourne en **root** (si quelqu'un le pirate, il a tous les
droits), embarque un shell et mille outils inutiles (plus de surface d'attaque),
n'a aucune limite (il peut avaler toute la mémoire de la machine et faire tomber les
voisins), ou s'arrête brutalement en coupant les requêtes en cours. Ces défauts ne se
voient pas quand « ça marche » — ils explosent en production. Cette leçon liste les
réglages qui font passer un conteneur de « ça tourne » à « ça tourne bien et sans
danger », en rappelant honnêtement qu'un conteneur n'est PAS une machine virtuelle
(il partage le noyau de l'hôte).

## 🎯 Objectif
Faire tourner des conteneurs **sûrs et stables** en production : utilisateur
**non-root**, image **minimale**, système de fichiers **en lecture seule**,
**limites de ressources**, gestion des **secrets**, **PID 1 et signaux**,
**scan** de vulnérabilités. Passer de « ça tourne » à « ça tourne bien et sans
danger ».

## 🧩 Prérequis
Vous devez savoir écrire un **Dockerfile** propre (multi-stage, image minimale —
`/doc/lessons/docker-build-dockerfile`) et comprendre les **processus et signaux**
(`/doc/lessons/linux-processes-signals`), car le durcissement joue sur l'utilisateur,
les limites et l'arrêt gracieux (`SIGTERM`). Les notions namespaces/cgroups sont
expliquées ici.

## 🧠 Modèle mental
Un conteneur n'est pas une VM : il **partage le noyau** de l'hôte. L'isolation
vient des **namespaces** et des **cgroups** (au niveau applicatif), pas d'une
frontière matérielle. Le durcissement consiste donc à **réduire ce qu'un
conteneur peut faire et casser** : moins de privilèges, moins de binaires, moins
de droits d'écriture, des limites explicites. On applique le **moindre
privilège** à chaque dimension.

## 📖 Explication complète
**Non-root.** Par défaut, le process du conteneur tourne en root. Si une faille
est exploitée, l'attaquant est root DANS le conteneur, avec plus de leviers vers
l'hôte. On crée un utilisateur dédié et on bascule dessus (`USER app`). Beaucoup
d'images officielles fournissent déjà un utilisateur non privilégié.

**Image minimale.** Moins l'image contient de binaires (shell, gestionnaires de
paquets, outils), moins il y a de vulnérabilités et d'outils exploitables. Les
images `distroless` ou `-slim` réduisent drastiquement la surface. Contrepartie :
plus difficile à déboguer « à chaud » (pas de shell) — d'où l'importance des logs
et de l'observabilité.

**Système de fichiers en lecture seule.** Lancer le conteneur avec un rootfs en
lecture seule (`--read-only`) et n'autoriser l'écriture que sur des volumes
précis empêche qu'un process modifie l'application ou dépose un binaire. On
combine avec `tmpfs` pour les fichiers temporaires légitimes.

**Limites de ressources.** Sans limites, un conteneur peut consommer toute la
mémoire/CPU de l'hôte et affamer les voisins. On fixe des limites mémoire et CPU
(`--memory`, `--cpus`). Attention : dépasser la limite mémoire déclenche le **OOM
killer** (cf. ressources Linux) qui TUE le process — un conteneur « redémarré sans
raison » est souvent un OOMKilled.

**Secrets.** Jamais dans l'image ni dans les couches. On les injecte au run
(variables d'exécution, fichiers montés, gestionnaire de secrets du cloud). On
évite de les logger. Les exemples pédagogiques utilisent des valeurs
manifestement factices.

**PID 1 et signaux.** Le process principal du conteneur est **PID 1** : il doit
transmettre les signaux et récolter les processus zombies. Un script shell mal
écrit comme PID 1 peut ignorer `SIGTERM` et empêcher l'arrêt gracieux (le
conteneur est alors tué de force après un délai). Utiliser la forme exec, gérer
`SIGTERM`, ou un init léger (`--init`) résout ces problèmes.

**Scan et provenance.** On scanne les images pour détecter des dépendances
vulnérables, on épingle les versions (tags/digests), et on privilégie des bases
maintenues. La chaîne de build est aussi une surface (provenance des images de
base).

## 🔧 Repères pratiques
```bash
docker run --read-only --tmpfs /tmp \
  --memory=512m --cpus=1 \
  -e API_KEY=exemple_factice \
  --user 1000:1000 --init monapi:1.4.2   # exemple illustratif (non exécuté ici)
docker inspect monapi --format '{{.Config.User}}'   # vérifier qu'on n'est pas root
```
Ces options CUMULÉES (non-root, read-only, limites, init) donnent un conteneur
nettement plus sûr et prévisible.

## 🧭 Exemple guidé — « le conteneur redémarre tout seul et s'arrête mal »
1. Redémarrages inexpliqués → vérifier la mémoire : est-ce un **OOMKilled** ?
   (limite trop basse ou fuite mémoire.)
2. Arrêt lent/forcé → le PID 1 gère-t-il `SIGTERM` ? Forme exec ? `--init` ?
3. Ajuster la limite mémoire au besoin réel, corriger la gestion des signaux.
4. Vérifier au passage : tourne-t-on en non-root ? rootfs en lecture seule
   possible ?

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Tu limites ton conteneur Node à `--memory 512m`. Il est tué au bout de vingt minutes
   sous charge. Fuite mémoire ?
2. Tu passes en image `distroless`. Ton conteneur plante et tu ne peux pas y ouvrir de
   shell. Qu'as-tu échangé contre quoi ?
3. `--read-only` casse ton application, qui écrit des fichiers temporaires. Renonces-tu ?
4. Pourquoi tourner non-root dans un conteneur, puisque le conteneur est déjà isolé ?

## ✅ Correction attendue

**La démarche.** Chaque mesure de durcissement retire une capacité. La question n'est
jamais « faut-il l'appliquer » mais « qu'est-ce que cela m'empêche de faire, et
l'accepté-je ».

**L'erreur probable, et elle envoie chercher un bug qui n'existe pas.** Un conteneur tué
après vingt minutes est presque toujours diagnostiqué comme une fuite mémoire. Dans le
cas décrit, c'est plus souvent autre chose : **le runtime ne connaît pas la limite qu'on
lui a fixée.**

Une limite `--memory` est appliquée par le noyau, via les cgroups. Elle ne modifie pas ce
que le processus **croit** disponible. Un runtime qui dimensionne ses caches ou son tas
en observant la mémoire de la machine — 32 Go, par exemple — va tranquillement croître
vers plusieurs gigaoctets, en toute logique et sans aucune fuite. À 512 Mo, le noyau le
tue. Le processus n'a rien fait de mal ; il a raisonné sur un chiffre qui n'était pas le
sien.

La signature est nette : le conteneur meurt **exactement** à la limite, de façon
reproductible, avec un code de sortie 137 et `OOMKilled: true` dans `docker inspect`. Une
vraie fuite, elle, croît indéfiniment quelle que soit la limite et se déplace quand on
l'augmente.

La correction n'est donc pas de chercher un bug ni de doubler la limite, mais de **dire
au runtime ce qu'il a le droit d'utiliser** — une option de taille de tas, une variable
d'environnement, un drapeau qui lui fait lire la limite cgroup. La règle générale à
retenir : **limiter une ressource sans en informer le processus produit un processus qui
raisonne sur un monde qui n'existe pas.**

Le piège séduit parce que « tué pour cause de mémoire » et « fuite mémoire » sont deux
énoncés qui se ressemblent au point qu'on saute de l'un à l'autre sans s'en apercevoir.
Le symptôme est réel, l'observation est correcte, seule l'inférence de cause est fausse —
et elle envoie relire du code pendant des jours.

**Sur les autres questions.** L'image `distroless` échange **du confort de débogage
contre de la surface d'attaque**. Sans shell, un attaquant qui obtient l'exécution de code
n'a ni interpréteur, ni `curl`, ni gestionnaire de paquets pour aller plus loin. En
contrepartie tu ne peux plus « entrer voir » : il faut que les logs, les métriques et les
traces soient suffisants — c'est pourquoi durcissement et observabilité vont ensemble, et
non l'un après l'autre. On peut aussi attacher temporairement un conteneur de débogage
partageant les mêmes espaces de noms, ce qui garde l'image propre.

`--read-only` ne se renonce pas : on **monte un `tmpfs`** sur les répertoires qui doivent
être inscriptibles (`/tmp`, un cache). L'écriture reste possible là où elle est
légitime, en mémoire, et disparaît à l'arrêt — ce qui est précisément le comportement
souhaité pour du temporaire. Le reste du système de fichiers demeure immuable, donc un
attaquant ne peut ni remplacer un binaire ni déposer une porte dérobée persistante.

Enfin, non-root **parce que le conteneur n'est pas une machine virtuelle** : tous les
conteneurs d'un hôte partagent le même noyau. L'isolation est faite d'espaces de noms et
de cgroups, pas d'une frontière matérielle. Root dans le conteneur, c'est l'UID 0 sur le
noyau de l'hôte — et toute faille d'échappement, tout montage mal configuré, tout socket
Docker exposé se joue alors avec les pleins pouvoirs. Non-root ne rend pas l'évasion
impossible ; il la rend beaucoup plus difficile, et c'est tout ce qu'on demande à une
couche de défense.

**Alternative défendable.** Sur un cluster où l'on maîtrise la charge et où l'on préfère
une marge à un réglage fin, **ne pas fixer de limite mémoire** et surveiller la
consommation réelle est tenable — cela évite les OOMKilled inexpliqués au prix du risque
qu'un conteneur affame ses voisins. Le choix dépend de qui partage la machine, pas d'un
principe général.

**Vérifie seul, sans corrigé** :
1. `docker inspect --format '{{.State.OOMKilled}} {{.State.ExitCode}}' ton-conteneur`.
   `true` et `137` désignent la limite, pas ton code.
2. Dans ton conteneur limité à 512 Mo, demande au runtime combien de mémoire il croit
   avoir. Si ce n'est pas 512 Mo, tu tiens ton explication.
3. Lance ton image avec `--read-only`. Ce qui casse t'apprend exactement où ton
   application écrit — une information que peu d'équipes possèdent.

## ⚠️ Erreurs fréquentes
- Tourner en **root** sans nécessité.
- Image pleine d'outils inutiles (surface d'attaque).
- **Aucune limite** mémoire/CPU → un conteneur affame l'hôte / OOM surprise.
- Secret dans l'image ou loggé.
- PID 1 qui ignore `SIGTERM` → arrêt non gracieux, requêtes coupées.
- Se croire isolé « comme une VM » (le noyau est partagé).

## 🔐 Sécurité
Le durcissement est un cumul de moindres privilèges : non-root, minimal,
read-only, limites, secrets externalisés, images scannées et épinglées. Aucun de
ces réglages ne transforme un conteneur en frontière de sécurité de type VM ; ils
réduisent le risque et l'impact d'une compromission. Un conteneur ne fournit jamais
une séparation équivalente à celle d'une machine virtuelle (le noyau reste partagé) :
ne présentez pas son cloisonnement comme une frontière de niveau système
d'exploitation.

## 🏢 Cas métier
Un service était « instable » : redémarrages nocturnes et arrêts brutaux coupant
des requêtes. Diagnostic : conteneur root, sans limite mémoire (OOMKilled sous
charge) et PID 1 en forme shell ignorant `SIGTERM`. Correctifs : limite mémoire
ajustée, forme exec + `--init`, bascule non-root et rootfs en lecture seule. Le
service devient stable et s'arrête proprement lors des déploiements.

## 🎤 Questions d'entretien
- « Un conteneur isole-t-il comme une VM ? » → non : noyau partagé, isolation par
  namespaces/cgroups.
- « Pourquoi tourner en non-root ? » → limiter l'impact d'une compromission
  (moindre privilège).
- « Pourquoi un conteneur peut être tué sous charge ? » → dépassement de la limite
  mémoire → OOM killer.

## ✍️ Mini-exercice
Un conteneur ne s'arrête pas à `docker stop` et est tué au bout de 10 s. Cause
probable ? → le PID 1 n'intercepte pas `SIGTERM` (forme shell / pas d'init) ;
corriger en forme exec ou `--init`.

## 🧾 À retenir
- Conteneur ≠ VM : noyau partagé, isolation applicative (namespaces/cgroups).
- Moindre privilège : non-root, image minimale, rootfs read-only.
- Limites mémoire/CPU obligatoires ; dépassement mémoire = OOMKilled.
- Secrets externalisés au run ; PID 1 doit gérer `SIGTERM` (arrêt gracieux).
- Scanner et épingler les images.

## 📚 Vocabulaire
**non-root / moindre privilège** · **namespaces / cgroups** · **image minimale
(distroless)** · **read-only rootfs / tmpfs** · **limites (memory/cpus)** ·
**OOM killer** · **PID 1 / SIGTERM / init** · **scan de vulnérabilités**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je fais tourner un conteneur non-root, minimal, avec des limites.
- [ ] Je gère l'arrêt gracieux (PID 1 / signaux).
- [ ] Je n'affirme jamais qu'un conteneur isole comme une VM.

## 🔗 Liens avec le programme
Mois 11 (production). Leçons liées :
`/doc/lessons/docker-build-dockerfile`, `/doc/lessons/linux-processes-signals`,
`/doc/lessons/linux-resources-io`, `/doc/lessons/deployment-secrets`. Ces
pratiques se prolongent dans la sécurité et les probes de Kubernetes.
