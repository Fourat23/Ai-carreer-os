<!-- keep -->
# Leçon — Linux : SSH et accès distant

## 🎯 Objectif
Comprendre comment **SSH** sécurise un accès à distance, savoir utiliser
l'**authentification par clé** (plutôt que par mot de passe), copier des fichiers
(`scp`/`rsync`), ouvrir un **tunnel**, et appliquer les réglages de durcissement de
base — la porte d'entrée de toute machine serveur ou instance cloud.

## 🧩 Prérequis
Permissions (`/doc/lessons/linux-filesystem-permissions`) et notions de réseau
(`/doc/lessons/networking-tcp-ip-model`).

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
Vous devez donner un accès de déploiement à un collègue sur un serveur. Que lui
demandez-vous, et que déposez-vous où ? → sa clé PUBLIQUE, ajoutée à
`~/.ssh/authorized_keys` du serveur (jamais sa privée).

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
