# V73 — CP11. Pratique, projets, transfert

**Résultat principal : la page `/projects` affichait « Journées rattachées : 0 » pour cinq
projets sur sept.** Le champ `project` d'une journée valait `null` sur **355 journées sur
365** ; la page filtre sur ce champ exact, en refusant explicitement toute heuristique de
titre. Les sept projets ont désormais leurs 64 journées rattachées.

**Second résultat : le déséquilibre de pratique publié au CP0 mesurait autre chose que ce qu'il
concluait.** Rectification complète en §3.

---

## 1. Trois niveaux, mesurés séparément parce qu'ils ne se remplacent pas

| niveau | définition | ce qui le prouve |
|---|---|---|
| **EXPOSITION** | la journée met la notion devant l'apprenant | une leçon liée qui déclare la compétence |
| **PRATIQUE** | la journée fait produire quelque chose sur cette notion | un exercice de la banque attaché à la journée |
| **APPLICATION** | la notion sert dans une journée de projet | la journée porte `project: N` |

**Règle déclarée avant toute mesure (§7 anti-Goodhart) : une compétence pratiquée DANS le
projet d'une autre EST pratiquée.** Le CP11 ne fabrique pas un projet par compétence pour faire
monter un compteur, et n'ajoute pas de lien de leçon pour faire baisser un manque.

### La carte, compétence par compétence

`art.` = artefacts de pratique déclarés par les leçons (mesure du CP0, reprise à l'identique) ·
`exos` = exercices de la banque réellement programmés sur les journées qui portent la
compétence · `jE`/`jP`/`jA` = journées d'exposition / de pratique / d'application ·
`niv` = niveau maximal attendu par `expectedScores`.

| compétence | leçons | art. | exos | jE | jP | jA | niv |
|---|---|---|---|---|---|---|---|
| `algo` | 2 | 6 | 11 | 9 | 11 | **0** | 3 |
| `ds` | 1 | 6 | 4 | 1 | 4 | **0** | 2 |
| `jsts` | 22 | 44 | 67 | 2 | 35 | 5 | 4 |
| `python` | 5 | 12 | 18 | 3 | 17 | 8 | 4 |
| `gitlinux` | 6 | 9 | 11 | 1 | 5 | **0** | 2 |
| `http` | 8 | 16 | 35 | 10 | 14 | 11 | 4 |
| `sql` | 8 | 17 | 17 | 3 | 14 | 8 | 3 |
| `se` | 16 | 47 | 79 | 5 | 30 | 15 | 3 |
| `archi` | 36 | 84 | 113 | 12 | 21 | 18 | 3 |
| `patterns` | **1** | **0** | 4 | 1 | 4 | **0** | 3 |
| `ml` | 5 | 6 | 49 | 1 | 29 | 17 | 3 |
| `dl` | 3 | 4 | 19 | **23** | 19 | 6 | 2 |
| `llm` | 6 | 5 | 46 | 15 | 27 | 7 | 3 |
| `rag` | 6 | 4 | 35 | 21 | 15 | 17 | 4 |
| `agents` | 3 | 6 | 36 | 13 | 17 | 6 | 3 |
| `evalia` | 3 | 4 | 43 | 21 | 23 | 22 | 4 |
| `secu` | 13 | 33 | 59 | 9 | 9 | 10 | 3 |
| `cloud` | 33 | 81 | 76 | 14 | 11 | 9 | 2 |
| `comm` | 7 | 4 | 21 | **29** | 8 | 12 | 4 |
| `autonomy` | 0 | 0 | 1 | 10 | 1 | 12 | 4 |

**Règle de suffisance, gelée avant mesure** : niveau 1-2 → l'exposition suffit · niveau 3 → la
pratique est exigée · niveau 4-5 → l'application est exigée.

> ## Compétences dont le niveau promis dépasse ce que le parcours fait faire : **0 / 20**

Chaque compétence à niveau 3 a de la pratique ; chaque compétence à niveau 4 a des journées
d'application. **C'est un résultat, pas une absence de défaut** — et il tient parce que la
règle compte l'application au bon endroit : `comm` est appliquée dans les README et les démos
de douze journées de projet, `autonomy` dans douze productions.

---

## 2. Le défaut trouvé : `project` était null sur 355 journées sur 365

`app/projects/page.tsx` écrit, en commentaire, la règle qu'il applique :

> « Journées RÉELLEMENT rattachées au projet, via le champ `project` du programme.
> **Aucune heuristique de titre, aucun rattachement deviné.** »

La règle est bonne. Le champ, lui, n'était renseigné que sur **dix journées** — les projets 1
et 2, écrits à la main dans `days-31-90.mjs`. Toutes les journées planifiées (j92-j365)
recevaient `project: entry.project`, et **aucune entrée de `days-plan.mjs` ne portait ce
champ**.

| | AVANT | APRÈS |
|---|---|---|
| Projet 1 | 3 | 3 |
| Projet 2 | 7 | 7 |
| **Projet 3** — BiblioApp | **0** | **6** |
| **Projet 4** — DataPulse | **0** | **6** |
| **Projet 5** — ChurnScope | **0** | **6** |
| **Projet 6** — DocQA | **0** | **6** |
| **Projet 7** — DocSense | **0** | **30** |
| **total** | **10** | **64** |

La page affichait donc « Journées rattachées : 0 · Terminées : 0 / 0 » et aucune liste de
livrables pour cinq des sept projets du parcours. Le composant `PeriodLoad` classait de son
côté ces 54 journées en « étude » ou « livrable » au lieu de « projet ».

### La correction est une DÉCLARATION, pas une heuristique

Les neuf semaines concernées sont **intégralement** des semaines de projet — six journées sur
six titrées « Projet N — … » ou « DocSense : … ». Le rattachement est donc exact au niveau de
la **semaine**, sans avoir à lire un seul titre : `WEEK_PLANS[17].project = 3`, `[21] = 4`,
`[26] = 5`, `[39] = 6`, `[44..48] = 7`. Le générateur lit `entry.project ?? plan.project`.

**Contrôle** : les 64 journées déclarées sont exactement les 64 journées titrées d'un projet.
**Zéro journée déclarée sans titre de projet, zéro titre de projet sans déclaration.**

---

## 3. Rectification du CP0 : le « déséquilibre de pratique » comparait deux choses différentes

Le CP0 concluait, §4.5 :

> « `se` dispose de 47 artefacts de pratique et `archi` de 92, tandis que `rag` (36 journées de
> travail) en a **4**, `evalia` (18 journées) en a **4** et `ml` (30 journées) en a **6**.
> Toute la seconde moitié du parcours — le cœur IA — pratique par projet plutôt que par
> exercice outillé. »

**La première phrase est exacte. La seconde n'en découle pas.** La colonne `prat` du CP0 compte
les artefacts **déclarés par les leçons** (`practiceRefs` dans `lessons-map.mjs`). Elle ne
compte pas les exercices que **le calendrier programme réellement** sur les journées.

| compétence | artefacts déclarés par les leçons | exercices programmés par le calendrier |
|---|---|---|
| `rag` | **4** | **35** |
| `evalia` | **4** | **43** |
| `ml` | **6** | **49** |
| `llm` | 5 | **46** |
| `comm` | 4 | 21 |
| `se` | 47 | 79 |

> ### ANOMALIE DE SONDE n° 21
> **La mesure du CP0 lit les `practiceRefs` des leçons ; sa conclusion parle de ce que
> l'apprenant pratique.** Ce ne sont pas la même chose : la banque compte 376 exercices, et un
> exercice atteint l'apprenant parce qu'une JOURNÉE le programme, pas parce qu'une leçon le
> cite. `rag` passe de 4 à 35, `ml` de 6 à 49.

**Ce qui reste vrai du constat du CP0** : les leçons de la seconde moitié déclarent peu de
`practiceRefs`. C'est un défaut de la carte des leçons — la même sous-déclaration que le CP10 a
trouvée sur les compétences — et non un défaut du parcours vécu. **Constat pour le CP12.**

### Le cas `patterns`, et sa correction

Le CP0 écrivait : « `patterns` : une leçon, deux journées consécutives (j38-j39), **zéro
artefact de pratique** — et le mois 10 attend un niveau 3. » Les deux moitiés méritent d'être
séparées :

- **`artefacts = 0` est exact** : `design-patterns-intro` ne déclare aucun `practiceRefs` ;
- **« zéro pratique » est faux** : le calendrier programme `patterns-factory-area` (j39) et
  `patterns-adapter-legacy` (j76), deux exercices dont le sujet EST le pattern.

**Reste un vrai défaut, trouvé ici et corrigé.** La journée **292 s'intitule « Design patterns
dans ton code »**, son cours développe Strategy, Adapter, Factory, Decorator, Repository et
leurs anti-patterns — **et elle ne reliait pas la leçon de fond sur les design patterns.**

`design-patterns-intro` lui est rattachée. Le rattachement est justifié **par le titre et par
le cours de la journée** ; qu'il tombe au mois 10, là où `expectedScores.patterns = 3`, en est
la conséquence et non la raison. `patterns` passe de 3 à **4 journées de pratique**, réparties
de j38 à j352 au lieu de s'arrêter à j76.

---

## 4. Le trou de production de 86 jours : ce que la lecture montre

Le CP9 avait mesuré **86 jours sans aucune journée de projet entre j181 et j267**, sur les deux
mois les plus exigeants de l'année. La mesure est exacte. **La lecture des journées la
contredit sur le fond**, et il faut le dire dans cet ordre.

Voici les livrables déclarés de j218 à j237 :

| | |
|---|---|
| j218 | Chunks embeddés et stockés |
| j219 | Recherche par similarité maison |
| j220 | RAG bout-en-bout avec citations |
| j221 | **`rag-from-scratch` modulaire + README** |
| j222 | Ingestion multi-format fonctionnelle |
| j223 | RAG robuste + journal d'échecs |
| j225 | **DocQA v0 sur corpus réel** |
| j229 | Filtrage par métadonnées fonctionnel |
| j233 | **Interface DocQA fonctionnelle** |
| j234 | DocQA avec historique |

Et la suite ne s'arrête pas là : j239 « DocQA sur Chroma fonctionnel », j247 « Recherche hybride
implémentée », j254 « Évaluateur de retrieval + scores », j261 « Défenses en couches »,
j270 « DocQA sécurisé ». **Ces journées construisent toutes le même artefact persistant**, celui
que le Projet 6 (j267-272) évalue et finalise, et que DocSense étend au mois 11.

> **Le trou n'est pas un trou de construction : c'est un trou de DÉCLARATION.** Le parcours
> construit sans interruption de j218 à j272 ; le calendrier ne nomme « projet » que les six
> derniers jours.

**Le CP11 ne déclare pas ces 48 journées comme journées de projet, et la raison est écrite.**
Appliquer le critère « le livrable étend un artefact persistant » ferait du projet 6 un projet
de 54 journées face à un projet 3 de six — une asymétrie de présentation qui ne décrit pas
mieux le produit qu'aujourd'hui, et qui, appliquée uniformément, absorberait aussi des journées
d'enseignement ordinaire. **Le fait est enregistré comme constat pour le verdict (P1-CP11-2),
pas tranché unilatéralement.**

---

## 5. Les quatre compétences « sans transfert », relues

Le CP8 signalait `ABSENCE_DE_TRANSFERT` sur `algo`, `ds`, `gitlinux` et `patterns` : aucune
journée de projet ne les porte. **Le chiffre est exact et il ne sera pas corrigé.**

Ces quatre compétences sont le **substrat** de tous les projets, et non l'objet d'aucun :

- le `Store` de TaskFlow **est** une structure de données ; le livrable de j45 dit
  « persistance testée + **2-3 commits** » ;
- chaque journée de projet, sur les sept projets, commite et documente ;
- le projet 6 implémente une similarité cosinus et un top-k — de l'algorithmique.

Ce qu'aucune journée de projet ne fait, c'est **relier une leçon** de ces compétences. La
mesure du CP8 compte la production **portée par une leçon déclarante** — elle est donc aveugle
aux compétences qui s'exercent partout et ne se lisent nulle part.

> ### ANOMALIE DE SONDE n° 23
> `ABSENCE_DE_TRANSFERT` ne peut pas voir une compétence de substrat. **Ajouter des liens de
> leçon aux journées de projet pour faire tomber ce compteur serait exactement le
> contournement que le §7 du contrat interdit** — et cela dégraderait les journées concernées,
> dont la charge de lecture augmenterait sans qu'un mot de leur travail ne change.

Le constat reste publié tel quel dans le registre de rétention. Il est **interprété ici**, pas
effacé.

---

## 6. Les leçons jamais construites avec

**63 leçons programmées ne sont reliées à aucune journée de projet** : 58 CORE et 5 OPTIONAL.

**Ce n'est pas une violation du contrat.** Le §2 définit CORE comme « programmée par ≥ 1 journée
non-revue, portant une compétence déclarée, et **un livrable la suppose** ou une leçon CORE la
cite en prérequis » — un *livrable* au sens large, pas une journée de projet. Une leçon peut
être indispensable et n'être jamais l'objet d'un projet : `networking-dns` ou
`linux-processes-signals` en sont l'exemple évident.

**Les cinq OPTIONAL sont exactement celles que le CP4 avait publiées comme résultat
inconfortable** : `nextjs-foundations`, `nextjs-rendering`, `nextjs-server-client-components`,
`nextjs-data-production` et `monitoring-production`. **Le CP11 constate que le statut OPTIONAL
règle déjà la question** : « utile au métier visé, pas nécessaire au parcours ; aucun livrable
ne la suppose ». Une leçon OPTIONAL qu'aucun projet n'emploie est **conforme à son statut**, et
forcer un livrable Next.js pour faire tomber ce compteur reste ce que le §7 interdit.

---

## 7. La progression des projets, chiffrée

| projet | journées | mois | difficulté dérivée moyenne (CP9) | compétences dominantes |
|---|---|---|---|---|
| Projet 1 — TaskFlow | 3 (j45-47) | 2 | 3,67 | se, jsts |
| Projet 2 — LivreAPI | 7 (j61-86) | 3 | 3,43 | http, se, sql |
| Projet 3 — BiblioApp | 6 (j113-118) | 4 | **3,17** | jsts, archi |
| Projet 4 — DataPulse | 6 (j141-146) | 5 | 3,33 | sql, python |
| Projet 5 — ChurnScope | 6 (j176-181) | 6 | 3,67 | ml, evalia, python |
| **Projet 6 — DocQA** | 6 (j267-272) | 9 | **5,00** | evalia, rag, ml |
| **Projet 7 — DocSense** | **30** (j302-335) | 11-12 | 4,23 | archi, rag, evalia, secu, cloud |

**Les projets 1 à 5 ne montent pas** : 3,67 → 3,43 → 3,17 → 3,33 → 3,67. Le quatrième mois de
projet demande **moins** que le deuxième. Un apprenant qui les enchaîne ne rencontre aucune
montée d'exigence pendant **136 jours**, puis un saut brutal au projet 6.

**Ce n'est pas un défaut à corriger au CP11**, dont le mandat est de vérifier que les
compétences sont pratiquées et appliquées — elles le sont toutes. C'est un constat de
**conception de progression**, chiffré ici pour la première fois, et enregistré pour le verdict
(**P1-CP11-1**). Le corriger demanderait de réécrire les énoncés de trois projets, c'est-à-dire
exactement le « Academic Rewrite » que le brief interdit.

---

## 8. Ce que le CP11 laisse ouvert

| # | constat | pour |
|---|---|---|
| **P1-CP11-1** | **Projets 1 à 5 sans montée d'exigence** (3,67 → 3,17 → 3,67) sur 136 jours, puis un saut à 5,00 au projet 6. | verdict CP15 |
| **P1-CP11-2** | **Le parcours construit sans interruption de j218 à j272** et n'en déclare comme « projet » que les six derniers jours. Décision de présentation produit, non prise unilatéralement. | verdict CP15 |
| **P2-CP11-1** | `lessons-map.mjs` **sous-déclare les `practiceRefs`** de toute la moitié IA : `rag` 4 artefacts déclarés pour 35 exercices programmés, `ml` 6 pour 49. Même famille que la sous-déclaration de compétences trouvée au CP10. | CP12 |
| **P2-CP11-2** | `patterns` reste la compétence la plus mince : **une seule leçon** du corpus la déclare, pour un niveau 3 attendu au mois 10. Le rattachement de j292 améliore la répartition, pas l'épaisseur. | CP15 |
| **constat** | `dl` (23 journées d'exposition) et `comm` (29) ont les ratios pratique/exposition les plus faibles. `comm` s'applique en revanche sur 12 journées de projet — README, démos, storytelling. | CP15 |

---

## 9. Ce que le CP11 a modifié

| fichier | nature |
|---|---|
| `scripts/data/days-plan.mjs` | **9 semaines** reçoivent `project: N` — la déclaration qui manquait |
| `scripts/generate-curriculum.mjs` | `project: entry.project ?? plan.project ?? null` |
| `scripts/data/days-lessons-v67.mjs` | j292 « Design patterns dans ton code » relie enfin `design-patterns-intro` |
| `scripts/v73/cp2-graphe.mjs` | anomalie n° 22 : `d.project?.id` lu sur un **nombre** |
| `scripts/v73/cp11-pratique.mjs` | **nouveau** — la sonde, rejouable |
| `docs/v73/pratique-transfert.json` | **nouveau** — la carte complète |

> ### ANOMALIE DE SONDE n° 22
> `cp2-graphe.mjs` lisait `d.project?.id`, alors que `program.json` stocke `project` comme un
> **nombre** : `(2)?.id` vaut `undefined`. Le champ `projet` du graphe valait donc **null sur
> les 365 journées**, et personne ne l'a vu parce que le marqueur de titre `estProduction`
> faisait le travail à sa place — et parce que le champ n'était de toute façon renseigné que
> sur dix journées. **Deux défauts se masquaient l'un l'autre.**

**Aucune leçon n'a été touchée. Aucun texte de journée n'a été réécrit. Aucune journée n'a
bougé.**

---

## 10. Vérifications

| contrôle | résultat |
|---|---|
| `npm test` | **1420 / 1420** |
| `npx tsc --noEmit` | **0** |
| `npm run build` | **succès** |
| `npm run gates:active` | **0 violation** |
| porte V73 du graphe | **verte** |
| **corpus des 128 leçons** | **`92d5fae6…` INCHANGÉ** |
| invariants | 365 journées · 128 leçons · 52 semaines · 12 mois |
| **`data/progress.json`** | **toujours absent** |
| **L1 · L2 · L3** | **0 · 0/52 · 6/365** ✅ |
| journées de projet déclarées | **64**, exactement les 64 titrées — 0 faux positif, 0 oubli |
| `days-difficulty-v73.mjs` régénéré | **identique** — la difficulté du CP9 ne bouge pas |
