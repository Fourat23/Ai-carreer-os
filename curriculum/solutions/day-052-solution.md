# Correction — Jour 52 : Node natif puis Express : du bas niveau au framework

[← Retour au jour 52](../days/day-052.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Écrire le serveur natif d'abord pour éprouver la friction, PUIS Express pour mesurer l'automatisation. Natif : createServer((req,res)), routing à la main (switch method+url), parsing du corps par accumulation de chunks, réponse via writeHead + end. Documenter chaque friction et l'associer à ce qu'Express automatise. La preuve de compréhension : réécrire le service en Express en quelques lignes et expliquer chaque raccourci.

## ✅ Une solution simple
Serveur natif qui répond à GET /ping et POST /echo, puis version Express. Les deux fonctionnent.

## 🚀 Une solution améliorée
Parser le corps du POST chunk par chunk (compris, pas copié), gérer la route inconnue (404) et le JSON invalide (400), ne jamais oublier res.end, puis écrire la LISTE des frictions natives associées chacune à son automatisation Express (routing → app.get, chunks → express.json, res.end → géré). Expliquer le principe « couche basse comprise = abstraction démystifiée ».

## ⚠️ Erreurs probables et points à vérifier
- Oublier res.end : la réponse n'est jamais terminée, la requête reste pendante.
- Ne pas gérer les chunks du corps : lire req comme une valeur au lieu d'un flux accumulé.
- Traiter Express en boîte noire sans comprendre ce qu'il automatise : blocage au premier comportement inattendu.
- Croire que le serveur natif est fait pour la production : il est instructif mais impraticable (verbeux, fragile).

## 🔍 Comment vérifier ta solution
- Le serveur natif répond correctement à GET /ping et POST /echo.
- Le corps du POST est parsé chunk par chunk (compris, pas copié).
- La liste de frictions est écrite : chaque friction est associée à ce qu'Express automatise.
- La version Express reproduit le service en quelques lignes, chaque raccourci expliqué.

## ❓ Réponses du mini-quiz
1. **Qu'est-ce qu'un serveur HTTP au niveau du module http de Node ?**
   → Une fonction qui reçoit `(req, res)` et ÉCRIT une réponse : `req` porte méthode/URL/headers/corps (un flux), `res` sert à répondre (writeHead + end).
2. **Pourquoi écrire un serveur natif AVANT d'apprendre Express ?**
   → Pour éprouver la friction (routing manuel, parsing des chunks, res.end) et comprendre ce qu'Express automatise. Ensuite le framework n'est plus une boîte noire mais un raccourci dont on connaît le travail.
3. **Comment lit-on le corps d'un POST en http natif ?**
   → Le corps arrive par MORCEAUX (chunks) sur un flux : on les accumule (`req.on('data')`) puis on les assemble à la fin (`req.on('end')`) et on parse le résultat.
4. **Que se passe-t-il si on oublie `res.end` ?**
   → La réponse n'est jamais terminée : la requête reste PENDANTE et le client attend indéfiniment (timeout). Express gère la fin de réponse pour toi.

## 🎤 À savoir expliquer à l'oral
Explique la démarche : « j'écris le natif d'abord pour éprouver la friction et comprendre ce qu'Express automatise ». Détaille les trois gestes manuels (routing par switch, parsing des chunks, writeHead+end) et leur automatisation Express (app.get, express.json, res.json). Conclure par le principe général — « une couche basse comprise démystifie toute abstraction au-dessus » — montre que tu apprends en profondeur, pas par recettes.
