<!-- keep -->
# Leçon — Linux : système de fichiers et permissions

## 🌍 Le problème d'abord
Vous lancez un programme sur un serveur et il refuse de démarrer avec un message
sec : « Permission denied ». Le fichier est pourtant là, vous le voyez. Alors
pourquoi la machine dit-elle non ? Parce que sous Linux, exister ne suffit pas :
pour CHAQUE fichier, le système garde en mémoire **qui a le droit d'en faire quoi**.
Tant qu'on ne sait pas lire ces droits, on tâtonne (et, pire, on « ouvre tout » par
dépit, ce qui crée des trous de sécurité). Cette leçon vous apprend à LIRE ces
droits et à corriger un refus d'accès en le comprenant, pas au hasard. On part de
zéro : deux idées suffisent — « où est rangé le fichier » et « qui a le droit ».

## 🎯 Objectif
Savoir lire et raisonner l'arborescence Linux, comprendre ce qu'est réellement un
fichier (inode), et **maîtriser les permissions** (propriétaire/groupe/autres, `rwx`,
notation octale) au point de diagnostiquer et corriger un « Permission denied » sans
tâtonner.

## 🧩 Prérequis
Avant cette leçon, vous devez savoir **ouvrir un terminal** et vous **déplacer dans
les dossiers** (`cd` pour changer de dossier, `ls` pour lister, `pwd` pour savoir où
l'on est) — car on va lire des chemins de fichiers et les droits associés. Si ces
gestes ne sont pas acquis, commencez par
`/doc/lessons/terminal-shell-filesystem`. Aucune notion de permissions n'est
supposée : on la construit ici.

## 🧠 Modèle mental
Sous Linux, **tout est fichier** : un document, un répertoire, un disque, une socket,
un périphérique. Un chemin (`/etc/nginx/nginx.conf`) est une adresse dans un arbre
unique dont la racine est `/`. Une permission répond à UNE question simple : « CET
utilisateur a-t-il le droit de FAIRE cette action sur CE fichier ? » — et la réponse
se lit en trois blocs de trois lettres.

## 📖 Explication complète
**L'arborescence (FHS).** Contrairement à Windows (C:, D:), Linux a un arbre unique.
Repères utiles : `/etc` (configuration), `/var` (données variables : logs dans
`/var/log`), `/home` (dossiers personnels), `/tmp` (temporaire), `/usr` (programmes),
`/bin` `/sbin` (binaires), `/proc` et `/sys` (vues du noyau, pas de vrais fichiers sur
disque). Un chemin **absolu** part de `/` ; un chemin **relatif** part du répertoire
courant (`.` = ici, `..` = parent).

**L'inode.** Un fichier n'EST pas son nom. Le nom vit dans un répertoire et pointe
vers un **inode** : une structure qui contient les métadonnées (taille, propriétaire,
permissions, horodatages) et l'emplacement des données. Conséquence concrète : un même
inode peut avoir plusieurs noms (liens durs) ; renommer/déplacer sur le même système
de fichiers ne recopie pas les données, ça change juste l'entrée de répertoire.

**Propriétaire, groupe, autres.** Chaque fichier appartient à un **utilisateur** et à
un **groupe**. Les permissions se déclinent en trois publics : le propriétaire
(`u`ser), le `g`roupe, les `o`thers (tous les autres). `ls -l` affiche par exemple :

```
-rw-r--r--  1 alice devs  2048 Jan 10 09:00 rapport.md
drwxr-x---  2 alice devs  4096 Jan 10 09:00 secret/
```

Le 1er caractère est le TYPE (`-` fichier, `d` répertoire, `l` lien symbolique). Les
9 suivants sont trois blocs `rwx` pour u/g/o.

**Signification de rwx.** Pour un **fichier** : `r` lire le contenu, `w` modifier,
`x` exécuter (le lancer comme programme). Pour un **répertoire** le sens change : `r`
lister les noms, `w` créer/supprimer des entrées, `x` **traverser** (entrer dedans,
accéder à un fichier par son chemin). Piège classique : sans `x` sur un dossier, on ne
peut PAS accéder à un fichier qu'il contient même si le fichier est `rw` — d'où
beaucoup de « Permission denied » incompris.

**La notation octale.** Chaque bloc `rwx` est un chiffre : `r`=4, `w`=2, `x`=1, additionnés.
`rwx`=7, `rw-`=6, `r-x`=5, `r--`=4. `chmod 644 fichier` = `rw-r--r--` (proprio lit/écrit,
les autres lisent). `chmod 755 script.sh` = `rwxr-xr-x` (exécutable par tous, modifiable
par le proprio seul). `chmod 600 clef` = `rw-------` (proprio seul, standard pour une
clé privée).

## 🔧 Commandes essentielles
```bash
ls -l                 # permissions, proprio, groupe, taille, date
ls -la                # inclut les fichiers cachés (commençant par .)
chmod 644 rapport.md  # fixer les permissions en octal
chmod u+x script.sh   # ajouter x au propriétaire (notation symbolique)
chmod -R 750 dir/     # récursif (attention : applique x aux fichiers aussi)
chown alice fichier   # changer le propriétaire (souvent besoin de sudo)
chown alice:devs f    # propriétaire ET groupe
umask                 # masque qui retire des droits par défaut à la création
stat fichier          # métadonnées détaillées (inode, droits, horodatages)
```

## 🧭 Exemple guidé — diagnostiquer un « Permission denied »
1. Reproduire précisément : quelle commande, sur quel chemin, en tant que quel
   utilisateur (`whoami`, `id`) ?
2. `ls -l` sur le fichier ET `ls -ld` sur CHAQUE répertoire du chemin (le blocage est
   souvent un `x` manquant sur un dossier parent, pas sur le fichier).
3. Comparer le propriétaire/groupe du fichier avec `id` : suis-je le proprio ? membre
   du groupe ? sinon je tombe dans « others ».
4. Corriger au plus juste : donner le droit minimal nécessaire, ne **jamais** faire
   `chmod 777` (voir Erreurs fréquentes).

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Tu veux que les fichiers d'un projet ne soient lisibles que par toi. Tu lances
   `chmod -R 600 monprojet/`. Que se passe-t-il, et pourquoi ?
2. Un fichier est en `rw-r--r--` et t'appartient. Tu ne peux pourtant pas le lire. Où
   est le problème ?
3. Que signifie exactement `x` sur un **répertoire** ?
4. `chmod 777` est un anti-pattern dangereux qu'il ne faut jamais appliquer : au-delà du
   risque évident d'ouvrir tous les droits à tous, qu'est-ce que ce geste **masque** ?

## ✅ Correction attendue

**La démarche.** Un problème de permission ne se diagnostique jamais sur le fichier
seul : il se diagnostique sur **tout le chemin**, avec `ls -ld` sur chaque répertoire
traversé, et en comparant le propriétaire au résultat de `id`.

**L'erreur probable, et elle rend un dossier entier inaccessible en une commande.** À la
première question, la réponse spontanée est « les fichiers deviennent privés, c'est ce
que je voulais ». Le résultat réel : **plus rien n'est accessible du tout, pas même par
toi.**

La raison tient en une phrase : **`chmod -R` applique les mêmes droits aux fichiers et
aux répertoires, alors que `x` n'y signifie pas la même chose.** Sur un fichier, `x`
veut dire « exécutable comme un programme » — un fichier de données n'en a pas besoin.
Sur un **répertoire**, `x` veut dire « traversable » : sans lui, on ne peut pas entrer
dedans, ni atteindre quoi que ce soit à l'intérieur, **même un fichier dont on est
propriétaire et qu'on a le droit de lire**. En retirant `x` de `monprojet/`, tu as fermé
la porte de la maison ; l'état des serrures intérieures n'a plus aucune importance.

Le piège séduit parce que **le nombre paraît décrire une intention** — « 600, donc
lecture et écriture pour moi seul » — et que cette intention est correcte pour les
fichiers. Rien dans la commande ne signale qu'on vient d'appliquer une règle de fichier
à des répertoires. Elle réussit silencieusement, et l'effet ne se voit qu'au prochain
accès.

La forme correcte distingue les deux, et c'est le geste à retenir :

```bash
find monprojet -type d -exec chmod 700 {} +   # répertoires : traversables
find monprojet -type f -exec chmod 600 {} +   # fichiers    : ni exécutables ni publics
```

`chmod -R u+rwX,go-rwx monprojet/` fait la même chose plus brièvement : le **`X`
majuscule** n'ajoute `x` qu'aux répertoires et aux fichiers qui l'avaient déjà. C'est
précisément ce que le `x` minuscule ne sait pas faire.

**Sur les autres questions.** Un fichier `rw-r--r--` t'appartenant et pourtant illisible
désigne presque toujours **un répertoire parent sans `x`** — le même mécanisme. Les
autres causes possibles sont un point de montage en lecture seule ou une couche de
contrôle d'accès supplémentaire (SELinux, AppArmor), mais le parent vient en premier :
`ls -ld` sur chaque niveau depuis `/`.

Le danger de `chmod 777` — à ne jamais utiliser — est double, et le second est le pire.
D'abord le risque direct : il accorde l'écriture **à tous** les comptes de la machine, y
compris à tout processus compromis, et sur un exécutable ou un script cela signifie que
n'importe qui peut remplacer le code par le sien.

Ensuite, et c'est ce qui en fait un anti-pattern et pas seulement une imprudence : **il
fait disparaître la question au lieu d'y répondre.** La cause réelle — presque toujours
une histoire de propriétaire ou de groupe — reste entière, invisible, et reviendra
ailleurs. On la « corrigera » alors de la même manière, et l'on aura ouvert deux trous au
lieu d'un.

**Alternative défendable.** Plutôt que d'ajuster des droits fichier par fichier, la
solution habituelle en équipe est le **groupe** : on place les utilisateurs concernés
dans un groupe commun, on donne les droits au groupe, et on pose le bit `setgid` sur le
répertoire pour que tout nouveau fichier hérite du groupe. C'est la bonne réponse au besoin
réel — partager entre quelques personnes — là où l'anti-pattern `chmod 777`, dangereux
parce qu'il ouvre tous les droits à tous les comptes de la machine, ne fait que contourner
la question sans jamais y répondre.

**Vérifie seul, sans corrigé** :
1. Crée un dossier, mets-y un fichier lisible, retire `x` du dossier, essaie de lire le
   fichier. Le faire une fois vaut mieux que dix relectures.
2. Sur ton système : `find / -perm -002 -type f 2>/dev/null | head`. Chaque fichier
   listé est modifiable par n'importe qui.
3. Devant ton prochain « permission denied », remonte tout le chemin avec `ls -ld` avant
   de toucher au fichier lui-même.

## ⚠️ Erreurs fréquentes
- **`chmod 777` « pour que ça marche »** (à éviter, danger) : ouvre le fichier à tous
  en écriture — trou de sécurité, et masque le vrai problème (souvent un `x` de dossier).
- Oublier le `x` de traversée sur un répertoire parent.
- `chmod -R` qui rend des fichiers de données exécutables sans raison.
- Confondre « je suis root » et « le fichier m'appartient » : root passe outre, mais
  ce n'est pas une solution de conception.
- Mettre une clé privée en `644` : la plupart des outils SSH la **refuseront**.

## 🔐 Sécurité
Le **moindre privilège** commence ici : un fichier n'obtient que les droits
strictement nécessaires. `600`/`640` pour les secrets et clés, `644` pour du contenu
lisible, `755` pour un exécutable partagé. `setuid`/`sticky bit` existent (ex. `/tmp`
en `1777`) mais relèvent de cas avancés ; ne les posez que si vous savez pourquoi.

## 🏢 Cas métier
Un service refuse de démarrer : « cannot read config ». `ls -l` montre le fichier en
`600` appartenant à `root`, mais le service tourne sous l'utilisateur `app`. La bonne
correction n'est pas `chmod 644` (exposer le secret) mais `chown root:app` +
`chmod 640` : le groupe `app` lit, personne d'autre.

## 🎤 Questions d'entretien
- « Que signifie `755` ? » → `rwxr-xr-x`.
- « Pourquoi un fichier lisible reste inaccessible ? » → un dossier parent n'a pas le
  `x` de traversée.
- « Permissions d'une clé privée SSH ? » → `600` (proprio seul).

## ✍️ Mini-exercice
Sans exécuter : quelle notation octale pour « le proprio lit/écrit, le groupe lit,
personne d'autre » ? → `640`. Et pour un script exécutable par tous mais modifiable
par le seul proprio ? → `755`.

## 🧾 À retenir
- Tout est fichier ; un chemin est une adresse dans l'arbre `/`.
- Le nom pointe vers un inode (métadonnées + données).
- `rwx` pour u/g/o ; sur un dossier, `x` = traverser.
- Octal : r=4, w=2, x=1 ; `600` secrets, `644` lecture, `755` exécutable.
- Corriger au moindre privilège, jamais `777`.

## 📚 Vocabulaire
**inode** · **FHS** · **propriétaire / groupe / autres (u/g/o)** · **rwx** ·
**octal** · **chmod / chown** · **umask** · **traversée (x sur un dossier)** ·
**lien dur / lien symbolique**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je lis une ligne `ls -l` sans hésiter (type, droits, proprio, groupe).
- [ ] Je convertis `rwx` ↔ octal de tête.
- [ ] Je diagnostique un « Permission denied » par le chemin complet.

## 🔗 Liens avec le programme
Jour `/day/72` (terminal et Linux avancés). Exercices associés au Laboratoire
(permissions/octal). Leçons liées : `/doc/lessons/terminal-shell-filesystem`,
`/doc/lessons/linux-processes-signals`. Ces permissions se retrouvent en conteneur
(utilisateur non-root) et en cloud (IAM applique la même idée au niveau des identités).
