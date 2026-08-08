# HSD-029 — Spécification pédagogique : socle, Frontend/React, Data/SQL, SE

Document de spécification humaine du Sprint V29. Complète ADR-029 (décisions) et
TSD-029 (spécification technique). Décrit CE QUE doivent enseigner les leçons corrigées
et créées, et COMMENT on relie chaque leçon à une pratique RÉELLE existante.

## 1. Contrat de leçon V29 (rappel V27/V28, appliqué à V29)

Chemin néophyte : **situation → intuition → vocabulaire → mécanisme → pratique**. Chaque
leçon importante vise : `🌍 Le problème d'abord` → `🎯 Objectif` → `🧩 Prérequis` →
`🧠 Modèle mental` → explication progressive (concret → abstrait) → exemple minimal →
`🧭 Exemple guidé` → variantes/contre-exemple → `⚠️ Erreurs fréquentes` →
(`🚨 Que faire dans ce cas ?` si pertinent) → `🧾 À retenir` → `📚 Vocabulaire` →
`🔗 Liens` + `practiceRefs`. La structure SERT la compréhension ; ce n'est pas un
gabarit à cocher. Une leçon longue n'est pas automatiquement profonde.

## 2. Critère « néophyte complet » (règle non négociable)

« Une personne qui ne connaît pas encore cette technologie pourrait-elle comprendre
POURQUOI le concept existe, construire un modèle mental correct, puis l'appliquer sans
recopier aveuglément ? » Si non, la leçon n'est pas au niveau.

- **React** : ouvrir sur « une page interactive doit rester synchronisée avec des
  données qui changent ; modifier le DOM à la main devient vite fragile » — AVANT
  Virtual DOM / hooks / reconciliation.
- **SQL** : ouvrir sur « une question métier sur un grand ensemble de données » — AVANT
  SELECT/JOIN/index.
- **Tests** : ouvrir sur « comment savoir qu'une modification n'a rien cassé sans tout
  re-cliquer ? » — AVANT unit/integration/pyramide.
- **Dette technique** : ouvrir sur « pourquoi ajouter une petite fonctionnalité prend
  soudain trois jours ? » — AVANT principal/intérêt.

## 3. Modèles mentaux stables à installer

- React : `state → render → UI → interaction → nouveau state → nouveau render`.
- SQL : `question métier → ensemble de lignes → filtrage/jointure/agrégation → résultat`.
- Tests : `arrange → act → assert` ; la pyramide comme heuristique, pas dogme.
- Architecture : `contraintes → responsabilités → frontières → dépendances → compromis`.
- Dette technique : `principal + intérêt` ; décision de risque, pas « mauvais code ».

## 4. Dette P0 de premier contact à corriger (CP3)

`terminal-shell-filesystem`, `git-fundamentals`, `sql-foundations`,
`data-structures-intro`, `typescript-basics`. Correction ADDITIVE (contenu technique
conservé) : on-ramp + prérequis rédigés + modèle mental si absent + titres homogénéisés
+ `practiceRefs` vers exercices EXISTANTS.

- **typescript-basics** : insister sur compile-time vs runtime — TypeScript **ne valide
  PAS** les données à l'exécution ; il faut valider aux frontières. Relier aux 15 exos
  `ts-*`.
- **sql-foundations** : modèle relationnel (relation/ligne/colonne, clé primaire/
  étrangère), question métier avant syntaxe. Pratique = raisonnement relationnel en JS
  (cf. §7).
- **data-structures-intro** : introduire CHAQUE structure par le problème qu'elle résout
  (tableau, liste, stack, queue, set, map/hash map, arbre, graphe) ; coût des opérations
  et compromis mémoire/temps ; Big-O comme outil de comparaison, pas concours.
- **terminal / git** : premier contact absolu ; rampe très concrète, zéro jargon non
  introduit.

## 5. Corpus Frontend/React (CP4)

Durcir `react-fundamentals`, `react-hooks-effects` ; créer les leçons manquantes pour un
modèle de rendu correct. Découpage indicatif (adaptable, qualité > quantité) :

1. **navigateur, DOM & rendu** — HTML/CSS/JS et rôle de chacun ; le DOM ; pourquoi
   manipuler le DOM à la main devient fragile quand l'état change (le problème que React
   résout).
2. **React : le modèle déclaratif** — décrire l'UI en fonction de l'état plutôt que la
   muter ; reconciliation à haut niveau ; ce que React fait pour toi.
3. **composants, JSX & props** — composition, props en entrée, réutilisation.
4. **state, events & cycle de rendu** — `useState`, re-render, state dérivé vs stocké.
5. **listes, keys, formulaires & state lifting** — pourquoi les keys, controlled
   components, remontée d'état.
6. **hooks & useEffect** — modèle mental des effets ; dépendances ; cleanup ;
   synchronisation avec l'extérieur ; états loading/error/empty/success ; race
   conditions de base ; custom hooks.
7. **architecture React** — composition, context, organisation de l'état, quand
   mémoïser (seulement si justifié), accessibilité, tests de composants.

**Interdits** : enseigner les hooks comme une liste de recettes ; transformer une leçon
en encyclopédie ; introduire `useMemo`/`useCallback` comme réflexe. Chaque leçon reliée
aux exercices `react-tsx`/`web` existants (react-hello, react-counter, react-toggle,
react-conditional, react-list, react-form-name, react-lift-state, react-search, web-*…).

## 6. Corpus Data/SQL (CP5)

Durcir `database-modeling` ; créer les leçons comblant la progression : requêtes
fondamentales & jointures ; index & plans d'exécution (niveau pédagogique) ; transactions,
ACID, isolation, concurrence ; migrations & compatibilité ; N+1 & performance. Enseigner
à RAISONNER sur les données, pas seulement écrire des requêtes.

## 7. Pratique SQL sans runtime SQL (décision honnête)

Le moteur n'a pas de runtime SQL et V29 n'en ajoute pas. La pratique « données » se fait
en `node-js` : les lignes sont des tableaux d'objets, et l'apprenant implémente la LOGIQUE
d'un JOIN / GROUP BY / agrégation / déduplication / détection de N+1. Les leçons disent
explicitement : « ceci entraîne le raisonnement relationnel, pas l'exécution d'un vrai
SGBD ». Aucune fausse exécution SQL n'est présentée comme réelle.

## 8. Corpus Software Engineering / Testing / Architecture (CP6)

Durcir `testing-foundations`, `error-handling`, `design-patterns-intro`,
`architecture-basics` ; créer les leçons pro manquantes : tests de caractérisation &
régression ; refactoring sûr / code legacy ; dette technique (principal/intérêt,
volontaire/accidentelle, dimensions code/archi/test/data/infra/doc, priorisation,
prévention) ; sécurité de livraison (breaking change, compatibilité descendante,
dépréciation, changelog, hotfix/bugfix/patch, feature flags, rollback vs roll-forward,
smoke test, vérification post-déploiement). Se référer à V17/V18/V21/V28, ne pas dupliquer.

## 9. « Que faire dans ce cas ? » (CP8) — méthode, jamais « redémarre »

1. symptômes → 2. impact → 3. collecte de preuves → 4. containment → 5. diagnostic →
6. hypothèses → 7. correction minimale → 8. validation → 9. déploiement → 10. surveillance
→ 11. documentation → 12. prévention. Scénarios prioritaires V29 : régression après merge,
feature qui en casse une autre, test flaky en CI, requête SQL devenue lente, migration
incompatible, hotfix production, choix rollback vs roll-forward, feature flag, smoke test,
vérification post-déploiement, maintenance d'un module legacy.

## 10. Anti-slop (qualité académique)

Interdits : paragraphe répété entre leçons, définition circulaire, phrase générique
applicable à n'importe quelle techno, exemple décoratif, conclusion qui paraphrase
l'intro, section présente pour cocher un gabarit, faux « avancé » par accumulation de
vocabulaire, 15 concepts nouveaux d'un coup, dépendance non enseignée, lien mort, API
utilisée avant d'être expliquée, terme non défini, code non expliqué, pratique déconnectée
de la théorie.

## 11. Rôle de CP11

Ré-auditer : (A) leçons créées V29 ; (B) leçons historiques modifiées (avant/après) ;
(C) échantillon d'historiques NON modifiées de plusieurs époques (pré-V26, V26, V28,
AI/ML) ; (D) beginner walkthrough sur ≥ 2 séquences (frontend et backend). Produire
`docs/PEDAGOGICAL-AUDIT-V29.md`. Rejouer toute la batterie après toute modification.

## 12. Honnêteté réel/simulé (non négociable)

La pratique SQL est simulée en JS (raisonnement relationnel), étiquetée. Les exercices
React sont notés par rendu serveur (réel, préexistant). Aucun faux secret, aucune fuite
de solution/test privé, aucune affirmation simulée présentée comme réelle.
