# Diagnostic résiduel — N1, N3, Y4 (2026-07-23)

> Phase **diagnostic uniquement**. Aucun contenu pédagogique, générateur, leçon, projet ni interface
> n'a été modifié. Seuls ce rapport et un script d'audit **en lecture seule**
> (`scripts/audit-residual-n1-n3-y4.mjs`) sont produits. **Aucune remédiation n'est engagée sans
> validation explicite.**

---

## 1. État Git initial

- **Branche** : `claude/ai-career-os-saas-phfg49`.
- **HEAD au démarrage de session** : `b01304a` (clôture Y2), working tree propre, synchronisé avec origin.
- **Micro-correction Y2 de cette session (Phase 1)** : commit `280e058` — distingue, dans les
  rapports, la **conformité structurelle automatisée (235/235)** de l'**audit manuel stratifié
  (16/16 A)**, sans prétendre à une relecture manuelle des 235 jours. Poussé, tree propre, synchronisé.
- Recalcul Y2 (fichiers réels) : **235 jours d'apprentissage, 705 questions, 0 générique, 0 !=3 puces,
  Y3 intact** (`git diff` sur `curriculum/solutions/` = vide). Chantier Y2 confirmé clôturé.

---

## 2. Définitions exactes de N1, N3, Y4 (formulations d'origine, `AUDIT_PEDAGOGIQUE_365.md`)

| Code | Sévérité d'origine | Formulation originale | Remède proposé à l'époque |
|---|---|---|---|
| **N1** | MINEUR (§9) | « **3 leçons orphelines** (jamais liées d'un jour) : `ci-cd`, `docker-containers`, `llm-observability`. Docker/CI sont pourtant enseignés (jours 307/320/326 DocSense) mais sans lier la leçon. » | Lier ces leçons depuis les jours DevOps/capstone concernés. |
| **N3** | MINEUR (§9) | « **Titre dupliqué** — Jours 314 et 321 : « DocSense : jalon démontrable » (deux jalons différents, même titre). » | Différencier les titres (préciser le jalon). |
| **Y4** | MOYEN (§8) | « **Critères de validation parfois subjectifs** — Jour 10 : « bilan() lisible sans effort », « Modèle du personnage cohérent » — non mesurables. (Jours 78/79 signalés par l'heuristique mais en réalité vérifiables.) » | Reformuler les critères subjectifs en critères observables. |

- Statut dans le rapport d'origine : regroupés dans le **« Chantier D — Finitions »** (§17), « effort
  faible, rapide », non prioritaire.

---

## 3. Méthode automatisée

Script **`scripts/audit-residual-n1-n3-y4.mjs`** (lecture seule ; ne régénère rien) :

- **N1** — parcourt les 365 fichiers `curriculum/days/day-*.md` rendus, extrait chaque lien
  `/doc/lessons/<slug>`, compte les jours référençant chaque leçon ; croise avec les **60** fichiers
  `curriculum/lessons/*.md`. Orpheline = 0 jour référent ; sous-référencée = 1-2 jours.
- **N3** — charge les 365 titres depuis `data/program.json`, détecte les doublons **exacts** et les
  doublons **sémantiques** (titres normalisés : minuscules, sans accents/ponctuation, formulations
  distinctes).
- **Y4** — extrait la section « Critères de validation » de chaque jour, flague les puces contenant un
  marqueur **subjectif** (`lisible`, `cohérent`, `propre`, `clair`, `sans effort`, `élégant`, …)
  **sans** ancrage **mesurable** sur la même puce (`tous`, un nombre, `%`, `passe`, `tests`, `aucun`,
  `jamais`, …).
- **Contexte** (hors périmètre) : jours 91-365 sans « Cas métier ».

---

## 4. Limites des heuristiques

- **N1** : mesure le lien **depuis les jours** ; une leçon « orpheline » côté jours peut rester
  **atteignable** via le catalogue `/doc/lessons`. Il faut donc vérifier manuellement si le contenu
  est réellement enseigné et si l'absence de lien est un vrai manque.
- **N3** : la normalisation attrape les doublons exacts et quasi-exacts, mais deux titres au **sens**
  proche mais aux mots différents peuvent passer entre les mailles ; vérification manuelle des jalons.
- **Y4** : marqueurs lexicaux → **bruyants**. Un « message clair » adossé à « jamais de stack trace »
  est en pratique testable ; un « pipeline lisible (montre-le à voix haute) » est un **dispositif
  pédagogique intentionnel**, pas un critère de notation défaillant. Chaque puce est relue.
- Aucun signal automatique n'est transformé en verdict sans lecture manuelle (Phase 4).

---

## 5. Résultats recalculés (depuis les fichiers actuels)

**N1 — leçons orphelines : 3 / 60** (identiques au diagnostic d'origine) :
- `ci-cd` (0 jour), `docker-containers` (0 jour), `llm-observability` (0 jour).
- Sous-référencées (contexte, non défaut) : `deployment-secrets` (1 : jour 68), `monitoring-production`
  (1 : jour 79), `observability-logging` (2 : jours 79, 85).

**N3 — titres dupliqués : 1 paire exacte** : « DocSense : jalon démontrable » → **jours 314 et 321**.
Doublons sémantiques (mots différents) : 0.

**Y4 — puces flaggées : 10**, réparties sur les jours **3, 10, 12, 23, 24, 46, 72, 342**.
Jours 78/79 (faux positifs signalés à l'origine) : **non flaggés** par l'heuristique actuelle → cohérent.

**Contexte** : jours 91-365 sans « Cas métier » : **0**.

---

## 6. Vérifications manuelles

**N1** — lecture des jours où le contenu est enseigné + de leurs liens de leçon rendus :
- Jour **307** « DocSense : setup et CI vide » → lie *architecture / cache / design système*, **pas** `ci-cd`.
- Jour **320** « DocSense : dockerisation » → lie *ai-evaluation / rag-evaluation / model-evaluation*, **pas** `docker-containers`.
- Jour **325** « DocSense : coûts et observabilité » → lie *agents…*, **pas** `llm-observability`.
- Jour **326** « DocSense : CI complète » → lie *agents…*, **pas** `ci-cd`.
- Jour **332** « DocSense : observabilité finale » → lie *ai-security…*, **pas** `llm-observability`.
- Cause racine : le lien de leçon d'un jour est piloté par `LESSON_BY_SKILL[day.skill]` ; ces jours
  capstone portent un `skill` de **projet** (rag/evalia/agents/secu) sans rapport avec le DevOps, d'où
  l'absence de lien vers la leçon fondamentale correspondante. Les 3 leçons **existent** (79-89 lignes
  chacune) et sont **présentes dans le catalogue** `data/program.json → lessons` (donc atteignables via
  `/doc/lessons`). → **contenu présent et atteignable, seul le renvoi contextuel depuis le jour manque.**

**N3** — lecture intégrale des jours 314 et 321 :
- **314** (semaine 45, compétence RAG) : jalon = *10 questions du corpus → réponses citées, sur machine
  propre, + revue d'architecture*. Synthèse des jours 309-313.
- **321** (semaine 46, compétence Évaluation IA) : jalon = *évaluation en une commande + dashboard de
  tendance + `docker compose up` sur machine propre + revue d'architecture*. Socle 317-320.
- → **Deux jalons hebdomadaires réellement différents portant un titre strictement identique.** Vrai
  défaut de désambiguïsation (navigation, sommaire, lisibilité portfolio).

**Y4** — relecture de chaque puce flaggée :
- **Jour 10** : « Modèle du personnage complet et **cohérent** » et « bilan() **lisible sans effort** »
  → **réellement subjectifs**, non mesurables. **Confirme** l'exemple du diagnostic d'origine.
- **Jour 3** : « git status "propre" **(tout est commité)** » → mesurable (le parenthétique définit le
  test) = faux positif ; « Historique **lisible** : `git log --oneline` raconte la journée » → soft
  mais dispositif de débutant, vérifiable par inspection (borderline, faible enjeu).
- **Jour 12** : « journal.json **indenté** et lisible » → « indenté » est mesurable (`JSON.stringify(…,2)`)
  et porte la puce → faux positif dominant.
- **Jour 23** : « justifications qui tiennent en **une phrase** claire » → contrainte de longueur
  mesurable + « claire » soft (borderline, faible enjeu).
- **Jour 24** : « pipeline lisible (**montre-le à voix haute : il doit se raconter**) » → **dispositif
  pédagogique intentionnel** (test à l'oral), pas un critère de notation défaillant → faux positif.
- **Jour 46** : « Tout id invalide → message clair, **jamais de stack trace** » → cœur testable
  (jamais de stack trace, tout id géré) → faux positif dominant.
- **Jour 72** : « erreur simulée **arrête le script** avec un message clair » → cœur testable (le
  script s'arrête, exit≠0) → faux positif dominant.
- **Jour 342** : « Le livrable est produit et correspond à : Portfolio relu et **cohérent** » →
  **ligne générée** (gabarit « Le livrable est produit et correspond à : {deliverable} » sur tout le
  palier 91-365) ; la subjectivité vient du texte du livrable, pas d'un critère rédigé à la main →
  faux positif au sens de Y4 (défaut systémique de gabarit, pas un critère isolé).

---

## 7. Faux positifs invalidés

- **Y4** : jours **3 (2e puce partielle), 12, 24, 46, 72, 342** → faux positifs (ancrage mesurable
  présent, ou dispositif à l'oral intentionnel, ou ligne de gabarit générée). Jours **78/79** :
  déjà invalidés à l'origine, non re-signalés.
- **N1 sous-référencées** (`deployment-secrets`, `monitoring-production`, `observability-logging`) :
  **liées au moins une fois** → non orphelines ; faible usage normal pour des leçons de niche → **pas**
  un défaut.

---

## 8. Défauts réels confirmés

- **N1** : **3 leçons fondamentales non liées** depuis les jours qui enseignent précisément leur sujet
  (307/320/325/326/332). Contenu présent et atteignable par le catalogue, mais **renvoi contextuel
  manquant**. Défaut réel, **mineur**.
- **N3** : **titre strictement identique** sur deux jalons hebdomadaires différents (**314** RAG vs
  **321** Évaluation IA). Défaut réel, **mineur**.
- **Y4** : **jour 10** — 2 critères réellement subjectifs (« cohérent », « lisible sans effort »).
  Défaut réel, **ponctuel** (le motif n'est **pas** systémique : concentré sur quelques jours du socle
  1-90, pas les 235 jours).

---

## 9. Classement A / B / C

| Élément | Classe | Justification |
|---|---|---|
| **N1** — 3 leçons orphelines (307/320/325/326/332) | **B** | Amélioration ciblée utile : ajouter le renvoi de leçon sur ces jours. Contenu déjà présent → pas C. |
| **N3** — titre 314 / 321 identique | **B** | Désambiguïsation utile (2 mots par titre). Aucun contenu à réécrire → pas C. |
| **Y4 — jour 10** (2 critères) | **B** | Reformuler 2 critères en observables. Ponctuel. |
| Y4 — jours 3, 12, 23, 24, 46, 72, 342 | **A** | Faux positifs / dispositifs intentionnels / gabarit généré. Aucun changement justifié. |
| N1 — leçons sous-référencées | **A** | Liées au moins une fois ; faible usage normal. |
| Cas métier 91-365 (contexte) | **A** | 0 manquant. |

**Aucun défaut de classe C** (aucun défaut systémique nécessitant une remédiation large).

---

## 10. Impact pédagogique et recruteur

- **N1** : impact pédagogique **faible** — le contenu Docker/CI/observabilité est **enseigné dans le
  jour**, seul le lien vers la leçon d'approfondissement manque ; l'apprenant peut atteindre la leçon
  par le catalogue. Impact recruteur **nul** (cross-link interne).
- **N3** : impact pédagogique **faible**, impact **navigation/portfolio léger** — deux entrées
  identiques dans un sommaire prêtent à confusion quand on présente le parcours.
- **Y4** : impact pédagogique **faible et localisé** — critères d'auto-évaluation internes ; « cohérent
  / lisible » restent compréhensibles au niveau du jour 10. Impact recruteur **nul** (non exposé au
  portfolio).

---

## 11. Recommandations

- **N1 → OPTION B** : sur les 5 jours concernés, ajouter un `lessonsOverride` incluant la leçon
  fondamentale correspondante (`ci-cd`, `docker-containers`, `llm-observability`), **en plus** des
  leçons de projet déjà affichées. Aucun contenu de jour ni de leçon modifié.
- **N3 → OPTION B** : différencier les deux titres, p.ex. « DocSense : jalon démontrable — RAG
  bout-en-bout » (314) et « DocSense : jalon démontrable — évaluation & reproductibilité » (321).
- **Y4 → OPTION B minimale** : reformuler les 2 critères du jour 10 en observables (p.ex. « bilan()
  affiche les 4 champs attendus dans l'ordre » ; « le personnage a tous les champs du modèle et aucun
  incohérent avec le scénario »). Laisser les faux positifs inchangés (A).

**Globalement : les trois anomalies sont réelles mais MINEURES et ISOLÉES → une remédiation B ciblée,
optionnelle, à faible risque. Aucune OPTION C justifiée.**

---

## 12. Périmètre précis d'une éventuelle remédiation

- **N1** : 5 jours (307, 320, 325, 326, 332) — ajout d'un `lessonsOverride` dans une source
  d'enrichissement (`scripts/data/…`), régénération, contrôle que **seul** le bloc « Leçon(s) de fond »
  change sur ces 5 jours.
- **N3** : 2 titres (jours 314, 321) — champ `title` dans la source du programme, régénération, contrôle
  que **seul** le titre change sur ces 2 jours (H1 + en-tête + éventuels renvois).
- **Y4** : 2 critères du jour 10 — source des critères du jour 10, régénération, contrôle que **seule**
  la section « Critères de validation » du jour 10 change.

---

## 13. Fichiers qui seraient modifiés (si remédiation validée)

- N1 : une source `scripts/data/*.mjs` (override de leçons) + `scripts/generate-curriculum.mjs` (câblage
  si nécessaire) → régénère `curriculum/days/day-{307,320,325,326,332}.md` + `data/program.json`.
- N3 : la source de titres (jours 314/321) → régénère `curriculum/days/day-{314,321}.md`,
  `week-45/46.md`, `month-11.md`, `data/program.json`.
- Y4 : la source des critères du jour 10 → régénère `curriculum/days/day-010.md` (+ éventuellement sa
  correction si les critères y sont repris).

---

## 14. Risques de régression

- **N1** : très faible — ajout de liens ; risque = doublonner une leçon déjà présente (vérifiable).
- **N3** : faible — un titre est réutilisé dans les pages semaine/mois et les liens ; vérifier que la
  désambiguïsation se propage partout (régénération globale).
- **Y4** : faible — critères repris dans la correction du jour 10 (à resynchroniser).
- Risque **transversal** : toute remédiation passe par le **générateur** → doit être isolée par jour
  (mécanisme merge/override déjà éprouvé sur Y2) pour ne pas toucher d'autres rubriques. `program.json`
  ne diffère que par l'horodatage à restaurer si aucune donnée ne change.

---

## 15. Options de décision

- **OPTION A — ne rien modifier.** Défendable : les trois anomalies sont mineures, isolées, sans impact
  recruteur, et N1 reste atteignable par le catalogue. Le curriculum reste cohérent.
- **OPTION B — corrections minimales ciblées** *(recommandée)* : N1 (5 renvois de leçon), N3 (2 titres),
  Y4 (2 critères du jour 10). Effort faible, risque faible, gain de finition. **Ne touche aucun autre
  jour, aucune correction de fond, aucune interface.**
- **OPTION C — remédiation large** : **non justifiée** — aucun défaut systémique démontré. À écarter.

---

## Verdict

| Anomalie | Réelle ? | Sévérité recalculée | Classe | Recommandation |
|---|---|---|---|---|
| **N1** — 3 leçons orphelines | Oui | Mineure | B | OPTION B (renvois sur 5 jours) |
| **N3** — titre 314/321 identique | Oui | Mineure | B | OPTION B (2 titres désambiguïsés) |
| **Y4** — critères subjectifs | Oui, ponctuel (jour 10) ; reste = faux positifs | Faible/localisée | B (jour 10) / A (reste) | OPTION B minimale (jour 10) |

**Décision recommandée : OPTION B ciblée pour les trois, exécutée par le mécanisme d'enrichissement
isolé, avec régénération contrôlée.** En attente de validation explicite avant toute remédiation.
