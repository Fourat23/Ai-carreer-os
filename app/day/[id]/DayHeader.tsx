import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { difficultyLabel } from '@/lib/day-view';

const STATUS: Record<string, { label: string; cls: string }> = {
  done: { label: 'Terminé', cls: 'ok' },
  'in-progress': { label: 'En cours', cls: 'prog' },
  'to-review': { label: 'À revoir', cls: 'warn' },
  'not-started': { label: 'Non commencé', cls: 'idle' },
};

export default function DayHeader({
  day, title, skillName, difficulty, hours, week, month, status,
}: {
  day: number; title: string; skillName: string; difficulty: number;
  hours: number; week: number; month: number; status?: string;
}) {
  const st = STATUS[status ?? 'not-started'] ?? STATUS['not-started'];
  const pct = Math.round((day / 365) * 100);
  return (
    <header className="day-head">
      <div className="day-head-top">
        <span className="day-ordinal">Jour {day} <span>/ 365</span></span>
        <nav className="day-turn" aria-label="Navigation entre les jours">
          {day > 1 && (
            <Link className="turn-btn" href={`/day/${day - 1}`} aria-label={`Jour ${day - 1}`}>
              <ChevronLeft size={15} strokeWidth={2} /> <span>Jour {day - 1}</span>
            </Link>
          )}
          {day < 365 && (
            <Link className="turn-btn" href={`/day/${day + 1}`} aria-label={`Jour ${day + 1}`}>
              <span>Jour {day + 1}</span> <ChevronRight size={15} strokeWidth={2} />
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
        <span className={`day-status ${st.cls}`}>{st.label}</span>
      </div>

      <div className="day-progress">
        <div className="dp-track" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
        <span className="dp-label">Avancement du parcours · jour {day} sur 365</span>
      </div>
    </header>
  );
}
