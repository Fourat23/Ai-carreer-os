// days-enrich-reflection-301-321.mjs — Déploiement Y2 (Chantier C, option B), sous-batch SB9.
// Jours d'apprentissage 303-321 hors pilote (302/314) et hors revues (301/308/315).
// Merge PAR JOUR : `reflection` seul. Triplet : [1] prédiction · [2] diagnostic · [3] transfert/recul.

export const ENRICH_REFLECTION_301_321 = {
  303: { reflection: [
    "Ton ARCHITECTURE.md a un schéma C4 et quatre ADRs : pourquoi un schéma SANS les décisions justifiées ne suffit-il pas à comprendre POURQUOI le système est fait ainsi ?",
    "Tu choisis le niveau de détail de ton schéma : pourquoi un C4 « conteneurs » vaut-il mieux qu'un diagramme montrant chaque fonction, pour un lecteur qui découvre le projet ?",
    "Pourquoi documenter l'architecture AVANT huit semaines de code te fait-il gagner du temps, alors que « le code est sa propre doc » est une illusion répandue ?",
  ] },
  304: { reflection: [
    "Tu modélises documents, chunks, évaluations et sessions : pourquoi relier explicitement un chunk à son document ET à sa position est-il indispensable pour les citations plus tard ?",
    "Documents et évaluations n'ont pas le même cycle de vie : quel critère te fait décider de les séparer dans le schéma ou de seulement les relier ?",
    "Pourquoi un modèle de données pensé tôt évite-t-il des migrations douloureuses en cours de route, et qu'est-ce qu'un mauvais modèle rend coûteux plus tard ?",
  ] },
  305: { reflection: [
    "Tu découpes en huit jalons hebdomadaires DÉMONTRABLES : pourquoi « démontrable » est-il le mot clé, et que vaudrait un jalon formulé « j'ai avancé sur le RAG » ?",
    "Une maquette papier grossière avant de coder l'écran : pourquoi ce brouillon te fait-il gagner du temps plutôt que de coder directement l'interface ?",
    "Pourquoi planifier en jalons produisant chacun une version fonctionnelle vaut-il mieux qu'un plan « d'abord tout le backend, puis tout le front » ?",
  ] },
  306: { reflection: [
    "Tu identifies trois risques techniques majeurs et un spike de deux heures pour chacun : pourquoi BORNER le spike dans le temps, et que cherches-tu (une réponse, pas une solution finie) ?",
    "Comment choisis-tu quel risque dérisquer en premier : quel croisement (impact × incertitude) les priorise ?",
    "Pourquoi dérisquer TÔT vaut-il mieux que découvrir le problème en semaine six, et que coûte concrètement un risque majeur laissé sans réponse ?",
  ] },
  307: { reflection: [
    "Tu poses une CI « vide qui passe » avant toute fonctionnalité : pourquoi une CI verte dès le premier commit vaut-elle mieux que de l'ajouter « quand le code sera prêt » ?",
    "À deux jours du lancement tu relis la SPEC d'un œil critique : qu'est-ce que la mise en place concrète révèle que le cadrage initial, sur le papier, ignorait ?",
    "Pourquoi « poser les fondations » (dépôt, structure, CI) avant les fonctionnalités se rentabilise-t-il, et que vit celui qui les ajoute seulement en fin de projet ?",
  ] },
  309: { reflection: [
    "Ton ingestion doit résister aux fichiers « moches » (PDF mal formés, HTML sale) : pourquoi la robustesse de cette étape conditionne-t-elle la qualité de TOUT le reste du RAG ?",
    "Un document sur trente fait planter ton ingestion : l'arrêtes-tu complètement, ou l'ignores-tu en le journalisant ? Sur quoi fondes-tu ce choix ?",
    "Pourquoi dit-on que l'ingestion est la partie la plus déterminante d'un pipeline RAG, et qu'est-ce qu'une ingestion bâclée condamne irrémédiablement en aval ?",
  ] },
  310: { reflection: [
    "Tu construis le RAG core en architecture hexagonale DÈS LE DÉPART : pourquoi est-ce moins coûteux que de refactorer vers l'hexagonal plus tard, comme au jour 289 ?",
    "Tu réutilises la configuration optimale trouvée au mois 9 : pourquoi ne peux-tu pas la reprendre aveuglément, et que dois-tu revérifier sur ce nouveau corpus ?",
    "Pourquoi « repartir d'une config validée ailleurs » est-il un point de départ et non une garantie, et qu'est-ce qui change avec un corpus différent ?",
  ] },
  311: { reflection: [
    "Tu intègres un retrieval hybride validé sur un AUTRE corpus : pourquoi le garder tel quel serait une erreur, et que mesures-tu avant de le figer sur DocSense ?",
    "Sur le corpus DocSense, l'hybride+rerank pourrait ne pas gagner autant qu'ailleurs : comment le vérifies-tu, et que décides-tu s'il n'apporte rien ici ?",
    "Pourquoi une technique « qui marche » dans un projet n'est-elle jamais transférable sans re-mesure, et quel réflexe durable cela ancre-t-il ?",
  ] },
  312: { reflection: [
    "Ta génération cite les sources ET refuse si l'information est absente : pourquoi ces deux comportements ENSEMBLE font-ils un assistant documentaire digne de confiance ?",
    "Une citation doit être VÉRIFIABLE (la source contient bien l'affirmation) : pourquoi un simple numéro de source affiché ne suffit-il pas à établir la confiance ?",
    "Pourquoi la confiance dans un assistant documentaire se gagne-t-elle sur les cas où il REFUSE autant que sur ceux où il répond correctement ?",
  ] },
  313: { reflection: [
    "Un spike révèle que ton approche prévue ne marche pas comme espéré : pourquoi est-ce une BONNE nouvelle maintenant, plutôt qu'un échec, dans la vie du projet ?",
    "Tu documentes tes spikes avec les résultats ET les décisions : pourquoi consigner la DÉCISION (ce que tu changes) et pas seulement le constat technique ?",
    "Pourquoi un spike doit-il avoir une réponse quasi binaire (le risque est levé ou non) plutôt que « j'ai un peu avancé », et qu'est-ce que cette discipline t'évite ?",
  ] },
  316: { reflection: [
    "Ton golden set DocSense compte plus de quarante questions de types variés ancrées dans le corpus : pourquoi la variété des TYPES (factuel, synthèse, absent) compte-t-elle plus que le nombre brut ?",
    "Tu es tenté d'inclure surtout des questions auxquelles ton système répond déjà bien : pourquoi est-ce un piège, et quelles questions t'apportent le plus d'information ?",
    "Pourquoi ce jeu doit-il être ancré dans le VRAI corpus et le vrai besoin utilisateur, et que vaudrait une évaluation bâtie sur des questions inventées pour l'occasion ?",
  ] },
  317: { reflection: [
    "Tu branches ton harnais (retrieval + fidélité) en une commande DÈS le début du projet : pourquoi « le plus tôt possible » plutôt qu'à la fin ?",
    "Ton harnais mesure retrieval ET fidélité séparément : pourquoi ces deux niveaux, et que te masquerait un score unique de bout en bout ?",
    "Un harnais qui tourne en une commande te renvoie un score en quelques secondes après chaque changement : en quoi cette boucle de retour rapide change-t-elle ton RYTHME de développement, comparé à une évaluation manuelle occasionnelle ?",
  ] },
  318: { reflection: [
    "Ton dashboard montre les scores par VERSION (la tendance) plutôt qu'une valeur absolue isolée : pourquoi la tendance est-elle plus informative que le chiffre du jour ?",
    "Une nouvelle version fait BAISSER un score : pourquoi le dashboard te fait-il réagir là où un test ponctuel te l'aurait caché ?",
    "Pourquoi suivre la qualité DANS LE TEMPS est-il précisément ce qui transforme un projet jouet en système d'ingénierie ?",
  ] },
  319: { reflection: [
    "Ta baseline officielle v0 devient le tableau de référence contre lequel CHAQUE amélioration future sera mesurée : pourquoi ce tableau partagé vaut-il mieux que de comparer chaque essai au précédent ?",
    "Figer la baseline comme un chiffre OFFICIEL du projet (versionné, visible de tous) : pourquoi cela t'engage-t-il davantage qu'une mesure gardée dans ton coin ?",
    "Pourquoi une équipe qui ne fige pas de baseline finit-elle par « améliorer » sans jamais pouvoir le prouver, et qu'est-ce que ce point zéro rend enfin possible ?",
  ] },
  320: { reflection: [
    "`docker compose up` et tout démarre : pourquoi cette reproductibilité en une commande vaut-elle mieux qu'un README « installe ceci, puis cela » en vingt étapes ?",
    "Tu gères les secrets par environnement : pourquoi ne JAMAIS mettre une clé dans l'image Docker, et que se passe-t-il si tu la « hardcodes » dans le Dockerfile ?",
    "Pourquoi la dockerisation est-elle ce qui rend ton projet lançable par un recruteur en cinq minutes, et qu'est-ce qu'un projet non reproductible coûte en visibilité ?",
  ] },
  321: { reflection: [
    "À mi-parcours, ton projet est mesurable, reproductible et sécurisé : pourquoi ces trois propriétés, plutôt que « beaucoup de fonctionnalités », signent-elles la maturité ?",
    "Tu démontres sur une machine PROPRE (éval + dashboard + docker up) : pourquoi ce test sur une machine neuve est-il le seul juge honnête de la reproductibilité ?",
    "En entretien, tu peux lancer ton projet en direct sur la machine du recruteur et montrer ses chiffres d'évaluation : pourquoi cette démonstration en direct pèse-t-elle plus lourd que n'importe quelle ligne de ton CV ?",
  ] },
};
