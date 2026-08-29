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

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. `top` montre le CPU à 30 % mais `wa` à 50 %, et le service est lent. Quelle
   ressource suspectes-tu ?
2. `df -h` annonce `/var` plein à 100 %. Tu supprimes un fichier de log de 8 Go.
   `df -h` affiche toujours 100 %. Que s'est-il passé ?
3. `df -h` affiche 60 % d'occupation et pourtant les écritures échouent avec « No
   space left on device ». Comment est-ce possible ?
4. Un load average de 8 est-il un problème ?

## ✅ Correction attendue

**La démarche.** Toujours conclure avec un chiffre et l'unité qui va avec, et toujours
demander à quoi ce chiffre se compare. Un nombre seul — 8, 100 %, 50 % — ne décide de
rien.

**L'erreur probable, et elle fait perdre des heures en pleine nuit.** Sur la deuxième
question, la réponse spontanée est « le système de fichiers met du temps à se
rafraîchir » ou « il faut redémarrer ». Ni l'un ni l'autre : **l'espace n'a pas été
libéré, et il ne le sera pas.**

Sous Linux, supprimer un fichier ne fait que retirer son **nom** du répertoire. Les
blocs de données ne sont rendus que lorsque le dernier lien disparaît **et** que plus
aucun processus ne le tient ouvert. Or le service qui écrivait dans ce log l'a toujours
ouvert : il détient un descripteur, il continue même d'y écrire — dans un fichier qui
n'a plus de nom. Les 8 Go restent occupés jusqu'à ce que ce processus ferme le
descripteur ou se termine.

Le symptôme qui signe ce cas est un désaccord entre deux outils : **`du` ne voit plus
le fichier — il parcourt les noms — tandis que `df` le compte toujours — il interroge le
système de fichiers.** Quand `du` et `df` divergent nettement, cherche un fichier
supprimé mais encore ouvert : `lsof +L1` les liste exactement.

Le piège séduit parce que **la suppression a visiblement réussi** : aucune erreur, le
fichier a disparu de `ls`, la commande a fait ce qu'on lui demandait. On cherche donc
l'explication du côté d'un délai ou d'un cache, c'est-à-dire du côté d'un phénomène
temporaire — alors que la situation est stable et le restera.

La bonne action n'est d'ailleurs pas de tuer le service : c'est de le faire **rouvrir**
son fichier de log (un `SIGHUP` sur beaucoup de démons, ce que fait `logrotate`), ou, en
urgence absolue, de vider le fichier sans le supprimer — `truncate -s 0` ou `> fichier`
— ce qui libère les blocs **sans** casser le descripteur ouvert.

**Sur les autres questions.** Un `wa` à 50 % avec un CPU à 30 % désigne l'**attente
d'I/O** : les processeurs ne calculent pas, ils patientent. Le goulot est le disque (ou
le réseau vers un stockage), et ajouter du CPU n'y changerait rien.

Un disque à 60 % qui refuse les écritures a presque toujours épuisé ses **inodes**, pas
ses blocs. Chaque fichier consomme un inode, et leur nombre est fixé à la création du
système de fichiers. Des millions de petits fichiers — sessions, caches, mails —
saturent la table sans remplir l'espace. `df -i` l'affiche, et c'est la commande que
personne ne tape avant d'avoir été mordu une fois.

Enfin, un load average de 8 ne veut **rien dire** hors contexte : saturé sur 4 cœurs,
confortable sur 16. `nproc` donne le dénominateur, et sous Linux ce chiffre inclut aussi
les processus en attente d'I/O — un load élevé peut donc signaler un disque lent et non
un CPU chargé.

**Alternative défendable.** Sur un serveur moderne, beaucoup d'équipes ne regardent plus
le load average du tout et pilotent uniquement sur les métriques par ressource
(utilisation CPU, latence disque, mémoire disponible). C'est défendable : le load
mélange deux phénomènes distincts et son interprétation demande un contexte que les
autres métriques donnent directement.

**Vérifie seul, sans corrigé** :
1. Compare `du -sh /var/log` et la ligne `/var` de `df -h`. Un écart important est un
   fichier supprimé encore ouvert.
2. Lance `df -i`. Connaissais-tu ce pourcentage ? C'est la panne que tu n'as pas encore
   eue.
3. Sur ton serveur : `uptime` puis `nproc`. Le rapport des deux est le seul chiffre qui
   compte.

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
