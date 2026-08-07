<!-- keep -->
# Leçon — Réseau : DNS, la résolution de noms

## 🎯 Objectif
Comprendre comment un **nom de domaine** devient une **IP** : les types
d'enregistrements (A, AAAA, CNAME, MX, TXT), le rôle du **TTL** et du **cache**, et
savoir diagnostiquer un problème DNS avec `dig` — l'une des causes d'incident les plus
fréquentes et les plus mal comprises.

## 🧩 Prérequis
Adressage IP (`/doc/lessons/networking-addressing-routing`).

## 🧠 Modèle mental
Les humains retiennent des noms (`api.exemple.test`), les machines parlent en IP. Le
**DNS** est l'annuaire distribué qui traduit l'un en l'autre. Avant TOUT échange réseau,
le nom doit être résolu en IP. Si cette traduction échoue ou renvoie une vieille valeur,
rien ne marche — même si le serveur est parfaitement sain. « C'est toujours le DNS » est
une blague d'ingénieur… souvent vraie.

## 📖 Explication complète
**La résolution, étape par étape.** Quand un programme veut joindre `api.exemple.test`,
un **resolver** interroge la hiérarchie DNS : les serveurs racine → le serveur du TLD
(`.test`) → le serveur faisant autorité pour `exemple.test`, qui renvoie l'IP. En
pratique, on interroge d'abord un resolver **récursif** (celui du système/FAI/cloud) qui
fait ce travail et met en cache le résultat.

**Les types d'enregistrements.**
- **A** : nom → IPv4. **AAAA** : nom → IPv6.
- **CNAME** : alias d'un nom vers un AUTRE nom (`www` → `exemple.test`). Un CNAME ne
  peut pas cohabiter avec d'autres enregistrements sur le même nom (piège fréquent à la
  racine d'un domaine).
- **MX** : serveurs de messagerie du domaine.
- **TXT** : texte libre, utilisé pour la vérification de propriété (SPF, DKIM, preuve de
  domaine pour un fournisseur cloud/TLS).
- **NS** : serveurs faisant autorité pour la zone.

**TTL et cache : la source des surprises.** Chaque enregistrement porte un **TTL** (Time
To Live) : la durée pendant laquelle un resolver a le droit de le garder en cache. Si le
TTL d'un A est de 3600 s, un changement d'IP peut mettre jusqu'à une heure à se
propager : d'anciens clients continuent de joindre l'ancienne IP. C'est pourquoi on
**baisse le TTL AVANT** une migration prévue (pour propager vite), puis on le remonte.
Le cache existe à plusieurs niveaux (application, OS, resolver) : vider l'un ne vide pas
les autres.

**Autorité vs cache.** Interroger le serveur faisant AUTORITÉ (`dig @ns nom`) donne la
vérité actuelle ; interroger un resolver récursif peut renvoyer une valeur en cache
(potentiellement périmée). Comparer les deux est la clé pour diagnostiquer « j'ai changé
l'IP mais ça ne prend pas ».

## 🔧 Diagnostic avec dig
```bash
dig api.exemple.test              # enregistrement A + section ANSWER + TTL restant
dig api.exemple.test AAAA         # IPv6
dig exemple.test MX               # serveurs mail
dig +short api.exemple.test       # juste l'IP
dig @ns1.exemple.test api.exemple.test   # interroger le serveur d'AUTORITÉ (bypass cache)
dig +trace exemple.test           # suivre la délégation depuis la racine
```
Lire la section ANSWER (l'IP renvoyée + le TTL) ; un `NXDOMAIN` = le nom n'existe pas ;
une réponse vide = pas d'enregistrement de ce type.

## 🧭 Exemple guidé — « j'ai changé l'IP mais le site pointe encore vers l'ancienne »
1. `dig +short api.exemple.test` : quelle IP renvoie MON resolver ? (peut être en cache)
2. `dig @<serveur-autorité> api.exemple.test` : quelle est la vérité ? Si elle est
   correcte mais le resolver renvoie l'ancienne → c'est du **cache/TTL**.
3. Regarder le TTL restant : attendre son expiration, ou vider les caches accessibles.
4. Pour la prochaine fois : baisser le TTL AVANT la migration.

## ⚠️ Erreurs fréquentes
- **Oublier le TTL** : changer un enregistrement et s'étonner que « ça ne prend pas »
  tout de suite.
- Mettre un **CNAME à la racine** d'un domaine (interdit/conflictuel).
- Vider un seul cache (navigateur) en croyant avoir tout vidé (OS/resolver restent).
- Confondre « le nom n'existe pas » (NXDOMAIN) et « pas d'enregistrement de ce type ».
- Diagnostiquer l'application alors que la résolution DNS échoue en amont.

## 🔐 & ☁️ Sécurité / cloud
Les enregistrements **TXT** servent souvent à prouver qu'on possède un domaine (pour
émettre un certificat TLS ou configurer un service cloud). Un DNS pointant vers une
ressource cloud supprimée peut être **détourné** (dangling DNS / subdomain takeover) :
on nettoie les enregistrements orphelins. Le DNS privé (résolution interne d'un VPC/VNet)
permet de nommer des services sans les exposer.

## 🏢 Cas métier
Après un basculement de serveur, 20% des utilisateurs voient encore l'ancien. `dig`
depuis l'autorité renvoie la bonne IP, mais les resolvers publics gardent l'ancienne :
le TTL était à 24 h. Correction immédiate : attendre/forcer ; correction de fond :
politique « TTL bas 24 h avant toute migration DNS planifiée ».

## 🎤 Questions d'entretien
- « À quoi sert le TTL ? » → durée de cache d'un enregistrement ; il gouverne la vitesse
  de propagation.
- « A vs CNAME ? » → A pointe vers une IP, CNAME est un alias vers un autre nom.
- « Pourquoi une modif DNS met du temps ? » → cache + TTL à plusieurs niveaux.

## ✍️ Mini-exercice
Vous prévoyez de changer l'IP d'un service dans deux jours. Quel réglage DNS faites-vous
AUJOURD'HUI pour une propagation rapide le jour J ? → baisser le TTL de l'enregistrement A.

## 🧾 À retenir
- DNS = annuaire nom → IP ; la résolution précède tout échange.
- Types : A/AAAA (IP), CNAME (alias), MX (mail), TXT (vérif/preuve), NS (autorité).
- Le **TTL** gouverne le cache et la vitesse de propagation : le baisser AVANT une migration.
- Diagnostiquer : comparer resolver (cache) et serveur d'autorité avec `dig`.

## 📚 Vocabulaire
**DNS** · **resolver récursif** · **serveur d'autorité** · **A / AAAA / CNAME / MX / TXT / NS** ·
**TTL** · **cache** · **NXDOMAIN** · **propagation** · **dangling DNS**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'explique la résolution d'un nom en IP.
- [ ] Je lis un `dig` (ANSWER, TTL) et je distingue cache et autorité.
- [ ] Je prépare une migration DNS via le TTL.

## 🔗 Liens avec le programme
Jour `/day/71` (réseau). Leçons liées : `/doc/lessons/networking-tcp-ip-model`,
`/doc/lessons/networking-http-tls`. Le DNS est la première couche à vérifier dans tout
incident « service inaccessible », y compris avec le DNS privé du réseau cloud.
