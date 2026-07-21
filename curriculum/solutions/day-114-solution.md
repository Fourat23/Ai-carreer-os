# Correction — Jour 114 : Projet 3 — CRUD complet

[← Retour au jour 114](../days/day-114.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : des fonctions creer/modifier/supprimer qui appellent l'api. Solution améliorée : réutiliser le formulaire contrôlé validé pour créer ET modifier (initialisation différente, verbe HTTP différent), mettre à jour l'état IMMUABLEMENT à chaque réussite (spread/map/filter), CONFIRMER toute suppression, et gérer l'ÉCHEC de l'api pour que l'UI ne mente jamais (rollback ou message). La preuve : une écriture rejetée par le serveur ne modifie pas l'affichage.

## ⚠️ Erreurs probables et points à vérifier
- UI qui « ment » : mettre à jour l'état sans gérer l'échec de l'api affiche un changement que le serveur a refusé.
- Suppression sans confirmation : destruction de données par un clic accidentel.
- Muter l'état après écriture (push/splice) au lieu de spread/map/filter : désynchronisation de l'affichage.
- Dupliquer deux formulaires quasi identiques pour créer et modifier au lieu d'en réutiliser un seul : plus de code, incohérences.

## 🔍 Comment vérifier ta solution
- Les quatre opérations (créer, lire, modifier, supprimer) fonctionnent.
- Le formulaire contrôlé validé est réutilisé pour créer et modifier.
- Chaque écriture met à jour l'état immuablement (spread/map/filter).
- La suppression est confirmée avant exécution.
- L'échec d'un appel api est géré : l'UI ne reflète jamais un changement refusé.

## 🎤 À savoir expliquer à l'oral
Présente le CRUD comme un ASSEMBLAGE : « formulaire validé + écriture immuable + couche api, décliné en C/U/D ». Insiste sur les deux points de maturité : la suppression confirmée (action destructrice) et l'UI qui ne ment pas (gérer l'échec de l'api). Mentionner le formulaire réutilisé pour créer et modifier montre que tu penses conception, pas copier-coller.
