# Correction — Jour 205 : Structured outputs

[← Retour au jour 205](../days/day-205.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La fiabilité vient de la boucle complète : contrat explicite (avec convention d'absence) → validation schéma + invariants → retry informé par l'erreur → échec propre. Chaque étage attrape ce que le précédent laisse passer ; aucun étage ne fait confiance au modèle.

## ⚠️ Erreurs probables et points à vérifier
- Valider seulement « c'est du JSON » : un JSON bien formé peut contenir un montant inventé — les invariants métier sont le 2e étage obligatoire.
- Retry aveugle (re-run sans renvoyer l'erreur) : tu rejoues la même loterie au lieu de guider la correction.
- Laisser le modèle deviner les champs manquants au lieu d'imposer null : l'invention silencieuse entre en base.
- Oublier le cas « texte hors sujet » : l'extracteur doit savoir dire « rien à extraire ».

## 🔍 Comment vérifier ta solution
- Le schéma rejette un champ manquant/mal typé (teste-le exprès).
- Le retry avec erreur renvoyée est démontré sur un cas réel.
- Les 3 textes pièges produisent null/échec propre, PAS des inventions.
- Chaque échec est loggé avec le texte d'entrée.

## 🎤 À savoir expliquer à l'oral
Dessine la boucle (prompt-contrat → LLM → validation → retry → échec propre) et raconte UN cas piège de tes tests : le texte sans date, le modèle qui inventait, la validation qui l'a attrapé. L'anecdote personnelle vaut dix slides.
