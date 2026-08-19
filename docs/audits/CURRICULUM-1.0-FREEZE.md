# CURRICULUM 1.0 — FREEZE (V50)

À l'issue de V50, le parcours 365 jours d'AI Career OS est déclaré **STABLE**.
L'apprenant peut commencer Jour 1 aujourd'hui sans craindre une restructuration
majeure de son apprentissage.

## Composants STABLES (ne changent plus sans ADR + preuve d'un défaut bloquant)

- **Ordre macro des 365 jours** (`data/program.json` : jours, semaines, mois).
- **Fondations et leur séquence** : gitlinux/jsts/algo/ds (S1) → http/se/archi/
  python/sql (S1-S2) → ml/dl/llm/rag/evalia/agents (S2) → intégration (M12).
- **Dépendances / prérequis** entre compétences.
- **Grandes transitions** (généraliste → data → IA → production/portfolio).
- **Corpus académique** : 128 leçons (SHA-1 `4c1f3028…`), déjà gelé depuis V45.x.
- **Parcours principaux** (AI Engineer Foundations et dérivés).

## Composants ADDITIFS (modifiables sans version majeure)

- Nouveaux exercices, variantes, familles de problèmes.
- Nouveaux défis de transfert, diagnostics, misconceptions.
- Nouvelles missions, playbooks, scénarios professionnels.
- Mapping `data/day-exercises.json` (rattachement d'activités aux jours).
- Corrections factuelles ponctuelles (avec justification).
- Read-models dérivés et gates.

## Règle de gouvernance

Toute réorganisation du séquençage fondamental après V50 exige :
1. un **ADR** documentant le défaut (erreur pédagogique démontrée, dépendance
   incorrecte, ressource morte, évolution technologique majeure), et
2. une **preuve** de ce défaut.

Un sprint ne réordonne PAS les fondations parce qu'une autre organisation
paraît « intéressante ». L'apprentissage de l'utilisateur ne doit pas devenir
caduc.

## Vérification du gel

- `curriculum:check` : 365/365 jours, 52/52 semaines, 12/12 mois — OK.
- `v50:check` : refs vivantes, 0 orphelin professionnel, prérequis respectés.
- Corpus SHA-1 identique ; `data/program.json` : ordre des jours inchangé.

## Réponse à la question de stabilité

> « L'apprenant peut-il commencer Jour 1 aujourd'hui sans craindre une
> restructuration majeure du cursus ? »

**OUI.** Le corpus est gelé, l'ordre des 365 jours est verrouillé, la pratique
professionnelle est désormais intégrée au bon moment, et les évolutions futures
seront additives autour de cette colonne vertébrale stable.
