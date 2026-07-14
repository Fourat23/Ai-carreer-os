# Correction — Jour 232 : Préparation Projet 6 : DocQA évalué

[← Retour au jour 232](../days/day-232.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le cadrage est complet si un tiers peut répondre, en le lisant : sur quoi porte le système (corpus figé), ce qu'il promet par type de question, comment on saura si v1 bat v0 (golden set + verdicts + baseline), et ce qui est hors jeu. Les critères sont écrits AVANT les résultats — c'est toute leur valeur.

## ⚠️ Erreurs probables et points à vérifier
- Cadrer « toutes les questions » : sans taxonomie, l'évaluation mélangera des choses incomparables et le score global ne voudra rien dire.
- Écrire les questions du golden set d'après ce que le système sait DÉJÀ faire : elles doivent venir du besoin utilisateur, pas des capacités actuelles.
- Sauter la baseline v0 : améliorer sans point de départ chiffré = naviguer sans position.
- Un cadrage de 10 pages : 2 pages max — un cadrage qu'on ne relit pas est un cadrage mort.

## 🔍 Comment vérifier ta solution
- Corpus listé et figé avec date.
- Les 5 types de question ont chacun une promesse ET un exemple concret.
- Le plan d'évaluation précise nombre, verdicts, baseline, seuils v1.
- 5 questions du golden set déjà écrites avec réponse attendue (variante).
- La section « hors périmètre assumé » existe et est honnête.

## 🎤 À savoir expliquer à l'oral
Présente le cadrage comme tu le ferais à un client : « voici ce que le système promet, type par type ; voici comment on mesurera ; voici ce qu'il ne fera pas ». Savoir dire « il ne fera pas X » avec aplomb est une compétence d'entretien — ça s'entraîne ici.
