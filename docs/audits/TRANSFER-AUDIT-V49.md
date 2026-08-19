# V49 — Audit de transfert

Le transfert est le signal que l'apprenant MOBILISE un principe dans un contexte
NOUVEAU, pas qu'il récite. Modèle réutilisé : `lib/transfer-challenge.mjs` +
taxonomie T0-T5 (`lib/transfer-taxonomy.mjs`). T5 exige un **pont conceptuel
explicite** ET un **changement de domaine** ET ≥2 étapes ET une question
discriminante.

## État

25 défis de transfert (T4 : 2 · **T5 : 23**), **tous cross-domain**. Gate `v42`
vert (structure, T5 ⇒ pont + cross-domain, refs résolues, auto-cohérence).

## Ajouts V49 (clôture des ruptures)

| Défi | Niveau | Pont conceptuel (source → cible) |
|------|--------|----------------------------------|
| `llm-context-to-eviction` | T5 | budget de contexte LLM → éviction bornée (cache LRU/buffer) |
| `llm-schema-to-api-validation` | T4 | valider une sortie LLM → valider une entrée d'API (douane à la frontière) |
| `patterns-yagni-to-infra` | T5 | pas de pattern inutile → pas de micro-services prématurés (sur-ingénierie) |
| `dl-lr-to-stepsize` | T5 | learning rate → pas d'une optimisation itérative (oscillation/divergence) |
| `dl-overfit-to-generalization` | T4 | écart train/val → toute évaluation in-sample surestime la performance |
| `gitlinux-perms-to-iam` | T5 | permissions de fichier minimales → moindre privilège IAM |
| `archi-scale-shift` | T5 | **une architecture correcte à T0 devient mauvaise à T1** quand une contrainte change |

## Le transfert « far » signature (CP7/CP8)

`archi-scale-shift` matérialise l'exigence du prompt : la bonne réponse **CHANGE**
avec la contrainte. Un compteur mono-ligne est correct sous faible charge (T0) et
devient un point de contention à charge ×100 (T1). L'apprenant doit expliquer
POURQUOI la décision était juste puis ne l'est plus — le cœur du jugement
d'architecture, non mémorisable.

## Couverture par compétence (au moins un transfert)

algo, ds, jsts, python, gitlinux, http, sql, se, archi, patterns, ml, dl, llm,
rag, agents, evalia, secu, cloud — **18/20**. `comm`/`autonomy` (non-code) n'ont
pas de défi de transfert exécutable ; leur transfert s'observe dans la phase
« communication » des scénarios.

## Anti-mémorisation

Les scénarios V48/V49 varient domaine métier, symptômes, ordre des signaux et
faux indices (artefacts `useful:false`), de sorte que la bonne démarche
(observer → hypothèses → diagnostic → décision) ne se réduit pas à un motif appris.
Dette V50 : un mécanisme de variation data-driven pour amplifier la variabilité
sans dupliquer les scénarios.
