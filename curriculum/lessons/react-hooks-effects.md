<!-- keep -->
# Leçon — React : effets, données async et hooks

## 🎯 Objectif
Maîtriser useEffect (et savoir quand NE PAS l'utiliser), gérer les trois états de toute donnée async (loading/error/data), les formulaires contrôlés, et extraire la logique en hooks personnalisés. C'est le pont entre ton UI et le monde (APIs, LLM).

## 🧠 Modèle mental
`useEffect` est **une synchronisation avec l'EXTÉRIEUR** (réseau, abonnements, timers) — pas un fourre-tout « code à exécuter ». Question filtre avant chaque effet : « est-ce que je synchronise avec quelque chose d'externe ? » Non → tu n'as probablement pas besoin d'un effet (calcule au rendu).

## 📖 Explication complète
- **useEffect(fn, deps)** : fn s'exécute APRÈS le rendu ; le tableau `deps` dit QUAND rejouer (`[]` = au montage ; `[id]` = quand id change). Le **cleanup** (la fonction retournée) nettoie avant le prochain effet/démontage (annuler un abonnement, un timer).
- **Les 3 états async** : toute donnée distante a TROIS états à rendre explicitement — `loading` (indicateur), `error` (message + retry), `data` (le contenu). Les oublier = pages blanches et spinners éternels. Modéliser en un seul état discriminé (`{status: 'loading' | 'error' | 'ok', data?}`) rend les états impossibles à mélanger.
- **StrictMode double appel** : en dev, React monte chaque composant DEUX fois exprès — si ton effet casse, il lui manque un cleanup ou il n'est pas idempotent. C'est un détecteur, pas un bug.
- **« You might not need an effect »** : une valeur dérivée du state se calcule PENDANT le rendu (pas dans un effet + state doublon) ; un événement utilisateur se gère dans le handler. Les effets superflus sont la source n°1 de bugs React.
- **Formulaires contrôlés** : le state est la source de vérité des champs (`value={v} onChange={e => setV(e.target.value)}`) — validation et soumission deviennent triviales.
- **Hooks personnalisés** : extraire une logique réutilisable (`useFetch(url)` qui gère les 3 états) — la factorisation (jour 22), appliquée aux composants.

## 🔧 Exemple simple
```tsx
const [state, setState] = useState<{status:'loading'|'error'|'ok'; data?: Livre[]}>({status:'loading'});
useEffect(() => {
  api.getLivres()
    .then((data) => setState({ status: 'ok', data }))
    .catch(() => setState({ status: 'error' }));
}, []);
if (state.status === 'loading') return <Spinner />;
if (state.status === 'error') return <Erreur onRetry={...} />;
return <Liste livres={state.data!} />;
```

## 🧭 Exemple guidé
**Énoncé** : une recherche qui refetch quand le terme change, sans réponse obsolète.
**Raisonnement** : effet dépendant de `terme` + cleanup pour ignorer les réponses périmées (l'utilisateur tape vite : la réponse de « ch » peut arriver APRÈS celle de « chat »).
**Solution** :
```tsx
useEffect(() => {
  let actif = true;                       // drapeau de fraîcheur
  setState({ status: 'loading' });
  api.chercher(terme)
    .then((data) => { if (actif) setState({ status: 'ok', data }); })
    .catch(() => { if (actif) setState({ status: 'error' }); });
  return () => { actif = false; };        // cleanup : périme l'ancienne requête
}, [terme]);
```
**Explication** : chaque changement de `terme` périme l'effet précédent (cleanup) — la réponse en retard est ignorée. C'est LE pattern anti-course. **Variante** : ajoute un debounce (attendre 300 ms de silence avant de fetch).

## 🤖 Exemple appliqué (IA / data / architecture)
L'UI de DocSense : la question part (loading), la réponse streame (data incrémentale), l'API LLM échoue (error + retry). Le hook `useQuestion()` encapsule ce cycle. Les 3 états async sont EXACTEMENT la gestion d'erreurs de la leçon error-handling, côté interface.

## ⚠️ Erreurs fréquentes
- Dépendances manquantes/en trop (effet qui ne rejoue pas, ou boucle infinie).
- Fetch sans gestion d'error (page cassée dès que le réseau tousse).
- Effet pour calculer un dérivé (calcule au rendu !).
- Réponses obsolètes affichées (pas de cleanup dans les recherches).

## 🚫 Anti-patterns
- Le useEffect fourre-tout de 80 lignes.
- Copier le state dans un autre state via un effet (source de vérité dupliquée).

## ✍️ Mini-exercice
Branche une liste sur ton API (mois 3) avec les 3 états rendus, puis coupe le serveur et vérifie que l'UI affiche l'erreur proprement (avec retry).

## 🔥 Exercice plus difficile
Écris `useFetch<T>(url)` : les 3 états, le cleanup anti-course, le retry — puis utilise-le dans 2 composants différents.

## ✅ Correction attendue
La logique : effet = synchronisation externe ; deps justes ; cleanup ; 3 états rendus ; dérivés hors effets. Vérifie : zéro warning React, l'app survit au serveur coupé, la recherche rapide n'affiche jamais une réponse périmée, et ton hook est réutilisé tel quel.

## 🎤 Questions d'entretien
- « Quand utilises-tu useEffect — et quand pas ? » → Synchroniser avec l'externe ; jamais pour un dérivé (calcul au rendu) ni un événement (handler).
- « Pourquoi le double appel en StrictMode ? » → Détecter les effets sans cleanup/non idempotents — une feature de dev.
- « Comment évites-tu les réponses obsolètes ? » → Cleanup avec drapeau (ou AbortController) : l'effet périmé ignore sa réponse.

## 🧾 À retenir
- useEffect = synchronisation externe, avec deps justes et cleanup.
- Toute donnée async a 3 états, TOUS rendus.
- Dérivés au rendu, événements dans les handlers — pas d'effets superflus.

## 📚 Vocabulaire
**useEffect / dépendances / cleanup** · **course (race condition)** · **AbortController** · **formulaire contrôlé** · **hook personnalisé** · **StrictMode** · **debounce** · **état discriminé**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Mes fetchs rendent les 3 états et survivent au réseau coupé.
- [ ] Mes effets ont deps justes + cleanup (zéro warning).
- [ ] J'ai extrait au moins un hook personnalisé réutilisé.

## 🔗 Liens avec le programme
Mois 4 (jours ~95-115), projet 3, UI DocSense. Leçons liées : `react-fundamentals`, `async-javascript`, `error-handling`.
