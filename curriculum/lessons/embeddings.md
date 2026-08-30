<!-- keep -->
# Leçon — Embeddings

> **Embedding**, ou *plongement* en français : représentation d'un texte
> par une liste de nombres, construite de telle sorte que deux textes de
> sens proche produisent deux listes proches. C'est ce qui permet de
> comparer des sens au lieu de comparer des mots.

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

Le classement lui-même tient en trois lignes, et ce n'est pas là qu'est la difficulté :

```
q = embed("comment poser mes congés ?")
pour chaque phrase p : score[p] = cosinus(q, embed(p))
trier par score décroissant
```

« Procédure de demande de vacances » sort en tête sans partager un seul mot avec la
question : c'est toute la promesse des embeddings. Le vrai travail commence à la question
suivante, celle que tout le monde se pose au moment de brancher ça dans un système :
**« à partir de quel score dois-je considérer que c'est pertinent ? »** On voit circuler
0,7, ou 0,8. Ces nombres sont vides de sens tant qu'on n'a pas répondu à une question
préalable.

**Décision 1 — que vaut un cosinus « faible » ?** Mesurons ce que donnent **deux vecteurs
tirés complètement au hasard**, donc sans aucun rapport, selon le nombre de dimensions :

| dimensions | écart-type du cosinus | deux vecteurs au hasard dépassent 0,30 |
|---|---|---|
| 2 | 0,71 | **80,6 %** des cas |
| 10 | 0,32 | 37,1 % |
| 100 | 0,099 | 0,22 % |
| 768 | 0,036 | **0,00 %** |
| 1536 | 0,025 | 0,00 % |

C'est l'un des résultats les plus contre-intuitifs du domaine. En grande dimension — et les
modèles d'embedding travaillent en 768, 1 536 ou davantage — **deux textes sans aucun
rapport ont un cosinus proche de zéro**, à quelques centièmes près. Un score de 0,30 y est
donc déjà un signal massif, alors qu'en dimension 2 il arrive quatre fois sur cinq par
hasard.

Conséquence pratique immédiate : **un seuil recopié d'un tutoriel ne vaut rien**, parce
qu'il dépend du modèle, de sa dimension et de la manière dont il a été entraîné. La bonne
démarche est empirique et coûte une heure : prends trente questions réelles, regarde les
scores des passages que *toi* tu juges pertinents, et ceux des passages hors sujet. Le seuil
est là où les deux nuages se séparent — et s'ils ne se séparent pas, aucun seuil ne te
sauvera, c'est le découpage ou le modèle qu'il faut revoir.

**Décision 2 — cosinus ou distance ?** Les deux mesurent une « proximité », et ils ne
classent pas pareil. Trois documents comparés à une même requête :

| document | cosinus | distance euclidienne |
|---|---|---|
| A — même direction, vecteur court | **1,000** | 1,00 |
| B — même direction, vecteur long | **1,000** | 8,00 |
| C — direction différente | 0,707 | 1,46 |

Par cosinus, A et B sont **identiques** et C arrive dernier. Par distance, A gagne, C est
deuxième et **B est bon dernier**. Le cosinus ne regarde que la *direction* ; la distance
tient compte de la *longueur*. Pour du texte, la longueur du vecteur reflète souvent des
choses sans intérêt sémantique — la longueur du passage, sa fréquence lexicale — d'où le
choix habituel du cosinus. Mais c'est un choix, pas une évidence, et il faut savoir le
justifier : *je compare des sens, pas des intensités.* Note au passage que sur des vecteurs
**normalisés**, les deux mesures donnent le même classement : beaucoup de bases vectorielles
normalisent pour cette raison, et la question disparaît alors d'elle-même.

**Décision 3 — le piège que le cosinus ne verra jamais.** Ajoute au corpus la phrase
« congés maladie : justificatif à fournir sous 48 h ». Face à « comment poser mes congés ? »,
elle obtiendra un très bon score : même champ lexical, même domaine, sens réellement
voisin. Et c'est une mauvaise réponse. **La similarité sémantique n'est pas la pertinence.**
Un embedding sait dire « ces deux textes parlent de la même chose » ; il ne sait pas dire
« ce texte répond à cette question ». C'est exactement pourquoi un RAG sérieux ne s'arrête
pas au plus proche voisin : il rappelle large, puis **reclasse** avec un modèle qui, lui,
évalue la relation question-réponse, et non le voisinage thématique.

**Décision 4 — ce que ça implique pour ton évaluation.** Puisque le score n'est pas la
pertinence, tu ne peux pas juger ton système sur la moyenne des cosinus. La mesure honnête
est : *pour mes questions de référence, le bon passage est-il dans les k premiers ?* C'est un
taux, mesuré sur des questions dont tu connais la réponse — et c'est la seule chose qui te
dira si changer de modèle d'embedding a amélioré quoi que ce soit.

**Variante qui déplace le problème.** Ton corpus est en français, tu changes pour un modèle
multilingue, et les scores globaux montent. Formidable ? Pas nécessairement : si tout monte,
y compris pour les passages hors sujet, la **séparation** entre pertinent et non pertinent
peut s'être dégradée alors que la moyenne s'améliore. C'est la même erreur que de juger une
distribution par sa moyenne : ce qui compte ici n'est pas le niveau des scores, c'est
l'écart entre les deux populations.

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
### La démarche

*Vectoriser une fois, comparer par cosinus, trier.* Le « une fois » n'est pas un détail de
performance : vectoriser à chaque requête coûte, et surtout produit des vecteurs qui peuvent
changer si le modèle est mis à jour — ce qui rend les comparaisons incohérentes entre elles.

### Les trois contrôles de la fonction cosinus

```js
assert(Math.abs(cosinus(v, v) - 1) < 1e-9);            // ① un vecteur avec lui-même
assert(Math.abs(cosinus(a, b) - cosinus(b, a)) < 1e-9); // ② symétrie
assert(cosinus(a, b) >= -1 && cosinus(a, b) <= 1);      // ③ borné
```

Le contrôle ① attrape l'erreur la plus fréquente : diviser par **une seule** norme au lieu du
produit des deux. La fonction renvoie alors quelque chose de plausible — les classements
paraissent corrects — et `cosinus(v, v)` vaut la norme de `v` au lieu de 1. Le défaut est
invisible jusqu'au jour où l'on compare des scores entre requêtes.

Le contrôle ③ attrape les erreurs de type et les divisions par zéro : un vecteur nul donne
`NaN`, et `NaN` propage silencieusement dans tout un classement — la comparaison avec `NaN`
étant toujours fausse, le document se retrouve en fin de liste sans que rien ne le signale.

### Pourquoi le cosinus, et pas la distance

Mesure, sur des vecteurs de 384 dimensions :

| Paire | Cosinus | Distance euclidienne |
|---|---:|---:|
| même direction, longueurs différentes (×7) | **1,0000** | **6,000** |
| directions différentes, mêmes longueurs | −0,0142 | 1,424 |

*(Calculé par `scripts/v70-verifications/rag-chunking-et-metriques.py`.)*

Deux vecteurs strictement colinéaires ont un cosinus de 1 — ils sont « identiques » au sens du
sens — et une distance euclidienne de 6, qui les déclare très éloignés.

Pourquoi cela compte : **la longueur d'un vecteur d'embedding dépend en partie de la longueur
du texte.** Un paragraphe de 400 mots et une phrase de 12 mots sur le même sujet produisent des
vecteurs de normes différentes. La distance euclidienne les sépare ; le cosinus, qui ne compare
que des **directions**, les rapproche.

C'est la réponse complète à « pourquoi le cosinus ? » : non pas « c'est la convention », mais
*parce qu'on veut comparer des sujets, pas des longueurs*.

### Les deux cas de test qui font la leçon

Le mini-exercice demande de construire deux paires précises, et elles ne sont pas décoratives :

**« mêmes mots, sens différent »** — *« le chat mange la souris »* / *« la souris mange le
chat »*. Les deux phrases partagent tout leur vocabulaire. Un système lexical les juge
identiques ; un embedding devrait les distinguer.

Résultat honnête, et il faut le publier : **il les distingue mal.** Les embedding de phrases
capturent le sujet bien mieux que la structure grammaticale, et la similarité reste élevée.
C'est une limite réelle de la méthode, pas un défaut de ton implémentation — et c'est
exactement pourquoi certaines questions exigent une recherche lexicale ou un modèle de
reclassement qui, lui, lit les deux textes ensemble.

**« sens proche, mots différents »** — *« comment annuler ma commande »* / *« procédure de
résiliation d'un achat »*. Zéro mot en commun. C'est ici que l'embedding gagne franchement
contre le lexical, et c'est sa vraie valeur ajoutée.

Ces deux cas, pris ensemble, donnent la carte complète : **l'embedding excelle sur la
reformulation et échoue sur ce qui distingue deux phrases faites des mêmes mots.**

### Le rappel@3, et pourquoi on commence par là

```
rappel@3 = (nombre de requêtes dont la bonne réponse est dans le top 3) / (nombre de requêtes)
```

Quatre sur cinq donne 0,8. Cette mesure ne demande **ni modèle de langage, ni jugement
humain, ni budget** : cinq requêtes, cinq bonnes réponses connues d'avance, vingt lignes de
code.

C'est ce qui en fait le premier outil à construire dans tout projet de recherche sémantique.
Tant qu'on ne l'a pas, chaque décision — quel modèle, quelle taille de morceau, hybride ou non —
se prend au ressenti. Une fois qu'on l'a, elles se prennent en dix minutes chacune.

### La mauvaise solution plausible

Juger la qualité des embeddings en regardant les scores de similarité : « 0,87, c'est bon ».

Un score de cosinus n'a pas de signification absolue. Sa distribution dépend du modèle : sur
certains, deux textes sans aucun rapport obtiennent déjà 0,7, et 0,87 est médiocre ; sur
d'autres, la distribution est centrée sur 0,1 et 0,5 est excellent.

Ce qui a un sens, c'est le **classement** — le bon document est-il devant les autres ? — et
c'est précisément ce que le rappel@k mesure. Le seul usage légitime des scores bruts est
comparatif à l'intérieur d'une même requête, et éventuellement un seuil de rejet **calibré sur
tes données**, jamais repris d'un article.

### Généralisation

L'idée centrale de cette leçon dépasse le texte : **transformer un objet en vecteur permet de
mesurer une ressemblance qu'aucune règle n'aurait su écrire.** C'est ce qui fait fonctionner
la recommandation, la détection de doublons, la recherche d'images, le regroupement de tickets
de support.

Et la limite est toujours la même : **le vecteur ne capture que ce que le modèle a appris à
capturer.** Il ignorera ce qui compte pour toi si personne ne le lui a montré — d'où
l'obligation de vérifier sur **tes** paires, avec **tes** questions, plutôt que de faire
confiance à un classement générique.


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
