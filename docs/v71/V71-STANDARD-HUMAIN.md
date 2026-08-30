# V71 — Standard humain et archétypes pédagogiques

Document du CP2. Il dit **ce qu'on cherche à obtenir** ; le contrat gelé du CP1 dit
comment on le note. Les deux sont opposables au CP15.

---

## 1. Le standard humain

Une leçon est bonne si un lecteur qui ne connaît pas le sujet peut, après l'avoir lue et
fait sa pratique, répondre à ces dix questions **sur un cas qu'elle n'a pas traité** :

1. qu'est-ce que c'est ?
2. à quel problème cela répond ?
3. pourquoi ce problème existe-t-il ?
4. comment reconnaître qu'on rencontre ce problème ?
5. quelles solutions sont plausibles ?
6. comment choisir entre elles ?
7. pourquoi une autre solution échouerait-elle ?
8. comment vérifier qu'on a réussi ?
9. quelles limites, quels compromis ?
10. comment réutiliser ce raisonnement ailleurs ?

> **Ce n'est pas un plan.** Une leçon qui traiterait ces dix points sous dix titres serait
> exactement le défaut que ce document cherche à empêcher. Ce sont des **questions de
> contrôle**, à poser au texte fini, pas des sections à écrire.

Les questions 4, 6 et 7 sont celles qui manquent le plus souvent, et ce sont celles qui
distinguent un cours d'une documentation.

### Le test opérationnel

Pour chaque leçon, formuler **une** question du type :

> « Qu'est-ce qui casserait si je choisissais l'autre option ici ? »

Si la leçon ne permet pas d'y répondre, elle enseigne un vocabulaire, pas une compétence.

Exemple, `k8s-workloads` : *« Qu'est-ce qui casserait si j'utilisais un Deployment pour ma
base de données ? »* — la leçon y répond, et elle répond mieux encore à la question
inverse, celle que personne ne pense à poser : *« mon application est-elle vraiment sans
état ? »*

Contre-exemple générique, à ne jamais produire :

> « StatefulSet : application avec état, identité stable. »

C'est vrai, c'est inutile, et cela ne permet de décider de rien.

---

## 2. La règle d'ordre : expliquer avant de démontrer

Constat mesuré au CP0 : noyau explicatif médian **366 mots**, exemple guidé médian **822**,
correction médiane **974**. Le corpus explique peu et démontre beaucoup.

**Règle.** L'apprenant ne doit pas avoir besoin de lire la correction de l'exercice pour
comprendre le cours. Le modèle mental et le critère de décision précèdent la mise en œuvre
chaque fois que le sujet le permet.

Cela **ne veut pas dire** allonger le noyau. Cela veut dire y déplacer ce qui y manque :
la question qui permet de choisir, l'indice qui permet de reconnaître, la conséquence de
se tromper. Souvent, ces trois éléments existent déjà — dans l'exemple guidé, trois cents
lignes plus bas.

### Le remède type pour un noyau « dictionnaire »

Un bloc de la forme :

```
Deployment  = …
StatefulSet = …
DaemonSet   = …
Job         = …
```

se remplace par la **question qui trie**, puis par ce que chaque réponse implique :

> La question n'est pas « quel objet choisir » mais **« mon application retient-elle
> quelque chose qui doit survivre à l'identité d'une instance ? »**
> Comment le savoir : détruis n'importe quel exemplaire ; si quelqu'un s'en aperçoit,
> la réponse est oui.
> Si oui, l'instance a besoin d'un nom stable et de son disque — c'est ce que le
> StatefulSet fournit et ce qu'un Deployment ne fournit pas.
> Si non — et c'est le cas le plus fréquent, y compris quand on croit le contraire — la
> bonne action n'est pas de changer d'objet, c'est de sortir l'état du processus.

Le tableau de correspondance peut rester : il devient un résumé, après le raisonnement,
au lieu d'en tenir lieu.

---

## 3. Les archétypes

Le corpus ne doit pas avoir 128 fois la même cadence. Chaque leçon relève d'un archétype
déterminé par **son sujet**, pas par un quota.

**Ces archétypes ne sont pas des gabarits.** Aucun n'impose une liste de titres. Ils
décrivent une **façon de conduire le lecteur**, et le choix se justifie en une phrase dans
le ledger.

| archétype | ce que la leçon fait avancer | ce qui la structure |
|---|---|---|
| **fondation conceptuelle** | installer une représentation juste | la distinction qui change tout, éprouvée sur des cas |
| **construction** | faire fabriquer quelque chose qui marche | une suite de décisions, chacune justifiée avant d'être exécutée |
| **debugging** | apprendre à lire un symptôme | symptôme → hypothèses → mesure qui tranche → cause → correctif |
| **comparaison** | savoir choisir | critères explicités **avant** les candidats, puis confrontation |
| **architecture** | raisonner sur des contraintes | contraintes, options, ce que chacune sacrifie |
| **optimisation** | mesurer avant d'agir | mesure initiale, hypothèse, changement, mesure finale, coût |
| **incident** | agir sous pression | chronologie, décisions prises avec l'information disponible, ce qu'on saura après |
| **sécurité** | penser en adversaire | ce que l'attaquant obtient, ce qui l'en empêche vraiment |
| **investigation** | trouver l'information | question, où chercher, comment savoir qu'on a la réponse |
| **revue de code** | juger un travail existant | ce qu'on regarde, dans quel ordre, ce qui se négocie |
| **exercice algorithmique** | construire une solution correcte | invariant, cas de base, coût, cas limites |
| **projet incrémental** | assembler sur la durée | jalons, ce que chacun débloque |
| **synthèse** | relier ce qui a été appris | les liens, pas les rappels |

**Règle anti-clonage.** Deux leçons voisines dans le parcours ne devraient pas partager
archétype **et** rythme. Quand le sujet impose le même archétype, c'est la conduite du
texte qui doit différer : point d'entrée, forme de l'exemple, nature du livrable.

**Ce qui n'est pas du clonage.** Une signature éditoriale commune — ouvrir par un problème
concret, chiffrer, nommer l'erreur probable — est une **qualité**, pas un défaut. Le
défaut commence quand on peut prédire le paragraphe suivant sans lire le sujet.

---

## 4. Ce que V71 ne fera pas

- **Rallonger par réflexe.** Clarté > longueur, raisonnement > volume, progression >
  densité, compréhension > exhaustivité.
- **Créer 61 sections « Cas professionnel ».** Le constat CP0 (61 leçons sans section
  dédiée) n'est pas une consigne de production. D10 se note sur le contenu réel ; un cas
  n'est ajouté que s'il change ce que l'apprenant saura décider.
- **Uniformiser les corrections.** Les huit mouvements possibles d'une correction (rappeler
  le problème, l'indice, le raisonnement, la fausse piste, sa raison d'échec, la solution,
  la vérification, la généralisation) ne s'appliquent pas mécaniquement. Une correction de
  cinq lignes qui pointe l'indice raté vaut mieux qu'une dissertation.
- **Toucher au périmètre interdit** : `progress.json`, les 365 journées, l'interface, le
  design.

---

## 5. Traitement des erreurs fréquentes et des mythes

Une notion devient mémorable quand on comprend pourquoi une intuition plausible est
fausse. Chaque fois que le sujet s'y prête, la leçon doit dire :

- l'intuition raisonnable qui échoue, **et pourquoi elle est raisonnable** ;
- comment le défaut se manifeste concrètement ;
- ce qu'on observerait en production ;
- pourquoi des équipes compétentes font quand même ce choix.

Modèle opposable, tiré du corpus (`javascript-basics`) :

> « Le piège est redoutable parce que le code **a l'air immuable** : il y a un `map`, il y
> a un `return`, on obtient bien un nouveau tableau. Mais ce nouveau tableau contient les
> MÊMES objets. »

C'est la forme recherchée : nommer ce qui rend l'erreur crédible avant de la corriger.

Contre-modèle à éviter : « un cache améliore les performances. » Il faut dire quand il les
améliore, quand il ne fait que déplacer le problème, ce que coûte l'invalidation, et
pourquoi « mettre un cache » est parfois la mauvaise réponse.
