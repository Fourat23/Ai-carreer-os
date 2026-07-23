// days-enrich-reflection-211-240.mjs — Déploiement Y2 (Chantier C, option B), sous-batch SB6.
// Jours d'apprentissage 212-240 hors pilote (211/218) et hors revues (217/224/231/238).
// Merge PAR JOUR : `reflection` seul. Triplet : [1] prédiction · [2] diagnostic · [3] transfert/recul.

export const ENRICH_REFLECTION_211_240 = {
  212: { reflection: [
    "Un utilisateur demande à ton assistant de support « écris-moi un poème » : pourquoi une contrainte de sortie qui le maintient dans son rôle vaut-elle mieux qu'espérer que le modèle refuse de lui-même ?",
    "Tu peux valider l'entrée OU contraindre la sortie : pourquoi les deux frontières sont-elles nécessaires, et quel type de dérive chacune arrête-t-elle ?",
    "Un guardrail trop strict finit par bloquer des demandes légitimes : comment arbitres-tu entre sécurité et utilité, et à quel signe sais-tu que tu es devenu trop restrictif ?",
  ] },
  213: { reflection: [
    "Tu passes de 1 à 5 outils : pourquoi le CHOIX du bon outil devient-il le problème principal, et de quoi ce choix dépend-il directement ?",
    "Un de tes outils met trente secondes à répondre ou échoue : que doit faire la boucle pour ne ni se bloquer ni mentir à l'utilisateur sur le résultat ?",
    "Deux outils ont des descriptions qui se ressemblent : pourquoi le modèle risque-t-il d'hésiter ou de se tromper d'outil, et que révèle ce problème sur le rôle des descriptions ?",
  ] },
  214: { reflection: [
    "Tu éparpilles les appels LLM dans dix endroits du code : que se passe-t-il le jour où tu dois ajouter un retry ou un log de coût partout, et qu'aurait changé un module d'appel unique ?",
    "Ton module intègre validation, retry, fallback et cache : lequel de ces quatre te protège de quel type de panne, et lequel agit surtout sur ta facture ?",
    "Un cache sur les appels LLM : dans quel cas est-il un gain net, et dans quel cas (réponses qui doivent varier, données fraîches) devient-il un piège ?",
  ] },
  215: { reflection: [
    "« Pourquoi ne pas tout mettre dans le prompt ? » : quels trois murs (fenêtre de contexte, coût, fraîcheur des données) le RAG contourne-t-il exactement ?",
    "Ton corpus change chaque semaine : pourquoi le RAG gère-t-il cette fraîcheur bien mieux qu'un modèle qu'il faudrait ré-entraîner, et à quel coût comparé ?",
    "Le RAG « ne corrige pas la mémoire du modèle, il la contourne » : en quoi est-ce le prolongement direct de ce que tu as observé sur les hallucinations (jour 201) ?",
  ] },
  216: { reflection: [
    "Un chunk trop grand noie la réponse dans du bruit, un chunk trop petit la coupe en deux : pourquoi la taille est-elle un ARBITRAGE et non un optimum universel ?",
    "Tu ajoutes un overlap entre chunks consécutifs : quel problème (une phrase coupée à la frontière) cela résout-il, et quel est le coût de cet overlap ?",
    "Tu LIS tes propres chunks après découpage : pourquoi ce geste banal révèle-t-il, à ce stade, plus de problèmes que n'importe quelle métrique automatique ?",
  ] },
  219: { reflection: [
    "Tu implémentes le cosinus toi-même : pourquoi compare-t-il des DIRECTIONS et non des longueurs, et pourquoi est-ce adapté à des textes de tailles très différentes ?",
    "Ta recherche top-k renvoie cinq chunks « proches » mais aucun ne répond vraiment à la question : pourquoi « similaire » n'est pas « pertinent », et que t'apprend cette limite sur l'étape de retrieval ?",
    "Pourquoi le cosinus plutôt que la distance euclidienne sur des embeddings : quelle propriété des vecteurs normalisés rend les deux quasi équivalents, et laquelle reste plus robuste à la longueur ?",
  ] },
  220: { reflection: [
    "Tu injectes le top-k dans le prompt et demandes de citer les sources : pourquoi l'obligation de citer pousse-t-elle le modèle à s'appuyer sur le contexte plutôt qu'à inventer ?",
    "Le modèle cite une source mais la réponse ne s'y trouve pas réellement : comment détectes-tu cette « citation de façade », et pourquoi est-elle plus dangereuse qu'une absence de citation ?",
    "Injecter trop de chunks « pour être sûr » : pourquoi cela peut DÉGRADER la réponse en noyant le signal, et quel lien avec le coût quadratique de l'attention (jour 192) ?",
  ] },
  221: { reflection: [
    "Ton RAG est un seul gros script : pourquoi le découper en ingest/chunk/embed/search/answer te permet-il d'améliorer une étape sans risquer de casser les autres ?",
    "Un problème de qualité apparaît : en quoi la modularité te permet-elle d'isoler s'il vient du retrieval ou de la génération, et à quoi ressemblerait ce diagnostic dans un script monolithique ?",
    "Ce découpage en modules aux responsabilités claires est le même principe qu'un pipeline ETL (jour 138) : qu'est-ce que ça t'apporte le jour où tu veux remplacer une seule brique (l'embedding, le stockage) ?",
  ] },
  222: { reflection: [
    "Le PDF est un format d'AFFICHAGE, pas de structure : quels problèmes concrets (colonnes, tableaux, coupures de mots) surgissent quand tu en extrais le texte ?",
    "Tu attaches des métadonnées (source, page, section) à chaque chunk dès l'ingestion : à quoi te serviront-elles plus tard, au-delà d'afficher une citation ?",
    "Un corpus mélange PDF et Markdown : pourquoi vaut-il mieux normaliser vers une représentation commune AVANT le chunking, et que casserait un traitement séparé mal aligné ?",
  ] },
  223: { reflection: [
    "Tu ré-ingères un corpus dont trois documents ont changé : sans identité stable par chunk, pourquoi te retrouves-tu avec des doublons ou des chunks orphelins ?",
    "Un document est retiré de la source : que doit-il advenir de ses chunks dans l'index, et que se passe-t-il si tu l'oublies (des réponses fondées sur du contenu disparu) ?",
    "La ré-ingestion idempotente (rejouable sans dupliquer) que tu vises ici : en quoi est-ce le même réflexe que l'idempotence d'un pipeline de données (jour 139) ?",
  ] },
  225: { reflection: [
    "Ton RAG répond mal sur ton corpus réel : pourquoi commences-tu par SÉPARER les pannes de retrieval de celles de génération, plutôt que de tout régler à la fois ?",
    "Tu prépares quinze questions de test dont tu connais les réponses : pourquoi ce petit jeu vaut-il mieux que « jouer avec » l'assistant pour juger sa qualité ?",
    "Sur un vrai corpus, tu découvres des échecs qu'aucun document jouet ne montrait : qu'est-ce que « le vrai corpus » révèle qu'un test synthétique n'anticipe jamais ?",
  ] },
  226: { reflection: [
    "Une question échoue : par quel test détermines-tu D'ABORD si le bon chunk a été retrouvé, avant de mettre en cause la génération ?",
    "Le bon chunk était pourtant dans le top-k mais la réponse est fausse : où est le problème, et qu'est-ce que ça change dans ce que tu vas corriger ?",
    "Pourquoi ce diagnostic « retrieval ou génération ? » est-il la question la plus rentable de tout le RAG, et de quelle erreur (régler au mauvais endroit) te protège-t-il ?",
  ] },
  227: { reflection: [
    "Pour chacune de tes six décisions (chunks, overlap, k, modèle, prompt, seuil), tu écris « comment saurais-je qu'elle est mauvaise » : pourquoi ce critère de réfutation vaut-il mieux qu'une justification a priori ?",
    "La qualité de ton RAG plafonne et tu ne peux pas tout ré-examiner : comment décides-tu quelle décision remettre en cause en premier ?",
    "Documenter chaque décision AVEC son signal d'échec : pourquoi ce document te sauve-t-il six mois plus tard, quand quelqu'un demande « pourquoi k = 3 ? »",
  ] },
  228: { reflection: [
    "Estime l'ordre de grandeur : n documents × chunks × dimensions × octets — pourquoi ce calcul de coin de table suffit-il à décider si ton stockage actuel tiendra ?",
    "Ton index en fichier plat marche aujourd'hui : quels murs (mémoire, recherche linéaire qui ralentit, absence de filtrage) le feront craquer, et dans quel ordre les rencontreras-tu ?",
    "Pourquoi anticiper CE mur avant de le heurter est-il un réflexe d'ingénieur, alors même que tu assumes le stockage simple pour l'instant ?",
  ] },
  229: { reflection: [
    "Ta question ne concerne qu'un seul document mais le retrieval cherche dans tout le corpus : comment un filtre par métadonnée réduit-il le bruit AVANT même la similarité ?",
    "Tu filtres trop agressivement par métadonnée : quel risque (rater le bon chunk qui était ailleurs), et comment équilibres-tu le filtre et la recherche sémantique ?",
    "Au-delà des citations, quel type de question (« dans la section sécurité, que dit-on de… ») devient possible uniquement grâce aux métadonnées ?",
  ] },
  230: { reflection: [
    "Ton ADR n°6 tranche entre fichier maison et base vectorielle : quels chiffres (volume, latence de recherche, besoin de filtrage) doivent porter la décision plutôt que la mode du moment ?",
    "Deux équipes tranchent différemment ce même choix pour des besoins différents : pourquoi n'y a-t-il pas de bonne réponse absolue, et quels besoins font pencher d'un côté ou de l'autre ?",
    "Pourquoi écrire ce choix comme un ADR (avec alternatives et conséquences) vaut-il mieux qu'un simple « j'ai pris une base vectorielle » — que cherche à protéger ce format ?",
  ] },
  232: { reflection: [
    "Tu cadres DocQA en choisissant d'abord la technologie de stockage : pourquoi partir du CORPUS et des types de questions est-il l'ordre correct ?",
    "Ton plan d'évaluation doit être défini AVANT de construire : pourquoi décider a priori COMMENT tu jugeras la qualité change-t-il la façon dont tu construis ?",
    "Quels types de questions (factuelle, synthèse, absente du corpus) prévois-tu dès le cadrage, et pourquoi la question « absente du corpus » est-elle la plus révélatrice ?",
  ] },
  233: { reflection: [
    "Ton interface affiche la réponse mais pas les passages sources : pourquoi est-ce un problème de CONFIANCE pour l'utilisateur, et que change l'affichage des extraits cités ?",
    "Tu choisis quoi montrer : réponse seule, réponse + sources, ou réponse + sources + chunks bruts — quel niveau pour quel utilisateur, et pourquoi ?",
    "Pourquoi une bonne interface de RAG doit-elle rendre la réponse VÉRIFIABLE, et en quoi cela la distingue-t-il d'une interface de chatbot ordinaire ?",
  ] },
  234: { reflection: [
    "La question de suivi « et pour les congés maladie ? » n'a aucun sens isolée : pourquoi le retrieval échoue-t-il si tu l'embeddes telle quelle, et que faut-il faire du contexte de la conversation ?",
    "Tu réinjectes tout l'historique à chaque tour : quels problèmes de coût et de « bruit » cela crée-t-il, et comment bornes-tu ce que tu réinjectes ?",
    "Quelle est la limite fondamentale du multi-tours (le modèle n'a aucune mémoire entre les appels), et qu'est-ce que TON code doit assumer pour simuler une conversation ?",
  ] },
  235: { reflection: [
    "Tu modifies le prompt de génération : une chose s'améliore mais une autre casse : pourquoi une boucle mesurée (avant/après sur des cas fixes) est-elle indispensable ici ?",
    "Tu veux que le modèle REFUSE quand l'information est absente du contexte : comment le spécifies-tu, et pourquoi est-ce préférable à une réponse inventée mais fluide ?",
    "« Améliorer sans casser ce qui marche » : pourquoi un jeu de cas de non-régression est-il la condition pour itérer sereinement sur un prompt ?",
  ] },
  236: { reflection: [
    "Une question totalement hors corpus arrive : quel comportement attendu définis-tu (un refus honnête plutôt qu'une invention), et pourquoi faut-il le TESTER explicitement ?",
    "Une question ambiguë admet deux réponses selon l'interprétation : que doit faire ton RAG plutôt que de trancher au hasard ?",
    "Une question exige de croiser plusieurs documents : pourquoi est-ce structurellement plus dur pour un RAG top-k, et quelle limite poses-tu honnêtement à son sujet ?",
  ] },
  237: { reflection: [
    "Tu prépares un golden set pour le mois d'évaluation : pourquoi ses questions doivent-elles venir du besoin RÉEL et non être inventées pour flatter le système ?",
    "Tu listes les améliorations possibles de DocQA : comment les priorises-tu tant que tu ne les as pas mesurées, et qu'est-ce que le golden set changera à cette priorisation ?",
    "Avant d'attaquer l'évaluation formelle, pourquoi dresser un bilan HONNÊTE des faiblesses déjà connues de DocQA oriente-t-il mieux la construction du jeu de test que de partir d'une page blanche ?",
  ] },
  239: { reflection: [
    "Tu migres d'un stockage fichier vers une base vectorielle : pourquoi le fait d'avoir isolé le stockage derrière une INTERFACE claire (grâce à la modularité) rend-il cette migration indolore ?",
    "Comment prouves-tu qu'il n'y a AUCUNE régression après la migration : quel test (mêmes questions → mêmes réponses et sources qu'avant) fait foi ?",
    "Qu'est-ce que la base vectorielle résout que ton fichier ne pouvait pas (recherche à l'échelle, filtrage par métadonnée), et qu'est-ce qu'elle ne change PAS dans la qualité des réponses ?",
  ] },
  240: { reflection: [
    "Tu chunks par titres et sections plutôt qu'à taille fixe : pourquoi un chunk qui respecte la structure du document est-il souvent plus « répondable » ?",
    "Sur dix questions, le chunking structurel gagne en global mais perd sur certaines : quel type de question (synthèse transversale) lui échappe, et comment tranches-tu pour ton usage ?",
    "Pourquoi n'existe-t-il pas de « meilleure stratégie de chunking » universelle, et qu'est-ce qui doit finalement décider (le type de documents ET de questions) ?",
  ] },
};
