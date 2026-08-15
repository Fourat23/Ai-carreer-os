# SPRINT-V44 — Practice Mastery II : synthèse & passation

## Résumé exécutif

V44 approfondit la SUBSTANCE de la pratique là où V43 avait posé l'instrument (matrice de couverture).
Résultat : la pyramide de difficulté n'est plus plate (d5 0→4, d4 6→17), le feedback diagnostique passe
de 9 à 49 exercices reliés à des misconceptions réelles, 9 nouveaux défis de transfert cross-domain,
une readiness recalibrée pour ne plus surestimer, et une boucle concept→pratique câblée. Tout est
vérifié par exécution (1202 tests, 24 gates verts).

## Livré, checkpoint par checkpoint

| CP | Livrable | Preuve |
|---|---|---|
| CP1 | ADR/HSD/TSD-044 (D1-D5, ladder, feedback, readiness) | `docs/ADR-044…` |
| CP2 | Gate `v44:check` (difficulté, feedback, readiness, no-second-source) | `scripts/v44-check.mjs` |
| CP3 | Ledger structurel 100 % (262 exos) | `scripts/v44-ledger.mjs`, `docs/practice-ledger-v44.json` |
| CP4 | Audit qualitatif ≥ 66 exos | `docs/PRACTICE-AUDIT-V44.md` |
| CP5 | Read-model ladder L0-L5 (dérivé, pur) | `lib/practice-ladder.mjs` (+ .d.ts, tests) |
| CP6 | Feedback diagnostique 49 exos (24 misconceptions) | `lib/misconceptions.mjs`, tests |
| CP7 | 24 exercices D3/D4/D5 exécutables | `data/exercises/*`, `tests/v44-new-exercises` |
| CP8 | 8 défis de transfert (variation réelle) | `data/transfer-challenges/*` |
| CP9/10 | Audit leçons (KEEP prose) + câblage practiceRefs (13 leçons) | `scripts/data/lessons-map.mjs` |
| CP11 | Pratique pro par réutilisation (5 capstones, 42 missions, 45 playbooks + 4 D5) | (NO_COMMIT documenté) |
| CP12 | 8 walkthroughs néophyte end-to-end | `docs/WALKTHROUGHS-V44.md` |
| CP13 | Recalibrage conservateur readiness (strong-junior 9→6) | `lib/practice-coverage.mjs`, tests |
| CP14 | Cohérence parcours + défi python (0 skill-without-transfer) | `data/transfer-challenges/windowed-extremes-everywhere.json` |
| CP15 | Audits finaux + synthèse + push | ce document, `docs/PEDAGOGICAL-AUDIT-V44.md` |

## Métriques (avant → après)

- Exercices exécutables : 238 → **262** (+24, tous D3/D4/D5 réels).
- Difficulté : d4 6→**17**, d5 0→**4** ; pyramides plates ds/http/gitlinux résorbées.
- Feedback diagnostique : 9 → **49** exercices ; misconceptions 7 → **24**.
- Défis de transfert : 9 → **18** ; **0** compétence structurante sans transfert.
- Readiness `strong-junior` : 9 → **6** (recalibrage anti-surestimation).
- Tests : 1181 → **1202** ; gates : 23 → **24** (tous verts).
- `progress.json` : inchangé (SHA-1 `323604021055588a9528a86875f36598dbdc7758`).

## Ce qui reste faible (transmis honnêtement)

1. **Ladders creuses** des domaines simulés (secu, cloud, archi, ml, rag, agents, llm, evalia, comm) :
   pas de pratique de CODE L1–L3, car la taxonomie `isKnownSkill` n'accepte pas ces ids comme
   compétences fines d'exercice. **Dette n°1**.
2. **24 exercices anciens sans test privé** : contrat « ≥ 1 public + ≥ 1 privé » non tenu (aucun D4/D5).
3. **python** : readiness `guided` (trous diagnostic + professional).
4. `generate` non idempotent sur `generatedAt` (cosmétique, pré-existant).

---

## Prompt de lancement V45 (proposé)

> **V45 — « Taxonomie de compétences & pratique des domaines simulés » (Skill Taxonomy & Simulated-Domain Practice)**
>
> Contexte : V44 a corrigé la pyramide de difficulté (d5 0→4), le feedback (49 exos) et la readiness
> (recalibrée). Il reste une dette STRUCTURELLE nommée sans euphémisme : les compétences des domaines
> simulés (secu, cloud, archi, ml, rag, agents, llm, evalia, comm) ont des **ladders creuses** — pas de
> pratique de CODE exécutable L1–L3 — parce que la taxonomie `isKnownSkill` rejette ces ids comme
> compétences fines d'exercice.
>
> Objectif : rendre HONNÊTEMENT praticables les domaines aujourd'hui adossés aux seuls labs/assessments.
> Priorité inchangée : **pédagogie > maîtrise réelle > pratique > transfert > cohérence**. Local,
> mono-utilisateur, une seule source de vérité, sans fausse IA/infra, sans second moteur.
>
> Règles NON négociables (rappel) : RÉUTILISER→RELIER→DURCIR→ÉTENDRE→CRÉER ; séparer RÉEL/SIMULÉ/PROXY ;
> pas de XP/badges ; ne jamais prétendre exécuter un test que l'environnement ne peut pas ; restaurer
> `progress.json` (gitignoré, SHA-1 `323604021055588a9528a86875f36598dbdc7758`) EXACTEMENT ; qualité >
> quantité MAIS anti-scope-collapse (toute suppression exige PREUVE + EFFORT RÉALLOUÉ À). Développer et
> pousser sur `claude/ai-career-os-saas-phfg49`.
>
> Décision de conception à trancher au CP1 (ADR-045) : soit (a) ÉTENDRE proprement la taxonomie pour
> qu'un exercice puisse être tagué `secu/cloud/archi/…` et se projeter vers lui-même, en gardant la
> projection fine→programme cohérente et testée ; soit (b) créer des compétences fines RÉELLES qui se
> projettent vers ces domaines (ex. `netpolicy`, `iam`, `dockerfile`). Interdit : casser la projection
> existante ou créer une seconde taxonomie concurrente.
>
> FLOORS proposés (anti-scope-collapse, ajuster au CP0 réel) :
> - A. taxonomie étendue + testée (projection 100 % cohérente, aucune régression des 262 exos) ;
> - B. ≥ 15 exercices de code RÉELLEMENT exécutables pour ≥ 4 domaines aujourd'hui creux (secu, cloud,
>   archi, ml/data) — contrat complet (référence verte, starter fautif, ≥ 1 public + ≥ 1 privé,
>   sorties entières/chaînes) — visant à combler les ladders L1–L3 ;
> - C. corriger les 24 exercices sans test privé (ajouter ≥ 1 test privé chacun) ;
> - D. compléter la readiness/diagnostic de `python` (misconception(s) + variation) ;
> - E. mettre à jour ledger + matrice + ladders et prouver que les ladders creuses se remplissent ;
> - F. rapport final honnête floor-par-floor (ce qui est enfin praticable en code, ce qui reste
>   légitimement SIMULÉ — certains domaines n'ont pas d'exécution locale possible et doivent le dire).
>
> Livrer : ADR/HSD/TSD-045, extension taxonomie + tests, exercices, gate `v45:check`, docs
> PRACTICE-AUDIT-V45 / PEDAGOGICAL-AUDIT-V45 / SPRINT-V45 + prompt V46. CP0 audit lecture seule d'abord.
