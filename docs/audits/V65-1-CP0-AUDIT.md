# V65.1 · CP0 — Baseline forensique

> Lecture seule. Aucun fichier produit modifié. Tout chiffre ci-dessous a été
> **re-mesuré** ; rien n'est hérité du rapport V65 (§0 du brief : « Aucune
> affirmation héritée n'est une preuve »).

---

## 1. État du dépôt

| | |
|---|---|
| HEAD | `2237f2dd3e824fc455af40ccde3e422807fc6944` |
| Branche | `claude/ai-career-os-saas-phfg49`, alignée sur `origin` |
| Arbre de travail | 0 fichier modifié, 0 remisage |
| Serveurs résiduels | 0 |
| Routes `page.tsx` | **50** |

## 2. Invariants — mesure directe

| Invariant | Mesure | Verdict |
|---|---|---|
| `curriculum/` | sha256 `a2099b51db9d75a6db74f5547c5a60681ff69bac9f7be14fdf3c4684ae7a2edf` — 951 fichiers | intact |
| `data/` hors progression | sha256 `4d3e5e9cc82e030ba0ff8531a764828f90803311b1ac6e62a5573c594bb0b591` — 546 fichiers | intact |
| `data/progress.json` | sha256 `73c1ee39a255c87972f4f42b36873b1081081d6f278bd767089c0cef1fc6e7a6` | intact |
| `git diff 2237f2d -- curriculum data` | **vide** | Curriculum 1.0 gelé |

> **Note d'honnêteté.** Les empreintes `curriculum/` et `data/` ci-dessus ne
> sont pas celles écrites dans `V65-FINAL-REPORT.md` (`176ecde8…`,
> `27c1e532…`). Le contenu, lui, est **identique à l'octet près** — `git diff`
> contre `2237f2d` est vide et `git status` ne rapporte rien. L'écart vient de
> la méthode de hachage, pas des fichiers. Méthode retenue ici, à réutiliser
> jusqu'à la fin du sprint :
> `find <dir> -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum`.

## 3. Baseline de vérification — RE-MESURÉE

| Contrôle | V65 annonçait | Mesuré au CP0 | |
|---|---|---|---|
| `npm test` | 1 368 / 1 368 | **1 368 / 1 368**, 0 échec (57,1 s) | ✅ conforme |
| `tsc --noEmit` | 0 erreur | **0 erreur** | ✅ conforme |
| `npm run build` | compilé | **compilé** | ✅ conforme |
| `npm run gates:active` | « 43 gates » | **ÉCHEC — `v64:check` rouge** | ❌ **non conforme** |

### 3.1 P0-0 — V65 a été certifié avec un gate rouge

```
❌ v64:check : 2 régression(s)
  • [clients] les 6 écrivains passent par sendCommand — app/skills/SkillsBoard.tsx
  • [erreurs] tout écrivain affiche son échec — app/skills/SkillsBoard.tsx
```

Sur un arbre propre, à `2237f2d`, `gates:active` **ne passe pas**. Le rapport
final de V65 affiche pourtant `gates:active : 43 gates` dans son encadré de
clôture. La chaîne complète n'a donc pas été rejouée avant le verdict, ou son
échec n'a pas été lu.

**Cause exacte.** V65 a recomposé `SkillsBoard.tsx` en surface de **lecture
seule** : le composant n'écrit plus rien. Le gate `v64:check` conserve une
**liste d'écrivains codée en dur** (`scripts/v64-check.mjs:110-149`) qui le
contient encore, et exige de lui `sendCommand` + affichage d'erreur — deux
choses qu'un composant sans écriture n'a aucune raison d'avoir.

Le produit est correct ; **le gate est périmé**. Mais le résultat net est le
même que celui que ces gates existent pour empêcher : une clôture prononcée
sur une mesure qui n'a pas été faite. C'est la cinquième fois consécutive
qu'un trou de gate est trouvé après coup — la correction (CP2/CP14) sera de
**dériver** la liste des écrivains du code plutôt que de l'énumérer.

## 4. Fixture de mesure — produite par le produit

Aucun `progress.json` écrit à la main. Chaque fait est passé par l'API de
commandes réelle (`POST /api/progress`) et par la route des diagnostics
(`POST /api/assessments/[id]`), sur un serveur lancé avec
`AICOS_PROGRESS_FILE` — donc via le moteur, ses validations et sa persistance
atomique. **57 commandes acceptées, 0 refusée.**

Contenu obtenu :

| | |
|---|---|
| Journées | 12 terminées (J1→J12), J13 en cours, J39 tentée en avance |
| Preuves au ledger | **30** — 14 `exercise` + 12 `review` + 2 `assessment` + 1 `submission` + 1 `exercise` échoué |
| Preuves **qualifiantes** | **14** (enregistrements distincts) |
| Compétences touchées | 8 sur 20 |
| Niveaux déclarés | `rag: 2`, `llm: 1` — auto-évaluation, **jamais une preuve** |
| Diagnostics passés | 1 réussi (5/5), 1 échoué (2/5) |
| Révisions | 4 en retard, 8 sous 30 jours |

**Décalage temporel assumé.** `createdAt` est posé par le serveur (invariant).
Sans cela, toutes les preuves portent la même date et l'état **Consolidée**
(≥ 2 preuves qualifiantes, de sources **et** de jours distincts) reste
inatteignable — donc jamais vu à l'œil. La leçon de V65 est exactement
celle-là : `.rev-track` a porté un défaut d'accessibilité pendant huit sprints
parce qu'aucune fixture n'avait jamais rempli l'échéancier. On ne fabrique
donc **aucun fait** : chaque preuve a été produite par le moteur ; seule
l'**horloge** de la journée N est déplacée vers son passé plausible, puis le
résultat est renormalisé par le code produit (`normalizeLedger`). 30 preuves
réparties sur 13 dates UTC.

## 5. Cartographie des deux modèles de compétence

### 5.1 Qui lit quoi

| Surface | Modèle lu | Vocabulaire |
|---|---|---|
| `/skills` + `SkillsBoard` | **canonique** — `getCompetencySummary()` → `projectCompetencies` | `unassessed / practiced / demonstrated / reinforced` |
| `/history` | **canonique** — `getLearningHistory()` → ledger | idem |
| `/` (Dashboard) | **ancien** — `nextBestActions()` de `learning-experience.mjs` (`app/page.tsx:11,56`) | `not-started / discovered / practiced / demonstrated / to-consolidate` |
| `/synthese` | **ancien** — `evidenceTimeline()`, `milestones()` (`app/synthese/page.tsx:7,36,37`) | idem |
| `/revisions` | canonique pour l'écriture (produit une preuve `review`), ancien pour rien | — |
| `/diagnostics` | **aucun** — catalogue pur, aveugle à l'apprenant | — |

`lib/learning-experience.mjs:10` importe `skillStats, SKILL_STATES,
SKILL_STATE_LABEL` de `./skill-state.mjs` : c'est là que l'ancien modèle
survit, et c'est ce que `/` et `/synthese` affichent.

### 5.2 Divergence mesurée sur la fixture

**20 compétences sur 20 divergent. 8 divergent sémantiquement** — les deux
surfaces ne disent pas la même chose sur le fond, pas seulement avec d'autres
mots.

| Compétence | `/` et `/synthese` | `/skills` et `/history` | preuves qualifiantes |
|---|---|---|---|
| `ds` Structures de données | **Non abordée** | **Consolidée** | 4 |
| `se` Software engineering | **Non abordée** | **Consolidée** | 2 |
| `sql` SQL / Data | **Non abordée** | **Démontrée** | 1 |
| `archi` Architecture | **Non abordée** | **Démontrée** | 1 |
| `jsts` JavaScript / TypeScript | Pratiquée | **Consolidée** | 8 |
| `gitlinux` Git / Linux | Pratiquée | **Consolidée** | 3 |
| `algo` Algorithmie | Démontrée | **Consolidée** | 9 |
| `patterns` Design patterns | Découverte | Pratiquée | 0 |
| 12 autres | Non abordée | Non évaluée | 0 |

Quatre compétences réellement démontrées sont annoncées **« Non abordée »** à
l'apprenant sur son tableau de bord. C'est la dette P0 de V65, chiffrée.

### 5.3 Ce que ça donne à l'écran

Vu sur `docs/design/v651/before/dashboard-1440.png` :

- panneau **« COMPÉTENCES & PREUVES »** : **2 pastilles** (Algorithmie,
  JavaScript / TypeScript). `/skills` en compte **8** évaluées ;
- **« DERNIÈRE PREUVE : Jour 12 — Comptage de fréquences avec Map »** alors
  que la dernière preuve du ledger date d'aujourd'hui (diagnostic + tentative
  J39) ;
- **« Démontrer JavaScript / TypeScript via un diagnostic ou un capstone —
  pratiquée mais jamais démontrée par une preuve »**, proposé comme prochaine
  action, pour une compétence portant **8 preuves qualifiantes** et affichée
  **Consolidée** deux clics plus loin. Le produit demande à l'apprenant de
  démontrer ce qu'il a déjà démontré huit fois ;
- la même ligne affiche **`practiced → demonstrated`** : deux identifiants
  d'état anglais, bruts, dans une interface française.

Vu sur `synthese-1440.png` :

- colonne **« COMPÉT. » = 2** pour le parcours actif ;
- jalon **« Transfert multi-domaines · atteint · preuves couvrant 12
  compétences »** — le ledger en compte **8**. Le 12 vient du comptage des
  **étiquettes fines** (`javascript`, `linux`, `hashmap`…), pas des
  compétences du programme ;
- jalon **« Première compétence démontrée · Algorithmie atteint l'état
  Démontrée · 27 août 2026 »** — `/skills` dit *Consolidée*, et la première
  démonstration date du 16 août ;
- **« D'où vient ta progression » — 14 preuves récentes**, étiquetées
  `javascript · algo`, `linux · arrays`, `hashmap · data` : le **vocabulaire
  fin**, quand `/skills` et `/history` parlent `jsts`, `gitlinux`, `ds`. Deux
  langues pour la même chose sur deux pages voisines. La liste ignore par
  ailleurs les 12 preuves de révision, les 2 diagnostics et la soumission en
  cours : ce n'est pas le ledger.

## 6. Autres défauts trouvés à l'œil sur les captures

### P0-1 — `/skills` publie un nombre inventé

En-tête : **« 28 preuves qualifiantes sur 30 enregistrées »**.

Le ledger contient **14** preuves qualifiantes. 28 est la **somme des crédits
par compétence** (`getCompetencySummary` fait
`competencies.reduce((n, c) => n + c.qualifyingEvidenceCount, 0)`,
`lib/learner-read-models.ts:67`) : 13 des 14 preuves créditent plusieurs
compétences et sont donc comptées plusieurs fois. Ce total est ensuite
présenté **dans la même phrase** qu'un vrai décompte d'enregistrements
(« sur 30 »), ce qui le fait lire comme un décompte d'enregistrements.

Invariants 6 (« aucun nombre inventé ») et 22 violés, **sur la surface que
V65 a certifiée**.

### P0-2 — `/diagnostics` ignore ce que l'apprenant y a fait

La fixture contient deux diagnostics passés, l'un réussi 5/5, l'autre échoué
2/5, tous deux enregistrés au ledger et visibles dans `/history`. La page
`/diagnostics` est **strictement identique** à ce qu'elle affiche pour un
apprenant qui n'en a passé aucun : pas de date, pas de score, pas de
« déjà passé », pas de « à repasser ». Le catalogue ne sait rien de son
lecteur.

### P1-1 — pas de surface de détail par compétence

`/skills` propose « Voir les preuves », qui déplie un bloc dans la liste. Il
n'existe **aucune route** `/skills/[id]` : ni identité, ni historique propre,
ni provenance, ni « prochaine action réelle » pour une compétence donnée.
C'est l'objet du CP8.

### P1-2 — l'échéancier de `/revisions` superpose ses étiquettes

`revisions-1440.png`, bloc « Échéancier » : deux marqueurs proches rendent
leurs libellés l'un sur l'autre — on lit **`J1J12`**. Défaut de lisibilité,
invisible tant que l'échéancier était vide (même angle mort que le
`role="img"` de V57).

### P1-3 — `/history` n'offre aucun filtre

84 événements, un seul mur chronologique. Aucun filtre par type d'événement,
par compétence ou par journée, aucun repli par date. Le CP6 demande des
« filtres / regroupements utiles ».

### Artefact de fixture, pas défaut produit

Tous les événements de `/history` affichent `09:03` : le décalage temporel
déplace les dates et conserve l'heure. À ne pas rediagnostiquer comme un bug
d'horodatage.

## 7. Responsive et accessibilité — état d'entrée

35 captures, 7 surfaces × 5 largeurs (375 / 768 / 1024 / 1440 / 1920),
`docs/design/v651/before/` : **0 débordement horizontal**, 35 réponses 200.
`/skills` à 375 tient et reste honnête (12 lignes « aucune trace
enregistrée », aucun zéro aligné — le correctif V65 tient sous données
réelles).

## 8. Dette réelle à l'entrée de V65.1

| | Sujet | Où |
|---|---|---|
| **P0-0** | `gates:active` rouge à HEAD ; liste d'écrivains codée en dur | `scripts/v64-check.mjs` |
| **P0-1** | Dashboard et Synthèse sur l'ancien modèle — 20/20 divergences, 8 sémantiques | `app/page.tsx`, `app/synthese/page.tsx`, `lib/learning-experience.mjs` |
| **P0-2** | « 28 preuves qualifiantes sur 30 » — nombre inventé | `lib/learner-read-models.ts:67`, `app/skills/page.tsx` |
| **P0-3** | Deux vocabulaires de compétence (fin vs programme) affichés côte à côte | `/synthese` vs `/skills` |
| **P0-4** | `/diagnostics` aveugle à l'historique de l'apprenant | `app/diagnostics/` |
| **P1-1** | Aucune surface de détail par compétence | route absente |
| **P1-2** | Étiquettes superposées dans l'échéancier | `/revisions` |
| **P1-3** | `/history` sans filtre ni regroupement | `app/history/` |
| **P2-1** | Identifiants d'état anglais visibles (`practiced → demonstrated`) | Dashboard |

## 9. Taxonomie — mesure d'entrée

- 376 / 376 exercices projetables, **0 UNMAPPED**, 0 étiquette non résolue ;
- 136 exercices alimentent plus d'une compétence ;
- **17 / 20** compétences alimentées par au moins un exercice ;
- **3 jamais alimentées par un exercice** : `cloud`, `comm`, `autonomy` ;
- 16 diagnostics couvrant 14 compétences.

`cloud`, `comm` et `autonomy` sont donc, pour l'instant, structurellement
inatteignables par la voie des exercices. Le CP3 devra dire si c'est un trou
de mapping ou un trou de corpus — et si c'est le corpus, le laisser vide
plutôt que l'inventer (invariant 7).
