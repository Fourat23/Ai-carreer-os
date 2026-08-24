// V55 — Anneau de position dans le programme.
//
// Élément graphique ADMIS parce qu'il porte une donnée réelle et rien d'autre :
// l'arc = la progression réellement mesurée, les graduations = les mois du
// programme, le centre = la position courante. Aucun ornement, aucun chiffre
// inventé, aucune notion de score. Rendu serveur, SVG pur, déterministe.
//
// Ce n'est pas une récompense : l'anneau n'agrège rien, ne décerne rien et
// n'invente aucun palier — il relocalise visuellement « jour N sur T ».

export function PositionRing({
  percent, day, total, months = 12, label = 'Position dans le programme',
}: {
  percent: number;      // progression réelle, 0-100
  day: number;          // journée courante
  total: number;        // journées du parcours
  months?: number;      // graduations = mois réellement présents
  label?: string;
}) {
  const size = 168;
  const c = size / 2;
  const r = 70;
  const circ = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, percent));
  const dash = (p / 100) * circ;
  // Position de la journée courante sur le cercle (repère, pas une valeur).
  const frac = total > 0 ? Math.min(1, Math.max(0, (day - 1) / total)) : 0;
  const ang = -Math.PI / 2 + frac * 2 * Math.PI;

  return (
    <svg className="pos-ring" viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`${label} : jour ${day} sur ${total}, ${Math.round(p)} % terminé`}>
      <defs>
        <linearGradient id="posRingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      {/* Graduations : une par mois réellement présent au programme. */}
      <g className="pos-ring-ticks" aria-hidden="true">
        {Array.from({ length: months }, (_, i) => {
          const a = -Math.PI / 2 + (i / months) * 2 * Math.PI;
          const r1 = r + 10, r2 = r + (i % 3 === 0 ? 17 : 14);
          return (
            <line key={i}
              x1={c + r1 * Math.cos(a)} y1={c + r1 * Math.sin(a)}
              x2={c + r2 * Math.cos(a)} y2={c + r2 * Math.sin(a)}
              strokeWidth={i % 3 === 0 ? 2 : 1}
            />
          );
        })}
      </g>
      <circle className="pos-ring-track" cx={c} cy={c} r={r} fill="none" strokeWidth="9" />
      <circle
        className="pos-ring-arc" cx={c} cy={c} r={r} fill="none" strokeWidth="9"
        strokeLinecap="round" stroke="url(#posRingGrad)"
        strokeDasharray={`${dash} ${circ - dash}`}
        transform={`rotate(-90 ${c} ${c})`}
      />
      {/* Repère de la journée courante sur l'anneau. */}
      <circle className="pos-ring-now" cx={c + r * Math.cos(ang)} cy={c + r * Math.sin(ang)} r="5" />
      <text className="pos-ring-day" x={c} y={c - 2} textAnchor="middle">{day}</text>
      <text className="pos-ring-total" x={c} y={c + 20} textAnchor="middle">sur {total}</text>
    </svg>
  );
}
