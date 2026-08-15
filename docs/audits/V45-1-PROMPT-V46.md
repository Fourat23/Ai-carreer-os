# PROMPT V46 (dérivé de V45.1 — NE PAS démarrer maintenant)

## Titre
**V46 — ACADEMIC REMEDIATION & CURRICULUM FREEZE : rendre praticable ce qui est déjà compris**

## Contexte (établi par V45.1, non négociable)
L'audit académique 128/128 a CERTIFIÉ le corpus de leçons (115 CERTIFIED + 13 USABLE, 0 REWORK/BLOCKED/
MISSING) : la PROSE est solide et stable. La dette n'est PAS la qualité des leçons — c'est la PRATIQUE.
Barre B : seules 8/20 compétences sont praticables en code (JS/TS, algo, DS, HTTP, SQL, Python, Linux).
Les chaînes cassent toutes au maillon **APPLICATION** pour ML/IA/cloud/K8s/Docker/sécurité. 128 contrats
d'apprentissage et 6 zones de freeze immédiates ont été produits.

## Priorité contraignante (inchangée)
PÉDAGOGIE / ACQUISITION RÉELLE > COHÉRENCE > PRATIQUE PROFESSIONNALISANTE > OUTILLAGE > UI/UX > FEATURES.

## Règles non négociables
Local, mono-utilisateur, une seule source de vérité, sans fausse IA/infra, **sans second moteur**.
RÉUTILISER→RELIER→DURCIR→ÉTENDRE→CRÉER. RÉEL/SIMULÉ/PROXY séparés. Pas de XP/badges. `progress.json`
gitignoré, blob `323604021055588a9528a86875f36598dbdc7758`, restauré EXACTEMENT, jamais commité.
Anti-scope-collapse : toute suppression = PREUVE + EFFORT RÉALLOUÉ. Anti-gonflage : qualité ≠ nombre.
Branche `claude/ai-career-os-saas-phfg49`.

## INTERDITS SPÉCIFIQUES (issus de V45.1)
- **Ne PAS réécrire une leçon CERTIFIED** (115) pour produire du diff (interdit ADR).
- **Ne PAS restructurer l'ordre du programme** : aucune RESTRUCTURE n'a été justifiée.
- Ne pas déplacer/supprimer une leçon des zones FREEZE sans MIGRATION IMPACT + LEARNER PROGRESS
  COMPATIBILITY.
- Ne pas simuler une exécution LLM/infra en la présentant comme réelle.

## CP1 (ADR-046) — Extension de taxonomie
Trancher comment tagger des exercices vers ml/rag/evalia/llm/secu/cloud/archi SANS casser la projection
fine→programme ni créer de taxonomie concurrente. Les 262 exercices existants et tous les gates doivent
rester verts. (Option a : ids programme acceptés comme skills d'exercice ; option b : compétences fines
réelles `prompt/retrieval/chunking/ml-eval/iam/...` projetées. Décider avec preuve.)

## FLOORS proposés (ajuster au CP0 réel, sans réduire le sprint)
- **A** — Taxonomie étendue + testée : 0 régression sur 262 exos, gates verts.
- **B** — **≥ 20 exercices de code exécutables** pour l'IA/data praticable localement (evalia : métriques/
  confusion ; ml : split/leakage/encodage ; rag : cosinus/RRF/chunking ; data : pandas-like en Python).
  Contrat complet (référence verte, starter fautif, ≥1 public + ≥1 privé, sorties entières/chaînes).
  Objectif : faire passer ml/rag/evalia de « théorie-seule » à OPERATIONAL (barre B).
- **C** — Corriger les **24 exercices sans test privé**.
- **D** — Combler le **diagnostic Python** (misconception(s) + assessment).
- **E** — **Réactivation espacée** : ajouter (additif) des jours de réactivation JS/React/backend sur
  M6-M12 avec MIGRATION IMPACT (contre l'oubli identifié au CP12).
- **F** — Mettre à jour ledger/matrice/contrats/freeze : PROUVER que ≥ 3 compétences passent à
  OPERATIONAL et promouvoir les zones GELABLE-PROSE concernées vers FREEZE complet.
- **G** — Reconnaître HONNÊTEMENT le non-exécutable local (cloud/k8s/infra, génération LLM) : renforcer
  labs + capstones NOTÉS, sans faux code.
- **H** — Rapport final floor-par-floor + certification barre B mise à jour + prompt V47.

## Livrables
ADR/HSD/TSD-046 ; extension `skill-taxonomy` (+ tests, 0 régression) ; exercices `data/exercises/*`
(vérifiés par exécution) ; correction 24 tests privés ; gate `v46:check` ; mises à jour
`V45-1-*`/ledger ; docs REMEDIATION-V46 / SPRINT-V46 + prompt V47.

## Méthode
CP0 forensic lecture seule (git, progress blob, tests/tsc/build/gates, compteurs). Présenter le CP0.
Puis CP1→CP15 automatiques. Commits atomiques par phase, push après chaque CP. Fin : progress.json
restauré, arbre propre, local == origin, verts, 0 serveur résiduel, synthèse FRANÇAISE, puis prompt V47
(sans démarrer V47).
