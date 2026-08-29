<!-- keep -->
# Leçon — Formulaires web : saisie, validation et accessibilité

## 🌍 Le problème d'abord
Un formulaire semble trivial : un champ, un bouton, on envoie. Puis la réalité : l'utilisateur
tape un e-mail sans `@`, laisse un champ obligatoire vide, clique deux fois, ou navigue au clavier
et ne sait plus quel champ est sélectionné. Un débutant « recode » alors à la main ce que le
navigateur sait déjà faire — mal, et sans accessibilité. Le problème : on ignore que HTML offre des
champs typés, une validation native et des associations label↔champ gratuites. Cette leçon
t'apprend à construire un formulaire correct, validé et utilisable par tous — la porte d'entrée de
presque toute application.

## 🎯 Objectif
Savoir construire un formulaire HTML accessible et validé : associer chaque champ à un `<label>`,
choisir le bon `type` d'`<input>`, utiliser la validation native (`required`, `type`, `min`,
`pattern`), comprendre pourquoi la validation navigateur ne remplace JAMAIS la validation serveur,
et distinguer un formulaire « qui s'affiche » d'un formulaire réellement utilisable.

## 🧩 Prérequis
Tu dois savoir structurer une page avec des balises sémantiques
(`/doc/lessons/html-semantic-structure`) et comprendre le cycle événement → état → DOM
(`/doc/lessons/browser-dom-rendering`). Des bases de JavaScript aident pour la soumission
(`/doc/lessons/javascript-basics`). Aucune expérience préalable de formulaires n'est supposée.

## 🧠 Modèle mental
Un formulaire est un **contrat de saisie** entre l'utilisateur et l'application. Chaque champ
DÉCLARE ce qu'il attend (un e-mail, un nombre, un champ obligatoire) et le navigateur t'offre
gratuitement : le bon clavier sur mobile, une validation de base, et l'accessibilité si tu
associes correctement `<label>` et champ. La règle d'or de sécurité : la validation côté navigateur
est une **commodité pour l'utilisateur**, pas une **garantie** — elle se contourne trivialement, donc
le serveur doit TOUJOURS re-valider. « Pratique côté client, vérité côté serveur. »

## 💡 Pourquoi c'est important
Les formulaires sont partout : connexion, recherche, paiement, paramètres. Un formulaire mal fait
exclut les utilisateurs au clavier et aux lecteurs d'écran, laisse passer des données invalides et
frustre tout le monde. Bien le faire — labels associés, types adaptés, validation native + serveur —
est un marqueur direct de qualité et d'accessibilité. C'est aussi le socle des formulaires React
contrôlés que tu écriras ensuite.

## Explication complète

### Associer label et champ (non négociable)
Chaque champ a un `<label>` associé, de deux façons :
```html
<label for="email">E-mail</label>
<input id="email" name="email" type="email" required />
```
ou en enveloppant le champ dans le label. L'association permet : de cliquer le label pour focaliser
le champ, et au lecteur d'écran d'annoncer le nom du champ. Un placeholder n'est PAS un label (il
disparaît à la saisie et n'est pas lu de façon fiable).

### Choisir le bon `type`
`type="email"`, `type="number"`, `type="tel"`, `type="url"`, `type="date"`, `type="password"`… Le
bon type déclenche le bon clavier sur mobile, une validation adaptée et parfois un widget natif. Un
`type="email"` vaut mieux qu'un `type="text"` « validé » à la main.

### La validation native
Des attributs déclaratifs suffisent souvent : `required` (obligatoire), `min`/`max` (bornes),
`minlength`/`maxlength`, `pattern="[0-9]{5}"` (expression régulière). Le navigateur bloque la
soumission et affiche un message. On peut personnaliser via l'API de contrainte
(`element.setCustomValidity(...)`) sans tout recoder.

### La soumission
Un `<form>` avec un `<button type="submit">` se soumet à l'appui sur Entrée ET au clic — comportement
natif à préserver. En JavaScript, on intercepte pour gérer l'envoi sans rechargement :
```html
<form id="inscription">
  <label for="pseudo">Pseudo</label>
  <input id="pseudo" name="pseudo" required minlength="3" />
  <button type="submit">Créer</button>
</form>
<script>
  document.querySelector('#inscription').addEventListener('submit', (e) => {
    e.preventDefault();               // on gère nous-mêmes
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; } // laisse le navigateur signaler
    // … envoyer les données (fetch), puis re-valider CÔTÉ SERVEUR
  });
</script>
```

### Client vs serveur (sécurité)
La validation navigateur améliore l'expérience mais ne protège rien : un utilisateur peut désactiver
JavaScript ou envoyer une requête directe. **Le serveur doit toujours re-valider** (types, bornes,
autorisations). Ne fais jamais confiance à une donnée « parce que le formulaire l'a validée ».

### Accessibilité des erreurs
Regroupe les champs liés dans `<fieldset>`/`<legend>`. Pour un message d'erreur, relie-le au champ
(`aria-describedby`) et signale l'état invalide (`aria-invalid="true"`) : le lecteur d'écran annonce
alors l'erreur au bon moment, pas seulement une couleur rouge que certains ne perçoivent pas.

## Concepts clés
`<label>` associé (`for`/`id`) · `type` d'`<input>` adapté · validation native (`required`, `pattern`,
`min`/`max`) · `<form>` + `submit` (Entrée & clic) · `checkValidity`/`reportValidity` · client ≠
serveur (re-valider côté serveur) · accessibilité (`fieldset`/`legend`, `aria-describedby`,
`aria-invalid`).

## 🧭 Exemple guidé
Un mini-formulaire d'inscription accessible et validé :
```html
<form id="signup">
  <fieldset>
    <legend>Créer un compte</legend>
    <label for="mail">E-mail</label>
    <input id="mail" name="mail" type="email" required aria-describedby="mail-err" />
    <p id="mail-err" hidden>E-mail invalide.</p>
    <button type="submit">S'inscrire</button>
  </fieldset>
</form>
```
Raisonnement : `type="email"` + `required` donnent une validation native ; le `<label for>` rend le
champ nommé et cliquable ; `aria-describedby` relie un message d'erreur que l'on affiche si
`checkValidity()` échoue. À la soumission, on `preventDefault`, on laisse le navigateur signaler les
erreurs, puis on envoie — et le serveur re-valide. Rien n'est recodé inutilement, tout est accessible.

**Reste à savoir ce que cette validation native garantit exactement.** C'est là que se
prennent les décisions, et la seule façon honnête de trancher est de mesurer. Voici ce que
Chromium accepte réellement pour ce champ `type="email"` :

| saisie | verdict du navigateur |
|---|---|
| `alice@exemple.fr` | accepté |
| `a@b` | **accepté** |
| `alice@exemple` (sans extension) | **accepté** |
| `alice@127.0.0.1` | accepté |
| `alice+promo@exemple.fr` | accepté |
| `  alice@exemple.fr  ` | accepté — les espaces autour sont supprimés |
| `alice@@exemple.fr` | refusé |
| `alice@exemple..fr` | refusé |
| `"a b"@exemple.fr` | **refusé**, alors que cette forme est valide selon la norme |

**Décision 1 — que fait-on de ça ?** Deux conclusions opposées circulent, et les deux sont
fausses. « `type="email"` ne sert à rien puisqu'il laisse passer `a@b` » : faux, il attrape
les vraies fautes de frappe, déclenche le bon clavier sur mobile et affiche un message
traduit, gratuitement. « `type="email"` valide l'adresse » : faux aussi, il vérifie une
**forme**, pas une existence. La bonne lecture est qu'il n'y a rien à durcir ici : aucune
expression régulière ne dira si une boîte aux lettres existe. La seule vérification qui
compte est **l'envoi d'un message de confirmation**, et elle n'appartient ni au navigateur
ni même au formulaire. Beaucoup d'équipes passent des heures sur une regex d'e-mail
« parfaite » — qui, au passage, rejette des adresses légitimes comme la dernière ligne du
tableau — au lieu d'implémenter la seule chose qui tranche.

**Décision 2 — le piège que personne n'attend.** Ajoute un champ quantité :

```html
<input id="quantite" name="quantite" type="number" min="1" max="10" />
```

Mesuré dans le même navigateur : saisir `0` est refusé, `11` est refusé, `3,5` est refusé —
et saisir `abc` est **accepté**. Ce n'est pas un bug : quand le contenu n'est pas un nombre,
le navigateur considère le champ comme vide, `input.value` vaut `""`, et un champ vide sans
`required` est parfaitement valide. Le danger est dans la suite du code : `Number("")` vaut
`0`. Une saisie absurde traverse donc la validation, puis devient une quantité de zéro sans
que rien n'ait signalé quoi que ce soit. La parade tient en deux gestes — mettre `required`,
et lire `input.valueAsNumber` (qui vaut `NaN`, donc se trahit) plutôt que `input.value`.
Retiens surtout la méthode : **un champ valide n'est pas un champ rempli**, et la seule
manière de le savoir était d'essayer.

**Décision 3 — le message d'erreur est-il perçu par tout le monde ?** Afficher le
paragraphe `#mail-err` en rouge ne suffit pas : un utilisateur de lecteur d'écran, dont le
curseur est resté dans le champ, n'apprend rien. Il faut deux choses, et elles sont
indépendantes. `aria-describedby` — déjà présent dans le balisage ci-dessus — fait lire le
message **quand on entre dans le champ**. `aria-invalid="true"`, posé au moment de l'échec,
fait annoncer que le champ est en erreur. Sans le second, le message existe mais rien
n'indique qu'il y a un problème ; sans le premier, on sait qu'il y a un problème mais pas
lequel. Et la couleur ne peut jamais porter l'information seule — c'est aussi pourquoi le
message est du texte, pas seulement une bordure rouge.

**Décision 4 — et le bouton d'envoi désactivé tant que tout n'est pas valide ?** C'est une
idée séduisante et généralement mauvaise. L'utilisateur qui ne comprend pas pourquoi rien ne
se passe n'a aucun moyen de le découvrir : un bouton désactivé n'explique rien, ne reçoit pas
le focus au clavier dans plusieurs navigateurs, et ne déclenche aucun message. Laisse le
bouton actif, laisse la tentative d'envoi échouer, et affiche les erreurs — toutes, pas
seulement la première. **Un refus doit être une information, pas un mur silencieux.**

**Variante qui déplace le problème.** Le formulaire passe la validation, part au serveur, et
celui-ci répond que l'adresse est déjà utilisée. Aucun attribut HTML ne pouvait le savoir :
c'est une contrainte qui dépend de l'état de la base, pas de la forme de la saisie. Il faut
donc que le serveur puisse renvoyer ses erreurs **dans le même vocabulaire que le
formulaire** — un code, un message, et le nom du champ concerné — pour que l'interface les
affiche exactement au même endroit que les erreurs natives. C'est le point de rencontre avec
la conception d'API : si le serveur répond une phrase libre, le formulaire ne peut que
l'afficher en haut de page, loin du champ fautif, et la qualité de l'expérience s'effondre
sur le dernier mètre.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ton formulaire valide tout côté client : `required`, `type="email"`, `pattern`. Le
   serveur peut-il faire confiance aux données reçues ?
2. Tu désactives le bouton d'envoi tant que le formulaire est invalide. Bonne idée ?
3. Un `placeholder="E-mail"` remplace-t-il un `<label>` ?
4. Ton message d'erreur s'affiche en rouge sous le champ. Un utilisateur de lecteur
   d'écran l'apprend-il ?

## ✅ Correction attendue

**La démarche.** La validation client sert le **confort** : signaler tôt, éviter un
aller-retour. La validation serveur sert la **correction** des données. Les deux
existent, elles ne se remplacent jamais, et confondre leurs rôles produit soit une faille,
soit une interface pénible.

**L'erreur probable, et c'est celle qui coûte le plus cher.** À la première question, la
réponse spontanée est « oui, rien d'invalide ne peut être envoyé ». Le serveur ne peut
faire confiance à **rien**.

Les contraintes HTML s'appliquent au formulaire affiché dans un navigateur. Elles ne
s'appliquent pas à `curl`, à un script, à un client mobile, à une requête forgée, ni au
même navigateur avec les outils de développement ouverts — où l'attribut `required`
s'enlève en un clic. La validation client est du code qui s'exécute **sur la machine de
l'utilisateur**, donc sous son contrôle total.

Le piège séduit parce que **le formulaire est la seule voie d'accès que le développeur ait
jamais empruntée.** On teste par l'interface, la contrainte tient à chaque essai, et
l'expérience confirme la croyance à chaque fois. L'existence d'un autre chemin vers
l'endpoint n'est pas ignorée : elle n'est simplement jamais rencontrée. C'est la même
illusion que le champ caché ou le bouton désactivé — la protection est réelle contre les
utilisateurs ordinaires, et inexistante contre quiconque décide d'y regarder.

La règle, sans exception : **toute contrainte qui compte est vérifiée côté serveur.** Le
client la duplique pour le confort.

**Sur les autres questions.** Désactiver le bouton d'envoi est une mauvaise idée
répandue, et pour une raison que peu de gens anticipent : un bouton `disabled` n'est
**pas atteignable au clavier** et n'est pas annoncé. L'utilisateur qui ne voit pas les
messages d'erreur — parce qu'il navigue au lecteur d'écran, ou parce qu'ils sont hors
écran — se retrouve devant un formulaire qui **ne réagit pas**, sans savoir pourquoi.
Mieux vaut laisser le bouton actif, laisser la soumission avoir lieu, et **afficher les
erreurs en déplaçant le focus** sur la première d'entre elles.

Un `placeholder` ne remplace pas un `<label>`, pour quatre raisons cumulées : il
**disparaît** dès la première frappe, donc l'utilisateur ne peut plus vérifier de quel
champ il s'agit ; son contraste est délibérément faible ; il n'est pas lu de façon fiable
par tous les lecteurs d'écran ; et cliquer dessus ne focalise pas le champ. C'est une
**indication de format** (« jean@exemple.fr »), pas un nom.

Enfin, un message d'erreur simplement affiché en rouge sous le champ n'est **pas** annoncé.
Il faut le relier au champ par `aria-describedby`, et signaler l'état par
`aria-invalid="true"` — le lecteur d'écran annonce alors « E-mail, invalide, e-mail
invalide » au lieu de « E-mail ». La couleur seule ne transmet d'ailleurs rien à personne
qui ne la distingue pas : tout message d'erreur doit porter du **texte**.

**Alternative défendable.** Valider **au moment de quitter le champ** (`blur`) plutôt qu'à
chaque frappe est souvent supérieur : signaler « e-mail invalide » pendant que
l'utilisateur est en train de le taper est agressif et inutile. Une validation à la sortie
du champ, puis à la soumission, respecte le rythme de la saisie tout en signalant tôt.

**Vérifie seul, sans corrigé** :
1. Envoie une requête directement à ton endpoint avec des données invalides, sans passer
   par le formulaire. Que répond le serveur ?
2. Retire l'attribut `required` dans les outils de développement et soumets. Le temps que
   cela prend est la mesure exacte de la protection qu'il offre.
3. Provoque une erreur et écoute la page avec un lecteur d'écran, ou vérifie simplement la
   présence de `aria-describedby` et `aria-invalid`.

## ⚠️ Erreurs fréquentes
- Utiliser un `placeholder` comme label (disparaît, mal lu par l'assistance).
- `type="text"` pour un e-mail/nombre au lieu du type dédié → mauvais clavier, validation manuelle inutile.
- Se fier à la validation navigateur pour la sécurité → le serveur DOIT re-valider.
- Signaler une erreur uniquement par la couleur (rouge) → invisible pour beaucoup d'utilisateurs.
- Détourner un `<div onclick>` en bouton d'envoi → casse la soumission au clavier (Entrée).

## 🔗 Liens avec le programme
Cette leçon s'appuie sur `/doc/lessons/html-semantic-structure` et
`/doc/lessons/browser-dom-rendering`, et prépare les formulaires React contrôlés
(`/doc/lessons/react-hooks-effects`) — où l'« état » du champ vit dans le composant. L'accessibilité
approfondie est traitée dans `/doc/lessons/react-accessibility`. La règle client≠serveur rejoint
`/doc/lessons/authentication` et la validation d'API.

## Mini-exercice
Construis un formulaire de contact (nom requis ≥ 2 caractères, e-mail requis, message requis) : chaque
champ a un `<label>` associé, un `type` adapté et une contrainte native. Intercepte `submit`, utilise
`checkValidity()`/`reportValidity()`, et affiche un message d'erreur relié par `aria-describedby`.
Vérifie que tout se remplit et se soumet au clavier seul. Pratique associée : `web-greeting-form`,
`web-card`.

## 📚 Vocabulaire
**`<label>` associé** · **`type` d'input** · **validation native** (`required`/`pattern`/`min`) ·
**`<form>` / `submit`** · **`checkValidity` / `reportValidity`** · **client ≠ serveur** ·
**`fieldset` / `legend`** · **`aria-describedby` / `aria-invalid`**.

## 🧾 À retenir
Un formulaire est un contrat de saisie : déclare l'attendu (labels associés, bons `type`,
contraintes natives) et le navigateur t'offre validation, clavier adapté et accessibilité. Intercepte
`submit` avec `checkValidity`/`reportValidity` plutôt que tout recoder. Surtout : la validation
navigateur est une commodité, jamais une garantie — le serveur re-valide toujours. Et signale les
erreurs de façon accessible, pas seulement par la couleur.
