# V49 — Couverture professionnelle & readiness (clôture)

Matrice dérivée (`lib/professional-coverage.mjs`, ledger
`docs/audits/v49-coverage-ledger.json`), recomputable et vérifiée sans dérive par
`v49:check`. Readiness **conservatrice** : le volume d'exercices n'est jamais le
critère ; une compétence n'est « PROFESSIONAL_READY » que si ses **8 dimensions**
sont satisfaites par des artefacts réels (FOUNDATION, PRACTICE, AUTONOMY,
DIAGNOSTIC, VARIATION, TRANSFER, PROFESSIONAL, EVIDENCE).

## Matrice des 20 compétences

| Compétence | Statut | ex | D4 | D5 | transfer | scén. | runtime | boucle |
|-----------|--------|----|----|----|----------|-------|---------|:---:|
| algo | PROFESSIONAL_READY | 25 | 5 | 0 | 3 | 1 | REAL | ✓ |
| ds | PROFESSIONAL_READY | 16 | 1 | 0 | 2 | 1 | REAL | ✓ |
| jsts | PROFESSIONAL_READY | 217 | 4 | 0 | 1 | 1 | REAL | ✓ |
| python | PROFESSIONAL_READY | 39 | 12 | 2 | 1 | 1 | REAL | ✓ |
| gitlinux | PROFESSIONAL_READY | 22 | 1 | 0 | 1 | 1 | REAL | ✓ |
| http | PROFESSIONAL_READY | 14 | 2 | 2 | 5 | 1 | REAL | ✓ |
| sql | PROFESSIONAL_READY | 13 | 5 | 2 | 5 | 1 | REAL | ✓ |
| se | PROFESSIONAL_READY | 14 | 6 | 3 | 6 | 4 | REAL | ✓ |
| archi | PROFESSIONAL_READY | 18 | 9 | 5 | 7 | 1 | REAL | ✓ |
| patterns | PROFESSIONAL_READY | 9 | 1 | 1 | 1 | 1 | REAL | ✓ |
| ml | PROFESSIONAL_READY | 25 | 12 | 2 | 1 | 3 | REAL | ✓ |
| dl | PROFESSIONAL_READY | 12 | 5 | 1 | 2 | 1 | REAL | ✓ |
| llm | PROFESSIONAL_READY | 10 | 3 | 2 | 2 | 3 | REAL* | ✓ |
| rag | PROFESSIONAL_READY | 11 | 3 | 2 | 1 | 2 | REAL* | ✓ |
| agents | PROFESSIONAL_READY | 18 | 6 | 2 | 1 | 1 | REAL* | ✓ |
| evalia | PROFESSIONAL_READY | 17 | 9 | 1 | 2 | 5 | REAL* | ✓ |
| secu | PROFESSIONAL_READY | 7 | 3 | 1 | 3 | 1 | REAL | ✓ |
| cloud | EXTERNAL_REQUIRED | 0 | 0 | 0 | 1 | 1 | EXTERNAL | — |
| comm | NON_CODE | 0 | 0 | 0 | 0 | 1 | NON_CODE | — |
| autonomy | BLOCKED | 0 | 0 | 0 | 0 | 0 | NON_CODE | — |

`REAL*` : le code d'ingénierie est exécuté RÉELLEMENT en local ; les **sorties de
modèle** manipulées sont `SIMULATION`/`PROXY` étiquetées (aucun appel LLM réel).

## Boucles professionnelles complètes : **17/20**

V47 ~7 · V48 9 · **V49 17**. Les 3 restantes sont hors boucle-code **par nature** :
`cloud` (infra externe requise, honnête), `comm` (non-code : évalué par production
écrite + phase communication des scénarios), `autonomy` (méta : s'observe sur les
capstones, pas d'exercice propre).

## Readiness — pourquoi / preuves / limites / prochaine étape

- **Solides et profondes** (`python`, `sql`, `se`, `archi`, `ml`, `evalia`, `http`,
  `agents`, `rag`, `llm`, `dl`, `secu`) : pratique exécutable + diagnostic + D4/D5
  réels + transfert + scénario. Preuves : exercices exécutés, misconceptions,
  capstones à décision. Limite `llm`/`rag`/`agents`/`evalia` : pas d'appel de
  modèle réel (frontière assumée). Limite `secu` : pratique locale + labs externes.
- **Complètes mais à approfondir** (honnêteté) : `ds` (D4=1, D5=0), `gitlinux`
  (D4=1, D5=0), `jsts` (D5=0), `patterns` (D4=1) : les 8 dimensions sont présentes
  mais la PROFONDEUR D4/D5 reste mince. Statut « PROFESSIONAL_READY » au sens du
  modèle, mais **junior-ready avec profondeur limitée** ; prochaine étape :
  densifier D4/D5. `algo` a de la profondeur (D4=5) mais D5=0.
- **EXTERNAL** : `cloud` — concept enseigné, exécution déportée (labs honnêtes).
  Ne sera jamais REAL sans démon Docker/cluster/compte. Prochaine étape : offrir un
  environnement externe, hors périmètre de la plateforme locale.
- **NON_CODE** : `comm` (rubrique + phase communication), `autonomy` (à formaliser
  en rubrique reliée aux capstones — dette V50).

## Anti-greenwashing

Aucune compétence TOOLING/EXTERNAL n'est présentée comme REAL. Le statut est
calculé, pas déclaré ; le ledger est dérivé et prouvé non-divergent par le gate.
Un statut PROFESSIONAL_READY à faible profondeur est signalé comme tel ci-dessus,
pas masqué.
