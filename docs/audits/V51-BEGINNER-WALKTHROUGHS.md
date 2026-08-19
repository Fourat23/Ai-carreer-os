# V51 — Walkthroughs apprenant (rétention & progression)

Douze parcours représentatifs. Pour chacun : « Pourquoi cette activité
aujourd'hui ? Ai-je les prérequis ? Qu'est-ce qu'elle réactive ? Pourquoi cette
difficulté ? À quoi me prépare-t-elle ? Charge réaliste ? ». Toute réponse
exigeant une connaissance non encore enseignée = anomalie (aucune trouvée).

1. **Début absolu (d1)** — shell/Git, `greeting` (warm-up JS). Aucun prérequis ;
   charge légère ; prépare le terminal et le premier code. OK.
2. **JS (d5)** — `js-conditions`. Prérequis : variables (d4). Difficulté D2
   (application). Prépare les boucles/fonctions. OK.
3. **Frontend (M4)** — React après JS/TS consolidés ; réactive JS (d95
   `incident-severity`). D3. Prépare l'état et le rendu. OK.
4. **Backend/API (d50+)** — HTTP/API après JS ; `sqlite-*` en appui. D3→D4.
   Réactive HTTP en S2 (d217, d294…). Prépare les services et incidents. OK.
5. **SQL (M5)** — `sqlite-index-explain` (EXPLAIN réel). Prérequis SQL (d55).
   D4. Réactivé en S2 (d168, d266, d315). Prépare l'incident de latence. OK.
6. **Python (M5)** — après algo/DS ; `pdx-*` (pandas réel). Réactivé fortement en
   S2 (22 jours). Prépare la data/ML. OK.
7. **Data/ML (M6)** — `skl-pipeline-cv` (fuite en CV). Prérequis python (d82).
   D5. Réactive python. Prépare le scénario fraude ML. OK.
8. **RAG (M8)** — `rag-retrieval-vs-generation`. Prérequis LLM/embeddings (M7).
   D4. Prépare le scénario d'hallucination. OK.
9. **Agents (M10)** — `agent-excessive-agency` (D5, garde-fou). Prérequis agents
   (d274) + se. Réactive se (d284). Prépare le scénario de boucle d'outil. OK.
10. **Architecture (M10-11)** — `arch-circuit-breaker` (D5). Prérequis archi (d76),
    réactivé tout au long (15 jours en S2). Prépare le refactor legacy. OK.
11. **Sécurité/Cloud (M9-11)** — `sec-*` + labs cloud EXTERNES honnêtes. secu
    réactivé (d133). Cloud = contrat externe explicite. Prépare l'incident de
    moindre privilège. OK.
12. **Dernier trimestre (M12)** — intégration : portfolio, communication
    (post-mortems, ADR), autonomie. Non-code, évalué qualitativement. Réactive dl
    (d308) et rag (d308). Charge légère et intentionnelle (synthèse). OK.

## Réactivations V51 rencontrées (retrieval espacé)
gitlinux (d140/196/259), http (d147), ds (d133/259), archi (d175), python (d238),
algo (d224), secu (d133), patterns (d140), ml (d217), se (d238), dl (d308),
rag (d308). Chacune tombe sur un **jour de révision existant**, dans un écart de
pratique, avec un exercice **déjà introduit** — rien de neuf à apprendre, du
retrieval.

## Anomalies détectées
Aucune activité n'exige une connaissance non enseignée. Seule subtilité héritée :
l'échauffement JS/shell des jours 1-2 précède l'introduction formelle (on-ramp
délibéré). Aucune rupture bloquante ; `v51:check` vert.
