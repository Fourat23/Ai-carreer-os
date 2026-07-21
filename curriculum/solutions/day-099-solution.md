# Correction — Jour 99 : Routing et navigation

[← Retour au jour 99](../days/day-099.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : déclarer les routes et naviguer avec Link. Solution améliorée : mettre l'état navigable dans l'URL (paramètres lus via useParams, ressource chargée à partir de l'URL avec l'id en dépendance d'effet), gérer le 404 par une route attrape-tout, utiliser Link (pas <a>) et la navigation programmatique (useNavigate) après une action. La preuve : copier l'URL d'une fiche et l'ouvrir dans un onglet neuf reconstruit exactement la même vue.

## ⚠️ Erreurs probables et points à vérifier
- <a href> au lieu de <Link> : recharge la page et perd tout le state de l'app.
- Garder l'id de la ressource dans un state interne au lieu de l'URL : la vue n'est ni partageable ni rechargeable.
- Oublier la route attrape-tout : une URL inconnue affiche un écran blanc au lieu d'un 404 propre.
- Ne pas mettre le paramètre d'URL dans les dépendances de l'effet : changer d'id ne recharge pas la bonne ressource.

## 🔍 Comment vérifier ta solution
- Chaque vue navigable a sa propre URL.
- Les paramètres d'URL sont lus via useParams et pilotent le chargement.
- La navigation utilise <Link> / useNavigate, pas <a href>.
- Une route attrape-tout affiche un 404 propre.
- Ouvrir l'URL d'une fiche dans un onglet neuf reconstruit la même vue.

## 🎤 À savoir expliquer à l'oral
Pose le principe : « l'URL est un état partageable ; le routing la mappe à la vue ». Donne le test décisif — copier l'URL dans un onglet neuf doit retomber sur la même fiche. Mentionne le piège du <a> qui recharge et la route 404 attrape-tout. Relie au design d'API (une ressource, une adresse) pour montrer une cohérence d'architecture.
