// Types pour lib/workspace-conflit.mjs (lecture pure d'une sauvegarde refusée).
export function lectureDuRefus(
  reponse: unknown,
): { conflits: { path: string; contenuActuel: string | null }[] } | null;
