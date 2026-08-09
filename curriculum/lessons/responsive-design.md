<!-- keep -->
# Leçon — Responsive design : une interface pour tous les écrans

## 🌍 Le problème d'abord
Ton interface est superbe sur ton grand écran. Un utilisateur l'ouvre sur son téléphone : le texte
est minuscule, il faut zoomer, les colonnes se chevauchent, un bloc déborde et crée une barre de
défilement horizontale disgracieuse. Or aujourd'hui, la majorité du trafic web est mobile. Une
interface qui ne s'adapte pas est une interface à moitié cassée pour la moitié de ses utilisateurs.
Le problème : tu as conçu pour UNE taille d'écran alors qu'il en existe une infinité. Le responsive
design résout ça — non pas en faisant « une version mobile », mais en rendant l'interface FLUIDE et
ADAPTATIVE. Cette leçon t'apprend à penser multi-écrans.

## 🎯 Objectif
Savoir rendre une interface utilisable de 320 px à 1920 px+ : comprendre le rôle du `viewport`, le
principe **mobile-first**, les **media queries** (adapter la mise en page à des seuils de largeur),
et le réflexe de contenus FLUIDES plutôt que de largeurs fixes — pour ne plus jamais livrer une page
cassée sur mobile.

## 🧩 Prérequis
Tu dois savoir disposer des éléments avec Flexbox et Grid, et connaître les unités relatives
(`/doc/lessons/css-layout-flexbox-grid`, `/doc/lessons/css-fundamentals`). Comprendre le box model
et `min-width: 0` est indispensable pour diagnostiquer les débordements. Aucune expérience de design
mobile n'est supposée.

## 🧠 Modèle mental
Le responsive n'est pas « faire un site mobile À CÔTÉ du site desktop » : c'est UN seul document qui
se RÉORGANISE selon la place disponible. Deux idées portent tout :
1. **Fluidité par défaut** : les contenus s'étirent et se contractent (largeurs en `%`/`fr`/`max-width`,
   images `max-width: 100%`) au lieu d'être figés en pixels.
2. **Points de bascule (breakpoints)** : à certaines largeurs, on CHANGE la disposition (une colonne
   sur mobile → trois colonnes sur desktop) via des **media queries**.
Le bon réflexe est **mobile-first** : on écrit d'abord le style pour petit écran (le plus contraint,
donc le plus simple), puis on AJOUTE de la richesse quand l'écran s'élargit. Concevoir dans ce sens
évite d'« entasser » puis de « désentasser » — on construit par ajouts, pas par corrections.

## 💡 Pourquoi c'est important
Un site non responsive perd et frustre ses utilisateurs mobiles, et se fait pénaliser par les moteurs
de recherche (indexation mobile-first). En équipe, « ça marche sur mon écran » n'est jamais une
preuve : la validation multi-largeurs fait partie du travail sérieux. Savoir raisonner responsive,
c'est livrer des interfaces réellement utilisables — et savoir diagnostiquer pourquoi une page déborde
à 375 px (un vrai problème récurrent, y compris sur cette plateforme).

## Explication complète

### La balise viewport (indispensable)
Sans elle, le mobile fait semblant d'être un écran large et « dézoome » ta page. À mettre dans le
`<head>` :
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```
Elle dit au navigateur : « la largeur de rendu = la largeur réelle de l'appareil ». C'est le
préalable non négociable de tout responsive.

### Contenus fluides
- Largeurs relatives : `width: 100%`, `max-width: 640px` (fluide jusqu'à un plafond lisible).
- Images/médias : `img { max-width: 100%; height: auto; }` pour qu'ils ne débordent jamais.
- Typographie et espacements en `rem` : ils suivent les préférences de l'utilisateur.
- Les blocs larges (code, tableaux) gèrent leur propre défilement : `overflow-x: auto` sur eux, et
  `min-width: 0` sur leurs parents flex/grid pour ne pas forcer la page à déborder.

### Les media queries
Elles appliquent des règles CONDITIONNELLES à partir d'un seuil de largeur :
```css
/* Mobile-first : style de base = petit écran (une colonne) */
.galerie { display: grid; grid-template-columns: 1fr; gap: 16px; }

/* À partir de 768px : deux colonnes */
@media (min-width: 768px) {
  .galerie { grid-template-columns: repeat(2, 1fr); }
}
/* À partir de 1200px : trois colonnes */
@media (min-width: 1200px) {
  .galerie { grid-template-columns: repeat(3, 1fr); }
}
```
On utilise `min-width` (mobile-first : on enrichit vers le haut) plutôt que `max-width`. Les seuils
(breakpoints) se choisissent d'après le CONTENU (quand la mise en page « craque »), pas d'après des
modèles de téléphones précis.

### Tester réellement
On valide à plusieurs largeurs typiques — par exemple **375 / 768 / 1024 / 1440 / 1920** — en
vérifiant : pas de défilement horizontal de page, texte lisible sans zoom, cibles cliquables
suffisamment grandes, rien qui se chevauche. Les outils de développement du navigateur simulent ces
largeurs ; c'est un contrôle de routine, pas une option.

## Concepts clés
`viewport` · mobile-first · fluidité (`%`/`fr`/`max-width`, `img{max-width:100%}`) · **media query**
(`@media (min-width: …)`) · breakpoint choisi d'après le contenu · anti-débordement (`overflow-x:auto`
+ `min-width:0`) · validation multi-largeurs.

## 🧭 Exemple guidé
Rendre une galerie responsive, en mobile-first :
```css
/* 1. Base = mobile : une seule colonne, contenus fluides */
.galerie { display: grid; grid-template-columns: 1fr; gap: 16px; }
.galerie img { max-width: 100%; height: auto; }

/* 2. Tablette : deux colonnes */
@media (min-width: 768px) { .galerie { grid-template-columns: repeat(2, 1fr); } }

/* 3. Desktop : trois colonnes */
@media (min-width: 1200px) { .galerie { grid-template-columns: repeat(3, 1fr); } }
```
Raisonnement : on part du cas le plus contraint (une colonne, tout fluide), puis on AJOUTE des
colonnes quand la place le permet. Les images ne débordent jamais (`max-width: 100%`). On teste à
375/768/1024/1440 : la galerie passe de 1 → 2 → 3 colonnes sans jamais provoquer de défilement
horizontal.

## ⚠️ Erreurs fréquentes
- Oublier la balise `viewport` → le mobile « dézoome » toute la page (texte illisible).
- Penser desktop-first puis « rétrécir » → on empile des `max-width` correctifs difficiles à suivre.
- Largeurs fixes en `px` et images sans `max-width: 100%` → débordements sur petit écran.
- Choisir des breakpoints d'après des modèles de téléphones au lieu du moment où le contenu craque.
- Ne tester qu'à une seule largeur (« ça marche chez moi ») et livrer une page cassée sur mobile.

## 🔗 Liens avec le programme
Cette leçon clôt le socle Web Platform (`/doc/lessons/html-semantic-structure`,
`/doc/lessons/css-fundamentals`, `/doc/lessons/css-layout-flexbox-grid`) et irrigue tout le frontend :
les interfaces React (`/doc/lessons/react-fundamentals`) et l'accessibilité
(`/doc/lessons/react-accessibility`) doivent rester utilisables sur tous les écrans. La méthode de
validation multi-largeurs sert aussi à diagnostiquer les débordements réels de la plateforme.

## Mini-exercice
Prends une page à deux colonnes fixes. 1) Ajoute la balise `viewport`. 2) Réécris-la en mobile-first :
une colonne par défaut, deux colonnes à partir de 768 px via une media query. 3) Ajoute `img
{ max-width: 100% }`. 4) Teste à 375/768/1024 px dans les outils du navigateur et vérifie l'absence de
défilement horizontal. Pratique associée : `web-nav`.

## 📚 Vocabulaire
**responsive** · **`viewport`** · **mobile-first** · **fluidité** · **media query** (`@media`) ·
**breakpoint** · **`max-width`** · **`overflow-x: auto` / `min-width: 0`** · **validation multi-largeurs**.

## 🧾 À retenir
Le responsive, c'est UNE interface qui se réorganise, pas deux sites. Mets la balise `viewport`,
raisonne mobile-first (style de base pour petit écran, enrichi par media queries `min-width`), garde
les contenus fluides (`%`/`max-width`, images `max-width: 100%`) et protège-toi des débordements
(`overflow-x` sur les blocs larges, `min-width: 0` sur les parents flex/grid). Choisis les
breakpoints d'après le contenu, et valide toujours à plusieurs largeurs : « ça marche chez moi » n'est
pas une preuve.
