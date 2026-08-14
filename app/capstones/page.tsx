import Link from 'next/link';
import { Eye, Layers } from 'lucide-react';
import { listCapstones } from '@/lib/capstones-server';
import { getProgram } from '@/lib/program';

export const dynamic = 'force-dynamic';

// Capstones = simulations professionnelles multi-phases. Correction locale et
// DÉTERMINISTE ; les infrastructures décrites sont SIMULÉES. Réussir un capstone
// est un INDICE de raisonnement, pas une preuve de maîtrise. Aucune écriture
// automatique dans la progression.
export default function CapstonesPage() {
  const capstones = listCapstones();
  const program = getProgram();
  const skillName = new Map((program.skills ?? []).map((s: { id: string; name: string }) => [s.id, s.name]));

  const byDomain = new Map<string, typeof capstones>();
  for (const c of capstones) {
    const d = c.domain || 'Autres';
    if (!byDomain.has(d)) byDomain.set(d, []);
    byDomain.get(d)!.push(c);
  }
  const domains = [...byDomain.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <>
      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow">Apprendre <span className="sep">/</span> simulation professionnelle</p>
          <h1 className="page-title">Capstones</h1>
          <p className="page-sub">
            Des situations d'ingénieur réalistes : tu reçois un signal, tu explores des artefacts (signal
            et bruit), tu formules des hypothèses, tu diagnostiques par les preuves, tu décides et tu
            valides.
            <span className="synth-ro"><Eye size={13} strokeWidth={2} /> Correction locale et déterministe ·
            infrastructures SIMULÉES · un score est un indice de raisonnement, pas une maîtrise.</span>
          </p>
        </div>
      </div>

      {capstones.length === 0 ? (
        <div className="empty"><Layers size={16} strokeWidth={2} /> Aucun capstone disponible.</div>
      ) : (
        domains.map(([domain, list]) => (
          <section key={domain} style={{ marginBottom: 'var(--sp-6)' }}>
            <div className="section-head">
              <span className="section-label">Domaine</span>
              <h2 className="section-title">{domain}</h2>
              <span className="section-note">{list.length} capstone(s)</span>
            </div>
            <div className="cap-grid">
              {list.map((c) => (
                <Link key={c.id} href={`/capstones/${c.id}`} className="cap-card">
                  <h3 className="cap-card-title">{c.title}</h3>
                  <p className="cap-card-meta">
                    {'Difficulté '}{'★'.repeat(c.difficulty ?? 1)}{'☆'.repeat(Math.max(0, 5 - (c.difficulty ?? 1)))}
                    {c.estimatedMinutes ? ` · ~${c.estimatedMinutes} min` : ''}
                    {` · ${c.phases.length} phases`}
                  </p>
                  <p className="cap-card-skills">{c.skills.map((s) => skillName.get(s) ?? s).join(' · ')}</p>
                  <span className="cap-card-cta">Ouvrir la simulation →</span>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
