import Link from 'next/link';
import { HeroFocus, HeroFact } from '@/app/ui';
import { getProgram } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';

export const dynamic = 'force-dynamic';

// Agrège toutes les notes personnelles et "mes réponses" saisies dans les vues Jour.
export default function NotesPage() {
  const program = getProgram();
  const progress = readProgress();

  const entries = Object.entries(progress.days)
    .filter(([, p]) => (p.notes && p.notes.trim()) || (p.answer && p.answer.trim()))
    .map(([day, p]) => ({ day: Number(day), ...p }))
    .sort((a, b) => a.day - b.day);

  return (
    <>
      <HeroFocus
        tone="calm"
        eyebrow="Journal d'apprentissage"
        title={entries.length ? `${entries.length} entrée${entries.length > 1 ? 's' : ''} de journal` : 'Aucune note pour l’instant'}
        lead={entries.length
          ? "Tes notes personnelles et tes réponses, agrégées depuis les vues Jour. Relis-les aux bilans mensuels."
          : "Les notes que tu écris dans une journée apparaissent ici, regroupées. Rien n'est ajouté automatiquement."}
        meta={
          <>
            <HeroFact k="Journées annotées">{entries.length}</HeroFact>
            <HeroFact k="Première">{entries.length ? `jour ${entries[0].day}` : '—'}</HeroFact>
            <HeroFact k="Dernière">{entries.length ? `jour ${entries[entries.length - 1].day}` : '—'}</HeroFact>
          </>
        }
      />
      <div className="page-head" hidden>
        <div className="page-head-main">
          <p className="page-eyebrow">Journal <span className="sep">/</span> {entries.length} {entries.length > 1 ? 'entrées' : 'entrée'}</p>
          <h1 className="page-title">Notes</h1>
          <p className="page-sub">
            Toutes tes notes personnelles et tes réponses, agrégées depuis les vues Jour.
            Ton journal d'apprentissage — relis-le aux bilans.
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="empty">
          Aucune note pour l'instant. Ouvre un <Link href="/day/1">jour</Link> et remplis « Ma réponse » ou « Notes personnelles ».
        </div>
      ) : (
        entries.map((e) => {
          const meta = program.days.find((d) => d.day === e.day);
          return (
            <div key={e.day} className="note-entry">
              <div className="note-entry-head">
                <Link href={`/day/${e.day}`} style={{ fontWeight: 600 }}>
                  Jour {e.day} — {meta?.title}
                </Link>
                <span className="badge">{meta?.skillName}</span>
              </div>
              {e.answer?.trim() && (
                <>
                  <div className="note-field-k">Ma réponse</div>
                  <pre>{e.answer}</pre>
                </>
              )}
              {e.notes?.trim() && (
                <>
                  <div className="note-field-k">Notes</div>
                  <pre>{e.notes}</pre>
                </>
              )}
            </div>
          );
        })
      )}
    </>
  );
}
