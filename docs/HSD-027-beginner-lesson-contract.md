# HSD-027 — Contrat de leçon débutant & spécification pédagogique

Document de spécification humaine (Human Spec Document) du Sprint V27. Décrit CE
QUE doit contenir une leçon de fond pour être exploitable par un **néophyte
complet**, et comment on le vérifie. Complète ADR-027 (décisions) et TSD-027
(spécification technique du gate).

## 1. Chemin pédagogique néophyte (ordre de référence)

Adapté au sujet, une leçon progresse :

1. situation concrète — 2. problème à résoudre — 3. intuition sans jargon —
4. vocabulaire minimal — 5. modèle mental — 6. exemple simple entièrement
expliqué — 7. mécanisme réel — 8. exemple guidé plus réaliste — 9. erreur
fréquente / contre-exemple — 10. méthode de diagnostic — 11. application
professionnelle — 12. pratique semi-guidée — 13. vérification de compréhension —
14. exercice de transfert — 15. synthèse — 16. liens prérequis et suite.

Les étapes 1-3 sont précisément celles qui manquaient dans V26 : V27 les matérialise
par la section **« 🌍 Le problème d'abord »** placée AVANT `🎯 Objectif`.

## 2. Structure additive imposée par V27

Chaque leçon V26 durcie doit comporter, EN PLUS de sa structure existante :

- **`## 🌍 Le problème d'abord`** (nouvelle, en tête après le titre `# Leçon —`) :
  - une situation concrète et parlante (« tu déploies… et soudain… ») ;
  - le problème que la leçon résout ;
  - l'intuition, SANS jargon non défini ;
  - se termine en amenant naturellement l'Objectif.
- **`## 🧩 Prérequis`** enrichie : phrase(s) expliquant ce qu'il faut déjà savoir
  ET pourquoi, en conservant les liens `/doc/lessons/…`.
- Vocabulaire : chaque terme technique important est défini (ou relié au glossaire)
  à son premier usage.

Les sections V26 existantes (Objectif, Modèle mental, Explication, repères, Exemple
guidé, Erreurs fréquentes, Sécurité, Cas métier, Questions d'entretien,
Mini-exercice, À retenir, Vocabulaire, Checklist, Liens) sont CONSERVÉES.

## 3. Règles sur les analogies et le vocabulaire

- Une analogie est explicitement présentée comme telle et précise ses limites ;
  elle ne remplace jamais le mécanisme réel.
- Un terme nécessaire est défini avant/au moment de son premier usage, relié au
  glossaire si une entrée existe, ajouté au glossaire s'il est important et absent,
  et employé de façon cohérente entre leçons.
- Exemples de dépendances à respecter :
  - **Kubernetes** : ne pas ouvrir sur CrashLoopBackOff/OOMKilled/ImagePullBackOff
    sans avoir établi/relié processus, conteneur, image, cluster, nœud, Pod,
    workload, état désiré/observé, réconciliation, redémarrage, probes,
    ressources CPU/mémoire.
  - **Cloud** : ne pas ouvrir sur VPC/VNet/NAT/NSG/Security Group sans avoir
    établi/relié datacenter, virtualisation, région, zone, IP, CIDR, subnet, route,
    gateway, pare-feu, trafic entrant/sortant, disponibilité/redondance.

## 4. Graphe leçon → pratique (`practiceRefs`)

Chaque **leçon critique** doit être reliée à au moins un artefact pratique réel via
`practiceRefs` (cf. ADR-027 décision 2) : exercice, Lab, mission ou playbook
EXISTANT et pédagogiquement pertinent. Un même artefact peut servir plusieurs
leçons s'il existe une relation réelle. Interdits : liens vers un artefact absent,
liens décoratifs sans rapport, doublons sémantiques créés pour un quota.

## 5. Grille d'audit (16 dimensions, échelle 0-4)

On réutilise la rubrique de `lib/pedagogy-audit.mjs` (technical-accuracy, objective,
prerequisites, mental-model, depth, progression, guided-example,
autonomous-practice, feedback, common-mistakes, professional-relevance, evaluation,
cognitive-load, accessibility, retention, track-coherence). La grille V27 étendue
(26 axes du prompt) est couverte par ces 16 dimensions plus les vérifications
STRUCTURELLES du gate (on-ramp, prérequis explicites, vocabulaire, practiceRefs,
graphe de prérequis, réel/simulé).

### Seuils (leçon critique)

- moyenne globale ≥ **3,2 / 4** ;
- aucune note < 2 sur : technical-accuracy, accessibility, prerequisites,
  mental-model, guided-example, autonomous-practice ;
- une longueur de texte n'est JAMAIS une preuve de profondeur ;
- toute note sous le seuil déclenche : constat → correction → nouvelle évaluation →
  trace dans le ledger.

## 6. Rôle de CP11

CP11 « Pedagogical Hardening & Beginner Validation » (checkpoint ACTIF) : ré-audite
les 32 leçons + celles modifiées, compare avant/après, corrige les contenus sous le
seuil, effectue un parcours néophyte de bout en bout sur un échantillon (une leçon
par domaine : Linux, réseau, Docker, CI/CD, K8s, cloud, AWS, Azure, IaC, FinOps), et
produit `docs/PEDAGOGICAL-AUDIT-V27.md`. Après toute modification CP11 : re-générer,
re-tester, re-typecheck, re-build, re-gates, re-audit, validation navigateur utile,
restauration progress.json, nettoyage, état Git.

## 7. Honnêteté réel / simulé (rappel non négociable)

Aucune leçon ne prétend exécuter Docker/Kubernetes/AWS/Azure/IaC réels ; toute
exécution est simulée et étiquetée ; conteneur ≠ VM (noyau partagé) ; Secret K8s =
base64 non chiffré par défaut ; secrets factices ; AWS et Azure distingués ; aucune
promesse de sécurité trompeuse ; un domaine n'est « couvert » que si la pratique est
réellement atteignable.
