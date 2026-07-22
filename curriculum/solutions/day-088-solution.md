# Correction — Jour 88 : Le front consomme l'API : fetch et états async

[← Retour au jour 88](../days/day-088.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Brancher le front sur l'API en gérant explicitement les TROIS états async (loading, error, data) et en centralisant tous les appels dans un module api.ts unique et typé (l'Adapter, gestion d'erreur commune, types partagés). useEffect synchronise avec l'API après le rendu, avec les bonnes dépendances. La preuve : les 3 états sont rendus, l'erreur réseau est affichée (testé serveur éteint), et zéro fetch hors du module api.

## ✅ Une solution simple
Un fetch dans useEffect qui affiche la liste. Les données arrivent.

## 🚀 Une solution améliorée
Gérer EXPLICITEMENT les trois états (loading, error, data) avec un affichage pour chacun, centraliser TOUS les appels dans un module api.ts typé (gestion d'erreur commune), AFFICHER l'erreur réseau à l'utilisateur (testé serveur éteint) avec possibilité de réessayer, et comprendre le double montage du StrictMode. Renseigner correctement les dépendances de useEffect.

## ⚠️ Erreurs probables et points à vérifier
- États async oubliés : UI figée sur réseau lent (pas de loading) ou page blanche sur erreur (pas d'error).
- fetch dupliqué hors du module api : gestion d'erreur incohérente, types non partagés.
- Erreur réseau avalée (catch vide) au lieu d'être affichée à l'utilisateur.
- Tableau de dépendances de useEffect mal renseigné : effet qui ne se rejoue pas quand il faut, ou qui boucle.

## 🔍 Comment vérifier ta solution
- Liste des livres avec les 3 états async explicitement rendus (loading, error, data).
- Tous les appels passent par api.ts typé (zéro fetch hors module).
- Le formulaire d'ajout fonctionne et l'erreur réseau est AFFICHÉE à l'utilisateur (testé serveur éteint).
- Les dépendances de useEffect sont correctes (fetch au bon moment).

## ❓ Réponses du mini-quiz
1. **À quoi sert `useEffect` et quand s'exécute-t-il ?**
   → Il SYNCHRONISE le composant avec l'extérieur (fetch, abonnement) : il s'exécute APRÈS le rendu et se rejoue selon son tableau de dépendances (`[]` = une fois au montage ; `[id]` = quand id change).
2. **Quels sont les trois états d'un fetch, et que se passe-t-il si on en oublie ?**
   → Loading, error, data — l'UI doit décrire les trois. Oublier loading fige l'UI sans retour ; oublier error donne une page blanche sur réseau lent ou serveur éteint.
3. **Pourquoi centraliser les appels dans un module api.ts unique ?**
   → Pour une gestion d'erreur COMMUNE (un seul endroit), des TYPES partagés (front et API parlent le même contrat), et un point unique à changer (URL de base). C'est l'Adapter : une interface uniforme devant les détails du réseau.
4. **Pourquoi React monte-t-il un composant deux fois en StrictMode (dev) ?**
   → Pour détecter les effets mal écrits : si l'effet casse au double appel, c'est qu'il lui manque un cleanup ou qu'il n'est pas idempotent. C'est une feature de détection, pas un bug.

## 🎤 À savoir expliquer à l'oral
Explique le rôle de useEffect (« synchroniser avec l'extérieur, après le rendu, selon les dépendances ») et martèle le contrat des 3 états : « loading, error, data — je décris les trois, sinon pages blanches et spinners éternels ». Justifie le module api.ts unique comme l'Adapter (gestion d'erreur commune, types partagés). Mentionner le double montage du StrictMode comme feature de détection montre que tu comprends React en profondeur, pas juste que tu copies un fetch.
