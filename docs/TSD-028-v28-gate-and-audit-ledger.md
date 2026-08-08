# TSD-028 — Spécification technique : gate v28:check & ledger d'audit V28

Document de spécification technique du Sprint V28. Complète ADR-028 et HSD-028. Tout
est PUR, local, sans réseau, sans nouveau moteur.

## 1. Plan V28 — `docs/architecture/v28-lessons-plan.json`

```json
{
  "sprint": "V28",
  "baselineRef": "<sha CP1>",
  "newLessons": ["observability-fundamentals", "...", "resilience-patterns"],
  "hardenedLegacy": ["javascript-basics", "http-rest-json", "..."],
  "critical": ["metrics-percentiles", "slo-error-budget", "incident-response", "postmortem-rca"],
  "prereq": { "logging-structured": ["observability-fundamentals"], "...": [] }
}
```

- `newLessons` : nouvelles leçons obs/SRE créées en V28.
- `hardenedLegacy` : leçons historiques corrigées en V28 (audit rétroactif).
- `critical` : leçons devant impérativement porter au moins un `practiceRef`.
- `prereq` : graphe de prérequis (slug → [slugs]) validé acyclique.

Toutes les leçons de `newLessons ∪ hardenedLegacy` sont soumises aux mêmes contrôles
structurels que le gate v27 (on-ramp, prérequis, vocabulaire, sections, liens,
practiceRefs, réel/simulé).

## 2. Gate `scripts/v28-check.mjs` (structurel)

`npm run v28:check`. Lit le plan V28. Robuste : passe si le plan est absent ou vide.
Pour chaque leçon du périmètre (`newLessons ∪ hardenedLegacy`) :

1. **On-ramp** : section « le problème d'abord » (variantes tolérées) AVANT
   « objectif ».
2. **Prérequis** : section présente et non réduite à un lien nu (≥ 12 mots hors
   liens).
3. **Vocabulaire** : section présente.
4. **Sections minimales** : objectif, modèle mental, explication, exemple guidé,
   erreurs fréquentes, à retenir, liens.
5. **Placeholders** : aucun (`TODO/FIXME/PLACEHOLDER/à compléter/XXX`).
6. **Liens internes** : `/doc/lessons/<slug>` et `/day/<n>` valides.
7. **practiceRefs** : présents pour chaque leçon `critical`, et tous résolus
   (exercise → `data/exercises/<id>.json`, mission → `data/missions/<id>.json`,
   playbook → `data/playbooks/<id>.json`, lab → ensemble de Labs connus).
8. **Graphe de prérequis** : slugs connus + aucun cycle (DFS).
9. **Réel / simulé** : aucun signal bloquant (`lib/pedagogy-audit.mjs` :
   `blockingSignals`).

Le gate NE JUGE JAMAIS la profondeur par la longueur. Lecture seule ; exit 1 au
moindre problème.

## 3. Ledger d'audit `docs/architecture/v28-pedagogy-audit.json`

Même format que v20/v27 (validé par `validateAuditLedger`) : items `{ id, kind:
'content', sourcePath, recent, scores (16 dimensions 0-4), notes }`. Contient les
scores APRÈS des nouvelles leçons ET des historiques corrigées ; l'avant/après
détaillé est dans `docs/PEDAGOGICAL-AUDIT-V28.md`. Un test d'intégrité
(`tests/v28-pedagogy.test.mjs`) valide plan + ledger + practiceRefs + graphe.

## 4. Intégration `gates:active` et cycle de vie

- `v28:check` AJOUTÉ à `gates:active`.
- `v26:check` et `v27:check` RESTENT actifs (V28 ne modifie pas les 32 leçons
  Cloud/DevOps ; leurs périmètres restent valides et distincts).
- `v20:pedagogy-check` reste actif (registre humain + scan de danger).
- Historique inchangé (v17/v19/v21/v22/v23/v24/v25).

Justification (anti « cimetière de gates ») : chaque gate actif valide un périmètre
VIVANT et DISTINCT (v26 = structure 32 leçons ; v27 = durcissement débutant des mêmes ;
v28 = obs/SRE + audit rétroactif). Aucun n'est redondant.

## 5. `practiceRefs` sur les leçons historiques

L'audit rétroactif ajoute `practiceRefs` (champ V27 déjà supporté par
`scripts/data/lessons-map.mjs` et recopié par `generate-curriculum.mjs`) aux leçons
historiques corrigées, vers des exercices/missions EXISTANTS pertinents. Aucune
création d'artefact si un artefact adéquat existe déjà.

## 6. Contraintes de sûreté

Aucun `eval`/`exec`/shell de runtime nouveau ; aucun accès réseau ; scripts purs en
lecture seule ; aucune solution d'exercice ni test privé exposé côté client ;
`progress.json` (gitignoré) jamais modifié par les outils ; génération déterministe
(seul `generatedAt` varie).
