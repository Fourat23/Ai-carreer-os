# Correction / Grille — Jour 84 : Revue de la semaine 12

[← Retour au jour 84](../days/day-084.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Architecture 3-tiers, observabilité, cache et trade-offs ; ouverture Python**. La semaine où l'on cesse d'écrire du code qui marche pour écrire du code qu'on peut exploiter : une structure qui tient, des logs qui servent à trois heures du matin, un cache dont on connaît le prix, et l'habitude de nommer un compromis au lieu de le subir. Python entre en scène en fin de semaine, en préparation des mois 4 et 5.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min : restructure ton API citations en trois couches nettes — route, service, accès aux données — sans changer une seule réponse observable de l'extérieur. Ajoute-lui des logs structurés (niveau, horodatage, identifiant de requête traversant les trois couches) et un compteur de latence par route. Puis mets un cache sur la route la plus lue, mesure le gain, et surtout : provoque une donnée périmée et montre-la.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Ce que la séparation en couches te permet de changer sans tout casser ; la différence entre un log, une métrique et une trace, avec un cas où chacun est le bon outil ; pourquoi une moyenne de latence ment et ce qu'un p95 dit de plus ; les deux problèmes difficiles du cache (invalidation et cohérence) illustrés sur TA route ; un anti-pattern que tu as toi-même écrit avant cette semaine ; et ce qu'est une dette technique délibérée, par opposition à une négligence.
- **Mini-projet / livrable** conforme : Fiche de trade-offs de ton API : cinq décisions prises depuis le mois 2 (stockage, structure, cache, auth, gestion d'erreurs), et pour chacune ce que tu as gagné, ce que tu as payé, et le signal qui te ferait changer d'avis. Plus un carnet Python de dix cellules : types, listes, dictionnaires, fonctions, lecture d'un fichier — le minimum pour aborder les mois 4-5 sans friction.
- **Exercice d'architecture** fait sérieusement : Il est trois heures du matin, ton API répond en 8 secondes, et tu n'as que tes logs. Écris exactement ce que tu regardes, dans quel ordre, et ce que chaque réponse élimine comme hypothèse. Si une étape te manque, tu viens de trouver le log qui manque — ajoute-le.

## 📋 Checklist de validation
- [ ] Aucune requête SQL dans un fichier de routes
- [ ] Mes logs contiennent un identifiant qui relie les trois couches
- [ ] J'ai mesuré avant et après le cache, pas supposé
- [ ] Chacun de mes cinq trade-offs a un signal de remise en cause écrit

## 🚦 Critères de passage à la semaine suivante
- [ ] API restructurée sans régression observable
- [ ] Logs structurés et latence p95 par route
- [ ] Effet du cache mesuré ET donnée périmée démontrée
- [ ] Fiche de trade-offs complète, carnet Python exécuté

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
