<!-- keep -->
# Leçon — RAG : retrieval-augmented generation

## 🌍 Le problème d'abord
Tu veux un assistant qui répond à des questions sur les documents de TON entreprise : contrats,
procédures, notes internes. Mais un LLM n'a jamais vu ces documents — ils sont privés — et si
tu essaies de « tout coller dans le prompt », ça ne rentre pas (des milliers de pages) et ça
coûte une fortune à chaque question. Comment faire répondre le modèle sur des connaissances
qu'il ne possède pas, sans le ré-entraîner ? L'idée est simple une fois formulée : à chaque
question, RETROUVER les quelques extraits pertinents parmi tes documents, et les DONNER au
modèle avec la question. C'est le **RAG** (retrieval-augmented generation). Cette leçon te fait
construire ce pipeline étape par étape — et surtout savoir le DÉBUGGER, ce qu'un framework
boîte noire ne t'apprend jamais.

## 🎯 Objectif
Comprendre POURQUOI le RAG existe, suivre son pipeline complet (ingestion → chunking →
embeddings → index → retrieval → génération), et surtout savoir **diagnostiquer** un RAG qui
répond mal en séparant échec de retrieval et échec de génération.

## 🧩 Prérequis
Tu dois comprendre ce qu'est un LLM et ses limites — fenêtre de contexte bornée, connaissances
figées, hallucination (`/doc/lessons/llm-fundamentals`) — car le RAG existe précisément pour
les contourner. Une intuition des embeddings (le texte transformé en vecteurs de sens,
`/doc/lessons/embeddings`) aide, mais est aussi rappelée ici. Les notions de chunking, index et
retrieval sont approfondies dans leurs leçons dédiées.

## 🧠 Modèle mental
Le RAG, c'est « un examen à livre ouvert » pour le LLM. Plutôt que d'exiger qu'il SACHE tout
(mémoire figée) ou de lui donner toute la bibliothèque (contexte trop petit), on lui remet, à
chaque question, les BONNES PAGES : `DOCUMENT → CHUNKS → EMBEDDINGS → INDEX → QUERY →
RETRIEVAL → CONTEXTE → GÉNÉRATION`. Le modèle répond alors ANCRÉ dans des sources citables et à
jour. Corollaire capital pour le débogage : un RAG a DEUX moitiés indépendantes — retrouver le
bon passage (retrieval) et bien s'en servir (génération) — et l'échec vient presque toujours de
la première.

## 💡 Pourquoi c'est important
Le RAG est le pattern n°1 de l'IA en entreprise : répondre à des questions sur des connaissances PRIVÉES (docs internes, contrats, procédures) que le modèle n'a jamais vues. C'est le savoir-faire le plus demandé du marché junior IA — et ton projet 6 comme ton projet final en sont. Le comprendre étape par étape (et non via un framework boîte noire) est ce qui te permettra de le DÉBUGGER, de l'AMÉLIORER et de le défendre en entretien.

## Explication complète

### Le problème que le RAG résout
Le LLM ne connaît que son corpus d'entraînement (figé, public) et sa fenêtre de contexte (bornée). Tes 10 000 documents internes n'y tiennent pas, et les réentraîner dedans (fine-tuning) est coûteux, lent, et mauvais pour la fraîcheur. L'idée RAG : à chaque question, RETROUVER les extraits pertinents et les INJECTER dans le contexte — le modèle répond alors ANCRÉ dans tes sources, citables et à jour.

### Le pipeline, étape par étape
1. **Ingestion** : extraire le texte des documents (PDF, Markdown, HTML) — l'étape ingrate et décisive (un PDF mal extrait empoisonne tout l'aval).
2. **Chunking** : découper en morceaux (chunks). Trop gros : du bruit dans le contexte et un retrieval flou. Trop petit : le sens se fragmente. Stratégies : taille fixe + chevauchement (overlap, pour ne pas couper une idée), ou par STRUCTURE (sections, titres) — souvent meilleure sur la doc technique. Chaque chunk garde ses **métadonnées** (source, page, section) : elles fondent les citations.
3. **Embeddings** : chaque chunk devient un VECTEUR (une liste de nombres) qui encode son SENS — deux textes proches en sens sont proches en vecteurs. C'est ce qui permet de chercher « congés payés » et trouver « droits aux vacances ».
4. **Indexation** : les vecteurs vont dans une base vectorielle (Chroma, sqlite-vec) qui sait chercher les plus proches rapidement.
5. **Retrieval** : la question est vectorisée, on récupère les k chunks les plus similaires (similarité cosinus). Le retrieval VECTORIEL attrape le sens mais rate parfois les termes exacts (références, noms propres) → on le COMBINE avec une recherche LEXICALE (BM25/FTS5) : c'est l'**hybrid search**, fusionnée par RRF. Un **reranker** peut ensuite réordonner finement le top-20 vers un top-5.
6. **Génération** : les chunks retenus sont injectés dans le prompt avec des consignes strictes : répondre UNIQUEMENT depuis les sources, CITER, et REFUSER si l'information n'y est pas (le refus est une feature, pas un échec).

### Le modèle mental de debugging
Quand un RAG répond mal, DEUX suspects distincts : le **retrieval** (le bon passage a-t-il été retrouvé ? — mesurable sans LLM : rappel@k) ou la **génération** (le passage était là, mais la réponse le trahit — fidélité). Toujours diagnostiquer dans cet ordre : 80 % des échecs sont côté retrieval. Cette séparation est LA réponse structurée attendue en entretien (« ton RAG répond mal, tu fais quoi ? »).

### Les six décisions de conception (et leur juge)
Taille des chunks, overlap, k, modèle d'embedding, format du prompt, seuil/refus — chacune influence la qualité, et AUCUNE ne se règle au feeling : le juge est l'ÉVALUATION (golden set, métriques — leçon ai-evaluation.md). Un RAG sans éval est un pari.

## Concepts clés
Ingestion · chunking (taille fixe / structure, overlap) · métadonnées · embedding · similarité cosinus · vector DB · top-k · recherche lexicale (BM25) · hybrid search, RRF · reranking · génération ancrée, citations, refus · rappel@k, fidélité · fine-tuning vs RAG (fraîcheur, coût, traçabilité).

## 🧭 Exemple guidé
Question : « Quelle est la durée de préavis en cas de démission ? »
- Vectorisée → top-4 chunks (dont « contrat-type.pdf, p.12, §Préavis... deux mois... »).
- Prompt : consignes + les 4 chunks sourcés + la question.
- Réponse : « Le préavis est de deux mois [contrat-type.pdf, p.12]. »
Si la réponse est fausse : le chunk p.12 était-il dans le top-4 ? NON → problème de retrieval (chunking ? embedding ? hybride ?). OUI → problème de génération (prompt ? fidélité ?). Le diagnostic binaire, toujours.

## ⚠️ Erreurs fréquentes
- Empiler un framework sans comprendre : au premier échec, tu es aveugle. (Ton premier RAG : SANS framework.)
- Ne jamais LIRE ses chunks (ils sont souvent pleins de débris d'extraction).
- Chunker sans overlap ni structure : des idées coupées en deux.
- Zéro évaluation : on « améliore » au feeling, souvent en aggravant.
- Pas de refus prévu : le système invente dès que le corpus ne sait pas — l'hallucination revient par la porte.

## 🔗 Liens avec le programme
Le RAG mobilise TOUT ton apprentissage : ingestion = pipeline de données (mois 5), retrieval = algorithmique et index (mois 1-2), API = mois 3, évaluation = ML (mois 6), architecture = composants remplaçables (mois 10). DocSense (mois 11-12) est un RAG évalué avec dashboard qualité — et « explique-moi ton pipeline RAG et ses chiffres » sera LA pièce maîtresse de tes entretiens.

## Mini-exercice
Sans framework, sur 5 documents texte : découpe en chunks (500 caractères, overlap 100), obtiens leurs embeddings via API, implémente la similarité cosinus TOI-MÊME, retrouve le top-3 pour 5 questions, et VÉRIFIE À L'ŒIL si le bon passage y est. Tu viens de construire — et surtout de savoir DIAGNOSTIQUER — un RAG.

## 📚 Vocabulaire
**chunk / chunking / overlap** · **embedding** · **similarité cosinus** · **vector DB** · **top-k** · **BM25 / recherche lexicale** · **hybrid search / RRF** · **reranking** · **ancrage (grounding)** · **citation** · **rappel@k** · **fidélité**.

## 🧾 À retenir
Le RAG contourne les limites du LLM (connaissances figées, contexte borné) en retrouvant à chaque question les extraits pertinents d'un corpus privé et en générant une réponse ANCRÉE, citée, avec refus possible. Le pipeline — ingestion, chunking, embeddings, retrieval (hybride, reranké), génération — comporte six décisions de conception dont le seul juge est l'évaluation. Et le debugging suit toujours le même arbre : retrieval d'abord, génération ensuite.
