# Correction — Jour 251 : Consolidation retrieval avancé

[← Retour au jour 251](../days/day-251.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La consolidation fige une POLITIQUE (défaut + dégradé + règle de bascule), pas une config unique. Chaque régime a ses chiffres (qualité, p95) et sa justification renvoyant à l'ablation. La clôture explicite (« le retrieval est fini, on mesure la suite ») évite de re-bricoler ce qui est déjà optimisé et mesuré.

## ⚠️ Erreurs probables et points à vérifier
- Figer une seule config « la meilleure » : le premier pic de charge ou de latence n'a alors aucune soupape — le mode dégradé est une fonctionnalité, pas un aveu.
- Un mode dégradé jamais testé : force-le explicitement et vérifie latence ET qualité — un dégradé qui plante ne sert à rien le jour où il faut basculer.
- Une règle de bascule vague (« si c'est lent ») : le critère doit être observable et chiffré (budget < 500 ms, contexte batch).
- Continuer à bricoler le retrieval au mois d'éval : les jours 244 et 249 ont montré que les synthèses résistent au retrieval — insister dessus, c'est optimiser le mauvais étage.

## 🔍 Comment vérifier ta solution
- La politique retrieval-v2 existe : deux régimes chiffrés + règle de bascule.
- Les deux modes tournent et donnent les scores annoncés (re-passe de contrôle).
- Le harnais du jour 221 passe dans les deux modes.
- Le manifeste d'index pointe vers retrieval-v2 et le commit est tagué.

## 🎤 À savoir expliquer à l'oral
Présente la politique comme un ingénieur fiabilité : « nominal à 24/26 pour 1,1 s, dégradé à 22/26 pour 480 ms, bascule sur budget latence — et le retrieval est désormais CLOS, la suite se joue sur la génération ». Savoir déclarer une partie finie est aussi une compétence : ça montre que tu sais où porter l'effort.
