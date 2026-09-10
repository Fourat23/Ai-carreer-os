# Correction / Grille — Jour 42 : Revue de la semaine 6

[← Retour au jour 42](../days/day-042.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **TypeScript : typage, POO, design patterns ; clean code et debugging**. La semaine où ton JavaScript devient du code qu'un autre peut reprendre : les types attrapent tes bugs avant l'exécution, les patterns nomment ce que tu écrivais déjà sans le savoir, et le debugging cesse d'être une suite d'essais au hasard.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min : reprends une de tes fonctions JS des semaines 3-4 et convertis-la en TypeScript strict — types explicites, une interface, une union discriminée, aucun `any`. Puis introduis délibérément trois bugs (mauvais type, propriété absente, cas non couvert) et vérifie que le compilateur les attrape AVANT l'exécution. Ceux qu'il ne voit pas : écris pourquoi.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Ce qu'un type attrape et ce qu'il n'attrape jamais ; `interface` vs `type` (quand l'un plutôt que l'autre) ; ce qu'une union discriminée rend impossible ; encapsulation : quel bug concret elle empêche ; nomme un design pattern que tu utilisais déjà avant de connaître son nom, et dis ce que le nom t'apporte ; et la question qui compte : quelle est la PREMIÈRE chose à faire devant un bug, avant de toucher au code ?
- **Mini-projet / livrable** conforme : Un module TypeScript propre, typé strictement, réutilisable dans le projet 1 de la semaine prochaine — avec son README de dix lignes, et un journal de debugging : trois bugs rencontrés cette semaine, l'hypothèse posée pour chacun, et comment tu l'as vérifiée.
- **Exercice d'architecture** fait sérieusement : Le typage a un coût : temps d'écriture, verbosité, compilation. Écris dix lignes sur ce que ce coût achète — et nomme un cas où il ne vaut PAS le prix (script jetable, prototype d'une heure). Savoir quand ne pas typer fait partie du métier.

## 📋 Checklist de validation
- [ ] Zéro `any` dans mon code de la semaine
- [ ] Je nomme au moins trois patterns dans du code existant
- [ ] Mes fonctions font une seule chose et se lisent sans commentaire
- [ ] Devant un bug : j'ai formulé une hypothèse AVANT de modifier quoi que ce soit

## 🚦 Critères de passage à la semaine suivante
- [ ] Conversion TS stricte réussie, compilateur satisfait
- [ ] Trois bugs attrapés à la compilation, les autres expliqués
- [ ] Journal de debugging avec hypothèses écrites

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
