# V78 — DROITS SUR LES DONNÉES

> À lire **avant** de proposer le pilote à quelqu'un. Ce document dit ce que la
> machine détient, qui peut l'emporter, et qui peut l'effacer. Il a été écrit
> après avoir mesuré que l'interface promettait deux choses fausses.
>
> **Il ne remplace pas un avis juridique.** Il décrit un comportement de
> logiciel, vérifié par des tests qui suppriment de vrais fichiers.

---

## 1. Où vivent les données, et à qui elles appartiennent

Tout est **local**. Aucune donnée n'est envoyée à un serveur distant, à un
service d'analyse ou à un tiers : il n'y a pas de compte, pas de télémétrie, pas
d'appel sortant. « Local » veut dire : sur la machine qui fait tourner
l'application.

### 1.1 Ce qui appartient au participant — **quatre catégories**

| catégorie | où | contient du code écrit par le participant |
|---|---|---|
| **Progression** | `data/progress.json` (ou le chemin de `AICOS_PROGRESS_FILE`) | non |
| **Instantané de secours** | le même chemin, suffixé `.backup.json` | non |
| **Espaces de travail du Laboratoire** | `data/lab-workspaces/` | **oui** |
| **Journaux de tentatives** | `data/lab-journals/` | **oui** |

Cette liste n'est pas une description : c'est `CATEGORIES_DONNEES_APPRENANT`
dans `lib/learner-data.mjs`. L'interface, les routes et les tests la lisent.
Personne ne la recopie.

### 1.2 Ce qui n'appartient PAS au participant

Le **programme** : leçons (`curriculum/`), définitions d'exercices
(`data/exercises/`, et les répertoires d'exercices à la racine), corrigés,
évaluations, capstones, missions, `data/program.json`, et le code source de
l'application.

**Aucune opération de suppression ne les touche.** Deux verrous indépendants :
une liste blanche de chemins nommés un par un (jamais un balayage de `data/`,
qui contient le curriculum), et un garde-fou qui **refuse le plan entier** si
l'un des chemins tombe dans un répertoire du produit. Un plan refusé ne supprime
rien du tout — pas même les catégories légitimes.

---

## 2. Les quatre opérations, et ce qu'elles font exactement

| | Réinitialiser la progression | **Supprimer toutes mes données** | Exporter une sauvegarde | **Exporter toutes mes données** |
|---|---|---|---|---|
| Progression | **vidée** | **supprimée** | incluse | incluse |
| Instantané de secours | **créé** | **supprimé** | absent | incluse |
| Espaces de travail | conservés | **supprimés** | inclus | inclus |
| Journaux de tentatives | conservés | **supprimés** | **absents** | inclus |
| Crée un filet de sécurité ? | **oui** | **non** | — | — |
| Réversible ? | oui, via l'instantané | **non** | — | — |
| Relisible par « Importer » ? | — | — | **oui** | **non** |

### 2.1 « Réinitialiser » n'est pas « supprimer »

C'est la distinction que le CP0 a trouvée absente, et c'est la plus importante
du document.

**Réinitialiser** remet la progression à zéro. Un instantané de l'état précédent
est écrit à côté, et le code du participant — workspaces et journaux — reste
intact. Ce choix est délibéré et date de V76 · CP10 : *un `RESET` n'efface pas
l'histoire d'un échec*, parce que cette histoire est ce qu'un apprenant a de
plus utile à relire.

**Supprimer toutes mes données** fait l'inverse, et complètement : les quatre
catégories partent, y compris le code. Aucun instantané n'est créé. C'est le
seul endroit du produit où le mot *irréversible* est vrai, et il n'est écrit que
là.

### 2.2 La suppression demande un mot, pas un clic

Le bouton ouvre une saisie. Il faut écrire `SUPPRIMER`. La route refuse tout
appel dont le corps ne porte pas ce mot exact — un `POST` vide ne supprime rien,
même envoyé à la main.

### 2.3 « Exporter une sauvegarde » n'est pas « exporter toutes mes données »

La **sauvegarde** est un format restaurable : l'application sait la relire, la
valider et remplacer l'état courant avec. Elle contient la progression et les
espaces de travail.

L'**archive complète** contient tout, journaux compris — donc le code de chaque
tentative, réussie ou ratée. Elle **n'est pas restaurable** : elle sert à
emporter, pas à revenir en arrière. C'est le fichier à demander pour « avoir
tout ce que vous détenez de moi ».

---

## 3. Ce que le pilote V78 ajoute

**Rien de nouveau sur le disque.** Le pilote n'introduit aucune catégorie de
donnée : il traverse la boucle existante et lit les faits que le produit écrit
déjà. Il n'y a donc pas de « données d'étude » séparées à supprimer à part.

Ce qui change est **organisationnel** :

| | |
|---|---|
| ce que le facilitateur note | les observations de session et les rapports de confusion, **hors de l'application**, sous un identifiant de session |
| ce qui relie une session à une personne | **rien dans le fichier**. La correspondance session ↔ personne, si elle existe, vit hors de la machine et sous le contrôle du facilitateur |
| ce que le participant reçoit à la fin | son archive complète, et la confirmation de la suppression s'il la demande |

---

## 4. Les engagements pris envers un participant

1. **Il peut s'arrêter à tout moment, sans se justifier.** La session est
   marquée `ABORTED` et ses données suivent la même règle que les autres.
2. **Il peut emporter tout ce que la machine détient de lui**, en un fichier,
   en un clic, à tout moment — y compris son code.
3. **Il peut tout faire effacer**, pour de bon, sans filet, et la suppression
   est vérifiable : il peut ré-exporter juste après et constater que l'archive
   ne rend plus rien.
4. **Ce qui est effacé l'est réellement sur le disque**, pas marqué comme
   effacé. Des tests suppriment de vrais fichiers dans un vrai répertoire et
   vérifient ensuite leur absence.
5. **Rien ne part vers un tiers.** Il n'y a pas de destinataire.

> L'engagement `2` et l'engagement `3` sont l'hypothèse `H7` du contrat gelé.
> Si l'un des deux tombe pendant le pilote, **le pilote s'arrête** (règle `A3`).

---

## 5. Ce que ce document ne promet pas

- **Aucune garantie sur les copies faites hors de l'application.** Une archive
  téléchargée, copiée sur une clé, envoyée par courriel, échappe au produit.
- **Aucune garantie sur les sauvegardes du système d'exploitation.** Si la
  machine sauvegarde `data/` ailleurs, la suppression ne l'atteint pas.
- **Aucun chiffrement.** Les fichiers sont du JSON en clair. Quiconque a accès
  à la machine a accès aux données.
- **Aucune séparation entre participants sur une même machine.** Il n'existe
  qu'un fichier de progression à la fois. Faire passer deux participants sans
  changer `AICOS_PROGRESS_FILE` ou sans supprimer entre les deux mélange leurs
  traces — c'est la condition `N5` de non-interprétabilité, et c'est une
  consigne de procédure, pas un garde-fou logiciel.

---

## 6. Où c'est vérifié

| affirmation | vérifiée par |
|---|---|
| les quatre catégories, et le sort que chaque opération leur réserve | `tests/v771-learner-data.test.mjs` |
| la suppression efface réellement sur le disque | idem — vrais fichiers, vrai répertoire temporaire |
| le curriculum survit à la suppression | idem — curriculum et code source créés à côté, relus après |
| un plan visant le produit est refusé, et alors **rien** n'est supprimé | idem |
| la suppression ne crée aucun filet | idem |
| l'interface ne promet que ce que la carte autorise | `tests/v771-data-rights-ux.test.mjs` |
| la route refuse un appel sans le mot de confirmation | idem |
