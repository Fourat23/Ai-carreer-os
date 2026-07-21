# Correction — Jour 96 : Formulaires contrôlés et validation

[← Retour au jour 96](../days/day-096.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un state par champ, value + onChange, un handler de soumission. Solution améliorée : maj immuable d'un state-objet, validation DÉRIVÉE pure (recalculée à chaque frappe), bouton désactivé si invalide ou pendant l'envoi, preventDefault à la soumission, gestion de l'état « en cours » avec réactivation garantie (finally), et affichage des erreurs au bon moment (onBlur). La preuve : impossible d'envoyer un formulaire invalide ou de double-cliquer.

## ⚠️ Erreurs probables et points à vérifier
- Champ non contrôlé qu'on lit à la soumission : on perd la validation en direct et le pré-remplissage — contrôlé par défaut.
- Stocker les erreurs en state au lieu de les dériver : resynchronisation à faire à chaque frappe, source de bugs.
- Oublier e.preventDefault() : la page recharge et perd toute la saisie.
- Bouton d'envoi non désactivé pendant l'async : double-clic = doublon créé côté API.

## 🔍 Comment vérifier ta solution
- Chaque champ est contrôlé (value depuis le state, onChange vers le state).
- La validation est dérivée du state et recalculée à chaque frappe.
- Le bouton d'envoi est désactivé si invalide et pendant l'envoi.
- La soumission fait preventDefault et ne poste que si valide.
- Les erreurs s'affichent à un moment pertinent (onBlur), pas dès la première lettre.

## 🎤 À savoir expliquer à l'oral
Formule le principe : « le state est la source de vérité, le champ n'est que son reflet ». Déroule le cycle value → onChange → re-rendu, puis les protections de soumission (preventDefault, bouton désactivé, finally). Mentionne l'UX du onBlur — savoir QUAND montrer une erreur, pas seulement comment la calculer, distingue un front pro d'un front qui coche la case.
