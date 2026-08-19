# V48 — Audit de pratique (matrice avant/après)

Dérivé des artefacts réels. Distingue RÉEL (local exécutable), TOOLING
(`python-ds` opt-in réel), SIMULÉ/PROXY (étiqueté), EXTERNAL (infra requise).

## Distribution de difficulté (exercices)

| | D1 | D2 | D3 | D4 | D5 | total |
|--|----|----|----|----|----|-------|
| Avant V48 | 21 | 150 | 107 | 43 | 12 | 333 |
| **Après V48** | 21 | 150 | **119** | **61** | **18** | **369** |
| Δ V48 | 0 | 0 | +12 | +18 | +6 | +36 |

Unités substantielles V48 : **71** (36 exercices + 35 phases de scénario).

## Scénarios professionnels (moteur de capstone réutilisé)

| | avant | après |
|--|-------|-------|
| Capstones | 5 | **10** |
| Domaines | AI-RAG, Backend, Cloud, Data-ML, Frontend | + **Agents, LLM, Architecture-refactor** |

Chaque scénario : divulgation progressive (7 phases), artefacts avec bruit
(`useful:false`), debrief avec faux indices / alternatives / trade-offs.

## Couverture par domaine V48

| Domaine | Ajouté V48 | Nature | D4/D5 |
|---------|-----------|--------|-------|
| Data/ML | 10 exos + 1 scénario | RÉEL (pandas/sklearn) + python3 | 7 D4/D5 |
| LLM | 6 exos + 1 scénario | RÉEL local (aucun modèle) ; 1 PROXY | 3 |
| RAG | 3 exos + 1 scénario | RÉEL local | 4 |
| Agents | 4 exos + 1 scénario | RÉEL local | 3 |
| Architecture/Patterns | 13 exos + 1 scénario | RÉEL local (décisions) | 9 |

## Frontière d'honnêteté (inchangée, maintenue)

- **Aucun appel de modèle réel** : llm/rag/eval opèrent sur entrées/sorties
  fournies ; ancrage et injection en `PROXY`.
- **Aucune fausse infra** : cloud/K8s/Docker restent `EXTERNAL_ENVIRONMENT_REQUIRED`.
- **Data/ML réel** mais opt-in : `TOOLING_ENVIRONMENT_REQUIRED` si `.venv-ds` absent ;
  CI principale déterministe.

## Misconceptions (feedback)

46 → **55** (+9). Dette comblée : `algo` et `ds` ont désormais une misconception
dédiée. Invariant : 0 exercice partagé entre deux misconceptions, 0 référence
morte (gate v42).

## Readiness (synthèse)

Boucle professionnelle complète : ~7 → **10** compétences. Détail et limites :
`docs/PROFESSIONAL-READINESS-V48.md`.
