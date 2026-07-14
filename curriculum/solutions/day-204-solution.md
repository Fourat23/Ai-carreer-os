# Correction — Jour 204 : Prompt engineering sérieux

[← Retour au jour 204](../days/day-204.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Chaque prompt livré suit l'anatomie complète (rôle, contraintes, exemples, format, cas limites) et la preuve de robustesse est EMPIRIQUE : les mêmes entrées de test rejouées à chaque version, avec les améliorations notées. Le prompt final sans son jeu de test ne vaut que la moitié.

## ⚠️ Erreurs probables et points à vérifier
- Empiler des formules trouvées en ligne sans tester leur effet sur TA tâche : du cargo culte, pas de l'ingénierie.
- Ne tester que des entrées faciles : c'est le ticket vide, ambigu ou hostile qui révèle la robustesse.
- Modifier un prompt en production sans rejouer les cas de test : la régression silencieuse classique des apps LLM.

## 🔍 Comment vérifier ta solution
- 5 prompts en fichiers versionnés, chacun avec ≥ 3 entrées de test et sorties attendues.
- Au moins un prompt a une progression v0→vN documentée.
- Chaque prompt définit le comportement sur entrée invalide.
- Un tiers peut prédire la sortie en lisant le prompt.

## 🎤 À savoir expliquer à l'oral
Défends la position « le prompt engineering, c'est de la spécification » en 60 secondes, avec ton exemple v0→v4 : ce que le rôle a corrigé, ce que le format a corrigé, ce que les exemples ont corrigé. Concret, démontré, mémorable.
