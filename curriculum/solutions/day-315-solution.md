# Correction / Grille — Jour 315 : Revue de la semaine 45

[← Retour au jour 315](../days/day-315.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Projet final : ingestion multi-format + RAG core**. Le moteur de DocSense : ingestion robuste (PDF, Markdown, HTML), pipeline RAG avec la meilleure config trouvée au mois 9, architecture hexagonale dès le départ.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : Jalon démontrable : ingérer un corpus technique réel (≥ 30 documents), poser 10 questions, obtenir des réponses citées — avec l'architecture cible (ports/adapters), pas un prototype à refactorer.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Auto-contrôle : chaque choix du pipeline (chunking, embedding, k, hybride) est-il justifié par une MESURE du mois 9 ou par habitude ? Écris la justification de chacun.
- **Mini-projet / livrable** conforme : Les 3 spikes de dérisquage planifiés en semaine 44, exécutés et documentés (résultat, décision).
- **Exercice d'architecture** fait sérieusement : Revue d'architecture hebdo (30 min, rituel jusqu'à la fin) : qu'est-ce qui a dévié de ARCHITECTURE.md cette semaine ? Dérive justifiée (mettre à jour le doc) ou dette (ticket) ? Journal tenu.

## 📋 Checklist de validation
- [ ] Ingestion résiste aux fichiers moches (testée sur 5 PDF réels)
- [ ] Erreurs d'ingestion loggées, pas silencieuses
- [ ] Architecture hexagonale respectée
- [ ] Jalon démo fait devant témoin (ou enregistré)

## 🚦 Critères de passage à la semaine suivante
- [ ] Jalon de la semaine démontré
- [ ] Spikes documentés
- [ ] CI verte, commits quotidiens

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
