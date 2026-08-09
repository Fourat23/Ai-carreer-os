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
- **Extract** : récupérer depuis la source (CSV, API, base). Point fragile : la source peut être absente, changer de format, être incomplète.
- **Transform** : nettoyer, normaliser, enrichir. À écrire en **fonctions pures** (testables, sans effet de bord) — c'est le cœur métier.
- **Load** : écrire dans la destination (base, entrepôt), idéalement de façon **transactionnelle** (tout ou rien).
Les deux propriétés qui distinguent un pipeline pro d'un script jetable :
- **Idempotence** : relancer le pipeline ne DUPLIQUE pas les données (via upsert, ou vérification d'existence). Un pipeline qui double les données à chaque run est cassé.
- **Résistance à l'échec partiel** : si le chargement plante au milieu, la base ne reste pas à moitié remplie (transaction + reprise). On log chaque étape pour diagnostiquer.

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
- Pipeline non idempotent (duplique à chaque run).
- Transform mêlé aux I/O (intestable).
- Pas de transaction → base incohérente si échec au milieu.
- Aucun log → impossible de diagnostiquer un run raté.

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
