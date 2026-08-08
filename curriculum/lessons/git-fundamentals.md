<!-- keep -->
# Leçon — Git : les fondamentaux

## 🌍 Le problème d'abord
Tu travailles sur un projet, tu modifies un fichier… et tu casses quelque chose qui
marchait hier. Sans filet, tu es coincé : impossible de revenir en arrière proprement, et
si tu travailles à plusieurs, chacun écrase le travail de l'autre. La solution que TOUTE
l'industrie utilise s'appelle **Git** : un outil qui prend une « photo » de ton projet à
chaque étape, garde tout l'historique, et te laisse revenir à n'importe quelle photo,
comparer, ou travailler en parallèle sans conflit destructeur. Cette leçon t'apprend à
utiliser ce filet de sécurité — et, au passage, à construire un historique qui parle de ta
rigueur à un recruteur.

## 🎯 Objectif
Comprendre le modèle de Git (photos chaînées, trois zones), savoir **enregistrer** un
changement cohérent (add → commit), **travailler en parallèle** avec des branches,
**résoudre un conflit** sans peur, et **synchroniser** avec un dépôt distant (push/pull).

## 🧩 Prérequis
Tu dois savoir ouvrir un terminal et exécuter des commandes de base (programme +
arguments), idéalement via `/doc/lessons/terminal-shell-filesystem`, car Git s'utilise
essentiellement en ligne de commande. Aucune notion de gestion de versions n'est supposée :
commit, branche et conflit sont introduits ici, à partir de zéro.

## 🧠 Modèle mental
Un **commit** est une photo complète de ton projet à un instant (contenu + message +
auteur + lien vers la photo précédente) ; l'historique est une chaîne de ces photos, et
rien n'est jamais perdu. Entre tes fichiers et l'historique, une zone intermédiaire (le
*staging*) te laisse choisir CE QUI entre dans chaque photo, pour que chaque commit raconte
UNE chose cohérente. Une **branche** n'est qu'une étiquette mobile pointant sur un commit :
créer une ligne de travail parallèle est donc gratuit et sans risque.

## 💡 Pourquoi c'est important
Git est l'outil de collaboration et de sécurité n°1 du métier : il enregistre l'histoire du code, permet de travailler en parallèle sans se marcher dessus, et d'annuler n'importe quelle erreur. Aucune équipe ne travaille sans. Pour toi, dès aujourd'hui : ton historique Git EST ton portfolio vivant (un recruteur lit tes commits comme un journal de rigueur), et le commit quotidien est ton filet de sécurité absolu.

## Explication complète

### Les photos chaînées en détail
Un **commit** est une photo complète de ton projet à un instant : contenu + message + auteur + lien vers la photo précédente. L'historique est une chaîne de photos. Rien n'est jamais perdu : revenir en arrière, comparer deux photos, retrouver quand un bug est né (`git bisect` fait une recherche binaire dans l'historique !) — tout est possible parce que tout est conservé.

### Les trois zones (LE schéma à savoir dessiner)
```
Working directory  --git add-->  Staging area  --git commit-->  Historique
(tes fichiers)                   (la sélection)                 (les photos)
```
Pourquoi une zone intermédiaire (staging) ? Pour composer des commits COHÉRENTS. Tu as modifié 3 fichiers pour 2 raisons différentes ? `git add` sélectif → deux commits séparés, chacun racontant UNE chose. Un commit = un changement cohérent : c'est la règle qui rend l'historique lisible et les retours en arrière chirurgicaux.

### Les branches : des étiquettes, pas des copies
Une **branche** n'est qu'une étiquette mobile qui pointe sur un commit — la créer est instantané et gratuit. Le workflow standard (même en solo) : `main` reste toujours stable et démontrable ; chaque fonctionnalité se développe sur sa branche (`feat/recherche`), puis se fusionne (`merge`). Une idée ratée ? On supprime la branche, `main` n'a rien vu.

### Les conflits : une question, pas une catastrophe
Un **conflit** survient quand deux branches ont modifié LES MÊMES lignes : Git ne peut pas décider seul, alors il te pose la question en marquant le fichier (`<<<<<<<`, `=======`, `>>>>>>>`). Résoudre = éditer, choisir (ou fusionner les idées), retirer les marqueurs, `add` + `commit`. Aucune donnée n'est en danger : les deux versions sont dans l'historique, et `git merge --abort` annule tout. La peur des conflits disparaît en en résolvant dix.

### Local vs distant
Git est LOCAL (tout fonctionne sans réseau). GitHub héberge une copie distante : `git push` envoie tes commits, `git pull` récupère. Sans push, ton travail n'existe que sur ta machine — d'où le rituel : commit souvent, push chaque jour.

## Concepts clés
commit · staging · working directory · `.gitignore` (dépendances, secrets, fichiers générés) · branche · merge (fast-forward vs commit de fusion) · conflit · remote / push / pull · message de commit à l'impératif.

## 🧭 Exemple guidé
```bash
git switch -c feat/validation      # nouvelle branche
# ... modifications ...
git add -p                         # stage bloc par bloc (relecture forcée !)
git commit -m "Valide les entrées du formulaire de contact"
git switch main
git merge feat/validation          # fusion
git branch -d feat/validation      # l'étiquette disparaît, les commits restent
```
`git add -p` est le meilleur professeur de staging : il te montre chaque bloc modifié et te force à relire ton propre code avant de le committer.

## ⚠️ Erreurs fréquentes
- **`git add .` systématique** : tu finiras par committer un secret ou un fichier de debug. Stage sélectivement.
- **Messages vides de sens** (« update », « fix ») : interdits à vie. Un message dit *quoi et pourquoi*, à l'impératif.
- **Committer les marqueurs de conflit** : toujours relire ET relancer le programme avant le commit de résolution.
- **Paniquer** : `git status` explique littéralement quoi faire. Lis-le.

## 🔗 Liens avec le programme
La CI (mois 11) se déclenche sur tes push : Git est le bouton de départ de toute automatisation. Les évaluations de DocSense seront versionnées par commit (« ce score correspond à cette version du code »). Et `git bisect` — retrouver le commit fautif par dichotomie — est l'algorithme du jour 16 appliqué à ton propre historique.

## Mini-exercice
Dans un dépôt de test : crée une branche, fais 2 commits, retourne sur `main`, modifie la MÊME ligne qu'un des commits de la branche, commite, merge → résous le conflit proprement. Vérifie avec `git log --oneline --graph` que tu comprends la forme obtenue (le losange).

## 📚 Vocabulaire
**commit** · **staging** · **branche** · **merge** · **fast-forward** · **conflit** · **remote / origin** · **push / pull / clone** · **.gitignore** · **HEAD** (où tu es).

## 🧾 À retenir
Git enregistre des photos chaînées de ton projet. Trois zones : tes fichiers → la sélection (add) → l'historique (commit). Les branches sont des étiquettes gratuites qui permettent de travailler en parallèle en gardant `main` stable ; les conflits sont des questions légitimes auxquelles on répond en éditant. Un commit = un changement cohérent + un message clair. Commits fréquents, push quotidien : c'est ton filet de sécurité et ta vitrine de rigueur.
