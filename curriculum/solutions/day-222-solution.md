# Correction — Jour 222 : RAG : multi-formats (PDF, Markdown)

[← Retour au jour 222](../days/day-222.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'ingestion multi-format réussit si : les deux extracteurs produisent le même format pivot, le texte extrait a été LU et ses défauts documentés, et les citations remontent des métadonnées exactes (page réelle, section réelle). La liste des limites connues fait partie du livrable.

## ⚠️ Erreurs probables et points à vérifier
- Chunker directement le texte extrait sans le lire : la bouillie de colonnes devient des embeddings de bouillie — et le bug se manifestera 3 étapes plus loin.
- Nettoyer agressivement sans tests : la regex qui vire les en-têtes peut virer des titres légitimes — chaque règle a un cas de test.
- Perdre la page PDF dans le chunking (chunk à cheval sur 2 pages : quelle page citer ? décide et documente).
- Promettre les tableaux : le RAG naïf les gère mal — dis-le dans les limites plutôt que de le découvrir en démo.

## 🔍 Comment vérifier ta solution
- Un PDF et un Markdown réels ingérés bout-en-bout, questions posées, réponses citées avec page/section EXACTES (vérifiées à la main).
- Les 3 premières pages extraites du PDF ont été comparées à l'original, défauts notés.
- La liste « ce qui est perdu » existe dans le README.
- Ajouter un format se limite à écrire un extracteur vers le format pivot.

## 🎤 À savoir expliquer à l'oral
Raconte ce que tu as VU dans ton PDF extrait (les en-têtes répétés, le tableau détruit) et ta règle : « je lis ce que j'extrais avant de chunker ». Le récit d'un défaut concret trouvé et traité vaut mieux que toute théorie.
