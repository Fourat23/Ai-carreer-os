# V77 · CP10 — LE DOUBLE COMPTAGE INTER-SURFACES : 42 · 14 · **0**

> Le défaut `D1` est clos **par conséquence**, pas par une règle dédiée. Et le
> « 14 » du CP0 se retrouve — on sait enfin ce qu'il désignait.

---

## 1. Pourquoi le chiffre du CP0 n'a pas été recopié

Le brief l'interdit, et il a raison deux fois :

1. le chiffre du CP0 datait d'**avant** les CP5 et CP9, qui ont changé ce qu'une
   preuve de mission **vaut**. Le recopier mesurerait un produit qui n'existe
   plus ;
2. un chiffre recopié n'est pas une mesure — c'est une citation.

## 2. Trois nombres, et les confondre est l'erreur

```
42  paires structurelles (livrable `auto` ↔ exercice)
14  paires qui CHEVAUCHENT une compétence canonique
 0  double comptage EFFECTIF aujourd'hui
```

**Les 42** : chaque mission porte exactement un livrable de mode `auto` adossé à
un `exerciseRef`. Résoudre cet exercice valide automatiquement le livrable
(`reconcileAutoDeliverables`) et contribue donc à terminer la mission. C'est la
structure qui produit le défaut.

**Les 14** : parmi ces paires, celles où la compétence canonique de la mission et
celle de l'exercice se recoupent. **C'est le « 14 » du CP0** — et il désignait un
chevauchement STRUCTUREL, pas un double crédit. Les deux se ressemblaient tant
qu'une preuve de mission qualifiait.

**Le 0** : mesuré en construisant les deux preuves comme le produit les
construit, puis en cherchant une compétence créditée deux fois. Il n'y en a
aucune, parce que le CP5 a retiré `passed` des missions et le CP9 a exigé
`VALIDATED` pour qualifier.

## 3. Le cas `A13` du CP0, rejoué tel quel

La sonde décisive du CP0 : un exercice résolu + un document délibérément faux +
un clic d'auto-validation produisaient **deux preuves qualifiantes portant la
même compétence canonique**.

```
preuve exercice : VALIDATED   qualifie = true
preuve mission  : DECLARED    qualifie = false
jsts            : preuves = 2 · qualifiantes = 1 → demonstrated
```

**Les deux preuves existent toujours** — rien n'a été supprimé, et c'est
important : la mission a bien eu lieu, son travail est visible et exportable. Ce
qui a changé, c'est qu'**une seule démontre**.

## 4. Ce que le checkpoint n'a PAS ajouté

**Aucune règle de déduplication.** Il n'y a rien à dédupliquer : le compte est
zéro. Ajouter une règle là où aucun cas ne l'exige serait de la doctrine, pas de
la précision — et cette règle, jamais exercée, dériverait en silence.

## 5. Ce qu'il a ajouté : la filiation

La **dépendance** reste réelle : la mission a été terminée en partie grâce à un
exercice déjà compté ailleurs. `derivedFrom` l'écrit sur la preuve :

```
mission cicd-blocked-delivery  →  derivedFrom: ["exercise:cicd-env-promotion"]
```

**Les 42 missions portent leur filiation ; aucune n'est muette** (vérifié une par
une). Ce n'est pas une règle de déduplication : c'est la donnée dont une telle
règle aurait besoin **si** elle devenait nécessaire, au lieu de la deviner à ce
moment-là.

### 5.1 `derivedFrom` n'entre pas dans la clé métier

Une filiation décrit une **origine** ; elle ne change pas l'identité de la
preuve. Si elle entrait dans la clé, modifier un `exerciseRef` créerait une
SECONDE preuve pour la même mission — un double comptage fabriqué par la
correction du double comptage. Un test le garde.

Absente d'une preuve ancienne, elle vaut liste vide : « filiation inconnue »,
jamais « aucune filiation ».

## 6. Rejeu et idempotence

| propriété | résultat |
|---|---|
| terminer deux fois une mission | **1** preuve, pas deux |
| rejouer la preuve d'exercice | refusée par la clé métier (`added: false`) |
| projection selon l'ordre des preuves | **identique** dans les deux sens |

## 7. La garde qui compte pour la suite

Le défaut étant clos par conséquence, il peut se rouvrir par conséquence. Un test
dit **exactement** ce qui le rouvrirait :

> si une preuve de mission redevenait qualifiante, **14 doubles comptages**
> reviendraient — et voici la ligne qui les tient fermés aujourd'hui :
> `isQualifying(preuveDeMission) === false`.

Personne n'aura à le redécouvrir en lisant des données faussées.

## 8. Vérifications

| vérification | résultat |
|---|---|
| `tests/v77-double-comptage.test.mjs` | **12 / 12** |
| `npm test` | **2142 / 2142** |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **49 portes, 0 violation** |
| mesure canonique | **42 · 14 · 0**, publiée dans `docs/v77/cp10-double-comptage.json` |

## 9. Ce qui reste incertain

**Le zéro dépend d'une décision, pas d'une structure.** Les 42 paires existent
toujours dans le corpus ; c'est la règle de qualification qui les rend inoffensives.
C'est plus fragile qu'un invariant structurel, et le dire vaut mieux que de
présenter le zéro comme définitif.

**Le double comptage mesuré ici est celui que le CP0 avait trouvé.** Il en existe
peut-être d'autres formes — deux exercices distincts pratiquant le même concept,
par exemple — que ni le CP0 ni le CP10 n'ont cherchées. Le CP13 traversera des
chaînes complètes ; ce qu'il ne trouvera pas restera inconnu, et non « absent ».
