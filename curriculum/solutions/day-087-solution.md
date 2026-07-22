# Correction — Jour 87 : Full-stack : introduction à React (préparation mois 4)

[← Retour au jour 87](../days/day-087.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Adopter le modèle React UI = f(state) : décrire l'UI pour chaque état, ne jamais toucher le DOM directement, modifier le state uniquement via son setter et de façon IMMUABLE (nouvelle référence, car React compare les références). Minimiser le state (dériver le reste). La preuve : compteur et liste fonctionnels, zéro mutation de state, et on sait expliquer pourquoi une mutation ne re-rend pas.

## ✅ Une solution simple
Un compteur et une liste React qui fonctionnent avec useState. L'app réagit.

## 🚀 Une solution améliorée
Typer les composants, ne modifier le state que via son setter et de façon IMMUABLE (spread/map — jamais push/mutation), DÉRIVER les valeurs calculées au lieu de les stocker, viser zéro warning console, et savoir EXPLIQUER pourquoi une mutation ne re-rend pas (comparaison de références). Brancher mentalement sur l'API (jour 88).

## ⚠️ Erreurs probables et points à vérifier
- Muter le state (state.push, affectation directe) : React ne détecte rien, l'UI ne se met pas à jour.
- Stocker une valeur dérivée dans le state : risque de désynchronisation avec sa source.
- Toucher le DOM directement au lieu de changer le state : on se bat contre le modèle de React.
- Modifier le state par affectation au lieu du setter : aucun rendu déclenché.

## 🔍 Comment vérifier ta solution
- Compteur et liste fonctionnels, typés, zéro warning console.
- Aucune mutation de state (relecture systématique des setters : spread partout).
- Tu sais expliquer pourquoi une mutation ne re-rend pas (comparaison de références).
- Les valeurs dérivées sont calculées au rendu, pas stockées dans le state.

## ❓ Réponses du mini-quiz
1. **Que signifie l'équation UI = f(state) ?**
   → Un composant est une fonction qui, à partir de son état, retourne à quoi l'UI doit ressembler. On ne modifie jamais le DOM directement : on change l'état, et React recalcule le rendu pour correspondre.
2. **Pourquoi une mutation du state (`liste.push`) ne re-rend-elle pas ?**
   → React détecte les changements en comparant les RÉFÉRENCES. Une mutation garde la même référence : React compare, voit « identique » et ne re-rend pas. Il faut une NOUVELLE référence (`setListe([...liste, item])`).
3. **Comment modifie-t-on le state, et pourquoi pas par affectation directe ?**
   → Uniquement via son setter (`setCompteur(...)`). Une affectation directe (`compteur = ...`) ne déclenche aucun rendu : le setter est le signal qui dit à React « l'état a changé, re-rends ».
4. **Pourquoi ne pas stocker une valeur dérivée dans le state ?**
   → Ce qui se calcule à partir du state (ex. le nombre de tâches finies) ne se stocke pas : on le dérive au rendu. Stocker un dérivé crée des risques de désynchronisation avec sa source. Règle : minimiser le state, dériver le reste.

## 🎤 À savoir expliquer à l'oral
Résume par l'équation : « UI = f(state) — je décris l'UI pour chaque état, je ne touche jamais le DOM ». Explique pourquoi l'immutabilité est OBLIGATOIRE : « React compare les références ; une mutation garde la même référence, donc il ne re-rend pas ». Donne l'exemple push (ne marche pas) vs spread (marche). Ajouter « je minimise le state et je dérive le reste » montre que tu as adopté le modèle, pas juste appris la syntaxe de useState.
