# Correction — Jour 246 : Recherche lexicale (BM25/FTS5)

[← Retour au jour 246](../days/day-246.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'index lexical porte les MÊMES chunks que le vectoriel (comparabilité totale), expose la même interface top-k, et la cartographie sur golden set (+ questions identifiants ajoutées) montre les forces complémentaires. Le chiffre clé est l'union des réussites : le plafond théorique de la fusion de demain.

## ⚠️ Erreurs probables et points à vérifier
- Oublier d'échapper la requête FTS5 : une question contenant « - » ou « \" » devient une syntaxe d'opérateurs et plante — nettoie systématiquement.
- Lire bm25() comme un score croissant : c'est un COÛT en SQLite (plus bas = mieux) — inverser le tri silencieusement fausse tout.
- Tester le lexical sur les questions du golden set SEULEMENT : conçu pour le sémantique, il sous-représente les identifiants — d'où les 4 questions ajoutées (marquées v1.1, le set d'origine reste figé).
- Conclure « le lexical est mauvais » sur son score global : il n'est pas là pour gagner en moyenne, il est là pour attraper ce que le vectoriel rate.

## 🔍 Comment vérifier ta solution
- L'index FTS5 contient exactement le même nombre de chunks que la collection Chroma.
- La requête piège (avec tirets/guillemets) ne plante pas.
- La cartographie par type est remplie, avec la ligne « union des réussites ».
- Tu sais montrer l'effet IDF sur UN exemple (le terme rare qui remonte son chunk).

## 🎤 À savoir expliquer à l'oral
Explique BM25 avec l'exemple E1027 : « erreur » est partout (IDF faible), « E1027 » est unique (IDF énorme) → le chunk exact remonte en tête. Puis la phrase de synthèse : « le vectoriel comprend, le lexical retrouve — mes questions ont besoin des deux ». C'est la mise en place parfaite pour parler de RRF.
