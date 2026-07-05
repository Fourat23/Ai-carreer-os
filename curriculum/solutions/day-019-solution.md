# Correction — Jour 19 : La méthode de résolution de problèmes : ton algorithme pour créer des algorithmes

[← Retour au jour 19](../days/day-019.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
P2 (le plus riche pédagogiquement) : le pseudo-code attendu ≈ « rendu = payé - dû ; si négatif → erreur ; pour chaque coupure de la plus grosse à la plus petite : quantité = rendu divisé entièrement par la coupure ; si > 0, l'enregistrer ; rendu = le reste ; à la fin, rendu vaut 0 ». Deux idées clés : parcourir les coupures TRIÉES décroissantes, et la paire division entière / modulo.

## ✅ Une solution simple
```js
function rendreMonnaie(montantDu, montantPaye) {
  if (montantPaye < montantDu) return { erreur: "Paiement insuffisant" };
  let reste = montantPaye - montantDu;
  const COUPURES = [50, 20, 10, 5, 2, 1];
  const rendu = {};
  for (const coupure of COUPURES) {
    const quantite = Math.floor(reste / coupure);
    if (quantite > 0) { rendu[coupure] = quantite; reste = reste % coupure; }
  }
  return rendu;   // {} si rendu nul : un objet vide EST la bonne réponse
}
```
P3 fenêtre glissante :
```js
function meilleurePeriode(temp, k) {
  if (k <= 0 || k > temp.length) return -1;
  let somme = 0;
  for (let i = 0; i < k; i++) somme += temp[i];   // première fenêtre
  let meilleureSomme = somme, meilleurIndex = 0;
  for (let i = k; i < temp.length; i++) {
    somme += temp[i] - temp[i - k];               // glisse : +entrant -sortant
    if (somme > meilleureSomme) { meilleureSomme = somme; meilleurIndex = i - k + 1; }
  }
  return meilleurIndex;
}
```

## 🚀 Une solution améliorée
César élégant : construis l'alphabet une fois ("abcdefghijklmnopqrstuvwxyz"), et pour chaque caractère : index dans l'alphabet ; si -1 (espace, ponctuation) → inchangé ; sinon alphabet[(index + decalage) % 26]. Les majuscules : détecte, traite en minuscule, re-capitalise. Le modulo gère le bouclage ET les décalages négatifs si tu ajoutes 26 : ((i + d) % 26 + 26) % 26 — le « modulo positif », astuce à connaître.

## ⚠️ Erreurs probables et points à vérifier
- P2 : renvoyer { erreur } d'un côté et { 20: 2 } de l'autre = deux FORMES de retour différentes — le défaut signalé au jour 9 ; une meilleure API lancerait une exception ou renverrait null : note cette critique de la solution elle-même
- P3 : meilleurIndex = i - k + 1, pas i — dessine la fenêtre pour t'en convaincre
- dechiffrer(texte, d) === chiffrer(texte, -d) SI ton modulo gère les négatifs — le test parfait de ton César

## 🔍 Comment vérifier ta solution
- César : chiffrer puis déchiffrer redonne le texte EXACT (ponctuation comprise) sur 3 phrases
- P2 : rendreMonnaie(37, 100) → {50:1, 10:1, 2:1, 1:1} — vérifie à la main
- P3 : la O(n) et la naïve d'accord sur 20 tableaux aléatoires (oracle)

## ❓ Réponses du mini-quiz
1. **Pourquoi fabriquer les exemples AVANT de coder ?**
   → Les calculer à la main force ton cerveau à découvrir l'algorithme, et ils deviennent tes tests de l'étape 6. Coder d'abord, c'est naviguer sans carte.
2. **Quel est le signe qu'il faut retourner du code au pseudo-code ?**
   → Une ligne de pseudo-code qui explose en 15 lignes de code : la décomposition était trop grossière.
3. **L'approche gourmande du rendu de monnaie est-elle toujours optimale ?**
   → Avec [50,20,10,5,2,1] oui, mais PAS avec n'importe quel système (ex: pièces [1,3,4] pour rendre 6 : gourmand donne 4+1+1, optimal 3+3). À savoir : gourmand = simple mais à valider.
4. **Que gagne la fenêtre glissante par rapport au recalcul naïf ?**
   → O(n) au lieu de O(n×k) : chaque pas met à jour la somme en 2 opérations (retirer l'entrant, ajouter le sortant) au lieu de resommer k éléments.

## 🧩 Questions de réflexion
- Sur quel problème as-tu été tenté de sauter des étapes ? Que s'est-il passé ? (Si tout s'est bien passé en sautant : tu ne le sauras qu'au premier problème VRAIMENT dur — la méthode est une assurance.)
- La fenêtre glissante transforme un recalcul en mise à jour incrémentale : trouve un autre endroit du programme où cette idée s'appliquera (indice : les stats de ton dashboard au mois 5, les agrégats SQL).
