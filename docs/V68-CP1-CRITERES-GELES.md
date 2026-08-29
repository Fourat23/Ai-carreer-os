# V68 · CP1 — Critères académiques gelés

> Gelé **avant la première réécriture**. Aucun seuil de ce document ne peut être
> modifié après avoir vu une mesure. Un seuil renégocié après mesure ne mesure
> plus rien : il décrit ce qu'on a obtenu.

---

## 1. Le critère fondamental

> **Une leçon doit enseigner à un humain, pas compresser de l'information pour un
> modèle de langage.**

Tout le reste de ce document en découle. En cas de conflit entre une règle
ci-dessous et ce critère, c'est ce critère qui tranche.

Test opérationnel, applicable à n'importe quelle leçon : *un débutant qui vient de
la lire peut-il expliquer le concept à quelqu'un d'autre, avec ses propres mots,
sans rouvrir le fichier et sans combler un trou avec une connaissance extérieure ?*
Si non, la leçon a échoué, quels que soient sa longueur, sa structure et ses
compteurs.

---

## 2. Ce qui reste gelé depuis V67 et ne se rouvre pas

- Les **12 principes** du contrat éditorial (`docs/V67-ACADEMIC-CONTRACT-FROZEN.md`).
- Les **15 dimensions** et leurs ancres (`docs/V67-ACADEMIC-SCORING-FROZEN.md`).
- Le modèle de lecture : **150 mots/min** de prose, **20 lignes de code/min**.
- L'ordre des **365 journées**, les identifiants publics, les routes.
- La règle de rattachement : une leçon ne se rattache qu'à une journée dont le
  sujet est **déjà** le sien.

`curriculum/`, `data/`, `data/progress.json` et l'ordre des 365 journées sont
protégés. Toute modification doit être justifiée explicitement dans le rapport
final, avec sa raison pédagogique.

**Rappel d'architecture, gelé lui aussi** : `curriculum/days/`,
`curriculum/weeks/`, `curriculum/months/` et `curriculum/solutions/` sont
**générés** depuis `scripts/data/`. Une correction de journée se fait dans
`scripts/data/`, jamais dans le fichier généré. `curriculum/lessons/` est écrit à
la main et hors du générateur.

---

## 3. Les seuils de `ACADEMIC_QUALITY_READY`

Repris du brief V68 **sans modification**, et non modifiables :

| # | Condition | Seuil |
|---|---|---|
| 1 | Aucun défaut P0 subsistant | 0 |
| 2 | Aucune leçon fondamentale hors parcours sans justification écrite | 0 |
| 3 | Aucune compétence majeure pédagogiquement orpheline | 0 |
| 4 | Aucune famille C incomplète sans justification | 0 |
| 5 | Aucune dimension sous 4,0 | min ≥ 4,0 |
| 6 | Moyenne globale | ≥ 4,20 |
| 7 | Vulgarisation (D1) | ≥ 4,20 |
| 8 | Progression pédagogique (D2) | ≥ 4,20 |
| 9 | Profondeur explicative (D3) | ≥ 4,20 |
| 10 | Pratique (D7) | ≥ 4,00 |
| 11 | Qualité des corrections (D9) | ≥ 4,00 |
| 12 | Échantillon aveugle | ≥ 4,00 |
| 13 | Aucun écart majeur primaire / aveugle | ≤ 0,40 |
| 14 | Temps d'apprentissage honnête | vérifié journée par journée |
| 15 | Aucune régression corpus / progress.json / 365 journées | 0 |
| 16 | Toutes les portes vertes | rc = 0 |
| 17 | Aucune donnée inventée | 0 |

**Position d'entrée mesurée au CP0 : moyenne 3,20 ; minimum 1,5 (D6) ; quatre
dimensions sous 2,6.** L'écart à combler est de 1,00 point de moyenne, et trois
dimensions doivent progresser de plus de 1,5 point. C'est écrit ici, avant de
commencer, pour qu'aucun verdict final ne puisse faire semblant d'avoir toujours
su que c'était facile.

---

## 4. Les neuf façons interdites d'atteindre le seuil

Aucune ne sera employée. Chacune est vérifiable après coup par un tiers.

1. **Le remplissage.** Allonger une leçon pour atteindre un nombre de mots.
   Contrôle : toute leçon allongée doit gagner une fonction pédagogique
   identifiable, pas des mots.
2. **La duplication.** Répéter un concept sous trois formes pour occuper la page.
3. **L'ajout massif d'intertitres.** Ajouter des `###` ne crée pas de structure ;
   V67 a mesuré que la grammaire structurelle « lit des titres, pas de la
   substance ».
4. **La définition décorative.** Définir un terme de jargon pour faire baisser un
   compteur, sans dire quel problème le terme résout.
5. **L'exercice artificiellement long.** Un énoncé qui grossit sans que la
   difficulté progresse.
6. **La baisse de seuil.** Aucun seuil du §3 ne bouge.
7. **L'exclusion opportuniste.** Retirer une mauvaise leçon de la mesure, ou la
   reclasser en « référence » pour qu'elle ne compte plus.
8. **La réécriture automatique uniforme.** Appliquer le même gabarit aux 128
   leçons. Explicitement interdit par le brief, et contre-productif : le CP0 a
   identifié six leçons qu'il ne faut pas toucher.
9. **La sonde ajustée après coup.** Une sonde dont le résultat déplaît se
   **déclare et s'écarte**, elle ne se règle pas. Treize l'ont été sur ce projet,
   dont deux au CP0 de V68.

---

## 5. Comment les 15 dimensions sont notées

**Par lecture.** Les compteurs de `scripts/v68-lecture.mjs` ne notent aucune
dimension : ils servent uniquement à savoir **où lire**. Cette règle vient du test
négatif 2 de V67, qui a montré qu'une correction vidée de sa substance mais
gardant son intertitre passe le contrôle structurel.

Une note n'est valide que si elle s'accompagne d'un **extrait de texte** qui la
justifie. Une note sans citation est retirée du calcul.

### Barème d'ancrage, gelé

| Note | Ce que cela veut dire |
|---|---|
| 5 | un débutant apprend seul, se trompe, comprend son erreur, et transfère |
| 4 | un débutant apprend seul et sait vérifier s'il a compris |
| 3 | un débutant comprend en lisant, mais ne peut pas savoir s'il s'est trompé |
| 2 | il faut déjà connaître le sujet pour que le texte soit utile |
| 1 | le texte énumère sans enseigner |

---

## 6. Les deux mesures d'honnêteté

**L'échantillon aveugle** (`docs/V68-SAMPLES-FROZEN.md`, seed 20261102) n'est lu
par aucun checkpoint de CP0 à CP9 — la phase où le standard est dérivé. Il est
ouvert au CP13. Si sa moyenne est inférieure de plus de 0,40 point à celle de
l'échantillon d'audit, `ACADEMIC_QUALITY_READY` est **interdit**, quel que soit le
reste.

**La restitution simulée** (CP13) : pour chaque leçon aveugle, produire la réponse
d'un débutant à « explique avec tes propres mots ce que tu es censé avoir appris »,
en n'utilisant **que** le texte de la leçon. Si la restitution exige de combler un
trou avec une connaissance extérieure, la leçon échoue — et le trou est nommé.

---

## 7. Ce qui compte comme preuve

| Recevable | Non recevable |
|---|---|
| un extrait cité avec son fichier et sa ligne | « la leçon explique bien » |
| un compteur reproductible par une commande publiée | un compteur non reproductible |
| une lecture qui contredit un compteur | un compteur qui contredit une lecture (c'est le compteur qui a tort) |
| un défaut trouvé et publié | un défaut trouvé et corrigé sans être publié |

Dernière règle, la plus importante en pratique : **quand une sonde et une lecture
divergent, la lecture gagne**, et la sonde est corrigée ou écartée — jamais
l'inverse.
