# V50 — Walkthroughs apprenant (Jour 1 → 365)

Cinq simulations d'un apprenant suivant réellement le parcours, vérifiant
continuité, charge, pratique, rappels, progression. Artefacts réels (post-V50).

## A — Jours 1 → 30 (fondations : gitlinux, jsts, algo)
Démarrage en douceur : shell/Git (d1 `greeting`, warm-up), puis JS
(d5 `js-conditions`), algorithmique (d15+). **Chaque jour de M1 a maintenant de
la pratique** (28/28). Continuité conceptuelle : terminal → variables →
conditions → boucles → premiers algos. Charge raisonnable (1-2 exercices/jour).
Aucune rupture ; l'apprenant code dès le jour 1.

## B — Jours 31 → 90 (ds, se, http, archi)
Structures de données (d30-42), engineering (d40 `patterns-dependency-injection`
— une décision, pas de la syntaxe), puis HTTP/API (d50+). La pratique reste dense
(M2 27/28, M3 28/35). Progression D2→D3→D4 : de l'application au diagnostic.
L'apprenant relie déjà conception et contraintes.

## C — Jours 91 → 180 (jsts reactivation, python, sql, ml)
Réactivation jsts en M4 (d95 `incident-severity`) — les fondations ne
disparaissent pas. Python et SQL (M5) amènent la pratique data réelle
(sqlite3, pandas). M6 bascule sur ML (d150 `py-debug-average`, puis
`skl-*`). **Avant V50, M6 n'avait que 3 jours de pratique ; désormais 28.**
L'apprenant passe du code généraliste à la data avec pratique continue.

## D — Jours 181 → 270 (dl, llm, rag, evalia)
Cœur IA. Deep Learning exécutable (d190 `dl-he-init-std` — calcul NumPy réel),
puis LLM engineering et RAG (d220 `rag-cosine-similarity`). **Avant V50, M7-M9
étaient à 0 pratique** ; désormais M7=19, M8=13, M9=18. C'est le gain majeur :
l'apprenant IA rencontre enfin la pratique construite en V46-V49 au bon moment.
Diagnostics (D4) et scénarios (fraude ML, hallucination RAG) arrivent après la
pratique.

## E — Jours 271 → 365 (agents, archi, secu, integration, comm/autonomy)
Agents (d274+), avec réactivation de patterns sur jour de révision
(d280 `patterns-strategy-vs-conditional`). Sécurité et architecture de production
(M10-11), scénarios professionnels de synthèse, labs cloud **externes** (contrats
honnêtes). M12 = intégration : portfolio, communication (post-mortems, ADR),
autonomie — non-code, évalué qualitativement. L'apprenant termine sur une
synthèse professionnelle, pas sur du remplissage.

## Ruptures détectées & traitées
- **M7-M12 sans pratique** (avant V50) → **comblé** (intégration des orphelins).
- **Compétences apprises puis absentes** → **atténué** par réactivation sur jours
  de révision (oubli 12 → 1 anomalie).
- **Résiduel honnête** : l'écart d'enseignement des fondamentaux (structure gelée)
  et l'oubli `dl` tardif restent documentés (dette V51). Aucune rupture bloquante :
  `v50:check` vert, `curriculum:check` 365/365.
