# V45 — CURRICULUM BASELINE 1.0 (proposition)

Audit **lecture seule**. Cet artefact NE modifie AUCUN fichier de leçon : le statut est un DÉRIVÉ
d'audit, pas un champ écrit dans les `.md`. Objectif : figer une référence stable pour que
développement et apprentissage avancent EN PARALLÈLE.

## Définitions

- **STABLE** : objectif pédagogique figé, place dans le graphe stabilisée, prérequis cohérents,
  profondeur suffisante, **pratique de code exécutable cohérente**, aucune restructuration attendue.
- **BETA** : leçon utilisable pour COMPRENDRE le concept, mais amélioration substantielle probable —
  typiquement l'AJOUT d'une pratique de code (aujourd'hui absente ou SIMULÉE). La prose est solide ;
  le parcours de compétence n'est pas encore complet.
- **DRAFT** : ne doit pas servir de socle d'apprentissage principal.

## Classification (dérivée de la couverture réelle)

| Statut | Nombre | Base |
|---|---|---|
| STABLE | **62** | leçons dont la/les compétence(s) atteignent OPERATIONAL (pratique de code réelle) : JS/TS, algo, ds, http, gitlinux, se, sql, python et leurs voisines |
| BETA | **66** | leçons FOUNDATIONAL : prose FORTE + diagnostic/transfert, mais pratique de code absente/SIMULÉE (cloud, docker, k8s, sécurité, archi, systèmes distribués, data/ML, IA appliquée, patterns, dl, carrière) |
| DRAFT | **0** | — |

### Pourquoi 0 DRAFT (honnête, pas complaisant)
Aucune leçon n'est INAPTE à servir de socle : les 128 ont une prose intuition-first, un modèle mental
réel (mesuré ≥ 60 mots partout) et une structure pédagogique complète. Le maillon faible n'est PAS la
qualité de la leçon mais la **pratique associée** — ce que capture BETA. Étiqueter DRAFT des leçons
comme `transformers` ou `rag-fundamentals` (prose FORTE) serait faux. Le manque est un manque de
PRATIQUE, pas de leçon.

### Nuance à l'intérieur de BETA
Certaines BETA sont proches de STABLE (il ne leur manque « que » la pratique : ml, rag, cloud, secu —
prose FORTE, assessments/transferts présents). D'autres sont plus jeunes (dl, agents, patterns —
diagnostic/pratique partiels). V46 devra prioriser l'ajout de pratique aux premières.

## Politique de stabilité (proposée, contraignante pour V46+)

Pour une leçon **STABLE** :
- **AUTORISÉ** : corriger une erreur, clarifier, ajouter un exemple, enrichir, ajouter de la pratique,
  améliorer la formulation.
- **INTERDIT sans migration explicite** : changer l'objectif pédagogique, changer brutalement le
  niveau, déplacer la leçon dans le graphe, supprimer un prérequis fondamental, changer son identité,
  invalider une progression existante.

Pour une leçon **BETA** : mêmes règles, MAIS l'ajout de pratique de code est ENCOURAGÉ et n'est pas
considéré comme une rupture (c'est le chemin BETA→STABLE).

Toute restructuration future doit produire : **MIGRATION IMPACT** + **LEARNER PROGRESS COMPATIBILITY**
(la progression `data/progress.json` d'un apprenant ne doit pas être invalidée silencieusement).

## Chemin BETA → STABLE
Une leçon BETA devient STABLE quand sa compétence atteint OPERATIONAL : ajout d'exercices de code
exécutables (contrat complet) couvrant guidé → autonome → diagnostic, sans toucher la prose. C'est
l'objet direct de la roadmap V46 (cf. V45-PROJECT-STATE / rapport final).
