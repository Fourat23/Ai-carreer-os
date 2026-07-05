# Correction / Grille — Jour 301 : Revue de la semaine 43

[← Retour au jour 301](../days/day-301.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Sécurité, privacy, observabilité + revue mensuelle 10**. Boucler le mois 'senior-ready' : sécurité applicative (OWASP appliqué à TES apps), privacy des données dans les systèmes IA, observabilité sérieuse. Revue mensuelle 10.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : audit de TES projets — passe l'OWASP top 10 sur LivreAPI/BiblioApp (au moins injection, auth cassée, exposition de données, SSRF côté LLM), corrige 3 vraies failles trouvées, ajoute des logs structurés (JSON) avec correlation id sur DocQA.
- **Test théorique** (réponds de mémoire puis auto-corrige) : OWASP top 3 pour une app LLM (injection prompt, fuite de données via contexte, excès d'autonomie des outils) ; que ne JAMAIS envoyer à une API LLM externe ; logs vs métriques vs traces ; qu'est-ce qu'un correlation id ?
- **Mini-projet / livrable** conforme : Politique de données de DocSense (préparation projet final) : quelles données entrent, où elles transitent, ce qui part vers des APIs externes, rétention, et les 5 règles de sécurité du projet.
- **Exercice d'architecture** fait sérieusement : Threat model léger de DocSense : acteurs, surfaces d'attaque (upload de docs, questions, outils de l'agent), 5 menaces priorisées, contre-mesure par menace. Une page, format tableau.

## 📋 Checklist de validation
- [ ] 3 failles réelles corrigées chez moi
- [ ] Logs structurés avec correlation id
- [ ] Secrets audités sur TOUS mes repos
- [ ] Revue mensuelle 10 faite

## 🚦 Critères de passage à la semaine suivante
- [ ] Audit documenté avec preuves
- [ ] DocQA observable (logs exploitables)
- [ ] Politique de données DocSense écrite
- [ ] Revue mensuelle 10 complétée

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
