# Correction — Jour 4 : JavaScript : variables, types et opérateurs — les fondations

[← Retour au jour 4](../days/day-004.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le convertisseur = 3 étapes : valider les entrées → convertir via une devise pivot (tout en EUR d'abord) → formater la sortie. Le pivot évite d'écrire 6 taux (n devises = n taux au lieu de n×(n-1)).

## ✅ Une solution simple
```js
// scripts/convertisseur.js — taux fixes par rapport à l'EUR (pivot)
const TAUX_VERS_EUR = { eur: 1, usd: 0.92, gbp: 1.17 };
const montant = 150, de = "eur", vers = "usd";

if (!(de in TAUX_VERS_EUR) || !(vers in TAUX_VERS_EUR)) {
  console.error(`Devise inconnue. Devises supportées : ${Object.keys(TAUX_VERS_EUR).join(", ")}`);
  process.exit(1);
}
const enEuros = montant * TAUX_VERS_EUR[de];
const resultat = enEuros / TAUX_VERS_EUR[vers];
console.log(`${montant} ${de.toUpperCase()} = ${resultat.toFixed(2)} ${vers.toUpperCase()}`);
```

## 🚀 Une solution améliorée
Avec argv et validation numérique (bonus) :
```js
const [montantBrut, de, vers] = process.argv.slice(2);
const montant = Number(montantBrut);
if (Number.isNaN(montant) || !de || !vers) {
  console.error("Usage : node convertisseur.js <montant> <de> <vers>");
  process.exit(1);
}
// ... suite identique
```
Note le pattern déjà vu au jour 2 : parser → valider → traiter → formater. Quatre étapes, toujours dans cet ordre.

## ⚠️ Erreurs probables et points à vérifier
- Utiliser 6 if/else pour les 6 conversions au lieu d'un pivot : ça marche mais ça n'échelle pas (10 devises = 90 branches)
- Number("") vaut 0, pas NaN — cas vicieux si tu pousses la validation
- console.error vs console.log : les erreurs vont sur stderr, c'est la convention

## 🔍 Comment vérifier ta solution
- eur→usd, usd→eur, usd→gbp donnent des résultats cohérents (A→B puis B→A ≈ montant initial)
- Devise "xyz" → message + echo $? affiche 1
- Score prédictions noté honnêtement

## ❓ Réponses du mini-quiz
1. **Pourquoi `"5" + 2` et `"5" - 2` donnent-ils des résultats de types différents ?**
   → `+` concatène dès qu'une string est présente ("52"), `-` n'existe que pour les nombres donc convertit ("5"→5, résultat 3).
2. **Quand utiliser let plutôt que const ?**
   → Uniquement quand la variable sera réassignée (compteur, accumulateur). Par défaut : const — ça documente l'intention.
3. **Que vaut `typeof null` et pourquoi c'est surprenant ?**
   → "object" — un bug historique de JS jamais corrigé. À connaître pour les entretiens.
4. **Différence entre null et undefined ?**
   → undefined = pas encore de valeur (défaut du langage) ; null = absence volontaire posée par le développeur.

## 🧩 Questions de réflexion
- L'objet TAUX_VERS_EUR utilisé comme table de correspondance : c'est ta première 'hash map' (jour 30 formalise ça). Où as-tu déjà vu ce pattern ?
- Pourquoi une devise pivot ? Quel concept général y a-t-il derrière (réduire n² relations à n) ?
