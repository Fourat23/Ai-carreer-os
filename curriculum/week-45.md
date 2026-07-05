# Semaine 45 — Projet final : ingestion multi-format + RAG core

> **Mois 11** · Compétences : RAG, Software engineering

[← Mois 11](month-11.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 309](days/day-309.md)
- [Jour 310](days/day-310.md)
- [Jour 311](days/day-311.md)
- [Jour 312](days/day-312.md)
- [Jour 313](days/day-313.md)
- [Jour 314](days/day-314.md)
- [Jour 315](days/day-315.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Le moteur de DocSense : ingestion robuste (PDF, Markdown, HTML), pipeline RAG avec la meilleure config trouvée au mois 9, architecture hexagonale dès le départ.
- **Test pratique :** Jalon démontrable : ingérer un corpus technique réel (≥ 30 documents), poser 10 questions, obtenir des réponses citées — avec l'architecture cible (ports/adapters), pas un prototype à refactorer.
- **Test théorique :** Auto-contrôle : chaque choix du pipeline (chunking, embedding, k, hybride) est-il justifié par une MESURE du mois 9 ou par habitude ? Écris la justification de chacun.
- **Mini-projet :** Les 3 spikes de dérisquage planifiés en semaine 44, exécutés et documentés (résultat, décision).
- **Critères de passage :**
  - [ ] Jalon de la semaine démontré
  - [ ] Spikes documentés
  - [ ] CI verte, commits quotidiens
- **Exercice d'architecture :** Revue d'architecture hebdo (30 min, rituel jusqu'à la fin) : qu'est-ce qui a dévié de ARCHITECTURE.md cette semaine ? Dérive justifiée (mettre à jour le doc) ou dette (ticket) ? Journal tenu.
