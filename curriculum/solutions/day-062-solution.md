# Correction — Jour 62 : Projet 2 — LivreAPI : relations et logique d'emprunt

[← Retour au jour 62](../days/day-062.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Placer la règle métier (« livre disponible ? ») dans la couche service, envelopper l'opération multi-étapes (vérifier → créer l'emprunt → marquer indisponible) dans une transaction atomique, renvoyer 409 sur le conflit de double emprunt, et utiliser des JOIN pour ramener les données liées. La preuve : une interruption simulée ne laisse rien à moitié fait, et le double emprunt est refusé par un 409.

## ✅ Une solution simple
Endpoints emprunter/rendre qui fonctionnent, avec une vérification de disponibilité. Le cœur métier tourne.

## 🚀 Une solution améliorée
Mettre la règle dans le service (pas la route), rendre l'emprunt TRANSACTIONNEL (rollback prouvé par interruption simulée), mapper le conflit sur 409 (pas 400/500), et ramener livre + auteur par JOIN. Éventuellement ajouter une contrainte base en défense en profondeur contre les races.

## ⚠️ Erreurs probables et points à vérifier
- Emprunter un livre déjà emprunté (règle non vérifiée ou vérifiée hors transaction → race condition).
- Pas de transaction : une panne au milieu laisse un emprunt sans livre marqué indisponible (état incohérent).
- Mauvais statut : 400 ou 500 pour un double emprunt au lieu de 409 Conflict.
- Règle métier dans la route au lieu du service : intestable et dupliquée.

## 🔍 Comment vérifier ta solution
- Le double emprunt est refusé avec un 409 (testé).
- L'opération emprunt est transactionnelle (interruption simulée → rien n'est à moitié fait).
- La règle métier vit dans le service (vérifiable en lisant le code).
- Les JOIN ramènent les données liées (livre + auteur) en une requête.

## ❓ Réponses du mini-quiz
1. **Où doit vivre la règle « pas de double emprunt », et pourquoi ?**
   → Dans la couche SERVICE : elle y est testable en isolation, réutilisable, et permet de renvoyer le bon statut. Dans une route elle serait intestable et dupliquée ; dans la base seule, difficile à exprimer et à remonter au client.
2. **Pourquoi l'emprunt doit-il être une transaction ?**
   → C'est une opération multi-étapes (vérifier → créer l'emprunt → marquer indisponible) qui doit réussir ENTIÈREMENT ou pas du tout. Sans transaction, une panne au milieu laisse un état incohérent (emprunt créé mais livre encore disponible).
3. **Quel statut pour une tentative d'emprunt d'un livre déjà emprunté, et pourquoi ?**
   → 409 Conflict : la requête est bien formée (donc pas 400) et ce n'est pas un bug serveur (donc pas 500) — c'est un conflit avec l'état actuel de la ressource. Le client comprend que l'état ne permet pas l'action.
4. **À quoi sert un JOIN dans l'API ?**
   → À ramener les données liées en une seule requête (un livre AVEC le nom de son auteur), assemblées côté base où c'est efficace, plutôt que de forcer le client à faire plusieurs appels.

## 🎤 À savoir expliquer à l'oral
Structure autour du placement et de l'atomicité : « la règle métier vit dans le service, testable ; l'emprunt est une transaction, atomique ; le conflit renvoie 409 ». Explique le scénario d'incohérence sans transaction (emprunt créé mais livre encore disponible) et le rollback qui l'évite. Mentionner la contrainte base en défense en profondeur contre les races montre que tu penses au-delà du chemin heureux — le niveau attendu sur une opération critique.
