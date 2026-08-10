<!-- keep -->
# Leçon — API de production : idempotence, pagination, limites et versions

## 🌍 Le problème d'abord
Ton API marche en démo : `POST /commande` crée une commande, `GET /commandes` les liste. Puis la
réalité de production arrive. Un client mobile perd le réseau juste après avoir envoyé `POST` : il
réessaie — et tu crées DEUX commandes. La liste renvoie 50 000 lignes d'un coup et fait tomber le
mobile. Un client boucle et envoie 10 000 requêtes par seconde. Et le jour où tu changes un champ,
toutes les applications déjà installées cassent. Une API de production n'est pas `app.get(...)` : c'est
un **contrat** avec des clients que tu ne contrôles pas, dans le temps. Cette leçon t'apprend les
propriétés qui rendent ce contrat fiable.

## 🎯 Objectif
Savoir expliquer et reconnaître les propriétés d'une API de production : **idempotence** (rejouer une
requête sans dommage), **pagination** (renvoyer les données par lots), **rate limiting** (protéger le
service), **versioning** et **compatibilité ascendante** (évoluer sans casser les clients existants).
Savoir décider quand et comment les appliquer.

## 🧩 Prérequis
Tu dois connaître HTTP, REST et les codes de statut (`/doc/lessons/http-rest-json`), et les bases de
conception d'API — ressources, validation, erreurs, évolution (`/doc/lessons/api-design-basics`), qui
fondent cette leçon. Des notions d'authentification (`/doc/lessons/authentication`) aident pour le rate
limiting par client. Cette leçon approfondit le « jour 2 » d'une API.

## 🧠 Modèle mental
Une API de production est un **contrat public dans le temps**. Trois vérités en découlent :
1. **Le réseau échoue** → une requête peut être rejouée : les opérations doivent être **idempotentes**
   (ou rendues telles) pour que rejouer ne double rien.
2. **Les données grossissent** → on ne renvoie jamais « tout » : on **pagine**, et on **limite** le
   débit pour qu'un client fautif ne fasse pas tomber le service pour les autres.
3. **Les clients survivent à ton code** → une application installée continue d'appeler l'ancienne
   forme : tu dois évoluer de façon **compatible** (ou versionner). « Tu ne contrôles pas tes
   clients ; tu contrôles ton contrat. »

## 📚 Explication progressive

### Idempotence : rejouer sans dommage
Une opération est **idempotente** si l'exécuter une ou plusieurs fois donne le même effet. En HTTP,
`GET`, `PUT`, `DELETE` sont idempotents par nature ; `POST` ne l'est PAS (deux `POST` créent deux
ressources). Le problème : un client qui n'a pas reçu la réponse réessaie. La parade professionnelle :
une **clé d'idempotence** — le client envoie un identifiant unique de requête (ex. en-tête
`Idempotency-Key`), le serveur mémorise le résultat de la première exécution et, si la MÊME clé
revient, renvoie le résultat mémorisé **sans refaire l'action**. Résultat : rejouer est sûr.

### Pagination : renvoyer par lots
Ne renvoie jamais une collection entière. Deux stratégies :
- **Offset/limit** (`?page=3&limit=20`) : simple, mais coûteux sur de grandes tables et INSTABLE si
  des éléments sont insérés/supprimés pendant la navigation (on saute ou double des lignes).
- **Curseur (keyset)** (`?after=<id_du_dernier>`) : on demande « ce qui vient après tel repère ».
  Plus stable et performant sur de gros volumes ; l'ordre doit être stable (ex. par id/date).
Compromis : offset est plus simple pour de petites listes ; curseur pour de gros flux ou du défilement
infini.

### Rate limiting : protéger le service
Un client (bogué ou malveillant) peut noyer ton API. Le **rate limiting** plafonne le nombre de
requêtes par client et par fenêtre de temps ; au-delà, l'API répond **`429 Too Many Requests`**,
idéalement avec un en-tête indiquant quand réessayer (`Retry-After`). C'est une protection de
DISPONIBILITÉ : elle préserve le service pour tous les autres clients.

### Versioning & compatibilité ascendante
Une modification est **compatible ascendante (backward-compatible)** si les clients existants
continuent de fonctionner : AJOUTER un champ optionnel, un nouvel endpoint — sans danger. Est
**cassant (breaking)** : retirer/renommer un champ, changer un type, rendre obligatoire un champ
optionnel, changer un code de statut. Pour un changement cassant, on **versionne** (`/v2/...` ou une
négociation par en-tête) et on maintient l'ancienne version le temps que les clients migrent. Règle :
« ajoute sans casser ; pour casser, versionne et préviens ».

## 🔬 Exemple guidé

### Simple — idempotence d'un paiement
`POST /paiements` avec `Idempotency-Key: abc-123`. Le mobile perd le réseau et réessaie avec la MÊME
clé. Le serveur voit `abc-123` déjà traité → il renvoie le paiement DÉJÀ créé (même id, `200`) au lieu
d'en créer un second. Le client, lui, ne sait même pas qu'il a rejoué.

### Réaliste — migrer un champ sans casser
Tu veux renommer `nom` en `fullName`. Cassant. Solution compatible : pendant une transition, renvoie
les DEUX champs (`nom` déprécié + `fullName`), documente la dépréciation, puis retire `nom` dans une
`/v2` une fois les clients migrés. Les anciennes apps continuent de lire `nom` ; les nouvelles lisent
`fullName`.

## ⚖️ Trade-offs
- Idempotence par clé : robustesse ↔ stockage/état côté serveur (mémoriser les clés un certain temps).
- Offset vs curseur : simplicité ↔ stabilité/performance sur gros volumes.
- Rate limiting strict : protection ↔ risque de gêner des clients légitimes (calibrer les seuils).
- Versionner : liberté d'évoluer ↔ coût de maintenir plusieurs versions en parallèle.

## ⚠️ Erreurs fréquentes / anti-patterns
- `POST` de création sans clé d'idempotence → doublons au moindre réessai réseau.
- Renvoyer une collection entière sans pagination → réponses énormes, clients qui tombent.
- Aucun rate limiting → un client fautif fait tomber l'API pour tous.
- Casser le contrat en douce (retirer/renommer un champ) sans version ni dépréciation.
- Utiliser l'offset pour un flux qui change vite → lignes sautées ou dupliquées.

## 🛠️ Pratique
Exercices déterministes reliés à cette leçon :
`http-method-idempotent` (quelles méthodes sont idempotentes), `auth-status-decision` (401/403/404/200),
`api-router` (routeur REST). Approfondissement V38 : `api-idempotency` (rejouer sans doubler),
`api-pagination-choice` (offset vs curseur).

## 🧪 Vérification de compréhension
- Pourquoi un `POST` de création a-t-il besoin d'une clé d'idempotence, mais pas un `PUT` ?
- Un défilement infini sur des données qui changent souvent : offset ou curseur, et pourquoi ?
- Ajouter un champ optionnel à une réponse : cassant ou compatible ? Et le rendre obligatoire ?

## 💼 Cas professionnel
Une API de paiement DOIT être idempotente : la finance ne tolère pas les doublons. Les API publiques
(GitHub, Stripe…) paginent par curseur et imposent des quotas (429). Toute API avec des clients mobiles
gère la compatibilité ascendante, car on ne peut pas forcer les mises à jour.

## 🎤 Entretien
« Comment rends-tu une création de ressource sûre au réessai ? » → clé d'idempotence : le serveur
mémorise le résultat par clé et renvoie le même au rejeu. « Offset ou curseur ? » → curseur pour gros
volumes/flux instables, offset pour petites listes stables.

## 📌 À retenir
Une API de production est un contrat dans le temps face à des clients qu'on ne contrôle pas. Le réseau
échoue → rends les opérations idempotentes (clé d'idempotence sur les `POST`). Les données grossissent
→ pagine (offset simple, curseur stable/scalable) et limite le débit (`429` + `Retry-After`). Les
clients survivent à ton code → ajoute sans casser, et pour casser, versionne et préviens.

## 📖 Vocabulaire
**contrat d'API** · **idempotence / clé d'idempotence** · **pagination (offset / curseur/keyset)** ·
**rate limiting / `429` / `Retry-After`** · **versioning** · **compatibilité ascendante (backward-compatible)**
· **changement cassant (breaking change)** · **dépréciation**.

## 🔗 Liens avec le programme
Cette leçon approfondit `/doc/lessons/api-design-basics` et `/doc/lessons/http-rest-json`, rejoint
`/doc/lessons/breaking-changes-compatibility` (évolution sans casse) et `/doc/lessons/authentication`
(rate limiting par client). Elle prépare le travail asynchrone
(le traitement par files, où l'idempotence revient côté consommateur) et la fiabilité
(`/doc/lessons/resilience-patterns`).
