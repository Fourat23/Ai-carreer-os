<!-- keep -->
# Leçon — Observabilité et logs structurés

## 🌍 Le problème d'abord
Un utilisateur signale : « votre appli a planté hier soir vers 22 h ». Tu ouvres ton code… et tu n'as AUCUNE idée de ce qui s'est passé : pas de trace, pas d'événement enregistré, rien à rejouer. Tu devines, tu tâtonnes, tu ne reproduis pas. Un système qu'on ne peut pas OBSERVER est une boîte noire indéfendable — et c'est encore pire pour un système IA non déterministe. Il te faut des enregistrements exploitables : des logs structurés, des niveaux, un identifiant pour suivre une requête de bout en bout. Cette leçon t'apprend à rendre un système observable, et surtout ce qu'il ne faut JAMAIS enregistrer.

## 🎯 Objectif
Rendre un système OBSERVABLE : savoir ce qui s'est passé en production sans deviner. Maîtriser les logs structurés, les niveaux, le correlation id, et savoir quoi ne JAMAIS logger. Sans observabilité, tout système (surtout IA) est une boîte noire indéfendable.

## 🧩 Prérequis
Tu dois comprendre le cycle de vie d'une requête (entrée, traitement, réponse) vu en HTTP (`/doc/lessons/http-rest-json`) et la gestion d'erreurs (`/doc/lessons/error-handling`), car on enregistre justement erreurs et événements. La notion de donnée sensible/secret (`/doc/lessons/deployment-secrets`) éclaire ce qu'il ne faut jamais logger. Aucun outil d'observabilité particulier n'est supposé.

## 🧠 Modèle mental
L'observabilité, c'est **la boîte noire d'un avion** : quand quelque chose se passe (crash, lenteur, réponse étrange), tu peux REJOUER le film. Trois instruments : les **logs** (les événements), les **métriques** (les agrégats), les **traces** (le parcours d'UNE requête).

## 📖 Explication complète
- **Logs structurés** : du JSON (`{"ts":"…","level":"info","msg":"…","requestId":"…"}`), pas du texte libre. Un log JSON s'interroge mécaniquement (« toutes les erreurs de cette requête ») ; un log texte exige des yeux humains.
- **Niveaux** : `debug` (détail dev), `info` (événements normaux), `warn` (anormal mais géré), `error` (échec). Filtrer par niveau permet de monter/baisser le volume sans redéployer.
- **Correlation id** : un identifiant unique généré à l'ENTRÉE de chaque requête et propagé dans TOUS les logs qu'elle traverse. C'est lui qui relie « la question de l'utilisateur » à « l'appel LLM » à « l'erreur de parsing » — sans lui, impossible de reconstituer une session.
- **Ce qu'on ne logge jamais** : mots de passe, tokens, données personnelles sensibles, prompts contenant des données privées. Un log est une base de données que tout le monde lit.
- **Métriques** : compteurs et latences agrégés (requêtes/min, p95). Les logs disent « quoi », les métriques disent « combien et à quelle vitesse ».

**Comment le correlation id se propage réellement**, parce que « propagé dans tous les logs » cache la seule difficulté du sujet. À l'intérieur d'un service, il faut que chaque fonction qui logue puisse y accéder — soit on le passe en paramètre partout, ce qui pollue toutes les signatures, soit on l'attache à un contexte lié à la requête (`AsyncLocalStorage` en Node) que le logger consulte tout seul. Entre services, il ne se propage pas par magie : **le service appelant doit le mettre dans un en-tête HTTP** (`X-Request-Id` ou le standard `traceparent`), et le service appelé doit le lire au lieu d'en générer un nouveau. Un seul maillon qui oublie de transmettre, et la chaîne se casse en deux à cet endroit précis — sans erreur, sans alerte, juste une enquête qui s'arrête net le jour où on en a besoin.

**Le volume est un vrai problème, et l'ignorer coûte cher.** À quelques milliers de requêtes par seconde, tout journaliser en `info` produit des téraoctets et une facture supérieure à celle du service lui-même. Trois leviers, dans cet ordre : **le niveau** (`info` en production, `debug` activable temporairement), **l'échantillonnage** (journaliser 1 % des requêtes réussies, mais **100 % des erreurs** — les échecs sont rares et c'est eux qu'on relit), et la **rétention** (garder 7 jours en accès rapide, archiver le reste). Le principe qui guide : on journalise ce qu'on relira, avec la certitude de garder ce qui est rare et grave.

## 🔧 Exemple simple
```json
{"ts":"2026-07-05T10:12:03Z","level":"error","requestId":"a1b2","msg":"parse LLM output failed","attempt":2}
```
Une ligne : quand, quoi, pour quelle requête, à quelle tentative.

## 🧭 Exemple guidé
**Énoncé** : ajouter un correlation id à une API Express.
**Raisonnement** : le générer au premier middleware, le porter dans `req`, l'inclure dans chaque log.
**Solution** :
```js
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  log('info', { requestId: req.id, msg: `${req.method} ${req.path}` });
  next();
});
function log(level, fields) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, ...fields }));
}
```
**Explication** : chaque log de la requête inclut `req.id` ; `grep a1b2` reconstitue toute la session. **Variante** : ajoute la durée (mesurée au `res.on('finish')`).

## 🤖 Exemple appliqué (IA / data / architecture)
Dans DocSense, chaque question loggue : requestId, question (si non sensible), chunks retenus (ids), tokens entrée/sortie, coût, latence par étage, verdict de validation. Résultat : « pourquoi cette réponse étrange hier à 15 h ? » se répond en rejouant les logs — c'est aussi la matière première du dashboard qualité.

## ⚠️ Erreurs fréquentes
- Logs texte libre non interrogeables.
- Pas de correlation id → impossible de suivre une requête.
- Logger des secrets ou des données personnelles.
- Tout en `info` (bruit) ou rien du tout (silence).

## 🚫 Anti-patterns
- Le `console.log("ici 2")` de debug laissé en prod.
- Logger tellement que plus personne ne lit (bruit = cécité).

## ✍️ Mini-exercice
Ajoute des logs JSON avec correlation id à une de tes APIs, puis reconstitue une session complète avec un seul grep.

## 🔥 Exercice plus difficile
Ajoute des métriques (compteur de requêtes, latence p95 par endpoint) exposées sur un endpoint `/metrics`, et détecte un endpoint lent par les chiffres.

## ✅ Correction attendue
La logique : JSON + niveaux + correlation id propagé + zéro secret. Vérifie : une session entière se reconstitue par son id ; les erreurs contiennent le contexte utile (pas la stack au client !) ; une relecture ne trouve aucun secret/PII.

## 🎤 Questions d'entretien
- « Logs, métriques, traces : quelle différence ? » → Événements / agrégats / parcours d'une requête.
- « Qu'est-ce qu'un correlation id ? » → Un id unique par requête, propagé partout, qui relie tous ses logs.
- « Que ne faut-il jamais logger ? » → Secrets, tokens, données personnelles.

## 🧾 À retenir
- Logs structurés JSON + niveaux + correlation id = sessions rejouables.
- Les métriques agrègent ; les logs détaillent ; les traces relient.
- Jamais de secrets/PII dans les logs.

## 📚 Vocabulaire
**log structuré** · **niveau (debug/info/warn/error)** · **correlation id** · **métrique / p95** · **trace** · **rétention** · **PII**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Mes APIs loggent en JSON avec correlation id.
- [ ] Je peux reconstituer une session complète depuis les logs.
- [ ] Aucun secret/PII dans mes logs (vérifié).

## 🔗 Liens avec le programme
Mois 10-12 (jours ~280, 300-330), projet final. Leçons liées : `monitoring-production`, `llm-observability`, `architecture-basics`.
