# Correction — Jour 184 : Descente de gradient

[← Retour au jour 184](../days/day-184.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Une expérience propre : UNE variable (le LR), même seed, mêmes données, mêmes epochs — les courbes deviennent comparables. Les trois régimes (lent / bon / divergent) doivent être visibles sur ton graphe.

## ⚠️ Erreurs probables et points à vérifier
- Oublier de re-seeder à chaque LR : les points de départ diffèrent, la comparaison est faussée.
- Conclure sur 20 epochs (le lent semble « cassé » alors qu'il est juste lent).
- Comparer des loss de formules différentes entre runs.

## 🔍 Comment vérifier ta solution
- Le graphe superpose les 3 courbes avec légende.
- Tu sais pointer : lequel divergerait encore plus avec plus d'epochs ? Lequel finirait par converger ?
- Ton LR « limite de divergence » est noté.

## 🎤 À savoir expliquer à l'oral
Raconte les deux pathologies du learning rate en montrant (ou dessinant) les courbes : osciller au-dessus de la vallée vs ramper sans progresser. Une image, deux phrases, question maîtrisée.
