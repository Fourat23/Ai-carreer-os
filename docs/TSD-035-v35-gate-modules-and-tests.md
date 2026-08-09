# TSD-035 — Gate v35:check, modules Data/ML & tests

Document de conception technique (Sprint V35). Complète ADR-035 / HSD-035.

## 1. Plan de sprint : docs/architecture/v35-lessons-plan.json
Forme habituelle. `hardenedLegacy` = les 12 leçons burn-down (remplies au fil des CP).
`prereq` déclare leurs prérequis (alimente le Curriculum Graph, réduit les warnings).

## 2. Gate v35:check (scripts/v35-check.mjs)
Adapté de v34. Valide structurellement le périmètre (on-ramp avant objectif, prérequis rédigés,
sections, practiceRefs résolus pour critical, graphe acyclique, réel/simulé). Ajouté à
gates:active. Jamais de comptage figé.

## 3. Modules Data/ML : dataMlModules(program)
Réutilise le mécanisme de module-spec (plage OU liste de jours). Ajouté à buildCatalogue si et
seulement si l'activation est décidée (CP8) ; sinon le parcours reste dans ANNOUNCED_TRACKS.
La durée dérive des dayRefs. Tests de catalogue mis à jour (availableIds) si activation.

## 4. Ledger : docs/architecture/v35-pedagogy-audit.json
Rempli au CP11 (12 leçons durcies, rubrique v20), validé par validateAuditLedger.

## 5. Tests
- tests/v35-pedagogy.test.mjs : plan, prereq acyclique, practiceRefs résolus, ledger.
- tests/v35-e2e.test.mjs : burn-down (12 leçons on-ramp), composition Data/ML, statut du
  parcours (available OU announced selon décision CP8), 0 anomalie bloquante.
- tests/catalogue.test.mjs : mis à jour si data-ml-v1 devient disponible.

## 6. progress.json
Baseline CP0 323604021055588a9528a86875f36598dbdc7758 restaurée à l'identique, gitignorée.
