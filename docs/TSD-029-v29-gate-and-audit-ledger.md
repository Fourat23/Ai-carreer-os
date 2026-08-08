# TSD-029 — Spécification technique : gate v29:check & ledger d'audit V29

Document de spécification technique du Sprint V29. Complète ADR-029 et HSD-029. Tout est
PUR, local, sans réseau, sans nouveau moteur ni nouveau runtime.

## 1. Plan V29 — `docs/architecture/v29-lessons-plan.json`

```json
{
  "sprint": "V29",
  "baselineRef": "<sha CP1>",
  "newLessons": ["browser-dom-rendering", "react-declarative-model", "..."],
  "hardenedLegacy": ["terminal-shell-filesystem", "git-fundamentals", "sql-foundations",
                     "data-structures-intro", "typescript-basics", "react-fundamentals",
                     "react-hooks-effects", "database-modeling", "testing-foundations",
                     "error-handling", "design-patterns-intro", "architecture-basics"],
  "critical": ["react-declarative-model", "react-state-effects", "..."],
  "prereq": { "react-declarative-model": ["browser-dom-rendering"], "...": [] }
}
```

- `newLessons` : nouvelles leçons Frontend/React, Data/SQL, SE créées en V29.
- `hardenedLegacy` : leçons historiques corrigées en V29 (P0 + domaines cibles).
- `critical` : leçons devant impérativement porter au moins un `practiceRef`.
- `prereq` : graphe de prérequis (slug → [slugs]) validé acyclique. Les prérequis
  peuvent référencer des slugs hors périmètre V29 (déjà existants) ; ils sont vérifiés
  comme slugs de leçons connus.

Toutes les leçons de `newLessons ∪ hardenedLegacy` subissent les mêmes contrôles
structurels que v27/v28.

## 2. Gate `scripts/v29-check.mjs` (structurel)

`npm run v29:check`. Lit le plan V29. Robuste : passe si le plan est absent/vide. Pour
chaque leçon du périmètre (`newLessons ∪ hardenedLegacy`) :

1. **On-ramp** : « le problème d'abord » (variantes tolérées) AVANT « objectif ».
2. **Prérequis** : présent et non réduit à un lien nu (≥ 12 mots hors liens).
3. **Vocabulaire** : présent.
4. **Sections minimales** : objectif, modèle mental, explication, exemple guidé, erreurs
   fréquentes, à retenir, liens.
5. **Placeholders** : aucun (`TODO/FIXME/PLACEHOLDER/à compléter/XXX`).
6. **Liens internes** : `/doc/lessons/<slug>` et `/day/<n>` valides.
7. **practiceRefs** : présents pour chaque leçon `critical`, tous résolus (exercise →
   `data/exercises/<id>.json`, mission → `data/missions/<id>.json`, playbook →
   `data/playbooks/<id>.json`, lab → Labs connus).
8. **Graphe de prérequis** : slugs de leçons connus + aucun cycle (DFS).
9. **Réel / simulé** : aucun signal bloquant (`lib/pedagogy-audit.mjs` :
   `blockingSignals`).
10. **Signaux pédagogiques V29 (avertissements, non bloquants par défaut)** :
    - **densité conceptuelle** : nombre estimé de termes de vocabulaire « gras » nouveaux ;
      alerte au-delà d'un seuil (proxy de surcharge cognitive) ;
    - **jargon non introduit** : termes techniques critiques (DOM, hook, reconciliation,
      transaction, isolation, index, migration, idempotence, coupling, cohesion…)
      employés AVANT toute définition/contextualisation dans la même leçon.
    Ces heuristiques sont explicitement des PROXYS ; elles ne prouvent pas la
    compréhension et ne bloquent pas seules (elles alimentent le rapport CP11).

Le gate NE JUGE JAMAIS la profondeur par la longueur (aucune règle « taille > X =
profond »). Lecture seule ; exit 1 au moindre problème structurel bloquant.

## 3. Ledger d'audit `docs/architecture/v29-pedagogy-audit.json`

Même format que v20/v27/v28 (validé par `validateAuditLedger`) : items `{ id, kind:
'content', sourcePath, recent, scores (16 dimensions 0-4), notes }`. Contient les scores
APRÈS des leçons créées/durcies V29 ; l'avant/après détaillé et l'échantillon
d'historiques non modifiées sont dans `docs/PEDAGOGICAL-AUDIT-V29.md`. Un test
d'intégrité (`tests/v29-pedagogy.test.mjs`) valide plan + ledger + practiceRefs + graphe.
Le ledger ne contient que des items CONFORMES (nouveaux + durcis) ; y injecter des
historiques non corrigées ferait échouer la validation, ce qui masquerait la dette au
lieu de la documenter.

## 4. Pratique : réutilisation des runtimes existants (aucun nouveau runtime)

- **Frontend/React** : `practiceRefs` vers les exercices `react-tsx` (15) et `web`/DOM
  (11) EXISTANTS. Nouveaux exercices React/DOM créés uniquement pour des trous réels, sur
  les runtimes `react-tsx`/`web` déjà enregistrés (`lib/runtime.mjs`).
- **TypeScript** : `practiceRefs` vers les exercices `typescript` (15) EXISTANTS.
- **Data/SQL** : pas de runtime SQL. Les nouveaux exercices « données » utilisent le
  runtime `node-js` (raisonnement relationnel : lignes = tableaux d'objets ; implémenter
  JOIN/GROUP BY/agrégation/déduplication/détection N+1). Contrat d'exercice standard
  (starter faux échouant ≥ 1 test public, référence verte, ≥ 1 test privé, aucune fuite,
  skills connus).
- **SE** : exercices `node-js`/`typescript` (refactoring sûr, test de caractérisation,
  détection de breaking change) selon les trous.

## 5. Intégration `gates:active` et cycle de vie

- `v29:check` AJOUTÉ à `gates:active`.
- `v26:check`, `v27:check`, `v28:check` RESTENT actifs (périmètres vivants distincts :
  v26 = structure 32 leçons Cloud/DevOps ; v27 = durcissement ; v28 = obs/SRE + audit
  rétroactif ; v29 = socle + Frontend/Data/SE). Aucun n'est redondant.
- `v20:pedagogy-check` reste actif (registre humain + scan de danger).
- Historique inchangé (v17/v19/v21–v25).

## 6. `practiceRefs` sur les leçons historiques

L'audit rétroactif ajoute `practiceRefs` (champ V27 supporté par
`scripts/data/lessons-map.mjs` et recopié par `generate-curriculum.mjs`) aux leçons
corrigées, vers des exercices/missions/playbooks EXISTANTS pertinents. Aucune création
d'artefact si un artefact adéquat existe déjà.

## 7. Contraintes de sûreté

Aucun `eval`/`exec`/shell de runtime nouveau ; aucun accès réseau ; scripts purs en
lecture seule ; aucune solution d'exercice ni test privé exposé côté client ;
`progress.json` (gitignoré) jamais modifié par les outils ; génération déterministe
(seul `generatedAt` varie). Aucune bibliothèque UI, aucune dépendance lourde ajoutée.
