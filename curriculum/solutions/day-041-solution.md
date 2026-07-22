# Correction — Jour 41 : Debugging méthodique : la compétence qu'on n'enseigne jamais

[← Retour au jour 41](../days/day-041.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Appliquer un PROCESSUS au lieu de deviner : reproduire fiablement, lire l'erreur en entier, isoler par bissection, formuler une hypothèse falsifiable, la prouver par observation, corriger la CAUSE puis re-reproduire. Pour chacun des 5 bugs, documenter symptôme → hypothèse → preuve → fix, et nommer la famille (logique, typage, référence partagée, off-by-one, async). La preuve de maîtrise : aucun fix « au hasard », chaque correction découle d'une hypothèse prouvée.

## ✅ Une solution simple
Trouver les bugs en lisant le code et en testant. Fonctionne sur les bugs évidents, mais échoue ou tourne en rond sur les subtils (async, référence partagée).

## 🚀 Une solution améliorée
Dérouler la méthode complète et la DOCUMENTER pour chaque bug (symptôme, hypothèse falsifiable, preuve par observation, cause, fix, re-reproduction), en identifiant la famille et en corrigeant la cause plutôt que le symptôme. Formaliser sa propre méthode de débogage écrite et affichée. Utiliser le débogueur pas-à-pas pour l'async/l'état complexe, pas seulement console.log.

## ⚠️ Erreurs probables et points à vérifier
- Modifier du code au hasard sans hypothèse : on introduit de nouveaux bugs et on ne comprend jamais la cause.
- Corriger le symptôme (valeur par défaut qui masque un null) au lieu de la cause : le bug revient ailleurs.
- Ne pas lire le message d'erreur en entier : on ignore la ligne et la nature déjà fournies.
- Ne pas reproduire avant de corriger : impossible de savoir si le fix marche vraiment.

## 🔍 Comment vérifier ta solution
- Les 5 bugs sont trouvés avec, pour chacun, symptôme → hypothèse → preuve → correction documentés.
- Chaque fix découle d'une hypothèse PROUVÉE, aucun changement au hasard.
- La cause (pas le symptôme) est corrigée, vérifiable par re-reproduction.
- La méthode personnelle de débogage est écrite et la famille de chaque bug est nommée.

## ❓ Réponses du mini-quiz
1. **Quelle est la toute première étape du débogage méthodique, et pourquoi ?**
   → REPRODUIRE le bug de façon fiable : sans un cas qui le déclenche à volonté, on ne peut ni comprendre la cause ni vérifier qu'un fix fonctionne vraiment.
2. **Qu'est-ce que la bissection appliquée au débogage ?**
   → Couper le parcours du code en deux, observer l'état au milieu (log/breakpoint), éliminer la moitié saine et recommencer : la recherche binaire, qui localise la zone coupable en O(log n) étapes.
3. **Quelle est la différence entre corriger le symptôme et corriger la cause ?**
   → Le symptôme est ce qu'on voit (un crash) ; la cause est ce qui le produit. Masquer le symptôme (ex. forcer une valeur par défaut) fait disparaître le crash mais laisse le bug ressurgir ailleurs.
4. **Cite deux familles de bugs et leur signature.**
   → Référence partagée : modifier une variable en change une autre (copie superficielle). Off-by-one : erreur de borne de boucle (`<` vs `<=`). Aussi : async (ordre d'exécution) et type inattendu (NaN/undefined propagé).

## 🎤 À savoir expliquer à l'oral
Déroule les étapes dans l'ordre en insistant sur ce qui trahit la méthode : « je REPRODUIS d'abord, je PROUVE une hypothèse AVANT de corriger, et je corrige la CAUSE, pas le symptôme ». Donne un exemple concret (référence partagée prouvée par `a === b`). Mentionner la bissection (recherche binaire appliquée au bug) et le rubber duck montre que tu as un vrai arsenal, pas juste des console.log — c'est ce que le recruteur veut entendre.
