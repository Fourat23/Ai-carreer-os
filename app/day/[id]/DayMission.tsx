import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { difficultyLabel } from '@/lib/day-view';
import { Status, HeroFact, DifficultyScale } from '@/app/ui';
import type { Tone } from '@/app/ui';

// V56 — MISSION HEADER de la journée.
//
// Remplace `DayHeader`. La mesure CP0 était sans appel : la page Journée n'avait
// jamais reçu le système V55 — 4 fonds distincts, 1 seul niveau d'ombre, police
// maximale 34 px, amplitude typographique 2,00. Autrement dit, la surface où
// l'apprenant passe ses 4-5 heures était restée au niveau d'avant V55.
//
// Le hero répond en un écran aux quatre questions : où je suis (jour, position),
// quoi (titre, objectif), avec quoi (compétence, difficulté, durée), et quoi
// faire (action + navigation bornée au parcours).
const STATUS: Record<string, { label: string; tone: Tone }> = {
  done: { label: 'Terminé', tone: 'positive' },
  'in-progress': { label: 'En cours', tone: 'info' },
  'to-review': { label: 'À revoir', tone: 'attention' },
  'not-started': { label: 'Non commencé', tone: 'neutral' },
};

export default function DayMission({
  day, title, lead, skillName, difficulty, hours, week, month, monthTitle, status,
  prevDay, nextDay, trackTotal, trackPosition, actions,
}: {
  day: number; title: string; lead?: string | null; skillName: string; difficulty: number;
  hours: number; week: number; month: number; monthTitle?: string; status?: string;
  prevDay?: number | null; nextDay?: number | null;
  trackTotal?: number | null; trackPosition?: number | null;
  actions?: React.ReactNode;
}) {
  const st = STATUS[status ?? 'not-started'] ?? STATUS['not-started'];
  const total = trackTotal ?? 365;
  const posInTrack = trackPosition ?? day;
  const pct = Math.round((posInTrack / total) * 100);

  return (
    <header className="day-mission">
      <div className="day-mission-top">
        <span className="day-mission-ord">
          <span className="day-mission-ord-k">Jour</span>
          <span className="day-mission-ord-v">{day}</span>
        </span>
        {/* V61 · la position est portée par la ligne de contexte, en tête de
            page. Elle rendait ici « JOUR 80 80 365 du parcours » — le numéro
            du jour deux fois de suite, à trois caractères d'écart. */}
        <Status tone={st.tone} label={st.label} />
        <nav className="day-turn" aria-label="Navigation entre les jours du parcours">
          {prevDay != null && (
            <Link className="turn-btn" href={`/day/${prevDay}`} aria-label={`Jour précédent : ${prevDay}`}>
              <ChevronLeft size={15} strokeWidth={2} /> <span>{prevDay}</span>
            </Link>
          )}
          {nextDay != null && (
            <Link className="turn-btn" href={`/day/${nextDay}`} aria-label={`Jour suivant : ${nextDay}`}>
              <span>{nextDay}</span> <ChevronRight size={15} strokeWidth={2} />
            </Link>
          )}
        </nav>
      </div>

      <h1 className="day-mission-title">{title}</h1>
      {lead && <p className="day-mission-lead">{lead}</p>}

      {/* V61 · compétence, difficulté, durée et module sont désormais dans la
          ligne de contexte. Ne restent ici que les REPÈRES, qui ne sont pas
          des faits mais des liens : le mois et la semaine sont des surfaces
          où l'on va. */}
      <div className="day-mission-facts">
        <HeroFact k="Repères">
          <Link href={`/month/${month}`}>Mois {month}</Link>
          <span className="sep">·</span>
          <Link href={`/week/${week}`}>Semaine {week}</Link>
        </HeroFact>
      </div>

      {actions && <div className="day-mission-actions">{actions}</div>}

      <div className="day-mission-prog">
        <div className="dp-track" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
        <span className="dp-label">Avancement du parcours · jour {posInTrack} sur {total}</span>
      </div>
    </header>
  );
}
