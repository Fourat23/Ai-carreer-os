# Correction — Jour 89 : Full-stack complet : une mini-app de bout en bout

[← Retour au jour 89](../days/day-089.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Assembler un mini full-stack complet (front React + LivreAPI) et le comprendre de bout en bout : savoir tracer une donnée du clic à la base et retour en nommant chaque maillon (aucune magie), réaliser le CRUD complet de bout en bout, et soigner les trois états edge (vide, erreur, chargement). La preuve : le CRUD fonctionne en local, les états edge sont soignés (testés serveur coupé), et on explique le trajet complet à voix haute sans hésiter.

## ✅ Une solution simple
Un front React qui liste et ajoute des livres via l'API. Le full-stack tourne.

## 🚀 Une solution améliorée
Réaliser le CRUD complet (liste, détail, ajout, édition, suppression, recherche) de bout en bout, soigner les 3 états edge sur chaque vue (vide, erreur, chargement — testés en coupant le serveur), et surtout SAVOIR TRACER le trajet complet d'une donnée (clic → ... → SQL → ... → re-render) sans aucun maillon magique. S'enregistrer en l'expliquant.

## ⚠️ Erreurs probables et points à vérifier
- États edge négligés : liste vide = page blanche, erreur réseau = plantage silencieux — l'app paraît cassée.
- Ne pas comprendre une des couches (« magie ») : au premier bug transversal, on est perdu.
- Mise à jour du state non immuable après un ajout : React ne re-rend pas, le livre n'apparaît pas.
- Se contenter de « ça marche » sans pouvoir expliquer le trajet complet d'une donnée.

## 🔍 Comment vérifier ta solution
- CRUD complet fonctionnel de bout en bout en local.
- Les 3 états edge soignés sur chaque vue (vide, erreur, chargement) — testés en coupant le serveur.
- Le trajet complet d'une donnée expliqué à voix haute sans hésitation (enregistre-toi).
- Aucun maillon du système n'est resté « magique ».

## ❓ Réponses du mini-quiz
1. **Pourquoi le full-stack assemblé est-il le « moment de vérité » ?**
   → Parce qu'il teste si on comprend vraiment comment les couches s'articulent : peux-tu suivre une donnée du clic jusqu'à la base et retour, en nommant chaque maillon ? Si un maillon est flou, c'est le signal d'où creuser — la magie est interdite.
2. **Cite les maillons du trajet d'un ajout de livre.**
   → Clic → événement React → validation front → fetch POST (api.ts) → route Express → service (règle métier) → INSERT SQL paramétré → réponse 201 → mise à jour immuable du state → re-render. Chaque maillon est une compétence des trois mois.
3. **Pourquoi soigner les états edge (vide, erreur, chargement) ?**
   → L'utilisateur y passe peu de temps mais leur soin fait une grande part de la qualité perçue : une liste vide affichée en page blanche paraît cassée, un message utile paraît fini. Ils distinguent une app professionnelle.
4. **Quelle est la différence entre « ça marche » et « je comprends » ?**
   → Un full-stack qui marche sans qu'on sache pourquoi est fragile (perdu au premier bug). Un full-stack qu'on comprend à chaque couche est débogable, modifiable et défendable en entretien. Ne laisser aucun maillon en « magie ».

## 🎤 À savoir expliquer à l'oral
Fais la démonstration de la compréhension de bout en bout : trace un ajout de livre maillon par maillon (clic → événement → validation → fetch → route → service → SQL → 201 → state immuable → re-render) sans hésiter. Insiste sur « la magie est interdite : si un maillon est flou, c'est là que je creuse ». Montrer que tu soignes les états edge et que tu débogues en remontant le trajet prouve une maîtrise full-stack réelle — exactement ce qu'un recruteur veut chez un profil junior.
