// days-enrich-reflection-322-343.mjs — Déploiement Y2 (Chantier C, option B), sous-batch SB10.
// Jours d'apprentissage 323-342 hors revues (322/329/336/343). Merge PAR JOUR : `reflection` seul.
// Triplet : [1] compréhension/prédiction · [2] diagnostic/arbitrage · [3] transfert/recul.

export const ENRICH_REFLECTION_322_343 = {
  323: { reflection: [
    "Ta fonctionnalité d'analyse est un workflow EXPLICITE (résumé, points clés, questions ouvertes) plutôt qu'un agent : pourquoi ce choix pour une tâche aux étapes connues d'avance ?",
    "Le résumé produit est correct mais générique, sans les « questions ouvertes » attendues : quelle étape de ton workflow ré-examines-tu, et pourquoi la décomposition explicite facilite ce diagnostic ?",
    "Pourquoi cette fonctionnalité d'analyse est-elle « différenciante » pour DocSense, alors que simplement répondre à des questions (le RAG de base) ne l'est plus ?",
  ] },
  324: { reflection: [
    "Détecter qu'un document CONTREDIT le reste du corpus est plus dur que répondre à une question : pourquoi cela demande-t-il de confronter une affirmation à PLUSIEURS sources, et pas d'en retrouver une seule ?",
    "Ton détecteur signale une « incohérence » qui n'en est pas une (deux formulations du même fait) : comment les logs du workflow t'aident-ils à voir où le raisonnement a dérapé ?",
    "Pourquoi rendre le workflow VISIBLE dans les logs est-il ici aussi important que le résultat lui-même, du point de vue de la confiance qu'on peut lui accorder ?",
  ] },
  325: { reflection: [
    "Tu affiches le coût PAR analyse : pourquoi ce chiffre par unité est-il plus actionnable qu'une facture mensuelle globale pour décider quoi optimiser ?",
    "Une analyse coûte soudain trois fois plus cher que d'habitude : que cherchent tes logs structurés pour localiser la cause (un document énorme, une boucle imprévue) ?",
    "Pourquoi « coût maîtrisé + traces » sont-ils ce qui sépare une fonctionnalité seulement démontrable d'une fonctionnalité réellement déployable en production ?",
  ] },
  326: { reflection: [
    "Ta CI lance lint + tests + une éval « smoke » en mode replay : pourquoi cette éval de CI doit-elle rejouer des réponses enregistrées plutôt qu'appeler le vrai LLM à chaque exécution ?",
    "Ta CI est verte mais dure cinq minutes : que déplaces-tu hors du chemin critique de la CI pour garder un retour rapide, et qu'est-ce que tu gardes absolument ?",
    "Pourquoi une CI qui inclut une éval smoke attrape-t-elle une classe de régressions que le lint et les tests unitaires, seuls, laissent passer ?",
  ] },
  327: { reflection: [
    "Tu injectes un faux LLM (mock) qui renvoie une réponse fixe : qu'est-ce que ce test vérifie RÉELLEMENT — la LOGIQUE de ton workflow, pas le modèle — et pourquoi est-ce précisément ce que tu veux isoler ?",
    "Enregistrer une fois les vraies réponses du LLM puis les REJOUER (replay) en test, ou écrire un mock à la main : qu'est-ce qui distingue ces deux approches, et quand préfères-tu l'une à l'autre ?",
    "Pourquoi ne peux-tu PAS juger la « qualité des réponses » du LLM dans un test unitaire, et à quel endroit du projet cette vérification doit-elle vivre à la place ?",
  ] },
  328: { reflection: [
    "À mi-projet, un écart apparaît entre la SPEC et la réalité : pourquoi assumer une COUPE de scope explicite vaut-il mieux que tout garder et livrer en retard ?",
    "Tu dois couper une fonctionnalité pour tenir les délais : quel critère (valeur pour l'utilisateur, coût restant) te fait choisir laquelle sacrifier ?",
    "Pourquoi un bilan honnête « voici ce que j'ai coupé et pourquoi » est-il un signe de maturité plutôt qu'un aveu d'échec, aux yeux d'une équipe ?",
  ] },
  330: { reflection: [
    "Ta suite adverse (quinze cas hostiles) passe intégralement : pourquoi cela ne signifie PAS « sécurisé pour toujours », et que devient cette suite dans la vie du projet ?",
    "Une injection que tu croyais bloquée repasse après une modification de prompt : pourquoi la suite adverse aurait dû l'attraper, et qu'est-ce que ça t'apprend sur l'ordre entre CI et déploiement ?",
    "Pourquoi adapter les quinze cas hostiles AU corpus et aux usages de DocSense vaut-il mieux qu'une liste générique copiée d'ailleurs ?",
  ] },
  331: { reflection: [
    "Le LLM est indisponible au moment où l'utilisateur pose sa question : que doit-il voir, et pourquoi un message clair vaut-il infiniment mieux qu'une stacktrace ou un écran figé ?",
    "Trois pannes possibles (LLM injoignable, document corrompu, question vide) : pourquoi chacune appelle-t-elle un message DIFFÉRENT, et que se passe-t-il si tu les traites toutes de la même façon ?",
    "Pourquoi « ne jamais casser devant l'utilisateur » distingue-t-il une démo d'un produit, et qu'est-ce qu'un crash coûte à la confiance en une seule seconde ?",
  ] },
  332: { reflection: [
    "Tes logs permettent de REJOUER une session complète : pourquoi cette capacité change-t-elle tout quand un utilisateur signale « ça a mal répondu hier » ?",
    "Ton dashboard « raconte l'histoire des progrès » plutôt que d'afficher un chiffre isolé : pourquoi cette narration convainc-elle un lecteur mieux qu'un score brut ?",
    "Pourquoi l'observabilité (rejouer + raconter) répond-elle à DEUX besoins distincts — déboguer et communiquer — et qu'est-ce qui les distingue ?",
  ] },
  333: { reflection: [
    "Tu vises une couverture des CHEMINS CRITIQUES, pas 100 % : comment identifies-tu ce qui est « critique » dans DocSense, et pourquoi 100 % serait un mauvais objectif ?",
    "Un module a 95 % de couverture mais le parcours « poser une question → réponse citée » n'est pas testé de bout en bout : où est le vrai risque, et que corriges-tu en priorité ?",
    "Pourquoi la couverture de tests devient-elle un indicateur trompeur quand on la vise pour elle-même, et à quelle question devrait-elle vraiment répondre ?",
  ] },
  334: { reflection: [
    "Ton rapport met en avant les trois améliorations les plus RENTABLES (ratio gain/effort) : pourquoi ce ratio est-il plus parlant que la liste exhaustive de tout ce que tu as tenté ?",
    "Une amélioration a un gros gain mais un coût énorme, une autre un petit gain quasi gratuit : laquelle mets-tu en avant, et pourquoi le ratio gain/effort guide-t-il le récit ?",
    "Pourquoi documenter le RATIO gain/effort de tes améliorations (et pas seulement leur existence) est-il ce qui te fait passer pour un ingénieur qui priorise, et non un bricoleur ?",
  ] },
  335: { reflection: [
    "Tu gèles les fonctionnalités et arrêtes d'en ajouter : pourquoi cette discipline « finir fort » vaut-elle mieux que d'empiler des features jusqu'à la dernière minute ?",
    "Ton post-mortem d'architecture liste « trois choses à refaire » : pourquoi documenter tes propres erreurs de conception est-il précieux plutôt qu'embarrassant ?",
    "Pourquoi purger seulement la dette BLOQUANTE (et pas toute la dette) au moment du freeze est-il le bon arbitrage entre perfection et livraison ?",
  ] },
  338: { reflection: [
    "Ta démo de trois minutes est SCÉNARISÉE et répétée, en une prise fluide : pourquoi le script et la répétition valent-ils mieux qu'une démonstration improvisée « en direct » ?",
    "Ta démo ouvre sur le code puis montre la fonctionnalité : pourquoi est-ce le mauvais ordre pour capter un recruteur, et par quoi devrais-tu commencer ?",
    "Pourquoi une démo vidéo de trois minutes est-elle un actif réutilisable (candidatures, LinkedIn) qu'aucune description écrite ne remplace ?",
  ] },
  339: { reflection: [
    "Tu racontes un projet en HISTOIRE (contexte → décisions → résultats → apprentissages) plutôt qu'en liste de technologies : pourquoi cette structure est-elle plus mémorable pour un recruteur ?",
    "Un de tes projets a un résultat modeste : comment le racontes-tu honnêtement tout en valorisant les DÉCISIONS et les apprentissages, sans exagérer les chiffres ?",
    "Pourquoi la capacité à dire ce que tu as APPRIS d'un projet (au-delà de l'avoir livré) signale-t-elle un ingénieur qui progresse, là où une liste de réussites sans recul sonne creux ?",
  ] },
  340: { reflection: [
    "Un recruteur ouvre ton GitHub : pourquoi une description, des topics et un README à jour sur CHAQUE dépôt changent-ils sa première impression en quelques secondes ?",
    "Tes sept dépôts sont de qualité inégale : lesquels épingles-tu, et comment gères-tu les moins aboutis plutôt que de tout exposer sur le même plan ?",
    "Pourquoi le README de PROFIL (la page d'accueil de ton GitHub) est-il l'équivalent d'une vitrine, et que doit-il accomplir en priorité pour un visiteur pressé ?",
  ] },
  341: { reflection: [
    "Ton schéma doit être lisible en trente secondes ET amorcer cinq questions que tu maîtrises : pourquoi conçois-tu le schéma pour ORIENTER l'entretien vers tes points forts ?",
    "Entre un schéma trop détaillé (chaque fonction) et un schéma trop vague, quel niveau choisis-tu pour que l'interlocuteur pose les BONNES questions, et pourquoi ?",
    "Pourquoi « préparer les questions que le schéma va susciter » est-il une technique d'entretien plus puissante que de réciter une présentation apprise par cœur ?",
  ] },
  342: { reflection: [
    "Le test « un inconnu comprend DocSense en trois minutes » : pourquoi ce regard neuf révèle-t-il des incohérences que TOI, à force de connaître le projet, ne vois plus ?",
    "Tes sept projets forment-ils une TRAJECTOIRE cohérente ou une collection dispersée : comment vérifies-tu que l'ensemble raconte une progression, et pas une suite d'exercices sans lien ?",
    "Pourquoi la cohérence de l'ENSEMBLE du portfolio compte-t-elle autant que la qualité de chaque projet pris isolément, du point de vue d'un recruteur ?",
  ] },
};
