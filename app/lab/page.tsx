import Link from 'next/link';
import { FlaskConical, ArrowRight } from 'lucide-react';
import { listExercises } from '@/lib/exercises-server';
import { getRuntime } from '@/lib/exercise.mjs';

export const dynamic = 'force-dynamic';

export default function LabPage() {
  const exercises = listExercises();

  return (
    <>
      <div className="page-head page-wide">
        <div className="page-head-main">
          <p className="page-eyebrow">Laboratoire <span className="sep">/</span> exécution locale sécurisée</p>
          <h1 className="page-title">Laboratoire de code</h1>
          <p className="page-sub">
            Écris du code dans l’éditeur, lance les tests et vois le résultat immédiatement.
            Tout s’exécute localement, en bac à sable (timeout, sortie bornée, aucun accès réseau requis).
          </p>
        </div>
      </div>

      {exercises.length === 0 ? (
        <div className="empty">Aucun exercice disponible pour l’instant.</div>
      ) : (
        <div className="lab-grid page-wide">
          {exercises.map((ex) => {
            const rt = getRuntime(ex.runtime);
            return (
              <Link key={ex.id} href={`/lab/${ex.id}`} className="lab-card">
                <div className="lab-card-head">
                  <FlaskConical size={16} strokeWidth={2} />
                  <span className="lab-card-title">{ex.title}</span>
                </div>
                <p className="lab-card-sum">{ex.summary}</p>
                <div className="lab-card-meta">
                  <span className="badge">{rt?.label ?? ex.runtime}</span>
                  <span className="badge">{ex.tests.length} tests</span>
                  {typeof ex.difficulty === 'number' && <span className="badge">Difficulté {ex.difficulty}/5</span>}
                  <span className="lab-card-go">Ouvrir <ArrowRight size={13} /></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
