# V45 — PROJECT STATE AUDIT (architecture + inventaire)

Audit **lecture seule**. Aucune source métier modifiée. Données mesurées par
`scripts/v45-audit.mjs` → `docs/audits/v45-audit-data.json`. Grille de verdict :
INSUFFISANT · FRAGILE · CORRECT · BON · FORT · EXCELLENT (EXCELLENT rare).

## 1. Cartographie architecturale (CP1)

Flux logique observé :

```
SOURCE DE VÉRITÉ                DERIVED / READ-MODELS (purs)        DOMAIN ENGINES              UI (app/)
data/program.json  ───────────► catalogue, track-aggregate ───────► (aucun 2e moteur) ────────► /, /parcours, /month, /week
curriculum/lessons/*.md         curriculum-graph                                                 /doc/[...slug], /lessons
scripts/data/lessons-map.mjs    learning, learning-experience                                    /skills, /synthese, /revisions
data/exercises/*.json  ───────► exercise + runtime + workspace(-fs) ► exécution sandbox ────────► /lab, /lab/[id]
data/assessments/*.json ──────► assessment (grade)                                               /diagnostics
data/capstones/*.json ────────► capstone (phases/evidence)                                       /capstones, /capstones/[id]
data/transfer-challenges/*.json► transfer-challenge / transfer-taxonomy                          (surfacé via skills)
data/missions/*.json ─────────► mission, mission-state                                           /missions, /missions/[id]
data/playbooks/*.json ────────► (lecture)                                                        /resources
labs: kubernetes/security/…  ─► manifest*, security*, topology*, pipeline*, terminal* engines ─► /kubernetes, /security, /cloud-lab, /pipelines
lib/misconceptions.mjs ───────► practice-coverage, practice-ladder (dérivés)                      /skills
data/progress.json (gitignoré)► progress-store, skill-state, review (SM-2) ───────────────────► toutes surfaces apprenant
```

**Sources de vérité réelles** : `data/program.json` (curriculum généré), `curriculum/lessons/*.md`
(prose), `data/*/*.json` (exercices, assessments, capstones, transferts, missions, playbooks, labs),
`data/progress.json` (état apprenant, gitignoré). `scripts/data/lessons-map.mjs` alimente la génération
de program.json (`npm run generate`).

**Read-models purs (dérivés, sans état propre)** : `practice-coverage`, `practice-ladder`,
`learning-experience`, `curriculum-graph`, `skill-taxonomy`, `transfer-taxonomy`. Vérifié : ils
composent les sources sans persister de vérité concurrente.

**Verdict architecture : BON.** Une seule source de vérité par artefact, principe RÉUTILISER honoré
(pas de second moteur de difficulté/état/catalogue). Points d'attention :
- `lib/` compte **70 modules** : 8 familles « labs » (manifest*, security*, topology*, pipeline*,
  terminal*, cloud-*) portent une part importante du code SIMULÉ — cohérentes mais volumineuses.
- `exercise` + `runtime` + `workspace` + `workspace-fs` forment le cœur d'exécution : coupling
  maîtrisé (workspace pur / workspace-fs impur), CORRECT.
- Pas de cycle bloquant détecté ; le curriculum-graph audité rend **0 blocking** (inputs complets).
- Aucun module « dieu » unique, mais `program.json` est un hub central (attendu pour un curriculum).

Réponse à la question posée : **nous avons encore une architecture compréhensible** — une collection de
moteurs de SIMULATION spécialisés (labs) coexiste avec un noyau curriculum/pratique clair, sans
chevauchement de source de vérité.

## 2. Inventaire canonique (CP2)

| Artefact | Nombre |
|---|---|
| Leçons (`.md`) = program.lessons | **128** |
| Catégories de leçons | 17 |
| Compétences de programme | **20** |
| Jours | 365 |
| Exercices | **262** (tous exécutables : node-js/ts/python3/web/react-tsx) |
| — tests publics / privés | 673 / 337 |
| — exercices hors-contrat (code sans test privé) | **24** |
| Assessments / questions | 16 / 83 |
| Capstones | 5 |
| Défis de transfert | 18 |
| Missions | 42 |
| Playbooks | 45 |
| Misconceptions | 24 |
| Labs (simulés) | 6 familles (kubernetes, cloud-topology, cloud-architecture, security, pipeline, terminal) |
| Gates actifs | 24 |
| Graph : nodes / edges / blocking | 423 / 689 / **0** |
| Tests (fichiers / assertions) | 137 / **1202** |
| Modules `lib/` / scripts / pages UI | 70 / 37 / 36 |

### Distributions clés (mesurées)
- **Difficulté des exercices** : d1=21, d2=142, d3=78, d4=17, d5=4. → **62 % en d1-d2**.
- **Ce que mesurent les exercices** (heuristique difficulté→Bloom) : UNDERSTANDING 137, APPLICATION 75,
  RECALL 21, DIAGNOSIS 15, DEBUGGING 10, PROFESSIONAL_JUDGEMENT 4. → **~60 % rappel/compréhension**,
  **~11 % haut niveau cognitif**.
- **Exercices par compétence de programme** : jsts **215**, algo 25, gitlinux 22, ds 16, python 15,
  http 14, se 6, sql 5. → **12 des 20 compétences ont ZÉRO exercice** (archi, patterns, ml, dl, llm,
  rag, agents, evalia, secu, cloud, comm, autonomy).
- **Leçons par niveau** : L1=14, L2=67, L3=47. Longueur : 122/128 entre 800-1500 mots (quasi uniforme).
- **Leçons sans practiceRefs exécutables** : 14 (dont recursion, design-patterns-intro, git-advanced —
  gaps réels ; interview-preparation, portfolio-github, technical-storytelling — pratique inline
  légitime).

### Fait structurel n°1 (le plus important)
La **pratique exécutable est concentrée à 82 % sur jsts**. Toute la seconde moitié du programme
(data/ML, IA appliquée, cloud, sécurité, archi, carrière) n'a **aucune pratique de code exécutable** ;
elle repose sur leçons + assessments + capstones + défis de transfert + labs SIMULÉS. Ce n'est pas un
bug — c'est la conséquence de la taxonomie (cf. audit V44) — mais c'est LA dette centrale du projet.

## 3. Ce qui est réellement solide
- **Noyau curriculum/pratique JS-TS** : théorie → pratique → diagnostic → transfert réellement bouclée
  et exécutée. **FORT**.
- **Discipline d'ingénierie** : 1202 tests, 24 gates, tsc/build verts, une seule source de vérité,
  read-models purs. **FORT**.
- **Corpus de leçons** : structure pédagogique riche et homogène (intuition-first universelle, modèle
  mental réel sur l'échantillon lu). **BON→FORT** (voir V45-CURRICULUM-AUDIT).

## 4. Ce qui est surévalué par les rapports précédents
- Le terme « strong-junior » appliqué à secu/cloud/archi (corrigé en V44 CP13, mais les rapports
  V40-V43 l'affichaient). **Réel niveau : pratique de code absente.**
- « Couverture » globale : la matrice couvre 20 compétences mais la PRATIQUE réelle n'en couvre que 8.
- Le volume d'exercices (262) masque que 62 % sont d1-d2 et 82 % jsts.

## 5. Ce qui est réellement insuffisant
- Pratique exécutable hors JS/TS : **INSUFFISANT** (0 exercice pour 12 compétences).
- Profondeur cognitive de la pratique : **FRAGILE** (11 % seulement en diagnostic/pro).
- 24 exercices sans test privé : **FRAGILE** (contrat non tenu).
- `generate` non idempotent (`generatedAt`) : **INFORMATIONAL** (cosmétique).
