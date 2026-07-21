# Correction — Jour 101 : Context pour l'état global léger

[← Retour au jour 101](../days/day-101.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : createContext + Provider + useContext pour partager le thème. Solution améliorée : encapsuler la consommation dans un hook custom (useTheme) qui lève une erreur hors Provider, garder dans le Context UNIQUEMENT un état global et stable (pas un état changeant), et documenter la justification (le props drilling évité vs le coût de re-rendu). La preuve de jugement : une note explicite « pourquoi Context ici et pas des props ».

## ⚠️ Erreurs probables et points à vérifier
- Mettre en Context un état qui change souvent : tous les consommateurs se re-rendent à chaque changement — re-rendus massifs (jour 102).
- Utiliser Context pour éviter de réfléchir au placement de l'état : les props explicites et locales sont souvent plus lisibles.
- Oublier le garde-fou hors Provider : useContext renvoie la valeur par défaut silencieusement, bug difficile à traquer.
- Confondre Context et gestion d'état : Context transporte, il ne gère pas la logique — celle-ci reste dans un state/reducer.

## 🔍 Comment vérifier ta solution
- Le Context ne contient qu'un état global ET stable (thème, utilisateur).
- La consommation passe par un hook custom qui échoue proprement hors Provider.
- Aucun état à changement fréquent n'est mis en Context.
- Une note justifie le choix Context vs props.
- Les composants profonds accèdent à la valeur sans props intermédiaires.

## 🎤 À savoir expliquer à l'oral
Pose la règle : « Context = transport d'un état global et stable ; son coût = re-rendu de tous les consommateurs quand la valeur change ». Insiste sur le jugement : « je sais aussi quand NE PAS l'utiliser — un état changeant reste local ». Cite le garde-fou du hook custom. Savoir refuser Context là où des props suffisent impressionne plus que de l'utiliser partout.
