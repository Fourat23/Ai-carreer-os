# Correction — Jour 295 : OWASP pour applications LLM

[← Retour au jour 295](../days/day-295.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : vérifier l'injection de prompt sur DocQA. Solution améliorée : auditer contre les TROIS risques majeurs de l'OWASP LLM Top 10 — injection (défenses en profondeur + ancrage), fuite d'info sensible (moindre privilège du CONTEXTE : données d'autres utilisateurs, system prompt), excès d'autonomie (moindre privilège des OUTILS + validation) — avec pour chacun surface, test d'exploitabilité, contre-mesure vérifiée, résiduel documenté. Un audit structuré par référentiel est systématique et parle le langage sécurité.

## ⚠️ Erreurs probables et points à vérifier
- Réduire la sécurité LLM à l'injection : la fuite de données inter-utilisateurs et l'excès d'autonomie sont tout aussi critiques et souvent négligés.
- Oublier le moindre privilège du CONTEXTE : mettre des données d'autres utilisateurs dans le contexte est la cause n°1 des fuites — n'y mettre que le nécessaire pour l'utilisateur courant.
- Donner aux agents des outils puissants « au cas où » : chaque capacité d'action est une surface d'excès d'autonomie — un agent injecté l'utilisera.
- Auditer sans documenter le résiduel : un audit honnête liste ce qui reste exploitable, il ne prétend pas à l'étanchéité.

## 🔍 Comment vérifier ta solution
- Les 3 risques majeurs (injection, fuite, excès d'autonomie) sont audités sur DocQA.
- Pour chacun : surface identifiée, test d'exploitabilité, contre-mesure vérifiée, résiduel documenté.
- Le moindre privilège du contexte (données) ET des outils (actions) est vérifié.
- Un test de fuite du system prompt est effectué.
- L'inventaire des capacités d'action des agents est fait (variante).

## 🎤 À savoir expliquer à l'oral
Structure ta réponse par le référentiel : « j'audite contre l'OWASP LLM Top 10, en priorité injection, fuite d'info sensible, excès d'autonomie ». Puis le moindre privilège en fil rouge : « du contexte (pas de données d'autrui) et des outils (un agent injecté sans outil dangereux est inoffensif) ». Parler le langage d'un référentiel reconnu et centrer sur le moindre privilège signale une vraie maturité sécurité IA.
