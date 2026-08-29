<!-- keep -->
# Leçon — Linux : processus, jobs et signaux

## 🌍 Le problème d'abord
Votre application « tourne », puis un jour elle ne répond plus, ou refuse de
démarrer en disant que « le port est déjà utilisé », ou consomme tout le processeur
sans raison. Pour agir, il faut d'abord répondre à une question simple : **quel
programme est en train de s'exécuter, et lequel pose problème ?** Un programme rangé
sur le disque est juste un fichier inerte ; quand on le lance, il devient une chose
VIVANTE que le système suit à la trace. Cette chose vivante s'appelle un
**processus**. Cette leçon apprend à les voir, à comprendre leur état (actif,
endormi, bloqué), et à leur demander poliment — puis fermement — de s'arrêter. Sans
ce socle, on « tue » des programmes au hasard et on casse des services.

## 🎯 Objectif
Comprendre ce qu'est un **processus** (PID/PPID, états, arbre), savoir l'observer
(`ps`, `top`), le contrôler en avant/arrière-plan (jobs), et lui envoyer les bons
**signaux** (`TERM` vs `KILL` vs `HUP`) — la base pour diagnostiquer un service qui
« rame », qui ne s'arrête pas, ou un port déjà occupé.

## 🧩 Prérequis
Vous devez être à l'aise avec le **terminal** et comprendre les **permissions**
(`/doc/lessons/linux-filesystem-permissions`) — car agir sur un processus qui ne
vous appartient pas exige les bons droits. Aucune notion de « processus » n'est
supposée : on la définit ici, à partir de l'idée « programme sur disque » vs
« programme en train de tourner ».

## 🧠 Modèle mental
Un programme sur disque est **inerte** ; un **processus** est ce programme en train de
s'exécuter, avec sa mémoire, ses fichiers ouverts et une identité (PID). Le noyau
orchestre des milliers de processus sur quelques cœurs en les faisant alterner. Tout
processus a un **parent** : ils forment un arbre dont la racine est le processus
d'init (PID 1).

## 📖 Explication complète
**PID et PPID.** Chaque processus a un identifiant unique (PID) et connaît son parent
(PPID). `fork()` crée un enfant (copie), `exec()` remplace le programme exécuté :
c'est le mécanisme par lequel le shell lance une commande. Quand un parent meurt sans
récupérer ses enfants, ceux-ci sont « adoptés » par PID 1.

**États d'un processus.** Principaux : *running* (s'exécute ou prêt), *sleeping*
(attend un événement, ex. une I/O — l'état le plus courant), *stopped* (suspendu),
*zombie* (terminé mais pas encore « récupéré » par son parent). Un zombie n'occupe pas
de CPU ; une accumulation de zombies signale un parent qui ne fait pas son `wait()`.

**Observer.** `ps aux` liste tous les processus avec CPU%, MEM%, état, commande.
`ps -ef --forest` montre l'arbre parent/enfant. `top` (ou `htop`) est dynamique : il
révèle qui consomme le CPU/la mémoire EN CE MOMENT — indispensable pour un service qui
« rame ». `pgrep nginx` retrouve les PID par nom ; `pidof` fait de même.

**Avant-plan / arrière-plan (jobs).** Une commande lancée occupe le terminal
(avant-plan). `&` la lance en arrière-plan : `sleep 300 &`. `Ctrl-Z` suspend le job
courant, `bg` le reprend en arrière-plan, `fg` le ramène en avant-plan, `jobs` les
liste. Attention : un job en arrière-plan meurt quand le terminal se ferme, sauf si on
le détache (`nohup`, `disown`, ou mieux un service — voir la leçon systemd).

**Signaux.** Un signal est un message asynchrone envoyé à un processus. Les trois à
connaître :
- **SIGTERM (15)** : « termine-toi proprement » — le processus peut fermer ses
  fichiers, finir sa requête. C'est le signal par défaut de `kill` et la BONNE façon
  d'arrêter un service.
- **SIGKILL (9)** : « meurs immédiatement » — non interceptable, le processus n'a
  aucune chance de nettoyer. Dernier recours (un processus vraiment bloqué).
- **SIGHUP (1)** : historiquement « terminal fermé » ; beaucoup de daemons l'utilisent
  pour **recharger leur configuration** sans redémarrer.
Aussi utiles : SIGINT (2, `Ctrl-C`), SIGSTOP/SIGCONT (suspendre/reprendre).

## 🔧 Commandes essentielles
```bash
ps aux                  # tous les processus (CPU, MEM, état, commande)
ps -ef --forest         # arbre parent/enfant
top                     # vue dynamique du CPU/mémoire (q pour quitter)
pgrep -a node           # PID + ligne de commande des process « node »
kill 4242               # envoie SIGTERM (arrêt propre) au PID 4242
kill -9 4242            # SIGKILL (forcer) — en dernier recours
kill -HUP 4242          # recharger la config d'un daemon
pkill -f "python app"   # tuer par motif de ligne de commande
jobs ; fg %1 ; bg %1    # gérer les jobs du shell
nohup ./long.sh &       # survivre à la fermeture du terminal
```

## 🧭 Exemple guidé — « le port 3000 est déjà utilisé »

Tu lances ton serveur, et tu reçois `EADDRINUSE: address already in use :::3000`. Quelqu'un
occupe le port. Ce message très banal cache trois décisions, et la façon dont on les prend
sépare celui qui bricole de celui qui comprend.

**Décision 1 — savoir qui, avant de tuer quoi que ce soit.**

```bash
ss -ltnp | grep :3000        # ou : lsof -i :3000
```

La colonne `users:(("node",pid=4399,…))` donne le nom et le PID. Prends la peine de le
regarder. Le raccourci qui circule partout — `pkill -f node` — tue *tous* les processus dont
la ligne de commande contient « node » : ton serveur oublié, mais aussi la compilation qui
tourne dans un autre terminal, et sur une machine partagée, le travail de quelqu'un d'autre.
**Un motif n'est pas une identité.** Le PID en est une, et il ne coûte que la lecture d'une
ligne.

**Décision 2 — `kill` ou `kill -9` ?** C'est la décision réelle, et la plupart des gens
tapent `-9` par habitude sans savoir ce qu'ils échangent. Voici les trois cas, avec ce que
le shell rapporte à chaque fois :

```
Cas A — le serveur gère SIGTERM
  kill <pid>   → "SIGTERM reçu. Je termine les connexions en cours puis je ferme."
               → code de sortie 0

Cas B — le serveur ne gère rien (comportement par défaut)
  kill <pid>   → "Terminated"
               → code de sortie 143

Cas C — le serveur ignore SIGTERM
  kill <pid>   → "SIGTERM reçu... et ignoré."   (il reste vivant)
  kill -9 <pid> → "Killed"
               → code de sortie 137
```

Les deux nombres méritent d'être compris une fois pour toutes : un processus tué par un
signal sort avec **128 + le numéro du signal**. SIGTERM vaut 15, donc `143` ; SIGKILL vaut 9,
donc `137`. Tu reverras ces deux nombres partout — dans les journaux de conteneurs, dans les
tableaux de bord d'orchestrateurs — et ils te disent précisément *comment* le processus est
mort : `143`, on lui a demandé de partir et il n'avait rien prévu ; `137`, on l'a abattu.

La différence de fond est visible dans le cas A. `SIGTERM` est **une demande** : le
processus la reçoit, et c'est *lui* qui décide de finir sa requête en cours, de vider ses
tampons sur le disque, de fermer sa connexion à la base. `SIGKILL` n'est pas une demande —
il n'atteint jamais le programme. Le noyau retire le processus, point. Rien n'est vidé, rien
n'est fermé. Ce n'est pas une version « plus forte » du premier : c'est une opération d'une
autre nature.

Et ce n'est pas une question de politesse du programme : `SIGKILL` est **techniquement
non interceptable**. Un programme qui essaie de l'écouter est refusé par le système —
en Node, la tentative échoue avec `EINVAL`. C'est justement ce qui en fait le dernier
recours fiable : aucun processus ne peut s'en protéger.

**Décision 3 — la question que la recette escamote.** « S'il ne meurt pas, alors `kill -9` »
est un geste, pas un diagnostic. Un processus qui survit à SIGTERM te dit quelque chose, et
il n'y a que deux réponses possibles. Soit il l'a reçu et l'a ignoré — c'est un bug, ton code
capture le signal et ne termine jamais son arrêt, et cela se reproduira à chaque déploiement.
Soit il ne l'a même pas reçu, parce qu'il est bloqué dans un appel système non
interruptible : attente sur un disque en panne, un montage réseau disparu. Dans ce second
cas, `kill -9` lui-même ne fera rien — et si `kill -9` ne suffit pas, tu viens d'apprendre
que ton problème n'est pas un processus récalcitrant mais du matériel ou du stockage.

**Le même mécanisme, vu de l'autre côté.** Tu as sûrement remarqué qu'un conteneur met
parfois dix secondes à s'arrêter au déploiement, puis meurt brutalement. C'est exactement
ceci : l'orchestrateur envoie SIGTERM, attend un délai de grâce, puis envoie SIGKILL. Un
arrêt qui prend systématiquement la durée entière du délai signifie que **personne n'écoute
SIGTERM** dans le conteneur — chaque déploiement coupe donc les requêtes en cours. Le
correctif n'est pas d'allonger le délai, c'est d'ajouter le gestionnaire.

**Ce que tu dois retenir du cas de départ.** Le port occupé n'était pas le problème, c'était
le symptôme : un processus lancé à la main avait survécu à la fermeture du terminal. Tuer le
processus règle l'instant ; lui donner un vrai gestionnaire de service, qui sait le démarrer,
l'arrêter proprement et le relancer, règle la catégorie.

**Variante qui déplace le problème.** Même symptôme, mais `ss -ltnp` ne montre **aucun**
processus sur le port 3000 — et pourtant l'application refuse de démarrer avec la même
erreur. Le raisonnement précédent ne mord plus, puisqu'il n'y a personne à tuer. Deux causes
possibles, et toutes deux instructives. Soit le processus appartient à un autre utilisateur
et tu ne vois pas son nom faute de droits — `ss` n'affiche que ce qu'il a le droit de
montrer, et une sortie vide peut signifier « rien » comme « rien de visible par toi ». Soit
il n'y a réellement plus de processus, mais une connexion précédente occupe encore le port
dans un état d'attente le temps que le système s'assure qu'aucun paquet retardataire ne
traîne ; le port se libère alors tout seul après un délai, et l'option de réutilisation
d'adresse existe précisément pour ce cas. **Une absence dans une sortie de commande n'est
pas une preuve d'absence dans le système** — c'est la première question à se poser quand un
outil de diagnostic ne montre rien.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Un service ne s'arrête pas. Tu tapes `kill -9`. Qu'est-ce que tu viens d'empêcher ?
2. `kill -9` ne fonctionne pas non plus. Que peux-tu en déduire sur l'état du processus ?
3. Ton conteneur met dix secondes à s'arrêter à chaque déploiement, puis meurt
   brutalement. Que se passe-t-il ?
4. Tu vois quarante processus zombies. Consomment-ils du CPU ? Faut-il les tuer ?

## ✅ Correction attendue

**La démarche.** Toujours `SIGTERM` d'abord, attendre, et n'employer `SIGKILL` que si
l'on a compris pourquoi le processus n'a pas obéi. La question n'est pas « comment le
tuer » mais « pourquoi ne se termine-t-il pas ».

**L'erreur probable, et c'est le réflexe le plus répandu du métier.** `kill -9` est
souvent la première commande tapée, parce qu'elle marche toujours. C'est précisément ce
qui la rend dangereuse : **elle marche toujours parce que le processus n'a pas son mot à
dire.**

`SIGKILL` est l'un des deux seuls signaux qu'un programme ne peut ni intercepter, ni
ignorer, ni retarder. Il est exécuté par le noyau, sans que le processus en soit averti.
Concrètement, ce que tu viens d'empêcher :

- les écritures encore en tampon ne sont **jamais** envoyées sur le disque — données
  perdues, fichier tronqué ;
- les requêtes en cours sont coupées net, au milieu de leur réponse ;
- les connexions à la base ne sont pas fermées et resteront occupées jusqu'à leur
  expiration côté serveur ;
- les fichiers de verrou, sockets et fichiers temporaires ne sont pas nettoyés — d'où
  le « il refuse de redémarrer, un verrou traîne » du lendemain.

`SIGTERM`, lui, est une **demande** : le programme reçoit le signal, termine sa requête
en cours, vide ses tampons, ferme ce qu'il doit fermer, et sort. C'est la différence
entre demander à quelqu'un de partir et couper le courant du bâtiment.

Le piège séduit pour une raison simple et honnête : **`kill` ordinaire semble parfois ne
rien faire.** On tape la commande, le processus est toujours là une seconde plus tard,
on conclut qu'elle a échoué et l'on passe au `-9`. En réalité l'arrêt propre prend
souvent quelques secondes — c'est même son but. L'impatience est le vrai mécanisme de
l'erreur, pas l'ignorance.

**Sur les autres questions.** Si `kill -9` lui-même reste sans effet, le processus est
presque certainement en état **D**, *uninterruptible sleep* : il attend une opération
d'entrée-sortie que le noyau ne peut pas interrompre — un disque défaillant, un montage
réseau (NFS) qui ne répond plus. Le signal est bien enregistré, mais il ne sera traité
qu'au retour de l'I/O. Aucune commande ne débloquera cela : le problème est le stockage,
pas le processus, et `ps` le montre avec un `D` dans la colonne d'état.

Le conteneur qui met dix secondes puis meurt brutalement décrit exactement ce cycle :
l'orchestrateur envoie `SIGTERM`, attend son délai de grâce — dix secondes par défaut —
puis envoie `SIGKILL`. Si cela se produit à chaque déploiement, **le processus n'a pas
reçu ou pas traité le `SIGTERM`** : soit il est lancé via un shell qui ne le transmet
pas, soit le code ne l'écoute pas. À chaque livraison, des requêtes en cours sont donc
coupées.

Enfin, les zombies **ne consomment aucun CPU ni mémoire** : il ne reste d'eux qu'une
entrée dans la table des processus, conservée jusqu'à ce que leur parent lise leur code
de sortie. On ne peut pas les tuer — ils sont déjà morts. Ce qu'il faut traiter est le
**parent**, qui n'appelle pas `wait()`. Leur seul danger est l'épuisement de la table des
PID quand ils s'accumulent par milliers.

**Alternative défendable.** Dans un conteneur jetable et sans état — un job de calcul,
un outil de build — `SIGKILL` immédiat est parfaitement acceptable et plus rapide : il
n'y a rien à préserver. La règle n'est pas « ne jamais tuer », c'est « savoir ce qu'on
détruit ».

**Vérifie seul, sans corrigé** :
1. Lance ton service, envoie-lui `SIGTERM`, et regarde ses logs. Écrit-il quelque chose
   avant de sortir ? Sinon, il ne gère pas l'arrêt.
2. `ps -eo pid,stat,comm | grep ' D'`. Tout processus en `D` t'apprend quelque chose sur
   ton stockage.
3. Mesure le temps d'arrêt de ton conteneur. S'il est exactement égal au délai de grâce,
   c'est un `SIGKILL` déguisé à chaque déploiement.

## ⚠️ Erreurs fréquentes
- **Dégainer `kill -9` d'emblée** : empêche l'arrêt propre (fichiers corrompus,
  connexions non fermées). Toujours SIGTERM d'abord.
- Croire qu'un `&` rend un processus permanent : il meurt avec le terminal.
- Confondre CPU% cumulé et instantané dans `ps` vs `top`.
- Tuer le mauvais PID (vérifier la ligne de commande avec `pgrep -a`).
- Ignorer un tas de zombies au lieu de corriger le parent.

## 🐳 Vers le conteneur
Un conteneur exécute un **PID 1** particulier : c'est votre application. S'il
n'intercepte pas SIGTERM correctement, `docker stop` attend puis tue de force
(SIGKILL) — d'où des arrêts « sales ». Le modèle processus/signaux d'ici explique
directement le cycle de vie d'un conteneur et d'un Pod Kubernetes.

## 🏢 Cas métier
Un service consomme 100% CPU. `top` identifie le PID ; `ps -ef --forest` montre qu'il
a lancé des enfants en boucle. On envoie SIGTERM (arrêt propre), on lit les logs, on
corrige la boucle, on redéploie — plutôt que de `kill -9` en aveugle toutes les
minutes.

## 🎤 Questions d'entretien
- « Différence entre SIGTERM et SIGKILL ? » → propre et interceptable vs immédiat et
  non interceptable.
- « Qu'est-ce qu'un zombie ? » → processus terminé non récupéré par son parent.
- « Comment recharger la config d'un daemon sans le couper ? » → `kill -HUP`.

## ✍️ Mini-exercice
Un service refuse de s'arrêter avec `kill`. Quel est le bon réflexe AVANT `kill -9` ?
→ vérifier qu'il n'est pas en train de finir une tâche/une I/O, laisser un court délai
au SIGTERM, puis seulement forcer.

## 🧾 À retenir
- Programme = inerte ; processus = programme en exécution (PID, PPID, mémoire).
- États : running/sleeping/stopped/zombie ; l'arbre a PID 1 pour racine.
- `ps`/`top` pour observer, `pgrep`/`ss` pour retrouver.
- Signaux : TERM (propre) → attendre → KILL (forcer) ; HUP recharge la config.
- `&`/`nohup` ≠ vrai service : préférer systemd pour la durée.

## 📚 Vocabulaire
**processus** · **PID / PPID** · **fork / exec** · **état (running/sleeping/zombie)** ·
**job (avant/arrière-plan)** · **signal** · **SIGTERM / SIGKILL / SIGHUP** ·
**nohup / disown**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je retrouve le PID d'un service et je lis son état.
- [ ] J'arrête un processus proprement (TERM) avant de forcer (KILL).
- [ ] Je sais libérer un port occupé méthodiquement.

## 🔗 Liens avec le programme
Jour `/day/72` (processus, permissions). Leçons liées :
`/doc/lessons/linux-filesystem-permissions`, `/doc/lessons/linux-services-systemd`. Le
modèle de signaux prépare le cycle de vie des conteneurs et des Pods (arrêt gracieux via
`SIGTERM`, probes) — développé dans les leçons Docker et Kubernetes du parcours.
