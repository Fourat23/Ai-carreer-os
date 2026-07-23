// days-enrich-reflection-121-150.mjs — Déploiement Y2 (Chantier C, option B), sous-batch SB2.
// Jours d'apprentissage 121-150 (hors revues 126/133/140/147). Merge PAR JOUR : champ `reflection` seul.
// Triplet : [1] compréhension/prédiction · [2] diagnostic/arbitrage · [3] transfert/recul.

export const ENRICH_REFLECTION_121_150 = {
  121: { reflection: [
    "Ton script fait un `print(...)` au niveau du module ET est importé par un autre fichier : que se passe-t-il à l'import, et qu'est-ce que `if __name__ == \"__main__\"` empêche exactement ?",
    "Tu peux tout mettre dans un seul fichier ou séparer la logique métier de la couche CLI (argparse) : quel découpage rend ta logique testable sans passer par la ligne de commande, et pourquoi ?",
    "Ta CLI lit et écrit un JSON à chaque commande : à quel signe (volume, accès concurrent) ce stockage sur fichier simple commencera-t-il à te gêner, et qu'est-ce que tu devras alors introduire ?",
  ] },
  122: { reflection: [
    "Tu entoures 50 lignes d'un seul `try/except Exception` : si l'erreur survient à la ligne 3, qu'advient-il des 47 suivantes, et pourquoi un except trop large finit par masquer de vrais bugs ?",
    "Fichier de notes absent au premier lancement vs fichier JSON corrompu : pourquoi ces deux cas n'appellent-ils pas la même réaction, et que fais-tu dans chacun ?",
    "Le style « demander pardon plutôt que la permission » (EAFP) s'oppose à vérifier avant d'agir : dans quel cas vérifier d'abord reste préférable, et quelle situation (le fichier disparaît entre le test et l'usage) casse cette vérification préalable ?",
  ] },
  123: { reflection: [
    "Une fonction trimballe partout les mêmes cinq paramètres liés : quel signe t'indique qu'une classe (ou dataclass) regrouperait mieux ces données et leur comportement ?",
    "Pour représenter une note, tu hésites entre un dict et une dataclass : qu'est-ce que la dataclass t'apporte concrètement (typage, égalité, lisibilité), et quand le dict reste-t-il le bon choix ?",
    "En Python « tout n'a pas à être une classe » : dans quel cas créer une classe est-il de la sur-ingénierie face à une simple fonction — quel critère tranche ?",
  ] },
  124: { reflection: [
    "Ton test passe mais tu n'as jamais vérifié qu'il POUVAIT échouer : quelle manipulation le prouve, et pourquoi un test incapable de rougir ne protège rien ?",
    "Tu testes une fonction qui lit un fichier : pourquoi est-ce un mauvais test unitaire tel quel, et comment isoles-tu la logique de la lecture du fichier ?",
    "Un seul `assert` qui vérifie dix choses à la fois casse : pourquoi est-il plus dur à diagnostiquer qu'un test ciblé, et qu'est-ce que ça implique sur la granularité de tes tests ?",
  ] },
  125: { reflection: [
    "Un collègue clone ton projet et `pip install` installe d'autres versions que les tiennes : qu'est-ce qui manquait, et que garantit un `requirements.txt` figé ?",
    "Tu installes une dépendance sans venv activé : où atterrit-elle, et quel problème surgit quand un second projet exige une autre version de la même librairie ?",
    "Un linter impose un style automatiquement : au-delà de l'esthétique, qu'est-ce que ça t'apporte concrètement en revue de code et en travail à plusieurs ?",
  ] },
  127: { reflection: [
    "Tu reçois un dataset et tu commences par le transformer : pourquoi `info()`/`describe()`/`value_counts()` AVANT toute modification t'évitent des erreurs, et que révèlent-ils qu'un coup d'œil au fichier ne montre pas ?",
    "`describe()` affiche une moyenne d'âge de 300 : quel geste d'inspection l'aurait déjà signalée, et qu'est-ce que ça t'apprend sur la source ?",
    "Ce réflexe « inspecter avant de toucher » vaut au-delà de pandas : sur quel type de source (des données que tu n'as pas produites toi-même) le négliger te ferait tirer des conclusions fausses ?",
  ] },
  128: { reflection: [
    "Tu remplaces tous les manquants par 0 sans réfléchir : dans quel cas cela fausse-t-il une moyenne ou une somme, et pourquoi « pourquoi manque-t-il ? » doit précéder « comment le remplir ? » ?",
    "Supprimer les lignes à valeurs manquantes ou les imputer : sur quel critère tranches-tu, et que risques-tu en supprimant si les manquants ne sont PAS répartis au hasard ?",
    "Ton rapport avant/après documente chaque décision de nettoyage : pourquoi est-ce la condition pour qu'un tiers — ou toi dans trois mois — fasse confiance aux données nettoyées ?",
  ] },
  129: { reflection: [
    "Tu filtres un DataFrame, modifies le résultat, et vois un `SettingWithCopyWarning` : que risque-t-il d'arriver aux données d'origine, et que cherche à te dire cet avertissement ?",
    "Pour modifier un sous-ensemble, tu hésites entre enchaîner `[...][...]` et utiliser `.loc` : lequel lève l'ambiguïté copie/vue, et pourquoi ?",
    "Traduire un filtre+tri de SQL vers pandas donne un code proche : quelle différence de modèle (table nommée côté SQL vs objet mutable en mémoire) explique ce piège copie/vue absent en SQL ?",
  ] },
  130: { reflection: [
    "`df.groupby(\"cat\")[\"x\"].mean()` : décris ce qui se passe en trois temps (découper, appliquer, recombiner), et que devient une catégorie qui n'a aucune ligne ?",
    "Tu veux la moyenne ET le nombre par groupe : pourquoi `agg` avec plusieurs fonctions vaut-il mieux que deux `groupby` séparés, et qu'est-ce que ça t'évite ?",
    "Le schéma « découper-appliquer-recombiner » est le même qu'en SQL (`GROUP BY`) : quelle propriété de ce modèle mental le rend réutilisable dès qu'on agrège de gros volumes par catégorie ?",
  ] },
  131: { reflection: [
    "Tu merges deux tables sur une clé et le résultat a PLUS de lignes qu'attendu : quelle cardinalité (un-à-plusieurs) l'explique, et pourquoi rien ne « plante » ?",
    "Après un merge `inner`, des lignes ont disparu silencieusement : comment le détectes-tu, et pourquoi comparer le nombre de lignes avant/après est un réflexe de sûreté ?",
    "Les clés de jointure ont des types différents (`\"12\"` d'un côté, `12` de l'autre) : que produit le merge, et quelle vérification en amont l'aurait évité ?",
  ] },
  132: { reflection: [
    "Ton nettoyage vit dans un notebook exécuté cellule par cellule : pourquoi le résultat peut-il dépendre de l'ORDRE d'exécution, et qu'est-ce qu'une fonction pure garantit à la place ?",
    "Tu découpes ton nettoyage en `load`/`validate`/`clean`/`report` : qu'est-ce que cette séparation te permet de tester que le notebook monolithique ne permettait pas ?",
    "Le saut « notebook → fonctions pures testables » est le même que « script bricolé → code réutilisable » : quel bénéfice concret en tires-tu la première fois que la source de données change ?",
  ] },
  135: { reflection: [
    "Tu ajoutes un index et la lecture accélère : qu'est-ce que ça coûte en échange aux écritures (INSERT/UPDATE), et pourquoi indexer « toutes les colonnes » est une erreur ?",
    "Une requête est lente : pourquoi lances-tu `EXPLAIN` avant d'ajouter un index au hasard, et que cherches-tu précisément dans le plan d'exécution ?",
    "L'index est un compromis lecture/écriture/espace : sur quel type de table (beaucoup d'écritures, peu de lectures) un index de trop devient-il contre-productif ?",
  ] },
  136: { reflection: [
    "Ta commande décrémente le stock en deux requêtes et la seconde échoue : sans transaction, dans quel état incohérent la base se retrouve-t-elle, et que change un rollback ?",
    "Tu enveloppes « créer la commande + décrémenter le stock » dans une transaction : pourquoi le tout-ou-rien est-il ici une exigence MÉTIER et pas un simple confort technique ?",
    "L'atomicité apprise ici dépasse SQL : dans quelle autre opération en plusieurs étapes voudras-tu ce « tout ou rien », et quel dégât survient si une étape échoue au milieu sans lui ?",
  ] },
  137: { reflection: [
    "Tu veux, pour chaque ligne, un total cumulé SANS réduire le nombre de lignes : pourquoi `GROUP BY` ne convient pas, et que préserve une fonction fenêtre qu'il détruit ?",
    "Pour un « top 3 par catégorie », tu hésites entre une sous-requête corrélée et une fonction fenêtre : qu'est-ce qui les distingue en lisibilité et en intention ?",
    "Ces requêtes analytiques (cumuls, classements) préfigurent tes futurs tableaux de bord : quel indicateur (part cumulée, rang) s'exprime naturellement avec une fenêtre plutôt qu'avec un regroupement ?",
  ] },
  138: { reflection: [
    "Tu mélanges extraction et transformation dans la même fonction : quand la source change de format, pourquoi cela t'oblige à toucher aussi la transformation, et que règle la séparation stricte ?",
    "Pourquoi séparer strictement Extract, Transform et Load te permet-il de rejouer une SEULE étape (par exemple re-transformer sans re-télécharger) — quel gain concret au quotidien ?",
    "Ce découpage E/T/L n'est pas propre à SQLite : dans quel futur travail d'alimentation d'une base à partir de fichiers ou d'API reconnaîtras-tu exactement ces trois étapes ?",
  ] },
  139: { reflection: [
    "Ton pipeline plante à mi-chemin puis tu le relances : sans idempotence, quelles données se retrouvent en double, et qu'est-ce qui rend un « re-run » sûr ?",
    "Un échec partiel (900 lignes chargées sur 1000) : pourquoi un pipeline qui s'arrête proprement et reprend vaut-il mieux qu'un qui laisse un état à moitié chargé ?",
    "L'idempotence (« relancer produit le même état ») reviendra dès que tu alimenteras une base de façon répétée : quelle question te poseras-tu avant chaque écriture pour la garantir ?",
  ] },
  141: { reflection: [
    "Tu choisis d'abord un beau dataset puis tu cherches quoi en dire : pourquoi partir des QUESTIONS plutôt que des données change-t-il la valeur de ton analyse ?",
    "Tu as dix questions candidates pour ton dashboard : quel double critère (utile à une décision ET répondable avec ta source) te fait n'en garder que trois ?",
    "Une question vague (« analyser les ventes ») vs une question précise (« quel mois génère le plus de retours ? ») : qu'est-ce que la seconde rend possible que la première empêche ?",
  ] },
  142: { reflection: [
    "Ta source API renvoie parfois une page vide ou une erreur : pourquoi l'extraction doit-elle capturer la source « telle quelle » sans la nettoyer, et qu'arrive-t-il si tu mélanges capture et nettoyage ?",
    "Ton extraction échoue à la 800e ligne sur 1000 : quelle conception (reprise, journalisation) t'évite de tout recommencer ?",
    "Séparer « capturer la source » de « la comprendre » suit le principe de responsabilité unique : pourquoi cela rend-il ton pipeline plus simple à déboguer quand la source change ?",
  ] },
  143: { reflection: [
    "Tu relances ta transformation sur le même fichier d'entrée et le rapport de qualité change d'une fois à l'autre : quelles causes (état partagé, ordre d'appel) soupçonnes-tu, et pourquoi un rapport non reproductible est-il inexploitable ?",
    "Face à des lignes invalides pendant la transformation, tu dois choisir : les jeter, les corriger, ou les signaler ? Quel critère, et qu'exiges-tu dans le rapport de qualité ?",
    "Écrire la transformation en fonctions pures testées te coûte du temps maintenant : quel bénéfice concret en tires-tu le jour où une règle métier de nettoyage change ?",
  ] },
  144: { reflection: [
    "Ton chargement insère ligne par ligne sans transaction et plante au milieu : dans quel état la base finit-elle, et que change un chargement transactionnel ?",
    "Ton pipeline doit être « rejouable en une commande » : que doit faire le load si les données sont déjà là — écraser, ignorer, dédupliquer — et pourquoi ce choix compte ?",
    "Le load réunit schéma propre + transaction + rejouabilité : lequel de ces trois te protège de quel incident, et lequel oublie-t-on le plus souvent ?",
  ] },
  145: { reflection: [
    "Tu choisis un joli graphique puis tu cherches ce qu'il pourrait montrer : pourquoi partir de la QUESTION à laquelle il répond change-t-il le type de visualisation retenu ?",
    "Pour comparer des catégories, tu hésites entre un camembert et un diagramme en barres : lequel se lit mieux et pourquoi, et quand le camembert devient-il trompeur ?",
    "Un dashboard « joli mais qui ne répond à aucune question » : pourquoi est-ce un échec, et à quoi reconnais-tu qu'une visualisation sert réellement une décision ?",
  ] },
  146: { reflection: [
    "Ton ADR n°4 justifie SQLite plutôt que Postgres : quels critères (volume, concurrence, déploiement) rendent ce choix défendable, et à partir de quand deviendrait-il mauvais ?",
    "Un lecteur ouvre ton README de projet data : pourquoi commencer par les QUESTIONS et leurs réponses plutôt que par la mécanique du pipeline ?",
    "Tu structures ta démo autour des trois questions du dashboard et de leurs réponses chiffrées : pourquoi cet ordre « question → chiffre » convainc-il davantage qu'une visite des tables et du pipeline ?",
  ] },
  149: { reflection: [
    "Deux jeux de données ont la même moyenne et le même écart-type mais des formes totalement différentes : pourquoi seul un graphique le révèle-t-il, et que rates-tu en ne regardant que les chiffres ?",
    "Tu explores une variable : quel graphique pour voir la forme d'UNE variable, lequel pour une relation entre DEUX, et pourquoi ce choix n'est pas interchangeable ?",
    "« Toujours regarder la distribution avant de résumer » : dans quel piège concret (valeurs extrêmes, deux pics) tombe celui qui saute cette étape pour aller droit à la moyenne ?",
  ] },
  150: { reflection: [
    "Les ventes de glaces et les noyades augmentent ensemble : quelle troisième variable explique cette corrélation sans qu'il y ait causalité, et comment la débusques-tu ?",
    "On te présente une corrélation forte pour justifier une décision : quelles questions poses-tu avant d'y croire, et quel type d'expérience trancherait la question de la cause ?",
    "Plus tard, un modèle trouvera qu'une variable « prédit » une cible : pourquoi cela ne prouve pas qu'agir sur cette variable changera la cible — quelle hypothèse causale manque ?",
  ] },
};
