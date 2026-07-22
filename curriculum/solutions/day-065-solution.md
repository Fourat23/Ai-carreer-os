# Correction — Jour 65 : Projet 2 — LivreAPI : tests d'intégration

[← Retour au jour 65](../days/day-065.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Écrire des tests d'intégration qui envoient de vraies requêtes HTTP et vérifient réponse ET état de la base, sur une base de TEST isolée et réinitialisée. Cibler les règles métier (double emprunt → 409) et les cas d'erreur (404, 400), pas seulement les chemins heureux. La preuve : la suite passe deux fois de suite sans nettoyage manuel (rejouable, indépendante de l'ordre).

## ✅ Une solution simple
Quelques tests qui appellent les endpoints et vérifient le statut. On couvre les cas principaux.

## 🚀 Une solution améliorée
Utiliser une base de TEST isolée réinitialisée avant chaque suite, vérifier la réponse ET l'état de la base, couvrir les règles d'emprunt (dont le 409) et les cas d'erreur (404, 400), et garantir que les tests passent deux fois de suite sans nettoyage manuel. Distinguer explicitement des tests unitaires du Projet 1.

## ⚠️ Erreurs probables et points à vérifier
- Tester sur la base de dev : pollution et destruction de données réelles.
- Ne tester que les chemins heureux : les bugs se cachent dans les règles métier et les cas d'erreur.
- Tests dépendants de l'ordre ou d'un état laissé par un autre : faux positifs, flakiness.
- Vérifier seulement la réponse HTTP sans l'état de la base : on rate une transaction non appliquée.

## 🔍 Comment vérifier ta solution
- Suite d'intégration verte sur base de test isolée et réinitialisée.
- Les règles d'emprunt testées (dont le 409).
- Les tests passent deux fois de suite sans nettoyage manuel (rejouables).
- Réponse ET état de la base vérifiés sur au moins un test.

## ❓ Réponses du mini-quiz
1. **Qu'est-ce qu'un test d'intégration vérifie, par rapport à un test unitaire ?**
   → Le système ASSEMBLÉ : une vraie requête HTTP traverse routes → services → base, et on vérifie réponse ET état de la base. L'unitaire isole une fonction ; l'intégration attrape les bugs de câblage (mauvaise route/colonne, transaction oubliée).
2. **Pourquoi une base de test isolée et réinitialisée est-elle obligatoire ?**
   → Pour ne jamais polluer/détruire la base de dev, et pour rendre les tests rejouables à l'infini et indépendants de l'ordre : une base réinitialisée garantit un état de départ connu.
3. **Que teste-t-on en priorité dans une API ?**
   → Les RÈGLES MÉTIER (le double emprunt → 409) et les cas d'erreur (404, 400), pas seulement les chemins heureux — c'est là que se cachent les bugs qui comptent.
4. **Pourquoi la pyramide des tests recommande-t-elle plus d'unitaires que d'intégration ?**
   → Les tests d'intégration sont plus lents et plus fragiles (base, montage) ; les unitaires sont rapides et localisent précisément. Beaucoup d'unitaires pour la logique, moins d'intégration pour les parcours critiques.

## 🎤 À savoir expliquer à l'oral
Oppose les deux niveaux : « l'unitaire isole la logique et localise ; l'intégration assemble et attrape le câblage — route, colonne, transaction ». Insiste sur la base de test isolée et réinitialisée (rejouable, indépendante de l'ordre) et sur le ciblage des règles métier (double emprunt → 409) et cas d'erreur. Mentionner la pyramide des tests et l'exécution en CI montre que tu situes les tests dans une vraie pratique d'équipe.
