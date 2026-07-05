<!-- keep -->
# Leçon — Embeddings

## 🎯 Objectif
Comprendre ce qu'est un embedding (géométriquement), pourquoi il permet la recherche par SENS (et pas par mots), et comment l'utiliser en pratique (similarité cosinus, normalisation). C'est la brique qui rend possible le retrieval d'un RAG.

## 🧠 Modèle mental
Un embedding transforme un texte en un **point dans un espace à plusieurs centaines de dimensions**, positionné de sorte que **le sens proche = la distance proche**. « Congés payés » et « droit aux vacances » atterrissent côte à côte, même sans mot commun.

## 📖 Explication complète
Un modèle d'embedding (entraîné sur d'immenses corpus) prend un texte et sort un **vecteur** (une liste de ~384 à ~3072 nombres). La géométrie encode la sémantique : deux textes de sens voisin ont des vecteurs voisins.
Pour comparer deux vecteurs, on mesure la **similarité cosinus** : l'angle entre eux (1 = même direction/sens, 0 = sans rapport). On travaille souvent avec des vecteurs **normalisés** (longueur 1), auquel cas le cosinus se réduit à un simple produit scalaire.
La recherche sémantique consiste alors à : embedder la question, embedder chaque document (une fois, à l'avance), et retrouver les documents dont le vecteur est le plus proche de celui de la question. C'est une recherche par PROXIMITÉ DE SENS, là où la recherche classique cherche des mots exacts.

## 🔧 Exemple simple
`cos("chat", "félin")` élevé ; `cos("chat", "boulon")` faible. Même sans partage de lettres, le sens rapproche les premiers.

## 🧭 Exemple guidé
**Énoncé** : classer 3 phrases par proximité de sens à une requête.
**Raisonnement** : embedder tout, calculer le cosinus requête↔phrase, trier.
**Solution (pseudo)** :
```
q = embed("comment poser mes congés ?")
for p in phrases: score[p] = cosinus(q, embed(p))
trier phrases par score décroissant
```
La phrase « procédure de demande de vacances » sortira en tête, même sans le mot « congés ». **Explication** : le classement suit le SENS, pas les mots. **Variante** : ajoute une phrase piège qui partage des mots mais pas le sens (« congés maladie ») et observe.

## 🤖 Exemple appliqué (IA / data / architecture)
Dans un RAG, on découpe les documents en chunks, on embedde chaque chunk UNE fois (à l'ingestion) et on les stocke dans une base vectorielle. À chaque question, on embedde la question et on récupère les k chunks les plus proches. Le choix du modèle d'embedding (langue, dimension, coût) influence directement la qualité du retrieval — à mesurer, pas à deviner.

## ⚠️ Erreurs fréquentes
- Comparer des embeddings de modèles DIFFÉRENTS (incompatibles).
- Oublier de normaliser quand la métrique le suppose.
- Ré-embedder à chaque requête les documents (coûteux : on les embedde une fois).
- Croire que « similaire » = « pertinent » : deux textes proches en sens ne répondent pas toujours à la question (d'où le reranking).

## 🚫 Anti-patterns
- Choisir un modèle d'embedding « parce qu'il est connu » sans mesurer sur SES données.
- Mélanger langues sans modèle multilingue adapté.

## ✍️ Mini-exercice
Implémente `cosinus(a, b)` à la main (produit scalaire / produits des normes) et vérifie que `cosinus(v, v) === 1`.

## 🔥 Exercice plus difficile
Sur 20 phrases et 5 requêtes dont tu connais la bonne réponse, calcule le rappel@3 (la bonne phrase est-elle dans le top-3 ?). Compare deux modèles d'embedding si tu peux.

## ✅ Correction attendue
La logique : embedder une fois, comparer par cosinus, trier. Vérifie : `cosinus(v, v) = 1`, symétrie `cosinus(a,b)=cosinus(b,a)`, et que tes cas « même mots / sens différent » et « sens proche / mots différents » se comportent comme attendu — c'est le test qui prouve que tu mesures bien du SENS.

## 🎤 Questions d'entretien
- « Qu'est-ce qu'un embedding, géométriquement ? » → Un vecteur où la proximité encode le sens.
- « Pourquoi la similarité cosinus plutôt que la distance euclidienne ? » → On compare des DIRECTIONS (le sens), pas des magnitudes ; robuste à la longueur du texte.
- « Similaire = pertinent ? » → Non, d'où le reranking après le retrieval.

## 🧾 À retenir
- Un embedding = un point dont la proximité encode le sens.
- Similarité cosinus = angle entre vecteurs ; normaliser simplifie.
- Embedder les documents une seule fois, à l'ingestion.

## 📚 Vocabulaire
**vecteur / dimension** · **similarité cosinus** · **produit scalaire** · **normalisation** · **espace latent** · **recherche sémantique** · **modèle d'embedding**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais coder la similarité cosinus et l'expliquer.
- [ ] Je comprends pourquoi le sens (pas les mots) rapproche deux textes.
- [ ] Je sais mesurer la qualité d'un retrieval par embeddings (rappel@k).

## 🔗 Liens avec le programme
Mois 7-9 (embeddings, RAG), projets 6 et final. Leçons liées : `rag-fundamentals`, `vector-databases`, `llm-fundamentals`.
