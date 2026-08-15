# SPRINT V45.2 — Deep Academic Certification (rapport de sprint)

**Type** : audit-only (aucune modification du curriculum / programme / moteurs /
UI). **Langue des rapports** : français. **Branche** :
`claude/ai-career-os-saas-phfg49`.

## Objet

Répondre sérieusement, une fois, à : *le corpus est-il assez bon pour qu'un
néophyte y investisse des centaines d'heures avec confiance ?* — en rejetant la
certification V45.1 jugée non définitive (13/128 lectures profondes documentées)
et en exigeant une **lecture intégrale des 128 leçons** avec preuves positives.

## Ce qui a été livré (CP0 → CP15)

| CP | Livrable | Statut |
|----|----------|--------|
| CP0 | `V45-2-CP0-FREEZE.md` — gel forensique + SHA-1 corpus + phrase-contrat | ✅ |
| CP1 | `V45-2-AUDIT-SCOPE.json` + `V45-2-ACADEMIC-RUBRIC.md` + test rouge | ✅ |
| CP2 | Map de scope (128 leçons, 16 anchors V45.1 marqués « deep ») | ✅ |
| CP3-CP10 | **Full-read 128/128** → `v45-2-parts/b1..b8.json` → `V45-2-LESSON-LEDGER.json` | ✅ |
| CP10 | Test d'intégrité `tests/v45-2-ledger.test.mjs` **4/4 vert** | ✅ |
| CP11 | `V45-2-CURRICULUM-CHAINS.md` (17 chaînes) | ✅ |
| CP12 | `V45-2-CALIBRATION.md` (6 anchors aveugle, 6/6 concordants) | ✅ |
| CP13 | `V45-2-BEGINNER-WALKTHROUGHS.md` (cohérence 365j + 5 walkthroughs) | ✅ |
| CP14 | `V45-2-LESSON-CERTIFICATION.md` + `V45-2-CURRICULUM-STABILITY.md` + `V45-2-ACADEMIC-DEBT.md` | ✅ |
| CP15 | `V45-2-EXECUTIVE-SUMMARY.md` + ce rapport + `V45-2-PROMPT-V46.md` | ✅ |

## Résultats-clés

- **128/128 leçons lues intégralement**, verdict **A / CERTIFIED = 128/128**.
- **Actions** : KEEP = 121, MINOR_FIX = 7 ; **0** REWORK/RESTRUCTURE/BLOCK.
- **Transfert (contenu)** : T4 = 68, T3 = 60, T0-T2 = 0.
- **Moyennes dimensions-clés** : exactitude 4.00, progression 4.00, prérequis
  4.00, modèle mental 3.99, idées fausses 3.91, accessibilité 3.80, profondeur
  3.80.
- **Stabilité** : 6 STABLE, 10 ADDITIVE_CHANGES_EXPECTED, 1 ORDER_FIX_NEEDED,
  **0 RESTRUCTURE_REQUIRED**.
- **Dette** : **0 P0** ; dette dominante = **pratique exécutable Barre B**
  (ML/DL/infra), hors note académique.
- **Verdict global** : **FORT** (EXCELLENT en contenu, réserve sur la pratique
  exécutable).

## Constat central (les deux barres)

- **Barre A (comprendre / raisonner)** : uniformément forte, 128/128 A.
- **Barre B (produire du code exécutable pour la compétence)** : réellement
  outillée pour ~8/20 compétences (socle logiciel + RAG évalué + carrière).
  Pour ML/DL entraînés, Linux, réseau, observabilité, Docker/K8s/cloud, la
  pratique est conceptuelle ou simulée — **dette documentée, jamais masquée**.

Cette distinction est la correction majeure apportée à V45.1 (dont le drapeau
« practicable » surévaluait la pratique IA/ML) et confirmée par la calibration.

## Garanties de sérieux

- Preuves positives spécifiques (≥ 2/leçon, unicité ≥ 90 %).
- Test d'intégrité vert (4/4).
- Calibration aveugle reproductible (6/6).
- Corpus figé, SHA-1 vérifié inchangé, `progress.json` restauré (blob
  `323604021055588a9528a86875f36598dbdc7758`), jamais commité.

## Contrat respecté

> « V45.2 ne certifie jamais une leçon parce qu'elle ressemble à une bonne leçon.
> Il la certifie uniquement après lecture intégrale et preuves positives. »

Aucune leçon, aucun exercice, aucun fichier de curriculum n'a été modifié. Toute
anomalie a été consignée en backlog (`V45-2-ACADEMIC-DEBT.md`), jamais corrigée.

## Suite

V46 doit s'attaquer à la **dette Barre B** (pratique exécutable ML/DL/infra) et
aux **consolidations curriculaires** (doublons DevOps, log structuré, palier
Python), sans toucher au contenu certifié. Prompt prêt : `V45-2-PROMPT-V46.md`.
