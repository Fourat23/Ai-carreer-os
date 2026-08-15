# V45.1 — WALKTHROUGHS NÉOPHYTE (CP13)

Audit **lecture seule**. 12 parcours SIMULÉS COGNITIVEMENT : je me mets à la place d'un débutant qui
connaît EXACTEMENT les prérequis déclarés et rien de plus, et je suis le corpus. But : détecter
confusions, prérequis fantômes, sauts. Chaque walkthrough : départ → leçons → confusions → acquis réels
→ capacité finale (EXPLIQUER / RECONNAÎTRE / APPLIQUER / DIAGNOSTIQUER / FAIRE).

---

## 1. JS débutant (M1)
- **Départ** : aucune programmation. **Leçons** : terminal → git-fundamentals → javascript-basics.
- **Confusions possibles** : valeur vs référence (mais la leçon l'anticipe explicitement avec analogie) ;
  `===` vs `==` (traité). Aucun prérequis fantôme : tout est construit de zéro.
- **Acquis réels** : types, tableaux/objets, fonctions, immutabilité + exos exécutés (js-conditions,
  js-loops, js-array-objects).
- **Capacité** : EXPLIQUER ✅ · APPLIQUER ✅ (exos verts) · FAIRE ✅ (petits programmes). **Parcours fluide.**

## 2. Git / Linux (M1)
- **Départ** : sait ouvrir un terminal (acquis leçon 1). **Leçons** : terminal → git-fundamentals →
  (plus tard) linux-*.
- **Confusions** : staging (mais `git add -p` présenté comme prof) ; conflits (dédramatisés).
- **Acquis** : commits cohérents, branches, conflits ; exos git-commit-grouping, sh-exit-retry.
- **Capacité** : APPLIQUER ✅ · FAIRE ✅. **Fluide.**

## 3. Algorithmique (M1-2)
- **Départ** : boucles/conditions/fonctions (JS). **Leçons** : algorithmic-thinking → recursion →
  data-structures-intro.
- **Confusions** : Big-O (introduit par intuition) ; récursion (poupées russes + leap of faith aident).
  **Note** : recursion et data-structures ont peu de pratique EXÉCUTABLE dédiée (recursion : inline).
- **Acquis** : méthode 6 étapes, patterns, coûts ; exos algo-two-sum, algo-binary-search, ds-stack.
- **Capacité** : EXPLIQUER ✅ · APPLIQUER ✅ · DIAGNOSTIQUER ◐. **Solide** (récursion à renforcer côté pratique).

## 4. TypeScript (M2)
- **Départ** : JS solide. **Leçons** : typescript-basics → (M4) typescript-frontend.
- **Confusions** : types disparaissent à l'exécution (explicité) ; génériques (exemple concret).
- **Acquis** : interfaces, unions, unknown vs any ; exos ts-greeter, ts-interface-cart, ts-generic-first.
- **Capacité** : APPLIQUER ✅ · FAIRE ✅. **Fluide.**

## 5. Web HTML/CSS (M3-4)
- **Départ** : JS/DOM. **Leçons** : html-semantic → css-fundamentals → flexbox → grid → responsive.
- **Confusions** : cascade/spécificité (dense mais structuré) ; Flexbox vs Grid (règle « 1 vs 2
  directions »).
- **Acquis** : sémantique, box model, layouts ; exos web-semantic, css-specificity, css-box-size.
- **Capacité** : APPLIQUER ✅ · FAIRE ✅ (rendu web réel). **Solide.**

## 6. React (M4)
- **Départ** : JS/TS + DOM. **Leçons** : browser-dom → react-fundamentals → hooks-effects →
  composition → states → accessibility.
- **Confusions** : UI=fn(state) (bascule bien amenée) ; useEffect (la leçon traite frontalement le
  piège lifecycle). Prérequis satisfaits.
- **Acquis** : composants, état, effets, lifting ; exos react-*, react-debug-list.
- **Capacité** : APPLIQUER ✅ · DIAGNOSTIQUER ✅ (debug) · FAIRE ✅. **Solide.**

## 7. Backend (M3)
- **Départ** : JS/HTTP. **Leçons** : http-rest-json → api-design → express-backend → authentication →
  api-production-contracts.
- **Confusions** : idempotence/pagination (traitées) ; authn vs authz (badge/portes).
- **Acquis** : routes, middlewares, statuts, contrats ; exos api-router, http-status, auth-status,
  http-idempotency-dedup.
- **Capacité** : APPLIQUER ✅ · FAIRE ✅. **Solide** (system-design reste conceptuel).

## 8. SQL (M3, M5)
- **Départ** : tableaux d'objets (JS). **Leçons** : sql-foundations → database-modeling →
  sql-performance-indexing → transactions → migrations.
- **Confusions** : déclaratif (pont explicite avec filter/map) ; index (analogie du livre).
- **Acquis** : jointures, agrégations, index ; exos sql-inner-join, sql-left-join-nulls,
  sql-group-having (**pratique mince : 5 exos**).
- **Capacité** : APPLIQUER ✅ (basique) · FAIRE ◐ (pratique à étoffer). **Correct.**

## 9. Python / Data (M5)
- **Départ** : JS (concepts). **Leçons** : python-foundations → pandas-data-wrangling →
  data-cleaning-quality → etl-pipelines → statistics-for-ml.
- **Confusions** : indentation=structure (explicité) ; **pandas décrit mais PAS pratiqué en code**
  (l'apprenant lit, ne manipule pas de DataFrame ici).
- **Acquis** : Python (exos py-*), intuition data. **Manque** : geste pandas/ETL réel.
- **Capacité** : Python FAIRE ✅ ; data APPLIQUER ◐ / FAIRE ✗. **Correct pour Python, incomplet pour data.**

## 10. ML (M6)
- **Départ** : Python + stats. **Leçons** : ml-basics → feature-engineering → model-evaluation →
  scikit-learn-workflow → neural-networks.
- **Confusions** : overfitting/leakage (traités, misconceptions) ; **aucun code ML exécuté** (sklearn
  décrit, jamais lancé).
- **Acquis** : EXPLIQUER/RECONNAÎTRE/DIAGNOSTIQUER le ML (assessments, défis). **Manque** : entraîner/
  évaluer un modèle de ses mains.
- **Capacité** : EXPLIQUER ✅ · DIAGNOSTIQUER ◐ · FAIRE ✗. **Comprend le ML, ne le pratique pas.**

## 11. Cloud / Docker / K8s (M10-11 + systèmes)
- **Départ** : Linux/réseau/conteneurs. **Leçons** : docker-* → k8s-* → cloud-*.
- **Confusions** : déclaratif/réconciliation (bien amené) ; **pas de kubectl/docker réel** — labs
  SIMULÉS (raisonnement sur manifestes).
- **Acquis** : RECONNAÎTRE/DIAGNOSTIQUER une architecture (labs, exos k8s-* thématiques). **Manque** :
  opérer un vrai cluster.
- **Capacité** : EXPLIQUER ✅ · DIAGNOSTIQUER ◐ (simulé) · FAIRE ✗. **Raisonne l'infra, ne l'opère pas.**

## 12. IA / RAG / Agents (M8-11)
- **Départ** : Python, LLM-fundamentals. **Leçons** : embeddings → rag-fundamentals → chunking →
  retrieval → ai-evaluation → agents-fundamentals → ai-security.
- **Confusions** : rien de bloquant — les leçons sont FORTES et anticipent les pièges (retrieval vs
  génération, texte-exécutable). **Mais aucun pipeline RAG/agent construit en code.**
- **Acquis** : EXPLIQUER/RAISONNER/DIAGNOSTIQUER un RAG (le plus fort du corpus côté compréhension).
  **Manque** : coder un RAG, un agent, une éval.
- **Capacité** : EXPLIQUER ✅✅ · DIAGNOSTIQUER ◐ · FAIRE ✗. **Excellente compréhension IA, zéro pratique de code IA.**

---

## Synthèse des walkthroughs
- **Fluides de bout en bout (FAIRE réel)** : JS, Git/Linux, TypeScript, Web, React, Backend (1-7).
- **Corrects avec pratique à étoffer** : algo/récursion, SQL, Python (3, 8, 9-Python).
- **Compréhension forte / pratique absente** : data-pandas, ML, Cloud/K8s, IA/RAG/agents (9-data, 10, 11, 12).
- **Aucun prérequis fantôme ni saut conceptuel bloquant détecté** : les leçons construisent leurs
  prérequis et anticipent les confusions. Le seul « mur » réel est le passage compréhension→pratique
  sur la moitié IA, faute d'exercices de code — cohérent avec toutes les autres analyses V45/V45.1.
