# ADR-041 — Learning Experience, progression fondée sur preuves & gamification saine

Statut : accepté (Sprint V41). Décision fondée sur l'audit CP0 réel. **Priorité : pédagogie > compréhension
de sa progression > cohérence parcours > visibilité des preuves > next best action > UX > esthétique >
gamification.** Local, mono-utilisateur, **une seule source de vérité**, sans XP arbitraire ni fausse « IA ».

## Problème (établi au CP0)
Le contenu et les moteurs sont riches (skill-state, review, evidence, assessment, capstone, graph). Mais
l'apprenant ne peut pas répondre facilement à : *où j'en suis, ce que j'ai démontré vs seulement vu,
pourquoi cet état, quoi faire ensuite, où sont mes preuves.* Les données existent ; **rien ne les compose
en réponses actionnables et explicables.**

## Décisions

### D1 — Un seul module PUR, dérivé : `lib/learning-experience.mjs`
Read-model **sans vérité propre**. Il compose les sorties EXISTANTES (`skillStats`, evidence des jours,
`getDueReviews`, capstones, graphe) en quatre dérivations : `explainSkillState`, `nextBestActions`,
`evidenceTimeline`, `milestones`. **Interdits absolus** : `xp.json`, `achievements.json`,
`gamification-state.json`, `progression-v2`, `mastery-engine-v2`, second store de progression, seconde
taxonomie d'états. Les états restent ceux de `SKILL_STATES` (`not-started/discovered/practiced/
demonstrated/to-consolidate`).

### D2 — « Pourquoi cet état ? » (explicabilité)
`explainSkillState(stat)` transforme les signaux bruts de `skillStats` (jours terminés, nombre de preuves,
présence d'une révision) en **raisons textuelles dérivées**, plus l'état et le libellé existants. Aucun
état opaque ; aucune règle d'état nouvelle (on explique la règle existante, on ne la change pas).

### D3 — Next Best Action déterministe et EXPLICABLE (pas une « IA »)
`nextBestActions(program, progress, ctx)` renvoie une liste priorisée d'actions, chacune portant
**action + raison + objectif pédagogique + preuve attendue + lien**. Ordre de priorité documenté :
1) remédiation issue d'un échec (capstone/diagnostic) ; 2) révision arrivée à échéance ; 3) compétence
`to-consolidate` ; 4) compétence `practiced` jamais `demonstrated` (tenter une preuve) ; 5) compétence
`discovered` jamais pratiquée ; 6) reprise du parcours actif. Déterministe, borné, **jamais présenté comme
une recommandation IA**.

### D4 — Evidence timeline (dérivée, pas de nouveau store)
`evidenceTimeline(progress, program)` agrège toutes les `evidence` déjà stockées dans les jours
(`{type, title, skills, createdAt, day}`), triées par date. Aucune écriture ; pure lecture.

### D5 — Milestones fondés sur preuves (gamification saine) ou NO_COMMIT
`milestones(...)` dérive un **petit** ensemble de jalons qualitatifs, chacun **relié à une preuve réelle** :
première compétence démontrée, premier diagnostic réussi, première remédiation après échec, premier
capstone terminé, premier transfert multi-domaines, fondations d'un domaine démontrées. **Interdits** : XP,
monnaie, boutique, récompense quotidienne, streak punitive, coffres, niveaux numériques, classement,
badge-spam. Si les données ne justifient pas un milestone, il **n'apparaît pas**. Si aucun milestone n'est
justifiable, le checkpoint milestone est **NO_COMMIT**.

### D6 — Surfacer sobrement sur les pages EXISTANTES (anti-AI-slop)
On **relie** aux pages existantes (`/skills`, `/`, `/synthese`, `/revisions`) plutôt que de réécrire l'app.
Interdits explicites : hero marketing, slogans, grille de cards clonées, gradients/halos/glassmorphism/
blobs gadget, emojis décoratifs, compteurs géants sans décision, graphiques décoratifs, XP/badges/streaks,
microcopy infantilisante, faux « AI Coach ». L'information prime sur la décoration.

### D7 — Réajustement honnête du périmètre (l'audit fait foi)
Le prompt demande une refonte visuelle large + design system complet. Conformément à la priorité déclarée
(**pédagogie > UI > décoration** et « moins de fonctionnalités mais excellentes »), V41 livre le **cœur
explicable** et le surface sobrement ; les refontes purement esthétiques non essentielles sont
**explicitement documentées comme non faites / dette V42**, plutôt que produites à la va-vite au risque de
l'« AI slop » que le prompt interdit.

### D8 — Gate `v41:check` + tests significatifs
Gate : aucune source concurrente sur disque (`xp/achievements/gamification/mastery-v2`), les états produits
∈ `SKILL_STATES`, chaque next-action porte une raison ET une preuve attendue, chaque milestone est relié à
une preuve. Tests : explicabilité, priorité des actions, timeline dérivée, milestones fondés, **absence
d'XP/progression inventée** — pas seulement des HTTP 200.

### D9 — Sûreté & honnêteté
Aucune écriture dans `progress.json` (read-model pur + UX lecture seule) ; baseline restaurée. Frontière
PREUVE/PROXY rappelée (un score reste un indice) ; SIMULATION conservée. Accessibilité (clavier, focus,
contraste, pas d'info par couleur seule) et mobile préservés/haussés là où on touche l'UI.

## Conséquences
- **Positives** : l'apprenant comprend son état, sait quoi faire ensuite, voit ses preuves — le tout dérivé,
  explicable, sans métrique inventée.
- **Coûts** : moins de « spectaculaire visuel » que le prompt l'imaginait (assumé et documenté).
- **Rejeté** : second moteur (D1), XP/gamification arbitraire (D5), refonte massive au risque d'AI-slop (D6/D7).
