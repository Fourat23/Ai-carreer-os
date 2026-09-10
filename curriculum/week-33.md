# Semaine 33 — RAG v1 multi-formats, métadonnées, DocQA v0 sur corpus réel

> **Mois 8** · Compétences : RAG

[← Mois 8](month-08.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 225](days/day-225.md)
- [Jour 226](days/day-226.md)
- [Jour 227](days/day-227.md)
- [Jour 228](days/day-228.md)
- [Jour 229](days/day-229.md)
- [Jour 230](days/day-230.md)
- [Jour 231](days/day-231.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Ton RAG passe de la démo au réel : PDF/Markdown, métadonnées, interface, robustesse.
- **Test pratique :** 90 min, sur ton DocQA v0 et son corpus réel. (1) Fais-lui échouer dix questions et CLASSE chaque échec par cause : le bon chunk n'a pas été retrouvé, il a été retrouvé mais mal utilisé, ou l'information n'est pas dans le corpus. Les trois causes appellent trois remèdes différents et c'est tout l'intérêt du classement. (2) Ajoute des métadonnées par chunk (source, page, section) et un filtre par document, puis montre une question qui échouait sans le filtre et réussit avec. (3) Calcule le dimensionnement de ton index — nombre de documents × chunks × dimensions × 4 octets — et dis à partir de quelle taille de corpus ton stockage actuel cesse de tenir.
- **Test théorique :** Les trois causes d'échec d'un RAG et le remède propre à chacune ; à quoi servent les métadonnées de chunk, et ce qu'un filtre par document permet qu'un meilleur embedding ne permettra jamais ; les six décisions de conception de ton RAG et, pour chacune, le signe qu'elle est mauvaise ; comment on estime la taille d'un index avant de le construire ; et pourquoi mesurer la qualité d'un RAG en le regardant répondre ne suffit pas.
- **Mini-projet :** DocQA v0 : ton RAG sur un corpus RÉEL qui t'intéresse (docs techniques d'un outil, notes de cours...) avec 15 questions de test et tes observations d'échecs.
- **Critères de passage :**
  - [ ] Multi-format opérationnel
  - [ ] DocQA v0 utilisable sur ton corpus
  - [ ] Journal d'échecs avec 5+ cas analysés
- **Exercice d'architecture :** ADR n°6 : stockage des vecteurs — JSON en mémoire vs vraie vector DB. Jusqu'à quelle taille de corpus ton approche actuelle tient-elle ? Calcule un ordre de grandeur (n docs × chunks × dimensions × 4 octets) avant de répondre.
