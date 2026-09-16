// V77.1 · CP2 — SUPPRESSION TOTALE DES DONNÉES LOCALES DE L'APPRENANT.
// POST /api/progress/delete-all
//
// Distincte de `reset` sur deux points qui comptent :
//   1. elle emporte AUSSI l'instantané de secours, les espaces de travail et les
//      journaux de tentatives — donc le code écrit par l'apprenant ;
//   2. elle ne crée AUCUN filet. Elle est irréversible, et c'est le seul
//      endroit du produit où ce mot est vrai.
//
// Elle exige une confirmation explicite dans le corps de la requête : un POST
// vide ne supprime rien. Le bouton n'est pas la confirmation ; le mot l'est.
import { NextResponse } from 'next/server';
import { supprimerDonneesApprenant, inventaireDonneesApprenant } from '@/lib/learner-data-server';
import { CONFIRMATION_DE_SUPPRESSION } from '@/lib/learner-data';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: unknown = null;
  try { body = await req.json(); } catch { body = null; }
  const confirmation = (body as { confirmation?: unknown } | null)?.confirmation;
  if (confirmation !== CONFIRMATION_DE_SUPPRESSION) {
    return NextResponse.json(
      { ok: false, code: 'CONFIRMATION_MANQUANTE', error: `Saisis « ${CONFIRMATION_DE_SUPPRESSION} » pour confirmer.` },
      { status: 400 },
    );
  }

  const avant = inventaireDonneesApprenant();
  const rapport = supprimerDonneesApprenant();
  if (!rapport.ok) {
    return NextResponse.json(
      {
        ok: false,
        code: rapport.violations.length ? 'PLAN_REFUSE' : 'SUPPRESSION_INCOMPLETE',
        error: rapport.violations.length
          ? 'Suppression refusée : le plan visait des données du produit. Rien n’a été supprimé.'
          : 'Suppression incomplète. Voir le détail.',
        violations: rapport.violations,
        supprime: rapport.supprime,
        avant,
      },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, avant, violations: rapport.violations, supprime: rapport.supprime });
}
