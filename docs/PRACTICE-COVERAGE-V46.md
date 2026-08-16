# V46 — Practice Coverage Contract

Contrat unique de couverture de pratique (aucune seconde source de vérité :
s'appuie sur `lib/practice-coverage.mjs`, `data/exercises`, `data/program.json`,
`lib/misconceptions.mjs`). Le gate `v46:check` l'applique.

## Axes (par compétence)

`foundation` · `practice` · `autonomy` · `diagnostic` · `variation` · `transfer`
· `professional` (read-model existant), enrichis d'une lecture **exécutable** :

- **executablePractice** : nombre d'exercices exécutant du **vrai code**
  (runtime `node-js` / `python3` / `typescript`, + `web`/`react-tsx` pour l'UI).
- **practiceMode** (nouveau champ optionnel d'exercice) :
  - absent / `LOCAL_EXECUTABLE` : code réellement exécuté dans la sandbox.
  - `SIMULATION` : simulation **déterministe** et **étiquetée** (concept non
    exécutable localement — ex. représentation d'embedding, tool d'agent).
  - `EXTERNAL_ENVIRONMENT_REQUIRED` : non exécutable localement (Cloud/K8s) —
    fourni comme tâche honnête (objectif/prérequis/commandes/evidence/critères).

## Invariants appliqués par `v46:check`

Intégrité (toute la base) — **hard fail** :
1. chaque exercice valide (`validateExercise`) ;
2. chaque exercice a ≥ 1 test ;
3. toute compétence d'exercice est connue et projetable ;
4. `practiceMode`, si présent, appartient à l'ensemble autorisé.

Contrat des exercices V46 (`"sprint": "v46"`) — **hard fail** :
5. ≥ 1 test public ET ≥ 1 test privé ;
6. difficulté 1..5 ; D4/D5 ⇒ ≥ 2 tests (anti-trivial) ;
7. domaine IA/data non exécutable ⇒ `practiceMode` explicite (pas de simulation
   déguisée en réel) ;
8. tâche `EXTERNAL_ENVIRONMENT_REQUIRED` ⇒ champs de tâche recommandés présents.

Rapport (informatif, ne maquille rien) :
- compétences **sans** pratique exécutable listées explicitement ;
- progression du plancher V46 (créés, D3/D4/D5, diagnostic).

## Détection des faux-semblants (exigée par le prompt §5)

- **skill enseignée sans pratique** → listée dans « compétences sans pratique
  exécutable ».
- **skill « operational » sans code exécutable** → le read-model `readiness` ne
  peut pas atteindre `strong-junior` sans autonomie exécutable
  (`executableAutonomy`), déjà garanti par `practice-coverage.mjs`.
- **exercice sans skill / sans test** → hard fail (invariants 2-3).
- **D4/D5 trivial** → hard fail (invariant 6).
- **simulation non étiquetée** → hard fail (invariant 7).
- **professional-ready sans evidence** → géré par les axes `professional` du
  read-model (capstone/mission/lab requis).

## État d'entrée (CP2)

262 exercices ; 12 compétences sans pratique exécutable : archi, patterns, ml,
dl, llm, rag, agents, evalia, secu, cloud, comm, autonomy. SQL exécuté en
simulation JS (à remplacer par du SQL réel, CP4).

## État de sortie

Mis à jour en CP15 (`SPRINT-V46.md` porte la comparaison avant/après).
