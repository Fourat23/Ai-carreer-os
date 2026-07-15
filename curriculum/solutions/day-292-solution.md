# Correction — Jour 292 : Design patterns dans ton code

[← Retour au jour 292](../days/day-292.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : lister des patterns connus et chercher des exemples. Solution améliorée : partir de TON code réel, reconnaître les structures récurrentes et les nommer (Strategy, Adapter, Factory, Decorator, Repository), traquer honnêtement tes anti-patterns (God object, couplage fort, nombre magique), et CORRIGER au moins un. La valeur est l'œil qui reconnaît les structures dans du vrai code, pas la récitation du GoF ; nommer permet de communiquer et de cibler.

## ⚠️ Erreurs probables et points à vérifier
- Réciter les 23 patterns du GoF sans exemple : la compétence est de les RECONNAÎTRE dans du vrai code, à commencer par le tien.
- Forcer un pattern là où il n'y en a pas (« pattern-itis ») : tout n'est pas un pattern, et sur-appliquer les patterns crée de la complexité gratuite.
- Identifier les anti-patterns sans les corriger : reconnaître un God object sans le décomposer ne rend pas le code meilleur.
- Confondre pattern et framework : un pattern est une STRUCTURE de code, pas une bibliothèque à importer.

## 🔍 Comment vérifier ta solution
- 5 patterns sont identifiés dans TON code avec ce que chacun apporte.
- 2 anti-patterns sont reconnus honnêtement dans ton propre code.
- Au moins un anti-pattern est effectivement corrigé (pas seulement nommé).
- Chaque pattern est relié à un fichier réel, pas à un exemple abstrait.
- Aucun pattern n'est forcé là où il n'apporte rien (pas de pattern-itis).

## 🎤 À savoir expliquer à l'oral
Montre l'œil pour les structures : « mon llm_call avec cache est un Decorator, mes adapters une Strategy — je les avais faits sans les nommer ; et j'ai un God object dans mon orchestrateur que je décompose ». Nommer ses propres patterns ET anti-patterns prouve que tu penses en structures et que tu t'auto-critiques — deux signaux forts en revue de code.
