# Sprint V23 — Kubernetes & Orchestration Lab

Rapport de clôture (en français). Livraison d'un **laboratoire local, déterministe
et sûr d'analyse et de simulation de manifests Kubernetes** — modèle pur, analyseur
de configuration, simulateur d'incidents/rollouts, un **Kubernetes Manifest Lab**
(UI + API), du contenu d'orchestration approfondi avec une méthode d'intervention
réutilisable, des exercices et missions déterministes, une intégration au parcours
Systems & Cloud, un assainissement raisonné des gates, et un audit pédagogique réel.

> **Nature honnête** : ce n'est **pas** une console `kubectl`, **pas** un cluster.
> Aucun `kubectl apply`, **aucun réseau**, aucun credential, aucun secret réel,
> aucune isolation OS (un Namespace est un cloisonnement logique, pas une frontière
> OS). Un manifest se **raisonne** ici — l'état réel de `kubectl` est **absent**.

## 1. État initial audité

Fin V22 (HEAD `a3e77e8`), 761 tests, 4 parcours, `data/progress.json` gitignoré au
SHA `cea317e8`, working tree propre, local == origin, aucun résidu. **Outils** :
docker CLI présent (daemon down) ; **kubectl/kind/minikube/k3d/helm tous absents**
(aucun cluster) ; `@playwright/test` absent **mais** Chromium pré-installé
(`/opt/pw-browsers`, v141) ; **aucun parseur YAML** installé. Aucune couverture
Kubernetes dans le curriculum.

## 2. Divergences constatées

- Aucune divergence de baseline (HEAD exactement `a3e77e8`, V23 non commencé).
- **Divergence assumée vs « Kubernetes »** : livré comme analyseur/simulateur
  déterministe, jamais comme console/cluster (ADR-023).
- **YAML → JSON** : sans parseur YAML disponible et sans installation réseau
  reproductible, les manifests sont modélisés en **JSON** (sémantiquement
  identiques ; kubectl l'accepte). Aucune dépendance ajoutée.
- **`v22:check` devenue gelée** : V23 enrichit les jours 320-321 (hors de son
  périmètre 78-81) ; ses 3 topologies restent valides — instantané historique,
  non-régression (§16).

## 3. Résumé avant / après

| | Avant V23 | Après V23 |
|---|---|---|
| Orchestration/Kubernetes | absent | jours 320-321 approfondis |
| Manifest Lab | — | modèle + ~29 règles + 16 incidents + rollout |
| Exercices | 124 | **140** (+16 k8s) |
| Missions | 21 | **27** (+6 k8s) |
| Scénarios de manifests | 0 | **3** |
| Glossaire | 440 | **483** (+43 k8s) |
| Tests | 761 | **820** |
| Méthode d'intervention | — | « Que faire dans ce cas ? » |
| Gates | 6 actives + 3 gelées | **6 actives + 4 gelées** (inventaire central) |
| progress.json | `cea317e8` | `cea317e8` (inchangé) |

## 4. Architecture retenue

Réplique du patron « Lab » (V21/V22) appliqué au manifest (ADR/HSD/TSD-023) :
- **Modèle pur** `lib/manifest.mjs` (+ `.d.ts`) : `KINDS` (15), `validateManifestSet`,
  résolveurs (`selectorMatches`, `serviceEndpoints`, `podsOf`), `publicManifestView`.
- **Analyse** `lib/manifest-analysis.mjs` : ~29 règles pures → diagnostics
  (code/sévérité/catégorie/preuve/recommandation/autofixable), synthèse.
- **Réconciliation/simulation** `lib/manifest-reconcile.mjs` : `reconcile` (pods/
  endpoints), `simulateIncident` (16 incidents), `simulateRollout` (+ rollback).
- **Adaptateur** `lib/manifest-kubectl.mjs` : disponibilité honnête (I/O bornée).
- **Serveur/API/UI** : `manifests-server.ts`, `app/api/kubernetes/[id]`,
  `app/kubernetes/**` (panneaux + éditeur JSON textarea, lazy, accessible).

## 5. Ce qui est RÉEL

L'analyse, la validation, la réconciliation et la simulation sont **du code pur,
déterministe et testé** (820 tests). Les exercices s'exécutent réellement (moteur
d'exercices existant). Le rendu de l'UI est vérifié dans un **vrai navigateur**
(Chromium headless). L'adaptateur `kubectl` sonde **réellement** l'environnement.

## 6. Ce qui est SIMULÉ

Les états de pods, incidents (CrashLoopBackOff, OOMKilled…), rollouts et
disponibilités sont des **propriétés qualitatives déterministes**, pas l'exécution
d'un vrai cluster. Aucun manifest n'est déployé.

## 7. Ce qui n'a PAS été exécuté

Aucun `kubectl apply` contre un cluster réel (aucun cluster disponible). La matrice
navigateur **console-errors** et **overflow horizontal** n'est pas automatiquement
assertée (il faudrait un pilote CDP non installé) — le rendu réel est vérifié par
capture, la mise en page mobile/desktop confirmée visuellement (§18).

## 8. Checkpoints (CP0 → CP10)

| CP | Objet | Commit |
|---|---|---|
| CP0 | Audit forensique & pédagogique (lecture seule) | — |
| CP1 | ADR/HSD/TSD-023 | `7addee7` |
| CP2 | Modèle pur de manifest + validation | `f74c5fb` |
| CP3 | Analyseur + réconciliation/simulation | `89dab14` |
| CP4 | Kubernetes Manifest Lab (données + adaptateur + API + UI) | `b76af3b` |
| CP5 | Enrichissement jours 320-321 + gate v23:check | `60fb945` |
| CP6 | 16 exercices déterministes | `fe2c8df` |
| CP7 | 6 missions d'ingénierie | `644b1af` |
| CP8 | 43 termes de glossaire + audit pédagogique | `330cc54` |
| CP9 | Intégration, recherche, assainissement des gates, E2E | `97ca0fb` |
| CP10 | Batterie finale, rapport, prompt V24 | (ce commit) |

## 9. Commits

10 commits de contenu (CP1→CP9) + ce commit (CP10), tous poussés sur
`claude/ai-career-os-saas-phfg49`. CP0 sans commit (lecture seule, baseline saine).
Aucun commit vide ni parasite.

## 10. Tests

Avant : **761**. Après : **820** (+59 : 18 modèle, 35 analyse+réconciliation, 6
contenu manifests). 820/820 verts.

## 11. Exercices

**16** exercices `k8s-*` (jours 320-321) : compter les kinds, matcher un selector,
endpoints d'un Service, image épinglée, choisir le workload, Secret/ConfigMap,
risque OOM, rôle de probe, disponibilité d'un rolling update, état d'un pod,
décision de reprise, Ingress→Services, StatefulSet sans PVC, dérive de config,
replicas HA, besoin de readiness. Total : **140**.

## 12. Missions

**6** missions `k8s-*` (moteur V18) : deploy-api, service-no-endpoints, crashloop,
oomkilled-sizing, rolling-regression (4 livrables : décision + plan de rollback +
post-mortem), secret-rotation. Total : **27**.

## 13. Cours enrichis

Jours **320-321** (source `days-enrich-301-365.mjs`, additif) : 320 (du conteneur à
l'orchestration : état désiré/observé, réconciliation, control plane, objets,
labels/selectors, ce que k8s ne résout pas) ; 321 (exploitation : probes, requests/
limits, rollout/rollback, états, **méthode « Que faire dans ce cas ? »** en 10
étapes + cas types, vocabulaire de reprise, PVC/HPA/RBAC). Dérive contrôlée : seuls
320-321 changent (`program.json` restauré).

## 14. Entrées du glossaire

**43** termes k8s (440 → **483**) : Kubernetes/orchestration/cluster, control plane
(API server/scheduler/etcd/kubelet), objets (Pod→CronJob, Namespace), réseau
(Service/ClusterIP/NodePort/LoadBalancer/Ingress), config (ConfigMap/Secret),
sécurité (ServiceAccount/RBAC/Role), santé (probes, requests/limits), incidents
(CrashLoopBackOff/ImagePullBackOff/OOMKilled/Pending), rollout, PVC, HPA, taint/
toleration, réconciliation, action corrective/préventive.

## 15. Audit pédagogique

Scan de danger (31 fichiers V23, **0 bloquant**) ; registre étendu à **91 items**
(85 récents), tous ≥ seuil ; rapport `docs/PEDAGOGICAL-AUDIT-V23.md` avec comparaison
**V19→V23** et faiblesses documentées (densité 320-321 ; control plane/RBAC
conceptuels ; pas d'exécution réelle). Aucun défaut démontré → aucune correction.

## 16. Analyse des gates historiques

Inventaire central `docs/architecture/gates-inventory.md`, trois groupes :
- **Actives** (`gates:active`) : `curriculum:check`, `curriculum:depth-check`,
  `glossary:check`, `v18:check`, `v20:pedagogy-check`, `v23:check` — dérivent leurs
  invariants des sources, restent vertes.
- **Historiques gelées** (`gates:historical`, informatif) : `v17:check`,
  `v19:check`, `v21:check`, et **`v22:check`** (figée en V23 : jours 320-321 hors
  périmètre 78-81 ; topologies toujours valides). Non-régression documentée.
- **Obsolètes/codées en dur** : aucune.
Aucune gate supprimée, aucune réécriture d'historique, aucune régression masquée.

## 17. Stratégie de validation navigateur

`@playwright/test` absent ; **Chromium headless pré-installé** (`/opt/pw-browsers`,
v141) réutilisé **sans ajout de dépendance ni téléchargement**. Le harness distingue :
**PASS navigateur réel (rendu)**, PASS HTTP, NON VÉRIFIÉ visuellement. Rendu réel
capturé aux **5 largeurs** (375/768/1024/1440/1920) sur `/kubernetes`,
`/kubernetes/[id]`, `/day/320` → **15/15 captures non vides** ; deux inspectées
visuellement (1440 desktop, 375 mobile) : mise en page saine, pas d'overflow.
**Non automatisé** : assertions console-errors et overflow (pilote CDP requis).

## 18. Résultats responsive

Colonne unique sous 900px (`.cl-grid`), tables en `overflow-x:auto`, éditeur JSON
borné en largeur. Mobile (375px) et desktop (1440px) confirmés par capture réelle.

## 19. Résultats E2E

Serveur local : routes requises **toutes 200** (dashboard, parcours, calendrier,
jours 320/321, lab, exercice k8s, missions, mission k8s, cloud-lab, pipelines,
kubernetes + détail, skills, revisions, glossary). Exercice k8s **exécuté**
(`passedAll`), preuve créée → **progress muté** → **RESTAURÉ** à `cea317e8`.
Recherche indexe **3 manifests**. Export `/api/progress` 200. Analyse/simulate/
rollout du Lab OK (404/400/422 corrects). Serveur arrêté, aucun résidu.

## 20. Sécurité

Modèle/analyse/réconciliation **purs** : **0** `eval`, `Function`, `exec*`,
`spawn`, `shell`, aucune I/O réseau. Seul l'adaptateur fait de l'I/O **bornée**
(`execFile`, `shell:false`, timeout, sortie plafonnée) et n'exécute **jamais** un
manifest. Secrets conceptuels. Namespace présenté comme cloisonnement logique, pas
isolation OS.

## 21. Anti-fuite

`v23:check` vérifie qu'aucune vue publique de manifest ne fuit de secret ; la
recherche n'indexe que des métadonnées publiques (jamais de solution, de test
privé, de livrable, de code utilisateur).

## 22. Performances

Analyse bornée (registre fini, tri déterministe), UI lazy, **éditeur JSON en
textarea (aucun CodeMirror sur la route)** → bundles maîtrisés. Analyse côté serveur
(absente des bundles client).

## 23. Bundles

Partagé **103 kB** (inchangé). `/kubernetes` 108 kB, `/kubernetes/[id]` 111 kB,
`/api/kubernetes/[id]` 103 kB. Aucune dépendance ajoutée, aucun paquet mis à jour.

## 24. État de Docker

CLI présent, **daemon indisponible** — sans impact (le Lab n'exécute rien).

## 25. État de Kubernetes

**kubectl/kind/minikube/k3d/helm absents ; aucun cluster.** L'adaptateur renvoie
honnêtement `absent` ; le Lab fonctionne en analyse/simulation pure, ce qui est dit
à l'utilisateur (bandeau de disponibilité).

## 26. Limites honnêtes

Analyseur/simulateur déterministe, **pas** un cluster ; aucun scheduler réel, aucune
isolation OS ; états/incidents qualitatifs ; qualité sémantique des livrables de
mission en **revue humaine** ; assertions visuelles console/overflow non automatisées.

## 27. Dette technique restante

- Sécurité/RBAC approfondie, gestion des secrets, supply chain → **cible V24**.
- Exécution réelle optionnelle si un cluster (kind/minikube) devient disponible.
- Pilote CDP pour asserter console-errors/overflow automatiquement.
- Fractionnement visuel des jours 320-321 (confort).
- Observation d'apprenants réels.

## 28. État Git final

Branche `claude/ai-career-os-saas-phfg49`, poussée. Working tree propre après ce
commit.

## 29. HEAD final

Ce commit CP10 (précédent : `97ca0fb`).

## 30. local == origin

Oui, après le push de ce commit.

## 31. SHA initial / final de progress.json

Initial `cea317e8714af1fbf2dcb4227130ba5b912d17c9` — final **identique** (restauré
après chaque mutation E2E).

## 32. Absence de résidus

Aucun serveur `next` (port fermé), aucun workspace temporaire, aucun conteneur
(Docker down, non requis). Captures de validation dans le scratchpad (hors dépôt).

## 33. Prompt complet — Sprint V24

```
Reprends AI Career OS pour le Sprint V24 — « Cybersécurité appliquée : secrets,
supply chain, RBAC/Kubernetes et réponse à incident ». AI Career OS reste une
application d'apprentissage STRICTEMENT LOCALE, MONO-UTILISATEUR : aucune
authentification, aucun SaaS, aucun réseau requis pour apprendre, aucune télémétrie,
aucune dépendance à un fournisseur/cluster réel. Tu prolonges V19 (Linux/réseau),
V20 (Docker), V21 (CI/CD), V22 (Cloud) et V23 (Kubernetes).

TOUS les rapports, audits, tableaux, synthèses et prompts de reprise doivent être
rédigés EN FRANÇAIS (les noms officiels — commandes, chemins, identifiants, types,
termes comme RBAC, SBOM, CVE, OWASP, rollback, blue/green — peuvent rester en
anglais). Ne rédige pas la synthèse finale en anglais.

IMPORTANT — COMMENCE IMPÉRATIVEMENT PAR CP0, EN LECTURE SEULE. État théorique à
VÉRIFIER (jamais supposer) : branche claude/ai-career-os-saas-phfg49 ; HEAD ≈ le
commit CP10 de V23 ; V23 terminé ; 820 tests verts ; 140 exercices ; 27 missions ;
3 manifests / 3 topologies / 3 pipelines ; 483 entrées de glossaire ; 4 parcours ;
data/progress.json restauré au SHA cea317e8 (gitignoré) ; local == origin ; working
tree propre ; aucun résidu. Vérifie git status/log, la relation local/origin, la
présence éventuelle de commits V24, le SHA de progress.json, les processus/ports,
Docker, la disponibilité réelle de kubectl/cluster et de Playwright/Chromium, les
gates (actives via `npm run gates:active`, historiques via `gates:historical` :
v17/v19/v21/v22 figées, cf. docs/architecture/gates-inventory.md), les bundles, et
la couverture existante en sécurité applicative. Si HEAD diffère, inspecte git log
avant toute écriture ; ne réimplémente jamais un checkpoint livré ; reprends au
dernier état validé. Si V24 est déjà livré, n'écris rien et produis un rapport
d'audit factuel. Ne crée aucun commit CP0 si aucun correctif réel n'est nécessaire.

CONTRAINTES PERMANENTES (inchangées) : local, mono-utilisateur, sans auth/SaaS,
sans cloud/cluster réel, sans credentials, SANS SECRET RÉEL (jamais — même comme
exemple : tout secret est conceptuel/factice et détecté comme tel), sans réseau
requis dans les moteurs, sans CDN, sans eval/Function/exec/shell arbitraire, sans
argument utilisateur injecté dans une commande, sans fuite (solution/test privé/
code apprenant) dans la recherche ou le bundle client. Ne jamais présenter un
sandbox/namespace/conteneur comme une isolation OS, ni une simulation comme une
analyse de sécurité réelle d'un système en production, ni un score simplifié comme
un audit de sécurité contractuel. Décrire les protections honnêtement (validation,
allowlists, bornes, détection de motifs, vues publiques). CodeMirror/composants
lourds restent lazy et limités aux routes concernées. Pas de refonte graphique
globale, pas de nouveau runtime généraliste, pas de dépendance lourde.

DISCIPLINE DE DONNÉES & GIT (inchangée) : avant toute validation mutante, sauvegarde
data/progress.json + note son SHA + l'état workspaces/processus/ports ; après,
restaure-le à l'identique, supprime workspaces de test, arrête serveurs/processus
enfants, confirme le SHA initial et l'absence de résidu. Chaque checkpoint : audit
ciblé → conception minimale → implémentation → tests → typecheck → build si
pertinent → validation réelle → restauration → nettoyage → commit atomique → push.
Aucun commit vide/parasite ; un checkpoint validé n'est jamais laissé non commité ;
ne pas mettre à jour Next.js ni les dépendances sans justification démontrée.

SOURCE DE VÉRITÉ ÉDITORIALE : les cours vivent dans scripts/data/*.mjs et génèrent
curriculum/days + data/program.json ; ne pas éditer les Markdown générés ; après
régénération, seules les journées visées changent (les autres byte-identiques),
program.json ne change que par generatedAt (à restaurer). Backticks inline échappés
(\`) dans les littéraux de théorie. Le glossaire a sa source structurée.

OBJECTIF PRODUIT V24 : une fondation de CYBERSÉCURITÉ APPLIQUÉE, locale et
déterministe, dans la philosophie des Labs existants — RAISONNER la sécurité d'une
configuration/chaîne de livraison, pas scanner un vrai système. Ne pas devenir un
faux scanner de vulnérabilités connecté.

SUJETS À COUVRIR AVEC PROFONDEUR RÉELLE (pas seulement mentionner) : secure coding
& OWASP appliqué ; threat modeling (STRIDE au niveau conceptuel) ; authentification
vs autorisation ; gestion des secrets & rotation ; dépendances & vulnérabilités
(CVE, SBOM au niveau conceptuel) ; signatures/provenance ; supply-chain attacks ;
durcissement CI/CD (réutiliser V21) ; sécurité conteneurs (réutiliser V20) &
Kubernetes (réutiliser V23 : RBAC, ServiceAccount, moindre privilège, securityContext,
NetworkPolicy conceptuel) ; audit logs ; incident response & breach containment ;
post-mortem ; section « Que faire dans ce cas ? » (fuite de secret, dépendance
vulnérable, accès sur-privilégié, image compromise, exposition publique, credential
leak en CI). Distinguer clairement : vulnérabilité / exploit / menace / risque /
mitigation / correctif ; et bugfix/hotfix/patch/rollback comme en V21-V23.

À LIVRER (indicatif, chaque CP atomique) :
1. ADR/HSD/TSD-024 (analyseur de sécurité déterministe ; frontière analyse
   statique/simulation vs scan réel ; réutilisation des Labs V20-V23 ; secrets
   conceptuels ; alternatives rejetées).
2. Modèle pur d'artefact de sécurité (lib/security-*.mjs + .d.ts) : représenter une
   configuration à auditer (dépendances + versions, permissions/RBAC, secrets
   référencés, exposition, en-têtes, pipeline) — bornes, anti-fuite, aucune valeur
   secrète réelle.
3. Analyseur déterministe de règles de sécurité : secret en clair/mal placé,
   dépendance vulnérable (base de CVE FACTICE et versionnée localement, jamais un
   appel réseau), permission sur-privilégiée (RBAC/IAM conceptuel), exposition
   publique, image non épinglée, en-tête de sécurité manquant, CI qui logue un
   secret… — diagnostics avec preuve/risque/recommandation/CWE conceptuel.
4. Simulateur de réponse à incident : fuite de secret (→ rotation + révocation),
   dépendance vulnérable (→ mise à jour/mitigation), accès compromis (→ containment)
   — déterministe, allowlist.
5. Security Lab (UI + API) réutilisant le patron existant ; état d'un adaptateur
   honnête si un outil (ex. scanner) est présent, sinon analyse locale seule.
6. Enrichissement pédagogique : identifier les journées d'ancrage réelles (sécurité/
   OWASP/secrets/durcissement — ex. jours 67-68 et/ou 320-321/CI, à AUDITER, ne pas
   déplacer) et enrichir ADDITIVEMENT ; gate v24:check (artefacts valides + anti-
   fuite + dérive + profondeur) ; ajouter v24:check à `gates:active` (et laisser le
   cycle de vie des gates de sprint suivre l'inventaire).
7. 14 à 16 exercices déterministes (détecter un secret, comparer des versions
   vulnérables, réduire un privilège, choisir mitigation vs correctif, prioriser des
   CVE par sévérité, valider une rotation…) — contrat existant strict.
8. 5 ou 6 missions (fuite de secret en CI, dépendance vulnérable en prod, accès
   sur-privilégié, image compromise, exposition publique, réponse à incident avec
   post-mortem + plan de containment) — moteur V18, évaluation honnête.
9. Glossaire : termes sécurité (vulnérabilité, exploit, menace, risque, CVE, CWE,
   SBOM, supply chain, threat model, least privilege, RBAC, rotation, containment,
   audit log, breach, zero-day, defense in depth…) avec alias FR/EN, sans doublon ;
   audit pédagogique réel (docs/PEDAGOGICAL-AUDIT-V24.md, comparaison V19→V24).
10. Intégration (parcours, Vue Jour, Lab, missions, recherche, palette, glossaire,
    sauvegarde, isolation), E2E réel, assainissement des gates (mettre à jour
    l'inventaire), validation navigateur reproductible (réutiliser Chromium
    pré-installé aux 5 largeurs, distinguer PASS réel / HTTP / non vérifié),
    restauration progress.json, nettoyage, docs/SPRINT-V24.md (mêmes sections que
    V23, EN FRANÇAIS) + prompt complet V25. NE DÉMARRE PAS V25.

RAPPELS DE COHÉRENCE : les gates v17/v19/v21/v22:check sont des instantanés
HISTORIQUES GELÉS (échec de dérive attendu, cf. gates-inventory.md) ; ne pas les
rendre vertes artificiellement ; v18/v20-pedagogy/v23:check restent actives ;
continue le système d'audit pédagogique ; garde les vues publiques strictement
anti-fuite ; jamais de secret réel, de cluster réel, ni d'isolation OS prétendue.
La synthèse finale affichée doit être EN FRANÇAIS.
```

## Synthèse

Le Sprint V23 livre un **Kubernetes & Orchestration Lab** local et déterministe :
modèle de manifest pur, analyseur (~29 règles), simulateur d'incidents et de
rollouts, adaptateur `kubectl` honnête, UI accessible, 3 scénarios, 16 exercices,
6 missions, 43 termes de glossaire, une méthode d'intervention réutilisable
« Que faire dans ce cas ? », et un enrichissement additif des jours 320-321. Les
gates ont été assainies (inventaire central ; `v22:check` reclassée en instantané
historique). Tous les tests (820), le typecheck, le build et les gates actives sont
verts ; le rendu a été vérifié dans un **vrai navigateur** aux 5 largeurs ;
`progress.json` est resté pristine ; aucun résidu. Ce qui est **simulé** (états,
incidents, rollouts) et ce qui est **réel** (analyse pure, code, exercices, rendu)
sont clairement distingués — aucune promesse de cluster réel ni d'isolation OS.
