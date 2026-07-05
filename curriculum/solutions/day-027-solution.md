# Correction — Jour 27 : Mini-projet stats.js : le pipeline de données complet

[← Retour au jour 27](../days/day-027.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Pas de correction ligne à ligne (jour d'autonomie) — les questions d'auto-revue : (1) Chaque métrique est-elle une fonction (ventes) => resultat, sans affichage dedans ? (2) La 6 (mois record par vendeur) — la plus dure — compose-t-elle un double regroupement (vendeur PUIS mois) ou un reduce à clé composée ("Alice|2024-03") ? Les deux marchent : as-tu CHOISI ou subi ? (3) La 7 calcule-t-elle les paniers moyens par catégorie UNE fois (Map de moyennes) ou re-parcourt-elle tout PAR vente (O(n²) silencieux) ? Ton jour 15 doit tinter.

## ✅ Une solution simple
Le squelette attendu (la forme, pas le remplissage) :
```js
// ===== COQUILLE (impure, aux extrémités) =====
const ventes = JSON.parse(fs.readFileSync("data/ventes.json", "utf8"));
// ===== CŒUR (pur, testable, le corps du fichier) =====
const caTotal = (ventes) => ventes.reduce((t, v) => t + v.montant, 0);
const caParMois = (ventes) => { /* regrouper (slice(0,7)) → sommer → trier */ };
const topProduits = (ventes, n = 3) => { /* regrouper → sommer → entries → sort → slice */ };
const anomalies = (ventes) => {
  const moyennes = panierMoyenParCategorie(ventes);      // calculé UNE fois
  return ventes.filter((v) => v.montant > 3 * moyennes[v.categorie]);
};
// ===== COQUILLE (affichage, la dernière fonction) =====
console.log(genererRapport({ caTotal: caTotal(ventes), /* ... */ }));
```

## 🚀 Une solution améliorée
La métrique 6 en double regroupement lisible : d'abord caParVendeurParMois = reduce vers { Alice: { "2024-03": 1200, ... }, ... }, puis un map sur les entries qui prend le max de chaque sous-objet. Deux étapes NOMMÉES battent un reduce-monstre : si quelqu'un (toi dans 3 mois) lit « moisRecordParVendeur(ventes) » et comprend en 10 secondes, c'est gagné.

## ⚠️ Erreurs probables et points à vérifier
- L'évolution % : ((mois - precedent) / precedent) * 100 — précédent nul ou premier mois : garde. Et l'ARRONDI d'affichage (toFixed) dans la coquille, pas dans le calcul
- Les % par vendeur doivent sommer à ~100 (arrondis) : vérification d'intégrité gratuite — un rapport qui somme à 87% a un bug quelque part
- Si generateur.js produit des montants à 15 décimales (Math.random pur) : arrondis À LA GÉNÉRATION — des données propres en amont épargnent tous les avals (leçon ETL du mois 5, en avance)

## 🔍 Comment vérifier ta solution
- CA total = somme des CA par mois = somme des CA par vendeur (LA triple vérification d'intégrité — si ça diverge, un regroupement perd des ventes)
- Le test de mutation : JSON.stringify(ventes) avant/après le rapport, identique
- Le rapport relu à voix haute : chaque ligne se comprend sans regarder le code ?

## ❓ Réponses du mini-quiz
1. **« CA par mois » : quels gestes composés ?**
   → Regrouper par mois (reduce) puis sommer chaque groupe — ou reduce direct {mois: total}. Puis Object.entries + sort pour l'ordre chronologique.
2. **Pourquoi le générateur de données peut-il être impure sans remords ?**
   → C'est un OUTIL de la coquille, exécuté une fois pour produire un fichier : l'aléa est sa fonction même. La pureté est la discipline du cœur analytique.
3. **L'évolution en % entre mois : quel piège au premier mois ?**
   → Pas de mois précédent → division par rien : le premier mois n'a pas d'évolution (null/"—"), et divisions par zéro si un mois est à 0 — les cas limites des données réelles.
4. **Pourquoi une fonction d'affichage UNIQUE qui reçoit tout ?**
   → Le format se change en un endroit ; les métriques restent testables sans rien afficher ; et demain le « rapport » peut devenir un fichier HTML sans toucher au cœur — la frontière du jour 9/26, en grand.

## 🧩 Questions de réflexion
- Compare ton autonomie à celle du jour 13 (tes notes en font foi) : où est le progrès, où est le plateau ? Le projet 1 (dans 8 jours) est calibré sur cette trajectoire.
- Ta triple vérification d'intégrité (total = Σ mois = Σ vendeurs) : c'est un INVARIANT de données (jour 16, encore lui). Les pipelines du mois 5 et les évaluations RAG du mois 9 vivront de ces vérifications croisées — tu viens d'inventer le test de cohérence.
