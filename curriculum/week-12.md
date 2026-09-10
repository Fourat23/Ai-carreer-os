# Semaine 12 — Architecture 3-tiers, observabilité, cache et trade-offs ; ouverture Python

> **Mois 3** · Compétences : Architecture, Software engineering, Python

[← Mois 3](month-03.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 78](days/day-078.md)
- [Jour 79](days/day-079.md)
- [Jour 80](days/day-080.md)
- [Jour 81](days/day-081.md)
- [Jour 82](days/day-082.md)
- [Jour 83](days/day-083.md)
- [Jour 84](days/day-084.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** La semaine où l'on cesse d'écrire du code qui marche pour écrire du code qu'on peut exploiter : une structure qui tient, des logs qui servent à trois heures du matin, un cache dont on connaît le prix, et l'habitude de nommer un compromis au lieu de le subir. Python entre en scène en fin de semaine, en préparation des mois 4 et 5.
- **Test pratique :** 75 min : restructure ton API citations en trois couches nettes — route, service, accès aux données — sans changer une seule réponse observable de l'extérieur. Ajoute-lui des logs structurés (niveau, horodatage, identifiant de requête traversant les trois couches) et un compteur de latence par route. Puis mets un cache sur la route la plus lue, mesure le gain, et surtout : provoque une donnée périmée et montre-la.
- **Test théorique :** Ce que la séparation en couches te permet de changer sans tout casser ; la différence entre un log, une métrique et une trace, avec un cas où chacun est le bon outil ; pourquoi une moyenne de latence ment et ce qu'un p95 dit de plus ; les deux problèmes difficiles du cache (invalidation et cohérence) illustrés sur TA route ; un anti-pattern que tu as toi-même écrit avant cette semaine ; et ce qu'est une dette technique délibérée, par opposition à une négligence.
- **Mini-projet :** Fiche de trade-offs de ton API : cinq décisions prises depuis le mois 2 (stockage, structure, cache, auth, gestion d'erreurs), et pour chacune ce que tu as gagné, ce que tu as payé, et le signal qui te ferait changer d'avis. Plus un carnet Python de dix cellules : types, listes, dictionnaires, fonctions, lecture d'un fichier — le minimum pour aborder les mois 4-5 sans friction.
- **Critères de passage :**
  - [ ] API restructurée sans régression observable
  - [ ] Logs structurés et latence p95 par route
  - [ ] Effet du cache mesuré ET donnée périmée démontrée
  - [ ] Fiche de trade-offs complète, carnet Python exécuté
- **Exercice d'architecture :** Il est trois heures du matin, ton API répond en 8 secondes, et tu n'as que tes logs. Écris exactement ce que tu regardes, dans quel ordre, et ce que chaque réponse élimine comme hypothèse. Si une étape te manque, tu viens de trouver le log qui manque — ajoute-le.
