# Correction — Jour 3 : Git : sauvegarder et raconter l'histoire de ton code

[← Retour au jour 3](../days/day-003.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Tout l'exercice tourne autour d'un principe : un commit = un changement cohérent. L'étape 3 est le cœur : deux raisons de changer → deux commits. Si tu as fait `git add .` puis un seul commit, refais-la (git reset HEAD~1 déferait le dernier commit en gardant les fichiers — mais tu peux aussi simplement continuer proprement).

## ✅ Une solution simple
```bash
git init
printf "node_modules/\n*.log\n" > .gitignore
git add . && git commit -m "Initialise ia-lab avec les scripts des jours 1-2"
# ... modifications ...
git add scripts/salut.js
git commit -m "Documente salut.js avec un commentaire d'en-tête"
git add notes/jour-03.md
git commit -m "Ajoute les notes du jour 3 sur Git"
echo "test" > debug.log && git status   # ignoré
git restore scripts/salut.js            # après l'avoir cassé
git log --oneline
```

## 🚀 Une solution améliorée
Prends l'habitude de `git add -p` (patch) : Git te montre chaque bloc modifié et te demande de le stager ou non. C'est le meilleur outil d'apprentissage du staging, et les pros l'utilisent pour relire leur propre code avant chaque commit.

## ⚠️ Erreurs probables et points à vérifier
- Si debug.log apparaît quand même dans status : le .gitignore a une faute de frappe, ou le fichier était déjà suivi (git rm --cached debug.log)
- git restore ne peut PAS restaurer ce qui n'a jamais été commité — d'où l'importance de committer souvent
- --amend réécrit l'histoire : sûr en local, dangereux après un push (réponse du bonus)

## 🔍 Comment vérifier ta solution
- git log --oneline montre ≥ 4 messages clairs et distincts
- git status : "nothing to commit, working tree clean"
- Le schéma des 3 zones est refait de MÉMOIRE dans jour-03.md

## ❓ Réponses du mini-quiz
1. **Cite les 3 zones de Git et la commande qui fait passer de l'une à l'autre.**
   → Working directory → (git add) → staging → (git commit) → historique.
2. **Pourquoi ne JAMAIS committer node_modules ?**
   → Des milliers de fichiers regénérables par `npm install` : lourd, inutile, source de conflits. package.json suffit à les réinstaller.
3. **Que montre `git diff` sans argument ?**
   → Les modifications du working directory PAS ENCORE stagées (pour le staging : git diff --staged).
4. **Qu'est-ce qu'un bon message de commit ?**
   → Une ligne impérative qui dit quoi/pourquoi : 'Ajoute la gestion du cas sans argument', pas 'update'.

## 🧩 Questions de réflexion
- Pourquoi des commits fréquents et petits battent-ils un gros commit du soir ? (pense : retour arrière, relecture, message précis)
- Git te servira pour tes 7 projets portfolio : quel historique un recruteur préfère-t-il voir ?
