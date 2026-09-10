# V73 — CONTRAT CURRICULUM GELÉ (CP1)

> **Gelé avant toute correction.** Les définitions, les statuts, les règles d'intégrité et les
> seuils de charge ci-dessous sont fixés à partir des **mesures du CP0** et **avant** la
> première modification du produit. Ils ne seront pas déplacés après avoir vu un résultat.
> Toute exception devra être écrite ici, datée, avec sa raison — jamais appliquée en silence.

---

## 0. Ce que V73 mesure, et ce qu'il ne mesure pas

**V73 ne mesure pas la qualité rédactionnelle des leçons.** V71 l'a certifiée, V72 l'a
confirmée, et le CP0 de V73 l'a recontrôlée sur 24 leçons — huit lues intégralement, toutes
excellentes. **Ce niveau de preuve est acquis et n'est pas rejoué.**

**V73 mesure l'intégrité du PROGRAMME** : est-ce que les morceaux forment une séquence
d'apprentissage, ou une collection ? Concrètement — une compétence promise est-elle enseignée ?
un livrable suppose-t-il un savoir jamais donné ? une révision révise-t-elle quelque chose ?
la charge annoncée correspond-elle au travail demandé ?

**V73 ne prouve rien sur un apprenant humain.** Aucun humain n'a suivi ce parcours. Toute
formulation du type « l'apprenant maîtrise » est interdite ; la formulation autorisée est
« le programme enseigne, fait pratiquer et fait produire ».

---

## 1. Les cinq degrés d'une compétence — définitions et preuves

Ces définitions sont **opérationnelles** : chacune nomme la preuve qui la valide, de sorte
qu'un contrôle automatique puisse trancher sans jugement.

| degré | définition | preuve acceptée |
|---|---|---|
| **ENSEIGNÉE** | le parcours expose la notion pour la première fois, dans un support que l'apprenant est envoyé lire | au moins **une journée non-revue** dont le texte propre (`## 📖 Cours`, `## 📖 Explication`) traite la notion, **ou** qui lie une leçon dont c'est le sujet — la journée étant la **première** occurrence |
| **PRATIQUÉE** | l'apprenant exécute un geste sur la notion, avec un critère de réussite | une section de pratique (`Pratique`, `Mini-exercice`, `Exercice`, `Mise en pratique`) portant sur la notion **et** satisfaisant P1→P4 (§4), **ou** un artefact de pratique résolu (`exercise`, `lab`, `mission`, `playbook`) |
| **PRODUITE** | l'apprenant livre un artefact qui n'existait pas et que quelqu'un pourrait ouvrir | un `deliverable` de journée nommant un fichier, un dépôt, un schéma, un rapport ou une démonstration |
| **RÉVISÉE** | la notion est rappelée **après** son enseignement, sans que le texte de rappel soit sa première introduction | une journée de revue liant la leçon, **et** un contact non-revue strictement antérieur |
| **MAÎTRISÉE** | **non mesurable par V73** | — |

### Pourquoi « MAÎTRISÉE » n'est pas mesurable, et ce qu'on écrit à la place

La maîtrise est une propriété de l'apprenant, pas du programme. Aucun artefact du dépôt ne
peut l'établir. Le champ `expectedScores` de `data/program.json` exprime un **niveau attendu**,
c'est-à-dire une **intention pédagogique** — pas un constat.

**Formulation gelée** : V73 dira « le mois 11 attend `cloud = 2` » et **jamais** « l'apprenant
atteint le niveau 2 en cloud ». `REAL_HUMAN_LEARNING_EVIDENCE` reste `NOT YET MEASURED`, comme
à la fin de V72.

### NOTION OPTIONNELLE

Une notion est **optionnelle** quand le parcours peut être suivi intégralement, tous livrables
produits et tous critères de réussite atteints, **sans jamais la rencontrer**. Une notion
optionnelle ne peut pas figurer dans un `expectedScores`, ni être supposée par un livrable
obligatoire.

---

## 2. Les cinq statuts de leçon

**Règle absolue : après V73, les 128 leçons ont un statut explicite. Aucune zone grise.**

| statut | définition | conditions cumulatives |
|---|---|---|
| **CORE** | le parcours ne tient pas sans elle | programmée par ≥ 1 journée non-revue **et** portant une compétence déclarée **et** (un livrable la suppose **ou** une leçon CORE la cite en prérequis) |
| **ADVANCED** | approfondissement d'une compétence déclarée, au-delà du niveau attendu | porte une compétence déclarée, **et** son niveau (`level`) dépasse le besoin des livrables, **ou** elle est citée comme approfondissement par une leçon programmée |
| **OPTIONAL** | utile au métier visé, pas nécessaire au parcours | porte une compétence déclarée ou adjacente, aucun livrable ne la suppose, aucune leçon CORE ne l'exige |
| **REFERENCE** | consultation ; le parcours reste cohérent sans elle, et le dit | non programmée **et** portant l'encadré « Étagère de référence » **ou** citée uniquement en renvoi d'approfondissement annoncé |
| **DEPRECATED** | redondante avec une autre leçon, ou hors stratégie | ≥ 80 % de son contenu propositionnel se retrouve dans une autre leçon, **ou** son domaine sort du métier visé |

### Deux garde-fous sur les statuts

**a. `DEPRECATED` n'est pas une poubelle de commodité.** Une leçon n'est dépréciée que sur
preuve de redondance ou de hors-stratégie. **Le CP0 a établi que le corpus est bon** ; une
leçon difficile à placer n'est pas une leçon à déprécier. Le brief l'interdit explicitement :
« ne pas supprimer une compétence importante simplement parce qu'elle est difficile à
intégrer ».

**b. `REFERENCE` doit être honnête.** Une leçon de référence doit **dire** qu'elle en est une,
dans son propre texte, et aucune journée ne doit supposer sa lecture. Une leçon silencieusement
inatteignable n'est pas une référence : c'est un trou.

---

## 3. Règles d'intégrité — gelées

| # | règle | contrôle |
|---|---|---|
| **I1** | Aucune compétence **CORE** n'a zéro journée | pour chaque compétence de `program.json` classée CORE au CP2 : `joursTravail ≥ 1` |
| **I2** | Aucun livrable obligatoire ne dépend d'un prérequis **réellement futur et non signalé** | le graphe des prérequis, restreint aux `INVALID_FORWARD_PREREQUISITE`, est vide |
| **I3** | Aucune revue n'est la **première** introduction d'une notion qu'elle prétend réviser | pour chaque revue et chaque leçon liée : il existe un contact non-revue strictement antérieur |
| **I4** | Toute compétence portant un `expectedScores` a une source d'enseignement **antérieure et traçable** | pour chaque `(mois, compétence)` de `expectedScores` : ENSEIGNÉE avant la fin de ce mois |
| **I5** | Toute leçon a un **statut** parmi les cinq du §2 | 128/128 dans le registre du CP4 |
| **I6** | Le calendrier reste **365 journées, 52 semaines, 12 mois**, ordre `days[i].day === i+1` | invariants du CP0 |
| **I7** | `data/progress.json` n'est **jamais créé ni écrit** | le fichier reste absent du dépôt et du disque de travail |
| **I8** | Aucun cycle dans le graphe des prérequis | parcours en profondeur du graphe du CP2 |
| **I9** | Aucune journée n'est supprimée, dupliquée, ni renumérotée | comparaison BEFORE/AFTER des 365 titres et identifiants |
| **I10** | Toute leçon retirée d'une journée est **rattachée ailleurs** ou déclarée `REFERENCE` | registre du CP4 |

### I4 mérite une précision, parce que le CP0 a montré qu'elle est piégeuse

Le CP0 a signalé `evalia` comme « évaluée au mois 6 avant enseignement », puis la lecture des
35 journées du mois 6 a montré que ce mois **enseigne massivement l'évaluation** (j158
métriques de régression, j162 métriques de classification, j165 validation croisée, j167 et
j180 analyse d'erreurs) sous l'étiquette `ml`.

**I4 se contrôle donc sur l'ENSEIGNEMENT, pas sur l'étiquette de compétence de la journée.**
Une sonde qui lirait `day.skill` produirait un faux positif. Le contrôle doit accepter comme
source d'enseignement une journée dont **le contenu** traite la notion, quelle que soit son
étiquette — et le CP2 devra donc produire une correspondance concept ↔ journée qui ne se
réduise pas à `day.skill`.

---

## 4. Exigence de pratique — P1 à P4 (repris de V72, inchangés)

Une pratique est **conforme** si l'apprenant peut répondre aux quatre questions sans deviner :

| # | question | preuve acceptée |
|---|---|---|
| **P1** | qu'est-ce que je dois **produire** ? | un livrable nommé, **ou** un verbe de production avec son objet |
| **P2** | à partir de **quoi** ? | un contexte, des données, un fichier de départ |
| **P3** | comment je sais que **c'est réussi** ? | un critère de réussite, un bloc « Vérifie seul », un test décidable |
| **P4** | où est la **correction** ? | une section de correction, ou un renvoi vers un artefact déterministe **qui existe** |

**Interdit** : uniformiser la longueur ou le style des consignes. Un exercice de 40 mots peut
être excellent. Ce qui est homogénéisé, c'est le **niveau d'exigence**, jamais la forme.

---

## 5. Modèle de charge — seuils gelés

### 5.1 L'objectif utilisateur réel

**4 à 5 heures par jour**, soit **240 à 300 minutes**. Le champ `hours = 4.5` de
`program.json` est un **engagement** affiché, pas une estimation : il vaut 4,5 pour les
365 journées et cette constance est délibérée (documentée depuis V67 dans
`app/day/[id]/page.tsx` : « Engagement » vs « Dont lecture »).

**Le budget de référence est donc une fourchette, pas un nombre** : `[240, 300]` minutes.
**Il est explicitement interdit de ramener les 365 journées à 270 minutes exactes.**

### 5.2 Décomposition d'une journée

| poste | méthode |
|---|---|
| lecture de la journée | mots du texte propre ÷ vitesse + lignes de code ÷ 20 |
| lecture des leçons liées | idem, **avec coefficient de relecture** si la journée est une revue |
| exemple guidé | lecture × 0,5 (bas) à × 1,5 (haut) — le suivre coûte entre une demi-relecture et une relecture et demie |
| pratique | fourchette par difficulté (§5.3), **+8/+15 min par étape au-delà de trois** |
| correction | lecture de la correction, comptée dans la lecture de la journée |
| projet | pas de poste séparé : une journée de projet est une pratique, sa fourchette s'applique |
| réflexion | +10/+20 min si la journée porte des « Questions de réflexion » |
| setup | non compté — non mesurable depuis le texte, **déclaré comme non mesuré** |

**Le minutage explicite fait foi.** Quand la section de pratique annonce « 90 min », cette
valeur remplace la fourchette de difficulté (bas = somme annoncée, haut = somme × 1,4).

### 5.3 Fourchettes de pratique par difficulté

| difficulté | bas | haut |
|---|---|---|
| 1 | 25 | 45 |
| 2 | 35 | 60 |
| 3 | 50 | 90 |
| 4 | 70 | 120 |
| 5 | 90 | 150 |

*(le niveau 5 est ajouté ici parce que le CP9 pourra en attribuer ; il n'existe aujourd'hui
sur aucune journée)*

### 5.4 Les quatre zones — définies sur la fourchette, pas sur un point

Soit `[bas, haut]` la charge estimée et `[240, 300]` le budget.

| zone | condition | lecture |
|---|---|---|
| **IMPOSSIBLE** | `bas > 300` | même en travaillant vite et en lisant vite, la journée ne tient pas dans le haut du budget |
| **HEAVY** | `haut > 300` et `bas ≤ 300` | la journée peut déborder ; acceptable si elle est rare et signalée |
| **BALANCED** | `haut ≤ 300` et `haut ≥ 132` | la journée tient, avec une charge substantielle (132 = 55 % de 240) |
| **UNDERLOADED** | `haut < 132` | la journée occupe moins de 55 % du bas du budget |

> **Changement assumé par rapport au CP0.** Le CP0 mesurait contre un budget-point de
> 270 min. Le contrat retient une fourchette `[240, 300]`, ce qui est **plus tolérant**. Ce
> déplacement est fait **avant** toute correction et **est déclaré ici** : il ne sert pas à
> effacer un résultat, il corrige une hypothèse (« 4,5 h exactement ») que le brief lui-même
> désigne comme fausse (« ne pas imposer artificiellement 270 minutes exactes »). Les chiffres
> du CP0 restent publiés tels quels ; le CP6 publiera les deux lectures côte à côte.

### 5.5 UNDERLOADED acceptable — la zone qui n'est pas un défaut

Le brief l'exige : « ne pas considérer automatiquement qu'une journée plus courte est
invalide ». Une journée UNDERLOADED est **acceptable** dans trois cas, et défectueuse sinon :

1. **journée de respiration** — elle suit immédiatement une journée HEAVY ou une revue, ou
   précède un jalon de projet ;
2. **journée de bascule** — elle ouvre une compétence nouvelle et sert d'introduction courte ;
3. **journée de bilan** — trimestre, fin de mois, clôture d'année.

Hors de ces trois cas, une journée UNDERLOADED est une **ressource** : de la place disponible
sans supprimer de contenu. C'est ainsi que le CP3 utilisera les 31 journées légères des
mois 4 à 6.

### 5.6 Analyse de sensibilité — obligatoire

**Aucun chiffre de charge n'est publié seul.** Toute mesure est accompagnée de sa variation
sur les six hypothèses gelées ici :

| vitesse | mots/min | relecture en revue |
|---|---|---|
| rapide | 220 | plein tarif · mi-tarif |
| **normale (référence)** | **150** | plein tarif · mi-tarif |
| attentive | 110 | plein tarif · mi-tarif |

**Une journée n'est déclarée structurellement impossible que si elle est IMPOSSIBLE sous au
moins quatre des six hypothèses.** Le CP0 a montré pourquoi : le nombre de journées
infaisables allait de 0 à 60 selon l'hypothèse retenue.

### 5.7 Seuils de charge gelés pour le verdict

| # | seuil | exigence |
|---|---|---|
| **L1** | journées structurellement IMPOSSIBLE (§5.6) | **0** |
| **L2** | revues HEAVY ou IMPOSSIBLE sous l'hypothèse de référence | **≤ 12 / 52** |
| **L3** | journées UNDERLOADED **non justifiées** par un des trois cas du §5.5 | **≤ 20 / 365** |

> **L2 est fixé à 12 et non à 5.** Le CP0 mesure 18 revues HEAVY ou IMPOSSIBLE. Fixer un seuil
> à 5 obligerait à retirer de la matière à treize revues sans preuve que chacune est en faute,
> ce que le §5.5 et le brief interdisent. **12 correspond à ce que le CP7 peut corriger sur
> preuve** — les revues dont la relecture non budgétée est la cause unique du dépassement. Ce
> nombre est écrit ici, avant la correction, et ne bougera pas.

---

## 6. Ce que V73 a le droit de modifier, et à quelles conditions

### 6.1 Conditions cumulatives pour toute modification du calendrier

| # | condition |
|---|---|
| **M1** | l'ordre des 365 jours reste `days[i].day === i+1` — **jamais** modifié |
| **M2** | 365 journées, 128 leçons, 365 corrections, 52 semaines, 12 mois — **inchangés** |
| **M3** | aucune journée ne perd son livrable, sa correction, sa checklist ni ses critères |
| **M4** | toute leçon retirée d'une journée est **rattachée ailleurs** ou déclarée `REFERENCE` |
| **M5** | toute leçon ajoutée passe le contrôle de prérequis : ses notions requises sont enseignées **avant**, ou l'anticipation est **annoncée dans le texte** |
| **M6** | la journée après modification n'est ni IMPOSSIBLE ni UNDERLOADED-non-justifiée |
| **M7** | le changement est **motivé par un défaut mesuré**, jamais par une préférence |
| **M8** | `data/progress.json` n'est ni créé ni écrit |
| **M9** | toute modification est inscrite au **ledger** avec BEFORE et AFTER |

### 6.2 Ce qui est explicitement autorisé

- **ré-étiqueter la compétence d'une journée** quand son contenu contredit son étiquette,
  **à condition** que le changement ne serve pas à franchir un seuil par la lettre (§7) ;
- **rattacher une leçon hors parcours à une journée existante** dont le sujet la porte ;
- **remplacer le sujet d'une journée UNDERLOADED non justifiée** par une séquence nouvelle,
  en conservant son livrable ou en le remplaçant par un livrable de même nature ;
- **réécrire un intitulé de semaine ou de mois** qui décrit autre chose que son contenu ;
- **recalculer `difficulty`** à partir du travail réellement demandé ;
- **retirer d'une revue une relecture** que le rappel actif rend inutile.

### 6.3 Ce qui est interdit

- créer ou supprimer une journée ;
- supprimer une compétence déclarée de `program.json` pour faire passer I1 ;
- allonger un texte pour faire monter `readingMinutes`, ou le raccourcir pour le faire baisser ;
- réécrire une leçon dont aucun défaut n'est démontré ;
- uniformiser la forme des consignes ;
- construire le Retention Engine (V73 prépare les données, il ne code pas le moteur) ;
- toute refonte visuelle ou motif graphique nouveau.

### 6.4 Réservé à l'utilisateur

**Rien.** Le brief de V73 tranche explicitement les décisions produit que V72 avait laissées
ouvertes : CSS, Next.js, Cloud/AWS/DevOps, Docker, Kubernetes, Linux et sécurité **restent
dans l'ambition du programme**, et un trou de curriculum ne se résout **pas** en retirant le
domaine de la promesse. V73 décide donc seul, dans les limites du §6.1.

---

## 7. Anti-Goodhart — gelé

**Un seuil franchi par la lettre contre son intention est un échec, pas une réussite.**

Exemples explicitement interdits, écrits d'avance :

- faire passer I1 en donnant **une** journée à `cloud` — une compétence affichée parmi vingt,
  acquittée par une journée sur 365, reste une promesse non tenue (V72 avait déjà refusé ce
  ré-étiquetage de j320) ;
- faire passer L2 en retirant des leçons d'une revue sans remplacer par du rappel actif ;
- faire passer L3 en gonflant une journée légère avec du texte ;
- faire passer I5 en attribuant `REFERENCE` par défaut à tout ce qui reste ;
- faire passer une mesure de pratique en multipliant des exercices sans valeur.

**Règle de conduite** : quand une correction fait passer un seuil sans améliorer la propriété
que le seuil mesure, elle est **refusée et documentée comme refusée**.

---

## 8. Règles de méthode — gelées

Le CP0 a produit **cinq anomalies de sonde** en une seule séance. Les règles suivantes en
découlent et s'appliquent à tout instrument de V73 :

| # | règle |
|---|---|
| **S1** | Une propriété structurelle se lit dans les **déclarations** (`practiceRefs`, `day-exercises.json`, `LAB_ROUTES`, `program.json`), jamais en scannant de la prose |
| **S2** | Une sonde qui contredit une lecture humaine est **auditée avant** toute modification du produit |
| **S3** | Toute anomalie de sonde trouvée est **publiée** dans le rapport du CP concerné, avec son chiffre faux et son chiffre corrigé |
| **S4** | **Interdit** d'élargir une regex ou un gate après avoir découvert quelles leçons échouent, dans le seul but d'obtenir du vert |
| **S5** | Avant toute recherche de motif dans un texte structuré par des titres, **découper par titre** — jamais par une regex avec `$` en mode `m` (défaut trouvé au CP12 de V72) |
| **S6** | Avant toute recherche dans un encadré, **normaliser** : retirer le préfixe `>`, recoller les espaces (défaut trouvé au CP0 de V73) |
| **S7** | Ne jamais reconstruire un chiffre BEFORE après modification : les mesures du CP0 sont figées et citées telles quelles |
| **S8** | Ne jamais déplacer un seuil après avoir vu le résultat qu'il classe |

---

## 9. Seuils du verdict `CURRICULUM_INTEGRITY`

| # | seuil | exigence |
|---|---|---|
| **C1** | compétences CORE avec 0 journée (**I1**) | **0** |
| **C2** | `INVALID_FORWARD_PREREQUISITE` (**I2**) | **0** |
| **C3** | revues introduisant une notion jamais enseignée (**I3**) | **0** |
| **C4** | `expectedScores` sans source d'enseignement antérieure (**I4**) | **0** |
| **C5** | leçons sans statut explicite (**I5**) | **0** |
| **C6** | invariants 365/128/365/52/12 et ordre (**I6**, **I9**) | **intacts** |
| **C7** | `data/progress.json` (**I7**) | **absent** |
| **C8** | cycles dans le graphe des prérequis (**I8**) | **0** |
| **C9** | références mortes (leçon, jour, exercice, lab, playbook) | **0** |
| **C10** | journées structurellement IMPOSSIBLE (**L1**) | **0** |
| **C11** | revues HEAVY ou IMPOSSIBLE (**L2**) | **≤ 12 / 52** |
| **C12** | journées UNDERLOADED non justifiées (**L3**) | **≤ 20 / 365** |
| **C13** | `gates:active`, `npm test`, `tsc --noEmit`, `npm run build` | **tous verts** |
| **C14** | tests négatifs des douze mutations du brief | **12 / 12 vus échouer puis restaurés** |
| **C15** | problèmes **P0** du CP0 restant ouverts | **0** |

**`CURRICULUM_INTEGRITY_READY`** — C1 → C15 tous atteints.

**`CURRICULUM_INTEGRITY_CANDIDATE`** — C1, C2, C3, C5, C6, C7, C8, C13, C14 et **C15**
atteints, et **au plus deux** non atteints parmi C4, C9, C10, C11, C12.

**`CURRICULUM_INTEGRITY_NOT_READY`** — tous les autres cas.

> **Note sur C15.** Le brief de V73 range les trois P0 — `cloud`, CSS, Next.js — parmi les
> décisions déjà tranchées : ces domaines restent dans l'ambition du produit. Fermer les trois
> est donc une **obligation de ce sprint**, et C15 est dans le socle exigé même pour
> `CANDIDATE`. Un V73 qui laisserait un P0 ouvert serait `NOT_READY`, quelles que soient les
> autres mesures.

---

## 10. Tests négatifs obligatoires — les douze mutations

Tout invariant créé ou modifié par V73 doit être mis **volontairement en échec**, avec
restauration vérifiée à l'octet près. Un gate vert jamais vu rougir n'est pas validé.

| # | mutation à provoquer | invariant testé |
|---|---|---|
| 1 | une compétence CORE ramenée à 0 journée | I1 / C1 |
| 2 | un livrable rendu dépendant d'un prérequis futur non signalé | I2 / C2 |
| 3 | une revue liant une leçon jamais enseignée avant | I3 / C3 |
| 4 | une référence vers une leçon, un exercice ou un lab inexistant | C9 |
| 5 | une journée gonflée au-delà du budget haut | L1 / C10 |
| 6 | un mapping jour → leçon cassé | I10 |
| 7 | un cycle introduit dans le graphe des prérequis | I8 / C8 |
| 8 | une leçon privée de statut | I5 / C5 |
| 9 | un `expectedScores` posé sur une compétence non enseignée avant | I4 / C4 |
| 10 | une journée dupliquée | I9 |
| 11 | une journée supprimée | I9 |
| 12 | **une tentative de création de `data/progress.json`** | I7 / C7 |

**Précision sur le test 12.** `data/progress.json` **n'existe pas** dans le dépôt et est
gitignoré. Le test ne peut donc pas « le modifier » : il crée le fichier, vérifie que le
contrôle rougit, puis **le supprime**. C'est un test de non-création, pas de non-mutation.

---

## 11. Interdits absolus de V73

1. rallonger un cours pour faire monter une métrique ;
2. raccourcir un cours pour faire baisser une charge ;
3. réécrire une leçon sans défaut démontré ;
4. transformer chaque anomalie de sonde en changement du produit ;
5. mesurer un marqueur au lieu d'une propriété ;
6. maquiller une erreur de sonde au lieu de la publier ;
7. réécrire les chiffres BEFORE ;
8. déplacer un seuil après résultats ;
9. supprimer Cloud, CSS ou Next.js de la promesse pour simplifier le problème ;
10. confondre quantité d'exercices et qualité de pratique ;
11. appeler « répétition espacée » une revue qui suit son contenu de deux jours ;
12. inventer une progression utilisateur, un résultat d'apprenant ou une donnée d'usage ;
13. créer `data/progress.json` ;
14. construire le Retention Engine ;
15. toute refonte visuelle globale.
