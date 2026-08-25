// V60.1 · CAREER WORKSTATION — les cinq motifs propriétaires.
//
// ENSEMBLE FERMÉ. Aucun sixième. Ce que V60.1 change, ce n'est pas leur
// nombre : c'est qu'ils reçoivent chacun UN RÔLE ET UN SEUL, et n'apparaissent
// que sur la surface où ce rôle est posé.
//
//   TrajectoryMap  l'année entière comme champ de 365 jours réels
//   YearBand       l'année compactée en une ligne, règle de position
//   PhaseRail      la position dans un document, navigable
//   PositionRing   la position dans un intervalle borné (mois, semaine)
//   EvidenceMark   la nature d'une preuve attendue
//
// Aucun ne dessine de progression : `data/progress.json` est vide et le
// contrat interdit d'en inventer. Ce qu'ils encodent est réel — difficulté,
// charge, révision, jalon de projet, position de reprise.
import type { CwDay } from './data';

/* ── TrajectoryMap ─────────────────────────────────────────────────────────
   L'année entière. Douze pistes mensuelles, une colonne par jour réel, la
   hauteur portant la difficulté. Le champ est LARGE : c'est le seul objet de
   trajectoire à grande échelle du système, et il ne partage sa surface avec
   aucun autre. */
export function TrajectoryMap({
  days, now, height = 190, labels = true,
}: { days: CwDay[]; now: number; height?: number; labels?: boolean }) {
  const months = Array.from({ length: 12 }, (_, i) => days.filter((d) => d.month === i + 1));
  return (
    <div className="cw-tmap" role="img"
         aria-label={`Trajectoire : ${days.length} journées réparties sur 12 mois, hauteur proportionnelle à la difficulté, ${days.filter((d) => d.isReview).length} journées de révision, ${new Set(days.filter((d) => d.project != null).map((d) => d.project)).size} jalons de projet`}>
      <div className="cw-tmap-field" style={{ height }}>
        {months.map((md, i) => (
          <div key={i} className="cw-tmap-mo" style={{ flex: md.length }}>
            {md.map((d) => (
              <span key={d.day}
                    className={`cw-tmap-d${d.day === now ? ' cw-now' : d.project != null ? ' cw-pj' : d.isReview ? ' cw-rv' : ''}`}
                    style={{ height: `${16 + d.difficulty * 16.8}%` }} />
            ))}
          </div>
        ))}
      </div>
      {labels && (
        <div className="cw-tmap-scale">
          {months.map((md, i) => (
            <span key={i} style={{ flex: md.length }}>
              <b>{String(i + 1).padStart(2, '0')}</b> {md.length} j
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── YearBand ──────────────────────────────────────────────────────────────
   La même année, compactée en une ligne de quelques pixels. Sa fonction est
   d'être une RÈGLE DE POSITION permanente, pas une visualisation : elle vit
   dans la ligne de faits, en pied d'écran, où elle ne concurrence rien. */
export function YearBand({ days, now }: { days: CwDay[]; now: number }) {
  return (
    <span className="cw-yband" role="img"
          aria-label={`Position : journée ${now} sur ${days.length}`}>
      {days.map((d) => (
        <i key={d.day}
           className={d.day === now ? 'cw-now' : d.project != null ? 'cw-pj' : d.isReview ? 'cw-rv' : ''} />
      ))}
    </span>
  );
}

/* ── PhaseRail ─────────────────────────────────────────────────────────────
   La position dans un document, NAVIGABLE. Ce sont de vrais liens d'ancre :
   le rail est un instrument, pas une décoration. La famille vient de
   `data-family`, la taxonomie que le corpus porte déjà — aucune seconde
   taxonomie n'est créée. */
export function PhaseRail({
  sections, current, actionSet, familyLabel,
}: {
  sections: { id: string; label: string; family: string | null }[];
  current: string | null;
  actionSet: Set<string>;
  familyLabel: Record<string, string>;
}) {
  return (
    <ol className="cw-prail">
      {sections.map((s, i) => {
        const isAction = !!s.family && actionSet.has(s.family);
        return (
          <li key={s.id}>
            <a href={`#${s.id}`}
               className={`cw-prail-i${isAction ? ' cw-act' : ''}${current === s.id ? ' cw-on' : ''}`}
               aria-current={current === s.id ? 'true' : undefined}>
              <span className="cw-prail-n cw-mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="cw-prail-b">
                <span className="cw-prail-t">{s.label}</span>
                <span className="cw-prail-f cw-mono">
                  {s.family ? familyLabel[s.family] ?? '—' : '—'}
                  {isAction && ' · action'}
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/* ── PositionRing ──────────────────────────────────────────────────────────
   La position dans un intervalle BORNÉ — un mois, une semaine. Jamais dans
   l'année : c'est le rôle de TrajectoryMap, et deux représentations du même
   intervalle sur une page est précisément ce que V59 a retiré du produit. */
export function PositionRing({
  value, total, label, size = 92,
}: { value: number; total: number; label: string; size?: number }) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
  return (
    <svg className="cw-pring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}
         role="img" aria-label={`${label} : ${value} sur ${total}`}>
      <circle cx={size / 2} cy={size / 2} r={r} className="cw-pring-trk" fill="none" strokeWidth={3} />
      <circle cx={size / 2} cy={size / 2} r={r} className="cw-pring-val" fill="none" strokeWidth={3}
              strokeDasharray={`${c * frac} ${c}`} strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" dominantBaseline="middle"
            className="cw-pring-n">{value}</text>
      <text x={size / 2} y={size / 2 + 15} textAnchor="middle" dominantBaseline="middle"
            className="cw-pring-o">/ {total}</text>
    </svg>
  );
}

/* ── EvidenceMark ──────────────────────────────────────────────────────────
   La NATURE d'une preuve attendue, à une taille enfin perceptible. Le glyphe
   est déterminé par le type de preuve, jamais par une couleur seule : c'est
   une forme, elle survit au niveau de gris et à un daltonisme. */
const GLYPH: Record<string, (s: number) => React.ReactNode> = {
  practice: (s) => <rect x={2} y={2} width={s - 4} height={s - 4} />,
  verify: (s) => <path d={`M${s / 2} 2 L${s - 2} ${s / 2} L${s / 2} ${s - 2} L2 ${s / 2} Z`} />,
  produce: (s) => <circle cx={s / 2} cy={s / 2} r={s / 2 - 2} />,
  prepare: (s) => <path d={`M${s / 2} 2 L${s - 2} ${s - 2} L2 ${s - 2} Z`} />,
  observe: (s) => <path d={`M2 ${s / 2} L${s / 2} 2 L${s - 2} ${s / 2} L${s / 2} ${s - 2} Z`} fill="none" />,
};
export function EvidenceMark({ kind, size = 24 }: { kind: string; size?: number }) {
  const draw = GLYPH[kind] ?? GLYPH.observe;
  return (
    <svg className="cw-evi" width={size} height={size} viewBox={`0 0 ${size} ${size}`}
         aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5}>
      {draw(size)}
    </svg>
  );
}
