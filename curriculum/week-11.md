# Semaine 11 — Réseau, Linux et Git en profondeur ; lire, documenter et concevoir du code qu'on reprend

> **Mois 3** · Compétences : HTTP / API, Git / Linux, Software engineering

[← Mois 3](month-03.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 71](days/day-071.md)
- [Jour 72](days/day-072.md)
- [Jour 73](days/day-073.md)
- [Jour 74](days/day-074.md)
- [Jour 75](days/day-075.md)
- [Jour 76](days/day-076.md)
- [Jour 77](days/day-077.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** La semaine des fondations qu'on croit facultatives jusqu'au jour où elles manquent : ce qui se passe sous HTTP, un terminal qu'on possède vraiment, un historique git qui raconte, et les trois compétences que personne n'enseigne — lire du code écrit par d'autres, écrire pour être compris, et concevoir une interface qu'on n'aura pas honte de garder.
- **Test pratique :** 75 min : prends une requête vers une API publique et raconte-la de bout en bout, preuves à l'appui — résolution DNS (`dig`), poignée de main TLS (`openssl s_client`), en-têtes échangés, réutilisation de connexion. Puis, en Bash : un script qui sauvegarde un dossier, gère l'absence de la source, écrit un log daté et sort avec le bon code de retour. Termine en nettoyant une branche de travail par un rebase interactif : messages réécrits, commits regroupés, historique lisible.
- **Test théorique :** Ce que DNS résout et ce qu'il ne résout pas ; ce que TLS garantit exactement (et ce qu'il ne garantit pas) ; ce que HTTP/2 change par rapport à HTTP/1.1 ; les permissions Unix rwx sur un fichier ET sur un dossier — ce n'est pas la même chose ; différence entre merge et rebase, et le cas où le rebase est dangereux ; devant un dépôt inconnu de 50 000 lignes, par quoi commences-tu et pourquoi ; enfin, ce qui rend une interface difficile à changer plus tard.
- **Mini-projet :** Lis un projet open source que tu n'as pas écrit — 300 lignes suffisent — et produis une note d'une page : ce que fait le code, comment il est organisé, la décision de conception que tu aurais prise autrement, et pourquoi. C'est l'exercice qui prépare toutes tes futures premières semaines en poste.
- **Critères de passage :**
  - [ ] Trajet réseau raconté avec les preuves de chaque étape
  - [ ] Script Bash robuste avec gestion d'erreur et code de retour
  - [ ] Rebase interactif réussi sans perte
  - [ ] Note de lecture de code écrite et argumentée
- **Exercice d'architecture :** Ton module est utilisé par trois autres. Écris ce qui, dans son interface actuelle, t'empêcherait de le modifier sans casser leurs usages. Puis propose une version qui te laisserait cette liberté — et nomme ce qu'elle coûte en simplicité aujourd'hui.
