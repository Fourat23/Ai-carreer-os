# V72 — CP14. Marche séquentielle des 365 journées

**La question posée était : le parcours ressemble-t-il à une formation construite, ou à
365 blocs assemblés ?**

**Réponse : à une formation construite — mais construite en deux régimes différents qui ne se
raccordent pas, et dont le second ne dit plus au lecteur où il en est.** Les mois 1 à 5
entrelacent les compétences, montent en difficulté, portent des projets nommés et des journées
dont l'horaire est découpé. Les mois 6 à 12 passent en blocs longs, cessent d'annoncer une
difficulté qui varie, et abandonnent le découpage horaire. Ce n'est pas un assemblage : la
progression des prérequis tient sur les 365 jours sans une seule exception. C'est un
changement de régime jamais déclaré.

---

## 1. L'instrument, et ce qu'il ne fait pas

`scripts/v72/cp14-parcours-sequentiel.mjs` produit la matière : pour chacune des 365 journées,
sa semaine, son mois, sa compétence, sa difficulté, sa lecture, ses leçons, celles qu'elle
**découvre**, son projet. Puis les agrégats — couverture des compétences, longueurs de séquence,
fils de produit, charge hebdomadaire, ruptures de compétence.

Il **ne note rien**. Une marche de 365 journées ne se remplace pas par un chiffre, et le §7
anti-Goodhart du contrat interdit d'en fabriquer un. Ce que l'instrument fait, c'est empêcher
que la marche s'appuie sur l'impression laissée par les quelques journées lues.

---

## 2. Le parcours, mois par mois

| mois | jours | compétences réellement programmées | projet |
|---|---|---|---|
| 1 | 1–28 | gitlinux, jsts, algo | — |
| 2 | 29–56 | algo, ds, jsts, patterns, se, autonomy, http, sql | 1 · TaskFlow CLI |
| 3 | 57–91 | sql, http, autonomy, se, comm, secu, gitlinux, archi, python, jsts | 2 · LivreAPI |
| 4 | 92–119 | jsts, se, autonomy | 3 · BiblioApp |
| 5 | 120–147 | python, sql, autonomy | 4 · DataPulse |
| 6 | 148–182 | ml | 5 · ChurnScope |
| 7 | 183–210 | dl, llm | — |
| 8 | 211–238 | llm, rag | 6 · DocQA (démarrage) |
| 9 | 239–273 | rag, evalia, secu | 6 · DocQA (finalisation) |
| 10 | 274–301 | agents, archi, secu | — |
| 11 | 302–329 | archi, rag, evalia, agents | 7 · DocSense (build) |
| 12 | 330–365 | secu, comm, autonomy | 7 · DocSense (finalisation) |

**Le basculement se voit à la deuxième colonne.** Le mois 3 mélange dix compétences ; le mois 6
n'en a qu'une, sur 35 journées. Ce n'est pas un défaut en soi — apprendre le machine learning
demande une plage continue — mais c'est un changement de méthode d'enseignement qui n'est
annoncé nulle part.

**Mesuré, pas ressenti** : les 313 journées de travail se découpent en **64 séquences
continues** de même compétence, de longueur médiane **2 jours**, dont **22 séquences d'un seul
jour**. Et la répartition de ces séquences est franchement asymétrique :

| compétence | séquences distinctes | lecture |
|---|---|---|
| `jsts`, `se` | 8 chacune | reviennent tout au long des cinq premiers mois |
| `autonomy` | 7 | tissée du jour 44 au jour 365 |
| `algo` | 6 | revisitée après son bloc initial |
| `ml`, `dl`, `llm` | **1 chacune** | un seul bloc, jamais revu ensuite |

Un apprenant du mois 2 retrouve JavaScript huit fois, réparties. Un apprenant du mois 6 voit le
machine learning **une fois, pendant 30 jours, et ne le revoit plus**. Les deux moitiés du
parcours n'appliquent pas la même théorie de la mémoire.

---

## 3. Les journées de contrôle

| jour | ce qu'on y trouve | verdict |
|---|---|---|
| **j1** | environnement + terminal ; 3 leçons liées, 80 min de lecture annoncée ; découpage horaire complet 0:00→4:30 | **cohérent, avec une ambiguïté** (§5) |
| **j7** | première revue ; 6 leçons, **toutes déjà rencontrées** j1–j6 | correct |
| **j30** | Map/Set, O(1) ; 2 leçons | correct |
| **j70 · j77 · j84** | trois revues consécutives à 7 leçons, 166–176 min de lecture | **les trois plus lourdes du trimestre** (§5) |
| **j100** | « Lever l'état et le partager », 1 leçon, 34 min | léger — le mois 4 est le creux de lecture du parcours |
| **j150** | corrélation et causalité, 1 leçon | idem |
| **j200** | tokens et coûts, 4 leçons | correct |
| **j250** | budget latence, 6 leçons, 162 min | lourd, mais les 6 leçons sont les 6 leçons RAG déjà vues |
| **j300** | consolidation sécurité + revue mensuelle 10 | correct |
| **j320** | **dockerisation : 9 leçons, 219 min — la seule journée de travail impossible des 365** | **corrigé au CP14** (§6) |
| **j365** | clôture ; 2 leçons ; se termine sur `system-design-interview` et `algorithmic-thinking` | boucle fermée sur les fondations |

**j7 mérite d'être signalé au positif.** La toute première revue du parcours envoie vers
`javascript-basics`, `typescript-basics` et `async-javascript` — trois leçons qu'on croirait
prématurées en semaine 1. Vérification faite sur les 52 revues : **aucune revue n'envoie vers
une leçon jamais rencontrée auparavant**. La règle posée au CP12 — *une revue révise, elle
n'introduit pas* — tient sur l'ensemble du parcours.

---

## 4. L'ordre des prérequis tient — sans exception

`scripts/v72/cp12-controle-prerequis.mjs` sur les **106 leçons programmées** : **aucun prérequis
exigé avant d'être enseigné sans que le texte l'annonce.** C'est le seul résultat de ce
checkpoint qui soit un franc succès, et il porte sur la propriété la plus importante d'un
parcours séquentiel.

Il faut dire ce que ce contrôle ne couvre pas : il lit les **sections « Prérequis »** des
leçons. Une notion supposée au détour d'un paragraphe sans figurer dans les prérequis lui
échappe. La convention gelée au CP1 (A = anticipation annoncée, B = exigence non signalée) est
respectée sur ce qui est déclaré ; elle n'est pas vérifiable sur ce qui ne l'est pas.

---

## 5. La charge : ce qui est réel, et ce qui était un artefact de mon instrument

### Le résultat d'abord

Après la correction du §6 : **aucune journée de travail des 365 n'est infaisable.** Les seules
journées qui dépassent le budget sont des **revues**, et seulement sous une hypothèse de mon
propre modèle.

### L'hypothèse qui portait tout le résultat, et son test

Le modèle de charge du CP0 compte le texte de chaque leçon liée à 150 mots/minute — une lecture
**à froid**. Or une revue écrit « leçons de fond à **relire** cette semaine » : ces textes ont
été lus dans les six jours précédents. Relire n'est pas lire, et je n'avais pas testé ce que
l'écart entre les deux fait au résultat.

`scripts/v72/cp14-sensibilite-revues.mjs` le teste, en faisant varier le seul coefficient de
relecture, appliqué aux seules revues :

| coefficient | IMPOSSIBLE | HEAVY |
|---|---|---|
| 1,00 (relire = lire) | **6** | 55 |
| 0,75 | 3 | 48 |
| **0,50** | **0** | 47 |
| 0,35 | 0 | 47 |
| 0,25 | 0 | 44 |

**La conclusion « des journées sont impossibles » ne survit pas au test.** Elle tenait
entièrement à une hypothèse non examinée de mon instrument, et elle disparaît dès qu'on admet
qu'une relecture coûte la moitié d'une lecture. Le chiffre « 7 journées IMPOSSIBLES » publié au
CP0 doit donc être lu ainsi, et le rapport final le dira.

**Ce qui survit à toutes les hypothèses**, en revanche, et qui est le vrai résultat :

1. **Les revues sont les journées les plus chargées de la semaine.** Après la correction du §6 :
   19 des 52 revues sont HEAVY ou IMPOSSIBLE contre 42 des 313 journées ordinaires, toutes
   HEAVY — **37 % contre 13 %**. La journée dont l'objet est de consolider est près de trois
   fois plus susceptible de déborder que les autres.
2. **92 % de la lecture d'une revue est le texte des leçons reliées** : la page de revue
   elle-même ne pèse que 10 minutes en moyenne, contre 107 minutes de leçons.
3. **40 des 52 revues minutent explicitement leur pratique**, pour une somme annoncée moyenne de
   **99 minutes** — et la relecture des leçons vient **par-dessus**, sans jamais être budgétée.

### L'ambiguïté de fond, visible dès le jour 1

26 journées sur 365 donnent un **découpage horaire** complet. Celui du jour 1 remplit les
4 h 30 sans réserver une minute aux trois leçons qu'il lie. Or la page produit affiche pour
cette même journée « **Dont lecture ~80 min** », parce que `readingMinutes` mesure la journée
**plus toutes ses leçons liées**.

Les deux chiffres que le produit publie sur la même journée ne décrivent donc pas le même
travail. Ce n'est pas une contradiction cachée — le code de `app/day/[id]/page.tsx` documente
explicitement la distinction depuis V67 : `hours` est **l'engagement** (4,5 h pour les 365
journées, une constante assumée), `readingMinutes` la **lecture mesurée**. Mais rien, côté
apprenant, ne dit si les leçons de fond sont **à lire aujourd'hui** ou **disponibles quand il
en aura besoin**, et les **19 journées sur 24** où la lecture liée dépasse le créneau de théorie
prévu — jusqu'à **+34 minutes** — sont exactement celles où la question se pose.

**C'est une question de produit, pas un défaut à corriger dans le corpus.** Elle est posée au
CP15.

### Le champ `difficulty` ne dit plus rien après le mois 3

280 journées sur 365 sont annoncées en difficulté 3. Les **treize** journées de difficulté 4
sont toutes situées entre j25 et j89. **De j90 à j365 — 276 journées consécutives — la
difficulté annoncée ne varie plus.** Le jour 320, qui enseigne l'ensemble de Docker et une
introduction complète à Kubernetes, s'annonce « Intermédiaire/5 » comme le jour 100 qui
enseigne à remonter un `useState`.

Ce champ est **affiché à l'apprenant** sur chaque page de journée. Le corriger demanderait de
réévaluer 365 journées — un jugement de curriculum, pas une correction mesurable — et
modifierait au passage les fourchettes de charge, qui dépendent de la difficulté. **V72 ne le
touche pas** et pose la question au CP15.

---

## 6. La seule correction du CP14 : le jour 320

**Le défaut.** j320 « DocSense : dockerisation » liait **neuf** leçons — le maximum absolu des
365 journées, la suivante en liant sept — pour **219 minutes** de lecture dans un budget de 270.
C'était la **seule journée de travail** dont la fourchette basse dépassait le budget, et la
seule à rester IMPOSSIBLE sous **toutes** les hypothèses de relecture testées ci-dessus (le
coefficient ne s'applique qu'aux revues).

**La cause, mesurée.** Trois des neuf leçons — `ai-evaluation`, `rag-evaluation`,
`model-evaluation`, soit **66 minutes** — venaient du défaut par compétence : la journée porte
l'étiquette `evalia`. Or son titre, son objectif (« Rendre reproductible ») et **la totalité de
son cours** portent sur la dockerisation et l'orchestration. Le lecteur recevait la liste des
leçons d'un autre sujet.

**La correction, et sa conformité au contrat gelé.**

| condition | vérification |
|---|---|
| **M1 · M2 · M3** | aucun ordre, aucun compte, aucun livrable touché |
| **M4** — toute leçon retirée est rattachée ailleurs | `ai-evaluation` reste sur **20** journées, `rag-evaluation` sur **62**, `model-evaluation` sur **37** — dont j316 à j319 et j321, la **même semaine** |
| **M5** | aucune leçon ajoutée |
| **M6** — la journée n'est ni IMPOSSIBLE ni UNDERLOADED après | 219 → **152 min** ; charge 214–265 dans un budget de 270 ⇒ **BALANCED** |
| **M7** — motivé par un défaut mesuré | la seule journée de travail infaisable des 365 |
| **M8** | `progress.json` non touché |
| thème de la journée hôte inchangé | il devient **plus** conforme : les six leçons liées sont les six leçons Docker |

**Ce que la correction ne fait pas.** Elle ne change pas l'étiquette de compétence de j320. Le
CP7 avait examiné puis **refusé** de la faire passer de `evalia` à `cloud`, parce que cela
aurait fait passer le seuil C3 par la lettre en laissant intacte la promesse non tenue. Cette
position est maintenue : la correction du CP14 porte sur la charge et la cohérence du sujet,
elle est neutre vis-à-vis de C3.

Corpus des 128 leçons : **inchangé** (`c1ac869e…`). Fichiers modifiés : `day-320.md`,
`data/program.json`, et la donnée source qui les engendre.

---

## 7. Semaines et revues : le défaut connu n'a pas bougé

**Neuf pages de revue se contredisent elles-mêmes** : leur « Thème de la semaine » et leur
« Synthèse de la semaine » ne recouvrent pas 25 % l'un de l'autre. Les revues concernées sont
j42, j49, j70, j77, j84, j196, j217, j224, j238 — et dans les neuf cas la **synthèse est
juste** : elle cite les six journées réelles de sa propre semaine. C'est le **thème déclaré**
qui décrit une autre semaine.

Mesuré sur les 52 semaines : **18 thèmes décrivent mieux les journées d'une autre semaine que
les leurs**, avec des décalages allant de **−1 à −11 semaines** et des collisions (s10, s11 et
s12 désignent toutes trois s8). Il n'y a donc **pas de décalage constant à corriger** : ce sont
des thèmes rédigés contre un plan qui a ensuite changé.

Les réattribuer demande de réécrire 18 intitulés à la main, en jugeant du contenu réel de
chaque semaine. **V72 ne le fait pas au CP14** : ce n'est pas une correction mécanique, et le
contrat interdit d'inventer. C'est posé au CP15 comme le premier chantier éditorial concret.

---

## 8. Les compétences : un trou, et une promesse chiffrée

Dix-neuf des vingt compétences déclarées ont des journées. **`cloud` — « Cloud / DevOps » — en a
zéro.** Le seuil **C3** échoue, et le CP7 avait déjà réservé les deux réparations possibles à
l'utilisateur.

**Le CP14 ajoute un fait qui aggrave le constat.** Le mois 11 ne se contente pas de laisser
`cloud` de côté : il **déclare un score attendu**, `cloud: 2`, dans ses `expectedScores`. Le
programme fixe donc à l'apprenant un niveau à atteindre sur une compétence qu'aucune des
365 journées n'enseigne. Ce n'est plus une étagère non visitée, c'est une cible chiffrée sans
enseignement.

Le contenu correspondant existe **partiellement** ailleurs, sous d'autres étiquettes : Docker
(j320), CI/CD (j307), secrets (j68), monitoring et observabilité (j79), réponse à incident
(j332). Ce qui manque vraiment, c'est le cloud lui-même — et ce sont précisément les leçons
restées hors parcours.

**Un second signal a été examiné puis écarté.** Le mois 6 déclare `evalia: 2` alors que la
première journée étiquetée `evalia` est le jour 253, soixante-et-onze jours plus tard. Lecture
faite des 35 journées du mois 6 : j158 « Métriques de régression », j162 « Métriques de
classification », j165 « Cross-validation », j167 « Analyse d'erreurs qualitative », j180
« Analyse d'erreurs et rapport ». **Le mois 6 enseigne massivement l'évaluation** ; c'est
l'étiquette de compétence de ses journées qui dit `ml`. Ma sonde avait mesuré l'étiquette au
lieu du contenu : **onzième occurrence** du défaut de méthode documenté par V71, et c'est un
faux positif, pas un défaut du parcours.

---

## 9. Les 22 leçons hors parcours, revues depuis le parcours

`cloud-aws-core` · `cloud-azure-core` · `cloud-compute-storage` · `cloud-finops` ·
`cloud-fundamentals` · `cloud-networking` · `css-flexbox` · `css-fundamentals` · `css-grid` ·
`deployment-strategies` · `iac-fundamentals` · `k8s-networking-services` · `k8s-security` ·
`k8s-troubleshooting` · `linux-services-systemd` · `linux-ssh-remote` · `nextjs-data-production` ·
`nextjs-foundations` · `nextjs-rendering` · `nextjs-server-client-components` ·
`release-incident-recovery` · `responsive-design`.

Vues depuis la marche séquentielle, elles forment **trois grappes, pas une liste** : le cloud et
l'infrastructure (10), le frontend de mise en forme et Next.js (8), l'exploitation Linux et le
déploiement (4). Chacune correspond à une compétence que le parcours **effleure sans la
prendre** — ce qui est cohérent avec le classement du CP7, où aucune n'est de classe A.

---

## 10. Ce que le CP14 laisse ouvert pour le CP15

1. **`cloud` déclarée, jamais enseignée, et chiffrée au mois 11** — les deux réparations sont
   réservées à l'utilisateur par le contrat.
2. **18 thèmes de semaine à réattribuer**, dont 9 qui contredisent leur propre page de revue.
   Chantier éditorial, pas correction mécanique.
3. **`difficulty` constant sur 276 journées consécutives**, affiché à l'apprenant.
4. **Le statut des leçons liées** : lecture du jour ou étagère ? La question est produit ; elle
   décide de la charge réelle de 365 journées et de la lecture du champ `readingMinutes`.
5. **Le changement de régime au mois 6** : entrelacement dense d'abord, blocs longs ensuite,
   sans que rien ne l'annonce ni ne le justifie à l'apprenant.

---

## 11. Vérifications

| contrôle | résultat |
|---|---|
| `npm test` | **1420 / 1420** |
| `npx tsc --noEmit` | **0** |
| `npm run gates:active` | **52 gates verts** |
| corpus des leçons | **`c1ac869e…` inchangé** |
| invariants V72 exécutables | 4 verts · 1 rouge assumé (`cloud`) |
| journées / leçons / corrections | 365 / 128 / 365 |
| journées de travail IMPOSSIBLES | **0** |
