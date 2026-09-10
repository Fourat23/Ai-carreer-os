# Correction / Grille — Jour 70 : Revue de la semaine 10

[← Retour au jour 70](../days/day-070.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **PROJET 2 livré : recherche, tests d'intégration, documentation ; sécurité web et authentification**. LivreAPI passe de « ça marche chez moi » à « quelqu'un d'autre peut l'utiliser et lui faire confiance » : recherche et pagination, tests d'intégration qui tournent seuls, documentation lisible — puis la sécurité, qui n'est pas une couche qu'on ajoute à la fin mais des décisions qu'on prend partout.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : ajoute à LivreAPI recherche, pagination et filtres combinables, couverts par des tests d'intégration qui partent d'une base vide et vérifient les statuts ET le contenu. Puis passe la checklist OWASP sur ton API — injection, exposition de données, contrôle d'accès manquant, secret en dur — et corrige ce que tu trouves. Termine en protégeant deux routes par un token vérifié dans un middleware.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Ce qu'un test d'intégration vérifie qu'un test unitaire ne verra jamais ; pourquoi les tests doivent partir d'un état connu ; trois failles OWASP avec, pour chacune, la ligne de TON code qui la rendait possible ; différence entre authentification et autorisation ; où vit un secret et où il ne doit jamais aller ; pourquoi un token dans l'URL est une mauvaise idée.
- **Mini-projet / livrable** conforme : La fiche projet de LivreAPI : README qui permet à un inconnu de la lancer en cinq minutes, une ADR sur le choix du stockage, la documentation des routes, et une démo de deux minutes enregistrée.
- **Exercice d'architecture** fait sérieusement : Un attaquant a ton token. Écris ce qu'il peut faire, pendant combien de temps, et comment tu t'en apercevrais. Puis liste trois mesures par ordre de rapport efficacité/coût — expiration, révocation, portée restreinte — et dis laquelle tu implémenterais en premier et pourquoi.

## 📋 Checklist de validation
- [ ] Mes tests tournent sur une base vide, dans n'importe quel ordre
- [ ] Aucun secret dans le dépôt — vérifié dans l'historique git, pas seulement dans les fichiers actuels
- [ ] Chaque route protégée a été testée SANS token
- [ ] Un inconnu a lancé mon API en suivant seulement le README

## 🚦 Critères de passage à la semaine suivante
- [ ] Recherche, pagination et filtres opérationnels
- [ ] Tests d'intégration verts et rejouables
- [ ] Checklist OWASP passée, corrections démontrées
- [ ] Auth par token fonctionnelle sur deux routes

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
