<!-- keep -->
# Leçon — Retrieval, recherche hybride et reranking

## 🌍 Le problème d'abord
Ton RAG répond mal. Réflexe du débutant : « le modèle est nul, changeons de LLM ». Mais dans
la grande majorité des cas, le vrai coupable est AVANT le modèle : le bon passage n'a jamais
été retrouvé, donc le modèle ne pouvait pas répondre correctement — il n'avait pas la réponse
sous les yeux. La recherche sémantique pure (par embeddings) attrape le sens mais rate parfois
les termes EXACTS (un numéro de référence, un nom propre) ; à l'inverse, la recherche par
mots-clés rate les reformulations. Comment ramener FIABLEMENT le bon extrait ? Cette leçon
attaque le maillon faible de la plupart des RAG : le retrieval, sa version hybride, et le
reranking qui affine le tri.

## 🎯 Objectif
Comprendre pourquoi le retrieval est le maillon faible de la plupart des RAG, comment combiner recherche vectorielle et lexicale (hybride), et à quoi sert le reranking. Savoir mesurer chaque étage. C'est là que se gagne la qualité d'un RAG.

## 🧠 Modèle mental
Le retrieval, c'est **ramener les bons extraits AVANT de générer**. Si le bon passage n'est pas ramené, aucune magie de génération ne le sauvera. « Garbage in, garbage out » : la génération ne peut pas inventer ce que le retrieval n'a pas trouvé.

## 🧩 Prérequis
Tu dois comprendre les embeddings et la similarité sémantique (`/doc/lessons/embeddings`), le
pipeline RAG et la distinction retrieval/génération (`/doc/lessons/rag-fundamentals`), et le
rôle de l'index vectoriel (`/doc/lessons/vector-databases`). La notion de rappel@k, centrale
ici, est approfondie dans l'évaluation (`/doc/lessons/rag-evaluation`). Aucun moteur de
recherche particulier n'est supposé.

## 📖 Explication complète

**Deux façons de chercher, qui échouent sur des choses différentes.** La recherche
**vectorielle** compare des directions de sens : elle relie « congés » à « vacances » sans
qu'aucun mot ne soit partagé. Elle rate en revanche ce qui n'a pas de sens à proprement parler
— une référence `ART-4412`, un nom propre rare, un code d'erreur : ces chaînes n'ont pas de
voisinage sémantique, leur vecteur ne veut rien dire. La recherche **lexicale** (BM25, ou FTS5
dans SQLite) fait l'inverse : elle compte les mots partagés entre la question et le document,
en pondérant les mots rares plus fort que les mots courants. Elle trouve `ART-4412` sans
hésiter, et rate complètement une reformulation.

**Leurs échecs ne se recouvrent pas, et c'est tout l'intérêt.** Là où deux méthodes ratent les
mêmes cas, en combiner deux n'apporte rien. Ici, chacune couvre l'angle mort de l'autre : c'est
ce qui rend l'**hybride** rentable, et non un simple empilement.

**Comment on fusionne deux classements dont les scores ne sont pas comparables.** Un score
cosinus vaut entre 0 et 1 ; un score BM25 peut valoir 3, ou 47. Les additionner n'a aucun sens.
La **RRF** (*Reciprocal Rank Fusion*) contourne le problème en ignorant les scores et en ne
gardant que les RANGS : chaque document reçoit `1 / (60 + rang)` dans chaque liste, et on
additionne. Un document 1ᵉʳ en lexical et 30ᵉ en vectoriel obtient
`1/61 + 1/90 ≈ 0,027` ; un document 5ᵉ dans les deux obtient `2 × 1/65 ≈ 0,031` et passe
devant. La méthode récompense donc ce qui est **bien classé par les deux** plutôt que ce qui
est premier chez un seul. Le 60 est une constante d'usage : elle amortit l'écart entre les
premiers rangs.

**Le reranking, et pourquoi il vient en dernier.** Les deux recherches précédentes comparent la
question et le document SÉPARÉMENT — chacun a été transformé en nombres de son côté. Un
**cross-encoder** fait autre chose : il lit la question ET le passage ENSEMBLE, et juge la
pertinence de la paire. C'est nettement plus juste, et beaucoup plus cher : il faut un passage
du modèle par candidat, sans rien pouvoir précalculer. D'où l'ordre imposé : on récupère
large et vite (top-20 hybride), puis on réordonne finement ce petit lot pour n'en garder que
3 à 5. Reranker un million de documents n'est pas « lent » : c'est irréalisable.

**Chaque étage se mesure séparément.** Sur un jeu de questions dont on connaît le bon passage,
le **rappel@k** dit si ce passage figure parmi les k remontés. Le mesurer à chaque étage montre
OÙ ça pèche : si le bon passage n'est déjà pas dans le top-20, aucun reranker ne le fera
apparaître — il ne réordonne que ce qu'on lui donne. Un **tableau d'ablation** (vectoriel seul,
lexical seul, hybride, hybride + rerank) chiffre l'apport de chaque ajout, et révèle
régulièrement qu'un étage coûteux n'apporte rien sur CE corpus.

## 🔎 Décomposition
- « Pourquoi la reformulation passe ? » → recherche vectorielle.
- « Pourquoi la référence exacte passe ? » → recherche lexicale.
- « Pourquoi combiner ? » → parce que leurs angles morts ne se recouvrent pas.
- « Comment additionner des scores incomparables ? » → on ne les additionne pas : RRF, par rang.
- « Pourquoi reranker à la fin ? » → le cross-encoder lit les paires, donc il coûte par candidat.
- « Où ça pèche ? » → rappel@k étage par étage, jamais globalement.

## 🔧 Exemple simple
Question « erreur ORA-00942 » : la vectorielle peut ramener des passages sur « erreurs de base de données » ; la lexicale trouve le passage EXACT contenant « ORA-00942 ». L'hybride ramène les deux.

## 🧭 Exemple guidé
**Énoncé** : fusionner deux classements (vectoriel et lexical) avec RRF.
**Raisonnement** : chaque document reçoit un score `1/(k+rang)` dans chaque liste ; on somme.
**Solution (pseudo)** :
```
score[doc] = 1/(60 + rang_vectoriel[doc]) + 1/(60 + rang_lexical[doc])
trier les docs par score décroissant
```
**Explication** : un document bien classé dans LES DEUX listes remonte ; RRF ne dépend pas de l'échelle des scores bruts. **Variante** : pondère l'une des deux sources et observe l'effet sur le rappel@5.

## 🤖 Exemple appliqué (IA / data / architecture)
Dans DocSense, l'ordre est : hybride (vectoriel + FTS5, fusionnés par RRF) → reranking du top-20 vers top-5 → génération. Chaque étage est mesuré ; le budget latence (< 3 s) est réparti par étage, et le reranking (le plus cher) ne s'applique qu'au sous-ensemble.

## ⚠️ Erreurs fréquentes

**La fusion qui a l'air raisonnable, montrée.** C'est le premier réflexe de tout le monde :

```python
# ❌ FAUX : on additionne des scores qui ne vivent pas sur la même échelle.
for doc in candidats:
    doc.score = doc.score_cosinus + doc.score_bm25   # 0,82 + 34,7
classement = sorted(candidats, key=lambda d: -d.score)
```

Le cosinus vit entre 0 et 1 ; BM25 n'a pas de borne haute et dépasse couramment 30. La somme
est donc, en pratique, le score BM25 seul avec un bruit de troisième décimale : la recherche
vectorielle est présente dans le code, absente du résultat. Le système paraît hybride, se
comporte comme un système lexical, et personne ne s'en aperçoit — le classement reste
plausible.

```python
# ✅ JUSTE : on fusionne les RANGS, pas les scores.
K = 60
scores = {}
for liste in (classement_vectoriel, classement_lexical):
    for rang, doc in enumerate(liste, start=1):
        scores[doc.id] = scores.get(doc.id, 0) + 1 / (K + rang)
classement = sorted(scores, key=lambda d: -scores[d])
```

Le test qui attrape le premier cas : retire complètement la liste vectorielle et re-mesure le
rappel@k. Si le score ne bouge quasiment pas, l'étage vectoriel ne servait à rien — soit à
cause de ce bug, soit parce qu'il n'apporte réellement rien sur ce corpus. Les deux méritent
d'être sus.

Les autres :
- Diagnostiquer la génération quand le problème est le retrieval : vérifier d'abord que le bon
  passage était présent. S'il ne l'était pas, tout le travail sur le prompt est perdu.
- Reranker avant de filtrer : le coût est proportionnel au nombre de candidats.
- Améliorer au feeling, sans mesurer étage par étage.

## 🚫 Anti-patterns
- Tout miser sur la vectorielle et s'étonner de rater les termes exacts.
- Empiler les étages sans budget de latence ni mesure.

## ✍️ Mini-exercice
Sur 5 questions dont une contient un code exact (ex. une référence), compare le top-3 de la recherche vectorielle seule vs lexicale seule. Laquelle trouve le code ?

## 🔥 Exercice plus difficile
Construis un tableau d'ablation (vectoriel / lexical / hybride / hybride+rerank) sur 15 questions, mesure le rappel@5 de chaque configuration, et conclus sur le gain de chaque étage.

## ✅ Correction attendue
La logique : le retrieval se mesure par étage (rappel@k) ; l'hybride comble les angles morts de chaque méthode ; le reranking affine le sous-ensemble. Vérifie que ta fusion RRF est correcte (un doc présent dans les deux listes remonte), que le budget latence est respecté, et que ton tableau d'ablation utilise les mêmes questions partout.

## 🎤 Questions d'entretien
- « Ton RAG répond mal, comment débugges-tu ? » → Retrieval d'abord (le bon passage est-il dans le top-k ?), génération ensuite.
- « Pourquoi hybride ? » → Vectoriel = sens, lexical = termes exacts ; complémentaires.
- « À quoi sert le reranking et pourquoi après le retrieval ? » → Réordonner finement un sous-ensemble déjà filtré, trop coûteux sur tout le corpus.

## 🧾 À retenir
- Le retrieval est le maillon faible : mesure-le d'abord (rappel@k).
- Hybride = vectoriel (sens) + lexical (mots), fusionnés par RRF.
- Reranking = affiner le top-k, après filtrage, sous budget de latence.

## 📚 Vocabulaire
**retrieval** · **BM25 / FTS5** · **recherche hybride** · **RRF** (fusion par rangs) ·
**reranking / cross-encoder** · **rappel@k** · **ablation** · **budget de latence**. Tous
définis dans le corps de la leçon.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais diagnostiquer retrieval vs génération.
- [ ] Je sais implémenter une fusion hybride (RRF) et un reranking.
- [ ] Je mesure chaque étage par ablation sur un golden set.

## 🔗 Liens avec le programme
Mois 9 (jours ~240-262), projets 6 et final. Leçons liées : `rag-fundamentals`, `embeddings`, `vector-databases`, `ai-evaluation`.
