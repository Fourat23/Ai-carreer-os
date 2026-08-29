# V70 — Standard pédagogique humain

Ce document répond à une seule question : **qu'est-ce qu'une bonne leçon
AI Career OS ?**

Il s'adresse à l'auteur des leçons. Il décrit des **fonctions à remplir**, pas une
liste de titres à recopier. C'est la distinction centrale du sprint, et l'erreur que
V69 a commise en produisant quarante leçons profondes au même moule.

**Apprenant de référence, gelé :** quelques notions de JavaScript et de Postman,
motivé, en parcours intensif, qui veut devenir employable. Il ne complète pas les
trous. Il ne connaît pas un concept parce qu'un mot-clé est cité. Il ne déduit pas
seul pourquoi une pratique compte.

---

## 1. Les dix fonctions pédagogiques

Une leçon doit remplir celles qui s'appliquent à son sujet. Toutes ne s'appliquent pas
à tous les sujets — et **c'est le sujet qui décide, pas un gabarit**.

**A. Contextualiser.** Pourquoi ce sujet existe, quel problème il résout, quand il
devient important. Sans cela, l'apprenant mémorise au lieu de comprendre.

**B. Donner un modèle mental.** Une représentation manipulable **avant** la
terminologie. Le jargon arrive après que le besoin soit intelligible.

**C. Expliquer le mécanisme.** Pas « X sert à Y », mais : *voilà ce qui se passe, dans
quel ordre, et pourquoi*. C'est la fonction la plus souvent manquante dans le corpus
actuel.

**D. Concrétiser.** Données réalistes, code réaliste, scénario réaliste. Un exemple
avec `foo` et `bar` n'ancre rien.

**E. Montrer le raisonnement.** L'apprenant voit **comment on décide** : au moins
trois décisions, et pour chacune pourquoi celle-là plutôt qu'une autre.

**F. Montrer l'erreur.** L'approche naturelle qui échoue, la raison de l'échec, le
symptôme observable. Une erreur qu'on a vue une fois ne se refait pas.

**G. Faire produire.** Une transformation observable, pas une récitation.

**H. Corriger en expliquant.** La démarche, pourquoi ça marche, pourquoi une
alternative plausible échoue, comment généraliser.

**I. Transférer.** Une situation professionnelle réelle, différente de l'exemple.

**J. Fermer.** Ce que l'apprenant doit désormais savoir **expliquer** ou **produire**.

> Une leçon n'est pas bonne parce qu'elle contient ces dix mots en titres. Elle est
> bonne si son contenu remplit réellement ces fonctions.

---

## 2. Les archétypes de leçon

Chaque archétype a son **rythme propre**. Les titres doivent être spécifiques au
contenu, jamais génériques.

| archétype | rythme naturel |
|---|---|
| **Concept fondamental** | intuition → mécanisme → exemple → limites |
| **Procédure** | contexte → préconditions → étapes → validation → rollback |
| **Débogage** | symptôme → hypothèses → observation → diagnostic → correction |
| **Architecture / trade-off** | contraintes → options → compromis → décision → conséquences |
| **Algorithmique** | problème → version naïve → coût → amélioration → preuve |
| **Données / statistiques** | question → données → méthode → calcul → interprétation → pièges |
| **ML / IA** | tâche → données → modèle → évaluation → mode d'échec |
| **Sécurité** | menace → surface → exploitation → mitigation → validation |
| **Système / réseau** | couche → observation → outil → diagnostic → correction |
| **Tutoriel de construction** | objectif → squelette → incréments → vérification à chaque pas |
| **Étude de cas** | situation → décisions prises → résultat → ce qu'on en retient |
| **Incident** | signal → investigation → cause → remédiation → prévention |
| **Revue / consolidation** | ce qui a été vu → ce qui doit tenir → épreuve → décision de passage |

**Ces rythmes sont des exemples, pas de nouveaux templates universels.** Une leçon
d'architecture peut légitimement adopter le rythme « débogage » si son sujet est une
architecture qu'on diagnostique. Le critère est : *la forme sert-elle ce contenu-ci ?*

### Interdits de forme

- La série `Décision 1 / Décision 2 / Décision 3 / Décision 4 / À retenir` appliquée
  en masse. C'est le défaut mesuré de V69 (33 leçons).
- Le gabarit `Énoncé / Raisonnement / Solution` (19 leçons au CP0) : il promet un
  raisonnement et livre une conclusion.
- Une séquence de titres identique partagée par plus de six leçons (condition 9 du
  contrat gelé).
- Les capitales d'emphase en rafale — tic massif du corpus actuel.
- Les formules qui minimisent : « il suffit de », « évidemment », « simplement »,
  « trivial » sur un concept non trivial. 36 leçons en portent aujourd'hui.

---

## 3. Vulgariser : la séquence

Pour tout concept difficile, dans cet ordre :

1. **explication en langage simple** — ce que ça fait, sans terme technique ;
2. **intuition** — pourquoi c'est raisonnable ;
3. **terme technique** — maintenant qu'il a un référent ;
4. **mécanisme** — ce qui se passe vraiment ;
5. **exemple** — sur des données concrètes ;
6. **limite** — quand ça ne marche pas, et pourquoi.

Contre-exemple à ne pas reproduire :

> « Un index B-tree améliore les lectures au prix d'un coût en écriture. »

Cette phrase est vraie et n'enseigne rien. Ce qu'il faut à la place : pourquoi
parcourir une table entière coûte cher, ce que l'index range et dans quel ordre,
comment il réduit l'espace à explorer, pourquoi il doit lui-même être mis à jour à
chaque écriture, et dans quels cas il ne sert à rien.

**Toute analogie doit porter sa limite.** Une analogie sans limite finit par être
prise au pied de la lettre, et l'apprenant construit un modèle faux qu'il faudra
défaire plus tard.

---

## 4. L'exemple guidé

Ce qu'il **n'est pas** : un paragraphe de cinquante mots · quatre décisions
génériques · une liste de commandes · une correction déguisée.

Ce qu'il doit contenir, dans l'ordre qui convient au sujet :

situation · objectif · observations · hypothèses · choix pesés · exécution ·
résultat · interprétation · échec éventuel · correction · ce qu'il faut retenir.

**Longueur : celle qu'exige le sujet.** Le nombre de mots est un garde-fou
(un exemple de 60 mots ne peut pas montrer trois décisions), jamais un objectif.
`git-fundamentals` fait 333 mots et ne porte aucun défaut ; c'est la référence.

---

## 5. La pratique

Un exercice principal doit demander une **production observable** :

écrire · modifier · construire · mesurer · diagnostiquer · réparer · tester ·
comparer · justifier une décision par écrit.

Et préciser : **contexte · objectif · contraintes · livrable · critère de réussite ·
pièges éventuels**.

| au lieu de | écrire |
|---|---|
| « Que fait un cache ? » | « Mesure le temps de cette route sur 20 appels, identifie ce qui est recalculé à chaque fois, ajoute un cache, décide de sa stratégie d'invalidation, et compare les deux mesures. Livrable : les deux séries de temps et une phrase justifiant l'invalidation choisie. » |
| « Cite trois avantages des tests » | « Prends une fonction existante sans test, écris trois tests, puis sabote la fonction de trois façons différentes. Réussite : chaque sabotage fait rougir au moins un test. » |

Pour un exercice de code, fournir les **données ou fixtures** nécessaires : un
exercice qu'on ne peut pas commencer faute de données n'est pas un exercice.

---

## 6. La correction

Une correction n'est jamais une réponse. Elle contient au moins trois de :

la **démarche** · **pourquoi** la solution fonctionne · une **mauvaise solution
plausible** et la raison de son échec · les **indices** qui font reconnaître ce type
de problème · la **généralisation**.

Quand plusieurs solutions sont valides, le dire. Quand il y a un compromis, le montrer.

> « Réponse : StatefulSet » est un échec, même si c'est la bonne réponse.

---

## 7. Exactitude

Toute affirmation chiffrée ou exécutable doit être **vérifiée** quand c'est
raisonnablement possible : exécuter le code, lancer les tests, lire la sortie, tester
un cas limite. Les scripts de vérification vont dans `scripts/v70-verifications/`.

Ce qui ne peut pas être vérifié n'est **pas chiffré** : on reformule prudemment et on
déclare la limite. Une valeur publiée parce qu'elle « semble juste » est une faute.

---

## 8. La question de contrôle, à se poser sur chaque leçon

> Un apprenant qui arrive avec le niveau attendu peut-il comprendre cette section
> **sans chercher dix mots sur Internet** ?

Si la réponse est non, la leçon n'est pas finie.
