# Semaine 28 — NLP : tokenisation, embeddings, attention, transformers

> **Mois 7** · Compétences : Deep learning, LLM

[← Mois 7](month-07.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 190](days/day-190.md)
- [Jour 191](days/day-191.md)
- [Jour 192](days/day-192.md)
- [Jour 193](days/day-193.md)
- [Jour 194](days/day-194.md)
- [Jour 195](days/day-195.md)
- [Jour 196](days/day-196.md) _(revue hebdo)_

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
