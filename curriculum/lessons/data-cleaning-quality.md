<!-- keep -->
# Leçon — Nettoyage et qualité des données

## 🌍 Le problème d'abord
Tu reçois un export « clients » : des dates dans trois formats différents, des e-mails en
double, des âges à 0 ou 999, des colonnes à moitié vides. Si tu enchaînes directement un
modèle ou un dashboard là-dessus, le résultat sera FAUX — mais d'apparence crédible, ce qui est
pire. Avant toute analyse, il faut DIAGNOSTIQUER les défauts (manquants, doublons, formats,
aberrations), décider consciemment quoi en faire, et le DOCUMENTER pour que ce soit reproductible
et justifiable. Ce travail, souvent négligé, représente 60 à 80 % du temps réel en data — et
c'est lui qui fait la fiabilité de tout ce qui suit. Cette leçon t'apprend à nettoyer sans
maquiller.

## 🎯 Objectif
Savoir diagnostiquer et corriger des données sales (manquants, doublons, formats, aberrations) de façon DOCUMENTÉE et justifiée, et produire un rapport de qualité. C'est 60-80 % du travail réel en data et en ML — et ce qui fait la fiabilité de tout ce qui suit.

## 🧠 Modèle mental
« Garbage in, garbage out » : **un modèle ou un dashboard ne vaut jamais mieux que ses données**. Nettoyer, ce n'est pas maquiller : c'est comprendre POURQUOI la donnée est sale et décider consciemment quoi en faire.

## 🧩 Prérequis
Tu dois savoir manipuler un tableau de données — charger, inspecter, filtrer, transformer
(`/doc/lessons/pandas-data-wrangling`) — et connaître les types de base et la notion de
donnée tabulaire (lignes/colonnes). La distinction feature/target et l'idée de fuite de
données (`/doc/lessons/feature-engineering`) éclairent pourquoi certaines corrections doivent
attendre APRÈS le split. Aucune bibliothèque particulière n'est supposée : on raisonne sur les
décisions de qualité.

## 📖 Explication complète
Le nettoyage suit un ordre : **inspecter d'abord** (sinon on rate les vrais problèmes), puis traiter chaque défaut avec une décision justifiée.
- **Valeurs manquantes** : trois stratégies, choisies selon le CONTEXTE : supprimer les lignes (si rares et non biaisées), imputer (moyenne/médiane/valeur métier), ou garder et signaler (« inconnu »). Jamais par réflexe : pourquoi manquent-elles ? (le « pourquoi » change la bonne réponse.)
- **Doublons** : détecter (`duplicated`) et décider (vrai doublon à supprimer vs coïncidence légitime).
- **Formats** : dates, nombres avec virgules, casse, espaces — normaliser.
- **Aberrations (outliers)** : une valeur extrême est-elle une erreur (âge = 999) ou un vrai cas rare (un très gros client) ? On ne supprime pas sans comprendre.
Chaque décision se DOCUMENTE (un rapport avant/après), et rien ne se modifie SILENCIEUSEMENT. En production, ce nettoyage devient des **fonctions pures testables** (pas un notebook jetable).

**Le « pourquoi ça manque » a trois réponses, et elles n'appellent pas le même geste.** C'est la question la plus rentable du nettoyage, et la plus souvent sautée.
- La donnée manque **au hasard**, sans lien avec quoi que ce soit — un capteur qui saute une mesure, une case oubliée sans raison. C'est le cas confortable : imputer ou supprimer déforme peu.
- La donnée manque **pour une raison qu'on observe ailleurs** : les clients inscrits par l'application mobile n'ont pas de champ « fax », parce que le formulaire mobile ne le demande pas. Le manque s'explique par une AUTRE colonne. Imputer globalement mélange deux populations ; imputer par groupe respecte la structure.
- La donnée manque **à cause de sa propre valeur** : les très hauts revenus refusent de déclarer leur revenu. C'est le cas dangereux, et aucune imputation ne le répare — la médiane remplacera des revenus élevés par une valeur moyenne, et **effacera précisément le signal recherché**. Ici, la seule réponse honnête est de créer une colonne « revenu non déclaré » et de laisser le modèle en tirer ce qu'il peut.

Aucune de ces trois situations ne se distingue en regardant le nombre de manquants. Elles se distinguent en regardant **qui** manque — d'où « inspecter d'abord ».

**L'ordre par rapport au split, et pourquoi il n'est pas négociable.** Imputer avec la médiane calculée sur le jeu complet AVANT de séparer entraînement et test paraît anodin : c'est une médiane, elle bouge à peine. Mais cette médiane a été calculée en regardant les lignes de test. Une information venue du test est donc entrée dans les données d'entraînement — c'est la **fuite de données** (*leakage*).

La conséquence est vicieuse : le modèle obtient un meilleur score en test qu'il n'en obtiendra jamais en production, et **rien n'a l'air anormal**. Aucune erreur, aucun avertissement, juste un chiffre trop beau qu'on prend pour une réussite. La règle qui protège : on sépare d'abord, on calcule les statistiques de nettoyage (médiane, moyenne, catégories connues, bornes) **uniquement sur l'entraînement**, et on les APPLIQUE au test. Le test doit rester ce qu'il simule : des données qu'on n'a jamais vues.

## 🔧 Exemple simple
Une colonne « prix » contient `"1 200,50 €"` : il faut retirer l'espace, le €, remplacer la virgule par un point, convertir en nombre — sinon toute somme échoue.

## 🧭 Exemple guidé
**Énoncé** : traiter les âges manquants d'un dataset.
**Raisonnement** : d'abord COMPTER les manquants et regarder POURQUOI ; puis choisir.
**Solution** :
```python
manquants = df["age"].isna().sum()        # combien ?
# Si peu et non biaisés : imputer par la médiane (robuste aux extrêmes)
df["age"] = df["age"].fillna(df["age"].median())
```
**Explication** : la médiane est préférée à la moyenne (robuste aux aberrations) ; on documente « X âges imputés par la médiane ». **Variante** : si les manquants sont concentrés sur un groupe, l'imputation globale biaise — imputer PAR groupe ou signaler.

## 🤖 Exemple appliqué (IA / data / architecture)
Avant d'entraîner un modèle (mois 6), un nettoyage bâclé cause du leakage ou des biais. Dans un RAG, « nettoyer » veut dire retirer les débris d'extraction PDF (en-têtes, numéros de page) qui polluent les chunks. La qualité des données amont conditionne tout l'aval.

## ⚠️ Erreurs fréquentes
- Nettoyer sans inspecter (on corrige le mauvais problème).
- Imputer par la moyenne sur une distribution asymétrique.
- Supprimer des outliers sans comprendre (parfois ils sont l'information).
- Modifier silencieusement, sans rapport ni justification.

## 🚫 Anti-patterns
- Le nettoyage « à la main » dans un notebook non reproductible.
- « fillna(0) » partout par réflexe (un 0 n'est pas « inconnu »).

## ✍️ Mini-exercice
Sur un CSV sale : compte les manquants et doublons par colonne, corrige un format de date, et écris 3 lignes justifiant chaque décision.

## 🔥 Exercice plus difficile
Transforme ton nettoyage en fonctions pures Python (`load`, `validate`, `clean`, `report`) testées, produisant un rapport avant/après (complétude, doublons, aberrations).

## ✅ Correction attendue
La logique : inspecter → décider par défaut CONTEXTUEL → documenter → rendre reproductible. Vérifie : chaque transformation est justifiable en une phrase, aucune donnée n'est modifiée en silence, et le pipeline se relance à l'identique (fonctions pures, pas un notebook cliqué dans le désordre).

## 🎤 Questions d'entretien
- « Comment nettoierais-tu ce CSV pourri ? » → Inspecter d'abord, puis traiter manquants/doublons/formats/aberrations avec des décisions justifiées et documentées.
- « Moyenne ou médiane pour imputer ? » → Médiane si distribution asymétrique (robuste aux extrêmes).
- « Faut-il supprimer les outliers ? » → Seulement après avoir compris s'ils sont des erreurs ou de vrais cas rares.

## 🧾 À retenir
- Inspecter avant de nettoyer ; documenter chaque décision.
- Le « pourquoi ça manque » détermine la bonne stratégie.
- Nettoyage = fonctions pures reproductibles, pas un notebook jetable.

## 📚 Vocabulaire
**valeur manquante (NaN)** · **imputation** · **doublon** · **outlier** · **normalisation de format** · **data quality** · **rapport avant/après** · **reproductibilité**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'inspecte systématiquement avant de nettoyer.
- [ ] Je justifie chaque décision de nettoyage.
- [ ] Mon nettoyage est reproductible et testé.

## 🔗 Liens avec le programme
Mois 5 (jours ~125-150), projet 4 (DataPulse). Leçons liées : `pandas-data-wrangling`, `etl-pipelines`, `statistics-for-ml`.
