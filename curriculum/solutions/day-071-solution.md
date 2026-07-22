# Correction — Jour 71 : Réseau et web : DNS, TCP, TLS, HTTP/2 (culture solide)

[← Retour au jour 71](../days/day-071.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Tracer le trajet réseau complet avec de vrais outils (dig pour le DNS, curl -v pour TCP/TLS/HTTP) et le documenter par un schéma légendé DNS → TCP → TLS → HTTP. Comprendre TLS (confidentialité + intégrité, authentifie le serveur), la distinction latence (aller-retour, distance) vs bande passante (débit), et ce que HTTPS ne cache pas (le domaine). La preuve : savoir raconter « que se passe-t-il quand on tape une URL » en 3-5 minutes sans hésiter.

## ✅ Une solution simple
Décrire les 4 étapes (DNS, TCP, TLS, HTTP) et faire un schéma. La pile est comprise.

## 🚀 Une solution améliorée
Tracer réellement le trajet avec dig et curl -v (montrer chaque étape), légender un schéma correct, distinguer latence et bande passante (et pourquoi HTTP/2 réduit les allers-retours), et expliquer précisément ce que TLS protège (confidentialité, intégrité, identité du serveur) et ne protège pas (disponibilité, domaine visible via SNI/DNS). Enregistrer une réponse orale de 3-5 min.

## ⚠️ Erreurs probables et points à vérifier
- Confondre chiffrement (TLS) et authentification applicative : TLS authentifie le serveur, pas l'utilisateur.
- Croire que HTTPS cache l'existence de la requête : le domaine fuite via SNI et DNS.
- Confondre latence (aller-retour, distance) et bande passante (débit) : on optimise alors au mauvais endroit.
- Réciter les couches sans savoir ce que chacune résout ni raconter le trajet de bout en bout.

## 🔍 Comment vérifier ta solution
- Le trajet complet tracé avec de vrais outils (dig, curl -v) et documenté.
- Schéma légendé DNS → TCP → TLS → HTTP correct.
- Réponse orale de 3-5 min à « que se passe-t-il quand on tape une URL » (enregistrée).
- Distinction latence/bande passante et ce que HTTPS protège/ne protège pas, expliquées.

## ❓ Réponses du mini-quiz
1. **Quelles sont les 4 couches sous une requête web et leur rôle ?**
   → DNS (traduit le nom en adresse IP), TCP (connexion fiable, retransmission des paquets perdus), TLS (chiffre le canal — confidentialité + intégrité), HTTP (transporte la requête applicative). HTTPS = HTTP dans TLS.
2. **Quelle est la différence entre latence et bande passante ?**
   → La latence est le temps d'un aller-retour, incompressible car dictée par la distance ; la bande passante est le débit. Beaucoup de lenteurs viennent du NOMBRE d'allers-retours (latence), pas du débit.
3. **Que protège HTTPS, et que ne protège-t-il pas ?**
   → Il protège la confidentialité (personne ne lit) et l'intégrité (personne ne modifie), et prouve l'identité du serveur via son certificat. Il ne protège pas la disponibilité, et ne cache pas le domaine (visible via DNS et SNI).
4. **Pourquoi HTTP/2 et la réutilisation de connexions améliorent-ils les performances ?**
   → Ils réduisent le NOMBRE d'allers-retours : chaque nouvelle connexion coûte DNS + handshake TCP + handshake TLS avant le premier octet utile. Multiplexer plusieurs requêtes sur une connexion économise ces allers-retours.

## 🎤 À savoir expliquer à l'oral
Déroule la pile dans l'ordre (DNS → TCP → TLS → HTTP) en disant ce que chaque couche RÉSOUT. Insiste sur la latence (allers-retours, incompressible) vs bande passante, et sur ce que TLS protège (confidentialité, intégrité, identité serveur) et ne cache pas (le domaine, via SNI/DNS). Savoir raconter ce trajet de bout en bout, avec ces nuances, en 3-5 minutes, est exactement ce qui impressionne en entretien système.
