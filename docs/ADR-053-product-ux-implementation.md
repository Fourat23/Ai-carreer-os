# ADR-053 — Product UX Implementation I (surfaces pilotes + design system adopté)

- **Statut** : accepté (V53).
- **Contexte** : V52 a formalisé le contrat de design system (ADR-052), le vocabulaire
  produit (`lib/skill-vocabulary.mjs`), le gate `v52:check`, et corrigé le P0 `/day`.
  V52 a **reporté le travail visuel réel** à V53. L'audit CP0 V53 (captures navigateur
  réelles) confirme une UI **sobre mais générique** et **hors de la direction chromatique
  visée** : accent teal `#63a6a0` au lieu d'indigo/violet ; rail dashboard = pile de
  cartes de poids égal ; page Compétences monotone ; aucune primitive React partagée.

## Décision

Matérialiser le produit **au-dessus du Curriculum 1.0 gelé**, sans nouvelle source de
vérité ni gamification, en trois axes :

### 1. Recolorisation du système (token-level)
- **Accent de marque → indigo/violet** : `--accent` passe de teal à indigo minéral,
  utilisé **avec parcimonie** (liens, focus, éléments actifs, 1 accent par zone).
- **Découplage accent / succès** : `--accent-2` cesse d'être un alias de `--ok`. Le vert
  de succès (`--ok`) reste réservé au statut « réussi/terminé/démontré ». L'accent ne
  signale jamais un succès.
- Aucune couleur nouvelle en dur dans les TSX. Les 6 hex hérités (`app/calendar`) et les
  hex de `globals.css` (`wb-terminal-status`) sont consolidés vers des tokens.

### 2. Primitives React partagées (`app/ui/`)
Extraire **uniquement les primitives à ≥2 usages réels**, exprimant une intention
produit (pas un mini-framework, pas une `Card` générique en mosaïque) :

| Primitive | Intention | Usages pilotes |
|---|---|---|
| `PageHeader` | eyebrow + titre + sous-titre + slot actions | Dashboard, Compétences |
| `SectionHeader` | label + titre + note alignée | Dashboard, Aujourd'hui |
| `Status` | état sémantique = **libellé + ton + point** (jamais couleur seule) | Dashboard, Aujourd'hui, Compétences |
| `Metric` | valeur + clé + sous-texte (donnée réelle, pas vanity) | Dashboard, Compétences |
| `ActionRow` | action → raison → but/preuve (dérivé du read-model) | Dashboard, Aujourd'hui |
| `EmptyState` | vide honnête, pas de faux contenu | Dashboard, Compétences, Aujourd'hui |
| `InlineNotice` | avis contextuel (info/attention/blocking) | Aujourd'hui, Compétences |
| `Panel` | surface calme titrée | Dashboard (rail), Compétences |

Les primitives **ne portent aucune logique de progression** : elles reçoivent des données
déjà dérivées des read-models existants (`learning-experience`, `skill-state`,
`skill-vocabulary`, `review`, `position`). Zéro second moteur.

### 3. Hiérarchie éditoriale des 3 pilotes
Lecture naturelle imposée : **contexte → état → raison → action → détail**.
- **Dashboard** : « où / pourquoi / quoi maintenant » en < 10 s. Rail droit **hiérarchisé**
  (révisions dues = action primaire ; le reste = secondaire calme).
- **Aujourd'hui** : « pourquoi ce jour + ordre conseillé + prochaine action » proéminents ;
  activités (leçons/exos/missions/révisions) distinguées ; ne pas casser le P0.
- **Compétences** : **regroupement par état** (`STATUS_DISPLAY_ORDER` de V52) au lieu d'une
  liste plate ; chaque compétence garde libellé + « Pourquoi cet état ? » + prochaine action.

## Invariants (non négociables)
- Curriculum 1.0 **gelé** (365 jours, 128 leçons, ordre, prérequis) ; corpus SHA-1 inchangé.
- `progress.json` intact (`323604021055588a9528a86875f36598dbdc7758`).
- **Une seule source de vérité** ; primitives sans état pédagogique propre.
- **Anti-gamification / anti-AI-slop** : aucun XP, niveau, streak, badge RPG, leaderboard,
  confetti, hero marketing, glow/gradient décoratif, radar, stat vanity, emoji structurel.
- Statut jamais porté par la couleur seule (toujours libellé + point/icône).
- Score/état jamais sans explication accessible.

## Conséquences
- Chaque écran change **visiblement** (accent indigo + hiérarchie) : deux captures V52/V53
  ne peuvent pas être confondues.
- Le gate `v53:check` verrouille : anti-gamification, routes pilotes, primitives comme
  source unique de présentation, absence de moteur parallèle, tokens critiques, indigo,
  non-régression `/day`.
- Migration large des 37 routes **hors périmètre V53** (matrice KEEP/MIGRATE/… produite,
  exécution en V54).
