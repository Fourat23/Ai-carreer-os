# AUDIT PÉDAGOGIQUE GLOBAL — AI Career OS (jours 1 à 365)

> **Phase d'audit uniquement.** Aucun jour, leçon, projet, interface ni générateur n'a été
> modifié pendant cet audit. Seuls des fichiers d'audit et un script d'audit (lecture seule)
> ont été ajoutés. Les chiffres sont **recalculés** à partir des fichiers réels, jamais supposés.
>
> Commit audité : `b5c5a39` · branche `claude/ai-career-os-saas-phfg49` · working tree propre au démarrage.

---

## 0. Suivi des remédiations (le diagnostic initial ci-dessous est CONSERVÉ intact)

> Cette section trace les corrections apportées APRÈS le diagnostic. Elle ne réécrit ni n'efface
> les constats d'origine (§1-§17), qui restent le point de référence.

- **Chantier A — Revues (problème Y1) : ✅ TERMINÉ.** Les **13 revues** identifiées comme non
  enrichies (7, 14, 21, 28, 182, 189, 196, 203, 210, 217, 224, 231, 238) ont reçu la couche
  d'évaluation enrichie (synthèse structurée, test théorique spécifique, exercice pratique/conception,
  **grille de notation /100 mesurable avec seuils acquis/fragile/insuffisant**, diagnostic
  erreur→compétence, remédiation conditionnelle + rattrapage ciblé + décision + livrables,
  3-5 questions d'entretien distinctes). Le contenu de base des revues a été **conservé**.
  - **Recalcul après remédiation : 52/52 revues enrichies** (contre 39/52 au diagnostic).
  - **Anomalies `revue` dans `audit-pedagogique-365.json` : 13 → 0.** Total anomalies : 50 → 37.
  - **Unicité vérifiée** : les 4 sections enrichies (synthèse, grille, remédiation, entretien) sont
    **distinctes sur les 52 revues** (0 doublon exact), y compris entre les 13 nouvelles et les 39 existantes.
  - Mécanisme : nouveau `scripts/data/days-enrich-reviews.mjs` (ENRICH_REVIEWS) + câblage minimal du
    générateur (un import + un token de merge). Aucun jour d'apprentissage, leçon, projet ni autre
    revue modifié. Sous-batchs commités : A1 (`b841946`), A2 (`802a91e`), A3 (`896306a`).
- **Note revues révisée : 7,5/10 → ~9/10** (les 52 revues possèdent désormais grille mesurable,
  remédiation ciblée et questions d'entretien).
- **Chantier B — Questions d'entretien génériques 1-30 (problème M1) : ✅ TERMINÉ.** Les **3 groupes
  de questions d'entretien génériques** (jours {1,2,3,18} « git commit » ; {4,5,6,8,9,10,11,12,13,22,23,24,26,27}
  « valeur vs référence » ; {15,16,17,19,20,25,29} « complexité ») réutilisées sur **25 jours** ont été
  remplacées par des questions **distinctes, spécifiques au contenu exact de chaque jour** et adaptées
  au niveau. Chaque question suit un standard complet (mise en situation, ce qu'elle évalue, réponse
  attendue, niveaux débutant/correct/excellent, relance, erreurs à éviter, formulation orale) et
  n'utilise aucun concept enseigné après le jour concerné.
  - **Recalcul après remédiation : 291 → 313/313 textes d'entretien distincts** ; **groupes de
    duplication dans les jours 1-30 : 3 → 0.** Anomalie `duplication` d'entretien de l'audit : résolue.
  - **Aucune nouvelle duplication** créée avec les jours 31-365 : similarité max (n-grammes
    tech-normalisés) d'un jour affecté vs 31-365 = **0,037** ; entre les 25 nouvelles questions = **0,024**.
  - Mécanisme : nouveau `scripts/data/days-enrich-interviews-1-30.mjs` (champ `interview` uniquement)
    + câblage minimal (merge en dernier). **SEUL le bloc « Question d'entretien » change** dans chaque
    jour ; théorie/exemple guidé/exercice/correction inchangés. Jour 30 (déjà distinct) et revues non
    touchés. Sous-batchs commités : B1 (`930a37a`), B2 (`2ebb3f5`), B3 (`c7ffd8c`).
  - Lecture manuelle traçable de 6 jours (3, 8, 12, 16, 24, 26) : chaque question correspond bien à
    l'objectif et à l'exercice du jour.
- **Chantier M2 — Profondeur du mois 7 (183-210) : ✅ TERMINÉ (audit manuel + remédiation ciblée).**
  Audit manuel des **24 journées d'apprentissage** (183-188, 190-195 DL ; 197-202, 204-209 LLM),
  diagnostic journée par journée dans **`DIAGNOSTIC_M2.md`**. Résultat : **22 journées SOLIDES**
  (dont **toute la tranche LLM 197-209**, la plus riche du mois), **2 à consolider** (183/184),
  **0 insuffisante**, **0 anomalie** de l'audit automatique dans 183-210.
  - **Vérité technique tranchée** : la règle de mise à jour `pred - y` (jours 183/184) est
    **exactement** le gradient de l'**entropie croisée binaire + sigmoïde** (vérifié numériquement :
    0,055025 = gradient BCE, ≠ 0,0218 gradient MSE), **pas** celui de la MSE affichée
    `((pred-y)**2).mean()`. Correction = **clarification d'étiquette**, le code étant juste.
  - **Remédiation** (périmètre validé « minimal + théorie DL », **sans remplissage**) : 183
    (clarification loss/gradient dans `logic` + `pitfall`), 184 (théorie backpropagation approfondie
    + clarification loss ; `pitfall`), 187 (théorie : anatomie d'un pas d'entraînement + batching/shuffle).
    **SEULS 183/184/187 touchés** ; théorie/guidés/exercices/cas des 22 autres jours et des 4 revues
    inchangés. Format **91-365 respecté** (pas de champs `simple`/`improved`, absents de tout 91-365).
  - **Constats provisoires invalidés** : objectifs courts (style curriculum-wide, ~3,9 mots), théorie
    « trop brève » (dense et compensée par des guidés excellents), ajout `simple`/`improved` (n'existe
    que sur le palier 1-90). Commit : `85e44cf`.
- **Chantiers restants** : N1/N3/Y4 (leçons orphelines, titre 314/321, critères subjectifs),
  Y2/Y3 (homogénéité mini-quiz et structure des corrections 91-365). Voir §17.

---

## 1. Résumé exécutif honnête

AI Career OS est un parcours **structurellement très complet et techniquement solide**, au-dessus
du niveau habituel d'un curriculum auto-généré. Les points objectivement forts, vérifiés
automatiquement sur les 365 jours :

- **313/313 jours de travail** ont un exemple guidé, un cours approfondi, une projection « pourquoi ça comptera », une correction.
- **313 modèles mentaux distincts** (0 doublon) et **287 cas métier distincts** (0 doublon) — la spécificité par jour est réelle, pas cosmétique.
- **0 lien de leçon cassé, 0 bloc de code non fermé, 0 caractère corrompu, 0 placeholder réel** sur l'ensemble du corpus.
- Les **7 projets** sont orientés portfolio (ce que ça prouve à un recruteur, tests, README, ADR, démo, sécurité) et le **projet final (DocSense)** est de qualité remarquable (évaluation chiffrée, guardrails, threat model, dashboard qualité).
- La **progression est globalement linéaire et cohérente** ; les mentions « anticipées » d'une technologie sont des annonces de feuille de route (teasers), pas des concepts utilisés avant d'être enseignés.

Mais l'audit révèle aussi des **écarts d'homogénéité réels** entre les paliers d'enrichissement,
et **un point que la description de départ affirmait à tort** :

- **La formule « toutes les revues sont enrichies » est FAUSSE après recalcul** : **13 des 52 revues** n'ont que la structure de base (sans grille de notation mesurable ni plan de remédiation ni questions d'entretien).
- **Les jours 1 à 30 réutilisent 3 questions d'entretien génériques par compétence** (25 jours concernés) au lieu de questions spécifiques par jour, alors que les jours 31-365 en ont chacun une distincte.
- **Le palier 91-365 (235 jours) est structurellement plus léger** que 1-90 : pas de mini-quiz, corrections plus courtes (médiane 334 mots contre ~590 en 1-90), sections « solution simple / améliorée » fondues dans la prose au lieu d'être séparées.
- **26 jours de travail (fondamentaux jsts/algo/ds/gitlinux) n'ont pas de cas métier**, et **3 leçons sont orphelines** (jamais liées).

**Verdict global : c'est bien une formation progressive, précise et professionnalisante — pas un
simple empilement de pages longues.** Les défauts sont réels mais majoritairement des problèmes
d'**homogénéité et de finition**, pas de justesse technique. Aucun problème **bloquant** n'a été
détecté. Note globale indicative : **8,0 / 10** (voir §11).

---

## 2. Méthodologie

L'audit combine **deux niveaux de preuve**, explicitement distingués :

### 2a. Audit automatisé (couverture : 365/365 jours)
Script `scripts/audit-pedagogique.mjs` (lecture seule, ajouté pour cet audit). Il parse chaque
fichier `curriculum/days/day-NNN.md` et `curriculum/solutions/day-NNN-solution.md`, recalcule
toutes les métriques, et produit :
- `audit-pedagogique-365.json` — anomalies machine-readable (50 entrées, statut `open`).
- `scripts/audit-inventory.json` — inventaire par jour (365 entrées).

Contrôles automatisés : présence des sections, longueurs (théorie, correction), liens de leçons
inexistants, blocs de code non fermés, caractères corrompus, placeholders/TODO réels, titres
dupliqués, **doublons exacts** de modèle mental / cas métier / question d'entretien, revues non
enrichies, leçons orphelines, critères non mesurables (heuristique).

### 2b. Lecture manuelle (échantillon tracé)
Lus intégralement pendant cet audit, avec citations vérifiables ci-dessous :
- **Les 8 fiches projet** (`project-01..06`, `project-final`) — structure et contenu.
- **Jour 121** (théorie + exemple guidé + correction, palier 91-365) — cité en §4.
- **Jour 91** (revue) ; **solutions 121, 200, 271** (section « logique attendue »).
- **Jour 1** (question d'entretien) ; **jours 2, 18** (comparaison de doublon d'entretien).
- **Revues 7, 91, 98, 182** (comparaison structure de base vs enrichie).
- **Jours 10, 44** (critères de validation) ; **jours 94, 115, 162, 24** (contexte des faux positifs placeholder).

Connaissance **de première main** (contenu rédigé dans les sessions de ce projet, traçable dans
l'historique Git) : **jours 31-90** (batchs 5G/5H) et **jours 151-180** (batch 5F).

**Limite de méthode assumée :** je n'ai **pas** lu manuellement les 313 jours. Le scoring
pédagogique /10 par jour (§4) est donc fourni **pour l'échantillon lu**, et **agrégé par mois**
à partir des métriques automatiques + de l'échantillon. Je ne fabrique aucun score jour-par-jour
sur les jours non lus.

---

## 3. Chiffres recalculés (source : fichiers réels)

| Métrique | Valeur recalculée |
|---|---|
| Jours générés | **365** (fichiers md + solutions : 365 + 365) |
| Jours d'apprentissage | **313** (dont 10 portent un tag `project`) |
| Jours de revue | **52** |
| Leçons de fond | **60** (dont **3 orphelines**) |
| Fiches projet | **8** (7 projets + projet final) |
| Exemple guidé (jours de travail) | **313 / 313** ✅ |
| Modèles mentaux distincts | **313 / 313** (0 doublon) |
| Cas métier présents / distincts | **287 présents, 287 distincts** (0 doublon) — **26 jours sans cas métier** |
| Questions d'entretien distinctes | **291 / 313** — 3 groupes génériques (25 jours, tous en 1-30) |
| Liens de leçon cassés | **0** |
| Blocs de code non fermés | **0** |
| Caractères corrompus | **0** |
| Placeholders réels | **0** (tous les hits initiaux étaient des faux positifs — voir §14) |
| Revues enrichies (4 sections d'éval) | **39 / 52** — **13 non enrichies** |
| Mots / jour de travail (min / médiane / max) | 644 / 1292 / 2217 |
| Mots / correction (min / médiane / max) | 192 / 345 / 754 |

### Répartition par palier
| Palier | Jours | Mini-quiz | Sol. « simple » (section) | Théorie médiane | Correction médiane |
|---|---|---|---|---|---|
| **deep** (1-30) | 26 trav. | 26/26 | 26/26 | 333* | 607 |
| **mid** (31-90) | 52 trav. | 52/52 | 52/52 | 719* | 587 |
| **action** (91-365) | 235 trav. | **0/235** | **0/235** | 382* | **334** |

\* « théorie médiane » = mots de la seule section « Cours approfondi » ; le total du jour est plus
élevé (médiane globale 1292). Le palier deep écrit la théorie autrement (plus dans l'exercice/guidé).

---

## 4. Audit pédagogique (échantillon lu) et carte de progression

### Barème (10 axes, /10) appliqué à l'échantillon lu
Clarté débutant · exactitude technique · profondeur · modèle mental · exemple guidé · pratique
autonome · correction · lien pro · question d'entretien · continuité.

**Jour 121 — « Modules, imports, fichiers en Python » (palier action, lu intégralement) : 9/10.**
Preuves : modèle mental distinct et juste (« un module Python est un NAMESPACE dans un fichier »),
fondations expliquées depuis zéro (fonction → module → package, garde `__main__`, `with`), exemple
guidé **exécutable et correct** (séparation stockage/métier/interface, `pathlib`, `json.dump`),
lien vers la leçon `python-foundations`, correction qui distingue solution simple et améliorée
(« ajouter une commande ne touche qu'un module »). Aucun raccourci dangereux. — Représentatif de la
qualité réelle du palier 91-365 : **substantiel, pas creux.**

**Jour 1 — question d'entretien : signal faible.** La question « Que se passe-t-il quand tu tapes
`git commit` ? » est **identique** aux jours 2, 3, 18 (voir §14). Le reste du jour est solide, mais
la question n'est pas spécifique.

**Corrections 121 / 271 (lues) :** contiennent bien « Solution simple : … Solution améliorée : … »
**dans la prose** de « La logique attendue » → le contenu minimal/robuste EST présent, seule la
*forme* (sections séparées) diffère de 1-90.

### Carte de progression des 12 mois (métriques recalculées)
| Mois | Thème | Jours trav. | Guided | Cas métier | Mots/j | Mots/corr | Revues enrichies |
|---|---|---|---|---|---|---|---|
| 1 | Fondations (terminal, JS, algo, structures) | 24 | 100% | **0%** | 1305 | 595 | **0/4** |
| 2 | TS, POO, patterns, Projet 1 TaskFlow | 24 | 100% | 92% | 1857 | 595 | 4/4 |
| 3 | HTTP/REST/Express/SQL, Projet 2 LivreAPI | 30 | 100% | 100% | 2027 | 592 | 5/5 |
| 4 | React full-stack, Projet 3 BiblioApp | 24 | 100% | 100% | 1256 | 340 | 4/4 |
| 5 | Python/pandas/ETL, Projet 4 DataPulse | 24 | 100% | 100% | 1337 | 322 | 4/4 |
| 6 | ML classique, Projet 5 ChurnScope | 30 | 100% | 100% | 1359 | 323 | 4/5 |
| 7 | **LLM foundations** | 24 | 100% | 100% | **838** | **236** | **0/4** |
| 8 | RAG, Projet 6 DocQA (part.) | 24 | 100% | 100% | 1073 | 301 | **0/4** |
| 9 | Sécurité IA, éval, Projet 6 | 30 | 100% | 100% | 1176 | 345 | 5/5 |
| 10 | Agents, workflows, archi | 24 | 100% | 100% | 1283 | 363 | 4/4 |
| 11 | Projet final DocSense (build) | 24 | 100% | 100% | 1276 | 350 | 4/4 |
| 12 | DocSense (finition) + carrière | 31 | 100% | 100% | 1329 | 347 | 5/5 |

**Lecture de la carte :** transitions cohérentes (fondations → web → data → ML → LLM → RAG → agents
→ capstone → carrière). **Mois 7 (LLM) est le plus léger** (838 mots/jour, corrections 236 mots) —
à surveiller (§8). Mois 1 sans cas métier (fondamentaux) et sans revues enrichies (§7). Les projets
tombent aux bons moments et chaque projet réutilise l'acquis (P3 branché sur l'API de P2, etc.).

---

## 5. Points forts

1. **Spécificité réelle du contenu** : 313 modèles mentaux distincts, 287 cas métier distincts, 291 questions d'entretien distinctes. Le contenu n'est pas interchangeable (contrairement au risque des curricula générés).
2. **Propreté technique** : 0 lien cassé, 0 bloc de code non fermé, 0 caractère corrompu, 0 placeholder. Exceptionnel sur 365 jours.
3. **Exemples guidés exécutables** : l'échantillon lu (jour 121, jours 31-90 de première main) montre du code correct, commenté, relié au concept annoncé.
4. **Projets portfolio-grade** : chaque fiche projet répond à « ce que ça prouve à un recruteur », impose tests/README/ADR/démo, et met en garde contre le copier-coller d'IA. Le projet final (DocSense) avec évaluation chiffrée, guardrails et threat model est un vrai différenciateur.
5. **Orientation « bankable »** : chaque jour a une section « pourquoi ça comptera » et une question d'entretien ; le mois 12 couvre ciblage d'entreprises, négociation, storytelling.
6. **Corrections avec méthode** : logique attendue + pièges + vérifications + oral partout ; simple/robuste distingués (en sections ou en prose selon le palier).

---

## 6. Problèmes BLOQUANTS

**Aucun.** Aucun jour n'est privé de correction, aucun lien n'est cassé, aucun code n'est
manifestement non exécutable dans l'échantillon lu, aucun projet ne demande une compétence non
enseignée avant lui. Le parcours est praticable de bout en bout.

---

## 7. Problèmes MAJEURS

| # | Problème | Preuve | Portée | Recommandation |
|---|---|---|---|---|
| M1 | **Questions d'entretien génériques en jours 1-30** | 3 groupes exacts : jours {1,2,3,18} (« git commit »), {4,5,6,8,9,10,11,12,13,22,23,24,26,27} (« valeur vs référence »), {15,16,17,19,20,25,29} (« complexité »). 25 jours réutilisent 3 questions. Les jours 31-365 en ont chacun une distincte. | Palier deep uniquement | Rédiger une question d'entretien spécifique par jour en 1-30, au standard des jours 31+. |
| M2 | **La théorie du mois 7 (LLM) est nettement plus légère** | 838 mots/jour et 236 mots/correction en moyenne, contre 1200-2000 ailleurs ; correction la plus courte du corpus (192 mots). | Mois 7 (24 jours) | Vérifier manuellement la profondeur réelle des jours LLM 181-204 ; étoffer théorie/correction là où c'est superficiel (le mois LLM est central pour la promesse « bankable IA »). |

> Note d'honnêteté : M2 est un signal **quantitatif** (longueur). La longueur n'est pas une preuve
> de qualité (ni dans un sens ni dans l'autre) ; ce mois mérite une **lecture manuelle ciblée** avant
> de conclure qu'il est réellement sous-traité. Il est classé « majeur » par prudence car c'est le
> cœur du positionnement IA.

---

## 8. Problèmes MOYENS

| # | Problème | Preuve | Recommandation |
|---|---|---|---|
| Y1 | **13 revues non enrichies** (contredit « toutes les revues sont enrichies ») | Revues **7, 14, 21, 28** (mois 1) et **182, 189, 196, 203, 210, 217, 224, 231, 238** (mois 7-8) n'ont que Bilan/Test/Checklist/Critères/Exercice archi — **sans** Synthèse structurée, Grille de notation mesurable, Plan de remédiation, ni Questions d'entretien. Comparé à la revue 91 qui les a toutes. | Ajouter les 4 sections d'évaluation enrichie à ces 13 revues (grille /3 mesurable + remédiation keyée sur les erreurs). |
| Y2 | **Palier 91-365 sans mini-quiz** | 235/235 jours action sans section « Mini-quiz », alors que 1-90 l'ont (78/78). | Ajouter un mini-quiz (4 Q + réponses en correction) au palier 91-365 pour l'homogénéité (optionnel mais recommandé). |
| Y3 | **Corrections du palier action plus courtes et à structure différente** | Médiane 334 mots vs 587-607 en 1-90 ; « solution simple/améliorée » en prose et non en sections. Le contenu minimal/robuste EST présent (vérifié sur sol. 121/271), mais moins scaffoldé. | Décision de cohérence : soit uniformiser (sections dédiées), soit assumer et documenter le choix. Non bloquant. |
| Y4 | **Critères de validation parfois subjectifs** | Jour 10 : « bilan() lisible sans effort », « Modèle du personnage cohérent » — non mesurables. (Jours 78/79 signalés par l'heuristique mais en réalité vérifiables.) | Reformuler les critères subjectifs en critères observables. |

---

## 9. Problèmes MINEURS

| # | Problème | Preuve | Recommandation |
|---|---|---|---|
| N1 | **3 leçons orphelines** (jamais liées d'un jour) | `ci-cd`, `docker-containers`, `llm-observability`. Docker/CI sont pourtant enseignés (jours 307/320/326 DocSense) mais sans lier la leçon. | Lier ces leçons depuis les jours DevOps/capstone concernés. |
| N2 | **Leçons sous-liées** | `deployment-secrets` (1), `monitoring-production` (1), `observability-logging` (2). | Renforcer les renvois. |
| N3 | **Titre dupliqué** | Jours 314 et 321 : « DocSense : jalon démontrable » (deux jalons différents, même titre). | Différencier les titres (préciser le jalon). |
| N4 | **26 jours de travail sans cas métier** | jsts (14), algo (7), gitlinux (4), ds (1) — fondamentaux mois 1-3. Non requis par le contrôle de profondeur, mais l'ambition « cas métier par jour » n'est pas tenue pour ces jours. | Ajouter un cas métier léger, ou assumer que les fondamentaux purs n'en ont pas. |
| N5 | **Docker/CI enseignés uniquement « just-in-time » dans le capstone** | Aucun jour-titre dédié Docker/CI avant le mois 11 ; première rencontre dans DocSense (jours 307/320/326). | Acceptable, mais un mini-jour DevOps autonome en amont réduirait la charge du capstone. |

---

## 10. Tableau des jours à corriger en priorité

| Priorité | Jours / cible | Action | Gravité |
|---|---|---|---|
| 1 | Revues **7, 14, 21, 28, 182, 189, 196, 203, 210, 217, 224, 231, 238** | Ajouter les 4 sections d'évaluation enrichie | Moyen (×13) |
| 2 | Jours **1-30** (25 jours à question générique) | Question d'entretien spécifique par jour | Majeur |
| 3 | Mois **7 (jours 181-204)** | Lecture manuelle ciblée + étoffer si superficiel | Majeur (à confirmer) |
| 4 | Jour **10** (+ audit léger des critères 1-30) | Rendre les critères mesurables | Moyen |
| 5 | Jours **314 / 321** | Différencier les titres | Mineur |
| 6 | Leçons **ci-cd, docker-containers, llm-observability** | Lier depuis les jours pertinents | Mineur |
| 7 | 26 jours fondamentaux sans cas métier | Ajouter un cas métier léger (optionnel) | Mineur |

---

## 11. Notation par mois

Note = moyenne pondérée : complétude structurelle (auto), distinctness (auto), profondeur (auto +
échantillon), revues enrichies (auto), lecture d'échantillon quand disponible.

| Mois | Note /10 | Justification |
|---|---|---|
| 1 | 7,5 | Contenu solide et guided partout, mais 0 cas métier, 0 revue enrichie, questions d'entretien génériques. |
| 2 | 9,0 | Théorie la plus riche, cas métier 92%, revues enrichies, contenu de première main vérifié. |
| 3 | 9,0 | Théorie la plus riche du parcours (2027 mots/j), 100% cas métier, revues enrichies, Projet 2 fort. |
| 4 | 8,5 | Full-stack cohérent, réutilise l'API de P2 ; corrections plus courtes. |
| 5 | 8,5 | Python/data/ETL, Projet 4 rejouable ; bon. |
| 6 | 8,5 | ML honnête (anti-leakage, baseline), de première main pour 151-180 ; 1 revue non enrichie. |
| 7 | **6,5** | LLM : le plus léger (théorie + correction) ; 0 revue enrichie ; **à lire manuellement**. |
| 8 | 7,5 | RAG : bon mais théorie moyenne (1073 mots) et 0 revue enrichie. |
| 9 | 8,5 | Sécurité IA / éval, revues enrichies, Projet 6 solide. |
| 10 | 8,5 | Agents/workflows/archi, cohérent. |
| 11 | 8,5 | Capstone DocSense bien découpé jour par jour. |
| 12 | 9,0 | Finition DocSense + carrière (ciblage, négociation) — professionnalisant. |

**Note globale indicative : 8,0 / 10.**

---

## 12. Notation de chaque projet (portfolio /10)

Basée sur la **lecture intégrale des 8 fiches projet**.

| Projet | Mois | Note portfolio | Commentaire |
|---|---|---|---|
| P1 TaskFlow (CLI TS) | 2 | 7,5/10 | Solide premier projet (types, interface Store, tests, README, ADR). Modeste par nature (CLI). Prérequis disponibles. |
| P2 LivreAPI (REST+SQLite) | 3 | 8,5/10 | Excellent : API cohérente, SQL paramétré, tests, sécurité de base, collection Postman « clonable en 5 min ». |
| P3 BiblioApp (full-stack) | 4 | 8,5/10 | Front React branché sur **son propre** P2 → démontre le full-stack de bout en bout. Forte valeur. |
| P4 DataPulse (ETL+dashboard) | 5 | 8,0/10 | Pipeline rejouable, rapport qualité, 3 questions métier. Brief un peu court (488 mots). |
| P5 ChurnScope (ML e2e) | 6 | 8,5/10 | ML « professionnel » : baseline, anti-leakage, métrique justifiée, rapport orienté décision. Anti-Kaggle-copié. |
| P6 DocQA (RAG évalué) | 8-9 | 9,0/10 | RAG **avec chiffres d'évaluation avant/après** — rare en portfolio, très différenciant. |
| Projet final DocSense | 11-12 | 9,5/10 | Pièce maîtresse : 10 dimensions prouvées, golden set, LLM-as-judge, dashboard qualité, guardrails, threat model, Docker/CI, local reproductible. Excellent. |

**Tous les projets ont leurs prérequis disponibles avant démarrage** (vérifié : P2 après HTTP/SQL,
P3 après React+P2, P5 après ML, P6 après RAG). **Réalisables sans dépendance excessive à l'IA** :
les briefs l'exigent explicitement (« pas un notebook Kaggle copié », consignes IA « débloquer, pas
faire à ta place »). Note portfolio moyenne : **8,5/10**.

---

## 13. Notation des revues

| Aspect | Constat |
|---|---|
| Couverture | 52 revues (une par semaine de travail). |
| Enrichies (grille /3 + remédiation + éval + entretien) | **39/52 (75%)**. |
| Base seulement | **13/52 (25%)** — mois 1, 7, 8 principalement (voir Y1). |
| Qualité des enrichies (échantillon 91, 98) | Bonne : synthèse structurée, grille /3 **mesurable**, remédiation **keyée sur l'erreur**, 5 questions d'entretien alignées sur les compétences de la semaine. Ce sont de **vraies évaluations**, pas des résumés. |
| Qualité des non-enrichies (échantillon 7, 182) | Structure de base réelle (Test théorique, Test pratique, Mini-projet, Checklist, Critères de passage, Exercice archi) → elles **évaluent**, mais sans grille mesurable ni remédiation ciblée ni questions d'entretien. Plus proches d'un « bilan » que d'une « évaluation notée ». |

**Note revues : 7,5/10** (les 39 enrichies sont excellentes ; les 13 restantes tirent la moyenne).

---

## 14. Risques de contenu générique

**Risque global : FAIBLE**, avec deux poches localisées.

- **Modèles mentaux :** 313/313 distincts (0 doublon exact). Aucun risque.
- **Cas métier :** 287/287 distincts (0 doublon exact). Aucun risque de duplication ; risque
  d'**absence** sur 26 jours fondamentaux (N4).
- **Questions d'entretien :** 291/313 distinctes. **Seule poche générique : jours 1-30** (M1).
- **Faux positifs écartés (honnêteté méthodologique)** : la première passe automatique signalait
  11 « placeholders/TODO » et 118 « doublons » — **tous invalidés après vérification manuelle** :
  - « TODO » = statut de tâche (`statut: 'todo'` jour 44) ou exemple `grep TODO` (jour 2) ;
  - « placeholder » = attribut React `placeholder="Rechercher"` (jours 94, 115) ;
  - « à compléter » = prose légitime (« AUC à compléter par précision/rappel », jour 162) ;
  - les 118 « doublons » Jaccard étaient des **paires** dérivées des 3 vrais groupes génériques de 1-30.
  Le détecteur a été corrigé pour ne pas reporter ces faux positifs (§2).

---

## 15. Risques d'inexactitude technique

**Risque global : FAIBLE** sur l'échantillon vérifié.

- Le code lu (jour 121, corrections 121/200/271, jours 31-90 de première main) est **correct et
  exécutable**, relié au concept annoncé, sans raccourci dangereux (ex. jour 121 : `with` = fermeture
  garantie, garde `__main__` correctement expliqué).
- **0 bloc de code non fermé** sur 365 jours (contrôle automatique) → pas de code tronqué structurel.
- **Limite :** l'exactitude technique **ligne à ligne** n'a pas pu être vérifiée sur les 313 jours.
  Les mois à surveiller en priorité pour une revue technique fine sont **7 (LLM)** et **8 (RAG)**,
  centraux pour la promesse IA et les plus légers en volume. Aucune erreur technique n'a été
  **observée** dans l'échantillon — je ne peux pas affirmer qu'il n'y en a aucune ailleurs.

---

## 16. Recommandations de remédiation

1. **Enrichir les 13 revues** (Y1) : ajouter Synthèse structurée + Grille de notation /3 mesurable + Plan de remédiation keyé sur l'erreur + 5 questions d'entretien. Mécanisme existant (`DAYS_ENRICH[jour].reviewSynthese/reviewGrid/remediation/interview`) — même méthode que les 39 déjà faites.
2. **Spécifier les questions d'entretien 1-30** (M1) : une par jour, au standard 31+ (question + réponse attendue + relance), via un fichier d'enrichissement du palier deep.
3. **Revue manuelle du mois 7 (LLM)** (M2) : lire 181-204, mesurer la profondeur réelle, étoffer théorie/corrections là où c'est superficiel.
4. **Lier les 3 leçons orphelines** (N1) depuis les jours DevOps/capstone.
5. **Différencier les titres 314/321** (N3) et **rendre mesurables les critères subjectifs** (Y4, à commencer par le jour 10).
6. **Décision d'homogénéité (Y2/Y3)** : trancher si le palier 91-365 doit recevoir mini-quiz + sections de correction séparées, ou si l'écart est assumé et documenté.
7. **Optionnel** : cas métier léger sur les 26 jours fondamentaux (N4) ; mini-jour DevOps autonome avant le capstone (N5).

---

## 17. Ordre recommandé des futurs chantiers

1. **Chantier A — Revues (Y1)** : les 13 revues non enrichies. Impact élevé, effort modéré, mécanisme existant. **À faire en premier** (corrige une affirmation fausse du bilan actuel).
2. **Chantier B — Questions d'entretien 1-30 (M1)** : 25 jours. Impact élevé sur la promesse « prêt pour l'entretien », effort modéré.
3. **Chantier C — Audit + renforcement mois 7 LLM (M2)** : lecture manuelle d'abord, puis enrichissement ciblé. Impact élevé (cœur IA), effort variable.
4. **Chantier D — Finitions (N1, N3, Y4)** : leçons orphelines, titres dupliqués, critères subjectifs. Effort faible, rapide.
5. **Chantier E — Décision d'homogénéité (Y2/Y3)** : mini-quiz et structure des corrections 91-365. Effort élevé si retenu ; à trancher stratégiquement avant de s'engager.
6. **Chantier F — Optionnels (N4, N5)** : cas métier fondamentaux, mini-jour DevOps. Basse priorité.

---

### Fichiers produits par cet audit (aucun fichier pédagogique modifié)
- `AUDIT_PEDAGOGIQUE_365.md` (ce rapport)
- `audit-pedagogique-365.json` (50 anomalies machine-readable, statut `open`)
- `scripts/audit-inventory.json` (inventaire des 365 jours)
- `scripts/audit-pedagogique.mjs` (script d'audit, lecture seule)

*Fin de l'audit — phase diagnostic uniquement. Aucune correction appliquée.*
