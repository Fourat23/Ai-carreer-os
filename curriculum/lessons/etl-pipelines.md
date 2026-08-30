<!-- keep -->
# Leçon — Pipelines ETL

## 🌍 Le problème d'abord
Chaque matin, il faut récupérer les ventes de la veille depuis trois sources, les nettoyer, les
recouper, et les charger dans la base d'analyse. Le faire à la main, c'est oublier une étape un
jour sur deux, tout relancer de zéro au moindre plantage, et ne jamais savoir si le résultat
est complet. Il te faut un PIPELINE : une chaîne d'étapes ordonnée (extraire → transformer →
charger), REJOUABLE sans tout casser (idempotente), et résistante aux échecs partiels. C'est la
colonne vertébrale de tout système data — et exactement le squelette d'un pipeline d'ingestion
RAG (charger → découper → indexer). Cette leçon te montre comment le construire proprement.

## 🎯 Objectif
Savoir construire un pipeline de données Extract-Transform-Load robuste, REJOUABLE (idempotent) et résistant aux échecs partiels. C'est la colonne vertébrale de tout système data et le squelette d'un pipeline d'ingestion RAG.

## 🧠 Modèle mental
Un pipeline ETL, c'est **une chaîne de montage** : la matière première (source) entre, passe par des postes (extract → transform → load), et ressort en produit fini (données exploitables). Comme toute chaîne, elle doit gérer les pannes sans tout casser.

## 🧩 Prérequis
Tu dois savoir manipuler des données tabulaires (`/doc/lessons/pandas-data-wrangling`) et
connaître les gestes de nettoyage/qualité (`/doc/lessons/data-cleaning-quality`), car la phase
« transform » les applique. Les notions de reprise sur échec, d'idempotence et de gestion
d'erreurs (`/doc/lessons/error-handling`) sont réutilisées ici pour rendre le pipeline robuste.
Aucun orchestrateur particulier n'est supposé : on raisonne sur la structure du pipeline.

## 📖 Explication complète

**Trois étapes, séparées pour une raison précise.** *Extract* récupère depuis la source,
*Transform* nettoie et enrichit, *Load* écrit dans la destination. Le découpage n'est pas
décoratif : il isole la seule partie qu'on peut tester sans rien brancher. Extraire et charger
touchent le monde extérieur — un fichier, une API, une base — et ne se testent qu'avec ce monde
disponible. La transformation, elle, peut être écrite en **fonctions pures** : mêmes entrées,
mêmes sorties, aucun effet de bord. On lui donne dix lignes en mémoire, on vérifie les dix
lignes qui sortent. C'est là que vit toute la logique métier, et c'est la seule partie qu'on
puisse réellement mettre sous tests.

**L'idempotence, et pourquoi c'est LA propriété du pipeline.** Un traitement est idempotent
quand l'exécuter deux fois donne le même état final qu'une seule. Ce n'est pas un raffinement :
un pipeline se relance. Il se relance parce que le réseau a coupé, parce que la source est
arrivée en retard, parce qu'on corrige un bug et qu'on rejoue hier. Un `INSERT` simple
duplique à chaque relance ; un **upsert** — insérer si absent, mettre à jour sinon, sur une
clé qui identifie la ligne — donne le même résultat quel que soit le nombre d'exécutions. Sans
cette propriété, la seule façon de relancer sans danger est de vider la table d'abord, ce qui
interdit tout traitement incrémental.

**L'échec partiel, la panne à laquelle personne ne pense.** Le chargement écrit 40 000 lignes
sur 50 000, puis la connexion tombe. Sans précaution, la base contient un état qui n'a jamais
existé : ni l'ancien, ni le nouveau. Le prochain calcul lira ces données mixtes et rendra un
chiffre faux, sans le moindre message d'erreur. Une **transaction** répond exactement à cela :
les écritures ne deviennent visibles qu'à la validation finale, et une interruption ramène la
base à son état d'avant (**rollback**). C'est du tout ou rien, et « rien » est un état correct
— contrairement à « la moitié ».

**Les journaux, qui ne servent qu'après coup.** On écrit à chaque étape ce qui est entré, ce
qui est sorti, et combien de temps cela a pris. Cela ne sert à rien tant que tout marche, et
c'est la seule chose qui compte le jour où un traitement nocturne a échoué et où personne n'a
regardé l'écran.

## 🔎 Décomposition
- « Quelle partie puis-je tester ? » → la transformation, si elle est pure.
- « Puis-je relancer sans danger ? » → seulement si le chargement est idempotent.
- « Que se passe-t-il si ça coupe au milieu ? » → sans transaction, un état qui n'existe pas.
- « Pourquoi ce run a-t-il échoué cette nuit ? » → les journaux, ou rien.

## 🔧 Exemple simple
Un pipeline nocturne : lire le CSV du jour → nettoyer → insérer en base, en évitant de réinsérer les lignes déjà présentes (idempotence par clé).

## 🧭 Exemple guidé — le pipeline qu'on relance, et ce qu'il devient

Un pipeline de données a une propriété que peu de code partage : **il sera relancé**. Parce
qu'il a échoué, parce que la source a été corrigée, parce que quelqu'un a lancé deux fois la
tâche planifiée, ou simplement parce qu'on redéploie.

La question de conception n'est donc pas « fait-il le bon calcul ? » — c'est **« que se
passe-t-il à la deuxième exécution ? »**. Mesurons-le.

> Les résultats sont **exécutés** par `scripts/v70-verifications/etl-idempotence.mjs` : 1 000
> commandes, somme des montants **149 500**, chargées dans une vraie base SQLite.

### A. Le chargement le plus simple

```python
for ligne in lignes:
    db.execute("INSERT INTO commandes VALUES (?, ?, ?)", ligne)
```

```
après 1 exécution  : 1000 lignes, somme 149 500
après 2 exécutions : 2000 lignes, somme 299 000   ← DOUBLONS
```

Le chiffre d'affaires a **doublé**. Pas un peu : exactement deux fois. Et rien n'a échoué,
aucune erreur n'a été levée, la seconde exécution s'est terminée avec succès.

C'est le défaut le plus coûteux du domaine, parce que le rapport produit est **plausible**.
Personne ne remarque un chiffre d'affaires doublé le jour même ; on le découvre trois semaines
plus tard, quand une réconciliation comptable ne tombe pas juste.

### B. La correction : une clé naturelle et un `UPSERT`

Une **clé naturelle** est un identifiant qui vient des données elles-mêmes — ici la référence
de commande `CMD-1234` — par opposition à un identifiant fabriqué à l'insertion.

```sql
INSERT INTO commandes (reference, client, montant) VALUES (?,?,?)
ON CONFLICT(reference) DO UPDATE SET client = excluded.client, montant = excluded.montant
```

```
après 1 exécution  : 1000 lignes, somme 149 500
après 2 exécutions : 1000 lignes, somme 149 500   ← identique
```

Deux exécutions, un seul résultat. C'est la définition de l'**idempotence** : relancer ne
change rien. Un pipeline idempotent peut être relancé sans réfléchir — par un opérateur à 3
heures du matin, par un ordonnanceur qui a hoqueté, par toi-même en cherchant autre chose.

Le point de conception à retenir : **l'idempotence n'est pas une option qu'on ajoute, c'est une
conséquence de la clé.** Sans identifiant issu des données, aucun mécanisme ne peut savoir
qu'une ligne a déjà été chargée. La première question d'un pipeline est donc : *qu'est-ce qui
identifie une ligne, dans la source ?*

### C. L'interruption au milieu — sans transaction

Coupons le chargement à la ligne 617 sur 1 000, sans transaction :

```
erreur : PANNE au milieu du chargement
base après la panne : 617 lignes, somme 96 006   ← ÉTAT PARTIEL
```

La base contient **617 commandes sur 1 000**. Elle n'est ni vide, ni complète : elle est dans
un état qui n'a jamais existé dans la source, et qui n'a aucun sens métier.

Le danger n'est pas la panne — c'est ce qui se passe ensuite. Un tableau de bord qui interroge
cette table affiche **96 006 € au lieu de 149 500 €**, soit 36 % de moins, sans le moindre
avertissement. Le pipeline a échoué bruyamment dans les journaux, et il a produit une donnée
silencieusement fausse.

### D. La même interruption, dans une transaction

```
erreur : PANNE au milieu du chargement
base après la panne : 0 lignes   ← rien à moitié écrit
```

Tout ou rien. La base reste dans son état précédent, cohérent, et l'on relance quand la cause
est corrigée.

C'est la seconde propriété fondamentale d'un chargement : **atomique**. Avec l'idempotence, ce
sont les deux seules garanties dont un pipeline a réellement besoin.

### Ce que le cas C apprend malgré tout

Une nuance mesurée mérite d'être publiée. Dans le cas C — interruption sans transaction — nous
avons relancé le pipeline :

```
après relance : 1000 lignes, somme 149 500   ← rattrapé grâce à l'UPSERT
```

L'idempotence a **réparé** l'état partiel. Les 617 lignes déjà présentes ont été mises à jour,
les 383 manquantes insérées.

Deux enseignements, et le second est le plus utile :

- l'idempotence n'est pas seulement une protection contre les doublons : c'est un **mécanisme
  de reprise**. Un pipeline idempotent se répare en se relançant ;
- elle ne dispense pas de la transaction, parce qu'elle ne protège que **si l'on relance**.
  Entre la panne et la relance — dix minutes, une nuit, un week-end —, la base affiche 96 006 €
  à qui la consulte.

La combinaison correcte est donc bien **les deux** : la transaction protège l'intervalle,
l'idempotence protège la relance.

### Le découpage en trois fonctions, et sa raison

```python
def extract(source):          # E/S : lit, ne transforme rien
    ...

def transform(brut):          # PUR : aucune E/S, aucune date du jour, aucun aléa
    ...

def load(propre, db):         # E/S : transaction + upsert
    with db.transaction():
        for ligne in propre:
            db.upsert(ligne)

def run(source, db):
    load(transform(extract(source)), db)
```

Ce n'est pas un rangement esthétique : **chaque étage a une propriété différente**, et la
séparation existe pour les préserver.

| Étage | Propriété | Ce qu'elle permet |
|---|---|---|
| `extract` | isole les entrées/sorties de lecture | remplacer un CSV par une API sans toucher au reste |
| `transform` | **pur** | se tester sans fichier ni base, avec des données écrites à la main |
| `load` | atomique et idempotent | relancer sans crainte |

La pureté de `transform` est celle qu'on perd le plus facilement, souvent par une ligne
anodine : `datetime.now()` au milieu d'une transformation. La fonction cesse alors d'être
reproductible — deux exécutions sur les mêmes données ne donnent plus le même résultat, et le
test échoue le lendemain sans que rien n'ait changé. La date d'exécution est une **entrée** :
elle se passe en paramètre.

### La liste de contrôle d'un pipeline

Quatre questions, dans cet ordre, avant de mettre un pipeline en production :

1. **Qu'est-ce qui identifie une ligne dans la source ?** — sans réponse, pas d'idempotence
   possible.
2. **Que se passe-t-il si je relance ?** — la réponse doit être « rien de plus ».
3. **Que se passe-t-il si je m'arrête au milieu ?** — la réponse doit être « rien n'a été
   écrit », ou « un état partiel, et voici qui en est averti ».
4. **Le `transform` est-il rejouable à l'identique ?** — pas d'horloge, pas d'aléa, pas de
   lecture cachée.

Le point 3 mérite sa formulation alternative, car elle est parfois la bonne : sur des volumes
qui ne tiennent pas dans une transaction unique, on charge **par lots**, chacun transactionnel,
et l'on enregistre la progression. L'état partiel est alors assumé, borné et **connu** — ce qui
est très différent d'un état partiel subi.

## 🤖 Exemple appliqué (IA / data / architecture)
L'**ingestion d'un RAG EST un ETL** : extract (lire PDF/Markdown) → transform (chunker, embedder) → load (base vectorielle). Les mêmes exigences s'appliquent : idempotence (ré-ingérer un document mis à jour sans dupliquer), résistance aux fichiers moches, logs.

## ⚠️ Erreurs fréquentes

**Le pipeline qui double les données, montré.** Il fonctionne parfaitement la première fois :

```python
# ❌ FAUX : relancer ce pipeline duplique tout ce qu'il a déjà chargé.
for ligne in lignes_transformees:
    curseur.execute(
        "INSERT INTO ventes (id_vente, client, montant) VALUES (?, ?, ?)",
        (ligne["id"], ligne["client"], ligne["montant"]),
    )
connexion.commit()
```

Premier passage : 50 000 lignes, tout va bien. Le lendemain, la source arrive en retard et on
relance : 100 000 lignes. Le total du chiffre d'affaires double. Personne ne le voit tout de
suite, parce qu'aucune erreur n'est levée et que le tableau de bord affiche simplement un très
bon mois.

```python
# ✅ JUSTE : idempotent (upsert sur la clé métier) ET tout-ou-rien.
try:
    for ligne in lignes_transformees:
        curseur.execute(
            "INSERT INTO ventes (id_vente, client, montant) VALUES (?, ?, ?) "
            "ON CONFLICT(id_vente) DO UPDATE SET client=excluded.client, montant=excluded.montant",
            (ligne["id"], ligne["client"], ligne["montant"]),
        )
    connexion.commit()          # rien n'est visible avant cette ligne
except Exception:
    connexion.rollback()        # et en cas d'échec, rien ne l'aura jamais été
    raise
```

Le test qui l'attrape tient en trois lignes : lancer le pipeline deux fois de suite sur les
mêmes données, et vérifier que le nombre de lignes en base est identique après le second
passage. Aucun pipeline ne devrait partir en production sans ce test.

Les autres :
- Mêler la transformation aux entrées/sorties : plus rien n'est testable sans base.
- Charger sans transaction : un échec au milieu laisse un état qui n'a jamais existé.
- Aucun journal : un run nocturne raté devient indiagnosticable.

## 🚫 Anti-patterns
- Le « gros script » monolithique qui fait tout dans une fonction.
- Recharger tout à chaque fois quand un incrémental suffirait.

## ✍️ Mini-exercice
Écris un pipeline `extract/transform/load` qui charge un CSV en SQLite, et prouve qu'un second run ne crée PAS de doublons.

## 🔥 Exercice plus difficile
Rends ton pipeline résistant : simule une interruption au milieu du load et vérifie que la base reste cohérente (transaction), puis qu'une relance repart proprement.

## ✅ Correction

### Prouver l'idempotence, et non l'affirmer

Le mini-exercice demande de **prouver** qu'une seconde exécution ne crée pas de doublons.
« Prouver » a ici un sens précis : produire un chiffre avant et après.

```python
def empreinte(db):
    return db.execute("SELECT COUNT(*), SUM(montant), MAX(reference) FROM commandes").fetchone()

run(source, db); avant = empreinte(db)
run(source, db); apres = empreinte(db)
assert avant == apres, f"pipeline non idempotent : {avant} → {apres}"
```

Trois valeurs plutôt qu'un simple `COUNT(*)`, et c'est délibéré : un compte identique peut
masquer un contenu différent. Si la seconde exécution écrase les montants par des valeurs
fausses, le compte ne bouge pas et la somme, si.

Cette assertion **appartient à la suite de tests**, pas à un contrôle manuel. C'est la seule
façon qu'elle survive à la prochaine modification du chargement.

### Ce qui casse l'idempotence en pratique

Un pipeline idempotent le reste rarement par accident. Les quatre causes de régression, par
ordre de fréquence :

| Cause | Symptôme |
|---|---|
| pas de clé naturelle : `id` auto-incrémenté à l'insertion | chaque exécution crée de nouvelles lignes |
| clé **incomplète** — la référence seule, alors que la source livre une ligne par jour | les jours suivants écrasent les précédents |
| `INSERT` puis `UPDATE` en deux instructions | deux exécutions simultanées créent un doublon entre les deux |
| une colonne `chargee_le = now()` dans la comparaison | la ligne « change » à chaque exécution, donc elle est réécrite chaque fois |

La deuxième ligne est la plus subtile et la plus fréquente. La question à poser est : *quelle
est la plus petite combinaison de colonnes qui identifie une ligne de façon unique dans la
source ?* Souvent ce n'est pas une colonne, c'est deux ou trois — la référence **et** la date,
la référence **et** la version.

### L'interruption : la prouver aussi

Le critère « aucune donnée à moitié écrite » se vérifie de la même façon — en provoquant la
panne :

```python
def load(propre, db, casser_apres=None):
    with db.transaction():
        for i, ligne in enumerate(propre):
            if casser_apres is not None and i == casser_apres:
                raise RuntimeError("panne simulée")
            db.upsert(ligne)

# le test
avant = empreinte(db)
with pytest.raises(RuntimeError):
    load(lignes, db, casser_apres=len(lignes) // 2)
assert empreinte(db) == avant, "état partiel écrit malgré la transaction"
```

L'assertion porte sur l'**absence** de changement, ce qui est la formulation exacte de
l'atomicité. La mesure de l'exemple guidé montre ce qui arrive sans elle : **617 lignes sur
1 000, et un total de 96 006 € au lieu de 149 500 €** — 36 % d'écart affichés sans le moindre
avertissement.

### Le `transform` pur : le test qui le prouve

```python
def test_transform_normalise_les_villes():
    entree = [{"ville": "  lyon ", "montant": "12,50"}]
    assert transform(entree) == [{"ville": "Lyon", "montant": 12.50}]
```

Trois secondes d'exécution, aucun fichier, aucune base, aucun réseau. Si écrire ce test exige
de créer un fichier temporaire ou une base de test, **le `transform` n'est pas pur** — il
contient de l'extraction ou du chargement qui aurait dû rester dans les étages voisins.

C'est le critère opérationnel de la séparation : *puis-je tester la transformation en lui
passant une liste écrite à la main ?* Si non, le découpage est à revoir, quelle que soit
l'allure des noms de fonctions.

### Les journaux : ce qu'il faut y mettre

« Ajouter des logs » ne veut rien dire tant qu'on n'a pas décidé quoi y écrire. Le minimum
utile, une ligne par exécution :

```
pipeline=commandes execution=2026-03-14T03:00Z
  extraites=1000 transformées=998 rejetées=2 chargées=998
  insérées=41 mises_à_jour=957 durée=4.2s statut=succès
```

Chaque nombre y répond à une question qu'on se posera un jour :

- **extraites ≠ transformées** : combien de lignes ont été rejetées, et pourquoi ? Deux lignes
  rejetées sur mille est normal ; deux cents signale un changement de format en amont ;
- **insérées vs mises à jour** : sur une exécution de rattrapage, presque tout doit être en
  mise à jour. Beaucoup d'insertions à la deuxième exécution est le signal d'une clé cassée ;
- **durée** : sa dérive dans le temps annonce un problème avant qu'il ne devienne une panne.

Un journal qui dit seulement « pipeline terminé » ne permet de répondre à aucune de ces
questions.

### La mauvaise solution plausible

Vider la table avant de recharger : `DELETE FROM commandes;` puis tout réinsérer.

C'est effectivement idempotent — deux exécutions donnent le même résultat — et c'est
séduisant, parce que c'est simple et que ça règle la question sans clé naturelle.

Trois problèmes, tous graves :

1. **Entre le `DELETE` et la fin du chargement, la table est vide.** Tout lecteur voit zéro
   commande. Dans une transaction, la fenêtre est réduite mais le verrou est tenu sur toute la
   table pendant la durée du chargement ;
2. **Si l'extraction échoue, on a détruit les données existantes** pour les remplacer par
   rien. La donnée d'hier valait mieux que pas de donnée ;
3. **On perd toute information dérivée** — colonnes annotées à la main, horodatages de première
   vue, liens créés depuis d'autres tables. Elles sont supprimées avec le reste.

Ce motif est acceptable pour une table de travail entièrement dérivée, reconstruite chaque nuit
et que personne ne lit pendant ce temps. Il ne l'est pas pour une table qui sert une
application. Le distinguer est exactement le type de jugement qu'on attend d'un professionnel.

### Auto-évaluation

| Vérification | Comment |
|---|---|
| idempotent | deux exécutions, empreinte identique, **testé automatiquement** |
| atomique | panne simulée au milieu, empreinte inchangée |
| `transform` pur | testé avec une liste écrite à la main, sans E/S |
| clé naturelle explicite | tu peux nommer les colonnes qui identifient une ligne |
| journal exploitable | il contient extraites / rejetées / insérées / mises à jour / durée |
| relance sûre | tu relancerais le pipeline en production sans demander l'avis de personne |

La dernière ligne est le vrai critère. Un pipeline qu'on hésite à relancer est un pipeline dont
on ne connaît pas les garanties — et cette hésitation coûte des heures à chaque incident, au
pire moment.

### Généralisation

Idempotence et atomicité ne sont pas des notions d'ETL : ce sont les deux propriétés que tout
traitement rejouable doit posséder. Une migration de base, un déploiement, un script de
correction, un consommateur de file de messages, un appel d'API de paiement — tous se posent
les mêmes deux questions.

Et la manière de les vérifier est toujours la même : **faire deux fois, puis interrompre au
milieu.** Deux gestes, quelques minutes, et ils révèlent la quasi-totalité des défauts que ce
genre de code peut avoir.

## 🎤 Questions d'entretien
- « Qu'est-ce qui rend un pipeline rejouable ? » → L'idempotence (upsert / vérif d'existence) : relancer ne duplique pas.
- « Que se passe-t-il si le chargement échoue au milieu ? » → Une transaction annule tout ; on reprend proprement.
- « Où mets-tu la logique de nettoyage ? » → Dans un transform pur, testable, séparé des I/O.

## 🧾 À retenir
- ETL = extract (I/O) → transform (pur) → load (transactionnel).
- Idempotence et résistance à l'échec partiel = la marque du pipeline pro.
- L'ingestion RAG est un ETL : mêmes exigences.

## 📚 Vocabulaire
**ETL** · **idempotence** · **upsert** · **transaction / rollback** · **échec partiel** · **incrémental** · **orchestration** · **log de pipeline**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Mon pipeline est idempotent (relance sans doublon).
- [ ] Mon transform est pur et testé.
- [ ] Mon load résiste à une interruption (transaction + reprise).

## 🔗 Liens avec le programme
Mois 5 (jours ~130-150), projet 4 (DataPulse) ; mois 8-9 (ingestion RAG). Leçons liées : `data-cleaning-quality`, `sql-foundations`, `rag-fundamentals`.
