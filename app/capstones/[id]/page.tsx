import { notFound } from 'next/navigation';
import { getCapstone } from '@/lib/capstones-server';
import { getProgram } from '@/lib/program';
import { SurfaceHead } from '@/app/ui';
import CapstoneRunner from './CapstoneRunner';

export const dynamic = 'force-dynamic';

// V58 · CP7 — Le CP0 mesurait ici dominance 0,128 avec 9 blocs de premier
// niveau de poids équivalent, 3 fonds et ZÉRO ombre : aucune hiérarchie, et
// un lien de retour en guise d'en-tête.
// La bande d'identité remonte au serveur avec les faits réels du capstone —
// phases, durée estimée, seuil de réussite — et le composant client garde
// l'exécution.
export default async function CapstonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const capstone = getCapstone(id);
  if (!capstone) notFound();
  const program = getProgram();
  const skillNames = Object.fromEntries(
    (program.skills ?? []).map((s: { id: string; name: string }) => [s.id, s.name]),
  );
  const skills = (capstone.skills ?? []).map((s: string) => skillNames[s] ?? s);

  return (
    <>
      <SurfaceHead
        kind="detail"
        eyebrow={<>Capstones <span className="sep">/</span> {capstone.domain}{skills.length ? <> <span className="sep">/</span> {skills.join(' · ')}</> : null}</>}
        title={capstone.title}
        lead={capstone.context}
        facts={[
          { k: 'Phases', v: capstone.phases?.length ?? 0 },
          typeof capstone.estimatedMinutes === 'number' && { k: 'Durée', v: `≈ ${capstone.estimatedMinutes} min` },
          typeof capstone.difficulty === 'number' && { k: 'Difficulté', v: `${capstone.difficulty}/5` },
        ]}
      />
      <CapstoneRunner capstone={capstone} skillNames={skillNames} />
    </>
  );
}
