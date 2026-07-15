# Correction — Jour 286 : Consolidation workflows

[← Retour au jour 286](../days/day-286.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un arbre de décision script/workflow/agent selon le flux. Solution améliorée : y intégrer le choix du pattern de workflow (les 4), les arbitrages CHIFFRÉS (coût/fiabilité/flexibilité/testabilité mesurés ce mois), les optimisations transverses (cache, routage de modèle, orchestration), et la règle d'or (niveau le plus bas, monter sur preuve). La valeur tient à l'ancrage : chaque règle adossée à une mesure ou expérience vécue.

## ⚠️ Erreurs probables et points à vérifier
- Une doctrine qui n'est qu'un arbre de décision sans arbitrages chiffrés : elle tranche mais ne sait pas peser selon les contraintes (budget vs fiabilité vs flexibilité).
- Récitation de bonnes pratiques non ancrées : fragile en entretien — chaque règle doit renvoyer à une mesure ou expérience du mois.
- Oublier les optimisations transverses : le cache et le routage de modèle s'appliquent à tout niveau, pas seulement aux agents.
- Une doctrine qui hésite sur des tâches concrètes : la tester sur des cas réels (variante) révèle si elle est opérationnelle ou trop vague.

## 🔍 Comment vérifier ta solution
- La doctrine couvre les trois niveaux (script/workflow/agent) avec critère de choix.
- Le choix du pattern de workflow (les 4) est intégré.
- Les arbitrages sont chiffrés/mesurés (coût, fiabilité, flexibilité, testabilité).
- Les optimisations transverses (cache, routage, orchestration) sont incluses.
- La doctrine tranche clairement sur 3 tâches de test (variante).

## 🎤 À savoir expliquer à l'oral
Présente ta doctrine comme un outil de cadrage d'architecte : « script d'abord, workflow pour la majorité, agent en dernier recours — et je pèse coût/fiabilité/flexibilité/testabilité selon les contraintes, chaque arbitrage chiffré ce mois ». Termine par la posture anti-hype : « je choisis le niveau le plus bas qui marche, et je peux prouver que le workflow suffisait ». Résister à la mode avec des chiffres = signal d'architecte.
