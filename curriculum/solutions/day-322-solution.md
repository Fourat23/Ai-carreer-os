# Correction / Grille — Jour 322 : Revue de la semaine 46

[← Retour au jour 322](../days/day-322.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Projet final : évaluation + dashboard qualité ; Docker**. Ce qui rendra DocSense crédible : le harnais d'évaluation branché dès maintenant (pas à la fin), le dashboard qualité, et la dockerisation.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : Jalon démontrable : golden set de 40+ questions sur le corpus DocSense, éval automatisée (retrieval + fidélité) qui tourne en une commande, dashboard qui affiche les scores par version, app dockerisée (compose up = tout tourne).
- **Test théorique** (réponds de mémoire puis auto-corrige) : Pourquoi évaluer DÈS maintenant et pas à la fin ; qu'affiche un bon dashboard qualité (tendance > valeur absolue) ; image vs conteneur vs volume ; que met-on dans un .dockerignore et pourquoi ?
- **Mini-projet / livrable** conforme : Baseline chiffrée officielle de DocSense v0 : le tableau de scores qui servira de référence à toutes les améliorations.
- **Exercice d'architecture** fait sérieusement : Revue d'architecture hebdo + : où le harnais d'éval s'insère-t-il dans l'architecture (port ? service ? script ?) sans polluer le cœur ? Justifie ton choix.

## 📋 Checklist de validation
- [ ] Éval en une commande
- [ ] Scores versionnés (historique conservé)
- [ ] docker compose up fonctionne sur machine propre
- [ ] Secrets via env, jamais dans l'image

## 🚦 Critères de passage à la semaine suivante
- [ ] Jalon démontré
- [ ] Baseline enregistrée
- [ ] Dockerfile compris ligne par ligne (pas copié)

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
