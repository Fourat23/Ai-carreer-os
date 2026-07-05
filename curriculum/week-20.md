# Semaine 20 — SQL avancé : modélisation, index, transactions ; ETL

> **Mois 5** · Compétences : SQL / Data, Python

[← Mois 5](month-05.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 134](days/day-134.md)
- [Jour 135](days/day-135.md)
- [Jour 136](days/day-136.md)
- [Jour 137](days/day-137.md)
- [Jour 138](days/day-138.md)
- [Jour 139](days/day-139.md)
- [Jour 140](days/day-140.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Passer de 'je fais des SELECT' à 'je conçois des schémas et des pipelines'. C'est ce qui rend un profil IA crédible sur la data.
- **Test pratique :** 90 min : modélise un schéma e-commerce (clients/commandes/produits/lignes), crée-le en SQLite, charge des données depuis 2 CSV avec un script Python (transactionnel), écris 5 requêtes analytiques (CA/mois, top clients, produits jamais vendus...).
- **Test théorique :** 1NF/2NF/3NF en une phrase chacune ; que fait un index et son coût ; ACID : les 4 lettres avec exemples ; quand dénormaliser ; différence DELETE/TRUNCATE/DROP.
- **Mini-projet :** Script ETL rejouable : extract (CSV+API), transform (nettoyage pandas), load (SQLite transactionnel), avec logs et gestion d'échec au milieu du chargement.
- **Critères de passage :**
  - [ ] Schéma correct (validé contre la solution)
  - [ ] 5/5 requêtes analytiques
  - [ ] ETL survit à une interruption simulée
- **Exercice d'architecture :** Ton ETL doit tourner chaque nuit. Liste ce qui peut échouer (source absente, format changé, disque plein, doublons) et pour chaque cas : détection, comportement, notification. C'est ta première pensée 'production'.
