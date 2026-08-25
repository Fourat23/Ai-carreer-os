// V60 · SPIKE — pièces partagées des prototypes.
//
// MOTIFS : l'ensemble reste fermé à cinq (PositionRing, TrajectoryMap,
// PhaseRail, EvidenceMark, YearBand). Rien ici n'en ajoute un sixième. Ce que
// ces composants font, c'est les RENDRE À UNE AUTRE ÉCHELLE et dans une autre
// chorégraphie — ce que le brief autorise explicitement (§12) et désigne même
// comme le vrai levier : « le problème n'est pas d'avoir davantage de motifs,
// c'est qu'ils sont trop petits et trop peu orchestrés ».
//
//   ArcHorizon     = PositionRing, ouvert et porté à ~40 % d'un demi-écran
//   YearRuler      = YearBand, rendu en règle d'atelier (direction B)
//   MonthStaff     = TrajectoryMap, redessiné en portée mensuelle (C)
//   DensityColumns = TrajectoryMap, en colonnes de densité (C, calendrier)
//   EvidenceGlyph  = EvidenceMark, agrandi jusqu'à être perceptible
//
// Aucune progression n'est dessinée : `data/progress.json` est vide, et le
// brief interdit d'en inventer. Ce que ces motifs encodent est réel —
// difficulté, charge, révision, jalon de projet.
import type { SpikeDay } from './data';

/** Bandeau permanent : cette page n'est pas un écran produit. */
export function SpikeFlag({ dir, screen }: { dir: string; screen: string }) {
  return (
    <div className="v60-flag">
      <b>V60 · prototype</b>
      <span>{dir}</span>
      <span>{screen}</span>
      <span className="sp">Écran de comparaison — hors produit. Actions inertes. Aucune écriture disque.</span>
    </div>
  );
}

/**
 * Le corpus écrit ses livrables en Markdown : `ia-lab/`, `commandes.md`.
 * Relevé sur capture au premier rendu — les trois directions affichaient les
 * accents graves en toutes lettres. Le texte n'est pas modifié, il est rendu :
 * le code inline redevient du code inline.
 */
export function Inline({ text }: { text: string }) {
  const bits = String(text).split(/(`[^`]+`)/g);
  return (
    <>
      {bits.map((b, i) =>
        b.startsWith('`') && b.endsWith('`') && b.length > 2
          ? <code key={i} className="mono">{b.slice(1, -1)}</code>
          : <span key={i}>{b}</span>,
      )}
    </>
  );
}

/** Progression réellement enregistrée : aucune. Dit, jamais dessiné. */
export function NoProgress({ recorded }: { recorded: number }) {
  if (recorded > 0) return null;
  return <span className="na">progression non enregistrée — 0 journée</span>;
}

/* ── A · ArcHorizon — PositionRing ouvert en horizon de mission ─────────── */
export function ArcHorizon({ days, now }: { days: SpikeDay[]; now: number }) {
  const R = 230, cx = 280, cy = 290;
  const n = days.length || 1;
  const pt = (t: number, r: number) => {
    const a = (Math.PI * (1 + t));
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const monthMid = new Map<number, number>();
  for (let m = 1; m <= 12; m++) {
    const idx = days.findIndex((d) => d.month === m);
    const last = days.map((d) => d.month).lastIndexOf(m);
    if (idx >= 0) monthMid.set(m, (idx + last) / 2 / n);
  }
  return (
    <svg className="a-arc" viewBox="0 0 560 320" role="img"
         aria-label={`Horizon de trajectoire : ${n} journées, jalons de projet et semaines de révision`}>
      {days.map((d, i) => {
        const t = i / (n - 1 || 1);
        const cls = d.project != null ? 'proj' : d.isReview ? 'rev' : 'trk';
        const depth = d.project != null ? 26 : d.isReview ? 17 : 6 + d.difficulty * 2.2;
        const [x1, y1] = pt(t, R - depth);
        const [x2, y2] = pt(t, R);
        return <line key={d.day} className={cls} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={d.project != null ? 1.6 : 1} />;
      })}
      {/* position réelle de reprise */}
      {(() => {
        const i = Math.max(0, days.findIndex((d) => d.day === now));
        const t = i / (n - 1 || 1);
        const [x1, y1] = pt(t, R - 42);
        const [x2, y2] = pt(t, R + 8);
        return <line className="now" x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.8} />;
      })()}
      {[...monthMid.entries()].map(([m, t]) => {
        const [x, y] = pt(t, R + 20);
        return (
          <text key={m} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                className={m === 1 ? 'lab-on' : undefined}>M{m}</text>
        );
      })}
    </svg>
  );
}

/* ── B · YearRuler — YearBand en règle d'atelier ────────────────────────── */
export function YearRuler({ days, now }: { days: SpikeDay[]; now: number }) {
  return (
    <>
      <div className="b-ruler">
        {days.map((d) => (
          <i key={d.day}
             className={`b-tick${d.day === now ? ' now' : d.project != null ? ' pj' : d.isReview ? ' rv' : ''}`}
             style={{ height: `${28 + d.difficulty * 14}%` }} />
        ))}
      </div>
      <div className="b-scale">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{ flex: days.filter((d) => d.month === i + 1).length }}>M{i + 1}</span>
        ))}
      </div>
    </>
  );
}

/* ── C · MonthStaff — TrajectoryMap redessiné en portée ─────────────────── */
export function MonthStaff({ days, hoursByMonth }: { days: SpikeDay[]; hoursByMonth: number[] }) {
  return (
    <>
      <div className="c-lines">
        {Array.from({ length: 12 }, (_, i) => {
          const md = days.filter((d) => d.month === i + 1);
          return (
            <div key={i} className="c-mocol">
              <div className="c-mobar">
                {md.map((d) => (
                  <i key={d.day}
                     className={d.project != null ? 'pj' : d.isReview ? 'rv' : ''}
                     style={{ height: `${20 + d.difficulty * 16}%` }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="c-moft">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i}>
            <span className="n">{String(i + 1).padStart(2, '0')}</span>
            <span className="h">{hoursByMonth[i]} h</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── EvidenceGlyph — EvidenceMark, à une taille enfin perceptible ───────── */
const GLYPH: Record<string, (s: number) => React.ReactNode> = {
  practice: (s) => <rect x={1} y={1} width={s - 2} height={s - 2} />,
  verify: (s) => <path d={`M${s / 2} 1 L${s - 1} ${s / 2} L${s / 2} ${s - 1} L1 ${s / 2} Z`} />,
  produce: (s) => <circle cx={s / 2} cy={s / 2} r={s / 2 - 1} />,
  prepare: (s) => <path d={`M${s / 2} 1 L${s - 1} ${s - 1} L1 ${s - 1} Z`} />,
  observe: (s) => <path d={`M1 ${s / 2} L${s / 2} 1 L${s - 1} ${s / 2}`} fill="none" />,
};
export function EvidenceGlyph({ kind, size = 22 }: { kind: string; size?: number }) {
  const draw = GLYPH[kind] ?? GLYPH.observe;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true"
         fill="none" stroke="currentColor" strokeWidth={1.4}>
      {draw(size)}
    </svg>
  );
}

/** Familles pédagogiques réelles, telles que `data-family` les nomme. */
export const FAMILY_LABEL: Record<string, string> = {
  objective: 'Cadrer', learn: 'Apprendre', observe: 'Observer', practice: 'Pratiquer',
  apply: 'Produire', prepare: 'Préparer', verify: 'Vérifier', retain: 'Retenir',
};
