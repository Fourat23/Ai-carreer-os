# Sprint V25 — AWS & Azure Foundations Lab : architecture cloud, IAM, réseau, compute, stockage, données, résilience, observabilité et FinOps

Rapport de sprint (français). AI Career OS reste **local, mono-utilisateur, sans
authentification, sans SaaS, sans réseau requis**. Aucun nouveau moteur de
progression, aucune source de vérité parallèle : V25 réutilise le catalogue, la
progression v3, les tracks, les exercices, les missions, les preuves, le glossaire,
la recherche, la sauvegarde, les Labs et les playbooks existants. **Aucun appel
AWS/Azure réel, aucune credential, aucun provisionnement** : le Cloud Architecture
Lab est un simulateur DÉTERMINISTE sur fixtures locales.

## 1. État initial
Fin de V24 (« Cybersécurité appliquée »), `HEAD = 2ebf7c7`. Corpus : 5 parcours, 155
exercices, 33 missions, 4 scénarios de sécurité, 15 playbooks, glossaire 520.

## 2. HEAD initial
`2ebf7c7` — branche `claude/ai-career-os-saas-phfg49`, local == origin, working tree propre.

## 3. Architecture retenue
**Couche provider-aware AU-DESSUS du Cloud Topology Lab V22** (option B de l'ADR-025),
pas de second moteur : `lib/cloud-architecture.mjs` réutilise le graphe V22
(`validateTopology`, `analyzeTopology`, `findCycle`) et ajoute provider (aws/azure/
generic), région/zones, identités IAM, réseau (CIDR/subnets/security-groups),
costHints, contraintes. `lib/cloud-analysis.mjs` compose les règles cloud avec la
disponibilité V22. `lib/cloud-cost.mjs` estime un coût FACTICE étiqueté.

## 4. ADR / HSD / TSD
`docs/ADR-025`, `HSD-025`, `TSD-025` : trois niveaux d'honnêteté (réel/simulé/externe
non vérifié), estimateur de coût factice, mapping AWS↔Azure comme donnée raisonnée,
contrats de modules purs.

## 5. Checkpoints
CP0 audit → CP1 ADR/HSD/TSD → CP2 modèle + `v25:check` → CP3 Lab (6 scénarios + UI) →
CP4 enrichissement 78/79/80/81/325 → CP5 17 exercices → CP6 6 missions → CP7 10
playbooks → CP8 glossaire (+63) + recherche → CP9 E2E + audit → CP10 hardening + rapport.

## 6. Commits
| CP | Commit | Objet |
|---|---|---|
| CP1 | `484d54f` | ADR/HSD/TSD-025 |
| CP2 | `3b5db6f` | modèle cloud + analyse + gate v25:check |
| CP3 | `23e90c6` | Cloud Architecture Lab (6 scénarios AWS/Azure + UI) |
| CP4 | `193518b` | enrichissement cloud jours 78/79/80/81/325 |
| CP5 | `e626917` | 17 exercices cloud |
| CP6 | `0fd141d` | 6 missions cloud |
| CP7 | `b03906b` | 10 playbooks cloud |
| CP8 | `b38f196` | glossaire cloud (+63) + intégration recherche |
| CP9 | `8a794f6` | E2E cloud + isolation + audit pédagogique |
| CP10 | *(ce commit)* | hardening + rapport + prompt V26 |

## 7. Services / concepts AWS couverts
IAM (users/roles/policies) + STS, VPC/subnets/route table/IGW/NAT/Security Group/NACL,
EC2 + Auto Scaling, ECS/EKS (architecture), Lambda, S3/EBS/EFS, RDS/Aurora/DynamoDB,
ALB/NLB, CloudWatch, CloudTrail, Cost Explorer + Budgets, Account/Organizations,
spot/reserved. Traités au niveau **raisonnement**, jamais console/appel réel.

## 8. Services / concepts Azure couverts
Microsoft Entra ID + Azure RBAC + managed identity/service principal, VNet/subnets/
NSG/Azure Firewall/NAT, Virtual Machines + VM Scale Sets, AKS/Container Apps
(architecture), Azure Functions, Blob/Managed Disks/Azure Files, Azure SQL/PostgreSQL
Flexible/Cosmos DB, Application Gateway/Load Balancer, Azure Monitor/Log Analytics/
Activity Log, Cost Management + Billing, Subscription/Resource Group/Management Groups.

## 9. Comparaison fournisseur (AWS ↔ Azure)
`data/cloud/provider-map.json` : 14 correspondances RAISONNÉES (concept, équivalent
AWS, équivalent Azure, **quand / pourquoi / différence de modèle**). Jamais une table
« EC2 = VM » : chaque ligne explicite les différences (IAM+STS vs Entra ID+RBAC,
Security Group+NACL vs NSG, account vs subscription/resource group…).

## 10. Scénarios
6 architectures `data/cloud/*.json` problématique↔saine (état corrigé = 0 diagnostic
bloquant/risque) : aws-ha-api, azure-web-ha, aws-insecure, azure-insecure,
aws-serverless-tradeoff, azure-cost-resilience.

## 11. Exercices
17 exercices déterministes (node-js), 155 → **172**. IAM (3), réseau (3), compute (2),
stockage/données (2), résilience (2), observabilité (1), FinOps (2), architecture (2).
Contrat respecté (référence verte, starter faillible, tests privés).

## 12. Missions
6 missions V18, 33 → **39** : cloud-ha-api-design (HLD/HSD), cloud-migrate-resilient,
cloud-secure-architecture, cloud-reduce-bill (FinOps), cloud-backup-dr (RPO/RTO),
cloud-observability-diagnosis. Au moins une (ha-api-design) a un HLD comme livrable
principal ; couvre architecture, résilience, sécurité, FinOps, backup/DR, incident.

## 13. Playbooks
10 playbooks cloud « Que faire dans ce cas ? » (15 rubriques), 15 → **25** : facture
explosée, VM inaccessible, panne de région, stockage public, credentials compromis,
DB saturée, pic de trafic ×10, régression de latence, sur-coût, drift de configuration.

## 14. Glossaire
520 → **583** (+63 entrées cloud au schéma riche, liens vérifiés). Catégories Cloud
37→73, Sécurité 66→77.

## 15. Contenus enrichis
Jours 78 (architecture cloud, IAM, réseau, mapping), 79 (observabilité cloud), 80
(scaling & choix compute), 81 (résilience/DR + « Que faire dans ce cas ? »), 325
(FinOps). Enrichissement additif, dérive bornée (plan v25-enrichment-plan, baseline
23e90c6), génération déterministe.

## 16. Parcours touchés
Systems & Cloud Foundations intègre naturellement les jours 78-81 enrichis ; AppSec &
Cloud Security référence le jour 79. **Aucun nouveau parcours** : le parcours
Cloud/DevOps complet est réservé à V26 (choix explicite pour éviter un parcours
superficiel). Les 5 parcours restent disponibles et isolés.

## 17. Audit pédagogique
`docs/PEDAGOGICAL-AUDIT-V25.md` (échantillonné, honnête) : le cloud fournisseur —
grand absent de l'audit V24 — atteint « exploitable en entretien junior » sur la
conception/analyse (AWS+Azure) ; lacunes explicites (IaC réelle, manipulation
opérationnelle) réservées à V26.

## 18. Tests
Suite **903** (V25 : cloud-architecture 12, v25-e2e 9, + intégrations). Contrats
d'exercices/missions/playbooks validés par génération + exécution en processus.

## 19. Gates
`gates:active` = curriculum + depth + glossary + v18 + v20-pedagogy + **v25** (vert).
Cycle de vie appliqué : `v24:check` bascule en `gates:historical` (V25 a enrichi des
jours hors de son périmètre 68/85/298) — comme v23 en V24. Inventaire mis à jour (V25).

## 20. E2E
`tests/v25-e2e.test.mjs` (9 cas) : analyse → remédiation → coût factice → playbook +
mapping → preuve d'exercice → intégration parcours → isolation 5 parcours → recherche
→ export/import/restore. Anti-fuite vérifiée.

## 21. Validation navigateur
Captures réelles (Chromium headless) : /cloud-foundations à **375/768/1024/1440/1920**,
détail scénario (1440), jours enrichis 78/325 (HTTP 200), search-index (6 cloud-arch,
25 playbooks, 583 glossaire). **Distinction honnête** : captures statiques ;
l'expansion de playbook et le toggle de remédiation sont des interactions client non
pilotées par clic ici, couvertes par les tests unitaires du rendu.

## 22. Performances
Analyse d'architecture : pure, déterministe, en mémoire (fixtures locales). Recherche :
index statique (1450 items) filtré O(n). Aucun SDK cloud, aucun appel réseau.

## 23. Bundles
/cloud-foundations 1.25 kB (110 kB First Load) · /cloud-foundations/[id] 4.81 kB
(111 kB) · /security 110 kB · /glossary 106 kB · partagé 103 kB. Aucun SDK lourd,
aucun CodeMirror sur ces routes, aucune régression.

## 24. Sécurité
Aucun `eval`/`Function`/`shell:true`/`child_process` dans le Lab runtime ; aucune
credential réelle ; aucun appel AWS/Azure. Le seul `execSync` est dans le script de
GATE (`v25-check.mjs`, git diff pour la dérive, baselineRef contrôlé) — build-time,
même pattern que v22-v24, hors runtime. Le seul `fetch` du Lab est same-origin vers
l'API locale.

## 25. Anti-fuite
Vue publique (`publicCloudView`) masque credentials et policies détaillées (résume le
wildcard sans exposer les actions). Index de recherche : aucune identité/policy/
credential/donnée interne. Sauvegarde : uniquement de la progression.

## 26. Réel vs simulé
**Réel (local, déterministe)** : parsing, validation, règles d'analyse (IAM, réseau/
CIDR, stockage, résilience via V22), estimation de coût STRUCTURELLE. **Simulé** :
prix cloud réel, disponibilité AWS/Azure, incidents fournisseur, failover/autoscaling
réels, métriques cloud. Chaque diagnostic porte real/simulated ; le coût est étiqueté FACTICE.

## 27. Limites honnêtes
Pas d'IaC réelle (Terraform/Bicep) ni de manipulation de console ; barème de coût
FACTICE ; services managés spécifiques (files, event bus, data lake) hors périmètre ;
crypto/PKI (KMS/WAF) et data NoSQL avancée surtout en glossaire ; accessibilité non
auditée par outil automatisé.

## 28. Dette technique restante
- Usage latent de `recordExerciseSuccess` (mauvaise signature) dans
  `tests/v20-integration.test.mjs` (no-op sans conséquence) — à corriger.
- Deux diagnostics « no-backup » possibles (règle cloud + règle V22 composée) sur le
  même défaut : redondance bénigne (deux lentilles), résolue en état corrigé.
- IaC réelle et parcours Cloud/DevOps : reportés à V26.

## 29. État Git final
Branche `claude/ai-career-os-saas-phfg49`, local == origin, working tree propre après
CP10, aucun stash, aucun fichier non suivi parasite, `progress.json` à la baseline
`323604021055588a9528a86875f36598dbdc7758`.

## 30. Données restaurées
`data/progress.json` sauvegardé avant chaque test et restauré byte-identique à la
baseline de session à chaque checkpoint. Baseline finale confirmée identique.

## 31. Résumé avant / après
| Métrique | Avant V25 | Après V25 |
|---|---|---|
| Parcours disponibles | 5 | 5 (Cloud/DevOps réservé V26) |
| Exercices | 155 | 172 |
| Missions | 33 | 39 |
| Architectures cloud | 0 | 6 |
| Playbooks | 15 | 25 |
| Glossaire | 520 | 583 |
| Tests | 894 | 903 |
| Gates actives | v24 | v25 (v24 → historique) |

## 32. HEAD final
Voir la synthèse (dernier commit CP10 de la branche).

---

## 33. Prompt COMPLET de reprise V26

> Copier-coller intégral pour lancer V26. **Ne pas commencer V26 ici.**

```
Reprends AI Career OS et démarre le Sprint V26 —
« Cloud / DevOps Engineer : premier parcours Cloud professionnel complet ».

CONTRAINTES FONDAMENTALES (inchangées)
Application LOCALE, mono-utilisateur, sans authentification, sans SaaS, sans réseau
requis. AUCUN appel cloud réel, aucune credential, aucun provisionnement, aucun
déploiement réel, aucun scan Internet. Une seule source de progression (v3) ; AUCUN
nouveau moteur de progression, AUCUN Workbench. Réutilise et ASSEMBLE l'existant :
catalogue, tracks, exercices, missions, preuves, compétences, glossaire, recherche,
sauvegarde, Labs (Pipeline, Cloud Topology, Kubernetes, Security & Incident, Cloud
Architecture) et playbooks. Les données pilotent les surfaces (pas de valeurs
magiques, pas de liste de parcours ni de compte codé en dur, pas de trackId === "…").
Évite de modifier package.json sauf nécessité démontrée ; aucune dépendance lourde ;
CodeMirror lazy.

LANGUE : rapports, audits, synthèse finale et prompt V27 EN FRANÇAIS.

INTERDICTIONS : eval ; new Function ; vm non maîtrisé ; shell arbitraire ; spawn
shell:true ; exécution de contenu utilisateur ; terraform/kubectl/aws/az apply ;
accès réseau ; lecture de secrets hôte ; traversal de chemin ; écriture hors
workspace. Aucun secret/credential réel (valeurs factices explicites uniquement).

OBJECTIF PRODUIT
Assembler un PREMIER PARCOURS Cloud/DevOps professionnel COMPLET et COHÉRENT, en
réutilisant les journées et Labs existants — SANS créer un parcours superficiel.
Le but n'est pas d'ajouter du contenu neuf en masse, mais d'ORCHESTRER l'existant en
une progression employable : Linux → réseau → Git/CI-CD → conteneurs/Docker →
Kubernetes → cloud (AWS/Azure) → sécurité/IAM → observabilité → résilience/DR →
FinOps → production/incident. Chaque module du parcours doit avoir un objectif clair,
des journées d'ancrage réelles, des exercices et missions atteignables, et une
cohérence de progression (du simple au complexe). Combler UNIQUEMENT les trous réels
révélés par l'assemblage (pas d'enrichissement gratuit).

SUJETS / COHÉRENCE À GARANTIR
- Parcours `cloud-devops-engineer-v1` (ou variante cohérente), DISPONIBLE, data-driven,
  non contigu, réutilisant les journées existantes sans dupliquer de curriculum.
- Modules couvrant : fondations (terminal/Linux/Git), réseau, HTTP/API, CI/CD,
  conteneurs, Kubernetes, cloud AWS/Azure (IAM, réseau, compute, stockage, données),
  sécurité/secrets/RBAC, observabilité, résilience/DR, FinOps, production/incident.
- Une « capstone » : au moins une mission de synthèse qui traverse plusieurs domaines
  (concevoir + sécuriser + rendre résilient + chiffrer le coût d'une architecture).
- Isolation stricte avec les 5 parcours existants ; bascule aller/retour ; navigation
  bornée ; backup/import ; recherche.
- Rendre DATA-DRIVEN tout test/surface supposant exactement 5 parcours (ne pas coder
  « 6 » en dur — dériver de buildCatalogue/isTrackAvailable).

DÉROULÉ (atomique, un commit par checkpoint : audit → implémente → teste → tsc →
build → valide → restaure progress → nettoie → commit → push)

CP0 — Audit de reprise LECTURE SEULE : git status/HEAD/origin/log ; diff non commité ;
commits V25 présents ; baseline RÉELLE de progress.json (ne pas forcer un ancien SHA) ;
résidus (serveurs/processus/workspaces) ; AUDIT DE COUVERTURE : cartographier les
journées, exercices, missions et Labs existants par domaine DevOps, pour identifier ce
qui est déjà là vs les vrais trous. Rapport AVANT toute implémentation.

CP1 — ADR/HSD/TSD-026 : conception du parcours Cloud/DevOps (modules, journées
d'ancrage par module, critères de progression, ce qui est réutilisé vs créé, stratégie
d'isolation et de data-drivenness). Aucun second moteur.

CP2 — Squelette du parcours dans le catalogue (lib/catalogue.mjs) : modules + dayRefs
réutilisant l'existant, technologies, durée DÉRIVÉE. Gate v26:check initiale (cohérence
du parcours : modules non vides, journées existantes, pas de doublon, progression).
Rendre data-driven les tests supposant 5 parcours. Tests catalogue/agrégat/contexte.

CP3 — Combler les trous RÉELS révélés par l'assemblage : uniquement les journées/
exercices/missions manquants pour une progression cohérente (enrichissement ciblé,
dérive bornée). Pas d'ajout gratuit.

CP4 — Exercices manquants du parcours (si nécessaire), contrat respecté.

CP5 — Missions du parcours + une CAPSTONE multi-domaines (livrable HLD + sécurité +
résilience + FinOps + décision argumentée).

CP6 — Playbooks « Que faire dans ce cas ? » manquants pour le parcours (si des trous
existent) ; sinon, réutiliser l'existant.

CP7 — Glossaire : compléter uniquement les termes DevOps réellement absents révélés
par le parcours ; liens cours ↔ glossaire ↔ missions.

CP8 — Intégration : recherche/palette (parcours, modules, contenus), backup/import,
isolation, E2E du parcours complet (enrôlement → progression multi-modules → preuves →
missions → capstone → bascule → isolation → export/import).

CP9 — Gates (actives/historiques, cycle de vie ; basculer v25:check en historique SI
V26 touche ses jours cibles) ; validation navigateur responsive 375/768/1024/1440/1920
(distinguer honnêtement test automatisé / capture / interaction non pilotée / non
testé) ; audit pédagogique V19→V26 (le parcours est-il réellement employable ? lacunes
explicites).

CP10 — Batterie complète (tests, tsc, build, gates:active, v26:check, curriculum,
depth, glossary, pedagogy, anti-fuite, sécurité, bundles, E2E) ; hardening ; restaurer
progress.json à la baseline de session (byte-identique) ; nettoyer workspaces/serveurs/
temporaires ; vérifier local==origin, working tree propre, HEAD final. Rédiger
docs/SPRINT-V26.md (~32 sections) + audit pédagogique V19→V26 + prompt COMPLET V27.
Synthèse finale EN FRANÇAIS. NE PAS COMMENCER V27.

RAPPELS : réutilise Chromium headless pré-installé (pas de « playwright install ») ;
sauvegarde/restaure progress.json à chaque test ; le parcours doit être COHÉRENT et
EMPLOYABLE, pas un empilement de journées ; ne déclare pas un domaine « couvert » sur
la seule présence d'une journée — vérifie la pratique atteignable.
```

---

*Fin du rapport V25. V26 est préparé mais NON démarré.*
