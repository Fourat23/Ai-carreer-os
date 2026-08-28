# V66 — Grille académique gelée

> **Gelée le 2026-08-28, sur la base `7434974`, AVANT toute modification du
> curriculum.** `git status` au moment du gel : aucun fichier de `curriculum/`
> modifié. Les seuils et le barème ci-dessous ne seront **pas** rouverts après
> avoir vu les résultats (règle absolue 4 du brief). Si un critère se révèle
> mal formé, il sera **déclaré défaillant et écarté**, jamais réajusté jusqu'à
> donner le résultat voulu.

---

## 0. Ce que cette grille peut et ne peut pas faire

Elle sépare trois natures de constat, et refuse de les mélanger :

| Nature | Comment c'est obtenu | Ce que ça vaut |
|---|---|---|
| **MESURÉ** | script déterministe, rejouable (`scripts/v66-*.mjs`) | opposable ; un désaccord se règle en relançant |
| **LU** | lecture intégrale d'un fichier par un lecteur, gap noté avec sa ligne | opposable si la citation est vérifiable |
| **JUGÉ** | appréciation qualitative | contestable, et doit le rester |

Aucune dimension de cette grille n'est notée *uniquement* par script. Un score
qui n'aurait qu'une source MESURÉE est marqué comme tel et vaut indice, pas
verdict.

---

## 1. Les onze dimensions d'observation (A–K)

Elles décrivent **ce qu'on regarde**. Elles ne portent pas de note : la note est
au §2.

**A. Accessibilité cognitive.** Un lecteur qui ne connaît pas le sujet peut-il
avancer phrase après phrase sans se bloquer sur un mot ou une notion non
introduite ? *Trace attendue* : liste de LEARNING GAPS localisés.

**B. Vulgarisation.** Le texte traduit-il chaque notion abstraite en quelque
chose que le lecteur possède déjà (analogie, cas concret, reformulation
simple) — et dit-il où l'analogie cesse d'être vraie ? *Trace* : présence d'une
analogie + présence explicite de sa limite.

**C. Profondeur conceptuelle.** Le texte explique-t-il le mécanisme, ou
seulement le nom du mécanisme ? *Test opérationnel* : peut-on retirer tous les
noms propres et acronymes du passage sans que l'explication disparaisse ?

**D. Progression.** Les notions arrivent-elles dans un ordre où chacune s'appuie
sur la précédente, avec une transition explicite entre elles ? *Trace* : nombre
de notions introduites par 100 mots, et présence de connecteurs de dépendance.

**E. Densité de jargon.** Combien de termes techniques le texte marque-t-il
lui-même (`code`, **gras**, section Vocabulaire) pour 100 mots de prose, et
combien de ces termes sont utilisés sans jamais être définis nulle part
d'atteignable ?

**F. Exemples développés.** Un exemple est-il déroulé (énoncé → raisonnement →
solution → variante), ou seulement cité ?

**G. Contre-exemples.** L'erreur est-elle **montrée** (approche fausse écrite,
puis réfutée), ou seulement **nommée** dans une liste ?

**H. Prérequis.** Ce que la leçon déclare exiger correspond-il à ce que le texte
exige réellement ? La ressource citée en prérequis contient-elle effectivement
la notion citée ?

**I. Charge réelle.** Combien de minutes de contenu la journée fournit-elle
réellement, face aux 4 h 30 annoncées ? Quelle part du temps annoncé repose sur
un travail que le produit ne décrit ni ne borne ?

**J. Rétention.** Le dispositif oblige-t-il à **produire** avant de montrer la
réponse, et revient-il sur une notion à distance ?

**K. Qualité académique.** Le texte est-il exact, honnête sur ses limites, et
distingue-t-il ce qui est établi de ce qui est un choix d'ingénierie ?

---

## 2. Barème gelé — 12 dimensions notées sur 5

Chaque dimension est notée **entière**, de 1 à 5. Le score global est la
**moyenne non pondérée**, publiée avec le détail : une moyenne seule n'a jamais
rien prouvé.

Ancrage commun des cinq niveaux :

| Note | Signification, identique pour toutes les dimensions |
|---|---|
| **5** | Tenu partout dans l'échantillon, y compris sur les cas difficiles. |
| **4** | Tenu dans la grande majorité ; les manquements sont mineurs et localisés. |
| **3** | Tenu à peu près une fois sur deux ; le lecteur ne peut pas s'y fier. |
| **2** | Présent en intention (une section porte le bon titre) mais pas en substance. |
| **1** | Absent, ou présent sous une forme qui ne remplit pas la fonction. |

Les 12 dimensions notées et leur **critère de bascule** — la règle qui décide,
seule, entre 3 et 4 :

| # | Dimension | Bascule 3 → 4 |
|---|---|---|
| D1 | Accessibilité au néophyte | ≤ 2 LEARNING GAPS bloquants par leçon lue |
| D2 | Vulgarisation | analogie **et** sa limite présentes dans ≥ 80 % des leçons lues |
| D3 | Profondeur du noyau explicatif | le noyau survit au retrait des noms propres dans ≥ 80 % des cas |
| D4 | Progression interne | ≥ 80 % des leçons lues introduisent leurs notions dans un ordre où chacune est utilisable |
| D5 | Maîtrise du jargon | ≥ 90 % des termes marqués sont définissables depuis la leçon ou une ressource atteignable **depuis le point d'usage** |
| D6 | Exemples développés | ≥ 80 % des journées ont un exemple guidé complet (énoncé + raisonnement + solution) |
| D7 | Contre-exemples | ≥ 50 % des sections d'erreurs **montrent** l'approche fautive |
| D8 | Justesse des prérequis | 0 prérequis pointant vers une ressource qui ne contient pas la notion citée |
| D9 | Correction pédagogique | ≥ 60 % des corrections expliquent l'erreur de raisonnement, pas seulement la réponse |
| D10 | Charge réelle honnête | le contenu fourni couvre ≥ 60 % de la durée annoncée, **ou** le produit dit explicitement ce que couvre le reste |
| D11 | Rétention active | ≥ 80 % des journées imposent une production avant réponse, **et** un mécanisme de retour à distance existe |
| D12 | Honnêteté académique | 0 affirmation fausse relevée ; limites et compromis énoncés dans ≥ 80 % des leçons lues |

**Verdict global associé au barème** (fixé ici, avant mesure) :

- moyenne ≥ 4,0 **et** aucune dimension < 3 → `ACADEMIC_BASELINE_ESTABLISHED`
  avec mention « socle solide » ;
- moyenne ≥ 3,0 **et** aucune dimension < 2 → `ACADEMIC_BASELINE_ESTABLISHED`
  sans mention ;
- toute dimension à 1, ou moyenne < 3,0 → baseline établie **avec dette
  déclarée**, et l'énoncé du défaut est publié en tête du rapport.

Dans tous les cas : `ACADEMIC_QUALITY_READY` est **hors d'atteinte de ce
sprint** et ne sera pas prononcé, conformément au brief.

---

## 3. Seuils de défaut — quand un symptôme devient un défaut

Un symptôme mesuré ne devient un **défaut** que si les trois conditions sont
réunies :

1. il est **reproductible** par un script versionné ;
2. il a été **confirmé par lecture** sur au moins deux occurrences citées ;
3. il a survécu à un **test négatif** : on a cherché activement l'explication
   innocente, et elle ne tient pas.

Un symptôme qui échoue à la condition 2 ou 3 est publié comme
**faux positif écarté**, avec la raison. Le CP0 en compte déjà quatre.

---

## 4. Protocoles de lecture gelés

**P1 — Walkthrough néophyte.** Lecture paragraphe par paragraphe. À chaque
phrase : « que faut-il déjà savoir pour la comprendre ? ». Si la réponse
contient une notion non définie dans la leçon et non atteignable par un lien
présent **à cet endroit du texte**, on enregistre un LEARNING GAP :
`notion requise · où elle est requise · où elle est (ou n'est pas) définie`.
Un gap est **bloquant** si la notion est nécessaire pour faire l'exercice ou
cocher la checklist de la leçon.

**P2 — Test de compréhension.** Trois questions par leçon :
*restitution* (le texte le dit-il ?), *explication* (peut-on le reformuler
autrement ?), *transfert* (peut-on l'appliquer à un cas non traité).
Règle absolue : **on répond uniquement avec ce que le corpus enseigne.** Toute
connaissance extérieure mobilisée pour répondre est la preuve d'un manque, et
se note comme tel.

**P3 — Test « mots-clés ».** On retire d'un passage tous les noms propres,
acronymes et termes marqués. Ce qui reste explique-t-il encore le mécanisme ?
Si non, le passage nomme au lieu d'enseigner.

**P4 — Test Feynman.** Réexpliquer le concept à quelqu'un qui ne connaît pas le
domaine, sans utiliser le vocabulaire de la leçon, **en n'utilisant que ce que
la leçon fournit**. Le point exact où l'explication devient impossible est le
trou du cours.

---

## 5. Échantillon — gelé et non modifiable

`scripts/v66-sample.mjs`, **seed 20260828**, tirage déterministe
(mulberry32, aucun `Math.random`), construit **avant toute lecture**.

43 journées, 18 domaines sur 18. Strates : médiane de volume par domaine (ni la
meilleure ni la pire journée), 5 plus courtes, 5 plus longues, 3 faciles,
3 difficiles, 3 `detailed:true`, 3 `detailed:false`, 3 riches en code, 3 de pure
théorie, 3 sans exercice ni leçon, 5 au hasard.

> Jours : 1, 2, 3, 7, 9, 13, 14, 20, 21, 25, 29, 32, 34, 51, 53, 54, 78, 91,
> 95, 120, 126, 134, 147, 165, 180, 194, 201, 232, 249, 255, 273, 286, 287,
> 303, 309, 310, 312, 313, 314, 334, 338, 351, 355.

**Cet échantillon ne sera pas retiré après avoir vu les résultats.** Si une
strate se révèle mal choisie, on le dit ; on ne la remplace pas.
