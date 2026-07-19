# Correction — Jour 326 : DocSense : CI complète

[← Retour au jour 326](../days/day-326.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : lancer les tests en CI. Solution améliorée : une CI à trois niveaux (lint, tests unitaires du cœur avec stubs, éval smoke avec appels LLM mockés/rejoués pour vérifier que le pipeline tourne sans coût ni non-déterminisme), qui passe au ROUGE sur toute régression. L'éval smoke teste que le pipeline TOURNE (format), pas la qualité fine (harnais complet hors CI). Rendre la qualité automatique à chaque commit protège les dernières semaines.

## ⚠️ Erreurs probables et points à vérifier
- Vrais appels LLM en CI : coûteux, lents, non déterministes — mocker/rejouer pour l'éval smoke.
- Confondre éval smoke et évaluation de qualité : le smoke vérifie que ça TOURNE (format), le harnais complet mesure la qualité (hors CI).
- CI qui ne teste pas le pipeline IA : les régressions du pipeline passent inaperçues — inclure une éval smoke.
- CI qui ne passe jamais au rouge : vérifier qu'elle détecte un pipeline cassé, sinon ce n'est pas un filet.

## 🔍 Comment vérifier ta solution
- La CI a trois niveaux : lint, tests unitaires, éval smoke.
- L'éval smoke utilise des appels LLM mockés/rejoués (pas de vrais appels).
- L'éval smoke vérifie que le pipeline tourne (format valide).
- La CI passe au ROUGE sur une régression (testé en cassant le pipeline).
- L'évaluation de qualité fine reste hors CI (harnais complet).

## 🎤 À savoir expliquer à l'oral
Explique comment tester du non-déterministe en CI : « les vrais appels LLM sont coûteux, lents et non déterministes — je les mocke pour l'éval smoke, qui vérifie que le pipeline TOURNE (format valide), pas la qualité fine ; ma CI lint, teste et vérifie le pipeline à chaque commit ». Tester son pipeline LLM en CI est un signal de sophistication que peu de projets ont.
