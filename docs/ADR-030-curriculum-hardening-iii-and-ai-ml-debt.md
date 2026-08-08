# ADR-030 — Core Curriculum Hardening III : Backend/API + AI/ML historical debt (+ décision runtime SQL)

Statut : accepté (Sprint V30). Décision fondée sur l'audit CP0 réel (état vérifié, non
supposé). **Priorité produit : qualité pédagogique des cours > cohérence des parcours >
progression néophyte > articulation théorie→pratique→mission→compétence→preuve > qualité
technique > fonctionnalités.** Local, mono-utilisateur, sans auth, sans SaaS, sans réseau
requis, **sans nouveau moteur** (progression, exercices, missions, preuves, compétences,
catalogue, glossaire, runtimes restent uniques).

## Problème produit (établi au CP0)

Après V29, les chaînes **Frontend/React** (5 leçons) et **Data/SQL** (8 leçons) sont bâties
et conformes (P3, pratique reliée), et le socle P0 de premier contact est résorbé. Le
déséquilibre s'est déplacé :

1. **Dette AI/ML historique majeure.** 23 leçons (Python & ML 8 + IA appliquée 15) — le
   cœur du parcours phare *AI Engineer — Foundations* — sont au vieux gabarit. **6 sont
   P0** de premier contact (sans rampe, sans prérequis, sans modèle mental) :
   `statistics-for-ml`, `machine-learning-basics`, `llm-fundamentals`, `agents-fundamentals`,
   `ai-security` (+ `api-design-basics` côté backend). **Aucune** de ces 23 leçons n'a de
   `practiceRefs` (sauf `python-foundations`). C'est le déséquilibre exact que le sprint doit
   corriger : les fondations IA ne peuvent pas rester médiocres pendant que Cloud/SRE
   excellent.
2. **Dette Backend/API.** `api-design-basics` (P0), `express-backend`, `authentication`,
   `async-javascript` (P1) sans rampe/prérequis explicites, **sans practiceRefs**, alors que
   la pratique existe (`api-router`, `http-status`, `http-method-idempotent`, `validate-user`).
3. **Trou Software Engineering : documentation technique.** Aucune leçon dédiée aux artefacts
   ADR/RFC/HLD/HSD/TSD/LLD/runbook/post-mortem/changelog, ni aux types de maintenance
   (corrective/adaptative/préventive/évolutive) ; seul `readme-documentation` existe.

## Découverte CP0 déterminante — recalibrer l'effort

Le prompt V30 liste de nombreux candidats React et Data. **Mais V29 a déjà bâti ces deux
chaînes.** Créer de nouvelles leçons React/Data « pour faire nombre » serait de la quantité
au détriment de la qualité — explicitement interdit. **Décision : concentrer l'effort V30 sur
la dette réelle** (AI/ML, Backend/API, documentation SE, liaison pratique), avec
durcissements ADDITIFS (contenu conservé), et ne créer une leçon que si un trou conceptuel
est avéré.

## Décision 1 — Backend/API : durcir + relier (CP3)
Durcir `api-design-basics` (P0), `express-backend`, `authentication`, `async-javascript`
(rampe « Le problème d'abord » + prérequis rédigés + modèle mental si absent + titres
homogénéisés) et les relier aux exercices EXISTANTS (`api-router`, `http-status`,
`http-method-idempotent`, `validate-user`). Créer 0–1 leçon seulement si un trou est avéré.

## Décision 2 — AI/ML historical debt : audit + correction d'un sous-ensemble prioritaire (CP8)
**CP critique.** Auditer les 23 leçons AI/ML, classer P0→P3, et corriger de façon ADDITIVE un
**sous-ensemble réellement prioritaire** (les P0 de premier contact + les plus fondamentales,
~5–7), plutôt qu'un traitement superficiel des 23. Exigence spécifique : lorsqu'une notion
mathématique est nécessaire, l'expliquer INTUITIVEMENT, préciser le niveau requis, la relier à
un prérequis, ne pas la masquer derrière une formule. La dette restante est documentée pour
V31/V32.

## Décision 3 — Software Engineering : combler le trou documentation (CP6)
Créer une leçon de fond sur la **documentation technique** (quel artefact — ADR/RFC/HLD/HSD/
TSD/LLD/runbook/post-mortem/changelog — pour qui, quand) et couvrir les **types de
maintenance** (corrective/adaptative/préventive/évolutive) là où c'est pédagogiquement
manquant. Se référer à V17/V21/V28/V29, ne pas dupliquer.

## Décision 4 — Runtime SQL : Option A retenue (raisonnement relationnel node-js)
Trois options évaluées :
- **A. Conserver le raisonnement relationnel déterministe en `node-js`** (statu quo V29), les
  lignes étant des tableaux d'objets, l'apprenant implémentant la logique JOIN/GROUP BY/N+1.
- **B. Introduire un runtime SQL local léger** (SQLite/DuckDB).
- **C. Autre solution.**

| Critère | A (node-js) | B (SQLite/DuckDB) |
|---|---|---|
| Valeur pédagogique | Bonne (raisonnement relationnel) | Meilleure (vrai SQL) |
| Sécurité / isolation | Excellente (aucune surface nouvelle) | À sécuriser (accès fichier, sandbox) |
| Complexité / maintenance | Nulle (existant) | Élevée (nouveau runtime, adaptateur, tests) |
| Déterminisme | Total | Bon mais dépendant du moteur |
| « Pas de second moteur » | Respecté | **Violé** (nouveau moteur d'exécution) |
| Fuite de solutions | Contrôlée (contrat existant) | À re-vérifier |

**Décision : Option A pour V30.** L'Option B apporte un gain réel mais introduit un nouveau
runtime — contraire au garde-fou « pas de second moteur d'exécution » — pour un coût de
maintenance/sécurité non justifié à ce stade. **B est documentée comme piste future
sérieuse** (V31+), à rouvrir si un besoin pédagogique décisif émerge. Les leçons et exercices
SQL **indiquent explicitement** que la pratique est un raisonnement relationnel simulé, pas un
vrai SGBD.

## Décision 5 — React II & Data/SQL : audit puis durcissements ciblés (CP4/CP5)
Ces chaînes étant déjà bâties (V29), V30 les AUDITE et n'y applique que des durcissements
ciblés si un trou est avéré ; **aucune leçon forcée**. `frontend-engineer-v1` / `data-ml-v1`
restent `announced`.

## Décision 6 — Réutiliser le moteur d'audit + gate `v30:check`
Étendre `lib/pedagogy-audit.mjs` et le format de ledger ; nouveau `scripts/v30-check.mjs`
(esprit v27/v28/v29) validant le périmètre V30 déclaré, avec les mêmes contrôles structurels
et les signaux pédagogiques (densité, jargon « à froid ») en proxy non bloquant.
`v26/v27/v28/v29:check` restent actifs. Attention aux faux positifs du scan d'authoring
(`à compléter`, `TODO`, `XXX`/`useXxx`) : reformuler la prose, jamais affaiblir le gate.

## Alternatives rejetées
- **Introduire un runtime SQL en V30** : rejeté (cf. Décision 4).
- **Créer de nouvelles leçons React/Data pour couvrir la liste du prompt** : rejeté — chaînes
  déjà bâties en V29 ; ce serait de la quantité au détriment de la qualité.
- **Corriger les 23 leçons AI/ML d'un coup** : rejeté — traitement superficiel interdit ;
  correction d'un sous-ensemble prioritaire, reste documenté.
- **Promouvoir les parcours Frontend/Data** : rejeté sans curation jour-par-jour (greenwashing).

## Risques et limites
- La pratique SQL/données reste SIMULÉE en JS (étiquetée).
- L'audit AI/ML est partiel par conception (P0 prioritaires) ; la dette P1/P2 reste documentée.
- Les scores d'audit et heuristiques (densité, jargon) sont des proxys ; le walkthrough
  néophyte (CP11) reste une lecture experte, pas un test utilisateur.

## Migration additive
Durcissement de leçons, ajout de `practiceRefs`, éventuels exercices/playbooks, un gate et un
ledger, enrichissement du glossaire. Aucune donnée détruite, aucun jour réécrit,
`progress.json` (runtime, gitignoré) sauvegardé et restauré.
