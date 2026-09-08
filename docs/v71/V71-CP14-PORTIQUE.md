# V71 — CP14. Portique technique, invariants pédagogiques, budget-temps, tests négatifs

**Ce que ce checkpoint devait faire.** Vérifier que rien n'a été cassé par les corrections des
CP4 à CP13 ; vérifier les invariants pédagogiques ; regarder si les journées tiennent dans leur
budget ; et — le vrai morceau — **prouver que les gates détectent réellement ce qu'ils
prétendent détecter**, en leur soumettant leur propre défaut.

**Résultat en une ligne.** Le portique technique est intégralement vert. Les 14 tests négatifs
passent. Et l'analyse du budget-temps a trouvé **trois journées de revue qui ne sont pas
tenables comme elles sont écrites** — un défaut réel, hors périmètre de correction V71, publié
ici pour qu'il ne se perde pas.

---

## 1. Portique technique

| Contrôle | Commande | Résultat |
|---|---|---|
| tests unitaires | `npm test` | **1420 / 1420** · 0 échec |
| typage | `npx tsc --noEmit` | **0 erreur** |
| build de production | `npm run build` | **compilé** en 8,5 s |
| portes actives | `npm run gates:active` | **52 / 52 vertes** |
| corpus | `find curriculum/lessons -name '*.md' \| sort \| xargs cat \| sha1sum` | `7eb88ba5…` — identique au gel |
| volumétrie | leçons / journées / corrections | **128 / 365 / 365** |
| ordre des 365 jours | `v5421:check`, contrôle `days[i].day === i+1` | **inchangé** |
| `data/progress.json` | fichier absent du dépôt (ignoré par Git, ligne 8 de `.gitignore`) | **jamais muté — il n'existe pas ici** |
| serveurs résiduels | `ps -eo comm` | **aucun** — 80 processus, tous noyau ou `process_api` ; aucun Node, Next, Python ni serveur |
| arbre de travail | `git status --porcelain` | **propre** |

**Sur `progress.json`, une précision qui compte et qui n'est pas flatteuse.** Le §30 du cahier
des charges interdit d'y toucher. Il n'a pas été touché — mais pas par vertu : **le fichier
n'existe pas dans ce conteneur**, parce que c'est de l'état utilisateur, ignoré par Git. Le
gate `v5421:check` qui prétend le geler à un hash précis (`FROZEN_PROGRESS`) tombe donc dans sa
branche `catch` et émet un **avertissement**, pas une erreur :

```
Avertissements (1) :
  ⚠ [progress] indisponible
```

Autrement dit, « 52 gates verts » recouvre ici **un invariant qui n'a pas pu être vérifié**.
Le gate ne ment pas — il le dit. Mais le compte global le noie. C'est le genre de chose qu'un
rapport final doit porter, et le test négatif n° 14 (§4) montre que le contrôle *fonctionne*
dès que le fichier existe.

### Ce que V71 a ajouté au corpus, en volume

Même compteur des deux côtés (mots hors blocs de code et hors titres), entre le gel CP0
(`1fb8ea6`) et aujourd'hui :

| | |
|---|---|
| corpus au CP0 | 356 296 mots |
| corpus après CP13 | 369 183 mots |
| **delta** | **+12 887 mots, soit +3,6 %** |
| leçons touchées | **68 / 128** |
| moyenne par leçon touchée | +190 mots |
| plus forte hausse | `interview-preparation` +628 (+29 %) |
| plus forte baisse | `javascript-basics` −383 (−13 %) |

Le §7 pose que le volume n'est jamais une métrique de qualité. Ce tableau n'est donc pas un
résultat, c'est un **contrôle de non-dérive** : si V71 avait rempli des leçons pour faire du
chiffre, cela se verrait ici. +3,6 % sur un corpus de 356 000 mots, dont une leçon qui a
*maigri* de 13 %, ne ressemble pas à du remplissage.

---

## 2. Invariants pédagogiques

| Invariant | Mesure | Verdict |
|---|---|---|
| journées sans aucun renvoi vers une leçon | **0** / 365 | OK |
| renvois vers une leçon inexistante | **0** | OK |
| journées sans fichier de correction | **0** / 365 | OK |
| journées sans livrable | 52 → **0 réel** (voir ci-dessous) | OK |
| `premierJour` du ledger vs corpus | 40 renseignés, **40 concordants, 0 divergence** | OK |
| leçons du corpus | 128 | OK |

**Les 52 « journées sans livrable » sont un artefact de ma sonde.** Ce sont exactement les
52 journées de revue hebdomadaire : leur livrable n'est pas dans le champ `deliverable` de
`data/program.json`, il est dans une section « ### Mini-projet / livrable » du fichier
markdown. Aucune journée n'est réellement sans livrable.

### Le fait structurel du CP14 : un cinquième du corpus est hors parcours

**25 leçons sur 128 ne sont citées par aucune des 365 journées.** Elles ne sont atteignables
qu'en consultant la bibliothèque directement.

| domaine | leçons hors parcours |
|---|---|
| Cloud (6) | `cloud-aws-core`, `cloud-azure-core`, `cloud-compute-storage`, `cloud-finops`, `cloud-fundamentals`, `cloud-networking` |
| Kubernetes (6) | `k8s-config-probes`, `k8s-networking-services`, `k8s-security`, `k8s-troubleshooting`, `k8s-why-architecture`, `k8s-workloads` |
| Next.js (4) | `nextjs-data-production`, `nextjs-foundations`, `nextjs-rendering`, `nextjs-server-client-components` |
| CSS (3) | `css-flexbox`, `css-fundamentals`, `css-grid` |
| Linux / livraison (6) | `linux-services-systemd`, `linux-ssh-remote`, `deployment-strategies`, `iac-fundamentals`, `release-incident-recovery`, `responsive-design` |

Ce n'est **pas un défaut** : une étagère de référence est un objet légitime, et le ledger le
reconnaît (ces 25 entrées n'ont ni `premierJour` ni `jours`, contrairement aux 103 autres).
Mais c'est une information que le rapport final doit porter sans l'arrondir :

> **V71 certifie la qualité académique de 128 leçons. 103 sont enseignées par le parcours de
> 365 jours ; 25 ne sont atteignables qu'en naviguant.**

Cela explique aussi, rétrospectivement, le point bas de D13 relevé au CP3 : aucune leçon hors
parcours n'a de contrôle de compréhension distinct, ce qui est cohérent avec un statut de
consultation.

---

## 3. Budget-temps : les journées tiennent-elles ?

Méthode : pour chaque journée, on recalcule les minutes de lecture **sur les fichiers réels
d'aujourd'hui** (fichier du jour + leçons liées + correction) avec la formule du projet
lui-même (`scripts/generate-curriculum.mjs`, ligne 782 : mots / 150 + lignes de code / 20),
et on la compare au budget annoncé (`hours × 60`).

**Ce qu'on cherche n'est pas « est-ce que ça fait 4 h 30 de prose ».** Le §CP14 est explicite :
une journée de 4 h 30 ne doit surtout pas devenir 4 h 30 de lecture. On cherche les deux
anomalies opposées : la lecture qui mange tout le budget, et la lecture si courte que la
journée ne tient que si la pratique est réelle.

### Vue d'ensemble — c'est le bon rapport

| | |
|---|---|
| lecture totale du parcours | **522 h** |
| budget total annoncé | 1 643 h |
| **part de la lecture** | **31,8 %** |

Deux tiers du temps sont pour la pratique. C'est exactement ce que le cahier des charges
demande, et c'est mesuré, pas affirmé.

### Anomalie 1 — trois journées où la lecture seule dépasse le budget

| jour | budget | lecture | part | leçons liées | intitulé |
|---|---|---|---|---|---|
| **77** | 270 min | **464 min** | **172 %** | **20** | Revue hebdomadaire — semaine 11 |
| **84** | 270 min | **347 min** | **129 %** | 15 | Revue hebdomadaire — semaine 12 |
| **70** | 270 min | **283 min** | **105 %** | 12 | Revue hebdomadaire — semaine 10 |

Les trois sont des journées de revue. Le jour 77 est le cas extrême et il est instructif : la
journée annonce 4 h 30, contient un test pratique **minuté à 75 min**, un test théorique, un
mini-projet livrable et un exercice de réflexion — puis une section intitulée
« **Leçons de fond à relire cette semaine** » suivie de **vingt leçons**. Relire ces vingt
leçons, c'est **7 h 44** de lecture seule. **La journée n'est pas faisable telle qu'elle est
écrite.**

Second point, indépendant du premier : le thème de la semaine 11 est « Express complet :
middlewares, erreurs, validation, structure », mais les vingt leçons listées comprennent le
réseau TCP/IP, DNS, TLS, l'adressage IP, quatre leçons Linux, deux leçons Git, le README, le
storytelling, la documentation, le clean code, l'architecture et les design patterns. **La
liste ne correspond pas au thème.** Elle vient de l'union des leçons de la semaine, calculée
par compétence dans le générateur ; cette union a dérivé loin du sujet.

**Non corrigé, et pourquoi.** Réparer cela veut dire changer la liste de leçons attachée à une
journée — c'est-à-dire **le mapping du curriculum**, que le §30 interdit explicitement de
modifier sans décision de curriculum. Le défaut est donc constaté, chiffré, localisé
(`scripts/generate-curriculum.mjs`, fonction `lessonsDeLaRevue`, ligne 800) et **transmis**.

Quatre autres journées sont serrées sans dépasser : j91 (87 %), j105 (84 %), j320 (81 %),
j322 (77 %) — toutes des revues sauf j320.

### Anomalie 2 — 48 journées où la lecture pèse moins de 15 % du budget

Ces journées ne tiennent que si la pratique existe vraiment. Vérification sur les 48 :

| élément | présent |
|---|---|
| livrable nommé | **48 / 48** |
| fichier de correction substantiel (> 200 mots) | **48 / 48** |
| checklist de validation | **48 / 48** |
| critères de passage | **48 / 48** |
| minutage explicite (« 75 min : … ») | **0 / 48** |

Ma sonde a d'abord signalé « 48 journées incomplètes » sur le seul critère du minutage, plus
une (j134) sur un livrable de 20 caractères contre un seuil de 21. **Les 49 signalements sont
des artefacts de ma sonde.** Lecture faite du jour 120 (« Python : syntaxe et structures »,
30 min de lecture pour 4 h 30) : cours complet avec modèle mental et cinq contrastes JS→Python,
exemple guidé avec énoncé, raisonnement pas-à-pas et solution commentée, correction séparée
avec logique attendue, erreurs probables et critères de vérification, et un livrable explicite
(« réécrire 5 exercices JS du mois 1 en Python idiomatique, dans un venv »). Rien ne manque.

C'est la **septième fois** dans ce sprint que je mesure un marqueur structurel au lieu de ce
qui compte. Le motif est constant : je choisis un marqueur observable (ici « la journée
contient-elle un nombre suivi de *min* ? »), il corrèle mal, et seule la lecture tranche.
C'est consigné pour le CP15 comme le défaut méthodologique principal de V71.

### Dérive de l'estimation affichée

`data/program.json` a été généré le 2026-08-30, avant les corrections V71. Ses
`readingMinutes` sont donc périmés sur **314 journées sur 365**, de **+1 369 min** au total
(+4,4 min par journée en moyenne, +16 min au pire). L'écart est petit et va toujours dans le
même sens (le corpus a grossi de 3,6 %).

**Non régénéré, et pourquoi.** Régénérer réécrirait `data/program.json` et les 365 fichiers de
journée, ce qui casserait `FROZEN_PROGRESS` et les gels de neuf gates à deux checkpoints de la
fin d'un sprint dont le sujet est le contenu académique. Le §30 exclut la modification du
mapping ; une régénération n'est pas un changement de mapping, mais elle en produit le diff.
L'écart est mesuré, borné et publié ; il est de la classe « à régénérer au prochain build
normal », pas « à faire dans V71 ».

---

## 4. Tests négatifs — le cœur du CP14

**Le problème.** Cinquante-deux gates sont verts. Un gate vert prouve deux choses très
différentes : soit le dépôt est sain, soit le gate ne regarde rien. « 52 gates verts » ne
permet pas de distinguer les deux.

**La méthode.** Pour chaque gate testé : introduire **le défaut précis que ce gate prétend
détecter**, exécuter le gate, vérifier qu'il rougit, restaurer le fichier, et contrôler la
restauration à l'octet près (`git checkout --`, comparaison des tampons, `git status`
vide). Le script s'arrête net si une restauration échoue — mieux vaut un dépôt bloqué qu'un
dépôt silencieusement modifié.

Script : `scripts/v71/cp14-tests-negatifs.mjs`. Rejouable.

| # | gate | défaut introduit | réaction |
|---|---|---|---|
| 1 | `curriculum:check` | supprimer entièrement une leçon | **rougit** |
| 2 | `curriculum:depth-check` | supprimer toute occurrence du mot « exercice » d'une leçon | **rougit** |
| 3 | `curriculum:depth-check` | réduire une leçon à trois lignes (< 350 mots, < 6 sections) | **rougit** |
| 4 | `curriculum:depth-check` | renommer le titre « Cours approfondi » d'une journée | **rougit** |
| 5 | `curriculum:depth-check` | retirer le titre « Exemple guidé » d'une leçon | **reste vert — lacune documentée, voir ci-dessous** |
| 6 | `glossary:check` | dupliquer une entrée du glossaire | **rougit** |
| 7 | `v48:check` | ajouter **un seul octet** à une leçon | **rougit** |
| 8 | `v47:check` | donner à un exercice l'id d'un autre | **rougit** |
| 9 | `v5421:check` | intervertir deux journées dans l'index du programme | **rougit** |
| 10 | `v52:check` | introduire un littéral de gamification dans l'UI | **rougit** |
| 11 | `v542:check` | écrire une couleur hexadécimale en dur dans un TSX | **rougit** |
| 12 | `v64:check` | injecter du HTML brut issu d'une réponse utilisateur | **rougit** |
| 13 | `v66:render` | échapper une clôture de bloc de code (le bug du CP8) | **rougit** |
| 14 | `v5421:check` | créer une progression utilisateur au mauvais contenu | **rougit** |

**14 tests, 14 conformes, 0 gate invalide.** Corpus vérifié inchangé après la série
(`7eb88ba5…`), dépôt propre, 52 gates re-passés verts.

### La lacune du test n° 5 — et pourquoi ce n'est pas un gate invalide

Retirer le titre « Exemple guidé » d'une leçon laisse `curriculum:depth-check` vert. J'ai
d'abord écrit cela comme un gate invalide. En lisant le gate, c'est faux : pour les **leçons**,
il n'exige que quatre choses — au moins 350 mots, au moins 6 sections `##`, la présence du mot
« exercice » (erreur), la présence du mot « vocabulaire » (avertissement). Le « gabarit
complet », qui contient bien *Exemple guidé*, est **compté à la ligne 88 et jamais exigé**.

Le gate ne ment donc pas. **C'est son message de succès qui promet plus qu'il ne tient** :
« structure pédagogique complète, blocs IA présents, **leçons structurées** ». « Leçons
structurées » recouvre en réalité deux seuils numériques et deux recherches de mots. C'est une
**lacune de couverture**, à signaler telle quelle — et surtout pas à refermer en durcissant le
gate maintenant, ce qui reviendrait à modifier un critère après mesure.

### Trois tests ont été mal visés avant d'être justes, et c'est le plus instructif

1. **`curriculum:depth-check`** — décrit ci-dessus. J'attendais du rouge sur « Exemple guidé »
   parce que j'avais lu le message de succès, pas le code. Trois tests visés sur ce que le gate
   exige **vraiment** ont été ajoutés en réponse (n° 2, 3, 4) et passent tous.
2. **`v64:check`** — j'ai d'abord inséré `dangerouslySetInnerHTML` dans un **commentaire**.
   Vert. Le gate retire les commentaires avant de tester (lignes 18–20), et il a raison : un
   commentaire ne rend aucun HTML. Réécrit avec du vrai JSX : rouge.
3. **`v66:render`** — j'ai d'abord ajouté une section ordinaire en fin de fichier. Vert, et
   c'est correct : elle atteint la page. Le défaut que ce gate détecte est une clôture de bloc
   de code échappée — le bug du CP8 où **11 sections sur 18** disparaissaient de
   `rag-evaluation`. Réécrit ainsi : rouge.

**Trois fois sur quatorze, un gate que j'ai déclaré invalide était un test mal visé.** Un test
négatif teste donc deux choses à la fois : le gate, et la compréhension qu'on a du gate. Les
trois erreurs sont conservées dans l'en-tête du script plutôt qu'effacées.

---

## 5. Ce qui n'a pas pu être vérifié dans cet environnement

Le §31 interdit de prétendre valider ce que l'environnement ne permet pas. État mesuré, pas
supposé :

| | état | conséquence |
|---|---|---|
| démon Docker | binaire présent, **démon inactif** | aucune leçon Docker exécutée |
| `kubectl` | **absent** | aucune leçon Kubernetes exécutée |
| systemd | binaire `systemctl` présent, **mais systemd ne tourne pas** : PID 1 = `process_api` | `linux-services-systemd` non exécutée |
| `ssh` / `ssh-keygen` | **absents** | `linux-ssh-remote` non exécutée |
| PostgreSQL | client `psql` présent, **aucun serveur à l'écoute sur 5432** | SQL vérifié via `node:sqlite` (CP12) |
| réseau sortant | **indisponible** (HTTP 000) | HTTP vérifié via serveur local (CP12) |
| `data/progress.json` | **absent** (état utilisateur, ignoré par Git) | gel non vérifiable ici, voir §1 |

La vérification §31 close au CP3 tient : **aucune leçon du corpus ne prétend valider AWS,
Kubernetes ou systemd depuis un environnement qui ne le permet pas.**

---

## 6. Ce que le CP14 transmet au CP15

| # | constat | classe | corrigé ? |
|---|---|---|---|
| 1 | j77 / j84 / j70 : la lecture seule dépasse le budget (172 % / 129 % / 105 %) | pédagogique, réel | **non** — c'est le mapping du curriculum, §30 |
| 2 | la liste de leçons de la revue j77 ne correspond pas au thème de la semaine | pédagogique, réel | **non** — même raison |
| 3 | 25 leçons sur 128 hors parcours | structurel, à déclarer | sans objet |
| 4 | `readingMinutes` périmés sur 314 journées (+1 369 min) | technique, mineur | **non** — à régénérer hors V71 |
| 5 | le gel de `progress.json` n'est pas vérifiable ici (avertissement noyé dans 52 verts) | technique, à déclarer | sans objet |
| 6 | `curriculum:depth-check` promet « leçons structurées » et vérifie quatre marqueurs | lacune de couverture | **non** — pas de durcissement après mesure |
| 7 | septième occurrence de ma propre erreur de méthode (marqueur structurel vs exigence réelle) | méthodologique | consigné |

---

## 7. Fichiers

| Fichier | Rôle |
|---|---|
| `scripts/v71/cp14-tests-negatifs.mjs` | les 14 tests négatifs, rejouables, avec restauration vérifiée à l'octet près et les trois tests mal visés conservés en en-tête |
