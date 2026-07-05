# Correction — Jour 2 : Terminal avancé et premier vrai script JavaScript

[← Retour au jour 2](../days/day-002.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Partie A = composer des petits outils. Partie B = premier programme défensif : on valide l'entrée AVANT de traiter. Ce réflexe (valider puis traiter) est celui que tu appliqueras aux API (mois 3) et aux sorties de LLM (mois 8).

## ✅ Une solution simple
```bash
head -3 data/inventaire.txt
wc -l data/inventaire.txt
grep "pommes" data/inventaire.txt
echo "kiwis,5" >> data/inventaire.txt
wc -l < data/inventaire.txt > data/rapport.txt
tail -2 data/inventaire.txt >> data/rapport.txt
```
```js
// scripts/salut.js
const prenoms = process.argv.slice(2);
if (prenoms.length === 0) {
  console.log("Usage : node salut.js <prenom>");
  process.exit(1);
}
for (const prenom of prenoms) {
  console.log(`Bonjour, ${prenom} !`);
}
```

## 🚀 Une solution améliorée
Bonus avec option :
```js
const args = process.argv.slice(2);
const crier = args.includes("--crier");
const prenoms = args.filter((a) => a !== "--crier");
if (prenoms.length === 0) { console.log("Usage : node salut.js [--crier] <prenom>"); process.exit(1); }
for (const p of prenoms) {
  const msg = `Bonjour, ${p} !`;
  console.log(crier ? msg.toUpperCase() : msg);
}
```
Remarque le pattern : séparer le *parsing* des arguments du *traitement*. Tous les CLI du monde sont construits ainsi.

## ⚠️ Erreurs probables et points à vérifier
- `wc -l fichier` affiche aussi le nom du fichier ; `wc -l < fichier` n'affiche que le nombre
- Oublier `slice(2)` et saluer "/usr/bin/node"
- Le bonus : si tu ne filtres pas `--crier`, tu salues l'option

## 🔍 Comment vérifier ta solution
- `node scripts/salut.js` seul → message d'usage ET `echo $?` affiche 1
- Trois prénoms → trois lignes
- rapport.txt : un nombre puis 2 lignes de données

## ❓ Réponses du mini-quiz
1. **Différence entre `>` et `>>` ?**
   → `>` écrase le fichier, `>>` ajoute à la fin sans effacer.
2. **Que fait `cat notes.txt | grep TODO | wc -l` ?**
   → Compte le nombre de lignes de notes.txt contenant 'TODO' (cat lit, grep filtre, wc -l compte).
3. **Que contient `process.argv[2]` ?**
   → Le premier argument passé au script (argv[0] = chemin de node, argv[1] = chemin du script).
4. **À quoi sert un code de sortie non nul (`process.exit(1)`) ?**
   → À signaler un échec au shell : indispensable pour les scripts enchaînés et la CI (un `&&` s'arrête si le code ≠ 0).

## 🧩 Questions de réflexion
- En quoi le pipe `|` ressemble-t-il à l'enchaînement de fonctions `f(g(x))` ?
- Pourquoi valider les entrées au DÉBUT du script plutôt qu'au milieu ?
