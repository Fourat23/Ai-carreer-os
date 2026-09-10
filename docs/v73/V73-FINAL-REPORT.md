# V73 — RAPPORT FINAL
## Curriculum Closure, Sequencing & Retention-Readiness

> **Note sur la structure.** Le brief exige un rapport en trente-quatre sections. La liste
> nominative des titres n'est pas conservée dans le dépôt ; les sections ci-dessous couvrent
> l'intégralité du mandat du brief, dans l'ordre où il l'énonce. Ce point est signalé plutôt
> que dissimulé sous une numérotation qui ferait croire à une correspondance vérifiée.

---

## 1. La question posée, et la réponse

> « Un apprenant qui suit réellement AI Career OS de J1 à J365 rencontre-t-il les bonnes
> connaissances **dans le bon ordre**, avec des **prérequis cohérents**, une **charge
> crédible**, des **révisions correctement distribuées** et **aucune compétence promise qui
> n'est jamais enseignée** ? »

**Cinq réponses, séparées parce qu'elles ne se valent pas :**

| | question | réponse | preuve |
|---|---|---|---|
| **ordre** | les connaissances arrivent-elles dans le bon ordre ? | **OUI** | 306 citations de prérequis classées, **0 `INVALID_FORWARD_PREREQUISITE`**, 0 cycle |
| **prérequis** | sont-ils cohérents ? | **OUI** | I2 vert, mutation n° 2 vue rouge |
| **charge** | est-elle crédible ? | **OUI AVEC RÉSERVE** | **0 journée structurellement impossible** — mais **44 journées de travail dépassent le budget haut**, et `hours` vaut 4.5 sur 365/365 |
| **révisions** | sont-elles correctement distribuées ? | **NON** | l'écart médian revue ↔ dernier contact est de **1 jour** sur **15 compétences sur 20** |
| **compétences promises** | toutes enseignées ? | **OUI** | les trois P0 fermés ; **0/20 compétence dont le niveau promis dépasse ce que le parcours fait faire** |

**La quatrième réponse est un NON, et il est délibérément non corrigé** : redistribuer les
rappels, c'est décider quoi rappeler quand — c'est-à-dire construire le Retention Engine, ce
que le brief interdit à ce sprint. Le CP8 en a produit les **données**, pas le moteur.

---

## 2. Les quatre statuts de chaque affirmation de ce rapport

Toute phrase de ce document relève de l'un de ces quatre statuts, et il est indiqué à chaque
fois qu'il y a le moindre doute.

| statut | ce que cela veut dire |
|---|---|
| **MESURÉ** | un script rejouable produit ce chiffre sur l'état actuel du dépôt |
| **INTERPRÉTÉ** | un chiffre mesuré, plus une lecture humaine qui lui donne un sens |
| **DÉCIDÉ** | un choix de ce sprint, avec sa raison écrite avant l'action |
| **NON PROUVÉ** | ce que ce sprint ne peut pas établir, et n'établit pas |

---

## 3. Ce que V73 était, et ce qu'il n'était pas

**Il était** : la fermeture du curriculum — trous de compétence, ordre, statuts, charge,
révisions, progression, calendrier, pratique, intégrité factuelle.

**Il n'était pas** : un « Academic Rewrite ». **Le corpus des 128 leçons a été modifié sur
exactement trois leçons**, toutes au CP3 et au CP4, et **son empreinte n'a plus bougé depuis
le CP4** : `92d5fae6…` sur onze checkpoints consécutifs.

**Il n'était pas non plus** la construction du Retention Engine, ni un redesign d'interface,
ni une mesure d'apprentissage humain.

---

## 4. Les trois trous P0, et leur fermeture — critère C15

| # | trou du CP0 | état au CP15 | statut |
|---|---|---|---|
| **P0-1** | `cloud` déclarée, chiffrée au mois 11, enseignée par **0 journée** | **34 journées de travail**, de **j68 à j332** | MESURÉ |
| **P0-2** | **CSS enseigné nulle part** — 4 leçons hors parcours, 16 969 mots | **4/4 leçons programmées** (j87, j103, j117) | MESURÉ |
| **P0-3** | **Next.js** — 4 leçons hors parcours, aucune séquence | **4/4 leçons programmées** (j99, j102, j104, j111) | MESURÉ |

> ## **C15 — problèmes P0 restant ouverts : 0**

**Leçons hors parcours : 22 au CP0 → 7 aujourd'hui.** Les sept restantes sont **toutes classées
ADVANCED**, statut que le contrat définit comme « approfondissement au-delà du niveau attendu ».
Aucune n'est en zone grise : `deployment-strategies`, `k8s-networking-services`, `k8s-security`,
`k8s-troubleshooting`, `linux-services-systemd`, `linux-ssh-remote`,
`release-incident-recovery`.

---

## 5. Le contrat gelé au CP1 — ce qui a été décidé avant de mesurer

Sept décisions structurantes, toutes prises **avant** la moindre correction :

1. **cinq degrés de compétence**, chacun avec une preuve opérationnelle ; **MAÎTRISÉE déclarée
   NON MESURABLE** par V73 ;
2. **cinq statuts de leçon** ; `DEPRECATED` interdit comme poubelle de commodité ;
3. **dix règles d'intégrité I1→I10** ; **I4 se contrôle sur le CONTENU, jamais sur `day.skill`** ;
4. **budget de charge en FOURCHETTE `[240, 300]` min**, et non un point à 270 — déplacement
   déclaré d'avance, chiffres du CP0 conservés tels quels, deux lectures publiées côte à côte
   au CP6 ;
5. **six hypothèses de sensibilité** ; une journée n'est « structurellement impossible » que
   sous **≥ 4 des 6** ;
6. **seuils L1 = 0 · L2 ≤ 12/52 · L3 ≤ 20/365** — L2 fixé à **12 et non à 5**, avec la raison
   écrite avant la mesure ;
7. **§7 anti-Goodhart**, cinq contournements interdits nommés d'avance, et **C15 dans le socle
   exigé même pour CANDIDATE**.

**Aucun de ces seuils n'a bougé pendant le sprint.** *(MESURÉ : les valeurs du document gelé
sont inchangées depuis le commit du CP1.)*

---

## 6. Ce qui a été modifié, et ce qui a été délibérément épargné

### Modifié

| quoi | ampleur |
|---|---|
| **leçons** | **3 sur 128** — `cloud-fundamentals` (prérequis faux), `k8s-config-probes` et `linux-processes-signals` (ancres) |
| **rattachements journée → leçon** | **16 journées** (CP3) + **3** (CP8, CP11) |
| **narrations de semaine** | **16 sur 52** — 9 réécrites, 6 réattachées, 1 complétée |
| **titres et résumés de mois** | **2 sur 12** |
| **`difficulty`** | **234 journées** de travail j91-j364 |
| **`readingMinutes`** | **27 journées** (correction d'une sonde) |
| **`project`** | **10 → 64 journées** déclarées |
| **carte des compétences** | 4 leçons enrichies, 10 sur-déclarations de semaine retirées |
| **générateur** | rendu des revues (CP7), `minutesDeLecture` (CP12), `difficulty`, `project` |

### Délibérément épargné

- **Le texte des 365 journées et des 128 leçons n'a pas été réécrit.** Corpus `92d5fae6…`.
- **Aucune journée déplacée, ajoutée, dupliquée ou supprimée.**
- **52 semaines, 12 mois** — invariant produit tenu.
- **`data/progress.json` n'a jamais été créé.** *(MESURÉ, et testé négativement.)*
- **Aucune compétence retirée de la promesse** : CSS, Next.js, Cloud, Docker, Kubernetes,
  Linux, sécurité, observabilité sont toutes dans le parcours ou classées ADVANCED.

---

## 7. Intégrité — les quinze critères du verdict, un par un

| | critère | exigé | mesuré | |
|---|---|---|---|---|
| **C1** | compétences CORE à 0 journée (I1) | 0 | **0** | ✅ |
| **C2** | `INVALID_FORWARD_PREREQUISITE` (I2) | 0 | **0 / 306 citations** | ✅ |
| **C3** | revues introduisant une leçon inédite (I3) | 0 | **0 / 52** | ✅ |
| **C4** | `expectedScores` sans source antérieure (I4) | 0 | **0 / 52 déclarations** | ✅ |
| **C5** | leçons sans statut (I5) | 0 | **0 / 128** | ✅ |
| **C6** | invariants 365 / 52 / 12 (I6) | intacts | **intacts** | ✅ |
| **C7** | `data/progress.json` (I7) | absent | **absent** | ✅ |
| **C8** | cycles de prérequis (I8) | 0 | **0** | ✅ |
| **C9** | références mortes | 0 | **0** (R1→R4) | ✅ |
| **C10** | journées structurellement impossibles (L1) | 0 | **0** | ✅ |
| **C11** | revues en dépassement (L2) | ≤ 12 / 52 | **0 / 52** | ✅ |
| **C12** | UNDERLOADED non justifiées (L3) | ≤ 20 / 365 | **6 / 365**, toutes justifiées | ✅ |
| **C13** | gauntlet complet | vert | **8 / 8** | ✅ |
| **C14** | douze mutations | 12 rouges puis restaurées | **12 / 12** | ✅ |
| **C15** | P0 du CP0 ouverts | 0 | **0** | ✅ |

---

## 8. VERDICT — `CURRICULUM_INTEGRITY_READY`

> # `CURRICULUM_INTEGRITY_READY`

**Les quinze critères gelés au CP1 sont atteints.** Le verdict suit la règle écrite avant la
mesure : `READY` exige C1 → C15 ; ils y sont tous.

### Ce que ce verdict certifie exactement

**L'intégrité structurelle du curriculum** : chaque compétence promise est enseignée, aucun
prérequis n'arrive après ce qu'il conditionne, aucun cycle, chaque leçon a un statut explicite,
aucune référence morte, aucune journée intenable, les invariants du calendrier tiennent, et les
portes qui l'affirment ont été **vues rougir** sur douze mutations.

### Ce que ce verdict NE certifie PAS — et il faut le lire avant de s'en réjouir

1. **Il ne dit rien de la qualité pédagogique.** Il dit que la structure tient, pas que
   l'enseignement est bon. *(Le CP0 et le CP13 le disent séparément, sur 60 unités lues :
   **le corpus est bon**. C'est une conclusion de lecture, pas un critère du verdict.)*
2. **Il ne dit rien de l'apprentissage réel.** V72 avait établi
   **`REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED`** ; **V73 ne le change pas.** Aucun
   apprenant humain n'a suivi ce parcours sous mesure. *(NON PROUVÉ.)*
3. **Il ne couvre pas cinq constats P1 ouverts** — dont deux touchent directement l'expérience
   d'un apprenant réel : **44 journées dépassent le budget affiché**, et **141 journées sur 365
   annoncent la même liste de leçons que la veille**. Aucun n'est un critère C, parce que les
   critères ont été gelés avant de les découvrir. **Les geler avant les protégeait d'être
   ajustés ; cela ne les rend pas exhaustifs.**
4. **La distribution des révisions est mauvaise et le verdict ne la compte pas** : médiane de
   **1 jour** entre une revue et le dernier contact, sur 15 compétences sur 20.

> **En une phrase : le squelette est vérifié et solide ; la chair est bonne à la lecture ; le
> métabolisme — ce que l'apprenant retient réellement — n'a jamais été mesuré.**

---

## 9. La charge, décomposée

**Modèle** *(MESURÉ)* : lecture de la journée + correction + leçons liées + exemple guidé +
pratique + réflexion. **Le setup n'est pas mesuré et est déclaré tel** — rien dans le texte ne
permet de l'estimer, et l'inventer serait une fabrication.

| | P10 | P25 | médiane | P75 | P90 | max |
|---|---|---|---|---|---|---|
| journée de travail, borne haute | 146 | 171 | **201** | 241 | 303 | **341** |
| revue, borne haute | 153 | 156 | **183** | 211 | 264 | **291** |

**Poste dominant** : les leçons liées (**70 min/jour** en moyenne) et la pratique
(**108 min**). Le texte propre d'une journée pèse **huit minutes**. *(INTERPRÉTÉ : alléger une
journée en raccourcissant son cours ne changerait pratiquement rien — et le contrat l'interdit
de toute façon.)*

**Sensibilité, six hypothèses gelées** : la référence donne **0 IMPOSSIBLE**, l'hypothèse la
plus défavorable (lecture attentive) en donne 24 — mais aucune journée n'est IMPOSSIBLE sous
au moins quatre des six. **L1 = 0.**

> **Un point d'honnêteté sur L1.** Ce seuil vaut 0 sous les **trois** états successifs du
> modèle traversés au CP9 : avec l'ancienne formule de minutage, avec la formule stricte du
> contrat, et avec la formule corrigée. **Le résultat n'est pas un artefact de mes corrections
> de modèle.**

---

## 10. Les 44 journées HEAVY — le constat le plus inconfortable de la charge

*(MESURÉ)* : **44 journées de travail** dépassent la borne haute du budget, **toutes de
difficulté 4 ou 5**, réparties **mois 8 : 18 · mois 9 : 12 · mois 11 : 10** ; dépassement
minimal +2 min, médian **+25 min**, maximal +41. **Zéro revue concernée.**

*(INTERPRÉTÉ, en deux temps)* :

1. **Le produit n'a pas changé.** Ces journées demandaient déjà ce qu'elles demandent. Ce qui a
   changé, c'est que le modèle a cessé de croire qu'elles étaient toutes de difficulté 3.
   **Le « 0 journée de travail en dépassement » publié au CP6 était une conséquence de la
   constante**, pas un constat sur le parcours.
2. **Le dépassement est réel mais modéré**, et aucune de ces journées n'est structurellement
   impossible.

*(DÉCIDÉ)* : **non corrigé.** Le mandat du CP6 était de traiter les journées **intenables** ;
il n'y en a aucune. Corriger une journée proche du seuil serait exactement ce que le §7
interdit. **Enregistré P1-CP9-1.**

---

## 11. La progression J1 → J365

**Avant V73** *(MESURÉ au début du CP9, sur le produit intact)* : `difficulty` valait
`3,3,3,3,3,3,2` **répété quarante fois** à partir de j91 — une fonction de la position dans la
semaine, muette sur la journée. Ce n'était pas « une longue plage constante » : c'était une
**constante codée en dur** dans le générateur.

**Après** : sept facteurs déclaratifs (nouveauté, autonomie, guidance, profondeur de prérequis,
intégration, ambiguïté de la commande, responsabilité du livrable), échelle **calibrée sur les
78 journées 1-90 dont la difficulté a été écrite à la main**.

| | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| avant | 4 | 68 | **280** | 13 | **0** |
| après | 4 | 70 | 151 | 95 | 45 |

**Corrélation difficulté × numéro du jour : 0,463.** Courbe à **deux crêtes** (mois 7-9 et 11),
creux réel au mois 10 — **pas une rampe**, ce que le brief interdisait nommément.

**Honnêteté sur la calibration** *(MESURÉ)* : **55 % d'accord exact** avec le jugement humain,
**90 % à un niveau près**, erreur absolue moyenne 0,55. **Ce n'est pas un triomphe.** C'est
assez pour ordonner 365 journées, pas pour contredire un auteur sur une journée — **d'où la
conservation des 78 journées témoins et des 52 revues à leur valeur d'origine.**

---

## 12. Le calendrier — douze semaines faisaient réviser ce qu'elles n'avaient pas enseigné

Le CP0 parlait de « 13 thèmes décalés ». Le défaut est plus grave : ce n'était pas l'étiquette,
c'était **tout l'appareil de révision** — bilan, test pratique, test théorique, mini-projet,
critères de passage, exercice d'architecture.

> **La revue de la semaine 8 évaluait le projet TaskFlow de la semaine 7**, alors que la
> semaine 8 enseigne HTTP, REST, Express et les premiers SELECT.

**Pourquoi quatre contrôles verts l'avaient laissé passer** *(INTERPRÉTÉ, et c'est le point de
méthode central de ce sprint)* : le CP0 vérifiait que les 52 revues **ont** un test pratique,
jamais **sur quoi il porte** ; la règle I3 est vraie parce que les **leçons** d'une revue sont
générées depuis ses journées — seul le **texte des tests** est écrit à la main ; le CP7 a
corrigé la **forme** de l'étape de révision, pas son **objet** ; le CP8 mesurait l'espacement
sur les leçons liées, qui étaient justes.

**Correction** : **s28→s34 réattachées** (décalage d'exactement une semaine, sept
correspondances de contenu indépendantes le prouvent) — **rien de bon n'a été réécrit** ;
**s6→s13 et s15 réécrites** depuis leurs journées, avec table de correspondance publiée
montrant où chaque narration retirée est désormais évaluée. **Résultat : 12 → 0 semaines en
défaut.**

---

## 13. La rétention — les données, pas le moteur

**Le CP8 a produit le modèle de CONTACTS des 20 compétences** : première exposition, pratique
guidée, pratique autonome, application, contacts de revue, contacts de projet, dernier contact,
séquence d'intervalles, intervalle maximal, fenêtre à 80 %, écart médian revue ↔ dernier
contact, niveau attendu. **Aucune donnée d'apprenant, aucun score de mémoire — le fichier le
déclare en tête.**

**Cinq définitions d'anomalie écrites AVANT la mesure**, puis mesurées :

| anomalie | définition | compétences touchées |
|---|---|---|
| `RAPPEL_TROP_PROCHE` | médiane des écarts ≤ 2 jours | **15 / 20** |
| `SILENCE_EXCESSIF` | un intervalle ≥ 120 jours | 9 |
| `ABANDON_PRÉMATURÉ` | ≥ 180 jours de silence final | 4 (était 6) |
| `ABSENCE_DE_TRANSFERT` | aucune journée de projet | 4 (était 7) |
| `RÉPÉTITION_LOCALE` | 80 % des contacts en ≤ 45 j | 0 |

> ### **`RAPPEL_TROP_PROCHE` sur 15 compétences sur 20, avec une médiane de 1 jour.**
> Une revue de fin de semaine rappelle ce qui a été vu l'avant-veille. **C'est la raison d'être
> du Retention Engine, et c'est délibérément NON corrigé** : le corriger à la main dans les 52
> revues reviendrait à bricoler ce que le moteur doit décider.

**Deux anomalies structurelles certaines corrigées, et seulement celles-là** : j351 « Révision
algo pour entretien » ne reliait que des leçons de communication ; j352 « Questions système et
IA » de même. Justifiées **par le texte de ces journées**.

---

## 14. Pratique, projets et transfert

*(MESURÉ)* **Règle de suffisance gelée avant mesure** — niveau 1-2 : l'exposition suffit ;
niveau 3 : la pratique est exigée ; niveau 4-5 : l'application est exigée.

> ## **0 / 20 compétences dont le niveau promis dépasse ce que le parcours fait faire.**

**Le défaut trouvé était ailleurs, et il était visible à l'écran** : `day.project` valait `null`
sur **355 journées sur 365**, et la page `/projects` — qui filtre sur ce champ exact en
refusant toute heuristique de titre — affichait **« Journées rattachées : 0 »** pour les
projets 3, 4, 5, 6 et 7. **Corrigé par une déclaration au niveau de la semaine**, les neuf
semaines de projet étant intégralement des semaines de projet : **10 → 64 journées**, exactement
les 64 titrées, zéro faux positif.

---

## 15. Intégrité factuelle — sept contrôles, et les affirmations exécutables exécutées

| | |
|---|---|
| R1 liens de leçon des 365 journées | **0 mort** |
| R2 liens entre leçons | **0** |
| R3 `practiceRefs` | **0** |
| R4 exercices programmés | **0** |
| R5 **clés dupliquées** | **0** |
| R6 `readingMinutes` recompté | **0 écart > 3 min** |
| R7 exercices sans solution ni test | **0** |

> ## **Les 376 solutions de référence ont été EXÉCUTÉES contre leurs propres tests : 376 / 376 passent.**

Aucune réimplémentation : le script appelle `runExercise`, l'exécuteur même qui note les
tentatives de l'apprenant. **Six runtimes couverts.** Ce contrôle n'existait pas : une porte
vérifiait qu'une solution de référence *existe*, jamais qu'elle *marche*.

---

## 16. Les vingt-quatre anomalies de sonde, publiées

| # | CP | ce que la sonde mesurait | ce qu'elle prétendait mesurer |
|---|---|---|---|
| 1-5 | CP0 | mots entre accents graves, composés, fichiers, émojis, préfixe `>` | identifiants morts, références, sections manquantes, clauses de prérequis |
| 6 | CP2 | premier contact d'**exposition** | premier enseignement → 13 fausses « évaluations sans source » |
| 7 | CP2 | tous les liens de Prérequis en REQUIRES | exigences réelles → **4 faux cycles** |
| 8 | CP2 | `day.project` (10/365) | journées de production → **0 application partout** |
| 9 | CP2 | empreinte contenant `generatedAt` | restauration → 3 tests valides déclarés « non restaurés » |
| 10 | CP2 | une clé dupliquée dans un littéral | une mutation → **sans effet, test vert pour la mauvaise raison** |
| 11 | CP2 | une paire de leçons mal choisie | un cycle → rougissait sur I2, pas sur I8 |
| **12** | CP2 | le marqueur d'annonce dans tout le paragraphe | l'annonce de LA leçon citée → **83 exigences réelles mal classées, 129 arêtes perdues** |
| 13 | CP2 | une phrase coupée par l'emphase Markdown | une annonce explicite |
| **14** | CP3 | une clé dupliquée, **en production** | 2 rattachements cloud sur 5 → **aucun effet** |
| 15 | CP7 | les minutes du bloc de rappel | la pratique → moyenne 129 → 180 sans qu'un exercice change |
| 16 | CP7 | un minutage à portée hebdomadaire | une journée → 190 min comptées sur un jour |
| **17** | CP8 | `^Projet \d` | les journées de production → **les 30 journées DocSense ratées** |
| 18 | CP9 | une section coupée à son sous-titre | le travail demandé → **un facteur mort sur sept** |
| 19 | CP9 | `Math.max(fourchette, annoncé)` | « l'annonce **remplace** la fourchette » (contrat) |
| **20** | CP9 | « tente seul au moins **30 minutes** » | un minutage de pratique → **309 journées sur 365** |
| **21** | CP11 | les `practiceRefs` déclarés par les leçons | ce que l'apprenant pratique → `rag` 4 au lieu de 35 |
| 22 | CP11 | `d.project?.id` sur un **nombre** | le projet d'une journée → **null sur 365** |
| 23 | CP11 | la production **portée par une leçon** | le transfert → aveugle aux compétences de substrat |
| **24** | CP12 | un accent grave apparié **à travers les documents** | la durée de lecture → **j197 : 45 min au lieu de 100** |
| *(+2)* | CP14 | une porte qui **ne regardait pas I1** ; un harnais qui **ne régénérait pas le graphe** | l'intégrité ; l'effet d'une mutation |

> **Leur forme commune** *(INTERPRÉTÉ)* : **la sonde mesurait quelque chose de vrai, mais pas la
> chose dont on tirait la conclusion.** Chacune, non détectée, aurait produit une affirmation
> fausse dans un rapport d'apparence rigoureuse.

---

## 17. Ce qui a été trouvé en LISANT, et qu'aucune sonde n'a vu

Trois défauts de ce sprint n'ont été trouvés par aucune mesure.

1. **141 journées sur 365 (39 %) annoncent la même liste de leçons que la veille**, jusqu'à
   **35 jours d'affilée** (j218→j252). Trouvé en lisant cinq journées de l'échantillon du CP13
   et en voyant revenir le même bloc de quatre leçons.
2. **Le test pratique de s33 ouvrait sur les journées de s32.** La sonde du CP10 compare une
   semaine aux 52 et ne peut pas voir un déséquilibre **interne** à une semaine.
3. **44 leçons sur 128 mêlent tutoiement et vouvoiement** — défaut **antérieur à V73**, vérifié
   au commit `fe7a10c`.

---

## 18. Les tests négatifs — douze mutations

**12 / 12 vues rouges, 12 / 12 restaurées.** *(MESURÉ, journal dans `CP14-MUTATIONS.json`.)*

**Le résultat qui compte n'est pas ce 12/12 : c'est que la première exécution n'en a vu que
10.** L'une des deux mutations vertes a révélé que **la porte V73 ne contrôlait pas I1** — un
invariant écrit dans le contrat, compté dans le verdict en C1, et regardé par rien. L'autre a
révélé que **mon propre harnais ne régénérait pas le graphe**, si bien qu'une journée gonflée à
390-442 minutes passait pour saine.

> **Une porte qu'on n'a pas vue rougir ne prouve rien. Une porte qui ne regarde pas prouve
> encore moins.**

---

## 19. Le parcours vu de bout en bout

| mois | ce que l'apprenant y fait | difficulté moyenne | production |
|---|---|---|---|
| 1 | terminal, Git, JavaScript, algorithmie | 2,29 | — |
| 2 | structures, TypeScript, POO/FP, **Projet 1**, premières APIs | 3,13 | Projet 1 |
| 3 | SQL, **Projet 2**, sécurité, réseau/Linux/Git, architecture | 3,37 | Projet 2 |
| 4 | React, full-stack, tests, **Projet 3** | 3,33 | Projet 3 |
| 5 | Python, pandas, SQL avancé, ETL, **Projet 4** | 3,04 | Projet 4 |
| 6 | statistiques, ML classique, **Projet 5** | 3,20 | Projet 5 |
| **7** | deep learning, transformers, LLM | **4,08** | — |
| **8** | prompts, guardrails, tool use, RAG v1 | **4,54** | — |
| **9** | vector DB, reranking, évaluation, **Projet 6** | **4,33** | Projet 6 |
| 10 | agents, workflows, architecture, sécurité IA | 3,38 | — |
| **11** | **DocSense** (build), Docker, CI, observabilité | **4,21** | Projet 7 |
| 12 | DocSense (polish + éval), portfolio, entretiens | 3,45 | Projet 7 |

**Deux crêtes, un creux au mois 10, et un mois 5 en retrait.** *(MESURÉ.)*

---

## 20. Les cinq constats P1 ouverts

| # | constat | pourquoi non corrigé |
|---|---|---|
| **P1-CP9-1** | **44 journées de travail dépassent le budget haut** (mois 8, 9, 11 ; médiane +25 min) | aucune n'est structurellement impossible ; corriger une journée proche du seuil est interdit par le §7 |
| **P1-CP9-2** | **`hours` = 4.5 sur 365/365** face à une charge modélisée de 99 à 341 min | changer la durée affichée est une **décision de promesse produit** ; l'inventer serait une fabrication |
| **P1-CP11-1** | **projets 1 à 5 sans montée d'exigence** (3,67 → 3,17 → 3,67) sur 136 jours, puis un saut à 5,00 | corriger demanderait de réécrire trois énoncés de projet — l'« Academic Rewrite » interdit |
| **P1-CP11-2** | **le parcours construit sans interruption de j218 à j272** et n'en déclare « projet » que les six derniers jours | déclarer 48 journées de plus ferait un projet 6 de 54 jours face à un projet 3 de six |
| **P1-CP13-1** | **141 journées sur 365 annoncent la même liste de leçons que la veille**, jusqu'à 35 jours | écrire 141 listes propres est la réécriture massive interdite ; **deux contournements ont été écartés nommément** |

**Deux constats P2** : **169 exercices sur 376 ne sont atteignables que par le calendrier**,
jamais depuis une page de leçon *(choix de navigation)* ; **44 leçons mêlent tu et vous**
*(antérieur à V73)*.

---

## 21. Les contournements écartés, nommément

Le §7 du contrat interdisait cinq contournements. Cinq occasions se sont réellement présentées,
et voici ce qui a été refusé :

1. **compter la relecture à demi-tarif** dans le modèle de charge — ferait baisser 141 journées
   d'un coup **sans qu'une ligne du produit change** ;
2. **tronquer la liste de leçons** des journées répétitives — retirerait à l'apprenant des liens
   utiles pour faire baisser un compteur ;
3. **ajouter des liens de leçon aux journées de projet** — ferait tomber
   `ABSENCE_DE_TRANSFERT` en alourdissant la lecture sans changer un mot du travail ;
4. **retirer `patterns` de la semaine 42** parce qu'aucune leçon ne la déclare — rendrait la
   sonde verte et **le produit faux** ; le défaut était dans la carte, et c'est la carte qui a
   été corrigée ;
5. **forcer un livrable Next.js** pour que les quatre leçons OPTIONAL soient « construites
   avec » — déplacerait le produit pour satisfaire une métrique.

---

## 22. Ce que V73 ne prouve pas

- **`REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED`.** Inchangé depuis V72. Aucun apprenant
  humain n'a suivi ce parcours sous mesure. Le protocole de test humain préparé par V72
  (`docs/v72/V73-PROTOCOLE-TEST-HUMAIN.md`) **n'a pas été exécuté**.
- **La compétence « MAÎTRISÉE » est déclarée NON MESURABLE** par ce sprint : `expectedScores`
  est une **intention de niveau**, jamais un constat.
- **Le temps de setup n'est pas mesuré** et est déclaré tel.
- **La qualité pédagogique n'est pas un critère du verdict** — elle est établie séparément, par
  lecture, sur 60 unités entre le CP0 et le CP13.

---

## 23. État final et vérifications

| contrôle | résultat |
|---|---|
| `npm test` | **1420 / 1420** |
| `npx tsc --noEmit` | **0** |
| `npm run build` | **succès** |
| `npm run gates:active` (52 portes) | **0 violation** |
| porte V73 (I1, I2, I3, I4, I6→I10, C9) | **verte** |
| `cp12-integrite` R1 → R7 | **0 défaut** |
| `cp12-executer-references` | **376 / 376** |
| `cp14-mutations` | **12 rouges / 12 restaurées** |
| **corpus des 128 leçons** | **`92d5fae6…`** — inchangé depuis le CP4 |
| invariants | **365 journées · 365 corrections · 52 semaines · 12 mois** |
| **`data/progress.json`** | **absent** |
| **L1 · L2 · L3** | **0 · 0/52 · 6/365** |
| génération | **idempotente** (seul `generatedAt` change) |

---

## 24. Les deux questions finales

### « Le curriculum est-il structurellement intègre ? »

> # **OUI** — `CURRICULUM_INTEGRITY_READY`

Quinze critères gelés avant la mesure, quinze atteints, douze portes vues rougir sur mutation.

### « Un apprenant qui le suit de J1 à J365 apprendra-t-il ? »

> # **NON PROUVÉ**

Et ce n'est pas une réserve de style. Trois choses manquent, dans cet ordre d'importance :

1. **aucune mesure sur un humain réel** — `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED` ;
2. **les rappels sont mal espacés** — médiane de 1 jour sur 15 compétences ; le Retention
   Engine a maintenant ses données, il n'a pas été construit ;
3. **cinq constats P1 ouverts**, dont deux qu'un apprenant réel rencontrerait dès sa première
   semaine difficile : une journée qui dépasse ce qu'elle annonce, et une liste de leçons
   identique trente-cinq jours de suite.

> **Ce que V73 a fait, exactement : il a rendu le parcours VÉRIFIABLE. Il ne l'a pas rendu
> PROUVÉ.**
