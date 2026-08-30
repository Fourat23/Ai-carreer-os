<!-- keep -->
# Leçon — Linux : SSH et accès distant

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Votre serveur est dans un datacenter à des milliers de kilomètres, ou c'est une
machine louée dans le cloud. Vous devez y taper des commandes comme si vous étiez
devant. Deux dangers évidents : n'importe qui sur le chemin pourrait **espionner**
ce que vous tapez (dont vos mots de passe), et vous pourriez vous connecter par
erreur à une **fausse** machine qui se fait passer pour la vôtre. **SSH** résout les
deux : il ouvre un tuyau chiffré ET vérifie l'identité des deux bouts. Cette leçon
part de ce besoin concret (« administrer une machine distante sans se faire
espionner ni tromper ») et montre pourquoi une **clé** cryptographique est bien plus
sûre qu'un mot de passe.

## 🎯 Objectif
Comprendre comment **SSH** sécurise un accès à distance, savoir utiliser
l'**authentification par clé** (plutôt que par mot de passe), copier des fichiers
(`scp`/`rsync`), ouvrir un **tunnel**, et appliquer les réglages de durcissement de
base — la porte d'entrée de toute machine serveur ou instance cloud.

## 🧩 Prérequis
Vous devez comprendre les **permissions** de fichiers
(`/doc/lessons/linux-filesystem-permissions`) — SSH refuse une clé privée aux droits
trop ouverts — et avoir une idée de ce qu'est une **connexion réseau** et un **port**
(`/doc/lessons/networking-tcp-ip-model`). Les notions de clé publique/privée et de
tunnel sont expliquées ici depuis le début.

## 🧠 Modèle mental
SSH (Secure Shell) ouvre un **canal chiffré** entre votre machine (client) et une
machine distante (serveur), généralement sur le port 22. Deux questions sont réglées :
« à qui je parle vraiment ? » (le serveur prouve son identité via sa **clé d'hôte**) et
« qui suis-je ? » (vous prouvez la vôtre, idéalement via une **clé** cryptographique).
Une fois établi, tout ce qui passe est chiffré : commandes, fichiers, tunnels.

## 📖 Explication complète
**Clés vs mot de passe.** Un mot de passe se devine, se rejoue, se force en brute
force. Une **paire de clés** asymétrique est bien plus sûre : une **clé privée** reste
sur votre machine (jamais partagée, protégée en `600`), une **clé publique** est
déposée sur le serveur (`~/.ssh/authorized_keys`). Le serveur envoie un défi que seul
le détenteur de la privée peut résoudre : aucun secret ne transite. On génère une paire
avec `ssh-keygen -t ed25519`.

**La clé d'hôte et le TOFU.** À la première connexion, SSH affiche l'empreinte du
serveur et vous demande de l'accepter (Trust On First Use). Elle est stockée dans
`~/.ssh/known_hosts`. Si elle CHANGE ensuite, SSH refuse et alerte (« REMOTE HOST
IDENTIFICATION HAS CHANGED ») : ce peut être une réinstallation légitime… ou une
attaque de l'homme du milieu. On ne supprime pas la ligne sans comprendre pourquoi.

**L'agent SSH.** Taper la phrase de passe de sa clé à chaque connexion est pénible.
`ssh-agent` garde la clé déverrouillée en mémoire pour la session ; `ssh-add` l'y
ajoute. L'**agent forwarding** (`-A`) permet d'utiliser sa clé locale depuis un serveur
intermédiaire — pratique mais à manier avec prudence (un serveur compromis peut s'en
servir).

**Le fichier de config.** `~/.ssh/config` évite de retaper hôte, utilisateur, clé, port :
```
Host prod
    HostName 203.0.113.10      # (adresse d'exemple, documentation)
    User app
    IdentityFile ~/.ssh/id_ed25519
    Port 22
```
Ensuite `ssh prod` suffit.

**Copier des fichiers.** `scp fichier prod:/srv/` copie vers le serveur ;
`scp prod:/var/log/app.log .` récupère. Pour des dossiers volumineux ou des synchros
répétées, `rsync -avz` est plus efficace (ne transfère que les différences).

**Tunnels (port forwarding).** SSH peut relayer un port à travers le canal chiffré :
`ssh -L 5432:localhost:5432 prod` rend la base du serveur accessible en local sur 5432
sans l'exposer sur Internet. C'est la façon propre d'atteindre un service privé.

## 🔧 Commandes essentielles
```bash
ssh-keygen -t ed25519 -C "moi@machine"   # générer une paire de clés moderne
ssh-copy-id prod                          # déposer sa clé publique sur le serveur
ssh prod                                  # se connecter (via ~/.ssh/config)
ssh app@203.0.113.10 -p 22                # connexion explicite
scp app.log prod:/srv/                    # copier un fichier
rsync -avz ./build/ prod:/srv/app/        # synchroniser un dossier
ssh -L 5432:localhost:5432 prod           # tunnel local -> service distant privé
ssh-add ~/.ssh/id_ed25519                 # charger la clé dans l'agent
```

## 🧭 Exemple guidé — première connexion par clé (pas à pas)
**Situation.** Vous venez de louer une machine et vous voulez vous y connecter sans
mot de passe, de façon sûre.
1. **Générer une paire de clés** (une fois pour toutes) : `ssh-keygen -t ed25519`.
   Deux fichiers apparaissent : `~/.ssh/id_ed25519` (la clé **privée**, secrète, à ne
   JAMAIS partager) et `~/.ssh/id_ed25519.pub` (la clé **publique**, qu'on peut
   diffuser). Analogie (avec ses limites) : la clé publique est un cadenas ouvert que
   l'on distribue ; la clé privée est la seule à pouvoir le fermer/ouvrir. L'analogie
   s'arrête là : il n'y a pas d'objet physique, juste des maths.
2. **Déposer la clé publique** sur le serveur : `ssh-copy-id app@203.0.113.10`. Elle
   est ajoutée au fichier `~/.ssh/authorized_keys` du serveur (la liste des clés
   autorisées).
3. **Se connecter** : `ssh app@203.0.113.10`. La première fois, le client affiche
   l'empreinte de la **clé d'hôte** du serveur et demande confirmation : c'est le
   serveur qui prouve SON identité (on répond `yes` seulement si l'empreinte est
   attendue). Elle est mémorisée dans `~/.ssh/known_hosts`.
4. **Résultat** : vous obtenez un shell distant, sans mot de passe, sur un canal
   chiffré. Si ça échoue par « Permissions … are too open », c'est que la clé privée
   n'est pas en `600` (cf. la leçon permissions) : `chmod 600 ~/.ssh/id_ed25519`.

## 🧪 Pourquoi une clé, plutôt qu'un mot de passe — vérifié

> **Limite déclarée.** Ni le client ni le serveur OpenSSH ne sont installés dans
> l'environnement où ce cours a été écrit (`which ssh` : introuvable ;
> l'installation par le gestionnaire de paquets échoue). **Aucune commande `ssh`
> ni `ssh-keygen` n'a été exécutée.** Les commandes de la section précédente sont
> donc données sans exécution. En revanche, la question de fond — pourquoi une
> paire de clés remplace un mot de passe — repose sur de la cryptographie et de
> l'arithmétique, toutes deux vérifiables :
> `scripts/v70-verifications/cles-vs-mots-de-passe.mjs`.

### Le serveur vérifie sans jamais connaître le secret

C'est le cœur du mécanisme, et il est plus simple qu'il n'en a l'air. Le script
génère une paire Ed25519 — **44 octets** pour la clé publique, **48** pour la
privée — puis rejoue l'échange :

```
défi envoyé par le serveur   : 005ad053b7201c23ed21b7c3…   (32 octets aléatoires)
signature renvoyée           : 64 octets
vérification par le serveur  : true
la même signature sur un AUTRE défi : false
```

Le serveur tire un nombre au hasard, le client le signe avec sa clé privée, et le
serveur vérifie **avec la seule clé publique**. Deux propriétés en découlent
directement.

**Le secret ne traverse jamais le réseau.** Un serveur compromis apprend une clé
publique — qui est publique — et une signature valable pour un défi déjà utilisé.
Avec un mot de passe, le même serveur compromis apprend le mot de passe.

**La signature ne se rejoue pas.** La même signature sur un autre défi est
refusée. C'est ce qui rend l'interception inutile : ce qui a été capturé ne
resservira pas.

### L'arithmétique, y compris ce qu'elle contredit

Il faut publier ce calcul en entier, parce qu'il corrige un argument qu'on
entend souvent et qui est faux.

| secret | possibilités | en ligne (100 essais/s) | hors ligne (681 015/s) |
|---|---|---|---|
| 8 caractères minuscules | 2,09 × 10¹¹ | 33 ans | **1,8 jour** |
| 8 caractères mixtes + chiffres | 2,18 × 10¹⁴ | 3,5 × 10⁴ ans | 5 ans |
| 12 caractères mixtes | 3,23 × 10²¹ | 5,1 × 10¹¹ ans | 7,5 × 10⁷ ans |
| clé Ed25519 (2¹²⁸) | 3,40 × 10³⁸ | 5,4 × 10²⁸ ans | 7,9 × 10²⁴ ans |

La cadence hors ligne n'est pas inventée : c'est la valeur **mesurée** sur la
machine de rédaction par la vérification `hachage-lent.mjs`, 681 015 empreintes
SHA-256 par seconde.

**L'argument courant est faux.** On lit partout qu'un mot de passe tombe en
quelques heures par force brute et qu'il faut donc passer aux clés. La colonne
« en ligne » dit le contraire : même huit caractères minuscules tiennent 33 ans à
cent essais par seconde. Un serveur qui répond limite naturellement la cadence.
**La force brute en ligne n'est pas la menace**, et il faut le dire.

Ce qui rend les mots de passe dangereux est ailleurs, et se lit dans les deux
autres colonnes.

**Hors ligne, après fuite.** Si une base d'empreintes fuite — la vôtre, ou celle
d'un autre service où vous avez utilisé le même mot de passe — les mêmes huit
caractères tombent en **1,8 jour**. Le secret que vous tapez sur ce serveur
protège aussi vos autres comptes, et vous ne contrôlez pas la sécurité de tous.

**Personne n'attaque par force brute.** On attaque par dictionnaire. La même
vérification `hachage-lent.mjs` a mesuré **14,7 secondes** pour un mot de passe
courant contre 4,9 jours de force brute. Les durées du tableau sont donc des
**majorants très optimistes** pour un mot de passe choisi par un humain.

**Et une clé n'a rien à deviner.** La colonne « hors ligne » y est sans objet :
il n'existe aucune empreinte à faire fuir, puisque le serveur ne détient qu'une
clé publique. Ce n'est pas un curseur déplacé, c'est un changement de nature. La
bonne formulation de l'argument est donc : **la clé ne rend pas l'attaque plus
difficile, elle la rend sans objet.**

### Ce qu'une clé ne protège pas

Trois limites, que la clé ne couvre pas et qu'il faut traiter séparément.

**La clé privée est un fichier.** Copiée, elle donne l'accès — sans essai, sans
délai, sans bruit. D'où deux exigences : elle est chiffrée par une phrase de
passe (sinon quiconque lit le disque a l'accès), et ses droits sont restreints à
son propriétaire. Le client refuse d'ailleurs de l'utiliser si elle est lisible
par d'autres, ce qui est une des rares vérifications de droits qu'un outil fait
pour vous.

**Déposer une clé ne ferme aucune porte.** Un serveur qui accepte encore les
mots de passe reste attaquable par mot de passe, clé ou pas. L'authentification
par mot de passe doit être **désactivée explicitement** — le durcissement
ci-dessous n'est donc pas optionnel, il est ce qui rend la clé utile.

**La clé authentifie le client, pas le serveur.** Elle ne dit rien de la machine
à laquelle vous parlez. C'est l'empreinte de la clé d'hôte, mémorisée dans
`known_hosts`, qui protège de l'interception — et c'est précisément ce qu'on
accepte à l'aveugle la première fois, en tapant `yes` sans vérifier. Cette
première connexion est le seul moment où la chaîne de confiance repose sur une
vérification humaine, et c'est aussi le seul moment où presque personne ne la
fait. Corollaire : **un avertissement de changement d'empreinte s'enquête, il ne
se contourne pas** en supprimant la ligne.

## 🔐 Durcissement du serveur
Réglages classiques (`/etc/ssh/sshd_config`) : `PasswordAuthentication no` (clés
uniquement), `PermitRootLogin no` (pas de connexion root directe — on passe par un
utilisateur puis `sudo`), changer le port par obscurité est cosmétique (ne remplace pas
les clés). Compléter au niveau réseau : n'ouvrir le 22 qu'aux IP nécessaires (security
group/pare-feu), fail2ban contre le brute force. La clé privée reste en `600` ; une clé
avec des droits trop larges est refusée par le client.

## ⚠️ Erreurs fréquentes
- **Partager ou committer une clé privée** : compromission totale. Seule la publique se
  partage. Un `.pem`/`id_*` dans Git est un incident (révoquer, régénérer).
- Clé privée en `644` : SSH la refuse (« UNPROTECTED PRIVATE KEY FILE »).
- Supprimer une ligne de `known_hosts` sans se demander pourquoi l'empreinte a changé.
- Laisser `PasswordAuthentication yes` sur un serveur exposé (brute force).
- Se connecter en root directement au lieu d'un utilisateur + sudo.
- Exposer une base sur Internet au lieu d'un tunnel SSH.

## 🏢 Cas métier
On doit interroger une base PostgreSQL d'un serveur de prod, non exposée sur Internet
(bonne pratique). Plutôt que d'ouvrir le port 5432 au monde, on ouvre un tunnel :
`ssh -L 5432:localhost:5432 prod`, puis on se connecte en local — chiffré, sans élargir
la surface d'attaque.

## 🎤 Questions d'entretien
- « Pourquoi préférer les clés au mot de passe ? » → pas de secret qui transite,
  résistance au brute force, révocation par clé.
- « Que fait `ssh -L` ? » → un tunnel : relayer un port distant via le canal chiffré.
- « L'empreinte du serveur a changé, que fais-tu ? » → enquêter (réinstall légitime ?
  MITM ?) avant d'accepter.

## ✍️ Mini-exercice
Sans relire : un collègue te demande un accès de déploiement. Que lui
demandes-tu, et que déposes-tu où ?

## 🔥 Pratique — l'accès distant, de la théorie à la machine

**A. Refaire le protocole à la main.** Sans utiliser `ssh`, écris un programme
qui génère une paire Ed25519, simule un serveur qui envoie un défi aléatoire,
signe ce défi côté client, et vérifie côté serveur **avec la seule clé
publique**. Vérifie ensuite que la même signature est refusée sur un autre défi.
Livrable : le code et les deux résultats de vérification.

**B. Chiffrer les durées pour ton cas.** Reprends le tableau de la section
précédente avec la longueur et la composition du mot de passe que **tu** utilises
réellement. Calcule les deux colonnes. Livrable : tes deux durées, et ta
conclusion.

**C. Mettre en place l'accès.** Sur une machine distante (une machine virtuelle
locale suffit), génère une paire, dépose la clé publique, connecte-toi sans mot
de passe. Puis rends la clé privée lisible par tout le monde et note **le message
exact** que le client renvoie. Livrable : les deux traces.

**D. Durcir, et le prouver.** Désactive l'authentification par mot de passe et la
connexion directe en superutilisateur. Puis **prouve** que c'est effectif :
tente une connexion par mot de passe et garde le refus. Sans cette preuve, tu as
modifié un fichier de configuration, pas fermé une porte.

**E. Le tunnel.** Ouvre un tunnel vers un service non exposé (une base de
données), connecte-toi en local à travers lui, et vérifie depuis l'extérieur que
le port distant reste bien fermé. Livrable : la commande, la connexion réussie
localement, et le refus depuis l'extérieur.

## ✅ Correction attendue

**A — le protocole.** L'erreur la plus instructive est de vérifier la signature
avec l'objet de clé privée, parce qu'on l'a sous la main. La correction consiste
à **reconstruire la clé publique depuis ses seuls octets** avant de vérifier —
c'est le seul moyen d'être certain de ce que le serveur connaît réellement. Une
démonstration qui utilise la clé privée des deux côtés ne démontre rien.

Le second résultat compte autant que le premier : la signature refusée sur un
autre défi. C'est lui qui explique pourquoi capturer le trafic ne sert à rien, et
donc pourquoi le protocole tient même sur un réseau hostile.

**B — tes durées.** Le résultat attendu n'est pas un chiffre mais un
raisonnement. Si tu conclus « mon mot de passe de 12 caractères est sûr », relis
la ligne sur le dictionnaire : ces durées supposent une recherche exhaustive
aveugle, alors que les attaques réelles commencent par les mots de passe déjà vus
ailleurs. Un mot de passe de 12 caractères **choisi par un humain** n'a pas
3,23 × 10²¹ possibilités ; il en a l'ordre de grandeur d'un dictionnaire, soit
quelques milliards au mieux. La bonne conclusion porte donc sur la façon dont le
secret a été **produit**, pas sur sa longueur.

**C — le message de refus.** Le client refuse une clé privée trop permissive, et
ce refus est instructif : c'est le programme, et non le système d'exploitation,
qui applique la règle. Le noyau autoriserait parfaitement la lecture. La leçon
générale, celle qui dépasse SSH : **certains contrôles de sécurité sont
appliqués par les outils, pas par le système** — donc un autre programme lisant
le même fichier ne les appliquera pas.

C'est aussi la raison pour laquelle une clé privée dans un dépôt git est un
incident et non une négligence : rien ne l'y protège, et la leçon
`deployment-secrets` mesure qu'elle y reste lisible après suppression. La réponse
est la même : révoquer d'abord — c'est-à-dire retirer la clé publique
correspondante des serveurs — puis régénérer, puis nettoyer.

**D — la preuve du durcissement.** C'est le cœur de l'exercice, et l'étape que
presque personne ne fait. Modifier une ligne de configuration et redémarrer le
service ne prouve rien : la directive peut être écrasée plus bas dans le fichier,
un bloc conditionnel peut la rendre inopérante pour certains utilisateurs, ou le
service peut avoir échoué à recharger sa configuration.

La seule vérification qui vaut est la tentative refusée. C'est exactement le
même principe que pour une CI (« casse un test, regarde si elle rougit ») et pour
une porte qualité : **un contrôle qu'on n'a jamais vu refuser n'est pas un
contrôle vérifié.**

**E — le tunnel.** Le point de conception : le tunnel n'ouvre rien sur le
serveur. Le port distant reste fermé au monde ; le trafic emprunte le canal
chiffré déjà authentifié. La surface d'attaque n'augmente pas d'un port.

Deux détails qu'une bonne réponse relève. D'abord, `-L 5432:localhost:5432` fait
résoudre `localhost` **depuis le serveur**, pas depuis ton poste — c'est la
source d'erreur numéro un, et la même confusion que dans un conteneur (voir
`docker-networking-volumes`). Ensuite, le tunnel donne l'accès à la base à
quiconque peut atteindre le port local sur ton poste, y compris un autre
programme qui tourne dessus ; se lier explicitement à `127.0.0.1` et non à toutes
les interfaces n'est pas un détail sur un réseau partagé.

## 🧾 À retenir
- SSH = canal chiffré ; le serveur prouve son identité (clé d'hôte), vous la vôtre (clé).
- Clés > mot de passe ; privée en `600`, jamais partagée ni committée.
- `~/.ssh/config` simplifie ; `scp`/`rsync` copient ; `-L` ouvre un tunnel.
- Durcir : clés seules, pas de root direct, port ouvert au minimum d'IP.

## 📚 Vocabulaire
**SSH** · **clé publique / privée** · **ed25519** · **authorized_keys** ·
**known_hosts / clé d'hôte** · **ssh-agent** · **~/.ssh/config** · **scp / rsync** ·
**tunnel / port forwarding** · **sshd_config**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je génère une paire de clés et je dépose la publique sur un serveur.
- [ ] Je protège ma clé privée (`600`, jamais dans Git).
- [ ] J'atteins un service privé via un tunnel plutôt que de l'exposer.

## 🔗 Liens avec le programme
Jour `/day/72` (Linux, accès). Leçons liées :
`/doc/lessons/linux-filesystem-permissions`, `/doc/lessons/deployment-secrets`,
`/doc/lessons/networking-http-tls`. L'accès distant et les tunnels reviennent en cloud
(bastion, endpoints privés) ; la gestion des clés rejoint celle des secrets.
