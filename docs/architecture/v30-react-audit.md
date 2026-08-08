# Audit conceptuel de la chaîne Frontend/React — V30 (CP4)

Objectif du CP4 (prompt V30) : « faire un audit conceptuel de la chaîne React complète …
créer seulement les leçons manquantes nécessaires ; ne pas créer 10 leçons si 3 excellentes
suffisent ». Cet audit établit, concept par concept, que la chaîne construite en V29 est
**complète, cohérente et correcte**, et conclut — conformément à la priorité qualité >
quantité — qu'**aucune nouvelle leçon React n'est justifiée en V30**. La dette réelle
(routing, data-fetching avancé) est clairement cadrée pour V31.

## 1. Carte concept → leçon (chaîne réelle)

| Concept (prompt) | Couvert par | Vérifié |
|---|---|---|
| navigateur, DOM | `browser-dom-rendering` | ✅ on-ramp + prérequis |
| HTML/CSS/accessibilité | `browser-dom-rendering` + `react-accessibility` | ✅ |
| JSX | `react-fundamentals` | ✅ |
| composants, props | `react-fundamentals` | ✅ |
| state | `react-fundamentals` | ✅ |
| événements | `react-fundamentals` | ✅ |
| listes / keys | `react-fundamentals` (+ exercice react-list) | ✅ |
| formulaires contrôlés | `react-fundamentals` + `react-hooks-effects` | ✅ |
| composition | `react-composition-architecture` | ✅ |
| lifting state | `react-fundamentals` + `react-composition-architecture` | ✅ |
| cycle de rendu / reconciliation | `react-fundamentals` + `react-composition-architecture` | ✅ |
| hooks | `react-hooks-effects` | ✅ |
| effects vs events, cleanup | `react-hooks-effects` | ✅ |
| synchronisation avec systèmes externes | `react-hooks-effects` | ✅ |
| data fetching | `react-hooks-effects` | ✅ |
| loading / error / empty states | `react-hooks-effects` (3 états async) | ✅ |
| race conditions | `react-hooks-effects` (drapeau de fraîcheur) | ✅ |
| custom hooks | `react-hooks-effects` + `react-composition-architecture` | ✅ |
| architecture d'état / context | `react-composition-architecture` | ✅ |
| tests (par rôle / comportement) | `react-accessibility` + `testing-foundations` | ✅ |
| accessibilité | `react-accessibility` | ✅ |
| performance / mémoïsation | `react-composition-architecture` (quand mémoïser, honnête) | ✅ |

## 2. Vérification du point sensible : useEffect

Le prompt exige que `useEffect` ne soit PAS enseigné comme « outil général pour lancer du
code après le rendu ». Vérifié dans `react-hooks-effects` :
- Modèle mental : « une synchronisation avec l'EXTÉRIEUR … pas un fourre-tout ».
- Section « You might not need an effect » : un dérivé se calcule au rendu, un événement se
  gère dans le handler.
- Dépendances, cleanup, race conditions (drapeau de fraîcheur / AbortController) traités.
- Erreur fréquente : « effet pour calculer un dérivé » listée comme anti-pattern.
→ **Enseignement correct.** Aucune correction nécessaire.

## 3. Conformité structurelle et pratique

Les 5 leçons ont on-ramp « 🌍 Le problème d'abord » + « 🧩 Prérequis » (vérifié), sont
au standard V29 (P3), et chacune est reliée à la pratique (4–6 `practiceRefs` vers les 26
exercices `react-tsx`/`web` existants + le playbook `frontend-regression`). Le graphe de
prérequis est acyclique (validé par v29:check).

## 4. Décision V30

**Aucune nouvelle leçon React, aucun re-durcissement.** La chaîne est complète et correcte ;
créer des leçons supplémentaires serait de la quantité au détriment de la qualité —
explicitement interdit. C'est l'application directe de « une excellente leçon vaut mieux que
cinq superficielles » et de « l'audit fait foi ». L'effort V30 est concentré là où la dette
est réelle (Backend/API — CP3 ; AI/ML historique — CP8 ; documentation SE — CP6).

## 5. Dette React cadrée pour V31 (non bloquante)

- **Routing côté client** (navigation SPA, routes, paramètres, routes imbriquées) : genuinement
  absent. Utile pour un profil « Full-Stack TypeScript junior », mais non prioritaire face à
  la dette AI/ML. À traiter en V31 si l'audit le confirme.
- **Data-fetching avancé** (cache, invalidation, pagination côté UI, optimistic updates) :
  au-delà du socle ; extension possible V31.
- **Parcours Frontend Engineer** : reste `announced` tant qu'une curation jour-par-jour
  dédiée n'existe pas (pas de greenwashing).

## 6. Conclusion

La chaîne Frontend/React est **auditée et jugée cohérente, accessible à un néophyte et
techniquement correcte** (y compris le point sensible useEffect). V30 n'y ajoute rien, par
discipline de qualité, et documente honnêtement la dette d'extension pour V31.
