# V69 CP13 — Audit aveugle

## Protocole

Tirage **reproductible** (`scripts/v69-echantillon.mjs`, graine `20260829`), effectué
et publié **avant** de lire le moindre résultat. Les graines V68 (`20261101`,
`20261102`) sont brûlées et ne sont pas réutilisées.

L'échantillon contient délibérément **8 leçons réécrites et 8 leçons intouchées**.
Un échantillon limité au périmètre ne pourrait pas contredire le sprint : il ne
mesurerait que ce que le sprint a voulu produire.

L'échantillon tiré est publié tel quel dans `docs/v69/ECHANTILLON-AVEUGLE.md`.
Aucune leçon n'a été écartée après tirage.

## Notes

Les notes sont un **jugement documenté**, pas une mesure automatique. Elles sont
codées dans `scripts/v69-notation.mjs` pour que le calcul soit rejouable et le
désaccord possible ligne par ligne.

```
dimension              entrée réécrites intouchées échantillon
D1 Clarté                4.30      4.46       4.25        4.36
D2 Vulgarisation         4.00      4.06       4.00        4.03
D3 Modèle mental         4.40      4.50       4.33        4.41
D4 Profondeur            3.00      4.48       2.90        3.69
D5 Progressivité         3.10      4.04       3.03        3.53
D6 Exemple guidé         2.40      4.60       2.18        3.39
D7 Exactitude            4.50      4.75       4.53        4.64
D8 Pratique              3.50      3.50       3.50        3.50
D9 Correction            4.10      4.10       4.10        4.10
D10 Cas métier           4.10      4.10       4.10        4.10
D11 Transfert            3.20      4.05       3.00        3.52
D12 Densité cognitive    2.80      4.34       2.67        3.51

MOYENNE                 3.62      4.25       3.55        3.90

--- Extrapolation au corpus (40 réécrites / 88 intouchées) ---
   D1 Clarté              4.32
   D2 Vulgarisation       4.02
   D3 Modèle mental       4.38
```

## Extrapolation au corpus et conditions READY

Le barème gelé fixe ses seuils sur le corpus, pas sur le périmètre. Le corpus
compte 40 leçons réécrites et 88 intouchées.

```
--- Extrapolation au corpus (40 réécrites / 88 intouchées) ---
   D1 Clarté              4.32
   D2 Vulgarisation       4.02
   D3 Modèle mental       4.38
   D4 Profondeur          3.39
   D5 Progressivité       3.34
   D6 Exemple guidé       2.93
   D7 Exactitude          4.60
   D8 Pratique            3.50
   D9 Correction          4.10
   D10 Cas métier         4.10
   D11 Transfert          3.33
   D12 Densité cognitive  3.19
   MOYENNE                3.77

--- Conditions ACADEMIC_QUALITY_READY (barème gelé §3) ---
   ÉCHEC 2. D6 exemple guidé ≥ 4,00       mesuré 2.93 / seuil 4.00
   ÉCHEC 3. D4 profondeur ≥ 4,00          mesuré 3.39 / seuil 4.00
   ÉCHEC 4. D12 densité ≥ 4,00            mesuré 3.19 / seuil 4.00
   ÉCHEC 5. min des dimensions ≥ 3,50     mesuré 2.93 / seuil 3.50
   ÉCHEC 6. moyenne ≥ 4,20                mesuré 3.77 / seuil 4.20
   ÉCHEC 7. échantillon aveugle ≥ 4,00    mesuré 3.90 / seuil 4.00

   Conditions numériques satisfaites : 0/6
```

## Lecture des résultats

**Sur le périmètre, le sprint a fait ce qu'il annonçait.** D6 (exemple guidé) passe
de **2,40 à 4,60** sur les leçons réécrites ; D4 de 3,00 à 4,48 ; D12 de 2,80 à
4,34. La moyenne des 12 dimensions passe de 3,62 à **4,25** sur ce sous-ensemble.

**Sur le corpus, aucune des six conditions numériques n'est remplie.** D6 corpus
plafonne à 2,93 pour une exigence de 4,00. Ce n'est pas un échec d'exécution : c'est
l'arithmétique d'un sprint qui a traité 40 leçons sur 128. Quarante réécritures
excellentes ne peuvent pas porter à elles seules une moyenne de corpus au-dessus de
4,00 quand 88 leçons restent à 2,18.

**L'écart traitées / non traitées est de 0,70 point de moyenne** (4,25 contre 3,55),
et de **2,42 points sur D6** (4,60 contre 2,18). La condition 8 du barème exige que
cet écart soit expliqué et publié : il l'est ici. Il est **voulu** — c'est l'effet
mesuré du sprint — mais il crée un corpus à deux vitesses, ce que le CP14 traite
comme une conséquence produit à assumer.

## Ce que cet audit ne prouve pas

- Il ne prouve pas que les 32 leçons réécrites **non tirées** valent les 8 tirées.
  Le tirage est honnête, l'échantillon reste petit.
- Les notes des leçons réécrites sont mises par l'auteur de ces leçons. C'est un
  biais que la reproductibilité du calcul ne corrige pas ; seule une relecture
  extérieure le corrigerait.
- D8 (pratique), D9 (correction) et D10 (cas métier) sont reportés à l'identique
  depuis l'entrée pour les leçons réécrites : **V69 n'a pas touché aux exercices**,
  et il aurait été malhonnête de leur attribuer un gain.
