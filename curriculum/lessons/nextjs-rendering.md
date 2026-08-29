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

## 🧭 Exemple guidé
Une application a trois pages. (1) La page marketing (contenu stable, à indexer) → **SSG** : générée au
build, servie instantanément. (2) La fiche produit avec stock en temps réel (fraîche, à indexer) →
**SSR** : rendue à la requête pour un HTML rempli et à jour. (3) Le tableau de bord après connexion
(privé, dynamique) → **CSR** : inutile de le pré-rendre côté serveur. Raisonnement : on choisit CHAQUE
page selon fraîcheur, référencement et interactivité — pas une seule stratégie pour tout. C'est le
type de décision que Next.js rend possible page par page.

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

## Mini-exercice
Prends trois pages réelles (une page d'accueil marketing, une page de résultats de recherche, un
tableau de bord privé). Pour chacune, choisis CSR, SSR ou SSG et JUSTIFIE en une phrase (fraîcheur,
référencement, interactivité, coût). Puis indique celle qui bénéficierait du streaming et pourquoi.
Exercice de raisonnement — aucune exécution.

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
