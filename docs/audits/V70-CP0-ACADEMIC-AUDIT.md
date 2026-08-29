# V70 CP0 — Audit forensic académique du corpus

**Lecture seule.** Aucune leçon n'a été modifiée. Tous les chiffres proviennent de
`scripts/v70/extract.mjs`, `cp0-stats.mjs`, `cp0-jargon.mjs`, `cp0-rank.mjs`.
Sorties brutes conservées dans `docs/v70/cp0-mesures-brutes.txt`.

Snapshot d'entrée immuable : `docs/v70/SNAPSHOT-AVANT.txt`
(sha1 `e807927001163e98…`, empreinte + nombre de mots des 128 leçons).

---

## 1. État Git et invariants

| élément | valeur |
|---|---|
| branche | `claude/ai-career-os-saas-phfg49` |
| HEAD | `7b39e77c108414254db77120d78cec9f0bcff782` |
| local == origin | oui |
| working tree | propre |
| stash | 0 |
| serveurs résiduels | 0 |
| leçons | 128 |
| journées | 365 |
| solutions | 365 |
| `data/progress.json` (sha256) | `73c1ee39a255c879…` |
| corpus leçons (sha1) | `64748e1522904dbc…` |

---

## 2. Le diagnostic, en français simple

Le corpus n'est pas homogène. Il contient **deux populations distinctes** qui ne se
ressemblent pas, et cette différence est le fait dominant de l'audit.

Quarante leçons ont été réécrites en V69. Leur exemple guidé fait **752 mots de
médiane**, il pèse des décisions, et ses affirmations chiffrées ont été vérifiées
par exécution.

Les quatre-vingt-huit autres ont un exemple guidé de **85 mots de médiane**. Ce ne
sont pas des exemples : ce sont des énoncés suivis d'une solution. L'apprenant y voit
*ce qu'il faut faire*, jamais *comment on a décidé de le faire*.

Un lecteur qui ouvre `docker-containers` (753 mots d'exemple) puis
`docker-networking-volumes` (58 mots) le même jour ne lit pas le même produit.

**Réponse à la question centrale du CP0.** Les cours actuels sont-ils adaptés à un
humain débutant/intermédiaire, ou ressemblent-ils à des synthèses pour quelqu'un qui
connaît déjà le sujet ?

**Environ un tiers du corpus est adapté à un humain. Les deux autres tiers restent des
synthèses.** C'est mesuré, pas estimé : 101 leçons sur 128 portent au moins un défaut
pédagogique observable de niveau P2 ou pire.

Et un point que V69 avait annoncé sans le chiffrer se confirme durement : **la
pratique et les corrections n'ont pas suivi**, y compris dans le périmètre V69
lui-même.

---

## 3. Tableau de santé du corpus

| fonction pédagogique | présente | absente |
|---|---:|---:|
| modèle mental | 128 | 0 |
| exemple guidé (section) | 128 | 0 |
| erreurs fréquentes | 128 | 0 |
| liens avec le programme | 128 | 0 |
| vocabulaire | 128 | 0 |
| à retenir | 128 | 0 |
| pratique | 123 | **5** |
| correction | 103 | **25** |
| questions d'entretien | 101 | 27 |
| cas professionnel | 66 | **62** |
| vérification de compréhension | 43 | 85 |

La colonne « présente » trompe. Une section existe presque toujours ; **c'est son
contenu qui manque**. La suite le montre.

---

## 4. Distribution des longueurs (mots)

| | min | P10 | P25 | médiane | P75 | P90 | max |
|---|---:|---:|---:|---:|---:|---:|---:|
| leçon entière | 921 | 1069 | 1211 | 1810 | 2061 | 2505 | 3080 |
| noyau explicatif | 183 | 244 | 281 | 347 | 429 | 532 | 1208 |
| **exemple guidé** | **16** | **54** | **73** | **103** | **669** | 777 | 927 |
| pratique | 0 | 23 | 31 | 46 | 52 | 58 | 93 |
| correction | 0 | 0 | 38 | 299 | 567 | 610 | 733 |
| cas professionnel | 0 | 0 | 0 | 35 | 54 | 173 | 216 |

**La ligne « exemple guidé » est le résultat le plus important de cet audit.** Passer
de 103 (médiane) à 669 (P75) n'est pas une distribution continue : c'est un gouffre.
Une distribution normale n'a pas cette forme. Le corpus a deux modes.

---

## 5. Les deux vitesses, chiffrées

| | 40 leçons V69 | 88 autres |
|---|---:|---:|
| exemple guidé (médiane) | **752** | **85** |
| correction (médiane) | 380 | 54 |
| pratique (médiane) | 49 | 43 |
| cas professionnel présent | 17/40 | 49/88 |
| aucune correction | 0/40 | **25/88** |
| correction < 60 mots | **15/40** | 20/88 |
| pratique sans production observable | **17/40** | **48/88** |

Deux lectures s'imposent, et la seconde est inconfortable.

D'abord : l'écart sur l'exemple guidé est de **1 à 8,8**. C'est l'effet de V69, voulu
et assumé, mais il laisse le corpus déséquilibré.

Ensuite : **le périmètre V69 n'est pas exempt**. 15 de ses 40 leçons ont une
correction de moins de 60 mots, et 17 une pratique sans production observable. V69 a
approfondi l'exemple guidé et **rien d'autre**. Le déséquilibre lecture/pratique qu'il
signalait dans son propre rapport est ici mesuré.

---

## 6. Diagnostic « fiche de mots-clés »

| symptôme | leçons |
|---|---:|
| exemple guidé < 120 mots (pseudo-exemple) | **77 / 128** |
| exemple guidé < 250 mots | 83 / 128 |
| gabarit « Énoncé / Raisonnement / Solution » | 19 / 128 |
| noyau explicatif < 250 mots | ~30 / 128 |
| aucun bloc de code ni exemple concret | 16 / 128 |

Deux extraits, cités intégralement, qui montrent ce que « fiche de mots-clés »
signifie concrètement.

`k8s-workloads`, exemple guidé complet (31 mots) :

> 1. Application web sans état, plusieurs exemplaires → **Deployment**.
> 2. Base de données avec stockage par instance → **StatefulSet**.
> 3. Agent présent sur chaque nœud → **DaemonSet**.
> 4. Migration ponctuelle → **Job** ; nettoyage nocturne → **CronJob**.

C'est une **table de correspondance**, pas un exemple. Elle n'apprend pas à choisir :
elle suppose qu'on a déjà classé la situation. Un apprenant qui hésite entre
Deployment et StatefulSet n'y trouve rien, parce que la question qu'il se pose — *mon
application a-t-elle un état ?* — n'est pas traitée.

`etl-pipelines`, en-tête d'exemple guidé :

> **Énoncé** : structurer un pipeline en 3 fonctions.
> **Raisonnement** : séparer les responsabilités ; le transform pur, le reste isolé.
> **Solution (pseudo)** : …

Le « raisonnement » fait onze mots et énonce la conclusion. Aucune décision n'est
pesée, aucune alternative n'est écartée avec un motif.

---

## 7. Diagnostic exemple guidé

**77 leçons sur 128 ont un exemple guidé de moins de 120 mots.** C'est le défaut le
plus répandu du corpus et le plus coûteux pédagogiquement, parce que l'exemple guidé
est le seul endroit où un apprenant voit un raisonnement se dérouler.

Les 19 leçons au gabarit « Énoncé / Raisonnement / Solution » sont un cas particulier :
la structure *promet* un raisonnement et livre une conclusion. C'est plus trompeur
qu'une absence.

---

## 8. Diagnostic pratique

| symptôme | leçons |
|---|---:|
| aucune pratique | 5 / 128 |
| pratique < 40 mots | 38 / 128 |
| **pratique sans verbe de production** | **65 / 128** |

Le troisième chiffre est le vrai problème. La moitié du corpus demande à l'apprenant
de *répondre*, pas de *produire*. Un exercice qui commence par « Qu'est-ce que… » ou
« Explique en une phrase… » n'est pas une pratique : c'est un contrôle de lecture.

La médiane de 46 mots d'exercice par leçon est également très basse pour des journées
annoncées à 4,5 heures.

---

## 9. Diagnostic correction

| symptôme | leçons |
|---|---:|
| aucune correction | 25 / 128 |
| correction < 60 mots (réponse seule) | 35 / 128 |
| correction sans raisonnement explicite | 33 / 128 |

**Cumulés, 60 leçons sur 128 n'ont pas de correction utilisable.** Une correction qui
donne la réponse sans dire comment y arriver n'enseigne rien à celui qui s'est trompé
— c'est-à-dire à celui qui en avait besoin.

Les 25 leçons sans aucune correction sont **toutes hors parcours** (Cloud, K8s,
Next.js, CSS), ce qui explique qu'elles soient passées sous les radars des sprints
précédents.

---

## 10. Diagnostic jargon

**Sonde corrigée en cours d'audit — la première version était fausse.** Elle comptait
606 « acronymes non définis », dont `AVANT`, `ET`, `PAS`, `UNE` : le corpus emploie
massivement les **capitales comme emphase**, et ma sonde les lisait comme des sigles.
Filtre appliqué : un mot en capitales qui apparaît ailleurs en minuscules dans le
corpus est de l'emphase, pas un sigle.

Après correction : **103 sigles distincts** employés sans être développés ni figurer
au vocabulaire de leur leçon. Les plus fréquents :

| sigle | leçons | sigle | leçons |
|---|---:|---|---:|
| VM | 5 | SIGTERM | 2 |
| VPC | 4 | SRE | 2 |
| ADR | 3 | WAF | 2 |
| SDK | 3 | OWASP | 1 |
| JSX | 3 | MVC | 1 |
| POC | 2 | IAM | 2 |

Résidu de faux positifs connu et déclaré : `EUR` (une devise dans un exemple V69) et
`DESC` (mot-clé SQL). La sonde n'est pas parfaite ; elle est utilisable.

**Signal éditorial connexe** : l'usage des capitales d'emphase est massif dans le
corpus. C'est un tic d'écriture, et il relève du diagnostic anti-template (§13).

**Tournures qui minimisent la difficulté** (« il suffit de », « évidemment »,
« simplement », « trivial ») : **36 leçons sur 128**, 53 occurrences. Employées sur un
concept non trivial, ces formules disent à l'apprenant qui bloque que le problème
vient de lui.

---

## 11. Diagnostic prérequis

**40 chaînes de prérequis cassées** : une leçon déclare comme prérequis une leçon qui
n'est programmée par aucune des 365 journées.

| leçon déclarée prérequis, jamais enseignée | nombre de leçons qui en dépendent |
|---|---:|
| `cloud-fundamentals` | **7** |
| `deployment-strategies` | 3 |
| `k8s-config-probes` | 3 |
| `css-fundamentals` | 3 |
| `k8s-workloads` | 3 |
| `cloud-networking` | 2 |
| `cloud-compute-storage` | 2 |
| `cloud-aws-core` | 2 |
| `css-flexbox` | 2 |
| `k8s-why-architecture` | 2 |

**25 leçons sont hors parcours** : les six `cloud-*`, les sept `k8s-*`, les quatre
`nextjs-*`, les trois `css-*`, plus `iac-fundamentals`, `deployment-strategies`,
`linux-services-systemd`, `linux-ssh-remote`, `release-incident-recovery`,
`responsive-design`.

Ce n'est pas un détail de tuyauterie : le programme **promet** des compétences
Cloud, Kubernetes, Next.js et CSS, et aucune journée ne les enseigne. Le rattachement
est une décision de curriculum qui ne sera **pas** prise silencieusement (§18 du
brief). Leur contenu, lui, sera audité et amélioré comme les autres.

---

## 12. Diagnostic temps pédagogique

Sur les 309 journées hors revue hebdomadaire, avec une hypothèse déclarée de
**180 mots/minute** (lecture technique attentive, code compris) :

| mesure | valeur |
|---|---|
| durée annoncée (médiane) | **270 min** (4,5 h) |
| lecture seule (médiane) | **36 min** |
| lecture seule (P90) | 67 min |
| lecture seule (max) | 110 min |
| **ratio lecture / annoncé** | **13 %** |
| reste à couvrir par la pratique, la correction, le projet | **234 min** |
| mots d'exercice par journée (médiane) | 138 |

**Le produit annonce 4,5 heures et fournit 36 minutes de lecture plus 138 mots
d'exercice.** Les 234 minutes restantes reposent entièrement sur des consignes de
pratique dont la §8 vient de montrer que la moitié ne demande aucune production.

Je ne prétends pas que 234 minutes de travail sont impossibles : un bon exercice peut
occuper deux heures en trente mots de consigne. Mais **rien dans le corpus ne permet
aujourd'hui de l'affirmer**, et c'est précisément ce que V70 doit corriger — non pas
en gonflant le texte, mais en rendant les exercices assez spécifiés pour que leur
durée soit crédible.

---

## 13. Diagnostic anti-template

| mesure | valeur |
|---|---|
| séquences de titres distinctes | **65** pour 128 leçons |
| leçons partageant leur séquence exacte avec ≥1 autre | **73 / 128** |
| plus gros groupe identique | **18 leçons** |
| groupes suivants | 14, 13, 8, 6 leçons |
| nombre de sections par leçon | 13→6 · 14→2 · 15→14 · 16→20 · 17→25 · **18→46** · 19→15 |
| gabarit « Énoncé/Raisonnement » | 19 / 128 |
| étiquette « Décision N » | 33 / 128 |
| titre « Variante qui déplace le problème » | 44 / 128 |

Deux gabarits coexistent, et **aucun des deux n'est le bon**.

Le gabarit historique : 73 leçons partagent leur séquence de titres exacte avec au
moins une autre, dont un groupe de 18. Et 46 leçons ont exactement 18 sections.

Le gabarit V69 : 33 leçons portent la même étiquette « Décision N », 44 se terminent
par le même titre. V69 avait diagnostiqué ce défaut sur lui-même ; la mesure ici le
confirme à l'échelle du corpus.

---

## 14. Les 20 leçons prioritaires

Score de défaut = somme de pénalités **observables** (exemple squelettique 3, aucune
correction 3, aucune pratique 3, gabarit Énoncé/Raisonnement 2, correction réponse
seule 2, pratique sans production 2, noyau mince 2, cas professionnel absent 1, hors
parcours 1, aucun code 1). Ce score **ne note pas la qualité pédagogique** : il classe
l'urgence. La note académique se met par lecture, au CP3.

| # | leçon | score | guidé | exo | corr | défauts dominants |
|---|---|---:|---:|---:|---:|---|
| 1 | `interview-preparation` | 12 | 108 | 51 | 38 | gabarit + correction réponse seule + pratique passive + noyau mince |
| 2 | `portfolio-github` | 12 | 111 | 53 | 38 | idem |
| 3 | `cloud-aws-core` | 11 | 55 | 30 | 0 | aucune correction + pratique passive + noyau mince + hors parcours |
| 4 | `nextjs-rendering` | 11 | 88 | 49 | 0 | aucune correction + aucun code + hors parcours |
| 5 | `nextjs-server-client-components` | 11 | 100 | 62 | 0 | idem |
| 6 | `cloud-compute-storage` | 10 | 39 | 32 | 0 | aucune correction + aucun code + hors parcours |
| 7 | `cloud-fundamentals` | 10 | 45 | 27 | 0 | idem — et prérequis de 7 leçons |
| 8 | `cloud-networking` | 10 | 58 | 25 | 0 | idem |
| 9 | `css-fundamentals` | 10 | 94 | 65 | 0 | aucune correction + pratique passive + hors parcours |
| 10 | `nextjs-foundations` | 10 | 94 | 74 | 0 | aucune correction + noyau mince + hors parcours |
| 11 | `technical-storytelling` | 10 | 97 | 46 | 40 | gabarit + correction réponse seule + pratique passive |
| 12 | `agent-workflows-orchestration` | 10 | 101 | 62 | 47 | idem + noyau mince |
| 13 | `etl-pipelines` | 10 | 102 | 46 | 36 | idem |
| 14 | `llm-cost-optimization` | 10 | 104 | 58 | 41 | idem |
| 15 | `deployment-secrets` | 10 | 105 | 50 | 38 | idem |
| 16 | `rag-evaluation` | 10 | 116 | 41 | 44 | idem |
| 17 | `caching-performance` | 10 | 119 | 50 | 41 | idem |
| 18 | `k8s-workloads` | 9 | 31 | 21 | 0 | table de correspondance + aucune correction + hors parcours |
| 19 | `k8s-troubleshooting` | 9 | 47 | 30 | 0 | catalogue + aucune correction + hors parcours |
| 20 | `cloud-azure-core` | 9 | 51 | 27 | 0 | idem |

### Les 10 leçons les plus solides

| # | leçon | score | guidé | corr | ce qui la sauve |
|---|---|---:|---:|---:|---|
| 1 | `machine-learning-basics` | 0 | 781 | 428 | la fuite démontrée sur du bruit pur |
| 2 | `clean-code` | 0 | 757 | 375 | quatre passes sur le même code |
| 3 | `ai-security` | 0 | 756 | 466 | la fuite chiffrée, pas racontée |
| 4 | `rag-fundamentals` | 0 | 739 | 465 | le découpage exécuté |
| 5 | `api-design-basics` | 0 | 704 | 432 | les questions du consommateur |
| 6 | `design-patterns-intro` | 0 | 617 | 383 | commence par refuser de refactorer |
| 7 | `git-fundamentals` | 0 | 333 | 347 | courte et complète — la preuve que la longueur n'est pas le critère |
| 8 | `web-forms-validation` | 1 | 812 | 573 | validation native mesurée |
| 9 | `react-application-states` | 1 | 705 | 534 | les 8 états énumérés |
| 10 | `data-structures-intro` | 1 | 696 | 400 | le coût caché de `includes` |

`git-fundamentals` mérite d'être signalée : **333 mots d'exemple guidé, score de défaut
0**. Elle prouve qu'une bonne leçon n'est pas une longue leçon, et elle sert de
contre-exemple au réflexe « rallonger ».

---

## 15. Répartition par priorité et plan CP1 → CP15

| priorité | définition | leçons |
|---|---|---:|
| **P0** | bloquant (score ≥ 9) | **28** |
| **P1** | insuffisant (6–8) | **35** |
| **P2** | trop synthétique (3–5) | **38** |
| **P3** | mineur (1–2) | 20 |
| **PASS** | aucun défaut observable | 7 |

**101 leçons sur 128 sont à réécrire** (P0 + P1 + P2). Les 27 restantes sont à
examiner ; certaines seront conservées telles quelles.

C'est le périmètre réel de V70, et il est trois fois plus large que celui de V69.

### Plan

| CP | contenu |
|---|---|
| CP1 | contrat académique gelé (réutilise le barème V69, ajoute pratique et correction) |
| CP2 | standard pédagogique humain + **archétypes de leçon** (contre le clonage) |
| CP3 | ledger complet des 128, classement P0→PASS justifié |
| CP4 | lot 1 — hors parcours Cloud & Kubernetes (13 leçons, dont 0 correction) |
| CP5 | lot 2 — hors parcours Frontend & Next.js & CSS (7 leçons) |
| CP6 | lot 3 — Web, backend, données (P0/P1) |
| CP7 | lot 4 — IA appliquée, LLM, RAG, agents (P0/P1) |
| CP8 | lot 5 — Systèmes, réseau, observabilité, incident (P0/P1) |
| CP9 | lot 6 — Fondations, carrière, P2 résiduels |
| CP10 | passe transverse **pratique & correction** sur les 128 |
| CP11 | passe transverse **vulgarisation, jargon, prérequis** |
| CP12 | vérification factuelle exécutable |
| CP13 | audit aveugle sur l'échantillon `V70-ACADEMIC-CORPUS-24` + restitutions simulées |
| CP14 | tests négatifs (10 sabotages) + gauntlet complet |
| CP15 | rapport final + ledger + recommandation V71 |

L'échantillon aveugle est **déjà tiré et publié** dans `docs/V70-BLIND-SAMPLE.md`
(graine `V70-ACADEMIC-CORPUS-24`, 24 leçons, stratifiées sur domaine × longueur ×
parcours × note superficielle). Il ne sera pas modifié.
