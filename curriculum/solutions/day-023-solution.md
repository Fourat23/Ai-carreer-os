# Correction — Jour 23 : map et filter : penser en transformations

[← Retour au jour 23](../days/day-023.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
rechercher est le morceau de choix : le pattern « filtre conditionnel » — chaque critère absent laisse passer tout le monde. Deux styles : un filter par critère (simple, plusieurs passes) ou un filter unique dont le prédicat combine les critères fournis. Le second est montré ci-dessous ; le premier est tout aussi valable aujourd'hui.

## ✅ Une solution simple
```js
function rechercher(catalogue, options = {}) {
  return catalogue.filter((p) => {
    if (options.texte !== undefined &&
        !p.nom.toLowerCase().includes(options.texte.toLowerCase())) return false;
    if (options.categorieVoulue !== undefined &&
        p.categorie !== options.categorieVoulue) return false;
    if (options.prixMax !== undefined && p.prix > options.prixMax) return false;
    return true;   // aucun critère ne l'a écarté
  });
}
// Le -30% immuable : nouveau tableau, nouveaux objets (spread !)
const soldes = catalogue.map((p) =>
  p.categorie === "hiver" ? { ...p, prix: +(p.prix * 0.7).toFixed(2) } : p
);
```

## 🚀 Une solution améliorée
Le piège PROFOND du point 3 : map crée un nouveau TABLEAU, mais les OBJETS dedans restent partagés (référence, jour 8). Sans le { ...p }, modifier soldes[0].prix modifierait AUSSI catalogue[0].prix. La copie superficielle ne protège qu'un niveau. Vérifie-le expérimentalement : c'est un des bugs les plus vicieux de React (mois 4), autant le rencontrer aujourd'hui dans un contexte calme.

## ⚠️ Erreurs probables et points à vérifier
- L'astuce d'unicité indexOf(x) === index est en O(n²) — parfaite ici, à remplacer par Set (jour 30) au-delà de quelques milliers d'éléments : tu as maintenant le vocabulaire pour dire POURQUOI
- +(x).toFixed(2) : toFixed retourne une string (jour 4 !), le + la reconvertit — ou mieux : Math.round(x * 100) / 100
- options = {} par défaut : sans elle, rechercher(catalogue) crashe sur options.texte — la valeur par défaut du jour 9 en action

## 🔍 Comment vérifier ta solution
- rechercher({}) retourne tout ; rechercher({prixMax: 0}) retourne les gratuits (PAS tout — le test du falsy)
- catalogue[i].prix inchangé après soldes (vérifié sur un produit hiver)
- Chaque version map/filter donne LE MÊME résultat que sa version boucle (oracle, encore)

## ❓ Réponses du mini-quiz
1. **map sur 10 éléments retourne combien d'éléments, toujours ?**
   → Exactement 10 : map est 1-pour-1 par contrat. Si tu veux en écarter, c'est filter (avant ou après).
2. **Pourquoi filter(e => e.salaire) est-il un prédicat malhonnête ?**
   → Il repose sur la truthiness : un salaire de 0 serait écarté par accident. Un prédicat honnête compare : e => e.salaire > 0.
3. **catalogue.filter(...).map(...) : combien de parcours du tableau ?**
   → Deux (un par étage). Acceptable presque toujours ; sur des millions d'éléments en boucle chaude, une boucle unique fusionne les deux passes.
4. **Cite deux situations où la boucle bat map/filter.**
   → Arrêt anticipé (break impossible en map/filter) et accumulation complexe multi-variables ; aussi : effets de bord assumés (forEach ou boucle, pas map).

## 🧩 Questions de réflexion
- « Les employés tech, leurs noms » : le chaînage se LIT. Trouve dans ton annuaire (jour 13) deux endroits qui gagneraient à ce style, et un qui n'y gagnerait pas.
- SQL dira SELECT nom FROM employes WHERE service = 'tech'. Même structure ? Presque : quel étage SQL correspond à map, lequel à filter ? (Tu vérifieras ton intuition au jour 78.)
