# Semaine 9 — HTTP en profondeur, réseau de base, Postman, JSON

> **Mois 3** · Compétences : HTTP / API, Git / Linux

[← Mois 3](month-03.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 57](days/day-057.md)
- [Jour 58](days/day-058.md)
- [Jour 59](days/day-059.md)
- [Jour 60](days/day-060.md)
- [Jour 61](days/day-061.md)
- [Jour 62](days/day-062.md)
- [Jour 63](days/day-063.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Tu connais Postman en surface : cette semaine tu comprends ce qui circule VRAIMENT : requêtes, réponses, headers, statuts, DNS.
- **Test pratique :** 60 min : avec curl uniquement — GET une API publique, POST du JSON, afficher les headers, suivre une redirection, expliquer chaque statut reçu. Puis rejouer le tout dans Postman avec une collection propre.
- **Test théorique :** Décris le trajet complet d'une requête HTTP (DNS → TCP → requête → réponse) ; 8 statuts à connaître (200/201/204/301/400/401/404/500) avec cas d'usage ; 5 headers courants ; différence HTTP/HTTPS.
- **Mini-projet :** Collection Postman 'exploration' : 10 requêtes documentées sur une API publique (ex: restcountries), avec variables d'environnement et 3 tests automatiques.
- **Critères de passage :**
  - [ ] Test curl réussi sans notes
  - [ ] 8/8 statuts expliqués
  - [ ] Collection exportée et versionnée dans Git
- **Exercice d'architecture :** Schéma : que se passe-t-il entre ton navigateur et 'api.example.com' quand tu appelles GET /users/42 ? Place DNS, TCP, TLS, serveur, base de données. Légende obligatoire.
