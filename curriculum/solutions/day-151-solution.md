# Correction — Jour 151 : Probabilités utiles

[← Retour au jour 151](../days/day-151.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : appliquer la formule de Bayes P(malade|+) = P(+|malade)·P(malade)/P(+). Solution améliorée : décomposer explicitement P(+) en vrais positifs + faux positifs, vérifier le résultat par un raisonnement en effectifs sur une population (bien plus intuitif), et interpréter au regard du taux de base — puis montrer que faire varier la prévalence change radicalement P(malade|+). La preuve de compréhension : expliquer POURQUOI ~2 % (les faux positifs écrasent les vrais quand la cible est rare).

## ⚠️ Erreurs probables et points à vérifier
- Confondre P(test+|malade) et P(malade|test+) : l'erreur d'inversion la plus fréquente.
- Ignorer le taux de base (prévalence) : on surestime massivement la proba a posteriori sur une cible rare.
- Croire qu'un test précis implique un positif fiable : la fiabilité d'un positif dépend AUSSI de la rareté de la cible.
- Oublier les faux positifs dans le dénominateur P(test+) : on ne compte que les vrais positifs et le calcul est faux.

## 🔍 Comment vérifier ta solution
- P(test+) inclut bien vrais ET faux positifs.
- Le résultat est cohérent avec un raisonnement en effectifs sur une population.
- L'interprétation mentionne explicitement le taux de base.
- Faire varier la prévalence change le résultat dans le sens attendu.
- P(A|B) et P(B|A) sont clairement distingués.

## 🎤 À savoir expliquer à l'oral
Raconte le cas médical en EFFECTIFS plutôt qu'en formules : « sur 100 000 personnes, 100 malades mais 5000 faux positifs — donc un positif ne veut dire malade qu'à ~2 % ». Puis nomme le piège (base rate fallacy) et relie-le à l'accuracy trompeuse sur les classes déséquilibrées. Savoir inverser une conditionnelle avec Bayes ET l'expliquer en population est un signal fort en entretien data.
