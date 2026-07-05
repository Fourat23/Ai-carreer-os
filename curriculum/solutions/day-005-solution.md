# Correction — Jour 5 : Conditions : apprendre à ton programme à décider

[← Retour au jour 5](../days/day-005.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
A : l'ordre des conditions EST la logique — du cas le plus spécifique au plus général, et la réduction du mercredi s'applique APRÈS le choix du tarif de base (deux étapes séparées, pas un if géant). B : le pattern collecteur — un tableau d'erreurs qu'on remplit règle par règle, puis UN affichage à la fin. Séparer 'détecter' de 'rapporter'.

## ✅ Une solution simple
```js
function tarif(age, estEtudiant, jour) {
  let prix;
  if (age < 12) prix = 5;
  else if (age <= 17 || estEtudiant) prix = 8;
  else if (age > 65) prix = 7;
  else prix = 12;
  if (jour === "mercredi") prix = Math.max(0, prix - 2);
  return prix;
}
// Tests : tarif(11,false,"lundi")===5 ; tarif(12,false,"lundi")===8 ; ...
```
```js
const mdp = process.argv[2] ?? "";
const erreurs = [];
if (mdp.length < 10) erreurs.push(`trop court (${mdp.length}/10)`);
if (!/[A-Z]/.test(mdp)) erreurs.push("aucune majuscule");
if (!/[0-9]/.test(mdp)) erreurs.push("aucun chiffre");
if (!/[!@#$%^&*]/.test(mdp)) erreurs.push("aucun caractère spécial");
if (mdp.toLowerCase().includes("password") || mdp.includes("123456"))
  erreurs.push("contient une séquence interdite");
if (erreurs.length > 0) console.log(`❌ ${erreurs.length} problème(s) : ${erreurs.join(", ")}`);
else console.log("✅ Mot de passe valide");
```
(Les regex /[A-Z]/ etc. sont données ici en avance de phase — si tu as bouclé sur les caractères à la main, c'est PARFAITEMENT bien aussi, et même mieux pédagogiquement.)

## 🚀 Une solution améliorée
Version données-pilotées du validateur — les règles deviennent un tableau d'objets {test, message} qu'on parcourt :
```js
const REGLES = [
  { test: (m) => m.length >= 10, message: "au moins 10 caractères" },
  { test: (m) => /[A-Z]/.test(m), message: "au moins une majuscule" },
  // ...
];
const erreurs = REGLES.filter((r) => !r.test(mdp)).map((r) => r.message);
```
Ajouter une règle = ajouter une ligne de données, zéro modification de la logique. Ce principe (open/closed) reviendra au mois 2. Ne t'inquiète pas si filter/map sont flous : c'est le programme des jours 23-24.

## ⚠️ Erreurs probables et points à vérifier
- Ordre des if dans tarif : si `age > 65` est testé APRÈS le else final, il est inatteignable — l'ordre est la logique
- Étudiant de 70 ans : ton code donne quoi ? La spec est ambiguë — la VRAIE compétence est de remarquer l'ambiguïté et de documenter ton choix
- mdp undefined si aucun argument : le ?? "" le gère — l'as-tu testé ?

## 🔍 Comment vérifier ta solution
- Les 8 cas de test passent, Y COMPRIS les limites
- validateur avec "abc" affiche 4 problèmes d'un coup
- Aucun if imbriqué de plus d'un niveau

## ❓ Réponses du mini-quiz
1. **Liste les 6 valeurs falsy.**
   → false, 0, "" (chaîne vide), null, undefined, NaN.
2. **`[] ? "a" : "b"` renvoie quoi ?**
   → "a" — un tableau vide est truthy (comme un objet vide). Seules les 6 falsy sont falsy.
3. **Qu'est-ce qu'une guard clause et quel est son bénéfice ?**
   → Un retour anticipé qui évacue un cas invalide dès le début ; le code principal reste à plat, lisible, sans pyramide d'imbrications.
4. **Pourquoi accumuler les erreurs du validateur dans un tableau plutôt que retourner à la première ?**
   → Expérience utilisateur : l'utilisateur corrige tout en une passe. Et le pattern collecte-puis-rapporte resservira partout (validation d'API, tests).

## 🧩 Questions de réflexion
- Dans le tarif, pourquoi appliquer la réduction mercredi APRÈS le choix du tarif plutôt que dupliquer -2 dans chaque branche ? Quel principe général ?
- La version 'données-pilotées' du validateur : quel rapport avec le TAUX_VERS_EUR d'hier ?
