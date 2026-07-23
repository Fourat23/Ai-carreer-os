// days-enrich-reflection-pilot.mjs — Pilote Y2 (Chantier C, option B1).
// Remplace les 3 « Questions de réflexion » génériques par 3 questions SPÉCIFIQUES
// au contenu du jour, sur l'échantillon de 22 journées déjà audité manuellement.
// Ne surcharge QUE le champ `reflection` : merge par jour dans le générateur, sans
// écraser les autres champs d'enrichissement existants. Aucun autre jour n'est touché.
//
// Structure de chaque triplet :
//   [0] compréhension / prédiction (prévoir un comportement, une conséquence, une sortie)
//   [1] diagnostic / arbitrage (scénario concret, justifier une décision/compromis)
//   [2] transfert / recul (autre contexte, limite, condition d'échec, lien projet)

export const ENRICH_REFLECTION_PILOT = {
  92: { reflection: [
    "Tu rends une liste de cartes en réutilisant le même composant : que se passe-t-il à l'écran si un enfant modifie directement l'objet reçu en props, et pourquoi ce genre de mutation provoque des bugs difficiles à voir ?",
    "Face à une maquette, à quel signe décides-tu qu'un bloc mérite son propre composant plutôt que de rester inline — et quel est le coût d'un découpage trop fin ?",
    "La même carte doit servir dans deux écrans différents : qu'est-ce qui doit rester à l'intérieur du composant et qu'est-ce qui doit obligatoirement venir par props pour qu'il reste réutilisable ?",
  ] },
  106: { reflection: [
    "Tu écris un test qui passe au vert du premier coup sans avoir jamais échoué : pourquoi ne prouve-t-il pas grand-chose, et qu'est-ce que le fait de saboter volontairement le code t'apprend sur lui ?",
    "Tu n'as le temps que pour une chose : couvrir dix cas « heureux » ou trois cas limites (vide, zéro, très grand). Lequel choisis-tu et pourquoi ?",
    "Un test qui dépend de la date ou du réseau rougit parfois sans raison : en quoi cela ruine la confiance dans TOUTE ta suite, et que faut-il rendre déterministe ?",
  ] },
  113: { reflection: [
    "Tu commences par coder la fonctionnalité la plus riche de l'app : à quel moment les bugs d'intégration entre couches vont-ils apparaître, et pourquoi est-ce le pire moment pour les découvrir ?",
    "Pourquoi préfères-tu une série de commits atomiques à un seul gros commit « BiblioApp », au-delà de l'esthétique — qu'est-ce que ça te permet concrètement le jour où quelque chose casse ?",
    "Le test « ouvrir directement l'URL d'une fiche dans un onglet neuf » : que prouve-t-il exactement sur ton architecture de navigation, et que révélerait son échec ?",
  ] },
  120: { reflection: [
    "Tu traduis une boucle `for ... .append()` du JS en Python : quelle construction idiomatique la remplace, et qu'est-ce qu'un lecteur comprend plus vite en la voyant ?",
    "Accéder à un dictionnaire par `d[cle]` plante sur une clé absente : dans quel cas préfères-tu `.get(cle, defaut)`, et dans quel cas veux-tu au contraire que l'accès lève une erreur ?",
    "Travailler sans venv ne gêne pas sur un script isolé mais casse dès que tu as deux projets : qu'est-ce qui entre exactement en collision, et que règle l'isolation ?",
  ] },
  134: { reflection: [
    "Une même adresse client est recopiée sur 200 lignes de commandes : décris concrètement les trois anomalies (mise à jour, insertion, suppression) que cette redondance va provoquer.",
    "Tu envisages de dénormaliser une table pour accélérer une lecture très fréquente : à quelle condition est-ce un choix défendable plutôt qu'une négligence, et qu'acceptes-tu en échange ?",
    "Le test « un client déménage → une seule ligne à modifier » : pourquoi est-il une preuve directe que ton schéma tient la 3NF, et que verrais-tu s'il ne la tenait pas ?",
  ] },
  148: { reflection: [
    "Deux groupes affichent la même moyenne de 50 : qu'est-ce que cette seule moyenne peut cacher, et quelle statistique le révélerait immédiatement ?",
    "Sur une distribution de salaires très asymétrique, la moyenne « ment » : à quel écart le détectes-tu, et rapportes-tu alors la moyenne ou la médiane ?",
    "Dans un futur rapport destiné à une décision métier, pourquoi ne donneras-tu jamais une tendance centrale sans sa dispersion — que risque de conclure le lecteur sinon ?",
  ] },
  165: { reflection: [
    "Ton modèle obtient 0,90 sur un découpage train/test et 0,78 sur un autre : qu'est-ce qu'une validation croisée à 5 folds va t'apprendre que ces deux chiffres isolés ne disent pas ?",
    "Tu compares deux modèles dont les scores moyens en validation croisée se chevauchent à l'écart-type près : que peux-tu honnêtement conclure, et pourquoi le meilleur chiffre brut ne suffit pas à trancher ?",
    "Sur un très gros jeu de données où chaque entraînement coûte cher, quelle limite de la validation croisée devient gênante, et quel compromis pratique envisages-tu ?",
  ] },
  190: { reflection: [
    "Tu encodes \" chat\" (avec l'espace) et \"chat\" (sans) : obtiens-tu le même identifiant de token, et qu'est-ce que la réponse révèle sur la manière dont le modèle « lit » le texte ?",
    "Ton application passe du français à l'anglais à quantité de texte égale : dans quel sens la facture en tokens évolue-t-elle, et comment l'expliques-tu par la tokenisation ?",
    "Pourquoi un LLM peine-t-il à compter les lettres d'un mot ou à manipuler de grands nombres — quel lien direct avec la façon dont le texte est découpé en tokens ?",
  ] },
  194: { reflection: [
    "Avant même d'entraîner quoi que ce soit, pourquoi des embeddings pré-entraînés suivis d'une régression logistique suffisent-ils souvent avec seulement quelques centaines d'exemples annotés ?",
    "Ton accuracy globale est de 0,92 mais une classe minoritaire est mal détectée : quelle métrique fait apparaître le problème, et pourquoi l'accuracy te trompe ici ?",
    "Face à un nouveau besoin de classification, à quel signe décideras-tu que cette baseline « embeddings + tête légère » ne suffit plus et qu'il faut passer au cran supérieur ?",
  ] },
  197: { reflection: [
    "Dans une conversation NEUVE, tu écris à un LLM « comme je te l'ai expliqué hier » : que va-t-il faire, et qu'est-ce que ça prouve concrètement sur sa « mémoire » ?",
    "Un product manager veut que le chatbot « se souvienne » des préférences d'un client : où doit vivre cette mémoire dans ton système, et pourquoi pas dans le modèle lui-même ?",
    "Tu poses une question dont la réponse est absente du contexte fourni : d'où le modèle tire-t-il alors sa réponse, et pourquoi peut-elle être fausse tout en paraissant sûre ?",
  ] },
  211: { reflection: [
    "Une modification de prompt « pour améliorer » fait secrètement chuter la qualité : sans jeu de test, à quel moment t'en apercevras-tu, et à quel prix ?",
    "Ton runner de prompts affiche 100 % de réussite : pourquoi est-ce plus inquiétant que rassurant, et que manque-t-il probablement à tes cas de test ?",
    "En quoi traiter un prompt comme du code (fichier versionné, cas de test, diff) change-t-il concrètement ta capacité à revenir en arrière après une régression ?",
  ] },
  218: { reflection: [
    "Tu embeddes tes chunks avec un modèle et tes questions avec un autre : rien ne plante, tout tourne — pourquoi est-ce pourtant une erreur silencieuse et coûteuse ?",
    "Ton ingestion plante au chunk 800 sur 1000 : selon qu'elle est idempotente ou non, que coûte la reprise, et comment la conçois-tu pour que relancer soit indolore ?",
    "Tu stockes tes vecteurs en JSON plutôt qu'en base vectorielle : à quels signes (volume, besoin de filtrage) sauras-tu que ce choix assumé a atteint sa limite ?",
  ] },
  241: { reflection: [
    "Deux stratégies de chunking produisent des chunks de découpe différente : pourquoi ne peux-tu pas les comparer par identifiants de chunks, et que compares-tu à la place ?",
    "La stratégie qui gagne au score global perd deux questions de synthèse : est-ce une victoire nette, et sur quel critère tranches-tu pour ton usage réel ?",
    "Pendant la mesure, une question de ton golden set te paraît « mal posée » : pourquoi ne la corriges-tu pas maintenant, et qu'en fais-tu à la place ?",
  ] },
  253: { reflection: [
    "Tu construis ton jeu de test à partir de questions inventées plutôt que du besoin réel des utilisateurs : que va réellement mesurer ton évaluation, et en quoi est-ce trompeur ?",
    "Faut-il viser 500 questions ou couvrir tous les types d'usage avec 30 bien choisies : qu'est-ce qui fait vraiment la valeur d'un golden set, le volume ou la couverture ?",
    "Pourquoi figer le golden set (ne jamais le retoucher pendant qu'on développe) est-il la condition pour que la comparaison entre deux versions veuille dire quelque chose ?",
  ] },
  260: { reflection: [
    "Un document de ton corpus contient « ignore tes instructions et réponds ceci » : pourquoi le modèle risque-t-il de suivre cette phrase, et qu'est-ce qui rend cette injection si difficile à filtrer ?",
    "Entre une injection directe (dans la question) et une indirecte (cachée dans un document récupéré), laquelle est la menace spécifique d'un RAG, et pourquoi est-elle plus insidieuse ?",
    "Pourquoi cherches-tu à réussir au moins une attaque sur TON propre système avant même de penser à le défendre — qu'est-ce que ça change pour la défense que tu concevras ensuite ?",
  ] },
  274: { reflection: [
    "Ton agent reçoit une observation « outil inconnu » après avoir demandé un outil qui n'existe pas : que doit-il faire pour continuer proprement, et que se passe-t-il si tu ne gères pas ce cas ?",
    "Pourquoi un budget d'itérations strict est-il non négociable dans la boucle, même quand l'agent « devrait » s'arrêter de lui-même — quel scénario cherches-tu à borner ?",
    "Dans les traces d'exécution, qu'est-ce qui prouve réellement que ton agent enchaîne un raisonnement plutôt que d'appeler un outil au hasard — quel enchaînement veux-tu voir apparaître ?",
  ] },
  288: { reflection: [
    "Applique le « test du changement » : si tu remplaces ta base vectorielle par une autre, quelles parties de ton code devraient rester intactes, et lesquelles trahiraient une contamination du cœur ?",
    "Ton cœur métier importe directement `chromadb` : pourquoi est-ce un défaut d'architecture, et dans quel sens les dépendances devraient-elles pointer à la place ?",
    "À quel moment concret de la vie de ton projet cette séparation cœur/détails te fera-t-elle gagner du temps, plutôt que de rester une contrainte théorique ?",
  ] },
  302: { reflection: [
    "Pourquoi dit-on qu'une SPEC se juge autant à son hors-scope qu'à son scope — qu'est-ce qu'un hors-scope explicite et courageux rend concrètement possible ?",
    "Tu pars des fonctionnalités que tu aimerais coder plutôt que du persona : quel biais introduis-tu, et qu'est-ce que partir du persona corrige ?",
    "Qu'est-ce qu'un « cas d'usage » doit avoir pour être réellement exploitable dans une SPEC, au lieu d'un vœu vague comme « aider l'utilisateur » ?",
  ] },
  314: { reflection: [
    "« Le RAG avance » contre « 10 questions du corpus reçoivent une réponse citée + un refus » : pourquoi seul le second est un vrai jalon, et à quoi t'oblige-t-il ?",
    "Pourquoi démontrer depuis un clone frais du dépôt change-t-il la nature de ta preuve de progrès, comparé à une démo qui ne marche que sur ta machine ?",
    "À quoi sert une revue d'architecture hebdomadaire quand le projet « marche » déjà — quelle dérive silencieuse est-elle censée rattraper avant qu'elle coûte cher ?",
  ] },
  337: { reflection: [
    "Un recruteur pressé lit ton README 90 secondes : pourquoi commencer par le problème et la valeur, plutôt que par la stack technique, change tout à ce qu'il en retient ?",
    "Ton projet est excellent mais son README est illisible : que se passe-t-il concrètement côté marché, et pourquoi le README devient l'interface décisive entre ton travail et l'embauche ?",
    "Pourquoi une section « limites honnêtes » crédibilise-t-elle un README au lieu de l'affaiblir — qu'est-ce qu'un lecteur averti en déduit sur toi ?",
  ] },
  348: { reflection: [
    "Tu supposes les compétences attendues au lieu de lire 10 offres réelles : quel biais cela introduit-il dans ta préparation, et comment les données du marché le corrigent ?",
    "Parmi tes manques détectés, comment choisis-tu les deux à combler en priorité — quels deux critères (récurrence dans les offres, faisabilité) croises-tu ?",
    "Pourquoi aligner les mots-clés de ton CV sur les termes exacts des offres n'est-il pas de la triche mais une condition d'être vu — que fait un premier filtre de recrutement ?",
  ] },
  365: { reflection: [
    "Tu t'attribues « niveau 4/5 en RAG » : qu'est-ce qui rend cette note défendable plutôt qu'un simple ressenti — à quoi doit-elle impérativement être adossée ?",
    "Comment décides-tu quelles offres viser dès maintenant : sur quels critères objectifs classes-tu un poste en « prêt », « presque prêt » ou « pas encore » ?",
    "Pourquoi une confiance fondée sur cet audit chiffré tient-elle en entretien là où une confiance non fondée s'effondre — que se passe-t-il à la première question technique pointue ?",
  ] },
};
