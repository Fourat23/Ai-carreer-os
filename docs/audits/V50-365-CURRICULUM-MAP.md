# V50 — Carte du curriculum 365 jours

Vue dérivée (`lib/curriculum-timeline.mjs`, données `docs/audits/v50-timeline.json`),
recomputable et vérifiée par `v50:check`. Le corpus (128 leçons) reste GELÉ ;
V50 n'a intégré que des **activités** (exercices) au parcours, sans réordonner un
seul jour.

## Vue par mois (compétences dominantes · jours avec pratique)

| Mois | Jours | Compétences dominantes | Jours avec pratique |
|------|-------|------------------------|:---:|
| M1 | 1-28 | gitlinux · jsts · algo | 28/28 |
| M2 | 29-56 | jsts · ds · algo | 27/28 |
| M3 | 57-91 | http · archi · se | 28/35 |
| M4 | 92-119 | jsts · se | 20/28 |
| M5 | 120-147 | python · sql | 20/28 |
| M6 | 148-182 | ml | 28/35 |
| M7 | 183-210 | dl · llm | 19/28 |
| M8 | 211-238 | rag · llm | 13/28 |
| M9 | 239-273 | rag · evalia · secu | 18/35 |
| M10 | 274-301 | agents · archi · secu | 24/28 |
| M11 | 302-329 | archi · rag · evalia | 17/28 |
| M12 | 330-365 | comm · secu · autonomy | 5/36 |

## Chaîne par jour (read-model)

Pour chaque jour, la carte dérivée expose : `skill`, `isReview`, `difficulty`,
et les `activities` (exercices résolus avec leur rôle pédagogique dérivé —
PRACTICE/REVIEW/DIAGNOSTIC). Elle permet de répondre « que construit chaque
journée ? » et « quelle chaîne de compétence est renforcée ? » sans détenir de
vérité propre.

## Résultat d'intégration V50

| | Avant V50 | Après V50 |
|--|-----------|-----------|
| Exercices atteignables depuis le parcours | 187/376 | **376/376** |
| Exercices orphelins | 189 | **0** |
| Exercices professionnels V46-V49 orphelins | 114 | **0** |
| Jours avec pratique | 61/365 | **247/365** |
| Mois 7-12 avec pratique de code | ~0 | M7=19 M8=13 M9=18 M10=24 M11=17 M12=5 |

## Lecture

Le second semestre (Data/AI : ml, dl, llm, rag, evalia, agents) rencontre
désormais la pratique exécutable construite en V46-V49, au moment où ces
compétences sont enseignées. M12 reste volontairement intégratif (comm/autonomy
non-code + projet final) : 5 jours de pratique de code y subsistent, le reste
étant portfolio/communication.
