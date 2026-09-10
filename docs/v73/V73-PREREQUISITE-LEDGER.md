# V73 — Registre des prérequis

> **La convention A/B est supprimée définitivement.** Elle mélangeait deux questions —
> « la notion est-elle exigée ? » et « le renvoi est-il annoncé ? » — et c'est ce mélange qui
> avait produit des comptages contradictoires en V71. La taxonomie ci-dessous est **sémantique**
> et gelée au CP1 de V73.

---

## 1. Résultat

| classe | définition | n |
|---|---|---|
| `VALID_PRIOR_KNOWLEDGE` | le prérequis est enseigné **avant** la leçon qui l'exige | **214** |
| `VALID_RECAP` | le prérequis est enseigné **le même jour** : rappel, pas dépendance non satisfaite | **48** |
| `EXPLICIT_LOOKAHEAD` | renvoi vers plus loin, **annoncé**, la notion nécessaire étant donnée sur place | **44** |
| `INVALID_FORWARD_PREREQUISITE` | notion **exigée**, enseignée plus tard, **non signalée** | **0** |
| `AMBIGUOUS` | ni exigence ni annonce claire | **0** |
| | **total des citations en section « Prérequis »** | **306** |

**Aucun défaut d'ordre. Aucune ambiguïté.** C'est le résultat du travail de V71 (CP11) et de
V72 (CP12), confirmé ici par une mesure indépendante — et **maintenu** après les seize
rattachements du CP3 et les deux ancres du CP4.

---

## 2. Comment une citation est classée — sur la propriété, jamais sur l'étiquette

Le CP2 a montré que compter les étiquettes donne un résultat faux : chercher le marqueur
d'annonce dans **tout le paragraphe** et accepter « Aucune X n'est supposée » classait
**83 exigences réelles** comme renvois annoncés — dont `css-flexbox → css-fundamentals`, qui
est un prérequis dur. La phrase parlait du **sujet propre de la leçon**, pas de la leçon citée.

La règle appliquée ici est donc :

1. **portée** — l'encadré `>` contenant la citation s'il existe (ces encadrés sont dédiés à une
   citation), sinon la **phrase** qui la contient ;
2. **normalisation** — retrait du préfixe `>` des encadrés **et de l'emphase Markdown**, parce
   que `programmées **plus loin** dans le parcours` ne contient pas la chaîne
   « plus loin dans le parcours » ;
3. **motif** — uniquement des marqueurs de **postériorité** ou d'**étagère**, jamais
   « n'est supposé ».

Répartition des portées : **37 encadrés** et
**269 phrases**.

---

## 3. Les 44 renvois annoncés, un par un

| leçon | jour | renvoie vers | jour | portée |
|---|---|---|---|---|
| `async-javascript` | j4 | `http-rest-json` | j50 | encadré |
| `design-patterns-intro` | j38 | `clean-code` | j40 | phrase |
| `architecture-basics` | j44 | `http-rest-json` | j50 | encadré |
| `readme-documentation` | j47 | `technical-documentation` | j74 | encadré |
| `interview-preparation` | j48 | `technical-storytelling` | j66 | encadré |
| `interview-preparation` | j48 | `system-design-interview` | j71 | encadré |
| `api-design-basics` | j51 | `breaking-changes-compatibility` | j76 | encadré |
| `api-production-contracts` | j51 | `authentication` | j67 | encadré |
| `express-backend` | j52 | `error-handling` | j54 | encadré |
| `technical-storytelling` | j66 | `technical-documentation` | j74 | phrase |
| `technical-storytelling` | j66 | `portfolio-github` | j83 | encadré |
| `authentication` | j67 | `ai-security` | j260 | encadré |
| `technical-documentation` | j74 | `breaking-changes-compatibility` | j76 | encadré |
| `breaking-changes-compatibility` | j76 | `typescript-basics` | j4 | phrase |
| `breaking-changes-compatibility` | j76 | `http-rest-json` | j50 | phrase |
| `breaking-changes-compatibility` | j76 | `api-design-basics` | j51 | phrase |
| `breaking-changes-compatibility` | j76 | `database-migrations` | j139 | encadré |
| `breaking-changes-compatibility` | j76 | `deployment-strategies` | hors | encadré |
| `monitoring-production` | j79 | `llm-observability` | j325 | encadré |
| `slo-error-budget` | j79 | `cloud-fundamentals` | j291 | encadré |
| `caching-performance` | j80 | `sql-performance-indexing` | j135 | encadré |
| `react-application-states` | j95 | `react-composition-architecture` | j104 | encadré |
| `web-forms-validation` | j96 | `html-semantic-structure` | j87 | encadré |
| `frontend-performance` | j102 | `react-composition-architecture` | j104 | encadré |
| `frontend-performance` | j102 | `responsive-design` | j117 | encadré |
| `data-cleaning-quality` | j128 | `feature-engineering` | j169 | encadré |
| `database-migrations` | j139 | `deployment-strategies` | hors | encadré |
| `statistics-for-ml` | j148 | `python-foundations` | j82 | phrase |
| `scikit-learn-workflow` | j155 | `feature-engineering` | j169 | encadré |
| `scikit-learn-workflow` | j155 | `model-evaluation` | j157 | encadré |
| `transformers` | j183 | `embeddings` | j218 | encadré |
| `llm-cost-optimization` | j197 | `rag-fundamentals` | j218 | encadré |
| `prompt-engineering` | j197 | `ai-evaluation` | j253 | encadré |
| `rag-evaluation` | j218 | `ai-evaluation` | j253 | encadré |
| `retrieval-reranking` | j218 | `rag-evaluation` | j218 | phrase |
| `ai-security` | j260 | `agents-fundamentals` | j274 | encadré |
| `prompt-injection-defense` | j260 | `agents-fundamentals` | j274 | encadré |
| `agent-workflows-orchestration` | j274 | `resilience-patterns` | j331 | encadré |
| `async-messaging-queues` | j290 | `resilience-patterns` | j331 | encadré |
| `cloud-fundamentals` | j291 | `docker-containers` | j291 | encadré |
| `ci-cd-pipeline-anatomy` | j307 | `docker-images-layers` | j320 | encadré |
| `incident-response` | j332 | `release-incident-recovery` | hors | encadré |
| `postmortem-rca` | j332 | `incident-response` | j332 | encadré |
| `postmortem-rca` | j332 | `release-incident-recovery` | hors | encadré |

---

## 4. Ce que les CP3 et CP4 ont créé, et qui a été vérifié

Les seize rattachements du CP3 ont introduit **quarante-sept nouvelles relations de
prérequis** — celles des quinze leçons entrées dans le parcours. **Les quarante-sept sont
valides**, et l'ordre a été construit pour cela, pas constaté après coup :

| chaîne | ordre obtenu |
|---|---|
| **CSS** | `html-semantic-structure` + `css-fundamentals` **j87** → `css-flexbox` + `css-grid` **j103** → `responsive-design` **j117** |
| **Next.js** | `nextjs-foundations` **j99** → `nextjs-rendering` **j102** → `nextjs-server-client-components` **j104** → `nextjs-data-production` **j111** |
| **Cloud** | `docker-containers` + `cloud-fundamentals` **j291** → `cloud-networking` + `cloud-compute-storage` **j293** → `cloud-aws-core` + `cloud-azure-core` **j303** → `cloud-finops` **j325** · `iac-fundamentals` **j326** |

Deux cas méritent d'être nommés parce qu'ils auraient pu passer inaperçus :

- **`cloud-compute-storage` → `docker-containers`** est un prérequis **réel** (la leçon
  mentionne le conteneur dix-huit fois), et il est satisfait parce que le CP3 a introduit
  Docker au **jour 291** — la leçon est au jour 293. Sans ce déplacement, la relation aurait
  été un défaut d'ordre ;
- **`cloud-fundamentals` → `docker-containers`** est désormais un `EXPLICIT_LOOKAHEAD` dans un
  encadré, parce que ce prérequis **n'était pas réel** : trois mentions en 2 896 mots, aucune
  commande. C'est la seule leçon dont la section « Prérequis » a été modifiée par V73.

---

## 5. Un raffinement de classement, déclaré

Trois citations relient une leçon **ADVANCED** à une autre leçon **ADVANCED** :
`k8s-security → k8s-networking-services`, `k8s-troubleshooting → k8s-networking-services`,
`release-incident-recovery → deployment-strategies`.

Un premier classement les marquait `INVALID_FORWARD_PREREQUISITE`, la cible n'étant enseignée
nulle part. **C'est faux** : le parcours ne fait jamais lire la leçon source non plus. Ces
citations décrivent **l'ordre interne de l'étagère**, pas l'ordre du parcours — et cet ordre
est juste : on lit le réseau Kubernetes avant sa sécurité et son diagnostic. Elles sont
classées `VALID_PRIOR_KNOWLEDGE` avec cette note.

**La règle générale qui en découle** : une citation dont la leçon **source** n'est pas
programmée ne peut pas constituer un défaut d'ordre du parcours.

---

## 6. Ce que ce registre ne prouve pas

Il porte sur les **sections « Prérequis »**. Une notion supposée au détour d'un paragraphe,
sans figurer dans les prérequis, lui échappe entièrement. C'est la limite du dispositif, elle
est structurelle, et le **CP13** — audit aveugle mené comme un apprenant qui suit le parcours
dans l'ordre — est le seul endroit où elle peut être attaquée.
