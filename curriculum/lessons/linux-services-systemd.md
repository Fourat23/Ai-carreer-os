<!-- keep -->
# Leçon — Linux : services, daemons et systemd

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Vous lancez votre serveur à la main dans un terminal : il marche. Vous fermez le
terminal… et tout s'arrête. La machine redémarre la nuit : votre serveur ne revient
pas. Il crashe à 3 h du matin : personne ne le relance. Lancer un programme « à la
main » ne suffit donc pas pour qu'un service tienne dans la durée. Il faut quelqu'un
qui le démarre au bon moment, le RELANCE s'il tombe, et garde une trace de ce qui
s'est passé. Sur Linux, ce « quelqu'un » est un chef d'orchestre appelé **systemd**.
Cette leçon explique le problème (faire tourner un programme durablement, sans
humain de garde) puis la solution, sans supposer que vous savez ce qu'est un
« service ».

## 🎯 Objectif
Comprendre ce qu'est un **service** (daemon), comment **systemd** le démarre, le
supervise et le redémarre, et savoir lire ses **logs** avec `journalctl` — pour qu'une
application tourne durablement, survive au redémarrage de la machine, et se diagnostique
proprement.

## 🧩 Prérequis
Vous devez comprendre ce qu'est un **processus** et comment on l'arrête proprement
(`/doc/lessons/linux-processes-signals`) — car un service n'est qu'un processus géré
automatiquement, et systemd s'appuie sur les signaux (`SIGTERM`) pour l'arrêter. La
notion de « daemon » (programme de fond) est définie dans cette leçon.

## 🧠 Modèle mental
Un **daemon** est un processus qui tourne en tâche de fond, sans terminal, en
permanence (serveur web, base de données, agent). Le problème : qui le démarre au boot,
le relance s'il crashe, capture ses logs, gère ses dépendances ? La réponse moderne,
c'est **systemd** : le **PID 1** de la plupart des distributions, un chef d'orchestre
qui pilote les services de façon déclarative. On ne « lance » plus un service à la
main : on **déclare** ce qu'il doit être, et systemd s'occupe du reste.

## 📖 Explication complète
**systemd et les units.** systemd gère des *units*. La plus courante est le fichier
`.service` (dans `/etc/systemd/system/`). Il DÉCRIT l'état désiré : quelle commande
lancer, sous quel utilisateur, quoi faire en cas de crash, de quoi dépendre. systemd
compare l'état désiré à l'état réel et agit — même logique déclarative qu'on retrouvera
en Kubernetes et en Infrastructure as Code.

**Un fichier .service minimal.**
```ini
[Unit]
Description=Mon API
After=network.target            # démarrer après que le réseau est prêt

[Service]
ExecStart=/usr/bin/node /srv/app/server.js
User=app                        # tourne sous un utilisateur dédié (moindre privilège)
Restart=on-failure              # relance automatique si crash
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target      # activé au boot en mode normal
```

**enable vs start.** Deux notions distinctes : `start` démarre MAINTENANT ; `enable`
active AU BOOT (crée un lien depuis la cible `WantedBy`). On veut généralement les
deux : `systemctl enable --now mon-api`. Oublier `enable`, c'est un service qui
disparaît au prochain redémarrage.

**Supervision et redémarrage.** `Restart=on-failure` fait relancer le service s'il se
termine anormalement — mais attention à la boucle de crash : systemd applique un
back-off et peut « abandonner » après trop de tentatives (`StartLimit`). Un service qui
redémarre en boucle est l'équivalent Linux du CrashLoopBackOff Kubernetes : la relance
automatique n'excuse pas de diagnostiquer la cause.

**Les logs (journal).** systemd capture stdout/stderr des services dans le **journal**.
`journalctl -u mon-api` montre les logs du service ; `-f` suit en direct ; `-e` va à la
fin ; `--since "10 min ago"` borne dans le temps. C'est LE réflexe quand un service ne
démarre pas : on lit son journal avant de toucher quoi que ce soit.

## 🔧 Commandes essentielles
```bash
systemctl status mon-api          # état : actif ? depuis quand ? dernier échec ?
systemctl start|stop|restart mon-api
systemctl enable --now mon-api    # activer au boot ET démarrer maintenant
systemctl disable mon-api         # ne plus démarrer au boot
systemctl daemon-reload           # après édition d'un fichier .service
journalctl -u mon-api -e          # logs du service (fin)
journalctl -u mon-api -f          # suivre en direct
journalctl -u mon-api --since today -p err   # erreurs du jour
systemctl list-units --failed     # tous les services en échec
```

## 🧭 Exemple guidé — « mon service ne démarre pas »
1. `systemctl status mon-api` : est-il *failed* ? quel code de sortie ?
2. `journalctl -u mon-api -e` : lire le VRAI message d'erreur (config introuvable,
   port occupé, permission refusée, binaire absent).
3. Corriger la cause exacte (droits d'un fichier, chemin d'`ExecStart`, variable
   d'environnement manquante).
4. `systemctl daemon-reload` si on a édité le `.service`, puis `restart`.
5. Vérifier `enable` pour le boot.

## ⚠️ Erreurs fréquentes
- **`start` sans `enable`** : le service ne revient pas après un reboot.
- Éditer le `.service` sans `daemon-reload` : systemd garde l'ancienne version.
- Faire tourner le service en `root` par facilité (créer un utilisateur dédié).
- `Restart=always` qui masque un crash récurrent au lieu de le corriger.
- Chercher les logs dans `/var/log/monapp.log` alors qu'ils sont dans le journal.
- Chemins relatifs dans `ExecStart` (systemd n'a pas votre répertoire courant).

## 🔐 Sécurité
Un service tourne sous un **utilisateur dédié** au moindre privilège (`User=app`), pas
root. systemd offre des durcissements (`ProtectSystem`, `NoNewPrivileges`,
`ReadOnlyPaths`) — l'équivalent Linux du `securityContext` d'un Pod. Les secrets
passent par des fichiers en `600` ou `EnvironmentFile`, jamais en clair dans le
`.service` versionné.

## 🏢 Cas métier
Après un redémarrage serveur nocturne, l'API est down. `systemctl status` : *inactive*.
Cause : le service avait été `start` mais jamais `enable`. Correction :
`systemctl enable mon-api`. Post-mortem : ajouter l'`enable` au provisionnement (IaC)
pour que ça ne se reproduise pas.

## 🎤 Questions d'entretien
- « Différence entre `start` et `enable` ? » → maintenant vs au boot.
- « Où lire les logs d'un service systemd ? » → `journalctl -u <service>`.
- « Un service redémarre en boucle, que fais-tu ? » → lire le journal, trouver la
  cause, ne pas se contenter du `Restart`.

## ✍️ Mini-exercice
Vous venez de modifier `/etc/systemd/system/mon-api.service`. Quelle commande AVANT le
`restart` pour que systemd prenne en compte le changement ? → `systemctl daemon-reload`.

## 🧾 À retenir
- Daemon = processus de fond permanent ; systemd (PID 1) les pilote de façon déclarative.
- Un `.service` décrit l'état désiré (commande, utilisateur, restart, dépendances).
- `enable` (boot) ≠ `start` (maintenant) ; `enable --now` fait les deux.
- Logs dans le journal : `journalctl -u <service>`.
- Redémarrage auto ≠ dispense de diagnostiquer.

## 📚 Vocabulaire
**daemon** · **service** · **systemd** · **unit / .service** · **ExecStart** ·
**enable / start** · **Restart / back-off** · **journal / journalctl** ·
**daemon-reload** · **target**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'écris un `.service` minimal correct (utilisateur dédié, restart).
- [ ] Je diagnostique un service *failed* par son journal.
- [ ] Je distingue `enable` et `start` et je pense au boot.

## 🔗 Liens avec le programme
Jour `/day/72` (services, processus). Leçons liées :
`/doc/lessons/linux-processes-signals`, `/doc/lessons/observability-logging`. Le modèle
déclaratif de systemd (état désiré + supervision) est le même que celui de Kubernetes,
approfondi dans les leçons Docker et Kubernetes du parcours.
