<!-- keep -->
# Leçon — Linux : processus, jobs et signaux

## 🎯 Objectif
Comprendre ce qu'est un **processus** (PID/PPID, états, arbre), savoir l'observer
(`ps`, `top`), le contrôler en avant/arrière-plan (jobs), et lui envoyer les bons
**signaux** (`TERM` vs `KILL` vs `HUP`) — la base pour diagnostiquer un service qui
« rame », qui ne s'arrête pas, ou un port déjà occupé.

## 🧩 Prérequis
Terminal de base et permissions (`/doc/lessons/linux-filesystem-permissions`).

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
1. Trouver qui l'occupe : `ss -ltnp | grep :3000` (ou `lsof -i :3000`).
2. Identifier le PID et vérifier que c'est bien un ancien processus à moi.
3. Arrêter proprement : `kill <PID>` (SIGTERM). Attendre.
4. S'il ne meurt pas (bloqué), alors seulement `kill -9 <PID>`.
5. Comprendre POURQUOI il restait : oublié en arrière-plan ? mal arrêté ? → passer à
   un vrai service (systemd) pour un usage durable.

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
