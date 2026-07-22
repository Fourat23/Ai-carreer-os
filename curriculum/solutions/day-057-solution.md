# Correction — Jour 57 : SQLite branché sur l'API : persistance réelle et anti-injection

[← Retour au jour 57](../days/day-057.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Brancher SQLite en toute sécurité : requêtes PARAMÉTRÉES partout (séparation code/données, LA défense contre l'injection), tout le SQL isolé dans une couche data (contrôle de sécurité en un point, migration triviale — l'interface Store appliquée à une base), et schéma versionné (init.sql). Prouver que l'injection échoue en la tentant. Comprendre POURQUOI le paramétrage protège, pas seulement l'appliquer.

## ✅ Une solution simple
Remplacer le stockage mémoire par SQLite avec des requêtes paramétrées. L'API persiste réellement.

## 🚀 Une solution améliorée
Garantir 100 % de requêtes paramétrées (vérifié par relecture : zéro concaténation), isoler tout le SQL dans une couche data (services aveugles au SQL), versionner le schéma dans init.sql, et DOCUMENTER une tentative d'injection qui échoue (preuve à l'appui). Expliquer la séparation code/données et la limite du paramétrage (identifiants dynamiques → liste blanche).

## ⚠️ Erreurs probables et points à vérifier
- Concaténer des chaînes dans le SQL : faille d'injection béante, même « juste pour un champ ».
- Schéma non versionné : base irreproductible (« ça marche sur ma machine »).
- Croire que le paramétrage protège les identifiants dynamiques (colonnes/tables) : eux exigent une liste blanche.
- Laisser du SQL dans les services au lieu de l'isoler en couche data : sécurité incontrôlable et migration douloureuse.

## 🔍 Comment vérifier ta solution
- L'API fonctionne sur SQLite avec schéma versionné (init.sql).
- 100 % des requêtes paramétrées (vérifié par relecture : zéro concaténation).
- Une tentative d'injection documentée ÉCHOUE (preuve à l'appui).
- Tout le SQL est isolé dans la couche data (services aveugles au SQL).

## ❓ Réponses du mini-quiz
1. **D'où vient une injection SQL, fondamentalement ?**
   → De la CONCATÉNATION de l'entrée utilisateur dans la requête : code SQL et données sont mélangés, donc si l'utilisateur écrit du SQL (`' OR 1=1 --`), le moteur l'exécute.
2. **Comment une requête paramétrée empêche-t-elle l'injection ?**
   → Elle envoie la STRUCTURE (`WHERE nom = ?`) et les VALEURS séparément : le moteur compile la structure puis traite les valeurs STRICTEMENT comme des données, jamais comme du code. L'entrée ne peut plus être exécutée.
3. **Pourquoi isoler tout le SQL dans une couche data ?**
   → Double bénéfice : la sécurité se contrôle en un seul endroit (relire un fichier pour vérifier « zéro concaténation ») et la migration devient triviale (un seul fichier change si SQLite devient PostgreSQL).
4. **Le paramétrage protège-t-il TOUT dans une requête ?**
   → Non : il protège les VALEURS, pas les identifiants dynamiques (noms de colonnes/tables), qui exigent une liste blanche. Mais pour les valeurs utilisateur, c'est la défense totale.

## 🎤 À savoir expliquer à l'oral
Explique la CAUSE avant la défense : « l'injection vient du mélange code/données par concaténation ; le paramétrage les sépare, donc l'entrée reste une donnée, jamais du code ». Donne l'exemple `' OR 1=1 --` neutralisé. Insiste sur la règle absolue (zéro concaténation), l'isolation en couche data (sécurité en un point + migration), et le fait que tu le PROUVES en attaquant. Mentionner la limite (identifiants dynamiques → liste blanche) montre une compréhension fine, au-delà de la recette.
