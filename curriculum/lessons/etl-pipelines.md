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

## 🧭 Exemple guidé
**Énoncé** : structurer un pipeline en 3 fonctions.
**Raisonnement** : séparer les responsabilités ; le transform pur, le reste isolé.
**Solution (pseudo)** :
```python
def extract(source): ...        # I/O : lit la source
def transform(brut): ...        # PUR : nettoie/normalise, testable
def load(propre, db):           # I/O : écrit, transactionnel + idempotent
    with db.transaction():
        for ligne in propre:
            db.upsert(ligne)    # insère ou met à jour, pas de doublon

def run(source, db):
    load(transform(extract(source)), db)
```
**Explication** : le transform pur se teste sans base ni fichier ; le load transactionnel + upsert garantit l'idempotence. **Variante** : ajoute un log par étape et une reprise si le run précédent a échoué.

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

## ✅ Correction attendue
La logique : séparer E/T/L, transform pur, load transactionnel + idempotent, logs. Vérifie : deux runs consécutifs → mêmes données (pas de doublons) ; une interruption simulée → aucune donnée à moitié écrite ; le transform se teste sans I/O.

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
