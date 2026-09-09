# V72 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption : relire ce
> fichier, vérifier Git, reprendre au point indiqué. **NE PAS refaire un CP terminé.**

## Position

- **dernier CP terminé** : **CP4**
- **NEXT_CP** : **CP5**
- **NEXT_ACTION** : tirer l'échantillon stratifié de **24 leçons**, **graine publiée avant le
  tirage**, au plus 8 communes avec les 32 de l'échantillon aveugle V71 ; puis exécuter le
  passage **AVANT** du protocole SLV et écrire `docs/v72/V72-SLV-BEFORE.json` +
  `docs/v72/V72-CP5-SLV-AVANT.md`. TEXT_SCORE et LEARNER_SIMULATION_SCORE publiés séparément.
- **HEAD au CP0** : `7c9bcbe` · branche `claude/ai-career-os-saas-phfg49`
- **corpus** : `7eb88ba5…` · **curriculum entier** : `d4bdb9d2…` · 128 / 365 / 365

## Décisions prises

- **CP0** : aucune (lecture seule).
- **CP1** : contrat gelé `docs/v72/V72-CONTRACT-FROZEN.md`. Décisions structurantes :
  - trois niveaux de preuve séparés (texte certifié / simulé / humain réel — ce dernier reste
    `NOT YET MEASURED`) ;
  - critères R0–R3 opposables (R2 = deux phrases dupliquées ou une section supprimable sans
    perte ; R3 = trois occurrences, formulations concurrentes, ou ≥ 30 % de l'ouverture) ;
  - seuils de charge journée gelés (fourchettes par difficulté, minutage explicite faisant foi,
    portée hebdomadaire exclue) ;
  - **plafond de 7 leçons** pour une revue hebdomadaire, avec règle de sélection ;
  - huit conditions M1–M8 pour toute modification du mapping ;
  - **convention des prérequis tranchée : A = anticipation annoncée, B = exigence non
    signalée** (celle de `docs/v71/PREREQUIS-ORDRE.md`, document persisté dans la branche
    canonique) ;
  - classes A–E d'intégration des hors-parcours ; insertion automatique seulement si M1–M8 et
    thème et charge sont préservés, sinon décision laissée ouverte ;
  - exigence de pratique P1–P4 (produire quoi / à partir de quoi / réussite / correction) ;
  - quatre niveaux de validation opérationnelle N1–N4 ;
  - protocole SIMULATED LEARNER VALIDATION, règles S1–S7 ;
  - **deux verdicts séparés** : C1–C10 pour l'intégrité curriculum, L1–L9 pour la validation
    simulée. Jamais fusionnés.
  - **réservé à l'utilisateur** : retirer une compétence déclarée de `program.json`, ou créer
    une journée nouvelle. Posés au CP15, pas décidés.

## Anomalies trouvées au CP0 (détail dans `V72-CP0-BASELINE.md`)

1. **`cloud` — « Cloud / DevOps » — est une compétence déclarée avec ZÉRO journée** sur 365.
2. **CSS n'est enseigné nulle part** dans le parcours, qui demande pourtant des livrables d'UI.
3. **Next.js : zéro journée.**
4. **11 journées infaisables** (pas 3) et **22 des 52 revues** dépassent leur budget.
5. **Cause localisée** : `lessonsOf` renvoie toutes les leçons d'une compétence ;
   `lessonsDeLaRevue` en fait l'union sur la semaine → une revue hérite de tout.
6. **6 défauts factuels laissés dans le texte par V71**, comptés comme changements de note.
7. **2 références d'exercice mortes** : `api-idempotency`, `dlq-duplicate`.
8. **Le réseau sortant est revenu** et **le démon Docker démarre** (images non tirables).
9. Une **contre-analyse indépendante** des prérequis existe sur
   `origin/claude/v71-recovery-cross-validation` — V71 ne l'a pas intégrée.
10. Conflit de convention A/B dans `docs/v71/PREREQUIS-ORDRE.md`, à trancher au CP1.

## Journal des CP

- **CP2** — 17 leçons corrigées (5 R3 + 12 R2). Reclassement par les critères gelés :
  R0=2 · R1=14 · R2=12 · R3=5, en désaccord avec le préliminaire CP0 sur **7 leçons**, toutes
  publiées. Six leçons ont été **épargnées** parce que les critères gelés sont plus exigeants
  qu'un jugement de lecteur. Deux passages de **corps** supprimés (`design-patterns-intro`,
  et réécriture de `git-fundamentals` / `technical-debt`). Volume : +233 mots (+0,5 %) dont
  5 leçons qui maigrissent. Corpus `7eb88ba5…` → **`a45e9f5b…`**, 9 gels mis à jour.

- **CP3** — deux objets. (a) Motifs mécaniques : **118/128** leçons closent leur accroche par
  « Cette leçon… », mais seules **4** dupliquent leur propre objectif (recouvrement ≥ 0,30) —
  ces 4 sont corrigées, les 114 autres **volontairement pas touchées** (annoncer n'est pas
  répéter ; interdit n° 3). (b) Les **six défauts factuels** laissés ouverts par V71 sont
  fermés : Java 8 daté, ISO/IEC 14764 « perfective » rétablie avec l'écart au mot français,
  double comptage de `react-application-states` expliqué par un encadré, facteur pandas
  **mesuré** (×7 à ×72 pour une boucle, ×333 à ×3072 pour `apply(axis=1)`), 90 % non sourcé
  retiré avec sa raison, liste des falsy déclarée comme simplification. Corpus
  `a45e9f5b…` → **`d535fcf6…`**. Seuil **C7 : 6 → 0**.

- **CP4** — protocole SLV gelé (`docs/v72/V72-SLV-PROTOCOL.md`), **avant tout passage**
  (seuil L1). Séquence en 7 étapes, cinq axes notés sur [0;1] par pas de 0,25 avec barème
  explicite, questions écrites à partir des **objectifs annoncés** par la leçon, réutilisation
  des **151 items déjà taxonomés du produit** quand ils couvrent la leçon (57/128).
  **`DELAYED_RECALL` = NOT MEASURED** : un délai de 48 h n'est pas reproductible dans une
  session d'agent, et le simuler serait une invention. Cinq conditions d'invalidation du
  protocole publiées d'avance, et la liste des formulations autorisées pour chaque résultat.

## Tests

- **CP2** : 1420/1420 · tsc 0 · gates verts.
- **CP3** : 1420/1420 · tsc 0 · gates verts.
- aucun serveur résiduel ; le démon Docker démarré pour la mesure a été arrêté.
