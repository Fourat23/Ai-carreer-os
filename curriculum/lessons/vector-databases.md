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
« Faut-il une base vectorielle ? » est une question d'infrastructure qu'on tranche presque
toujours par habitude ou par mode. Elle se calcule.

> Les empreintes ci-dessous sont **calculées** par
> `scripts/v70-verifications/llm-cout-et-vecteurs.py`. L'arithmétique est
> `nombre_de_vecteurs × dimensions × octets_par_nombre`, et le facteur 1,5 tient compte de
> l'index et des métadonnées.

### Le tableau des empreintes

| Vecteurs | Dimensions | Type | Brut | Avec index (~1,5×) |
|---:|---:|---|---:|---:|
| 10 000 | 384 | float32 | 15 Mo | 23 Mo |
| 10 000 | 1536 | float32 | 61 Mo | 92 Mo |
| 100 000 | 768 | float32 | **307 Mo** | 461 Mo |
| 200 000 | 768 | float32 | **614 Mo** | 922 Mo |
| 200 000 | 1536 | float32 | 1 229 Mo | 1 843 Mo |
| 2 000 000 | 768 | float32 | 6 144 Mo | 9 216 Mo |
| 200 000 | 768 | **int8** | **154 Mo** | 230 Mo |

Trois choses se lisent dans ce tableau, et ce sont trois décisions.

### 1. La dimension du modèle d'embedding est une décision d'infrastructure

À nombre de vecteurs égal, passer de 384 à 1536 dimensions **quadruple** l'empreinte : 15 Mo
deviennent 61 Mo, 307 Mo deviennent 1 229 Mo.

Ce choix est fait au moment de sélectionner le modèle d'embedding, souvent sur le seul critère
de la qualité annoncée, et sans que personne ne calcule ce qu'il engage. Or il détermine la
mémoire, le coût de l'hébergement, et le moment où l'on devra changer d'architecture.

La question à poser : **un modèle en 384 dimensions perd-il vraiment du rappel sur mon
corpus ?** Souvent non — et il permet alors de rester dans la catégorie du dessous pour toute
la vie du projet.

### 2. Les trois régimes, et le seuil réel

| Empreinte | Ce qui suffit |
|---|---|
| **< 50 Mo** | un tableau en mémoire, recherche exacte, boucle sur tous les vecteurs |
| **50 – 500 Mo** | base vectorielle **embarquée** (un fichier), index approximatif utile |
| **> 500 Mo** | base vectorielle dédiée, index approximatif nécessaire |

Le premier régime est celui qu'on sous-estime le plus. Dix mille vecteurs en 384 dimensions
tiennent dans **15 Mo** et se comparent tous en quelques millisecondes avec une multiplication
matricielle. Pour un corpus de 500 documents — la taille de la plupart des projets internes —
une base vectorielle est de l'infrastructure à opérer, à sauvegarder et à surveiller, pour un
service qu'un tableau NumPy rend déjà.

**Commence simple** n'est pas une concession pédagogique : c'est la bonne décision technique
dans le premier régime.

### 3. La quantification avant l'infrastructure

Dernière ligne du tableau : les mêmes 200 000 vecteurs en `int8` occupent **154 Mo au lieu de
614**. Un facteur 4, pour une perte de rappel généralement faible — mesurable, et à mesurer.

C'est le premier levier à essayer quand on franchit un seuil, avant de changer de composant.
Passer de 614 Mo à 154 Mo fait redescendre le projet d'un régime entier, sans introduire de
nouvelle brique dans l'architecture.

### Ce que la base vectorielle apporte au-delà de la mémoire

Le calcul d'empreinte ne dit pas tout. Trois fonctions justifient une vraie base même quand la
mémoire tiendrait :

- **le filtrage par métadonnées combiné à la recherche** — « les passages du contrat 118,
  postérieurs à 2024 ». Fait naïvement en deux temps (chercher puis filtrer), on découvre que
  les dix meilleurs résultats sont tous filtrés et qu'il n'en reste aucun ;
- **la persistance et les mises à jour incrémentales** — ajouter cent documents sans tout
  recalculer ;
- **l'index approximatif**, qui rend la recherche quasi indépendante du nombre de vecteurs, au
  prix d'un rappel légèrement inférieur à la recherche exacte.

Le premier point est celui qui décide le plus souvent, et il n'a rien à voir avec la taille :
c'est une question de **fonctionnalité**, pas de volume.

### La décision, en trois questions

1. **Combien de vecteurs, en quelles dimensions ?** → l'empreinte, et le régime.
2. **Ai-je besoin de filtrer pendant la recherche ?** → si oui, une vraie base, quelle que soit
   la taille.
3. **Le corpus change-t-il souvent ?** → si oui, la persistance et l'ajout incrémental
   comptent ; si le corpus est figé, un index reconstruit à chaque déploiement suffit.

Aucune des trois ne demande de choisir un produit. C'est délibéré : **le choix du produit vient
après**, et il change tous les dix-huit mois — alors que ces trois questions, elles, restent.


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
### Le calcul demandé

`200 000 × 768 × 4 octets ≈ 614 Mo` de vecteurs bruts, soit environ **920 Mo avec l'index et
les métadonnées**. On est au-dessus du seuil de 500 Mo : une base vectorielle avec index
approximatif est justifiée.

Mais avant de conclure, la question qui doit précéder : **peut-on descendre d'un régime ?**

| Levier | Nouvelle empreinte | Ce qu'on perd |
|---|---:|---|
| quantification en `int8` | **154 Mo** | un peu de rappel, à mesurer |
| modèle en 384 dimensions | 307 Mo | à mesurer sur ton corpus |
| les deux | 77 Mo | idem |

La quantification à elle seule fait passer de 614 à 154 Mo — c'est-à-dire du troisième régime
au deuxième, sans changer d'architecture. C'est le premier réflexe, et il est très rarement le
premier réflexe des gens.

Réponse complète attendue : *« 614 Mo bruts, 920 avec index : une base vectorielle est
justifiée en l'état. Avant de l'installer, je mesure le rappel avec quantification `int8`, qui
ramènerait l'empreinte à 154 Mo et rendrait une solution embarquée suffisante. »*

### L'interface, et pourquoi elle doit être petite

```ts
interface VectorStore {
  add(items: { id: string; vector: number[]; metadata: Record<string, unknown> }[]): Promise<void>;
  query(vector: number[], k: number, filtre?: Record<string, unknown>): Promise<Resultat[]>;
}
```

Deux méthodes. C'est délibéré : **une interface se dimensionne sur ce que tous les
implémenteurs peuvent faire, pas sur ce que le plus riche propose.**

Si l'on ajoute `updateMetadata`, `hybridSearch` ou `createNamespace` parce qu'une base
particulière les offre, l'adaptateur en mémoire ne peut plus les implémenter — et l'interface a
cessé d'être une abstraction pour devenir la description d'un produit.

C'est le **piège de l'abstraction qui fuit** : elle a la forme d'une interface, et elle
n'abstrait rien, parce qu'elle épouse les particularités de l'implémentation qu'on avait sous
les yeux en l'écrivant.

### Le test qui prouve le découplage

Le critère « changer d'adaptateur = un fichier » se prouve, et voici comment :

```ts
// la MÊME suite de tests, jouée contre les deux implémentations
for (const creer of [creerStoreMemoire, creerStoreBase]) {
  describe(creer.name, () => {
    it('retrouve le vecteur le plus proche', async () => { /* … */ });
    it('respecte le filtre de métadonnées', async () => { /* … */ });
    it('renvoie k résultats au plus', async () => { /* … */ });
    it('gère un magasin vide', async () => { /* … */ });
  });
}
```

Une seule suite, deux implémentations. Si un test doit être adapté pour l'une des deux, le
découplage est incomplet — et le point exact où il faut adapter **est** la fuite d'abstraction.

Ce motif porte un nom : une **suite de tests de contrat**. Elle a une seconde vertu, pratique :
le jour où l'on veut essayer une troisième base, on écrit l'adaptateur et l'on sait
immédiatement s'il est conforme.

### Le filtrage : le piège qui n'apparaît qu'en production

Le critère « le filtrage par métadonnées fonctionne » cache le vrai défaut, et il ne se voit
que sur des données réelles.

```
❌  chercher les 10 plus proches, PUIS garder ceux de 2024
    → les 10 plus proches datent tous de 2023 → 0 résultat
    → l'utilisateur voit « aucun résultat », alors que le corpus en contient des centaines
```

Le filtrage **après** la recherche est presque toujours faux, et il ne se manifeste que quand le
filtre est sélectif — c'est-à-dire jamais sur un jeu de test de vingt documents, toujours sur un
corpus réel.

Les deux réponses correctes :

- **le filtrage pendant la recherche** (pré-filtrage), que les vraies bases vectorielles
  offrent : l'index ne parcourt que les vecteurs correspondant au filtre ;
- à défaut, **sur-échantillonner** : chercher les 200 plus proches, filtrer, garder les 10
  premiers — en acceptant que ce soit approximatif et en surveillant les cas à zéro résultat.

C'est un critère de choix de produit plus décisif que la vitesse brute : une base rapide sans
pré-filtrage donne des réponses fausses sur des requêtes filtrées.

### La mauvaise solution plausible

Prendre une base vectorielle gérée dès le premier prototype, « pour ne pas avoir à migrer plus
tard ».

L'argument est raisonnable et l'expérience le contredit : sur 5 000 vecteurs — **8 Mo** —, on
ajoute un service externe, une clé d'API, une latence réseau, un coût mensuel et un point de
panne, pour remplacer trente lignes de NumPy qui répondent en deux millisecondes.

Et l'argument de la migration se retourne : c'est **précisément** le rôle de l'interface à deux
méthodes. Avec elle, la migration est un fichier ; sans elle, elle est coûteuse quel que soit le
moment où on la fait.

### Auto-évaluation

| Vérification | Comment |
|---|---|
| l'empreinte est calculée | tu as le chiffre en Mo, pas une impression |
| la quantification a été envisagée | tu sais ce qu'elle coûterait en rappel, mesuré |
| l'interface est minimale | l'adaptateur en mémoire l'implémente **entièrement** |
| le découplage est prouvé | la même suite de tests passe sur les deux adaptateurs |
| le filtrage est correct | un filtre très sélectif renvoie quand même des résultats |
| le choix est justifié | tu peux dire pourquoi **pas** un tableau en mémoire |

### Généralisation

La question de cette leçon — *à partir de quand ai-je besoin d'une infrastructure dédiée ?* —
se pose à l'identique pour une base de données, une file de messages, un cache distribué ou un
orchestrateur de conteneurs. Et elle se traite toujours de la même façon : **calculer l'ordre de
grandeur, identifier les fonctions dont on a réellement besoin, et cacher le choix derrière une
interface minimale.**

Le calcul dispense d'un débat d'opinion ; l'interface rend le choix révisable. Les deux
ensemble transforment une décision d'architecture irréversible en une décision qu'on peut
prendre tôt, sans la regretter.


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
