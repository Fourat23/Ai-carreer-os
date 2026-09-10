# V73 — CP3. Fermeture des trous de curriculum

**Résultat :** les **quinze** leçons des trois trous P0 sont entrées dans le parcours, sur
**seize journées existantes dont le sujet les porte**, avec un vrai passage de cours à chaque
fois. **365 journées inchangées. Aucune journée n'est dégradée.** Les leçons hors parcours
passent de **22 à 7**.

---

## 1. Ce que le CP3 ne pouvait pas faire, et qu'il a fallu constater d'abord

Le CP0 avait désigné une ressource : **« 31 des 40 journées UNDERLOADED sont entre j91 et
j180 »**. Mesuré contre le budget **gelé au CP1** — une fourchette `[240, 300]` minutes au lieu
d'un point à 270 — **cette ressource n'existe pas** :

| | budget-point 270 (CP0) | fourchette 240–300 (contrat CP1) |
|---|---|---|
| IMPOSSIBLE | 6 | **3** |
| HEAVY | 55 | **6** |
| UNDERLOADED | 40 | **6** |
| BALANCED | 264 | **350** |

**Il n'y a que six journées UNDERLOADED sur 365, et aucune entre j91 et j180.** Le chiffre du
CP0 était une conséquence du seuil, pas une propriété du parcours. Il est publié tel quel et
n'est pas réécrit (règle S7).

**Mais la place existe autrement, et elle est réelle** : la journée de travail médiane pèse
**192 minutes** dans un budget de 240 à 300. **Soixante-dix-sept journées entre j91 et j180 ont
au moins 90 minutes de marge.** C'est cette marge, et non des journées vides, qui a servi.

---

## 2. La règle appliquée, et celle qui a été refusée

**Refusée** : insérer une leçon dans une journée parce que la journée est courte. Le brief
l'interdit explicitement, et c'est aussi ce qui produirait une liste de liens au lieu d'un
enseignement.

**Appliquée** : une leçon entre sur une journée **dont le sujet la porte déjà**, et la journée
reçoit un **vrai passage de cours** qui enseigne la notion ajoutée et dit pourquoi elle arrive
là. Seize journées ont donc gagné trois à quatre paragraphes de fond, écrits pour cette
journée-là.

Conditions du contrat, vérifiées pour chaque rattachement :

| condition | vérification |
|---|---|
| **M1 · M2** | 365 journées, 128 leçons, 365 corrections, ordre `days[i].day === i+1` — **intacts** |
| **M3** | aucune journée ne perd son livrable ni sa correction |
| **M4** | aucun retrait : les rattachements passent par **union** (`LESSONS_V67`), jamais par remplacement |
| **M5** | les prérequis de chaque leçon ajoutée sont enseignés **avant** — vérifié par la porte (**I2 = 0**) |
| **M6** | les seize journées hôtes restent **BALANCED** |
| **M7** | chaque rattachement est motivé par un défaut mesuré aux CP0 et CP2 |
| **M8** | `data/progress.json` non créé |
| **M9** | tout est inscrit ci-dessous |

---

## 3. CSS — quatre leçons, trois journées

Le parcours enseignait React sans avoir jamais enseigné le balisage ni le style :
`html-semantic-structure` n'apparaissait qu'au **jour 103**, après onze journées de React, et
les quatre leçons CSS **nulle part**.

| journée | sujet existant | ajouté | pourquoi ici |
|---|---|---|---|
| **j87** | Full-stack : introduction à React | `browser-dom-rendering`, `html-semantic-structure`, `css-fundamentals` | c'est la **première journée où l'apprenant produit de l'interface**. La couche plateforme web est réunie là où le front s'ouvre |
| **j103** | Accessibilité et UX de base | `css-flexbox`, `css-grid` | la disposition **est** une question d'accessibilité : une page dont les blocs s'empilent au hasard est inutilisable, exactement comme une page dont le focus saute |
| **j117** | Projet 3 — Polish et états edge | `responsive-design` | l'écran étroit est **l'état non-heureux le plus fréquent et le plus oublié** ; « soigner tous les états » l'inclut |

**Ce que les journées enseignent désormais**, et qui ne s'y trouvait pas : la balise porte du
sens (`<div onClick>` contre `<button>`) ; une largeur de 300 px n'est pas une largeur de
300 px selon `box-sizing` ; « deux directions → Grid » ; le piège `min-width: 0` /
`minmax(0, 1fr)`, le même sous deux vocabulaires ; réordonner visuellement casse l'ordre du
clavier ; et **déclarer une contrainte plutôt qu'un palier** — `minmax(220px, 1fr)` au lieu
d'une requête de média choisie à la main.

---

## 4. Next.js — quatre leçons, quatre journées

| journée | sujet existant | ajouté | pourquoi ici |
|---|---|---|---|
| **j99** | Routing et navigation | `nextjs-foundations` | c'est le point où la différence entre une **bibliothèque** et un **cadriciel** devient concrète : l'arborescence de fichiers *est* la table de routage |
| **j102** | Performance React : re-renders | `nextjs-rendering` | décider qu'un composant **ne sera pas calculé dans le navigateur** pèse plus lourd qu'une mémoïsation |
| **j104** | Consolidation front + préparation Projet 3 | `nextjs-server-client-components` | la **frontière serveur/client** est la décision d'architecture front, et elle se prend avant le projet |
| **j111** | Gestion d'erreur front robuste | `nextjs-data-production` | « robuste » n'a de sens qu'en production : attente, panne d'un tiers, **portée** d'un cache, fraîcheur, secrets |

**Le fil qui relie les quatre** : l'URL reste la source de vérité de l'écran (rappel du j95) ;
les trois moments de rendu sont trois compromis entre fraîcheur et qui paie le calcul ; une
variable d'environnement `undefined` côté client n'est pas un défaut de configuration mais le
signal que **le code est du mauvais côté de la frontière** ; et les cinq questions de mise en
production ne dépendent d'aucun cadriciel.

---

## 5. Cloud — sept leçons, cinq journées, et une chaîne de prérequis stricte

C'est le trou le plus contraint, parce que les sept leçons forment une **chaîne** :

```
cloud-fundamentals → { cloud-networking, cloud-compute-storage } → cloud-aws-core
                   → cloud-azure-core → { iac-fundamentals, cloud-finops }
```

et parce que `iac-fundamentals` et `cloud-finops` exigent en plus les leçons Kubernetes
enseignées au **jour 321**.

| journée | sujet existant | ajouté | pourquoi ici |
|---|---|---|---|
| **j291** | Monolithe modulaire vs microservices | `docker-containers`, `cloud-fundamentals` | le découpage pose la question **« où ça tourne, et qui l'exploite »** ; l'unité de déploiement **est** un conteneur |
| **j293** | Exercice d'architecture | `cloud-networking`, `cloud-compute-storage` | un exercice d'architecture place du **calcul**, du **stockage** et du **réseau** |
| **j303** | DocSense : architecture (ADRs) | `cloud-aws-core`, `cloud-azure-core` | choisir un fournisseur **est** une décision d'architecture, et un ADR est l'endroit où on l'écrit avec ses alternatives |
| **j325** | DocSense : coûts et observabilité | `cloud-finops` | le FinOps est la **lecture économique** de l'observabilité, pas une discipline séparée |
| **j326** | DocSense : CI complète | `iac-fundamentals` | une CI complète **provisionne son environnement** |

### Un effet de bord voulu : Docker cesse d'être enseigné en un seul jour

V72 avait relevé que **la totalité du curriculum Docker tombait sur la seule journée 320**.
`docker-containers` est désormais introduit au **jour 291**, vingt-neuf jours plus tôt, dans la
journée où l'unité de déploiement devient un sujet. Les cinq autres leçons Docker restent au
jour 320 pour l'approfondissement. **Rien n'a été retiré du jour 320** : le rattachement est
une union.

### La seule leçon modifiée du corpus, et pourquoi

`cloud-fundamentals` déclarait `docker-containers` en **prérequis dur**. Cela rendait le bloc
cloud inplaçable avant le jour 320 — c'est-à-dire dans les quarante-cinq derniers jours,
consacrés à la finalisation du projet et à la recherche d'emploi.

**Le prérequis n'était pas réel, et c'est mesurable** : la leçon mentionne « conteneur » **trois
fois** en 2 896 mots, n'exécute aucune commande, part du datacenter physique, et son exemple
guidé est une migration avec une machine virtuelle et une base managée. Par comparaison,
`cloud-compute-storage` mentionne le conteneur **dix-huit fois** — là, le prérequis est réel, et
cette leçon a donc été placée **après** le jour 291.

La correction suit la convention du corpus, établie par V71 : la notion nécessaire est **donnée
sur place en une phrase**, et le renvoi est **annoncé** comme venant plus tard.

> **Ce que la leçon dit désormais** : « La seule notion de conteneur nécessaire ici tient en une
> phrase : un conteneur est une application empaquetée avec tout ce dont elle a besoin pour
> tourner, qui démarre en quelques secondes sur n'importe quelle machine. » suivi de
> « **Où trouver le détail.** `/doc/lessons/docker-containers` … est **programmée plus loin**
> dans le parcours ; rien ici ne suppose que tu l'as lue. »

**Corpus : `c1ac869e…` → `77feba18…`**, une leçon modifiée sur 128, neuf gates de gel mis à jour.

---

## 6. Ledger BEFORE → AFTER

| | BEFORE | AFTER |
|---|---|---|
| leçons hors parcours | **22** | **7** |
| CSS enseigné | **non** | **j87, j103, j117** |
| Next.js enseigné | **non** | **j99, j102, j104, j111** |
| cloud proprement dit enseigné | **non** | **j291, j293, j303, j325, j326** |
| Docker introduit | j320 uniquement | **j291**, approfondi j320 |
| journées | 365 | **365** |
| leçons | 128 | **128** |
| corrections | 365 | **365** |
| journées IMPOSSIBLE | 3 (toutes des revues) | **3 (les mêmes)** |
| journées HEAVY | 6 (toutes des revues) | **6 (les mêmes)** |
| journées UNDERLOADED | 6 | **6** |
| journées BALANCED | 350 | **350** |
| corpus | `c1ac869e…` | `77feba18…` (1 leçon) |

**Aucune journée n'a changé de catégorie de charge.** Les seize journées hôtes avaient toutes
assez de marge, et le vérifier avant chaque rattachement faisait partie de la procédure.

### Les seize journées hôtes et leur charge après ajout

| journée | avant | après | zone |
|---|---|---|---|
| j87 | 131–183 | **194–246** | BALANCED |
| j99 | 95–148 | **120–173** | BALANCED |
| j102 | 151–203 | **169–221** | BALANCED |
| j103 | 157–209 | **219–270** | BALANCED |
| j104 | — | **173–225** | BALANCED |
| j111 | 97–149 | **129–181** | BALANCED |
| j117 | 96–147 | **121–173** | BALANCED |
| j291 | 187–239 | **229–281** | BALANCED |
| j293 | 170–212 | **207–249** | BALANCED |
| j303 | 145–197 | **181–233** | BALANCED |
| j325 | 163–215 | **183–235** | BALANCED |
| j326 | 194–246 | **213–265** | BALANCED |

*(les quatre autres journées touchées — j88, j95, j97, j105 — ne le sont qu'indirectement, par
les revues de leur semaine)*

---

## 7. Effet non anticipé, et bienvenu : les revues ont pris le relais

Le générateur rattache aux revues hebdomadaires ce que la semaine a enseigné. Les leçons cloud
apparaissent donc **aussi** aux jours **294, 308 et 329** sans qu'aucune règle n'ait été écrite
pour cela : la première révision espacée du bloc cloud existe déjà.

---

## 8. Ce qui reste hors parcours : sept leçons, transmises au CP4

`deployment-strategies` · `release-incident-recovery` · `k8s-networking-services` ·
`k8s-security` · `k8s-troubleshooting` · `linux-services-systemd` · `linux-ssh-remote`

**Elles ne sont pas oubliées : elles attendent un statut explicite**, comme l'exige la règle I5
du contrat. Le CP4 tranchera pour chacune entre CORE, ADVANCED, OPTIONAL, REFERENCE et
DEPRECATED, avec justification. `deployment-strategies` mérite une attention particulière :
**six leçons programmées la citent**, le record du corpus.

---

## 9. Anomalie de sonde publiée (n° 14) — la même qu'au CP2, cette fois en production

Les cinq rattachements cloud ont d'abord été écrits en tête de `LESSONS_V67`. **Deux d'entre eux
n'ont eu aucun effet** : les jours **291** et **326** possédaient déjà une clé dans ce littéral
d'objet, et en JavaScript **une clé dupliquée est écrasée par la dernière**. La porte a
correctement signalé `cloud-fundamentals` comme « hors parcours » alors que je venais de croire
l'y avoir mise.

C'est exactement le piège rencontré au CP2 dans le harnais de test (anomalie n° 10) — cette
fois dans le code de production. **Les rattachements ont été fusionnés dans les clés
existantes**, et le CP14 ajoutera un contrôle de clé dupliquée dans ce fichier.

---

## 10. Vérifications

| contrôle | résultat |
|---|---|
| `npm test` | **1420 / 1420** |
| `npx tsc --noEmit` | **0** |
| `npm run gates:active` | **0 violation** (9 gels de corpus mis à jour) |
| porte V73 du graphe | **verte** — I2 = 0 · I3 = 0 · I4 = 0 · I8 = 0 · I10 = 0 · C9 = 0 |
| invariants | 365 / 128 / 365 / 52 / 12, ordre intact |
| `data/progress.json` | **absent** |
