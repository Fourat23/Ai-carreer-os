# Semaine 43 — Sécurité, privacy, observabilité + revue mensuelle 10

> **Mois 10** · Compétences : Sécurité, Architecture

[← Mois 10](month-10.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 295](days/day-295.md)
- [Jour 296](days/day-296.md)
- [Jour 297](days/day-297.md)
- [Jour 298](days/day-298.md)
- [Jour 299](days/day-299.md)
- [Jour 300](days/day-300.md)
- [Jour 301](days/day-301.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Boucler le mois 'senior-ready' : sécurité applicative (OWASP appliqué à TES apps), privacy des données dans les systèmes IA, observabilité sérieuse. Revue mensuelle 10.
- **Test pratique :** 90 min : audit de TES projets — passe l'OWASP top 10 sur LivreAPI/BiblioApp (au moins injection, auth cassée, exposition de données, SSRF côté LLM), corrige 3 vraies failles trouvées, ajoute des logs structurés (JSON) avec correlation id sur DocQA.
- **Test théorique :** OWASP top 3 pour une app LLM (injection prompt, fuite de données via contexte, excès d'autonomie des outils) ; que ne JAMAIS envoyer à une API LLM externe ; logs vs métriques vs traces ; qu'est-ce qu'un correlation id ?
- **Mini-projet :** Politique de données de DocSense (préparation projet final) : quelles données entrent, où elles transitent, ce qui part vers des APIs externes, rétention, et les 5 règles de sécurité du projet.
- **Critères de passage :**
  - [ ] Audit documenté avec preuves
  - [ ] DocQA observable (logs exploitables)
  - [ ] Politique de données DocSense écrite
  - [ ] Revue mensuelle 10 complétée
- **Exercice d'architecture :** Threat model léger de DocSense : acteurs, surfaces d'attaque (upload de docs, questions, outils de l'agent), 5 menaces priorisées, contre-mesure par menace. Une page, format tableau.
