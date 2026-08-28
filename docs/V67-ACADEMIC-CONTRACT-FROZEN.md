# V67 — Contrat éditorial gelé

> **Gelé au CP1, avant toute modification d'une leçon.** Les principes de ce
> document ne sont pas rouverts après avoir vu des résultats. Si l'un se révèle
> mal formé, il est **déclaré défaillant et écarté**, jamais réajusté jusqu'à
> donner le verdict voulu.

---

## 0. Ce que le CP0 a établi, et qui commande ce contrat

Le CP0 a vérifié — et corrigé — deux constats sur lesquels le brief reposait :

- **Les 52 revues ne sont pas vides.** Elles portent 11 composants sur 11
  (récupération sans notes, questions cumulatives, remédiation diagnostiquée,
  grille de notation, transfert…). Le chiffre « 3 % de leur durée » de V66
  mesurait un temps de LECTURE et a été présenté comme une vacuité.
- **La famille A ne prédit pas la qualité**, dans les deux sens :
  `react-fundamentals` est A et excellent, `nextjs-foundations` est C et creux.

Et il en a trouvé un troisième, absent de tous les sprints précédents :

> **68 leçons sur 128 (53 %) ne sont liées par aucune des 365 journées.**
> La compétence `cloud` — 32 leçons — ne compte **aucune** journée.

Le contrat ci-dessous s'applique donc à un corpus dont le premier défaut n'est
pas la rédaction, mais l'**assignation**.

---

## 1. Une notion nommée n'est pas une notion enseignée

Une leçon n'enseigne pas un concept parce qu'elle contient son nom.

Chaque concept majeur doit être introduit, contextualisé, expliqué simplement,
expliqué précisément, relié à un problème concret, illustré, manipulé ou
raisonné, et réutilisé quand c'est pertinent.

**Test opératoire, hérité de V66 et conservé :** retire du passage tous les noms
propres, acronymes et termes marqués. Si le mécanisme ne survit pas, le passage
nomme au lieu d'enseigner.

## 2. Une définition n'est pas une explication

« Une closure est une fonction qui conserve son environnement lexical » peut
être exact et pédagogiquement inutile. L'apprenant doit comprendre quel problème
cela résout, ce qui se passe réellement, pourquoi le comportement surprend,
comment le reconnaître, quand cela devient utile, et quelle erreur classique
cela produit.

## 3. Intuition d'abord, précision ensuite

Pour toute notion structurante : une intuition accessible, un modèle mental, un
fonctionnement précis, une application, puis les limites et les pièges.

**Pas nécessairement sous ces titres, et surtout pas comme cinq intertitres
imposés.** La narration reste naturelle. Deux leçons doivent pouvoir avoir des
structures différentes si le sujet le justifie.

## 4. Une analogie annonce sa limite

Les analogies sont encouragées. Une analogie sans limite fabrique un mauvais
modèle mental, et le corpus le fait déjà bien par endroits :

> « Limite de l'analogie : un logiciel n'a pas de capot physique — les traces
> sont des données qu'il faut avoir DÉCIDÉ d'émettre AVANT la panne. »
> — `observability-fundamentals`

## 5. Un exemple montre, une correction enseigne

Un exemple guidé montre un chemin. Une correction explique pourquoi une solution
fonctionne ou échoue : démarche, choix, erreurs probables, alternative, et un
critère que l'apprenant peut vérifier seul.

**Mesuré au CP0 :** 100 % des corrigés donnent un critère, 50 % expliquent le
pourquoi, 45 % traitent l'erreur probable, **24 % montrent une alternative**.
Un tiers seulement réunit trois des quatre.

## 6. Pas de soupe de mots-clés

Quand cinq termes techniques apparaissent en trois lignes sans développement,
c'est un signal d'alerte. Un concept nouveau apparaît quand son contexte le rend
nécessaire.

**Mesuré au CP0 :** la pire fenêtre de trois lignes d'une leçon contient
**8 termes marqués en médiane**, jusqu'à 12.

## 7. Le temps annoncé est un contrat pédagogique

Une journée annoncée à 4 h 30 ne peut pas fournir 33 minutes de lecture et
laisser l'apprenant inventer le reste. Chaque journée doit dire ce qu'il lit,
observe, reproduit, tente seul, corrige, révise et produit.

**Le temps vient de tâches authentiques.** Une durée écrite sans tâche derrière
est un mensonge, et il vaut mieux ne rien annoncer que d'annoncer faux.

## 8. Aucun allongement artificiel

Une leçon ne devient plus longue que si elle gagne du raisonnement, une
explication, un exemple, un exercice, une correction, une nuance, un transfert
ou une récupération active.

**Contre-exemple à garder en tête :** en V66, `rag-evaluation` est restée à
226 mots de noyau parce qu'elle était déjà causale et structurée. Ne pas
l'allonger était le bon geste, et c'est ce que ce contrat exige.

## 9. Écrit pour quelqu'un qui apprend

Aucun saut conceptuel important n'est laissé implicite sous prétexte qu'il est
inférable. Une notion employée doit avoir été introduite avant.

**Mesuré au CP0 :** sept notions techniques sont employées plus de **cent
jours** avant la journée qui les enseigne (`runner` 248, `latency` 245,
`CI/CD` 235, `OWASP` 203…).

## 10. Une leçon écrite doit être une leçon assignée

**Principe ajouté par le CP0 de V67, et c'est le plus lourd.**

Une leçon qu'aucune journée ne programme n'enseigne personne. Elle peut être
excellente : si le parcours ne la rencontre jamais, elle n'existe pas pour
l'apprenant qui suit le programme.

Toute leçon du corpus doit être atteignable depuis au moins une journée, ou être
explicitement déclarée comme référence facultative — jamais orpheline par
accident.

---

## 11. Ce que ce contrat INTERDIT explicitement

- Ajouter des mots pour atteindre un quota.
- Dupliquer une explication d'une leçon à l'autre.
- Imposer les mêmes quinze intertitres à 128 pages.
- Générer des leçons de structure identique en série.
- Écrire des durées sans tâche derrière.
- Compter une pause comme du temps d'apprentissage.
- Créer une activité vague (« pratique 90 min ») sans consigne.
- Réécrire une leçon déjà bonne pour la rendre différente.
- Retoucher une mesure après avoir vu son résultat.
- Sacrifier l'exactitude technique à la vulgarisation.
- Déclarer un verdict pour faire plaisir.

---

## 12. Ce qui reste hors de portée de V67

- Le Retention Engine II.
- L'IDE.
- Toute refonte d'interface.
- Toute modification de `data/progress.json`.
- Tout réordonnancement des 365 journées.
- Toute rupture d'identifiant public ou de route.
