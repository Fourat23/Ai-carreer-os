# ADR-047 — Runtime de pratique professionnelle & sécurité du catalogue (V47)

## Statut
Accepté (V47, CP1).

## Contexte

V46 a établi la pratique exécutable (Python stdlib + sqlite3 réel) pour 13/20
compétences. V47 vise : (a) outils Data/ML professionnels, (b) LLM/evalia et
archi/patterns de zéro → réel, (c) frontière honnête local/external pour
Docker/K8s/cloud, (d) protection contre les collisions d'ids (incident V46).

Capacités mesurées (CP0) : node/python3/sqlite3/npm exécutables ; **pip installe
réellement** (numpy en venv via proxy) mais **non reproductible** hors-ligne/CI ;
**docker daemon absent** ; kubectl/terraform/aws/az absents.

## Décisions

### 1. Tooling Data/ML — track opt-in `python-ds` (numpy/pandas/scikit-learn)

- Un **adaptateur runtime `python-ds`** réutilise le harness Python EXISTANT
  (`buildPythonHarness`, sandbox, scoring communs) mais pointe le **binaire d'un
  venv de projet** (`.venv-ds/bin/python`, gitignoré). Ce n'est **pas un second
  moteur** : même contrats, même sandbox, même notation (cf. ADR-040).
- Provisionnement **explicite et reproductible** : `scripts/v47-provision-ds-venv.sh`
  + `requirements-ds.txt` **à versions pinnées**. Aucune installation globale,
  aucun binaire commité, aucun accès réseau à l'exécution des exercices (les
  paquets sont dans le venv ; le venv python les résout sans réseau).
- **Détection** : `detectRuntime('python-ds')` = disponible **ssi** le venv
  existe ET `import numpy` réussit. Sinon les exercices `python-ds` sont
  **sautés proprement** (comme python3 l'est en son absence) et étiquetés
  `TOOLING_ENVIRONMENT_REQUIRED`.
- **Portabilité préservée** : le gros de la pratique Data/ML reste sur le track
  **stdlib portable** (RÉEL partout). Le track `python-ds` prouve la capacité
  RÉELLE (pandas/sklearn exécutés) là où il est provisionné. On ne choisit donc
  pas stdlib par confort : les deux tracks coexistent, chacun honnêtement
  étiqueté.
- Interdits maintenus : pas de faux sklearn, pas de réimplémentation de sklearn,
  pas de dépendances flottantes, pas d'install globale.

### 2. Infra — frontière honnête

- **Docker** : daemon absent ⇒ **EXTERNAL_ENVIRONMENT_REQUIRED** (pas de fausse
  exécution). Labs Docker durcis (scénario/preuve/cleanup).
- **K8s/AWS/Azure** : EXTERNAL_ENVIRONMENT_REQUIRED.
- Étiquettes de preuve normalisées : `LOCAL_EXECUTABLE`, `SIMULATION`,
  `PROXY` (heuristique honnête), `EXTERNAL_ENVIRONMENT_REQUIRED`,
  `TOOLING_ENVIRONMENT_REQUIRED`.

### 3. AI/LLM evaluation — harness déterministe local

evalia/llm se pratiquent **sans modèle réel** via des briques déterministes
(exact match, validation de schéma/sortie structurée, groundedness/citation sur
contexte fourni = **PROXY** étiqueté, comparaison de versions, precision/recall,
catégorisation d'échecs, trade-off coût/latence/qualité). Aucun faux appel
OpenAI/Anthropic. Ce qui exige un modèle réel = `EXTERNAL_MODEL_REQUIRED`.

### 4. Architecture / patterns — vrai code

Exercices en **TS/Node réel** (couplage, inversion de dépendance, strategy/
adapter/observer, state machine, refactoring sous tests, choix/non-choix de
pattern sous contraintes). Pas de théorie déguisée.

### 5. Sécurité du catalogue — collision = HARD FAIL

Un **gate/test** vérifie l'**unicité des ids** sur TOUS les artefacts
(exercices, lessons, assessments, missions, playbooks, capstones,
transfer-challenges) et l'**unicité des ids de runtime**. Un générateur ne peut
plus écraser silencieusement un artefact : `buildAndVerify` refuse d'écrire si
l'id existe déjà sous un fichier différent. Tests + `v47:check`.

### Contrainte de déterminisme (inchangée)

Sorties de test entières/chaînes ; flottants formatés (`f"{x:.3f}"`).

## Conséquences

- **Positif** : Data/ML professionnel RÉEL possible (opt-in) sans casser la
  portabilité ; evalia/llm/archi/patterns deviennent pratiquables ; frontière
  infra honnête ; collisions impossibles.
- **Négatif / limites** : le track `python-ds` est sauté là où le venv n'est pas
  provisionné (CI hors-ligne) — assumé et étiqueté ; Docker/K8s/cloud non
  exécutés localement (external).
- **Suivi** : `v47:check` (unicité ids + capabilities + contrat V47) câblé dans
  `gates:active`.
