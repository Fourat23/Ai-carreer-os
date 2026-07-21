# Correction — Jour 103 : Accessibilité et UX de base

[← Retour au jour 103](../days/day-103.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : ajouter des alt et des labels manquants. Solution améliorée : construire sur du HTML sémantique (vrais boutons, labels liés, titres hiérarchisés, nav/main), garantir la navigation clavier complète (audit sans souris), un focus visible et géré, des contrastes suffisants, et croiser un audit automatique (Lighthouse/axe) avec le parcours clavier vécu. La preuve : l'app est entièrement utilisable au clavier et cinq problèmes réels sont corrigés, pas seulement signalés.

## ⚠️ Erreurs probables et points à vérifier
- <div onClick> au lieu de <button> : non focusable, inutilisable au clavier, muet pour les lecteurs d'écran.
- Supprimer l'outline de focus sans le remplacer : l'utilisateur clavier ne voit plus où il est.
- Champs sans <label> lié : le lecteur d'écran n'annonce pas à quoi sert le champ.
- Se fier uniquement à l'audit automatique : il rate l'ordre de focus illogique et l'expérience clavier réelle.

## 🔍 Comment vérifier ta solution
- Toute interactivité utilise le HTML sémantique adéquat (button, label, nav).
- L'app entière est navigable et activable au clavier (testé sans souris).
- Le focus est toujours visible et géré après les actions.
- Images (alt) et contrastes sont conformes.
- Cinq problèmes concrets sont réellement corrigés, audit automatique + clavier croisés.

## 🎤 À savoir expliquer à l'oral
Résume : « l'accessibilité, c'est surtout le bon HTML dès le départ — un vrai bouton est accessible gratuitement ». Décris ton audit clavier (parcourir sans souris) comme le test le plus révélateur. Mentionne le double bénéfice (inclusion + SEO + utilisabilité pour tous). Montrer qu'on pense clavier et label signale un souci du détail que les recruteurs front remarquent.
