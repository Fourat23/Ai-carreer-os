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
gradient (`/doc/lessons/neural-networks`) — car un transformer EST un réseau particulier, et
la notion d'embedding : un mot devenu vecteur de sens (`/doc/lessons/embeddings`). Les bases
de la similarité entre vecteurs (produit scalaire, orientation) aident pour l'attention. Tu
n'as PAS besoin de savoir dériver les équations : on construit l'intuition d'abord, la
formule vient seulement si elle éclaire.

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
Tokenise 5 phrases (tiktoken) et observe les surprises (mots coupés, accents, espaces). Compte les tokens d'un de tes prompts réels.

## 🔥 Exercice plus difficile
Rédige ta note illustrée « le trajet d'une phrase dans un transformer » avec TES schémas (tokenisation → embeddings+position → attention Q/K/V → couches → distribution), puis explique-la à voix haute en 3 minutes, enregistré.

## ✅ Correction attendue
La logique : 5 étapes mécaniques, l'attention comme mélange pondéré par pertinence, le sens affiné couche après couche, une distribution en sortie. Vérifie : ton analogie de l'attention tient debout face à « et pourquoi trois rôles Q/K/V ? » ; ta note explique POURQUOI la fenêtre est bornée ; tes 3 minutes tiennent sans jargon creux.

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
