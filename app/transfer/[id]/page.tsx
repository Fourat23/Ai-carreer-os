// V75 · CP9 — LA PAGE D'UN DÉFI. Route propre, donc partageable et reprenable.
//
// Un défi par URL, et non un état interne du catalogue : l'audit du CP0 a
// mesuré que la navigation vers le transfert était **absente**, et une surface
// qu'on ne peut pas atteindre par un lien reste à moitié absente. Le bandeau de
// contexte et le corps sont rendus côté serveur ; seule la passation est
// cliente, parce qu'elle a un état.
import { notFound } from 'next/navigation';
import { getTransferChallenge, listTransferChallenges } from '@/lib/transfer-challenges-server';
import { getProgram } from '@/lib/program';
import { ContextLine } from '@/app/ui';
import ChallengeRunner from './ChallengeRunner';

export const dynamic = 'force-dynamic';

export default async function TransferChallengePage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const challenge = getTransferChallenge(id);
  if (!challenge) notFound();

  const program = getProgram();
  const skillNames = Object.fromEntries(
    (program.skills ?? []).map((s: { id: string; name: string }) => [s.id, s.name]),
  );

  return (
    <>
      <ContextLine
        label="Défi de transfert"
        facts={[
          { k: 'Défis', v: `${listTransferChallenges().length}` },
          { k: 'Ce défi', v: challenge.title, here: true },
          { k: 'Distance', v: challenge.transferLevel === 'T5' ? 'autre domaine' : 'contexte voisin' },
        ]}
      />
      <ChallengeRunner challenge={challenge} skillNames={skillNames} />
    </>
  );
}
