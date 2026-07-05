# Correction / Grille — Jour 336 : Revue de la semaine 48

[← Retour au jour 336](../days/day-336.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Projet final : guardrails, tests, observabilité, polish**. DocSense passe en qualité 'production locale' : guardrails testés, suite adverse, observabilité, gestion d'erreurs bout-en-bout, et la dette qui bloque la démo est purgée.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : Jalon démontrable : la suite adverse (15 cas hostiles du mois 9, adaptés) passe ; les erreurs (LLM down, doc corrompu, question vide) donnent des messages utilisateur propres ; les logs permettent de rejouer une session complète ; couverture de tests sur le cœur ≥ raisonnable (les chemins critiques).
- **Test théorique** (réponds de mémoire puis auto-corrige) : Check final sécurité : injection via document piégé testée ? Fuite de secrets auditée ? Données privées dans les logs ? Rate limiting nécessaire ?
- **Mini-projet / livrable** conforme : Le rapport qualité v1.0 : scores d'éval finaux vs baseline (semaine 46), avec les 3 améliorations les plus rentables documentées.
- **Exercice d'architecture** fait sérieusement : Post-mortem d'architecture personnel : les 3 décisions que tu referais différemment sur DocSense, et pourquoi. C'est LA question d'entretien senior — prépare-la avec du vrai vécu.

## 📋 Checklist de validation
- [ ] Suite adverse verte
- [ ] Aucun crash sur les 10 scénarios d'erreur
- [ ] Rapport qualité rédigé
- [ ] Le dashboard raconte l'histoire des progrès

## 🚦 Critères de passage à la semaine suivante
- [ ] Jalon démontré
- [ ] Rapport qualité complet
- [ ] DocSense v1.0 gelée (feature freeze)

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
