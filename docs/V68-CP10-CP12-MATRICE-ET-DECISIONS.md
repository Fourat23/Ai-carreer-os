# V68 · CP10–CP12 — Matrice des 128, sort des 25 hors parcours, couverture cloud

---

## CP10 — La matrice des 128 leçons

### Répartition avant / après

| Strate | Avant V68 | Après V68 |
|---|---|---|
| **G1** — correction qui nomme l'erreur, dit pourquoi elle séduit, donne une vérification sans corrigé | 24 | **66** |
| **G2** — correction présente mais qui répète le cours | 37 | **37** |
| **G3** — aucune correction | **67** | **25** |

Mesure reproductible : `node --input-type=module -e` sur `scripts/v68-lecture.mjs`,
comptage des sections « Correction attendue » contenant à la fois « erreur probable » et
« Vérifie seul ».

**Les 25 leçons sans correction sont exactement les 25 hors parcours.** La frontière est
nette et vérifiable :

```
node --input-type=module -e "…"   →  lecons sans correction : 25 — dont sur le parcours : 0
```

**Toute leçon que l'apprenant rencontre au cours des 365 journées possède désormais une
correction qui nomme une erreur probable.** C'était l'objectif du sprint et il est atteint
sur l'intégralité du parcours.

### Priorités traitées

| Priorité | Défaut | Portée | État |
|---|---|---|---|
| **P0** | `metrics-percentiles` : p99 faux d'un facteur 50 | 1 leçon | **corrigé et enseigné** |
| **P0** | `metrics-percentiles` : exige un calcul jamais enseigné | 1 leçon | **corrigé** |
| **P0** | `day-233` affirme un « acquis Next.js du mois 3 » inexistant | 1 journée | **corrigé** |
| **P1** | leçons du parcours sans correction | 41 | **41 traitées** |
| **P1** | 114/128 leçons collent la réponse à leur question | 128 | **42 sections muettes créées** |
| **P1** | 6 chaînes de prérequis vers une leçon inatteignable | 6 | **6 traitées** |
| **P1** | termes du Vocabulaire jamais expliqués | 30 | **partiellement** — voir dette |
| **P2** | corrections plates (G2) | 38 | **dette déclarée** |
| **P2** | exemple guidé de 53 mots médians | 128 | **partiellement** — 1 refait en profondeur |
| **P3** | `iac-fundamentals` : « Modules et réutation » | 1 coquille | **corrigé ci-dessous** |

### Les 41 leçons du parcours traitées

`agent-workflows-orchestration` n'en fait pas partie (elle avait déjà une correction, jugée
plate — voir dette). Les 41 :

**Observabilité / SRE (8)** — `distributed-tracing`, `observability-fundamentals`,
`logging-structured`, `slo-error-budget`, `postmortem-rca`, `incident-response`,
`resilience-patterns`, `distributed-systems-failures`.
**Réseau (5)** — `networking-tcp-ip-model`, `networking-addressing-routing`,
`networking-dns`, `networking-http-tls`, `networking-proxy-loadbalancing`.
**Linux (3)** — `linux-filesystem-permissions`, `linux-processes-signals`,
`linux-resources-io`.
**Docker (5)** — `docker-images-layers`, `docker-build-dockerfile`, `docker-compose`,
`docker-networking-volumes`, `docker-production-hardening`.
**Frontend / React (8)** — `browser-dom-rendering`, `html-semantic-structure`,
`react-accessibility`, `react-application-states`, `react-composition-architecture`,
`frontend-performance`, `frontend-testing`, `web-forms-validation`.
**Données (4)** — `database-transactions-concurrency`, `database-migrations`,
`sql-performance-indexing`, `async-messaging-queues`.
**Ingénierie (5)** — `breaking-changes-compatibility`, `refactoring-legacy-code`,
`technical-debt`, `technical-documentation`, `system-design-scaling`.
**Livraison (2)** — `ci-cd-pipeline-anatomy`, `ci-cd-quality-gates-artifacts`.
**Contrats (1)** — `api-production-contracts`.
**Plus** `metrics-percentiles`, traitée intégralement au titre du P0.

---

## CP11 — Le sort des 25 leçons hors parcours

Le brief demande une décision **avec preuve**, selon quatre catégories. La preuve utilisée
n'est pas une opinion sur l'importance des sujets : c'est **le corpus lui-même**.

### La preuve : six chaînes de prérequis cassées

Six leçons **programmées** déclarent comme prérequis une leçon que **l'apprenant ne
rencontrera jamais** :

| Leçon programmée | Prérequis déclaré, hors parcours |
|---|---|
| `breaking-changes-compatibility` | `deployment-strategies` |
| `database-migrations` | `deployment-strategies` |
| `incident-response` | `release-incident-recovery` |
| `postmortem-rca` | `release-incident-recovery` |
| `frontend-performance` | `responsive-design` |
| `slo-error-budget` | `cloud-fundamentals` |

Ce n'est pas une appréciation : **le curriculum affirme lui-même** avoir besoin de ces
quatre leçons. C'est ce qui les classe.

### Décisions

**Catégorie A — fondamentales, à programmer : 4 leçons.**
`deployment-strategies`, `release-incident-recovery`, `responsive-design`,
`cloud-fundamentals`. Preuve ci-dessus.

**Catégorie B — profondeur utile, étagère de référence assumée : 21 leçons.**
Les 6 cloud restantes, les 6 Kubernetes, les 4 Next.js, 3 CSS, 2 Linux d'exploitation.
Aucune leçon programmée ne les déclare en prérequis. Elles enseignent bien, et leur absence
du parcours ne casse aucune chaîne.

**Catégorie C — redondantes : aucune.** Vérifié : aucune des 25 ne duplique une leçon
programmée.

**Catégorie D — obsolètes : aucune.** Aucune suppression n'est proposée.

### Pourquoi les 4 leçons de catégorie A n'ont PAS été programmées

Et c'est la partie qu'il faut dire clairement plutôt que de la contourner.

La règle de rattachement gelée depuis V67 est : **une leçon ne se rattache qu'à une journée
dont le sujet est déjà le sien.** Or :

```
=== journées dont le TITRE porte le sujet ===
(déploiement | release | livraison | rollback | incident | responsive | CSS | cloud | hébergement)
   → aucun résultat sur 365
```

**Aucune des 365 journées ne porte ces sujets.** Il n'existe donc aucune journée à laquelle
rattacher ces quatre leçons sans violer la règle gelée. Les trois options possibles sont
toutes hors du périmètre de V68 :

1. **Ajouter des journées** — modifie le contrat des 365 jours, explicitement protégé.
2. **Remplacer des journées existantes** — décision sur le programme métier, qui suppose de
   prouver qu'une journée existante n'apporte rien.
3. **Rattacher malgré tout** à une journée dont ce n'est pas le sujet — viole la règle gelée
   et reproduit exactement l'erreur que V67 a corrigée.

**Cette décision est donc escaladée, pas prise silencieusement.** Elle appartient au
propriétaire du curriculum et mérite son propre sprint.

### Ce qui a été fait à la place, et qui sert l'apprenant tout de suite

Laisser six pointeurs morts aurait été le pire choix : l'apprenant clique, atterrit sur une
leçon qu'aucune journée ne programme, et ne sait pas s'il a manqué quelque chose.

Les six prérequis portent désormais **l'essentiel en deux ou trois phrases** — assez pour
lire la leçon sans blocage — et **un avertissement explicite** :

> **Étagère de référence.** `/doc/lessons/deployment-strategies` compare les stratégies
> (rolling, blue-green, canary). Elle est sur l'étagère de référence : aucune des 365
> journées ne la programme, et rien ici ne suppose que tu l'as lue.

Le trou n'est pas bouché — il est **rendu visible et franchissable**. C'est la seule chose
honnête à faire tant que la décision de programme n'est pas prise.

---

## CP12 — La couverture cloud, mesurée et non supposée

Le brief demande de vérifier si les compétences cloud sont **réellement enseignées**, et pas
seulement si une étiquette existe.

### La compétence `cloud` n'a aucune journée — confirmé

Répartition des 365 journées par compétence :

```
42 jsts · 42 rag · 35 ml · 25 comm · 23 autonomy · 23 secu · 21 llm · 21 agents
20 evalia · 19 archi · 16 python · 15 dl · 14 se · 13 http · 11 algo · 11 sql
 7 gitlinux · 5 ds · 2 patterns
```

Dix-neuf compétences, 365 journées, **et `cloud` n'y figure pas**.

### Ce que les journées enseignent vraiment

Mesuré sur le texte des 365 journées, avec deux témoins pour calibrer :

| Compétence | Journées qui en parlent |
|---|---|
| Docker *(témoin — enseigné)* | **24** |
| Observabilité *(témoin — enseigné)* | **26** |
| Kubernetes | 4 |
| CSS | 3 |
| systemd / SSH | 2 |
| stockage objet | 2 |
| cloud (VPC, subnet, IAM, zones) | **1** |
| IaC / Terraform | **1** |
| Next.js | **1** |
| FinOps / coût cloud | **1** |

Et les quelques occurrences sont des **mentions de passage**, pas un enseignement :

- `day-078` : une seule phrase — « l'API vit dans un `subnet` privé ». Le mot est employé,
  jamais expliqué.
- `day-085` : « Dans Kubernetes, le **RBAC** gère les permissions » — une illustration d'un
  cours sur le moindre privilège.
- `day-320` : un paragraphe de modèle mental sur l'orchestration.
- `day-104`, `day-107`, `day-233` : « CSS » n'apparaît que dans des phrases qui disent de
  **ne pas** y passer de temps.

### Verdict sur la couverture des treize compétences cloud du brief

| Compétence | Enseignée dans les 365 journées ? |
|---|---|
| modèles de service (IaaS/PaaS/SaaS) | non |
| compute | non |
| stockage | mention (2 journées) |
| réseau cloud (VPC, subnet, routage) | **non** — 1 mention, jamais expliquée |
| IAM | **non** |
| secrets | **oui** — `deployment-secrets` est programmée |
| déploiement | partiellement, via CI/CD et Docker |
| observabilité | **oui** — 26 journées |
| coût / FinOps | non |
| scalabilité | **oui** — `system-design-scaling` est programmée |
| disponibilité | **oui** — `slo-error-budget`, `resilience-patterns` |
| responsabilité partagée | non |
| conteneurs / orchestration | conteneurs **oui** (24 journées) · orchestration non |

**Cinq compétences cloud sur treize sont enseignées ; huit ne le sont pas.** Les six leçons
cloud qui les couvriraient existent, sont bonnes, et ne sont programmées nulle part.

### Autres compétences pédagogiquement orphelines

La même mesure en révèle quatre autres, du même type :

- **Kubernetes** — 6 leçons, 4 mentions de passage, aucune journée.
- **Infrastructure as Code** — 1 leçon (`iac-fundamentals`), **zéro mention** dans les 365
  journées.
- **CSS** — 4 leçons, et le mot n'apparaît dans les journées que pour dire de ne pas s'y
  attarder. L'apprenant construit des interfaces React pendant tout le mois 4 **sans qu'on
  lui ait jamais enseigné CSS**.
- **Next.js** — 4 leçons, aucune journée. Et le curriculum affirmait le contraire.

### Le défaut le plus grave de ce checkpoint

`day-233` disait à l'apprenant :

> une CLI soignée ou une page unique (**ton acquis Next.js du mois 3** suffit largement)

**Aucune journée du mois 3 — ni d'aucun autre mois — n'enseigne Next.js.** Vérifié :
`grep -ilE "next\.?js|app router|server component"` sur les journées 50 à 129 ne retourne
aucun fichier.

Un apprenant qui arrive au jour 233 lit qu'il possède une compétence qu'on ne lui a jamais
donnée. La conclusion la plus probable, et la plus décourageante, est qu'il a manqué quelque
chose.

**Corrigé** dans `scripts/data/days-enrich-211-240.mjs` — la source, jamais le fichier
généré :

```diff
- une page unique (ton acquis Next.js du mois 3 suffit largement)
+ une page unique en React (mois 4)
```

React, lui, **est** réellement enseigné au mois 4 : journées 92, 102, 107, 110 et suivantes.
La référence corrigée est vérifiable.

---

## Dette déclarée à l'issue de CP10–CP12

1. **4 leçons de catégorie A non programmées** — décision de programme escaladée. Le trou est
   documenté et rendu franchissable, il n'est pas comblé.
2. **8 compétences cloud sur 13 non enseignées** dans les 365 journées.
3. **Kubernetes, IaC, CSS, Next.js orphelins** — 15 leçons au total.
4. **37 corrections de type G2** répètent encore le cours au lieu de nommer une erreur.
5. **25 leçons hors parcours sans correction** — assumées comme étagère de référence.
6. **L'exemple guidé reste à 53 mots médians** sur le corpus. Une seule leçon
   (`metrics-percentiles`, 438 mots) a été refaite en profondeur. C'est la dimension la plus
   basse du barème et elle n'est traitée qu'à titre de démonstration.
