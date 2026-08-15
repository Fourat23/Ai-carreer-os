# V45.3 — Rubric adversariale & protocole de falsification

## Posture

Le reviewer est **adversarial**. Objectif : non pas « cette leçon est-elle
bonne ? » (test V45.2) mais « **cette leçon mérite-t-elle vraiment le grade
académique maximal, et permet-elle à un néophyte de construire un modèle mental
transférable vers un problème jamais vu ?** »

L'absence d'un défaut doit être **constatée après recherche**, jamais supposée
parce que le texte est fluide. Une prose fluide n'est pas une preuve.

## Grades (redéfinis — A n'est PAS « bonne leçon »)

- **A — REFERENCE-GRADE** : on pourrait volontairement choisir cette leçon comme
  ressource PRINCIPALE pour enseigner le concept à un apprenant sérieux. Exige
  TOUT : exactitude, complétude au niveau, beginner-first non infantilisant,
  progression, vrai modèle mental, prérequis explicites, vocabulaire/mécanismes
  clairs, concept vs implémentation, exemples explicatifs, prévention des
  misconceptions majeures, première généralisation possible, pratique pertinente
  quand elle doit exister, limites/non-applicabilité, et permettre de RAISONNER
  sur un problème légèrement nouveau. Une leçon « correcte, claire, complète »
  n'obtient PAS A automatiquement.
- **B — STRONG** : très bonne, utilisable telle quelle, mais ≥ 1 limitation
  substantielle (profondeur, transfert, contre-exemples, pratique, modèle mental,
  cas limites, progression ou diagnostic).
- **C — SERVICEABLE** : on apprend correctement, mais un complément significatif
  est nécessaire.
- **D — WEAK** : compréhension fragile/partielle, risque réel de misconception ou
  d'incapacité à appliquer.
- **E — UNSAFE/INADEQUATE** : erreur significative, structure incohérente,
  prérequis critiques absents, ou contenu pédagogiquement dangereux.

## 18 dimensions (0-4)

1. technical-accuracy
2. conceptual-completeness
3. beginner-accessibility
4. prerequisite-explicitness
5. mental-model-quality
6. concrete-to-abstract-progression
7. example-quality
8. counter-example-quality
9. misconception-resistance
10. cognitive-load
11. vocabulary-scaffolding
12. autonomous-practice
13. diagnostic-reasoning
14. transfer-potential
15. professional-relevance
16. limits-and-non-applicability
17. retention-support
18. curriculum-coherence

## Portes bloquantes (la moyenne ne masque JAMAIS un défaut critique)

Interdiction automatique du grade A si l'une est vraie :
- `technical-accuracy` ≤ 2
- `beginner-accessibility` ≤ 2
- `mental-model-quality` ≤ 2

Nouveauté V45.3 vs V45.2 : la grille V45.2 imposait 7 portes ≥ 3. V45.3 ajoute
deux dimensions inédites potentiellement décisives — **counter-example-quality**
(8) et **limits-and-non-applicability** (16) — qui n'étaient pas des portes en
V45.2. Elles ne sont pas des portes bloquantes de A ici non plus (une leçon de
fondation peut légitimement avoir peu de contre-exemples), MAIS un score faible
sur elles, combiné à un transfert faible, justifie un downgrade A→B. C'est le
principal levier de falsification.

## Test de falsification par leçon (8 attaques)

Pour CHAQUE leçon, produire :

- **A. Core claim** : l'idée qui doit rester 6 mois plus tard.
- **B. Teach-back** : un néophyte peut-il l'expliquer sans répéter les mots ?
- **C. Novel case** : un petit problème ABSENT de la leçon ; la leçon donne-t-elle
  les outils pour raisonner dessus ?
- **D. Counter-example** : un cas où appliquer naïvement la règle serait mauvais.
- **E. Misconception attack** : la mauvaise interprétation réaliste d'un débutant ;
  la leçon la neutralise-t-elle ?
- **F. Dependency attack** : quelle connaissance supposée n'est peut-être pas
  acquise ?
- **G. Professional decision** : permet-elle de répondre « que ferais-je ici et
  pourquoi ? »
- **H. Evidence** : citations textuelles précises justifiant le verdict. **Pas de
  verdict sans preuve textuelle.**

## Transfert T0-T5 (recalibré, plus sévère)

- **T0** reconnaissance · **T1** restitution guidée · **T2** application proche ·
  **T3** application avec variation réelle · **T4** transfert multi-étapes /
  informations concurrentes · **T5** far transfer (domaine différent + pont
  conceptuel + plusieurs étapes).
- Une leçon de fondation PEUT être T1/T2 — ce n'est PAS une mauvaise note
  académique. Un excellent A peut être T2.
- **Interdit** de mettre T3/T4 juste parce qu'il y a : un exemple métier, une
  mention « production », un mini-exercice, ou plusieurs technologies citées.
- **T4/T5 exigent une PREUVE de transfert** (l'apprenant doit devoir combiner
  plusieurs idées / arbitrer des infos concurrentes).

> Note de méthode : V45.2 utilisait T0-T4 et a classé 68 leçons T4. V45.3 ré-évalue
> sur T0-T5 avec exigence de preuve. Une baisse massive de T4 vers T2/T3 est
> attendue et **n'est pas** une régression de qualité — c'est une recalibration
> de l'échelle de transfert. Ce point sera distingué explicitement du verdict
> académique dans le rapport.

## Blind review (obligatoire)

- **PASS A** : lire le fichier complet → produire la fiche contradictoire →
  attribuer score+grade → enregistrer → SEULEMENT ENSUITE lire le verdict V45.2
  → comparer. `previousGrade` n'est renseigné qu'APRÈS.
- **PASS B** : après les ≥24, reprendre 6 anchors dans un ordre différent, masquer
  ses propres scores PASS A, re-noter, mesurer la concordance interne V45.3.

## Classification des défauts (pour MINOR_FIX et downgrades)

`STYLE_ONLY` · `PEDAGOGICAL_MINOR` · `CONCEPTUAL_GAP` · `PRACTICE_GAP` ·
`TRANSFER_GAP` · `PREREQUISITE_GAP` · `MISCONCEPTION_RISK` · `TECHNICAL_RISK`.

## Verdict global possible (aucun préféré)

- **CERTIFICATION_CONFIRMED** : la conclusion V45.2 résiste.
- **CERTIFICATION_PARTIALLY_CONFIRMED** : corpus fort mais « 128/128 A » et/ou le
  transfert étaient surévalués.
- **CERTIFICATION_REJECTED** : grille/calibration V45.2 matériellement trop
  permissive.

Le verdict s'argumente à partir de la **distribution ET des défauts observés**,
jamais d'une formule arbitraire.
