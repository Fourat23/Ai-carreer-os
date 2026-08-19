# ADR-051 — Rétention temporelle, progression cognitive & verrou Curriculum 1.0

## Statut
Accepté (V51, CP1).

## Contexte

V50 a intégré 189 exercices orphelins au parcours (0 orphelin, 247/365 jours avec
pratique). L'audit CP0 de V51 confirme cette base MAIS révèle que la métrique
d'oubli de V50 était **optimiste** : bornée par l'exposition d'enseignement, elle
masquait les écarts de PRATIQUE. Mesurés honnêtement : `gitlinux` maxGap 248 j,
`dl` sans pratique après ~j256, `rag` sans pratique après ~j254, ~9 compétences
avec un gap de pratique > 90 j. De plus, la difficulté de certaines compétences
est disloquée (D4/D5 arrivés très tard car placés sur des jours de révision).

Le corpus (128 leçons) et l'ordre des 365 jours sont GELÉS. V51 CERTIFIE et
CORRIGE la qualité temporelle sans réordonner ni réécrire.

## Décisions

### A. Temporal Learning Contract (par compétence structurante)

Chaîne idéale : `INTRODUCTION → GUIDED PRACTICE → AUTONOMOUS PRACTICE → VARIATION
→ DIAGNOSTIC → TRANSFER → PROFESSIONAL USE → REACTIVATION`. Toutes les compétences
n'exigent pas toutes les étapes ; une absence doit être **justifiable**
explicitement (ex. `patterns` n'a que 2 jours d'enseignement → réactivation
d'autant plus nécessaire).

### B. Forgetting policy (seuils conservateurs, mesurés sur la PRATIQUE)

- **0–30 j** entre deux pratiques : normal.
- **31–60 j** : surveillance (info).
- **61–90 j** : réactivation recommandée (warning).
- **> 90 j** (y compris l'écart de queue jusqu'à j365 pour une compétence de code
  encore pertinente) : **anomalie**, sauf justification (compétence non-code, ou
  enseignée uniquement en fin de parcours).

Ces seuils sont une convention pédagogique documentée, pas une loi scientifique.
La métrique est mesurée sur les **jours de pratique** (activités résolues), pas
sur l'enseignement — correction de l'angle mort de V50.

### C. Cognitive progression

D1/D2 préparent D3 ; D3 prépare D4 ; D5 ne doit pas surgir isolément. Une
compétence n'est pas « avancée » parce qu'un D5 existe quelque part : on vérifie
la SÉQUENCE dans le temps. Diagnostics utiles : `difficulty-jump` (D2→D5 sans D3/
D4 intermédiaire proche), `isolated-d5`, `missing-diagnostic-before-transfer`.
On ne gonfle jamais un niveau ; on corrige le placement/la réactivation.

### D. Daily load (charge dérivée, transparente)

Charge d'un jour = modèle transparent à partir des données réelles : présence de
leçon, `hours` du jour si disponible, nombre et difficulté des exercices,
présence de projet/assessment/mission. Pas de « score IA ». Barème documenté :
`none` (0 activité), `light` (1-2), `normal` (3-4), `heavy` (5-6),
`excessive` (7+). Une journée sans exercice peut être parfaitement légitime
(théorie, révision, projet).

### E. Contraintes de remédiation (rétention)

Corriger les anomalies réelles UNIQUEMENT par : (1) réutilisation d'exercices
existants ; (2) rattachement à des **jours de révision existants** ; (3) variation/
transfert existant ; (4) en dernier recours, création ciblée. **Jamais** :
réordonner un jour, modifier une leçon, dupliquer inutilement, placer une
pratique avant l'introduction, créer une surcharge pour corriger un oubli.

### F. Verrou Curriculum 1.0 (préparé pour CP11)

À la clôture, si les audits sont satisfaisants, l'ordre des 365 jours, la chaîne
de prérequis, l'identité des 128 leçons et l'architecture des parcours deviennent
IMMUABLES par défaut. Restent autorisés : corrections factuelles, ajout de
pratique/diagnostic/transfert, accessibilité, bugs, lexique, UI. Une
restructuration exige un ADR + preuve d'une régression pédagogique. « Une
meilleure idée » ne suffit plus.

## Conséquences

La qualité temporelle devient MESURABLE et CERTIFIÉE honnêtement ; les vrais
écarts de rétention sont corrigés par réactivation (réutilisation), sans nouveau
moteur, sans seconde source, sans toucher au corpus gelé ni à l'ordre des jours.
