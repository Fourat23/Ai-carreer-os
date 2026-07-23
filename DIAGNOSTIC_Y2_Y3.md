# DIAGNOSTIC Y2/Y3 — Audit structurel du palier 91-365 (Chantier C)

> **Fichier de diagnostic** (Chantier C). Ne remplace aucun rapport historique.
> **Phase diagnostique uniquement — aucun contenu pédagogique modifié.**
> Données : `audit-y2-y3.json` (métriques automatiques + échantillon manuel) produit par
> `scripts/audit-tier-91-365.mjs` (lecture seule). HEAD de départ : `5eca0ef`.

## 1. Résumé exécutif

Deux signaux étaient à vérifier sur le palier 91-365 :
- **Y2** — absence de section « Mini-quiz » explicite.
- **Y3** — corrections plus courtes, sans rubriques séparées « Solution simple » / « Solution améliorée ».

**Verdict global : différence de PRÉSENTATION et de CONVENTION de palier, pas défaut structurel.**

- **Y3 → faux positif (différence de présentation).** Les 235 corrections du palier ont toutes les
  4 rubriques attendues (raisonnement, pièges, vérifications, oral). La distinction simple/robuste
  **existe** : soit en **texte inline** dans « La logique attendue » (« *Solution simple : … Solution
  améliorée : …* ») pour **158/235** jours, soit sous forme de **raisonnement + compromis assumé**
  approprié au contenu (décision, méthode) pour les **77/235** jours restants (tranche 181-270).
  Aucune correction classée insuffisante à la lecture manuelle.
- **Y2 → réduction réelle mais mineure et cohérente.** Le palier 91-365 n'a pas de quiz spécifique
  au contenu, mais dispose d'une **évaluation formative** : exemple guidé travaillé (pré-pratique,
  spécifique au jour) + « Comment vérifier ta solution » (checklist spécifique de ~5 points dans la
  correction) + « Questions de réflexion » (métacognitives). La **seule vraie faiblesse** : les
  « Questions de réflexion » sont **génériques et identiques** sur les 235 jours ; elles ne testent
  pas le contenu du jour comme le faisait le mini-quiz de 1-90.

**Recommandation : OPTION A (aucun changement) sur Y3 ; OPTION A ou B légère sur Y2** (voir §12-13).
Aucune remédiation massive justifiée.

## 2. Méthode et limites

- **Automatisé** : `scripts/audit-tier-91-365.mjs` parse le **markdown rendu** (`curriculum/days`,
  `curriculum/solutions`) — la source de vérité de ce que voit l'apprenant — + métadonnées de
  `data/program.json`. Calcule mots (théorie, correction, guidé), présence de sections, percentiles
  (p10/p25/p75/p90), agrégats par palier/mois/domaine, outliers. Sortie : `audit-y2-y3.json`.
- **Manuel** : lecture stratifiée et tracée de **22 jours** (§7), correction complète + réflexion pour
  chacun ; théorie/guidé en plus pour le batch initial.
- **Limites** : la classification A/B/C **automatique** est heuristique (structurelle) ; les verdicts
  définitifs reposent sur la lecture manuelle. La détection « distinction implicite » par mots-clés est
  indicative. Les jours non lus manuellement sont classés par extrapolation structurelle, signalée
  comme telle. Aucune régénération n'a été lancée (contenus intacts).

## 3. Périmètre recalculé (depuis les données réelles)

- **91-365 = 275 jours** : **235 journées d'apprentissage** + **40 revues hebdomadaires**.
- Jours d'apprentissage (235) dont **projet/capstone ≈ 63** (skill « Autonomie projet » + jalons
  DocSense/ChurnScope/BiblioApp…).
- **Répartition par mois** (apprentissage) : M4=24, M5=24, M6=30, M7=24, M8=24, M9=30, M10=24,
  M11=24, M12=31.
- **Domaines** (skillName) : JS/TS 12, Software eng 6, Autonomie projet 19, Python 12, SQL 6, ML 30,
  DL 12, LLM 18, RAG 36, Éval IA 18, Sécurité 18, Agents 18, Architecture 12, Communication 18.
- Fichiers zero-paddés (`day-091.md`, `day-091-solution.md`).

## 4. Comparaison des paliers (jours d'apprentissage)

| Palier | n | Corr. médiane [p10–p90] | Théorie méd. | Mini-quiz | Simple/améliorée (header) | Réflexion |
|---|---|---|---|---|---|---|
| 1-30 | 26 | **403** [327–499] | 317 | **26/26** | **26/26** | 26 |
| 31-90 | 52 | **502** [477–533] | 722 | **52/52** | **52/52** | 52 |
| 91-180 | 77 | 261 [240–282] | 404 | 0/77 | 0/77 (mais inline) | 77 |
| 181-270 | 77 | 235 [147–286] | 318 | 0/77 | 0/77 | 77 |
| 271-365 | 81 | 282 [264–301] | 403 | 0/81 | 0/81 (mais inline) | 81 |

**Lecture** : le palier 1-90 (surtout 31-90, palier « deep ») est le plus riche (correction médiane
~500 mots, mini-quiz + rubriques séparées). Le palier 91-365 est plus compact et uniforme
(235/235 sans mini-quiz ni header séparé). Le creux p10=147 de 181-270 correspond à la tranche DL/LLM
déjà auditée et validée au **Chantier M2** (jours 183-209).

## 5. Analyse de l'absence de « Mini-quiz » (Y2)

- **1-90** : `❓ Mini-quiz` (78 jours) + `❓ Réponses du mini-quiz` dans la correction. Quiz **spécifique
  au contenu**, avec réponses.
- **91-365** : pas de mini-quiz, mais **`🧩 Questions de réflexion (à faire seul)` présent 235/235**.
  **Constat clé** : ces questions sont **génériques et rigoureusement identiques** sur les 235 jours
  (« Qu'est-ce que je ne comprends pas encore ? / Comment l'expliquer à l'oral ? / Où le réutiliser ? »).
  Métacognitives, non spécifiques au contenu.
- **Éléments formatifs compensatoires réellement présents** :
  - **Exemple guidé** (spécifique, pré-pratique) : modélise la résolution.
  - **`🔍 Comment vérifier ta solution`** (correction) : checklist **spécifique au jour** de ~5 points
    concrets et vérifiables (lue sur les 22 jours de l'échantillon — toujours spécifique).
  - **`✅ Critères de validation`** : partiellement spécifique (seule la ligne « livrable » varie ; les
    3 autres lignes sont génériques).
  - **`🎤 À savoir expliquer à l'oral`** : auto-test par l'explication.

**Catégorisation A/B/C (Y2)** :
- **A — évaluation formative clairement présente** : 235/235 disposent d'un exemple guidé + d'une
  checklist de vérification spécifiques. La fonction formative est **couverte**.
- **B — présente mais faible/implicite** : la couche « quiz spécifique au contenu » est absente ;
  les « Questions de réflexion » sont génériques. C'est la **seule** faiblesse Y2, transverse aux 235.
- **C — aucune évaluation formative** : **0 jour**.

Liste B (au sens « réflexion générique, pas de quiz de contenu ») : **transverse aux 235 jours** — ce
n'est pas une liste de jours défaillants mais une **caractéristique de palier**. Liste C : **aucune**.

## 6. Analyse des corrections (Y3)

Toutes les corrections 91-365 (235/235) comportent : `🧠 La logique attendue`,
`⚠️ Erreurs probables`, `🔍 Comment vérifier`, `🎤 À savoir expliquer à l'oral`. **Aucun jour** ne
manque de pièges, de vérifications ou d'oral (vérifié automatiquement).

- **Distinction simple/robuste inline** : **158/235** corrections contiennent littéralement
  « *Solution simple : … Solution améliorée : …* » dans la logique attendue. Ce sont les paliers
  **91-180** et **271-365** (compétences « classiques » + projets/carrière).
- **Les 77 sans label** = **181-270** (DL/LLM/RAG/Éval/Sécurité). Lecture manuelle (211, 218, 241,
  253, 260) : la logique y porte un **raisonnement + un compromis/décision assumé** approprié au sujet
  (ex. 218 : « JSON = choix ASSUMÉ, tu sais ce qui le fera craquer » ; 241 : « TRADE-OFF, pas une
  victoire »). Ces jours sont **orientés décision**, pas « coder simple puis améliorer » — l'absence du
  label est cohérente avec le contenu.
- **Corrections réellement compactes** : la tranche **183-209** (M2), corrections ~125-140 mots. Déjà
  auditée et **validée** au Chantier M2 (compact mais solide, guidés porteurs).

**Catégorisation A/B/C (Y3)** :
- **A — solide** (raisonnement + compromis + pièges + vérifs + oral) : **235/235** à la classification
  structurelle ; **22/22** confirmés à la lecture manuelle (dont 20 « A » et 2 « A− » compacts : 190,
  194, tranche M2).
- **B — à consolider** : **0** (aucun élément important manquant détecté).
- **C — insuffisante** : **0**.

## 7. Résultats de la lecture manuelle (22 jours, tracée)

Sections lues : correction complète (4 rubriques) + « Questions de réflexion » pour les 22 ;
théorie/guidé en plus pour le batch 92-148. Détail complet dans `audit-y2-y3.json` (`manualSample`).

| J | Sélection | Verdict | Preuve (extrait) | Confiance |
|---|---|---|---|---|
| 92 | M4/React | A | simple/améliorée inline (composants réutilisables, typage, pureté) | haute |
| 106 | M4/tests | A | simple/améliorée inline (AAA, sabotage du code) | haute |
| 113 | M4/projet | A | inline (walking skeleton) ; vérif « ouvrir /livres/3 » | haute |
| 120 | M5/Python | A | inline (traduire JS → idiomatique : comprehensions, .get) | haute |
| 134 | M5/SQL | A | inline (3NF, dénormalisation assumée) ; test déménagement | haute |
| 148 | M6/stats | A | inline (tendance+dispersion, « quand la moyenne ment ») | haute |
| 165 | M6/ML | A | inline présent + 4 rubriques | moyenne |
| 190 | M7/outlier court (125 mots) | A− | logique dense 1 insight ; **pas** de distinction (tranche M2) | haute |
| 194 | M7/outlier court (135 mots) | A− | méthode recyclée mois 6 ; tranche M2 validée | haute |
| 197 | M7/LLM (lu en M2) | A | « trois lois démontrées » ; riche | haute |
| 211 | M8/LLM prod (181-270) | A | boucle mesurée avant→après→revert ; 4 pièges | haute |
| 218 | M8/RAG (181-270) | A | **compromis explicite** JSON vs vector DB | haute |
| 241 | M9/RAG (181-270) | A | pièges/oral centrés **TRADE-OFF** | haute |
| 253 | M9/Éval (181-270) | A | 3 propriétés du golden set ; raisonnement dense | haute |
| 260 | M9/Sécurité (181-270) | A | red teaming 2 surfaces ; menace indirecte RAG | haute |
| 274 | M10/Agents | A | simple (boucle while) vs améliorée (garde-fous) inline | haute |
| 288 | M10/Architecture (corr. longue) | A | simple vs améliorée (test du changement) inline | haute |
| 302 | M11/capstone SPEC | A | inline (persona→5 cas→hors-scope) | haute |
| 314 | M11/jalon projet | A | inline (démo bout-en-bout + revue archi) | haute |
| 337 | M12/README | A | inline (README qui vend, recruteur 90 s) | haute |
| 348 | M12/offres | A | inline (10 offres, récurrence, 2 manques) | haute |
| 365 | M12/capstone final (corr. la + longue) | A | inline (profil = système à évaluer, plans 30/90 j) | haute |

**Aucun jour lu manuellement n'est classé B ou C.** Les deux « A− » (190, 194) relèvent de la tranche
M2 déjà traitée.

## 8. Répartition A/B/C (91-365)

| Axe | A | B | C |
|---|---|---|---|
| **Y2** (éval formative, structurel) | 235 | 0* | 0 |
| **Y3** (correction, structurel) | 235 | 0 | 0 |
| **Y3** (lecture manuelle, 22 jours) | 22 (dont 2 « A− ») | 0 | 0 |

\* La faiblesse Y2 (réflexion générique / pas de quiz de contenu) est **transverse aux 235 jours**,
non une liste de jours défaillants : c'est une **convention de palier**.

## 9. Jours réellement problématiques

**Aucun jour du palier 91-365 n'est structurellement défaillant sur Y2/Y3.**
- Aucun jour sans pièges / vérifications / oral.
- Aucun bloc de contenu vide (après exclusion des sections brèves par conception : objectif, livrable).
- Les corrections les plus courtes (183-209) ont déjà été auditées et validées au Chantier M2.

## 10. Faux positifs invalidés

1. **Y3 « corrections sans distinction simple/robuste »** → **invalidé** : la distinction est présente
   inline dans 158/235 corrections (verbatim « Solution simple / Solution améliorée »), et sous forme
   de raisonnement/compromis approprié dans les 77 autres (181-270, orientées décision).
2. **Y3 « corrections trop courtes = faibles »** → **invalidé** : la longueur n'est pas un critère ;
   la lecture manuelle confirme raisonnement + pièges + vérifs + oral partout. Le creux de longueur
   (181-270) correspond à la tranche M2 déjà validée.
3. **Y2 « pas de mini-quiz = pas d'évaluation »** → **invalidé** : exemple guidé + checklist de
   vérification spécifiques assurent la fonction formative. Reste un point réel : la réflexion générique.
4. **« Blocs vides »** (première passe du script) → **faux positifs** : c'étaient des objectifs/livrables
   volontairement brefs. Après correction du script : **0 bloc vide réel**.

## 11. Risques d'une remédiation massive

- **Remplissage artificiel** : ajouter des rubriques « Solution simple/améliorée » séparées à 235 jours
  alors que le contenu existe déjà (inline ou en raisonnement) gonflerait sans valeur.
- **Incohérence de palier** : imposer le format 1-90 à 91-365 effacerait la **progression pédagogique
  voulue** (autonomie croissante ⇒ scaffolding décroissant).
- **Régression du générateur** : 235 jours × plusieurs sources d'enrichissement = surface de bug élevée,
  risque de casser des jours actuellement solides.
- **Coût/valeur défavorable** : effort massif pour un gain pédagogique marginal (le contenu formatif et
  correctif est déjà présent).

## 12. Options de remédiation

- **OPTION A — Aucun changement.** Justifiée pour **Y3** (contenu présent, différence de présentation)
  et globalement pour Y2 (fonction formative couverte).
- **OPTION B — Remédiation ciblée (légère, uniquement Y2).** Un seul point réel : la réflexion
  générique. Deux variantes possibles, **sans toucher aux corrections ni au format Y3** :
  - **B1** : rendre les « Questions de réflexion » spécifiques au jour (2-3 questions ancrées sur le
    contenu, à la place du template générique) — via le générateur, sur les 235 jours.
  - **B2** : ajouter aux jours une courte auto-vérification de contenu (2 questions + réponses),
    équivalent léger du mini-quiz, uniquement là où la valeur est nette.
- **OPTION C — Évolution structurelle du palier.** **Non recommandée** (aucun défaut systémique prouvé).

## 13. Recommandation finale

**OPTION A pour Y3** (aucun changement — faux positif confirmé).
**OPTION A, ou au plus OPTION B1 très ciblée, pour Y2.** La seule faiblesse défendable est la
généricité des « Questions de réflexion ». Elle n'empêche pas l'apprentissage (guidé + checklist de
vérification spécifiques présents) ; sa correction éventuelle (B1) est un **raffinement**, pas une
réparation de défaut. Aucune remédiation massive n'est justifiée. Le Chantier M2 a déjà traité la seule
zone de réelle légèreté (183-209).

## 14. Si une remédiation est validée — fichiers/jours concernés

- **Option A** : rien à modifier.
- **Option B1** (réflexion spécifique) : la section « Questions de réflexion » est **générée** — il faut
  localiser sa source dans `scripts/generate-curriculum.mjs` (template commun) et décider d'une source
  de questions par jour (nouveau champ d'enrichissement, ex. `reflect`, dans `scripts/data/days-enrich-*`).
  Impact : générateur + 235 entrées de données. **Risque de remplissage élevé** → à cadrer strictement
  (questions réellement ancrées, sinon ne pas faire).
- **Option B2** (mini-quiz léger) : nouveau champ `quiz` + rendu générateur + réponses en correction ;
  périmètre à restreindre aux jours à forte valeur (à définir), **pas** les 235.
- **Aucune correction, revue, leçon, projet ou interface n'aurait à être modifiée** pour Y2/Y3.

---

## Contrôles finaux (phase diagnostic)

- Aucun fichier pédagogique modifié (`git status` : seuls `DIAGNOSTIC_Y2_Y3.md`, `audit-y2-y3.json`,
  `scripts/audit-tier-91-365.mjs` ajoutés).
- `curriculum:check` : **intégrité OK** (365/365, 60 leçons) — lecture seule, aucune régénération.
- HEAD de départ inchangé : `5eca0ef`.

**STOP — validation demandée. Quelle option valides-tu : A, B ou C ?**
