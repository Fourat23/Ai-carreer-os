# Semaine 31 — Prompt engineering sérieux, structured outputs

> **Mois 8** · Compétences : LLM

[← Mois 8](month-08.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 211](days/day-211.md)
- [Jour 212](days/day-212.md)
- [Jour 213](days/day-213.md)
- [Jour 214](days/day-214.md)
- [Jour 215](days/day-215.md)
- [Jour 216](days/day-216.md)
- [Jour 217](days/day-217.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Le prompt comme spécification, pas comme incantation : rôle, contraintes, exemples, format de sortie imposé et VALIDÉ par le code.
- **Test pratique :** 90 min : construis un extracteur d'informations (texte libre → JSON strict : personnes, dates, montants) — prompt versionné, schéma validé côté code, 10 cas de test dont 3 pièges, taux de réussite mesuré.
- **Test théorique :** Pourquoi 'réponds en JSON' ne suffit pas ; few-shot : quand ça aide vraiment ; pourquoi versionner ses prompts ; que faire quand la sortie ne parse pas (stratégies) ; system vs user prompt ?
- **Mini-projet :** Bibliothèque perso de 5 patterns de prompts testés (extraction, classification, résumé contraint, réécriture, critique) avec leurs cas de test.
- **Critères de passage :**
  - [ ] Extracteur ≥ 8/10 cas réussis
  - [ ] 5 patterns documentés et testés
  - [ ] Auto-éval llm ≥ 3
- **Exercice d'architecture :** Ton extracteur est appelé 10 000 fois/jour. Où mets-tu la validation, le retry, le fallback, le log des échecs ? Dessine le composant 'appel LLM robuste' réutilisable.
