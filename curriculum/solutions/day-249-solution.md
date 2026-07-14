# Correction — Jour 249 : Tableau d'ablation

[← Retour au jour 249](../days/day-249.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'ablation est valide si tout est constant sauf la configuration, si la lecture est marginale (étage vs étage précédent), et si les trois familles de colonnes (qualité par type, latence, coût) permettent l'arbitrage. La décision finale est un PARAMÈTRE documenté (défaut + mode dégradé), pas un verdict absolu.

## ⚠️ Erreurs probables et points à vérifier
- Comparer chaque config au vectoriel initial au lieu de la précédente : les gains marginaux se brouillent et le reranking s'attribue le mérite de l'hybride.
- Un tableau qualité-seulement : sans latence ni coût, l'ablation conclut toujours « empiler plus » — les colonnes prix sont ce qui rend la décision réelle.
- Ignorer les questions perdues par étage : le +3 global de l'hybride qui cache une régression (q.14) doit être VISIBLE, tracé, expliqué.
- Re-mesurer ce qui existe déjà : l'ablation compile les campagnes des jours 246-248 — re-payer 4 campagnes complètes est du gaspillage (et introduit du bruit si quoi que ce soit a bougé).

## 🔍 Comment vérifier ta solution
- Le tableau couvre les 4 configurations × (qualité par type, p50, €/q, perdu).
- La lecture marginale est écrite pour chaque étage.
- La q.14 (perdue puis récupérée) est documentée de bout en bout.
- La décision défaut + mode dégradé est dans configs/, avec ses conditions.
- La ligne synthèses inchangées est explicitement transmise au chantier génération.

## 🎤 À savoir expliquer à l'oral
Le tableau d'ablation EST ta présentation : projette-le (ou dessine-le) et déroule les marges ligne à ligne en 2 minutes, en terminant par la découverte (« ce qui ne bouge pas localise le vrai problème »). C'est le récit d'ingénierie le plus complet de ton portfolio — répète-le jusqu'à la fluidité.
