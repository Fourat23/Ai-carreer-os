# TSD-027 — Spécification technique : gate v27:check, practiceRefs, ledger

Document de spécification technique (Technical Spec Document) du Sprint V27.
Complète ADR-027 et HSD-027. Décrit les contrats de données et le comportement des
outils. Tout est PUR, local, sans réseau, sans nouveau moteur.

## 1. `practiceRefs` (métadonnée de leçon)

Champ optionnel ajouté aux entrées `LESSONS` (`scripts/data/lessons-map.mjs`) :

```js
practiceRefs: [
  { kind: 'exercise', id: 'cloud-cidr-overlap' },
  { kind: 'lab',      id: 'kubernetes' },        // Labs connus (voir 1.1)
  { kind: 'mission',  id: '<mission-id>' },
  { kind: 'playbook', id: '<playbook-id>' },
]
```

- `kind ∈ {exercise, lab, mission, playbook}` ; `id` = identifiant d'un artefact
  EXISTANT.
- Le générateur `scripts/generate-curriculum.mjs` recopie `practiceRefs` tel quel
  dans l'entrée leçon de `data/program.json` (aucune transformation, aucune source
  de vérité nouvelle).

### 1.1 Labs connus (valeurs autorisées pour `kind: 'lab'`)

`terminal` (V20), `pipeline` (V21), `cloud-topology` (V22), `kubernetes` (V23),
`security` (V24), `cloud-architecture` (V25). Le gate valide l'appartenance à cet
ensemble ; ces Labs existent déjà (routes `app/lab`, `app/cloud-lab`, données
`data/{manifests,pipelines,topologies,cloud,security,terminal-tasks}`).

## 2. Résolution des références (gate)

Pour chaque `practiceRef` d'une leçon du périmètre V27 :

- `exercise` → `data/exercises/<id>.json` doit exister ;
- `mission`  → `data/missions/<id>.json` doit exister ;
- `playbook` → `data/playbooks/<id>.json` doit exister ;
- `lab`      → `<id>` ∈ ensemble des Labs connus (1.1).

Toute référence non résolue = échec du gate (« lien mort de pratique »).

## 3. Gate `scripts/v27-check.mjs` (structurel)

`npm run v27:check`. Lit `docs/architecture/v27-lessons-plan.json` (périmètre :
liste des slugs durcis + `practiceRefs` attendus + graphe de prérequis). Pour
chaque leçon du périmètre :

1. **On-ramp débutant** : présence d'une section « le problème d'abord » (libellé
   tolérant aux variantes/emoji) AVANT la section « objectif ».
2. **Prérequis** : section prérequis présente et NON réduite à un seul lien nu
   (au moins une phrase explicative détectable).
3. **Vocabulaire** : section vocabulaire présente.
4. **Structure débutant** : sections minimales (objectif, modèle mental,
   explication, exemple guidé, erreurs fréquentes, à retenir, liens) — réutilise la
   logique de v26-check pour ne pas diverger.
5. **Placeholders éditoriaux** : aucun (`TODO/FIXME/PLACEHOLDER/à compléter/XXX`).
6. **Liens internes** : `/doc/lessons/<slug>` et `/day/<n>` valides (aucun mort).
7. **practiceRefs** : présents pour chaque leçon CRITIQUE déclarée, et tous résolus
   (§2).
8. **Graphe de prérequis** : les `prereq` déclarés pointent vers des slugs de
   leçons existants ; **aucun cycle** (tri topologique).
9. **Réel / simulé** : aucune affirmation d'exécution réelle interdite détectable
   (réutilise le scan de danger de `lib/pedagogy-audit.mjs`).

Le gate NE mesure JAMAIS la profondeur par la longueur. Robuste : passe si le plan
est absent ou vide (comme v26-check). Lecture seule ; exit 1 au moindre problème.

## 4. Ledger d'audit `docs/architecture/v27-pedagogy-audit.json`

Même format que `v20-pedagogy-audit.json`, validé par `validateAuditLedger`
(`lib/pedagogy-audit.mjs`) :

```json
{
  "sprint": "V27",
  "rubricVersion": "1",
  "note": "...",
  "scanGlobs": ["curriculum/lessons/*.md"],
  "items": [
    { "id": "<slug>", "kind": "content",
      "sourcePath": "curriculum/lessons/<slug>.md",
      "recent": true, "scores": { ...16 dimensions... },
      "notes": "avant/après V27" }
  ]
}
```

Un test d'intégrité (`tests/v27-pedagogy.test.mjs`) valide le ledger et la
cohérence plan ↔ leçons ↔ practiceRefs.

## 5. Intégration `gates:active` et cycle de vie

- `v27:check` est AJOUTÉ à `gates:active`.
- `v26:check` RESTE actif (V27 ne réduit pas sa portée : il durcit les mêmes
  leçons ; le périmètre v26 — existence/structure/concepts/unicité — demeure
  pertinent). Aucun gate n'est retiré en V27.
- `v20:pedagogy-check` reste actif (registre humain + scan de danger).
- Historique inchangé (v17/v19/v21/v22/v23/v24/v25).

Rationale : contrairement aux sprints précédents, V27 ne « dépasse » pas le
périmètre d'un gate antérieur par enrichissement de jours ; il AJOUTE une couche
pédagogique. Donc `gates:active` s'AGRANDIT (v27) sans retrait.

## 6. Contraintes de sûreté

- Aucun `eval`/`exec`/shell arbitraire ; aucun accès réseau ; entrées/sorties
  bornées ; scripts purs en lecture seule.
- Aucune solution d'exercice ni test privé exposé côté client.
- `progress.json` (runtime, gitignoré) jamais modifié par les outils.
- Génération déterministe (seul `generatedAt` varie).
