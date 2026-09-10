# Correction / Grille — Jour 77 : Revue de la semaine 11

[← Retour au jour 77](../days/day-077.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Réseau, Linux et Git en profondeur ; lire, documenter et concevoir du code qu'on reprend**. La semaine des fondations qu'on croit facultatives jusqu'au jour où elles manquent : ce qui se passe sous HTTP, un terminal qu'on possède vraiment, un historique git qui raconte, et les trois compétences que personne n'enseigne — lire du code écrit par d'autres, écrire pour être compris, et concevoir une interface qu'on n'aura pas honte de garder.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min : prends une requête vers une API publique et raconte-la de bout en bout, preuves à l'appui — résolution DNS (`dig`), poignée de main TLS (`openssl s_client`), en-têtes échangés, réutilisation de connexion. Puis, en Bash : un script qui sauvegarde un dossier, gère l'absence de la source, écrit un log daté et sort avec le bon code de retour. Termine en nettoyant une branche de travail par un rebase interactif : messages réécrits, commits regroupés, historique lisible.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Ce que DNS résout et ce qu'il ne résout pas ; ce que TLS garantit exactement (et ce qu'il ne garantit pas) ; ce que HTTP/2 change par rapport à HTTP/1.1 ; les permissions Unix rwx sur un fichier ET sur un dossier — ce n'est pas la même chose ; différence entre merge et rebase, et le cas où le rebase est dangereux ; devant un dépôt inconnu de 50 000 lignes, par quoi commences-tu et pourquoi ; enfin, ce qui rend une interface difficile à changer plus tard.
- **Mini-projet / livrable** conforme : Lis un projet open source que tu n'as pas écrit — 300 lignes suffisent — et produis une note d'une page : ce que fait le code, comment il est organisé, la décision de conception que tu aurais prise autrement, et pourquoi. C'est l'exercice qui prépare toutes tes futures premières semaines en poste.
- **Exercice d'architecture** fait sérieusement : Ton module est utilisé par trois autres. Écris ce qui, dans son interface actuelle, t'empêcherait de le modifier sans casser leurs usages. Puis propose une version qui te laisserait cette liberté — et nomme ce qu'elle coûte en simplicité aujourd'hui.

## 📋 Checklist de validation
- [ ] Je navigue et je scripte sans quitter le terminal
- [ ] Mon historique git se lit comme un récit, pas comme un journal de sauvegarde
- [ ] J'ai lu du code que je n'ai pas écrit, en entier, avant de le juger
- [ ] Ma documentation répond d'abord à « pourquoi », pas à « comment »

## 🚦 Critères de passage à la semaine suivante
- [ ] Trajet réseau raconté avec les preuves de chaque étape
- [ ] Script Bash robuste avec gestion d'erreur et code de retour
- [ ] Rebase interactif réussi sans perte
- [ ] Note de lecture de code écrite et argumentée

## ⚠️ Erreurs fréquentes en revue
- Se sur-noter (familiarité ≠ maîtrise) : ne compte que ce que tu produis SEUL et sais EXPLIQUER.
- Bâcler le test théorique en le relisant au lieu de répondre de mémoire (rappel actif).
- Avancer malgré des critères non atteints : mieux vaut consolider 2-3 jours que bâtir sur du sable.
- Oublier de mettre à jour ses scores de compétences dans l'application.

## 🧩 Auto-évaluation finale
- Note honnête de la semaine (0-5) : ____
- Ma plus grande difficulté cette semaine : ____
- Ce que je dois revoir avant d'avancer : ____
- Si des critères ne sont pas atteints : quel plan de rattrapage (daté) ?
