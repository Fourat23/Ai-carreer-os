# V45.2 — Stabilité des chaînes curriculaires

> Verdict de stabilité par chaîne, du point de vue du **contenu** (audit
> read-only). Échelle :
> - **STABLE** : ordre et contenu sains, rien à changer côté curriculum.
> - **ADDITIVE_CHANGES_EXPECTED** : stable, mais des AJOUTS amélioreraient
>   (nouvelle leçon, pratique exécutable) sans rien retirer.
> - **ORDER_FIX_NEEDED** : le contenu est bon mais l'ORDRE gagnerait à bouger.
> - **RESTRUCTURE_REQUIRED** : refonte nécessaire (fusion/scission/réécriture).

## Verdicts par chaîne (17)

| # | Chaîne | Verdict | Justification (fondée sur lecture) |
|---|--------|---------|-----------|
| 01 | Fondations | **STABLE** | Prérequis zéro honnêtes, Barre A+B fortes, aucun doublon. |
| 02 | JS/TS | **STABLE** | Socle exécutable réel ; recouvrement TS basics/frontend défendable. |
| 03 | Web Platform | **STABLE** | Chaque leçon distincte ; Barre B moyenne mais contenu complet. |
| 04 | React/Frontend | **STABLE** | Léger chevauchement nextjs-rendering/server-client, sans gravité. |
| 05 | Backend/API | **STABLE** | Progression L1→L3 propre, exos exécutables. |
| 06 | SQL/Data | **ADDITIVE_CHANGES_EXPECTED** | SQL parfait ; pandas (040) à pratique plus mince ; NoSQL modélisation à étoffer. |
| 07 | Git | **STABLE** | Court mais suffisant, réutilisé transversalement. |
| 08 | Linux/systèmes | **ADDITIVE_CHANGES_EXPECTED** | Contenu A ; manque un environnement Linux exécutable (Barre B). |
| 09 | Réseau | **ADDITIVE_CHANGES_EXPECTED** | Contenu A ; gestes `dig`/`curl` non exécutés en plateforme. |
| 10 | SW-eng/archi | **ADDITIVE_CHANGES_EXPECTED** | Dense (13 leçons) ; `observability-logging` (055) recoupe 079-080. |
| 11 | Observabilité/SRE | **ADDITIVE_CHANGES_EXPECTED** | Barre A exceptionnelle ; log structuré éclaté sur 055/080/123 (consolider). |
| 12 | Python/data | **ADDITIVE_CHANGES_EXPECTED** | Un seul palier Python avant ML : ajouter une 2e leçon (venv/packaging). |
| 13 | Stats/ML | **ADDITIVE_CHANGES_EXPECTED** | Contenu A ; pratique ML exécutable partielle. |
| 14 | Deep Learning | **ADDITIVE_CHANGES_EXPECTED** | 2 leçons pour un vaste sujet (choix applied) ; entraînement non exécuté. |
| 15 | LLM/RAG | **ADDITIVE_CHANGES_EXPECTED** | Cœur du parcours, excellent ; ai-eval/rag-eval (072/073) à dédupliquer. |
| 16 | Agents/IA appliquée | **ADDITIVE_CHANGES_EXPECTED** | ai-security/prompt-injection (076/077) partagent une attaque ; frontière à clarifier. |
| 17 | DevOps→emploi | **ORDER_FIX_NEEDED** | `docker-containers` (120) et `ci-cd` (121) doublonnent 097-103 : à fusionner/repositionner. |

## Synthèse

- **STABLE (rien à changer)** : 6/17 chaînes (01, 02, 03, 04, 05, 07) — tout le
  socle logiciel de base.
- **ADDITIVE_CHANGES_EXPECTED** : 10/17 — stables en contenu, améliorables par
  **ajout** (surtout de pratique exécutable Barre B) ou consolidation légère.
- **ORDER_FIX_NEEDED** : 1/17 (chaîne 17) — à cause des récaps Docker/CI-CD
  redondants ; réordonner/fusionner suffit.
- **RESTRUCTURE_REQUIRED** : **0/17.** Aucune chaîne ne nécessite de refonte.

**Verdict de stabilité globale du curriculum** : **STABLE avec évolutions
additives attendues**. Le squelette est solide et n'a pas besoin d'être défait ;
les évolutions V46 sont surtout des **ajouts** (pratique exécutable ML/DL/infra,
2e leçon Python) et **une consolidation** (doublons DevOps + log structuré) —
jamais une démolition. Détail priorisé dans `V45-2-ACADEMIC-DEBT.md`.
