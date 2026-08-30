<!-- keep -->
# Leçon — Git avancé : rebase, historique propre, collaboration

## 🌍 Le problème d'abord
Tu travailles à plusieurs sur un projet. Ton historique Git est un fouillis : « fix », « wip », « oops », des branches mortes, des merges dans tous les sens. Un collègue veut comprendre POURQUOI une ligne a changé : impossible, l'histoire est illisible. Pire, tu as besoin de retrouver le commit qui a introduit un bug parmi 200 — à la main, c'est des heures. `git commit` et `git merge` ne suffisent plus : il te faut MAÎTRISER l'historique, pas seulement l'alimenter. Cette leçon te fait passer de « je sauvegarde » à « je raconte une histoire propre et je navigue dedans » — un signal de professionnalisme que les équipes lisent en une seconde.

## 🎯 Objectif
Passer de « je sais committer » à « je maîtrise l'historique » : rebase (et sa règle de sécurité), nettoyage de branches, bisect, et le workflow de collaboration par pull requests. L'historique propre est un signal de professionnalisme que les équipes lisent immédiatement.

## 🧩 Prérequis
Tu dois maîtriser les fondamentaux de Git — commit, branche, merge, remote, résolution de conflit (`/doc/lessons/git-fundamentals`) — car les opérations avancées (rebase, bisect) les réorganisent. Comprendre qu'un commit est un instantané relié à ses parents aide à visualiser l'historique. Aucun outil graphique n'est supposé : on raisonne en ligne de commande.

## 🧠 Modèle mental
`merge` **fusionne deux histoires** (et garde la trace du croisement) ; `rebase` **réécrit ton histoire** comme si tu avais commencé plus tard (linéaire, propre). Réécrire SON brouillon local : sain. Réécrire une histoire DÉJÀ PARTAGÉE : interdit — tu corromprais celle des autres.

## Explication complète

### Ce qu'un commit est vraiment, et pourquoi ça décide de tout le reste

Un commit n'est pas une modification. C'est une **photo complète** de l'arborescence, plus un
pointeur vers le commit précédent. Git ne stocke pas « j'ai ajouté trois lignes » ; il stocke
l'état entier, et calcule les différences quand tu les demandes.

Cette photo est identifiée par un hachage calculé sur son contenu **et** sur son parent.
Conséquence directe, dont découle tout ce qui suit : **si tu changes le parent d'un commit,
son identifiant change.** Ce n'est plus le même commit — c'en est une copie.

Retiens cette phrase, elle explique à elle seule le rebase, la règle de sécurité, et
pourquoi le `--force` existe.

### Le rebase : rejouer, pas déplacer

Ta branche est partie de `main` il y a trois jours. Depuis, `main` a avancé. Deux façons de
récupérer ce retard.

Le **merge** fabrique un commit supplémentaire dont les deux parents sont ta branche et
`main`. L'histoire garde sa forme réelle : deux lignes qui divergent puis se rejoignent — le
losange qu'on voit dans `git log --graph`.

Le **rebase** fait autre chose : il prend chacun de tes commits, l'un après l'autre, et le
**rejoue** au bout de `main` à jour. Le résultat ressemble à ce qui se serait passé si tu
avais commencé ton travail aujourd'hui. L'historique devient une ligne droite.

Mais chaque commit rejoué a maintenant un nouveau parent. Donc, par la règle du dessus, un
**nouvel identifiant**. Tes commits d'origine existent encore quelque part, plus rien ne
pointe vers eux, et ce que tu appelles « ta branche » est en réalité une suite de copies.

C'est pour cela qu'un conflit de rebase se résout **commit par commit** — Git rejoue le
premier, s'arrête si ça coince, attend un `git rebase --continue`, puis passe au suivant. Un
merge, lui, ne présente qu'un seul conflit global. Les deux ont leur intérêt : le rebase te
fait résoudre plusieurs petits problèmes, le merge un seul gros. Et `git rebase --abort`
remet tout comme avant, à tout instant.

### La règle de sécurité, et sa raison

**Ne rebase jamais des commits que quelqu'un d'autre a déjà récupérés.**

La raison n'est pas une convention d'équipe. Si un collègue a `abc123` dans son dépôt et que
tu le rejoues en `def456`, vous avez deux historiques qui racontent le même travail avec des
identifiants différents. Sa prochaine synchronisation essaiera de **réconcilier** les deux —
et il se retrouvera avec chaque commit en double.

D'où la formule qui tient : **rebase avant de partager, merge après.**

L'exception est encadrée et courante : ta propre branche de pull request, que personne
d'autre ne construit. On la republie alors avec `git push --force-with-lease` — et non
`--force`. La différence compte : `--force-with-lease` refuse d'écraser si quelqu'un a poussé
entre-temps, ce qui est précisément la situation qu'on veut éviter. `--force` écrase sans
poser de question.

### Le rebase interactif : réécrire avant de montrer

Ton travail réel ressemble à ça : `ajoute la recherche`, `wip`, `fix typo`, `ajoute les
filtres`, `fix`. C'est le journal honnête de ta journée, et c'est illisible pour quelqu'un
d'autre.

`git rebase -i HEAD~5` ouvre la liste de ces cinq commits et te laisse décider du sort de
chacun : `pick` le garde, `squash` le fusionne dans celui du dessus, `reword` change son
message, `drop` le supprime, et l'ordre des lignes est l'ordre de rejeu.

L'intention est de séparer deux choses qu'on confond : **comment tu as travaillé** et **ce
que tu as fait**. La première n'intéresse personne ; la seconde est ce qu'on relira dans six
mois. Cinq hoquets deviennent deux changements racontables.

### `git bisect` : la dichotomie appliquée à ton passé

« Ça marchait la semaine dernière » est une information plus précieuse qu'elle n'en a l'air :
elle borne le problème. Si le bug est absent au commit d'il y a sept jours et présent
maintenant, il a été introduit par **un** des commits entre les deux.

`git bisect` fait la recherche binaire pour toi : tu marques un commit `good`, un `bad`, et
il te place au milieu. Tu testes, tu réponds `good` ou `bad`, il recommence sur la moitié
restante. Sur 1 000 commits, dix tests suffisent — c'est log₂(1000) ≈ 10, exactement la
dichotomie de ton cours d'algorithmique, appliquée à ton propre historique.

La condition d'usage : il te faut un **test rapide et fiable** pour répondre `good`/`bad`.
Si ce test est manuel et prend cinq minutes, dix itérations coûtent une heure — encore
largement rentable face à une lecture de diff.

### La pull request, et ce qu'un relecteur regarde en premier

Une pull request propose de fusionner une branche, avec une description : le contexte, ce
qui change, et comment le vérifier. La discussion a lieu avant la fusion, pas après.

Ce qui surprend quand on commence : **un relecteur regarde d'abord l'historique, pas le
diff.** Des commits atomiques avec des messages clairs lui permettent de relire ton travail
étape par étape. Un seul commit de 800 lignes intitulé `update` l'oblige à tout reconstruire
lui-même — et il relira moins bien.

C'est la raison pratique de la section précédente : le rebase interactif n'est pas de la
cosmétique, c'est ce qui rend ton travail relisible.

### Trois outils qu'on utilise tous les jours

**`git stash`** met de côté tes modifications non commitées pour te rendre un répertoire
propre — quand un correctif urgent tombe au milieu de ton travail. `git stash pop` les
remet.

**`git cherry-pick <hash>`** rejoue **un** commit précis sur ta branche courante. Utile pour
récupérer un correctif isolé sans emporter le reste d'une branche.

**`git reflog`** est le filet. Il enregistre tous les déplacements de `HEAD` — y compris ceux
qu'un rebase ou un `reset --hard` a rendus invisibles. Les commits « perdus » y figurent
presque toujours, et `git reset --hard <hash-du-reflog>` les ramène. Git ne jette
véritablement un commit qu'après des semaines, lors d'un nettoyage automatique.

À retenir dans le bon ordre : avant de paniquer, `git reflog`.

## 🔧 Exemple simple
```bash
git switch feat/recherche
git rebase main            # ma branche repart du main à jour, linéaire
# conflits éventuels : résoudre, git add, git rebase --continue
```

## 🧭 Exemple guidé — rendre relisibles cinq commits de travail

**La situation.** Tu as passé la journée sur une branche `feat/recherche`. `git log --oneline`
donne ceci, du plus ancien au plus récent :

```
a1  Ajoute la recherche par titre
b2  wip
c3  fix typo
d4  Ajoute les filtres combinables
e5  fix
```

Tu veux ouvrir une pull request. Personne ne doit avoir à deviner ce que `wip` contenait.

**Ce qui rend le cas non trivial.** Ces cinq commits ne se regroupent pas mécaniquement. `b2`
et `c3` complètent `a1` — ce sont des retouches de la recherche. `e5` complète `d4`. Mais
rien dans les messages ne le dit : c'est **toi** qui le sais, et c'est justement cette
information qu'il s'agit d'inscrire dans l'historique.

**Décision 1 — combien de commits vises-tu, et pourquoi pas un seul ?**

Tout écraser en un commit serait plus simple. Ce serait aussi une perte : un relecteur ne
pourrait plus lire la recherche indépendamment des filtres, et un futur `git bisect` ne
pourrait plus distinguer laquelle des deux fonctionnalités a cassé quelque chose.

La règle qui décide : **un commit = un changement qu'on pourrait annuler seul et qui laisse
le projet cohérent.** Ici, deux — la recherche, puis les filtres.

**Décision 2 — squash ou fixup ?**

`squash` fusionne le commit dans celui du dessus **et** te propose de combiner les deux
messages dans l'éditeur. `fixup` fait la même fusion mais **jette** le message du commit
absorbé.

Pour `b2` (« wip »), le message n'a aucune valeur : `fixup` évite d'avoir à le supprimer à la
main. Pour un commit dont le message dit quelque chose d'utile, `squash` permet de récupérer
la phrase. Ici, les trois absorbés sont du bruit : `fixup` partout.

**Décision 3 — jusqu'où remonter ?**

`HEAD~5` désigne les cinq derniers commits. Attention à la borne : **le commit
`HEAD~5` lui-même n'est pas dans la liste** — il sert de base, et c'est par-dessus lui que
les cinq autres sont rejoués. Se tromper d'un cran est l'erreur la plus fréquente ; le
contrôle est simple, l'éditeur doit afficher exactement cinq lignes.

Et une vérification avant de lancer : `git status` doit être propre. Un rebase avec des
modifications non commitées s'interrompt immédiatement.

```bash
git status                    # propre ? sinon : git stash
git rebase -i HEAD~5
```

Dans l'éditeur — l'ordre est chronologique, du plus ancien au plus récent :

```
pick   a1 Ajoute la recherche par titre
fixup  b2 wip
fixup  c3 fix typo
pick   d4 Ajoute les filtres combinables
fixup  e5 fix
```

**Comment tu sais que ça a marché.** `git log --oneline` doit afficher exactement deux
commits. Puis — et c'est la vérification que presque personne ne fait — `git diff
main..HEAD` doit être **identique** à ce qu'il était avant le rebase. Réécrire l'historique
ne doit rien changer au code final ; si le diff a bougé, tu as perdu du travail dans une
absorption.

**Ce que ça t'a appris.** L'historique est une **narration** que tu écris pour un lecteur,
pas un journal automatique de ta journée. Les outils qui le réécrivent ne sont dangereux que
tant que le travail est partagé — sur ta propre branche non publiée, tu peux le remanier
autant que nécessaire.

**Variante qui déplace le problème.** Refais l'opération, mais cette fois un des commits
absorbés touche **le même fichier, à la même ligne** qu'un commit ultérieur. Le rebase
s'arrête sur un conflit au milieu de la séquence. Tu es alors dans un état particulier :
`git status` te dit « interactive rebase in progress », une partie des commits est rejouée
et le reste attend. Résous le conflit, `git add`, puis `git rebase --continue`. Puis
recommence l'exercice et tape `git rebase --abort` au milieu : tu dois retrouver tes cinq
commits d'origine, intacts. **Faire cet abort une fois volontairement est ce qui fait
disparaître la peur du rebase** — tu sais désormais que la sortie de secours existe et
qu'elle est propre.

## 🤖 Exemple appliqué (IA / data / architecture)
Sur DocSense, chaque score d'évaluation est lié à un commit (leçon LLMOps) : un historique propre rend l'archéologie de qualité possible (« la fidélité a chuté à ce commit précis » + `git bisect` pour le confirmer). Et ton portfolio est jugé sur ses historiques : des commits atomiques racontent ta rigueur mieux qu'un CV.

## ⚠️ Erreurs fréquentes
- Rebaser une branche déjà partagée (réécrire l'histoire des autres).
- `push --force` brutal au lieu de `--force-with-lease` (écrase le travail d'autrui).
- Paniquer après une « perte » : `git reflog` retrouve presque tout.
- PR fleuve de 40 fichiers sans description (irrelisable).

## 🚫 Anti-patterns
- L'historique « wip wip fix wip » poussé tel quel.
- Rebase permanent par dogme là où un merge honnête suffit.

## ✍️ Mini-exercice
Sans relire : tu fais `git reset --hard HEAD~3`. Combien de commits ont été
supprimés ?

## 🔥 Pratique — construire un dépôt jetable et observer

Aucune de ces manipulations ne s'apprend par la lecture. Construis un dépôt
vide, fabrique les situations, et regarde ce qui change vraiment.

**A. Fusion contre rebasage.** Crée une branche de deux commits, avance la
branche principale d'un commit, puis fais deux essais dans deux branches
distinctes : l'un fusionne, l'autre rebase. Compare le nombre de commits, le
nombre de commits de fusion, et **les empreintes** de tes deux commits d'origine.
Livrable : les deux histoires et le sort des empreintes.

**B. Retrouver du travail « perdu ».** Fais un `reset --hard HEAD~2`, puis
retrouve les deux commits sans les avoir notés nulle part. Livrable : les
commandes, et l'explication de pourquoi ils étaient encore là.

**C. La recherche dichotomique.** Fabrique quinze commits en introduisant une
régression au neuvième, puis trouve-la avec `git bisect` en comptant les étapes.
Livrable : le nombre d'étapes, et le nombre attendu par le calcul.

**D. Le cherry-pick, deux fois.** Applique le même commit dans deux situations :
la branche cible est exactement le parent du commit, puis la branche cible a
avancé. Compare les empreintes obtenues. Livrable : les deux résultats et ton
explication de la différence.

**E. Automatiser la dichotomie.** Écris un script qui répond « bon » ou
« mauvais » automatiquement, et lance `git bisect run` avec. Livrable : le
script et la sortie.

## ✅ Correction attendue

> Les valeurs ci-dessous viennent de `scripts/v70-verifications/git-avance.sh`,
> exécuté sur un dépôt jetable construit pour l'occasion.

**A — ce que le rebasage fait réellement.**

```
FUSION   : 5 commits, dont 1 commit de fusion
           « fonctionnalite 1 » garde son empreinte : OUI, il est dans l historique
REBASAGE : 4 commits, dont 0 commit de fusion
           « fonctionnalite 1 » porte desormais une AUTRE empreinte
           l ancienne empreinte existe-t-elle encore comme objet ? OUI
```

Le point que presque tout le monde formule de travers : **le rebasage ne déplace
pas les commits, il en fabrique de nouveaux.** Contenu identique, empreinte
différente, parce qu'une empreinte de commit est le hachage de son arbre, de son
parent et de ses métadonnées — et le parent a changé.

Détail que la mesure révèle et qu'on oublie : l'ancien commit **existe encore**
comme objet dans la base. Il n'est simplement plus atteignable depuis une
branche. C'est ce qui rend la récupération possible (point B) et c'est le même
mécanisme que celui mesuré dans `deployment-secrets` — retirer une référence
n'efface pas l'objet.

Et la règle qui en découle : **on ne rebase pas une branche déjà partagée.** Non
par convention, mais parce que les collègues ont l'ancienne histoire, la tienne
est nouvelle, et les deux ne se rejoignent plus. Chacun devra réconcilier
manuellement.

**B — le filet.**

```
apres « reset --hard HEAD~2 » : les commits sont dans 0 branche
le reflog les connait encore :
  000b5b4 reset: moving to HEAD~2
  549aaca rebase (finish): returning to refs/heads/essai-rebase
apres « reset --hard 549aaca » : HEAD est revenu
```

La réponse à la question du mini-exercice est donc : **zéro**. `reset --hard` ne
supprime aucun commit ; il déplace une **référence**. Les objets restent, et le
reflog enregistre chaque position passée de `HEAD` — pendant 90 jours par défaut
pour les entrées atteignables, 30 pour les autres.

**Presque toutes les « pertes » de travail sous git n'en sont pas.** La
procédure : `git reflog`, repérer l'empreinte d'avant l'erreur, `git reset --hard
<empreinte>`. Les seules vraies pertes concernent ce qui n'a **jamais** été
commité — un `git checkout .` ou un `git stash drop` sur du travail non
enregistré, où il n'y a aucun objet à retrouver. La conséquence pratique : commit
tôt, commit souvent, quitte à nettoyer ensuite par rebasage interactif.

**C — la dichotomie.**

```
16 commits, la regression est introduite au 9e
commit fautif trouve en 4 etapes
```

Le calcul : log₂(15) ≈ 3,9, donc quatre essais. Une recherche linéaire en
demanderait huit en moyenne. **L'écart explose avec la taille** : sur mille
commits, dix essais contre cinq cents.

Ce que la dichotomie exige et qu'on sous-estime : un **critère de décision
binaire et fiable**. « Ça a l'air plus lent » ne suffit pas ; il faut une
commande qui répond oui ou non. Une bonne partie du travail de `bisect` consiste
à écrire ce test d'abord — et il devient souvent le test de non-régression qui
manquait.

**D — le cherry-pick, et un résultat contre-intuitif.**

```
cas A — la branche cible est exactement le parent du commit :
  empreinte sur « correctif » : b65e01f
  empreinte apres cherry-pick : b65e01f      identiques ? OUI

cas B — la branche cible a avance entre-temps :
  empreinte sur « correctif » : b65e01f
  empreinte apres cherry-pick : f6dba36      identiques ? NON
  meme contenu du fichier ? OUI
```

Le cas A surprend et il est parfaitement logique : l'empreinte est le hachage de
l'arbre, du parent et des métadonnées. Ici les trois sont identiques, donc
l'empreinte l'est aussi — **le cherry-pick n'a rien dupliqué du tout**.

Le cas B est la situation réelle. Deux commits distincts portent la même
modification. À la fusion ultérieure de la branche source, git voit deux commits
différents touchant les mêmes lignes, et c'est la source classique des conflits
sur un travail pourtant déjà intégré.

La règle qui en découle : **on ne cherry-pick pas un commit qu'on fusionnera de
toute façon plus tard.** Le cherry-pick est fait pour les cas où la fusion
n'aura jamais lieu — un correctif urgent porté sur une branche de version
maintenue séparément, par exemple.

**E — l'automatisation.** La forme attendue :

```bash
# essai.sh : code de sortie 0 = bon, non nul = mauvais
npm test --silent > /dev/null 2>&1
```

```
git bisect start MAUVAIS BON
git bisect run ./essai.sh
```

Deux pièges que la correction attend que tu connaisses. Le code de sortie **125**
est réservé : il signifie « ce commit n'est pas testable » (il ne compile pas,
par exemple) et fait passer `bisect` au suivant au lieu de le classer. Sans lui,
un commit intermédiaire cassé fausse toute la recherche.

Et le script doit être **hors de l'arborescence testée**, ou au moins ne pas être
lui-même modifié par les allers-retours de `bisect` — sinon il change sous les
pieds de la recherche. C'est le même piège de mesure que celui rencontré dans la
vérification des permissions de `linux-filesystem-permissions`, où le fichier
testé était modifié par le test lui-même.

## 🎤 Questions d'entretien
- « merge vs rebase ? » → Fusionner deux histoires vs réécrire la sienne ; rebase avant de partager, jamais après.
- « Tu as “perdu” des commits, que fais-tu ? » → `git reflog` : Git garde la trace de tout déplacement de HEAD.
- « Comment retrouves-tu le commit qui a cassé la prod ? » → `git bisect` : recherche binaire entre un bon et un mauvais commit.

## 🧾 À retenir
- Rebase = réécrire SON brouillon local ; jamais l'histoire partagée.
- Rebase interactif : des brouillons → un récit ; la PR raconte le pourquoi.
- bisect et reflog : l'archéologie et le filet de sécurité.

## 📚 Vocabulaire
**rebase (interactif)** · **squash / reword** · **force-with-lease** · **pull request / review** · **bisect** · **cherry-pick** · **stash** · **reflog** · **commit atomique**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je nettoie une branche par rebase interactif sans stress.
- [ ] Je sais énoncer et respecter la règle « jamais rebaser du partagé ».
- [ ] J'ai retrouvé un bug par bisect au moins une fois.

## 🔗 Liens avec le programme
Mois 3 (jour ~73), quotidien dès le mois 2, PRs des projets. Leçons liées : `git-fundamentals`, `ci-cd`, `portfolio-github`.
