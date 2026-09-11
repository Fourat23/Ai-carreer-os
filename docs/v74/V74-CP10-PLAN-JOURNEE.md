# V74 · CP10 — PLAN DE JOURNÉE ET ARBITRAGE DU BUDGET

> **Interdictions du brief tenues ici :** ne pas modifier les 365 journées pour satisfaire une
> sonde · ne pas supprimer une compétence difficile · ne pas augmenter le nombre de révisions
> pour faire monter un score (**G12**).

---

## 1. La question

Le CP4 sait *quoi* réactiver et *en combien de minutes*. Il ignore une chose : **combien de
minutes la journée peut réellement lui donner.**

Ajouter 20 minutes de rappel à une journée qui pèse déjà 331 minutes, c'est la façon la plus
simple de faire monter tous les compteurs de révision sans que personne ne révise mieux. C'est
nommément le contournement **G12**, et c'était le comportement par défaut jusqu'ici.

---

## 2. Trois mesures, et chacune a tué une solution évidente

### 2.1 — 44 journées dépassent déjà le budget, en six longues séries

Charge héritée de V73, **non renégociée** : `BALANCED 315 · UNDERLOADED 6 · HEAVY 44`, budget
`[240, 300]` min. Les 44 journées HEAVY pèsent de **302 à 341 minutes**.

Elles ne sont pas dispersées : **six séries de six journées consécutives** (j218-223, j225-230,
j232-237, j239-244, j246-251, j309-314), plus sept isolées et une paire. Pendant ces semaines,
*chaque* journée de travail est au-dessus du budget.

### 2.2 — La journée de revue ne peut PAS servir de réservoir *(hypothèse réfutée)*

C'était mon hypothèse de départ, et elle paraissait solide : la revue médiane pèse 188 minutes,
donc ~112 minutes de marge sous le plafond. **La mesure l'a réfutée.**

Les revues qui suivent précisément les séries chargées pèsent **293** (j224) et **295** (j231)
minutes — soit **7 et 5 minutes** de marge. La **marge minimale sur les 52 revues est de
5 minutes**.

*La slack que je comptais utiliser n'existe pas là où j'en avais besoin.*

### 2.3 — Mais au grain de la SEMAINE, le problème change de nature

| | |
|---|---|
| plafond hebdomadaire (7 × 300) | **2100 min** |
| semaines dépassant ce plafond | **3 / 52** — S32 (+181), S33 (+125), S34 (+98) |
| marge hebdomadaire médiane | **693 min** |
| journées HEAVY situées dans une semaine **globalement tenable** | **26 / 44** |

**Conclusion qui commande tout le module** : 26 des 44 journées surchargées appartiennent à des
semaines qui, prises entières, tiennent largement dans le budget. **Le défaut dominant est une
RÉPARTITION inégale à l'intérieur de la semaine, pas un excès de programme.** Un arbitre peut
corriger une répartition sans toucher au curriculum.

Les 3 semaines réellement excédentaires, elles, **sont déclarées telles quelles** — voir §6.

---

## 3. Les règles

1. **La réactivation ne prend que ce que la journée laisse.** On raisonne sur la borne **haute**
   de la charge, jamais sur la basse : un budget calculé sur l'hypothèse optimiste déborderait
   une fois sur deux, et *un apprenant qui déborde systématiquement cesse de faire ses rappels* —
   ce qui détruirait la rétention plus sûrement qu'une séance sautée.
2. **Une journée déjà au-dessus du budget reçoit ZÉRO minute.** Pas un plancher symbolique de
   5 minutes : une journée à 331 minutes n'a pas 20 minutes cachées quelque part. Et à zéro
   minute, **le scheduler n'est même pas convoqué** — on ne propose pas « une petite révision
   quand même ».
3. **Ce qu'une journée chargée ne prend pas est reporté DANS LA SEMAINE**, sur les journées qui
   ont de la marge, avec un rattrapage plafonné à **20 min/jour** — au-delà, une séance de
   rappel devient une punition.
4. **Le report ne traverse pas la semaine.** Ce qui n'a pas été placé est **déclaré perdu**, pas
   empilé. Le CP8 a déjà montré ce que produit une dette qui grossit.
5. **Le signal de ralentissement PROPOSE, il ne décide pas.** Sauter une journée de programme
   appartient à la personne, jamais au planificateur.

Ce module **n'est pas un cinquième moteur** : il ne définit ni échéance, ni priorité, ni forme,
ni échelle. Il **alloue des minutes** et délègue au scheduler du CP4 — la même position
d'arbitre-au-dessus que le §4 du contrat gelé assigne. C11 reste satisfaite.

---

## 4. BEFORE / AFTER

| | BEFORE *(20 min fixes, charge ignorée)* | AFTER |
|---|---|---|
| journées dépassant le budget **une fois la réactivation ajoutée** | **54 / 365 (15 %)** | **44 / 365 (12 %)** |
| minutes cumulées au-dessus du budget, **du fait du plan** | **1798** | **0** |
| journées sans aucune réactivation | 0 | **44 / 365 (12 %)** |
| minutes de réactivation placées sur l'année | 7300 | **6545** |
| minutes **non placées**, déclarées | — | **735** |

Le chiffre qui compte est la deuxième ligne. **Les 44 journées encore hors budget en AFTER le
sont par le seul fait du curriculum ; le plan n'y ajoute plus une minute.** Tout le dépassement
que le planificateur causait lui-même — 1798 minutes sur l'année — a disparu.

---

## 5. Le coût, publié plutôt que dissimulé

**44 journées sur 365 ne reçoivent aucune réactivation**, et surtout : **six séries de six
journées consécutives sans le moindre rappel programmé.**

| longueur de la série | nombre |
|---|---|
| 1 jour | 7 |
| 2 jours | 1 |
| **6 jours** | **6** |

**735 minutes de réactivation ne sont pas placées sur l'année** — 10 % du volume visé.

Une atténuation réelle, qui ne doit pas servir d'excuse : une journée HEAVY est lourde *parce
qu'elle contient beaucoup de pratique*, et une tentative d'exercice est un `MEANINGFUL_CONTACT`
au sens M2/M4 du contrat. Ces six jours ne sont donc pas des jours sans mémoire. **Mais ils sont
des jours sans RETRIEVAL sur les notions ANCIENNES** — exactement ce que le moteur existe pour
produire. L'atténuation ne compense pas, elle nuance.

**La cause est la dette D9**, inscrite : les 44 journées HEAVY appartiennent au curriculum, et
V73 a explicitement choisi de ne pas les corriger. Les corriger ici voudrait dire retirer du
contenu pour qu'une métrique de rétention verdisse — précisément ce que le brief interdit.

---

## 6. Les trois semaines excédentaires sont dites, pas réparées

S32, S33 et S34 dépassent le plafond hebdomadaire de **181, 125 et 98 minutes**. Aucune règle
d'allocation ne les sauve : il n'y a pas de marge à trouver dans la semaine, puisque c'est la
semaine entière qui déborde.

Le plan les marque `surchargee: true` avec leur excédent exact, **et laisse les 7 journées en
place**. Un test vérifie que rien n'est supprimé.

---

## 7. Le signal de ralentissement, et pourquoi il ne décide pas

Le CP8 a établi que chez un apprenant qui échoue une fois sur deux, l'arriéré croît
**linéairement** et que **tripler le budget ne le divise pas par trois** (63 → 53 → 43 → 48) :
à 50 % d'échec, chaque notion servie revient le lendemain, donc *servir plus crée mécaniquement
plus de retours*. Aucune règle d'ordonnancement ne corrige cela — le CP8 l'a épuisé.

La seule réponse est d'agir sur l'**entrée**. Mais le module ne saute aucune journée : il dit ce
qu'il observe et propose.

> « 40 notions attendent d'être revues, et ce nombre augmente. Tu avances plus vite que tu ne
> consolides. »
> « Consacrer une journée à consolider plutôt qu'à avancer ferait baisser ce nombre. **C'est toi
> qui décides — le programme ne saute rien tout seul.** »

Le seuil (`SEUIL_ALERTE_ARRIERE = 25`) est **déclaré, pas mesuré** : la simulation du CP8 montre
qu'un apprenant qui retient reste sous 11 en permanence et qu'un apprenant en difficulté franchit
25 vers le jour 90 sans redescendre. C'est un ordre de grandeur. Un test vérifie qu'**aucun
message n'expose de score chiffré** (§9 du contrat), et un autre qu'un arriéré **stable** ne
déclenche pas la proposition de ralentir — seul un arriéré qui **croît** le fait.

---

## 8. ANOMALIE n° 11 — ma propre mesure minimisait sa perte d'un facteur six

Les quatorze tests passaient du premier coup. Sur quatre mutations, **une ne faisait rougir
personne** : supprimer le plafond de rattrapage `REPORT_MAX_PAR_JOUR` ne changeait rien.

En traçant, la raison est apparue : sur une journée surchargée, le code écrivait `reste: cible`
— **il écrasait le report entrant au lieu de l'accumuler**. Six journées à 331 minutes se
suivaient donc ainsi :

```
j1 report_entrant=0  → reste=20      j4 report_entrant=20 → reste=20
j2 report_entrant=20 → reste=20      j5 report_entrant=20 → reste=20
j3 report_entrant=20 → reste=20      j6 report_entrant=20 → reste=20
```

Deux conséquences, l'une bénigne et l'autre grave :

- **le plafond était du code mort** : le report ne dépassant jamais la cible, `Math.min(report,
  20)` ne bornait rien. Mon test « le report est plafonné » gardait une propriété inatteignable ;
- **la semaine déclarait 20 minutes non placées alors que 120 avaient été sautées.** Sur
  l'année, ma mesure annonçait **115 minutes perdues ; le chiffre réel est 735.**

**L'erreur allait dans le sens qui m'arrangeait** — elle faisait paraître le coût de mon propre
arbitrage six fois plus petit qu'il n'est. C'est le troisième cas de ce sprint (avec les
anomalies n° 7 et n° 9), et c'est le motif à retenir : *une erreur qui flatte le résultat est
celle qui a le moins de chances d'être cherchée.*

Corrigé : le report **accumule** (`report + cible`), et le rattrapage non consommé reste dû
(`+ (report − rattrapage)`) — sans quoi un plafond effacerait silencieusement les minutes qu'il
refuse. **Un plafond doit borner le service, pas la dette.** La mutation rougit désormais.

---

## 9. Les quatre mutations vues rougir

| mutation | tests rouges |
|---|---|
| une journée surchargée reçoit quand même 20 min (**G12**) | **4** |
| le rattrapage n'est plus plafonné | **1** *(après correction de l'anomalie n° 11 ; 0 avant)* |
| le signal reporte une journée **tout seul** | **2** |
| charge inconnue traitée comme journée pleine (**G9**) | **1** |

Toutes restaurées : **14 / 14** sur le fichier.

---

## 10. Fichiers

**Créés** : `lib/daily-plan.mjs`, `scripts/v74/cp10-charge.mjs`,
`tests/v74-daily-plan.test.mjs` (14 tests), ce document.
