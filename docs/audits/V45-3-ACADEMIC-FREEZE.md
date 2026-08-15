# V45.3 — Décision de freeze académique

## Contexte

Verdict global : **CERTIFICATION_PARTIALLY_CONFIRMED**. Le corpus est fort et sans
fausseté (0 C/D/E sur l'échantillon adversarial), mais V45.2 a légèrement
surévalué le **grade** (A universel) et le **transfert** (inflation T4).

La consigne (section 14 du prompt) : si robuste → geler ; si échec → backlog
localisé, ne pas restructurer. Le cas présent est **intermédiaire** → un freeze
**partiel et ciblé**.

## Décision

### GELÉ : `ACADEMICALLY_FROZEN` — les fondations conceptuelles

Toutes les chaînes de FONDATION conceptuelle sont gelées : Fondations, JS/TS, Web
Platform, React/Frontend, Backend/API, SQL/Data (concepts), Git, Linux, Réseau,
SW-eng/archi, Python, Stats/ML (concepts), Deep Learning (concepts), LLM/RAG
(concepts), Agents (concepts), Observabilité/SRE, System Design.

**Interdit en V46+ sur ces leçons :**
- déplacer massivement les leçons ;
- réécrire les fondations ;
- modifier les prérequis stables ;
- refaire les chaînes « pour améliorer ».

**Une modification future n'est autorisée que sur preuve de :**
- bug conceptuel démontré ;
- nouvelle exigence professionnelle réelle ;
- mauvaise progression démontrée par un exercice/assessment ;
- régression détectée.

### NON GELÉ : deux chantiers explicitement ouverts (additifs / consolidation)

1. **Consolidation des récaps redondants** (NON une refonte des concepts) :
   `docker-containers`, `ci-cd`, `observability-logging` — fusionner leur apport
   propre dans les séries profondes / source canonique, puis repositionner. Cela
   ne touche AUCUN concept gelé.
2. **Ajout de pratique exécutable** (Barre B) : ML/DL, Data/pandas, Docker/K8s,
   Linux, réseau, RAG/agents. **Additif** : on ajoute des boucles de pratique,
   on ne réécrit pas les leçons.

### Métadonnées d'audit (invisibles pédagogiquement)

Le recalibrage des libellés de transfert (T0-T5) et les grades V45.3 sont des
métadonnées d'audit ; ils n'imposent aucune modification du contenu gelé.

## Améliorations normales = ADDITIVES

Conformément à la consigne, les améliorations V46+ deviennent additives :
pratique, feedback, diagnostics, Labs, exercices, évaluations, scénarios
professionnels — **par-dessus** un socle conceptuel gelé.

## Ce que le freeze garantit à l'apprenant

Un apprenant qui commence aujourd'hui n'aura pas à réapprendre les fondations :
elles sont gelées et ne bougeront que sur preuve d'un défaut réel. Les évolutions
porteront sur la PRATIQUE (ce qui lui manque le plus) et sur le nettoyage de
quelques doublons — sans invalider ce qu'il a appris.
