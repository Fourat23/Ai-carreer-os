# V72 — CP12. Honnêteté du gate de profondeur, et huit tests négatifs

**Deux décisions étaient possibles** (durcir le gate, ou rendre son message honnête). Les deux
ont été prises, dans la proportion que le contrat impose : **durcir uniquement sur des
propriétés objectives**, et **dire exactement ce qui est vérifié**.

**Et le huitième test négatif a trouvé un défaut réel dans un contrôle écrit le jour même.**

---

## 1. Ce que `curriculum:depth-check` promettait, et ce qu'il tenait

Message d'origine :

> ✅ Profondeur OK : structure pédagogique complète, blocs IA présents, **leçons structurées**.

Pour les **leçons**, il vérifiait quatre choses : ≥ 350 mots, ≥ 6 sections `##`, le mot
« exercice », le mot « vocabulaire ». « Leçons structurées » laissait croire à un contrôle de
structure pédagogique.

### Ce qui a été durci — et ce qui a été refusé

**Durci** : les **références mortes**. Le CP9 avait trouvé deux leçons citant des exercices
inexistants ; aucun gate ne les voyait, parce que les gates vérifient les **catalogues**,
jamais la prose des leçons. C'est une propriété **décidable et objective** : elle est
désormais une **erreur bloquante** du gate.

**Refusé : exiger le « gabarit complet ».** Le gate comptait déjà, sans l'exiger, les leçons
réunissant *Objectif*, *Modèle mental*, *Exemple guidé*, *Questions d'entretien* et
*quand suis-je prêt*. Mesure : **93 sur 128**. L'exiger ferait ajouter deux titres à
**35 leçons** — dont les leçons volontairement courtes de l'étagère de référence. Ce serait
ajouter des sections pour satisfaire un contrôle, exactement ce que l'anti-Goodhart interdit.
Le chiffre reste publié, explicitement étiqueté **INDICATEUR, non exigé**, avec la raison.

### Le nouveau message

```
Leçons de fond                        : 128 — cible 60
  contrôles EXIGÉS par leçon          : ≥ 350 mots · ≥ 6 sections · un exercice · références vivantes
  références mortes                    : 0
  INDICATEUR, non exigé — gabarit complet : 93/128
     (… NON exigé délibérément : imposer ces cinq titres ferait ajouter des sections pour
      satisfaire un contrôle, ce qui dégraderait des leçons volontairement plus courtes.
      La qualité pédagogique ne se note pas ici.)

✅ Profondeur OK : journées au gabarit attendu (cours, exemple guidé, entretien, cas métier
   sur les compétences IA/data, correction), et pour chaque leçon : longueur minimale, nombre
   de sections, présence d'un exercice, aucune référence morte.
   Ce gate ne juge PAS la qualité pédagogique — il vérifie des propriétés décidables.
```

---

## 2. Cinq invariants V72 rendus exécutables

Les règles gelées au CP1 n'étaient jusqu'ici que du texte. Elles deviennent des contrôles :

| script | invariant |
|---|---|
| `cp12-controle-competences.mjs` | **C3** — toute compétence déclarée a au moins une journée |
| `cp12-controle-prerequis.mjs` | **M5** — aucune leçon n'exige, sans l'annoncer, une notion enseignée plus tard |
| `cp12-controle-plafond-revues.mjs` | **§3** — une revue lie au plus 7 leçons |
| `cp12-controle-pratiques.mjs` | **P1** — la pratique dit quoi produire |
| `cp12-controle-readingminutes.mjs` | **C10** — la durée publiée est celle des fichiers (± 5 min) |

**Quatre sont verts. Le contrôle des compétences est ROUGE**, et il doit le rester : `cloud`
est déclarée sans aucune journée (CP7 §3). Un contrôle rouge qu'on laisse rouge parce que le
défaut est réel vaut mieux qu'un seuil abaissé.

### Le contrôle de prérequis a trouvé un vrai défaut — après deux corrections de ma sonde

Premier passage : **4 signalements**, tous faux. La sonde découpait la section « Prérequis »
ligne par ligne, ce qui séparait la citation de l'encadré `>` qui l'annonce. Regroupement des
lignes `>` consécutives → 3 signalements.

Deuxième correction : la convention de V71 (`docs/v71/PREREQUIS-ORDRE.md`) reconnaît « aide »,
« éclaire », « utile » comme marqueurs d'anticipation correcte. `error-handling` écrit « Une
notion des codes de statut HTTP **aide** pour la partie API » — c'est de la classe A. Ajout de
ces marqueurs → **2 signalements**.

**Les deux restants étaient réels.** La revue de la semaine 9 (**jour 63**) envoyait vers
`data-cleaning-quality` et `etl-pipelines`, qui exigent toutes deux `pandas-data-wrangling` —
enseignée au **jour 127**, soit **soixante-trois jours plus tard**. Ces deux leçons ne sont
réellement enseignées qu'aux jours 128 et 138 : elles n'apparaissaient au jour 63 que parce que
le complément par compétence tirait tout le catalogue `sql`.

**Correction, plus simple qu'un contrôle de prérequis et plus vraie : une revue révise, elle
n'introduit pas.** Le complément par compétence ne retient désormais que les leçons **déjà
rencontrées** sur une journée de travail antérieure ou de la semaine en cours.

| effet | |
|---|---|
| journées régénérées | **7** |
| revues sans aucune leçon | **0** |
| leçons sur parcours | **106**, inchangé |
| ordre des 365 jours | inchangé |
| charge | UNDERLOADED 39 → 40, HEAVY 56 → 55, IMPOSSIBLE **7**, inchangé |

---

## 3. Les huit tests négatifs imposés par le §11

Chaque défaut est introduit pour de vrai, le contrôle est exécuté, le fichier est restauré à
l'octet près et le dépôt vérifié propre. Le script s'arrête si une restauration échoue.

| # | défaut introduit | contrôle | réaction |
|---|---|---|---|
| 1 | plafond de revue porté à 99 dans le générateur | invariant du plafond | **rougit** |
| 2 | compétence fantôme ajoutée à `program.json` | contrôle des compétences | **rougit** |
| 3 | une leçon du jour 4 exige une leçon du jour 320 | contrôle des prérequis | **rougit** |
| 4 | huit leçons ajoutées à une revue | contrôle du plafond | **rougit** |
| 5 | section de pratique vidée | contrôle des pratiques | **rougit** |
| 6 | `readingMinutes` d'une journée falsifié de +60 min | contrôle des durées | **rougit** |
| 7 | leçon réduite sous 350 mots | `curriculum:depth-check` | **rougit** |
| 8 | exercice inexistant cité dans une pratique | `curriculum:depth-check` | **rougit** |

**8 / 8 valides.** Mais pas du premier coup.

### Le test n° 8 a échoué, et il avait raison

Au premier passage, le contrôle des références mortes est **resté vert** devant une référence
morte introduite exprès. Cause trouvée en lisant :

```js
md.matchAll(/^## .*(?:Pratique|Exercice).*$([\s\S]*?)(?=^## |$)/gm)
```

Avec le drapeau `m`, **`$` marque la fin de LIGNE**. Le groupe paresseux `([\s\S]*?)` s'arrête
donc immédiatement, et capture une **chaîne vide**. Le contrôle parcourait du néant et
annonçait « 0 référence morte » — un vert parfaitement faux.

Le même défaut existait dans `scripts/v72/refs-mortes.mjs`, écrit au CP9. **La vérification
« 0 référence morte » publiée au CP9 reposait donc, côté JavaScript, sur un contrôle creux.**
Elle restait vraie — la mesure du CP9 avait été faite en Python, où `\Z` marque la fin absolue
du texte — mais le contrôle rejouable livré avec elle ne valait rien.

Les deux fichiers découpent désormais les sections par titre au lieu d'une expression
régulière. Après correction : le test n° 8 **rougit**, et les 0 référence morte sont
re-vérifiées pour de bon.

**C'est exactement ce à quoi sert un test négatif** : un gate vert jamais mis en échec
volontairement n'est pas un gate validé. Celui-là a tenu moins d'une journée.

---

## 4. Vérification

| contrôle | résultat |
|---|---|
| tests négatifs | **8 / 8 valides**, restaurations vérifiées à l'octet près |
| invariants V72 exécutables | 4 verts, **1 rouge assumé** (`cloud` sans journée) |
| `npm test` | **1420 / 1420** |
| `npx tsc --noEmit` | **0** |
| `npm run gates:active` | **vert** |
| corpus des leçons | **`c1ac869e…` — aucune leçon modifiée au CP12** |
| ordre des 365 jours, 128/365/365 | inchangés |
