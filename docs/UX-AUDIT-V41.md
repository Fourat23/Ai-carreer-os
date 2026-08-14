# Audit UX — Sprint V41 (Learning Experience)

> Audit UX réel des surfaces touchées, audit « AI slop », walkthrough débutant, et verdict par dimension.
> Français, factuel, critique. Un score/état reste un PROXY.

## 1. Périmètre réellement livré (honnête)
V41 a livré le **cœur explicable** (read-model dérivé) et l'a **surfacé sobrement** sur 3 pages
existantes : `/skills` (pourquoi cet état + prochaine action), `/synthese` (jalons + timeline de preuves),
`/` (que faire ensuite). **Non livré** (assumé, dette V42) : skill-map graphique interactive, refonte
/parcours en roadmap, design system complet, refonte /revisions, refonte /capstones en jalons visuels.
Ce choix suit la priorité déclarée du prompt (**pédagogie > UI > décoration** ; « moins de fonctionnalités
mais excellentes ») et son **interdiction explicite de l'AI slop** : mieux valait un noyau explicable
qu'une refonte visuelle spectaculaire mais creuse.

## 2. Audit « AI slop » (auto-contrôle des ajouts V41)
| Symptôme interdit | Présent dans les ajouts V41 ? |
|---|---|
| Grille de cards clonées | **Non** — listes/lignes sémantiques (next-action, timeline, jalons), pas de card-grid |
| Hero marketing / slogan | **Non** |
| Gradients/halos/glassmorphism/blobs | **Non** — surfaces sobres, tokens existants |
| Emojis décoratifs | **Non** — icônes lucide fonctionnelles uniquement |
| Compteurs géants sans décision | **Non** — chiffres accompagnés d'un libellé et d'une action |
| XP / badges / streaks / niveaux | **Non** — jalons = faits pédagogiques, gate anti-XP |
| Info par la couleur seule | **Non** — chaque liseré/état doublé d'un libellé texte |
| Microcopy infantilisante / « AI Coach » | **Non** — ton technique, « dérivé de tes preuves » |

## 3. Walkthrough débutant (bout-en-bout, données baseline)
1. **Ouvre l'app** (`/`) : la carte « Reprendre » répond « où j'en suis » ; le bloc « Que faire ensuite »
   propose des actions dérivées (révisions dues, consolidation, démonstration) **avec leur raison**.
   → *Comprend quoi faire et pourquoi.*
2. **Va sur `/skills`** : chaque compétence montre son état (libellé), et « Pourquoi cet état ? » dévoile
   les raisons (journées/preuves/révision) + la prochaine action pour progresser (ex. `practiced →
   demonstrated`, preuve attendue, lien). → *Comprend la différence vu/pratiqué/démontré.*
3. **Échoue un diagnostic/capstone** (pages V39/V40) : feedback par question + remédiation + debrief ;
   frontière PROXY rappelée. → *L'erreur est pédagogiquement exploitable.*
4. **Revient sur `/synthese`** : la timeline montre la preuve fraîchement obtenue (date · type · titre) et
   un jalon peut s'allumer (« Premier diagnostic passé ») avec son « why ». → *Voit d'où vient sa
   progression et ce qui a changé.*
5. **Sait quoi faire ensuite** : les next-actions se recalculent (déterministe). → *Boucle fermée.*

**Ruptures détectées** : (a) sur une progression **vide** (baseline), les next-actions et la timeline sont
peu fournies — normal, mais l'empty-state de la timeline est explicite (« termine un exercice… »). (b) La
capitalisation d'un capstone/diagnostic en preuve n'est pas automatique (choix de sûreté V40/V41) : le
jalon « premier capstone » ne s'allume que si une preuve capstone existe déjà dans la progression → dette
V42 (bouton opt-in « enregistrer comme preuve »). Aucune rupture **bloquante**.

## 4. Verdict par dimension UI/UX (INSUFFISANT/MOYEN/BON/FORT/EXCELLENT)
| Dimension | Verdict | Justification |
|---|---|---|
| Information Architecture | BON | les 3 questions clés (où/pourquoi/quoi ensuite) ont chacune une surface dédiée ; reste des pages non refondues. |
| Learning UX | FORT | why-this-state + next-action + timeline rendent la progression explicable et actionnable. |
| Visual hierarchy | BON | sections/labels/notes réutilisés ; pas de refonte typographique globale (assumé). |
| Originalité / identité | MOYEN→BON | continuité sobre avec l'existant ; pas de nouvelle identité forte (non visé ce sprint). |
| Professional feel | FORT | ton technique, « poste de pilotage », zéro gadget. |
| Density | BON | dense mais respirable ; détails repliés (details/summary). |
| Mobile | BON | timeline reflow < 640px ; 375px validé sans overflow ; pas de tableau écrasé. |
| Accessibility | BON | `details/summary` natif (clavier), focus hérité, états doublés d'un libellé (jamais couleur seule) ; **pas d'audit axe-core** (non disponible → non revendiqué). |
| Performance | BON | dérivations serveur pures ; composants client inchangés/légers ; aucun graphe lourd envoyé au client. |
| Evidence transparency | FORT | timeline + « why » exposent explicitement d'où vient la progression. |
| Gamification integrity | EXCELLENT | jalons = faits reliés à une preuve ; gate anti-XP ; aucune mécanique addictive. |

## 5. Ce qui reste faible / dette V42
- Pas de **skill-map graphique** ni de **roadmap /parcours** (le graphe reste consultable via données).
- Pas de **capitalisation opt-in** capstone/diagnostic → preuve depuis l'UX (sûreté progress.json).
- Identité visuelle **améliorée à la marge**, pas refondue (design system léger documenté, pas étendu).
- Accessibilité : audit **manuel** ; pas de vérification axe-core automatisée (outil non disponible).

## 6. Limites de l'audit
Auteur unique ; observation de rendu/débordement/erreurs console sur données baseline. Proxys structurels,
pas une mesure d'usage réel.
