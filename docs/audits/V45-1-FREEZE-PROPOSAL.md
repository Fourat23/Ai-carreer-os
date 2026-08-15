# V45.1 — CURRICULUM FREEZE PROPOSAL

Audit **lecture seule**. Propose des ZONES DE FREEZE : parties du curriculum stables, sur lesquelles un
apprenant peut investir sans craindre que son travail soit invalidé par une évolution future. Une zone
FREEZE = ordre stabilisé + concepts stabilisés + aucun changement futur sauf bug pédagogique démontré +
tout nouveau contenu additif ou versionné.

## Test de non-caducité
« Si l'utilisateur fait les 30 premiers jours aujourd'hui, un changement futur les rendra-t-il caducs ? »
→ **Non.** M1-M2 (fondations JS/algo/DS/git) sont CERTIFIED, praticables, et structurellement stables
depuis de nombreux sprints. Le travail d'un apprenant sur cette zone est sûr.

## Zones de freeze proposées

| Zone | Périmètre | Statut | Justification |
|---|---|---|---|
| **FREEZE-FOUNDATIONS** | terminal, git, JS, algo, recursion, DS, TS, async (M1-M2) | ✅ GELABLE | CERTIFIED + praticable + ordre éprouvé ; base de tout le reste |
| **FREEZE-WEB-PLATFORM** | HTML, CSS (fund/flex/grid), responsive, forms, TS-frontend, DOM | ✅ GELABLE | CERTIFIED + praticable ; concepts web stables |
| **FREEZE-FRONTEND-REACT** | react-fundamentals/hooks/composition/states/accessibility/testing/performance | ✅ GELABLE (hors Next.js) | React pur CERTIFIED + praticable ; Next.js reste hors freeze (pratique manquante) |
| **FREEZE-BACKEND** | http-rest, api-design, express, auth, api-production, caching | ✅ GELABLE | CERTIFIED + praticable ; contrats d'API stables |
| **FREEZE-DATA-SQL** | sql-foundations, modeling, indexing, transactions, migrations | ◐ GELABLE-PROSE | prose CERTIFIED + stable ; pratique SQL mince (à étoffer, additif) |
| **FREEZE-PYTHON-LANG** | python-foundations | ✅ GELABLE | CERTIFIED + praticable |
| **FREEZE-SWE-CORE** | clean-code, testing, error-handling, refactoring, technical-debt, breaking-changes, architecture, async-messaging | ✅ GELABLE-PROSE | prose CERTIFIED + stable (patterns/archi pratique à ajouter, additif) |
| **FREEZE-SYSTEMS-LINUX** | linux-* (5) | ✅ GELABLE | CERTIFIED + praticable |
| **FREEZE-CONCEPTS-IA** | llm-fundamentals, prompt-engineering, embeddings, rag-fundamentals, chunking, retrieval, ai-evaluation, agents-fundamentals, ai-security (PROSE) | ◐ GELABLE-PROSE | prose FORTE et stable ; la PRATIQUE viendra en V46 de façon ADDITIVE (n'invalide pas la prose) |

## Zones NON gelables encore (instables)

| Zone | Raison |
|---|---|
| **Next.js** (foundations/rendering/server-client/data-production) | pratique exécutable absente ; syntaxe framework versionnée par nature |
| **Pratique ML / IA / Cloud / K8s / Docker** | inexistante en code ; V46 va l'ajouter → la STRUCTURE de pratique n'est pas figée |
| **Ordre M6-M12 vis-à-vis de la réactivation** | la cohérence 365j signale un risque d'oubli (pas de réactivation JS/React) ; un ajout de jours de réactivation pourrait décaler la séquence |
| **Cloud AWS/Azure spécifiques** | prose stable mais dépendante de services évolutifs (versionner) |

## Politique de changement (contraignante pour V46+)

Pour une leçon en zone FREEZE :
- **AUTORISÉ** : corriger une erreur, clarifier, ajouter un exemple, enrichir, **ajouter de la pratique**,
  améliorer la formulation.
- **INTERDIT sans migration explicite** : changer l'objectif pédagogique, changer brutalement le niveau,
  déplacer la leçon dans le graphe, supprimer un prérequis fondamental, changer son identité, invalider
  une progression existante.

Toute restructuration future doit produire **MIGRATION IMPACT** + **LEARNER PROGRESS COMPATIBILITY**
(la progression `data/progress.json` ne doit jamais être invalidée silencieusement).

## Recommandation
Geler dès maintenant FREEZE-FOUNDATIONS, FREEZE-WEB-PLATFORM, FREEZE-FRONTEND-REACT (hors Next.js),
FREEZE-BACKEND, FREEZE-PYTHON-LANG, FREEZE-SYSTEMS-LINUX. Ce sont les zones où développement et
apprentissage peuvent avancer EN PARALLÈLE sans risque. Les zones GELABLE-PROSE (Data/SQL, SWE-core,
Concepts-IA) sont gelées côté prose : V46 ajoute de la pratique sans toucher les leçons.
