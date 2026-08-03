# Audit pédagogique V21 — Pipeline Lab & CI/CD

Rapport d'audit (CP8). Fondé sur l'exécution réelle du modèle
`lib/pedagogy-audit.mjs` (danger + signaux structurels) et sur la **lecture
effective** des contenus CI/CD livrés en V21. **Aucun contenu pédagogique n'a été
modifié pour améliorer une note** : l'audit constate, il ne maquille pas. Les
seules corrections envisageables sont celles justifiées par un défaut **démontré**.

## 1. Méthodologie

Trois niveaux, cohérents avec l'audit V20 :

- **Niveau A** — audit des ajouts V21 : jours d'ancrage CI/CD (307, 326), les 12
  exercices `cicd-*` et les 4 missions d'ingénierie `cicd-*`, plus le code du
  simulateur (`lib/pipeline*.mjs`) et les 3 pipelines livrés (`data/pipelines`).
- **Niveau B** — scan de danger **toujours actif** sur l'ensemble des contenus
  (490 fichiers : curriculum + exercices + missions).
- **Niveau C** — rappel de l'échantillon transverse V20 (base non modifiée par
  V21), rejoué pour vérifier l'absence de régression.

La rubrique compte **16 dimensions** notées 0-4. Une note de qualité est
**humaine** ; l'automatisation ne fournit que des **signaux structurels**
(informatifs) et des **signaux de danger** (bloquants). Aucune note n'est dérivée
d'un comptage de mots. Le registre `docs/architecture/v20-pedagogy-audit.json`
(registre vivant, étendu à **45 items**) consigne les notes ; la gate
`v20:pedagogy-check` les valide contre les seuils.

## 2. Périmètre V21

- **2 journées** d'ancrage : jour 326 (CI complète, ~2055 mots) et jour 307 (CI
  vide → vocabulaire pipeline/stage/job/runner/trigger, ~1552 mots).
- **12 exercices déterministes** (`cicd-*`) rattachés au jour 326.
- **4 missions d'ingénierie** (`cicd-*`) : 2 incidents, 1 performance, 1 incident
  sécurité.
- **Code** : `lib/pipeline.mjs`, `pipeline-engine.mjs`, `pipeline-actions.mjs`,
  `pipeline-local.mjs` ; 3 pipelines `data/pipelines/*.json`.
- **16 nouveaux éléments notés à la main** (12 exercices + 4 missions) ; les jours
  326/307 étaient déjà notés en CP6.
- **Scan de danger : 490 fichiers.**

## 3. Limites de l'audit (honnêtes)

- L'audit **statique** détecte l'absence de composants et des dangers factuels ;
  il **ne mesure pas** la qualité d'un raisonnement — d'où les notes humaines.
- Un audit ne remplace pas **l'observation d'un apprenant réel**.
- La qualité **sémantique** des livrables « document » et « rapport » des missions
  n'est **jamais** notée automatiquement : elle relève de la revue humaine.
- V21 n'ajoute **aucune** promesse d'exécution CI réelle : le simulateur est
  **déterministe et local**. L'audit vérifie que cette limite est **explicitée**,
  pas contournée.

## 4. Résultat global

- **Sécurité/exactitude : 0 signal bloquant sur 490 fichiers.** Aucune promesse
  d'isolation OS, aucune « sécurité absolue » attribuée au simulateur, aucun
  secret réel, aucune commande destructive non encadrée, aucun bloc de code non
  fermé, aucun placeholder résiduel. La vue publique des pipelines **ne fuit ni
  fixture `with` ni secret** (vérifié par `v21:check`).
- **Structure** : jours 326 et 307 **100 % des composants** pédagogiques
  (objectif, cours, modèle mental, exemple guidé, pratique, quiz, erreurs
  fréquentes, validation, cas métier, synthèse).
- **Moyenne des notes humaines** : **3,51/4** (exercices), **3,50/4** (missions),
  **3,50-3,56** (jours). Tous les éléments dépassent le seuil récent (≥ 3,25).
- **Aucun défaut démontré** n'appelle de correction de contenu en V21.

## 5. Matrice des notes V21

| Élément | Type | Récent | Moyenne | Dimension la plus basse |
|---|---|---|---|---|
| day-326 (CI complète) | jour | oui | 3,50 | charge cognitive (3, dense) |
| day-307 (CI vide/vocabulaire) | jour | oui | 3,56 | depth (3, court par nature) |
| cicd-trigger-should-run | exercice | oui | 3,50 | depth (3, fonction focalisée) |
| cicd-topo-order | exercice | oui | 3,56 | — (algo DAG, depth 4) |
| cicd-detect-cycle | exercice | oui | 3,50 | depth (3) |
| cicd-global-status | exercice | oui | 3,50 | depth (3) |
| cicd-mask-secrets | exercice | oui | 3,50 | depth (3) |
| cicd-branch-policy | exercice | oui | 3,50 | depth (3) |
| cicd-cache-key | exercice | oui | 3,50 | depth (3) |
| cicd-critical-path | exercice | oui | 3,56 | — (algo chemin critique, depth 4) |
| cicd-stale-artifact | exercice | oui | 3,50 | depth (3) |
| cicd-env-promotion | exercice | oui | 3,50 | depth (3) |
| cicd-fail-fast | exercice | oui | 3,50 | depth (3) |
| cicd-missing-deps | exercice | oui | 3,50 | depth (3) |
| cicd-broken-pr (incident) | mission | oui | 3,50 | évaluation (3, structurelle+revue) |
| cicd-blocked-delivery (incident) | mission | oui | 3,50 | évaluation (3) |
| cicd-slow-flaky (performance) | mission | oui | 3,50 | évaluation (3) |
| cicd-secret-in-logs (incident) | mission | oui | 3,50 | évaluation (3) |

Registre complet : **45 items** (39 récents), tous ≥ seuil.

## 6. Défauts

### Bloquants
**Aucun.** Le scan de danger sur 490 fichiers ne remonte aucun signal bloquant.

### Majeurs
**Aucun** dans le périmètre V21. Les défauts majeurs restants (quiz absent sur 77
journées de **base**) sont hors périmètre V21 (chantier éditorial différé, déjà
documenté en V20).

### Mineurs
- **Exercices `cicd-*`** : `depth` à 3 (sauf `topo-order`/`critical-path` à 4).
  C'est **voulu** : chaque exercice isole une micro-compétence déterministe
  (should-run, tri topologique, masquage…) plutôt que d'empiler des concepts. La
  profondeur conceptuelle vit dans le **jour 326** ; les exercices l'**appliquent**.
  Non corrigible sans dénaturer le contrat d'exercice.
- **Jour 326** : dense (~2055 mots) → charge cognitive 3. Contenu excellent ; un
  fractionnement visuel supplémentaire serait un confort, pas un correctif.

## 7. Contenu excellent à préserver

- **Jour 326** : distingue CI / livraison continue / déploiement continu ; anatomie
  pipeline (stage/job/étape) ; **DAG**, parallélisme et **chemin critique** ;
  statuts et **fail-fast** ; déclencheurs et **branch-policy** ; **artefact vs
  cache** ; secrets/environnements ; **promotion/rollback**, **blue-green/canary** ;
  tests **flaky** et **dette de pipeline**. Honnête sur les limites.
- **Simulateur** (`lib/pipeline*.mjs`) : modèle **pur**, actions via **allowlist
  fermée** (aucune transformation config → commande, aucun `eval`, aucun
  `shell:true`), orchestration **déterministe** (horloge injectable), logs bornés
  et **secrets masqués**. L'adaptateur local se limite à `node --check` (parse,
  **pas d'exécution**), executable/args fixes, timeout + SIGKILL, nettoyage.
- **Exercices** : déterministes, référence 100 % verte, starter échoue ≥ 1 test
  public, tests privés non exposés, compétences **connues** (algo, conditions,
  functions, debugging, testing, git) — jamais de compétence fictive.
- **Missions** : scénarios crédibles (PR rouge, livraison bloquée, pipeline lent et
  flaky, secret dans les logs) ; évaluation **honnête** (auto + structurel + revue
  humaine), aucun pseudo-score ; reliées aux exercices et au jour 326.

## 8. Superficiel / à surveiller

- Aucun contenu V21 sous le seuil. Les exercices les plus « simples »
  (`mask-secrets`, `global-status`, difficulté 2) restent **utiles et corrects** ;
  leur faible profondeur est **assumée** (briques de base du raisonnement pipeline).

## 9. Progression, redondances, alignement

- **Progression** : cohérente — le jour 307 pose le **vocabulaire** (walking
  skeleton), le jour 326 approfondit ; les exercices vont de la brique (difficulté
  2 : masquage, statut global) à l'algo (difficulté 4 : tri topologique, chemin
  critique) ; les missions intègrent plusieurs briques dans un incident réaliste.
- **Redondances** : aucune duplication — les missions **référencent** les exercices
  (`exerciseRefs`) au lieu de recopier leur énoncé.
- **Exercices ↔ compétences** : alignés ; chaque exercice porte la micro-compétence
  du raisonnement pipeline correspondant.
- **Missions ↔ pipelines** : `pr-verify` / `pr-broken` / `deploy-staging` (data)
  incarnent les situations que les missions font diagnostiquer.
- **Cohérence parcours** : `trackRefs` inclut `systems-cloud-foundations-v1` — le
  contenu CI/CD **prolonge** les fondations Linux/Docker (V19/V20).

## 10. Comparaison V19 / V20 / V21

- **V19** (Linux/système/réseau) : le plus dense structurellement.
- **V20** (terminal borné, Docker) : exécutabilité **honnête** (désactivation
  propre si daemon absent), fondations Docker profondes.
- **V21** (Pipeline Lab & CI/CD) : prolonge la logique **« comprendre par la
  simulation déterministe »** — un pipeline se **raisonne** (DAG, statuts, chemin
  critique) avant de se subir. Sécurité by design (allowlist, parse-only, masquage).
  Même honnêteté que V20 : **ce n'est pas un runner CI réel**, et c'est dit.

Les trois vagues dépassent les seuils sans régression mutuelle.

## 11. Plan de correction priorisé

### À corriger dans V21 (CP8)
**Rien.** Aucun défaut démontré ne justifie une modification de contenu. Toute
retouche serait cosmétique et risquerait d'introduire une régression — écartée
conformément au principe « corriger seulement un défaut prouvé ».

### À reporter (hors périmètre V21)
- Généralisation des **quiz** aux 77 journées de base sans rappel actif (chantier
  éditorial de masse, déjà différé en V20).
- **Observation d'apprenants réels** sur le Pipeline Lab (seule mesure qui
  certifierait la qualité au-delà de l'audit statique).

### À ne pas modifier
- Le contrat d'exercice (micro-compétence déterministe, profondeur portée par le
  jour lié).
- La **limite honnête** du simulateur (« pas un runner CI réel, pas d'isolation
  OS ») — à préserver telle quelle.
- Les 490 fichiers scannés sans signal bloquant.

## 12. Réponses aux questions clés

- **Les cours CI/CD sont-ils exploitables ?** Oui : moyenne 3,50-3,56, tous
  au-dessus du seuil récent (3,25), 0 danger.
- **Trop superficiels ?** Non — le jour 326 est profond ; les exercices sont des
  briques assumées.
- **Trop longs/denses ?** Jour 326 dense (charge cognitive 3) — à fractionner
  visuellement au besoin, pas à couper.
- **Exercices alignés aux compétences ?** Oui — compétences connues, déterministes.
- **Missions crédibles ?** Oui — incidents/performance réalistes, évaluation
  honnête (auto + structurel + revue).
- **Apprend-on de ses erreurs ?** Oui — statuts `failed/blocked/cancelled`, cause
  racine, sections « erreurs fréquentes » présentes ; missions orientées diagnostic.
- **Contenus techniques exacts ?** Oui (0 signal bloquant, `v21:check` vert).
- **Risques/limites explicités ?** Oui — simulateur déterministe, parse-only,
  masquage, **aucune** promesse de runner réel ni d'isolation OS.
- **Parcours Systems/Cloud cohérent ?** Oui — CI/CD prolonge Linux/Docker.
- **Ce qui manque avant crédibilité pro complète ?** L'exécution CI réelle
  (hors périmètre par conception) et l'observation d'apprenants réels.

## 13. Bilan avant/après V21

| Dimension | Avant V21 | Après V21 |
|---|---|---|
| CI/CD (contenu) | jour 326 partiel, 307 vide | **307 vocabulaire + 326 approfondi** |
| Pratique CI/CD | aucune | **12 exercices déterministes + Pipeline Lab** |
| Missions livraison | aucune | **4 missions (incident/perf), évaluation honnête** |
| Simulateur | — | **modèle pur + allowlist fermée + parse-only + masquage** |
| Danger (scan) | 0 bloquant | **0 bloquant** (490 fichiers) |
| Moyenne notes récentes | 3,51 | **3,51** (maintenue en ajoutant 16 éléments) |

**Ce qui nécessite encore une revue humaine** : la qualité sémantique des livrables
documentaires des missions (post-mortems, plans de remédiation) — validée
structurellement, jamais notée automatiquement. **Reporté** : quiz sur les
journées de base, exécution CI réelle, observation d'apprenants réels.
