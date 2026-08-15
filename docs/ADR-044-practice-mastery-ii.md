# ADR-044 — Practice Mastery II : difficulté, feedback, ladders & hardening

Statut : accepté (Sprint V44). Décision fondée sur l'audit CP0 réel. **Priorité : pédagogie > maîtrise
réelle > pratique > transfert > cohérence > UX > features.** Local, mono-utilisateur, **une seule source
de vérité**, sans fausse « IA », sans infra réelle. **Extension ADDITIVE de l'existant.**

## Problème (établi au CP0)
Le corpus (238 exos exécutables) a une **pyramide de difficulté pathologique** (d1=21, d2=142, d3=69,
d4=6, **d5=0**), un **feedback quasi inexistant** (9/238 reliés à une misconception), et des **ladders
incomplètes** (peu de montée D4/D5 autonome). V43 a l'instrument (practice-coverage) ; V44 doit améliorer
la SUBSTANCE.

## Décisions

### D1 — Définitions canoniques de difficulté (RÉUTILISE le champ `difficulty` existant)
On ne crée PAS de difficulté parallèle. On DÉFINIT ce que signifient les niveaux 1-5 du champ existant :
- **D1** reconnaissance / manipulation directe.
- **D2** application d'un pattern déjà connu.
- **D3** choix de stratégie / plusieurs étapes.
- **D4** diagnostic / contraintes concurrentes / information partielle.
- **D5** problème professionnel ambigu / transfert / plusieurs solutions plausibles.
La difficulté est **cognitive**, jamais « plus de lignes / plus gros JSON / énoncé plus long ».

### D2 — Practice ladder = read-model DÉRIVÉ (`lib/practice-ladder.mjs`, PUR)
Pas de nouvelle table persistée. La ladder L0–L5 par compétence est PROJETÉE depuis l'existant :
L0 concept (leçon) · L1 guidé (exemple guidé / exo d1-d2) · L2 application (exo d2-d3) · L3 stratégie
autonome (exo d3-d4) · L4 diagnostic (exo debug / assessment DIAGNOSIS / phase capstone) · L5 transfert
(défi T5 / question TRANSFER / capstone). Chaque échelon cite sa source. RÉUTILISE practice-coverage,
skill-taxonomy, difficulty, transfer, capstones.

### D3 — Feedback diagnostique FACTORÉ (misconceptions étendues)
On n'écrit PAS 238 blocs de feedback. On ÉTEND le registre `misconceptions` (V42) et ses `exerciseRefs`
pour couvrir ≥ 40 exercices via le mécanisme mutualisé `diagnosticFeedback` (V43). Langage prudent :
« cette erreur est COMPATIBLE avec la misconception X », jamais « tu ne comprends pas », jamais la solution
complète. Chaque misconception relie leçon(s) + exercice(s) de remédiation réels.

### D4 — Rééquilibrage de la difficulté (nouveaux + durcis, RÉELLEMENT exécutables)
Créer/durcir ≥ 24 pratiques D3/D4/D5 où c'est pédagogiquement utile. Toute nouvelle pratique respecte le
contrat d'exercice existant (référence 100 % verte, starter fautif ≥ 1 test public, ≥ 1 public + ≥ 1 privé,
call-equals sans flottant, SIMULATION étiquetée). **Interdit : fake difficulty** (bruit gratuit, calcul plus
gros). Une D4/D5 introduit diagnostic / stratégie / trade-off / ambiguïté / contraintes concurrentes /
transfert.

### D5 — Variation ≠ substitution lexicale
≥ 8 variantes/défis réellement différents de leur source (hypothèses, symptôme, contrainte, information
parasite, contexte, trade-off), réutilisant transfer-challenge/assessment. Vérifié anti-substitution.

### D6 — Hardening académique au mérite
≥ 24 leçons auditées en profondeur (fonction pédagogique, pas nombre de titres), 10–12 corrigées SI
l'audit le justifie, Data/ML inclus. **Ne pas réécrire une excellente leçon pour produire du diff.**
Priorité absolue : intelligibilité d'un néophyte (aucun jargon avant intuition).

### D7 — Readiness CONSERVATRICE (recalibrage)
`strong-junior` exige des preuves diversifiées (autonomie + diagnostic + variation/transfert + transfert
plein), jamais le volume. Recalibrer la projection si elle surestime ; documenter. Affiché comme
**PROXY / projection fondée sur preuves**, jamais « maîtrise professionnelle prouvée ».

### D8 — Gate `v44:check` + anti-scope-collapse
Gate : distribution de difficulté pathologique (avertissement si d5=0 / d4 trop rare sur une compétence
structurante), exercices orphelins, misconceptions/remédiations mortes, readiness sans preuves, source
concurrente interdite. Le gate n'exige jamais « N exercices par skill » (faux positif interdit). Les
**floors de scope V44** sont documentés (TSD-044) et suivis ; toute suppression exige preuve + réallocation.

### D9 — Réel / Simulé / Proxy
Exercices réellement exécutés (harnais existant). Défis d'infra/RAG/ML = SIMULATION. Ladder/readiness =
PROXYS structurels. Aucune infra réelle, aucun LLM, aucun second moteur.

## Conséquences
- **Positives** : difficulté cognitive réelle, feedback qui aide à comprendre, ladders visibles, leçons
  durcies là où c'est justifié — sur plusieurs compétences structurantes.
- **Coûts** : sprint volumineux ; le rapport final répond floor par floor (fait / non fait / pourquoi).
- **Rejeté** : difficulté/ladder/état concurrents (D1/D2/D7), fake difficulty (D4), feedback générique vide
  (D3), réécriture-diff (D6), réduction de périmètre sans réallocation (D8).
