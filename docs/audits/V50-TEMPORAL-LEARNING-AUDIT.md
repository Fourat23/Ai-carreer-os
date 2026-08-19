# V50 — Audit d'apprentissage temporel

Dérivé du read-model (`temporalAudit`). Pour chaque compétence de programme :
première/dernière **exposition d'enseignement** (jour où la compétence est le
sujet), nombre de **jours de pratique** (via activités résolues), et l'écart de
queue de la séquence d'enseignement.

| Compétence | 1re expo. | Dern. expo. | Jours de pratique | Écart de queue (enseignement) |
|-----------|:--:|:--:|:--:|:--:|
| gitlinux | d1 | d73 | 12 | 292 |
| jsts | d4 | d119 | **105** | 246 |
| algo | d15 | d48 | 23 | 317 |
| ds | d30 | d42 | 14 | 323 |
| patterns | d38 | d39 | 9 | 326 |
| se | d40 | d111 | 14 | 254 |
| http | d50 | d91 | 17 | 274 |
| sql | d55 | d140 | 17 | 225 |
| secu | d67 | d336 | 7 | 29 |
| archi | d76 | d308 | 18 | 57 |
| python | d82 | d147 | **38** | 218 |
| ml | d148 | d182 | 25 | 183 |
| dl | d183 | d203 | 12 | 162 |
| llm | d197 | d224 | 10 | 141 |
| rag | d218 | d315 | 11 | 50 |
| evalia | d253 | d322 | 17 | 43 |
| agents | d274 | d329 | 17 | 36 |
| comm | d66 | d364 | 0 (non-code) | 1 |
| autonomy | d44 | d365 | 0 (non-code) | 0 |

## Ce que V50 a corrigé

- **Pratique intégrée** : chaque compétence de code a désormais des jours de
  pratique réels (jsts 105, python 38, ml 25, archi 18…), contre une majorité
  d'exercices orphelins avant V50.
- **Réactivation** : les exercices de compétences fondamentales sont replacés sur
  des **jours de révision tardifs** (retrieval practice), ramenant les anomalies
  d'oubli de **12 à 1** (mesuré par `v50:check`).

## Limite honnête assumée (dette V51)

L'« écart de queue d'enseignement » élevé des fondamentaux (gitlinux 292, ds 323,
algo 317…) reflète la **structure GELÉE des jours** : ces compétences sont
enseignées tôt, puis le parcours passe à Data/AI. On NE réordonne PAS les jours
(freeze). La réactivation par la pratique atténue l'oubli sans déplacer les
concepts ; une réactivation encore plus dense des fondamentaux au second semestre
est une piste V51 (via de nouveaux jours de révision, jamais par réordonnancement).

`dl` conserve une anomalie d'oubli (pratique absente après ~j256) : `dl` est
enseigné d183-203 puis n'a pas de jour d'enseignement tardif où rattacher une
réactivation — piste V51.
