<!-- keep -->
# Leçon — Réseau : HTTP et TLS

## 🌍 Le problème d'abord
Quand votre navigateur affiche une page, il a en réalité **demandé** quelque chose à
un serveur qui lui a **répondu**. Ce dialogue suit des règles précises : c'est
**HTTP**. Et le petit cadenas « HTTPS » ? Il ajoute une couche qui chiffre l'échange :
c'est **TLS**. Deux malentendus coûtent cher aux débutants : croire qu'une erreur
vient toujours du serveur (alors que souvent c'est la requête qui est mal formée), et
croire que « cadenas vert = site de confiance » (faux : le cadenas prouve seulement
que la communication est chiffrée, pas que le site est honnête). Cette leçon apprend
à LIRE une réponse (le fameux code 404, 500…) et à comprendre ce que le cadenas
garantit — et surtout ce qu'il ne garantit PAS. On n'a besoin d'aucune expérience
préalable des API.

## 🎯 Objectif
Comprendre **HTTP** (requête/réponse, méthodes, statuts, en-têtes) et **TLS** (ce que
le « S » de HTTPS garantit vraiment : le handshake, les certificats, ce qui est protégé
et ce qui ne l'est pas) — pour diagnostiquer une API et raisonner la sécurité en
transit.

## 🧩 Prérequis
Vous devez avoir la **carte des couches réseau**
(`/doc/lessons/networking-tcp-ip-model`) : HTTP vit à la couche « application » et TLS
juste en dessous. Aucune connaissance des méthodes HTTP, des statuts ou des
certificats n'est supposée — tout est introduit ici, du plus simple au plus subtil.

## 🧠 Modèle mental
HTTP est un protocole **requête → réponse** au niveau application : le client demande,
le serveur répond, chaque échange est indépendant (**sans état**). TLS n'est pas un
autre protocole applicatif : c'est une **couche de chiffrement** posée SOUS HTTP.
HTTPS = HTTP transporté dans un tunnel TLS. Comprendre les deux, c'est savoir lire une
réponse d'API et savoir ce qu'un cadenas prouve (et ne prouve pas).

## 📖 Explication complète
**Une requête HTTP.** Elle a une **méthode**, un **chemin**, des **en-têtes** et
parfois un **corps**. Méthodes : `GET` (lire, sans effet de bord), `POST` (créer/agir),
`PUT`/`PATCH` (mettre à jour), `DELETE` (supprimer). Idempotence : `GET`/`PUT`/`DELETE`
répétés donnent le même état ; `POST` répété peut créer plusieurs fois.

**Les codes de statut.** Ils se lisent par famille :
- **2xx** succès (200 OK, 201 Created, 204 No Content).
- **3xx** redirection (301 permanente, 302 temporaire).
- **4xx** erreur du CLIENT (400 requête mal formée, 401 non authentifié, 403 interdit,
  404 introuvable, 429 trop de requêtes).
- **5xx** erreur du SERVEUR (500 bug, 502/503/504 backend indisponible/surchargé).
La distinction 4xx/5xx est cruciale en incident : 4xx = « le client a mal demandé »,
5xx = « le serveur a échoué » (on regarde le backend).

**Les en-têtes.** Métadonnées de l'échange : `Content-Type` (format du corps),
`Authorization` (jeton/identité), `Cache-Control` (mise en cache), `Set-Cookie`. Ne
JAMAIS mettre un secret ailleurs que là où il doit être ; un en-tête `Authorization`
transite en clair sans TLS.

**TLS : ce qu'il garantit.** Trois propriétés : **confidentialité** (personne sur le
chemin ne lit le contenu), **intégrité** (personne ne l'altère sans être détecté), et
**authentification du serveur** (vous parlez bien au bon serveur, prouvé par son
**certificat**). Le **handshake** : le client et le serveur négocient une clé de session
(cryptographie asymétrique pour l'échanger, symétrique pour la suite, plus rapide), le
serveur présente son certificat signé par une autorité (CA) de confiance.

**Ce que TLS NE garantit PAS.** Il ne prouve pas que le site est honnête, ni que
l'application est sûre : un site de phishing peut avoir un cadenas parfaitement valide.
TLS protège le TRANSPORT, pas le contenu ni l'intention. Le certificat authentifie le
DOMAINE, pas la moralité.

**Certificats et expiration.** Un certificat a une **date d'expiration**. Un certificat
expiré fait échouer la connexion pour TOUS les clients : c'est un incident classique et
évitable (renouvellement automatique + alerte avant échéance). Le `Subject`/SAN doit
correspondre au domaine demandé, sinon erreur de nom.

## 🔧 Diagnostic avec curl
```bash
curl -i https://api.exemple.test/health     # affiche statut + en-têtes de réponse
curl -v https://api.exemple.test            # détails TLS (handshake, certificat)
curl -X POST -H "Content-Type: application/json" -d '{"x":1}' https://api.exemple.test/items
curl -w "%{http_code} %{time_total}s\n" -o /dev/null -s https://api.exemple.test  # statut + latence
```
`-i` montre le statut (2xx/4xx/5xx) : la première info à lire. `-v` révèle un problème
TLS (certificat expiré, nom qui ne correspond pas, CA inconnue).

## 🧭 Exemple guidé — « l'API renvoie une erreur »
1. `curl -i` : quel code ? 4xx (ma requête : mauvais chemin, jeton manquant/expiré,
   payload invalide) ou 5xx (le serveur : regarder les logs du backend) ?
2. Si erreur TLS (`curl -v`) : certificat expiré ? nom qui ne correspond pas ? CA non
   reconnue ?
3. Vérifier les en-têtes envoyés (`Authorization`, `Content-Type`) — beaucoup de 400/401
   viennent de là.
4. Reproduire minimalement avec `curl` avant d'accuser le code.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Tu déploies un nouveau certificat. `curl https://api.exemple` fonctionne depuis ton
   poste. Le déploiement est-il correct ?
2. Une API renvoie `401` puis, après correction du jeton, `403`. Qu'as-tu appris entre
   les deux ?
3. Un site de hameçonnage affiche un cadenas vert. Le navigateur ment-il ?
4. Ton service renvoie `502`. Où regardes-tu, et où ne regardes-tu pas ?

## ✅ Correction attendue

**La démarche.** Reproduire minimalement avec `curl -i` (le code et les en-têtes) puis
`curl -v` (la négociation TLS) **avant** d'ouvrir le code applicatif. La grande majorité
des « bugs d'API » se lisent dans ces deux sorties.

**L'erreur probable : conclure de « ça marche chez moi » que le certificat est bien
installé.** C'est le classique absolu de TLS, et il touche des ingénieurs
expérimentés.

Un certificat de serveur n'est presque jamais signé directement par une autorité
racine : il est signé par un certificat **intermédiaire**, lui-même signé par la racine.
Le client doit pouvoir reconstituer cette **chaîne** entière pour valider. Le serveur a
donc l'obligation d'envoyer **son certificat ET les intermédiaires**.

S'il n'envoie que le sien, cela fonctionne quand même — pour toi. Parce que ton
navigateur ou ton système a déjà rencontré cet intermédiaire ailleurs et l'a mis en
cache. Ton test réussit, tu déploies, et l'échec frappe ceux qui n'ont pas ce cache :
une machine fraîchement provisionnée, un conteneur minimal, un client Java, un mobile
Android. **Le service est cassé pour une fraction des utilisateurs, et impossible à
reproduire depuis le poste de celui qui a déployé.**

Le piège séduit parce que le test **est réel** : la connexion s'établit vraiment, le
cadenas s'affiche vraiment. Ce n'est pas une négligence, c'est une expérience réussie
dont on tire une conclusion trop large. Le défaut n'est pas dans le résultat mais dans
l'échantillon : un seul client, et le plus équipé de tous.

Le remède : vérifier la chaîne, pas la connexion. `openssl s_client -connect
hôte:443 -showcerts` affiche ce que le serveur envoie réellement, et un testeur SSL
public le fait depuis une machine qui n'a pas ton cache.

**Sur les autres questions.** Passer de `401` à `403` est une bonne nouvelle
déguisée en échec : `401` signifie « je ne sais pas qui tu es » — l'authentification a
échoué ; `403` signifie « je sais qui tu es, et tu n'as pas le droit » —
l'authentification a réussi, c'est l'autorisation qui refuse. Tu as donc franchi une
étape, et le problème a changé de nature : ce n'est plus un jeton, c'est une permission.

Le cadenas sur un site de hameçonnage : **le navigateur ne ment pas, il dit autre chose
que ce qu'on croit lire.** Il affirme que la connexion est chiffrée et que le serveur
prouve posséder le domaine affiché. Il n'affirme rien sur l'honnêteté de ce domaine.
N'importe qui peut obtenir un certificat valide pour un domaine qu'il possède, y compris
`ma-banque-securite.example`. TLS authentifie **le domaine, pas l'intention** — et c'est
pourquoi lire l'URL reste indispensable.

Enfin, `502` est émis par un **intermédiaire** — reverse proxy, load balancer,
passerelle — qui dit : « j'ai contacté le backend et je n'ai pas obtenu de réponse
valide ». On regarde donc les logs du backend et son état de santé. On ne regarde **pas**
le code qui a produit la requête, ni le client : ils n'ont rien fait de mal, et c'est
justement ce que le code de statut annonce.

**Alternative défendable.** `curl -k` (ignorer la validation du certificat) est un outil
de diagnostic légitime : il permet de savoir en une seconde si le problème est TLS ou
applicatif. Ce qui n'est jamais défendable, c'est de le laisser dans un script, un
client HTTP ou une configuration — il désactive précisément la protection contre
l'interception, et il le fait silencieusement pour toujours.

**Vérifie seul, sans corrigé** :
1. Lance `openssl s_client -connect ton-domaine:443 -showcerts`. Combien de certificats
   le serveur envoie-t-il ? S'il n'y en a qu'un, tu as la panne décrite ci-dessus, en
   attente d'un client sans cache.
2. Cherche `-k`, `verify=False`, `rejectUnauthorized: false` dans ton code. Chaque
   occurrence est une interception rendue possible.
3. Quelle est la date d'expiration de ton certificat, et qu'est-ce qui t'alertera avant
   ? Si la réponse est « rien », note-la dans un calendrier maintenant.

## ⚠️ Erreurs fréquentes
- **Confondre 4xx et 5xx** : chercher un bug serveur alors que c'est un 401 (jeton).
- Croire que « cadenas vert = site fiable » : TLS ≠ honnêteté.
- Laisser un **certificat expirer** (renouvellement auto + alerte à mettre en place).
- Envoyer un secret sur du HTTP simple (sans TLS, tout est lisible).
- Utiliser `POST` là où `GET` conviendrait (ou l'inverse), casser l'idempotence.
- Oublier `Content-Type` et s'étonner d'un 400.

## ☁️ Vers le cloud et Kubernetes
La **terminaison TLS** se fait souvent au **load balancer** (L7) ou à l'**Ingress**
Kubernetes : le certificat y est présenté, le trafic interne peut être en clair dans un
réseau de confiance (ou re-chiffré). Comprendre HTTP/TLS explique le rôle du reverse
proxy, du WAF et du routage L7.

## 🏢 Cas métier
Un dimanche, l'API tombe pour tous : `curl -v` montre « certificate has expired ». Le
renouvellement manuel avait été oublié. Correction immédiate : renouveler ; correction
de fond : automatiser le renouvellement + alerte 30 jours avant expiration.

## 🎤 Questions d'entretien
- « 401 vs 403 ? » → non authentifié (qui es-tu ?) vs authentifié mais interdit (pas le droit).
- « Que garantit TLS ? » → confidentialité, intégrité, authentification du serveur — pas
  l'honnêteté du site.
- « Différence 4xx / 5xx en incident ? » → faute côté client vs côté serveur.

## ✍️ Mini-exercice
Une requête renvoie 502. Est-ce plutôt un problème de votre requête ou du serveur ? →
du serveur (famille 5xx : backend indisponible ou en erreur).

## 🧾 À retenir
- HTTP : requête (méthode, chemin, en-têtes, corps) → réponse (statut, en-têtes, corps), sans état.
- Statuts par famille : 2xx OK, 3xx redir, 4xx client, 5xx serveur.
- TLS = confidentialité + intégrité + authentification du serveur (pas l'honnêteté).
- Certificat = identité du domaine, avec date d'expiration à surveiller.
- `curl -i`/`-v` : premier réflexe de diagnostic.

## 📚 Vocabulaire
**HTTP** · **méthode (GET/POST/PUT/DELETE)** · **idempotence** · **statut (2xx…5xx)** ·
**en-tête** · **TLS / HTTPS** · **handshake** · **certificat / CA** · **terminaison TLS**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je classe un statut HTTP par famille et j'en déduis où chercher.
- [ ] J'explique ce que TLS protège et ce qu'il ne protège pas.
- [ ] Je diagnostique un problème de certificat avec `curl -v`.

## 🔗 Liens avec le programme
Jours `/day/50` (HTTP en profondeur) et `/day/71` (réseau/TLS). Leçons liées :
`/doc/lessons/http-rest-json`, `/doc/lessons/networking-proxy-loadbalancing`,
`/doc/lessons/authentication`. TLS/HTTP sous-tendent le reverse proxy, l'Ingress et le
réseau cloud.
