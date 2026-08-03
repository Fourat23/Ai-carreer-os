'use client';
// Catalogue des scénarios de manifests : filtre par kind + recherche, URL
// partageable. Lecture seule, aucune donnée sensible.
import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Boxes, Layers } from 'lucide-react';

interface Summary {
  id: string; title: string; description: string;
  resourceCount: number; kinds: string[]; skills: string[];
}

export default function KubernetesCatalogue({ scenarios }: { scenarios: Summary[] }) {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get('q') ?? ''); setKind(p.get('kind') ?? '');
  }, []);
  const sync = useCallback((nq: string, nk: string) => {
    const p = new URLSearchParams();
    if (nq) p.set('q', nq); if (nk) p.set('kind', nk);
    const s = p.toString();
    window.history.replaceState(null, '', s ? `?${s}` : window.location.pathname);
  }, []);

  const kinds = useMemo(() => [...new Set(scenarios.flatMap((s) => s.kinds))].sort(), [scenarios]);
  const shown = useMemo(() => scenarios.filter((s) => {
    if (kind && !s.kinds.includes(kind)) return false;
    if (q && !(`${s.title} ${s.description} ${s.skills.join(' ')}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [scenarios, q, kind]);

  return (
    <div>
      <div className="pl-filters" role="search">
        <input
          className="pl-search" type="search" placeholder="Rechercher un scénario…" aria-label="Rechercher un scénario"
          value={q} onChange={(e) => { setQ(e.target.value); sync(e.target.value, kind); }}
        />
        <label className="wb-field">
          <span className="section-label">Ressource</span>
          <select value={kind} onChange={(e) => { setKind(e.target.value); sync(q, e.target.value); }}>
            <option value="">toutes</option>
            {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
        <span className="muted pl-count">{shown.length} / {scenarios.length}</span>
      </div>
      <ul className="pl-cards">
        {shown.map((s) => (
          <li key={s.id} className="pl-card">
            <Link href={`/kubernetes/${s.id}`} className="pl-card-link">
              <span className="pl-card-ico"><Boxes size={18} strokeWidth={1.75} /></span>
              <span className="pl-card-body">
                <span className="pl-card-title">{s.title}</span>
                <span className="pl-card-desc">{s.description}</span>
                <span className="pl-card-meta">
                  <span className="wb-badge"><Layers size={11} /> {s.resourceCount} ressources</span>
                  {s.kinds.slice(0, 5).map((k) => <span key={k} className="wb-badge">{k}</span>)}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {shown.length === 0 && <li className="muted">Aucun scénario ne correspond.</li>}
      </ul>
    </div>
  );
}
