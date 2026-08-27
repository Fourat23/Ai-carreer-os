import { NextResponse } from 'next/server';
import { getGlossary, getGlossaryEntry } from '@/lib/glossary';

// V62 · CP6 — Le volet de détail charge UNE entrée à la demande, au lieu que
// les 711 soient sérialisées dans la page. Purement local, lecture seule,
// aucun accès réseau sortant : même nature que les routes `/api/*` déjà en
// place pour les laboratoires. `id=all` sert le mode « Détaillé », qui affiche
// réellement toutes les entrées et paie donc son poids — seulement quand
// l'utilisateur le demande.
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (id === 'all') return NextResponse.json(getGlossary());
  const entry = getGlossaryEntry(id);
  if (!entry) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(entry);
}
