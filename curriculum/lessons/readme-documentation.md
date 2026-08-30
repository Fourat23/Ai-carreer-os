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

## 🧭 Exemple guidé — un README ne se relit pas, il s'exécute

La question « mon README est-il bon ? » n'a pas de réponse tant qu'on la traite
comme une question de rédaction. Elle en a une dès qu'on la reformule :
**quelqu'un qui ne connaît pas le projet peut-il le faire tourner en suivant le
texte à la lettre, sans rien deviner ?** Cette question s'exécute.

Le script `scripts/v70-verifications/readme-executable.sh` applique le protocole
d'un inconnu au dépôt de ce cours lui-même : cloner à neuf, suivre le README à la
lettre, ne rien supposer, chronométrer.

### 1. Les prérequis sont-ils vérifiables ?

```
  ## Prérequis
  - Node.js 20+ (testé sur Node 22) et npm.
  - Rien d'autre : pas de base de données à installer, pas de compte, pas de clé.

  version réellement présente : node v22.22.2, npm 10.9.7
```
*(extrait du README audité, indenté ici pour ne pas être confondu avec un titre
de cette leçon)*

Deux qualités à relever. La version est **un nombre**, pas « une version
récente » — donc vérifiable en une commande. Et la seconde ligne dit ce qui
n'est **pas** nécessaire, ce qui répond d'avance à la question qu'on se pose
toujours : « est-ce qu'il faut installer une base de données pour essayer ? »

### 2. Chaque commande annoncée fonctionne-t-elle ?

```
npm install       : SUCCÈS en 23 s
npm test          : OK      (35 s)
npm run build     : OK      (65 s)
npm run generate  : OK      ( 1 s)
```

Quatre sur quatre. C'est le résultat qu'on espère et il est plus rare qu'on ne
croit : un README vieillit à chaque commit qui renomme un script, et personne ne
le remarque parce que les auteurs, eux, connaissent les vraies commandes.

**La seule façon de savoir est de repartir d'un clone neuf.** Sur ta machine de
travail, `npm test` fonctionne peut-être grâce à quelque chose d'installé il y a
six mois et jamais documenté.

### 3. Le résultat inconfortable : ça marche, et c'est insuffisant

L'audit continue au-delà des commandes, et trouve cinq manques :

```
- aucune section sur la manière de contribuer
- aucune licence : le droit de réutilisation est indéterminé
- aucune capture d écran : on ne sait pas à quoi ressemble le produit
- le README ne dit pas quoi faire APRÈS npm run dev (par où commencer)
- aucun .env.example : les variables attendues ne sont pas documentées
```

Les quatre premiers sont des manques réels. **Le cinquième est un faux positif**,
et il vaut la peine de s'y arrêter : le contrôle cherche mécaniquement un
`.env.example`, mais ce projet n'a besoin d'aucune variable d'environnement — et
son README le dit explicitement (« pas de compte, pas de clé »). Le contrôle
mécanique a signalé une absence qui est une propriété du projet, pas un défaut.

C'est le rappel qui accompagne toute liste de contrôle automatique : **elle
signale des absences, elle ne juge pas leur pertinence.** Un README qui
satisferait tous les contrôles mécaniques en ajoutant un `.env.example` vide
serait moins bon, pas meilleur.

Les quatre vrais manques se hiérarchisent. L'absence de **licence** est la plus
grave et la moins visible : sans licence explicite, le droit d'auteur par défaut
s'applique et personne n'a le droit de réutiliser le code. « C'est public sur
GitHub » ne donne aucun droit. Vient ensuite l'absence de **capture d'écran** :
un lecteur qui doit installer pour savoir à quoi ressemble le produit
n'installera pas. Puis l'absence de **« et maintenant ? »** — la commande
fonctionne, l'application s'ouvre, et le lecteur ne sait pas par où commencer.

### 4. La métrique la plus utile, et elle est mécanique

```
lignes : 219 · mots : 1817 · blocs de code : 10
1er bloc de code à la ligne : 16
```

**Combien de lignes faut-il lire avant de pouvoir taper quelque chose ?** Ici,
seize. C'est court, et c'est la bonne cible : un lecteur qui doit lire soixante
lignes de contexte avant la première commande a déjà fermé l'onglet.

Cette métrique se mesure en une commande sur n'importe quel README, la tienne
comprise. Elle capture ce qui compte — la distance entre l'arrivée et la première
action — bien mieux que la longueur totale, qui ne dit rien.

### 5. L'ordre du README, dérivé de ce qui précède

Le lecteur pose ses questions dans un ordre, et le README y répond dans le même :

1. **Qu'est-ce que c'est ?** Une phrase, en haut, qui dit ce que fait le projet
   et pour qui. Pas l'historique, pas la motivation.
2. **À quoi ça ressemble ?** Une capture, un extrait de sortie, un exemple
   d'appel. C'est ce qui décide de la suite.
3. **Comment je l'essaie ?** Prérequis chiffrés, commandes copiables, et une
   **étape de vérification** qui prouve que ça a marché — « `curl
   localhost:3000/livres` renvoie 5 livres » vaut mieux que « l'application
   démarre ».
4. **Et maintenant ?** La première chose à faire une fois que ça tourne.
5. **Est-ce sérieux ?** Tests, intégration continue, décisions d'architecture.
6. **Quelles sont les limites ?** Ce que le projet ne fait pas, et pourquoi.
   Cette section est celle qui inspire le plus confiance, et c'est la plus
   souvent absente.
7. **Puis-je m'en servir ?** La licence.

Les points 3 et 6 sont ceux qui distinguent un README professionnel. Le premier
parce qu'il s'exécute ; le second parce qu'il montre qu'on connaît son propre
projet.

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
Sans relire : quelle métrique d'un README se mesure en une commande et prédit le
mieux qu'un inconnu essaiera le projet ?

## 🔥 Pratique — exécuter son propre README

**A. Le test du clone neuf.** Clone ton meilleur projet dans un répertoire vide
et suis ton README **à la lettre**, en t'interdisant d'utiliser ce que tu sais.
Chronomètre. Chaque fois que tu dois deviner, chercher ailleurs ou corriger une
commande, note-le. Livrable : le temps jusqu'à « ça tourne », et la liste des
frictions.

**B. L'audit mécanique.** Écris un script qui, sur un dépôt quelconque, mesure :
le nombre de lignes avant le premier bloc de code, le nombre de blocs de code, la
présence d'une licence, d'une capture, d'une étape de vérification, d'une section
sur les limites. Livrable : le script, sa sortie sur deux de tes dépôts, et pour
chaque signalement ta décision — vrai manque ou faux positif justifié.

**C. Vérifier chaque commande.** Écris un script qui extrait les commandes des
blocs `bash` de ton README et tente de les exécuter dans un clone neuf. Livrable :
le tableau commande / résultat / durée.

**D. Réécrire.** Refonds le README selon l'ordre en sept points, avec au moins
une étape de vérification observable et une section « limites » honnête. Refais A
et B. Livrable : les deux mesures avant/après.

**E. Le test des trente secondes.** Fais lire ta première phrase et ta capture à
quelqu'un qui ne connaît pas le projet, chronomètre trente secondes, puis
demande-lui de te dire ce que fait le projet et pour qui. Livrable : ce qu'il a
compris, mot pour mot, et ce que tu changes en conséquence.

## ✅ Correction attendue

**A — les frictions.** Presque personne n'obtient zéro. Les frictions les plus
fréquentes, par ordre : une commande renommée depuis la rédaction du README (le
défaut le plus courant, parce qu'il est invisible pour l'auteur) ; une variable
d'environnement nécessaire mais non documentée ; une dépendance système supposée
présente (une base de données, un outil de compilation) ; un port déjà occupé,
sans que le README dise comment en changer.

Le point à formuler : **tu ne peux pas trouver ces frictions en relisant.** Ton
cerveau complète automatiquement ce qu'il sait. Seul un clone neuf, suivi à la
lettre, les révèle — et si tu ne peux pas t'interdire ton savoir, fais-le faire
par quelqu'un d'autre.

**B — l'audit, et ses faux positifs.** Un bon script signale les six éléments.
Une bonne **réponse** justifie chaque signalement, parce qu'un contrôle mécanique
détecte des absences sans savoir si elles comptent : l'absence de `.env.example`
est un défaut sur un projet qui a des secrets et une non-information sur un
projet qui n'en a pas — c'est exactement le faux positif produit par la mesure de
la section guidée.

Si ta réponse déclare « six manques » sans les trier, tu as construit un
générateur de tâches inutiles. La discipline attendue est la même que pour une
porte de qualité : **savoir ce que le contrôle mesure et ce qu'il ne mesure
pas.**

L'exception : l'absence de licence n'est **jamais** un faux positif. Sans licence
explicite, le droit d'auteur par défaut interdit la réutilisation. Un dépôt
public sans licence est visible et juridiquement inutilisable — ce que très peu
d'auteurs réalisent.

**C — extraire et exécuter.** Deux difficultés que la correction attend que tu
rencontres. Les blocs de code contiennent souvent des commandes **non
exécutables** telles quelles : des invites (`$`), des espaces réservés
(`<ton-token>`), des commentaires. Et certaines commandes sont **destructives** ou
bloquantes (`npm run dev` ne rend jamais la main) — l'extraction automatique doit
les exclure explicitement, ce qui oblige à les identifier.

Cette contrainte a une retombée qui est le vrai bénéfice de l'exercice : elle
pousse à écrire des commandes **réellement copiables**, sans invite ni espace
réservé non signalé. Un README dont les commandes sont automatiquement
exécutables est un README dont les commandes sont copiables par un humain.

**D — l'avant/après.** L'amélioration attendue porte sur deux chiffres : le temps
jusqu'à « ça tourne » et le nombre de lignes avant le premier bloc de code.
Attention au second : le réduire en supprimant la phrase d'introduction serait
une régression. La bonne réduction vient de **remonter** le bloc d'installation,
pas de supprimer le contexte.

Sur la section « limites », le contenu attendu est concret : ce que le projet ne
fait pas, ce qui n'est pas testé, l'échelle à laquelle il n'a pas été essayé.
« Ce projet n'a jamais été testé au-delà de 10 000 lignes » inspire plus
confiance que le silence, parce qu'un lecteur expérimenté sait qu'il existe des
limites et se demande seulement si tu les connais.

**E — les trente secondes.** Le résultat utile est **ce que la personne a
compris, mot pour mot**, et non « oui, c'était clair ». Note sa formulation. Si
elle diffère de la tienne, c'est ta phrase qu'il faut changer, pas son
interprétation.

L'écart typique : l'auteur écrit ce que le projet **est** techniquement
(« une application Next.js avec un moteur de rendu Markdown ») et le lecteur
cherche ce qu'il **fait** et pour qui. La formulation qui marche répond aux deux
en une phrase — c'est exactement ce que fait la première ligne du README audité
plus haut.

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
