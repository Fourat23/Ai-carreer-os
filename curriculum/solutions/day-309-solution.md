# Correction — Jour 309 : DocSense : ingestion multi-format

[← Retour au jour 309](../days/day-309.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un extracteur par format qui produit du texte. Solution améliorée : un extracteur par format vers un format pivot commun, une résilience aux fichiers moches (try/except par document, journal des échecs, on continue), une INSPECTION du texte extrait avant de chunker (lire un échantillon + les 5 PDF réels), et des métadonnées posées dès l'ingestion pour les citations. La qualité du RAG est plafonnée par l'ingestion — d'où l'exigence de robustesse et d'inspection.

## ⚠️ Erreurs probables et points à vérifier
- Supposer que « ça s'extrait tout seul » : les vrais PDF sont moches — inspecter le texte extrait est obligatoire.
- Une ingestion qui plante sur un fichier corrompu : elle doit journaliser et continuer — un document sur 30 ne doit pas tout tuer.
- Chunker sans inspecter : la bouillie (tableaux hachés) contamine les embeddings, et le bug se manifeste 3 étapes plus loin.
- Oublier les métadonnées à l'ingestion : les citations (source, page) deviennent impossibles sans ré-ingestion.

## 🔍 Comment vérifier ta solution
- Un extracteur par format (PDF, Markdown, HTML) vers un format pivot commun.
- L'ingestion journalise les échecs et continue (testée sur fichier corrompu + PDF scanné).
- Le texte extrait des 5 PDF réels est inspecté et sa qualité notée.
- Les métadonnées (source, page/section) sont posées dès l'ingestion.
- La résilience est testée EXPRÈS (fichier moche glissé dans le corpus).

## 🎤 À savoir expliquer à l'oral
Insiste sur l'ingestion comme plafond de qualité : « ce qui entre mal extrait ressort mal partout — donc j'inspecte le texte extrait avant de chunker, et mon ingestion journalise et continue face à un PDF corrompu ». Puis la preuve : « testée sur 5 PDF réels moches, voici le journal des échecs ». Distinguer la réalité moche des tutoriels propres est un signal de maturité de production.
