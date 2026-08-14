# TSD-041 — API du read-model, gate v41 & Visual Language Contract léger

Document technique. Complète ADR-041 / HSD-041. Fige l'API du read-model, le contrat du gate et un
Visual Language Contract minimal (léger, réutilisant l'existant).

## 1. API `lib/learning-experience.mjs` (PUR)
```
// Toutes les fonctions sont pures, sans I/O, horloge injectée. Elles DÉRIVENT ; aucune vérité propre.

explainSkillState(stat) -> {
  id, name, state, label,               // état + libellé EXISTANTS (SKILL_STATES / SKILL_STATE_LABEL)
  reasons: string[],                    // ex. "3 journées terminées", "1 preuve enregistrée", "révision en attente"
  toConsolidate: boolean,
  nextAction: { action, reason, goal, expectedEvidence, href } | null
}
// stat = un élément de skillStats(program, progress).

NEXT_ACTION_PRIORITIES  // tableau ordonné et documenté des signaux (voir ADR-041 D3)

nextBestActions(program, progress, ctx?) -> Array<{
  kind,                                 // 'remediation' | 'review' | 'consolidate' | 'demonstrate' | 'practice' | 'resume'
  action: string,                       // libellé de l'action
  reason: string,                       // POURQUOI (dérivé)
  goal: string,                         // objectif pédagogique (ex. "practiced → demonstrated")
  expectedEvidence: string,             // preuve attendue
  href: string                          // lien actionnable (page existante)
}>
// ctx (optionnel) : { reviews, capstoneResults, now } — sinon dérivé de progress.

evidenceTimeline(progress, program?) -> Array<{
  createdAt, type, title, skills: string[], day: number|null
}>  // tri décroissant par date ; agrège les evidence des jours ; AUCUNE écriture.

MILESTONE_DEFS  // définitions déterministes, chacune avec un prédicat sur des faits de progression

milestones(program, progress, ctx?) -> Array<{
  id, label, description, achieved: boolean, achievedAt: string|null, why: string
}>  // uniquement des jalons reliés à une preuve réelle ; pas d'XP, pas de score.
```

### Invariants
- Les états renvoyés ∈ `SKILL_STATES` (aucune valeur nouvelle).
- Chaque `nextBestActions[i]` a un `reason` ET un `expectedEvidence` non vides.
- Chaque milestone `achieved:true` a un `achievedAt` et un `why` dérivés d'une evidence/fait réel.
- Aucune fonction n'invente de nombre de progression (pas de %, pas d'XP) hors de ce que les moteurs
  produisent déjà (le % de parcours vient de `position.mjs`, pas d'ici).

## 2. Gate `scripts/v41-check.mjs`
Échoue (exit 1) si :
1. Présence sur disque d'une source concurrente interdite : `data/xp.json`, `data/achievements.json`,
   `data/gamification*.json`, `data/**/mastery-v2*`, `lib/progression-v2*`, `lib/mastery-engine-v2*`.
2. Grep de marqueurs d'XP/gamification arbitraire dans `lib/learning-experience.mjs` et les pages touchées
   (`\bXP\b`, `points gagnés`, `niveau \d+`, `badge`, `streak`) — hors chaînes explicitement négatives de
   documentation.
3. `nextBestActions` (sur un échantillon dérivé de `progress.example.json` ou d'un stub) renvoie une entrée
   sans `reason` ou sans `expectedEvidence`.
4. `explainSkillState` renvoie un `state` hors `SKILL_STATES`.
5. Un milestone `achieved:true` sans `why`.
Le gate importe le module et exécute ces vérifications sur des données déterministes. Câblé dans
`gates:active`.

## 3. Tests (CP2)
`tests/v41-learning-experience.test.mjs` :
- explainSkillState : raisons cohérentes selon l'état (not-started → aucune raison de progression ;
  demonstrated → mentionne une preuve ; to-consolidate → mentionne la révision).
- nextBestActions : ordre de priorité respecté (remédiation avant révision avant consolidation…), chaque
  action porte raison + preuve attendue ; déterministe.
- evidenceTimeline : agrège et trie ; ne duplique pas ; vide si aucune preuve.
- milestones : « première compétence démontrée » n'apparaît que s'il existe une preuve ; jamais d'XP.
- garde-fou : aucune sortie ne contient de champ `xp`/`points`/`level`.

## 4. Visual Language Contract (léger — réutilise l'existant)
On NE crée PAS 80 tokens. On documente et on réutilise les primitives de `app/globals.css` déjà en place :
- **Typographie** : `--fs-eyebrow/-h1/-h2/-h3/-base/-sm/-xs` ; hiérarchie page-eyebrow → page-title →
  section-title.
- **Espacement** : échelle `--sp-1..12`. **Rayons** : `--r-sm/--r`. **Bordures** : `--border/--border-strong`.
- **Couleurs sémantiques** : `--ok` (démontré/succès), `--warn` (à consolider/échéance), `--danger` (erreur),
  `--accent` (action) — **jamais la couleur seule** : toujours doublée d'un libellé/icône.
- **États d'apprentissage** : mapper les 5 `SKILL_STATES` sur des puces libellées (pas seulement colorées) :
  Non abordée · Découverte · Pratiquée · Démontrée · À consolider.
- **Interaction** : focus visible hérité ; cibles ≥ 32px ; `prefers-reduced-motion` respecté (pas
  d'animation gratuite ajoutée).
- **Patterns** : réutiliser `.section-head`, `.empty`, `.btn`, listes existantes ; **pas** de nouvelle
  grille de cards clonées. Nouveaux patterns sobres : liste « next-action » (ligne = action + raison), puce
  d'état, ligne de timeline (date · type · titre).

## 5. Sûreté
`progress.json` jamais écrit ; baseline restaurée au dernier CP. Bornes de lecture (tailles, nombres
d'items). Aucune dépendance réseau.
