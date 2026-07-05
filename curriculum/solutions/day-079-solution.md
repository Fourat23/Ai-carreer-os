# Correction — Jour 79 : Observabilité : logs, métriques, traces

[← Retour au jour 79](../days/day-079.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Logs (événements), métriques (agrégats), traces (parcours d'une requête). Le correlation id relie tous les logs d'une même requête. On log assez pour débugger, jamais de secrets/données personnelles.

## ⚠️ Erreurs probables et points à vérifier
- Logs en texte non structuré (ingrep-able).
- Logger des secrets/mots de passe/tokens.

## 🧩 Questions de réflexion
- Peux-tu reconstituer ce qui s'est passé pour une requête donnée à partir des seuls logs ?
