import Link from 'next/link';
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
      <h1>Notes</h1>
      <p className="subtitle">
        Toutes tes notes personnelles et tes réponses, agrégées depuis les vues Jour.
        Ton journal d'apprentissage — relis-le aux bilans.
      </p>

      {entries.length === 0 ? (
        <div className="card">
          <p className="muted">
            Aucune note pour l'instant. Ouvre un <Link href="/day/1">jour</Link> et remplis « Ma réponse » ou « Notes personnelles ».
          </p>
        </div>
      ) : (
        entries.map((e) => {
          const meta = program.days.find((d) => d.day === e.day);
          return (
            <div key={e.day} className="card" style={{ marginBottom: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <Link href={`/day/${e.day}`} style={{ fontWeight: 600 }}>
                  Jour {e.day} — {meta?.title}
                </Link>
                <span className="badge">{meta?.skillName}</span>
              </div>
              {e.answer?.trim() && (
                <>
                  <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Ma réponse</div>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: '4px 0', fontFamily: 'inherit' }}>{e.answer}</pre>
                </>
              )}
              {e.notes?.trim() && (
                <>
                  <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Notes</div>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: '4px 0', fontFamily: 'inherit' }}>{e.notes}</pre>
                </>
              )}
            </div>
          );
        })
      )}
    </>
  );
}
