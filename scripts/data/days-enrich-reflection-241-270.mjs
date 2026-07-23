// days-enrich-reflection-241-270.mjs — Déploiement Y2 (Chantier C, option B), sous-batch SB7.
// Jours d'apprentissage 242-270 hors pilote (241/253/260) et hors revues (245/252/259/266).
// Merge PAR JOUR : `reflection` seul. Triplet : [1] prédiction · [2] diagnostic · [3] transfert/recul.

export const ENRICH_REFLECTION_241_270 = {
  242: { reflection: [
    "Tu changes de modèle d'embedding mais gardes l'ancien index : pourquoi les nouvelles questions ne « matchent » plus rien, et qu'est-ce que ça t'apprend sur ce qui invalide quoi ?",
    "Tu dois pouvoir reconstruire ton index à l'identique : quelles informations (modèle, taille de chunk, version du code) dois-tu enregistrer AVEC lui pour le reproduire ou le migrer ?",
    "Pourquoi versionner l'index — et pas seulement le code — devient-il vital dès que plusieurs personnes ou environnements partagent le même RAG ?",
  ] },
  243: { reflection: [
    "Tu compares deux modèles d'embedding sur ton golden set : pourquoi mesurer l'impact sur TON retrieval vaut-il mieux que de te fier au classement d'un benchmark public ?",
    "Un modèle est meilleur en moyenne mais plus lent, plus cher et de plus grande dimension : sur quels critères tranches-tu pour ton cas concret ?",
    "Un modèle d'embedding entraîné surtout sur de l'anglais : quelle limite anticipes-tu sur un corpus français, et comment la vérifies-tu avant de t'engager dessus ?",
  ] },
  244: { reflection: [
    "Tu figes ta configuration de retrieval « optimale » : pourquoi cette optimalité n'est-elle valable que pour TON corpus et TES questions, et non universelle ?",
    "Tu dois garder la trace du POURQUOI de chaque paramètre : quel format (les décisions ET les mesures qui les justifient) empêche le prochain lecteur de les changer à l'aveugle ?",
    "Pourquoi une configuration « qui marche » mais non documentée est-elle déjà une dette, même quand elle donne de bons résultats aujourd'hui ?",
  ] },
  246: { reflection: [
    "Ta recherche vectorielle rate une requête contenant une référence exacte (un code produit, un numéro d'article) : pourquoi la recherche lexicale la retrouve-t-elle là où le sémantique échoue ?",
    "Construis un exemple où le lexical réussit là où le vectoriel rate, et un autre inverse : qu'est-ce que chaque méthode « voit » que l'autre ignore ?",
    "Pourquoi ni le lexical seul ni le vectoriel seul ne suffisent en général, et qu'est-ce que ce constat annonce pour la suite du cours ?",
  ] },
  247: { reflection: [
    "Les scores lexicaux et vectoriels ne sont pas sur la même échelle : pourquoi ne peux-tu pas simplement les additionner, et comment le RRF contourne-t-il ce problème en travaillant sur les RANGS ?",
    "Tu testes l'hybride sur des questions où chaque méthode seule échoue : que dois-tu observer pour conclure que la fusion apporte réellement quelque chose, et pas juste du bruit ?",
    "L'hybride ajoute de la complexité : dans quel cas le gain ne justifie PAS ce coût, et comment le saurais-tu autrement qu'à l'intuition ?",
  ] },
  248: { reflection: [
    "L'hybride compare la question à des chunks via des vecteurs pré-calculés séparément ; le reranker LIT la paire (question, chunk) ensemble : pourquoi cette lecture conjointe capture-t-elle une pertinence que l'hybride rate ?",
    "Tu rerankes un top-20 vers un top-5 : pourquoi partir d'un top-20 plutôt que du top-5 direct, et quel est le coût de cette étape supplémentaire ?",
    "Le reranker est nettement plus lent : dans quel budget de latence devient-il un luxe qu'on ne peut plus s'offrir, et que sacrifies-tu alors ?",
  ] },
  249: { reflection: [
    "Tu mesures vectoriel / lexical / hybride / hybride+rerank sur les mêmes quinze questions : pourquoi cette progression contrôlée prouve-t-elle la contribution de CHAQUE étage mieux qu'un score global ?",
    "Un étage (par exemple le reranking) n'apporte presque rien sur ton corpus : que décides-tu, et pourquoi le garder « au cas où » est-il une mauvaise réponse d'ingénieur ?",
    "Cette démarche « retirer un étage pour voir ce qu'on perd » est exactement l'ablation vue en deep learning (jour 186) : quel principe commun relie ces deux usages ?",
  ] },
  250: { reflection: [
    "Ton RAG met huit secondes à répondre : pourquoi chronométrer CHAQUE étage avant d'optimiser, et pourquoi cherches-tu le goulot d'étranglement plutôt que la moyenne ?",
    "Tu dois passer sous trois secondes : entre réduire k, ajouter du cache et changer de reranker, comment décides-tu quel levier actionner en premier ?",
    "Pourquoi raisonner en PERCENTILE (le 95e) plutôt qu'en moyenne pour la latence, et qu'est-ce que la moyenne cache sur l'expérience réelle des utilisateurs ?",
  ] },
  251: { reflection: [
    "Tu figes ta configuration finale (hybride + rerank) : pourquoi ce « gel » sur une preuve chiffrée est-il la condition pour construire l'évaluation du mois suivant sur du solide ?",
    "Comment résumes-tu en une page les décisions de retrieval pour qu'un tiers comprenne le POURQUOI sans relire tout ton historique d'expériences ?",
    "Pourquoi « figer » ne signifie PAS « ne plus jamais y toucher », et à quelle condition précise (une nouvelle preuve chiffrée) rouvres-tu cette configuration ?",
  ] },
  254: { reflection: [
    "Ton retrieval a un rappel@5 de 0,6 : qu'est-ce que ça signifie concrètement, et pourquoi ce chiffre est-il le PLAFOND de ce que ta génération pourra faire ?",
    "Rappel@k et précision@k : laquelle prime pour un RAG, et pourquoi rater le bon chunk est-il plus grave que d'en ramener quelques-uns d'inutiles ?",
    "Pourquoi évaluer le retrieval SÉPARÉMENT de la génération est-il indispensable, et que t'empêcherait de diagnostiquer un score global de bout en bout ?",
  ] },
  255: { reflection: [
    "Tu utilises un LLM pour juger la fidélité des réponses aux sources : pourquoi un prompt de jugement STRICT (critères explicites, exemples) vaut-il mieux qu'un « note la qualité sur 10 » ?",
    "Ton juge LLM note tout le monde généreusement autour de 8/10 : quel problème de calibration cela révèle-t-il, et comment l'ancres-tu sur des jugements humains ?",
    "Pourquoi utiliser un LLM pour juger un LLM n'est PAS forcément circulaire, à quelle condition, et quelle est la limite fondamentale de cette approche ?",
  ] },
  256: { reflection: [
    "Une réponse est fidèle aux sources fournies mais factuellement fausse (les sources l'étaient) : quelle dimension est bonne, laquelle est mauvaise, et pourquoi faut-il les séparer ?",
    "Une réponse exacte mais qui ne répond pas vraiment à la question posée : quelle dimension le détecte, et pourquoi l'exactitude seule ne suffit-elle pas à juger un RAG ?",
    "Pourquoi mesurer ces trois dimensions séparément (plutôt qu'un « bon / pas bon » global) change-t-il ce que tu peux CORRIGER quand une réponse déçoit ?",
  ] },
  257: { reflection: [
    "Ton évaluation se fait à la main, question par question : pourquoi un harnais « une commande → un rapport » change-t-il ta capacité à itérer, et que devient l'évaluation sans lui ?",
    "Le rapport doit donner les scores PAR question ET des agrégats : pourquoi ces deux niveaux, et que rates-tu si tu ne gardes que la moyenne ?",
    "En quoi ce harnais ressemble-t-il à une suite de tests logicielle, et pourquoi est-il l'investissement qui rentabilise tout le mois d'évaluation ?",
  ] },
  258: { reflection: [
    "Ton juge LLM et toi n'êtes d'accord que sur six cas sur dix : pourquoi ne peux-tu pas faire confiance à ce juge tel quel, et que mesures-tu exactement pour le savoir ?",
    "Tu écris un protocole pour mesurer l'accord juge/humain : pourquoi le faire sur un échantillon que le juge n'a pas contribué à créer, et qu'est-ce qui biaiserait la mesure sinon ?",
    "Pourquoi « valider le validateur » est-il une étape que presque personne ne fait, et qu'est-ce que ça te permet d'affirmer que les autres ne peuvent pas ?",
  ] },
  261: { reflection: [
    "Une seule couche de défense (durcir la consigne système) : pourquoi ne suffit-elle jamais seule contre l'injection, et qu'apporte la « défense en profondeur » ?",
    "Tu re-testes tes injections APRÈS avoir posé les défenses : pourquoi ce re-test est-il obligatoire, et que vaudrait une défense jamais confrontée à l'attaque réelle ?",
    "Une défense trop agressive bloque des usages légitimes : comment MESURES-tu ce compromis sécurité/utilité au lieu de le deviner ?",
  ] },
  262: { reflection: [
    "Une réponse cite [source 3] mais l'affirmation ne s'y trouve pas : comment un contrôle AUTOMATIQUE (la source contient-elle vraiment l'affirmation ?) attrape-t-il ce que l'œil laisse passer ?",
    "Vérifier qu'une citation est fondée est plus dur que l'exiger : quelle stratégie (correspondance textuelle, second modèle) utilises-tu, et quelle est sa limite ?",
    "Pourquoi une citation vérifiable transforme-t-elle la confiance dans un RAG, en particulier dans un domaine à enjeux (juridique, médical) ?",
  ] },
  263: { reflection: [
    "Ton RAG répond « je ne sais pas » quand le corpus ne contient pas la réponse : pourquoi est-ce une FEATURE et non un aveu d'échec, et que vaut-elle mieux qu'une réponse inventée ?",
    "Côté système, comment distingues-tu « l'info n'est pas dans le corpus » de « le retrieval a raté un chunk qui existait » — deux causes de refus qui n'appellent pas la même réaction ?",
    "Un refus trop fréquent rend le RAG inutile, un refus trop rare le rend dangereux : sur quoi calibres-tu ce seuil, et comment le mesures-tu ?",
  ] },
  264: { reflection: [
    "Tu intègres quinze cas hostiles au harnais d'évaluation : pourquoi une faille corrigée doit-elle devenir un TEST permanent, et que se passe-t-il sinon à la prochaine modification ?",
    "Quels types de cas adverses (injection, hors corpus, données privées) couvres-tu, et pourquoi un seul type ne suffit pas à te déclarer « sécurisé » ?",
    "Pourquoi la sécurité d'un RAG n'est-elle jamais « terminée » mais un jeu de non-régression qui grandit, exactement comme la suite de tests d'un logiciel ?",
  ] },
  265: { reflection: [
    "Tu dessines les cinq couches (entrée → consignes → sortie → citations → logs) : pour une injection donnée, laquelle l'arrête, et pourquoi ne comptes-tu pas sur une seule ?",
    "Une couche tombe (une injection passe la validation d'entrée) : pourquoi les couches suivantes limitent-elles quand même les dégâts, et qu'est-ce que ça change à ta conception ?",
    "Pourquoi ce schéma en couches est-il le même principe qu'en sécurité web classique (OWASP, mois 2), et qu'est-ce que cette analogie te fait gagner en entretien ?",
  ] },
  267: { reflection: [
    "On te demande d'améliorer DocQA : pourquoi établir une BASELINE chiffrée avant toute modification est-il non négociable, et que voudrait dire « améliorer » sans elle ?",
    "Ta baseline enregistre les scores AVANT toute optimisation : pourquoi ces chiffres, même médiocres, valent-ils de l'or pour la suite du projet ?",
    "Pourquoi « je l'ai amélioré, ça a l'air mieux » est-il une phrase interdite en ingénierie, et qu'est-ce que la baseline chiffrée y substitue ?",
  ] },
  268: { reflection: [
    "Tu appliques une amélioration (chunking, hybride ou rerank) : pourquoi la mesurer avant/après sur le MÊME golden set est la seule façon de savoir si elle a vraiment aidé ?",
    "Ton amélioration monte le score global mais fait BAISSER une catégorie de questions : la gardes-tu ? Sur quoi fondes-tu ta décision ?",
    "Tu choisis QUELLE amélioration tenter en premier : pourquoi la faire porter sur l'étage que ton diagnostic (retrieval ou génération) désigne, plutôt que sur ton intuition ?",
  ] },
  269: { reflection: [
    "Ta première amélioration a gagné cinq points, la deuxième n'en gagne qu'un : pourquoi ce rendement décroissant est-il attendu, et que t'apprend-il sur le moment où t'arrêter ?",
    "Ta deuxième amélioration, combinée à la première, ne donne pas le gain qu'elle donnait isolée : pourquoi les gains ne s'additionnent-ils pas toujours, et comment le vérifies-tu ?",
    "Pourquoi documenter chaque amélioration avec son gain mesuré construit-il un récit d'ingénieur bien plus convaincant en entretien qu'un simple score final élevé ?",
  ] },
  270: { reflection: [
    "Tu as construit la qualité et la sécurité séparément : pourquoi dois-tu revérifier que la suite adverse passe TOUJOURS après tes améliorations de qualité ?",
    "Ajouter des guardrails peut dégrader l'expérience (refus, latence) : comment vérifies-tu, chiffres à l'appui, que la sécurité n'a pas mangé la qualité que tu venais de gagner ?",
    "Pourquoi qualité et sécurité ne sont-elles jamais deux chantiers indépendants mais un seul système à mesurer ENSEMBLE, et qu'est-ce que ça impose au moment de livrer ?",
  ] },
};
