# Correction — Jour 18 : Git branches et merges : travailler comme une équipe (même seul)

[← Retour au jour 18](../days/day-018.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le point conceptuel : un conflit n'implique aucune perte — les DEUX versions sont dans l'historique, le fichier de travail montre juste la question posée. Tu peux toujours annuler une résolution ratée (git merge --abort pendant, git revert après). Une fois ça intégré, la peur disparaît : le pire cas est « je recommence le merge ».

## ✅ Une solution simple
Le déroulé type d'un round de l'usine :
```bash
git switch -c feat/ligne3
# éditer la ligne 3 → "version branche"
git commit -am "Modifie la ligne 3 (version branche)"
git switch main
# éditer la ligne 3 → "version main"
git commit -am "Modifie la ligne 3 (version main)"
git merge feat/ligne3        # CONFLICT!
git status                   # « both modified: conflits.md » — tout est dit
# éditer conflits.md : choisir, retirer les marqueurs
git add conflits.md
git commit                   # message de merge proposé par défaut : OK
git log --oneline --graph    # ancrer la forme du losange
git branch -d feat/ligne3
```

## 🚀 Une solution améliorée
En cas de doute PENDANT un merge : git merge --abort ramène à l'état d'avant, proprement. Connaître la sortie de secours AVANT d'entrer est ce qui permet d'expérimenter sereinement — c'est un principe général (transactions SQL au mois 5, feature flags plus tard).

## ⚠️ Erreurs probables et points à vérifier
- git switch échoue si des modifications non commitées seraient écrasées : c'est une PROTECTION — commite ou stash, ne force pas
- Le scénario 3 : -d refuse de supprimer une branche non mergée, -D force — comprends pourquoi cette double sécurité existe
- commit -am ne stage que les fichiers DÉJÀ suivis : un nouveau fichier exige toujours git add

## 🔍 Comment vérifier ta solution
- git grep "<<<<<<<" ne renvoie rien
- git log --graph : tu peux pointer du doigt chaque FF, chaque losange, et raconter ce qui s'est passé
- Ton annuaire fonctionne toujours (les merges n'ont rien cassé)

## ❓ Réponses du mini-quiz
1. **Qu'est-ce qu'une branche, physiquement ?**
   → Une simple étiquette (référence) qui pointe vers un commit et avance à chaque nouveau commit. Créer une branche ne copie rien.
2. **Fast-forward vs vrai merge ?**
   → FF : main n'a pas bougé, Git avance l'étiquette (historique linéaire). Vrai merge : les deux ont avancé, Git crée un commit de fusion à 2 parents.
3. **Que signifient les marqueurs <<<<<<< ======= >>>>>>> ?**
   → La zone en conflit : entre <<< et === la version de la branche courante (HEAD), entre === et >>> celle de la branche mergée. On édite, on retire les marqueurs, add + commit.
4. **Pourquoi des branches même en solo ?**
   → main reste toujours stable/démontrable ; on peut abandonner une idée sans dégât ; l'historique par fonctionnalité se relit ; et c'est le réflexe attendu en entreprise dès le jour 1.

## 🧩 Questions de réflexion
- À partir de quel moment un conflit devient-il PROBABLE ? (Deux modifications proches dans le temps sur la même zone.) Qu'est-ce que ça implique sur la taille des branches et la fréquence des merges ?
- Ton futur projet 1 : quelles branches prévois-tu ? Écris leur liste dans git-workflow.md.
