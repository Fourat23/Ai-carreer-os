# Correction — Jour 281 : Workflows explicites

[← Retour au jour 281](../days/day-281.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : chaîner les étapes fixes (lister → lire → extraire → comparer → rapporter) en code. Solution améliorée : rendre le nombre d'appels LLM calculable d'avance (donc coût/latence estimables), tester chaque étape en isolation, et COMPARER chiffré contre la version agent (mêmes contradictions trouvées, pour quel coût). La preuve de la doctrine : le workflow fait aussi bien ou mieux pour un coût prévisible et sans modes d'échec de flux.

## ⚠️ Erreurs probables et points à vérifier
- Croire qu'un workflow « n'utilise pas de LLM » : il en utilise DANS les étapes fixes — ce qu'il retire, c'est la DÉCISION de flux au modèle.
- Figer un flux qui a réellement besoin d'autonomie : si le nombre d'étapes dépend vraiment de l'entrée, un workflow rigide échoue — le routage (jour 282) ou l'agent s'imposent alors.
- Ne pas comparer chiffré à la version agent : sans la mesure, la préférence workflow reste une opinion.
- Oublier de tester les étapes en isolation : le principal avantage du workflow (testabilité) est perdu si on ne l'exploite pas.

## 🔍 Comment vérifier ta solution
- Le vérificateur est reformulé en étapes fixes orchestrées par le code.
- Le nombre d'appels LLM est calculable AVANT l'exécution.
- La comparaison agent vs workflow est chiffrée (coût, latence, fiabilité, résultat).
- Chaque étape est testable en isolation.
- La conclusion (workflow gagne/perd et pourquoi) est explicite.

## 🎤 À savoir expliquer à l'oral
Explique l'échange fondamental : « un workflow, c'est un agent dont j'ai figé le plan — je troque l'autonomie contre la prévisibilité, et pour un flux connu c'est un excellent échange : coût estimable, pas de boucle, étapes testables ». Puis ta comparaison chiffrée : « même résultat que l'agent, coût divisé par N ». La preuve chiffrée fonde la doctrine.
