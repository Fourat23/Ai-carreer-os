# Correction — Jour 304 : DocSense : modèle de données

[← Retour au jour 304](../days/day-304.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : définir les entités (document, chunk, évaluation, session). Solution améliorée : tracer les relations, choisir où vivent les vecteurs (vector DB, lié par id), porter le versioning dans l'évaluation (pour le dashboard), justifier les dénormalisations (audit sans jointure), et VALIDER le modèle contre une fonctionnalité future (elle doit être triviale). Un modèle pensé pour l'évolution rend le build fluide ; un modèle bâclé force des migrations douloureuses.

## ⚠️ Erreurs probables et points à vérifier
- Un modèle qui ne porte pas le versioning : le dashboard de qualité par version (jour 318) devient impossible — anticiper les fonctionnalités.
- Ids de chunks instables : la ré-indexation crée des doublons — un id = hash(contenu+source) assure l'idempotence (jour 223).
- Vecteurs et chunks mal reliés : sans id partagé clair, retrouver le texte d'un vecteur devient un casse-tête.
- Tout normaliser par dogme : parfois dupliquer (le texte du chunk dans l'audit d'évaluation) évite des jointures coûteuses — arbitrer selon l'usage.

## 🔍 Comment vérifier ta solution
- Les 4 entités (Document, Chunk, Évaluation, Session/Échange) sont définies avec leurs champs.
- Les relations sont tracées (Document 1-N Chunk, Session 1-N Échange).
- L'Évaluation porte la version de config/index.
- Les décisions (vecteurs, dénormalisation, versioning) sont justifiées.
- Une fonctionnalité future est vérifiée comme triviale avec le modèle (variante).

## 🎤 À savoir expliquer à l'oral
Explique que le modèle décide de la vélocité future : « mon Évaluation porte la version de config et d'index — donc le dashboard de qualité par version est trivial ; mes chunks ont un id stable — donc la ré-indexation est idempotente ». Montrer qu'on conçoit le modèle en pensant aux fonctionnalités À VENIR est un signal de conception durable que les recruteurs data reconnaissent.
