# Sprint V33 — ML Foundations → Deep Learning → Transformers → LLMOps + Curriculum Graph III + Academic Pedagogical Hardening

Rapport de sprint (français). Sprint d'abord PÉDAGOGIQUE : rendre la chaîne ML → DL →
Transformers → LLMOps accessible à un néophyte, la relier à de la pratique déterministe, et
réduire les ruptures détectées par le Curriculum Graph. Aucune course à la quantité, aucune
refonte UI, aucun second moteur, aucune dépendance ML lourde, aucun vrai entraînement.

## 1. État initial audité (CP0, HEAD cab7036)
110 leçons · 209 exercices · 40 missions · 36 playbooks · 674 glossaire · 6 parcours dotés + 3
annoncés · 1001 tests · 12 gates. Working tree propre, local == origin, aucun serveur résiduel.
Dette centrale mesurée : 6 leçons ML/DL/LLM au contenu FORT mais sans structure V33 (on-ramp +
prérequis) et sans pratique ; la chaîne ML n'avait qu'UN exercice.

## 2. Divergence avec le prompt
Aucune divergence structurelle. Anomalie 961/965 déjà résolue en V32 (documentée là-bas).

## 3. Politique dépendances ML (décision CP0/CP1)
Aucune installation de numpy/pandas/scikit-learn/PyTorch/TensorFlow (interdit + non garanti).
Exercices = raisonnements déterministes node-js, sorties entières/chaînes (pas d'égalité
flottante). Les mentions PyTorch/NumPy des leçons décrivent le travail hors plateforme de
l'apprenant, sans fausse exécution.

## 4. Décisions ADR/HSD/TSD-033 (CP1)
Correction ADDITIVE (jamais de réécriture d'un contenu sain — anti-slop) ; exercices de
raisonnement déterministes ; aucune leçon attention séparée (transformers.md la couvre) ;
Curriculum Graph III = read-model dérivé étendu, warnings réduits par correction de la donnée
source ; parcours data-ml-v1 non activé sans preuve de cohérence.

## 5. Gate v33:check + plan + ledger (CP2)
Gate structurel ajouté (13 gates actives). hardenedLegacy rempli au fil des CP3→CP6 (gate verte
en continu). prereq déclare les prérequis des 6 leçons (alimente le graphe).

## 6. Durcissement des 6 leçons (CP3–CP6)
- CP3 ML classique : feature-engineering, scikit-learn-workflow (on-ramp + prérequis).
- CP4 Deep learning : neural-networks (on-ramp « machine à régler des boutons »).
- CP5 Transformers : transformers (on-ramp « la souris cassée » ; attention avant la formule).
- CP6 LLMOps : llm-cost-optimization, llm-observability (prototype → production).
Contenu existant conservé ; on-ramp + prérequis + pratique ajoutés.

## 7. Pratique déterministe (CP3–CP7) — 9 exercices
ml-data-leakage, ml-split-choice, ml-feature-encoding, nn-forward-neuron, ml-overfit-diagnose,
attention-argmax, llm-cost-estimate, ml-confusion-metric (+ réutilisation de ml-metric-choice).
Chaque starter faux, référence 100 % verte, tests privés non exposés, SIMULATION, sorties
entières/chaînes. Les 6 leçons du périmètre sont `critical` avec practiceRefs résolus.

## 8. Curriculum Graph III (CP8)
Warnings **15 → 13** : les prérequis déclarés résorbent 4 `concept-without-foundation`
(neural-networks, transformers, llm-cost-optimization, llm-observability). Nouveau diagnostic
`foundation-without-practice` (warning, non bloquant) : 2 hits actionnables (llm-fundamentals
prérequis de 9, docker-containers prérequis de 3). 0 anomalie bloquante, 0 orphan-practice.

## 9. Playbooks ML (CP9)
3 scénarios absents : ml-val-prod-gap, ml-prediction-regression, ml-imbalance-metric-trap
(39 playbooks au total).

## 10. Parcours + glossaire + e2e (CP10)
+18 termes ML/DL (label, leakage, holdout, cross-validation, underfitting, bias-variance,
confusion matrix, F1, loss, gradient, backpropagation, neuron, activation, epoch/batch,
attention, positional encoding, drift, TTFT ; 692 au total). Parcours AI Engineer Foundations
cohérent ; `data-ml-v1` laissé ANNONCÉ (0 jour résolu — pas de greenwashing).
tests/v33-e2e.test.mjs (6 tests).

## 11. Métriques avant / après

| | Fin V32 | Fin V33 |
| --- | --- | --- |
| Leçons | 110 | 110 |
| Exercices | 209 | **217** (+8) |
| Missions | 40 | 40 |
| Playbooks | 36 | **39** (+3 ML) |
| Glossaire | 674 | **692** (+18) |
| Tests | 1001 | **1016** (+15) |
| Gates actives | 12 | **13** (+v33:check) |
| Exercices chaîne ML/DL/LLMOps | 1 | 9 |
| Warnings Curriculum Graph | 15 | 13 |
| Diagnostics de graphe | 8 | 9 |

## 12. Validations réellement réalisées
generate idempotent (days-dirty=0), v33:check vert (6 critiques), 13 gates actives vertes,
1016 tests, tsc --noEmit OK, next build OK, navigateur 375/768/1024/1440/1920 (7 pages, 0
erreur console, 0 débordement), aucun serveur résiduel.

## 13. Validations NON réalisées
Aucun test d'accessibilité automatisé (axe). Aucun test de charge. Aucun entraînement ML réel
(volontaire). Pas de pilotage UI au-delà du rendu (les labs sont validés par le contrat
d'exécution des exercices).

## 14. Réel vs simulé
RÉEL : tout le calcul des exercices (fuite, split, encodage, métriques, forward-pass, attention,
coût), tests, graphe. SIMULÉ (étiqueté) : datasets, scores, poids, prix fournis en entrée.
JAMAIS : entraîner un modèle, exécuter sklearn/PyTorch, appeler un LLM/vector DB, réseau.

## 15. Sécurité / anti-fuite
Aucun eval/exec/shell, aucun secret, aucun test privé exposé (contrat). Aucune dépendance
ajoutée.

## 16. Données / progress.json
Baseline capturée au CP0 (`323604021055588a9528a86875f36598dbdc7758`), restaurée en fin de
sprint. Gitignoré, jamais commité.

## 17. Dette restante (P1/P2)
- P1 : llm-fundamentals & docker-containers sans pratique (foundation-without-practice) ;
  parcours data-ml-v1 à structurer.
- P2 : 4 concept-without-foundation non-ML, 6 advanced-before-prerequisite cross-domaine, 1
  concept-not-practiced ; ML avancé (NLP classique, séries temporelles).

## 18. Limites honnêtes
Le Curriculum Graph juge connectivité et ordre, pas la profondeur. La rubrique reste un proxy.
Les exercices testent le raisonnement, pas un vrai entraînement. Les warnings sont des signaux,
pas des verdicts.

## 19. CP12
Non requis — CP11 n'a révélé aucune rupture majeure, aucune P0 dans la chaîne principale, aucun
warning bloquant. Critères académiques atteints.

## 20. État Git final
Branche `claude/ai-career-os-saas-phfg49`. Commits CP1→CP11 atomiques, poussés. local == origin,
working tree propre, aucun serveur/workspace résiduel.

## 21. Résumé avant → après
Une chaîne ML → DL → Transformers → LLMOps qui n'était que THÉORIQUE (contenu fort mais sans
rampe néophyte ni pratique) devient FRANCHISSABLE : on-ramp + prérequis sur 6 leçons, 9
exercices déterministes reliés, 3 playbooks d'incident ML, un graphe enrichi qui détecte mieux
les ruptures et compte moins de warnings. 110 leçons inchangées — la qualité prime.

---

## 22. Prompt de reprise V34
Voir ci-dessous. **Ne pas démarrer V34 dans cette session.**

---

# Prompt de lancement — Sprint V34 (à démarrer PLUS TARD, PAS maintenant)

> Ce prompt clôt V33. **Ne démarre pas V34 dans cette session.** Rédigé pour être collé tel
> quel au lancement du sprint suivant.

Reprends **AI Career OS** pour le **Sprint V34 — « Pratique des fondations & complétion du
graphe : pratiques manquantes, warnings résiduels, et parcours Data/ML »**.

**IMPORTANT — travaille sur l'état RÉEL du dépôt.** Ne suppose jamais que ce résumé V33
correspond encore au repository. Commence par un **CP0 strictement en lecture seule** : audite
l'état réel (git, tests, build, gates, leçons, exercices, missions, playbooks, glossaire,
parcours, Curriculum Graph, serveurs résiduels, baseline progress.json) et présente un
**rapport d'audit CP0 en français AVANT toute implémentation**. Si V34 est déjà (partiellement)
livré, NE RECOMMENCE RIEN : identifie les commits existants et reprends au bon endroit.

**Langue** : tous les rapports, audits, synthèses et le prompt V35 final en **français**.

**Priorité (inchangée)** : QUALITÉ PÉDAGOGIQUE > cohérence des parcours > compréhension néophyte
> théorie→pratique→compétence→preuve > exactitude technique > honnêteté réel/simulé >
fonctionnalités. *Une excellente leçon/pratique vaut mieux que cinq superficielles. Ne maximise
artificiellement rien. L'audit CP0 fait foi.* Pas de refonte UI/UX globale.

**État attendu (à VÉRIFIER)** : branche `claude/ai-career-os-saas-phfg49`, HEAD final V33,
~110 leçons, ~217 exercices, 40 missions, ~39 playbooks, ~692 glossaire, 13 gates actives,
~1016 tests. Curriculum Graph : 9 diagnostics, 0 bloquant, 13 warnings documentés.

**Objectif central V34 — résorber la dette de PRATIQUE et de GRAPHE identifiée par V33 (l'audit
CP0 fait foi) :**
1. **foundation-without-practice** : doter `llm-fundamentals` (prérequis de 9 leçons) et
   `docker-containers` (prérequis de 3) d'une pratique déterministe reliée et honnête (ex.
   pour llm-fundamentals : raisonnement sur tokens/fenêtre de contexte/non-déterminisme ; ne
   PAS simuler un vrai LLM).
2. **concept-without-foundation** (non-ML) : déclarer les prérequis manquants de
   `git-advanced`, `caching-performance`, `monitoring-production`, `system-design-interview`
   dans un plan v34, après vérification du contenu.
3. **advanced-before-prerequisite** : examiner les 6 cas cross-domaine et corriger ceux qui
   sont de vraies inversions (laisser et documenter ceux qui sont légitimes).
Objectif mesurable : réduire le nombre de warnings du Curriculum Graph, chiffré avant/après.

**Objectif secondaire V34 — parcours Data/ML (`data-ml-v1`) :** décider honnêtement s'il peut
devenir un parcours cohérent (structure modules → jours dédiée, missions/preuves) OU rester
annoncé en documentant précisément ce qui manque. NE PAS l'activer sans cohérence démontrée
(pas de greenwashing).

**Contraintes d'architecture (inchangées)** : local, mono-utilisateur, sans auth/SaaS/réseau.
Aucune dépendance lourde. Pas de second moteur/catalogue/curriculum/runtime/base. Réutiliser
`lib/curriculum-graph.mjs` comme AUDITEUR. `progress.json` sauvegardé puis restauré (gitignoré,
jamais commité). Aucun secret, aucune fuite de solution/test privé. Pas de refonte UI globale.

**Gates** : garder `v26→v33:check` **actifs**. Nouveau contrat → `v34:check` ciblé et testé.
Attention aux faux positifs du scan d'authoring (`à compléter`, `TODO`, `XXX`) dans la prose.

**Checkpoints atomiques** CP0→CP11 (audit → design → implémentation → tests → tsc → build →
validation navigateur → restauration progress.json → cleanup → commit → push), un commit par CP
réellement terminé, pas de commit vide.

**CP11 (obligatoire)** : ré-audit + walkthrough néophyte ; matrice P0→P3 dans
`docs/PEDAGOGICAL-AUDIT-V34.md` ; audit du Curriculum Graph avec évolution chiffrée des
warnings ; append du **prompt V35** à la fin de `SPRINT-V34.md` sans démarrer V35.

**Critères de refus** : remplissage, jargon non introduit, fausse profondeur, gonflage de
scores, longueur = qualité, fausse exécution IA, contenu créé sans besoin réel.

**Livrable final** : `docs/SPRINT-V34.md` + synthèse française (existant / ajouté / corrigé /
testé / non testé / simulé / insuffisant), chiffres avant/après, dette restante, HEAD final.

**Commence maintenant par CP0. N'implémente rien avant d'avoir présenté le rapport CP0.**
