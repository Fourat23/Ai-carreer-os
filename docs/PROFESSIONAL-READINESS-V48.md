# V48 — Audit de readiness professionnelle (recompute)

Recalcul par compétence de programme, dérivé des artefacts réels (aucune source
concurrente). Une compétence n'est PAS « professionnelle » parce qu'elle a
beaucoup d'exercices : on exige des signaux de **pratique + diagnostic +
profondeur D4/D5 + décision/scénario** (et transfert quand pertinent).

Colonnes : ex, local (exécutable partout), tool (`python-ds` opt-in réel), sim
(SIMULATION/PROXY étiqueté), ext (lab externe), D3/D4/D5, diag (misconception),
tr (défi de transfert), scen (scénario professionnel).

```
skill    ex loc too sim ext D3 D4 D5 diag tr scen
algo     25  25  0  0  .  11  5  0   Y  Y  .
ds       16  16  0  0  .   9  1  0   Y  Y  .
jsts    217 217  0  0  .  60  4  0   Y  Y  Y
python   39  31  8  0  .  16 12  2   Y  Y  .
gitlinux 22  22  0  0  .   5  1  0   Y  .  .
http     14  14  0  0  .   4  2  2   Y  Y  Y
sql      13  13  0  0  .   5  5  2   Y  Y  Y
se       14  14  0  0  .   5  6  3   Y  Y  Y
archi    18  18  0  0  .   4  9  5   Y  Y  Y
patterns  9   9  0  0  .   7  1  1   Y  .  Y
ml       25  10 15  0  .  10 12  2   Y  Y  Y
dl        5   5  0  0  .   2  1  0   Y  .  .
llm      10   8  0  2  .   5  3  2   Y  .  Y
rag      11  11  0  0  .   4  3  2   Y  Y  Y
agents   18  18  0  0  .   5  6  2   Y  Y  Y
evalia   15  10  4  1  .   5  9  1   Y  Y  Y
secu      7   6  0  1  Y   2  3  1   Y  Y  .
cloud     0   0  0  0  Y   0  0  0   Y  Y  Y
comm      0   0  0  0  .   0  0  0   .  .  Y
autonomy  0   0  0  0  .   0  0  0   .  .  .
```

## Classement de readiness (conservateur)

**BOUCLE PROFESSIONNELLE COMPLÈTE** — pratique exécutable + diagnostic + D4/D5 +
scénario multi-compétences + transfert (10) :
`python`, `sql`, `se`, `http`, `jsts`, `archi`, `ml`, `rag`, `agents`, `evalia`.
Sur ces compétences, l'apprenant peut observer un système imparfait, investiguer,
comparer des hypothèses, décider sous contraintes, appliquer, valider et
expliquer — pas seulement résoudre un exercice. **`archi`, `agents`, `rag`,
`evalia` accèdent à ce niveau grâce à V48** (scénarios + profondeur D4/D5).

**SOLIDE** — pratique exécutable + diagnostic + profondeur, boucle presque
complète (manque scénario OU transfert) (6) :
`algo` (D4=5, transfert ; désormais avec misconception dédiée — dette V47 comblée),
`ds` (misconception ajoutée), `gitlinux`, `secu` (+ lab externe), `patterns`
(scénario via `legacy-service-refactor`, transfert encore absent), `llm`
(**D4 passe de 0 à 3**, scénario `llm-context-budget-regression` ; transfert à venir).

**ÉMERGENT** (1) : `dl` — 5 exercices, peu de profondeur exécutable locale, pas de
scénario. Cible V49.

**HORS-LOCAL par nature** (3) : `cloud` (labs externes honnêtes + concept
enseigné), `comm` (non-code : s'évalue par production écrite et la phase
« communication » des scénarios), `autonomy` (méta : s'observe sur les capstones).

## Mouvement V47 → V48

| Compétence | V47 | V48 | Preuve |
|-----------|-----|-----|--------|
| `archi` | SOLIDE | **BOUCLE COMPLÈTE** | +9 décisions D4/D5 + scénario refactor |
| `agents` | SOLIDE | **BOUCLE COMPLÈTE** | +4 exos (boucle, garde-fou D5) + scénario |
| `rag` | FORT | **BOUCLE COMPLÈTE** | +diagnostic retrieval/génération + scénario hallucination |
| `evalia` | FORT | **BOUCLE COMPLÈTE** consolidée | scénario fraude déséquilibre |
| `ml` | FORT | **BOUCLE COMPLÈTE** consolidée | +7 exos (fuite, imbalance, drift, coût) + scénario |
| `llm` | ÉMERGENT | **SOLIDE** | D4 0→3, +scénario budget de contexte |
| `patterns` | ÉMERGENT | **SOLIDE** | +décisions (composition, DI…) + scénario refactor |
| `algo`/`ds` | SOLIDE (sans diag) | **SOLIDE + misconception** | dette V47 comblée |

## Compte « boucle professionnelle complète »

**V47 : ~7.  V48 : 10** compétences importantes avec une boucle professionnelle
complète et défendable (`python`, `sql`, `se`, `http`, `jsts`, `archi`, `ml`,
`rag`, `agents`, `evalia`), + 6 SOLIDE. « Réellement pratiquable » reste 17/20
(cloud/comm/autonomy exclus par nature) — le gain V48 est en PROFONDEUR et en
BOUCLE, pas en nombre de cases cochées : ce n'était pas l'objectif.

## Limites assumées (dette V49)

- `llm` et `patterns` : pas encore de défi de **transfert** dédié.
- `dl` reste émergent : profondeur exécutable locale à construire (backprop
  déterministe pas-à-pas), sans framework tiers.
- `llm` : toujours **aucun appel de modèle réel** (par conception). Ce qui est
  pratiqué, c'est l'ingénierie AUTOUR du modèle (budget, coût, contrats, éval,
  injection en PROXY).
- `cloud` : demeure `EXTERNAL_ENVIRONMENT_REQUIRED` (aucune fausse exécution).
