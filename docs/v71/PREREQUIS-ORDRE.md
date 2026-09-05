# V71 — Prérequis enseignés après la leçon qui les cite

Trouvé au CP3, en croisant la **lecture** des sections « Prérequis » avec la position réelle
des leçons dans les 365 journées. Aucune sonde seule ne pouvait produire ce constat : la
sonde compare deux numéros de jour, mais c'est **la formulation** qui distingue une exigence
d'une aide, et cela se lit.

Détection reproductible : `node scripts/v71/prerequis-ordre.mjs`. Classement : par lecture
des 31 phrases citantes, imprimées par le script pour cet usage.

> **Note de reconstruction.** Une première version de ce document a été perdue avec le
> conteneur de la session précédente (jamais commitée). Elle n'a pas été recopiée : la
> détection a été réécrite en script, rejouée sur le corpus intact, et les 31 formulations
> ont été relues. Les comptes A/B/C sont identiques à la première lecture. **Un point
> diffère et il est corrigé plus bas (§5)** : la première version annonçait quatre
> prérequis hors parcours correctement signalés sur six, en réservant deux cas « à
> vérifier ». Les deux ont été lus : ils sont signalés eux aussi. C'est **6 sur 6**.

---

## 1. Le constat

**31 citations** de prérequis pointent vers une leçon enseignée **plus tard** dans le
parcours. Après lecture de chacune :

| classe | cas | ce que dit le texte |
|---|---|---|
| **A — correctement signalé** | **9** | « aide », « éclaire », « viendra plus loin », « programmée au mois 5 », « utile mais rappelée ici » |
| **B — exigence, écart ≥ 7 jours** | **17** | « Tu dois maîtriser… », « car… », « s'appuie sur », sans aucun signalement |
| **C — exigence, écart de 2 jours** | **5** | même formulation, mais le prérequis arrive dans la même semaine |

**Seule la classe B est un défaut sérieux.** La classe A est le comportement correct et sert
de modèle opposable. La classe C est mineure.

Le nombre brut de 31 n'est donc **pas** le nombre de défauts. C'est exactement le piège que
le contrat gelé §1 anticipe : une sonde détecte, elle ne note pas.

---

## 2. Classe A — le comportement correct, déjà présent dans le corpus

Ces neuf cas montrent que le corpus **sait déjà** traiter le problème.

| leçon (jour) | prérequis (jour) | formulation |
|---|---|---|
| `monitoring-production` (79) | `llm-observability` (325) | « est **utile mais rappelée ici** » |
| `authentication` (67) | `ai-security` (260) | « Une notion de sécurité applicative **aide** (**viendra plus loin**) » |
| `breaking-changes-compatibility` (76) | `database-migrations` (139) | « **programmée au mois 5**… une application voisine de la même idée » |
| `async-javascript` (4) | `http-rest-json` (50) | « Une **intuition** de ce qu'est un appel réseau **aide** » |
| `data-cleaning-quality` (128) | `feature-engineering` (169) | « **éclairent** pourquoi certaines corrections doivent attendre » |
| `api-design-basics` (51) | `breaking-changes-compatibility` (76) | « **éclaire** la partie évolution » |
| `api-production-contracts` (51) | `authentication` (67) | « **aident** pour le rate limiting par client » |
| `architecture-basics` (44) | `http-rest-json` (50) | « Une notion de client/serveur et d'API **aide** » |
| `technical-storytelling` (66) | `technical-documentation` (74) | « **aident** » |

Le meilleur modèle du corpus n'est pas dans cette liste, parce qu'il ne produit aucune
détection : c'est `slo-error-budget`, qui **intègre** la notion dont elle a besoin au lieu de
la supposer.

> « La seule notion de disponibilité nécessaire ici tient en une phrase : **la disponibilité
> est la part du temps pendant laquelle le service rend le service attendu**, et on
> l'exprime en « neuf » — 99 % (deux neuf) autorise environ 7 heures d'indisponibilité par
> mois, 99,9 % (trois neuf) 43 minutes, 99,99 % (quatre neuf) 4 minutes. […] C'est tout ce
> que la leçon utilise. »

Quatre phrases, et la dépendance disparaît. C'est la solution à privilégier quand la notion
est courte.

---

## 3. Classe B — les dix-sept défauts

Formulés comme une exigence, sans aucun signalement, avec un écart d'au moins une semaine.
Un apprenant qui suit le parcours dans l'ordre lit qu'il **doit** connaître quelque chose que
le programme ne lui a pas encore donné.

| # | leçon | jour | prérequis exigé | jour | écart |
|---|---|---|---|---|---|
| 1 | `agent-workflows-orchestration` | 274 | `resilience-patterns` | 331 | **+57 j** |
| 2 | `prompt-engineering` | 197 | `ai-evaluation` | 253 | **+56 j** |
| 3 | `caching-performance` | 80 | `sql-performance-indexing` | 135 | **+55 j** |
| 4 | `async-messaging-queues` | 290 | `resilience-patterns` | 331 | **+41 j** |
| 5 | `transformers` | 183 | `embeddings` | 218 | **+35 j** |
| 6 | `rag-evaluation` | 218 | `ai-evaluation` | 253 | **+35 j** |
| 7 | `readme-documentation` | 47 | `technical-documentation` | 74 | **+27 j** |
| 8 | `interview-preparation` | 48 | `system-design-interview` | 71 | **+23 j** |
| 9 | `llm-cost-optimization` | 197 | `rag-fundamentals` | 218 | **+21 j** |
| 10 | `interview-preparation` | 48 | `technical-storytelling` | 66 | **+18 j** |
| 11 | `technical-storytelling` | 66 | `portfolio-github` | 83 | **+17 j** |
| 12 | `scikit-learn-workflow` | 155 | `feature-engineering` | 169 | **+14 j** |
| 13 | `ai-security` | 260 | `agents-fundamentals` | 274 | **+14 j** |
| 14 | `prompt-injection-defense` | 260 | `agents-fundamentals` | 274 | **+14 j** |
| 15 | `ci-cd-pipeline-anatomy` | 307 | `docker-images-layers` | 320 | **+13 j** |
| 16 | `react-application-states` | 95 | `react-composition-architecture` | 104 | **+9 j** |
| 17 | `web-forms-validation` | 96 | `html-semantic-structure` | 103 | **+7 j** |

**Quinze leçons distinctes** sont concernées ; `interview-preparation` compte deux fois.

### Les cas les plus graves, et pourquoi

- **`transformers` → `embeddings`** (+35 j). « car un transformer EST un réseau particulier,
  **et la notion d'embedding : un mot devenu vecteur de sens** ». Un transformer manipule des
  embeddings de bout en bout : la notion n'est pas périphérique, elle est centrale, et elle
  arrive cinq semaines plus tard.
- **`rag-evaluation` → `ai-evaluation`** (+35 j). « **Tu dois maîtriser** les principes
  d'évaluation d'un système IA — golden set, évaluation par étage, LLM-as-judge calibré,
  baseline ». C'est tout le vocabulaire de la leçon, exigé avant d'être enseigné.
- **`caching-performance` → `sql-performance-indexing`** (+55 j). « **Tu dois comprendre**
  comment une requête traverse une application et interroge une base de données […] **car**
  les lenteurs classiques (N+1, requêtes lentes) y naissent » — et l'exemple guidé mesure
  précisément un N+1.
- **`interview-preparation`** cite **deux** prérequis postérieurs dans la même phrase, dont
  `system-design-interview` avec la justification « **car c'est l'un des quatre types** »
  d'entretien traités. Le type est donc annoncé comme couvert ailleurs, et cet ailleurs vient
  23 jours plus tard.
- **`agent-workflows-orchestration` → `resilience-patterns`** (+57 j), le plus grand écart de
  la classe. La formulation est indirecte — « Les patterns […] **viennent de** la résilience »
  — mais elle présente la notion comme acquise, sans dire qu'elle ne l'est pas encore.

---

## 4. Classe C — les cinq cas mineurs

Écart de 2 jours ; la plupart des leçons citées s'étalent sur plusieurs journées, donc le
recouvrement est quasi immédiat.

`design-patterns-intro` (38) → `clean-code` (40) · `express-backend` (52) →
`error-handling` (54) · `technical-documentation` (74) →
`breaking-changes-compatibility` (76) · `frontend-performance` (102) →
`react-composition-architecture` (104) · `scikit-learn-workflow` (155) →
`model-evaluation` (157).

---

## 5. Prérequis pointant vers l'étagère de référence

Le script signale 40 citations vers une leçon hors parcours. **Trente-quatre d'entre elles
partent d'une leçon elle-même hors parcours** (les leçons cloud, CSS, IaC…) : l'étagère de
référence n'est pas séquencée par les 365 journées, aucun ordre n'y est donc violé. Ces 34
cas ne sont pas des candidats.

Restent **six** cas où une leçon **programmée** cite un prérequis hors parcours, que le
programme n'enverra donc jamais lire :

| leçon (jour) | cible | signal |
|---|---|---|
| `breaking-changes-compatibility` (76) | `deployment-strategies` | « **Étagère de référence.** » |
| `slo-error-budget` (79) | `cloud-fundamentals` | « **Où trouver le détail.** » |
| `frontend-performance` (102) | `responsive-design` | « **Étagère de référence.** » |
| `database-migrations` (139) | `deployment-strategies` | « **Où trouver le détail.** » |
| `incident-response` (332) | `release-incident-recovery` | « **Où trouver le détail.** » |
| `postmortem-rca` (332) | `release-incident-recovery` | « **Étagère de référence.** » |

**Les six sont correctement traités** : chacun est introduit par un encadré explicite, hors
de la liste des exigences. Aucun ne demande à l'apprenant de lire une leçon que le parcours
ne lui donnera pas. **Zéro défaut ici.**

C'est la correction annoncée en tête de document : la première version en comptait quatre sur
six et laissait `incident-response` et `postmortem-rca` « à vérifier au lot correspondant ».
La vérification est faite, et elle est favorable au corpus. Les deux chiffres sont publiés :
**4/6 annoncé sans lecture, 6/6 après lecture.**

---

## 6. Ce que la correction ne fera pas

**Le mapping des 365 journées ne sera pas modifié.** C'est un invariant du sprint (§30 du
brief) ; réordonner le parcours serait une décision de curriculum, pas une correction de
contenu académique.

La correction porte donc **sur le texte des leçons**, avec trois remèdes par ordre de
préférence :

1. **Intégrer la notion nécessaire** en une ou deux phrases, comme `slo-error-budget` le fait
   pour la disponibilité, puis renvoyer vers la leçon pour le détail. À privilégier quand la
   notion tient en peu de mots — cas 5, 9, 12, 13, 14, 15, 17.
2. **Requalifier le prérequis en aide signalée**, comme `authentication` (« viendra plus
   loin »), quand la leçon reste suivable sans lui — cas 1, 2, 3, 4, 6, 11, 16.
3. **Retirer la dépendance** quand la lecture montre qu'elle n'est pas réellement utilisée.

Aucun de ces remèdes n'allonge la leçon de façon significative : le remède 2 change une
tournure, le remède 1 ajoute deux à quatre phrases, le remède 3 en retire.

Ces dix-sept corrections sont classées **P1** et seront appliquées aux CP4→CP9, par domaine.
Le rattachement ou le réordonnancement éventuel des journées sera **recommandé** au CP15,
jamais appliqué.
