# Protocole de test humain léger — préparé, **non exécuté**

> **Statut : NON EXÉCUTÉ.** Aucun humain n'a suivi ce protocole. `REAL_HUMAN_LEARNING_EVIDENCE`
> vaut `NOT YET MEASURED` et le restera tant que ce document n'aura pas produit de données.
> Ce fichier est un **plan**, pas un résultat. Il ne contient aucun chiffre de participant,
> aucun score, aucun taux — et il ne doit jamais en contenir d'inventé.

---

## 0. Pourquoi ce protocole existe

V71 a certifié la **qualité du texte**. V72 a mesuré l'**intégrité du parcours** et fait passer
à 24 leçons une validation par un lecteur simulé — dont le principal résultat est que
l'instrument **ne discrimine pas** : le modèle répondait déjà correctement à 84 % des questions
**avant** d'ouvrir la leçon.

Quatre questions restent donc entières, et **aucune ne peut être tranchée sans un humain** :

1. une leçon est-elle **trop dense** pour quelqu'un qui découvre ?
2. suppose-t-elle un prérequis que son lecteur n'a pas, sans le dire ?
3. **décourage**-t-elle ?
4. reste-t-il quelque chose **48 heures plus tard** ?

Ce protocole est conçu pour répondre à ces quatre-là avec le moins de participants possible, et
rien d'autre.

---

## 1. Dimensionnement — délibérément petit

| | |
|---|---|
| participants | **5 à 8** |
| profil | ceux que le produit vise : bases de programmation, **pas** ingénieur IA |
| durée par participant | **2 × 90 min**, à 48 h d'intervalle |
| leçons par participant | **3** |
| coût total | environ **12 à 20 heures** de participants |

**Pourquoi cinq suffisent, et ce qu'ils ne donnent pas.** Cinq lecteurs révèlent les défauts
d'utilisabilité massifs — le passage où tout le monde décroche, le mot que personne ne connaît,
la consigne que personne ne comprend de la même façon. C'est ce qu'on cherche ici.

Cinq lecteurs ne donnent **pas** de taux d'apprentissage, ne comparent pas deux versions, et ne
permettent aucune inférence sur une population. **Aucun pourcentage ne doit être calculé sur
cet échantillon**, et le rapport qui en sortira devra le dire en tête.

---

## 2. Choix des leçons — décidé avant, publié avant

Trois leçons par participant, tirées ainsi :

| rang | critère | raison |
|---|---|---|
| 1 | une leçon **notée haut** par V71 et **au plafond** au CP5 | si elle échoue sur un humain, l'écart texte/apprentissage est établi |
| 2 | une leçon dont le **TRANSFERT** est resté à 0,75 (`linux-resources-io`, `ci-cd-pipeline-anatomy`, `cloud-azure-core`) | le seul écart que l'instrument simulé ait détecté |
| 3 | une leçon **dense**, au-dessus du 3ᵉ quartile de lecture | teste directement la question de la densité |

**La liste nominative des leçons est tirée et publiée AVANT la première session**, comme
l'échantillon du CP5 l'a été, avec sa graine. Choisir les leçons après avoir vu les premiers
participants invaliderait tout.

---

## 3. Séance 1 — 90 minutes

| étape | durée | ce qu'on demande | ce qu'on mesure |
|---|---|---|---|
| **A. pré-test** | 10 min | répondre aux questions d'application et de transfert **avant** d'ouvrir la leçon | ce qui est déjà su — sans ce chiffre, rien n'est attribuable au texte |
| **B. lecture pensée à voix haute** | 25 min | lire la leçon **en disant ce qu'on pense**, sans être interrompu | l'endroit exact du décrochage |
| **C. restitution** | 15 min | leçon fermée : qu'est-ce que ça enseigne, et à quoi ça sert | ce qui reste immédiatement |
| **D. cas neuf** | 25 min | un cas que la leçon n'a pas traité | l'action, pas la récitation |
| **E. entretien** | 15 min | trois questions ouvertes (§5) | le découragement et le prérequis manquant |

**La règle qui rend B utile** : l'animateur **ne répond à aucune question** pendant la lecture.
Chaque question posée est notée telle quelle — c'est une **donnée**, la trace d'un endroit où le
texte ne se suffit pas. Y répondre détruit la mesure et rend le participant poli.

---

## 4. Séance 2 — 48 heures plus tard, 30 minutes

Sans relecture, sans prévenir du contenu :

1. **rappel libre** — que reste-t-il de la leçon ? (5 min)
2. **les mêmes questions d'application qu'à l'étape D**, sur un cas différent (20 min)
3. **une question** : y es-tu revenu entre les deux séances ? si oui, sur quoi ? (5 min)

C'est le seul endroit du dispositif où un **rappel différé réel** est possible. Le protocole
simulé du CP4 avait déclaré `DELAYED_RECALL = NOT MEASURED` précisément parce qu'un agent ne
peut pas oublier entre deux tours. **Un humain, si.** C'est la valeur propre de ce protocole, et
la raison principale de le faire.

---

## 5. Les trois questions d'entretien, et pourquoi celles-là

1. **« À quel moment as-tu eu envie d'arrêter ? »** — formulée en supposant que c'est arrivé.
   Demander « as-tu eu envie d'arrêter ? » invite à répondre non par politesse.
2. **« Qu'est-ce qui était supposé connu et que tu ne connaissais pas ? »** — la seule façon
   d'attraper la classe B des prérequis (exigence non signalée), que le contrôle automatique ne
   voit pas quand la notion n'est pas dans la section « Prérequis ».
3. **« Qu'est-ce que tu saurais faire maintenant que tu ne savais pas faire avant ? »** — si la
   réponse est un savoir et non un faire, la leçon explique sans outiller.

---

## 6. Ce qui est enregistré, et ce qui ne l'est jamais

**Enregistré** : les questions posées pendant la lecture, verbatim ; l'horodatage des
décrochages ; les réponses aux étapes A, C, D et à la séance 2 ; les trois réponses d'entretien.

**Jamais enregistré ni écrit dans le produit** : aucun état de progression, aucun score de
compétence, aucune donnée d'usage. **`data/progress.json` n'est pas touché** — c'est l'interdit
M8 du contrat V72, et il vaut aussi pour ce protocole.

---

## 7. Ce que le résultat pourra dire, et dans quels mots

| observation | formulation autorisée |
|---|---|
| 3 participants sur 5 décrochent au même paragraphe | « ce passage bloque les lecteurs débutants » |
| une notion revient dans la question 2 chez plusieurs | « cette leçon suppose X sans l'annoncer » |
| l'application échoue à 48 h après avoir réussi à J0 | « la leçon se comprend mais ne s'installe pas » |
| tout se passe bien | « aucun blocage observé **chez ces cinq lecteurs** » |
| **quel que soit le résultat** | **jamais** un pourcentage, **jamais** « les apprenants apprennent », **jamais** une extrapolation à la population |

---

## 8. Ce qui invaliderait ce protocole

À dire d'avance, comme pour le protocole simulé :

1. si l'animateur répond aux questions pendant l'étape B ;
2. si les leçons testées sont choisies après avoir vu des participants ;
3. si la séance 2 est avancée ou si le participant est prévenu de son contenu ;
4. si un pourcentage est calculé sur cinq à huit personnes ;
5. si un résultat favorable sert à requalifier `REAL_HUMAN_LEARNING_EVIDENCE` sans que les
   données brutes soient publiées avec.

---

## 9. Ce qu'il faut décider avant de lancer quoi que ce soit

**Rien n'est lancé automatiquement.** Trois décisions appartiennent à l'utilisateur :

1. **recruter ou non** cinq à huit participants du profil visé ;
2. **qui anime** — l'animateur ne doit pas être l'auteur des leçons testées ;
3. **ce qui est fait du résultat** : si des leçons bloquent, faut-il les corriger, ou d'abord en
   tester davantage ?
