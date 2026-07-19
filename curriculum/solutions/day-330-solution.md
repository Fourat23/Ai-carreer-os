# Correction — Jour 330 : DocSense : guardrails testés

[← Retour au jour 330](../days/day-330.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : tester quelques injections. Solution améliorée : adapter les 15 cas hostiles au corpus/fonctionnalités DocSense (directes ET indirectes, exfiltration, contournement, abus du workflow), avec des vérifications OBJECTIVES du blocage, vérifier que la suite PASSE (guardrails réels fonctionnent), et l'intégrer à la CI (non-régression de sécurité). Commencer le polish par là garantit que les modifications ne dégraderont pas la sécurité.

## ⚠️ Erreurs probables et points à vérifier
- Ne tester que les injections directes : l'INDIRECTE (document piégé) est la vraie menace RAG — l'inclure absolument.
- Vérifications subjectives du blocage : chaque cas a une vérif objective (le system prompt fuit-il ? la réponse est-elle détournée ?).
- Suite adverse hors CI : sans intégration, une régression du mois 12 rouvrira une faille silencieusement — l'intégrer à la CI.
- Considérer la sécurité « faite » une fois : les modifications du polish peuvent la casser — la suite en CI la maintient.

## 🔍 Comment vérifier ta solution
- 15 cas hostiles adaptés à DocSense (directes, indirectes, abus workflow, hors corpus).
- Chaque cas a une vérification objective du comportement attendu.
- La suite adverse PASSE (guardrails réels neutralisent les attaques).
- La suite est intégrée à la CI (non-régression de sécurité).
- Une faille du mois 10 (jour 300) est incluse comme cas et reste fermée (variante).

## 🎤 À savoir expliquer à l'oral
Explique la sécurité comme propriété maintenue : « je commence le polish en verrouillant la sécurité — ma suite de 15 cas hostiles (directs et indirects) passe, et elle tourne en CI, donc aucune modification du mois 12 ne peut rouvrir une faille sans que je le voie ». Puis la menace clé : « l'injection indirecte, un document piégé du corpus, est la vraie menace RAG — je la teste ». Une suite adverse testée et en CI est une preuve de sécurité que peu de projets ont.
