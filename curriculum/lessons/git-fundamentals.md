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

## 🔥 Exercice plus difficile
Le cas professionnel plus bas affirme qu'un secret poussé ne se retire pas. Ne le crois
pas : **prouve-le, ou réfute-le.**

Dans un dépôt jetable — jamais dans un vrai dépôt — commite un fichier `.env` contenant
une fausse clé reconnaissable, puis trois commits ordinaires par-dessus. Simule ensuite
un partage : `git clone --bare . ../origine` puis `git remote add origin ../origine` et
`git push origin master`. Tu as maintenant la situation réelle — le secret est parti
ailleurs.

Essaie alors de le faire disparaître, dans cet ordre, en **mesurant après chaque étape**
avec `git log -p --all | grep -c 'ta-fausse-cle'` :

1. `git rm .env` puis un commit « remove secret ».
2. `git reflog expire --expire=now --all && git gc --prune=now --aggressive`.
3. Une réécriture d'historique (`git filter-branch --index-filter` ou `git filter-repo`).
4. Après la réécriture : recompte sur la branche courante, **puis** sur `--all`, puis
   liste `git for-each-ref --format='%(refname)'` et regarde ce qui reste.
5. Compte enfin dans `../origine`.

**Livrable** : un tableau à deux colonnes — étape / nombre d'occurrences restantes — et,
en dessous, la réponse écrite à une seule question : *à quel moment le secret
a-t-il cessé d'être un problème ?*

**Critère de réussite** : ton compteur ne tombe pas à zéro partout, et tu sais dire
précisément pourquoi à chaque ligne.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Une branche « n'est qu'une étiquette ». Alors que supprime exactement `git branch -d`,
   et pourquoi l'opération est-elle sans risque ?
2. Tu as résolu un conflit, `grep '<<<<<<<'` ne renvoie rien, le commit est passé. Qu'est-ce
   que cela ne prouve pas ?
3. `git rebase` produit un historique plus lisible que `git merge`. Pourquoi ne l'utilise-t-on
   pourtant jamais sur une branche déjà poussée et partagée ?
4. Dans l'exercice difficile : après une réécriture d'historique réussie, pourquoi le compte
   sur `--all` reste-t-il supérieur au compte sur la branche courante ?

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

### Correction de l'exercice difficile

> Les chiffres ci-dessous viennent de `scripts/v70-verifications/secret-dans-git.sh`,
> exécuté réellement. **Les comptes d'occurrences seront les mêmes chez toi** : ils
> dépendent du mécanisme, pas de ton dépôt. **Les identifiants de commit, non** —
> un identifiant Git est le condensat du contenu *et* de la date, donc il change à
> chaque exécution. Deux lancements du script d'affilée donnent ici `5305b33 → a55da47`
> puis `2e22a12 → 05c0266`. C'est vérifié, pas supposé : si un cours te promet un
> identifiant de commit reproductible, il ne l'a pas exécuté.

Le tableau attendu, étape par étape :

| étape | occurrences restantes | pourquoi |
|---|---|---|
| après `git rm` + commit « remove secret » | **2** | le commit fautif existe toujours ; on a ajouté un commit, on n'en a retiré aucun |
| après `reflog expire` + `gc --prune=now` | **2** | le ramasse-miettes n'efface que les objets **inatteignables** ; celui-ci est référencé par un commit de la branche |
| après réécriture, compté sur la branche | **0** | c'est le chiffre qui donne l'illusion d'avoir réussi |
| après réécriture, compté sur `--all` | **2** | `filter-branch` conserve une sauvegarde sous `refs/original/`, et `refs/remotes/origin/master` pointe encore l'ancien historique |
| après suppression de `refs/original` + `gc` | **2** | il reste `refs/remotes/origin/master` — la copie de ce que le serveur a, pas encore mise à jour |
| dans `../origine` | **2** | le dépôt distant n'a rien reçu de tout cela |

**La démarche à retenir** est le passage de la troisième ligne à la quatrième. Compter sur
la branche courante répond à « mon historique est-il propre ? ». Compter sur `--all` répond
à « le secret est-il encore lisible ? ». Ce sont deux questions différentes, et seule la
seconde est celle qui compte. Le nettoyage qui s'arrête à la première est la panne la plus
fréquente de cet exercice — et elle est silencieuse.

**L'erreur probable, et pourquoi elle est raisonnable.** On croit que `gc --prune=now`
efface. Il n'efface que ce que plus rien n'atteint. Tant qu'un commit atteignable référence
l'objet, le ramasse-miettes le protège — c'est sa fonction, et c'est la même garantie qui
rend Git sûr le reste du temps. Le mécanisme qui te protège de perdre ton travail est
exactement celui qui t'empêche d'effacer ton secret. Ce n'est pas une contradiction : c'est
une seule propriété vue depuis deux situations.

**Le coût de la réécriture, mesuré** : `HEAD` change — `5305b33` devient `a55da47` sur
l'exécution citée plus haut. Tous les identifiants de commit changent, parce qu'un
identifiant Git est le condensat du contenu **et** de l'historique. Conséquence pratique : toute personne ayant cloné doit re-cloner,
et toute branche non fusionnée doit être rebasée. Sur un dépôt d'équipe, cela se planifie ;
cela ne se fait pas un vendredi soir.

**La réponse à la question unique.** Le secret a cessé d'être un problème au moment où il
a été **révoqué**, et à aucun autre. Aucune commande de ce tableau ne répond à la seule
question qui décide : quelqu'un l'a-t-il lu entre-temps ? Git ne le sait pas et ne peut pas
le savoir. C'est pourquoi l'ordre correct est *révoquer d'abord, nettoyer ensuite* — et
pourquoi le nettoyage, seul, n'est pas une réponse à un incident.

**Généralisation.** Le même raisonnement vaut hors de Git : dans un journal applicatif
recopié vers un agrégateur, dans une sauvegarde de base, dans le cache d'un serveur
d'intégration continue. Un secret n'est pas un fichier, c'est une **information diffusée** ;
on la révoque, on ne la reprend pas.

### Correction de la vérification de compréhension

1. `git branch -d` supprime **l'étiquette**, c'est-à-dire un fichier contenant l'identifiant
   d'un commit. Les commits ne bougent pas. L'opération est sans risque tant que ces commits
   restent atteignables autrement — d'où le refus de Git quand la branche n'est pas fusionnée,
   et le `-D` majuscule qui passe outre.
2. Cela prouve seulement que le **texte** est syntaxiquement propre. Cela ne prouve pas que
   la logique des deux branches a été conciliée, ni que le programme fonctionne. C'est le
   point 3 de « vérifie seul » et c'est le seul qui tranche.
3. Parce que `rebase` fabrique de **nouveaux** commits avec de nouveaux identifiants. Les
   collègues ont encore les anciens ; leur `git pull` voit deux historiques divergents pour
   le même travail, et la fusion qui en résulte duplique tous les commits concernés.
4. Parce que la réécriture ne déplace que la référence sur laquelle on l'a appliquée.
   `refs/original/` (la sauvegarde automatique) et `refs/remotes/origin/master` (la copie
   locale de l'état du serveur) pointent toujours l'ancien historique, et suffisent à rendre
   l'objet atteignable. La leçon `deployment-secrets` mesure la même chose sur un secret
   d'application.

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
