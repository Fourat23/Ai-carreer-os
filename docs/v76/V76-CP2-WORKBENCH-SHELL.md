# V76 · CP2 — La coquille du Workbench : auditer, pas redessiner

> **Résultat : aucun défaut démontré sur la coquille. Rien n'a été redessiné.**
>
> `G14` du contrat gelé interdit de remplacer le Workbench existant sans défaut
> démontré. Ce checkpoint est allé en chercher, dans un vrai navigateur, à sept
> largeurs. Il n'en a pas trouvé sur la coquille — et le dit.

---

## 1. La méthode : Chromium, pas la lecture de source

Le CP0 a mesuré la **chaîne** par HTTP. Il ne disait rien de l'**expérience** :
une route qui répond 200 peut rendre une page inutilisable, et le contrat le
refuse explicitement comme preuve (`G8`).

`scripts/v76/ui-audit.mjs` ouvre les pages dans le Chromium de l'environnement,
aux sept largeurs demandées — **1440 · 1280 · 1024 · 768 · 430 · 390 · 375** — et
mesure ce qu'un apprenant verrait. **Cinq pages × sept largeurs = 35 rendus
réels.**

C'est le **même instrument** qui servira au CP13, pour que la comparaison
AVANT/APRÈS ait un sens.

---

## 2. L'éditeur est utilisable à toutes les largeurs

| page | 1440 | 1280 | 1024 | 768 | 430 | 390 | 375 |
|---|---|---|---|---|---|---|---|
| hauteur de l'éditeur (px) | 581 | 518 | 582 | 582 | 431 | 399 | **398** |
| part de la fenêtre | 65 % | 58 % | 65 % | 65 % | 55 % | 51 % | **51 %** |
| boutons visibles | 15 | 15 | 14 | 15 | 15 | 15 | **15** |

**Même à 375 px, l'éditeur occupe la moitié de l'écran et les quinze commandes
restent atteignables.** Le mode étroit de `usePanelLayout` fait son travail : les
panneaux se réorganisent au lieu de disparaître.

C'est exactement ce que le brief demandait sans oser l'espérer :

> *« Le mobile doit être consultable, compréhensible, capable de petites
> modifications, sans sacrifier le desktop. »*

---

## 3. Zéro débordement horizontal

**35 rendus sur 35** : `document.scrollWidth === window.innerWidth`. Aucune page
ne déborde, à aucune largeur.

---

## 4. Accessibilité mesurée sur le rendu réel

| page | `aria-live` | `aria-selected` | `role` | focusables | sans nom accessible |
|---|---|---|---|---|---|
| `workbench` (1440) | **2** | 5 | 14 | 54 | **0** |
| `workbench` (375) | 1 | 1 | 6 | 53 | **0** |
| `workbench-web` (1440) | **2** | 7 | 16 | 58 | **0** |
| `liste-lab` | 1 | 0 | 3 | 46 | **0** |
| `journee` | 2 | 0 | 5 | 96 | **0** |
| **`transfert`** | **0** | 0 | 4 | 49 | **0** |

**Aucun élément sans nom accessible, sur aucune page, à aucune largeur.**

### Le seul écart réel : `transfert` n'annonce rien

**`aria-live` = 0** sur la page d'un défi de transfert. Le résultat d'une
tentative n'est donc **jamais annoncé** à un lecteur d'écran — l'apprenant
aveugle soumet et n'apprend rien de ce qui s'est passé.

**Ce n'est pas un défaut de la coquille du Workbench**, et le plan CP0 l'avait
déjà attribué au **CP8**, qui corrige par ailleurs la fuite de réponse sur la
même page. Il y reste.

### Ce qui reste, et qui n'est pas bloquant

**Cibles tactiles sous 24 px** (seuil WCAG 2.2 AA) : `workbench` 3 à 5,
`transfert` 10, `journee` 16 à 22. Mesuré, consigné, **traité au CP13** avec le
reste du polissage — le contrat ne le classe pas bloquant (`W18`/`W19` demandent
« acceptable » et « minimale »).

---

## 5. Deux fausses alertes de ma propre sonde

**Anomalie n° 3 — quatre faux « éléments sans nom ».** La première version de la
sonde comptait comme fautifs quatre `<input disabled aria-hidden="true"
tabindex="-1">` de la page journée : des cases **décoratives, correctement
retirées de l'arbre d'accessibilité**. La sonde signalait un défaut là où le
produit faisait exactement ce qu'il fallait. Corrigé : un élément `aria-hidden`,
`disabled` ou hors tabulation n'est pas annoncé, donc ne se voit pas réclamer un
nom.

**Anomalie n° 4 — un `404` qui n'existe pas.** La sonde fermait le contexte du
navigateur dès `networkidle`, ce qui **annulait les préchargements RSC de
Next.js** et produisait une erreur de console. En laissant la page vivre 2,5 s :
**aucune réponse ≥ 400, aucune erreur**. L'artefact venait de la mesure, pas du
produit.

Les deux corrections vont dans le même sens que l'anomalie n° 2 du CP0 : **une
sonde mal calibrée invente des défauts ou en cache — les deux sont coûteux.**

---

## 6. Ce qui a été préservé, et pourquoi

| composant | lignes | décision | raison |
|---|---|---|---|
| `LabWorkspace.tsx` | 656 | **conservé** | aucun défaut démontré sur 35 rendus |
| `CodeMirrorEditor.tsx` | 120 | **conservé au CP2** | un défaut le concerne, mais c'est le CP3 |
| `FrontendPreview.tsx` | 100 | **conservé** | l'aperçu web fonctionne |
| `ReactPreview.tsx` | 117 | **conservé** | l'aperçu React fonctionne |
| `TerminalPanel.tsx` | 138 | **conservé** | surface bornée et allowlistée |
| `usePanelLayout.ts` | 81 | **conservé** | c'est lui qui rend 375 px utilisable |

**Aucune ligne de la coquille n'a été modifiée.** C'est le résultat correct quand
l'audit ne trouve rien : le contrat interdit de remplacer sans preuve, et une
refonte « parce que le neuf paraît plus moderne » aurait coûté une régression
pour zéro gain mesuré.

---

## 7. Ce que le CP2 n'a pas mesuré

- **le comportement au clavier de bout en bout** (ordre de tabulation complet,
  piège de focus dans les panneaux) — les compteurs sont là, le parcours ne
  l'est pas. **CP13** ;
- **le zoom à 200 %** — **CP13** ;
- **le contraste** — **CP13** ;
- **l'interaction réelle** (taper, lancer, lire un résultat dans l'interface) —
  c'est le **CP12**, sur douze exercices.

---

## 8. Artefact

`docs/v76/ui-audit-cp2.json` — les 35 rendus, chiffre par chiffre. Le CP13
produira `ui-audit-cp13.json` avec le même script, pour comparaison directe.
