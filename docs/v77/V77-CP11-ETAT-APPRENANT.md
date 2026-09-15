# V77 · CP11 — LES FAITS DEVIENNENT LISIBLES, SANS NOUVEAU MOTEUR

> Un fait que personne ne peut lire n'est pas encore une observation : c'est du
> stockage.

---

## 1. Le défaut, et il est embarrassant

Les quatre faits construits aux CP3 → CP7 — `usageEvents`,
`assessmentAttempts`, `missionSubmissions`, `artifactAnalyses` — étaient écrits,
persistés, bornés, exportés, restaurés… et **aucune surface ne les lisait**.

Mesuré avant d'écrire : une recherche sur les quatre noms de champ dans `app/`
et `lib/` ne trouve que leurs propres modules et le store. Zéro lecteur.

C'est le **cinquième sprint d'affilée** où la chose à brancher existe déjà,
débranchée. Avec une aggravation : cette fois, je l'avais construite moi-même,
quatre checkpoints plus tôt.

## 2. Aucun nouveau moteur

L'historique de V65 est une **PROJECTION** des faits déjà persistés — une
architecture choisie et justifiée à l'époque, précisément pour ne pas créer une
seconde base mutable. Les quatre nouveaux faits s'y ajoutent **exactement comme
les cinq autres** : rien n'est recalculé, rien n'est stocké en double, aucun état
n'est écrit par une lecture.

Un test le garde : deux appels rendent la même chose, et la progression n'est pas
modifiée. *Un moteur, lui, écrirait.*

| type | ce que la ligne dit |
|---|---|
| `ASSESSMENT_SUBMITTED` | `async-messaging-queues — 3/5` (+ `seuilAtteint`, pas « niveau ») |
| `MISSION_DELIVERABLE` | `m1 · rev — validé par l'apprenant` (+ `niveau: DECLARED`) |
| `ARTIFACT_ANALYZED` | `kubernetes · broken-service — 7 diagnostics` (+ `simulation`) |
| `SURFACE_USED` | `terminal · term-list-files — usage constaté, aucune réussite mesurée` |

## 3. Ce que les lignes n'ont pas le droit de dire

Un test balaie chaque ligne produite et refuse `score`, `%`, `percentile`,
`maîtrise`, `niveau de` — dans le texte **et** dans les noms de champs. Le
vocabulaire interdit du brief n'est pas seulement absent : son absence est
vérifiée.

Deux formulations ont demandé un soin particulier :

- **le diagnostic** porte `seuilAtteint`, pas `reussite` ni `niveau` : un seuil
  déclaré d'avance appliqué à un décompte n'est pas une maîtrise ;
- **l'artefact** dit un compte de diagnostics et rien d'autre — un test refuse
  « réussi », « validé », « correct » dans son détail.

## 4. La garde qui compte : usage ≠ travail

`historySummary` comptait « des événements », et un lecteur pressé y lit « du
travail ». Ajouter l'usage au même compteur aurait fait **grimper le chiffre sans
qu'un seul exercice de plus ait été résolu** — le genre d'amélioration qui ne
mesure rien.

Le résumé publie donc deux nombres :

```
total = travail + usage
```

et la surface les affiche **côte à côte, séparés**. La ligne d'usage porte en
outre son avertissement **dans son texte**, pas seulement dans un champ : un
consommateur qui ne lit pas `usage: true` lira quand même « aucune réussite
mesurée ».

## 5. La chaîne réelle, mesurée en HTTP

Serveur de production, progression hors dépôt, deux gestes : une exécution de
terminal, et une soumission de diagnostic **sans conservation**.

```
Diagnostic soumis   async-messaging-queues — 3/5   Architecture · Software engineering
Surface utilisée    [usage]  terminal · term-list-files — usage constaté, aucune réussite mesurée

Travail 1  ·  Usage 1  ·  Preuves 0  ·  Jours actifs 1
```

**`Preuves 0`** est la ligne la plus intéressante de cette sortie. L'apprenant a
soumis un diagnostic sans le conserver : aucune preuve n'existe — et pourtant le
travail est observé. C'est exactement la correction du CP4, visible à l'écran :
*n'écrire que sous `record` n'aurait observé que les tentatives dont l'apprenant
est assez content pour les garder.*

## 6. Ce que ce checkpoint N'A PAS fait

- **Aucun moteur n'a appris à lire ces faits.** Compétence, rétention et
  récupération les ignorent toujours ; un test de dépendance le garde, champ par
  champ. Le contrat du CP3 l'exige pour l'usage, et les CP4 → CP7 n'ont pas
  décidé ce que leurs faits qualifient.
- **Aucun score, aucune agrégation.** Pas de « taux d'activité », pas de série,
  pas de moyenne de diagnostics.
- **Aucune donnée fabriquée.** Une progression vide produit zéro événement ;
  quatre faits produisent quatre lignes.
- **Aucun nouvel événement de navigation.** L'engagement de V65 tient : ouvrir
  une page n'est toujours pas un fait de travail — et un usage de terminal n'est
  pas une page ouverte, c'est une exécution.

## 7. Vérifications

| vérification | résultat |
|---|---|
| `tests/v77-learner-state.test.mjs` | **14 / 14** |
| `npm test` | **2156 / 2156** |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **49 portes, 0 violation** |
| chaîne HTTP réelle | `/history` affiche les deux faits · `Travail 1 · Usage 1 · Preuves 0` |
| `data/progress.json` | **absent** |

## 8. Ce qui reste incertain

**Une ligne d'historique n'est pas une compréhension.** Voir
`0/5 → 1/5 → 4/5` ne dit pas si l'apprenant a compris ou mémorisé le corrigé. Le
CP4 le disait déjà ; l'afficher ne le rend pas plus vrai, et aucune formulation
de l'historique ne le suggère.

**La lisibilité s'arrête à l'historique.** Ces faits n'apparaissent ni sur le
tableau de bord, ni dans la vue des compétences — parce qu'ils n'y auraient pas
de sens sans décider ce qu'ils qualifient, ce que le CP9 a délibérément réservé
aux preuves. Un pilote V78 lira l'historique et l'export ; c'est ce que le CP12
doit dire clairement plutôt que de laisser espérer mieux.
