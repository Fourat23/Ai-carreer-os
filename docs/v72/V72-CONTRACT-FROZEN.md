# V72 — CONTRAT GELÉ (CP1)

> **Gelé le 2026-09-09, au CP1, avant toute modification du dépôt par V72.**
> Les seuils, critères et définitions de ce document **ne bougent plus**. Aucun résultat
> mesuré aux CP2 → CP14 ne peut servir à les ajuster. Un seuil qui échoue échoue.
>
> Ce contrat **ne remplace pas** le contrat académique V71, qui reste gelé et opposable.
> V72 ne renote pas les 128 leçons sur 14 dimensions. Le barème V71 n'est pas modifié.

---

## 0. Ce que V72 mesure, et ce qu'il ne mesure pas

V72 sépare **trois niveaux de preuve** qui ne doivent jamais être confondus ni additionnés :

| niveau | nom | ce qu'il établit | état V72 |
|---|---|---|---|
| A | **CERTIFIED TEXT QUALITY** | le texte des leçons enseigne correctement | établi par V71, non rejoué ici |
| B | **SIMULATED LEARNING EVIDENCE** | une restitution simulée réussit ou échoue sur ce texte | **objet de V72** |
| C | **REAL HUMAN LEARNING EVIDENCE** | un humain apprend, retient, transfère | **NOT YET MEASURED** |

Le niveau C reste `NOT YET MEASURED` tant qu'aucun humain réel n'a suivi le protocole. Aucune
formulation du rapport final ne pourra suggérer le contraire.

---

## 1. Redondance éditoriale — critères R0 à R3

**Unité examinée** : les quatre sections d'ouverture (`Le problème d'abord`, `Objectif`,
`Modèle mental`, `Pourquoi c'est important`) **et** tout passage du corps qui reprend l'une
d'elles.

**Mesure** : recouvrement de Jaccard **phrase à phrase**, sur les mots de ≥ 4 lettres hors
mots-outils, seuil de signalement **0,30**. Le pourcentage de redite est la part de mots de
l'ouverture occupée par les phrases dupliquées retenues.

**La mesure signale ; seule la lecture classe.**

| classe | définition opposable | traitement |
|---|---|---|
| **R0** | aucune phrase dupliquée, ou la reprise est la thèse de la leçon énoncée une fois puis développée | **aucune correction** |
| **R1** | une seule formule reprise, en position d'encadrement (ouverture / clôture), ou reprise qui **change de fonction** (une notion technique devenue enjeu de carrière) | **aucune correction obligatoire** ; suppression facultative |
| **R2** | **deux phrases dupliquées ou plus**, ou une section entière supprimable sans qu'aucun fait, mécanisme, critère, distinction ou enjeu ne se perde | **correction obligatoire au CP2** |
| **R3** | la même idée énoncée **trois fois ou plus**, ou **des formulations concurrentes** entre lesquelles le lecteur ne peut pas choisir, ou une redite ≥ 30 % de l'ouverture | **correction obligatoire au CP2, en priorité** |

**Règle de correction (CP2).** Une ouverture doit accomplir **trois choses différentes** :
(1) donner envie de résoudre un vrai problème ; (2) dire ce qu'on va apprendre ; (3) construire
un premier modèle mental. Corriger consiste à **rendre à chaque section sa fonction propre**,
jamais à raccourcir jusqu'à perdre le raisonnement, jamais à imposer un gabarit unique.

**Interdit** : supprimer une section entière si elle porte encore une des trois fonctions ;
uniformiser les 33 leçons sur un même moule ; remplacer une redite par du remplissage.

---

## 2. Charge d'une journée — seuils gelés

**La lecture se mesure**, avec la formule du projet (`scripts/generate-curriculum.mjs`,
ligne 782) : `mots / 150 + lignes de code / 20`, appliquée au fichier de la journée, aux
leçons qu'elle lie et à sa correction.

**La pratique s'estime en FOURCHETTE**, jamais à la minute. Composants gelés :

| composant | borne basse | borne haute |
|---|---|---|
| exemple guidé (suivi, en plus de sa lecture) | 0,5 × son temps de lecture | 1,5 × |
| base de pratique, difficulté 1 | 25 min | 45 min |
| base de pratique, difficulté 2 | 35 min | 60 min |
| base de pratique, difficulté 3 | 50 min | 90 min |
| base de pratique, difficulté 4 | 70 min | 120 min |
| chaque étape de consigne au-delà de trois | +8 min | +15 min |
| questions de réflexion, si la section existe | 10 min | 20 min |
| **minutage explicite dans la consigne** | il fait foi : borne basse = sa somme | borne haute = 1,4 × sa somme |

**Portée.** Un minutage explicitement **hebdomadaire** (« chaque jour… », « fin de semaine… »)
n'est **pas** compté comme charge journalière.

**Catégories**, par rapport au budget annoncé de la journée (`hours × 60`) :

| catégorie | condition |
|---|---|
| **IMPOSSIBLE** | la **borne basse** dépasse le budget |
| **HEAVY** | la borne haute dépasse le budget, la borne basse non |
| **BALANCED** | la fourchette tient dans le budget |
| **UNDERLOADED** | la borne haute est inférieure à **55 %** du budget |

---

## 3. Journées de revue — ce qu'une revue doit être

Une revue hebdomadaire **doit** contenir, dans cet ordre de priorité :

1. un **rappel sans support** (restitution de mémoire) ;
2. les **erreurs de la semaine** ;
3. les **notions structurantes** de la semaine ;
4. une **pratique mêlée** (mixed practice) ;
5. un **mini-transfert** ;
6. une **correction** ;
7. **éventuellement** une relecture **ciblée**.

Elle **ne doit pas** demander « relis tout ».

**Plafond gelé de relecture.** Budget 270 min − test pratique minuté − 40 min pour le test
théorique, le livrable, la checklist et la réflexion ⇒ **155 min disponibles**, soit
**7 leçons au maximum** liées à une revue. Au-delà, la journée est reconstruite au CP6.

**Règle de sélection des leçons d'une revue**, à appliquer au CP6 :
la revue lie **les leçons que les journées de sa semaine ont réellement enseignées**, et non
l'union des catalogues de compétences traversées. En cas de dépassement du plafond de 7, on
garde par ordre : (a) les leçons liées explicitement par une journée de la semaine
(`LESSONS_V67`) ; (b) les leçons dont le thème de la semaine parle ; (c) les plus récentes.
**Aucune compétence réellement nécessaire ne peut être supprimée** : si le plafond force à en
retirer une, elle est déplacée vers une autre revue, jamais perdue.

---

## 4. Modification du mapping curriculum — ce qui est autorisé

V72 **peut** modifier le mapping, à ces conditions cumulatives :

| # | condition |
|---|---|
| M1 | l'ordre des 365 jours reste `days[i].day === i+1` — **jamais** modifié |
| M2 | le nombre de journées reste 365, de leçons 128, de corrections 365 |
| M3 | aucune journée ne perd son livrable, sa correction, sa checklist ni ses critères |
| M4 | toute leçon retirée d'une journée est **rattachée ailleurs** ou déclarée référence |
| M5 | toute leçon ajoutée à une journée passe le contrôle de **prérequis** : ses notions requises sont enseignées **avant**, ou l'anticipation est **annoncée dans le texte** |
| M6 | la charge de la journée après modification n'est ni IMPOSSIBLE ni UNDERLOADED |
| M7 | le changement est **motivé par un défaut mesuré**, jamais par une préférence |
| M8 | `data/progress.json` et tout état utilisateur ne sont **jamais** touchés |

**Convention des prérequis — tranchée ici une fois pour toutes**, le conflit entre
`docs/v71/PREREQUIS-ORDRE.md` et le handoff de contre-validation étant réel :

> **Classe A = anticipation ANNONCÉE (comportement correct).
> Classe B = exigence NON signalée (défaut d'ordre).**

C'est la convention de `docs/v71/PREREQUIS-ORDRE.md`, retenue parce que c'est celle du document
persisté dans la branche canonique. Toute citation du handoff devra être **retranscrite** dans
cette convention avant usage.

---

## 5. Leçons hors parcours — règle d'intégration

**Principe gelé** : *ne pas chercher à ramener 25 à 0.* Une bibliothèque de référence est
légitime. **Mais une compétence déclarée dans `data/program.json` ne peut pas vivre uniquement
dans la bibliothèque.**

| classe | définition opposable |
|---|---|
| **A — fondamentale** | la leçon porte une **compétence déclarée** dans `program.json` **et** le parcours l'exige implicitement (un livrable la suppose, ou une leçon programmée s'appuie dessus) |
| **B — approfondissement** | utile au métier visé, mais aucun livrable du parcours ne la suppose |
| **C — référence** | consultation ; le parcours n'en a pas besoin pour être cohérent |
| **D — fusionnable** | redondante avec une leçon déjà programmée |
| **E — hors périmètre** | ne relève pas du métier visé par ce programme |

**Insertion (CP7).** Une leçon classée **A** doit recevoir un emplacement précis. L'insertion
est faite **automatiquement** si et seulement si : M1 → M8 sont respectés **et** l'insertion ne
change pas le thème de la journée hôte **et** la journée hôte reste BALANCED. Sinon,
l'insertion est **documentée et laissée ouverte** comme décision produit.

**Réservé à l'utilisateur — V72 ne tranche pas seul** : la suppression d'une compétence
déclarée de `program.json`, et toute création d'une journée nouvelle (impossible sans casser
M2). Ces deux points seront **posés au CP15**, pas décidés.

---

## 6. Pratiques — niveau d'exigence, pas style

**Interdit** : uniformiser la longueur ou le style des consignes. Un exercice de 40 mots peut
être excellent ; un exercice de 500 mots peut être médiocre.

**Exigence gelée.** Une pratique est **conforme** si l'apprenant peut répondre aux quatre
questions sans deviner :

| # | question | preuve acceptée dans le texte |
|---|---|---|
| P1 | qu'est-ce que je dois **produire** ? | un livrable nommé, **ou** un verbe de production avec son objet |
| P2 | à partir de **quoi** ? | un contexte, des données, un fichier de départ |
| P3 | comment je sais que **c'est réussi** ? | un critère de réussite, un bloc « Vérifie seul », un test décidable |
| P4 | où est la **correction** ? | une section de correction, ou un renvoi explicite vers un exercice déterministe du produit |

**Cas des renvois.** Une section « Pratique » qui n'est qu'un renvoi vers des exercices de
plateforme est conforme **si et seulement si** tous les identifiants cités **existent** et que
P1 et P3 sont satisfaits par l'exercice cité. Une référence morte est un **défaut**.

**Correction au CP9** : uniquement les leçons qui échouent à P1 ou P3. Aucune autre.

---

## 7. Validation opérationnelle — quatre niveaux

| niveau | nom | ce qui est fait | ce que ça prouve |
|---|---|---|---|
| **N1** | **STATIQUE** | analyse syntaxique : YAML parsé, Dockerfile lu par le parseur, `bash -n` sur les commandes shell, JSON validé | la forme est correcte |
| **N2** | **LOCAL** | exécution réelle avec les outils présents (`node`, `python3`, `git`, shell POSIX, `sqlite`) | le comportement affirmé se produit |
| **N3** | **CONTENEUR** | exécution dans un conteneur éphémère si le démon Docker le permet | idem, en environnement isolé |
| **N4** | **NON EXÉCUTABLE ICI** | l'outil ou l'infrastructure est absent | **rien** — à déclarer comme tel |

**Interdit** : installer une infrastructure lourde pour satisfaire une métrique ; exécuter une
commande destructive ; prétendre au niveau N2 ou N3 ce qui n'a atteint que N1.

**Obligation** : le rapport final publie, **par domaine**, la répartition
`EXECUTED / STATICALLY CHECKED / NOT EXECUTABLE HERE`.

---

## 8. Protocole de validation simulée — règles gelées

Nom obligatoire : **SIMULATED LEARNER VALIDATION**. Jamais « validation d'apprentissage »
tout court.

**Séquence gelée par leçon** : PRE-TEST → lecture → RAPPEL IMMÉDIAT → EXPLICATION →
APPLICATION → MISCONCEPTION → TRANSFERT.

**Règles d'exécution :**

| # | règle |
|---|---|
| S1 | le texte de la leçon **n'est pas accessible** pendant la restitution |
| S2 | les questions sont écrites **avant** la restitution et ne sont pas modifiées après |
| S3 | le PRE-TEST mesure ce qui est su **avant** lecture : il rend le gain interprétable |
| S4 | chaque axe est noté **séparément** sur [0, 1] et publié séparément |
| S5 | **aucune fusion** de `TEXT_SCORE` et `LEARNER_SIMULATION_SCORE` en un chiffre unique |
| S6 | un écart « texte fort / restitution faible » est un **résultat à analyser**, pas un bruit |
| S7 | le rappel différé est simulé **seulement si** c'est techniquement honnête ; sinon il est déclaré non mesuré |

**Échantillon (CP5)** : 24 leçons, **graine publiée avant le premier passage**, stratifiées sur
fondations / frontend / backend / données / systèmes / cloud / sécurité / ML / LLM-IA, sur
D14 bon vs faible, sur court vs long, sur parcours vs hors parcours. **Différent de
l'échantillon V71** : au plus 8 leçons communes avec les 32 de l'échantillon aveugle V71.

---

## 9. Seuils du verdict CURRICULUM INTEGRITY

| # | seuil | exigence |
|---|---|---|
| **C1** | journées de catégorie IMPOSSIBLE | **0** |
| **C2** | revues hebdomadaires HEAVY ou IMPOSSIBLE | **≤ 5** sur 52 |
| **C3** | compétences déclarées dans `program.json` sans aucune journée | **0** |
| **C4** | références mortes citées par une leçon (exercice, leçon, diagnostic) | **0** |
| **C5** | leçons dont la pratique échoue à P1 ou P3 | **≤ 2** |
| **C6** | redondances **R3** restantes : 0 · redondances **R2** restantes | **0 / ≤ 4** |
| **C7** | défauts factuels ouverts, vérifiables et non corrigés | **0** |
| **C8** | invariants : ordre des 365 jours, 128 / 365 / 365, `progress.json` non muté | **inchangés** |
| **C9** | `gates:active`, `npm test`, `tsc --noEmit`, `npm run build` | **tous verts** |
| **C10** | écart maximal entre `readingMinutes` publié et recalculé, par journée | **≤ 5 min** |

**`CURRICULUM_INTEGRITY_READY`** — C1 → C10 tous atteints.
**`CURRICULUM_INTEGRITY_CANDIDATE`** — C3, C4, C8 et C9 atteints, et **au plus deux** non
atteints parmi C1, C2, C5, C6, C7, C10.
**`CURRICULUM_INTEGRITY_NOT_READY`** — tous les autres cas.

## 10. Seuils du verdict SIMULATED LEARNING VALIDATION

| # | seuil | exigence |
|---|---|---|
| **L1** | protocole écrit et gelé **avant** le premier passage | oui |
| **L2** | échantillon de 24, graine publiée **avant** le premier passage | oui |
| **L3** | leçons passées AVANT **et** APRÈS | **24 / 24** |
| **L4** | restitution sans accès au texte (S1) | attesté |
| **L5** | cinq axes publiés séparément, jamais fusionnés | oui |
| **L6** | cas « texte fort / restitution faible » identifiés **et analysés un par un** | **0 non analysé** |
| **L7** | score moyen **APPLICATION** sur l'échantillon | **≥ 0,70** |
| **L8** | score moyen **TRANSFERT** sur l'échantillon | **≥ 0,55** |
| **L9** | leçons dont les cinq axes sont sous 0,50 | **0** |

**`SIMULATED_LEARNING_VALIDATION_READY`** — L1 → L9 tous atteints.
**`SIMULATED_LEARNING_VALIDATION_CANDIDATE`** — L1 → L6 atteints, et **au plus deux** non
atteints parmi L7, L8, L9.
**`SIMULATED_LEARNING_VALIDATION_NOT_READY`** — tous les autres cas.

**Les deux verdicts ne sont jamais fusionnés.** Aucun des deux ne vaut preuve d'apprentissage
humain réel.

---

## 11. Tests négatifs obligatoires

Tout invariant ou gate créé ou modifié par V72 doit être mis **volontairement en échec**, avec
restauration vérifiée à l'octet près. Minimum imposé :

1. une journée surchargée au-delà du budget ;
2. une leçon hors parcours porteuse d'une compétence déclarée ;
3. un prérequis exigé avant d'être enseigné, sans annonce ;
4. une revue qui dépasse le plafond de 7 leçons ;
5. une pratique sans livrable ni verbe de production ;
6. un `readingMinutes` périmé ;
7. un faux signal de `curriculum:depth-check` ;
8. une référence morte vers un exercice inexistant.

**Un gate vert jamais mis en échec volontairement n'est pas considéré comme validé.**

---

## 12. Interdits absolus de V72

1. modifier ce contrat après le commit du CP1 ;
2. modifier le barème V71 ou renoter les 128 leçons ;
3. réécrire une leçon **sans défaut mesuré** — le risque principal de V72 est de dégrader de
   bons cours à force de les retoucher ;
4. toucher `data/progress.json`, l'état utilisateur, l'ordre des 365 jours ;
5. inventer une progression, une preuve, un résultat d'apprenant, un score de compétence ou une
   donnée d'usage ;
6. fusionner les deux verdicts, ou présenter la validation simulée comme une preuve humaine ;
7. rendre un gate vert en abaissant un seuil ;
8. gonfler un texte pour atteindre un budget de temps.
