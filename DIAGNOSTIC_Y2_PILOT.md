# DIAGNOSTIC Y2 — Pilote éditorial « Questions de réflexion » (Chantier C, option B1)

> Pilote contrôlé sur **22 journées** (échantillon déjà audité au Chantier C). **Pas** un déploiement
> sur les 235 jours. Y3 reste en **OPTION A** (aucune correction, aucun format modifié).

## 1. HEAD de départ

`2be5c3f` (commit du diagnostic Y2/Y3). Branche `claude/ai-career-os-saas-phfg49`, working tree propre
au lancement.

## 2. Les 22 jours du pilote

92, 106, 113, 120, 134, 148, 165 (mois 4-6 : React, tests, projet, Python, SQL, stats, ML) ·
190, 194, 197 (mois 7 : NLP/DL/LLM) · 211, 218, 241 (mois 8-9 : prompts prod, RAG, chunking) ·
253, 260 (mois 9 : golden set, sécurité) · 274, 288 (mois 10 : agents, architecture) ·
302, 314 (mois 11 : capstone SPEC, jalon) · 337, 348, 365 (mois 12 : README, offres, clôture).

## 3. Anciennes questions génériques (identiques sur les 235 jours)

```
- Qu'est-ce que je ne comprends pas encore parfaitement ?
- Comment j'expliquerais ce concept à l'oral, en entretien ?
- Où précisément le réutiliserai-je dans un projet IA/data/archi ?
```

## 4. Nouvelles questions — jour par jour

Structure imposée à chaque triplet : **[1] compréhension/prédiction · [2] diagnostic/arbitrage ·
[3] transfert/recul**. Texte complet dans `scripts/data/days-enrich-reflection-pilot.mjs`. Extrait
représentatif (jour 148) :

```
- Deux groupes affichent la même moyenne de 50 : qu'est-ce que cette seule moyenne peut cacher,
  et quelle statistique le révélerait immédiatement ?
- Sur une distribution de salaires très asymétrique, la moyenne « ment » : à quel écart le
  détectes-tu, et rapportes-tu alors la moyenne ou la médiane ?
- Dans un futur rapport destiné à une décision métier, pourquoi ne donneras-tu jamais une tendance
  centrale sans sa dispersion — que risque de conclure le lecteur sinon ?
```

Les 66 questions sont rendues dans les fichiers `curriculum/days/day-0XX.md` (section
« Questions de réflexion (à faire seul) »).

## 5. Justification pédagogique de chaque triplet

| J | Concept ancré | Q1 prédiction | Q2 diagnostic/arbitrage | Q3 transfert/recul |
|---|---|---|---|---|
| 92 | props/pureté/réutilisation | effet d'une mutation de props | granularité de découpage | ce qui doit passer par props |
| 106 | test unitaire/AAA/déterminisme | test qui ne rougit jamais | cas heureux vs cas limites | non-déterminisme ruine la suite |
| 113 | walking skeleton/commits | quand surgissent les bugs d'intégration | commits atomiques vs gros commit | preuve par l'URL directe |
| 120 | Python idiomatique | comprehension vs boucle-push | `.get` vs erreur | rôle du venv à 2 projets |
| 134 | 3NF/anomalies | 3 anomalies de la redondance | dénormalisation assumée | preuve du déménagement |
| 148 | tendance+dispersion | ce que la moyenne cache | moyenne vs médiane (asymétrie) | jamais de centrale sans dispersion |
| 165 | cross-validation | CV vs split unique | scores qui se chevauchent | limite CV sur gros volume |
| 190 | tokenisation | " chat" vs "chat" | coût FR vs EN | comptage de lettres |
| 194 | embeddings + tête légère | pourquoi ça suffit | F1 vs accuracy (déséquilibre) | quand passer au cran supérieur |
| 197 | LLM = prédicteur, contexte = mémoire | conversation neuve | où loger la mémoire | réponse hors-contexte |
| 211 | prompts versionnés | régression silencieuse | 100 % suspect | prompt = code = revert |
| 218 | ingestion RAG | modèles d'embedding différents | idempotence au plantage | limite du JSON |
| 241 | comparaison chunking | pourquoi pas par ids | gain global vs perte synthèse | golden set figé |
| 253 | golden set | questions inventées | volume vs couverture | figer pour comparer |
| 260 | prompt injection | doc piégé obéi | directe vs indirecte (RAG) | attaquer avant de défendre |
| 274 | boucle d'agent | outil inconnu | budget d'itérations | traces qui prouvent l'enchaînement |
| 288 | clean architecture | test du changement | cœur qui importe un détail | gain futur concret |
| 302 | cadrage/SPEC | rôle du hors-scope | persona vs features | cas d'usage exploitable |
| 314 | jalon démontrable | vrai jalon vs « ça avance » | clone frais | revue d'archi hebdo |
| 337 | README qui vend | problème avant stack | README illisible = invisible | limites honnêtes crédibilisent |
| 348 | analyse d'offres | supposer vs lire | 2 critères de priorisation | mots-clés CV = être vu |
| 365 | bilan chiffré | note défendable | prêt/presque/pas-encore | confiance fondée en entretien |

Chaque triplet est **répondable avec les seules connaissances déjà enseignées** ce jour-là (aucun
concept postérieur), **adapté au niveau** du moment, et **distinct** de l'exercice et de l'entretien.

## 6. Résultats de similarité (Jaccard n-grammes normalisés — casse, accents, ponctuation, technos neutralisés)

| Comparaison | Max | Seuil d'alerte | Paires signalées |
|---|---|---|---|
| Entre les 66 nouvelles questions | **0,072** | 0,30 | **aucune** |
| vs les entretiens des 313 journées | **0,057** | 0,25 | **aucune** |
| vs l'exercice principal du même jour | **0,049** | 0,30 | **aucune** |

Intégrité : **66 questions**, **0 vide**, **22/22 jours à exactement 3 questions**, **0 doublon exact**.
Aucune paire artificiellement proche ; aucune reformulation superficielle d'une même question.

## 7. Résultats de la lecture manuelle (22 sections générées, relues intégralement)

Pour chaque jour, vérifiés : ancrage réel dans le contenu, absence de concept prématuré, différence
avec l'exercice, différence avec l'entretien, valeur pédagogique, difficulté cohérente, qualité de
formulation. **Verdict uniforme : les trois questions sont spécifiques, utiles et calibrées.**
Points de vigilance vérifiés explicitement :
- **Aucun concept prématuré** : ex. jour 92 n'évoque ni état ni hooks (postérieurs) ; jour 288 et 218
  ne citent la « base vectorielle » que comme notion déjà rencontrée (RAG mois 8) et comme *limite*.
- **Distinction entretien/exercice** : confirmée quantitativement (§6) et à la lecture (les réflexions
  demandent de prédire/diagnostiquer/transférer ; les entretiens demandent d'expliquer/définir).

## 8. Classement A/B/C

| Classe | Définition | Jours |
|---|---|---|
| **A** — spécifiques, utiles, calibrées | 22/22 | tous |
| **B** — une question à reformuler | 0 | — |
| **C** — génériques/artificielles/inadéquates | 0 | — |

## 9. Défauts détectés puis corrigés

Pendant l'implémentation (avant finalisation) :
1. **Câblage du générateur — jour 365 oublié** : le jour 365 a un chemin de construction dédié
   (distinct de la branche « jours planifiés »). Symptôme : 21 jours modifiés au lieu de 22.
   **Corrigé** : ajout de `reflection: enrich.reflection` dans le bloc du jour 365.
2. **Risque d'écrasement (merge shallow)** : les 22 jours ont déjà des entrées d'enrichissement
   (theory/guided/solution). Un `...ENRICH_REFLECTION_PILOT` naïf les aurait écrasées.
   **Évité par conception** : merge **par jour** (`{ ...DAYS_ENRICH[d], ...v }`) qui ne surcharge que
   `reflection`. Vérifié : aucune correction/théorie/exemple modifié.
Aucun défaut de contenu (B/C) détecté à la lecture — rien à reformuler.

## 10. Diff exact

`22 files changed, 66 insertions(+), 66 deletions(-)` — **remplacement 1:1** des 3 puces génériques
par 3 puces spécifiques dans chaque jour ; **aucune autre ligne touchée** (vérifié : toutes les lignes
`+/-` sont des puces `- ` dans la section « Questions de réflexion »). Fichiers :
- 22 × `curriculum/days/day-0XX.md` (section réflexion uniquement)
- `scripts/data/days-enrich-reflection-pilot.mjs` (nouveau, 66 questions)
- `scripts/generate-curriculum.mjs` (import + merge par jour + `reflection` exposé sur 2 chemins + rendu conditionnel)
- **Non modifiés** : corrections, revues, leçons, projets, interface, glossaire, `data/program.json`
  (restauré — diff timestamp seul), jours 1-90 et les 213 autres jours 91-365 (byte-identiques à HEAD).

## 11. Résultats des tests

| Contrôle | Résultat |
|---|---|
| `generate-curriculum` | 795 fichiers, 365 jours ✅ |
| `curriculum:check` | Intégrité OK (365/365, 60 leçons) ✅ |
| `curriculum:depth-check` | Profondeur OK ✅ |
| `npm test` | **43/43** ✅ |
| `npm run build` | OK ✅ |
| Scan glyphes cassés (22 jours + pilote) | CLEAN ✅ |
| Périmètre Git | 22 jours + générateur + pilote ; program.json restauré ✅ |

## 12. Estimation du déploiement sur les 213 jours restants

- **Volume** : 213 jours × 3 questions = **639 questions** à concevoir (les 22 du pilote en couvrent 66).
- **Méthode** : identique — merge par jour dans le même fichier (ou fichiers par tranche), aucun
  changement supplémentaire du générateur (le câblage est déjà en place et générique).
- **Coût** : rédaction manuelle ancrée jour par jour, en **sous-batchs de ~20-25 jours** (≈ 9-10
  sous-batchs), chacun avec pipeline complet + similarité + lecture manuelle. Effort réel : la
  conception éditoriale (pas la technique, déjà faite).
- **Risques** :
  - **Remplissage** : le risque principal. À 639 questions, la tentation du patron générique augmente.
    Garde-fou : contrôle de similarité systématique + rejet de tout triplet non ancré (règle « si la
    question marcherait sur un autre jour, elle est mauvaise »).
  - **Concept prématuré** : à surveiller surtout sur les tranches DL/LLM/RAG où les notions
    s'enchaînent vite (une question ne doit jamais s'appuyer sur un jour ultérieur).
  - **Cohérence de charge** : la section réflexion s'allonge (3 questions denses vs 3 génériques) —
    acceptable, mais à ne pas transformer en QCM ni en second exercice.
  - **Faible risque technique** : le câblage est éprouvé (merge par jour, rendu conditionnel, fallback
    générique intact pour les jours non traités).

## 13. Recommandation finale

Le pilote est **concluant** : 22/22 en catégorie A, similarité négligeable, zéro régression, périmètre
strictement maîtrisé. La méthode est **transposable** aux 213 jours restants **si** la valeur éditoriale
par jour est maintenue (ancrage réel, pas de patron). Recommandation : **déploiement possible (option B)
par sous-batchs**, avec le même protocole de contrôle qu'ici — **mais uniquement sur validation**, car
c'est un travail éditorial volumineux dont la valeur dépend entièrement de la spécificité jour par jour,
pas de l'automatisation.

---

## Contrôles finaux

- HEAD de départ `2be5c3f` ; contenu inchangé hors périmètre.
- 22 jours (section réflexion) + `days-enrich-reflection-pilot.mjs` + câblage minimal du générateur.
- Checks verts ; `program.json` restauré ; working tree à committer puis synchroniser.

**Le pilote Y2 est terminé.** Question de validation posée en fin de session.
