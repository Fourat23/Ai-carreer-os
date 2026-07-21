# Correction — Jour 92 : React : composants, props, JSX

[← Retour au jour 92](../days/day-092.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : une fonction par bloc visuel, des props typées, composées dans un parent. Solution améliorée : isoler les vrais composants RÉUTILISABLES (Badge servira ailleurs), typer précisément les props (pas de any), garder chaque composant pur (aucune mutation, aucun effet de bord), et préparer la communication vers le haut via des props-fonctions (onEmprunter). La preuve de bonne décomposition : la même Carte s'utilise dans plusieurs contextes sans modification.

## ⚠️ Erreurs probables et points à vérifier
- Un composant géant qui fait tout : illisible et non réutilisable — découpe en briques nommées d'après leur rôle.
- Muter les props (les props sont en lecture seule) : casse le flux unidirectionnel et provoque des bugs invisibles.
- Oublier la majuscule sur le nom du composant : React le prend pour une balise HTML et ne le rend pas.
- Typer les props avec any : on perd toute la sécurité de TypeScript, qui est justement l'intérêt de typer un front.

## 🔍 Comment vérifier ta solution
- Chaque composant est une fonction pure qui renvoie du JSX.
- Les props sont typées précisément (aucun any).
- Aucun composant ne modifie ses props.
- Au moins un composant est réellement réutilisé dans plusieurs contextes.
- La liste utilise une key stable (id), pas l'index.

## 🎤 À savoir expliquer à l'oral
Explique le renversement déclaratif : « en vanilla je donnais des ordres au DOM ; en React j'écris une fonction qui décrit l'UI pour des props données, et React fait correspondre le DOM ». Puis la règle : composants purs, props en lecture seule, données qui descendent. Savoir décomposer une maquette au tableau en 5 composants nommés est un signal fort en entretien front.
