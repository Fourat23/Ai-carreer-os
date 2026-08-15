# TSD-044 — Difficulté, ladder, gate & scope floors

Document technique. Complète ADR/HSD-044. Fige les schémas, le gate et les FLOORS de scope suivis.

## 1. Définitions de difficulté (champ `difficulty` existant, 1-5)
| Niveau | Nature cognitive | Signaux |
|---|---|---|
| D1 | reconnaissance / manipulation directe | 1 étape, procédure évidente |
| D2 | application d'un pattern connu | 1-2 étapes, stratégie fournie |
| D3 | choix de stratégie / plusieurs étapes | l'apprenant choisit l'approche |
| D4 | diagnostic / contraintes concurrentes / info partielle | hypothèses, bruit, discrimination |
| D5 | problème pro ambigu / transfert / solutions plausibles | plusieurs décisions, trade-offs, justification |

## 2. `lib/practice-ladder.mjs` (PUR, dérivé)
```
export const LADDER_STEPS = ['L0','L1','L2','L3','L4','L5'];
export const LADDER_LABEL = { L0:'Concept', L1:'Guidé', L2:'Application', L3:'Stratégie autonome', L4:'Diagnostic', L5:'Transfert' };

skillLadder(programSkillId, sources) -> {
  skill, name,
  steps: { [L]: { present:boolean, from:string[] } },
  complete:boolean,            // L0..L3 présents + (L4 ou L5)
  missing: string[]
}
ladderMatrix(program, sources) -> SkillLadder[]
```
Dérivation : L0 = leçon (foundation) · L1 = exo d1-d2 OU exemple guidé · L2 = exo d2-d3 · L3 = exo d3+ ·
L4 = exo « debug » (id contient debug) OU assessment DIAGNOSIS OU capstone phase diagnosis · L5 = défi de
transfert OU assessment TRANSFER OU capstone. Réutilise practice-coverage (mêmes sources).

## 3. Gate `scripts/v44-check.mjs`
Échoue si : source concurrente interdite ; exercice avec compétence fine non projetable ; misconception
avec leçon/exercice mort ; readiness `strong-junior` d'une compétence SANS les preuves requises
(autonomy+diagnostic+transfer) ; référence morte. Avertit : distribution de difficulté pathologique
(compétence structurante à pratique de code sans aucun d4/d5) ; ladders incomplètes ; exercices sans
feedback diagnostique. **Jamais** « N exercices par skill ». Câblé dans `gates:active`.

## 4. Contrat des exercices créés (inchangé, RÉEL)
runtime connu · référence 100 % verte · starter fait échouer ≥ 1 test public · ≥ 1 public + ≥ 1 privé ·
call-equals à sorties entières/chaînes (pas de flottant) · SIMULATION étiquetée pour domaines simulés ·
sandbox gitignoré à l'exécution.

## 5. FLOORS de scope V44 (suivis ; suppression = preuve + réallocation)
| Floor | Cible | Mécanisme |
|---|---|---|
| A. audit structurel | 100 % (238) | ledger CP3 |
| B. audit qualitatif | ≥ 60 exos, tous domaines + tous d4/d5 | PRACTICE-AUDIT-V44 |
| C. practice ladders | ≥ 10 compétences vérifiées | practice-ladder + audit |
| D. feedback diagnostique | ≥ 40 exos | misconceptions étendues |
| E. difficulté | ≥ 24 exos D3/D4/D5 (créés/durcis) | data/exercises |
| F. variation/transfert | ≥ 8 tâches réelles | transfer-challenges |
| G. hardening leçons | ≥ 24 auditées, 10-12 corrigées | curriculum/lessons |
| H. walkthroughs | ≥ 8 néophyte end-to-end | docs |

## 6. Tests
`tests/v44-practice-ladder.test.mjs`, `tests/v44-feedback-coverage.test.mjs` (≥40 exos), `tests/v44-new-
exercises.test.mjs` (exécution réelle des nouveaux exos), plus non-régression coverage/gate.

## 7. Sûreté
`progress.json` restauré ; sandbox gitignoré ; anti-leak préservé.
