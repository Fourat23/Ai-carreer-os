# Semaine 29 — NLP : tokenisation, embeddings, attention, transformers

> **Mois 7** · Compétences : Deep learning, LLM

[← Mois 7](month-07.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 197](days/day-197.md)
- [Jour 198](days/day-198.md)
- [Jour 199](days/day-199.md)
- [Jour 200](days/day-200.md)
- [Jour 201](days/day-201.md)
- [Jour 202](days/day-202.md)
- [Jour 203](days/day-203.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** La semaine charnière vers les LLM : comment du texte devient des nombres, et ce que fait VRAIMENT l'attention. Intuition d'abord, code guidé ensuite.
- **Test pratique :** 75 min : tokenise un texte avec un vrai tokenizer (tiktoken ou HF) et analyse les surprises (mots coupés, espaces, accents) ; calcule des similarités cosinus entre embeddings de phrases et vérifie qu'elles matchent ton intuition sur 10 paires.
- **Test théorique :** Pourquoi tokeniser en sous-mots plutôt qu'en mots ; qu'est-ce qu'un embedding (géométriquement) ; que calcule l'attention (requête/clé/valeur, avec une analogie à toi) ; pourquoi le transformer a remplacé les RNN ; que fait la couche finale d'un LLM ?
- **Mini-projet :** Note illustrée 'Le trajet d'une phrase dans un transformer' : tes propres schémas, de la tokenisation aux logits. Cette note ressert au mois 7 (livrable portfolio).
- **Critères de passage :**
  - [ ] Quiz tokens/embeddings/attention réussi
  - [ ] Note illustrée complète et juste
  - [ ] Similarités interprétées correctement
- **Exercice d'architecture :** La fenêtre de contexte est limitée (ex: 128k tokens). Quelles conséquences d'architecture pour une app qui doit 'connaître' 10 000 documents ? (C'est la question qui justifie le RAG — réponds AVANT de lire le mois 8.)
