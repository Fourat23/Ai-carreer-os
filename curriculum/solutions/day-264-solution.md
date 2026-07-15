# Correction — Jour 264 : Suite de tests adverses

[← Retour au jour 264](../days/day-264.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La suite adverse formalise chaque attaque du jour 260 en cas de test avec comportement attendu et vérification OBJECTIVE, intégré au harnais. Un test qui passe = attaque toujours neutralisée (inverse d'un test normal). Le rapport suit un score de sécurité à chaque changement, et la suite grandit avec la surface de menace connue — non-régression appliquée à la sécurité.

## ⚠️ Erreurs probables et points à vérifier
- Vérification subjective de la neutralisation : chaque cas a une fonction verif objective (marqueur qui fuit ? payload qui apparaît ?), pas un jugement humain.
- Suite figée une fois pour toutes : les attaquants innovent — chaque nouvelle attaque découverte devient un cas, la suite vit.
- Oublier les injections indirectes dans la suite (indexer le doc piégé avant le test) : c'est la famille critique, la plus facile à oublier d'automatiser.
- Ne pas suivre le score dans le temps : la sécurité doit être une métrique du rapport, sinon une régression passe inaperçue jusqu'à l'incident.

## 🔍 Comment vérifier ta solution
- 15 cas adverses couvrant les 4 familles (directe, indirecte, hors corpus, ancrage), chacun avec verif objective.
- Les injections indirectes indexent bien un doc piégé avant le test.
- `rag eval --adversarial` produit une section sécurité avec score par famille.
- L'attaque résiduelle du jour 261 est incluse comme cas connu (échoue, documenté).
- La suite est intégrée au harnais, pas un script à part.

## 🎤 À savoir expliquer à l'oral
Explique l'inversion de logique : « un test adverse qui PASSE signifie que l'attaque est toujours bloquée — c'est de la non-régression de sécurité ; ma suite tourne à chaque changement, et une amélioration innocente qui rouvre une injection est attrapée avant le déploiement ». Puis : « la suite grandit avec les attaques découvertes ». Sécurité comme processus continu = signal senior.
