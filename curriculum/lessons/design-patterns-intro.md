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

## 🧭 Exemple guidé
```ts
interface Notifieur { envoyer(msg: string): void }           // le contrat
class Email implements Notifieur { envoyer(m) { /* ... */ } }
class SMS implements Notifieur { envoyer(m) { /* ... */ } }

const creerNotifieur = (type: 'email' | 'sms'): Notifieur =>  // Factory
  type === 'email' ? new Email() : new SMS();

function alerter(notifieurs: Notifieur[], msg: string) {      // polymorphisme
  for (const n of notifieurs) n.envoyer(msg);                 // Strategy en action
}
```
Ajouter Slack : une classe + une ligne de Factory. `alerter` ne bouge PAS — open/closed en pratique.

## ⚠️ Erreurs fréquentes
- Appliquer un pattern « parce qu'on l'a appris » : la sur-ingénierie EST un anti-pattern.
- L'héritage profond (A extends B extends C) là où la composition suffit.
- Singleton par réflexe : demande-toi d'abord si un module exporté ne suffit pas.
- Mémoriser les 23 patterns du Gang of Four : les 5 d'ici couvrent 90 % des besoins réels.

## 🔗 Liens avec le programme
Tes systèmes IA en sont truffés : **Strategy** = interchanger les modèles LLM ou les stratégies de chunking (mois 9 : tu les COMPARES, donc tu les injectes) ; **Adapter** = uniformiser vector DBs et fournisseurs LLM (les ports/adapters de DocSense) ; **Factory** = construire le bon pipeline selon la config ; **Observer** = les événements de ton dashboard qualité. Nommer ces choix en entretien est un différenciateur immédiat.

## Mini-exercice
Fouille TON code des mois 1-2 et trouve : une Strategy (une fonction passée en paramètre qui change le comportement), un début d'Adapter (une fonction qui uniformise un format), une occasion de Factory (une création dupliquée). Nomme-les en commentaire. C'est l'exercice inverse du cours magistral — et le plus formateur.

## 📚 Vocabulaire
**pattern / anti-pattern** · **Strategy** · **Factory** · **Adapter** · **Observer** · **Singleton** · **open/closed** · **inversion de dépendance** · **polymorphisme** · **composition vs héritage** · **god object**.

## 🧾 À retenir
Les patterns sont un vocabulaire de solutions éprouvées : Strategy injecte le comportement, Factory centralise la création, Adapter uniformise, Observer découple la notification, Singleton (avec prudence) unifie l'instance. Derrière eux, deux principes : étendre sans modifier, dépendre d'abstractions. Reconnais-les dans ton propre code, nomme-les, et méfie-toi du pattern sans problème.
