# Correction — Jour 234 : Gestion de session et historique

[← Retour au jour 234](../days/day-234.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'architecture sépare les deux contextes : l'historique (borné) sert à RÉÉCRIRE la question en version autonome ; les chunks récupérés sur la question autonome servent à RÉPONDRE. Le log de réécriture rend chaque échec de suivi diagnosticable en une ligne.

## ⚠️ Erreurs probables et points à vérifier
- Embedder la question de suivi brute : LE bug du RAG conversationnel — silencieux, car le pipeline « marche », juste sur la mauvaise question.
- Envoyer tout l'historique dans la réécriture ET la génération : double facturation de tokens qui croît à chaque tour.
- Une réécriture bavarde (le modèle explique au lieu de réécrire) : contrainte de sortie stricte (jour 205 : la question réécrite, rien d'autre).
- Promettre un multi-tours parfait : les références lointaines échouent par conception (historique borné) — documente, teste, assume.

## 🔍 Comment vérifier ta solution
- Les 4 tests de suivi passent (dont l'échec ATTENDU du test 4, au comportement raisonnable).
- Chaque tour logge question brute → question réécrite.
- L'historique est borné et l'économie de tokens chiffrée (variante).
- Le changement de sujet sec ne traîne pas le contexte précédent.

## 🎤 À savoir expliquer à l'oral
Déroule l'exemple des CDD au tableau : la question de suivi, son embedding inutile, la réécriture, le retrieval qui marche. Une minute, un problème réel, une parade nommée — c'est exactement le format qui marque un entretien technique.
