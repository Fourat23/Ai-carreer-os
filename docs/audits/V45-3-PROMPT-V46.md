# Prompt V46 — EXECUTABLE PRACTICE REMEDIATION I

> À lancer APRÈS V45.3. Ne PAS démarrer pendant V45.3. Macro-sprint de PRATIQUE
> (pas d'audit, pas de réécriture des fondations). Fondé sur le constat V45.3 :
> corpus conceptuellement fort et **gelé** (0 C/D/E), mais **pratique exécutable
> (Barre B) manquante** pour plusieurs compétences, et **récaps DevOps
> redondants**.

## Constat hérité (à lire d'abord)

- `docs/audits/SPRINT-V45-3.md` (verdict PARTIALLY_CONFIRMED, réponse utilisateur
  OUI AVEC RÉSERVES).
- `docs/audits/V45-3-ACADEMIC-FREEZE.md` (fondations gelées ; chantiers ouverts).
- `docs/audits/V45-3-LESSON-REDTEAM.json` (4 B : pandas, observability-logging,
  docker-containers, ci-cd ; transfert recalibré).

## Invariant absolu (freeze académique)

Les **fondations conceptuelles sont `ACADEMICALLY_FROZEN`**. Interdit de réécrire
les leçons, déplacer massivement, ou refaire les chaînes. Toute modification d'une
leçon gelée exige une preuve (bug conceptuel / exigence pro / mauvaise progression
démontrée / régression). Corpus SHA-1 de référence :
`4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3`.

## Objectif central

Transformer la COMPRÉHENSION (Barre A, forte) en SAVOIR-FAIRE EXÉCUTABLE (Barre B)
via des boucles complètes :

`LEARN → GUIDED PRACTICE → INDEPENDENT PRACTICE → DEBUG → DIAGNOSE → DECIDE →
TRANSFER → PROFESSIONAL SCENARIO → EVIDENCE`

## Priorités (état V45.3/V45.2 fait foi)

1. **Python / Data** : sandbox Python exécutable ; pratique pandas réelle (répond
   au downgrade B de `pandas-data-wrangling`).
2. **ML** : workflow honnête exécutable (split → baseline → cross-val → métriques)
   pour `machine-learning-basics`, `model-evaluation`, `scikit-learn-workflow`.
3. **RAG / evaluation** : étendre le harnais replay (rappel@k, ablation par étage).
4. **Agents** : boucle agentique jouable avec budget + traces, en bac à sable.
5. **Docker / Kubernetes / Cloud** : environnement jouable pour les gestes clés
   (build multi-stage, compose up, permissions, probes).
6. **Sécurité** : exercices d'injection / durcissement exécutables.

## Chantier de consolidation (non-freeze, additif)

- Fusionner l'apport propre de `docker-containers` (120) dans la série 097-101 et
  de `ci-cd` (121) — notamment l'**éval smoke LLM en CI** — dans 102-103, puis
  repositionner/archiver les récaps. Consolider le log structuré (055/080/123)
  vers une source canonique. **Aucun concept gelé n'est réécrit.**
- Corriger la coquille `iac-fundamentals` (« réutation » → « réutilisation »).

## Recalibration transfert (métadonnée)

Recalibrer les libellés T0-T5 à l'échelle du corpus selon la règle V45.3 (preuve
exigée pour T4/T5). C'est une métadonnée d'audit ; n'implique aucune réécriture.

## Méthode & contraintes

- Macro-sprint séquentiel à checkpoints atomiques ; rapports en **français** ;
  priorité n°1 = qualité pédagogique et honnêteté (réel vs simulé toujours
  déclaré).
- Toute pratique ajoutée est **reliée** à la/les leçon(s) qu'elle outille et
  **couverte par un test**. Pas de gonflage de compteurs.
- `data/progress.json` restauré au blob de référence, jamais commité.
- Pousser sur `claude/ai-career-os-saas-phfg49`. Pas de PR sauf demande.
- Trailers : `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` +
  `Claude-Session: <url>`.
- Vérif finale : `npm test`, `tsc`, build, gates verts ; corpus re-haché ; arbre
  propre ; local == origin.

## Critère de succès V46

Faire passer la réponse utilisateur de **« OUI AVEC RÉSERVES »** vers **« OUI »**
en comblant la Barre B : l'apprenant doit pouvoir PRATIQUER (pas seulement
comprendre) ML/DL/infra/data, et les récaps redondants doivent être consolidés —
sans jamais toucher au socle conceptuel gelé.
