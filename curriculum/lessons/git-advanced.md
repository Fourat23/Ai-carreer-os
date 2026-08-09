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

## 📖 Explication complète
- **rebase** : rejoue tes commits par-dessus une base à jour (`git rebase main` depuis ta branche). Résultat : un historique linéaire, sans losanges de merge. Les conflits se résolvent commit par commit (et `git rebase --abort` annule tout).
- **rebase interactif** (`rebase -i`) : l'outil de nettoyage AVANT de partager — `squash` (fusionner les « wip », « fix », « fix2 » en un commit cohérent), `reword` (réécrire un message), `drop`, réordonner. Cinq brouillons deviennent deux commits racontables.
- **LA règle de sécurité** : ne JAMAIS rebaser des commits poussés/partagés. Rebase = avant de partager ; merge = après. (Exception encadrée : ta propre branche de PR, avec `push --force-with-lease`.)
- **git bisect** : retrouve LE commit qui a introduit un bug par recherche binaire dans l'historique (ta leçon du jour 16, appliquée à ton propre passé) — magique sur « ça marchait la semaine dernière ».
- **La pull request** : la branche se propose au merge avec une DESCRIPTION (contexte, changements, comment vérifier) ; on discute, on revoit, on merge. Même en solo, rédiger des PRs t'entraîne au standard des équipes — et un reviewer lit d'abord ton HISTORIQUE : commits atomiques, messages clairs, pas de bruit.
- **Boîte à outils du quotidien** : `stash` (mettre de côté pour changer de contexte), `cherry-pick` (rejouer UN commit ailleurs), `reflog` (le filet de sécurité ultime : Git n'oublie presque rien, même « perdu »).

## 🔧 Exemple simple
```bash
git switch feat/recherche
git rebase main            # ma branche repart du main à jour, linéaire
# conflits éventuels : résoudre, git add, git rebase --continue
```

## 🧭 Exemple guidé
**Énoncé** : nettoyer 5 commits brouillons (« wip », « fix typo », …) en 2 commits propres avant la PR.
**Raisonnement** : rebase interactif sur les 5 derniers commits, squash + reword.
**Solution** :
```bash
git rebase -i HEAD~5
# Dans l'éditeur :
pick  a1 Ajoute la recherche par titre
squash b2 wip
squash c3 fix typo
pick  d4 Ajoute les filtres combinables
squash e5 fix
# → 2 commits ; réécrire les messages proprement.
```
**Explication** : `pick` garde, `squash` fusionne dans le commit du dessus ; l'histoire finale raconte DEUX changements cohérents, pas cinq hoquets. **Variante** : provoque un conflit pendant un rebase et résous-le (`--continue`), puis teste `--abort` pour voir le retour arrière propre.

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
Crée 4 commits brouillons sur une branche de test, puis nettoie-les en 2 commits propres par rebase interactif. Vérifie avec `git log --oneline`.

## 🔥 Exercice plus difficile
Introduis un bug dans un commit du milieu d'une série de 8, puis retrouve-le avec `git bisect` (bonne/mauvaise borne, réponds good/bad). Chronomètre : moins de 5 minutes.

## ✅ Correction attendue
La logique : rebase pour nettoyer AVANT de partager, merge après, bisect pour l'archéologie, reflog comme filet. Vérifie : ton historique nettoyé se lit comme un récit ; tu sais expliquer POURQUOI on ne rebase pas du partagé ; ton bisect a trouvé le commit exact.

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
