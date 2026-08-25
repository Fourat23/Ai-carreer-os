'use client';
// Navigateur des playbooks « Que faire dans ce cas ? » (V24 CP8). Surface
// browsable et filtrable des cas professionnels (bug prod, déploiement cassé,
// secret exposé, dépendance compromise, incident Kubernetes…). Data-driven :
// la liste vient des playbooks versionnés (data/playbooks). Aucune donnée privée.
import { useMemo, useState } from 'react';
import { LifeBuoy, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { PlaybookView, type PlaybookLike } from './PlaybookView';

export default function PlaybookBrowser({ playbooks }: { playbooks: PlaybookLike[] }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const filtered = useMemo(() => {
    const n = norm(q).trim();
    if (!n) return playbooks;
    return playbooks.filter((p) => {
      const hay = norm([p.id, p.situation, p.title, p.domain].filter(Boolean).map(String).join(' '));
      return n.split(/\s+/).every((t) => hay.includes(t));
    });
  }, [q, playbooks]);

  return (
    // V58 · CP10 — Le titre interne « Que faire dans ce cas ? » redisait le
    // titre de la section qui contient déjà ce navigateur (« Playbooks
    // opérationnels ») : deux en-têtes empilés pour un seul contenu, et le
    // dernier `page-head-main` — primitive héritée — encore rendu à l'écran.
    // Ne reste que ce que le titre ne dit pas : ce qu'un playbook contient.
    <section className="sec-pb-browser" aria-label="Playbooks opérationnels">
      <p className="sec-pb-note">
        <LifeBuoy size={14} aria-hidden /> Chaque cas donne symptômes, premières vérifications,
        actions immédiates, ordre recommandé, qui prévenir, preuves à conserver, pièges,
        mitigation, correction, validation, livraison, surveillance, documentation,
        prévention et critères de sortie.
      </p>

      <div className="sec-pb-search">
        <Search size={14} aria-hidden />
        <input
          type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Filtrer les cas (secret, déploiement, kubernetes, rollback…)"
          aria-label="Filtrer les playbooks"
        />
        <span className="muted">{filtered.length} / {playbooks.length}</span>
      </div>

      <ul className="sec-pb-list">
        {filtered.map((p) => {
          const id = String(p.id);
          const isOpen = open === id;
          const title = String(p.situation ?? p.title ?? id);
          return (
            <li key={id} id={`playbook-${id}`} className="sec-pb-item">
              <button
                type="button" className="sec-pb-toggle" aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : id)}
              >
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="sec-pb-title">{title}</span>
                {p.domain ? <span className="sec-pb-domain">{String(p.domain)}</span> : null}
              </button>
              {isOpen && <PlaybookView playbook={p} />}
            </li>
          );
        })}
        {filtered.length === 0 && <li className="muted">Aucun cas ne correspond à « {q} ».</li>}
      </ul>
    </section>
  );
}
