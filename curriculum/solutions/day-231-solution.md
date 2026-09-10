# Correction / Grille — Jour 231 : Revue de la semaine 33

[← Retour au jour 231](../days/day-231.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **RAG v1 multi-formats, métadonnées, DocQA v0 sur corpus réel**. Ton RAG passe de la démo au réel : PDF/Markdown, métadonnées, interface, robustesse.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min, sur ton DocQA v0 et son corpus réel. (1) Fais-lui échouer dix questions et CLASSE chaque échec par cause : le bon chunk n'a pas été retrouvé, il a été retrouvé mais mal utilisé, ou l'information n'est pas dans le corpus. Les trois causes appellent trois remèdes différents et c'est tout l'intérêt du classement. (2) Ajoute des métadonnées par chunk (source, page, section) et un filtre par document, puis montre une question qui échouait sans le filtre et réussit avec. (3) Calcule le dimensionnement de ton index — nombre de documents × chunks × dimensions × 4 octets — et dis à partir de quelle taille de corpus ton stockage actuel cesse de tenir.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Les trois causes d'échec d'un RAG et le remède propre à chacune ; à quoi servent les métadonnées de chunk, et ce qu'un filtre par document permet qu'un meilleur embedding ne permettra jamais ; les six décisions de conception de ton RAG et, pour chacune, le signe qu'elle est mauvaise ; comment on estime la taille d'un index avant de le construire ; et pourquoi mesurer la qualité d'un RAG en le regardant répondre ne suffit pas.
- **Mini-projet / livrable** conforme : DocQA v0 : ton RAG sur un corpus RÉEL qui t'intéresse (docs techniques d'un outil, notes de cours...) avec 15 questions de test et tes observations d'échecs.
- **Exercice d'architecture** fait sérieusement : ADR n°6 : stockage des vecteurs — JSON en mémoire vs vraie vector DB. Jusqu'à quelle taille de corpus ton approche actuelle tient-elle ? Calcule un ordre de grandeur (n docs × chunks × dimensions × 4 octets) avant de répondre.

## 📋 Checklist de validation
- [ ] Extraction PDF testée sur de vrais PDF moches
- [ ] Chaque chunk garde sa provenance
- [ ] Ré-ingestion sans doublons
- [ ] Journal des échecs de retrieval tenu

## 🚦 Critères de passage à la semaine suivante
- [ ] Multi-format opérationnel
- [ ] DocQA v0 utilisable sur ton corpus
- [ ] Journal d'échecs avec 5+ cas analysés

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
