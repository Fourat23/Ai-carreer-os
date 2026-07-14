# Correction — Jour 201 : Hallucinations

[← Retour au jour 201](../days/day-201.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Chaque cas documenté suit la même grille : prompt → réponse → preuve de fausseté → mécanisme (quel pattern plausible a été complété). La contre-épreuve avec grounding montre le levier : le problème se déplace de « la mémoire du modèle » vers « ce que JE mets dans le contexte ».

## ⚠️ Erreurs probables et points à vérifier
- Moraliser (« l'IA est menteuse ») au lieu de mécaniser : la mission demande le POURQUOI, c'est lui qui a de la valeur.
- Choisir des questions dont tu ne peux pas VÉRIFIER la réponse : sans preuve de fausseté, pas de cas documenté.
- Croire que « demande-lui d'être honnête » suffit : sans les faits dans le contexte, la consigne réduit mais n'élimine pas l'invention.

## 🔍 Comment vérifier ta solution
- 3 hallucinations avec preuve de fausseté chacune.
- Le mécanisme est explicité pour chaque cas (pattern complété).
- La contre-épreuve grounding est faite et son effet décrit.
- Ta note distingue « erreur » (fait faux fréquent) et « hallucination » (invention plausible).

## 🎤 À savoir expliquer à l'oral
Raconte TON meilleur cas en 45 secondes : la question piège, la réponse inventée avec aplomb, la preuve, le mécanisme. Termine par « et c'est pour ça que le RAG existe » — transition parfaite qui montre où tu vas.
