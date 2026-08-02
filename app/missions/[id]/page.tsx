import { notFound } from 'next/navigation';
import { getMission, publicMission, reconcileAutoDeliverables } from '@/lib/missions-server';
import { readProgress } from '@/lib/progress-server';
import { readMissionState, missionProgress } from '@/lib/mission-state.mjs';
import MissionDetail from './MissionDetail';

export const dynamic = 'force-dynamic';

export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = getMission(id);
  if (!mission) notFound();
  const flat = reconcileAutoDeliverables(readProgress(), mission);
  return (
    <MissionDetail
      mission={publicMission(mission)}
      context={mission.context}
      prerequisites={mission.prerequisites ?? []}
      commonMistakes={mission.commonMistakes ?? []}
      initialState={readMissionState(flat, mission.id)}
      initialProgress={missionProgress(flat, mission)}
    />
  );
}
