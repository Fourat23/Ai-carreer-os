# Correction — Jour 134 : SQL avancé : normalisation

[← Retour au jour 134](../days/day-134.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : séparer les données en quelques tables. Solution améliorée : atteindre la 3NF en repérant les dépendances (1NF valeurs atomiques, 2NF dépendance de toute la clé, 3NF pas de dépendance transitive), sortir chaque groupe de faits dans sa table reliée par clé étrangère (avec contraintes NOT NULL/CHECK/REFERENCES), justifier chaque relation, et décider consciemment de toute dénormalisation. La preuve : modifier un fait (déménagement client) ne touche qu'une seule ligne.

## ⚠️ Erreurs probables et points à vérifier
- Laisser de la redondance (prix/adresse répétés) : anomalies de mise à jour, insertion, suppression garanties.
- Dépendance transitive non éliminée (ville dépend du code postal dépend de la clé) : viole la 3NF.
- Valeurs non atomiques (liste dans une cellule) : viole la 1NF, filtrage/jointure impossibles.
- Dénormaliser par négligence plutôt que par choix : redondance non gérée, incohérences silencieuses.

## 🔍 Comment vérifier ta solution
- Chaque cellule est atomique et chaque ligne unique (1NF).
- Chaque attribut non-clé dépend de toute la clé (2NF) et de rien que la clé (3NF).
- Les tables sont reliées par des clés étrangères (REFERENCES).
- Modifier un fait ne touche qu'une seule ligne.
- Toute dénormalisation éventuelle est un choix justifié, pas un oubli.

## 🎤 À savoir expliquer à l'oral
Explique que la redondance cause des ANOMALIES (pas juste du gaspillage) : mise à jour, insertion, suppression. Résume la 3NF (« la clé, toute la clé, rien que la clé ») et montre la recomposition par jointure. Le test du déménagement (une seule ligne à modifier) prouve concrètement que ton schéma est sain. Mentionne la dénormalisation délibérée pour montrer que tu connais l'arbitrage intégrité/lecture.
