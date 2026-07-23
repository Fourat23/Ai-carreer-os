// days-enrich-reflection-181-210.mjs — Déploiement Y2 (Chantier C, option B), sous-batch SB5.
// Jours d'apprentissage 181-209 hors pilote (190/194/197) et hors revues (182/189/196/203/210).
// Merge PAR JOUR : `reflection` seul. Triplet : [1] prédiction · [2] diagnostic · [3] transfert/recul.

export const ENRICH_REFLECTION_181_210 = {
  181: { reflection: [
    "Un tiers clone ton projet et obtient des chiffres légèrement différents des tiens : quelles sources de hasard non fixées (seed du split, du modèle) l'expliquent le plus souvent ?",
    "Ton pipeline tourne « chez toi » mais pas ailleurs : quels implicites (chemins, versions de librairies, données non téléchargeables) dois-tu rendre explicites pour qu'une seule commande suffise ?",
    "Pourquoi la reproductibilité est-elle la condition d'ENTRÉE d'une revue de modèle en entreprise, et que se passe-t-il si le relecteur ne peut pas rejouer tes métriques ?",
  ] },
  183: { reflection: [
    "Ton neurone sur le ET logique converge vers des sorties proches de [0, 0, 0, 0.9] et non exactement [0, 0, 0, 1] : pourquoi la sigmoïde interdit-elle d'atteindre 0 et 1 pile ?",
    "Tu retires la sigmoïde « pour simplifier » : en quoi ton neurone cesse-t-il d'apprendre une frontière utile, et à quoi se réduit-il alors ?",
    "Le même calcul « peser, sommer, activer » se répète des milliards de fois dans un grand modèle : en quoi maîtriser cette unité minuscule change-t-il ta façon de PARLER des LLM en entretien ?",
  ] },
  184: { reflection: [
    "Avec un learning rate trop grand, ta courbe de loss oscille ou explose : décris ce qui se passe géométriquement dans la « vallée », et pourquoi un pas trop petit crée le problème inverse ?",
    "Ta loss stagne haut sans bouger : comment distingues-tu un learning rate « trop lent » d'un entraînement réellement « bloqué », et que testes-tu pour trancher ?",
    "Lire une courbe de loss (converge / oscille / stagne) est le geste de diagnostic n°1 : sur quel entraînement futur (un fine-tuning coûteux en calcul) ce réflexe t'évitera-t-il de brûler des heures pour rien ?",
  ] },
  185: { reflection: [
    "Tu oublies `zero_grad()` dans ta boucle d'entraînement : que deviennent les gradients d'une itération à l'autre, et quel effet visible cela produit-il sur l'apprentissage ?",
    "`loss.backward()` a calculé les gradients : pourquoi la mise à jour des poids doit-elle se faire dans un bloc `no_grad()`, et que se passe-t-il si tu l'oublies ?",
    "Tu peux comparer le gradient calculé par autograd à ton calcul manuel du neurone : pourquoi cette vérification vaut-elle mieux que « faire confiance au framework », et qu'est-ce qu'elle ancre pour la suite ?",
  ] },
  186: { reflection: [
    "Un neurone seul échoue sur le XOR mais un réseau à une couche cachée le résout : qu'est-ce que la couche cachée « ajoute » (une re-représentation de l'espace) que le neurone seul ne peut pas offrir ?",
    "Tu retires la non-linéarité (ReLU) entre deux couches Linear : pourquoi le XOR échoue-t-il de nouveau, et à quoi se réduit alors l'empilement de deux transformations linéaires ?",
    "Réduire la couche cachée à un seul neurone fait réapparaître l'échec : pourquoi cette ablation est-elle une meilleure PREUVE de compréhension que le simple constat « ça marche » ?",
  ] },
  187: { reflection: [
    "Tu évalues ton modèle en mode `train()` au lieu de `eval()` : pourquoi certains chiffres sont-ils faussés, et quel type de composant se comporte différemment entre les deux modes ?",
    "Tes courbes montrent le train qui continue de baisser pendant que la validation remonte : que fais-tu, et à quel moment aurais-tu idéalement dû arrêter l'entraînement ?",
    "Un batch, une epoch, une itération : pourquoi le découpage en batchs est-il à la fois une affaire de mémoire ET de qualité du gradient, et que changerait un batch de taille 1 ?",
  ] },
  188: { reflection: [
    "Ton dropout reste actif à l'évaluation parce que tu as oublié `eval()` : dans quel sens tes scores de validation sont-ils faussés, et pourquoi ?",
    "Tu changes le dropout ET la taille du réseau en même temps entre deux runs : pourquoi ne peux-tu plus attribuer l'amélioration à l'un ou à l'autre, et que t'impose la méthode ?",
    "Provoquer volontairement un overfitting avant de le soigner : pourquoi cette démarche (créer le problème pour le VOIR) est-elle plus formatrice que d'appliquer le dropout « par précaution » ?",
  ] },
  191: { reflection: [
    "Deux phrases synonymes sans aucun mot commun obtiennent une similarité cosinus élevée : qu'est-ce que cela prouve sur ce que l'embedding capture, par rapport à une comparaison mot à mot ?",
    "« avocat du barreau » et « avocat en salade » : pourquoi leur similarité est-elle plus basse que celle de deux vrais synonymes, et qu'est-ce que le contexte a désambiguïsé ?",
    "La similarité cosinus mesure une proximité de sens, pas une pertinence : pourquoi deux textes « proches » ne se répondent pas forcément, et quelle limite cela annonce pour une recherche sémantique ?",
  ] },
  192: { reflection: [
    "Dans « la souris ne répond plus », le mot « souris » doit basculer vers son sens informatique : comment l'attention, via les affinités entre requête et clés, opère-t-elle ce basculement ?",
    "Pourquoi trois rôles distincts (requête, clé, valeur) plutôt qu'un seul vecteur — qu'ont de différent « ce que je cherche », « ce que j'affiche pour être trouvé » et « ce que je transmets » ?",
    "L'attention fait regarder chaque token à tous les autres (coût quadratique) : en quoi ce coût justifie-t-il une fenêtre de contexte bornée, et quelle conséquence d'ingénierie en découle ?",
  ] },
  193: { reflection: [
    "Sans encodage de position, « chien mord homme » et « homme mord chien » seraient identiques pour le modèle : pourquoi, et qu'apporte la position au traitement PARALLÈLE de l'attention ?",
    "La sortie du transformer est une distribution de probabilités sur tout le vocabulaire : à quelle étape précise intervient la température, et que règle-t-elle exactement ?",
    "Le modèle « géométrise le plausible, pas le vrai » : à quelle étape du trajet cette limite s'installe-t-elle, et pourquoi annonce-t-elle les hallucinations ?",
  ] },
  195: { reflection: [
    "Si une étape du trajet (tokens → embeddings → attention → distribution) résiste à l'écriture de ta note : qu'est-ce que ce blocage révèle, selon la technique de Feynman ?",
    "Tu écris pour un dev backend précis (il connaît les caches, les coûts, les APIs) : quelle section — les implications pour SON code — distingue ta note d'un simple résumé de cours ?",
    "Publier cette note est un livrable de portfolio : pourquoi « expliquer par écrit » est-elle une compétence évaluée en soi, au-delà de prouver que tu as compris ?",
  ] },
  198: { reflection: [
    "Tu appelles l'API sans fixer `max_tokens` : quel risque concret sur la facture, et pourquoi la SORTIE est-elle la partie chère et non bornée par défaut ?",
    "Un appel échoue (rate limit, timeout) et ton script s'arrête sur une stacktrace brute : pourquoi est-ce inacceptable dès la première version, et que fais-tu à la place ?",
    "Un même system prompt sert de spécification stable à des milliers d'appels : pourquoi le placer là, plutôt que de répéter les consignes dans chaque message utilisateur, rend-il le comportement versionnable et testable ?",
  ] },
  199: { reflection: [
    "Tu lances trois fois le même prompt à température 1 et obtiens trois réponses différentes : pourquoi, et que règle exactement la température — la variabilité ou la fiabilité ?",
    "Un extracteur JSON « marche une fois sur deux » : pourquoi la température laissée par défaut en est-elle souvent la cause, et quel réglage appliques-tu pour une sortie destinée à une machine ?",
    "Température 0 ne garantit ni la vérité ni un déterminisme absolu : pourquoi un modèle « sûr de lui » peut-il être sûr ET faux, et quelle confusion la température ne corrige-t-elle PAS ?",
  ] },
  200: { reflection: [
    "Le vingtième tour d'une conversation coûte bien plus que le deuxième : pourquoi, et qu'est-ce qui se « re-paie » intégralement à chaque appel ?",
    "On te demande le coût d'une feature à grande échelle : quelles hypothèses poses-tu explicitement, et pourquoi une fourchette est-elle plus crédible qu'un chiffre unique ?",
    "Parmi les leviers (modèle plus petit, cache du system prompt, troncature de l'historique), lequel attaques-tu en premier — et comment sais-tu OÙ se concentre réellement ta dépense ?",
  ] },
  201: { reflection: [
    "Tu demandes une référence bibliographique précise sur un sujet pointu : pourquoi le modèle « complète le motif » avec un titre plausible mais faux, au lieu d'avouer qu'il ne sait pas ?",
    "Tu refais la demande en FOURNISSANT les faits dans le contexte + « si l'info n'y est pas, dis-le » : pourquoi cette contre-épreuve déplace-t-elle le problème de « la mémoire du modèle » vers « ce que JE mets dans le contexte » ?",
    "Pourquoi « demande-lui d'être honnête » ne suffit-il pas à éliminer l'invention, et quelle parade structurelle plus solide cette expérience préfigure-t-elle ?",
  ] },
  202: { reflection: [
    "Tu évalues un modèle sur des questions dont tu ne connais pas toi-même la réponse : pourquoi ton banc d'essai ne vaut-il alors rien, et quelle est la première condition d'un juge fiable ?",
    "Ta grille distingue « faux » et « inventé » : pourquoi ces deux catégories n'appellent-elles pas les mêmes parades, et laquelle est la plus dangereuse en production ?",
    "Évaluer un système non déterministe sur UN seul passage : pourquoi est-ce une faute de méthode, et qu'apporte le fait d'évaluer à température 0 (ou sur plusieurs passages) ?",
  ] },
  204: { reflection: [
    "Tu fais évoluer un prompt de v0 flou vers une spécification (rôle, format, cas limites) : pourquoi rejouer chaque version sur les MÊMES entrées difficiles est-il la seule preuve de progrès ?",
    "Ton prompt marche sur des entrées faciles mais déraille sur un texte vide, ambigu ou hostile : pourquoi ce sont ces cas-là qui révèlent la robustesse, et que dois-tu spécifier pour eux ?",
    "Un tiers qui lit ton prompt sans connaître la tâche devrait pouvoir PRÉDIRE la sortie attendue : s'il n'y parvient pas, quelle partie de ta spécification manque ou reste ambiguë ?",
  ] },
  205: { reflection: [
    "Ton JSON est bien formé mais un montant est manifestement inventé : pourquoi valider « c'est bien du JSON » ne suffit-il pas, et quel second étage de validation (invariants métier) faut-il ajouter ?",
    "En cas d'échec de parsing, tu renvoies au modèle l'ERREUR précise au lieu de re-tenter à l'aveugle : pourquoi le taux de succès au deuxième essai s'en trouve-t-il bien meilleur ?",
    "« Le LLM propose, ton code dispose » : pourquoi un extracteur qui échoue PROPREMENT sur 3 % des cas vaut-il mieux qu'un qui invente sur 3 %, et où ce principe resservira-t-il ?",
  ] },
  206: { reflection: [
    "Tous tes exemples few-shot de classification appartiennent à la même classe : quel biais induis-tu sur les prédictions, et pourquoi le modèle « imite tout », y compris tes déséquilibres ?",
    "Tu ajoutes trois exemples et le score ne bouge pas : qu'est-ce que ça t'apprend — la tâche était déjà claire en zero-shot, ou tes exemples sont mal choisis — et comment tranches-tu entre les deux ?",
    "Un seul exemple de cas limite (« ??? → autre ») enseigne plus qu'un paragraphe de consignes : pourquoi la démonstration bat-elle la description pour le format, et quelle est la limite de cette approche ?",
  ] },
  207: { reflection: [
    "Le modèle « demande » d'appeler un outil, il ne l'exécute jamais lui-même : où passe exactement la frontière de confiance, et pourquoi ton code doit-il garder le monopole de l'exécution ?",
    "Tu utilises `eval()` sur l'expression de calcul fournie par le modèle : pourquoi est-ce LA faille à ne jamais commettre, et que fais-tu à la place ?",
    "Une question ne nécessite aucun outil (« quelle heure est-il ? » sans outil d'horloge) : pourquoi l'assistant doit-il savoir NE PAS appeler, et que révèle un assistant qui appelle la météo au hasard ?",
  ] },
  208: { reflection: [
    "Ta feature IA est dans le chemin critique d'une page et l'API tombe pendant trente minutes : que vit ton utilisateur, et qu'aurait changé une dégradation gracieuse ?",
    "Tu dois logger le coût et gérer les retries : pourquoi un module d'appel UNIQUE vaut-il mieux que des appels éparpillés dans le code, surtout quand un deuxième usage arrivera ?",
    "La question d'architecte « si l'API disparaît une heure, que vit mon utilisateur ? » : pourquoi la réponse « rien de grave » est-elle le vrai critère d'une intégration réussie ?",
  ] },
  209: { reflection: [
    "Parmi les cinq propriétés (non-déterminisme, latence, coût, faillibilité, dérive), laquelle impose la validation systématique des sorties, et laquelle impose des prompts versionnés et des évals rejouables ?",
    "En revue de conception, un collègue lance « on n'a qu'à mettre un appel GPT ici » : quelles questions de ta grille poses-tu pour rendre la discussion sérieuse ?",
    "Pourquoi cette grille de cinq propriétés, adossée à TES expériences des jours 197-208, tient-elle en entretien là où des généralités lues en ligne s'effondrent à la première question ?",
  ] },
};
