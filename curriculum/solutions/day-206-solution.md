# Correction — Jour 206 : Few-shot et patterns de prompts

[← Retour au jour 206](../days/day-206.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Chaque pattern est un produit fini : prompt structuré, exemples choisis (variés + cas limite, format exact), cas de test avec labels attendus, chiffres zero-shot vs few-shot, notes d'usage. La bibliothèque prouve une COMPÉTENCE (construire et mesurer) pas une collection de recettes.

## ⚠️ Erreurs probables et points à vérifier
- Des exemples tous faciles et similaires : le modèle apprend un rail trop étroit et déraille sur la variété réelle.
- Exemples incohérents avec le format demandé (tu demandes un label seul, tes exemples ont des phrases) : le modèle imite l'INCOHÉRENCE.
- Sauter la comparaison zero-shot : sans référence, tu ne sais pas si tes exemples servent.
- Biais de classe dans les exemples de classification — teste-le, ne l'ignore pas.

## 🔍 Comment vérifier ta solution
- 5 fichiers pattern complets, chacun ≥ 8 cas de test.
- Les chiffres zero-shot vs few-shot figurent pour chaque pattern.
- Chaque pattern inclut un exemple de cas limite.
- L'expérience « biais d'exemples » a été faite et notée.

## 🎤 À savoir expliquer à l'oral
Raconte le résultat le plus parlant de tes mesures (« sur la classification, passer de 0 à 3 exemples m'a fait gagner N points, et voici l'exemple qui a tout changé »). Un chiffre + une histoire = la réponse d'entretien parfaite.
