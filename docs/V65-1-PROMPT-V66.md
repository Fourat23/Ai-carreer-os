# V66 — proposition, dérivée de la dette réelle de V65.1

> Préparé à la clôture de V65.1. **Ne pas lancer avant décision humaine.**
> La portée ci-dessous est déduite de `docs/audits/V65-1-FINAL-REPORT.md` §7,
> pas décidée à l'avance.

## Où en est le produit

V65 a livré le moteur. **V65.1 a fermé le produit autour du moteur** : une seule
source de vérité de compétence, un seul vocabulaire, des décomptes honnêtes, une
surface de détail par compétence, des évaluations qui laissent une trace, un
historique exploitable. Verdict `REFERENCE_READY`, aucune dette P0.

Ce que V65.1 a **refusé** de faire, par consigne explicite : le Retention
Engine. Le pont s'arrête toujours au **candidat** de révision.

---

## Phase 1 — REVIEW, RETENTION & MEMORY ENGINE

C'est le sujet que V65 avait identifié et que V65.1 n'avait pas le droit de
toucher (invariant 25, brief §21). Ce qui manque, inchangé et maintenant
mesurable :

- **la planification pilotée par la PREUVE, pas par le statut de journée.**
  `getDueReviews` lit encore `days[*].review`, un champ posé à la clôture d'une
  journée. Le ledger sait quelle compétence a été démontrée quand, et par quoi ;
  l'échéancier l'ignore.
- **l'oubli mesuré plutôt que supposé.** Le moteur SM-2 existe et fonctionne.
  Rien ne confronte sa prédiction à ce qui se passe réellement.
- **la boucle complète révision → preuve → réordonnancement.** V65 a livré le
  premier segment ; V65.1 l'a rendu visible ; le troisième n'existe pas.
- **la distinction entre une compétence JAMAIS REVUE et une compétence REVUE
  PUIS RETOMBÉE.** La seconde est un signal fort, aujourd'hui invisible.

### Question à trancher au CP0 de V66

> Le produit peut-il distinguer « je n'ai pas revu » de « j'ai revu et j'ai
> oublié » ? Et si non, **quelle donnée manque exactement** ?

Le ledger porte désormais de quoi commencer à répondre : une révision produit
une preuve `review` datée, non qualifiante, rattachée à des compétences. Ce
qu'il ne porte pas, c'est le **résultat** de cette révision au-delà d'une
compréhension déclarée.

### Ce que V66 ne doit pas être

Ni tuteur IA, ni recommandation adaptative, ni score de rétention inventé. Le
même interdit qu'en V65 et V65.1 : **aucun chiffre sans grandeur réelle
derrière.**

---

## Phase 2 — décision de contenu, hors sprint technique

V65.1 a mesuré un trou que **le code ne peut pas combler** :

| Compétence | exercices | diagnostics | missions | capstones |
|---|---|---|---|---|
| `autonomy` | 0 | 0 | 0 | **0** |
| `comm` | 0 | 0 | 0 | 1 |
| `cloud` | **0** | 3 | 0 | 1 |
| `python`, `dl`, `agents`, `evalia` | oui | **0** | 0 | oui |

`autonomy` ne peut structurellement pas sortir de « Non évaluée ». Le produit le
DIT désormais, ce qui est honnête, mais une compétence du programme qu'aucune
source ne peut démontrer pose une question **pédagogique**, pas technique :

> Est-ce une compétence du programme, ou une intention ? Si c'en est une, quelle
> source la démontrerait — et le Curriculum 1.0 doit-il être rouvert pour ça ?

Le Curriculum est gelé. Cette décision est humaine, elle ne s'improvise pas dans
un sprint technique, et elle ne doit surtout pas être « réglée » en inventant du
contenu.

---

## Invariants hérités, toujours en vigueur

- une visite ne crée jamais de preuve ni ne fait progresser une compétence ;
- une compétence se projette depuis les preuves, jamais écrite directement ;
- provenance obligatoire, déduplication par **clé métier**, `createdAt` serveur ;
- un échec et une réussite sur la même source sont **deux faits distincts** —
  et leurs identifiants doivent le dire (P0-6 de V65.1) ;
- historique factuel, aucun événement de navigation ;
- 0 modification de `curriculum/` ;
- `progress.json` intact après navigation ;
- tout nouveau gate **vu échouer**.

## Leçons de mesure à emporter

**Un gate qui énumère mesure une photo, pas un invariant.** `v64:check` listait
six fichiers ; le produit a changé, la liste non, et `gates:active` est resté
rouge pendant toute la clôture de V65. La même règle, dérivée du code, a trouvé
deux catégories d'écrivain qu'aucune règle ne surveillait.

**Deux gardes qui protègent le même invariant en se contredisant valent moins
qu'une.** L'identifiant déterministe et la clé métier n'étaient pas d'accord sur
ce qui constitue « le même fait » : la plus stricte gagnait, et elle jetait les
réussites après échec, en silence, avec un « ok » en réponse. C'est la deuxième
fois en deux sprints qu'un test négatif reste vert parce qu'un AUTRE mécanisme
attrape le cas. **Casser chaque mécanisme séparément.**

**Une suite verte sur une progression vide ne mesure rien.** La fixture est
maintenant un artefact du dépôt (`scripts/v651-fixture.mjs`), produite par l'API
réelle. Elle couvre les quatre états, les sept types de source et le cas « raté
puis réussi » — celui-là même qui a révélé le défaut le plus grave du sprint.
**La lancer avant toute mesure UX.**

**La capture bat la métrique.** Trois défauts de V65.1 ont été vus à l'œil
pendant que toutes les sondes étaient vertes. Et le dixième faux positif de
sonde de la série s'est encore corrigé **dans la sonde**, jamais dans le
produit.
