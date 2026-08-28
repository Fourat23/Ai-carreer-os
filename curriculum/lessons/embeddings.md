<!-- keep -->
# Leçon — Embeddings

## 🌍 Le problème d'abord
Deux phrases peuvent employer des mots complètement différents et pourtant parler de la même
chose : « comment poser mes congés ? » et « procédure de demande de vacances ». Une recherche
classique par mots-clés échoue ici — aucun mot commun. Comment une machine peut-elle mesurer
que ces deux phrases sont PROCHES par le SENS, pas par les lettres ? La réponse est l'idée
centrale de toute l'IA de recherche moderne : transformer chaque texte en une position dans un
espace, calculée pour que « sens proche = position proche ». Ces positions s'appellent des
**embeddings**. Cette leçon te fait comprendre géométriquement ce que c'est et pourquoi ça rend
possible la recherche par sens — la brique qui fait fonctionner le retrieval d'un RAG.

## 🎯 Objectif
Comprendre ce qu'est un embedding (géométriquement), pourquoi il permet la recherche par SENS (et pas par mots), et comment l'utiliser en pratique (similarité cosinus, normalisation). C'est la brique qui rend possible le retrieval d'un RAG.

## 🧠 Modèle mental
Un embedding transforme un texte en un **point dans un espace à plusieurs centaines de dimensions**, positionné de sorte que **le sens proche = la distance proche**. « Congés payés » et « droit aux vacances » atterrissent côte à côte, même sans mot commun. Attention à la limite de l'analogie : on ne peut pas VISUALISER 384 dimensions — on garde l'intuition « proximité = sens », mais chaque dimension n'a pas de signification lisible.

## 🧩 Prérequis
Tu dois comprendre qu'un LLM manipule du texte et que la recherche par mots-clés a des limites
(`/doc/lessons/llm-fundamentals`, `/doc/lessons/http-rest-json` pour l'usage via API). Savoir
écrire une boucle sur une liste de nombres suffit.

Aucune algèbre linéaire n'est supposée. **Produit scalaire**, **norme** et **similarité
cosinus** sont définis dans cette leçon, avec un calcul chiffré à la main — ils ne sont pas
un prérequis, ils sont le contenu.

## 📖 Explication complète

**Un texte devient une liste de nombres.** Un modèle d'embedding a été entraîné sur d'immenses
quantités de texte à une tâche simple : deviner les mots qui entourent un mot. Pour y arriver,
il a dû ranger les mots qui s'emploient dans les mêmes contextes à des endroits voisins. Le
résultat de cet entraînement est une fonction qui prend un texte et rend un **vecteur** — une
liste de nombres de longueur fixe, typiquement 384, 768 ou 1 536. Chaque nombre est une
coordonnée. Personne ne peut dire ce que signifie la 137ᵉ coordonnée prise seule : ce qui a un
sens, c'est la POSITION d'ensemble, et surtout la position RELATIVE de deux textes.

**Mesurer si deux listes de nombres pointent dans la même direction.** Deux textes proches par
le sens donnent deux vecteurs qui pointent dans une direction voisine. Reste à transformer
« direction voisine » en un nombre. C'est le rôle de trois opérations, dans cet ordre :

- Le **produit scalaire** de deux vecteurs : on multiplie leurs coordonnées deux à deux, puis
  on additionne tout. Pour `a = [1, 2]` et `b = [3, 1]` : `1×3 + 2×1 = 5`. Un seul nombre.
  Il est grand quand les deux vecteurs ont de grandes coordonnées AUX MÊMES ENDROITS.
- La **norme** d'un vecteur : sa longueur, obtenue par Pythagore — racine de la somme des
  carrés. Pour `a = [1, 2]` : `√(1² + 2²) = √5 ≈ 2,24`. Elle dépend surtout de la LONGUEUR du
  texte, pas de son sens : un paragraphe et un résumé du même contenu ont des normes très
  différentes.
- La **similarité cosinus** divise le produit scalaire par les deux normes :
  `cos(a, b) = (a·b) / (‖a‖ × ‖b‖)`. Sur l'exemple :
  `5 / (2,24 × 3,16) ≈ 0,71`. La division est ce qui compte : elle ANNULE l'effet de la
  longueur et ne laisse que l'orientation. C'est pour cela qu'on compare des directions et non
  des magnitudes — un résumé et son texte long doivent se ressembler.

Le résultat vaut 1 quand les deux vecteurs pointent exactement dans la même direction, 0
quand ils sont perpendiculaires (aucun rapport), et peut être négatif s'ils s'opposent. Quand
les vecteurs sont **normalisés** — ramenés à une norme de 1 en divisant chaque coordonnée par
la norme — les deux dénominateurs valent 1, et le cosinus se réduit au seul produit scalaire.
C'est pourquoi les bases vectorielles normalisent à l'ingestion : une multiplication et une
addition suffisent ensuite, des millions de fois par seconde.

**La recherche par le sens en découle directement.** On embedde chaque document UNE fois, à
l'avance, et on garde les vecteurs. À chaque question, on embedde la question, puis on calcule
sa similarité cosinus avec chaque vecteur stocké, et on garde les plus élevées. La recherche
classique demandait « quels documents contiennent ces mots ? » ; celle-ci demande « quels
documents pointent dans la même direction que la question ? ». Rien d'autre n'a changé — et
c'est ce déplacement de question qui fait fonctionner le retrieval d'un RAG.

## 🔎 Décomposition
- « Comment un texte devient-il comparable ? » → un modèle d'embedding, une fois, à l'ingestion.
- « Comment mesure-t-on la ressemblance ? » → produit scalaire ÷ produit des normes.
- « Pourquoi diviser par les normes ? » → pour que la longueur du texte cesse de compter.
- « Pourquoi normaliser à l'avance ? » → pour que la comparaison ne coûte qu'une somme de produits.
- « Un texte proche est-il un texte pertinent ? » → non, et c'est une autre question
  (`/doc/lessons/retrieval-reranking`).

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
Dans un RAG, on découpe d'abord les documents en **chunks** — des morceaux de quelques
centaines de mots, autonomes et retrouvables (`/doc/lessons/chunking-strategies`). On embedde
chaque chunk UNE fois, à l'ingestion, et on les stocke dans une base vectorielle. À chaque
question, on embedde la question et on récupère les **k** chunks au cosinus le plus élevé —
`k` est simplement le nombre de morceaux qu'on décide de remonter, typiquement 3 à 10. Le
choix du modèle d'embedding (langue, dimension, coût) change directement la qualité du
retrieval : cela se mesure, cela ne se devine pas.

## ⚠️ Erreurs fréquentes

**L'erreur qu'on ne voit pas : oublier la division.** Voici la fonction que presque tout
débutant écrit en premier — elle est FAUSSE, et elle a l'air de marcher :

```js
// ❌ FAUX : c'est un produit scalaire, pas une similarité cosinus.
function similarite(a, b) {
  let somme = 0;
  for (let i = 0; i < a.length; i++) somme += a[i] * b[i];
  return somme;                       // il manque ÷ (‖a‖ × ‖b‖)
}
```

Pourquoi c'est faux se voit sur deux cas. Prends `question = [1, 1]`, un texte court
`court = [1, 1]` (exactement le même sens) et un texte long `long = [4, 0]` (sens différent,
mais beaucoup de mots) :

| paire | produit scalaire | cosinus |
|---|---:|---:|
| question ↔ court | `1×1 + 1×1 = 2` | `2 / (1,41 × 1,41) = 1,00` |
| question ↔ long | `1×4 + 1×0 = 4` | `4 / (1,41 × 4) = 0,71` |

La fonction fautive classe `long` **premier** parce que ses nombres sont plus grands. Le
cosinus classe `court` premier parce qu'il pointe exactement dans la même direction. En
production, ce bug ne plante jamais : il remonte simplement les documents les plus longs, à
toutes les questions. On le prend pour un problème de modèle pendant des semaines.

```js
// ✅ JUSTE
function cosinus(a, b) {
  let scalaire = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    scalaire += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return scalaire / (Math.sqrt(na) * Math.sqrt(nb));
}
```

Les autres, plus classiques :
- Comparer des embeddings produits par des modèles DIFFÉRENTS : les coordonnées ne veulent pas
  dire la même chose d'un modèle à l'autre, le cosinus rend un nombre qui ne mesure rien.
- Ré-embedder les documents à chaque requête : on paie N appels au lieu d'un, pour un résultat
  identique — les documents ne changent pas entre deux questions.
- Croire que « similaire » = « pertinent ». Deux textes peuvent parler du même sujet sans que
  l'un réponde à l'autre. Départager les candidats est le travail d'une autre étape
  (`/doc/lessons/retrieval-reranking`).

## 🚫 Anti-patterns
- Choisir un modèle d'embedding « parce qu'il est connu » sans mesurer sur SES données.
- Mélanger langues sans modèle multilingue adapté.

## ✍️ Mini-exercice
Implémente `cosinus(a, b)` à la main (produit scalaire / produits des normes) et vérifie que `cosinus(v, v) === 1`.

## 🔥 Exercice plus difficile
Sur 20 phrases et 5 requêtes dont tu connais déjà la bonne réponse, calcule le **rappel@3** :
pour chaque requête, la bonne phrase figure-t-elle parmi les 3 mieux classées ? Le rappel@3
est simplement la proportion de requêtes pour lesquelles c'est le cas — 4 sur 5 donne 0,8.
C'est la mesure de base d'un retrieval, et elle ne demande aucun LLM
(`/doc/lessons/rag-evaluation` la détaille). Compare deux modèles d'embedding si tu peux.

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
**vecteur / dimension** · **produit scalaire** · **norme** · **similarité cosinus** ·
**normalisation** · **recherche sémantique** · **modèle d'embedding** · **chunk** ·
**rappel@k**. Tous sont définis dans le corps de la leçon, à l'endroit où ils servent.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais coder la similarité cosinus et l'expliquer.
- [ ] Je comprends pourquoi le sens (pas les mots) rapproche deux textes.
- [ ] Je sais mesurer la qualité d'un retrieval par embeddings (rappel@k) et dire ce que ce nombre compte.

## 🔗 Liens avec le programme
Mois 7-9 (embeddings, RAG), projets 6 et final. Leçons liées : `rag-fundamentals`,
`vector-databases`, `chunking-strategies`, `retrieval-reranking`, `rag-evaluation`,
`llm-fundamentals`.
