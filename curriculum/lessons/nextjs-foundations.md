<!-- keep -->
# Leçon — Next.js : pourquoi un framework au-dessus de React ?

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Tu sais construire une application React. Puis les vraies questions de production arrivent : comment
avoir plusieurs pages avec de vraies URL (partageables, indexables) ? Comment afficher du contenu vite
sur mobile sans attendre que tout le JavaScript se charge ? Comment récupérer des données sans exposer
une clé d'API secrète dans le navigateur ? Comment déployer tout ça proprement ? React seul ne répond
pas à ces questions : c'est une bibliothèque d'INTERFACE, pas un cadre d'application. **Next.js** est
un framework qui ajoute à React ce qui manque pour livrer une vraie application web. Cette leçon
explique QUEL problème il résout — avant toute syntaxe.

## 🎯 Objectif
Comprendre pourquoi un framework s'ajoute à React (routing, rendu côté serveur, récupération de
données sécurisée, conventions, production), et saisir le premier mécanisme structurant de Next.js :
le **routing par fichiers**. À la fin, tu sais dire ce que Next.js apporte que React seul n'a pas —
et ce qui reste du React que tu connais déjà.

## 🧩 Prérequis
Tu dois savoir construire une application React avec composants, état, hooks et gestion des vues
(`/doc/lessons/react-fundamentals`, `/doc/lessons/react-application-states`), et comprendre HTTP et la
récupération de données (`/doc/lessons/http-rest-json`, `/doc/lessons/typescript-frontend`). Aucune
connaissance préalable de Next.js n'est supposée.

## 🧠 Modèle mental
React répond à « comment décrire une interface à partir d'un état ». Next.js répond à « comment
assembler une APPLICATION autour de React » : plusieurs pages (routing), un moment et un lieu de
rendu (serveur et/ou navigateur), un accès aux données côté serveur (sans fuiter de secrets), et des
conventions de production. Le modèle clé : **tu écris toujours du React**, mais le framework décide
OÙ (serveur/navigateur) et QUAND (à la construction/à la requête) ton code s'exécute. Distingue dès
maintenant deux couches : les **concepts stables** (routing, rendu serveur/client, frontière de
confiance) et la **syntaxe** d'une version donnée du framework, qui évolue.

## 💡 Pourquoi c'est important
La quasi-totalité des offres « React » en entreprise attendent en réalité un framework (Next.js le
plus souvent) : sans routing, rendu serveur et récupération de données sécurisée, une application
React reste une démo. Comprendre le RÔLE du framework — plutôt que mémoriser ses API — te rend
capable d'apprendre n'importe quelle version, et d'expliquer en entretien pourquoi il existe. C'est le
pont entre « je sais faire des composants » et « je sais livrer une application ».

## Explication complète

### Ce que React ne fournit pas seul
React gère le rendu de composants à partir d'un état, point. Il ne dit rien sur : les URL et la
navigation entre pages, le rendu côté serveur (pour la vitesse et le référencement), la récupération
de données côté serveur (pour ne pas exposer de secrets), le découpage du code, ou le déploiement. On
peut tout assembler à la main… ou utiliser un framework qui apporte ces réponses avec des conventions
éprouvées.

### Le routing par fichiers (le mécanisme structurant)
Dans une application React « nue », tu choisis et configures une bibliothèque de routing. Next.js
adopte une **convention** : l'ARBORESCENCE DE FICHIERS EST le routing. Un fichier de page dans un
dossier donné devient automatiquement une route accessible à l'URL correspondante ; un sous-dossier
crée un sous-chemin ; un segment « dynamique » (nommé entre crochets, ex. `[id]`) capture une partie
variable de l'URL. Concept stable : **structure de fichiers → structure d'URL**, avec des segments
statiques et dynamiques. (La syntaxe exacte des noms de fichiers spéciaux dépend de la version — c'est
la partie évolutive.)
```
app/
  page          → "/"            (accueil)
  livres/
    page        → "/livres"      (liste)
    [id]/
      page      → "/livres/42"   (détail, id = "42")
```

### Ce que tu gardes de React
Tes composants, props, état, hooks, la composition, les quatre états d'écran, l'accessibilité, les
tests : tout reste valable. Le framework ne remplace pas React, il l'ENCADRE. Ce que tu apprends en
plus, ce sont les réponses aux questions d'APPLICATION (où/quand s'exécute le code, comment charger
les données, comment déployer), traitées dans les leçons suivantes.

## Concepts clés
Bibliothèque (React) vs framework (Next.js) · ce que React ne fournit pas (routing, rendu serveur,
données serveur, production) · **routing par fichiers** (arborescence → URL) · segments statiques et
dynamiques · concepts stables vs syntaxe évolutive · « on écrit toujours du React ».

## 🧭 Exemple guidé
Tu as une application React avec un état `page` qui vaut `'accueil'` ou `'detail'` et un rendu
conditionnel. Problème : pas de vraie URL, bouton retour cassé, lien non partageable. Avec le routing
par fichiers, chaque vue devient un fichier de page (`/`, `/livres/[id]`), l'URL redevient la source de
vérité de la vue (comme vu en application React), et le framework gère la navigation. Raisonnement : on
ne bricole plus « quel écran » dans un `useState` ; on structure des pages, et l'URL fait le reste —
c'est précisément le problème de routing identifié dans `react-application-states`, résolu par
convention.

## ⚠️ Erreurs fréquentes
- Croire que Next.js « remplace » React : non, on écrit toujours du React ; il l'encadre.
- Mémoriser des noms de fichiers spéciaux sans comprendre le concept (structure → URL) : la syntaxe
  change, le concept reste.
- Adopter un framework « parce que c'est la mode » sans savoir quel problème il résout.
- Confondre « rendu serveur » et « pas de React » (on verra que le rendu serveur EXÉCUTE du React).

## 🔗 Liens avec le programme
Cette leçon fait suite à `/doc/lessons/react-application-states` (le routing y était identifié comme
un besoin) et prépare `/doc/lessons/nextjs-rendering` (où/quand s'exécute le rendu),
`/doc/lessons/nextjs-server-client-components` et `/doc/lessons/nextjs-data-production`. Elle s'appuie
sur `/doc/lessons/http-rest-json` pour la partie données.

## Mini-exercice
Prends une petite application React à deux ou trois vues gérées par un `useState`. Sur papier :
(1) liste les URL que tu voudrais (`/`, `/produits`, `/produits/:id`) ; (2) dessine l'arborescence de
fichiers correspondante (routing par fichiers) ; (3) identifie le segment dynamique et ce qu'il
capture ; (4) note ce qui reste du React existant (composants, état local) et ce que le framework
prend en charge (navigation, URL). Aucune exécution requise — c'est un exercice de modèle mental.

## 📚 Vocabulaire
**framework vs bibliothèque** · **Next.js** · **routing par fichiers** · **segment dynamique
(`[id]`)** · **page** · **convention** · **concepts stables vs syntaxe évolutive**.

## 🧾 À retenir
React est une bibliothèque d'interface ; Next.js est un framework qui assemble une APPLICATION autour
d'elle : routing, rendu serveur, données serveur, production. Son premier mécanisme est le **routing
par fichiers** : l'arborescence des fichiers définit les URL, avec des segments statiques et
dynamiques. Tu écris toujours du React ; tu apprends en plus OÙ et QUAND ton code s'exécute. Retiens
les concepts stables — la syntaxe d'une version passe, le rôle du framework reste.
