<!-- keep -->
# Leçon — Bases de données vectorielles

## 🌍 Le problème d'abord
Tu as transformé tes documents en milliers de vecteurs (embeddings). À chaque question, tu dois
trouver les quelques vecteurs les PLUS PROCHES de celui de la question. Facile avec 100
vecteurs : tu les compares un par un. Mais avec un MILLION de vecteurs, les comparer tous à
chaque question devient trop lent. Comment retrouver les plus proches presque instantanément,
sur d'énormes volumes ? C'est le rôle d'une **base de données vectorielle** : un index
spécialisé qui répond vite à « quels vecteurs ressemblent le plus à celui-ci ? ». Cette leçon
te montre ce qu'elle fait vraiment (et le piège de croire que « vector DB = RAG »).

## 🎯 Objectif
Comprendre à quoi sert une base vectorielle, ce qu'elle stocke en plus des vecteurs, le compromis recherche exacte vs approximative (ANN), et quand un simple fichier suffit vs quand il faut une vraie base. Indispensable pour industrialiser un RAG.

## 🧠 Modèle mental
Une base vectorielle, c'est **un index qui répond vite à “quels vecteurs sont les plus proches de celui-ci ?”**, avec des métadonnées et des filtres — comme un moteur de recherche, mais par SENS au lieu de mots-clés.

## 🧩 Prérequis
Tu dois comprendre les embeddings et la similarité (le sens devenu vecteur, la proximité
mesurée par cosinus, `/doc/lessons/embeddings`) et la place du retrieval dans un RAG
(`/doc/lessons/rag-fundamentals`). Une intuition du coût algorithmique aide (chercher parmi n
éléments, `/doc/lessons/data-structures-intro`), car l'ANN est précisément un compromis de
coût. Aucune base vectorielle particulière n'est supposée.

## 📖 Explication complète

**Le problème n'est pas de stocker, il est de chercher.** Ranger un million de vecteurs dans un
fichier est trivial. Répondre à « lequel ressemble le plus à celui-ci ? » l'est beaucoup moins :
la réponse exacte demande de comparer la question à CHACUN des vecteurs, un par un. C'est ce
qu'on appelle la recherche exhaustive, et son coût grandit proportionnellement au nombre de
vecteurs : deux fois plus de documents, deux fois plus de temps par question.

**Ce que fait un index approximatif.** Un index **ANN** (*Approximate Nearest Neighbors* —
plus proches voisins approchés) renonce à la garantie d'exactitude pour éviter d'avoir à tout
regarder. Le principe, quel que soit l'algorithme : construire à l'avance une carte des
proximités entre vecteurs, puis, à la question, ne parcourir qu'un chemin dans cette carte au
lieu de toute la collection. `HNSW`, le plus répandu, empile plusieurs niveaux de cette carte —
un niveau grossier pour se rapprocher vite de la bonne zone, des niveaux de plus en plus fins
pour affiner — un peu comme on cherche une rue avec une carte du pays, puis de la ville, puis
du quartier.

**Ce qu'on paie pour cette vitesse.** Le chemin parcouru peut manquer un voisin qui était bien
là. En pratique on retrouve 95 à 99 % des bons résultats pour un temps divisé par cent ou
plus. C'est un réglage, pas une fatalité : explorer davantage de chemins rapproche de
l'exactitude et coûte plus de temps. La conséquence pratique surprend : **deux exécutions de
la même requête peuvent rendre des résultats légèrement différents**, et ce n'est pas un bug.

**Les métadonnées sont la moitié du travail.** À côté de chaque vecteur, la base stocke des
champs ordinaires : source, page, date, auteur. Ils servent à deux choses sans lesquelles un
RAG n'est pas utilisable en entreprise — **filtrer** (« cherche seulement dans les documents RH
de 2024 ») et **citer** (« cette phrase vient du contrat X, page 12 »). Une réponse sans
citation est invérifiable.

**Quand une vraie base devient nécessaire, calculé et non deviné.** L'empreinte mémoire d'une
collection se calcule : `n vecteurs × dimension × 4 octets` (un nombre en virgule flottante
simple précision, `float32`, occupe 4 octets). Cent mille vecteurs en 1 024 dimensions font
donc environ 400 Mo. En dessous de quelques dizaines de milliers de morceaux, un simple fichier
chargé en mémoire avec une recherche exhaustive suffit largement, et se débogue à l'œil.
Au-delà, l'index ANN, les filtres et la persistance d'une vraie base (Chroma, sqlite-vec,
pgvector) cessent d'être du confort.

## 🔎 Décomposition
- « Pourquoi est-ce lent ? » → la recherche exacte compare tout, et le tout grandit.
- « Comment on évite de tout comparer ? » → une carte des proximités construite à l'avance.
- « Qu'est-ce qu'on perd ? » → quelques bons résultats, réglables contre du temps.
- « Pourquoi deux exécutions diffèrent ? » → parce que le chemin exploré n'est pas exhaustif.
- « Ai-je besoin d'une base ? » → `n × dimension × 4 octets`, puis on décide.

## 🔧 Exemple simple
Ajouter un chunk : `collection.add(id, vecteur, {source:"contrat.pdf", page:12})`. Chercher : `collection.query(vecteur_question, k=5, where={source:"contrat.pdf"})`.

## 🧭 Exemple guidé
**Énoncé** : décider si une base vectorielle est nécessaire pour 5 000 documents de ~20 chunks.
**Raisonnement** : 5000 × 20 = 100 000 vecteurs. À 1024 dims × 4 octets ≈ 400 Mo — la recherche exacte reste possible en mémoire mais commence à ralentir par requête.
**Décision** : une vraie base (ou sqlite-vec) apporte l'index ANN + les filtres + la persistance ; un fichier JSON deviendrait pénible. **Variante** : à 500 documents (~10 000 vecteurs), le fichier suffit — commence simple.

## 🤖 Exemple appliqué (IA / data / architecture)
Dans DocSense, la base vectorielle est un **adapter** derrière une interface `VectorStore` : on peut passer de « fichier en mémoire » (prototype) à Chroma (production locale) en changeant un seul fichier. Le filtrage par métadonnées permet de restreindre la recherche à un dossier, et les métadonnées portent les citations.

## ⚠️ Erreurs fréquentes

**L'index périmé, montré.** Ce code a l'air de faire le bon travail. Il produit un système qui
répond n'importe quoi, sans jamais planter :

```python
# ❌ FAUX : on change de modèle d'embedding, on ne reconstruit pas l'index.
modele = charger("multilingual-e5-large")   # hier : "all-MiniLM-L6-v2"
q = modele.encoder("comment poser mes congés ?")
resultats = collection.query(q, k=5)        # l'index contient les ANCIENS vecteurs
```

Les deux modèles rendent des vecteurs de dimensions compatibles, la requête passe, la base
répond cinq documents. Mais les coordonnées produites par deux modèles différents ne désignent
pas les mêmes directions : comparer les unes aux autres revient à mesurer une distance entre
une carte de Paris et une carte de Lyon. Les résultats sont plausibles, ordonnés, et faux.
Aucune exception ne sera levée.

La seule protection est de VERSIONNER l'index avec ce qui l'a produit :

```python
# ✅ JUSTE : l'index porte l'identité de ce qui l'a construit.
META = {"modele": "all-MiniLM-L6-v2", "dimension": 384, "chunking": "structure-v2"}
assert collection.metadata == META, "index construit avec une autre configuration : reconstruire"
```

La même règle vaut si tu changes de stratégie de découpage : les morceaux ne sont plus les
mêmes, l'index ne correspond plus au corpus.

Les autres :
- Déployer une base lourde pour 500 morceaux : un fichier et une recherche exhaustive font le
  travail, et se lisent.
- Ne stocker aucune métadonnée : ni filtrage, ni citation, donc aucune réponse vérifiable.
- Confondre exact et ANN, puis s'étonner que deux exécutions diffèrent.

## 🚫 Anti-patterns
- Coupler tout le code à une base vectorielle précise (pas d'interface) : migration impossible.
- Index non versionné (« avec quel modèle a-t-il été construit ? ») — voir le cas montré ci-dessus.

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
**ANN** (plus proches voisins approchés) · **HNSW** · **index** · **métadonnées** ·
**filtrage** · **collection** · **float32** · **rappel de l'index** (part des bons résultats
que l'ANN retrouve réellement) · **pgvector / Chroma / sqlite-vec**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais estimer l'empreinte mémoire d'un index et décider s'il faut une base.
- [ ] Je comprends le trade-off exact vs ANN.
- [ ] Je cache la base derrière une interface remplaçable et je stocke des métadonnées.

## 🔗 Liens avec le programme
Mois 9 (jours ~235-260), projets 6 et final. Leçons liées : `embeddings`, `rag-fundamentals`, `architecture-basics`.
