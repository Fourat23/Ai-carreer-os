<!-- keep -->
# Leçon — Cloud : concepts fondamentaux

## 🎯 Objectif
Poser le socle commun À TOUS les fournisseurs cloud : les **modèles de service**
(IaaS/PaaS/SaaS), le **modèle de responsabilité partagée**, **régions** et **zones
de disponibilité**, l'**élasticité** et le **paiement à l'usage**, les **services
managés**. Le vocabulaire et les modèles mentaux avant AWS ou Azure.

## 🧩 Prérequis
Réseau et conteneurs (`/doc/lessons/networking-addressing-routing`,
`/doc/lessons/docker-containers`).

## 🧠 Modèle mental
Le cloud, c'est **louer** de l'infrastructure à la demande au lieu de POSSÉDER des
serveurs. On paie ce qu'on consomme, on monte/descend en capacité en minutes, et
on délègue au fournisseur une part croissante de la gestion (matériel, puis
système, puis application) selon le modèle choisi. La question centrale devient :
« qu'est-ce que je gère encore, et qu'est-ce que le fournisseur gère pour moi ? »

## 📖 Explication complète
**Modèles de service — qui gère quoi.**
- **IaaS** (infrastructure) : le fournisseur gère le matériel et la
  virtualisation ; VOUS gérez l'OS, les mises à jour, l'application (ex. une
  machine virtuelle). Plus de contrôle, plus de responsabilité.
- **PaaS** (plateforme) : le fournisseur gère aussi l'OS et le runtime ; vous
  n'apportez que le CODE et la config (ex. une base managée, un service
  applicatif). Moins de contrôle, moins de charge opérationnelle.
- **SaaS** (logiciel) : tout est géré, vous CONSOMMEZ une application (ex. une
  messagerie en ligne).
Le curseur va de « je gère presque tout » (IaaS) à « je ne gère rien » (SaaS).

**Responsabilité partagée.** Règle de sécurité fondamentale : le fournisseur est
responsable de la sécurité DU cloud (matériel, infrastructure physique), le client
de la sécurité DANS le cloud (ses données, sa config, ses accès). Une base
publiquement exposée par MAUVAISE configuration est la responsabilité du CLIENT,
pas du fournisseur. La frontière se déplace selon IaaS/PaaS/SaaS, mais le client
garde TOUJOURS la responsabilité de ses données et de ses accès.

**Régions et zones de disponibilité.** Une **région** est une zone géographique
(ex. Europe) ; elle contient plusieurs **zones de disponibilité** (AZ), des
centres de données isolés mais proches. Répartir sur plusieurs AZ tolère la panne
d'un centre ; répartir sur plusieurs régions vise la proximité utilisateur et la
reprise après sinistre. Le choix de région touche aussi la **latence** et la
**conformité** (où résident les données).

**Élasticité et paiement à l'usage.** On provisionne selon le besoin du MOMENT et
on ajuste (scaling). Le modèle **pay-as-you-go** facture la consommation réelle :
puissant, mais des ressources oubliées coûtent en continu (d'où le FinOps).
L'**autoscaling** ajuste automatiquement la capacité à la charge.

**Services managés.** Le cloud vend surtout des services managés (bases, files,
équilibrage, fonctions) : on délègue l'exploitation contre un coût et une
dépendance au fournisseur (**vendor lock-in** à peser). Le bon réflexe : préférer
le managé pour ne pas réinventer, tout en connaissant les concepts sous-jacents
(ce que ce parcours enseigne) pour rester lucide et portable.

## 🔧 Repères (conceptuels, multi-fournisseurs)
- IaaS/PaaS/SaaS = curseur de responsabilité.
- Multi-AZ pour la haute disponibilité ; multi-région pour proximité/reprise.
- Pay-as-you-go = surveiller l'usage ; autoscaling = capacité suivant la charge.
- Managé = moins d'exploitation, plus de dépendance.

## 🧭 Exemple guidé — choisir un modèle pour une nouvelle app
1. Besoin de contrôle fin de l'OS ? → IaaS (VM). Sinon, réduire la charge → PaaS.
2. Haute disponibilité attendue → déployer sur plusieurs AZ derrière un équilibreur.
3. Charge variable → autoscaling + paiement à l'usage.
4. Base de données → service managé (sauvegardes, patchs délégués), en pesant le
   lock-in.

## ⚠️ Erreurs fréquentes
- Croire que « le cloud sécurise tout » (responsabilité PARTAGÉE : vos données/accès
  restent à vous).
- Déployer sur une seule AZ et s'étonner d'une panne totale.
- Laisser des ressources tourner « au cas où » → facture qui file.
- Confondre IaaS et PaaS (qui patche l'OS ?).
- Ignorer la région (latence, conformité des données).

## 🔐 Sécurité
Le client est TOUJOURS responsable de ses données, de sa configuration et de ses
identités. La plupart des incidents cloud médiatisés sont des ERREURS DE CONFIG
côté client (stockage public, accès trop larges), pas des failles du fournisseur.
La sécurité cloud se joue surtout dans le réseau (leçon suivante) et les identités
(leçons AWS/Azure).

## 🏢 Cas métier
Une startup héberge tout sur une seule VM dans une seule AZ « pour aller vite ».
Une panne du centre de données met le service à terre plusieurs heures. Migration
vers un service managé réparti sur plusieurs AZ derrière un équilibreur : la panne
d'une zone devient transparente. Le coût monte un peu, la disponibilité change de
catégorie.

## 🎤 Questions d'entretien
- « IaaS vs PaaS vs SaaS ? » → curseur de responsabilité, de « je gère l'OS » à
  « je consomme une app ».
- « Qu'est-ce que le modèle de responsabilité partagée ? » → le fournisseur
  sécurise le cloud, le client sécurise ce qu'il met DANS le cloud.
- « Région vs zone de disponibilité ? » → géographie vs centres isolés proches pour
  la haute disponibilité.

## ✍️ Mini-exercice
Une base de données est exposée publiquement par erreur de configuration. À qui
incombe la responsabilité ? → au CLIENT (sécurité DANS le cloud : sa config et ses
données).

## 🧾 À retenir
- IaaS/PaaS/SaaS = curseur de ce que VOUS gérez encore.
- Responsabilité partagée : le client garde toujours ses données, config, accès.
- Multi-AZ = haute disponibilité ; région = latence/conformité.
- Pay-as-you-go + autoscaling ; le managé réduit l'exploitation mais crée une
  dépendance.

## 📚 Vocabulaire
**IaaS / PaaS / SaaS** · **responsabilité partagée** · **région / zone de
disponibilité (AZ)** · **élasticité / autoscaling** · **pay-as-you-go** ·
**service managé** · **vendor lock-in** · **haute disponibilité**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je situe un service sur le curseur IaaS/PaaS/SaaS.
- [ ] J'explique la responsabilité partagée et ce qui reste au client.
- [ ] Je conçois pour la haute disponibilité (multi-AZ) et le coût à l'usage.

## 🔗 Liens avec le programme
Mois 11 (cloud). Leçons liées : `/doc/lessons/cloud-networking`,
`/doc/lessons/cloud-compute-storage`, `/doc/lessons/cloud-aws-core`,
`/doc/lessons/cloud-azure-core`. Ce socle est commun à AWS et Azure, déclinés
ensuite.
