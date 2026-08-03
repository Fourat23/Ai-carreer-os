# Audit pédagogique V22 — Cloud Topology Lab & Deployment

Rapport d'audit (CP10). Fondé sur l'exécution réelle du modèle
`lib/pedagogy-audit.mjs` (scan de danger + registre de notes humaines) et sur la
**lecture effective** des contenus Cloud livrés en V22. **Aucun contenu n'a été
modifié pour améliorer une note** : l'audit constate, il ne maquille pas. Les
seules corrections envisageables sont celles justifiées par un défaut **démontré**.

## 1. Méthodologie

Trois niveaux, cohérents avec les audits V20/V21 :

- **Niveau A** — audit des ajouts V22 : jours d'ancrage 78-81 (enrichis
  additivement), les 14 exercices `cloud-*`, les 6 missions `cloud-*`, plus le
  code du laboratoire (`lib/topology*.mjs`) et les 3 topologies livrées.
- **Niveau B** — scan de danger **toujours actif** sur l'ensemble des contenus.
- **Niveau C** — rappel des audits antérieurs (V19 Linux/réseau, V20 Docker/
  terminal, V21 CI/CD), rejoués pour vérifier l'absence de régression.

La rubrique compte **16 dimensions** notées 0-4. Une note de qualité est
**humaine** ; l'automatisation ne fournit que des **signaux structurels**
(informatifs) et des **signaux de danger** (bloquants). Aucune note n'est dérivée
d'un comptage de mots. Le registre `docs/architecture/v20-pedagogy-audit.json`
(registre vivant, étendu à **68 items**) consigne les notes ; la gate
`v20:pedagogy-check` les valide contre les seuils.

## 2. Périmètre V22

- **4 journées** d'ancrage réelles enrichies : 78 (3-tiers → cloud), 79
  (observabilité → HA), 80 (cache → scalabilité), 81 (trade-offs → déploiement/
  régressions/reprise).
- **14 exercices déterministes** (`cloud-*`) rattachés aux jours 78-81.
- **6 missions d'ingénierie** (`cloud-*`) : 2 documentation, 1 performance,
  3 incident.
- **Code** : `lib/topology.mjs`, `topology-analysis.mjs`, `topology-scenario.mjs` ;
  3 topologies `data/topologies/*.json`.
- **23 nouveaux éléments notés à la main** (4 jours + 14 exercices + 6 missions).
- **Scan de danger : 30 fichiers V22 → 0 signal bloquant** (490+ fichiers au total
  via la gate).

## 3. Limites de l'audit (honnêtes)

- L'audit **statique** détecte l'absence de composants et des dangers factuels ;
  il **ne mesure pas** la qualité d'un raisonnement — d'où les notes humaines.
- Un audit ne remplace pas **l'observation d'un apprenant réel**.
- La qualité **sémantique** des livrables « document/plan » des missions (HLD,
  plan de reprise, rapport d'incident) n'est **jamais** notée automatiquement.
- V22 n'ajoute **aucune** revendication de cloud réel : le laboratoire est
  **déterministe et local**. L'audit vérifie que cette limite est **explicitée**.

## 4. Résultat global

- **Sécurité/exactitude : 0 signal bloquant.** Aucune promesse d'isolation OS,
  aucun chiffre de disponibilité/coût inventé présenté comme réel, aucun secret,
  aucune commande destructive, aucun bloc de code non fermé. La vue publique des
  topologies **ne fuit aucun champ interne** (vérifié par `v22:check`).
- **Structure** : jours 78-81 conservent leurs composants pédagogiques
  (100 % structurel) ; l'enrichissement est **additif**.
- **Moyenne des notes humaines** : **≈ 3,50/4** (jours), **3,56/4** (exercices),
  **3,50/4** (missions). Tous les éléments dépassent le seuil récent (≥ 3,25).
- **Aucun défaut démontré** n'appelle de correction de contenu en V22.

## 5. Matrice des notes V22 (extrait)

| Élément | Type | Moyenne | Dimension la plus basse |
|---|---|---|---|
| day-78 (3-tiers → cloud) | jour | 3,50 | charge cognitive (3, dense) |
| day-79 (HA & observabilité) | jour | 3,50 | charge cognitive (3) |
| day-80 (scalabilité & coûts) | jour | 3,50 | charge cognitive (3, la plus longue) |
| day-81 (déploiement & régressions) | jour | 3,50 | charge cognitive (3) |
| exercices `cloud-*` (×14) | exercice | 3,56 | depth (3, brique focalisée) |
| cloud-three-tier / backup-recovery | mission | 3,50 | évaluation (3, structurel+revue) |
| cloud-high-availability / broken-release / secure-exposure | mission | 3,50 | évaluation (3) |
| cloud-cost-reduction | mission | 3,50 | évaluation (3) |

Registre complet : **68 items** (62 récents), tous ≥ seuil.

## 6. Défauts

### Bloquants
**Aucun.** Le scan de danger ne remonte aucun signal bloquant sur le contenu V22.

### Majeurs
**Aucun** dans le périmètre V22. Les défauts majeurs restants (quiz absent sur des
journées de **base**) sont hors périmètre, déjà documentés (V20).

### Mineurs
- **Exercices `cloud-*`** : `depth` à 3 — voulu : chaque exercice isole une
  micro-compétence déterministe (classer un tier, détecter un SPOF, calculer un
  RPO…). La profondeur conceptuelle vit dans les **jours 78-81** ; les exercices
  l'**appliquent**. Non corrigible sans dénaturer le contrat d'exercice.
- **Jour 80** : c'est désormais la journée la plus longue du module (cache +
  cloud). Charge cognitive 3. Contenu excellent ; un fractionnement visuel serait
  un confort, pas un correctif.

## 7. Contenu excellent à préserver

- **Jours 78-81** : distinguent IaaS/PaaS/SaaS/FaaS et la **responsabilité
  partagée** ; posent le **SPOF/failover/HA**, le **stateless vs stateful**,
  l'**autoscaling** ; clarifient le vocabulaire de livraison
  (**rollback/roll-forward/hotfix/mitigation/workaround**) ; sont **honnêtes**
  (chiffres de disponibilité/coût mesurés ou ordres de grandeur, jamais inventés).
- **Laboratoire** (`lib/topology*.mjs`) : modèle **pur**, analyse et scénario
  **déterministes**, **aucun** `eval`/`exec`/`shell`/réseau, vue publique
  anti-fuite. Diagnostics avec **preuve + recommandation + compromis**, jamais de
  note magique.
- **Exercices** : déterministes, référence 100 % verte, starter échoue ≥ 1 test
  public, tests privés cachés, compétences **connues** — jamais de compétence
  fictive.
- **Missions** : scénarios crédibles (3-tiers, HA, coût, reprise, déploiement
  cassé, exposition) ; évaluation **honnête** (auto + structurel + revue humaine).

## 8. Superficiel / à surveiller

- Aucun contenu V22 sous le seuil. Les exercices les plus simples (difficulté 1-2 :
  classer un tier, multi-zone) restent **utiles et corrects** ; leur faible
  profondeur est **assumée** (briques du raisonnement d'architecture).

## 9. Progression, redondances, alignement

- **Progression** : 78 pose le modèle (déploiement du 3-tiers) → 79 la
  disponibilité → 80 la mise à l'échelle → 81 la livraison et les régressions. Les
  exercices vont de la brique (classer, multi-zone) au raisonnement (blast radius,
  décision de reprise) ; les missions intègrent plusieurs briques.
- **Redondances** : aucune duplication — les missions **référencent** les
  exercices (`exerciseRefs`) au lieu de recopier leur énoncé.
- **Alignement** : exercices ↔ compétences connues ; missions ↔ topologies
  (`three-tier-ha`, `exposed-monolith`, `canary-no-metric` incarnent les
  situations diagnostiquées).
- **Cohérence parcours** : `trackScope` inclut `systems-cloud-foundations-v1` — le
  cloud **prolonge** Linux/réseau (V19), Docker (V20) et CI/CD (V21).

## 10. Comparaison V19 / V20 / V21 / V22

- **V19** Linux/réseau, **V20** Docker/terminal borné, **V21** CI/CD déterministe,
  **V22** topologie cloud déterministe : même philosophie — **comprendre par la
  simulation locale et honnête**, jamais de fausse promesse (pas de runner CI, pas
  de cloud réel, pas d'isolation OS). Les quatre vagues dépassent les seuils sans
  régression mutuelle.

## 11. Plan de correction priorisé

### À corriger dans V22 (CP10)
**Rien.** Aucun défaut démontré ne justifie une modification de contenu. Toute
retouche serait cosmétique et risquerait une régression — écartée conformément au
principe « corriger seulement un défaut prouvé ».

### À reporter (hors périmètre V22)
- Généralisation des **quiz** aux journées de base sans rappel actif.
- **Observation d'apprenants réels** sur le Cloud Topology Lab.
- Édition **libre** de topologie dans le Lab (au-delà de l'analyse et des
  scénarios bornés) — dette UI documentée.
- Section professionnelle « **Que faire dans ce cas ?** » — préparée par
  l'architecture (ADR-022), non créée en V22 pour éviter une section décorative.

### À ne pas modifier
- Le contrat d'exercice (micro-compétence déterministe, profondeur portée par le
  jour lié).
- La **limite honnête** du laboratoire (« pas un cloud réel, pas d'isolation OS,
  chiffres non contractuels »).

## 12. Bilan avant/après V22

| Dimension | Avant V22 | Après V22 |
|---|---|---|
| Cloud/déploiement (contenu) | absent (archi 3-tiers seule) | **jours 78-81 approfondis** |
| Pratique cloud | aucune | **14 exercices + Cloud Topology Lab** |
| Missions cloud | aucune | **6 missions (doc/perf/incident), évaluation honnête** |
| Laboratoire | — | **modèle pur + 15 règles de diagnostic + 4 scénarios** |
| Glossaire | 397 termes | **440 termes (cloud/livraison/régression)** |
| Danger (scan) | 0 bloquant | **0 bloquant** |
| Moyenne notes récentes | ~3,51 | **~3,52** (maintenue en ajoutant 23 éléments) |

**Ce qui nécessite encore une revue humaine** : la qualité sémantique des
livrables documentaires des missions (HLD, plan de reprise, rapport d'incident) —
validée structurellement, jamais notée automatiquement. **Reporté** : quiz de
base, édition libre du Lab, observation d'apprenants réels.
