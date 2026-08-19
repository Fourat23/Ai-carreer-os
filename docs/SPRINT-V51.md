# SPRINT V51 — Curriculum Retention & Cognitive Progression Lock

**Type** : certification + correction temporelle (pas de nouveau contenu de fond).
**Corpus** : gelé. **Ordre des 365 jours** : inchangé. **Langue** : français.

## 1. Git final
Branche `claude/ai-career-os-saas-phfg49` ; HEAD synchronisé (local == origin) ;
working tree propre ; stash vide ; aucun serveur résiduel.
Corpus SHA-1 : `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3` (initial = final).
`data/progress.json` blob : `323604021055588a9528a86875f36598dbdc7758` (initial = final).

## 2. Ce que V51 a réellement fait
- **Certifié honnêtement la qualité temporelle** post-V50 et **corrigé une
  affirmation V50** : la rétention, mesurée sur la PRATIQUE (pas l'enseignement),
  comptait **10 anomalies** d'écart > 90 j, pas 1.
- **ADR-051** (contrat temporel, forgetting policy, progression, charge, verrou).
- **Étendu le read-model** `lib/curriculum-timeline.mjs` (charge, progression de
  difficulté, rétention honnête) — pur, aucune seconde source.
- **Réactivation espacée** : 15 exercices EXISTANTS rattachés à des JOURS DE
  RÉVISION existants dans les écarts → **10 → 0 anomalie de rétention**.
- **Gate `v51:check`** (dans `gates:active`) + tests.
- **Certification** : 11 mois GREEN, 1 AMBER justifié (M12 intégratif).
- **CURRICULUM 1.0 LOCK** (verrou durci).
- 8 docs d'audit + ce rapport + prompt V52.

## 3. Avant → après
| Métrique | Avant V51 | Après V51 |
|----------|:--:|:--:|
| Anomalies de rétention (pratique, code) | 10 | **0** |
| Réactivations espacées | — | **+15** (réutilisation, 0 nouveau contenu) |
| D5 isolé | 0 | 0 |
| Journées excessives créées | — | **0** |
| Orphelins | 0 | 0 |
| Pratique-avant-intro | 10 (héritée) | 10 (inchangée) |
| Mois GREEN / AMBER / RED | — | **11 / 1 / 0** |
| Tests | 1256 | **1261** |
| Gates | 35 | **36** |
| Jours réordonnés / leçons modifiées | — | **0** |

## 4. Distribution des écarts de pratique (avant → après)
gitlinux 248→<90 · archi 157→<90 · algo 146→<90 · http 146→<90 · python 138→<90 ·
patterns 134→<90 · secu 130→<90 · ds 117→<90 · ml 95→<90 · dl queue 109→réactivé.

## 5. Distribution de charge (365 jours)
none 118 · light 216 · normal 18 · heavy 6 · **excessive 7 (héritées, 0 créée)**.

## 6. Certification mensuelle
M1-M11 GREEN ; M12 AMBER justifié (mois intégratif comm/autonomy + projet).

## 7. Éléments modifiés / NON modifiés
- **Modifié** : `data/day-exercises.json` (+15 réactivations), read-model étendu,
  gate ajouté, docs.
- **NON modifié (volontaire)** : les 128 leçons, l'ordre des 365 jours, `program.json`
  (ordre), `progress.json`, la structure des parcours.

## 8. Réel / Simulé / Proxy / Externe
- **RÉEL** : exercices exécutés le long du parcours (node/python/sqlite3/pandas/
  sklearn/NumPy).
- **PROXY** : read-models (timeline, rétention, charge) — dérivés.
- **SIMULÉ** : sorties de modèle dans les exercices IA (étiquetées).
- **EXTERNE** : cloud (contrats externes honnêtes).
- **NON_CODE** : comm/autonomy.

## 9. Limites restantes (dette V52+)
- M12 léger en pratique de code (intentionnel).
- Compétences enseignées en fin (rag/evalia/agents) peu réactivées après leur
  fenêtre (peu de jours de révision tardifs).
- `ds` difficulty-jump hérité (échauffement j2).

## 10. Validation technique
`npm test` **1261/0** · `tsc` **0** · `npm run build` **OK** · `gates:active`
**36 verts** · `curriculum:check` 365/365 · `v51:check` vert · corpus SHA-1
identique · `progress.json` intact · ordre des jours inchangé · local == origin.

## 11. Verdict Curriculum 1.0 : **FORT**
V51 certifie la qualité temporelle du parcours et **corrige honnêtement** une
métrique d'oubli optimiste de V50 : la rétention des compétences de code passe de
10 écarts > 90 j à **0**, par réactivation espacée (réutilisation d'exercices sur
jours de révision), sans nouveau contenu, sans réordonner un jour, sans toucher au
corpus. Le curriculum est **VERROUILLÉ en 1.0**. Non qualifié « excellent » : M12
reste léger, les compétences IA tardives sont peu réactivées, et un artefact de
difficulté hérité subsiste — limites nommées, non masquées.
