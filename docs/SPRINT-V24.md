# Sprint V24 — Cybersécurité appliquée : secrets, supply chain, RBAC/Kubernetes & réponse à incident

Rapport de sprint (français). AI Career OS reste une application **locale,
mono-utilisateur, sans authentification, sans SaaS, sans réseau requis**. Aucun
nouveau moteur de progression, aucune source de vérité parallèle, aucun nouveau
Workbench : V24 réutilise le catalogue, la progression v3, les tracks, les
exercices, les missions, les preuves, les compétences, le glossaire, la recherche,
la sauvegarde et les Labs existants.

## 1. État initial

Point de départ : fin de V23 (Kubernetes Manifest Lab), `HEAD = 296f4d3`, branche
`claude/ai-career-os-saas-phfg49`. Corpus : 4 parcours, ~140 exercices, 27 missions,
glossaire à 483 entrées, aucune surface de sécurité dédiée.

## 2. Anomalie container/branche rencontrée

Au CP0, le worktree était vide et la branche locale `master` sans commit, alors
qu'`origin/claude/ai-career-os-saas-phfg49` pointait sur le travail réel. Résolu
**sans destruction** : `git checkout claude/ai-career-os-saas-phfg49` + `npm ci`
(dépendances absentes). L'historique n'était pas perdu.

## 3. Baseline réelle de progress.json

`data/progress.json` est **généré au runtime** via `migrateToV7` et embarque des
horodatages : son SHA n'est pas reproductible d'un container à l'autre. L'ancien SHA
`cea317e8` provenait d'un container antérieur. La **baseline de CETTE session**,
auditée au CP0, est :

```
323604021055588a9528a86875f36598dbdc7758
```

Invariant appliqué à chaque checkpoint : sauvegarde avant test, restauration
**byte-identique** à cette baseline, aucune mutation parasite. Vérifié à CP6→CP10.

## 4. Déroulé CP0 → CP10

- **CP0** — audit lecture seule, résolution de l'anomalie git, baseline progress.
- **CP1** — ADR/HSD/TSD-024 (architecture : 3 niveaux réel/simulé/externe, CVE factice, détection prudente de secrets, modèle d'incident, rollback vs roll-forward).
- **CP2** — modèle pur `lib/security*.mjs` + gate `v24:check`.
- **CP3** — Security & Incident Lab (analyseur, incident, scénarios vulnérable↔corrigé, UI, routes).
- **CP4** — enrichissement pédagogique ciblé des jours 68/85/298.
- **CP5** — 15 exercices déterministes de cybersécurité.
- **CP6** — 6 missions d'ingénierie sécurité.
- **CP7** — 5ᵉ parcours « AppSec & Cloud Security Foundations » (data-driven).
- **CP8** — glossaire (+37 termes) + surface « Que faire dans ce cas ? » (15 playbooks).
- **CP9** — hygiène des gates, réalignement playbooks/scénarios, E2E.
- **CP10** — batterie complète, audit pédagogique, ce rapport, prompt V25.

## 5. Commits

| CP | Commit | Objet |
|---|---|---|
| CP1 | `17c82f8` | ADR/HSD/TSD-024 |
| CP2 | `a94eec9` | modèle pur cybersécurité + gate v24:check |
| CP3 | `e904bda` | Security & Incident Lab |
| CP4 | `257d221` | enrichissement jours 68/298/85 |
| CP5 | `95ddbfb` | 15 exercices cybersécurité |
| CP6 | `e99caa0` | 6 missions cybersécurité |
| CP7 | `55e1fc3` | parcours AppSec & Cloud Security |
| CP8 | `87d90d1` | glossaire + « Que faire dans ce cas ? » |
| CP9 | `b39355f` | hygiène gates + réalignement + E2E |
| CP10 | *(ce commit)* | batterie finale + rapport + prompt V25 |

## 6. Architecture

Trois niveaux d'honnêteté (ADR-024) : **analyse réelle locale** (déterministe sur
fixtures), **simulation** (incident, décisions), **environnement externe non
vérifié** (jamais exécuté). Modules purs :
- `lib/security.mjs` — domaines, artefacts, détection prudente de secrets (pattern + contexte + entropie → confiance ; marqueurs FAKE), `validateScenario`, `publicScenarioView`.
- `lib/security-analysis.mjs` — registre de règles (secrets, supply chain, RBAC, durcissement K8s, exposition, pipeline), `analyzeScenario` → diagnostics + résumé + limites.
- `lib/security-incident.mjs` — 6 incidents × 6 phases, `secretResponseOrder`, `decideRecovery`.
- `lib/security-server.ts` — chargement/validation, vues publiques, résumés.

## 7. Security & Incident Lab

Routes `/security` (catalogue + navigateur de playbooks) et `/security/[id]`
(analyseur : Artefacts / Diagnostics / Remédiation vulnérable↔corrigé + simulation
d'incident + « Que faire dans ce cas ? »). API `POST /api/security/[id]`
(analyze | simulate | remediate | reset). Aucune exécution ; secrets masqués.
Bundles : `/security` 3.72 kB (110 kB First Load), `/security/[id]` 4.45 kB (110 kB),
pas de CodeMirror.

## 8. Scénarios

4 scénarios versionnés (`data/security/*.json`), chacun avec état **vulnérable** et
état **corrigé** (0 diagnostic une fois corrigé) : `leaked-secret-config` (secrets),
`overprivileged-rbac` (RBAC), `unhardened-workload` (durcissement K8s),
`vulnerable-supply-chain` (supply chain). Base CVE **factice** (`FAKE-CVE-*`, 4
entrées). Chaque scénario pointe vers un incident, un playbook et des missions réels.

## 9. Enrichissements pédagogiques

Jours d'ancrage enrichis **additivement** (plan `v24-enrichment-plan.json`, dérive
bornée) : **jour 68** (secrets : cycle de vie, rotation, révocation, coffre, « Que
faire dans ce cas ? »), **jour 85** (durcissement : RBAC, moindre privilège,
securityContext, NetworkPolicy), **jour 298** (supply chain : lockfile, pinning,
digest, provenance, SBOM, typosquatting, dependency confusion). Aucune journée
déplacée, aucun contenu dupliqué.

## 10. Exercices

15 exercices déterministes (`sec-*`), reliés aux jours 68/85/298 : mask-secrets,
classify-sensitive, secret-response-order, rbac-wildcard, least-privilege,
securitycontext, networkpolicy-open, image-digest, lockfile-diff, typosquat,
sbom-added, cve-affected, blast-radius, recovery-decision, remediation-order.
Total corpus : **140 → 155**. Contrat respecté (référence 100 % verte, starter
échoue ≥ 1 test public, tests privés cachés).

## 11. Missions

6 missions V18 (data-driven, jours 68/85/298) : `sec-secret-leak`,
`sec-dependency-compromise`, `sec-rbac-excessive`, `sec-workload-hardening`,
`sec-broken-security-deploy` (4 livrables : runbook, post-mortem, plan de rollback,
décision hotfix/rollback/roll-forward), `sec-combined-incident`. Total : **27 → 33**.

## 12. Parcours AppSec

`appsec-cloud-security-v1` — « AppSec & Cloud Security Foundations ». Data-driven,
non contigu, **15 jours dérivés** (aucun curriculum dupliqué), ordre simple→complexe :
HTTP/API (50-54) → réseau/observabilité (71,79) → OWASP/secrets (67,68) → supply
chain (298) → durcissement/RBAC (85) → conteneurs/K8s (320,321) → CI/CD sécurisé
(307,326). Nouvelle technologie `security`. Total parcours disponibles : **4 → 5**.

## 13. Glossaire

**483 → 520** entrées (+37 termes cybersécurité, schéma riche : définition,
explication, exemple de réunion, traduction simple, confusions, termes liés, alias,
tags). +2 alias ciblés (runAsNonRoot, readOnlyRootFilesystem). Catégorie Sécurité :
37 → 66. Liens `relatedTerms` tous vérifiés.

## 14. « Que faire dans ce cas ? »

15 playbooks professionnels (`data/playbooks/*.json`), chacun avec 15 rubriques
(symptômes, premières vérifications, actions immédiates, ordre recommandé, qui
prévenir, preuves, pièges, mitigation, correction, validation, livraison,
surveillance, documentation, prévention, critères de sortie). Cas : bug prod,
déploiement cassé, régression, secret exposé, dépendance compromise, service
indisponible, migration ratée, vulnérabilité critique, permissions trop larges,
hotfix urgent, rollback impossible, incident réseau, pipeline bloqué, métriques
anormales, incident Kubernetes. Surface browsable/filtrable sur `/security`
(composant `PlaybookView` partagé avec l'analyseur).

## 15. Recherche

`buildIndex` indexe désormais **scénarios (4), playbooks (15) et glossaire (520)**,
en plus du contenu existant (cours, exercices, missions, pipelines, topologies,
manifests, parcours). Index vivant vérifié : 1348 items. **Anti-fuite** : aucune
rubrique interne de playbook, aucun diagnostic, aucune solution/référence/test privé
indexé.

## 16. Sauvegarde / import

Format v3 inchangé (progression par parcours). Roundtrip export → mutation → import
vérifié pour le parcours AppSec et les preuves d'exercice sécurité (E2E-9). La
sauvegarde ne contient que de la progression — aucune donnée volatile ni interne.

## 17. Tests

Suite **882** tests (tous verts). Fichiers V24 : `security.test.mjs` (15),
`security-analysis.test.mjs` (14), `security-content.test.mjs` (6),
`v24-appsec-track.test.mjs` (8), `v24-glossary-playbooks.test.mjs` (10),
`v24-e2e.test.mjs` (9). Correction d'un usage latent de `recordExerciseSuccess`
(signature `{ exerciseId, dayRefs… }`) pour que les preuves testées soient réelles.

## 18. Gates

`gates:active` = curriculum + depth + glossary + v18 + v20-pedagogy + **v24** (vert).
`v24:check` renforcé : scénarios, playbooks (15 rubriques exigées), base CVE factice,
anti-fuite, dérive bornée, profondeur. **Cycle de vie appliqué** : `v23:check`
bascule en `gates:historical` (V24 a enrichi 68/85/298, hors de son périmètre
320-321) — fin de vie normale d'une gate de sprint, documentée dans
`docs/architecture/gates-inventory.md`. Aucune gate active ne code en dur un nombre
de parcours (toutes dérivent de `buildCatalogue`).

## 19. E2E

`tests/v24-e2e.test.mjs` (9 cas) enchaîne : analyse → diagnostics → remédiation
(vulnérable↔corrigé) → simulation d'incident/ordre de réponse → playbook → preuve
d'exercice → mission (livrable structural) → bascule AppSec → **isolation** →
recherche (glossaire/playbook/scénario/parcours) → export/mutation/import/restore.

## 20. Navigateur

Validation par **capture réelle** (Chromium headless pré-installé, pas de
téléchargement) : `/parcours` (5 parcours, carte AppSec + bouton de bascule),
`/security` (4 scénarios + 15 playbooks + filtre), `/security/[id]` (artefacts avec
secret **masqué**, 3 diagnostics avec confiance/CWE, bouton « Que faire dans ce
cas ? », limites honnêtes, lien jour 68). **Distinction honnête** : ce sont des
captures statiques ; l'expansion d'un playbook et le basculement de mode sont des
interactions client (React state) **non pilotées par clic** ici, mais couvertes par
les tests unitaires du rendu. Aucune inspection manuelle interactive n'a été
prétendue.

## 21. Responsive

Captures réelles aux largeurs **375 / 768 / 1024 / 1440 / 1920** pour `/parcours` et
`/security` : empilement mobile correct (nav hamburger), aucune fuite horizontale,
compteurs et cartes lisibles. Détail scénario capturé en 1440.

## 22. Accessibilité

Réutilisation des primitives existantes : boutons `aria-expanded` (playbooks,
mode d'analyse), `aria-label` sur le filtre, `<input type="search">`, navigation
clavier héritée. **Non vérifié** : audit lecteur d'écran automatisé (axe-core non
disponible dans l'environnement) — signalé honnêtement, non prétendu.

## 23. Performances

Analyse d'un scénario : déterministe, pure, en mémoire (aucune I/O au clic — tout
passe par la route serveur qui lit des fixtures versionnées). Recherche : index
statique en mémoire (1348 items), filtrage O(n) trivial à cette échelle.

## 24. Bundles

`/security` 3.72 kB (First Load 110 kB) · `/security/[id]` 4.45 kB (110 kB) ·
`/parcours` 1.88 kB (108 kB) · `/glossary` 3.32 kB (106 kB) · partagé 103 kB.
Aucune régression, aucun CodeMirror sur ces routes.

## 25. Anti-fuite

Vues publiques (`publicScenarioView`, résumés) redigent les secrets ; l'index de
recherche n'expose ni rubrique interne, ni diagnostic, ni solution/référence/test
privé (vérifié par test). Les seules chaînes ressemblant à des secrets sont
explicitement **factices** (`sk-FAKEFAKE…EXAMPLE`), validées par `v24:check`.

## 26. Réel vs simulé

**Réel (déterministe, local)** : détection de secrets par pattern/contexte/entropie,
règles d'analyse (RBAC wildcard, root, digest, lockfile), comparaison
vulnérable↔corrigé. **Simulé** : phases d'incident, décisions de récupération,
gravité. **Jamais fait** : scan Internet, base CVE distante, appel cluster/cloud,
`kubectl apply`, exécution de manifeste, lecture de secrets hôte. Chaque diagnostic
porte `confidence` + `real`/`simulated` + limites globales.

## 27. Audit pédagogique V19 → V24

Voir `docs/PEDAGOGICAL-AUDIT-V24.md` (échantillonné, honnête). Synthèse : exploitation
(Linux, Docker, CI/CD, Kubernetes) et sécurité appliquée (secrets, RBAC, réponse à
incident) sont **exploitables en entretien junior** ; le **cloud fournisseur
(AWS/Azure)** reste le grand absent → objet de V25.

## 28. Limites

Analyseur = pédagogique déterministe, **pas un SAST/scanner/audit**. CVE factices.
Pas de crypto/PKI appliquée, pas d'exercice OAuth/OIDC/JWT, signature/provenance au
niveau glossaire seulement. Accessibilité non auditée par outil automatisé.

## 29. Dette technique restante

- Usage latent de `recordExerciseSuccess` avec mauvaise signature encore présent
  dans `tests/v20-integration.test.mjs` (no-op sans conséquence sur ses assertions) —
  à corriger opportunément.
- Supply chain : le domaine sécurité le plus jeune, à densifier (vérification de
  signature réelle, registres privés).
- Playbooks : gabarit de communication de crise prêt à l'emploi non fourni.

## 30. Hardcodes historiques trouvés (et traitement)

- `catalogue.test`/`track-aggregate.test`/`exercise-context.test`/`v19-missions.test` :
  listes/compte de parcours codés en dur → **rendus data-driven** (dérivés de
  `buildCatalogue`/`isTrackAvailable`), pas de remplacement « 4 → 5 » aveugle.
- Snapshots historiques **volontairement conservés** : `V19_MISSIONS.length===4`
  (les 4 missions V19 précises), `v19-e2e` « 4ᵉ parcours » (cible Systems & Cloud par
  id), fixtures backup à 3 parcours (`threeTracks()` = progression utilisateur, sans
  lien avec le catalogue).

## 31. État Git final

Branche `claude/ai-career-os-saas-phfg49`, `local == origin`, working tree propre
après commit CP10, aucun stash, aucun fichier non suivi parasite,
`progress.json` à la baseline `323604021055588a9528a86875f36598dbdc7758`.

## 32. Chiffres avant / après

| Métrique | Avant V24 | Après V24 |
|---|---|---|
| Parcours disponibles | 4 | 5 |
| Exercices | 140 | 155 |
| Missions | 27 | 33 |
| Scénarios de sécurité | 0 | 4 |
| Playbooks | 0 | 15 |
| Entrées de glossaire | 483 | 520 |
| Tests | ~820 | 882 |
| Gates actives | v23 incluse | v24 (v23 → historique) |

---

## 33. Prompt COMPLET du Sprint V25

> Copier-coller intégral ci-dessous pour lancer V25. **Ne pas commencer V25 ici.**

```
Reprends AI Career OS et démarre le Sprint V25 —
« AWS & Azure Foundations Lab : IAM, réseau cloud, compute, stockage, données,
observabilité, résilience et FinOps ».

CONTRAINTES FONDAMENTALES (inchangées)
AI Career OS reste une application LOCALE, mono-utilisateur, sans authentification,
sans SaaS, sans réseau requis. AUCUN appel cloud réel ne doit être requis ni
effectué : pas d'API AWS/Azure, pas de SDK cloud exécuté, pas de credentials cloud,
pas de provisionnement, pas de Terraform/CloudFormation appliqué, pas de coût réel.
Le Lab cloud est un simulateur DÉTERMINISTE sur fixtures locales, exactement comme
le Security & Incident Lab (V24), le Kubernetes Manifest Lab (V23) et le Cloud
Topology Lab (V22). Ce n'est ni un outil d'audit cloud, ni un estimateur de coûts
officiel, ni un scanner de configuration : c'est un laboratoire pédagogique.

Réutilise les abstractions existantes : catalogue, progression v3, tracks,
exercices, missions, preuves, compétences, glossaire, recherche, sauvegarde, Labs,
playbooks « Que faire dans ce cas ? », gates. AUCUN nouveau moteur de progression,
AUCUNE source de vérité parallèle, AUCUN nouveau Workbench. Les données pilotent les
surfaces (pas de valeurs magiques, pas de liste de parcours ni de comptes codés en
dur, pas de trackId === "..." éparpillé). Évite toute modification de package.json
sauf indispensable (démontre alors pourquoi) ; aucune dépendance lourde/UI/réseau ;
CodeMirror lazy.

LANGUE : tous les rapports, audits, docs pédagogiques, rapports de sprint, la
synthèse finale et le prompt V26 doivent être EN FRANÇAIS.

INTERDICTIONS : eval ; new Function ; vm non maîtrisé ; shell arbitraire ; spawn
shell:true ; exécution de contenu utilisateur ; exécution d'un template
d'infrastructure ; terraform apply ; aws/az CLI ; accès réseau ; téléchargement ;
lecture de secrets hôte ; traversal de chemin ; écriture hors workspace ; import
dynamique depuis une valeur utilisateur. Aucun vrai secret/credential cloud dans le
dépôt, même en exemple : uniquement des valeurs factices explicitement reconnaissables
(ARN factices FAKE, comptes/subscriptions factices, clés FAKE).

CE QU'IL FAUT ENSEIGNER (au-delà d'un catalogue de services)
Modèles mentaux cloud ; responsabilité partagée ; comptes AWS / subscriptions Azure ;
régions et zones de disponibilité ; IAM (users, groups, roles, identities, policies)
et moindre privilège ; réseau (VPC/VNet, subnets, routing, security groups/NSG,
passerelles) ; compute (VM, serverless/functions, containers managés) ; stockage
objet/bloc/fichier ; bases de données managées ; secrets managés ; observabilité
cloud (logs, métriques, alertes) ; haute disponibilité et scaling ; backup ;
disaster recovery, RTO/RPO ; coûts, budgets, tagging, FinOps ; mapping RAISONNÉ
AWS ↔ Azure (pas une simple table : quand tel service, pourquoi, équivalents et
différences) ; trade-offs d'architecture ; incidents cloud et « Que faire dans ce
cas ? » cloud. Chaque notion doit avoir un modèle mental, un exemple concret, une
erreur fréquente, et être PRATIQUÉE (exercice ou mission), pas seulement décrite.

DÉROULÉ (atomique, un commit par checkpoint : audit → implémente → teste → tsc →
build → valide → restaure progress → nettoie → commit → push)

CP0 — Audit de reprise LECTURE SEULE : git status/HEAD/local vs origin/log ; diff
non commité ; commits V24 présents ; progress.json (établir la baseline RÉELLE de la
session, ne pas forcer un ancien SHA) ; workspaces/serveurs/processus résiduels ;
recherche des hardcodes (nombre de parcours, listes de tracks, comptes d'exercices).
Présenter le rapport AVANT d'implémenter.

CP1 — ADR/HSD/TSD-025 : architecture du Cloud Foundations Lab. Trois niveaux
d'honnêteté (modèle déterministe local / simulation / environnement externe non
vérifié). Modèle de données des ressources cloud fictives (compte, région, IAM,
réseau, compute, stockage, coûts). Estimation de coûts DÉTERMINISTE et clairement
étiquetée « pédagogique, non officielle ». Mapping AWS↔Azure comme donnée, pas comme
code. Critères RTO/RPO, HA, moindre privilège IAM.

CP2 — Modèle pur `lib/cloud-foundations*.mjs` (+ .d.ts) : domaines (iam, network,
compute, storage, database, observability, resilience, finops), types de ressources,
validation de « scénarios cloud » (fixtures vulnérables/optimisables ↔ corrigées),
détection prudente (IAM trop large, bucket public, absence de backup, SPOF, ressource
sur-dimensionnée) avec confiance + réel/simulé + limites. Base de prix FACTICE
locale et versionnée. Gate `v25:check` (robuste aux répertoires vides), ajoutée à
gates:active ; basculer `v24:check` en historique SI V25 modifie ses jours cibles
(sinon la laisser active) — appliquer le cycle de vie des gates avec rigueur.

CP3 — Cloud Foundations Lab : routes `/cloud-foundations` (catalogue) et détail
(analyse IAM/réseau/coûts + comparaison avant/après + « Que faire dans ce cas ? »
cloud). Au moins 5 scénarios (IAM trop permissif, réseau exposé, stockage public,
absence de HA/backup, gaspillage FinOps) chacun en état problématique ↔ optimisé
(0 constat une fois corrigé). Estimateur de coûts déterministe étiqueté. UI réelle,
secrets/ARN masqués, aucune exécution, bundles maîtrisés, CodeMirror lazy.

CP4 — Enrichissement pédagogique CIBLÉ (plan de mutation contrôlée, dérive bornée)
de journées d'ancrage réelles : cloud/responsabilité partagée, IAM/moindre privilège,
réseau cloud, HA/DR, FinOps. Aucune journée déplacée, aucun contenu dupliqué.

CP5 — Au moins 12 exercices déterministes (`cloudx-*` ou `aws-*`/`az-*`) :
lecture/écriture d'une politique IAM minimale, détection de wildcard IAM, choix de
subnet public/privé, règle de security group, choix de type de stockage, calcul
RTO/RPO, estimation de coût mensuel déterministe, tagging/allocation FinOps, choix
compute (VM/serverless/container), mapping AWS↔Azure. Contrat d'exercice respecté.

CP6 — Au moins 6 missions cloud : IAM à corriger (moindre privilège), réseau à
segmenter, stockage à sécuriser, HA/DR à concevoir (RTO/RPO argumentés), optimisation
FinOps (décision chiffrée), incident cloud combiné. Au moins une mission exige un
runbook, un post-mortem et une décision argumentée.

CP7 — 6ᵉ parcours `cloud-foundations-v1` (« AWS & Azure Foundations » ou variante
cohérente), DISPONIBLE, data-driven, réutilisant les journées existantes (cloud,
réseau, sécurité, observabilité, CI/CD) sans dupliquer de curriculum, non contigu,
progression simple→complexe, isolé des 5 autres parcours. Attention : rendre
DATA-DRIVEN tout test/surface supposant exactement 5 parcours (ne pas coder « 6 » en
dur). Tests : buildCatalogue valide, parcours sélectionnable, bascule, isolation,
navigation bornée.

CP8 — Glossaire (auditer les ~520 entrées, ne rien dupliquer) : compléter IAM, role,
policy, principal, VPC/VNet, subnet, CIDR, route table, security group, NSG, NAT
gateway, VM, serverless, managed database, object/block/file storage, availability
zone, region, RTO, RPO, disaster recovery, backup, autoscaling, reserved/spot,
tagging, FinOps, cost allocation, shared responsibility, well-architected, etc.
Étendre la surface « Que faire dans ce cas ? » avec ≥ 8 cas cloud (IAM trop large,
fuite de bucket, dépassement de budget, panne de région, échec de DR, ressource
orpheline, quota atteint, coût qui explose). Réutiliser la structure playbook
existante (15 rubriques).

CP9 — Intégration : gates (actives/historiques, périmètre/sprint/statut/bloquant),
recherche/palette (scénarios cloud, playbooks cloud, glossaire, parcours),
backup/import, E2E cloud complet, validation navigateur responsive 375/768/1024/
1440/1920 (Chromium headless disponible ; distinguer honnêtement test automatisé /
capture / interaction non pilotée / non testé). Commit seulement s'il y a de vrais
changements.

CP10 — Batterie complète (tests, tsc, build, gates:active, v25:check, curriculum,
depth, glossary, pedagogy, anti-fuite, backup/import, recherche, responsive,
bundles) ; hardening (aucun eval/Function/shell:true/exec/appel réseau/credential
réel/test privé/solution exposé) ; restaurer progress.json à la baseline de session
(byte-identique) ; nettoyer workspaces/serveurs/processus/temporaires ; vérifier
local==origin, working tree propre, HEAD final. Rédiger `docs/SPRINT-V25.md` (≈ 32
sections, en français) + audit pédagogique V19→V25 mis à jour + prompt COMPLET V26.
Synthèse finale affichée EN FRANÇAIS. NE PAS COMMENCER V26.

RAPPELS : réutilise Chromium headless pré-installé (ne pas « playwright install ») ;
sauvegarde/restaure progress.json à chaque test ; toute dérive éditoriale hors
périmètre doit échouer v25:check ; le mapping AWS↔Azure doit être RAISONNÉ (quand,
pourquoi, différences), jamais une simple table de correspondance.
```

---

*Fin du rapport V24. V25 est préparé mais NON démarré.*
