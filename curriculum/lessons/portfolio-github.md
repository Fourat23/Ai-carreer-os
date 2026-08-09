<!-- keep -->
# Leçon — Portfolio technique GitHub

## 🌍 Le problème d'abord
Un recruteur reçoit ta candidature et ouvre ton GitHub. En 2-3 minutes, il décide si ton profil mérite un entretien. Ce qu'il voit : un profil vide ou soigné, des repos qui racontent une progression ou un grenier de projets abandonnés, des commits réguliers ou un désert. Pour un reconverti sans expérience salariée, ce GitHub EST le CV technique — la seule preuve tangible que tu sais coder et que tu es constant. Laissé au hasard, il travaille CONTRE toi (secrets exposés, code honteux public, repos morts). Cette leçon t'apprend à en faire une vitrine qui plaide en ta faveur.

## 🎯 Objectif
Transformer ton GitHub en PREUVE d'employabilité : profil soigné, repos épinglés qui racontent une progression, historique de commits qui démontre la constance, et zéro signal négatif (secrets, repos morts, code honteux public). Pour un reconverti, le portfolio EST le CV technique.

## 🧩 Prérequis
Tu dois maîtriser Git et la notion d'historique de commits (`/doc/lessons/git-fundamentals`), savoir écrire un README clair (`/doc/lessons/readme-documentation`), et être conscient du risque de fuite de secrets (`/doc/lessons/deployment-secrets`). Avoir un ou deux projets à exposer est le point de départ. Aucune notoriété open-source préalable n'est attendue.

## 🧠 Modèle mental
Ton GitHub est **une vitrine de magasin, pas un grenier** : on y expose le meilleur, rangé et étiqueté — pas tout ce qu'on possède. Le recruteur y passe 2-3 minutes : chaque élément visible doit travailler POUR toi.

## 📖 Explication complète
Ce qu'un recruteur regarde (dans l'ordre, en ~3 minutes) :
1. **Le profil** : photo correcte, bio d'une ligne orientée cible (« AI Engineer junior — RAG, évaluation, TypeScript/Python »), README de profil sobre qui met en avant 2-3 projets.
2. **Les repos épinglés (6 max)** : TES meilleurs, pas les plus récents. Chacun : description d'une ligne + topics + README exemplaire. L'ordre raconte une histoire : le projet vitrine (DocSense) d'abord.
3. **La heatmap de commits** : la CONSTANCE sur des mois vaut plus qu'un pic isolé — c'est la preuve visuelle de ta discipline de 12 mois (le commit quotidien du programme la construit automatiquement).
4. **Un repo au hasard** : structure claire, commits atomiques aux messages propres (l'historique se lit comme un journal de rigueur), pas de secrets, pas de fichiers générés commités.
Hygiène : les expérimentations brouillonnes restent PRIVÉES ; chaque repo public a été audité (historique sans secrets — leçon deployment-secrets) ; les repos morts sont archivés (signal assumé) plutôt que laissés pourrir.
La règle des 6 : mieux vaut 6 projets solides et racontables que 30 tutoriels clonés — le recruteur détecte le tutoriel copié en 10 secondes (même structure, mêmes noms, aucun ADR).

## 🔧 Exemple simple
Bio faible : « Étudiant passionné de code ». Bio forte : « AI Engineer junior — j'ai construit un assistant documentaire RAG évalué (fidélité 90 %) · TypeScript/Python ».

## 🧭 Exemple guidé
**Énoncé** : choisir et ordonner tes 6 repos épinglés en fin de programme.
**Raisonnement** : la vitrine raconte une progression vers la cible IA.
**Solution** :
```
1. DocSense        (projet final : RAG évalué, Docker, CI — la pièce maîtresse)
2. DocQA           (RAG from scratch + harnais d'éval — la profondeur technique)
3. ChurnScope      (ML honnête : baseline, métriques, rapport — la rigueur data)
4. LivreAPI        (API REST propre + tests + collection Postman — le socle backend)
5. BiblioApp       (full-stack React — la polyvalence)
6. DataPulse       (pipeline ETL + dashboard — la data de bout en bout)
```
**Explication** : l'ordre va de la cible (IA) vers le socle ; chaque repo prouve une facette différente — aucun doublon. **Variante** : adapte l'ordre à l'offre visée (poste data → DataPulse/ChurnScope remontent).

## 🤖 Exemple appliqué (IA / data / architecture)
Pour un poste AI Engineer, le trio gagnant visible en 3 minutes : un RAG ÉVALUÉ (chiffres dans le README), un historique de commits constant sur 12 mois, et des ADRs dans les repos (la preuve que tu ARBITRES). C'est exactement ce que le programme construit — le portfolio n'est pas une étape finale, il s'accumule chaque jour.

## ⚠️ Erreurs fréquentes
- Tout rendre public, y compris le brouillon (bruit qui noie le signal).
- Secrets dans l'historique d'un repo rendu public (audit obligatoire AVANT).
- Repos épinglés par défaut (les plus récents, pas les meilleurs).
- Heatmap vide 6 mois puis un pic (l'inverse du signal recherché).

## 🚫 Anti-patterns
- 30 tutoriels clonés pour « remplir ».
- Le faux commit quotidien vide (détectable, décrédibilisant).

## ✍️ Mini-exercice
Écris ta bio GitHub d'une ligne orientée cible, et choisis tes épinglés ACTUELS (même imparfaits) avec une ligne de justification chacun.

## 🔥 Exercice plus difficile
Audit complet de ton GitHub en te mettant dans la peau d'un recruteur (3 minutes chrono) : note ce que tu vois, liste 5 corrections prioritaires, exécute-les (dont l'audit secrets des repos publics).

## ✅ Correction attendue
La logique : vitrine (le meilleur, étiqueté) + constance (heatmap) + rigueur visible (commits, ADRs) + zéro signal négatif. Vérifie : un inconnu comprend ta cible en 10 s (bio), tes 6 épinglés couvrent des facettes différentes, aucun secret dans aucun historique public.

## 🎤 Questions d'entretien
- « Montre-moi ton GitHub. » → Profil orienté cible, épinglés qui racontent la progression, DocSense en tête avec ses chiffres.
- « Ce projet, c'est un tutoriel ? » → Non : ADRs, décisions documentées, éval chiffrée, limites honnêtes — les marqueurs du travail original.
- « Pourquoi ce projet est-il épinglé ? » → Chaque épinglé prouve une facette précise (récit préparé).

## 🧾 À retenir
- Vitrine, pas grenier : 6 épinglés solides, le reste privé ou archivé.
- La heatmap prouve la constance ; les ADRs prouvent l'arbitrage.
- Audit secrets AVANT toute publication ; l'historique n'oublie rien.

## 📚 Vocabulaire
**repos épinglés** · **README de profil** · **topics** · **heatmap de contributions** · **archivage** · **commits atomiques** · **audit de secrets** · **projet vitrine**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Ma bio et mes épinglés sont orientés vers ma cible.
- [ ] Ma heatmap montre une constance réelle.
- [ ] Tous mes repos publics sont audités (secrets, README, description).

## 🔗 Liens avec le programme
Dès le jour 6 (premier push), mois 12 (jours ~340-348). Leçons liées : `readme-documentation`, `technical-storytelling`, `deployment-secrets`.
