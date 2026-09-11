# V75 · CP0 — FORENSIC RECOVERY & TELEMETRY AUDIT

> **Lecture seule.** Aucun fichier de produit n'a été modifié. Les seuils d'acceptabilité d'un
> arriéré sont **délibérément non posés ici** : le brief l'interdit avant le CP1, et les poser
> après avoir vu les chiffres serait le contournement `G11` hérité de V74.

Le détail chiffré, les 20 profils, la télémétrie, les cinq dettes et les trois défauts de produit
sont consignés dans **`docs/v75/V75-STATE.md`** (sections « Mesures BEFORE », « Défauts de
PRODUIT découverts au CP0 », « Anomalies de mes propres sondes ») et dans les deux artefacts
JSON reproductibles :

- `docs/v75/cp0-backlog.json` — les 20 profils, 365 jours, générateur à graine ;
- `docs/v75/cp0-forensics.json` — télémétrie, D3, D4, D6, D8, D10.

Les sondes sont rejouables :

```
node scripts/v75/cp0-backlog.mjs
node scripts/v75/cp0-forensics.mjs
```

## Les trois faits qui commandent V75

1. **11 profils sur 20 ne reviennent jamais sous contrôle** — et le produit gère **mieux
   l'absence que l'échec** : les absences de 7, 14 et 60 jours récupèrent toutes en 19 à 22
   jours actifs, tandis que l'échec chronique ne récupère jamais.
2. **L'arriéré réel n'est jamais montré à l'apprenant** : 84 notions en retard, « 8 » annoncées,
   3 cartes affichées. La règle d'or de V75 — *ne jamais cacher la dette* — est donc déjà
   violée par le produit actuel, sans intention, par simple plafonnement d'affichage.
3. **Un facteur de priorité sur sept est mort** : `besoinProche` (15 points sur 100) ne peut
   jamais s'allumer, parce qu'il est calculé au grain compétence et lu au grain concept.
