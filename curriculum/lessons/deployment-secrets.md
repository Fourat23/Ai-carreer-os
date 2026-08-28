<!-- keep -->
# Leçon — Secrets, environnements et déploiement

## 🌍 Le problème d'abord
Un développeur commit par mégarde une clé d'API dans le dépôt. Quelques heures plus tard, la clé est aspirée par un robot qui scanne GitHub, et la facture cloud explose — ou pire, des données fuient. Un secret commis une seule fois est compromis POUR TOUJOURS, même supprimé ensuite (il reste dans l'historique). Le problème de fond : le code est fait pour être PARTAGÉ, les secrets pour rester PRIVÉS — ils ne doivent jamais voyager ensemble. Cette leçon t'apprend à gérer secrets et configuration proprement (hors du code, par environnement) et à déployer sans fuiter — l'erreur qui coûte le plus cher évitée.

## 🎯 Objectif
Gérer les secrets (clés d'API, mots de passe) et la configuration proprement : hors du code, par environnement, jamais dans Git. Savoir déployer une application simple sans fuiter. Un secret commis une fois est compromis pour toujours — cette leçon évite l'erreur qui coûte le plus cher.

## 🧩 Prérequis
Tu dois comprendre le fonctionnement de Git et le fait que l'historique conserve TOUT (`/doc/lessons/git-fundamentals`), ainsi que les bases de la sécurité applicative et du moindre privilège (`/doc/lessons/authentication`). Savoir qu'une application se configure différemment selon l'environnement (dev/test/prod) aide. Aucune plateforme de déploiement particulière n'est supposée.

## 🧠 Modèle mental
Le code est **PUBLIC par défaut** (partagé, commité, copié) ; les secrets sont **PRIVÉS par nature**. Ils ne doivent jamais voyager ensemble. La configuration, c'est **ce qui change entre les environnements** (dev/test/prod) sans que le code change : elle vit dans l'ENVIRONNEMENT, pas dans le code.

## 📖 Explication complète
- **Variables d'environnement** : le canal standard. Le code lit `process.env.API_KEY` ; la valeur est fournie au lancement (fichier `.env` en local, secrets du CI/hébergeur ailleurs). Le `.env` est dans `.gitignore` ; un `.env.example` (committé, SANS valeurs) documente les variables attendues.
- **Pourquoi jamais dans Git** : l'historique n'oublie rien. Un secret commité puis « supprimé » reste dans l'historique — il est compromis, il faut le RÉVOQUER (pas juste l'effacer). Audit : chercher dans tout l'historique avant de rendre un repo public.
- **Par environnement** : dev (clés de test, base locale), prod (clés réelles). Même code, config différente — c'est ce qui rend le déploiement sûr et répétable.
- **Le circuit d'un secret** : créé chez le fournisseur → stocké dans le gestionnaire (env local, secrets GitHub Actions, vault) → injecté au run → JAMAIS loggé, JAMAIS renvoyé au client, JAMAIS dans une image Docker.
- **Déployer simple** : pour un projet local/perso, « déployer » = une machine qui a Docker + les variables d'env + `docker compose up`. Les plateformes managées automatisent ce circuit, mais le principe est identique.

**Une variable d'environnement n'est PAS un coffre-fort**, et c'est la nuance qui manque à la plupart des explications. C'est le canal standard parce qu'il sépare la configuration du code — ce qui est déjà l'essentiel — mais sa valeur reste largement visible : elle apparaît dans la liste des processus sur certains systèmes, elle est héritée par tous les sous-processus lancés par l'application, elle finit dans un vidage mémoire après un plantage, et un `console.log(process.env)` posé pour déboguer l'écrit intégralement dans les journaux. Les fuites réelles passent bien plus souvent par là que par un dépôt Git.

Les conséquences pratiques sont simples et se tiennent : ne jamais journaliser l'environnement en bloc, ne jamais renvoyer un message d'erreur qui contienne une valeur de configuration, et sur un projet sérieux, faire lire le secret **au démarrage** par un gestionnaire dédié plutôt que de le laisser dans l'environnement du processus toute sa vie.

**La rotation est la partie que tout le monde saute.** Un secret n'est pas un objet permanent : il doit pouvoir être remplacé sans interruption de service, et c'est ce qui rend un incident supportable. La conception qui le permet tient en une phrase — **le système doit accepter deux secrets valides à la fois** pendant la transition : on ajoute le nouveau, on redéploie, on vérifie que tout fonctionne, puis seulement on révoque l'ancien. Une architecture qui n'accepte qu'un seul secret transforme chaque rotation en coupure, ce qui garantit qu'on ne fera jamais de rotation — et donc qu'un secret compromis le restera. C'est aussi ce qui permet de répondre « en dix minutes » plutôt que « il faut qu'on voie » le jour où une clé fuite.

## 🔧 Exemple simple
```bash
# .env (gitignoré)          # .env.example (committé)
ANTHROPIC_API_KEY=sk-...    ANTHROPIC_API_KEY=
DB_PATH=./data/app.db       DB_PATH=
```
Le code : `const key = process.env.ANTHROPIC_API_KEY; if (!key) throw new Error("ANTHROPIC_API_KEY manquante");`

## 🧭 Exemple guidé
**Énoncé** : tu viens de committer une clé API par erreur. Que faire ?
**Raisonnement** : l'historique est compromis ; supprimer le fichier ne suffit PAS.
**Solution** :
```
1. RÉVOQUER la clé chez le fournisseur (immédiat — c'est l'étape qui compte).
2. En générer une nouvelle, la mettre dans .env (gitignoré).
3. Nettoyer l'historique si le repo est partagé (filter-repo) — mais considère
   la clé brûlée quoi qu'il arrive.
4. Ajouter .env au .gitignore + un check pre-commit si possible.
```
**Explication** : la révocation prime — quiconque a cloné/vu le repo a la clé. **Variante** : audite un de tes repos avec `git log -p | grep -i "api_key\|secret"` avant de le rendre public.

## 🤖 Exemple appliqué (IA / data / architecture)
Tes apps LLM vivent de clés d'API : la clé Anthropic de DocSense passe par `ANTHROPIC_API_KEY`, injectée par `docker run -e` ou les secrets de la CI — jamais dans l'image ni le code. La CI a SES propres secrets (GitHub Actions → Settings/Secrets) masqués dans les logs.

## ⚠️ Erreurs fréquentes
- Committer `.env` (vérifier le `.gitignore` AVANT le premier commit).
- Secret « supprimé » du dernier commit mais présent dans l'historique.
- Clé loggée (dans un message d'erreur, un debug).
- Même clé partout (dev = prod) : impossible de révoquer sans tout casser.

## 🚫 Anti-patterns
- `config.js` committé avec les vraies valeurs « temporairement ».
- Envoyer un secret par chat/mail « juste cette fois ».

## ✍️ Mini-exercice
Mets en place `.env` + `.env.example` + validation au démarrage (« variable manquante → message clair, exit 1 ») sur un de tes projets.

## 🔥 Exercice plus difficile
Audite l'historique complet de tes repos (`git log -p | grep -iE "key|secret|password"`), configure un secret GitHub Actions et utilise-le dans la CI sans qu'il apparaisse dans les logs.

## ✅ Correction attendue
La logique : secrets dans l'environnement, documentés par `.env.example`, validés au démarrage, distincts par environnement, révoqués si exposés. Vérifie : `git log -p` ne contient aucun secret ; l'app refuse de démarrer proprement sans ses variables ; l'image Docker n'embarque rien.

## 🎤 Questions d'entretien
- « Où mets-tu tes clés d'API ? » → Variables d'environnement, `.env` gitignoré, `.env.example` committé, secrets CI côté pipeline.
- « Tu as commité un secret, que fais-tu ? » → Révoquer d'abord, regénérer, nettoyer, prévenir la récidive.
- « Pourquoi des clés différentes par environnement ? » → Limiter le rayon d'explosion et pouvoir révoquer sans tout casser.

## 🧾 À retenir
- Code public, secrets privés : jamais ensemble.
- L'historique Git n'oublie pas : un secret commité = à révoquer.
- Config par environnement ; validation au démarrage ; `.env.example` comme doc.

## 📚 Vocabulaire
**variable d'environnement** · **.env / .env.example** · **révocation** · **rotation** · **secrets CI** · **vault** · **rayon d'explosion** · **12-factor config**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Aucun secret dans aucun historique de mes repos (audité).
- [ ] Mes apps valident leurs variables au démarrage.
- [ ] Je sais utiliser un secret en CI sans le fuiter.

## 🔗 Liens avec le programme
Mois 8 (première clé LLM), mois 11-12 (Docker, CI, projet final). Leçons liées : `docker-containers`, `ci-cd`, `ai-security`.
