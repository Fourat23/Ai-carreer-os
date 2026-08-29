<!-- keep -->
# Leçon — Rendu web : CSR, SSR, SSG et streaming

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Une application React « classique » envoie au navigateur une page presque vide + un gros paquet de
JavaScript ; l'écran reste blanc tant que ce JS n'est pas téléchargé et exécuté. Sur mobile ou réseau
lent, l'utilisateur attend, et un moteur de recherche voit… une page vide. Pourtant, pour un blog ou
une fiche produit, le contenu pourrait être prêt AVANT même que le JavaScript arrive. Le problème :
QUAND et OÙ la page est-elle fabriquée ? Il n'existe pas une seule réponse, mais plusieurs
**stratégies de rendu**. Cette leçon te donne le modèle pour les distinguer et choisir.

## 🎯 Objectif
Comprendre, au niveau conceptuel, les grandes stratégies de rendu — **CSR** (côté client), **SSR**
(côté serveur à la requête), **SSG** (généré à la construction) et le **streaming** — savoir ce que
chacune optimise (vitesse d'affichage, référencement, fraîcheur des données, charge serveur), et
choisir la bonne selon le type de contenu. Sans mémoriser d'API : le raisonnement d'abord.

## 🧩 Prérequis
Tu dois savoir pourquoi un framework s'ajoute à React (`/doc/lessons/nextjs-foundations`), comprendre
le DOM et le rendu navigateur (`/doc/lessons/browser-dom-rendering`), la performance frontend
(`/doc/lessons/frontend-performance`) et HTTP (`/doc/lessons/http-rest-json`). Aucune API Next.js
précise n'est requise.

## 🧠 Modèle mental
Une page HTML peut être fabriquée à trois MOMENTS différents et à deux ENDROITS. L'endroit : le
**serveur** (avant l'arrivée dans le navigateur) ou le **navigateur** (après). Le moment : à la
**construction** (une fois, au déploiement), à chaque **requête** (à la volée), ou **après** le
chargement (côté client). Chaque stratégie est une combinaison de ces choix, avec un compromis :
plus tôt/plus près du serveur = affichage rapide et bon référencement ; plus tard/côté client =
interactif et personnalisé, mais écran initial plus lent. « Quel contenu, pour qui, à quel point
frais ? » guide le choix.

## 💡 Pourquoi c'est important
Le rendu détermine la performance perçue (temps avant de voir le contenu), le référencement
(le contenu est-il présent dans le HTML initial ?), la fraîcheur (données à jour ?) et le coût
serveur. Choisir la mauvaise stratégie, c'est un site lent, mal indexé, ou un serveur surchargé.
Savoir raisonner ces compromis — indépendamment de la version du framework — est une compétence
directement attendue d'un frontend qui vise la production.

## Explication complète

### CSR — Client-Side Rendering
Le serveur envoie une page quasi vide + le JavaScript ; le navigateur construit l'interface. Avantage :
très interactif, idéal pour des écrans privés et dynamiques (tableau de bord après connexion).
Inconvénient : écran blanc initial, référencement faible (le contenu n'est pas dans le HTML de
départ). C'est le comportement d'une application React « nue ».

### SSR — Server-Side Rendering (à la requête)
À CHAQUE requête, le serveur exécute le React et renvoie un HTML DÉJÀ REMPLI ; le navigateur l'affiche
tout de suite, puis « réveille » l'interactivité (hydratation). Avantage : contenu visible vite,
bon référencement, données fraîches à chaque visite. Inconvénient : travail serveur à chaque requête
(coût, latence). Idéal pour des pages dépendantes de la requête (résultats personnalisés, données très
fraîches).

### SSG — Static Site Generation (à la construction)
La page est générée UNE FOIS, au moment du build (déploiement), en fichiers statiques servis très
vite. Avantage : ultra-rapide, très peu coûteux, excellent référencement. Inconvénient : le contenu
est figé jusqu'au prochain build (on ajoute souvent une *revalidation* périodique pour rafraîchir).
Idéal pour du contenu stable (blog, documentation, pages marketing).

### Hydratation et streaming
Le HTML rendu côté serveur est « mort » tant que le JavaScript ne l'a pas **hydraté** (rattaché les
gestionnaires d'événements). Le **streaming** améliore l'attente : le serveur envoie l'HTML par
MORCEAUX au fur et à mesure qu'il est prêt (l'en-tête et le contenu principal d'abord, une section
lente ensuite), au lieu d'attendre que toute la page soit prête. L'utilisateur voit le contenu
important plus tôt.

### Choisir (l'essentiel)
- Contenu stable, public, à indexer → **SSG** (+ revalidation si besoin de fraîcheur).
- Contenu dépendant de la requête, très frais, à indexer → **SSR**.
- Écran privé, très interactif, sans enjeu de référencement → **CSR**.
Beaucoup d'applications MÉLANGENT ces stratégies page par page. Le bon réflexe : partir du besoin du
contenu, pas d'un dogme.

## Concepts clés
Endroit (serveur/navigateur) × moment (build/requête/après) · **CSR** · **SSR** · **SSG** ·
revalidation · **hydratation** · **streaming** · compromis vitesse/référencement/fraîcheur/coût.

## 🧭 Exemple guidé — les trois questions, et le piège de la fiche produit

Trois pages, trois stratégies de rendu. Le tableau de correspondance est facile à
retenir et il ne dit pas comment on décide. Voici les questions qui décident, dans
l'ordre où elles éliminent des options.

### Question 1 — un moteur de recherche doit-il lire cette page ?

C'est la question la plus tranchante, parce qu'elle **élimine** une option au lieu de
la classer.

Un robot d'indexation demande une page et lit ce qu'il reçoit. Avec un rendu
entièrement côté client, il reçoit une page presque vide et un script — le contenu
n'apparaît qu'après exécution du JavaScript. Les moteurs principaux savent aujourd'hui
exécuter du JavaScript, mais plus lentement et moins systématiquement.

Donc : **page à indexer → le HTML doit contenir le contenu**. Cela élimine le rendu
côté client, et il ne reste qu'à choisir *quand* le HTML est fabriqué.

La page marketing et la fiche produit passent ce filtre. Le tableau de bord privé, non
— personne ne l'indexera jamais, il est derrière une authentification.

### Question 2 — le contenu peut-il être fabriqué à l'avance ?

Formulée autrement, et c'est la formulation utile : **entre le moment où on fabrique la
page et le moment où quelqu'un la lit, le contenu peut-il changer ?**

La page marketing : non. Elle change quand on la modifie, c'est-à-dire au déploiement.
On peut donc la générer **une fois, au build**, et servir un fichier statique. C'est la
solution la plus rapide et la moins chère — pas de calcul par visiteur.

La fiche produit : oui, le stock bouge. D'où le réflexe « rendu à la requête ».

### Le piège de la fiche produit

C'est ici que le tableau de correspondance induit en erreur. « Stock en temps réel donc
rendu serveur à chaque requête » fait payer un calcul complet **à chaque visiteur**,
pour une page dont 95 % du contenu — nom, description, photos, prix — ne change presque
jamais. Seul le stock est volatil.

La bonne question n'est pas « la page est-elle dynamique ? » mais : **quelle *partie*
est dynamique, et à quelle fréquence ?**

Trois réponses possibles, du meilleur au moins bon selon le cas :

- **régénération périodique** : la page est statique, mais reconstruite automatiquement
  toutes les N secondes. Le stock a jusqu'à N secondes de retard. Si N vaut 60, est-ce
  grave ? Pour la plupart des commerces, non — et on garde la vitesse du statique.
- **statique + une requête client pour le stock seul** : la page arrive instantanément
  et complète pour l'indexation, et le seul chiffre volatil se met à jour ensuite.
- **rendu à la requête**, si le stock doit être exact à la seconde — un système de
  réservation de places, par exemple, où afficher un siège libre qui ne l'est plus a un
  coût réel.

**La décision ne se prend pas sur la technologie, elle se prend sur la question :
quel retard est acceptable ?** Et cette question-là n'est pas technique : elle se pose
au métier.

### Question 3 — que coûte chaque choix quand ça marche mal ?

Souvent oubliée, et elle départage les cas limites.

Le statique **survit à une panne de base de données** : les pages sont déjà fabriquées.
Le rendu à la requête, non — si la base tombe, chaque page tombe.

Le rendu à la requête **coûte du calcul serveur proportionnel au trafic**. Une page
d'accueil statique encaisse un pic de trafic sans rien faire ; la même en rendu serveur
demande de dimensionner pour le pic.

### Le tableau de bord privé

Rendu côté client, et pour une raison qui n'est pas celle qu'on donne d'habitude. Ce
n'est pas « parce qu'il est dynamique » : c'est parce qu'il est **personnel**. Le
pré-rendre côté serveur n'apporte rien — le contenu diffère pour chaque utilisateur,
il n'y a rien à mettre en cache ni à indexer — et cela consomme du calcul serveur pour
un gain nul.

### Ce qu'il faut retenir de la démarche

Trois questions, dans l'ordre : **indexation** (élimine), **fraîcheur acceptable**
(choisit), **coût en panne et en charge** (départage). Et une règle qui vaut au-delà de
ce framework : le choix se fait **par page**, parfois **par morceau de page**, jamais
une fois pour toute l'application.

## ⚠️ Erreurs fréquentes
- Croire qu'une seule stratégie convient à toute l'application : on mélange selon le contenu.
- Penser que « rendu serveur = pas de React » : le serveur EXÉCUTE du React pour produire le HTML.
- Oublier l'hydratation : un HTML serveur non hydraté n'est pas interactif.
- Utiliser CSR pour une page publique à indexer → référencement et vitesse dégradés.
- Générer en statique (SSG) un contenu qui doit être frais sans prévoir de revalidation.

## 🔗 Liens avec le programme
Cette leçon suit `/doc/lessons/nextjs-foundations` et `/doc/lessons/frontend-performance` (chargement
vs exécution, performance perçue), et prépare `/doc/lessons/nextjs-server-client-components` (qui
s'exécute où) et `/doc/lessons/nextjs-data-production` (récupérer les données selon la stratégie).

## Mini-exercice — la fiche de rendu d'un site réel

**Contexte.** Un site de petites annonces immobilières, six pages :

| page | ce qu'on sait |
|---|---|
| accueil marketing | change une fois par mois |
| liste des annonces d'une ville | nouvelles annonces plusieurs fois par jour, indexée |
| détail d'une annonce | prix et disponibilité peuvent changer, indexée, très visitée |
| résultats de recherche filtrée | combinaisons infinies de filtres |
| tableau de bord d'un annonceur | privé |
| page « mentions légales » | change une fois par an |

**Ce que tu produis.** Pour chacune des six : la stratégie choisie, **la contrainte
précise de l'énoncé qui la dicte**, et — c'est la colonne notée — **le retard maximal
acceptable sur la donnée la plus volatile de la page**, exprimé en secondes, minutes ou
jours.

Ajoute pour chaque page : *« si la base de données tombe, cette page … »*.

**Livrable.** Un tableau de six lignes × quatre colonnes.

**Critère de réussite.** Deux vérifications seul : (1) au moins une de tes six pages
doit mélanger deux stratégies — si tu as attribué une stratégie unique à chaque page,
tu es resté au tableau de correspondance ; (2) la colonne « retard acceptable » ne doit
contenir aucune case vide, y compris pour les pages que tu as jugées statiques.

**Piège.** Une des six pages ne peut être ni statique ni régénérée périodiquement, pour
une raison qui n'est ni la fraîcheur ni le référencement. Trouve laquelle.

## ✅ Correction attendue

**La démarche.** Les trois questions de l'exemple guidé, dans l'ordre : indexation,
fraîcheur acceptable, coût en panne et en charge.

**Accueil marketing.** Statique, généré au déploiement. Retard acceptable : un mois —
c'est sa fréquence de changement. En panne de base : elle s'affiche normalement, elle
ne dépend de rien.

**Mentions légales.** Statique. Retard acceptable : un an. C'est le cas le plus simple,
et il est là pour rappeler qu'une page qui ne change jamais ne mérite aucun calcul.

**Liste des annonces d'une ville.** Régénération périodique. Indexée, donc le HTML doit
contenir le contenu. Nouvelles annonces plusieurs fois par jour : un retard de 5 à
15 minutes est sans conséquence pour un acheteur qui parcourt des annonces
immobilières. En panne de base : la dernière version reste servie — un avantage réel.

**Détail d'une annonce.** C'est la page qui doit **mélanger deux stratégies**, et c'est
le point central de l'exercice. La description, les photos, la surface, l'adresse ne
changent quasiment jamais : statique avec régénération. Le prix et le statut
« disponible / sous compromis » peuvent changer : ces deux valeurs se rafraîchissent
côté client, ou justifient un délai de régénération court.

Retard acceptable : long pour la description, court pour la disponibilité. **C'est
exactement pourquoi une stratégie unique par page est le mauvais grain de décision.**

**Résultats de recherche filtrée.** **C'est le piège.** La raison n'est ni la fraîcheur
ni le référencement : c'est la **cardinalité**. Trois filtres à dix valeurs chacun font
mille combinaisons ; cinq filtres en font cent mille. On ne peut pas pré-générer ce
qu'on ne peut pas énumérer. Rendu à la requête, ou côté client. Retard acceptable :
sans objet — la page est calculée à la demande, il n'y a pas de version stockée qui
vieillit.

**Tableau de bord annonceur.** Rendu côté client. Privé, donc rien à indexer et rien à
mutualiser en cache. En panne de base : il est vide, et c'est acceptable pour une page
d'administration.

**L'erreur probable, et elle est de granularité.** Attribuer une stratégie unique à la
page de détail — presque toujours « rendu à la requête, parce que le prix change ». On
paie alors un calcul complet à chaque visiteur, sur la page la plus visitée du site,
pour maintenir à jour deux valeurs. Sur un site d'annonces, c'est la page qui concentre
le trafic : le surcoût est maximal là où il fait le plus mal.

**Les indices qui font reconnaître ce type de problème.** Trois formulations dans un
cahier des charges : *« temps réel »* — presque toujours négociable, demander en
secondes · *« beaucoup de filtres »* — élimine la pré-génération · *« page publique »* —
impose que le contenu soit dans le HTML.

**Quand la réponse changerait.** Si le site passait à un modèle d'enchères où le prix
change toutes les secondes, la page de détail basculerait entièrement en rendu à la
requête, voire en connexion permanente. **Ce n'est pas la nature de la page qui décide,
c'est la vitesse à laquelle sa donnée la plus volatile se périme.**

## 📚 Vocabulaire
**CSR** · **SSR** · **SSG** · **revalidation** · **hydratation** · **streaming** · **référencement
(SEO)** · **fraîcheur des données** · **performance perçue**.

## 🧾 À retenir
Une page se fabrique à un ENDROIT (serveur ou navigateur) et à un MOMENT (build, requête, ou après
chargement). CSR = tout dans le navigateur (interactif, mais écran initial lent et SEO faible) ;
SSR = HTML rempli à la requête (frais, indexable, coût serveur) ; SSG = généré au build (ultra-rapide,
figé sauf revalidation). L'hydratation « réveille » le HTML serveur ; le streaming envoie le contenu
par morceaux pour l'afficher plus tôt. On choisit par PAGE selon fraîcheur, référencement et
interactivité — les concepts priment sur la syntaxe.
