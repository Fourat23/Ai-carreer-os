# Semaine 10 — PROJET 2 livré : recherche, tests d'intégration, documentation ; sécurité web et authentification

> **Mois 3** · Compétences : HTTP / API, Sécurité, Software engineering

[← Mois 3](month-03.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 64](days/day-064.md)
- [Jour 65](days/day-065.md)
- [Jour 66](days/day-066.md)
- [Jour 67](days/day-067.md)
- [Jour 68](days/day-068.md)
- [Jour 69](days/day-069.md)
- [Jour 70](days/day-070.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** LivreAPI passe de « ça marche chez moi » à « quelqu'un d'autre peut l'utiliser et lui faire confiance » : recherche et pagination, tests d'intégration qui tournent seuls, documentation lisible — puis la sécurité, qui n'est pas une couche qu'on ajoute à la fin mais des décisions qu'on prend partout.
- **Test pratique :** 90 min : ajoute à LivreAPI recherche, pagination et filtres combinables, couverts par des tests d'intégration qui partent d'une base vide et vérifient les statuts ET le contenu. Puis passe la checklist OWASP sur ton API — injection, exposition de données, contrôle d'accès manquant, secret en dur — et corrige ce que tu trouves. Termine en protégeant deux routes par un token vérifié dans un middleware.
- **Test théorique :** Ce qu'un test d'intégration vérifie qu'un test unitaire ne verra jamais ; pourquoi les tests doivent partir d'un état connu ; trois failles OWASP avec, pour chacune, la ligne de TON code qui la rendait possible ; différence entre authentification et autorisation ; où vit un secret et où il ne doit jamais aller ; pourquoi un token dans l'URL est une mauvaise idée.
- **Mini-projet :** La fiche projet de LivreAPI : README qui permet à un inconnu de la lancer en cinq minutes, une ADR sur le choix du stockage, la documentation des routes, et une démo de deux minutes enregistrée.
- **Critères de passage :**
  - [ ] Recherche, pagination et filtres opérationnels
  - [ ] Tests d'intégration verts et rejouables
  - [ ] Checklist OWASP passée, corrections démontrées
  - [ ] Auth par token fonctionnelle sur deux routes
- **Exercice d'architecture :** Un attaquant a ton token. Écris ce qu'il peut faire, pendant combien de temps, et comment tu t'en apercevrais. Puis liste trois mesures par ordre de rapport efficacité/coût — expiration, révocation, portée restreinte — et dis laquelle tu implémenterais en premier et pourquoi.
