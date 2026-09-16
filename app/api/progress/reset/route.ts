// Réinitialisation de la PROGRESSION. POST /api/progress/reset
//
// Snapshot de l'état précédent (filet de sécurité), puis remise à zéro.
//
// ── CE QUE `RESET` N'EST PAS (V77.1 · CP2) ──────────────────────────────────
//
// Ce n'est PAS une suppression. Il conserve délibérément :
//   · l'instantané de secours, qui contient la progression d'avant ;
//   · `data/lab-workspaces/` et `data/lab-journals/`, donc le code de
//     l'apprenant — décision de V76 · CP10 : un `RESET` n'efface pas
//     l'histoire d'un échec.
//
// Le CP0 a mesuré que l'interface annonçait pourtant « toute ta progression »,
// « irréversible », et « sauvegardé automatiquement » dans le même bloc. Le
// défaut était dans le mot, pas dans le comportement : le comportement est
// inchangé, la route rend maintenant la portée exacte de ce qu'elle a fait, et
// la suppression réelle vit dans `/api/progress/delete-all`.
import { NextResponse } from 'next/server';
import { writeProgress, snapshotProgress, emptyProgress } from '@/lib/progress-server';
import { porteeDe } from '@/lib/learner-data';

export const dynamic = 'force-dynamic';

export async function POST() {
  snapshotProgress();
  writeProgress(emptyProgress());
  // Rendue depuis la SOURCE des catégories, jamais recopiée : l'appelant peut
  // vérifier ce qui a survécu au lieu de le croire.
  return NextResponse.json({ ok: true, portee: porteeDe('reset') });
}
