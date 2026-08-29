# V70 — Contrat académique gelé

**Gelé au CP1, avant la première modification de leçon.**
Les seuils ci-dessous ne bougent plus. Aucune mesure postérieure ne peut les
assouplir. Si une mesure est mauvaise mais correcte, le mauvais résultat est publié.

Empreinte du corpus au moment du gel : `64748e1522904dbc…`
Commit CP0 : `35c3c79`.

---

## 1. Continuité avec les barèmes existants

Le dépôt possède déjà une grille académique : `docs/V69-BAREME-GELE.md`, elle-même
héritée de `V68-CP1-CRITERES-GELES.md` et `V67-ACADEMIC-SCORING-FROZEN.md`.

**Elle n'est pas remplacée.** Ses douze dimensions sont reprises telles quelles. V70
ajoute deux dimensions manquantes et **ne desserre aucun seuil historique**.

### Table de correspondance V69 → V70

| V69 | V70 | statut |
|---|---|---|
| D1 Clarté | **D1 Clarté** | inchangée |
| D2 Vulgarisation | **D2 Vulgarisation** | inchangée |
| D3 Modèle mental | **D3 Modèle mental** | inchangée |
| D4 Profondeur | **D4 Profondeur conceptuelle** | inchangée |
| D5 Progressivité | **D5 Progression & prérequis** | élargie aux prérequis |
| D6 Exemple guidé | **D6 Exemple guidé** | inchangée |
| D7 Exactitude | **D7 Exactitude technique** | inchangée |
| D8 Pratique | **D8 Pratique** | **critère durci, voir §3** |
| D9 Correction | **D9 Correction** | **critère durci, voir §4** |
| D10 Cas métier | **D10 Transfert professionnel** | inchangée |
| D11 Transfert | fusionnée dans D10 | — |
| D12 Densité cognitive | **D12 Charge cognitive & lisibilité** | inchangée |
| — | **D13 Jargon & terminologie** | **nouvelle** |
| — | **D14 Qualité éditoriale / non-template** | **nouvelle** |

Quatorze dimensions. D11 est fusionnée dans D10 parce que V69 a montré que les deux
mesuraient la même chose sous deux noms ; la fusion ne relâche rien, elle supprime un
doublon.

---

## 2. Définitions opérationnelles gelées

Chaque dimension est notée de 1 à 5. Une note se justifie par un fait observable dans
la leçon, jamais par une impression.

**D6 — Exemple guidé.** Définition reprise mot pour mot de V69, non négociable :

> Un exemple guidé est **suffisant** s'il montre au moins **trois décisions** et, pour
> chacune, **pourquoi celle-là plutôt qu'une autre**. Un exemple qui énonce un
> problème, donne une solution et la commente en montre **zéro**.

V70 ajoute une précision, rendue nécessaire par le défaut de forme de V69 :

> Ces décisions n'ont pas à être **étiquetées**. Une décision portée par une question,
> une hypothèse écartée, un candidat éliminé ou une observation qui change le plan
> compte autant qu'une décision numérotée. **La forme ne fait pas partie du critère ;
> elle est notée séparément en D14.**

**D8 — Pratique.** Durcie par rapport à V69, qui la laissait à 3,50 sans y toucher.

Un exercice principal est **acceptable** (note ≥ 4) seulement si :
1. il demande une **production observable** — écrire, modifier, mesurer, construire,
   diagnostiquer, réparer, tester, comparer, ou justifier une décision par écrit ;
2. il précise le **contexte** et les **contraintes** ;
3. il annonce un **livrable** ;
4. il donne un **critère de réussite** vérifiable par l'apprenant seul.

Un exercice qui commence par « Qu'est-ce que… », « Cite… », « Explique en une
phrase… » est un **contrôle de compréhension**. Il est légitime en complément, jamais
comme exercice principal. Plafond de note : 2.

**D9 — Correction.** Durcie de la même façon.

Une correction est **acceptable** (≥ 4) seulement si elle contient au moins trois des
cinq éléments suivants :
1. la **démarche** — comment on arrive à la réponse ;
2. **pourquoi** la solution correcte fonctionne ;
3. une **mauvaise solution plausible** et la raison de son échec ;
4. les **indices** qui permettent de reconnaître ce type de problème ;
5. la **généralisation** ou le cas où la réponse changerait.

Une correction qui donne uniquement la réponse est plafonnée à 2, quelle que soit sa
justesse.

**D13 — Jargon & terminologie.** Un terme technique important est **introduit** s'il
est compréhensible **dans la leçon**, au moment où il apparaît. Sa présence au
glossaire ne compte pas : le glossaire est un complément, pas une béquille. Un sigle
est introduit s'il est développé à sa première occurrence.

**D14 — Qualité éditoriale / non-template.** Note basse si la leçon partage sa
séquence de titres, son rythme et ses formules d'ouverture/fermeture avec une série de
leçons voisines, **indépendamment de la qualité de son contenu**. Cette dimension
existe précisément parce que V69 a produit 40 leçons profondes au même moule.

---

## 3. Défauts bloquants

Une leçon portant l'un de ces défauts ne peut pas dépasser **3,0** de moyenne, quels
que soient ses autres résultats.

| # | défaut bloquant |
|---|---|
| B1 | affirmation technique fausse, vérifiable et non corrigée |
| B2 | exemple guidé montrant zéro décision |
| B3 | aucune pratique, ou pratique sans production observable |
| B4 | aucune correction, ou correction réduite à la réponse |
| B5 | terme critique du sujet employé sans être introduit |
| B6 | prérequis indispensable ni enseigné ni signalé |
| B7 | leçon constituée pour l'essentiel d'une liste de mots-clés |
| B8 | analogie fausse ou trompeuse laissée sans limite explicite |

---

## 4. Conditions de `ACADEMIC_QUALITY_READY`

**Le périmètre d'évaluation est le CORPUS COMPLET : les 128 leçons.** Pas les leçons
touchées. Cette règle est celle qui a fait échouer V69 ; elle est maintenue
volontairement.

| # | condition | seuil |
|---|---|---|
| 1 | moyenne du corpus sur les 14 dimensions | **≥ 4,20 / 5** |
| 2 | aucune dimension du corpus sous | **4,00** |
| 3 | aucune leçon portant un défaut bloquant | **0** |
| 4 | aucune leçon critique (programmée, prérequis d'une autre) sous | **3,80** |
| 5 | écart corpus ↔ échantillon aveugle | **≤ 0,30** |
| 6 | sigles critiques employés sans introduction | **0** |
| 7 | corrections réduites à la réponse | **0** |
| 8 | exercices principaux sans livrable observable | **0** |
| 9 | plus grande série de leçons à séquence de titres identique | **≤ 6** |
| 10 | leçons auditées | **128 / 128** |
| 11 | affirmation technique fausse connue | **0** |
| 12 | intégrité : 365 journées, `progress.json`, corpus | inchangés |

Statuts possibles, dans l'ordre :
`ACADEMIC_REWRITE_INCOMPLETE` · `ACADEMIC_QUALITY_CANDIDATE` · `ACADEMIC_QUALITY_READY`.

---

## 5. Les manières interdites d'atteindre le seuil

Écrites ici pour être opposables au CP15.

1. **Rallonger.** Le nombre de mots n'entre dans aucune note. Une leçon de 2 000 mots
   qui tourne autour du sujet vaut moins qu'une leçon de 800 mots précise.
   `git-fundamentals` (333 mots d'exemple guidé, zéro défaut au CP0) est la référence
   opposable à tout réflexe d'allongement.
2. **Ajouter des sections vides** pour cocher une fonction pédagogique.
3. **Cloner une structure** sur une série de leçons : D14 sanctionne exactement cela.
4. **Modifier une sonde** parce que sa note déplaît. Une sonde ne se corrige que si
   l'on **démontre** qu'elle mesure autre chose que ce qu'elle prétend ; la
   démonstration est écrite dans le script.
5. **Faire monter la moyenne** grâce à quelques leçons exceptionnelles pendant que le
   bas de la distribution reste bas. La condition 2 (aucune dimension sous 4,00) et la
   publication des percentiles l'empêchent.
6. **Déclarer READY sur un périmètre partiel.** La condition est sur 128 leçons.
7. **Inventer** un chiffre, un temps d'étude, un cas métier ou une version.

---

## 6. Ce que ce barème ne sait pas faire

Écrit d'avance, pour que le rapport final ne prétende pas le contraire.

- Il ne distingue pas une erreur probable **juste** d'une erreur probable **inventée**.
- Il ne voit pas qu'une leçon enseigne un **catalogue** au lieu d'une **méthode**.
- Il ne mesure pas si une analogie **aide** ; seulement si sa limite est écrite.
- Il ne détecte pas la répétition déguisée en profondeur.
- Il ne sait pas si un exercice annoncé pour deux heures en demande réellement deux.

**Ces cinq points relèvent de la lecture.** CP13 les traite par les restitutions
simulées, CP15 par l'inspection finale.
