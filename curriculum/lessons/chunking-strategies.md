<!-- keep -->
# Leçon — Stratégies de chunking

## 🌍 Le problème d'abord
Pour qu'un RAG retrouve les bons passages, il faut d'abord DÉCOUPER tes documents en morceaux.
Ça paraît anodin — « je coupe tous les 1000 caractères » — mais c'est souvent LE facteur qui
fait qu'un RAG marche ou pas. Coupe trop gros, et chaque morceau récupéré est noyé de bruit
autour de l'info utile ; coupe trop petit, et une idée se retrouve tranchée en deux, illisible.
Pire : couper au milieu d'une phrase peut rendre un passage introuvable. Ces morceaux
s'appellent des **chunks**, et la façon de les découper — le **chunking** — est le premier
levier de qualité d'un RAG. Cette leçon t'apprend à choisir une stratégie par la mesure, pas au
hasard.

## 🎯 Objectif
Comprendre pourquoi et comment découper des documents en morceaux (chunks) pour un RAG, les trade-offs taille/structure/overlap, et comment CHOISIR une stratégie par la mesure plutôt qu'au feeling. Le chunking est souvent le premier levier de qualité d'un RAG.

## 🧠 Modèle mental
Un chunk est **l'unité que ton système récupère et montre au modèle**. Trop gros : du bruit noie l'info et le retrieval devient flou. Trop petit : le sens se fragmente et le contexte manque. Le bon chunk = **une idée complète, autonome, retrouvable**.

## 🧩 Prérequis
Tu dois comprendre le pipeline RAG dans son ensemble — pourquoi on découpe et on récupère des
extraits (`/doc/lessons/rag-fundamentals`) — et ce qu'est un embedding, puisque chaque chunk
sera vectorisé (`/doc/lessons/embeddings`). Aucune bibliothèque particulière n'est supposée :
le chunking se raisonne d'abord sur le texte brut.

## 📖 Explication complète

**Pourquoi on découpe, exactement.** Un LLM ne lit qu'une quantité limitée de texte à la fois,
et on ne lui envoie de toute façon que quelques passages : les 10 000 documents restent dans la
base. Le découpage décide donc de l'UNITÉ que le système est capable de retrouver et de
montrer. Un chunk est ce qu'on récupère en entier ou pas du tout — il n'y a pas de demi-chunk.
Tout le reste découle de cette contrainte.

**Le double effet de la taille, dans les deux sens.** Un chunk trop GROS contient la réponse,
mais noyée : le vecteur qui le représente est la moyenne de plusieurs idées, il ne pointe
franchement vers aucune, et la question s'en rapproche mal. Une fois récupéré, il occupe la
place de deux autres passages et dilue l'attention du modèle. Un chunk trop PETIT pointe très
précisément, mais peut être privé de ce qui le rend compréhensible — un « Il doit alors
notifier le locataire sous 15 jours » sans le paragraphe qui dit de qui et de quoi on parle.
Le bon chunk est donc celui qui reste **autonome** : lu seul, il se comprend seul.

**L'overlap répare une frontière arbitraire.** Découper tous les 500 caractères coupe
forcément quelque part, et parfois au milieu de la phrase qui portait la réponse. Le
chevauchement — répéter les 100 derniers caractères du chunk précédent au début du suivant —
garantit qu'une idée à cheval sur une frontière se retrouve ENTIÈRE dans au moins un des deux.
On paie ce filet en volume stocké : 20 % d'overlap, c'est environ 20 % de vecteurs en plus.

**Trois stratégies, et ce qui les départage.**
- **Taille fixe + overlap** : on avance par pas de (taille − overlap). Simple, robuste, marche
  sur n'importe quel texte, ignore complètement le sens. Bon défaut.
- **Par structure** : on suit les titres, sections ou paragraphes du document. Un chunk devient
  « Article 4 — Préavis » au lieu de « …fin du paragraphe 3 + début du 5 ». Sur de la
  documentation technique ou juridique, c'est presque toujours meilleur, pour une raison
  simple : l'auteur a DÉJÀ fait le travail de regrouper une idée par section.
- **Par phrases ou par sens** : on regroupe des phrases voisines tant qu'elles se ressemblent.
  Plus fin, plus coûteux (il faut embedder pour décider), utile sur du texte sans structure.

**Les métadonnées voyagent avec le morceau.** Chaque chunk garde d'où il vient : fichier, page,
section. Sans elles, impossible de filtrer (« cherche seulement dans les contrats de 2024 ») et
impossible de citer — donc impossible de vérifier une réponse. C'est le champ le plus souvent
oublié et le plus difficile à rajouter après coup.

**Aucune taille n'est bonne dans l'absolu.** Elle dépend de tes documents et de tes questions.
La seule façon honnête de choisir est de mesurer le **rappel@k** : pour un jeu de questions
dont tu connais déjà le bon passage, dans quelle proportion ce passage figure-t-il parmi les k
morceaux remontés ? Trois questions sur quatre donnent 0,75. On compare deux ou trois
stratégies sur LE MÊME jeu, et le gagnant est celui qui a le meilleur nombre — pas celui qui
paraît le plus élégant. Ce jeu de questions à réponse connue s'appelle un **golden set** ;
`/doc/lessons/rag-evaluation` explique comment le construire pour qu'il soit exigeant.

## 🔎 Décomposition
- « Quelle unité mon système peut-il retrouver ? » → le chunk, entier ou pas du tout.
- « Pourquoi ma réponse est-elle noyée ? » → chunks trop gros, vecteur moyenné.
- « Pourquoi ce passage est-il incompréhensible ? » → chunk trop petit, contexte coupé.
- « Pourquoi cet overlap ? » → parce que la frontière est arbitraire et coupe parfois mal.
- « Comment je tranche entre deux stratégies ? » → rappel@k sur le même golden set.

## 🔧 Exemple simple
Un contrat de 12 pages découpé par « article » donne des chunks autonomes (« Article 4 — Préavis… »), bien plus utiles que des tranches de 500 caractères qui coupent au milieu d'une phrase.

## 🧭 Exemple guidé
**Énoncé** : chunker un texte en tranches de 500 caractères avec 100 de chevauchement.
**Raisonnement** : avancer par pas de (taille − overlap) pour que chaque chunk recouvre le précédent.
**Solution (pseudo)** :
```
i = 0
tant que i < len(texte):
    chunk = texte[i : i+500]
    i += 400   # 500 - 100 overlap
```
**Explication** : l'overlap évite qu'une idée à cheval sur deux chunks disparaisse. **Variante** : coupe plutôt aux frontières de paragraphes (\n\n) pour ne jamais casser une phrase.

## 🤖 Exemple appliqué (IA / data / architecture)
Dans DocSense, on compare (mesuré sur un golden set) le chunking par taille fixe vs par structure Markdown sur 10 questions : « le passage qui contient la réponse est-il dans le top-3 ? ». La stratégie gagnante est adoptée, chiffres à l'appui — c'est exactement ce qui distingue un RAG d'ingénieur d'un RAG de démo.

## ⚠️ Erreurs fréquentes

**Le chunker que tout le monde écrit d'abord, et ce qu'il produit.** Il a l'air juste :

```python
# ❌ FAUX : l'overlap est déclaré mais jamais appliqué.
def chunker(texte, taille=500, overlap=100):
    morceaux = []
    i = 0
    while i < len(texte):
        morceaux.append(texte[i:i + taille])
        i += taille              # ← on avance de 500, pas de 400
    return morceaux
```

La variable `overlap` existe, le paramètre est documenté, la fonction rend des morceaux : rien
ne signale l'erreur. Sur le texte « …le bailleur doit notifier le locataire sous 15 jours… »,
si la frontière tombe entre « sous 15 » et « jours », la phrase n'existe ENTIÈRE dans aucun
chunk. Aucune requête ne la retrouvera jamais, et le rappel@k baissera sans qu'on sache
pourquoi.

```python
# ✅ JUSTE : on avance du pas, pas de la taille.
def chunker(texte, taille=500, overlap=100):
    morceaux = []
    pas = taille - overlap       # 400
    i = 0
    while i < len(texte):
        morceaux.append(texte[i:i + taille])
        i += pas
    return morceaux
```

Le test qui l'attrape tient en une ligne : deux morceaux consécutifs doivent partager du
texte. `assert morceaux[0][-overlap:] == morceaux[1][:overlap]`.

Les autres :
- Ne jamais LIRE ses propres chunks. Une extraction de PDF produit des en-têtes répétés, des
  numéros de page au milieu des phrases, des tableaux transformés en bouillie. Cinq minutes de
  lecture révèlent ce que des heures de réglage ne trouveront pas.
- Une taille unique pour des documents de natures différentes.
- Ignorer les métadonnées, donc perdre toute possibilité de filtrer et de citer.

## 🚫 Anti-patterns
- Choisir la taille au hasard et ne jamais la mesurer.
- Chunks énormes « pour ne rien rater » → le retrieval ramène du bruit, la génération se noie.

## ✍️ Mini-exercice
Implémente un chunker taille-fixe + overlap, applique-le à un vrai document, et LIS 5 chunks. Note ce qui te gêne (phrases coupées, tableaux cassés).

## 🔥 Exercice plus difficile
Implémente un chunker par structure (découpe aux titres Markdown) et compare-le au taille-fixe sur 10 questions : pour chacune, le bon passage est-il dans le top-3 ? Conclus par les chiffres.

## ✅ Correction attendue
La logique : le chunking sert le RETRIEVAL, donc on l'évalue par le retrieval (rappel@k), pas à l'œil. Vérifie que ton overlap fonctionne (deux chunks consécutifs partagent bien du texte), que les métadonnées suivent chaque chunk, et que ta comparaison utilise LES MÊMES questions pour être juste.

## 🎤 Questions d'entretien
- « Comment choisis-tu la taille des chunks et l'overlap ? » → Par la mesure (rappel@k) sur un golden set, selon les documents ; overlap pour ne pas couper une idée.
- « Taille fixe ou par structure ? » → La structure gagne souvent sur la doc technique ; à mesurer.
- « Pourquoi garder des métadonnées par chunk ? » → Filtrage et citations vérifiables.

## 🧾 À retenir
- Un chunk = une idée complète et retrouvable ; ni trop gros ni trop petit.
- Overlap pour ne pas couper les idées ; structure > taille fixe sur la doc technique.
- Le chunking se CHOISIT par la mesure, pas au feeling.

## 📚 Vocabulaire
**chunk** · **overlap / chevauchement** · **chunking par structure** · **métadonnées** ·
**rappel@k** · **golden set**. Tous définis dans le corps de la leçon, à l'endroit où ils
servent.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais implémenter un chunker taille-fixe + overlap et un par structure.
- [ ] J'évalue une stratégie de chunking par le rappel@k, pas à l'œil.
- [ ] Mes chunks portent leurs métadonnées.

## 🔗 Liens avec le programme
Mois 8-9 (jours ~225-255), projets 6 et final. Leçons liées : `rag-fundamentals`, `embeddings`, `ai-evaluation`.
