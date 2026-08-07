<!-- keep -->
# Leçon — Réseau : HTTP et TLS

## 🎯 Objectif
Comprendre **HTTP** (requête/réponse, méthodes, statuts, en-têtes) et **TLS** (ce que
le « S » de HTTPS garantit vraiment : le handshake, les certificats, ce qui est protégé
et ce qui ne l'est pas) — pour diagnostiquer une API et raisonner la sécurité en
transit.

## 🧩 Prérequis
Modèle en couches (`/doc/lessons/networking-tcp-ip-model`).

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
