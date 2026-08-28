<!-- keep -->
# Leçon — Agents IA : fondamentaux

## 🌍 Le problème d'abord
« Agent IA » est partout, entouré de promesses magiques. Mais concrètement, qu'est-ce que
c'est ? Un LLM seul ne peut que produire du texte : il ne peut ni lire un fichier, ni chercher
sur le web, ni agir. Un **agent**, c'est ce qui se passe quand on donne à un LLM des OUTILS et
qu'on le laisse, en boucle, décider lequel utiliser pour atteindre un but. Le piège du
débutant est double : croire que c'est de la magie, et en mettre partout (« c'est plus
intelligent »). En réalité, un agent est simple à comprendre — et souvent inutile là où un
enchaînement d'étapes fixes suffirait, en moins cher et plus fiable. Cette leçon te montre ce
qu'est vraiment un agent, et surtout QUAND ne pas en faire.

## 🎯 Objectif
Comprendre qu'un agent est **une boucle « décider → agir → observer » autour d'un LLM outillé**,
savoir le distinguer d'un **workflow** (étapes fixes), connaître ses **modes d'échec** et les
**garde-fous** indispensables, et décider avec discernement quand chacun s'impose.

## 🧩 Prérequis
Tu dois comprendre ce qu'est un LLM et ses limites — prédiction du token suivant, hallucination,
non-déterminisme, function calling (`/doc/lessons/llm-fundamentals`) — car un agent orchestre
ces appels faillibles. La conception d'outils s'appuie sur la conception d'API
(`/doc/lessons/api-design-basics`), et la notion de budget/garde-fous rejoint la résilience.
Aucune expérience préalable d'agents n'est supposée.

## 🧠 Modèle mental
Un agent n'est pas magique : c'est une **boucle `while`** simple. Tant que l'objectif n'est
pas atteint et qu'il reste du budget, on demande au LLM quoi faire ; s'il demande un outil,
TON code l'exécute et lui rend le résultat ; sinon, c'est la réponse finale. Tout tient dans :
function calling (le modèle DEMANDE, ton code EXÉCUTE et garde le contrôle) + une boucle + un
budget + des traces. La vraie compétence n'est pas de coder cette boucle, c'est le CHOIX :
chemin connu d'avance → workflow (étapes fixes, prévisible, testable) ; chemin qui dépend de
découvertes en cours de route → agent (flexible, mais cher et non-déterministe).

## 💡 Pourquoi c'est important
« Agent » est le mot le plus galvaudé de l'IA. Le démystifier te donne un double avantage : savoir en CONSTRUIRE un proprement (boucle, outils, budgets), et — plus rare, plus précieux — savoir dire QUAND NE PAS en faire. En entretien, « un workflow suffit ici » est souvent la réponse qui distingue l'ingénieur du suiveur de mode.

## Explication complète

### Un agent démystifié : une boucle while + des outils
Un agent est un LLM qui, au lieu de répondre directement, peut DEMANDER l'exécution d'outils, OBSERVER les résultats, et décider de la suite — en boucle, jusqu'à l'objectif (ou l'échec) :
```
tant que (pas fini ET budget restant) :
    réponse = LLM(objectif, historique, outils disponibles)
    si réponse est un appel d'outil → l'exécuter, ajouter le résultat à l'historique
    sinon → réponse finale
```
C'est TOUT. Le function calling (le modèle demande, TON code exécute et garde le contrôle) + une boucle + un budget. Aucune magie — et l'avoir codée à la main une fois t'immunise contre le marketing.

### La distinction structurante : workflow vs agent
- **Workflow** : les ÉTAPES sont fixées par le développeur (extraire → comparer → rapporter), le LLM exécute chaque étape. Prévisible, testable, coût borné.
- **Agent** : le LLM DÉCIDE des étapes à chaque itération. Flexible face à l'imprévu — mais non-déterministe, plus cher (n itérations = n appels), plus dur à tester.

**La règle de décision** : chemin connu à l'avance → workflow, toujours. L'agent ne se justifie que si le chemin DÉPEND de découvertes en cours de route. Et les quatre patterns de workflow (chaînage, parallélisation, routage, évaluateur-optimiseur) couvrent une énorme part des besoins réels.

### Les modes d'échec des agents (à connaître pour les encadrer)
1. **La boucle** : refaire sans cesse la même action qui échoue.
2. **La dérive d'objectif** : partir résoudre un problème voisin du problème demandé.
3. **Le mésusage d'outil** : mauvais outil, ou bons outils avec de mauvais arguments.
D'où les garde-fous NON NÉGOCIABLES : budget d'itérations, timeout, coût maximal, validation des arguments d'outils, arrêt propre avec raison (réussite / échec / budget épuisé), et TRACES complètes (chaque pensée, chaque appel, chaque observation — sans traces, un agent est indébuggable).

### Les outils : une conception d'API pour un consommateur particulier
Déclarer un outil = décrire nom, rôle et paramètres AU MODÈLE. La qualité de ces descriptions détermine la qualité d'usage (le modèle « lit la doc ») — c'est de la conception d'API (leçon api-design-basics.md) dont le consommateur est un LLM. Principe de sécurité : moindre privilège (un outil de LECTURE de fichiers, pas un outil « exécute du shell »).

### La mémoire et l'état
L'« historique » de la boucle EST la mémoire de l'agent — et il grossit à chaque itération (coût, fenêtre). Les systèmes réels compriment (résumés), sélectionnent (RAG sur la mémoire !), ou externalisent l'état (fichiers, base). Rien d'exotique : de la gestion d'état, comme partout.

## Concepts clés
Boucle plan → act → observe · function calling · budget (itérations, coût, temps) · arrêt propre · traces · workflow vs agent (le critère : chemin connu ?) · les 4 patterns de workflow · modes d'échec · moindre privilège · mémoire/état.

## 🧭 Exemple guidé
« Vérifier la cohérence de la documentation » :
- **Version agent** : outils lire_fichier + chercher ; le LLM explore, décide, signale. Coût variable, découvertes possibles, résultats variables d'une exécution à l'autre.
- **Version workflow** : lister les docs → extraire les affirmations de chacun (n appels parallèles) → comparer les paires → rapporter. Coût CONNU d'avance, testable étape par étape, reproductible.
Pour un rapport quotidien fiable : le workflow gagne. Pour une investigation ponctuelle ouverte : l'agent se défend. LE réflexe : comparer les deux AVEC des chiffres (coût, latence, fiabilité) — c'est exactement ton exercice du mois 10.

## ⚠️ Erreurs fréquentes
- L'agent par défaut (« c'est plus intelligent ») : plus cher, moins fiable, pour rien si le chemin est connu.
- Pas de budget : la boucle infinie à 0,01 € l'itération se termine sur ta facture.
- Des outils trop puissants (« exécuter du code ») sans garde-fous : l'excès d'autonomie est un risque de sécurité nommé (OWASP LLM).
- Pas de traces : au premier comportement étrange, tu es aveugle.
- Croire les démos : un agent qui réussit 1 fois sur 3 est inutilisable en production — mesure le taux de réussite.

## 🔗 Liens avec le programme
DocSense (mois 11) utilisera un WORKFLOW explicite pour l'analyse de documents — et tu sauras JUSTIFIER ce choix contre l'agent (coût, fiabilité), ce qui vaut de l'or en entretien. Les guardrails d'agents (mois 10) préfigurent la sécurité IA (leçon ai-security.md) : un agent outillé est une surface d'attaque. Et l'orchestration de workflows est une compétence d'architecture générale (queues, parallélisation, reprise sur échec).

## Mini-exercice
Pour 5 tâches — tri de mails entrants, veille quotidienne résumée, migration d'un format de données, support niveau 1, investigation d'un bug inconnu — décide : script simple, workflow LLM, ou agent ? Justifie chaque choix par coût / fiabilité / besoin d'adaptation. (Réponses défendables : script, workflow, script, workflow avec escalade humaine, agent.)

## ✅ Correction attendue
**La démarche** : une seule question tranche, et il faut la poser dans cet ordre. *Le chemin est-il connu d'avance ?* Si oui, aucun LLM n'est nécessaire pour décider quoi faire ensuite — c'est un script, ou un workflow si chaque étape demande de comprendre du langage. Si non, si la suite dépend de ce qu'on découvre en route, alors seulement l'agent se justifie.

Sur les cinq tâches : le tri de mails est un **script** si les règles sont fixes, un **workflow** s'il faut comprendre le contenu ; la veille résumée est un **workflow** (les étapes sont connues, seul le contenu varie) ; la migration de format est un **script** — déterministe, vérifiable, et un LLM n'y ajouterait que du risque et du coût ; le support niveau 1 est un **workflow avec escalade humaine** ; l'investigation d'un bug inconnu est le seul vrai cas d'**agent**, parce que la prochaine action dépend de ce que la précédente a révélé.

**L'erreur probable, et elle est presque toujours la même.** Sur la migration de format, beaucoup répondent « workflow LLM » — parce que la tâche touche à des données textuelles, et que le réflexe acquis est « données textuelles → LLM ». Or une migration a une définition exacte, un résultat vérifiable, un coût nul et un déterminisme parfait en code classique. Y mettre un LLM, c'est remplacer une fonction testable par une dépendance payante, non déterministe et faillible.

Le piège séduit parce que la leçon porte sur les agents, donc on cherche où les placer. **La bonne réponse à « agent ou workflow ? » est très souvent « ni l'un ni l'autre ».** C'est la réponse la plus difficile à donner quand on vient d'apprendre les deux, et c'est celle qui distingue un ingénieur d'un enthousiaste.

**Alternative défendable** sur le support niveau 1 : un agent avec des outils en LECTURE SEULE et une escalade obligatoire dès qu'une action modifie quoi que ce soit. On garde la souplesse d'exploration là où elle est utile — chercher dans la documentation, croiser des tickets — sans jamais laisser la boucle agir. C'est le moindre privilège appliqué à l'autonomie : l'agent peut chercher, il ne peut pas décider.

**Vérifie seul, sans corrigé** :
1. Pour chaque choix, écris le COÛT d'une exécution. Si tu ne sais pas le calculer, c'est un agent — et c'est précisément son principal défaut.
2. Pour chaque choix « agent », demande-toi ce que fait le système quand il se trompe cinq fois de suite. Si la réponse est « il continue », il manque un budget.
3. Épreuve décisive : pour chacune des cinq, essaie d'écrire l'enchaînement d'étapes à l'avance. **Tout ce que tu arrives à écrire n'a pas besoin d'un agent.**
4. Reprends ton verdict sur la migration. Si tu as répondu « workflow », relis pourquoi.

## 🏢 Cas professionnel
Une équipe déploie un agent de support client capable de consulter les commandes et d'émettre des remboursements. En recette, il traite correctement 9 cas sur 10 — jugé suffisant pour un niveau 1. En production, deux problèmes apparaissent dès la première semaine.

Le premier est arithmétique : 90 % de réussite par étape sur une tâche qui en compte cinq donne **59 %** de réussite de bout en bout. Les taux se multiplient, et une chaîne d'étapes « très bonnes » est médiocre. C'est le calcul que personne ne fait avant de déployer.

Le second est plus grave : un client formule sa demande de façon à ce que l'agent enchaîne deux remboursements. Aucune règle ne l'interdisait, l'outil était disponible, l'agent a raisonné correctement à chaque étape et abouti à un résultat que personne n'aurait autorisé. **Un agent ne fait pas d'erreur de calcul, il fait des enchaînements que personne n'a prévus.**

Ce que les équipes en retirent : la limite ne se met pas dans le prompt mais dans l'OUTIL — un plafond de montant, une idempotence par identifiant de commande, une confirmation humaine au-delà d'un seuil. Un garde-fou formulé en langage naturel est une suggestion ; un garde-fou codé dans l'outil est une garantie. Et le taux de réussite se mesure de bout en bout, sur des cas réels, jamais par étape.

## 🎤 Questions d'entretien
- « Agent ou workflow ? » → Workflow si le chemin est connu d'avance : coût prévisible, testable, reproductible. Agent seulement si la prochaine action dépend de ce qu'on découvre. Et souvent, ni l'un ni l'autre.
- « Comment sécurises-tu un agent ? » → Par les outils : moindre privilège, arguments validés, actions plafonnées, idempotence, budget d'itérations. Jamais par une consigne dans le prompt.
- « Ton agent réussit 9 fois sur 10, c'est bon ? » → Pas sur une tâche à plusieurs étapes : les taux se multiplient. 90 % sur cinq étapes, c'est 59 %.
- « Comment déboguer un agent ? » → Avec des traces complètes : chaque appel, chaque outil, chaque observation. Sans elles, le comportement est inexplicable, et donc incorrigible.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je commence par demander si le chemin est connu d'avance, avant de parler d'agent.
- [ ] Je sais dire non à un agent et défendre ce refus par le coût et la fiabilité.
- [ ] Mes garde-fous vivent dans les outils, pas dans les prompts.
- [ ] Je mesure un taux de réussite de bout en bout, pas par étape.

## 📚 Vocabulaire
**boucle agentique** · **outil / tool use** · **observation** · **budget** · **trace** · **workflow** · **chaînage / routage / parallélisation / évaluateur-optimiseur** · **dérive d'objectif** · **moindre privilège** · **taux de réussite**.

## 🧾 À retenir
Un agent = un LLM en boucle avec des outils, un budget et des traces — du function calling orchestré, pas de la magie. La vraie compétence est le CHOIX : chemin connu → workflow (prévisible, testable, coût borné) ; chemin dépendant des découvertes → agent (flexible, encadré de garde-fous). Les modes d'échec se connaissent et s'encadrent ; les outils se conçoivent comme des APIs à moindre privilège ; et la décision se prend chiffres en main.
