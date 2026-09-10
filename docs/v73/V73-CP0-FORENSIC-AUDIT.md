# V73 — CP0. Audit forensique du curriculum

> **LECTURE SEULE.** Aucun fichier de produit n'a été modifié par ce checkpoint. Les seuls
> fichiers écrits sont ce rapport, `V73-STATE.md`, `CP0-ECHANTILLON-24.json` et les deux
> instruments `scripts/v73/cp0-*.mjs`.

---

## 1. État Git

| | |
|---|---|
| dépôt | `Fourat23/Ai-carreer-os` — **deux `r` à « carreer »**, vérifié par `git remote -v`, pas reconstruit |
| branche canonique | `claude/ai-career-os-saas-phfg49` (existe sur origin ; **aucune branche parallèle créée**) |
| HEAD à l'ouverture du CP0 | `fe7a10c` |
| local == origin | **oui** (`fe7a10c` des deux côtés, après `git fetch --prune`) |
| working tree | **propre** |
| stash | **vide** |
| serveurs / processus résiduels | **aucun** (aucun `node`, `next-server`, `dockerd` ; aucun port en écoute) |
| autres branches distantes | `claude/v71-recovery-cross-validation` (contre-analyse V71, conservée — §8) |

---

## 2. Invariants

| invariant | mesuré | attendu |
|---|---|---|
| leçons | **128** | 128 |
| journées | **365** | 365 |
| corrections | **365** | 365 |
| semaines | **52** | 52 |
| mois | **12** | 12 |
| ordre calendrier `days[i].day === i+1` | **vrai** | vrai |
| empreinte du corpus (128 leçons) | `c1ac869e579ba27ea4bdf4f869385c33f3e1066b` | gelée dans 9 gates |
| empreinte du curriculum entier | `04d405263d89c82c84b925a99408aaa9d4f57e08` | — |
| identifiants de pratique du produit | **541** | — |

**`data/progress.json` : le fichier n'existe pas dans le dépôt.** Il est **gitignoré**
(« progression locale personnelle, ne pas versionner ») ; seul `data/progress.example.json`
est versionné. L'invariant « `progress.json` intact » signifie donc, pour V73 : **ne jamais le
créer ni écrire dedans**. C'est un fait à connaître avant d'écrire un test négatif qui
prétendrait le muter.

---

## 3. Le curriculum en français simple

Le programme promet **vingt compétences**. Dix-neuf sont enseignées par des journées ; une ne
l'est pas du tout. Ce n'est pas la seule promesse en souffrance : plusieurs compétences
existent dans le **texte** des leçons sans exister dans le **calendrier**, et une partie de ce
que le parcours demande de produire suppose des savoirs qu'il ne donne nulle part.

Le corpus, lui, est **bon**. Vingt-quatre leçons ont été tirées au sort et contrôlées ; huit
ont été lues intégralement. Elles sont excellentes — modèles mentaux explicites, mesures
reproductibles, exercices avec critère de réussite, corrections qui enseignent. **V73 ne part
donc pas de l'hypothèse « les cours sont mauvais » : cette hypothèse est fausse, et le rapport
le démontre au §11.**

Le problème de V73 n'est pas la qualité des morceaux. C'est que **certains morceaux ne sont
reliés à rien** : les meilleures leçons de CSS, de Next.js, de cloud et de Kubernetes ne sont
programmées aucun jour, tandis que le calendrier annonce des compétences qu'aucune journée ne
porte.

---

## 4. Carte des compétences (A)

`jT` = journées de travail · `jR` = journées de revue · `déc` = leçons qui **déclarent** la
compétence · `prg` = celles qui sont programmées · `hors` = celles qui ne le sont pas ·
`prat` = artefacts de pratique atteignables.

| compétence | jT | jR | déc | prg | hors | prat | 1er → dernier | scores attendus |
|---|---|---|---|---|---|---|---|---|
| `algo` | 9 | 2 | 2 | 2 | 0 | 6 | j15 → j48 | m1:2 m2:3 |
| `ds` | 4 | 1 | 1 | 1 | 0 | 6 | j30 → j42 | m2:2 |
| `jsts` | 34 | 8 | 22 | 14 | **8** | 44 | j4 → j119 | m1:2 m2:3 m3:3 m4:4 m8:4 |
| `python` | 13 | 3 | 5 | 5 | 0 | 12 | j82 → j147 | m5:3 m6:4 m7:4 |
| `gitlinux` | 6 | 1 | 8 | 6 | 2 | 12 | j1 → j73 | m1:2 m2:2 |
| `http` | 9 | 4 | 8 | 8 | 0 | 16 | j50 → j91 | m3:3 m4:3 m8:4 |
| `sql` | 9 | 2 | 8 | 8 | 0 | 17 | j55 → j140 | m3:2 m5:3 m6:3 |
| `se` | 14 | 0 | 16 | 16 | 0 | 47 | j40 → j111 | m2:2 m3:2 m4:3 m5:3 |
| `archi` | 17 | 2 | 40 | 28 | **12** | 92 | j76 → j308 | m4:2 m9:3 m10:3 m11:3 |
| `patterns` | **2** | 0 | 1 | 1 | 0 | **0** | j38 → j39 | **m10:3** |
| `ml` | 30 | 5 | 5 | 5 | 0 | 6 | j148 → j182 | m6:3 m7:3 |
| `dl` | 12 | 3 | 3 | 3 | 0 | 4 | j183 → j203 | m7:2 |
| `llm` | 18 | 3 | 6 | 6 | 0 | 5 | j197 → j224 | m7:2 m8:3 m9:3 |
| `rag` | 36 | 6 | 6 | 6 | 0 | 4 | j218 → j315 | m8:2 m9:3 m11:4 m12:4 |
| `agents` | 18 | 3 | 3 | 3 | 0 | 6 | j274 → j329 | m10:3 |
| `evalia` | 18 | 2 | 3 | 3 | 0 | 4 | j253 → j322 | m6:2 m9:3 m12:4 |
| `secu` | 20 | 3 | 15 | 10 | **5** | 36 | j67 → j336 | m3:1 m10:3 m12:3 |
| **`cloud`** | **0** | **0** | **39** | 26 | **13** | 92 | **AUCUNE** | **m11:2** |
| `comm` | 21 | 4 | 7 | 7 | 0 | 4 | j66 → j364 | m4:2 m6:3 m12:4 |
| `autonomy` | 23 | 0 | **0** | 0 | 0 | **0** | j44 → j365 | m5:3 m11:4 m12:4 |

### Ce que cette table dit, et qui ne se voyait pas avant

**1. `cloud` est déclarée, chiffrée, et jamais enseignée.** Zéro journée sur 365, alors que le
mois 11 fixe `expectedScores.cloud = 2`. Trente-neuf leçons déclarent cette compétence ;
vingt-six sont programmées **sous une autre étiquette** (Docker, CI/CD, secrets, observabilité)
et treize ne le sont pas du tout. Le contenu existe en partie — c'est le **calendrier** qui
n'en prend acte nulle part.

**2. `autonomy` est l'exact symétrique** : 23 journées de travail, 15 productions de projet, et
**aucune leçon ne la déclare**. Ce n'est pas nécessairement un défaut — l'autonomie s'exerce et
ne se lit pas — mais le déséquilibre doit être nommé plutôt que subi.

**3. `patterns` : une leçon, deux journées consécutives (j38-j39), zéro artefact de pratique —
et le mois 10 attend un niveau 3.** Une compétence dont on demande la maîtrise avancée sept
mois après l'avoir vue deux jours.

**4. Deux compétences sont évaluées avant d'être enseignées, et une seule est un vrai défaut.**
Le mois 6 attend `evalia = 2` alors que la première journée étiquetée `evalia` est j253
(mois 9) ; mais le mois 6 enseigne massivement l'évaluation sous l'étiquette `ml` (j158
métriques de régression, j162 métriques de classification, j165 validation croisée, j167 et
j180 analyse d'erreurs). **C'est l'étiquette qui ment, pas l'enseignement.** Le mois 11 avec
`cloud = 2` n'a pas cette excuse.

**5. Le déséquilibre pratique.** `se` dispose de 47 artefacts de pratique et `archi` de 92,
tandis que `rag` (36 journées de travail) en a **4**, `evalia` (18 journées) en a **4** et
`ml` (30 journées) en a **6**. Toute la seconde moitié du parcours — le cœur IA — pratique par
projet plutôt que par exercice outillé.

---

## 5. Les 22 leçons hors parcours (B)

Elles ne sont pas 25 : **22**. V72 en avait raccroché trois (Kubernetes) au jour 321.

| leçon | domaine | niv | mots | citée par des leçons programmées |
|---|---|---|---|---|
| `cloud-aws-core` | Cloud, AWS, Azure & IaC | 3 | 2 557 | 0 |
| `cloud-azure-core` | Cloud, AWS, Azure & IaC | 3 | 2 818 | 0 |
| `cloud-compute-storage` | Cloud, AWS, Azure & IaC | 2 | 2 745 | 1 |
| `cloud-finops` | Cloud, AWS, Azure & IaC | 2 | 2 958 | 1 |
| `cloud-fundamentals` | Cloud, AWS, Azure & IaC | 2 | 2 896 | 1 |
| `cloud-networking` | Cloud, AWS, Azure & IaC | 3 | 2 807 | 0 |
| `iac-fundamentals` | Cloud, AWS, Azure & IaC | 3 | 2 872 | 0 |
| `css-fundamentals` | Frontend : Web Platform | 1 | 4 399 | 1 |
| `css-flexbox` | Frontend : Web Platform | 2 | 4 939 | 0 |
| `css-grid` | Frontend : Web Platform | 2 | 4 109 | 0 |
| `responsive-design` | Frontend : Web Platform | 2 | 3 622 | 1 |
| `nextjs-foundations` | Frontend & React | 3 | 3 420 | 0 |
| `nextjs-rendering` | Frontend & React | 3 | 2 539 | 0 |
| `nextjs-server-client-components` | Frontend & React | 3 | 3 140 | 0 |
| `nextjs-data-production` | Frontend & React | 3 | 4 561 | 1 |
| `k8s-networking-services` | Kubernetes | 3 | 2 677 | 2 |
| `k8s-security` | Kubernetes | 3 | 2 845 | 0 |
| `k8s-troubleshooting` | Kubernetes | 3 | 2 736 | 1 |
| `linux-services-systemd` | Systèmes & Linux | 2 | 3 464 | 1 |
| `linux-ssh-remote` | Systèmes & Linux | 2 | 3 475 | 0 |
| `deployment-strategies` | CI/CD & livraison | 3 | 3 260 | **6** |
| `release-incident-recovery` | CI/CD & livraison | 3 | 3 164 | 2 |

**Total : 70 306 mots hors parcours — 16 % du corpus.** Ce ne sont pas des brouillons :
`css-flexbox` est la plus longue leçon du corpus, `css-grid` publie des mesures relevées dans
Chromium, `nextjs-data-production` déroule une mise en production heure par heure avec cinq
incidents. Ce sont, pour une part, les meilleures pages du produit, et **aucun apprenant
suivant les 365 jours ne les rencontrera**.

**Quatre grappes, pas une liste** : cloud/IaC (7), frontend web platform + Next.js (8),
Kubernetes (3), Linux avancé + livraison (4). Chaque grappe correspond à une compétence que le
parcours **effleure sans la prendre**.

**`deployment-strategies` mérite d'être signalée** : six leçons programmées la citent — le
record du corpus — et elle n'est programmée nulle part.

---

## 6. Prérequis (C) — l'ambiguïté A/B est close

**37 candidats** (31 vers une leçon programmée plus tard, 6 vers une leçon hors parcours). La
sonde ne classe rien : elle produit la citation et sa **phrase entière**, et le classement se
fait à la lecture.

**Taxonomie sémantique adoptée, en remplacement définitif des étiquettes A/B :**

| classe | définition | n |
|---|---|---|
| `INVALID_FORWARD_PREREQUISITE` | notion **exigée**, enseignée plus tard, **non signalée** | **0** |
| `EXPLICIT_LOOKAHEAD` | renvoi vers plus loin, **annoncé**, la notion nécessaire étant donnée sur place | **37** |
| `VALID_RECAP` | rappel d'une notion déjà enseignée | 0 (hors périmètre : non candidats) |
| `VALID_PRIOR_KNOWLEDGE` | prérequis réellement enseigné avant | — (les non-candidats) |
| `AMBIGUOUS` | ni exigence ni annonce claire | **0** |

**Comment le classement a été fait — sur la propriété, pas sur le marqueur.** Compter les
étiquettes « Où trouver le détail » aurait suffi à obtenir 33/37 ; ce n'est pas ce qui a été
fait. Chaque paragraphe a été normalisé (retrait du préfixe `>` des encadrés, espaces
recollés) puis contrôlé sur la **clause d'optionalité** : le texte dit-il que la lecture n'est
pas supposée ? Les deux paragraphes qui ne portent pas la formule standard ont été **lus**, et
ils disent mieux :

- `readme-documentation` → `technical-documentation` : « **Un README n'en dépend pas** : il
  répond à quatre questions posées en quelques secondes » ;
- `technical-storytelling` → `portfolio-github` : « le récit se prépare d'abord, la vitrine
  l'expose ensuite ».

**Aucun défaut d'ordre ne subsiste.** C'est le résultat du travail de V71 (CP11) et de V72
(CP12), confirmé ici par une mesure indépendante.

---

## 7. Charge des 365 journées (D)

Méthode identique pour les 365 : lecture de la journée + de sa correction + des leçons liées,
exemple guidé, pratique estimée par fourchette selon la difficulté et le nombre d'étapes, le
**minutage explicite faisant foi** quand il existe. Budget : `hours × 60` = **270 min**.

### Répartition de référence (lecture normale, 150 mots/min ; relecture comptée plein tarif)

| catégorie | n |
|---|---|
| BALANCED | **264** |
| HEAVY | **55** |
| UNDERLOADED | **40** |
| IMPOSSIBLE | **6** |

### Analyse de sensibilité — obligatoire, parce que le résultat en dépend entièrement

| hypothèse de lecture | IMPOSSIBLE | HEAVY | BALANCED | UNDERLOADED |
|---|---|---|---|---|
| rapide (220 mots/min), relecture = lecture | **0** | 8 | 268 | 89 |
| rapide, relecture à mi-tarif | **0** | 3 | 267 | 95 |
| **normale (150), relecture = lecture** | **6** | 55 | 264 | 40 |
| normale, relecture à mi-tarif | **0** | 47 | 270 | 48 |
| attentive (110), relecture = lecture | **60** | 29 | 270 | 6 |
| attentive, relecture à mi-tarif | **39** | 25 | 289 | 12 |

**Le nombre de journées infaisables va de 0 à 60 selon deux hypothèses que personne n'a
validées.** Aucune décision de V73 ne doit reposer sur le chiffre « 6 » pris isolément. Ce qui
est robuste, en revanche :

1. **les six IMPOSSIBLE en hypothèse de référence sont toutes des revues** (j7, j140, j224,
   j231, j238, j357) ;
2. **la journée de travail la plus lourde est j79** (« Observabilité : logs, métriques,
   traces », 7 leçons, 176 min de lecture, 238–290 min pour 270) — elle reste HEAVY, jamais
   IMPOSSIBLE ;
3. **les 40 journées UNDERLOADED sont concentrées** : 31 d'entre elles sont entre j91 et j180.

### Le fait le plus exploitable du CP0

```
journées UNDERLOADED par tranche de 30 jours
j  1– 30 :  2      j151–180 : 12
j 31– 60 :  2      j181–360 :  0
j 61– 90 :  3      j361–365 :  2
j 91–120 : 13
j121–150 :  6
```

**Il y a de la place, et elle est exactement là où le parcours en a besoin** : les mois 4, 5 et
6 (React, Python/data, ML) contiennent trente-et-une journées structurellement légères. C'est
là que CSS et Next.js peuvent s'insérer sans créer de journée ni retirer de contenu.

---

## 8. Les 52 revues (E)

| propriété | mesure |
|---|---|
| revues avec **test pratique** | **52 / 52** |
| revues avec **test théorique** | **52 / 52** |
| revues avec **grille de notation** chiffrée | **52 / 52** |
| revues avec **plan de remédiation** | **52 / 52** |
| revues demandant un **rappel sans notes** | **52 / 52** |
| revues qui **introduisent** une leçon jamais vue | **0** |
| leçons revues par revue | min 1 · **médiane 4** · max 7 |
| lecture des leçons reliées | min 18 · **médiane 104 min** · max 185 |
| texte propre de la page de revue | **10 min en moyenne** |
| revues au minutage explicite | **40 / 52**, médiane **90 min** |
| espacement depuis le dernier contact | médiane **2 jours**, max 99 |

### Ce qui va bien, et il faut le dire avant les défauts

Le dispositif de revue n'est **pas** « relis les quinze dernières leçons ». Les 52 revues
possèdent toutes un test pratique minuté, un test théorique à répondre sans notes, une grille
de notation en points avec seuils, un plan de remédiation qui associe chaque symptôme à la
journée à retravailler, et des questions d'entretien. **Aucune revue n'introduit une notion
jamais rencontrée** — la règle « une revue révise, elle n'introduit pas » tient sur les 52.

### Les deux défauts réels

**1. La relecture n'est jamais budgétée.** La page de revue pèse 10 minutes ; les leçons
qu'elle demande de relire en pèsent 104 de plus, à la médiane. Quarante revues annoncent
90 minutes de pratique — et la relecture vient **par-dessus**, sans figurer dans aucun compte.

**2. L'espacement médian est de 2 jours.** Une revue de fin de semaine renvoie majoritairement
vers des leçons vues **l'avant-veille**. C'est de la révision immédiate, pas de la répétition
espacée : le bénéfice de rétention d'un rappel à 48 heures est très inférieur à celui d'un
rappel à deux ou trois semaines. **C'est le point de contact direct entre V73 et le futur
Retention Engine**, et le CP8 devra le traiter.

**3. Trois revues sont UNDERLOADED** (j126, j154, j364) : une seule leçon reliée, 18 minutes de
relecture. Une semaine y est consolidée par presque rien.

---

## 9. Récurrence par domaine (F)

`exp` = journées de travail · `rev` = journées de revue · `prod` = journées de production ·
`silence max` = plus grand intervalle entre deux contacts · `après` = jours sans contact après
le dernier.

| compétence | exp | rev | prod | silence max | après le dernier |
|---|---|---|---|---|---|
| `algo` | 9 | 2 | 0 | 13 j | **317 j** |
| `ds` | 4 | 1 | 0 | 8 j | **323 j** |
| `patterns` | 2 | 0 | 0 | 1 j | **326 j** |
| `gitlinux` | 6 | 1 | 0 | 54 j | **292 j** |
| `jsts` | 34 | 8 | 5 | 31 j | 246 j |
| `sql` | 9 | 2 | 0 | 50 j | 225 j |
| `se` | 14 | 0 | 3 | 21 j | 254 j |
| `python` | 13 | 3 | 0 | 38 j | 218 j |
| `http` | 9 | 4 | 3 | 14 j | 274 j |
| `ml` | 30 | 5 | 7 | 1 j | 183 j |
| `dl` | 12 | 3 | 0 | 7 j | 162 j |
| `llm` | 18 | 3 | 0 | 7 j | 141 j |
| `archi` | 17 | 2 | 0 | **207 j** | 57 j |
| `secu` | 20 | 3 | 0 | **192 j** | 29 j |
| `comm` | 21 | 4 | 3 | **251 j** | 1 j |
| `autonomy` | 23 | 0 | 15 | **212 j** | 0 j |
| `rag` | 36 | 6 | 1 | 36 j | 50 j |
| `agents` | 18 | 3 | 0 | 36 j | 36 j |
| `evalia` | 18 | 2 | 6 | 44 j | 43 j |
| `cloud` | **0** | 0 | 0 | — | — |

**Ne pas conclure trop vite.** Le brief l'interdit explicitement : « ne pas supposer que
8 répétitions est trop ou 1 insuffisant ». Deux lectures s'imposent :

- **`algo`, `ds`, `patterns`, `gitlinux` sont enseignés puis abandonnés.** Le dernier contact
  avec l'algorithmique est **j48** ; il reste 317 jours. Le jour 365 propose un entretien de
  design système et de l'algorithmique — sans qu'aucun rappel ne soit intervenu depuis dix
  mois. Pour des **fondations**, ce silence est un défaut de rétention.
- **`archi`, `secu`, `comm`, `autonomy` ont de très longs silences internes mais reviennent
  jusqu'à la fin.** Un silence de 207 jours pour l'architecture n'est pas la même chose : ces
  compétences sont *transversales*, revisitées à un autre niveau. Le silence est ici la marque
  d'un enseignement en deux temps, pas d'un abandon.

La distinction ne se lit pas dans les chiffres seuls : elle demande de savoir **à quel niveau**
la compétence est attendue à la fin. C'est ce que le CP1 devra geler.

---

## 10. Progression J1 → J365 (G)

| tranche | difficulté moy. | valeurs distinctes | lecture méd. | charge haute méd. | sections méd. | découpage horaire | pratique minutée |
|---|---|---|---|---|---|---|---|
| j1–30 | 2,42 | **[1, 2, 3, 4]** | 77 | 204 | 14 | **26 / 30** | 26 / 30 |
| j31–60 | 3,08 | [2, 3, 4] | 61 | 175 | 15 | 0 / 30 | 26 / 30 |
| j61–90 | 3,12 | [2, 3, 4] | 70 | 193 | 15 | 0 / 30 | 26 / 30 |
| j91–120 | 3,00 | **[3]** | 35 | 148 | 12 | 0 / 30 | 25 / 30 |
| j121–150 | 3,00 | **[3]** | 40 | 153 | 12 | 0 / 30 | 26 / 30 |
| j151–180 | 3,00 | **[3]** | 36 | 149 | 12 | 0 / 30 | 26 / 30 |
| j181–210 | 3,00 | **[3]** | 99 | 210 | 12 | 0 / 30 | 25 / 30 |
| j211–240 | 3,00 | **[3]** | 161 | 273 | 12 | 0 / 30 | 26 / 30 |
| j241–270 | 3,00 | **[3]** | 90 | 204 | 12 | 0 / 30 | 26 / 30 |
| j271–300 | 3,00 | **[3]** | 81 | 195 | 12 | 0 / 30 | 26 / 30 |
| j301–330 | 3,00 | **[3]** | 84 | 197 | 12 | 0 / 30 | 25 / 30 |
| j331–360 | 3,00 | **[3]** | 94 | 207 | 12 | 0 / 30 | 26 / 30 |
| j361–365 | 2,75 | [2, 3] | 57 | 169 | 12 | 0 / 30 | 4 / 30 |

**L'hypothèse de V72 est confirmée et précisée** : `difficulty` prend encore quatre valeurs
dans le premier mois, trois jusqu'à j90, puis **une seule valeur — 3 — pendant 271 journées
consécutives** (j91 → j360, avec deux journées à 2 dans les cinq derniers jours). Ce champ est
**affiché à l'apprenant** sur chaque page de journée.

**Deuxième constat, non anticipé** : le **découpage horaire** — la ventilation « 0:00-0:45
installation, 0:45-1:30 théorie… » — existe sur **26 journées, toutes dans le premier mois**,
et disparaît complètement ensuite. Le premier mois tient l'apprenant par la main heure par
heure ; à partir du jour 31, plus rien ne lui dit comment répartir ses 4 h 30.

**Ce qui ne s'est pas dégradé, en revanche** : la charge réelle **varie** (lecture médiane de
35 à 161 min selon les tranches), le nombre de sections reste stable à 12, et la pratique reste
explicitement minutée sur 25 à 26 journées par tranche de 30. **Le contenu progresse ; ce sont
les métadonnées de progression qui ont cessé de le dire.**

---

## 11. Semaines et mois (H)

**13 thèmes de semaine sur 52 recouvrent moins de 30 % du vocabulaire des journées qu'ils
annoncent** — et pour chacun d'eux, le thème décrit **mieux une autre semaine** :

| semaine | recouvrement | décrit mieux | thème déclaré |
|---|---|---|---|
| s6 | 0,14 | s5 | Stacks, queues, linked lists, arbres, BFS/DFS ; TypeScript |
| s8 | 0,00 | s7 | PROJET 1 : TaskFlow CLI + revue mensuelle 2 |
| s9 | 0,17 | s7 | HTTP en profondeur, réseau de base, Postman, JSON |
| s10 | 0,00 | s8 | REST design, Node.js, premiers serveurs, Express |
| s11 | 0,00 | s8 | Express complet : middlewares, erreurs, validation |
| s12 | 0,00 | s8 | SQL : SELECT, JOIN, agrégats ; SQLite branché sur l'API |
| s28 | 0,00 | s27 | MLP sur données réelles, régularisation, courbes |
| s29 | 0,00 | s28 | NLP : tokenisation, embeddings, attention, transformers |
| s30 | 0,00 | s29 | LLM : fonctionnement, APIs, hallucinations |
| s31 | 0,00 | s30 | Prompt engineering sérieux, structured outputs |
| s32 | 0,00 | s30 | Function calling, tool use, intégration app |
| s33 | 0,25 | s35 | RAG v1 : chunking, embeddings, retrieval naïf |
| s34 | 0,00 | s32 | RAG v1 complet multi-formats + revue mensuelle 8 |

**Deux blocs de décalage, pas un décalage uniforme** : s8→s13 (décalage de 1 à 4 semaines) et
s28→s34 (décalage de 1 à 4 semaines aussi, avec des collisions — s31 et s32 désignent toutes
deux s30). Il n'existe **aucune permutation constante** qui corrige les treize : ce sont des
intitulés rédigés contre un plan qui a ensuite changé. La réparation est éditoriale, semaine
par semaine.

---

## 12. Références mortes (I) — et cinq anomalies de sonde publiées

### Le résultat

| référence | état |
|---|---|
| `api-idempotency` | **n'existe pas comme artefact**, et **n'est plus citée par aucune leçon** — corrigée par V72 |
| `dlq-duplicate` | **idem** — corrigée par V72 |
| `practiceRefs` de `lessons-map.mjs` non résolus | **1** : `terminal-shell-filesystem` → lab `terminal` |
| `data/day-exercises.json` → identifiants inexistants | **0** |
| liens `/doc/lessons/<slug>` vers une leçon inexistante | **0** |
| liens `/day/<n>` hors de 1–365 | **0** |

**La seule référence morte du corpus** est le lab `terminal` cité par
`terminal-shell-filesystem`. Vérifié : `LAB_ROUTES` (dans `app/doc/[...slug]/page.tsx`) déclare
`kubernetes`, `security`, `cloud-architecture` et `pipeline` — pas `terminal`. Il n'existe pas
non plus de route `/terminal` ; les tâches de terminal (`data/terminal-tasks/`) sont servies à
l'intérieur de `/lab/[exerciseId]`. Le lien rendu est donc `null` : le texte s'affiche sans
être cliquable. **Défaut réel, mineur, corrigeable au CP12.**

### Les cinq anomalies de sonde, publiées comme l'exige la règle 6 du sprint

| # | ce que la sonde annonçait | la réalité | cause |
|---|---|---|---|
| 1 | 24 identifiants morts (`while`, `push`, `auto`, `main`, `email`, `express`, `healthcheck`…) | **0** | tout mot entre accents graves était pris pour un identifiant de produit |
| 2 | 9 identifiants morts (`min-width`, `grid-template-areas`, `auto-fill`, `cherry-pick`, `aria-describedby`…) | **0** | restreindre aux identifiants **composés** ne suffit pas : propriétés CSS, commandes Git et attributs HTML ont la même forme |
| 3 | 10 `practiceRefs` morts | **1** | un **lab** n'est pas un fichier JSON mais une **route** ; 9 des 10 étaient vivants |
| 4 | 5 leçons de l'échantillon « sans pratique » ou « sans exemple guidé » | **0** | la sonde exigeait l'émoji `🧭`/`🛠️` ; le corpus emploie aussi `🛠`, `🔬`, `🔥`, `🧪`, ou pas d'émoji du tout |
| 5 | 5 prérequis « sans clause d'optionalité » | **0** | le préfixe `>` des encadrés coupait la phrase (« rien > ici ne suppose ») |

**Conclusion méthodologique, et elle vaut pour tout V73** : la propriété « référence morte » ne
se détecte **pas** en scannant du texte. Elle se lit dans les **déclarations** — `practiceRefs`,
`day-exercises.json`, `LAB_ROUTES` — c'est-à-dire aux endroits où le produit affirme qu'un
identifiant existe. Toute sonde de V73 qui parcourt de la prose pour y trouver une propriété
structurelle sera suspecte par construction.

---

## 13. Contrôle de non-régression académique (J)

**Échantillon stratifié de 24 leçons, graine `20260910` publiée avant le tirage**, générateur
déterministe (`scripts/v73/cp0-echantillon.mjs`, rejouable), publié dans
`docs/v73/CP0-ECHANTILLON-24.json`.

| contrainte | résultat |
|---|---|
| taille | **24** |
| périodes | début 7 · milieu 5 · fin 6 · **hors parcours 6** |
| domaines distincts | **17 sur 17** |
| longueur | 12 au-dessus de la médiane du corpus (3 489 mots) |
| notes V71 (D14 moyen) | de **4,79** à **5,00** ; **6 sous 4,90** |

> **Anomalie de tirage publiée.** Le premier jet parcourait les strates en ordre alphabétique
> de clé et donnait 11 « début », 7 « fin », 6 « hors » et **zéro « milieu »** — parce que
> « milieu » vient après « hors » dans l'alphabet et tombait sous le plafond de 24. Le défaut
> était dans le tirage, pas dans le corpus. Corrigé par un parcours en tourniquet sur les
> périodes.

### Profondeur de lecture, déclarée

**8 leçons lues intégralement** : `async-javascript`, `refactoring-legacy-code`,
`machine-learning-basics`, `react-application-states`, `cloud-fundamentals`, `css-grid`,
`k8s-troubleshooting`, `nextjs-data-production`. **16 contrôlées par sections** (présence et
contenu des neuf sections structurantes, de la pratique, de la correction).

### Résultat

**Les 24 leçons ont les neuf sections structurantes, une pratique et une correction. Aucune
n'en manque une seule.**

Les huit lues intégralement sont **excellentes**, et pas au sens d'une impression :

- `async-javascript` publie des mesures reproductibles (×3,67 entre boucle et `Promise.all` ;
  20 000 microtâches affamant un `setTimeout(0)`) et donne **la limite de sa propre analogie** :
  « ce qui se déroule en parallèle, c'est l'attente, pas ton code » ;
- `machine-learning-basics` fabrique **87 % de justesse à partir de données purement
  aléatoires**, publie l'écart sur quatre graines (+0,32 stable), et conclut « retiens l'écart,
  pas la décimale » ;
- `react-application-states` démontre par dénombrement que trois booléens représentent huit
  états dont quatre sont impossibles, puis **corrige la contradiction avec son propre exemple
  guidé** dans un encadré au lieu de la masquer ;
- `refactoring-legacy-code` fait écrire un test qui **grave un bug** et explique pourquoi cela
  ressemble à une faute professionnelle ;
- `css-grid` mesure `auto-fill` contre `auto-fit` dans Chromium via `getComputedStyle` et
  montre que la différence n'existe **que** sur la dernière rangée ;
- `k8s-troubleshooting` construit un arbre de décision où l'un des six incidents proposés
  **n'a volontairement pas de réponse dans l'arbre** ;
- `cloud-fundamentals` fait défendre « une seule zone de disponibilité » comme réponse
  correcte, contre la bonne pratique récitée ;
- `nextjs-data-production` déroule une journée de mise en ligne heure par heure, cinq
  incidents, **aucun bug de logique métier**.

**L'hypothèse « les cours sont mauvais » est donc fausse, et V73 ne doit pas la prendre pour
point de départ.** Quatre des huit lues intégralement sont **hors parcours**.

---

## 14. Problèmes classés

### P0 — bloquants pour la promesse du produit

| # | problème | preuve |
|---|---|---|
| **P0-1** | **`cloud` : compétence déclarée, chiffrée au mois 11 (`expectedScores.cloud = 2`), enseignée par ZÉRO journée** | §4 |
| **P0-2** | **CSS n'est enseigné nulle part** — 4 leçons hors parcours (16 969 mots), alors que le parcours demande des livrables d'interface (Projet 3 BiblioApp, « états soignés ») | §5 |
| **P0-3** | **Next.js : 4 leçons hors parcours, aucune séquence d'apprentissage**, alors que le produit lui-même est en Next.js | §5 |

### P1 — incohérences structurelles mesurées

| # | problème | preuve |
|---|---|---|
| **P1-1** | 22 leçons hors parcours = **16 % du corpus**, dont plusieurs des meilleures | §5, §13 |
| **P1-2** | `difficulty` figé à **3 pendant 271 journées consécutives**, affiché à l'apprenant | §10 |
| **P1-3** | **13 thèmes de semaine sur 52** décrivent une autre semaine que la leur | §11 |
| **P1-4** | La **relecture des leçons en revue n'est jamais budgétée** : 104 min médians ajoutés à 90 min annoncés | §8 |
| **P1-5** | **Espacement médian de 2 jours** entre une revue et le contenu qu'elle révise — révision immédiate, pas répétition espacée | §8 |
| **P1-6** | **`algo`, `ds`, `patterns`, `gitlinux` : aucun rappel pendant les 290 à 326 derniers jours**, alors que j365 propose de l'algorithmique | §9 |

### P2 — défauts localisés

| # | problème | preuve |
|---|---|---|
| **P2-1** | `patterns` : 2 journées, 1 leçon, **0 pratique**, mais niveau 3 attendu au mois 10 | §4 |
| **P2-2** | `rag` (36 j) a 4 pratiques, `evalia` (18 j) en a 4, `ml` (30 j) en a 6 — contre 47 pour `se` | §4 |
| **P2-3** | **Découpage horaire présent sur 26 journées, toutes au mois 1**, absent des 339 autres | §10 |
| **P2-4** | 3 revues UNDERLOADED (j126, j154, j364) : une semaine consolidée par une seule leçon | §8 |
| **P2-5** | 1 référence morte : lab `terminal` sans route | §12 |
| **P2-6** | `autonomy` : 23 journées, **0 leçon** ne déclare la compétence | §4 |

### P3 — à surveiller, pas à corriger sans preuve

| # | point |
|---|---|
| **P3-1** | 6 journées IMPOSSIBLE en hypothèse de référence, **0 à 60 selon la vitesse de lecture** — le chiffre seul ne prouve rien (§7) |
| **P3-2** | 40 journées UNDERLOADED — c'est une **ressource** pour le CP3 autant qu'un défaut |
| **P3-3** | `evalia` évalué au mois 6 avant sa première journée étiquetée : **faux positif**, le mois 6 enseigne l'évaluation sous l'étiquette `ml` |

---

## 15. Plan CP1 → CP15

| CP | objet | livrable principal |
|---|---|---|
| **CP1** | Contrat curriculum gelé : définitions (enseignée / pratiquée / produite / révisée / maîtrisée), statuts de leçon, règles d'intégrité, **seuils de charge gelés après mesure CP0 et avant toute modification** | `V73-CURRICULUM-CONTRACT-FROZEN.md` |
| **CP2** | Graphe canonique compétence → concept → leçon → journée → pratique → preuve → revue → projet, **construit sur `lib/curriculum-graph.mjs` qui existe déjà**, pas en doublon | `docs/v73/curriculum-graph.json` + tests négatifs |
| **CP3** | Fermeture des trous : CSS, Next.js, Cloud/DevOps, en utilisant les **31 journées UNDERLOADED des mois 4–6** ; 365 journées inchangées | ledger BEFORE→AFTER |
| **CP4** | Statut explicite des 22 hors parcours : CORE / ADVANCED / OPTIONAL / REFERENCE / DEPRECATED, **aucune zone grise** | `V73-CURRICULUM-LEDGER.md` |
| **CP5** | Clôture des prérequis avec la taxonomie sémantique ; l'ambiguïté A/B disparaît définitivement | `V73-PREREQUISITE-LEDGER.md` |
| **CP6** | Modèle de charge décomposé (lecture / guidé / pratique / correction / projet / revue), P10-P90, sensibilité aux trois vitesses | rapport + instrument |
| **CP7** | Reconception des 52 revues : rappel actif plutôt que relecture, relecture **budgétée** | BEFORE/AFTER de charge |
| **CP8** | Modèle de contacts pédagogiques (exposition / pratique / rappel / application / revue), distances, anomalies structurelles — **données consommables par le futur Retention Engine, pas le moteur lui-même** | `V73-RETENTION-READINESS.md` |
| **CP9** | Progression J1→J365 : `difficulty` dérivée du travail réellement demandé, pas d'une pente | ledger |
| **CP10** | 52 semaines et 12 mois : intitulés qui décrivent réellement leur contenu | ledger |
| **CP11** | Pratique et projets à l'échelle du parcours : toute compétence enseignée finit par servir | cartographie |
| **CP12** | Intégrité factuelle et références : lab `terminal`, `readingMinutes`, affirmations vérifiables **exécutées** | rapport |
| **CP13** | Audit aveugle de 32 leçons/journées, échantillon figé **avant** lecture des résultats | rapport |
| **CP14** | Portique : tests, tsc, build, gates, **12 tests négatifs vus échouer** | rapport |
| **CP15** | Rapport final long, 22 sections, deux questions, verdict `CURRICULUM_INTEGRITY_*` | `V73-FINAL-REPORT.md` |

---

## 16. Ce que le CP0 a modifié

**Rien.** Aucune journée, aucune leçon, aucune donnée de programme, aucun fichier de
progression. Quatre fichiers créés : ce rapport, `V73-STATE.md`, `CP0-ECHANTILLON-24.json`, et
les deux instruments `scripts/v73/cp0-forensique.mjs` et `scripts/v73/cp0-echantillon.mjs`.
