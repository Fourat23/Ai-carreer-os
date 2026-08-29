<!-- keep -->
# Leçon — Kubernetes : réseau, Services et Ingress

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Les Pods sont **jetables** : Kubernetes en crée et en détruit sans cesse, et à
chaque fois leur adresse change. Alors comment un composant peut-il en joindre un
autre de façon fiable, si l'adresse bouge tout le temps ? On ne peut pas s'appuyer
sur l'adresse d'un Pod précis. La réponse est le **Service** : une adresse STABLE
posée devant un groupe de Pods, qui répartit le trafic vers ceux qui sont en bonne
santé — exactement le rôle d'un load balancer interne. Cette leçon résout ce
problème (« joindre une cible mouvante ») puis montre comment exposer proprement une
application au monde extérieur avec l'Ingress.

## 🎯 Objectif
Comprendre comment on JOINT des Pods qui vont et viennent : le **Service** comme
adresse stable, ses types (**ClusterIP**, **NodePort**, **LoadBalancer**), la
**découverte par DNS** interne, et l'**Ingress** pour le routage HTTP L7. Relier
ces objets au modèle réseau appris précédemment.

## 🧩 Prérequis
Vous devez savoir ce qu'est un **Pod** et un **workload**
(`/doc/lessons/k8s-workloads`), et avoir la carte du **réseau** et du **load
balancing L4/L7** (`/doc/lessons/networking-tcp-ip-model`,
`/doc/lessons/networking-proxy-loadbalancing`), car un Service EST un répartiteur et
l'Ingress un reverse proxy L7. Les notions ClusterIP/NodePort/LoadBalancer et
endpoints sont définies ici.

## 🧠 Modèle mental
Les Pods sont jetables : leurs IP changent. On ne peut donc pas s'y connecter
directement de façon durable. Le **Service** est une **adresse stable** posée
DEVANT un ensemble de Pods (sélectionnés par labels) : il répartit le trafic vers
les Pods sains, quels que soient ceux du moment. C'est exactement le rôle d'un
load balancer interne — au niveau transport — appliqué au monde mouvant des Pods.

## 📖 Explication complète
**Le Service et les endpoints.** Un Service cible des Pods par **sélecteur de
labels**. Kubernetes maintient la liste des **endpoints** (les IP des Pods sains
correspondants) et répartit le trafic entre eux. Quand un Pod meurt/naît, la liste
se met à jour automatiquement — l'appelant garde la même adresse de Service.

**Types de Service.**
- **ClusterIP** (défaut) : IP interne au cluster ; joignable seulement DEPUIS le
  cluster. C'est le cas courant pour la communication service-à-service.
- **NodePort** : ouvre un port sur chaque nœud ; joignable de l'extérieur via
  `IP_du_nœud:port`. Rudimentaire, surtout pour du test/dépannage.
- **LoadBalancer** : demande au cloud un load balancer externe qui pointe vers le
  Service. C'est le point d'entrée public managé (dépend du fournisseur cloud).

**Découverte par DNS.** Le cluster fournit un DNS interne : un Service `api` dans
le namespace `prod` est joignable par nom (`api` dans le même namespace, ou
`api.prod.svc.cluster.local` complet). Les applications se parlent par NOM de
Service, jamais par IP de Pod — même logique que le DNS de service vu avec Docker.

**Ingress.** Un Service `LoadBalancer` par application deviendrait coûteux et
limité au niveau transport. L'**Ingress** est un **reverse proxy L7** partagé : un
point d'entrée unique qui route le HTTP selon l'**hôte** et le **chemin**
(`api.exemple.test` → Service api, `/` → Service front), gère la **terminaison
TLS** et les redirections. Il nécessite un **Ingress controller** (nginx, Traefik…)
qui réalise concrètement le routage. C'est le pendant K8s du reverse proxy/L7 vu
en réseau.

**Correspondance avec le modèle réseau.** Service = répartition niveau transport
(comme un load balancer L4) ; Ingress = routage niveau application (L7). Les
**probes** (leçon config/probes) déterminent quels Pods sont « sains » et donc
inclus comme endpoints — un Pod non prêt est retiré de la rotation.

## 🔧 Exemple — Service ClusterIP + Ingress
```yaml
apiVersion: v1
kind: Service
metadata: { name: api }
spec:
  selector: { app: monapi }     # cible les Pods portant ce label
  ports:
    - port: 80
      targetPort: 3000          # port du conteneur
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: web }
spec:
  rules:
    - host: api.exemple.test
      http:
        paths:
          - path: /
            pathType: Prefix
            backend: { service: { name: api, port: { number: 80 } } }
```
L'app cliente joint `http://api` (DNS interne) ; l'extérieur passe par l'Ingress.

## 🧭 Exemple guidé — « un service ne répond pas dans le cluster »
1. Le Service a-t-il des **endpoints** ? (`kubectl get endpoints api`) — vide =
   aucun Pod sain ne correspond au sélecteur.
2. Les **labels** des Pods correspondent-ils au **sélecteur** du Service ?
3. Les Pods sont-ils **Ready** (readiness probe) ? Un Pod non prêt n'est pas
   endpoint.
4. Diagnostic par couches : DNS interne résout-il le nom ? le `targetPort`
   est-il le bon port du conteneur ?

## ⚠️ Erreurs fréquentes
- **Sélecteur/labels qui ne correspondent pas** → Service sans endpoints (silence).
- Se connecter à une **IP de Pod** au lieu du nom de Service (l'IP change).
- Confondre `port` (du Service) et `targetPort` (du conteneur).
- Créer un `LoadBalancer` par service au lieu d'un **Ingress** partagé.
- Oublier qu'un Pod non **Ready** est retiré des endpoints.

## 🔐 Sécurité
Par défaut, tout Pod peut joindre tout Service dans le cluster : on restreint avec
des **NetworkPolicies** (leçon sécurité K8s). N'exposer à l'extérieur que le
nécessaire (Ingress/LoadBalancer) ; garder les Services internes en ClusterIP. La
terminaison TLS se fait à l'Ingress (certificat géré là).

## 🏢 Cas métier
Un Service « ne marchait pas » : `kubectl get endpoints` le montrait VIDE. Cause :
le sélecteur `app: api` ne correspondait pas au label réel des Pods (`app:
monapi`). Correction du label : les endpoints se peuplent, le trafic passe. Le
réflexe « endpoints vides = problème de labels/readiness » a fait gagner des
heures.

## 🎤 Questions d'entretien
- « Pourquoi un Service et pas l'IP d'un Pod ? » → les Pods sont jetables ; le
  Service offre une adresse stable + répartition.
- « ClusterIP vs LoadBalancer ? » → interne au cluster vs point d'entrée externe
  managé par le cloud.
- « Rôle de l'Ingress ? » → reverse proxy L7 partagé (routage HTTP par hôte/chemin,
  TLS).

## ✍️ Mini-exercice
`kubectl get endpoints` montre un Service SANS endpoints. Première hypothèse ? →
le sélecteur du Service ne correspond pas aux labels des Pods (ou aucun Pod n'est
Ready).

## 🧾 À retenir
- Service = adresse stable + répartition vers les Pods sains (par labels).
- ClusterIP (interne), NodePort (test), LoadBalancer (entrée cloud).
- DNS interne : on joint par NOM de Service, pas par IP de Pod.
- Ingress = reverse proxy L7 partagé (hôte/chemin, TLS) via un controller.
- Endpoints vides ⇒ labels/sélecteur ou readiness à vérifier.

## 📚 Vocabulaire
**Service** · **endpoints** · **ClusterIP / NodePort / LoadBalancer** · **DNS
interne** · **port / targetPort** · **Ingress / Ingress controller** · **L4 / L7** ·
**NetworkPolicy**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'expose des Pods via un Service et je choisis le bon type.
- [ ] Je joins les services par DNS interne, pas par IP de Pod.
- [ ] Je diagnostique un Service sans endpoints (labels/readiness).

## 🔗 Liens avec le programme
Mois 11 (orchestration). Leçons liées : `/doc/lessons/k8s-workloads`,
`/doc/lessons/networking-proxy-loadbalancing`, `/doc/lessons/k8s-config-probes`.
Le Service/Ingress applique au cluster le modèle load balancing / L4-L7 du réseau.
