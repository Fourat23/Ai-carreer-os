# Semaine 8 — HTTP et REST, Node puis Express, validation et erreurs ; premiers SELECT + revue mensuelle 2

> **Mois 2** · Compétences : HTTP / API, Software engineering, SQL / Data

[← Mois 2](month-02.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 50](days/day-050.md)
- [Jour 51](days/day-051.md)
- [Jour 52](days/day-052.md)
- [Jour 53](days/day-053.md)
- [Jour 54](days/day-054.md)
- [Jour 55](days/day-055.md)
- [Jour 56](days/day-056.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Tu passes de consommateur d'API à producteur, et tu ne sautes pas l'étape du dessous : d'abord ce qui circule vraiment sur le fil, ensuite le module http natif, ensuite seulement Express. La semaine ferme le mois 2 : revue mensuelle 2 en fin de semaine.
- **Test pratique :** 90 min, en trois temps. (1) Avec curl uniquement : GET une API publique, POST du JSON, affiche les headers, suis une redirection, explique chaque statut reçu. (2) Un serveur Express : GET /livres, GET /livres/:id, POST /livres avec validation du titre, DELETE /livres/:id — données en mémoire, statuts corrects. (3) Ajoute-lui un middleware d'erreurs centralisé et des 400 détaillées, puis CASSE-le exprès (JSON invalide, id inexistant, champ manquant) et vérifie qu'aucune erreur ne fuit en 500.
- **Test théorique :** Le trajet complet d'une requête (DNS → TCP → requête → réponse) ; huit statuts avec leur cas d'usage (200/201/204/301/400/401/404/500) ; pourquoi GET ne doit pas modifier l'état ; ce qu'est un middleware et dans quel ordre ils s'exécutent ; où mettre la validation et pourquoi jamais dans la route ; erreur opérationnelle vs bug, et pourquoi les deux ne se traitent pas pareil ; et pour le SQL de vendredi : que fait un JOIN, dessine-le.
- **Mini-projet :** API 'citations' : CRUD complet en mémoire, route GET /citations/aleatoire, middleware de log des requêtes, gestion d'erreurs centralisée et validation manuelle des entrées. C'est le squelette réutilisable qui servira de base au projet 2.
- **Critères de passage :**
  - [ ] Les quatre routes répondent avec les bons statuts
  - [ ] Middleware d'erreurs démontré sur trois entrées cassées
  - [ ] Cinq requêtes SQL de base écrites sans aide
  - [ ] Revue mensuelle 2 complétée
- **Exercice d'architecture :** Ton API citations est appelée par un front que tu n'écris pas. Liste six choses que ce front a le droit d'attendre de toi (statuts stables, forme d'erreur constante, pagination, CORS, versionnage, contrat documenté) et écris pour chacune ce que tu casserais si tu la changeais sans prévenir.
