# V47 — Audit de readiness professionnelle (recompute)

Recalcul par compétence de programme, dérivé des artefacts réels (aucune source
concurrente). Colonnes :

- **ex** : exercices projetés sur la compétence.
- **local** : exécutables localement partout (`LOCAL_EXECUTABLE`, runtime de code
  sans outillage opt-in).
- **tool** : `TOOLING_ENVIRONMENT_REQUIRED` (code RÉEL via `.venv-ds` opt-in ;
  sauté honnêtement si absent).
- **sim** : `SIMULATION` / `PROXY` (mesure locale déterministe, étiquetée).
- **d4 / d5** : profondeur cognitive (diagnostic / jugement de senior).
- **diag** : au moins une misconception reliée (boucle de remédiation).
- **ext** : tâche `EXTERNAL_ENVIRONMENT_REQUIRED` honnête (infra réelle requise).
- **tr** : défi de transfert.
- **prof** : scénario/capstone/mission professionnel.

```
skill    ex local tool sim d4 d5 diag ext tr prof
algo     25    25   0   0  5  0  .   .  Y  Y
ds       16    16   0   0  1  0  .   .  Y  Y
jsts    217   217   0   0  4  0  Y   .  Y  Y
python   35    31   4   0 10  2  Y   .  Y  Y
gitlinux 22    22   0   0  1  0  Y   .  .  Y
http     14    14   0   0  2  2  Y   .  Y  Y
sql      13    13   0   0  5  2  Y   .  Y  Y
se        6     6   0   0  3  1  Y   .  Y  Y
archi     6     6   0   0  4  1  Y   .  Y  .
patterns  5     5   0   0  1  1  Y   .  .  .
ml       15     7   8   0  5  2  Y   .  Y  Y
dl        5     5   0   0  1  0  Y   .  .  .
llm       4     3   0   1  0  1  Y   .  .  Y
rag       7     7   0   0  2  1  Y   .  Y  Y
agents   13    13   0   0  3  1  Y   .  Y  .
evalia    8     6   1   1  5  1  Y   .  Y  Y
secu      5     5   0   0  2  0  Y   Y  Y  .
cloud     0     0   0   0  0  0  Y   Y  Y  Y
comm      0     0   0   0  0  0  .   .  .  Y
autonomy  0     0   0   0  0  0  .   .  .  .
```

## Classement de readiness (conservateur)

**FORT — pratique locale + diagnostic + profondeur D4/D5 + transfert + scénario pro** (7)
`python`, `sql`, `http`, `ml`, `evalia`, `se`, `rag`.
Ces compétences se pratiquent de bout en bout : exercices exécutables, erreurs
diagnostiquées, tâches D4/D5, transfert et culmination pro. `ml` et `evalia`
atteignent ce niveau **grâce à V47** (outillage Data Science réel + harnais
d'évaluation).

**SOLIDE — pratique locale + diagnostic + au moins D4** (7)
`jsts`, `algo`, `ds`, `gitlinux`, `agents`, `archi`, `secu`.
Pratique exécutable robuste. `archi` **passe de NO_PRACTICE (V46) à SOLIDE**
(détection de violation de couche, cycle, idempotence, D4×4 + D5×1). `algo`/`ds`
n'ont pas encore de misconception dédiée mais une pratique très fournie.

**ÉMERGENT — pratique locale réelle mais peu profonde ou étroite** (3)
`patterns` (5 exos, D4=1 D5=1 — nouvel axe, à densifier), `llm` (pratique surtout
`PROXY`/coût, D4=0), `dl` (5 exos, D4=1 — peu de profondeur exécutable locale).
`patterns` et `llm` **existaient à zéro pratique avant V47**.

**HORS-LOCAL — honnêtement non exécutable dans la plateforme** (3)
`cloud` (0 exo local : `EXTERNAL_ENVIRONMENT_REQUIRED` + simulations étiquetées
ailleurs ; concept enseigné et raisonné), `comm` (non-code : s'évalue par
production écrite/scénario), `autonomy` (méta : s'observe sur les capstones).

## Mouvement V47 (avant → après)

| Domaine | V46 | V47 | Preuve du changement |
|---------|-----|-----|----------------------|
| `ml` | pratique locale stdlib | **+ outillage RÉEL** (pandas/sklearn) | 8 exos `python-ds`, Pipeline anti-fuite D5 |
| `evalia` | **NO_PRACTICE** | **FORT** | 8 exos éval déterministe + harnais D5 |
| `archi` | **NO_PRACTICE** | **SOLIDE** | couche/cycle/idempotence exécutables |
| `patterns` | **NO_PRACTICE** | **ÉMERGENT** | strategy/factory/adapter/observer + yagni D5 |
| `llm` | concept seul | **ÉMERGENT** | tokens/coût + éval PROXY exécutables |
| `cloud` | EXTERNAL | EXTERNAL (élargi) | +4 labs Docker/Compose/K8s/AWS honnêtes |

## Compte « réellement pratiquable » (exécutable localement ou via outillage opt-in RÉEL)

**V46 : 13/20.  V47 : 17/20** (FORT 7 + SOLIDE 7 + ÉMERGENT 3).
Restent hors pratique locale : `cloud` (external, honnête), `comm`, `autonomy`
(non-code par nature). Ce n'est PAS un quota atteint par remplissage : chaque
compétence comptée possède des exercices qui s'exécutent réellement et échouent
sur une solution naïve (vérifié par les builders et les gates).

## Limites assumées

- `llm` reste `ÉMERGENT` : la plateforme n'appelle aucun modèle réel (par
  conception). Ce qui est exécutable, ce sont les briques déterministes autour du
  modèle (tokenisation approchée, coût, contrats, éval) — pas le modèle lui-même.
- `cloud` ne sera jamais `LOCAL` sans démon Docker/cluster/compte : les labs
  externes sont fournis avec commandes et preuves attendues, sans fausse
  exécution.
- `algo`/`ds` gagneraient une misconception dédiée (dette pédagogique mineure,
  hors périmètre de construction V47).
