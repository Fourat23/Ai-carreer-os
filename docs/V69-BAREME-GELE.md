# V69 · CP1 — Barème gelé

> Gelé **avant la première réécriture**. Aucun seuil n'est modifiable après mesure.
> Le barème corrobore un jugement éditorial ; il ne le remplace pas.

---

## 1. Les neuf critères bloquants

Un seul suffit à faire échouer une leçon, quelle que soit sa note par ailleurs.

| # | Critère bloquant | Comment il se constate |
|---|---|---|
| **B1** | **Erreur factuelle majeure** | un calcul faux, une commande qui ne fait pas ce qui est dit, une définition inexacte |
| **B2** | **Notion centrale jamais expliquée** | le titre ou l'objectif annonce un concept que le corps ne construit pas |
| **B3** | **Exemple guidé insuffisant** | aucun raisonnement montré : on voit la conclusion, pas les décisions qui y mènent |
| **B4** | **Exercice sans correction pédagogique** | un exercice est posé et rien ne dit ce qu'on attendait ni pourquoi |
| **B5** | **Prérequis inexistant** | la leçon renvoie à un acquis que le parcours ne donne jamais |
| **B6** | **Jargon excessif** | un terme spécialisé employé avant d'être intelligible, sans définition ni renvoi |
| **B7** | **Contradiction interne** | deux passages de la même leçon s'excluent |
| **B8** | **Faux acquis** | « comme tu l'as vu au mois X » alors que le mois X ne l'enseigne pas |
| **B9** | **Absence de transfert sur une notion fondamentale** | rien ne demande de reconnaître le principe hors du cas montré |

**B3 est le critère du sprint.** Sa définition opérationnelle, gelée :

> Un exemple guidé est **suffisant** s'il montre au moins **trois décisions** et, pour
> chacune, **pourquoi celle-là plutôt qu'une autre**. Un exemple qui énonce un problème,
> donne une solution et la commente n'en montre **zéro** : il expose un résultat.

Ce n'est pas un seuil de mots. Une leçon peut montrer trois décisions en 200 mots ; aucune
n'y parvient en 50, ce qui explique la corrélation observée sans en faire la règle.

---

## 2. Les douze dimensions notées

Reprises du CP0, sur 5. Notées **par lecture**, avec un extrait à l'appui — une note sans
citation est retirée du calcul.

| # | Dimension | Entrée |
|---|---|---|
| D1 | Clarté | 4,3 |
| D2 | Vulgarisation | 4,0 |
| D3 | Modèle mental | 4,4 |
| D4 | Profondeur | 3,0 |
| D5 | Progressivité | 3,1 |
| D6 | **Exemple guidé** | **2,4** |
| D7 | Exactitude | 4,5 |
| D8 | Pratique | 3,5 |
| D9 | Correction | 4,1 |
| D10 | Cas métier | 4,1 |
| D11 | Transfert | 3,2 |
| D12 | Densité cognitive | 2,8 |

**Moyenne d'entrée : 3,57.**

### Ancrage, gelé

| Note | Signification |
|---|---|
| 5 | un débutant apprend seul, dérive une variante, et sait quand ne pas appliquer |
| 4 | un débutant apprend seul et sait vérifier qu'il a compris |
| 3 | un débutant comprend en lisant, mais ne peut pas dériver |
| 2 | il faut connaître le sujet pour que le texte soit utile |
| 1 | le texte énumère sans enseigner |

**Le registre B du CP0 est un 3.** C'est précisément ce que « reconnaître le vocabulaire
sans pouvoir dériver » veut dire.

---

## 3. Conditions de `ACADEMIC_QUALITY_READY`

| # | Condition | Seuil |
|---|---|---|
| 1 | Aucun critère bloquant sur une leçon du périmètre | 0 |
| 2 | Exemple guidé (D6) | ≥ 4,00 |
| 3 | Profondeur (D4) | ≥ 4,00 |
| 4 | Densité cognitive (D12) | ≥ 4,00 |
| 5 | Aucune dimension sous 3,50 | min ≥ 3,50 |
| 6 | Moyenne des 12 dimensions | ≥ 4,20 |
| 7 | Échantillon aveugle | ≥ 4,00 |
| 8 | Écart traitées / non traitées expliqué et publié | — |
| 9 | Aucune régression : corpus, `progress.json`, 365 journées | 0 |
| 10 | Portes, tests, `tsc`, build | verts |
| 11 | Aucune donnée inventée | 0 |
| 12 | Temps pédagogique honnête sur les journées touchées | vérifié |

---

## 4. Les manières interdites d'atteindre le seuil

1. **Allonger sans enseigner.** Une leçon plus longue qui répète est notée **plus bas**
   qu'avant, pas plus haut.
2. **Appliquer un gabarit unique aux 40.** Remplacer le registre B par un registre C
   mécanique ne serait pas un progrès.
3. **Injecter du texte par script.** Les scripts comptent, cherchent, vérifient. Ils
   n'écrivent pas.
4. **Assouplir un critère après mesure.** Aucun seuil de ce document ne bouge.
5. **Exclure une leçon faible du périmètre** après l'avoir mesurée.
6. **Empiler du vocabulaire** en croyant approfondir.
7. **Fabriquer un temps pédagogique** pour atteindre la durée annoncée.
8. **Inventer un fait** invérifiable plutôt que reformuler prudemment.

---

## 5. Ce que le barème ne sait pas faire

Écrit ici pour que le rapport final ne prétende pas le contraire.

- Il ne distingue pas une erreur probable **juste** d'une erreur probable **inventée**.
- Il ne voit pas qu'une leçon enseigne un **catalogue** au lieu d'une **méthode** — défaut
  trouvé par lecture en V68 sur `k8s-troubleshooting`.
- Il ne mesure pas si une analogie **aide** ; seulement si sa limite est écrite.
- Il ne détecte pas la répétition déguisée en profondeur.

**Ces quatre-là relèvent de la lecture. Le CP14 les traite explicitement.**
