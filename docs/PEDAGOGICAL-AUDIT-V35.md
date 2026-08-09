# Audit pédagogique — Sprint V35

> Burn-down de dette pédagogique (12 leçons héritées sans rampe d'accès) + activation, sur preuve,
> du parcours **Data / ML Engineer** par composition non contiguë. Document en français, factuel,
> sans langage promotionnel. La qualité prime sur la quantité : **0 nouvelle leçon** en V35 —
> l'effort a porté sur la franchissabilité des leçons existantes et sur le packaging d'un parcours.

## 1. Méthodologie

L'audit sépare strictement **trois** choses (rubrique v20, `lib/pedagogy-audit.mjs`) :

1. **La rubrique** — 16 dimensions, échelle 0-4, notées par un **humain** à la **lecture intégrale**
   de chaque leçon. Une occurrence de mot-clé n'est jamais une preuve d'enseignement ; une longueur
   n'est jamais une qualité.
2. **Les signaux structurels** — présence/absence des composants pédagogiques (on-ramp, prérequis,
   modèle mental, exemple guidé, erreurs fréquentes, à retenir, vocabulaire, liens). Ils **informent**
   l'auditeur, ils ne **notent** pas.
3. **Les signaux de danger** — commande destructive non signalée, promesse de sécurité trompeuse,
   code tronqué, placeholder résiduel. **Bloquants** quelle que soit la moyenne.

Seuils de sortie appliqués : aucune dimension < 2 ; dimensions dures
(technical-accuracy, objective, progression, autonomous-practice) ≥ 3 ; moyenne récente ≥ 3,25.
Le registre `docs/architecture/v35-pedagogy-audit.json` est validé par
`validateAuditLedger` (test `tests/v35-pedagogy.test.mjs`).

## 2. Le standard « franchissable » (ce qui manquait)

Une leçon est **franchissable** par un néophyte quand elle ouvre sur un **problème concret** avant
d'énoncer un objectif, et qu'elle nomme ses **prérequis rédigés** avant d'exiger un modèle mental.
Les 12 leçons héritées avaient un contenu solide (modèle mental, exemples guidés, erreurs
fréquentes, questions d'entretien, vocabulaire) mais **entraient dans le vif sans rampe** : le
débutant tombait sur « ## 🎯 Objectif » sans jamais avoir vu *pourquoi* le sujet existe.

Le burn-down a donc été **strictement additif** :

- `## 🌍 Le problème d'abord` — une mise en situation concrète (le « ça marche chez moi » pour
  Docker, le « silence poli » en entretien pour le storytelling) insérée **avant** l'objectif.
- `## 🧩 Prérequis` — des prérequis **rédigés** (≥ 12 mots, avec liens `/doc/lessons/…`), insérés
  **avant** le modèle mental.

Aucune reformulation du fond, aucune suppression : le contenu qui existait déjà a été **relié**, pas
réécrit. C'est l'application directe de `RÉUTILISER → RELIER → DURCIR → CRÉER`.

## 3. Matrice d'audit — 12 leçons du burn-down

Notes humaines (0-4). TA = exactitude technique, Obj = objectif, Pré = prérequis, MM = modèle
mental, Prof = profondeur, Prog = progression, EG = exemple guidé, PA = pratique autonome,
FB = feedback, EF = erreurs fréquentes, PP = pertinence pro, Éval = évaluation, CC = charge
cognitive, Acc = accessibilité, Rét = rétention, TC = cohérence parcours.

| Leçon | TA | Obj | Pré | MM | Prof | Prog | EG | PA | FB | EF | PP | Éval | CC | Acc | Rét | TC | Moy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| git-advanced | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 3,75 |
| docker-containers ⚑ | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 3,75 |
| ci-cd | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,56 |
| observability-logging | 4 | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,44 |
| monitoring-production | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,38 |
| deployment-secrets | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,63 |
| caching-performance | 4 | 4 | 3 | 4 | 3 | 3 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,50 |
| system-design-interview | 3 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,56 |
| interview-preparation | 3 | 4 | 3 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 3,56 |
| portfolio-github | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,63 |
| readme-documentation | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 4 | 3,63 |
| technical-storytelling | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 3,69 |

⚑ = leçon **critique** V35. **Moyenne globale du burn-down : 3,59.** Aucune dimension < 3 ; toutes
les dimensions dures ≥ 3 ; toutes les moyennes ≥ 3,25.

### Honnêteté des notes (pas de greenwashing)

- **autonomous-practice = 3** pour les leçons **carrière / soft-skills** (`system-design-interview`,
  `interview-preparation`, `portfolio-github`, `readme-documentation`, `technical-storytelling`) :
  leur pratique est **réflexive** (pitcher en 90 s, s'enregistrer, chronométrer, rédiger un README)
  — elle ne peut pas être auto-corrigée par exécution de code. Le plancher 3 est **assumé**, pas
  gonflé à 4.
- **technical-accuracy = 3** (et non 4) pour `system-design-interview` et `interview-preparation` :
  ce sont des **méthodes** (arbitrages, estimation d'ordre de grandeur) et non des vérités
  vérifiables par test ; 3 reflète « conseil solide et exact » sans surclasser.
- **depth = 3** partout : ces leçons couvrent bien leur périmètre sans prétendre à l'exhaustivité
  d'un cours dédié. `evaluation` et `cognitive-load` restent à 3 — marge d'amélioration réelle,
  non masquée.

## 4. Avant / après (burn-down)

| Indicateur | Avant V35 | Après V35 |
|---|---|---|
| Leçons sans on-ramp `## 🌍` | 12 | **0** |
| Leçons du burn-down avec prérequis rédigés `## 🧩` | partiel | 12 / 12 |
| Moyenne pédagogique du lot (16 dim.) | non exploitable (pas de rampe) | **3,59** |
| Dimensions dures < 3 dans le lot | — | 0 |

Vérification exécutable (test e2e V35) : le scan de `curriculum/lessons/*.md` renvoie **0 leçon**
sans `## 🌍`. La franchissabilité n'est pas déclarée, elle est **mesurée**.

## 5. Parcours Data / ML — parcours d'un néophyte

Le parcours `data-ml-v1` est désormais **DISPONIBLE** : **7 modules, 188 jours**, composés par
**sélection non contiguë** de jours réels du programme 365j (le mécanisme
`Array.isArray(from) ? from.includes(d.day) : range` existait déjà — appsec/systems-cloud/cloud-devops
l'utilisent). Aucun second moteur, aucun catalogue dupliqué : le parcours est un **read model**
au-dessus de l'unique source de vérité `data/program.json`.

Trajectoire d'un débutant complet le long des 7 modules :

1. **Fondations : terminal & Git** — on ne manipule pas de la donnée sans savoir ouvrir un terminal
   et versionner. Rampe : `terminal-shell-filesystem`, `git-fundamentals`.
2. **Python & manipulation de données** — variables → structures → pandas. On part de « qu'est-ce
   qu'une donnée » avant tout DataFrame.
3. **SQL & modèle relationnel** — interroger et joindre, penser en tables.
4. **Statistiques & machine learning** — de la moyenne/variance aux premiers modèles, avec le
   piège n°1 enseigné ET pratiqué (data leakage, split, matrice de confusion, surapprentissage).
5. **Deep learning** — réseaux, rétropropagation, en raisonnement déterministe (aucune dépendance
   ML installée : tout est **SIMULATION** étiquetée).
6. **Transformers & LLM** — attention, fenêtre de contexte (pratiquée : `llm-context-budget`).
7. **IA appliquée, évaluation & production** — RAG, agents, évaluation, drift (`ml-drift-detect`),
   mise en production.

**Distinction prouvée** (test e2e) : `data-ml-v1` (188 j) est un **sous-ensemble focalisé** du
parcours AI Engineer (365 j) — il en exclut une part notable (frontend / JS / web),
`taille(dml) ≤ 0,75 × taille(aiEng)`. Ce n'est pas une copie déguisée : c'est une **lecture
alternative** du même programme.

### Frontière réel / simulé (aucun greenwashing)

Aucun modèle n'est réellement entraîné, aucune inférence LLM n'est exécutée, aucune base
vectorielle n'est interrogée : `numpy`/`pandas`/`sklearn`/`torch` **ne sont pas installés** et sont
**interdits**. Les exercices data/ML sont des **raisonnements déterministes en node-js** (détecter
une fuite, ordonner un ETL, budgéter une fenêtre de contexte) — tous étiquetés **SIMULATION** dans
leur `summary`, vérifié par test.

## 6. Audit rétroactif

Le corpus complet reste conforme :

- **Curriculum Graph** : 0 anomalie **bloquante**, 7 avertissements (6 `advanced-before-prerequisite`
  = dépendances conceptuelles **légitimes**, non supprimées ; 1 `concept-not-practiced` hors thème).
  Trajectoire V32 → V33 → V34 → V35 : **15 → 13 → 7 → 7** (stabilisé, sans suppression arbitraire).
- **Gates** : 15 gates actives, toutes vertes (le gate `v35:check` valide structurellement le
  périmètre : on-ramp, prérequis, vocabulaire, liens, pratique, graphe acyclique, réel/simulé).
- **Signaux de danger** : 0 bloquant sur le lot audité (Docker manipule les secrets *au run, jamais
  dans l'image* ; aucun `chmod 777` ni `rm -rf` non signalé ; aucun bloc de code non fermé).

## 7. Mesures qualitatives

- **Franchissabilité** : plus aucune leçon n'ouvre sur un objectif sans problème ni prérequis. Un
  débutant sait, avant de lire, *pourquoi* le sujet existe et *ce qu'il doit déjà savoir*.
- **Cohérence parcours** : les 12 leçons durcies sont toutes situées dans le programme (mois/jours,
  leçons liées) — TC = 4 partout.
- **Honnêteté** : les limites (pratique réflexive non exécutable, méthodes non testables,
  profondeur bornée) sont **notées**, pas dissimulées ; la frontière réel/simulé est explicite.
- **Non-duplication** : 0 leçon, 0 exercice, 0 playbook, 0 module créés « pour faire du volume ».
  Le seul artefact data ajouté au sprint (playbook `data-pipeline-broken`, CP7) comble un vrai
  manque (incident de pipeline/schéma en production), il ne double aucun existant.

## 8. Conclusion

V35 est un sprint de **macro-structuration** honnête : il ne gonfle aucun compteur (110 leçons
inchangées), il **finit** un chantier de dette (12/12 leçons franchissables) et il **active** un
parcours réel sur preuve mesurable, en réutilisant un mécanisme existant plutôt qu'en construisant
un second moteur. La dette résiduelle est documentée (7 warnings graphe légitimes ; marges
depth/evaluation/cognitive-load à 3). Rien n'est présenté comme meilleur qu'il ne l'est.
