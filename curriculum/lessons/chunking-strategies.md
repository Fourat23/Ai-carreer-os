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
Le LLM ne peut pas ingérer 10 000 documents : on récupère seulement les extraits pertinents. La qualité de ces extraits dépend du découpage :
- **Taille fixe (+ overlap)** : découper tous les ~500-1000 caractères, avec un chevauchement (~10-20 %) pour ne pas couper une idée en deux. Simple, robuste, un bon défaut.
- **Par structure** : suivre les titres/sections/paragraphes du document (Markdown, HTML). Souvent MEILLEUR sur de la doc technique, car un chunk = une section cohérente.
- **Par phrases / sémantique** : regrouper des phrases liées. Plus fin, plus coûteux.
Chaque chunk garde ses **métadonnées** (source, page, section) : elles fondent les citations et le filtrage.
Il n'y a pas de « meilleure » taille dans l'absolu : ça dépend des documents et des questions. D'où la règle : **mesurer** (le bon chunk est-il dans le top-k ? rappel@k) sur un golden set, et comparer 2-3 stratégies.

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
- Ne jamais LIRE ses chunks (ils sont souvent pleins de débris d'extraction PDF).
- Chunker sans overlap → idées coupées.
- Une taille unique pour tous types de documents.
- Ignorer les métadonnées → pas de citations possibles.

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
**chunk** · **overlap / chevauchement** · **chunking par structure** · **métadonnées** · **rappel@k** · **golden set**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais implémenter un chunker taille-fixe + overlap et un par structure.
- [ ] J'évalue une stratégie de chunking par le rappel@k, pas à l'œil.
- [ ] Mes chunks portent leurs métadonnées.

## 🔗 Liens avec le programme
Mois 8-9 (jours ~225-255), projets 6 et final. Leçons liées : `rag-fundamentals`, `embeddings`, `ai-evaluation`.
