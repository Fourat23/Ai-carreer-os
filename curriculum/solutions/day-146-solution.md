# Correction — Jour 146 : Projet 4 — README, ADR, démo

[← Retour au jour 146](../days/day-146.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un README décrivant le pipeline. Solution améliorée : un README qui part des 3 questions et prouve les réponses, montre le lancement en une commande et inclut le rapport de qualité ; une ADR figeant un arbitrage réel (SQLite vs Postgres) avec options écartées et conditions de révision ; une démo de 2 min qui prouve la reproductibilité (relance en une commande → dashboard) — le tout pour un lecteur extérieur pressé, validé au regard neuf.

## ⚠️ Erreurs probables et points à vérifier
- README qui commence par la stack au lieu des questions et de la valeur : le lecteur ne sait pas ce que le projet répond.
- Pas de rapport de qualité : l'analyse n'est pas défendable (on ignore ce qui a été fait aux données).
- ADR qui n'expose pas les options écartées et les conditions de révision : elle ne prouve pas l'arbitrage.
- Démo qui montre juste des graphiques sans prouver la reproductibilité (relance en une commande).

## 🔍 Comment vérifier ta solution
- Le README part du problème et des 3 questions, et montre les réponses.
- Le lancement en une commande et le rapport de qualité y figurent.
- L'ADR fige l'arbitrage SQLite vs Postgres (options, décision, révision).
- La démo prouve la reproductibilité (relance en une commande → dashboard).
- Le test du regard neuf est passé : un inconnu comprend en 90 secondes.

## 🎤 À savoir expliquer à l'oral
Structure ta démo data autour des questions : problème → 3 questions → réponses → RELANCE en une commande (la reproductibilité) → rapport de qualité → arbitrage ADR (SQLite vs Postgres). Insiste sur ce qui est propre au data : reproductibilité et traçabilité, pas juste de jolis graphiques. Savoir dire quand Postgres s'imposerait prouve que ton choix SQLite est arbitré, pas par défaut.
