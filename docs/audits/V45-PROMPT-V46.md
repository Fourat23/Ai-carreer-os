# PROMPT V46 (dérivé de l'audit V45 — NE PAS démarrer maintenant)

## Titre
**V46 — PRACTICE REMEDIATION I : rendre l'IA/ML/Data réellement PRATICABLES (taxonomie + exercices exécutables)**

## Contexte (issu de V45, non négociable)
L'audit 360° V45 a établi, preuves à l'appui : le corpus de leçons est BON→FORT (122/128 KEEP), la
discipline d'ingénierie est FORTE (1202 tests, 24 gates, une source de vérité), MAIS la **pratique de
code exécutable ne couvre que 8 des 20 compétences** (82 % des exercices sont jsts). Le programme
consacre ~42 % de l'année à l'IA/ML/RAG/agents, domaines **sans aucune pratique de code**. Cause racine :
la taxonomie `isKnownSkill` rejette `ml/rag/evalia/llm/agents/dl/cloud/secu/archi` comme compétences
fines d'exercice → impossible de tagger un exercice vers ces domaines.

**C'est la dette n°1 de V45.** V46 l'attaque, sans casser l'existant.

## Priorité contraignante (inchangée)
PÉDAGOGIE > ACQUISITION RÉELLE > PRATIQUE/PROFESSIONNALISATION > COHÉRENCE > ÉVALUATION > A11Y/UX >
TECHNIQUE > FEATURES > ESTHÉTIQUE.

## Règles non négociables (rappel)
Local, mono-utilisateur, une seule source de vérité, sans fausse IA/infra, **sans second moteur**.
Ordre RÉUTILISER→RELIER→DURCIR→ÉTENDRE→CRÉER. Séparer RÉEL/SIMULÉ/PROXY. Pas de XP/badges. Ne jamais
prétendre exécuter ce que l'environnement ne peut pas. `progress.json` gitignoré, blob
`323604021055588a9528a86875f36598dbdc7758`, restauré EXACTEMENT, jamais commité. Anti-scope-collapse :
toute suppression exige PREUVE + EFFORT RÉALLOUÉ À. Anti-gonflage : quantité ≠ qualité. Développer et
pousser sur `claude/ai-career-os-saas-phfg49`.

## Décision de conception au CP1 (ADR-046)
Trancher l'extension de taxonomie, SANS casser la projection fine→programme ni créer de taxonomie
concurrente. Deux options à évaluer honnêtement :
- (a) rendre les ids de programme `ml/rag/evalia/llm/secu/cloud/archi` acceptables comme skills
  d'exercice (projection identité), en gardant `skill-taxonomy` et `practice-coverage` cohérents et
  testés ;
- (b) introduire des compétences fines RÉELLES qui se projettent vers ces domaines (ex. `prompt`,
  `retrieval`, `chunking`, `ml-eval`, `iam`, `netpolicy`, `dockerfile`), documentées.
Contrainte : les 262 exercices existants et tous les gates doivent rester verts.

## FLOORS proposés (ajuster au CP0 réel, sans réduire le sprint)
- **A** — Taxonomie étendue + testée : projection 100 % cohérente, 0 régression sur 262 exos, gates verts.
- **B** — **≥ 20 exercices de code RÉELLEMENT exécutables** pour l'IA/data praticable localement :
  cibler d'abord ce qui S'EXÉCUTE sans LLM/infra — ex. `evalia` (précision/rappel/F1, matrice de
  confusion, calcul de métriques), `rag` (similarité cosinus top-k, RRF, chunking à recouvrement,
  déjà amorcés), `ml` (split train/test, détection de fuite par les features, encodage), `python`
  data-wrangling. Contrat complet (référence verte, starter fautif, ≥1 public + ≥1 privé, sorties
  entières/chaînes, anti-fuite). Objectif : faire passer `ml/rag/evalia` de FOUNDATIONAL à OPERATIONAL.
- **C** — Corriger les **24 exercices sans test privé** (ajouter ≥ 1 test privé chacun).
- **D** — Combler le **diagnostic Python** (misconception(s) + assessment/variation).
- **E** — Mettre à jour ledger + matrice de couverture + ladders ; PROUVER que ≥ 3 compétences
  aujourd'hui FOUNDATIONAL passent OPERATIONAL, et recalibrer la readiness en conséquence.
- **F** — Reconnaître HONNÊTEMENT ce qui reste non exécutable localement (cloud/k8s/sécurité infra,
  génération LLM réelle) et le renforcer par labs/capstones notés plutôt que par du faux code.
- **G** — Rapport final floor-par-floor + baseline mise à jour (BETA→STABLE pour les compétences
  devenues OPERATIONAL).

## Interdits
Casser la projection existante ; créer une seconde taxonomie/moteur ; simuler une exécution de LLM en
la présentant comme réelle ; réécrire les leçons KEEP pour du diff ; gonfler un compteur.

## Livrables
ADR/HSD/TSD-046 ; extension `skill-taxonomy` (+ tests) ; exercices `data/exercises/*` (vérifiés par
exécution) ; correction des 24 tests privés ; gate `v46:check` ; mise à jour `v45-audit-data`/ledger ;
docs PRACTICE-AUDIT-V46 / PEDAGOGICAL-AUDIT-V46 / SPRINT-V46 + prompt V47.

## Méthode
CP0 forensic lecture seule d'abord (git, progress blob, tests/tsc/build/gates, compteurs). Présenter le
CP0. Puis CP1→CP15 automatiques. Commits atomiques par phase. Fin : progress.json restauré, arbre
propre, local == origin, verts, 0 serveur résiduel, synthèse FRANÇAISE, puis prompt V47 (sans démarrer).
```
