# V45.1 — COHÉRENCE DU PARCOURS 365 JOURS (CP12)

Audit **lecture seule**. Aucun jour modifié. Base : `program.days` (365 jours, 12 mois).

## Carte mois par mois (KNOWLEDGE ENTERING → ACQUIRED → REUSED → PRACTICE → OUTPUT)

| Mois | Jours | Dominante | Révisions | Projets | Pratique code |
|---|---|---|---|---|---|
| M1 | 28 | jsts(16), algo(7), gitlinux(5) | 4 | 0 | ✅ réelle |
| M2 | 28 | jsts(7), ds(5), algo(4), se(4) | 4 | 3 | ✅ réelle |
| M3 | 35 | http(9), archi(5), se(4), sql(3) | 5 | 7 | ✅ (http/sql) |
| M4 | 28 | jsts(16), se(6), autonomy(6) | 4 | 0 | ✅ (React) |
| M5 | 28 | python(15), sql(7), autonomy(6) | 4 | 0 | ✅ (Python) |
| M6 | 35 | **ml(35)** | 5 | 0 | ✗ SIMULÉ |
| M7 | 28 | dl(15), llm(13) | 4 | 0 | ✗ SIMULÉ |
| M8 | 28 | rag(20), llm(8) | 4 | 0 | ✗ SIMULÉ |
| M9 | 35 | rag(15), evalia(13), secu(7) | 5 | 0 | ✗ SIMULÉ |
| M10 | 28 | agents(14), archi(7), secu(7) | 4 | 0 | ✗ SIMULÉ |
| M11 | 28 | archi(7), rag(7), evalia(7), agents(7) | 4 | 0 | ✗ SIMULÉ (intégration) |
| M12 | 36 | comm(22), secu(7), autonomy(7) | 5 | 0 | inline (carrière) |

## Ce qui est cohérent (BON)
- **Progression de difficulté globale** saine : fondations (M1-2) → backend (M3) → frontend (M4) →
  Python/données (M5) → ML (M6) → DL/LLM (M7) → RAG (M8-9) → agents/sécurité (M10) → intégration (M11)
  → communication/carrière (M12). Chaque prérequis précède son usage.
- **Révisions régulières** : 4-5 jours de révision par mois, bien réparties (espacement correct pour la
  rétention à court terme).
- **Prérequis respectés** : Python (M5) avant ML (M6) ; LLM (M7) avant RAG (M8) ; embeddings/retrieval
  avant agents. Pas d'inversion majeure détectée.

## Ruptures et risques (honnêtes)
1. **Pivot brutal M5→M6** : passage de l'écosystème JS/web/Python-données à 35 jours de ML pur. Le
   changement de posture (ingénierie → science des données/maths) est réel ; il est préparé par
   python-foundations + statistics-for-ml, mais reste un mur cognitif. **Risque : moyen.**
2. **Non-réactivation des acquis JS/React/backend sur M6→M12 (7 mois)** : après M5, quasiment aucune
   réactivation des compétences frontend/backend acquises M1-M4. Risque réel d'OUBLI : un apprenant
   arrivé au M12 pourrait avoir « perdu la main » sur React/Express faute de pratique intercalée.
   **Risque : élevé pour la rétention long terme.**
3. **Bloc M6 = 35 jours de ML d'affilée** : densité mono-domaine importante ; peu d'alternance. Charge
   cognitive soutenue. **Risque : moyen.**
4. **Aucun projet (`day.project`) après M3** : les 10 projets sont concentrés M2-M3. Toute la seconde
   moitié (IA) n'a pas de projet-jour intégré (les capstones existent séparément mais sont SIMULÉS et
   non ancrés dans un jour). **Risque : moyen** (consolidation par projet absente en IA).
5. **58 % du temps après M5 sans pratique de code exécutable** (M6-M12 = IA/simulation) : cohérent avec
   la dette n°1 (chaîne cassée à APPLICATION). L'apprenant PASSE du temps sur l'IA mais ne PRATIQUE pas
   le code — désalignement temps/pratique.

## Verdict cohérence : **BON sur l'ordre et la difficulté, FRAGILE sur la rétention long terme et la pratique de la 2e moitié.**
La colonne vertébrale temporelle est logique et bien séquencée. Les deux faiblesses réelles sont
(a) l'absence de réactivation des acquis JS/web sur les 7 derniers mois (oubli probable) et (b)
l'absence de pratique de code + de projets-jour sur toute la moitié IA. Aucune restructuration n'est
recommandée en V45.1 (audit-only) ; ces points nourrissent le backlog V46 (ex. jours de réactivation
espacée ; projets-jour IA quand la pratique IA existera).
