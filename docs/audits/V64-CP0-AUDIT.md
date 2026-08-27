# V64 · CP0 — Audit forensique du moteur d'apprentissage

> **LECTURE SEULE.** Aucun fichier produit n'a été modifié avant ce rapport.
> Tout ce qui suit est constaté dans le code, pas déduit de l'intention.

---

## A. Invariants d'entrée (gelés)

| Objet | Valeur |
|---|---|
| HEAD | `82e24ef400e74c47f3a36a79bdd3aa28cf598bdc` |
| Branche | `claude/ai-career-os-saas-phfg49` |
| Arbre de travail | propre — 0 fichier modifié, 0 non suivi |
| Corpus `curriculum/` | `176ecde82cfd156fec0aa146ae0aeae8e75481d3e4e76220f5e8922812b80cec` (951 fichiers) |
| Corpus `data/` (hors `progress.json`, hors `lab-workspaces/`) | `27c1e532036c4f086cdd917e2d606908c8b1a48ffd55d96c7b18ec2062432968` (546 fichiers) |
| `data/progress.json` | `73c1ee39a255c87972f4f42b36873b1081081d6f278bd767089c0cef1fc6e7a6` — 371 octets |
| Programme | **365 journées**, ordre md5 `20be438d43c38549fb8b1fda8680a1d9` |
| Routes de production | 49 `page.tsx` |

Ces cinq empreintes seront recomparées au CP15. Toute divergence sur les deux
corpus est un échec de sprint, pas une note de bas de page.

---

## B. Ce que `data/progress.json` porte réellement, aujourd'hui

Le fichier entier, 371 octets :

```json
{
  "schemaVersion": 3,
  "activeTrackId": "ai-engineer-foundations-v1",
  "tracks": {
    "ai-engineer-foundations-v1": {
      "version": "1",
      "enrolledAt": "2026-08-03T23:05:41.225Z",
      "lastOpenedAt": "2026-08-03T23:05:41.225Z",
      "startDate": null,
      "days": {},
      "skills": {},
      "weeklyReviews": {},
      "monthlyReviews": {}
    }
  }
}
```

**`days: {}`.** Zéro journée enregistrée. Le produit est à progression
strictement nulle — ce n'est pas un état de test, c'est l'état réel du
propriétaire. Toutes les surfaces de pilotage sont vides parce qu'il n'y a
littéralement rien à afficher, pas parce qu'elles sont cassées.

### Le schéma `DayProgress` champ par champ

Aucune journée n'existe sur disque ; le schéma ci-dessous est celui que le code
sait lire et écrire (`lib/types.ts` + `lib/learning.mjs::normalizeDay`).

| Champ | Génération | Producteur | Consommateur | Constat |
|---|---|---|---|---|
| `status` | V5 | `StartDayButton`, `DayPanel`, `DayCorrection`, `ReviewList` | `resume.mjs`, `skill-state.mjs`, toutes les surfaces | **Le seul champ qui pilote réellement la progression.** |
| `updatedAt` | V5 | API (écrasé à chaque POST) | `skillStats.lastActivityAt` | Écrit même quand le patch ne change rien. |
| `answer` | V5 | `DayPanel` (journées sans activités) | **aucun** | Écrit, jamais relu par un read-model. |
| `notes` | V5 | `DayPanel` | **aucun** | Idem. |
| `selfScore` | V5 | `DayPanel` (0-5) | **aucun** | Idem. Score déclaré, sans effet. |
| `checklist` | V5 | `DayPanel` | **aucun** | Idem. |
| `startedAt` | V6 | **personne** | **aucun** | **Le champ existe et n'est écrit par aucun chemin de code.** |
| `completedAt` | V6 | `DayPanel.closeDay` | **aucun** | Écrit à la clôture, jamais effacé à la réouverture. |
| `answers` | V6 | `DayPanel` (par activité) | `daySummary` (client seulement) | Aucun effet sur la progression. |
| `selfAssessment` | V6 | `DayPanel` (confiance) | `updateReviewSchedule` | Seul `confidence` est réellement alimenté ; `level`, `criteria`, `comment` sont morts. |
| `comprehension` | V6 | `DayCorrection` | `updateReviewSchedule` | Vivant. |
| `attempts` | V6 | `DayCorrection` (`outcome:'attempted'`) | **aucun** | Compté, jamais lu. |
| `correctionState` | V6 | `DayCorrection` | `DayPanel` (affichage), `daySummary` | Vivant, mais purement local à la journée. |
| `review` | V6 | `DayPanel.closeDay`, `DayCorrection`, `ReviewList` | `review.mjs` → `/revisions` | **Vivant et correct.** |
| `evidence[]` | V6 | `DayEvidence`, `lab-progress` | `skill-state.mjs` → `/skills` | **Vivant. Seul chemin vers « démontrée ».** |
| `missions` | V18 | `/api/missions/[id]` | `mission-state.mjs` | Vit dans le track, **absent de `types.ts::Progress`**. |

### Verdict de schéma

**Trois générations coexistent sans arbitrage** : V5 (`answer`, `selfScore`,
`checklist`), V6 (`answers`, `selfAssessment`, `attempts`, `evidence`), V18
(`missions`). Sur 16 champs de `DayProgress`, **8 sont écrits sans jamais être
relus** par un read-model. Ce n'est pas de la dette cosmétique : c'est un
moteur qui enregistre du travail et qui n'en fait rien.

---

## C. Les surfaces d'écriture

**Six routes serveur écrivent la progression :**

| Route | Ce qu'elle écrit | Validation |
|---|---|---|
| `POST /api/progress` | tout `DayProgress`, `skills`, `startDate`, revues | **fusion aveugle** (voir §D) |
| `POST /api/lab/[exerciseId]` (`run`) | preuve + compétences après tests verts | via `recordExerciseSuccess`, borné |
| `POST /api/missions/[id]` | `track.missions` | via `normalizeMissionsMap` |
| `POST /api/progress/import` | remplacement complet | validé + prévisualisé + snapshot |
| `POST /api/progress/reset` | remise à zéro | snapshot préalable |
| `POST /api/track` | inscription / activation de parcours | via `enrollTrack` |

**Sept composants client postent :** `StartDayButton`, `DayPanel`,
`DayCorrection`, `DayEvidence`, `ReviewList`, `SkillsBoard`, `SettingsPanel`.

---

## D. Le défaut central : `POST /api/progress` n'a pas de moteur

```ts
const patch = (body.payload.patch ?? {}) as Partial<DayProgress>;
const existing: DayProgress = progress.days[String(day)] ?? { ...EMPTY_DAY_PROGRESS };
progress.days[String(day)] = { ...existing, ...patch, updatedAt: now };
```

Quatre lignes. Ce qu'elles n'ont pas :

1. **Aucune validation du patch.** Le cast `as Partial<DayProgress>` est une
   assertion TypeScript, effacée à l'exécution. N'importe quel corps JSON passe.
   `lib/learning.mjs` fournit `normalizeDay` — bornage, allowlist de statuts,
   `safeUrl`, protection `__proto__` — et **la route ne l'appelle pas**. Le
   garde-fou existe et n'est pas branché sur la seule porte d'entrée.
2. **Aucune machine à états.** `{ status: 'done' }` sur une journée
   `not-started` réussit. `nextStatusFor` (`lib/resume.mjs`) décrit les
   transitions légales, mais il tourne **côté client**, dans `DayPanel` ; le
   serveur ne le consulte jamais. Une transition interdite n'est interdite que
   par l'interface.
3. **Aucune idempotence.** Re-cliquer « Terminer » réécrit `completedAt` et
   `updatedAt` avec un nouvel horodatage. La complétion n'est pas un fait, c'est
   un dernier clic.
4. **Aucune écriture atomique.** `writeFileSync(FILE, …)` sans fichier
   temporaire ni `rename`. Une interruption au milieu de l'écriture laisse un
   JSON tronqué ; `readProgressV3` l'attrape en `catch` et renvoie **une
   progression vide** — c'est-à-dire qu'une écriture interrompue se présente
   comme une perte totale silencieuse.

### La fusion aveugle produit des états incohérents, démontrés

- **Réouverture :** `closeDay` écrit `{ status:'done', completedAt: now }` ;
  `setStatusAction('reopen')` écrit `{ status:'in-progress' }` **sans effacer
  `completedAt`**. Une journée « en cours » conserve une date de complétion.
- **`startedAt` :** le champ est déclaré dans `types.ts`, normalisé par
  `learning.mjs`, et **écrit par zéro chemin de code**. Il vaudra toujours
  `null`. Une session n'a donc pas d'heure de début.

---

## E. Matrice des actions de l'apprenant

Colonne « Persiste ? » = survit à un rechargement. Colonne « Impact
progression ? » = modifie ce qu'une surface de pilotage affiche.

| Action learner | Existe ? | Persiste ? | Source de vérité | Preuve créée ? | Impact progression ? |
|---|---|---|---|---|---|
| Commencer la journée (dashboard) | oui | oui | `days[d].status` | non | oui — statut |
| Commencer la journée (`/day`) | oui | oui | `days[d].status` | non | oui — statut |
| Rédiger une réponse par activité | oui | oui | `days[d].answers[id]` | non | **non** |
| Rédiger une réponse globale (legacy) | oui | oui | `days[d].answer` | non | **non** |
| Écrire des notes | oui | oui | `days[d].notes` | non | **non** |
| Auto-évaluation 0-5 | oui | oui | `days[d].selfScore` | non | **non** |
| Cocher la checklist | oui | oui | `days[d].checklist` | non | **non** |
| Déclarer sa confiance | oui | oui | `selfAssessment.confidence` | non | indirect — via révision |
| « J'ai vraiment tenté » | oui | oui | `correctionState`, `attempts` | non | non |
| Compris / Partiel / À revoir | oui | oui | `comprehension`, `review` | non | **oui** — révision + `to-review` |
| Terminer la journée | oui | oui | `status`, `completedAt` | non | **oui** — compétences, reprise |
| Terminer et revoir plus tard | oui | oui | `status`, `review` | non | **oui** |
| Rouvrir une journée | oui | oui | `status` | non | oui — *laisse `completedAt`* |
| Ajouter une preuve | oui | oui | `days[d].evidence[]` | **oui** | **oui** — « démontrée » |
| Supprimer une preuve | oui | oui | `days[d].evidence[]` | — | oui |
| **Lancer les tests d'un exercice** | oui | oui | `evidence[]` + `skills{}` | **oui, automatique** | **oui** |
| Livrer une mission | oui | oui | `track.missions[id]` | non | oui — surface missions |
| Auto-noter une compétence | oui | oui | `progress.skills[id]` | non | oui — *score déclaré* |
| Replanifier une révision | oui | oui | `days[d].review` | non | oui |
| Répondre à un diagnostic | oui | **NON** | `useState` | **non** | **non** |
| Exporter / importer / réinitialiser | oui | oui | fichier entier | — | oui |

### Ce qui n'existe pas du tout

- **Aucune notion de session.** Pas de `active|paused|completed`, pas d'heure de
  début (`startedAt` mort), pas de reprise d'un état — `/` déduit la journée à
  reprendre en balayant les statuts (`resolveResume`).
- **Aucune soumission versionnée.** Une réponse écrase la précédente. Il n'y a
  ni historique, ni horodatage par réponse, ni « ce que j'avais rendu ».
- **Aucune validation d'une réponse ouverte.** Le texte est stocké et jamais
  regardé par quoi que ce soit.
- **`/diagnostics` est entièrement volatil.** `responses` et `result` vivent
  dans `useState` ; aucun `fetch` d'écriture dans le fichier. Un rechargement
  efface le diagnostic. Le §2.6 du brief V64 — « le résultat d'un diagnostic
  devient une preuve » — part donc de zéro, pas d'un existant à relier.

---

## F. La bonne surprise : une boucle complète existe déjà — ailleurs

`POST /api/lab/[exerciseId]` avec `action:'run'` exécute réellement une chaîne
**SOUMISSION → VALIDATION → PREUVE → PROGRESSION** :

1. les fichiers de l'apprenant sont écrits dans son workspace ;
2. `runExercise` les exécute en bac à sable, avec allowlist et délai maximum ;
3. `attempt.allPassed` est un verdict **déterministe et local** — des tests, pas
   une note ;
4. si vert, `recordExerciseSuccess` ajoute une preuve `lab-<id>` **idempotente**
   (dédoublonnée par URL) à **chaque journée liée**, et relève les compétences
   associées au plancher `practiced = 3` sans jamais rétrograder.

Couverture mesurée : **247 journées sur 365 portent au moins un exercice**
(400 liens, 376 exercices au catalogue).

**C'est le modèle que le reste du produit n'a pas.** La validation déterministe
exigée au CP9 du brief n'est pas à inventer : elle est à **rattacher**. Ce qui
manque, c'est qu'elle vit dans `/lab`, hors de toute session de journée : on
peut réussir un exercice sans que la journée sache qu'on a travaillé.

---

## G. Anomalies retenues, classées

| # | Anomalie | Gravité |
|---|---|---|
| A1 | `POST /api/progress` n'applique aucune validation serveur ; `normalizeDay` existe et n'est pas branché | **P0 — sécurité + intégrité** |
| A2 | Aucune machine à états serveur ; `not-started → done` réussit | **P0** |
| A3 | Écriture non atomique ; une interruption se lit comme une progression vide | **P0** |
| A4 | 8 champs sur 16 sont écrits et jamais relus | **P1** |
| A5 | `startedAt` déclaré, normalisé, écrit par personne | **P1** |
| A6 | `reopen` n'efface pas `completedAt` | **P1** |
| A7 | Complétion non idempotente (`completedAt` réécrit à chaque clic) | **P1** |
| A8 | Deux représentations de la compétence : `skills{}` déclaré vs `skillState` dérivé | **P1** |
| A9 | `/diagnostics` ne persiste rien | **P1** |
| A10 | `StartDayButton` ne teste pas `res.ok` : un échec est un clic sans effet visible | **P1 — §22** |
| A11 | `track.missions` absent de `types.ts::Progress` | **P2** |
| A12 | `attempts` compté, jamais lu | **P2** |

Les invariants tenus, eux, le sont réellement : `readProgressV3` est mémoïsé
**par requête** (React `cache`) et les mutations relisent le disque frais
(`readProgressV3Fresh`) — pas d'instantané périmé ; `DayPanel` porte une double
garde (`dirty` au montage, `edited` avant `pagehide`) qui empêche une simple
consultation d'écrire ; `scripts/v54-progress-integrity.mjs` prouve
`VISIT_DAY_DOES_NOT_MUTATE_PROGRESS` par hachage **sans restauration**.

---

## H. Réponse à la question §34, AVANT le sprint

> *« Un apprenant peut-il, aujourd'hui, faire une journée de bout en bout et en
> garder une trace exploitable ? »*

**PARTIELLEMENT.**

Ce qu'il peut faire, réellement et de façon persistée : ouvrir une journée,
la marquer commencée, rédiger une réponse par activité, prendre des notes,
demander la correction après avoir déclaré une tentative, déclarer sa
compréhension, faire planifier une révision, ajouter une preuve à la main,
clôturer la journée. Et — s'il passe par `/lab` — faire valider du code par des
tests réels et en obtenir une preuve automatique.

Ce qu'il ne peut pas : **avoir une session**. Il n'y a pas d'heure de début, pas
d'état « en cours » distinct d'un simple libellé de statut, pas d'historique de
ce qu'il a rendu, pas de reprise depuis un état — seulement une déduction par
balayage. Son travail écrit est conservé mais **inerte** : les réponses, les
notes, l'auto-évaluation et la checklist n'atteignent aucun read-model. Une
journée terminée compte pour un `+1`, quel que soit ce qui a été produit
dedans.

Formulé autrement : **le produit garde une trace, mais pas une trace
exploitable.** La journée a un statut ; elle n'a pas d'état de travail.

---

## I. Ce que CP1 doit trancher

1. **Une porte d'entrée unique et validée** pour toute mutation — la route
   actuelle doit cesser d'accepter un patch arbitraire.
2. **La machine à états côté serveur**, avec `nextStatusFor` comme point de
   départ mais promue en règle opposable, pas en confort d'interface.
3. **La session** (`not_started | active | paused | completed`) et son heure de
   début — c'est l'objet qui manque, et `startedAt` l'attend déjà.
4. **La soumission** comme objet de première classe, distinct d'un champ texte
   écrasé.
5. **Le rattachement de la validation `/lab` à la session de journée** — pas une
   réécriture : un branchement.
6. **Le sort des 8 champs morts** : alimentés, ou explicitement déclarés legacy
   et gelés. Pas de troisième option.
7. **Une persistence injectable** pour les tests mutatifs (§29), afin qu'aucun
   test ne touche `data/progress.json`.

---

**Fin du CP0. Aucun fichier produit modifié. Enchaînement automatique sur CP1.**
