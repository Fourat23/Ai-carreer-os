# V74 · CP13 — HUIT APPRENANTS SYNTHÉTIQUES

> ## Une simulation n'est PAS une preuve d'apprentissage.
>
> Aucun apprenant humain n'a suivi ce parcours sous mesure —
> `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED`, inchangé depuis V72 et inchangé par V74.
>
> Ce checkpoint ne vérifie **pas** que le moteur fait apprendre : cette question reste hors de
> portée. Il vérifie que le moteur **ne se casse pas** sur des trajectoires plausibles. C'est une
> propriété de **robustesse**, pas d'efficacité pédagogique, et les confondre serait exactement
> « transformer une heuristique en vérité scientifique ».

---

## 1. Ce que le CP8 n'avait pas couvert

Les trois apprenants du CP8 ne différaient que par un **taux de réussite constant** (90 %, 75 %,
50 %). Cela laissait hors champ tout ce qui fait la vie réelle d'un parcours : l'irrégularité,
l'arrêt puis la reprise, l'oubli concentré sur un domaine, et l'apprenant qui avance sans jamais
rien produire.

Les profils **B, D, F, G et H** existent pour ça.

| profil | comportement |
|---|---|
| **A** parfait | travaille tous les jours, retrouve presque tout (95 %) |
| **B** irrégulier | trois jours sur sept, par à-coups |
| **C** nombreux échecs | assidu, mais échoue une fois sur deux |
| **D** très peu actif | un jour sur dix, ne produit aucune preuve |
| **E** progression rapide | commence à 50 %, s'améliore continûment |
| **F** oublis sélectifs | excellent partout (90 %), effondré sur **une compétence** (20 %) |
| **G** reprend après 30 jours | actif, s'arrête du jour 90 au jour 120, revient |
| **H** termine sans preuves | avance normalement, ne laisse **jamais** de trace validée |

La compétence affaiblie du profil F est **dérivée du corpus**, pas choisie à la main : la
choisir moi-même aurait permis de choisir celle qui arrange. Un test le garde.

Chaque profil passe par le **vrai plan de journée** — `planDuJour` → `planifier` → `prioriteDe`,
avec la charge réelle des 365 journées. Ce n'est pas un simulateur parallèle.

---

## 2. Résultats — 240 jours, budget 20 min

| profil | rencontrées | proposées | arriéré final / max | plus longue série consécutive | sans « pourquoi » | hors budget |
|---|---|---|---|---|---|---|
| **A** parfait | 90 | 84 | 4 / 12 | 3 | 0 | 0 |
| **B** irrégulier | 81 | 76 | 68 / 69 | 3 | 0 | 0 |
| **C** nombreux échecs | 90 | 85 | 82 / 82 | **14** | 0 | 0 |
| **D** très peu actif | 42 | 24 | 24 / 24 | 1 | 0 | 0 |
| **E** progression rapide | 90 | 84 | 8 / 36 | 8 | 0 | 0 |
| **F** oublis sélectifs | 90 | 87 | 17 / 19 | 8 | 0 | 0 |
| **G** reprend après 30 j | 76 | 72 | 28 / 42 | 6 | 0 | 0 |
| **H** sans preuves | 90 | 85 | 40 / 40 | 4 | 0 | 0 |

### Les six propriétés

**8 profils sur 8** satisfont les six : pas de boucle · arriéré non explosif · pas de répétition
permanente · aucune famine · priorité explicable · budget respecté.

Quelques lectures qui méritent d'être dites :

- **profil C — 14 jours consécutifs sur `recursion`.** C'est le maximum observé, et c'est le
  comportement attendu, pas un défaut : un apprenant qui échoue une fois sur deux voit
  l'intervalle revenir à 1 jour à chaque échec. Le moteur le lui represente le lendemain —
  c'est précisément ce qu'on lui demande. La propriété violée serait une série *permanente* ;
  14 jours sur 240 ne l'est pas ;
- **profil B — arriéré de 68 pour 81 notions rencontrées.** Travailler trois jours sur sept
  produit mécaniquement plus d'échéances que de séances. Le moteur ne le masque pas ;
- **profil D — 24 notions proposées sur 42 rencontrées.** Avec 24 journées actives en 240 jours,
  et **une** place de découverte par séance, couvrir 42 notions est arithmétiquement impossible.
  Ce n'est pas une famine (§3), c'est une capacité ;
- **profil G — l'arriéré culmine à 42 au retour, puis redescend à 28.** Le moteur ne se bloque
  pas et ne noie pas : le budget du CP10 borne la séance de reprise.

---

## 3. Le décompte brut « jamais proposées » était trompeur — et il l'était en ma défaveur

Au premier passage, **les huit profils échouaient** à la propriété « rien d'abandonné » : entre
3 et 18 notions rencontrées n'avaient jamais été proposées.

Avant de conclure à un défaut, il fallait séparer deux choses que ce décompte mélange :

- une notion rencontrée **l'avant-veille** n'a simplement **pas encore eu son tour**. La file la
  servira. Il n'y a rien à corriger ;
- une notion rencontrée **il y a trois mois** et jamais proposée est une **vraie famine** — et
  c'est exactement ce que la place réservée du CP8 prétend avoir supprimé.

La mesure qui tranche est le nombre de **jours ACTIFS** écoulés depuis la première exposition :

| profil | A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|---|
| attente maximale (jours actifs) | 23 | 11 | 23 | 18 | 23 | 23 | 23 | 23 |
| notions attendant > 30 jours actifs | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** |

**Aucune famine, sur aucun profil.** Toutes les notions jamais proposées avaient été rencontrées
dans les 23 derniers jours actifs.

### Et le seuil de 30 a été choisi APRÈS avoir vu le maximum

Il faut le dire, sinon un seuil confortable passerait pour une démonstration. **Ce qui prouve la
propriété n'est pas le seuil, c'est la borne mesurée : 23 jours actifs.** Un test garde cette
borne elle-même — si elle dérive au-delà de 30, il rougit.

---

## 4. Une propriété que mes tests ne mesuraient pas, trouvée par mutation

Sur trois mutations, **une seule rougissait d'abord**.

| mutation | 1ʳᵉ version | après correction |
|---|---|---|
| suppression de la place réservée du CP8 | **4 rouges** | 4 rouges |
| neutralisation du plancher du CP10 (une journée à 331 min reçoit de nouveau 20 min) | **0 rouge** | **9 rouges** |
| plafond d'unités porté de 8 à 400 | **0 rouge** | 0 rouge |

### La seconde : « budget respecté » ne mesurait presque rien

Ma sonde comparait `minutesPlanifiees > minutesAccordees` — c'est-à-dire **la cohérence interne
du plan avec lui-même**. En neutralisant le plancher du CP10, la séance continuait à respecter le
budget qu'on venait de lui donner, **aussi faux fût-il**. La colonne « budget respecté » du
tableau aurait affiché ✅ sur une journée à 351 minutes.

Corrigé : le contrôle porte désormais sur **la journée entière** — charge de curriculum plus
réactivation — et non sur la cohérence du plan avec lui-même. La mutation fait rougir 9 tests.

### La troisième : le plafond d'unités est inerte, et c'est vrai

Porter `PLAFOND_UNITES` de 8 à 400 ne change rien, parce que **le budget de 20 minutes borne la
séance bien avant le plafond** (~4 unités). Ce n'est pas une faiblesse de test : c'est un fait,
déjà établi au CP8 (« le facteur limitant n'est pas le plafond d'unités mais le budget en
minutes »). Le plafond reste une ceinture pour les configurations à gros budget ; il ne protège
rien à 20 minutes, et il vaut mieux l'écrire que de laisser croire qu'il travaille.

---

## 5. Deux profils qui répondent à des questions précises

- **H — l'apprenant qui ne produit aucune preuve** reste servi : 882 tentatives, 85 notions
  proposées. Le moteur ne cesse pas de proposer sous prétexte qu'aucune preuve validée n'arrive.
  C'est la décision du CP2 en action : **la preuve est une projection, la tentative est le
  fait** ;
- **G — la reprise après 30 jours** ne déclenche ni blocage ni noyade. Les deux échecs possibles
  étaient : ne rien proposer (file considérée périmée), ou tout proposer d'un coup. La place
  réservée du CP8 protège du premier, le budget du CP10 du second.

---

## 6. Vérifications

**1611 / 1611 tests** (45 nouveaux) · `tsc` 0 · **46 portes, 0 violation** · simulation
déterministe (générateur à graine, **aucun `Math.random`**) · `data/progress.json` absent ·
corpus `92d5fae6…` inchangé · **aucun fichier de curriculum touché**.

---

## 7. Fichiers

**Créés** : `scripts/v74/cp13-apprenants.mjs` (8 profils + 6 propriétés),
`tests/v74-apprenants.test.mjs` (45 tests), ce document.
