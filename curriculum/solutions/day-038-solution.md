# Correction — Jour 38 : POO en TypeScript : encapsulation, héritage, polymorphisme

[← Retour au jour 38](../days/day-038.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Concevoir autour d'un CONTRAT (interface) : définir Notifieur.envoyer, faire implémenter chaque canal, et écrire alerter qui ne dépend que du contrat. Encapsuler l'état de chaque classe (private/readonly). Prouver l'open/closed en ajoutant un canal sans modifier alerter. Puis comparer honnêtement avec une version fonctionnelle pour montrer qu'on sait quand la classe se justifie (état + méthodes liées) et quand une fonction suffit.

## ✅ Une solution simple
Interface Notifieur, classes Email/SMS/Push, fonction alerter polymorphe. Fonctionne et illustre le polymorphisme de base.

## 🚀 Une solution améliorée
Ajouter un 4e canal SANS modifier aucun code existant (preuve de l'open/closed), écrire la version fonctionnelle équivalente et rédiger la comparaison (quand classe, quand fonction), et utiliser private/readonly pour montrer l'encapsulation. Discuter composition > héritage sur un exemple.

## ⚠️ Erreurs probables et points à vérifier
- Recourir à un héritage profond fragile là où la composition (ou une interface) suffirait.
- Tout mettre en classe par réflexe : une fonction pure convient souvent mieux qu'une classe sans état.
- Écrire `alerter` avec des `if canal === …` au lieu du polymorphisme : chaque ajout force une modification et une régression possible.
- Exposer l'état interne (pas de private) : d'autres finissent par en dépendre, ce qui casse l'encapsulation.

## 🔍 Comment vérifier ta solution
- Les deux versions (POO et fonctionnelle) fonctionnent et sont comparées par écrit.
- Ajouter un 4e notifieur ne modifie AUCUN code existant (prouvé).
- L'état des classes est encapsulé (private/readonly), pas exposé publiquement.
- On sait énoncer quand une classe se justifie face à une fonction + closure.

## ❓ Réponses du mini-quiz
1. **Quel est le but pratique commun des quatre piliers de la POO ?**
   → Programmer contre une INTERFACE (un contrat) plutôt que contre une implémentation, pour réduire le couplage et pouvoir faire évoluer les détails sans casser le reste.
2. **Pourquoi `alerter` illustre-t-elle le principe ouvert/fermé ?**
   → Elle ne dépend que du contrat `Notifieur.envoyer`. Ajouter un canal (Slack) = une nouvelle classe, sans MODIFIER `alerter` : ouverte à l'extension, fermée à la modification.
3. **Pourquoi préférer la composition à l'héritage profond ?**
   → Un héritage profond (A extends B extends C) crée un couplage fort et fragile : changer B casse A. Composer (assembler des comportements) est plus souple et localise les changements.
4. **Quand une classe se justifie-t-elle face à une fonction + closure ?**
   → Quand l'objet porte un ÉTAT encapsulé opéré par plusieurs méthodes liées. Pour une simple transformation sans état, une fonction pure suffit — tout mettre en classe est un anti-pattern.

## 🎤 À savoir expliquer à l'oral
Va droit au cœur : « la POO sert à programmer contre un contrat, pas contre une implémentation ; le polymorphisme est le pilier central ». Démontre avec Notifieur/alerter et l'ajout indolore de Slack (open/closed). Puis nuance en praticien mûr : « je ne mets pas tout en classe ; une fonction suffit sans état, et je préfère la composition à l'héritage profond ». Faire le lien avec l'interface Store à venir (jour 44) montre que tu vois la continuité de la conception.
