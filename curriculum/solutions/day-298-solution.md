# Correction — Jour 298 : Sécurité des secrets

[← Retour au jour 298](../days/day-298.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : mettre les secrets en .env et .gitignore. Solution améliorée : auditer code ET historique git (un secret committé reste compromis même après suppression → RÉVOQUER, pas juste supprimer), centraliser (une source par secret pour la rotation), séparer par environnement (dev/staging/prod), et détecter (scan, hook pre-commit, surveillance de consommation des clés LLM). La règle absolue : jamais dans git ; la réaction à une fuite : révoquer et régénérer.

## ⚠️ Erreurs probables et points à vérifier
- Croire qu'un secret supprimé du code est sûr : il reste dans l'historique git — il faut le RÉVOQUER, la suppression ne l'efface pas.
- Secrets dispersés dans plusieurs fichiers : la rotation d'urgence devient impossible — centraliser (une source par secret).
- Même clé pour dev et prod : une fuite en dev compromet la prod — séparer par environnement.
- Ignorer la surveillance de consommation des clés LLM : une clé fuitée peut générer des milliers d'euros avant détection — surveiller les hausses anormales.

## 🔍 Comment vérifier ta solution
- Le code ET l'historique git sont scannés pour les secrets.
- Toute clé trouvée dans git est RÉVOQUÉE et régénérée (pas juste supprimée).
- Les .gitignore excluent les fichiers de secrets partout.
- Les secrets sont centralisés (rotation = un seul endroit) et séparés par environnement.
- Une détection automatique (hook pre-commit) ou une surveillance de consommation est en place (variante).

## 🎤 À savoir expliquer à l'oral
Insiste sur la réaction correcte à une fuite : « un secret committé, même supprimé depuis, est compromis — git a une mémoire ; je le RÉVOQUE et j'en génère un nouveau, je ne me contente pas de le supprimer ». Puis l'enjeu IA : « une clé LLM a une valeur monétaire directe — une fuite, c'est des milliers d'euros d'appels frauduleux ». Connaître la bonne réaction (révoquer) et l'enjeu financier signale une vraie rigueur sécurité.
