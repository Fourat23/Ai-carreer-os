# Correction — Jour 117 : Projet 3 — Polish et états edge

[← Retour au jour 117](../days/day-117.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : ajouter quelques spinners et messages d'erreur. Solution améliorée : dresser un tableau écran × état (loading/error/empty/edge) pour rendre la passe SYSTÉMATIQUE, parcourir chaque case en adversaire de soi-même, corriger les états non-heureux manquants, les cas limites (titre long, grande liste, double-clic, caractères spéciaux), les feedbacks d'action absents, et assurer la cohérence (libellés, styles). La preuve : aucun écran n'a d'état non-heureux oublié, et un testeur externe peine à « casser » l'app.

## ⚠️ Erreurs probables et points à vérifier
- Ne soigner que le chemin heureux : les états loading/error/empty oubliés donnent une impression de bâclé.
- Polir « au feeling » sans méthode : on oublie des écrans — le tableau écran × état rend la passe systématique.
- Ignorer les cas limites (titre long, grande liste, double-clic) : ils cassent en conditions réelles.
- Négliger le feedback d'action : l'utilisateur ne sait pas si son ajout/suppression a marché.

## 🔍 Comment vérifier ta solution
- Chaque écran gère loading, error et empty explicitement.
- Les cas limites (titre long, grande liste, double-clic, caractères spéciaux) sont traités.
- Chaque action donne un feedback visible (envoi..., confirmation).
- La cohérence (libellés, styles, formats) est assurée d'un écran à l'autre.
- Le polish a été mené systématiquement (tableau écran × état), pas au hasard.

## 🎤 À savoir expliquer à l'oral
Définis le polish : « traiter tous les états non-heureux et cas limites, partout — ce qui sépare une démo d'un produit ». Décris ta méthode (tableau écran × état, parcours en adversaire). Souligne que « le polish n'ajoute pas de feature, il rend soigné ce qui existe » et que la perception de qualité vient de ces états rarement montrés. Faire tester l'app par un tiers est l'audit qui le prouve.
