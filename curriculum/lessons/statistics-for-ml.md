<!-- keep -->
# Leçon — Statistiques pour le ML

## Pourquoi c'est important
Le ML sans statistiques, c'est utiliser une boîte noire en espérant que ça marche : tu ne sauras ni préparer les données, ni choisir une métrique, ni détecter que ton modèle ment. Les stats d'ici sont MINIMALES mais SOLIDES — le kit de survie pour raisonner honnêtement sur des données, repérer les pièges classiques, et répondre aux questions d'entretien (« pourquoi la moyenne est-elle trompeuse ici ? »).

## Explication complète

### Résumer des données : tendance et dispersion
- **Moyenne** : le centre de gravité — sensible aux valeurs extrêmes. UN milliardaire dans la pièce et le « salaire moyen » ment.
- **Médiane** : la valeur du milieu — robuste aux extrêmes. Pour tout ce qui est asymétrique (salaires, prix, latences), elle dit la vérité que la moyenne cache.
- **Écart-type / variance** : l'étalement autour du centre. Deux services à 40 k€ de moyenne, l'un serré (38-42), l'autre éclaté (20-60) : même moyenne, réalités opposées.

**Le réflexe n°1** : toujours REGARDER LA DISTRIBUTION (histogramme) avant de résumer par un chiffre. Bimodale ? Asymétrique ? Avec des aberrations ? Chaque forme invalide certains résumés.

### La distribution normale (et pourquoi on s'en soucie)
La « courbe en cloche » apparaît partout où de nombreux petits effets indépendants s'additionnent (tailles, erreurs de mesure). Ses propriétés (68 % à ±1 écart-type, 95 % à ±2) fondent beaucoup d'outils. MAIS beaucoup de données réelles ne sont PAS normales (revenus, popularité, latences — asymétriques à queue longue) : supposer la normalité sans vérifier est une erreur de débutant.

### Corrélation ≠ causalité (le piège roi)
Une **corrélation** (deux variables bougent ensemble) ne prouve JAMAIS une causalité. Trois explications rivales à toujours envisager : X cause Y ; Y cause X (sens inverse) ; Z cause les deux (**confondant** — les ventes de glaces et les noyades sont corrélées : l'été cause les deux). Devant « les ventes montent après la campagne, donc elle marche », le réflexe : saisonnalité ? tendance préexistante ? autre événement simultané ?

### Les biais d'échantillonnage
Un échantillon BIAISÉ produit des conclusions fausses avec une grande confiance : biais de sélection (sonder ses clients satisfaits), biais du survivant (étudier les avions revenus — l'exemple historique), données manquantes NON aléatoires (ceux qui ne répondent pas ont une raison). Question systématique : « qui est DANS ces données, et qui n'y est pas ? »

### Probabilités utiles
- **Conditionnelle** : P(A sachant B) ≠ P(B sachant A) — confusion à l'origine d'erreurs médicales et judiciaires célèbres.
- **L'intuition de Bayes** par l'exemple : maladie rare (1/1000), test fiable à 99 % → un test positif ne donne qu'environ 9 % de chance d'être malade (sur 1000 personnes : ~1 vrai positif, ~10 faux positifs). La PRÉVALENCE domine. Ce raisonnement exact expliquera pourquoi l'accuracy ment sur les classes déséquilibrées (mois 6).

## Concepts clés
Moyenne / médiane / mode · variance, écart-type · distribution, histogramme, boxplot · quantiles / percentiles (p95 de latence !) · aberration (outlier) · corrélation (et sa force) · confondant · biais de sélection / du survivant · probabilité conditionnelle · Bayes (l'intuition).

## Exemple
Latence d'une API : moyenne 120 ms — « tout va bien » ? L'histogramme montre 95 % à 80 ms et 5 % à 900 ms (timeouts). La moyenne noie le problème ; le **p95/p99** le révèle. C'est pour ça que les SLA se définissent en percentiles, jamais en moyennes — et que ton dashboard qualité RAG (mois 9) regardera la distribution des scores, pas juste leur moyenne.

## Pièges classiques
- Résumer une distribution asymétrique par sa moyenne.
- Conclure une causalité d'une corrélation (sans chercher les confondants).
- Ignorer QUI manque dans l'échantillon.
- Comparer des taux sans regarder les effectifs (le paradoxe de Simpson : une tendance peut S'INVERSER en agrégeant des groupes — à connaître de nom).

## Lien avec l'IA / le futur
Le choix de métrique ML (mois 6) est une décision statistique : précision vs rappel = arbitrer les coûts d'erreurs, exactement le raisonnement de Bayes. L'évaluation RAG (mois 9) est de la statistique appliquée : un golden set est un ÉCHANTILLON (représentatif ?), un juge LLM a des BIAIS (mesurables par accord avec l'humain), une amélioration de +3 % sur 30 questions est-elle du signal ou du bruit ? Sans ces réflexes, on optimise du hasard.

## Mini-exercice
Sur les données de ton projet 4 : calcule moyenne ET médiane d'une variable asymétrique (constate l'écart et explique-le), trace son histogramme, trouve une corrélation entre deux variables et écris les TROIS explications possibles (X→Y, Y→X, Z→les deux) avec ton verdict argumenté.

## Vocabulaire à retenir
**distribution** · **médiane / quantile / p95** · **écart-type** · **outlier** · **corrélation** · **confondant** · **biais de sélection / du survivant** · **prévalence** · **probabilité conditionnelle** · **paradoxe de Simpson**.

## Résumé
Regarde toujours la distribution avant de résumer ; préfère la médiane et les percentiles sur les données asymétriques ; ne confonds jamais corrélation et causalité (cherche les confondants) ; interroge la représentativité de tout échantillon ; et garde l'intuition de Bayes (la prévalence domine les tests). Ces cinq réflexes valent plus que des formules — ils sont le socle de toute évaluation honnête, du ML classique aux systèmes RAG.
