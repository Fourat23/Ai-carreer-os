# V61 — PROMPT DE SPRINT

*Écrit à la fin de V60.1. **V61 n'a pas été lancé.***

---

## 0. Point de départ

V60.1 a produit un prototype hybride sur trois surfaces
(`/design-spike/v60-1/`), verdict **`STRONG_IMPROVEMENT`**, moyenne 4,49 pour
un seuil de `REFERENCE_CANDIDATE` à 4,50, **18 conditions bloquantes sur 18
tenues**.

À lire avant toute ligne de code, dans cet ordre :

1. `docs/design/V60-1-FINAL-REPORT.md` — en particulier le §7 (ce qui reste
   faible) et le §8 (ce qui manque exactement)
2. `docs/design/V60-1-HYBRID-CONTRACT.md` — les trois couches, les quatre
   règles anti-Frankenstein, la table des rôles de motifs
3. `docs/design/V60-1-SCORING-FROZEN.md` — le barème, gelé et non modifié
4. `docs/design/V60-DESIGN-DIRECTIONS.md` — d'où viennent A, B et C

Le prototype est **vivant et servi**. On peut le lancer et le regarder :
`npm run build && npx next start` puis `/design-spike/v60-1/dashboard`.

---

## 1. La question de V61

> Le langage de la Career Workstation survit-il au passage de trois surfaces
> choisies à des surfaces qu'on n'a pas choisies ?

V60.1 a composé trois écrans dans un langage neuf. Ces trois écrans ont été
choisis parce qu'ils sont les plus importants **et** parce qu'ils se prêtaient
au langage. Rien ne prouve encore que le langage tient sur une surface qui ne
lui a pas été taillée.

C'est la seule chose que V61 doit établir.

---

## 2. Ce que V61 fait — dans l'ordre, sans le réordonner

### P0 — Trancher l'ambiguïté des deux motifs de trajectoire

**Avant toute migration.** Le §7.1 du rapport V60.1 décrit le point le plus
discutable du prototype : `TrajectoryMap` et `YearRule` se lisent au premier
regard comme le même objet.

Trancher, et le prouver par capture :

- soit **différencier franchement** — l'un devient un instrument de mesure
  (graduation explicite, chiffres alignés, hauteur constante), l'autre un
  relief (profil marqué, aucune graduation) ;
- soit **assumer la parenté** et la nommer dans le contrat : deux échelles
  d'une même famille, comme une carte et son échelle — auquel cas il faut
  montrer qu'un lecteur ne les confond pas, et non l'affirmer.

Aucun sixième motif. L'ensemble reste fermé à cinq.

### P1 — Fermer les deux autres travaux du §8

- la colonne de contexte du Day (~290 px, intitulés à 13 px, rail aéré) ;
- les deux vides identifiés au §7.2 (en-tête du Day, bande droite des mois
  courts) — assumés par la composition ou résorbés, jamais meublés.

À la fin de P1, **rejouer le barème gelé sans le modifier** et publier la
nouvelle notation à côté de l'ancienne. Si la moyenne franchit 4,50 et que les
18 conditions tiennent toujours, le verdict devient `REFERENCE_CANDIDATE` et
la migration est autorisée. **Sinon, elle ne l'est pas** — et V61 s'arrête là,
avec l'énoncé exact de ce qui manque.

### P2 — La migration, si et seulement si P1 l'a autorisée

Migrer **cinq routes produit**, pas trois, pas trente-six :

| Route | Pourquoi elle |
|---|---|
| `/` | la surface de pilotage — cible directe du Dashboard hybride |
| `/day/[id]` | la surface la plus lue — cible directe du Day hybride |
| `/calendar` | cible directe du Calendar hybride |
| `/revisions` | **surface non choisie n°1** : une file, pas une station |
| `/skills` | **surface non choisie n°2** : un ensemble, pas une séquence |

Les deux dernières sont l'expérience réelle de V61. Si le langage ne les
compose pas sans se déformer, il n'est pas un langage de produit — c'est un
dessin de trois écrans.

Contraintes de migration :

- le système local `cw.css` devient un **système produit**, avec un préfixe
  choisi et un plan de dépréciation des classes de `globals.css` qu'il
  remplace. `scripts/v601-isolation.mjs` a montré qu'une collision de classes
  silencieuse coûte cher : garder un gate d'isolation pendant toute la
  transition ;
- les 31 routes non migrées doivent **continuer de fonctionner**, sans
  régression mesurée par la sonde gelée ;
- aucune route n'est supprimée ;
- `data/progress.json`, le corpus et l'ordre des 365 jours restent gelés.

### P3 — Le prix de la migration, mesuré

Pour chacune des cinq routes, avant/après, avec les mêmes sondes qu'en
V60.1 : hauteur de page, ratio typographique, dominance, débordement aux cinq
largeurs, axe-core, et le test d'identité aveugle sur les cinq.

---

## 3. Interdits pendant V61

- modifier `curriculum/`, les données pédagogiques, le contenu des 365 jours ;
- modifier `data/progress.json` ou créer de la progression fictive ;
- inventer des compétences, des preuves, des projets ou des métriques ;
- ajouter un sixième motif propriétaire ;
- **modifier le barème `V60-1-SCORING-FROZEN.md`**, ni ses seuils, ni ses
  conditions bloquantes ;
- migrer une route avant que P1 ait autorisé la migration ;
- migrer plus de cinq routes ;
- supprimer une route ;
- lancer V62.

---

## 4. Ce que V61 ne doit pas croire

Le rapport V60.1 le dit et il faut le reconduire : **les gates verts et les
tests passants ne prouvent rien sur la qualité d'un écran.** En V60.1, avec
39 gates verts et 1 285 tests passants, la ligne de système rendait
1 440 × 1 px, le livrable s'affichait deux fois sur le même écran, le bouton
principal était à 3,4:1 et la grille du Calendrier portait 103 étiquettes
d'information nulle.

Règle de travail pour V61, reconduite : **regarder les captures, mesurer ce
qu'on y voit, et inscrire le nombre mesuré dans le commentaire du code qui le
corrige.** Une sonde qui contredit une capture est suspecte avant la capture.

---

## 5. Verdicts autorisés en fin de V61

`MIGRATION_VALIDATED` · `MIGRATION_PARTIAL` · `REFERENCE_NOT_READY` · `FAILED`

- `MIGRATION_VALIDATED` — P0, P1 et P2 tenus, cinq routes migrées, sonde
  gelée sans régression sur les 31 autres, barème rejoué et tenu.
- `MIGRATION_PARTIAL` — moins de cinq routes migrées, ou une route migrée qui
  a déformé le langage. Nommer laquelle et pourquoi.
- `REFERENCE_NOT_READY` — P1 n'a pas fait franchir 4,50. Aucune migration.
  C'est un résultat acceptable, pas un échec.
- `FAILED` — une régression sur une route non migrée, ou un invariant rompu.

---

## 6. Livrables de fin de V61

- `docs/design/V61-MIGRATION-REPORT.md`
- `docs/design/v61/` — captures avant/après des cinq routes, aux cinq
  largeurs, plus le test d'identité aveugle sur les cinq
- `docs/V61-PROMPT-V62.md`

**Ne lance pas V62.**
