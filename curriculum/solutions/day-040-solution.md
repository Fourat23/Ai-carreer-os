# Correction — Jour 40 : Clean code : nommage, fonctions courtes, commentaires utiles

[← Retour au jour 40](../days/day-040.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Refactorer à comportement CONSTANT en appliquant des leviers précis : nommage révélateur d'intention, fonctions courtes à une responsabilité, niveau d'abstraction cohérent, constantes nommées à la place des nombres magiques, et commentaires réduits au POURQUOI. Construire d'abord une checklist de code smells SEUL (preuve de compréhension), puis l'appliquer sur un fichier réel avec un diff avant/après commenté, chaque changement justifiable en une phrase.

## ✅ Une solution simple
Renommer les variables floues et découper la plus grosse fonction. Améliore déjà nettement la lecture.

## 🚀 Une solution améliorée
Écrire d'abord sa propre checklist de 10 code smells (avant toute ressource), puis refactorer un fichier du mois 1 en documentant le AVANT/APRÈS, en remplaçant les nombres magiques par des constantes, en extrayant les conditions en fonctions nommées, et en réservant les commentaires au pourquoi. Idéalement sous tests pour garantir le comportement inchangé, et justifier chaque choix en une phrase.

## ⚠️ Erreurs probables et points à vérifier
- Sur-commenter l'évident (`i++ // incrémente`) au lieu de documenter la seule décision non triviale.
- Refactorer sans tests : on casse le comportement en silence — d'où l'intérêt des tests (jour 47).
- Sur-découper en fonctions atomiques : la lecture se fragmente autant qu'avec une fonction trop longue.
- Forcer DRY sur deux bouts juste ressemblants : couplage plus coûteux que la duplication quand ils divergent.

## 🔍 Comment vérifier ta solution
- La checklist de 10 code smells est écrite AVANT consultation de ressources.
- Un fichier du mois 1 est refactoré avec un diff avant/après commenté.
- Le comportement est inchangé (idéalement prouvé par des tests ou une comparaison de sorties).
- Chaque renommage/découpage est justifiable en une phrase (intention, responsabilité).

## ❓ Réponses du mini-quiz
1. **Pourquoi optimise-t-on le code pour le lecteur plutôt que pour l'écrivain ?**
   → Parce que le code est LU bien plus souvent qu'écrit (chaque correction, ajout, débogage le relit). Le coût dominant d'un logiciel est la compréhension future, pas la frappe initiale.
2. **Que doit dire un commentaire utile, et que ne doit-il pas dire ?**
   → Il doit dire POURQUOI (une décision, une contrainte cachée, un piège). Il ne doit pas paraphraser QUOI fait le code : ce commentaire-là est du bruit qui se périme quand le code change.
3. **Comment un bon nom peut-il rendre un commentaire inutile ?**
   → Un nom qui révèle l'intention (`estLigneFacturable`) fait que le code se lit comme une phrase : plus besoin d'un commentaire pour expliquer ce que fait la ligne.
4. **Pourquoi appliquer DRY avec discernement ?**
   → Factoriser deux choses qui se RESSEMBLENT sans changer ensemble crée un couplage pire que la duplication : quand elles divergent, l'abstraction devient un nœud. On factorise ce qui évolue vraiment ensemble.

## 🎤 À savoir expliquer à l'oral
Ancre tout sur le principe : « le code est lu dix fois plus qu'écrit, donc j'optimise pour le lecteur futur, souvent moi ». Montre un avant/après où un bon nom a supprimé un commentaire, où une constante a remplacé un nombre magique. Puis nuance en praticien : « c'est du jugement, pas des règles — je ne sur-découpe pas, et je n'applique DRY que sur ce qui change ensemble ». Insister sur « refactorer sous tests pour ne rien casser » montre que tu penses sécurité, pas seulement esthétique.
