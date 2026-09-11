# V74 — RAPPORT FINAL
## RETENTION ENGINE I · Mémoire, récupération, apprentissage espacé, orchestration des révisions

---

# VERDICT

## `RETENTION_ENGINE_READY`

**Les douze critères bloquants `B1 → B12`, gelés au CP1 avant toute implémentation, sont tous
atteints.** L'échelle de verdict a été figée au même moment, et elle n'a pas été retouchée.

**Ce que ce verdict signifie :** le moteur est correct, déterministe, rejouable, explicable,
budgétairement honnête, et **réellement branché au produit**.

**Ce qu'il ne signifie PAS, et il faut le lire aussi fort :** il ne dit **rien** de l'efficacité
pédagogique. `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED` — inchangé depuis V72, inchangé
par V74. **Aucun apprenant humain n'a suivi ce parcours sous mesure.** Tout ce qui est vérifié
ici est une propriété d'ingénierie, pas une preuve d'apprentissage.

**Le caveat le plus important du rapport**, mesuré et publié plutôt que dissimulé : chez
l'apprenant irrégulier et chez celui qui échoue souvent, l'arriéré sature à **85 % et 92 %** des
notions rencontrées sur 365 jours. Le moteur est correct ; ces deux apprenants sont submergés.
**§17 explique pourquoi ce n'est pas un défaut d'ordonnancement, et où est la réponse.**

---

# 1. Ce que V74 devait changer

La question du produit avant V74 :

> « Qu'est-ce que l'apprenant doit apprendre aujourd'hui ? »

La question après :

> « Qu'est-ce que **cet** apprenant risque d'oublier maintenant, et quelle action pédagogique
> minimale lui donnera le meilleur rappel ? »

Les sept questions que le brief exigeait, et leur état à la fin :

| # | question | CP0 | fin V74 |
|---|---|---|---|
| 1 | doit-il la revoir maintenant ? | partiellement | **oui** — statut + bandes (CP3, CP8) |
| 2 | pourquoi ? | **non** | **oui** — sept facteurs, au plus deux cités (CP3) |
| 3 | sous quelle forme ? | **non** | **oui** — 5 formes × 12 archétypes (CP4, CP5) |
| 4 | pendant combien de temps ? | **non** | **oui** — minutes par forme, budget de journée (CP4, CP10) |
| 5 | relire / rappeler / produire / diagnostiquer / appliquer ? | **non** | **oui** — 12 archétypes adossés à des sections réelles (CP5) |
| 6 | qu'est-ce qui prouverait que le rappel était utile ? | **non** | **partiellement** — la tentative est un fait objectif (CP2), mais l'utilité reste non mesurée |
| 7 | quand la revoir ensuite ? | oui | oui — inchangé, `INTERVALS` de V66 (CP9) |

**Six questions sur sept ont progressé. La sixième reste ouverte, et c'est la plus importante.**

---

# 2. CE QUE JE CROYAIS AU CP0 ET QUI ÉTAIT FAUX

Le brief exigeait cette section. Elle est la plus utile du rapport.

## 2.1 « Il faut construire un moteur de rétention »

**Faux.** Il en existait déjà un, complet et branché : `lib/retention.mjs` (V66, 526 lignes),
la page `/retention`, la commande `RECORD_RECALL`, la persistance `recallAttempts`. Un Leitner
honnête — un seul fait écrit, tout le reste projeté.

V74 **étend**, il ne réinvente pas. Ce recadrage a changé tout le sprint : sans lui, j'aurais
écrit le quatrième moteur que le brief interdit.

## 2.2 « 207 exercices sur 376 sont rattachables à un concept »

**Faux — et l'erreur allait dans le sens qui m'arrangeait.** Le chiffre réel est **140**. Ma
sonde comptait les exercices déclarés par **au moins** une leçon, alors que la règle exige
**exactement** une. Découvert au CP7, corrigé dans le contrat gelé, le code et l'état.

Le code, lui, n'avait jamais changé : il attachait déjà 140. **C'est la mesure publiée qui était
fausse, pas l'implémentation** — et la décision de refuser l'option C en sortait *renforcée*
(236 exercices à trancher arbitrairement, non 169).

## 2.3 « `gates:active` compte 52 portes »

**Faux.** Quarante-six, et déjà quarante-six à la fin de V73. J'ai recopié le chiffre du rapport
V73 et l'ai répété dans **cinq** entrées de journal sans jamais le compter. Aucun verdict n'en
dépendait — le critère est « 0 violation » — mais **c'était un nombre recopié au lieu d'être
mesuré**.

## 2.4 « La journée de revue peut absorber ce que les journées chargées ne prennent pas »

**Faux, et réfuté par la mesure au CP10.** Les revues qui suivent les six séries de journées
surchargées pèsent **293 et 295 minutes** — 5 à 7 minutes de marge, pas les ~112 que la médiane
laissait espérer. La marge minimale sur les 52 revues est de **5 minutes**.

## 2.5 « Le champ `transfers` mesure le transfert »

**Faux.** Il comptait les contacts sur une journée dont les leçons portent ≥ 2 compétences :
**269 journées sur 365, soit 74 %**. Un indicateur qui s'allume trois fois sur quatre ne
distingue rien — et surtout, *deux compétences enseignées le même jour ne demandent pas de
transposer l'une dans l'autre*. **Erreur de nom, pas de seuil.**

## 2.6 « Le moteur écrit au CP2–CP11 est utilisé par le produit »

**Faux, et c'était le plus grave.** L'audit du CP12 a trouvé **six modules, zéro référence dans
`app/`, zéro read-model**. Des centaines de tests verts, et rien qu'un apprenant puisse voir.
C'est exactement ce que le critère **B12** vise.

## 2.7 « Un plafond de rattrapage protège l'apprenant »

**Faux : il ne pouvait jamais s'appliquer.** `REPORT_MAX_PAR_JOUR` était du code mort, parce que
le report écrasait sa valeur entrante au lieu de l'accumuler. Pire, la mesure qui en découlait
**minimisait sa propre perte d'un facteur 6,4** (115 minutes annoncées, 735 réelles).

---

# 3. LES QUATORZE ANOMALIES DE MES PROPRES SONDES

Le brief exigeait cette section aussi. **Quatorze**, dont **quatre allaient dans le sens qui
m'arrangeait** — celles-là sont les plus dangereuses, parce que rien ne pousse à les chercher.

| # | CP | ce que la sonde mesurait | ce qu'elle prétendait mesurer |
|---|---|---|---|
| 1 | CP0 | « le prochain projet après le **dernier contact** » — une constante | le prochain besoin curriculaire, **relatif à une date**. Donnait « aucun » pour les 20 compétences |
| 2 | CP0 | la **présence d'une section** dans le gabarit d'une journée | une **distribution de formes**. 6 catégories sur 9 sortaient à 313-365 |
| 3 | CP0 | `Mini-quiz` en texte libre → **236** journées | la **section** `## ❓ Mini-quiz` → **78**. Les deux justes, pas la même chose |
| 4 | CP3 | le nombre de `', et '` dans une phrase | le nombre de **facteurs cités**. La phrase de l'échec contient elle-même « , et » : **la sonde mesurait la ponctuation** |
| 5 | CP3 | **ma propre séquence de vérification** : `gates:active > /dev/null`, code de retour lu **après** le push | vérifier **avant** de pousser. Faute de séquence, publiée |
| 6 | CP5 | un motif **ancré** (`/^objectif/i`) | la présence d'une **section** dont le titre commence par un **émoji**. `FEYNMAN` sortait disponible sur **0 leçon sur 128** |
| 7 | CP7 ⚠ | les exercices **déclarés par au moins une** leçon → 207 | les exercices **rattachables à UNE** leçon → **140** |
| 8 | CP7 ⚠ | **un nombre recopié**, jamais compté : « 52 portes » | le nombre d'entrées de `gates:active` → **46** |
| 9 | CP8 | une **coïncidence de données** : la fiche en retard a naturellement le meilleur score | la **règle** « à jour ne passe pas devant en retard ». Passait avant **comme** après |
| 10 | CP9 | rien, **deux fois** : `sm2` court-circuite (`serie === 0` rend 1 j sans lire le facteur), puis une fixture posée sur le **plafond** (2,8) | la sensibilité à l'échec. *Et une mutation de contrôle était un no-op : `1 * 0 + 1` vaut `1`* |
| 11 | CP10 ⚠ | **20 minutes** perdues par semaine chargée (le report écrasait sa valeur entrante) | **120 minutes** réellement sautées. Sur l'année : **115 annoncées, 735 réelles** — facteur **6,4** |
| 12 | CP12 | la **présence d'une chaîne** : `includes('getPlanDuJour')` | l'existence d'un **branchement**. Le nom subsistait dans un `as ReturnType<typeof …>` |
| 13 | CP13 ⚠ | la **cohérence interne du plan avec lui-même** | le respect du budget de la **journée**. Aurait affiché ✅ sur une journée à **351 minutes** |
| 14 | CP14 | une fixture posant **exactement le cas où la règle n'a rien à décider** (`lastRetrievalAt` nul) | la règle **G5**. Le CP3 avait écrit « gardé par un test » : le test existait et **ne gardait rien** |

⚠ = l'erreur allait dans le sens qui m'arrangeait.

## 3.1 Les trois motifs qui reviennent

1. **une sonde qui mesure une chose et conclut sur une autre** (n° 1, 2, 4, 6, 13, 14) ;
2. **une fixture qui pose le cas non discriminant** — le test passe des deux côtés de la règle
   (n° 9, 10, 14). *Quatre occurrences, et à chaque fois découvertes par mutation, jamais par
   relecture* ;
3. **une mutation qui ne mute pas** (n° 10, et à nouveau au CP14 : `RECORD_EXERCISE_ATTEMPT_X`
   **contient** `RECORD_EXERCISE_ATTEMPT`). *Croire qu'une suite « résiste » à une non-mutation
   est pire que ne pas avoir muté du tout.*

**La leçon unique : un test vert ne prouve rien tant qu'on ne l'a pas vu rougir.**

---

# 4. Les décisions PRISES

| # | décision | CP | pourquoi |
|---|---|---|---|
| 1 | **`ExerciseAttempt` devient un fait canonique** | CP1-2 | *le système persistait la projection et jetait le fait* |
| 2 | **`RecallAttempt` enrichi additivement** | CP1 | aucune donnée historique invalidée |
| 3 | **`DERIVED_RECALL` à 4 conditions**, pas d'équivalence | CP1 | 236/376 exercices exigeraient un choix arbitraire |
| 4 | **`correctionSeen` vrai par défaut** | CP2 | le doute joue **contre** le compteur |
| 5 | **7 facteurs additifs, bornés, somme 100** | CP3 | un score qu'on ne peut décomposer n'a pas le droit d'exister |
| 6 | **Les `differes` sont une SORTIE** | CP4 | savoir ce qui a été écarté rend l'ordre contestable |
| 7 | **12 archétypes adossés à des sections réelles** | CP5 | une tâche cite une section réelle, ou elle n'existe pas |
| 8 | **2 places anciennes, espacement ≥ 21 jours** | CP6 | une leçon vue il y a 15 jours n'est pas « espacée » |
| 9 | **La correction complète est la DERNIÈRE marche** | CP7 | la donner tôt détruit la seule mesure objective du produit |
| 10 | **Le statut décide de la bande, le score du rang dedans** | CP8 | `INTERVALS` est publiée : un score qui la contredit la rend décorative |
| 11 | **Une place réservée aux notions jamais tentées** | CP8 | seul statut qui **peut** mourir de faim : il n'a pas d'échéance |
| 12 | **Leitner (V66) conservé** | CP9 | aucune preuve ne justifie de changer une échelle publiée |
| 13 | **Une journée hors budget reçoit ZÉRO minute** | CP10 | une journée à 331 min n'a pas 20 minutes cachées |
| 14 | **Le signal PROPOSE, il ne décide pas** | CP10 | sauter une journée appartient à la personne |
| 15 | **`transfers` = preuve de défi, et vaut 0** | CP11 | un zéro honnête vaut mieux qu'un compteur saturé |
| 16 | **`transfer-challenge` devient un type de preuve** | CP11 | sans lui, le compteur ne pouvait valoir que zéro **à jamais** |

## Les décisions ABANDONNÉES

| décision envisagée | pourquoi abandonnée |
|---|---|
| **Option D — un quatrième moteur** | interdit par le brief, et rien dans la mesure ne l'exigeait |
| **Option C — exercice réussi = rappel réussi** | 236/376 exercices exigeraient de trancher entre 3 leçons en médiane, jusqu'à 14 |
| **SM-2 comme échelle** | facteur de facilité flottant réglé par auto-évaluation — le produit en a déjà trop |
| **Adopter un des 5 modèles d'oubli du CP9** | le classement se retourne selon l'hypothèse **et** selon la graine : signal **sous le bruit** |
| **`WEAK` / `PREREQUISITE` dans le générateur** | l'un exige l'état de l'apprenant (curriculum statique), l'autre crée une **dépendance circulaire** |
| **La revue comme réservoir de report** | réfutée par la mesure : 5 à 7 minutes de marge, pas 112 |
| **Réservation élargie à toute fiche non en retard** | rendait l'arriéré à son niveau d'avant (60 contre 61) |
| **Un facteur de priorité sur `transfers`** | valeur structurellement nulle → code mort (leçon de l'anomalie n° 11) |
| **Corriger les 44 journées HEAVY** | reviendrait à retirer du contenu pour verdir une métrique de rétention (**G12**) |
| **Enrichir les `practiceRefs` pour lever la dette D8** | idem : modifier le curriculum au service d'une métrique |

---

# 5. MESURÉ · INTERPRÉTÉ · NON PROUVÉ

La séparation que le brief exigeait. **Rien ne traverse une colonne sans le dire.**

## 5.1 MESURÉ — des nombres, reproductibles

| mesure | valeur |
|---|---|
| journées surchargées (> 300 min) | **44 / 365**, en **6 séries de 6 jours consécutifs** |
| marge minimale sur une journée de revue | **5 minutes** |
| semaines dépassant 7 × 300 min | **3 / 52** (S32 +181, S33 +125, S34 +98) |
| minutes hors budget introduites par le plan | **1798 → 0** |
| minutes de réactivation non placées sur l'année | **735** (10 % du volume visé) |
| intervalles = 1 jour, grain compétence | **78 % → 69 %** |
| intervalles ≥ 8 jours, grain compétence | **8 % → 13 %** |
| compétences en `RAPPEL_TROP_PROCHE` | **15/20 → 12/20** |
| écart médian leçon → revue | **1 j → 3 j** |
| paires leçon × revue à ≥ 7 jours | **12 % → 37 %** |
| archétypes de rappel implémentés | **12**, couverture `FREE_RECALL` 128/128 … `HARDER_IMPLEMENTATION` 31/128 |
| exercices rattachables à une leçon unique | **140 / 376** |
| exercices avec voisin strictement plus simple | **331 / 376** |
| exercices nommés par une misconception | **121 / 376** |
| défis de transfert T4/T5 | **25**, couvrant **18/20** compétences |
| journées citant un défi de transfert | **0 / 365** |
| mutations négatives vues rougir | **15 / 15** |
| tests · portes | **1612 / 1612** · **47 portes, 0 violation** |

## 5.2 INTERPRÉTÉ — des jugements défendables, pas des faits

- **les poids de priorité** (30/20/15/15/10/5/5) : ordres de grandeur assumés, contestables,
  modifiables à condition d'écrire la raison. **Ils n'ont pas été réglés pour produire une jolie
  distribution** (ce serait G11) ;
- **les minutes par forme et par action** : ordres de grandeur **déclarés**, pas mesurés ;
- **`SEUIL_ALERTE_ARRIERE = 25`**, **`ESPACEMENT_MIN_JOURS = 21`**, **`PLACES_DECOUVERTE = 1`**,
  **`FENETRE_MASSAGE_MIN = 20`**, **`DELAI_REPRISE_HEURES = 20`** : tous déclarés et publiés ;
- **l'ordre des marches de remédiation** : défendable (la plus petite aide qui puisse débloquer),
  **non validé sur un apprenant réel** ;
- **le seuil de famine à 30 jours actifs** : choisi **après** avoir observé le maximum réel
  (23). Ce qui prouve la propriété est **la borne mesurée**, pas le seuil — et le dire est la
  seule façon de ne pas faire passer un seuil confortable pour une démonstration.

## 5.3 NON PROUVÉ — et qui le reste

- **que ce moteur fasse mieux retenir quoi que ce soit.** `REAL_HUMAN_LEARNING_EVIDENCE = NOT
  YET MEASURED` ;
- **qu'un archétype de rappel vaille mieux qu'un autre** ;
- **qu'un modèle d'oubli soit meilleur qu'un autre** — le CP9 a démontré l'inverse : le
  classement se retourne selon l'hypothèse **et** selon la graine ;
- **qu'un rappel ait été « utile »** — question 6 des sept, toujours ouverte ;
- **la probabilité qu'un apprenant se souvienne d'une notion** — déclarée `UNMEASURABLE` au CP0
  et jamais produite depuis. Les cinq statuts sont des **états de planification**, pas des
  probabilités.

---

# 6 → 17. LES CRITÈRES, UN PAR UN

## 6. B1 — rejouabilité ✅
Deux tests indépendants : deux appels identiques rendent une **égalité stricte**, et **l'ordre
d'insertion des faits n'a aucun effet**. Garanti par le tri à la lecture et le dédoublonnage par
clé métier.

## 7. B2 — déterminisme ✅
Aucune horloge lue, aucun aléa, dans les six modules décisionnels — vérifié par la porte
`v74:check` (R5) et par des tests dédiés au CP4, CP7, CP10. Les tris sont **totaux** (dernière
clé : l'identifiant), sans quoi deux exécutions pourraient rendre deux ordres.

## 8. B3 — aucun état fabricable ✅
**Vérifié à la mesure** : aucun des cinq états de rétention n'apparaît dans
`lib/learning-engine.mjs` ni dans `lib/progress-store.mjs`. Ils sont **projetés**, jamais
stockés. Les 21 commandes du moteur n'en écrivent aucun.

## 9. B4 — `data/progress.json` jamais créé ✅
Absent. Les vérifications du CP12 qui exigeaient un état d'apprenant ont utilisé
`AICOS_PROGRESS_FILE` vers un fichier **hors du dépôt**.

## 10. B5 — invariants V73 ✅
`128` leçons · `365` journées · `52` semaines · `12` mois · corpus **`92d5fae6`** — inchangé.

## 11. B6 — chaîne verte ✅
`npm test` **1612/1612** · `tsc --noEmit` **0** · `build` **OK** · `gates:active` **47 portes,
0 violation** · porte V73 verte · **porte V74 créée au CP14** (21 vérifications).

## 12. B7 — 15 mutations ✅
**15/15 vues rougir**, 15 fichiers restaurés à l'octet près. Au premier passage : 13/15 — les
deux trous étaient réels et ont été comblés (§3, n° 14).

## 13. B8 — arriéré borné ✅ *(avec le caveat le plus important du rapport)*
**Bornée : oui.** L'arriéré est **structurellement plafonné** par le nombre de notions
rencontrées (une notion est due au plus une fois), et il **sature** au lieu de diverger.

**Mais la saturation est haute pour deux profils**, sur 365 jours :

| profil | rencontrées | arriéré max | part du plafond |
|---|---|---|---|
| A parfait | 121 | 17 | **14 %** |
| **B irrégulier** | 106 | 90 | **85 %** |
| **C nombreux échecs** | 121 | 111 | **92 %** |
| D très peu actif | 58 | 32 | 55 % |
| E progression rapide | 121 | 36 | 30 % |
| F oublis sélectifs | 121 | 27 | 22 % |
| G reprend après 30 j | 107 | 42 | 39 % |
| H sans preuves | 121 | 51 | 42 % |

**B8 est satisfait à la lettre, et l'esprit demande une note : pour B et C, presque tout est en
retard.** Voir §17.

## 14. B9 — aucune compétence oubliée ✅
**0 famine sur les 8 profils.** Borne mesurée : **23 jours actifs** d'attente maximale, et
**0 notion** au-delà de 30. Garanti par la place réservée du CP8 — dont la suppression fait
rougir 8 tests.

## 15. B10 — priorité explicable ✅
**0 unité proposée sans justification**, sur les 8 profils et des milliers de propositions.
Chaque unité porte ses facteurs, leur valeur observée, leurs points et une phrase lisible — **au
plus deux facteurs cités**, parce qu'au-delà une justification cesse d'en être une.

## 16. B11 — budget respecté ✅
**Les minutes hors budget introduites par V74 sont passées de 1798 à 0.** Les 44 journées encore
au-dessus le sont **par le seul fait du curriculum** ; le plan n'y ajoute plus une minute.
Vérifié aussi sur les 8 profils (0 séance hors budget), après correction de l'anomalie n° 13.

## 17. B12 — le scheduler est réellement utilisé ✅
**C'était NON jusqu'au CP12.** Aujourd'hui : `lib/plan-jour-server.ts` assemble la chaîne
complète, `/retention` l'affiche avec le pourquoi, la forme, les minutes et ce qui a été écarté,
et le laboratoire rend la remédiation après chaque échec.

**Vérifié sur le rendu réel**, pas seulement dans le code :

> **Terminal, shell et système de fichiers** — À revoir
> *ta dernière tentative n'a pas abouti, il y a 16 jours, et tu n'y es pas revenu depuis, et tu
> l'as retrouvé il y a 39 jours.*
> **Question posée · environ 3 min** — Réponds à voix haute aux questions d'entretien de la
> leçon, sans les relire d'abord.

**Et gardé par la porte** `v74:check` règle R6 — vue rougir quand on débranche l'arbitre.

---

# 18. Les critères NON bloquants — mesurés, et deux ont progressé

| # | critère | cible | résultat |
|---|---|---|---|
| **N1** | part des intervalles valant 1 jour | en baisse depuis 78 % | **69 %** (grain compétence) · concept 74 % → 68 % · **≥ 8 j : 8 % → 13 %** |
| **N2** | compétences en `RAPPEL_TROP_PROCHE` | en baisse depuis 15/20 | **12 / 20** |
| **N3** | archétypes implémentés | ≥ 10 | **12** |
| **N4** | exercices produisant un `DERIVED_RECALL` | mesurée, **non maximisée** | **140 / 376 (37 %)** — délibérément non maximisée |
| **N5** | délai médian échec → remédiation | mesuré | **0** — la remédiation est rendue **dans la réponse de la tentative** |

**N1 et N2 étaient délibérément non bloquants**, parce que la cause dominante mesurée au CP0 est
le rattachement des leçons aux journées — un défaut de curriculum, pas du moteur. **Ils ont
progressé quand même**, et sans qu'une seule journée de travail ait été modifiée : le gain vient
entièrement du CP6 (les 52 revues portent désormais des leçons anciennes).

**La médiane reste à 1 jour**, et c'était prévu : **94 leçons sur 247 sont liées aux six
journées de leur semaine**, ce qui rend l'écart de 1 arithmétiquement inévitable quelle que soit
la date de la revue.

---

# 19. Les dix dettes

| # | dette | statut |
|---|---|---|
| **D1** | un exercice raté n'écrit rien | **PAYÉE** (CP2) |
| **D2** | un exercice réussi n'émet pas de fait de rétention | **PAYÉE** (CP2) |
| **D3** | `RECORD_ATTEMPT` appelé avec `outcome: 'attempted'` en dur | ouverte |
| **D4** | `evidence[]` porte `competencyIds` (20), jamais `conceptId` (128) | ouverte — **bloque le candidat `evidence-aware`** |
| **D5** | trois mécanismes de révision sans arbitre | **PAYÉE** (CP1 § responsabilités disjointes, CP12 branchement) |
| **D6** | `weeklyReviews{}` sans schéma normalisé | ouverte |
| **D7** | aucune durée ni preuve d'utilité d'un rappel | **partiellement** — `durationMs` existe, l'utilité reste non mesurée |
| **D8** | 192 exercices sans leçon rattachable sans ambiguïté | ouverte — **plafonne 2 marches de remédiation à 49 %** |
| **D9** | 44 journées HEAVY → 6 séries de 6 jours sans réactivation | ouverte — **dette de curriculum, délibérément non corrigée** |
| **D10** | 25 défis de transfert inatteignables (3 verrous sur 4) | **1 verrou levé** (type de preuve), 3 ouverts |

---

# 20. Ce que le sprint n'a délibérément PAS fait

- **aucune journée du curriculum n'a été réécrite** pour satisfaire une sonde ;
- **aucune compétence difficile n'a été supprimée** ;
- **aucun `progress.json` fabriqué** ;
- **aucun bloc de rappel ajouté aux 313 journées** pour faire passer `FREE_RECALL` de 52 à 365
  sans qu'aucune propriété ne change (**G12**) ;
- **aucun paramètre déplacé jusqu'à ce que les statistiques deviennent jolies** (**G11**) — le
  cas le plus tentant était l'apprenant à 50 % au CP8, laissé à **61 → 63** plutôt que retouché ;
- **aucun critère de verdict modifié** après coup, dans un sens ni dans l'autre.

---

# 21. Les douze contournements interdits, et où ils ont failli passer

| # | contournement | où il a été tentant |
|---|---|---|
| G1 | inventer un contact | jamais franchi — les fiches sans exposition sont exclues |
| G2 | `done` = contact significatif | gardé par test, mutation M01 rouge |
| G5 | « récent » protège | **le test qui le gardait ne gardait rien** (anomalie n° 14) |
| G7 | présenter un chiffre inventé comme mesuré | minutes par forme — déclarées explicitement |
| G9 | absence d'échec enregistré = absence d'échec | cause racine du CP0, payée au CP2 |
| G11 | régler un paramètre jusqu'à ce que ce soit joli | **CP8, apprenant à 50 %** — refusé, publié tel quel |
| G12 | ajouter des rappels pour faire monter un compteur | **CP10** — 1798 minutes hors budget supprimées, pas ajoutées |

---

# 22. Ce qu'il faudrait pour aller plus loin

Par ordre de valeur décroissante :

1. **des données d'apprenants réels.** Tout le reste est secondaire. Sans elles, le CP9 restera
   indécidable, la question 6 restera ouverte, et `READY` continuera de vouloir dire « correct »
   et non « efficace » ;
2. **payer D4** (rattacher les preuves au grain concept) — débloque le seul candidat de modèle
   d'oubli qui s'appuierait sur la donnée la plus objective du produit ;
3. **lever les 3 verrous restants de D10** — 25 défis T4/T5 validés attendent une page et un
   lien depuis les journées ;
4. **payer D9** — les 44 journées HEAVY coûtent 6 séries de 6 jours sans réactivation et
   735 minutes par an. C'est un arbitrage de curriculum, pas de moteur ;
5. **persister la tendance de l'arriéré** — sans elle, le signal de ralentissement ne propose
   jamais de ralentir. *Inventer une tendance aurait été fabriquer un fait.*

---

# 23. Chiffres finaux

| | |
|---|---|
| tests | **1612 / 1612** |
| `tsc --noEmit` | **0** |
| `build` | **OK** |
| portes actives | **47**, 0 violation *(46 + `v74:check` créée au CP14)* |
| mutations négatives | **15 / 15** vues rougir |
| anomalies de sonde publiées | **14**, dont **4** en ma faveur |
| modules créés | 8 · **tests V74 ajoutés** : 192 |
| journées de curriculum modifiées | **46 journées de revue** (CP6) · **0 journée de travail** |
| corpus des leçons | `92d5fae6` **inchangé** |
| `data/progress.json` | **absent** |

---

# 24. La phrase qui résume le sprint

> **Le moteur sait désormais dire ce qu'il faut revoir, pourquoi, sous quelle forme, combien de
> temps, et ce qu'il a écarté — et l'apprenant peut le lire et le contester.**
>
> **Il ne sait toujours pas si cela aide qui que ce soit à retenir quoi que ce soit.**
>
> La première phrase justifie `READY`. La seconde explique pourquoi ce mot ne doit pas être lu
> comme une promesse pédagogique.

---

*Rapport final du sprint V74 · Retention Engine I. Verdict : **`RETENTION_ENGINE_READY`**.
Artefacts : `docs/v74/` — contrat gelé, 12 rapports de checkpoint, état d'avancement, mesures
CP0 (intactes) et mesures finales (`cp15-forensics-after.json`).*
