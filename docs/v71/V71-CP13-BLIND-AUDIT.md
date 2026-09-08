# V71 — CP13. Audit aveugle et contre-notation

**Ce que ce checkpoint devait faire.** Reprendre l'échantillon de 32 leçons figé au CP2,
**avant** toute correction, le relire sans regarder le ledger, le noter à nouveau, puis
comparer. Le but n'est pas de confirmer les notes : c'est de mesurer **de combien elles se
trompent**, et dans quel sens.

**Ce qu'il a réellement produit.** Les deux seuils gelés passent — mais le résultat qui
compte n'est pas là. L'audit aveugle a trouvé un défaut que la notation initiale n'avait
jamais pénalisé, **dans la même direction 17 fois sur 17**, et ce défaut existe aussi hors
échantillon. Le ledger a été corrigé à la baisse : moyenne générale **4,9554 → 4,9364**,
dimension D14 **4,984 → 4,734**.

**Aucun fichier de leçon n'a été modifié au CP13.** Ce checkpoint mesure ; il ne corrige pas.
La raison est donnée en §7 et elle est délibérée.

---

## 1. Les deux seuils gelés

Rappel : ces seuils ont été fixés au CP1, **avant** toute mesure, et n'ont pas bougé.

| Seuil | Énoncé | Mesure | Verdict |
|---|---|---|---|
| **S9** | écart moyen \|ledger − audit aveugle\| ≤ 0,40 | **0,0759** | PASSE |
| **S10** | leçons dont l'écart individuel dépasse 1,00 : ≤ 4 | **0** | PASSE |

Moyenne du ledger sur l'échantillon : **4,9554**. Moyenne de l'audit aveugle : **4,9107**.
Biais : **−0,0446** — l'audit aveugle est systématiquement un peu plus sévère.

### S9 est un test faible, par construction

Il faut le dire avant de s'en réjouir. Une note de leçon est la moyenne de **14** dimensions.
Si l'audit aveugle contredit le ledger sur **une** dimension, d'un point, la moyenne de la
leçon bouge de 1 ÷ 14 = **0,071**. Pour faire échouer S9 (0,40), il faudrait que l'audit
contredise le ledger sur **près de six dimensions par leçon, sur les 32**. Autrement dit :
S9 ne peut détecter qu'un effondrement, pas un désaccord ordinaire.

**S9 passe donc, mais son passage ne prouve pas grand-chose.** Ce que S9 exclut, c'est que le
ledger soit une invention. Il n'exclut pas que le ledger soit systématiquement trop généreux
sur un point précis — et c'est précisément ce qui s'est produit.

Le chiffre informatif n'est pas la moyenne des leçons. C'est l'accord **cellule par cellule**.

---

## 2. L'accord réel : 448 cellules, pas 32 notes

| | |
|---|---|
| cellules comparées (32 leçons × 14 dimensions) | **448** |
| accord exact | **401** — 89,5 % |
| désaccord | **47** — 10,5 % |
| dont l'audit aveugle est **plus sévère** | **33** sur 47 |

Répartition des 47 désaccords par dimension (entre parenthèses, ceux où l'aveugle est plus
sévère) :

| D14 | D1 | D5 | D10 | D12 | D6 | D4 | D8 | D11 | D9 |
|---|---|---|---|---|---|---|---|---|---|
| **17** (17) | 8 (6) | 4 (4) | 4 (0) | 4 (2) | 3 (0) | 2 (1) | 2 (2) | 2 (1) | 1 (0) |

**D14 concentre 36 % des désaccords, et les 17 vont tous dans le même sens.** Ce n'est pas du
bruit de notation : c'est un motif que la première lecture n'a pas vu.

---

## 3. Le motif : les sections d'ouverture se répètent

Chaque leçon ouvre sur trois ou quatre sections courtes — « 🌍 Le problème d'abord »,
« 🎯 Objectif », « 🧠 Modèle mental », « 💡 Pourquoi c'est important ». Dans 17 leçons de
l'échantillon, **deux de ces sections disent la même chose**, parfois mot pour mot.

Trois exemples, cités tels quels :

- **`technical-storytelling`** — « Un projet qu'on ne sait pas raconter n'existe pas pour un
  employeur » figure **mot pour mot** dans le Problème d'abord ET dans l'Objectif.
- **`react-fundamentals`** — le basculement déclaratif est énoncé **trois fois** dans trois
  sections adjacentes : « travail de plombier vers travail de dessinateur », puis
  « UI = f(state) », puis « Déclaratif (QUOI), pas impératif (COMMENT) ».
- **`transformers`** — « le sens d'un mot vient de son contexte » est illustré **trois fois**
  par trois images différentes (la souris animal/objet, la salle de réunion, banque/prêt
  contre banque/fleuve). Chacune est bonne ; ensemble, elles font une longueur.

L'ancre D14 = 4 gelée au CP1 dit : « quelques longueurs ou une formule de remplissage ».
Le motif tombe exactement dessous. **Le CP3 ne l'avait pas pénalisé une seule fois.**

Pourquoi le CP3 est passé à côté : il lisait chaque section pour ce qu'elle contient, et
chaque section est juste. Le défaut n'est visible que si l'on lit les trois **d'affilée, en
se demandant ce que la deuxième ajoute à la première**. C'est ce que fait un apprenant.

---

## 4. Extension hors échantillon — et ce qu'elle ne prouve pas

Refuser d'extrapoler : l'échantillon aveugle fait 32 leçons, il en reste 96 non relues. Le
motif y est-il présent ? La seule réponse honnête est de mesurer.

**La sonde.** `scripts/v71/cp13-redite-ouverture.mjs` mesure le recouvrement de Jaccard sur
les mots porteurs (≥ 5 lettres, hors mots-outils) entre les quatre sections d'ouverture, deux
à deux. Seuil de signalement : 0,20. Elle signale **32 leçons sur 128**.

**Son rappel est mauvais, et c'est mesuré, pas estimé.** Sur les 17 leçons où ma lecture
aveugle a trouvé le défaut, la sonde n'en retrouve que **10**. Rappel = **10 / 17 = 59 %**.
Elle rate 7 cas sur 17, parce qu'une redite peut être une redite d'**idée** sans partager
assez de vocabulaire pour franchir 0,20.

**Sa précision non plus n'est pas bonne.** Sur les 22 leçons signalées **hors** échantillon,
je les ai toutes lues. **14 confirment le défaut, 8 sont écartées.** Précision = 64 %.

Les 8 écartées, avec la raison — parce qu'une sonde qui signale sans qu'on publie ses erreurs
est une sonde qu'on croit :

| Leçon | Recouvrement | Pourquoi la seconde section reste justifiée |
|---|---|---|
| `chunking-strategies` | 0,26 | l'Objectif ajoute les leviers *structure* et *overlap*, absents du problème |
| `rag-fundamentals` | 0,25 | le « Pourquoi » ajoute l'enjeu marché, les projets 6 et final, la défense en entretien |
| `resilience-patterns` | 0,22 | le modèle mental est une analogie électrique entièrement neuve (fusible, différentiel, groupe électrogène) |
| `k8s-workloads` | 0,23 | le modèle mental introduit la notion de **contrôleur**, qui n'est nulle part ailleurs |
| `k8s-why-architecture` | 0,20 | il nomme le glissement « ordres impératifs → état désiré réconcilié » |
| `nextjs-data-production` | 0,22 | trois idées numérotées neuves, dont le compromis cache / revalidation |
| `llm-fundamentals` | 0,20 | ajoute la question d'entretien qui trie (« pourquoi les LLM hallucinent-ils ? ») |
| `data-structures-intro` | 0,20 | deux phrases de redite, mais aussi « Redis est une hash map, RabbitMQ une queue, un index un arbre » |

**Le critère appliqué**, énoncé pour qu'il soit contestable : la seconde section est une
longueur quand, en la lisant après la première, on a le sentiment de relire le même
paragraphe — c'est-à-dire quand ce qu'elle ajoute tiendrait dans une incise de la première.
Une précision technique entre parenthèses ne sauve pas une section ; une idée nouvelle, un
critère, une distinction ou un enjeu de carrière, oui. C'est un jugement de lecteur, pas une
mesure. Il est publié leçon par leçon ci-dessous pour pouvoir être contredit.

**Les 14 confirmées** (D14 : 5 → 4) :

| Leçon | Ce qui est redit |
|---|---|
| `cloud-azure-core` | « MÊMES concepts », « Deux spécificités à intégrer d'emblée », « erreur numéro un » |
| `system-design-interview` | la méthode complète (clarifier → composants/flux → trade-offs → échelle/pannes) et « teste ton RAISONNEMENT » |
| `monitoring-production` | les quatre points, dont « j'ai déployé » / « je fais tourner un service » à l'identique |
| `deployment-secrets` | « hors du code, par environnement », « compromis pour toujours », « l'erreur qui coûte le plus cher » |
| `readme-documentation` | les 90 %, le 30 secondes / 5 minutes, « décide si ton code sera regardé » |
| `linux-resources-io` | le paragraphe entier des quatre ressources |
| `portfolio-github` | la liste des signaux négatifs et « le portfolio EST le CV technique » |
| `observability-logging` | les quatre points et « boîte noire indéfendable » mot pour mot |
| `ci-cd` | la phrase du robot (lint, teste, construit, AVANT que ça n'atteigne les autres) |
| `neural-networks` | la métaphore boutons / note / sens du réglage, développée intégralement deux fois |
| `docker-containers` | la phrase de la boîte, reprise mot pour mot |
| `k8s-networking-services` | Pods jetables / adresse stable / « load balancer interne » |
| `k8s-security` | le triplet RBAC / NetworkPolicy / securityContext, même ordre, mêmes parenthèses |
| `api-design-basics` | trois phrases du modèle mental pour une seule clause neuve |

---

## 5. Le comptage final est un PLANCHER, et voici de combien

C'est le point le plus important de ce rapport et il ne doit pas être arrondi.

| Population | n | D14 moyen | leçons à D14 < 5 | taux |
|---|---|---|---|---|
| échantillon aveugle (relu en entier) | 32 | **4,406** | **18** | **56 %** |
| hors échantillon (lu seulement là où la sonde pointe) | 96 | 4,844 | 15 | 16 % |
| corpus complet | 128 | **4,734** | **33** | 26 % |

**Les 56 % et les 16 % ne mesurent pas deux corpus différents. Ils mesurent deux méthodes de
lecture différentes.** Là où j'ai relu chaque leçon en entier avec l'intention de contredire
mes propres notes, j'ai trouvé le défaut dans plus d'une leçon sur deux. Là où je n'ai lu que
les ouvertures désignées par une sonde dont le rappel mesuré est de 59 %, j'en trouve une sur
six.

Si le taux de 56 % de l'échantillon valait pour le reste du corpus, ce ne sont pas 15 leçons
hors échantillon qui seraient concernées, mais de l'ordre de **54**. Je n'affirme pas ce
chiffre : je n'ai pas relu les 96 leçons en entier, et le prétendre serait exactement ce que
§4 du cahier des charges interdit. Ce que j'affirme, et qui suffit :

> **Le D14 corrigé (4,734) est une borne supérieure généreuse. Le vrai D14 du corpus est plus
> bas. Toute lecture de ce ledger doit en tenir compte.**

---

## 6. Bon historiquement / faible historiquement

Le CP13 demande de comparer les leçons jugées bonnes et celles jugées faibles au départ.
« Faible au CP3 » = la leçon portait au moins un défaut P0, P1 ou P2 à la notation initiale
(34 leçons). « Bonne » = aucun (94 leçons).

| Population | n | moyenne actuelle | D14 |
|---|---|---|---|
| jugées **faibles** au CP3 | 34 | **4,9412** | 4,588 |
| jugées **bonnes** au CP3 | 94 | 4,9347 | 4,787 |
| quartile bas des notes CP3 | 32 | 4,9085 | 4,594 |
| quartile haut des notes CP3 | 32 | 4,9777 | 4,781 |

Deux lectures, et la seconde est plus intéressante que la première.

**Un.** Les leçons jugées faibles au départ sont aujourd'hui **au niveau des autres, voire
très légèrement au-dessus** (4,9412 contre 4,9347). C'est le résultat attendu des CP4 à CP9 :
ce sont exactement celles qui ont été corrigées. Cela ne prouve pas que les corrections sont
bonnes — c'est moi qui ai corrigé et moi qui note. Cela prouve seulement qu'il ne reste pas de
poche de faiblesse identifiée non traitée.

**Deux.** Sur D14, les anciennes faibles restent **en dessous** (4,588 contre 4,787), et le
quartile bas aussi (4,594 contre 4,781). C'est cohérent et instructif : D14 n'est pas l'axe
sur lequel ces leçons ont été corrigées. Les CP4–CP9 ont traité de l'exactitude, des
prérequis, de la pratique et de la correction. **La qualité rédactionnelle n'a jamais été
l'objet d'une passe de correction dans ce sprint.** Le défaut trouvé au CP13 est donc là où
personne n'avait travaillé — ce qui est plutôt rassurant sur la méthode, et pas du tout sur le
corpus.

---

## 7. Pourquoi je n'ai corrigé aucune leçon au CP13

C'est une décision, pas un oubli, et elle doit être défendue.

Les 33 leçons à D14 = 4 portent un défaut réel, petit, et facile à réparer : supprimer ou
refondre une section d'ouverture redondante. Une heure de travail par leçon, sans risque
technique majeur. Je ne l'ai pas fait, pour trois raisons.

**Un — le calendrier de la mesure.** Le défaut a été trouvé **par l'audit, à l'étape d'audit,
par la personne qui a écrit les corrections précédentes**. Le corriger immédiatement ferait
remonter D14 à 5,000 et effacerait de l'historique la seule chose que ce checkpoint a
réellement découverte. Le §7 du cahier des charges interdit de corriger pour satisfaire une
sonde ; ici, corriger reviendrait à améliorer une note que je m'attribue moi-même, juste après
l'avoir baissée. C'est le mécanisme de Goodhart dans sa forme la plus pure.

**Deux — la gravité réelle.** Une ouverture redondante coûte au lecteur trente secondes
d'ennui. Elle ne l'empêche pas d'apprendre — et le §0 pose que la question est
« un humain peut-il réellement apprendre avec cette leçon ? ». La réponse reste oui. Le défaut
est classé **P3**. Le §12 fixe l'ordre P0 → P1 → P2, et il n'y a plus aucun P0, P1 ni P2
ouvert. Un lot de P3 en fin de sprint n'est pas prioritaire sur la publication honnête du
constat.

**Trois — le risque.** Réécrire 33 ouvertures touche le corpus gelé par neuf gates, à deux
checkpoints de la fin, dans une session qui doit encore exécuter le portique technique du
CP14. Le rapport bénéfice/risque est mauvais.

**Ce qui est fait à la place** : chaque leçon concernée porte dans le ledger un défaut P3
daté, avec la phrase exactement redite et sa source (`CP13 lecture hors échantillon` ou
l'audit aveugle). La liste est publiée ci-dessus. N'importe qui peut la reprendre sans
relire le corpus.

---

## 8. Ce que l'audit aveugle a trouvé d'autre

D14 n'est pas le seul désaccord. Les 30 autres, dimension par dimension, avec ce qui les a
provoqués.

**D1 — exactitude (8 désaccords, 6 plus sévères).** Deux familles.

- Des chiffres présentés comme des faits sans source : `ai-evaluation` (« 90 % des projets RAG
  de portfolio n'ont aucune évaluation »), `pandas-data-wrangling` (« c'est de là que vient le
  facteur 50 à 100 » pour la vectorisation — alors que le facteur réel dépend énormément de
  l'opération, et que tout le reste de la leçon mesure au lieu d'affirmer).
- Rien de faux au sens strict : ce sont des formulations universelles là où le contexte
  compte. L'ancre D1 = 5 exige que les affirmations dépendantes du contexte le disent.

**D5 — vulgarisation (4, tous plus sévères).** Des termes employés une fois avant d'être
expliqués, ou expliqués trop tard dans la section.

**D6 — profondeur (3, aucun plus sévère).** Cas notable : `sql-foundations`. Sa section
d'explication survole six sujets ; chacun reçoit le *quoi* et le *comment*, mais le
*quand-ne-pas* et l'*arbitrage* ne sont donnés que pour l'index. Quatre des cinq éléments de
l'ancre D6 = 5.

**D11 — charge cognitive (2).** `git-advanced` (rebase, rebase interactif, bisect, pull
request, stash, cherry-pick, reflog **plus** une pratique A–E, au jour 1 du parcours),
`react-accessibility` (neuf sous-sections avant le moindre exemple guidé), `typescript-frontend`
(450 lignes, deux corrections successives, un exemple guidé de 160 lignes). Dans les trois
cas, l'ordre est linéaire et chaque section autonome, ce qui compense — d'où 4 et non 3.

**D8 / D12 — pratique et autonomie (2 et 4).** `refactoring-legacy-code` : l'apprenant sait
quoi faire et comment vérifier, mais le **livrable** n'est pas nommé. Ambiguïté mineure,
levable par bon sens.

**Une observation consignée sans changement de note** — `database-transactions-concurrency` :
le mini-exercice **contient sa propre solution** (« Propose DEUX solutions : (1) `UPDATE posts
SET likes = likes + 1` ; (2) un verrouillage optimiste avec numéro de version »), ce qui est
l'ancre D8 niveau 2 **pour ce bloc**. La note reste à 5 parce que l'ancre porte sur l'appareil
de pratique dans son ensemble et que la vraie pratique de la leçon est le bloc A–E
« reproduire les anomalies plutôt que les lire », qui satisfait les cinq éléments. Mais un
apprenant qui ne ferait que le mini-exercice aurait un exercice de **choix**, pas de
production. C'est consigné parce que la note ne le fait pas apparaître.

---

## 9. Restitutions Feynman

Le protocole : après avoir lu une leçon, la réexpliquer **sans y revenir**, et noter où ça
casse. Une leçon dont on ne peut pas restituer le cœur n'a pas enseigné. Quinze restitutions
ont été produites pendant la lecture aveugle. Les plus révélatrices :

- **`algorithmic-thinking`** — « je peux réexpliquer la question qui débloque (qu'est-ce que je
  recalcule entre deux tours ?) **ET** la variante où elle ne marche plus (le maximum n'est pas
  réversible). » Restituer la limite d'un outil est plus difficile que restituer l'outil.
- **`git-fundamentals`** — « pourquoi le mécanisme qui protège de perdre son travail est
  exactement celui qui empêche d'effacer un secret — une seule propriété vue depuis deux
  situations. » Une leçon courte : c'est la référence opposable du §8, et elle tient.
- **`cloud-aws-core`** — « pourquoi un rôle vaut mieux qu'une clé sans réciter la formule — ce
  n'est pas qu'on ne stocke pas de secret (il y en a un), c'est la durée de vie et le fait
  qu'il n'y ait rien à faire tourner. » La restitution corrige la formule paresseuse.
- **`machine-learning-basics`** — « la règle n'est pas *mettre les choses dans un pipeline*
  mais *toute opération qui regarde l'étiquette doit être refaite dans chaque pli* — le
  pipeline est le moyen, pas le principe. »
- **`feature-engineering`** — « pourquoi Paris = 1, Lyon = 2, Marseille = 3 est faux : ce n'est
  pas une convenance, c'est une affirmation fausse injectée dans les données. »
- **`etl-pipelines`** — « l'idempotence **répare** l'état partiel en relançant, mais elle ne
  protège que **si** l'on relance ; entre la panne et la relance, la base affiche 96 006 € à
  qui la consulte. Donc il faut les deux. »

**Où ça casse.** Une seule restitution a buté sur un manque : `ai-evaluation` — « je peux
expliquer l'examen avec corrigé, l'évaluation par étage et la calibration du juge sans
relire. Là où ça casse : comment **choisir** k dans rappel@k — la leçon dit que k = 50 noie la
génération mais ne donne pas de critère. » C'est le genre de trou qu'une note ne montre pas et
qu'une restitution montre.

---

## 10. La limite de cet exercice, écrite en toutes lettres

**Un audit vraiment aveugle est impossible ici, et il faut le dire plutôt que le maquiller.**

L'auditeur, c'est moi. J'ai lu ces 128 leçons au CP3. J'ai écrit les corrections des CP4 à
CP12. Je connais l'échantillon puisque je l'ai figé. « Aveugle » ne signifie donc pas ce que
le mot signifie en méthodologie : cela signifie seulement que **je n'ai pas rouvert le ledger
avant de renoter**, et que les notes ont été écrites dans un fichier séparé
(`/tmp/cp13/blind.json`, copié à mi-parcours dans `docs/v71/CP13-BLIND-PARTIEL.json` comme
point de sauvegarde) avant toute comparaison.

Ce que ce dispositif protège : l'ancrage sur une note déjà écrite. Il a effectivement produit
47 désaccords, dont un motif systématique que la première lecture avait manqué — donc il n'est
pas cosmétique.

Ce qu'il ne protège pas, et qu'aucun aménagement de ce sprint ne pourra protéger :

1. **Le biais de l'auteur.** Sur les leçons que j'ai corrigées aux CP4–CP12, je note mon
   propre travail. La règle pré-engagée du CP12 (« si l'audit aveugle produit des notes
   matériellement plus basses que le ledger, c'est le ledger qui a tort ») a été appliquée —
   le ledger a été baissé, jamais l'audit remonté — mais elle ne compense pas le fait que
   l'auditeur et l'auteur soient la même personne.
2. **Le biais d'attente.** Ayant trouvé le motif D14 sur les premières leçons de l'échantillon,
   je l'ai cherché dans les suivantes. Les 17 occurrences ne sont donc pas 17 découvertes
   indépendantes.
3. **Le plafond de la lecture ciblée hors échantillon**, quantifié en §5 : le vrai D14 du
   corpus est plus bas que 4,734.

**La seule chose qui lèverait ces trois limites est une relecture par quelqu'un d'autre.**
Elle n'est pas dans le périmètre de V71 et ne doit pas être simulée. Le rapport final devra
la porter comme réserve.

---

## 11. État du ledger après CP13

| | avant CP13 | après CP13 |
|---|---|---|
| moyenne générale | 4,9554 | **4,9364** |
| D14 | 4,984 | **4,734** |
| leçons à D14 < 5 | 2 | **33** |
| leçons sous 3,00 | 0 | **0** |
| P0 / P1 / P2 ouverts | 0 / 0 / 0 | **0 / 0 / 0** |
| entrées CP13 au ledger | — | **46** — 32 procès-verbaux de relecture aveugle (type `CORRIGE`, qui portent les notes déplacées et l'observation de lecture) et **14 défauts P3 ouverts** pour les leçons lues hors échantillon |

Les 17 baisses de D14 de l'échantillon aveugle ne sont pas comptées comme des P3 ouverts :
elles sont inscrites dans le procès-verbal de relecture de chaque leçon, avec la note avant et
après. Les 14 baisses hors échantillon, elles, sont des P3 **ouverts et non corrigés** — c'est
ce que §7 assume.

Moyennes par dimension après correction :

| D1 | D2 | D3 | D4 | D5 | D6 | D7 |
|---|---|---|---|---|---|---|
| 4,953 | 5,000 | 4,969 | 4,992 | 4,969 | 4,891 | 4,992 |

| D8 | D9 | D10 | D11 | D12 | D13 | **D14** |
|---|---|---|---|---|---|---|
| 4,984 | 5,000 | 4,813 | 4,883 | 4,961 | 4,969 | **4,734** |

Seuils gelés touchant ces chiffres : **S1** (moyenne ≥ 4,00) passe ; **S2** (chaque dimension
≥ 3,70) passe, la plus basse étant D14 à 4,734 ; **S3** (aucune leçon sous 3,00) passe.

---

## 12. Fichiers

| Fichier | Rôle |
|---|---|
| `docs/v71/LEDGER-128.json` | 47 cellules corrigées dans l'échantillon, 14 D14 abaissés hors échantillon, 31 défauts P3 ajoutés |
| `docs/v71/CP13-BLIND-PARTIEL.json` | point de sauvegarde des notes aveugles (13/32), écrit avant toute comparaison |
| `scripts/v71/cp13-redite-ouverture.mjs` | sonde de recouvrement lexical entre sections d'ouverture — rappel mesuré 59 %, précision 64 % |

**Fichiers de leçon modifiés : aucun.** Voir §7.
