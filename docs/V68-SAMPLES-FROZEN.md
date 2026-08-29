# V68 — Échantillons gelés

> Publié **avant** toute lecture de leçon et **avant** toute modification.
> Tirage reproductible : `node scripts/v68-sample.mjs` et
> `node scripts/v68-sample.mjs --aveugle`.

## État du dépôt au moment du gel

| Mesure | Valeur |
|---|---|
| HEAD | `e5ee4564efd432af00a265d31d563403a78b0e80` |
| Branche | `claude/ai-career-os-saas-phfg49`, propre, alignée sur `origin` |
| Leçons | 128 |
| Journées | 365 |
| Solutions | 365 |
| SHA-1 du corpus de leçons | `7c9db74f739f1fd68cee2af588a905cb110b4b48` |
| SHA-256 de `data/progress.json` | `73c1ee39a255c87972f4f42b36873b1081081d6f278bd767089c0cef1fc6e7a6` |

Méthode de hachage, identique à V67 :
`find curriculum/lessons -name '*.md' | sort | xargs cat | sha1sum`

## Pourquoi deux échantillons

Un audit qui lit les mêmes leçons qu'il réécrit ne mesure pas la qualité du
corpus : il mesure l'attention qu'on a portée à trente-deux fichiers. V67 a
montré exactement cela — 33 leçons traitées, et un échantillon aveugle
sensiblement plus faible que l'échantillon primaire.

- **AUDIT** — seed `20261101`, 32 leçons. Lu au CP0. **Il guide les règles.**
- **AVEUGLE** — seed `20261102`, 20 leçons. **Non ouvert avant le CP13.**

### Ce que « aveugle » veut dire ici, précisément

La liste des vingt slugs est connue — elle est publiée ci-dessous, c'est la
condition pour qu'elle soit vérifiable après coup. La contrainte porte sur autre
chose : **aucune de ces vingt leçons n'est lue pendant les CP0 → CP9**, c'est-à-dire
pendant la phase où le standard pédagogique est dérivé. Les règles de réécriture
ne peuvent donc pas être taillées sur leurs défauts particuliers.

Au CP10, la matrice des 128 leçons couvre nécessairement ces vingt-là, et
certaines seront réécrites comme les autres — c'est voulu. Le CP13 mesure alors
si des règles dérivées **sans elles** produisent chez elles le même résultat
qu'ailleurs. C'est cette mesure-là, et pas la virginité des fichiers, qui teste
la généralisation.

Si l'aveugle reste sensiblement inférieur, `ACADEMIC_QUALITY_READY` est interdit.

## Méthode de tirage

`mulberry32`, aucun `Math.random`. **Stratification avant tirage**, pour qu'aucune
strate ne puisse manquer par malchance :

1. une leçon de chacune des **17 catégories** du catalogue ;
2. complétion pour garantir **≥ 4 leçons de chaque famille éditoriale** (A/B/C) ;
3. complétion pour garantir **≥ 3 leçons de chaque période** — début (jour ≤ 120),
   milieu (≤ 245), fin, et **hors-parcours** ;
4. complétion **uniforme** jusqu'à 32.

Les trois premières étapes donnent 22 leçons : assez pour que chaque strate
existe, pas assez pour l'« échantillon représentatif important » que le brief
exige. La quatrième est volontairement non stratifiée — les strates garantissent
la couverture, le tirage uniforme garantit qu'aucune main ne choisit la suite.

**32 / 128 = un quart du corpus lu intégralement au CP0.**

Les seeds de V67 (`20260901`, `20260902`) sont brûlées : ses deux échantillons ont
été rejoués et ouverts à son CP14.

## Échantillon d'AUDIT — seed 20261101 — 32 leçons

| Famille | Période | Catégorie | Leçon |
|---|---|---|---|
| A | fin | IA appliquée | `agent-workflows-orchestration` |
| C | fin | IA appliquée | `agents-fundamentals` |
| C | fin | IA appliquée | `ai-evaluation` |
| B | début | Web & backend | `api-production-contracts` |
| C | hors-parcours | Frontend : Web Platform | `css-flexbox` |
| C | milieu | Data & SQL | `database-transactions-concurrency` |
| A | début | Production & DevOps | `deployment-secrets` |
| A | hors-parcours | CI/CD & livraison | `deployment-strategies` |
| A | fin | Conteneurs & Docker | `docker-networking-volumes` |
| A | début | Software engineering & architecture | `error-handling` |
| A | début | Web & backend | `express-backend` |
| C | début | Frontend & React | `frontend-performance` |
| C | début | Fondations | `git-fundamentals` |
| A | hors-parcours | Cloud, AWS, Azure & IaC | `iac-fundamentals` |
| A | hors-parcours | Kubernetes | `k8s-security` |
| A | début | Systèmes & Linux | `linux-resources-io` |
| B | début | Observabilité, SRE & fiabilité | `metrics-percentiles` |
| A | milieu | Python & ML | `model-evaluation` |
| A | début | Production & DevOps | `monitoring-production` |
| A | début | Réseau | `networking-addressing-routing` |
| A | début | Réseau | `networking-http-tls` |
| B | fin | Observabilité, SRE & fiabilité | `postmortem-rca` |
| C | début | Python & ML | `python-foundations` |
| C | début | Frontend & React | `react-composition-architecture` |
| B | fin | Observabilité, SRE & fiabilité | `resilience-patterns` |
| C | hors-parcours | Frontend : Web Platform | `responsive-design` |
| A | milieu | Python & ML | `scikit-learn-workflow` |
| B | début | Observabilité, SRE & fiabilité | `slo-error-budget` |
| C | milieu | Python & ML | `statistics-for-ml` |
| A | début | Portfolio & carrière | `technical-storytelling` |
| C | début | Frontend : Web Platform | `typescript-frontend` |
| A | milieu | IA appliquée | `vector-databases` |

Familles : **A 16 · B 5 · C 11** — Périodes : **début 16 · milieu 5 · fin 6 ·
hors-parcours 5** — Catégories couvertes : **17 / 17**.

### Un groupe témoin est tombé dans l'échantillon — à noter maintenant, pas après la mesure

V67 a modifié **38** fichiers de `curriculum/lessons` (mesuré :
`git diff --name-only dcc958b..HEAD -- curriculum/lessons`). Le tirage en met
**13 dans l'échantillon d'audit** et **19 leçons jamais touchées par V67** à côté :

- **Traitées par V67 (13)** — `agents-fundamentals`, `ai-evaluation`,
  `deployment-secrets`, `error-handling`, `express-backend`, `git-fundamentals`,
  `model-evaluation`, `monitoring-production`, `python-foundations`,
  `scikit-learn-workflow`, `statistics-for-ml`, `technical-storytelling`,
  `typescript-frontend`.
- **Jamais touchées (19)** — `agent-workflows-orchestration`,
  `api-production-contracts`, `css-flexbox`, `database-transactions-concurrency`,
  `deployment-strategies`, `docker-networking-volumes`, `frontend-performance`,
  `iac-fundamentals`, `k8s-security`, `linux-resources-io`, `metrics-percentiles`,
  `networking-addressing-routing`, `networking-http-tls`, `postmortem-rca`,
  `react-composition-architecture`, `resilience-patterns`, `responsive-design`,
  `slo-error-budget`, `vector-databases`.

13/32 ≈ 38/128 : la proportion attendue d'un tirage honnête, donc rien à corriger.
Mais c'est une **occasion de mesure que V67 n'avait pas**. Noter les deux groupes
séparément répond à une question que le rapport V67 ne pouvait pas poser sur
lui-même : *le travail de V67 tient-il le barème de V68, ou V67 s'est-il noté trop
généreusement ?* Le CP0 publiera les deux moyennes.

L'échantillon aveugle contient lui aussi 6 leçons traitées par V67
(`api-design-basics`, `data-cleaning-quality`, `design-patterns-intro`,
`feature-engineering`, `http-rest-json`, `system-design-interview`), soit une
proportion comparable — les deux échantillons restent donc comparables entre eux.

Intersection audit ∩ aveugle : **0**, vérifiée par construction et par mesure.

## Échantillon AVEUGLE — seed 20261102 — 20 leçons

**Ne pas ouvrir avant le CP13.**

```
api-design-basics             authentication
breaking-changes-compatibility caching-performance
ci-cd                          cloud-compute-storage
cloud-networking               css-grid
data-cleaning-quality          database-migrations
design-patterns-intro          feature-engineering
frontend-testing               html-semantic-structure
http-rest-json                 k8s-config-probes
k8s-troubleshooting            linux-filesystem-permissions
neural-networks                system-design-interview
```

Tiré parmi les 96 leçons **absentes** de l'échantillon d'audit : les deux mesures
sont donc réellement disjointes.

Deux leçons de cet échantillon (`cloud-compute-storage`, `cloud-networking`)
relèvent de la compétence `cloud`, celle dont V67 dit qu'elle n'a **aucune journée
sur 365**. Le CP12 devra les traiter sans les lire au titre du CP0 : c'est une
contrainte réelle du dispositif, elle est notée ici pour ne pas être découverte
comme une surprise commode au CP12.
