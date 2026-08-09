# HSD-033 — Stratégie pédagogique : la chaîne ML → DL → Transformers → LLMOps

Document de conception haut niveau (Sprint V33). Complète l'ADR-033. Décrit COMMENT rendre
la chaîne d'apprentissage machine accessible à un néophyte complet, par l'intuition puis la
pratique déterministe.

## 1. Principe directeur
Un néophyte ne doit jamais rencontrer un terme (gradient, loss, overfitting, embedding,
attention, token, inference, drift) AVANT d'avoir compris intuitivement le problème qu'il
résout. Ordre imposé : **concret → intuition → vocabulaire → mécanisme → formalisation →
exemple calculé → pratique → limites → synthèse.** La profondeur vient de la précision, des
liens de causalité, des contre-exemples et des limites — jamais de la longueur.

## 2. La chaîne à rendre franchissable

```
données → features → apprentissage supervisé → train/val/test → métriques →
bias/variance → workflow ML → réseaux de neurones → représentations/embeddings →
attention → transformers → LLM → évaluation → RAG/agents → observabilité/coût/production
```

Chaque maillon : un on-ramp « problème d'abord », des prérequis rédigés, et une pratique
déterministe qui fait MANIPULER le mécanisme.

## 3. Modèles mentaux imposés (déjà présents ou à préserver)
- **Feature** : une façon de PRÉSENTER l'information pour que le modèle la lise.
- **Split train/val/test** : réviser sur le cours, se tester sur l'examen blanc, noter sur
  l'examen final jamais vu — le test ne guide jamais l'entraînement.
- **Leakage** : une feature qui « connaît la réponse » → score illusoire.
- **Réseau de neurones** : une machine à régler des milliers de boutons ; la loss note,
  le gradient dit dans quel sens tourner chaque bouton.
- **Attention** : une salle de réunion où chaque mot écoute les autres pour préciser son
  sens ; QKᵀ/√d n'arrive qu'APRÈS cette intuition.
- **Transformer** : cette réunion répétée couche après couche ; coût quadratique → fenêtre
  bornée → raison d'être du RAG.
- **LLMOps** : ce qui change quand un prototype passe en production — coût, latence,
  fiabilité, qualité, observabilité — et le compromis QUALITÉ ↔ COÛT ↔ LATENCE ↔ FIABILITÉ.

## 4. Maths honnêtes
Intuition → exemple numérique → notation → formule → interprétation. Jamais formule →
« faites confiance ». Exemples calculables à la main : métriques depuis une matrice de
confusion (montrer que precision et recall mènent à deux décisions différentes), forward-pass
d'un neurone (somme pondérée + activation), poids d'attention (le score le plus élevé
l'emporte), coût LLM (tokens × prix).

## 5. Frontière réel/simulé
Tous les exercices sont déterministes et étiquetés SIMULATION : datasets, scores, poids et
prix sont fournis en entrée. Aucun entraînement, aucun appel de modèle, aucun réseau. Le
calcul (métriques, forward-pass, coût) est RÉELLEMENT exécuté localement.

## 6. Contrat de leçon (rappel V27→V32)
On-ramp 🌍 → 🎯 objectif → 🧩 prérequis rédigés → 🧠 modèle mental → explication progressive →
exemples gradués → ⚠️ erreurs fréquentes → pratique reliée → 🧾 à retenir → 📚 vocabulaire →
🔗 liens. Les 6 leçons dette ont déjà un contenu fort : V33 ajoute l'on-ramp, les prérequis
et la pratique, sans réécrire l'existant.

## 7. Anti-slop
Pas de texte artificiellement long, pas de jargon non introduit, pas de mini-leçons
superficielles, pas d'exercice de syntaxe pour un cours de raisonnement, pas de fausse
exécution ML. Une excellente leçon reliée à une pratique honnête vaut mieux que cinq
leçons creuses.
