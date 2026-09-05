<!-- keep -->
# Leçon — Transformers : l'architecture derrière les LLM

## 🌍 Le problème d'abord
Prends la phrase « la souris est cassée ». S'agit-il de l'animal ou de l'objet
informatique ? Impossible de trancher sur le mot seul : c'est le CONTEXTE (« cassée ») qui
décide. Pendant des années, les machines lisaient les phrases mot à mot, de gauche à droite,
et peinaient à relier un mot à un autre distant. Le problème à résoudre : comment donner à
chaque mot un sens qui dépend de tous les autres mots autour de lui, et le faire assez vite
pour entraîner des modèles gigantesques ? La réponse — l'ATTENTION, puis le TRANSFORMER — a
déclenché toute la vague des LLM. Cette leçon suit le trajet d'une phrase de bout en bout, au
niveau intuition solide (schémas d'abord, formules seulement si elles éclairent), pour que tu
saches expliquer un transformer avec tes propres mots.

## 🎯 Objectif
Comprendre le trajet d'une phrase dans un transformer — tokenisation → embeddings → attention → prédiction — au niveau INTUITION SOLIDE (schémas, pas équations). Objectif d'entretien : « explique-moi un transformer » en 3 minutes, avec tes propres mots.

## 🧠 Modèle mental
L'attention, c'est **une salle de réunion où chaque mot écoute tous les autres** et décide à qui prêter attention pour préciser son propre sens. Dans « la souris mange le fromage » vs « la souris ne répond plus », le mot « souris » construit son sens en regardant ses voisins. Le transformer, c'est cette réunion, répétée couche après couche.

## 🧩 Prérequis
Tu dois comprendre un réseau de neurones — couches, poids, activation, entraînement par
gradient (`/doc/lessons/neural-networks`) — car un transformer EST un réseau particulier. Tu
n'as PAS besoin de savoir dériver les équations : on construit l'intuition d'abord, la
formule vient seulement si elle éclaire.

**L'unique notion supplémentaire dont cette leçon a besoin est l'embedding, et elle tient en
deux phrases.** Un modèle ne manipule pas des mots mais des **vecteurs** : chaque token est
transformé en une liste de nombres, disons 768, choisie à l'entraînement de sorte que deux
mots employés dans des contextes semblables reçoivent des vecteurs proches. « Proche » se
mesure par l'angle entre deux vecteurs — deux directions voisines signifient deux sens
voisins. C'est tout ce que l'attention manipule, et c'est ce que le tableau de l'exemple
guidé calcule.

> **Où trouver le détail.** `/doc/lessons/embeddings` traite comment ces vecteurs sont
> produits, ce que vaut un score de similarité selon la dimension, et pourquoi un seuil
> recopié d'un tutoriel ne veut rien dire. Elle est **programmée plus loin** dans le parcours ;
> rien ici ne suppose que tu l'as lue.

## 📖 Explication complète
Le trajet d'une phrase, étape par étape :
1. **Tokenisation** : le texte devient des tokens (sous-mots, ~4 caractères). « anticonstitutionnellement » → plusieurs tokens ; « chat » → un seul.
2. **Embeddings** : chaque token devient un vecteur (son sens initial, hors contexte) + une information de POSITION (l'ordre des mots compte, et le transformer traite tout en parallèle — il faut lui dire qui est où).
3. **L'attention** : chaque token émet une **requête** (« qu'est-ce que je cherche ? »), une **clé** (« voici ce que j'offre ») et une **valeur** (« voici mon contenu »). Les requêtes se comparent aux clés → des poids d'attention → chaque token absorbe un mélange pondéré des valeurs des autres. Résultat : des représentations CONTEXTUELLES (le « souris » informatique ≠ le « souris » animal). Plusieurs **têtes** d'attention capturent des relations différentes (syntaxe, coréférence…) en parallèle.
4. **Les couches** : attention + petit réseau (feed-forward), empilés des dizaines de fois — le sens s'affine couche après couche, du local vers l'abstrait.
5. **La sortie** : pour le dernier token, le modèle produit un score pour CHAQUE token possible du vocabulaire → une distribution de probabilités → on échantillonne (température) → le token suivant. Boucle : générer, ajouter, recommencer.
Pourquoi le transformer a gagné : contrairement aux RNN qui lisaient mot à mot, l'attention traite TOUTE la séquence en parallèle (entraînement massivement accéléré) et relie directement des mots éloignés (dépendances longues).
La limite structurelle : l'attention compare chaque token à chaque autre — coût quadratique en longueur → la fenêtre de contexte est bornée. C'est LA raison d'être du RAG.

## 🔧 Exemple simple
« La banque a refusé mon prêt » vs « La banque du fleuve était boueuse » : le vecteur de « banque » diffère à la sortie, parce que l'attention l'a mélangé à « prêt » dans un cas, à « fleuve » dans l'autre. C'est ÇA, une représentation contextuelle.

## 🧭 Exemple guidé
**Énoncé** : dérouler le trajet de « Le chat dort » jusqu'au token suivant — et calculer
l'étape d'attention, au lieu de la raconter.

```
1. Tokens      : [Le] [chat] [dort]
2. Embeddings  : 3 vecteurs + une information de position
3. Attention   : chaque token en regarde d'autres          ← on ouvre cette boîte
4. ×N couches  : représentations de plus en plus contextuelles
5. Sortie      : une distribution de probabilité sur tout le vocabulaire
```

**Décision 1 — ouvrir l'étape 3, parce que c'est la seule qui compte.** « Dort regarde
chat » est une phrase qu'on lit partout et qui n'apprend rien. Voici le calcul réel, sur des
vecteurs de dimension 4 choisis à la main. Chaque token produit trois vecteurs : ce qu'il
**cherche** (Q), ce qu'il **offre** (K), ce qu'il **apporte** (V). On confronte les
recherches aux offres par produit scalaire, on divise par √d, on applique un softmax pour
obtenir des poids qui somment à 1 :

```
             Le      chat     dort
   Le      1,000    0,000    0,000
 chat      0,378    0,622    0,000
 dort      0,268    0,420    0,311
```

Lis ce tableau, il contient tout le mécanisme. `dort` répartit son attention : 42 % sur
`chat`, 31 % sur lui-même, 27 % sur `Le`. Puis son nouveau vecteur devient la **moyenne
pondérée** des V par ces poids :

```
vecteur de "dort" avant : [0,000  0,100  0,800  0,000]
vecteur de "dort" après : [0,027  0,410  0,291  0,000]
```

La composante qui portait « chat » est passée de 0,10 à 0,41. Voilà ce que veut dire
« intégrer le contexte » : **une moyenne pondérée dont les poids sont calculés par produit
scalaire.** Rien d'autre. Si tu peux réexpliquer ce tableau et cette moyenne, tu as compris
l'attention mieux que la plupart des gens qui en parlent.

**Décision 2 — pourquoi la moitié du tableau est-elle vide ?** `Le` n'accorde d'attention
qu'à lui-même, `chat` ne regarde que `Le` et lui-même. C'est le **masque causal** : pendant
la génération, un token ne peut pas voir ce qui vient après lui, sinon le modèle
tricherait en s'entraînant à prédire un mot qu'il a déjà lu. Cette contrainte explique une
propriété que tu constateras tous les jours — un modèle génératif traite le texte de gauche
à droite et ne peut pas revenir en arrière sur ce qu'il a déjà produit. Les modèles conçus
pour *comprendre* plutôt que *générer* n'ont pas ce masque et voient toute la phrase :
c'est la même architecture, avec un triangle en moins.

**Décision 3 — pourquoi diviser par √d ?** Parce que le produit scalaire de deux vecteurs de
dimension *d* grandit avec *d*. Sans cette division, les scores deviennent grands, le
softmax sature — un poids à 1, les autres à 0 — et le gradient s'annule : le modèle
n'apprend plus. Ce n'est donc pas une décoration mathématique, c'est ce qui maintient les
poids dans une zone où l'entraînement fonctionne. Retiens la forme du raisonnement, elle
resservira : **beaucoup de constantes bizarres dans les architectures existent pour garder
une quantité dans la plage où le calcul reste stable.**

**Décision 4 — l'étape 5, et le piège de la confiance.** La sortie n'est pas un mot, c'est
une **distribution** sur tout le vocabulaire : `paisiblement` 0,21 · `profondément` 0,14 ·
`.` 0,11 … On en tire un token, on le rajoute à l'entrée, et on recommence. Deux choses en
découlent. D'abord, la température ne rend pas le modèle « plus créatif » au sens humain :
elle aplatit ou accentue cette distribution avant le tirage. Ensuite, et c'est le point qui
compte pour ton travail : ce mécanisme produit **exactement la même chose** pour une
question dont il connaît la réponse et pour une question sur un sujet inventé. Les
probabilités portent sur la plausibilité de la suite, jamais sur sa vérité. **L'assurance
d'un modèle n'est pas un signal de fiabilité** — et c'est démontré ici, par l'architecture,
et non par une opinion sur les LLM.

**Variante qui déplace le problème.** Reprends le tableau et ajoute cinq tokens au lieu de
trois : il passe de 3×3 à 8×8. Chaque token doit se comparer à tous les autres, donc le coût
croît comme le **carré** de la longueur du contexte. C'est la raison pour laquelle doubler la
fenêtre de contexte coûte quatre fois plus, pourquoi les longs contextes sont chers, et
pourquoi une partie entière de la recherche vise à approcher cette matrice sans la calculer
entièrement. Une propriété de produit que tu paies chaque mois se lit directement dans la
forme d'un tableau.

## 🤖 Exemple appliqué (IA / data / architecture)
Cette leçon explique tes contraintes d'ingénieur : la fenêtre bornée (→ RAG, chunking), le coût par token (l'attention se paie), les embeddings réutilisés seuls pour le retrieval, et l'échantillonnage (température) comme source du non-déterminisme à encadrer. Comprendre le mécanisme = prédire les limites.

## ⚠️ Erreurs fréquentes
- Croire que le modèle « comprend » comme un humain (il géométrise le contexte).
- Confondre embeddings de tokens (dans le modèle) et modèles d'embeddings de phrases (pour le retrieval) — parents, mais usages différents.
- Réciter Q/K/V sans savoir les raconter avec une analogie à soi.
- Ignorer la position (sans elle, « chien mord homme » = « homme mord chien »).

## 🚫 Anti-patterns
- Apprendre les équations par cœur sans l'intuition (l'entretien teste l'intuition).
- Prétendre en entretien qu'on saurait implémenter un transformer si c'est faux — l'intuition solide et honnête vaut mieux.

## ✍️ Mini-exercice
Sans relire : si on double la longueur du contexte, par combien le calcul de
l'attention est-il multiplié, et pourquoi ?

## 🔥 Pratique — calculer une attention à la main

L'attention se comprend en la calculant. Le mécanisme complet tient en cinq
lignes d'algèbre linéaire ; ce qui est difficile, c'est de savoir ce qu'il
démontre et ce qu'il ne démontre pas.

**A. L'attention, ligne à ligne.** Avec numpy seul, prends une phrase de sept
mots, construis des représentations de dimension 8, trois matrices de projection,
et calcule : les requêtes, les clés, les valeurs, les scores, la normalisation
softmax, et la sortie. Livrable : le code, les poids d'attention d'un mot, et la
vérification que leur somme vaut 1.

**B. Ce que ton résultat démontre.** Regarde les poids obtenus. Correspondent-ils
à ce que tu attendais sémantiquement ? Livrable : ta réponse honnête, et ta
conclusion sur ce que le calcul prouve.

**C. Le coût quadratique.** Calcule le nombre de paires pour des longueurs de 512
à 131 072, et le facteur multiplicatif par rapport à 512. Livrable : le tableau,
et le facteur pour un contexte de 128 000 unités.

**D. La division par la racine.** Mesure l'écart-type des scores bruts pour des
dimensions de 8, 64 et 512, puis après division par la racine de la dimension.
Livrable : les six nombres, et ton explication de ce qui arriverait à la softmax
sans la division.

**E. La conservation de la dimension.** Vérifie que la sortie de l'attention a la
même dimension que l'entrée. Livrable : les deux dimensions, et ce que cette
propriété rend possible.

## ✅ Correction attendue

> Les valeurs ci-dessous viennent de
> `scripts/v70-verifications/reseaux-et-attention.py`, exécuté avec numpy 2.4.6,
> sans aucune bibliothèque d'apprentissage profond.

**A — le mécanisme.** Les cinq lignes qui constituent l'attention :

```python
Q, K, V = E @ Wq, E @ Wk, E @ Wv          # trois projections de la même entrée
scores  = Q @ K.T / np.sqrt(d)            # chaque mot contre chaque mot
poids   = softmax(scores, axe=1)          # devient une distribution
sortie  = poids @ V                       # mélange pondéré des valeurs
```

La somme des poids d'une ligne doit valoir exactement 1 — c'est ce que garantit
la softmax, et c'est le contrôle qui prouve que ton implémentation est correcte.

Le mot « attention » décrit ceci et rien d'autre : **chaque mot calcule un score
avec chaque autre mot, puis récupère un mélange de leurs valeurs pondéré par ces
scores.** Il n'y a ni mémoire, ni raisonnement, ni intention dans le mécanisme.

**B — le résultat honnête, et c'est le cœur de l'exercice.** Avec des projections
non entraînées, les poids mesurés pour le mot « banque » dans « la banque de la
rivière était boueuse » :

```
la      : 70,6 %
de      : 18,2 %
riviere :  8,6 %
boueuse :  2,4 %
```

Le mot qui désambiguïserait « banque » — « rivière » — n'arrive **pas** en tête.
Et c'est exactement ce qu'il faut publier.

Il serait facile de truquer les représentations jusqu'à obtenir l'illustration
parfaite. Ce serait mentir sur ce que le calcul démontre. La distinction à
retenir :

- **Ce que le script démontre** : le mécanisme. Le calcul des scores, la
  distribution de probabilité, le mélange pondéré. C'est de l'algèbre linéaire,
  entièrement vérifiable.
- **Ce qu'il ne démontre pas** : que les poids ont un sens. Le sens vient
  **entièrement** des matrices Wq, Wk et Wv, ici tirées au hasard et, dans un
  vrai modèle, apprises sur des milliards de mots.

**L'architecture ne comprend rien. Elle offre une forme de calcul dans laquelle
la compréhension peut être apprise.** C'est la phrase à retenir de toute la
leçon, et elle explique pourquoi les schémas d'attention colorés qu'on voit
partout sont trompeurs quand ils ne précisent pas qu'ils viennent d'un modèle
entraîné.

**C — le coût quadratique.**

```
longueur | paires calculées | multiplication par rapport à 512
     512 |          262 144 | ×1
   1 024 |        1 048 576 | ×4
   2 048 |        4 194 304 | ×16
   8 192 |       67 108 864 | ×256
  32 768 |    1 073 741 824 | ×4 096
 131 072 |   17 179 869 184 | ×65 536
```

**Doubler la longueur quadruple le calcul**, puisque chaque mot est comparé à
chaque mot. Pour 128 000 unités environ, le facteur est de 65 536 par rapport à
512.

Deux conséquences pratiques. La longueur de contexte est une **contrainte
d'ingénierie et de coût**, pas un réglage — c'est pourquoi les modèles à très
long contexte sont facturés différemment, et pourquoi une grande partie de la
recherche cherche des formes d'attention de coût inférieur. Et c'est la
justification arithmétique de la recherche documentaire : si l'on peut ne
soumettre que les cinq passages pertinents au lieu de tout le corpus, on ne gagne
pas un peu de coût, on en gagne des ordres de grandeur.

**D — la division par la racine.**

```
dimension   8 : écart-type des scores bruts  2,75 → après division 0,97
dimension  64 : écart-type des scores bruts  8,04 → après division 1,01
dimension 512 : écart-type des scores bruts 22,67 → après division 1,00
```

Le produit scalaire de deux vecteurs aléatoires de dimension *d* a un écart-type
qui croît comme √*d*. Après division par √*d*, il est ramené à 1 dans les trois
cas — c'est exactement la propriété recherchée, et la mesure le confirme.

Ce qui arriverait sans la division : des scores très étalés rendent la softmax
quasi binaire, un seul mot capte presque tout le poids, et les gradients des
autres deviennent négligeables. **La division n'est pas cosmétique : elle
maintient les scores dans la zone où la softmax reste dérivable utilement.**

C'est un exemple, parmi beaucoup, où un détail d'apparence arbitraire dans une
architecture répond en fait à une contrainte d'optimisation précise. Le réflexe
utile en lisant une architecture : devant un facteur qui semble décoratif,
chercher ce qui casserait sans lui.

**E — la conservation de la dimension.** La sortie a la même dimension que
l'entrée — 8 dans la mesure. Ce n'est pas un hasard : c'est cette propriété qui
permet d'**empiler** les couches d'attention, chaque couche prenant en entrée ce
que la précédente a produit.

C'est aussi ce qui rend possibles les connexions résiduelles, où l'entrée d'une
couche est ajoutée à sa sortie — un remède direct au problème du gradient qui
s'évanouit mesuré dans `neural-networks`, puisqu'il ouvre un chemin où le
gradient traverse la couche sans être multiplié. Les deux leçons décrivent le
même problème arithmétique et deux réponses différentes.

## 🎤 Questions d'entretien
- « Explique un transformer en 3 minutes. » → Les 5 étapes, avec l'analogie de l'attention et un exemple de mot ambigu.
- « Que calcule l'attention ? » → Pour chaque token, un mélange pondéré des autres tokens, poids donnés par l'affinité requête/clé — le sens en contexte.
- « Pourquoi la fenêtre de contexte est-elle limitée ? » → Coût quadratique de l'attention en longueur de séquence — d'où le RAG.

## 🧾 À retenir
- Trajet : tokens → embeddings+position → attention (Q/K/V) → couches → distribution.
- L'attention = mélange pondéré par pertinence ; le sens est contextuel et géométrique.
- Fenêtre bornée (attention quadratique) → la raison d'être du RAG.

## 📚 Vocabulaire
**token / tokenisation** · **embedding / position** · **attention / requête-clé-valeur** · **tête d'attention** · **couche / feed-forward** · **logits / distribution** · **température** · **fenêtre de contexte**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je déroule le trajet d'une phrase de tête, avec mes schémas.
- [ ] Mon analogie de l'attention survit aux questions de relance.
- [ ] Je relie chaque limite des LLM (fenêtre, coût, non-déterminisme) au mécanisme.

## 🔗 Liens avec le programme
Mois 7 (jours ~197-210), livrable « note transformer ». Leçons liées : `neural-networks`, `llm-fundamentals`, `embeddings`.
