# V65.1 — Critères de sortie, GELÉS

> **Écrits au CP1, avant la moindre ligne d'implémentation, et après la mesure
> CP0.** Ils ne seront pas assouplis après coup, y compris si le résultat leur
> est défavorable (brief §13, §18 : « Ne modifie PAS les conditions après la
> mesure »).
>
> Base mesurée : `docs/audits/V65-1-CP0-AUDIT.md`.
> Le contrat V65 (`docs/V65-COMPETENCY-EVIDENCE-CONTRACT.md`) reste **en
> vigueur intégralement** ; ce document ne le remplace pas, il ferme le produit
> autour de lui.

---

## 0. Ce que V65.1 doit fermer

V65 a livré un moteur. Le produit autour du moteur est resté ouvert :
deux modèles de compétence coexistent, deux vocabulaires s'affichent côte à
côte, une surface publie un nombre qu'aucune autre ne peut reproduire, et une
surface d'évaluation ignore ce que l'apprenant y a fait.

**Critère cardinal.** À la fin de V65.1, un apprenant doit pouvoir traverser
`/` → `/skills` → `/skills/[id]` → `/history` → `/diagnostics` → `/revisions`
sans jamais rencontrer **deux réponses différentes à la même question**.

---

## 1. Conditions de sortie — vérifiables, non négociables

Chaque condition est soit **vérifiée par un gate ou un test**, soit **vue à
l'œil sur une capture**. « Le backend est correct » n'est jamais une preuve
qu'une condition est tenue.

### C1 — Une seule source de vérité de compétence

`lib/skill-state.mjs` et `lib/learning-experience.mjs` ne sont plus lus par
aucune surface pour produire un **état de compétence**. Vérifié par gate :
aucun `page.tsx` / `.tsx` de `app/` n'importe `skillStats`, `SKILL_STATES` ou
`SKILL_STATE_LABEL`, directement ou transitivement.

### C2 — Divergence nulle entre surfaces

Sur une même fixture, pour les 20 compétences : l'état, le décompte de preuves
et la date de dernière preuve affichés par `/`, `/synthese`, `/skills`,
`/skills/[id]` et `/history` sont **identiques**. Vérifié par un test
d'anti-régression automatisé, pas par relecture.

> Mesure d'entrée à battre : **20 / 20 divergentes, dont 8 sémantiques.**
> Condition de sortie : **0 / 20.**

### C3 — Un seul vocabulaire de compétence à l'écran

Aucune surface n'affiche d'identifiant de compétence **fin** (`javascript`,
`linux`, `hashmap`, `arrays`…) là où une autre affiche l'identifiant
**programme** (`jsts`, `gitlinux`, `ds`…). Les étiquettes fines restent
autorisées **si et seulement si** elles sont désignées comme telles et
distinguées visuellement des compétences du programme.

### C4 — Aucun identifiant d'état anglais visible

`unassessed`, `practiced`, `demonstrated`, `reinforced`, `not-started`,
`discovered`, `to-consolidate` n'apparaissent dans **aucun texte rendu**.
Vérifié par sonde sur le DOM des 7 surfaces.

### C5 — Aucun nombre inventé

Tout nombre affiché correspond à une grandeur réelle et **reproductible depuis
le ledger**. En particulier :

- un décompte de preuves est un décompte d'**enregistrements distincts** ;
- une somme de crédits par compétence, si elle est affichée, est **nommée
  comme telle** et jamais mise en regard d'un décompte d'enregistrements ;
- « 0 » n'est jamais affiché pour dire « non évalué » ;
- aucune « dernière preuve » n'est affichée si elle n'existe pas.

> Mesure d'entrée : `/skills` affiche « **28** preuves qualifiantes sur 30 »
> pour **14** preuves qualifiantes réelles. Condition de sortie : le nombre
> affiché est 14, ou il est nommé autrement que « preuves qualifiantes ».

### C6 — Explicabilité déterministe

Pour toute compétence, le produit répond à « pourquoi cet état ? » par des
**faits** : la règle appliquée, les preuves retenues, celles qui ne suffisent
pas et pourquoi. Deux appels successifs sur la même progression rendent un
résultat **strictement égal** (test de déterminisme).

### C7 — Reconstructibilité

Effacer tout champ dérivé de la progression puis rejouer la projection rend un
résultat **strictement égal** à l'état affiché. Aucune compétence n'est écrite
directement là où elle peut être reconstruite (invariant 13).

### C8 — Surface de détail par compétence

`/skills/[id]` existe et porte, pour la compétence demandée :
identité · état · pourquoi cet état · preuves retenues · tentatives
insuffisantes · historique · provenance · **prochaine action réelle**
(existante dans le produit, jamais inventée). Elle est atteignable depuis
`/skills` **et** depuis `/history`.

### C9 — Diagnostics convergents

`/diagnostics` connaît l'historique de son lecteur : pour chaque diagnostic
déjà passé, la date, le résultat et le fait qu'il a produit — ou non — une
preuve qualifiante. Un double envoi ne crée **pas** deux preuves (clé métier).
Un échec reste visible et ne crédite rien.

### C10 — Historique utile

`/history` reste factuel (aucun événement de navigation) et devient
**exploitable** : au moins un filtre réel (type d'événement, compétence ou
journée) et un regroupement lisible. Un événement hérité sans horodatage fiable
est affiché comme **hérité**, jamais rehorodaté.

### C11 — Le pont révision reste un pont

Une révision produit une preuve **non qualifiante** et ne modifie jamais un
état de compétence. Aucune stratégie de répétition espacée supplémentaire n'est
introduite (invariant 25, brief §21).

### C12 — Idempotence et dédoublonnage

Rejouer deux fois la même commande d'écriture ne change pas le disque au-delà
du premier effet. Une même preuve métier (`sourceType:sourceId:compétences
triées:q|n`) n'est jamais créditée deux fois.

### C13 — `progress.json` immobile à la visite

Après navigation exhaustive des 50 routes, `data/progress.json` est
**inchangé à l'octet près**.

### C14 — Aucune route publique supprimée, aucune URL changée sans nécessité

Les 50 routes d'entrée restent servies. Les routes ajoutées sont ajoutées, pas
substituées.

### C15 — Les gates mesurent réellement

Chaque règle du nouveau gate `v651:check` est **vue échouer** par un test
négatif dédié. Une règle qui reste verte alors que l'invariant est cassé est un
trou, pas une règle. `gates:active` doit être **vert de bout en bout** — la
mesure d'entrée est rouge (P0-0).

### C16 — Curriculum gelé

`curriculum/` et `data/` hors progression inchangés à l'octet près. 365
journées, ordre strict `1..365`. Aucun contenu pédagogique réécrit.

### C17 — Aucune gamification

Ni XP, ni niveau joueur, ni streak, ni point arbitraire, ni classement, ni
badge de mérite. Une note personnelle n'est pas une preuve ; terminer une
journée n'est pas une preuve ; ouvrir une page n'est pas une preuve.

---

## 2. Tests négatifs obligatoires

Aucun de ces cas ne peut rester non couvert. Chacun doit être **vu échouer**
avant d'être vu passer.

| # | Ce qu'on casse volontairement | Ce qui doit hurler |
|---|---|---|
| N1 | Une surface réimporte `skillStats` | C1 |
| N2 | Un état de compétence diverge d'une surface à l'autre | C2 |
| N3 | Une étiquette fine s'affiche comme une compétence programme | C3 |
| N4 | Un identifiant d'état anglais fuit dans le rendu | C4 |
| N5 | Un décompte de preuves redevient une somme de crédits | C5 |
| N6 | L'explication devient un texte écrit en dur | C6 |
| N7 | Une compétence est écrite directement au lieu d'être projetée | C7 |
| N8 | La clé métier de dédoublonnage est retirée | C12 |
| N9 | Une preuve échouée crédite une compétence | contrat V65 §3 |
| N10 | Une révision fait progresser une compétence | C11 |
| N11 | Une visite mute `progress.json` | C13 |
| N12 | La liste des écrivains du gate est à nouveau codée en dur | C15 / P0-0 |

**Règle de méthode.** Un test négatif qui reste vert parce qu'un *autre*
mécanisme protège l'invariant ne prouve rien sur la règle visée : chaque
mécanisme doit être cassé séparément. (V65 a trouvé quatre trous sur douze
règles exactement par là.)

---

## 3. Verdicts — conditions fixées AVANT la mesure

| Verdict | Conditions |
|---|---|
| `COMPETENCY_PRODUCT_READY` | C1→C17 **toutes** tenues ; 12 tests négatifs vus échouer ; `gates:active` vert ; 0 dette P0 |
| `COMPETENCY_PRODUCT_FOUNDATION_READY` | C1, C2, C5, C7, C12, C13, C16, C17 tenues ; au plus **2** conditions restantes non tenues, **nommées, chiffrées, et sans dette P0 silencieuse** |
| `COMPETENCY_PRODUCT_NOT_READY` | toute divergence de compétence subsistante entre deux surfaces, ou tout nombre inventé subsistant, ou `gates:active` rouge |
| `REFERENCE_READY` | `COMPETENCY_PRODUCT_READY` **et** audit UI/UX ≥ 4/5 sur les 14 axes, sans axe < 3 |

« Reporté à V66 » seul n'est **pas** une justification recevable (brief §20).
Toute dette laissée doit être : nommée, localisée au fichier, chiffrée, et
accompagnée de la raison pour laquelle elle n'est pas P0.

---

## 4. Hors scope, explicitement

- Le **Retention Engine** complet. Pas de SM-2 supplémentaire, pas de modèle
  d'oubli, pas de réordonnancement piloté par la rétention (invariant 25).
- V66, sous toutes ses formes.
- Toute réécriture de contenu pédagogique.
- Toute nouvelle source de vérité concurrente.
