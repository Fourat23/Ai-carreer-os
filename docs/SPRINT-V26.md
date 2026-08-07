# Sprint V26 — Cloud / DevOps Engineer + expansion de la bibliothèque de fond

Rapport de sprint (français). AI Career OS reste **local, mono-utilisateur, sans
authentification, sans SaaS, sans réseau requis**. V26 n'introduit **aucun nouveau
moteur** ni source de vérité parallèle : il réutilise le catalogue, la progression
v3, les tracks, les compétences, le glossaire, la recherche, la sauvegarde et le
pipeline de génération existants. **Aucun appel Docker/Kubernetes/AWS/Azure réel,
aucune credential, aucun provisionnement** : les leçons enseignent des concepts et
des raisonnements, elles n'exécutent rien.

## 1. Intention du sprint
Priorité assumée : **PÉDAGOGIE > COHÉRENCE DES PARCOURS > PRATIQUE > NOUVELLES
FEATURES.** Résorber la dette produit prioritaire identifiée : la bibliothèque
canonique des « Leçons de fond » (~60) était trop petite et ne reflétait plus la
colonne Cloud/DevOps couverte par la pratique.

## 2. État initial
Fin de V25 (`HEAD = 4bf4038`). CP1 et CP2 de V26 déjà en place au démarrage de
cette session (`HEAD = d026a87`). Corpus de leçons : 60. Baseline de session
progress.json : gitignoré (données runtime), non modifié.

## 3. Architecture retenue (ADR-026)
Étendre la bibliothèque EXISTANTE (leçons `.md` hand-authored + métadonnées
`LESSONS` dans `scripts/data/lessons-map.mjs`, injectées dans `data/program.json`
par `npm run generate`), sans nouvel outillage. Contrat de leçon = connaissance
canonique réutilisable, distincte des Jours/Exercices/Labs/Missions/Projets/
Playbooks/Glossaire. Graphe pédagogique via les liens internes existants
(`/doc/lessons/<slug>`, `/day/<n>`).

## 4. Gate V26
`scripts/v26-check.mjs` (`npm run v26:check`) : validation STRUCTURELLE de chaque
leçon déclarée dans `docs/architecture/v26-lessons-plan.json` — fichier présent,
entrée `LESSONS` cohérente, sections minimales, absence de marqueurs d'authoring,
concepts requis couverts, liens internes valides, empreinte anti-duplication. La
gate NE JUGE JAMAIS la profondeur par la longueur.

## 5. Checkpoints
CP0 audit lecture seule → CP1 ADR/HSD/TSD-026 → CP2 gate + plan + tests →
CP3 Linux (5) + réseau (5) → CP4 Docker (5) → CP5 CI/CD (4) → CP6 Kubernetes (6) →
CP7 Cloud/AWS/Azure/IaC/FinOps (7) → CP8 parcours cloud-devops-engineer-v1 →
CP9 audit + E2E + validation navigateur → CP10 hardening + rapport + prompt V27.

## 6. Commits
| CP | Commit | Objet |
|---|---|---|
| CP1 | `7d8868b` | ADR/HSD/TSD-026 |
| CP2 | `d026a87` | gate v26:check + plan de leçons + tests d'intégrité |
| CP3 | `c18c383` | leçons de fond Linux (5) et réseau (5) |
| CP4 | `c100e94` | leçons de fond Docker (5) |
| CP5 | `0225998` | leçons de fond CI/CD & livraison (4) |
| CP6 | `8282921` | leçons de fond Kubernetes (6) |
| CP7 | `b1aa149` | leçons de fond Cloud, AWS, Azure, IaC & FinOps (7) |
| CP8 | `2fc0670` | parcours Cloud / DevOps Engineer (data-driven) |
| CP9 | `bd59281` | audit pédagogique V26 + E2E + validation navigateur |
| CP10 | *(ce commit)* | hardening + rapport + prompt V27 |

## 7. Leçons Linux (CP3)
`linux-filesystem-permissions` (FHS, inode, rwx/octal, chmod/chown, « Permission
denied »), `linux-processes-signals` (PID/fork/exec, états, SIGTERM vs SIGKILL,
zombie, port occupé), `linux-services-systemd` (daemon, units, enable vs start,
Restart, journalctl), `linux-resources-io` (load, RSS/swap/OOM, df/iostat, file
descriptors/ulimit, /proc), `linux-ssh-remote` (clés ed25519, agent, config,
tunnels, durcissement).

## 8. Leçons réseau (CP3)
`networking-tcp-ip-model` (4 couches, encapsulation, diagnostic par couche),
`networking-addressing-routing` (IP, CIDR, subnet, gateway, table de routage, NAT,
public/privé), `networking-dns` (A/AAAA/CNAME/MX/TXT, TTL/cache, dig, propagation),
`networking-http-tls` (méthodes/statuts, handshake, ce que TLS garantit et ne
garantit pas), `networking-proxy-loadbalancing` (proxy vs reverse proxy, L4/L7,
health checks, stateless vs sticky).

## 9. Leçons Docker (CP4)
`docker-images-layers` (couches, cache de build, tag vs digest, registre),
`docker-build-dockerfile` (contexte, COPY/ADD, CMD/ENTRYPOINT, ARG/ENV,
multi-stage), `docker-networking-volumes` (réseaux bridge, DNS de service, ports,
volumes vs bind mounts), `docker-compose` (orchestration déclarative, depends_on +
healthcheck), `docker-production-hardening` (non-root, image minimale, read-only,
limites, PID 1/SIGTERM). Distinctes de l'introduction `docker-containers`.

## 10. Leçons CI/CD (CP5)
`ci-cd-pipeline-anatomy` (déclencheurs, jobs/runners, parallélisme, cache vs
artefact, fail fast), `ci-cd-quality-gates-artifacts` (portes qualité bloquantes,
artefacts immuables versionnés, build once/deploy many), `deployment-strategies`
(rolling, blue-green, canary, feature flags, migrations expand/contract),
`release-incident-recovery` (rollback vs roll-forward vs hotfix, post-mortem sans
blâme). Distinctes de l'introduction `ci-cd`.

## 11. Leçons Kubernetes (CP6)
`k8s-why-architecture` (état désiré, réconciliation, control plane vs nœuds),
`k8s-workloads` (Pod/Deployment/StatefulSet/DaemonSet/Job, labels),
`k8s-networking-services` (Service ClusterIP/NodePort/LoadBalancer, DNS interne,
Ingress L7), `k8s-config-probes` (ConfigMap/Secret, liveness/readiness/startup,
requests/limits), `k8s-troubleshooting` (get/describe/logs, CrashLoop/ImagePull/
Pending/OOMKilled), `k8s-security` (namespaces, RBAC, NetworkPolicies,
securityContext). Comble le trou majeur : 0 → 6 leçons.

## 12. Leçons Cloud / AWS / Azure / IaC / FinOps (CP7)
`cloud-fundamentals` (IaaS/PaaS/SaaS, responsabilité partagée, régions/AZ,
pay-as-you-go), `cloud-networking` (VPC/VNet, subnets, security groups/NSG, NAT),
`cloud-compute-storage` (VM/conteneurs/serverless, objet/bloc/fichier),
`cloud-aws-core` (EC2/S3/IAM/VPC/RDS/Lambda/EKS), `cloud-azure-core`
(subscription/resource group, Blob/AKS, Entra ID + RBAC Azure),
`iac-fundamentals` (déclaratif, idempotence, state, plan/apply, dérive),
`cloud-finops` (modèle de coût, right-sizing, réservé/spot, tagging, egress).

## 13. Bilan quantitatif
Bibliothèque de fond : **60 → 92 leçons (+32)**, dans la cible « ~+25 à +40 »,
choisie par la profondeur réelle et non pour atteindre un KPI. 8 nouvelles
catégories d'affichage : Systèmes & Linux, Réseau, Conteneurs & Docker, CI/CD &
livraison, Kubernetes, Cloud/AWS/Azure & IaC (les leçons DevOps historiques
restent sous Production & DevOps).

## 14. Parcours Cloud / DevOps Engineer (CP8)
`cloud-devops-engineer-v1`, statut `available`, **piloté par données**, réutilisant
des journées existantes (aucun jour créé), durée **dérivée** (29 jours), 7 modules
build → ship → run. Le placeholder annoncé `cloud-devops-v1` a été promu et retiré.
Cadrage honnête junior/entrée ; dette de journées de pratique dédiées documentée.

## 15. Data-driven (aucun nombre magique)
Surfaces déjà data-driven (`cat.tracks.filter(isTrackAvailable).length`) : la page
Parcours affiche « 6 disponible · 9 au total » sans « 6 » codé en dur. Les tests
épinglant un compte fixe ont été rendus data-driven (v25-e2e) ou basés sur
l'ensemble NOMMÉ des parcours (catalogue).

## 16. Cycle de vie des gates
`v25:check` → `gates:historical` (V26 enrichit légitimement
`scripts/data/lessons-map.mjs`, hors périmètre V25). `gates:active` =
curriculum:check + curriculum:depth-check + glossary:check + v18:check +
v20:pedagogy-check + v26:check. Même mécanisme que v23→historique (V24) et
v24→historique (V25).

## 17. Anti-slop (non négociable)
AWS et Azure explicitement distingués (table de correspondance) ; aucune
affirmation d'exécution réelle (Docker/K8s/AWS/Azure/IaC) ; conteneur ≠ VM (noyau
partagé) ; Secret K8s = base64 non chiffré par défaut ; secrets factices, jamais
dans les couches ; couverture de tests = signal, pas preuve ; responsabilité
partagée exacte.

## 18. Contrat de leçon
Structure canonique complète pour chaque leçon (Objectif, Prérequis, Modèle mental,
Explication, repères pratiques, Exemple guidé, Erreurs fréquentes, Sécurité, Cas
métier, Questions d'entretien, Mini-exercice, À retenir, Vocabulaire, Checklist,
Liens). Alignement sur le corpus existant (« Mini-exercice » plutôt que
« Mini-vérification » pour satisfaire depth-check et l'homogénéité).

## 19. Gestion des liens en avant
Les leçons CP3 référençaient initialement des slugs non encore créés (Docker/K8s/
cloud). Résolution : de-linkage propre au CP3 (prose conservée, aucun lien mort),
puis re-création progressive des leçons cibles aux CP4–CP7. v26:check garantit
qu'aucun lien `/doc/lessons/<slug>` ni `/day/<n>` n'est mort à chaque commit.

## 20. Validation navigateur responsive
Chromium headless pré-installé (aucun `playwright install`) : pages de leçons
(`cloud-networking`, `k8s-troubleshooting`) et `/parcours` — statut 200, **aucun
débordement horizontal** à 375px (mobile) et 1440px (desktop). Rendu de la
structure de leçon (emoji headers, liens) et comptage data-driven du parcours
confirmés par capture. Non testé : 768/1024/1920 (extrapolés du comportement
fluide observé, non pilotés).

## 21. E2E V26
`tests/v26-e2e.test.mjs` (5 tests) : corpus réel (fichier ↔ LESSONS ↔
program.json), parcours data-driven à durée dérivée, comptage sans nombre magique,
enrôlement isolé, liens internes tous résolus.

## 22. Batterie de vérification finale
`npm test` (913, 0 échec), `npm run gates:active` (OK), `npm run v26:check` (32
leçons), `npx tsc --noEmit` (OK), `npm run build` (OK), génération idempotente
(795 fichiers, 92 leçons). Détails au CP10 ci-dessous (section 24).

## 23. Fichiers clés
`curriculum/lessons/*.md` (32 nouveaux), `scripts/data/lessons-map.mjs` (32
entrées), `docs/architecture/v26-lessons-plan.json` (périmètre gate),
`scripts/v26-check.mjs`, `lib/catalogue.mjs` + `lib/catalogue.d.ts` (parcours),
`docs/PEDAGOGICAL-AUDIT-V26.md`, `tests/v26-lessons.test.mjs`,
`tests/v26-e2e.test.mjs`, `package.json` (gates).

## 24. Hardening final (CP10)
Batterie complète rejouée verte ; génération idempotente vérifiée ; `progress.json`
(gitignoré) intact ; serveurs/temporaires de validation arrêtés ; local == origin,
working tree propre. Aucun secret réel, aucune donnée interne dans les bundles.

## 25. Dette et backlog
Voir `docs/PEDAGOGICAL-AUDIT-V26.md` section H : V27 = pratique dédiée Cloud/DevOps
(journées/labs K8s, exercices ciblés adossés aux leçons, glossaire, IaC conceptuel)
pour faire mûrir le parcours ; V28 = observabilité approfondie, bases en production,
messagerie/événementiel, rééquilibrage Data/Frontend/Game.

## 26. Ce qui n'a PAS été fait (hors périmètre)
Refonte UI/UX globale, gamification, complétion Data/Frontend/Game, exécution IaC
réelle, provisioning cloud réel, cluster K8s réel, réécriture des 365 jours.

## 27. Honnêteté sur le parcours
`cloud-devops-engineer-v1` est un parcours cohérent de niveau junior/entrée bâti
sur des journées existantes et adossé aux nouvelles leçons de fond. Il n'est PAS
présenté comme un parcours senior clé en main : la dette de pratique dédiée est
explicite. Un domaine n'est jamais déclaré « couvert » sur la seule présence d'une
journée.

## 28. Prompt V27
Voir la section finale de ce document (bloc dédié). V27 est préparé mais NON
démarré.

---

## Prompt COMPLET V27 (à copier tel quel pour démarrer le prochain sprint)

```
SPRINT V27 — « Cloud / DevOps : PRATIQUE dédiée + maturation du parcours »

CONTEXTE PRODUIT (à ne jamais violer)
AI Career OS est une application d'apprentissage strictement LOCALE, mono-
utilisateur, SANS authentification, SANS SaaS, SANS multi-utilisateur, SANS
télémétrie externe, SANS cloud réel, SANS secrets réels, SANS réseau fournisseur
réel. Tout fonctionne hors ligne sur fixtures locales. Aucune donnée pédagogique
n'est réécrite sans raison. Le pipeline : leçons .md hand-authored + métadonnées
LESSONS (scripts/data/lessons-map.mjs) → data/program.json via `npm run generate`
(les fichiers `<!-- keep -->` ne sont jamais régénérés). Progression = store v3
multi-parcours ; catalogue = lib/catalogue.mjs ; gates = package.json.

PRIORITÉ ASSUMÉE : PÉDAGOGIE > COHÉRENCE DES PARCOURS > PRATIQUE > NOUVELLES
FEATURES. V26 a comblé la dette de CONNAISSANCE de fond (60 → 92 leçons sur
Linux/réseau/Docker/CI-CD/Kubernetes/cloud/AWS/Azure/IaC/FinOps) et activé le
parcours cloud-devops-engineer-v1 (junior, piloté par données, durée dérivée). La
dette RESTANTE est la PRATIQUE dédiée : au-delà des jours 320-321 (Docker/K8s) et
307/326 (CI/CD), il manque des journées/labs d'entraînement pour faire mûrir le
parcours du niveau junior vers un niveau plus complet, et des exercices ciblés
adossés aux 32 nouvelles leçons.

COMMENCE PAR CP0. N'ÉCRIS RIEN AVANT D'AVOIR ÉTABLI L'ÉTAT RÉEL.

CP0 — Audit lecture seule + forensique. NE présume JAMAIS l'état. Lis
docs/SPRINT-V26.md, docs/PEDAGOGICAL-AUDIT-V26.md (section H backlog),
lib/catalogue.mjs (cloud-devops-engineer-v1), les 32 leçons V26, les exercices/
labs existants (data/, curriculum/). Établis : quelles COMPÉTENCES du parcours
Cloud/DevOps sont réellement PRATIQUÉES (exercices/labs atteignables) vs seulement
enseignées (leçon seule) ? Matrice « leçon → pratique atteignable ». HEAD réel,
compte de tests, parcours, leçons, exercices, glossaire. Ne réimplémente rien
d'existant.

CP1 — ADR/HSD/TSD-027 : décision d'architecture pour la pratique dédiée (réutiliser
les Labs existants — Kubernetes Manifest Lab, Pipeline Lab, Cloud Architecture Lab —
plutôt que d'en créer ; exercices ciblés reliés aux journées ; PAS de provisioning
réel). Gate v27:check (structurelle).

CP2 — Gate v27:check + plan (docs/architecture/v27-*.json) + tests d'intégrité.
Basculer v26:check en gates:historical SI V27 enrichit son périmètre (leçons/
lessons-map). Respecter le cycle de vie des gates.

CP3-CP6 — Exercices ciblés + labs adossés aux leçons V26, par domaine (réseau/
Linux ; Docker ; CI/CD ; Kubernetes ; cloud). Ex. : calcul de recouvrement CIDR,
lecture de `dig`/statuts HTTP, diagnostic CrashLoopBackOff, choix rolling/blue-
green/canary, right-sizing FinOps. RÉUTILISER le moteur d'exercices et les Labs
existants ; relier chaque exercice à une leçon ET à une journée. Aucune commande
destructrice sans contexte ; aucune exécution réelle simulée comme réelle.

CP7 — Cohérence du parcours cloud-devops-engineer-v1 : réévaluer honnêtement s'il
peut passer d'un cadrage junior à plus complet grâce à la pratique ajoutée ;
sinon documenter la dette restante. Glossaire : compléter UNIQUEMENT les termes
Cloud/DevOps réellement absents révélés par les leçons/exercices (ne pas gonfler).

CP8 — Intégration : recherche/palette, backup/import, isolation entre parcours,
E2E du parcours (enrôlement → progression → preuves d'exercices → missions →
isolation → export/import).

CP9 — Audit pédagogique V27 (docs/PEDAGOGICAL-AUDIT-V27.md) : le parcours Cloud/
DevOps est-il réellement employable ? Matrice couverture « connaissance ↔ pratique »
mise à jour. Validation navigateur responsive (Chromium pré-installé, PAS de
« playwright install ») 375/768/1024/1440 — distinguer honnêtement test automatisé /
capture / non testé. Backlog V28/V29.

CP10 — Batterie complète (npm test, tsc, build, gates:active, v27:check, curriculum,
depth, glossary, pedagogy, anti-fuite, sécurité, bundles, E2E) ; hardening ;
progress.json (gitignoré) intact ; nettoyer serveurs/temporaires ; local==origin,
working tree propre. Rédiger docs/SPRINT-V27.md (~28 sections) + prompt COMPLET V28.
Synthèse finale EN FRANÇAIS. NE PAS COMMENCER V28.

ANTI-SLOP (non négociable) : pas de contenu générique ni de gabarits répétés ; pas
de faux chiffres ; AWS distinct d'Azure ; ne jamais prétendre avoir exécuté Docker/
K8s/AWS/Azure/IaC ; conteneur ≠ VM (noyau partagé) ; Secret K8s = base64 non
chiffré par défaut ; secrets factices manifestes ; ne pas déclarer un domaine
« couvert » sur la seule présence d'une journée — vérifier la pratique ATTEIGNABLE ;
qualité > quantité (mieux vaut moins d'exercices excellents).

HORS PÉRIMÈTRE V27 : refonte UI/UX globale, gamification, complétion Data/Frontend/
Game, exécution IaC réelle, provisioning cloud réel, cluster K8s réel, réécriture
des 365 jours.

RAPPELS : réutilise le Chromium headless pré-installé ; progress.json est gitignoré
(ne pas le committer) ; tout en FRANÇAIS ; commits atomiques par CP (audit →
implémentation → tests → tsc → build → gates → commit → push sur la branche de
développement).
```

---

*Fin du rapport V26. V27 est préparé mais NON démarré.*
