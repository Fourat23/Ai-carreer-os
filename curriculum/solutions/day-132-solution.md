# Correction — Jour 132 : Data quality en fonctions réutilisables

[← Retour au jour 132](../days/day-132.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : mettre le code du notebook dans des fonctions. Solution améliorée : découper en fonctions PURES à responsabilité unique (load/validate/clean/report), chacune renvoyant une nouvelle valeur sans muter l'entrée ni lire d'état global, valider tôt (échec clair sur données invalides), et TESTER chaque fonction avec pytest sur des cas connus (y compris les cas d'échec). La preuve : le pipeline se compose, se rejoue de façon déterministe, et chaque étape est couverte par un test.

## ⚠️ Erreurs probables et points à vérifier
- Fonction qui mute son entrée ou lit un état global : impure, source de surprises — utiliser `df.copy()` et ne dépendre que des paramètres.
- Tout garder dans le notebook : non testable, non rejouable, dépendant de l'ordre d'exécution des cellules.
- Sauter la validation : un pipeline qui traite des données invalides produit des résultats invalides sans le signaler.
- Une fonction fourre-tout qui load + clean + report : impossible à tester ou remplacer par morceau — une responsabilité par fonction.

## 🔍 Comment vérifier ta solution
- Le nettoyage est découpé en fonctions pures à responsabilité unique (load/validate/clean/report).
- Aucune fonction ne mute son entrée ni ne lit d'état global.
- `validate` échoue tôt sur des données non conformes.
- Chaque fonction est testée avec pytest (chemin heureux ET cas d'échec).
- Le pipeline se compose et se rejoue de façon déterministe.

## 🎤 À savoir expliquer à l'oral
Explique la transition « le notebook explore, le module produit » : fonctions pures (mêmes entrées → mêmes sorties, pas de mutation), à responsabilité unique, testables et composables. Insiste sur validate qui échoue tôt et sur la testabilité (un notebook ne se teste pas). Cette transition « analyst → data engineer » est ce qui montre que tu sais livrer un outil, pas juste une analyse.
