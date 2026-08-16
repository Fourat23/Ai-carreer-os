# ADR-040 — Runtime de la pratique exécutable (V46)

## Statut
Accepté (V46, CP1).

## Contexte

Les audits V45.x ont établi : théorie forte et gelée, mais **pratique exécutable
absente pour 12/20 compétences** (CP0, `PRACTICE-AUDIT-V46.md`). En particulier :
- **SQL** est enseigné mais pratiqué en **simulation JS** (runtime node-js), alors
  que la leçon elle-même documente honnêtement « réel vs simulé ».
- **ML / DL / RAG / agents** n'ont **aucun** exercice.

Contrainte fondatrice du projet : **jamais de second moteur** (catalogue unique,
contrats uniques, scoring unique, evidence unique, sandbox unique — cf.
ADR-009/010/012). Question de V46 : peut-on offrir de la vraie pratique
professionnelle sans violer cette contrainte ?

## Environnement mesuré (CP0)

- Node.js, TypeScript, React, Web : disponibles (adaptateurs existants).
- **Python 3.11.15** : disponible ; adaptateur `python3` déjà présent et testé.
- **sqlite3** : disponible en **stdlib Python** (3.45.1).
- **numpy / pandas / scikit-learn** : **absents** ; `pip install` techniquement
  possible mais **non reproductible** (conteneur éphémère, CI, offline, autres
  machines).

## Options

- **A — stdlib uniquement, pas de SQL réel** : statu quo. Rejeté : laisse SQL en
  simulation alors qu'un moyen réel existe.
- **B — environnement Python isolé avec dépendances tierces pinnées**
  (numpy/pandas/sklearn) : rejeté. Non reproductible → un exercice « vert » ici
  serait « rouge » ailleurs. Trahit le déterminisme et l'honnêteté.
- **C (RETENUE) — Python stdlib + sqlite3, via l'adaptateur `python3` existant** :
  vraie exécution (Python réel, SQL réel), **sans aucune dépendance tierce**,
  **sans nouveau moteur**.

## Décision

**Option C.** La pratique Data/SQL/ML/DL/RAG/agents s'écrit en **Python stdlib**
(+ `sqlite3`), exécutée par l'**adaptateur `python3` déjà en place**. Aucune
modification du runtime n'est nécessaire : `import sqlite3` fonctionne déjà dans
le bac à sable (vérifié par exécution réelle en CP1 — un exercice SQL passe via
`runExercise` sans changement de code).

Ce n'est PAS un second moteur : on réutilise
- le **catalogue unique** (`data/exercises/*.json`),
- les **contrats de test** (`call-equals`, `stdout-*`),
- le **scoring commun** (`gradeRun`),
- la **sandbox unique** (`workspace-fs.mjs`),
- le **read-model de couverture unique** (`practice-coverage.mjs`).

### Frontières honnêtes

- **numpy/pandas/sklearn NON utilisés** : les mécanismes ML/DL pédagogiquement
  utiles sont implémentés à la main en Python stdlib (train/test split, matrice de
  confusion, precision/recall/F1, baseline, leakage, forward pass, gradient). On
  ne réimplémente PAS sklearn ; on entraîne le **raisonnement**, pas la
  familiarité d'API tierce (documenté par exercice).
- **SQL** : réel via sqlite3 (SELECT/WHERE/JOIN/GROUP BY/sous-requêtes/index/
  transactions/EXPLAIN). Frontière déclarée : **PostgreSQL, réplication et
  isolation distribuée NE sont PAS reproduits** par SQLite → ces aspects restent
  conceptuels/étiquetés.
- **RAG/agents** : tout le pipeline/orchestration est réellement codé ;
  la représentation d'embedding et les « tools »/LLM sont **déterministes et
  étiquetés SIMULATION** (aucun faux appel réseau).
- **Cloud/K8s** : `EXTERNAL_ENVIRONMENT_REQUIRED` — non exécutable localement,
  fourni comme tâches honnêtes (objectif/prérequis/commandes/evidence).

### Contraintes de sûreté (inchangées, déjà en place)

Racine dédiée par exercice, allowlist de fichiers, `readOnly` respecté, tailles
bornées, `execFile` sans shell, timeout + SIGKILL, sortie plafonnée, env minimal
sans secret, isolation inter-exercices. sqlite3 n'ouvre que `:memory:` ou un
fichier **dans la racine sandboxée** ; aucun accès réseau (sqlite3 n'en a pas).

### Contrainte de déterminisme

Les sorties de test restent **entières ou chaînes** (jamais de flottant nu) :
les métriques ML sont renvoyées en comptes entiers (matrice de confusion) ou en
chaînes formatées (`f"{x:.3f}"`), pour une comparaison `call-equals` stable
cross-plateforme.

## Conséquences

- **Positif** : SQL passe de simulé à réel ; ML/DL/RAG/agents deviennent
  pratiquables ; zéro dépendance ajoutée ; reproductible partout où Python 3
  existe ; aucun second moteur ; corpus gelé intact.
- **Négatif** : pas de pandas/sklearn « comme en entreprise » (compensé par
  l'honnêteté : on pratique le raisonnement, la familiarité d'API tierce reste à
  acquérir hors plateforme) ; les exercices Python sont sautés proprement si
  Python 3 est absent d'une machine (déjà géré par `detectRuntime`).
- **Suivi** : le gate V46 (CP2) vérifie qu'aucune simulation n'est présentée comme
  du réel et qu'aucune compétence « operational » n'est sans code exécutable.
