# Semaine 6 — TypeScript : typage, POO, design patterns ; clean code et debugging

> **Mois 2** · Compétences : JavaScript / TypeScript, Design patterns, Software engineering

[← Mois 2](month-02.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 36](days/day-036.md)
- [Jour 37](days/day-037.md)
- [Jour 38](days/day-038.md)
- [Jour 39](days/day-039.md)
- [Jour 40](days/day-040.md)
- [Jour 41](days/day-041.md)
- [Jour 42](days/day-042.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** La semaine où ton JavaScript devient du code qu'un autre peut reprendre : les types attrapent tes bugs avant l'exécution, les patterns nomment ce que tu écrivais déjà sans le savoir, et le debugging cesse d'être une suite d'essais au hasard.
- **Test pratique :** 75 min : reprends une de tes fonctions JS des semaines 3-4 et convertis-la en TypeScript strict — types explicites, une interface, une union discriminée, aucun `any`. Puis introduis délibérément trois bugs (mauvais type, propriété absente, cas non couvert) et vérifie que le compilateur les attrape AVANT l'exécution. Ceux qu'il ne voit pas : écris pourquoi.
- **Test théorique :** Ce qu'un type attrape et ce qu'il n'attrape jamais ; `interface` vs `type` (quand l'un plutôt que l'autre) ; ce qu'une union discriminée rend impossible ; encapsulation : quel bug concret elle empêche ; nomme un design pattern que tu utilisais déjà avant de connaître son nom, et dis ce que le nom t'apporte ; et la question qui compte : quelle est la PREMIÈRE chose à faire devant un bug, avant de toucher au code ?
- **Mini-projet :** Un module TypeScript propre, typé strictement, réutilisable dans le projet 1 de la semaine prochaine — avec son README de dix lignes, et un journal de debugging : trois bugs rencontrés cette semaine, l'hypothèse posée pour chacun, et comment tu l'as vérifiée.
- **Critères de passage :**
  - [ ] Conversion TS stricte réussie, compilateur satisfait
  - [ ] Trois bugs attrapés à la compilation, les autres expliqués
  - [ ] Journal de debugging avec hypothèses écrites
- **Exercice d'architecture :** Le typage a un coût : temps d'écriture, verbosité, compilation. Écris dix lignes sur ce que ce coût achète — et nomme un cas où il ne vaut PAS le prix (script jetable, prototype d'une heure). Savoir quand ne pas typer fait partie du métier.
