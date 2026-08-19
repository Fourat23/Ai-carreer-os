# SPRINT V50 — 365-Day Curriculum Integration & Learning Path Lock

**Type** : intégration temporelle + verrou de parcours. **Corpus** : gelé
(SHA-1 `4c1f3028…`, inchangé). **Langue** : français. **Branche** :
`claude/ai-career-os-saas-phfg49`.

## 1. Git final
HEAD synchronisé (local == origin) ; working tree propre ; stash vide ; aucun
serveur ; `data/progress.json` intact (`32360402…`) ; corpus SHA-1 `4c1f3028…`.

## 2. Problème traité
Les briques pédagogiques étaient mûres, mais **189/376 exercices étaient
orphelins du parcours** (dont les 114 exercices professionnels V46-V49), et les
**mois 7-12 n'avaient quasiment aucune pratique** rattachée aux jours. La
pratique existait sans être rencontrée au bon moment.

## 3. Ce qui a été fait (ADDITIF, sans toucher au corpus gelé, sans réordonner un jour)
- **ADR-050** : modèle temporel + intégration via `day-exercises.json` (authored),
  réutilisation du review engine + 52 jours de révision, aucun second moteur.
- **lib/curriculum-timeline.mjs** : read-model PUR (timeline, audit temporel,
  anomalies, distribution). **scripts/v50-timeline-map.mjs** : carte dérivée.
- **Intégration** (`scripts/v50-integrate-activities.mjs`) : 189 orphelins placés
  déterministiquement sur des jours dont la compétence correspond ET ≥ à
  l'introduction de toutes leurs compétences ; réactivation sur jours de révision.
- **Gate `v50:check`** (dans `gates:active`) + **tests** (7).
- **7 docs d'audit** + CURRICULUM-1.0-FREEZE + ce rapport + prompt V51.

## 4. Avant → après

| Métrique | Avant V50 | Après V50 |
|----------|:--:|:--:|
| Exercices atteignables depuis le parcours | 187/376 | **376/376** |
| Exercices orphelins | 189 | **0** |
| Orphelins professionnels V46-V49 | 114 | **0** |
| Jours avec pratique | 61/365 | **247/365** |
| Mois 7-12 avec pratique | ~0 | M7=19 M8=13 M9=18 M10=24 M11=17 M12=5 |
| Anomalies d'oubli | 12 | **1** |
| Pratique-avant-intro introduite par V50 | — | **0** |
| Jours réordonnés / leçons modifiées | — | **0** |
| Tests | 1249 | **1256** |
| Gates | v…v49 | **+v50** |

## 5. Les 12 mois (résultat pédagogique)
| Mois | Compétences | « Si j'arrête ici, je sais… » |
|------|-------------|-------------------------------|
| M1 | gitlinux/jsts/algo | scripter, coder en JS, penser un algorithme |
| M2 | jsts/ds/algo | structures de données, algorithmes intermédiaires |
| M3 | http/archi/se | construire/diagnostiquer une API, bases d'architecture |
| M4 | jsts/se | engineering, réactivation front |
| M5 | python/sql | data en Python, SQL réel (sqlite3) |
| M6 | ml | entraîner/évaluer un modèle (pandas/sklearn réels) |
| M7 | dl/llm | mécanismes DL, ingénierie LLM |
| M8 | rag/llm | RAG, coût/contrats LLM |
| M9 | rag/evalia/secu | évaluer un système IA, sécurité |
| M10 | agents/archi/secu | agents avec garde-fous, archi de prod |
| M11 | archi/rag/evalia | décisions d'architecture, éval avancée |
| M12 | comm/autonomy/projet | synthèse, communication, portfolio |

## 6. RÉEL / SIMULÉ / PROXY / EXTERNAL / NON_CODE
- **RÉEL** : exercices exécutés le long du parcours (node/python/sqlite3/pandas/
  sklearn/NumPy) désormais rattachés aux jours.
- **PROXY** : la carte temporelle et l'audit sont des read-models dérivés.
- **EXTERNAL** : cloud (contrats de pratique externe, `data/external-tasks.json`).
- **NON_CODE** : comm/autonomy (preuves qualitatives via scénarios/missions).
- **SIMULÉ** : sorties de modèle dans les exercices IA (étiquetées).

## 7. Stabilité — réponse directe
> « L'apprenant peut-il commencer Jour 1 aujourd'hui sans craindre une
> restructuration majeure du cursus ? »

**OUI.** Corpus gelé, ordre des 365 jours verrouillé (CURRICULUM 1.0), pratique
professionnelle intégrée au bon moment, évolutions futures additives.

## 8. Dette restante (V51)
- Réactivation encore plus dense des fondamentaux au second semestre (via jours de
  révision, jamais par réordonnancement).
- `dl` : oubli tardif (pas de jour d'enseignement DL après ~j203 où réactiver).
- M12 : n'a que 5 jours de pratique de code (mois intégratif — acceptable).

## 9. Validation technique
`npm test` **1256/0** · `tsc` **0** · `npm run build` **OK** · `gates:active`
**35 verts** (v50 câblé) · `curriculum:check` 365/365 · corpus SHA-1 identique ·
`progress.json` intact · working tree propre · local == origin.

## 10. Verdict : **FORT**
V50 transforme un corpus mûr mais mal séquencé temporellement en une trajectoire
intégrée : 0 exercice professionnel orphelin, le second semestre enfin pratiqué,
l'oubli réduit de 12 à 1, et le parcours VERROUILLÉ en Curriculum 1.0 — le tout
sans nouveau moteur, sans seconde source, sans réordonner un jour ni modifier le
corpus gelé. Pas **EXCELLENT** : la réactivation des fondamentaux et l'oubli `dl`
restent à approfondir (dette V51 nommée).
