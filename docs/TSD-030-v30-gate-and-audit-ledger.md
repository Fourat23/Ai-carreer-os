# TSD-030 — Spécification technique : gate v30:check & ledger d'audit V30

Document de spécification technique du Sprint V30. Complète ADR-030 et HSD-030. Tout est PUR,
local, sans réseau, sans nouveau moteur ni nouveau runtime.

## 1. Plan V30 — `docs/architecture/v30-lessons-plan.json`
```json
{
  "sprint": "V30",
  "baselineRef": "<sha CP1>",
  "newLessons": ["technical-documentation", "..."],
  "hardenedLegacy": ["api-design-basics", "express-backend", "authentication",
                     "async-javascript", "statistics-for-ml", "machine-learning-basics",
                     "llm-fundamentals", "agents-fundamentals", "ai-security", "..."],
  "critical": ["api-design-basics", "..."],
  "prereq": { "express-backend": ["api-design-basics", "async-javascript"], "...": [] }
}
```
- `newLessons` : nouvelles Leçons de fond créées en V30 (attendu : peu — qualité > quantité).
- `hardenedLegacy` : leçons historiques corrigées (Backend/API + AI/ML prioritaires + SE).
- `critical` : leçons devant porter au moins un `practiceRef`.
- `prereq` : graphe de prérequis (slug → [slugs]) validé acyclique ; peut référencer des slugs
  hors périmètre V30 (déjà existants).

## 2. Gate `scripts/v30-check.mjs` (structurel)
`npm run v30:check`. Lit le plan V30. Robuste : passe si le plan est absent/vide. Pour chaque
leçon du périmètre (`newLessons ∪ hardenedLegacy`) :
1. **On-ramp** « le problème d'abord » AVANT « objectif ».
2. **Prérequis** présent et non réduit à un lien nu (≥ 12 mots hors liens).
3. **Vocabulaire** présent.
4. **Sections minimales** : objectif, modèle mental, explication, exemple guidé, erreurs
   fréquentes, à retenir, liens.
5. **Placeholders** : aucun (`TODO/FIXME/PLACEHOLDER/à compléter/XXX`).
6. **Liens internes** `/doc/lessons/<slug>` et `/day/<n>` valides.
7. **practiceRefs** présents pour chaque leçon `critical`, tous résolus (exercise/mission/
   playbook/lab).
8. **Graphe de prérequis** : slugs connus + aucun cycle (DFS).
9. **Réel / simulé** : aucun signal bloquant (`lib/pedagogy-audit.mjs` : `blockingSignals`).
10. **Signaux pédagogiques (avertissements, proxys, non bloquants)** : densité conceptuelle
    (termes en gras) et jargon « à froid » (terme critique employé sans glose près du premier
    usage). Alimentent le rapport CP11.

Le gate NE JUGE JAMAIS la profondeur par la longueur. Lecture seule ; exit 1 au moindre
problème structurel bloquant. Il n'est pas une énorme regex fragile : il réutilise les mêmes
primitives que v27/v28/v29.

## 3. Ledger d'audit `docs/architecture/v30-pedagogy-audit.json`
Même format que v20/v27/v28/v29 (validé par `validateAuditLedger`) : items `{ id, kind:
'content', sourcePath, recent, scores (16 dimensions 0-4), notes }`. Scores APRÈS ; l'avant/
après, la matrice complète et l'échantillon d'historiques non modifiées vivent dans
`docs/PEDAGOGICAL-AUDIT-V30.md`. Un test d'intégrité (`tests/v30-pedagogy.test.mjs`) valide
plan + ledger + practiceRefs + graphe. Le ledger ne contient que des items CONFORMES.

## 4. Pratique : réutilisation des runtimes/exercices existants (aucun nouveau runtime)
- **Backend/API** : `practiceRefs` vers `api-router`, `http-status`, `http-method-idempotent`,
  `net-http-status-class`, `validate-user`. Nouveaux exercices `node-js` UNIQUEMENT pour un
  trou réel.
- **AI/ML** : exercices de RAISONNEMENT déterministes en `node-js` (décision/classification),
  jamais une fausse exécution de modèle/LLM. Étiquetés simulé.
- **SQL/Data** : Option A confirmée (raisonnement relationnel `node-js`), pas de runtime SQL.

## 5. Intégration `gates:active` et cycle de vie
- `v30:check` AJOUTÉ à `gates:active`.
- `v26/v27/v28/v29:check` RESTENT actifs (périmètres vivants distincts).
- `v20:pedagogy-check` reste actif. Historique inchangé (v17/v19/v21–v25).

## 6. `practiceRefs` sur les leçons historiques
Champ V27 supporté par `scripts/data/lessons-map.mjs` et recopié par
`generate-curriculum.mjs`. Ajout vers des artefacts EXISTANTS ; aucune création si un artefact
adéquat existe déjà.

## 7. Contraintes de sûreté
Aucun `eval`/`exec`/shell de runtime nouveau ; aucun accès réseau ; scripts purs en lecture
seule ; aucune solution d'exercice ni test privé exposé côté client ; `progress.json`
(gitignoré) sauvegardé puis restauré, jamais committé ; génération déterministe (seul
`generatedAt` varie). Aucune bibliothèque UI, aucune dépendance lourde ajoutée.
