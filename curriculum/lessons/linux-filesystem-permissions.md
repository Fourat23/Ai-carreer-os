<!-- keep -->
# Leçon — Linux : système de fichiers et permissions

## 🎯 Objectif
Savoir lire et raisonner l'arborescence Linux, comprendre ce qu'est réellement un
fichier (inode), et **maîtriser les permissions** (propriétaire/groupe/autres, `rwx`,
notation octale) au point de diagnostiquer et corriger un « Permission denied » sans
tâtonner.

## 🧩 Prérequis
Savoir ouvrir un terminal et se déplacer (`cd`, `ls`, `pwd`) — voir la leçon
`terminal-shell-filesystem`.

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
4. Corriger au plus juste : donner le droit minimal nécessaire, pas `chmod 777`.

## ⚠️ Erreurs fréquentes
- **`chmod 777` « pour que ça marche »** : ouvre le fichier à tout le monde en
  écriture — trou de sécurité, et masque le vrai problème (souvent un `x` de dossier).
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
