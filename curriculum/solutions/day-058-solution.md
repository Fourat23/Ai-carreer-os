# Correction — Jour 58 : Modélisation, normalisation, index, transactions

[← Retour au jour 58](../days/day-058.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Concevoir un schéma normalisé (3NF : chaque fait à un endroit, relations par clés étrangères), ajouter des index JUSTIFIÉS sur les colonnes filtrées/jointes souvent (compromis lecture/écriture), et garantir l'atomicité des opérations liées par des transactions (ACID). Savoir dénormaliser par exception en assumant le compromis. La preuve : le schéma résiste aux évolutions et une interruption simulée déclenche bien le rollback.

## ✅ Une solution simple
Créer des tables avec des clés étrangères et une transaction pour les opérations liées. La base est fonctionnelle.

## 🚀 Une solution améliorée
Modéliser en 3NF avec des relations justifiées (éliminer toute redondance), poser chaque index avec une JUSTIFICATION écrite (quelle requête il sert), écrire une transaction correcte (commande + décrément de stock atomiques) et PROUVER le rollback en simulant une interruption. Discuter quand dénormaliser et ce qu'on accepte en échange.

## ⚠️ Erreurs probables et points à vérifier
- Dupliquer une donnée (auteur copié dans chaque livre) : désynchronisation garantie à la première correction.
- Index partout (écritures pénalisées) ou nulle part (lectures lentes) : le dosage dépend du profil d'accès.
- Opérations liées non transactionnelles : une panne à mi-chemin laisse un état incohérent (stock faux).
- Dénormaliser sans raison ni maîtrise de la synchronisation : on réintroduit les incohérences que la normalisation évite.

## 🔍 Comment vérifier ta solution
- Schéma 3NF avec relations justifiées (validé contre la solution).
- Chaque index posé a une justification écrite (quelle requête il sert).
- La transaction testée : une interruption simulée déclenche bien le rollback (preuve).
- On sait énoncer quand et pourquoi dénormaliser, et ce qu'on accepte.

## ❓ Réponses du mini-quiz
1. **Que garantit la normalisation, et quel problème évite-t-elle ?**
   → Une source de vérité : chaque fait vit à un seul endroit. Elle évite la désynchronisation — une donnée dupliquée (une bio d'auteur copiée dans chaque livre) finit toujours par diverger quand on la corrige à un endroit seulement.
2. **Quel est le compromis d'un index ?**
   → Il accélère les LECTURES (O(log n) au lieu d'un parcours complet) mais ralentit les ÉCRITURES (il faut le maintenir) et coûte de l'espace. On indexe les colonnes filtrées/jointes souvent, pas toutes.
3. **Que garantit une transaction, et que signifie ACID ?**
   → L'atomicité : les opérations réussissent toutes ou sont toutes annulées (rollback). ACID = Atomicité, Cohérence, Isolation, Durabilité — les garanties qui empêchent un état incohérent (ex. stock décrémenté sans emprunt).
4. **Quand dénormaliser volontairement, et qu'accepte-t-on en échange ?**
   → Quand la performance de LECTURE l'exige (éviter des JOIN coûteux). En échange, on accepte le risque de désynchronisation d'une donnée dupliquée, qu'il faut alors maîtriser. On normalise par défaut, on dénormalise par exception.

## 🎤 À savoir expliquer à l'oral
Structure autour des trois notions et de leurs compromis : « je normalise pour une source de vérité (chaque fait à un endroit), j'indexe les colonnes souvent filtrées en assumant le coût sur les écritures, et j'enveloppe les opérations liées dans des transactions pour l'atomicité ». Donne l'exemple stock + emprunt et le rollback. Terminer par « je normalise par défaut, je dénormalise par exception et en connaissance de cause » montre que tu arbitres, exactement ce qu'un lead attend d'une conception de données.
