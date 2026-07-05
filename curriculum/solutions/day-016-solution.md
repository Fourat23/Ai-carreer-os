# Correction — Jour 16 : Recherche linéaire vs binaire : ta première vraie victoire algorithmique

[← Retour au jour 16](../days/day-016.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Tout tient dans l'invariant : « si la cible existe, elle est dans [low, high] ». Chaque branche du if doit PRÉSERVER cet invariant en rétrécissant la zone. La condition d'arrêt low > high signifie « zone vide, donc absente ». Quand tu doutes d'un +1, demande : « arr[mid] peut-il encore contenir la cible ? » Non (testé) → exclure mid.

## ✅ Une solution simple
```js
function rechercheBinaire(arr, cible) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {                       // <= : une zone d'UN élément est valide
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === cible) return mid;
    if (arr[mid] < cible) low = mid + 1;      // mid testé → exclu
    else high = mid - 1;
  }
  return -1;                                  // zone vide : absent
}
```

## 🚀 Une solution améliorée
Version récursive (bonus) — même logique, la boucle devient des appels :
```js
function rechercheBinaireRec(arr, cible, low = 0, high = arr.length - 1) {
  if (low > high) return -1;                  // cas de base : zone vide
  const mid = Math.floor((low + high) / 2);
  if (arr[mid] === cible) return mid;
  return arr[mid] < cible
    ? rechercheBinaireRec(arr, cible, mid + 1, high)
    : rechercheBinaireRec(arr, cible, low, mid - 1);
}
```
Compare : la version itérative est préférée en production JS (pas de limite de stack), la récursive exprime plus directement « diviser pour régner ». Savoir écrire LES DEUX et argumenter, c'est le niveau attendu en entretien.

## ⚠️ Erreurs probables et points à vérifier
- Le tableau à 2 éléments est le meilleur détecteur de bug de bornes : [5,7] cherche 5, 7, 4, 8 — les 4 cas
- Sur d'immenses tableaux dans d'autres langages, low+high peut déborder (overflow) — en JS pas de souci avant 2^53, mais la question tombe en entretien : mid = low + Math.floor((high-low)/2)
- Ta batterie doit tester l'INDEX exact retourné, pas juste "trouvé/pas trouvé"

## 🔍 Comment vérifier ta solution
- Les 12 cas de la batterie : résultats notés avant, vérifiés après
- Duel : ratio > 1000x sur 10M d'éléments
- La version cassée (low = mid) boucle-t-elle vraiment ? Teste 30 secondes pour VOIR le bug de tes yeux

## ❓ Réponses du mini-quiz
1. **Pourquoi low = mid + 1 et pas low = mid ?**
   → arr[mid] vient d'être testé et éliminé ; le garder dans la zone crée une boucle infinie quand low et high se touchent.
2. **Combien de comparaisons max pour 1 milliard d'éléments triés ?**
   → log2(10⁹) ≈ 30. C'est la magie du log : diviser par 2 à chaque coup écrase n'importe quel n.
3. **La recherche binaire sur un tableau non trié renvoie quoi ?**
   → N'importe quoi (parfois juste par chance) — la précondition 'trié' est ce qui rend l'élimination de moitiés VALIDE.
4. **Quand préférer la linéaire malgré tout ?**
   → Données non triées qu'on ne cherche qu'une fois (trier coûte O(n log n) > une recherche O(n)), ou tableaux minuscules.

## 🧩 Questions de réflexion
- L'invariant t'a servi de fil rouge : où as-tu déjà utilisé ce genre de raisonnement sans le nommer (pense aux bornes pv/pvMax du jour 10) ?
- Git bisect retrouve un commit fautif par recherche binaire dans l'historique : explique comment, en 3 phrases.
