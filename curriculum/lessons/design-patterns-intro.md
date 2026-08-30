<!-- keep -->
# Leçon — Design patterns : introduction

## 🌍 Le problème d'abord
En codant, tu rencontres sans cesse les mêmes situations : « j'ai besoin d'interchanger un
comportement », « je dois créer le bon objet selon une config », « deux librairies ont des
formes différentes pour le même besoin ». D'autres avant toi ont résolu exactement ces
problèmes, et ont donné un NOM à chaque solution : ce sont les **design patterns**. Leur
intérêt n'est pas magique — tu as probablement déjà réinventé la moitié d'entre eux sans le
savoir — c'est de te donner un VOCABULAIRE commun : dire « mets un Adapter là » transmet en
trois mots ce qui prendrait dix minutes à expliquer. Cette leçon te fait reconnaître les
patterns les plus utiles pour les nommer et éviter de réinventer la roue.

## 🎯 Objectif
Reconnaître les patterns les plus rentables (Strategy, Factory, Adapter, Observer, Singleton)
au moment où leur problème apparaît, comprendre les principes qui les sous-tendent (open/closed,
inversion de dépendance), et éviter le piège du pattern appliqué sans problème (la
sur-ingénierie).

## 🧩 Prérequis
Tu dois être à l'aise avec les fonctions comme valeurs (callbacks), les interfaces/types et la
composition (`/doc/lessons/javascript-basics`, `/doc/lessons/typescript-basics`) et avoir
intégré les principes de clean code (`/doc/lessons/clean-code`), car les patterns sont des
applications nommées de ces principes. Aucune connaissance préalable des patterns n'est
supposée.

## 🧠 Modèle mental
Un pattern est un couple **problème récurrent → solution nommée**. Il se RECONNAÎT quand son
problème apparaît, il ne s'applique jamais préventivement. L'ordre correct est toujours :
douleur ressentie → « il existe un nom pour ça » → solution nommée. Appliquer un pattern sans
en avoir le problème est l'anti-pattern le plus fréquent de ceux qui viennent de les
apprendre.

## 💡 Pourquoi c'est important
Un design pattern est une solution NOMMÉE à un problème récurrent de conception. Leur valeur première n'est pas le code (tu as déjà réinventé la moitié d'entre eux) mais le VOCABULAIRE : « mets un Adapter devant » transmet en trois mots ce qui prendrait dix minutes d'explication. Les revues de code, les entretiens et les livres d'architecture parlent cette langue.

## Explication complète

### Le bon état d'esprit
Un pattern se RECONNAÎT quand son problème apparaît — il ne s'applique jamais préventivement. Le pattern sans problème est de la sur-ingénierie (l'anti-pattern le plus répandu chez ceux qui viennent de les apprendre). Ordre correct : douleur → « il y a un nom pour ça » → solution nommée.

### Les cinq patterns les plus rentables

**Strategy — injecter un comportement interchangeable.**
Problème : une logique qui varie selon un cas (calcul de tarif, méthode de tri, choix de modèle LLM).
Solution : passer le comportement en paramètre (une fonction, ou un objet à interface commune).
Tu le pratiques depuis le jour 22 : `sort(comparateur)`, `filter(predicat)` — les callbacks SONT des stratégies.

**Factory — centraliser la création.**
Problème : construire le bon objet selon une config, avec la logique de construction dupliquée partout.
Solution : UNE fonction/classe qui fabrique (`creerNotifieur(type)` → Email | SMS | Push).
Bénéfice : ajouter un type = toucher un seul endroit.

**Adapter — uniformiser l'incompatible.**
Problème : deux APIs aux formes différentes pour le même besoin (deux fournisseurs LLM, deux vector DBs).
Solution : une couche qui traduit chacune vers TON interface.
Ton module `api.ts` (mois 4) et les adapters hexagonaux (mois 10) en sont.

**Observer — notifier sans coupler.**
Problème : quand X change, dix choses doivent réagir — sans que X les connaisse.
Solution : X publie des événements, les intéressés s'abonnent.
C'est le modèle du DOM (`addEventListener`), des webhooks, et de l'event-driven (mois 10).

**Singleton — une instance unique.**
Problème : une ressource qui ne doit exister qu'une fois (connexion DB, config).
Solution : un point d'accès global à l'instance unique.
⚠️ Le plus critiqué : c'est un état global déguisé (couplage caché, tests difficiles). En JS, un simple module exporté fait souvent l'affaire — connais-le surtout pour le nommer.

### Les principes derrière les patterns
Deux principes génèrent la plupart des patterns :
- **Open/closed** : ouvert à l'extension, fermé à la modification — ajouter un cas SANS toucher au code existant (Strategy, Factory, Observer le permettent).
- **Inversion de dépendance** : dépendre d'abstractions (interfaces), pas d'implémentations (Adapter, ton interface Store, l'hexagonal).

### Les anti-patterns (à reconnaître chez soi)
God object (une classe/fichier qui fait tout) · spaghetti (tout appelle tout) · sur-ingénierie (résoudre des problèmes imaginaires) · copier-coller comme méthode de réutilisation · la mauvaise abstraction (fusionner deux choses juste ressemblantes — pire que dupliquer).

## Concepts clés
Pattern = problème + solution nommée · Strategy, Factory, Adapter, Observer, Singleton · open/closed · inversion de dépendance · composition > héritage · anti-patterns.

## 🧭 Exemple guidé — reconnaître un pattern au lieu de l'appliquer

Cette leçon dit qu'un pattern se **reconnaît** quand son problème apparaît. Le montrer
suppose donc de partir du problème, pas de la solution. Voici le code tel qu'on l'écrit
vraiment la première fois — il est correct, et il n'a rien de honteux :

```ts
function alerter(msg: string, canal: 'email' | 'sms') {
  if (canal === 'email') envoyerEmail(msg);
  else envoyerSMS(msg);
}
```

**Décision 1 — faut-il changer quelque chose ? Pour l'instant, non.**

Deux canaux, un `if`. C'est lisible, testable, et personne n'y perd de temps. Introduire une
interface et deux classes ici serait de la sur-ingénierie : plus de fichiers, plus
d'indirections, aucun bénéfice. **Le premier réflexe correct est de ne rien faire.**

Le pattern n'existe pas encore parce que son problème n'existe pas encore.

**Décision 2 — le problème apparaît, et on le nomme avant d'agir.**

Trois mois plus tard : Slack, puis les notifications push, puis un webhook client. Le `if`
est devenu une chaîne de cinq branches. Surtout, un deuxième endroit du code a besoin de la
même liste, et un troisième d'un sous-ensemble. Et l'on constate ceci :

> Chaque ajout de canal oblige à modifier `alerter`, qui n'a pourtant rien à voir avec la
> façon d'envoyer un message.

C'est **ça**, le problème — pas « le code est moche ». Il porte un nom, et le nom vient
avec sa solution : ce que `alerter` fait varier, c'est un **comportement**, et un
comportement qui varie s'injecte au lieu de se brancher. C'est Strategy.

**Décision 3 — quel pattern, et pourquoi pas l'autre.**

Deux besoins distincts se sont accumulés, et il faut les séparer pour choisir :

- *Comment envoyer* varie → **Strategy** : `alerter` reçoit des objets qui savent envoyer, et
  cesse de connaître leurs noms.
- *Choisir lequel construire à partir d'une chaîne de configuration* → **Factory** : une
  fonction unique traduit `'slack'` en l'objet correspondant.

On aurait pu ne prendre que Strategy et laisser chaque appelant construire son objet — c'est
défendable tant qu'il n'y a qu'un appelant. Dès qu'il y en a trois, la logique de
construction se duplique, et c'est exactement le problème que Factory résout.

```ts
interface Notifieur { envoyer(msg: string): void }            // le contrat

class Email implements Notifieur { envoyer(m: string) { envoyerEmail(m); } }
class SMS   implements Notifieur { envoyer(m: string) { envoyerSMS(m); } }

const creerNotifieur = (type: 'email' | 'sms'): Notifieur =>  // Factory : le seul endroit
  type === 'email' ? new Email() : new SMS();                 // qui connaît la liste

function alerter(notifieurs: Notifieur[], msg: string) {      // Strategy : ne connaît
  for (const n of notifieurs) n.envoyer(msg);                 // que le contrat
}
```

**Comment tu sais que c'est mieux.** Le test tient en une phrase : **ajoute Slack et compte
les fichiers modifiés.** Une classe nouvelle, une ligne dans `creerNotifieur`. `alerter` n'est
pas touché — et c'est vérifiable, pas une impression. C'est ce que le principe
ouvert/fermé signifie concrètement : ouvert à l'extension, fermé à la modification.

**Ce que ça t'a appris.** Un pattern ne rend pas le code « meilleur » dans l'absolu : il
**déplace le coût du changement** vers l'endroit où le changement arrive. Si le changement
n'arrive jamais, tu as payé l'indirection pour rien. C'est pourquoi l'ordre — douleur
d'abord, nom ensuite — n'est pas une précaution pédagogique mais la seule façon de savoir
si le pattern est rentable.

**Variante qui déplace le problème.** Le besoin change de nature : il ne s'agit plus
d'envoyer sur plusieurs canaux, mais que **dix parties du système réagissent** quand une
commande est payée — envoyer un e-mail, mettre à jour le stock, notifier la comptabilité,
recalculer des statistiques. Reprends le raisonnement depuis le problème. Tu verras que
Strategy ne convient pas : il faudrait que le code de paiement reçoive et connaisse les dix.
Ce qu'il faut ici, c'est qu'il **n'en connaisse aucun** — il publie « commande payée », les
intéressés s'abonnent. C'est Observer. **Le pattern se lit dans la forme du couplage qu'on
veut supprimer, jamais dans le vocabulaire du domaine.**

## ⚠️ Erreurs fréquentes
- Appliquer un pattern « parce qu'on l'a appris » : la sur-ingénierie EST un anti-pattern.
- L'héritage profond (A extends B extends C) là où la composition suffit.
- Singleton par réflexe : demande-toi d'abord si un module exporté ne suffit pas.
- Mémoriser les 23 patterns du Gang of Four : les 5 d'ici couvrent 90 % des besoins réels.

## 🔗 Liens avec le programme
Tes systèmes IA en sont truffés : **Strategy** = interchanger les modèles LLM ou les stratégies de chunking (mois 9 : tu les COMPARES, donc tu les injectes) ; **Adapter** = uniformiser vector DBs et fournisseurs LLM (les ports/adapters de DocSense) ; **Factory** = construire le bon pipeline selon la config ; **Observer** = les événements de ton dashboard qualité. Nommer ces choix en entretien est un différenciateur immédiat.

## Mini-exercice
Fouille TON code des mois 1-2 et trouve : une Strategy (une fonction passée en paramètre qui change le comportement), un début d'Adapter (une fonction qui uniformise un format), une occasion de Factory (une création dupliquée). Nomme-les en commentaire. C'est l'exercice inverse du cours magistral — et le plus formateur.

## 🔥 Exercice plus difficile
Le mini-exercice te faisait **reconnaître** des patterns. Celui-ci te fait mesurer ce
qu'ils coûtent et ce qu'ils rapportent — parce qu'un pattern n'est jamais gratuit.

**A — la même fonctionnalité, trois écritures.** Prends un cas concret : calculer les frais
de port selon le mode de livraison (standard, express, point relais, retrait en magasin).
Écris-le trois fois :
1. une chaîne de `if / else if` ;
2. un objet de correspondance `{ standard: fn, express: fn, … }` ;
3. une Strategy « complète » — interface, une classe par mode, une Factory qui choisit.

Livrable : les trois versions et, pour chacune, le nombre de lignes et le nombre de
fichiers ou de blocs à ouvrir pour comprendre ce qui se passe pour `express`.

**B — l'épreuve du changement.** Applique à chacune des trois versions, chronomètre en
main, ces trois modifications :
- ajouter un mode « livraison le dimanche » ;
- changer la formule du mode express uniquement ;
- faire dépendre le tarif du poids **et** de la région pour tous les modes.

Livrable : un tableau 3 modifications × 3 versions, où chaque case dit **quels fichiers tu
as ouverts**. C'est cela qui départage, pas une opinion sur l'élégance.

**C — le coût, pas seulement le bénéfice.** Pour la troisième modification, réponds par
écrit : la version 3 t'a-t-elle aidé, ou t'a-t-elle obligé à modifier chaque classe ?

**D — la marche arrière.** Choisis un pattern présent dans ton propre code et **retire-le**.
Reviens à la version directe. Livrable : le code avant/après et la réponse à « le code
est-il pire ? ». Si la réponse est non, tu viens de trouver de la sur-ingénierie chez toi
— c'est le résultat le plus utile de la journée.

**Critère de réussite** : tu peux nommer, pour chacun des trois, la **condition précise**
qui rendrait ce choix le bon, sans employer le mot « propre ».

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Le principe ouvert/fermé dit « ouvert à l'extension, fermé à la modification ». Dans
   l'exercice B, laquelle des trois modifications le met vraiment à l'épreuve ?
2. `taches.sort((a, b) => a.priorite - b.priorite)` est présenté comme une Strategy
   complète. Qu'est-ce qui, dans cette ligne, joue le rôle de l'interface ?
3. Une Factory pour deux cas est de la sur-ingénierie. À partir de combien de cas
   change-t-on d'avis, et pourquoi ce nombre n'est-il pas une règle ?
4. Le Singleton est le pattern le plus enseigné et le plus critiqué. Quel problème
   introduit-il dans les tests, et pourquoi ce problème n'apparaît-il jamais en
   développement local ?

## ✅ Correction attendue
**La démarche** : tu ne cherches pas des classes, tu cherches des INTENTIONS déjà présentes. La Strategy est n'importe quelle fonction que tu as passée en paramètre pour faire varier un comportement — un comparateur de `sort`, un prédicat de `filter`. L'Adapter est n'importe quelle fonction qui prend une forme de données et en rend une autre, pour que la suite du code n'ait à connaître qu'un seul format. La Factory est le troisième endroit où tu as recopié les mêmes cinq lignes de construction en changeant un champ.

**L'erreur probable, et c'est la plus instructive de cette leçon.** Beaucoup ne trouvent rien et concluent « mon code est trop simple pour avoir des patterns ». C'est presque toujours faux, et la cause est une confusion sur ce qu'est un pattern : on cherche des `class`, des `interface`, des noms en majuscules — la FORME apprise dans les livres. Or un pattern est une intention, pas une syntaxe. `taches.sort((a, b) => a.priorite - b.priorite)` **est** une Strategy, complète et correcte, sans une seule classe.

Le piège vient de ce que les exemples canoniques sont écrits en Java, langage où l'on ne peut pas passer une fonction : les classes y sont un contournement, pas le pattern. En JavaScript, la moitié des patterns du livre sont devenus une ligne — c'est un progrès du langage, pas une absence de conception.

**Alternative défendable, et il faut savoir la choisir** : ne rien nommer du tout. Introduire une Factory là où deux constructions existent ajoute un niveau d'indirection pour supprimer une répétition qui ne coûte rien. La leçon le dit dès son modèle mental — douleur d'abord, nom ensuite. À l'exercice, la bonne réponse peut parfaitement être « j'ai trouvé une Strategy et un Adapter, et j'ai décidé de ne PAS extraire de Factory : deux occurrences ne font pas une duplication ».

**Vérifie seul, sans corrigé** :
1. Pour chaque pattern nommé, écris en une phrase le PROBLÈME qu'il résout dans TON code. Si tu n'y arrives pas, tu as posé une étiquette, pas reconnu un pattern.
2. Pour la Factory repérée : compte les occurrences réelles. Moins de trois ? Note-le et n'extrais rien.
3. Épreuve décisive : pour ta Strategy, ajoute un nouveau comportement. Si tu dois modifier le code qui l'utilise, ce n'en était pas une — la Strategy se juge à ce que l'appelant ne bouge pas.

### Correction de l'exercice difficile

**A — les trois écritures.** Les ordres de grandeur attendus, pour quatre modes :

| version | lignes | endroits à ouvrir pour comprendre `express` |
|---|---|---|
| chaîne de `if` | ~12 | **1** |
| objet de correspondance | ~14 | **1** |
| Strategy + Factory | ~45 | **3** (interface, classe, fabrique) |

Le troisième chiffre est le vrai coût, et il est presque toujours passé sous silence :
l'indirection se paie **à chaque lecture**, par tout le monde, pour toujours. Elle
n'est rentable que si elle épargne quelque chose d'au moins équivalent.

**B — l'épreuve du changement.** Le tableau attendu :

| modification | chaîne de `if` | objet | Strategy + Factory |
|---|---|---|---|
| ajouter « dimanche » | 1 fichier, +3 lignes | 1 fichier, +1 entrée | 1 fichier neuf, +1 ligne dans la fabrique |
| changer la formule d'`express` | 1 fichier, il faut trouver la branche | 1 fichier, la clé mène droit au code | 1 fichier, isolé |
| poids **et** région pour tous | 1 fichier, tout est sous les yeux | 1 fichier, toutes les entrées | **toutes** les classes, une par une |

**C — le coût.** La ligne qui compte est la troisième. Face à un changement qui traverse
tous les cas, la version « bien conçue » est la **plus coûteuse** : la Strategy isole les
variations les unes des autres, donc elle rend chère toute modification qui les concerne
toutes. Elle n'a pas échoué — elle a fait exactement ce pour quoi elle est faite. C'est le
choix qui était mal posé.

**La règle de décision qui reste** : un pattern optimise **un axe de changement**. La
Strategy suppose que ce qui varie, c'est le *jeu de comportements*. Si en réalité ce qui
varie c'est la *signature commune*, elle multiplie le travail. Avant de choisir un pattern,
la question n'est donc pas « est-ce plus propre ? » mais **« qu'est-ce qui va changer, et
dans quelle direction ? »** — et l'on se trompe souvent, ce qui est une raison de plus de
ne pas payer l'indirection trop tôt.

**D — la marche arrière.** L'exercice n'a pas de corrigé, mais il a un résultat typique :
sur du code personnel, retirer un pattern rend le code **plus court et aussi clair** dans
la majorité des cas. Si c'est ce que tu observes, tu n'as pas mal appris les patterns —
tu as appris ce que « douleur d'abord, nom ensuite » veut dire concrètement.

Savoir **retirer** une abstraction est plus rare et plus utile que savoir en ajouter une.
Les bases de code se dégradent surtout par accumulation d'abstractions que plus personne
n'ose enlever.

### Correction de la vérification de compréhension

1. **La première** — ajouter un mode. C'est le seul changement qui soit une *extension* :
   la Strategy le traite par un fichier neuf, sans toucher à l'existant. Les deux autres
   sont des *modifications* et le principe ne promet rien à leur sujet. La troisième le
   met même en défaut, comme le montre le tableau du B.
2. **La signature de la fonction** : `(a, b) => number`. C'est elle le contrat. `sort` ne
   connaît rien du comparateur sinon qu'il prend deux éléments et rend un nombre — ce
   qu'une interface déclare dans un langage typé, une signature le déclare ici. Le pattern
   est une **intention** ; `interface` en est une des formes possibles, pas la définition.
3. **Trois est un repère, pas une règle**, parce que ce qui décide n'est pas le nombre
   d'occurrences mais leur **destin commun** : vont-elles changer ensemble ? Trois copies
   qui évoluent indépendamment ne doivent pas être fusionnées — les unifier crée une
   abstraction que le prochain changement fera diverger, et l'on obtient alors le pire des
   deux mondes : une fonction commune truffée de paramètres booléens.
4. Il introduit un **état global partagé entre les tests** : le premier test qui modifie
   l'instance la laisse modifiée pour les suivants, et l'ordre d'exécution se met à
   compter. Cela n'apparaît pas en développement local parce qu'on lance un test à la fois,
   ou toujours dans le même ordre. Le défaut se révèle en intégration continue, quand les
   tests sont parallélisés ou mélangés — exactement la dépendance à l'ordre mesurée dans
   la leçon `ci-cd`.

## 🏢 Cas professionnel
Une équipe branche son produit sur un fournisseur de LLM et appelle son SDK directement depuis une quinzaine d'endroits. Six mois plus tard, il faut ajouter un second fournisseur — pour le coût, pour la disponibilité, ou parce qu'un client l'exige. Les quinze endroits connaissent la forme des messages du premier fournisseur, ses noms de paramètres, sa façon de signaler une erreur. Le chantier dure des semaines et introduit des bugs dans du code qui n'avait rien demandé.

L'équipe voisine avait défini son propre type de requête et de réponse, et une fonction de traduction par fournisseur — un Adapter. Ajouter le second a demandé un fichier et une ligne de configuration.

Ce qu'il faut en retenir n'est pas « mettez toujours un Adapter » : au premier jour, l'équipe voisine a écrit du code en plus sans bénéfice visible, et si le second fournisseur n'était jamais venu, elle aurait payé pour rien. **Le pattern est un pari sur un changement à venir.** La question utile n'est pas « quel pattern appliquer ? » mais « ce changement est-il assez probable pour que je paie maintenant ? ». Pour un fournisseur externe de LLM en 2026, la réponse est oui ; pour la couleur d'un bouton, non.

## 🎤 Questions d'entretien
- « Cite un pattern que tu as utilisé et pourquoi. » → Décris le problème d'abord, le nom ensuite. Un candidat qui récite Strategy sans nommer la douleur qu'elle soulage n'a pas convaincu.
- « Quand ne PAS utiliser un pattern ? » → Quand son problème n'existe pas encore. La sur-ingénierie est un anti-pattern, et c'est la faute typique de qui vient de les apprendre.
- « Que reproche-t-on au Singleton ? » → C'est un état global déguisé : couplage invisible, ordre d'initialisation fragile, tests difficiles à isoler.
- « Composition ou héritage ? » → Composition par défaut : elle assemble des comportements sans figer une hiérarchie qu'on regrette dès le troisième cas particulier.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je reconnais Strategy, Factory, Adapter et Observer dans du code qui ne les nomme pas.
- [ ] Je pars du problème, jamais du pattern.
- [ ] Je sais expliquer ce qu'un pattern COÛTE, pas seulement ce qu'il apporte.
- [ ] Je sais dire non à un pattern et justifier ce refus.

## 📚 Vocabulaire
**pattern / anti-pattern** · **Strategy** · **Factory** · **Adapter** · **Observer** · **Singleton** · **open/closed** · **inversion de dépendance** · **polymorphisme** · **composition vs héritage** · **god object**.

## 🧾 À retenir
Les patterns sont un vocabulaire de solutions éprouvées : Strategy injecte le comportement, Factory centralise la création, Adapter uniformise, Observer découple la notification, Singleton (avec prudence) unifie l'instance. Derrière eux, deux principes : étendre sans modifier, dépendre d'abstractions. Reconnais-les dans ton propre code, nomme-les, et méfie-toi du pattern sans problème.
