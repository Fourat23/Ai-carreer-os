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

## 🧭 Exemple guidé — réduire une facture qui dérape
1. Tagger et attribuer : d'où vient la dépense ? (équipe, service, environnement.)
2. Chasser les **orphelins** (disques/IP non attachés) et éteindre le non-prod la
   nuit.
3. Right-sizer les ressources sur-dimensionnées (mesurer avant).
4. Basculer le socle stable en **réservé**, le batch tolérant en **spot**.
5. Poser budgets + alertes pour éviter la rechute.

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

## ✍️ Mini-exercice
Vous avez une charge batch tolérante aux interruptions à exécuter la nuit. Quel
modèle d'achat ? → spot / capacité excédentaire (bon marché, interruptible — adapté
au tolérant, pas à une base critique).

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
