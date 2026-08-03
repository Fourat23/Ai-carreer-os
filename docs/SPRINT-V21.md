# Sprint V21 — CI/CD Pipeline Lab & Delivery Engineering

Rapport de clôture. Livraison d'un **simulateur de pipeline CI/CD local,
déterministe et sûr** — modèle générique, orchestration DAG, déclencheurs
évaluables, actions internes sur allowlist fermée, un **Pipeline Lab** (UI + API),
du contenu CI/CD approfondi, des exercices et missions déterministes, une
intégration au parcours Systems & Cloud, et un audit pédagogique réel.

> **Nature honnête du livrable** : ce n'est **pas** un runner CI réel. Aucune
> intégration GitHub Actions / GitLab / Jenkins / Azure, **aucun réseau**, aucun
> secret réel, **aucune** revendication d'isolation OS. Un pipeline se **raisonne**
> ici (statuts, DAG, chemin critique) par simulation déterministe. La seule
> exécution « réelle » est un `node --check` (parse de syntaxe, **sans exécution
> de code**), plus restrictif encore que le terminal borné de V20.

---

## 1. État initial, périmètre et divergence avec le prompt

- **Base de départ** : fin V20 (terminal borné + Docker foundations + audit
  pédagogique). 4ᵉ parcours `systems-cloud-foundations-v1` présent.
- **CP0 (lecture seule)** a confirmé : aucune brique CI/CD, jours d'ancrage réels
  307 (CI vide) et 326 (CI partielle) dans le projet DocSense (mois 11),
  `progress.json` gitignoré au SHA pristine `cea317e8`.
- **Divergence assumée** : le prompt évoque un « pipeline » — livré comme
  **simulateur déterministe**, jamais comme exécuteur CI réel. Cette limite est
  écrite dans le contenu (jour 326) et dans ADR-021. Les jours d'ancrage n'ont
  **pas** été déplacés : le contenu CI/CD enrichit **additivement** 307 et 326.
- **Gates historiques** : `v17:check` et `v19:check` sont des instantanés **gelés**
  qui échouent après des changements de contenu ultérieurs légitimes (documenté
  dans `docs/architecture/v20-gates-strategy.md`) — **pas** des régressions V21.

## 2. Checkpoints CP0 → CP10 et commits

| CP | Objet | Commit |
|---|---|---|
| CP0 | Audit lecture seule (rapport avant implémentation) | — (read-only) |
| CP1 | ADR/HSD/TSD-021 (Pipeline Lab) | `898a02a` |
| CP2 | Modèle de pipeline **pur** + validation | `c60aa54` |
| CP3 | Orchestrateur **déterministe** + actions internes (allowlist) | `dbd3d62` |
| CP4 | Adaptateur local **borné** (`node --check`, parse seul) | `e196da0` |
| CP5 | Pipeline Lab (UI + API + 3 définitions) | `8d224f3` |
| CP6 | CI/CD approfondi (jours 307/326) + gate `v21:check` | `3293135` |
| CP7 | 12 exercices + 4 missions CI/CD | `5fea8f1` |
| CP8 | Audit pédagogique réel (rapport + registre) | `2285727` |
| CP9 | Intégration (parcours, glossaire, recherche) | `a2be2d5` |
| CP10 | Validation finale + ce rapport | (ce commit) |

Chaque checkpoint : audit → implémentation → tests → `tsc` → build (si pertinent)
→ validation réelle → restauration `progress.json` → nettoyage → commit → push.

## 3. Architecture livrée

- **`lib/pipeline.mjs`** — modèle **pur, sans I/O**. `validatePipeline` (ids, needs
  résolus, DAG acyclique via `topoOrder`/`findCycle`, bornes `PIPELINE_CAPS`,
  sûreté des `with` : anti-secret inline, anti-traversée, clés dangereuses),
  `publicPipelineView` (retire les fixtures `with`, masque les secrets `***`),
  `maskSecrets`. 10 `ACTION_KINDS`, 7 `JOB_STATUSES`, 5 `TRIGGER_KINDS`.
- **`lib/pipeline-engine.mjs`** — `runPipeline` **déterministe** (horloge
  injectable, durées fixes) : `resolveTrigger` (kind + filtres de branche/tag),
  ordre topologique, checks par job (annulation demandée → dépendance bloquée →
  fail-fast → condition → action), statut global `failed > cancelled > blocked >
  success`. Cycle → `failed` (E_CYCLE) sans exécution.
- **`lib/pipeline-actions.mjs`** — allowlist **fermée** : chaque action est une
  fonction pure `(job, ctx) → {status, logs, artifacts?}` sur la fixture `with`,
  logs plafonnés, secrets masqués. Action inconnue → `failed` (E_UNKNOWN_ACTION).
  **Jamais** de config transformée en commande système ; **aucun** `eval` ;
  **aucun** `shell:true`.
- **`lib/pipeline-local.mjs`** — adaptateur **borné** : `execFile(process.execPath,
  ['--check', fichier], { shell:false, timeout, killSignal:'SIGKILL', env minimal,
  cwd:workspace })`. Parse de syntaxe **sans exécution**, workspace temporaire,
  nettoyage systématique, détection Docker facultative (jamais requise).
- **Pipeline Lab** — `app/pipelines` (catalogue filtrable + URL) et
  `app/pipelines/[id]` (visualisation stages/jobs, déclenchement d'événement,
  statuts, logs en clair, artefacts) ; API `app/api/pipelines/[id]` (GET vue
  publique + disponibilité ; POST `run`/`reset` **synchrone déterministe**).

## 4. Contenu pédagogique CI/CD

- **Jour 307** (CI vide → vocabulaire) : pipeline / stage / job / runner / trigger,
  walking skeleton appliqué à la CI (~1552 mots, structure 100 %).
- **Jour 326** (CI approfondie, ~2055 mots, structure 100 %) : CI vs livraison
  continue vs déploiement continu, anatomie de pipeline, **DAG / parallélisme /
  chemin critique**, statuts & **fail-fast**, déclencheurs & branch-policy,
  **artefact vs cache**, secrets & environnements, **promotion / rollback**,
  **blue-green / canary**, tests **flaky** & dette de pipeline, observabilité.
- **12 exercices déterministes** (`cicd-*`) rattachés au jour 326 : `trigger-
  should-run`, `topo-order`, `detect-cycle`, `global-status`, `mask-secrets`,
  `branch-policy`, `cache-key`, `critical-path`, `stale-artifact`, `env-promotion`,
  `fail-fast`, `missing-deps`. Chacun : référence 100 % verte, starter échoue ≥ 1
  test public, tests privés cachés, compétences **connues** uniquement.
- **4 missions d'ingénierie** (`cicd-*`) : `broken-pr` (incident), `blocked-
  delivery` (incident), `slow-flaky` (performance), `secret-in-logs` (incident).
  Livrables **auto + structurel + revue humaine** ; reliées aux exercices et au
  jour 326 ; aucun pseudo-score.
- **Glossaire** : +9 termes CI/CD manquants (pipeline, stage, job, runner,
  artefact, fail-fast, branch policy, chemin critique du pipeline, promotion)
  → **397 entrées**, schéma/relations/unicité valides.

## 5. Audit pédagogique (CP8)

- Modèle réel `lib/pedagogy-audit.mjs` : **scan de danger** (490 fichiers,
  **0 signal bloquant**) + **registre de notes humaines** validé contre les seuils.
- Registre étendu à **45 items** (39 récents) — 16 nouveaux (12 exercices + 4
  missions) notés à la main, argumentés par élément. Moyennes : **3,51/4**
  (exercices), **3,50/4** (missions), tous ≥ seuil récent (3,25).
- **Aucun défaut démontré** n'appelle de correction de contenu : aucune retouche
  cosmétique appliquée (principe « corriger seulement un défaut prouvé »).
- Rapport complet : `docs/PEDAGOGICAL-AUDIT-V21.md` (matrice + limites honnêtes).
- Revue humaine restant nécessaire : qualité **sémantique** des livrables
  documentaires des missions (jamais notée automatiquement).

## 6. Intégration (CP9)

- **Parcours Systems & Cloud** : module `scf-08-cicd` (jours 307/326, **non
  contigus** via liste explicite — sans absorber les jours DocSense intermédiaires) ;
  objectif du parcours étendu à Docker + CI/CD ; **31 jours** (validation stricte
  du catalogue OK, aucune journée dupliquée).
- **Recherche** : les 3 pipelines et la page Pipeline Lab sont **indexés**
  (métadonnées **publiques** uniquement — jamais de fixture `with` ni de secret) ;
  libellés « Missions » et « Pipelines » ajoutés à la palette de commandes.
- **Jour lié** : le jour 326 surface ses 12 exercices et ses missions (via
  `day-exercises.json` et `missionsForDay`).
- **Sauvegarde / révisions / preuves** : inchangées et intactes — un run de
  pipeline est **sans état** (l'API ne persiste rien, aucune écriture dans
  `progress.json`), donc aucune migration ni fuite dans la sauvegarde.
- **Isolation** : aucun workspace, serveur ou conteneur résiduel après exécution.

## 7. Sécurité, anti-fuite et déterminisme

- **Sécurité** : modèle/moteur/actions **purs** — `grep` confirme **0** `eval`,
  `exec*`, `spawn`, `shell:true` hors adaptateur ; l'adaptateur local est
  exécutable **fixe** + `--check` + `shell:false` + `timeout` + `SIGKILL` + env
  minimal. Plus restrictif que le terminal V20.
- **Anti-fuite** : `v21:check` vérifie qu'aucune vue publique de pipeline ne
  contient de fixture `with` ni de secret ; `maskSecrets` masque les motifs
  sensibles (`sk-`, `ghp_`, `AKIA`, `xox`, clés privées, tokens longs).
- **Déterminisme prouvé (E2E)** : sur 2 exécutions à horloge réinitialisée —
  `pr-verify` → **success** (lint→tests→build→artefact) ; `pr-broken` →
  **failed** (échec + dépendant **bloqué** + indépendant **annulé**) ;
  `deploy-staging` → **blocked** sans approbation, **success** avec approbation.
  Statuts identiques d'un run à l'autre.

## 8. Validation finale, limites honnêtes et dette

**Batterie CP10 (toutes vertes)** :

| Contrôle | Résultat |
|---|---|
| `npm test` | **715/715** |
| `tsc --noEmit` | **0 erreur** |
| `npm run build` | **OK** (/pipelines 108 kB, /pipelines/[id] 109 kB, partagé 103 kB) |
| `curriculum:check` / `curriculum:depth-check` | ✅ |
| `glossary:check` | ✅ (397 entrées) |
| `v18:check` | ✅ (15 missions) |
| `v20:pedagogy-check` | ✅ (490 fichiers, 0 bloquant) |
| `v21:check` | ✅ (3 pipelines, aucune dérive) |
| `v17:check` / `v19:check` | ❌ **gelés** (instantanés historiques, documenté — non-régression) |
| `progress.json` SHA | **cea317e8** (pristine, inchangé) |
| Résidus (workspace/serveur/conteneur) | **aucun** |

**Validation navigateur** : Playwright **indisponible** dans l'environnement
(`@playwright/test` absent) → matrice 375 / 768 / 1024 / 1440 / 1920 **non
automatisée**. Vérification **statique** : le Pipeline Lab réutilise les classes
responsives existantes (`.pl-*`, grilles/flex, `max-width:100%`), sans nouveau
point de rupture ; le build ne signale aucun débordement. **À confirmer** par un
test navigateur réel quand Playwright sera disponible.

**Limites honnêtes** :
- Simulateur **déterministe**, **pas** un runner CI réel ; aucun réseau, aucun
  secret réel, **aucune isolation OS**.
- `node --check` = **parse** de syntaxe, pas exécution de code.
- La qualité sémantique des livrables documentaires des missions relève de la
  **revue humaine**.

**Dette restante (reportée, explicite)** :
- Exécution CI **réelle** (hors périmètre par conception).
- Quiz sur ~77 journées de **base** sans rappel actif (chantier éditorial de masse).
- Observation d'**apprenants réels** sur le Pipeline Lab.
- Matrice navigateur **automatisée** (dépend de Playwright).

## 9. État Git final

- Branche : `claude/ai-career-os-saas-phfg49`, poussée sur `origin`.
- HEAD (avant ce commit) : `a2be2d5` (CP9).
- Données : 110 exercices (12 CI/CD), 15 missions (4 CI/CD), 3 pipelines, 397
  termes de glossaire, 715 tests.
- `progress.json` : SHA `cea317e8714af1fbf2dcb4227130ba5b912d17c9` (pristine).

---

## 10. Prompt de reprise — Sprint V22

> Copier-coller intégral pour démarrer V22 dans une session neuve.

```
Reprends AI Career OS pour le Sprint V22 — « Cloud Foundations Lab & Deployment
Topologies ». AI Career OS est une application d'apprentissage STRICTEMENT LOCALE,
MONO-UTILISATEUR : aucune authentification, aucun SaaS, aucun réseau requis pour
apprendre, aucune télémétrie. Tu prolonges V19 (Linux/réseau), V20 (terminal borné
+ Docker) et V21 (Pipeline Lab CI/CD déterministe).

IMPORTANT — commence impérativement par CP0, EN LECTURE SEULE : lis l'état réel du
dépôt (docs/SPRINT-V21.md, ADR-021, lib/pipeline*.mjs, data/pipelines, le parcours
systems-cloud-foundations-v1, curriculum/days/day-307 et 326), vérifie le SHA de
data/progress.json (attendu cea317e8, gitignoré), établis un rapport d'écart, et
PRÉSENTE-LE avant toute implémentation. Puis exécute CP0 → CP10 de façon autonome.

Objet du sprint : un LABORATOIRE DE TOPOLOGIES DE DÉPLOIEMENT, local, déterministe
et sûr, dans la même philosophie que le Pipeline Lab. Il s'agit de RAISONNER une
architecture de déploiement — pas d'appeler un vrai cloud.

CONTRAINTES DURES (non négociables) :
- PAS de cloud réel : aucune intégration AWS/GCP/Azure/Terraform réel, AUCUN
  réseau, AUCUN identifiant réel, AUCUNE clé. Aucune revendication d'isolation OS.
- Modèle de topologie DÉCLARATIF et PUR (services, réplicas, dépendances, sondes
  de santé, ressources demandées/limites, stratégie de déploiement). Les
  « actions » (planifier, dimensionner, router, basculer, vérifier la santé,
  simuler une panne) sont un ALLOWLIST FERMÉ de fonctions internes déterministes.
  JAMAIS de config transformée en commande système ; pas d'eval ; pas de shell.
- Simulateur DÉTERMINISME : horloge injectable, un scénario = un résultat
  reproductible. Statuts explicites (healthy/degraded/unavailable/scaling/
  draining). Réutilise l'approche de runPipeline (V21).
- Réutilise le moteur de missions (V18) et le contrat d'exercice (call-equals,
  tests privés hidden, référence 100 % verte, starter échoue ≥1 test public,
  compétences validées par isKnownSkill). N'invente PAS de compétence.
- data/progress.json : SAUVEGARDE avant tout test qui pourrait le muter, et
  RESTAURE-le ; vérifie le SHA en fin de sprint. Aucun workspace/serveur/conteneur
  résiduel.

À livrer (indicatif, chaque CP atomique : audit → implémentation → tests → tsc →
build si pertinent → validation réelle → restauration progress.json → nettoyage →
commit → push) :
1. ADR/HSD/TSD-022 pour le Deployment Lab.
2. Modèle de topologie pur + validation (lib/topology.mjs) : bornes, DAG de
   dépendances de services, sondes, budgets de ressources, anti-fuite de vue
   publique.
3. Moteur de simulation déterministe (lib/topology-engine.mjs) : appliquer un
   scénario (montée en charge, perte d'un réplica, bascule blue-green/canary,
   drain), calculer disponibilité/statuts, budget d'erreur (SLO), sans réseau.
4. Actions internes sur allowlist (lib/topology-actions.mjs) : scale, route,
   probe, failover, rollback — pures, déterministes, journalisées et bornées.
5. Deployment Lab (UI + API) : catalogue de topologies filtrable, visualisation
   services/réplicas/dépendances, déclenchement de scénarios, statuts et logs
   en clair, budget d'erreur. Métadonnées PUBLIQUES uniquement (indexées en
   recherche).
6. Contenu approfondi : enrichir ADDITIVEMENT les journées d'ancrage réelles
   (cloud/déploiement/observabilité — repérer les jours réels, NE PAS déplacer le
   contenu) : réplicas & disponibilité, sondes liveness/readiness, ressources &
   autoscaling, SLO/SLI/budget d'erreur, stratégies de déploiement (rolling,
   blue-green, canary), drain & connexions en vol, dégradation gracieuse. Gate
   v22:check (topologies valides + dérive + profondeur).
7. 10 à 14 exercices déterministes (disponibilité, chemin critique de démarrage,
   calcul de réplicas, budget d'erreur, choix de stratégie, sonde qui échoue…) et
   3 à 5 missions d'ingénierie (panne de réplica, montée en charge non tenue,
   déploiement canary qui régresse, SLO brûlé) — évaluation honnête.
8. Audit pédagogique RÉEL de tout le contenu V22 (jours modifiés, exercices,
   missions) + échantillon stratifié ; matrice ; corrections uniquement pour des
   défauts DÉMONTRÉS ; registre étendu ; rapport docs/PEDAGOGICAL-AUDIT-V22.md.
9. Intégration : module scf-09 (parcours Systems & Cloud), jour lié, Deployment
   Lab, recherche, glossaire (termes manquants : réplica, liveness/readiness,
   SLO/SLI, budget d'erreur, drain, autoscaling…), sauvegarde, isolation.
10. Batterie de validation complète (tests, tsc, build, toutes les gates actives,
    sécurité, déterminisme E2E, matrice navigateur 375/768/1024/1440/1920 —
    documente si Playwright indisponible), restauration progress.json, nettoyage,
    docs/SPRINT-V22.md (mêmes sections que V21) + prompt complet de reprise V23.
    NE DÉMARRE PAS V23.

Rappels de cohérence : les gates v17:check et v19:check sont des instantanés
historiques GELÉS (échec attendu, non-régression) ; v18:check dérive les parcours
du catalogue ; garde les vues publiques strictement anti-fuite ; toute journée
enrichie l'est de façon ADDITIVE et échappée (backticks inline = \`) ; jamais de
promesse d'isolation OS ni de cloud réel.
```
