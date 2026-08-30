<!-- keep -->
# Leçon — Prompt engineering (sérieux)

## 🌍 Le problème d'abord
Tu essaies un LLM : tu tapes une phrase, ça répond, magie. Puis tu veux t'en servir DANS un
programme — extraire un montant, classer un ticket, alimenter un RAG — et là, la magie devient
un cauchemar : la même demande donne parfois un JSON propre, parfois un paragraphe poli avec le
JSON noyé dedans, parfois un champ inventé. Le réflexe « j'ajoute “réponds en JSON” » ne règle
rien : il réduit la fréquence des erreurs, il ne les supprime pas. Le problème n'est pas de
trouver la formule magique ; c'est de traiter le prompt comme une SPÉCIFICATION (rôle,
contraintes, format, exemples) dont le résultat est ensuite VÉRIFIÉ par ton code. Cette leçon te
sort de la chasse aux astuces pour entrer dans une discipline d'ingénierie : spécifier, tester,
mesurer, versionner.

## 🎯 Objectif
Comprendre qu'un prompt est une **spécification**, pas une incantation ; savoir écrire des prompts robustes, versionnés et **validés par le code** ; et savoir pourquoi « ajoute “réponds en JSON” » ne suffit jamais en production. Utile dès que tu intègres un LLM dans une application (extraction, classification, RAG, agents).

## 🧠 Modèle mental
Un prompt, c'est **le cahier des charges que tu donnes à un exécutant très rapide, très cultivé, mais distrait et non déterministe**. Tu ne le supplies pas : tu le spécifies (rôle, contraintes, format, exemples), puis tu VÉRIFIES son travail.

## 🧩 Prérequis
Tu dois comprendre ce qu'est un LLM et son non-déterminisme — pourquoi la même entrée peut
donner deux sorties (`/doc/lessons/llm-fundamentals`) — et savoir parser/valider des données
aux frontières d'un programme, gérer un échec proprement (`/doc/lessons/error-handling`). Les
notions de sortie structurée et de retry sont formalisées juste après
(`/doc/lessons/structured-outputs-tools`) ; l'évaluation d'un prompt par un jeu de cas mesuré
s'appuie sur (`/doc/lessons/ai-evaluation`). Sans l'idée de non-déterminisme, « valider la
sortie » paraît superflu — c'est pourtant tout l'enjeu.

## 📖 Explication complète
Un prompt efficace combine quelques éléments :
- **Rôle et tâche** clairs : « Tu es un extracteur d'informations. Extrais X, Y, Z. »
- **Contraintes explicites** : ce qu'il faut faire ET ne pas faire, le format de sortie, quoi faire en cas de doute (« si absent, mets null »).
- **Exemples (few-shot)** : montrer 1-3 cas résolus vaut mieux que dix phrases d'explication — surtout pour un format précis ou une nuance.
- **Format de sortie imposé ET validé** : demander du JSON ne garantit rien ; ton CODE doit parser, valider contre un schéma, et gérer l'échec (retry avec le message d'erreur).
- **Versionner** : un prompt est du code. Il vit dans un fichier, il a des cas de test, il évolue avec des mesures.

Le prompt engineering « sérieux » n'est pas une collection d'astuces magiques (« je vais te donner 100 $ ») mais une **discipline d'ingénierie** : spécifier, tester, mesurer, itérer.

**Le message système et le message utilisateur ne sont pas la même chose**, et le vocabulaire de cette leçon le mentionne sans l'expliquer. Une conversation est une SUITE de messages étiquetés par leur rôle : *system* porte les instructions durables que tu écris, toi, développeur ; *user* porte ce que la personne tape ; *assistant* porte les réponses précédentes. Deux conséquences pratiques. La consigne stable (« tu extrais des informations, tu réponds en JSON, tu mets `null` si absent ») va dans le système, où elle n'a pas à être répétée à chaque tour. Et surtout, **le modèle accorde plus de poids au système sans pour autant le rendre inviolable** : c'est une priorité, pas une barrière. Une instruction de sécurité placée dans le système reste contournable par un texte utilisateur suffisamment insistant — d'où le fait que la sécurité ne se joue jamais dans le prompt seul.

**Laisser au modèle la place de raisonner.** Demander « donne la réponse » sur un problème à plusieurs étapes force le modèle à tout produire d'un coup ; demander de dérouler les étapes avant de conclure améliore nettement les tâches de raisonnement. La raison n'a rien de mystique : un modèle produit un jeton à la fois, chaque jeton produit devient une entrée pour le suivant, et les étapes intermédiaires sont **l'endroit où le calcul se fait**. Sans elles, il n'y a pas d'espace pour calculer — seulement pour deviner.

Deux conséquences opérationnelles qu'on oublie souvent : ce raisonnement coûte des jetons de sortie, donc de l'argent et de la latence ; et il ne doit pas être montré à l'utilisateur ni mélangé aux données. En pratique on le range dans un champ dédié (`{"raisonnement": "...", "resultat": {...}}`) et le code ne lit que `resultat`.

**Ce qui change vraiment un taux de réussite, dans l'ordre.** Sur les prompts qui échouent, la cause est presque toujours l'une de celles-ci, et rarement la formulation :
1. **La tâche est ambiguë** — deux lectures possibles de la consigne, et le modèle choisit la mauvaise une fois sur trois. Un exemple résolu lève l'ambiguïté mieux qu'un paragraphe d'explication.
2. **Le cas limite n'est pas spécifié** : que faire si le champ est absent, si le document est vide, si la question sort du sujet ? Non dit, le modèle improvise — et improvise différemment à chaque appel.
3. **La sortie n'est pas contrainte**, donc elle varie de forme même quand le fond est juste.
4. **Le contexte est trop long ou mal ordonné**, et l'information utile se noie.

Reformuler poliment, promettre une récompense ou insister en majuscules n'apparaît nulle part dans cette liste. C'est ce qui sépare la discipline de la superstition : **on ne peut pas savoir si un prompt s'est amélioré sans un jeu de cas et un taux mesuré**, et beaucoup d'astuces populaires ne survivent pas à cette mesure.

## 🔧 Exemple simple
Faible : `"Résume ce texte."`
Fort : `"Résume le texte ci-dessous en 3 puces factuelles, sans opinion, en français. Si le texte est vide, réponds exactement: AUCUN CONTENU."`

## 🧭 Exemple guidé
**Énoncé** : extraire `{ nom, email, montant }` d'un texte libre, en JSON strict.

Le prompt est correct et contient déjà les quatre bons réflexes — schéma explicite, exemple,
traitement des absents, interdiction de bavarder :

```
Tu extrais des informations. Réponds UNIQUEMENT par un JSON de la forme
{"nom": string|null, "email": string|null, "montant": number|null}.
Si un champ est absent, mets null. Aucune autre sortie.
Exemple: "Facture de Lina (lina@x.com) : 240€" -> {"nom":"Lina","email":"lina@x.com","montant":240}
Texte: "..."
```

**Et pourtant ce prompt échouera.** Pas parce qu'il est mal écrit : parce qu'un prompt est
une consigne, pas une garantie. Voici neuf sorties que ce prompt produit réellement en
production, et ce que le code en fait :

| ce que renvoie le modèle | `JSON.parse` | conforme au schéma |
|---|---|---|
| `{"nom":"Lina","montant":240}` | ✅ | ✅ |
| entouré de <code>\`\`\`json … \`\`\`</code> | ❌ | — |
| `Voici le résultat :` puis le JSON | ❌ | — |
| `{"nom":"Lina","montant":"240"}` | ✅ | **❌** |
| `{"nom":"Lina","montant":"240 EUR"}` | ✅ | **❌** |
| `{"nom":"Lina","montant":240,}` | ❌ | — |
| `{"nom":"Lina"}` (champ absent) | ✅ | **❌** |
| `{"nom":"Lina","montant":"null"}` | ✅ | **❌** |
| `{…,"confiance":0.9}` (champ en trop) | ✅ | ✅ |

```
JSON.parse direct réussit sur              6 / 9
après nettoyage des clôtures et du bavardage : 8 / 9
respectent réellement le schéma demandé :   4 / 9
```

**Décision 1 — la défense évidente protège du mauvais danger.** Le réflexe enseigné est
`JSON.parse` dans un `try/catch`, avec une relance si ça échoue. Regarde la colonne de
droite : **cinq sorties sur neuf passent le `JSON.parse` et sont fausses quand même.** Le
`try/catch` ne se déclenchera jamais pour elles. Une facture de `"240 EUR"` traversera le
système et se retrouvera dans une base, ou dans un total. La leçon dépasse largement les
LLM : **savoir lire une donnée n'est pas savoir qu'elle est correcte**, et confondre les deux
est la même erreur que de croire qu'un fichier JSON bien formé contient les bons champs.

**Décision 2 — valider la forme, pas seulement la syntaxe.** Il faut un contrôle qui vérifie
les **types**, pas la présence :

```js
const valide = (o) =>
  o && typeof o.nom === "string"
    && typeof o.montant === "number" && Number.isFinite(o.montant);
```

Trois lignes, et les cinq sorties trompeuses tombent. Note ce qui distingue les deux cas
piégeux : `"240"` est une chaîne qui *ressemble* à un nombre, `"null"` est une chaîne qui
*ressemble* à une absence. Un modèle produit du texte ; tout ce qu'il rend est du texte,
y compris ce qui a l'air de ne pas l'être. En pratique on emploie une bibliothèque de schéma
plutôt que des `typeof` à la main, mais l'important est le principe : **le schéma vit dans
ton code, pas dans ton prompt.** Le prompt demande, le code exige.

**Décision 3 — que faire des trois échecs de parsing ?** Deux d'entre eux — la clôture
<code>\`\`\`json</code> et la phrase d'introduction — se réparent trivialement en extrayant
ce qui se trouve entre la première `{` et la dernière `}`. Cela fait passer le taux de 6 à 8
sur 9, sans relancer le modèle : gratuit, instantané, et sans coût d'API. Faut-il le faire ?
Oui, à une condition : que ce nettoyage soit **explicite et journalisé**, pas caché. Sinon
tu ne verras jamais que ton modèle a changé de comportement le jour où il se mettra à
bavarder systématiquement.

Le neuvième cas, la virgule finale, résiste. Là, relancer se justifie — mais uniquement en
disant **quoi corriger** : « ta réponse précédente n'était pas un JSON valide, renvoie
uniquement l'objet ». Et une seule fois. Une relance qui répète la même consigne sans
information nouvelle a peu de raisons de mieux marcher, et double le coût.

**Décision 4 — quand la bonne réponse n'est pas un meilleur prompt.** Si l'extraction doit
être fiable, la vraie décision est de ne plus s'en remettre au texte libre : la plupart des
API proposent aujourd'hui un mode où le schéma est **imposé au décodage**, ce qui supprime
d'un coup les trois échecs de parsing et une partie des erreurs de type. Il faut savoir le
dire clairement : **beaucoup de problèmes de prompt engineering se résolvent mieux en
changeant de mécanisme qu'en ajoutant des phrases.** Le prompt reste utile pour le reste —
ce qu'il faut extraire, comment traiter l'ambiguïté — c'est-à-dire pour la sémantique, pas
pour la syntaxe.

**Variante qui déplace le problème.** Ajoute un champ `devise` obligatoire, et donne au
modèle un texte qui n'en mentionne aucune. Il en inventera une — probablement `"EUR"`, parce
que c'est plausible. Le JSON sera valide, le schéma respecté, et la donnée fausse. Aucune
validation technique ne peut attraper ça : c'est un problème de **conception du schéma**, pas
de format. Rendre un champ obligatoire, c'est forcer le modèle à le remplir, donc à deviner.
La bonne réponse est de garder `null` autorisé et de traiter l'absence en aval — car « je ne
sais pas » est une réponse dont ton système a besoin, et qu'un champ obligatoire lui
interdit d'exprimer.

## 🤖 Exemple appliqué (IA / data / architecture)
Dans un RAG, le prompt de génération impose : « réponds UNIQUEMENT à partir des extraits fournis, cite les sources [id], et si l'information n'y est pas, dis-le ». Ce prompt + la validation des citations = ta première ligne de défense contre l'hallucination.

## ⚠️ Erreurs fréquentes
- Croire que « réponds en JSON » suffit (il faut valider).
- Prompts en dur, éparpillés, non versionnés, non testés.
- Prompts vagues (« sois précis ») au lieu de contraintes vérifiables.
- Empiler des instructions contradictoires.

## 🚫 Anti-patterns
- Le « prompt magique » copié sans comprendre.
- Optimiser un prompt au feeling sur 2-3 exemples (biais).
- Mettre toute la logique dans le prompt au lieu du code (parsing, contrôle, boucles).

## ✍️ Mini-exercice
Écris un prompt de classification (texte → une catégorie parmi 4) qui refuse (« INCERTAIN ») si la confiance est faible, et teste-le sur 10 exemples dont 2 ambigus.

## 🔥 Exercice plus difficile
Construis un mini banc d'essai : 15 cas (dont pièges), un script qui appelle le LLM, valide la sortie, et affiche un taux de réussite. Améliore le prompt jusqu'à > 90 %, en notant chaque version.

## ✅ Correction attendue
### La démarche

*Spécifier → montrer un exemple → imposer un format validé → réessayer sur échec → mesurer.*

La cinquième étape est celle qui transforme le sujet : sans mesure, « améliorer un prompt » est
une activité sans critère d'arrêt, où l'on tourne en rond en changeant des mots.

### La séparation qui structure tout

```
prompts/classification.v3.txt      ← le PROMPT : un fichier, versionné
lib/classifier.js                  ← la LOGIQUE : appel, parsing, validation,
                                     nouvelle tentative, journalisation
tests/classification.cases.json    ← les CAS : 15 entrées et leurs réponses attendues
```

Trois fichiers, trois responsabilités, et deux bénéfices immédiats :

- **le prompt devient diffable.** On voit ce qui a changé entre la v2 et la v3, et on peut
  revenir en arrière. Un prompt en chaîne de caractères au milieu du code est un prompt que
  personne ne relit ;
- **la logique est testable sans appeler le modèle.** Le parsing, la validation et la
  re-tentative se testent avec des réponses fabriquées à la main — y compris les réponses
  malformées, qui sont les plus importantes et les plus difficiles à obtenir d'un vrai modèle.

### « Que se passe-t-il si le modèle répond n'importe quoi ? »

C'est la question du critère, et elle a quatre réponses à écrire, pas une :

| Réponse du modèle | Ce que fait ton code |
|---|---|
| JSON valide, catégorie attendue | on l'utilise |
| JSON valide, catégorie **inconnue** | rejet + nouvelle tentative avec le message d'erreur |
| texte avant/après le JSON | extraction du bloc, puis validation |
| JSON invalide, ou vide, ou une excuse | nouvelle tentative, **bornée** |
| échec après N tentatives | **valeur de repli explicite** + journalisation + alerte |

La dernière ligne est celle qu'on omet, et c'est la seule qui garantisse que le système ne
plante pas. La valeur de repli n'est pas un choix par défaut arbitraire : c'est `INCERTAIN`,
c'est-à-dire l'aveu — qui sera traité par un humain ou par une règle.

Deux tentatives suffisent en général. Au-delà, on paie trois appels pour une réponse qui
n'arrivera pas, et le **budget** de tentatives est aussi un budget de coût et de latence : voir
le calcul de `/doc/lessons/llm-cost-optimization`.

### La catégorie `INCERTAIN`, et pourquoi elle change la nature du système

Un classifieur qui doit toujours choisir parmi quatre catégories se trompe sur les cas
ambigus — par construction, puisqu'on lui interdit de dire qu'il ne sait pas.

Ajouter `INCERTAIN` transforme le problème : les erreurs deviennent des **abstentions**, et une
abstention se route vers un humain, tandis qu'une erreur silencieuse se propage.

Le compromis se pose alors correctement :

```
sans INCERTAIN : 88 % correct, 12 % faux et invisibles
avec INCERTAIN : 84 % correct, 13 % en attente humaine, 3 % faux
```

Le second système a un « taux de réussite » inférieur et il est bien meilleur : il a converti
neuf points d'erreur invisible en travail humain identifié. **C'est un arbitrage produit, pas
une performance de modèle**, et c'est le genre de raisonnement qu'on attend de quelqu'un qui
met de l'IA en production.

### Le banc d'essai : les quinze cas et la faute qui l'invalide

Composition attendue : cinq cas nominaux, cinq cas limites, **trois cas ambigus** dont la
réponse attendue est `INCERTAIN`, et deux cas hors domaine.

La faute qui invalide tout : **modifier les cas de test pour qu'ils passent.** Elle se commet
sans mauvaise foi — « en fait ce cas n'était pas si ambigu » — et elle détruit la mesure. Les
cas sont écrits **avant**, et ne changent qu'avec une justification écrite, comme un
changement de spécification.

Et le protocole d'amélioration :

```
v1 → 62 %   v2 (ajout d'un exemple) → 78 %   v3 (format contraint) → 91 %
```

**Un changement à la fois**, et la trace des versions. Sans ça, on ne sait pas ce qui a agi, et
l'on garde des instructions inutiles pendant des mois — chacune coûtant des jetons à chaque
appel.

### La mauvaise solution plausible

Améliorer le prompt en regardant quelques sorties, jusqu'à ce que ça « ait l'air bon ».

C'est ce que fait presque tout le monde, et le problème n'est pas le manque de rigueur : c'est
que **les modèles sont non déterministes**. Deux exécutions du même prompt donnent des résultats
différents. Sur cinq cas regardés à l'œil, l'écart entre deux versions est indiscernable du
bruit.

D'où deux exigences que le banc d'essai satisfait et que l'œil ne peut pas satisfaire : **un
nombre de cas suffisant** pour que la différence sorte du bruit, et **plusieurs exécutions** du
même cas quand la température n'est pas nulle. Un passage de 78 % à 82 % sur quinze cas n'est
pas une amélioration : c'est un ou deux cas qui ont basculé.

### Auto-évaluation

| Vérification | Comment |
|---|---|
| prompt versionné | il est dans un fichier, et `git log` montre son histoire |
| logique testable sans modèle | tes tests de parsing tournent hors ligne |
| sortie non conforme gérée | un test avec une réponse malformée passe |
| budget de tentatives | la boucle ne peut pas tourner indéfiniment |
| repli explicite | l'échec produit `INCERTAIN`, pas une exception ni une valeur inventée |
| mesure reproductible | tu peux donner le score de chaque version du prompt |

### Généralisation

Ce que cette leçon installe : **un prompt est du code**, avec les mêmes exigences — versionné,
testé, mesuré, avec une gestion d'erreur. Ce qui le distingue est qu'il produit un résultat
**non déterministe**, ce qui rend la mesure plus nécessaire encore, pas moins.

Et la conséquence pour la conception : puisque la sortie n'est pas garantie, **la garantie doit
venir du code qui l'entoure** — schéma validé, nouvelle tentative bornée, repli explicite. Le
prompt propose, le code dispose. C'est le même principe que la validation à la frontière de
`/doc/lessons/typescript-frontend` : ce qui vient de l'extérieur se vérifie, quelle que soit
la confiance qu'on lui accorde.


## 🎤 Questions d'entretien
- « Pourquoi “réponds en JSON” ne suffit-il pas ? » → Le LLM est non déterministe ; il faut parser + valider + retry côté code.
- « Quand le few-shot aide-t-il vraiment ? » → Pour un format précis ou une nuance difficile à décrire ; inutile si la tâche est déjà claire.
- « Comment testes-tu un prompt ? » → Un jeu de cas (dont pièges), un taux de réussite mesuré, versionner et comparer.

## 🧾 À retenir
- Un prompt est une spécification, pas une incantation.
- Le format de sortie se VALIDE dans le code, jamais on ne fait confiance.
- Versionner et tester les prompts comme du code.

## 📚 Vocabulaire
**few-shot** · **zero-shot** · **system prompt** · **structured output** · **schéma** · **retry** · **banc d'essai (eval set)** · **température**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Mes prompts sont dans des fichiers versionnés avec des cas de test.
- [ ] Je valide toujours la sortie côté code (schéma + retry).
- [ ] Je sais mesurer le taux de réussite d'un prompt et l'améliorer par la mesure.
- [ ] Je réponds aux questions d'entretien ci-dessus.

## 🔗 Liens avec le programme
Mois 8 (jours ~211-230), projet 6 (DocQA) et projet final (DocSense). Leçon liée : `llm-fundamentals`, `ai-evaluation`.
