<!-- keep -->
# Leçon — Linux : ressources, mémoire et I/O

## 🌍 Le problème d'abord
« Le serveur est lent. » C'est la plainte la plus fréquente… et la plus vague. Lent
POURQUOI ? Un serveur n'a que quelques ressources limitées qu'il doit se partager :
le temps de calcul (le processeur), la mémoire vive, le disque, et le nombre de
fichiers qu'il peut ouvrir en même temps. Quand « ça rame », c'est presque toujours
que l'une de ces quatre ressources est **saturée** — mais pas la même selon les cas,
et le remède diffère radicalement. Confondre « manque de mémoire » et « disque
saturé », c'est appliquer le mauvais correctif et perdre des heures. Cette leçon
apprend à mesurer AVANT de conclure, avec des chiffres, pour nommer la vraie cause.

## 🎯 Objectif
Savoir diagnostiquer une machine qui « rame » ou sature : distinguer un problème de
**CPU**, de **mémoire** (RSS, swap, OOM), d'**I/O disque** ou de **descripteurs de
fichiers**, avec les bons outils et la bonne interprétation — sans confondre les
symptômes.

## 🧩 Prérequis
Vous devez savoir observer un **processus** (`ps`, `top`) et comprendre son état
(`/doc/lessons/linux-processes-signals`) — car diagnostiquer une saturation, c'est
d'abord repérer QUEL processus consomme la ressource. Les termes RSS, swap, OOM et
descripteur de fichier sont définis ici, pas supposés connus.

## 🧠 Modèle mental
Un serveur a quatre ressources limitées qui se partagent : **CPU** (temps de calcul),
**mémoire** (RAM), **disque** (débit et espace) et **file descriptors** (nombre de
fichiers/sockets ouverts). Une lenteur n'est jamais « la machine est lente » : c'est
TOUJOURS l'une de ces quatre qui sature. Diagnostiquer, c'est identifier laquelle,
avec des chiffres, avant de conclure.

## 📖 Explication complète
**CPU et load average.** Le *load average* (`uptime`, `top`) est le nombre moyen de
processus prêts à s'exécuter. Règle d'interprétation : comparez-le au **nombre de
cœurs**. Un load de 4 sur 4 cœurs = saturation ; le même load sur 16 cœurs = tranquille.
Un CPU à 100% n'est un problème que si des tâches attendent. Distinguez `us` (temps
utilisateur), `sy` (noyau), `wa` (attente I/O — révèle un goulot DISQUE, pas CPU).

**Mémoire : RSS, cache, swap, OOM.** La RAM affichée « utilisée » inclut le **cache
disque**, que le noyau libère à la demande : « presque pleine » est normal et sain.
Ce qui compte : la mémoire réellement consommée par les processus (**RSS**) et le
**swap**. Le swap est un disque utilisé comme RAM de secours : lent. Si le système
swappe beaucoup, tout ralentit. Quand la mémoire manque vraiment, le noyau déclenche
l'**OOM killer** qui tue le processus le plus glouton — d'où des morts « inexpliquées »
visibles dans `dmesg`/`journalctl` (« Out of memory: Killed process… »). C'est
exactement l'origine du **OOMKilled** en Kubernetes.

**I/O disque : espace ET débit.** Deux problèmes distincts. L'**espace** : `df -h`
montre le pourcentage plein par système de fichiers ; un disque à 100% fait échouer les
écritures (logs, base) et bloque des services. Le **débit** : `iostat`/`iotop`
révèlent un disque saturé (utilisation ~100%, temps d'attente élevé) — souvent la vraie
cause d'un `wa` haut dans `top`. Astuce : `du -sh *` trouve QUI remplit un dossier.

**File descriptors.** Chaque fichier ou socket ouvert consomme un descripteur. La
limite par processus (`ulimit -n`) est finie. Un serveur qui ne ferme pas ses
connexions atteint la limite et échoue avec « Too many open files » — un classique des
fuites de connexions vers une base. `ls /proc/<PID>/fd | wc -l` compte les descripteurs
d'un processus.

**/proc, la fenêtre du noyau.** `/proc` n'est pas sur disque : c'est une vue en direct
du noyau. `/proc/<PID>/status` (mémoire d'un processus), `/proc/meminfo`,
`/proc/loadavg`. Les outils ci-dessous ne font souvent que le mettre en forme.

## 🔧 Commandes essentielles
```bash
top            # vue globale : CPU (us/sy/wa), mémoire, top consommateurs
uptime         # load average 1/5/15 min — à comparer au nb de cœurs (nproc)
free -h        # RAM réelle vs cache vs swap
df -h          # espace disque par système de fichiers
du -sh *       # taille des dossiers du répertoire courant (qui remplit ?)
iostat -x 2    # débit/attente disque (paquet sysstat)
ulimit -n      # limite de descripteurs de fichiers
ls /proc/$PID/fd | wc -l          # descripteurs ouverts d'un processus
dmesg -T | grep -i "out of memory" # traces de l'OOM killer
```

## 🧭 Exemple guidé — « le serveur rame »
1. `top` : le CPU est-il à 100% (us/sy) ou l'attente I/O (`wa`) est-elle haute ?
2. Si CPU : quel processus ? est-ce du calcul légitime ou une boucle ?
3. Si mémoire : `free -h` (swap actif ?), `dmesg` (OOM killer ?).
4. Si `wa` haut : `iostat -x` (disque saturé ?), `df -h` (disque plein ?).
5. « Too many open files » : `ulimit -n` et compter les fd du processus (fuite ?).
6. Conclure avec un CHIFFRE, pas une impression, puis corriger la cause.

## ⚠️ Erreurs fréquentes
- **Paniquer sur une RAM « presque pleine »** : c'est le cache disque, sain.
- Lire le load average sans le rapporter au nombre de cœurs.
- Confondre disque **plein** (espace) et disque **saturé** (débit) : outils différents.
- Ignorer le swap : un peu c'est normal, beaucoup tue les performances.
- Augmenter `ulimit` pour masquer une fuite de descripteurs au lieu de la corriger.
- Attribuer au CPU une lenteur qui vient en réalité de l'I/O (`wa`).

## 🐳☁️ Vers le conteneur et le cloud
Un conteneur a des **limites de ressources** (`--memory`, `--cpus` ; `requests`/`limits`
en Kubernetes). Dépasser la mémoire → OOMKilled, exactement comme l'OOM killer ici.
Bien dimensionner (right-sizing) est aussi un enjeu de coût cloud (FinOps) : une
instance à 5% de CPU est sur-dimensionnée.

## 🏢 Cas métier
Une API renvoie des 500 par intermittence. `top` : `wa` à 40%. `df -h` : `/` à 100% —
les logs ont rempli le disque, les écritures échouent. Correction immédiate :
rotation/purge des logs ; correction de fond : logrotate + alerte de capacité + envoi
des logs vers un agrégateur.

## 🎤 Questions d'entretien
- « La RAM est à 95%, faut-il s'inquiéter ? » → non si c'est du cache ; regarder RSS/swap.
- « Comment savoir si un disque est le goulot ? » → `wa` dans `top`, `iostat`.
- « Origine d'un OOMKilled ? » → mémoire épuisée, le noyau tue le plus gourmand.

## ✍️ Mini-exercice
`top` montre CPU à 30% mais `wa` à 50% et le service est lent. Quelle ressource
suspecter ? → l'I/O disque (attente), pas le CPU.

## 🧾 À retenir
- Quatre ressources : CPU, mémoire, disque (espace + débit), descripteurs.
- Load average à comparer au nombre de cœurs ; `wa` = attente I/O.
- RAM « pleine » = souvent du cache ; surveiller RSS et swap ; OOM killer = mémoire épuisée.
- Disque plein (`df`) ≠ disque saturé (`iostat`).
- « Too many open files » = limite de fd, souvent une fuite.

## 📚 Vocabulaire
**load average** · **us / sy / wa** · **RSS** · **cache disque** · **swap** ·
**OOM killer** · **iostat** · **file descriptor** · **ulimit** · **/proc**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je classe une lenteur en CPU / mémoire / I/O / fd avec des chiffres.
- [ ] Je ne panique pas sur une RAM « pleine » (cache).
- [ ] Je relie OOM killer et OOMKilled conteneur.

## 🔗 Liens avec le programme
Jours `/day/72` et `/day/80` (performance). Leçons liées :
`/doc/lessons/linux-processes-signals`, `/doc/lessons/caching-performance`. Ces
diagnostics fondent l'analyse d'incidents en conteneur et en cloud (OOMKilled,
saturation, right-sizing/FinOps), reprise dans les leçons Kubernetes et FinOps du parcours.
