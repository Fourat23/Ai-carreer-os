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
**Énoncé** : ajouter la validation d'un formulaire sans jamais rendre `main` instable, même à mi-parcours.

**Raisonnement, décision par décision.**

1. On ne travaille pas sur `main`. Pas par cérémonie : parce que tant que le travail est incomplet, `main` doit rester démontrable — c'est la version qu'on lance pour un recruteur ou qu'on déploie en urgence. `git switch -c feat/validation` coûte quelques millisecondes, puisqu'une branche n'est qu'une étiquette.
2. On code, et **on ne commite pas tout d'un bloc**. `git add -p` présente chaque morceau modifié et demande si on le prend. Deux bénéfices, dont le second est le vrai : on compose un commit cohérent, et surtout on **relit son propre code** avant de le figer. C'est la revue de code la moins chère du métier.
3. Le message se rédige à l'impératif et dit l'intention, pas la manipulation : « Valide les entrées du formulaire de contact », jamais « update form ». Six mois plus tard, c'est cette phrase qu'on lira dans `git log` pour retrouver ce commit.
4. Retour sur `main`, puis `git merge`. `main` reçoit le travail terminé — et seulement terminé.
5. `git branch -d` supprime l'étiquette. Les commits, eux, restent : on jette le marque-page, pas les pages.

```bash
git switch -c feat/validation      # nouvelle branche
# ... modifications ...
git add -p                         # stage bloc par bloc (relecture forcée !)
git commit -m "Valide les entrées du formulaire de contact"
git switch main
git merge feat/validation          # fusion
git branch -d feat/validation      # l'étiquette disparaît, les commits restent
```

**La règle de décision qui reste** : `main` est toujours démontrable ; tout le reste se passe sur une branche dont la suppression ne coûte rien.

**Variante qui déplace le problème** : et si, à mi-chemin, un bug urgent tombait sur `main` ? Tu ne peux pas commiter du travail à moitié fait, et tu ne veux pas le perdre. C'est précisément le trou que `git stash` comble — mettre de côté, corriger, revenir. Chercher cette commande **au moment où le besoin apparaît** est la bonne façon d'apprendre Git ; en mémoriser trente d'avance ne sert à rien.

## ⚠️ Erreurs fréquentes
- **`git add .` systématique** : tu finiras par committer un secret ou un fichier de debug. Stage sélectivement.
- **Messages vides de sens** (« update », « fix ») : interdits à vie. Un message dit *quoi et pourquoi*, à l'impératif.
- **Committer les marqueurs de conflit** : toujours relire ET relancer le programme avant le commit de résolution.
- **Paniquer** : `git status` explique littéralement quoi faire. Lis-le.

## 🔗 Liens avec le programme
La CI (mois 11) se déclenche sur tes push : Git est le bouton de départ de toute automatisation. Les évaluations de DocSense seront versionnées par commit (« ce score correspond à cette version du code »). Et `git bisect` — retrouver le commit fautif par dichotomie — est l'algorithme du jour 16 appliqué à ton propre historique.

## Mini-exercice
Dans un dépôt de test : crée une branche, fais 2 commits, retourne sur `main`, modifie la MÊME ligne qu'un des commits de la branche, commite, merge → résous le conflit proprement. Vérifie avec `git log --oneline --graph` que tu comprends la forme obtenue (le losange).

## ✅ Correction attendue
**La démarche** : `git switch -c`, deux commits, retour sur `main`, un commit qui touche la même ligne, `git merge`. Git s'arrête et te pose une question — il ne s'est rien passé de grave.

Le losange du `--graph` se lit ainsi : les deux branches partent d'un ancêtre commun, chacune avance de son côté, et le commit de fusion a **deux parents**. C'est la seule forme de commit qui en a deux, et c'est ce qui rend l'historique navigable dans les deux sens.

**L'erreur probable, et pourquoi elle est presque inévitable la première fois.** Face aux marqueurs, le réflexe est de supprimer la partie qui n'est pas la sienne, retirer les `<<<<<<<`, `add`, `commit` — et c'est terminé en trente secondes. Deux choses ont mal tourné sans que rien ne proteste. D'abord, le travail de l'autre branche a disparu silencieusement : Git valide n'importe quelle résolution, il ne vérifie que l'absence de marqueurs. Ensuite, personne n'a relancé le programme. **Un fichier sans marqueur n'est pas un fichier qui fonctionne** — c'est très exactement la même illusion que le code qui compile sans marcher.

Le piège séduit parce que la résolution *ressemble* à une opération Git, alors que c'est une décision de code : on choisit ce que le programme doit faire, pas quelle version du texte garder.

**Alternative défendable** : `git rebase` au lieu de `git merge`. Il rejoue tes commits par-dessus `main` et donne un historique linéaire, sans losange — plus facile à lire, mais il RÉÉCRIT les commits, donc jamais sur une branche déjà partagée avec quelqu'un. Le losange est plus fidèle à ce qui s'est passé ; la ligne droite est plus agréable à relire. Les équipes tranchent différemment, et les deux réponses se défendent.

**Vérifie seul, sans corrigé** :
1. Après résolution, `git log --oneline --graph` montre bien un commit de fusion à deux parents.
2. `grep -r '<<<<<<<' .` ne renvoie rien.
3. **Le programme tourne encore** — c'est le seul critère qui compte vraiment.
4. Refais le conflit et tape `git merge --abort` au milieu : tu dois retrouver ton dépôt exactement comme avant. Le faire une fois délibérément est ce qui fait disparaître la peur.

## 🏢 Cas professionnel
Un développeur pousse une clé d'API dans un commit, s'en aperçoit dix minutes plus tard, la supprime et pousse un second commit « remove key ». La clé est toujours là : le premier commit existe encore dans l'historique, et il a été poussé — donc cloné par l'intégration continue, par les collègues, et indexé par les robots qui scrutent GitHub en permanence. La seule réponse correcte n'est pas de nettoyer l'historique, c'est de **révoquer la clé** ; le nettoyage vient après.

C'est la conséquence directe du modèle : *rien n'est jamais perdu*. C'est ce qui rend Git sûr, et c'est ce qui rend le `.gitignore` et le `git add -p` non négociables. La discipline de staging ne sert pas à faire joli — elle est ce qui empêche un secret d'entrer dans un historique dont, par construction, on ne le retire pas.

## 🎤 Questions d'entretien
- « À quoi sert le staging ? » → À composer des commits cohérents : on choisit ce qui entre dans la photo, pour qu'un commit raconte une seule chose et reste annulable isolément.
- « Merge ou rebase ? » → Merge conserve l'histoire réelle et ne réécrit rien ; rebase donne un historique linéaire mais réécrit les commits, donc jamais sur une branche partagée.
- « Tu as poussé un secret. Que fais-tu ? » → Je le révoque d'abord. Réécrire l'historique ensuite, mais un secret poussé doit être considéré comme compromis.
- « Qu'est-ce qu'une branche, techniquement ? » → Un simple pointeur mobile vers un commit. C'est pourquoi en créer une est instantané, et pourquoi supprimer une branche ne supprime aucun commit.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais dessiner les trois zones et dire ce que fait `add` et ce que fait `commit`.
- [ ] J'ai résolu un vrai conflit, relancé le programme après, et utilisé `merge --abort` au moins une fois.
- [ ] Mes messages disent quoi et pourquoi, jamais « fix » ni « update ».
- [ ] Je n'utilise pas `git add .` par défaut, et je sais pourquoi.

## 📚 Vocabulaire
**commit** · **staging** · **branche** · **merge** · **fast-forward** · **conflit** · **remote / origin** · **push / pull / clone** · **.gitignore** · **HEAD** (où tu es).

## 🧾 À retenir
Git enregistre des photos chaînées de ton projet. Trois zones : tes fichiers → la sélection (add) → l'historique (commit). Les branches sont des étiquettes gratuites qui permettent de travailler en parallèle en gardant `main` stable ; les conflits sont des questions légitimes auxquelles on répond en éditant. Un commit = un changement cohérent + un message clair. Commits fréquents, push quotidien : c'est ton filet de sécurité et ta vitrine de rigueur.
