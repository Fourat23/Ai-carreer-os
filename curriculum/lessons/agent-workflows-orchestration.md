<!-- keep -->
# Leçon — Agents avancés et orchestration de workflows

## 🌍 Le problème d'abord
Tu as fait tourner un petit agent en démo : impressionnant. Puis tu veux le mettre en
production sur une vraie tâche répétée, et tout se complique — il coûte cher, part parfois dans
une boucle, donne des résultats différents à chaque exécution, et tu ne sais plus s'il a
réussi. La question n'est alors plus « comment coder un agent » mais « comment ORCHESTRER le
travail de façon fiable et prévisible » : quand enchaîner des étapes fixes (workflow), quand
laisser le modèle décider (agent), comment paralléliser, borner les budgets, reprendre sur
échec. Cette leçon te fait passer de la démo à l'ingénierie — et à décider agent vs workflow
sur des CHIFFRES, pas sur la mode.

## 🎯 Objectif
Passer du « petit agent démo » à l'orchestration sérieuse : les 4 patterns de workflow, la parallélisation, la reprise sur échec, les budgets, et les critères CHIFFRÉS pour trancher agent vs workflow. C'est la compétence d'architecture appliquée à l'IA.

## 🧠 Modèle mental
Un workflow est **une chaîne de production** (étapes fixées, débit prévisible) ; un agent est **un artisan autonome** (s'adapte, mais variable et cher). L'orchestrateur, c'est toi : tu choisis l'outil par tâche, tu bornes les budgets, tu prévois les pannes.

## 🧩 Prérequis
Tu dois maîtriser les fondamentaux des agents — boucle décider→agir→observer, function calling,
garde-fous, modes d'échec (`/doc/lessons/agents-fundamentals`) — et les sorties structurées/
outils (`/doc/lessons/structured-outputs-tools`). Les notions d'architecture réutilisées ici
(découper un traitement, le paralléliser, le reprendre) viennent de
`/doc/lessons/architecture-basics`. Aucun framework d'agents particulier n'est supposé.

**Les trois mécanismes de robustesse dont la leçon a besoin sont construits dans son exemple
guidé, pas supposés connus** : borner le parallélisme, écrire l'état au fur et à mesure pour
pouvoir reprendre, et isoler l'échec d'un élément pour qu'il n'arrête pas les autres. Chacun
est introduit par le problème qu'il résout et écrit en entier.

> **Où trouver le détail.** `/doc/lessons/resilience-patterns` traite les protections d'un
> appelant face à une dépendance lente ou tombée — délai d'attente, nombre de tentatives,
> disjoncteur — et chiffre ce que chacune coûte. Elle est **programmée plus loin** dans le
> parcours ; rien ici ne suppose que tu l'as lue.

## 📖 Explication complète
- **Les 4 patterns de workflow** :
  1. **Chaînage** : A → B → C (extraire → analyser → rapporter). Simple, débuggable étape par étape.
  2. **Parallélisation** : traiter n éléments indépendants en parallèle (n documents → n résumés) — latence divisée, coût identique.
  3. **Routage** : un classifieur léger dirige vers le bon traitement (question simple → petit modèle ; complexe → gros ; hors-sujet → refus).
  4. **Évaluateur-optimiseur** : générer → évaluer → régénérer si insuffisant (boucle bornée).
- **L'orchestration à l'échelle** (500 documents/jour) : découpage en unités reprenables, file de travail, état persisté (quel doc traité, lequel a échoué), reprise sur échec PARTIEL (on ne relance pas les 400 réussis), budget global (coût/temps) avec arrêt propre, et traces par unité.
- **Agent : quand et comment** : seulement si le chemin dépend des découvertes. Et alors : boucle bornée, outils au moindre privilège, traces complètes, mémoire gérée (l'historique enfle → résumer/élaguer), et un TAUX DE RÉUSSITE mesuré sur des cas répétés (un agent à 60 % de réussite est inutilisable ; on le sait en mesurant, pas en démo).
- **Trancher par les chiffres** : implémenter les deux sur un cas réel et comparer coût / latence / fiabilité / qualité sur 5-10 exécutions. La réponse la plus fréquente en production : workflow, avec parfois un agent encapsulé dans UNE étape bien bornée.

## 🔧 Exemple simple
Veille quotidienne : lister les sources → résumer chacune (parallèle) → agréger → publier. Quatre étapes fixes : chaînage + parallélisation, zéro agent nécessaire.

## 🧭 Exemple guidé
Il faut analyser **500 documents**. Le premier réflexe est d'écrire une boucle. Voyons ce que
cette boucle devient au contact du réel, et pourquoi la question « faut-il un agent ? » ne se
pose qu'à la toute fin.

### La boucle naïve, et les quatre choses qui la cassent

```js
for (const doc of documents) {
  resultats.push(await analyser(doc));      // 500 appels, un par un
}
```

Elle fonctionne — sur cinq documents. À 500 :

| Ce qui arrive | Conséquence |
|---|---|
| le 317ᵉ échoue (document corrompu) | **tout s'arrête**, les 316 précédents sont perdus si rien n'a été écrit |
| l'API impose une limite de débit | les appels sont refusés en rafale |
| chaque appel prend 3 s | 500 × 3 s = **25 minutes** en séquentiel |
| le processus est tué (déploiement, mémoire) | on recommence de zéro |

Quatre problèmes, et **aucun ne concerne l'intelligence du traitement**. Ce sont des problèmes
d'orchestration, et c'est le sujet réel de cette leçon : ce qui rend un traitement par lots
robuste n'a presque rien à voir avec ce qu'il calcule.

### Les quatre réponses

```js
const etat = chargerEtat();                                    // ① persistance
const aFaire = documents.filter((d) => etat[d.id] !== 'fait'); // ② reprise

for (const lot of parPaquets(aFaire, 10)) {                    // ③ parallélisme borné
  await Promise.all(lot.map(async (doc) => {
    try {
      await analyser(doc);
      etat[doc.id] = 'fait';
    } catch (e) {
      etat[doc.id] = `echec:${e.message}`;                     // ④ isolation des échecs
    }
    sauverEtat(etat);
  }));
}
```

**① et ② — l'état persistant et la reprise.** C'est l'idempotence de
`/doc/lessons/etl-pipelines`, appliquée ici : relancer ne refait pas ce qui est fait. Sans elle,
une interruption au document 400 coûte 400 appels payants et vingt minutes.

Le détail qui compte : l'état est écrit **au fur et à mesure**, pas à la fin. Un état sauvegardé
à la fin ne survit pas à ce contre quoi il est censé protéger.

**③ — le parallélisme borné.** Dix à la fois, pas cinq cents. Sans borne, on dépasse la limite
de débit du fournisseur, on sature sa propre mémoire, et l'on transforme un traitement lent en
traitement échoué. La borne fait passer les 25 minutes à environ 2,5, ce qui est le vrai
bénéfice — et elle n'ajoute presque rien en complexité.

**④ — l'isolation des échecs.** Un document corrompu ne doit pas arrêter les 499 autres. Il est
marqué, on continue, et l'on obtient à la fin *« 497 traités, 3 en échec, voici lesquels et
pourquoi »* — un résultat exploitable, au lieu d'une exception.

C'est la même logique que la file d'attente d'échecs de `/doc/lessons/async-messaging-queues` :
**un élément empoisonné ne doit jamais immobiliser le reste.**

### Maintenant seulement : quel motif d'orchestration ?

Quatre motifs, et une question qui les départage.

| Motif | Quand | Exemple |
|---|---|---|
| **chaînage** | les étapes sont connues et ordonnées | extraire → résumer → traduire |
| **parallélisation** | les unités sont indépendantes | les 500 documents ci-dessus |
| **routage** | le traitement dépend d'une classification | trier des tickets support |
| **agent** | **le chemin dépend de ce qu'on découvre en route** | investiguer un bug inconnu |

La question unique : **peux-tu écrire à l'avance la suite des étapes ?**

Si oui — et c'est le cas dans l'immense majorité des situations —, un workflow suffit, et il est
**déterministe, testable, chiffrable et rejouable**. Si non, si la deuxième étape dépend
réellement du résultat de la première d'une manière qu'on ne peut pas énumérer, alors seulement
un agent se justifie.

### Le coût de l'agent, qu'on ne mentionne jamais

Un agent est séduisant parce qu'il paraît général. Voici ce qu'il coûte :

- **le nombre d'appels n'est plus prévisible.** Un workflow à trois étapes coûte trois appels ;
  un agent en coûte entre deux et vingt, selon son humeur ;
- **le résultat n'est plus reproductible.** Deux exécutions sur la même entrée peuvent prendre
  des chemins différents, ce qui rend le débogage et les tests bien plus difficiles ;
- **les échecs sont diffus.** Un workflow échoue à une étape nommée ; un agent « n'aboutit
  pas », après huit tours dont il faut relire la trace.

D'où la règle de sélection : **le motif le plus contraint qui résout le problème.** On ne
choisit pas l'agent parce qu'il est plus puissant, on l'accepte quand rien de plus simple ne
convient — exactement comme on ne choisit pas une architecture distribuée parce qu'elle passe
mieux à l'échelle.

### Les trois choses qu'un agent doit avoir, sans exception

Si l'on en arrive là, trois garde-fous ne sont pas optionnels :

1. **un budget** — nombre de tours **et** jetons cumulés, comme dans
   `/doc/lessons/structured-outputs-tools` ;
2. **une trace complète** — chaque décision, chaque appel d'outil, chaque résultat. Sans elle,
   comprendre un échec est impossible ;
3. **un critère d'arrêt explicite** — à quoi reconnaît-on que c'est fini ? « Quand le modèle
   dit qu'il a fini » n'en est pas un : c'est la partie du système à laquelle on fait le moins
   confiance.


## 🤖 Exemple appliqué (IA / data / architecture)
Le workflow d'analyse de DocSense (résumé, points clés, incohérences) est un chaînage avec parallélisation par section, coût affiché par analyse, et reprise si un appel échoue. Le choix « workflow, pas agent » y est documenté en ADR avec les chiffres de la comparaison — exactement ce qu'un recruteur senior veut entendre.

## ⚠️ Erreurs fréquentes
- L'agent par défaut (plus cher, moins fiable, pour rien si le chemin est connu).
- Orchestration sans état persisté → tout relancer au moindre échec.
- Parallélisation sans borne → rate limits et facture.
- Aucun taux de réussite mesuré (la démo qui marche 1 fois sur 3).

## 🚫 Anti-patterns
- La « chaîne d'agents » quand une chaîne d'ÉTAPES suffit.
- L'historique d'agent qui enfle sans gestion (coût et contexte explosent).

## ✍️ Mini-exercice
Pour ces 4 tâches — résumé quotidien de 20 articles, tri de tickets support, investigation d'un bug inconnu, migration de 10 000 fiches — choisis : chaînage, parallélisation, routage, ou agent. Justifie en une ligne chacune.

## 🔥 Exercice plus difficile
Implémente le même cas (vérification de cohérence de docs) en version agent ET en version workflow ; compare sur 5 exécutions : coût, latence, fiabilité, qualité. Rédige la décision en ADR.

## ✅ Correction attendue
### La démarche

*Motifs de workflow d'abord ; un agent seulement si le chemin dépend de ce qu'on découvre.
Orchestration = état + reprise + budgets + traces.*

### Les quatre tâches, et leur verdict

| Tâche | Motif | Pourquoi |
|---|---|---|
| résumé quotidien de 20 articles | **parallélisation** | 20 unités indépendantes, chemin identique pour chacune |
| tri de tickets support | **routage** | une classification décide du traitement — et rien d'autre |
| investigation d'un bug inconnu | **agent** | la deuxième action dépend de ce que révèle la première |
| migration de 10 000 fiches | **parallélisation** + reprise | idem ligne 1, avec un état persistant obligatoire |

Trois sur quatre ne sont pas des agents, et c'est le résultat attendu de l'exercice. La
question qui trie : **peux-tu écrire à l'avance la suite des étapes ?**

Deux justifications méritent d'être détaillées.

**Le tri de tickets est un routage, pas un agent**, même si l'on est tenté de dire « le
traitement dépend du contenu ». Il en dépend, oui — mais par une **classification finie**, dont
les catégories sont connues d'avance. Chaque branche est ensuite déterministe. Un agent y
ajouterait de la variabilité et du coût sans rien apporter, et rendrait le tri impossible à
tester.

**L'investigation d'un bug est un vrai agent**, et c'est le seul du tableau. On ne peut pas
écrire la suite des étapes : lire les journaux peut mener à examiner une base, ou à relire un
déploiement, ou à comparer deux versions — et ce choix dépend de ce qu'on vient de trouver.
C'est la définition exacte du cas où un agent se justifie.

### La ligne 4 : pourquoi elle diffère de la ligne 1

Vingt articles et dix mille fiches relèvent du même motif, et pas du même niveau d'exigence.

| | 20 articles | 10 000 fiches |
|---|---|---|
| durée totale | ~1 minute | ~1 heure |
| probabilité d'interruption | négligeable | **quasi certaine** |
| état persistant | facultatif | **obligatoire** |
| coût d'une reprise à zéro | nul | des heures et de l'argent |

**C'est le volume qui change la conception, pas la nature de la tâche.** À 20, on peut se
permettre de tout refaire ; à 10 000, la reprise est le sujet principal, et l'orchestration
compte davantage que le traitement lui-même.

### Ce que « orchestration = état + reprise + budgets + traces » veut dire, point par point

| Élément | Le test qui prouve qu'il est là |
|---|---|
| **état** | tue le processus au milieu, redémarre : il repart où il en était |
| **reprise** | relance après une exécution complète : **aucun travail refait** |
| **budgets** | une unité qui boucle est arrêtée par une limite, pas par le compte bancaire |
| **traces** | pour une unité donnée, tu peux dire ce qui a été tenté et pourquoi ça a échoué |

Le premier test est le plus révélateur, et le plus rarement effectué. Beaucoup de scripts
« avec reprise » sauvegardent leur état **à la fin** — c'est-à-dire au seul moment où la reprise
ne sert à rien.

### La comparaison workflow / agent sur le même cas

L'exercice difficile demande d'implémenter le même cas des deux façons. Le tableau attendu :

| | Workflow | Agent |
|---|---|---|
| appels par unité | **3, toujours** | 2 à 20, variable |
| coût prévisible | oui | non |
| reproductible | oui | non |
| testable | oui, chaque étape | difficilement |
| gère l'imprévu | non | oui |
| lisible dans six mois | oui | seulement via les traces |

Cinq lignes sur six favorisent le workflow. La sixième est la seule qui compte — quand elle est
vraie.

Le point que l'exercice doit faire toucher : **on ne compare pas la qualité des résultats, on
compare la maîtrise du système.** Un agent qui produit un aussi bon résultat qu'un workflow, de
façon imprévisible et non reproductible, est un moins bon système.

### La mauvaise solution plausible

Utiliser un agent pour tout, « parce que c'est plus flexible et que ça évite d'écrire la
logique ».

C'est vrai au début : on écrit moins de code, ça fonctionne sur les cas essayés. Ce que ça
coûte apparaît ensuite :

1. **le coût explose et devient imprévisible** — impossible d'estimer une facture mensuelle
   quand le nombre d'appels par unité varie d'un facteur dix ;
2. **on ne peut plus tester** — une étape déterministe se teste ; un chemin qui varie ne se
   teste que statistiquement, sur un jeu de référence qu'il faut construire ;
3. **le débogage devient de l'archéologie** — comprendre pourquoi une unité a échoué demande de
   relire huit tours de trace, au lieu de lire un nom d'étape.

Le raisonnement à corriger : *un agent n'est pas un workflow plus intelligent, c'est un workflow
dont on a abandonné le contrôle en échange de la capacité à gérer l'imprévu.* Cet échange est
excellent quand il y a de l'imprévu, et coûteux quand il n'y en a pas.

### Auto-évaluation

| Vérification | Comment |
|---|---|
| motif justifié | tu peux dire, en une phrase, pourquoi ce n'est **pas** le motif d'à côté |
| reprise réelle | processus tué au milieu → relance → rien n'est refait |
| parallélisme borné | la limite est écrite dans le code, pas espérée |
| échecs isolés | une unité qui échoue laisse les autres se terminer |
| budget sur l'agent | tours **et** jetons, avec un comportement défini à l'épuisement |
| résultat exploitable | la fin donne « N réussis, M échoués, voici lesquels et pourquoi » |

### Généralisation

Ce que cette leçon installe n'appartient pas à l'IA : c'est du **traitement par lots**, discipline
ancienne et bien établie. État persistant, reprise, parallélisme borné, isolation des échecs,
traces — ce sont les mêmes exigences qu'un traitement bancaire de nuit ou qu'un import de
catalogue.

La nouveauté n'est ni le problème ni sa solution : c'est que chaque unité coûte de l'argent et
peut échouer de façon non déterministe, ce qui rend ces vieilles exigences **plus** nécessaires,
pas moins. Beaucoup d'équipes les redécouvrent péniblement en croyant que leur problème est
inédit.


## 🎤 Questions d'entretien
- « Conçois le traitement quotidien de 10 000 documents par LLM. » → File + état + parallélisation bornée + reprise + budget + traces (pas un agent).
- « Quand un agent se justifie-t-il vraiment ? » → Chemin dépendant des découvertes ; borné, outillé au moindre privilège, taux de réussite mesuré.
- « Comment gères-tu un échec au milieu de 500 documents ? » → État persisté par unité : on ne relance que les échecs.

## 🧾 À retenir
- 4 patterns de workflow : chaînage, parallélisation, routage, évaluateur-optimiseur.
- Orchestration = état persisté + reprise partielle + budgets + traces.
- Agent vs workflow se tranche par les CHIFFRES (coût/latence/fiabilité), pas par la mode.

## 📚 Vocabulaire
**chaînage / routage / parallélisation / évaluateur-optimiseur** · **file de travail** · **état persisté** · **reprise (resume)** · **échec partiel** · **budget** · **taux de réussite** · **rate limit**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je choisis le bon pattern par tâche et je le justifie.
- [ ] Mes pipelines reprennent après échec partiel sans tout refaire.
- [ ] Ma décision agent/workflow s'appuie sur une comparaison mesurée.

## 🔗 Liens avec le programme
Mois 10 (jours ~274-287), mois 11 (workflow DocSense). Leçons liées : `agents-fundamentals`, `structured-outputs-tools`, `llm-cost-optimization`, `architecture-basics`.
