<!-- keep -->
# Leçon — Bases de données vectorielles

## 🎯 Objectif
Comprendre à quoi sert une base vectorielle, ce qu'elle stocke en plus des vecteurs, le compromis recherche exacte vs approximative (ANN), et quand un simple fichier suffit vs quand il faut une vraie base. Indispensable pour industrialiser un RAG.

## 🧠 Modèle mental
Une base vectorielle, c'est **un index qui répond vite à “quels vecteurs sont les plus proches de celui-ci ?”**, avec des métadonnées et des filtres — comme un moteur de recherche, mais par SENS au lieu de mots-clés.

## 📖 Explication complète
Stocker des vecteurs est facile ; les CHERCHER vite est le problème. Comparer une requête à un million de vecteurs un par un (recherche exacte) coûte cher. Les bases vectorielles utilisent des index **ANN** (Approximate Nearest Neighbors, ex. HNSW) : un peu moins exact, mais des ordres de grandeur plus rapides — un trade-off vitesse/précision qu'on règle.
Elles stockent aussi, à côté de chaque vecteur, des **métadonnées** (source, page, date, auteur) qui permettent le **filtrage** (« cherche seulement dans les documents RH de 2024 ») et les **citations**.
Le dimensionnement se calcule : n vecteurs × dimension × 4 octets donne l'ordre de grandeur mémoire. En dessous de quelques dizaines de milliers de chunks, un fichier + recherche exacte suffit ; au-delà, une vraie base (Chroma, sqlite-vec, pgvector…) devient utile.

## 🔧 Exemple simple
Ajouter un chunk : `collection.add(id, vecteur, {source:"contrat.pdf", page:12})`. Chercher : `collection.query(vecteur_question, k=5, where={source:"contrat.pdf"})`.

## 🧭 Exemple guidé
**Énoncé** : décider si une base vectorielle est nécessaire pour 5 000 documents de ~20 chunks.
**Raisonnement** : 5000 × 20 = 100 000 vecteurs. À 1024 dims × 4 octets ≈ 400 Mo — la recherche exacte reste possible en mémoire mais commence à ralentir par requête.
**Décision** : une vraie base (ou sqlite-vec) apporte l'index ANN + les filtres + la persistance ; un fichier JSON deviendrait pénible. **Variante** : à 500 documents (~10 000 vecteurs), le fichier suffit — commence simple.

## 🤖 Exemple appliqué (IA / data / architecture)
Dans DocSense, la base vectorielle est un **adapter** derrière une interface `VectorStore` : on peut passer de « fichier en mémoire » (prototype) à Chroma (production locale) en changeant un seul fichier. Le filtrage par métadonnées permet de restreindre la recherche à un dossier, et les métadonnées portent les citations.

## ⚠️ Erreurs fréquentes
- Prendre une base lourde pour 500 chunks (sur-ingénierie).
- Oublier de reconstruire l'index quand on change de modèle d'embedding ou de chunking.
- Ne pas stocker de métadonnées → impossible de filtrer ni de citer.
- Confondre exact et ANN et s'étonner de résultats légèrement différents.

## 🚫 Anti-patterns
- Coupler tout le code à une base vectorielle précise (pas d'interface) : migration impossible.
- Index non versionné (« avec quel modèle a-t-il été construit ? »).

## ✍️ Mini-exercice
Calcule l'empreinte mémoire de 200 000 chunks en 768 dimensions (float32). Une base vectorielle est-elle justifiée ?

## 🔥 Exercice plus difficile
Implémente une interface `VectorStore` (add, query avec filtre) avec DEUX adapters : un « en mémoire » (recherche exacte) et un vers une vraie base. Prouve que changer d'adapter ne change pas le reste du code.

## ✅ Correction attendue
200 000 × 768 × 4 ≈ 590 Mo : une base vectorielle avec index ANN est justifiée. L'interface `VectorStore` doit exposer le MINIMUM (add, query, filtre) et cacher l'implémentation ; le test « changer d'adapter = un fichier » prouve le découplage. Vérifie que le filtrage par métadonnées fonctionne et que les résultats portent leur source.

## 🎤 Questions d'entretien
- « Recherche exacte vs ANN ? » → ANN sacrifie un peu de précision pour beaucoup de vitesse ; nécessaire à grande échelle.
- « Que stocke une base vectorielle en plus des vecteurs ? » → Des métadonnées pour filtrer et citer.
- « Quand une base vectorielle est-elle superflue ? » → Petit corpus : un fichier + recherche exacte suffit.

## 🧾 À retenir
- Le problème n'est pas stocker mais CHERCHER vite → index ANN (trade-off vitesse/précision).
- Les métadonnées permettent filtrage et citations.
- Commence simple ; une interface `VectorStore` rend la base remplaçable.

## 📚 Vocabulaire
**ANN** · **HNSW** · **index** · **métadonnées** · **filtrage** · **collection** · **recall (ANN)** · **pgvector / Chroma / sqlite-vec**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais estimer l'empreinte mémoire d'un index et décider s'il faut une base.
- [ ] Je comprends le trade-off exact vs ANN.
- [ ] Je cache la base derrière une interface remplaçable et je stocke des métadonnées.

## 🔗 Liens avec le programme
Mois 9 (jours ~235-260), projets 6 et final. Leçons liées : `embeddings`, `rag-fundamentals`, `architecture-basics`.
