# Semaine 30 — Prompt engineering, structured outputs, function calling + revue mensuelle 7

> **Mois 7** · Compétences : LLM

[← Mois 7](month-07.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 204](days/day-204.md)
- [Jour 205](days/day-205.md)
- [Jour 206](days/day-206.md)
- [Jour 207](days/day-207.md)
- [Jour 208](days/day-208.md)
- [Jour 209](days/day-209.md)
- [Jour 210](days/day-210.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Le prompt comme spécification, pas comme incantation : rôle, contraintes, exemples, format de sortie imposé et VALIDÉ par le code. La semaine ferme le mois 7 : revue mensuelle 7 en fin de semaine.
- **Test pratique :** 90 min : construis un extracteur d'informations (texte libre → JSON strict : personnes, dates, montants) — prompt versionné, schéma validé côté code, 10 cas de test dont 3 pièges, taux de réussite mesuré.
- **Test théorique :** Pourquoi 'réponds en JSON' ne suffit pas ; few-shot : quand ça aide vraiment ; pourquoi versionner ses prompts ; que faire quand la sortie ne parse pas (stratégies) ; system vs user prompt ?
- **Mini-projet :** Bibliothèque perso de 5 patterns de prompts testés (extraction, classification, résumé contraint, réécriture, critique) avec leurs cas de test.
- **Critères de passage :**
  - [ ] Extracteur ≥ 8/10 cas réussis
  - [ ] 5 patterns documentés et testés
  - [ ] Auto-éval llm ≥ 3
  - [ ] Revue mensuelle 7 complétée
  - [ ] Note transformer publiée (livrable mois 7)
- **Exercice d'architecture :** Ton extracteur est appelé 10 000 fois/jour. Où mets-tu la validation, le retry, le fallback, le log des échecs ? Dessine le composant 'appel LLM robuste' réutilisable.
