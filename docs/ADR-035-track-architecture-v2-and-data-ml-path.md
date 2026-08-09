# ADR-035 — Track Architecture V2 + parcours Data/ML + burn-down de dette pédagogique

Statut : accepté (Sprint V35). Décision fondée sur l'audit CP0 réel. **Priorité : pédagogie >
cohérence des parcours > pratique > architecture > features > UI.** Local, mono-utilisateur,
sans auth/SaaS/réseau, **une seule source de vérité**, sans faux runtime ML.

## Problème (établi au CP0)

V34 soupçonnait que les parcours spécialisés étaient trop dépendants de PLAGES de jours
contiguës issues du parcours AI Engineer 365 j, empêchant de composer un parcours Data/ML dont
les apprentissages sont dispersés. Il fallait déterminer si « Track Architecture V2 » (sélection
non contiguë) était réellement nécessaire.

## Constat décisif

**La sélection non contiguë est DÉJÀ supportée** par le format de module-spec de
`lib/catalogue.mjs`. Le champ `from` d'un module accepte deux formes :
- une borne basse de PLAGE contiguë `[from, to]` (cas par défaut) ;
- un **tableau explicite de jours** (module NON CONTIGU), ex. le module CI/CD de
  systems-cloud : `['scf-08-cicd', …, [307, 326]]`, filtré par `from.includes(d.day)`.
Trois parcours (systems-cloud, appsec-cloud, cloud-devops) l'utilisent déjà.

## Décision

### D1 — Track Architecture V2 = réutiliser l'existant (option B, déjà implémentée)
Aucun nouveau moteur, aucun curriculum-v2, aucune seconde source de vérité. La « V2 » consiste
à EXPLOITER la capacité de composition non contiguë existante pour bâtir le parcours Data/ML,
et à l'étendre **marginalement** seulement si un besoin réel émerge (ex. métadonnée optionnelle
de prérequis/critères de sortie sur un module). Les options rejetées :
- **A (plages uniquement)** : insuffisant pour Data/ML dispersé.
- **C (modules par skills/concepts)** : réinventerait une sélection que les listes de jours
  explicites couvrent déjà, au prix d'une seconde logique.
- **D (hybride avec nouveau moteur)** : sur-ingénierie ; le mécanisme actuel (plage OU liste)
  EST déjà l'hybride.

### D2 — Parcours Data/ML composé par listes de jours curées
`dataMlModules(program)` définit des modules dont les `dayRefs` sont des listes de jours
réelles (dérivées des compétences : python, sql, ml, dl, llm, evalia), sans copier journées ni
leçons. La durée est dérivée du nombre de jours sélectionnés (pas de nombre magique).

### D3 — Activation conditionnelle (CP8), pas de greenwashing
`data-ml-v1` ne passe `announced → available` QUE si l'audit CP8 démontre une progression
pédagogique cohérente et une identité distincte du parcours AI Engineer Foundations. Sinon il
reste annoncé avec une blocker matrix. La non-activation est un résultat acceptable.

### D4 — Burn-down de la dette pédagogique (12 leçons sans on-ramp)
Durcissement ADDITIF (on-ramp « problème d'abord » + prérequis rédigés, contenu conservé) des
12 leçons historiques, par priorité P0→P1→P2. Objectif 12/12 raisonnablement corrigeables.
Réutiliser une pratique existante avant d'en créer.

## Frontière réel / simulé
Inchangée : aucun entraînement ML, aucun appel LLM/réseau, aucune dépendance lourde. Exercices
= raisonnement déterministe étiqueté SIMULATION.

## Conséquences
Pas de risque architectural majeur (le mécanisme existe et est testé). L'effort se concentre
sur la pédagogie (parcours Data/ML + 12 leçons), conformément à la priorité produit. Les 6
parcours existants restent inchangés (compat vérifiée en CP3).
