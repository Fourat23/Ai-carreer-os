'use client';
// Catalogue des scénarios de sécurité : filtre par domaine + recherche, URL
// partageable. Lecture seule, aucune donnée sensible.
import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShieldAlert, Layers } from 'lucide-react';

interface Summary {
  id: string; title: string; description: string; domain: string;
  difficulty: number | null; incident: string | null; artifactCount: number; skills: string[];
}
const DOMAIN_LABEL: Record<string, string> = {
  secrets: 'Secrets', 'supply-chain': 'Supply chain', rbac: 'RBAC', kubernetes: 'Kubernetes',
  exposure: 'Exposition', incident: 'Incident', deployment: 'Déploiement',
};

export default function SecurityCatalogue({ scenarios }: { scenarios: Summary[] }) {
  const [q, setQ] = useState('');
  const [domain, setDomain] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get('q') ?? ''); setDomain(p.get('domain') ?? '');
  }, []);
  const sync = useCallback((nq: string, nd: string) => {
    const p = new URLSearchParams();
    if (nq) p.set('q', nq); if (nd) p.set('domain', nd);
    const s = p.toString();
    window.history.replaceState(null, '', s ? `?${s}` : window.location.pathname);
  }, []);

  const domains = useMemo(() => [...new Set(scenarios.map((s) => s.domain))].sort(), [scenarios]);
  const shown = useMemo(() => scenarios.filter((s) => {
    if (domain && s.domain !== domain) return false;
    if (q && !(`${s.title} ${s.description} ${s.skills.join(' ')}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [scenarios, q, domain]);

  return (
    <div>
      <div className="pl-filters" role="search">
        <input
          className="pl-search" type="search" placeholder="Rechercher un scénario…" aria-label="Rechercher un scénario"
          value={q} onChange={(e) => { setQ(e.target.value); sync(e.target.value, domain); }}
        />
        <label className="wb-field">
          <span className="section-label">Domaine</span>
          <select value={domain} onChange={(e) => { setDomain(e.target.value); sync(q, e.target.value); }}>
            <option value="">tous</option>
            {domains.map((d) => <option key={d} value={d}>{DOMAIN_LABEL[d] ?? d}</option>)}
          </select>
        </label>
        <span className="muted pl-count">{shown.length} / {scenarios.length}</span>
      </div>
      <ul className="pl-cards">
        {shown.map((s) => (
          <li key={s.id} className="pl-card">
            <Link href={`/security/${s.id}`} className="pl-card-link">
              <span className="pl-card-ico"><ShieldAlert size={18} strokeWidth={1.75} /></span>
              <span className="pl-card-body">
                <span className="pl-card-title">{s.title}</span>
                <span className="pl-card-desc">{s.description}</span>
                <span className="pl-card-meta">
                  <span className="wb-badge">{DOMAIN_LABEL[s.domain] ?? s.domain}</span>
                  <span className="wb-badge"><Layers size={11} /> {s.artifactCount} artefacts</span>
                  {s.incident && <span className="wb-badge">incident</span>}
                  {s.difficulty ? <span className="wb-badge">difficulté {s.difficulty}</span> : null}
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
