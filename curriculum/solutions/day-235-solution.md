# Correction — Jour 235 : Optimisation du prompt de génération

[← Retour au jour 235](../days/day-235.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La boucle est valide si : la baseline est chiffrée avant toute modification, chaque itération cible un échec observé avec UNE modification, et la re-mesure est complète à chaque fois. La progression du score compte moins que la discipline — un 13/15 obtenu proprement se défend ; un 15/15 au feeling ne prouve rien.

## ⚠️ Erreurs probables et points à vérifier
- Changer trois choses en une itération : gain inattribuable, régression masquée possible — la règle une-modif-une-mesure est absolue.
- Re-mesurer seulement les questions ciblées : les régressions arrivent ailleurs (le refus qui casse quand on assouplit, typiquement).
- Optimiser jusqu'à 15/15 sur 15 questions : au-delà d'un certain point tu sur-ajustes au jeu de test — garde des questions fraîches pour le golden set du mois 9.
- Oublier de versionner chaque itération du prompt (jour 211 : fichiers + changelog) — la v2 doit rester restaurable quand la v3 déçoit.

## 🔍 Comment vérifier ta solution
- Baseline chiffrée et échecs listés avant toute modification.
- 3 itérations documentées : cible, modification, score, décision.
- Le refus hors-corpus fonctionne encore après l'itération 3 (non-régression vérifiée).
- Chaque version du prompt est dans le système du jour 211 (fichier + changelog).

## 🎤 À savoir expliquer à l'oral
Raconte l'itération 3 en détail : le refus injustifié, l'assouplissement, et le CONTRÔLE que le refus légitime tenait toujours. « J'ai vérifié la non-régression du cas inverse » est la phrase qui distingue l'ingénieur du bidouilleur.
