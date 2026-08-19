import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { difficultyLabel } from '@/lib/day-view';
import { Status } from '@/app/ui';
import type { Tone } from '@/app/ui';

const STATUS: Record<string, { label: string; tone: Tone }> = {
  done: { label: 'Terminé', tone: 'positive' },
  'in-progress': { label: 'En cours', tone: 'info' },
  'to-review': { label: 'À revoir', tone: 'attention' },
  'not-started': { label: 'Non commencé', tone: 'neutral' },
};

export default function DayHeader({
  day, title, skillName, difficulty, hours, week, month, status,
  prevDay, nextDay, trackTotal, trackPosition,
}: {
  day: number; title: string; skillName: string; difficulty: number;
  hours: number; week: number; month: number; status?: string;
  prevDay?: number | null; nextDay?: number | null;
  trackTotal?: number | null; trackPosition?: number | null;
}) {
  const st = STATUS[status ?? 'not-started'] ?? STATUS['not-started'];
  // Position et navigation BORNÉES au parcours actif (Fondations : jour/365).
  const total = trackTotal ?? 365;
  const posInTrack = trackPosition ?? day;
  const pct = Math.round((posInTrack / total) * 100);
  return (
    <header className="day-head">
      <div className="day-head-top">
        <span className="day-ordinal">Jour {day}{trackPosition != null ? <span> · {posInTrack}/{total}</span> : <span> / 365</span>}</span>
        <nav className="day-turn" aria-label="Navigation entre les jours du parcours">
          {prevDay != null && (
            <Link className="turn-btn" href={`/day/${prevDay}`} aria-label={`Jour ${prevDay}`}>
              <ChevronLeft size={15} strokeWidth={2} /> <span>Jour {prevDay}</span>
            </Link>
          )}
          {nextDay != null && (
            <Link className="turn-btn" href={`/day/${nextDay}`} aria-label={`Jour ${nextDay}`}>
              <span>Jour {nextDay}</span> <ChevronRight size={15} strokeWidth={2} />
            </Link>
          )}
        </nav>
      </div>

      <h1 className="day-title">{title}</h1>

      <div className="day-meta">
        <span className="day-skill">{skillName}</span>
        <dl className="day-data">
          <div><dt>Difficulté</dt><dd>{difficultyLabel(difficulty)}</dd></div>
          <div><dt>Durée</dt><dd>{hours} h</dd></div>
        </dl>
        <nav className="day-jump" aria-label="Semaine et mois">
          <Link href={`/week/${week}`}>Semaine {week}</Link>
          <Link href={`/month/${month}`}>Mois {month}</Link>
        </nav>
        <Status tone={st.tone} label={st.label} />
      </div>

      <div className="day-progress">
        <div className="dp-track" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
        <span className="dp-label">Avancement du parcours · jour {posInTrack} sur {total}</span>
      </div>
    </header>
  );
}
