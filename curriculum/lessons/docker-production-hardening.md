<!-- keep -->
# Leçon — Docker : durcissement pour la production

## 🎯 Objectif
Faire tourner des conteneurs **sûrs et stables** en production : utilisateur
**non-root**, image **minimale**, système de fichiers **en lecture seule**,
**limites de ressources**, gestion des **secrets**, **PID 1 et signaux**,
**scan** de vulnérabilités. Passer de « ça tourne » à « ça tourne bien et sans
danger ».

## 🧩 Prérequis
Dockerfile et multi-stage (`/doc/lessons/docker-build-dockerfile`), processus et
signaux (`/doc/lessons/linux-processes-signals`).

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
réduisent le risque et l'impact d'une compromission. Ne jamais présenter
l'isolation conteneur comme une isolation OS complète.

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
