# Correction — Jour 26 : Fonctions pures et immutabilité : écrire du code prévisible

[← Retour au jour 26](../days/day-026.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La purification : chaque fonction suit le même moule — valider (guards, jour 5), construire le nouvel état (spreads aux bons niveaux), le retourner. subirDegats devient : (perso, n) => ({ ...perso, pv: Math.max(0, perso.pv - n) }). Le « KO » (affichage) SORT de la fonction : le cœur calcule l'état, la coquille (rejouer) constate pv === 0 et raconte. Cette séparation est LE geste du jour.

## ✅ Une solution simple
```js
const subirDegats = (perso, n) => ({ ...perso, pv: Math.max(0, perso.pv - n) });
const soigner = (perso, n) => ({ ...perso, pv: Math.min(perso.pvMax, perso.pv + n) });
const ramasser = (perso, objet) =>
  poidsTotal(perso) + objet.poids > 50
    ? perso                                          // refus : l'état INCHANGÉ est retourné
    : { ...perso, inventaire: [...perso.inventaire, objet] };

// L'historique — la récompense :
let etats = [persoInitial];
const agir = (fn, ...args) => { etats.push(fn(etats.at(-1), ...args)); };
agir(subirDegats, 20);
agir(soigner, 10);
const annuler = () => { if (etats.length > 1) etats.pop(); };
const rejouer = () => etats.forEach((e, i) => console.log(`État ${i} : ${e.pv} pv`));
```

## 🚀 Une solution améliorée
Le retour de « perso inchangé » en cas de refus (ramasser, sac plein) mérite débat : l'appelant ne SAIT PAS que ça a échoué (l'état est identique, silencieusement). Alternatives : retourner { etat, succes } (plus riche, plus verbeux), ou lancer une exception (brutal). Il n'y a pas de réponse unique — mais REMARQUER le problème et choisir consciemment, c'est exactement la maturité de conception qu'on évalue. Note ton choix et son pourquoi.

## ⚠️ Erreurs probables et points à vérifier
- etats.at(-1) : le dernier état — si .at() est nouveau pour toi : etats[etats.length - 1], identique
- agir mute etats (push) : OUI — etats est la coquille, le journal de bord ; les ÉTATS eux sont immuables ; mutation de la structure d'accueil vs mutation des données : la nuance du jour 24 (acc privé) encore à l'œuvre
- Purifier equiper : l'arme référence un objet de l'inventaire (jour 10)… du NOUVEL inventaire ou de l'ancien ? Piège profond : référencer par NOM (string) plutôt que par objet évite la question — parfois le modèle de données doit changer pour servir l'immutabilité

## 🔍 Comment vérifier ta solution
- Après 10 actions : etats.length === 11, et etats[0] est INTACT (le test ultime : perso0.pv d'origine)
- annuler() × 3 puis rejouer() : l'histoire raccourcit correctement
- Chaque fonction de la gamme : appel, puis JSON.stringify(original) identique à avant

## ❓ Réponses du mini-quiz
1. **Les 2 critères d'une fonction pure ?**
   → Déterminisme (même entrée → même sortie) et zéro effet de bord (ne modifie ni ne lit rien d'extérieur changeant : fichiers, console, horloge, aléa, arguments mutés).
2. **console.log rend-il une fonction impure ? Et est-ce grave ?**
   → Oui, techniquement (effet de bord). Gravité contextuelle : un log de debug temporaire, non ; un affichage qui EST le travail de la fonction, oui — sépare calcul et affichage.
3. **Pourquoi { ...perso, stats: { ...perso.stats, pv: 50 } } et pas { ...perso, stats.pv: 50 } ?**
   → Le spread est superficiel : sans le second spread, le nouvel objet PARTAGERAIT l'ancien stats — le muter muterait les deux. Un spread par niveau modifié.
4. **Qu'est-ce que l'historique d'états rend possible ?**
   → Undo/redo, rejeu, debugging par comparaison d'états, time-travel — gratuits si chaque état est un objet neuf ; impossibles si tout mute le même objet.

## 🧩 Questions de réflexion
- undo/redo est tombé gratuitement : liste 3 applications que tu utilises où cette capacité existe (éditeur, Git lui-même — chaque commit est un état immuable ! — Photoshop) : l'immutabilité est partout où l'historique compte.
- Le coût : chaque action copie l'objet. À quelle échelle (combien d'états, quelle taille d'objet) faudrait-il s'en soucier, et que ferait-on (structures persistantes, deltas) ? Question ouverte — y penser suffit aujourd'hui.
