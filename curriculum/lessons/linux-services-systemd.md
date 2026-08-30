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

## 🧭 Exemple guidé — « mon service ne démarre pas », et pourquoi le redémarrage automatique aggrave

> **Limite déclarée.** Le gestionnaire de services `systemd` ne tourne pas dans
> l'environnement où ce cours a été écrit (`/run/systemd/system` est absent, le
> processus 1 n'est pas `systemd`). **Aucune commande `systemctl` n'a été
> exécutée** pour produire cette leçon : la syntaxe des fichiers d'unité est
> donnée sans exécution. En revanche, le **mécanisme** qu'un superviseur
> implémente — surveiller un processus, lire son code de sortie, décider de le
> relancer — a été exercé avec un superviseur minimal, et les chiffres ci-dessous
> sont mesurés : `scripts/v70-verifications/supervision-redemarrage.mjs`.

### 1. Le service échoue, et le superviseur insiste

Le service de démonstration s'arrête immédiatement parce qu'une variable de
configuration manque :

```
tentative 1 : code 78 apres 63 ms — « BASE_URL manquante »
tentative 2 : code 78 apres 59 ms — « BASE_URL manquante »
tentative 3 : code 78 apres 56 ms — « BASE_URL manquante »
...
54 redémarrages en 3 secondes, soit 18,0 par seconde.
```

Extrapolé : **64 800 lignes d'erreur par heure**. Et le service ne redémarrera
jamais avec succès, parce que la cause est une configuration absente et que
relancer ne la fait pas apparaître.

C'est la première chose à comprendre sur le redémarrage automatique : **il ne
répare que les pannes transitoires.** Une connexion réseau momentanément
indisponible, un verrou tenu par un processus qui vient de finir, une
dépendance qui démarre en même temps — oui. Une variable manquante, un fichier
de configuration invalide, un port déjà pris à demeure, un bogue — non. Sur ces
causes-là, le redémarrage ne fait qu'une chose : **transformer une panne
lisible en bruit.**

### 2. Le délai croissant, mesuré

Le remède n'est pas de renoncer au redémarrage, c'est d'attendre entre les
tentatives, et d'attendre de plus en plus longtemps :

```
délai fixe de 100 ms    : 63 tentatives en 10 s
délai doublant (100 ms) :  7 tentatives en 10 s
```

Un ordre de grandeur de moins. Mais le chiffre important n'est pas 7 : c'est que
le délai **croît**. À la dixième tentative, le superviseur attend 100 × 2⁹ =
51,2 secondes. La panne cesse d'être noyée, et une personne a le temps de la
voir.

À cela s'ajoute la limite : après N tentatives dans une fenêtre de temps, le
superviseur abandonne et marque le service **en échec**. C'est le comportement
souhaitable, et il est contre-intuitif — on préférerait qu'il continue d'essayer.
**Un état « échoué » visible vaut mieux qu'une boucle invisible**, parce qu'il
est interrogeable : la question « quel est l'état du service » a alors une
réponse utile, au lieu de « en cours de démarrage » pour l'éternité.

### 3. Le code de sortie dit pourquoi

Le service s'arrête avec le code **78**. Ce n'est pas arbitraire :

| code | signification |
|---|---|
| `0` | arrêt normal |
| `1` | erreur générique |
| `78` | erreur de configuration (`EX_CONFIG`) |
| `137` | tué par le signal 9 (`KILL`) — souvent le tueur de mémoire (`128 + 9`) |
| `143` | tué par le signal 15 (`TERM`) — arrêt demandé, donc **normal** (`128 + 15`) |

La règle `128 + N` vaut pour tout processus tué par un signal, et elle sert bien
au-delà des services : c'est la même arithmétique qui explique un conteneur
sorti en 137.

Ce qui en découle pour la configuration : **un superviseur qui redémarre sur
tous les codes redémarre aussi après un arrêt volontaire.** Distinguer « toujours
redémarrer » de « redémarrer seulement en cas d'échec » — `Restart=always` contre
`Restart=on-failure` dans un fichier d'unité systemd — est ce qui sépare
« redémarrer en cas de panne » de « redémarrer tout le temps ».

### 4. « Actif » ne veut pas dire « prêt »

Un service qui charge 800 ms de données avant de pouvoir répondre :

```
 50 ms après le lancement : processus vivant = true · service prêt = false
950 ms après le lancement : processus vivant = true · service prêt = true
```

Deux états distincts, séparés ici par 800 millisecondes. Un superviseur qui ne
surveille que le processus déclare le service **actif** pendant qu'il refuse
encore les requêtes — et tout ce qui est configuré pour démarrer « après » lui
démarre trop tôt.

C'est exactement le même défaut que `depends_on` dans une composition de
conteneurs, et la même correction : le service doit **signaler lui-même** sa
disponibilité (`Type=notify` avec `sd_notify`, ou un point d'entrée de santé que
l'on interroge), et ce qui dépend de lui doit **savoir réessayer**. Les deux
sont nécessaires : le signal supprime le cas courant, la reprise couvre le reste.

### 5. La démarche de diagnostic

Un service qui ne démarre pas se diagnostique dans cet ordre, et le premier pas
n'est pas de relancer :

1. **Lire l'état et le code de sortie**, pas seulement « ça ne marche pas ».
   Le code oriente déjà : 78 est une configuration, 137 est la mémoire, 143 est
   un arrêt demandé.
2. **Lire les journaux du service**, en remontant à la **première** tentative.
   Sur 54 tentatives par 3 secondes, les dernières lignes ne montrent que la
   boucle ; la cause est au début.
3. **Lancer la commande à la main**, avec le même utilisateur, le même
   répertoire de travail et le même environnement que l'unité. C'est là qu'on
   découvre que le service n'a pas les variables qu'il avait dans le terminal du
   développeur — la cause numéro un de « ça marche quand je le lance moi ».
4. **Vérifier les droits** : l'utilisateur du service peut-il lire sa
   configuration, écrire ses fichiers, se lier à son port ? Un port en dessous
   de 1024 exige un privilège que le service n'a probablement pas, et c'est
   voulu.
5. **Alors seulement**, ajuster la politique de redémarrage — en sachant qu'elle
   ne répare aucune des causes ci-dessus.

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
Sans relire : un service sort avec le code 143. Ton superviseur doit-il le
relancer ? Et avec 137 ?

## 🔥 Pratique — écrire un superviseur pour comprendre celui qu'on utilise

La façon la plus rapide de comprendre un gestionnaire de services est d'en
écrire un minuscule. Cette pratique produit du code exécutable, pas des fichiers
de configuration copiés.

**A. Le superviseur naïf.** Écris un programme qui lance un processus enfant et
le relance dès qu'il s'arrête, sans délai. Fais échouer l'enfant immédiatement
(variable manquante). Mesure le nombre de relances par seconde et extrapole à
l'heure. Livrable : les deux chiffres.

**B. Le délai croissant.** Ajoute une attente doublante entre les tentatives, et
une limite de N tentatives dans une fenêtre de T secondes au-delà de laquelle le
superviseur abandonne et affiche un état « échoué ». Compare le nombre de
tentatives sur 10 secondes avec et sans. Livrable : le tableau comparatif.

**C. Distinguer les codes.** Fais que ton superviseur relance sur un échec réel
mais **pas** après un arrêt demandé. Vérifie les deux cas : tue l'enfant avec le
signal 15, puis avec le signal 9, et note le code de sortie observé dans chaque
cas. Livrable : les deux codes et le comportement du superviseur.

**D. Actif contre prêt.** Ajoute à l'enfant un délai de chargement, puis un
signal de disponibilité (un fichier, ou une ligne sur la sortie standard). Fais
que le superviseur n'annonce « prêt » qu'après ce signal. Mesure l'écart entre
les deux instants. Livrable : le chiffre.

**E. Traduire en fichier d'unité.** Écris le fichier d'unité systemd qui exprime
ce que fait ton superviseur : utilisateur dédié, répertoire de travail,
environnement, politique de redémarrage, délai, limite de tentatives, type de
notification. Explique en une ligne par directive ce qu'elle achète, en te
référant à tes propres mesures.

## ✅ Correction attendue

**A — le superviseur naïf.** Les ordres de grandeur mesurés : environ 18 relances
par seconde, soit près de 65 000 lignes d'erreur par heure. Tes chiffres
dépendront de la vitesse de démarrage de ton enfant, mais la forme est la même :
la boucle tourne aussi vite que le processus meurt.

Le point à formuler, et il est plus important que le chiffre : **la relance ne
répare que les pannes transitoires.** Ici la cause est une variable absente ;
aucune quantité de relances ne la fera apparaître. Un superviseur sans délai
transforme une panne parfaitement lisible — un message d'erreur clair, une fois —
en un flot illisible qui masque à la fois ce message et tout ce qui se passe à
côté dans les journaux du système.

**B — le délai croissant.** Mesuré : 63 tentatives en 10 s à délai fixe contre 7
avec un délai qui double. Un ordre de grandeur. Mais le bon argument n'est pas
« moins de tentatives » — c'est que **le délai croît sans limite**, donc que le
système se stabilise de lui-même : à la dixième tentative l'attente est de 51,2
secondes, ce qui laisse le temps de voir la panne.

Sur la limite d'abandon, la réponse attendue défend le fait de **s'arrêter**.
C'est contre-intuitif : on préférerait un superviseur tenace. Mais un service
qui reste indéfiniment « en cours de démarrage » n'est pas interrogeable, alors
qu'un service « en échec » l'est — et c'est ce qui permet à une alerte de se
déclencher et à une personne d'astreinte de savoir quoi regarder.

Un raffinement qu'une bonne réponse mentionne : le délai doit être **plafonné**
(par exemple à cinq minutes), sinon un service qui a échoué quinze fois attend
des jours et ne se rétablira jamais d'une panne pourtant réparée entre-temps.

**C — les codes.** Les valeurs observées : **143** après le signal 15 (`TERM`),
**137** après le signal 9 (`KILL`), selon la règle `128 + N`. Le superviseur
attendu relance sur 137 et sur les codes d'erreur applicatifs, mais **pas** sur
143 — un arrêt demandé n'est pas une panne, et relancer après lui rend le service
impossible à arrêter.

C'est un piège très concret : un opérateur demande l'arrêt, le superviseur
relance, l'opérateur conclut que la commande ne fonctionne pas, et essaie plus
fort. La même arithmétique `128 + N` explique par ailleurs le code 137 d'un
conteneur tué pour dépassement de mémoire — c'est le même signal, envoyé par le
noyau au lieu de l'être par un humain.

**D — actif contre prêt.** L'écart mesuré est de 800 ms dans l'exemple, mais
l'ordre de grandeur réel d'un service applicatif — chargement de configuration,
ouverture de connexions, préchauffage de caches — se compte souvent en secondes
voire en dizaines de secondes.

Ce que la mesure doit t'amener à dire : « le processus tourne » est une propriété
du système d'exploitation, « le service répond » est une propriété de
l'application, et **seule l'application connaît la seconde**. D'où la nécessité
d'un signal émis par le service lui-même, et non déduit de l'extérieur.
Corollaire indispensable : le signal ne suffit pas. Ce qui dépend du service doit
**aussi** savoir réessayer, parce qu'un service peut redevenir indisponible après
avoir été prêt. Le signal supprime le cas courant du démarrage ; la reprise
couvre tout le reste de la vie du système.

**E — le fichier d'unité.** La forme attendue, chaque directive justifiée par une
des mesures ci-dessus :

```ini
[Unit]
Description=API de commandes
After=network-online.target

[Service]
Type=notify                 # D : le service signale lui-meme sa disponibilite
User=api                    # 5 : un utilisateur dedie, sans privileges
WorkingDirectory=/opt/api
EnvironmentFile=/etc/api.env  # A : la cause de l echec mesure etait ici
ExecStart=/usr/bin/node serveur.js
Restart=on-failure          # C : ne relance PAS apres un arret demande (143)
RestartSec=1s               # B : un delai, jamais zero
StartLimitBurst=5           # B : au dela, etat « echoue » visible
StartLimitIntervalSec=60

[Install]
WantedBy=multi-user.target
```

Trois erreurs classiques que la correction attend que tu évites. `Restart=always`
au lieu de `on-failure`, qui rend le service inarrêtable. Aucun `RestartSec`,
qui reproduit exactement la boucle de la mesure A. Et l'absence d'`User=`, qui
fait tourner le service en superutilisateur — ce que la leçon
`linux-filesystem-permissions` mesure comme contournant **tous** les contrôles de
droits, ce qui rend le durcissement du reste de la machine sans effet.

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
