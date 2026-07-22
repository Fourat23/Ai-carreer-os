# Correction — Jour 79 : Observabilité : logs, métriques, traces

[← Retour au jour 79](../days/day-079.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Rendre l'application observable : logs STRUCTURÉS (JSON, interrogeables) avec niveaux, un CORRELATION ID généré par requête et propagé dans tous ses logs (pour reconstituer une requête), et des métriques simples (compteur, latences). Ne jamais logger de secrets ni de données personnelles. La preuve : on peut reconstituer une session complète à partir des seuls logs, en filtrant sur un requestId.

## ✅ Une solution simple
Ajouter des logs et un endpoint de métriques. On a un peu de visibilité.

## 🚀 Une solution améliorée
Logger en JSON structuré avec niveaux, générer un correlation id par requête et le propager dans TOUS ses logs (reconstituer une requête complète), exposer des métriques simples (compteur de requêtes, latences), et RELIRE les logs pour garantir qu'aucun secret ni donnée personnelle n'y figure. Prouver qu'on reconstitue une session depuis les seuls logs.

## ⚠️ Erreurs probables et points à vérifier
- Logs en texte libre non structuré : ingrepables à grande échelle, il faut des yeux humains.
- Logger des secrets/mots de passe/tokens ou des données personnelles : fuite et non-conformité RGPD.
- Pas de correlation id : impossible de reconstituer une requête au milieu de milliers d'autres.
- Trop de logs sans niveaux : le bruit noie l'essentiel et coûte en stockage.

## 🔍 Comment vérifier ta solution
- Logs JSON structurés avec niveaux et correlation id sur chaque requête.
- Une session complète reconstituée à partir des seuls logs (preuve).
- Relecture : aucun secret ni donnée sensible dans les logs.
- Des métriques simples (compteur de requêtes, latences) sont exposées.

## ❓ Réponses du mini-quiz
1. **À quelle question l'observabilité répond-elle, et quels sont ses trois piliers ?**
   → « Que s'est-il passé en production ? » Trois piliers : les logs (événements horodatés), les métriques (agrégats : combien, à quelle vitesse), les traces (parcours d'une requête à travers le système).
2. **Pourquoi les logs structurés (JSON) valent-ils mieux que le texte libre ?**
   → Ils sont INTERROGEABLES mécaniquement : filtrer par niveau, par requestId, agréger par champ. À l'échelle de milliers de requêtes, seul le structuré permet de retrouver l'information ; le texte libre exige des yeux humains.
3. **À quoi sert un correlation id ?**
   → C'est un identifiant unique généré à l'entrée de chaque requête et propagé dans tous ses logs : il permet de reconstituer tout ce qui s'est passé pour UNE requête précise, même au milieu de milliers d'autres entrelacées.
4. **Que ne doit-on JAMAIS logger ?**
   → Des secrets (tokens, mots de passe) ni des données personnelles sensibles : les logs sont stockés, consultés, parfois exfiltrés — un secret dans un log est un secret fuité, et c'est aussi un risque de conformité (RGPD).

## 🎤 À savoir expliquer à l'oral
Pose la question centrale : « l'observabilité répond à 'que s'est-il passé en prod ?' — sans elle, je suis aveugle ». Décris les trois piliers (logs = détail, métriques = tendance, traces = parcours), insiste sur les logs structurés interrogeables et le correlation id qui reconstitue une requête. Terminer par la règle « jamais de secrets ni de données personnelles dans les logs » montre que tu penses sécurité et conformité, pas seulement débogage.
