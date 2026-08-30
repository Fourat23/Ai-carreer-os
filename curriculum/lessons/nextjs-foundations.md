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

## 🧭 Exemple guidé — reconstruire le framework à la main, et compter ce qu'on doit écrire

La question « pourquoi un framework ? » n'a pas de réponse convaincante tant qu'on ne l'a
pas cherchée soi-même. Alors cherchons-la : on part d'une application React qui marche, et
on ajoute les besoins de production un par un, en écrivant nous-mêmes la réponse. On
s'arrêtera quand la conclusion sera évidente.

### Le point de départ

Une application de catalogue de livres. Un composant, un état :

```jsx
function App() {
  const [vue, setVue] = useState('accueil');
  const [livreOuvert, setLivreOuvert] = useState(null);

  if (vue === 'detail') return <Detail id={livreOuvert} />;
  return <Liste onOuvrir={(id) => { setLivreOuvert(id); setVue('detail'); }} />;
}
```

C'est correct. Ça fonctionne. Un utilisateur clique, le détail s'affiche.

### Besoin 1 — « envoie-moi le lien de ce livre »

Un collègue demande l'URL du livre 42. Il n'y en a pas : la barre d'adresse affiche la
racine du site, quel que soit l'écran. L'état de la vue vit dans la mémoire du navigateur,
et la mémoire du navigateur ne se copie pas dans un message.

On corrige. On écrit l'URL nous-mêmes à chaque navigation, et on la lit au démarrage :

```jsx
function ouvrir(id) {
  history.pushState({}, '', `/livres/${id}`);
  setLivreOuvert(id); setVue('detail');
}
useEffect(() => {
  const m = location.pathname.match(/^\/livres\/(\d+)$/);
  if (m) { setLivreOuvert(m[1]); setVue('detail'); }
}, []);
```

Ça marche. Note ce qu'on vient d'écrire : une expression régulière qui traduit une URL en
état. C'est un **routeur**, en miniature.

### Besoin 2 — le bouton retour

L'utilisateur clique sur « précédent ». L'URL revient à la racine, l'écran ne bouge pas :
`pushState` change l'adresse sans prévenir React. Il faut écouter l'événement `popstate` et
rejouer la traduction URL → état.

Troisième morceau de routeur. On n'a toujours que deux écrans.

### Besoin 3 — Google, et le premier partage sur les réseaux

L'équipe marketing signale que les fiches livres n'apparaissent nulle part, et qu'un lien
collé dans une messagerie n'affiche aucun aperçu. La cause est visible sans outil : demande
au navigateur le code source de la page — le vrai, celui qu'a reçu le serveur, pas ce
qu'affiche l'inspecteur après exécution. Tu y trouveras à peu près ceci :

```html
<div id="root"></div>
<script src="/bundle.js"></script>
```

Le titre du livre n'est nulle part. Il n'existe qu'après l'exécution du JavaScript, chez
celui qui visite. Un robot qui lit le HTML sans exécuter le JavaScript voit une page vide.

Cette fois, la correction n'est pas un bout de code à ajouter dans le composant. Il faut un
**serveur** qui exécute React avant d'envoyer la réponse, qui produise le HTML complet, et
un mécanisme côté navigateur qui reprenne cette page déjà écrite pour la rendre interactive
sans tout re-fabriquer. On ne bricole plus : on change d'architecture.

### Besoin 4 — la clé d'API

Le catalogue vient d'un fournisseur qui exige une clé. Où la mettre ? Dans le composant :
elle part dans le paquet JavaScript, publique. Dans une variable d'environnement du
navigateur : c'est la même chose, une variable d'environnement injectée dans du code client
est du code client.

La seule réponse correcte est : la clé reste sur le serveur, qui appelle le fournisseur et
ne renvoie que le résultat. Il faut donc **un endroit où faire tourner du code côté
serveur**, et une frontière claire entre ce qui s'y exécute et ce qui part chez
l'utilisateur.

### Le compte

Quatre besoins. Voici ce qu'ils ont exigé :

| Besoin | Ce qu'on a dû écrire |
|--------|----------------------|
| URL partageable | un routeur (analyse de l'URL, écriture de l'adresse) |
| Bouton retour | gestion de l'historique du navigateur |
| Indexation, aperçus | rendu serveur + reprise en main côté navigateur |
| Clé secrète | exécution serveur + frontière serveur/client |

Aucun de ces quatre points ne concerne l'interface. Aucun n'est un problème que React
prétend résoudre : React répond à « comment décrire une interface à partir d'un état », et
il y répond bien. Les quatre besoins ci-dessus sont des problèmes d'**application**.

C'est exactement la liste que Next.js prend en charge. Non pas « une meilleure façon de
faire du React » : les mêmes composants, le même état, les mêmes hooks — plus les réponses
aux quatre questions qu'on vient de rencontrer.

### Ce que le framework fait du besoin 1

Regarde la première ligne du tableau après adoption du framework. Il n'y a plus de routeur
à écrire, ni d'expression régulière, ni d'écoute de `popstate`. À la place, une convention :

```
app/
  page          → "/"
  livres/
    page        → "/livres"
    [id]/
      page      → "/livres/42"   (id = "42")
```

L'arborescence de fichiers **est** la table des routes. Le dossier entre crochets marque le
segment variable. Il n'y a rien à déclarer : créer le fichier crée l'URL.

C'est le premier mécanisme structurant du framework, et il illustre sa logique générale :
remplacer du code de plomberie par une **convention**. Le prix à payer est réel — il faut
connaître la convention, et elle change d'une version à l'autre. Le concept, lui, ne change
pas : *structure de fichiers → structure d'URL, avec des segments statiques et dynamiques.*

### Ce que cet exemple ne dit pas

Il ne dit pas qu'un framework est toujours justifié. Une page unique sans indexation, sans
données privées et sans navigation n'a besoin d'aucun des quatre points. La bonne question
en entretien n'est pas « utilises-tu Next.js ? » mais « lequel de ces quatre besoins as-tu
réellement ? ». Si la réponse est aucun, React seul suffit, et le dire est un signe de
maturité, pas de méconnaissance.

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

## 🛠️ Pratique — la note de décision « framework ou pas »

**Contexte.** Tu es la personne la plus expérimentée sur trois petits projets qui démarrent
la même semaine. Pour chacun, l'équipe demande : « on part sur React seul ou sur Next.js ? »
Tu dois répondre par écrit, et ta réponse sera relue par quelqu'un qui n'a pas ton contexte.

| Projet | Description |
|--------|-------------|
| **A — Console d'admin interne** | Derrière un identifiant. 12 écrans. Données lues via une API interne qui exige un jeton. Utilisée sur poste fixe, sur le réseau de l'entreprise. Personne ne partage de lien vers un écran précis. |
| **B — Site d'une association** | 8 pages surtout éditoriales, un formulaire de contact, un agenda d'événements mis à jour deux fois par mois. Doit apparaître dans les recherches et bien s'afficher quand un lien est partagé. Beaucoup de visites depuis un téléphone. |
| **C — Éditeur de schémas** | Une seule vue. L'utilisateur dessine, glisse, annule, refait. Tout est dans le navigateur, sauvegarde locale. Aucun compte, aucune donnée serveur. |

**Ta production.** Pour chacun des trois projets, une note de six à dix lignes contenant :

1. Un tableau des **quatre besoins** de l'exemple guidé (URL partageables · historique ·
   indexation et aperçus · secret côté serveur), avec pour chacun `oui / non / marginal`
   **et une justification tirée de la description**, pas une opinion générale.
2. Ta **recommandation** : `React seul` ou `Next.js`.
3. La **conséquence si on se trompe** : que se passe-t-il concrètement, dans six mois, si on
   prend l'autre option ? Une phrase, concrète.
4. Pour le projet B uniquement : l'arborescence de fichiers correspondant à ses URL, avec
   au moins un segment dynamique et ce qu'il capture.

**Critère de réussite.** Une note est bonne si (a) chaque `oui` cite un élément précis de la
description du projet ; (b) au moins un des trois projets reçoit la recommandation
`React seul` — si tu recommandes le framework partout, c'est que tu n'as pas utilisé la
grille, tu as utilisé une habitude ; (c) la conséquence en cas d'erreur est différente pour
les trois projets.

**Durée.** 30 à 40 minutes. Aucune exécution, aucun code à part l'arborescence du projet B.

## ✅ Correction

### La démarche

On ne part pas de la question « ce projet mérite-t-il un framework ? » — elle appelle une
réponse d'opinion. On part des quatre besoins, un par un, en cherchant dans la description
la phrase qui tranche. La recommandation tombe ensuite toute seule, et surtout elle devient
**défendable devant quelqu'un qui n'est pas d'accord**, parce qu'elle pointe des faits.

Ordre de lecture utile : commence par « indexation » et « secret serveur ». Ce sont les deux
besoins qu'on ne peut pas rattraper à la main sans changer d'architecture. Les deux autres,
routeur et historique, se résolvent avec une bibliothèque de routing sans quitter React.

### Projet A — console d'admin interne

| Besoin | Verdict | Pourquoi |
|--------|---------|----------|
| URL partageables | marginal | « personne ne partage de lien vers un écran précis » — mais 12 écrans réclament tout de même une navigation propre |
| Historique | oui | 12 écrans : le bouton retour sera utilisé tous les jours |
| Indexation, aperçus | **non** | derrière un identifiant : aucun robot n'y accède, par construction |
| Secret côté serveur | **à vérifier** | le jeton d'API interne : d'où vient-il ? |

**Recommandation : React seul + une bibliothèque de routing**, à une condition. Le jeton
est le point qui décide. S'il est délivré à l'utilisateur après connexion et porté par le
navigateur, il n'y a pas de secret d'application à protéger et React seul suffit largement.
Si c'est une clé de service partagée, elle ne peut pas vivre dans le navigateur, et il faut
un endroit où exécuter du code serveur — le framework devient justifié.

**Si on se trompe** en prenant Next.js sans en avoir besoin : on paie une complexité de
build, de déploiement et de frontière serveur/client pour une application que personne
n'indexe. Six mois plus tard, l'équipe passe des après-midis sur des erreurs de
**sérialisation** — la conversion d'un objet du serveur en une forme
transmissible au navigateur, qui refuse certains types — dans un outil interne à quinze utilisateurs.

### Projet B — site de l'association

| Besoin | Verdict | Pourquoi |
|--------|---------|----------|
| URL partageables | **oui** | « bien s'afficher quand un lien est partagé » |
| Historique | oui | 8 pages de navigation éditoriale |
| Indexation, aperçus | **oui, décisif** | « doit apparaître dans les recherches » |
| Secret côté serveur | oui, léger | le formulaire de contact envoie un courriel : la configuration d'envoi ne doit pas être publique |

**Recommandation : Next.js.** C'est le cas le plus net des trois, et pour une raison unique
qui suffirait seule : sans HTML complet envoyé par le serveur, ni les moteurs de recherche
ni les aperçus de partage ne voient le contenu. Le point sur les visites mobiles va dans le
même sens — une page qui arrive déjà écrite s'affiche avant que le JavaScript ait fini de
se charger sur un réseau lent.

Arborescence attendue :

```
app/
  page                    → "/"
  association/page        → "/association"
  agenda/
    page                  → "/agenda"
    [slug]/page           → "/agenda/vide-grenier-2026"   (slug = identifiant de l'événement)
  contact/page            → "/contact"
```

Le segment dynamique est `[slug]` : il capture l'identifiant lisible d'un événement. Un
`[id]` numérique conviendrait techniquement, mais pour un site qui vise l'indexation, une
URL qui contient des mots est préférable — la décision n'est pas technique, elle est
éditoriale.

**Si on se trompe** en prenant React seul : le site fonctionne parfaitement pour qui connaît
l'adresse, et reste invisible. Six mois plus tard, on constate que la fréquentation ne
décolle pas, et la correction impose de refaire l'architecture de rendu.

### Projet C — éditeur de schémas

| Besoin | Verdict | Pourquoi |
|--------|---------|----------|
| URL partageables | **non** | une seule vue |
| Historique | **non** | pas de navigation entre écrans — l'annulation dans l'éditeur est un autre problème, interne à l'application |
| Indexation, aperçus | **non** | rien à indexer : le contenu est celui de l'utilisateur |
| Secret côté serveur | **non** | « aucune donnée serveur » |

**Recommandation : React seul.** Zéro sur quatre. C'est le projet qui vérifie que la grille
a servi : il est très interactif, donc « moderne » dans l'imaginaire, et pourtant il n'a
aucun des besoins auxquels le framework répond. Interactivité et besoin de framework sont
deux axes indépendants — c'est le point que cette pratique cherche à faire toucher.

**Si on se trompe** en prenant Next.js : la quasi-totalité de l'application vit du côté
client de la frontière. On a ajouté une frontière serveur/client à une application qui n'a
pas de serveur, et chaque nouveau composant pose une question qui n'a pas lieu d'être.

### La mauvaise solution plausible

Recommander Next.js pour les trois, avec l'argument « c'est le standard, autant partir
dessus, on ne sait jamais ». L'argument n'est pas absurde — l'uniformité entre projets a une
valeur réelle, et le coût d'entrée du framework est modéré. Mais il faut alors le dire
ainsi : « je choisis l'uniformité de l'équipe contre l'adéquation technique », ce qui est
une décision assumée. Le défaut n'est pas le choix, c'est de le présenter comme une
nécessité technique alors que trois des quatre besoins sont à `non`.

L'autre erreur fréquente : traiter « le projet C est très interactif » comme un argument
**pour** le framework. L'interactivité est le domaine de React, pas celui de ce que le
framework ajoute.

### Généralisation

La forme de cette note — lister les besoins que l'outil couvre, les confronter un par un au
projet réel, décider, nommer le coût de l'erreur — s'applique à tout choix d'outil : une
base de données, une file de messages, un orchestrateur de conteneurs. Elle a une propriété
utile en entretien comme en réunion : elle rend possible d'être en désaccord sur un fait
précis plutôt que sur des goûts. Et elle laisse une trace, ce qui permet dans deux ans de
savoir non pas ce qu'on a choisi — le code le dit — mais **pourquoi**.

## Mini-exercice
Reprends une petite application React à deux ou trois vues gérées par un `useState`. Sur papier :
(1) liste les URL que tu voudrais ; (2) dessine l'arborescence de fichiers correspondante ;
(3) identifie le segment dynamique et ce qu'il capture ; (4) note ce qui reste du React existant et
ce que le framework prend en charge.

## 📚 Vocabulaire
**framework vs bibliothèque** · **Next.js** · **routing par fichiers** · **segment dynamique
(`[id]`)** · **page** · **convention** · **concepts stables vs syntaxe évolutive**.

## 🧾 À retenir
React est une bibliothèque d'interface ; Next.js est un framework qui assemble une APPLICATION autour
d'elle : routing, rendu serveur, données serveur, production. Son premier mécanisme est le **routing
par fichiers** : l'arborescence des fichiers définit les URL, avec des segments statiques et
dynamiques. Tu écris toujours du React ; tu apprends en plus OÙ et QUAND ton code s'exécute. Retiens
les concepts stables — la syntaxe d'une version passe, le rôle du framework reste.
