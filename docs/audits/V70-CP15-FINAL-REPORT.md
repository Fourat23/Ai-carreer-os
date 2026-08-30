# V70 — CP15 · Rapport final

**Périmètre évalué : les 128 leçons du corpus.** Pas les leçons touchées.
Contrat opposable : `docs/V70-ACADEMIC-CONTRACT-FROZEN.md`, gelé au CP1, avant la
première modification de leçon. Aucun seuil de ce contrat n'a été déplacé.

---

## 1. Verdict

### `ACADEMIC_QUALITY_CANDIDATE`

**Pas `ACADEMIC_QUALITY_READY`.** La raison est écrite en clair en §4 : quatre des douze
conditions du contrat exigent une note sur quatorze dimensions pour **chacune** des 128
leçons. Cette notation n'a pas été produite par lecture intégrale des 128 pendant ce
sprint. Elle ne peut pas être remplacée par une sonde — le CP15 a démontré, mesures à
l'appui, qu'aucune expression régulière ne sait noter un raisonnement (§6).

Déclarer READY sur ces quatre conditions reviendrait à déclarer READY sur un périmètre
partiel, ce que le contrat interdit explicitement (§5.6 du contrat). Le corpus est
nettement meilleur qu'au CP0, tous les chiffres mécaniques le montrent, et il reste une
étape d'évaluation qui n'a pas été faite.

---

## 2. Ce qui a changé, mesuré avec les mêmes sondes aux deux dates

Toutes les valeurs ci-dessous sont produites par les **mêmes fonctions** appliquées au
corpus du commit `35c3c79` (CP0) et au corpus actuel. Le corpus CP0 a été extrait avec
`git archive` et mesuré séparément ; ce n'est pas un chiffre de mémoire.

| métrique | CP0 | CP15 |
|---|---|---|
| mots par leçon — minimum | 956 | **2 256** |
| mots par leçon — p10 | 1 093 | **2 480** |
| mots par leçon — médiane | 1 900 | **3 026** |
| mots par leçon — maximum | 3 251 | 4 456 |
| correction — minimum | **0** | **302** |
| correction — p10 | **0** | **449** |
| correction — médiane | 316 | **644** |
| exemple guidé — minimum | 18 | **333** |
| exemple guidé — médiane | 109 | **775** |
| leçons avec ≥ 2 sections de pratique | 47 / 128 | **94 / 128** |
| leçons sans aucune pratique | 1 / 128 | **0 / 128** |
| leçons avec vérification de compréhension | 43 / 128 | 50 / 128 |

**Le chiffre le plus significatif n'est pas la médiane, c'est le bas de la
distribution.** Le p10 des corrections passe de 0 à 449 mots : au CP0, plus de dix leçons
sur cent n'avaient aucune correction repérable. C'est ce que le contrat cherchait à
empêcher en interdisant de faire monter une moyenne par le haut (§5.5 du contrat).

**Ce que ces chiffres ne prouvent pas.** Aucun d'eux n'est une note. Une leçon de
3 000 mots peut tourner autour de son sujet. Le nombre de mots n'entre dans aucune des
quatorze dimensions, et il n'entre pas davantage dans ce verdict — il est publié comme
descripteur du corpus, pas comme résultat.

---

## 3. Périmètre réellement traité

| | leçons |
|---|---|
| corpus | 128 |
| modifiées entre `35c3c79` et aujourd'hui | **128** |
| dont modifiées pendant CP4→CP14 | 120 |
| dont modifiées au CP15 (lot des huit) | 8 |

**Le lot des huit, et pourquoi il existe.** `git diff 35c3c79..HEAD` montrait au début du
CP15 que huit leçons n'avaient jamais été touchées : `ai-security`, `clean-code`,
`data-structures-intro`, `design-patterns-intro`, `git-fundamentals`, `rag-fundamentals`,
`recursion`, `statistics-for-ml`. Le CP0 les avait jugées saines et la priorisation les
avait écartées.

C'était juste au CP0 et faux au CP14 : le corpus avait monté autour d'elles. Sept des huit
avaient une correction sous la médiane et une seule section de pratique là où le reste du
corpus en avait deux. **Elles n'étaient pas devenues mauvaises ; elles étaient devenues en
dessous.** Le périmètre de vérité étant le corpus complet, elles sont rentrées dans le lot.

### 3.1 — Le plan de lots ne s'est pas exécuté sur trois leçons

Confrontation du ledger du CP3 au `git log`, faite au CP15 et non supposée :

| leçon | priorité CP3 | lot annoncé | traitée pendant ce lot ? |
|---|---|---|---|
| `data-structures-intro` | P3 | CP4→CP9 (lot CP6) | **non** — rattrapée au CP15 |
| `statistics-for-ml` | P3 | CP4→CP9 (lot CP6) | **non** — rattrapée au CP15 |
| `recursion` | P3 | CP4→CP9 (lot CP9) | **non** — toujours non traitée |

Ces trois leçons portaient une priorité, un lot leur était assigné, et le lot ne les a pas
traitées. Le fait n'est apparu qu'au CP15, en comparant le plan à l'historique Git.
**Un plan de lots ne prouve pas qu'un lot a été exécuté ; seul l'historique le prouve.**
C'est la raison pour laquelle le lot des huit a été déclenché par un `git diff` et non par
une relecture du plan.

Le cas de `recursion` est traité en §7.7 : non traitée par décision, pas par oubli, une
fois le CP15 l'ayant identifiée.

---

## 4. Les douze conditions du contrat, une par une

| # | condition | seuil | mesuré | verdict |
|---|---|---|---|---|
| 1 | moyenne du corpus sur 14 dimensions | ≥ 4,20 | **non produite** | **NON VÉRIFIÉE** |
| 2 | aucune dimension sous | 4,00 | **non produite** | **NON VÉRIFIÉE** |
| 3 | leçons portant un défaut bloquant | 0 | voir §4.1 | **PARTIEL** |
| 4 | leçon critique sous | 3,80 | **non produite** | **NON VÉRIFIÉE** |
| 5 | écart corpus ↔ échantillon aveugle | ≤ 0,30 | non calculable sans 1 | **NON VÉRIFIÉE** |
| 6 | sigles employés sans introduction | 0 | **0 leçon, 0 occurrence** | **ATTEINTE** |
| 7 | corrections réduites à la réponse | 0 | **0 / 128** | **ATTEINTE** |
| 8 | exercices sans livrable observable | 0 | **1 / 128** (faux négatif déclaré) | **ATTEINTE de fait** |
| 9 | plus grande série à titres identiques | ≤ 6 | **6** | **ATTEINTE** |
| 10 | leçons auditées | 128 / 128 | mécanique : 128 ; **notée : non** | **PARTIELLE** |
| 11 | affirmation technique fausse connue | 0 | **0** | **ATTEINTE** |
| 12 | intégrité 365 journées / progress.json / corpus | inchangés | **inchangés** | **ATTEINTE** |

### 4.1 Défauts bloquants — état réel

| défaut | mesuré |
|---|---|
| B2 exemple guidé à zéro décision | non mesurable par sonde ; voir §6 |
| B3 aucune pratique / pratique sans production observable | **1** (`html-semantic-structure`, faux négatif déclaré) |
| B4 aucune correction / correction réduite à la réponse | **0** |
| B1, B5, B6, B7, B8 | exigent une lecture ; non recensés sur les 128 |

La condition 3 est donc **partielle** : les deux défauts bloquants mécaniquement
détectables sont à zéro (au faux négatif déclaré près), les six autres n'ont pas été
recensés sur l'ensemble du corpus.

### 4.2 Condition 9 — précision d'honnêteté

Elle valait **7** au début du CP15, donc en échec d'une unité. Elle vaut **6** maintenant.

**Ce n'est pas le résultat d'un travail visant ce compteur.** Le groupe de sept leçons à
séquence de titres identique contenait `git-fundamentals`, `rag-fundamentals` et
`statistics-for-ml` — trois membres du lot des huit. En recevant chacune un exercice
difficile et une vérification de compréhension, leur séquence de titres a changé, et le
groupe s'est scindé. **Aucun titre n'a été renommé pour faire baisser le compteur**, ce
qui aurait été exactement le geste interdit par le contrat.

Le fait que la condition ait été franchie *par effet de bord* est publié ici précisément
parce qu'un lecteur pourrait, à juste titre, soupçonner l'inverse.

---

## 5. Corrections apportées à des chiffres déjà publiés

Cette section existe parce que trois chiffres annoncés plus tôt dans V70 étaient faux.
Ils sont corrigés ici, avec la cause.

**5.1 — Le jargon : « 1 occurrence » était surestimé à la baisse.** Le CP11 annonçait une
seule occurrence de terme technique employé sans définition. Le CP14 a démontré deux
défauts de la sonde : le marqueur `|Vocabulaire`, qui est un titre de section présent dans
**128 leçons sur 128** et validait donc n'importe quel terme ; et un marqueur
« parenthèse explicative » cherché dans une fenêtre de 660 caractères, qu'une parenthèse
sans rapport située 60 caractères plus loin suffisait à satisfaire.

Avec le détecteur resserré, la vraie ligne de base était **20 termes nus dans 18 leçons**.
Les vingt ont été glosés. La sonde reporte aujourd'hui 0 leçon, 0 occurrence.

Détail qui a valeur de contre-épreuve : retirer `|Vocabulaire` **seul** ne changeait pas le
compte. Cela établit que le travail de glossage du CP11 était réel et non un artefact.

**5.2 — Les identifiants de commit ne sont pas reproductibles.** La leçon
`git-fundamentals` annonçait, dans une première rédaction du CP15, que les identifiants
produits par le script de vérification seraient les mêmes chez l'apprenant. Deux exécutions
consécutives donnent `5305b33 → a55da47` puis `2e22a12 → 05c0266` : un identifiant Git est
le condensat du contenu **et de la date**. Le texte publié distingue désormais les comptes
d'occurrences, qui sont reproductibles, des identifiants, qui ne le sont pas.

**5.3 — Une ligne de tableau recopiée de travers.** Le tableau de découpage de
`rag-fundamentals` indiquait, pour le réglage 800/200, 13 600 mots stockés et 13 % de
surcoût. La mesure dit 16 000 et 33 %. Corrigé avant publication.

---

## 6. La sonde qui ne mesure pas ce qu'elle prétend — publiée telle quelle

Le CP15 a construit une seconde sonde de correction, `corrD9`, censée corriger la sonde
d'origine `corrRaisonne`, jugée trop littérale. **Elle ne la corrige pas.**

| sonde | leçons jugées suffisantes |
|---|---|
| `corrRaisonne` (CP0, inchangée) | 119 / 128 |
| `corrD9 ≥ 3` (CP15, ajoutée) | 118 / 128 |

Les deux se contredisent **dans les deux sens**. Les dix leçons que la sonde étendue place
sous le seuil ont été **lues intégralement**. Les dix contiennent les cinq éléments exigés
par D9. Contre-exemples établis :

- `deployment-strategies`, notée 1/5 : contient « Trois erreurs de détail à éviter »,
  « cinq migrations au lieu d'une », « Le point de conception qui départage une bonne
  réponse ». La sonde cherche « erreur à éviter » d'un seul tenant et « au lieu de » ; le
  texte écrit « erreurs de détail à éviter » et « au lieu d'une ». Deux échecs
  d'appariement, sur une élision et sur un mot intercalé.
- `async-javascript` : notée 2/5 par la sonde étendue, **vraie** pour la sonde d'origine —
  sa correction contient littéralement « L'erreur probable » et « Alternative défendable ».
- `machine-learning-basics`, `react-accessibility`, `design-patterns-intro` : notées 2/5,
  alors que chacune ouvre sur « La démarche » et « L'erreur probable » en toutes lettres.

**Ce que j'ai refusé de faire.** Élargir les familles d'expressions jusqu'à ce que les 128
passent. Le résultat aurait été un joli chiffre et aucune information. Une expression
régulière sur de la prose française reconnaît des mots, pas un raisonnement. Le contrat le
prévoyait d'ailleurs dans son §6, « ce que ce barème ne sait pas faire ».

La sonde reste dans le code, avec ce verdict écrit dedans, comme instrument de
dégrossissage. **D9 se note par lecture.** La condition 7 du contrat, elle, est mesurée par
`corrSeuleReponse`, qui compte des mots et non des tournures, et vaut 0/128.

---

## 7. Résultats négatifs publiés sans être corrigés

Le contrat interdit d'ajuster une mesure parce qu'elle déplaît. Sept mesures défavorables
ont été publiées telles quelles dans le corpus ou dans les rapports.

1. **Fuite du scaler : +0,00 point exactement.** La leçon annonçait une dégradation ; la
   mesure n'en montre aucune. Publiée avec l'explication : la gravité d'une fuite dépend de
   la quantité d'information qui fuit — une variable dérivée de la cible donne +18,68.
2. **ReLU échoue sur le OU exclusif 7 fois sur 20 graines.** La graine n'a pas été changée.
   La fréquence a été mesurée et publiée comme leçon sur les neurones morts.
3. **La démonstration d'attention ne montre aucune sémantique** (« la » 70,6 %,
   « riviere » 8,6 %). Les vecteurs n'ont pas été truqués. La section a été réécrite pour
   dire ce que le script démontre réellement : le mécanisme, pas le sens.
4. **Le mécanisme d'attente disque (état D) n'a pas pu être reproduit** — le stockage est
   trop rapide. Déclaré comme énoncé sans mesure.
5. **Une correction de `javascript-basics` fait 231 mots**, sous mon propre seuil de
   travail. Publiée telle quelle.
6. **Le `Set` perd contre le tableau jusqu'à ~50 recherches.** Résultat contraire à ce
   qu'enseignent les cours d'algorithmique ; publié, et transformé en leçon.
7. **`recursion` garde une correction de 523 mots**, sous la médiane du corpus. Je n'ai
   pas trouvé de manque réel à combler et je refuse d'allonger pour aligner un chiffre.

---

## 8. Ce qui reste insuffisant — la liste précise

Le contrat vaut mieux qu'un verdict global. Voici les manques nommés.

### 8.1 — Non vérifié (et non « satisfait »)

**La notation des 128 leçons sur les quatorze dimensions n'existe pas.** C'est le manque
principal, et il commande les conditions 1, 2, 4 et 5. Un audit aveugle de 24 leçons a été
produit au CP13 (`docs/audits/V70-CP13-BLIND-AUDIT.md`) ; 24 n'est pas 128, et l'écart
corpus ↔ échantillon (condition 5) ne peut pas être calculé sans le terme « corpus ».

### 8.2 — Trente-quatre leçons avec une seule section de pratique

Le reste du corpus en a deux. Ce n'est pas un défaut bloquant, c'est une inégalité de
traitement. Concentration nette sur deux familles :

- **Cloud (7)** : `cloud-aws-core`, `cloud-azure-core`, `cloud-compute-storage`,
  `cloud-finops`, `cloud-fundamentals`, `cloud-networking`, `iac-fundamentals`
- **Kubernetes (6)** : `k8s-config-probes`, `k8s-networking-services`, `k8s-security`,
  `k8s-troubleshooting`, `k8s-why-architecture`, `k8s-workloads`
- **Autres (21)** : `ai-evaluation`, `api-design-basics`, `api-production-contracts`,
  `async-messaging-queues`, `browser-dom-rendering`, `database-migrations`,
  `distributed-systems-failures`, `docker-networking-volumes`, `frontend-testing`,
  `html-semantic-structure`, `linux-resources-io`, `machine-learning-basics`,
  `networking-addressing-routing`, `nextjs-rendering`, `python-foundations`,
  `refactoring-legacy-code`, `sql-performance-indexing`, `system-design-scaling`,
  `technical-documentation`, `testing-foundations`, `typescript-frontend`

Les treize leçons Cloud et Kubernetes partagent une cause matérielle : **le démon Docker ne
tourne pas dans cet environnement, et systemd non plus**. Aucune commande `docker` n'a été
exécutée de tout le sprint. Leur pratique ne peut donc pas être vérifiée par exécution
comme le reste ; elle est écrite avec cette limite déclarée. La couche Docker a tout de même
été vérifiée réellement, par montage `overlayfs` — c'est le seul mécanisme qui ait pu l'être.

### 8.3 — Douze corrections sous le p10 du corpus (449 mots)

`terminal-shell-filesystem` (302), `http-rest-json` (380), `algorithmic-thinking` (395),
`python-foundations` (420), `metrics-percentiles` (422), `ai-evaluation` (424),
`typescript-frontend` (427), `machine-learning-basics` (428), `api-design-basics` (432),
`agents-fundamentals` (441), `llm-fundamentals` (446), `sql-foundations` (447).

Un chiffre bas n'est pas un défaut — `git-fundamentals` était la référence du CP0 avec
333 mots d'exemple guidé. Cette liste est un **point de départ de lecture**, pas un verdict.

### 8.4 — Défauts nommés restants

| leçon | manque |
|---|---|
| `html-semantic-structure` | seule leçon à `pratiqueLivrable = faux`. **Faux négatif déclaré** : l'énoncé dit « Réécris », et l'expression exige un caractère non-lettre avant le verbe, or « é » est une lettre. La liste de verbes n'a pas été élargie après avoir vu ce qu'elle coûte. |
| `error-handling` | `exoPassif = vrai` : l'exercice principal ouvre par une formule de contrôle de compréhension. |
| `recursion` | correction à 523 mots, non étendue — voir §7.7. |
| `ai-security`, `llm-observability` | écarts de forme relevés au CP13 et délibérément non corrigés. |
| `javascript-basics`, `terminal-shell-filesystem` | prérequis sans renvoi vers une leçon amont. Ce sont les deux points d'entrée du programme : il n'y a pas d'amont. Signalé, non corrigé, à confirmer comme comportement voulu. |

### 8.5 — Dette d'outillage : aucune porte ne couvre les 128 leçons

`scripts/v35-check.mjs` valide un `perimeter` de **12 leçons**, pas 128. Il n'existe donc
aucune porte automatique vérifiant les marqueurs de rédaction et les liens morts sur
l'ensemble du corpus.

Mesure faite à la main au CP15 sur les 128 : **0 lien mort** vers une leçon inexistante,
et **4 correspondances** du motif de marqueur — toutes des faux positifs, le mot
`placeholder` étant l'attribut HTML enseigné par `web-forms-validation`. Cette mesure a été
faite ; elle n'est pas automatisée. La porte reste à écrire, avec la distinction
majuscules/minuscules que ces quatre faux positifs imposent.

---

## 9. Les 25 leçons hors parcours — proposition de rattachement

Le brief demande d'améliorer ces leçons **sans les rattacher silencieusement** aux 365
journées, un rattachement étant une décision de curriculum. Elles ont été améliorées comme
le reste. Voici la proposition, **non appliquée**, à valider par une personne.

### Les 25, par famille

| famille | leçons | volume |
|---|---|---|
| Cloud (7) | `cloud-fundamentals`, `cloud-aws-core`, `cloud-azure-core`, `cloud-compute-storage`, `cloud-networking`, `cloud-finops`, `iac-fundamentals` | 2 327 – 2 669 mots |
| Kubernetes (6) | `k8s-why-architecture`, `k8s-workloads`, `k8s-networking-services`, `k8s-config-probes`, `k8s-security`, `k8s-troubleshooting` | 2 348 – 2 598 |
| CSS / responsive (4) | `css-fundamentals`, `css-flexbox`, `css-grid`, `responsive-design` | 3 318 – 4 456 |
| Next.js (4) | `nextjs-foundations`, `nextjs-rendering`, `nextjs-server-client-components`, `nextjs-data-production` | 2 303 – 4 174 |
| Exploitation (4) | `linux-services-systemd`, `linux-ssh-remote`, `deployment-strategies`, `release-incident-recovery` | 2 765 – 3 026 |

### Proposition

**Option retenue si une seule doit l'être : rattacher les 4 CSS et les 4 Next.js, laisser
les 17 autres hors parcours.**

Raisons, dans l'ordre :

1. **CSS et Next.js sont des prérequis de travaux déjà programmés.** Le parcours demande
   de construire des interfaces avant d'avoir enseigné la mise en page ou le rendu
   serveur/client. C'est le seul cas où le hors-parcours crée un **trou amont**, et le
   seul où le rattachement corrige un défaut plutôt que d'ajouter du contenu.
2. **Cloud et Kubernetes sont un choix de carrière, pas un socle.** Les rattacher
   imposerait treize journées à tous les apprenants pour un contenu qui ne concerne qu'une
   partie d'entre eux. Ils fonctionnent mieux en **module optionnel déclaré**, avec une
   entrée explicite depuis le parcours.
3. **Ce sont aussi les treize dont la pratique n'est pas vérifiable ici** (§8.2). Les
   rattacher reviendrait à mettre sur le chemin obligatoire les leçons dont la pratique est
   la moins éprouvée. Si rattachement il y a, il vient **après** la levée de cette limite.
4. **Exploitation (4)** : à trancher au cas par cas. `release-incident-recovery` a un
   rapport direct avec des journées existantes sur le déploiement ; les trois autres sont
   des compléments.

**Coût du rattachement des 8 (CSS + Next.js)** : huit journées à insérer, donc huit
journées à déplacer en aval, ou un allongement du programme. **C'est précisément la raison
pour laquelle la décision n'est pas prise ici** : elle touche l'invariant des 365 journées,
que V70 n'a pas le droit de modifier.

---

## 9 bis. La conséquence non voulue : le temps de lecture a augmenté de 48 %

Trouvée au dernier contrôle du CP15, en relançant `npm run generate` : le fichier généré
`data/program.json` avait dérivé du corpus. La dérive porte sur `readingMinutes`, qui est
**calculé à partir de la longueur des leçons**. V70 a allongé les leçons ; les temps de
lecture ont suivi mécaniquement.

| | CP0 | CP15 |
|---|---|---|
| lecture par journée — min / médiane / max | 21 / 51 / 297 min | **29 / 74 / 454 min** |
| total sur les 365 journées | 337 h | **500 h** |
| variation | — | **+48,1 %** |

**Ces chiffres ne sont pas fabriqués : ils sont recalculés par le générateur à partir du
texte réel.** Le brief interdit de fabriquer des temps d'étude ; il n'interdit pas de
publier ceux que le contenu impose. C'est ici le second cas.

**Journées où la lecture seule dépasse le budget horaire de la journée** : **1 au CP0,
3 au CP15**. Les trois sont les revues hebdomadaires des semaines 10, 11 et 12
(journées 70, 77 et 84), qui agrègent les leçons de leur semaine :

| journée | budget | lecture | ratio |
|---|---|---|---|
| 70 — revue semaine 10 | 4,5 h | 4,5 h | ×1,0 |
| 77 — revue semaine 11 | 4,5 h | 7,6 h | **×1,7** |
| 84 — revue semaine 12 | 4,5 h | 5,5 h | ×1,2 |

**Ce que je n'ai pas fait.** Ni raccourcir des leçons pour faire rentrer ces trois journées,
ni relever le budget horaire. Les deux seraient des ajustements après avoir vu le résultat.

**Nuance qui compte pour l'interprétation**, et qui n'excuse rien : sur une journée de
revue, la « lecture » est une **relecture** de matière déjà vue. Une relecture ne se fait
pas à la vitesse d'une première lecture, et l'estimateur ne fait pas cette distinction —
il applique un débit unique à un volume de mots. Les 7,6 heures de la journée 77 sont donc
un majorant, pas une prévision. Reste que l'estimateur dit ce qu'il dit, et que 3 journées
sur 365 sortent du budget là où il y en avait 1.

**Pour V71** : soit l'estimateur distingue première lecture et relecture, soit les revues
hebdomadaires sélectionnent au lieu d'agréger. La première option est un travail
d'outillage, la seconde une décision de curriculum — donc hors du droit de V70.

---

## 10. Intégrité

| élément | état |
|---|---|
| 365 journées | **inchangées** — aucune supprimée, aucune réordonnée |
| `progress.json` | **non réécrit** |
| leçons rattachées silencieusement | **aucune** |
| progression utilisateur inventée | **aucune** |
| `curriculum/days/*.md` modifiés à la main | **aucun** — ce sont des fichiers générés |
| gel du corpus | refixé à chaque commit sur les neuf portes |

**Validation au dernier commit** : `npm run gates:active` vert · `npx tsc --noEmit` 0 erreur
· `npm test` **1420 / 1420** · `npm run v70:verify` **46 / 46 scripts, 0 ancre manquante**
· tests négatifs **11 / 11**.

---

## 11. L'outillage produit par V70

**49 scripts de vérification exécutables** dans `scripts/v70-verifications/` (46 exécutés
par le rejeu, plus les trois ajoutés au CP15), en JavaScript, Python et shell. Ils
produisent les chiffres cités dans les leçons ; aucun chiffre de correction n'est inventé.

**`npm run v70:verify`** rejoue les 46 et vérifie **51 ancres numériques** — chaque nombre
cité dans une leçon est recherché dans la sortie du script qui le produit. Une leçon ne
peut donc pas dériver de son script sans que le rejeu le signale.

Ce rejeu **n'est pas dans `gates:active`**, et c'est une décision assumée : il dure sept
minutes, dont deux pour un seul script qui clone un dépôt. L'ajouter pousserait à
contourner la porte entière. Il est lancé explicitement.

**11 tests négatifs** (`scripts/v70/tests-negatifs.mjs`) : chacun dégrade volontairement un
fichier réel et vérifie que le contrôle visé est vert avant, **rouge pendant**, vert après
restauration. 11/11.

**Un défaut du harnais lui-même, rencontré et corrigé.** Un premier lancement a dépassé le
délai ; `finally` ne s'exécute pas sur une terminaison forcée, et un fichier est resté
dégradé. Corrigé par un registre des fichiers en cours et des gestionnaires
`SIGINT`/`SIGTERM`/`SIGHUP` — c'est exactement le mécanisme enseigné par
`linux-processes-signals`. Le harnais qui teste les contrôles avait le défaut qu'il teste.

**Une porte mal ciblée, corrigée après mesure.** Le test d'une leçon vidée visait
`v66:render`. Mesure réelle sur `vector-databases.md` vidée : `curriculum:check` 0,
`depth-check` **1**, `glossary:check` 0, `v35` 0, `v48` **1**, `v66:render` **0**.
`v66:render` compare sections-source et sections-rendues : 0 contre 0, rien n'est perdu,
la porte passe — comportement **correct** de ce qu'elle mesure. Le test était mal ciblé,
pas la porte. Il vise désormais `curriculum:depth-check`.

---

## 12. Dix questions pour la suite

1. La notation des 128 leçons sur 14 dimensions doit-elle être produite par lecture
   humaine, ou accepte-t-on qu'elle reste une estimation par échantillon publiée comme
   telle ?
2. Les 34 leçons à une seule section de pratique doivent-elles toutes en recevoir une
   seconde, ou l'inégalité est-elle acceptable quand le sujet ne s'y prête pas ?
3. Faut-il un environnement avec démon Docker et systemd pour lever la limite des treize
   leçons Cloud/Kubernetes, avant tout rattachement au parcours ?
4. Les 8 leçons CSS et Next.js doivent-elles rejoindre les 365 journées, et si oui,
   quelles journées se déplacent ?
5. Écrit-on la porte manquante — marqueurs de rédaction et liens morts sur les 128 — et
   avec quelle règle pour les faux positifs du type `placeholder` ?
6. `javascript-basics` et `terminal-shell-filesystem` sont les deux points d'entrée sans
   amont. Confirme-t-on que l'absence de renvoi est voulue ?
7. Le rejeu de sept minutes doit-il entrer dans une porte d'intégration continue nocturne,
   puisqu'il n'entre pas dans `gates:active` ?
8. Faut-il retirer `corrD9`, dont le CP15 démontre qu'elle ne mesure pas D9, ou la garder
   avec son verdict comme mise en garde durable ?
9. Le corpus a doublé de volume médian depuis le CP0. À quel moment la longueur devient-elle
   elle-même un défaut, et quelle mesure le dirait ?
10. Les 25 leçons hors parcours doivent-elles apparaître dans l'interface comme un module
    optionnel déclaré, plutôt que comme un ensemble simplement non rattaché ?

---

## 13. Recommandation pour V71

**Un seul objet : produire la notation des 128 leçons sur les quatorze dimensions, par
lecture.** C'est le seul travail qui transforme `CANDIDATE` en un verdict fondé, dans un
sens ou dans l'autre.

Tout le reste — les 34 secondes pratiques, la porte manquante, le rattachement des 8 —
est identifié, chiffré et attendra. Aucun de ces chantiers ne change ce que le corpus vaut
pour un apprenant ; la notation, elle, dira s'il vaut ce que ce rapport suppose.

**V71 n'est pas lancé.**
