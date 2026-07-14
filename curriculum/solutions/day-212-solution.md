# Correction — Jour 212 : Guardrails d'entrée/sortie

[← Retour au jour 212](../days/day-212.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Chaque frontière a sa liste de risques et un contrôle par risque : taille/format/pertinence/injection à l'entrée, schéma/règles métier/refus défini à la sortie. La preuve est le jeu de tests bidirectionnel : cas qui passent, cas qui bloquent, tous automatisés.

## ⚠️ Erreurs probables et points à vérifier
- Tout miser sur le prompt (« ne réponds jamais hors sujet ») : une instruction n'est pas un contrôle — le guardrail vit dans TON code.
- Bloquer sans réponse de repli : l'utilisateur légitime bloqué par erreur doit comprendre quoi faire.
- Ne tester que les cas à bloquer : un guardrail trop strict qui refuse les demandes normales est un bug aussi grave.
- Considérer l'injection « réglée » par un filtre de mots-clés : c'est une réduction de surface, pas une immunité — reste honnête sur la limite.

## 🔍 Comment vérifier ta solution
- 5 entrées légitimes variées passent toutes.
- Les 5 entrées hostiles/absurdes sont toutes bloquées avec un message utile.
- « Ignore tes instructions » n'altère pas le comportement (séparation system/user vérifiée).
- Chaque déclenchement est loggé avec sa raison.

## 🎤 À savoir expliquer à l'oral
Dessine le sandwich : [guardrail entrée] → LLM → [guardrail sortie], et donne UN exemple concret par couche. Puis la phrase d'honnêteté qui fait senior : « ça réduit la surface d'attaque, ça ne la supprime pas — et je sais où sont les limites ».
