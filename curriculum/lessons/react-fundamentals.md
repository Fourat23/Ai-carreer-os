<!-- keep -->
# Leçon — React : les fondamentaux

## 🌍 Le problème d'abord
Tu as vu (leçon précédente) que rendre une page vivante « à la main » revient à mettre à
jour le DOM à chaque changement — et que, dès que l'interface grandit, tu oublies fatalement
un endroit et l'écran affiche une valeur périmée. **React** répond exactement à ce problème :
au lieu de décrire COMMENT modifier l'écran étape par étape, tu décris À QUOI l'écran doit
ressembler pour un état donné ; quand l'état change, React se charge de mettre le DOM à jour
correctement, partout. Tu passes d'un travail de plombier (« trouve ce div, change son
texte ») à un travail de dessinateur (« pour cet état, voici l'interface »). Cette leçon
installe ce basculement mental — le plus important de tout le frontend.

## 🎯 Objectif
Acquérir LE modèle mental de React (UI = f(state)), penser en composants, gérer l'état sans le muter, et comprendre le re-rendu. React est le standard du frontend — et l'interface de tes futures apps IA (DocQA, DocSense).

## 🧠 Modèle mental
**L'UI est une FONCTION de l'état** : tu ne modifies jamais l'écran directement (« trouve ce div et change son texte ») — tu décris à quoi l'UI DOIT ressembler pour chaque état possible, et React recalcule le rendu quand l'état change. Déclaratif (QUOI), pas impératif (COMMENT).

## 🧩 Prérequis
Tu dois comprendre le DOM, les événements et le cycle événement → état → DOM
(`/doc/lessons/browser-dom-rendering`), car React automatise précisément ce cycle. Tu dois
aussi être à l'aise en JavaScript — fonctions, callbacks, tableaux (`map`/`filter`) et,
surtout, la différence valeur/référence et l'immutabilité (`/doc/lessons/javascript-basics`),
car React s'appuie dessus pour détecter les changements. Aucune connaissance préalable de
React n'est supposée.

## 📖 Explication complète
- **Le composant** : une fonction qui reçoit des **props** (entrées, en lecture seule) et retourne du **JSX** (la description de l'UI). L'interface se DÉCOMPOSE en composants réutilisables — c'est la décomposition en fonctions (jour 9), appliquée à l'UI.
- **Le state** : la mémoire locale d'un composant : `const [count, setCount] = useState(0)`. On ne modifie JAMAIS `count` directement : on appelle `setCount(nouvelleValeur)` → React re-rend le composant. **L'immutabilité est obligatoire** : React détecte les changements par comparaison de RÉFÉRENCES — `liste.push(x)` garde la même référence, React ne voit rien ; `setListe([...liste, x])` crée du neuf, React re-rend. Ta discipline du jour 26 n'était pas un dogme : c'était l'entraînement.
- **L'état est un INSTANTANÉ, pas une variable mutable** : `setCount(...)` ne change PAS la valeur de `count` dans le rendu courant — `count` reste figé pour tout ce rendu, et React **re-rend** ensuite avec la nouvelle valeur. Conséquence piégeuse : `setCount(count + 1); setCount(count + 1);` n'ajoute que **1** (les deux lisent le MÊME `count`). Quand une mise à jour dépend de la précédente, utilise la **forme fonction** (updater) : `setCount(c => c + 1)` — React applique les mises à jour successives dans l'ordre. « Le setter n'écrit pas la variable, il programme le prochain rendu. »
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

Une liste de tâches. Trois lignes, une case à cocher et un bouton de suppression par ligne.
Le code paraît irréprochable — rien n'est muté, `filter` renvoie bien un nouveau tableau :

```tsx
function Liste() {
  const [taches, setTaches] = useState([
    { id: 'a', titre: 'Acheter du pain' },
    { id: 'b', titre: 'Appeler le médecin' },
    { id: 'c', titre: 'Payer le loyer' },
  ]);
  const supprimer = (id) => setTaches(taches.filter((t) => t.id !== id));

  return (
    <ul>
      {taches.map((t, i) => (
        <Ligne key={i} titre={t.titre} onSupprimer={() => supprimer(t.id)} />
      ))}
    </ul>
  );
}
// <Ligne> affiche : <input type="checkbox" /> {titre} <button>x</button>
```

Un utilisateur coche « Acheter du pain », puis la supprime. Voici ce qui s'affiche
réellement, mesuré dans un navigateur :

```
départ              [ ] Acheter du pain | [ ] Appeler le médecin | [ ] Payer le loyer
il coche "pain"     [x] Acheter du pain | [ ] Appeler le médecin | [ ] Payer le loyer
il supprime "pain"  [x] Appeler le médecin | [ ] Payer le loyer
```

**La coche a changé de tâche.** L'utilisateur a supprimé une course et s'est retrouvé avec
un rendez-vous médical marqué comme fait. Aucune erreur en console.

**Décision 1 — ne pas chercher le bug là où il n'est pas.** Le premier réflexe est de
suspecter `supprimer` ou `filter`. Le geste qui fait gagner une heure est de vérifier
d'abord **le state**, séparément de l'écran : affiche `taches` après la suppression. Il
contient exactement deux éléments, les bons, dans le bon ordre. Le modèle est juste, donc
le bug est dans le passage du modèle à l'écran. Ce partage — *les données sont-elles
fausses, ou seulement leur affichage ?* — est la première question à se poser devant
n'importe quel bug d'interface, et elle divise le champ de recherche en deux.

**Décision 2 — comprendre ce que React fait vraiment.** React ne reconstruit pas la liste
à partir de rien : il compare l'ancien rendu au nouveau et applique le minimum de
modifications au DOM. Pour cela, il doit apparier les anciens éléments aux nouveaux, et
c'est **la `key` qui dit lequel est lequel**. Avec `key={i}`, on lui a annoncé : « voici les
éléments 0, 1, 2 ». Après suppression : « voici les éléments 0, 1 ». React en conclut, très
logiquement, qu'il reste les deux premiers et que le troisième a disparu — il conserve donc
les nœuds DOM 0 et 1, et se contente d'y **changer le texte**. La case à cocher du nœud 0,
elle, n'a aucune raison de changer : elle était cochée, elle le reste. Le titre a bougé, la
case est restée. Rien n'a « sauté » : c'est nous qui avons donné à React une identité
fausse.

Une `key` n'est donc pas un identifiant technique réclamé par le framework pour faire taire
un avertissement. C'est une **affirmation** : *cet élément-ci du nouveau rendu est le même
que celui-là de l'ancien.* Écrire l'index revient à affirmer « la deuxième ligne est
toujours la même chose », ce qui est faux dès qu'on insère, supprime ou trie.

**Décision 3 — quelle clé, alors ?** Trois candidats, et deux sont des pièges.
`key={t.titre}` fonctionne… jusqu'à deux tâches homonymes, où React reçoit deux fois la même
affirmation d'identité et se comporte de façon incohérente. `key={Math.random()}` fait
disparaître le symptôme et c'est le pire des trois : une clé différente à chaque rendu
signifie « tous ces éléments sont nouveaux », donc React détruit et recrée tout le DOM à
chaque frappe — l'écran est correct, la page rame, et le focus du clavier saute. La bonne
clé est **stable dans le temps et unique parmi ses frères** : `key={t.id}`. Avec elle, la
même séquence donne `[ ] Appeler le médecin | [ ] Payer le loyer` — la coche est bien partie
avec la tâche supprimée.

**Le vrai enseignement est plus profond que la clé.** Demande-toi *pourquoi ce bug était
possible*. Parce qu'une information — « cette tâche est cochée » — vivait dans le DOM, dans
l'`<input>`, et non dans `taches`. Elle était donc hors de portée de React, qui n'a pas pu la
déplacer avec la ligne à laquelle elle appartenait. Corriger la clé soigne le symptôme ;
mettre `faite: false` dans l'objet tâche supprime la catégorie entière de bugs, parce que
l'état redevient entièrement dérivable du modèle. C'est exactement ce que promet
« UI = f(state) » : tout ce que l'écran montre doit être calculable depuis l'état — sinon il
existe un second état, invisible, que personne ne maintient.

**Variante qui déplace le problème.** Ajoute un champ de saisie par ligne pour renommer une
tâche, et une fonction de tri par titre. Le tri ne supprime rien, ne modifie aucun texte —
et pourtant, avec des clés par index, le texte à moitié tapé dans une ligne se retrouve dans
une autre. Même mécanisme, sans suppression : réordonner suffit. C'est le test à faire
mentalement sur toute liste que tu écris — *si je réordonne, qu'est-ce qui reste sur place
alors que ça aurait dû suivre ?*

## 🤖 Exemple appliqué (IA / data / architecture)
L'interface de DocQA/DocSense est du React : la liste des sources citées, l'état de la question (envoi → streaming → réponse), le dashboard qualité. « UI = f(state) » est aussi un principe d'architecture général : une seule source de vérité, des vues dérivées — tu le retrouveras côté serveur.

## ⚠️ Erreurs fréquentes
- Muter le state (`state.push`) : l'écran ne bouge pas, mystère garanti.
- Croire que `setState` est immédiat : `setN(n+1); setN(n+1)` n'ajoute que 1 (même `n` lu deux fois) → utilise `setN(c => c+1)`.
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
**composant** · **JSX** · **props** · **state / useState** · **re-rendu** · **instantané (snapshot) d'état** · **forme updater** (`setX(x => …)`) · **key** · **lifting state up** · **état dérivé** · **rendu conditionnel**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je pense en composants et je place l'état au bon niveau.
- [ ] Zéro mutation dans mes setters (spread partout).
- [ ] Je distingue stocké vs dérivé sans hésiter.

## 🔗 Liens avec le programme
Mois 4 (jours ~92-115), projet 3 (BiblioApp), UI de DocSense. Leçons liées : `javascript-basics`, `react-hooks-effects`, `typescript-basics`.
