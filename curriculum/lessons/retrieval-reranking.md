<!-- keep -->
# Leçon — Retrieval, recherche hybride et reranking

## 🎯 Objectif
Comprendre pourquoi le retrieval est le maillon faible de la plupart des RAG, comment combiner recherche vectorielle et lexicale (hybride), et à quoi sert le reranking. Savoir mesurer chaque étage. C'est là que se gagne la qualité d'un RAG.

## 🧠 Modèle mental
Le retrieval, c'est **ramener les bons extraits AVANT de générer**. Si le bon passage n'est pas ramené, aucune magie de génération ne le sauvera. « Garbage in, garbage out » : la génération ne peut pas inventer ce que le retrieval n'a pas trouvé.

## 📖 Explication complète
- **Recherche vectorielle** : par SENS (embeddings). Attrape les reformulations, rate parfois les termes exacts (références, noms propres, codes).
- **Recherche lexicale** (BM25 / SQLite FTS5) : par MOTS. Attrape les termes exacts, rate les synonymes.
- **Hybride** : combiner les deux et fusionner les scores (ex. **RRF**, Reciprocal Rank Fusion) — on récupère le meilleur des deux mondes.
- **Reranking** : après avoir récupéré un top-20 large, un modèle plus fin (cross-encoder ou LLM) RÉORDONNE pour remonter les 3-5 vraiment pertinents. Coûteux, donc appliqué seulement au sous-ensemble déjà filtré.
Chaque étage s'ÉVALUE : sur un golden set, mesurer « le bon passage est-il dans le top-k ? » (rappel@k) à chaque étage révèle où ça pèche. Un **tableau d'ablation** (vectoriel seul / lexical seul / hybride / hybride+rerank) montre le gain de chaque ajout.

## 🔧 Exemple simple
Question « erreur ORA-00942 » : la vectorielle peut ramener des passages sur « erreurs de base de données » ; la lexicale trouve le passage EXACT contenant « ORA-00942 ». L'hybride ramène les deux.

## 🧭 Exemple guidé
**Énoncé** : fusionner deux classements (vectoriel et lexical) avec RRF.
**Raisonnement** : chaque document reçoit un score `1/(k+rang)` dans chaque liste ; on somme.
**Solution (pseudo)** :
```
score[doc] = 1/(60 + rang_vectoriel[doc]) + 1/(60 + rang_lexical[doc])
trier les docs par score décroissant
```
**Explication** : un document bien classé dans LES DEUX listes remonte ; RRF ne dépend pas de l'échelle des scores bruts. **Variante** : pondère l'une des deux sources et observe l'effet sur le rappel@5.

## 🤖 Exemple appliqué (IA / data / architecture)
Dans DocSense, l'ordre est : hybride (vectoriel + FTS5, fusionnés par RRF) → reranking du top-20 vers top-5 → génération. Chaque étage est mesuré ; le budget latence (< 3 s) est réparti par étage, et le reranking (le plus cher) ne s'applique qu'au sous-ensemble.

## ⚠️ Erreurs fréquentes
- Diagnostiquer la génération alors que le problème est le retrieval (toujours vérifier le retrieval d'abord).
- Reranker AVANT de filtrer (coûteux et inutile).
- Améliorer « au feeling » sans mesurer chaque étage.
- Oublier que le lexical attrape ce que le vectoriel rate (et inversement).

## 🚫 Anti-patterns
- Tout miser sur la vectorielle et s'étonner de rater les termes exacts.
- Empiler les étages sans budget de latence ni mesure.

## ✍️ Mini-exercice
Sur 5 questions dont une contient un code exact (ex. une référence), compare le top-3 de la recherche vectorielle seule vs lexicale seule. Laquelle trouve le code ?

## 🔥 Exercice plus difficile
Construis un tableau d'ablation (vectoriel / lexical / hybride / hybride+rerank) sur 15 questions, mesure le rappel@5 de chaque configuration, et conclus sur le gain de chaque étage.

## ✅ Correction attendue
La logique : le retrieval se mesure par étage (rappel@k) ; l'hybride comble les angles morts de chaque méthode ; le reranking affine le sous-ensemble. Vérifie que ta fusion RRF est correcte (un doc présent dans les deux listes remonte), que le budget latence est respecté, et que ton tableau d'ablation utilise les mêmes questions partout.

## 🎤 Questions d'entretien
- « Ton RAG répond mal, comment débugges-tu ? » → Retrieval d'abord (le bon passage est-il dans le top-k ?), génération ensuite.
- « Pourquoi hybride ? » → Vectoriel = sens, lexical = termes exacts ; complémentaires.
- « À quoi sert le reranking et pourquoi après le retrieval ? » → Réordonner finement un sous-ensemble déjà filtré, trop coûteux sur tout le corpus.

## 🧾 À retenir
- Le retrieval est le maillon faible : mesure-le d'abord (rappel@k).
- Hybride = vectoriel (sens) + lexical (mots), fusionnés par RRF.
- Reranking = affiner le top-k, après filtrage, sous budget de latence.

## 📚 Vocabulaire
**retrieval** · **BM25 / FTS5** · **recherche hybride** · **RRF** · **reranking / cross-encoder** · **rappel@k** · **ablation** · **budget de latence**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais diagnostiquer retrieval vs génération.
- [ ] Je sais implémenter une fusion hybride (RRF) et un reranking.
- [ ] Je mesure chaque étage par ablation sur un golden set.

## 🔗 Liens avec le programme
Mois 9 (jours ~240-262), projets 6 et final. Leçons liées : `rag-fundamentals`, `embeddings`, `vector-databases`, `ai-evaluation`.
