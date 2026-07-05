# Correction — Jour 13 : Mini-projet : l'annuaire — assembler tout ce que tu sais

[← Retour au jour 13](../days/day-013.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Rien de nouveau techniquement : journal d'hier + requêtes du jour 11 + validation du jour 5. La solution complète est volontairement ABSENTE de correction ligne à ligne : compare plutôt ta STRUCTURE aux questions suivantes. As-tu : (1) une seule fonction charger/sauvegarder ? (2) une fonction trouverParId(contacts, id) réutilisée par taguer/modifier/supprimer (3 commandes, même besoin) ? (3) une fonction validerEmail unique appelée aux 2 portes ? (4) un routing propre des commandes ?

## ✅ Une solution simple
Les deux briques que beaucoup ratent :
```js
function trouverParId(contacts, idBrut) {
  const id = Number(idBrut);
  if (Number.isNaN(id)) { console.error("L'id doit être un nombre."); process.exit(1); }
  const contact = contacts.find((c) => c.id === id);
  if (!contact) { console.error(`Aucun contact avec l'id ${id}.`); process.exit(1); }
  return contact;   // 3 commandes réutilisent ces 6 lignes : c'est ça, factoriser
}
function validerEmail(email) {
  const arobase = email.indexOf("@");
  return arobase > 0 && email.indexOf(".", arobase) > arobase + 1;
}
```

## 🚀 Une solution améliorée
modifier avec champ dynamique : contact[champ] = valeur (accès crochets du jour 10 !) après avoir vérifié champ dans une liste blanche : const CHAMPS = ["nom", "email", "telephone"]; if (!CHAMPS.includes(champ)) ... — la LISTE BLANCHE (autoriser le connu) plutôt que la liste noire (interdire le connu-mauvais) est un principe de sécurité général que tu reverras au mois 9.

## ⚠️ Erreurs probables et points à vérifier
- argv et les espaces : "Jean Dupont" doit être entre guillemets au shell — documente-le dans ton usage
- Number("") vaut 0 : un id vide devient l'id 0 — le NaN check ne suffit pas, vérifie aussi que l'argument existe
- supprimer : filter crée un NOUVEAU tableau — sauvegarde bien le résultat du filter, pas l'ancien tableau

## 🔍 Comment vérifier ta solution
- Les 10 scénarios méchants passés UN PAR UN avec sortie notée
- git log --oneline : l'histoire se lit
- Un contact ajouté, modifié, tagué, retrouvé, supprimé : cycle de vie complet vérifié

## ❓ Réponses du mini-quiz
1. **Pourquoi commencer par le squelette plutôt que par la première fonctionnalité ?**
   → Un squelette qui tourne donne une boucle de feedback immédiate : chaque ajout est testable en 5 secondes. Sans lui, on code à l'aveugle.
2. **Pourquoi valider l'email à l'ajout ET à la modification ?**
   → Toute PORTE D'ENTRÉE d'une donnée doit valider — sinon la validation se contourne par la porte oubliée. (Même principe pour les API au mois 3.)
3. **Un commit par tâche : qu'est-ce que ça permet en cas de bug découvert le soir ?**
   → Identifier dans quel commit le bug est né (git log, git diff), et revenir en arrière chirurgicalement au lieu de tout jeter.
4. **Ta validation d'email (@ + point) laisse passer 'a@b.c' : est-ce grave ?**
   → Non : la validation parfaite d'email est un problème notoire ; une heuristique simple + honnêteté sur ses limites vaut mieux qu'une regex de 200 caractères copiée sans comprendre.

## 🧩 Questions de réflexion
- Compare ton découpage papier du matin à la réalité : où t'es-tu trompé d'estimation ? (Garde cette trace : tu referas cet exercice avant chaque projet, et ton écart se réduira.)
- Quelles fonctions de ce projet copierais-tu telles quelles dans TaskFlow (projet 1) ? C'est le début de TA bibliothèque personnelle de patterns.
