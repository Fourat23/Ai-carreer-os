# HSD-021 — Pipeline Lab (High-level System Design)

Compagnon de l'ADR-021. Décrit l'architecture **réellement compatible avec le
dépôt** (Next.js App Router, `lib/*.mjs` purs, moteurs V18/V20, progression v3).

## 1. Composants

| Composant | Emplacement (prévu) | Nature |
|---|---|---|
| Modèle de pipeline (pur) | `lib/pipeline.mjs` (CP2) | pur |
| Validateurs de pipeline | `lib/pipeline.mjs` (CP2) | pur |
| Orchestrateur déterministe | `lib/pipeline-engine.mjs` (CP3) | pur (horloge injectable) |
| Actions internes allowlistées | `lib/pipeline-actions.mjs` (CP3) | pur |
| Adaptateur local borné (option) | `lib/pipeline-local.mjs` (CP4) | serveur |
| Catalogue de pipelines | `data/pipelines/*.json` (CP2+) | données |
| Chargement serveur | `lib/pipelines-server.ts` (CP5) | serveur |
| API | `app/api/pipelines/[id]/route.ts` (CP5) | route serveur |
| Surfaces UI | `app/pipelines`, `app/pipelines/[id]` (CP5) | UI lazy |
| Contenu / exercices / missions | `scripts/data/*` + `data/exercises` + `data/missions` (CP6-7) | éditorial |
| Gate V21 | `scripts/v21-check.mjs` (CP6) | script |

Réutilisés sans duplication : `lib/terminal*.mjs` (primitives d'exécution bornée),
`lib/mission*.mjs` (missions V18), `lib/pedagogy-audit.mjs` (audit V20),
`lib/exercise*.mjs`, `lib/catalogue.mjs`, `lib/progress-store.mjs`,
`lib/search.mjs`, `curriculum/glossary`, `lib/backup.mjs`.

## 2. Flux de données

1. **Définition** : un pipeline (`data/pipelines/*.json`) déclare trigger,
   filtres, stages, jobs (`needs`, `condition`, actions), artefacts, cache,
   environnement, approbation, liens pédagogiques.
2. **Déclenchement** : un événement simulé + le contexte (branche/tag) → le
   moteur résout si le pipeline se lance.
3. **Exécution** : l'orchestrateur trie le DAG, exécute chaque action interne
   (déterministe, sur fixture), agrège statuts et logs bornés (secrets masqués),
   produit des métadonnées d'artefacts/caches.
4. **Restitution** : le Pipeline Lab affiche stages/jobs/statuts/logs/artefacts/
   diagnostic ; l'apprenant relance, annule, réinitialise.
5. **Preuve** : la réussite passe par les moteurs d'exercice/mission existants.

## 3. Surfaces UI

- `/pipelines` : catalogue (filtres parcours/difficulté/compétence/trigger/statut,
  URL partageable, compteur, reset).
- `/pipelines/[id]` : détail — contexte/config à gauche, **visualisation DAG**
  (stages/jobs/dépendances) au centre, **diagnostics/logs** à droite ; boutons
  Lancer (événement) / Annuler / Relancer / Reset ; artefacts, cache,
  environnement, approbation ; liens cours/exercices/missions/glossaire.
- Grand écran : trois zones exploitant la largeur. Écran étroit : navigation
  segmentée, une zone active, pas d'overflow horizontal, focus visible,
  `aria-live` pour les statuts, `prefers-reduced-motion` respecté.
- Le moteur et les composants lourds sont **lazy** ; absents de `/`, `/calendar`,
  `/parcours`, `/day/[id]`.

## 4. Orchestration (pur)

`resolveTrigger(pipeline, event) → bool` · `topoOrder(jobs) → order | cycleError`
· `runPipeline(pipeline, ctx, {clock}) → PipelineRun` (statuts par job,
agrégation, logs bornés, masquage, artefacts). Déterministe : mêmes entrées →
même sortie ; durée via horloge injectable.

## 5. Actions internes (allowlist)

`validate-config`, `lint`, `test`, `build`, `artifact-check`, `cache-check`,
`branch-policy`, `approval`, `secret-scan`, `status-aggregate`. Chaque action est
une **fonction pure** `(job, ctx) → { status, logs, artifacts? }` sur des
**fixtures** déclarées dans le job. Aucune action ne reçoit de commande libre.

## 6. Sécurité & anti-fuite

Actions allowlistées ; secrets masqués (`***`) dans logs et vue publique ; aucune
solution/test privé/référence/secret indexé ou renvoyé au client ; chemins bornés ;
adaptateur local plus restrictif que le terminal (exécutables fixés, pas
d'argument libre, pas de réseau, pas de mutation `data/`). Docker optionnel,
honnête.

## 7. Données & persistance

Runs **non persistés** dans `progress.json` (volatils). Preuves via moteurs
existants. Sauvegarde : aucune donnée volatile (runId/logs bruts/artefacts).
Migration additive.

## 8. Observabilité & nettoyage

Logs structurés bornés ; historique borné en mémoire de session ; aucun polling
permanent (run synchrone borné, annulation par abandon de requête) ; workspace de
l'adaptateur local supprimé après usage.

## 9. Intégration existante

- **Exercices** : contrat V7 (`data/exercises`), lien jour↔exercice.
- **Missions** : moteur V18.
- **Parcours** : enrichissement de Systems & Cloud (jours d'ancrage réels).
- **Recherche/glossaire/révisions/sauvegarde** : additif.
