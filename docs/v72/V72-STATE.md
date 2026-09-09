# V72 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption : relire ce
> fichier, vérifier Git, reprendre au point indiqué. **NE PAS refaire un CP terminé.**

## Position

- **dernier CP terminé** : **CP9**
- **NEXT_CP** : **CP10**
- **NEXT_ACTION** : validation opérationnelle par niveaux N1–N4 du contrat. N1 statique :
  parser les **19 blocs YAML** (k8s, CI, compose), lire les Dockerfile, `bash -n` sur les
  commandes shell. N2 local : exécuter ce qui l'est (node, python, git, shell, sqlite).
  N3 conteneur : le démon Docker démarre mais le CDN d'images est bloqué — mesurer et déclarer.
  N4 : publier ce qui reste non exécutable. Rapport `docs/v72/V72-CP10-OPERATIONNEL.md`.
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

- **CP5** — échantillon de 24 leçons tiré (graine **20260909** publiée avant le tirage,
  **0** commune avec l'échantillon V71, 4 hors parcours) et passage **AVANT** exécuté sur les
  24. **Le résultat principal n'est pas un score : c'est que l'instrument ne discrimine pas.**
  PRE-TEST **0,842** — le lecteur simulé répond déjà à 84 % des questions AVANT lecture, donc
  le gain attribuable au texte est plafonné à 0,16. RAPPEL / EXPLICATION / APPLICATION /
  MISCONCEPTION = **1,000** ; TRANSFERT **0,969** (3 leçons à 0,75). Cas « texte fort /
  restitution faible » : **0**. `DELAYED_RECALL` = **NOT MEASURED**. L7 et L8 passent
  **trivialement**, et le rapport final devra le dire au lieu d'afficher deux coches.
  Interprétation du CP13 **fixée d'avance** : un score identique ne prouvera rien, une baisse
  sera le seul signal réellement détectable.

- **CP6** — cause corrigée à la racine dans `lessonsDeLaRevue` : une revue liait l'union des
  **catalogues de compétences** traversés, pas ce que la semaine avait enseigné. Plafond de 7
  appliqué. **Revues au-dessus du plafond : 6 → 0** ; maximum 20 → 7 ; journées IMPOSSIBLE
  **11 → 7**. 103/128 leçons restent citées par une journée — **aucune orpheline créée**.
  Aucune leçon modifiée (`d535fcf6…`). **DÉFAUT PLUS GRAND TROUVÉ AU PASSAGE, NON CORRIGÉ** :
  **9 pages de revue se contredisent elles-mêmes** — le « Thème de la semaine » et la
  « Synthèse de la semaine » de la même page parlent de deux semaines différentes (j42, j49,
  j70, j77, j84, j196, j217, j224, j238). La synthèse est fiable (21/21 ne citent que des
  journées de leur propre semaine) ; c'est le thème, le bilan, le test pratique et les critères
  qui sont faux. **Ré-attribution mécanique impossible** : les décalages vont de −1 à −17 et
  deux enregistrements pointent vers la même semaine. Réparer = réécrire 9 semaines de contenu
  pédagogique ⇒ **décision de curriculum transmise au CP15**.

- **CP7** — **aucune modification**, et c'est le résultat. En appliquant les critères gelés,
  **0 leçon de classe A** : les six leçons programmées qui citent une leçon hors parcours en
  prérequis déclarent toutes explicitement « rien ici ne suppose que tu l'as lue » et donnent
  la notion sur place — ce sont des renvois d'approfondissement correctement annoncés, pas des
  dépendances. Classement : **A 0 · B 9 · C 16 · D 0 · E 0**. **Le seuil C3 ÉCHOUE** : la
  compétence déclarée **`cloud` / « Cloud / DevOps » n'a aucune journée sur 365**. Les deux
  réparations possibles (retirer la compétence, ou lui donner des journées) sont **réservées à
  l'utilisateur par le §5 du contrat** ⇒ posées au CP15. Une troisième voie a été examinée et
  **REFUSÉE** : ré-étiqueter j320 (« DocSense : dockerisation », étiquetée `evalia`) en `cloud`
  ferait passer C3 mécaniquement avec **une** journée sur 365 — franchir le seuil par la lettre
  contre son intention est exactement ce que l'anti-Goodhart interdit.

- **CP8** — mesure par domaine : **Docker est le seul intégré** (6/6 leçons liées, 65 journées,
  un livrable) ; cloud, Kubernetes, Next.js, CSS et Linux/livraison sont **référencés sans être
  enseignés**. Trou trouvé : `data/day-exercises.json` affecte **59 exercices cloud/k8s/docker
  à 9 journées** dont les leçons ne couvrent pas le sujet — **j321 pose 10 questions Kubernetes
  à quelqu'un à qui aucune journée n'a dit ce qu'est un Pod** ; j78 pose 6 exercices IAM sans
  rien qui enseigne IAM. **Une seule insertion sur cinq est légale** au regard de M5 :
  j321 ← `k8s-why-architecture` → `k8s-workloads` → `k8s-config-probes` (prérequis satisfaits
  la veille au j320 et au j72). Les quatre refus révèlent un fait de conception :
  **le cloud n'est insérable nulle part avant le jour 320**, parce que `cloud-fundamentals`
  dépend de `docker-containers`. Leçons sur parcours **103 → 106**.

- **CP9** — **aucune consigne réécrite**, et c'est conforme au contrat : l'asymétrie de longueur
  entre domaines (médiane 507 mots en frontend contre 220 en web/backend) n'est **pas** un
  défaut, vérifié sur pièce (`recursion`, 61 mots, porte trois livrables et deux chiffres à
  relever). **P1 : 0 échec sur 128** — les 4 leçons en renvoi sont conformes au §6 dès lors que
  les exercices cités existent. **Les 2 références mortes sont corrigées** :
  `api-idempotency` → **`http-idempotency-dedup`**, `dlq-duplicate` → **`dlq-routing`**
  (+ suppression d'une redite que la citation morte avait introduite). Références mortes
  restantes : **0**, avec un contrôle rejouable (`scripts/v72/refs-mortes.mjs`) qu'aucun gate
  n'assurait. **P3 : 0 échec sur 128** — ma sonde en signalait 10, puis 1 ; lecture faite, zéro.
  **Neuvième occurrence** du défaut de méthode, attrapée avant publication.
  Seuils **C4** et **C5** : **atteints**. Corpus `d535fcf6…` → **`c1ac869e…`**.

## Tests

- **CP2** : 1420/1420 · tsc 0 · gates verts.
- **CP3** : 1420/1420 · tsc 0 · gates verts.
- **CP6** : 1420/1420 · gates verts · corpus inchangé.
- **CP8** : 1420/1420 · gates verts · corpus inchangé.
- **CP9** : 1420/1420 · gates verts · corpus `c1ac869e…`, 9 gels mis à jour.
- aucun serveur résiduel ; le démon Docker démarré pour la mesure a été arrêté.
