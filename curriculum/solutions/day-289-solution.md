# Correction — Jour 289 : Architecture hexagonale

[← Retour au jour 289](../days/day-289.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : extraire des interfaces (ports) pour Chroma et l'API LLM, écrire un adapter par techno. Solution améliorée : le cœur définit les ports en termes MÉTIER et n'importe aucune techno ; les adapters les implémentent ; le câblage se fait à une racine de composition unique ; et on PROUVE la séparation par un second adapter (StockageMemoire) qui laisse le cœur et ses tests intacts. Bénéfice à exploiter : tester le cœur en isolation avec des stubs (rapide, gratuit). Rester léger (ports aux frontières qui changent).

## ⚠️ Erreurs probables et points à vérifier
- Sur-architecturer : une interface derrière chaque fonction est de la complexité gratuite — des ports aux frontières qui changent vraiment (vector store, LLM), pas partout.
- Ports définis par l'adapter au lieu du cœur : si le port épouse l'API de Chroma, changer de store casse le port — le port s'exprime en termes MÉTIER.
- Câblage dispersé : si plusieurs endroits instancient ChromaAdapter, ce n'est plus une racine de composition unique — centraliser l'injection.
- Ne pas prouver par un second adapter : sans la substitution testée, la séparation est théorique — le StockageMemoire est la preuve.

## 🔍 Comment vérifier ta solution
- Le cœur (MoteurRAG) reçoit des ports, n'importe aucune techno concrète.
- Chaque détail (vector store, LLM) a un adapter implémentant un port.
- Le câblage est centralisé à une racine de composition.
- Un second adapter (mémoire/stub) est substitué SANS toucher au cœur ni casser ses tests (la preuve).
- Un test du cœur tourne avec des stubs, sans infra ni appels réels (variante).

## 🎤 À savoir expliquer à l'oral
Fais la démonstration : « le cœur définit un port StockageVecteurs ; ChromaAdapter l'implémente ; pour prouver la séparation, je substitue un StockageMemoire — le cœur et ses tests passent à l'identique ». Puis les deux bénéfices : « portabilité (un fichier pour changer de store) et testabilité (je teste mon cœur sans lancer Chroma ni payer d'appel) ». Prouver la séparation par la substitution est irréfutable.
