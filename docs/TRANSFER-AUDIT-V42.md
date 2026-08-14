# Audit de transfert — Sprint V42

> Définition explicite du transfert (T0–T5), audit des questions TRANSFER V39, création de vrais défis
> T5, et couverture par compétence. Français, factuel, critique. Un score de transfert reste un PROXY.

## 1. Taxonomie retenue (échelle de DISTANCE de transfert)
T0 recall · T1 understanding · T2 application proche · T3 diagnostic · T4 near transfer · T5 deep/far
transfer. Distincte de la taxonomie de Bloom d'`assessment.mjs`. Règle : **un domaine différent ne suffit
pas** — T5 exige un pont conceptuel explicite + changement de domaine + raisonnement multi-étapes
(classifieur conservateur, `lib/transfer-taxonomy.mjs`).

## 2. Audit des 16 questions TRANSFER V39 (reclassement honnête)
Rappel de l'audit V40 : 8 « solides » (T4), 7 « single-hop » (T3/T4-faible). Actions V42 :
| Question | Action | Avant | Après | Justification |
|---|---|---|---|---|
| containers-kubernetes::q5 (thermostat) | **REWRITE** | T3 | **T4** | multi + hypothèses concurrentes (chiffrement, plan figé) + rejet du faux fix |
| react-frontend-state::q5 (dashboard) | **REWRITE** | T3 | **T4** | multi ; le rechargement corrige → écarte le cache serveur (2e inférence) |
| observability-incident::q5 (atelier) | **REWRITE** | T3 | **T4** | multi ; un rappel individuel sans changement systémique ne prévient pas la récidive |
| async-messaging-queues::q5, cloud-devops::q5, git-linux::q5, system-design::q6 | **KEEP** | T3/T4-faible | inchangé | amorces de near-transfert assumées ; reclasser serait malhonnête |
| 8 questions « solides » | **KEEP** | T4 | inchangé | déjà de vrai near-transfert |

**Aucun reclassement malhonnête ; aucun gonflage** (TRANSFER reste 16 questions). Les 3 REWRITE exigent
désormais de discriminer et de raisonner en deux temps.

## 3. Défis de transfert profond créés (T5)
5 défis (`data/transfer-challenges/`), chacun avec pont conceptuel explicite + changement de domaine :
| Défi | Pont conceptuel | Domaines |
|---|---|---|
| idempotence-http-to-queue | idempotence HTTP → consommateur de file | http, archi |
| leakage-to-evaluation | fuite de données ML → méthodologie d'évaluation générale | ml, evalia |
| retrieval-to-search | récupération RAG → recherche+synthèse non-LLM | rag, se |
| isolation-sql-to-concurrency | isolation SQL → ressource partagée (fichier) | sql, se |
| cache-to-distributed-consistency | invalidation de cache → cohérence des répliques | archi, sql |

Chacun : questions discriminantes (multi/predict) multi-étapes, auto-cohérence 100 %, domaines simulés
étiquetés. Le classifieur confirme T5 (pont + cross-domain + multi-étapes).

## 4. Couverture par compétence (honnête)
| Couvert par un défi T5 | Non couvert (dette V43, signalé par le gate) |
|---|---|
| http, archi, ml, evalia, rag, se, sql | **algo, ds, jsts, secu, cloud** |
Le gate `v42:check` émet un avertissement `skill-without-transfer` pour ces 5 compétences structurantes :
c'est un **trou assumé**, pas masqué.

## 5. Misconceptions → remédiation
7 idées fausses réelles reliées à des leçons/exercices précis (retry≠idempotence, percentile≠moyenne,
index n'accélère pas tout, Secret K8s non chiffré, useEffect≠lifecycle, récupération≠génération,
corrélation≠causalité). Remplace « relis le cours » par une remédiation ciblée.

## 6. RÉEL / SIMULÉ / PROXY / NON FAIT
- **RÉEL** : correction déterministe (auto-cohérence 100 % testée), classifieur conservateur testé,
  diagnostic de graphe, gate.
- **SIMULÉ** : contextes distribués/RAG/ML décrits, jamais exécutés.
- **PROXY** : réussir un défi = indice de transfert, pas une maîtrise prouvée.
- **NON FAIT (dette V43)** : défis pour algo/ds/jsts/secu/cloud ; UX dédiée aux défis ; familles de
  variantes à grande échelle ; variantes de capstones.

## 7. Limites
Les niveaux T sont des jugements structurels d'un seul auteur ; ils décrivent l'EXIGENCE des tâches, pas
un transfert humain mesuré.
