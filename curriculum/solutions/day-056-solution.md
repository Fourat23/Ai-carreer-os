# Correction / Grille — Jour 56 : Revue de la semaine 8

[← Retour au jour 56](../days/day-056.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **HTTP et REST, Node puis Express, validation et erreurs ; premiers SELECT + revue mensuelle 2**. Tu passes de consommateur d'API à producteur, et tu ne sautes pas l'étape du dessous : d'abord ce qui circule vraiment sur le fil, ensuite le module http natif, ensuite seulement Express. La semaine ferme le mois 2 : revue mensuelle 2 en fin de semaine.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min, en trois temps. (1) Avec curl uniquement : GET une API publique, POST du JSON, affiche les headers, suis une redirection, explique chaque statut reçu. (2) Un serveur Express : GET /livres, GET /livres/:id, POST /livres avec validation du titre, DELETE /livres/:id — données en mémoire, statuts corrects. (3) Ajoute-lui un middleware d'erreurs centralisé et des 400 détaillées, puis CASSE-le exprès (JSON invalide, id inexistant, champ manquant) et vérifie qu'aucune erreur ne fuit en 500.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Le trajet complet d'une requête (DNS → TCP → requête → réponse) ; huit statuts avec leur cas d'usage (200/201/204/301/400/401/404/500) ; pourquoi GET ne doit pas modifier l'état ; ce qu'est un middleware et dans quel ordre ils s'exécutent ; où mettre la validation et pourquoi jamais dans la route ; erreur opérationnelle vs bug, et pourquoi les deux ne se traitent pas pareil ; et pour le SQL de vendredi : que fait un JOIN, dessine-le.
- **Mini-projet / livrable** conforme : API 'citations' : CRUD complet en mémoire, route GET /citations/aleatoire, middleware de log des requêtes, gestion d'erreurs centralisée et validation manuelle des entrées. C'est le squelette réutilisable qui servira de base au projet 2.
- **Exercice d'architecture** fait sérieusement : Ton API citations est appelée par un front que tu n'écris pas. Liste six choses que ce front a le droit d'attendre de toi (statuts stables, forme d'erreur constante, pagination, CORS, versionnage, contrat documenté) et écris pour chacune ce que tu casserais si tu la changeais sans prévenir.

## 📋 Checklist de validation
- [ ] J'ai utilisé curl AVANT Postman, et je sais lire une réponse brute
- [ ] Le module http natif écrit à la main une fois, avant Express
- [ ] Aucune validation dans le corps d'une route
- [ ] Une entrée invalide ne produit jamais un 500
- [ ] Revue mensuelle 2 faite

## 🚦 Critères de passage à la semaine suivante
- [ ] Les quatre routes répondent avec les bons statuts
- [ ] Middleware d'erreurs démontré sur trois entrées cassées
- [ ] Cinq requêtes SQL de base écrites sans aide
- [ ] Revue mensuelle 2 complétée

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
