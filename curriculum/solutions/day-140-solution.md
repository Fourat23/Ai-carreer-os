# Correction / Grille — Jour 140 : Revue de la semaine 20

[← Retour au jour 140](../days/day-140.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **SQL avancé : modélisation, index, transactions ; ETL**. Passer de 'je fais des SELECT' à 'je conçois des schémas et des pipelines'. C'est ce qui rend un profil IA crédible sur la data.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : modélise un schéma e-commerce (clients/commandes/produits/lignes), crée-le en SQLite, charge des données depuis 2 CSV avec un script Python (transactionnel), écris 5 requêtes analytiques (CA/mois, top clients, produits jamais vendus...).
- **Test théorique** (réponds de mémoire puis auto-corrige) : 1NF/2NF/3NF en une phrase chacune ; que fait un index et son coût ; ACID : les 4 lettres avec exemples ; quand dénormaliser ; différence DELETE/TRUNCATE/DROP.
- **Mini-projet / livrable** conforme : Script ETL rejouable : extract (CSV+API), transform (nettoyage pandas), load (SQLite transactionnel), avec logs et gestion d'échec au milieu du chargement.
- **Exercice d'architecture** fait sérieusement : Ton ETL doit tourner chaque nuit. Liste ce qui peut échouer (source absente, format changé, disque plein, doublons) et pour chaque cas : détection, comportement, notification. C'est ta première pensée 'production'.

## 📋 Checklist de validation
- [ ] Schéma dessiné avant le CREATE TABLE
- [ ] Index justifiés (pas partout)
- [ ] Chargements transactionnels
- [ ] ETL rejouable sans dupliquer les données

## 🚦 Critères de passage à la semaine suivante
- [ ] Schéma correct (validé contre la solution)
- [ ] 5/5 requêtes analytiques
- [ ] ETL survit à une interruption simulée

## ⚠️ Erreurs fréquentes en revue
- Se sur-noter (familiarité ≠ maîtrise) : ne compte que ce que tu produis SEUL et sais EXPLIQUER.
- Bâcler le test théorique en le relisant au lieu de répondre de mémoire (rappel actif).
- Avancer malgré des critères non atteints : mieux vaut consolider 2-3 jours que bâtir sur du sable.
- Oublier de mettre à jour ses scores de compétences dans l'application.

## 🧩 Auto-évaluation finale
- Note honnête de la semaine (0-5) : ____
- Ma plus grande difficulté cette semaine : ____
- Ce que je dois revoir avant d'avancer : ____
- Si des critères ne sont pas atteints : quel plan de rattrapage (daté) ?
