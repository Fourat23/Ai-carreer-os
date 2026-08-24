import Link from 'next/link';
import { listMissions, missionProgressFor } from '@/lib/missions-server';
import { HeroFocus, HeroFact } from '@/app/ui';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { PageHeader, Status, ListRow, Metric } from '@/app/ui';
import type { Tone } from '@/app/ui';

export const dynamic = 'force-dynamic';

const CAT_LABEL: Record<string, string> = {
  'debt-maintenance': 'Dette & maintenance',
  performance: 'Performance',
  documentation: 'Documentation',
  incident: 'Incident & post-mortem',
};
// Statut → libellé + ton + rang d'affichage (actionnable d'abord, terminé en dernier).
const STATUS: Record<string, { label: string; tone: Tone; rank: number }> = {
  'in-progress': { label: 'En cours', tone: 'info', rank: 0 },
  'deliverables-incomplete': { label: 'Livrables incomplets', tone: 'attention', rank: 1 },
  'ready-for-review': { label: 'Prêt pour revue', tone: 'accent', rank: 2 },
  'not-started': { label: 'À commencer', tone: 'neutral', rank: 3 },
  done: { label: 'Terminé', tone: 'positive', rank: 4 },
};
const GROUP_HINT: Record<string, string> = {
  'in-progress': 'Reprends là où tu t\'es arrêté.',
  'deliverables-incomplete': 'Des livrables restent à produire.',
  'ready-for-review': 'Prêtes pour la revue finale.',
  'not-started': 'Non entamées.',
  done: 'Terminées — preuves à l\'appui.',
};

export default function MissionsPage() {
  const flat = readProgress();
  const activeTrack = getActiveTrackId();
  const missions = listMissions().filter((m) => m.status === 'published');

  // Regroupement par statut (données réelles), ordonné par rang.
  const rows = missions.map((m) => ({ m, prog: missionProgressFor(flat, m) }));
  const byStatus = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = r.prog.status;
    if (!byStatus.has(key)) byStatus.set(key, []);
    byStatus.get(key)!.push(r);
  }
  const groups = [...byStatus.entries()]
    .sort((a, b) => (STATUS[a[0]]?.rank ?? 9) - (STATUS[b[0]]?.rank ?? 9));
  const doneCount = byStatus.get('done')?.length ?? 0;
  const activeCount = (byStatus.get('in-progress')?.length ?? 0)
    + (byStatus.get('deliverables-incomplete')?.length ?? 0)
    + (byStatus.get('ready-for-review')?.length ?? 0);
  const nextMission = rows.find((r) => r.prog.status === 'in-progress')
    ?? rows.find((r) => r.prog.status === 'not-started');

  return (
    <>
      <HeroFocus
        tone="calm"
        eyebrow="Missions d'ingénierie"
        title={activeCount > 0
          ? `${activeCount} mission${activeCount > 1 ? 's' : ''} en cours`
          : `${missions.length} missions disponibles`}
        lead="Des situations d'ingénierie réelles : dette, performance, documentation, incident. Chaque mission attend des livrables, pas une réponse."
        meta={
          <>
            <HeroFact k="Disponibles">{missions.length}</HeroFact>
            <HeroFact k="Terminées">{doneCount}</HeroFact>
            <HeroFact k="En cours">{activeCount}</HeroFact>
          </>
        }
        actions={nextMission
          ? <Link className="btn cta" href={`/missions/${nextMission.m.id}`}>
              {nextMission.prog.status === 'in-progress' ? 'Reprendre' : 'Commencer'} — {nextMission.m.title}
            </Link>
          : undefined}
      />
      <PageHeader
        eyebrow="Missions d'ingénierie"
        title="Missions"
        sub={<>Des scénarios réalistes : analyser, diagnostiquer, arbitrer, modifier sous contrôle, produire des livrables (auto-corrigé, validé structurellement ou revue humaine). Preuves créées dans le parcours actif ({activeTrack}).</>}
      />

      <div className="skills-summary">
        <Metric label="Missions publiées" value={missions.length} emphasis sub={`${doneCount} terminée${doneCount > 1 ? 's' : ''}`} />
        <div className="skills-distribution" aria-label="Répartition par statut">
          {groups.map(([status, list]) => (
            <Status key={status} tone={STATUS[status]?.tone ?? 'neutral'} label={`${STATUS[status]?.label ?? status} · ${list.length}`} />
          ))}
        </div>
      </div>

      {groups.map(([status, list]) => (
        <section key={status} className="ui-listgroup">
          <div className="ui-listgroup-head">
            <Status tone={STATUS[status]?.tone ?? 'neutral'} label={STATUS[status]?.label ?? status} />
            <span className="ui-listgroup-count">{list.length} mission{list.length > 1 ? 's' : ''}</span>
            <span className="ui-listgroup-hint">{GROUP_HINT[status] ?? ''}</span>
          </div>
          <div className="ui-list">
            {list.map(({ m, prog }) => (
              <ListRow
                key={m.id}
                href={`/missions/${m.id}`}
                tone={STATUS[status]?.tone}
                title={m.title}
                desc={m.description}
                meta={
                  <>
                    <span>{CAT_LABEL[m.category] ?? m.category}</span>
                    <span>Difficulté {m.difficulty}/5</span>
                    <span>≈ {m.estimatedHours} h</span>
                    <span>{prog.requiredDone}/{prog.requiredTotal} livrables</span>
                    <span>Jours {m.dayRefs.join(', ')}</span>
                  </>
                }
                status={<Status tone={STATUS[status]?.tone ?? 'neutral'} label={STATUS[status]?.label ?? status} />}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
