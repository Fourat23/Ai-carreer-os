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
**Énoncé** : créer un projet, y écrire un programme, l'exécuter, puis compter ses fichiers — sans jamais toucher la souris.

**Raisonnement, ligne par ligne.** Chaque commande se lit avec la même question : *quel programme, quels arguments, et où suis-je dans l'arbre ?*

1. `mkdir -p projet/src` — sans `-p`, créer `projet/src` échoue si `projet` n'existe pas encore : `mkdir` ne crée qu'un niveau. L'option dit « crée aussi les parents manquants ». Une option n'est jamais décorative, elle change ce que fait le programme.
2. `cd projet` — on **déplace le terminal** dans l'arbre. Rien n'est créé, rien n'est modifié : seule la position change. Tout ce qui suit sera interprété depuis ce point.
3. `echo "..." > src/app.js` — deux choses en une. `echo` ne fait qu'écrire son argument sur sa sortie ; c'est `>` qui détourne cette sortie vers un fichier au lieu de l'écran. Aucun éditeur de texte n'est intervenu. Et `src/app.js` est un chemin **relatif** : il ne veut dire quelque chose que parce qu'on est dans `projet`.
4. `node src/app.js` — `node` est un programme comme les autres, et `src/app.js` un simple argument. Rien de magique : le shell trouve `node` via `PATH`, le lance, lui passe le chemin.
5. `ls src | wc -l` — deux programmes minuscules branchés l'un sur l'autre. `ls` ne sait que lister, `wc` ne sait que compter ; ensemble ils répondent à une question qu'aucun des deux ne savait poser. C'est toute la philosophie Unix en une ligne.

```bash
mkdir -p projet/src            # crée projet/ ET src/ dedans (-p = parents)
cd projet
echo "console.log('ok')" > src/app.js
node src/app.js                # → ok  (chemin RELATIF depuis projet/)
ls src | wc -l                 # → 1   (composer : lister puis compter)
```

**Variante qui déplace le problème** : rejoue exactement la même séquence depuis ton dossier personnel, sans le `cd`. Les lignes 3 et 4 échouent — le chemin relatif `src/app.js` ne désigne plus rien. Corrige-les en chemins absolus. Tu viens de rencontrer, en trente secondes, la cause n°1 des scripts qui marchent sur une machine et pas sur une autre.

## ⚠️ Erreurs fréquentes
- **`rm` est définitif** — pas de corbeille. `rm -r dossier` supprime récursivement : réfléchis, `ls` avant.
- **Espaces dans les noms** : `mon fichier.txt` est vu comme DEUX arguments. Utilise des tirets toute l'année.
- **Confondre `>` et `>>`** : le premier écrase silencieusement.
- **Exécuter un script depuis le mauvais dossier** : les chemins relatifs du script cassent. Réflexe : `pwd`.

## 🔗 Liens avec le programme
Docker (mois 11) : un `Dockerfile` est une suite de commandes shell. La CI : des commandes shell exécutées par un robot. Les secrets de tes apps LLM (mois 8) : des variables d'environnement. Les pipelines d'évaluation RAG (mois 9) : des scripts lancés au terminal. Cette leçon est le sol sur lequel tout le reste est posé.

## Mini-exercice
Sans interface graphique : crée `labo/notes/`, écris 3 lignes dans `labo/notes/idees.txt` (3 commandes `echo >>`), affiche uniquement les lignes contenant un mot donné, compte les lignes du fichier, copie-le en `backup.txt`, supprime l'original. Vérifie chaque étape avec `ls` et `cat`.

## ✅ Correction attendue
**La démarche** : `mkdir -p labo/notes`, trois `echo "..." >> labo/notes/idees.txt`, `grep mot`, `wc -l`, `cp`, `rm`. Chaque geste se relit avec la même question : *quel programme, quels arguments, où suis-je dans l'arbre ?*

**L'erreur probable, et elle est silencieuse.** Presque tout le monde écrit le premier `echo` avec `>` puis les suivants avec `>>`… ou l'inverse, en utilisant `>` trois fois. Dans ce second cas le fichier contient **une seule ligne** : chaque `>` a écrasé le précédent. Aucun message d'erreur, aucun avertissement — la commande a fait exactement ce qu'on lui a demandé. Le `wc -l` renvoie `1` au lieu de `3`, et on cherche le bug dans `wc`.

Le piège séduit parce que `>` et `>>` se ressemblent à l'œil et se prononcent pareil, alors qu'ils font des choses opposées. Retiens la conséquence plutôt que le symbole : **`>` détruit sans prévenir.** C'est la même famille de danger que `rm`, et la raison pour laquelle on regarde avec `cat` avant, pas après.

**Alternative défendable** : une seule commande avec un `printf` multi-lignes, ou un bloc `cat > fichier <<'EOF'`. Moins de répétition, mais moins lisible pour un débutant et plus facile à casser sur les guillemets. Enchaîner trois `>>` est plus verbeux et se déboguer ligne par ligne — pour apprendre, c'est le meilleur choix.

**Vérifie seul, sans corrigé** :
1. `wc -l < labo/notes/idees.txt` renvoie bien `3`, pas `1`.
2. `ls labo/notes` après le `rm` : `backup.txt` est là, `idees.txt` n'y est plus.
3. Refais tout depuis un AUTRE dossier en utilisant des chemins absolus. Si ça marche des deux façons, tu as compris la différence absolu/relatif — c'est la seule preuve qui vaille.
4. Tape `echo $?` juste après une commande qui échoue (`cat fichier-inexistant`) : tu dois voir autre chose que `0`. C'est ce code de sortie que la CI lira plus tard pour décider si ton build passe.

## 🏢 Cas professionnel
Un script de sauvegarde tourne toutes les nuits sur un serveur. Il fait, en substance :

```bash
cd /donnees/production
rm -r ancien/*
```

Pendant six mois, tout va bien. Une nuit, le disque `/donnees` n'est pas monté. Le `cd` échoue — et le shell, par défaut, **continue à la ligne suivante**. Le `rm -r` s'exécute donc depuis le répertoire courant précédent, qui n'est pas celui qu'on croit. Le script a fait exactement ce qui était écrit.

Deux réflexes en découlent, et ils sont universels : on vérifie le code de sortie de chaque étape avant de passer à la suivante (`set -e` en tête de script, ou `cd /x || exit 1`), et on ne fait jamais suivre un `cd` d'un `rm` sans avoir vérifié où l'on se trouve. **Le terminal n'a pas de « êtes-vous sûr ? »** — c'est ce qui le rend automatisable, et c'est ce qui le rend dangereux. Les deux propriétés sont la même.

## 🧪 L'échec silencieux, mesuré

Le cas professionnel ci-dessus repose sur une affirmation : « le `cd` échoue et
le shell continue à la ligne suivante ». On ne va pas la croire sur parole. Le
script `scripts/v70-verifications/shell-erreurs-silencieuses.sh` l'exécute.

**L'affirmation est confirmée, et elle est pire que ce qui était annoncé.**

```
script.sh: line 1: cd: /repertoire-qui-nexiste-pas: No such file or directory
LIGNE SUIVANTE EXECUTEE, repertoire courant = /tmp/.../sim

code de sortie du script entier : 0
```

Le `cd` échoue, affiche un message, et la suite s'exécute depuis l'ancien
répertoire. Mais surtout : **le script entier se termine avec le code 0.** Une
tâche planifiée, une intégration continue, un superviseur — tous concluent au
succès. L'échec n'est visible ni dans le comportement, ni dans le code de
sortie. Seul un humain lisant les journaux pourrait le voir, et personne ne lit
les journaux d'un script qui réussit.

**Les deux protections, mesurées séparément :**

```
aucune       : suite exécutée = OUI | code de sortie = 0
set -e       : suite exécutée = non | code de sortie = 1
cd || exit   : suite exécutée = non | code de sortie = 1
```

Les deux fonctionnent, et les deux corrigent **les deux moitiés** du problème :
elles arrêtent le script *et* rendent un code non nul. C'est ce second point qui
compte le plus, parce que c'est lui qui rend l'échec visible de l'extérieur.

**Mais `set -e` n'est pas un filet universel**, et le croire est plus dangereux
que de ne pas l'utiliser :

```
branche fausse prise
echec attrape par ||
ATTEINT quand meme : set -e ne s applique pas dans une condition
```

`set -e` est **désactivé** à l'intérieur d'une condition, après un `&&` ou un
`||`, et dans un pipeline pour toutes les commandes sauf la dernière. Ce dernier
cas est le plus traître :

```
cat /fichier-inexistant | wc -l    ->  affiche 0, et le script continue
code de sortie du pipeline : 0
avec « set -o pipefail »   : 1
```

`cat` a échoué, `wc` a réussi en comptant zéro ligne, et **le code du pipeline
est celui de la dernière commande**. Le script obtient donc un `0` parfaitement
crédible qui ne veut rien dire. C'est ainsi qu'un traitement produit un fichier
vide sans que rien ne le signale — le même défaut silencieux que celui mesuré
dans `etl-pipelines`, où une interruption laisse **617 lignes sur 1 000** et une
somme de **96 006** au lieu de 149 500.

**Les trois lignes d'en-tête à connaître**, et ce que chacune achète :

```bash
set -e          # s arrêter à la première commande qui échoue
set -u          # échouer si une variable non définie est utilisée
set -o pipefail # le code d un pipeline devient celui de la première commande qui échoue
```

`set -u` mérite une mention à part : sans lui, une variable mal orthographiée
vaut la chaîne vide, et `rm -r "$RÉPETOIRE/"` devient `rm -r /`. La faute de
frappe ne produit aucune erreur ; elle produit une commande différente.

**Ce qu'il faut retenir au-delà du shell.** Ce mécanisme est le même que celui
mesuré ailleurs dans ce programme : un contrôle qui ne peut pas refuser ne
protège de rien. Un `cd` dont on ignore le code de sortie, un test qui vérifie
qu'une fonction « ne plante pas », une porte de couverture qui donne 100 % à une
suite sans assertion — trois formes du même défaut. **La question n'est jamais
« est-ce que ça a marché ? » mais « comment saurais-je que ça n'a pas marché ? »**

## 🔥 Pratique — rendre visibles les échecs qui ne le sont pas

**A. Reproduire l'échec silencieux.** Écris un script de deux lignes : un `cd`
vers un répertoire inexistant, puis une commande qui écrit un fichier. Lance-le
et relève : ce que fait la deuxième ligne, où le fichier atterrit, et le code de
sortie du script entier. Livrable : les trois observations.

**B. Les trois en-têtes, séparément.** Ajoute `set -e`, puis `set -u`, puis
`set -o pipefail`, **une à la fois**, et pour chacune trouve un cas qu'elle
attrape et un cas qu'elle n'attrape pas. Livrable : le tableau à six cases.

**C. Le pipeline menteur.** Construis un pipeline dont la première commande
échoue et la dernière réussit. Relève le code de sortie avec et sans
`pipefail`. Livrable : les deux codes.

**D. La variable mal orthographiée.** Écris un script qui supprime un répertoire
désigné par une variable, fais une faute de frappe dans son nom, et observe la
commande réellement exécutée — **dans un répertoire jetable, avec `echo` devant
le `rm`**. Livrable : la commande obtenue, et ce que `set -u` change.

**E. Ton propre script.** Prends un script shell que tu utilises réellement.
Ajoute les trois en-têtes, relance-le. Livrable : ce qui casse, et ce que chaque
casse révélait.

## ✅ Correction — sur la pratique A → E

**A — les trois observations.** Le fichier atterrit dans le répertoire d'où le
script a été lancé, pas dans celui qu'on croyait. Et le code de sortie est
**0** : c'est le résultat qui compte, parce qu'il rend l'échec invisible pour
tout ce qui appelle le script.

Formulation à retenir : le script n'a pas « planté ». Il a fait **exactement ce
qui était écrit**, et ce qui était écrit ne disait pas de s'arrêter.

**B — le tableau à six cases.** Ce qu'on attend, y compris les angles morts :

| en-tête | attrape | n'attrape pas |
|---|---|---|
| `set -e` | une commande simple qui échoue | un échec dans une condition, après `&&`/`\|\|`, ou en milieu de pipeline |
| `set -u` | une variable jamais définie | une variable définie à la chaîne vide |
| `pipefail` | un échec en milieu de pipeline | tout ce qui n'est pas un pipeline |

Les colonnes de droite sont la partie utile. **Croire que `set -e` protège de
tout est plus dangereux que de ne pas l'utiliser**, parce qu'on cesse alors de
vérifier les codes de sortie à la main là où il ne s'applique pas.

**C — les deux codes.** `0` sans `pipefail`, non nul avec. Le code d'un pipeline
est par défaut celui de la **dernière** commande, et une commande de comptage ou
de filtrage réussit très bien en ne recevant rien.

C'est le mécanisme derrière une catégorie entière d'incidents : un traitement
produit un fichier vide, tout est vert, et le problème se découvre en aval — la
même forme que la mise à jour perdue de `database-transactions-concurrency`
(stock final à 50 au lieu de 20, **les deux connexions ayant cru réussir**).

**D — la variable mal orthographiée.** Sans `set -u`, la variable inconnue vaut
la chaîne vide, et `rm -r "$RÉPERTOIRE/"` devient `rm -r /`. **La faute de frappe
ne produit aucune erreur : elle produit une commande différente.**

Deux précautions que la correction attend que tu aies prises d'emblée : un
répertoire jetable, et un `echo` devant le `rm` pour lire la commande avant de
l'exécuter. Si tu ne les as pas prises, c'est le vrai enseignement de l'exercice.

Et la protection réelle est double : `set -u` pour que l'absence échoue, et des
guillemets autour de la variable pour que la présence d'un espace ne découpe pas
l'argument en deux.

**E — ce qui casse.** Attends-toi à des ruptures, et chacune est une information,
pas une régression. Les plus fréquentes : une variable d'environnement optionnelle
non définie (que `set -u` révèle — il faut alors une valeur par défaut explicite,
pas retirer `set -u`), une commande dont on ignorait qu'elle rend un code non nul
en cas normal (`grep` sans correspondance rend 1), et un pipeline dont la
première commande échouait déjà silencieusement depuis des mois.

La troisième est celle qui justifie tout l'exercice : **le script ne s'est pas
mis à échouer, il a cessé de mentir.**

## 🎤 Questions d'entretien
- « Comment lances-tu ton projet ? » → Une commande, pas une suite de clics. C'est la question la plus banale des entretiens et elle vérifie surtout que tu sais ce que fait la commande.
- « Quelle différence entre un chemin absolu et un chemin relatif ? » → L'absolu part de `/` et vaut partout ; le relatif part du répertoire courant, donc il change de sens selon d'où on l'exécute. C'est la cause n°1 des scripts qui marchent chez soi et pas en CI.
- « À quoi sert le code de sortie ? » → À permettre à un autre programme de décider. `0` signifie succès ; c'est sur cette valeur que la CI arrête ou poursuit un pipeline.
- « Explique `cat log | grep ERROR | wc -l`. » → Trois petits programmes composés : lire, filtrer, compter. C'est la philosophie Unix — un outil fait une chose, on les branche pour obtenir l'outil qui manquait.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je navigue et je manipule des fichiers sans jamais ouvrir un explorateur graphique.
- [ ] Je sais dire, avant d'appuyer sur Entrée, ce que la commande va faire et depuis où.
- [ ] Je distingue `>` et `>>` sans hésiter, et je sais que le premier détruit en silence.
- [ ] J'enchaîne au moins deux commandes avec un pipe pour répondre à une question que je me pose vraiment.

## 📚 Vocabulaire
**shell** (l'interprète) · **terminal** (la fenêtre qui l'héberge) · **répertoire courant** · **chemin absolu/relatif** · **option/flag** · **redirection** · **pipe** · **PATH** · **code de sortie** (0 = succès).

## 🧾 À retenir
Le système de fichiers est un arbre, le shell un interprète : toute commande = un programme + des arguments, exécutés depuis une position dans l'arbre. Les chemins sont absolus (depuis `/`) ou relatifs (depuis ici). Les petits outils se composent avec `|` et `>`. Node exécute du JS hors navigateur, npm orchestre — et tout ce que tu feras en 12 mois (Git, Docker, CI, pipelines IA) est bâti sur ces gestes.
