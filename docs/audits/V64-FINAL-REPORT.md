# V64 — LEARNING ENGINE I · Rapport final

**Verdict : `LEARNING_ENGINE_FOUNDATION_READY`** — 12/12 conditions bloquantes,
aucune régression sur la clôture UX de V63.

---

## A. Ce que V64 a réellement changé

Avant ce sprint, le moteur d'apprentissage du produit tenait en une ligne :

```ts
progress.days[String(day)] = { ...existing, ...patch, updatedAt: now };
```

Elle acceptait n'importe quel corps JSON, autorisait `not-started → done`,
réécrivait `completedAt` à chaque clic, et enregistrait huit champs que plus
aucun read-model ne lisait.

Une journée a désormais une **session** : un état, une heure de début réelle,
des étapes dérivées du corpus, des soumissions horodatées qui s'ajoutent au lieu
de s'écraser, des validations déterministes et des preuves idempotentes.

**`status` n'est plus écrit par personne.** Il est devenu une *projection* de la
session, recalculée par le moteur à chaque commande — une seule source de vérité,
et six read-models existants (`resume`, `skill-state`, dashboard, calendrier,
révisions, synthèse) qui continuent de fonctionner sans être touchés.

---

## B. Les douze conditions gelées au CP1

Gelées dans `docs/V64-CRITERIA-FROZEN.md`, committées **avant** la première
ligne de moteur. Le barème n'a pas été modifié après mesure.

| # | Condition | Résultat |
|---|---|---|
| 1 | Une visite ne mute jamais la progression | **0 mutation** sur 20 familles de routes, hachage sans restauration |
| 2 | `NOT_STARTED → COMPLETED` rejeté | refusé, **0 écriture** |
| 3 | Transition invalide sans mutation | **9 commandes refusées, fichier identique** |
| 4 | `START` mute exactement une fois | 1 mutation, `startedAt` écrit, 2ᵉ `START` refusé |
| 5 | `COMPLETE` idempotent | `completedAt` inchangé après 3 appels, **fichier identique** |
| 6 | Soumission ne touche que sa cible | journée voisine et soumission antérieure intactes, octet pour octet |
| 7 | Rechargement préserve la session | identique après 2 rechargements + relecture API |
| 8 | Migration déterministe, idempotente, sans perte | `migrate(migrate(x)) === migrate(x)` sur 7 formes ; V5 chargée : 0 champ perdu |
| 9 | Écriture interrompue récupérable | ancien fichier intact, résidu `.tmp` non confondu |
| 10 | ≥1 validation automatique déterministe branchée | `exercise-tests` bout en bout, preuve idempotente |
| 11 | Aucun test ne touche `data/progress.json` | sha256 identique après 1 330 tests **et** après les 3 harnais |
| 12 | Invariants produit | corpus, 365 jours, ordre : **inchangés** |

**Empreintes d'entrée = empreintes de sortie :**

| Objet | Entrée | Sortie |
|---|---|---|
| `curriculum/` (951 fichiers) | `176ecde8…b80cec` | **identique** |
| `data/` hors progression (546 fichiers) | `27c1e532…432968` | **identique** |
| `data/progress.json` | `73c1ee39…1fc6e7a6` | **identique** |
| 365 jours, ordre | md5 `20be438d…80a1d9` | **identique** |

---

## C. Non-régression UX — la clôture de V63 tient

Le moteur ajoute des affordances à la Vue Jour. Il n'avait **pas le droit de la
rallonger**. Mesuré :

| route | largeur | plafond gelé V63 | mesuré V64 |
|---|--:|--:|--:|
| `/day/80` | 375 | ≤ 13 425 px | **13 425 px** |
| `/day/80` | 1440 | ≤ 1 321 px | **1 321 px** |
| `/day/1` | 375 | ≤ 6 350 px | **6 349 px** |
| `/day/181` | 375 | ≤ 3 616 px | **3 615 px** |
| `/day/205` | 375 | ≤ 4 827 px | **4 826 px** |
| `/day/320` | 375 | ≤ 11 483 px | **11 482 px** |

Au pixel près sur `/day/80`. Ce n'est pas de la chance : les commandes de
soumission sont posées **en position absolue dans le champ**, dans la réserve
basse d'une zone de saisie dont la `min-height` ne bouge pas. Coût mesuré en
désactivant la règle à chaud sur `/day/1?v=faire` @375 :

```
affordance en position absolue : 6 603 px
la même en flux normal         : 6 723 px
coût de hauteur évité          :   120 px
```

Également tenu : **0 débordement horizontal sur 30 états**, **0 violation axe
critical / serious** (wcag2a/aa, wcag21a/aa, 6 routes × 2 largeurs).

---

## D. Le parcours complet, démontré

`scripts/v64-walkthrough.mjs`, contre un serveur réel et une fixture isolée :

| étape | vérifié |
|---|---|
| la journée est ouverte | session `active`, `startedAt` réel, statut projeté |
| l'apprenant écrit | brouillon conservé — **et la session reste fermée** : écrire n'est pas commencer |
| l'apprenant rend | soumission horodatée, étape « rendu », **aucune note inventée** |
| une validation déterministe arrive | étape validée, **preuve créée**, compétence portée |
| la journée est clôturée | session `completed`, statut projeté `done` |
| une révision est planifiée | échéance réelle, intervalle 3 j — celui du moteur, pas un chiffre recopié |
| les surfaces montrent la donnée réelle | `/skills` : « 1 compétence démontrée sur 20 », « Git / Linux · 1 preuve » |

Captures : `docs/design/v64/`.

---

## E. Le branchement, pas la duplication

Le CP0 a trouvé, dans `/lab`, une chaîne **soumission → validation déterministe
→ preuve idempotente → compétence** qui fonctionnait déjà, sur **247 des 365
journées** (400 liens, 376 exercices). Elle vivait hors de toute session : on
pouvait réussir un exercice sans que la journée le sache.

V64 ne l'a pas réécrite. V64 lui a donné un endroit où atterrir.

`POST /api/lab/[exerciseId]` avec `action:'run'` enregistre désormais, pour
chaque journée liée **dont la session est ouverte**, une soumission portant la
validation `exercise-tests`. Une journée non commencée n'est **pas** démarrée
d'office : on peut s'entraîner au laboratoire sans ouvrir la journée, et le
moteur refuserait la commande de toute façon — un refus n'écrit rien.

Les deux chemins convergent sur **une seule preuve** : le laboratoire passe
`evidenceId: 'lab-<exerciseId>'`, l'identifiant que `recordExerciseSuccess`
utilisait déjà. `addEvidence` refuse le doublon. Vérifié : re-valider ajoute une
soumission et **ne double pas** la preuve.

Second type déterministe branché : `gradeAssessment`. `/diagnostics` corrigeait
dans le navigateur et gardait tout dans `useState` — un rechargement effaçait le
diagnostic (anomalie A9). La correction passe maintenant par
`POST /api/assessments/[id]`, côté serveur : un score persisté doit être
**calculé par le produit**, jamais transmis par le client. Le conserver reste un
geste explicite, et la réserve voyage avec la preuve : *« un score est un indice,
pas une preuve de maîtrise »*.

---

## F. Les douze points du §2, un par un

| # | Point | Traité |
|---|---|---|
| 1 | État d'une journée | **oui** — `LearningSession`, 4 états, cycle complet |
| 2 | Soumission de preuve | **oui** — ajoutée, jamais écrasée, horodatée |
| 3 | Validation déterministe | **oui** — `exercise-tests` et `assessment-grade` ; jamais une note arbitraire |
| 4 | Compétences alimentées par les preuves | **oui** — inchangé dans son principe, désormais nourri |
| 5 | Révisions déclenchées par la clôture | **oui** — `COMPLETE` peut planifier ; `SET_COMPREHENSION` planifie |
| 6 | Diagnostics → preuve | **oui, avec réserve** — correction serveur + conservation explicite. La preuve se rattache à la session ouverte ; s'il n'y en a aucune, le produit le **dit** au lieu de deviner une journée |
| 7 | Historique | **partiel** — les soumissions constituent un historique réel et horodaté ; il n'a pas encore de surface dédiée. Dette assumée, §H |
| 8 | Reprise depuis un état | **oui** — `openSessions()` expose les sessions ouvertes ; `resolveResume` n'est plus la seule source |
| 9 | Feedback dérivé du corpus | **oui** — les étapes viennent de `deriveActivities`, rien n'est généré |
| 10 | Orchestration lecture → pratique → validation → preuve | **oui** — démontrée bout en bout, §D |
| 11 | Persistance fiable | **oui** — écriture atomique, migration testée, récupération testée |
| 12 | Préparation à l'IDE local | **oui** — `ATTACH_VALIDATION` accepte une validation produite par n'importe quel exécuteur ; le moteur ne sait pas d'où elle vient |

---

## G. Ce que les gates protègent maintenant

`v64:check` — **29 vérifications**, câblé dans `gates:active` (**42 gates**).

Vu échouer, une par une, avant d'être considéré acquis :

| test négatif | résultat |
|---|---|
| réintroduire le patch libre dans la route | **détecté** |
| donner une horloge propre au moteur | **détecté** |
| autoriser `NOT_STARTED → COMPLETED` | **détecté** |
| revenir à une écriture non atomique | **détecté** (2 vérifications) |
| retirer l'affichage d'erreur d'un écrivain | **détecté** |
| faire écrire un statut par un client | **NON DÉTECTÉ au premier essai** |
| idem, après correction | **détecté** |
| repasser un client à l'ancien protocole | **détecté** |

### Le trou, et pourquoi il comptait

La vérification 4 cherchait `sendCommand({ … status: … })`. Or `DayPanel`
enveloppe `sendCommand` dans un helper local `send()` : la commande fautive
passait sous le radar. Le gate cherchait **le nom de l'appelant** au lieu de
**la forme de la commande**. Corrigé : tout littéral `{ type: 'UPPERCASE', … }`
est une commande du moteur, quel que soit ce qui l'envoie.

**C'est le quatrième sprint consécutif où le test négatif trouve un trou dans un
gate neuf.** La leçon ne s'use pas : un gate qu'on n'a pas vu échouer ne protège
rien.

Deuxième trou du même ordre, trouvé au premier lancement : la vérification 1
échouait **sur son propre commentaire d'ADR** qui citait le motif interdit. Un
gate qui lit les commentaires est un gate qu'un commentaire peut tromper — le
scanner ne regarde plus que le code exécutable.

---

## H. Ce que le gate a trouvé dans mon propre travail

`ReviewList` appelait `setError()` et **n'affichait jamais l'erreur**. Exactement
l'anomalie A10 que le CP0 reprochait à `StartDayButton` — reproduite par moi,
dans le même sprint où je la corrigeais. Trouvée par la vérification 6, pas par
relecture.

Le harnais d'intégrité a trouvé le second : `COMPLETE` sur une journée déjà
terminée ne réécrivait pas `completedAt`, mais la route appelait quand même
`writeProgress`, qui rafraîchit `lastOpenedAt` — l'idempotence était vraie sur le
champ et **fausse sur le disque**. La route ne écrit plus rien sur un no-op.

---

## I. Hygiène de mesure — le compteur continue

Quatre sondes fausses en V62, deux en V63, **deux de plus ici**. Aucune n'a été
corrigée en modifiant le produit.

1. **Faux positif XSS.** La sonde cherchait la chaîne `onerror=alert(1)` dans le
   HTML. Elle y est — dans la charge utile RSC, avec `<` sérialisé en `<`,
   donc sans aucune frontière de balise et sans possibilité de refermer le script
   inline. La bonne question n'était pas « la chaîne apparaît-elle » mais
   « peut-elle ouvrir une balise ». Sonde corrigée, produit inchangé.
2. **Donnée de test fabriquée.** Le parcours passait la compétence `javascript`,
   qui **n'existe pas dans le programme** — le jour 1 porte `gitlinux`. `/skills`
   n'affichait donc rien, et c'était correct. Le script lit maintenant la
   compétence dans le corpus. Rien de hardcodé.

Un troisième incident, d'orchestration : le contrôle UX exigeait le bouton
« Commencer » alors que le harnais d'intégrité avait déjà démarré le jour 1 sur
la même fixture. Le contrôle vérifie désormais qu'**une** commande de cycle de
vie est offerte, quel que soit l'état.

Et la règle qui a encore gagné : **la capture bat la métrique.** Toutes les
sondes de `/skills` étaient vertes ; c'est en regardant la capture que j'ai vu
« Auto-évaluation moyenne **0,0 / 5** » alors que rien n'avait été auto-évalué.
Une moyenne de zéro observation n'est pas une moyenne : c'est une valeur inventée
avec le poids visuel d'une donnée réelle — précisément la dette P0-1 de V63.
Elle affiche maintenant « non renseigné ».

---

## J. Champs legacy : la décision, sans troisième option

Le CP0 a trouvé huit champs écrits et jamais relus. Aucun n'a été supprimé du
fichier de l'utilisateur.

| alimentés désormais | gelés legacy (conservés, plus jamais écrits) |
|---|---|
| `answers` — brouillon d'une soumission | `answer` (réponse globale) |
| `notes` — remonte dans la vue de session | `selfScore` → remplacé par `selfAssessment.level` |
| `attempts` — une soumission incrémente | `checklist` → remplacée par les étapes |
| `startedAt` — écrit au premier `START` | `selfAssessment.criteria`, `.comment` |

La checklist du corpus reste **affichée** sur `/day`, en grille de relecture, avec
la mention explicite que ce qui est enregistré est désormais la soumission.

---

## K. Dette assumée à la sortie

Honnêteté d'abord : ce sprint ouvre le moteur, il ne le termine pas.

1. **Pas de surface d'historique.** Les soumissions existent, sont horodatées et
   versionnées ; aucune vue ne les déroule. La donnée est là, la fenêtre manque.
2. **Le rattachement d'un diagnostic est approximatif.** Il vise la session
   ouverte la plus avancée. C'est honnête — le produit le dit quand il n'y en a
   pas — mais ce n'est pas un vrai lien diagnostic ↔ journée.
3. **Les états vides des 19 compétences non abordées** montrent encore des
   rangées de points à `0/5`. La moyenne est corrigée ; les rangées restent.
4. **`SET_STEP` n'est pas exposé dans l'interface.** La commande existe et est
   testée ; aucune affordance ne la déclenche encore.
5. **`missions` reste hors de `types.ts::Progress`** — normalisé dans le store,
   absent du type. Cosmétique, mais c'est une divergence.
6. **La reprise du dashboard utilise toujours `resolveResume`**, pas
   `openSessions`. Les deux coexistent ; le second est plus juste.

Aucun de ces six points n'invalide une condition de sortie. Ils sont listés pour
que le prochain sprint parte de ce qui est vrai, pas de ce qui est confortable.

---

## Vérification finale

```
tsc            : 0 erreur
build          : compilé
tests          : 1 330 / 1 330
gates:active   : 42 gates verts (dont v64:check, 29 vérifications)
intégrité V64  : 47 / 47 invariants
UX V64         : 6 budgets de hauteur, 0 débordement/30, 0 axe critical|serious
parcours       : jour 1 → preuve → compétence → révision, démontré
progress.json  : 73c1ee39…1fc6e7a6 — inchangé de bout en bout
```

**`LEARNING_ENGINE_FOUNDATION_READY`**

V65 n'est pas lancé.
