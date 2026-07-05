# Correction / Grille — Jour 217 : Revue de la semaine 31

[← Retour au jour 217](../days/day-217.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Prompt engineering sérieux, structured outputs**. Le prompt comme spécification, pas comme incantation : rôle, contraintes, exemples, format de sortie imposé et VALIDÉ par le code.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : construis un extracteur d'informations (texte libre → JSON strict : personnes, dates, montants) — prompt versionné, schéma validé côté code, 10 cas de test dont 3 pièges, taux de réussite mesuré.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Pourquoi 'réponds en JSON' ne suffit pas ; few-shot : quand ça aide vraiment ; pourquoi versionner ses prompts ; que faire quand la sortie ne parse pas (stratégies) ; system vs user prompt ?
- **Mini-projet / livrable** conforme : Bibliothèque perso de 5 patterns de prompts testés (extraction, classification, résumé contraint, réécriture, critique) avec leurs cas de test.
- **Exercice d'architecture** fait sérieusement : Ton extracteur est appelé 10 000 fois/jour. Où mets-tu la validation, le retry, le fallback, le log des échecs ? Dessine le composant 'appel LLM robuste' réutilisable.

## 📋 Checklist de validation
- [ ] Sorties TOUJOURS validées par le code
- [ ] Prompts dans des fichiers versionnés, pas en dur
- [ ] Chaque pattern a ses cas de test
- [ ] Retry avec message d'erreur en cas de parse fail

## 🚦 Critères de passage à la semaine suivante
- [ ] Extracteur ≥ 8/10 cas réussis
- [ ] 5 patterns documentés et testés
- [ ] Auto-éval llm ≥ 3

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
