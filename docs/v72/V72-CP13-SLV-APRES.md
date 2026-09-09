# V72 — CP13. Passage APRÈS de la validation simulée

**Résultat, en une phrase :** aucune baisse sur aucun axe, aucune leçon appauvrie par les
corrections des CP2 à CP12 — et comme le CP5 l'avait écrit d'avance, **ce résultat ne prouve
rien de plus que ça**, parce que dix-huit des vingt-quatre textes n'ont pas changé d'un octet
et que quatre axes sur cinq étaient déjà au plafond.

---

## 1. Ce que ce second passage pouvait détecter, et rien d'autre

L'interprétation a été fixée au CP5, **avant** de le passer, précisément pour qu'aucune lecture
flatteuse ne soit possible ici. Elle est reproduite telle quelle :

> 1. **Un score identique sera le résultat attendu**, puisque quatre axes sont déjà au plafond.
>    Il ne prouvera rien sur les corrections des CP2, CP3, CP6 à CP12.
> 2. **Une baisse serait le signal important** : elle indiquerait qu'une correction a retiré
>    quelque chose d'utile. C'est le seul événement que ce second passage peut réellement
>    détecter, et c'est à ce titre qu'il est conservé.

Le passage a donc une seule question à trancher : **V72 a-t-il abîmé quelque chose ?**

---

## 2. La mesure préalable qui décide de tout : 6 leçons sur 24 ont changé

Comparaison de `167f822` (HEAD au CP0) à HEAD, fichier par fichier, sur les 24 leçons de
l'échantillon :

| leçon | CP responsable | lignes +/− | nature |
|---|---|---|---|
| `async-messaging-queues` | CP9 | +2 / −2 | référence d'exercice morte |
| `cloud-azure-core` | CP2 | +5 / −3 | ouverture |
| `deployment-secrets` | CP2 | +1 / −1 | redite d'ouverture |
| `linux-resources-io` | CP2 | +11 / −3 | modèle mental |
| `monitoring-production` | CP2 | +2 / −2 | ouverture + objectif |
| `resilience-patterns` | CP3 | +1 / −2 | clôture d'ouverture |

**Les dix-huit autres sont identiques octet pour octet.** C'est la conséquence directe du
principe posé au CP1 — V72 n'intervient que là où un défaut est mesuré — et cela a une
conséquence méthodologique qu'il faut énoncer avant les chiffres.

### Pourquoi les 18 inchangées sont reportées et non remesurées

Un texte inchangé, relu par le même correcteur, qui se souvient de ses propres réponses et
dispose du même barème, ne produit **aucune information nouvelle**. Rejouer les cinq axes
dessus produirait vingt-quatre lignes de tableau et zéro bit de mesure — et, si un écart
apparaissait, il mesurerait ma variabilité de correcteur, pas la leçon.

Les cinq notes des 18 leçons inchangées sont donc **reportées, et déclarées comme reportées**
dans `docs/v72/V72-SLV-AFTER.json` (champ `ecart_avant_apres` et observation explicite). Elles
ne sont pas présentées comme une seconde mesure. **Le passage APRÈS porte réellement sur six
leçons.**

### Le pré-test n'est pas rejouable, et c'est structurel

Le pré-test mesure ce qui est su **avant** lecture. Les 24 leçons ont été lues au CP5 ; cette
condition ne peut plus être réunie. Un « pré-test APRÈS » mesurerait la mémoire du premier
passage. Il n'est donc pas passé, et le champ vaut `NON REJOUABLE` — pas 0, pas une
extrapolation. **La valeur qui compte reste celle du CP5 : 0,842**, et c'est elle qui devra
figurer à côté du verdict au CP15.

---

## 3. Les six leçons modifiées, une par une : qu'est-ce qui a été retiré ?

La méthode est la même pour les six : **prendre chaque proposition supprimée et chercher où
elle se trouve encore.** Une correction éditoriale honnête déplace ou dédouble ; une correction
qui appauvrit fait disparaître.

### `deployment-secrets` — une phrase retirée, quatre propositions conservées

Retiré : « Cette leçon t'apprend à gérer secrets et configuration proprement (hors du code, par
environnement) et à déployer sans fuiter — l'erreur qui coûte le plus cher évitée. »

La section **Objectif**, qui suit immédiatement, porte : « hors du code, par environnement,
jamais dans Git », « savoir déployer une application simple sans fuiter », « l'erreur qui coûte
le plus cher ». **Les quatre propositions y sont, à une ligne d'intervalle.** Rien de perdu.

### `resilience-patterns` — une liste retirée, la même liste conservée en plus complet

Retiré : « Cette leçon présente les patterns qui contiennent les pannes : timeout, retry,
circuit breaker, backpressure, dégradation gracieuse, redondance. »

L'**Objectif**, deux lignes plus bas, énumère les six mêmes patterns **et trois de plus** —
rate limiting, load shedding, failover. La liste est donnée une fois au lieu de deux, et c'est
la version longue qui reste.

### `monitoring-production` — la seule suppression qui méritait une vérification sérieuse

C'est la seule des six où une phrase de contenu, et non une phrase d'annonce, disparaît : « Il
te faut détecter qu'un système va mal AVANT eux : des jauges qui mesurent en continu, des
voyants qui s'allument quand quelque chose sort de la normale — et, pour l'IA, surveiller aussi
la qualité, les coûts et la dérive. » L'objectif est réécrit dans le même mouvement.

Contrôle proposition par proposition :

| proposition de l'ancienne rédaction | où elle est maintenant |
|---|---|
| détecter avant les utilisateurs | ouverture : « Découvrir les pannes PAR les utilisateurs, c'est déjà avoir perdu » |
| des jauges qui mesurent en continu | objectif : « les quatre signaux qui méritent une jauge » |
| qualité, coûts, dérive pour l'IA | objectif : « ce qui est spécifique à l'IA (qualité, coûts, dérive) » |

**Les trois subsistent.** Et l'ouverture gagne ce qui lui manquait : le piège qui suit
immédiatement la prise de conscience — on branche des alertes partout, elles sonnent trente
fois par semaine pour rien, plus personne ne les lit — donc la vraie difficulté, **décider ce
qui mérite de réveiller quelqu'un**, qui est le sujet réel de la leçon.

### `async-messaging-queues` — une référence morte remplacée, et la vérification qui va avec

Le texte citait un exercice `dlq-duplicate` **qui n'existe pas**, en lui attribuant deux
capacités : « compter les effets réels sous re-livraison » et « router vers DLQ ». Le CP9 l'a
remplacé par `dlq-routing`.

La correction n'est pas prise pour argent comptant : les deux énoncés d'exercice ont été lus.

- `data/exercises/dlq-routing.json` : « si le message a déjà atteint `maxAttempts` tentatives
  échouées → `dlq` ; sinon → `retry` ». Le texte dit désormais « router vers la dead letter
  queue **après N échecs** » — exact.
- La capacité « compter les effets réels sous re-livraison » a été **rattachée** à
  `queue-idempotent-consumer`, dont l'énoncé réel est « additionne `amount` UNE SEULE FOIS par
  `id` ». Exact aussi.

**Aucune notion n'a été perdue dans le remplacement** : elle a changé de porteur, et le nouveau
porteur fait bien ce qu'on lui attribue. C'était le risque propre à une correction de référence
morte — supprimer la citation en emportant ce qu'elle promettait — et il ne s'est pas réalisé.

### `linux-resources-io` — un gain réel, et un défaut qui reste

Le résumé en quatre ressources est remplacé par une **table de diagnostic** : chaque saturation
reçoit sa signature reconnaissable. CPU, le load monte et le disque ne bouge pas. Mémoire, la
machine ne se dégrade pas progressivement, **elle bascule**. Disque, le processeur est inactif
et pourtant rien n'avance (état `D`). Descripteurs, tout est au repos et les nouvelles
connexions échouent. Le lecteur repart avec de quoi trancher, pas avec une liste à retenir.

**Et pourtant TRANSFERT reste à 0,75.** C'est le résultat le plus utile de ce checkpoint, donc
il est écrit en clair : le défaut relevé au CP5 était l'absence de **condition sous laquelle le
principe cesse de valoir**, et la correction du CP2 ne l'a pas comblée. La phrase ajoutée — « le
chiffre qui les sépare est toujours disponible avant qu'on ait conclu » — affirme une
disponibilité ; elle n'énonce pas une limite.

Ce n'est pas un reproche adressé au CP2 : le CP2 traitait les redites et les ouvertures, pas les
écarts de transfert, et il n'avait aucune raison de viser celui-là. **C'est la démonstration
qu'un axe mesuré bas au CP5 le reste tant qu'aucun travail ne le vise**, et donc que les scores
de ce protocole ne bougent pas tout seuls parce qu'on a travaillé ailleurs.

### `cloud-azure-core` — un gain d'ouverture, et une note volontairement non remontée

L'ouverture ne se contente plus d'annoncer un problème de vocabulaire. Elle nomme le risque
réel : deux services qui se ressemblent peuvent avoir des **frontières de sécurité
différentes**, si bien qu'une architecture traduite mot à mot depuis AWS peut être fonctionnelle
et pourtant mal cloisonnée. C'est exactement ce que l'exemple guidé démontre ensuite avec
l'héritage de portée — l'ouverture annonce désormais le contenu au lieu de l'annoncer à côté.

**TRANSFERT reste néanmoins à 0,75**, et la raison doit être dite parce qu'elle est la seule
tentation de ce checkpoint. La condition de validité exigée par le barème existe bel et bien
dans cette leçon (« Quand la réponse changerait » — trois personnes contre trois cents), mais
elle y était **déjà au CP5**, et la correction du CP2 n'a pas touché cet endroit. Remonter la
note ici corrigerait mon jugement du premier passage ; cela ne mesurerait aucun changement du
texte. **Un second passage n'est pas une session de rattrapage pour le premier.**

---

## 4. Les cinq axes, publiés séparément (règle L5)

| axe | AVANT | APRÈS | écart |
|---|---|---|---|
| RAPPEL | 1,000 | **1,000** | 0 |
| EXPLICATION | 1,000 | **1,000** | 0 |
| APPLICATION | 1,000 | **1,000** | 0 |
| MISCONCEPTION | 1,000 | **1,000** | 0 |
| TRANSFERT | 0,969 | **0,969** | 0 |
| PRE-TEST | 0,842 | **NON REJOUABLE** | — |
| `TEXT_SCORE` (barème V71) | 4,940 | **non rejoué** | — |
| `DELAYED_RECALL` | NOT MEASURED | **NOT MEASURED** | — |

**Aucune baisse sur aucun axe, sur aucune des six leçons modifiées.** C'est la seule chose que
ce tableau établit.

Les trois leçons sous le plafond restent les trois mêmes — `ci-cd-pipeline-anatomy` (non
modifiée), `cloud-azure-core`, `linux-resources-io` — toutes sur TRANSFERT, toutes pour la même
raison : un principe qui se transpose sans que la leçon dise où il cesse de valoir.

---

## 5. Les seuils L1 → L9

| seuil | exigé | mesuré | état |
|---|---|---|---|
| **L1** | protocole gelé avant le premier passage | `V72-SLV-PROTOCOL.md`, committé au CP4 | **atteint** |
| **L2** | échantillon de 24, graine publiée avant | graine 20260909, `cp5-echantillon.mjs` | **atteint** |
| **L3** | 24 leçons passées AVANT **et** APRÈS | 24 / 24 | **atteint** |
| **L4** | restitution sans accès au texte (S1) | attesté ; 18 reports déclarés comme tels | **atteint** |
| **L5** | cinq axes séparés, jamais fusionnés | aucune moyenne unique publiée | **atteint** |
| **L6** | cas « texte fort / restitution faible » analysés un par un | **0 cas**, donc 0 non analysé | **atteint** |
| **L7** | APPLICATION moyen ≥ 0,70 | **1,000** | **atteint** |
| **L8** | TRANSFERT moyen ≥ 0,55 | **0,969** | **atteint** |
| **L9** | leçons dont les 5 axes sont < 0,50 | **0** | **atteint** |

**L1 → L9 sont tous atteints. Le verdict `SIMULATED_LEARNING_VALIDATION_READY` est donc dû par
la lettre du contrat — et il ne doit pas être lu comme une validation pédagogique.** Le CP5
avait pré-écrit l'obligation, elle est reprise ici et devra être tenue au CP15 :

> `SIMULATED_LEARNING_VALIDATION` ne pourra pas valoir `READY` sur la seule foi des seuils
> L7–L9. Le rapport final devra publier le pré-test de 0,842 à côté du verdict, et dire que
> l'instrument n'a pas discriminé.

L7 et L8 ont été franchis **au premier passage, sans effort, avec des marges de 0,30 et 0,42**.
Un instrument dont le pré-test est à 0,842 ne pouvait pas les manquer. Ce sont des garde-fous
contre un effondrement, pas des mesures de qualité.

---

## 6. Ce que le CP13 permet de dire, et dans quels mots

Le §6 du protocole fixe le vocabulaire autorisé. Appliqué :

- **Autorisé** : « aucune des corrections de V72 n'a retiré, dans ces six leçons, une notion qui
  ne se retrouve pas ailleurs dans la même leçon — vérifié proposition par proposition ».
- **Autorisé** : « le texte de ces 24 leçons contient de quoi répondre sans y revenir ».
- **Interdit et non écrit** : « les apprenants apprennent », « la pédagogie est validée »,
  « V72 a amélioré les leçons » — le second passage ne mesure aucune amélioration, il n'était
  pas construit pour ça et le CP5 l'avait dit.

**`REAL_HUMAN_LEARNING_EVIDENCE` reste `NOT YET MEASURED`.** Aucun humain n'a suivi le
protocole.

---

## 7. Ce que le CP13 a modifié

**Aucun fichier du corpus.** Le passage APRÈS est une mesure, pas une intervention. Les deux
artefacts produits sont `docs/v72/V72-SLV-AFTER.json` et le présent rapport.
