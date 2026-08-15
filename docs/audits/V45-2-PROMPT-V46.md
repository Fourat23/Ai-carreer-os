# Prompt V46 — Combler la Barre B (pratique exécutable) & consolidations

> À lancer APRÈS V45.2. Ne PAS démarrer pendant V45.2. Ce prompt part du constat
> certifié de V45.2 : **contenu 128/128 A (EXCELLENT)**, mais **dette de pratique
> exécutable (Barre B)** pour ML/DL/infra, et quelques **doublons curriculaires**.

## Contexte hérité (à lire d'abord)

- `docs/audits/V45-2-EXECUTIVE-SUMMARY.md` (verdict global FORT + 25 questions).
- `docs/audits/V45-2-ACADEMIC-DEBT.md` (backlog priorisé P0-P3).
- `docs/audits/V45-2-CURRICULUM-STABILITY.md` (0 RESTRUCTURE, 1 ORDER_FIX).
- `docs/audits/V45-2-LESSON-LEDGER.json` (128/128 A — **ne pas régresser**).

## Invariant absolu

Le **contenu certifié 128/128 A ne doit pas régresser**. V46 AJOUTE de la
pratique et CONSOLIDE des doublons ; il ne réécrit pas les leçons certifiées sans
raison P1+ documentée. Corpus SHA-1 de référence :
`4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3` (toute modification volontaire doit
être justifiée, testée, et re-certifiée par une relecture de la leçon touchée).

## Objectif n°1 (P1) — Banc de pratique EXÉCUTABLE (Barre B)

La priorité qui change la note globale de FORT → EXCELLENT.

1. **ML/DL** : sandbox Python/scikit(-learn) jouable pour `machine-learning-basics`,
   `model-evaluation`, `scikit-learn-workflow`, `neural-networks` — au minimum
   un workflow honnête exécutable (split → baseline → cross-val → métriques) et
   une boucle d'entraînement PyTorch réellement runnable (ou un substitut
   déterministe).
2. **Infra** : environnement Docker/Linux jouable pour la série 087-091 (Linux)
   et 097-101 (Docker) — au minimum exécuter les gestes clés (permissions,
   signaux, build multi-stage, compose up avec healthcheck).
3. **Réseau/observabilité** : harnais de diagnostic (traces/percentiles/logs
   synthétiques) permettant de PRATIQUER le raisonnement par couches et p95/p99.
4. **RAG** : étendre le harnais replay existant (déjà le point fort Barre B).

Chaque brique de pratique doit être **reliée** à la/les leçon(s) qu'elle outille
et couverte par un test.

## Objectif n°2 (P1) — Palier JS → Python → ML

Ajouter une **2e leçon Python** (environnements virtuels, packaging, numpy /
idiomes data) entre `python-foundations` et `statistics-for-ml`. Ajout additif,
chaîne 12. Re-certifier la nouvelle leçon avec la grille V45.2.

## Objectif n°3 (P1) — Consolider les doublons DevOps

`docker-containers` (120) et `ci-cd` (121) recouvrent la série profonde 097-103.
Fusionner leur apport propre (notamment l'**éval smoke LLM en CI** de la 121)
dans la série profonde, puis repositionner/archiver les récaps. Ne rien perdre
du contenu utile ; préserver le fil rouge DocSense.

## Objectif n°4 (P2) — Consolidations légères

- Log structuré éclaté sur `observability-logging` (055), `logging-structured`
  (080), `llm-observability` (123) : source canonique + renvois.
- Clarifier les frontières `ai-evaluation`/`rag-evaluation` (072/073) et
  `ai-security`/`prompt-injection-defense` (076/077).
- Évaluer un mini-rappel réseau/systèmes plus tôt ; une section NoSQL en
  `database-modeling`.

## Objectif n°5 (P3) — Finitions

- Coquille « réutation » → « réutilisation » dans `iac-fundamentals` (117).
- Alléger la densité de quelques L3 (encarts « pause »), sans descendre sous A.

## Méthode & contraintes

- Macro-sprint séquentiel à checkpoints atomiques (CP0→CPn), rapports en
  **français**, priorité n°1 = **qualité pédagogique**.
- Toute leçon ajoutée ou modifiée est **re-certifiée** avec la rubrique
  `V45-2-ACADEMIC-RUBRIC.md` (verdict A exige preuves positives + 7 portes ≥ 3).
- `progress.json` (gitignoré) restauré au blob de référence, jamais commité.
- Développer/pousser sur `claude/ai-career-os-saas-phfg49`. Pas de PR sauf demande.
- Trailers de commit : `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
  + `Claude-Session: <url>`.
- Vérif finale verte : `npm test`, typecheck, build, gates ; corpus re-haché ;
  arbre propre ; local == origin.

## Critère de succès V46

Faire passer le **verdict global de FORT à EXCELLENT** en transformant la
compréhension (Barre A) en **savoir-faire exécutable (Barre B)** pour ML/DL/infra,
sans régresser le contenu certifié 128/128 A.
