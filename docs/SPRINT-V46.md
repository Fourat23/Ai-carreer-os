# SPRINT V46 — Executable Practice Remediation I

**Type** : construction de pratique (pas d'audit). **Corpus** : gelé (V45.3),
inchangé. **Langue** : français. **Branche** : `claude/ai-career-os-saas-phfg49`.

## 1. État Git

Branche `claude/ai-career-os-saas-phfg49` ; local == origin ; working tree
propre ; stash vide ; aucun serveur résiduel.

## 2. Ce qui existait déjà (réutilisé)

- Harness d'exécution complet (`workspace-fs.mjs`, adaptateurs Node/**Python**/
  TS/web/react) — **aucun second moteur créé**.
- 262 exercices, read-model de couverture (`practice-coverage.mjs`), registre de
  misconceptions, gates v43/v44, capstones (data-ml, rag, backend, cloud).
- 6 exercices `agent-*` JS **réutilisés** (retag `agents`).
- 3 capstones **réutilisés** comme aboutissement des scénarios professionnels.

## 3. Ce qui a été réellement créé

- **46 nouveaux exercices exécutables** (`sprint: v46`), vérifiés par EXÉCUTION
  RÉELLE (référence 100 % verte, starter cassant ≥1 test public) :
  Python/Data (8), **SQL réel via sqlite3** (8), ML (7), DL (5), RAG (7),
  Agents (6), Sécurité (5).
- **14 misconceptions V46** reliant **32 exercices** au feedback diagnostique.
- **3 scénarios professionnels** multi-compétences (`PROFESSIONAL-PRACTICE-V46.md`).
- **3 tâches EXTERNAL** honnêtes (Docker/K8s/AWS, `data/external-tasks.json`).
- Gate `v46:check` + test d'exécution `tests/v46-exercises.test.mjs`.
- ADR-040 (runtime), docs coverage/runtime/audit.

## 4. Compétences passées de la théorie à la pratique exécutable

**Avant V46** : pratique exécutable pour 8 compétences (algo, ds, jsts,
gitlinux, http, se, python[mince], sql[**simulé**]).

**Après V46** : **+5 compétences opérationnalisées** — **ml, dl, rag, agents,
secu** (de 0 à une vraie ladder) ; **sql** passe de **simulé** à **réel**
(sqlite3) ; **python** approfondi (D2→D5 + diagnostic).

| État | Compétences |
|---|---|
| Pratique exécutable (avant) | algo, ds, jsts, gitlinux, http, se, python, ~~sql(simulé)~~ |
| **Ajoutées / promues (V46)** | **ml, dl, rag, agents, secu** + **sql réel** + python approfondi |
| Restent sans pratique exécutable | archi, patterns, **llm, evalia**, cloud, comm, autonomy |

## 5. Compétences encore simulées / non exécutables

- **cloud** : non exécutable localement → tâches EXTERNAL honnêtes (pas de faux
  « AWS en Node »).
- **llm, evalia** : partiellement touchés (coût, recall@k, métriques dans rag/ml)
  mais pas encore une ladder dédiée → V47.
- **archi, patterns** : conceptuels, pas encore de pratique exécutable dédiée.
- **comm, autonomy** : non-code par nature (capstones/missions/README).

## 6. Exercices avant/après

262 → **308** (+46 exécutables ; +6 agent-* retaggés réutilisés).

## 7. Distribution D1→D5 (nouveaux V46)

D2=? , **D3=18, D4=15, D5=5** (floor : D3≥12, D4≥8, D5≥4 — dépassé). Ladders
D2→D5 pour python, sql, ml, rag, agents ; D2→D4 pour dl, secu.

## 8. Feedback diagnostique avant/après

Misconceptions 24 → **38** ; exercices V46 reliés à une misconception : **32**
(floor ≥16). Le feedback donne le concept correct + renvois, **jamais la
solution**.

## 9. Transfert

Scénarios professionnels (A Data/ML, B RAG, C Backend/SQL) enchaînant les
exercices exécutables vers des capstones réutilisés. Le transfert profond
(T4/T5) reste porté par capstones/missions (dette héritée, non gonflée).

## 10. Runtimes réels & dépendances

Python 3 + **sqlite3 (stdlib)**. **Zéro dépendance ajoutée** (numpy/pandas/
sklearn rejetés : non reproductibles — ADR-040). SQL réellement exécuté.

## 11. Sécurité

Runner déjà durci (execFile sans shell, timeout+SIGKILL, allowlist, readOnly,
env minimal). sqlite3 = aucune surface réseau. Aucun correctif requis
(`EXECUTION-RUNTIME-V46.md`).

## 12. Tests / build / gates

`npm test` = **1222/1222** ; `tsc --noEmit` = 0 ; `npm run build` = 0 ;
`gates:active` = 0 (v46:check inclus).

## 13. Readiness (impact réel)

not-ready **9 → 5** ; strong-junior **6 → 9**. Une incohérence latente du
read-model a été corrigée (strong-junior exige diagnostic FULL, aligné sur v44).

## 14. Dette restante exacte

- **llm, evalia** : ladders dédiées à créer (V47).
- **archi, patterns** : pratique exécutable à concevoir.
- **cloud / Docker / K8s** : exécution réelle = environnement externe (tâches
  EXTERNAL prêtes ; exécution in-plateforme hors périmètre).
- **comm, autonomy** : non-code (déjà via capstones/missions).
- Pas de pandas/sklearn (choix assumé) : familiarité d'API tierce hors plateforme.

## 15. Ce qui n'a PAS été livré (et pourquoi)

- Pas d'exécution Docker/K8s/cloud locale : pas d'infra reproductible → tâches
  EXTERNAL honnêtes plutôt que fausse simulation.
- Pas de ladders llm/evalia/archi/patterns : priorisé les domaines à 0 avec le
  plus fort levier (ml/dl/rag/agents/secu/sql/python) ; le reste va en V47.

## 16. Réallocations

Aucune réduction de périmètre. Réutilisation (6 agent-*, 3 capstones) → effort
redirigé vers la profondeur (D4/D5, diagnostic, scénarios).

## 17. Question centrale de V46

> « Si l'apprenant comprend les cours, dans combien de domaines peut-il désormais
> RÉELLEMENT pratiquer suffisamment pour transformer la compréhension en
> compétence ? »

**Avant : 8 compétences** réellement pratiquables (dont SQL seulement simulé).
**Après : 13** — algo, ds, jsts, gitlinux, http, se, **python (approfondi)**,
**sql (réel)**, **ml, dl, rag, agents, secu**. Le nombre de domaines
opérationnalisés prime sur le nombre total d'exercices : **+5 domaines de zéro à
une vraie boucle, +1 domaine (SQL) de simulé à réel.**

## 18. Verdict

Échelle : INSUFFISANT · MOYEN · **BON** · FORT · EXCELLENT.

**Verdict : BON.** Justification : objectif central atteint (5 domaines
opérationnalisés + SQL réel + python approfondi, 46 exercices exécutés, feedback
diagnostique, scénarios pro, 0 régression, corpus gelé intact). Pas **FORT/
EXCELLENT** car llm/evalia/archi/patterns restent sans pratique exécutable et
cloud reste externe : la couverture n'est pas encore complète. Le pas est réel et
substantiel, pas total.

## 19. Immutabilité & clôture

Hash corpus initial == final = `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3` ;
`data/progress.json` = `323604021055588a9528a86875f36598dbdc7758` ; tree propre ;
local == origin.

## 20. Suite

`docs/V46-PROMPT-V47.md` — Executable Practice Remediation II (llm/evalia/archi/
patterns + environnements externes cloud/K8s).
