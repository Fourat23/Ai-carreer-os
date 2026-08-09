<!-- keep -->
# Leçon — Coûts d'inférence : estimer et optimiser

## 🌍 Le problème d'abord
Ton prototype d'assistant IA marche à merveille sur ton écran. Tu le mets en ligne, quelques
centaines d'utilisateurs l'essaient… et à la fin du mois, la facture te fait tomber de ta
chaise. Ce qui semblait « gratuit » en démo se paie, à chaque appel, dans les deux sens :
chaque mot envoyé au modèle ET chaque mot qu'il répond coûte. Un RAG qui injecte trois pages
de contexte à chaque question peut coûter cent fois plus qu'une simple question. Le vrai
enjeu n'est pas « comment payer moins » en aveugle, mais savoir ESTIMER le coût AVANT de
lancer, comprendre OÙ partent les tokens, et arbitrer sciemment entre qualité, coût et
latence. Cette leçon te donne cette compétence d'ingénieur que peu de juniors possèdent.

## 🎯 Objectif
Savoir ESTIMER le coût d'un système LLM avant de le lancer, identifier où partent les tokens, et appliquer les leviers d'optimisation (contexte, cache, modèle, batch). La maîtrise des coûts est une compétence d'ingénieur que peu de juniors ont — et une question d'entretien de plus en plus fréquente.

## 🧠 Modèle mental
Un appel LLM, c'est **un compteur de taxi : tu paies au token, dans les deux sens** (entrée ET sortie). L'entrée domine presque toujours dans un RAG (le contexte injecté est gros). Optimiser les coûts = raccourcir les trajets, pas supprimer les courses.

## 🧩 Prérequis
Tu dois savoir ce qu'est un LLM, un token et la fenêtre de contexte
(`/doc/lessons/llm-fundamentals`), et comment un RAG injecte du contexte récupéré dans le
prompt — la principale source de tokens d'entrée (`/doc/lessons/rag-fundamentals`). Des bases
d'arithmétique suffisent : le coût est une multiplication (tokens × prix) sommée sur les
appels. Aucun fournisseur particulier n'est supposé ; les prix sont des paramètres.

## 📖 Explication complète
- **La formule** : coût = tokens_entrée × prix_entrée + tokens_sortie × prix_sortie, sommé sur les appels. Les prix (par million de tokens) varient fortement selon le modèle — et la sortie coûte typiquement plus cher que l'entrée.
- **Estimer AVANT** : nb requêtes/jour × tokens moyens par requête × prix. Un ordre de grandeur en 5 lignes évite la facture surprise. Compter les tokens réels (tiktoken/API usage) sur un échantillon, pas au doigt mouillé.
- **Les leviers, par ordre de rendement habituel** :
  1. **Réduire le contexte** : meilleur retrieval → moins de chunks injectés (5 pertinents > 20 moyens). C'est le levier n°1 d'un RAG.
  2. **Cacher** : mêmes questions → mêmes réponses ; cache applicatif (hash du prompt) + prompt caching côté fournisseur pour les préfixes stables (system prompt, exemples).
  3. **Adapter le modèle à la tâche** : un petit modèle pour classifier/router, le gros pour générer. Le routage par difficulté économise sans perte visible.
  4. **Contraindre la sortie** : formats courts, max_tokens borné.
  5. **Batch / asynchrone** : regrouper les traitements non urgents (tarifs réduits).
- **Le garde-fou** : un budget/jour avec alerte (ou coupure). Une boucle d'agent buguée à 0,02 €/appel peut coûter une fortune en une nuit.

## 🔧 Exemple simple
500 questions/jour × (4000 tokens in + 300 out). Entrée : 2 M tokens/jour. À ~3 $/M in et ~15 $/M out : ~6 $ + ~2,25 $ ≈ **8 $/jour**, ~250 $/mois. Cinq lignes, zéro surprise.

## 🧭 Exemple guidé
**Énoncé** : réduire de moitié le coût du RAG ci-dessus sans perdre en qualité.
**Raisonnement** : l'entrée domine (6 $ vs 2,25 $) → attaquer le contexte d'abord, puis le cache.
**Solution** :
```
1. Retrieval : passer de 8 chunks moyens à 4 pertinents (reranking) → entrée ~ -50 %.
   Vérifier sur le golden set que la fidélité ne baisse PAS (éval avant/après).
2. Cache : 20 % de questions récurrentes → 20 % d'appels évités.
3. Résultat estimé : ~3 $ + 2,25 $ = 5,25 $/jour, −35 % ; avec cache ~4,2 $/jour, −48 %.
```
**Explication** : chaque levier est MESURÉ (coût ET qualité) — optimiser à l'aveugle dégrade. **Variante** : ajoute un routage (petit modèle pour les questions simples) et recalcule.

## 🤖 Exemple appliqué (IA / data / architecture)
Dans DocSense, le coût par analyse est AFFICHÉ (LLMOps) et le rapport final inclut « coût par question : 0,8 centime, −40 % après reranking ». En entretien, savoir dire « mon système coûte X par requête et voici comment je l'ai réduit » te classe immédiatement.

## ⚠️ Erreurs fréquentes
- Découvrir les coûts sur la facture (pas d'estimation préalable ni de traçage).
- Optimiser le coût sans re-mesurer la QUALITÉ (fidélité qui s'effondre).
- Réduire la sortie alors que l'entrée domine (mauvais levier).
- Pas de garde-fou budget sur les boucles d'agents.

## 🚫 Anti-patterns
- Le gros modèle partout « pour être sûr ».
- Injecter « tout le contexte au cas où ».

## ✍️ Mini-exercice
Estime le coût mensuel d'un assistant interne : 200 questions/jour, 6 chunks de 500 tokens injectés, réponses de 250 tokens. Quel poste domine ?

## 🔥 Exercice plus difficile
Sur un de tes scripts LLM : trace les tokens réels, calcule le coût de 1000 exécutions, applique DEUX leviers (contexte réduit + cache) et mesure le gain de coût ET l'effet qualité sur ton golden set.

## ✅ Correction attendue
La logique : formule → estimation avant → identifier le poste dominant → leviers dans l'ordre du rendement → re-mesurer coût ET qualité → garde-fou. Vérifie : ton estimation colle aux tokens réels (±30 %), chaque optimisation a son avant/après qualité, et un budget borne le pire cas.

## 🎤 Questions d'entretien
- « Comment estimes-tu le coût d'un système LLM ? » → requêtes × tokens moyens (in/out) × prix ; mesurer sur échantillon réel.
- « Ton RAG coûte trop cher, que fais-tu ? » → Réduire le contexte (meilleur retrieval), cacher, router vers un modèle plus petit — en re-mesurant la qualité.
- « Quel est le poste de coût dominant d'un RAG ? » → L'entrée (le contexte injecté), presque toujours.

## 🧾 À retenir
- Coût = tokens in × prix in + tokens out × prix out ; l'entrée domine en RAG.
- Leviers : contexte d'abord, puis cache, puis modèle adapté, puis batch.
- Toujours re-mesurer la qualité après une optimisation ; toujours un garde-fou budget.

## 📚 Vocabulaire
**token in/out** · **prix par million de tokens** · **prompt caching** · **routage de modèle** · **max_tokens** · **batch** · **coût par requête** · **garde-fou budget**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je peux estimer un coût mensuel en 5 lignes avant de coder.
- [ ] Je connais mes leviers dans l'ordre du rendement et je re-mesure la qualité.
- [ ] Mes systèmes ont un traçage de coût et un budget garde-fou.

## 🔗 Liens avec le programme
Mois 8 (jours ~214, 226), mois 10 (workflows/cache), projet final. Leçons liées : `llm-fundamentals`, `llm-observability`, `retrieval-reranking`.
