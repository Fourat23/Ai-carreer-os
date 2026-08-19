import {
  Target, BookOpen, Eye, PenLine, Boxes, MessageSquare, CheckCheck, Lightbulb,
} from 'lucide-react';

// Chemin de phases du jour (déroulé lisible en < 5 s) : sections réelles du
// contenu, dans l'ordre du curriculum. Ancre vers chaque section. Aucune
// modification de contenu — dérivé de l'HTML déjà annoté côté serveur.
const FAM_ICON: Record<string, typeof Target> = {
  objective: Target, learn: BookOpen, observe: Eye, practice: PenLine,
  apply: Boxes, prepare: MessageSquare, verify: CheckCheck, retain: Lightbulb,
};
const FAM_LABEL: Record<string, string> = {
  objective: 'Cadrer', learn: 'Comprendre', observe: 'Observer', practice: 'Pratiquer',
  apply: 'Produire', prepare: 'Préparer', verify: 'Vérifier', retain: 'Réviser',
};

export default function DayPhases({ phases }: { phases: { id: string; family: string; label: string }[] }) {
  if (phases.length < 2) return null;
  return (
    <nav className="day-phases" aria-label="Déroulé du jour">
      <span className="day-phases-lead">Déroulé</span>
      <ol className="day-phases-list">
        {phases.map((p, i) => {
          const Icon = FAM_ICON[p.family] ?? BookOpen;
          return (
            <li key={p.id} className="day-phase" data-family={p.family}>
              <a href={`#${p.id}`} title={p.label}>
                <span className="day-phase-no">{String(i + 1).padStart(2, '0')}</span>
                <Icon size={13} strokeWidth={2} aria-hidden />
                <span className="day-phase-fam">{FAM_LABEL[p.family] ?? p.family}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
