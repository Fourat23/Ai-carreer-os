# V71 — CP0 · Audit académique forensique

**Lecture seule.** Aucun fichier du corpus pédagogique n'a été modifié pendant ce CP.
Toutes les mesures sont reproductibles par `node scripts/v71/mesures-cp0.mjs`.

---

## 1. État Git et invariants

| | |
|---|---|
| branche | `claude/ai-career-os-saas-phfg49` |
| HEAD | `c8259501dcbf92c9601b9605bb49d5b5762f2bf4` |
| local vs origin | identiques |
| working tree | propre (0 fichier) |
| stash | vide |

| invariant | attendu | mesuré | état |
|---|---|---|---|
| leçons | 128 | **128** | conforme |
| journées | 365 | **365** | conforme |
| solutions | 365 | **365** | conforme |
| semaines / mois | 52 / 12 | **52 / 12** | conforme |
| `data/progress.json` | inchangé | dernier commit `1dad5d4`, antérieur à V64 | conforme |
| mapping des 365 jours | inchangé depuis V68 | dernier commit sur `scripts/data` : `305ba40` (V68) | conforme |

**Aucun invariant ne diffère à l'entrée.** Rien n'a été « réparé » silencieusement.

Validation : `gates:active` **0** · `npm test` **1420/1420** · `tsc --noEmit` **0**
· `npm run build` **0**.

---

## 2. Snapshot et empreintes

| élément | empreinte |
|---|---|
| corpus des 128 leçons | `edbfecdff1d3e4c320cedd51ede95601fd94750d` |
| `data/progress.json` | `598f27c2ade43f4a7d2778536ce7cf5236ae81dd` |
| `data/program.json` | `5ac3da304994c298ab964a4b03e13da336bb8935` |

Snapshot par leçon (slug, longueur, SHA-1) : `docs/v71/SNAPSHOT-CP0.json`.
Échantillon aveugle stratifié : `docs/v71/ECHANTILLON-AVEUGLE.json`, **graine 20260831**,
56 strates, 32 leçons. La graine est publiée **avant** toute modification.

---

## 3. Résumé exécutif, en français simple

Le corpus est en bien meilleur état qu'il ne l'était avant V69/V70, et les mesures le
confirment sans ambiguïté. Ce que j'ai lu est de l'enseignement, pas de la documentation
compressée : les exemples guidés montrent des décisions et pas seulement des solutions,
les exercices demandent de produire quelque chose de vérifiable, les corrections
expliquent le chemin.

**Trois réserves, dans l'ordre d'importance.**

1. **La profondeur n'est pas là où un débutant la cherche.** Le noyau explicatif — la
   section qu'on lit en premier — fait **366 mots en médiane**, contre **822 pour
   l'exemple guidé** et **974 pour la correction**. Autrement dit, le cours explique peu
   et démontre beaucoup. Pour un lecteur qui découvre le sujet, la première section est
   souvent une liste de définitions denses ; la compréhension n'arrive qu'après.
2. **Cette liste de définitions est concentrée sur un groupe identifiable** : Cloud,
   Kubernetes, Docker, réseau. Ce sont exactement les domaines dont V70 n'a pas pu
   vérifier la pratique par exécution.
3. **61 leçons sur 128 n'ont aucune section de cas professionnel.** Le transfert existe
   souvent ailleurs (dans l'exemple guidé, qui est presque toujours situé dans un
   contexte réel), mais il n'est pas systématisé.

Aucun de ces trois points n'est un défaut bloquant. Aucun ne se corrige en ajoutant du
texte : il s'agit de déplacer de l'explication là où elle manque, pas d'en produire plus.

---

## 4. État réel du corpus — les chiffres

Produits par `scripts/v71/mesures-cp0.mjs`.

| mesure | min | p10 | p25 | **médiane** | p75 | p90 | max |
|---|---|---|---|---|---|---|---|
| mots par leçon | 2 369 | 2 614 | 2 855 | **3 181** | 3 553 | 4 041 | 4 646 |
| noyau explicatif | 192 | 247 | 293 | **366** | 457 | 553 | 1 286 |
| exemple guidé | 353 | 675 | 752 | **822** | 932 | 1 060 | 1 425 |
| correction | 444 | 564 | 683 | **974** | 1 235 | 1 420 | 1 891 |
| cas professionnel | 0 | 0 | 0 | **41** | 126 | 191 | 232 |

**Avertissement de comparabilité.** Ces chiffres ne sont pas directement comparables à
ceux publiés par V70 : les sondes V71 comptent les sections différemment (elles somment
les deux sections « Correction » quand il y en a deux, et incluent le bandeau
d'étagère de référence dans le total). Les comparaisons avant/après du CP15 seront
faites avec **ces** sondes appliquées aux deux dates, pas en reprenant les chiffres V70.

---

## 5. Distribution longueur et temps

| catégorie | leçons |
|---|---|
| > 4 000 mots | 7 (`css-flexbox`, `css-fundamentals`, `frontend-testing`, `html-semantic-structure`, `nextjs-data-production`, `rag-fundamentals`, `react-accessibility`) |
| > 3 500 mots | 25 |
| < 2 500 mots | 15 |
| exemple guidé > 1 100 mots | 4 (`caching-performance`, `css-flexbox`, `nextjs-data-production`, `typescript-frontend`) |
| exemple guidé < 400 mots | 2 (`git-fundamentals`, `terminal-shell-filesystem`) |

**Sur-écriture : pas de preuve pour l'instant.** Aucune leçon ne dépasse 4 646 mots, et
`git-fundamentals` reste la référence opposable — 353 mots d'exemple guidé, et c'est
l'une des meilleures leçons du corpus. La question « certaines leçons sont-elles
devenues inutilement longues ? » ne se tranche pas par la longueur ; les 7 leçons de
plus de 4 000 mots seront lues au CP3 avec cette question posée explicitement.

**Temps pédagogique** (rapport lecture / budget horaire de la journée, sur les 365) :

| | valeur |
|---|---|
| p10 | 13 % du budget |
| médiane | **27 %** |
| p90 | 56 % |
| journées où la lecture dépasse **100 %** du budget | **3** (revues hebdo 70, 77, 84) |
| journées où la lecture dépasse 60 % | 12 |
| journées où la lecture est sous 15 % | **52** |

La médiane est saine : un quart du budget en lecture laisse la place à la pratique. Les
52 journées sous 15 % posent la question inverse — sont-elles sous-remplies ? Elle sera
instruite au CP14.

---

## 6. Profondeur explicative

Le noyau explicatif est court (**366 mots médians**) et, dans une partie du corpus,
construit comme un dictionnaire : des paragraphes ouvrant sur `**Terme.**` suivis d'une
définition. La sonde mesure deux densités pour 1 000 mots — celle des définitions en
tête de paragraphe, celle des marqueurs de raisonnement (*pourquoi*, *parce que*, *en
revanche*, *au lieu de*, *compromis*).

| | min | p25 | médiane | p75 | max |
|---|---|---|---|---|---|
| densité de définitions | 0 | 0 | **0** | 14,3 | 24,4 |
| densité de raisonnement | 0 | 0 | **4,1** | 7,6 | 16,1 |

La médiane de densité de définitions est **0** : la majorité du corpus n'est pas
cataloguée. Le problème est concentré :

| leçon | densité définitions | densité raisonnement |
|---|---|---|
| `k8s-workloads` | 24,4 | 3,5 |
| `cloud-finops` | 23,9 | **0** |
| `release-incident-recovery` | 22,6 | 11,3 |
| `k8s-security` | 22,2 | 7,4 |
| `iac-fundamentals` | 21,7 | 3,1 |
| `cloud-networking` | 20,9 | 3,5 |
| `docker-build-dockerfile` | 20,8 | 3,5 |
| `ci-cd-pipeline-anatomy` | 20,7 | **0** |
| `k8s-why-architecture` | 20,5 | 3,4 |
| `docker-production-hardening` | 20,1 | **0** |

**Vérifié par lecture, pas seulement par sonde.** Le noyau de
`docker-production-hardening` est bien une suite de définitions — *Non-root*, *Image
minimale*, *Système de fichiers en lecture seule*, *Limites de ressources*, *Secrets*,
*PID 1 et signaux*. Chacune est juste, chacune donne une conséquence. Mais l'ensemble se
lit comme un mémo pour quelqu'un qui connaît déjà le sujet, pas comme une explication
pour quelqu'un qui le découvre.

**Correction d'un faux positif de ma propre sonde.** Une première version signalait 12
leçons « sans section Explication complète » : `api-production-contracts`,
`async-messaging-queues`, `distributed-systems-failures`, `distributed-tracing`,
`incident-response`, `logging-structured`, `metrics-percentiles`,
`observability-fundamentals`, `postmortem-rca`, `resilience-patterns`,
`slo-error-budget`, `system-design-scaling`. Vérification faite : elles utilisent le
titre **« Explication progressive »**. Ce n'est pas un manque, c'est une variante de
structure — et plutôt un bon signe pour la diversité des archétypes. La sonde a été
corrigée pour accepter les deux titres.

---

## 7. Qualité des exemples guidés

C'est le point fort du corpus. Médiane **822 mots**, et surtout une forme qui montre le
raisonnement. Trois exemples lus intégralement :

- **`k8s-workloads`** ouvre en disant que le tableau de correspondance « application
  sans état → Deployment » *ne sert à rien*, puis construit le vrai problème : savoir si
  l'application est sans état. Il donne trois symptômes réels (déconnexion deux fois sur
  trois, fichiers disparus, nettoyage exécuté en triple), et le « deux fois sur trois »
  est présenté comme **l'indice qui révèle le nombre d'exemplaires**. Il finit par un
  critère transférable : *une application est sans état si tu peux détruire n'importe
  lequel de ses exemplaires sans que personne ne s'en aperçoive*.
- **`feature-engineering`** commence par regarder la donnée — 604 villes, dont 600
  n'apparaissent qu'une fois — et conclut que le problème n'est pas « comment encoder une
  catégorie » mais « comment traiter une longue traîne ». La décision 1 explique
  *pourquoi* numéroter les villes est faux : cela injecte un ordre et des distances qui
  n'existent pas.
- **`react-application-states`** part d'un bug de testeur, propose le correctif immédiat,
  puis pose la vraie question — *combien d'autres oublis de ce type le code permet-il ?* —
  et énumère les huit états représentables pour montrer que trois sont illégitimes.

Les trois répondent au test du brief : ils permettent de dire **ce qui casserait** si
l'on choisissait l'autre option.

---

## 8. Qualité des pratiques

**Taxonomie R / E / D / P / T sur les 128 leçons, toutes sections de pratique réunies :**

| classe | leçons |
|---|---|
| **P — production** | **127** |
| **D — décision** | **1** |
| T / E / R seuls | **0** |

**Aucune leçon ne repose uniquement sur « définis » ou « explique ».**

Les pratiques précisent le contexte, l'artefact à produire, un critère de réussite
vérifiable seul, et souvent un piège annoncé. Exemple mesuré, `k8s-workloads` :

> **Critère de réussite.** Vérifiable seul : pour chaque ligne, tu dois pouvoir écrire le
> symptôme que verrait un utilisateur — pas « ça ne marchera pas », mais « il sera
> déconnecté environ deux fois sur trois ».

**Correction d'un défaut de ma sonde, avec sa preuve.** Une première version classait la
section de pratique **la plus longue** et retombait sur « R » lorsqu'aucun verbe ne
correspondait. Elle donnait **122 P / 128** et signalait trois leçons en R/E :
`etl-pipelines`, `express-backend`, `react-fundamentals`. Lecture faite :

> `etl-pipelines` : « **Écris** un pipeline `extract/transform/load` … et **prouve**
> qu'un second run ne crée PAS de doublons. »
> `react-fundamentals` : « **Construis** le compteur avancé … » puis un mini-Kanban.

Les trois sont des productions. Le défaut était double : un compartiment par défaut qui
absorbait les non-appariements, et une liste de verbes trop courte (*simule*, *vérifie*,
*prouve*, *rends*, *déplace* manquaient). **Les deux chiffres sont publiés : 122/128 avec
la sonde d'origine, 127 P + 1 D avec la sonde corrigée.**

---

## 9. Qualité des corrections

Médiane **974 mots**. Les corrections lues contiennent la démarche, une fausse piste
crédible avec sa raison d'échec, les indices de reconnaissance, et le cas où la réponse
changerait. Extrait mesuré (`k8s-workloads`) :

> **L'erreur probable, et elle a l'air raisonnable.** Beaucoup répondent StatefulSet dès
> qu'ils trouvent un état. C'est confondre *avoir de l'état* et *avoir un état qui doit
> rester attaché à un exemplaire précis*.

**37 leçons ont deux sections « Correction attendue ».** J'ai d'abord soupçonné une
duplication produite par V70, qui a ajouté des pratiques sans fusionner l'existant.
**Mesure faite : c'est faux.** Le recouvrement de contenu entre les deux corrections est
nul dans 36 cas sur 37 — elles corrigent deux exercices différents (le mini-exercice
d'un côté, la pratique approfondie de l'autre). La seule exception est
`javascript-basics`, à 6 %.

**Répétition interne réelle : 1 leçon sur 128.** `javascript-basics` contient **114 mots
dupliqués** sur 3 blocs — le tableau des dix expressions, la démonstration de la copie
superficielle et le paragraphe sur l'objet de configuration apparaissent deux fois, dans
deux sections de correction distinctes. C'est un défaut P2 réel, et il est isolé.

**Note de méthode sur cette mesure.** Une première sonde comparait des *phrases* après
normalisation. Or la normalisation retire la ponctuation : le découpage en phrases ne se
faisait plus, chaque section devenait une phrase unique, et la sonde renvoyait 0 % de
recouvrement **partout** — un faux négatif complet, qui contredisait ce que j'avais lu.
Corrigée : découpage en paragraphes sur les lignes vides, re-jointure des lignes (le
texte est enveloppé à 90 colonnes, donc deux copies d'un même paragraphe n'ont pas les
mêmes coupures), normalisation ensuite.

---

## 10. Jargon et vulgarisation

Aucun terme technique employé sans définition à proximité (**0 leçon, 0 occurrence**),
mesuré par la sonde V70 resserrée au CP14 précédent — elle-même corrigée deux fois après
démonstration de sur-permissivité. Ce résultat est repris ici comme point de départ, et
sera recontrôlé au CP11 avec le corpus tel qu'il sera alors.

La vulgarisation reste inégale : elle est excellente dans les exemples guidés, plus
faible dans les noyaux catalogués du §6, où la définition suppose le vocabulaire.

---

## 11. Prérequis

Deux leçons portent un prérequis sans renvoi vers une leçon amont : `javascript-basics`
et `terminal-shell-filesystem`. **Ce sont les deux points d'entrée du programme** — il
n'y a pas d'amont. `javascript-basics` l'écrit explicitement : « Aucune expérience de
programmation n'est requise : c'est une leçon de premier contact. » Ce n'est donc pas un
défaut, mais il doit être confirmé comme comportement voulu, pas hérité.

Les prérequis lus sont réalistes et renvoient vers des leçons existantes (0 lien mort
mesuré sur les 128).

---

## 12. Factualité

État de l'outillage hérité : **49 scripts de vérification exécutables**
(`scripts/v70-verifications/`), rejoués par `npm run v70:verify`, qui contrôle en plus
**51 ancres numériques** — chaque nombre cité dans une leçon est cherché dans la sortie
du script qui le produit.

**Limite d'environnement à redire clairement, parce qu'elle n'a pas changé :** le démon
Docker ne tourne pas, systemd non plus, aucun accès AWS/Azure/GCP. Les treize leçons
Cloud et Kubernetes ne peuvent pas voir leur pratique vérifiée par exécution. Elles
seront lues et notées comme les autres, mais **aucune validation factuelle exécutée ne
sera revendiquée pour elles**.

---

## 13. Anti-template

Le corpus n'est pas mono-structure. `resilience-patterns` utilise « Explication
progressive », « Décomposition », « Que faire dans ce cas ? » ; d'autres utilisent
« Explication complète » et « Concepts clés ». La plus grande série de leçons à séquence
de titres strictement identique est de **6**.

Le risque n'est donc pas le clonage de structure mais le **clonage de rythme** : ouverture
par un problème, exemple guidé à décisions, pratique A→E, correction en cinq blocs. Cette
question sera posée au CP13 sur l'échantillon aveugle, titres masqués.

---

## 14. Charge cognitive

Le déséquilibre du §4 est d'abord une question de charge : le lecteur reçoit **366 mots
denses** de définitions avant d'atteindre **822 mots** d'exemple qui les rendraient
intelligibles. Pour un apprenant du niveau visé, l'ordre est contre-productif — non pas
parce que le contenu est mauvais, mais parce que l'explication arrive après l'exigence.

Les 7 leçons de plus de 4 000 mots seront examinées sous cet angle au CP3.

---

## 15. Les 20 leçons à lire en priorité

**Ce classement est un signal de lecture, pas une note.** Il agrège des propriétés
observables (noyau catalogué, peu de marqueurs de raisonnement, noyau court, aucun cas
professionnel, aucune vérification de compréhension, correction courte, exemple court,
répétition interne, une seule section de pratique). Aucune de ces leçons n'est déclarée
mauvaise avant lecture.

| # | leçon | signal | parcours | domaine | motifs |
|---|---|---|---|---|---|
| 1 | `cloud-finops` | 9 | hors | Cloud | noyau catalogue, peu de raisonnement, pas de vérification, correction courte, une seule pratique |
| 2 | `interview-preparation` | 9 | parcours | Carrière | peu de raisonnement, noyau court, pas de cas pro, pas de vérification, correction courte |
| 3 | `k8s-workloads` | 9 | hors | Kubernetes | noyau catalogue, peu de raisonnement, pas de vérification, correction courte, une seule pratique |
| 4 | `portfolio-github` | 9 | parcours | Carrière | peu de raisonnement, noyau court, pas de cas pro, pas de vérification, correction courte |
| 5 | `cloud-aws-core` | 8 | hors | Cloud | peu de raisonnement, noyau court, pas de vérification, correction courte |
| 6 | `linux-services-systemd` | 8 | hors | Systèmes | noyau catalogue, peu de raisonnement, noyau court |
| 7 | `nextjs-rendering` | 8 | hors | Frontend | peu de raisonnement, pas de cas pro, pas de vérification, correction courte |
| 8 | `agent-workflows-orchestration` | 7 | parcours | IA appliquée | peu de raisonnement, noyau court, pas de cas pro |
| 9 | `caching-performance` | 7 | parcours | Web & Backend | peu de raisonnement, noyau court, pas de cas pro |
| 10 | `cloud-networking` | 7 | hors | Cloud | noyau catalogue, peu de raisonnement |
| 11 | `database-modeling` | 7 | parcours | Données & ML | peu de raisonnement, noyau court, pas de cas pro |
| 12 | `docker-compose` | 7 | parcours | Systèmes | noyau catalogue, peu de raisonnement, noyau court |
| 13 | `iac-fundamentals` | 7 | hors | Cloud | noyau catalogue, peu de raisonnement |
| 14 | `k8s-security` | 7 | hors | Kubernetes | noyau catalogue, noyau court |
| 15 | `k8s-why-architecture` | 7 | hors | Kubernetes | noyau catalogue, peu de raisonnement |
| 16 | `llm-cost-optimization` | 7 | parcours | IA appliquée | peu de raisonnement, noyau court, pas de cas pro |
| 17 | `neural-networks` | 7 | parcours | Données & ML | peu de raisonnement, noyau court, pas de cas pro |
| 18 | `nextjs-foundations` | 7 | hors | Frontend | peu de raisonnement, noyau court, pas de cas pro |
| 19 | `observability-logging` | 7 | parcours | Systèmes | peu de raisonnement, pas de cas pro, correction courte |
| 20 | `rag-evaluation` | 7 | parcours | IA appliquée | peu de raisonnement, noyau court, pas de cas pro |

Répartition du signal sur les 128 : 9→4 leçons, 8→3, 7→17, 6→7, 5→29, 4→19, 3→27,
2→12, 1→6, 0→4.

`k8s-workloads` est en tête de ce classement **et** possède l'un des meilleurs exemples
guidés du corpus (§7). C'est la démonstration la plus nette que ce signal mesure des
propriétés, pas de la qualité — et la raison pour laquelle le contrat CP1 interdira à
toute sonde de produire une note.

---

## 16. Les 10 leçons de référence interne

Signal le plus favorable, à confirmer par lecture au CP3 avant de servir de référence
opposable :

`statistics-for-ml` · `rag-fundamentals` · `postmortem-rca` · `clean-code` ·
`technical-documentation` · `metrics-percentiles` · `git-fundamentals` ·
`async-messaging-queues` · `algorithmic-thinking` · `agents-fundamentals`

`git-fundamentals` conserve son statut de référence de concision : **353 mots** d'exemple
guidé, zéro défaut mesuré. Il reste la preuve opposable qu'une excellente leçon peut être
courte.

---

## 17. Les 25 leçons hors parcours

Inchangées : 103 leçons programmées, **25 hors parcours**. Elles portent un bandeau
explicite d'étagère de référence.

| famille | leçons |
|---|---|
| Cloud (7) | `cloud-fundamentals`, `cloud-aws-core`, `cloud-azure-core`, `cloud-compute-storage`, `cloud-networking`, `cloud-finops`, `iac-fundamentals` |
| Kubernetes (6) | `k8s-why-architecture`, `k8s-workloads`, `k8s-networking-services`, `k8s-config-probes`, `k8s-security`, `k8s-troubleshooting` |
| CSS / responsive (4) | `css-fundamentals`, `css-flexbox`, `css-grid`, `responsive-design` |
| Next.js (4) | `nextjs-foundations`, `nextjs-rendering`, `nextjs-server-client-components`, `nextjs-data-production` |
| Exploitation (4) | `linux-services-systemd`, `linux-ssh-remote`, `deployment-strategies`, `release-incident-recovery` |

**11 des 20 leçons prioritaires du §15 sont hors parcours.** Ce n'est pas un hasard :
elles ont reçu moins d'attention parce qu'elles ne sont sur le chemin de personne. V71
les auditera et les corrigera comme les autres, **sans toucher au mapping des 365
journées**. Une recommandation de rattachement sera formulée au CP15, sans être appliquée.

---

## 18. Principaux risques du sprint

1. **Confondre le signal du §15 avec une note.** `k8s-workloads` le prouve : signal
   maximal, excellent exemple guidé. Parade : le contrat CP1 interdit toute note issue
   d'une sonde.
2. **Épaissir les noyaux catalogués au lieu de les réécrire.** Ajouter du texte à
   `docker-production-hardening` produirait une leçon plus longue et aussi peu
   pédagogique. Parade : la règle du §8 du brief, et `git-fundamentals` comme référence.
3. **Ne pas réellement lire les 128.** C'est la dette que V70 a laissée et la raison
   d'être de V71. Parade : `V71-STATE.md` compte les leçons notées, et CP15 publiera ce
   compte tel quel.
4. **Sondes fausses dans les deux sens.** Trois défauts de sonde ont déjà été trouvés et
   corrigés pendant ce seul CP0 (§6, §8, §9). Parade : chaque correction est documentée
   avec sa preuve, et les deux chiffres sont publiés.
5. **Régression d'invariant sous pression de fin de sprint.** Parade : contrôle des
   invariants à chaque CP, et gel du corpus refixé à chaque commit.

---

## 19. Plan CP1 → CP15

| CP | objet |
|---|---|
| CP1 | contrat académique gelé : ancres objectives 0→5 pour D1→D14, seuils numériques des agrégats, conditions READY |
| CP2 | standard humain (test de Feynman opérationnel) + archétypes pédagogiques + règles anti-template |
| CP3 | **lecture et notation des 128 leçons** + ledger initial complet |
| CP4 | P0+P1 — fondations, systèmes, cloud, Kubernetes |
| CP5 | P0+P1 — frontend, CSS, React, Next.js |
| CP6 | P0+P1 — web, backend, API, SQL, données |
| CP7 | P0+P1 — ML, IA appliquée, LLM, RAG, agents |
| CP8 | P0+P1 — architecture, performance, sécurité, observabilité, incidents |
| CP9 | P0+P1 — carrière, Git, pratiques professionnelles, documentation |
| CP10 | passe transversale pratique, sur les 128 |
| CP11 | corrections, vulgarisation, jargon, prérequis |
| CP12 | validation factuelle et assertions exécutables |
| CP13 | audit aveugle des 32 leçons (graine 20260831) |
| CP14 | tests négatifs, gauntlet, budget de temps pédagogique |
| CP15 | notation finale 128×14, rapport complet, recommandation V72 |

---

## 20. Réponses aux seize questions du brief

**A. Les 128 cours donnent-ils l'impression d'être écrits pour un humain qui apprend ?**
Oui, pour ce que j'ai lu. Les exemples guidés s'adressent à quelqu'un qui ne sait pas
encore, anticipent l'erreur, et nomment l'indice. Le noyau explicatif, lui, s'adresse
parfois à quelqu'un qui sait déjà.

**B. Combien ressemblent encore à une fiche / une doc compressée ?** Environ **10 leçons**
sur le noyau explicatif (§6), concentrées sur Cloud, Kubernetes, Docker et réseau. Aucune
sur l'ensemble de la leçon : l'exemple guidé rattrape à chaque fois.

**C. Combien expliquent pourquoi / comment / quand / quand ne pas / l'erreur fréquente /
comment choisir ?** Les six éléments sont présents dans les exemples guidés lus. La
densité de marqueurs de raisonnement est nulle dans le noyau pour **32 leçons sur 128**
(p25 = 0), ce qui est le vrai chiffre à retenir pour cette question.

**D. Les exemples montrent-ils le raisonnement ou la solution ?** Le raisonnement.
Médiane 822 mots, structurés par décisions, avec fausses pistes et critères de choix.
C'est le point fort du corpus.

**E. Les exercices font-ils produire ?** Oui : **127 P + 1 D sur 128**, zéro leçon en
recall ou explication seule.

**F. Les corrections enseignent-elles le chemin ?** Oui pour ce qui a été lu, médiane
974 mots, avec démarche, fausse piste et généralisation.

**G. Trop de jargon avant explication ?** 0 terme nu mesuré. Mais la vulgarisation faiblit
dans les noyaux catalogués, où la définition suppose le vocabulaire.

**H. Prérequis réalistes ?** Oui. Deux points d'entrée sans amont, ce qui est normal.

**I. Progression de difficulté ?** Non instruit à ce stade — nécessite la lecture des 128.
Traité au CP3 et au CP14.

**J. Connaissance jamais introduite ?** Aucune trouvée dans l'échantillon lu ; à
instruire sur les 128.

**K. Expertise supposée supérieure au niveau ?** Oui, localement, dans les noyaux
catalogués — c'est la même observation que B et G.

**L. Les 4,5 heures sont-elles réalistes ?** La lecture consomme **27 % du budget** en
médiane, ce qui laisse la place. Trois journées de revue dépassent 100 % ; 52 journées
sont sous 15 % et pourraient être sous-remplies.

**M. Des leçons devenues inutilement longues ?** Aucune preuve. La plus longue fait
4 646 mots. À trancher par lecture sur les 7 leçons de plus de 4 000 mots.

**N. Des leçons encore trop courtes ?** Aucune sous 2 369 mots. La question pertinente
n'est plus la longueur totale mais la longueur du **noyau explicatif** : 32 leçons ont un
noyau sous 293 mots.

**O. Titres masqués, les leçons semblent-elles individuelles ou générées ?** Individuelles
sur le fond — les exemples guidés sont distincts et situés. Le **rythme** est en revanche
régulier. Test formel au CP13.

**P. Le corpus apprend-il à raisonner ou à reconnaître des termes ?** À raisonner, dans
les exemples guidés, les pratiques et les corrections. À reconnaître des termes, dans une
dizaine de noyaux explicatifs. **C'est exactement le déséquilibre que V71 doit corriger.**
