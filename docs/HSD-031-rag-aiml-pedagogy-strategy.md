# HSD-031 — Spécification pédagogique : RAG, IA appliquée & Curriculum Graph

Document de spécification humaine du Sprint V31. Complète ADR-031 (décisions) et TSD-031
(spécification technique). Décrit CE QUE doivent enseigner les leçons durcies de la chaîne RAG/
IA appliquée, et COMMENT le Curriculum Graph rend la cohérence auditable.

## 1. Contrat de leçon V31 (rappel V27→V30)
Chemin néophyte : **concret → intuition → vocabulaire → modèle mental → mécanisme →
formalisation → exemple → pratique → cas métier → limites/échecs → synthèse**. Sections quand
pertinentes : `🌍 Le problème d'abord` → `🎯 Objectif` → `🧩 Prérequis` → `📚 Vocabulaire` →
`🧠 Modèle mental` → explication → exemples gradués → `⚠️ Erreurs fréquentes` →
(`🚨 Que faire dans ce cas ?`) → pratique + `practiceRefs` → `🏢 Cas métier` → entretien →
`🧾 À retenir` → `🔗 Liens`. La structure sert la compréhension ; la longueur n'est pas la
profondeur.

## 2. Critère néophyte + maths honnêtes (non négociable)
« En ne connaissant que les prérequis annoncés, un débutant peut-il comprendre POURQUOI la
brique existe, comment elle se relie à la précédente, ce qui se passe sous le capot, ce qui
peut échouer, et comment diagnostiquer ? » Les mathématiques s'expliquent par l'INTUITION avant
la notation :
- **cosine similarity** : d'abord « deux textes proches pointent dans la même DIRECTION »,
  ensuite la formule si utile.
- **precision/recall (RAG)** : d'abord faux positifs/négatifs du retrieval, ensuite
  formalisation.
Aucun « magic happens here ».

## 3. La chaîne RAG à rendre suivable (CP3–CP4)
Ordre pédagogique cible (un débutant doit pouvoir le suivre) :
`pourquoi un LLM ne connaît pas les documents privés` → `pourquoi tout mettre dans le prompt ne
scale pas` → **embeddings** (le texte devient des nombres qui capturent le SENS) → **similarité**
(cosine = proximité de direction) → **chunking** (découper, overlap, metadata) → **vector store /
index** (retrouver vite les k plus proches, ANN) → **retrieval top-k** → **lexical vs semantic /
hybrid** → **reranking** → **contexte** → **génération** → **évaluation RAG** (retrieval quality
vs generation quality) → **amélioration du retrieval**.

Spécifications par leçon :
- **rag-fundamentals** (P0, hub) : le problème (LLM sans mémoire des docs privés), le pipeline
  DOCUMENT→CHUNKS→EMBEDDINGS→INDEX→QUERY→RETRIEVAL→CONTEXT→GÉNÉRATION suivi de bout en bout, un
  exemple complet.
- **embeddings** : « deux phrases, mots différents, même sens : comment une machine mesure la
  proximité ? » → vecteur, espace, direction ; où l'analogie cesse.
- **chunking-strategies** : trop petit / trop gros / overlap / metadata ; le compromis.
- **vector-databases** : index, ANN (approximation), top-k ; « vector DB ≠ RAG ».
- **retrieval-reranking** : lexical (BM25 conceptuel) vs sémantique, hybrid, filtres,
  reranking, query rewriting/multi-query.
- **rag-evaluation** & **ai-evaluation** : séparer **retrieval failure** (le bon document
  n'est pas retrouvé) de **generation failure** (le document est là mais la réponse est
  fausse) ; groundedness/faithfulness/answer relevance ; dataset d'éval, éval offline/
  régression. Méthode de diagnostic.

## 4. Structured outputs, tools & agents (CP5)
Progression : LLM simple → sortie structurée → validation de schéma → function/tool calling →
outil → état → décision → boucle → agent → orchestration. Faire comprendre : « un agent n'est
pas un modèle plus intelligent ». Expliciter les failure modes (JSON cassé 5 % du temps, boucle,
arguments d'outils hallucinés, croissance du contexte, permissions) et les garde-fous.

## 5. Sécurité IA appliquée (CP6)
Relier à `ai-security` (V30). `prompt-injection-defense` : injection directe/indirecte,
contenu récupéré non fiable (« le document du RAG contient : Ignore previous instructions… »),
exfiltration, excès d'autonomie, output validation, human-in-the-loop, least privilege,
allowlist. `prompt-engineering` : le prompt comme spécification, pas incantation.

## 6. Frontière réel/simulé (non négociable)
Aucun vrai embedding/vector DB/LLM/appel réseau. Les exemples et exercices sont des
raisonnements DÉTERMINISTES étiquetés (« simulé : entraîne le raisonnement, pas une vraie
mesure »). Aucun résultat fictif présenté comme une vraie métrique.

## 7. Curriculum Graph (CP8)
Read-model dérivé (cf. TSD-031) permettant de DÉTECTER : cycle, prérequis mort, concept
enseigné jamais pratiqué, pratique sans théorie, compétence sans pratique/preuve, nœud
orphelin, cul-de-sac, trou de parcours. C'est un outil d'AUDIT au service de la cohérence
pédagogique, pas une fonctionnalité utilisateur.

## 8. Pratique (CP7)
Auditer les 198 exercices avant d'en créer. Créer uniquement les trous réels de la chaîne RAG
(chunking, cosine/top-k ranking, retrieval-failure diagnosis, structured-output validation).
Déterministes, sandboxés, sans secret, starter faux non trivial, référence 100 % verte, tests
privés non exposés, simulation étiquetée.

## 9. Rôle de CP11 (quality gate qui tente de RÉFUTER)
Ré-auditer les leçons V31, un échantillon multi-époques, les dettes V30 ; walkthroughs néophyte
réels (« je ne sais pas ce qu'est un embedding » → « je peux expliquer et diagnostiquer un RAG
simple » ; « je connais le LLM » → « je distingue tool calling et agent et leurs failure
modes »). Produire `docs/PEDAGOGICAL-AUDIT-V31.md` ; ne rien cacher derrière une moyenne ; les
scores restent des proxys.

## 10. Anti-slop
Interdits : jargon front-loadé, analogie trompeuse, définition circulaire, « il suffit de » sur
un sujet complexe, exemple pseudo-réaliste vide, concept masqué sous une analogie, fausse
exécution présentée comme réelle, leçon/exercice sans besoin réel.
