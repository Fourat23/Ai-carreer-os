# Correction — Jour 303 : DocSense : architecture (ADRs)

[← Retour au jour 303](../days/day-303.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : lister les technos choisies. Solution améliorée : un schéma C4 montrant composants ET flux de données à plusieurs niveaux, et 4 ADR qui figent chaque décision structurante (contexte, options écartées, décision, conséquences +/−, condition de révision), le tout en architecture hexagonale (détails derrière des ports). Chaque ADR prouve l'arbitrage ; le schéma permet de raisonner sur le système avant de coder et de le présenter en entretien.

## ⚠️ Erreurs probables et points à vérifier
- Un schéma qui liste les technos sans les flux de données : on ne comprend pas comment le système fonctionne — les flux sont le cœur du schéma.
- Des ADR-plaidoyers (que des avantages) : sans conséquences négatives assumées, ce n'est pas une décision mais du marketing.
- Décider implicitement (« on verra pour le stockage ») : un choix implicite mal fait force un refactoring coûteux à mi-parcours.
- Oublier les conditions de révision : une décision sans critère de réouverture redevient un dogme intouchable.

## 🔍 Comment vérifier ta solution
- ARCHITECTURE.md contient un schéma C4 avec composants ET flux de données.
- 4 ADR figent les décisions structurantes (stockage, LLM, chunking, éval).
- Chaque ADR a options écartées, conséquences +/−, condition de révision.
- L'architecture est hexagonale (détails derrière des ports).
- Au moins une ADR assume explicitement ses conséquences négatives (variante).

## 🎤 À savoir expliquer à l'oral
Déroule une ADR en 60 secondes : « pour le stockage vectoriel, j'ai considéré Chroma, pgvector et JSON ; j'ai choisi Chroma pour le filtrage natif et la persistance sans infra lourde ; conséquence négative assumée : une dépendance de plus ; je réviserai si je dépasse 1M vecteurs ». Assumer un inconvénient et donner une condition de révision est le signal d'une vraie pensée d'architecte.
