// days-enrich-reflection-091-120.mjs — Déploiement Y2 (Chantier C, option B), sous-batch SB1.
// Questions de réflexion SPÉCIFIQUES pour les jours d'apprentissage 93-118 (hors pilote 92/106/113,
// hors revues). Merge PAR JOUR dans le générateur : ne surcharge que le champ `reflection`.
// Triplet : [1] compréhension/prédiction · [2] diagnostic/arbitrage · [3] transfert/recul.

export const ENRICH_REFLECTION_091_120 = {
  93: { reflection: [
    "Tu fais `state.push(nouvel)` puis `setState(state)` : l'affichage ne bouge pas. Que compare React pour décider de re-rendre, et pourquoi cette mutation le trompe-t-elle ?",
    "Ton compteur doit rester entre un min et un max : où places-tu cette contrainte pour qu'un clic hors bornes soit impossible plutôt que corrigé après coup ?",
    "Dans quel cas une donnée de ton composant n'a-t-elle PAS besoin d'être dans un state (et y mettre serait une erreur) — quel critère utilises-tu pour trancher ?",
  ] },
  94: { reflection: [
    "Tu utilises l'index de tableau comme `key` et l'utilisateur supprime le premier élément d'une liste : que risque-t-il de se passer à l'écran, et pourquoi la key stable l'évite ?",
    "Une liste peut être vide, en chargement, ou remplie : pourquoi traiter « vide » et « en chargement » comme deux états distincts plutôt qu'un seul, et que voit l'utilisateur si tu les confonds ?",
    "Le rendu conditionnel `cond && <X/>` t'expose à un piège quand `cond` vaut 0 : dans quel autre cas d'affichage ce genre de valeur « falsy » pourrait-il faire apparaître quelque chose d'inattendu ?",
  ] },
  95: { reflection: [
    "Ton `useEffect` de fetch n'a pas de tableau de dépendances : que va-t-il se passer à chaque rendu, et quel symptôme (réseau, boucle) l'annonce ?",
    "Un composant qui fetch se démonte avant la fin de la requête : quel problème surgit si tu n'as pas de cleanup, et comment le raisonnes-tu ?",
    "Tu affiches directement les données sans gérer explicitement `loading` et `error` : dans quel scénario réel l'utilisateur voit-il un écran cassé, et pourquoi les 3 états ne sont pas optionnels ?",
  ] },
  96: { reflection: [
    "Dans un champ contrôlé, la valeur affichée vient du state : que se passe-t-il si tu oublies le `onChange`, et pourquoi le champ semble-t-il « bloqué » ?",
    "Faut-il valider un formulaire à chaque frappe, à la perte de focus, ou à la soumission : quel choix pour quel type de champ, et qu'est-ce qui agace l'utilisateur si tu te trompes ?",
    "La validation côté front rassure l'utilisateur mais ne suffit jamais à sécuriser : pourquoi, et où la vraie validation doit-elle aussi vivre ?",
  ] },
  97: { reflection: [
    "Tu centralises tous les appels réseau dans `api.ts` : quand une route change côté serveur, combien d'endroits dois-tu modifier avec cette couche, et combien sans elle ?",
    "Un appel renvoie un 500 : à quel endroit décides-tu de traiter l'erreur — dans chaque composant ou dans la couche `api` — et quel est le compromis de chaque choix ?",
    "Dans quel autre projet (data, IA) retrouveras-tu ce même réflexe « une seule porte d'entrée typée vers un service externe faillible », et qu'est-ce que ça t'y apportera ?",
  ] },
  99: { reflection: [
    "Un utilisateur met en favori l'URL d'une fiche puis la rouvre demain : que doit-il retrouver si l'état de navigation est dans l'URL, et que perd-il s'il est seulement en mémoire ?",
    "Tu dois gérer une URL qui ne correspond à aucune ressource : pourquoi un vrai 404 vaut-il mieux qu'un renvoi silencieux vers l'accueil, du point de vue de l'utilisateur ?",
    "Quel type d'information n'a JUSTEMENT pas sa place dans l'URL (par exemple un mot de passe ou un état éphémère) — quel critère sépare ce qui doit être partageable de ce qui ne doit pas l'être ?",
  ] },
  100: { reflection: [
    "Deux composants frères doivent afficher la même donnée à jour : pourquoi dupliquer un state dans chacun crée-t-il des incohérences, et où faut-il le remonter ?",
    "Tu remontes un state si haut que dix composants intermédiaires ne font que transmettre des props : à quel signe reconnais-tu ce « props drilling » excessif, et qu'est-ce qu'il coûte à la maintenance ?",
    "Le principe « l'état vit au plus petit ancêtre commun de ceux qui le lisent » : dans quel cas ce plus petit ancêtre devient si haut que ça annonce le besoin d'une autre approche ?",
  ] },
  101: { reflection: [
    "Tu passes toute ton app dans un Context dont la valeur change à chaque frappe : quel effet sur les re-renders, et pourquoi Context convient mieux à un état STABLE ?",
    "Entre faire descendre une donnée par props sur deux niveaux ou créer un Context : à partir de quand le Context se justifie-t-il vraiment, et quand est-ce de la sur-ingénierie ?",
    "Quel type de donnée est le candidat idéal à un Context (thème, utilisateur connecté) et lequel ne l'est pas — quelle propriété les distingue ?",
  ] },
  102: { reflection: [
    "Tu ajoutes `useMemo` partout « pour optimiser » avant d'avoir mesuré : pourquoi peux-tu dégrader la lisibilité sans gagner de performance, et par quoi faut-il TOUJOURS commencer ?",
    "Un composant se re-rend à chaque frappe d'un champ voisin : comment identifies-tu la cause avec le Profiler, et quel outil (memo/useMemo/useCallback) répond à quel symptôme ?",
    "`useCallback` sert surtout quand une fonction est passée à un enfant mémoïsé : dans quel cas est-il au contraire inutile, voire un coût net — quelle hypothèse le rend pertinent ?",
  ] },
  103: { reflection: [
    "Tu remplaces un `<div onClick>` par un vrai `<button>` : qu'est-ce que ça débloque gratuitement pour un utilisateur au clavier ou au lecteur d'écran ?",
    "Un formulaire affiche ses erreurs uniquement par une couleur rouge : pourquoi est-ce insuffisant pour une partie des utilisateurs, et que faut-il ajouter ?",
    "Dans quel contexte professionnel l'accessibilité n'est-elle pas qu'un « plus » mais une obligation, et qu'est-ce que le HTML sémantique te fait gagner même hors de ce cas ?",
  ] },
  104: { reflection: [
    "Avant de coder BiblioApp, tu dessines l'arbre de composants et le plan d'état : qu'est-ce que cette carte te permet d'anticiper que tu découvrirais douloureusement en codant à l'aveugle ?",
    "Tu hésites sur le niveau où placer l'état de la liste de livres : comment ton plan d'état tranche-t-il la question avant même la première ligne de code ?",
    "Un backlog priorise ce qui prouve l'architecture en premier : pourquoi commencer par le parcours le plus fin de bout en bout plutôt que par la plus belle fonctionnalité ?",
  ] },
  107: { reflection: [
    "Ton test vérifie qu'un état interne `isOpen` vaut `true` après un clic : pourquoi ce test casse-t-il au moindre refactoring, alors que tester ce que l'utilisateur VOIT ne casserait pas ?",
    "Tu dois tester un bouton qui ouvre un menu : décris ce que tu simules et ce que tu vérifies pour tester le COMPORTEMENT et non l'implémentation.",
    "La règle « teste ce que l'utilisateur voit » : dans quel cas la suivre rend un test difficile à écrire, et qu'est-ce que cette difficulté révèle souvent sur ton composant ?",
  ] },
  108: { reflection: [
    "Tes tests appellent la vraie API et échouent aléatoirement : quelle propriété du test est violée, et pourquoi mocker l'appel la restaure-t-elle ?",
    "Tu hésites à mocker une fonction : quel critère (« est-ce que je la contrôle ? est-elle déterministe ? ») te dit s'il faut la mocker ou la laisser réelle ?",
    "Un test d'intégration « formulaire → API mockée → UI » attrape une classe de bugs que dix tests unitaires isolés laissent passer : laquelle, et pourquoi ?",
  ] },
  109: { reflection: [
    "Un composant de 300 lignes mélange fetch, calcul et affichage : à quels signaux concrets reconnais-tu qu'il faut le découper, plutôt qu'à une simple impression de « c'est long » ?",
    "Tu peux extraire un sous-composant OU un hook custom : lequel choisis-tu selon que tu sépares de l'AFFICHAGE ou de la LOGIQUE, et pourquoi ?",
    "Un bon refactoring ne doit rien changer au comportement observable : comment t'en assures-tu concrètement avant/après, et qu'est-ce qui te protège d'une régression ?",
  ] },
  110: { reflection: [
    "Tu copies-colles la même logique de fetch dans trois composants : qu'est-ce qu'un hook custom `useFetch` change quand tu dois ensuite ajouter un timeout partout ?",
    "Quel bout de code mérite de devenir un hook (`useLocalStorage`) et lequel devrait rester un simple utilitaire sans `use` — quel critère lié aux hooks React décide ?",
    "Un hook custom doit respecter les règles des hooks (appel au top-level, pas dans une condition) : dans quel cas les enfreindre casserait-il l'ordre des états, et pourquoi ?",
  ] },
  111: { reflection: [
    "Une erreur de rendu (accès à `undefined.map`) fait écran blanc : qu'est-ce qu'une error boundary change pour l'utilisateur, et quel type d'erreur ne rattrape-t-elle PAS ?",
    "Tu distingues erreurs attendues (un fetch qui échoue) et inattendues (un bug de code) : pourquoi ne les traites-tu pas au même endroit ni de la même façon ?",
    "Proposer un bouton « réessayer » a du sens pour certaines erreurs et pas d'autres : lesquelles, et sur quelle hypothèse repose l'idée que réessayer peut marcher ?",
  ] },
  114: { reflection: [
    "Tu modifies un livre en faisant `livre.titre = x` sur l'objet du state : pourquoi la liste peut ne pas se rafraîchir, et quelle forme de mise à jour immuable corrige ça ?",
    "Une suppression sans confirmation part au moindre clic : à quel moment la demande de confirmation est-elle justifiée, et quand devient-elle au contraire une gêne inutile ?",
    "Le même triptyque « formulaire contrôlé → appel api → mise à jour immuable de l'état » resservira dans presque toutes tes apps : qu'est-ce qui, dans ce schéma, garantit la cohérence entre l'écran et les données ?",
  ] },
  115: { reflection: [
    "Tu stockes la liste filtrée dans un state séparé de la liste complète : pourquoi risques-tu la désynchronisation, et pourquoi vaut-il mieux DÉRIVER la liste affichée des critères ?",
    "Deux filtres combinables (texte + catégorie) doivent s'appliquer ensemble : comment structures-tu l'état des critères pour que les combiner reste simple à faire évoluer ?",
    "Une recherche qui ne renvoie rien : pourquoi un état « aucun résultat » soigné vaut-il mieux qu'une liste vide muette, et qu'est-ce que ça dit de ta rigueur à un recruteur ?",
  ] },
  116: { reflection: [
    "Tu vises 100 % de couverture sur BiblioApp : pourquoi est-ce un mauvais objectif, et quelle question (« quel parcours me ferait le plus mal s'il cassait ? ») vaut mieux ?",
    "Entre tester le tri d'un tableau (logique pure) et tester le parcours d'ajout complet : lequel te donne le plus de confiance pour l'effort, et pourquoi ?",
    "Un test qui casse à chaque petit changement de maquette teste probablement la mauvaise chose : à quoi devrais-tu le rattacher pour qu'il protège un comportement stable ?",
  ] },
  117: { reflection: [
    "Ta démo marche tant qu'on suit le « chemin heureux » : quels états (liste vide, chargement lent, erreur réseau) trahissent le plus vite une démo bricolée d'un produit fini ?",
    "Tu as une seconde de chargement sans aucun retour visuel : que ressent l'utilisateur, et quelle différence fait un indicateur même minimal ?",
    "Soigner les états non-heureux prend du temps « invisible » : pourquoi est-ce précisément ce que regarde un recruteur ou un lead sur un projet, plutôt que la fonctionnalité principale ?",
  ] },
  118: { reflection: [
    "Ton README commence par la liste des technos utilisées : pourquoi un lecteur pressé décroche-t-il, et par quoi devrais-tu commencer pour qu'il comprenne la valeur en 30 secondes ?",
    "Une ADR documente un choix (état global vs local) et ses alternatives écartées : à quoi sert-elle six mois plus tard, quand tu ne te souviens plus pourquoi tu as tranché ainsi ?",
    "Tu dois présenter BiblioApp en 2 minutes : quel fil (problème → décision clé → preuve que ça marche) racontes-tu, et pourquoi ce récit vaut mieux qu'une visite écran par écran ?",
  ] },
};
