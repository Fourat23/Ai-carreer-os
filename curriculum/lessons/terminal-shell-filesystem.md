<!-- keep -->
# Leçon — Terminal, shell et système de fichiers

## 🌍 Le problème d'abord
Tu veux dire à l'ordinateur : « lance ce projet », « copie ces fichiers », « montre-moi
les lignes d'erreur ». Avec la souris, tu cliques — c'est lent, ça ne se répète pas tout
seul, et ça n'existe carrément pas sur un serveur distant (une machine sans écran, quelque
part dans un centre de données). Le **terminal** est une fenêtre où tu TAPES des ordres au
lieu de cliquer. Ça paraît austère au début, mais c'est en réalité plus simple : chaque
ordre est un petit programme avec un nom, et tu peux les enchaîner. Cette leçon t'apprend
à te repérer et à agir dans cette fenêtre — le sol sur lequel tout le reste du métier est
posé.

## 🎯 Objectif
Savoir **se repérer** dans le système de fichiers (naviguer, lister, créer), **exécuter**
des commandes (programme + arguments + options), et **composer** de petits outils avec les
redirections et les pipes — sans jamais dépendre d'une interface graphique.

## 🧩 Prérequis
Aucune expérience technique n'est requise : c'est une leçon de tout premier contact avec
l'informatique « sérieuse ». Il faut seulement pouvoir ouvrir une application « Terminal »
sur ta machine (ou l'onglet terminal de ton éditeur) pour taper les exemples. Toutes les
notions (dossier, chemin, commande) sont construites ici, à partir de zéro.

## 🧠 Modèle mental
Deux objets, et tout en découle. **Le système de fichiers est un arbre** : la racine `/`
contient des dossiers, qui contiennent des fichiers et d'autres dossiers ; ton terminal est
toujours POSITIONNÉ quelque part dans cet arbre (le « répertoire courant »). **Le shell est
un interprète** : tu tapes une ligne, il la découpe en programme + arguments + options,
trouve le programme et l'exécute. Une commande « magique » n'est jamais qu'un programme
lancé depuis une position dans l'arbre.

## 💡 Pourquoi c'est important
Tout le métier passe par le terminal : lancer un projet (`npm run dev`), versionner (`git`), construire une image (`docker build`), déployer, interroger un serveur (`curl`), lancer une évaluation RAG (`python eval.py`). Un développeur qui dépend de la souris est lent, non scriptable, et perdu dès qu'il touche un serveur distant (qui n'a PAS d'interface graphique). En entretien, « montre-moi comment tu lances ton projet » a toujours pour réponse une commande.

## Explication complète

### Les deux objets en détail
Deux objets à comprendre, et tout le reste en découle :

1. **Le système de fichiers est un arbre.** La racine est `/`. Chaque dossier contient des fichiers et d'autres dossiers. Ton dossier personnel est `~` (ex. `/home/fourat`). À tout instant, ton terminal est POSITIONNÉ quelque part dans cet arbre : c'est le *répertoire courant* (`pwd` te le dit). Toute la navigation consiste à se déplacer dans l'arbre (`cd`) et à regarder autour de soi (`ls`).

2. **Le shell est un interprète de commandes.** Tu tapes une ligne, il la découpe en *programme* + *arguments* + *options* : dans `ls -la /home`, le programme est `ls`, l'option `-la`, l'argument `/home`. Le shell cherche le programme dans les dossiers listés par la variable `PATH`, l'exécute, affiche sa sortie. C'est tout. Une « commande magique » n'est jamais que : un programme, des arguments.

### Chemins absolus et relatifs
- **Absolu** : part de la racine, valable partout — `/home/fourat/projets/app`.
- **Relatif** : part d'où tu es — `projets/app` (si tu es dans `/home/fourat`), `..` (le parent), `.` (ici).

**Analogie** : l'adresse postale complète (absolue : « 12 rue X, 75001 Paris ») vs l'indication locale (relative : « deuxième porte à gauche »). L'indication locale n'a de sens que si on sait d'où on part — d'où l'importance de `pwd` avant toute commande douteuse.

### Composer les commandes : la grande idée d'Unix
- `>` redirige la sortie vers un fichier (écrase) ; `>>` ajoute à la fin.
- `|` (pipe) branche la sortie d'une commande sur l'entrée de la suivante : `cat log.txt | grep ERROR | wc -l` — lire, filtrer, compter. Trois petits outils composés font un outil sur mesure.

Cette philosophie (petits outils composables) est la même idée que les fonctions pures composées (jour 26) et les pipelines de données (mois 5). Tu la retrouveras toute ta carrière.

### Node.js et npm dans ce tableau
**Node.js** est un programme comme les autres : `node script.js` lit ton fichier et exécute le JavaScript qu'il contient, hors navigateur. **npm** installe des bibliothèques (dans `node_modules/`) et lance des scripts définis dans `package.json`. Quand tu tapes `npm run dev`, npm exécute... une commande shell définie dans le projet. Boucle bouclée : tout est commandes.

## Concepts clés
`pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `cp`, `mv`, `rm` · chemin absolu vs relatif · répertoire courant · `~`, `.`, `..` · options (`-r`, `-la`) · redirections `>` `>>` · pipe `|` · `grep`, `find`, `wc`, `head`, `tail` · variables d'environnement, `PATH` · code de sortie.

## 🧭 Exemple guidé
```bash
mkdir -p projet/src            # crée projet/ ET src/ dedans (-p = parents)
cd projet
echo "console.log('ok')" > src/app.js
node src/app.js                # → ok  (chemin RELATIF depuis projet/)
ls src | wc -l                 # → 1   (composer : lister puis compter)
```
Chaque ligne se lit : *quel programme, quels arguments, où suis-je dans l'arbre ?*

## ⚠️ Erreurs fréquentes
- **`rm` est définitif** — pas de corbeille. `rm -r dossier` supprime récursivement : réfléchis, `ls` avant.
- **Espaces dans les noms** : `mon fichier.txt` est vu comme DEUX arguments. Utilise des tirets toute l'année.
- **Confondre `>` et `>>`** : le premier écrase silencieusement.
- **Exécuter un script depuis le mauvais dossier** : les chemins relatifs du script cassent. Réflexe : `pwd`.

## 🔗 Liens avec le programme
Docker (mois 11) : un `Dockerfile` est une suite de commandes shell. La CI : des commandes shell exécutées par un robot. Les secrets de tes apps LLM (mois 8) : des variables d'environnement. Les pipelines d'évaluation RAG (mois 9) : des scripts lancés au terminal. Cette leçon est le sol sur lequel tout le reste est posé.

## Mini-exercice
Sans interface graphique : crée `labo/notes/`, écris 3 lignes dans `labo/notes/idees.txt` (3 commandes `echo >>`), affiche uniquement les lignes contenant un mot donné, compte les lignes du fichier, copie-le en `backup.txt`, supprime l'original. Vérifie chaque étape avec `ls` et `cat`.

## 📚 Vocabulaire
**shell** (l'interprète) · **terminal** (la fenêtre qui l'héberge) · **répertoire courant** · **chemin absolu/relatif** · **option/flag** · **redirection** · **pipe** · **PATH** · **code de sortie** (0 = succès).

## 🧾 À retenir
Le système de fichiers est un arbre, le shell un interprète : toute commande = un programme + des arguments, exécutés depuis une position dans l'arbre. Les chemins sont absolus (depuis `/`) ou relatifs (depuis ici). Les petits outils se composent avec `|` et `>`. Node exécute du JS hors navigateur, npm orchestre — et tout ce que tu feras en 12 mois (Git, Docker, CI, pipelines IA) est bâti sur ces gestes.
