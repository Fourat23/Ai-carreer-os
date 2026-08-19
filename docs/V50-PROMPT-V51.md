# Prompt V51 — RETENTION, REACTIVATION & LEARNER PROGRESS EXPERIENCE

> À lancer APRÈS V50. Ne PAS démarrer pendant V50. Fondé sur l'état réel V50 —
> LE DÉPÔT FAIT FOI. Macro-sprint pédagogique (pas de refonte, pas d'UI générale).

## Constat hérité (à lire d'abord)
- `docs/SPRINT-V50.md` (verdict FORT) ; `docs/ADR-050-temporal-curriculum-integration.md`.
- `docs/audits/V50-TEMPORAL-LEARNING-AUDIT.md`, `V50-PRACTICE-DISTRIBUTION.md`,
  `V50-365-CURRICULUM-MAP.md`, `CURRICULUM-1.0-FREEZE.md`.
- Read-model `lib/curriculum-timeline.mjs` ; gate `v50:check` ; carte
  `docs/audits/v50-timeline.json`.

## Invariants absolus (inchangés)
- **CURRICULUM 1.0 GELÉ** : l'ordre macro des 365 jours ne se réordonne PAS sans
  ADR + preuve d'un défaut bloquant. **Corpus académique gelé**
  (SHA-1 `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3`). `progress.json` restauré exact
  (blob `323604021055588a9528a86875f36598dbdc7758`), jamais commité.
- **Une seule source de vérité, aucun second moteur** (review/scheduler/scoring).
  RÉUTILISER > RELIER > DURCIR > ÉTENDRE > CRÉER.
- **Anti-greenwashing** : REAL/SIMULATION/PROXY/TOOLING/EXTERNAL/NON_CODE. Pas de
  faux modèle, pas de fausse infra, pas d'XP/streak/badge.
- **Anti-scope-collapse** : l'effort d'un CP se RÉALLOUE, ne réduit pas l'ambition.
- Branche `claude/ai-career-os-saas-phfg49` ; trailers requis ; id de modèle
  absent des artefacts ; pas de PR sauf demande.

## Cibles prioritaires (dette V50)
1. **Réactivation des fondamentaux au second semestre** : sans réordonner les
   jours, densifier la réactivation de jsts/algo/ds/http/sql/python sur les jours
   de RÉVISION existants (retrieval espacé). Réutiliser le review engine ;
   mesurer la réduction des anomalies d'oubli via `v50:check`.
2. **`dl` — oubli tardif** : proposer une réactivation (jour de révision) sans
   nouveau jour d'enseignement DL ; documenter si impossible sans réordonnancement.
3. **Espacement du transfert** : vérifier que les défis de transfert arrivent à
   distance de la première exposition (pas juste après le cours) ; replanifier via
   le mapping si nécessaire.
4. **Expérience de progression apprenant** : rendre LISIBLE (surfaces existantes
   `/parcours`, `/synthese`, `/skills`) la chaîne concept→pratique→réactivation→
   transfert→scénario→preuve, sans refonte UI ni gamification.
5. **Placement des scénarios** : matérialiser le placement conseillé
   (`V50-PROFESSIONAL-INTEGRATION.md`) de façon vérifiable si un rattachement
   propre au jour est possible sans casser l'app.

## Floors (substance, réallouables)
Réduire les anomalies d'oubli sous un seuil ; ≥1 mécanisme de réactivation espacée
réutilisant le review engine ; audit d'espacement du transfert ; aucune régression
(corpus/progress/jours). Créer seulement ce qui est utile.

## Clôture (obligatoire)
`npm test` + `tsc --noEmit` + `npm run build` + `gates:active` verts ; corpus
SHA-1 identique ; ordre des 365 jours inchangé ; `progress.json` restauré ;
working tree propre ; rapport de verdict (INSUFFISANT/MOYEN/BON/FORT/EXCELLENT,
EXCELLENT rare). **Ne pas démarrer V52.**
