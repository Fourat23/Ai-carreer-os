<!-- keep -->
# Leçon — L'entretien de design système

## 🌍 Le problème d'abord
En entretien, on te lance : « conçois un système pour raccourcir des URLs » (ou un fil d'actualité, ou un RAG à l'échelle). Panique : par où commencer ? Le piège du débutant est de foncer coder une solution, ou de rester muet en cherchant LA bonne réponse. Or il n'y en a pas : le recruteur teste ta FAÇON de raisonner sous incertitude — poses-tu les bonnes questions, structures-tu, arbitres-tu ? Une question ouverte ne se devine pas, elle se DÉROULE avec une méthode. Cette leçon te donne cette méthode (clarifier → composants/flux → trade-offs → échelle/pannes) pour ne jamais rester sans réponse — décisif pour les rôles AI Engineer.

## 🎯 Objectif
Savoir aborder une question ouverte (« conçois un système pour X ») avec une méthode qui ne laisse jamais sans réponse : clarifier → composants/flux → trade-offs → échelle/pannes. Décisif pour les rôles AI Engineer junior+, où l'on teste ton RAISONNEMENT plus qu'une solution.

## 🧩 Prérequis
Tu dois avoir des bases d'architecture logicielle — composants, couches, compromis (`/doc/lessons/architecture-basics`) — et une idée de la mise à l'échelle, de la disponibilité et des pannes (vues en observabilité/cloud). Connaître les grands blocs (API, base de données, cache, file) aide à peupler un schéma. Aucune connaissance d'un système précis n'est exigée : c'est la MÉTHODE qui compte.

## 🧠 Modèle mental
Le design système ne se DEVINE pas, il se DÉROULE. Le recruteur n'attend pas LA bonne réponse (il n'y en a pas) : il regarde si tu poses les bonnes questions, structures, et arbitres. **Ta méthode visible est la vraie réponse.**

## 📖 Explication complète
Les 4 étapes, à énoncer à voix haute :
1. **Clarifier les besoins et contraintes** : combien d'utilisateurs / de documents ? lecture ou écriture intensive ? latence acceptable ? budget ? local ou cloud ? Et le **hors-scope**. Concevoir sans questions est éliminatoire.
2. **Composants et flux de données** : dessiner les grands blocs (client, API, base, cache, file, service LLM…) et le trajet d'une donnée de bout en bout. Un schéma structure la discussion.
3. **Choisir en TRADE-OFFS** : pour chaque décision, exposer les options et choisir selon les contraintes de l'étape 1 (« monolithe modulaire car le volume ne justifie pas le distribué »).
4. **Échelle et pannes** : « et à 10× le trafic ? » (cache, réplicas, file), « et si ce composant tombe ? » (résilience, dégradation), et les **coûts** (l'inférence LLM coûte).
Pour un système IA, ajouter les spécificités : le LLM est non déterministe/coûteux/faillible (validation, cache, fallback), le RAG quand la connaissance dépasse le contexte, workflow vs agent selon le besoin, l'évaluation intégrée dès le début, la sécurité (prompt injection).

**L'estimation à la louche, qui est la compétence réellement testée à l'étape 1.** Un candidat qui répond « beaucoup d'utilisateurs » a perdu ; un candidat qui convertit en ordres de grandeur a gagné, même avec des chiffres approximatifs. La conversion se fait toujours dans le même sens — d'un chiffre annoncé vers une **charge par seconde** :

> 1 million d'utilisateurs, dont 10 % actifs par jour, chacun faisant 5 requêtes :
> 500 000 requêtes/jour ÷ 86 400 s ≈ **6 requêtes/seconde** en moyenne.
> Le trafic n'est jamais uniforme : on applique un facteur de pointe de 3 à 5 → **20 à 30 req/s**.

Ce petit calcul change tout le reste de l'entretien. Trente requêtes par seconde tiennent sur une machine ; on n'a besoin ni de microservices, ni de file, ni de sharding, et le dire est un point pour toi, pas contre toi. Les deux repères à retenir pour ne pas être perdu : une journée fait ~**86 400 secondes** (arrondir à 100 000 est parfaitement acceptable et se calcule de tête), et un service web ordinaire encaisse quelques **centaines** de requêtes par seconde par instance.

**Le calcul de volume se fait sur le même modèle** : 500 000 requêtes/jour × 2 Ko journalisés = 1 Go/jour, soit ~365 Go/an — ce qui décide de la rétention bien mieux qu'une intuition. Et pour un système IA, un troisième calcul s'ajoute, souvent décisif : 500 000 requêtes × 4 000 jetons de contexte, c'est 2 milliards de jetons par jour. **Le goulot d'un système IA est presque toujours le coût ou la latence de l'inférence, jamais le débit HTTP** — le dire spontanément montre qu'on a déjà construit quelque chose.

**Le piège classique de cette étape** : donner un chiffre précis. Personne n'attend l'exactitude, et prétendre à la précision sur des hypothèses inventées est un mauvais signal. On annonce ses hypothèses à voix haute (« je pars sur 10 % d'actifs quotidiens, dites-moi si c'est loin de la réalité »), on arrondit franchement, et on garde l'**ordre de grandeur** — c'est lui qui décide de l'architecture, pas la deuxième décimale.

## 🔧 Exemple simple
« Conçois un système de recherche documentaire » → clarifier (combien de docs ? quelle fraîcheur ?) AVANT de dessiner ingestion → index → retrieval → génération.

## 🧭 Exemple guidé
**Énoncé** : « Conçois un assistant qui répond aux questions sur 100 000 contrats. »
**Déroulé** :
```
[Clarifier] Volume ? 100k docs. Fraîcheur ? mise à jour quotidienne. Latence ? < 3 s.
            Confidentialité ? données sensibles → attention aux fuites. Hors-scope : rédaction.
[Composants] Ingestion (ETL) → chunking → embeddings → base vectorielle + index lexical
            → retrieval hybride + reranking → génération citée → éval.
[Trade-offs] Base vectorielle (100k×chunks justifie l'ANN) ; workflow, pas agent (chemin connu) ;
            monolithe modulaire local (pas de cloud pour la confidentialité).
[Échelle/pannes] Cache des questions fréquentes ; budget latence par étage ; que faire si le
            LLM est indisponible (réponse dégradée) ; coût par question estimé.
```
**Explication** : chaque étape s'appuie sur la précédente ; les choix découlent des contraintes. **Variante** : refais avec « 10 M de documents » et vois ce qui change.

## 🤖 Exemple appliqué (IA / data / architecture)
C'est exactement le raisonnement de conception de DocSense (projet final). Avoir CONSTRUIT un tel système te donne des exemples concrets à citer — un énorme avantage sur un candidat qui n'a que de la théorie.

## ⚠️ Erreurs fréquentes
- Concevoir sans clarifier (foncer sur une solution).
- Choisir la techno à la mode sans justifier (microservices « parce que »).
- Oublier l'échelle, les pannes et les coûts.
- Rester silencieux : le recruteur évalue ta pensée, verbalise-la.

## 🚫 Anti-patterns
- Sur-ingénierie (répondre à des contraintes qu'on n'a pas).
- Le schéma fouillis sans légende ni flux clair.

## ✍️ Mini-exercice
Prends « un système de support client augmenté par IA » et écris les 3 questions de clarification que tu poserais en premier.

## 🔥 Exercice plus difficile
Déroule les 4 étapes complètes (45 min, schéma) sur « analyser 10 000 documents/jour et alerter sur les anomalies ». Impose-toi 2 trade-offs explicites et un paragraphe « à 10× le volume ». Enregistre-toi.

## ✅ Correction attendue
La logique : clarifier → composants/flux → trade-offs → échelle/pannes, à voix haute. Vérifie : tu as posé des questions AVANT de concevoir, ton schéma a un flux lisible, chaque choix est justifié par une contrainte, et tu as abordé échelle + pannes + coûts. La méthode visible compte plus que « la » solution.

## 🎤 Questions d'entretien
- « Conçois un système pour {besoin}. » → Dérouler les 4 étapes à voix haute.
- « Monolithe ou microservices ? » → Par défaut monolithe modulaire ; le distribué se justifie par des contraintes précises.
- « Et si le trafic ×10 ? » → Cache, réplicas, files, budget, dégradation gracieuse.

## 🧾 À retenir
- Clarifier → composants/flux → trade-offs → échelle/pannes.
- La méthode VISIBLE est la réponse ; verbalise ton raisonnement.
- Un système IA construit (DocSense) te donne des exemples concrets décisifs.

## 📚 Vocabulaire
**exigences / contraintes / hors-scope** · **flux de données** · **trade-off** · **scalabilité (verticale/horizontale)** · **cache / file / réplicas** · **résilience** · **dégradation gracieuse** · **coût d'inférence**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je clarifie toujours avant de concevoir.
- [ ] Je dessine composants + flux et justifie chaque choix en trade-offs.
- [ ] J'aborde échelle, pannes et coûts, à voix haute.

## 🔗 Liens avec le programme
Mois 10-12 (jours ~280-360), projet final. Leçons liées : `architecture-basics`, `technical-storytelling`, `agents-fundamentals`.
