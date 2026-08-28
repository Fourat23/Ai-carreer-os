// Filtres de l'historique — V65.1 · CP6.
//
// Les filtres vivent dans l'URL, pas dans un état client : un historique filtré
// est une VUE qu'on peut recharger, partager et retrouver. Aucune écriture,
// aucun effet de bord — cliquer un filtre ne crée pas d'événement.
//
// Chaque option porte son DÉCOMPTE RÉEL, et une option qui ne correspond à
// rien n'est pas affichée : on ne propose pas un filtre qui ne rendrait rien.

import Link from 'next/link';

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export default function HistoryFilters({
  types, competencies, activeType, activeCompetency, total, shown,
}: {
  types: FilterOption[];
  competencies: FilterOption[];
  activeType: string | null;
  activeCompetency: string | null;
  total: number;
  shown: number;
}) {
  const href = (t: string | null, c: string | null) => {
    const p = new URLSearchParams();
    if (t) p.set('type', t);
    if (c) p.set('competence', c);
    const q = p.toString();
    return q ? `/history?${q}` : '/history';
  };
  const filtered = activeType !== null || activeCompetency !== null;

  return (
    <section className="hist-filters" aria-label="Filtrer l’historique">
      <div className="hist-filter-row">
        <span className="hist-filter-k" id="hf-type">Type d’événement</span>
        <ul className="hist-filter-list" aria-labelledby="hf-type">
          <li>
            <Link className={`hist-chip${activeType === null ? ' is-on' : ''}`}
                  aria-current={activeType === null ? 'true' : undefined}
                  href={href(null, activeCompetency)}>
              Tous <span className="hist-chip-n">{total}</span>
            </Link>
          </li>
          {types.map((o) => (
            <li key={o.value}>
              <Link className={`hist-chip${activeType === o.value ? ' is-on' : ''}`}
                    aria-current={activeType === o.value ? 'true' : undefined}
                    href={href(o.value, activeCompetency)}>
                {o.label} <span className="hist-chip-n">{o.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {competencies.length > 0 && (
        <div className="hist-filter-row">
          <span className="hist-filter-k" id="hf-comp">Compétence</span>
          <ul className="hist-filter-list" aria-labelledby="hf-comp">
            <li>
              <Link className={`hist-chip${activeCompetency === null ? ' is-on' : ''}`}
                    aria-current={activeCompetency === null ? 'true' : undefined}
                    href={href(activeType, null)}>
                Toutes
              </Link>
            </li>
            {competencies.map((o) => (
              <li key={o.value}>
                <Link className={`hist-chip${activeCompetency === o.value ? ' is-on' : ''}`}
                      aria-current={activeCompetency === o.value ? 'true' : undefined}
                      href={href(activeType, o.value)}>
                  {o.label} <span className="hist-chip-n">{o.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quand un filtre est actif, on dit COMBIEN on cache. Un historique
          tronqué sans le dire est un historique qui ment. */}
      {filtered && (
        <p className="hist-filter-note" role="status">
          {shown} événement{shown > 1 ? 's' : ''} affiché{shown > 1 ? 's' : ''} sur {total}.{' '}
          <Link href="/history">Retirer les filtres</Link>
        </p>
      )}
    </section>
  );
}
