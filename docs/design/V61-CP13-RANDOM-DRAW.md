# V61 · CP13 — Tirage au sort de navigation

**Ce document est publié AVANT toute correction de ce qu'il révèle, et ne sera
pas réécrit.** Si le tirage tombe sur une route en mauvais état, c'est le
constat qui est amendé par une correction ultérieure, jamais le tirage.

## Procédé

Le tirage n'est pas choisi : il est calculé à partir d'une graine fixée d'avance
et non ajustable — le SHA du commit `eab092e` (V61 CP11+CP12), donc d'un objet
qui existait avant que le tirage soit lancé.

```
graine : eab092e4b747acc9d986e39e5c44c068329c5d28
```

Générateur : xorshift32 amorcé par le hachage de la graine ; tirage sans remise
dans les **36 routes de production** (les 13 routes de `design-spike/` sont hors
produit et hors tirage). Script conservé : `scratchpad/draw.mjs`, reproductible
à l'identique.

## Les 14 routes tirées

| # | Route | Instance visitée | Touchée en V61 ? |
|---|-------|------------------|------------------|
| 1 | `/pipelines` | — | non |
| 2 | `/security/[id]` | `/security/leaked-secret-config` | non |
| 3 | `/cloud-lab/[id]` | `/cloud-lab/canary-no-metric` | non |
| 4 | `/kubernetes` | — | non |
| 5 | `/career` | — | non |
| 6 | `/pipelines/[id]` | `/pipelines/deploy-staging` | non |
| 7 | `/missions` | — | **oui** (CP6-CP7, puis CP11) |
| 8 | `/lessons` | — | non |
| 9 | `/settings` | — | non |
| 10 | `/projects` | — | **oui** (CP6-CP7) |
| 11 | `/revisions` | — | **oui** (CP4-CP5, puis CP12) |
| 12 | `/lab` | — | **oui** (CP8-CP10, puis CP11) |
| 13 | `/cloud-foundations/[id]` | `/cloud-foundations/aws-ha-api` | non |
| 14 | `/capstones` | — | **oui** (CP8-CP10) |

## Conformité au protocole exigé

| Exigence | Attendu | Obtenu |
|---|---|---|
| routes tirées | ≥ 12 | **14** |
| routes modifiées en V61 | ≥ 5 | **5** — missions, projets, révisions, laboratoire, capstones |
| routes non modifiées | ≥ 4 | **9** |
| route dynamique | ≥ 1 | **4** — security, cloud-lab, pipelines, cloud-foundations |
| route dense | ≥ 1 | `/lab` (1 111 exercices), `/lessons`, `/missions` (42) |
| route à état vide | ≥ 1 | `/revisions` — à progression nulle, la file de réactivation est vide ; c'est son état réel, pas une page vide par accident |

Aucun re-tirage n'a été effectué : le premier tirage satisfaisait déjà les six
contraintes. S'il ne les avait pas satisfaites, le complément aurait été tiré à
la suite avec la même graine, et le fait aurait été écrit ici.

## Ce que le tirage est censé mettre à l'épreuve

Neuf des quatorze routes n'ont **pas** été touchées par V61. C'est précisément
l'intérêt : un sprint de migration qui n'améliore que ce qu'il regarde produit un
produit à deux vitesses. La question posée à ces neuf routes n'est pas « sont-elles
parfaites » mais **« appartiennent-elles au même produit que les cinq autres »**.

Le constat des quatorze visites est consigné dans
`docs/design/V61-CP13-RANDOM-FINDINGS.md`, écrit après ce document.
