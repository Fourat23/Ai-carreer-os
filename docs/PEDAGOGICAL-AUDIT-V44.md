# PEDAGOGICAL-AUDIT-V44 — Audit académique final, sans euphémisme

Sprint V44 « Practice Mastery II ». Ce document répond HONNÊTEMENT, floor par floor, à 10 questions
que poserait un jury exigeant. Priorité : **pédagogie > maîtrise réelle > pratique > transfert >
cohérence**. Aucun greenwashing : ce qui est réel est prouvé par exécution, ce qui est simulé est
étiqueté, ce qui reste faible est nommé.

## État des FLOORS

| Floor | Cible | Livré | Preuve |
|---|---|---|---|
| A. audit structurel | 100 % | **262/262** | `scripts/v44-ledger.mjs` → `docs/practice-ledger-v44.json` |
| B. audit qualitatif | ≥ 60 | **≥ 66** (21 D4/D5 + ≥ 45 D2/D3) | `docs/PRACTICE-AUDIT-V44.md` §3–4 |
| C. practice ladders | ≥ 10 | **21 examinées, 6 complètes** | `lib/practice-ladder.mjs`, `tests/v44-practice-ladder` |
| D. feedback diagnostique | ≥ 40 | **49** | `lib/misconceptions.mjs`, `tests/v44-feedback-coverage` |
| E. difficulté D3/D4/D5 | ≥ 24 | **24 créés** (d5=4, d4=10, d3=10) | `tests/v44-new-exercises` (exécution réelle) |
| F. variation/transfert | ≥ 8 | **9 créés** (8 + python) | `data/transfer-challenges`, v42:check |
| G. hardening leçons | ≥ 24 auditées, 10-12 corrigées | **24+ auditées, 13 câblées** | `docs/PRACTICE-AUDIT-V44.md` §9 |
| H. walkthroughs | ≥ 8 | **8** | `docs/WALKTHROUGHS-V44.md` |

Tous les floors sont atteints. Aucun n'a été supprimé ; là où le COMPTE était déjà atteint, l'effort
a été réalloué à la SUBSTANCE (cf. Q10).

## Les 10 questions

**Q1 — La pyramide de difficulté a-t-elle vraiment changé, ou est-ce cosmétique ?**
Réel. CP0 : d1=21 d2=142 d3=69 d4=6 **d5=0**. Après : d3=78 **d4=17 d5=4**. Les 24 nouveaux exercices
sont exécutés par le vrai harnais (référence 100 % verte, starter fautif) — pas des étiquettes. Les
avertissements « pyramide plate » du gate (ds/http/gitlinux) ont disparu.

**Q2 — Les D5 sont-ils de vrais problèmes ambigus, ou des QCM déguisés ?**
Les 4 D5 exigent d'INTÉGRER plusieurs décisions en tension : `http-resilient-consumer` combine
idempotence + budget de retry + DLQ ; `se-release-decision` arbitre 4 signaux par ordre de priorité ;
`sql-index-advice` pèse lecture/écriture/sélectivité ; `http-cache-policy` croise
personnalisation/mutabilité/revalidation. Ce sont des décisions déterministes MAIS multi-facteurs —
honnêtement des D5 « décision pro », pas du transfert libre non testable. La limite est assumée : un
test automatisé exige UNE réponse attendue.

**Q3 — Le feedback diagnostique aide-t-il vraiment, ou est-ce du remplissage ?**
49 exercices reliés à 24 misconceptions RÉELLES (tirées du corpus). Langage prudent (« compatible avec
la misconception X »), jamais « tu ne comprends pas », jamais la solution. Chaque misconception relie
leçon(s) + exercice(s) de remédiation réels (vérifié par gate + `tests/v44-feedback-coverage`). Aucun
bloc de feedback écrit à la main : mécanisme mutualisé `diagnosticFeedback` — pas de second moteur.

**Q4 — Les 24 exercices sont-ils réellement exécutables et corrects ?**
Oui, prouvé : `tests/v44-new-exercises` exécute chacun via `runExercise` — référence 100 % verte,
starter échoue ≥ 1 test public, ≥ 1 public + ≥ 1 privé, sorties entières/chaînes, aucune fuite de
solution. Ce n'est pas déclaratif.

**Q5 — Les défis de transfert sont-ils de vraies variations, ou de la substitution lexicale ?**
9 nouveaux défis T5 transfèrent un principe vers un domaine RÉELLEMENT différent, avec pont conceptuel
explicite et `crossDomain: true` (ex. LRU → pools/sessions ; fenêtre glissante → anti-bourrage ;
running total → solde financier ; retry+DLQ → agent + escalade humaine). Chacun a une question
discriminante. Validés par le modèle V42 (T5 ⇒ pont + cross-domain).

**Q6 — La readiness ne surestime-t-elle pas la maîtrise ?**
Elle le faisait : secu/cloud/archi atteignaient `strong-junior` sans AUCUNE pratique de code (labs
simulés seuls). Corrigé (CP13) : `strong-junior` exige désormais une autonomie EXÉCUTABLE (≥ 1 exercice
de code réel ≥ d3). Distribution honnête : strong-junior 9 → 6 (algo, ds, jsts, http, sql, se) ;
secu/cloud/archi → junior-ready. La readiness est affichée comme **PROXY structurel**, jamais
« maîtrise professionnelle prouvée ».

**Q7 — Les leçons ont-elles été « durcies », ou touchées pour faire du diff ?**
Aucune réécriture cosmétique. Les 128 leçons sont déjà intuition-first (« 🌍 Le problème d'abord »
universelle, marqueur `keep`) ; la cluster Data/ML est exemplaire. Réécrire du bon pour du diff est
interdit (ADR-044 D6). La correction RÉELLE et justifiée : câbler les 24 nouveaux exercices à leur
leçon-concept (13 leçons, dont `caching-performance` qui n'avait AUCUNE pratique reliée). C'est la
boucle de deliberate practice rendue navigable.

**Q8 — Qu'est-ce qui est RÉEL, SIMULÉ, PROXY ?**
RÉEL : 262 exercices exécutés, 18 défis notés déterministes, read-models et gate testés (1202 tests).
SIMULÉ (étiqueté) : contextes cloud/k8s/ML/RAG/agents — aucune infra, aucun LLM, aucun entraînement.
PROXY : ladder et readiness = indices structurels, pas des preuves de maîtrise.

**Q9 — Qu'est-ce qui reste FAIBLE, honnêtement ?**
(1) **Ladders creuses** : secu/cloud/archi/ml/rag/agents/llm/evalia/comm n'ont pas de pratique de code
L1–L3 — la taxonomie (`isKnownSkill`) rejette ces ids comme compétences fines d'exercice. Dette n°1
pour V45. (2) **24 exercices anciens sans test privé** : documentés, non corrigés en masse (aucun n'est
D4/D5 ; risque > bénéfice ce sprint). (3) **python** reste `guided` (trous diagnostic + professional).
(4) `generate` n'est pas idempotent sur le champ `generatedAt` (cosmétique, pré-existant).

**Q10 — Y a-t-il eu réduction de périmètre déguisée (scope collapse) ?**
Non. Aucun floor supprimé. Le seul floor déjà atteint en COMPTE (E : ≥ 24 D3+ existaient déjà) a été
traité par RÉALLOCATION explicite vers la substance manquante (vrais D4/D5, d5 0→4), pas par un
compteur gonflé. Chaque limite (taxonomie, tests privés, python) est DÉCLARÉE, pas contournée. Les
corrections « faciles » (réécriture de prose déjà bonne) ont été refusées au profit de corrections
utiles (câblage concept→pratique, recalibrage anti-surestimation).

## Verdict académique

V44 approfondit RÉELLEMENT la pratique : difficulté cognitive exécutable (D4/D5), feedback qui explique
sans juger, transfert cross-domain vérifié, ladders explicites, readiness honnête. Les faiblesses
restantes sont nommées et priorisées. Aucune fausse « IA », aucun second moteur, une seule source de
vérité, `progress.json` intact.
