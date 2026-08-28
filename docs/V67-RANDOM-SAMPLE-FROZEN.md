# V67 — Échantillon gelé

> **Gelé au CP1, publié AVANT toute transformation.** Le tirage est
> déterministe (mulberry32, aucun `Math.random`) et rejouable :
> `node scripts/v67-sample.mjs`.
>
> **Cet échantillon ne sera pas modifié après avoir vu les résultats.** Si une
> strate se révèle mal choisie, on le dit ; on ne la remplace pas.

---

## Échantillon PRIMAIRE — seed `20260901`

Audité au CP1 (avant transformation) et **rejoué à l'identique au CP14**.

Stratification appliquée AVANT le tirage, pour qu'aucune strate ne puisse être
absente : 8 leçons de famille A, 4 de famille B, 8 de famille C, plus une
garantie de couverture des trois tiers de l'année, plus 5 revues.

### 20 leçons

- `api-design-basics`
- `api-production-contracts`
- `async-javascript`
- `cloud-compute-storage`
- `database-transactions-concurrency`
- `deployment-strategies`
- `distributed-tracing`
- `express-backend`
- `javascript-basics`
- `k8s-security`
- `machine-learning-basics`
- `metrics-percentiles`
- `networking-tcp-ip-model`
- `neural-networks`
- `nextjs-foundations`
- `rag-fundamentals`
- `react-composition-architecture`
- `slo-error-budget`
- `structured-outputs-tools`
- `technical-debt`

### 5 revues hebdomadaires

Journées **98, 210, 294, 329, 336**.

---

## Échantillon AVEUGLE — seed `20260902`

> **À NE PAS CONSULTER avant le CP14.** Sa seed est publiée ici pour que le
> tirage soit vérifiable, mais son contenu ne doit être ouvert qu'au moment de
> l'audit final. C'est précisément le fait de ne pas savoir quelles leçons il
> contient pendant la migration qui lui donne sa valeur de contrôle : si les
> deux échantillons divergent au CP14, c'est que la transformation a été
> guidée par l'échantillon primaire plutôt que par le contrat.

Commande : `node scripts/v67-sample.mjs --aveugle`

Le contenu n'est **pas** reproduit dans ce document, volontairement.

---

## Ce que l'échantillon ne couvre pas, et qui sera audité autrement

- **Les 365 journées** : la charge est mesurée sur la totalité, pas sur un
  échantillon (`node scripts/v67-audit.mjs`).
- **Les 128 leçons** : l'analyse structurelle est exhaustive ; seule la
  NOTATION sur les 15 dimensions passe par l'échantillon.
- **Les 68 leçons orphelines** : traitées comme une population entière, pas
  comme un tirage — c'est un défaut d'assignation, il se compte, il ne
  s'échantillonne pas.
