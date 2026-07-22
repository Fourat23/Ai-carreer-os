# Correction — Jour 67 : Sécurité web de base : OWASP appliqué à tes APIs

[← Retour au jour 67](../days/day-067.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Traiter la sécurité comme une propriété à vérifier partout et la prouver en ATTAQUANT ses propres API. Auditer les quatre familles OWASP : injection (paramétrage), auth cassée (tokens vérifiés), exposition (ne renvoyer que le nécessaire), mauvaise config (secrets hors du code, erreurs non bavardes). Corriger 3 failles réelles avec preuves avant/après, et ajouter un rate limiting. La preuve : les failles trouvées sont concrètes et les corrections vérifiées par nouvelle attaque.

## ✅ Une solution simple
Passer en revue les failles OWASP et corriger ce qu'on trouve. La sécurité s'améliore.

## 🚀 Une solution améliorée
Auditer les 4 familles en ATTAQUANT réellement chaque API (injection tentée, route protégée appelée sans token, réponse inspectée pour les fuites, config vérifiée), documenter 3 failles trouvées avec avant/après et preuve de correction, ajouter un rate limiting testé (dépasser la limite → 429), et relier la posture d'attaquant à la sécurité LLM à venir.

## ⚠️ Erreurs probables et points à vérifier
- Croire son app sûre sans l'avoir attaquée : la sécurité ne se suppose pas, elle se prouve.
- Messages d'erreur qui fuient des infos internes (stack, requête, chemins) : renseignent l'attaquant.
- Exposer trop de données par défaut (hash, emails d'autres, champs internes) faute de choisir ce qu'on renvoie.
- Secrets commités ou CORS ouvert à * : mauvaise configuration exploitable.

## 🔍 Comment vérifier ta solution
- Audit des 4 familles de failles fait sur TES deux APIs, avec preuves.
- 3 failles réelles trouvées et corrigées (avant/après documenté).
- Rate limiting fonctionnel (testé en dépassant la limite → 429).
- Aucune réponse ne fuit de données superflues ni de détails internes (vérifié par attaque).

## ❓ Réponses du mini-quiz
1. **Pourquoi la sécurité n'est-elle pas une feature qu'on ajoute à la fin ?**
   → C'est une PROPRIÉTÉ à vérifier partout : une faille peut vivre dans n'importe quelle entrée non validée, réponse trop bavarde ou config. On la vérifie à chaque point, pas dans un module ajouté après coup.
2. **Quelle posture prouve qu'une API est sûre ?**
   → ATTAQUER son propre système : envoyer une injection, appeler une route protégée sans token, demander les données d'un autre, provoquer une erreur pour voir ce qui fuit. Croire son app sûre sans l'avoir attaquée est l'erreur de base.
3. **Cite les quatre familles OWASP qui te concernent immédiatement et leur défense.**
   → Injection (paramétrage), authentification cassée (tokens vérifiés), exposition de données (ne renvoyer que le nécessaire), mauvaise configuration (secrets hors du code, erreurs non bavardes, CORS restreint).
4. **À quoi sert le rate limiting ?**
   → À limiter le nombre de requêtes par client et par fenêtre de temps : il protège contre le brute-force (deviner un token/mot de passe) et l'abus, en élevant le coût d'une attaque (429 au-delà de la limite).

## 🎤 À savoir expliquer à l'oral
Pose la posture : « la sécurité est une propriété à vérifier partout, et je ne la suppose jamais — je l'attaque ». Déroule les 4 familles OWASP et leur défense (paramétrage, tokens, ne renvoyer que le nécessaire, secrets hors du code), donne une faille réelle trouvée chez toi (typiquement une exposition) et sa correction. Relier l'état d'esprit d'attaquant à l'injection de prompt LLM (mois 8) montre que tu vois la sécurité comme une compétence transversale.
