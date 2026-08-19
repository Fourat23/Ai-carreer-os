# V49 CP3 — Validation forensique des apports V48

Objectif : vérifier honnêtement le chiffre annoncé « 71 unités substantielles »
avant d'ajouter quoi que ce soit. Méthode : exécution réelle + inspection
structurelle. **Le dépôt fait foi.**

## Résultat : 71 unités CONFIRMÉES

| Élément | Attendu | Mesuré | Verdict |
|---------|---------|--------|---------|
| Exercices V48 | 36 | **36** | ✅ |
| … avec ≥1 test public | 36 | **36** | ✅ |
| … avec ≥1 test privé | 36 | **36** | ✅ |
| Scénarios V48 | 5 | **5** | ✅ |
| Phases de scénario | — | **35** | ✅ |
| … phases porteuses de décision (diagnosis/decision/remediation/validation) | — | **20** | ✅ |
| … phases d'exposition sans question | 0 | **0** | ✅ |
| **Total unités substantielles** | 71 | **36 + 35 = 71** | ✅ |

## Exécution réelle (rappel `tests/v48-exercises.test.mjs`)

- Référence 100 % verte pour chaque exercice (runtime réellement invoqué :
  node-js / python3 / **python-ds** avec pandas/sklearn RÉELS).
- Starter casse ≥1 test public (pas de fuite de solution).
- python-ds sauté honnêtement si `.venv-ds` absent ; CI principale déterministe.
- 5 scénarios : `validateCapstone` OK + copie de référence gagnante (ratio 1.0).

## Qualité cognitive (échantillon audité)

- `ml-imbalance-metric-trap`, `ml-leakage-temporal` : DIAGNOSTIC réel (la donnée
  est piégée), pas simple application.
- `arch-circuit-breaker`, `arch-consistency-tradeoff` (D5) : décisions sous
  contraintes concurrentes, plusieurs réponses plausibles selon le contexte.
- Scénarios : chaque phase `decision` rejette au moins une option de
  sur-ingénierie / fausse piste (ex. `legacy-service-refactor` rejette
  « micro-services partout »), avec artefacts-bruit (`useful:false`).

## Défauts trouvés

**Aucun défaut bloquant.** Les 36 exercices et 5 scénarios V48 tiennent leurs
promesses. Aucune correction nécessaire.

## Décision (anti-scope-collapse)

CP3 = **NO_COMMIT de correction** (rien à corriger). L'effort budgété pour
« corriger V48 » est **réalloué** vers la clôture des ruptures réelles identifiées
au CP0 : transfert `llm`/`patterns`/`dl`/`gitlinux`, profondeur `dl`, scénarios
`dl`/`secu`, far-transfer (CP4→CP10).
