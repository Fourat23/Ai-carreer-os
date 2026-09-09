# V72 — CP0. Baseline forensique (lecture seule)

Branche `claude/ai-career-os-saas-phfg49` · HEAD `7c9bcbe` · local == origin · arbre propre ·
aucun stash · aucun serveur résiduel · corpus `7eb88ba5…` · curriculum entier `d4bdb9d2…` ·
128 leçons / 365 journées / 365 corrections.

**Aucune modification n'a été faite pendant ce checkpoint.** Un démon Docker a été démarré
puis arrêté pour mesurer sa disponibilité (§8) ; il ne tourne plus.

---

## 1. Résumé exécutif

V71 s'est arrêté sur `ACADEMIC_QUALITY_READY` en publiant lui-même cinq réserves. V72 devait
commencer par les **re-mesurer** au lieu de les recopier. Sept d'entre elles se confirment,
**quatre sont fausses ou mal calibrées**, et **six faits nouveaux** apparaissent.

**Ce qui change le plus la vision du produit, en trois points.**

**Un — le trou de curriculum est bien plus grand qu'annoncé.** V71 disait « 25 leçons hors
parcours, ce n'est pas un défaut ». C'en est un : le programme **déclare vingt compétences**,
dont **« Cloud / DevOps »**, et **aucune des 365 journées ne porte cette compétence**. Zéro.
De même, le parcours enseigne HTML, le DOM, React, l'accessibilité, les formulaires et
TypeScript — et **n'enseigne jamais CSS**, alors qu'il demande au jour 117 de livrer une
application « avec tous les états soignés ». Next.js : zéro journée, alors que la leçon
elle-même explique que la quasi-totalité des offres « React » attendent un framework.

**Deux — les journées intenables sont onze, pas trois.** V71 ne comptait que la lecture.
En comptant la charge réelle en fourchettes (lecture + exemple guidé + pratique + réflexion),
**11 journées sont infaisables** et **54 sont lourdes**. Surtout : **22 des 52 revues
hebdomadaires (42 %) dépassent leur budget**. Ce n'est pas un accident sur trois journées,
c'est un **défaut systématique de construction des revues**, dont la cause est localisée à la
ligne 120 du générateur.

**Trois — V71 a laissé six défauts factuels dans le texte sans les compter comme défauts.**
L'audit aveugle du CP13 a baissé D1 sur six leçons pour des erreurs réelles — `Java, langage
où l'on ne peut pas passer une fonction` (faux depuis Java 8, 2014), la norme ISO/IEC 14764
citée avec le mauvais terme, une incohérence de comptage interne (5+1+2=8 contre « quatre sur
huit ») — puis **n'a modifié aucun fichier**. Ces défauts sont enregistrés comme des
changements de note, pas comme des défauts ouverts. Le compteur « P2 = 0 » est donc exact au
sens comptable et faux au sens du contenu.

**Ce qui va mieux qu'annoncé.** Le réseau sortant est **revenu** (V71 mesurait HTTP 000 ;
aujourd'hui pypi.org et registry.npmjs.org répondent 200) et le **démon Docker démarre** dans
ce conteneur. La surface non validée opérationnellement est de **10 leçons**, pas 14, et les
leçons cloud ne contiennent **aucune** commande `aws`/`az`/`terraform` — elles sont
conceptuelles, donc rien n'y était à exécuter.

**Et une réserve de V71 était trop absolue.** V71 écrit qu'« aucune relecture indépendante »
n'existe. C'est faux pour une partie : la branche `origin/claude/v71-recovery-cross-validation`
porte une **contre-analyse indépendante** de l'enquête sur les prérequis, faite par une autre
session, sur un autre conteneur, avec d'autres scripts — convergence **6/6**, **4/4**,
**20/22**. Elle ne couvre pas la notation 128 × 14, mais elle n'est pas rien, et V71 ne l'a
pas intégrée.

---

## 2. L'état V71, re-mesuré point par point

| affirmation V71 | re-mesure V72 | verdict |
|---|---|---|
| 128 / 128 leçons lues et notées | 128 fichiers · 128 entrées au ledger · `lu = oui` sur 128 | **confirmé** |
| moyenne 4,9364 · D14 4,734 | recalculé : **4,9364** · D14 **4,734** · 1 792 cases (1 679 à 5, 112 à 4, 1 à 3) | **confirmé** |
| P0 = P1 = P2 = 0 | vrai au ledger — **mais 6 défauts factuels D1 restent dans le texte**, jamais convertis en défauts ouverts | **incomplet** |
| 33 leçons à ouverture redondante | 33 leçons à D14 < 5, **mais au moins 3 le sont pour des redites dans le CORPS**, pas dans l'ouverture | **imprécis** |
| 3 journées de revue intenables | **11 journées infaisables**, dont 10 revues ; **22 des 52 revues** dépassent leur budget | **fortement sous-estimé** |
| 25 leçons hors parcours, « pas un défaut » | 25 confirmées — **et la compétence déclarée « Cloud / DevOps » n'a aucune journée** | **sous-estimé** |
| ~14 leçons non vérifiées opérationnellement | **10 leçons** portent des commandes non exécutables ici ; 0 commande cloud dans tout le corpus | **surestimé** |
| `readingMinutes` périmés | **314 / 365** journées, +1 369 min cumulées | **confirmé** |
| `depth-check` promet plus qu'il ne vérifie | confirmé : pour les leçons, 4 contrôles (≥ 350 mots, ≥ 6 sections, mot « exercice », mot « vocabulaire ») | **confirmé** |
| aucun test d'apprentissage humain | confirmé — **mais le produit contient déjà 151 items d'évaluation taxonomés** (§9) | **confirmé, à nuancer** |
| aucune relecture indépendante | **faux en partie** : contre-analyse indépendante des prérequis sur la branche de handoff | **à corriger** |
| réseau sortant indisponible | **faux aujourd'hui** : pypi 200, npm 200, docker registry joignable | **changé** |

---

## 3. Redondances éditoriales — les 33 leçons

**Méthode.** Détection **phrase à phrase** (Jaccard ≥ 0,30 sur les mots porteurs) entre les
quatre sections d'ouverture, puis lecture. Le pourcentage donné est la part de l'ouverture
occupée par les phrases dupliquées.

**Classement préliminaire** (les critères seront gelés au CP1) :

| classe | définition | n |
|---|---|---|
| **R0** | aucune correction nécessaire | **2** |
| **R1** | redondance légère, souvent utile (un écho d'ancrage) | **8** |
| **R2** | redondance éditoriale réelle : une section ou un bloc supprimable sans perte | **18** |
| **R3** | répétition qui **gêne** : même idée 3 fois, ou formulations concurrentes | **5** |

### R3 — cinq cas

| leçon | part | ce qui se répète |
|---|---|---|
| `neural-networks` | **42 %** | la métaphore boutons / note / gradient est développée **intégralement deux fois** |
| `readme-documentation` | **35 %** | le « problème d'abord » contient déjà le modèle mental ; l'objectif recopie les 90 %, le 30 s / 5 min et « décide si ton code sera regardé » |
| `react-fundamentals` | 0 % littéral | le basculement déclaratif énoncé **trois fois sous trois formulations concurrentes** — le lecteur ne sait pas laquelle retenir |
| `transformers` | 10 % | « le sens vient du contexte » illustré par **trois images successives** |
| `design-patterns-intro` | 10 % | **deux répétitions dont une dans le corps** : « Le bon état d'esprit » redit mot pour mot le modèle mental |

### R2 — dix-huit cas

`cloud-azure-core` (25 %) · `system-design-interview` (27 %) · `technical-storytelling` (26 %) ·
`monitoring-production` (24 %) · `k8s-security` (18 %) · `docker-containers` (17 %) ·
`iac-fundamentals` (17 %) · `k8s-networking-services` (14 %) · `interview-preparation` (13 %) ·
`observability-logging` (13 %) · `deployment-secrets` (11 %) · `api-design-basics` (10 %) ·
`ci-cd` (9 %) · `linux-resources-io` · `portfolio-github` ·
`nextjs-server-client-components` · **`git-fundamentals`** · **`technical-debt`**.

Les deux derniers sont importants pour la méthode : **leur redite est dans le corps, pas dans
l'ouverture**. `git-fundamentals` répète littéralement son modèle mental dans « Les photos
chaînées en détail », même parenthèse. `technical-debt` redit son modèle mental dans
« Principal et intérêt ». **La formule « 33 leçons à ouverture redondante » de V71 est donc
inexacte** : le motif est plus large que les ouvertures.

### R1 — huit cas, et R0 — deux cas

R1 : `ai-evaluation` · `llm-cost-optimization` · `etl-pipelines` · `database-modeling` ·
`python-foundations` · `machine-learning-basics` · `nextjs-foundations` · `feature-engineering`.
Une seule formule reprise, souvent en position d'encadrement (ouverture / clôture) — un écho
d'ancrage défendable.

R0 : `react-application-states` (aucune redite ; sa note D14 accompagnait en réalité une
**incohérence de comptage**, qui est le vrai défaut) et `distributed-systems-failures`
(« le réseau n'est pas fiable » revient une fois : c'est la thèse de la leçon).

---

## 4. Santé des 365 journées

**Méthode.** La lecture se **mesure** (formule du projet : mots / 150 + lignes de code / 20,
sur la journée + les leçons liées + la correction). La pratique s'**estime en fourchette** à
partir de la consigne : difficulté annoncée (base), nombre d'étapes de la consigne
(+8 à +15 min chacune au-delà de trois), minutage explicite quand il existe (il fait alors
foi). Aucune estimation à la minute près n'est produite.

| catégorie | définition | n |
|---|---|---|
| **IMPOSSIBLE** | la **borne basse** dépasse le budget | **11** |
| **HEAVY** | la borne haute dépasse le budget | **54** |
| **BALANCED** | la fourchette tient dans le budget | **261** |
| **UNDERLOADED** | la borne haute est sous 55 % du budget | **39** |

Toutes les journées annoncent le **même budget : 4 h 30**. Difficulté : 4 journées en 1,
68 en 2, 280 en 3, 13 en 4.

**Les revues concentrent le problème.**

| | IMPOSSIBLE | HEAVY | BALANCED | UNDERLOADED |
|---|---|---|---|---|
| 52 revues | **10** | 12 | 29 | 1 |
| 313 journées normales | 1 | 42 | 232 | 38 |

**22 revues sur 52 (42 %) dépassent leur budget.** Une seule journée normale est infaisable
(j320, « DocSense : dockerisation », 9 leçons liées).

**Les 39 journées sous-chargées ne sont pas un défaut symétrique** : V71 avait déjà vérifié
que 48 journées à faible lecture portent toutes livrable, correction, checklist et critères.
La borne haute y reste sous 55 % du budget parce que la pratique y est courte, pas absente.

**Un artefact de mon estimateur, publié plutôt que caché** : j357 a été classé IMPOSSIBLE à
tort. Son « test pratique » est explicitement **hebdomadaire** (« chaque jour : 2 exercices…
fin de semaine : simulation complète »), et mon estimateur l'a compté comme une journée. C'est
le **seul** cas sur 52 : les 51 autres revues ont un test pratique de portée journalière.

---

## 5. j70 / j77 / j84 — et la cause commune

| | j70 | j77 | j84 |
|---|---|---|---|
| semaine | 10 | **11** | 12 |
| thème annoncé | REST design, Node.js, premiers serveurs | **Express complet : middlewares, erreurs, validation, structure** | SQL : SELECT, JOIN, agrégats ; SQLite |
| leçons listées « à relire » | 12 | **20** | 15 |
| lecture seule | 283 min | **464 min** | 347 min |
| test pratique minuté | 75 min | 75 min | 75 min |
| charge totale estimée | 358–388 min | **539–569 min** | 422–452 min |
| budget | 270 min | 270 min | 270 min |
| dépassement | ×1,3 | **×2,0** | ×1,6 |

**Le jour 77 en détail.** La journée contient un bilan, un test pratique chronométré à 75 min,
un test théorique, un mini-projet livrable, une checklist, des critères de passage, un exercice
de réflexion architecturale — puis « **Leçons de fond à relire cette semaine** » suivi de
**vingt leçons**. Ces vingt leçons couvrent le réseau TCP/IP, DNS, HTTP/TLS, l'adressage IP,
le terminal, quatre leçons Linux, deux leçons Git, le README, le storytelling, la documentation
technique, le clean code, l'architecture, la conception d'API, les design patterns et la
compatibilité. **Le thème de la semaine est « Express complet ».**

**La cause, localisée.** `scripts/generate-curriculum.mjs` :

```js
function lessonsOf(day) {
  const base = day.lessonsOverride ?? LESSON_BY_SKILL[day.skill] ?? [];   // ligne 100
  return [...new Set([...base, ...(LESSONS_V67[day.day] ?? [])])];
}
function lessonsDeLaRevue(semaine, joursDeLaSemaine) {                     // ligne 118
  const u = new Set();
  for (const d of joursDeLaSemaine) if (!d.isReview) for (const f of lessonsOf(d)) u.add(f);
  return [...u];
}
```

`LESSON_BY_SKILL[skill]` renvoie **toutes** les leçons d'une compétence, pas celles de la
journée. Une revue hérite donc de **toutes les leçons de toutes les compétences que sa semaine
a touchées**. La semaine 11 touche cinq compétences (`http`, `gitlinux`, `comm`, `se`,
`archi`) → 16 leçons, plus les listes explicites `LESSONS_V67` → 20.

**Le nombre de leçons d'une revue est piloté par le nombre de compétences traversées, pas par
ce qui a été enseigné.** C'est un défaut de génération, réparable proprement.

**Budget disponible pour la relecture** : 270 − 75 (test pratique) − ~40 (théorique, livrable,
checklist, réflexion) ≈ **155 min**, soit **6 à 7 leçons au maximum**. Treize revues dépassent
ce plafond.

---

## 6. Les 25 leçons hors parcours

**Le fait central n'est pas leur nombre.** Le programme déclare vingt compétences dans
`data/program.json`. La répartition réelle des 365 journées par compétence est :

```
jsts=42  rag=42  ml=35  comm=25  autonomy=23  secu=23  llm=21  agents=21  evalia=20
archi=19 python=16 dl=15 se=14 http=13 algo=11 sql=11 gitlinux=7 ds=5 patterns=2
```

Dix-neuf compétences, somme = 365. **`cloud` — « Cloud / DevOps » — a zéro journée.**

Recherche par mot-clé dans les 365 titres : **0** journée Next.js, **0** journée cloud/AWS/Azure,
**0** journée déploiement, **1** journée Docker (j320), **1** journée Linux avancé (j72),
**0** journée CSS.

| domaine | leçons hors parcours | classe préliminaire |
|---|---|---|
| **Cloud (6)** | `cloud-fundamentals`, `cloud-compute-storage` | **A** — compétence déclarée, aucune journée |
| | `cloud-networking`, `cloud-aws-core`, `cloud-finops` | **B** |
| | `cloud-azure-core` | **C** |
| **Kubernetes (6)** | `k8s-why-architecture` | **B** |
| | `k8s-workloads`, `k8s-networking-services`, `k8s-security`, `k8s-config-probes`, `k8s-troubleshooting` | **C** |
| **Next.js (4)** | `nextjs-foundations` | **A** — le parcours enseigne React et jamais un framework |
| | `nextjs-rendering`, `nextjs-server-client-components`, `nextjs-data-production` | **B** |
| **CSS (3) + responsive** | `css-fundamentals`, `css-flexbox` | **A** — voir ci-dessous |
| | `css-grid`, `responsive-design` | **B** |
| **Linux / livraison (5)** | `deployment-strategies`, `release-incident-recovery` | **B** |
| | `linux-services-systemd`, `linux-ssh-remote` | **B** |
| | `iac-fundamentals` | **C** |

**Le cas CSS est le plus net.** Le parcours frontend enseigne, **dans les 365 jours** :
`html-semantic-structure`, `browser-dom-rendering`, `react-fundamentals`, `react-hooks-effects`,
`react-application-states`, `react-composition-architecture`, `react-accessibility`,
`web-forms-validation`, `frontend-performance`, `frontend-testing`, `typescript-basics`,
`typescript-frontend`. Il n'enseigne **jamais** `css-fundamentals`, `css-flexbox`, `css-grid`
ni `responsive-design`. Et il demande au jour 92 « une UI décomposée en 5+ composants typés »,
au jour 117 « BiblioApp : tous les états soignés ». **On enseigne l'accessibilité d'une page
qu'on n'a jamais appris à mettre en forme.**

**CP0 ne décide pas.** Les critères d'intégration seront gelés au CP1 et appliqués au CP7. Le
principe est écrit dans le brief et je le retiens : ne pas chercher à ramener 25 à 0 ; une
bibliothèque de référence est légitime ; mais une compétence **annoncée** ne peut pas vivre
uniquement dans la bibliothèque.

---

## 7. Asymétrie des pratiques entre domaines

| domaine | n | mots de pratique min / médiane / max | parties A–E ≥ 3 | critère de réussite | verbe de production ou livrable |
|---|---:|---|---|---|---|
| Systèmes | 29 | 61 / 263 / 739 | 27/29 | 24/29 | **29/29** |
| Fondations | 25 | 46 / 241 / 986 | 10/25 | 21/25 | **23/25** |
| Données & ML | 14 | 49 / 267 / 836 | 5/14 | 11/14 | **14/14** |
| IA appliquée | 13 | 54 / 302 / 547 | 3/13 | 12/13 | **13/13** |
| Frontend | 11 | 228 / **507** / 1021 | 0/11 | 11/11 | **11/11** |
| Web & Backend | 10 | 47 / **220** / 284 | 3/10 | 8/10 | **7/10** |
| Frontend hors parcours | 8 | 248 / 480 / 582 | 0/8 | 8/8 | **8/8** |
| Cloud | 7 | 234 / 252 / 330 | 0/7 | **7/7** | **7/7** |
| Kubernetes | 6 | 218 / 296 / 335 | 0/6 | **6/6** | **6/6** |
| Carrière | 5 | 55 / 405 / 449 | 4/5 | 3/5 | **5/5** |

**La différence de longueur est réelle** — médiane 507 mots en frontend contre 220 en web /
backend — **mais elle ne mesure pas la qualité**. Le critère qui compte est : *l'apprenant
sait-il ce qu'il doit produire ?* Sur ce critère, **123 leçons sur 128** nomment soit un
livrable, soit un verbe de production avec son objet.

**Les 5 restantes**, vérifiées par lecture :

| leçon | contenu réel de la section Pratique | verdict |
|---|---|---|
| `api-design-basics` | « Conçois sur papier le contrat complet d'une API de blog : endpoints, verbes, statuts…, puis fais-le critiquer » | **faux positif de ma sonde** — la consigne est précise |
| `api-production-contracts` | renvoi vers 5 exercices de plateforme + auto-évaluation | renvoi, pas de livrable propre |
| `async-messaging-queues` | renvoi vers 2 exercices + playbook + auto-évaluation | renvoi |
| `system-design-scaling` | renvoi vers 5 exercices + auto-évaluation | renvoi |
| `distributed-systems-failures` | renvoi vers 4 exercices + auto-évaluation | renvoi (déjà D8 = 4 / D12 = 4 au V71) |

**Ma première sonde en signalait 25.** La lecture de deux d'entre elles (`recursion` :
« Écris `compterFeuilles(structure)`… chronomètre `fib(35)` avant et après, et note les deux
chiffres » ; `testing-foundations` : « Écris 6 tests… puis sabote la fonction de 3 façons ») a
montré des consignes excellentes que ma liste de mots-clés ne reconnaissait pas. C'est la
**huitième occurrence** du défaut méthodologique documenté par V71 — mesurer un marqueur au
lieu de l'exigence — et cette fois elle a été attrapée avant publication.

**Deux références mortes trouvées au passage** : `api-production-contracts` cite l'exercice
`api-idempotency` et `async-messaging-queues` cite `dlq-duplicate` — **aucun des deux
n'existe** dans les 376 exercices ni dans les 132 autres identifiants du dépôt. Aucun gate ne
les voit : les gates vérifient les catalogues, pas la prose des leçons.

---

## 8. Validation opérationnelle — l'état réel de l'environnement

**Ce qui a changé depuis V71.**

| | V71 | V72 CP0 |
|---|---|---|
| réseau sortant | HTTP 000 | **pypi.org 200 · registry.npmjs.org 200 · registry Docker joignable** |
| démon Docker | inactif | **démarre** (`dockerd --iptables=false --bridge=none`, Server 29.3.1, overlayfs) |
| tirage d'images | — | **échoue** : le CDN de blobs (`production.cloudfront.docker.com`) répond `Forbidden` |
| `kubectl` | absent | **absent** |
| systemd | ne tourne pas (PID 1 = `process_api`) | **idem** |
| `ssh`, `ssh-keygen` | absents | **absents** |
| `aws`, `az`, `terraform`, `psql` (serveur) | absents | **absents** |

**Inventaire réel des commandes du corpus**, comptées dans les blocs de code :

| technologie | leçons | commandes | exécutable ici ? |
|---|---:|---:|---|
| shell POSIX | 10 | 32 | **oui** |
| git | 4 | 14 | **oui** |
| npm / node | 3 | 6 | **oui** |
| python | 1 | 2 | **oui** |
| docker | 5 | 22 | démon oui, images **non** |
| kubectl | 3 | 15 | **non** |
| systemd | 1 | 9 | **non** |
| ssh | 1 | 5 | **non** |
| aws / az / terraform / psql | **0** | **0** | sans objet |
| blocs YAML | 9 | 19 blocs | **oui, statiquement** |

**Conséquence.** La surface réellement non vérifiable est de **10 leçons** (5 Docker, 3 k8s,
systemd, ssh), pas 14 — et les six leçons cloud ne contenaient **aucune commande** à exécuter :
elles sont conceptuelles. Les **19 blocs YAML** (k8s, CI, docker-compose) sont validables
statiquement dès maintenant (`yq` est présent, PyYAML 6.0.1 aussi). C'est la stratégie du CP10.

---

## 9. Ce qui existe déjà pour mesurer l'apprentissage

V71 concluait « aucun test d'apprentissage humain ». C'est exact, mais le produit n'est pas
vide pour autant :

| dispositif | volume | ce qu'il porte |
|---|---:|---|
| diagnostics (`data/assessments/`) | 16 fichiers, **83 questions** | `taxonomy` par question, `passThreshold`, `remediation`, `lessonRefs`, `simulationNote` |
| défis de transfert (`data/transfer-challenges/`) | 25 fichiers, **68 questions** | `transferLevel` (23 en T5, 2 en T4), `bridge`, `crossDomain`, `targetContext` |
| exercices déterministes | **376** | |
| missions | 42 · capstones 13 · playbooks 45 · tâches terminal 3 | |

**La taxonomie existe déjà et elle est bonne** :
`RECALL` (16) · `UNDERSTANDING` (25) · `APPLICATION` (9) · `DIAGNOSIS` (17) · `TRANSFER` (16).
Formats : QCM (63), choix multiple (16), **prédiction** (4) côté diagnostics ; 32 / 24 / 12 côté
transfert.

**La couverture, elle, est partielle : 57 leçons sur 128** sont référencées par un diagnostic
ou un défi de transfert. **71 ne le sont pas** — dont l'intégralité des blocs cloud, Kubernetes,
CSS et Docker.

Le protocole du CP4 n'aura donc pas à inventer une taxonomie : il devra **réutiliser celle du
produit** et la compléter par ce qui manque (explication libre, misconception, rappel différé).
Le mot « misconception » n'apparaît dans aucun fichier de `data/` — seulement dans des scripts
de gate.

---

## 10. Ce qui exige une décision (et que CP0 ne tranche pas)

1. **La compétence « Cloud / DevOps » est-elle promise ?** Si oui, elle doit avoir des
   journées. Si non, il faut la retirer des vingt compétences déclarées. Le statu quo — une
   compétence affichée, quinze leçons écrites, zéro journée — n'est pas tenable.
2. **CSS doit-il entrer dans le parcours frontend ?** Le parcours demande des livrables d'UI
   sans jamais enseigner la mise en forme.
3. **Next.js : socle ou approfondissement ?** La leçon affirme que les offres « React »
   attendent un framework ; le parcours ne le donne pas.
4. **Que devient le budget des revues ?** Deux voies exclusives : réduire la liste de leçons à
   relire, ou augmenter le budget des journées de revue. La première est réversible et locale,
   la seconde touche l'annonce des 4 h 30 sur les 365 journées.
5. **Convention A / B des prérequis.** `docs/v71/PREREQUIS-ORDRE.md` emploie A = correct /
   B = défaut ; le handoff de contre-validation affirme que la convention officielle est
   l'inverse. À déclarer une fois pour toutes au CP1.

---

## 11. Ce que V72 peut corriger sans décision produit

- les 23 cas R2 et R3 de redondance éditoriale (CP2) ;
- les six défauts factuels laissés ouverts par V71 (Java 8, ISO/IEC 14764, comptage interne
  de `react-application-states`, deux chiffres non sourcés, la liste des falsy) ;
- les deux références d'exercice mortes ;
- la liste de leçons des 22 revues en dépassement (CP6), à budget constant ;
- les quatre sections « Pratique » qui ne sont qu'un renvoi (CP9) ;
- la validation statique des 19 blocs YAML et l'exécution des commandes shell / git / node /
  python (CP10) ;
- la régénération des `readingMinutes` (CP11) ;
- le message et la couverture de `curriculum:depth-check` (CP12).

## 12. Ce que V72 ne doit PAS toucher

- `data/progress.json` et tout état utilisateur ;
- l'ordre des 365 jours (`days[i].day === i+1`) ;
- le barème V71 et ses ancres — ils sont gelés et V72 ne renote pas 128 × 14 ;
- l'interface, le système de design, les moteurs Learning / Retention ;
- le corpus des leçons hors des cas listés au §11 : **on ne réécrit pas de bonnes leçons sans
  défaut démontré.**

## 13. Plan CP1 → CP15

| CP | objet | livrable |
|---|---|---|
| CP1 | contrat V72 gelé : critères R0–R3, seuils de charge, règle d'intégration hors-parcours, critères de mapping, protocole de validation simulée, niveaux de validation opérationnelle, définition des deux verdicts | `docs/v72/V72-CONTRACT-FROZEN.md` |
| CP2 | corriger R2 et R3 (23 cas) | leçons + rapport |
| CP3 | variété éditoriale : motifs mécaniques transverses | rapport |
| CP4 | protocole **SIMULATED LEARNER VALIDATION** | `docs/v72/V72-SLV-PROTOCOL.md` |
| CP5 | échantillon stratifié de 24 leçons (graine publiée), passage AVANT | `docs/v72/V72-SLV-BEFORE.json` |
| CP6 | reconstruction des revues en dépassement | générateur + journées |
| CP7 | décision sur les 25 hors-parcours, insertions sûres | rapport + mapping |
| CP8 | audit Cloud / K8s / Next / CSS / Linux : promesses contre contenu | rapport |
| CP9 | normalisation du **niveau d'exigence** des pratiques (pas du style) | leçons |
| CP10 | validation opérationnelle par niveaux 1 à 4 | scripts + rapport |
| CP11 | régénération contrôlée de `readingMinutes` | `data/program.json` |
| CP12 | honnêteté du gate de profondeur + tests négatifs | script + gate |
| CP13 | passage APRÈS de l'échantillon, comparaison | `docs/v72/V72-SLV-AFTER.json` |
| CP14 | parcours séquentiel des 365 jours + tests négatifs des nouveaux invariants | rapport |
| CP15 | rapport final, deux verdicts séparés | `docs/audits/V72-FINAL-REPORT.md` |
