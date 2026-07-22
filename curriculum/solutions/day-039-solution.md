# Correction — Jour 39 : Design patterns pratiques : ceux que tu utilises déjà

[← Retour au jour 39](../days/day-039.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Traiter les patterns comme un vocabulaire : pour chacun, partir du PROBLÈME récurrent, montrer la solution EN CONTEXTE de son propre code (Strategy = tarifs jour 5, Factory = créer le bon Notifieur, Adapter = uniformiser deux API, Observer = événements DOM, Singleton = connexion DB), et énoncer en une phrase ce qu'il résout. La preuve de compréhension : retrouver un pattern déjà réinventé dans le code du mois 1, et savoir dire quand NE PAS en mettre.

## ✅ Une solution simple
Implémenter les 5 patterns avec des exemples (même jouets) et une phrase de description chacun. Montre qu'on connaît les noms.

## 🚀 Une solution améliorée
Ancrer chaque pattern dans SON PROPRE code (pas des exemples copiés) : Strategy sur les tarifs réels, Factory sur les Notifieur du jour 38, Adapter sur un module d'API existant. Nommer un pattern qu'on avait réinventé sans le savoir (creerValidateur = Strategy + Factory). Et ajouter une note sur la sur-ingénierie : un cas où l'on choisit délibérément de NE PAS appliquer de pattern.

## ⚠️ Erreurs probables et points à vérifier
- Appliquer un pattern sans le problème correspondant : sur-ingénierie, l'anti-pattern principal.
- Abuser du Singleton comme accès global pratique : couplage et tests difficiles.
- Copier des exemples jouets déconnectés de son code, sans identifier le problème réel résolu.
- Croire qu'il faut mémoriser tous les patterns : l'important est de reconnaître le problème et de nommer la solution.

## 🔍 Comment vérifier ta solution
- Les 5 patterns sont implémentés EN CONTEXTE du propre code (pas des exemples génériques).
- Pour chaque pattern, le problème résolu est écrit en une phrase.
- Au moins un pattern est retrouvé dans le code du mois 1 et nommé.
- Un cas de sur-ingénierie évitée (où l'on choisit de ne pas mettre de pattern) est identifié.

## ❓ Réponses du mini-quiz
1. **Qu'est-ce qu'un design pattern, fondamentalement ?**
   → Un NOM donné à une solution récurrente à un problème de conception — un vocabulaire partagé entre ingénieurs, pas une bibliothèque ni une obligation d'usage.
2. **Quel problème résout le pattern Strategy ?**
   → Faire varier un comportement (calcul, tri, tarif) sans modifier l'appelant : on INJECTE la stratégie en paramètre. Ajouter une variante = une fonction de plus, appelant intact (open/closed).
3. **Pourquoi le Singleton est-il à manier avec précaution ?**
   → C'est un état global déguisé : il couple tout le code à une instance unique et complique les tests (on ne peut pas isoler ni remplacer facilement l'instance).
4. **Quel est l'anti-pattern principal autour des design patterns ?**
   → La sur-ingénierie : appliquer un pattern SANS avoir le problème qu'il résout. Le vrai savoir-faire inclut de savoir NE PAS appliquer un pattern.

## 🎤 À savoir expliquer à l'oral
Pose le cadre : « un pattern est un nom sur une solution récurrente, un outil de communication — pas une obligation ». Illustre avec Strategy sur ton propre calcul de tarif (« je l'utilisais déjà via les fonctions d'ordre supérieur »). Puis démarque-toi par la maturité : « le vrai savoir-faire, c'est aussi de NE PAS appliquer un pattern quand le problème n'existe pas — la sur-ingénierie est un anti-pattern ». Cette retenue rassure plus qu'un catalogue récité.
