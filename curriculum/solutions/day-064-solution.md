# Correction — Jour 64 : Projet 2 — LivreAPI : recherche, pagination, filtres

[← Retour au jour 64](../days/day-064.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Ajouter recherche (LIKE avec % sur la valeur paramétrée), pagination (LIMIT/OFFSET, en connaissant son piège de profondeur → curseur sur gros volume) et filtres combinables (critère absent = ne contraint pas, tester la présence contre le piège falsy), le tout en query string et sans jamais concaténer de SQL. Justifier les index par une mesure. La preuve : la pagination est testée en profondeur et la limite d'OFFSET est comprise.

## ✅ Une solution simple
Recherche par titre, pagination LIMIT/OFFSET et un ou deux filtres qui fonctionnent. La liste est exploitable.

## 🚀 Une solution améliorée
Construire le WHERE dynamiquement en paramétré (filtres présents seulement, piège falsy évité), mettre le % de LIKE sur la valeur, documenter la sensibilité à la casse, tester la pagination (page 1, milieu, au-delà de la fin), EXPLIQUER la limite d'OFFSET et présenter l'alternative curseur, et ajouter un index justifié par une mesure avant/après.

## ⚠️ Erreurs probables et points à vérifier
- Concaténer le terme de recherche dans le SQL (au lieu du % sur la valeur paramétrée) : faille d'injection.
- Ignorer le coût d'OFFSET en profondeur : l'API s'écroule sur les grandes pages/volumes.
- Piège falsy sur un filtre (disponible=0 confondu avec pas de filtre) : tester la présence, pas la véracité.
- Recherche/tri sans index sur gros volume : parcours complet lent.

## 🔍 Comment vérifier ta solution
- Recherche par titre/auteur fonctionnelle et insensible à la casse (choix documenté).
- Pagination testée (page 1, page du milieu, page au-delà de la fin).
- Filtres combinables corrects + un index justifié par une mesure.
- La limite d'OFFSET est comprise et l'alternative curseur est décrite.

## ❓ Réponses du mini-quiz
1. **Où doit-on ajouter le `%` d'un LIKE, et pourquoi ?**
   → Sur la VALEUR passée en paramètre (`'%' + terme + '%'`), jamais dans la chaîne SQL. Concaténer le terme dans le SQL rouvrirait la faille d'injection ; le paramètre le traite comme une donnée.
2. **Quel est le piège de performance de LIMIT/OFFSET ?**
   → Pour atteindre `OFFSET 100000`, le moteur doit lire et jeter les 100 000 premières lignes : le coût croît avec le numéro de page. Sur gros volume, on pagine par curseur (`WHERE id > dernierIdVu LIMIT n`), à coût constant.
3. **Comment un filtre absent doit-il se comporter, et quel piège éviter ?**
   → Un filtre absent ne doit rien contraindre (ne pas l'ajouter au WHERE). Piège falsy : `disponible=0` est un filtre légitime — tester la PRÉSENCE du paramètre (undefined), pas sa véracité.
4. **Pourquoi ajouter un index sur les colonnes recherchées, et à quel prix ?**
   → Sans index, une recherche/tri force un parcours complet (lent). L'index accélère les lectures mais coûte en écriture (il faut le maintenir), donc on le justifie par une mesure, pas par réflexe.

## 🎤 À savoir expliquer à l'oral
Montre que tu connais les limites : « OFFSET est simple mais lit et jette les lignes sautées — coûteux en profondeur, donc curseur sur gros volume ». Explique le % sur la valeur paramétrée (sécurité), le filtre absent qui ne contraint pas (piège falsy) et l'index justifié par une mesure. Terminer par « LIKE avec joker en tête n'est pas indexable → recherche plein texte à l'échelle » prouve que tu vois au-delà du cas simple.
