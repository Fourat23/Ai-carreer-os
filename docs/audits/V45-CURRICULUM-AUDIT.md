# V45 — CURRICULUM AUDIT (128 leçons)

Audit **lecture seule**. Aucune leçon modifiée. Cœur du sprint V45.

## Honnêteté sur la profondeur (TESTÉ / INSPECTÉ)

- **INSPECTÉ (128/128)** : signaux structurels mesurés par `scripts/v45-audit.mjs` sur le Markdown
  RÉEL (pas seulement les métadonnées) — présence ET longueur du modèle mental, ouverture
  « problème d'abord », récap, pièges, blocs de code, nombre de mots, practiceRefs. Plus : l'ouverture
  des 128 leçons a été survolée (marqueur `keep` + section « 🌍 Le problème d'abord » universelle).
- **TESTÉ en profondeur (13/128)** : lecture qualitative intégrale et notation sur la grille 20-dim.
  Sélection stratifiée : machine-learning-basics, statistics-for-ml, feature-engineering,
  model-evaluation, embeddings, neural-networks, transformers (IA/ML) ; distributed-systems-failures,
  rag-fundamentals (avancées) ; recursion, design-patterns-intro, interview-preparation (fondations/
  carrière) ; + revue V44 des ouvertures.
- **NON fait** : notation bespoke 20-dim des 115 leçons non échantillonnées — leur verdict est
  STRUCTUREL, pas qualitatif intégral. Ce document ne le prétend pas.

## Grille 20 dimensions (0→4) appliquée à l'échantillon (13)

Dimensions : A accuracy · B accessibility débutant · C prérequis · D progression concret→abstrait ·
E modèle mental · F profondeur · G qualité d'explication · H exemples · I raisonnement guidé ·
J pièges/misconceptions · K charge cognitive · L vocabulaire · M pertinence pro · N pratique autonome ·
O pratique diagnostique · P transfert · Q redondance (inverse) · R cohérence voisins · S rétention/récap ·
T pertinence entretien.

Résultats de l'échantillon (synthèse, /4) :

| Leçon | A | B | E (modèle mental) | F profondeur | I raisonnement | J pièges | N/O pratique | Verdict |
|---|---|---|---|---|---|---|---|---|
| machine-learning-basics | 4 | 4 | 4 (spam→apprendre des exemples) | 3 | 4 | 4 | 2 (pas d'exo code) | KEEP |
| statistics-for-ml | 4 | 4 | 4 (moyenne trompeuse) | 3 | 4 | 4 | 1 | KEEP |
| feature-engineering | 4 | 4 | 4 (leakage) | 3 | 4 | 4 | 1 | KEEP |
| model-evaluation | 4 | 4 | 4 (99 % inutile) | 4 | 4 | 4 | 2 | KEEP |
| embeddings | 4 | 4 | 4 (sens=position) | 3 | 3 | 3 | 1 | KEEP |
| neural-networks | 4 | 4 | 4 (boutons à régler) | 3 | 3 | 3 | 1 | KEEP |
| transformers | 4 | 3 | 4 (souris ambiguë) | 3 | 3 | 3 | 1 | KEEP |
| distributed-systems-failures | 4 | 3 | 4 (échec partiel = normalité) | 4 | 4 | 4 | 2 | KEEP |
| rag-fundamentals | 4 | 4 | 4 (examen à livre ouvert) | 4 | 4 | 4 | 2 | KEEP |
| recursion | 4 | 4 | 3 | 3 | 3 | 3 | 2 (inline, pas exécutable) | **DEEPEN** |
| design-patterns-intro | 4 | 4 | 3 | 3 | 3 | 3 | 1 | **DEEPEN** |
| interview-preparation | 4 | 4 | 3 | 3 | 3 | 3 | inline (légitime) | KEEP |

**Constat honnête** : sur l'échantillon, la qualité PROSE est réellement BON→FORT. Les modèles mentaux
ne sont pas décoratifs : ils aident à raisonner (vérifié). Les leçons avancées bornent explicitement
leur scope (« raisonner en junior solide, pas maîtriser la théorie complète ») — la longueur uniforme
(~800-1500 mots) n'est donc PAS un plafond nuisible ici. Le point faible RÉCURRENT est **N/O (pratique
autonome/diagnostique)** : hors JS/TS, la pratique est absente ou seulement inline.

## Verdicts par catégorie (17)

| Catégorie | Leçons | Verdict prose | Note |
|---|---|---|---|
| Fondations | 9 | BON→FORT | recursion : DEEPEN (pratique exécutable) |
| Web & backend | 6 | BON | pratique JS/TS présente |
| Frontend : Web Platform | 7 | BON | pratique web/DOM présente |
| Frontend & React | 12 | BON | nextjs-* : GAP pratique |
| Software engineering & architecture | 13 | BON→FORT | design-patterns : DEEPEN |
| Data & SQL | 8 | BON | pratique SQL minimale (5 exos, ajoutés V44) |
| Systèmes & Linux | 5 | BON | pratique gitlinux présente |
| Réseau | 5 | CORRECT→BON | pratique projetée jsts, pas « réseau » |
| CI/CD & livraison | 4 | BON | SIMULÉ honnête |
| Conteneurs & Docker | 5 | BON | SIMULÉ |
| Kubernetes | 6 | BON | labs SIMULÉS riches |
| Cloud, AWS, Azure & IaC | 7 | BON | SIMULÉ ; pas de pratique code |
| Observabilité, SRE & fiabilité | 8 | BON | observability-logging : GAP pratique |
| Production & DevOps | 5 | BON | SIMULÉ |
| Python & ML | 8 | FORT | prose exemplaire ; pratique ML absente |
| IA appliquée | 15 | FORT | prose exemplaire ; pratique absente (SIMULÉ) |
| Portfolio & carrière | 5 | BON | pratique inline légitime (narratif) |

## Distribution des actions recommandées (aucune implémentée en V45)

| Action | Nombre | Détail |
|---|---|---|
| KEEP | **122** | prose stabilisée, intuition-first, modèle mental réel |
| DEEPEN | **3** | recursion, design-patterns-intro, git-advanced — mérite pratique exécutable / approfondissement ciblé |
| GAP_PRACTICE | **3** | nextjs-foundations, nextjs-server-client-components, observability-logging — pratique manquante |
| SPLIT | 0 | aucune leçon surchargée détectée (longueur homogène) |
| MERGE | 0 | pas de doublon franc détecté sur l'échantillon |
| REORDER | 0 (à confirmer CP5) | voir warnings graph concept-without-foundation ×47 |
| DEPRECATE | 0 | aucune leçon obsolète détectée |
| GAP_REQUIRES_NEW_LESSON | 0 confirmé | couverture domaine large (voir V45 domain audit) |

**Important** : aucune leçon n'est notée EXCELLENT en bloc — la prose est FORT sur l'échantillon IA/ML
et distribuée, mais « EXCELLENT » exigerait de vérifier aussi la pratique associée, qui est le maillon
faible. Le verdict global du corpus PROSE est **BON→FORT** ; le corpus PRATIQUE est **FRAGILE hors JS/TS**.

## Limites de cet audit
- 115/128 leçons ont un verdict STRUCTUREL (non une notation qualitative intégrale). Un audit V46 devra
  approfondir la lecture qualitative des catégories Cloud/Réseau/DevOps/Docker non échantillonnées.
- Les warnings graph `concept-without-foundation` (×47) suggèrent des points de REORDER potentiels à
  instruire au CP5 (parcours), pas tranchés ici.
