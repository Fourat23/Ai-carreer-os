# V62 — PRODUCT MIGRATION II : FERMER LA FRONTIÈRE

> Prompt préparé à la clôture de V61. **Ne pas lancer avant décision humaine.**

## 0. Ce que V61 laisse sur la table — c'est le point de départ, pas un rappel

V61 a industrialisé la direction visuelle sur quinze surfaces et tenu ses neuf
seuils gelés. Verdict : `STRONG_IMPROVEMENT`, pas `REFERENCE_CANDIDATE`, et
pour trois raisons mesurées qui sont exactement le programme de V62 :

1. **Le produit est à deux vitesses.** Le tirage au sort du CP13 a visité neuf
   routes non migrées : **zéro** porte la ligne de contexte, **zéro** porte une
   action primaire. Neuf sur neuf, sans exception.
2. **Deux murs restent debout** : `/lessons` à 18 762 px et `/missions` à
   13 776 px, tous deux à 375 px.
3. **Un défaut visible depuis toujours n'a été trouvé qu'à la fin, par une
   capture** — sept menus de filtre pleine largeur sur `/lab`. Aucune sonde ne
   le voyait.

Lis `docs/design/V61-MIGRATION-REPORT.md` §7, §8 et §10 avant de commencer.
Le tirage de V61 (`V61-CP13-RANDOM-DRAW.md`) ne doit pas être rejoué : il est
clos. V62 tire au sort à nouveau, avec sa propre graine.

## 1. Ce que V62 n'est pas

Ce n'est pas un nouveau spike de design. Ce n'est pas une exploration
esthétique. Ce n'est pas l'occasion d'une cinquième direction. L'ensemble des
motifs propriétaires reste **fermé à cinq** — `pos-ring`, `tmap`, `phase-rail`,
`evi-mark`, `year-band` — et le gate le vérifie. Aucun sixième motif.

## 2. Interdit de modifier

`curriculum/`, le contenu pédagogique, les exercices, les missions, les
capstones, les diagnostics, les preuves, les textes, les durées, les difficultés,
les parcours, l'ordre des 365 jours, la progression utilisateur.
`progress.json` ne se touche pas pour faire passer un test. Aucune donnée
fictive pour remplir visuellement une page.

## 3. P0 — Les deux murs

- **`/lessons`** : 18 762 px à 375 px, la page la plus haute du produit.
  Diagnostiquer la cause AVANT de composer. Cible : ≤ 4 000 px à 375 px.
- **`/missions` à 375 px** : la recomposition par catégorie a réglé le desktop
  (dominance 0,867 → 0,431) mais empile quatre sections en mobile.
  Cible : ≤ 6 000 px à 375 px, sans perdre l'axe catégorie.

## 4. P1 — Fermer la frontière

Migrer les **21 routes de production restantes**, ou justifier route par route
celles qui n'ont pas à l'être. « Migrée » garde la définition de
`docs/V61-CRITERIA-FROZEN.md` : au moins 4 des 8 conditions, dont
obligatoirement la ligne de contexte et une action primaire quand la fonction
de la page en appelle une.

Priorité par fréquence d'usage réelle, pas par ordre alphabétique :
`/lessons`, `/career`, `/glossary`, `/notes`, `/resources`, `/guide`,
`/settings`, puis les familles `security`, `cloud-lab`, `cloud-foundations`,
`kubernetes`, `pipelines`, puis les routes `[id]` correspondantes.

## 5. P2 — L'outillage doit voir ce que l'œil voit

C'est la leçon de V61 §8.5. Trois sondes à ajouter, chacune testée en négatif :

- **contrôle de barre d'outils** : une rangée de champs ou de menus dont chaque
  élément occupe ≥ 90 % de la largeur du conteneur est un défaut ;
- **hauteur de page par largeur**, avec un seuil par famille de route et non un
  seuil unique ;
- **densité d'information** : rapport entre le nombre de libellés distincts et
  le nombre de libellés affichés — un écran qui répète le même mot 40 fois dit
  moins qu'il n'en a l'air.

## 6. Gates négatifs — non négociable

Tout nouveau gate doit être vu échouer : casser ce qu'il protège, constater
l'échec avec son message, restaurer. **Un gate qu'on n'a jamais vu échouer
n'est pas considéré comme prouvé.** Au premier passage de ce test en V61,
trois vérifications sur six laissaient passer la casse.

## 7. Navigation = lecture

Aucune visite ne doit modifier `progress.json`. Hachage avant, visites, hachage
après, par famille de routes. **Aucune restauration de fichier n'est autorisée
comme mécanisme de réussite.**

## 8. Tirage au sort

Nouvelle graine, publiée AVANT tout constat, jamais réécrite. ≥ 12 routes,
dont ≥ 5 migrées en V62, ≥ 4 hors V62, ≥ 1 dynamique, ≥ 1 dense, ≥ 1 vide.

## 9. Condition de sortie

- les deux murs du P0 sous leurs cibles ;
- ≥ 15 routes nouvelles migrées, ou justification écrite route par route ;
- responsive validé de 375 à 1920 ;
- axe-core : 0 critical, 0 serious sur **l'ensemble** des routes de production ;
- les trois sondes du P2 en place et testées en négatif ;
- tirage au sort effectué, publié avant correction ;
- captures AVANT / APRÈS conservées ;
- rapport final avec verdict et les deux questions de clôture ;
- commits propres, poussés, `local == origin`, arbre de travail propre,
  aucun serveur résiduel.

**Ne lance pas V63.**
