# Correction — Jour 20 : Journée katas : consolider sous chrono

[← Retour au jour 20](../days/day-020.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Chiffres romains (le seul vraiment nouveau) : le déclic vient des exemples — la table doit contenir les formes soustractives COMME des valeurs à part entière : [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]. Ensuite c'est EXACTEMENT le rendu de monnaie d'hier : parcourir les « coupures » décroissantes, soustraire tant que possible. Deux problèmes en apparence différents, UN algorithme — c'est ça, progresser en algo.

## ✅ Une solution simple
```js
function chiffresRomains(n) {
  const TABLE = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],
                 [50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  let resultat = "";
  for (const [valeur, symbole] of TABLE) {
    while (n >= valeur) { resultat += symbole; n -= valeur; }
  }
  return resultat;
}
function fusionnerTrie(a, b) {
  const resultat = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) resultat.push(a[i++]);
    else resultat.push(b[j++]);
  }
  while (i < a.length) resultat.push(a[i++]);   // vider le restant
  while (j < b.length) resultat.push(b[j++]);
  return resultat;
}
```

## 🚀 Une solution améliorée
deuxiemePlusGrand en une passe : deux variables max1 ≥ max2 ; pour chaque x : si x > max1 → max2 = max1, max1 = x ; sinon si x > max2 ET x !== max1 (si la spec veut des valeurs distinctes) → max2 = x. La subtilité « doublons du max » est le genre de détail qu'un entretien sonde : avoir POSÉ la question de spec vaut des points même avant de coder.

## ⚠️ Erreurs probables et points à vérifier
- fusionnerTrie : oublier de vider le tableau restant après la boucle principale — teste fusionnerTrie([1,2],[5,6,7,8])
- Palindrome deux curseurs : la condition est gauche < droite, pas <= (le centre d'un impair se compare à lui-même : inutile mais pas faux — sais-tu le justifier ?)
- Le <= dans fusionnerTrie (vs <) rend la fusion STABLE (les égaux de a passent avant ceux de b) — clin d'œil au jour 17

## 🔍 Comment vérifier ta solution
- fizzBuzz : recompare à ta version du jour 6 — meilleure, identique, pire ?
- chiffresRomains : 4→IV, 9→IX, 14→XIV, 40→XL, 1994→MCMXCIV, 3999→MMMCMXCIX
- Le tableau de scores est rempli SANS complaisance (un « fluide » menti aujourd'hui = une lacune découverte en entretien)

## ❓ Réponses du mini-quiz
1. **Pourquoi le rappel actif bat-il la relecture ?**
   → La récupération en mémoire EST ce qui renforce le souvenir ; relire donne une illusion de maîtrise (familiarité ≠ disponibilité).
2. **Le pattern des deux curseurs de fusionnerTrie, en une phrase ?**
   → Un index par tableau ; à chaque tour, on prend le plus petit des deux éléments courants et on avance SON curseur ; puis on vide le tableau restant.
3. **Pourquoi deuxiemePlusGrand sans tri est-il plus intéressant qu'avec ?**
   → Le tri coûte O(n log n) pour un besoin O(n) (une passe, deux variables max1/max2) — et gérer « doublon du max » force à préciser la spec : 2e valeur DISTINCTE ou 2e position ?
4. **Que fais-tu à la minute 12 d'un kata prévu en 10 ?**
   → Je note où j'en suis, je passe au suivant, j'y reviens à la fin. Gérer le budget temps global > s'acharner localement (vrai en entretien, vrai en poste).

## 🧩 Questions de réflexion
- Quels katas ont convoqué des patterns d'autres jours (romains→monnaie, occurrences→regroupement) ? La compétence algo N'EST PAS une liste de solutions mémorisées mais un stock de PATTERNS transférables : lesquels possèdes-tu désormais ?
- Ton temps au kata 7 (recherche binaire revue) vs le jour 16 : l'écart mesure la consolidation. Note-le — tu referas l'exercice au jour 84.
