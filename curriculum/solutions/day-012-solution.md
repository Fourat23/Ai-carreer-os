# Correction — Jour 12 : Lire et écrire des fichiers : tes programmes deviennent persistants

[← Retour au jour 12](../days/day-012.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Architecture en 3 couches dans UN fichier : (1) persistance — charger()/sauvegarder() qui isolent TOUT le fs, (2) logique — ajouter/chercher/stats qui travaillent sur des tableaux en mémoire (testables sans fichiers !), (3) interface — le parsing d'argv qui route vers les fonctions. C'est le 3-tiers du mois 3 en miniature. Si demain on remplace le JSON par SQLite, SEULE la couche 1 change.

## ✅ Une solution simple
```js
const fs = require("node:fs");
const CHEMIN = "data/journal.json";

function charger() {
  try {
    return JSON.parse(fs.readFileSync(CHEMIN, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];          // premier lancement : normal
    console.error(`Fichier ${CHEMIN} illisible : ${err.message}`);
    process.exit(1);                                // corrompu : on n'écrase RIEN
  }
}
function sauvegarder(entrees) {
  fs.writeFileSync(CHEMIN, JSON.stringify(entrees, null, 2));
}
function prochainId(entrees) {
  let max = 0;
  for (const e of entrees) if (e.id > max) max = e.id;
  return max + 1;
}
// interface
const [commande, ...args] = process.argv.slice(2);
const entrees = charger();
if (commande === "ajouter") {
  const [texte, humeur = "moyenne"] = args;
  if (!texte) { console.error('Usage : ajouter "texte" [humeur]'); process.exit(1); }
  entrees.push({ id: prochainId(entrees), date: new Date().toISOString(), texte, humeur });
  sauvegarder(entrees);
  console.log("Entrée ajoutée.");
} // ... lister, chercher, stats sur le même modèle
```

## 🚀 Une solution améliorée
Pour les stats, réutilise le regroupement du jour 11 (par humeur). Pour lister 'plus récentes d'abord' : les dates ISO ont la propriété magique de se trier ALPHABÉTIQUEMENT dans l'ordre chronologique — c'est exactement pourquoi ce format existe. sort((a, b) => b.date.localeCompare(a.date)) suffit.

## ⚠️ Erreurs probables et points à vérifier
- writeFileSync sur data/ inexistant → ENOENT à l'écriture ! fs.mkdirSync("data", { recursive: true }) au démarrage
- chercher insensible à la casse : toLowerCase() des DEUX côtés
- La destructuration const [commande, ...args] : commande undefined si aucun argument — ton usage doit le gérer

## 🔍 Comment vérifier ta solution
- rm data/journal.json puis ajouter → fonctionne (recrée tout)
- echo "banane" > data/journal.json puis lister → message clair, banane intact
- Supprime une entrée du milieu à la main, ajoute : pas de doublon d'id

## ❓ Réponses du mini-quiz
1. **Pourquoi passer "utf8" à readFileSync ?**
   → Sans encodage, Node renvoie un Buffer (octets bruts) ; avec utf8, une string exploitable directement.
2. **ENOENT au premier lancement du compteur : erreur ou cas normal ?**
   → Cas normal et ATTENDU : on initialise à zéro. Le try/catch sert à distinguer ce cas des vraies erreurs.
3. **Pourquoi ne PAS écraser un fichier JSON corrompu ?**
   → C'est peut-être des données précieuses mal sauvées ; les écraser détruit toute chance de récupération. On s'arrête et on informe.
4. **Que fait JSON.stringify(obj, null, 2) ?**
   → Sérialise avec indentation de 2 espaces : lisible par un humain et diffable proprement dans Git.

## 🧩 Questions de réflexion
- charger/sauvegarder isolent la persistance : qu'est-ce que ça permet de tester SANS toucher au disque ?
- Ton journal.json est lisible et éditable à la main : avantage ou danger ? Dans quel contexte chacun ?
