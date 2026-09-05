<!-- keep -->
# Leçon — FinOps : maîtriser le coût du cloud

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Dans le cloud, on ne paie pas une fois : on paie EN CONTINU, tant qu'une ressource
existe — qu'elle serve ou non. D'où la mésaventure classique : une facture qui double
sans nouveau projet, à cause de machines de test laissées allumées la nuit, de
disques oubliés, ou d'un sur-dimensionnement « pour être tranquille ». Le **FinOps**,
c'est traiter le coût comme une variable d'ingénierie : savoir QUI dépense QUOI,
ajuster la taille au besoin réel, choisir le bon mode d'achat, et poser des alertes
pour ne plus être surpris. Cette leçon part de la facture qui dérape et remonte aux
gestes qui la maîtrisent — sans jamais sacrifier la fiabilité d'un service critique.

## 🎯 Objectif
Comprendre le MODÈLE économique du cloud et comment le piloter : le **paiement à
l'usage**, le **right-sizing**, les modèles d'achat (à la demande, **réservé**,
**spot**), le **tagging** et l'allocation des coûts, les **budgets/alertes**, et le
coût des ressources **inutilisées**. Faire du coût une variable d'ingénierie, pas
une surprise en fin de mois.

## 🧩 Prérequis
Vous devez connaître les **fondamentaux cloud** (paiement à l'usage —
`/doc/lessons/cloud-fundamentals`), les options de **compute/stockage**
(`/doc/lessons/cloud-compute-storage`) et la notion de **requests/limits** de
ressources (`/doc/lessons/k8s-config-probes`), car le right-sizing consiste à ajuster
ces ressources au besoin réel mesuré.

## 🧠 Modèle mental
Dans le cloud, chaque ressource qui existe COÛTE, qu'elle serve ou non. Le coût
n'est plus un achat ponctuel mais un FLUX continu proportionnel à la consommation.
Le FinOps, c'est boucler en continu : **VISIBILITÉ** (qui dépense quoi) →
**OPTIMISATION** (ajuster, éteindre, mieux acheter) → **GOUVERNANCE** (budgets,
alertes, responsabilisation). L'ingénieur qui comprend ça conçoit des
architectures à la fois performantes ET économes.

## 📖 Explication complète
**Le modèle de coût.** On paie le compute (durée × taille), le stockage (volume ×
durée + accès), le réseau (souvent la **sortie de données** / egress, sous-estimée),
et chaque service managé selon sa tarification. Conséquence directe : une
ressource oubliée facture 24 h/24.

**Right-sizing.** Adapter la taille à l'usage RÉEL. Sur-provisionner « pour être
tranquille » gaspille ; sous-provisionner dégrade le service. On mesure
l'utilisation (CPU, mémoire — cf. requests/limits K8s et ressources Linux) et on
ajuste. L'autoscaling right-size dans le TEMPS (suivre la charge, descendre la
nuit).

**Modèles d'achat.**
- **À la demande** : flexible, le plus cher à l'unité ; pour la charge variable/
  imprévisible.
- **Réservé / engagement** : remise importante contre un ENGAGEMENT (1-3 ans) sur
  une capacité de base stable et prévisible.
- **Spot / capacité excédentaire** : très bon marché mais INTERRUPTIBLE à tout
  moment ; pour des charges tolérantes aux interruptions (batch, calcul, workers
  sans état). Ne PAS y mettre une base critique.
On combine : réservé pour le socle, à la demande pour les pics, spot pour le
tolérant.

**Tagging et allocation.** Étiqueter les ressources (équipe, projet,
environnement) permet de SAVOIR qui dépense quoi et de responsabiliser. Sans
tagging, la facture est un bloc opaque ; avec, on cible les optimisations.

**Budgets et alertes.** Définir des budgets et des **alertes** de dépassement
transforme la surprise en signal précoce. On surveille aussi les anomalies (un pic
soudain = ressource oubliée, boucle, ou fuite).

**Les gisements classiques.** Ressources arrêtées mais toujours facturées
(disques/IP orphelins), environnements de test laissés allumés la nuit/le
week-end, stockage jamais nettoyé, sur-dimensionnement systématique, coûts d'egress
non anticipés. Ce sont les premières cibles.

**Coût vs valeur.** Le but n'est pas de dépenser LE MOINS, mais de dépenser JUSTE :
un service critique mérite sa redondance. Le FinOps arbitre coût/performance/
fiabilité en connaissance de cause.

## 🔧 Repères (démarche, multi-fournisseurs)
```
1. VISIBILITÉ  : tagging + rapport de coûts par équipe/projet.
2. OPTIMISATION: right-sizing, éteindre le non-prod hors heures, nettoyer les
                 orphelins, choisir réservé/spot selon le profil.
3. GOUVERNANCE : budgets + alertes + revue régulière des anomalies.
```

## 🧭 Exemple guidé — une facture à 1 885 €, et par où commencer

La direction financière transmet la facture cloud du mois avec une phrase :
« il faut réduire ». Voici le détail réel, poste par poste. Les tarifs unitaires sont
**illustratifs et à revérifier chez ton fournisseur** — ils changent souvent — mais
l'arithmétique, elle, est exacte et reproductible
(`scripts/v70-verifications/finops-facture.mjs`).

| poste | montant |
|---|---:|
| 4 machines de production (4 vCPU) | 467 € |
| 3 machines de recette, allumées 24 h/24 | 350 € |
| **transfert de données sortant, 3 To** | **270 €** |
| base managée de production (multi-zone) | 248 € |
| base managée de **recette** (multi-zone) | 248 € |
| 12 disques non attachés à quoi que ce soit | 120 € |
| 2 machines de développement, allumées 24 h/24 | 117 € |
| stockage objet, 2 To | 46 € |
| 5 adresses IP réservées et inutilisées | 18 € |
| **total** | **1 885 €** |

Si tu additionnes la colonne à la main, tu trouves **1 884 €**, pas 1 885. Ce n'est pas
une coquille : chaque ligne est arrondie à l'euro pour être lisible, alors que le total
est calculé sur les montants exacts (1 884,80 €). **Une facture cloud réelle fait
exactement cela**, et c'est une source classique de conversations pénibles avec la
comptabilité. Retiens la règle : on additionne les montants exacts, puis on arrondit —
jamais l'inverse.

### Le réflexe qu'il faut réprimer

La réaction naturelle est d'attaquer le plus gros poste : les machines de production.
C'est le pire endroit par lequel commencer, pour une raison simple — **c'est le seul
poste qui rend un service à des utilisateurs.** Réduire là, c'est acheter des économies
avec du risque.

L'ordre utile est l'inverse : commencer par ce qui **ne sert à personne**, puis ce qui
sert **à temps partiel**, et ne toucher à la production qu'en dernier, avec des mesures.

### Premier geste — ce qui ne sert à personne : 138 €

Douze disques non attachés et cinq adresses IP réservées. Personne ne s'en sert,
personne ne les a supprimés, et ils sont facturés tous les mois depuis qu'ils existent.

Ces objets ont presque toujours la même origine : on supprime une machine virtuelle,
et son disque **survit** — c'est même souvent le comportement par défaut, pensé pour
éviter les pertes de données accidentelles. Sur des mois, ça s'accumule en silence.

138 € sur 1 885 font **7 %**. Ce n'est pas spectaculaire. Mais c'est du gain à risque
strictement nul, obtenu en une heure, et c'est ce qui achète la crédibilité pour la
suite de la conversation.

### Deuxième geste — ce qui ne sert pas la nuit : 273 €

Les environnements de recette et de développement tournent 24 heures sur 24. Ils sont
utilisés pendant les heures de bureau. Ces sept machines coûtent 350 + 117 = **467 €**
par mois ; les éteindre 14 heures sur 24 en supprime les 14/24, soit
**273 €, ou 14 % de la facture** — plus que le geste précédent, pour un risque qui
reste faible.

Le seul vrai coût est humain : il faut que ces environnements se rallument sans
friction, sinon l'équipe les rallumera « juste pour aujourd'hui » et ne les éteindra
plus. **Une mesure d'économie qui ajoute une corvée quotidienne est abandonnée en trois
semaines** — c'est pour cela qu'on l'automatise plutôt que de compter sur la discipline.

### Troisième geste — l'assurance qu'on paie deux fois : 124 €

La base de **recette** est déployée en multi-zone, comme celle de production. C'est
248 € pour garantir la haute disponibilité d'un environnement… de test.

Passer la recette en zone unique économise 124 €. Ici il faut être précis, parce que
c'est le genre de décision qu'on prend mal : on ne dégrade pas la production, on cesse
de payer une assurance pour quelque chose dont l'indisponibilité coûte, au pire, une
demi-journée de gêne à l'équipe.

### Le poste que personne ne regarde : 270 €

Le **transfert sortant** est le troisième poste de la facture, et il est presque
toujours invisible dans les discussions d'optimisation — parce qu'il n'apparaît nulle
part comme un objet qu'on pourrait éteindre. Il n'y a pas de bouton « transfert ».

Il faut donc chercher **ce qui l'engendre** : des images servies directement depuis le
stockage au lieu de passer par un réseau de diffusion, une sauvegarde recopiée chaque
nuit vers une autre région, des journaux exportés en continu vers un service externe,
ou du trafic entre zones qu'on croyait gratuit. Chacune de ces causes se corrige
différemment, et aucune ne se voit sur la liste des machines.

### Le bilan, et ce qu'il faut en retenir

**138 + 273 + 124 = 535 € sur 1 885, soit 28 %, sans toucher à la production.** Trois gestes, aucun
risque pour les utilisateurs.

La leçon générale dépasse le cloud : dans presque tout système facturé à l'usage, une
part importante de la dépense ne produit **aucune valeur** — elle produit de l'oubli.
Et l'ordre d'attaque est toujours le même : **l'inutilisé, puis l'utilisé à temps
partiel, puis le surdimensionné, et seulement ensuite l'essentiel.**

Une dernière chose, qui distingue un travail sérieux d'un coup ponctuel : sans budget
ni alerte, la facture remonte. Les disques orphelins réapparaîtront, les environnements
resteront allumés « exceptionnellement ». **Une économie qui n'est pas surveillée est
un gain qu'on refera l'an prochain.**

## ⚠️ Erreurs fréquentes
- Laisser des ressources **inutilisées** allumées (elles facturent en continu).
- **Sur-provisionner** systématiquement « pour être tranquille ».
- Mettre une charge critique sur du **spot** (interruptible).
- Ignorer les coûts de **sortie de données** (egress).
- Pas de **tagging** → facture opaque, optimisation impossible.
- Optimiser au point de fragiliser un service critique (coût ≠ seul critère).

## 🔐 Sécurité
Un pic de coût inattendu peut RÉVÉLER un incident de sécurité (ressources créées
par un attaquant, minage). Les alertes de budget sont aussi un signal de sécurité.
Le tagging et la gouvernance limitent les ressources non autorisées. Ne pas
désactiver la journalisation pour « économiser » : l'audit est indispensable.

## 🏢 Cas métier
Une facture double en un mois sans nouveau projet. Le tagging révèle des
environnements de test allumés 24/7 et des disques orphelins de VMs supprimées.
Extinction du non-prod hors heures, nettoyage des orphelins, engagement réservé
sur le socle de production : la facture revient sous le niveau initial, sans
toucher aux services critiques.

## 🎤 Questions d'entretien
- « À la demande vs réservé vs spot ? » → flexible/cher vs engagement/remise vs
  bon marché/interruptible.
- « Qu'est-ce que le right-sizing ? » → ajuster la taille à l'usage réel (mesuré).
- « Premières cibles pour réduire une facture ? » → orphelins, non-prod hors
  heures, sur-dimensionnement, egress.

## ✍️ Mini-exercice — le plan de réduction, avec ses risques

**Contexte.** Une facture mensuelle de 4 200 €, répartie ainsi :

| poste | montant |
|---|---:|
| 8 machines de production | 1 400 € |
| 1 base managée de production (multi-zone) | 620 € |
| transfert sortant | 590 € |
| 6 machines de recette (24 h/24) | 540 € |
| stockage objet, 14 To dont 11 To jamais lus depuis 8 mois | 380 € |
| 1 cluster d'analytique allumé en permanence, utilisé 4 h par semaine | 340 € |
| 23 instantanés de disque, le plus ancien a 3 ans | 210 € |
| 9 adresses IP réservées, 3 utilisées | 120 € |

**Ce que tu produis.** Un plan en trois vagues :

- **vague 1 — risque nul** : ce que tu supprimes sans demander l'avis de personne ;
- **vague 2 — risque faible** : ce que tu modifies après avoir prévenu l'équipe ;
- **vague 3 — à instruire** : ce qui demande une mesure ou une décision métier avant
  d'y toucher.

Pour **chaque ligne** de ton plan : le montant économisé, **qui est gêné et comment**,
et **la mesure ou la vérification** à faire avant d'agir. Une ligne sans « qui est
gêné » est incomplète, même si l'économie est réelle.

**Livrable.** Le plan chiffré, plus un total par vague et un total général en euros
et en pourcentage.

**Critère de réussite.** Deux vérifications que tu fais seul : (1) la somme de tes
trois vagues est inférieure au total de la facture — si tu obtiens plus de 100 %, tu
as compté deux fois quelque part ; (2) **aucune ligne de la vague 1 ne concerne la
production**. Si c'est le cas, c'est que tu as classé selon le montant et non selon le
risque.

**Piège.** Deux des huit postes ont l'air d'être du gaspillage évident et n'en sont
pas nécessairement. Trouve-les et explique ce qu'il faut vérifier avant de les
toucher.

## ✅ Correction attendue

**La démarche.** On ne classe jamais par montant décroissant — on classe par **risque
croissant**. La question qui trie chaque ligne est toujours la même : *si je supprime
ceci et que je me trompe, qui s'en aperçoit, et en combien de temps ?*

**Vague 1 — risque nul, environ 810 €.** Les 6 adresses IP inutilisées (80 €) : rien
ne s'y connecte, la suppression est immédiate. Le cluster d'analytique éteint en dehors
de ses 4 heures (environ 320 € si l'on garde une marge confortable) : personne n'est
gêné si le rallumage est automatisé. Les 11 To de stockage jamais lus depuis 8 mois
**déplacés vers une classe d'archivage** — et non supprimés, voir plus bas (environ
280 €). Les instantanés de plus de 12 mois (environ 130 €), après vérification qu'aucune
obligation de conservation ne s'y applique.

**Vague 2 — risque faible, environ 380 €.** Les machines de recette éteintes la nuit et
le week-end. Qui est gêné : l'équipe, si le rallumage prend plus de deux minutes ou
n'est pas automatique. Vérification préalable : quelqu'un travaille-t-il réellement le
soir ou le week-end sur ces environnements ? La réponse se lit dans les journaux de
connexion, pas dans les suppositions.

**Vague 3 — à instruire.** Le transfert sortant (590 €) : il faut d'abord **savoir ce
qui sort**, sinon on optimise à l'aveugle. La base de production en multi-zone (620 €) :
c'est une assurance de production, on n'y touche pas sans une décision explicite sur
le coût d'une interruption. Les 8 machines de production : on ne les réduit qu'après
avoir mesuré leur utilisation réelle sur plusieurs semaines, jours de pointe compris.

**Les deux pièges de l'énoncé.**

*Les 11 To jamais lus.* Le réflexe est de supprimer. Mais « jamais lu depuis 8 mois »
ne signifie pas « inutile » : il peut s'agir d'archives légales, de sauvegardes, ou de
données dont l'obligation de conservation est de plusieurs années. Le bon geste n'est
pas la suppression mais le **changement de classe de stockage** — l'archivage coûte une
fraction du stockage courant, au prix d'un délai de restauration. On garde la donnée et
on divise son coût. Supprimer d'abord et découvrir ensuite qu'un service juridique en
avait besoin est une erreur qu'on ne rattrape pas.

*Les 23 instantanés.* Même raisonnement, avec une nuance qui compte : un instantané
peut être le **dernier point de restauration connu** d'un système qui n'existe plus.
Vérifier ce que chacun contient avant de supprimer, et conserver au moins le plus
récent de chaque système.

**L'erreur probable, et elle est de méthode.** Beaucoup produisent une liste
d'économies sans colonne « qui est gêné ». Le plan paraît excellent, il est adopté, et
il se retourne : l'équipe découvre que la recette est éteinte quand elle en a besoin,
ou qu'un instantané indispensable a disparu. **Une économie dont on n'a pas nommé la
victime finira par en trouver une.**

**Comment reconnaître ce type de problème ailleurs.** Le raisonnement s'applique à toute
optimisation de coût — licences logicielles, abonnements, capacité serveur. L'ordre
« inutilisé, temps partiel, surdimensionné, essentiel » et la colonne « qui est gêné »
sont transposables tels quels.

**Quand la réponse changerait.** Sur un service en croissance rapide, l'ordre s'inverse
partiellement : le transfert sortant et le stockage, qui croissent avec les usages,
deviennent prioritaires sur les orphelins, parce qu'ils vont **empirer** pendant que les
orphelins, eux, restent stables. Optimiser un système qui grandit, c'est s'occuper des
pentes plus que des montants.

## 🧾 À retenir
- Chaque ressource facture tant qu'elle existe ; le coût est un flux continu.
- Boucle FinOps : visibilité (tagging) → optimisation (right-size, spot/réservé,
  extinction) → gouvernance (budgets/alertes).
- Spot = interruptible (jamais pour le critique) ; egress souvent oublié.
- Dépenser JUSTE, pas le moins ; un pic de coût peut signaler un incident.

## 📚 Vocabulaire
**pay-as-you-go** · **right-sizing** · **à la demande / réservé / spot** ·
**egress (sortie de données)** · **tagging / allocation** · **budget / alerte** ·
**ressource orpheline** · **coût vs valeur**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'explique le modèle de coût et le flux continu.
- [ ] Je choisis le modèle d'achat selon le profil de charge.
- [ ] Je mets en place tagging, budgets et chasse aux gaspillages.

## 🔗 Liens avec le programme
Mois 11 (cloud, exploitation). Leçons liées :
`/doc/lessons/cloud-compute-storage`, `/doc/lessons/k8s-config-probes`,
`/doc/lessons/linux-resources-io`. Le right-sizing relie le FinOps aux ressources
Linux et aux requests/limits Kubernetes.
