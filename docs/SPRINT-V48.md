# SPRINT V48 — Professional Practice IV

**Type** : construction & professionnalisation (pas d'audit de corpus).
**Corpus** : gelé (SHA-1 `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3`, inchangé).
**Langue** : français. **Branche** : `claude/ai-career-os-saas-phfg49`.

## 1. État Git
Working tree propre ; `data/progress.json` intact (blob `32360402…`, non commité) ;
`.venv-ds/` gitignoré ; aucun serveur résiduel ; local == origin.

## 2. Réponses aux 30 questions obligatoires

1. **Avant V48 ?** 333 exercices, 5 capstones, 42 missions, 18 transfer, 46
   misconceptions ; 17/20 compétences pratiquables, ~7 à boucle complète.
2. **Réellement créé ?** 36 exercices exécutables (sprint=v48), 5 scénarios
   professionnels (capstones), 9 misconceptions, gate `v48:check`, 2 tests, 4 docs.
3. **Seulement relié ?** Les 36 exercices sont reliés au curriculum par projection
   de compétence ; 5 scénarios réutilisent le moteur de capstone existant.
4. **Approfondi ?** ml (fuite/imbalance/drift/coût), llm (D4 0→3), archi (+9
   décisions), patterns, agents, evalia, rag.
5. **Unités substantielles ajoutées ?** 71 (36 exercices + 35 phases de scénario).
6. **Distribution D1-D5 avant → après ?** D1 21→21 · D2 150→150 · D3 107→119 ·
   D4 43→61 · D5 12→18. (exercices)
7. **Combien de D4 ?** +18 (43→61).
8. **Combien de D5 ?** +6 (12→18).
9. **Compétences à boucle professionnelle complète ?** 10 : python, sql, se, http,
   jsts, archi, ml, rag, agents, evalia (cf. PROFESSIONAL-READINESS-V48).
10. **Restent théoriques ?** Aucune compétence de code ne reste purement
    théorique ; comm/autonomy sont non-code par nature.
11. **Restent simulées ?** Sorties de modèle (llm/rag) et ancrage : `SIMULATION`/
    `PROXY` étiquetés. Aucune fausse exécution.
12. **Environnement externe requis ?** cloud (Docker/K8s/AWS), via labs honnêtes.
13. **Data/ML utilise pandas/sklearn ?** OUI, réellement (7 des 10 exos Data via
    `.venv-ds`), vérifié par exécution.
14. **Dépend de `.venv-ds` ?** Les exercices `python-ds` (15 au total) ; sautés
    honnêtement en `TOOLING_ENVIRONMENT_REQUIRED` si le venv est absent.
15. **Reproductibilité réelle ?** `requirements-ds.txt` à versions pinnées ; venv
    non commité ; CI principale déterministe (python-ds sautés sans venv).
16. **Pratique LLM réelle ?** budget de contexte, coût mensuel, retry idempotent,
    réparation de sortie, routage d'outil, scan d'injection (PROXY) — sans modèle.
17. **Pratique RAG réelle ?** diagnostic retrieval/génération, RRF hybride,
    recall/precision@k, ancrage.
18. **Pratique agents réelle ?** détection de boucle, récupération d'échec d'outil,
    garde-fou d'agence excessive (D5), transitions d'état.
19. **Scénarios pro multi-compétences ?** 10 au total (5 ajoutés en V48).
20. **Divulgation progressive ?** OUI : context/signal → artefacts (avec bruit) →
    7 phases → debrief. Faux indices présents.
21. **Feedback diagnostique sur erreur ?** OUI : 55 misconceptions ; feedback
    distingue connaissance/lecture/diagnostic/priorité/risque (cf. walkthroughs).
22. **Design patterns comme décisions ?** OUI : 13 exercices « choisir A/B/C/aucun »
    avec justification par contrainte, pas de trivia.
23. **Compétences à vraie readiness pro ?** 10 boucles complètes + 6 solides.
24. **Statuts abaissés ?** Aucun gonflé ; `dl` reste ÉMERGENT (honnêteté).
25. **Corpus identique ?** OUI (SHA-1 inchangé).
26. **Tests avant → après ?** 1234 → 1240 (+6 suites V48 ; 369 exercices exécutés).
27. **Gates avant → après ?** +`v48:check` câblé dans `gates:active`, tous verts.
28. **Limites non résolues ?** llm/patterns sans transfert dédié ; dl peu profond.
29. **Dette V49 ?** transfert llm/patterns, profondeur dl, comm/autonomy rubrique.
30. **Grand pas vers l'employabilité ?** Oui : l'apprenant PRATIQUE désormais le
    diagnostic sous ambiguïté et la décision sous contraintes sur 10 compétences,
    pas seulement la résolution d'exercices scolaires.

## 3. Réutilisation (aucun second moteur)
Le moteur de scénario professionnel EXISTAIT (`lib/capstone.mjs`) : V48 l'a
RÉUTILISÉ pour 5 nouveaux scénarios. Aucun assessment/capstone/mastery engine
créé ; aucune seconde source de vérité ; read-models dérivés réutilisés.

## 4. Validation de clôture
- `npm test` : **1240 tests, 0 échec** (exécution réelle des 36 exos + 5 scénarios).
- `tsc --noEmit` : **0 erreur**. `npm run build` : **OK**.
- `gates:active` : **tous verts** (v18…v48).
- Corpus SHA-1 **identique** ; `progress.json` **intact** ; working tree propre.

## 5. Verdict : **FORT**
V48 fait franchir un vrai palier d'employabilité : trois domaines (archi, agents,
rag) et evalia/ml accèdent à une **boucle professionnelle complète** (observer →
investiguer → hypothèses → décider → valider → expliquer), `llm` passe de D4=0 à
une pratique d'ingénierie réelle, et les design patterns sont enfin enseignés
comme des **décisions** sous contraintes. 71 unités substantielles, 0 mensonge de
statut (RÉEL/SIMULÉ/PROXY/TOOLING/EXTERNAL), corpus gelé. Pas **EXCELLENT** : `dl`
reste émergent, `llm`/`patterns` manquent de transfert dédié, `llm` n'appelle
aucun modèle réel (par conception), `cloud` reste externe. Ce sont les cibles V49.
