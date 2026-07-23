// days-enrich-reflection-271-300.mjs — Déploiement Y2 (Chantier C, option B), sous-batch SB8.
// Jours d'apprentissage 271-300 hors pilote (274/288) et hors revues (273/280/287/294).
// Merge PAR JOUR : `reflection` seul. Triplet : [1] prédiction · [2] diagnostic · [3] transfert/recul.

export const ENRICH_REFLECTION_271_300 = {
  271: { reflection: [
    "Ton rapport montre « avant 0,62 → après 0,78 » avec le détail par amélioration : pourquoi ce format prouve-t-il la valeur bien mieux qu'une capture d'écran de l'assistant qui répond bien ?",
    "Tu ne montres que le score final, sans le tableau par amélioration : qu'est-ce qu'un décideur ne peut plus vérifier, et que doit contenir le rapport pour rester crédible ?",
    "Pourquoi « prouver que c'est bon » (chiffres, avant/après) plutôt que « montrer que ça marche » (une démo) est-il exactement ce qu'un lead cherche dans une revue de code ?",
  ] },
  272: { reflection: [
    "Ton ADR n°7 documente trois décisions structurantes de DocQA : pourquoi une décision consignée SANS ses alternatives écartées devient-elle inutile six mois plus tard ?",
    "Tu as trois minutes de démo : quel fil (problème → chiffres d'éval → une décision clé) racontes-tu, et pourquoi les chiffres d'évaluation sont-ils ici ton meilleur argument ?",
    "Pourquoi ce projet (RAG évalué, chiffré, sécurisé) est-il la pièce maîtresse de ton portfolio, et qu'est-ce qu'il prouve qu'un projet jamais évalué ne prouvera jamais ?",
  ] },
  275: { reflection: [
    "Ton agent tourne en boucle sans jamais conclure : quel garde-fou l'aurait arrêté, et pourquoi la boucle est-elle le mode d'échec le plus courant d'un agent ?",
    "Un agent « dérive » de son objectif initial au fil des tours : comment le repères-tu dans les traces, et qu'est-ce qui distingue une dérive d'une exploration légitime ?",
    "Pourquoi documenter tes propres échecs d'agent (vécus, avec traces) vaut-il mieux, en entretien, que réciter une liste de modes d'échec lue en ligne ?",
  ] },
  276: { reflection: [
    "Ton vérificateur lit tes docs et signale les contradictions : pourquoi cette tâche justifie-t-elle un agent (exploration, décisions successives) plutôt qu'un simple script linéaire ?",
    "L'agent signale une « contradiction » qui n'en est pas une : comment les traces t'aident-elles à comprendre son raisonnement fautif, et que corriges-tu ?",
    "Qu'est-ce qui fait qu'une tâche est un BON candidat pour un agent plutôt qu'un mauvais, et pourquoi la majorité des tâches n'en sont pas ?",
  ] },
  277: { reflection: [
    "Ton agent oublie ce qu'il a fait au tour précédent : pourquoi, et qu'est-ce que TON code doit gérer que le modèle ne gère pas de lui-même ?",
    "La mémoire de l'agent grossit à chaque tour et sature la fenêtre de contexte : comment décides-tu ce que tu gardes, ce que tu résumes et ce que tu jettes ?",
    "Quelle est la limite fondamentale de la « mémoire » d'un agent, et pourquoi est-ce exactement le même problème que la gestion de session d'un RAG (jour 234) ?",
  ] },
  278: { reflection: [
    "Pour une tâche à étapes FIXES et connues d'avance, pourquoi un agent (qui redécide à chaque tour) est-il souvent le mauvais choix face à un workflow ?",
    "Tu classes cinq tâches en agent / workflow / script : sur quels trois critères (coût, fiabilité, besoin d'adaptation) fondes-tu chaque décision ?",
    "Pourquoi « choisir le niveau le plus SIMPLE qui marche » est-il une règle d'ingénieur, et que coûte concrètement un agent là où un script aurait suffi ?",
  ] },
  279: { reflection: [
    "Après avoir observé les modes d'échec des agents, quelle règle personnelle tires-tu sur les rares cas où un agent reste justifié MALGRÉ ses risques ?",
    "Un collègue veut « mettre un agent » sur une tâche simple et répétitive : quels arguments (fiabilité, coût, débogage) lui opposes-tu, et à quelle condition cèdes-tu ?",
    "Pourquoi ta doctrine sur les agents doit-elle venir de TA pratique (ce que tu as cassé puis réparé) plutôt que d'un article, pour être défendable en entretien ?",
  ] },
  281: { reflection: [
    "Tu transformes ton vérificateur agentique en workflow à étapes fixes : qu'est-ce que tu GAGNES (fiabilité, coût, débogage) et qu'est-ce que tu PERDS (adaptation) ?",
    "Sur quelle mesure précise (coût, latence, fiabilité) le workflow bat-il l'agent pour la même tâche, et comment le PROUVES-tu au lieu de l'affirmer ?",
    "Pourquoi un workflow explicite inspire-t-il plus confiance en production qu'un agent, et dans quel cas cette prévisibilité ne suffit-elle plus ?",
  ] },
  282: { reflection: [
    "Chaînage, parallélisation, routage, évaluateur : pour une tâche « résumer, puis traduire, puis vérifier », lequel s'applique et pourquoi ?",
    "Tu as une tâche où plusieurs sous-tâches INDÉPENDANTES prennent chacune du temps : quel pattern réduit la latence, et à quelle condition fonctionne-t-il vraiment ?",
    "Pourquoi ces quatre patterns couvrent-ils l'essentiel des besoins réels, et qu'est-ce que les reconnaître t'évite (réinventer une orchestration à chaque tâche) ?",
  ] },
  283: { reflection: [
    "Traiter 500 000 documents en un seul appel est impossible : par quels moyens (découpage, parallélisation, reprise) une orchestration rend-elle la tâche faisable ?",
    "Ton traitement plante au document 300 000 : pourquoi la REPRISE (ne pas tout recommencer) est-elle la propriété non négociable, et comment la conçois-tu ?",
    "Tu parallélises des milliers d'appels : quelle limite (rate limit de l'API, saturation) t'oblige à réguler le débit, et que se passe-t-il si tu lances tout d'un coup ?",
  ] },
  284: { reflection: [
    "Ta clé de cache est un hash de (prompt + modèle) : pourquoi inclure le modèle dans la clé, et que se passerait-il en changeant de modèle si tu l'oubliais ?",
    "Ton cache affiche un taux de hit de 5 % : pourquoi cela peut être NORMAL (des prompts presque tous différents) plutôt qu'un échec du cache ?",
    "Dans quel cas un cache est-il carrément DANGEREUX, et quelle propriété d'une requête (déterministe, sans données fraîches) la rend réellement cachable ?",
  ] },
  285: { reflection: [
    "Pour réduire le coût d'un workflow, tu commences par le DÉCOMPOSER poste par poste : pourquoi cette décomposition avant toute optimisation, et que cherches-tu à isoler ?",
    "Trois optimisations s'offrent à toi (modèle plus petit sur les étapes simples, cache, prompts plus courts) : comment décides-tu laquelle attaquer en premier ?",
    "Pourquoi estimer le coût AVANT de lancer un workflow à l'échelle te distingue-t-il, et que risque celui qui « lance d'abord pour voir » ?",
  ] },
  286: { reflection: [
    "Face à une tâche IA, tu montes l'échelle script → workflow → agent : pourquoi commencer par le bas et ne monter que sur PREUVE d'insuffisance ?",
    "Comment reconnais-tu qu'un workflow ne suffit plus et qu'un agent devient justifié : quel signal concret déclenche la montée d'un cran ?",
    "Pourquoi cette doctrine « le niveau le plus simple qui marche » te fait-elle gagner du temps ET de l'argent bien au-delà de ce seul projet ?",
  ] },
  289: { reflection: [
    "Tu refactores DocQA pour que changer de base vectorielle revienne à changer UN fichier : qu'est-ce qui, dans le code d'origine, rendait ce changement coûteux, et qu'a changé le port/adapter ?",
    "Comment PROUVES-tu concrètement que ton architecture hexagonale tient (le test « je remplace l'adapter et le cœur ne bouge pas d'une ligne ») ?",
    "Pourquoi le cœur métier ne doit-il RIEN savoir de la base vectorielle ni de l'API LLM, et qu'est-ce que cette ignorance te fait gagner quand l'écosystème change ?",
  ] },
  290: { reflection: [
    "Une tâche longue (ingérer mille documents) bloque la réponse à l'utilisateur : comment une file d'attente découple-t-elle « demander » de « faire », et que gagne l'utilisateur ?",
    "Où précisément, dans DocSense, une architecture événementielle aide-t-elle, et où serait-elle au contraire une complexité gratuite ?",
    "Pourquoi le découplage par événements ajoute-t-il sa propre complexité (suivi, échecs asynchrones), et à quelle échelle ce coût devient-il justifié ?",
  ] },
  291: { reflection: [
    "Pour un nouveau projet mené à une personne, pourquoi un monolithe modulaire bat-il presque toujours des microservices, malgré leur réputation ?",
    "À quel signe concret (plusieurs équipes, besoin de scaler une partie indépendamment) les microservices deviennent-ils justifiés, et que coûtent-ils avant ce seuil ?",
    "Pourquoi « monolithe modulaire » n'est-il pas un aveu de paresse, et qu'est-ce que le mot « modulaire » garantit pour une évolution future ?",
  ] },
  292: { reflection: [
    "Tu repères un pattern (par exemple Strategy) dans ton propre code : pourquoi le NOMMER change-t-il ta capacité à communiquer avec d'autres développeurs ?",
    "Tu identifies deux anti-patterns chez toi : pourquoi les reconnaître vaut-il mieux que suivre aveuglément une liste de « bonnes pratiques » ?",
    "Pourquoi appliquer un pattern « parce que c'est un pattern connu » peut être une faute, et qu'est-ce qui doit VRAIMENT décider de son usage ?",
  ] },
  293: { reflection: [
    "On te demande de designer un système de traitement de documents à l'échelle : pourquoi commences-tu par CLARIFIER les besoins (volume, latence, budget) avant de dessiner quoi que ce soit ?",
    "En 45 minutes tu ne peux pas tout traiter : comment priorises-tu ce que tu abordes, et pourquoi énoncer tes trade-offs à voix haute compte autant que le schéma ?",
    "Pourquoi un exercice de design système évalue-t-il ton RAISONNEMENT plus que ta solution, et qu'écoute réellement un recruteur pendant que tu dessines ?",
  ] },
  295: { reflection: [
    "Parmi les risques du référentiel OWASP LLM, l'« excès d'autonomie » est le plus sous-estimé : quelle question te poses-tu sur ce que ton système peut FAIRE seul, sans validation humaine, et pourquoi ce risque grandit-il avec les agents ?",
    "La « fuite via le contexte » : comment une donnée sensible glissée dans le contexte peut-elle ressortir là où tu ne l'attends pas, et comment l'audites-tu ?",
    "Pourquoi auditer contre un RÉFÉRENTIEL (OWASP) vaut-il mieux que chercher des failles au hasard, et qu'est-ce qu'un référentiel t'évite d'oublier ?",
  ] },
  296: { reflection: [
    "Tu traces ce qui ENTRE, TRANSITE et PART vers des APIs externes dans DocSense : pourquoi le point « part vers l'extérieur » est-il le plus sensible, et que devient une donnée envoyée à une API tierce ?",
    "Une donnée personnelle n'a pas besoin d'être conservée après usage : pourquoi la politique de RÉTENTION (combien de temps on garde) est-elle un choix de sécurité et pas un détail ?",
    "Pourquoi « quelles données de mes utilisateurs partent vers des services externes ? » est-elle une question à laquelle un dev IA doit savoir répondre AVANT qu'un juriste ne la pose ?",
  ] },
  297: { reflection: [
    "Un identifiant de corrélation relie tous les logs d'UNE session : pourquoi est-ce indispensable pour déboguer un problème signalé par un utilisateur précis ?",
    "Ton app IA « répond mal parfois » : sans logs structurés, pourquoi ne peux-tu pas reconstituer ce qui s'est passé, et que dois-tu logger à chaque appel ?",
    "Pourquoi l'observabilité d'une app IA est-elle ENCORE plus critique que celle d'une app classique, sachant que le comportement du modèle est non déterministe ?",
  ] },
  298: { reflection: [
    "Une clé d'API a été committée dans un dépôt : pourquoi la retirer du dernier commit ne suffit-il PAS, et quelle est la seule vraie réaction (la rotation) ?",
    "Tu sépares tes secrets par environnement (dev / prod) : pourquoi ne jamais réutiliser la même clé partout, et que limite cette séparation le jour d'une fuite ?",
    "Pourquoi l'audit des secrets sur TOUS tes dépôts est-il un réflexe périodique et non ponctuel, et qu'est-ce qui rend une fuite de secret si coûteuse ?",
  ] },
  299: { reflection: [
    "Tu modélises les menaces de DocSense (acteurs, surfaces d'attaque) : pourquoi PRIORISER cinq menaces vaut-il mieux que lister toutes les failles imaginables ?",
    "Pour une menace donnée, comment décides-tu si elle mérite une contre-mesure maintenant ou si le risque est acceptable : quels axes (impact, probabilité) croises-tu ?",
    "Modéliser d'abord les acteurs, les surfaces et les pires scénarios avant de coder : sur quel autre type de décision d'ingénierie (fiabilité, coût, pannes) ce réflexe « penser aux pires cas en premier » se transpose-t-il ?",
  ] },
  300: { reflection: [
    "Tu synthétises ta sécurité en couches ET tu corriges trois VRAIES failles trouvées : pourquoi « corriger des failles réelles » vaut-il mieux qu'une checklist théorique cochée ?",
    "Ta posture de sécurité doit se raconter d'un coup d'œil : quelles couches (entrée → traitement → sortie → données → logs) énonces-tu, et ce que chacune protège ?",
    "Pourquoi la sécurité d'une app IA n'est-elle jamais « finie » mais une posture à réviser, et qu'est-ce qui change (nouvelles attaques, nouveaux usages) qui l'impose ?",
  ] },
};
