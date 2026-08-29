<!-- keep -->
# Leçon — Changements cassants et compatibilité

## 🌍 Le problème d'abord
Tu publies une fonction, une API ou une bibliothèque, et d'autres codes l'utilisent — les
tiens ailleurs, ceux de collègues, parfois des clients. Un jour tu veux l'améliorer : renommer
un paramètre, changer le format d'une réponse, supprimer une option. Tu modifies… et soudain
tout ce qui dépendait de l'ancienne forme CASSE, parfois en production, parfois chez des gens
que tu ne connais pas. Le problème n'est pas d'améliorer ton code : c'est de le faire ÉVOLUER
sans briser ceux qui comptent dessus. Cette leçon t'apprend à distinguer un changement
« cassant » d'un changement compatible, et à faire évoluer un contrat en douceur — une
compétence décisive dès qu'on ne code plus tout seul dans son coin.

## 🎯 Objectif
Distinguer un **changement cassant** (breaking) d'un **changement compatible**, comprendre la
**compatibilité descendante** et le **versionnement sémantique**, et savoir faire évoluer un
contrat (fonction, API, format) via un **cycle de dépréciation** plutôt qu'une rupture brutale.

## 🧩 Prérequis
Tu dois comprendre ce qu'est un contrat de code — une signature de fonction, un contrat d'API
(`/doc/lessons/typescript-basics`, `/doc/lessons/http-rest-json`, `/doc/lessons/api-design-basics`
si tu l'as vue) — car un changement cassant est une rupture de ce contrat. La migration de schéma
(`/doc/lessons/database-migrations`, programmée au mois 5) est une application voisine de la
même idée.

> **Étagère de référence.** `/doc/lessons/deployment-strategies` applique la compatibilité au
> déploiement lui-même. Elle n'est programmée par aucune des 365 journées — tu peux l'ouvrir
> librement, et rien ici ne suppose que tu l'as lue.

## 🧠 Modèle mental
Tout code réutilisé expose un **contrat** : ce que les autres tiennent pour acquis (les
paramètres attendus, la forme de la réponse, les noms). Un changement est **compatible** si
tout code écrit pour l'ancien contrat continue de marcher sans modification ; il est
**cassant** s'il oblige les autres à changer leur code. La règle d'or : on ÉLARGIT sans jamais
RESTREINDRE en silence. Ajouter (un champ optionnel, une nouvelle fonction) est presque
toujours compatible ; retirer ou changer le sens de l'existant est presque toujours cassant.
Quand un changement cassant est inévitable, on ne l'impose pas d'un coup : on prévient, on
laisse une transition, puis on retire.

## 💡 Pourquoi c'est important
Dès que ton code a des utilisateurs — coéquipiers, autres services, consommateurs d'API,
utilisateurs d'une bibliothèque — un changement cassant mal géré provoque des pannes en
cascade et détruit la confiance. Savoir évoluer sans casser est ce qui permet à une équipe
d'avancer en parallèle sans se bloquer, et à un produit de durer. C'est une marque de séniorité
immédiatement visible en revue de code (« attention, ça casse les appelants existants ») et un
sujet d'entretien classique sur la conception d'API.

## Explication complète

### Compatible vs cassant : la question à se poser
Avant tout changement d'un code utilisé ailleurs : « le code écrit pour l'ANCIENNE version
continue-t-il de fonctionner sans modification ? ». Si oui → compatible. Si non → cassant.
Exemples compatibles : ajouter un paramètre OPTIONNEL, ajouter un champ à une réponse, ajouter
une nouvelle fonction/endpoint. Exemples cassants : renommer/supprimer un paramètre ou un
champ, rendre obligatoire un paramètre optionnel, changer un type ou le sens d'une valeur,
changer un code de statut.

### Compatibilité descendante (backward compatibility)
Un changement est **rétro-compatible** si les anciens appelants continuent de fonctionner. C'est
l'objectif par défaut : la grande majorité des évolutions peuvent être faites de façon
additive. Astuce fréquente : au lieu de changer une fonction, en AJOUTER une nouvelle à côté et
laisser l'ancienne déléguer — les appelants migrent à leur rythme.

### Le versionnement sémantique (SemVer)
La convention `MAJEUR.MINEUR.CORRECTIF` (ex. `2.4.1`) COMMUNIQUE la nature d'un changement :
- **CORRECTIF** (2.4.1 → 2.4.2) : correction de bug, compatible.
- **MINEUR** (2.4 → 2.5) : ajout de fonctionnalité, compatible.
- **MAJEUR** (2.x → 3.0) : changement CASSANT assumé.
Incrémenter le numéro majeur est la façon d'annoncer « attention, il faudra adapter votre
code ». Respecter SemVer, c'est tenir une promesse : une mise à jour mineure ne doit jamais
casser.

### Le cycle de dépréciation (retirer en douceur)
Quand il faut vraiment supprimer ou remplacer quelque chose, on ne l'arrache pas :
1. **Introduire** la nouvelle forme (compatible, à côté de l'ancienne).
2. **Déprécier** l'ancienne : la marquer comme obsolète (avertissement, `@deprecated`,
   documentation, changelog) tout en la gardant fonctionnelle. On indique QUOI utiliser à la
   place et QUAND elle disparaîtra.
3. Laisser une **période de transition** pour que les appelants migrent.
4. **Retirer** l'ancienne seulement à une version MAJEURE annoncée.
Ce cycle transforme une rupture brutale en une transition prévisible.

### Le changelog : communiquer les changements
Un **changelog** liste, par version, ce qui a changé — en signalant clairement les changements
CASSANTS et les dépréciations. C'est le canal par lequel les utilisateurs de ton code
apprennent ce qu'ils doivent adapter. Un changement cassant non documenté est une trahison du
contrat, même si le code « marche ».

## Concepts clés
Contrat (fonction/API/format) · changement compatible vs cassant · compatibilité descendante ·
ajout additif · versionnement sémantique (majeur/mineur/correctif) · dépréciation · période de
transition · changelog · tolérance du consommateur (ignorer les champs inconnus).

## 🧭 Exemple guidé
Renommer un champ d'API `nom` → `nomComplet` sans casser les clients existants :
```
1. AJOUTER : la réponse renvoie DÉSORMAIS les DEUX champs (nom ET nomComplet) — compatible,
   les anciens clients lisent toujours `nom`.
2. DÉPRÉCIER : documenter que `nom` est obsolète, remplacé par `nomComplet`, avec une date de
   retrait ; l'annoncer dans le changelog.
3. TRANSITION : les clients migrent vers `nomComplet` à leur rythme.
4. RETIRER `nom` uniquement à la prochaine version MAJEURE annoncée.
```
C'est exactement le motif expand/contract des migrations de base, appliqué à un contrat d'API :
on élargit, on laisse migrer, on rétrécit — jamais de rupture sèche.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. « Ajouter un champ à une réponse est toujours compatible. » Vrai ou faux ?
2. Tu corriges un bug : une fonction qui renvoyait `null` renvoie désormais un tableau
   vide. Quelle version poses-tu — correctif, mineure ou majeure ?
3. Tu changes le libellé d'une erreur, de « Utilisateur introuvable » à « Compte
   introuvable ». Cassant ?
4. Tu déprécies une fonction. Combien de temps la gardes-tu ?

## ✅ Correction attendue

**La démarche.** Une seule question, posée du point de vue de l'appelant, jamais du
tien : *le code écrit hier fonctionne-t-il encore sans être modifié ?* Tout le reste en
découle.

**L'erreur probable : appliquer « additif = compatible » comme une règle sans exception.**
C'est la bonne heuristique, elle est vraie la plupart du temps, et c'est ce qui rend ses
exceptions coûteuses. Ajouter un champ **peut** casser :

- si un consommateur valide la réponse contre un schéma **strict** — beaucoup de
  générateurs de clients produisent une validation qui rejette tout champ inconnu ;
- s'il **itère** sur les champs pour construire un affichage ou une ligne de fichier : le
  nouveau champ apparaît là où personne ne l'attendait ;
- si la réponse est **sérialisée puis signée**, ou comparée à une empreinte : l'ajout
  change la signature ;
- si le champ **porte le même nom** qu'un champ que le client ajoutait lui-même en local.

Le piège séduit parce que la règle est enseignée sous forme absolue, qu'elle est vraie
dans quatre-vingt-quinze pour cent des cas, et surtout parce qu'**on ne peut pas vérifier
la contrainte depuis chez soi** : ce qui casse est chez le consommateur, dans un code
qu'on ne lit pas.

La formulation correcte n'est donc pas « l'additif est sûr », mais : **la compatibilité
est une propriété de la relation entre deux codes, pas d'un changement pris isolément.**
D'où la pratique qui règle le problème : publier un **contrat explicite** (schéma
versionné), documenter que les champs inconnus doivent être ignorés — le principe de
robustesse — et, pour une API interne, savoir qui sont ses consommateurs et les tester.

**Sur les autres questions.** `null` devenant un tableau vide est une correction de bug
qui est **cassante** : tout appelant qui écrivait `if (r === null)` cesse de fonctionner,
silencieusement — un tableau vide n'est pas `null`, et le test échoue sans erreur. C'est
donc une version **majeure**, et c'est la situation la plus inconfortable du versionnement
sémantique : *corriger un bug peut exiger une version majeure*, parce que du code s'est
adapté au comportement fautif. SemVer décrit la **compatibilité**, pas la justesse.

Changer un libellé d'erreur n'est en principe pas cassant — mais l'est en pratique dès que
quelqu'un compare la chaîne. C'est exactement pourquoi une erreur d'API doit porter un
**code stable** (`USER_NOT_FOUND`) à côté de son message : le code est le contrat, le
message est pour l'humain et peut changer, y compris de langue.

Enfin, la durée de dépréciation ne se compte pas en mois mais en **cycles de mise à jour
des consommateurs**. Pour une bibliothèque interne dont on connaît les appelants, quelques
semaines suffisent — on peut le vérifier. Pour une API publique avec des clients mobiles,
c'est un an ou plus, parce qu'**on ne force pas la mise à jour d'une application
installée**. La bonne question n'est pas « combien de temps » mais « comment saurai-je que
plus personne ne l'utilise » : sans télémétrie d'usage, la réponse est « jamais », et l'on
choisit une date par superstition.

**Alternative défendable.** Certaines équipes renoncent au versionnement sémantique pour
un versionnement **par date** ou par numéro incrémental, et compensent par une
documentation des changements et un engagement de support. C'est défendable quand la
distinction majeur/mineur devient un débat permanent — SemVer suppose un consensus sur ce
qui est cassant, et ce consensus est parfois plus coûteux que ce qu'il apporte.

**Vérifie seul, sans corrigé** :
1. Prends ton dernier changement « additif ». Comment sais-tu qu'aucun consommateur ne
   valide strictement ?
2. Tes erreurs portent-elles un code stable, ou seulement un message ?
3. Sur ta dernière dépréciation : sais-tu combien d'appels utilisent encore l'ancienne
   voie ? Sinon, ta date de retrait est arbitraire.

## ⚠️ Erreurs fréquentes
- Renommer/supprimer un champ ou un paramètre utilisé, d'un coup, en croyant que « c'est un
  détail » : ça casse tous les appelants.
- Rendre obligatoire un paramètre jusque-là optionnel (cassant, souvent sous-estimé).
- Publier un changement cassant en version mineure (viole SemVer et la confiance).
- Retirer l'ancienne forme sans période de dépréciation ni changelog.
- Côté consommateur : planter sur un champ INCONNU au lieu de l'ignorer (être tolérant rend les
  évolutions du producteur plus faciles).

## 🔗 Liens avec le programme
C'est la version « contrat de code » de ce que `/doc/lessons/database-migrations` fait pour le
schéma et `/doc/lessons/deployment-strategies` pour le déploiement (expand/contract partout).
La conception de contrats clairs vient de `/doc/lessons/api-design-basics` et
`/doc/lessons/typescript-basics`. Tes futures apps (mois 8+) qui exposent ou consomment des APIs
dépendent de cette discipline pour évoluer sans casser.

## Mini-exercice
On te demande de changer une fonction `envoyerEmail(dest, sujet, corps)` en
`envoyerEmail(options)` (un seul objet). (1) Ce changement est-il cassant ? (2) Propose une
évolution compatible qui accepte les DEUX formes pendant une transition. (3) Décris le cycle de
dépréciation et à quelle version tu retirerais l'ancienne signature. Rédige la ligne de
changelog correspondante.

## 📚 Vocabulaire
**contrat** · **changement cassant (breaking)** · **compatible / rétro-compatible** ·
**versionnement sémantique (SemVer)** · **majeur / mineur / correctif** · **dépréciation** ·
**période de transition** · **changelog** · **tolérance du consommateur**.

## 🧾 À retenir
Dès que ton code est utilisé ailleurs, il expose un contrat qu'il ne faut pas briser sans
prévenir. Un changement est compatible s'il n'oblige personne à modifier son code (surtout des
ajouts) et cassant sinon. On privilégie toujours l'évolution additive et rétro-compatible ; on
communique la nature des changements par le versionnement sémantique ; et quand une rupture est
inévitable, on la rend prévisible par un cycle de dépréciation (introduire → déprécier → laisser
migrer → retirer en version majeure) documenté dans le changelog.
