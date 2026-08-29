<!-- keep -->
# Leçon — Cloud : concepts fondamentaux

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Pour héberger une application, il fallait autrefois **acheter des serveurs** et les
installer dans une salle (un « datacenter »). Cher, lent, risqué : trop de machines
si le trafic baisse, pas assez s'il explose. Le **cloud** renverse ça : au lieu de
POSSÉDER des serveurs, on en **loue** à la demande, à la minute, chez un fournisseur
qui gère les machines physiques à votre place. On peut en ajouter en quelques minutes
et ne payer que ce qu'on consomme. Mais cette facilité crée de nouvelles questions :
qu'est-ce que je gère encore, et qu'est-ce que le fournisseur gère ? qui est
responsable de la sécurité ? Cette leçon pose ce socle — datacenter, virtualisation,
régions, « louer au lieu de posséder » — commun à AWS comme à Azure, avant d'entrer
dans les détails d'un fournisseur.

## 🎯 Objectif
Poser le socle commun À TOUS les fournisseurs cloud : les **modèles de service**
(IaaS/PaaS/SaaS), le **modèle de responsabilité partagée**, **régions** et **zones
de disponibilité**, l'**élasticité** et le **paiement à l'usage**, les **services
managés**. Le vocabulaire et les modèles mentaux avant AWS ou Azure.

## 🧩 Prérequis
Vous devez avoir une idée de ce qu'est une **adresse réseau**
(`/doc/lessons/networking-addressing-routing`) et un **conteneur**
(`/doc/lessons/docker-containers`), car le cloud héberge surtout des machines et des
conteneurs mis en réseau. Aucune notion cloud (IaaS, région, responsabilité
partagée) n'est supposée : on part du datacenter physique.

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

## 🧭 Exemple guidé — une migration, et les quatre questions qu'elle pose

Ton API de bibliothèque tourne sur une machine louée chez un hébergeur classique :
un serveur, une base PostgreSQL installée dessus, des sauvegardes que tu lances à la
main. On te demande de « passer sur le cloud ». Ce n'est pas une opération technique,
c'est une **suite de choix de responsabilité** — et c'est ce que la leçon veut te faire
voir.

### Première question : que veux-tu continuer à gérer ?

Deux options, et la mauvaise façon de choisir est de regarder le prix affiché.

**Option IaaS** — tu loues une machine virtuelle et tu réinstalles tout dessus. Tu
retrouves exactement ton environnement actuel. C'est rassurant, et c'est souvent le
bon choix quand ton application a une exigence particulière : une version précise du
système, une bibliothèque système exotique, un logiciel qui doit tourner en
permanence en tâche de fond.

**Option PaaS** — tu fournis ton code, le fournisseur s'occupe du système, du runtime
et des mises à jour de sécurité. Tu perds l'accès à la machine.

Le point à comprendre, c'est **ce que tu échanges**. En IaaS, la mise à jour de
sécurité du noyau Linux reste ton travail — et il faut la faire, sinon la machine
finit vulnérable. En PaaS, elle disparaît de ta liste, mais le jour où le fournisseur
force une montée de version de runtime, tu subis son calendrier.

La question utile n'est donc pas « lequel est le mieux ? » mais : **ai-je quelqu'un
pour faire ce travail d'exploitation, chaque semaine, indéfiniment ?** Une équipe de
deux personnes qui répond non doit aller vers le PaaS, même si l'IaaS paraît moins
cher sur la facture — parce que l'écart de prix achète du temps humain qu'elle n'a pas.

### Deuxième question : une zone ou plusieurs ?

Une **région** est une zone géographique. Elle contient plusieurs **zones de
disponibilité** — des centres de données distincts, avec leur propre alimentation
électrique et leur propre refroidissement, reliés entre eux par un réseau rapide.

Sur une seule zone, ton service tombe quand ce centre tombe. Sur deux zones derrière
un répartiteur de charge, la panne d'un centre devient invisible pour l'utilisateur.

C'est le calcul qu'il faut poser explicitement, parce qu'il n'a pas de réponse
universelle. Doubler les serveurs applicatifs coûte à peu près le double. Que vaut,
pour ton service, une interruption de quatre heures ? Sur un outil interne utilisé
par douze personnes, probablement moins que le surcoût. Sur une boutique en ligne un
samedi, beaucoup plus. **Le multi-zone n'est pas une bonne pratique à appliquer par
principe : c'est un achat d'assurance dont il faut connaître la prime.**

Un point technique qui surprend souvent : le transfert de données **entre** zones
est généralement facturé, alors qu'à l'intérieur d'une zone il ne l'est pas. Une
application bavarde répartie sans réflexion peut voir sa facture réseau grimper sans
que rien d'autre n'ait changé.

### Troisième question : la base de données

C'est là que la décision est la plus tranchée. Une base managée coûte plus cher à
l'heure qu'une base installée sur ta propre machine. En échange, le fournisseur
assure les sauvegardes, la restauration à un instant donné, les correctifs de
sécurité et le basculement automatique en cas de panne.

Pose-toi une seule question, et réponds honnêtement : **as-tu déjà testé une
restauration de sauvegarde ?** Beaucoup d'équipes ont des sauvegardes ; peu ont vérifié
qu'elles se restaurent. Une sauvegarde jamais restaurée n'est pas une sauvegarde,
c'est une intention.

Le prix à payer s'appelle la **dépendance au fournisseur** — le fait qu'une base
managée s'accompagne d'outils, de formats d'export et d'habitudes qui rendent le
départ coûteux. Ce n'est pas une raison de refuser le managé ; c'est une raison de
savoir, dès le début, comment tu ferais pour en sortir.

### Quatrième question, celle que personne ne pose : qu'est-ce qui reste à toi ?

Le fournisseur sécurise **le** cloud : les bâtiments, les machines physiques, la
couche de virtualisation. Tu sécurises ce que tu mets **dans** le cloud : tes données,
ta configuration, tes accès.

Cette frontière se déplace selon le modèle — en PaaS, le fournisseur reprend le
système d'exploitation — mais **une part ne se délègue jamais** : tes données, ta
configuration, tes identités.

C'est pour cette raison qu'un espace de stockage rendu public par erreur de
configuration est ta responsabilité, entièrement, même si le fichier est physiquement
sur une machine que tu n'as jamais vue. Et c'est aussi pourquoi la majorité des fuites
de données cloud largement médiatisées ne sont pas des failles des fournisseurs, mais
des configurations trop permissives côté client.

### Ce que la migration a réellement changé

Tu n'as pas « déplacé une application ». Tu as **transféré une partie de ton travail
d'exploitation** contre de l'argent et une dépendance, et tu as gardé la totalité de
la responsabilité de tes données. Un dirigeant qui te demande « alors, on est sur le
cloud ? » attend une réponse en ces termes-là — pas une liste de services activés.

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

## ✍️ Mini-exercice — écrire la fiche de décision d'une migration

**Contexte.** Une association de 6 salariés gère un service de réservation de salles.
Environ 400 utilisateurs, essentiellement en semaine entre 8 h et 19 h. Une personne
s'occupe de l'informatique, à mi-temps. Le service tourne aujourd'hui sur un serveur
loué, avec une base PostgreSQL installée dessus. Budget : « raisonnable », à justifier
devant un conseil d'administration non technique.

**Ce que tu produis** — une fiche d'une page, en français, contenant exactement :

1. Le **modèle de service retenu** pour l'application (IaaS ou PaaS), avec la
   contrainte de l'énoncé qui te fait trancher — pas un argument général.
2. Le choix **une zone ou plusieurs**, avec ta réponse chiffrée ou raisonnée à :
   *que coûte à cette association une interruption de quatre heures un mardi ?*
3. Le choix **base managée ou auto-hébergée**, avec la conséquence concrète pour la
   personne à mi-temps.
4. La liste de **ce qui reste sous ta responsabilité** après la migration : au moins
   quatre éléments précis.
5. Une phrase de **sortie** : si l'association devait quitter ce fournisseur dans
   trois ans, qu'est-ce qui serait difficile ?

**Contraintes.** Aucun nom de produit commercial n'est demandé — on raisonne en
modèles, pas en marques. Chaque décision doit tenir en trois à cinq lignes et citer la
contrainte de l'énoncé qui la justifie.

**Critère de réussite.** Fais lire ta fiche à quelqu'un qui ne connaît pas le cloud.
S'il peut dire, après lecture, *ce que l'association gagne et ce qu'elle perd*, la
fiche est bonne. S'il n'en retient qu'une liste de services, elle ne l'est pas.

**Piège.** Si tes cinq réponses seraient identiques pour une place de marché à
50 000 utilisateurs, tu as écrit des généralités, pas une décision.

## ✅ Correction attendue

**La démarche.** Les quatre décisions se prennent dans cet ordre, parce que chacune
contraint la suivante : d'abord *qui exploite*, ensuite *quelle disponibilité on
achète*, ensuite *où vivent les données*, et seulement à la fin *ce qui reste à moi*.
Commencer par la fin — « quelle offre prendre ? » — mène à recopier une architecture
lue ailleurs, conçue pour d'autres contraintes.

**Décision 1 — le modèle.** La contrainte qui tranche est dans l'énoncé : *une
personne à mi-temps*. Le PaaS l'emporte, non parce qu'il serait supérieur, mais parce
que l'IaaS ajoute une charge d'exploitation hebdomadaire — correctifs système,
surveillance, redémarrages — que ce mi-temps ne pourra pas tenir douze mois. Si tu as
répondu IaaS, ta justification doit expliquer **qui** appliquera les correctifs de
sécurité et **quand**. Sans cette réponse, le choix est un report de problème.

**Décision 2 — la disponibilité.** Réponse défendable : **une seule zone**. C'est
souvent contre-intuitif pour qui a retenu « multi-zone = bonne pratique ». Le
raisonnement : le service est utilisé en semaine, de 8 h à 19 h, par 400 personnes qui
réservent des salles. Une interruption de quatre heures est gênante et se rattrape par
téléphone ou par courriel. Le multi-zone double une partie de la facture pour éliminer
un risque dont le coût réel est faible. **Une bonne pratique appliquée sans son calcul
de coût est une dépense, pas une décision.**

La réponse inverse se défend aussi, à une condition : que tu aies écrit ce que coûte
l'interruption. C'est l'écriture du calcul qui est notée, pas le camp choisi.

**Décision 3 — la base.** **Managée**, et l'argument n'est pas la performance : c'est
la restauration. Une personne à mi-temps qui doit restaurer une base à 22 h un
vendredi, sans l'avoir jamais fait, est une situation à éviter par construction. Le
surcoût mensuel achète une procédure testée par quelqu'un d'autre.

**Décision 4 — ce qui reste à toi.** Attendu, au moins : les **données** elles-mêmes
et leur conformité ; la **configuration** des droits d'accès (qui peut lire quoi) ;
les **identités** — comptes, mots de passe, clés d'API ; le **code applicatif** et ses
propres failles ; et le **contenu** des sauvegardes, dont personne d'autre ne vérifiera
qu'il correspond à ce qu'il faut restaurer.

**L'erreur probable, et elle est structurelle.** La plus fréquente n'est pas un
mauvais choix technique : c'est de croire que passer au managé transfère la
**responsabilité**. Elle transfère l'**exploitation**. Si un droit d'accès mal réglé
rend les réservations lisibles publiquement, aucun contrat de fournisseur ne te
couvre. C'est exactement ce que dit le modèle de responsabilité partagée, et c'est la
raison pour laquelle il figure dans ce cours avant les noms de services.

**Comment reconnaître ce type de problème plus tard.** Chaque fois qu'on te propose de
déléguer une brique d'infrastructure, pose les trois mêmes questions : *qu'est-ce que
je cesse de faire ? qu'est-ce que je ne pourrai plus faire ? qu'est-ce qui reste à moi
quoi qu'il arrive ?* La troisième réponse contient toujours les données, la
configuration et les identités.

**Alternative défendable.** Rester chez l'hébergeur actuel. Si le service fonctionne,
que la personne à mi-temps maîtrise son environnement et qu'aucune contrainte de
croissance ne se profile, migrer coûte du temps et de l'apprentissage pour un bénéfice
faible. « Ne pas migrer » est une décision légitime — à condition, là aussi, d'être
écrite et argumentée plutôt que subie.

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
