# Correction — Jour 66 : Projet 2 — LivreAPI : documentation, README, ADR, démo

[← Retour au jour 66](../days/day-066.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Finaliser LivreAPI pour l'utilisabilité : README dans l'ordre du lecteur (quoi → lancer → tester → construit → limites), collection Postman exportée comme doc vivante et exécutable, démo 2 min enregistrée, et ADR n°2 (validation manuelle vs librairie) avec point de bascule. Le critère de réussite mesurable : suivre ses propres instructions sur un clone frais et être opérationnel en 5 minutes.

## ✅ Une solution simple
Un README avec installation et usage, plus la collection exportée. Le projet est présentable.

## 🚀 Une solution améliorée
Structurer le README dans l'ordre des questions du lecteur et le TESTER sur un clone frais (opérationnel en 5 min), exporter/versionner la collection Postman, enregistrer une démo de 2 min (scénario écrit, une répétition, une prise), et écrire l'ADR n°2 avec le point de bascule explicite. Documenter les limites connues honnêtement.

## ⚠️ Erreurs probables et points à vérifier
- Collection non versionnée : la doc vivante disparaît avec le poste de l'auteur.
- README qui suppose un contexte absent (prérequis non dits, chemins codés en dur) : l'inconnu bloque.
- README dans l'ordre de l'auteur et jamais testé sur un clone frais.
- ADR réduit à une phrase, sans point de bascule : la décision paraît subie.

## 🔍 Comment vérifier ta solution
- README complet testé (suivre ses propres instructions sur un clone frais).
- Collection Postman exportée + démo 2 min enregistrée.
- ADR n°2 écrit avec le point de bascule explicite.
- Un inconnu serait opérationnel en 5 minutes (critère vérifié).

## ❓ Réponses du mini-quiz
1. **Quel est le critère unique d'une bonne documentation d'API ?**
   → Un inconnu peut-il la tester en 5 minutes ? Ce critère rend la qualité mesurable : il suffit de suivre ses propres instructions sur un clone frais.
2. **Dans quel ordre un README doit-il répondre aux questions du lecteur ?**
   → C'est quoi → comment lancer → comment tester (importer la collection) → comment c'est construit (architecture) → quelles limites. L'ordre des questions du lecteur, pas celui de l'auteur.
3. **Pourquoi une collection Postman est-elle une meilleure doc qu'un texte figé ?**
   → Elle est EXÉCUTABLE : on la clone, l'importe, la lance et tout passe. Elle documente l'usage réel et prouve que l'API marche, contrairement à un texte figé qui se périme.
4. **Quel double bénéfice apporte une démo enregistrée de 2 minutes ?**
   → Elle prouve que ça marche sans rien installer pour le lecteur, ET elle t'entraîne à PRÉSENTER ton travail — la compétence de communication commencée dès maintenant.

## 🎤 À savoir expliquer à l'oral
Pose le critère mesurable : « un inconnu teste l'API en 5 minutes ; je le vérifie sur un clone frais ». Décris le README dans l'ordre du lecteur et la collection comme doc vivante exécutable. Souligne le double bénéfice de la démo (preuve sans installation + entraînement à présenter) et l'ADR qui trace une décision avec son point de bascule. Insister sur « je teste ma propre doc sur un clone » montre que tu penses au lecteur, pas à toi.
