# Correction — Jour 227 : Décisions de conception du RAG

[← Retour au jour 227](../days/day-227.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le document réussit si chaque décision a un critère d'échec OBSERVABLE (relié à un symptôme mesurable, idéalement déjà vu dans l'autopsie) et un re-test planifié. Le statut (OK / surveillance / à re-tester) fait le lien avec les données d'hier — trois décisions doivent déjà être « sous surveillance ».

## ⚠️ Erreurs probables et points à vérifier
- Des justifications reconstruites a posteriori (« 400 tokens car c'est optimal ») : dis la vérité — « valeur de départ standard, à mesurer » est une justification honnête et solide.
- Des critères d'échec invérifiables (« si la qualité baisse ») : il faut un SIGNAL observable (tel type d'échec dans la grille, tel comportement).
- Six pages au lieu de six blocs : le document doit se relire en 5 minutes avant chaque design review.
- Oublier de relier aux autopsies : un critère ancré dans un cas réel vaut dix critères théoriques.

## 🔍 Comment vérifier ta solution
- 6 blocs complets : valeur, pourquoi, échoue-si, re-test, statut.
- ≥ 3 critères d'échec citent des cas concrets du jour 226.
- Chaque re-test pointe vers un jour précis du programme.
- La matrice coût-du-changement est remplie (variante).

## 🎤 À savoir expliquer à l'oral
Choisis UNE décision « sous surveillance » et déroule-la : la valeur, le critère d'échec, les données qui l'accusent déjà, le re-test prévu. C'est la réponse parfaite à « comment améliorerais-tu ton projet ? » — tu montres que l'amélioration est PLANIFIÉE, pas improvisée.
