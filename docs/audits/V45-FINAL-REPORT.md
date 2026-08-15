# V45 — RAPPORT FINAL D'AUDIT 360°

Audit **lecture seule**, aucune source métier modifiée. Grille : INSUFFISANT · FRAGILE · CORRECT · BON ·
FORT · EXCELLENT (rare). Détails dans `docs/audits/V45-*`.

## 1. Executive summary
AI Career OS est un **socle d'ingénierie logicielle solide (JS/TS) doublé d'un corpus de leçons riche
et honnête sur ~20 domaines**, mais dont la **pratique de code exécutable ne couvre que 8 des 20
compétences**. Le programme consacre ~42 % de l'année à l'IA/ML/RAG/agents, domaines où il enseigne à
COMPRENDRE et RAISONNER (leçons FORTES, assessments, transferts, labs simulés) sans faire PRATIQUER le
geste technique. Discipline d'ingénierie remarquable (1202 tests, 24 gates, une source de vérité).
Verdict global : **BON**, avec une dette centrale claire et bornée : la pratique des domaines non-JS/TS.

## 2. État Git final
Branche `claude/ai-career-os-saas-phfg49` ; audit-only ; `progress.json` blob
`323604021055588a9528a86875f36598dbdc7758` inchangé ; tests/tsc/build/gates verts ; arbre propre visé
en fin de sprint (voir §clôture).

## 3. Inventaire canonique
128 leçons · 20 compétences · 365 jours · 262 exercices (673 pub / 337 priv) · 16 assessments (83 q) ·
5 capstones · 18 transferts · 42 missions · 45 playbooks · 24 misconceptions · 6 familles de labs ·
24 gates · graph 423 nodes/689 edges/0 blocking · 1202 tests · 70 modules lib · 36 pages.

## 4. Ce qui est réellement solide (vérifié)
- Boucle théorie→pratique→diagnostic→transfert **JS/TS + algo/ds/http/git/se** : **FORT**.
- Discipline d'ingénierie (tests, gates, types, une source de vérité, read-models purs) : **FORT**.
- Corpus de leçons (prose intuition-first, modèles mentaux réels) : **BON→FORT** (13 lus en profondeur).
- Système d'évaluation (assessments Bloom, capstones par domaine, 18 transferts cross-domain) : **BON**.
- Playbooks professionnels (45, structure incident complète) : **FORT** en référentiel de raisonnement.
- Sandbox d'exécution + posture sécurité locale : **CORRECT→BON**.

## 5. Ce qui est surévalué par les rapports précédents
- « strong-junior » pour secu/cloud/archi (corrigé V44, mais affiché V40-V43) : pas de pratique de code.
- « couverture » : la théorie couvre 20/20, mais la PRATIQUE 8/20 — le mot « couverture » gonflait.
- Le volume (262 exos) masque **62 % en d1-d2** et **82 % jsts**.
- Emploi fréquent de FORT/EXCELLENT/STRUCTURANT dans les synthèses : recalibré ici (EXCELLENT n'est
  attribué à AUCUN bloc — la prose est FORT, jamais EXCELLENT tant que la pratique manque).

## 6. Ce qui est réellement insuffisant
- Pratique de code hors JS/TS (data/ML/IA/cloud/sécurité/archi) : **INSUFFISANT** (0 exercice, 12/20 skills).
- Profondeur cognitive de la pratique : **FRAGILE** (11 % diagnostic/pro).
- 24 exercices de code sans test privé : **FRAGILE** (contrat non tenu).
- Diagnostic Python absent ; `dl` théorie seule.

## 7. Top 20 des dettes par impact apprenant
1. Aucune pratique de code IA appliquée (LLM/RAG/embeddings/agents) — 42 % du programme concerné.
2. Aucune pratique de code ML/stats/data.
3. Aucune pratique de code cloud/sécurité/k8s (labs simulés seulement).
4. Taxonomie `isKnownSkill` bloque le tagging d'exercices secu/cloud/archi/ml/… (cause racine de 1-3).
5. 62 % des exercices en d1-d2 (faible charge cognitive).
6. 24 exercices sans test privé (réponse reconnaissable possible).
7. Diagnostic Python manquant (dimension Dg=none).
8. `sql` pratique mince (5 exercices).
9. 14 leçons sans practiceRef exécutable (recursion, design-patterns, git-advanced, nextjs×2, …).
10. 47 warnings graph `concept-without-foundation` (ordre de prérequis à instruire).
11. `data-ml-v1` (188 j) et `ai-engineer-foundations` (2e moitié) : ambition ≫ pratique outillée.
12. Parcours `appsec`/`cloud-devops` très courts (15/29 j) vs ampleur du domaine.
13. Labels de formulaire potentiellement incomplets (a11y, 7 htmlFor/50 inputs) — à vérifier.
14. Contraste/focus/responsive non vérifiés (outillage de rendu absent).
15. `generate` non idempotent (`generatedAt`).
16. Capstones déterministes/simulés (pas d'exécution réelle).
17. Missions concentrées JS/ops (peu data/ML/IA).
18. Playbooks = lectures, pas d'exercices notés.
19. Markdown non sanitizé (LOW en local, bloquant avant multi-utilisateur/IDE).
20. Pas de `npm audit`/SAST récent documenté.

## 8. Audit des 128 leçons (distribution des actions)
KEEP **122** · DEEPEN **3** (recursion, design-patterns-intro, git-advanced) · GAP_PRACTICE **3**
(nextjs-foundations, nextjs-server-client-components, observability-logging) · SPLIT 0 · MERGE 0 ·
REORDER 0 (à confirmer via les 47 warnings graph) · DEPRECATE 0 · GAP_NEW 0. Détail : V45-CURRICULUM-AUDIT.

## 9. Matrice des domaines
Théorie 20/20 ; pratique EXÉCUTABLE 8/20 (jsts, algo, ds, http, gitlinux, se, sql, python) ;
FOUNDATIONAL + PRO SIMULÉ pour cloud/secu/archi/ml/rag/evalia/llm/comm ; INTRODUCED pour patterns/dl/
agents(partiel). Détail : V45-PRACTICE-AUDIT §CP4.

## 10. Matrice des parcours
8 disponibles (vues sur 1 programme de 365 j) + 1 annoncé. 🟢 fullstack-typescript, frontend, backend.
🟠 systems-cloud, appsec-cloud-security, cloud-devops, data-ml, ai-engineer-foundations. 🔴 ai-fullstack
(annoncé). Détail : V45-TRACK-AUDIT.

## 11. Matrice THEORY→PROFESSIONAL
Maillon faible systématique = guidée + autonome (pratique de code) hors JS/TS ; théorie/diagnostic/
transfert souvent forts. Détail : V45-PRACTICE-AUDIT §CP7.

## 12. Évaluation des exercices
RECALL 8 % · UNDERSTANDING 52 % · APPLICATION 29 % · DEBUGGING 4 % · DIAGNOSIS 6 % · PRO 1,5 %.
24 hors-contrat. Assessments bien typés mais modestes. Détail : V45-PRACTICE-AUDIT §CP8.

## 13. Évaluation labs / missions / capstones
Labs = SIMULATION honnête et riche (raisonnement infra/sécurité). Missions concentrées JS/ops.
Capstones = 1 par domaine, déterministes/simulés. Playbooks FORTS. Détail : V45-PRACTICE-AUDIT §CP9.

## 14. Produit (CP14)
« Si le développement s'arrêtait aujourd'hui, quelle valeur ? »
- **CORE VALUE** : apprendre l'ingénierie logicielle JS/TS de zéro à junior employable (théorie +
  pratique + évaluation + capstone). Réel et livrable.
- **USEFUL** : comprendre en profondeur data/ML/IA/cloud/sécurité (leçons FORTES, raisonnement,
  playbooks) — précieux pour la culture et l'entretien, même sans pratique de code.
- **NICE TO HAVE** : labs de simulation (k8s/cloud/sécurité), calendrier, glossaire, notes.
- **DISTRACTION** : aucune identifiée majeure (UI sobre, pas de gamification vanity).
- **NOT READY** : pratique de code IA/ML/cloud ; parcours annoncé ai-fullstack.
Onboarding, progression, révisions (SM-2), skill-state fondé sur preuves : **BON**. Confiance dans les
métriques : **BON** depuis le recalibrage readiness V44.

## 15. UX
BON (sobre, éditorial, anti-slop PASS). Points : densité card/badge à revoir, continuité cours→pratique
partielle. Détail : V45-UX-ACCESSIBILITY-AUDIT.

## 16. Accessibilité
Structure CORRECTE (boutons natifs, landmarks, aria) ; labels de formulaire à vérifier (MEDIUM) ;
contraste/focus/responsive **NON TESTÉ** (outillage absent). Détail : idem.

## 17. Technique
BON→FORT : tsc/build/1202 tests/24 gates verts, modularité pure/impure, bundle raisonnable, 0 blocking
graph. `generate` non idempotent (mineur). Détail : V45-TECH-SECURITY-AUDIT.

## 18. Sécurité
CORRECT (local) : aucune CRITICAL/HIGH ; sandbox execFile solide ; Markdown de confiance ;
path-traversal protégé. Pré-requis avant multi-utilisateur/IDE : sanitize Markdown, durcir sandbox.

## 19. Learner readiness
🟢 tronc ingénierie logicielle apprenable de bout en bout aujourd'hui. 🟠 cloud/sécurité/data/IA
(raisonnement oui, geste non). Détail : V45-LEARNER-READINESS.

## 20. Ce qui peut être commencé immédiatement
JavaScript/TypeScript → Frontend (React) OU Backend (HTTP/API/SQL) → Git/Linux → tests/qualité, avec
pratique de code réelle et capstone. Algo/DS en soutien.

## 21. Ce qui ne doit pas encore servir de parcours principal
Data/ML, IA appliquée, Cloud/DevOps, Sécurité **en tant que parcours de PRATIQUE** (excellents pour la
compréhension, mais la pratique de code manque). Deep learning (théorie seule). ai-fullstack (annoncé).

## 22. Vraies priorités V46→V50 (dérivées de l'audit)
- **V46 — Practice remediation IA/data (dette n°1)** : extension taxonomie + exercices de code
  exécutables pour ml/rag/evalia/llm et data ; corriger les 24 tests privés ; diagnostic Python.
- **V47 — Practice cloud/sécurité/archi** : exercices exécutables (ou reconnaître honnêtement les
  limites d'exécution locale et renforcer labs+capstones notés).
- **V48 — Profondeur cognitive** : rééquilibrer la pyramide (plus de D3/D4/D5 hors JS/TS), variation.
- **V49 — Stabilité & cohérence** : instruire les 47 `concept-without-foundation` (REORDER), idempotence
  generate, baseline STABLE/BETA appliquée.
- **V50 — UX/A11y de rendu** : Playwright + axe-core, contraste/focus/responsive, revue card-grid ; puis
  seulement envisager IDE intégré (pré-requis sécurité S1/S2 traités).

## 23. Ce qu'il ne faut plus toucher (stabilisé)
Le noyau curriculum JS/TS (leçons STABLE), l'architecture des read-models purs, les gates, le modèle
d'exercice/sandbox, le modèle d'assessment/capstone/transfert, la taxonomie T0-T5. La prose des 122
leçons KEEP.

## 24. Ce qui peut évoluer sans invalider la progression apprenant
Ajouter de la PRATIQUE aux leçons BETA (chemin BETA→STABLE) ; enrichir exemples ; corriger erreurs ;
ajouter exercices/diagnostics. Interdit sans migration : déplacer une leçon dans le graphe, changer son
objectif/niveau, supprimer un prérequis (cf. politique baseline).

## 25. Dettes acceptées
Labs SIMULÉS (pas d'infra réelle en local) ; capstones déterministes ; `generate` timestamp ; Markdown
non sanitizé tant que la source reste de confiance.

## 26. Dettes bloquantes (pour l'ambition « AI Engineer »)
Absence de pratique de code IA/ML/data (dette n°1) ; taxonomie qui empêche de tagger ces exercices.
Sans elles, le parcours phare reste « comprendre l'IA », pas « pratiquer l'IA ».

## 27. Limites de l'audit
- 115/128 leçons : verdict STRUCTUREL (13 lues en profondeur) — pas une notation qualitative intégrale.
- 262 exercices : distribution mesurée + échantillon qualitatif ; pas de relecture qualitative des 262.
- Rendu UI/a11y : NON TESTÉ (Playwright/axe absents ; installation évitée pour ne pas modifier le projet).
- Pas de `npm audit`/SAST/profilage runtime (éviter modification d'état / réseau).

## 28. TESTÉ / INSPECTÉ / SIMULÉ / NON TESTÉ
- **TESTÉ (exécuté)** : tests (1202), tsc, build, gates, graph, harnais d'audit, exécution d'exercices.
- **INSPECTÉ (lu)** : 128 leçons (signaux structurels) + 13 en profondeur ; code UI/a11y/sécurité ;
  échantillon d'exercices.
- **SIMULÉ (honnête)** : labs infra/sécurité, capstones, contextes IA/cloud/ML.
- **NON TESTÉ** : rendu visuel, axe-core, contraste/focus/responsive, npm audit, profilage perf.

## 29. Verdict global
**BON.** Fondations d'ingénierie logicielle FORTES et réellement apprenables ; corpus de leçons riche et
honnête sur tout le spectre ; discipline d'ingénierie exemplaire. **Une dette centrale, unique et
clairement identifiée** : la pratique de code des domaines non-JS/TS (surtout IA/ML/data), qui empêche
le parcours phare de tenir sa promesse « AI Engineer » au niveau du GESTE. Rien ne navigue à l'aveugle :
les priorités V46+ en découlent directement.

## 30. Prompt complet V46
Voir la section « PROMPT V46 » ci-dessous (fichier séparé : `docs/audits/V45-PROMPT-V46.md`).
