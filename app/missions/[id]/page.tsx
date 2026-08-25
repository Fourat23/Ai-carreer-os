import { notFound } from 'next/navigation';
import { getMission, publicMission, reconcileAutoDeliverables } from '@/lib/missions-server';
import { readProgress } from '@/lib/progress-server';
import { readMissionState, missionProgress, missionReview } from '@/lib/mission-state.mjs';
import { SurfaceHead } from '@/app/ui';
import MissionDetail from './MissionDetail';

export const dynamic = 'force-dynamic';

const CAT_LABEL: Record<string, string> = {
  'debt-maintenance': 'Dette & maintenance',
  performance: 'Performance',
  documentation: 'Documentation',
  incident: 'Incident & post-mortem',
};

// V58 · CP7 — Le CP0 mesurait ici l'amplitude typographique la plus faible du
// produit (1,87) : la page n'avait aucun titre au cran display, 4 fonds,
// 1 ombre, et son en-tête vivait dans le composant client.
// La bande d'identité remonte au serveur, avec les faits RÉELS de la mission ;
// le composant client garde le travail et l'état de progression, qui est le
// seul fait qui dépende de l'interaction.
export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = getMission(id);
  if (!mission) notFound();
  const flat = reconcileAutoDeliverables(readProgress(), mission);
  const required = (mission.deliverables ?? []).filter((d: { required?: boolean }) => d.required !== false).length;

  return (
    <>
      <SurfaceHead
        kind="detail"
        eyebrow={<>Missions <span className="sep">/</span> {CAT_LABEL[mission.category] ?? mission.category}</>}
        title={mission.title}
        lead={mission.description}
        facts={[
          { k: 'Difficulté', v: `${mission.difficulty}/5` },
          { k: 'Charge', v: `≈ ${mission.estimatedHours} h` },
          required > 0 && { k: 'Livrables requis', v: required },
        ]}
      />
      <MissionDetail
        mission={publicMission(mission)}
        context={mission.context}
        prerequisites={mission.prerequisites ?? []}
        commonMistakes={mission.commonMistakes ?? []}
        initialState={readMissionState(flat, mission.id)}
        initialProgress={missionProgress(flat, mission)}
        initialReview={missionReview(mission, readMissionState(flat, mission.id))}
      />
    </>
  );
}
