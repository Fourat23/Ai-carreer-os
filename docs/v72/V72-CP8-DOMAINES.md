# V72 — CP8. Cloud, Kubernetes, Next.js, CSS, Linux : promis, enseigné, référencé, pratiqué

**Question directrice** : un apprenant qui suit **uniquement** les 365 jours rencontre-t-il ces
compétences avant qu'elles ne servent professionnellement ?

**Réponse mesurée** : non — et pour Kubernetes, c'était **pire que « absent »**. Le parcours
faisait **pratiquer** Kubernetes sans jamais l'enseigner. C'est corrigé.

---

## 1. Ce que chaque domaine est réellement, dans le parcours

| domaine | leçons | sur parcours (avant CP8) | journées qui en **parlent** | livrable qui le **pratique** |
|---|---:|---:|---:|---|
| **Docker** | 6 | **6** | 65 | **j320** |
| Cloud | 6 | 0 | 12 | aucun |
| Kubernetes | 6 | 0 | 8 | aucun |
| Linux / livraison | 5 | 0 | 16 | aucun |
| CSS | 4 | 0 | 3 | aucun |
| Next.js | 4 | 0 | **1** | aucun |

**Docker est le seul de ces domaines réellement intégré** : ses six leçons sont liées, 65
journées le mentionnent, et le jour 320 produit un livrable (« DocSense dockerisé, `compose
up` »).

Pour les cinq autres, les journées qui « en parlent » ne l'**enseignent** pas — elles le
**référencent** au passage. Échantillon relevé mot pour mot :

- j78 — « Ce 3-tiers **déployé dans le cloud**… »
- j80 — « **Mettre à l'échelle dans le cloud** (fondation V22). »
- j325 — « **FinOps** : piloter le coût comme une décision d'ingénierie (fondation V25). »
- j365 — l'exemple d'auto-évaluation du dernier jour du programme dit : « je suis à 4/5 sur le
  RAG avec DocSense en preuve, **2/5 sur le déploiement cloud** ». **Le programme sait qu'il
  laisse l'apprenant faible sur ce point, et le met dans son propre exemple.**

---

## 2. Le trou qui n'était pas visible : on fait pratiquer ce qu'on n'enseigne pas

`data/day-exercises.json` affecte **59 exercices cloud / Kubernetes / Docker à neuf journées**.
Ces exercices existent, sont déterministes, et sont réellement au programme de ces journées.

| jour | exercices affectés | leçons que la journée liait |
|---|---|---|
| **j78** | **11 cloud** — `cloud-iam-wildcard`, `cloud-iam-excess-actions`, `cloud-iam-credential-choice`, `cloud-public-exposure`, `cloud-service-model`, `cloud-classify-tier`… | `architecture-basics`, `networking-proxy-loadbalancing` |
| j79 | 5 cloud — SPOF, multi-zone, readiness-routing, error-budget | 7 leçons d'observabilité |
| j80 | 5 cloud — scaling vertical/horizontal, nombre de réplicas, autoscale avec état | `caching-performance` |
| j81 | 8 cloud — stratégie de déploiement, décision de rollback, RPO, rayon d'impact | `architecture-basics`, `system-design-interview`, `technical-debt` |
| **j321** | **10 Kubernetes** — `k8s-oom-risk`, `k8s-probe-role`, `k8s-rolling-available`, `k8s-pod-phase`, `k8s-recovery-decision`, `k8s-ingress-backends`… | `ai-evaluation`, `rag-evaluation`, `model-evaluation` |
| j325 | 2 cloud — coût mensuel, économies de redimensionnement | 4 leçons agents / observabilité LLM |

**Le cas j321 est le plus net** : dix questions sur les sondes, les phases d'un Pod et le
redéploiement progressif, posées à quelqu'un à qui **aucune des 365 journées n'a jamais dit ce
qu'est un Pod**. Le cas j78 est de même nature : six exercices sur IAM, et rien qui enseigne
IAM.

---

## 3. Ce qui a été corrigé — et ce qui ne pouvait pas l'être

Cinq insertions étaient candidates. **La condition M5 du contrat** — « les notions requises
sont enseignées **avant**, ou l'anticipation est annoncée » — les a départagées, en suivant la
chaîne de prérequis déclarée par les leçons elles-mêmes.

| insertion candidate | prérequis de la leçon | premier jour où il est enseigné | verdict |
|---|---|---|---|
| j78 ← `cloud-fundamentals` | `docker-containers`, `networking-addressing-routing` | **j320**, j71 | **REFUSÉE** — prérequis 242 jours plus tard |
| j80 ← `cloud-compute-storage` | `cloud-fundamentals`, `docker-containers` | hors parcours, j320 | **REFUSÉE** |
| j81 ← `deployment-strategies` | `ci-cd-quality-gates-artifacts`, `networking-proxy-loadbalancing` | **j326**, j78 | **REFUSÉE** — prérequis 245 jours plus tard |
| j325 ← `cloud-finops` | `cloud-compute-storage`, `cloud-fundamentals`, `k8s-config-probes` | tous hors parcours | **REFUSÉE** |
| **j321 ← `k8s-why-architecture`, `k8s-workloads`, `k8s-config-probes`** | `docker-compose` + `docker-production-hardening` (**j320, la veille**) ; puis la chaîne interne ; `linux-resources-io` (**j72**) | tous **avant** | **ACCEPTÉE** |

**Une seule insertion sur cinq est légale, et c'est la plus nécessaire.**

### Ce que les quatre refus révèlent, et qui est un résultat en soi

Le bloc cloud dépend de `cloud-fundamentals`, qui dépend de `docker-containers`, **enseigné au
jour 320**. Autrement dit : **le cloud n'est insérable nulle part avant le jour 320**, soit
dans les 45 derniers jours du programme. Ce n'est pas un oubli de mapping qu'on pourrait
réparer en déplaçant un lien — c'est une **conséquence de l'ordre dans lequel le programme
enseigne Docker**. Toute décision de curriculum sur le cloud (§CP7) devra partir de là.

---

## 4. L'insertion faite

`scripts/data/days-lessons-v67.mjs`, journée **321** :
`k8s-why-architecture` → `k8s-workloads` → `k8s-config-probes`, dans l'ordre de la chaîne de
prérequis.

| contrôle (M1 → M8) | résultat |
|---|---|
| M1 ordre des 365 jours | **inchangé** |
| M2 128 / 365 / 365 | **inchangé** |
| M3 livrable, correction, checklist, critères de j321 | **inchangés** |
| M4 aucune leçon retirée | rien retiré |
| M5 prérequis | **satisfaits avant** (j320 la veille, j72) |
| M6 charge de j321 après insertion | **BALANCED** (83 → 139 min de lecture, budget 270) |
| M7 motivé par un défaut mesuré | 10 exercices Kubernetes sans enseignement |
| M8 `progress.json` | non touché |

**Effet de bord contrôlé** : la revue de la semaine 46 (**j322**) hérite de la liste explicite
et passe de 9 leçons Docker/évaluation à **7** — Kubernetes puis Docker. Elle reste au plafond
et devient thématiquement juste pour une semaine consacrée à la conteneurisation.

**Leçons sur parcours : 103 → 106.** Hors parcours : 25 → **22**.

---

## 5. Ce qui reste ouvert

| constat | pourquoi non corrigé |
|---|---|
| **CSS** — 4 leçons, 0 journée, aucun livrable | aucun livrable ne suppose CSS (mesuré au CP7) ; l'insérer demanderait de décider **où**, dans un mois frontend déjà complet |
| **Next.js** — 4 leçons, **1** journée qui le mentionne, 0 livrable | idem ; la leçon affirme elle-même que « la quasi-totalité des offres React attendent un framework » |
| **Cloud** — 6 leçons, 0 journée | insérable seulement après j320 (§3) ; et la compétence `cloud` déclarée sans journée est **réservée à l'utilisateur** (CP7 §3) |
| **j78, j80, j81, j325** pratiquent du cloud sans leçon | insertion refusée par M5 ; le lien ne peut se faire qu'après réponse sur le cloud |

| contrôle | résultat |
|---|---|
| corpus des leçons | **`d535fcf6…` — aucune leçon modifiée** |
| `npm test` | **1420 / 1420** |
| `npm run gates:active` | **vert** |
| journées IMPOSSIBLE | **7**, inchangé |
