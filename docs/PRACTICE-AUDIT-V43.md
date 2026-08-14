# Audit de la pratique — Sprint V43

> Audit du corpus de 238 exercices (Niveau 1 automatisé + Niveau 2 échantillon qualitatif) et matrice de
> couverture par compétence dérivée du read-model. Français, factuel, critique. La couverture est un PROXY
> structurel, jamais une preuve de maîtrise. « Volume ≠ qualité » : un domaine n'est pas bon parce qu'il a
> beaucoup d'exercices.

## 1. Audit Niveau 1 — automatisé (100 % du catalogue)
- **238 exercices**, tous réellement exécutables (harnais `runExercise`).
- **Runtimes** : node-js 187 · react-tsx 15 · typescript 16 · python3 9 · web 11.
- **Difficulté** (présente sur 238/238) : niv.1 = 21 · niv.2 = **142** · niv.3 = 69 · niv.4 = 6 · **niv.5 = 0**.
  → Concentration massive sur le niveau 2 ; plafond au niveau 4 ; la difficulté est **numérique**, pas typée
  cognitivement.
- **Feedback** : `0/238` hints. Feedback = réussite/échec + « attendu X, obtenu Y ». Aucune reliure native
  à une misconception (comblée en V43 par `diagnosticFeedback`).
- **Compétences fine** : 38, très concentrées sur les fondations (`conditions` 85, `functions` 66,
  `arrays` 52, `javascript` 33) — sur-représentation des micro-compétences JS.
- **Projection fine → programme** (exercices de code uniquement) : jsts **215** · algo 22 · gitlinux 20 ·
  ds 13 · python 12 · http 9 · se 3. **Les autres compétences de programme n'ont AUCUN exercice de code**
  (leur pratique vit ailleurs : Labs, assessments, missions, capstones).

## 2. Matrice de couverture (dérivée, read-model)
Dimensions : F foundation · P practice · A autonomy · D diagnostic · V variation · T transfer · Pro
professional. `●` full · `◐` partial · `○` none.

| Compétence | F | P | A | D | V | T | Pro | Readiness |
|---|---|---|---|---|---|---|---|---|
| algo | ● | ● | ● | ● | ● | ● | ● | **strong-junior** |
| ds | ● | ● | ● | ● | ● | ● | ● | **strong-junior** |
| jsts | ● | ● | ● | ● | ● | ● | ● | **strong-junior** |
| http | ● | ● | ● | ● | ● | ● | ● | **strong-junior** |
| se | ● | ● | ● | ● | ● | ● | ● | **strong-junior** |
| archi | ● | ◐ | ● | ● | ● | ● | ● | **strong-junior** |
| secu | ● | ◐ | ● | ● | ● | ● | ● | **strong-junior** |
| cloud | ● | ● | ● | ● | ● | ● | ● | **strong-junior** |
| gitlinux | ● | ● | ● | ● | ● | ◐ | ● | junior-ready |
| python | ● | ● | ● | ○ | ● | ○ | ● | guided |
| sql | ● | ○ | ○ | ● | ● | ● | ● | not-ready* |
| ml | ● | ○ | ○ | ● | ● | ● | ● | not-ready* |
| rag | ● | ○ | ○ | ● | ● | ● | ● | not-ready* |
| evalia | ● | ○ | ○ | ● | ● | ● | ● | not-ready* |
| llm | ● | ○ | ○ | ● | ○ | ◐ | ● | not-ready* |
| patterns | ● | ○ | ○ | ● | ○ | ◐ | ○ | not-ready |
| comm | ● | ○ | ○ | ● | ○ | ○ | ● | not-ready |
| dl | ● | ○ | ○ | ○ | ○ | ○ | ○ | **not-ready (mince)** |
| agents | ● | ○ | ○ | ○ | ○ | ○ | ○ | **not-ready (mince)** |
| autonomy | ○ | ○ | ○ | ○ | ○ | ○ | ○ | **not-ready (mince)** |

Distribution : **8 strong-junior · 1 junior-ready · 1 guided · 10 not-ready**.

## 3. Interprétation HONNÊTE (not-ready ≠ non couvert)
Le label `readiness` exige de la **pratique de code autonome** pour dépasser `foundational`. Il faut donc
distinguer :
- **`not-ready*` (bien couvert conceptuellement, pas exercé en CODE)** : sql, ml, rag, evalia, llm — ces
  compétences ont diagnostic ●, variation ●, transfert ●, professionnel ● (assessments + capstones +
  défis + missions), mais **aucun exercice de code exécutable** (on n'« exécute » pas du SQL/ML/RAG dans ce
  harnais local). Leur « not-ready » signifie « pas de pratique de code autonome », PAS « non enseigné ».
- **`not-ready` (réellement mince)** : **dl, agents, autonomy** (et partiellement patterns, comm) — peu
  d'artefacts au-delà de la fondation. Ce sont les **vrais trous**.

## 4. Audit Niveau 2 — échantillon qualitatif
- **Fondations JS/algo/DS** : bien couvertes et progressives (guided → autonome → debug). **Risque** :
  sur-représentation de `conditions`/`functions` (85/66) — beaucoup de variations syntaxiques ; la valeur
  marginale décroît. Verdict : **FORT en volume, BON en profondeur** (à ne pas gonfler).
- **Backend/HTTP/SQL** : `caching-performance` (leçon) est **excellente** (mesure d'abord, N+1,
  invalidation, transfert vers le coût LLM). Les exercices HTTP/N+1 (`fix-nplus1`, `api-*`) sont
  authentiques. SQL : diagnostic/transfert forts, pas d'exercice de code (limite du harnais). **BON**.
- **Frontend/React** : exercices de debug réels (`react-debug-list/greeting`, `react-lift-state`).
  Reliés aux misconceptions (useEffect≠lifecycle). **BON**.
- **Cloud/K8s/Sécurité** : pratique via **Labs** (kubernetes/cloud/security) + capstones + défis. **BON**
  (mais non-code).
- **Data/ML/IA** : diagnostic/transfert/professionnel forts (assessments + capstones RAG/ML + défis) ;
  **dl et agents restent minces**. **MOYEN**.

## 5. Verdicts professional-readiness (honnêtes)
| Verdict | Compétences |
|---|---|
| **strong-junior** (autonomie + diagnostic + transfert + pro) | algo, ds, jsts, http, se, archi, secu, cloud |
| junior-ready | gitlinux |
| guided | python |
| couvert conceptuellement, sans pratique de code | sql, ml, rag, evalia, llm |
| **trous réels (à traiter V44)** | dl, agents, autonomy, patterns, comm |

`strong-junior` n'est JAMAIS attribué au volume : il exige autonomie + diagnostic + (variation ou
transfert) + transfert=full, tous dérivés de sources réelles.

## 6. Ce que V43 a livré / NON fait
- **Livré** : read-model de couverture (rend l'état réel visible), feedback diagnostique par misconceptions,
  comblement transfert (algo/ds, jsts, secu, cloud → 9 défis T5), gate v43.
- **NON fait (dette V44, assumé)** : hints inline sur 238 exercices ; exercices de code pour sql/ml/rag
  (limite de harnais — nécessiterait un runtime SQL/données) ; renforcement dl/agents/autonomy/patterns/comm ;
  typage cognitif de la difficulté ; UX de la matrice.

## 7. Limites de l'audit
Niveau 1 exhaustif (métriques réelles) ; Niveau 2 = échantillon, pas 238 relectures profondes (honnêtement
borné). La readiness est un PROXY structurel dérivé, pas une mesure d'apprentissage humain.
