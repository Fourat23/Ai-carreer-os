// days-enrich-reflection-168-180.mjs — Déploiement Y2 (Chantier C, option B), sous-batch SB4.
// Jours d'apprentissage 169-180 (168 et 175 sont des revues). Merge PAR JOUR : `reflection` seul.
// Triplet : [1] compréhension/prédiction · [2] diagnostic/arbitrage · [3] transfert/recul.

export const ENRICH_REFLECTION_168_180 = {
  169: { reflection: [
    "Tu crées une feature « ratio prix/surface » à partir de deux colonnes existantes : pourquoi peut-elle aider le modèle alors qu'elle ne contient, au sens strict, aucune information nouvelle ?",
    "Tu ajoutes cinq nouvelles features d'un coup et le score monte : pourquoi ne sais-tu pas laquelle a réellement aidé, et qu'impose le journal des tentatives une par une ?",
    "Sur du tabulaire, le feature engineering rapporte souvent plus que le choix de l'algorithme : à quel signe reconnais-tu que ce travail atteint ses limites et qu'il faut arrêter d'empiler des features ?",
  ] },
  170: { reflection: [
    "Tu encodes des villes en 0, 1, 2, 3 (label-encoding) : quelle relation FAUSSE le modèle risque-t-il d'inférer entre elles, et pourquoi le one-hot l'évite ?",
    "Une variable catégorielle compte 500 valeurs distinctes : pourquoi le one-hot devient-il problématique ici, et quel compromis envisages-tu ?",
    "Un encodeur ou un scaler s'APPREND (les catégories vues, la moyenne, l'écart-type) : au-delà de la fuite, que se passe-t-il concrètement quand une catégorie JAMAIS vue à l'entraînement apparaît en production, et comment ton préprocessing doit-il la gérer ?",
  ] },
  171: { reflection: [
    "Ton préprocessing et ton modèle sont deux étapes que tu appliques à la main l'une après l'autre : à quel moment précis une fuite peut se glisser, et comment le Pipeline l'empêche par construction ?",
    "Tu fais une validation croisée avec une normalisation : pourquoi normaliser HORS du Pipeline fausse-t-il chaque fold, et que garantit l'encapsulation à l'intérieur ?",
    "Un Pipeline complet (préproc + modèle) se sauvegarde comme un seul objet : quel bénéfice concret le jour où tu dois rejouer exactement le même traitement sur de nouvelles données ?",
  ] },
  172: { reflection: [
    "Tu lances k-means sans normaliser des variables d'échelles très différentes (âge de 0 à 100, revenu en milliers) : quelle variable va dominer le calcul des distances, et pourquoi la segmentation est-elle faussée ?",
    "La méthode du coude et le score de silhouette te suggèrent des valeurs de k différentes : comment tranches-tu, et pourquoi l'interprétation MÉTIER des groupes pèse-t-elle autant que ces critères ?",
    "Le clustering est non supervisé : sans vérité terrain, comment juges-tu qu'une segmentation est « bonne », et quelle est la limite fondamentale de cette évaluation ?",
  ] },
  173: { reflection: [
    "La « feature importance » interne et la « permutation importance » donnent des classements différents : que mesure réellement chacune, et pourquoi la seconde reflète-t-elle mieux l'usage réel d'une variable par le modèle ?",
    "Ton modèle performant met en tête une variable sans aucun sens métier : pourquoi est-ce un signal d'alerte plutôt qu'une découverte, et que soupçonnes-tu en premier ?",
    "Dans quel contexte professionnel (crédit, santé, décisions RH) l'interprétabilité n'est-elle pas un confort mais une exigence, et qu'est-ce que ça change dans ton choix de modèle ?",
  ] },
  174: { reflection: [
    "Tu cadres ChurnScope en partant de l'algorithme (« je vais faire une random forest ») : pourquoi est-ce l'ordre inverse du bon, et par quoi le cadrage doit-il commencer ?",
    "Ta note « Mon workflow ML » doit tenir en quelques étapes : lesquelles sont non négociables (split, baseline, métrique fixée AVANT de modéliser), et pourquoi en sauter une invalide tout le reste ?",
    "Partir de la DÉCISION métier avant de choisir un modèle : sur un projet de churn, quelle décision concrète la prédiction doit-elle servir, et comment cela oriente-t-il le choix de la métrique ?",
  ] },
  176: { reflection: [
    "Tu entraînes un modèle sophistiqué avant d'avoir regardé les données : quels problèmes (déséquilibre des classes, colonne qui fuit la réponse, variables inutiles) une EDA préalable t'aurait révélés ?",
    "Sur un churn déséquilibré, une baseline « tout le monde reste » atteint déjà 80 % : pourquoi ce chiffre recadre-t-il complètement l'interprétation de tes futurs modèles ?",
    "Pourquoi établir la baseline AVANT tout modèle sérieux te protège-t-il de l'auto-illusion, et que prouve exactement un modèle complexe qui ne la bat pas ?",
  ] },
  177: { reflection: [
    "Tu compares deux modèles mais l'un a été évalué sur un simple split et l'autre en validation croisée : pourquoi la comparaison est-elle faussée, et qu'exige un protocole équitable ?",
    "Tu tiens un journal d'expériences ouvert dès le premier modèle : qu'est-ce qu'il te permet d'affirmer en fin de projet que ta seule mémoire ne pourrait pas garantir ?",
    "Deux modèles affichent des scores quasi identiques : sur quels autres critères (temps d'entraînement, interprétabilité, robustesse) tranches-tu, et pourquoi le score seul ne décide pas ?",
  ] },
  178: { reflection: [
    "Sur des données de churn, tu crées une feature « nombre de réclamations le dernier mois » : pourquoi peut-elle être très prédictive, et quel risque de fuite dois-tu vérifier selon le MOMENT où elle est mesurée ?",
    "Une feature dérivée fait bondir ton score de façon suspecte : pourquoi ta première réaction est-elle de soupçonner une fuite plutôt que de te réjouir, et comment le confirmes-tu ?",
    "Quelle question unique (« cette information était-elle disponible AU MOMENT où la prédiction doit être faite ? ») te permet de séparer une feature légitime d'une feature qui triche ?",
  ] },
  179: { reflection: [
    "Tu règles tes hyperparamètres en regardant le score sur ton jeu de test à chaque essai : pourquoi finis-tu par « suradapter » à ce test précis, et que dois-tu réserver pour la validation finale ?",
    "Une grid search gagne 0,3 point de score après 200 essais coûteux : pourquoi ce gain minuscule peut ne pas valoir le coût, et comment décides-tu quand arrêter de régler ?",
    "La validation finale ne doit se faire qu'une SEULE fois, tout à la fin : pourquoi la « garder pour la fin » est-il la condition pour qu'elle estime honnêtement la performance réelle ?",
  ] },
  180: { reflection: [
    "Ton rapport de churn s'ouvre sur « AUC 0,87 » : pourquoi un décideur métier ne peut-il rien en faire tel quel, et par quelle traduction (qui risque de partir, que fait-on) devrais-tu commencer ?",
    "L'analyse qualitative révèle que le modèle rate surtout les départs d'un segment précis : que recommandes-tu concrètement, et pourquoi est-ce plus utile qu'un point d'AUC supplémentaire ?",
    "Un rapport orienté décision pose ses limites : sur un modèle de churn, quelle limite (il prédit QUI, pas POURQUOI, et ne garantit pas que l'action marchera) dois-tu énoncer pour ne pas le survendre ?",
  ] },
};
