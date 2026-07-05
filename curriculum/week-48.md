# Semaine 48 — Projet final : guardrails, tests, observabilité, polish

> **Mois 12** · Compétences : Sécurité, Software engineering, Évaluation IA

[← Mois 12](month-12.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 330](days/day-330.md)
- [Jour 331](days/day-331.md)
- [Jour 332](days/day-332.md)
- [Jour 333](days/day-333.md)
- [Jour 334](days/day-334.md)
- [Jour 335](days/day-335.md)
- [Jour 336](days/day-336.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** DocSense passe en qualité 'production locale' : guardrails testés, suite adverse, observabilité, gestion d'erreurs bout-en-bout, et la dette qui bloque la démo est purgée.
- **Test pratique :** Jalon démontrable : la suite adverse (15 cas hostiles du mois 9, adaptés) passe ; les erreurs (LLM down, doc corrompu, question vide) donnent des messages utilisateur propres ; les logs permettent de rejouer une session complète ; couverture de tests sur le cœur ≥ raisonnable (les chemins critiques).
- **Test théorique :** Check final sécurité : injection via document piégé testée ? Fuite de secrets auditée ? Données privées dans les logs ? Rate limiting nécessaire ?
- **Mini-projet :** Le rapport qualité v1.0 : scores d'éval finaux vs baseline (semaine 46), avec les 3 améliorations les plus rentables documentées.
- **Critères de passage :**
  - [ ] Jalon démontré
  - [ ] Rapport qualité complet
  - [ ] DocSense v1.0 gelée (feature freeze)
- **Exercice d'architecture :** Post-mortem d'architecture personnel : les 3 décisions que tu referais différemment sur DocSense, et pourquoi. C'est LA question d'entretien senior — prépare-la avec du vrai vécu.
