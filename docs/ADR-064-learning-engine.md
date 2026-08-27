# ADR-064 — Learning Engine I : la journée devient une session

**Statut :** accepté (V64 · CP1)
**Contexte :** `docs/audits/V64-CP0-AUDIT.md`

---

## 1. Décision en une phrase

Une journée pédagogique cesse d'être **un statut** et devient **une session** :
un objet avec un cycle de vie, des étapes, des soumissions horodatées, des
validations et des preuves — le tout derrière **une seule commande serveur
validée**, dont `status` n'est plus qu'une projection dérivée.

## 2. Le problème, tel que mesuré au CP0

`POST /api/progress` applique `{ ...existing, ...patch }`. Cette ligne est le
moteur d'apprentissage actuel. Elle accepte n'importe quel corps JSON, autorise
`not-started → done`, réécrit `completedAt` à chaque clic, et écrit huit champs
que personne ne relit jamais. Le produit enregistre du travail ; il n'en fait
rien.

## 3. Principe directeur : brancher, pas dupliquer

Le CP0 a trouvé, dans `/lab`, une chaîne **soumission → validation
déterministe → preuve idempotente → compétence** qui fonctionne déjà, sur 247
des 365 journées. `lib/assessment.mjs::gradeAssessment` fournit une seconde
notation déterministe, déjà testée, aujourd'hui jetée à chaque rechargement.

V64 ne réécrit ni l'une ni l'autre. **V64 leur donne un endroit où atterrir.**

Corollaire, opposable à toute proposition d'architecture pendant ce sprint :

> Est-ce que ce composant existe déjà ailleurs dans le produit ?
> Si oui, on le branche. On ne le réimplémente pas « proprement ».

## 4. Où vit la session — et pourquoi pas ailleurs

**La session vit dans `DayProgress`, sous la clé `session`.** Elle n'a ni
fichier, ni table, ni espace de noms propre.

C'est délibéré et c'est l'invariant §1 du brief : *« Pas de deuxième système de
progression parallèle. »* Une session dans un fichier séparé serait une seconde
source de vérité le jour où les deux divergent — et ils divergent toujours.

Rejeté explicitement : SQLite, Prisma, un `sessions.json` à côté, un store
client. Le brief les interdit et le CP0 ne montre aucun problème qu'ils
résoudraient.

## 5. Le modèle

### 5.1 `LearningSession`

```
session: {
  state:       'not_started' | 'active' | 'paused' | 'completed',
  startedAt:   ISO | null,     // écrit UNE fois, au premier START
  lastActiveAt:ISO | null,
  completedAt: ISO | null,     // écrit UNE fois, jamais réécrit
  reopenCount: number,         // combien de fois rouverte
  steps:       { [stepId]: LearningStep },
}
```

`startedAt` existe déjà dans `types.ts`, normalisé par `learning.mjs`, écrit par
personne (anomalie A5 du CP0). Il devient le premier champ que le moteur
alimente.

### 5.2 `LearningStep`

Une étape est **dérivée du corpus**, jamais inventée : `deriveActivities(html)`
produit déjà les activités d'une journée avec leur `data-family`
(`practice | apply | verify | prepare`). Une étape est l'état de travail attaché
à l'une d'elles.

```
step: { state: 'pending' | 'in_progress' | 'done', updatedAt: ISO | null }
```

Aucune étape n'est créée pour une activité que le corpus ne porte pas. Si une
journée n'a pas d'activité, elle n'a pas d'étape — et c'est un état valide, pas
un trou à combler.

### 5.3 `Submission`

**Ajoutée, jamais écrasée.** C'est la différence avec `answers[id]`, qui perd la
version précédente à chaque frappe.

```
submission: {
  id:          string,          // déterministe : `sub-<stepId>-<n>`
  stepId:      string,
  kind:        'text' | 'exercise' | 'assessment',
  content:     string,          // TEXTE. Jamais rendu en HTML brut.
  submittedAt: ISO,
  validation:  Validation | null,
}
```

`answers[id]` **reste** : c'est le brouillon vivant, sauvegardé en continu. Une
soumission est un acte explicite. Les deux ne se remplacent pas ; le brouillon
est ce qu'on écrit, la soumission est ce qu'on rend.

### 5.4 `Validation`

```
validation: {
  status:    'passed' | 'failed' | 'pending' | 'manual',
  kind:      'exercise-tests' | 'assessment-grade' | 'self',
  checkedAt: ISO,
  detail:    string,   // texte court, issu du verdict — jamais généré
  score:     { passed: number, total: number } | null,
}
```

Deux types **automatiques et déterministes**, tous deux déjà présents :

| `kind` | Source | Déterminisme |
|---|---|---|
| `exercise-tests` | `runExercise` → `attempt.allPassed` | tests réels en bac à sable |
| `assessment-grade` | `gradeAssessment` → `passedOverall` | fonction pure, testée |

Le troisième, `self`, est **`manual`, jamais `passed`**. Une réponse ouverte
n'est pas notée par le produit. Le brief l'exige (§15) : on ne transforme pas
une activité ouverte en QCM pour se donner une métrique.

> Un score reste un **indice**. Une preuve reste une **preuve**. Le moteur ne
> confond jamais les deux, et n'invente ni l'un ni l'autre.

### 5.5 `Evidence` et `DayCompletion`

Inchangés dans leur forme — ils fonctionnent. Le moteur les **émet** :

- une validation `passed` produit une preuve, via `addEvidence`, avec un `id`
  déterministe → **idempotente par construction** ;
- `COMPLETE` sur une session déjà `completed` **ne réécrit pas `completedAt`** et
  ne produit aucune nouvelle preuve.

## 6. La machine à états

```
                 START
   not_started ────────▶ active ◀────────── RESUME ─── paused
        │                  │  │                            ▲
        │                  │  └────────── PAUSE ───────────┘
        │              COMPLETE
        │                  ▼
        └──── ✗ ───▶  completed ──── REOPEN ────▶ active
```

**Transitions légales, et rien d'autre :**

| Depuis | Commande | Vers |
|---|---|---|
| `not_started` | `START` | `active` |
| `active` | `PAUSE` | `paused` |
| `paused` | `RESUME` | `active` |
| `active`, `paused` | `COMPLETE` | `completed` |
| `completed` | `REOPEN` | `active` (`reopenCount++`) |
| `completed` | `COMPLETE` | `completed` — **no-op idempotent** |

**Rejetées, avec un message et sans aucune écriture :**

- `not_started --COMPLETE-->` — exigence explicite du brief ;
- toute commande inconnue ;
- toute commande sur une journée hors `[1, 365]`.

**`completed → not_started` n'existe pas.** Ce n'est pas une transition
interdite : c'est une transition qu'aucune commande ne peut produire. On ne
peut pas ne pas avoir fait ce qu'on a fait.

### `status` devient une projection

`DayProgress.status` n'est plus jamais écrit par un client. Il est **recalculé
par le moteur** à chaque commande :

| `session.state` | `status` projeté |
|---|---|
| `not_started` | `not-started` |
| `active`, `paused` | `in-progress` |
| `completed` | `done`, ou `to-review` si `comprehension === 'review'` |

Il reste persisté, parce que `resume.mjs`, `skill-state.mjs` et six surfaces le
lisent. Mais il devient **dérivé** : une seule source de vérité, la session, et
une projection maintenue pour les lecteurs existants. C'est ce qui règle
l'anomalie A6 sans y penser — une réouverture repasse par la projection, donc
`completedAt` est traité par le moteur au lieu d'être oublié.

## 7. La frontière lecture / écriture

**Règle absolue, testée :**

- toute mutation passe par `applyCommand(progress, command, clock)` —
  **fonction pure**, dans `lib/learning-engine.mjs`, sans I/O ni horloge propre ;
- la route est un adaptateur mince : elle parse, valide, appelle, écrit ;
- **aucun `GET`, aucun render, aucun mount/unmount, aucun `pagehide` n'écrit.**

`applyCommand` renvoie :

```
{ ok: true,  progress: Progress, effects: Effect[] }
{ ok: false, error: string, code: string }        // progress INCHANGÉ
```

Sur `ok: false`, **l'appelant n'écrit rien**. Une transition invalide ne laisse
aucune trace sur le disque — c'est le test `INVALID_TRANSITION_DOES_NOT_MUTATE_PROGRESS`.

## 8. Persistance

### 8.1 Écriture atomique

`writeFileSync(FILE, …)` devient : écrire `progress.json.tmp` dans le même
répertoire, `fsync`, puis `rename` — atomique sur le même système de fichiers.
Une interruption laisse l'ancien fichier intact au lieu d'un JSON tronqué que
`readProgressV3` interprète aujourd'hui comme **une progression vide**.

### 8.2 Schéma et migration

**`LEARNING_SCHEMA` : 2 → 3.** C'est le modèle de *journée* qui change, pas
l'enveloppe multi-parcours ; `PROGRESS_SCHEMA` reste donc à **3**. Bumper
l'enveloppe aurait signalé un changement de forme qui n'a pas lieu, et aurait
invalidé les sauvegardes existantes pour rien — `parseBackupV3` refuse une
version supérieure à la sienne.

La migration est **déterministe** (aucune horloge, aucun aléa),
**idempotente** (`migrate(migrate(x)) === migrate(x)`) et **sans perte** (aucun
champ existant supprimé ou réécrit). Elle n'a pas besoin d'un marqueur de
version sur le disque : la session est **auto-descriptive** — absente, elle est
dérivée ; présente et valide, elle est conservée telle quelle. Elle dérive
depuis ce qui est déjà là :

| `status` lu | `session.state` dérivé | `startedAt` | `completedAt` |
|---|---|---|---|
| `not-started` | `not_started` | `null` | `null` |
| `in-progress` | `active` | `startedAt ?? updatedAt ?? null` | conservé tel quel |
| `done`, `to-review` | `completed` | idem | `completedAt ?? updatedAt ?? null` |

Un `progress.json` vide reste valide et produit une v4 vide. Le fichier réel du
propriétaire — 371 octets, `days: {}` — migre en un fichier v4 à `days: {}`.

### 8.3 Persistance injectable (brief §29)

`lib/progress-server.ts` expose le chemin du fichier via une variable
d'environnement `AICOS_PROGRESS_FILE`. Les tests mutatifs pointent vers une
fixture dans un répertoire temporaire.

**Aucun test ne touche `data/progress.json`.** Pas de sauvegarde-puis-restaure :
ce mécanisme masque la mutation au lieu de l'empêcher, et le brief le refuse
nommément. Un gate vérifie que le fichier réel est intact après la suite de
tests, par hachage.

## 9. Sécurité (brief §32)

- **Toute entrée persistée est validée côté serveur**, par `normalizeDay` et par
  le moteur — jamais par un cast TypeScript, qui n'existe pas à l'exécution.
- **Aucun HTML brut depuis une réponse utilisateur.** `content` est du texte,
  rendu comme du texte. `dangerouslySetInnerHTML` reste réservé au corpus.
- **Pas de path traversal** : `dayId` est un entier borné `[1, 365]` ;
  `stepId` et `sourceId` sont validés contre une allowlist dérivée du corpus,
  jamais concaténés dans un chemin.
- `__proto__`, `prototype`, `constructor` restent rejetés comme clés — la garde
  existe dans `learning.mjs`, elle sera enfin sur le chemin d'écriture.

## 10. Ce que V64 ne fait pas

- pas de sixième motif, pas de nouvelle palette, pas de refonte de navigation ;
- pas de gamification : ni XP, ni niveau, ni série, ni classement, ni confettis ;
- pas de donnée inventée : une métrique absente s'affiche vide ou
  « non renseigné », jamais estimée ;
- pas de migration vers une base de données ;
- aucune modification du contenu pédagogique.

## 11. Champs legacy : le sort des huit morts

Le CP0 a trouvé huit champs écrits et jamais relus. V64 tranche, sans troisième
option :

| Champ | Décision |
|---|---|
| `answers` | **alimenté** — devient le brouillon d'une soumission |
| `notes` | **alimenté** — remonte dans le read-model de session |
| `attempts` | **alimenté** — une soumission incrémente le compteur |
| `answer` (global) | **gelé legacy** — lu à la migration, plus jamais écrit |
| `selfScore` | **gelé legacy** — remplacé par `selfAssessment.level` |
| `checklist` | **gelé legacy** — remplacé par les étapes |
| `selfAssessment.criteria` | **gelé legacy** |
| `selfAssessment.comment` | **gelé legacy** |

« Gelé legacy » signifie : **conservé sans perte à la migration, lisible,
plus jamais écrit par une commande.** Rien n'est supprimé du fichier de
l'utilisateur.

## 12. Conséquences assumées

- Le patch libre disparaît de l'API : tout client qui postait un
  `Partial<DayProgress>` arbitraire doit passer par une commande nommée. Les
  sept composants clients sont à adapter — c'est le coût, et il est voulu.
- La session ajoute du poids à chaque journée travaillée. À 365 journées avec
  étapes et soumissions, `progress.json` reste dans les centaines de kilo-octets :
  acceptable pour un fichier local mono-utilisateur, et borné par les plafonds
  déjà en place dans `learning.mjs`.
- `status` persisté et dérivé est une redondance délibérée. Elle est justifiée
  par les six surfaces qui le lisent, et neutralisée par le fait qu'un seul
  code l'écrit.
