# Audit pédagogique — Sprint V40 (Professional Engineering Simulation & Integrated Capstones)

> Ajout d'une couche de SIMULATION PROFESSIONNELLE : 5 capstones multi-phases qui font raisonner
> l'apprenant sur des situations ambiguës (signal → hypothèses → preuves → diagnostic → décision →
> validation → communication), composés au-dessus des moteurs existants. Français, factuel, sans langage
> promotionnel. Un score de capstone est un PROXY de raisonnement, jamais une preuve de maîtrise. Les
> infrastructures décrites sont SIMULÉES.

## 1. Méthodologie
Audit CP0 lecture seule d'abord (missions/assessments/skill-state/review/graph), puis conception
(ADR/HSD/TSD-040), implémentation par composition, tests, gate `v40:check`, audit TRANSFER V39,
walkthrough, hardening. Commande de comptage **canonique** : `npm test`. Chaque capstone est jugé par
dimension (valeurs : insuffisant / faible / moyen / bon / fort / excellent), sans « excellent »
automatique.

## 2. EXISTAIT DÉJÀ (réutilisé, non dupliqué)
`lib/assessment.mjs` (gradeQuestion — cœur du scoring), `lib/skill-state.mjs` (états), `lib/review.mjs`
(révision), `mission-state.recordMissionCompletion` (patron d'evidence), `lib/curriculum-graph.mjs`,
exercices, playbooks, Labs. **Aucun second moteur créé.**

## 3. CRÉÉ
- `lib/capstone.mjs` (+ `.d.ts`, `capstones-server.ts`) : modèle pur de composition (validation, scoring
  par phases via gradeQuestion, evidence, remédiation).
- **5 capstones** (`data/capstones/*.json`) : Backend/incident, Frontend/React, Cloud/K8s, Applied AI/RAG,
  Data/ML — 5 domaines.
- `scripts/v40-check.mjs` (gate, 20e), extension du Curriculum Graph (nœud `capstone`, `dead-capstone-ref`).
- UX `/capstones` + `/capstones/[id]`. 1 playbook (`rag-retrieval-regression`, manque révélé).
- Tests : `v40-capstone-model`, `v40-loop`, `v40-catalogue`, `v40-graph` (30 tests).
- Docs : ADR/HSD/TSD-040, TRANSFER-AUDIT-V40, WALKTHROUGH-V40.

## 4. MODIFIÉ
`lib/learning.mjs` (`EVIDENCE_TYPES` += `capstone`, additif) ; `data/capstones/applied-ai-rag-regression`
(reliure au nouveau playbook). Aucune leçon de fond modifiée.

## 5. Matrice d'audit par capstone (dimensions clés)
Néo = compréhension néophyte · Pro = réalisme pro · Amb = ambiguïté contrôlée · Art = qualité artefacts ·
Diag = qualité diagnostic · Prof = profondeur · Trf = transfert · Int = intégration multi-compétences ·
FB = feedback · Rem = remédiation · Hon = honnêteté réel/simulé.

| Capstone | Domaines mobilisés | Néo | Pro | Amb | Art | Diag | Prof | Trf | Int | FB | Rem | Hon |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| backend-latency-after-release | HTTP, SQL, SE, observabilité, incident | fort | fort | fort | fort | fort | fort | bon | fort | fort | fort | excellent |
| frontend-react-regression | JS/React, a11y, testing, comm | fort | fort | fort | fort | fort | fort | bon | fort | fort | fort | fort |
| cloud-k8s-partial-outage | Cloud, K8s, SRE, réseau, incident | bon | fort | fort | fort | fort | fort | bon | fort | fort | fort | excellent |
| applied-ai-rag-regression | RAG, LLM, éval IA, sécurité | bon | fort | fort | fort | fort | fort | bon | fort | fort | fort | excellent |
| data-ml-validation-production-gap | ML, éval IA, données | bon | fort | fort | fort | fort | fort | fort | fort | fort | fort | excellent |

Chaque capstone : 7 phases, 8 artefacts (≥1 bruit), cause NON donnée (anti-leak vérifié par le gate),
auto-cohérence 100 % (tests). Transfert : chaque capstone porte au moins une question TRANSFER exigeant
une transposition (batch d'appels hors ORM ; principe recherche→synthèse hors RAG ; évaluation fidèle au
réel hors ML…).

## 6. Verdict par dimension (global V40)
| Dimension | Verdict | Justification |
|---|---|---|
| Intégration multi-compétences | FORT | 4-5 domaines par capstone, phases enchaînées ; ce n'est pas un QCM emballé. |
| Raisonnement d'ingénieur | FORT | signal → hypothèses → preuves → diagnostic → décision → validation → communication. |
| Transfert | BON→FORT | 1 vraie question de transposition par capstone + audit honnête des TRANSFER V39 ; profondeur portée par les capstones, pas les MCQ isolés. |
| Authenticité du problème | FORT | incidents réalistes (N+1 post-release, probe désalignée, régression retrieval, fuite de données). |
| Ambiguïté contrôlée | FORT | plusieurs hypothèses plausibles, toujours tranchables par les preuves ; jamais deux réponses également correctes. |
| Qualité des artefacts | FORT | signal + bruit crédibles ; le tri fait partie de l'exercice. |
| Réutilisation de l'existant | FORT | scoring, evidence, graphe, leçons/exos/playbooks/Labs réutilisés ; 1 seul playbook créé. |
| Honnêteté réel/simulé/proxy | EXCELLENT | SIMULATION étiquetée partout ; score = proxy ; jamais « mastered » automatique ; aucune fausse infra. |
| Boucle preuve→remédiation | FORT | capstone→evidence→skill-state→remédiation→review, testée ; échec → remédiation exploitable. |
| Accessibilité néophyte | BON | contexte concret d'abord ; vocabulaire couvert par les prérequis (une glose inline mineure : « eager loading »). |
| Charge cognitive | BON | 7 phases denses ; assumé pour une simulation professionnelle (difficulté 3-4). |
| Absence de solution leak | FORT | gate anti-leak (réponse de diagnostic absente du signal/contexte) : 0 fuite. |

## 7. RÉEL / SIMULÉ / PROXY / NON TESTÉ
- **RÉEL** : correction déterministe des 5 capstones (auto-cohérence 100 % en test) ; boucle
  evidence→skill-state (test) ; graphe 0 bloquant ; build ; validation navigateur 21/21 (5 largeurs).
- **SIMULÉ** : TOUS les artefacts d'infrastructure (K8s, cloud, broker, RAG, ML) — aucun service exécuté.
- **PROXY** : le score de capstone est un indice de raisonnement, pas une mesure d'apprentissage.
- **NON TESTÉ** : aucun apprentissage humain mesuré ; aucune exécution réelle d'infra ; aucune adaptation
  « intelligente » (il n'y en a pas).

## 8. AVANT → APRÈS (mêmes commandes)
| Métrique (commande) | Avant V40 | Après V40 |
|---|---|---|
| Tests (`npm test`) | 1112 | **1141** |
| Gates (`gates:active`) | 19 | **20** |
| Capstones (`ls data/capstones`) | 0 | **5** |
| Playbooks (`ls data/playbooks`) | 44 | **45** |
| Évaluations diagnostiques | 16 | 16 (inchangé) |
| Leçons / exercices / missions | 128 / 238 / 42 | inchangés (aucun gonflage) |
| Curriculum Graph bloquant | 0 | **0** |
| tsc / build | 0 / OK | **0 / OK** |

## 9. DETTE RESTANTE (sans euphémisme)
- Les capstones **n'écrivent pas** d'evidence dans `progress.json` depuis l'UX (choix de sûreté) : la
  boucle est prouvée par fonctions pures + tests, mais un apprenant ne « capitalise » pas encore
  automatiquement un capstone réussi dans sa progression. Candidat V41 (bouton opt-in réutilisant le flux
  existant).
- Le transfert reste majoritairement du **near-transfer** ; le far-transfer (contexte très éloigné,
  plusieurs sauts) n'est pas encore outillé.
- « eager loading » n'est pas au glossaire central (glosé inline). Glossaire à compléter un jour.
- Un seul capstone par domaine : pas de variété de scénarios au sein d'un même domaine (assumé, qualité
  > quantité).
- La phase `communication` est évaluée structurellement (choisir les bons éléments), pas sur la qualité
  rédactionnelle réelle — limite assumée d'un système déterministe local.

## 10. VERDICT GLOBAL
**FORT.** V40 fait réellement passer la plateforme d'un enchaînement cours→exercice→assessment à une
simulation du travail d'ingénieur (raisonnement multi-phases, artefacts signal+bruit, diagnostic par
preuves), en composant l'existant sans second moteur et sans fausse infrastructure. Ce n'est pas
« excellent » car il reste de la dette honnête (pas de capitalisation auto en progression, transfert
surtout near, un seul scénario par domaine). Aucun greenwashing : simulation et proxy sont étiquetés
partout.

## 11. Limites de l'audit
Notes d'un seul auteur ; proxys structurels/qualitatifs, non une mesure d'apprentissage humain. La
validation navigateur observe rendu/débordement/erreurs console. Aucune exécution d'infrastructure réelle,
par conception (local/déterministe).
