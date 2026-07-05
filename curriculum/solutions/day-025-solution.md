# Correction — Jour 25 : La récursion : les fonctions qui s'appellent elles-mêmes

[← Retour au jour 25](../days/day-025.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
chercherFichier — la logique de remontée : cas de base 1 : c'est un fichier du bon nom → retourne son nom (début du chemin). Cas de base 2 : fichier du mauvais nom → null. Cas récursif : pour chaque enfant, chercher ; si un enfant retourne un chemin NON null → retourne dossier.nom + "/" + cheminEnfant (on PRÉFIXE en remontant la pile — le chemin se construit à l'envers, du fichier vers la racine).

## ✅ Une solution simple
```js
function tailleTotale(noeud) {
  if (noeud.type === "fichier") return noeud.taille;        // cas de base
  let total = 0;
  for (const enfant of noeud.enfants) total += tailleTotale(enfant); // confiance
  return total;
}
function chercherFichier(noeud, nom) {
  if (noeud.type === "fichier") {
    return noeud.nom === nom ? noeud.nom : null;            // 2 cas de base
  }
  for (const enfant of noeud.enfants) {
    const chemin = chercherFichier(enfant, nom);
    if (chemin !== null) return noeud.nom + "/" + chemin;   // préfixe en remontant
  }
  return null;                                              // pas dans ce sous-arbre
}
```

## 🚀 Une solution améliorée
Puissance rapide (exponentiation par carré) — le log en action :
```js
function puissanceRapide(base, exp) {
  if (exp === 0) return 1;
  if (exp % 2 === 0) return puissanceRapide(base * base, exp / 2);
  return base * puissanceRapide(base, exp - 1);
}
```
puissance(2, 16) naïve : 16 appels. Rapide : 5 (16→8→4→2→1→0). Même idée que la recherche binaire : DIVISER l'exposant plutôt que le décrémenter. Quand tu vois « divise par 2 à chaque étape », ton réflexe doit désormais être : O(log n).

## ⚠️ Erreurs probables et points à vérifier
- tailleTotale avec reduce au lieu de la boucle : noeud.enfants.reduce((t, e) => t + tailleTotale(e), 0) — parfaitement valide, montre que récursion et reduce se marient (hier + aujourd'hui)
- fib mémorisé : ton memoriser du jour 22 cache par argument — MAIS la récursion INTERNE de fib appelle le fib nu, pas le mémorisé ! Il faut que fib s'appelle via la référence mémorisée (déclare const fib = memoriser((n) => n <= 1 ? n : fib(n-1) + fib(n-2))) — subtilité de haut niveau, si tu l'as vue seul : chapeau
- genererCombinaisons : la taille du résultat (2^n) te dit d'avance que l'algo est exponentiel — parfois c'est le PROBLÈME qui l'est, pas ta solution

## 🔍 Comment vérifier ta solution
- tailleTotale vérifiée à la main sur ta structure 4 niveaux
- chercherFichier : présent en profondeur → chemin complet correct ; absent → null ; présent à la racine → cas limite testé
- fib(35) : > 1s naïf, < 1ms mémorisé (chiffres réels notés)

## ❓ Réponses du mini-quiz
1. **Les deux règles d'une récursion valide ?**
   → Un cas de base sans appel récursif, et chaque appel travaille sur un problème strictement plus proche de ce cas de base.
2. **Que contient la pile d'appels pendant factorielle(4), au plus profond ?**
   → 4 contextes empilés : f(4), f(3), f(2), f(1) — chacun avec SA valeur de n, attendant le résultat du suivant.
3. **Pourquoi fibonacci naïf est-il exponentiel ?**
   → fib(n) appelle fib(n-1) ET fib(n-2), qui recalculent chacun les mêmes sous-problèmes : l'arbre d'appels double à chaque niveau (~2^n appels pour n).
4. **Pourquoi la récursion est-elle naturelle sur un dossier de fichiers ?**
   → La structure est elle-même récursive (un dossier contient des dossiers) : le code épouse la donnée — cas de base = fichier, cas récursif = dossier.

## 🧩 Questions de réflexion
- La « confiance récursive » t'a-t-elle résisté ? C'est normal : elle contredit l'instinct de tout dérouler. Note où tu en es honnêtement — le jour 29 la re-musclera.
- L'arborescence de fichiers, le JSON imbriqué, le DOM du navigateur, l'arbre de composants React (mois 4), les arbres de décision ML (mois 6) : UNE structure, la récursion partout. Qu'est-ce que ça te dit de l'investissement d'aujourd'hui ?
