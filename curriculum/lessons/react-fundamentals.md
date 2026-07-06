<!-- keep -->
# Leçon — React : les fondamentaux

## 🎯 Objectif
Acquérir LE modèle mental de React (UI = f(state)), penser en composants, gérer l'état sans le muter, et comprendre le re-rendu. React est le standard du frontend — et l'interface de tes futures apps IA (DocQA, DocSense).

## 🧠 Modèle mental
**L'UI est une FONCTION de l'état** : tu ne modifies jamais l'écran directement (« trouve ce div et change son texte ») — tu décris à quoi l'UI DOIT ressembler pour chaque état possible, et React recalcule le rendu quand l'état change. Déclaratif (QUOI), pas impératif (COMMENT).

## 📖 Explication complète
- **Le composant** : une fonction qui reçoit des **props** (entrées, en lecture seule) et retourne du **JSX** (la description de l'UI). L'interface se DÉCOMPOSE en composants réutilisables — c'est la décomposition en fonctions (jour 9), appliquée à l'UI.
- **Le state** : la mémoire locale d'un composant : `const [count, setCount] = useState(0)`. On ne modifie JAMAIS `count` directement : on appelle `setCount(nouvelleValeur)` → React re-rend le composant. **L'immutabilité est obligatoire** : React détecte les changements par comparaison de RÉFÉRENCES — `liste.push(x)` garde la même référence, React ne voit rien ; `setListe([...liste, x])` crée du neuf, React re-rend. Ta discipline du jour 26 n'était pas un dogme : c'était l'entraînement.
- **Où vit l'état** : au plus proche ancêtre COMMUN des composants qui en ont besoin (« lifting state up »). Trop bas : inaccessible aux frères ; trop haut : re-rendus et props inutiles partout.
- **Listes et clés** : `items.map(i => <Row key={i.id} …/>)` — la `key` STABLE (jamais l'index si la liste bouge) permet à React d'identifier chaque élément entre deux rendus.
- **State minimal** : ne stocke jamais ce qui se CALCULE (le total se dérive du panier — jour 10, même principe). Le dérivé se recalcule au rendu.

## 🔧 Exemple simple
```tsx
function Compteur() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>Cliqué {n} fois</button>;
}
```
Cliquer → setN → nouvel état → React re-rend → le texte reflète n. Jamais de manipulation manuelle du DOM.

## 🧭 Exemple guidé
**Énoncé** : une liste de tâches avec ajout et cochage, sans mutation.
**Raisonnement** : le state est la source de vérité ; chaque modification retourne du NEUF.
**Solution** :
```tsx
const [taches, setTaches] = useState<Tache[]>([]);
const ajouter = (titre: string) =>
  setTaches([...taches, { id: crypto.randomUUID(), titre, faite: false }]);
const basculer = (id: string) =>
  setTaches(taches.map((t) => (t.id === id ? { ...t, faite: !t.faite } : t)));
```
**Explication** : `[...taches, x]` et `map + spread` créent de nouvelles références → React voit et re-rend. Ce sont EXACTEMENT tes patterns immuables du jour 26. **Variante** : `supprimer(id)` avec `filter`, et le compteur « restantes » DÉRIVÉ (`taches.filter(t => !t.faite).length`), pas stocké.

## 🤖 Exemple appliqué (IA / data / architecture)
L'interface de DocQA/DocSense est du React : la liste des sources citées, l'état de la question (envoi → streaming → réponse), le dashboard qualité. « UI = f(state) » est aussi un principe d'architecture général : une seule source de vérité, des vues dérivées — tu le retrouveras côté serveur.

## ⚠️ Erreurs fréquentes
- Muter le state (`state.push`) : l'écran ne bouge pas, mystère garanti.
- Stocker le dérivable (total, compteurs) → désynchronisation.
- `key={index}` sur une liste réordonnée → bugs d'affichage vicieux.
- État placé au mauvais niveau (drilling infernal ou état inaccessible).

## 🚫 Anti-patterns
- Manipuler le DOM à la main à côté de React.
- Un composant de 300 lignes qui fait tout (décomposer !).

## ✍️ Mini-exercice
Construis le compteur avancé : pas configurable, min/max, reset — state minimal (qu'est-ce qui est stocké vs dérivé ?).

## 🔥 Exercice plus difficile
Un mini-Kanban 3 colonnes (à faire / en cours / fait) avec déplacement de cartes — état immuable, et réponds par écrit : OÙ vit l'état et pourquoi ?

## ✅ Correction attendue
La logique : décomposer en composants → état minimal au bon niveau → modifications immuables → dérivés calculés au rendu. Vérifie : aucune mutation (relis chaque setter), les keys sont stables, et déplacer une carte ne perd aucune donnée.

## 🎤 Questions d'entretien
- « Pourquoi ne faut-il pas muter le state ? » → React compare les références ; une mutation est invisible → pas de re-rendu.
- « Props vs state ? » → Props = entrées en lecture seule venues du parent ; state = mémoire locale modifiable via son setter.
- « Où places-tu un état partagé ? » → Au plus proche ancêtre commun des consommateurs.

## 🧾 À retenir
- UI = f(state) : on décrit, React rend.
- Immutabilité OBLIGATOIRE ; state minimal, dérivés calculés.
- Penser en composants = décomposer, comme pour les fonctions.

## 📚 Vocabulaire
**composant** · **JSX** · **props** · **state / useState** · **re-rendu** · **key** · **lifting state up** · **état dérivé** · **rendu conditionnel**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je pense en composants et je place l'état au bon niveau.
- [ ] Zéro mutation dans mes setters (spread partout).
- [ ] Je distingue stocké vs dérivé sans hésiter.

## 🔗 Liens avec le programme
Mois 4 (jours ~92-115), projet 3 (BiblioApp), UI de DocSense. Leçons liées : `javascript-basics`, `react-hooks-effects`, `typescript-basics`.
