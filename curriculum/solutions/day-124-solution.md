# Correction — Jour 124 : Python : tests (pytest)

[← Retour au jour 124](../days/day-124.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : des fonctions test_ avec assert sur la logique. Solution améliorée : tester la logique métier pure (sans I/O) ET le stockage via la fixture `tmp_path` (pas de pollution du disque), couvrir les cas limites par `@pytest.mark.parametrize`, factoriser le setup en fixtures personnalisées, et prouver chaque test en sabotant le code. La preuve de valeur : une régression volontaire (ex. l'incrément d'id) casse le bon test.

## ⚠️ Erreurs probables et points à vérifier
- Tester en écrivant/lisant de vrais fichiers du projet : tests non déterministes et polluants — utiliser `tmp_path`.
- Dupliquer le même setup dans chaque test au lieu d'une fixture : maintenance lourde.
- Copier dix fonctions pour dix cas au lieu de `parametrize` : bruit et oublis.
- Ne pas vérifier le rougissement : une suite verte qui ne peut pas échouer donne un faux sentiment de sécurité.

## 🔍 Comment vérifier ta solution
- Les tests sont des fonctions `test_*` avec `assert`, découvertes automatiquement.
- L'I/O est testée via `tmp_path` (aucune pollution du disque).
- Les cas limites sont couverts par `@pytest.mark.parametrize`.
- Le setup partagé est factorisé en fixtures.
- Chaque test a été prouvé en sabotant le code (il rougit).

## 🎤 À savoir expliquer à l'oral
Vante la simplicité de pytest (fonction + `assert`, découverte automatique) et explique les fixtures (setup réutilisable, `tmp_path` pour l'I/O jetable) et `parametrize` (table de cas). Rappelle le principe universel : « je sabote le code pour prouver que le test peut rougir ». Une suite verte qui permet de refactorer sans peur est l'argument qui montre la vraie valeur des tests.
