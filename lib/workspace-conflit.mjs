// V76 · CP9 — CE QUE LA SURFACE DOIT FAIRE D'UNE SAUVEGARDE REFUSÉE.
// Module PUR, sans aucun import Node : il est chargé par un composant client.
//
// ── POURQUOI CE MODULE EXISTE ───────────────────────────────────────────
//
// La mutation « la surface ignore le conflit » a SURVÉCU au premier passage du
// CP9. Le test cherchait `setConflit(` dans le composant — et le composant en
// contient deux : celui qui remet l'avertissement à zéro après un succès, et
// celui qui l'allume après un refus. Effacer le second laissait le premier, donc
// le test vert, **pendant que le refus redevenait invisible**.
//
// C'est la même leçon qu'au CP5 pour la frontière d'exécution, et qu'au début du
// CP9 pour la décision serveur : une propriété qu'aucun test ne peut exercer
// n'est pas tenue par un test qui en cherche la trace écrite. On sort donc la
// décision du composant, et les tests l'appellent.

/**
 * Traduit la réponse de `POST /api/lab/[id]` (action `save`) en ce que la
 * surface doit annoncer.
 *
 * @param reponse  la charge JSON telle que reçue
 * @returns {null | { conflits: Array<{ path: string, contenuActuel: string|null }> }}
 *   `null` quand il n'y a rien à annoncer ; sinon les fichiers concernés.
 *   **Jamais une décision prise à la place de l'apprenant** : ce module ne
 *   fusionne rien, n'écrase rien et ne propose pas de forcer l'écriture.
 */
export function lectureDuRefus(reponse) {
  const r = reponse && typeof reponse === 'object' ? reponse : {};
  // Une sauvegarde réussie efface l'avertissement précédent : le renvoi `null`
  // sert aussi à ça, et c'est pourquoi il ne faut pas confondre les deux cas.
  if (r.ok === true) return null;
  if (r.conflit !== true) return null;
  const brut = Array.isArray(r.conflits) ? r.conflits : [];
  const conflits = brut
    .filter((c) => c && typeof c.path === 'string' && c.path)
    .map((c) => ({
      path: c.path,
      contenuActuel: typeof c.contenuActuel === 'string' ? c.contenuActuel : null,
    }));
  // Un refus qui ne nomme aucun fichier n'est pas affichable : « quelque chose a
  // changé, quelque part » inquiète sans rien apprendre.
  return conflits.length ? { conflits } : null;
}
