<!-- keep -->
# Leçon — Le README recruteur

## 🌍 Le problème d'abord
Tu es fier de ton projet : des semaines de travail, du code propre. Un recruteur clique dessus, tombe sur un README vide (ou pire, le README généré par défaut), ne comprend ni ce que fait le projet ni comment l'essayer… et repart en dix secondes. 90 % des visiteurs ne verront QUE le README : c'est la porte d'entrée de ton travail. S'il est mauvais, ton code ne sera même pas regardé. Le problème : un README n'est pas une documentation exhaustive, c'est une page d'atterrissage qui doit répondre vite aux questions du visiteur pressé. Cette leçon t'apprend à écrire un README compris en 30 secondes et exécutable en 5 minutes.

## 🎯 Objectif
Écrire des READMEs qu'un recruteur comprend en 30 secondes et qu'un développeur exécute en 5 minutes. Le README est la PORTE de chaque projet : 90 % des visiteurs ne verront que lui — c'est lui qui décide si ton code sera même regardé.

## 🧩 Prérequis
Tu dois avoir un projet à documenter et connaître Markdown (titres, listes, blocs de code) ainsi que les bases de la documentation technique (`/doc/lessons/technical-documentation`). Savoir lancer ton projet (commandes d'installation et d'exécution) est nécessaire pour les décrire. Aucun générateur de documentation n'est supposé.

## 🧠 Modèle mental
Un README est **une page d'atterrissage, pas une documentation exhaustive** : il doit répondre, dans l'ordre, aux questions du visiteur pressé — c'est quoi ? ça marche ? je peux essayer ? c'est sérieux ? — chacune en quelques secondes de lecture.

## 📖 Explication complète
La structure qui convertit (dans cet ordre, car c'est l'ordre des questions du lecteur) :
1. **Titre + une phrase** : ce que fait le projet, pour qui. Sans jargon.
2. **Démo visuelle** : un GIF ou une capture EN HAUT. La preuve avant les mots — un recruteur décide ici.
3. **Les chiffres / ce qui rend le projet sérieux** : « golden set 40 questions, fidélité 90 %, p95 < 2 s ». Trois chiffres valent dix adjectifs.
4. **Installation en 5 minutes** : prérequis, 3-4 commandes, TESTÉES sur un clone frais. Chaque friction perd des lecteurs.
5. **Architecture** : UN schéma simple + trois phrases sur les choix (liens vers les ADRs).
6. **Limites honnêtes + pistes** : l'honnêteté est un signal de séniorité, pas une faiblesse.
7. **Ce que j'ai appris** (projets de portfolio) : 3-5 puces lucides — les recruteurs la lisent.
Le test de qualité : suivre SES PROPRES instructions sur une machine propre, à la lettre. Chaque écart est un bug de documentation. Et le duo description GitHub + topics rend le repo trouvable et pro.

**Pourquoi presque tous les README ratent, et ce n'est pas par paresse.** Celui qui écrit le README est la seule personne au monde à qui il est inutile. Il connaît le contexte, il a déjà les dépendances installées, ses variables d'environnement sont posées depuis des semaines, et il sait ce que fait le projet sans avoir à le lire. Il écrit donc, sans s'en rendre compte, pour quelqu'un qui sait déjà — et produit des instructions qui ne fonctionnent que sur sa machine.

Ce biais porte un nom, la **malédiction du savoir**, et il ne se corrige pas par un effort d'attention : on ne peut pas se souvenir de ce qu'on ignorait. Il se corrige **mécaniquement**, en se replaçant dans l'ignorance : cloner son propre dépôt dans un dossier neuf, ou mieux, dans un conteneur vide, et suivre ses instructions à la lettre sans jamais s'autoriser un « ah oui, il faut aussi… ». Chaque fois qu'on est tenté d'ajouter une étape de tête, on vient de trouver un bug de documentation.

**Ce que fait réellement un lecteur**, et qui commande l'ordre des sections. Un recruteur ou un collègue accorde quelques dizaines de secondes et cherche à répondre à trois questions, dans cet ordre : *qu'est-ce que c'est ?*, *est-ce que ça marche vraiment ?*, *est-ce que je peux l'essayer maintenant ?* Il ne fait presque jamais défiler la page jusqu'en bas. C'est pour cela que la démonstration visuelle est placée en haut plutôt qu'après l'architecture : une capture répond à la deuxième question sans lire une ligne, alors qu'un paragraphe d'explication demande un effort qu'on n'accorde qu'après avoir été convaincu.

Et c'est aussi pourquoi les **limites honnêtes** ne coûtent rien : elles sont lues par ceux qui sont déjà intéressés, et à ce stade elles rassurent — quelqu'un qui connaît les faiblesses de son projet est quelqu'un qui l'a mesuré.

## 🔧 Exemple simple
Faible : « Projet de RAG avec LangChain. »
Fort : « **DocSense** — assistant qui répond aux questions sur vos documents techniques, avec citations vérifiables et refus quand l'information n'existe pas. Fidélité 90 % sur 40 questions d'évaluation. `docker compose up` et c'est parti. »

## 🧭 Exemple guidé
**Énoncé** : rédiger la section « Installation » de LivreAPI.
**Raisonnement** : prérequis explicites, commandes copiables, vérification finale.
**Solution** :
```markdown
## Installation (5 minutes)
Prérequis : Node.js 20+.
\```bash
git clone … && cd livreapi
npm install
npm run db:init      # crée la base et les données de démo
npm run dev          # → http://localhost:3000
\```
Vérifier : `curl http://localhost:3000/books` renvoie 5 livres.
Tester : importer `postman/livreapi.json` et lancer la collection.
```
**Explication** : chaque commande est copiable, l'étape de vérification prouve le succès, la collection Postman fait la démo. **Variante** : ajoute une section « Problèmes fréquents » (port occupé, version Node).

## 🤖 Exemple appliqué (IA / data / architecture)
Pour un projet IA, la section CHIFFRES est ton arme : le tableau d'éval avant/après (rappel, fidélité, coût/requête) prouve une démarche d'ingénieur là où les autres candidats listent des features. Le README de DocSense suit exactement cette structure — c'est un critère de qualité du projet final.

## ⚠️ Erreurs fréquentes
- Pas de visuel (le lecteur ne « voit » jamais le projet).
- Instructions jamais testées sur machine propre.
- Décrire les features au lieu du PROBLÈME résolu.
- Aucun chiffre, aucune limite (le projet paraît naïf).

## 🚫 Anti-patterns
- Le README généré par défaut jamais retouché.
- Le pavé de 400 lignes qui noie l'essentiel (la doc détaillée va dans /docs).

## ✍️ Mini-exercice
Réécris le titre + la première phrase + les 3 chiffres de ton meilleur projet. Teste sur quelqu'un : comprend-il en 30 secondes ?

## 🔥 Exercice plus difficile
Refonds un README complet selon la structure, puis suis tes propres instructions sur un clone frais. Corrige chaque friction rencontrée.

## ✅ Correction attendue
La logique : répondre aux questions du lecteur dans l'ordre (quoi → preuve → essai → sérieux → limites). Vérifie : un inconnu comprend le projet en 30 s (montre-le à quelqu'un), l'installation marche à la lettre sur machine propre, et il y a au moins 3 chiffres et 2 limites honnêtes.

## 🎤 Questions d'entretien
- « Qu'est-ce qui fait un bon README ? » → Une phrase claire, une démo visuelle, des chiffres, une installation en 5 min testée, l'architecture, les limites.
- « Que regarde un recruteur sur un repo GitHub ? » → Le README d'abord (30 s), puis la structure et l'historique des commits.
- « Pourquoi documenter les limites ? » → Signal de lucidité et de séniorité ; l'inverse (survendre) se détecte et disqualifie.

## 🧾 À retenir
- Le README est une landing page : quoi → preuve → essai → sérieux.
- Démo visuelle en haut, chiffres, installation TESTÉE, limites honnêtes.
- 90 % des visiteurs ne verront que lui : investis en conséquence.

## 📚 Vocabulaire
**landing page** · **GIF de démo** · **badge** · **topics GitHub** · **quickstart** · **ADR (lien)** · **limites connues** · **machine propre**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Mes READMEs suivent la structure et ont un visuel + des chiffres.
- [ ] Mes installations marchent à la lettre sur un clone frais.
- [ ] Chaque projet affiche ses limites honnêtement.

## 🔗 Liens avec le programme
Tous les projets ; mois 12 (jours ~337-345). Leçons liées : `technical-storytelling`, `portfolio-github`, `ci-cd`.
