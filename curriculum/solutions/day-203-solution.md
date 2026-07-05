# Correction / Grille — Jour 203 : Revue de la semaine 29

[← Retour au jour 203](../days/day-203.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **NLP : tokenisation, embeddings, attention, transformers**. La semaine charnière vers les LLM : comment du texte devient des nombres, et ce que fait VRAIMENT l'attention. Intuition d'abord, code guidé ensuite.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min : tokenise un texte avec un vrai tokenizer (tiktoken ou HF) et analyse les surprises (mots coupés, espaces, accents) ; calcule des similarités cosinus entre embeddings de phrases et vérifie qu'elles matchent ton intuition sur 10 paires.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Pourquoi tokeniser en sous-mots plutôt qu'en mots ; qu'est-ce qu'un embedding (géométriquement) ; que calcule l'attention (requête/clé/valeur, avec une analogie à toi) ; pourquoi le transformer a remplacé les RNN ; que fait la couche finale d'un LLM ?
- **Mini-projet / livrable** conforme : Note illustrée 'Le trajet d'une phrase dans un transformer' : tes propres schémas, de la tokenisation aux logits. Cette note ressert au mois 7 (livrable portfolio).
- **Exercice d'architecture** fait sérieusement : La fenêtre de contexte est limitée (ex: 128k tokens). Quelles conséquences d'architecture pour une app qui doit 'connaître' 10 000 documents ? (C'est la question qui justifie le RAG — réponds AVANT de lire le mois 8.)

## 📋 Checklist de validation
- [ ] J'ai compté des tokens sur mes propres textes
- [ ] Similarité cosinus : calculée à la main une fois
- [ ] Mon analogie de l'attention tient debout
- [ ] Schémas faits MAIN (pas copiés)

## 🚦 Critères de passage à la semaine suivante
- [ ] Quiz tokens/embeddings/attention réussi
- [ ] Note illustrée complète et juste
- [ ] Similarités interprétées correctement

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
