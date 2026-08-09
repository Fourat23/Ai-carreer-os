# Sprint V34 — Data/ML Learning Path + Curriculum Graph IV + Theory→Practice Completion + Academic Pedagogical Hardening VI

Rapport de sprint (français). Sprint d'abord PÉDAGOGIQUE : compléter les fondations data, relier
la théorie à la pratique, réduire honnêtement les warnings du graphe, et décider (sur preuve) du
parcours Data/ML. Aucune course au volume, aucune refonte UI, aucun second moteur, aucun faux
runtime ML.

## 1. État initial audité (CP0, HEAD 0587e1f)
110 leçons · 217 exercices · 40 missions · 39 playbooks · 692 glossaire · 6 parcours dotés + 3
annoncés · 1016 tests · 13 gates. Tree propre, local == origin, 0 serveur. progress.json
baseline `323604021055588a9528a86875f36598dbdc7758`. Curriculum Graph : 13 warnings, 0 bloquant.

## 2. Divergence avec le prompt
Aucune. Chiffres conformes au déclaré V33.

## 3. Décisions ADR/HSD/TSD-034 (CP1)
RÉUTILISER→RELIER→DURCIR→CRÉER. Docker relié à l'existant (0 création). llm-fundamentals
pratiqué (1 exercice). Data foundations durcies additivement. Warnings triés (correction à la
source, jamais de suppression arbitraire). data-ml-v1 activé seulement si cohérent.

## 4. Gate v34:check + plan + ledger (CP2)
14 gates actives. hardenedLegacy rempli au fil des CP (gate verte en continu).

## 5. Theory→practice (CP3)
docker-containers relié à docker-instruction-order / docker-layer-cache / docker-image-size
(exercices EXISTANTS — 0 création). llm-fundamentals : exercice llm-context-budget créé
(fenêtre de contexte partagée prompt+réponse). Les 2 warnings foundation-without-practice
résolus.

## 6. Fondations data durcies (CP4)
pandas-data-wrangling, data-cleaning-quality, etl-pipelines : on-ramp « comprendre une donnée
avant DataFrame » + prérequis rédigés + pratique. 4 exercices : data-quality-detect,
data-missing-strategy, etl-pipeline-order, table-groupby.

## 7. Stats→ML (CP5) & pont production (CP6)
CP5 : chaîne stats→ML déjà durcie et pratiquée (V33) → vérifiée, aucun trou → pas de commit
vide. CP6 : drift enseigné mais non pratiqué → exercice ml-drift-detect créé, relié à
llm-observability.

## 8. Audit exercices (CP7)
223 exercices (+6 V34). Suite data/ML complète (leakage/split/confusion/overfit V33 +
qualité/manquants/ETL/group-by/context-budget/drift V34). Aucun doublon → pas de commit vide.

## 9. Curriculum Graph IV (CP8)
Warnings **13 → 7** : prérequis déclarés pour les 4 leçons non-ML concept-without-foundation
(git-advanced, caching-performance, monitoring-production, system-design-interview). Restants (7,
0 bloquant) documentés : 6 advanced-before-prerequisite (dépendances conceptuelles légitimes,
non supprimées), 1 concept-not-practiced (hors thème). Aucun nouveau diagnostic (les 9 suffisent).
Trajectoire warnings V32→V33→V34 : 15 → 13 → 7.

## 10. Parcours Data/ML (CP9) — RESTE ANNONCÉ
Décision honnête. Contenu prêt (toutes leçons P3, pratique reliée), MAIS le programme 365j est
un cursus AI-Engineer intégré (jours data/ML entrelacés) : un parcours par plages contiguës
dupliquerait la colonne vertébrale AI-Engineer, un filtrage par compétence donnerait des sauts
de jours. Blocker STRUCTUREL (packaging), documenté (`v34-data-ml-track-matrix.md`). Pas de
greenwashing. La chaîne reste suivable via ai-engineer-foundations-v1.

## 11. Glossaire (CP10)
+13 termes data/ML (dataset, data quality, imputation, outlier, encoding, normalization,
feature engineering, generalization, hyperparameter, reproducibility, train-serving skew,
concept drift, group by ; 705 au total).

## 12. Hardening rétroactif (CP11)
recursion (premier-contact Fondations) durcie : on-ramp « compter les fichiers d'une
arborescence de profondeur inconnue » + prérequis. Une leçon élevée réellement au standard,
pas 20 maquillées.

## 13. Métriques avant / après

| | Fin V33 | Fin V34 |
| --- | --- | --- |
| Leçons | 110 | 110 |
| Exercices | 217 | **223** (+6) |
| Missions | 40 | 40 |
| Playbooks | 39 | 39 |
| Glossaire | 692 | **705** (+13) |
| Tests | 1016 | **1030** (+14) |
| Gates actives | 13 | **14** |
| Warnings Curriculum Graph | 13 | **7** |
| foundation-without-practice | 2 | **0** |
| Leçons sans on-ramp | 16 | **12** |

## 14. Ce qui existait déjà (anti-duplication)
10 exercices Docker (relié, non recréé), toute la chaîne stats→ML→DL→transformers→LLMOps (V33,
vérifiée), les moteurs (catalogue, curriculum-graph, exercise, pedagogy-audit) — réutilisés.

## 15. Ce qui a été corrigé / ajouté
Corrigé : 3 data foundations + recursion (on-ramp/prérequis), 4 warnings graphe (prérequis
déclarés), 2 foundation-without-practice (liens). Ajouté : 6 exercices déterministes, 13 termes
de glossaire.

## 16. Validations réellement réalisées
generate idempotent (days-dirty=0), v34:check vert (4 critiques), 14 gates actives vertes,
1030 tests, tsc OK, next build OK, navigateur 375/768/1024/1440/1920 (6/7 pages parfaites).

## 17. Validations NON réalisées / limites
Débordement 6px sur data-cleaning-quality @375px (bloc de code) — PRÉ-EXISTANT (identique à
HEAD 0587e1f), pas une régression V34 → V35. Aucun test d'accessibilité axe. Aucun entraînement
ML réel (volontaire).

## 18. Réel vs simulé
RÉEL : calcul local des exercices, tests, graphe. SIMULÉ (étiqueté) : datasets/tokens/scores
fournis. JAMAIS : entraîner un modèle, exécuter pandas/sklearn, appeler un LLM, réseau.

## 19. progress.json
Baseline CP0 (`323604021055588a9528a86875f36598dbdc7758`) restaurée à l'identique, gitignorée.

## 20. Dette restante (P1/P2)
P1 : packaging parcours data-ml-v1 ; 12 leçons sans on-ramp (rétroactif). P2 : 7 warnings graphe
documentés ; débordement 6px.

## 21. État Git final
Branche `claude/ai-career-os-saas-phfg49`. Commits CP1→CP11 atomiques, poussés. local == origin,
tree propre, 0 serveur résiduel.

## 22. Résumé avant → après
Les fondations data (pandas, nettoyage, ETL) passent de « contenu correct mais sans rampe ni
pratique » à « franchissables et pratiquées » ; docker et llm-fundamentals sont enfin reliés à
la pratique (0 foundation-without-practice) ; le graphe passe de 13 à 7 warnings par correction
honnête ; le parcours Data/ML est jugé sur preuve (annoncé, contenu prêt, packaging = V35).
110 leçons inchangées — la qualité prime.

---

## 23. Prompt de reprise V35
Voir ci-dessous. **Ne pas démarrer V35 dans cette session.**

---

# Prompt de lancement — Sprint V35 (à démarrer PLUS TARD, PAS maintenant)

> Ce prompt clôt V34. **Ne démarre pas V35 dans cette session.** Rédigé pour être collé tel quel
> au lancement du sprint suivant.

Reprends **AI Career OS** pour le **Sprint V35 — « Packaging du parcours Data/ML + hardening
rétroactif des premiers-contacts + finition responsive »**.

**IMPORTANT — travaille sur l'état RÉEL du dépôt.** Ne suppose jamais que ce résumé V34
correspond encore au repository. Commence par un **CP0 strictement en lecture seule** : audite
l'état réel (git, tests, build, gates, leçons, exercices, missions, playbooks, glossaire,
parcours, Curriculum Graph, serveurs résiduels, baseline progress.json) et présente un
**rapport d'audit CP0 en français AVANT toute implémentation**. Si V35 est déjà (partiellement)
livré, NE RECOMMENCE RIEN.

**Langue** : rapports, audits, synthèses et prompt V36 final en **français**.

**Priorité (inchangée)** : pédagogie > cohérence des parcours > pratique > preuves > outillage >
UI. Une excellente leçon vaut mieux que cinq superficielles. L'audit CP0 fait foi.

**État attendu (à VÉRIFIER)** : branche `claude/ai-career-os-saas-phfg49`, HEAD final V34,
~110 leçons, ~223 exercices, 40 missions, 39 playbooks, ~705 glossaire, 14 gates, ~1030 tests.
Curriculum Graph : ~7 warnings, 0 bloquant, 0 foundation-without-practice.

**Objectif central V35 — décider et livrer le packaging du parcours Data/ML :**
Sur la base de `docs/architecture/v34-data-ml-track-matrix.md`, TRANCHER honnêtement :
- soit construire une séquence de jours DÉDIÉE et DISTINCTE pour `data-ml-v1` (structure de
  modules → jours data-driven, sans dupliquer le curriculum ni recopier la colonne vertébrale
  AI-Engineer), écrire `dataMlModules(program)`, promouvoir le track `announced → available`,
  ajouter missions/preuves de parcours, et vérifier l'e2e module→jour→leçon→exercice→compétence
  →preuve ; mettre à jour les tests de catalogue (availableIds) ;
- soit CONFIRMER qu'aucune séquence distincte cohérente n'émerge et le laisser annoncé, en
  documentant définitivement pourquoi (et éventuellement retirer l'entrée annoncée si elle
  n'a pas d'horizon crédible). Aucun greenwashing.

**Objectif secondaire V35 — hardening rétroactif des premiers-contacts :** durcir un
sous-ensemble RÉALISTE (4-6, qualité > quantité) des 12 leçons sans on-ramp, en priorité
premier-contact et fortement traversées (git-advanced, ci-cd, observability-logging,
deployment-secrets…), en ADDITIF (on-ramp + prérequis + pratique reliée si un exercice existe).
Relier une pratique existante avant d'en créer.

**Objectif tertiaire V35 — finition responsive :** corriger le débordement 6px de
data-cleaning-quality @375px (bloc de code) et scanner les leçons à blocs de code larges pour
un `overflow-x` propre — petit correctif ciblé, PAS une refonte UI.

**Contraintes (inchangées)** : local, mono-utilisateur, sans auth/SaaS/réseau, sans dépendance
lourde, sans faux runtime ML, sans second moteur/base. Réutiliser le Curriculum Graph comme
auditeur. `progress.json` sauvegardé puis restauré (gitignoré, jamais commité). Aucun secret,
aucune fuite de solution/test privé.

**Gates** : garder `v26→v34:check` actifs. Nouveau contrat → `v35:check` ciblé et testé.
Attention aux faux positifs du scan d'authoring (`à compléter`, `TODO`, `XXX`).

**Checkpoints** CP0→CP11 (audit → design → implémentation → tests → tsc → build → validation
navigateur → restauration progress → cleanup → commit → push), un commit par CP réellement
terminé, pas de commit vide. CP11 obligatoire : ré-audit + walkthrough + matrice P0→P3 dans
`docs/PEDAGOGICAL-AUDIT-V35.md` + évolution chiffrée des warnings + prompt V36 (sans démarrer).

**Critères de refus** : remplissage, jargon non introduit, fausse profondeur, gonflage de
scores, longueur = qualité, fausse exécution IA/ML, greenwashing d'un parcours, contenu créé
sans besoin réel.

**Livrable final** : `docs/SPRINT-V35.md` + synthèse française (existant / ajouté / corrigé /
testé / non testé / simulé / insuffisant), chiffres avant/après, dette restante, HEAD final.

**Commence maintenant par CP0. N'implémente rien avant d'avoir présenté le rapport CP0.**
